import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export const EASE = 'power3.out';
export const EASE_SOFT = 'power2.out';
export const DUR = 0.9;
export const STAGGER = 0.12;
export const DISTANCE = 28;

export const isReducedMotion = () => {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const isDesktopOrTablet = () => {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
};

/**
 * Reusable section reveal helper with ScrollTrigger.batch, once: true,
 * and will-change cleanup after animation completes.
 */
export function createSectionReveal(container, targets, customConfig = {}) {
  if (!container || !targets) return null;

  if (isReducedMotion()) {
    gsap.set(targets, { opacity: 1, y: 0, scale: 1 });
    return null;
  }

  const elements = typeof targets === 'string'
    ? container.querySelectorAll(targets)
    : targets;

  if (!elements || elements.length === 0) return null;

  // Set initial states
  gsap.set(elements, { opacity: 0, y: DISTANCE, willChange: 'transform, opacity' });

  const trigger = ScrollTrigger.batch(elements, {
    start: customConfig.start || 'top 85%',
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: customConfig.duration || DUR,
        stagger: customConfig.stagger !== undefined ? customConfig.stagger : STAGGER,
        ease: customConfig.ease || EASE,
        overwrite: 'auto',
        onComplete: () => {
          gsap.set(batch, { clearProps: 'willChange' });
        }
      });
    }
  });

  return trigger;
}
