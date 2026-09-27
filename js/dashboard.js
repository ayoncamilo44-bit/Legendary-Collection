import { supabase } from './supabase.js';

// Restrict access to logged-in users only
window.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Redirect unauthenticated visitors back to main page
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    loadPersonalTTMLogs(session.user.id);
});

/**
 * Fetch and render personal TTM requests for the logged-in user
 */
async function loadPersonalTTMLogs(userId) {
    const container = document.getElementById('personal-ttm-list');
    if (!container) return;

    const { data: logs, error } = await supabase
        .from('ttm_logs')
        .select(`
            id,
            sent_date,
            returned_date,
            status,
            notes,
            signers ( name )
        `)
        .eq('user_id', userId)
        .order('sent_date', { ascending: false });

    if (error) {
        console.error('Error fetching personal logs:', error.message);
        return;
    }

    if (!logs || logs.length === 0) {
        container.innerHTML = `<p class="text-gray-400 text-sm">No TTM requests logged yet.</p>`;
        return;
    }

    container.innerHTML = logs.map(log => `
        <div class="bg-gray-900 border border-gray-800 p-4 rounded-xl mb-3 flex justify-between items-center text-sm">
            <div>
                <h4 class="font-bold text-white">${log.signers?.name || 'Unknown Signer'}</h4>
                <p class="text-xs text-gray-400">Sent: ${log.sent_date} ${log.returned_date ? `| Returned: ${log.returned_date}` : ''}</p>
                ${log.notes ? `<p class="text-xs text-gray-500 mt-1 italic">${log.notes}</p>` : ''}
            </div>
            <span class="text-xs px-2.5 py-1 rounded-md font-semibold bg-gray-800 text-amber-400 border border-gray-700">
                ${log.status}
            </span>
        </div>
    `).join('');
}
