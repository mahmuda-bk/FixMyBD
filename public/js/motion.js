(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Global IntersectionObserver for .reveal / .stagger ---------- */
  function initReveals() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');
    if (!els.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    els.forEach((el) => io.observe(el));
  }

  /* ---------- 2. Scroll progress bar ---------- */
  function initProgressBar() {
    const bar = document.getElementById('scrollbar-progress');
    if (!bar || prefersReduced) return;
    const update = () => {
      const h = document.documentElement;
      const scrollTop = h.scrollTop || document.body.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      bar.style.width = (scrollTop / (height || 1)) * 100 + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- 3. Marquee duplication ---------- */
  function initMarquees() {
    document.querySelectorAll('.marquee').forEach((marquee) => {
      const track = marquee.querySelector('.marquee-track');
      if (!track) return;
      if (marquee.getAttribute('data-marquee-init')) return;
      marquee.setAttribute('data-marquee-init', '1');
      // duplicate content for seamless loop
      track.innerHTML += track.innerHTML;
    });
  }

  /* ---------- 4. Magnetic buttons ---------- */
  function initMagnetic() {
    if (prefersReduced || !window.matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * 0.2}px, ${my * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- 5. Card tilt (report cards) ---------- */
  function initTilt() {
    if (prefersReduced || !window.matchMedia('(hover: hover)').matches) return;
    document.addEventListener('mouseover', (e) => {
      const card = e.target.closest('.report-card');
      if (!card || card.dataset.tiltInit) return;
      card.dataset.tiltInit = '1';
      card.addEventListener('mousemove', (ev) => {
        const r = card.getBoundingClientRect();
        const rx = (ev.clientX - r.left) / r.width - 0.5;
        const ry = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translate(-6px,-6px) rotate(${rx * 2}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---------- 6. Animated counters ---------- */
  function initCounters() {
    const els = document.querySelectorAll('[data-counter]');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    els.forEach((el) => {
      // if already animated, or reduced motion → show exact value straight away
      if (el.dataset.counterDone === '1' || prefersReduced) {
        el.textContent = String(el.getAttribute('data-counter'));
        return;
      }
      io.observe(el);
    });
  }

  function runCounter(el) {
    const target = parseFloat(el.getAttribute('data-counter'));
    if (isNaN(target)) return;
    const dur = 1200;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
      else {
        el.textContent = String(target); // exact final value, no repeats
        el.dataset.counterDone = '1';
      }
    }
    requestAnimationFrame(tick);
  }

  /* ---------- 7. Text scramble hover (headings) ---------- */
  function initScramble() {
    if (prefersReduced) return;
    document.querySelectorAll('[data-scramble]').forEach((el) => {
      const original = el.textContent;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&+!?0123456789';
      el.addEventListener('mouseover', () => {
        let iter = 0;
        const max = 8;
        const frame = () => {
          el.textContent = original.split('').map((c, i) => {
            if (c === ' ') return ' ';
            if (i < iter) return original[i];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('');
          iter++;
          if (iter <= max) requestAnimationFrame(frame);
          else el.textContent = original;
        };
        frame();
      });
    });
  }

  /* ---------- 8. Rearm observers after SPA navigation ---------- */
  function rearm() {
    // fallback: immediately reveal anything already in the viewport (safety net)
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
    });
    // stagger containers: reveal container and all children in viewport
    document.querySelectorAll('.stagger').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
    });
    initReveals();
    initMarquees();
    initMagnetic();
    initCounters();
    initScramble();
  }

  /* ---------- watch for SPA content swaps ---------- */
  let lastAppHTML = document.getElementById('app').innerHTML;
  setInterval(() => {
    const app = document.getElementById('app');
    if (!app) return;
    if (app.innerHTML !== lastAppHTML) {
      lastAppHTML = app.innerHTML;
      rearm();
    }
  }, 300);

  /* init */
  document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    initReveals();
    initMarquees();
    initMagnetic();
    initTilt();
    initCounters();
    initScramble();
  });

  window.__rearm = rearm;
})();
