#!/usr/bin/env node
/*
 * Перевірка «без забігання наперед»: завдання не повинно вимагати понять,
 * які вивчаються в пізніших темах (за порядком у data/_topics.js).
 *   node tools/check-prereqs.js [topic ...]
 * Аналізуються: умова, стартовий код, еталонне рішення, питання, варіанти, підказки.
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const order = [];
const items = [];
global.FE = {
  defineSections(sections) { sections.forEach((s) => s.topics.forEach((t) => order.push(t.id))); },
  topic(id, data) { (data.items || []).forEach((it) => items.push(Object.assign({ topic: id }, it))); }
};
require(path.join(dataDir, '_topics.js'));
fs.readdirSync(dataDir).filter((f) => f.endsWith('.js') && !f.startsWith('_')).forEach((f) => require(path.join(dataDir, f)));

// Поняття → тема, де воно вводиться.
const CONCEPTS = [
  { name: 'Map/Set/WeakMap', topic: 'js-modern', re: /\bnew\s+(Weak)?(Map|Set)\b|\b(Weak)?(Map|Set)\s*\(|\.has\(|Map<|\bWeakRef\b/ },
  { name: 'Symbol / ітератори', topic: 'js-modern', re: /\bSymbol\s*[.(]|\[Symbol\./ },
  { name: 'генератори', topic: 'js-modern', re: /function\s*\*|\byield\b/ },
  { name: 'Proxy/Reflect', topic: 'js-modern', re: /\bnew\s+Proxy\b|\bReflect\./ },
  // Базові class і this вводяться в js-start; тут — лише просунуті частини.
  { name: 'call / apply / bind', topic: 'js-this', re: /\.(call|apply|bind)\(/ },
  { name: 'наслідування / прототипи', topic: 'js-prototypes', re: /\bextends\b|\bsuper\s*[.(]|\.prototype\b|Object\.create\(|__proto__|setPrototypeOf/ },
  { name: 'кастомні помилки', topic: 'js-errors', re: /class\s+\w+\s+extends\s+\w*Error|\bAggregateError\b|\bcause\s*:/ },
  { name: 'Promise / async', topic: 'js-async', re: /\bPromise\b|\basync\s+(function|\(|\w+\s*=>)|\bawait\b|\.then\(/ },
  { name: 'reduce / map / filter', topic: 'js-arrays', re: /\.(reduce|reduceRight)\(/ }
];

const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const idx = (t) => order.indexOf(t);
const textOf = (it) => [
  it.description, it.starter, typeof it.solution === 'string' ? it.solution : it.solution && Object.values(it.solution).join('\n'),
  it.question, (it.options || []).join('\n'), (it.choices || []).join('\n'), (it.hints || []).join('\n'), it.hint
].filter(Boolean).join('\n');

const byTopic = {};
items.forEach((it) => {
  if (only.length && !only.includes(it.topic)) return;
  const myIdx = idx(it.topic);
  if (myIdx === -1) return;
  const text = textOf(it);
  const hits = CONCEPTS.filter((c) => idx(c.topic) > myIdx && c.re.test(text)).map((c) => c.name + ' (тема ' + c.topic + ')');
  if (hits.length) (byTopic[it.topic] = byTopic[it.topic] || []).push({ id: it.id, type: it.type, hits });
});

let total = 0;
order.forEach((t) => {
  const list = byTopic[t];
  if (!list) return;
  console.log(`\n${t}: ${list.length}`);
  list.forEach((r) => { total++; console.log(`  ${r.id} [${r.type}] → ${r.hits.join(', ')}`); });
});
console.log(`\nУсього завдань із забіганням наперед: ${total}`);
process.exit(total ? 1 : 0);
