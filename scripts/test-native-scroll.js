import { chromium, devices } from 'playwright';

async function testGestures() {
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

  // Method A: CDP Input.synthesizeScrollGesture
  await page.evaluate(() => {
    window.__frames = [];
    let last = performance.now();
    function record(now) {
      window.__frames.push(now - last);
      last = now;
      if (window.__recording) requestAnimationFrame(record);
    }
    window.__recording = true;
    requestAnimationFrame(record);
  });

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`ScrollHeight: ${scrollHeight}px`);

  // Scroll down smoothly using CDP synthesizeScrollGesture
  await cdp.send('Input.synthesizeScrollGesture', {
    x: 200,
    y: 600,
    yDistance: -(scrollHeight - 800),
    speed: 1200 // 1200 px/sec
  });

  await page.waitForTimeout(500);

  const frames = await page.evaluate(() => {
    window.__recording = false;
    return window.__frames;
  });

  const valid = frames.slice(5);
  const avg = valid.reduce((a, b) => a + (1000 / b), 0) / valid.length;
  const sorted = [...valid.map(d => 1000 / d)].sort((a, b) => a - b);
  const p5 = sorted[Math.floor(sorted.length * 0.05)];
  const over50 = valid.filter(d => d > 50).length;
  const max = Math.max(...valid);

  console.log(`CDP ScrollGesture Results:`);
  console.log(`  Total Frames: ${valid.length}`);
  console.log(`  Avg FPS: ${avg.toFixed(1)}`);
  console.log(`  p5 FPS: ${p5.toFixed(1)}`);
  console.log(`  Max Frame: ${max.toFixed(1)}ms`);
  console.log(`  Frames > 50ms: ${over50}`);

  await browser.close();
}

testGestures();
