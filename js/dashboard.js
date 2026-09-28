import { supabase } from './supabase.js';

window.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    loadDashboardLogs();
});

async function loadDashboardLogs() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    // Fetch user TTM logs along with signer details
    const { data: logs, error } = await supabase
        .from('ttm_logs')
        .select(`
            id,
            sent_date,
            returned_date,
            status,
            notes,
            signers (
                id,
                name,
                sport,
                team,
                tested_address
            )
        `)
        .order('sent_date', { ascending: false });

    if (error) {
        console.error('Database query error:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-red-400 text-xs text-center">Error loading logs: ${error.message}</td></tr>`;
        return;
    }

    if (!logs || logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-gray-400 text-xs text-center">No active TTM requests logged yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = logs.map(log => {
        const signerName = log.signers?.name || 'Unknown Signer';
        const ebayUrl = getEbayAffiliateUrl(signerName);
        const sportlotsUrl = getSportlotsUrl(signerName);
        const scnUrl = getScnUrl(signerName);

        return `
            <tr class="border-b border-darkBorder hover:bg-darkCard/50 transition">
                <td class="px-4 py-3 font-semibold text-white">${signerName}</td>
                <td class="px-4 py-3 text-gray-400">${log.signers?.sport || '-'} / ${log.signers?.team || '-'}</td>
                <td class="px-4 py-3 text-amber-400 font-semibold">${log.sent_date || '-'}</td>
                <td class="px-4 py-3 text-green-400 font-semibold">${log.returned_date || 'Pending'}</td>
                <td class="px-4 py-3 text-gray-400 text-xs">${log.notes || '-'}</td>
                <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                        <a href="${ebayUrl}" target="_blank" rel="noopener noreferrer" 
                           class="px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold rounded text-xs hover:bg-amber-400 hover:text-black transition">
                            eBay
                        </a>
                        <a href="${sportlotsUrl}" target="_blank" rel="noopener noreferrer" 
                           class="px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold rounded text-xs hover:bg-amber-400 hover:text-black transition">
                            Sportlots
                        </a>
                        <a href="${scnUrl}" target="_blank" rel="noopener noreferrer" 
                           class="px-2 py-1 bg-darkCard border border-darkBorder text-gray-300 font-semibold rounded text-xs hover:border-goldPrimary hover:text-white transition">
                            SCN
                        </a>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Affiliate Link Generators
function getEbayAffiliateUrl(playerName) {
    const query = encodeURIComponent(`${playerName} autographed card`);
    return `https://www.ebay.com/sch/i.html?_nkw=${query}&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339215575&customid=LegitimateCollector&toolid=10001&mkevt=1`;
}

function getSportlotsUrl(playerName) {
    const query = encodeURIComponent(playerName);
    return `https://www.sportlots.com/inven/invenbin/dealnew.tpl?pname=${query}&Ref=Bets1202`;
}

function getScnUrl(playerName) {
    const query = encodeURIComponent(playerName);
    return `https://www.sportscollectors.net/Search.aspx?search=${query}`;
}
