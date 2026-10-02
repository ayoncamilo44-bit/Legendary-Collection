import { supabase } from './supabase.js';

let allSigners = null;

window.addEventListener('DOMContentLoaded', () => {
    loadSigners();
    setupSearchListener();
});

async function loadSigners(query = '') {
    const tableBody = document.getElementById('directoryTableBody');
    if (!tableBody) return;

    try {
        if (allSigners === null) {
            const { data, error } = await supabase
                .from('signers')
                .select('id, name, sport, team, success_rate, avg_response, tested_address')
                .order('name', { ascending: true });
            if (error) throw error;
            allSigners = data || [];
        }

        const searchTerm = query.trim().toLocaleLowerCase();
        const signers = allSigners.filter(signer =>
            [signer.name, signer.sport, signer.team]
                .some(value => String(value || '').toLocaleLowerCase().includes(searchTerm))
        );

        if (signers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                        <div class="flex flex-col items-center gap-3">
                            <i data-lucide="search-x" class="w-12 h-12 text-gray-500"></i>
                            <p class="text-sm">${searchTerm ? 'No signers match your search.' : 'No signers found in the database.'}</p>
                        </div>
                    </td>
                </tr>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        tableBody.innerHTML = signers.map(signer => {
            const name = String(signer.name || '');
            const ebayUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(name + ' autographed card')}&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339215575&customid=LegitimateCollector&toolid=10001&mkevt=1`;
            const sportlotsUrl = `https://www.sportlots.com/b/ui/search.tpl?search_val=${encodeURIComponent(name)}&Ref=Bets1202`;
            const scnUrl = `https://www.sportscollectors.net/Search.aspx?search=${encodeURIComponent(name)}`;
            const successRate = String(signer.success_rate || '');
            const responseTime = String(signer.avg_response || '');

            return `
            <tr class="border-b border-darkBorder hover:bg-darkHover/50 transition-colors">
                <td class="px-6 py-4 font-semibold text-white">${escapeHtml(name)}</td>
                <td class="px-6 py-4 text-gray-400">${escapeHtml(signer.sport || 'N/A')} <span class="text-gray-500">(${escapeHtml(signer.team || 'N/A')})</span></td>
                <td class="px-6 py-4"><span class="inline-flex items-center px-3 py-1 rounded-full bg-success/20 text-success text-sm font-semibold">${escapeHtml(successRate || 'N/A')}${successRate && !successRate.includes('%') ? '%' : ''}</span></td>
                <td class="px-6 py-4 text-gray-400">${escapeHtml(responseTime || '--')}${responseTime && !/days?/i.test(responseTime) ? ' Days' : ''}</td>
                <td class="px-6 py-4 text-gray-400 truncate max-w-xs">${escapeHtml(signer.tested_address || 'Verified Address')}</td>
                <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <a href="${ebayUrl}" target="_blank" rel="sponsored nofollow noopener noreferrer" class="px-3 py-1.5 bg-accent/10 border border-accent/30 text-accent font-semibold rounded-lg text-xs hover:bg-accent hover:text-white smooth-transition flex items-center gap-1">
                            <i data-lucide="shopping-bag" class="w-3 h-3"></i>eBay
                        </a>
                        <a href="${sportlotsUrl}" target="_blank" rel="sponsored nofollow noopener noreferrer" class="px-3 py-1.5 bg-success/10 border border-success/30 text-success font-semibold rounded-lg text-xs hover:bg-success hover:text-white smooth-transition flex items-center gap-1">
                            <i data-lucide="shopping-cart" class="w-3 h-3"></i>Sportlots
                        </a>
                        <a href="${scnUrl}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-darkCard border border-darkBorder text-gray-300 font-semibold rounded-lg text-xs hover:border-purple-400 hover:text-purple-400 smooth-transition flex items-center gap-1">
                            <i data-lucide="globe" class="w-3 h-3"></i>SCN
                        </a>
                    </div>
                </td>
            </tr>
        `;
        }).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (error) {
        console.error('Unable to load signer directory:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-red-300">
                    Unable to load the signer directory: ${escapeHtml(error.message || 'Unknown database error')}
                </td>
            </tr>
        `;
    }
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function setupSearchListener() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', event => loadSigners(event.target.value));
    }
}
