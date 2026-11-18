/*
 * Середовище виконання TypeScript для тренажера.
 *  - Компілятор (vendor/typescript/ts-bundle.js) вантажиться ліниво, лише коли відкрито TS-завдання.
 *  - Перевірка типів (--strict) і транспіляція — у постійному Web Worker, щоб не блокувати інтерфейс.
 *  - Завдання: { type: 'code', runtime: 'ts', starter, solution, tests (JS, як звичайні), typeTests }.
 *    typeTests — TS-код, що перевіряється разом з кодом учня (не виконується):
 *      type T = Expect<Equal<MyPick<Todo, 'title'>, { title: string }>>;
 *      // @ts-expect-error — рядок нижче МАЄ давати помилку типу
 *  - Результат: синтетичні тести «Типи: …» + звичайні тести виконання (runCode).
 */
(function () {
  'use strict';

  var BASE = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/js\/ts-runtime\.js(\?.*)?$/, '') : '';
  })();

  // Хелпери для перевірки типів (як у type-challenges); доступні в коді учня і в typeTests.
  var PRELUDE = [
    'type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;',
    'type NotEqual<X, Y> = true extends Equal<X, Y> ? false : true;',
    'type Expect<T extends true> = T;'
  ].join('\n');

  var bundlePromise = null;
  function loadBundle() {
    if (window.FE_TS_BUNDLE) return Promise.resolve(window.FE_TS_BUNDLE);
    if (!bundlePromise) {
      bundlePromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = BASE + 'vendor/typescript/ts-bundle.js';
        s.onload = function () { resolve(window.FE_TS_BUNDLE); };
        s.onerror = function () {
          bundlePromise = null;
          reject(new Error('Не вдалося завантажити компілятор TypeScript (vendor/typescript/ts-bundle.js). Запустіть: node tools/build-ts-vendor.js'));
        };
        document.head.appendChild(s);
      });
    }
    return bundlePromise;
  }

  // ---------------------------------------------------------------- код воркера
  function workerMain() {
    /* global ts */
    var libs = {};
    var files = { '/main.ts': '' };
    var version = 0;
    var options = null;
    var service = null;

    function libName(f) { return f.replace(/^\//, ''); }
    var host = {
      getScriptFileNames: function () { return ['/main.ts']; },
      getScriptVersion: function (f) { return f === '/main.ts' ? String(version) : '1'; },
      getScriptSnapshot: function (f) {
        var text = f === '/main.ts' ? files[f] : libs[libName(f)];
        return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
      },
      getCurrentDirectory: function () { return '/'; },
      getCompilationSettings: function () { return options; },
      getDefaultLibFileName: function () { return '/lib.d.ts'; },
      fileExists: function (f) { return f === '/main.ts' || libs[libName(f)] !== undefined; },
      readFile: function (f) { return f === '/main.ts' ? files[f] : libs[libName(f)]; },
      directoryExists: function () { return true; },
      getDirectories: function () { return []; }
    };

    // import { useState } from 'react' → const { useState } = React; (React і ReactDOM — глобальні в sandbox)
    // import type … і { type X } — лише для перевірки типів, у рантаймі їх немає.
    function reactImports(code) {
      return code.replace(/^[ \t]*import\s+type\s[^\n]*$/gm, '').replace(/^[ \t]*import\s+(?:([\w$]+)\s*,?\s*)?(?:\*\s+as\s+[\w$]+\s*)?(?:\{([^}]*)\})?\s*from\s*['"](react|react-dom|react-dom\/client)['"];?[ \t]*$/gm, function (m, def, named, lib) {
        if (!named || !named.trim()) return '';
        var parts = named.split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x && !/^type\s/.test(x); }).map(function (x) { return x.replace(/\s+as\s+/, ': '); });
        return parts.length ? 'const { ' + parts.join(', ') + ' } = ' + (lib === 'react' ? 'React' : 'ReactDOM') + ';' : '';
      });
    }

    function stripModules(code) {
      // Код виконується як звичайний скрипт: прибираємо export/import, щоб не було SyntaxError.
      return code
        .replace(/^([ \t]*)export[ \t]+default[ \t]+/gm, '$1')
        .replace(/^([ \t]*)export[ \t]+(?=(?:declare[ \t]+|abstract[ \t]+|async[ \t]+)*(?:function|class|const|let|var|interface|type|enum|namespace)\b)/gm, '$1')
        .replace(/^[ \t]*export[ \t]*\{[^}]*\}[ \t]*;?[ \t]*$/gm, '')
        .replace(/^[ \t]*import[ \t][^\n]*$/gm, '');
    }

    var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    // Source map → для кожного рядка JS — рядок у TS (1-based).
    function lineMap(mappings) {
      var res = [];
      var srcLine = 0;
      String(mappings || '').split(';').forEach(function (lineStr, gen) {
        var first = null;
        lineStr.split(',').forEach(function (seg) {
          if (!seg) return;
          var vals = [];
          var shift = 0;
          var value = 0;
          for (var i = 0; i < seg.length; i++) {
            var d = B64.indexOf(seg.charAt(i));
            var cont = d & 32;
            value += (d & 31) << shift;
            if (cont) shift += 5;
            else { vals.push(value & 1 ? -(value >> 1) : value >> 1); value = 0; shift = 0; }
          }
          if (vals.length >= 4) { srcLine += vals[2]; if (first === null) first = srcLine + 1; }
        });
        res[gen + 1] = first;
      });
      return res;
    }

    function transpile(code, jsx) {
      var options = { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, sourceMap: true, removeComments: false, useDefineForClassFields: true };
      if (jsx) {
        options.jsx = ts.JsxEmit.React;
        options.jsxFactory = 'React.createElement';
        options.jsxFragmentFactory = 'React.Fragment';
      }
      var out = ts.transpileModule(stripModules(jsx ? reactImports(code) : code), {
        fileName: jsx ? 'main.tsx' : 'main.ts',
        reportDiagnostics: jsx,
        compilerOptions: options
      });
      if (jsx && out.diagnostics && out.diagnostics.length) {
        var d = out.diagnostics[0];
        var sfj = ts.createSourceFile('main.tsx', stripModules(reactImports(code)), ts.ScriptTarget.ES2022, false, ts.ScriptKind.TSX);
        var lnj = d.start !== undefined ? sfj.getLineAndCharacterOfPosition(d.start).line + 1 : null;
        return { error: { name: 'SyntaxError', message: ts.flattenDiagnosticMessageText(d.messageText, ' '), line: lnj } };
      }
      var js = out.outputText.replace(/\n?\/\/# sourceMappingURL=[^\n]*\s*$/, '\n').replace(/^export \{\};?\s*$/m, '');
      var map = null;
      try { map = lineMap(JSON.parse(out.sourceMapText).mappings); } catch (e) { /* без карти */ }
      return { js: js, map: map };
    }

    function message(d) {
      if (d.code === 2578) return 'Очікувалась помилка типу, але її немає — тип пропускає некоректне використання (невикористаний @ts-expect-error).';
      return ts.flattenDiagnosticMessageText(d.messageText, '\n');
    }

    function check(code, typeTests, prelude) {
      var t0 = Date.now();
      var pre = prelude.split('\n').length;
      var userLines = code.split('\n').length;
      var text = prelude + '\n' + code + '\n';
      var ranges = [];
      var line = pre + userLines + 1;
      (typeTests || []).forEach(function (t) {
        var body = '// ---- ' + t.name.replace(/\n/g, ' ') + '\n' + t.code + '\n';
        var n = body.split('\n').length - 1;
        ranges.push({ from: line + 1, to: line + n - 1 });
        text += body;
        line += n;
      });
      files['/main.ts'] = text;
      version++;
      var diags = service.getSyntacticDiagnostics('/main.ts').concat(service.getSemanticDiagnostics('/main.ts'));
      var sf = service.getProgram().getSourceFile('/main.ts');
      var user = [];
      var tests = (typeTests || []).map(function () { return []; });
      diags.forEach(function (d) {
        var ln = d.file && d.start !== undefined ? sf.getLineAndCharacterOfPosition(d.start).line + 1 : pre + 1;
        var item = { code: d.code, message: message(d), category: d.category };
        if (ln <= pre) { item.line = null; user.push(item); return; }
        if (ln <= pre + userLines) { item.line = ln - pre; user.push(item); return; }
        for (var i = 0; i < ranges.length; i++) {
          if (ln >= ranges[i].from && ln <= ranges[i].to) { item.line = ln - ranges[i].from + 1; tests[i].push(item); return; }
        }
        user.push(item);
      });
      return { user: user, tests: tests, ms: Date.now() - t0 };
    }

    // ---- Перевірка «проєкту»: кілька файлів + d.ts бібліотек (React, Vue) у віртуальних node_modules.
    var typeFiles = null;
    var proj = { files: {}, versions: {}, roots: [] };
    var projOptions = null;
    var projService = null;
    function projRead(f) {
      if (proj.files[f] !== undefined) return proj.files[f];
      if (typeFiles && typeFiles[f] !== undefined) return typeFiles[f];
      return libs[libName(f)];
    }
    var projHost = {
      getScriptFileNames: function () { return proj.roots; },
      getScriptVersion: function (f) { return proj.files[f] !== undefined ? String(proj.versions[f] || 0) : '1'; },
      getScriptSnapshot: function (f) {
        var text = projRead(f);
        return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
      },
      getCurrentDirectory: function () { return '/'; },
      getCompilationSettings: function () { return projOptions; },
      getDefaultLibFileName: function () { return '/lib.d.ts'; },
      fileExists: function (f) { return projRead(f) !== undefined; },
      readFile: projRead,
      directoryExists: function () { return true; },
      getDirectories: function () { return []; }
    };

    // m: { files: { шлях: текст }, roots, report (файли, для яких збираємо діагностику), main, typeTests }
    function checkProject(m) {
      var t0 = Date.now();
      var files = Object.assign({}, m.files);
      var ranges = [];
      if (m.main && files[m.main] !== undefined && (m.typeTests || []).length) {
        var text = files[m.main] + '\n';
        var line = text.split('\n').length;
        (m.typeTests || []).forEach(function (t) {
          var body = '// ---- ' + t.name.replace(/\n/g, ' ') + '\n' + t.code + '\n';
          var n = body.split('\n').length - 1;
          ranges.push({ from: line + 1, to: line + n - 1 });
          text += body;
          line += n;
        });
        files[m.main] = text;
      }
      Object.keys(files).forEach(function (f) {
        if (proj.files[f] !== files[f]) proj.versions[f] = (proj.versions[f] || 0) + 1;
      });
      proj.files = files;
      proj.roots = m.roots.slice();
      var program = projService.getProgram();
      var out = {};
      var tests = (m.typeTests || []).map(function () { return []; });
      (m.report || []).forEach(function (f) {
        out[f] = [];
        var sf = program.getSourceFile(f);
        if (!sf) return;
        projService.getSyntacticDiagnostics(f).concat(projService.getSemanticDiagnostics(f)).forEach(function (d) {
          var ln = d.start !== undefined ? sf.getLineAndCharacterOfPosition(d.start).line + 1 : null;
          var item = { code: d.code, message: message(d), category: d.category, line: ln };
          if (f === m.main && ln !== null) {
            for (var i = 0; i < ranges.length; i++) {
              if (ln >= ranges[i].from && ln <= ranges[i].to) { item.line = ln - ranges[i].from + 1; tests[i].push(item); return; }
            }
          }
          out[f].push(item);
        });
      });
      return { files: out, tests: tests, ms: Date.now() - t0 };
    }

    self.onmessage = function (e) {
      var m = e.data;
      try {
        if (m.type === 'types') {
          typeFiles = m.files;
          projOptions = {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ESNext,
            moduleResolution: ts.ModuleResolutionKind.Bundler,
            moduleDetection: ts.ModuleDetectionKind.Force,
            lib: options.lib,
            strict: true,
            noEmit: true,
            skipLibCheck: true,
            useDefineForClassFields: true,
            types: [],
            jsx: ts.JsxEmit.ReactJSX,
            allowJs: true,
            checkJs: false,
            allowUmdGlobalAccess: true,
            allowImportingTsExtensions: true,
            esModuleInterop: true
          };
          projService = ts.createLanguageService(projHost, ts.createDocumentRegistry());
          self.postMessage({ id: m.id, ok: true });
        } else if (m.type === 'checkProject') {
          self.postMessage(Object.assign({ id: m.id, ok: true }, checkProject(m)));
        } else if (m.type === 'init') {
          libs = m.libs;
          options = {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ESNext,
            moduleDetection: ts.ModuleDetectionKind.Force,
            lib: m.roots,
            strict: true,
            noEmit: true,
            skipLibCheck: true,
            useDefineForClassFields: true,
            types: []
          };
          service = ts.createLanguageService(host, ts.createDocumentRegistry());
          check('', [], m.prelude);
          self.postMessage({ id: m.id, ok: true, version: ts.version });
        } else if (m.type === 'check') {
          var res = check(m.code, m.typeTests, m.prelude);
          var tr = transpile(m.code);
          self.postMessage({ id: m.id, ok: true, user: res.user, tests: res.tests, ms: res.ms, js: tr.js, map: tr.map });
        } else if (m.type === 'transpile') {
          var t = transpile(m.code, m.jsx);
          self.postMessage({ id: m.id, ok: true, js: t.js, map: t.map, error: t.error });
        }
      } catch (err) {
        self.postMessage({ id: m.id, ok: false, error: String(err && err.stack || err) });
      }
    };
  }

  // ---------------------------------------------------------------- клієнт воркера
  var worker = null;
  var ready = null;
  var seq = 0;
  var pending = {};

  function call(msg) {
    return new Promise(function (resolve, reject) {
      var id = ++seq;
      msg.id = id;
      pending[id] = { resolve: resolve, reject: reject };
      worker.postMessage(msg);
    });
  }

  function ensureWorker() {
    if (ready) return ready;
    ready = loadBundle().then(function (bundle) {
      var src = bundle.compiler + '\n;(' + workerMain.toString() + ')();\n';
      var url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      worker = new Worker(url);
      worker.onmessage = function (e) {
        var p = pending[e.data.id];
        if (!p) return;
        delete pending[e.data.id];
        if (e.data.ok) p.resolve(e.data);
        else p.reject(new Error(e.data.error));
      };
      worker.onerror = function (e) {
        Object.keys(pending).forEach(function (id) { pending[id].reject(new Error('Помилка компілятора TypeScript: ' + (e.message || 'worker'))); delete pending[id]; });
      };
      return call({ type: 'init', libs: bundle.libs, roots: bundle.roots, prelude: PRELUDE });
    }).catch(function (err) {
      ready = null;
      throw err;
    });
    return ready;
  }

  function check(code, typeTests) {
    return ensureWorker().then(function () {
      return call({ type: 'check', code: String(code || ''), typeTests: (typeTests || []).map(function (t) { return { name: t.name, code: t.code }; }), prelude: PRELUDE });
    });
  }
  function transpile(code) {
    return ensureWorker().then(function () { return call({ type: 'transpile', code: String(code || '') }); }).then(function (r) { return r.js; });
  }

  function formatDiags(list) {
    return list.map(function (d) { return (d.line ? 'Рядок ' + d.line + ': ' : '') + 'TS' + d.code + ': ' + d.message; }).join('\n');
  }

  // ---- Типи бібліотек (React, Vue) — ліниво, лише для завдань React + TS і Vue з lang="ts".
  var typesReady = null;
  function loadTypes() {
    if (window.FE_TS_TYPES) return Promise.resolve(window.FE_TS_TYPES);
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = BASE + 'vendor/typescript/types-bundle.js';
      s.onload = function () { resolve(window.FE_TS_TYPES); };
      s.onerror = function () { reject(new Error('Не вдалося завантажити типи бібліотек (vendor/typescript/types-bundle.js). Запустіть: node tools/build-ts-vendor.js')); };
      document.head.appendChild(s);
    });
  }
  function ensureTypes() {
    if (!typesReady) {
      typesReady = Promise.all([ensureWorker(), loadTypes()]).then(function (r) {
        return call({ type: 'types', files: r[1].files });
      }).catch(function (err) { typesReady = null; throw err; });
    }
    return typesReady;
  }
  // Глобальні хелпери Equal/Expect для typeTests — окремий d.ts (не модуль), щоб не зсувати рядки файлів учня.
  var PRELUDE_FILE = '/fe-prelude.d.ts';
  function checkProject(opts) {
    return ensureTypes().then(function () {
      var files = Object.assign({}, opts.files);
      files[PRELUDE_FILE] = PRELUDE + '\n';
      return call({
        type: 'checkProject', files: files, roots: opts.roots.concat([PRELUDE_FILE]), report: opts.report, main: opts.main,
        typeTests: (opts.typeTests || []).map(function (t) { return { name: t.name, code: t.code }; })
      });
    });
  }
  // Синтетичні тести «Типи: …» (як у TS-завданнях): помилки коду учня + кожен typeTest окремо.
  function typeResults(title, errors, typeTests, testDiags, ms) {
    var out = [{
      name: title,
      code: '// tsc --strict',
      pass: errors.length === 0,
      ms: ms || 0,
      error: errors.length ? { name: 'TypeError', message: formatDiags(errors), stack: '' } : null
    }];
    (typeTests || []).forEach(function (t, i) {
      var d = ((testDiags || [])[i] || []).filter(function (x) { return x.category === 1; });
      out.push({ name: 'Типи: ' + t.name, code: t.code, pass: d.length === 0, ms: 0, error: d.length ? { name: 'TypeError', message: formatDiags(d), stack: '' } : null });
    });
    return out;
  }
  // Додає результати перевірки типів до результату запуску тестів і перераховує статус.
  function mergeTypeResults(res, typeTests) {
    res.tests = typeTests.concat(res.tests || []);
    var allPass = res.tests.every(function (t) { return t.pass; });
    if (res.status === 'passed' && !allPass) res.status = 'failed';
    return res;
  }
  function mapLine(map, line) {
    if (!map || !line) return line;
    for (var l = line; l >= 1; l--) if (map[l]) return map[l];
    return line;
  }

  function runTs(item, files, hooks) {
    var code = files.js;
    return check(code, item.typeTests).then(function (chk) {
      var errors = chk.user.filter(function (d) { return d.category === 1; });
      return window.FERunner.runtimes.code.run(item, { js: chk.js }, hooks).then(function (res) {
        if (res.userError && res.userError.line) res.userError.line = mapLine(chk.map, res.userError.line);
        if (res.userError && res.userError.stack) {
          res.userError.stack = res.userError.stack.replace(/рядок (\d+)/g, function (m, n) { return 'рядок ' + mapLine(chk.map, Number(n)); });
        }
        var typeResults = [{
          name: 'Типи: код компілюється без помилок (strict)',
          code: '// tsc --strict',
          pass: errors.length === 0,
          ms: chk.ms,
          error: errors.length ? { name: 'TypeError', message: formatDiags(errors), stack: '' } : null
        }];
        (item.typeTests || []).forEach(function (t, i) {
          var d = (chk.tests[i] || []).filter(function (x) { return x.category === 1; });
          typeResults.push({
            name: 'Типи: ' + t.name,
            code: t.code,
            pass: d.length === 0,
            ms: 0,
            error: d.length ? { name: 'TypeError', message: formatDiags(d), stack: '' } : null
          });
        });
        res.tests = typeResults.concat(res.tests || []);
        res.typeErrors = errors;
        var allPass = res.tests.every(function (t) { return t.pass; });
        if (res.status === 'passed' && !allPass) res.status = 'failed';
        if (res.status !== 'passed' && allPass && !res.userError && !res.timedOut) res.status = 'passed';
        return res;
      });
    }).catch(function (err) {
      return { status: 'error', userError: null, harnessError: { name: 'Error', message: err.message }, tests: [], logs: [], durationMs: 0 };
    });
  }

  // REPL-сесія: код і вирази в консолі транспілюються; помилки типів показуються як попередження.
  function createTsSession(code, hooks) {
    hooks = hooks || {};
    var inner = null;
    var dead = false;
    var started = check(code, []).then(function (chk) {
      var errors = chk.user.filter(function (d) { return d.category === 1; });
      if (errors.length && hooks.onLog) {
        hooks.onLog({ level: 'warn', text: '⚠ Помилки типів (код усе одно виконано):\n' + formatDiags(errors) });
      }
      if (dead) return { ok: false };
      inner = window.FERunner.createCodeSession(chk.js, hooks);
      return inner.started.then(function (res) {
        if (res && res.error && res.error.line) res.error.line = mapLine(chk.map, res.error.line);
        return res;
      });
    }).catch(function (err) {
      return { ok: false, error: { name: 'Error', message: err.message } };
    });
    return {
      started: started,
      eval: function (expr) {
        return started.then(function () {
          if (!inner) return { error: { name: 'Error', message: 'Сесію не запущено' }, dead: true };
          return transpile(expr).then(function (js) { return inner.eval(js.replace(/;\s*$/, '')); });
        });
      },
      isDead: function () { return dead || (inner ? inner.isDead() : false); },
      terminate: function () { dead = true; if (inner) inner.terminate(); }
    };
  }

  window.FERunner.runtimes.ts = {
    label: 'TypeScript (tsc --strict + Web Worker)',
    files: ['js'],
    fileLabel: 'script.ts',
    mode: 'text/typescript',
    run: runTs,
    createSession: createTsSession
  };
  // JSX/TSX → JS для середовища React: { js, map } або { error: { name, message, line } }
  function transpileJsx(code) {
    return ensureWorker().then(function () { return call({ type: 'transpile', code: String(code || ''), jsx: true }); });
  }
  window.FERunner.ts = {
    check: check, transpile: transpile, transpileJsx: transpileJsx, mapLine: mapLine, prelude: PRELUDE, load: ensureWorker,
    checkProject: checkProject, typeResults: typeResults, mergeTypeResults: mergeTypeResults, formatDiags: formatDiags,
    typesVersions: function () { return window.FE_TS_TYPES ? window.FE_TS_TYPES.versions : null; }
  };
})();
