import { supabase } from './supabase.js';
 
let latestRequest = 0;
 
window.addEventListener('DOMContentLoaded', () => {
    loadSigners();
    setupSearchListener();
});
 
// Turns any value into text that is safe to place inside HTML.
function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}
 
// Shows "85%" whether the database holds 85 or "85%". Shows N/A if empty.
function formatRate(value) {
    const cleaned = String(value ?? '').replace('%', '').trim();
    return cleaned === '' ? 'N/A' : `${cleaned}%`;
}
 
// Adds "Days" only when the stored value is a plain number.
function formatResponse(value) {
    const cleaned = String(value ?? '').trim();
    if (cleaned === '') return '--';
    return /^\d+(\.\d+)?$/.test(cleaned) ? `${cleaned} Days` : cleaned;
}
 
async function loadSigners(query = '') {
    const tableBody = document.getElementById('directoryTableBody');
    if (!tableBody) return;
 
    const requestId = ++latestRequest;
 
    let request = supabase.from('signers').select('*').order('name', { ascending: true });
    if (query.trim() !== '') {
        // Escape % and _ so they are searched as normal characters.
        const safeQuery = query.trim().replace(/[\\%_]/g, '\\$&');
        request = request.ilike('name', `%${safeQuery}%`);
    }
 
    const { data: signers, error } = await request;
 
    // Ignore results from an older search if a newer one was started.
    if (requestId !== latestRequest) return;
 
    if (error) console.error('Could not load signers', error);
 
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
        const name = signer.name || '';
        const ebayUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(name + ' autographed card')}&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339215575&customid=LegitimateCollector&toolid=10001&mkevt=1`;
        const sportlotsUrl = `https://www.sportlots.com/inven/invenbin/dealnew.tpl?pname=${encodeURIComponent(name)}&Ref=Bets1202`;
        const scnUrl = `https://www.sportscollectors.net/Search.aspx?search=${encodeURIComponent(name)}`;
 
        return `
        <tr class="border-b border-darkBorder hover:bg-darkHover/50 transition-colors">
            <td class="px-6 py-4 font-semibold text-white">${escapeHtml(name)}</td>
            <td class="px-6 py-4 text-gray-400">${escapeHtml(signer.sport || 'N/A')} <span class="text-gray-500">(${escapeHtml(signer.team || 'N/A')})</span></td>
            <td class="px-6 py-4"><span class="inline-flex items-center px-3 py-1 rounded-full bg-success/20 text-success text-sm font-semibold">${escapeHtml(formatRate(signer.success_rate))}</span></td>
            <td class="px-6 py-4 text-gray-400">${escapeHtml(formatResponse(signer.avg_response))}</td>
            <td class="px-6 py-4 text-gray-400 truncate max-w-xs">${escapeHtml(signer.tested_address || 'Verified Address')}</td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <a href="${escapeHtml(ebayUrl)}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-accent/10 border border-accent/30 text-accent font-semibold rounded-lg text-xs hover:bg-accent hover:text-white smooth-transition flex items-center gap-1">
                        <i data-lucide="shopping-bag" class="w-3 h-3"></i>eBay
                    </a>
                    <a href="${escapeHtml(sportlotsUrl)}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-success/10 border border-success/30 text-success font-semibold rounded-lg text-xs hover:bg-success hover:text-white smooth-transition flex items-center gap-1">
                        <i data-lucide="shopping-cart" class="w-3 h-3"></i>Sportlots
                    </a>
                    <a href="${escapeHtml(scnUrl)}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-darkCard border border-darkBorder text-gray-300 font-semibold rounded-lg text-xs hover:border-purple-400 hover:text-purple-400 smooth-transition flex items-center gap-1">
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
 







Claude finished the response
