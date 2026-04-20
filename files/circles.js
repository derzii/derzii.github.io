(function () {
  const CIRCLE_COUNT = 18;
  const FLEE_RADIUS = 100;
  const FLEE_STRENGTH = 12;
  const DRIFT_SPEED = 0.7;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const brown = [
    'rgba(176, 128, 96, 0.12)',
    'rgba(107, 66, 38, 0.09)',
    'rgba(240, 224, 200, 0.25)',
    'rgba(44, 26, 14, 0.07)',
  ];

  const circles = Array.from({ length: CIRCLE_COUNT }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 18 + Math.random() * 52,
    vx: (Math.random() - 0.5) * DRIFT_SPEED * 2,
    vy: (Math.random() - 0.5) * DRIFT_SPEED * 2,
    color: brown[Math.floor(Math.random() * brown.length)],
  }));

  let mx = -999, my = -999;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  window.addEventListener('mouseleave', () => { mx = -999; my = -999; });

  function tick() {
    ctx.clearRect(0, 0, W, H);

    for (const c of circles) {
      const dx = c.x - mx;
      const dy = c.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < FLEE_RADIUS + c.r) {
        const force = (FLEE_RADIUS + c.r - dist) / (FLEE_RADIUS + c.r);
        c.vx += (dx / dist) * force * FLEE_STRENGTH * 0.05;
        c.vy += (dy / dist) * force * FLEE_STRENGTH * 0.05;
      }

      // dampen only when fleeing, otherwise preserve momentum
      const speed = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
      if (speed > DRIFT_SPEED * 2.5) {
        c.vx *= 0.97;
        c.vy *= 0.97;
      }
      // steer back toward target drift speed when too slow
      if (speed < DRIFT_SPEED) {
        const angle = Math.atan2(c.vy, c.vx);
        c.vx += Math.cos(angle) * 0.04;
        c.vy += Math.sin(angle) * 0.04;
        c.vx += (Math.random() - 0.5) * 0.06;
        c.vy += (Math.random() - 0.5) * 0.06;
      }

      c.x += c.vx;
      c.y += c.vy;

      // soft wrap at edges
      if (c.x < -c.r)       c.x = W + c.r;
      if (c.x > W + c.r)    c.x = -c.r;
      if (c.y < -c.r)       c.y = H + c.r;
      if (c.y > H + c.r)    c.y = -c.r;

      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fillStyle = c.color;
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }

  tick();
})();
