/* Legendary Collection - header menu
   Add to every page just before </body>:
   <script src="./js/header-menu.js" defer></script>
   Keeps your logo and sign-in buttons as they are. Moves the page links into a
   "More" menu so the header never runs off the screen. */
(function () {
  var nav = document.querySelector('header nav') || document.querySelector('nav');
  if (!nav || nav.querySelector('.hm-btn')) return;

  var LINKS = /(index|directory|guides|dashboard|community|signer)\.html|ttm-collector-choice/i;
  var links = Array.prototype.filter.call(nav.querySelectorAll('a[href]'), function (a) {
    var isLogo = a.querySelector('svg, img, [data-lucide]') || /legendary|legitimate/i.test(a.textContent);
    return LINKS.test(a.getAttribute('href')) && !isLogo;
  });
  if (!links.length) return;

  var css = document.createElement('style');
  css.textContent =
    '.hm-btn{display:inline-flex;align-items:center;gap:.4rem;padding:.5rem .8rem;border-radius:999px;' +
    'border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;font:600 .9rem inherit;' +
    'font-family:inherit;cursor:pointer;white-space:nowrap}' +
    '.hm-btn:hover,.hm-btn:focus-visible{border-color:#a78bfa;outline:none}' +
    '.hm-arrow{display:inline-block}' +
    '.hm-hint .hm-arrow{animation:hm-bounce 1s ease-in-out 4}' +
    '@keyframes hm-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}' +
    '@media (prefers-reduced-motion:reduce){.hm-hint .hm-arrow{animation:none}}' +
    '.hm-panel{position:fixed;z-index:9999;min-width:230px;max-width:calc(100vw - 24px);padding:.5rem;' +
    'border-radius:14px;background:#111827;border:1px solid rgba(255,255,255,.14);' +
    'box-shadow:0 12px 32px rgba(0,0,0,.5);display:none}' +
    '.hm-panel.hm-open{display:block}' +
    '.hm-panel a{display:block;padding:.7rem .9rem;border-radius:10px;color:#e5e7eb;text-decoration:none;font-size:.95rem}' +
    '.hm-panel a:hover,.hm-panel a:focus-visible{background:rgba(129,140,248,.18);color:#fff;outline:none}' +
    '.hm-panel a.hm-sister{background:linear-gradient(90deg,rgba(99,102,241,.25),rgba(236,72,153,.25));color:#fff;font-weight:600}' +
    '.hm-panel small{display:block;font-weight:400;color:#cbd5e1;font-size:.78rem}' +
    '.hm-panel a.hm-page{display:none}' +
    '@media (max-width:1000px){.hm-hide{display:none!important}.hm-panel a.hm-page{display:block}}';
  document.head.appendChild(css);

  var panel = document.createElement('div');
  panel.className = 'hm-panel';
  panel.id = 'hm-panel';
  panel.setAttribute('role', 'menu');

  links.forEach(function (a) {
    var isSister = /ttm-collector-choice/i.test(a.getAttribute('href'));
    var item = document.createElement('a');
    item.href = a.getAttribute('href');
    if (isSister) {
      item.className = 'hm-sister';
      item.target = '_blank';
      item.rel = 'noopener';
      item.innerHTML = 'TTM Collector Choice<small>Our sister site</small>';
      a.classList.add('hm-hide-always');
      a.style.display = 'none';
    } else {
      item.className = 'hm-page';
      item.textContent = a.textContent.trim();
      a.classList.add('hm-hide');
    }
    panel.appendChild(item);
  });
  // sister site first in the menu
  var sister = panel.querySelector('.hm-sister');
  if (sister) panel.insertBefore(sister, panel.firstChild);

  var seen = false;
  try { seen = localStorage.getItem('hm-seen') === '1'; } catch (e) {}

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'hm-btn' + (seen ? '' : ' hm-hint');
  btn.setAttribute('aria-haspopup', 'true');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'hm-panel');
  btn.innerHTML = '<span>More</span><span class="hm-arrow" aria-hidden="true">&#9660;</span>';

  // place the button right after the last page link so the order stays natural
  var last = links[links.length - 1];
  last.parentNode.insertBefore(btn, last.nextSibling);
  document.body.appendChild(panel);

  function place() {
    var r = btn.getBoundingClientRect();
    panel.style.top = (r.bottom + 8) + 'px';
    var left = Math.min(r.left, window.innerWidth - panel.offsetWidth - 12);
    panel.style.left = Math.max(12, left) + 'px';
  }
  function close() {
    panel.classList.remove('hm-open');
    btn.setAttribute('aria-expanded', 'false');
  }
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = !panel.classList.contains('hm-open');
    if (!open) return close();
    panel.classList.add('hm-open');
    place();
    btn.setAttribute('aria-expanded', 'true');
    btn.classList.remove('hm-hint');
    try { localStorage.setItem('hm-seen', '1'); } catch (e) {}
  });
  document.addEventListener('click', function (e) {
    if (!panel.contains(e.target)) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { close(); btn.focus(); }
  });
  window.addEventListener('resize', close);
})();
