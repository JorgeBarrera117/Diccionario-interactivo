const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERR:', err.message));
  await page.goto('http://127.0.0.1:8081');
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const mathTab = document.querySelector('.section-tab[data-section="math"]');
    if (mathTab) mathTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const algTab = document.querySelector('.math-subtab[data-tab="alg"]');
    if (algTab) algTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const btn = document.querySelector('#mathPanelAlg .math-tb-btn[data-insert="sqrt"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
