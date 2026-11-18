#!/usr/bin/env node
/*
 * Валідація банку завдань у справжньому браузері (Chrome/Edge через puppeteer-core).
 *   node tools/validate.js                 — усі теми
 *   node tools/validate.js js-types events — лише вказані теми
 *   node tools/validate.js --examples      — еталонні приклади з tools/examples.js
 *   node tools/validate.js --json          — повний звіт JSON
 */
const path = require('path');
const { launch, fileUrl } = require('./browser');

(async () => {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const examples = args.includes('--examples');
  const topics = args.filter((a) => !a.startsWith('--'));
  const browser = await launch();
  let exitCode = 0;
  try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(String(err && err.message)));
    const query = examples ? '?examples=1' : topics.length ? '?topics=' + topics.join(',') : '';
    await page.goto(fileUrl(path.join(__dirname, 'validate.html')) + query);
    await page.waitForFunction('window.__done === true', { timeout: 15 * 60 * 1000, polling: 250 });
    const report = await page.evaluate(() => window.__report);
    if (json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      if (report.fatal) console.log('FATAL:', report.fatal);
      if (report.loadErrors && report.loadErrors.length) {
        console.log('\n✖ Помилки завантаження даних:');
        report.loadErrors.forEach((e) => console.log('   ' + e));
      }
      if (pageErrors.length && args.includes('--verbose')) {
        console.log('\n✖ Помилки сторінки:');
        pageErrors.forEach((e) => console.log('   ' + e));
      }
      if (report.missingFiles && report.missingFiles.length) {
        console.log('\n• Файли тем ще не створені: ' + report.missingFiles.join(', '));
      }
      console.log('\nТеми:');
      Object.entries(report.topics || {}).forEach(([id, t]) => {
        const c = t.counts;
        if (!c.total) return;
        console.log(
          `  ${id.padEnd(20)} ${String(c.total).padStart(3)} завд. | code ${c.code} dom ${c.dom} quiz ${c.quiz} theory ${c.theory} | L1 ${c.l1} L2 ${c.l2} L3 ${c.l3} L4 ${c.l4} | ★ ${c.interview}${t.intro ? '' : ' | без intro'}`
        );
      });
      (report.items || []).forEach((r) => {
        if (!r.errors.length && !r.warnings.length) return;
        console.log(`\n${r.errors.length ? '✖' : '⚠'} ${r.topic} / ${r.id}${r.type ? ' [' + r.type + ']' : ''}`);
        r.errors.forEach((e) => console.log('   ERROR: ' + e));
        r.warnings.forEach((w) => console.log('   warn:  ' + w));
      });
      const t = report.totals || {};
      console.log(`\nРазом: ${t.items} завдань, помилок: ${t.errors}, попереджень: ${t.warnings}`);
      console.log(report.ok ? '✔ Банк валідний' : '✖ Є помилки — виправте їх');
    }
    if (!report.ok) exitCode = 1;
  } finally {
    await browser.close();
  }
  process.exit(exitCode);
})().catch((err) => {
  console.error(err);
  process.exit(2);
});
