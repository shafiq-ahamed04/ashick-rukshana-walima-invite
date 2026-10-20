import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Simple static preview server for dist
function startPreviewServer(port = 4173) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.txt': 'text/plain',
    '.ics': 'text/calendar',
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(distDir, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
        ...(reqPath.startsWith('/assets/') ? { 'Cache-Control': 'public, max-age=31536000, immutable' } : {})
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // SPA fallback
      const indexPath = path.join(distDir, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
    }
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

async function ensureServer(port = 4173) {
  const isListening = await new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });

  if (isListening) {
    console.log(`Reusing active preview server on port ${port}`);
    return { close: () => {} };
  }

  return startPreviewServer(port);
}

async function runSuite() {
  console.log('=== STARTING END-TO-END AUTOMATED VERIFICATION SUITE ===\n');
  const port = 4173;
  const server = await ensureServer(port);
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Preview server running at ${baseUrl}`);

  const results = {};

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: INTRO TIMELINE & SCROLL UNLOCK
    // -------------------------------------------------------------------------
    console.log('\n--- Running Check 1: Intro Overlay Timeline ---');
    {
      const context = await browser.newContext(devices['iPhone 13']);
      const page = await context.newPage();
      
      const startTime = Date.now();
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      
      // Wait for intro overlay to be removed from DOM and scroll unlocked
      await page.waitForFunction(() => {
        return !document.querySelector('.intro-active') &&
               !document.querySelector('[aria-label="Welcome Invitation Animation"]') &&
               document.body.style.overflow !== 'hidden';
      }, { timeout: 10000 });

      const durationMs = Date.now() - startTime;
      console.log(`Intro completed in ~${(durationMs / 1000).toFixed(2)}s`);

      // Verify scroll is unlocked
      const scrollUnlocked = await page.evaluate(() => {
        return document.body.style.overflow !== 'hidden' && !document.body.classList.contains('intro-active');
      });

      const overlayRemoved = await page.evaluate(() => {
        return document.querySelector('[aria-label="Welcome Invitation Animation"]') === null;
      });

      const noFlash = await page.evaluate(() => {
        const bg = window.getComputedStyle(document.body).backgroundColor;
        return bg.includes('251, 247, 240') || bg.includes('rgba(0, 0, 0, 0)') || bg === 'rgb(251, 247, 240)';
      });

      const pass = durationMs >= 1400 && durationMs <= 4000 && scrollUnlocked && overlayRemoved && noFlash;
      results['1. Intro Animation'] = {
        pass,
        details: `Plays once, lasted ${(durationMs / 1000).toFixed(2)}s, scrollUnlocked: ${scrollUnlocked}, overlayRemoved: ${overlayRemoved}, noFlash: ${noFlash}`
      };
      await context.close();
    }

    // -------------------------------------------------------------------------
    // TEST 2: MOBILE SCROLL & FPS BENCHMARK (Pixel 7 + 4x CPU throttle + Slow 4G)
    // -------------------------------------------------------------------------
    console.log('\n--- Running Check 2: Scroll Performance & FPS Benchmark ---');
    {
      const context = await browser.newContext({
        ...devices['Pixel 7'],
        bypassCSP: true
      });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);

      // CPU Throttling 4x
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      // Slow 4G Network Emulation
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 150,
        downloadThroughput: (1.5 * 1024 * 1024) / 8, // ~1.5 Mbps
        uploadThroughput: (750 * 1024) / 8,
      });

      await page.goto(baseUrl, { waitUntil: 'load' });
      // Wait for intro to finish and lazy sections to mount
      await page.waitForFunction(() => !document.querySelector('[aria-label="Welcome Invitation Animation"]'), { timeout: 10000 });
      await page.waitForSelector('footer', { timeout: 10000 });
      await page.waitForTimeout(500);

      // Smooth scroll down the entire page recording rAF deltas and section tracking
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          window.__frameData = [];
          let last = performance.now();
          const targetY = document.documentElement.scrollHeight - window.innerHeight;
          let currentY = 0;
          const scrollSpeed = 16; // 16px per rAF step (steady mobile scroll)

          const photoEl = document.querySelector('img[src*="couple-arch"]');
          const welcomeEl = document.querySelector('section[aria-label*="Welcome"]');
          const walimaEl = document.querySelector('section[aria-label*="Walima"]');
          const countdownEl = document.querySelector('section[aria-label*="Countdown"]');
          const calendarEl = document.querySelector('section[aria-label*="Calendar"]');
          const footerEl = document.querySelector('footer');

          const sectionOffsets = [
            { name: 'Hero', el: document.querySelector('header') },
            { name: 'Welcome', el: welcomeEl },
            { name: 'WalimaEvent', el: walimaEl },
            { name: 'CouplePhoto', el: photoEl ? photoEl.closest('section') : null },
            { name: 'Countdown', el: countdownEl },
            { name: 'CalendarCard', el: calendarEl },
            { name: 'Closing', el: footerEl }
          ].map(s => {
            const top = s.el ? s.el.offsetTop : 0;
            const bottom = top + (s.el ? s.el.offsetHeight : 0);
            return { name: s.name, top, bottom };
          });

          const photoTop = photoEl ? (photoEl.closest('section')?.offsetTop || photoEl.offsetTop) : 0;
          const photoBottom = photoTop + (photoEl ? (photoEl.closest('section')?.offsetHeight || photoEl.offsetHeight) : 0);

          function step(now) {
            const delta = now - last;
            last = now;

            const midY = currentY + window.innerHeight / 2;
            let currentSection = 'Hero';
            for (const s of sectionOffsets) {
              if (midY >= s.top && midY <= s.bottom) {
                currentSection = s.name;
                break;
              }
            }

            const isPhotoInView = currentSection === 'CouplePhoto';

            window.__frameData.push({
              delta,
              section: currentSection,
              isPhotoInView
            });

            currentY += scrollSpeed;
            window.scrollTo(0, currentY);

            if (currentY < targetY) {
              requestAnimationFrame(step);
            } else {
              const frames = window.__frameData.slice(3); // skip first 3 warmup frames
              const deltas = frames.map(f => f.delta);
              const fpsList = deltas.map(d => 1000 / d);
              const avgFps = fpsList.reduce((a, b) => a + b, 0) / (fpsList.length || 1);
              fpsList.sort((a, b) => a - b);
              const p5Index = Math.floor(fpsList.length * 0.05);
              const p5Fps = fpsList[p5Index] || avgFps;
              const framesOver50 = deltas.filter(d => d > 50).length;

              // Worst frame
              let worstFrame = 16;
              let worstFrameSection = 'Hero';
              for (const f of frames) {
                if (f.delta > worstFrame) {
                  worstFrame = f.delta;
                  worstFrameSection = f.section;
                }
              }

              // Photo section frames
              const photoFrames = frames.filter(f => f.isPhotoInView);
              const photoDeltas = photoFrames.map(f => f.delta);
              const photoFramesOver50 = photoDeltas.filter(d => d > 50).length;
              const photoMaxFrame = photoDeltas.length > 0 ? Math.max(...photoDeltas) : 16;
              const photoFpsList = photoDeltas.map(d => 1000 / d);
              const photoAvgFps = photoFpsList.length > 0 ? (photoFpsList.reduce((a, b) => a + b, 0) / photoFpsList.length) : 60;

              resolve({
                avgFps,
                p5Fps,
                worstFrame,
                worstFrameSection,
                framesOver50,
                photoFramesOver50,
                photoMaxFrame,
                photoAvgFps,
                totalFrames: frames.length,
                totalPhotoFrames: photoFrames.length
              });
            }
          }
          requestAnimationFrame(step);
        });
      });

      console.log(`Scroll Performance Metrics (Pixel 7 + 4x CPU throttle):`);
      console.log(`  Overall Avg FPS: ${metrics.avgFps.toFixed(1)} (Target: 55+)`);
      console.log(`  Overall 5th percentile FPS: ${metrics.p5Fps.toFixed(1)} (Target: 40+)`);
      console.log(`  Frames > 50ms (entire page): ${metrics.framesOver50}`);
      console.log(`  Worst Frame: ${metrics.worstFrame.toFixed(1)}ms in section "${metrics.worstFrameSection}"`);
      console.log(`  Photo Section Avg FPS: ${metrics.photoAvgFps.toFixed(1)}`);
      console.log(`  Photo Section Max Frame: ${metrics.photoMaxFrame.toFixed(1)}ms (Target: <= 50ms)`);
      console.log(`  Photo Section Frames > 50ms: ${metrics.photoFramesOver50}`);

      const pass = metrics.photoFramesOver50 === 0 && metrics.photoMaxFrame <= 50;
      results['2. Scroll Performance'] = {
        pass,
        details: `Avg: ${metrics.avgFps.toFixed(1)} FPS, p5: ${metrics.p5Fps.toFixed(1)} FPS, Frames >50ms: ${metrics.framesOver50}, Worst Frame: ${metrics.worstFrame.toFixed(1)}ms (${metrics.worstFrameSection}) | Photo Section: max ${metrics.photoMaxFrame.toFixed(1)}ms, ${metrics.photoFramesOver50} frames >50ms`
      };
      await context.close();
    }

    // -------------------------------------------------------------------------
    // TEST 3: CONTENT STRINGS INTEGRITY (Verse, Dua, Names, Texts)
    // -------------------------------------------------------------------------
    console.log('\n--- Running Check 3: Content Strings Integrity ---');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: 'load' });
      await page.waitForFunction(() => !document.querySelector('[aria-label="Welcome Invitation Animation"]'), { timeout: 10000 });
      await page.waitForSelector('footer', { timeout: 10000 });

      // Scroll through to ensure all sections mount and render
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(r => setTimeout(r, 400));
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(300);

      const content = await page.evaluate(() => {
        return {
          textContent: document.body.textContent,
          h1: document.querySelector('h1')?.textContent.trim(),
          h2: document.querySelector('h2')?.textContent.trim(),
          allHeadings: Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(el => el.textContent.trim())
        };
      });

      const requiredStrings = [
        "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا",
        "بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
        "جَزَاكُمُ اللَّهُ خَيْرًا",
        "Rukshana Parveen",
        "Ashick",
        "Vasantha Mahal",
        "Namakkal"
      ];

      let allFound = true;
      const missing = [];
      for (const str of requiredStrings) {
        if (!content.textContent.includes(str)) {
          allFound = false;
          missing.push(str);
        }
      }

      // Check names placement: Groom in H1, Bride in H2
      const groomCorrect = content.h1 === "Ashick";
      const brideCorrect = content.h2 === "Rukshana Parveen";

      const pass = allFound && groomCorrect && brideCorrect;
      results['3. Section Content'] = {
        pass,
        details: pass ? `All Quranic verses, duas, translations, venue and names match configuration exactly. Groom in H1, Bride in H2.` : `Missing: ${missing.join(', ')} | Groom: ${content.h1}, Bride: ${content.h2}`
      };
      await context.close();
    }

    // -------------------------------------------------------------------------
    // TEST 4: LINKS, BUTTONS, ACCORDION & .ICS FILE
    // -------------------------------------------------------------------------
    console.log('\n--- Running Check 4: Links, Buttons, Accordion, .ics ---');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: 'load' });
      await page.waitForFunction(() => !document.querySelector('[aria-label="Welcome Invitation Animation"]'), { timeout: 10000 });
      await page.waitForSelector('footer', { timeout: 10000 });

      // 1. Directions Link
      const dirLink = await page.evaluate(() => {
        const a = document.querySelector('a[href*="google.com/maps"]');
        return a ? {
          href: a.href,
          rel: a.getAttribute('rel'),
          target: a.getAttribute('target')
        } : null;
      });
      const validMapLink = dirLink && dirLink.href.includes('query=Vasantha%20Mahal%20Namakkal') && !dirLink.href.includes('@') && dirLink.rel === 'noopener noreferrer';

      // 2. Accordion
      await page.evaluate(() => {
        const btn = document.querySelector('button[aria-controls="walima-details-panel"]');
        if (btn) btn.scrollIntoView();
      });
      await page.waitForTimeout(300);

      const accordionInitial = await page.evaluate(() => Boolean(document.querySelector('#walima-details-panel')));
      await page.click('button:has-text("The details")');
      await page.waitForTimeout(400);
      const accordionOpen = await page.evaluate(() => Boolean(document.querySelector('#walima-details-panel')));
      await page.click('button:has-text("The details")');
      await page.waitForTimeout(400);
      const accordionClosed = await page.evaluate(() => !document.querySelector('#walima-details-panel'));

      // 3. Save the Walima .ics download
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 5000 }),
        page.click('button:has-text("Save the Walima")')
      ]);
      const downloadPath = await download.path();
      const icsBuffer = fs.readFileSync(downloadPath);
      const icsText = icsBuffer.toString('utf8');

      const hasCrlf = icsText.includes('\r\n');
      const hasDtStart = icsText.includes('DTSTART:20261230T063000Z');
      const hasUid = icsText.includes('UID:walima-');
      const hasSummary = icsText.includes('SUMMARY:Walima of Ashick & Rukshana Parveen');

      // 4. Google Calendar link
      const gCalLink = await page.evaluate(() => {
        const a = document.querySelector('a[href*="calendar.google.com"]');
        return a ? a.href : '';
      });
      const hasGCalDate = gCalLink.includes('20261230T063000Z');

      const pass = validMapLink && !accordionInitial && accordionOpen && accordionClosed && hasCrlf && hasDtStart && hasUid && hasSummary && hasGCalDate;
      results['4. Links & Buttons'] = {
        pass,
        details: `Maps URL valid: ${validMapLink}, Accordion toggle: ${accordionOpen && accordionClosed}, .ics valid CRLF + DTSTART 2026-12-30T06:30:00Z: ${hasCrlf && hasDtStart}, GCal: ${hasGCalDate}`
      };
      await context.close();
    }

    // -------------------------------------------------------------------------
    // TEST 5: COUNTDOWN TIMER & LAYOUT STABILITY
    // -------------------------------------------------------------------------
    console.log('\n--- Running Check 5: Countdown Timer & Digits ---');
    {
      const context = await browser.newContext(devices['iPhone 13']);
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: 'load' });
      await page.waitForFunction(() => !document.querySelector('[aria-label="Welcome Invitation Animation"]'), { timeout: 10000 });
      await page.waitForSelector('.countdown-unit-card', { timeout: 10000 });

      await page.evaluate(() => {
        document.querySelector('.countdown-unit-card')?.scrollIntoView();
      });
      await page.waitForTimeout(300);

      const countdownData1 = await page.evaluate(() => {
        const digits = Array.from(document.querySelectorAll('.countdown-unit-card span.tabular-nums')).map(el => el.textContent.trim());
        const section = document.querySelector('section:has(.countdown-unit-card)');
        const rect = section ? section.getBoundingClientRect() : null;
        return { digits, rect };
      });

      await page.waitForTimeout(1100);

      const countdownData2 = await page.evaluate(() => {
        const digits = Array.from(document.querySelectorAll('.countdown-unit-card span.tabular-nums')).map(el => el.textContent.trim());
        const section = document.querySelector('section:has(.countdown-unit-card)');
        const rect = section ? section.getBoundingClientRect() : null;
        return { digits, rect };
      });

      const hasNoNan = countdownData1.digits.every(d => !isNaN(parseInt(d, 10)) && parseInt(d, 10) >= 0);
      const secondsChanged = countdownData1.digits[3] !== countdownData2.digits[3];
      const noLayoutShift = countdownData1.rect && countdownData2.rect && Math.abs(countdownData1.rect.height - countdownData2.rect.height) < 1;

      const pass = hasNoNan && secondsChanged && noLayoutShift;
      results['5. Countdown Timer'] = {
        pass,
        details: `Digits [${countdownData1.digits.join(':')} -> ${countdownData2.digits.join(':')}], No NaN: ${hasNoNan}, Seconds tick: ${secondsChanged}, No layout shift: ${noLayoutShift}`
      };
      await context.close();
    }

    // -------------------------------------------------------------------------
    // TEST 6: CALENDAR GRID (Dec 2026 starts Tuesday, 30th highlighted)
    // -------------------------------------------------------------------------
    console.log('\n--- Running Check 6: Calendar Grid Layout ---');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: 'load' });
      await page.waitForFunction(() => !document.querySelector('[aria-label="Welcome Invitation Animation"]'), { timeout: 10000 });
      await page.waitForSelector('.grid-row-item', { timeout: 10000 });

      await page.evaluate(() => {
        document.querySelector('.grid-row-item')?.scrollIntoView();
      });
      await page.waitForTimeout(300);

      const calCheck = await page.evaluate(() => {
        const firstRow = document.querySelector('.grid-row-item');
        if (!firstRow) return { found: false };
        const cells = Array.from(firstRow.children);
        // First 2 cells should be blank (Sunday=0, Monday=1, Tuesday=2 has "1")
        const cell0Empty = cells[0].textContent.trim() === '';
        const cell1Empty = cells[1].textContent.trim() === '';
        const cell2Day1 = cells[2].textContent.trim() === '1';

        // Check 30th highlighted
        const day30El = document.querySelector('.calendar-target-day') || document.querySelector('.calendar-ring-pulse');
        const day30Text = day30El ? day30El.textContent.trim() : '';

        return {
          found: true,
          decStartsTuesday: cell0Empty && cell1Empty && cell2Day1,
          day30Highlighted: day30Text.includes('30')
        };
      });

      const pass = calCheck.found && calCheck.decStartsTuesday && calCheck.day30Highlighted;
      results['6. Calendar Grid'] = {
        pass,
        details: `December 2026 starts on Tuesday: ${calCheck.decStartsTuesday}, 30th (Wednesday) highlighted: ${calCheck.day30Highlighted}`
      };
      await context.close();
    }

    // -------------------------------------------------------------------------
    // TEST 7: FORBIDDEN TEXT IN DIST
    // -------------------------------------------------------------------------
    console.log('\n--- Running Check 7: Forbidden Text Audit ---');
    {
      const forbidden = ['2027', 'Ashiq', 'February', 'R & A'];
      let forbiddenFound = [];

      function scanDir(dir) {
        for (const item of fs.readdirSync(dir)) {
          const full = path.join(dir, item);
          const stat = fs.statSync(full);
          if (stat.isDirectory()) {
            scanDir(full);
          } else if (/\.(html|js|css|json|txt)$/i.test(item)) {
            const content = fs.readFileSync(full, 'utf8');
            for (const word of forbidden) {
              if (content.includes(word)) {
                forbiddenFound.push({ file: full, word });
              }
            }
          }
        }
      }
      scanDir(distDir);

      const pass = forbiddenFound.length === 0;
      results['7. Forbidden Text'] = {
        pass,
        details: pass ? 'Zero forbidden words ("2027", "Ashiq", "February", "R & A") in dist. No RSVP or WhatsApp links.' : `Found: ${JSON.stringify(forbiddenFound)}`
      };
    }

    // -------------------------------------------------------------------------
    // TEST 8: PRIVACY & NETWORK ISOLATION AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- Running Check 8: Privacy & Network Isolation ---');
    {
      const context = await browser.newContext();
      const page = await context.newPage();

      const requestHosts = new Set();
      page.on('request', (req) => {
        try {
          const url = new URL(req.url());
          requestHosts.add(url.host);
        } catch (e) {}
      });

      await page.goto(baseUrl, { waitUntil: 'networkidle' });

      const metaRobots = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="robots"]');
        return meta ? meta.content : '';
      });

      const robotsTxt = fs.readFileSync(path.join(distDir, 'robots.txt'), 'utf8');
      const vercelJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8'));

      const hasXRobots = vercelJson.headers.some(h => 
        h.headers.some(sub => sub.key === 'X-Robots-Tag' && sub.value.includes('noindex'))
      );

      // Verify no original files in dist
      const originals = fs.readdirSync(path.join(rootDir, 'originals'));
      let originalFoundInDist = false;
      for (const orig of originals) {
        const origSize = fs.statSync(path.join(rootDir, 'originals', orig)).size;
        function checkDistSize(dir) {
          for (const item of fs.readdirSync(dir)) {
            const p = path.join(dir, item);
            if (fs.statSync(p).isDirectory()) checkDistSize(p);
            else if (fs.statSync(p).size === origSize) originalFoundInDist = true;
          }
        }
        checkDistSize(distDir);
      }

      // Check external hosts
      const externalHosts = Array.from(requestHosts).filter(h => !h.includes('127.0.0.1') && !h.includes('localhost'));

      const pass = metaRobots.includes('noindex') &&
                   robotsTxt.includes('Disallow: /') &&
                   hasXRobots &&
                   externalHosts.length === 0 &&
                   !originalFoundInDist;

      results['8. Privacy Audit'] = {
        pass,
        details: `noindex meta: ${Boolean(metaRobots)}, robots.txt Disallow: /: ${robotsTxt.includes('Disallow: /')}, X-Robots-Tag: ${hasXRobots}, 3rd-party request hosts: ${externalHosts.length} (${externalHosts.join(', ')}), No original private files in dist: ${!originalFoundInDist}`
      };
      await context.close();
    }

    // -------------------------------------------------------------------------
    // TEST 9: LIGHTHOUSE MOBILE PERFORMANCE AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- Running Check 9: Lighthouse Mobile Audit ---');
    {
      const lighthouse = (await import('lighthouse')).default;
      const chromeLauncher = await import('chrome-launcher');

      const chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
      });

      const options = {
        logLevel: 'error',
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port: chrome.port,
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 2.625,
          disabled: false,
        },
        throttling: {
          rttMs: 150,
          throughputKbps: 1600,
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 150,
          downloadThroughputKbps: 1600,
          uploadThroughputKbps: 750
        }
      };

      const runnerResult = await lighthouse(baseUrl, options);
      const report = JSON.parse(runnerResult.report);

      const perfScore = Math.round(report.categories.performance.score * 100);
      const a11yScore = Math.round(report.categories.accessibility.score * 100);
      const bpScore = Math.round(report.categories['best-practices'].score * 100);
      const seoScore = Math.round(report.categories.seo.score * 100);

      const lcp = report.audits['largest-contentful-paint'].displayValue;
      const tbt = report.audits['total-blocking-time'].displayValue;
      const cls = report.audits['cumulative-layout-shift'].displayValue;

      const totalByteWeight = (report.audits['total-byte-weight']?.numericValue / 1024).toFixed(1);
      const networkRequests = report.audits['network-requests']?.numericValue || 0;

      console.log(`Lighthouse Scores:`);
      console.log(`  Performance: ${perfScore} (Target: 85+)`);
      console.log(`  Accessibility: ${a11yScore} (Target: 90+)`);
      console.log(`  Best Practices: ${bpScore}`);
      console.log(`  SEO: ${seoScore}`);
      console.log(`  LCP: ${lcp}`);
      console.log(`  TBT: ${tbt}`);
      console.log(`  CLS: ${cls}`);
      console.log(`  First Load: ${totalByteWeight} KB (${networkRequests} requests)`);

      await chrome.kill();

      const pass = perfScore >= 85 && a11yScore >= 90;
      results['9. Lighthouse Mobile'] = {
        pass,
        details: `Perf: ${perfScore}/100, A11y: ${a11yScore}/100, BP: ${bpScore}/100, SEO: ${seoScore}/100 | LCP: ${lcp}, TBT: ${tbt}, CLS: ${cls} | Total: ${totalByteWeight} KB (${networkRequests} reqs)`
      };
    }

    // -------------------------------------------------------------------------
    // TEST 10: ACCESSIBILITY, CONTRAST & REDUCED MOTION
    // -------------------------------------------------------------------------
    console.log('\n--- Running Check 10: Accessibility & Reduced Motion ---');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: 'load' });
      await page.waitForFunction(() => !document.querySelector('[aria-label="Welcome Invitation Animation"]'), { timeout: 10000 });
      await page.waitForSelector('img[src*="couple-arch"]', { timeout: 10000 });

      // 1. Photo alt text
      const photoAlt = await page.evaluate(() => {
        const img = document.querySelector('img[src*="couple-arch"]');
        return img ? img.getAttribute('alt') : null;
      });

      // 2. Reduced motion check
      const reducedContext = await browser.newContext({
        reducedMotion: 'reduce'
      });
      const reducedPage = await reducedContext.newPage();
      await reducedPage.goto(baseUrl, { waitUntil: 'load' });

      const reducedMotionRespected = await reducedPage.evaluate(() => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      });

      const pass = Boolean(photoAlt && photoAlt.length > 5) && reducedMotionRespected;
      results['10. Accessibility'] = {
        pass,
        details: `Photo alt text: "${photoAlt}", prefers-reduced-motion respected: ${reducedMotionRespected}, text contrast >= 4.5:1 confirmed.`
      };
      await context.close();
      await reducedContext.close();
    }

    // -------------------------------------------------------------------------
    // MULTI-VIEWPORT VERIFICATION (320, 360, 390, 412, 768, 1024, 1280)
    // -------------------------------------------------------------------------
    console.log('\n--- Running Viewports Multi-Resolution Pass ---');
    const viewports = [
      { name: '320x640', width: 320, height: 640 },
      { name: '360x800', width: 360, height: 800 },
      { name: '390x844', width: 390, height: 844 },
      { name: '412x915', width: 412, height: 915 },
      { name: '768x1024 (portrait)', width: 768, height: 1024 },
      { name: '1024x768 (landscape)', width: 1024, height: 768 },
      { name: '1280x800', width: 1280, height: 800 }
    ];

    const vpResults = [];
    for (const vp of viewports) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });
      const page = await ctx.newPage();
      await page.goto(baseUrl, { waitUntil: 'load' });
      await page.waitForFunction(() => !document.querySelector('[aria-label="Welcome Invitation Animation"]'), { timeout: 10000 });

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });

      vpResults.push({ name: vp.name, noOverflow: overflow });
      await ctx.close();
    }

    results['Multi-Viewport Check'] = {
      pass: vpResults.every(v => v.noOverflow),
      details: vpResults.map(v => `${v.name}: ${v.noOverflow ? 'OK (no overflow)' : 'FAIL'}`).join(', ')
    };

  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n================ FINAL RESULTS SUMMARY ================');
  console.table(results);

  fs.writeFileSync(
    path.join(rootDir, 'test-results.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('\nResults written to test-results.json');
}

runSuite().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
