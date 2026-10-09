import { supabase } from './supabase.js';
 
const PAGE_SIZE = 10;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const BUCKET = 'community-posts';
 
const RESULT_LABELS = {
    success: { text: 'Success', cls: 'bg-success/20 text-success' },
    pending: { text: 'Still waiting', cls: 'bg-warning/20 text-warning' },
    'no-response': { text: 'No response', cls: 'bg-gray-500/20 text-gray-300' },
    returned: { text: 'Returned unsigned', cls: 'bg-danger/20 text-danger' },
    story: { text: 'Collector story', cls: 'bg-accent/20 text-accentHover' }
};
 
const feed = document.getElementById('feedContainer');
const loadMoreBtn = document.getElementById('loadMorePosts');
const modal = document.getElementById('shareModal');
const form = document.getElementById('communityPostForm');
const statusEl = document.getElementById('communityFormStatus');
const photoInput = document.getElementById('postPhoto');
const photoPreview = document.getElementById('postPhotoPreview');
const resultSelect = document.getElementById('postResult');
const daysWrap = document.getElementById('postDaysWrap');
 
let nextPage = 0;
let loading = false;
 
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
    } catch {
        return null;
    }
}
 
function refreshIcons() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
 
function setStatus(message, kind = 'info') {
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
 
// A collector story has no mailing result, so the "Days to Response" box is hidden for it.
function updateDaysVisibility() {
    if (!resultSelect || !daysWrap) return;
    const isStory = resultSelect.value === 'story';
    daysWrap.classList.toggle('hidden', isStory);
    if (isStory && form?.elements.days_to_response) form.elements.days_to_response.value = '';
}
 
function renderPost(post) {
    const result = RESULT_LABELS[post.result] || RESULT_LABELS['no-response'];
    const imageUrl = safeImageUrl(post.image_url);
    const date = post.created_at ? new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    const days = Number.isInteger(post.days_to_response) ? `${post.days_to_response} day${post.days_to_response === 1 ? '' : 's'}` : '';
 
    const article = document.createElement('article');
    article.className = 'glass-card rounded-2xl p-6';
    article.innerHTML = `
        <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
                <h3 class="text-lg font-bold text-white">${escapeHtml(post.player_name)}</h3>
                <p class="text-sm text-gray-400">Shared by ${escapeHtml(post.author_name)}${date ? ' &middot; ' + escapeHtml(date) : ''}</p>
            </div>
            <div class="flex items-center gap-2">
                ${days ? `<span class="text-xs text-gray-400">${escapeHtml(days)}</span>` : ''}
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${result.cls}">${escapeHtml(result.text)}</span>
            </div>
        </div>
        <p class="text-gray-300 whitespace-pre-line">${escapeHtml(post.experience)}</p>
        ${imageUrl ? `
            <a href="${escapeHtml(imageUrl)}" target="_blank" rel="noopener noreferrer" class="block mt-4">
                <img src="${escapeHtml(imageUrl)}" alt="Photo shared with the ${escapeHtml(post.player_name)} post" loading="lazy" class="rounded-xl max-h-96 w-auto max-w-full border border-darkBorder">
            </a>` : ''}
    `;
    return article;
}
 
async function loadPosts({ reset = false } = {}) {
    if (loading || !feed) return;
    loading = true;
    if (reset) nextPage = 0;
 
    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
 
    const { data, error } = await supabase
        .from('community_posts')
        .select('id, author_name, player_name, result, days_to_response, experience, image_url, created_at')
        .order('created_at', { ascending: false })
        .range(from, to);
 
    loading = false;
 
    if (error) {
        console.error('Could not load community posts', error);
        if (reset || nextPage === 0) {
            feed.innerHTML = '<div class="glass-card rounded-2xl p-6 text-center text-gray-400">Community posts could not be loaded right now. Please try again later.</div>';
        }
        return;
    }
 
    if (reset || nextPage === 0) feed.innerHTML = '';
 
    if (nextPage === 0 && data.length === 0) {
        feed.innerHTML = '<div class="glass-card rounded-2xl p-6 text-center text-gray-400">No posts yet. Be the first to share a story!</div>';
        loadMoreBtn?.classList.add('hidden');
        return;
    }
 
    data.forEach(post => feed.appendChild(renderPost(post)));
    nextPage += 1;
    loadMoreBtn?.classList.toggle('hidden', data.length < PAGE_SIZE);
    refreshIcons();
}
 
function validatePhoto(file) {
    if (!file) return null;
    if (!PHOTO_TYPES[file.type]) return 'Photo must be a JPG, PNG, or WebP image.';
    if (file.size > MAX_PHOTO_BYTES) return 'Photo must be 5 MB or smaller.';
    return null;
}
 
function authorNameFor(user) {
    const meta = user.user_metadata || {};
    const name = meta.full_name || meta.name || (user.email ? user.email.split('@')[0] : '') || 'Collector';
    return name.slice(0, 120);
}
 
function resetPhotoPreview() {
    if (photoPreview) {
        if (photoPreview.dataset.objectUrl) URL.revokeObjectURL(photoPreview.dataset.objectUrl);
        photoPreview.removeAttribute('src');
        delete photoPreview.dataset.objectUrl;
        photoPreview.classList.add('hidden');
    }
}
 
window.openShareModal = function openShareModal() {
    clearStatus();
    updateDaysVisibility();
    modal?.classList.remove('hidden');
    refreshIcons();
};
 
window.closeShareModal = function closeShareModal() {
    modal?.classList.add('hidden');
};
 
resultSelect?.addEventListener('change', updateDaysVisibility);
 
photoInput?.addEventListener('change', () => {
    const file = photoInput.files?.[0];
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
 
form?.addEventListener('submit', async event => {
    event.preventDefault();
    clearStatus();
 
    const submitBtn = form.querySelector('button[type="submit"]');
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
 
    if (!user) {
        setStatus('Please sign in with Google before sharing a post.', 'error');
        if (typeof window.loginWithGoogle === 'function') window.loginWithGoogle();
        return;
    }
 
    const file = photoInput?.files?.[0] || null;
    const photoProblem = validatePhoto(file);
    if (photoProblem) { setStatus(photoProblem, 'error'); return; }
 
    const playerName = form.elements.player_name.value.trim();
    const experience = form.elements.experience.value.trim();
    const resultValue = form.elements.result.value;
    const daysRaw = form.elements.days_to_response.value;
 
    if (!playerName || !experience) {
        setStatus('Player name and your experience are required.', 'error');
        return;
    }
 
    if (submitBtn) submitBtn.disabled = true;
    setStatus(file ? 'Uploading photo and sharing...' : 'Sharing...');
 
    let uploadedPath = null;
    try {
        let imageUrl = null;
 
        if (file) {
            uploadedPath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${PHOTO_TYPES[file.type]}`;
            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(uploadedPath, file, { contentType: file.type, cacheControl: '31536000', upsert: false });
            if (uploadError) throw uploadError;
            imageUrl = supabase.storage.from(BUCKET).getPublicUrl(uploadedPath).data.publicUrl;
        }
 
        const { error: insertError } = await supabase.from('community_posts').insert({
            user_id: user.id,
            author_name: authorNameFor(user),
            player_name: playerName.slice(0, 120),
            result: resultValue,
            // Stories have no mailing timeline, so no days are saved for them.
            days_to_response: (resultValue === 'story' || daysRaw === '') ? null : Number(daysRaw),
            experience: experience.slice(0, 2000),
            image_url: imageUrl
        });
 
        if (insertError) throw insertError;
 
        setStatus('Shared! Thanks for contributing.', 'success');
        form.reset();
        updateDaysVisibility();
        resetPhotoPreview();
        await loadPosts({ reset: true });
        setTimeout(() => { window.closeShareModal(); clearStatus(); }, 900);
    } catch (error) {
        console.error('Could not share post', error);
        if (uploadedPath) {
            await supabase.storage.from(BUCKET).remove([uploadedPath]).catch(() => {});
        }
        const detail = error?.message ? ` (${error.message})` : '';
        setStatus(`Could not share your post. Check your connection and that you are signed in, then try again.${detail}`, 'error');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
});
 
modal?.addEventListener('click', event => {
    if (event.target === modal) window.closeShareModal();
});
 
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) window.closeShareModal();
});
 
loadMoreBtn?.addEventListener('click', () => loadPosts());
 
loadPosts({ reset: true });
 









Claude finished the response
