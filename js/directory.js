import { supabase } from './supabase.js';

window.addEventListener('DOMContentLoaded', () => {
    loadSigners();
    setupSearchListener();
});

async function loadSigners(query = '') {
    const tableBody = document.querySelector('#directory table tbody');
    if (!tableBody) return;

    let request = supabase.from('signers').select('*');
    if (query.trim() !== '') {
        request = request.ilike('name', `%${query}%`);
    }

    const { data: signers, error } = await request;

    if (error || !signers || signers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-4 py-6 text-center text-gray-500 text-xs">No signers found matching your request.</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = signers.map(signer => {
        const ebayUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(signer.name + ' autographed card')}&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339215575&customid=LegitimateCollector&toolid=10001&mkevt=1`;
        const sportlotsUrl = `https://www.sportlots.com/inven/invenbin/dealnew.tpl?pname=${encodeURIComponent(signer.name)}&Ref=Bets1202`;
        const scnUrl = `https://www.sportscollectors.net/Search.aspx?search=${encodeURIComponent(signer.name)}`;

        return `
        <tr class="hover:bg-darkCard/50 transition-colors">
            <td class="px-4 py-3 font-semibold text-white">${signer.name}</td>
            <td class="px-4 py-3 text-gray-400">${signer.sport || 'N/A'} (${signer.team || 'N/A'})</td>
            <td class="px-4 py-3"><span class="text-emerald-400 font-bold">${signer.success_rate || 0}%</span></td>
            <td class="px-4 py-3 text-gray-400">${signer.avg_response || '--'} Days</td>
            <td class="px-4 py-3 text-gray-400 truncate max-w-xs">${signer.tested_address || 'Verified Address'}</td>
            <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1.5">
                    <a href="${ebayUrl}" target="_blank" rel="sponsored nofollow noopener noreferrer" class="px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold rounded text-xs hover:bg-amber-400 hover:text-black transition">eBay</a>
                    <a href="${sportlotsUrl}" target="_blank" rel="sponsored nofollow noopener noreferrer" class="px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold rounded text-xs hover:bg-amber-400 hover:text-black transition">Sportlots</a>
                    <a href="${scnUrl}" target="_blank" rel="noopener noreferrer" class="px-2 py-1 bg-darkCard border border-darkBorder text-gray-300 font-semibold rounded text-xs hover:border-amber-400 hover:text-white transition">SCN</a>
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

function setupSearchListener() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => loadSigners(e.target.value));
    }
}
