/* Orkestrasi utama: smooth scroll, preloader, animasi gulir, kursor, navigasi, formulir. */
(function () {
  /* Konfigurasi — isi formEndpoint (mis. Formspree / backend sendiri) agar formulir benar-benar terkirim. */
  const CONFIG = {
    formEndpoint: ''
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  const $ = function (s, c) { return (c || document).querySelector(s); };
  const $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
    else target.scrollIntoView({ behavior: 'smooth' });
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(id === '#beranda' ? 0 : el);
    });
  });

  /* ---------- Preloader ---------- */
  const preloader = $('.preloader');
  const countEl = $('#loaderCount');
  const barEl = $('#loaderBar');
  let pageLoaded = document.readyState === 'complete';
  window.addEventListener('load', function () { pageLoaded = true; });
  setTimeout(function () { pageLoaded = true; }, 4500);
  if (lenis) lenis.stop();

  const t0 = performance.now();
  let shown = 0;
  function loaderTick(now) {
    const elapsed = now - t0;
    const cap = pageLoaded ? 100 : Math.min(88, elapsed / 22);
    shown += (cap - shown) * (pageLoaded ? 0.12 : 0.05);
    if (pageLoaded && cap - shown < 0.6) shown = 100;
    countEl.textContent = Math.round(shown);
    barEl.style.width = shown + '%';
    if (shown >= 100 && elapsed > 1500) { finishLoader(); return; }
    requestAnimationFrame(loaderTick);
  }
  requestAnimationFrame(loaderTick);

  function finishLoader() {
    document.body.classList.remove('is-loading');
    if (lenis) lenis.start();
    if (!hasGSAP) { preloader.remove(); return; }
    const tl = gsap.timeline();
    tl.to('.preloader__inner, .preloader__foot', { y: -40, opacity: 0, duration: 0.6, ease: 'power3.in' })
      .to(preloader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.1')
      .add(function () { preloader.remove(); })
      .add(heroIntro(), '-=0.65');
  }

  function heroIntro() {
    const tl = gsap.timeline();
    tl.from('.hero__title .line > span', { yPercent: 110, rotate: 3, duration: 1.4, stagger: 0.1, ease: 'expo.out' })
      .from('.hero__eyebrow', { y: 20, opacity: 0, duration: 0.9, ease: 'expo.out' }, 0.1)
      .from('.hero__lead, .hero__cta', { y: 30, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out' }, 0.45)
      .from('.hero__meta', { opacity: 0, duration: 1 }, 0.7)
      .from('.nav', { opacity: 0, duration: 1, ease: 'power2.out' }, 0.3)
      .from('.hero__canvas', { opacity: 0, duration: 2.2, ease: 'power2.out' }, 0);
    return tl;
  }

  /* ---------- Jam WIB ---------- */
  const clock = $('#clock');
  function updateClock() {
    try {
      clock.textContent = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date());
    } catch (e) { clock.textContent = ''; }
  }
  updateClock();
  setInterval(updateClock, 15000);
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Navigasi ---------- */
  const nav = $('#nav');
  const links = $$('.nav__links a');
  const pill = $('.nav__pill');
  let lastY = 0;
  function onScroll(y) {
    nav.classList.toggle('is-scrolled', y > 40);
    const menuOpen = document.body.classList.contains('menu-open');
    nav.classList.toggle('is-hidden', !menuOpen && y > 500 && y > lastY + 2);
    if (y < lastY - 2) nav.classList.remove('is-hidden');
    lastY = y;
    const doc = document.documentElement;
    const p = y / Math.max(1, doc.scrollHeight - window.innerHeight);
    progressBar.style.transform = 'scaleX(' + Math.min(1, p) + ')';
  }
  const progressBar = $('.scroll-progress span');
  if (lenis) lenis.on('scroll', function (e) { onScroll(e.scroll); });
  else window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });

  function movePill(a) {
    if (!a) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + a.offsetLeft + 'px)';
  }
  function setActiveLink(id) {
    let found = null;
    links.forEach(function (a) {
      const on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-active', on);
      if (on) found = a;
    });
    movePill(found);
  }
  const sectionIds = links.map(function (a) { return a.getAttribute('href').slice(1); });
  if (hasGSAP) {
    sectionIds.forEach(function (id) {
      const sec = document.getElementById(id);
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: 'top 45%', end: 'bottom 45%',
        onToggle: function (self) {
          if (self.isActive) setActiveLink(id);
          else if ($('.nav__links a.is-active[href="#' + id + '"]')) setActiveLink(null);
        }
      });
    });
    ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom 45%', onToggle: function (s) { if (s.isActive) setActiveLink(null); } });
    ScrollTrigger.create({ trigger: '#kontak', start: 'top 45%', onToggle: function (s) { if (s.isActive) setActiveLink(null); } });
  }

  // menu seluler
  const toggle = $('.nav__toggle');
  const menu = $('#mobileMenu');
  function closeMenu() {
    if (!menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Buka menu');
    document.body.classList.remove('menu-open');
    if (lenis) lenis.start();
  }
  toggle.addEventListener('click', function () {
    const open = !menu.classList.contains('is-open');
    if (!open) { closeMenu(); return; }
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Tutup menu');
    document.body.classList.add('menu-open');
    nav.classList.remove('is-hidden');
    if (lenis) lenis.stop();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Kursor kustom ---------- */
  if (finePointer && !reduceMotion) {
    const cursor = $('.cursor');
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    const label = $('.cursor__label');
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    }, { passive: true });
    (function follow() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      requestAnimationFrame(follow);
    })();
    document.addEventListener('pointerover', function (e) {
      const labeled = e.target.closest('[data-cursor]');
      const interactive = e.target.closest('a, button, input, textarea, label, .chain__card, .why__card');
      cursor.classList.toggle('is-label', !!labeled);
      cursor.classList.toggle('is-hover', !labeled && !!interactive);
      label.textContent = labeled ? labeled.getAttribute('data-cursor') : '';
    });
    document.addEventListener('pointerleave', function () { cursor.classList.add('is-hidden'); });
    document.addEventListener('pointerenter', function () { cursor.classList.remove('is-hidden'); });
    $$('.hero').forEach(function (h) {
      h.addEventListener('pointerenter', function () { cursor.classList.remove('is-hidden'); });
    });
  }

  /* ---------- Tombol magnetis ---------- */
  if (finePointer && !reduceMotion && hasGSAP) {
    $$('.magnetic').forEach(function (el) {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.28);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('pointerleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ---------- Marquee (bereaksi pada kecepatan gulir) ---------- */
  const track = $('.marquee__track');
  if (track) {
    const group = track.firstElementChild;
    for (let i = 0; i < 2; i++) track.appendChild(group.cloneNode(true));
    let x = 0, dir = 1;
    const tick = function (dt) {
      const v = lenis ? lenis.velocity : 0;
      if (Math.abs(v) > 0.5) dir = v > 0 ? 1 : -1;
      const speed = (reduceMotion ? 0 : 0.9) + Math.min(Math.abs(v) * 0.5, 14);
      x -= speed * dir * dt;
      const w = group.offsetWidth;
      if (w) { if (x <= -w) x += w; if (x > 0) x -= w; }
      track.style.transform = 'translate3d(' + x + 'px,0,0)';
    };
    if (hasGSAP) gsap.ticker.add(function (time, deltaTime) { tick(deltaTime / 16.67); });
    else (function loop() { tick(1); requestAnimationFrame(loop); })();
  }

  /* ---------- Tilt + sorotan kartu ---------- */
  if (finePointer && !reduceMotion) {
    $$('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
        card.style.transform = 'rotateX(' + ((0.5 - py) * 10) + 'deg) rotateY(' + ((px - 0.5) * 12) + 'deg) translateZ(0)';
      });
      card.addEventListener('pointerleave', function () {
        card.style.transition = 'transform .8s cubic-bezier(.22,1,.36,1), border-color .4s';
        card.style.transform = '';
        setTimeout(function () { card.style.transition = ''; }, 800);
      });
    });
  }

  /* ---------- Tab audiens + formulir ---------- */
  const AUD = {
    peternak: { text: 'Bergabung dalam program kemitraan inti-plasma: bibit unggul, pakan, pendampingan teknis, dan jaminan pasar untuk hasil ternak Anda.', minat: 'Kemitraan Peternak' },
    investor: { text: 'Berpartisipasi dalam pertumbuhan salah satu sektor pangan paling strategis di Indonesia bersama tim yang berpengalaman.', minat: 'Investasi' },
    bisnis: { text: 'Dapatkan pasokan sapi dan daging berkualitas secara konsisten untuk hotel, restoran, katering, dan ritel modern.', minat: 'Pembelian Sapi & Daging' },
    karier: { text: 'Bangun masa depan peternakan Indonesia bersama tim yang bersemangat, profesional, dan berorientasi pada dampak.', minat: 'Karier' }
  };
  const audText = $('#audText');
  const audTabs = $$('.audience__tabs button');
  audTabs.forEach(function (b) {
    b.addEventListener('click', function () {
      const a = AUD[b.getAttribute('data-aud')];
      audTabs.forEach(function (x) {
        x.classList.toggle('is-active', x === b);
        x.setAttribute('aria-selected', x === b ? 'true' : 'false');
      });
      const radio = $('input[name="minat"][value="' + a.minat + '"]');
      if (radio) radio.checked = true;
      if (hasGSAP) {
        gsap.to(audText, { opacity: 0, y: 10, duration: 0.2, onComplete: function () {
          audText.textContent = a.text;
          gsap.to(audText, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
        } });
      } else audText.textContent = a.text;
    });
  });

  const form = $('#contactForm');
  const emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
  function validate() {
    let ok = true;
    [['fName', function (v) { return v.trim().length > 1; }], ['fEmail', emailOk], ['fMsg', function (v) { return v.trim().length > 4; }]].forEach(function (rule) {
      const input = document.getElementById(rule[0]);
      const valid = rule[1](input.value);
      input.closest('.field').classList.toggle('is-invalid', !valid);
      input.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (!valid && ok) { input.focus(); ok = false; }
    });
    return ok;
  }
  form.addEventListener('input', function (e) {
    const f = e.target.closest('.field');
    if (f) f.classList.remove('is-invalid');
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    const errorEl = $('#formError');
    errorEl.hidden = true;
    const data = Object.fromEntries(new FormData(form).entries());
    const firstName = (data.nama || '').trim().split(' ')[0];

    // Belum ada endpoint: jangan berpura-pura pesan terkirim.
    if (!CONFIG.formEndpoint) {
      $('#formSuccessTitle').textContent = 'Mode pratinjau';
      $('#formSuccessText').textContent = 'Formulir ini belum tersambung ke sistem, jadi pesan Anda belum terkirim. Silakan hubungi kami lewat email atau telepon yang tercantum.';
      form.classList.add('is-sent', 'is-demo');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const label = btn.querySelector('.btn__text');
    btn.classList.add('is-loading');
    label.textContent = 'Mengirim';
    fetch(CONFIG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        $('#formSuccessTitle').textContent = 'Terima kasih!';
        $('#formSuccessText').textContent = 'Terima kasih, ' + firstName + '. Tim ' + data.minat.toLowerCase() + ' kami akan menghubungi Anda dalam 1×24 jam kerja.';
        form.classList.remove('is-demo');
        form.classList.add('is-sent');
      })
      .catch(function () { errorEl.hidden = false; })
      .finally(function () {
        btn.classList.remove('is-loading');
        label.textContent = 'Kirim Pesan';
      });
  });
  $('#formReset').addEventListener('click', function () {
    form.reset();
    form.classList.remove('is-sent', 'is-demo');
  });

  /* ---------- Animasi berbasis gulir ---------- */
  if (!hasGSAP) return;

  // pecah judul menjadi kata untuk animasi masuk
  function splitWords(el, cls) {
    const out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span');
            s.className = cls;
            if (cls === 'sw') { const inner = document.createElement('span'); inner.textContent = part; s.appendChild(inner); out.push(inner); }
            else { s.textContent = part; out.push(s); }
            frag.appendChild(s);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    })(el);
    return out;
  }

  if (reduceMotion) {
    $$('[data-count]').forEach(function (el) { el.textContent = (+el.getAttribute('data-count')).toLocaleString('id-ID'); });
    $$('.timeline__item').forEach(function (i) { i.classList.add('is-reached'); });
    gsap.set('.timeline__fill', { scaleY: 1 });
    return;
  }

  $$('[data-split]').forEach(function (el) {
    const words = splitWords(el, 'sw');
    gsap.from(words, {
      yPercent: 115, duration: 1.2, stagger: 0.05, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  $$('[data-scrub-words]').forEach(function (el) {
    const words = splitWords(el, 'w');
    gsap.fromTo(words, { opacity: 0.14 }, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: true }
    });
  });

  $$('[data-reveal]').forEach(function (el) {
    gsap.from(el, {
      y: 40, opacity: 0, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });

  // penghitung angka
  $$('[data-count]').forEach(function (el) {
    const end = +el.getAttribute('data-count');
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: function () {
        gsap.to(obj, { v: end, duration: 2.2, ease: 'expo.out', onUpdate: function () { el.textContent = Math.round(obj.v).toLocaleString('id-ID'); } });
      }
    });
  });

  // hero memudar & bergeser saat digulir
  gsap.to('.hero__content', {
    yPercent: -18, opacity: 0.1, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  // kartu keunggulan muncul bertahap
  gsap.from('.why__card', {
    y: 80, opacity: 0, rotateX: -12, duration: 1.2, stagger: 0.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.why__grid', start: 'top 85%' }
  });

  // ekosistem: orbit berputar masuk
  gsap.from('.eco__orbit', {
    scale: 0.85, rotate: -25, opacity: 0, duration: 1.6, ease: 'expo.out',
    scrollTrigger: { trigger: '.eco__orbit', start: 'top 80%' }
  });
  gsap.from('.eco__panel', {
    x: 60, opacity: 0, duration: 1.3, ease: 'expo.out',
    scrollTrigger: { trigger: '.eco__panel', start: 'top 85%' }
  });

  // peta jalan: garis terisi mengikuti gulir
  gsap.to('.timeline__fill', {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '#timeline', start: 'top 60%', end: 'bottom 60%', scrub: true }
  });
  $$('.timeline__item').forEach(function (item, i) {
    ScrollTrigger.create({
      trigger: item, start: 'top 60%',
      onEnter: function () { item.classList.add('is-reached'); },
      onLeaveBack: function () { item.classList.remove('is-reached'); }
    });
    gsap.from(item.querySelector('.timeline__card'), {
      x: window.innerWidth > 720 ? (i % 2 ? 60 : -60) : 30, opacity: 0, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: item, start: 'top 85%' }
    });
  });

  // footer: huruf raksasa naik bergelombang
  gsap.from('.footer__giant > span', {
    yPercent: 60, opacity: 0, duration: 1.4, stagger: 0.06, ease: 'expo.out',
    scrollTrigger: { trigger: '.footer__giant', start: 'top 95%' }
  });

  /* ---------- Rantai nilai: gulir horizontal (desktop) ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 981px)', function () {
    const chainTrack = $('#chainTrack');
    const fill = $('.chain__progress-fill');
    const icon = $('.chain__progress-icon');
    const distance = function () { return chainTrack.scrollWidth - window.innerWidth; };
    const tween = gsap.to(chainTrack, {
      x: function () { return -distance(); },
      ease: 'none',
      scrollTrigger: {
        trigger: '.chain',
        pin: true,
        refreshPriority: 1,
        start: 'top top',
        end: function () { return '+=' + distance(); },
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          fill.style.transform = 'scaleX(' + self.progress + ')';
          icon.style.left = (self.progress * 100) + '%';
        }
      }
    });
    $$('.chain__card').forEach(function (card) {
      const chainIcon = card.querySelector('.chain__icon');
      if (chainIcon) gsap.from(chainIcon, {
        rotate: -90, scale: 0.4, opacity: 0, duration: 1, ease: 'back.out(2)',
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 85%' }
      });
      const num = card.querySelector('.chain__num');
      if (num) gsap.fromTo(num, { xPercent: 30 }, {
        xPercent: -20, ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
      });
    });
  });
  mm.add('(max-width: 980px)', function () {
    $$('.chain__card').forEach(function (card) {
      gsap.from(card, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 88%' } });
    });
  });

  // urutkan trigger berdasarkan posisi di halaman agar jarak pin rantai nilai ikut terhitung
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  // hitung ulang posisi setelah font & gambar selesai dimuat
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
