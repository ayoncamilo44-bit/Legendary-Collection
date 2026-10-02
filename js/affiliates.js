const partners = [
    {
        name: 'eBay',
        description: 'Find signed cards and collectibles from sellers around the world.',
        icon: 'shopping-bag',
        url: 'https://www.ebay.com/sch/i.html?_nkw=sports+autograph+cards&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339215575&customid=LegitimateCollector&toolid=10001&mkevt=1'
    },
    {
        name: 'Sportlots',
        description: 'Browse sports cards and supplies for your collection.',
        icon: 'shopping-cart',
        url: 'https://www.sportlots.com/b/ui/search.tpl?search_val=sports+cards&Ref=Bets1202'
    }
];

function renderAffiliatePartners() {
    const footer = document.querySelector('footer');
    if (!footer || document.getElementById('affiliate-partners')) return;

    const section = document.createElement('section');
    section.id = 'affiliate-partners';
    section.className = 'affiliate-section';
    section.setAttribute('aria-labelledby', 'affiliate-partners-title');
    section.innerHTML = `
        <div class="affiliate-inner">
            <div class="affiliate-heading">
                <div>
                    <p class="affiliate-eyebrow">Featured partners</p>
                    <h2 id="affiliate-partners-title">Shop for your next great find</h2>
                </div>
                <p class="affiliate-disclosure">Some links are affiliate links. We may earn a commission at no extra cost to you.</p>
            </div>
            <div class="affiliate-grid">
                ${partners.map(partner => `
                    <a class="affiliate-card" href="${partner.url}" target="_blank" rel="sponsored nofollow noopener noreferrer">
                        <span class="affiliate-icon" aria-hidden="true"><i data-lucide="${partner.icon}"></i></span>
                        <span class="affiliate-copy">
                            <span class="affiliate-name">${partner.name}</span>
                            <span class="affiliate-description">${partner.description}</span>
                        </span>
                        <span class="affiliate-arrow" aria-hidden="true">↗</span>
                    </a>
                `).join('')}
            </div>
        </div>
    `;
    footer.before(section);

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAffiliatePartners, { once: true });
} else {
    renderAffiliatePartners();
}
