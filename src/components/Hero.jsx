import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { formatShortDate } from '../utils/dates';
import { ARABIC_TEXTS, coupleNames } from '../config/wedding';

export default function Hero({ config, startReveal }) {
  const heroRef = useRef(null);
  const ovalSvgRef = useRef(null);
  const wreathRef = useRef(null);
  const contentWrapperRef = useRef(null);
  const scrollCueRef = useRef(null);

  useEffect(() => {
    if (!startReveal) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (ovalSvgRef.current) ovalSvgRef.current.style.opacity = '1';
      if (wreathRef.current) wreathRef.current.style.opacity = '1';
      if (contentWrapperRef.current) {
        contentWrapperRef.current.querySelectorAll('.hero-fade-item').forEach((el) => {
          el.style.opacity = '1';
        });
      }
      if (scrollCueRef.current) scrollCueRef.current.style.opacity = '1';
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // 1. Oval scales 0.96 -> 1 with fade
      tl.from(
        ovalSvgRef.current,
        { scale: 0.96, opacity: 0.8, duration: 0.8, ease: 'power2.out' },
        0
      );

      // 2. Wreath fades in
      tl.from(
        wreathRef.current,
        { opacity: 0.8, duration: 0.8, ease: 'power2.out' },
        0.2
      );

      // 3. Content staggers in (fade-up)
      const contentItems = contentWrapperRef.current?.querySelectorAll('.hero-fade-item') || [];
      tl.from(
        contentItems,
        { opacity: 0.6, y: 14, duration: 0.7, stagger: 0.08, ease: 'power2.out' },
        0.35
      );

      // 4. Scroll cue fades in
      if (scrollCueRef.current) {
        tl.from(
          scrollCueRef.current,
          { opacity: 0.6, y: 10, duration: 0.6, ease: 'power2.out' },
          1.0
        );
      }
    }, heroRef);

    // Pause infinite animations when hero is off-screen
    const heroObserver = new IntersectionObserver((entries) => {
      const isVisible = entries[0]?.isIntersecting ?? false;
      if (wreathRef.current) {
        wreathRef.current.style.animationPlayState = isVisible ? 'running' : 'paused';
      }
      if (scrollCueRef.current) {
        scrollCueRef.current.style.animationPlayState = isVisible ? 'running' : 'paused';
      }
    }, { threshold: 0.05 });

    if (heroRef.current) {
      heroObserver.observe(heroRef.current);
    }

    return () => {
      heroObserver.disconnect();
      ctx.revert();
    };
  }, [startReveal]);

  const formattedDate = formatShortDate(config.walima?.date);
  const city = config.walima?.city;

  return (
    <header
      ref={heroRef}
      className="relative min-h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden px-4 py-8 bg-transparent"
      style={{
        paddingTop: 'max(2rem, env(safe-area-inset-top))'
      }}
    >
      {/* Oval Frame & Floral Wreath Container */}
      <div className="relative hero-oval-wrapper mx-auto flex items-center justify-center my-auto">
        {/* Inline SVG Frame with Ellipse, Rose Halo, Double Gold Outline & Floral Wreath */}
        <svg
          ref={ovalSvgRef}
          viewBox="0 0 560 740"
          className="w-full h-full block overflow-visible select-none"
          role="img"
          aria-hidden="true"
        >
          {/* Soft rose halo ellipse behind ivory base (rx 270, ry 360 at 0.12 opacity) */}
          <ellipse
            cx="280"
            cy="370"
            rx="270"
            ry="360"
            fill="var(--rose)"
            fillOpacity="0.12"
          />

          {/* Filled ivory ellipse at 0.94 opacity (rx 262, ry 352) */}
          <ellipse
            cx="280"
            cy="370"
            rx="262"
            ry="352"
            fill="var(--ivory)"
            fillOpacity="0.94"
          />

          {/* Gold Double Outline on the Ellipse */}
          {/* Outer stroke: width 2.5 */}
          <ellipse
            cx="280"
            cy="370"
            rx="262"
            ry="352"
            fill="none"
            stroke="url(#goldStrokeGrad)"
            strokeWidth="2.5"
          />

          {/* Inner stroke: width 1, inset 8 units (rx 254, ry 344) */}
          <ellipse
            cx="280"
            cy="370"
            rx="254"
            ry="344"
            fill="none"
            stroke="url(#goldStrokeGrad)"
            strokeWidth="1"
            strokeOpacity="0.8"
          />

          {/* Wreath Layer (densest at top-left and bottom-right, clear top center) */}
          <g ref={wreathRef}>
            {/* Top-Left Cluster (Densest foliage + hanging lantern, leaves top-center clear) */}
            <g className="wreath-sway-tl">
              {/* Eucalyptus Sprig */}
              <use
                href="#eucalyptus-sprig"
                x="45"
                y="55"
                width="120"
                height="150"
                transform="rotate(-28 105 130)"
              />
              {/* Olive Sprig */}
              <use
                href="#olive-sprig"
                x="95"
                y="85"
                width="100"
                height="140"
                transform="rotate(-10 145 155)"
              />
              {/* Roses & Buds */}
              <use href="#soft-rose" x="65" y="125" width="75" height="75" />
              <use href="#peony-bud" x="125" y="80" width="45" height="55" />
              <use href="#peony-bud" x="45" y="185" width="40" height="48" />
              {/* Hanging Lantern */}
              <use href="#lantern" x="35" y="95" width="55" height="110" />
            </g>

            {/* Top-Right Cluster (Lighter foliage + hanging lantern) */}
            <g className="wreath-sway-tr">
              {/* Eucalyptus Sprig */}
              <use
                href="#eucalyptus-sprig"
                x="400"
                y="55"
                width="115"
                height="145"
                transform="scale(-1, 1) translate(-915, 0) rotate(-25 457 127)"
              />
              {/* Olive Sprig */}
              <use
                href="#olive-sprig"
                x="365"
                y="85"
                width="95"
                height="135"
                transform="rotate(12 412 152)"
              />
              {/* Roses & Buds */}
              <use href="#soft-rose" x="420" y="125" width="70" height="70" />
              <use href="#peony-bud" x="390" y="80" width="42" height="52" />
              {/* Hanging Lantern */}
              <use href="#lantern" x="470" y="95" width="55" height="110" />
            </g>

            {/* Bottom-Right Cluster (Densest foliage with roses & buds) */}
            <g className="wreath-sway-br">
              {/* Eucalyptus Sprig */}
              <use
                href="#eucalyptus-sprig"
                x="385"
                y="520"
                width="135"
                height="165"
                transform="rotate(38 452 602)"
              />
              {/* Olive Sprig */}
              <use
                href="#olive-sprig"
                x="350"
                y="555"
                width="115"
                height="155"
                transform="rotate(22 407 632)"
              />
              {/* Roses & Buds */}
              <use href="#soft-rose" x="415" y="535" width="85" height="85" />
              <use href="#peony-bud" x="365" y="640" width="48" height="58" />
              <use href="#peony-bud" x="475" y="495" width="42" height="50" />
            </g>

            {/* Bottom-Left Cluster (Lighter diagonal foliage) */}
            <g className="wreath-sway-bl">
              {/* Eucalyptus Sprig */}
              <use
                href="#eucalyptus-sprig"
                x="50"
                y="545"
                width="115"
                height="145"
                transform="rotate(-38 107 617)"
              />
              {/* Soft Rose & Bud */}
              <use href="#soft-rose" x="85" y="565" width="70" height="70" />
              <use href="#peony-bud" x="135" y="630" width="40" height="48" />
            </g>
          </g>
        </svg>

        {/* Content HTML block positioned over ellipse inner area (max-width 74%, padding-block 15%) */}
        <div
          ref={contentWrapperRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center mx-auto"
          style={{
            maxWidth: '74%',
            paddingBlock: '15%',
            gap: '10px'
          }}
        >
          {/* 1. Bismillah (Amiri bold, 7cqw) */}
          <div className="hero-fade-item">
            <p className="hero-bismillah tracking-wide">
              {ARABIC_TEXTS.bismillah}
            </p>
          </div>

          {/* 2. Small gold star */}
          <div className="hero-fade-item leading-none" aria-hidden="true">
            <span className="text-[#C8A96A] text-[13px] sm:text-[15px]">✦</span>
          </div>

          {/* 3. Label "TOGETHER WITH THEIR FAMILIES" (2.3cqw, min 11px, weight 700) */}
          <div className="hero-fade-item">
            <p className="hero-label">
              TOGETHER WITH THEIR FAMILIES
            </p>
          </div>

          {/* 4, 5, 6. Couple Names & Ampersand (8.4cqw, nowrap, 6px spacing above and below &) */}
          <div className="w-full flex flex-col items-center justify-center select-none">
            {/* Groom Name */}
            <div className="hero-fade-item w-full text-center">
              <h1 className="hero-names-text">
                {coupleNames[0]}
              </h1>
            </div>

            {/* Ampersand with gold hairlines and exact 6px vertical spacing */}
            <div
              className="hero-fade-item w-full max-w-[190px] flex items-center justify-center select-none"
              style={{ marginBlock: '6px' }}
            >
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#C8A96A] to-[#C8A96A]" />
              <span className="hero-names-text px-3 leading-none text-gold-text">
                &amp;
              </span>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#C8A96A] to-[#C8A96A]" />
            </div>

            {/* Bride Name */}
            <div className="hero-fade-item w-full text-center">
              <h2 className="hero-names-text">
                {coupleNames[1]}
              </h2>
            </div>
          </div>

          {/* 7. Label "INVITE YOU TO CELEBRATE THEIR WALIMA" (2.3cqw, min 11px, weight 700) */}
          <div className="hero-fade-item">
            <p className="hero-label">
              INVITE YOU TO CELEBRATE THEIR WALIMA
            </p>
          </div>

          {/* 8. Tagline (italic body font, 3.8cqw, min 16px) */}
          {config.tagline && (
            <div className="hero-fade-item">
              <p className="hero-tagline max-w-[380px]">
                "{config.tagline}"
              </p>
            </div>
          )}

          {/* 9. Thin gold divider */}
          <div className="hero-fade-item w-24 h-[1px] bg-[#C8A96A]/40 mx-auto my-0.5" aria-hidden="true" />

          {/* 10. Date and city line (body font weight 600, 4cqw, min 17px) */}
          {(formattedDate || city) && (
            <div className="hero-fade-item">
              <p className="hero-date tracking-wide">
                {[formattedDate, city].filter(Boolean).join(' · ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bouncing Scroll Cue below the oval */}
      <div
        ref={scrollCueRef}
        className="relative z-20 mt-4 sm:mt-6 flex flex-col items-center pointer-events-none scroll-bounce"
      >
        <span className="font-label font-bold text-[11px] sm:text-[12px] tracking-[0.22em] uppercase text-gold-text">
          Scroll to unfold
        </span>
        <svg
          className="w-4 h-4 text-gold-text mt-1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </header>
  );
}
