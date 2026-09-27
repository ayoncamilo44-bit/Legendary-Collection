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

    tableBody.innerHTML = signers.map(signer => `
        <tr class="hover:bg-darkCard/50 transition-colors">
            <td class="px-4 py-3 font-semibold text-white">${signer.name}</td>
            <td class="px-4 py-3 text-gray-400">${signer.sport || 'N/A'} (${signer.team || 'N/A'})</td>
            <td class="px-4 py-3"><span class="text-emerald-400 font-bold">${signer.success_rate || 0}%</span></td>
            <td class="px-4 py-3 text-gray-400">${signer.avg_days || '--'} Days</td>
            <td class="px-4 py-3 text-gray-400 truncate max-w-xs">${signer.address_type || 'Verified Address'}</td>
            <td class="px-4 py-3 text-right">
                <a href="signer.html?id=${signer.id}" class="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[11px] font-semibold transition-colors">
                    View Profile
                </a>
            </td>
        </tr>
    `).join('');
}

function setupSearchListener() {
    const searchInput = document.querySelector('#directory input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => loadSigners(e.target.value));
    }
}
