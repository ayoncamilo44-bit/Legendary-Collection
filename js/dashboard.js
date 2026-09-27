import { supabase } from './supabase.js';

window.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    loadPersonalTTMLogs(session.user.id);
});

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
        container.innerHTML = `<p class="text-red-400 text-xs">Error loading collection logs: ${error.message}</p>`;
        return;
    }

    if (!logs || logs.length === 0) {
        container.innerHTML = `<p class="text-gray-400 text-xs py-6 text-center">No TTM requests logged yet.</p>`;
        return;
    }

    container.innerHTML = logs.map(log => `
        <div class="bg-darkBg border border-darkBorder p-4 rounded-xl flex justify-between items-center text-xs">
            <div>
                <h4 class="font-bold text-white text-sm">${log.signers?.name || 'Unknown Signer'}</h4>
                <p class="text-gray-400 mt-0.5">Sent: ${log.sent_date} ${log.returned_date ? `| Returned: ${log.returned_date}` : ''}</p>
                ${log.notes ? `<p class="text-gray-500 mt-1 italic">${log.notes}</p>` : ''}
            </div>
            <span class="px-2.5 py-1 rounded-md font-semibold bg-darkCard text-amber-400 border border-darkBorder">
                ${log.status}
            </span>
        </div>
    `).join('');
}
