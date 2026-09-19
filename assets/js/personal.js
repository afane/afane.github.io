(() => {
  document.querySelectorAll('a[href^="https://"], a[href^="http://"]').forEach(link => {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });

  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('[data-menu]');
  const nav = document.querySelector('[data-nav]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('is-open', !open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }));

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  document.querySelector('[data-year]').textContent = new Date().getFullYear();

  if (reduced) return;
  const canvas = document.querySelector('[data-field]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const nodeColor = getComputedStyle(document.documentElement).getPropertyValue('--blue').trim();
  let width = 0, height = 0, points = [], frame;
  const pointer = { x: -1000, y: -1000 };
  function resize() {
    const ratio = Math.min(devicePixelRatio, 2);
    width = canvas.clientWidth; height = canvas.clientHeight;
    canvas.width = width * ratio; canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(85, Math.floor(width * height / 16000));
    points = Array.from({ length: count }, (_, i) => ({
      x: width * (.48 + Math.random() * .58), y: Math.random() * height,
      vx: (Math.random() - .5) * .72, vy: (Math.random() - .5) * .72,
      r: i % 13 === 0 ? 3 : 1.4
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    points.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < width * .42 || p.x > width * 1.04) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      const pd = Math.hypot(p.x - pointer.x, p.y - pointer.y);
      if (pd < 130) { p.x += (p.x - pointer.x) * .012; p.y += (p.y - pointer.y) * .012; }
      points.slice(i + 1).forEach(q => {
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 118) {
          ctx.strokeStyle = `rgba(36,19,24,${.19 * (1 - d / 118)})`;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      });
      ctx.fillStyle = p.r > 2 ? nodeColor : 'rgba(36,19,24,.42)';
      const pulse = p.r > 2 ? Math.sin(Date.now() / 520 + i) * .8 : 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r + pulse, 0, Math.PI * 2); ctx.fill();
    });
    frame = requestAnimationFrame(draw);
  }
  resize(); draw();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frame); else draw();
  });
})();
