/* Peta titik (dot-matrix) Indonesia dengan penanda lokasi operasional.
   TODO: ganti daftar LOCATIONS dengan lokasi operasional resmi. */
(function () {
  const canvas = document.getElementById('mapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const tooltip = document.getElementById('mapTooltip');
  const listEl = document.getElementById('mapList');
  const mapEl = document.getElementById('map');

  const BOUNDS = { lonMin: 94.6, lonMax: 141.4, latMax: 7.4, latMin: -11.4 };

  // Garis pantai yang disederhanakan [lon, lat]
  const ISLANDS = [
    // Sumatra
    [[95.3,5.6],[96.5,5.2],[97.5,5.2],[98.3,4.2],[98.7,3.8],[99.8,3.0],[100.5,2.2],[101.4,1.8],[102.5,1.2],[103.4,0.6],[103.8,-0.5],[104.4,-1.3],[104.9,-2.3],[105.6,-3.0],[105.9,-4.0],[105.8,-5.8],[105.2,-5.8],[104.6,-5.9],[104.0,-5.3],[103.0,-4.4],[102.3,-3.8],[101.3,-2.8],[100.8,-1.8],[100.3,-0.9],[99.6,0.2],[99.0,1.2],[98.6,1.9],[97.8,2.4],[97.2,3.3],[96.4,4.0],[95.8,4.6],[95.2,5.3]],
    // Bangka & Belitung
    [[105.1,-1.6],[106.0,-1.7],[106.8,-2.9],[106.1,-3.1],[105.5,-2.4]],
    [[107.6,-2.6],[108.3,-2.6],[108.3,-3.2],[107.6,-3.2]],
    // Jawa
    [[105.2,-6.8],[106.1,-6.0],[106.8,-6.05],[107.5,-6.2],[108.3,-6.25],[108.6,-6.7],[109.1,-6.85],[110.4,-6.9],[110.7,-6.45],[111.4,-6.7],[112.0,-6.85],[112.7,-7.2],[113.2,-7.7],[114.0,-7.65],[114.45,-7.9],[114.5,-8.7],[113.5,-8.4],[112.6,-8.4],[111.1,-8.25],[110.3,-8.05],[109.0,-7.75],[108.6,-7.75],[107.5,-7.5],[106.5,-7.05],[105.5,-6.9]],
    // Madura
    [[112.7,-6.9],[114.1,-6.9],[114.1,-7.15],[112.8,-7.2]],
    // Bali, Lombok, Sumbawa, Sumba, Flores, Timor
    [[114.45,-8.1],[115.2,-8.05],[115.7,-8.4],[115.2,-8.8],[114.5,-8.4]],
    [[115.85,-8.3],[116.4,-8.2],[116.7,-8.5],[116.4,-8.9],[115.9,-8.8]],
    [[116.8,-8.4],[117.5,-8.1],[118.2,-8.3],[118.8,-8.2],[119.1,-8.5],[118.7,-8.8],[118.0,-8.9],[117.2,-9.0],[116.8,-8.8]],
    [[118.9,-9.4],[119.8,-9.3],[120.8,-9.9],[120.1,-10.3],[119.0,-9.8]],
    [[119.8,-8.4],[120.8,-8.3],[121.8,-8.5],[122.9,-8.2],[123.0,-8.5],[121.8,-8.9],[120.5,-8.8],[119.8,-8.7]],
    [[123.5,-10.2],[124.5,-9.5],[125.5,-9.0],[127.0,-8.4],[126.8,-8.7],[125.2,-9.4],[124.0,-10.3],[123.5,-10.4]],
    // Kalimantan
    [[109.1,1.8],[109.6,2.1],[110.3,1.7],[111.2,2.2],[112.5,3.0],[113.3,3.3],[114.0,4.5],[114.9,4.9],[115.6,5.5],[116.1,6.1],[116.8,7.0],[117.6,6.4],[118.1,5.8],[119.2,5.3],[118.3,4.6],[117.8,4.1],[117.6,3.3],[118.0,2.3],[118.9,1.1],[118.0,0.8],[117.5,0.0],[117.3,-0.8],[116.8,-1.4],[116.5,-2.4],[116.3,-3.3],[116.0,-4.0],[115.2,-3.9],[114.6,-3.6],[113.6,-3.2],[112.5,-3.4],[111.7,-3.0],[110.9,-3.0],[110.2,-2.9],[110.1,-1.9],[109.5,-1.0],[109.1,-0.2],[108.9,0.6],[109.0,1.2]],
    // Sulawesi
    [[125.2,1.6],[124.3,1.0],[123.0,0.95],[121.8,1.0],[120.8,1.2],[120.0,0.7],[119.8,0.0],[119.7,-0.8],[119.4,-1.5],[119.0,-2.6],[118.8,-3.1],[119.3,-3.6],[119.6,-4.2],[119.4,-5.1],[119.5,-5.6],[120.4,-5.6],[120.3,-4.6],[120.4,-3.8],[120.3,-3.0],[120.9,-3.4],[121.4,-3.6],[121.7,-4.4],[122.3,-4.9],[122.9,-4.5],[122.5,-3.9],[122.2,-3.3],[121.7,-2.6],[121.4,-1.9],[122.0,-1.5],[122.8,-1.1],[123.4,-0.9],[122.6,-0.6],[121.5,-0.9],[120.8,-1.3],[120.6,-0.6],[121.2,0.4],[122.5,0.45],[123.8,0.35],[124.5,0.5],[125.0,1.1]],
    // Buton
    [[122.6,-4.7],[123.2,-4.6],[123.2,-5.6],[122.7,-5.5]],
    // Halmahera, Seram, Buru
    [[127.5,2.2],[128.0,1.5],[128.7,1.0],[128.2,0.6],[127.9,0.3],[128.4,-0.3],[128.0,-0.9],[127.6,-0.5],[127.4,0.5],[127.7,1.2],[127.4,1.8]],
    [[127.9,-2.9],[129.0,-2.8],[130.8,-3.1],[130.5,-3.6],[129.5,-3.4],[128.2,-3.5]],
    [[125.9,-3.2],[126.8,-3.1],[127.2,-3.5],[126.5,-3.8],[126.0,-3.6]],
    // Papua
    [[130.9,-0.9],[131.9,-0.5],[132.9,-0.4],[134.0,-0.8],[134.3,-2.0],[134.7,-3.0],[135.4,-3.3],[136.0,-2.6],[137.2,-1.6],[138.2,-1.6],[139.2,-2.1],[140.2,-2.4],[141.0,-2.6],[141.0,-9.1],[140.1,-8.2],[139.0,-8.1],[138.2,-8.4],[137.8,-7.3],[138.6,-6.6],[138.0,-5.3],[137.0,-4.9],[135.8,-4.5],[134.8,-4.1],[133.8,-3.8],[133.0,-4.0],[132.6,-3.4],[132.0,-2.9],[132.8,-2.3],[132.0,-2.1],[131.3,-1.5]]
  ];

  const TYPES = {
    hq: { label: 'Kantor Pusat', color: '#f2c66d' },
    feedlot: { label: 'Feedlot & Pakan', color: '#d9a441' },
    breeding: { label: 'Pembibitan', color: '#9bbfa5' },
    olah: { label: 'Pengolahan', color: '#d9774b' },
    mitra: { label: 'Kemitraan', color: '#f2ebdd' }
  };

  const LOCATIONS = [
    { name: 'Jakarta', region: 'DKI Jakarta', type: 'hq', lon: 106.83, lat: -6.2, desc: 'Kantor pusat holding: strategi, keuangan, dan pengembangan bisnis grup.' },
    { name: 'Lampung Tengah', region: 'Lampung', type: 'feedlot', lon: 105.25, lat: -4.85, desc: 'Kawasan feedlot terpadu dan pabrik pakan konsentrat.' },
    { name: 'Subang', region: 'Jawa Barat', type: 'olah', lon: 107.76, lat: -6.57, desc: 'RPH modern bersertifikat halal, pelayuan, dan cold storage.' },
    { name: 'Boyolali', region: 'Jawa Tengah', type: 'breeding', lon: 110.6, lat: -7.53, desc: 'Pusat pembibitan dan layanan inseminasi buatan.' },
    { name: 'Malang', region: 'Jawa Timur', type: 'mitra', lon: 112.63, lat: -7.98, desc: 'Sentra kemitraan peternak rakyat dan titik kumpul ternak.' },
    { name: 'Bima', region: 'Nusa Tenggara Barat', type: 'breeding', lon: 118.72, lat: -8.46, desc: 'Pembibitan sapi Bali dan kemitraan peternak lokal.' },
    { name: 'Kupang', region: 'Nusa Tenggara Timur', type: 'breeding', lon: 123.6, lat: -10.17, desc: 'Breeding center untuk pasokan bakalan Indonesia Timur.' },
    { name: 'Bone', region: 'Sulawesi Selatan', type: 'mitra', lon: 120.2, lat: -4.54, desc: 'Program kemitraan dan pendampingan peternak Sulawesi.' },
    { name: 'Deli Serdang', region: 'Sumatra Utara', type: 'feedlot', lon: 98.8, lat: 3.45, desc: 'Feedlot regional untuk pasar Sumatra bagian utara.' },
    { name: 'Penajam Paser Utara', region: 'Kalimantan Timur', type: 'olah', lon: 116.6, lat: -1.25, desc: 'Integrasi sawit–sapi dan distribusi untuk kawasan IKN.' }
  ];
  const HQ = LOCATIONS[0];

  /* ---------- Titik daratan ---------- */
  function inside(pt, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  const STEP = 0.3;
  const dots = [];
  for (let lat = BOUNDS.latMax; lat >= BOUNDS.latMin; lat -= STEP) {
    for (let lon = BOUNDS.lonMin; lon <= BOUNDS.lonMax; lon += STEP) {
      for (let k = 0; k < ISLANDS.length; k++) {
        if (inside([lon, lat], ISLANDS[k])) { dots.push({ lon: lon, lat: lat, seed: Math.random() }); break; }
      }
    }
  }

  /* ---------- Ukuran & proyeksi ---------- */
  let W = 0, H = 0, DPR = 1;
  function project(lon, lat) {
    return [
      ((lon - BOUNDS.lonMin) / (BOUNDS.lonMax - BOUNDS.lonMin)) * W,
      ((BOUNDS.latMax - lat) / (BOUNDS.latMax - BOUNDS.latMin)) * H
    ];
  }
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    LOCATIONS.forEach(function (l) { const p = project(l.lon, l.lat); l.x = p[0]; l.y = p[1]; });
  }

  /* ---------- Interaksi ---------- */
  let filter = 'all';
  let hover = null;
  let pinned = null;
  let reveal = 0;   // 0 → 1 saat peta pertama kali terlihat
  let started = false;
  let visible = false;

  function isShown(l) { return filter === 'all' || l.type === filter || l.type === 'hq'; }

  function showTooltip(l) {
    if (!l) { tooltip.classList.remove('is-on'); return; }
    const t = TYPES[l.type];
    tooltip.innerHTML = '<small>' + t.label + ' · ' + l.region + '</small><strong>' + l.name + '</strong><p>' + l.desc + '</p>';
    const rect = canvas.getBoundingClientRect();
    const parent = mapEl.getBoundingClientRect();
    let x = rect.left - parent.left + l.x;
    const y = rect.top - parent.top + l.y;
    const half = 130;
    x = Math.max(half, Math.min(parent.width - half, x));
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    tooltip.classList.add('is-on');
  }

  canvas.addEventListener('pointermove', function (e) {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    let best = null, bestD = 22;
    LOCATIONS.forEach(function (l) {
      if (!isShown(l)) return;
      const d = Math.hypot(l.x - mx, l.y - my);
      if (d < bestD) { bestD = d; best = l; }
    });
    if (best !== hover) {
      hover = best;
      canvas.style.cursor = best ? 'pointer' : 'default';
      showTooltip(hover || pinned);
      syncList();
    }
  });
  canvas.addEventListener('pointerleave', function () { hover = null; showTooltip(pinned); syncList(); });
  canvas.addEventListener('click', function () { if (hover) { pinned = hover; syncList(); } });

  /* ---------- Daftar lokasi ---------- */
  listEl.innerHTML = LOCATIONS.map(function (l, i) {
    return '<button class="loc" data-i="' + i + '"><small><i style="--c:' + TYPES[l.type].color + '"></i>' + TYPES[l.type].label + '</small><strong>' + l.name + '</strong></button>';
  }).join('');
  const locBtns = Array.prototype.slice.call(listEl.children);
  locBtns.forEach(function (b) {
    const l = LOCATIONS[+b.getAttribute('data-i')];
    b.addEventListener('mouseenter', function () { hover = l; showTooltip(l); syncList(); });
    b.addEventListener('mouseleave', function () { hover = null; showTooltip(pinned); syncList(); });
    b.addEventListener('click', function () { pinned = pinned === l ? null : l; showTooltip(pinned || l); syncList(); });
  });
  function syncList() {
    const focus = hover || pinned;
    locBtns.forEach(function (b) {
      const l = LOCATIONS[+b.getAttribute('data-i')];
      b.classList.toggle('is-active', l === focus);
      b.classList.toggle('is-dim', !isShown(l));
    });
  }

  document.querySelectorAll('#mapFilters .chip').forEach(function (chip, _, all) {
    chip.addEventListener('click', function () {
      filter = chip.getAttribute('data-type');
      all.forEach(function (c) {
        c.classList.toggle('is-active', c === chip);
        c.setAttribute('aria-selected', c === chip ? 'true' : 'false');
      });
      if (pinned && !isShown(pinned)) { pinned = null; showTooltip(null); }
      syncList();
    });
  });

  /* ---------- Render ---------- */
  function arc(a, b) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    return { cx: mx, cy: my - dist * 0.35 };
  }
  function qPoint(a, c, b, t) {
    const u = 1 - t;
    return [u * u * a.x + 2 * u * t * c.cx + t * t * b.x, u * u * a.y + 2 * u * t * c.cy + t * t * b.y];
  }

  function render(time) {
    requestAnimationFrame(render);
    if (!visible) return;
    const t = time / 1000;
    if (started && reveal < 1) reveal = Math.min(1, reveal + 0.012);
    ctx.clearRect(0, 0, W, H);

    // titik daratan dengan efek sapuan barat → timur
    const r = Math.max(1, (W / ((BOUNDS.lonMax - BOUNDS.lonMin) / STEP)) * 0.3);
    const sweep = BOUNDS.lonMin + reveal * (BOUNDS.lonMax - BOUNDS.lonMin + 6);
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const k = Math.max(0, Math.min(1, (sweep - d.lon) / 6));
      if (k <= 0) continue;
      const p = project(d.lon, d.lat);
      const tw = 0.55 + 0.25 * Math.sin(t * 1.3 + d.seed * 30);
      ctx.globalAlpha = k * tw * 0.55;
      ctx.fillStyle = '#9bbfa5';
      ctx.beginPath();
      ctx.arc(p[0], p[1], r * (0.8 + k * 0.2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (reveal < 0.5) return;
    const a2 = Math.min(1, (reveal - 0.5) * 2);
    const focus = hover || pinned;

    // busur dari kantor pusat
    LOCATIONS.forEach(function (l, idx) {
      if (l === HQ || !isShown(l)) return;
      const c = arc(HQ, l);
      ctx.beginPath();
      ctx.moveTo(HQ.x, HQ.y);
      ctx.quadraticCurveTo(c.cx, c.cy, l.x, l.y);
      ctx.strokeStyle = l === focus ? 'rgba(242,198,109,0.85)' : 'rgba(242,198,109,0.22)';
      ctx.lineWidth = l === focus ? 1.6 : 1;
      ctx.setLineDash([3, 5]);
      ctx.lineDashOffset = -t * 14;
      ctx.globalAlpha = a2;
      ctx.stroke();
      ctx.setLineDash([]);
      // cahaya yang bergerak di sepanjang busur
      const pt = qPoint(HQ, c, l, (t * 0.35 + idx * 0.13) % 1);
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#fff1cf';
      ctx.fill();
    });

    // penanda lokasi
    LOCATIONS.forEach(function (l, idx) {
      const shown = isShown(l);
      const col = TYPES[l.type].color;
      const base = l.type === 'hq' ? 7 : 5;
      const isFocus = l === focus;
      ctx.globalAlpha = a2 * (shown ? 1 : 0.18);
      if (shown) {
        const ph = ((t * 0.8 + idx * 0.2) % 1);
        ctx.beginPath();
        ctx.arc(l.x, l.y, base + ph * (isFocus ? 26 : 16), 0, Math.PI * 2);
        ctx.strokeStyle = col;
        ctx.globalAlpha = a2 * (1 - ph) * 0.7;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.globalAlpha = a2;
      }
      ctx.beginPath();
      ctx.arc(l.x, l.y, isFocus ? base + 3 : base, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(l.x, l.y, (isFocus ? base + 3 : base) * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = '#0b1d14';
      ctx.fill();
      if (l.type === 'hq' || isFocus) {
        ctx.font = '600 12px Manrope, sans-serif';
        ctx.fillStyle = '#f2ebdd';
        ctx.textAlign = 'center';
        ctx.fillText(l.name, l.x, l.y + base + 18);
      }
    });
    ctx.globalAlpha = 1;
  }

  new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    if (visible) started = true;
  }, { threshold: 0.2 }).observe(canvas);

  resize();
  window.addEventListener('resize', function () { resize(); if (pinned) showTooltip(pinned); });
  syncList();
  requestAnimationFrame(render);
})();
