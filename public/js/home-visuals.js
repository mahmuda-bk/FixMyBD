/* FixMyBD — Digital Bangladesh visual layer for the home page.
   Additive only: it decorates the home page after the existing code renders it.
   Reads the existing public endpoint /api/reports/stats. No existing function is changed.
   To undo: remove the home-visuals.css / home-visuals.js tags from index.html. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MAP_PATH = 'M17.5 45.0C22.5 37.5 40.9 26.3 50.6 25.0C60.3 23.7 66.2 33.7 75.4 37.0C84.6 40.3 95.4 42.3 105.8 45.0C116.2 47.7 126.8 51.0 138.0 53.0C149.2 55.0 166.5 50.0 173.0 57.0C179.4 64.0 175.6 82.0 176.6 95.0C177.7 108.0 175.1 125.0 179.4 135.0C183.7 145.0 193.2 150.8 202.4 155.0C211.6 159.2 223.1 159.7 234.6 160.0C246.1 160.3 258.4 157.0 271.4 157.0C284.4 157.0 299.0 159.5 312.8 160.0C326.6 160.5 342.7 158.3 354.2 160.0C365.7 161.7 374.1 165.8 381.8 170.0C389.5 174.2 397.9 175.0 400.2 185.0C402.5 195.0 400.2 217.5 395.6 230.0C391.0 242.5 380.3 253.3 372.6 260.0C364.9 266.7 355.0 262.5 349.6 270.0C344.2 277.5 347.3 295.0 340.4 305.0C333.5 315.0 309.0 319.2 308.2 330.0C307.4 340.8 325.1 363.3 335.8 370.0C346.5 376.7 364.9 363.3 372.6 370.0C380.3 376.7 374.9 395.8 381.8 410.0C388.7 424.2 410.2 437.5 414.0 455.0C417.8 472.5 405.6 489.2 404.8 515.0C404.0 540.8 411.7 602.5 409.4 610.0C407.1 617.5 397.1 578.3 391.0 560.0C384.9 541.7 378.0 518.3 372.6 500.0C367.2 481.7 366.5 465.0 358.8 450.0C351.1 435.0 338.1 418.3 326.6 410.0C315.1 401.7 301.3 395.8 289.8 400.0C278.3 404.2 268.3 424.2 257.6 435.0C246.9 445.8 236.1 455.8 225.4 465.0C214.7 474.2 203.9 485.8 193.2 490.0C182.5 494.2 172.5 489.2 161.0 490.0C149.5 490.8 133.4 499.2 124.2 495.0C115.0 490.8 110.4 477.5 105.8 465.0C101.2 452.5 99.7 435.8 96.6 420.0C93.5 404.2 91.2 383.3 87.4 370.0C83.6 356.7 80.5 351.7 73.6 340.0C66.7 328.3 54.4 314.2 46.0 300.0C37.6 285.8 28.4 269.2 23.0 255.0C17.6 240.8 11.5 229.2 13.8 215.0C16.1 200.8 29.1 180.8 36.8 170.0C44.5 159.2 59.0 159.2 59.8 150.0C60.6 140.8 42.9 124.2 41.4 115.0C39.9 105.8 54.1 102.5 50.6 95.0C47.1 87.5 25.8 78.3 20.2 70.0C14.7 61.7 12.4 52.5 17.5 45.0Z';
  var DIVS = [{"k": "rangpur", "n": "Rangpur", "x": 124.2, "y": 100.0}, {"k": "rajshahi", "n": "Rajshahi", "x": 78.2, "y": 230.0}, {"k": "mymensingh", "n": "Mymensingh", "x": 230.0, "y": 195.0}, {"k": "sylhet", "n": "Sylhet", "x": 363.4, "y": 210.0}, {"k": "dhaka", "n": "Dhaka", "x": 230.0, "y": 295.0}, {"k": "khulna", "n": "Khulna", "x": 128.8, "y": 385.0}, {"k": "barishal", "n": "Barishal", "x": 225.4, "y": 410.0}, {"k": "chattogram", "n": "Chattogram", "x": 354.2, "y": 415.0}];
  var VB = '0 0 430 630';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return Number(n || 0).toLocaleString('en-US'); }

  /* ---------- scroll reveal / count-up observer (own, independent) ---------- */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('bdv-in', 'in');
      en.target.querySelectorAll('[data-bdv-count]').forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: 0.18 }) : null;
  function watch(el) { if (!el) return; if (io) io.observe(el); else { el.classList.add('bdv-in', 'in'); el.querySelectorAll('[data-bdv-count]').forEach(countUp); } }

  function countUp(el) {
    if (el.dataset.bdvDone) return;
    el.dataset.bdvDone = '1';
    var target = parseFloat(el.getAttribute('data-bdv-count')) || 0;
    var dec = parseInt(el.getAttribute('data-bdv-dec') || '0', 10);
    var show = function (v) { el.textContent = dec ? v.toFixed(dec) : fmt(Math.round(v)); };
    if (reduced || target === 0) { show(target); return; }
    var dur = 1300, t0 = performance.now();
    (function tick(now) {
      var p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      show(target * e);
      if (p < 1) requestAnimationFrame(tick); else show(target);
    })(t0);
  }

  /* ---------- division helpers ---------- */
  function divKey(name) {
    var n = String(name || '').toLowerCase().replace(/\s*division\s*/g, '').trim();
    if (n.indexOf('chitt') === 0 || n.indexOf('chatt') === 0) return 'chattogram';
    if (n.indexOf('baris') === 0) return 'barishal';
    return n;
  }
  function tierOf(c, max) {
    if (!c) return 'none';
    var r = c / (max || 1);
    return r >= 0.66 ? 'high' : r >= 0.33 ? 'med' : 'low';
  }
  var TIER_LABEL = { high: 'High concentration', med: 'Medium concentration', low: 'Low concentration', none: 'No reports yet' };

  /* ---------- hero art ---------- */
  function heroArt(hero) {
    var dots = DIVS.map(function (d, i) {
      return '<g class="bdv-dot" style="--d:' + (i * 0.55).toFixed(2) + 's"><circle class="bdv-ring" cx="' + d.x + '" cy="' + d.y + '" r="5"/><circle cx="' + d.x + '" cy="' + d.y + '" r="3.2"/></g>';
    }).join('');
    var art = document.createElement('div');
    art.className = 'bdv-hero-art';
    art.setAttribute('aria-hidden', 'true');
    art.innerHTML =
      '<div class="bdv-map-wrap"><svg class="bdv-hero-map" viewBox="' + VB + '" preserveAspectRatio="xMidYMid meet">' +
        '<defs><linearGradient id="bdvStroke" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#27e0a3"/><stop offset=".55" stop-color="#7fe9c1"/><stop offset="1" stop-color="#ff5a6c"/></linearGradient>' +
        '<radialGradient id="bdvFill" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#00b97f" stop-opacity=".16"/><stop offset="1" stop-color="#00b97f" stop-opacity=".02"/></radialGradient></defs>' +
        '<path class="bdv-map-fill" d="' + MAP_PATH + '"/>' +
        '<path class="bdv-map-line" pathLength="1" d="' + MAP_PATH + '"/>' + dots +
      '</svg></div>' +
      '<img class="bdv-float bdv-f1" src="/img/alpona.svg" alt="">' +
      '<img class="bdv-float bdv-f2" src="/img/alpona.svg" alt="">' +
      '<img class="bdv-float bdv-f3" src="/img/alpona.svg" alt="">' +
      '<svg class="bdv-rickshaw" viewBox="0 0 150 80"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="30" cy="58" r="14"/><circle cx="104" cy="58" r="14"/><path d="M30 58h40l24-30H62L50 44"/><path d="M104 58l12-34"/></g><path d="M52 22q18-22 50-4l-7 14H58Z" fill="currentColor"/></svg>' +
      '<svg class="bdv-paddy" viewBox="0 0 600 70" preserveAspectRatio="none"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
        (function () { var s = ''; for (var i = 0; i < 40; i++) { var x = 8 + i * 15, h = 26 + ((i * 37) % 28); s += '<path d="M' + x + ' 70q' + (i % 2 ? 6 : -6) + ' -' + (h / 2) + ' 2 -' + h + '"/><path d="M' + (x + 2) + ' ' + (70 - h) + 'q5 -4 7 -1M' + (x + 2) + ' ' + (70 - h + 8) + 'q5 -4 7 -1"/>'; } return s; })() +
      '</g></svg>' +
      '<div class="bdv-waves"><svg viewBox="0 0 1200 60" preserveAspectRatio="none"><path class="bdv-w1" d="M0 30Q75 6 150 30T300 30T450 30T600 30T750 30T900 30T1050 30T1200 30V60H0Z"/><path class="bdv-w2" d="M0 36Q75 14 150 36T300 36T450 36T600 36T750 36T900 36T1050 36T1200 36V60H0Z"/></svg></div>';
    hero.insertBefore(art, hero.firstChild);

    if (!reduced && window.matchMedia('(hover: hover)').matches) {
      var wrap = art.querySelector('.bdv-map-wrap'), raf = 0, mx = 0, my = 0;
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5); my = ((e.clientY - r.top) / r.height - 0.5);
        if (!raf) raf = requestAnimationFrame(function () { raf = 0; wrap.style.setProperty('--px', (mx * -16).toFixed(1) + 'px'); wrap.style.setProperty('--py', (my * -12).toFixed(1) + 'px'); });
      }, { passive: true });
      var sraf = 0;
      window.addEventListener('scroll', function () {
        if (sraf) return;
        sraf = requestAnimationFrame(function () { sraf = 0; var y = Math.min(window.scrollY, 700); art.style.setProperty('--sy', (y * 0.08).toFixed(1) + 'px'); });
      }, { passive: true });
    }
  }

  /* ---------- section skeletons ---------- */
  function head(title, no, extra) {
    return '<div class="section-head reveal bdv-head" style="' + (extra || 'margin-top:80px') + '"><h2>' + title + '</h2><span class="section-no">' + no + '</span></div>';
  }
  var alponaStrip = '<div class="bdv-alpona" aria-hidden="true"></div>';

  function heatSkeleton() {
    return alponaStrip + head('Issue Heatmap', '03·B / HEAT') +
      '<div class="bdv-heat reveal" id="bdvHeat" data-bdv-io>' +
        '<div class="bdv-heat-map" id="bdvHeatMap"><div class="bdv-skel">Loading live data…</div></div>' +
        '<div class="bdv-heat-side"><div class="bdv-legend">' +
          '<span><i class="t-high"></i>High</span><span><i class="t-med"></i>Medium</span><span><i class="t-low"></i>Low</span></div>' +
          '<ol class="bdv-rank" id="bdvRank"></ol>' +
          '<p class="bdv-note">Live from reported issues, by division. Hover a division to see its count.</p></div>' +
      '</div>';
  }
  function impactSkeleton() {
    return '<div class="bdv-impact reveal" id="bdvImpact" data-bdv-io></div>';
  }
  function journeySkeleton() {
    return head('Civic Impact Journey', '04·B / JOURNEY', 'margin-top:70px') +
      '<div class="bdv-journey reveal" id="bdvJourney" data-bdv-io></div>';
  }

  /* ---------- renderers ---------- */
  function renderHeat(stats) {
    var counts = {}; (stats.byDivision || []).forEach(function (x) { var k = divKey(x._id); if (k) counts[k] = (counts[k] || 0) + (x.count || 0); });
    var list = DIVS.map(function (d) { return { k: d.k, n: d.n, x: d.x, y: d.y, c: counts[d.k] || 0 }; });
    var max = Math.max.apply(null, list.map(function (d) { return d.c; }).concat([0]));
    var total = list.reduce(function (a, d) { return a + d.c; }, 0);
    list.forEach(function (d) { d.t = tierOf(d.c, max); d.r = max ? d.c / max : 0; });

    var blobs = list.map(function (d) {
      var rad = d.c ? 34 + 40 * d.r : 18;
      return '<g class="bdv-div t-' + d.t + '" data-div="' + d.k + '" tabindex="0">' +
        '<circle class="bdv-blob" cx="' + d.x + '" cy="' + d.y + '" r="' + rad.toFixed(0) + '" fill="url(#bdvG-' + d.t + ')"/>' +
        (d.c ? '<circle class="bdv-pulse" cx="' + d.x + '" cy="' + d.y + '" r="7"/>' : '') +
        '<circle class="bdv-core" cx="' + d.x + '" cy="' + d.y + '" r="' + (d.c ? 5.5 : 3.5) + '"/>' +
        '<circle class="bdv-hit" cx="' + d.x + '" cy="' + d.y + '" r="30"/></g>';
    }).join('');
    var defs = [['high', '#F42A41'], ['med', '#FF9A2E'], ['low', '#19c88a'], ['none', '#8aa89b']].map(function (t) {
      return '<radialGradient id="bdvG-' + t[0] + '"><stop offset="0" stop-color="' + t[1] + '" stop-opacity="' + (t[0] === 'none' ? '.25' : '.85') + '"/><stop offset=".55" stop-color="' + t[1] + '" stop-opacity="' + (t[0] === 'none' ? '.08' : '.28') + '"/><stop offset="1" stop-color="' + t[1] + '" stop-opacity="0"/></radialGradient>';
    }).join('');

    var mapEl = document.getElementById('bdvHeatMap');
    mapEl.innerHTML = '<svg viewBox="' + VB + '" class="bdv-heat-svg" role="img" aria-label="Bangladesh issue heatmap by division"><defs>' + defs + '</defs>' +
      '<path class="bdv-heat-land" d="' + MAP_PATH + '"/><path class="bdv-heat-edge" d="' + MAP_PATH + '"/>' + blobs + '</svg><div class="bdv-tip" id="bdvTip" role="tooltip"></div>';

    var sorted = list.slice().sort(function (a, b) { return b.c - a.c; });
    document.getElementById('bdvRank').innerHTML = sorted.map(function (d) {
      return '<li class="t-' + d.t + '" data-div="' + d.k + '"><span class="n">' + esc(d.n) + '</span><span class="c">' + fmt(d.c) + '</span><span class="bdv-bar"><i style="--w:' + Math.round(d.r * 100) + '%"></i></span></li>';
    }).join('');

    var heat = document.getElementById('bdvHeat'), tip = document.getElementById('bdvTip');
    var byKey = {}; list.forEach(function (d) { byKey[d.k] = d; });
    function show(k) {
      var d = byKey[k]; if (!d) return;
      heat.querySelectorAll('[data-div]').forEach(function (el) { el.classList.toggle('is-active', el.getAttribute('data-div') === k); });
      var share = total ? Math.round(d.c / total * 100) : 0;
      tip.innerHTML = '<b>' + esc(d.n) + '</b><span>' + fmt(d.c) + ' report' + (d.c === 1 ? '' : 's') + (total ? ' · ' + share + '%' : '') + '</span><em class="t-' + d.t + '">' + TIER_LABEL[d.t] + '</em>';
      tip.style.left = (d.x / 430 * 100) + '%'; tip.style.top = (d.y / 630 * 100) + '%';
      tip.classList.add('on');
    }
    function hide() { heat.querySelectorAll('.is-active').forEach(function (el) { el.classList.remove('is-active'); }); tip.classList.remove('on'); }
    heat.addEventListener('mouseover', function (e) { var t = e.target.closest('[data-div]'); if (t) show(t.getAttribute('data-div')); });
    heat.addEventListener('mouseleave', hide);
    heat.addEventListener('focusin', function (e) { var t = e.target.closest('[data-div]'); if (t) show(t.getAttribute('data-div')); });
    heat.addEventListener('focusout', hide);
    watch(heat);
    return { total: total, covered: list.filter(function (d) { return d.c > 0; }).length };
  }

  function renderImpact(stats, covered) {
    var total = stats.total || 0, res = stats.resolved || 0;
    var rate = total ? (res / total * 100) : 0;
    var tiles = [
      { ic: '📋', v: total, dec: 0, suf: '', lbl: 'Reports Received', w: 100 },
      { ic: '✅', v: res, dec: 0, suf: '', lbl: 'Issues Resolved', w: total ? res / total * 100 : 0 },
      { ic: '📈', v: rate, dec: 1, suf: '%', lbl: 'Resolution Rate', w: rate },
      { ic: '🗺️', v: covered, dec: 0, suf: '', lbl: 'Divisions Covered', w: covered / 8 * 100, sub: 'of 8' }
    ];
    var el = document.getElementById('bdvImpact');
    el.innerHTML = tiles.map(function (t) {
      return '<div class="bdv-tile"><span class="bdv-tile-ic">' + t.ic + '</span>' +
        '<div class="bdv-tile-num"><b data-bdv-count="' + t.v + '" data-bdv-dec="' + t.dec + '">0</b>' + (t.suf ? '<u>' + t.suf + '</u>' : '') + (t.sub ? '<small>' + t.sub + '</small>' : '') + '</div>' +
        '<div class="bdv-tile-lbl">' + t.lbl + '</div><div class="bdv-meter"><i style="--w:' + Math.max(0, Math.min(100, t.w)).toFixed(0) + '%"></i></div></div>';
    }).join('');
    watch(el);
  }

  function renderJourney(stats) {
    var by = {}; (stats.byStatus || []).forEach(function (x) { by[x._id] = x.count; });
    var g = function () { var s = 0; for (var i = 0; i < arguments.length; i++) s += by[arguments[i]] || 0; return s; };
    var steps = [
      { ic: '📝', t: 'Report', d: 'Citizens raise a public issue with location and photos.', n: stats.total || 0, l: 'received' },
      { ic: '🔍', t: 'Review', d: 'Authorities acknowledge and assess the problem.', n: g('Acknowledged', 'Under Assessment'), l: 'in review' },
      { ic: '🛠️', t: 'Action', d: 'A plan is made and work begins on the ground.', n: g('Action Planned', 'In Progress'), l: 'in action' },
      { ic: '🏁', t: 'Resolution', d: 'The issue is resolved and the citizen gives feedback.', n: g('Completed'), l: 'resolved' }
    ];
    var el = document.getElementById('bdvJourney');
    el.innerHTML = '<div class="bdv-track"><i class="bdv-track-fill"></i><i class="bdv-track-dot"></i></div><ol class="bdv-steps">' +
      steps.map(function (s, i) {
        return '<li style="--i:' + i + '"><span class="bdv-step-ic">' + s.ic + '<em>' + (i + 1) + '</em></span><h3>' + s.t + '</h3><p>' + s.d + '</p><span class="bdv-step-n"><b>' + fmt(s.n) + '</b> ' + s.l + '</span></li>';
      }).join('') + '</ol>';
    watch(el);
  }

  /* ---------- enhance the home page ---------- */
  function enhance() {
    var hero = document.querySelector('#app .hero');
    if (!hero || hero.dataset.bdv) return;
    hero.dataset.bdv = '1';
    heroArt(hero);

    var liveHead = null;
    document.querySelectorAll('#app .section-head').forEach(function (h) { var t = h.querySelector('h2'); if (t && /live impact/i.test(t.textContent)) liveHead = h; });
    var statsGrid = document.getElementById('homeLiveStats');
    if (!liveHead || !statsGrid) return;

    liveHead.insertAdjacentHTML('beforebegin', heatSkeleton());
    liveHead.insertAdjacentHTML('afterend', impactSkeleton());
    statsGrid.insertAdjacentHTML('afterend', journeySkeleton());

    fetch('/api/reports/stats').then(function (r) { return r.ok ? r.json() : null; }).then(function (stats) {
      if (!document.getElementById('bdvHeat')) return;       // user navigated away
      stats = stats || { total: 0, resolved: 0, byDivision: [], byStatus: [] };
      var h = renderHeat(stats);
      renderImpact(stats, h.covered);
      renderJourney(stats);
    }).catch(function () {
      if (!document.getElementById('bdvHeat')) return;
      var s = { total: 0, resolved: 0, byDivision: [], byStatus: [] };
      var h = renderHeat(s); renderImpact(s, h.covered); renderJourney(s);
    });
  }

  /* ---------- navbar: active indicator + alpona edge ---------- */
  function markNav() {
    var page = (location.hash || '#home').replace('#', '') || 'home';
    document.querySelectorAll('#navLinks a').forEach(function (a) {
      var m = /navigate\('([^']+)'/.exec(a.getAttribute('onclick') || '');
      a.classList.toggle('bdv-active', !!m && m[1] === page);
    });
  }
  var nav = document.getElementById('navbar');
  if (nav && !nav.querySelector('.bdv-nav-edge')) { var edge = document.createElement('div'); edge.className = 'bdv-nav-edge'; edge.setAttribute('aria-hidden', 'true'); nav.appendChild(edge); }

  function onChange() { enhance(); markNav(); }
  var app = document.getElementById('app');
  if (app) new MutationObserver(onChange).observe(app, { childList: true });
  window.addEventListener('hashchange', markNav);
  window.addEventListener('popstate', markNav);
  onChange();
  document.addEventListener('DOMContentLoaded', onChange);
})();
