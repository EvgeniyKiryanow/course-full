/*
 * Середовище виконання Vue 3 для тренажера.
 *  - Код учня — справжні однофайлові компоненти (.vue): <script setup> (зокрема lang="ts"), <template>, <style scoped>.
 *    Їх компілює офіційний @vue/compiler-sfc прямо в браузері (vendor/vue/compiler-sfc.js), Vue 3 вбудовується
 *    в sandbox-сторінку (vendor/vue/vue-bundle.js).
 *  - Кілька файлів в одному редакторі розділяються рядком-маркером <!-- file: Назва.vue --> або
 *    <!-- file: useЩось.js --> (.ts) для composables і сторів; import Назва from './Назва.vue' та
 *    import { useЩось } from './useЩось.js' працюють. Код до першого маркера (або весь файл без маркерів) — App.vue.
 *  - Кожен компонент доступний у тестах як глобальна змінна з назвою файлу (App, TodoItem…);
 *    оголошення зі звичайного <script> (не setup) — теж глобальні (допоміжні функції, стори).
 *  - У тестах: mount(Component, props?, slots?) → { container, vm, setProps(p), unmount() },
 *    nextTick(), settle(ms) — таймери + оновлення DOM, typeInto(input, value) — введення для v-model.
 *  - Перегляд: компонент App монтується в #root.
 */
