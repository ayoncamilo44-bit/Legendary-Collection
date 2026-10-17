// Dynamic Navigation Injector for Legendary Collection
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    const links = [
        { label: 'Home', href: 'index.html' },
        { label: 'Directory', href: 'directory.html' },
        { label: 'Guides', href: 'guides.html' },
        { label: 'Supplies', href: 'supplies.html' },
        { label: 'Resources', href: 'resources.html' },
        { label: 'Community', href: 'community.html' },
        { label: 'Showcase', href: 'showcase.html' },
        { label: 'Dashboard', href: 'dashboard.html' },
        { label: 'Add Signer', href: 'signer.html' },
        { label: 'TTM Collector Choice', href: 'https://www.ttm-collector-choice.com/' }
    ];

    const drawerHTML = `
        <div id="drawer-overlay" class="fixed inset-0 bg-black/60 z-50 opacity-0 invisible transition-opacity duration-300"></div>
        <aside id="site-drawer" class="fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-darkCard border-r border-darkBorder z-50 -translate-x-full invisible transition-all duration-300 overflow-y-auto flex flex-col">
            <div class="flex items-center justify-between p-4 border-b border-darkBorder">
                <span class="text-white font-bold text-lg">Menu</span>
                <button id="drawer-close" type="button" aria-label="Close menu" class="text-gray-400 p-1 hover:text-white">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
                </button>
            </div>
            <nav aria-label="Main" class="flex-1">
                ${links.map(link => {
                    const isActive = currentPath === link.href;
                    return `<a class="block px-5 py-3.5 text-gray-300 font-medium border-b border-darkBorder border-l-4 ${isActive ? 'text-white bg-darkHover border-l-accent' : 'border-l-transparent hover:text-white hover:bg-darkHover'}" href="${link.href}">${link.label}</a>`;
                }).join('')}
            </nav>
            <div id="mobile-auth-slot" class="p-4"></div>
            <a href="https://www.buymeacoffee.com/LegendaryCollection" target="_blank" rel="noopener noreferrer" class="m-5 p-3 rounded-lg bg-amber-500 text-slate-900 font-semibold text-center text-sm hover:bg-amber-400 transition-colors">Support the Site</a>
        </aside>
    `;

    // Inject drawer into body
    document.body.insertAdjacentHTML('afterbegin', drawerHTML);

    // Setup toggle logic
    const btn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('site-drawer');
    const overlay = document.getElementById('drawer-overlay');
    const closeBtn = document.getElementById('drawer-close');

    function toggleDrawer(open) {
        if (!drawer || !overlay) return;
        drawer.classList.toggle('-translate-x-full', !open);
        drawer.classList.toggle('invisible', !open);
        overlay.classList.toggle('opacity-0', !open);
        overlay.classList.toggle('invisible', !open);
        document.body.style.overflow = open ? 'hidden' : '';
    }

    if (btn) btn.addEventListener('click', () => toggleDrawer(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleDrawer(false));
    if (overlay) overlay.addEventListener('click', () => toggleDrawer(false));
});
