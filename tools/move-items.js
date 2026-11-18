#!/usr/bin/env node
/*
 * Переносить завдання всередині файлу теми (текстово, зберігаючи форматування).
 *   node tools/move-items.js <topic> <id1,id2,...> --after <id> [--group <groupId>]
 * Завдання в файлі мають формат «    {» … «    }» (4 пробіли) — як у всіх data/*.js.
 */
const fs = require('fs');
const path = require('path');
const [topic, idsArg] = process.argv.slice(2);
const after = process.argv[process.argv.indexOf('--after') + 1];
const gi = process.argv.indexOf('--group');
const group = gi !== -1 ? process.argv[gi + 1] : null;
const file = path.join(__dirname, '..', 'data', topic + '.js');
let src = fs.readFileSync(file, 'utf8');

function block(id) {
  const m = new RegExp("id:\\s*['\"]" + id + "['\"]").exec(src);
  if (!m) throw new Error('не знайдено ' + id);
  const start = src.lastIndexOf('\n    {', m.index);
  const endIdx = src.indexOf('\n    }', m.index);
  let end = endIdx + '\n    }'.length;
  if (src[end] === ',') end++;
  return { start, end };
}

const ids = idsArg.split(',');
const texts = ids.map((id) => {
  const b = block(id);
  let t = src.slice(b.start, b.end);
  src = src.slice(0, b.start) + src.slice(b.end);
  if (!t.endsWith(',')) t += ',';
  if (group) t = t.replace(/group:\s*['"][^'"]+['"]/, "group: '" + group + "'");
  return t;
});
const target = block(after);
let insertAt = target.end;
if (src[target.end - 1] !== ',') { src = src.slice(0, target.end) + ',' + src.slice(target.end); insertAt++; }
src = src.slice(0, insertAt) + texts.join('') + src.slice(insertAt);
// прибрати кому перед закриттям масиву, якщо перенесли в кінець
src = src.replace(/,(\s*\n\s*\]\s*\n\s*\}\);?\s*)$/, '$1');
fs.writeFileSync(file, src);
console.log('moved', ids.join(', '), 'after', after);
