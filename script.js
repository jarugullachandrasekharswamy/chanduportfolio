// ─── SCROLL REVEAL (runs first — critical for page visibility) ────────────────
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

// ─── HERO STAGGER ANIMATION ───────────────────────────────────────────────────
const heroEls = document.querySelectorAll('.hero-tag, .hero-name .line1, .hero-name .line2, .hero-name .line3, .hero-subtitle, .hero-ctas, .hero-social');
heroEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  setTimeout(() => {
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, 200 + i * 120);
});

// ─── CUSTOM CURSOR ────────────────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});

function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animRing);
}
animRing();

document.querySelectorAll('a, button, .skill-card, .project-card, .cert-card, .achievement-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '20px'; cursor.style.height = '20px';
    ring.style.width = '56px'; ring.style.height = '56px';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '12px'; cursor.style.height = '12px';
    ring.style.width = '36px'; ring.style.height = '36px';
  });
});

// ─── HERO PHOTO PARALLAX & FLOATING DOTS ──────────────────────────────────────
const heroPhoto = document.getElementById('hero-photo');
const photoDots = document.getElementById('photo-dots');

// Generate floating dots around photo
if (photoDots) {
  for (let i = 0; i < 16; i++) {
    const dot = document.createElement('div');
    dot.className = 'photo-dot';
    const angle = (i / 16) * Math.PI * 2;
    const radius = 140 + Math.random() * 60;
    const cx = 190 + Math.cos(angle) * radius;
    const cy = 190 + Math.sin(angle) * radius;
    dot.style.left = cx + 'px';
    dot.style.top = cy + 'px';
    dot.style.width = (2 + Math.random() * 4) + 'px';
    dot.style.height = dot.style.width;
    dot.style.animationDelay = (Math.random() * 4) + 's';
    dot.style.animationDuration = (3 + Math.random() * 3) + 's';
    photoDots.appendChild(dot);
  }
}

// Cursor-following tilt effect for hero photo
let photoTargetX = 0, photoTargetY = 0;
let photoCurrentX = 0, photoCurrentY = 0;

document.addEventListener('mousemove', e => {
  if (heroPhoto) {
    const centerX = window.innerWidth * 0.75;
    const centerY = window.innerHeight * 0.5;
    photoTargetX = (e.clientX - centerX) / 30;
    photoTargetY = (e.clientY - centerY) / 30;
  }
});

// Smooth photo parallax animation
function animatePhoto() {
  requestAnimationFrame(animatePhoto);
  if (heroPhoto) {
    photoCurrentX += (photoTargetX - photoCurrentX) * 0.08;
    photoCurrentY += (photoTargetY - photoCurrentY) * 0.08;
    heroPhoto.style.transform = `translateY(-50%) translate(${photoCurrentX}px, ${photoCurrentY}px) rotateY(${photoCurrentX * 0.3}deg) rotateX(${-photoCurrentY * 0.3}deg)`;
  }
}
animatePhoto();

// ─── BACKGROUND PARTICLE SYSTEM (Three.js — wrapped in try-catch) ─────────────
try {
  if (typeof THREE === 'undefined') throw new Error('Three.js not loaded');

  const bgCanvas = document.getElementById('bg-canvas');
  const bgRenderer = new THREE.WebGLRenderer({ canvas: bgCanvas, alpha: true, antialias: true });
  bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  bgRenderer.setSize(window.innerWidth, window.innerHeight);

  const bgScene = new THREE.Scene();
  const bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  bgCamera.position.z = 80;

  const pCount = 1400;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pSizes = new Float32Array(pCount);

  for (let i = 0; i < pCount; i++) {
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 80;
    pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z;
    pSizes[i] = Math.random() * 2 + 0.3;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

  const pMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 }
    },
    vertexShader: `
      attribute float size;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uScroll;
      varying float vAlpha;
      void main() {
        vec3 pos = position;
        float dist = length(pos.xy - uMouse * 80.0);
        pos.x += sin(uTime * 0.4 + pos.y * 0.05) * 1.2;
        pos.y += cos(uTime * 0.3 + pos.x * 0.05) * 1.2;
        if (dist < 20.0) {
          float force = (20.0 - dist) / 20.0;
          vec2 dir = normalize(pos.xy - uMouse * 80.0);
          pos.xy += dir * force * 6.0;
        }
        pos.y -= uScroll * 0.02;
        vAlpha = 0.15 + sin(uTime * 0.8 + pos.x * 0.1) * 0.1;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(1.0, 0.82, 0.0, a * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false
  });

  const particles = new THREE.Points(pGeo, pMat);
  bgScene.add(particles);

  document.addEventListener('mousemove', e => {
    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    pMat.uniforms.uMouse.value.set(mouseX, mouseY);
  });

  window.addEventListener('scroll', () => {
    pMat.uniforms.uScroll.value = window.scrollY;
  });

  let t = 0;
  function animateParticles() {
    requestAnimationFrame(animateParticles);
    t += 0.01;
    pMat.uniforms.uTime.value = t;
    particles.rotation.y = t * 0.02;
    bgRenderer.render(bgScene, bgCamera);
  }
  animateParticles();

  window.addEventListener('resize', () => {
    bgCamera.aspect = window.innerWidth / window.innerHeight;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
  });

} catch (e) {
  console.warn('Three.js particle background unavailable:', e.message);
  // Page still works without particles — all other features are independent
}
