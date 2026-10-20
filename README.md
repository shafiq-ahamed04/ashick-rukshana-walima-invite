# Walima Wedding Invitation | Ashick & Rukshana Parveen

A private, single-page WALIMA-ONLY wedding invitation website celebrating the Walima of Ashick & Rukshana Parveen, featuring a romantic, slightly vintage "ivory garden" aesthetic. Built with React, Vite, Tailwind CSS, GSAP, and desktop-only Lenis smooth scrolling.

## Tech Stack
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + Vanilla CSS variables
- **Animations:** GSAP 3 + ScrollTrigger (reveals, intro overlay, foliage parallax)
- **Smooth Scroll:** Lenis (active strictly on desktop pointer devices; native touch scrolling on mobile)
- **Typography:** Bundled locally via `@fontsource` (Allura, Cormorant Garamond, Jost, Amiri)
- **Deployment:** Vercel (static site output with immutable asset headers and anti-crawling directives)

## Project Structure
```
ar-walima/
├── public/
│   ├── fonts/               # Preloaded WOFF2 key font files
│   ├── images/optimized/    # Transparent WebP & PNG AR monograms
│   ├── og-image.jpg         # 1200x630 Open Graph preview image (<40KB)
│   └── robots.txt           # Crawler disallow rules
├── scripts/
│   ├── make-logo.js         # RGBA black-background de-matting & WebP generator
│   └── make-og.js           # Lightweight SVG-to-JPG Open Graph generator
├── src/
│   ├── components/
│   │   ├── CalendarCard.jsx # Dynamic December 2026 calendar & RFC 5545 .ics download
│   │   ├── Closing.jsx      # Closing blessings, static monogram, back to top
│   │   ├── Countdown.jsx    # Real-time celebratory countdown timer
│   │   ├── Hero.jsx         # 100svh arched window invitation hero
│   │   ├── IntroOverlay.jsx # 3.4s automatic monogram intro animation
│   │   ├── PetalCanvas.jsx  # DPR-capped canvas with falling petals & tap bursts
│   │   ├── SvgDefs.jsx      # Reusable SVG symbols (foliage, lanterns, florals)
│   │   └── Welcome.jsx      # Islamic blessings, Quranic verse & dua
│   ├── config/
│   │   └── wedding.js       # Single source of truth for all wedding details
│   ├── utils/
│   │   └── dates.js         # IST date/time parsing, RFC 5545 ICS generator, Google Calendar URLs
│   ├── App.jsx              # Main page assembly & Lenis desktop integration
│   ├── index.css            # Design tokens, fonts, and keyframes
│   └── main.jsx             # React DOM entry point
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

## Setup & Running Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Process Monogram Logo (if changing source image):**
   ```bash
   npm run make-logo
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Production Build:**
   ```bash
   npm run build
   ```

5. **Preview Production Build:**
   ```bash
   npm run preview
   ```

## Privacy & Deployment
- The website is designed for direct link sharing only.
- Strict `noindex`, `nofollow`, `noarchive`, `nosnippet`, and `noimageindex` headers and robots directives are configured.
- Zero analytics, trackers, or external third-party requests.