(function () {
  'use strict';

  var BASE = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/js\/vue-runtime\.js(\?.*)?$/, '') : '';
  })();

  function loadScript(rel, globalName, hint) {
    return new Promise(function (resolve, reject) {
      if (window[globalName]) return resolve(window[globalName]);
      var s = document.createElement('script');
      s.src = BASE + rel;
      s.onload = function () { resolve(window[globalName]); };
      s.onerror = function () { reject(new Error('Не вдалося завантажити ' + rel + '. ' + hint)); };
      document.head.appendChild(s);
    });
  }
  var loading = null;
  function loadVue() {
    if (!loading) {
      var hint = 'Запустіть: node tools/build-vue-vendor.js';
      loading = Promise.all([
        loadScript('vendor/vue/vue-bundle.js', 'FE_VUE', hint),
        loadScript('vendor/vue/compiler-sfc.js', 'VueCompilerSFC', hint)
      ]).catch(function (e) { loading = null; throw e; });
    }
    return loading;
  }

  // ---------------- Компіляція .vue
  var MARKER = /^[ \t]*<!--\s*file:\s*([A-Za-z_$][\w$]*)\.(vue|js|ts)\s*-->[ \t]*$/gm;

  function splitFiles(source) {
    var files = [];
    var m;
    var last = 0;
    var lastName = 'App';
    var lastKind = 'vue';
    var lastLine = 1;
    MARKER.lastIndex = 0;
    var lineAt = function (idx) { return source.slice(0, idx).split('\n').length; };
    while ((m = MARKER.exec(source))) {
      var chunk = source.slice(last, m.index);
      if (chunk.replace(/<!--[\s\S]*?-->/g, '').trim()) files.push({ name: lastName, kind: lastKind, src: chunk, line: lastLine });
      lastName = m[1];
      lastKind = m[2];
      last = m.index + m[0].length;
      lastLine = lineAt(last);
    }
    var tail = source.slice(last);
    if (tail.trim() || !files.length) files.push({ name: lastName, kind: lastKind, src: tail, line: lastLine });
    return files;
  }

  function hashId(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return ('0000000' + h.toString(16)).slice(-8);
  }

  function compileError(message, file, relLine) {
    var e = new SyntaxError(message);
    e.line = relLine ? file.line + relLine - 1 : file.line;
    return e;
  }

  var IMPORT_RE = /^[ \t]*import\s+([^;]*?)\s+from\s+(['"])([^'"]+)\2[ \t]*;?/gm;

  function namedList(what) {
    var named = (what.match(/\{([\s\S]*)\}/) || [])[1] || '';
    return named.split(',').map(function (x) { return x.trim(); }).filter(Boolean).filter(function (x) { return !/^type\s/.test(x); });
  }

  // Переписує import/export модуля у звичайний скрипт. Кожен файл потім загортається у власну функцію
  // (wrapFile), а назовні — глобальними змінними — виходять лише компонент та іменовані експорти.
  function rewriteModule(code, file, deps, exportsOut) {
    code = code.replace(/^[ \t]*import\s+type\s[^;\n]*;?/gm, '');
    var em;
    var declRe = /^[ \t]*export\s+(?:async\s+)?(?:function\*?|class|const|let|var)\s+([A-Za-z_$][\w$]*)/gm;
    while ((em = declRe.exec(code))) exportsOut.push([em[1], em[1]]);
    var listRe = /^[ \t]*export\s*\{([^}]*)\}/gm;
    while ((em = listRe.exec(code))) {
      em[1].split(',').map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (x) {
        var p = x.split(/\s+as\s+/);
        exportsOut.push([p[1] || p[0], p[0]]);
      });
    }
    code = code.replace(IMPORT_RE, function (all, what, q, from) {
      what = what.trim();
      if (from === 'vue') {
        if (/^\*\s+as\s+/.test(what)) return 'var ' + what.replace(/^\*\s+as\s+/, '') + ' = Vue;';
        var parts = namedList(what).map(function (x) { return x.replace(/\s+as\s+/, ': '); });
        return parts.length ? 'var { ' + parts.join(', ') + ' } = Vue;' : '';
      }
      var vue = from.match(/^\.\/([A-Za-z_$][\w$]*)\.vue$/);
      if (vue) {
        deps.push(vue[1]);
        return what === vue[1] ? '' : 'var ' + what + ' = ' + vue[1] + ';';
      }
      var mod = from.match(/^\.\/([A-Za-z_$][\w$]*)(?:\.(?:js|ts))?$/);
      if (mod) {
        if (!/^\{/.test(what)) throw compileError('Імпортуйте з ./' + mod[1] + ' іменовані експорти: import { … } from \'./' + mod[1] + '.js\'', file, 0);
        deps.push(mod[1]);
        return namedList(what).map(function (x) {
          var p = x.split(/\s+as\s+/);
          return p[1] && p[1] !== p[0] ? 'var ' + p[1] + ' = ' + p[0] + ';' : '';
        }).join(' ');
      }
      throw compileError('Імпорт з «' + from + '» не підтримується в тренажері: доступні \'vue\', ./Компонент.vue і ./модуль.js', file, 0);
    });
    if (file.kind !== 'vue' && /^[ \t]*export\s+default\s/m.test(code)) {
      throw compileError('У ' + file.name + '.' + file.kind + ' використовуйте іменовані експорти (export function …, export const …)', file, 0);
    }
    code = code.replace(/^[ \t]*export\s*\{[^}]*\}\s*;?/gm, '');
    code = code.replace(/^([ \t]*)export\s+(?=(?:async\s+)?(?:function|class|const|let|var|interface|type|enum)\b)/gm, '$1');
    if (file.kind === 'vue') {
      code = code.replace(/^[ \t]*export\s+default\s+/m, 'const __sfc_' + file.name + '__ = ');
      if (code.indexOf('const __sfc_' + file.name + '__ =') < 0) code += '\nconst __sfc_' + file.name + '__ = {};';
    }
    return code;
  }

  // Власна область видимості для файлу (у кожного скомпільованого .vue свої _hoisted_1, _sfc_main…),
  // назовні — лише компонент та експорти.
  function wrapFile(name, code, exportsList, componentExpr) {
    var mod = '__mod_' + name + '__';
    var pairs = exportsList.map(function (e) { return JSON.stringify(e[0]) + ': ' + e[1]; });
    if (componentExpr) pairs.unshift(JSON.stringify(name) + ': ' + componentExpr);
    var out = 'var ' + mod + ' = (function () {\n' + code + '\nreturn { ' + pairs.join(', ') + ' };\n})();';
    if (componentExpr) out += '\nvar ' + name + ' = ' + mod + '[' + JSON.stringify(name) + '];';
    exportsList.forEach(function (e) { out += '\nvar ' + e[0] + ' = ' + mod + '[' + JSON.stringify(e[0]) + '];'; });
    return out;
  }

  function compileModule(file) {
    var deps = [];
    var exportsList = [];
    var code = rewriteModule(file.src, file, deps, exportsList);
    return { name: file.name, code: wrapFile(file.name, code, exportsList, null), css: '', deps: deps, ts: file.kind === 'ts' };
  }

  function compileOne(C, file) {
    if (file.kind !== 'vue') return compileModule(file);
    var parsed = C.parse(file.src, { filename: file.name + '.vue', sourceMap: false });
    if (parsed.errors.length) {
      var pe = parsed.errors[0];
      throw compileError(pe.message, file, pe.loc && pe.loc.start ? pe.loc.start.line : 0);
    }
    var d = parsed.descriptor;
    var id = hashId(file.name);
    var scoped = d.styles.some(function (s) { return s.scoped; });
    var lang = (d.scriptSetup && d.scriptSetup.lang) || (d.script && d.script.lang) || 'js';
    // Для перевірки типів: вміст <script> і <script setup> з номером рядка у файлі.
    file.lang = lang;
    file.scripts = [d.script, d.scriptSetup].filter(Boolean).map(function (b) { return { content: b.content, line: b.loc.start.line }; });
    var code = '';
    var deps = [];
    try {
      if (d.script || d.scriptSetup) {
        var sc = C.compileScript(d, { id: id, inlineTemplate: true, isProd: false });
        code = sc.content;
      }
      if (!d.scriptSetup && d.template) {
        var tpl = C.compileTemplate({
          source: d.template.content, filename: file.name + '.vue', id: id, scoped: scoped,
          compilerOptions: { scopeId: scoped ? 'data-v-' + id : undefined }
        });
        if (tpl.errors.length) {
          var te = tpl.errors[0];
          var tline = typeof te === 'object' && te.loc ? d.template.loc.start.line + te.loc.start.line - 1 : 0;
          throw compileError(typeof te === 'string' ? te : te.message, file, tline);
        }
        code += '\n' + tpl.code.replace(/^export function render\(/m, 'function __render_' + file.name + '__(');
      }
    } catch (e) {
      if (e.line !== undefined) throw e;
      // Помилки шаблону мають loc.start (рядок у файлі), помилки Babel — loc.line (рядок усередині блоку <script>).
      var block = d.scriptSetup || d.script;
      var line = !e.loc ? 0 : e.loc.start ? e.loc.start.line : block ? block.loc.start.line + e.loc.line - 1 : e.loc.line;
      throw compileError(String(e.message).replace(/^\[vue\/compiler-sfc\]\s*/, '').split('\n')[0].replace(/\s*\(\d+:\d+\)\s*$/, ''), file, line);
    }
    var exportsList = [];
    code = rewriteModule(code, file, deps, exportsList);
    var sfc = '__sfc_' + file.name + '__';
    if (!d.scriptSetup && d.template) code += '\n' + sfc + '.render = __render_' + file.name + '__;';
    if (scoped) code += '\n' + sfc + '.__scopeId = "data-v-' + id + '";';
    code += '\n' + sfc + '.__name = ' + sfc + '.__name || ' + JSON.stringify(file.name) + ';';
    // Компонент може посилатися на себе за іменем файлу (рекурсивні дерева).
    code += '\nvar ' + file.name + ' = ' + sfc + ';';
    code = wrapFile(file.name, code, exportsList, sfc);
    var css = d.styles.map(function (s) {
      var r = C.compileStyle({ source: s.content, filename: file.name + '.vue', id: 'data-v-' + id, scoped: !!s.scoped, isProd: false });
      if (r.errors.length) throw compileError('CSS: ' + r.errors[0].message, file, s.loc.start.line);
      return r.code;
    }).join('\n');
    return { name: file.name, code: code, css: css, deps: deps, ts: lang === 'ts' };
  }

  // source (вміст редактора) → { js, css, tsParts } або кидає SyntaxError з .line
  function compileVue(C, source) {
    var files = splitFiles(String(source || ''));
    var seen = {};
    files.forEach(function (f) {
      if (seen[f.name]) throw compileError('Файл ' + f.name + ' оголошено двічі', f, 0);
      seen[f.name] = true;
    });
    var compiled = files.map(function (f) { return compileOne(C, f); });
    var byName = {};
    compiled.forEach(function (c) { byName[c.name] = c; });
    // Залежності — раніше за тих, хто їх імпортує.
    var order = [];
    var state = {};
    function visit(c) {
      if (state[c.name] === 2) return;
      if (state[c.name] === 1) return; // цикл: Vue дозволяє рекурсивні компоненти, порядок не критичний
      state[c.name] = 1;
      c.deps.forEach(function (n) {
        if (!byName[n]) throw compileError('Не знайдено файл ' + n + ' — додайте його з маркером <!-- file: ' + n + '.vue --> або <!-- file: ' + n + '.js -->', files[0], 0);
        visit(byName[n]);
      });
      state[c.name] = 2;
      order.push(c);
    }
    compiled.forEach(visit);
    return { parts: order, files: files, css: compiled.map(function (c) { return c.css; }).filter(Boolean).join('\n') };
  }

  // ---------------- Перевірка типів (lang="ts" і .ts-модулі) справжнім tsc з типами Vue 3.
  // Скрипт кожного .vue кладемо у віртуальний /Назва.setup.ts на ті самі рядки (решта — порожні рядки),
  // тож номер рядка помилки збігається з редактором. Шаблони не перевіряються (у проєктах це робить vue-tsc).
  var VUE_TS_TITLE = 'Типи: <script lang="ts"> і .ts-модулі компілюються без помилок (tsc --strict)';
  var SHIM = '/shims-vue.d.ts';
  var SHIM_TEXT = "declare module '*.vue' {\n  import type { DefineComponent } from 'vue';\n  const component: DefineComponent<{}, {}, any>;\n  export default component;\n}\n";
  var MACROS = '/node_modules/@vue/runtime-core/dist/runtime-core.d.ts'; // declare global { defineProps, defineEmits, … }
  function isTypedFile(f) { return f.kind === 'ts' || (f.kind === 'vue' && f.lang === 'ts'); }
  function virtualPath(f) { return f.kind === 'vue' ? '/' + f.name + '.setup.ts' : '/' + f.name + '.' + f.kind; }
  function virtualText(f) {
    if (f.kind !== 'vue') return f.src;
    var lines = f.src.split('\n').map(function () { return ''; });
    (f.scripts || []).forEach(function (s) {
      s.content.split('\n').forEach(function (l, k) { lines[s.line - 1 + k] = l; });
    });
    return lines.join('\n');
  }
  function typecheckVue(item, files) {
    var typed = files.filter(isTypedFile);
    if (!typed.length || !window.FERunner.ts || !window.FERunner.ts.checkProject) return Promise.resolve(null);
    var vfiles = {};
    vfiles[SHIM] = SHIM_TEXT;
    var roots = [SHIM, MACROS];
    files.forEach(function (f) {
      if (f.kind === 'vue' && f.lang !== 'ts') return;
      var p = virtualPath(f);
      vfiles[p] = virtualText(f);
      roots.push(p);
    });
    var main = typed.filter(function (f) { return f.name === 'App'; })[0] || typed[0];
    return window.FERunner.ts.checkProject({
      files: vfiles, roots: roots, report: typed.map(virtualPath), main: virtualPath(main), typeTests: item.typeTests
    }).then(function (chk) {
      var errors = [];
      typed.forEach(function (f) {
        (chk.files[virtualPath(f)] || []).forEach(function (d) {
          if (d.category !== 1) return;
          errors.push(Object.assign({}, d, { line: d.line ? f.line + d.line - 1 : null }));
        });
      });
      return { errors: errors, tests: chk.tests, ms: chk.ms };
    });
  }
  function hasTsSource(source) {
    return /<script\b[^>]*\blang\s*=\s*["']ts["']/.test(source) || /<!--\s*file:\s*[A-Za-z_$][\w$]*\.ts\s*-->/.test(source);
  }

  function buildJs(result) {
    // TS-частини транспілюємо (типи прибираються), JS лишаємо як є.
    var ts = window.FERunner && window.FERunner.ts;
    return Promise.all(result.parts.map(function (p) {
      return p.ts ? ts.transpile(p.code) : Promise.resolve(p.code);
    })).then(function (codes) { return codes.join('\n\n'); });
  }

  var TEST_HELPERS = [
    'window.nextTick = Vue.nextTick;',
    'window.mount = function (Component, props, slots) {',
    '  var host = document.createElement("div");',
    '  host.className = "fe-mount";',
    '  document.body.appendChild(host);',
    '  var state = Vue.reactive(Object.assign({}, props || {}));',
    '  var inst = Vue.shallowRef(null);',
    '  var slotFns = null;',
    '  if (slots) { slotFns = {}; Object.keys(slots).forEach(function (k) { var v = slots[k]; slotFns[k] = typeof v === "function" ? v : function () { return v; }; }); }',
    '  var app = Vue.createApp({ render: function () { return Vue.h(Component, Object.assign({}, state, { ref: inst }), slotFns); } });',
    '  app.mount(host);',
    '  return {',
    '    container: host, app: app,',
    '    get vm() { return inst.value; },',
    '    setProps: function (p) { Object.assign(state, p); return Vue.nextTick(); },',
    '    unmount: function () { app.unmount(); host.remove(); }',
    '  };',
    '};',
    'window.typeInto = function (el, value) {',
    '  var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;',
    '  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);',
    '  el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? "change" : "input", { bubbles: true }));',
    '  if (!(el instanceof HTMLSelectElement)) el.dispatchEvent(new Event("change", { bubbles: true }));',
    '  return Vue.nextTick();',
    '};',
    'window.settle = function (ms) { return new Promise(function (r) { setTimeout(r, ms || 0); }).then(function () { return Vue.nextTick(); }); };'
  ].join('\n');

  // Dev-збірка Vue пише в console.info «You are running a development build…» — не засмічуємо консоль учня.
  function quiet(src) { return 'var __feInfo = console.info; console.info = function () {};\n' + src + '\nconsole.info = __feInfo;'; }

  var AUTO_MOUNT = '\n;(function () { var el = document.getElementById("root"); if (el && typeof App !== "undefined") Vue.createApp(App).mount(el); })();\n';

  function syntaxResult(item, err) {
    return {
      status: 'failed',
      userError: { name: 'SyntaxError', message: err.message, line: err.line || null, syntax: true, stack: '' },
      harnessError: null,
      tests: (item.tests || []).map(function (t) {
        return { name: t.name, code: t.code, pass: false, ms: 0, error: { name: 'Skipped', message: 'Не виконано: помилка компіляції компонента', stack: '', skipped: true } };
      }),
      logs: [],
      durationMs: 0
    };
  }

  function prepare(source) {
    return loadVue().then(function (libs) {
      var compiled;
      try { compiled = compileVue(libs[1], source); } catch (e) { return { error: e, bundle: libs[0] }; }
      return buildJs(compiled).then(function (js) { return { js: js, css: compiled.css, bundle: libs[0], files: compiled.files }; });
    });
  }

  function runVue(item, files, hooks) {
    return prepare(files.js).then(function (p) {
      if (p.error) return syntaxResult(item, p.error);
      return Promise.all([
        window.FERunner.runDom({
          html: files.html, css: (files.css || '') + '\n' + p.css, js: p.js,
          tests: item.tests, testTimeout: item.testTimeout,
          prelude: quiet(p.bundle.src) + '\n' + TEST_HELPERS
        }, hooks),
        typecheckVue(item, p.files)
      ]).then(function (both) {
        var res = both[0];
        var chk = both[1];
        // Рядки скомпільованого коду не збігаються з .vue — не показуємо хибний номер.
        if (res.userError && !res.userError.syntax) res.userError.line = null;
        if (chk) {
          res.typeErrors = chk.errors;
          window.FERunner.ts.mergeTypeResults(res, window.FERunner.ts.typeResults(VUE_TS_TITLE, chk.errors, item.typeTests, chk.tests, chk.ms));
        }
        return res;
      });
    }).catch(function (err) {
      return { status: 'error', userError: null, harnessError: { name: 'Error', message: err.message }, tests: [], logs: [], durationMs: 0 };
    });
  }

  function previewDocAsync(opts, previewId) {
    return prepare(opts.js).then(function (p) {
      var js = p.error
        ? 'throw new SyntaxError(' + JSON.stringify((p.error.line ? 'Рядок ' + p.error.line + ': ' : '') + p.error.message) + ');'
        : p.js + AUTO_MOUNT;
      return window.FERunner.previewDoc({ html: opts.html, css: (opts.css || '') + '\n' + (p.css || ''), js: js, prelude: quiet(p.bundle.src) }, previewId);
    });
  }

  window.FERunner.runtimes.vue = {
    label: 'Vue 3 (.vue-компоненти, компіляція @vue/compiler-sfc у браузері)',
    files: ['html', 'css', 'js'],
    fileLabel: 'App.vue',
    mode: 'htmlmixed',
    run: runVue,
    previewDocAsync: previewDocAsync,
    // Завдання з lang="ts" або .ts-модулями: заздалегідь відома назва тесту типів.
    typed: function (item) {
      var src = [item.js, item.solution && item.solution.js].join('\n');
      return hasTsSource(src) ? { title: VUE_TS_TITLE } : null;
    }
  };
  window.FERunner.vue = { load: loadVue, compile: compileVue, split: splitFiles };
})();
