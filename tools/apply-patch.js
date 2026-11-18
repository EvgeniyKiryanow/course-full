#!/usr/bin/env node
/*
 * Вливає патч у файл теми текстово (без перезапису форматування):
 *   node tools/apply-patch.js <topic> <patch.json>
 * patch: {
 *   groups: [{ id, title, from: '<id першого завдання кроку>' }],   // кроки за наявним порядком
 *   why:   { '<itemId>': ['речення на кожен варіант', ...] },
 *   where: { '<itemId>': 'Де трапляється: текст' }                  // для code/dom: додає шаблон
 * }
 */
const fs = require('fs');
const path = require('path');
const topicId = process.argv[2];
const patch = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const file = path.join(__dirname, '..', 'data', topicId + '.js');
let src = fs.readFileSync(file, 'utf8');

let data;
global.FE = { topic(id, d) { if (id === topicId) data = d; } };
require(file);
const items = data.items;

// 1. Крок для кожного завдання — за межами сегментів.
const groupOf = {};
if (patch.groups) {
  const starts = patch.groups.map((g) => {
    const idx = items.findIndex((i) => i.id === g.from);
    if (idx === -1) throw new Error('from не знайдено: ' + g.from);
    return idx;
  });
  if (starts[0] !== 0) throw new Error('перший крок має починатися з першого завдання');
  items.forEach((it, i) => {
    let gi = 0;
    starts.forEach((s, k) => { if (i >= s) gi = k; });
    groupOf[it.id] = patch.groups[gi].id;
  });
}

const js = (v) => JSON.stringify(v);
const escTpl = (s) => String(s).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

let applied = { group: 0, why: 0, where: 0 };
items.forEach((it) => {
  const idRe = new RegExp("(id:\\s*['\"]" + it.id.replace(/[-]/g, '\\-') + "['\"],?)");
  const m = idRe.exec(src);
  if (!m) throw new Error('id не знайдено в тексті: ' + it.id);
  let insert = '';
  if (groupOf[it.id] && !it.group) { insert += ' group: ' + js(groupOf[it.id]) + ','; applied.group++; }
  const why = patch.why && patch.why[it.id];
  if (why && !it.why) {
    const n = (it.type === 'quiz' ? it.options : it.choices || []).length;
    if (why.length !== n) throw new Error(it.id + ': why ' + why.length + ' ≠ варіантів ' + n);
    insert += ' why: ' + js(why) + ',';
    applied.why++;
  }
  if (insert) {
    const at = m.index + m[0].length;
    src = src.slice(0, at) + (m[0].endsWith(',') ? '' : ',') + insert + src.slice(at);
  }
  // Шаблон умови: «**Завдання.** » на початку + «**Де трапляється:**» після першого абзацу.
  const where = patch.where && patch.where[it.id];
  if (where && (it.type === 'code' || it.type === 'dom') && !/\*\*Завдання/.test(it.description || '')) {
    const from = src.indexOf(m[0]);
    const d = src.indexOf('description:', from);
    const q = src.slice(d).search(/[`'"]/);
    const quote = src[d + q];
    if (quote !== '`') throw new Error(it.id + ': description не в шаблонному рядку');
    let p = d + q + 1;
    while (/\s/.test(src[p])) p++;
    src = src.slice(0, p) + '**Завдання.** ' + src.slice(p);
    // кінець першого абзацу: порожній рядок або неекранований бектик (кінець шаблонного рядка)
    let at = p;
    while (at < src.length) {
      if (src[at] === '\\') { at += 2; continue; }
      if (src[at] === '`') break;
      if (src[at] === '\n' && /^\n[ \t]*\n/.test(src.slice(at, at + 40))) break;
      at++;
    }
    src = src.slice(0, at) + '\n\n**Де трапляється:** ' + escTpl(where) + src.slice(at);
    applied.where++;
  }
});

// Межі рядкового літерала (шаблонного або в лапках), що починається з позиції p.
function literalEnd(s, p) {
  const q = s[p];
  let i = p + 1;
  while (i < s.length) {
    if (s[i] === '\\') { i += 2; continue; }
    if (s[i] === q) return i;
    i++;
  }
  throw new Error('незакритий літерал');
}
function fieldLiteral(s, from, field) {
  const re = new RegExp('\\b' + field + ':\\s*');
  const m = re.exec(s.slice(from));
  if (!m) return null;
  const start = from + m.index + m[0].length;
  if (!/[`'"]/.test(s[start])) return null;
  return { start, end: literalEnd(s, start) };
}
// 3. how: дописати «**Як це працює:**» у кінець умови; starter: замінити стартовий код каркасом.
items.forEach((it) => {
  const how = patch.how && patch.how[it.id];
  let starter = patch.starter && patch.starter[it.id];
  // steps: замінити рядок «// ваш код» у наявному стартовому коді на кроки + TODO
  const steps = patch.steps && patch.steps[it.id];
  // plan: блок «План» на початку стартового коду + усі «// ваш код» → «// TODO»
  const plan = patch.plan && patch.plan[it.id];
  if (plan && !starter) {
    starter = '// План:\n' + plan.map((s, i) => '// ' + (i + 1) + '. ' + s).join('\n') + '\n\n' +
      String(it.starter).replace(/\/\/ ваш код/g, '// TODO');
  }
  if (steps && !starter && /\/\/ ваш код/.test(it.starter || '')) {
    starter = String(it.starter).replace(/^([ \t]*)\/\/ ваш код.*$/m, (m, ind) =>
      steps.map((s, i) => ind + '// ' + (i + 1) + '. ' + s).join('\n') + '\n' + ind + '// TODO');
  }
  if (!how && !starter) return;
  const idRe = new RegExp("id:\\s*['\"]" + it.id.replace(/[-]/g, '\\-') + "['\"]");
  const idPos = src.search(idRe);
  if (how && !/Як це працює/.test(it.description || '')) {
    const lit = fieldLiteral(src, idPos, 'description');
    if (lit && src[lit.start] === '`') {
      const body = src.slice(lit.start + 1, lit.end).replace(/\s+$/, '');
      src = src.slice(0, lit.start + 1) + body + '\n\n**Як це працює:** ' + escTpl(how) + '\n' + src.slice(lit.end);
      applied.how = (applied.how || 0) + 1;
    }
  }
  if (starter) {
    const lit = fieldLiteral(src, src.search(idRe), 'starter');
    if (!lit) throw new Error(it.id + ': starter не знайдено');
    src = src.slice(0, lit.start) + '`' + escTpl(starter) + '`' + src.slice(lit.end + 1);
    applied.starter = (applied.starter || 0) + 1;
  }
});

// 2. Оголошення кроків перед items.
if (patch.groups && !(data.groups || []).length) {
  const g = '  groups: [\n' + patch.groups.map((x) => '    { id: ' + js(x.id) + ', title: ' + js(x.title) + ' }').join(',\n') + '\n  ],\n';
  const k = src.search(/\n\s*items:\s*\[/);
  src = src.slice(0, k + 1) + g + src.slice(k + 1);
}

fs.writeFileSync(file, src);
console.log(topicId, JSON.stringify(applied));
