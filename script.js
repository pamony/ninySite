/* =============================================
   NINA'S BIRTHDAY — script.js
   Interactive logic: confetti, fireworks,
   flip cards, cursor, nav, scroll reveals,
   haptic feedback, live counter
   ============================================= */

// =============================================
// HAPTIC FEEDBACK (mobile vibration)
// =============================================
function haptic(pattern = [30]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

// =============================================
// LOCAL MUSIC PLAYER — "Perfect" Ed Sheeran
// =============================================
let musicPlaying = false;

function toggleMusic(forcePlay = false) {
  const bgMusic = document.getElementById('bg-music');
  const btn = document.getElementById('music-btn');
  const playIcon = btn.querySelector('.playing-icon');
  const pauseIcon = btn.querySelector('.paused-icon');

  if (!bgMusic) return;

  // Add error listener once
  if (!bgMusic.onerror) {
    bgMusic.onerror = () => {
      console.error("Audio file not found or failed to load.");
      btn.title = "Music file missing";
    };
  }

  if (musicPlaying && !forcePlay) {
    bgMusic.pause();
    musicPlaying = false;
    btn.classList.remove('is-playing');
    playIcon.style.display = '';
    pauseIcon.style.display = 'none';
  } else {
    bgMusic.play().then(() => {
      musicPlaying = true;
      btn.classList.add('is-playing');
      playIcon.style.display = 'none';
      pauseIcon.style.display = '';
      haptic([30, 20, 30]);
    }).catch(err => {
      console.warn("Autoplay blocked. Click the button to start music.", err);
    });
  }
}

// =============================================
// CUSTOM CURSOR
// =============================================
const cursorEl = document.getElementById('cursor-sparkle');
const trailParticles = [];

document.addEventListener('mousemove', (e) => {
  cursorEl.style.left = e.clientX + 'px';
  cursorEl.style.top  = e.clientY + 'px';
  spawnTrailDot(e.clientX, e.clientY);
});

function spawnTrailDot(x, y) {
  const dot = document.createElement('div');
  dot.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: ${Math.random() * 6 + 3}px;
    height: ${Math.random() * 6 + 3}px;
    border-radius: 50%;
    background: hsl(${30 + Math.random() * 20}, 100%, 65%);
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%);
    transition: opacity 0.6s ease, transform 0.6s ease;
  `;
  document.body.appendChild(dot);
  setTimeout(() => {
    dot.style.opacity = '0';
    dot.style.transform = `translate(-50%, -50%) scale(0)`;
  }, 50);
  setTimeout(() => dot.remove(), 650);
}

// =============================================
// FLOATING BACKGROUND PARTICLES
// =============================================
function createParticles() {
  const container = document.getElementById('particles-container');
  const count = 25;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 4 + 2;
    const left = Math.random() * 100;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 10;
    const colors = ['#ff9800', '#ffa726', '#ffcc80', '#fb8c00', '#ffe0b2'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      bottom: ${Math.random() * 20}%;
      background: ${color};
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
    `;
    container.appendChild(p);
  }
}
createParticles();

// =============================================
// CONFETTI ENGINE
// =============================================
const canvas = document.getElementById('confetti-canvas');
const ctx    = canvas.getContext('2d');
let confettiPieces = [];
let confettiActive = false;
let animationId;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const CONFETTI_COLORS = [
  '#ff9800', '#ffa726', '#ffcc80', '#fb8c00',
  '#fff3e0', '#ffe0b2', '#ffffff', '#f57c00'
];

class ConfettiPiece {
  constructor(x, y) {
    this.x = x ?? Math.random() * canvas.width;
    this.y = y ?? -10;
    this.size = Math.random() * 10 + 5;
    this.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    this.speedX = (Math.random() - 0.5) * 6;
    this.speedY = Math.random() * 4 + 2;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.15;
    this.opacity = 1;
    this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
    this.life = 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.05; // gravity
    this.rotation += this.rotationSpeed;
    this.life -= 0.005;
    this.opacity = this.life;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.fillStyle = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    if (this.shape === 'rect') {
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function launchConfettiBurst(x, y, count = 80) {
  for (let i = 0; i < count; i++) {
    confettiPieces.push(new ConfettiPiece(x, y));
  }
}

function rainConfetti(duration = 3000) {
  confettiActive = true;
  const end = Date.now() + duration;
  const rain = () => {
    if (Date.now() < end) {
      for (let i = 0; i < 5; i++) {
        confettiPieces.push(new ConfettiPiece(Math.random() * canvas.width, -10));
      }
      requestAnimationFrame(rain);
    } else {
      confettiActive = false;
    }
  };
  rain();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiPieces = confettiPieces.filter(p => p.life > 0 && p.y < canvas.height + 50);
  confettiPieces.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateConfetti);
}
animateConfetti();

// =============================================
// FIREWORKS ENGINE
// =============================================
class FireworkParticle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1;
    this.size = Math.random() * 4 + 2;
  }

  update() {
    this.x  += this.vx;
    this.y  += this.vy;
    this.vy += 0.1; // gravity
    this.vx *= 0.98;
    this.life -= 0.018;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

let fireworkParticles = [];

function launchFireworks() {
  const btn = document.getElementById('fireworks-btn');
  btn.textContent = '🎆 Boom!';
  haptic([100, 50, 100, 50, 200, 50, 300]); // dramatic firework haptic
  setTimeout(() => btn.textContent = '🎆 Launch Fireworks!', 2000);

  const colors = ['#ff9800', '#ffa726', '#fff3e0', '#fb8c00', '#ffffff', '#ffcc80'];
  const count = 8;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * (canvas.height * 0.6) + 50;
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let j = 0; j < 80; j++) {
        fireworkParticles.push(new FireworkParticle(x, y, color));
      }
    }, i * 200);
  }

  rainConfetti(3500);
  animateFireworks();
}

