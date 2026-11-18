/*
 * Середовище виконання React для тренажера.
 *  - React 19 + ReactDOM (vendor/react/react-bundle.js) вантажаться ліниво і вбудовуються в sandbox-сторінку.
 *  - JSX/TSX компілює TypeScript у воркері (js/ts-runtime.js); import { useState } from 'react' підтримується.
 *  - Завдання: { type: 'dom', runtime: 'react', html (з <div id="root">), css, js, editable: ['js'], tests }.
 *  - У тестах доступні: mount(Component, props) → { container, rerender, unmount }, act(fn),
 *    typeInto(input, value) — введення, яке бачить React, settle(ms) — дочекатися ефектів і промісів усередині act.
 *  - Перегляд: якщо код оголошує компонент App, він рендериться в #root.
 */
(function () {
  'use strict';

  var BASE = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/js\/react-runtime\.js(\?.*)?$/, '') : '';
  })();

  var bundlePromise = null;
  function loadReact() {
    if (window.FE_REACT) return Promise.resolve(window.FE_REACT);
    if (!bundlePromise) {
      bundlePromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = BASE + 'vendor/react/react-bundle.js';
        s.onload = function () { resolve(window.FE_REACT); };
        s.onerror = function () {
          bundlePromise = null;
          reject(new Error('Не вдалося завантажити React (vendor/react/react-bundle.js). Запустіть: node tools/build-react-vendor.js'));
        };
        document.head.appendChild(s);
      });
    }
    return bundlePromise;
  }

  var TEST_HELPERS = [
    'window.IS_REACT_ACT_ENVIRONMENT = true;',
    'window.act = React.act;',
    'window.mount = function (Component, props) {',
    '  var host = document.createElement("div");',
    '  host.className = "fe-mount";',
    '  document.body.appendChild(host);',
    '  var root;',
    '  React.act(function () { root = ReactDOM.createRoot(host); root.render(React.createElement(Component, props || null)); });',
    '  return {',
    '    container: host,',
    '    rerender: function (p) { React.act(function () { root.render(React.createElement(Component, p || null)); }); },',
    '    unmount: function () { React.act(function () { root.unmount(); }); host.remove(); }',
    '  };',
    '};',
    'window.typeInto = function (el, value) {',
    '  var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;',
    '  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);',
    '  el.dispatchEvent(new Event("input", { bubbles: true }));',
    '  el.dispatchEvent(new Event("change", { bubbles: true }));',
    '};',
    'window.settle = function (ms) { return React.act(function () { return new Promise(function (r) { setTimeout(r, ms || 0); }); }); };'
  ].join('\n');

  var AUTO_RENDER = '\n;(function () { var el = document.getElementById("root"); if (el && typeof App === "function") ReactDOM.createRoot(el).render(React.createElement(App)); })();\n';

  function syntaxResult(item, err) {
    return {
      status: 'failed',
      userError: { name: err.name || 'SyntaxError', message: err.message, line: err.line || null, syntax: true, stack: '' },
      harnessError: null,
      tests: (item.tests || []).map(function (t) {
        return { name: t.name, code: t.code, pass: false, ms: 0, error: { name: 'Skipped', message: 'Не виконано: синтаксична помилка в коді', stack: '', skipped: true } };
      }),
      logs: [],
      durationMs: 0
    };
  }

  function mapUserLine(res, map) {
    var mapLine = window.FERunner.ts.mapLine;
    if (res.userError && res.userError.line) res.userError.line = mapLine(map, res.userError.line);
  }

  // React + TypeScript (item.lang === 'tsx'): код перевіряє tsc --strict з @types/react 19, typeTests — як у TS-завданнях.
  var TSX_TITLE = 'Типи: App.tsx компілюється без помилок (tsc --strict, @types/react)';
  function isTyped(item) { return item.lang === 'tsx'; }
  function typecheck(item, code) {
    if (!isTyped(item)) return Promise.resolve(null);
    return window.FERunner.ts.checkProject({
      files: { '/App.tsx': String(code || '') }, roots: ['/App.tsx'], report: ['/App.tsx'], main: '/App.tsx', typeTests: item.typeTests
    });
  }

  function runReact(item, files, hooks) {
    return Promise.all([loadReact(), window.FERunner.ts.transpileJsx(files.js), typecheck(item, files.js)]).then(function (all) {
      var bundle = all[0];
      var tr = all[1];
      var chk = all[2];
      if (tr.error) return syntaxResult(item, tr.error);
      return window.FERunner.runDom({
        html: files.html, css: files.css, js: tr.js,
        tests: item.tests, testTimeout: item.testTimeout,
        prelude: bundle.src + '\n' + TEST_HELPERS
      }, hooks).then(function (res) {
        mapUserLine(res, tr.map);
        if (chk) {
          var errors = (chk.files['/App.tsx'] || []).filter(function (d) { return d.category === 1; });
          res.typeErrors = errors;
          window.FERunner.ts.mergeTypeResults(res, window.FERunner.ts.typeResults(TSX_TITLE, errors, item.typeTests, chk.tests, chk.ms));
        }
        return res;
      });
    }).catch(function (err) {
      return { status: 'error', userError: null, harnessError: { name: 'Error', message: err.message }, tests: [], logs: [], durationMs: 0 };
    });
  }

  // Живий перегляд: той самий код + автоматичний рендер App у #root.
  function previewDocAsync(opts, previewId) {
    return Promise.all([loadReact(), window.FERunner.ts.transpileJsx(opts.js)]).then(function (both) {
      var tr = both[1];
      var js = tr.error
        ? 'throw new SyntaxError(' + JSON.stringify((tr.error.line ? 'Рядок ' + tr.error.line + ': ' : '') + tr.error.message) + ');'
        : tr.js + AUTO_RENDER;
      return window.FERunner.previewDoc({ html: opts.html, css: opts.css, js: js, prelude: both[0].src }, previewId);
    });
  }

  window.FERunner.runtimes.react = {
    label: 'React 19 (JSX, ReactDOM у sandbox-вікні)',
    files: ['html', 'css', 'js'],
    fileLabel: 'App.jsx',
    mode: 'jsx',
    run: runReact,
    previewDocAsync: previewDocAsync,
    // Для TSX-завдань: назва файлу, режим редактора і заздалегідь відомі назви тестів типів.
    typed: function (item) {
      if (!isTyped(item)) return null;
      return { fileLabel: 'App.tsx', mode: { name: 'jsx', base: { name: 'javascript', typescript: true } }, title: TSX_TITLE };
    }
  };
  window.FERunner.react = { load: loadReact };
})();
