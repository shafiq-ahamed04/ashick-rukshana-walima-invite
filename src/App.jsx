import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { wedding } from './config/wedding';
import SvgDefs from './components/SvgDefs';
import PetalCanvas from './components/PetalCanvas';
import IntroOverlay from './components/IntroOverlay';
import Hero from './components/Hero';
import SectionDivider from './components/SectionDivider';

const Welcome = lazy(() => import('./components/Welcome'));
const WalimaEvent = lazy(() => import('./components/WalimaEvent'));
const CouplePhoto = lazy(() => import('./components/CouplePhoto'));
const Countdown = lazy(() => import('./components/Countdown'));
const CalendarCard = lazy(() => import('./components/CalendarCard'));
const Closing = lazy(() => import('./components/Closing'));

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export default function App() {
  const hasIntro = Boolean(wedding.monogramImage);
  const [introDismissed, setIntroDismissed] = useState(!hasIntro);
  const [startHeroReveal, setStartHeroReveal] = useState(!hasIntro);
  const lenisRef = useRef(null);

  // Desktop-only Lenis smooth scroll (never on touch / mobile devices)
  useEffect(() => {
    const isDesktopPointer = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isDesktopPointer || prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 0, // completely ignore touch
      wheelMultiplier: 1,
      smoothWheel: true
    });

    lenisRef.current = lenis;

    // Lock desktop scroll while intro is playing
    if (!introDismissed) {
      lenis.stop();
    }

    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const handleIntroHeroReveal = useCallback(() => {
    setStartHeroReveal(true);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroDismissed(true);
    setStartHeroReveal(true);
    if (lenisRef.current) {
      lenisRef.current.start();
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full text-olive selection:bg-[#E8C4C4] selection:text-olive-deep">
      {/* 2px Dithering static noise overlay to prevent color banding */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* SVG Symbol Definitions */}
      <SvgDefs />

      {/* Falling Petals Canvas */}
      <PetalCanvas />

      {/* Single Mount: Lantern Glow Intro Overlay */}
      {!introDismissed && wedding.monogramImage && (
        <IntroOverlay
          monogramImage={wedding.monogramImage}
          onHeroReveal={handleIntroHeroReveal}
          onComplete={handleIntroComplete}
        />
      )}

      {/* Main Wedding Invitation Sections with Soft Overlap Seam Dividers */}
      <main id="top" className="relative z-10 w-full flex flex-col items-center">
        <Hero config={wedding} startReveal={startHeroReveal} />
        <SectionDivider />

        <Suspense fallback={null}>
          <Welcome config={wedding} />
          <SectionDivider />

          <WalimaEvent config={wedding} />
          <SectionDivider />

          <CouplePhoto config={wedding} />

          {wedding.walima?.date && wedding.walima?.time && (
            <>
              <SectionDivider />
              <Countdown walima={wedding.walima} />
            </>
          )}

          {wedding.walima?.date && (
            <>
              <SectionDivider />
              <CalendarCard config={wedding} />
            </>
          )}

          <SectionDivider />
          <Closing config={wedding} />
        </Suspense>
      </main>
    </div>
  );
}
