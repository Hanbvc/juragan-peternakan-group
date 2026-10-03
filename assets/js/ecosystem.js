/* Diagram ekosistem interaktif: 8 lini bisnis mengorbit holding.
   TODO: sesuaikan nama anak usaha & deskripsi dengan struktur resmi perusahaan. */
(function () {
  const UNITS = [
    {
      id: 'genetika', icon: 'genetika', cat: 'Hulu',
      name: 'Juragan Genetika', sub: 'Pembibitan & Genetika',
      tagline: 'Fondasi genetika unggul untuk sapi Indonesia.',
      desc: 'Mengembangkan indukan dan bakalan berkualitas melalui program pemuliaan terukur, inseminasi buatan, dan seleksi genetik berbasis data.',
      services: ['Inseminasi buatan & transfer embrio', 'Pusat pembibitan sapi lokal & impor', 'Seleksi genetik berbasis rekam data'],
      links: ['feedlot', 'mitra', 'vet']
    },
    {
      id: 'pakan', icon: 'pakan', cat: 'Hulu',
      name: 'Juragan Pakan', sub: 'Pakan & Nutrisi',
      tagline: 'Nutrisi presisi, pertumbuhan maksimal.',
      desc: 'Memproduksi pakan konsentrat dan hijauan olahan dengan formulasi nutrisi yang disesuaikan untuk setiap fase pertumbuhan sapi.',
      services: ['Pabrik pakan konsentrat', 'Silase jagung & hijauan olahan', 'Formulasi ransum oleh ahli nutrisi'],
      links: ['feedlot', 'mitra', 'genetika']
    },
    {
      id: 'feedlot', icon: 'feedlot', cat: 'Tengah',
      name: 'Juragan Feedlot', sub: 'Penggemukan',
      tagline: 'Penggemukan presisi skala industri.',
      desc: 'Mengelola kandang penggemukan modern dengan manajemen ransum, kesehatan, dan kesejahteraan hewan yang terstandar untuk pertambahan bobot optimal.',
      services: ['Kandang koloni modern', 'Manajemen ADG & efisiensi pakan', 'Standar kesejahteraan hewan'],
      links: ['genetika', 'pakan', 'vet', 'rph', 'tech']
    },
    {
      id: 'vet', icon: 'vet', cat: 'Tengah',
      name: 'Juragan Vet', sub: 'Kesehatan Hewan',
      tagline: 'Sehat dari kandang, aman sampai piring.',
      desc: 'Layanan kesehatan hewan terpadu — pencegahan penyakit, vaksinasi, hingga biosekuriti — untuk menjaga populasi tetap sehat dan produktif.',
      services: ['Klinik & dokter hewan lapangan', 'Vaksinasi & program biosekuriti', 'Obat & suplemen ternak'],
      links: ['genetika', 'feedlot', 'mitra']
    },
    {
      id: 'rph', icon: 'rph', cat: 'Hilir',
      name: 'Juragan RPH', sub: 'Pemotongan & Pengolahan',
      tagline: 'Halal, higienis, dan bersertifikat.',
      desc: 'Rumah potong hewan modern berstandar halal dan NKV dengan fasilitas pelayuan, pengolahan karkas, dan rantai dingin terintegrasi.',
      services: ['RPH modern bersertifikat halal', 'Pelayuan & pengolahan karkas', 'Cold storage & blast freezer'],
      links: ['feedlot', 'daging', 'vet']
    },
    {
      id: 'daging', icon: 'daging', cat: 'Hilir',
      name: 'Juragan Daging', sub: 'Distribusi & Ritel',
      tagline: 'Dari kandang ke meja makan.',
      desc: 'Menyalurkan daging sapi segar dan beku ke hotel, restoran, katering, ritel modern, hingga konsumen rumah tangga melalui kanal digital.',
      services: ['Suplai B2B HOREKA & industri', 'Gerai ritel & e-commerce', 'Armada distribusi berpendingin'],
      links: ['rph', 'tech']
    },
    {
      id: 'tech', icon: 'tech', cat: 'Pendukung',
      name: 'Juragan Tech', sub: 'Teknologi Peternakan',
      tagline: 'Peternakan yang digerakkan data.',
      desc: 'Membangun platform digital yang menghubungkan seluruh ekosistem — identitas ternak, sensor kandang, hingga analitik rantai pasok.',
      services: ['RFID ear tag & identitas digital', 'IoT kandang & pemantauan real-time', 'Aplikasi manajemen peternak'],
      links: ['feedlot', 'mitra', 'daging', 'genetika']
    },
    {
      id: 'mitra', icon: 'mitra', cat: 'Pendukung',
      name: 'Juragan Mitra', sub: 'Kemitraan & Pembiayaan',
      tagline: 'Tumbuh bersama peternak rakyat.',
      desc: 'Menghubungkan peternak rakyat ke ekosistem melalui skema kemitraan inti-plasma, akses pembiayaan, jaminan pasar, dan pendampingan.',
      services: ['Skema kemitraan inti-plasma', 'Akses pembiayaan & asuransi ternak', 'Pelatihan & pendampingan teknis'],
      links: ['genetika', 'pakan', 'feedlot', 'tech']
    }
  ];

  const orbit = document.getElementById('ecoOrbit');
  const body = document.getElementById('ecoBody');
  if (!orbit || !body) return;

  const spokesG = document.getElementById('ecoSpokes');
  const linksG = document.getElementById('ecoLinks');
  const idxEl = document.getElementById('ecoIdx');
  const catEl = document.getElementById('ecoCat');
  const timerEl = document.getElementById('ecoTimer');
  const NS = 'http://www.w3.org/2000/svg';
  const C = 300, R = 225;
  const byId = {};
  const nodes = [];
  const spokes = [];

  UNITS.forEach(function (u, i) {
    const a = -Math.PI / 2 + (i / UNITS.length) * Math.PI * 2;
    u.x = C + Math.cos(a) * R;
    u.y = C + Math.sin(a) * R;
    u.index = i;
    byId[u.id] = u;

    const line = document.createElementNS(NS, 'line');
    const inner = 92;
    line.setAttribute('x1', C + Math.cos(a) * inner);
    line.setAttribute('y1', C + Math.sin(a) * inner);
    line.setAttribute('x2', u.x);
    line.setAttribute('y2', u.y);
    line.setAttribute('class', 'eco__spoke');
    spokesG.appendChild(line);
    spokes.push(line);

    const btn = document.createElement('button');
    btn.className = 'eco__node';
    btn.style.left = (u.x / 6) + '%';
    btn.style.top = (u.y / 6) + '%';
    btn.setAttribute('aria-label', u.name + ' — ' + u.sub);
    btn.setAttribute('data-cursor', 'Buka');
    btn.innerHTML = window.JPG_icon(u.icon) + '<span class="eco__node-label">' + u.sub.split(' & ')[0] + '</span>';
    btn.addEventListener('click', function () { stopAuto(); setActive(i); });
    btn.addEventListener('mouseenter', function () { stopAuto(); });
    orbit.appendChild(btn);
    nodes.push(btn);
  });

  let active = -1;
  function setActive(i) {
    if (i === active) return;
    active = (i + UNITS.length) % UNITS.length;
    const u = UNITS[active];

    nodes.forEach(function (n, k) {
      n.classList.toggle('is-active', k === active);
      n.classList.toggle('is-linked', u.links.indexOf(UNITS[k].id) > -1);
    });
    spokes.forEach(function (s, k) { s.classList.toggle('is-active', k === active); });

    // kurva penghubung ke lini bisnis terkait
    linksG.innerHTML = '';
    u.links.forEach(function (id, n) {
      const t = byId[id];
      const mx = (u.x + t.x) / 2, my = (u.y + t.y) / 2;
      const cx = mx + (C - mx) * 0.55, cy = my + (C - my) * 0.55;
      const d = 'M' + u.x + ' ' + u.y + ' Q' + cx + ' ' + cy + ' ' + t.x + ' ' + t.y;
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'eco__link');
      linksG.appendChild(path);
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.transition = 'stroke-dashoffset 0.9s cubic-bezier(.22,1,.36,1) ' + (n * 0.08) + 's';
      requestAnimationFrame(function () { requestAnimationFrame(function () { path.style.strokeDashoffset = 0; }); });

      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('r', 3);
      dot.setAttribute('class', 'eco__link-dot');
      const motion = document.createElementNS(NS, 'animateMotion');
      motion.setAttribute('dur', (2.2 + n * 0.3) + 's');
      motion.setAttribute('repeatCount', 'indefinite');
      motion.setAttribute('path', d);
      dot.appendChild(motion);
      linksG.appendChild(dot);
    });

    idxEl.textContent = String(active + 1).padStart(2, '0') + ' / ' + String(UNITS.length).padStart(2, '0');
    catEl.textContent = u.cat;

    const linkBtns = u.links.map(function (id) {
      return '<button type="button" data-go="' + byId[id].index + '">' + byId[id].sub.split(' & ')[0] + '</button>';
    }).join('');

    body.innerHTML =
      '<div class="eco__panel-icon">' + window.JPG_icon(u.icon) + '</div>' +
      '<h3 class="eco__name">' + u.name + '</h3>' +
      '<p class="eco__sub">' + u.sub + '</p>' +
      '<p class="eco__tagline">“' + u.tagline + '”</p>' +
      '<p class="eco__desc">' + u.desc + '</p>' +
      '<ul class="eco__services">' + u.services.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>' +
      '<div class="eco__links-row"><small>Terhubung ke</small>' + linkBtns + '</div>';

    body.querySelectorAll('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () { stopAuto(); setActive(+b.getAttribute('data-go')); });
    });

    if (window.gsap) {
      gsap.fromTo(body.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.045, ease: 'expo.out' });
    }
    restartTimer();
  }

  /* ---------- Putar otomatis sampai pengguna berinteraksi ---------- */
  const DURATION = 5200;
  let auto = true;
  let inView = false;
  let timerStart = 0;

  function restartTimer() { timerStart = performance.now(); }
  function stopAuto() {
    auto = false;
    timerEl.style.width = '0%';
  }
  function loop(now) {
    requestAnimationFrame(loop);
    if (!auto || !inView) { timerStart = now; return; }
    const p = Math.min((now - timerStart) / DURATION, 1);
    timerEl.style.width = (p * 100) + '%';
    if (p >= 1) setActive(active + 1);
  }

  new IntersectionObserver(function (entries) {
    inView = entries[0].isIntersecting;
    if (inView) restartTimer();
  }, { threshold: 0.35 }).observe(orbit);

  document.getElementById('ecoPrev').addEventListener('click', function () { stopAuto(); setActive(active - 1); });
  document.getElementById('ecoNext').addEventListener('click', function () { stopAuto(); setActive(active + 1); });

  setActive(0);
  requestAnimationFrame(loop);
})();
