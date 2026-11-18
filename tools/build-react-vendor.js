#!/usr/bin/env node
/*
 * Збирає vendor/react/react-bundle.js — React + ReactDOM (development-збірка з підказками й React.act)
 * як рядок, який середовище 'react' вбудовує в sandbox-сторінку перед кодом учня (офлайн, file://).
 *   npm install && node tools/build-react-vendor.js
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'vendor', 'react');
const entry = `
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
window.React = React;
window.ReactDOM = Object.assign({}, ReactDOM, ReactDOMClient);
`;
const result = esbuild.buildSync({
  stdin: { contents: entry, resolveDir: root, loader: 'js' },
  bundle: true,
  format: 'iife',
  write: false,
  minify: false,
  legalComments: 'none',
  define: { 'process.env.NODE_ENV': '"development"' },
  target: 'es2020'
});
const src = result.outputFiles[0].text;
const version = require(path.join(root, 'node_modules', 'react', 'package.json')).version;
fs.mkdirSync(outDir, { recursive: true });
const out = '/* React ' + version + ' + ReactDOM (MIT, див. LICENSE) — згенеровано tools/build-react-vendor.js */\n' +
  'window.FE_REACT = { version: ' + JSON.stringify(version) + ', src: ' + JSON.stringify(src) + ' };\n';
fs.writeFileSync(path.join(outDir, 'react-bundle.js'), out);
fs.copyFileSync(path.join(root, 'node_modules', 'react', 'LICENSE'), path.join(outDir, 'LICENSE'));
console.log('React ' + version + ': бандл ' + Math.round(out.length / 1024) + ' КБ');
