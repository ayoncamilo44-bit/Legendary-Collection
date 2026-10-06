import { supabase } from './supabase.js';

const PAGE_SIZE = 20;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
let nextOffset = 0;
let hasMorePosts = true;

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('feedContainer').replaceChildren();
    setupModal();
    setupImagePreview();
    setupPostForm();
    loadPosts();
});

window.openShareModal = function() {
    const modal = document.getElementById('shareModal');
    modal?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    document.getElementById('postPlayerName')?.focus();
};

window.closeShareModal = function() {
    const modal = document.getElementById('shareModal');
    modal?.classList.add('hidden');
    document.body.style.overflow = '';
    clearSelectedImagePreview();
};

function setupModal() {
    document.getElementById('shareModal')?.addEventListener('click', event => {
        if (event.target.id === 'shareModal') window.closeShareModal();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') window.closeShareModal();
    });
    document.getElementById('loadMorePosts')?.addEventListener('click', () => loadPosts());
}

function setupImagePreview() {
    const input = document.getElementById('postImageInput');
    const preview = document.getElementById('postImagePreview');
    if (!input || !preview) return;

    input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file) {
            clearSelectedImagePreview();
            return;
        }

        if (!file.type.startsWith('image/')) {
            preview.innerHTML = '<p class="text-sm text-red-300">Please choose an image file.</p>';
            preview.classList.remove('hidden');
            input.value = '';
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            preview.innerHTML = '<p class="text-sm text-red-300">Image must be smaller than 5MB.</p>';
            preview.classList.remove('hidden');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = event => {
            preview.innerHTML = `
                <img src="${event.target.result}" alt="Selected upload preview" class="max-h-48 w-full rounded-xl object-cover border border-darkBorder" />
            `;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    });
}

function clearSelectedImagePreview() {
    const input = document.getElementById('postImageInput');
    const preview = document.getElementById('postImagePreview');
    if (input) input.value = '';
    if (preview) {
        preview.innerHTML = '';
        preview.classList.add('hidden');
    }
}

async function loadPosts() {
    const feed = document.getElementById('feedContainer');
    const loadMore = document.getElementById('loadMorePosts');
    if (!feed || !hasMorePosts) return;
    loadMore.disabled = true;
    loadMore.textContent = 'Loading...';

    try {
        const { data: posts, error } = await supabase
            .from('community_posts')
            .select('id, user_id, author_name, player_name, result, days_to_response, experience, image_url, created_at')
            .order('created_at', { ascending: false })
            .range(nextOffset, nextOffset + PAGE_SIZE - 1);
        if (error) throw error;

        if (nextOffset === 0 && posts.length === 0) {
            feed.innerHTML = '<div class="glass-card rounded-2xl p-8 text-center text-gray-400">No community posts yet. Share your first collecting update.</div>';
        } else {
            feed.insertAdjacentHTML('beforeend', posts.map(renderPost).join(''));
        }
        nextOffset += posts.length;
        hasMorePosts = posts.length === PAGE_SIZE;
        loadMore.classList.toggle('hidden', !hasMorePosts);
    } catch (error) {
        console.error('Unable to load community posts:', error);
        const message = error.code === 'PGRST205'
            ? 'The community-post table is not set up yet. Run supabase-setup.sql in the Supabase SQL Editor, then refresh.'
            : `Could not load community posts: ${error.message || 'Database request failed.'}`;
        feed.innerHTML = `<div class="glass-card rounded-2xl p-6 text-red-300">${escapeHtml(message)}</div>`;
        loadMore.classList.add('hidden');
    } finally {
        loadMore.disabled = false;
        loadMore.textContent = 'Load More Posts';
    }
}

