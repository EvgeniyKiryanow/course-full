#!/usr/bin/env node
/*
 * Скриншоти застосунку для швидкої візуальної перевірки.
 *   node tools/screenshot.js <outDir> [hash ...]
 * Приклад: node tools/screenshot.js shots "#/" "#/t/js-types" "#/i/types-typeof-null"
 * Опції: --light (світла тема), --mobile (390×844), --run (натиснути «Запустити» на сторінці завдання)
 */
const path = require('path');
const fs = require('fs');
const { launch, fileUrl } = require('./browser');

(async () => {
  const args = process.argv.slice(2);
  const outDir = args[0] || 'shots';
  const flags = args.filter((a) => a.startsWith('--'));
  const hashes = args.slice(1).filter((a) => !a.startsWith('--'));
  if (!hashes.length) hashes.push('#/');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await launch();
  const page = await browser.newPage();
  const mobile = flags.includes('--mobile');
  await page.setViewport(mobile ? { width: 390, height: 844, deviceScaleFactor: 2 } : { width: 1440, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const base = fileUrl(path.join(__dirname, '..', 'index.html'));
  await page.goto(base);
  if (flags.includes('--light')) {
    await page.evaluate(() => { Store.setting('theme', 'light'); });
    await page.reload();
  }
  await page.waitForFunction('window.__feReady === true', { timeout: 30000 });
  let i = 0;
  for (const h of hashes) {
    await page.evaluate((hh) => { location.hash = hh; }, h);
    await new Promise((r) => setTimeout(r, 400));
    if (flags.includes('--run')) {
      const hasRun = await page.$('#run-btn');
      if (hasRun) {
        await page.click('#run-btn');
        await page.waitForFunction('!document.querySelector("#run-btn").disabled', { timeout: 15000 });
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    const file = path.join(outDir, String(++i).padStart(2, '0') + '-' + h.replace(/[^a-z0-9-]+/gi, '_').replace(/^_+|_+$/g, '') + (mobile ? '-m' : '') + '.png');
    await page.screenshot({ path: file });
    console.log('saved', file);
  }
  if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
