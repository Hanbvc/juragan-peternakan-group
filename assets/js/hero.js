/* Hero: padang rumput digital berbasis partikel (Three.js).
   Titik-titik membentuk bukit yang bergelombang tertiup angin,
   dan terangkat mengikuti posisi kursor. */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || !window.THREE) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return; // WebGL tidak tersedia — hero tetap tampil dengan latar gradien
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = window.innerWidth < 768;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  camera.position.set(0, 6.5, 24);
  const lookAt = new THREE.Vector3(0, 1.2, -6);

  /* ---------- Padang partikel ---------- */
  const COLS = isSmall ? 120 : 210;
  const ROWS = isSmall ? 80 : 120;
  const WIDTH = isSmall ? 60 : 90;
  const DEPTH = 62;
  const count = COLS * ROWS;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  let i = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      positions[i * 3] = (c / (COLS - 1) - 0.5) * WIDTH + (Math.random() - 0.5) * 0.18;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = (r / (ROWS - 1)) * DEPTH - 48 + (Math.random() - 0.5) * 0.18;
      seeds[i] = Math.random();
      i++;
    }
  }
  const fieldGeo = new THREE.BufferGeometry();
  fieldGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  fieldGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(999, 999) },
    uMouseStrength: { value: 0 },
    uPixelRatio: { value: DPR },
    uSize: { value: isSmall ? 90 : 84 },
    uColorLow: { value: new THREE.Color('#5a9372') },
    uColorHigh: { value: new THREE.Color('#f2c66d') },
    uColorMouse: { value: new THREE.Color('#fff1cf') }
  };

  const fieldMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uMouseStrength;
      uniform float uPixelRatio;
      uniform float uSize;
      attribute float aSeed;
      varying float vHeight;
      varying float vDepth;
      varying float vSeed;
      varying float vMouse;
      void main() {
        vec3 p = position;
        float t = uTime * 0.32;
        float h = sin(p.x * 0.16 + t) * 0.95
                + cos(p.z * 0.21 + t * 0.8) * 0.75
                + sin((p.x + p.z) * 0.085 + t * 0.6) * 1.25;
        h += sin(p.x * 0.7 + t * 3.2 + aSeed) * cos(p.z * 0.55 + t * 2.4) * 0.14;
        float d = distance(p.xz, uMouse);
        float m = exp(-d * d * 0.045) * uMouseStrength;
        h += m * 2.6;
        p.y += h;
        vHeight = h;
        vSeed = aSeed;
        vMouse = m;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed * 0.6) / -mv.z;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorLow;
      uniform vec3 uColorHigh;
      uniform vec3 uColorMouse;
      uniform float uTime;
      varying float vHeight;
      varying float vDepth;
      varying float vSeed;
      varying float vMouse;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = length(c);
        if (r > 0.5) discard;
        float soft = smoothstep(0.5, 0.05, r);
        float k = smoothstep(-2.2, 3.0, vHeight);
        vec3 col = mix(uColorLow, uColorHigh, k * k);
        col = mix(col, uColorMouse, clamp(vMouse, 0.0, 1.0) * 0.8);
        float twinkle = 0.65 + 0.35 * sin(uTime * 1.6 + vSeed * 40.0);
        float fog = smoothstep(62.0, 14.0, vDepth) * smoothstep(3.0, 9.0, vDepth);
        float alpha = soft * fog * (0.42 + 0.58 * k) * twinkle;
        gl_FragColor = vec4(col, alpha);
      }
    `
  });
  const field = new THREE.Points(fieldGeo, fieldMat);
  scene.add(field);

  /* ---------- Kunang-kunang emas ---------- */
  const FLY = isSmall ? 120 : 260;
  const flyPos = new Float32Array(FLY * 3);
  const flySeed = new Float32Array(FLY);
  for (let j = 0; j < FLY; j++) {
    flyPos[j * 3] = (Math.random() - 0.5) * 70;
    flyPos[j * 3 + 1] = Math.random() * 14;
    flyPos[j * 3 + 2] = -45 + Math.random() * 55;
    flySeed[j] = Math.random();
  }
  const flyGeo = new THREE.BufferGeometry();
  flyGeo.setAttribute('position', new THREE.BufferAttribute(flyPos, 3));
  flyGeo.setAttribute('aSeed', new THREE.BufferAttribute(flySeed, 1));
  const flyMat = new THREE.ShaderMaterial({
    uniforms: { uTime: uniforms.uTime, uPixelRatio: uniforms.uPixelRatio },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute float aSeed;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.y = mod(p.y + uTime * (0.25 + aSeed * 0.5), 14.0);
        p.x += sin(uTime * 0.4 + aSeed * 20.0) * 1.2;
        p.z += cos(uTime * 0.3 + aSeed * 12.0) * 0.8;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vAlpha = smoothstep(0.0, 2.0, p.y) * smoothstep(14.0, 9.0, p.y) * (0.7 + 0.3 * sin(uTime * 2.0 + aSeed * 30.0));
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (80.0 + aSeed * 90.0) * uPixelRatio / -mv.z;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        if (r > 0.5) discard;
        float glow = pow(smoothstep(0.5, 0.0, r), 2.2);
        gl_FragColor = vec4(1.0, 0.82, 0.45, glow * vAlpha);
      }
    `
  });
  scene.add(new THREE.Points(flyGeo, flyMat));

  /* ---------- Interaksi ---------- */
  const pointer = new THREE.Vector2(0, 0);
  const pointerSmooth = new THREE.Vector2(0, 0);
  const raycaster = new THREE.Raycaster();
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.0);
  const hit = new THREE.Vector3();
  const mouseTarget = new THREE.Vector2(999, 999);
  let strengthTarget = 0;
  let scrollY = 0;

  const hero = canvas.closest('.hero');
  hero.addEventListener('pointermove', function (e) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(ground, hit)) {
      mouseTarget.set(hit.x, hit.z);
      strengthTarget = 1;
    }
  });
  hero.addEventListener('pointerleave', function () { strengthTarget = 0; });
  window.addEventListener('scroll', function () { scrollY = window.scrollY; }, { passive: true });

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 768 ? 68 : 55;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* Render hanya saat hero terlihat */
  let visible = true;
  new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
  }).observe(hero);

  const clock = new THREE.Clock();
  let elapsed = 8;
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible) return;
    elapsed += reduceMotion ? dt * 0.15 : dt;
    uniforms.uTime.value = elapsed;

    // kursor halus
    const cur = uniforms.uMouse.value;
    if (cur.x > 900) cur.copy(mouseTarget);
    cur.x += (mouseTarget.x - cur.x) * 0.08;
    cur.y += (mouseTarget.y - cur.y) * 0.08;
    uniforms.uMouseStrength.value += (strengthTarget - uniforms.uMouseStrength.value) * 0.05;

    // paralaks kamera + efek gulir
    pointerSmooth.x += (pointer.x - pointerSmooth.x) * 0.04;
    pointerSmooth.y += (pointer.y - pointerSmooth.y) * 0.04;
    const s = Math.min(scrollY / window.innerHeight, 1.2);
    camera.position.x = pointerSmooth.x * 1.8;
    camera.position.y = 6.5 + pointerSmooth.y * 0.8 + s * 5;
    camera.position.z = 24 - s * 6;
    camera.lookAt(lookAt);

    renderer.render(scene, camera);
  }
  frame();
})();
