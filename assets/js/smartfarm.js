/* Dasbor "Juragan Smart Farm" — simulasi tampilan dengan data ilustratif. */
(function () {
  const dash = document.getElementById('dash');
  if (!dash) return;

  const COWS = [
    { id: 'A03-0247', breed: 'Brahman Cross', age: 22, weight: 468, adg: 1.42, temp: 38.6, days: 84, status: 'ok' },
    { id: 'A03-0112', breed: 'Limousin', age: 20, weight: 512, adg: 1.55, temp: 38.4, days: 96, status: 'ok' },
    { id: 'A03-0305', breed: 'Sapi Bali', age: 24, weight: 318, adg: 0.74, temp: 39.7, days: 61, status: 'warn' },
    { id: 'A03-0189', breed: 'Simental', age: 19, weight: 436, adg: 1.28, temp: 38.9, days: 72, status: 'ok' },
    { id: 'A03-0071', breed: 'Peranakan Ongole', age: 21, weight: 398, adg: 1.06, temp: 38.5, days: 55, status: 'ok' }
  ];

  const fmt = function (n, d) { return n.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d }); };
  const list = document.getElementById('dashList');
  const detail = document.getElementById('dashDetail');
  let current = 0;

  /* ---------- Daftar sapi ---------- */
  list.innerHTML = COWS.map(function (c, i) {
    const badge = c.status === 'ok' ? '<span class="status status--ok">Sehat</span>' : '<span class="status status--warn">Observasi</span>';
    return '<button class="cow-row" role="option" data-i="' + i + '" data-cursor="Lihat">' +
      '<span><span class="cow-row__id">' + c.id + '</span><span class="cow-row__breed">' + c.breed + '</span></span>' + badge + '</button>';
  }).join('');
  const rows = Array.prototype.slice.call(list.children);
  rows.forEach(function (r) {
    r.addEventListener('click', function () { select(+r.getAttribute('data-i')); });
  });

  function history(c) {
    // riwayat bobot 8 minggu terakhir (ilustratif)
    const pts = [];
    for (let w = 7; w >= 0; w--) pts.push(c.weight - c.adg * 7 * w + Math.sin(w * 1.7 + c.weight) * 3);
    return pts;
  }

  function select(i, scanned) {
    current = i;
    const c = COWS[i];
    rows.forEach(function (r, k) {
      r.classList.toggle('is-active', k === i);
      r.setAttribute('aria-selected', k === i ? 'true' : 'false');
    });
    if (scanned) {
      rows[i].classList.remove('is-scanned');
      void rows[i].offsetWidth;
      rows[i].classList.add('is-scanned');
    }
    const h = history(c);
    const min = Math.min.apply(null, h), max = Math.max.apply(null, h);
    const d = h.map(function (v, k) {
      const x = (k / (h.length - 1)) * 200;
      const y = 40 - ((v - min) / (max - min || 1)) * 34 - 3;
      return (k ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ');
    const badge = c.status === 'ok' ? '<span class="status status--ok">Sehat</span>' : '<span class="status status--warn">Observasi · suhu tinggi</span>';

    detail.innerHTML =
      '<div class="detail__head"><div><div class="detail__id">#' + c.id + '</div><div class="detail__breed">' + c.breed + '</div></div>' + badge + '</div>' +
      '<div class="detail__weight">' + fmt(c.weight, 0) + '<small>kg</small></div>' +
      '<svg class="detail__spark" viewBox="0 0 200 40" preserveAspectRatio="none"><path d="' + d + '"/></svg>' +
      '<div class="detail__grid">' +
        '<div><span>ADG</span><b>' + fmt(c.adg, 2) + ' kg/hari</b></div>' +
        '<div><span>Suhu tubuh</span><b>' + fmt(c.temp, 1) + ' °C</b></div>' +
        '<div><span>Umur</span><b>' + c.age + ' bulan</b></div>' +
        '<div><span>Hari di kandang</span><b>' + c.days + ' hari</b></div>' +
      '</div>';
    if (window.gsap) gsap.fromTo(detail.children, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power3.out' });
  }
  select(0);

  /* ---------- Pindai RFID ---------- */
  const scanner = dash.querySelector('.dash__scanner');
  document.getElementById('dashScan').addEventListener('click', function () {
    scanner.classList.add('is-on');
    setTimeout(function () {
      scanner.classList.remove('is-on');
      let next = current;
      while (next === current) next = Math.floor(Math.random() * COWS.length);
      select(next, true);
    }, 1300);
  });

  /* ---------- KPI kandang ---------- */
  const kpi = {
    temp: { el: dash.querySelector('[data-kpi="temp"]'), v: 27.8, min: 27.2, max: 28.6, step: 0.2, d: 1 },
    hum: { el: dash.querySelector('[data-kpi="hum"]'), v: 71, min: 67, max: 75, step: 1, d: 0 },
    adg: { el: dash.querySelector('[data-kpi="adg"]'), v: 1.31, min: 1.27, max: 1.35, step: 0.01, d: 2 }
  };
  function jitterKpis() {
    Object.keys(kpi).forEach(function (k) {
      const o = kpi[k];
      if (Math.random() < 0.45) return;
      o.v = Math.min(o.max, Math.max(o.min, o.v + (Math.random() < 0.5 ? -1 : 1) * o.step));
      o.el.textContent = fmt(o.v, o.d);
      o.el.classList.add('flash');
      setTimeout(function () { o.el.classList.remove('flash'); }, 600);
    });
  }

  /* ---------- Grafik konsumsi pakan (streaming) ---------- */
  const svg = document.getElementById('dashChart');
  const gridG = svg.querySelector('.dash__grid');
  const lineP = document.getElementById('dashLinePath');
  const areaP = document.getElementById('dashAreaPath');
  const dot = document.getElementById('dashDot');
  const nowEl = document.getElementById('dashNow');
  const N = 40;
  let t = 0;
  const data = [];
  function sample() {
    t += 1;
    return 215 + Math.sin(t * 0.22) * 28 + Math.sin(t * 0.9) * 9 + (Math.random() - 0.5) * 14;
  }
  for (let k = 0; k < N; k++) data.push(sample());

  let W = 400, H = 110;
  // garis & area dipotong di tepi kanan agar data baru "masuk" dengan mulus
  const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  clip.id = 'dashClip';
  clip.innerHTML = '<rect x="0" y="-10" width="400" height="140"/>';
  svg.querySelector('defs').appendChild(clip);
  lineP.setAttribute('clip-path', 'url(#dashClip)');
  areaP.setAttribute('clip-path', 'url(#dashClip)');

  function size() {
    W = svg.clientWidth || 400;
    H = svg.clientHeight || 110;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    clip.firstChild.setAttribute('width', W);
    clip.firstChild.setAttribute('height', H + 20);
    gridG.innerHTML = [0.25, 0.5, 0.75].map(function (f) {
      return '<line x1="0" x2="' + W + '" y1="' + (H * f) + '" y2="' + (H * f) + '"/>';
    }).join('');
    draw(0);
  }

  function draw(shift) {
    const min = 160, max = 270;
    const stepX = W / (N - 2);
    let d = '';
    const pts = data.map(function (v, k) {
      return [(k - shift) * stepX, H - ((v - min) / (max - min)) * (H - 10) - 5];
    });
    pts.forEach(function (p, k) {
      if (k === 0) { d += 'M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1); return; }
      const prev = pts[k - 1];
      const cx = (prev[0] + p[0]) / 2;
      d += ' C' + cx.toFixed(1) + ' ' + prev[1].toFixed(1) + ' ' + cx.toFixed(1) + ' ' + p[1].toFixed(1) + ' ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    });
    lineP.setAttribute('d', d);
    const last = pts[pts.length - 1];
    areaP.setAttribute('d', d + ' L' + last[0].toFixed(1) + ' ' + H + ' L' + pts[0][0].toFixed(1) + ' ' + H + ' Z');
    // titik "sekarang" selalu di tepi kanan, mengikuti kurva
    const a = pts[pts.length - 2][1], b = last[1];
    const e = shift * shift * (3 - 2 * shift);
    dot.setAttribute('cx', W);
    dot.setAttribute('cy', a + (b - a) * e);
  }

  /* ---------- Loop animasi, hanya saat terlihat ---------- */
  let visible = false;
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0.1 }).observe(dash);

  const STEP_MS = 1100;
  let last = performance.now();
  let lastKpi = last;
  function loop(now) {
    requestAnimationFrame(loop);
    if (!visible) { last = now; return; }
    const p = (now - last) / STEP_MS;
    if (p >= 1) {
      data.shift();
      data.push(sample());
      last = now;
      nowEl.textContent = fmt(data[data.length - 1], 0) + ' kg/jam';
      draw(0);
    } else {
      draw(p);
    }
    if (now - lastKpi > 2400) { lastKpi = now; jitterKpis(); }
  }
  size();
  nowEl.textContent = fmt(data[data.length - 1], 0) + ' kg/jam';
  window.addEventListener('resize', size);
  requestAnimationFrame(loop);
})();
