#!/usr/bin/env node
/*
 * Евристична перевірка квізів «що виведе код»: виконує JS-фрагмент у Node (vm) і порівнює
 * вивід console.log з правильним варіантом. Розбіжності друкуються для ручного розбору —
 * це не вирок (варіанти можуть бути записані довільно), а список «подивитись уважніше».
 *   node tools/check-quizzes.js [topic ...]
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const util = require('util');

const dataDir = path.join(__dirname, '..', 'data');
const FE = { items: [] };
global.FE = {
  defineSections() {},
  topic(id, data) { (data.items || []).forEach((it) => FE.items.push(Object.assign({ topic: id }, it))); }
};
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
fs.readdirSync(dataDir).filter((f) => f.endsWith('.js') && !f.startsWith('_')).forEach((f) => {
  if (only.length && !only.includes(f.replace(/\.js$/, ''))) return;
  require(path.join(dataDir, f));
});

function runSnippet(code) {
  const out = [];
  const fmt = (a) => (typeof a === 'string' ? a : util.inspect(a, { depth: 4, breakLength: Infinity }));
  const consoleMock = {};
  ['log', 'info', 'warn', 'error'].forEach((k) => { consoleMock[k] = (...args) => out.push(args.map(fmt).join(' ')); });
  const ctx = vm.createContext({ console: consoleMock, setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask, structuredClone, URL, URLSearchParams, globalThis: undefined });
  ctx.globalThis = ctx;
  return new Promise((resolve) => {
    try {
      vm.runInContext(code, ctx, { timeout: 1000 });
    } catch (e) {
      out.push('!THROW ' + (e && e.name) + ': ' + (e && e.message));
    }
    setTimeout(() => resolve(out), 300);
  });
}

const norm = (s) => String(s)
  .replace(/`/g, '')
  .replace(/\\n/g, ' ')
  .replace(/['"]/g, '')
  .replace(/\(порожній рядок\)/g, ' ')
  .replace(/!THROW\s+/g, '')
  .replace(/(^|\s)(і|потім|then)(?=\s)/g, ' ')
  .replace(/[,;→/|[\]{}()]+/g, ' ')
  .replace(/:\s.*$/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

(async () => {
  let checked = 0;
  const suspicious = [];
  for (const it of FE.items) {
    if (it.type !== 'quiz' || Array.isArray(it.answer)) continue;
    if (!/(виведе|виведено|вивід|результат|поверне|output)/i.test(it.question)) continue;
    const m = it.question.match(/```(?:js|javascript)\n([\s\S]*?)```/);
    if (!m) continue;
    if (/document|window\.|addEventListener|import |export |require\(|fetch\(/.test(m[1])) continue;
    checked++;
    const out = await runSnippet(m[1]);
    const got = norm(out.join(' '));
    const expected = norm(it.options[it.answer]);
    const others = it.options.map((o, i) => (i === it.answer ? null : norm(o)));
    const matchesOther = others.some((o) => o && o === got);
    if (got !== expected) {
      suspicious.push({ id: it.id, topic: it.topic, got: out.join(' | '), expected: it.options[it.answer], strong: matchesOther });
    }
  }
  const strong = suspicious.filter((s) => s.strong);
  console.log(`Перевірено квізів з кодом: ${checked}. Не збіглось дослівно: ${suspicious.length}. Збіглось з ІНШИМ варіантом (ймовірна помилка): ${strong.length}\n`);
  for (const s of strong.concat(process.argv.includes('--all') ? suspicious.filter((x) => !x.strong) : [])) {
    console.log(`${s.strong ? '✖' : '?'} ${s.topic}/${s.id}\n   Node: ${s.got}\n   Відповідь: ${s.expected}\n`);
  }
})();
