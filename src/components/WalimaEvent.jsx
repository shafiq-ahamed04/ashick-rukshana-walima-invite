import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatEventDate } from '../utils/dates';
import { EASE, DUR, STAGGER, DISTANCE, isReducedMotion } from '../lib/motion';

gsap.registerPlugin(ScrollTrigger);

export default function WalimaEvent({ config }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
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

      // 2. Walima card rises with scale 0.97 -> 1
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: DISTANCE + 8, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: DUR,
            ease: EASE,
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 85%',
              once: true
            }
          }
        );
      }

      // 3. Rows (date, time, venue, city) stagger in
      const rows = cardRef.current?.querySelectorAll('.reveal-row') || [];
      if (rows.length > 0) {
        ScrollTrigger.batch(rows, {
          start: 'top 80%',
          once: true,
          onEnter: (batch) => {
            requestAnimationFrame(() => {
              gsap.fromTo(
                batch,
                { opacity: 0, y: 18 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.75,
                  stagger: STAGGER,
                  ease: EASE,
                  onComplete: () => gsap.set(batch, { clearProps: 'willChange' })
                }
              );
            });
          }
        });
      }

      // 4. Action button & accordion reveal
      const actions = cardRef.current?.querySelectorAll('.reveal-action') || [];
      if (actions.length > 0) {
        ScrollTrigger.batch(actions, {
          start: 'top 85%',
          once: true,
          onEnter: (batch) => {
            requestAnimationFrame(() => {
              gsap.fromTo(
                batch,
                { opacity: 0, y: 16 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.75,
                  stagger: STAGGER,
                  ease: EASE
                }
              );
            });
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const walima = config.walima || {};
  const formattedFullDate = formatEventDate(walima.date);
  const mapUrl = walima.mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(walima.mapQuery)}`
    : null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 px-4 flex flex-col items-center bg-transparent"
    >
      <div className="w-full max-w-[560px] mx-auto">
        {/* Main Event Card */}
        <div
          ref={cardRef}
          className="relative rounded-3xl bg-[#FBF7F0]/92 border border-[#C8A96A]/60 shadow-card p-6 sm:p-10 flex flex-col items-center text-center opacity-0"
        >
          {/* Inner hairline border */}
          <div
            className="absolute inset-[6px] rounded-[20px] border border-[#C8A96A]/35 pointer-events-none"
            aria-hidden="true"
          />

          {/* Floral Arch Header */}
          <div className="w-44 sm:w-56 mb-4" aria-hidden="true">
            <svg viewBox="0 0 320 80" className="w-full h-auto">
              <use href="#floral-arch" />
            </svg>
          </div>

          {/* Label */}
          <p className="font-label font-bold text-[12px] sm:text-[13px] tracking-[0.22em] uppercase text-gold-text mb-2">
            A FEAST OF JOY AND BLESSINGS
          </p>

          {/* Line-by-Line Heading */}
          <h2 className="font-display font-semibold text-heading text-olive-deep leading-[1.15] mb-4 reveal-line-wrap">
            <span ref={headingLineRef} className="reveal-line-inner">
              The Walima
            </span>
          </h2>

          {/* Blurb */}
          <p className="font-body font-medium text-[18px] sm:text-[20px] text-olive leading-[1.6] max-w-[440px] mb-8">
            Join us as we celebrate with food, family and prayers for our new beginning.
          </p>

          {/* Event Details Grid (rows stagger in) */}
          <div className="w-full space-y-6 pt-2 pb-6 border-y border-[#C8A96A]/30">
            {/* Date */}
            {formattedFullDate && (
              <div className="flex flex-col items-center reveal-row opacity-0">
                <span className="font-label text-[11px] sm:text-[12px] tracking-[0.22em] uppercase text-gold-text mb-1">
                  DATE
                </span>
                <p className="font-display font-semibold text-xl sm:text-2xl text-olive-deep">
                  {formattedFullDate}
                </p>
              </div>
            )}

            {/* Time */}
            {walima.time && (
              <div className="flex flex-col items-center reveal-row opacity-0">
                <span className="font-label text-[11px] sm:text-[12px] tracking-[0.22em] uppercase text-gold-text mb-1">
                  TIME
                </span>
                <p className="font-display font-semibold text-xl sm:text-2xl text-olive-deep">
                  {walima.time}
                </p>
              </div>
            )}

            {/* Venue & City */}
            {(walima.venue || walima.city) && (
              <div className="flex flex-col items-center reveal-row opacity-0">
                <span className="font-label text-[11px] sm:text-[12px] tracking-[0.22em] uppercase text-gold-text mb-1">
                  VENUE
                </span>
                {walima.venue && (
                  <p className="font-display font-semibold text-xl sm:text-2xl text-olive-deep">
                    {walima.venue}
                  </p>
                )}
                {walima.city && (
                  <p className="font-body font-medium text-[18px] text-olive mt-0.5">
                    {walima.city}
                  </p>
                )}
              </div>
            )}

            {/* Optional Note (floor 18px) */}
            {walima.note && (
              <div className="pt-2 reveal-row opacity-0">
                <p className="font-body italic font-medium text-[18px] text-olive">
                  {walima.note}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons: Get Directions & Accordion */}
          <div className="w-full mt-6 flex flex-col items-center space-y-4">
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-[44px] px-8 py-3 rounded-full border border-[#C8A96A] bg-[#FBF7F0] text-gold-text hover:bg-[#F6E6E4]/70 active:scale-[0.98] transition-all duration-200 font-label font-medium text-[14px] tracking-[0.18em] uppercase shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C8A96A] focus:ring-offset-2 reveal-action opacity-0"
              >
                <svg
                  className="w-4 h-4 mr-2.5 text-gold-text"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Get Directions
              </a>
            )}

            {/* The details accordion */}
            <div className="w-full max-w-[420px] pt-2 reveal-action opacity-0">
              <button
                type="button"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className="w-full flex items-center justify-center min-h-[44px] text-olive hover:text-olive-deep py-2 transition-colors font-label font-medium text-[14px] tracking-[0.2em] uppercase focus:outline-none focus:ring-1 focus:ring-[#C8A96A]"
                aria-expanded={isDetailsOpen}
                aria-controls="walima-details-panel"
              >
                <span>The details</span>
                <svg
                  className={`w-3.5 h-3.5 ml-2 transition-transform duration-300 text-gold-text ${
                    isDetailsOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDetailsOpen && (
                <div
                  id="walima-details-panel"
                  className="mt-3 p-4 rounded-xl bg-[#F6E6E4]/50 border border-[#C8A96A]/30 text-left space-y-2.5"
                >
                  <div className="flex items-start text-olive">
                    <span className="text-[#C8A96A] mr-2">✦</span>
                    <p className="font-body text-[18px] leading-relaxed">
                      <strong>Dining:</strong> A traditional Walima feast with seating and warm hospitality.
                    </p>
                  </div>
                  <div className="flex items-start text-olive">
                    <span className="text-[#C8A96A] mr-2">✦</span>
                    <p className="font-body text-[18px] leading-relaxed">
                      <strong>Attire:</strong> Modest festive / traditional celebration wear.
                    </p>
                  </div>
                  <div className="flex items-start text-olive">
                    <span className="text-[#C8A96A] mr-2">✦</span>
                    <p className="font-body text-[18px] leading-relaxed">
                      <strong>Parking:</strong> Venue parking is available on premises.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Programme Timeline (ONLY if config.programme has entries) */}
        {config.programme && config.programme.length > 0 && (
          <div className="mt-16 w-full flex flex-col items-center">
            <p className="font-label font-bold text-[12px] sm:text-[13px] tracking-[0.22em] uppercase text-gold-text mb-2">
              SCHEDULE OF OCCASION
            </p>
            <h3 className="font-display font-semibold text-2xl sm:text-3xl text-olive-deep mb-8">
              Programme
            </h3>

            <div className="relative border-l border-[#C8A96A]/60 ml-4 pl-6 space-y-8">
              {config.programme.map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#FBF7F0] border border-[#C8A96A] flex items-center justify-center">
                    <span className="text-[8px] text-[#C8A96A]">✦</span>
                  </div>
                  <span className="font-label text-[12px] tracking-[0.18em] uppercase text-gold-text block mb-1">
                    {item.time}
                  </span>
                  <h4 className="font-display font-semibold text-xl text-olive-deep">
                    {item.title}
                  </h4>
                  {item.note && (
                    <p className="font-body text-[16px] text-olive mt-1 leading-relaxed">
                      {item.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
