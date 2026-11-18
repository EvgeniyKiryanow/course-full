#!/usr/bin/env node
/*
 * Збирає vendor/vue/:
 *  - vue-bundle.js   — Vue 3 (development-збірка з компілятором шаблонів) як рядок, який середовище 'vue'
 *                      вбудовує в sandbox-сторінку перед кодом учня;
 *  - compiler-sfc.js — офіційний @vue/compiler-sfc (браузерна збірка) як window.VueCompilerSFC:
 *                      компілює .vue-файли (<script setup>, <template>, <style scoped>) прямо в браузері.
 *   npm install && node tools/build-vue-vendor.js
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'vendor', 'vue');
const version = require(path.join(root, 'node_modules', 'vue', 'package.json')).version;
fs.mkdirSync(outDir, { recursive: true });

const vueSrc = fs.readFileSync(path.join(root, 'node_modules', 'vue', 'dist', 'vue.global.js'), 'utf8');
const bundle = '/* Vue ' + version + ' (MIT, див. LICENSE) — згенеровано tools/build-vue-vendor.js */\n' +
  'window.FE_VUE = { version: ' + JSON.stringify(version) + ', src: ' + JSON.stringify(vueSrc) + ' };\n';
fs.writeFileSync(path.join(outDir, 'vue-bundle.js'), bundle);

const compiler = esbuild.buildSync({
  entryPoints: [path.join(root, 'node_modules', '@vue', 'compiler-sfc', 'dist', 'compiler-sfc.esm-browser.js')],
  bundle: true,
  format: 'iife',
  globalName: 'VueCompilerSFC',
  write: false,
  minify: true,
  legalComments: 'none',
  target: 'es2020'
});
fs.writeFileSync(path.join(outDir, 'compiler-sfc.js'),
  '/* @vue/compiler-sfc ' + version + ' (MIT) — згенеровано tools/build-vue-vendor.js */\n' + compiler.outputFiles[0].text);
fs.copyFileSync(path.join(root, 'node_modules', 'vue', 'LICENSE'), path.join(outDir, 'LICENSE'));

console.log('Vue ' + version + ': бандл ' + Math.round(bundle.length / 1024) + ' КБ, компілятор ' +
  Math.round(compiler.outputFiles[0].text.length / 1024) + ' КБ');
