/*
 * Прогрес користувача в localStorage.
 * item: { s: статус, at: час, n: спроби, rep: на повторення, code: {js,css,html}, hints: к-сть відкритих,
 *         sol: чи дивився рішення, note: чернетка відповіді, kp: [відмічені ключові пункти] }
 * Статуси: solved | attempted (код) | wrong (квіз/теорія) | partial (теорія)
 */
(function () {
  'use strict';

  var KEY = 'fe-trainer:v1';
  var state = load();
  var listeners = [];
  var saveTimer = null;

  function blank() {
    return { v: 1, items: {}, settings: { theme: 'dark', sidebar: 'left', fontSize: 14, split: 0.42, bottom: 0.38 }, interviews: [], session: null, lastItem: null };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      var data = JSON.parse(raw);
      var b = blank();
      data.settings = Object.assign(b.settings, data.settings || {});
      data.items = data.items || {};
      data.interviews = data.interviews || [];
      return data;
    } catch (e) {
      return blank();
    }
  }

  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 250);
  }
  function flush() {
    clearTimeout(saveTimer);
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Не вдалося зберегти прогрес', e);
    }
  }
  window.addEventListener('beforeunload', flush);

  function emit(what) {
    listeners.forEach(function (fn) {
      try { fn(what); } catch (e) { console.error(e); }
    });
  }

  var Store = {
    get state() { return state; },
    item: function (id) { return state.items[id] || {}; },
    patch: function (id, data, silent) {
      var cur = state.items[id] || {};
      state.items[id] = Object.assign({}, cur, data);
      persist();
      if (!silent) emit({ type: 'item', id: id });
      return state.items[id];
    },
    /**
     * kind: 'choice' (квіз/теорія) або 'code'. Інтервальні повторення (система Лейтнера):
     * помилка → коробка 0 (повторити сьогодні); правильно → наступна коробка, інтервал 1/3/7/16/35 днів.
     * Для коду невдалі запуски під час роботи не скидають прогрес — рахується лише розв'язання.
     */
    setStatus: function (id, status, kind) {
      var cur = state.items[id] || {};
      var next = { s: status, at: Date.now(), n: (cur.n || 0) + 1 };
      var DAY = 864e5;
      var INTERVALS = [0, 1, 3, 7, 16, 35];
      if (status === 'solved') {
        var box = typeof cur.box === 'number' ? Math.min(5, cur.box + 1) : (cur.s && cur.s !== 'solved' && kind !== 'code' ? 1 : 2);
        next.box = box;
        next.due = Date.now() + INTERVALS[box] * DAY;
      } else if (kind !== 'code' || typeof cur.box === 'number') {
        if (kind !== 'code') {
          next.box = 0;
          next.due = Date.now();
        }
      }
      if (status === 'solved' && cur.s !== 'solved') next.firstSolvedAt = Date.now();
      // Оцінка «найкращого» результату — щоб прогрес не падав від повторних спроб.
      var rank = { wrong: 1, attempted: 1, partial: 2, solved: 3 };
      if ((rank[status] || 0) >= (rank[cur.best] || 0)) next.best = status;
      return Store.patch(id, next);
    },
    toggleRepeat: function (id) {
      var cur = state.items[id] || {};
      return Store.patch(id, { rep: !cur.rep });
    },
    setting: function (key, value) {
      if (arguments.length === 1) return state.settings[key];
      state.settings[key] = value;
      persist();
      emit({ type: 'settings', key: key });
    },
    setLastItem: function (id) {
      state.lastItem = id;
      persist();
    },
    setSession: function (session) {
      state.session = session;
      persist();
    },
    addInterview: function (result) {
      state.interviews.unshift(result);
      state.interviews = state.interviews.slice(0, 30);
      persist();
    },
    on: function (fn) { listeners.push(fn); },
    exportJson: function () { return JSON.stringify(state, null, 2); },
    importJson: function (json) {
      var data = JSON.parse(json);
      if (!data || typeof data !== 'object' || !data.items) throw new Error('Невірний формат файлу прогресу');
      var b = blank();
      data.settings = Object.assign(b.settings, data.settings || {});
      data.interviews = data.interviews || [];
      state = data;
      flush();
      emit({ type: 'reset' });
    },
    reset: function () {
      var settings = state.settings;
      state = blank();
      state.settings = settings;
      flush();
      emit({ type: 'reset' });
    },
    flush: flush
  };

  window.Store = Store;
})();
