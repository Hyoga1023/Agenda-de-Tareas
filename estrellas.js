
// Optimizado para bajo consumo de CPU usando canvas
let canvas, ctx;
let stars = [];
const maxStars = 20; // Límite de estrellas activas
let isActive = true;

function initStars() {
  canvas = document.createElement('canvas');
  canvas.className = 'star-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '-1';
  document.body.appendChild(canvas);

  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('visibilitychange', () => {
    isActive = !document.hidden;
    if (isActive) animateStars();
  });

  createStar();
  animateStars();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createStar() {
  if (stars.length >= maxStars) return;

  stars.push({
    x: Math.random() * canvas.width,
    y: -10,
    size: Math.random() * 4 + 2,
    speed: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.3
  });
}

function animateStars() {
  if (!isActive) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars = stars.filter(star => star.y < canvas.height + 10);

  stars.forEach(star => {
    star.y += star.speed;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  if (isActive && stars.length < maxStars) {
    if (Math.random() < 0.2) createStar(); // Crear estrella con 20% de probabilidad por frame
  }

  requestAnimationFrame(animateStars);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStars);
} else {
  initStars();
}
