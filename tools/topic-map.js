#!/usr/bin/env node
/*
 * Стисла «карта» теми для редагування без читання всього файлу:
 *   node tools/topic-map.js <topic> [--full <id>]
 */
const path = require('path');
const topicId = process.argv[2];
const fullIdx = process.argv.indexOf('--full');
const fullId = fullIdx !== -1 ? process.argv[fullIdx + 1] : null;
let data;
global.FE = { topic(id, d) { if (id === topicId) data = d; } };
require(path.join(__dirname, '..', 'data', topicId + '.js'));
const cut = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);
if (fullId) {
  const it = data.items.find((i) => i.id === fullId);
  console.log(JSON.stringify(it, null, 1));
  process.exit(0);
}
console.log('groups:', JSON.stringify(data.groups || []));
const todo = process.argv.includes('--todo');
data.items.forEach((it, i) => {
  if (todo && (it.why || /\*\*Завдання/.test(it.description || '')) && it.group) return;
  let line = `${i + 1}. ${it.id} [${it.type} L${it.level}${it.group ? ' g=' + it.group : ''}] ${it.title}`;
  if (it.type === 'quiz' || it.type === 'theory') {
    const opts = it.type === 'quiz' ? it.options : it.choices || [];
    const ans = it.type === 'quiz' ? it.answer : it.correct;
    line += `\n   Q: ${cut(it.question, 110)}\n   ` + opts.map((o, k) => `${k}${[].concat(ans).includes(k) ? '*' : ''}) ${cut(o, 60)}`).join(' | ') + (it.why ? ' [why ok]' : '');
  } else {
    line += `\n   D: ${cut(it.description, 120)}${/\*\*Завдання/.test(it.description || '') ? ' [tpl ok]' : ''}`;
  }
  console.log(line);
});
