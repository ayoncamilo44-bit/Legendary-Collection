export function generateTTMLetter() {
  // Grab inputs by whatever order they appear in the generator card
  const inputs = document.querySelectorAll('input');
  const textareas = document.querySelectorAll('textarea');

  const signerName = inputs[0] ? inputs[0].value : "";
  const itemsEnclosed = inputs[1] ? inputs[1].value : "";
  const signerAddress = textareas[0] ? textareas[0].value : "";
  const senderName = inputs[2] ? inputs[2].value : "Camilo";
  const returnAddress = textareas[1] ? textareas[1].value : "945 C street\nBrawley, Ca. 92227";

  // Date
  const dateEl = document.getElementById('print-date');
  if (dateEl) {
    dateEl.innerText = new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  }

  // Populate print fields
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

  // Open printer dialog
  window.print();
}

window.generateTTMLetter = generateTTMLetter;
