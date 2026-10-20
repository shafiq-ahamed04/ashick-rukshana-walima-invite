import React, { useLayoutEffect, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function IntroOverlay({ monogramImage, onHeroReveal, onComplete }) {
  const overlayRef = useRef(null);
  const logoWrapperRef = useRef(null);
  const dimLayerRef = useRef(null);
  const glowDiscRef = useRef(null);
  const ivoryDiscRef = useRef(null);
  const completedRef = useRef(false);

  // Keep latest callbacks in refs to prevent unnecessary re-runs
  const onHeroRevealRef = useRef(onHeroReveal);
  const onCompleteRef = useRef(onComplete);
  onHeroRevealRef.current = onHeroReveal;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Set critical dark background on html and body
    document.documentElement.classList.add('intro-active');
    document.body.classList.add('intro-active');

    // Lock scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Hard failsafe at 4 seconds
    const failsafeTimer = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        document.documentElement.classList.remove('intro-active');
        document.body.classList.remove('intro-active');
        document.body.style.overflow = '';
        onHeroRevealRef.current?.();
        onCompleteRef.current?.();
      }
    }, 4000);

    return () => {
      clearTimeout(failsafeTimer);
      document.documentElement.classList.remove('intro-active');
      document.body.classList.remove('intro-active');
      document.body.style.overflow = '';
    };
  }, []);

  useLayoutEffect(() => {
    if (!overlayRef.current || !logoWrapperRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const handleFinish = () => {
        if (completedRef.current) return;
        completedRef.current = true;
        document.documentElement.classList.remove('intro-active');
        document.body.classList.remove('intro-active');
        document.body.style.overflow = '';
        onCompleteRef.current?.();
      };

      if (prefersReducedMotion) {
        if (overlayRef.current) overlayRef.current.style.backgroundColor = '#FBF7F0';
        if (dimLayerRef.current) dimLayerRef.current.style.opacity = '0';
        document.documentElement.classList.remove('intro-active');
        document.body.classList.remove('intro-active');

        gsap.timeline({ onComplete: handleFinish })
          .fromTo(logoWrapperRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
          .to(logoWrapperRef.current, { opacity: 0, duration: 0.3, delay: 0.8 });
        return;
      }

      // ~1.8-second Lantern Glow GSAP Timeline
      const tl = gsap.timeline({ onComplete: handleFinish });

      // Initial state
      gsap.set(dimLayerRef.current, { opacity: 0.72 });
      gsap.set(glowDiscRef.current, { scale: 0.25, opacity: 0 });
      gsap.set(logoWrapperRef.current, { scale: 0.94, opacity: 1 });
      gsap.set(ivoryDiscRef.current, { scale: 0.2, opacity: 0 });

      // 0.00 - 0.15: Night screen, logo faint
      // 0.15 - 0.70: Ignition
      tl.to(
        dimLayerRef.current,
        {
          opacity: 0,
          duration: 0.55,
          ease: 'power2.out'
        },
        0.15
      );

      tl.to(
        glowDiscRef.current,
        {
          scale: 1,
          opacity: 0.9,
          duration: 0.55,
          ease: 'power2.out'
        },
        0.15
      );

      tl.to(
        logoWrapperRef.current,
        {
          scale: 1,
          duration: 0.55,
          ease: 'power2.out'
        },
        0.15
      );

      // 0.70 - 0.92: One quick flicker: glow opacity 0.9 -> 0.7 -> 1.0
      tl.to(
        glowDiscRef.current,
        {
          opacity: 0.7,
          duration: 0.11,
          ease: 'sine.inOut'
        },
        0.70
      );
      tl.to(
        glowDiscRef.current,
        {
          opacity: 1.0,
          duration: 0.11,
          ease: 'sine.inOut'
        },
        0.81
      );

      // 0.92 - 1.45: Page brightens: ivory #FBF7F0 disc scales 0.2 to ~6x full-viewport coverage
      tl.to(
        ivoryDiscRef.current,
        {
          opacity: 1,
          scale: 6,
          duration: 0.53,
          ease: 'power2.inOut'
        },
        0.92
      );

      // 1.35 - 1.80: Logo & glow fade out, overlay fades to opacity 0
      tl.to(
        logoWrapperRef.current,
        {
          opacity: 0,
          duration: 0.45,
          ease: 'power2.in'
        },
        1.35
      );

      tl.to(
        glowDiscRef.current,
        {
          opacity: 0,
          duration: 0.45,
          ease: 'power2.in'
        },
        1.35
      );

      // Hero entrance starts at about 1.45s as overlay fades
      tl.add(() => {
        document.documentElement.classList.remove('intro-active');
        document.body.classList.remove('intro-active');
        onHeroRevealRef.current?.();
      }, 1.45);

      tl.to(
        overlayRef.current,
        {
          opacity: 0,
          duration: 0.45,
          ease: 'power2.inOut'
        },
        1.35
      );
    }, overlayRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-[#1F261D] h-[100svh] w-full overflow-hidden"
      style={{ willChange: 'opacity' }}
    >
      {/* Warm champagne glow radial disc (120vmin wide, centered behind logo, no blur filter) */}
      <div
        ref={glowDiscRef}
        aria-hidden="true"
        className="absolute pointer-events-none rounded-full w-[120vmin] h-[120vmin]"
        style={{
          background:
            'radial-gradient(circle, #F4DDA7 0%, rgba(244, 221, 167, 0.7) 35%, rgba(244, 221, 167, 0.2) 65%, transparent 100%)',
          willChange: 'transform, opacity'
        }}
      />

      {/* Expanding ivory flood disc for page brightening */}
      <div
        ref={ivoryDiscRef}
        aria-hidden="true"
        className="absolute pointer-events-none rounded-full w-[100vmin] h-[100vmin]"
        style={{
          background:
            'radial-gradient(circle, #FBF7F0 0%, #FBF7F0 75%, rgba(251, 247, 240, 0.6) 88%, transparent 100%)',
          willChange: 'transform, opacity'
        }}
      />

      {/* Centered Logo Container */}
      <div
        ref={logoWrapperRef}
        className="relative z-10 flex items-center justify-center p-4 max-w-[500px] w-[74vw]"
        style={{ willChange: 'transform, opacity' }}
      >
        <picture>
          <source srcSet="/images/optimized/logo_ar.webp" type="image/webp" />
          <img
            src="/images/optimized/logo_ar.png"
            alt="AR Monogram"
            className="w-full h-auto block select-none"
            loading="eager"
            decoding="async"
            width={1024}
            height={682}
          />
        </picture>

        {/* Dim Layer using mask-image to dim/ignite the logo */}
        <div
          ref={dimLayerRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none bg-[#1F261D]"
          style={{
            WebkitMaskImage: 'url(/images/optimized/logo_ar.png)',
            maskImage: 'url(/images/optimized/logo_ar.png)',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            willChange: 'opacity'
          }}
        />
      </div>
    </div>
  );
}
