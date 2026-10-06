/* Desabrais Laundry & Dry Cleaning — tiny vanilla JS (no dependencies).
   The page works without any of this; it only adds comfort features. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* 1. Current year in the footer */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* 2. Mobile menu */
  var header = $('.site-header');
  var toggle = $('.nav-toggle');
  var nav = $('#site-nav');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    });
  }

  /* 3. Header shadow once the page scrolls */
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* 4. Scroll reveal + active nav link (only if IntersectionObserver exists) */
  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal').forEach(function (el) { revealIO.observe(el); });

    var links = {};
    $$('.site-nav a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = links[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('is-active'); links[k].removeAttribute('aria-current'); });
          a.classList.add('is-active'); a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) navIO.observe(s); });
  }

  /* 5. Photo lightbox (native <dialog>) */
  var dlg = $('#lightbox');
  var shots = $$('.shot');
  if (dlg && shots.length && typeof dlg.showModal === 'function') {
    var lbImg = $('#lightbox-img');
    var lbCap = $('#lightbox-cap');
    var current = 0;
    var opener = null;

    var show = function (i) {
      current = (i + shots.length) % shots.length;
      var btn = shots[current];
      var thumb = $('img', btn);
      lbImg.src = btn.getAttribute('data-full') || thumb.currentSrc || thumb.src;
      lbImg.alt = thumb.alt;
      lbCap.textContent = btn.getAttribute('data-caption') || '';
    };

    shots.forEach(function (btn, i) {
      btn.addEventListener('click', function () { opener = btn; show(i); dlg.showModal(); });
    });
    $('.lb-close', dlg).addEventListener('click', function () { dlg.close(); });
    $('.lb-prev', dlg).addEventListener('click', function () { show(current - 1); });
    $('.lb-next', dlg).addEventListener('click', function () { show(current + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); }); /* click on backdrop */
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    dlg.addEventListener('close', function () { if (opener) opener.focus(); });
  } else {
    /* Very old browsers: open the full image in a new tab instead */
    shots.forEach(function (btn) {
      btn.addEventListener('click', function () { window.open(btn.getAttribute('data-full'), '_blank', 'noopener'); });
    });
  }

  /* 6. Draft helper: count remaining [CONFIRM] items.
        Visible only on localhost / file:// or when the URL has ?draft. Never shown to normal visitors. */
  var pill = $('#draft-pill');
  if (pill) {
    var isLocal = /^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname);
    var wantsDraft = /[?&]draft\b/.test(location.search);
    var n = $$('mark.confirm').length;
    if ((isLocal || wantsDraft) && n > 0) {
      pill.textContent = '⚠ ' + n + ' items still marked [CONFIRM]';
      pill.hidden = false;
    }
  }
})();
