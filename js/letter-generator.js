/**
 * Letter & Envelope Generator for Legendary Collection
 */

export function generateTTMLetter({ signerName, signerAddress, itemsSent, senderName, senderAddress }) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const letterHTML = `
    <div class="printable-letter">
      <p style="text-align: right;">${today}</p>
      
      <p><strong>${signerName}</strong><br/>
      ${signerAddress.replace(/\n/g, '<br/>')}</p>

      <p>Dear ${signerName},</p>

      <p>I am writing to you today as a dedicated fan of your career. I have always admired your contributions to the game, and it would be a true honor to add your signature to my collection.</p>

      <p>I have enclosed the following item(s) for your consideration:</p>
      <ul>
        ${itemsSent.map(item => `<li>${item}</li>`).join('')}
      </ul>

      <p>I have also included a self-addressed stamped envelope (SASE) for your convenience. If you are unable to sign at this time, I completely understand and appreciate your time nonetheless.</p>

      <p>Thank you very much for taking the time to read this letter and for being so gracious with your fans.</p>

      <br/>
      <p>Sincerely,</p>
      <br/>
      <p><strong>${senderName}</strong><br/>
      ${senderAddress.replace(/\n/g, '<br/>')}</p>
    </div>

    <!-- #10 Outer Envelope -->
    <div class="printable-envelope">
      <div class="envelope-return-address">
        <strong>${senderName}</strong><br/>
        ${senderAddress.replace(/\n/g, '<br/>')}
      </div>
      <div class="envelope-recipient-address">
        <strong>${signerName}</strong><br/>
        ${signerAddress.replace(/\n/g, '<br/>')}
      </div>
    </div>
  `;

  // Create temporary container and trigger print dialog
  const printContainer = document.createElement('div');
  printContainer.id = 'print-section';
  printContainer.innerHTML = letterHTML;
  document.body.appendChild(printContainer);

  window.print();

  // Clean up print section after printing
  document.body.removeChild(printContainer);
}

// Attach to window for modular HTML execution
window.generateTTMLetter = generateTTMLetter;
