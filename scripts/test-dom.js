import { chromium } from 'playwright';

async function testDom() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));
  page.on('response', res => {
    if (res.status() >= 400) {
      console.log('HTTP ERROR', res.status(), res.url());
    }
  });

  await page.goto('http://127.0.0.1:4173');
  await page.waitForTimeout(4000);

  const elements = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('header, section, footer')).map((el, i) => {
      return { index: i, tag: el.tagName, textSnippet: el.innerText.slice(0, 100) };
    });
    return {
      sections,
      fullBodyText: document.body.innerText
    };
  });

  console.log('Sections details:', JSON.stringify(elements.sections, null, 2));
  console.log('innerText Has Vasantha Mahal:', elements.fullBodyText.includes('Vasantha Mahal'));
  console.log('textContent Has Vasantha Mahal:', await page.evaluate(() => document.body.textContent.includes('Vasantha Mahal')));
  console.log('textContent Has Closing Dua:', await page.evaluate(() => document.body.textContent.includes('جَزَاكُمُ اللَّهُ خَيْرًا')));
  await browser.close();
}

testDom().catch(console.error);
