import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatEventDate } from '../utils/dates';
import { ARABIC_TEXTS, coupleNames } from '../config/wedding';
import { EASE, DUR, STAGGER, DISTANCE, isReducedMotion } from '../lib/motion';

gsap.registerPlugin(ScrollTrigger);

export default function Closing({ config }) {
  const sectionRef = useRef(null);
  const logoRef = useRef(null);
  const headingLineRef = useRef(null);

  useEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      const closingTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          once: true
        }
      });

      // 1. Logo scales 0.9 -> 1 and rises
      if (logoRef.current) {
        closingTl.fromTo(
          logoRef.current,
          { scale: 0.9, y: DISTANCE, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: DUR, ease: EASE },
          0
        );
      }

      // 2. Heading line-by-line reveal
      if (headingLineRef.current) {
        closingTl.to(
          headingLineRef.current,
          { y: '0%', opacity: 1, duration: DUR, ease: EASE },
          0.2
        );
      }

      // 3. Names, date, Arabic blessing, and Back to top staggered
      const otherElements = sectionRef.current?.querySelectorAll('.reveal-closing-item') || [];
      if (otherElements.length > 0) {
        closingTl.fromTo(
          otherElements,
          { opacity: 0, y: DISTANCE },
          { opacity: 1, y: 0, duration: DUR, stagger: STAGGER, ease: EASE },
          0.35
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const formattedDate = formatEventDate(config.walima?.date);

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      ref={sectionRef}
      className="relative w-full py-24 px-4 flex flex-col items-center bg-transparent text-center overflow-hidden"
      style={{
        paddingBottom: 'max(6rem, env(safe-area-inset-bottom))'
      }}
    >
      <div className="w-full max-w-[560px] mx-auto flex flex-col items-center space-y-8">
        {/* Static AR Monogram Logo (260px wide on mobile, 320px on desktop) */}
        {config.monogramImage && (
          <div
            ref={logoRef}
            className="w-[260px] sm:w-[320px] mx-auto opacity-0"
          >
            <picture>
              <source srcSet="/images/optimized/logo_ar.webp" type="image/webp" />
              <img
                src="/images/optimized/logo_ar.png"
                alt="AR Monogram"
                className="w-full h-auto block select-none"
                width={1024}
                height={682}
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        )}

        {/* Lead Label & Heading with line split and non-breaking space */}
        <div className="space-y-2">
          <p className="font-label font-bold text-[12px] sm:text-[13px] tracking-[0.22em] uppercase text-gold-text reveal-closing-item opacity-0">
            TOGETHER IS A BEAUTIFUL PLACE TO BE
          </p>
          <h2 className="font-display font-semibold text-heading text-olive-deep leading-[1.15] reveal-line-wrap">
            <span
              ref={headingLineRef}
              className="reveal-line-inner text-balance"
            >
              Our forever begins with&nbsp;you.
            </span>
          </h2>
        </div>

        {/* 3-Line Couple Names: Groom first, then &, then Bride */}
        <div className="w-full my-1 flex flex-col items-center justify-center reveal-closing-item opacity-0">
          <div className="w-full text-center">
            <p className="couple-name-title">
              {coupleNames[0]}
            </p>
          </div>

          <div className="w-full max-w-[190px] flex items-center justify-center my-[6px] select-none">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#C8A96A] to-[#C8A96A]" />
            <span className="couple-name-title px-4 leading-none text-2xl sm:text-3xl text-gold-text">
              &amp;
            </span>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#C8A96A] to-[#C8A96A]" />
          </div>

          <div className="w-full text-center">
            <p className="couple-name-title">
              {coupleNames[1]}
            </p>
          </div>
        </div>

        {/* Date Line */}
        {formattedDate && (
          <p className="font-display font-semibold text-xl text-olive-deep tracking-wide reveal-closing-item opacity-0">
            {formattedDate}
          </p>
        )}

        {/* Islamic Closing Dua & Blessing */}
        <div className="w-full max-w-[420px] rounded-2xl bg-[#FBF7F0]/92 border border-[#C8A96A]/40 p-6 shadow-sm reveal-closing-item opacity-0 relative">
          <div
            className="absolute inset-[4px] rounded-[12px] border border-[#C8A96A]/25 pointer-events-none"
            aria-hidden="true"
          />
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic font-bold text-2xl sm:text-3xl text-olive-deep mb-2"
          >
            {ARABIC_TEXTS.closing}
          </p>
          <p className="font-body italic font-medium text-[18px] text-olive leading-relaxed">
            "{ARABIC_TEXTS.closingEnglish}"
          </p>
        </div>

        {/* Back to top Link */}
        <div className="pt-8 reveal-closing-item opacity-0">
          <a
            href="#top"
            onClick={scrollToTop}
            className="inline-flex items-center justify-center min-h-[44px] text-gold-text hover:text-olive-deep transition-colors font-label font-medium text-[14px] tracking-[0.2em] uppercase py-2 focus:outline-none focus:underline"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
