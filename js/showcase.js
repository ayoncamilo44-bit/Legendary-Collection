import { supabase } from './supabase.js';

const PAGE_SIZE = 10;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_STORY_CHARS = 10000;
const CLAMP_AT = 900;
const PHOTO_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const BUCKET = 'community-posts';

const TAGS = {
    mail: 'Through the mail',
    'in-person': 'In person',
    bought: 'Bought and authenticated',
    collection: 'My collection',
    vent: 'Just sharing'
};

const FONT_KEYS = ['classic', 'typewriter', 'handwritten', 'modern', 'elegant'];

const feed = document.getElementById('storyFeed');
const loadMoreBtn = document.getElementById('loadMoreStories');
const form = document.getElementById('showcaseForm');
const titleInput = document.getElementById('storyTitle');
const textInput = document.getElementById('storyText');
const photoInput = document.getElementById('storyPhoto');
const photoPreview = document.getElementById('storyPhotoPreview');
const statusEl = document.getElementById('storyStatus');
const countEl = document.getElementById('storyCount');
const fontOptions = document.getElementById('fontOptions');
const promptList = document.getElementById('promptList');
const toolbox = document.getElementById('toolbox');

let nextPage = 0;
let loading = false;
let currentFont = 'modern';

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function safeImageUrl(value) {
    if (!value) return null;
    try {
        const url = new URL(value);
        return url.protocol === 'https:' ? url.href : null;
    } catch (e) {
        return null;
    }
}

function refreshIcons() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function setStatus(message, kind) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('hidden', 'text-danger', 'text-success', 'text-gray-400');
    statusEl.classList.add(kind === 'error' ? 'text-danger' : kind === 'success' ? 'text-success' : 'text-gray-400');
}

function clearStatus() {
    if (!statusEl) return;
    statusEl.textContent = '';
    statusEl.classList.add('hidden');
}

function authorNameFor(user) {
    const meta = user.user_metadata || {};
    const name = meta.full_name || meta.name || (user.email ? user.email.split('@')[0] : '') || 'Collector';
    return name.slice(0, 120);
}

function validatePhoto(file) {
    if (!file) return null;
    if (!PHOTO_TYPES[file.type]) return 'Photo must be a JPG, PNG, or WebP image.';
    if (file.size > MAX_PHOTO_BYTES) return 'Photo must be 5 MB or smaller.';
    return null;
}

function resetPhotoPreview() {
    if (!photoPreview) return;
    if (photoPreview.dataset.objectUrl) URL.revokeObjectURL(photoPreview.dataset.objectUrl);
    photoPreview.removeAttribute('src');
    delete photoPreview.dataset.objectUrl;
    photoPreview.classList.add('hidden');
}

function applyFont(key) {
    if (FONT_KEYS.indexOf(key) === -1) return;
    currentFont = key;
    FONT_KEYS.forEach(k => {
        if (textInput) textInput.classList.toggle('face-' + k, k === key);
        if (titleInput) titleInput.classList.toggle('face-' + k, k === key);
    });
    if (fontOptions) {
        fontOptions.querySelectorAll('button[data-font]').forEach(btn => {
            const active = btn.dataset.font === key;
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
            btn.classList.toggle('border-accent', active);
            btn.classList.toggle('bg-accent/10', active);
            btn.classList.toggle('border-darkBorder', !active);
        });
    }
}

function updateCount() {
    if (!countEl || !textInput) return;
    const text = textInput.value.trim();
    const words = text === '' ? 0 : text.split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    const readTime = words === 0 ? '' : ' \u00b7 about ' + minutes + ' min read';
    countEl.textContent = words + ' words' + readTime + ' \u00b7 ' + textInput.value.length + ' / ' + MAX_STORY_CHARS;
}