function animateFireworks() {
  fireworkParticles = fireworkParticles.filter(p => p.life > 0);
  fireworkParticles.forEach(p => { p.update(); p.draw(); });
  if (fireworkParticles.length > 0) requestAnimationFrame(animateFireworks);
}

// =============================================
// CELEBRATION TRIGGER (CTA button)
// =============================================
function startCelebration() {
  haptic([50, 30, 50, 30, 100]); // celebratory vibration pattern
  launchConfettiBurst(canvas.width / 2, canvas.height / 3, 150);
  rainConfetti(4000);

  // Start Music (Autoplay fix)
  toggleMusic(true);

  // Scroll to next section smoothly
  setTimeout(() => {
    document.getElementById('message').scrollIntoView({ behavior: 'smooth' });
  }, 800);
}

// =============================================
// FLIP CARDS
// =============================================
let flippedCount = 0;
const totalCards = 10;

function flipCard(card) {
  if (card.classList.contains('flipped')) return;
  card.classList.add('flipped');
  flippedCount++;

  haptic([40]); // short pulse on each flip

  // Small confetti burst on flip
  const rect = card.getBoundingClientRect();
  launchConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 30);

  document.getElementById('cards-count').textContent = flippedCount;

  // If all cards flipped, celebrate with stronger haptic!
  if (flippedCount === totalCards) {
    haptic([80, 40, 80, 40, 200]);
    setTimeout(() => {
      rainConfetti(3000);
      launchConfettiBurst(canvas.width / 2, canvas.height / 2, 120);
    }, 500);
  }
}

// =============================================
// PHOTO GALLERY — click to enlarge
// =============================================
document.querySelectorAll('.photo-card').forEach(card => {
  card.addEventListener('click', () => {
    const img = card.querySelector('img');
    const video = card.querySelector('.gallery-video');
    const caption = card.dataset.caption;

    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbVid = document.getElementById('lightbox-video');
    
    // Hide both initially
    lbImg.style.display = 'none';
    lbVid.style.display = 'none';
    lbVid.pause();

    if (video) {
      lbVid.src = video.src;
      lbVid.style.display = 'block';
      lbVid.play();
    } else if (img) {
      lbImg.src = img.src;
      lbImg.style.display = 'block';
    } else {
      return; // placeholder
    }

    document.getElementById('lightbox-caption').textContent = caption;
    lightbox.classList.add('open');
  });
});

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lbVid = document.getElementById('lightbox-video');
  lightbox.classList.remove('open');
  lbVid.pause();
  lbVid.src = ""; // Clear src to stop loading
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// =============================================
// SHARE FUNCTIONS
// =============================================
function shareWhatsApp() {
  const text = encodeURIComponent(
    "🎂 It's Nina's Birthday! Check out this special page made just for her! 🧡✨"
  );
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

function copyLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('copy-btn');
    const original = btn.innerHTML;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
    btn.style.color = '#ff9800';
    btn.style.borderColor = '#ff9800';
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 2500);
  });
}

// =============================================
// NAVIGATION DOTS — active on scroll
// =============================================
const sections  = document.querySelectorAll('.section');
const navDots   = document.querySelectorAll('.nav-dots .dot');

const sectionIds = ['hero', 'message', 'gallery', 'cards', 'finale'];

const observerOpts = { threshold: 0.5 };
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = sectionIds.indexOf(entry.target.id);
      navDots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }
  });
}, observerOpts);

sections.forEach(s => sectionObserver.observe(s));

// =============================================
// SCROLL REVEAL ANIMATIONS
// =============================================
const revealEls = document.querySelectorAll(
  '.section-tag, .section-title, .section-subtitle, .letter-container, .gallery-grid, .cards-grid, .cards-progress, .finale-ring, .finale-title, .finale-text, .finale-love, .fire-btn, .share-section'
);

revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${i * 0.05}s`;
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

// =============================================
// CLICK ANYWHERE FOR SPARKLE BURST
// =============================================
document.addEventListener('click', (e) => {
  // Only spawn small burst, not on buttons
  if (e.target.tagName === 'BUTTON') return;
  launchConfettiBurst(e.clientX, e.clientY, 20);
});

// =============================================
// INITIAL PAGE LOAD — welcome burst
// =============================================
window.addEventListener('load', () => {
  setTimeout(() => {
    launchConfettiBurst(canvas.width / 2, canvas.height * 0.3, 60);
  }, 1200);
});

// =============================================
// LIVE "TOGETHER SINCE" COUNTER
// =============================================
// ⚠️  UPDATE THIS DATE to when you two started dating!
// Format: 'YYYY-MM-DDTHH:MM:SS'
const TOGETHER_SINCE = new Date('2025-08-03T00:00:00');

function updateCounter() {
  const now  = new Date();
  const diff = now - TOGETHER_SINCE; // milliseconds

  if (diff < 0) return; // date is in the future, skip

  const totalSeconds = Math.floor(diff / 1000);
  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const el = document.getElementById('counter-display');
  if (el) {
    el.innerHTML = `
      <span class="counter-unit"><strong>${days}</strong><small>days</small></span>
      <span class="counter-sep">:</span>
      <span class="counter-unit"><strong>${String(hours).padStart(2,'0')}</strong><small>hours</small></span>
      <span class="counter-sep">:</span>
      <span class="counter-unit"><strong>${String(minutes).padStart(2,'0')}</strong><small>mins</small></span>
      <span class="counter-sep">:</span>
      <span class="counter-unit"><strong>${String(seconds).padStart(2,'0')}</strong><small>secs</small></span>
    `;
  }
}

updateCounter();
setInterval(updateCounter, 1000);
