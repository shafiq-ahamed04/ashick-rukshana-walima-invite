import { chromium, devices } from 'playwright';

async function testCleanScroll() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const context = await browser.newContext(devices['Pixel 7']);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.goto('http://127.0.0.1:4173', { waitUntil: 'load' });
  await page.waitForFunction(() => !document.querySelector('[aria-label="Welcome Invitation Animation"]'), { timeout: 10000 });
  await page.waitForTimeout(500);

  const results = await page.evaluate(() => {
    return new Promise((resolve) => {
      const photo = document.querySelector('img[src*="couple-arch"]');
      const photoSection = photo?.closest('section');
      const photoTop = (photoSection?.getBoundingClientRect().top || 0) + window.scrollY;
      const photoBottom = photoTop + (photoSection?.offsetHeight || 980);

      const frames = [];
      let y = 0;
      let last = performance.now();
      const targetY = document.documentElement.scrollHeight - window.innerHeight;
      const scrollSpeed = 10; // steady reading speed ~600px/s

      function step(now) {
        const delta = now - last;
        last = now;

        const isPhotoInView = (y + window.innerHeight >= photoTop && y <= photoBottom);

        frames.push({
          delta,
          y,
          isPhotoInView
        });

        y += scrollSpeed;
        window.scrollTo(0, y);

        if (y < targetY) {
          requestAnimationFrame(step);
        } else {
          resolve({
            photoTop,
            photoBottom,
            frames
          });
        }
      }
      requestAnimationFrame(step);
    });
  });

  const photoFrames = results.frames.filter(f => f.isPhotoInView);
  const photoDeltas = photoFrames.map(f => f.delta);
  const maxDelta = Math.max(...photoDeltas);
  const over50 = photoDeltas.filter(d => d > 50).length;
  const avgFps = photoDeltas.reduce((a, b) => a + (1000 / b), 0) / photoDeltas.length;

  const allFrames = results.frames.slice(5);
  const allDeltas = allFrames.map(f => f.delta);
  const overallAvgFps = allDeltas.reduce((a, b) => a + (1000 / b), 0) / allDeltas.length;
  const sorted = [...allDeltas.map(d => 1000 / d)].sort((a, b) => a - b);
  const p5Fps = sorted[Math.floor(sorted.length * 0.05)];

  console.log(`Scroll Benchmark Results (steady speed):`);
  console.log(`  Overall Avg FPS: ${overallAvgFps.toFixed(1)}`);
  console.log(`  Overall p5 FPS: ${p5Fps.toFixed(1)}`);
  console.log(`  Photo Section Total Frames: ${photoFrames.length}`);
  console.log(`  Photo Section Avg FPS: ${avgFps.toFixed(1)}`);
  console.log(`  Photo Section Max Frame: ${maxDelta.toFixed(1)}ms (Target: <= 50ms)`);
  console.log(`  Photo Section Frames > 50ms: ${over50} (Target: 0)`);

  const heavy = photoFrames.filter(f => f.delta > 45);
  for (const h of heavy) {
    console.log(`  y: ${h.y}, delta: ${h.delta.toFixed(1)}ms`);
  }

  await browser.close();
}

testCleanScroll();
