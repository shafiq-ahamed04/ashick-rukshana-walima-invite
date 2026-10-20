import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { generateIcsBlob, getGoogleCalendarUrl } from '../utils/dates';
import { EASE, DUR, STAGGER, DISTANCE, isReducedMotion } from '../lib/motion';

gsap.registerPlugin(ScrollTrigger);

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarCard({ config }) {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const headingLineRef = useRef(null);
  const targetDayRef = useRef(null);
  const gridRowsRef = useRef(null);
  const actionsRef = useRef(null);

  const walima = config.walima || {};
  const dateStr = walima.date;

  useEffect(() => {
    if (!dateStr || isReducedMotion()) return;

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

      // 2. The card fades up
      const calTl = gsap.timeline({
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          once: true
        }
      });

      calTl.fromTo(
        cardRef.current,
        { opacity: 0, y: DISTANCE },
        { opacity: 1, y: 0, duration: DUR, ease: EASE },
        0
      );

      // 3. Month grid fades in by row
      const rows = gridRowsRef.current?.querySelectorAll('.grid-row-item') || [];
      if (rows.length > 0) {
        calTl.fromTo(
          rows,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: EASE },
          0.3
        );
      }

      // 4. The 30th gets a ring that scales 0.6 to 1
      if (targetDayRef.current) {
        calTl.fromTo(
          targetDayRef.current,
          { scale: 0.6, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: 'back.out(1.5)',
            onComplete: () => {
              targetDayRef.current?.classList.add('calendar-ring-pulse');
            }
          },
          0.7
        );
      }

      // 5. Actions fade in
      if (actionsRef.current) {
        calTl.fromTo(
          actionsRef.current.children,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, stagger: STAGGER, ease: EASE },
          0.85
        );
      }
    }, sectionRef);

    // Pause infinite animations when calendar is off-screen
    const calObserver = new IntersectionObserver((entries) => {
      const isVisible = entries[0]?.isIntersecting ?? false;
      const sprigs = sectionRef.current?.querySelectorAll('.edge-sway-left, .edge-sway-right, .calendar-ring-pulse');
      sprigs?.forEach((el) => {
        el.style.animationPlayState = isVisible ? 'running' : 'paused';
      });
    }, { threshold: 0.05 });

    if (sectionRef.current) {
      calObserver.observe(sectionRef.current);
    }

    return () => {
      calObserver.disconnect();
      ctx.revert();
    };
  }, [dateStr]);

  if (!dateStr) return null;

  // Generate calendar based on walima.date
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const targetDay = parseInt(dayStr, 10);

  const monthName = new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(year, month, 1));

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Group days into 7-day rows for row-by-row fading
  const allCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    allCells.push({ blank: true, key: `b-${i}` });
  }
  for (let d = 1; d <= totalDays; d++) {
    allCells.push({ blank: false, day: d, key: `d-${d}` });
  }
  // Pad remaining row to multiple of 7
  while (allCells.length % 7 !== 0) {
    allCells.push({ blank: true, key: `end-${allCells.length}` });
  }

  const rows = [];
  for (let i = 0; i < allCells.length; i += 7) {
    rows.push(allCells.slice(i, i + 7));
  }

  const handleDownloadIcs = () => {
    const blob = generateIcsBlob({
      groom: config.groom,
      bride: config.bride,
      walima
    });
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'walima.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const gCalUrl = getGoogleCalendarUrl({
    groom: config.groom,
    bride: config.bride,
    walima
  });

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 px-4 flex flex-col items-center bg-transparent"
    >
      <div className="w-full max-w-[480px] mx-auto text-center">
        {/* Label */}
        <p className="font-label font-bold text-[12px] sm:text-[13px] tracking-[0.22em] uppercase text-gold-text mb-2">
          MARK THE DATE
        </p>

        {/* Heading with line-split */}
        <h2 className="font-display font-semibold text-heading text-olive-deep leading-[1.15] mb-8 reveal-line-wrap">
          <span ref={headingLineRef} className="reveal-line-inner">
            Join Our Celebration
          </span>
        </h2>

        {/* Calendar Card */}
        <div
          ref={cardRef}
          className="relative rounded-3xl bg-[#FBF7F0]/92 border border-[#C8A96A]/60 shadow-card p-6 sm:p-8 flex flex-col items-center overflow-hidden opacity-0"
        >
          {/* Inner hairline border */}
          <div
            className="absolute inset-[6px] rounded-[20px] border border-[#C8A96A]/35 pointer-events-none"
            aria-hidden="true"
          />

          {/* Eucalyptus Sprigs on Corners */}
          <div
            className="absolute -top-3 -left-3 w-16 h-20 pointer-events-none opacity-80 edge-sway-left"
            aria-hidden="true"
          >
            <svg viewBox="0 0 100 120" className="w-full h-full transform -rotate-45 scale-90">
              <use href="#eucalyptus-sprig" />
            </svg>
          </div>
          <div
            className="absolute -top-3 -right-3 w-16 h-20 pointer-events-none opacity-80 edge-sway-right"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 100 120"
              className="w-full h-full transform rotate-45 scale-x-[-1] scale-90"
            >
              <use href="#eucalyptus-sprig" />
            </svg>
          </div>

          {/* Month & Year Title */}
          <h3 className="font-display font-semibold text-2xl text-olive-deep mb-5 tracking-wide">
            {monthName}
          </h3>

          {/* Weekday Initials Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 w-full max-w-[340px] mb-2">
            {WEEKDAY_INITIALS.map((init, i) => (
              <div
                key={i}
                className="text-center font-label font-medium text-[12px] text-gold-text uppercase py-1 select-none"
              >
                {init}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid (Fades in row-by-row) */}
          <div ref={gridRowsRef} className="w-full max-w-[340px] mb-6 space-y-1 sm:space-y-2">
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-7 gap-1 sm:gap-2 grid-row-item">
                {row.map((cell) => {
                  if (cell.blank) {
                    return <div key={cell.key} className="w-9 h-9 sm:w-10 sm:h-10 mx-auto" />;
                  }

                  const isEventDay = cell.day === targetDay;

                  if (isEventDay) {
                    return (
                      <div
                        key={cell.key}
                        ref={targetDayRef}
                        className="calendar-target-day relative w-9 h-9 sm:w-10 sm:h-10 mx-auto flex flex-col items-center justify-center rounded-full bg-[#E8C4C4]/60 border border-[#C8A96A] text-olive-deep font-display font-semibold text-base sm:text-lg select-none"
                      >
                        <span
                          className="absolute -top-1.5 text-[9px] text-[#C8A96A] leading-none"
                          aria-hidden="true"
                        >
                          ✦
                        </span>
                        <span className="leading-none pt-0.5">{cell.day}</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={cell.key}
                      className="w-9 h-9 sm:w-10 sm:h-10 mx-auto flex items-center justify-center rounded-full text-olive/80 font-display font-medium text-base sm:text-lg select-none"
                    >
                      {cell.day}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Text Below the Grid */}
          <div className="pt-3 border-t border-[#C8A96A]/30 w-full text-center">
            <p className="font-display font-semibold text-lg text-olive-deep tracking-wide">
              Walima {walima.time ? `· ${walima.time}` : ''}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div ref={actionsRef} className="mt-8 flex flex-col items-center space-y-3.5">
          <button
            type="button"
            onClick={handleDownloadIcs}
            className="inline-flex items-center justify-center min-h-[46px] px-8 py-3 rounded-full border border-[#C8A96A] bg-[#FBF7F0] text-gold-text hover:bg-[#F6E6E4]/80 active:scale-[0.98] transition-all duration-200 font-label font-medium text-[14px] tracking-[0.2em] uppercase shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C8A96A] focus:ring-offset-2 opacity-0"
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Save the Walima
          </button>

          <a
            href={gCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-[44px] text-gold-text hover:text-olive-deep py-2 font-label font-medium text-[14px] tracking-[0.16em] uppercase transition-colors focus:outline-none focus:underline opacity-0"
          >
            <span>Open in Google Calendar</span>
            <svg
              className="w-3.5 h-3.5 ml-1.5 opacity-80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
