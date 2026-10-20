import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ARABIC_TEXTS, coupleNames } from '../config/wedding';
import { EASE, DUR, STAGGER, DISTANCE, isReducedMotion } from '../lib/motion';

gsap.registerPlugin(ScrollTrigger);

export default function Welcome({ config }) {
  const sectionRef = useRef(null);
  const headingLineRef = useRef(null);

  useEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      // 1. Line-by-line reveal for heading
      if (headingLineRef.current) {
        gsap.to(headingLineRef.current, {
          y: '0%',
          opacity: 1,
          duration: DUR,
          ease: EASE,
          scrollTrigger: {
            trigger: headingLineRef.current,
            start: 'top 85%',
            once: true
          }
        });
      }

      // 2. Section header & intro elements reveal (label, divider, body)
      const headerElements = sectionRef.current.querySelectorAll('.reveal-intro');
      ScrollTrigger.batch(headerElements, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: DISTANCE },
            {
              opacity: 1,
              y: 0,
              duration: DUR,
              stagger: STAGGER,
              ease: EASE,
              onComplete: () => gsap.set(batch, { clearProps: 'willChange' })
            }
          );
        }
      });

      // 3. Quranic verse card: Arabic verse first, English line, reference, divider, dua
      const verseElements = sectionRef.current.querySelectorAll('.reveal-verse-item');
      ScrollTrigger.batch(verseElements, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: DISTANCE },
            {
              opacity: 1,
              y: 0,
              duration: DUR,
              stagger: STAGGER,
              ease: EASE,
              onComplete: () => gsap.set(batch, { clearProps: 'willChange' })
            }
          );
        }
      });
    }, sectionRef);

    const welcomeObserver = new IntersectionObserver((entries) => {
      const isVisible = entries[0]?.isIntersecting ?? false;
      const sways = sectionRef.current?.querySelectorAll('.edge-sway-left, .edge-sway-right');
      sways?.forEach((el) => {
        el.style.animationPlayState = isVisible ? 'running' : 'paused';
      });
    }, { threshold: 0.05 });

    if (sectionRef.current) {
      welcomeObserver.observe(sectionRef.current);
    }

    return () => {
      welcomeObserver.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 px-4 flex flex-col items-center bg-transparent"
    >
      {/* Small floral arch illustration at top of section */}
      <div className="w-48 sm:w-64 mb-6 reveal-intro opacity-0" aria-hidden="true">
        <svg viewBox="0 0 320 80" className="w-full h-auto">
          <use href="#floral-arch" />
        </svg>
      </div>

      <div className="w-full max-w-[620px] mx-auto flex flex-col items-center text-center space-y-8">
        {/* Label and Line-by-Line Split Heading */}
        <div>
          <p className="font-label font-bold text-[12px] sm:text-[13px] tracking-[0.22em] uppercase text-gold-text mb-2 reveal-intro opacity-0">
            IN THE NAME OF ALLAH
          </p>
          <h2 className="font-display font-semibold text-heading text-olive-deep leading-[1.15] reveal-line-wrap">
            <span ref={headingLineRef} className="reveal-line-inner">
              You're Invited
            </span>
          </h2>
        </div>

        {/* Invitation Text */}
        <div className="reveal-intro opacity-0 px-2 sm:px-6">
          <p className="font-body font-medium text-[18px] sm:text-[20px] text-olive leading-[1.6]">
            With the blessings of Allah and our families, we invite you to join us in celebrating
            the Walima of{' '}
            <span className="font-display font-semibold text-olive-deep">
              {coupleNames[0]}
            </span>{' '}
            &amp;{' '}
            <span className="font-display font-semibold text-olive-deep">
              {coupleNames[1]}
            </span>
            .
          </p>

          {/* Optional Parents lines */}
          {(config.groomParents || config.brideParents) && (
            <div className="mt-4 pt-4 border-t border-[#C8A96A]/25 space-y-1">
              {config.groomParents && (
                <p className="font-body italic font-medium text-[17px] text-olive">
                  Son of {config.groomParents}
                </p>
              )}
              {config.brideParents && (
                <p className="font-body italic font-medium text-[17px] text-olive">
                  Daughter of {config.brideParents}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quranic Verse Card: Arabic verse fades up first, then English, then reference */}
        <div className="w-full rounded-2xl bg-[#FBF7F0]/92 border border-[#C8A96A]/50 p-6 sm:p-8 shadow-card relative">
          <div
            className="absolute inset-[5px] rounded-[11px] border border-[#C8A96A]/30 pointer-events-none"
            aria-hidden="true"
          />
          {/* Arabic Verse (Amiri, RTL, at least 22px) */}
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic font-normal text-[22px] sm:text-2xl text-olive-deep leading-[2.2] text-center mb-5 tracking-wide reveal-verse-item opacity-0"
          >
            {ARABIC_TEXTS.verse}
          </p>

          {/* Subtle separator */}
          <div className="w-20 mx-auto h-[1px] bg-[#C8A96A]/50 mb-4 reveal-verse-item opacity-0" />

          {/* English Translation (floor 18px) */}
          <p className="font-body italic font-medium text-[18px] sm:text-[19px] text-olive leading-[1.6] mb-3 reveal-verse-item opacity-0">
            "{ARABIC_TEXTS.verseEnglish}"
          </p>

          {/* Reference */}
          <p className="font-label font-bold text-[12px] sm:text-[13px] tracking-[0.22em] uppercase text-gold-text reveal-verse-item opacity-0">
            {ARABIC_TEXTS.verseRef}
          </p>
        </div>

        {/* Dua Card: Arabic dua then English line */}
        <div className="w-full rounded-2xl bg-[#FBF7F0]/92 border border-[#C8A96A]/50 p-6 sm:p-8 shadow-card relative">
          <div
            className="absolute inset-[5px] rounded-[11px] border border-[#C8A96A]/30 pointer-events-none"
            aria-hidden="true"
          />
          {/* Dua in Arabic (Bold, at least 22px) */}
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic font-bold text-[22px] sm:text-2xl text-olive-deep leading-[2.0] text-center mb-4 tracking-wide reveal-verse-item opacity-0"
          >
            {ARABIC_TEXTS.dua}
          </p>

          {/* Subtle separator */}
          <div className="w-20 mx-auto h-[1px] bg-[#C8A96A]/50 mb-4 reveal-verse-item opacity-0" />

          {/* English translation (floor 18px) */}
          <p className="font-body italic font-medium text-[18px] sm:text-[19px] text-olive leading-[1.6] reveal-verse-item opacity-0">
            "{ARABIC_TEXTS.duaEnglish}"
          </p>
        </div>
      </div>
    </section>
  );
}
