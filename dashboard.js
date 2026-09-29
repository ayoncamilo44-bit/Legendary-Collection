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
        tbody.innerHTML = `<tr><td colspan="6" class="p-12 text-center text-danger">
            <div class="flex flex-col items-center gap-3">
                <i data-lucide="alert-circle" class="w-12 h-12"></i>
                <p class="text-sm">Error loading dashboard: ${error.message}</p>
            </div>
        </td></tr>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    if (!signers || signers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-12 text-center text-gray-400">
            <div class="flex flex-col items-center gap-3">
                <i data-lucide="database" class="w-12 h-12 text-gray-500"></i>
                <p class="text-sm">No signers found in database.</p>
            </div>
        </td></tr>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
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
        <tr class="border-b border-darkBorder hover:bg-darkHover/50 transition-colors">
            <td class="px-6 py-4 font-semibold text-white">${signer.name || '-'}</td>
            <td class="px-6 py-4 text-gray-400">${signer.sport || '-'} <span class="text-gray-500">/ ${signer.team || '-'}</span></td>
            <td class="px-6 py-4"><span class="inline-flex items-center px-3 py-1 rounded-full bg-success/20 text-success text-sm font-semibold">${signer.success_rate || 'N/A'}</span></td>
            <td class="px-6 py-4 text-gray-400">${signer.avg_response || 'Pending'}</td>
            <td class="px-6 py-4 text-gray-400 text-xs font-mono truncate max-w-xs">${signer.tested_address || '-'}</td>
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

function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => { 
        e.preventDefault(); 
        dropZone.classList.add('border-accent'); 
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-accent');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-accent');
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
        status.classList.add('text-accent');
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
                status.classList.remove('text-accent');
                status.classList.add('text-danger');
            }
        } else {
            if (status) {
                status.textContent = `Successfully uploaded ${rows.length} records!`;
                status.classList.remove('text-accent');
                status.classList.add('text-success');
            }
            loadDashboard();
        }
    } catch (err) {
        if (status) {
            status.textContent = `Error: ${err.message}`;
            status.classList.remove('text-accent');
            status.classList.add('text-danger');
        }
    }
}
