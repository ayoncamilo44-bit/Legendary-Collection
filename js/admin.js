import { supabase } from './supabase.js';
import { isSiteAdmin } from './access.js';

const status = document.getElementById('adminStatus');
const queues = document.getElementById('adminQueues');

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function dateLabel(value) {
    return value ? new Date(value).toLocaleString() : '';
}

function card(content, row, table) {
    return '<article class="rounded-xl border border-darkBorder bg-darkBg/60 p-5">' +
        '<div>' + content + '</div>' +
        '<p class="text-xs text-gray-500 mt-3">Submitted ' + escapeHtml(dateLabel(row.created_at)) + ' by ' + escapeHtml(row.author_name || 'collector') + '</p>' +
        '<div class="flex flex-wrap gap-3 mt-4">' +
        '<button class="review-action px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold" data-table="' + table + '" data-id="' + escapeHtml(row.id) + '" data-action="approve">Approve</button>' +
        '<button class="review-action px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold" data-table="' + table + '" data-id="' + escapeHtml(row.id) + '" data-action="reject">Reject</button>' +
        '</div></article>';
}

function renderSigner(row) {
    return card('<h3 class="text-lg font-semibold text-white">' + escapeHtml(row.name) + '</h3>' +
        '<p class="text-gray-300">' + escapeHtml(row.sport) + (row.team ? ' · ' + escapeHtml(row.team) : '') + '</p>' +
        '<p class="text-sm text-gray-400 mt-2">' + escapeHtml(row.tested_address || 'No address supplied') + '</p>', row, 'signer_submissions');
}

function safePhoto(value, label) {
    if (!value || !/^https:\/\//i.test(value)) return '';
    return '<a href="' + escapeHtml(value) + '" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block text-sm text-accentHover underline">View submitted photo: ' + label + '</a>';
}

function renderPost(row) {
    return card('<h3 class="text-lg font-semibold text-white">' + escapeHtml(row.player_name) + ' · ' + escapeHtml(row.result) + '</h3>' +
        '<p class="text-sm text-gray-300 mt-2 whitespace-pre-line">' + escapeHtml(row.experience) + '</p>' +
        safePhoto(row.image_url, 'Submitted community post photo'), row, 'community_posts');
}

function renderStory(row) {
    return card('<p class="text-xs uppercase tracking-wide text-accentHover">' + escapeHtml(row.tag) + '</p>' +
        '<h3 class="text-lg font-semibold text-white mt-1">' + escapeHtml(row.title) + '</h3>' +
        '<p class="text-sm text-gray-300 mt-2 whitespace-pre-line">' + escapeHtml(row.story) + '</p>' +
        safePhoto(row.image_url, 'Submitted story photo'), row, 'showcase_stories');
}

async function loadQueue(table, columns, targetId, countId, renderer) {
    const target = document.getElementById(targetId);
    const count = document.getElementById(countId);
    const { data, error } = await supabase.from(table).select(columns).eq('status', 'pending').order('created_at', { ascending: true });
    if (error) throw error;
    count.textContent = '(' + data.length + ')';
    target.innerHTML = data.length ? data.map(row => renderer(row)).join('') : '<p class="text-gray-400 text-sm">Nothing waiting for review.</p>';
}

async function loadQueues() {
    await loadQueue('signer_submissions', 'id, user_id, name, sport, team, success_rate, avg_response, tested_address, created_at', 'signerQueue', 'signerCount', renderSigner);
}

document.addEventListener('click', async event => {
    const button = event.target.closest('.review-action');
    if (!button) return;
    button.disabled = true;
    status.textContent = 'Saving your review…';
    try {
        const approve = button.dataset.action === 'approve';
        let error;
        if (button.dataset.table === 'signer_submissions') {
            ({ error } = await supabase.rpc('review_signer_submission', {
                p_submission_id: button.dataset.id,
                p_approve: approve
            }));
        }
        if (error) throw error;
        status.textContent = approve ? 'Approved.' : 'Rejected.';
        await loadQueues();
    } catch (error) {
        console.error('Could not review submission:', error);
        status.textContent = 'Could not save the review: ' + (error.message || 'Database error');
        button.disabled = false;
    }
});

document.getElementById('signOutButton').addEventListener('click', () => window.logout());

window.addEventListener('DOMContentLoaded', async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
        status.textContent = 'Sign in with the site owner account to continue.';
        const signIn = document.createElement('button');
        signIn.className = 'mt-4 px-4 py-2 rounded-lg bg-accent text-white font-semibold';
        signIn.textContent = 'Sign in with Google';
        signIn.addEventListener('click', () => window.loginWithGoogle());
        status.append(signIn);
        return;
    }
    if (!await isSiteAdmin()) {
        status.textContent = 'This page is restricted to the site owner.';
        return;
    }
    status.textContent = 'Owner access confirmed.';
    queues.classList.remove('hidden');
    try {
        await loadQueues();
    } catch (error) {
        console.error('Could not load the moderation queue:', error);
        status.textContent = 'Could not load submissions: ' + (error.message || 'Database error');
    }
});
