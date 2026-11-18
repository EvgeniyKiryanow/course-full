#!/usr/bin/env node
/*
 * Покриття канонічної програми (tools/syllabus.js) банком завдань.
 *   node tools/coverage.js            — лише прогалини і слабкі місця
 *   node tools/coverage.js --all      — усі теми
 * «Завдань» — у скількох завданнях тема в назві, умові, питанні або коді (справжня практика).
 * «Згадок» — у скількох ще й у поясненнях/відповідях (лише згадка).
 */
const fs = require('fs');
const path = require('path');
const syllabus = require('./syllabus');

const dataDir = path.join(__dirname, '..', 'data');
const items = [];
global.FE = { defineSections() {}, topic(id, d) { (d.items || []).forEach((it) => items.push(Object.assign({ topic: id }, it))); } };
fs.readdirSync(dataDir).filter((f) => f.endsWith('.js') && !f.startsWith('_')).forEach((f) => require(path.join(dataDir, f)));

const str = (v) => (v == null ? '' : typeof v === 'string' ? v : JSON.stringify(v));
function core(it) { return [it.title, it.question, it.description, it.starter, it.solution, it.html, it.css, it.js, it.options, it.choices].map(str).join('\n'); }
function all(it) { return core(it) + '\n' + [it.explanation, it.answer, it.why, it.keyPoints, it.hints, it.tests].map(str).join('\n'); }

const showAll = process.argv.includes('--all');
let gaps = 0;
let weak = 0;
let area = '';
for (const [ar, name, re] of syllabus) {
  const strong = items.filter((it) => re.test(core(it)));
  const ment = items.filter((it) => re.test(all(it))).length;
  const mark = strong.length === 0 ? (ment ? '~' : '✕') : strong.length < 2 ? '·' : '✓';
  if (mark === '✕' || mark === '~') gaps++;
  else if (mark === '·') weak++;
  if (!showAll && mark === '✓') continue;
  if (ar !== area) { console.log('\n' + ar); area = ar; }
  const topics = [...new Set(strong.map((i) => i.topic))].slice(0, 4).join(', ');
  console.log('  ' + mark + ' ' + name.padEnd(52) + ' завдань ' + String(strong.length).padStart(3) + '  згадок ' + String(ment).padStart(3) + (topics ? '  [' + topics + ']' : ''));
}
console.log('\nТем у програмі: ' + syllabus.length + '. Без практики (✕ немає / ~ лише згадка): ' + gaps + '. Лише одне завдання (·): ' + weak + '.');
