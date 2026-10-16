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
const editModal = document.getElementById('postEditModal');
const editForm = document.getElementById('postEditForm');
const editText = document.getElementById('postEditText');
const editCount = document.getElementById('postEditCount');
const editStatus = document.getElementById('postEditStatus');
const editSave = document.getElementById('postEditSave');
const editCancel = document.getElementById('postEditCancel');

let nextPage = 0;
let loading = false;
let currentUserId = null;
let editingPostId = null;
let postEditReturnFocus = null;

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

function updateDaysVisibility() {
    if (!resultSelect || !daysWrap) return;
    const isStory = resultSelect.value === 'story';
    daysWrap.classList.toggle('hidden', isStory);
    if (isStory && form && form.elements.days_to_response) {
        form.elements.days_to_response.value = '';
    }
}

function renderPost(post) {
    const result = RESULT_LABELS[post.result] || RESULT_LABELS['no-response'];
    const imageUrl = safeImageUrl(post.image_url);
    const date = post.created_at
        ? new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : '';
    const days = Number.isInteger(post.days_to_response)
        ? post.days_to_response + (post.days_to_response === 1 ? ' day' : ' days')
        : '';

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
        ${currentUserId && post.user_id === currentUserId ? `<div class="flex gap-3 mt-4"><button type="button" data-post-edit="${escapeHtml(post.id)}" class="text-sm text-accentHover underline">Edit post</button><button type="button" data-post-delete="${escapeHtml(post.id)}" class="text-sm text-gray-400 underline">Delete post</button></div>` : ''}
    `;
    return article;
}

async function loadPosts(options) {
    const reset = !!(options && options.reset);
    if (loading || !feed) return;
    loading = true;
    if (reset) nextPage = 0;

    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
        .from('community_posts')
        .select('id, user_id, author_name, player_name, result, days_to_response, experience, image_url, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(from, to);

    loading = false;

    if (error) {
        console.error('Could not load community posts', error);
        if (reset || nextPage === 0) {
            feed.innerHTML = '<div class="glass-card rounded-2xl p-6 text-center text-gray-400">Community posts could not be loaded right now. Please try again later.</div>';
        }
        refreshIcons();
        return;
    }

    if (reset || nextPage === 0) feed.innerHTML = '';

    if (nextPage === 0 && data.length === 0) {
        feed.innerHTML = '<div class="glass-card rounded-2xl p-6 text-center text-gray-400">No posts yet. Be the first to share a story!</div>';
        if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
        refreshIcons();
        return;
    }

    data.forEach(post => feed.appendChild(renderPost(post)));
    nextPage += 1;
    if (loadMoreBtn) loadMoreBtn.classList.toggle('hidden', data.length < PAGE_SIZE);
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
    if (modal) modal.classList.remove('hidden');
    refreshIcons();
};

window.closeShareModal = function closeShareModal() {
    if (modal) modal.classList.add('hidden');
};

if (resultSelect) resultSelect.addEventListener('change', updateDaysVisibility);

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
            setStatus('Please sign in with Google before sharing a post.', 'error');
            if (typeof window.loginWithGoogle === 'function') window.loginWithGoogle();
            return;
        }

        const file = photoInput && photoInput.files ? photoInput.files[0] || null : null;
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

            const { error: insertError } = await supabase.from('community_posts').insert({
                user_id: user.id,
                author_name: authorNameFor(user),
                player_name: playerName.slice(0, 120),
                result: resultValue,
                days_to_response: (resultValue === 'story' || daysRaw === '') ? null : Number(daysRaw),
                experience: experience.slice(0, 2000),
                image_url: imageUrl,
                status: 'approved'
            });

            if (insertError) throw insertError;

            setStatus('Your post is live in the community feed.', 'success');
            form.reset();
            updateDaysVisibility();
            resetPhotoPreview();
            setTimeout(() => { window.closeShareModal(); clearStatus(); }, 900);
        } catch (error) {
            console.error('Could not share post', error);
            if (uploadedPath) {
                try { await supabase.storage.from(BUCKET).remove([uploadedPath]); } catch (e) {}
            }
            const detail = error && error.message ? ' (' + error.message + ')' : '';
            setStatus('Could not share your post. Check your connection and that you are signed in, then try again.' + detail, 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

if (modal) {
    modal.addEventListener('click', event => {
        if (event.target === modal) window.closeShareModal();
    });
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) window.closeShareModal();
    if (event.key === 'Escape' && editModal && !editModal.classList.contains('hidden')) closePostEditor();
});

if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => loadPosts());

if (feed) feed.addEventListener('click', async event => {
    const edit = event.target.closest('[data-post-edit]');
    const remove = event.target.closest('[data-post-delete]');
    const id = (edit || remove)?.dataset.postEdit || (edit || remove)?.dataset.postDelete;
    if (!id) return;
    if (edit) {
        const post = await supabase.from('community_posts').select('experience').eq('id', id).single();
        if (post.error) { setStatus('Could not load your post to edit.', 'error'); return; }
        editingPostId = id;
        postEditReturnFocus = edit;
        editText.value = post.data.experience || '';
        editCount.textContent = `${editText.value.length.toLocaleString()} / 2,000 characters`;
        editStatus.textContent = '';
        editStatus.classList.add('hidden');
        editModal.classList.remove('hidden');
        editModal.classList.add('flex');
        editText.focus();
    } else if (window.confirm('Delete your post? This cannot be undone.')) {
        const { error } = await supabase.from('community_posts').delete().eq('id', id);
        if (error) { setStatus('Could not delete your post.', 'error'); return; }
        await loadPosts({ reset: true });
    }
});

function closePostEditor(restoreFocus = true) {
    if (!editModal) return;
    editModal.classList.add('hidden');
    editModal.classList.remove('flex');
    editingPostId = null;
    if (restoreFocus && postEditReturnFocus?.isConnected) postEditReturnFocus.focus();
}

if (editText && editCount) {
    editText.addEventListener('input', () => {
        editCount.textContent = `${editText.value.length.toLocaleString()} / 2,000 characters`;
    });
}

if (editForm) {
    editForm.addEventListener('submit', async event => {
        event.preventDefault();
        const experience = editText.value.trim();
        if (!experience || !editingPostId) return;

        editSave.disabled = true;
        editCancel.disabled = true;
        editStatus.textContent = 'Saving your changes…';
        editStatus.classList.remove('hidden', 'text-danger');
        editStatus.classList.add('text-gray-400');
        const { error } = await supabase.from('community_posts')
            .update({ experience: experience.slice(0, 2000) })
            .eq('id', editingPostId);
        editSave.disabled = false;
        editCancel.disabled = false;
        if (error) {
            editStatus.textContent = 'Could not save your changes. Please try again.';
            editStatus.classList.remove('text-gray-400');
            editStatus.classList.add('text-danger');
            return;
        }

        closePostEditor(false);
        await loadPosts({ reset: true });
        feed?.focus();
    });
    editCancel.addEventListener('click', () => closePostEditor());
}

if (editModal) {
    editModal.addEventListener('click', event => {
        if (event.target === editModal) closePostEditor();
    });
    editModal.addEventListener('keydown', event => {
        if (event.key !== 'Tab') return;
        const controls = editModal.querySelectorAll('textarea:not(:disabled), button:not(:disabled)');
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });
}

supabase.auth.getSession().then(({ data }) => {
    currentUserId = data?.session?.user?.id || null;
    loadPosts({ reset: true });
});
