#!/usr/bin/env node
/*
 * Дописує кроки і завдання в кінець модуля, зберігаючи стиль файлу.
 *   node tools/append-items.js <topic> <patch-file>
 * Файл-патч — сирий JS-текст з двома секціями:
 *   //@@GROUPS
 *       { id: 'geometry', title: 'Координати і геометрія' },
 *   //@@ITEMS
 *       { id: '...', group: 'geometry', ... },
 *       { ... }
 * Після вставки файл перевіряється на синтаксис; при помилці зміни не зберігаються.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const [topic, patchFile] = process.argv.slice(2);
if (!topic || !patchFile) { console.error('usage: append-items.js <topic> <patch>'); process.exit(1); }
const file = path.join(__dirname, '..', 'data', topic + '.js');
let src = fs.readFileSync(file, 'utf8');
const patch = fs.readFileSync(patchFile, 'utf8');
const gm = patch.indexOf('//@@GROUPS');
const im = patch.indexOf('//@@ITEMS');
if (im < 0) throw new Error('у патчі немає //@@ITEMS');
const groupsText = gm >= 0 ? patch.slice(gm + 10, im).replace(/^\s*\n/, '').replace(/[\s,]+$/, '') : '';
const itemsText = patch.slice(im + 9).replace(/^\s*\n/, '').replace(/[\s,]+$/, '');

if (groupsText) {
  const gs = src.indexOf('groups: [');
  if (gs < 0) throw new Error('немає groups у ' + topic);
  const ge = src.indexOf('\n  ],', gs);
  if (ge < 0) throw new Error('не знайдено кінець groups');
  const before = src.slice(0, ge).replace(/\s+$/, '');
  src = before + (before.endsWith(',') ? '' : ',') + '\n' + groupsText + src.slice(ge);
}
const end = src.lastIndexOf('\n    }\n  ]\n');
if (end < 0) throw new Error('не знайдено кінець items у ' + topic);
src = src.slice(0, end) + '\n    },\n' + itemsText + src.slice(end + 6);

try {
  new vm.Script(src, { filename: file });
} catch (e) {
  console.error('Синтаксична помилка після вставки, файл не змінено: ' + e.message);
  process.exit(1);
}
fs.writeFileSync(file, src);
const n = (itemsText.match(/^\s{4}\{\s*$|^\s{4}\{ ?id:/gm) || []).length;
console.log('✔ ' + topic + ': додано ' + (groupsText ? 'кроки + ' : '') + 'завдання (~' + n + ')');
