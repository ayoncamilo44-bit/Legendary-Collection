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
            $('senderAddress').value = saved.address \vert{}\vert{} '';$('rememberSender').checked = true;
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

        $('print-date').textContent = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });$('print-recipient-name').textContent = signer;
        $('print-recipient-address').textContent = val('signerAddress');$('print-salutation').textContent = 'Dear ' + signer + ',';

        var list = $('print-items-enclosed');
        list.textContent = '';
        items.forEach(function (item) {
            var line = document.createElement('div');
            line.textContent = item;
            list.appendChild(line);
        });

        $('print-sender-name').textContent = val('senderName');$('print-sender-address').textContent = val('senderAddress');
        $('print-envelope-return').textContent = val('senderName') + '\n' + val('senderAddress');$('print-envelope-recipient').textContent = signer + '\n' + val('signerAddress');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
        });
    }

    function printEnvelope() {
        var printWindow = window.open('', '_blank');
        if (!printWindow) {
            window.alert('Your browser blocked the envelope preview. Allow pop-ups for this site, then try again.');
            return;
        }

        var returnAddress = escapeHtml(val('senderName') + '\n' + val('senderAddress'));
        var recipientAddress = escapeHtml(val('signerName') + '\n' + val('signerAddress'));
        printWindow.document.open();
        printWindow.document.write(`<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>#10 Envelope Address</title>
    <style>
        @page { 
            size: 9.5in 4.125in landscape; 
            margin: 0; 
        }
        html, body { 
            width: 9.5in; 
            height: 4.125in; 
            margin: 0; 
            padding: 0; 
            background: #fff; 
        }
        body { 
            color: #000; 
            font-family: Arial, Helvetica, sans-serif; 
        }
        .envelope { 
            position: relative; 
            box-sizing: border-box; 
            width: 9.5in; 
            height: 4.125in; 
            overflow: hidden; 
        }
        .return { 
            position: absolute; 
            left: 0.5in; 
            top: 0.4in; 
            font-size: 11pt; 
            line-height: 1.35; 
            white-space: pre-line; 
        }
        .recipient { 
            position: absolute; 
            left: 4.25in; 
            top: 2.0in; 
            max-width: 4.75in; 
            font-size: 13pt; 
            line-height: 1.4; 
            white-space: pre-line; 
            text-transform: uppercase; 
        }
        @media screen { 
            body { margin: 24px; } 
            .envelope { outline: 1px solid #999; box-shadow: 0 2px 16px #999; } 
        }
    </style>
</head>
<body>
    <main class="envelope" aria-label="Number 10 envelope print preview">
        <div class="return">${returnAddress}</div>
        <div class="recipient">${recipientAddress}</div>
    </main>
</body>
</html>`);
        printWindow.document.close();
        printWindow.addEventListener('afterprint', function () { printWindow.close(); }, { once: true });
        var didPrint = false;
        function startPrint() {
            if (didPrint || printWindow.closed) return;
            didPrint = true;
            printWindow.focus();
            printWindow.print();
        }
        printWindow.addEventListener('load', function () {
            startPrint();
        }, { once: true });
        // document.write can finish before the load listener is attached in some browsers.
        window.setTimeout(startPrint, 300);
    }

    function printPart(part) {
        if (!form.reportValidity()) return;   // shows "please fill out this field" on anything missing
        remember();
        if (part === 'envelope') {
            printEnvelope();
            return;
        }
        fill();
        document.body.classList.add('print-' + part);
        window.print();
    }

    window.addEventListener('afterprint', function () {
        document.body.classList.remove('print-letter', 'print-envelope');
    });

    $('printLetterBtn').addEventListener('click', function () { printPart('letter'); });$('printEnvelopeBtn').addEventListener('click', function () { printPart('envelope'); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
})();
