function createStar() {
  const star = document.createElement('span');
  star.className = 'falling-star';
  star.textContent = '★';
  star.style.left = Math.random() * 100 + 'vw';
  const size = Math.random() * 20 + 18; 
  star.style.fontSize = size + 'px';
  star.style.opacity = Math.random() * 0.3 + 0.2;
  star.style.color = 'rgba(255,255,255,0.8)';
  star.style.filter = 'blur(0.5px)';
  star.style.animationDuration = (Math.random() * 3 + 4) + 's';
  document.body.appendChild(star);
  star.addEventListener('animationend', () => {
    star.remove();
  });
}

setInterval(createStar, 400);