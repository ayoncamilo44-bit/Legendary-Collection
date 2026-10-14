document.addEventListener('DOMContentLoaded', () => {
  const printBtn = document.getElementById('ttm-print-btn');
  
  if (printBtn) {
    printBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Stops the page from clearing or reloading

      // 1. Grab values safely using our explicit IDs
      const signerName = document.getElementById('ttm-signer-name')?.value || "";
      const itemsEnclosed = document.getElementById('ttm-items')?.value || "";
      const signerAddress = document.getElementById('ttm-signer-address')?.value || "";
      const senderName = document.getElementById('ttm-sender-name')?.value || "Caly";
      const returnAddress = document.getElementById('ttm-sender-address')?.value || "945 C street\nBrawley, Ca. 92227";

      // 2. Populate the hidden print template elements
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

      // 3. Fire the print dialog
      window.print();
    });
  }
});
