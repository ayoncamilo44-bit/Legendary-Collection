import { supabase } from './supabase.js';

window.addEventListener('DOMContentLoaded', () => {
    loadSigners();
    setupSearchListener();
});

async function loadSigners(query = '') {
    const tableBody = document.getElementById('directoryTableBody');
    if (!tableBody) return;

    let request = supabase.from('signers').select('*');
    if (query.trim() !== '') {
        request = request.ilike('name', `%${query}%`);
    }

    const { data: signers, error } = await request;

    if (error || !signers || signers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                    <div class="flex flex-col items-center gap-3">
                        <i data-lucide="search-x" class="w-12 h-12 text-gray-500"></i>
                        <p class="text-sm">No signers found matching your request.</p>
                    </div>
                </td>
            </tr>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    tableBody.innerHTML = signers.map(signer => {
        const ebayUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(signer.name + ' autographed card')}&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339215575&customid=LegitimateCollector&toolid=10001&mkevt=1`;
        const sportlotsUrl = `https://www.sportlots.com/inven/invenbin/dealnew.tpl?pname=${encodeURIComponent(signer.name)}&Ref=Bets1202`;
        const scnUrl = `https://www.sportscollectors.net/Search.aspx?search=${encodeURIComponent(signer.name)}`;

        return `
        <tr class="border-b border-darkBorder hover:bg-darkHover/50 transition-colors">
            <td class="px-6 py-4 font-semibold text-white">${signer.name}</td>
            <td class="px-6 py-4 text-gray-400">${signer.sport || 'N/A'} <span class="text-gray-500">(${signer.team || 'N/A'})</span></td>
            <td class="px-6 py-4"><span class="inline-flex items-center px-3 py-1 rounded-full bg-success/20 text-success text-sm font-semibold">${signer.success_rate || 0}%</span></td>
            <td class="px-6 py-4 text-gray-400">${signer.avg_response || '--'} Days</td>
            <td class="px-6 py-4 text-gray-400 truncate max-w-xs">${signer.tested_address || 'Verified Address'}</td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <a href="${ebayUrl}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-accent/10 border border-accent/30 text-accent font-semibold rounded-lg text-xs hover:bg-accent hover:text-white smooth-transition flex items-center gap-1">
                        <i data-lucide="shopping-bag" class="w-3 h-3"></i>eBay
                    </a>
                    <a href="${sportlotsUrl}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-success/10 border border-success/30 text-success font-semibold rounded-lg text-xs hover:bg-success hover:text-white smooth-transition flex items-center gap-1">
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
}

function setupSearchListener() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => loadSigners(e.target.value));
    }
}
