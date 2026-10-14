export function generateTTMLetter(signerName, signerAddress, itemsEnclosed, senderName, returnAddress) {
  // 1. Populate the print HTML elements
  const dateEl = document.getElementById('print-date');
  if (dateEl) {
    dateEl.innerText = new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  }

  const setElText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  };

  setElText('print-recipient-name', signerName);
  setElText('print-recipient-address', signerAddress);
  setElText('print-salutation', `Dear ${signerName},`);
  setElText('print-items-enclosed', itemsEnclosed);
  setElText('print-sender-name', senderName);
  setElText('print-envelope-recipient', `${signerName}\n${signerAddress}`);

  // 2. Trigger the browser print dialog
  window.print();
}

// Attach globally just in case
window.generateTTMLetter = generateTTMLetter;
