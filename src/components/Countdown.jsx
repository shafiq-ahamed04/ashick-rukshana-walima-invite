import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getWalimaStartInstant } from '../utils/dates';
import { EASE, DUR, isReducedMotion } from '../lib/motion';

gsap.registerPlugin(ScrollTrigger);

// Subcomponent for smooth individual digit slide-up on change
function AnimatedDigit({ value }) {
  const numStr = String(Math.max(0, value)).padStart(2, '0');
  const digitRef = useRef(null);

  useEffect(() => {
    if (isReducedMotion() || !digitRef.current) return;
    gsap.fromTo(
      digitRef.current,
      { y: 8, opacity: 0.4 },
      { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
    );
  }, [numStr]);

  return (
    <span
      ref={digitRef}
      className="font-display font-semibold text-2xl sm:text-4xl text-olive-deep tabular-nums leading-tight block w-[48px] sm:w-[68px] text-center"
    >
      {numStr}
    </span>
  );
}

export default function Countdown({ walima }) {
  const sectionRef = useRef(null);
  const headingLineRef = useRef(null);
  const cardsRef = useRef(null);

  const targetDate = walima?.date ? getWalimaStartInstant(walima.date, walima.time) : null;
  const durationHours = walima?.durationHours || 3;
  const endDate = targetDate ? new Date(targetDate.getTime() + durationHours * 60 * 60 * 1000) : null;

  const calculateTime = () => {
    if (!targetDate) return { status: 'none', days: 0, hours: 0, minutes: 0, seconds: 0 };
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      return { status: 'countdown', days, hours, minutes, seconds };
    }

    if (endDate && now.getTime() < endDate.getTime()) {
      return { status: 'begun', days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return { status: 'ended', days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTime);

  useEffect(() => {
    if (!targetDate) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [walima?.date, walima?.time]);

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

      // 2. The four cards pop in one after another (scale 0.9 to 1, 0.1s apart)
      const cards = cardsRef.current?.querySelectorAll('.countdown-unit-card') || [];
      if (cards.length > 0) {
        gsap.set(cards, { scale: 0.9, opacity: 0 });
        ScrollTrigger.create({
          trigger: cardsRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            requestAnimationFrame(() => {
              gsap.to(cards, {
                scale: 1,
                opacity: 1,
                duration: 0.7,
                stagger: 0.08,
                ease: EASE
              });
            });
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (!targetDate) return null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 px-4 flex flex-col items-center bg-transparent"
    >
      <div className="w-full max-w-[560px] mx-auto text-center">
        {/* Label */}
        <p className="font-label font-bold text-[12px] sm:text-[13px] tracking-[0.22em] uppercase text-gold-text mb-2">
          UNTIL OUR CELEBRATION
        </p>

        {/* Heading with line split */}
        <h2 className="font-display font-semibold text-heading text-olive-deep leading-[1.15] mb-8 reveal-line-wrap">
          <span ref={headingLineRef} className="reveal-line-inner">
            Counting the days
          </span>
        </h2>

        {/* Countdown Cards or Status Messages */}
        {timeLeft.status === 'countdown' && (
          <div ref={cardsRef} className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-[460px] mx-auto">
            {[
              { label: 'DAYS', value: timeLeft.days },
              { label: 'HOURS', value: timeLeft.hours },
              { label: 'MINUTES', value: timeLeft.minutes },
              { label: 'SECONDS', value: timeLeft.seconds }
            ].map((unit, idx) => (
              <div
                key={idx}
                className="countdown-unit-card relative rounded-2xl bg-[#FBF7F0]/92 border border-[#C8A96A]/50 shadow-card py-4 sm:py-5 px-1 sm:px-2 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[95px] opacity-0"
              >
                <div
                  className="absolute inset-[3px] rounded-[13px] border border-[#C8A96A]/25 pointer-events-none"
                  aria-hidden="true"
                />
                <AnimatedDigit value={unit.value} />
                <span className="font-label font-medium text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-gold-text mt-1.5 select-none">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {timeLeft.status === 'begun' && (
          <div className="rounded-2xl bg-[#FBF7F0]/92 border border-[#C8A96A]/60 p-6 sm:p-8 shadow-card max-w-[480px] mx-auto">
            <p className="font-arabic font-bold text-2xl text-olive-deep mb-2">
              الْحَمْدُ لِلَّهِ
            </p>
            <p className="font-display font-semibold text-xl sm:text-2xl text-olive-deep">
              Alhamdulillah, the celebration has begun
            </p>
          </div>
        )}

        {timeLeft.status === 'ended' && (
          <div className="rounded-2xl bg-[#FBF7F0]/92 border border-[#C8A96A]/60 p-6 sm:p-8 shadow-card max-w-[480px] mx-auto">
            <p className="font-arabic font-bold text-2xl text-olive-deep mb-2">
              جَزَاكُمُ اللَّهُ خَيْرًا
            </p>
            <p className="font-display italic font-medium text-lg sm:text-xl text-olive-deep">
              Jazakumullahu khairan for your duas and presence
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
