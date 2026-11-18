/* Перевірка банку завдань: схема + прогін еталонних рішень та стартового коду. */
(function () {
  'use strict';

  var ID_RE = /^[a-z0-9][a-z0-9-]*$/;
  var EDITABLE = ['html', 'css', 'js'];

  function isStr(v) { return typeof v === 'string' && v.trim().length > 0; }
  function isStrArr(v, min) { return Array.isArray(v) && v.length >= (min || 0) && v.every(isStr); }

  function fenceCheck(text) {
    if (typeof text !== 'string') return true;
    var count = (text.match(/^\s*```/gm) || []).length;
    return count % 2 === 0;
  }

  function choiceErrors(kind, options, answer, optName, ansName, min) {
    var e = [];
    if (!Array.isArray(options) || options.length < min || options.length > 6) {
      e.push(kind + ': ' + optName + ' — від ' + min + ' до 6 варіантів');
      return e;
    }
    if (!options.every(function (o) { return typeof o === 'string' && o.trim().length > 0; })) e.push(kind + ': усі ' + optName + ' мають бути непорожніми рядками');
    var uniq = new Set(options.map(function (o) { return String(o).trim(); }));
    if (uniq.size !== options.length) e.push(kind + ': варіанти в ' + optName + ' повторюються');
    var answers = Array.isArray(answer) ? answer : [answer];
    if (!answers.length || !answers.every(function (a) { return Number.isInteger(a) && a >= 0 && a < options.length; })) {
      e.push(kind + ': ' + ansName + ' має бути індексом (або масивом індексів) у межах ' + optName);
    }
    if (Array.isArray(answer) && new Set(answer).size !== answer.length) e.push(kind + ': індекси в ' + ansName + ' повторюються');
    if (Array.isArray(answer) && answer.length === options.length) e.push(kind + ': усі варіанти правильні — так не можна');
    return e;
  }

  // Чи правильний варіант помітно найдовший (підказка «за довжиною»).
  function longestIsCorrect(options, answer) {
    if (!Array.isArray(options) || Array.isArray(answer) || !Number.isInteger(answer)) return null;
    var lens = options.map(function (o) { return String(o).length; });
    var max = Math.max.apply(null, lens);
    var second = lens.slice().sort(function (a, b) { return b - a; })[1] || 0;
    return lens[answer] === max && max > second * 1.25;
  }

  function schemaErrors(item) {
    var e = [];
    if (!ID_RE.test(item.id || '')) e.push('id має бути kebab-case: "' + item.id + '"');
    if (!FE.TYPES[item.type]) e.push('невідомий type "' + item.type + '"');
    if (!(item.level >= 1 && item.level <= 4 && Math.floor(item.level) === item.level)) e.push('level має бути 1..4');
    if (!isStr(item.title)) e.push('немає title');
    if (item.tags !== undefined && !isStrArr(item.tags)) e.push('tags має бути масивом рядків');
    if (item.interview !== undefined && typeof item.interview !== 'boolean') e.push('interview має бути boolean');

    if (!isStr(item.group)) e.push('немає group (id кроку теми)');
    if (item.type === 'quiz' || item.type === 'theory') {
      var opts = item.type === 'quiz' ? item.options : item.choices;
      if (!Array.isArray(item.why) || !Array.isArray(opts) || item.why.length !== opts.length) {
        e.push(item.type + ': why має бути масивом коротких пояснень — по одному на кожен варіант');
      } else if (!item.why.every(function (w) { return isStr(w) && w.length <= 400; })) {
        e.push(item.type + ': кожне why — непорожнє речення до 400 символів');
      }
    }
    if ((item.type === 'code' || item.type === 'dom') && isStr(item.description) && !/\*\*Завдання/.test(item.description)) {
      e.push(item.type + ': description має йти за шаблоном (почати з **Завдання.**) — див. CONTENT_GUIDE');
    }
    if ((item.type === 'code' || item.type === 'dom') && isStr(item.description) && !/\*\*Де трапляється:\*\*/.test(item.description)) {
      e.push(item.type + ': в умові немає «**Де трапляється:**» — реальний сценарій або «класика співбесід» (CONTENT_GUIDE, стандарт v2)');
    }

    var mdFields = ['description', 'question', 'answer', 'explanation', 'hint'];
    mdFields.forEach(function (f) {
      if (!fenceCheck(item[f])) e.push('непарна кількість ``` у полі ' + f);
    });
    (item.hints || []).forEach(function (h, i) { if (!fenceCheck(h)) e.push('непарна кількість ``` у hints[' + i + ']'); });

    if (item.type === 'code') {
      if (!isStr(item.description)) e.push('code: немає description');
      if (typeof item.starter !== 'string') e.push('code: немає starter');
      if (!isStr(item.solution)) e.push('code: немає solution');
      var nTests = (Array.isArray(item.tests) ? item.tests.length : 0) + (item.runtime === 'ts' && Array.isArray(item.typeTests) ? item.typeTests.length : 0);
      if (!Array.isArray(item.tests) || nTests < 3) e.push('code: потрібно щонайменше 3 тести' + (item.runtime === 'ts' ? ' (tests + typeTests)' : ''));
      if (item.runtime !== undefined && item.runtime !== 'ts') e.push('code: невідомий runtime "' + item.runtime + '"');
      if (item.typeTests !== undefined) {
        if (item.runtime !== 'ts') e.push('typeTests дозволені лише для runtime: "ts"');
        else if (!Array.isArray(item.typeTests) || !item.typeTests.every(function (t) { return t && isStr(t.name) && isStr(t.code); })) e.push('typeTests: масив {name, code}');
      }
      if (!isStrArr(item.hints, 2)) e.push('code: потрібно щонайменше 2 підказки (hints)');
      if (!isStr(item.explanation)) e.push('code: немає explanation');
    }
    if (item.type === 'dom') {
      if (item.runtime !== undefined && item.runtime !== 'react' && item.runtime !== 'vue') e.push('dom: невідомий runtime "' + item.runtime + '"');
      if (item.lang !== undefined && !(item.lang === 'tsx' && item.runtime === 'react')) e.push('dom: lang: "tsx" дозволено лише для runtime: "react"');
      if (item.typeTests !== undefined) {
        var vueTs = item.runtime === 'vue' && /lang\s*=\s*["']ts["']/.test(String(item.solution && item.solution.js || ''));
        if (!(item.lang === 'tsx' || vueTs)) e.push('typeTests у dom дозволені для React з lang: "tsx" і Vue з <script lang="ts">');
        else if (!Array.isArray(item.typeTests) || !item.typeTests.every(function (t) { return t && isStr(t.name) && isStr(t.code); })) e.push('typeTests: масив {name, code}');
      }
      if (!isStr(item.description)) e.push('dom: немає description');
      ['html', 'css', 'js'].forEach(function (f) {
        if (item[f] !== undefined && typeof item[f] !== 'string') e.push('dom: ' + f + ' має бути рядком');
      });
      if (!Array.isArray(item.editable) || !item.editable.length || !item.editable.every(function (x) { return EDITABLE.indexOf(x) !== -1; })) {
        e.push('dom: editable має бути непорожнім масивом з ["html","css","js"]');
      }
      if (!item.solution || typeof item.solution !== 'object') e.push('dom: solution має бути об\'єктом {css?, js?, html?}');
      else {
        var keys = Object.keys(item.solution);
        if (!keys.length) e.push('dom: solution порожній');
        keys.forEach(function (k) {
          if ((item.editable || []).indexOf(k) === -1) e.push('dom: solution.' + k + ' не входить в editable');
          if (typeof item.solution[k] !== 'string') e.push('dom: solution.' + k + ' має бути рядком');
        });
      }
      if (!Array.isArray(item.tests) || item.tests.length < 2) e.push('dom: потрібно щонайменше 2 тести');
      if (!isStrArr(item.hints, 2)) e.push('dom: потрібно щонайменше 2 підказки (hints)');
      if (!isStr(item.explanation)) e.push('dom: немає explanation');
    }
    if (item.type === 'code' || item.type === 'dom') {
      (item.tests || []).forEach(function (t, i) {
        if (!t || !isStr(t.name) || !isStr(t.code)) e.push('tests[' + i + '] має бути рядком або {name, code}');
      });
    }
    if (item.type === 'quiz') {
      if (!isStr(item.question)) e.push('quiz: немає question');
      if (!Array.isArray(item.options) || item.options.length < 2 || item.options.length > 6) e.push('quiz: options — від 2 до 6 варіантів');
      else {
        if (!item.options.every(function (o) { return typeof o === 'string' && o.length > 0; })) e.push('quiz: усі options мають бути непорожніми рядками');
        var uniq = new Set(item.options.map(function (o) { return String(o).trim(); }));
        if (uniq.size !== item.options.length) e.push('quiz: варіанти відповідей повторюються');
        var answers = Array.isArray(item.answer) ? item.answer : [item.answer];
        if (!answers.length || !answers.every(function (a) { return Number.isInteger(a) && a >= 0 && a < item.options.length; })) {
          e.push('quiz: answer має бути індексом (або масивом індексів) у межах options');
        }
        if (Array.isArray(item.answer) && new Set(item.answer).size !== item.answer.length) e.push('quiz: індекси в answer повторюються');
      }
      if (!isStr(item.explanation)) e.push('quiz: немає explanation');
      if (!isStr(item.hint)) e.push('quiz: немає hint');
    }
    if (item.type === 'theory') {
      if (!isStr(item.question)) e.push('theory: немає question');
      if (!isStr(item.answer) || item.answer.length < 150) e.push('theory: answer відсутній або занадто короткий (< 150 символів)');
      if (!isStrArr(item.keyPoints, 3)) e.push('theory: потрібно щонайменше 3 keyPoints');
      if (item.followUps !== undefined && !isStrArr(item.followUps)) e.push('theory: followUps має бути масивом рядків');
      if (item.hint !== undefined && !isStr(item.hint)) e.push('theory: hint має бути рядком');
      e = e.concat(choiceErrors('theory', item.choices, item.correct, 'choices', 'correct', 3));
    }
    return e;
  }

  function filesFor(item, which) {
    if (item.type === 'code') return { js: which === 'solution' ? item.solution : item.starter };
    var sol = which === 'solution' ? item.solution || {} : {};
    return {
      html: sol.html !== undefined ? sol.html : item.html || '',
      css: sol.css !== undefined ? sol.css : item.css || '',
      js: sol.js !== undefined ? sol.js : item.js || ''
    };
  }

  function describeFailures(result) {
    var out = [];
    if (result.userError) out.push('помилка в коді: ' + result.userError.name + ': ' + result.userError.message + (result.userError.line ? ' (рядок ' + result.userError.line + ')' : ''));
    if (result.harnessError) out.push('harness: ' + result.harnessError.message);
    result.tests.forEach(function (t) {
      if (t.pass === false && !(t.error && t.error.skipped)) {
        out.push('тест "' + t.name + '": ' + (t.error ? t.error.name + ': ' + t.error.message.split('\n').join(' | ') : 'fail'));
      }
    });
    return out;
  }

  async function checkExecutable(item) {
    var errors = [];
    var warnings = [];
    var sol = await FERunner.run(item, filesFor(item, 'solution'));
    if (sol.status !== 'passed') {
      errors.push('ЕТАЛОННЕ РІШЕННЯ НЕ ПРОХОДИТЬ ТЕСТИ: ' + describeFailures(sol).join(' ;; '));
    }
    if (sol.durationMs > 4000) warnings.push('тести рішення виконуються повільно: ' + sol.durationMs + 'мс');
    var st = await FERunner.run(item, filesFor(item, 'starter'));
    if (st.status === 'passed') errors.push('стартовий код уже проходить усі тести — тести нічого не перевіряють');
    if (st.status === 'timeout') warnings.push('стартовий код спричиняє таймаут — краще, щоб він швидко падав');
    var starterPassed = st.tests.filter(function (t) { return t.pass; }).length;
    return { errors: errors, warnings: warnings, solutionMs: sol.durationMs, starterPassed: starterPassed };
  }

  async function pool(list, limit, fn) {
    var i = 0;
    var workers = [];
    for (var w = 0; w < limit; w++) {
      workers.push((async function () {
        while (i < list.length) {
          var idx = i++;
          await fn(list[idx], idx);
        }
      })());
    }
    await Promise.all(workers);
  }

  window.validateBank = async function (opts) {
    opts = opts || {};
    var only = opts.topics && opts.topics.length ? opts.topics : null;
    var report = { ok: true, loadErrors: FE.loadErrors.slice(), missingFiles: (FE.missingFiles || []).slice(), topics: {}, items: [], totals: { items: 0, errors: 0, warnings: 0 } };
    if (report.loadErrors.length) report.ok = false;

    var topicIds = FE.topicOrder.filter(function (id) { return !only || only.indexOf(id) !== -1; });
    topicIds.forEach(function (id) {
      var t = FE.topics[id];
      var counts = { total: t.items.length, code: 0, dom: 0, quiz: 0, theory: 0, l1: 0, l2: 0, l3: 0, l4: 0, interview: 0 };
      t.items.forEach(function (it) {
        counts[it.type] = (counts[it.type] || 0) + 1;
        counts['l' + it.level] = (counts['l' + it.level] || 0) + 1;
        if (it.interview) counts.interview++;
      });
      report.topics[id] = { title: t.title, intro: !!t.intro, counts: counts };
    });

    var items = FE.items.filter(function (it) { return topicIds.indexOf(it.topic) !== -1; });
    var records = items.map(function (it) {
      return { id: it.id, topic: it.topic, type: it.type, errors: schemaErrors(it), warnings: [] };
    });

    var codeItems = [];
    var domItems = [];
    items.forEach(function (it, idx) {
      if (records[idx].errors.length) return;
      if (it.type === 'code') codeItems.push(idx);
      if (it.type === 'dom') domItems.push(idx);
    });

    var progress = 0;
    var totalExec = codeItems.length + domItems.length;
    async function exec(idx) {
      var r = await checkExecutable(items[idx]);
      records[idx].errors = records[idx].errors.concat(r.errors);
      records[idx].warnings = records[idx].warnings.concat(r.warnings);
      records[idx].solutionMs = r.solutionMs;
      progress++;
      if (opts.onProgress) opts.onProgress(progress, totalExec);
    }
    await pool(codeItems, 4, exec);
    await pool(domItems, 1, exec); // послідовно: фокус і rAF у паралельних iframe нестабільні

    records.forEach(function (r) {
      report.totals.items++;
      report.totals.errors += r.errors.length;
      report.totals.warnings += r.warnings.length;
      if (r.errors.length) report.ok = false;
      if (r.errors.length || r.warnings.length) report.items.push(r);
    });
    topicIds.forEach(function (id) {
      if (!FE.topics[id].intro) report.items.push({ id: '(topic) ' + id, topic: id, errors: [], warnings: ['у теми немає intro (шпаргалки)'] });
      // Кроки: є, мають уроки, завдання йдуть суцільними блоками в порядку кроків.
      var t = FE.topics[id];
      var gErr = [];
      var groups = t.groups || [];
      if (t.items.length && groups.length < 2) gErr.push('тема має бути розбита на кроки: groups — щонайменше 2');
      var gIds = groups.map(function (g) { return g.id; });
      groups.forEach(function (g) {
        if (!isStr(g.id) || !isStr(g.title)) gErr.push('крок без id або title');
        var n = t.items.filter(function (it) { return it.group === g.id; }).length;
        if (n < 2) gErr.push('крок "' + g.id + '": потрібно щонайменше 2 завдання (зараз ' + n + ')');
      });
      var lastIdx = -1;
      var seen = {};
      t.items.forEach(function (it) {
        var gi = gIds.indexOf(it.group);
        if (gi === -1) { if (groups.length) gErr.push(it.id + ': group "' + it.group + '" не оголошено в groups'); return; }
        if (gi < lastIdx) gErr.push(it.id + ': порушено порядок — завдання кроку "' + it.group + '" має стояти разом із ним, у порядку groups');
        if (gi !== lastIdx && seen[gi]) gErr.push(it.id + ': завдання кроку "' + it.group + '" розкидані по файлу');
        seen[gi] = true;
        lastIdx = gi;
      });
      if (gErr.length) {
        report.items.push({ id: '(topic) ' + id, topic: id, errors: gErr, warnings: [] });
        report.totals.errors += gErr.length;
        report.ok = false;
      }
      // Захист від вгадування: правильна відповідь не має бути систематично найдовшою.
      var biased = [];
      var total = 0;
      FE.topics[id].items.forEach(function (it) {
        var r = it.type === 'quiz' ? longestIsCorrect(it.options, it.answer) : it.type === 'theory' ? longestIsCorrect(it.choices, it.correct) : null;
        if (r === null) return;
        total++;
        if (r) biased.push(it.id);
      });
      if (total >= 5 && biased.length / total > 0.3) {
        report.items.push({ id: '(topic) ' + id, topic: id, errors: [], warnings: ['правильний варіант помітно найдовший у ' + biased.length + ' з ' + total + ' питань — відповідь можна вгадати за довжиною: ' + biased.join(', ')] });
        report.totals.warnings++;
      }
      // «Часто питають» має виділяти справді часті питання, а не половину модуля.
      var starred = t.items.filter(function (it) { return it.interview; }).length;
      if (t.items.length >= 8 && starred / t.items.length > 0.45) {
        report.items.push({ id: '(topic) ' + id, topic: id, errors: [], warnings: ['interview: true у ' + starred + ' з ' + t.items.length + ' завдань — позначайте лише справді часті питання (≈20–35% модуля)'] });
        report.totals.warnings++;
      }
    });
    return report;
  };
})();
