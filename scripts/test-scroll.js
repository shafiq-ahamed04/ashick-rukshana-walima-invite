import { chromium, devices } from 'playwright';

async function testScrollBenchmark() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const context = await browser.newContext({
    ...devices['Pixel 7'],
    bypassCSP: true
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.goto('http://127.0.0.1:4173', { waitUntil: 'load' });
  await page.waitForFunction(() => !document.querySelector('[aria-label="Welcome Invitation Animation"]'), { timeout: 10000 });
  await page.waitForSelector('footer', { timeout: 10000 });
  // Ensure everything is mounted
  await page.evaluate(() => {
    window.scrollTo(0, 100);
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);

  const result = await page.evaluate(() => {
    return new Promise((resolve) => {
      const photoEl = document.querySelector('img[src*="couple-arch"]');
      const photoSection = photoEl?.closest('section');
      const photoRect = photoSection?.getBoundingClientRect();
      const photoTop = (photoRect?.top || 0) + window.scrollY;
      const photoBottom = photoTop + (photoRect?.height || 900);

      const frames = [];
      let last = performance.now();
      const targetY = document.documentElement.scrollHeight - window.innerHeight;
      let currentY = 0;
      const scrollSpeed = 16; // 16px per frame = smooth 60fps mobile scroll

      function step(now) {
        const delta = now - last;
        last = now;

        const isPhotoInView = (currentY + window.innerHeight >= photoTop && currentY <= photoBottom);

        frames.push({
          delta,
          currentY,
          isPhotoInView
        });

        currentY += scrollSpeed;
        window.scrollTo(0, currentY);

        if (currentY < targetY) {
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

  const validFrames = result.frames.slice(5); // skip warmup
  const deltas = validFrames.map(f => f.delta);
  const avgFps = deltas.reduce((a, b) => a + (1000 / b), 0) / deltas.length;
  const sortedFps = [...deltas.map(d => 1000 / d)].sort((a, b) => a - b);
  const p5Fps = sortedFps[Math.floor(sortedFps.length * 0.05)];
  const framesOver50 = deltas.filter(d => d > 50).length;
  const maxDelta = Math.max(...deltas);

  const photoFrames = validFrames.filter(f => f.isPhotoInView);
  const photoDeltas = photoFrames.map(f => f.delta);
  const photoMaxDelta = photoDeltas.length > 0 ? Math.max(...photoDeltas) : 16;
  const photoFramesOver50 = photoDeltas.filter(d => d > 50).length;
  const photoAvgFps = photoDeltas.length > 0 ? photoDeltas.reduce((a, b) => a + (1000 / b), 0) / photoDeltas.length : 60;

  console.log(`Scroll Test Results:`);
  console.log(`  Total Frames: ${validFrames.length}`);
  console.log(`  Overall Avg FPS: ${avgFps.toFixed(1)}`);
  console.log(`  Overall p5 FPS: ${p5Fps.toFixed(1)}`);
  console.log(`  Max Frame: ${maxDelta.toFixed(1)}ms`);
  console.log(`  Frames > 50ms: ${framesOver50}`);
  console.log(`  Photo Section Total Frames: ${photoFrames.length}`);
  console.log(`  Photo Section Avg FPS: ${photoAvgFps.toFixed(1)}`);
  console.log(`  Photo Section Max Frame: ${photoMaxDelta.toFixed(1)}ms`);
  console.log(`  Photo Section Frames > 50ms: ${photoFramesOver50}`);

  await browser.close();
}

testScrollBenchmark();
