#!/usr/bin/env node
/*
 * Перевірка підручника:
 *  - кожен модуль має розділ (основний — де модуль перший у topics);
 *  - для кожного кроку модуля в розділі є підрозділ (## / ###) з тією ж назвою —
 *    тоді «Довідник» у завданні відкривається точно на ньому;
 *  - розділи без тексту, зламаний синтаксис.
 *   node tools/check-book.js
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const topics = {};
const order = [];
global.FE = {
  defineSections(sections) { sections.forEach((s) => { if (s.status !== 'soon') s.topics.forEach((t) => order.push(t.id)); }); },
  topic(id, d) { topics[id] = d; },
  chapter() {}
};
require(path.join(dataDir, '_topics.js'));
fs.readdirSync(dataDir).filter((f) => f.endsWith('.js') && !f.startsWith('_')).forEach((f) => require(path.join(dataDir, f)));
require(path.join(dataDir, 'book', '_index.js'));
const bodies = {};
FE.chapter = (id, d) => { bodies[id] = d.body; };
Object.keys(FE.bookChapters).forEach((id) => {
  const file = path.join(dataDir, 'book', id + '.js');
  if (!fs.existsSync(file)) { bodies[id] = null; return; }
  require(file);
});

const norm = (x) => String(x || '').toLowerCase().replace(/[`*_"'«»()\[\]:.,!?—–-]/g, ' ').replace(/\s+/g, ' ').trim();
function headings(body) { return (body.match(/^#{2,3} .+$/gm) || []).map((h) => norm(h.replace(/^#+ /, ''))); }
function matches(heads, title) {
  const w = norm(title);
  return heads.some((h) => h === w || (h.length >= 6 && (h.includes(w) || w.includes(h))));
}

let problems = 0;
let deep = 0;
let steps = 0;
const chapters = Object.values(FE.bookChapters);
for (const id of order) {
  const t = topics[id];
  if (!t) continue;
  const primary = chapters.find((c) => (c.topics || [])[0] === id) || chapters.find((c) => (c.topics || []).includes(id));
  if (!primary) { console.log('✕ ' + id + ': немає розділу в підручнику'); problems++; continue; }
  const body = bodies[primary.id];
  if (!body) { console.log('✕ ' + id + ': розділ ' + primary.id + ' без тексту або файлу'); problems++; continue; }
  const heads = chapters.filter((c) => (c.topics || []).includes(id) && bodies[c.id]).flatMap((c) => headings(bodies[c.id]));
  const missing = (t.groups || []).filter((g) => !matches(heads, g.title));
  steps += (t.groups || []).length;
  deep += (t.groups || []).length - missing.length;
  if (missing.length) console.log('· ' + id.padEnd(18) + ' → ' + primary.id + ': без точного підрозділу ' + missing.length + ' з ' + t.groups.length + ' кроків');
}
console.log('\nМодулів: ' + order.length + '. Без розділу: ' + problems + '. Кроків з точним посиланням на підрозділ: ' + deep + ' з ' + steps + '.');
process.exit(problems ? 1 : 0);
