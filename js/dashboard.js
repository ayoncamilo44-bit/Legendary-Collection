import { supabase } from './supabase.js';

window.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    loadPersonalTTMLogs(session.user.id);
});

async function loadPersonalTTMLogs(userId) {
    const container = document.getElementById('personal-ttm-list');
    if (!container) return;

    const { data: logs, error } = await supabase
        .from('ttm_logs')
        .select(`
            id,
            sent_date,
            returned_date,
            status,
            notes,
            signers ( name )
        `)
        .eq('user_id', userId)
        .order('sent_date', { ascending: false });

    if (error) {
        container.innerHTML = `<p class="text-red-400 text-xs">Error loading collection logs: ${error.message}</p>`;
        return;
    }

    if (!logs || logs.length === 0) {
        container.innerHTML = `<p class="text-gray-400 text-xs py-6 text-center">No TTM requests logged yet.</p>`;
        return;
    }

   container.innerHTML = logs.map(log => {
  const signerName = log.signers?.name || 'Unknown Signer';
  const ebayUrl = getEbayAffiliateUrl(signerName);
  const sportlotsUrl = getSportlotsUrl(signerName);
  const scnUrl = getScnUrl(signerName);

  return `
    <div class="bg-darkBg border border-darkBorder p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h4 class="font-bold text-white text-sm">${signerName}</h4>
        <p class="text-gray-400 mt-0.5 text-xs">Sent: ${log.sent_date} ${log.returned_date ? `| Returned: ${log.returned_date}` : ''}</p>
        ${log.notes ? `<p class="text-gray-500 mt-1 italic text-xs">${log.notes}</p>` : ''}
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <!-- eBay Affiliate Button -->
        <a href="${ebayUrl}" target="_blank" rel="noopener noreferrer" 
           class="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold rounded-md text-xs hover:bg-amber-400 hover:text-black transition">
          eBay
        </a>

        <!-- Sportlots Referral Button -->
        <a href="${sportlotsUrl}" target="_blank" rel="noopener noreferrer" 
           class="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold rounded-md text-xs hover:bg-amber-400 hover:text-black transition">
          Sportlots
        </a>

        <!-- SCN Community Link -->
        <a href="${scnUrl}" target="_blank" rel="noopener noreferrer" 
           class="px-2.5 py-1 bg-darkCard border border-darkBorder text-gray-300 font-semibold rounded-md text-xs hover:border-goldPrimary hover:text-white transition">
          SCN
        </a>

        <!-- Status Tag -->
        <span class="px-2.5 py-1 rounded-md font-semibold bg-darkCard text-amber-400 border border-darkBorder text-xs">
          ${log.status}
        </span>
      </div>
    </div>
  `;
}).join('');
container.innerHTML = logs.map(log => {
  const signerName = log.signers?.name || 'Unknown Signer';
  const ebayUrl = getEbayAffiliateUrl(signerName);

  return `
    <div class="bg-darkBg border border-darkBorder p-4 rounded-xl flex justify-between items-center gap-4">
      <div>
        <h4 class="font-bold text-white text-sm">${signerName}</h4>
        <p class="text-gray-400 mt-0.5 text-xs">Sent: ${log.sent_date} ${log.returned_date ? `| Returned: ${log.returned_date}` : ''}</p>
        ${log.notes ? `<p class="text-gray-500 mt-1 italic text-xs">${log.notes}</p>` : ''}
      </div>
      <div class="flex items-center gap-2">
        <a href="${ebayUrl}" target="_blank" rel="noopener noreferrer" 
           class="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold rounded-md text-xs hover:bg-amber-400 hover:text-black transition">
          eBay
        </a>
        <span class="px-2.5 py-1 rounded-md font-semibold bg-darkCard text-amber-400 border border-darkBorder text-xs">
          ${log.status}
        </span>
      </div>
    </div>
  `;
}).join('');
