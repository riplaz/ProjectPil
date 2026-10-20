// Фон: частицы пыли. Почти невидимы, пока на них не упал луч (курсор).

function createDustField(canvas) {
  const context = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LIGHT_RADIUS = 250;
  const MAX_PARTICLES = 260;
  const IDLE_DELAY = 3000;

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let particles = [];
  let pointerX = 0.5;
  let lastPointerTime = -Infinity;
  let lastFrameTime = 0;
  let tabVisible = !document.hidden;

  const light = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function resizeCanvas() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function createParticle() {
    const depth = 0.3 + Math.random() * 0.7;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      depth: depth,
      size: 0.5 + depth * 2,
      isFiber: Math.random() < 0.15,
      angle: Math.random() * Math.PI,
      driftX: (Math.random() - 0.5) * 0.2,
      fallSpeed: 0.04 + Math.random() * 0.2,
      wobble: Math.random() * Math.PI * 2,
      pushX: 0,
      pushY: 0,
      screenX: 0,
      screenY: 0
    };
  }

  function setup() {
    resizeCanvas();

    const count = Math.min(MAX_PARTICLES, Math.round((width * height) / 9000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }

    light.x = light.targetX = width / 2;
    light.y = light.targetY = height * 0.4;
  }

  function updateLight(time) {
    const isIdle = time - lastPointerTime > IDLE_DELAY;

    if (isIdle) {
      light.targetX = width * (0.5 + 0.3 * Math.sin(time / 2500));
      light.targetY = height * (0.4 + 0.2 * Math.cos(time / 3100));
    }

    light.x += (light.targetX - light.x) * 0.12;
    light.y += (light.targetY - light.y) * 0.12;
  }

  function updateParticle(particle, delta) {
    particle.wobble += 0.012 * delta;
    particle.x += (particle.driftX + Math.sin(particle.wobble) * 0.15 + particle.pushX) * delta;
    particle.y += (particle.fallSpeed + particle.pushY) * delta;

    particle.pushX *= 0.96;
    particle.pushY *= 0.96;

    if (particle.x < -10) particle.x = width + 10;
    if (particle.x > width + 10) particle.x = -10;
    if (particle.y < -10) particle.y = height + 10;
    if (particle.y > height + 10) {
      particle.y = -10;
      particle.x = Math.random() * width;
    }
  }

  function drawParticle(particle) {
    const parallaxX = (pointerX - 0.5) * -40 * particle.depth;
    const scrollShift = window.scrollY * 0.12 * particle.depth;

    const x = particle.x + parallaxX;
    const y = (((particle.y - scrollShift) % height) + height) % height;

    particle.screenX = x;
    particle.screenY = y;

    const distanceToLight = Math.hypot(x - light.x, y - light.y);
    const brightness = Math.max(0, 1 - distanceToLight / LIGHT_RADIUS);
    const alpha = 0.06 * particle.depth + brightness * brightness * 0.95;

    context.fillStyle = `rgba(232, 197, 138, ${alpha})`;
    context.strokeStyle = context.fillStyle;
    context.shadowColor = 'rgba(255, 190, 110, 0.9)';
    context.shadowBlur = brightness > 0.25 ? 10 * brightness : 0;

    if (particle.isFiber) {
      const halfLength = particle.size * 3;
      const offsetX = Math.cos(particle.angle) * halfLength;
      const offsetY = Math.sin(particle.angle) * halfLength;

      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x - offsetX, y - offsetY);
      context.lineTo(x + offsetX, y + offsetY);
      context.stroke();
    } else {
      context.beginPath();
      context.arc(x, y, particle.size, 0, Math.PI * 2);
      context.fill();
    }
  }

  function drawFrame() {
    context.clearRect(0, 0, width, height);
    particles.forEach(drawParticle);
  }

  function loop(time) {
    requestAnimationFrame(loop);

    const delta = Math.min((time - lastFrameTime) / 16.7 || 1, 3);
    lastFrameTime = time;

    if (!tabVisible) return;

    updateLight(time);
    particles.forEach(particle => updateParticle(particle, delta));
    drawFrame();
  }

  window.addEventListener('pointermove', event => {
    light.targetX = event.clientX;
    light.targetY = event.clientY;
    lastPointerTime = performance.now();

    if (width > 700) pointerX = event.clientX / width;

    if (reduceMotion) {
      light.x = light.targetX;
      light.y = light.targetY;
      drawFrame();
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (window.innerWidth !== width) setup();
    else resizeCanvas();

    if (reduceMotion) drawFrame();
  });

  document.addEventListener('visibilitychange', () => {
    tabVisible = !document.hidden;
  });

  setup();

  if (reduceMotion) drawFrame();
  else requestAnimationFrame(loop);

  return {
    // Взмах: частицы рядом с кликом разлетаются в стороны
    puff(x, y) {
      const radius = 320;

      particles.forEach(particle => {
        const dx = particle.screenX - x;
        const dy = particle.screenY - y;
        const distance = Math.hypot(dx, dy) || 1;

        if (distance < radius) {
          const force = (1 - distance / radius) * 6 * particle.depth;
          particle.pushX += (dx / distance) * force;
          particle.pushY += (dy / distance) * force;
        }
      });
    }
  };
}
