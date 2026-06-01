const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERR:', err.message));
  await page.goto('http://127.0.0.1:8081');
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const btn = document.querySelector('.section-tab[data-section="chemistry"]');
    if (btn) btn.click();
    else console.log('PAGE LOG: Button not found');
  });
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
