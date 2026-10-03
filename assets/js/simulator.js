/* Simulasi penggemukan: estimasi bobot akhir, kebutuhan pakan, dan nilai jual.
   Bersifat ilustratif — lihat catatan di bawah kalkulator. */
(function () {
  const form = document.getElementById('simForm');
  if (!form) return;

  const DMI = 0.027; // konsumsi bahan kering ≈ 2,7% bobot badan per hari
  const X_MAX = 180, Y_MIN = 150, Y_MAX = 820;

  const inputs = {
    count: document.getElementById('simCount'),
    start: document.getElementById('simStart'),
    adg: document.getElementById('simAdg'),
    days: document.getElementById('simDays'),
    price: document.getElementById('simPrice')
  };
  const outs = {
    count: document.getElementById('simCountOut'),
    start: document.getElementById('simStartOut'),
    adg: document.getElementById('simAdgOut'),
    days: document.getElementById('simDaysOut'),
    price: document.getElementById('simPriceOut')
  };
  const el = {
    w0: document.getElementById('simW0'),
    w1: document.getElementById('simW1'),
    gain: document.getElementById('simGain'),
    feed: document.getElementById('simFeed'),
    value: document.getElementById('simValue'),
    valueGain: document.getElementById('simValueGain'),
    axisEnd: document.getElementById('simAxisEnd')
  };

  const nf = function (n, d) { return n.toLocaleString('id-ID', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
  function rupiah(n) {
    if (n >= 1e12) return 'Rp' + nf(n / 1e12, 2) + ' triliun';
    if (n >= 1e9) return 'Rp' + nf(n / 1e9, 2) + ' miliar';
    if (n >= 1e6) return 'Rp' + nf(n / 1e6, n >= 1e8 ? 0 : 1) + ' juta';
    return 'Rp' + nf(n);
  }
  function mass(kg) { return kg >= 1000 ? nf(kg / 1000, 1) + ' ton' : nf(kg) + ' kg'; }

  /* ---------- Siluet sapi ---------- */
  const COW = 'M34 52C34 42 42 36 56 36L138 34C146 26 156 26 162 33C168 36 172 34 176 32L184 30C190 32 196 42 204 56C206 62 202 68 196 68C190 68 184 64 180 60C176 64 172 70 170 78C168 86 162 90 156 90L156 122L146 122L145 96L138 96L137 122L128 122L127 94C108 98 84 98 68 94L66 122L56 122L54 100L49 100L48 122L38 122C36 104 32 84 32 70C32 62 33 56 34 52Z';
  const TAIL = 'M35 50C26 58 24 78 27 96';
  const HORN = 'M182 31C180 22 186 16 194 16';
  const EAR = 'M176 38C168 36 164 40 161 45C168 46 174 44 178 41Z';
  const ghost = document.getElementById('simCowStart');
  const main = document.getElementById('simCowEnd');
  ghost.innerHTML = '<path d="' + COW + '"/><path d="' + TAIL + '"/>';
  main.innerHTML =
    '<path d="' + TAIL + '" fill="none" style="fill:none;stroke:var(--gold);stroke-width:3;stroke-linecap:round"/>' +
    '<ellipse cx="27" cy="100" rx="3.5" ry="6" style="fill:var(--gold)"/>' +
    '<path d="' + COW + '"/>' +
    '<path d="' + EAR + '" style="fill:#c48f2e"/>' +
    '<path d="' + HORN + '" style="fill:none;stroke:var(--cream);stroke-width:4;stroke-linecap:round"/>' +
    '<circle cx="191" cy="44" r="2.4" style="fill:var(--bg-2)"/>' +
    '<path class="cow-detail" d="M198 60l2 1.5"/>' +
    '<path class="cow-detail" d="M145 96L144 106M54 100L53 108"/>';
  const OX = 118, OY = 122;
  function cowScale(w) { return Math.sqrt(w / 760); }
  function placeCow(g, w) {
    const s = cowScale(w);
    g.setAttribute('transform', 'translate(' + OX + ' ' + OY + ') scale(' + s.toFixed(4) + ') translate(' + -OX + ' ' + -OY + ')');
  }

  /* ---------- Grafik pertumbuhan ---------- */
  const chart = document.getElementById('simChart');
  let CW = 520, CH = 150;
  function sizeChart() {
    CW = chart.clientWidth || 520;
    CH = chart.clientHeight || 150;
    chart.setAttribute('viewBox', '0 0 ' + CW + ' ' + CH);
    chart.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }
  const px = function (d) { return (d / X_MAX) * CW; };
  const py = function (w) { return CH - ((w - Y_MIN) / (Y_MAX - Y_MIN)) * CH; };

  function drawChart(s) {
    const x1 = px(s.days), y0 = py(s.start), y1 = py(s.final);
    let grid = '';
    [200, 400, 600, 800].forEach(function (w) {
      grid += '<line x1="0" x2="' + CW + '" y1="' + py(w) + '" y2="' + py(w) + '" stroke="rgba(242,235,221,.1)" stroke-dasharray="3 5"/>' +
        '<text x="' + CW + '" y="' + (py(w) - 5) + '" text-anchor="end" fill="rgba(242,235,221,.4)" font-size="10" font-family="JetBrains Mono, monospace">' + w + ' kg</text>';
    });
    let marks = '';
    for (let d = 30; d < s.days; d += 30) {
      const w = s.start + s.adg * d;
      marks += '<circle cx="' + px(d) + '" cy="' + py(w) + '" r="3" fill="#0b1d14" stroke="#9bbfa5" stroke-width="1.5"/>';
    }
    chart.innerHTML =
      '<defs><linearGradient id="simArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a441" stop-opacity=".4"/><stop offset="1" stop-color="#d9a441" stop-opacity="0"/></linearGradient></defs>' +
      grid +
      '<path d="M0 ' + y0 + ' L' + x1 + ' ' + y1 + ' L' + x1 + ' ' + CH + ' L0 ' + CH + 'Z" fill="url(#simArea)"/>' +
      '<line x1="' + x1 + '" x2="' + x1 + '" y1="' + y1 + '" y2="' + CH + '" stroke="rgba(242,198,109,.6)" stroke-dasharray="3 4"/>' +
      '<path d="M0 ' + y0 + ' L' + x1 + ' ' + y1 + '" stroke="#f2c66d" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      marks +
      '<circle cx="' + x1 + '" cy="' + y1 + '" r="6" fill="#f2c66d"/>' +
      '<circle cx="' + x1 + '" cy="' + y1 + '" r="12" fill="#f2c66d" opacity=".2"/>' +
      '<text x="' + Math.min(x1, CW - 70) + '" y="' + Math.max(y1 - 16, 12) + '" text-anchor="' + (x1 > CW - 70 ? 'end' : 'middle') + '" fill="#f2ebdd" font-size="11" font-family="JetBrains Mono, monospace">Hari ' + s.days + '</text>';
  }

  /* ---------- Perhitungan ---------- */
  function read() {
    const s = {
      count: +inputs.count.value,
      start: +inputs.start.value,
      adg: +inputs.adg.value,
      days: +inputs.days.value,
      price: +inputs.price.value
    };
    s.final = s.start + s.adg * s.days;
    s.gainEach = s.final - s.start;
    s.gainTotal = s.gainEach * s.count;
    s.feed = DMI * ((s.start + s.final) / 2) * s.days * s.count;
    s.value = s.final * s.count * s.price;
    s.valueGain = s.gainTotal * s.price;
    return s;
  }

  // nilai yang ditampilkan dianimasikan menuju target
  const shown = { final: 0, gainTotal: 0, feed: 0, value: 0, valueGain: 0 };
  let target = null;
  let raf = 0;
  function tick() {
    let done = true;
    Object.keys(shown).forEach(function (k) {
      const diff = target[k] - shown[k];
      if (Math.abs(diff) > Math.abs(target[k]) * 0.0005 + 0.01) { shown[k] += diff * 0.18; done = false; }
      else shown[k] = target[k];
    });
    el.w1.textContent = nf(Math.round(shown.final)) + ' kg';
    el.gain.textContent = mass(shown.gainTotal);
    el.feed.textContent = mass(shown.feed);
    el.value.textContent = rupiah(shown.value);
    el.valueGain.textContent = 'Nilai pertambahan bobot: ' + rupiah(shown.valueGain);
    raf = done ? 0 : requestAnimationFrame(tick);
  }

  function update() {
    Object.keys(inputs).forEach(function (k) {
      const i = inputs[k];
      i.style.setProperty('--p', ((i.value - i.min) / (i.max - i.min)) * 100 + '%');
    });
    const s = read();
    outs.count.textContent = nf(s.count) + ' ekor';
    outs.start.textContent = nf(s.start) + ' kg';
    outs.adg.textContent = nf(s.adg, 2) + ' kg/hari';
    outs.days.textContent = s.days + ' hari';
    outs.price.textContent = 'Rp' + nf(s.price) + '/kg';
    el.w0.textContent = nf(s.start) + ' kg';
    el.axisEnd.textContent = 'Hari ' + X_MAX;
    placeCow(ghost, s.start);
    placeCow(main, s.final);
    drawChart(s);
    target = s;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  const PRESETS = {
    rakyat: { count: 5, start: 250, adg: 0.8, days: 120, price: 55000 },
    menengah: { count: 50, start: 300, adg: 1.1, days: 100, price: 55000 },
    industri: { count: 400, start: 350, adg: 1.5, days: 110, price: 55000 }
  };
  const presetBtns = form.querySelectorAll('[data-preset]');
  presetBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      const p = PRESETS[b.getAttribute('data-preset')];
      Object.keys(p).forEach(function (k) { inputs[k].value = p[k]; });
      presetBtns.forEach(function (x) { x.classList.toggle('is-active', x === b); });
      update();
    });
  });
  Object.keys(inputs).forEach(function (k) {
    inputs[k].addEventListener('input', function () {
      presetBtns.forEach(function (x) { x.classList.remove('is-active'); });
      update();
    });
  });

  sizeChart();
  const s0 = read();
  Object.keys(shown).forEach(function (k) { shown[k] = s0[k]; });
  update();
  window.addEventListener('resize', function () { sizeChart(); drawChart(read()); });
})();
