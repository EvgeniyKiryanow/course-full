/*
 * FE Trainer — інтерфейс.
 * Маршрути (hash):
 *   #/                  дашборд
 *   #/t/<topic>[/intro] тема (список завдань / шпаргалка)
 *   #/i/<item>          завдання
 *   #/all               усі завдання з фільтрами
 *   #/review            повторення
 *   #/interview         налаштування співбесіди; #/interview/run — сесія; #/interview/result/<n>
 */
(function () {
  'use strict';

  var app = document.getElementById('app');
  var esc = MD.escape;
  var ui = {
    cleanup: [],
    actions: {},
    nav: null,
    filters: {},
    searchIndex: null,
    view: null
  };

  // =====================================================================
  //  Utils
  // =====================================================================
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function debounce(fn, ms) {
    var t;
    var d = function () {
      var args = arguments;
      var self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
    d.cancel = function () { clearTimeout(t); };
    return d;
  }
  function plural(n, one, few, many) {
    var a = Math.abs(n) % 100;
    var b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b === 1) return one;
    if (b >= 2 && b <= 4) return few;
    return many;
  }
  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }
  function onCleanup(fn) { ui.cleanup.push(fn); }
  function isTyping(el) {
    el = el || document.activeElement;
    if (!el) return false;
    return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable || !!(el.closest && el.closest('.CodeMirror'));
  }
  function toast(msg, kind) {
    var wrap = document.getElementById('toasts');
    var el = document.createElement('div');
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () { el.remove(); }, 2600);
  }
  function fmtTime(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var m = Math.floor(s / 60);
    var h = Math.floor(m / 60);
    var pad = function (x) { return (x < 10 ? '0' : '') + x; };
    return (h ? h + ':' + pad(m % 60) : pad(m)) + ':' + pad(s % 60);
  }
  function fmtDate(ts) {
    try {
      return new Date(ts).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return new Date(ts).toISOString();
    }
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    bookmarkFill: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" fill="currentColor"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" fill="currentColor" stroke="none"/>',
    bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    sidebar: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    book: '<path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>'
  };
  function icon(name, size) {
    size = size || 16;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  // =====================================================================
  //  Data helpers
  // =====================================================================
  function best(id) { return Store.item(id).best || ''; }
  function scoreOf(status) { return status === 'solved' ? 1 : status === 'partial' ? 0.5 : 0; }
  function stats(items) {
    var r = { total: items.length, solved: 0, partial: 0, wrong: 0, untouched: 0, score: 0 };
    items.forEach(function (it) {
      var b = best(it.id);
      if (b === 'solved') r.solved++;
      else if (b === 'partial') r.partial++;
      else if (b) r.wrong++;
      else r.untouched++;
      r.score += scoreOf(b);
    });
    r.pct = r.total ? Math.round((r.score / r.total) * 100) : 0;
    return r;
  }
  // Основний фреймворк: на співбесіду йдуть з одним. Курс другого лишається для порівняння
  // і не входить у готовність, план і пробну співбесіду за замовчуванням.
  var FW_TITLES = { react: 'React', vue: 'Vue' };
  function primaryFw() { var v = Store.setting('framework'); return FW_TITLES[v] ? v : null; }
  function optionalTrack() { var fw = primaryFw(); return fw === 'react' ? 'vue' : fw === 'vue' ? 'react' : null; }
  function skippedTopics() { return Store.setting('skipped') || {}; }
  // Модуль у плані: не курс другого фреймворку і не модуль, позначений framework іншого (фінальний проєкт).
  function topicInPath(tid) {
    var t = FE.topics[tid];
    if (!t || !t.section || t.section === optionalTrack()) return false;
    return !(t.framework && primaryFw() && t.framework !== primaryFw());
  }
  function inPath(it) { return topicInPath(it.topic); }
  function readinessItems() { return FE.items.filter(function (it) { return it.level <= 3 && inPath(it); }); }
  function orderedItems() {
    var out = [];
    FE.topicOrder.forEach(function (id) { out = out.concat(FE.topics[id].items); });
    return out;
  }
  // Орієнтовний час: квіз ~2 хв, теорія з розгорнутою відповіддю ~4 хв, задача з кодом — за рівнем,
  // плюс читання розділу підручника (~900 символів за хвилину).
  var CODE_MINUTES = { 1: 8, 2: 15, 3: 25, 4: 40 };
  function itemMinutes(it) { return it.type === 'quiz' ? 2 : it.type === 'theory' ? 4 : CODE_MINUTES[it.level] || 15; }
  function chapterMinutes(topicId) {
    var chars = 0;
    Object.keys(FE.bookChapters || {}).forEach(function (k) {
      var c = FE.bookChapters[k];
      if (c.body && (c.topics || []).indexOf(topicId) !== -1) chars += c.body.length;
    });
    return chars / 900;
  }
  function topicMinutes(topicId, remainingOnly) {
    var t = FE.topics[topicId];
    if (!t || !t.items.length) return 0;
    var left = remainingOnly ? t.items.filter(function (it) { return best(it.id) !== 'solved'; }) : t.items;
    var tasks = left.reduce(function (s, it) { return s + itemMinutes(it); }, 0);
    return tasks + chapterMinutes(topicId) * (left.length / t.items.length);
  }
  function fmtHours(min) {
    if (min < 1) return '0 год';
    if (min < 55) return Math.max(5, Math.round(min / 5) * 5) + ' хв';
    var h = min / 60;
    return (h < 10 ? Math.round(h * 2) / 2 : Math.round(h)).toString().replace('.', ',') + ' год';
  }
  // Що повторити сьогодні: інтервальні повторення (due) + закладки + незакриті спроби.
  function isDue(it) {
    var s = Store.item(it.id);
    if (s.rep) return true;
    if (typeof s.due === 'number') return s.due <= Date.now();
    return !!(s.s && s.s !== 'solved');
  }
  function reviewItems() {
    return FE.items.filter(isDue).sort(function (a, b) {
      var sa = Store.item(a.id); var sb = Store.item(b.id);
      var wa = sa.best === 'solved' ? 1 : 0; var wb = sb.best === 'solved' ? 1 : 0;
      return wa - wb || (sa.due || sa.at || 0) - (sb.due || sb.at || 0);
    });
  }
  function upcomingCount(days) {
    var limit = Date.now() + days * 864e5;
    return FE.items.filter(function (it) { var s = Store.item(it.id); return typeof s.due === 'number' && s.due > Date.now() && s.due <= limit; }).length;
  }
  function docsHtml(topicId, section) {
    var list = (FE.DOCS || {})[topicId] || [];
    var chapters = Object.keys(FE.bookChapters || {}).map(function (k) { return FE.bookChapters[k]; }).filter(function (c) { return c.body && (c.topics || []).indexOf(topicId) !== -1; });
    var bookLinks = chapters.map(function (c) { return '<a href="#/book/' + c.id + (section ? '/' + encodeURIComponent(section) : '') + '">Підручник: ' + esc(c.title) + '</a>'; });
    if (!list.length && !bookLinks.length) return '';
    return '<div class="docs">' + icon('book', 13) + ' <span>Детальніше:</span> ' + bookLinks.concat(list.map(function (d) { return '<a href="' + esc(d[1]) + '" target="_blank" rel="noopener noreferrer">' + esc(d[0]) + '</a>'; })).join('<span class="dot">·</span>') + '</div>';
    return '<div class="docs">' + icon('book', 13) + ' <span>Детальніше:</span> ' + list.map(function (d) { return '<a href="' + esc(d[1]) + '" target="_blank" rel="noopener noreferrer">' + esc(d[0]) + '</a>'; }).join('<span class="dot">·</span>') + '</div>';
  }
  function continueTarget() {
    var skipped = skippedTopics();
    var all = orderedItems().filter(function (it) { return inPath(it) && !skipped[it.topic]; });
    var last = Store.state.lastItem && FE.byId[Store.state.lastItem];
    if (last) {
      if (best(last.id) !== 'solved') return last;
      var start = all.indexOf(last);
      for (var i = start + 1; i < all.length; i++) if (!best(all[i].id)) return all[i];
    }
    for (var j = 0; j < all.length; j++) if (!best(all[j].id)) return all[j];
    return all[0] || null;
  }
  function levelBadge(level) {
    var L = FE.LEVELS[level] || FE.LEVELS[1];
    return '<span class="badge lvl l' + level + '" title="' + esc(L.name) + '">' + esc(L.label) + '</span>';
  }
  // Назва типу з урахуванням середовища: TypeScript, React і Vue — окремо від «Код» і «DOM / CSS».
  var RUNTIME_LABELS = { ts: 'TypeScript', react: 'React', vue: 'Vue' };
  function typeLabel(it) {
    return RUNTIME_LABELS[it.runtime] || (FE.TYPES[it.type] || { label: it.type }).label;
  }
  function typeBadge(it) {
    return '<span class="badge type">' + esc(typeLabel(it)) + '</span>';
  }
  function starBadge(item) {
    return item.interview ? '<span class="badge star" title="Часто питають на співбесідах">' + icon('star', 11) + ' співбесіда</span>' : '';
  }
  function statusDot(id) {
    var b = best(id);
    var s = Store.item(id).s;
    var cls = b === 'solved' ? 'solved' : b === 'partial' ? 'partial' : s ? 'wrong' : '';
    var sym = b === 'solved' ? '✓' : b === 'partial' ? '½' : s ? '!' : '';
    var title = b === 'solved' ? 'Розв\'язано' : b === 'partial' ? 'Частково' : s ? 'Була спроба — варто повторити' : 'Ще не розпочато';
    return '<span class="status-dot ' + cls + '" title="' + title + '">' + sym + '</span>';
  }
  function barHtml(st, lg) {
    var s = st.total ? (st.solved / st.total) * 100 : 0;
    var p = st.total ? (st.partial / st.total) * 100 : 0;
    return '<div class="bar' + (lg ? ' lg' : '') + '"><i style="width:' + s.toFixed(1) + '%"></i><i class="partial" style="width:' + p.toFixed(1) + '%"></i></div>';
  }
  function topicOf(item) { return FE.topics[item.topic]; }
  function groupOf(item) {
    var t = topicOf(item);
    return (t.groups || []).filter(function (g) { return g.id === item.group; })[0] || null;
  }
  function groupNumber(item) {
    var g = groupOf(item);
    return g ? g.index + 1 : 0;
  }
  function lessonHtml(item) {
    var g = groupOf(item);
    if (!g || !g.lesson) return '<div class="empty"><h3>Для цього кроку уроку немає</h3></div>';
    var t = topicOf(item);
    var inGroup = t.items.filter(function (i) { return i.group === g.id; });
    var s = stats(inGroup);
    return '<div class="lesson"><div class="lesson-kicker">Урок · крок ' + (g.index + 1) + ' з ' + t.groups.length + '</div><h1>' + esc(g.title) + '</h1>' +
      '<div class="md">' + MD.render(g.lesson) + '</div><p class="lesson-progress">У цьому кроці розв\'язано ' + s.solved + ' з ' + s.total + '.</p></div>';
  }

  function buildSearchIndex() {
    ui.searchIndex = FE.items.map(function (it) {
      var text = [it.title, (it.tags || []).join(' '), it.question || '', it.description || '', topicOf(it).title].join(' ');
      return { item: it, text: text.toLowerCase().replace(/[`*_#>|]/g, ' ') };
    });
  }

  // =====================================================================
  //  Shell
  // =====================================================================
  function renderShell() {
    app.setAttribute('data-sidebar', Store.setting('sidebar') === 'right' ? 'right' : 'left');
    if (Store.setting('sidebarCollapsed')) app.classList.add('sidebar-collapsed');
    app.innerHTML =
      '<aside class="sidebar" aria-label="Навігація">' +
        '<a class="brand" href="#/"><span class="brand-logo">FE</span><span class="brand-text"><span class="brand-title">FE Trainer</span><span class="brand-sub">шлях до Strong Middle</span></span></a>' +
        '<div class="side-search">' + icon('search', 14) +
          '<input id="search" type="search" placeholder="Пошук завдань…" autocomplete="off" aria-label="Пошук завдань"><kbd class="desktop-only">/</kbd></div>' +
        '<div class="side-links" id="side-links"></div>' +
        '<nav class="side-nav" id="side-nav"></nav>' +
        '<div class="side-foot" id="side-foot"></div>' +
      '</aside>' +
      '<div class="sidebar-backdrop" data-action="closeSidebar"></div>' +
      '<main class="main">' +
        '<header class="topbar">' +
          '<button class="icon-btn" data-action="toggleSidebar" title="Показати/сховати меню" aria-label="Меню">' + icon('menu', 18) + '</button>' +
          '<div class="crumbs" id="crumbs"></div>' +
          '<div class="topbar-actions">' +
            '<button class="icon-btn desktop-only" data-action="shortcuts" title="Гарячі клавіші (?)" aria-label="Гарячі клавіші">' + icon('keyboard', 18) + '</button>' +
            '<button class="icon-btn" data-action="toggleTheme" title="Змінити тему" aria-label="Змінити тему" id="theme-btn"></button>' +
            '<button class="icon-btn" data-action="settings" title="Налаштування" aria-label="Налаштування">' + icon('settings', 18) + '</button>' +
          '</div>' +
        '</header>' +
        '<div class="view" id="view"></div>' +
      '</main>';
    applyTheme();
    renderSidebar();
    bindSearch();
    if (!document.getElementById('console-fab')) {
      document.body.insertAdjacentHTML('beforeend',
        '<button class="console-fab" id="console-fab" data-action="toggleGlobalConsole" title="Консоль JS (Ctrl+&#39;)">' + icon('play', 13) + ' Консоль</button>' +
        '<aside class="global-console" id="global-console" hidden><div class="gc-head"><b>Консоль JavaScript</b><span class="grow"></span><button class="icon-btn" data-action="toggleGlobalConsole" aria-label="Закрити">' + icon('x', 16) + '</button></div><div class="gc-body"></div></aside>');
    }
  }

  function applyTheme() {
    var t = Store.setting('theme') || 'dark';
    var actual = t === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
    document.documentElement.setAttribute('data-theme', actual);
    document.documentElement.style.setProperty('--editor-font-size', (Store.setting('fontSize') || 14) + 'px');
    var btn = document.getElementById('theme-btn');
    if (btn) btn.innerHTML = icon(actual === 'dark' ? 'sun' : 'moon', 18);
  }

  function renderSidebar() {
    var nav = document.getElementById('side-nav');
    if (!nav) return;
    var route = ui.routeName;
    var activeTopic = ui.activeTopic;
    var reviewCount = reviewItems().length;
    var link = function (r, href, ic, label, extra) {
      return '<a class="side-nav-link' + (route === r ? ' active' : '') + '" href="' + href + '">' + icon(ic, 15) + '<span>' + label + '</span>' + (extra || '') + '</a>';
    };
    $('#side-links').innerHTML =
      link('home', '#/', 'home', 'Головна') +
      link('book', '#/book', 'book', 'Підручник') +
      link('play', '#/play/js', 'code', 'Пісочниця') +
      link('studio', '#/studio', 'edit', 'Мої задачі') +
      link('review', '#/review', 'repeat', 'Повторення', reviewCount ? '<span class="count">' + reviewCount + '</span>' : '') +
      link('interview', '#/interview', 'mic', 'Співбесіда') +
      link('all', '#/all', 'list', 'Усі завдання');
    var q = ($('#search') || {}).value || '';
    if (q.trim().length >= 2) {
      renderSearchResults(q);
    } else {
      var tr = ui.activeTrack && FE.sections.filter(function (s) { return s.id === ui.activeTrack; })[0];
      if (tr && tr.status !== 'soon') {
        // Поточний курс: його модулі по порядку
        nav.innerHTML = '<a class="side-back" href="#/">' + icon('left', 13) + ' Усі курси</a>' +
          '<a class="side-track-head" href="#/track/' + tr.id + '"><span class="track-ico" style="--c:' + esc(tr.color) + '">' + esc(tr.icon) + '</span><span>' + esc(tr.title) + '</span></a>' +
          tr.topics.map(function (tid, i) {
            var t = FE.topics[tid];
            var st = stats(t.items);
            var done = st.total && st.solved === st.total;
            return '<a class="side-topic' + (activeTopic === tid ? ' active' : '') + (done ? ' done' : '') + '" href="#/t/' + tid + '">' +
              '<div class="side-topic-row"><span class="side-num">' + (done ? '✓' : i + 1) + '</span><span class="side-topic-title" title="' + esc(t.title) + '">' + esc(t.short) + '</span>' +
              '<span class="side-topic-count">' + st.solved + '/' + st.total + '</span></div>' + barHtml(st) + '</a>';
          }).join('');
      } else {
        nav.innerHTML = FE.AREAS.map(function (area) {
          var secs = FE.sections.filter(function (sec) { return sec.area === area.id; });
          if (!secs.length) return '';
          return '<div class="side-label">' + esc(area.title) + '</div>' + secs.map(function (sec) {
            if (sec.status === 'soon') {
              return '<div class="side-track soon" title="Скоро"><span class="track-ico" style="--c:' + esc(sec.color) + '">' + esc(sec.icon) + '</span><span class="t">' + esc(sec.title) + '</span><span class="side-soon">скоро</span></div>';
            }
            var st = stats(trackItems(sec));
            return '<a class="side-track" href="#/track/' + sec.id + '"><span class="track-ico" style="--c:' + esc(sec.color) + '">' + esc(sec.icon) + '</span><span class="t">' + esc(sec.title) + '</span>' +
              '<span class="side-topic-count"' + (sec.id === optionalTrack() ? ' title="Для порівняння: не входить у план">опц.' : '>' + st.pct + '%') + '</span></a>';
          }).join('');
        }).join('');
      }
    }
    var all = stats(FE.items);
    $('#side-foot').innerHTML = '<span>' + all.solved + ' / ' + all.total + ' · ' + pct(all.score, all.total) + '%</span><span class="grow"></span>' +
      '<button class="ed-btn" data-action="resetAll" title="Видалити весь прогрес і почати з нуля">Скинути все</button>';
  }

  function highlightMatch(text, words) {
    var html = esc(text);
    words.forEach(function (w) {
      if (!w) return;
      var re = new RegExp('(' + esc(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      html = html.replace(re, '<mark>$1</mark>');
    });
    return html;
  }

  function renderSearchResults(q) {
    var nav = document.getElementById('side-nav');
    if (!ui.searchIndex) buildSearchIndex();
    var words = q.toLowerCase().split(/\s+/).filter(Boolean);
    var results = ui.searchIndex.filter(function (e) {
      return words.every(function (w) { return e.text.indexOf(w) !== -1; });
    });
    // заголовки, що збігаються, — вище
    results.sort(function (a, b) {
      var at = words.every(function (w) { return a.item.title.toLowerCase().indexOf(w) !== -1; }) ? 0 : 1;
      var bt = words.every(function (w) { return b.item.title.toLowerCase().indexOf(w) !== -1; }) ? 0 : 1;
      return at - bt;
    });
    var shown = results.slice(0, 60);
    ui.searchIds = shown.map(function (e) { return e.item.id; });
    nav.innerHTML = shown.length
      ? '<div class="search-results">' + shown.map(function (e, i) {
        var it = e.item;
        return '<a class="search-item" data-nav="search" href="#/i/' + it.id + '" data-idx="' + i + '">' +
          '<div>' + highlightMatch(it.title, words) + '</div>' +
          '<div class="meta">' + statusDot(it.id) + '<span>' + esc(topicOf(it).short) + '</span>·<span>' + esc(typeLabel(it)) + '</span>·<span>' + esc(FE.LEVELS[it.level].label) + '</span></div></a>';
      }).join('') + (results.length > shown.length ? '<div class="side-empty">…ще ' + (results.length - shown.length) + '. Уточніть запит.</div>' : '') + '</div>'
      : '<div class="side-empty">Нічого не знайдено за запитом «' + esc(q) + '»</div>';
  }

  function bindSearch() {
    var input = $('#search');
    var kb = -1;
    var update = debounce(function () { kb = -1; renderSidebar(); }, 120);
    input.addEventListener('input', update);
    input.addEventListener('keydown', function (e) {
      var items = $$('.search-item');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!items.length) return;
        kb = (kb + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items.forEach(function (el, i) { el.classList.toggle('kb', i === kb); });
        items[kb].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        var target = items[kb >= 0 ? kb : 0];
        if (target) {
          ui.nav = { ids: ui.searchIds.slice(), label: 'Пошук', back: null };
          location.hash = target.getAttribute('href');
          closeSidebarMobile();
        }
      } else if (e.key === 'Escape') {
        input.value = '';
        renderSidebar();
        input.blur();
      }
    });
  }

  function setCrumbs(parts) {
    var el = document.getElementById('crumbs');
    if (!el) return;
    el.innerHTML = parts.map(function (p, i) {
      var last = i === parts.length - 1;
      if (last || !p.href) return '<span class="' + (last ? 'cur' : '') + '">' + esc(p.label) + '</span>';
      return '<a href="' + p.href + '">' + esc(p.label) + '</a>';
    }).join('<span class="sep">/</span>');
    document.title = (parts.length ? parts[parts.length - 1].label + ' — ' : '') + 'FE Trainer';
  }

  function closeSidebarMobile() {
    app.classList.remove('sidebar-open');
  }

  // =====================================================================
  //  Router
  // =====================================================================
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '');
    var parts = h.split('/').filter(Boolean).map(decodeURIComponent);
    return parts;
  }

  function route() {
    ui.cleanup.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
    ui.cleanup = [];
    ui.actions = {};
    ui.activeTopic = null;
    ui.activeTrack = null;
    var view = document.getElementById('view');
    view.className = 'view';
    view.scrollTop = 0;
    closeSidebarMobile();
    var p = parseHash();
    try {
      if (!p.length) { ui.routeName = 'home'; viewDashboard(view); }
      else if (p[0] === 't' && FE.topics[p[1]]) { ui.routeName = 'topic'; ui.activeTopic = p[1]; ui.activeTrack = FE.topics[p[1]].section; viewTopic(view, p[1], p[2] || 'list'); }
      else if (p[0] === 'i' && FE.byId[p[1]]) { ui.routeName = 'item'; ui.activeTopic = FE.byId[p[1]].topic; ui.activeTrack = FE.topics[FE.byId[p[1]].topic].section; viewItem(view, FE.byId[p[1]], null); }
      else if (p[0] === 'all') { ui.routeName = 'all'; viewAll(view); }
      else if (p[0] === 'review') { ui.routeName = 'review'; viewReview(view); }
      else if (p[0] === 'book') { ui.routeName = 'book'; viewBook(view, p[1] || null, p[2] ? decodeURIComponent(p[2]) : null); }
      else if (p[0] === 'track') { ui.routeName = 'track'; ui.activeTrack = p[1]; viewTrack(view, p[1]); }
      else if (p[0] === 'play') { ui.routeName = 'play'; viewPlayground(view, p[1]); }
      else if (p[0] === 'studio') { ui.routeName = 'studio'; viewStudio(view, p[1] || null); }
      else if (p[0] === 'interview' && p[1] === 'run') { ui.routeName = 'interview'; viewInterviewRun(view); }
      else if (p[0] === 'interview' && p[1] === 'result') { ui.routeName = 'interview'; viewInterviewResult(view, Number(p[2] || 0)); }
      else if (p[0] === 'interview') { ui.routeName = 'interview'; viewInterviewSetup(view); }
      else { ui.routeName = 'notfound'; viewNotFound(view); }
    } catch (e) {
      console.error(e);
      view.innerHTML = '<div class="empty"><h3>Помилка відображення</h3><p>' + esc(e.message) + '</p></div>';
    }
    renderSidebar();
    document.body.classList.toggle('has-item-console', ui.routeName === 'item' || ui.routeName === 'play' || (ui.routeName === 'interview' && !!ui.currentItem));
    if (document.body.classList.contains('has-item-console')) { var gc = document.getElementById('global-console'); if (gc) gc.hidden = true; }
  }

  function viewNotFound(view) {
    setCrumbs([{ label: 'Не знайдено' }]);
    view.innerHTML = '<div class="empty"><h3>Сторінку не знайдено</h3><p>Можливо, завдання було перейменовано.</p><a class="btn" href="#/">На головну</a></div>';
  }

  // =====================================================================
  //  Dashboard
  // =====================================================================
  var LEVEL_DESC = {
    1: 'База: визначення, синтаксис, просте використання.',
    2: 'Впевнене використання, типові пастки, часті питання.',
    3: 'Як це працює під капотом, поліфіли, trade-offs.',
    4: 'Глибина специфікації та складні реалізації.'
  };

  function loadErrorsHtml() {
    var errs = FE.loadErrors || [];
    if (!errs.length) return '';
    return '<div class="load-errors"><b>Деякі файли даних завантажились з помилками:</b><ul>' +
      errs.slice(0, 10).map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul></div>';
  }

  function ringHtml(value, label) {
    var r = 56;
    var c = 2 * Math.PI * r;
    var off = c * (1 - value / 100);
    return '<div class="ring"><svg viewBox="0 0 132 132"><defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--l3)"/></linearGradient></defs>' +
      '<circle class="track" cx="66" cy="66" r="' + r + '"/><circle class="val" cx="66" cy="66" r="' + r + '" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg>' +
      '<div class="ring-label"><div><b>' + value + '%</b><span>' + esc(label) + '</span></div></div></div>';
  }

  function viewDashboard(view) {
    setCrumbs([{ label: 'Головна' }]);
    var all = stats(FE.items);
    var ready = stats(readinessItems());
    var byType = {};
    Object.keys(FE.TYPES).forEach(function (t) { byType[t] = stats(FE.items.filter(function (i) { return i.type === t; })); });
    var target = continueTarget();
    var reviewCount = reviewItems().length;
    var started = all.total - all.untouched;
    var html = '<div class="page">' + loadErrorsHtml() +
      '<div class="page-head"><div><h1>Підготовка до Strong Middle Frontend</h1>' +
      '<div class="sub">' + all.total + ' ' + plural(all.total, 'завдання', 'завдання', 'завдань') + ' у ' + FE.topicOrder.length + ' темах: задачі з автоперевіркою, квізи та питання співбесід — від Junior до Senior.</div></div></div>' +
      '<div class="hero">' +
        '<div class="card hero-main">' + ringHtml(ready.pct, 'готовність') +
          '<div class="hero-text"><h2>Готовність до рівня Strong Middle</h2>' +
          '<p>Рахуються завдання рівнів Junior → Strong Middle (' + ready.total + ' шт.)' + (primaryFw() ? ' з основним фреймворком ' + FW_TITLES[primaryFw()] : ' з обома фреймворками — оберіть основний у плані нижче') + '. Розв\'язуйте задачі, відповідайте на питання і проходьте пробні співбесіди, щоб довести показник до 85%+.</p>' +
          '<div class="hero-actions">' +
            (target ? '<a class="btn primary" href="#/i/' + target.id + '">' + (started ? 'Продовжити' : 'Почати навчання') + ' ' + icon('right', 14) + '</a>' : '') +
            '<a class="btn" href="#/interview">' + icon('mic', 14) + ' Пробна співбесіда</a>' +
            (reviewCount ? '<a class="btn" href="#/review">' + icon('repeat', 14) + ' Повторити сьогодні (' + reviewCount + ')</a>' : '') +
            (started >= 5 ? '<button class="btn" data-action="mixedPractice" title="Випадковий мікс з тем, які ви вже почали — найкраще закріплює знання">' + icon('refresh', 14) + ' Змішана практика</button>' : '') +
          '</div></div></div>' +
        '<div class="card hero-stats">' +
          '<div class="stat"><b>' + all.solved + '<span style="font-size:13px;color:var(--text-faint)"> / ' + all.total + '</span></b><span>Усього розв\'язано</span>' + barHtml(all) + '</div>' +
          ['code', 'dom', 'quiz', 'theory'].map(function (t) {
            var s = byType[t];
            return '<div class="stat"><b>' + s.solved + '<span style="font-size:13px;color:var(--text-faint)"> / ' + s.total + '</span></b><span>' + esc(FE.TYPES[t].label) + '</span>' + barHtml(s) + '</div>';
          }).join('') +
          '<div class="stat"><b>' + (Store.state.interviews.length) + '</b><span>Пробних співбесід</span></div>' +
        '</div>' +
      '</div>' +
      planHtml() +
      '<div class="levels-row">' + [1, 2, 3, 4].map(function (l) {
        var s = stats(FE.items.filter(function (i) { return i.level === l; }));
        return '<div class="card level-card l' + l + '"><div class="t"><b>' + esc(FE.LEVELS[l].label) + '</b><span>' + s.solved + ' / ' + s.total + '</span></div><p>' + LEVEL_DESC[l] + '</p>' + barHtml(s) + '</div>';
      }).join('') + '</div>' +
      (started < 3 ? howToHtml() : '') +
      FE.AREAS.map(function (area) {
        var secs = FE.sections.filter(function (sec) { return sec.area === area.id; });
        if (!secs.length) return '';
        return '<div class="section-block"><h2 class="section-title">' + esc(area.title) + (area.id === 'frontend' ? '<span class="meta">рекомендований порядок — зліва направо, зверху вниз</span>' : '') + '</h2>' +
          '<div class="track-grid">' + secs.map(trackCardHtml).join('') + '</div></div>';
      }).join('') +
      '</div>';
    view.innerHTML = html;
  }

  // План навчання: основний фреймворк, години на тиждень, скільки лишилось і що можна пропустити.
  var WEEKLY_HOURS = [3, 6, 10, 15];
  function planHtml() {
    var fw = primaryFw();
    var hours = Store.setting('weeklyHours') || 6;
    var skipped = skippedTopics();
    var opt = optionalTrack();
    var tracks = FE.sections.filter(function (s) { return s.status !== 'soon' && s.topics.length; });
    var rows = tracks.map(function (sec) {
      var inPlan = sec.id !== opt;
      var mins = sec.topics.reduce(function (s, tid) { return s + (skipped[tid] || !topicInPath(tid) ? 0 : topicMinutes(tid, true)); }, 0);
      var total = sec.topics.reduce(function (s, tid) { return s + topicMinutes(tid, false); }, 0);
      return { sec: sec, inPlan: inPlan, left: mins, total: total };
    });
    var left = rows.reduce(function (s, r) { return s + (r.inPlan ? r.left : 0); }, 0);
    var weeks = Math.max(1, Math.ceil(left / 60 / hours));
    var finish = new Date(Date.now() + weeks * 7 * 864e5);
    // «до серпня 2027» — родовий відмінок місяця (toLocaleDateString дає називний: «серпень 2027 р.»).
    var MONTHS_GEN = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
    var finishText = MONTHS_GEN[finish.getMonth()] + ' ' + finish.getFullYear();
    var skippedCount = Object.keys(skipped).filter(function (k) { return skipped[k] && FE.topics[k]; }).length;
    var chip = function (action, value, on, label) {
      return '<button class="chip' + (on ? ' on' : '') + '" data-action="' + action + '" data-value="' + value + '">' + label + '</button>';
    };
    return '<div class="card plan-card"><div class="plan-head"><h3>' + icon('clock', 15) + ' План навчання</h3>' +
      '<span class="plan-total">' + (left >= 1 ? 'Залишилось ≈ <b>' + fmtHours(left) + '</b> · ≈ ' + weeks + ' ' + plural(weeks, 'тиждень', 'тижні', 'тижнів') + ' при ' + hours + ' год/тиждень (орієнтовно до ' + esc(finishText) + ')' : '<b>План виконано</b>') + '</span></div>' +
      '<div class="plan-controls"><div><span class="plan-label">Основний фреймворк</span>' +
        chip('setFramework', 'react', fw === 'react', 'React') + chip('setFramework', 'vue', fw === 'vue', 'Vue') + chip('setFramework', 'both', !fw, 'Обидва') + '</div>' +
        '<div><span class="plan-label">Годин на тиждень</span>' + WEEKLY_HOURS.map(function (h) { return chip('setWeeklyHours', h, h === hours, String(h)); }).join('') + '</div></div>' +
      '<p class="plan-note">' + (fw
        ? 'Готовність, план і пробна співбесіда рахують ' + FW_TITLES[fw] + '. Курс ' + FW_TITLES[opt] + ' — для порівняння: його можна пройти пізніше або пропустити.'
        : 'На співбесіду йдуть з одним фреймворком. Оберіть основний — тоді другий курс не рахуватиметься в готовності й плані (лишиться для порівняння).') + '</p>' +
      '<div class="plan-tracks">' + rows.map(function (r) {
        return '<a class="plan-track' + (r.inPlan ? '' : ' off') + '" href="#/track/' + r.sec.id + '" title="' + esc(r.sec.title) + ': усього ≈ ' + fmtHours(r.total) + '"><span class="track-ico" style="--c:' + esc(r.sec.color) + '">' + esc(r.sec.icon) + '</span>' +
          '<span class="t">' + esc(r.sec.title) + '</span><span class="h">' + (r.inPlan ? (r.left >= 1 ? '≈ ' + fmtHours(r.left) : '✓') : 'для порівняння') + '</span></a>';
      }).join('') + '</div>' +
      '<p class="plan-note"><b>Вже працюєте з цими технологіями?</b> Не проходьте знайоме підряд: у кожному модулі є «Підсумкова перевірка» (10 завдань). Від 85% модуль можна позначити знайомим — він випаде з плану, а «Продовжити» його пропускатиме.' +
        (skippedCount ? ' Позначено знайомими: ' + skippedCount + ' ' + plural(skippedCount, 'модуль', 'модулі', 'модулів') + '.' : '') + '</p></div>';
  }

  function howToHtml() {
    return '<div class="card howto"><h3>Як користуватися тренажером</h3><ol>' +
      '<li><b>Ідіть темами і кроками по порядку.</b> Нове пояснюється прямо в задачах, коли воно потрібне; після кожної відповіді видно, чому так. Задачі використовують лише те, що ви вже пройшли.</li>' +
      '<li><b>Задачі з кодом</b>: умова ліворуч, редактор праворуч. <b>«Запустити»</b> (<kbd>Ctrl</kbd>+<kbd>&#39;</kbd>) виконує код — у <b>консолі</b> можна викликати свої функції. <b>«Перевірити»</b> (<kbd>Ctrl</kbd>+<kbd>Enter</kbd>) запускає тести. Застрягли — поступові підказки.</li>' +
      '<li><b>Теорія та квізи</b>: оберіть правильний варіант (або кілька) — після перевірки ви побачите розгорнуту відповідь, ключові пункти та питання, які інтерв\'юер може поставити далі.</li>' +
      '<li>Позначайте складне закладкою <b>«На повторення»</b> і періодично проходьте <b>пробну співбесіду</b> — вона оцінить ваш рівень і покаже слабкі теми.</li>' +
      '</ol></div>';
  }

  function topicCardHtml(t) {
    var s = stats(t.items);
    var lv = [1, 2, 3, 4].map(function (l) {
      var n = t.items.filter(function (i) { return i.level === l; }).length;
      return n ? '<i style="background:var(--l' + l + ')" title="' + FE.LEVELS[l].label + ': ' + n + '"></i>' : '';
    }).join('');
    return '<a class="card topic-card' + (s.total ? '' : ' empty-topic') + '" href="#/t/' + t.id + '"><h3>' + esc(t.title) + '</h3><p>' + esc(t.about) + '</p>' +
      '<div class="foot"><span class="lvls">' + lv + '</span><span class="grow"></span><span>' + s.solved + ' / ' + s.total + '</span></div>' + barHtml(s) + '</a>';
  }

  // =====================================================================
  //  Lists (topic / all / review)
  // =====================================================================
  function filterState(key, defaults) {
    if (!ui.filters[key]) ui.filters[key] = Object.assign({ type: '', levels: [], status: '', star: false, q: '', section: '' }, defaults || {});
    return ui.filters[key];
  }

  function applyFilters(items, f) {
    var words = (f.q || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length && !ui.searchIndex) buildSearchIndex();
    var textOf = {};
    if (words.length) ui.searchIndex.forEach(function (e) { textOf[e.item.id] = e.text; });
    return items.filter(function (it) {
      if (f.type && it.type !== f.type) return false;
      if (f.levels.length && f.levels.indexOf(it.level) === -1) return false;
      if (f.star && !it.interview) return false;
      if (f.section && FE.topics[it.topic].section !== f.section && it.topic !== f.section) return false;
      var s = Store.item(it.id);
      if (f.status === 'todo' && s.best === 'solved') return false;
      if (f.status === 'done' && s.best !== 'solved') return false;
      if (f.status === 'repeat' && !(s.rep || (s.s && s.s !== 'solved'))) return false;
      if (words.length && !words.every(function (w) { return textOf[it.id].indexOf(w) !== -1; })) return false;
      return true;
    });
  }

  function filtersHtml(f, items, opts) {
    opts = opts || {};
    var count = function (pred) { return items.filter(pred).length; };
    var chip = function (on, action, value, label, n) {
      return '<button class="chip' + (on ? ' on' : '') + '" data-action="' + action + '" data-value="' + value + '">' + label + (n !== undefined ? ' <span class="n">' + n + '</span>' : '') + '</button>';
    };
    var html = '<div class="filters">';
    if (opts.search) html += '<input class="filter-select" style="min-width:200px" type="search" placeholder="Фільтр за текстом…" data-filter-q value="' + esc(f.q || '') + '">';
    if (opts.sections) {
      html += '<select class="filter-select" data-filter-section><option value="">Усі теми</option>' + FE.sections.map(function (sec) {
        return '<optgroup label="' + esc(sec.title) + '"><option value="' + sec.id + '"' + (f.section === sec.id ? ' selected' : '') + '>Увесь розділ</option>' +
          sec.topics.map(function (tid) { return '<option value="' + tid + '"' + (f.section === tid ? ' selected' : '') + '>' + esc(FE.topics[tid].short) + '</option>'; }).join('') + '</optgroup>';
      }).join('') + '</select><span class="sep"></span>';
    }
    html += chip(!f.type, 'fType', '', 'Усі', items.length);
    Object.keys(FE.TYPES).forEach(function (t) {
      var n = count(function (i) { return i.type === t; });
      if (n) html += chip(f.type === t, 'fType', t, FE.TYPES[t].label, n);
    });
    html += '<span class="sep"></span>';
    [1, 2, 3, 4].forEach(function (l) {
      var n = count(function (i) { return i.level === l; });
      if (n) html += chip(f.levels.indexOf(l) !== -1, 'fLevel', l, FE.LEVELS[l].label, n);
    });
    html += '<span class="sep"></span>';
    html += chip(f.star, 'fStar', '1', icon('star', 11) + ' Часті на співбесідах');
    html += '<select class="filter-select" data-filter-status>' +
      [['', 'Будь-який статус'], ['todo', 'Нерозв\'язані'], ['done', 'Розв\'язані'], ['repeat', 'На повторенні']].map(function (o) {
        return '<option value="' + o[0] + '"' + (f.status === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select>';
    html += '</div>';
    return html;
  }

  function bindFilters(root, f, rerender) {
    ui.actions.fType = function (el) { f.type = el.dataset.value; rerender(); };
    ui.actions.fLevel = function (el) {
      var l = Number(el.dataset.value);
      var i = f.levels.indexOf(l);
      if (i === -1) f.levels.push(l); else f.levels.splice(i, 1);
      rerender();
    };
    ui.actions.fStar = function () { f.star = !f.star; rerender(); };
    var st = $('[data-filter-status]', root);
    if (st) st.addEventListener('change', function () { f.status = st.value; rerender(); });
    var sec = $('[data-filter-section]', root);
    if (sec) sec.addEventListener('change', function () { f.section = sec.value; rerender(); });
    var q = $('[data-filter-q]', root);
    if (q) {
      q.addEventListener('input', debounce(function () { f.q = q.value; rerender(true); }, 200));
    }
  }

  function itemRowsHtml(items, opts) {
    opts = opts || {};
    if (!items.length) return '<div class="empty"><h3>' + esc(opts.emptyTitle || 'Нічого не знайдено') + '</h3><p>' + esc(opts.emptyText || 'Спробуйте змінити фільтри.') + '</p></div>';
    return '<div class="item-list">' + items.map(function (it, i) {
      var s = Store.item(it.id);
      return '<a class="item-row" href="#/i/' + it.id + '" data-nav="' + (opts.nav || '') + '">' +
        '<span class="num">' + (opts.numbers === false ? '' : (opts.numberOf ? opts.numberOf(it) : i + 1)) + '</span>' + statusDot(it.id) +
        '<span class="type-ico" title="' + esc(typeLabel(it)) + '">' + esc(FE.TYPES[it.type].icon) + '</span>' +
        '<span class="ttl">' + esc(it.title) + (opts.showTopic ? '<small>' + esc(topicOf(it).short) + '</small>' : '') + '</span>' +
        '<span class="badges">' + (s.rep ? '<span class="rep" title="На повторенні">' + icon('bookmarkFill', 13) + '</span>' : '') +
        (it.interview ? '<span class="badge star" title="Часто питають на співбесідах">' + icon('star', 11) + '</span>' : '') +
        '<span class="badge type tag">' + esc(typeLabel(it)) + '</span>' + levelBadge(it.level) + '</span></a>';
    }).join('') + '</div>';
  }

  function viewTopic(view, topicId, tab) {
    var t = FE.topics[topicId];
    var sec = trackOf(t.section);
    setCrumbs(sec ? [{ label: 'Головна', href: '#/' }, { label: sec.title, href: '#/track/' + sec.id }, { label: t.short }] : [{ label: 'Головна', href: '#/' }, { label: t.short }]);
    var f = filterState('topic:' + topicId);
    function render(keepFocus) {
      var s = stats(t.items);
      var filtered = applyFilters(t.items, f);
      var body;
      if (tab === 'intro') {
        body = t.intro
          ? '<div class="card intro-card md">' + MD.render(t.intro) + '</div><div class="next-row"><span></span><a class="btn primary" href="#/t/' + topicId + '">До завдань ' + icon('right', 14) + '</a></div>'
          : '<div class="empty"><h3>Шпаргалки для цієї теми ще немає</h3></div>';
      } else {
        var rowOpts = {
          nav: 'topic',
          numberOf: function (it) { return t.items.indexOf(it) + 1; },
          emptyTitle: t.items.length ? 'Нічого не знайдено' : 'Контент для цієї теми ще не додано',
          emptyText: t.items.length ? 'Спробуйте змінити фільтри.' : 'Завдання з\'являться після додавання файлу data/' + topicId + '.js'
        };
        if (t.groups && t.groups.length && filtered.length) {
          var groups = t.groups.slice();
          var known = {};
          groups.forEach(function (g) { known[g.id] = true; });
          if (filtered.some(function (it) { return !known[it.group]; })) groups.push({ id: '__other', title: 'Інше', lesson: '', index: groups.length });
          body = filtersHtml(f, t.items) + '<div class="steps">' + groups.map(function (g) {
            var inGroup = t.items.filter(function (it) { return g.id === '__other' ? !known[it.group] : it.group === g.id; });
            var shown = filtered.filter(function (it) { return inGroup.indexOf(it) !== -1; });
            if (!shown.length) return '';
            var gs = stats(inGroup);
            var done = gs.solved === gs.total;
            return '<section class="step' + (done ? ' done' : '') + '"><div class="step-head"><span class="step-num">' + (done ? '✓' : g.index + 1) + '</span>' +
              '<div class="step-text"><div class="step-title">' + esc(g.title) + '</div><div class="step-meta">' + gs.solved + ' / ' + gs.total + ' розв\'язано</div></div>' +
              '<div class="step-bar">' + barHtml(gs) + '</div></div>' +
              itemRowsHtml(shown, rowOpts) + '</section>';
          }).join('') + '</div>';
        } else {
          body = filtersHtml(f, t.items) + itemRowsHtml(filtered, rowOpts);
        }
      }
      var next = continueIn(t.items);
      view.innerHTML =
        '<div class="topic-header"><h1>' + esc(t.title) + '</h1><p class="about">' + esc(t.about) + '</p>' + docsHtml(topicId) +
        '<div class="topic-progress">' + barHtml(s, true) + '<span>' + s.solved + ' / ' + s.total + ' розв\'язано' + (s.partial ? ', ' + s.partial + ' частково' : '') + '</span>' +
        (next ? '<a class="btn sm primary" href="#/i/' + next.id + '" data-nav="topic">' + (s.untouched === s.total ? 'Почати' : 'Продовжити') + ' ' + icon('right', 12) + '</a>' : '') +
        (t.items.length && t.section ? '<button class="btn sm" data-action="moduleCheck" data-topic="' + topicId + '" title="10 випадкових завдань модуля з оцінкою; від 85% модуль можна позначити знайомим">' + icon('mic', 12) + ' Підсумкова перевірка</button>' : '') +
        (skippedTopics()[topicId] ? '<span class="badge tag">знайомий — не в плані</span><button class="btn sm ghost" data-action="toggleSkip" data-topic="' + topicId + '">Повернути в план</button>' : '') +
        (t.section ? '<span class="topic-time">≈ ' + fmtHours(topicMinutes(topicId, false)) + '</span>' : '') + '</div>' +
        '<div class="tabs" style="padding:0"><a class="tab' + (tab !== 'intro' ? ' active' : '') + '" href="#/t/' + topicId + '">Завдання <span class="n">' + t.items.length + '</span></a>' +
        '<a class="tab' + (tab === 'intro' ? ' active' : '') + '" href="#/t/' + topicId + '/intro">Шпаргалка</a></div></div>' +
        '<div class="topic-body">' + body + '</div>';
      if (tab !== 'intro') bindFilters(view, f, render);
      enhanceCode(view);
      if (keepFocus) { var q = $('[data-filter-q]', view); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
    }
    ui.navProvider = function () { return { ids: applyFilters(t.items, f).map(function (i) { return i.id; }), label: t.short, back: '#/t/' + topicId }; };
    render();
  }

  function continueIn(items) {
    for (var i = 0; i < items.length; i++) if (best(items[i].id) !== 'solved') return items[i];
    return null;
  }

  function viewAll(view) {
    setCrumbs([{ label: 'Головна', href: '#/' }, { label: 'Усі завдання' }]);
    var f = filterState('all');
    var all = orderedItems();
    function render(keepFocus) {
      var filtered = applyFilters(all, f);
      view.innerHTML = '<div class="page"><div class="page-head"><div><h1>Усі завдання</h1><div class="sub">Знайдено: ' + filtered.length + ' з ' + all.length + '. Поєднуйте фільтри, наприклад: «Strong Middle + Код + часті на співбесідах».</div></div></div>' +
        filtersHtml(f, all, { search: true, sections: true }) + itemRowsHtml(filtered, { nav: 'all', showTopic: true }) + '</div>';
      bindFilters(view, f, render);
      if (keepFocus) { var q = $('[data-filter-q]', view); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
    }
    ui.navProvider = function () { return { ids: applyFilters(all, f).map(function (i) { return i.id; }), label: 'Фільтр', back: '#/all' }; };
    render();
  }

  function viewReview(view) {
    setCrumbs([{ label: 'Головна', href: '#/' }, { label: 'Повторення' }]);
    var items = reviewItems();
    var marked = items.filter(function (i) { return Store.item(i.id).rep; });
    var mistakes = items.filter(function (i) { var s = Store.item(i.id); return !s.rep && s.best !== 'solved'; });
    var spaced = items.filter(function (i) { var s = Store.item(i.id); return !s.rep && s.best === 'solved'; });
    var soon = upcomingCount(7);
    view.innerHTML = '<div class="page"><div class="page-head"><div><h1>Повторення на сьогодні</h1><div class="sub">Інтервальні повторення: помилки повертаються одразу, а вивчене — через 1, 3, 7, 16 і 35 днів. Відповіли правильно — завдання зникає зі списку до наступного разу.' +
      (soon ? ' Протягом тижня заплановано ще ' + soon + '.' : '') + '</div></div>' +
      '<span class="grow"></span>' + (items.length ? '<a class="btn primary" href="#/i/' + items[0].id + '" data-nav="review">Почати (' + items.length + ') ' + icon('right', 14) + '</a>' : '') + '</div>' +
      (items.length ? '' : '<div class="empty"><h3>На сьогодні все повторено</h3><p>Тут з\'являться помилки, позначені закладкою ' + icon('bookmark', 12) + ' завдання та вивчене, якому настав час повторення.</p></div>') +
      (mistakes.length ? '<h2 class="section-title">' + icon('flag', 16) + ' Помилки (' + mistakes.length + ')</h2>' + itemRowsHtml(mistakes, { nav: 'review', showTopic: true }) + '<div style="height:20px"></div>' : '') +
      (spaced.length ? '<h2 class="section-title">' + icon('clock', 16) + ' Час повторити вивчене (' + spaced.length + ')</h2>' + itemRowsHtml(spaced, { nav: 'review', showTopic: true }) + '<div style="height:20px"></div>' : '') +
      (marked.length ? '<h2 class="section-title">' + icon('bookmarkFill', 16) + ' Позначені (' + marked.length + ')</h2>' + itemRowsHtml(marked, { nav: 'review', showTopic: true }) : '') +
      '</div>';
    items = mistakes.concat(spaced, marked);
    ui.navProvider = function () { return { ids: items.map(function (i) { return i.id; }), label: 'Повторення', back: '#/review' }; };
  }

  // =====================================================================
  //  Курси (треки) і модулі
  // =====================================================================
  function trackOf(id) { return FE.sections.filter(function (s) { return s.id === id; })[0] || null; }
  function trackItems(sec) {
    var out = [];
    sec.topics.forEach(function (tid) { out = out.concat(FE.topics[tid].items); });
    return out;
  }
  // Частина підручника, що відповідає курсу
  var TRACK_BOOK = { html: 'html', css: 'css', 'js-core': 'js', browser: 'js' };

  function trackCardHtml(sec) {
    if (sec.status === 'soon') {
      return '<div class="card track-card soon" style="--c:' + esc(sec.color) + '"><div class="track-card-head"><span class="track-ico lg">' + esc(sec.icon) + '</span>' +
        '<span class="badge tag">скоро</span></div><h3>' + esc(sec.title) + '</h3><p>' + esc(sec.about) + '</p></div>';
    }
    var items = trackItems(sec);
    var s = stats(items);
    var optional = sec.id === optionalTrack();
    var hours = sec.topics.reduce(function (m, tid) { return m + topicMinutes(tid, false); }, 0);
    return '<a class="card track-card' + (optional ? ' optional' : '') + '" href="#/track/' + sec.id + '" style="--c:' + esc(sec.color) + '"><div class="track-card-head"><span class="track-ico lg">' + esc(sec.icon) + '</span>' +
      (optional ? '<span class="badge tag" title="Не входить у готовність і план: основний фреймворк — ' + esc(FW_TITLES[primaryFw()]) + '">для порівняння</span>' : '<span class="track-pct">' + s.pct + '%</span>') + '</div><h3>' + esc(sec.title) + '</h3><p>' + esc(sec.about) + '</p>' +
      '<div class="foot"><span>' + sec.topics.length + ' ' + plural(sec.topics.length, 'модуль', 'модулі', 'модулів') + ' · ' + items.length + ' завд. · ≈ ' + fmtHours(hours) + '</span><span class="grow"></span><span>' + s.solved + ' / ' + s.total + '</span></div>' + barHtml(s) + '</a>';
  }

  function viewTrack(view, id) {
    var sec = trackOf(id);
    if (!sec) return viewNotFound(view);
    setCrumbs([{ label: 'Головна', href: '#/' }, { label: sec.title }]);
    ui.nav = null;
    if (sec.status === 'soon') {
      view.innerHTML = '<div class="page"><div class="card track-hero" style="--c:' + esc(sec.color) + '"><span class="track-ico xl">' + esc(sec.icon) + '</span><div><h1>' + esc(sec.title) + '</h1><p>' + esc(sec.about) + '</p>' +
        '<p class="q-note">Курс у планах. Структура застосунку вже готова до нього: модулі, завдання й середовище виконання підключаться без змін інтерфейсу.</p></div></div></div>';
      return;
    }
    var items = trackItems(sec);
    var s = stats(items);
    var skipped = skippedTopics();
    var next = continueIn(items.filter(function (it) { return !skipped[it.topic] && (sec.id === optionalTrack() || topicInPath(it.topic)); })) || continueIn(items);
    var bookPart = TRACK_BOOK[sec.id];
    var hoursTotal = sec.topics.reduce(function (m, tid) { return m + topicMinutes(tid, false); }, 0);
    view.innerHTML = '<div class="page track-page">' +
      '<div class="card track-hero" style="--c:' + esc(sec.color) + '"><span class="track-ico xl">' + esc(sec.icon) + '</span>' +
        '<div class="grow"><h1>' + esc(sec.title) + '</h1><p>' + esc(sec.about) + '</p>' +
        (sec.id === optionalTrack() ? '<p class="q-note">Ваш основний фреймворк — ' + esc(FW_TITLES[primaryFw()]) + ', тож цей курс — для порівняння: він не входить у готовність і план. Змінити можна на головній, у «Плані навчання».</p>' : '') +
        '<p class="q-note">Орієнтовно ≈ ' + fmtHours(hoursTotal) + ' разом із підручником.</p>' +
        '<div class="topic-progress">' + barHtml(s, true) + '<span>' + s.solved + ' / ' + s.total + ' розв\'язано · ' + sec.topics.length + ' ' + plural(sec.topics.length, 'модуль', 'модулі', 'модулів') + '</span></div>' +
        '<div class="hero-actions">' + (next ? '<a class="btn primary" href="#/i/' + next.id + '">' + (s.untouched === s.total ? 'Почати курс' : 'Продовжити') + ' ' + icon('right', 14) + '</a>' : '<span class="badge l1">Курс пройдено</span>') +
        (bookPart ? '<a class="btn" href="#/book">' + icon('book', 14) + ' Підручник</a>' : '') + '</div></div></div>' +
      '<ol class="roadmap">' + sec.topics.map(function (tid, i) {
        var t = FE.topics[tid];
        var st = stats(t.items);
        var done = st.total > 0 && st.solved === st.total;
        var started = st.untouched < st.total;
        var nxt = continueIn(t.items);
        var known = !!skipped[tid];
        var otherFw = sec.id !== optionalTrack() && !topicInPath(tid);
        return '<li class="rm-item' + (done ? ' done' : started ? ' active' : '') + (known || otherFw ? ' known' : '') + '"><span class="rm-num">' + (done ? '✓' : i + 1) + '</span>' +
          '<div class="card rm-card"><div class="rm-head"><a href="#/t/' + tid + '"><h3>' + esc(t.title) + '</h3></a>' + (known ? '<span class="badge tag" title="Не входить у план">знайомий</span>' : '') +
          (otherFw ? '<span class="badge tag" title="Основний фреймворк — ' + esc(FW_TITLES[primaryFw()]) + '">для порівняння</span>' : '') +
          '<span class="rm-meta">' + st.solved + ' / ' + st.total + ' · ≈ ' + fmtHours(topicMinutes(tid, false)) + '</span></div>' +
          '<p>' + esc(t.about) + '</p>' +
          ((t.groups || []).length ? '<div class="rm-steps">' + t.groups.map(function (g, k) {
            var gi = t.items.filter(function (it) { return it.group === g.id; });
            var gs = stats(gi);
            return '<span class="rm-step' + (gs.total && gs.solved === gs.total ? ' done' : '') + '">' + (k + 1) + '. ' + esc(g.title) + '</span>';
          }).join('') + '</div>' : '') +
          barHtml(st) +
          '<div class="rm-actions">' + (nxt ? '<a class="btn sm primary" href="#/i/' + nxt.id + '">' + (started ? 'Продовжити' : 'Почати') + '</a>' : '<span class="badge l1">Модуль пройдено</span>') +
          '<a class="btn sm ghost" href="#/t/' + tid + '">Усі завдання</a>' + (started ? '<button class="btn sm ghost" data-action="moduleCheck" data-topic="' + tid + '">Перевірити себе</button>' : '') + (t.intro ? '<a class="btn sm ghost" href="#/t/' + tid + '/intro">Шпаргалка</a>' : '') + '</div></div></li>';
      }).join('') + '</ol></div>';
  }

  // =====================================================================
  //  Службові модулі: пісочниця і «Мої задачі» (не входять у курси та статистику)
  // =====================================================================
  function hiddenTopic(id, title) {
    if (!FE.topics[id]) FE.topics[id] = { id: id, title: title, short: title, section: null, about: '', intro: '', groups: [], items: [] };
    return FE.topics[id];
  }

  function ensurePlayground() {
    var t = hiddenTopic('playground', 'Пісочниця');
    if (t.items.length) return;
    var js = {
      id: 'pg-js', topic: 'playground', type: 'code', level: 1, title: 'Пісочниця: JavaScript', description: '', tests: [], hints: [], explanation: '', solution: '',
      starter: '// Пісочниця JavaScript: пишіть будь-який код.\n// «Запустити» (Ctrl+\') — виконати, а внизу в консолі можна викликати свої функції.\n\nfunction greet(name) {\n  return `Привіт, ${name}!`;\n}\n\nconsole.log(greet(\'світ\'));\n'
    };
    var web = {
      id: 'pg-web', topic: 'playground', type: 'dom', level: 1, title: 'Пісочниця: HTML / CSS / JS', description: '', tests: [], hints: [], explanation: '',
      editable: ['html', 'css', 'js'], solution: {},
      html: '<h1>Привіт!</h1>\n<button id="btn">Натисни</button>\n<p id="out"></p>\n',
      css: 'body { font-family: system-ui, sans-serif; padding: 16px; }\nbutton { padding: 8px 14px; }\n',
      js: "const btn = document.getElementById('btn');\nlet clicks = 0;\nbtn.addEventListener('click', () => {\n  clicks++;\n  document.getElementById('out').textContent = 'Кліків: ' + clicks;\n  console.log('клік', clicks);\n});\n"
    };
    var tsItem = {
      id: 'pg-ts', topic: 'playground', type: 'code', runtime: 'ts', level: 1, title: 'Пісочниця: TypeScript', description: '', tests: [], hints: [], explanation: '', solution: '',
      starter: '// Пісочниця TypeScript (tsc --strict): помилки типів показуються в консолі.\n\ninterface User {\n  name: string;\n  age?: number;\n}\n\nfunction greet(user: User): string {\n  return `Привіт, ${user.name}!`;\n}\n\nconsole.log(greet({ name: \'Ann\' }));\n// Спробуйте: greet({ nam: \'Ann\' }) — і подивіться на помилку типу\n'
    };
    var reactItem = {
      id: 'pg-react', topic: 'playground', type: 'dom', runtime: 'react', level: 1, title: 'Пісочниця: React', description: '', tests: [], hints: [], explanation: '',
      editable: ['js', 'css'], solution: {},
      html: '<div id="root"></div>\n',
      css: 'body { font-family: system-ui, sans-serif; padding: 16px; }\nbutton { padding: 6px 12px; }\n',
      js: "import { useState } from 'react';\n\n// Пісочниця React 19: компонент App автоматично рендериться в #root.\nfunction Counter({ start = 0 }) {\n  const [count, setCount] = useState(start);\n  return (\n    <button onClick={() => setCount(count + 1)}>Кліків: {count}</button>\n  );\n}\n\nfunction App() {\n  return (\n    <main>\n      <h1>Привіт, React!</h1>\n      <Counter start={0} />\n    </main>\n  );\n}\n"
    };
    var vueItem = {
      id: 'pg-vue', topic: 'playground', type: 'dom', runtime: 'vue', level: 1, title: 'Пісочниця: Vue', description: '', tests: [], hints: [], explanation: '',
      editable: ['js', 'css'], solution: {},
      html: '<div id="root"></div>\n',
      css: 'body { font-family: system-ui, sans-serif; padding: 16px; }\nbutton { padding: 6px 12px; }\n',
      js: "<!-- Пісочниця Vue 3: справжні .vue-компоненти; App монтується в #root. Кожен файл починається рядком-маркером, як нижче. -->\n<!-- file: Counter.vue -->\n<script setup>\nimport { ref } from 'vue';\n\nconst props = defineProps({ start: { type: Number, default: 0 } });\nconst count = ref(props.start);\n</script>\n\n<template>\n  <button @click=\"count++\">Кліків: {{ count }}</button>\n</template>\n\n<!-- file: App.vue -->\n<script setup>\nimport Counter from './Counter.vue';\n</script>\n\n<template>\n  <main>\n    <h1>Привіт, Vue!</h1>\n    <Counter :start=\"0\" />\n  </main>\n</template>\n\n<style scoped>\nh1 { color: #42b883; }\n</style>\n"
    };
    t.items = [js, web, tsItem, reactItem, vueItem];
    FE.byId[js.id] = js;
    FE.byId[web.id] = web;
    FE.byId[tsItem.id] = tsItem;
    FE.byId[reactItem.id] = reactItem;
    FE.byId[vueItem.id] = vueItem;
  }

  function viewPlayground(view, mode) {
    ensurePlayground();
    var PG = { js: ['pg-js', 'JavaScript'], ts: ['pg-ts', 'TypeScript'], web: ['pg-web', 'HTML / CSS / JS'], react: ['pg-react', 'React'], vue: ['pg-vue', 'Vue'] };
    mode = PG[mode] ? mode : 'js';
    setCrumbs([{ label: 'Головна', href: '#/' }, { label: 'Пісочниця' }, { label: PG[mode][1] }]);
    var item = FE.byId[PG[mode][0]];
    ui.currentItem = item;
    onCleanup(function () { ui.currentItem = null; });
    renderCodeItem(view, item, { playground: mode });
  }

  // ---------------- Мої задачі (студія)
  function customTasks() { return Store.setting('customTasks') || {}; }

  function registerCustomTasks() {
    var t = hiddenTopic('my-tasks', 'Мої задачі');
    t.items.forEach(function (it) { delete FE.byId[it.id]; });
    var map = customTasks();
    t.items = Object.keys(map).map(function (id) {
      var it = Object.assign({}, map[id], { topic: 'my-tasks' });
      FE.byId[id] = it;
      return it;
    });
  }

  // Тести у студії: блоки, що починаються рядком «// test: назва»
  // «// test: назва» — тест виконання (expect), «// type: назва» — перевірка типів (лише для TypeScript)
  function parseStudioTests(src, kind) {
    var tests = [];
    var cur = null;
    String(src || '').split('\n').forEach(function (line) {
      var m = line.match(/^\s*\/\/\s*(test|type):\s*(.+)$/);
      if (m) { cur = { kind: m[1], name: m[2].trim(), code: '' }; tests.push(cur); return; }
      if (cur) cur.code += (cur.code ? '\n' : '') + line;
    });
    return tests.filter(function (t) { return t.kind === (kind || 'test') && t.code.trim(); })
      .map(function (t) { return { name: t.name, code: t.code.replace(/\s+$/, '') }; });
  }
  function studioTestsText(tests, typeTests) {
    return (typeTests || []).map(function (t) { return '// type: ' + t.name + '\n' + t.code; })
      .concat((tests || []).map(function (t) { return '// test: ' + t.name + '\n' + t.code; })).join('\n\n');
  }

  var STUDIO_BLANK = {
    title: 'Сума двох чисел', type: 'code', level: 1, edit: 'js',
    description: '**Завдання.** Напишіть функцію `sum(a, b)`, яка повертає суму двох чисел.\n\n**Приклад**\n```js\nsum(2, 3); // 5\n```',
    starter: 'function sum(a, b) {\n  // TODO\n}\n',
    solution: 'function sum(a, b) {\n  return a + b;\n}\n',
    tests: '// test: додає додатні числа\nexpect(sum(2, 3)).toBe(5);\n\n// test: працює з нулем і від\'ємними\nexpect(sum(0, 0)).toBe(0);\nexpect(sum(-1, 1)).toBe(0);\n',
    html: '<div id="app"></div>\n', css: '', hints: 'Скористайтеся оператором +.', explanation: ''
  };

  function viewStudio(view, id) {
    setCrumbs([{ label: 'Головна', href: '#/' }, { label: 'Мої задачі' }]);
    var map = customTasks();
    var ids = Object.keys(map).sort(function (a, b) { return (map[b].updatedAt || 0) - (map[a].updatedAt || 0); });
    var cur = id && map[id] ? map[id] : null;
    var f = cur ? {
      title: cur.title, type: cur.runtime === 'react' && cur.lang === 'tsx' ? 'react-tsx' : cur.runtime === 'ts' || cur.runtime === 'react' || cur.runtime === 'vue' ? cur.runtime : cur.type, level: cur.level, edit: (cur.editable || ['js'])[0],
      description: cur.description, explanation: cur.explanation || '', hints: (cur.hints || []).join('\n'),
      starter: cur.type === 'dom' ? cur[(cur.editable || ['js'])[0]] || '' : cur.starter,
      solution: cur.type === 'dom' ? (cur.solution || {})[(cur.editable || ['js'])[0]] || '' : cur.solution,
      tests: studioTestsText(cur.tests, cur.typeTests), html: cur.html || '', css: cur.css || '', js: cur.js || ''
    } : Object.assign({}, STUDIO_BLANK, { js: '', title: '', description: '', hints: '' });

    view.innerHTML = '<div class="page studio">' +
      '<div class="page-head"><div><h1>Мої задачі</h1><div class="sub">Створюйте власні задачі з тестами: умова, стартовий код, рішення і тести перевіряються тим самим механізмом, що й банк. Задачі зберігаються в браузері і відкриваються як звичайні завдання.</div></div></div>' +
      '<div class="studio-grid"><aside class="card studio-list"><a class="btn sm primary" href="#/studio">' + '+ Нова задача</a>' +
        (ids.length ? ids.map(function (k) {
          return '<a class="studio-row' + (k === id ? ' active' : '') + '" href="#/studio/' + k + '"><b>' + esc(map[k].title) + '</b><span>' + esc(typeLabel(map[k])) + ' · ' + FE.LEVELS[map[k].level].label + '</span></a>';
        }).join('') : '<p class="q-note">Поки порожньо. Заповніть форму праворуч і натисніть «Зберегти».</p>') +
      '</aside><section class="card studio-form">' +
        '<div class="studio-fields"><label>Назва<input id="sf-title" value="' + esc(f.title) + '" placeholder="' + esc(STUDIO_BLANK.title) + '"></label>' +
        '<label>Тип<select id="sf-type"><option value="code"' + (f.type === 'code' ? ' selected' : '') + '>Код (JavaScript)</option><option value="ts"' + (f.type === 'ts' ? ' selected' : '') + '>Код (TypeScript)</option><option value="react"' + (f.type === 'react' ? ' selected' : '') + '>React-компонент</option><option value="react-tsx"' + (f.type === 'react-tsx' ? ' selected' : '') + '>React + TypeScript (TSX)</option><option value="vue"' + (f.type === 'vue' ? ' selected' : '') + '>Vue-компонент (.vue)</option><option value="dom"' + (f.type === 'dom' ? ' selected' : '') + '>DOM / CSS (сторінка)</option></select></label>' +
        '<label>Рівень<select id="sf-level">' + [1, 2, 3, 4].map(function (l) { return '<option value="' + l + '"' + (f.level === l ? ' selected' : '') + '>' + FE.LEVELS[l].label + '</option>'; }).join('') + '</select></label>' +
        '<label class="dom-only">Учень редагує<select id="sf-edit">' + ['js', 'css', 'html'].map(function (x) { return '<option value="' + x + '"' + (f.edit === x ? ' selected' : '') + '>' + FILE_META[x].label + '</option>'; }).join('') + '</select></label></div>' +
        '<label class="studio-block">Умова (markdown)<textarea id="sf-desc" rows="6" placeholder="' + esc(STUDIO_BLANK.description) + '">' + esc(f.description) + '</textarea></label>' +
        '<div class="dom-only studio-pair"><div><div class="studio-cap">index.html (сторінка)</div><div class="studio-ed" id="se-html"></div></div><div><div class="studio-cap">style.css</div><div class="studio-ed" id="se-css"></div></div></div>' +
        '<div class="studio-pair"><div><div class="studio-cap">Стартовий код <span class="dom-only">(файл, який редагує учень)</span></div><div class="studio-ed" id="se-starter"></div></div>' +
        '<div><div class="studio-cap">Еталонне рішення</div><div class="studio-ed" id="se-solution"></div></div></div>' +
        '<div><div class="studio-cap">Тести — кожен починається рядком <code class="ic">// test: назва</code>. Доступні expect, mockFn, useFakeTimers, mockFetch, а для DOM — $, click, input… Для TypeScript ще блоки <code class="ic">// type: назва</code> — перевірка типів (Expect&lt;Equal&lt;A, B&gt;&gt;, // @ts-expect-error). Для React: mount(Компонент, props), act(), typeInto(input, текст), settle()</div><div class="studio-ed tall" id="se-tests"></div></div>' +
        '<div class="studio-pair"><label class="studio-block">Підказки (кожна з нового рядка)<textarea id="sf-hints" rows="3" placeholder="' + esc(STUDIO_BLANK.hints) + '">' + esc(f.hints) + '</textarea></label>' +
        '<label class="studio-block">Пояснення після розв\'язку<textarea id="sf-expl" rows="3">' + esc(f.explanation) + '</textarea></label></div>' +
        '<div class="q-actions"><button class="btn primary" data-action="studioCheck">' + icon('check', 13) + ' Перевірити задачу</button>' +
        '<button class="btn" data-action="studioSave">Зберегти</button>' +
        (cur ? '<a class="btn" href="#/i/' + id + '">' + icon('play', 12) + ' Розв\'язати як учень</a><button class="btn ghost" data-action="studioExport">Експорт .js</button><button class="btn ghost" data-action="studioDelete" style="color:var(--err)">Видалити</button>' : '') +
        '</div><div id="studio-report"></div></section></div></div>';

    var eds = {};
    function mk(elId, value, mode) {
      eds[elId] = CodeMirror($('#' + elId, view), { value: value, mode: mode, lineNumbers: true, tabSize: 2, indentUnit: 2, matchBrackets: true, autoCloseBrackets: true, viewportMargin: Infinity });
    }
    mk('se-html', f.html, 'htmlmixed');
    mk('se-css', f.css, 'css');
    mk('se-starter', f.starter, 'javascript');
    mk('se-solution', f.solution, 'javascript');
    mk('se-tests', f.tests, 'javascript');
    function syncType() {
      var kindNow = $('#sf-type', view).value;
      var isDom = kindNow === 'dom' || kindNow === 'react' || kindNow === 'react-tsx' || kindNow === 'vue';
      $$('.dom-only', view).forEach(function (el) { el.style.display = isDom ? '' : 'none'; });
      var edit = $('#sf-edit', view).value;
      var isTsTask = kindNow === 'ts';
      var isReactTask = kindNow === 'react' || kindNow === 'react-tsx';
      var mode = isTsTask ? 'text/typescript' : kindNow === 'react-tsx' && edit === 'js' ? { name: 'jsx', base: { name: 'javascript', typescript: true } } : isReactTask && edit === 'js' ? 'jsx' : kindNow === 'vue' && edit === 'js' ? 'htmlmixed' : !isDom || edit === 'js' ? 'javascript' : edit === 'css' ? 'css' : 'htmlmixed';
      eds['se-starter'].setOption('mode', mode);
      eds['se-solution'].setOption('mode', mode);
      eds['se-tests'].setOption('mode', isTsTask ? 'text/typescript' : 'javascript');
      Object.keys(eds).forEach(function (k) { eds[k].refresh(); });
    }
    $('#sf-type', view).addEventListener('change', syncType);
    $('#sf-edit', view).addEventListener('change', syncType);
    syncType();

    function build() {
      var kind = $('#sf-type', view).value;
      var type = kind === 'ts' ? 'code' : kind === 'react' || kind === 'react-tsx' || kind === 'vue' ? 'dom' : kind;
      var edit = $('#sf-edit', view).value;
      var item = {
        id: cur ? id : 'my-' + Date.now().toString(36),
        topic: 'my-tasks', group: 'my', type: type, level: Number($('#sf-level', view).value),
        title: $('#sf-title', view).value.trim() || 'Без назви',
        description: $('#sf-desc', view).value,
        hints: $('#sf-hints', view).value.split('\n').map(function (h) { return h.trim(); }).filter(Boolean),
        explanation: $('#sf-expl', view).value,
        tests: parseStudioTests(eds['se-tests'].getValue()),
        updatedAt: Date.now()
      };
      if (kind === 'ts') { item.runtime = 'ts'; item.typeTests = parseStudioTests(eds['se-tests'].getValue(), 'type'); }
      if (kind === 'react' || kind === 'vue') item.runtime = kind;
      if (kind === 'react-tsx') { item.runtime = 'react'; item.lang = 'tsx'; item.typeTests = parseStudioTests(eds['se-tests'].getValue(), 'type'); }
      if (kind === 'vue' && /lang\s*=\s*["']ts["']/.test(eds['se-solution'].getValue())) item.typeTests = parseStudioTests(eds['se-tests'].getValue(), 'type');
      if (type === 'code') {
        item.starter = eds['se-starter'].getValue();
        item.solution = eds['se-solution'].getValue();
      } else {
        item.html = eds['se-html'].getValue();
        item.css = eds['se-css'].getValue();
        item.js = '';
        item.editable = [edit];
        item[edit] = eds['se-starter'].getValue();
        item.solution = {};
        item.solution[edit] = eds['se-solution'].getValue();
      }
      return item;
    }
    function filesOf(item, which) {
      if (item.type === 'code') return { js: which === 'solution' ? item.solution : item.starter };
      var out = { html: item.html, css: item.css, js: item.js || '' };
      var e = item.editable[0];
      out[e] = which === 'solution' ? item.solution[e] : item[e];
      return out;
    }
    var report = $('#studio-report', view);
    ui.actions.studioCheck = function () {
      var item = build();
      if (!item.tests.length && !(item.typeTests || []).length) { report.innerHTML = '<div class="user-error">Додайте хоча б один тест: рядок <b>// test: назва</b>, а під ним код з expect(...).</div>'; return; }
      report.innerHTML = '<p class="q-note">Перевіряю…</p>';
      FERunner.run(item, filesOf(item, 'solution')).then(function (sol) {
        return FERunner.run(item, filesOf(item, 'starter')).then(function (st) {
          var passed = sol.tests.filter(function (t) { return t.pass; }).length;
          var stPassed = st.tests.filter(function (t) { return t.pass; }).length;
          var okSol = sol.status === 'passed';
          var okStarter = st.status !== 'passed';
          report.innerHTML =
            '<div class="test-summary ' + (okSol ? 'ok' : 'err') + '">' + (okSol ? '✓ Рішення проходить усі ' + passed + ' тести' : '✕ Рішення проходить ' + passed + ' з ' + sol.tests.length) + '</div>' +
            (sol.userError ? '<div class="user-error">' + esc(sol.userError.name + ': ' + sol.userError.message) + (sol.userError.line ? ' (рядок ' + sol.userError.line + ')' : '') + '</div>' : '') +
            sol.tests.filter(function (t) { return !t.pass; }).map(function (t) { return '<div class="test-err"><b>' + esc(t.name) + '</b>\n' + esc(t.error ? t.error.message : '') + '</div>'; }).join('') +
            '<div class="test-summary ' + (okStarter ? 'ok' : 'err') + '">' + (okStarter ? '✓ Стартовий код провалює ' + (st.tests.length - stPassed) + ' з ' + st.tests.length + ' тестів — тести справді перевіряють задачу' : '⚠ Стартовий код уже проходить усі тести — тести нічого не перевіряють') + '</div>';
        });
      });
    };
    ui.actions.studioSave = function () {
      var item = build();
      var all = Object.assign({}, customTasks());
      all[item.id] = item;
      Store.setting('customTasks', all);
      registerCustomTasks();
      toast('Збережено');
      if (location.hash !== '#/studio/' + item.id) location.hash = '#/studio/' + item.id;
      else route();
    };
    ui.actions.studioDelete = function () {
      if (!confirm('Видалити задачу «' + cur.title + '»?')) return;
      var all = Object.assign({}, customTasks());
      delete all[id];
      Store.setting('customTasks', all);
      registerCustomTasks();
      location.hash = '#/studio';
    };
    ui.actions.studioExport = function () {
      var item = build();
      delete item.updatedAt;
      var text = '// Задача з «Моїх задач». Щоб додати в банк: перенесіть об\'єкт у items потрібного модуля (data/<module>.js),\n' +
        '// змініть id, topic і group, і перевірте: node tools/validate.js <module>\n' +
        'FE.topic(\'my-tasks\', { items: [' + JSON.stringify(item, null, 2) + '] });\n';
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
      a.download = item.id + '.js';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    };
  }

  // =====================================================================
  //  Підручник
  // =====================================================================
  function bookRead() { return Store.setting('bookRead') || {}; }

  function openGlobalConsole(code) {
    var panel = document.getElementById('global-console');
    if (!panel) return;
    panel.hidden = false;
    if (!ui.globalScratch) ui.globalScratch = mountScratch($('.gc-body', panel), '', { persistent: true });
    if (code) ui.globalScratch.setCode(code);
    ui.globalScratch.refresh();
    if (code) ui.globalScratch.run();
  }

  // Розділ підручника для теми (перший, де тема є в списку topics і текст уже написано).
  function chapterFor(topicId) {
    var primary = null;
    var found = null;
    (FE.bookParts || []).forEach(function (p) {
      p.chapters.forEach(function (c) {
        if (!c.body) return;
        var i = (c.topics || []).indexOf(topicId);
        if (i === 0 && !primary) primary = c;
        if (i !== -1 && !found) found = c;
      });
    });
    return primary || found;
  }
  // Назва кроку завдання — за нею шукаємо підрозділ у підручнику.
  function stepTitle(item) {
    var t = FE.topics[item.topic];
    var g = t && (t.groups || []).filter(function (x) { return x.id === item.group; })[0];
    return g ? g.title : '';
  }
  function normHead(x) { return String(x || '').toLowerCase().replace(/[`*_"'«»()\[\]:.,!?—–-]/g, ' ').replace(/\s+/g, ' ').trim(); }
  // Заголовок h2/h3, що відповідає кроку: точний збіг або один містить інший.
  function findSection(root, title) {
    var want = normHead(title);
    if (!want) return null;
    var heads = $$('h3, h4', root);
    var exact = heads.filter(function (h) { return normHead(h.textContent) === want; })[0];
    if (exact) return exact;
    return heads.filter(function (h) { return headMatches(h.textContent, want); })[0] || null;
  }
  function headMatches(text, want) {
    var n = normHead(text);
    return n === want || (n.length >= 6 && (n.indexOf(want) !== -1 || want.indexOf(n) !== -1));
  }
  function chapterForItem(item) {
    var want = normHead(stepTitle(item));
    var found = null;
    (FE.bookParts || []).forEach(function (p) {
      p.chapters.forEach(function (c) {
        if (found || !c.body || (c.topics || []).indexOf(item.topic) === -1 || !want) return;
        var heads = c.body.match(/^#{2,3} .+$/gm) || [];
        if (heads.some(function (h) { return headMatches(h.replace(/^#+ /, ''), want); })) found = c;
      });
    });
    return found || chapterFor(item.topic);
  }
  // Зміст розділу в «Довіднику», коли точного підрозділу для кроку немає.
  function addRefToc(root) {
    var heads = $$('.book-md h3, .book-md h4', root);
    var md = $('.book-md', root);
    if (heads.length < 3 || !md) return;
    var nav = document.createElement('nav');
    nav.className = 'ref-toc';
    nav.innerHTML = '<b>Зміст розділу</b>' + heads.map(function (h, i) {
      return '<a href="javascript:void 0" data-rh="' + i + '" class="' + (h.tagName === 'H4' ? 'sub' : '') + '">' + esc(h.textContent) + '</a>';
    }).join('');
    nav.addEventListener('click', function (e) {
      var a = e.target.closest('[data-rh]');
      if (!a) return;
      e.preventDefault();
      heads[Number(a.dataset.rh)].scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    md.parentNode.insertBefore(nav, md);
  }
  function scrollToSection(root, title) {
    var h = findSection(root, title);
    if (!h) return false;
    h.classList.add('ref-hit');
    setTimeout(function () { h.scrollIntoView({ block: 'start' }); }, 30);
    return true;
  }

  function viewBook(view, chapterId, section) {
    var ch = chapterId && FE.bookChapters[chapterId];
    if (!ch) return viewBookHome(view);
    var part = FE.bookParts.filter(function (p) { return p.id === ch.part; })[0];
    var idx = part.chapters.indexOf(ch);
    var all = [];
    FE.bookParts.forEach(function (p) { all = all.concat(p.chapters); });
    var gIdx = all.indexOf(ch);
    var prev = all[gIdx - 1];
    var next = all[gIdx + 1];
    var read = bookRead();
    setCrumbs([{ label: 'Головна', href: '#/' }, { label: 'Підручник', href: '#/book' }, { label: part.title, href: '#/book' }, { label: ch.title }]);
    var practice = (ch.topics || []).filter(function (t) { return FE.topics[t]; }).map(function (t) {
      var s = stats(FE.topics[t].items);
      return '<a class="btn sm" href="#/t/' + t + '">' + icon('right', 12) + ' ' + esc(FE.topics[t].short) + ' <span style="color:var(--text-faint)">' + s.solved + '/' + s.total + '</span></a>';
    }).join('');
    view.innerHTML = '<div class="book">' +
      '<aside class="book-toc"><div class="book-toc-part">' + esc(part.title) + '</div>' +
        part.chapters.map(function (c, i) {
          return '<a class="book-toc-ch' + (c === ch ? ' active' : '') + '" href="#/book/' + c.id + '"><span class="n">' + (read[c.id] ? '✓' : i + 1) + '</span>' + esc(c.title) + '</a>';
        }).join('') +
        '<div class="book-toc-sub" id="book-headings"></div></aside>' +
      '<article class="book-article"><div class="lesson-kicker">' + esc(part.title) + ' · розділ ' + (idx + 1) + ' з ' + part.chapters.length + '</div>' +
        '<h1>' + esc(ch.title) + '</h1>' +
        (ch.body ? '<div class="md book-md">' + MD.render(ch.body) + '</div>' : '<div class="empty"><h3>Розділ ще пишеться</h3></div>') +
        '<div class="book-foot" id="book-foot">' +
          '<div class="book-practice"><b>Закріпіть на практиці:</b> ' + (practice || '—') + '</div>' +
          '<div class="next-row">' + (prev ? '<a class="btn" href="#/book/' + prev.id + '">' + icon('left', 14) + ' ' + esc(prev.title) + '</a>' : '<span></span>') +
          (next ? '<a class="btn primary" href="#/book/' + next.id + '">' + esc(next.title) + ' ' + icon('right', 14) + '</a>' : '') + '</div>' +
        '</div></article></div>';
    enhanceCode(view);
    // «▶ У консоль» на прикладах JS
    $$('.book-md .code-block', view).forEach(function (block) {
      var lang = block.getAttribute('data-lang');
      if (lang && !/^(js|javascript)$/i.test(lang)) return;
      if (!lang) return;
      var b = document.createElement('button');
      b.className = 'btn sm ghost try';
      b.type = 'button';
      b.innerHTML = icon('play', 11) + ' У консоль';
      b.addEventListener('click', function () { openGlobalConsole($('pre', block).innerText); });
      block.appendChild(b);
    });
    // Зміст розділу за заголовками
    var heads = $$('.book-md h3, .book-md h4', view);
    $('#book-headings', view).innerHTML = heads.length ? '<div class="book-toc-label">На цій сторінці</div>' + heads.map(function (h, i) {
      h.id = 'h-' + i;
      return '<a href="javascript:void 0" data-h="' + i + '" class="' + (h.tagName === 'H4' ? 'sub' : '') + '">' + esc(h.textContent) + '</a>';
    }).join('') : '';
    $('#book-headings', view).addEventListener('click', function (e) {
      var a = e.target.closest('[data-h]');
      if (!a) return;
      e.preventDefault();
      var h = document.getElementById('h-' + a.dataset.h);
      if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    if (section) scrollToSection(view, section);
    // Дочитали до кінця — позначаємо прочитаним
    if (ch.body && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (en) { return en.isIntersecting; })) {
          var r = Object.assign({}, bookRead());
          if (!r[ch.id]) { r[ch.id] = Date.now(); Store.setting('bookRead', r); }
          io.disconnect();
        }
      });
      io.observe($('#book-foot', view));
      onCleanup(function () { io.disconnect(); });
    }
  }

  function viewBookHome(view) {
    setCrumbs([{ label: 'Головна', href: '#/' }, { label: 'Підручник' }]);
    var read = bookRead();
    view.innerHTML = '<div class="page"><div class="page-head"><div><h1>Підручник</h1>' +
      '<div class="sub">Довідник по темах: коротко, структуровано, з прикладами. Приклади коду запускаються кнопкою «▶ У консоль». Наприкінці кожного розділу — перехід до практики.</div></div></div>' +
      FE.bookParts.map(function (part) {
        var done = part.chapters.filter(function (c) { return read[c.id]; }).length;
        return '<div class="section-block"><h2 class="section-title"><span class="icon">' + esc(part.title.slice(0, 2)) + '</span>' + esc(part.title) +
          '<span class="meta">прочитано ' + done + ' / ' + part.chapters.length + '</span></h2>' +
          '<p style="margin:-4px 0 12px;color:var(--text-dim)">' + esc(part.about) + '</p><div class="item-list">' +
          part.chapters.map(function (c, i) {
            return '<a class="item-row" href="#/book/' + c.id + '"><span class="num">' + (i + 1) + '</span>' +
              '<span class="status-dot ' + (read[c.id] ? 'solved' : '') + '">' + (read[c.id] ? '✓' : '') + '</span>' +
              '<span class="ttl">' + esc(c.title) + '</span>' + (c.body ? '' : '<span class="badge tag">скоро</span>') + '</a>';
          }).join('') + '</div></div>';
      }).join('') + '</div>';
  }

  // =====================================================================
  //  Item view — спільне
  // =====================================================================
  function navContext(item) {
    if (ui.nav && ui.nav.ids.indexOf(item.id) !== -1) return ui.nav;
    var t = topicOf(item);
    return { ids: t.items.map(function (i) { return i.id; }), label: t.short, back: '#/t/' + t.id };
  }

  function itemBarHtml(item, ctx) {
    if (ctx && ctx.playground) {
      return '<div class="item-bar"><span class="title">' + icon('code', 16) + ' Пісочниця</span>' +
        '<span class="seg"><a class="' + (ctx.playground === 'js' ? 'on' : '') + '" href="#/play/js">JavaScript</a><a class="' + (ctx.playground === 'ts' ? 'on' : '') + '" href="#/play/ts">TypeScript</a><a class="' + (ctx.playground === 'web' ? 'on' : '') + '" href="#/play/web">HTML / CSS / JS</a><a class="' + (ctx.playground === 'react' ? 'on' : '') + '" href="#/play/react">React</a><a class="' + (ctx.playground === 'vue' ? 'on' : '') + '" href="#/play/vue">Vue</a></span>' +
        '<span class="grow"></span><span class="pos">код зберігається автоматично</span></div>';
    }
    var s = Store.item(item.id);
    if (ctx && ctx.session) {
      var sess = ctx.session;
      return '<div class="item-bar session-bar">' +
        '<span class="badge" style="color:var(--accent);border-color:var(--accent)">' + icon('mic', 12) + ' Співбесіда</span>' +
        '<span class="pos">Питання ' + (sess.index + 1) + ' з ' + sess.ids.length + '</span>' +
        '<span class="title">' + esc(item.title) + '</span><span class="badges">' + levelBadge(item.level) + '</span>' +
        '<span class="grow"></span><span class="timer" id="iv-timer">' + icon('clock', 13) + ' ' + fmtTime(Date.now() - sess.startedAt) + '</span>' +
        '<button class="btn sm ghost" data-action="ivSkip" title="Пропустити (рахується як 0)">Пропустити</button>' +
        '<button class="btn sm" data-action="ivFinish">Завершити</button></div>';
    }
    var nav = navContext(item);
    var idx = nav.ids.indexOf(item.id);
    var t = topicOf(item);
    return '<div class="item-bar">' +
      '<a class="icon-btn" href="' + (nav.back || '#/t/' + t.id) + '" title="До списку: ' + esc(nav.label) + '" aria-label="Назад до списку">' + icon('back', 16) + '</a>' +
      (groupOf(item) ? '<span class="step-label" title="' + esc(groupOf(item).title) + '">Крок ' + groupNumber(item) + '</span>' : '') +
      '<span class="title" title="' + esc(item.title) + '">' + esc(item.title) + '</span>' +
      '<span class="badges">' + levelBadge(item.level) + starBadge(item) + '</span>' +
      '<span class="grow"></span>' +
      (chapterFor(item.topic) ? '<button class="btn sm ghost" data-action="openReference" title="Розділ підручника з цієї теми — не виходячи із задачі">' + icon('book', 14) + '<span class="desktop-only"> Довідник</span></button>' : '') +
      '<button class="icon-btn' + (s.rep ? ' active' : '') + '" data-action="toggleRepeat" title="' + (s.rep ? 'Прибрати з повторення' : 'Додати на повторення') + '" aria-label="На повторення">' + icon(s.rep ? 'bookmarkFill' : 'bookmark', 16) + '</button>' +
      '<span class="pos">' + (idx + 1) + ' / ' + nav.ids.length + '</span>' +
      '<span class="nav"><button class="icon-btn" data-action="prevItem" ' + (idx <= 0 ? 'disabled' : '') + ' title="Попереднє (Alt+←)" aria-label="Попереднє">' + icon('left', 16) + '</button>' +
      '<button class="icon-btn" data-action="nextItem" ' + (idx >= nav.ids.length - 1 ? 'disabled' : '') + ' title="Наступне (Alt+→)" aria-label="Наступне">' + icon('right', 16) + '</button></span>' +
      '</div>';
  }

  function goSibling(item, dir) {
    var nav = navContext(item);
    var idx = nav.ids.indexOf(item.id);
    var next = nav.ids[idx + dir];
    if (next) location.hash = '#/i/' + next;
    else if (dir > 0) {
      // кінець теми → наступна тема
      var tIdx = FE.topicOrder.indexOf(item.topic);
      var nt = FE.topicOrder[tIdx + 1];
      if (nt && (!ui.nav || ui.nav.label === topicOf(item).short)) {
        toast('Тему завершено! Переходимо до наступної.');
        location.hash = '#/t/' + nt;
      }
    }
  }

  function nextLabel(item) {
    var nav = navContext(item);
    var idx = nav.ids.indexOf(item.id);
    return idx < nav.ids.length - 1 ? 'Наступне завдання' : 'До наступної теми';
  }

  function viewItem(view, item, ctx) {
    var t = topicOf(item);
    var sec = trackOf(t.section);
    if (!ctx || !ctx.session) {
      setCrumbs(sec
        ? [{ label: 'Головна', href: '#/' }, { label: sec.title, href: '#/track/' + sec.id }, { label: t.short, href: '#/t/' + t.id }, { label: item.title }]
        : [{ label: 'Головна', href: '#/' }, { label: t.short, href: t.id === 'my-tasks' ? '#/studio' : '#/t/' + t.id }, { label: item.title }]);
      Store.setLastItem(item.id);
    }
    ui.actions.toggleRepeat = function () {
      var s = Store.toggleRepeat(item.id);
      toast(s.rep ? 'Додано на повторення' : 'Прибрано з повторення');
      var btn = $('[data-action="toggleRepeat"]', view);
      if (btn) {
        btn.classList.toggle('active', !!s.rep);
        btn.innerHTML = icon(s.rep ? 'bookmarkFill' : 'bookmark', 16);
      }
    };
    ui.actions.prevItem = function () { goSibling(item, -1); };
    ui.actions.openReference = function () {
      var ch = chapterForItem(item);
      if (!ch) return;
      openModal('<div class="lesson-modal"><div class="lesson-kicker">Довідник</div><h1>' + esc(ch.title) + '</h1><div class="md book-md">' + MD.render(ch.body) + '</div></div>' +
        '<div class="actions"><a class="btn ghost" href="#/book/' + ch.id + '/' + encodeURIComponent(stepTitle(item)) + '" data-close>Відкрити в підручнику</a><button class="btn primary" data-close>До завдання</button></div>', function (root) { enhanceCode(root); if (!scrollToSection(root, stepTitle(item))) addRefToc(root); });
    };
    ui.actions.openLesson = function () { openModal('<div class="lesson-modal">' + lessonHtml(item) + '</div><div class="actions"><button class="btn primary" data-close>До завдання</button></div>', function (root) { enhanceCode(root); }); };
    ui.actions.nextItem = function () { goSibling(item, 1); };
    ui.currentItem = item;
    onCleanup(function () { ui.currentItem = null; });
    if (item.type === 'code' || item.type === 'dom') return renderCodeItem(view, item, ctx);
    if (item.type === 'quiz') return renderQuiz(view, item, ctx);
    return renderTheory(view, item, ctx);
  }

  // Кнопки копіювання в блоках коду
  function enhanceCode(root) {
    $$('.code-block', root).forEach(function (block) {
      if ($('.copy', block)) return;
      var b = document.createElement('button');
      b.className = 'btn sm ghost copy';
      b.type = 'button';
      b.title = 'Скопіювати';
      b.innerHTML = icon('copy', 13);
      b.addEventListener('click', function () {
        var text = $('pre', block).innerText;
        // Без сповіщень: іконка на мить стає ✓ (або ✕ при помилці).
        var flash = function (name) {
          b.innerHTML = icon(name, 13);
          setTimeout(function () { b.innerHTML = icon('copy', 13); }, 1200);
        };
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          flash('check');
        }, function () {
          flash('x');
        });
      });
      block.appendChild(b);
    });
  }

  function metaHtml(item) {
    return '<div class="desc-meta">' + levelBadge(item.level) + typeBadge(item) + starBadge(item) +
      (item.tags || []).map(function (t) { return '<span class="badge tag">#' + esc(t) + '</span>'; }).join('') + '</div>';
  }

  // =====================================================================
  //  Code / DOM item
  // =====================================================================
  var FILE_META = {
    html: { label: 'index.html', mode: 'htmlmixed' },
    css: { label: 'style.css', mode: 'css' },
    js: { label: 'script.js', mode: 'javascript' }
  };

  function renderCodeItem(view, item, ctx) {
    var session = ctx && ctx.session;
    var saved = Store.item(item.id);
    var isDom = item.type === 'dom';
    var rt = FERunner.runtimes[item.runtime || item.type] || {};
    var isTs = item.runtime === 'ts';
    // React + TS (lang: 'tsx') і Vue з lang="ts": код учня додатково перевіряє tsc.
    var typedInfo = rt.typed ? rt.typed(item) : null;
    var fileMeta = function (f) {
      if (!rt.fileLabel || f !== 'js') return FILE_META[f];
      return { label: (typedInfo && typedInfo.fileLabel) || rt.fileLabel, mode: (typedInfo && typedInfo.mode) || rt.mode || 'javascript' };
    };
    var previewToken = 0;
    var typeTitle = isTs ? 'Типи: код компілюється без помилок (strict)' : typedInfo ? typedInfo.title : null;
    var allTests = typeTitle
      ? [{ name: typeTitle, code: '// tsc --strict' }]
        .concat((item.typeTests || []).map(function (t) { return { name: 'Типи: ' + t.name, code: t.code }; }), item.tests || [])
      : item.tests;
    var editable = isDom ? item.editable : ['js'];
    var files = isDom ? ['html', 'css', 'js'].filter(function (f) { return editable.indexOf(f) !== -1 || (item[f] || '').trim(); }) : ['js'];
    var starter = function (f) { return isDom ? item[f] || '' : item.starter || ''; };
    var initial = function (f) {
      if (session) return starter(f);
      var code = saved.code || {};
      return typeof code[f] === 'string' ? code[f] : starter(f);
    };
    var group = groupOf(item);
    var st = {
      leftTab: 'desc',
      bottomTab: isDom ? 'preview' : 'console',
      playground: ctx && ctx.playground,
      activeFile: editable[0],
      result: null,
      running: false,
      console: [],
      history: [],
      historyPos: -1,
      hints: session ? 0 : saved.hints || 0,
      solUnlocked: !session && (saved.best === 'solved' || !!saved.sol),
      previewJs: starter('js'),
      errorMark: null,
      session: null,
      focus: !!(ctx && ctx.playground)
    };

    view.className = 'view no-scroll';
    var split = Store.setting('split') || 0.42;
    var bottomH = Store.setting('bottom') || 0.38;
    view.innerHTML = itemBarHtml(item, ctx) +
      '<div class="split" id="split">' +
        '<section class="pane pane-left" id="pane-left" style="width:' + (split * 100).toFixed(2) + '%">' +
          '<div class="tabs" id="left-tabs"></div><div class="desc-scroll" id="left-body"></div></section>' +
        '<div class="gutter-x" id="gutter-x" role="separator" aria-orientation="vertical" title="Перетягніть, щоб змінити ширину"></div>' +
        '<section class="pane pane-right" id="pane-right">' +
          '<div class="editor-head"><div class="tabs" id="file-tabs"></div><div class="editor-tools">' +
            (session ? '<button class="btn sm" data-action="ivSubmitCode" title="Зарахувати поточний результат і перейти далі">' + icon('flag', 13) + ' Здати</button>' : '') +
            '<button class="btn sm ghost" data-action="resetCode" title="Повернути стартовий код">' + icon('reset', 13) + '<span class="desktop-only"> Скинути</span></button>' +
            '<button class="btn sm" data-action="exec" id="exec-btn" title="Виконати код і показати результат у консолі (Ctrl+\')">' + icon('play', 12) + ' Запустити</button>' +
            (ctx && ctx.playground ? '' : '<button class="btn sm primary" data-action="run" id="run-btn" title="Перевірити рішення тестами (Ctrl+Enter)">' + icon('check', 13) + ' Перевірити <kbd class="desktop-only">Ctrl ↵</kbd></button>') +
          '</div></div>' +
          '<div class="editor-wrap" id="editor-wrap"></div>' +
          '<div class="editor-status" id="editor-status"></div>' +
          '<div class="gutter-y" id="gutter-y" role="separator" aria-orientation="horizontal"></div>' +
          '<div class="bottom" id="bottom" style="height:' + (bottomH * 100).toFixed(2) + '%"><div class="tabs" id="bottom-tabs"></div>' +
            '<div class="bottom-body" id="bottom-body"><div id="bottom-content" class="bottom-content"></div>' +
            (isDom ? '<div id="preview-wrap" class="preview-wrap"></div>' : '') + '</div></div>' +
        '</section>' +
      '</div>';

    // ---------------- editor
    var docs = {};
    files.forEach(function (f) { docs[f] = CodeMirror.Doc(initial(f), fileMeta(f).mode); });
    function hintFor(c) {
      var mode = c.getDoc().getMode().name;
      if (mode === 'css') return CodeMirror.hint.css;
      if (mode === 'htmlmixed' || mode === 'xml') return CodeMirror.hint.html;
      return function (cm2, opts) {
        var a = (CodeMirror.hint.javascript && CodeMirror.hint.javascript(cm2, opts)) || { list: [] };
        var b = (CodeMirror.hint.anyword && CodeMirror.hint.anyword(cm2, opts)) || { list: [] };
        var seen = {};
        var list = [];
        a.list.concat(b.list).forEach(function (w) {
          var key = typeof w === 'string' ? w : w.text;
          if (!seen[key]) { seen[key] = true; list.push(w); }
        });
        return { list: list, from: a.from || b.from, to: a.to || b.to };
      };
    }
    function showHint(c) {
      if (!c.showHint || c.getOption('readOnly')) return;
      c.showHint({ hint: hintFor(c), completeSingle: false });
    }
    var cm = CodeMirror($('#editor-wrap', view), {
      value: docs[st.activeFile],
      lineNumbers: true,
      tabSize: 2,
      indentUnit: 2,
      indentWithTabs: false,
      matchBrackets: true,
      autoCloseBrackets: true,
      autoCloseTags: true,
      styleActiveLine: true,
      lineWrapping: !!Store.setting('wrap'),
      viewportMargin: 50,
      extraKeys: {
        'Ctrl-Enter': function () { if (st.playground) exec(); else run(); },
        'Cmd-Enter': function () { if (st.playground) exec(); else run(); },
        "Ctrl-'": function () { exec(); },
        "Cmd-'": function () { exec(); },
        'Ctrl-Space': function (c) { showHint(c); },
        'Ctrl-/': 'toggleComment',
        'Cmd-/': 'toggleComment',
        'Ctrl-S': function () { save(); toast('Збережено', 'ok'); },
        'Cmd-S': function () { save(); toast('Збережено', 'ok'); },
        Tab: function (c) {
          if (c.somethingSelected()) c.execCommand('indentMore');
          else c.replaceSelection('  ', 'end');
        },
        'Shift-Tab': 'indentLess'
      }
    });
    cm.swapDoc(docs[st.activeFile]);
    cm.setOption('readOnly', editable.indexOf(st.activeFile) === -1);
    // Автопідказки під час набору (як в IDE): після «.» або 2+ літер ідентифікатора.
    cm.on('inputRead', function (c, change) {
      if (change.origin !== '+input' || c.state.completionActive) return;
      var ch = change.text[0];
      if (!/^[\w.$-]$/.test(ch)) return;
      var cur = c.getCursor();
      var token = c.getTokenAt(cur);
      if (ch === '.' || /^[\w$-]{2,}$/.test(token.string)) showHint(c);
    });
    var readonlyNote = document.createElement('div');
    readonlyNote.className = 'readonly-note';
    readonlyNote.textContent = 'лише для читання';
    $('#editor-wrap', view).appendChild(readonlyNote);
    function updateReadonlyNote() { readonlyNote.style.display = editable.indexOf(st.activeFile) === -1 ? '' : 'none'; }
    updateReadonlyNote();

    function renderStatus() {
      var cur = cm.getCursor();
      $('#editor-status', view).innerHTML =
        '<span>Рядок ' + (cur.line + 1) + ', стовпець ' + (cur.ch + 1) + '</span>' +
        '<span class="grow"></span>' +
        '<span class="hint-key desktop-only"><kbd>Ctrl</kbd>+<kbd>Space</kbd> підказки</span>' +
        '<button class="ed-btn" data-action="fontDown" title="Зменшити шрифт">A−</button>' +
        '<button class="ed-btn" data-action="fontUp" title="Збільшити шрифт">A+</button>' +
        '<button class="ed-btn' + (Store.setting('wrap') ? ' on' : '') + '" data-action="toggleWrap" title="Перенесення довгих рядків">⏎ перенос</button>' +
        (st.playground ? '' : '<button class="ed-btn desktop-only' + (st.focus ? ' on' : '') + '" data-action="toggleFocus" title="Сховати умову — більше місця для коду">⛶ фокус</button>');
    }
    cm.on('cursorActivity', renderStatus);
    ui.actions.fontDown = function () { setFont(-1); };
    ui.actions.fontUp = function () { setFont(1); };
    function setFont(d) {
      var size = Math.max(11, Math.min(22, (Store.setting('fontSize') || 14) + d));
      Store.setting('fontSize', size);
      applyTheme();
      cm.refresh();
    }
    ui.actions.toggleWrap = function () {
      Store.setting('wrap', !Store.setting('wrap'));
      cm.setOption('lineWrapping', !!Store.setting('wrap'));
      renderStatus();
    };
    ui.actions.toggleFocus = function () {
      st.focus = !st.focus;
      $('#split', view).classList.toggle('focus', st.focus);
      renderStatus();
      cm.refresh();
    };

    function currentFiles() {
      var out = {};
      ['html', 'css', 'js'].forEach(function (f) {
        out[f] = docs[f] ? docs[f].getValue() : isDom ? item[f] || '' : '';
      });
      return out;
    }
    function save() {
      if (session) return;
      var code = {};
      editable.forEach(function (f) { code[f] = docs[f].getValue(); });
      Store.patch(item.id, { code: code }, true);
    }
    var saveLater = debounce(save, 400);
    var previewLater = debounce(function () { renderPreview(); }, 500);
    cm.on('change', function () {
      saveLater();
      clearErrorMark();
      if (isDom && st.activeFile !== 'js') previewLater();
    });
    onCleanup(function () {
      saveLater.cancel();
      save();
      previewLater.cancel();
      if (st.session) st.session.terminate();
    });

    function clearErrorMark() {
      if (st.errorMark) {
        try { st.errorMark.doc.removeLineClass(st.errorMark.line, 'background', 'cm-error-line'); } catch (e) { /* noop */ }
        st.errorMark = null;
      }
    }
    function markError(line) {
      clearErrorMark();
      var doc = docs.js;
      if (!doc || !line || line < 1 || line > doc.lineCount()) return;
      doc.addLineClass(line - 1, 'background', 'cm-error-line');
      st.errorMark = { doc: doc, line: line - 1 };
    }

    // ---------------- file tabs
    function renderFileTabs() {
      $('#file-tabs', view).innerHTML = files.map(function (f) {
        var ro = editable.indexOf(f) === -1;
        return '<button class="tab' + (st.activeFile === f ? ' active' : '') + '" data-action="fileTab" data-file="' + f + '">' + fileMeta(f).label + (ro ? ' <span class="lock" title="лише для читання">🔒</span>' : '') + '</button>';
      }).join('');
    }
    ui.actions.fileTab = function (el) {
      st.activeFile = el.dataset.file;
      cm.swapDoc(docs[st.activeFile]);
      cm.setOption('readOnly', editable.indexOf(st.activeFile) === -1);
      updateReadonlyNote();
      renderFileTabs();
      renderStatus();
      cm.focus();
    };

    // ---------------- left pane
    function renderLeftTabs() {
      var total = (item.hints || []).length;
      $('#left-tabs', view).innerHTML =
        '<button class="tab' + (st.leftTab === 'desc' ? ' active' : '') + '" data-action="leftTab" data-tab="desc">Умова</button>' +
        '<button class="tab' + (st.leftTab === 'hints' ? ' active' : '') + '" data-action="leftTab" data-tab="hints">' + icon('bulb', 13) + ' Підказки <span class="n">' + st.hints + '/' + total + '</span></button>' +
        '<button class="tab' + (st.leftTab === 'solution' ? ' active' : '') + '" data-action="leftTab" data-tab="solution">Рішення' + (st.solUnlocked ? '' : ' <span class="lock">🔒</span>') + '</button>';
    }
    ui.actions.leftTab = function (el) { st.leftTab = el.dataset.tab; renderLeft(); };

    function checksHtml() {
      return '<details class="checks"><summary>' + icon('check', 13) + ' Як перевірятиметься — ' + item.tests.length + ' ' + plural(item.tests.length, 'тест', 'тести', 'тестів') + ' (приклади викликів)</summary><ol>' +
        item.tests.map(function (t) {
          return '<li><div class="check-name">' + esc(t.name) + '</div><pre class="code cm-s-fe"><code>' + MD.highlight(t.code, 'js') + '</code></pre></li>';
        }).join('') + '</ol></details>';
    }

    function renderLeft() {
      renderLeftTabs();
      var body = $('#left-body', view);
      var html = '';
      if (st.leftTab === 'desc') {
        html = '<h1>' + esc(item.title) + '</h1>' + metaHtml(item) + '<div class="md">' + MD.render(item.description) + '</div>';
        if (isDom) {
          html += '<p class="files-note">Редагуються: ' + editable.map(function (f) { return '<code class="ic">' + fileMeta(f).label + '</code>'; }).join(', ') +
            '. «Запустити» оновлює перегляд, «Перевірити» запускає тести у вікні 800×600.</p>';
        }
        html += docsHtml(item.topic, stepTitle(item));
        html += '<div class="desc-actions">' +
          ((item.hints || []).length ? '<button class="btn sm" data-action="leftTab" data-tab="hints">' + icon('bulb', 13) + ' Підказка</button>' : '') + '</div>';
      } else if (st.leftTab === 'lesson') {
        html = lessonHtml(item);
      } else if (st.leftTab === 'hints') {
        var hints = item.hints || [];
        html = '<p class="hint-intro">Підказки відкриваються по одній — від натяку до майже готового рішення.</p>';
        for (var i = 0; i < st.hints && i < hints.length; i++) {
          html += '<div class="hint-box"><div class="hint-head">' + icon('bulb', 13) + ' Підказка ' + (i + 1) + '</div><div class="md">' + MD.render(hints[i]) + '</div></div>';
        }
        if (st.hints < hints.length) {
          html += '<button class="btn" data-action="nextHint">' + icon('bulb', 14) + ' Показати підказку ' + (st.hints + 1) + ' з ' + hints.length + '</button>';
        } else {
          html += '<p class="hint-intro" style="margin-top:14px">Підказки закінчились. ' + (st.solUnlocked ? 'Розбір — на вкладці «Рішення».' : 'Якщо все ще складно — відкрийте рішення й розберіть його.') + '</p>';
        }
      } else {
        if (!st.solUnlocked) {
          html = '<div class="locked">' + icon('bookmark', 22) + '<p><b>Рішення відкриється, коли всі тести пройдуть.</b></p>' +
            '<p>Спершу спробуйте поступові підказки — так ви навчитесь значно більше.</p>' +
            (session ? '<p>Під час співбесіди рішення недоступне.</p>' : '<button class="btn" data-action="unlockSolution">Все одно показати рішення</button>') + '</div>';
        } else {
          html = '<h1>Розбір рішення</h1>';
          if (item.explanation) html += '<div class="md">' + MD.render(item.explanation) + '</div>';
          html += '<h3 style="margin:20px 0 8px">Еталонне рішення</h3>';
          if (isDom) {
            Object.keys(item.solution).forEach(function (f) {
              html += '<div class="md"><p><code class="ic">' + FILE_META[f].label + '</code></p><div class="code-block"><pre class="cm-s-fe"><code>' + MD.highlight(item.solution[f], f === 'js' ? 'js' : f) + '</code></pre></div></div>';
            });
          } else {
            html += '<div class="md"><div class="code-block"><pre class="cm-s-fe"><code>' + MD.highlight(item.solution, 'js') + '</code></pre></div></div>';
          }
          if (!session) html += '<p><button class="btn sm" data-action="insertSolution">Вставити рішення в редактор</button></p>';
        }
      }
      body.innerHTML = html;
      body.scrollTop = 0;
      enhanceCode(body);
    }
    ui.actions.nextHint = function () {
      st.hints = Math.min((item.hints || []).length, st.hints + 1);
      if (!session) Store.patch(item.id, { hints: st.hints }, true);
      renderLeft();
    };
    ui.actions.unlockSolution = function () {
      if (!confirm('Відкрити еталонне рішення? Спробуйте спершу підказки — так ви запам\'ятаєте більше.')) return;
      st.solUnlocked = true;
      Store.patch(item.id, { sol: true });
      renderLeft();
    };
    ui.actions.insertSolution = function () {
      if (!confirm('Замінити ваш код еталонним рішенням?')) return;
      if (isDom) Object.keys(item.solution).forEach(function (f) { docs[f].setValue(item.solution[f]); });
      else docs.js.setValue(item.solution);
      save();
    };
    ui.actions.resetCode = function () {
      if (!confirm('Повернути стартовий код? Ваші зміни буде втрачено.')) return;
      editable.forEach(function (f) { docs[f].setValue(starter(f)); });
      save();
      toast('Код скинуто');
    };

    // ---------------- bottom panel
    function renderBottomTabs() {
      var r = st.result;
      var passed = r ? r.tests.filter(function (t) { return t.pass; }).length : 0;
      var cls = r ? (r.status === 'passed' ? 'ok' : 'err') : '';
      var errs = st.console.filter(function (l) { return l.kind === 'err' || l.level === 'error'; }).length;
      var status = '';
      if (st.running) status = '<span class="run-status">Перевіряю…</span>';
      else if (r) status = '<span class="run-status ' + cls + '">' + (r.status === 'passed' ? icon('check', 13) + ' Усі тести пройдено' : r.status === 'error' ? 'Синтаксична помилка' : r.status === 'timeout' ? 'Таймаут' : passed + ' / ' + r.tests.length + ' тестів') + ' · ' + r.durationMs + ' мс</span>';
      $('#bottom-tabs', view).innerHTML = (st.playground ? '' :
        '<button class="tab' + (st.bottomTab === 'tests' ? ' active' : '') + '" data-action="bottomTab" data-tab="tests">Тести <span class="n ' + cls + '">' + (r ? passed + '/' : '') + allTests.length + '</span></button>') +
        '<button class="tab' + (st.bottomTab === 'console' ? ' active' : '') + '" data-action="bottomTab" data-tab="console">Консоль' + (st.console.length ? ' <span class="n' + (errs ? ' err' : '') + '">' + st.console.length + '</span>' : '') + '</button>' +
        (isDom ? '<button class="tab' + (st.bottomTab === 'preview' ? ' active' : '') + '" data-action="bottomTab" data-tab="preview">Перегляд</button>' : '') +
        status;
    }
    ui.actions.bottomTab = function (el) { st.bottomTab = el.dataset.tab; renderBottom(); if (st.bottomTab === 'console') focusConsole(); };

    function testHtml(t, i, open) {
      var cls = t.pass === true ? 'pass' : t.pass === false ? (t.error && t.error.skipped ? 'skip' : 'fail') : 'pending';
      var sym = t.pass === true ? '✓' : t.pass === false ? (t.error && t.error.skipped ? '–' : '✕') : '';
      var err = t.error && t.pass === false
        ? '<div class="test-err">' + esc(t.error.name === 'AssertionError' ? t.error.message : t.error.name + ': ' + t.error.message) + (t.error.stack ? '<span class="stack">' + esc(t.error.stack) + '</span>' : '') + '</div>'
        : '';
      return '<div class="test ' + cls + (open ? ' open' : '') + '" data-i="' + i + '"><div class="test-head" data-action="toggleTest"><span class="test-ico">' + sym + '</span><span class="name">' + esc(t.name) + '</span>' +
        (t.ms ? '<span class="ms">' + t.ms + ' мс</span>' : '') + '</div>' +
        '<div class="test-body">' + err + '<details class="test-code"><summary>код тесту</summary><pre class="code cm-s-fe"><code>' + MD.highlight(t.code, isTs ? 'ts' : 'js') + '</code></pre></details></div></div>';
    }
    ui.actions.toggleTest = function (el) { el.parentNode.classList.toggle('open'); };

    function renderTests() {
      var r = st.result;
      var html = '<div class="tests">';
      if (!r) {
        html += '<div class="test-summary idle">' + icon('check', 13) + '<span>«Перевірити» (<kbd>Ctrl</kbd>+<kbd>Enter</kbd>) запускає ці тести. Щоб просто подивитися, що робить ваш код, — «Запустити» і консоль.</span></div>';
        html += allTests.map(function (t, i) { return testHtml({ name: t.name, code: t.code, pass: null }, i, false); }).join('');
      } else {
        var passed = r.tests.filter(function (t) { return t.pass; }).length;
        if (r.status === 'passed') {
          html += '<div class="success-panel"><h4>' + icon('check', 15) + ' Чудово! Усі ' + r.tests.length + ' ' + plural(r.tests.length, 'тест', 'тести', 'тестів') + ' пройдено</h4>' +
            '<p>Перегляньте розбір: складність, альтернативи та що можуть спитати далі.</p><div class="row">' +
            '<button class="btn sm" data-action="showSolution">Розбір і рішення</button>' +
            (session ? '<button class="btn sm primary" data-action="ivSubmitCode">Наступне питання ' + icon('right', 12) + '</button>' : '<button class="btn sm primary" data-action="nextItem">' + nextLabel(item) + ' ' + icon('right', 12) + '</button>') +
            '</div></div>';
        } else {
          html += '<div class="test-summary err"><span class="grow">' + (r.status === 'error' ? 'Код не виконався через синтаксичну помилку' : r.status === 'timeout' ? 'Виконання перервано за таймаутом' : 'Пройдено ' + passed + ' з ' + r.tests.length) + '</span></div>';
        }
        if (r.userError) html += userErrorHtml(r.userError);
        var firstFail = -1;
        r.tests.forEach(function (t, i) { if (firstFail === -1 && t.pass === false && !(t.error && t.error.skipped)) firstFail = i; });
        html += r.tests.map(function (t, i) { return testHtml(t, i, i === firstFail); }).join('');
      }
      return html + '</div>';
    }
    function userErrorHtml(ue) {
      return '<div class="user-error"><b>' + (ue.syntax ? 'Синтаксична помилка' : ue.name === 'Timeout' ? 'Таймаут' : 'Помилка під час виконання коду') + (ue.line ? ' — рядок ' + ue.line : '') + '</b>\n' + esc(ue.name + ': ' + ue.message) + (ue.stack ? '\n' + esc(ue.stack) : '') + '</div>';
    }
    ui.actions.showSolution = function () { st.solUnlocked = true; st.leftTab = 'solution'; renderLeft(); };

    // ---------------- console
    var exampleCall = (function () {
      var src = isDom ? '' : item.starter || '';
      var fn = src.match(/^\s*(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/m) || src.match(/^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/m);
      if (fn) return fn[1] + '(…)';
      var cls = src.match(/^\s*class\s+([A-Za-z_$][\w$]*)/m);
      if (cls) return 'new ' + cls[1] + '(…)';
      var obj = src.match(/^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/m);
      if (obj) return obj[1];
      return isDom ? 'document.querySelector(\'…\')' : '';
    })();
    function consoleLine(e) {
      var cls = 'log ' + (e.kind === 'in' ? 'in' : e.kind === 'out' ? 'out' : e.kind === 'err' ? 'error' : e.kind === 'info' ? 'info' : esc(e.level || 'log'));
      var pfx = e.kind === 'in' ? '›' : e.kind === 'out' ? '‹' : e.kind === 'info' ? '' : e.level === 'warn' ? '⚠' : e.level === 'error' ? '✕' : '';
      return '<div class="' + cls + '"><span class="lv">' + pfx + '</span><span class="txt">' + esc(e.text) + '</span></div>';
    }
    function renderConsole() {
      var empty = !st.console.length
        ? '<div class="console-empty">Тут з\'являється вивід <code class="ic">console.log</code>.<br>«Запустити» (<kbd>Ctrl</kbd>+<kbd>\'</kbd>) виконує ваш код, а нижче можна вводити вирази й викликати свої функції' + (exampleCall ? ', наприклад <code class="ic">' + esc(exampleCall) + '</code>' : '') + '.</div>'
        : '';
      return '<div class="console" id="console-out">' + empty + st.console.map(consoleLine).join('') + '</div>' +
        '<div class="console-input"><span class="prompt">›</span><input id="console-in" type="text" spellcheck="false" autocomplete="off" placeholder="Введіть вираз і натисніть Enter' + (exampleCall && !isDom ? ', напр. ' + esc(exampleCall) : '') + '">' +
        '<button class="btn sm ghost" data-action="clearConsole" title="Очистити консоль">Очистити</button></div>';
    }
    function pushConsole(entry) {
      st.console.push(entry);
      if (st.console.length > 500) st.console.shift();
      if (st.bottomTab === 'console') {
        var out = $('#console-out', view);
        if (out) {
          var emptyEl = $('.console-empty', out);
          if (emptyEl) emptyEl.remove();
          out.insertAdjacentHTML('beforeend', consoleLine(entry));
          out.scrollTop = out.scrollHeight;
        }
      }
      renderBottomTabs();
    }
    function focusConsole() {
      var inp = $('#console-in', view);
      if (inp) inp.focus();
    }
    ui.actions.clearConsole = function () { st.console = []; renderBottom(); focusConsole(); };

    function bindConsoleInput() {
      var inp = $('#console-in', view);
      if (!inp) return;
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && inp.value.trim()) {
          e.preventDefault();
          var code = inp.value;
          st.history.push(code);
          st.historyPos = st.history.length;
          inp.value = '';
          evalInConsole(code);
        } else if (e.key === 'ArrowUp' && st.history.length) {
          e.preventDefault();
          st.historyPos = Math.max(0, st.historyPos - 1);
          inp.value = st.history[st.historyPos] || '';
        } else if (e.key === 'ArrowDown' && st.history.length) {
          e.preventDefault();
          st.historyPos = Math.min(st.history.length, st.historyPos + 1);
          inp.value = st.history[st.historyPos] || '';
        }
      });
    }

    function startSession() {
      // JS: новий worker з поточним кодом; DOM: перезавантажити перегляд з поточним JS.
      var filesNow = currentFiles();
      if (isDom) {
        st.previewJs = filesNow.js;
        renderPreview();
        return new Promise(function (r) { setTimeout(function () { r({ ok: true }); }, 150); });
      }
      if (st.session) st.session.terminate();
      st.session = (rt.createSession || FERunner.createCodeSession)(filesNow.js, {
        onLog: function (m) { pushConsole({ kind: 'log', level: m.level, text: m.text || '' }); },
        onError: function (err) {
          pushConsole({ kind: 'err', text: (err.line ? 'Рядок ' + err.line + ': ' : '') + err.name + ': ' + err.message });
          if (err.line) markError(err.line);
        },
        onLate: function (m) {
          pushConsole(m.error ? { kind: 'err', text: (m.prefix || '') + m.error.name + ': ' + m.error.message } : { kind: 'out', text: m.text });
        }
      });
      return st.session.started.then(function (res) {
        if (!res.ok && res.error) {
          pushConsole({ kind: 'err', text: (res.error.line ? 'Рядок ' + res.error.line + ': ' : '') + res.error.name + ': ' + res.error.message });
          if (res.error.line) markError(res.error.line);
        }
        return res;
      });
    }

    function exec() {
      save();
      st.console = [];
      st.bottomTab = isDom ? st.bottomTab === 'preview' ? 'preview' : 'console' : 'console';
      renderBottom();
      pushConsole({ kind: 'info', text: '▶ Код виконано' + (isDom ? ' — перегляд оновлено' : '') + '. Вводьте вирази нижче.' });
      startSession().then(function () { if (st.bottomTab === 'console') focusConsole(); });
    }
    ui.actions.exec = exec;
    ui.execCurrent = exec;
    onCleanup(function () { ui.execCurrent = null; });

    var evalSeq = 0;
    var domPending = {};
    function evalInConsole(code) {
      pushConsole({ kind: 'in', text: code });
      var go = function () {
        if (isDom) {
          if (!previewFrame || !previewFrame.contentWindow) return Promise.resolve({ error: { name: 'Error', message: 'Перегляд ще не завантажився' } });
          var id = ++evalSeq;
          return new Promise(function (resolve) {
            var t = setTimeout(function () { delete domPending[id]; resolve({ error: { name: 'Timeout', message: 'Немає відповіді від сторінки' } }); }, 3000);
            domPending[id] = function (m) { clearTimeout(t); resolve(m); };
            previewFrame.contentWindow.postMessage({ type: 'eval', to: previewId, id: id, code: FERunner.instrumentLoops(code) }, '*');
          });
        }
        return st.session.eval(code);
      };
      var ready = isDom || (st.session && !st.session.isDead()) ? Promise.resolve() : startSession();
      ready.then(go).then(function (m) {
        if (m.error) pushConsole({ kind: 'err', text: m.error.name + ': ' + m.error.message });
        else pushConsole({ kind: 'out', text: m.text });
      });
    }

    // ---------------- preview (DOM)
    var previewId = 'preview_' + Date.now();
    var previewFrame = null;
    function renderPreview() {
      if (!isDom) return;
      var wrap = $('#preview-wrap', view);
      if (!wrap) return;
      if (!previewFrame || !wrap.contains(previewFrame)) {
        wrap.innerHTML = '';
        previewFrame = document.createElement('iframe');
        previewFrame.setAttribute('sandbox', 'allow-scripts allow-forms');
        previewFrame.setAttribute('title', 'Перегляд результату');
        wrap.appendChild(previewFrame);
      }
      var f = currentFiles();
      if (rt.previewDocAsync) {
        var token = ++previewToken;
        var frameNow = previewFrame;
        rt.previewDocAsync({ html: f.html, css: f.css, js: st.previewJs }, previewId).then(function (doc) {
          if (token === previewToken && frameNow === previewFrame) frameNow.srcdoc = doc;
        }, function (err) { pushConsole({ kind: 'err', text: err.message }); });
      } else {
        previewFrame.srcdoc = FERunner.previewDoc({ html: f.html, css: f.css, js: st.previewJs }, previewId);
      }
    }
    function onPreviewMessage(ev) {
      var msg = ev.data;
      if (!msg || msg.__feRun !== previewId || !previewFrame || ev.source !== previewFrame.contentWindow) return;
      if (msg.type === 'log') pushConsole({ kind: 'log', level: msg.level, text: msg.text });
      if (msg.type === 'user-error') pushConsole({ kind: 'err', text: (msg.error.line ? 'Рядок ' + msg.error.line + ': ' : '') + msg.error.name + ': ' + msg.error.message });
      if (msg.type === 'eval-result') {
        if (msg.late) pushConsole(msg.error ? { kind: 'err', text: (msg.prefix || '') + msg.error.name + ': ' + msg.error.message } : { kind: 'out', text: msg.text });
        else if (domPending[msg.id]) { var cb = domPending[msg.id]; delete domPending[msg.id]; cb(msg); }
      }
    }
    if (isDom) {
      window.addEventListener('message', onPreviewMessage);
      onCleanup(function () { window.removeEventListener('message', onPreviewMessage); });
    }

    function renderBottom() {
      renderBottomTabs();
      var content = $('#bottom-content', view);
      var wrap = $('#preview-wrap', view);
      var showPreview = isDom && st.bottomTab === 'preview';
      if (wrap) wrap.style.display = showPreview ? '' : 'none';
      content.style.display = showPreview ? 'none' : '';
      content.className = 'bottom-content' + (st.bottomTab === 'console' ? ' is-console' : '');
      if (showPreview) return;
      content.innerHTML = st.bottomTab === 'console' ? renderConsole() : renderTests();
      if (st.bottomTab === 'console') {
        var out = $('#console-out', view);
        if (out) out.scrollTop = out.scrollHeight;
        bindConsoleInput();
      }
    }

    // ---------------- run tests
    function run() {
      if (st.running) return;
      save();
      st.running = true;
      st.bottomTab = 'tests';
      var btn = $('#run-btn', view);
      if (btn) btn.disabled = true;
      var filesNow = currentFiles();
      st.result = null;
      st.console = [];
      renderBottom();
      var wasSolved = Store.item(item.id).best === 'solved';
      var testLogs = [];
      FERunner.run(item, filesNow, {
        onLog: function (msg) { testLogs.push({ kind: 'log', level: msg.level, text: msg.text }); }
      }).then(function (result) {
        if (ui.currentItem !== item) return;
        st.running = false;
        st.result = result;
        if (btn) btn.disabled = false;
        if (testLogs.length) {
          st.console = [{ kind: 'info', text: 'Вивід console.log під час перевірки тестами:' }].concat(testLogs);
        }
        if (result.userError && result.userError.line) markError(result.userError.line);
        else if (result.typeErrors && result.typeErrors.length && result.typeErrors[0].line) markError(result.typeErrors[0].line);
        var passedCount = result.tests.filter(function (t) { return t.pass; }).length;
        st.lastScore = result.status === 'passed' ? 1 : (result.tests.length ? passedCount / result.tests.length : 0) * 0.5;
        if (result.status === 'passed') {
          Store.setStatus(item.id, 'solved', 'code');
          st.solUnlocked = true;
          if (!wasSolved) toast('Усі тести пройдено! Завдання зараховано.', 'ok');
          renderLeft();
        } else {
          Store.setStatus(item.id, 'attempted', 'code');
        }
        if (isDom) { st.previewJs = filesNow.js; renderPreview(); }
        renderBottom();
      });
    }
    ui.actions.run = run;
    ui.runCurrent = st.playground ? function () { exec(); } : run;
    onCleanup(function () { ui.runCurrent = null; });

    if (session) {
      ui.actions.ivSubmitCode = function () {
        recordSessionAnswer(item, st.result ? st.lastScore : 0);
      };
    }

    setupResizers(view, cm);
    if (st.playground) $('#split', view).classList.add('focus');
    renderFileTabs();
    renderLeft();
    if (isDom) renderPreview();
    renderBottom();
    renderStatus();
    setTimeout(function () { cm.refresh(); if (window.innerWidth > 900) cm.focus(); }, 0);
  }

  function setupResizers(view, cm) {
    var split = $('#split', view);
    var left = $('#pane-left', view);
    var right = $('#pane-right', view);
    var bottom = $('#bottom', view);
    function drag(gutter, axis, onMove, onEnd) {
      gutter.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        gutter.setPointerCapture(e.pointerId);
        gutter.classList.add('drag');
        document.body.classList.add('dragging', 'dragging-' + axis);
        var move = function (ev) { onMove(ev); };
        var up = function () {
          gutter.classList.remove('drag');
          document.body.classList.remove('dragging', 'dragging-' + axis);
          gutter.removeEventListener('pointermove', move);
          gutter.removeEventListener('pointerup', up);
          gutter.removeEventListener('pointercancel', up);
          onEnd();
          cm.refresh();
        };
        gutter.addEventListener('pointermove', move);
        gutter.addEventListener('pointerup', up);
        gutter.addEventListener('pointercancel', up);
      });
    }
    var splitVal = Store.setting('split') || 0.42;
    var bottomVal = Store.setting('bottom') || 0.38;
    drag($('#gutter-x', view), 'x', function (e) {
      var r = split.getBoundingClientRect();
      var x = e.clientX - r.left;
      var rightSide = app.getAttribute('data-sidebar') === 'right';
      splitVal = Math.min(0.7, Math.max(0.2, x / r.width));
      void rightSide;
      left.style.width = (splitVal * 100).toFixed(2) + '%';
      cm.refresh();
    }, function () { Store.setting('split', splitVal); });
    drag($('#gutter-y', view), 'y', function (e) {
      var r = right.getBoundingClientRect();
      var y = r.bottom - e.clientY;
      bottomVal = Math.min(0.8, Math.max(0.12, y / r.height));
      bottom.style.height = (bottomVal * 100).toFixed(2) + '%';
      cm.refresh();
    }, function () { Store.setting('bottom', bottomVal); });
  }

  // =====================================================================
  //  Quiz і теорія: питання з варіантами відповідей
  // =====================================================================
  function renderQuiz(view, item, ctx) {
    renderChoice(view, item, ctx, {
      options: item.options,
      answer: item.answer,
      why: item.why,
      after: function () { return item.explanation ? '<div class="md">' + MD.render(item.explanation) + '</div>' : ''; }
    });
  }

  function renderTheory(view, item, ctx) {
    if (!Array.isArray(item.choices) || !item.choices.length) return renderTheoryReveal(view, item, ctx);
    renderChoice(view, item, ctx, {
      options: item.choices,
      answer: item.correct,
      why: item.why,
      after: function () {
        var kp = item.keyPoints || [];
        return (kp.length ? '<div class="kp"><h3>Ключові пункти, які має назвати кандидат</h3><ul class="kp-list">' + kp.map(function (p) { return '<li class="md">' + MD.inline(p) + '</li>'; }).join('') + '</ul></div>' : '') +
          '<details class="answer-block"><summary>Розгорнута відповідь (як на співбесіді)</summary><div class="md">' + MD.render(item.answer) + '</div></details>' +
          ((item.followUps || []).length ? '<div class="followups"><h3>Інтерв\'юер може спитати далі</h3><ul>' + item.followUps.map(function (q) { return '<li>' + MD.inline(q) + '</li>'; }).join('') + '</ul></div>' : '');
      }
    });
  }

  // Запасний варіант для теорії без варіантів відповіді: просто розгорнути еталон.
  function renderTheoryReveal(view, item, ctx) {
    var shown = false;
    function render() {
      view.innerHTML = itemBarHtml(item, ctx) + '<div class="single"><div class="card q-card"><h1>' + esc(item.title) + '</h1>' + metaHtml(item) +
        '<div class="q-question md">' + MD.render(item.question) + '</div>' +
        (shown ? '<div class="answer-block"><div class="md">' + MD.render(item.answer) + '</div></div>' : '<button class="btn primary" data-action="reveal">Показати відповідь</button>') +
        '</div></div>';
      enhanceCode(view);
    }
    ui.actions.reveal = function () { shown = true; render(); };
    render();
  }

  // Перший блок JS-коду з питання — його підставляємо в консоль.
  function firstCode(md) {
    var m = String(md || '').match(/```(?:js|javascript)[^\n]*\n([\s\S]*?)```/);
    return m ? m[1].replace(/\s+$/, '') + '\n' : '';
  }

  // Консоль-пісочниця для квізів і теорії: редактор + запуск + вирази (стан зберігається між командами).
  /*
   * Консоль-пісочниця (права панель): редактор + «Запустити» + вивід + поле для виразів.
   * opts.persistent — не прив'язувати до поточної сторінки (глобальна консоль).
   */
  function mountScratch(root, initial, opts) {
    opts = opts || {};
    var start = initial || '// Пишіть будь-який JS і тисніть «Запустити» (Ctrl+\').\n// Нижче можна вводити вирази, як у консолі браузера.\nconsole.log(typeof null);\n';
    root.classList.add('scratch-pane');
    root.innerHTML =
      '<div class="editor-head"><div class="tabs"><span class="tab active">' + (initial ? 'код з питання' : 'scratch.js') + '</span></div>' +
      '<div class="editor-tools"><button class="btn sm ghost" data-sc="reset" title="Повернути початковий код">' + icon('reset', 13) + '</button>' +
      '<button class="btn sm primary" data-sc="run">' + icon('play', 12) + ' Запустити <kbd class="desktop-only">Ctrl &#39;</kbd></button></div></div>' +
      '<div class="scratch-ed"></div>' +
      '<div class="scratch-console"><div class="tabs"><span class="tab active">Консоль</span><span class="grow"></span>' +
      '<button class="btn sm ghost" data-sc="clear">Очистити</button></div>' +
      '<div class="console scratch-out"></div>' +
      '<div class="console-input"><span class="prompt">›</span><input type="text" spellcheck="false" autocomplete="off" placeholder="Вираз і Enter, напр. typeof []"></div></div>';
    var out = $('.scratch-out', root);
    var inp = $('.console-input input', root);
    var session = null;
    var history = [];
    var hpos = 0;
    function line(kind, text) {
      var pfx = { in: '›', out: '‹', error: '✕', warn: '⚠' }[kind] || '';
      out.insertAdjacentHTML('beforeend', '<div class="log ' + kind + '"><span class="lv">' + pfx + '</span><span class="txt">' + esc(text) + '</span></div>');
      out.scrollTop = out.scrollHeight;
    }
    function errText(e) { return (e.line ? 'Рядок ' + e.line + ': ' : '') + e.name + ': ' + e.message; }
    var cm = CodeMirror($('.scratch-ed', root), {
      value: start, mode: 'javascript', lineNumbers: true, tabSize: 2, indentUnit: 2,
      matchBrackets: true, autoCloseBrackets: true, styleActiveLine: true,
      extraKeys: {
        'Ctrl-Enter': function () { run(); }, 'Cmd-Enter': function () { run(); },
        "Ctrl-'": function () { run(); }, "Cmd-'": function () { run(); },
        'Ctrl-/': 'toggleComment', 'Cmd-/': 'toggleComment',
        Tab: function (c) { if (c.somethingSelected()) c.execCommand('indentMore'); else c.replaceSelection('  ', 'end'); }
      }
    });
    setTimeout(function () { cm.refresh(); }, 0);
    function run() {
      if (session) session.terminate();
      out.innerHTML = '';
      line('info', '▶ Виконано. Нижче можна вводити вирази.');
      session = FERunner.createCodeSession(cm.getValue(), {
        onLog: function (m) { line(m.level === 'error' ? 'error' : m.level === 'warn' ? 'warn' : 'log', m.text || ''); },
        onError: function (e) { line('error', errText(e)); },
        onLate: function (m) { if (m.error) line('error', (m.prefix || '') + errText(m.error)); else line('out', m.text); }
      });
      return session.started.then(function (r) { if (!r.ok && r.error) line('error', errText(r.error)); });
    }
    function evalExpr(code) {
      line('in', code);
      var ready = session && !session.isDead() ? Promise.resolve() : run();
      ready.then(function () { return session.eval(code); }).then(function (m) {
        if (m.error) line('error', errText(m.error));
        else line('out', m.text);
      });
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sc]');
      if (!b) return;
      if (b.dataset.sc === 'run') run();
      if (b.dataset.sc === 'reset') cm.setValue(start);
      if (b.dataset.sc === 'clear') out.innerHTML = '';
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && inp.value.trim()) {
        e.preventDefault();
        history.push(inp.value);
        hpos = history.length;
        evalExpr(inp.value);
        inp.value = '';
      } else if (e.key === 'ArrowUp' && history.length) {
        e.preventDefault();
        hpos = Math.max(0, hpos - 1);
        inp.value = history[hpos] || '';
      } else if (e.key === 'ArrowDown' && history.length) {
        e.preventDefault();
        hpos = Math.min(history.length, hpos + 1);
        inp.value = history[hpos] || '';
      }
    });
    var api = { run: run, refresh: function () { cm.refresh(); }, focus: function () { cm.focus(); }, setCode: function (code) { cm.setValue(code); } };
    if (!opts.persistent) {
      ui.execCurrent = run;
      onCleanup(function () {
        ui.execCurrent = null;
        if (session) session.terminate();
      });
    }
    return api;
  }

  // Перетягування межі між лівою і правою панеллю (для квізів/теорії).
  function setupSplitX(view, onResize, key) {
    var split = $('#split', view);
    var left = $('#pane-left', view);
    var gutter = $('#gutter-x', view);
    if (!gutter) return;
    var val = Store.setting(key) || 0.55;
    gutter.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      gutter.setPointerCapture(e.pointerId);
      gutter.classList.add('drag');
      document.body.classList.add('dragging', 'dragging-x');
      function move(ev) {
        var r = split.getBoundingClientRect();
        val = Math.min(0.75, Math.max(0.25, (ev.clientX - r.left) / r.width));
        left.style.width = (val * 100).toFixed(2) + '%';
        onResize();
      }
      function up() {
        gutter.classList.remove('drag');
        document.body.classList.remove('dragging', 'dragging-x');
        gutter.removeEventListener('pointermove', move);
        gutter.removeEventListener('pointerup', up);
        Store.setting(key, val);
        onResize();
      }
      gutter.addEventListener('pointermove', move);
      gutter.addEventListener('pointerup', up);
    });
  }

  function renderChoice(view, item, ctx, spec) {
    var session = ctx && ctx.session;
    var multi = Array.isArray(spec.answer);
    var correct = multi ? spec.answer.slice().sort() : [spec.answer];
    var st = { selected: [], checked: false, hint: false, ok: false };
    var prevStatus = session ? null : Store.item(item.id).best;
    // Варіанти показуються у випадковому порядку (при кожному відкритті й повторній спробі),
    // щоб правильну відповідь не можна було запам'ятати за позицією. Індекси в даних не змінюються.
    var order = shuffle(spec.options.map(function (o, i) { return i; }));
    var keyOf = function (i) { return 'ABCDEF'.charAt(order.indexOf(i)); };

    function isRight() {
      var sel = st.selected.slice().sort();
      return sel.length === correct.length && sel.every(function (v, i) { return v === correct[i]; });
    }

    function render() {
      var opts = order.map(function (i) {
        var o = spec.options[i];
        var cls = 'option' + (multi ? ' multi' : '');
        var isSel = st.selected.indexOf(i) !== -1;
        var isCorrect = correct.indexOf(i) !== -1;
        if (st.checked) {
          if (isSel && isCorrect) cls += ' correct';
          else if (isSel && !isCorrect) cls += ' wrong';
          else if (!isSel && isCorrect) cls += ' missed';
        } else if (isSel) cls += ' selected';
        return '<button class="' + cls + '" data-action="pick" data-i="' + i + '" ' + (st.checked ? 'disabled' : '') + ' aria-pressed="' + isSel + '">' +
          '<span class="key">' + (st.checked && isCorrect ? '✓' : st.checked && isSel ? '✕' : keyOf(i)) + '</span><span class="otext md">' + optionHtml(o) +
          (st.checked && spec.why && spec.why[i] && (isSel || isCorrect) ? '<span class="why ' + (isCorrect ? 'ok' : 'bad') + '">' + MD.inline(spec.why[i]) + '</span>' : '') + '</span></button>';
      }).join('');
      var html = '<div class="card q-card">' +
        '<h1>' + esc(item.title) + '</h1>' + metaHtml(item) +
        (prevStatus ? '<p class="q-note">Ви вже відповідали на це питання ' + (prevStatus === 'solved' ? '— правильно' : '— з помилкою') + '. Спробуйте ще раз.</p>' : '') +
        '<div class="q-question md">' + MD.render(item.question) + '</div>' +
        (multi ? '<p class="q-note">' + (/Оберіть/.test(item.question) ? 'Кілька правильних варіантів' : 'Оберіть <b>усі</b> правильні варіанти') + ': <b>' + correct.length + '</b>.</p>' : '') +
        '<div class="options">' + opts + '</div>' +
        '<div class="q-actions">' +
          (!st.checked
            ? '<button class="btn primary" data-action="check" ' + (st.selected.length ? '' : 'disabled') + '>Перевірити <kbd class="desktop-only">↵</kbd></button>' +
              (item.hint && !st.hint ? '<button class="btn ghost" data-action="hint">' + icon('bulb', 14) + ' Підказка</button>' : '')
            : (session
              ? '<button class="btn primary" data-action="ivNext">Наступне питання ' + icon('right', 14) + '</button>'
              : (!st.ok ? '<button class="btn" data-action="retry">' + icon('reset', 14) + ' Спробувати ще раз</button>' : '') +
                '<span class="grow"></span><button class="btn primary" data-action="nextItem">' + nextLabel(item) + ' ' + icon('right', 14) + '</button>')) +
        '</div>' +
        (st.hint && item.hint ? '<div class="q-hint"><b>' + icon('bulb', 12) + ' ПІДКАЗКА</b><div class="md">' + MD.render(item.hint) + '</div></div>' : '') +
        (st.checked ? '<div class="q-result ' + (st.ok ? 'ok' : 'err') + '"><h3>' + (st.ok ? icon('check', 15) + ' Правильно!' : icon('x', 15) + ' Неправильно') + '</h3>' + multiSummary() + spec.after() + docsHtml(item.topic, stepTitle(item)) + '</div>' : '') +
        '</div>';
      var cardEl = $('#choice-card', view);
      cardEl.innerHTML = html;
      enhanceCode(cardEl);
    }
    function optionHtml(o) {
      var s = String(o);
      return /\n|```/.test(s) ? MD.render(s) : '<p>' + MD.inline(s) + '</p>';
    }
    // Для множинного вибору — що саме вгадано, пропущено та обрано зайвого.
    function multiSummary() {
      if (!multi || st.ok) return '';
      var hit = st.selected.filter(function (i) { return correct.indexOf(i) !== -1; }).length;
      var extra = st.selected.length - hit;
      var missed = correct.length - hit;
      var list = function (arr) { return arr.map(keyOf).sort().map(function (k) { return '<b>' + k + '</b>'; }).join(', '); };
      var missedIdx = correct.filter(function (i) { return st.selected.indexOf(i) === -1; });
      var extraIdx = st.selected.filter(function (i) { return correct.indexOf(i) === -1; });
      return '<p class="q-note" style="margin:0 0 12px">Знайдено правильних: <b>' + hit + ' з ' + correct.length + '</b>' +
        (missed ? ' · пропущено: ' + list(missedIdx) : '') +
        (extra ? ' · зайві (неправильні): ' + list(extraIdx) : '') + '</p>';
    }
    ui.actions.pick = function (el) {
      if (st.checked) return;
      var i = Number(el.dataset.i);
      if (multi) {
        var idx = st.selected.indexOf(i);
        if (idx === -1) st.selected.push(i); else st.selected.splice(idx, 1);
      } else {
        st.selected = [i];
      }
      render();
    };
    ui.actions.check = function () {
      if (!st.selected.length || st.checked) return;
      st.checked = true;
      st.ok = isRight();
      if (session) {
        recordSessionAnswer(item, st.ok ? 1 : 0, true);
      } else {
        Store.setStatus(item.id, st.ok ? 'solved' : 'wrong', 'choice');
      }
      render();
    };
    ui.actions.hint = function () { st.hint = true; render(); };
    ui.actions.retry = function () { st.selected = []; st.checked = false; st.ok = false; order = shuffle(order); render(); };
    ui.actions.ivNext = function () { advanceSession(); };
    ui.quizKeys = function (e) {
      if (isTyping()) return false;
      var k = e.key.toUpperCase();
      var idx = '123456'.indexOf(k);
      if (idx === -1) idx = 'ABCDEF'.indexOf(k);
      if (idx !== -1 && idx < spec.options.length && !st.checked && !e.ctrlKey && !e.metaKey && !e.altKey) {
        ui.actions.pick({ dataset: { i: order[idx] } });
        return true;
      }
      if (e.key !== 'Enter' || e.ctrlKey || e.metaKey || e.altKey) return false;
      var ae = document.activeElement;
      var onOtherButton = ae && (ae.tagName === 'BUTTON' || ae.tagName === 'A') && ae.dataset.action !== 'pick';
      if (onOtherButton) return false; // Enter на «Підказка», «Далі» тощо — звичайна поведінка
      if (!st.checked && st.selected.length) {
        ui.actions.check();
        return true;
      }
      if (st.checked) {
        if (session) advanceSession();
        else goSibling(item, 1);
        return true;
      }
      return false;
    };
    onCleanup(function () { ui.quizKeys = null; });
    // Каркас будується один раз: картка перемальовується, а консоль (з редактором) лишається.
    // Як у задачах з кодом: питання ліворуч, редактор і консоль праворуч — завжди.
    view.className = 'view no-scroll';
    var split = Store.setting('choiceSplit') || 0.55;
    view.innerHTML = itemBarHtml(item, ctx) + '<div class="split" id="split">' +
      '<section class="pane pane-left" id="pane-left" style="width:' + (split * 100).toFixed(2) + '%"><div class="desc-scroll choice-scroll" id="choice-card"></div></section>' +
      '<div class="gutter-x" id="gutter-x" role="separator" aria-orientation="vertical"></div>' +
      '<section class="pane pane-right" id="scratch-root"></section></div>';
    var scratch = mountScratch($('#scratch-root', view), firstCode(item.question));
    setupSplitX(view, function () { scratch.refresh(); }, 'choiceSplit');
    render();
  }

  // =====================================================================
  //  Interview mode
  // =====================================================================
  var IV_DEFAULTS = { count: 20, levels: 'sm', format: 'mixed', star: true, sections: null };

  // fw: 'react' | 'vue' | 'both' | 'none' → які з курсів фреймворків увімкнені серед розділів співбесіди.
  function applyFwToSections(sections, fw) {
    var out = sections.filter(function (id) { return !FW_TITLES[id]; });
    if (fw === 'react' || fw === 'both') out.push('react');
    if (fw === 'vue' || fw === 'both') out.push('vue');
    return out;
  }

  function viewInterviewSetup(view) {
    setCrumbs([{ label: 'Головна', href: '#/' }, { label: 'Пробна співбесіда' }]);
    var cfg = Object.assign({}, IV_DEFAULTS, Store.setting('ivConfig') || {});
    if (!cfg.sections) cfg.sections = applyFwToSections(FE.sections.map(function (s) { return s.id; }), primaryFw() || 'both');
    var active = Store.state.session;
    function fwState() {
      var r = cfg.sections.indexOf('react') !== -1;
      var v = cfg.sections.indexOf('vue') !== -1;
      return r && v ? 'both' : r ? 'react' : v ? 'vue' : 'none';
    }

    function pool() {
      var lv = { junior: [1], mid: [1, 2], sm: [1, 2, 3], all: [1, 2, 3, 4], hard: [3, 4] }[cfg.levels] || [1, 2, 3];
      var types = { oral: ['theory', 'quiz'], mixed: ['theory', 'quiz', 'code', 'dom'], code: ['code', 'dom'] }[cfg.format];
      return FE.items.filter(function (it) {
        var t = FE.topics[it.topic];
        // Модулі фінального проєкту для React/Vue слідують за вибором фреймворку.
        if (t.framework && cfg.sections.indexOf(t.framework) === -1) return false;
        return lv.indexOf(it.level) !== -1 && types.indexOf(it.type) !== -1 && cfg.sections.indexOf(t.section) !== -1;
      });
    }

    function render() {
      var p = pool();
      var count = Math.min(cfg.count, p.length);
      var minutes = Math.round(p.length ? count * (cfg.format === 'oral' ? 2 : cfg.format === 'code' ? 10 : 4) : 0);
      var chip = function (key, value, label) {
        return '<button class="chip' + (cfg[key] === value ? ' on' : '') + '" data-action="ivSet" data-key="' + key + '" data-value="' + value + '">' + label + '</button>';
      };
      view.innerHTML = '<div class="page" style="max-width:920px">' +
        '<div class="page-head"><div><h1>Пробна співбесіда</h1><div class="sub">Випадковий набір питань з різних тем — від простих до складних, як на реальній технічній співбесіді. Наприкінці ви отримаєте оцінку рівня та список слабких тем.</div></div></div>' +
        (active ? '<div class="card" style="padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span>' + icon('clock', 14) + ' У вас є незавершена співбесіда: питання ' + (active.index + 1) + ' з ' + active.ids.length + '.</span><span style="flex:1"></span><a class="btn primary sm" href="#/interview/run">Продовжити</a><button class="btn sm ghost" data-action="ivDiscard">Скасувати</button></div>' : '') +
        '<div class="card iv-setup">' +
          '<h3>Кількість питань</h3><div class="iv-options">' + [10, 20, 30, 50].map(function (n) { return chip('count', n, String(n)); }).join('') + '</div>' +
          '<h3>Рівень</h3><div class="iv-options">' + chip('levels', 'junior', 'Junior') + chip('levels', 'mid', 'До Middle') + chip('levels', 'sm', 'До Strong Middle') + chip('levels', 'all', 'Усі, включно з Senior') + chip('levels', 'hard', 'Лише складні (Strong + Senior)') + '</div>' +
          '<h3>Формат</h3><div class="iv-options">' + chip('format', 'oral', 'Усна частина: теорія + квізи') + chip('format', 'mixed', 'Змішаний: теорія, квізи, код') + chip('format', 'code', 'Лише практика (код)') + '</div>' +
          '<h3>Фреймворк</h3><div class="iv-options">' + [['react', 'React'], ['vue', 'Vue'], ['both', 'Обидва'], ['none', 'Без фреймворків']].map(function (o) {
            return '<button class="chip' + (fwState() === o[0] ? ' on' : '') + '" data-action="ivFw" data-value="' + o[0] + '">' + o[1] + '</button>';
          }).join('') + '</div>' +
          '<h3>Пріоритет</h3><div class="iv-options"><button class="chip' + (cfg.star ? ' on' : '') + '" data-action="ivStar">' + icon('star', 11) + ' Частіше брати популярні питання співбесід</button></div>' +
          '<h3>Розділи</h3><div class="iv-sections">' + FE.sections.map(function (s) {
            return '<label class="check-row"><input type="checkbox" data-sec="' + s.id + '"' + (cfg.sections.indexOf(s.id) !== -1 ? ' checked' : '') + '> ' + esc(s.title) + '</label>';
          }).join('') + '</div>' +
          '<div class="iv-summary"><button class="btn primary lg" data-action="ivStart" ' + (count ? '' : 'disabled') + '>' + icon('mic', 16) + ' Почати співбесіду</button>' +
          '<span class="info">' + (count ? count + ' ' + plural(count, 'питання', 'питання', 'питань') + ' з ' + p.length + ' доступних · орієнтовно ' + minutes + ' хв' : 'Немає питань для такої конфігурації') + '</span></div>' +
        '</div>' +
        historyHtml() +
        '</div>';
      $$('[data-sec]', view).forEach(function (cb) {
        cb.addEventListener('change', function () {
          var id = cb.dataset.sec;
          var i = cfg.sections.indexOf(id);
          if (cb.checked && i === -1) cfg.sections.push(id);
          if (!cb.checked && i !== -1) cfg.sections.splice(i, 1);
          Store.setting('ivConfig', cfg);
          render();
        });
      });
    }
    ui.actions.ivSet = function (el) {
      var v = el.dataset.value;
      cfg[el.dataset.key] = el.dataset.key === 'count' ? Number(v) : v;
      Store.setting('ivConfig', cfg);
      render();
    };
    ui.actions.ivStar = function () { cfg.star = !cfg.star; Store.setting('ivConfig', cfg); render(); };
    ui.actions.ivFw = function (el) { cfg.sections = applyFwToSections(cfg.sections, el.dataset.value); Store.setting('ivConfig', cfg); render(); };
    ui.actions.ivDiscard = function () {
      if (!confirm('Скасувати незавершену співбесіду?')) return;
      Store.setSession(null);
      active = null;
      render();
    };
    ui.actions.ivStart = function () {
      if (active && !confirm('Почати нову співбесіду? Незавершену буде скасовано.')) return;
      var ids = pickInterview(pool(), cfg);
      if (!ids.length) return;
      Store.setSession({ startedAt: Date.now(), ids: ids, index: 0, results: {}, config: cfg });
      location.hash = '#/interview/run';
    };
    render();
  }

  function pickInterview(pool, cfg) {
    // Рівномірно по темах, з вагою для популярних питань, від простого до складного.
    var byTopic = {};
    pool.forEach(function (it) { (byTopic[it.topic] = byTopic[it.topic] || []).push(it); });
    Object.keys(byTopic).forEach(function (k) {
      var arr = byTopic[k];
      // зважене перемішування: ключ = random^(1/weight)
      byTopic[k] = arr.map(function (it) {
        var w = cfg.star && it.interview ? 3 : 1;
        return { it: it, key: Math.pow(Math.random(), 1 / w) };
      }).sort(function (a, b) { return b.key - a.key; }).map(function (x) { return x.it; });
    });
    var topics = shuffle(Object.keys(byTopic));
    var picked = [];
    var count = Math.min(cfg.count, pool.length);
    while (picked.length < count) {
      var progress = false;
      for (var i = 0; i < topics.length && picked.length < count; i++) {
        var list = byTopic[topics[i]];
        if (list.length) { picked.push(list.shift()); progress = true; }
      }
      if (!progress) break;
    }
    picked.sort(function (a, b) { return a.level - b.level; });
    return picked.map(function (it) { return it.id; });
  }

  function viewInterviewRun(view) {
    var sess = Store.state.session;
    if (!sess) { location.hash = '#/interview'; return; }
    if (sess.index >= sess.ids.length) { finishSession(); return; }
    var item = FE.byId[sess.ids[sess.index]];
    if (!item) { sess.index++; Store.setSession(sess); route(); return; }
    setCrumbs([{ label: 'Головна', href: '#/' }, { label: 'Співбесіда', href: '#/interview' }, { label: 'Питання ' + (sess.index + 1) + ' / ' + sess.ids.length }]);
    ui.activeTopic = null;
    ui.actions.ivSkip = function () {
      sess.results[item.id] = sess.results[item.id] !== undefined ? sess.results[item.id] : 0;
      advanceSession();
    };
    ui.actions.ivFinish = function () {
      if (!confirm('Завершити співбесіду? Питання без відповіді буде зараховано як 0.')) return;
      finishSession();
    };
    var timer = setInterval(function () {
      var el = document.getElementById('iv-timer');
      if (el) el.innerHTML = icon('clock', 13) + ' ' + fmtTime(Date.now() - sess.startedAt);
    }, 1000);
    onCleanup(function () { clearInterval(timer); });
    viewItem(view, item, { session: sess });
  }

  function recordSessionAnswer(item, score, stay) {
    var sess = Store.state.session;
    if (!sess) return;
    sess.results[item.id] = score;
    Store.setSession(sess);
    // Результат співбесіди також оновлює загальний прогрес.
    if (item.type === 'quiz') Store.setStatus(item.id, score >= 1 ? 'solved' : 'wrong', 'choice');
    else if (item.type === 'theory') Store.setStatus(item.id, score >= 1 ? 'solved' : score > 0 ? 'partial' : 'wrong', 'choice');
    if (!stay) advanceSession();
  }

  function advanceSession() {
    var sess = Store.state.session;
    if (!sess) return;
    sess.index++;
    Store.setSession(sess);
    if (sess.index >= sess.ids.length) finishSession();
    else route();
  }

  function verdictFor(byLevel) {
    var g = function (l) { return byLevel[l] ? byLevel[l].score / byLevel[l].n : null; };
    var l1 = g(1); var l2 = g(2); var l3 = g(3); var l4 = g(4);
    var ok = function (v, min) { return v === null || v >= min; };
    if (l3 !== null && l4 !== null && ok(l1, 0.85) && ok(l2, 0.8) && ok(l3, 0.75) && l4 >= 0.6) return { title: 'Strong Middle+ / готовність до Senior', text: 'Глибокі знання, впевнено відповідаєте навіть на складні питання. Час братися за архітектуру та system design.', cls: 'l4' };
    if (l3 !== null && ok(l1, 0.8) && ok(l2, 0.75) && l3 >= 0.6) return { title: 'Strong Middle', text: 'Ви впевнено володієте базою та розумієте, як усе працює під капотом. Добийте слабкі теми — і можна йти на співбесіди.', cls: 'l3' };
    if (l2 !== null && ok(l1, 0.75) && l2 >= 0.55) return { title: 'Middle', text: 'Хороша практична база. Щоб вийти на Strong Middle — поглиблюйте розуміння механізмів (event loop, прототипи, рендеринг) і тренуйте live coding.', cls: 'l2' };
    if (l1 !== null && l1 >= 0.6) return { title: 'Junior+', text: 'Основи є, але є прогалини. Пройдіть теми по порядку, починаючи зі слабких.', cls: 'l1' };
    return { title: 'Потрібно підтягнути базу', text: 'Почніть з курсу «JavaScript» та розв\'язуйте завдання рівня Junior, читаючи шпаргалки.', cls: '' };
  }

  function finishSession() {
    var sess = Store.state.session;
    if (!sess) { location.hash = '#/interview'; return; }
    var items = sess.ids.map(function (id) { return FE.byId[id]; }).filter(Boolean);
    var byLevel = {};
    var byTopic = {};
    var total = 0;
    var answers = items.map(function (it) {
      var s = sess.results[it.id];
      var score = typeof s === 'number' ? s : 0;
      total += score;
      (byLevel[it.level] = byLevel[it.level] || { n: 0, score: 0 });
      byLevel[it.level].n++;
      byLevel[it.level].score += score;
      (byTopic[it.topic] = byTopic[it.topic] || { n: 0, score: 0 });
      byTopic[it.topic].n++;
      byTopic[it.topic].score += score;
      return { id: it.id, score: score, answered: typeof s === 'number' };
    });
    var verdict = verdictFor(byLevel);
    var result = {
      at: Date.now(),
      durationMs: Date.now() - sess.startedAt,
      config: sess.config,
      answers: answers,
      score: items.length ? total / items.length : 0,
      byLevel: byLevel,
      byTopic: byTopic,
      verdict: verdict.title
    };
    Store.addInterview(result);
    Store.setSession(null);
    location.hash = '#/interview/result/0';
  }

  function historyHtml() {
    var list = Store.state.interviews;
    if (!list.length) return '';
    return '<h2 class="section-title" style="margin-top:26px">Історія співбесід</h2><div class="card">' + list.map(function (r, i) {
      return '<a class="history-row" href="#/interview/result/' + i + '" style="color:inherit;text-decoration:none"><span style="color:var(--text-faint)">' + fmtDate(r.at) + '</span>' +
        '<b style="flex:1">' + esc(r.verdict) + '</b><span>' + r.answers.length + ' пит.</span><span style="font-variant-numeric:tabular-nums">' + Math.round(r.score * 100) + '%</span>' + icon('right', 14) + '</a>';
    }).join('') + '</div>';
  }

  function scoreRow(label, score, n, href) {
    var p = Math.round((score / n) * 100);
    var color = p >= 75 ? 'var(--ok)' : p >= 50 ? 'var(--warn)' : 'var(--err)';
    return '<div class="score-row"><span class="lbl">' + (href ? '<a href="' + href + '">' + esc(label) + '</a>' : esc(label)) + '</span>' +
      '<div class="bar"><i style="width:' + p + '%;background:' + color + '"></i></div><span class="pct">' + p + '%</span></div>';
  }

  function viewInterviewResult(view, idx) {
    var r = Store.state.interviews[idx];
    setCrumbs([{ label: 'Головна', href: '#/' }, { label: 'Співбесіда', href: '#/interview' }, { label: 'Результат' }]);
    if (!r) { view.innerHTML = '<div class="empty"><h3>Результат не знайдено</h3><a class="btn" href="#/interview">До співбесід</a></div>'; return; }
    var verdict = verdictFor(r.byLevel);
    var weak = Object.keys(r.byTopic).filter(function (t) { return FE.topics[t] && r.byTopic[t].score / r.byTopic[t].n < 0.6; });
    var failedIds = r.answers.filter(function (a) { return a.score < 1; }).map(function (a) { return a.id; });
    view.innerHTML = '<div class="page" style="max-width:1000px">' +
      '<div class="card result-hero">' + ringHtml(Math.round(r.score * 100), 'результат') +
        '<div class="verdict"><span style="font-size:13px;color:var(--text-faint);font-weight:500;display:block;margin-bottom:4px">Оцінка рівня за цією співбесідою</span>' + esc(verdict.title) +
        '<small>' + esc(verdict.text) + '</small><small>' + r.answers.length + ' ' + plural(r.answers.length, 'питання', 'питання', 'питань') + ' · ' + fmtTime(r.durationMs) + ' · ' + fmtDate(r.at) + '</small></div></div>' +
      '<div class="result-grid">' +
        '<div class="card"><h3>За рівнями складності</h3>' + [1, 2, 3, 4].filter(function (l) { return r.byLevel[l]; }).map(function (l) {
          return scoreRow(FE.LEVELS[l].label + ' (' + r.byLevel[l].n + ')', r.byLevel[l].score, r.byLevel[l].n);
        }).join('') + '</div>' +
        '<div class="card"><h3>За темами</h3>' + Object.keys(r.byTopic).filter(function (t) { return FE.topics[t]; }).sort(function (a, b) {
          return r.byTopic[a].score / r.byTopic[a].n - r.byTopic[b].score / r.byTopic[b].n;
        }).map(function (t) {
          return scoreRow(FE.topics[t].short + ' (' + r.byTopic[t].n + ')', r.byTopic[t].score, r.byTopic[t].n, '#/t/' + t);
        }).join('') + '</div>' +
      '</div>' +
      (weak.length ? '<div class="card" style="padding:16px 18px;margin-bottom:16px"><h3 style="margin:0 0 8px;font-size:14px">Над чим попрацювати</h3><p style="margin:0 0 10px;color:var(--text-dim)">Теми з результатом нижче 60%: ' +
        weak.map(function (t) { return '<a href="#/t/' + t + '">' + esc(FE.topics[t].short) + '</a>'; }).join(', ') + '. Перечитайте шпаргалки та пройдіть завдання цих тем.</p></div>' : '') +
      (r.config && r.config.topic && FE.topics[r.config.topic] && r.score >= 0.85 && !skippedTopics()[r.config.topic]
        ? '<div class="card" style="padding:16px 18px;margin-bottom:16px"><h3 style="margin:0 0 8px;font-size:14px">Модуль «' + esc(FE.topics[r.config.topic].short) + '» вам знайомий</h3><p style="margin:0 0 10px;color:var(--text-dim)">Результат від 85% — можна не проходити модуль підряд: він випаде з плану, а «Продовжити» його пропускатиме. Завдання лишаються доступними для повторення.</p>' +
          '<button class="btn" data-action="toggleSkip" data-topic="' + r.config.topic + '">' + icon('check', 14) + ' Позначити знайомим</button></div>'
        : '') +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">' +
        '<a class="btn primary" href="#/interview">' + icon('mic', 14) + ' Нова співбесіда</a>' +
        (failedIds.length ? '<button class="btn" data-action="ivToReview">' + icon('bookmark', 14) + ' Додати помилки на повторення (' + failedIds.length + ')</button>' : '') +
      '</div>' +
      '<h2 class="section-title">Питання</h2>' +
      '<div class="item-list">' + r.answers.map(function (a, i) {
        var it = FE.byId[a.id];
        if (!it) return '';
        var mark = a.score >= 1 ? '<span class="status-dot solved">✓</span>' : a.score > 0 ? '<span class="status-dot partial">½</span>' : '<span class="status-dot wrong">✕</span>';
        return '<a class="item-row" href="#/i/' + it.id + '" data-nav="ivres"><span class="num">' + (i + 1) + '</span>' + mark +
          '<span class="type-ico">' + esc(FE.TYPES[it.type].icon) + '</span><span class="ttl">' + esc(it.title) + '<small>' + esc(topicOf(it).short) + (a.answered ? '' : ' · без відповіді') + '</small></span>' +
          '<span class="badges">' + levelBadge(it.level) + '</span></a>';
      }).join('') + '</div></div>';
    ui.actions.ivToReview = function () {
      failedIds.forEach(function (id) { Store.patch(id, { rep: true }, true); });
      Store.patch(failedIds[0], {});
      toast('Додано на повторення: ' + failedIds.length);
    };
    ui.navProvider = function () { return { ids: r.answers.map(function (a) { return a.id; }), label: 'Результати співбесіди', back: '#/interview/result/' + idx }; };
  }

  // =====================================================================
  //  Modals
  // =====================================================================
  function openModal(html, bind) {
    var back = document.createElement('div');
    back.className = 'modal-backdrop';
    back.innerHTML = '<div class="card modal" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.appendChild(back);
    var prevFocus = document.activeElement;
    function close() {
      back.remove();
      document.removeEventListener('keydown', onKey, true);
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
    }
    document.addEventListener('keydown', onKey, true);
    back.addEventListener('click', function (e) {
      if (e.target === back || e.target.closest('[data-close]')) close();
    });
    var first = back.querySelector('button, input, select');
    if (first) first.focus();
    if (bind) bind(back.firstChild, close);
    return close;
  }

  function openSettings() {
    var s = Store.state.settings;
    var seg = function (key, options) {
      return '<div class="seg">' + options.map(function (o) {
        return '<button data-set="' + key + '" data-value="' + o[0] + '" class="' + (String(s[key]) === String(o[0]) ? 'on' : '') + '">' + o[1] + '</button>';
      }).join('') + '</div>';
    };
    openModal('<h2>Налаштування</h2>' +
      '<div class="row"><div class="lbl"><b>Тема</b><span>Оформлення інтерфейсу та редактора</span></div>' + seg('theme', [['dark', 'Темна'], ['light', 'Світла'], ['auto', 'Як у системі']]) + '</div>' +
      '<div class="row"><div class="lbl"><b>Меню тем</b><span>З якого боку показувати список тем</span></div>' + seg('sidebar', [['left', 'Ліворуч'], ['right', 'Праворуч']]) + '</div>' +
      '<div class="row"><div class="lbl"><b>Розмір шрифту в редакторі</b></div>' + seg('fontSize', [[12, '12'], [13, '13'], [14, '14'], [15, '15'], [16, '16'], [18, '18']]) + '</div>' +
      '<div class="row"><div class="lbl"><b>Прогрес</b><span>Зберігається в цьому браузері (localStorage). Робіть резервну копію.</span></div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><button class="btn sm" data-act="export">Експорт</button><button class="btn sm" data-act="import">Імпорт</button><input type="file" accept="application/json,.json" hidden data-file></div></div>' +
      '<div class="row"><div class="lbl"><b>Скинути прогрес</b><span>Видалити всі відповіді, код і історію співбесід</span></div><button class="btn sm" data-act="reset" style="color:var(--err)">Скинути</button></div>' +
      '<div class="actions"><button class="btn" data-close>Закрити</button></div>', function (root) {
      root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-set]');
        if (b) {
          var key = b.dataset.set;
          var v = key === 'fontSize' ? Number(b.dataset.value) : b.dataset.value;
          Store.setting(key, v);
          $$('[data-set="' + key + '"]', root).forEach(function (x) { x.classList.toggle('on', x === b); });
          if (key === 'theme' || key === 'fontSize') {
            applyTheme();
            $$('.CodeMirror').forEach(function (el) { if (el.CodeMirror) el.CodeMirror.refresh(); });
          }
          if (key === 'sidebar') app.setAttribute('data-sidebar', v);
          return;
        }
        var act = e.target.closest('[data-act]');
        if (!act) return;
        if (act.dataset.act === 'export') {
          var blob = new Blob([Store.exportJson()], { type: 'application/json' });
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'fe-trainer-progress-' + new Date().toISOString().slice(0, 10) + '.json';
          document.body.appendChild(a);
          a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
        } else if (act.dataset.act === 'import') {
          $('[data-file]', root).click();
        } else if (act.dataset.act === 'reset') {
          if (confirm('Точно видалити весь прогрес? Цю дію не можна скасувати.')) {
            Store.reset();
            toast('Прогрес скинуто');
            route();
          }
        }
      });
      $('[data-file]', root).addEventListener('change', function (e) {
        var file = e.target.files[0];
        if (!file) return;
        file.text().then(function (text) {
          try {
            Store.importJson(text);
            applyTheme();
            toast('Прогрес імпортовано', 'ok');
            route();
          } catch (err) {
            toast(err.message, 'err');
          }
        });
      });
    });
  }

  function openShortcuts() {
    var rows = [
      ['Перевірити рішення тестами', '<kbd>Ctrl</kbd> + <kbd>Enter</kbd>'],
      ['Запустити код (вивід у консоль)', '<kbd>Ctrl</kbd> + <kbd>&#39;</kbd>'],
      ['Автодоповнення в редакторі', '<kbd>Ctrl</kbd> + <kbd>Space</kbd>'],
      ['Історія команд у консолі', '<kbd>↑</kbd> / <kbd>↓</kbd>'],
      ['Наступне / попереднє завдання', '<kbd>Alt</kbd> + <kbd>→</kbd> / <kbd>←</kbd>'],
      ['Пошук завдань', '<kbd>/</kbd>'],
      ['Вибір варіанту в квізі', '<kbd>1</kbd>–<kbd>6</kbd> або <kbd>A</kbd>–<kbd>F</kbd>'],
      ['Перевірити відповідь у квізі', '<kbd>Enter</kbd>'],
      ['Закоментувати рядок у редакторі', '<kbd>Ctrl</kbd> + <kbd>/</kbd>'],
      ['Зберегти код (зберігається й автоматично)', '<kbd>Ctrl</kbd> + <kbd>S</kbd>'],
      ['Показати/сховати меню', '<kbd>Ctrl</kbd> + <kbd>B</kbd>'],
      ['Ця довідка', '<kbd>?</kbd>']
    ];
    openModal('<h2>Гарячі клавіші</h2><table class="shortcuts">' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') + '</table><div class="actions"><button class="btn" data-close>Закрити</button></div>');
  }

  // =====================================================================
  //  Global events
  // =====================================================================
  var globalActions = {
    toggleSidebar: function () {
      if (window.innerWidth <= 900) {
        app.classList.remove('sidebar-collapsed');
        app.classList.toggle('sidebar-open');
      } else {
        app.classList.toggle('sidebar-collapsed');
        Store.setting('sidebarCollapsed', app.classList.contains('sidebar-collapsed'));
        setTimeout(function () { $$('.CodeMirror').forEach(function (el) { if (el.CodeMirror) el.CodeMirror.refresh(); }); }, 220);
      }
    },
    closeSidebar: closeSidebarMobile,
    toggleTheme: function () {
      var cur = document.documentElement.getAttribute('data-theme');
      Store.setting('theme', cur === 'dark' ? 'light' : 'dark');
      applyTheme();
    },
    settings: openSettings,
    shortcuts: openShortcuts,
    toggleGlobalConsole: function () {
      var panel = document.getElementById('global-console');
      if (!panel.hidden) { panel.hidden = true; return; }
      openGlobalConsole();
      ui.globalScratch.focus();
    },
    // Підсумкова перевірка модуля: 10 випадкових завдань модуля в режимі співбесіди (код — лише швидкі рівні 1–2).
    moduleCheck: function (el) {
      var t = FE.topics[el.dataset.topic];
      if (!t) return;
      if (Store.state.session && !confirm('Почати перевірку модуля? Незавершену співбесіду буде скасовано.')) return;
      var pool = t.items.filter(function (it) { return it.type === 'quiz' || it.type === 'theory' || it.level <= 2; });
      var ids = shuffle(pool).slice(0, Math.min(10, pool.length)).sort(function (a, b) { return a.level - b.level; }).map(function (it) { return it.id; });
      if (!ids.length) return;
      Store.setSession({ startedAt: Date.now(), ids: ids, index: 0, results: {}, config: { count: ids.length, levels: 'all', format: 'mixed', star: false, sections: [t.section], topic: t.id } });
      location.hash = '#/interview/run';
    },
    setFramework: function (el) {
      Store.setting('framework', el.dataset.value === 'both' ? null : el.dataset.value);
      // Налаштування співбесіди за замовчуванням теж слідують за основним фреймворком.
      var iv = Store.setting('ivConfig');
      if (iv && iv.sections) { iv.sections = applyFwToSections(iv.sections, el.dataset.value === 'both' ? 'both' : el.dataset.value); Store.setting('ivConfig', iv); }
      route();
    },
    setWeeklyHours: function (el) { Store.setting('weeklyHours', Number(el.dataset.value)); route(); },
    toggleSkip: function (el) {
      var s = Object.assign({}, skippedTopics());
      var id = el.dataset.topic;
      if (s[id]) delete s[id]; else s[id] = true;
      Store.setting('skipped', s);
      toast(s[id] ? 'Модуль позначено знайомим: він не входить у план' : 'Модуль повернуто в план');
      route();
    },
    resetAll: function () {
      if (!confirm('Скинути ВЕСЬ прогрес: відповіді, код, повторення та історію співбесід? Ваші задачі в «Мої задачі» залишаться. Цю дію не можна скасувати.')) return;
      // Спершу закриваємо поточну сторінку (її автозбереження коду), лише потім скидаємо.
      ui.cleanup.forEach(function (fn) { try { fn(); } catch (e) { /* noop */ } });
      ui.cleanup = [];
      Store.reset();
      ui.nav = null;
      toast('Прогрес скинуто — починаємо з нуля');
      if (location.hash && location.hash !== '#/') location.hash = '#/';
      else route();
    },
    // Змішана практика (interleaving): по черзі з різних уже розпочатих тем, з пріоритетом на помилки й нерозв'язане.
    mixedPractice: function () {
      var startedTopics = {};
      FE.items.forEach(function (it) { if (Store.item(it.id).s) startedTopics[it.topic] = true; });
      var byTopic = {};
      FE.items.forEach(function (it) {
        if (!startedTopics[it.topic]) return;
        var s = Store.item(it.id);
        var w = s.best !== 'solved' ? 3 : isDue(it) ? 2 : 0.6;
        (byTopic[it.topic] = byTopic[it.topic] || []).push({ it: it, key: Math.pow(Math.random(), 1 / w) });
      });
      Object.keys(byTopic).forEach(function (k) { byTopic[k].sort(function (a, b) { return b.key - a.key; }); });
      var topics = shuffle(Object.keys(byTopic));
      var ids = [];
      while (ids.length < 15) {
        var added = false;
        for (var i = 0; i < topics.length && ids.length < 15; i++) {
          var next = byTopic[topics[i]].shift();
          if (next) { ids.push(next.it.id); added = true; }
        }
        if (!added) break;
      }
      if (!ids.length) { toast('Спершу розпочніть хоча б одну тему'); return; }
      ui.nav = { ids: ids, label: 'Змішана практика', back: '#/' };
      location.hash = '#/i/' + ids[0];
    },
    toggleSection: function (el) {
      var c = Object.assign({}, Store.setting('collapsed') || {});
      c[el.dataset.id] = !c[el.dataset.id];
      Store.setting('collapsed', c);
      renderSidebar();
    }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (el && !el.disabled) {
      var name = el.dataset.action;
      var fn = ui.actions[name] || globalActions[name];
      if (fn) {
        e.preventDefault();
        fn(el, e);
        return;
      }
    }
    // запамʼятати контекст навігації (список, з якого відкрили завдання)
    var link = e.target.closest('a[data-nav]');
    if (link) {
      var kind = link.dataset.nav;
      if (kind === 'search') ui.nav = { ids: (ui.searchIds || []).slice(), label: 'Пошук', back: null };
      else if (ui.navProvider) ui.nav = ui.navProvider();
      closeSidebarMobile();
    } else if (e.target.closest('a.side-topic, a.side-link')) {
      ui.nav = null;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented) return; // уже оброблено (наприклад, редактором CodeMirror)
    if (document.querySelector('.modal-backdrop')) return;
    if ((e.ctrlKey || e.metaKey) && e.key === "'") {
      e.preventDefault();
      if (ui.execCurrent) ui.execCurrent();
      else globalActions.toggleGlobalConsole();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && ui.runCurrent) {
      e.preventDefault();
      ui.runCurrent();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B') && !e.shiftKey) {
      e.preventDefault();
      globalActions.toggleSidebar();
      return;
    }
    if (e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && ui.currentItem) {
      var sessionActive = ui.routeName === 'interview';
      if (!sessionActive) {
        e.preventDefault();
        goSibling(ui.currentItem, e.key === 'ArrowRight' ? 1 : -1);
      }
      return;
    }
    if (ui.quizKeys && ui.quizKeys(e)) { e.preventDefault(); return; }
    if (isTyping()) return;
    if (e.key === '/') {
      e.preventDefault();
      if (window.innerWidth <= 900) app.classList.add('sidebar-open');
      app.classList.remove('sidebar-collapsed');
      $('#search').focus();
    } else if (e.key === '?') {
      openShortcuts();
    } else if (e.key === 'Escape') {
      closeSidebarMobile();
    }
  });

  window.addEventListener('hashchange', route);
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', function () {
    if (Store.setting('theme') === 'auto') applyTheme();
  });
  Store.on(function (evt) {
    if (evt.type === 'item' || evt.type === 'reset') renderSidebar();
  });

  // =====================================================================
  //  Boot
  // =====================================================================
  FE.loadData('data/', function () {
    registerCustomTasks();
    renderShell();
    route();
    window.__feReady = true;
  });
})();
