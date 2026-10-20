import { chromium, devices } from 'playwright';

async function testFrames() {
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
  await page.waitForTimeout(500);

  const result = await page.evaluate(() => {
    return new Promise((resolve) => {
      const frames = [];
      let last = performance.now();
      const targetY = document.documentElement.scrollHeight - window.innerHeight;
      let currentY = 0;
      const scrollSpeed = 20;

      function step(now) {
        const delta = now - last;
        last = now;

        frames.push({ delta, currentY });
        currentY += scrollSpeed;
        window.scrollTo(0, currentY);

        if (currentY < targetY) {
          requestAnimationFrame(step);
        } else {
          resolve(frames);
        }
      }
      requestAnimationFrame(step);
    });
  });

  const spikes = result.filter(f => f.delta > 45);
  console.log(`All frames > 45ms:`);
  for (const s of spikes) {
    console.log(`  delta: ${s.delta.toFixed(1)}ms at currentY: ${s.currentY}`);
  }

  await browser.close();
}

testFrames();
