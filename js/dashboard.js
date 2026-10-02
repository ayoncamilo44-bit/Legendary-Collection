import { supabase } from './supabase.js';

let allSigners = [];

window.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    setupDragAndDrop();
});

async function loadDashboard() {
    const tbody = document.getElementById('dashboardTableBody') || document.querySelector('tbody');
    if (!tbody) return;

    const { data: signers, error } = await supabase
        .from('signers')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Supabase Query Error:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-red-400 text-center">Error loading dashboard: ${error.message}</td></tr>`;
        return;
    }

    if (!signers || signers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-gray-400 text-center">No signers found in database.</td></tr>`;
        return;
    }

    allSigners = signers;
    renderDashboardTable(allSigners);
}

function renderDashboardTable(data) {
    const tbody = document.getElementById('dashboardTableBody') || document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = data.map(signer => {
        const ebayUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(signer.name + ' autographed card')}&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339215575&customid=LegitimateCollector&toolid=10001&mkevt=1`;
        const sportlotsUrl = `https://www.sportlots.com/inven/invenbin/dealnew.tpl?pname=${encodeURIComponent(signer.name)}&Ref=Bets1202`;
        const scnUrl = `https://www.sportscollectors.net/Search.aspx?search=${encodeURIComponent(signer.name)}`;

        return `
        <tr class="border-b border-darkBorder hover:bg-darkBg/40 transition">
            <td class="px-4 py-3 font-semibold text-white">${signer.name || '-'}</td>
            <td class="px-4 py-3 text-gray-300">${signer.sport || '-'} / ${signer.team || '-'}</td>
            <td class="px-4 py-3 text-amber-400 font-semibold">${signer.success_rate || 'N/A'}</td>
            <td class="px-4 py-3 text-green-400 font-semibold">${signer.avg_response || 'Pending'}</td>
            <td class="px-4 py-3 text-gray-400 text-xs font-mono">${signer.tested_address || '-'}</td>
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

function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => { 
        e.preventDefault(); 
        dropZone.classList.add('border-amber-400'); 
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-amber-400');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-amber-400');
        if (e.dataTransfer.files.length) {
            parseAndUploadCSV(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            parseAndUploadCSV(e.target.files[0]);
        }
    });
}

async function parseAndUploadCSV(file) {
    const status = document.getElementById('uploadStatus');
    if (status) {
        status.textContent = `Parsing ${file.name}...`;
        status.classList.remove('hidden', 'text-red-400', 'text-green-400');
    }

    try {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
            throw new Error('CSV file must contain a header row and at least one data row.');
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const rows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            let row = {};
            headers.forEach((h, i) => { 
                row[h] = values[i] || ''; 
            });
            return row;
        });

        const { error } = await supabase.from('signers').insert(rows);

        if (error) {
            if (status) {
                status.textContent = `Upload failed: ${error.message}`;
                status.classList.add('text-red-400');
            }
        } else {
            if (status) {
                status.textContent = `Successfully uploaded ${rows.length} records!`;
                status.classList.add('text-green-400');
            }
            loadDashboard();
        }
    } catch (err) {
        if (status) {
            status.textContent = `Error: ${err.message}`;
            status.classList.add('text-red-400');
        }
    }
}
