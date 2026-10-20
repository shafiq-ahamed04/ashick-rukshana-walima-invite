import React, { useEffect, useRef } from 'react';

const COLORS = [
  'rgba(246, 230, 228, 0.85)', // Blush
  'rgba(232, 196, 196, 0.75)', // Rose
  'rgba(251, 247, 240, 0.80)', // Ivory
  'rgba(221, 231, 218, 0.70)'  // Sage-soft
];

export default function PetalCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const isMobile = width < 768;
    const maxPetals = isMobile ? 14 : 28;

    const createPetal = (x, y, isBurst = false) => {
      return {
        x: x ?? Math.random() * width,
        y: y ?? (isBurst ? y : -20 - Math.random() * 50),
        size: Math.random() * 7 + 8,
        speedY: isBurst ? (Math.random() - 0.5) * 4 : Math.random() * 0.7 + 0.6,
        speedX: isBurst ? (Math.random() - 0.5) * 5 : Math.random() * 0.6 - 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: Math.random() * 0.02 + 0.01,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: Math.random() * 0.4 + 0.5,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayRange: Math.random() * 1.2 + 0.6,
        isBurst,
        life: isBurst ? 100 : Infinity
      };
    };

    let petals = Array.from({ length: maxPetals }, () => {
      const p = createPetal();
      p.y = Math.random() * height;
      return p;
    });

    let burstPetals = [];

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Tap-anywhere petal burst (cap 40)
    const handlePointerDown = (e) => {
      if (burstPetals.length >= 40) return;
      const count = Math.min(8, 40 - burstPetals.length);
      for (let i = 0; i < count; i++) {
        burstPetals.push(createPetal(e.clientX, e.clientY, true));
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    let isPaused = false;
    let isPhotoVisible = false;

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
      if (!isPaused && !isPhotoVisible && !animId) {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

    const handlePhotoVisibility = (e) => {
      const isMobileScreen = window.innerWidth < 1024;
      const wasVisible = isPhotoVisible;
      isPhotoVisible = isMobileScreen && Boolean(e.detail?.isVisible);
      if (wasVisible && !isPhotoVisible && !isPaused && !animId) {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };
    window.addEventListener('photoSectionVisibility', handlePhotoVisibility, { passive: true });

    let lastTime = performance.now();

    const drawPetalShape = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(Math.cos(p.flip), 1);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.4, p.size * 0.8, p.size * 0.4, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.4, -p.size * 0.8, -p.size * 0.4, 0, -p.size);
      ctx.fill();

      ctx.restore();
    };

    const render = (currentTime) => {
      if (isPaused || isPhotoVisible) {
        animId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Normal falling petals
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.y += p.speedY;
        p.x += Math.sin(p.swaySpeed * (currentTime * 0.05)) * p.swayRange + p.speedX;
        p.rotation += p.rotSpeed;
        p.flip += p.flipSpeed;

        if (p.y > height + 20) {
          petals[i] = createPetal();
        }
        drawPetalShape(p);
      }

      // Burst petals
      for (let i = burstPetals.length - 1; i >= 0; i--) {
        const bp = burstPetals[i];
        bp.x += bp.speedX;
        bp.y += bp.speedY;
        bp.speedX *= 0.96;
        bp.speedY = bp.speedY * 0.96 + 0.3; // gentle gravity
        bp.rotation += bp.rotSpeed;
        bp.flip += bp.flipSpeed;
        bp.life -= 1;
        bp.opacity = Math.max(0, (bp.life / 100) * 0.8);

        if (bp.life <= 0 || bp.y > height + 20) {
          burstPetals.splice(i, 1);
        } else {
          drawPetalShape(bp);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('photoSectionVisibility', handlePhotoVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      aria-hidden="true"
    />
  );
}
