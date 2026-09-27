import { supabase } from './supabase.js';

// DOM Elements
const searchInput = document.getElementById('search-input');
const signerGrid = document.getElementById('signer-grid');
const activityFeed = document.getElementById('activity-feed');

// Load directory data and activity feed on page load
window.addEventListener('DOMContentLoaded', () => {
    fetchSigners();
    fetchRecentActivity();

    // Attach search listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            fetchSigners(e.target.value.trim());
        });
    }
});

/**
 * Fetch signers/players from Supabase directory with search filtering
 */
async function fetchSigners(searchTerm = '') {
    if (!signerGrid) return;

    signerGrid.innerHTML = `
        <div class="col-span-full text-center py-8 text-gray-400">
            Searching directory...
        </div>`;

    let query = supabase
        .from('signers')
        .select('*')
        .order('name', { ascending: true });

    if (searchTerm) {
        // Search across player name and sport/team columns
        query = query.or(`name.ilike.%${searchTerm}%,sport_team.ilike.%${searchTerm}%`);
    }

    const { data: signers, error } = await query;

    if (error) {
        console.error('Error fetching signers:', error.message);
        signerGrid.innerHTML = `
            <div class="col-span-full text-center py-8 text-red-400">
                Failed to load player directory.
            </div>`;
        return;
    }

    renderSigners(signers);
}

/**
 * Render signer cards into the grid
 */
function renderSigners(signers) {
    if (!signers || signers.length === 0) {
        signerGrid.innerHTML = `
            <div class="col-span-full text-center py-8 text-gray-400">
                No signers found matching your search.
            </div>`;
        return;
    }

    signerGrid.innerHTML = signers.map(signer => `
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-amber-500/50 transition-colors">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-bold text-white">${signer.name}</h3>
                <span class="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-md font-semibold">
                    ${signer.success_rate || 0}% Success
                </span>
            </div>
            <p class="text-sm text-gray-400 mb-4">${signer.sport_team || 'N/A'}</p>
            
            <div class="text-xs text-gray-400 space-y-1 mb-4">
                <p>📍 <span class="text-gray-300">${signer.active_address || 'Address restricted'}</span></p>
                <p>⏱️ Avg Return: <span class="text-gray-300">${signer.avg_days_return ? signer.avg_days_return + ' days' : 'N/A'}</span></p>
            </div>

            <a href="signer.html?id=${signer.id}" 
               class="block text-center w-full py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs rounded-lg transition-colors">
                View Player Details & Logs
            </a>
        </div>
    `).join('');
}

/**
 * Fetch live public TTM activity feed joined with player and profile names
 */
async function fetchRecentActivity() {
    if (!activityFeed) return;

    activityFeed.innerHTML = `<p class="text-sm text-gray-400 py-4">Loading community activity...</p>`;

    const { data: logs, error } = await supabase
        .from('ttm_logs')
        .select(`
            id,
            sent_date,
            returned_date,
            status,
            notes,
            signers ( name ),
            profiles ( username )
        `)
        .eq('is_public', true)
        .order('sent_date', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching activity feed:', error.message);
        activityFeed.innerHTML = `<p class="text-sm text-red-400 py-4">Unable to load feed.</p>`;
        return;
    }

    renderActivityFeed(logs);
}

/**
 * Render items in the public activity feed
 */
function renderActivityFeed(logs) {
    if (!logs || logs.length === 0) {
        activityFeed.innerHTML = `<p class="text-sm text-gray-400 py-4">No recent community returns logged yet.</p>`;
        return;
    }

    activityFeed.innerHTML = logs.map(log => {
        const playerName = log.signers?.name || 'Unknown Signer';
        const userName = log.profiles?.username || 'Collector';
        const badgeColor = log.status === 'Success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                           log.status === 'RTS' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                           log.status === 'Fee Required' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                           'bg-gray-800 text-gray-300';

        return `
            <div class="border-b border-gray-800/60 py-3 flex justify-between items-center text-sm">
                <div>
                    <span class="font-bold text-white">${userName}</span>
                    <span class="text-gray-400"> logged request for </span>
                    <span class="font-semibold text-amber-400">${playerName}</span>
                    ${log.notes ? `<p class="text-xs text-gray-500 mt-1 italic">"${log.notes}"</p>` : ''}
                </div>
                <div class="text-right">
                    <span class="text-xs px-2.5 py-1 rounded-full font-medium ${badgeColor}">
                        ${log.status}
                    </span>
                    <p class="text-xs text-gray-500 mt-1">${log.sent_date}</p>
                </div>
            </div>
        `;
    }).join('');
}
