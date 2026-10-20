import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { coupleNames, coupleLine } from '../config/wedding';
import { isReducedMotion } from '../lib/motion';

gsap.registerPlugin(ScrollTrigger);

export default function CouplePhoto({ config }) {
  const sectionRef = useRef(null);
  const archWrapperRef = useRef(null);
  const headingLineRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    // Pre-decode and pre-warm image texture
    const preloadImg = new Image();
    preloadImg.src = '/images/optimized/couple.webp';
    if (typeof preloadImg.decode === 'function') {
      preloadImg.decode().catch(() => {});
    }
    if (imgRef.current && typeof imgRef.current.decode === 'function') {
      imgRef.current.decode().catch(() => {});
    }

    // IntersectionObserver to pause heavy background animations on mobile while photo is visible
    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0]?.isIntersecting ?? false;
        if (window.innerWidth < 1024) {
          document.body.classList.toggle('photo-active', isIntersecting);
        }
        window.dispatchEvent(
          new CustomEvent('photoSectionVisibility', {
            detail: { isVisible: isIntersecting }
          })
        );
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    if (isReducedMotion()) {
      if (archWrapperRef.current) {
        archWrapperRef.current.style.opacity = '1';
        archWrapperRef.current.style.transform = 'translateY(0)';
      }
      return () => {
        document.body.classList.remove('photo-active');
        observer.disconnect();
      };
    }

    const ctx = gsap.context(() => {
      // 1. Line-by-line reveal for heading
      if (headingLineRef.current) {
        ScrollTrigger.create({
          trigger: headingLineRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            requestAnimationFrame(() => {
              const el = headingLineRef.current;
              if (!el) return;
              el.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
              el.style.transform = 'translateY(0%)';
              el.style.opacity = '1';
            });
          }
        });
      }

      // 2. One-time wrapper reveal (opacity 0 to 1, translateY 16px to 0, once)
      // Call img.decode() before the reveal starts so no frame is spent decoding
      if (archWrapperRef.current) {
        const triggerReveal = () => {
          const el = archWrapperRef.current;
          if (!el || el.dataset.revealed) return;
          el.dataset.revealed = 'true';
          el.style.willChange = 'transform, opacity';
          el.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          setTimeout(() => {
            if (el) el.style.willChange = 'auto';
          }, 900);
        };

        ScrollTrigger.create({
          trigger: archWrapperRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            if (imgRef.current && typeof imgRef.current.decode === 'function') {
              imgRef.current.decode().then(triggerReveal).catch(triggerReveal);
            } else {
              triggerReveal();
            }
          }
        });
      }
    }, sectionRef);

    return () => {
      document.body.classList.remove('photo-active');
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  const couple = config.couple || {};
  const altText = couple.alt || coupleLine;
  const groomName = coupleNames[0];
  const brideName = coupleNames[1];

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 px-4 flex flex-col items-center bg-transparent cv-auto overflow-hidden"
      style={{ containIntrinsicSize: '0 1160px' }}
    >
      <div className="w-full max-w-[560px] mx-auto flex flex-col items-center text-center">
        {/* Label */}
        <p className="font-label font-bold text-[12px] sm:text-[13px] tracking-[0.22em] uppercase text-gold-text mb-2">
          TWO SOULS, ONE JOURNEY
        </p>

        {/* Heading with line-by-line split reveal */}
        <h2 className="font-display font-semibold text-heading text-olive-deep leading-[1.15] mb-4 reveal-line-wrap">
          <span ref={headingLineRef} className="reveal-line-inner">
            United in Faith &amp; Love
          </span>
        </h2>

        {/* 3-Line Couple Names: Groom first, then &, then Bride */}
        <div className="w-full my-1 mb-8 flex flex-col items-center justify-center select-none">
          <div className="w-full text-center">
            <h3 className="couple-name-title">
              {groomName}
            </h3>
          </div>

          <div className="w-full max-w-[190px] flex items-center justify-center my-[6px] select-none">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#C8A96A] to-[#C8A96A]" />
            <span className="couple-name-title px-4 leading-none text-2xl sm:text-3xl text-gold-text">
              &amp;
            </span>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#C8A96A] to-[#C8A96A]" />
          </div>

          <div className="w-full text-center">
            <h3 className="couple-name-title">
              {brideName}
            </h3>
          </div>
        </div>

        {/* Photo Container with Outside Elements */}
        <div className="relative w-full max-w-[440px] mx-auto flex items-center justify-center my-4">
          {/* Outside Decorative Elements (not clipping the photo) */}
          <div className="pointer-events-none select-none">
            {/* Small gold crescent and star above the dome */}
            <div
              className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
              aria-hidden="true"
            >
              <svg viewBox="0 0 32 32" className="w-6 h-6 text-[#C8A96A]" fill="currentColor">
                <path d="M15 4 A 11 11 0 1 0 24 23 A 9 9 0 1 1 15 4 Z" />
                <polygon points="20,7 21.2,10 24.5,10.2 22,12.2 22.8,15.2 20,13.5 17.2,15.2 18,12.2 15.5,10.2 18.8,10" />
              </svg>
            </div>

            {/* Hanging Lanterns on each side */}
            <div
              className="absolute top-1 -left-4 sm:-left-7 z-20 pointer-events-none"
              aria-hidden="true"
            >
              <svg className="w-7 h-16 sm:w-9 sm:h-20">
                <use href="#lantern" />
              </svg>
            </div>
            <div
              className="absolute top-1 -right-4 sm:-right-7 z-20 pointer-events-none"
              aria-hidden="true"
            >
              <svg className="w-7 h-16 sm:w-9 sm:h-20">
                <use href="#lantern" />
              </svg>
            </div>

            {/* Bottom corner eucalyptus sprigs and soft roses */}
            <div
              className="absolute -bottom-3 -left-5 sm:-left-7 w-16 h-24 sm:w-20 sm:h-28 pointer-events-none z-20"
              aria-hidden="true"
            >
              <svg viewBox="0 0 100 120" className="w-full h-full transform -rotate-15 scale-90">
                <use href="#eucalyptus-sprig" />
              </svg>
            </div>
            <div
              className="absolute -bottom-4 -left-3 sm:-left-4 w-12 h-12 sm:w-16 sm:h-16 pointer-events-none z-30"
              aria-hidden="true"
            >
              <svg viewBox="0 0 80 80" className="w-full h-full transform -rotate-10">
                <use href="#soft-rose" />
              </svg>
            </div>

            <div
              className="absolute -bottom-3 -right-5 sm:-right-7 w-16 h-24 sm:w-20 sm:h-28 pointer-events-none z-20"
              aria-hidden="true"
            >
              <svg viewBox="0 0 100 120" className="w-full h-full transform rotate-15 scale-x-[-1] scale-90">
                <use href="#eucalyptus-sprig" />
              </svg>
            </div>
            <div
              className="absolute -bottom-4 -right-3 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 pointer-events-none z-30"
              aria-hidden="true"
            >
              <svg viewBox="0 0 80 80" className="w-full h-full transform rotate-10">
                <use href="#soft-rose" />
              </svg>
            </div>
          </div>

          {/* Dome Window Frame: plain CSS with border and inset line */}
          <div
            ref={archWrapperRef}
            className="relative z-10 mx-auto select-none overflow-hidden bg-[#FBF7F0] border-[3px] border-[#C8A96A] shadow-[0_12px_24px_rgba(63,74,60,0.12)]"
            style={{
              width: 'min(84vw, 400px)',
              aspectRatio: '3 / 4',
              borderRadius: '999px 999px 28px 28px',
              opacity: 0,
              transform: 'translateY(16px)'
            }}
          >
            {/* Second gold line inset 8px (1px, rounded the same way) */}
            <div
              className="absolute inset-[8px] border border-[#C8A96A] pointer-events-none z-10"
              style={{ borderRadius: '991px 991px 20px 20px' }}
              aria-hidden="true"
            />

            {/* Photo fills the dome window */}
            <picture>
              <source srcSet="/images/optimized/couple.webp" type="image/webp" />
              <img
                ref={imgRef}
                src="/images/optimized/couple.jpg"
                alt={altText}
                width={900}
                height={1200}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover block select-none pointer-events-none"
                style={{ objectPosition: couple.objectPosition || 'center 30%' }}
              />
            </picture>
          </div>
        </div>

        {/* Optional Caption */}
        {couple.caption && (
          <p className="font-body italic font-medium text-[17px] sm:text-[19px] text-olive mt-6">
            "{couple.caption}"
          </p>
        )}

        {/* Gold divider with 8-pointed star */}
        <div className="w-48 sm:w-60 mt-6" aria-hidden="true">
          <svg viewBox="0 0 240 24" className="w-full h-5">
            <use href="#star-divider" />
          </svg>
        </div>
      </div>
    </section>
  );
}