function renderStory(story) {
    const fontKey = FONT_KEYS.indexOf(story.font) === -1 ? 'modern' : story.font;
    const tagLabel = TAGS[story.tag] || TAGS.vent;
    const imageUrl = safeImageUrl(story.image_url);
    const date = story.created_at
        ? new Date(story.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        : '';
    const long = String(story.story || '').length > CLAMP_AT;

    const article = document.createElement('article');
    article.className = 'glass-card rounded-3xl p-8 md:p-10' + (story.featured ? ' ring-1 ring-accent/50' : '');
    article.innerHTML = `
        ${story.featured ? '<p class="text-xs font-semibold tracking-widest uppercase text-accentHover mb-4">Featured story</p>' : ''}
        <div class="flex flex-wrap items-center gap-3 mb-4">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accentHover">${escapeHtml(tagLabel)}</span>
            <span class="text-sm text-gray-500">${escapeHtml(story.author_name)}${date ? ' &middot; ' + escapeHtml(date) : ''}</span>
        </div>
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-6 face-${fontKey}">${escapeHtml(story.title)}</h2>
        <div class="story-body text-lg leading-9 text-gray-300 whitespace-pre-line face-${fontKey}${long ? ' story-clamp' : ''}">${escapeHtml(story.story)}</div>
        ${long ? '<button type="button" data-readmore class="mt-4 text-sm font-semibold text-accentHover hover:text-white smooth-transition">Read more</button>' : ''}
        ${imageUrl ? `
            <a href="${escapeHtml(imageUrl)}" target="_blank" rel="noopener noreferrer" class="block mt-8">
                <img src="${escapeHtml(imageUrl)}" alt="Photo shared with the story ${escapeHtml(story.title)}" loading="lazy" class="rounded-2xl max-h-[28rem] w-auto max-w-full border border-darkBorder">
            </a>` : ''}
    `;
    return article;
}

async function loadStories(options) {
    const reset = !!(options && options.reset);
    if (loading || !feed) return;
    loading = true;
    if (reset) nextPage = 0;

    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
        .from('showcase_stories')
        .select('id, author_name, title, tag, story, image_url, font, featured, created_at')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

    loading = false;

    if (error) {
        console.error('Could not load showcase stories', error);
        if (reset || nextPage === 0) {
            feed.innerHTML = '<div class="glass-card rounded-3xl p-10 text-center text-gray-400">Stories could not be loaded right now. Please try again later.</div>';
        }
        refreshIcons();
        return;
    }

    if (reset || nextPage === 0) feed.innerHTML = '';

    if (nextPage === 0 && data.length === 0) {
        feed.innerHTML = '<div class="glass-card rounded-3xl p-10 text-center text-gray-400">No stories yet. Yours could be the first.</div>';
        if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
        refreshIcons();
        return;
    }

    data.forEach(story => feed.appendChild(renderStory(story)));
    nextPage += 1;
    if (loadMoreBtn) loadMoreBtn.classList.toggle('hidden', data.length < PAGE_SIZE);
    refreshIcons();
}

if (feed) {
    feed.addEventListener('click', event => {
        const btn = event.target.closest('button[data-readmore]');
        if (!btn) return;
        const body = btn.parentElement.querySelector('.story-body');
        if (!body) return;
        const collapsed = body.classList.toggle('story-clamp');
        btn.textContent = collapsed ? 'Read more' : 'Show less';
    });
}

if (fontOptions) {
    fontOptions.addEventListener('click', event => {
        const btn = event.target.closest('button[data-font]');
        if (btn) applyFont(btn.dataset.font);
    });
}

if (promptList && textInput) {
    promptList.addEventListener('click', event => {
        const btn = event.target.closest('button[data-prompt]');
        if (!btn) return;
        const starter = btn.dataset.prompt + ' ';
        textInput.value = textInput.value.trim() === '' ? starter : textInput.value + '\n\n' + starter;
        textInput.focus();
        updateCount();
    });
}

if (textInput) textInput.addEventListener('input', updateCount);

if (photoInput) {
    photoInput.addEventListener('change', () => {
        const file = photoInput.files && photoInput.files[0];
        resetPhotoPreview();
        if (!file) { clearStatus(); return; }
        const problem = validatePhoto(file);
        if (problem) {
            setStatus(problem, 'error');
            photoInput.value = '';
            return;
        }
        clearStatus();
        if (photoPreview) {
            const objectUrl = URL.createObjectURL(file);
            photoPreview.src = objectUrl;
            photoPreview.dataset.objectUrl = objectUrl;
            photoPreview.classList.remove('hidden');
        }
    });
}

if (form) {
    form.addEventListener('submit', async event => {
        event.preventDefault();
        clearStatus();

        const submitBtn = form.querySelector('button[type="submit"]');
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData && sessionData.session ? sessionData.session.user : null;

        if (!user) {
            setStatus('Please sign in with Google before sharing a story.', 'error');
            if (typeof window.loginWithGoogle === 'function') window.loginWithGoogle();
            return;
        }

        const file = photoInput && photoInput.files ? photoInput.files[0] || null : null;
        const photoProblem = validatePhoto(file);
        if (photoProblem) { setStatus(photoProblem, 'error'); return; }

        const title = titleInput.value.trim();
        const story = textInput.value.trim();
        const tag = form.elements.tag.value;

        if (!title || !story) {
            setStatus('Please add a title and your story.', 'error');
            return;
        }

        if (submitBtn) submitBtn.disabled = true;
        setStatus(file ? 'Uploading photo and sharing...' : 'Sharing...', 'info');

        let uploadedPath = null;
        try {
            let imageUrl = null;

            if (file) {
                uploadedPath = user.id + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + PHOTO_TYPES[file.type];
                const { error: uploadError } = await supabase.storage
                    .from(BUCKET)
                    .upload(uploadedPath, file, { contentType: file.type, cacheControl: '31536000', upsert: false });
                if (uploadError) throw uploadError;
                imageUrl = supabase.storage.from(BUCKET).getPublicUrl(uploadedPath).data.publicUrl;
            }

            const { error: insertError } = await supabase.from('showcase_stories').insert({
                user_id: user.id,
                author_name: authorNameFor(user),
                title: title.slice(0, 150),
                tag: tag,
                story: story.slice(0, MAX_STORY_CHARS),
                image_url: imageUrl,
                font: currentFont
            });

            if (insertError) throw insertError;

            setStatus('Shared! Thank you for telling your story.', 'success');
            form.reset();
            applyFont('modern');
            updateCount();
            resetPhotoPreview();
            await loadStories({ reset: true });
        } catch (error) {
            console.error('Could not share story', error);
            if (uploadedPath) {
                try { await supabase.storage.from(BUCKET).remove([uploadedPath]); } catch (e) {}
            }
            const detail = error && error.message ? ' (' + error.message + ')' : '';
            setStatus('Could not share your story. Check your connection and that you are signed in, then try again.' + detail, 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => loadStories());

if (toolbox && window.matchMedia('(min-width: 1024px)').matches) toolbox.open = true;

applyFont('modern');
updateCount();
loadStories({ reset: true });
