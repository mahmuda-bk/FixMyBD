/* FixMyBD — visual effects (cursor glow + login/register entrance). Decorative only. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. Cursor glow ---------- */
  if (canHover) {
    var glow = document.createElement('div'); glow.id = 'fx-cursor';
    var core = document.createElement('div'); core.id = 'fx-cursor-core';
    document.body.appendChild(glow); document.body.appendChild(core);
    var tx = -200, ty = -200, gx = tx, gy = ty, cx = tx, cy = ty, lastTrail = 0, started = false;

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!started) { gx = cx = tx; gy = cy = ty; started = true; glow.classList.add('on'); core.classList.add('on'); }
      var now = performance.now();
      if (now - lastTrail > 55) {           // tiny fading sparks behind the cursor
        lastTrail = now;
        var t = document.createElement('span'); t.className = 'fx-trail';
        t.style.left = (tx - 3) + 'px'; t.style.top = (ty - 3) + 'px';
        t.style.setProperty('--dx', (Math.random() * 30 - 15) + 'px');
        t.style.setProperty('--dy', (Math.random() * 30 - 5) + 'px');
        document.body.appendChild(t);
        setTimeout(function () { t.remove(); }, 850);
      }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { glow.classList.remove('on'); core.classList.remove('on'); });
    document.addEventListener('mouseenter', function () { if (started) { glow.classList.add('on'); core.classList.add('on'); } });

    document.addEventListener('mouseover', function (e) {   // glow swells over clickable things
      var hot = e.target.closest && e.target.closest('a,button,.btn,input,select,textarea,.report-card,.feature-card');
      glow.classList.toggle('hot', !!hot);
    });
    document.addEventListener('mousedown', function (e) {   // ripple on click
      var r = document.createElement('span'); r.className = 'fx-ripple';
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
      document.body.appendChild(r); setTimeout(function () { r.remove(); }, 750);
    });

    (function loop() {                       // smooth, slightly laggy follow
      gx += (tx - gx) * 0.14; gy += (ty - gy) * 0.14;
      cx += (tx - cx) * 0.5;  cy += (ty - cy) * 0.5;
      glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)';
      core.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 2. Login / Register dramatic open ---------- */
  function spark(card, burst, i, total) {
    var s = document.createElement('span'); s.className = 'fx-spark';
    var size = 8 + Math.random() * 14;
    s.style.setProperty('--s', size + 'px');
    var w = card.offsetWidth, h = card.offsetHeight;
    if (burst) {                                    // fly outward from the centre
      var ang = (i / total) * Math.PI * 2 + Math.random() * 0.5, dist = 120 + Math.random() * 220;
      s.style.left = (w / 2 - size / 2) + 'px'; s.style.top = (h / 2 - size / 2) + 'px';
      s.style.setProperty('--x', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--y', Math.sin(ang) * dist + 'px');
      s.style.setProperty('--d', (0.9 + Math.random() * 0.8) + 's');
      s.style.setProperty('--delay', (Math.random() * 0.25) + 's');
    } else {                                        // twinkle around the card edge
      var edge = Math.random() * 4, px, py;
      if (edge < 1) { px = Math.random() * w; py = -6; }
      else if (edge < 2) { px = Math.random() * w; py = h - 6; }
      else if (edge < 3) { px = -6; py = Math.random() * h; }
      else { px = w - 6; py = Math.random() * h; }
      s.style.left = px + 'px'; s.style.top = py + 'px';
      s.classList.add('fx-twinkle');
      s.style.setProperty('--d', (1.6 + Math.random() * 1.8) + 's');
      s.style.setProperty('--delay', (0.6 + Math.random() * 2) + 's');
      s.style.animationIterationCount = '3';
    }
    card.appendChild(s);
    setTimeout(function () { s.remove(); }, burst ? 2300 : 9000);
  }

  function openAuthCard(card) {
    if (card.dataset.fx) return;
    card.dataset.fx = '1';
    var holder = card.parentElement;
    var b = document.createElement('div'); b.className = 'fx-burst';
    if (holder) holder.insertBefore(b, holder.firstChild);
    setTimeout(function () { b.remove(); }, 1200);
    card.classList.add('fx-open');
    var i; for (i = 0; i < 22; i++) spark(card, true, i, 22);
    for (i = 0; i < 14; i++) spark(card, false);
  }

  function scan() {
    var c = document.querySelector('#app .auth-card');
    if (c) openAuthCard(c);
  }
  var app = document.getElementById('app');
  if (app) {
    new MutationObserver(scan).observe(app, { childList: true });
    scan();
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      var a = document.getElementById('app');
      if (a) { new MutationObserver(scan).observe(a, { childList: true }); scan(); }
    });
  }
})();