function renderPost(post) {
    const resultLabels = {
        success: 'Success!',
        pending: 'Still Waiting',
        'no-response': 'No Response',
        returned: 'Returned Unsigned'
    };
    const resultStyles = post.result === 'success'
        ? 'bg-success/20 text-success'
        : post.result === 'pending'
            ? 'bg-accent/20 text-accent'
            : 'bg-warning/20 text-warning';
    const response = post.days_to_response == null ? '' : `<span class="text-gray-400">${escapeHtml(post.days_to_response)} days</span>`;
    const imageMarkup = post.image_url
        ? `<img src="${escapeHtml(post.image_url)}" alt="${escapeHtml(post.player_name)} proof photo" class="mt-4 max-h-80 w-full rounded-xl border border-darkBorder object-cover" loading="lazy" />`
        : '';

    return `
        <article class="glass-card rounded-2xl p-6">
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full gradient-bg flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <i data-lucide="user" class="w-6 h-6 text-white"></i>
                </div>
                <div class="min-w-0 flex-1">
                    <div class="mb-2 flex flex-wrap items-center gap-3">
                        <span class="font-semibold text-white">${escapeHtml(post.author_name)}</span>
                        <time class="text-sm text-gray-400" datetime="${escapeHtml(post.created_at)}">${escapeHtml(formatDate(post.created_at))}</time>
                        <span class="rounded-full px-2 py-1 text-xs ${resultStyles}">${escapeHtml(resultLabels[post.result] || 'Update')}</span>
                        ${response}
                    </div>
                    <h2 class="mb-2 font-semibold text-accent">${escapeHtml(post.player_name)}</h2>
                    <p class="whitespace-pre-wrap break-words text-gray-300">${escapeHtml(post.experience)}</p>
                    ${imageMarkup}
                </div>
            </div>
        </article>
    `;
}

async function uploadCommunityImage(file, userId) {
    if (!file) return null;

    if (!file.type.startsWith('image/')) {
        throw new Error('Please choose an image file for your community post.');
    }

    if (file.size > MAX_IMAGE_SIZE) {
        throw new Error('Image must be smaller than 5MB.');
    }

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = `${userId}/${safeName}`;

    const { error } = await supabase.storage
        .from('community-posts')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
        });

    if (error) throw error;

    const { data } = supabase.storage.from('community-posts').getPublicUrl(filePath);
    return data.publicUrl;
}

function setupPostForm() {
    const form = document.getElementById('communityPostForm');
    if (!form) return;
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        const status = document.getElementById('communityFormStatus');
        button.disabled = true;
        button.textContent = 'Posting...';
        showFormStatus(status, 'Publishing your post...', false);

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            if (!session) {
                showFormStatus(status, 'Sign in with Google before posting to the community.', true);
                return;
            }

            const user = session.user;
            const authorName = user.user_metadata?.full_name
                || user.user_metadata?.name
                || user.email?.split('@')[0]
                || 'Collector';
            const daysValue = document.getElementById('postDays').value;
            const selectedFile = document.getElementById('postImageInput')?.files?.[0];
            const imageUrl = selectedFile ? await uploadCommunityImage(selectedFile, user.id) : null;

            const post = {
                user_id: user.id,
                author_name: authorName,
                player_name: document.getElementById('postPlayerName').value.trim(),
                result: document.getElementById('postResult').value,
                days_to_response: daysValue === '' ? null : Number(daysValue),
                experience: document.getElementById('postExperience').value.trim(),
                image_url: imageUrl
            };

            const { error } = await supabase.from('community_posts').insert(post);
            if (error) throw error;

            form.reset();
            clearSelectedImagePreview();
            showFormStatus(status, 'Your post was shared.', false);
            nextOffset = 0;
            hasMorePosts = true;
            document.getElementById('feedContainer').replaceChildren();
            await loadPosts();
            window.setTimeout(window.closeShareModal, 700);
        } catch (error) {
            console.error('Unable to publish community post:', error);
            const message = error.code === '42501' || /row-level security/i.test(error.message || '')
                ? 'Run supabase-setup.sql in the Supabase SQL Editor, then sign in again.'
                : error.code === 'PGRST205'
                    ? 'The community-post table is not set up yet. Run supabase-setup.sql in the Supabase SQL Editor.'
                    : error.message || 'Database request failed.';
            showFormStatus(status, `Could not share your post: ${message}`, true);
        } finally {
            button.disabled = false;
            button.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i>Share with Community';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    });
}

function showFormStatus(element, message, isError) {
    element.textContent = message;
    element.className = `text-sm ${isError ? 'text-red-300' : 'text-gray-300'}`;
    element.classList.remove('hidden');
}

function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Recently' : new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}
