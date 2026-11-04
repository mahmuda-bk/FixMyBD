/* FixMyBD — category card art + 3D tilt (decorative only).
   Adds a soft, hazy line-art illustration behind each category card and a gentle 3D tilt.
   Remove category-art.css + category-art.js tags from index.html to undo. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- illustrations (viewBox 260x180), c = main colour ---------- */
  var ART = {
    road: function (c) { return '<path d="M105 176L186 58M255 176L196 58" /><path d="M180 176L191 58" stroke-dasharray="9 9"/><path d="M14 122Q84 52 154 122"/><path d="M34 106V122M54 90V122M74 80V122M94 76V122M114 80V122M134 90V122"/><path d="M14 122H154"/><circle cx="226" cy="40" r="9"/><path d="M226 49V96"/>'; },
    water: function (c) { return '<path d="M190 30C190 30 148 84 148 114a42 42 0 0 0 84 0C232 84 190 30 190 30Z"/><path d="M172 118a20 20 0 0 0 18 20" /><path d="M14 148q16-11 32 0t32 0t32 0t32 0t32 0t32 0t32 0"/><path d="M14 164q16-11 32 0t32 0t32 0t32 0t32 0t32 0t32 0" opacity=".6"/><circle cx="96" cy="60" r="7"/><circle cx="62" cy="92" r="4"/>'; },
    electricity: function (c) { return '<path d="M168 176L190 28L212 176"/><path d="M154 66H226M160 100H220M170 136H210"/><path d="M175 100L205 66M205 100L175 66M180 136L210 100M200 136L170 100" opacity=".7"/><path d="M154 66Q80 92 8 64M160 100Q86 122 8 98M226 66Q250 76 258 70" opacity=".7"/><path d="M96 124l22-40h-14l10-34-34 48h16Z" fill="' + c + '" fill-opacity=".18"/>'; },
    waste: function (c) { return '<path d="M148 78H232L224 172H156Z"/><path d="M140 78H240M180 70H200"/><path d="M170 96V152M190 96V152M210 96V152" opacity=".6"/><path d="M52 120a30 30 0 0 1 52-14"/><path d="M104 106l2-16-14 7"/><path d="M104 138a30 30 0 0 1-52 4"/><path d="M52 142l-2 14 14-5"/>'; },
    safety: function (c) { return '<path d="M188 30L240 52V104C240 140 216 160 188 174C160 160 136 140 136 104V52Z" fill="' + c + '" fill-opacity=".1"/><path d="M164 104l17 17 33-36"/><path d="M70 176V64Q70 50 88 50H108"/><circle cx="112" cy="50" r="7"/><path d="M104 58L86 92H138L120 58" opacity=".5"/>'; },
    environment: function (c) { return '<circle cx="64" cy="48" r="16" opacity=".7"/><path d="M0 164Q70 114 140 164T260 150"/><path d="M176 176V122"/><circle cx="176" cy="94" r="30" fill="' + c + '" fill-opacity=".1"/><path d="M226 176V138"/><circle cx="226" cy="118" r="20" fill="' + c + '" fill-opacity=".1"/><path d="M176 122l-12-12M176 134l14-14" opacity=".7"/><path d="M96 130q22-26 44-10q-14 26-44 10Z"/>'; },
    education: function (c) { return '<g transform="translate(40 4)"><path d="M80 148Q50 130 8 138V76Q50 68 80 88Z" fill="' + c + '" fill-opacity=".1"/><path d="M80 148Q110 130 152 138V76Q110 68 80 88Z" fill="' + c + '" fill-opacity=".1"/><path d="M80 88V148"/><path d="M80 18L136 40L80 62L24 40Z"/><path d="M48 52V72Q80 90 112 72V52" opacity=".7"/><path d="M136 40V66"/><circle cx="136" cy="70" r="3"/></g>'; },
    healthcare: function (c) { return '<circle cx="190" cy="76" r="50" opacity=".5"/><path d="M178 44H202V64H222V88H202V108H178V88H158V64H178Z" fill="' + c + '" fill-opacity=".14"/><path d="M8 140H72l12-30l16 60l14-40l10 10H258"/>'; },
    transport: function (c) { return '<rect x="40" y="62" width="160" height="78" rx="14" fill="' + c + '" fill-opacity=".1"/><path d="M40 98H200"/><rect x="54" y="72" width="30" height="20" rx="4"/><rect x="94" y="72" width="30" height="20" rx="4"/><rect x="134" y="72" width="30" height="20" rx="4"/><circle cx="84" cy="142" r="14"/><circle cx="162" cy="142" r="14"/><path d="M10 160H252" opacity=".6"/><path d="M232 160V70"/><rect x="220" y="46" width="26" height="22" rx="4"/>'; },
    other: function (c) { return '<path d="M188 28a38 38 0 0 1 38 38c0 32-38 78-38 78s-38-46-38-78a38 38 0 0 1 38-38Z" fill="' + c + '" fill-opacity=".1"/><circle cx="188" cy="66" r="14"/><ellipse cx="188" cy="150" rx="56" ry="14" opacity=".6"/><circle cx="64" cy="54" r="4"/><circle cx="96" cy="100" r="3"/><circle cx="40" cy="120" r="5"/><circle cx="110" cy="40" r="3"/><circle cx="70" cy="148" r="3"/>'; }
  };
  function keyOf(t) {
    t = String(t || '').toLowerCase();
    if (/road|infra|bridge/.test(t)) return 'road';
    if (/water|drain/.test(t)) return 'water';
    if (/electric|power/.test(t)) return 'electricity';
    if (/waste|garbage/.test(t)) return 'waste';
    if (/safety|crime|security/.test(t)) return 'safety';
    if (/environ|pollution/.test(t)) return 'environment';
    if (/educat|school/.test(t)) return 'education';
    if (/health|hospital|medic/.test(t)) return 'healthcare';
    if (/transport|bus|traffic/.test(t)) return 'transport';
    return 'other';
  }
  var COLORS = { road: '#0b7a54', water: '#1c7fa6', electricity: '#d9531e', waste: '#2a8a5b', safety: '#c91222', environment: '#0b8a4f', education: '#4a5fc1', healthcare: '#c91c4a', transport: '#d9531e', other: '#5b7a6c' };

  function svgFor(k) {
    var c = COLORS[k];
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 180"><defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter></defs>' +
      '<circle cx="190" cy="80" r="62" fill="' + c + '" opacity=".22" filter="url(#b)"/><circle cx="90" cy="130" r="40" fill="#00b97f" opacity=".12" filter="url(#b)"/>' +
      '<g fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ART[k](c) + '</g></svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")';
  }

  function decorate() {
    document.querySelectorAll('#homeCategories .feature-card:not([data-art])').forEach(function (card) {
      card.setAttribute('data-art', '1');
      var h = card.querySelector('h3');
      var k = keyOf(h ? h.textContent : '');
      var layer = document.createElement('span');
      layer.className = 'cat-art'; layer.setAttribute('aria-hidden', 'true');
      layer.innerHTML = '<i style="background-image:' + svgFor(k).replace(/"/g, '&quot;') + '"></i><b></b>';
      card.appendChild(layer);
    });
  }

  var pending = 0, app = document.getElementById('app');
  function schedule() { if (pending) return; pending = requestAnimationFrame(function () { pending = 0; decorate(); }); }
  if (app) new MutationObserver(schedule).observe(app, { childList: true, subtree: true });
  schedule();

  /* ---------- 3D tilt (event delegation, no per-card listeners) ---------- */
  if (reduced || !fine) return;
  var cur = null, timer = 0;
  function reset(card) {
    card.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1), box-shadow .4s';
    card.style.transform = '';
    card.style.removeProperty('--mx'); card.style.removeProperty('--my');
    clearTimeout(timer); timer = setTimeout(function () { card.style.transition = ''; }, 700);
  }
  document.addEventListener('mousemove', function (e) {
    var card = e.target.closest && e.target.closest('.features .feature-card');
    if (cur && cur !== card) { reset(cur); cur = null; }
    if (!card) return;
    cur = card;
    var r = card.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.transition = 'transform .12s ease-out, box-shadow .3s';
    card.style.transform = 'translateY(-8px) rotateX(' + ((0.5 - y) * 11).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 13).toFixed(2) + 'deg)';
    card.style.setProperty('--mx', (x - 0.5).toFixed(3));
    card.style.setProperty('--my', (y - 0.5).toFixed(3));
    card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
    card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
  }, { passive: true });
  document.addEventListener('mouseleave', function () { if (cur) { reset(cur); cur = null; } });
})();
