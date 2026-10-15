// TTM letter and envelope printing. Everything stays in your browser; nothing is sent anywhere.
(function () {
    'use strict';
    var form = document.getElementById('letterGenForm');
    if (!form) return;

    var KEY = 'ttm-return-address';
    function $(id) { return document.getElementById(id); }
    function val(id) { return ($(id).value || '').trim(); }

    // Fill in the saved return address, if the visitor chose to keep one on this device.
    try {
        var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (saved) {
            $('senderName').value = saved.name || '';
            $('senderAddress').value = saved.address || '';
            $('rememberSender').checked = true;
        }
    } catch (e) { /* storage unavailable: ignore */ }

    function remember() {
        try {
            if ($('rememberSender').checked) {
                localStorage.setItem(KEY, JSON.stringify({ name: val('senderName'), address: val('senderAddress') }));
            } else {
                localStorage.removeItem(KEY);
            }
        } catch (e) { /* ignore */ }
    }

    function fill() {
        var signer = val('signerName');
        var items = val('itemsSent').split(',').map(function (s) { return s.trim(); }).filter(Boolean);

        $('print-date').textContent = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        $('print-recipient-name').textContent = signer;
        $('print-recipient-address').textContent = val('signerAddress');
        $('print-salutation').textContent = 'Dear ' + signer + ',';

        var list = $('print-items-enclosed');
        list.textContent = '';
        items.forEach(function (item) {
            var line = document.createElement('div');
            line.textContent = item;
            list.appendChild(line);
        });

        $('print-sender-name').textContent = val('senderName');
        $('print-sender-address').textContent = val('senderAddress');
        $('print-envelope-return').textContent = val('senderName') + '\n' + val('senderAddress');
        $('print-envelope-recipient').textContent = signer + '\n' + val('signerAddress');
    }

    function printPart(part) {
        if (!form.reportValidity()) return;   // shows "please fill out this field" on anything missing
        fill();
        remember();
        document.body.classList.add('print-' + part);
        window.print();
    }

    window.addEventListener('afterprint', function () {
        document.body.classList.remove('print-letter', 'print-envelope');
    });

    $('printLetterBtn').addEventListener('click', function () { printPart('letter'); });
    $('printEnvelopeBtn').addEventListener('click', function () { printPart('envelope'); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
})();
