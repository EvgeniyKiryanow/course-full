/*
 * FERunner — виконання коду користувача та тестів в ізоляції.
 *
 *  - type "code": окремий Web Worker на кожен запуск (нескінченний цикл → worker.terminate()).
 *  - type "dom":  прихований sandbox-iframe 800×600 з реальним DOM та layout.
 *
 * Тести — рядки JS у стилі Jest (expect, mockFn, useFakeTimers, mockFetch...).
 * Кожен тест компілюється окремо як async-функція, тож можна використовувати await.
 */
(function () {
  'use strict';

  // =====================================================================
  //  HARNESS — цей код серіалізується й виконується всередині Worker / iframe
  // =====================================================================
  function feHarness(G, env) {
    'use strict';
    var slice = Array.prototype.slice;
    var realSetTimeout = G.setTimeout.bind(G);
    var realClearTimeout = G.clearTimeout.bind(G);
    var realSetInterval = G.setInterval.bind(G);
    var realClearInterval = G.clearInterval.bind(G);
    var realDateNow = Date.now;
    var realPerfNow = G.performance && G.performance.now ? G.performance.now.bind(G.performance) : realDateNow;
    var realFetch = G.fetch;
    var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    var fe = (G.__fe = { env: env, phase: 'init' });

    function post(msg) {
      try { env.post(msg); } catch (e) { /* ignore */ }
    }
    fe.post = post;

    // ------------------------------------------------------------ format
    function isNode(v) {
      return typeof G.Node === 'function' && v instanceof G.Node;
    }
    function quote(s) {
      return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
    }
    function format(v, depth, seen, top) {
      depth = depth || 0;
      seen = seen || [];
      var t = typeof v;
      if (v === null) return 'null';
      if (t === 'undefined') return 'undefined';
      if (t === 'string') return top ? v : quote(v);
      if (t === 'number') return Object.is(v, -0) ? '-0' : String(v);
      if (t === 'bigint') return String(v) + 'n';
      if (t === 'boolean') return String(v);
      if (t === 'symbol') return v.toString();
      if (t === 'function') {
        if (v._isMockFunction) return '[mockFn]';
        var src = '';
        try { src = Function.prototype.toString.call(v); } catch (e) { /* noop */ }
        if (/^class[\s{]/.test(src)) return '[class ' + (v.name || 'anonymous') + ']';
        return '[Function: ' + (v.name || 'anonymous') + ']';
      }
      if (isNode(v)) {
        if (v.nodeType === 3) return '#text ' + quote(v.textContent.slice(0, 60));
        if (v.nodeType === 9) return '#document';
        if (v.nodeType === 11) return '#document-fragment';
        if (v.outerHTML) {
          var open = v.outerHTML.match(/^<[^>]*>/);
          return open ? open[0] : '<' + v.nodeName.toLowerCase() + '>';
        }
        return '[' + v.nodeName + ']';
      }
      if (seen.indexOf(v) !== -1) return '[Circular]';
      var tag = Object.prototype.toString.call(v);
      if (v instanceof Error || tag === '[object Error]') return (v.name || 'Error') + ': ' + v.message;
      if (tag === '[object Date]') return isNaN(v) ? 'Invalid Date' : v.toISOString();
      if (tag === '[object RegExp]') return String(v);
      if (tag === '[object Promise]') return 'Promise {…}';
      if (tag === '[object WeakMap]') return 'WeakMap {…}';
      if (tag === '[object WeakSet]') return 'WeakSet {…}';
      if (tag === '[object Number]' || tag === '[object String]' || tag === '[object Boolean]') {
        return '[' + tag.slice(8, -1) + ': ' + format(v.valueOf()) + ']';
      }
      if (depth > 3) return Array.isArray(v) ? '[Array]' : '[Object]';
      seen = seen.concat([v]);
      var MAX = 40;
      var parts = [];
      if (Array.isArray(v) || ArrayBuffer.isView(v)) {
        var holes = 0;
        for (var i = 0; i < v.length && parts.length < MAX; i++) {
          if (!(i in v)) { holes++; continue; }
          if (holes) { parts.push('<' + holes + ' empty>'); holes = 0; }
          parts.push(format(v[i], depth + 1, seen));
        }
        if (holes) parts.push('<' + holes + ' empty>');
        if (v.length > MAX) parts.push('… ще ' + (v.length - MAX));
        var prefix = Array.isArray(v) ? '' : tag.slice(8, -1) + '(' + v.length + ') ';
        return prefix + '[' + parts.join(', ') + ']';
      }
      if (tag === '[object Map]') {
        v.forEach(function (val, key) {
          if (parts.length < MAX) parts.push(format(key, depth + 1, seen) + ' => ' + format(val, depth + 1, seen));
        });
        return 'Map(' + v.size + ') {' + (parts.length ? ' ' + parts.join(', ') + ' ' : '') + '}';
      }
      if (tag === '[object Set]') {
        v.forEach(function (val) {
          if (parts.length < MAX) parts.push(format(val, depth + 1, seen));
        });
        return 'Set(' + v.size + ') {' + (parts.length ? ' ' + parts.join(', ') + ' ' : '') + '}';
      }
      var keys = Reflect.ownKeys(v).filter(function (k) {
        var d = Object.getOwnPropertyDescriptor(v, k);
        return d && d.enumerable;
      });
      keys.slice(0, MAX).forEach(function (k) {
        var d = Object.getOwnPropertyDescriptor(v, k);
        var name = typeof k === 'symbol' ? '[' + k.toString() + ']' : /^[A-Za-z_$][\w$]*$/.test(k) ? k : quote(k);
        var val = d.get || d.set ? '[Getter' + (d.set ? '/Setter' : '') + ']' : format(d.value, depth + 1, seen);
        parts.push(name + ': ' + val);
      });
      if (keys.length > MAX) parts.push('… ще ' + (keys.length - MAX));
      var proto = Object.getPrototypeOf(v);
      var ctor = proto === null ? '[Object: null prototype] ' : '';
      if (proto && proto !== Object.prototype && proto.constructor && proto.constructor.name) {
        ctor = proto.constructor.name + ' ';
      }
      return ctor + (parts.length ? '{ ' + parts.join(', ') + ' }' : '{}');
    }
    fe.format = format;

    // ------------------------------------------------------------ equality
    function ownEnumKeys(o) {
      return Reflect.ownKeys(o).filter(function (k) {
        return Object.prototype.propertyIsEnumerable.call(o, k);
      });
    }
    function equals(a, b, strict, seen) {
      if (Object.is(a, b)) return true;
      if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
      if (isNode(a) || isNode(b)) return false;
      var ta = Object.prototype.toString.call(a);
      var tb = Object.prototype.toString.call(b);
      if (ta !== tb) return false;
      if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
      if (ta === '[object Date]') return Object.is(a.getTime(), b.getTime());
      if (ta === '[object RegExp]') return String(a) === String(b);
      if (ta === '[object Number]' || ta === '[object String]' || ta === '[object Boolean]') {
        return Object.is(a.valueOf(), b.valueOf());
      }
      if (a instanceof Error && b instanceof Error) {
        if (a.name !== b.name || a.message !== b.message) return false;
      }
      seen = seen || [];
      for (var s = 0; s < seen.length; s++) {
        if (seen[s][0] === a && seen[s][1] === b) return true;
      }
      seen = seen.concat([[a, b]]);
      var i;
      if (Array.isArray(a) || ArrayBuffer.isView(a)) {
        if (a.length !== b.length) return false;
        for (i = 0; i < a.length; i++) {
          if (strict && (i in a) !== (i in b)) return false;
          if (!equals(a[i], b[i], strict, seen)) return false;
        }
        if (!strict) return true;
      }
      if (ta === '[object Map]') {
        if (a.size !== b.size) return false;
        var okMap = true;
        a.forEach(function (val, key) {
          if (!okMap) return;
          if (!b.has(key) || !equals(val, b.get(key), strict, seen)) okMap = false;
        });
        return okMap;
      }
      if (ta === '[object Set]') {
        if (a.size !== b.size) return false;
        var bVals = Array.from(b);
        return Array.from(a).every(function (val) {
          return b.has(val) || bVals.some(function (bv) { return equals(val, bv, strict, seen); });
        });
      }
      var ka = ownEnumKeys(a);
      var kb = ownEnumKeys(b);
      if (Array.isArray(a)) {
        ka = ka.filter(function (k) { return !/^\d+$/.test(k); });
        kb = kb.filter(function (k) { return !/^\d+$/.test(k); });
      }
      if (!strict) {
        ka = ka.filter(function (k) { return a[k] !== undefined; });
        kb = kb.filter(function (k) { return b[k] !== undefined; });
      }
      if (ka.length !== kb.length) return false;
      for (i = 0; i < ka.length; i++) {
        var k = ka[i];
        if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
        if (!equals(a[k], b[k], strict, seen)) return false;
      }
      return true;
    }
    fe.equals = equals;

    function matchesObject(actual, expected) {
      if (typeof expected !== 'object' || expected === null) return equals(actual, expected);
      if (typeof actual !== 'object' || actual === null) return false;
      if (Array.isArray(expected)) {
        if (!Array.isArray(actual) || actual.length !== expected.length) return false;
        return expected.every(function (v, i) { return matchesObject(actual[i], v); });
      }
      return ownEnumKeys(expected).every(function (k) {
        return k in actual && matchesObject(actual[k], expected[k]);
      });
    }

    // ------------------------------------------------------------ expect
    function AssertionError(message) {
      var e = new Error(message);
      e.name = 'AssertionError';
      e.__assertion = true;
      return e;
    }

    function getPath(obj, path) {
      var parts = Array.isArray(path) ? path : String(path).replace(/\[(\w+)\]/g, '.$1').split('.').filter(Boolean);
      var cur = obj;
      for (var i = 0; i < parts.length; i++) {
        if (cur == null || !(Object(cur) instanceof Object) || !(parts[i] in Object(cur))) return { found: false };
        cur = cur[parts[i]];
      }
      return { found: true, value: cur };
    }

    function errMatches(err, expected) {
      if (expected === undefined) return true;
      var msg = err && err.message !== undefined ? String(err.message) : String(err);
      if (typeof expected === 'string') return msg.indexOf(expected) !== -1;
      if (expected instanceof RegExp) return expected.test(msg);
      if (typeof expected === 'function') return err instanceof expected;
      if (expected && typeof expected === 'object') return err && err.message === expected.message;
      return false;
    }

    function callsText(f) {
      var calls = f.mock.calls;
      if (!calls.length) return 'жодного виклику';
      return calls.slice(0, 10).map(function (args, i) {
        return '  #' + (i + 1) + ': (' + args.map(function (a) { return format(a); }).join(', ') + ')';
      }).join('\n') + (calls.length > 10 ? '\n  …' : '');
    }

    function assertMock(f) {
      if (!f || !f._isMockFunction) throw AssertionError('Цей матчер працює лише з mockFn(), отримано: ' + format(f));
    }

    // Контекст поточної перевірки (expect(...).not / .rejects) — читається матчерами.
    var not = false;
    var fromRejects = false;
    var NOT = function (n) { return n ? 'не ' : ''; };

    var MATCHERS = {
      toBe: function (a, e) {
        var pass = Object.is(a, e);
        var extra = !pass && !not && equals(a, e) ? '\n(значення структурно рівні, але це різні посилання — для об\'єктів використовуйте toEqual)' : '';
        return { pass: pass, msg: 'Очікувалось' + (not ? ' не' : '') + ': ' + format(e) + '\nОтримано:     ' + format(a) + extra };
      },
      toEqual: function (a, e) {
        return { pass: equals(a, e, false), msg: 'Очікувалось ' + NOT(not) + 'рівне: ' + format(e) + '\nОтримано:        ' + format(a) };
      },
      toStrictEqual: function (a, e) {
        return { pass: equals(a, e, true), msg: 'Очікувалось ' + NOT(not) + 'строго рівне: ' + format(e) + '\nОтримано:               ' + format(a) };
      },
      toBeTruthy: function (a) {
        return { pass: !!a, msg: 'Очікувалось ' + NOT(not) + 'truthy значення, отримано: ' + format(a) };
      },
      toBeFalsy: function (a) {
        return { pass: !a, msg: 'Очікувалось ' + NOT(not) + 'falsy значення, отримано: ' + format(a) };
      },
      toBeNull: function (a) {
        return { pass: a === null, msg: 'Очікувалось ' + NOT(not) + 'null, отримано: ' + format(a) };
      },
      toBeUndefined: function (a) {
        return { pass: a === undefined, msg: 'Очікувалось ' + NOT(not) + 'undefined, отримано: ' + format(a) };
      },
      toBeDefined: function (a) {
        return { pass: a !== undefined, msg: 'Очікувалось, що значення ' + (not ? '' : 'не ') + 'буде undefined, отримано: ' + format(a) };
      },
      toBeNaN: function (a) {
        return { pass: Number.isNaN(a), msg: 'Очікувалось ' + NOT(not) + 'NaN, отримано: ' + format(a) };
      },
      toBeGreaterThan: function (a, e) {
        return { pass: a > e, msg: 'Очікувалось ' + NOT(not) + '> ' + format(e) + ', отримано: ' + format(a) };
      },
      toBeGreaterThanOrEqual: function (a, e) {
        return { pass: a >= e, msg: 'Очікувалось ' + NOT(not) + '>= ' + format(e) + ', отримано: ' + format(a) };
      },
      toBeLessThan: function (a, e) {
        return { pass: a < e, msg: 'Очікувалось ' + NOT(not) + '< ' + format(e) + ', отримано: ' + format(a) };
      },
      toBeLessThanOrEqual: function (a, e) {
        return { pass: a <= e, msg: 'Очікувалось ' + NOT(not) + '<= ' + format(e) + ', отримано: ' + format(a) };
      },
      toBeCloseTo: function (a, e, digits) {
        if (digits === undefined) digits = 2;
        var pass = typeof a === 'number' && Math.abs(a - e) < Math.pow(10, -digits) / 2;
        return { pass: pass, msg: 'Очікувалось ' + NOT(not) + '≈ ' + format(e) + ' (точність ' + digits + '), отримано: ' + format(a) };
      },
      toContain: function (a, e) {
        var pass = false;
        if (typeof a === 'string') pass = a.indexOf(e) !== -1;
        else if (a && typeof a[Symbol.iterator] === 'function') pass = Array.from(a).some(function (x) { return Object.is(x, e); });
        return { pass: pass, msg: 'Очікувалось, що ' + format(a) + ' ' + NOT(not) + 'містить ' + format(e) };
      },
      toContainEqual: function (a, e) {
        var pass = !!a && Array.from(a).some(function (x) { return equals(x, e); });
        return { pass: pass, msg: 'Очікувалось, що ' + format(a) + ' ' + NOT(not) + 'містить елемент, рівний ' + format(e) };
      },
      toHaveLength: function (a, n) {
        var len = a != null ? a.length : undefined;
        return { pass: len === n, msg: 'Очікувалась довжина ' + NOT(not) + n + ', отримано: ' + format(len) + ' (' + format(a) + ')' };
      },
      toHaveProperty: function (a, path, value) {
        var hasValue = arguments.length >= 3;
        var r = getPath(a, path);
        var pass = r.found && (!hasValue || equals(r.value, value));
        return {
          pass: pass,
          msg: 'Очікувалось, що об\'єкт ' + NOT(not) + 'має властивість "' + path + '"' +
            (hasValue ? ' зі значенням ' + format(value) : '') +
            (r.found ? ', поточне значення: ' + format(r.value) : ', але її немає') + '\nОб\'єкт: ' + format(a)
        };
      },
      toMatch: function (a, e) {
        var pass = typeof a === 'string' && (e instanceof RegExp ? e.test(a) : a.indexOf(e) !== -1);
        return { pass: pass, msg: 'Очікувалось, що ' + format(a) + ' ' + NOT(not) + 'відповідає ' + format(e) };
      },
      toMatchObject: function (a, e) {
        return { pass: matchesObject(a, e), msg: 'Очікувалось, що об\'єкт ' + NOT(not) + 'містить ' + format(e) + '\nОтримано: ' + format(a) };
      },
      toBeInstanceOf: function (a, C) {
        var pass = a instanceof C;
        var actualName = a != null && Object.getPrototypeOf(Object(a)) && Object.getPrototypeOf(Object(a)).constructor ? Object.getPrototypeOf(Object(a)).constructor.name : String(a);
        return { pass: pass, msg: 'Очікувалось, що значення ' + NOT(not) + 'є екземпляром ' + (C && C.name) + ', отримано екземпляр ' + actualName };
      },
      toBeTypeOf: function (a, type) {
        return { pass: typeof a === type, msg: 'Очікувалось typeof ' + NOT(not) + '"' + type + '", отримано "' + typeof a + '"' };
      },
      toSatisfy: function (a, pred) {
        return { pass: !!pred(a), msg: 'Значення ' + format(a) + ' ' + NOT(not) + 'задовольняє умову' };
      },
      toThrow: function (a, expected) {
        var threw = false;
        var err;
        if (fromRejects) {
          threw = true;
          err = a;
        } else {
          if (typeof a !== 'function') {
            throw AssertionError('toThrow очікує функцію: expect(() => код).toThrow()');
          }
          try { a(); } catch (e) { threw = true; err = e; }
        }
        var pass = threw && errMatches(err, expected);
        var what = expected === undefined ? 'помилку' : 'помилку ' + (typeof expected === 'function' ? expected.name : format(expected));
        return {
          pass: pass,
          msg: 'Очікувалось, що функція ' + NOT(not) + 'кине ' + what + (threw ? ', кинуто: ' + format(err) : ', але вона нічого не кинула')
        };
      },
      toHaveBeenCalled: function (f) {
        assertMock(f);
        return { pass: f.mock.calls.length > 0, msg: 'Очікувалось, що функцію ' + (not ? 'не буде викликано' : 'буде викликано') + '. Виклики:\n' + callsText(f) };
      },
      toHaveBeenCalledTimes: function (f, n) {
        assertMock(f);
        return { pass: f.mock.calls.length === n, msg: 'Очікувалось ' + NOT(not) + n + ' викликів, було ' + f.mock.calls.length + ':\n' + callsText(f) };
      },
      toHaveBeenCalledWith: function (f) {
        assertMock(f);
        var args = slice.call(arguments, 1);
        var pass = f.mock.calls.some(function (c) { return equals(c, args); });
        return { pass: pass, msg: 'Очікувався ' + NOT(not) + 'виклик з (' + args.map(function (x) { return format(x); }).join(', ') + ')\nФактичні виклики:\n' + callsText(f) };
      },
      toHaveBeenLastCalledWith: function (f) {
        assertMock(f);
        var args = slice.call(arguments, 1);
        var last = f.mock.calls[f.mock.calls.length - 1];
        var pass = !!last && equals(last, args);
        return { pass: pass, msg: 'Очікувався ' + NOT(not) + 'останній виклик з (' + args.map(function (x) { return format(x); }).join(', ') + ')\nФактичні виклики:\n' + callsText(f) };
      }
    };

    function buildMatchers(actual, negate, mode) {
      var api = {};
      Object.keys(MATCHERS).forEach(function (name) {
        api[name] = function () {
          var args = slice.call(arguments);
          var check = function (value, rejected) {
            not = !!negate;
            fromRejects = !!rejected;
            var r;
            try {
              r = MATCHERS[name].apply(null, [value].concat(args));
            } finally {
              not = false;
              fromRejects = false;
            }
            if (r.pass === !!negate) throw AssertionError(r.msg);
          };
          if (!mode) return check(actual, false);
          return Promise.resolve(actual).then(
            function (v) {
              if (mode === 'rejects') throw AssertionError('Очікувалось, що проміс буде відхилено (rejected), але він виконався зі значенням ' + format(v));
              check(v, false);
            },
            function (err) {
              if (err && err.__assertion) throw err;
              if (mode === 'resolves') throw AssertionError('Очікувалось, що проміс виконається (resolved), але він відхилений: ' + format(err));
              check(err, true);
            }
          );
        };
      });
      return api;
    }

    function expect(actual) {
      var api = buildMatchers(actual, false);
      api.not = buildMatchers(actual, true);
      api.resolves = buildMatchers(actual, false, 'resolves');
      api.resolves.not = buildMatchers(actual, true, 'resolves');
      api.rejects = buildMatchers(actual, false, 'rejects');
      api.rejects.not = buildMatchers(actual, true, 'rejects');
      return api;
    }

    function assert(cond, message) {
      if (!cond) throw AssertionError(message || 'Умова не виконалась');
    }

    // ------------------------------------------------------------ mockFn
    function mockFn(impl) {
      var once = [];
      var f = function () {
        var args = slice.call(arguments);
        f.mock.calls.push(args);
        f.mock.contexts.push(this);
        var current = once.length ? once.shift() : f._impl;
        try {
          var r = current ? (new.target ? Reflect.construct(current, args) : current.apply(this, args)) : undefined;
          f.mock.results.push({ type: 'return', value: r });
          return r;
        } catch (e) {
          f.mock.results.push({ type: 'throw', value: e });
          throw e;
        }
      };
      f._isMockFunction = true;
      f._impl = impl;
      f.mock = { calls: [], results: [], contexts: [] };
      f.mockImplementation = function (fn) { f._impl = fn; return f; };
      f.mockImplementationOnce = function (fn) { once.push(fn); return f; };
      f.mockReturnValue = function (v) { f._impl = function () { return v; }; return f; };
      f.mockReturnValueOnce = function (v) { once.push(function () { return v; }); return f; };
      f.mockResolvedValue = function (v) { f._impl = function () { return Promise.resolve(v); }; return f; };
      f.mockRejectedValue = function (v) { f._impl = function () { return Promise.reject(v); }; return f; };
      f.mockClear = function () { f.mock.calls = []; f.mock.results = []; f.mock.contexts = []; return f; };
      Object.defineProperty(f, 'calls', { get: function () { return f.mock.calls; } });
      Object.defineProperty(f, 'callCount', { get: function () { return f.mock.calls.length; } });
      return f;
    }

    // ------------------------------------------------------------ fake timers
    var fake = null;
    function useFakeTimers(startTime) {
      if (fake) return;
      fake = { now: startTime || 0, seq: 0, nextId: 1, timers: new Map() };
      function schedule(cb, ms, args, repeat) {
        var id = fake.nextId++;
        var delay = Math.max(0, Number(ms) || 0);
        fake.timers.set(id, { id: id, at: fake.now + delay, seq: fake.seq++, cb: cb, args: args, interval: repeat ? Math.max(1, delay) : null });
        return id;
      }
      G.setTimeout = function (cb, ms) { return schedule(cb, ms, slice.call(arguments, 2), false); };
      G.setInterval = function (cb, ms) { return schedule(cb, ms, slice.call(arguments, 2), true); };
      G.clearTimeout = G.clearInterval = function (id) { if (fake) fake.timers.delete(id); };
      Date.now = function () { return fake.now; };
      try { Object.defineProperty(G.performance, 'now', { value: function () { return fake.now; }, configurable: true, writable: true }); } catch (e) { /* noop */ }
    }
    function nextTimer(limit) {
      var next = null;
      fake.timers.forEach(function (t) {
        if (t.at <= limit && (!next || t.at < next.at || (t.at === next.at && t.seq < next.seq))) next = t;
      });
      return next;
    }
    function fire(t) {
      fake.now = Math.max(fake.now, t.at);
      if (t.interval !== null) {
        t.at += t.interval;
        t.seq = fake.seq++;
      } else {
        fake.timers.delete(t.id);
      }
      if (typeof t.cb === 'function') t.cb.apply(null, t.args);
    }
    function requireFake() {
      if (!fake) throw AssertionError('Спочатку викличте useFakeTimers()');
    }
    function advanceTimersByTime(ms) {
      requireFake();
      var target = fake.now + Math.max(0, ms || 0);
      var guard = 0;
      var t;
      while ((t = nextTimer(target)) && guard++ < 100000) fire(t);
      fake.now = target;
    }
    function runAllTimers() {
      requireFake();
      var guard = 0;
      var t;
      while ((t = nextTimer(Infinity)) && guard++ < 10000) fire(t);
      if (guard >= 10000) throw AssertionError('runAllTimers: забагато таймерів (нескінченний setInterval?)');
    }
    function runOnlyPendingTimers() {
      requireFake();
      var pending = Array.from(fake.timers.values()).sort(function (a, b) { return a.at - b.at || a.seq - b.seq; });
      pending.forEach(function (t) { if (fake.timers.has(t.id)) fire(t); });
    }
    function getTimerCount() {
      return fake ? fake.timers.size : 0;
    }
    function useRealTimers() {
      if (!fake) return;
      fake = null;
      G.setTimeout = realSetTimeout;
      G.clearTimeout = realClearTimeout;
      G.setInterval = realSetInterval;
      G.clearInterval = realClearInterval;
      Date.now = realDateNow;
      try { delete G.performance.now; } catch (e) { /* noop */ }
    }

    function sleep(ms) {
      return new Promise(function (r) { realSetTimeout(r, ms || 0); });
    }
    function flushPromises() {
      return new Promise(function (r) { realSetTimeout(r, 0); });
    }

    // ------------------------------------------------------------ mockFetch
    function abortError() {
      try { return new DOMException('The operation was aborted.', 'AbortError'); } catch (e) {
        var err = new Error('The operation was aborted.');
        err.name = 'AbortError';
        return err;
      }
    }
    function toResponse(value) {
      if (typeof Response === 'function' && value instanceof Response) return value;
      var spec = value && typeof value === 'object' && ('status' in value || 'body' in value) && !Array.isArray(value)
        ? value
        : { status: 200, body: value };
      var body = spec.body;
      var headers = Object.assign({}, spec.headers || {});
      var text;
      if (typeof body === 'string') text = body;
      else if (body === undefined || body === null) text = '';
      else {
        text = JSON.stringify(body);
        if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
      }
      var status = spec.status || 200;
      var nullBody = status === 204 || status === 205 || status === 304;
      return new Response(nullBody ? null : text, { status: status, statusText: spec.statusText || '', headers: headers });
    }
    function mockFetch(handler) {
      var f = mockFn(function (input, init) {
        init = init || {};
        var url = typeof input === 'string' ? input : input && input.url ? input.url : String(input);
        var signal = init.signal;
        return new Promise(function (resolve, reject) {
          if (signal && signal.aborted) return reject(abortError());
          var settled = false;
          var onAbort = function () {
            if (settled) return;
            settled = true;
            reject(abortError());
          };
          if (signal) signal.addEventListener('abort', onAbort);
          Promise.resolve()
            .then(function () { return typeof handler === 'function' ? handler(url, init) : handler; })
            .then(function (value) {
              var delay = value && typeof value === 'object' && !Array.isArray(value) && value.delay ? value.delay : 0;
              var finish = function () {
                if (settled) return;
                settled = true;
                if (signal) signal.removeEventListener('abort', onAbort);
                if (value instanceof Error) reject(value);
                else resolve(toResponse(value));
              };
              if (delay) G.setTimeout(finish, delay);
              else finish();
            }, function (err) {
              if (settled) return;
              settled = true;
              reject(err);
            });
        });
      });
      G.fetch = f;
      return f;
    }

    // ------------------------------------------------------------ storage polyfills
    function MemoryStorage() {
      var data = new Map();
      var api = {
        getItem: function (k) { k = String(k); return data.has(k) ? data.get(k) : null; },
        setItem: function (k, v) { data.set(String(k), String(v)); },
        removeItem: function (k) { data.delete(String(k)); },
        clear: function () { data.clear(); },
        key: function (i) { return Array.from(data.keys())[i] === undefined ? null : Array.from(data.keys())[i]; }
      };
      Object.defineProperty(api, 'length', { get: function () { return data.size; } });
      return new Proxy(api, {
        get: function (t, p) {
          if (p in t || typeof p === 'symbol') return t[p];
          return data.has(p) ? data.get(p) : undefined;
        },
        set: function (t, p, v) { data.set(String(p), String(v)); return true; },
        has: function (t, p) { return p in t || data.has(p); },
        deleteProperty: function (t, p) { data.delete(String(p)); return true; },
        ownKeys: function () { return Array.from(data.keys()); },
        getOwnPropertyDescriptor: function (t, p) {
          if (data.has(p)) return { value: data.get(p), enumerable: true, configurable: true, writable: true };
          return undefined;
        }
      });
    }
    ['localStorage', 'sessionStorage'].forEach(function (name) {
      var works = false;
      try { works = !!G[name] && (G[name].getItem('__fe') === null || true); } catch (e) { works = false; }
      if (!works) {
        try { Object.defineProperty(G, name, { value: MemoryStorage(), configurable: true, writable: true }); } catch (e) { /* noop */ }
      }
    });
    if (G.document) {
      var cookieWorks = true;
      try { void G.document.cookie; } catch (e) { cookieWorks = false; }
      if (!cookieWorks) {
        var jar = new Map();
        Object.defineProperty(G.document, 'cookie', {
          configurable: true,
          get: function () {
            var now = Date.now();
            var out = [];
            jar.forEach(function (c, k) {
              if (c.expires && c.expires <= now) jar.delete(k);
              else out.push(k + '=' + c.value);
            });
            return out.join('; ');
          },
          set: function (str) {
            var parts = String(str).split(';');
            var first = parts.shift();
            var eq = first.indexOf('=');
            if (eq === -1) return;
            var key = first.slice(0, eq).trim();
            var value = first.slice(eq + 1).trim();
            var expires = null;
            parts.forEach(function (p) {
              var kv = p.split('=');
              var attr = kv[0].trim().toLowerCase();
              var val = kv.slice(1).join('=').trim();
              if (attr === 'max-age') expires = Date.now() + Number(val) * 1000;
              if (attr === 'expires') expires = new Date(val).getTime();
            });
            if (expires !== null && expires <= Date.now()) jar.delete(key);
            else jar.set(key, { value: value, expires: expires });
          }
        });
      }
    }

    // ------------------------------------------------------------ console capture
    var logs = [];
    var posted = 0;
    var LOG_LIMIT = 300;
    ['log', 'info', 'warn', 'error', 'debug', 'dir', 'table'].forEach(function (level) {
      G.console[level] = function () {
        var text = slice.call(arguments).map(function (a) { return format(a, 0, [], true); }).join(' ');
        logs.push(text);
        posted++;
        if (posted <= LOG_LIMIT) post({ type: 'log', level: level, text: text.length > 5000 ? text.slice(0, 5000) + '…' : text, phase: fe.phase });
        else if (posted === LOG_LIMIT + 1) post({ type: 'log', level: 'warn', text: '… занадто багато повідомлень, решту приховано', phase: fe.phase });
      };
    });
    function getLogs() { return logs.slice(); }
    function clearLogs() { logs.length = 0; }

    if (G.alert || G.document) {
      G.alert = function (m) { G.console.log('[alert] ' + m); };
      G.confirm = function (m) { G.console.log('[confirm] ' + m); return true; };
      G.prompt = function (m, d) { G.console.log('[prompt] ' + m); return d === undefined ? '' : d; };
    }

    // ------------------------------------------------------------ errors
    function errorInfo(e) {
      if (!e || typeof e !== 'object') {
        return { name: 'Thrown', message: 'Кинуто не-Error значення: ' + format(e), stack: '' };
      }
      var info = {
        name: e.name || 'Error',
        message: e.message !== undefined ? String(e.message) : format(e),
        assertion: !!e.__assertion,
        stack: ''
      };
      var stack = String(e.stack || '');
      var offset = env.lineOffset || 0;
      var userLines = env.userLines || Infinity;
      function userLine(line) {
        var l = Number(line) - offset;
        return l >= 1 && l <= userLines ? l : null;
      }
      if (env.userUrl) {
        var re = new RegExp(env.userUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':(\\d+):(\\d+)', 'g');
        var m;
        while ((m = re.exec(stack))) {
          var ul = userLine(m[1]);
          if (ul) { info.line = ul; break; }
        }
      }
      if (!info.assertion) {
        info.stack = stack.split('\n').filter(function (l) {
          return /^\s+at /.test(l);
        }).map(function (l) {
          var keep = false;
          var out = l.replace(/\(?(blob:[^)\s]+|about:srcdoc):(\d+):(\d+)\)?/g, function (all, url, line, col) {
            var ul = url === env.userUrl ? userLine(line) : null;
            if (ul) { keep = true; return '(ваш код, рядок ' + ul + ':' + col + ')'; }
            return '';
          }).replace(/\(?eval at [^)]*\)?,?\s*<anonymous>:(\d+):(\d+)\)?/g, function (all, line) {
            keep = true;
            return '(тест, рядок ' + Math.max(1, Number(line) - 2) + ')';
          });
          return keep ? out : null;
        }).filter(Boolean).slice(0, 4).join('\n');
      }
      return info;
    }
    fe.errorInfo = errorInfo;

    // ------------------------------------------------------------ DOM helpers
    var dom = {};
    if (G.document) {
      dom.$ = function (sel, root) { return (root || G.document).querySelector(sel); };
      dom.$$ = function (sel, root) { return Array.from((root || G.document).querySelectorAll(sel)); };
      dom.css = function (el, prop) {
        if (typeof el === 'string') el = dom.$(el);
        if (!el) throw AssertionError('css(): елемент не знайдено');
        var cs = G.getComputedStyle(el);
        return prop ? cs.getPropertyValue(prop) : cs;
      };
      dom.rect = function (el) {
        if (typeof el === 'string') {
          var found = dom.$(el);
          if (!found) throw AssertionError('rect(): елемент "' + el + '" не знайдено');
          el = found;
        }
        if (!el) throw AssertionError('rect(): елемент не знайдено');
        return el.getBoundingClientRect();
      };
      dom.click = function (el, init) {
        if (typeof el === 'string') el = dom.$(el);
        if (!el) throw AssertionError('click(): елемент не знайдено');
        var ev = new G.MouseEvent('click', Object.assign({ bubbles: true, cancelable: true, view: G }, init || {}));
        el.dispatchEvent(ev);
        return ev;
      };
      dom.dispatch = function (el, type, init, Ctor) {
        if (typeof el === 'string') el = dom.$(el);
        if (!el) throw AssertionError('dispatch(): елемент не знайдено');
        var C = Ctor || G.Event;
        var ev = new C(type, Object.assign({ bubbles: true, cancelable: true }, init || {}));
        el.dispatchEvent(ev);
        return ev;
      };
      dom.input = function (el, value) {
        if (typeof el === 'string') el = dom.$(el);
        if (!el) throw AssertionError('input(): елемент не знайдено');
        el.focus && el.focus();
        el.value = value;
        el.dispatchEvent(new G.Event('input', { bubbles: true }));
        el.dispatchEvent(new G.Event('change', { bubbles: true }));
        return el;
      };
      dom.press = function (el, key, init) {
        if (typeof el === 'string') el = dom.$(el);
        if (!el) throw AssertionError('press(): елемент не знайдено');
        var opts = Object.assign({ key: key, bubbles: true, cancelable: true }, init || {});
        var down = new G.KeyboardEvent('keydown', opts);
        el.dispatchEvent(down);
        el.dispatchEvent(new G.KeyboardEvent('keyup', opts));
        return down;
      };
      dom.submit = function (form) {
        if (typeof form === 'string') form = dom.$(form);
        if (!form) throw AssertionError('submit(): форму не знайдено');
        fe.lastSubmit = null;
        if (form.requestSubmit) form.requestSubmit();
        else form.dispatchEvent(new G.Event('submit', { bubbles: true, cancelable: true }));
        return { prevented: fe.lastSubmit ? fe.lastSubmit.prevented : false, fired: !!fe.lastSubmit };
      };
      dom.nextFrame = function () {
        return new Promise(function (r) { G.requestAnimationFrame(function () { G.requestAnimationFrame(function () { r(); }); }); });
      };
      dom.waitFor = function (cond, timeout) {
        var limit = realPerfNow() + (timeout || 1000);
        return new Promise(function (resolve, reject) {
          (function loop() {
            var ok = false;
            var err;
            try { ok = cond(); } catch (e) { err = e; }
            if (ok) return resolve(ok);
            if (realPerfNow() > limit) return reject(err && err.__assertion ? err : AssertionError('waitFor: умова не виконалась за ' + (timeout || 1000) + 'мс'));
            realSetTimeout(loop, 16);
          })();
        });
      };
      fe.installGuards = function () {
        // Запобігаємо навігації iframe (втратили б тести) і запамʼятовуємо, чи код скасував дію.
        G.addEventListener('submit', function (e) {
          fe.lastSubmit = { prevented: e.defaultPrevented };
          // form method="dialog" лише закриває <dialog> — навігації немає, не заважаємо.
          if (e.target && String(e.target.method).toLowerCase() === 'dialog') return;
          e.preventDefault();
        });
        G.addEventListener('click', function (e) {
          var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
          if (a && !/^#/.test(a.getAttribute('href') || '')) e.preventDefault();
        });
      };
    }

    // ------------------------------------------------------------ globals for tests
    var api = {
      expect: expect,
      assert: assert,
      mockFn: mockFn,
      useFakeTimers: useFakeTimers,
      useRealTimers: useRealTimers,
      advanceTimersByTime: advanceTimersByTime,
      runAllTimers: runAllTimers,
      runOnlyPendingTimers: runOnlyPendingTimers,
      getTimerCount: getTimerCount,
      sleep: sleep,
      flushPromises: flushPromises,
      mockFetch: mockFetch,
      getLogs: getLogs,
      clearLogs: clearLogs,
      format: function (v) { return format(v); },
      deepEqual: function (a, b) { return equals(a, b); }
    };
    api.jest = {
      fn: mockFn,
      useFakeTimers: useFakeTimers,
      useRealTimers: useRealTimers,
      advanceTimersByTime: advanceTimersByTime,
      runAllTimers: runAllTimers,
      runOnlyPendingTimers: runOnlyPendingTimers
    };
    Object.keys(dom).forEach(function (k) { api[k] = dom[k]; });
    var helperNames = Object.keys(api);
    var helperValues = helperNames.map(function (k) { return api[k]; });
    Object.keys(api).forEach(function (k) {
      try { Object.defineProperty(G, k, { value: api[k], configurable: true, writable: true, enumerable: false }); } catch (e) { /* noop */ }
    });

    // ------------------------------------------------------------ test runner
    fe.runTests = function (tests, perTestTimeout) {
      fe.phase = 'tests';
      var index = 0;
      function restore() {
        useRealTimers();
        if (G.fetch !== realFetch) G.fetch = realFetch;
      }
      function next() {
        if (index >= tests.length) {
          post({ type: 'done' });
          return;
        }
        var i = index++;
        var test = tests[i];
        var start = realPerfNow();
        post({ type: 'test-start', index: i });
        var timer;
        var compiled;
        try {
          // Хелпери передаються параметрами: функції користувача з тими ж іменами (sleep, format…) їх не перекриють.
          compiled = new AsyncFunction(helperNames.join(", "), test.code);
        } catch (e) {
          post({ type: 'test', index: i, pass: false, ms: 0, error: { name: 'TestSyntaxError', message: 'Синтаксична помилка в самому тесті: ' + e.message, stack: '' } });
          return next();
        }
        var timeout = new Promise(function (_, reject) {
          timer = realSetTimeout(function () {
            reject({ __timeout: true });
          }, perTestTimeout);
        });
        Promise.race([Promise.resolve().then(function () { return compiled.apply(undefined, helperValues); }), timeout]).then(
          function () {
            realClearTimeout(timer);
            restore();
            var took = Math.round(realPerfNow() - start);
            // Синхронний код блокує таймер Promise.race, тож перевіряємо тривалість постфактум.
            if (took > perTestTimeout) {
              post({ type: 'test', index: i, pass: false, ms: took, error: { name: 'Timeout', message: 'Тест виконувався ' + took + 'мс — довше за ліміт ' + perTestTimeout + 'мс. Ймовірно, алгоритм заповільний (перевірте складність).', stack: '' } });
            } else {
              post({ type: 'test', index: i, pass: true, ms: took });
            }
            next();
          },
          function (err) {
            realClearTimeout(timer);
            restore();
            var info = err && err.__timeout
              ? { name: 'Timeout', message: 'Тест не завершився за ' + perTestTimeout + 'мс (проміс ніколи не виконався? забули resolve/return?)', stack: '' }
              : errorInfo(err);
            post({ type: 'test', index: i, pass: false, ms: Math.round(realPerfNow() - start), error: info });
            next();
          }
        );
      }
      next();
    };

    // ------------------------------------------------------------ console (REPL)
    // Обчислення виразу в глобальній області (бачить const/let/function з коду користувача).
    fe.evalExpr = function (id, code) {
      fe.phase = 'repl';
      var src = String(code);
      var result;
      try {
        var trimmed = src.trim();
        // «{ a: 1 }» у консолі — це об'єкт, а не блок (як у DevTools)
        if (/^\{[\s\S]*\}$/.test(trimmed)) {
          try { result = (0, eval)('(' + trimmed + ')'); } catch (e1) { result = (0, eval)(src); }
        } else {
          result = (0, eval)(src);
        }
      } catch (e) {
        post({ type: 'eval-result', id: id, error: errorInfo(e) });
        return;
      }
      if (result && typeof result.then === 'function') {
        post({ type: 'eval-result', id: id, text: 'Promise {<pending>}', pending: true });
        Promise.resolve(result).then(function (v) {
          post({ type: 'eval-result', id: id, text: 'Promise {<fulfilled>: ' + format(v) + '}', late: true });
        }, function (err) {
          post({ type: 'eval-result', id: id, error: errorInfo(err), late: true, prefix: 'Promise {<rejected>} ' });
        });
        return;
      }
      post({ type: 'eval-result', id: id, text: format(result) });
    };

    // Необроблені відхилення промісів у коді користувача — показуємо в консолі.
    if (G.addEventListener) {
      G.addEventListener('unhandledrejection', function (e) {
        var r = e.reason;
        if (r && r.__timeout) return;
        G.console.warn('Unhandled promise rejection: ' + format(r));
      });
    }
  }

  // =====================================================================
  //  MAIN THREAD
  // =====================================================================
  var DEFAULT_TEST_TIMEOUT = 2000;
  var HARNESS_SRC = '(' + feHarness.toString() + ')';
  var runCounter = 0;

  function makeResult(tests) {
    return {
      status: 'running',
      userError: null,
      harnessError: null,
      tests: tests.map(function (t) {
        return { name: t.name, code: t.code, pass: null, ms: 0, error: null };
      }),
      logs: [],
      timedOut: false,
      startedAt: performance.now(),
      durationMs: 0
    };
  }

  function finalize(result) {
    result.durationMs = Math.round(performance.now() - result.startedAt);
    var anyFail = result.tests.some(function (t) { return t.pass === false; });
    var allPass = result.tests.length > 0 && result.tests.every(function (t) { return t.pass === true; });
    if (result.userError && result.userError.syntax) result.status = 'error';
    else if (result.timedOut) result.status = 'timeout';
    else if (allPass && !result.harnessError) result.status = 'passed';
    else if (anyFail || result.harnessError || result.userError) result.status = 'failed';
    else result.status = 'failed';
    return result;
  }

  function handleMessage(result, msg, hooks) {
    switch (msg.type) {
      case 'log':
        result.logs.push({ level: msg.level, text: msg.text, phase: msg.phase });
        if (hooks.onLog) hooks.onLog(msg);
        break;
      case 'user-error':
        result.userError = msg.error;
        result.userError.syntax = !!msg.syntax;
        break;
      case 'harness-error':
        result.harnessError = msg.error;
        break;
      case 'test-start':
        result.current = msg.index;
        break;
      case 'test':
        var t = result.tests[msg.index];
        if (t) {
          t.pass = msg.pass;
          t.ms = msg.ms;
          t.error = msg.error || null;
        }
        result.current = null;
        if (hooks.onProgress) hooks.onProgress(result);
        break;
    }
  }

  function markTimeout(result) {
    result.timedOut = true;
    var idx = result.current;
    result.tests.forEach(function (t, i) {
      if (t.pass === null) {
        t.pass = false;
        t.error = i === idx
          ? { name: 'Timeout', message: 'Виконання зависло (нескінченний цикл або дуже повільний алгоритм)', stack: '' }
          : { name: 'Skipped', message: 'Не виконано через попередній таймаут', stack: '', skipped: true };
      }
    });
  }

  // ------------------------------------------------------------ JS (Worker)
  function locateSyntaxError(code) {
    // Окремий worker лише з кодом користувача: ErrorEvent містить номер рядка синтаксичної помилки.
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
      var w;
      var done = function (info) {
        try { w && w.terminate(); } catch (e) { /* noop */ }
        URL.revokeObjectURL(url);
        resolve(info);
      };
      try {
        w = new Worker(url);
      } catch (e) {
        return done(null);
      }
      w.onerror = function (e) {
        e.preventDefault();
        done({ line: e.lineno, col: e.colno, message: e.message });
      };
      setTimeout(function () { done(null); }, 800);
    });
  }

  function runCode(opts, hooks) {
    hooks = hooks || {};
    var tests = opts.tests || [];
    var perTest = opts.testTimeout || DEFAULT_TEST_TIMEOUT;
    var result = makeResult(tests);
    var code = String(opts.code || '');
    var userLines = code.split('\n').length;
    var testsPayload = JSON.stringify(tests.map(function (t) { return { name: t.name, code: t.code }; }));
    // Код користувача вбудовується в головний скрипт воркера (importScripts(blob:) заборонено на file://).
    // Тести стартують через setTimeout, тож виконаються навіть якщо код користувача кине помилку.
    // OFFSET — кількість рядків перед кодом користувача (для коректних номерів рядків у помилках).
    var prefixLines = function (offset) {
      return [
        HARNESS_SRC + '(self, { post: function (m) { self.postMessage(m); }, userUrl: String(self.location.href), lineOffset: ' + offset + ', userLines: ' + userLines + ' });',
        'self.__fe.phase = "user";',
        'self.onerror = function (message, file, line, col, err) {',
        '  var info = self.__fe.errorInfo(err || { name: "Error", message: String(message) });',
        '  if (self.__fe.phase === "user") {',
        '    if (!info.line && line) { var l = line - ' + offset + '; if (l >= 1) info.line = l; }',
        '    self.__fe.post({ type: "user-error", error: info, syntax: false });',
        '  } else {',
        '    self.__fe.post({ type: "log", level: "error", text: "Uncaught " + info.name + ": " + info.message + (info.line ? " (рядок " + info.line + ")" : ""), phase: self.__fe.phase });',
        '  }',
        '  return true;',
        '};',
        'setTimeout(function () { self.__fe.post({ type: "user-done" }); self.__fe.runTests(' + testsPayload + ', ' + perTest + '); }, 0);',
        'self.__fe.post({ type: "ready" });',
        ''
      ].join('\n');
    };
    var offset = prefixLines(0).split('\n').length - 1;
    var main = prefixLines(offset) + code + '\n';
    var mainUrl = URL.createObjectURL(new Blob([main], { type: 'text/javascript' }));

    return new Promise(function (resolve) {
      var worker;
      var watchdog;
      var finished = false;
      var ready = false;
      var idle = opts.idleTimeout || perTest + 1500;

      function cleanup() {
        clearTimeout(watchdog);
        try { worker && worker.terminate(); } catch (e) { /* noop */ }
        URL.revokeObjectURL(mainUrl);
      }
      function finish() {
        if (finished) return;
        finished = true;
        cleanup();
        var syntaxErr = result.userError && result.userError.syntax;
        var after = syntaxErr && !result.userError.line ? locateSyntaxError(code) : Promise.resolve(null);
        after.then(function (loc) {
          if (loc && loc.line) result.userError.line = loc.line;
          if (syntaxErr) {
            result.tests.forEach(function (t) {
              t.pass = false;
              t.error = { name: 'Skipped', message: 'Не виконано: синтаксична помилка в коді', stack: '', skipped: true };
            });
          }
          resolve(finalize(result));
        });
      }
      function arm() {
        clearTimeout(watchdog);
        watchdog = setTimeout(function () {
          markTimeout(result);
          if (!result.userDone) {
            result.userError = { name: 'Timeout', message: 'Код виконувався занадто довго — схоже на нескінченний цикл', stack: '' };
          }
          finish();
        }, idle);
      }

      try {
        worker = new Worker(mainUrl);
      } catch (e) {
        result.harnessError = { name: 'WorkerError', message: 'Не вдалося запустити Web Worker: ' + e.message };
        return finish();
      }
      worker.onmessage = function (ev) {
        var msg = ev.data;
        if (!msg || !msg.type) return;
        arm();
        if (msg.type === 'ready') { ready = true; return; }
        if (msg.type === 'user-done') result.userDone = true;
        if (msg.type === 'done') return finish();
        handleMessage(result, msg, hooks);
      };
      worker.onerror = function (ev) {
        ev.preventDefault();
        if (!ready) {
          // Скрипт воркера не розпарсився → синтаксична помилка в коді користувача.
          var line = ev.lineno ? ev.lineno - offset : null;
          result.userError = {
            name: 'SyntaxError',
            message: String(ev.message || 'Синтаксична помилка').replace(/^Uncaught\s+/, '').replace(/^SyntaxError:\s*/, ''),
            line: line && line >= 1 && line <= userLines ? line : null,
            stack: '',
            syntax: true
          };
          return finish();
        }
        var text = 'Uncaught ' + String(ev.message || 'Error').replace(/^Uncaught\s+/, '');
        result.logs.push({ level: 'error', text: text });
        if (hooks.onLog) hooks.onLog({ level: 'error', text: text });
      };
      arm();
    });
  }

  // ------------------------------------------------------------ loop protection
  /*
   * sandbox-iframe виконується в тому ж потоці, що й сторінка, тож нескінченний цикл
   * у DOM-задачі заморозив би весь застосунок. Вставляємо охорону в заголовки циклів:
   *   while (cond)          → while (__feLoopGuard() && (cond))
   *   for (a; cond; b)      → for (a; __feLoopGuard() && (cond); b)
   *   for (;;)              → for (; __feLoopGuard(); )
   * Переносів рядків не додаємо — номери рядків у помилках зберігаються.
   */
  var REGEX_PREV_WORDS = /^(return|typeof|instanceof|in|of|new|delete|void|throw|case|do|else|yield|await)$/;
  function tokenize(src) {
    var tokens = [];
    var i = 0;
    var n = src.length;
    var lastSig = null;
    function push(type, start, end) {
      var t = { type: type, start: start, end: end, value: src.slice(start, end) };
      tokens.push(t);
      if (type !== 'ws' && type !== 'comment') lastSig = t;
    }
    function skipString(q, from) {
      var j = from + 1;
      while (j < n && src[j] !== q) {
        if (src[j] === '\\') j++;
        else if (src[j] === '\n') break;
        j++;
      }
      return Math.min(n, j + 1);
    }
    function skipTemplate(from) {
      var j = from + 1;
      while (j < n) {
        var c = src[j];
        if (c === '\\') { j += 2; continue; }
        if (c === '`') return j + 1;
        if (c === '$' && src[j + 1] === '{') {
          j = skipExpr(j + 2);
          continue;
        }
        j++;
      }
      return n;
    }
    function skipExpr(from) {
      // до парної } (з урахуванням вкладених рядків/шаблонів/дужок)
      var depth = 1;
      var j = from;
      while (j < n && depth > 0) {
        var c = src[j];
        if (c === '"' || c === "'") { j = skipString(c, j); continue; }
        if (c === '`') { j = skipTemplate(j); continue; }
        if (c === '/' && src[j + 1] === '/') { while (j < n && src[j] !== '\n') j++; continue; }
        if (c === '/' && src[j + 1] === '*') { var e = src.indexOf('*/', j + 2); j = e === -1 ? n : e + 2; continue; }
        if (c === '{') depth++;
        else if (c === '}') depth--;
        j++;
      }
      return j;
    }
    function regexAllowed() {
      if (!lastSig) return true;
      if (lastSig.type === 'punct') return /[(,=:[!&|?{};+\-*%<>~^]$/.test(lastSig.value);
      if (lastSig.type === 'word') return REGEX_PREV_WORDS.test(lastSig.value);
      return false;
    }
    while (i < n) {
      var c = src[i];
      var start = i;
      if (/\s/.test(c)) {
        while (i < n && /\s/.test(src[i])) i++;
        push('ws', start, i);
      } else if (c === '/' && src[i + 1] === '/') {
        while (i < n && src[i] !== '\n') i++;
        push('comment', start, i);
      } else if (c === '/' && src[i + 1] === '*') {
        var end = src.indexOf('*/', i + 2);
        i = end === -1 ? n : end + 2;
        push('comment', start, i);
      } else if (c === '"' || c === "'") {
        i = skipString(c, i);
        push('str', start, i);
      } else if (c === '`') {
        i = skipTemplate(i);
        push('str', start, i);
      } else if (c === '/' && regexAllowed()) {
        var j = i + 1;
        var inClass = false;
        while (j < n && src[j] !== '\n') {
          if (src[j] === '\\') { j += 2; continue; }
          if (src[j] === '[') inClass = true;
          else if (src[j] === ']') inClass = false;
          else if (src[j] === '/' && !inClass) break;
          j++;
        }
        j++;
        while (j < n && /[a-z]/i.test(src[j])) j++;
        i = j;
        push('regex', start, i);
      } else if (/[A-Za-z_$À-￿]/.test(c)) {
        while (i < n && /[\w$À-￿]/.test(src[i])) i++;
        push('word', start, i);
      } else if (/[0-9]/.test(c)) {
        while (i < n && /[\w.]/.test(src[i])) i++;
        push('num', start, i);
      } else {
        i++;
        push('punct', start, i);
      }
    }
    return tokens;
  }

  function instrumentLoops(src) {
    src = String(src || '');
    if (!/\b(for|while)\b/.test(src)) return src;
    try {
      var tokens = tokenize(src).filter(function (t) { return t.type !== 'ws' && t.type !== 'comment'; });
      var edits = []; // { pos, text }
      for (var k = 0; k < tokens.length; k++) {
        var t = tokens[k];
        if (t.type !== 'word' || (t.value !== 'for' && t.value !== 'while')) continue;
        var prev = tokens[k - 1];
        if (prev && prev.type === 'punct' && prev.value === '.') continue;
        var open = tokens[k + 1];
        if (!open || open.value !== '(') continue; // for await (...) та інше — пропускаємо
        // знайти парну дужку
        var depth = 0;
        var close = -1;
        var semis = [];
        for (var m = k + 1; m < tokens.length; m++) {
          var v = tokens[m].type === 'punct' ? tokens[m].value : '';
          if (v === '(' || v === '[' || v === '{') depth++;
          else if (v === ')' || v === ']' || v === '}') {
            depth--;
            if (depth === 0) { close = m; break; }
          } else if (v === ';' && depth === 1) semis.push(m);
        }
        if (close === -1) continue;
        if (t.value === 'while') {
          edits.push({ pos: open.end, text: '__feLoopGuard() && (' });
          edits.push({ pos: tokens[close].start, text: ')' });
        } else if (semis.length === 2) {
          var a = tokens[semis[0]];
          var b = tokens[semis[1]];
          if (semis[1] === semis[0] + 1) {
            edits.push({ pos: a.end, text: ' __feLoopGuard()' });
          } else {
            edits.push({ pos: a.end, text: ' __feLoopGuard() && (' });
            edits.push({ pos: b.start, text: ')' });
          }
        }
      }
      if (!edits.length) return src;
      edits.sort(function (x, y) { return y.pos - x.pos; });
      var out = src;
      edits.forEach(function (e) { out = out.slice(0, e.pos) + e.text + out.slice(e.pos); });
      return out;
    } catch (e) {
      return src;
    }
  }

  // Визначення охоронця всередині iframe (вставляється перед кодом користувача).
  var LOOP_GUARD_SRC =
    '(function(){var n=0,epoch=0,armed=false,now=performance.now.bind(performance),st=setTimeout;' +
    'window.__feLoopGuard=function(){if((++n&1023)!==0)return true;var t=now();' +
    'if(!armed){armed=true;epoch=t;st(function(){armed=false;},0);return true;}' +
    'if(t-epoch>1500){armed=false;throw new Error("Цикл виконується понад 1.5 с — схоже на нескінченний цикл, виконання перервано");}return true;};})();';

  // ------------------------------------------------------------ DOM (iframe)
  function escapeClose(src, tag) {
    var out = String(src || '').replace(new RegExp('</(' + tag + ')', 'gi'), '<\\/$1');
    // «<!--» усередині <script> разом із пізнішим «<script» вмикає в HTML-парсері стан «double escaped»,
    // і </script> більше не закриває скрипт (так ламався бандл Vue). \x21 — той самий «!» у рядках,
    // шаблонах, регулярних виразах (зокрема /u) і коментарях.
    if (tag === 'script') out = out.replace(/<!--/g, '<\\x21--');
    return out;
  }

  function buildDomDoc(opts, runId, withTests) {
    var env = '{ post: function (m) { m.__feRun = ' + JSON.stringify(runId) + '; parent.postMessage(m, "*"); }, userUrl: null }';
    var head =
      // <base>: інакше посилання "#x" у srcdoc вказують на батьківську сторінку, а не на сам документ.
      '<!DOCTYPE html>\n<html lang="uk">\n<head>\n<meta charset="utf-8">\n<base href="about:srcdoc">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '<script>' + HARNESS_SRC + '(window, ' + env + ');\n' + LOOP_GUARD_SRC + '\n' +
      'window.__fe.phase = "user";\n' +
      'window.addEventListener("error", function (e) {\n' +
      '  var info = window.__fe.errorInfo(e.error || { name: "Error", message: e.message });\n' +
      '  if (window.__fe.phase === "user" && e.lineno) {\n' +
      '    info.line = e.lineno - window.__feUserLine + 1;\n' +
      '    info.stack = "";\n' +
      '    window.__fe.post({ type: "user-error", error: info, syntax: /SyntaxError/.test(e.message) });\n' +
      '  } else {\n' +
      '    window.__fe.post({ type: "log", level: "error", text: "Uncaught " + info.name + ": " + info.message, phase: window.__fe.phase });\n' +
      '  }\n' +
      '});\n' +
      '<\/script>\n' +
      (opts.prelude ? '<script>\n' + escapeClose(opts.prelude, 'script') + '\n<\/script>\n' : '') +
      '<style>\n' + escapeClose(opts.css, 'style') + '\n</style>\n</head>\n<body>\n' +
      String(opts.html || '') + '\n';
    // head закінчується \n, тож наступний рядок має номер head.split('\n').length.
    // Рядок N: <script>__feUserLine</script>, N+1: <script>, N+2: перший рядок коду користувача.
    var markerLine = head.split('\n').length;
    var userScript =
      '<script>window.__feUserLine = ' + (markerLine + 2) + ';<\/script>\n' +
      '<script>\n' + escapeClose(instrumentLoops(opts.js), 'script') + '\n<\/script>\n';
    var tail;
    if (withTests) {
      var testsPayload = escapeClose(JSON.stringify(opts.tests.map(function (t) { return { name: t.name, code: t.code }; })), 'script');
      tail =
        '<script>\nwindow.__fe.phase = "after-user";\nwindow.__fe.installGuards && window.__fe.installGuards();\n' +
        'window.__fe.post({ type: "user-done" });\n' +
        'function __feStart() { setTimeout(function () { window.__fe.runTests(' + testsPayload + ', ' + (opts.testTimeout || DEFAULT_TEST_TIMEOUT) + '); }, 0); }\n' +
        'if (document.readyState === "complete") __feStart(); else window.addEventListener("load", __feStart);\n' +
        '<\/script>\n';
    } else {
      tail = '<script>window.__fe.phase = "preview"; window.__fe.installGuards && window.__fe.installGuards();\n' +
        'window.addEventListener("message", function (e) { var m = e.data; if (m && m.type === "eval" && m.to === ' + JSON.stringify(runId) + ') window.__fe.evalExpr(m.id, m.code); });\n' +
        '<\/script>\n';
    }
    return head + userScript + tail + '</body>\n</html>';
  }

  var sandboxHost = null;
  function getSandboxHost() {
    if (sandboxHost && document.body.contains(sandboxHost)) return sandboxHost;
    sandboxHost = document.createElement('div');
    sandboxHost.className = 'fe-sandbox-host';
    sandboxHost.setAttribute('aria-hidden', 'true');
    // Фрейм має бути «видимим» для браузера (у межах viewport), інакше rAF/IntersectionObserver тротляться.
    sandboxHost.style.cssText = 'position:fixed;left:0;top:0;width:800px;height:600px;z-index:-1;opacity:0;pointer-events:none;overflow:hidden;';
    document.body.appendChild(sandboxHost);
    return sandboxHost;
  }

  function runDom(opts, hooks) {
    hooks = hooks || {};
    var tests = opts.tests || [];
    var perTest = opts.testTimeout || DEFAULT_TEST_TIMEOUT;
    var result = makeResult(tests);
    var runId = 'run' + ++runCounter + '_' + Date.now();
    var doc = buildDomDoc({ html: opts.html, css: opts.css, js: opts.js, tests: tests, testTimeout: perTest, prelude: opts.prelude }, runId, true);

    return new Promise(function (resolve) {
      var frame = document.createElement('iframe');
      frame.setAttribute('sandbox', 'allow-scripts allow-forms');
      frame.setAttribute('title', 'test sandbox');
      // Усі тестові фрейми — в одній точці (0,0) контейнера, щоб кожен був «у viewport» навіть при паралельних запусках.
      frame.style.cssText = 'position:absolute;left:0;top:0;width:800px;height:600px;border:0;display:block;background:#fff;';
      var watchdog;
      var finished = false;
      var idle = opts.idleTimeout || perTest + 2500;

      function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(watchdog);
        window.removeEventListener('message', onMessage);
        if (frame.parentNode) frame.parentNode.removeChild(frame);
        if (result.userError && result.userError.syntax) {
          result.tests.forEach(function (t) {
            if (t.pass === null || t.pass === false) {
              if (t.pass === null) t.pass = false;
              if (!t.error) t.error = { name: 'Skipped', message: 'Не виконано: синтаксична помилка в коді', stack: '', skipped: true };
            }
          });
        }
        resolve(finalize(result));
      }
      function arm() {
        clearTimeout(watchdog);
        watchdog = setTimeout(function () {
          markTimeout(result);
          if (!result.userDone) result.userError = { name: 'Timeout', message: 'Код виконувався занадто довго — схоже на нескінченний цикл', stack: '' };
          finish();
        }, idle);
      }
      function onMessage(ev) {
        var msg = ev.data;
        if (!msg || msg.__feRun !== runId || ev.source !== frame.contentWindow) return;
        arm();
        if (msg.type === 'user-done') result.userDone = true;
        if (msg.type === 'done') return finish();
        handleMessage(result, msg, hooks);
      }
      window.addEventListener('message', onMessage);
      arm();
      frame.srcdoc = doc;
      getSandboxHost().appendChild(frame);
    });
  }

  /** srcdoc для живого превʼю DOM-задачі (без тестів). Логи йдуть у onLog. */
  function previewDoc(opts, previewId) {
    return buildDomDoc({ html: opts.html, css: opts.css, js: opts.js, tests: [], prelude: opts.prelude }, previewId || 'preview', false);
  }

  // ------------------------------------------------------------ console session (JS)
  /*
   * Виконує код користувача один раз у Worker і тримає його живим для консолі:
   * session.eval('cart.total()') → Promise<{ text } | { error }>. Стан між командами зберігається.
   */
  function createCodeSession(code, hooks) {
    hooks = hooks || {};
    code = String(code || '');
    var userLines = code.split('\n').length;
    var prefix = function (offset) {
      return [
        HARNESS_SRC + '(self, { post: function (m) { self.postMessage(m); }, userUrl: String(self.location.href), lineOffset: ' + offset + ', userLines: ' + userLines + ' });',
        'self.__fe.phase = "user";',
        'self.onerror = function (message, file, line, col, err) {',
        '  var info = self.__fe.errorInfo(err || { name: "Error", message: String(message) });',
        '  if (!info.line && line && self.__fe.phase === "user") { var l = line - ' + offset + '; if (l >= 1) info.line = l; }',
        '  self.__fe.post({ type: self.__fe.phase === "user" ? "user-error" : "log", level: "error", error: info, text: "Uncaught " + info.name + ": " + info.message, phase: self.__fe.phase });',
        '  return true;',
        '};',
        'self.addEventListener("message", function (e) { var m = e.data; if (m && m.type === "eval") self.__fe.evalExpr(m.id, m.code); });',
        'setTimeout(function () { self.__fe.phase = "repl"; self.__fe.post({ type: "user-done" }); }, 0);',
        'self.__fe.post({ type: "ready" });',
        ''
      ].join('\n');
    };
    var offset = prefix(0).split('\n').length - 1;
    var url = URL.createObjectURL(new Blob([prefix(offset) + code + '\n'], { type: 'text/javascript' }));
    var worker = new Worker(url);
    var ready = false;
    var dead = false;
    var seq = 0;
    var pending = {};
    var resolveStart;
    var started = new Promise(function (r) { resolveStart = r; });
    var startTimer = setTimeout(function () {
      kill('Код виконувався занадто довго — схоже на нескінченний цикл');
      resolveStart({ ok: false, error: { name: 'Timeout', message: 'Код виконувався занадто довго — схоже на нескінченний цикл' } });
    }, 3000);

    function kill(reason) {
      if (dead) return;
      dead = true;
      try { worker.terminate(); } catch (e) { /* noop */ }
      URL.revokeObjectURL(url);
      Object.keys(pending).forEach(function (id) {
        pending[id]({ error: { name: 'Timeout', message: reason } });
        delete pending[id];
      });
    }

    worker.onmessage = function (ev) {
      var m = ev.data;
      if (!m || !m.type) return;
      if (m.type === 'ready') { ready = true; return; }
      if (m.type === 'log') { if (hooks.onLog) hooks.onLog(m); return; }
      if (m.type === 'user-error') { if (hooks.onError) hooks.onError(m.error); return; }
      if (m.type === 'user-done') { clearTimeout(startTimer); resolveStart({ ok: true }); return; }
      if (m.type === 'eval-result') {
        if (m.late) { if (hooks.onLate) hooks.onLate(m); return; }
        var cb = pending[m.id];
        if (cb) { delete pending[m.id]; cb(m); }
      }
    };
    worker.onerror = function (ev) {
      ev.preventDefault();
      if (!ready) {
        clearTimeout(startTimer);
        var line = ev.lineno ? ev.lineno - offset : null;
        var err = { name: 'SyntaxError', message: String(ev.message || '').replace(/^Uncaught\s+/, '').replace(/^SyntaxError:\s*/, ''), line: line && line >= 1 && line <= userLines ? line : null, syntax: true };
        kill('Синтаксична помилка');
        resolveStart({ ok: false, error: err });
      }
    };

    return {
      started: started,
      isDead: function () { return dead; },
      eval: function (expr) {
        if (dead) return Promise.resolve({ error: { name: 'Error', message: 'Сесію зупинено — натисніть «Запустити» ще раз' }, dead: true });
        var id = ++seq;
        return new Promise(function (resolve) {
          var t = setTimeout(function () {
            delete pending[id];
            kill('Вираз виконувався понад 3 с — схоже на нескінченний цикл, сесію зупинено');
            resolve({ error: { name: 'Timeout', message: 'Вираз виконувався понад 3 с — схоже на нескінченний цикл. Сесію зупинено, натисніть «Запустити».' }, dead: true });
          }, 3000);
          pending[id] = function (m) { clearTimeout(t); resolve(m); };
          worker.postMessage({ type: 'eval', id: id, code: String(expr) });
        });
      },
      terminate: function () { kill('Сесію закрито'); }
    };
  }

  window.FERunner = {
    createCodeSession: createCodeSession,
    runCode: runCode,
    runDom: runDom,
    previewDoc: previewDoc,
    instrumentLoops: instrumentLoops,
    /**
     * Реєстр середовищ виконання. Завдання обирає середовище полем runtime (або за type).
     * Нове середовище (наприклад, 'ts' — транспіляція TypeScript, 'react' — JSX у браузері)
     * додається як FERunner.runtimes.ts = { label, files: ['ts'], run(item, files, hooks) { … } }
     * і може перевикористати runCode / runDom після власного перетворення коду.
     */
    runtimes: {
      code: {
        label: 'JavaScript (Web Worker)',
        files: ['js'],
        run: function (item, files, hooks) {
          return runCode({ code: files.js, tests: item.tests, testTimeout: item.testTimeout }, hooks);
        }
      },
      dom: {
        label: 'HTML / CSS / JS (браузерне вікно 800×600)',
        files: ['html', 'css', 'js'],
        run: function (item, files, hooks) {
          return runDom({ html: files.html, css: files.css, js: files.js, tests: item.tests, testTimeout: item.testTimeout }, hooks);
        }
      }
    },
    run: function (item, files, hooks) {
      var rt = window.FERunner.runtimes[item.runtime || item.type] || window.FERunner.runtimes.code;
      return rt.run(item, files, hooks);
    }
  };
})();
