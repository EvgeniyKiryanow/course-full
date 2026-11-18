#!/usr/bin/env node
/*
 * Збирає vendor/typescript/ts-bundle.js — компілятор TypeScript і потрібні lib.*.d.ts
 * у вигляді рядків, щоб перевірка типів працювала офлайн (file://) у Web Worker.
 *   npm install            (typescript 6.x — остання гілка з JS-компілятором)
 *   node tools/build-ts-vendor.js
 */
const fs = require('fs');
const path = require('path');

const tsDir = path.dirname(require.resolve('typescript/package.json'));
const libDir = path.join(tsDir, 'lib');
const outDir = path.join(__dirname, '..', 'vendor', 'typescript');
const ROOTS = ['es2023', 'dom', 'dom.iterable', 'dom.asynciterable'];

const libs = {};
function addLib(name) {
  const file = 'lib.' + name + '.d.ts';
  if (libs[file]) return;
  const full = path.join(libDir, file);
  if (!fs.existsSync(full)) throw new Error('немає ' + file);
  const text = fs.readFileSync(full, 'utf8');
  libs[file] = text;
  const re = /\/\/\/\s*<reference\s+lib="([^"]+)"\s*\/>/g;
  let m;
  while ((m = re.exec(text))) addLib(m[1]);
}
ROOTS.forEach(addLib);

const version = require(path.join(tsDir, 'package.json')).version;
const compiler = fs.readFileSync(path.join(libDir, 'typescript.js'), 'utf8');
fs.mkdirSync(outDir, { recursive: true });
const out = '/* TypeScript ' + version + ' (Apache-2.0, див. LICENSE.txt) — згенеровано tools/build-ts-vendor.js */\n' +
  'window.FE_TS_BUNDLE = {\n' +
  '  version: ' + JSON.stringify(version) + ',\n' +
  '  roots: ' + JSON.stringify(ROOTS.map((r) => 'lib.' + r + '.d.ts')) + ',\n' +
  '  libs: ' + JSON.stringify(libs) + ',\n' +
  '  compiler: ' + JSON.stringify(compiler) + '\n};\n';
fs.writeFileSync(path.join(outDir, 'ts-bundle.js'), out);
fs.copyFileSync(path.join(tsDir, 'LICENSE.txt'), path.join(outDir, 'LICENSE.txt'));
const kb = (n) => Math.round(n / 1024) + ' КБ';
console.log('TypeScript ' + version + ': ' + Object.keys(libs).length + ' lib-файлів (' + kb(Object.values(libs).join('').length) + '), бандл ' + kb(out.length));

// ---------------------------------------------------------------- типи бібліотек для TSX і Vue + TS
// vendor/typescript/types-bundle.js — віртуальні node_modules з d.ts (вантажаться лише для завдань
// React + TypeScript і Vue з lang="ts"): @types/react 19, @types/react-dom, csstype і типи Vue 3.
//   npm install   (devDependencies: @types/react, @types/react-dom, vue)
const nm = path.join(__dirname, '..', 'node_modules');
const typeFiles = {};
const pkgVersions = {};
function addType(virtualPath, realPath) {
  typeFiles[virtualPath] = fs.readFileSync(path.join(nm, realPath), 'utf8');
}
function addPkg(name, types) {
  const real = require(path.join(nm, name, 'package.json'));
  pkgVersions[name] = real.version;
  typeFiles['/node_modules/' + name + '/package.json'] = JSON.stringify({ name, version: real.version, types });
}
['index.d.ts', 'global.d.ts', 'jsx-runtime.d.ts', 'jsx-dev-runtime.d.ts'].forEach((f) => addType('/node_modules/@types/react/' + f, '@types/react/' + f));
addPkg('@types/react', 'index.d.ts');
['index.d.ts', 'client.d.ts'].forEach((f) => addType('/node_modules/@types/react-dom/' + f, '@types/react-dom/' + f));
addPkg('@types/react-dom', 'index.d.ts');
addType('/node_modules/csstype/index.d.ts', 'csstype/index.d.ts');
addPkg('csstype', 'index.d.ts');
['runtime-dom', 'runtime-core', 'reactivity', 'shared'].forEach((p) => {
  addType('/node_modules/@vue/' + p + '/dist/' + p + '.d.ts', '@vue/' + p + '/dist/' + p + '.d.ts');
  addPkg('@vue/' + p, 'dist/' + p + '.d.ts');
});
// Пакет vue: лише рантайм (export * from '@vue/runtime-dom'); тип компілятора шаблонів у тренажері не потрібен.
pkgVersions.vue = require(path.join(nm, 'vue', 'package.json')).version;
typeFiles['/node_modules/vue/index.d.ts'] = "export * from '@vue/runtime-dom';\n";
typeFiles['/node_modules/vue/package.json'] = JSON.stringify({ name: 'vue', version: pkgVersions.vue, types: 'index.d.ts' });
const typesOut = '/* d.ts бібліотек (MIT): ' + Object.keys(pkgVersions).map((k) => k + '@' + pkgVersions[k]).join(', ') + ' — згенеровано tools/build-ts-vendor.js */\n' +
  'window.FE_TS_TYPES = ' + JSON.stringify({ versions: pkgVersions, files: typeFiles }) + ';\n';
fs.writeFileSync(path.join(outDir, 'types-bundle.js'), typesOut);
console.log('Типи бібліотек: ' + Object.keys(pkgVersions).map((k) => k + '@' + pkgVersions[k]).join(', ') + ' → types-bundle.js ' + kb(typesOut.length));
