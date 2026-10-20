import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DUR, EASE, isReducedMotion } from '../lib/motion';

export default function SectionDivider() {
  const dividerRef = useRef(null);

  useEffect(() => {
    if (!dividerRef.current) return;
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        dividerRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 0.75,
          scale: 1,
          duration: DUR,
          ease: EASE,
          scrollTrigger: {
            trigger: dividerRef.current,
            start: 'top 90%',
            once: true
          }
        }
      );
    }, dividerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={dividerRef}
      className="relative z-10 w-full max-w-[240px] sm:max-w-[280px] my-[-16px] sm:my-[-24px] mx-auto pointer-events-none opacity-0 select-none"
      aria-hidden="true"
    >
      <svg viewBox="0 0 320 80" className="w-full h-auto">
        <use href="#floral-arch" />
      </svg>
    </div>
  );
}
