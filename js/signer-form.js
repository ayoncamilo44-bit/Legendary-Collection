import { supabase } from './supabase.js';

const supportedFields = ['name', 'sport', 'team', 'success_rate', 'avg_response', 'tested_address'];

window.addEventListener('DOMContentLoaded', () => {
    setupManualEntry();
    setupCsvImport();
});

function showStatus(message, isError = false, statusId = 'uploadStatus') {
    const status = document.getElementById(statusId);
    if (!status) return;
    status.className = `mt-4 text-sm font-semibold ${isError ? 'text-danger' : 'text-success'}`;
    status.textContent = message;
    status.classList.remove('hidden');
}

async function requireSignedIn(statusId = 'uploadStatus') {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session) {
        showStatus('Sign in with Google before adding or importing signer records.', true, statusId);
        return false;
    }
    return true;
}

function setupManualEntry() {
    const form = document.getElementById('addSignerForm');
    if (!form) return;

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Adding signer...';

        try {
            if (!await requireSignedIn('signerFormStatus')) return;

            const record = {
                name: document.getElementById('playerName').value.trim(),
                sport: document.getElementById('sport').value.trim(),
                team: document.getElementById('team').value.trim(),
                success_rate: document.getElementById('successRate').value.trim(),
                avg_response: document.getElementById('avgResponse').value.trim(),
                tested_address: document.getElementById('testedAddress').value.trim()
            };
            const { error } = await supabase.from('signers').insert(record);
            if (error) throw error;

            form.reset();
            showStatus(`${record.name} was added to the signer directory.`, false, 'signerFormStatus');
        } catch (error) {
            console.error('Unable to add signer:', error);
            showStatus(getWriteErrorMessage(error), true, 'signerFormStatus');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i data-lucide="plus" class="w-5 h-5"></i>Add Signer';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    });
}

function setupCsvImport() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('csvFileInput');
    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', event => {
        event.preventDefault();
        dropZone.classList.add('border-accent', 'bg-darkHover');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-accent', 'bg-darkHover');
    });
    dropZone.addEventListener('drop', event => {
        event.preventDefault();
        dropZone.classList.remove('border-accent', 'bg-darkHover');
        if (event.dataTransfer.files[0]) importCsv(event.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) importCsv(fileInput.files[0]);
    });
}

async function importCsv(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showStatus('Choose a .csv file exported from your spreadsheet.', true);
        return;
    }
    if (!window.Papa) {
        showStatus('The CSV parser did not load. Refresh the page and try again.', true);
        return;
    }

    try {
        if (!await requireSignedIn()) return;
        showStatus(`Reading ${file.name}...`);

        const text = await file.text();
        const parsed = window.Papa.parse(text, {
            header: true,
            skipEmptyLines: 'greedy',
            transformHeader: header => header.trim().toLowerCase().replace(/\s+/g, '_')
        });
        if (parsed.errors.length) {
            throw new Error(`CSV row ${parsed.errors[0].row + 1}: ${parsed.errors[0].message}`);
        }
        if (!parsed.meta.fields?.includes('name')) {
            throw new Error('The CSV needs a "name" column.');
        }

        const records = parsed.data
            .filter(row => String(row.name || '').trim())
            .map(row => Object.fromEntries(
                supportedFields
                    .filter(field => parsed.meta.fields.includes(field))
                    .map(field => [field, String(row[field] || '').trim()])
            ));
        if (!records.length) throw new Error('No signer rows with names were found in this CSV.');

        showStatus(`Uploading ${records.length} signer records...`);
        const { error } = await supabase.from('signers').insert(records);
        if (error) throw error;

        showStatus(`Imported ${records.length} signer records.`);
        fileInput.value = '';
    } catch (error) {
        console.error('Unable to import signer CSV:', error);
        showStatus(getWriteErrorMessage(error, 'import CSV'), true);
    }
}

function getWriteErrorMessage(error, action = 'add signer') {
    const detail = error.message || 'Database request failed.';
    if (error.code === '42501' || /row-level security/i.test(detail)) {
        return `Could not ${action}: run supabase-setup.sql in the Supabase SQL Editor, then sign in again.`;
    }
    return `Could not ${action}: ${detail}`;
}
