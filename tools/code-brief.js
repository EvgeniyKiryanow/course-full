#!/usr/bin/env node
/*
 * Стислий огляд задач з кодом для написання каркасів: стартовий код + початок рішення.
 *   node tools/code-brief.js <topic> [maxSolutionLines=18]
 */
const path = require('path');
const topicId = process.argv[2];
const max = Number(process.argv[3]) || 18;
let data;
global.FE = { topic(id, d) { if (id === topicId) data = d; } };
require(path.join(__dirname, '..', 'data', topicId + '.js'));
data.items.filter((i) => i.type === 'code' && !/Як це працює/.test(i.description || '')).forEach((it) => {
  const sol = String(it.solution).split('\n').filter((l) => l.trim() && !/^\s*\/\//.test(l));
  console.log('### ' + it.id + ' — ' + it.title);
  console.log('starter: ' + String(it.starter).trim().replace(/\n/g, ' ⏎ ').slice(0, 160));
  console.log(sol.slice(0, max).join('\n') + (sol.length > max ? '\n  …(+' + (sol.length - max) + ')' : ''));
});
