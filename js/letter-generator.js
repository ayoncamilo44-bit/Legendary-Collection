// Complete Letter and Envelope Generator Script

function generateTTMLetter() {
  // 1. Grab values from your form fields
  const signerName = document.querySelector('input[name="signerName"], #signer-name-input').value;
  const signerAddress = document.querySelector('textarea[name="address"], #signer-address-input').value;
  const itemsEnclosed = document.querySelector('input[name="items"], #items-input').value;

  // 2. Populate the print HTML elements
  document.getElementById('print-date').innerText = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });
  
  document.getElementById('print-recipient-name').innerText = signerName;
  document.getElementById('print-recipient-address').innerText = signerAddress;
  document.getElementById('print-salutation').innerText = `Dear ${signerName},`;
  document.getElementById('print-items-enclosed').innerText = itemsEnclosed;
  
  // Populate the envelope recipient section
  document.getElementById('print-envelope-recipient').innerText = `${signerName}\n${signerAddress}`;

  // 3. Trigger browser print dialog
  window.print();
}

// Attach to window for modular HTML execution
window.generateTTMLetter = generateTTMLetter;
