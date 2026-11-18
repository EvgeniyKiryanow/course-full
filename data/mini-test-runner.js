(function () {
// Код попередніх кроків.
const HELPERS = `function isDeepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && isDeepEqual(a[k], b[k]));
}

function show(v) {
  if (typeof v === 'function') return '[Function]';
  try { return JSON.stringify(v) ?? String(v); } catch (e) { return String(v); }
}
`;
// expectThat з модуля «Тестування» (toBe, toEqual, toThrow, .not) — стартова точка кроку 1.
const EXPECT_BASE = `function expectThat(actual) {
  function matchers(negate) {
    function check(pass, message) {
      if (pass === negate) throw new Error((negate ? 'Очікувалось протилежне: ' : '') + message);
    }
    return {
      toBe(expected) {
        check(Object.is(actual, expected), 'Очікувалось ' + show(expected) + ', отримано ' + show(actual));
      },
      toEqual(expected) {
        check(isDeepEqual(actual, expected), 'Очікувалось (глибоко) ' + show(expected) + ', отримано ' + show(actual));
      },
      toThrow(text) {
        let error = null;
        try { actual(); } catch (e) { error = e; }
        const pass = error !== null && (text === undefined || String(error && error.message).includes(text));
        check(pass, 'Очікувалась помилка' + (text === undefined ? '' : ' з текстом «' + text + '»') +
          (error ? ', отримано: ' + error.message : ', але функція виконалась без помилки'));
      },
    };
  }
  const api = matchers(false);
  api.not = matchers(true);
  return api;
}
`;
const EXPECT_MOCK_BASE = `function expectThat(actual) {
  function matchers(negate) {
    function check(pass, message) {
      if (pass === negate) throw new Error((negate ? 'Очікувалось протилежне: ' : '') + message);
    }
    return {
      toBe(expected) {
        check(Object.is(actual, expected), 'Очікувалось ' + show(expected) + ', отримано ' + show(actual));
      },
      toEqual(expected) {
        check(isDeepEqual(actual, expected), 'Очікувалось (глибоко) ' + show(expected) + ', отримано ' + show(actual));
      },
      toThrow(text) {
        let error = null;
        try { actual(); } catch (e) { error = e; }
        const pass = error !== null && (text === undefined || String(error && error.message).includes(text));
        check(pass, 'Очікувалась помилка' + (text === undefined ? '' : ' з текстом «' + text + '»') +
          (error ? ', отримано: ' + error.message : ', але функція виконалась без помилки'));
      },
      toHaveBeenCalledTimes(n) {
        check(actual.calls.length === n, 'Очікувалось викликів: ' + n + ', було: ' + actual.calls.length);
      },
      toHaveBeenCalledWith(...args) {
        check(actual.calls.some((call) => isDeepEqual(call, args)), 'Очікувався виклик з ' + show(args) + ', виклики: ' + show(actual.calls));
      },
    };
  }
  const api = matchers(false);
  api.not = matchers(true);
  return api;
}

function createMock(impl) {
  let current = impl;
  const once = [];
  function mock(...args) {
    mock.calls.push(args);
    if (once.length > 0) return once.shift();
    return current ? current.apply(this, args) : undefined;
  }
  mock.calls = [];
  mock.mockReturnValueOnce = (value) => { once.push(value); return mock; };
  mock.mockImplementation = (fn) => { current = fn; return mock; };
  return mock;
}
`;
// Крок 1 додає матчери для колекцій і дробових чисел — далі вони є в коді кожного кроку.
const COLLECTION_MATCHERS = `      toContain(item) {
        const pass = typeof actual === 'string' ? actual.includes(item) : Array.isArray(actual) && actual.includes(item);
        check(pass, 'Очікувалось, що ' + show(actual) + ' містить ' + show(item));
      },
      toHaveLength(n) {
        const length = actual === null || actual === undefined ? undefined : actual.length;
        check(length === n, 'Очікувалась довжина ' + n + ', отримано ' + length);
      },
      toBeCloseTo(expected, digits = 2) {
        check(Math.abs(expected - actual) < 10 ** -digits / 2, 'Очікувалось ≈ ' + expected + ' (знаків після коми: ' + digits + '), отримано ' + actual);
      },
`;
const EXPECT = EXPECT_BASE.split('    };\n  }\n  const api').join(COLLECTION_MATCHERS + '    };\n  }\n  const api');
const EXPECT_MOCK = EXPECT_MOCK_BASE.split('      toHaveBeenCalledTimes(n) {').join(COLLECTION_MATCHERS + '      toHaveBeenCalledTimes(n) {');
const RUNNER_COLLECT = `function createRunner() {
  const tests = [];
  const path = [];
  return {
    describe(name, fn) {
      path.push(name);
      try { fn(); } finally { path.pop(); }
    },
    test(name, fn) {
      tests.push({ name: path.concat(name).join(' > '), fn });
    },
    collect() {
      return tests.slice();
    },
  };
}
`;
const RUNNER_RUN = `function createRunner() {
  const tests = [];
  const path = [];
  return {
    describe(name, fn) {
      path.push(name);
      try { fn(); } finally { path.pop(); }
    },
    test(name, fn) {
      tests.push({ name: path.concat(name).join(' > '), fn });
    },
    collect() {
      return tests.slice();
    },
    async run() {
      const results = [];
      for (const t of tests) {
        try {
          await t.fn();
          results.push({ name: t.name, status: 'passed' });
        } catch (e) {
          results.push({ name: t.name, status: 'failed', error: e instanceof Error ? e.message : String(e) });
        }
      }
      return {
        passed: results.filter((r) => r.status === 'passed').length,
        failed: results.filter((r) => r.status === 'failed').length,
        results,
      };
    },
  };
}
`;
const RUNNER_HOOKS = `function createRunner() {
  const tests = [];
  const root = { name: '', before: [], after: [] };
  const stack = [root];
  const current = () => stack[stack.length - 1];
  return {
    describe(name, fn) {
      stack.push({ name, before: [], after: [] });
      try { fn(); } finally { stack.pop(); }
    },
    beforeEach(fn) { current().before.push(fn); },
    afterEach(fn) { current().after.push(fn); },
    test(name, fn) {
      const chain = stack.slice();
      tests.push({ name: chain.slice(1).map((s) => s.name).concat(name).join(' > '), fn, chain });
    },
    collect() {
      return tests.map(({ name, fn }) => ({ name, fn }));
    },
    async run() {
      const results = [];
      for (const t of tests) {
        let error = null;
        try {
          for (const suite of t.chain) for (const hook of suite.before) await hook();
          await t.fn();
        } catch (e) {
          error = e;
        }
        for (const suite of t.chain.slice().reverse()) {
          for (const hook of suite.after) {
            try { await hook(); } catch (e) { if (!error) error = e; }
          }
        }
        results.push(error
          ? { name: t.name, status: 'failed', error: error instanceof Error ? error.message : String(error) }
          : { name: t.name, status: 'passed' });
      }
      return {
        passed: results.filter((r) => r.status === 'passed').length,
        failed: results.filter((r) => r.status === 'failed').length,
        results,
      };
    },
  };
}
`;
const RUNNER_FULL = `function withTimeout(value, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Тест перевищив тайм-аут ' + ms + ' мс')), ms);
  });
  return Promise.race([Promise.resolve(value), timeout]).finally(() => clearTimeout(timer));
}

function createRunner() {
  const tests = [];
  const root = { name: '', before: [], after: [] };
  const stack = [root];
  const current = () => stack[stack.length - 1];
  function add(name, fn, mode) {
    const chain = stack.slice();
    tests.push({ name: chain.slice(1).map((s) => s.name).concat(name).join(' > '), fn, chain, mode });
  }
  const test = (name, fn) => add(name, fn, 'normal');
  test.only = (name, fn) => add(name, fn, 'only');
  test.skip = (name, fn) => add(name, fn, 'skip');
  return {
    describe(name, fn) {
      stack.push({ name, before: [], after: [] });
      try { fn(); } finally { stack.pop(); }
    },
    beforeEach(fn) { current().before.push(fn); },
    afterEach(fn) { current().after.push(fn); },
    test,
    collect() {
      return tests.map(({ name, fn }) => ({ name, fn }));
    },
    async run({ timeout = 1000 } = {}) {
      const hasOnly = tests.some((t) => t.mode === 'only');
      const results = [];
      for (const t of tests) {
        if (t.mode === 'skip' || (hasOnly && t.mode !== 'only')) {
          results.push({ name: t.name, status: 'skipped' });
          continue;
        }
        let error = null;
        try {
          for (const suite of t.chain) for (const hook of suite.before) await hook();
          await withTimeout(t.fn(), timeout);
        } catch (e) {
          error = e;
        }
        for (const suite of t.chain.slice().reverse()) {
          for (const hook of suite.after) {
            try { await hook(); } catch (e) { if (!error) error = e; }
          }
        }
        results.push(error
          ? { name: t.name, status: 'failed', error: error instanceof Error ? error.message : String(error) }
          : { name: t.name, status: 'passed' });
      }
      const count = (s) => results.filter((r) => r.status === s).length;
      return { passed: count('passed'), failed: count('failed'), skipped: count('skipped'), results };
    },
  };
}
`;

FE.topic('mini-test-runner', {
  intro: `
**Проєкт: свій тест-раннер.** За шість кроків ви зберете ядро Jest/Vitest і зрозумієте, як працюють \`expect\`, \`describe\`, хуки, моки, \`.only\` і тайм-аути — тобто інструмент, яким користуєтесь щодня.

\`\`\`text
expectThat   → матчери toBe / toEqual / toThrow і .not
createRunner → describe / test, повні назви «Suite > test»
run          → послідовне виконання, async, звіт
hooks        → beforeEach / afterEach з правильним порядком вкладеності
createMock   → шпигуни: calls, mockReturnValueOnce, toHaveBeenCalledWith
only / skip  → вибірковий запуск і тайм-аути через Promise.race
\`\`\`

Поєднує: замикання, функції вищого порядку, стек, рекурсію, проміси і async/await, обробку помилок.

Назви \`expectThat\`, \`createRunner\`, \`createMock\` обрано свідомо: \`expect\` і \`mockFn\` уже зайняті тестами самого тренажера.
`,
  groups: [
    { id: 'basics', title: 'Матчери, describe/test і запуск' },
    { id: 'hooks-mocks', title: 'Хуки і моки' },
    { id: 'control', title: 'only, skip, тайм-аути і справжні раннери' }
  ],
  items: [
    {
      id: 'tr-expect', group: 'basics', type: 'code', level: 2,
      title: 'Крок 1. expectThat: toContain, toHaveLength, toBeCloseTo',
      description: `
**Завдання.** У коді вже є \`expectThat\` з модуля «Тестування» (\`toBe\`, \`toEqual\`, \`toThrow\`, \`.not\`). Додайте три матчери, без яких не обходиться жоден реальний набір тестів:
- \`toContain(item)\` — масив містить елемент (як \`includes\`) або рядок містить підрядок;
- \`toHaveLength(n)\` — \`actual.length === n\`;
- \`toBeCloseTo(expected, digits = 2)\` — числа рівні з точністю: \`Math.abs(expected - actual) < 10 ** -digits / 2\` (саме так рахує Jest).

\`.not\` має працювати і з новими матчерами. Невдача → \`Error\` із зрозумілим повідомленням, наприклад \`Очікувалось, що [1,2] містить 3\` (значення — через \`show\`).

**Де трапляється:** матчери Jest і Vitest, які ви пишете щодня: \`expect(cart.items).toHaveLength(2)\`, \`expect(errors).toContain('Обов\\'язкове поле')\`, \`expect(total).toBeCloseTo(0.3)\`.

**Приклад**
\`\`\`js
expectThat([1, 2, 3]).toContain(2);
expectThat('Привіт, світ').toContain('світ');
expectThat([]).toHaveLength(0);
expectThat(0.1 + 0.2).toBeCloseTo(0.3);       // toBe(0.3) тут упав би
expectThat(1.04).not.toBeCloseTo(1.1, 1);
\`\`\`

**Як це працює:** фабрика \`matchers(negate)\` уже створює обидва набори, тож новий матчер досить додати в повернений об'єкт — \`.not\` з'явиться автоматично. \`toBeCloseTo\` потрібен, бо \`0.1 + 0.2\` у двійковому float — це \`0.30000000000000004\` (модуль «Рядки, числа»).

**Врахуйте:** \`toContain\` для масиву шукає те саме значення, а не глибоко рівне (\`{ id: 1 }\` за новою копією не знайдеться — у Jest для цього є \`toContainEqual\`); \`toHaveLength\` для \`null\` чи числа — провал, а не \`TypeError\`.
`,
      starter: HELPERS + '\n' + EXPECT_BASE.split('    };\n  }\n  const api').join('      // TODO: toContain(item), toHaveLength(n), toBeCloseTo(expected, digits = 2)\n    };\n  }\n  const api'),
      solution: HELPERS + '\n' + EXPECT,
      hints: [
        'Кожен матчер обчислює `pass` і викликає `check(pass, повідомлення)` — `.not` обробить сам `check` через `negate`.',
        '`toContain`: для рядка — `actual.includes(item)`, для масиву — `Array.isArray(actual) && actual.includes(item)`.',
        '`toHaveLength`: довжину читайте лише якщо `actual` не `null`/`undefined`; `toBeCloseTo`: `Math.abs(expected - actual) < 10 ** -digits / 2`.'
      ],
      tests: [
        { name: 'старі матчери працюють', code: "expect(() => expectThat(NaN).toBe(NaN)).not.toThrow();\nexpect(() => expectThat({ a: [1] }).toEqual({ a: [1] })).not.toThrow();\nexpect(() => expectThat(() => { throw new Error('boom'); }).toThrow('boom')).not.toThrow();" },
        { name: 'toContain: масиви і рядки', code: "expect(() => expectThat([1, 2, 3]).toContain(2)).not.toThrow();\nexpect(() => expectThat('Привіт, світ').toContain('світ')).not.toThrow();\nexpect(() => expectThat([1, 2]).toContain(3)).toThrow('Очікувалось, що [1,2] містить 3');\nexpect(() => expectThat([{ id: 1 }]).toContain({ id: 1 })).toThrow();\nexpect(() => expectThat([1, 2]).not.toContain(3)).not.toThrow();" },
        { name: 'toHaveLength', code: "expect(() => expectThat([]).toHaveLength(0)).not.toThrow();\nexpect(() => expectThat('abc').toHaveLength(3)).not.toThrow();\nexpect(() => expectThat([1]).toHaveLength(2)).toThrow('Очікувалась довжина 2, отримано 1');\nexpect(() => expectThat(null).toHaveLength(0)).toThrow('Очікувалась довжина');\nexpect(() => expectThat([1]).not.toHaveLength(2)).not.toThrow();" },
        { name: 'toBeCloseTo і точність', code: "expect(() => expectThat(0.1 + 0.2).toBeCloseTo(0.3)).not.toThrow();\nexpect(() => expectThat(0.1 + 0.2).toBe(0.3)).toThrow();\nexpect(() => expectThat(1.04).toBeCloseTo(1.1, 1)).toThrow();\nexpect(() => expectThat(1.04).not.toBeCloseTo(1.1, 1)).not.toThrow();\nexpect(() => expectThat(3.14159).toBeCloseTo(3.14)).not.toThrow();" }
      ],
      explanation: 'Матчер — функція, що або нічого не робить, або кидає помилку з зрозумілим повідомленням; тест-раннер (наступні кроки) ловить ці помилки. Завдяки фабриці `matchers(negate)` кожен новий матчер одразу має `.not`. Поріг `10 ** -digits / 2` означає «рівні після округлення до `digits` знаків». У Jest повідомлення ще й показують дифф очікуваного й отриманого — це половина зручності інструмента.'
    },
    {
      id: 'tr-collect', group: 'basics', type: 'code', level: 2,
      title: 'Крок 2. describe і test: збір тестів',
      description: `
**Завдання.** Напишіть \`createRunner()\`, що повертає \`{ describe, test, collect }\`:
- \`describe(name, fn)\` — група; \`fn\` викликається **одразу**, щоб зареєструвати вкладені тести; групи можуть вкладатися;
- \`test(name, fn)\` — реєструє тест з **повною назвою** \`'Група > Підгрупа > тест'\`;
- \`collect()\` — масив \`{ name, fn }\` у порядку реєстрації.

**Де трапляється:** так працює фаза збору (collection) у Jest/Vitest: спершу виконується файл тестів і будується список, і лише потім — запуск.

**Як це працює:** стек назв груп: \`describe\` додає назву, викликає \`fn\`, прибирає назву (у \`finally\` — навіть якщо \`fn\` кинув помилку).
`,
      starter: HELPERS + '\n' + EXPECT + `
function createRunner() {
  const tests = [];
  const path = [];   // стек назв поточних describe
  return {
    describe(name, fn) {
      // TODO
    },
    test(name, fn) {
      // TODO
    },
    collect() {
      return tests.slice();
    },
  };
}
`,
      solution: HELPERS + '\n' + EXPECT + '\n' + RUNNER_COLLECT,
      hints: ['`path.push(name); try { fn(); } finally { path.pop(); }`', 'Повна назва: `path.concat(name).join(\' > \')`.'],
      tests: [
        { name: 'вкладені групи', code: "const r = createRunner();\nr.describe('Кошик', () => {\n  r.test('порожній', () => {});\n  r.describe('знижки', () => { r.test('10%', () => {}); });\n  r.test('сума', () => {});\n});\nr.test('окремий', () => {});\nexpect(r.collect().map((t) => t.name)).toEqual(['Кошик > порожній', 'Кошик > знижки > 10%', 'Кошик > сума', 'окремий']);" },
        { name: 'тести ще не виконуються', code: "const r = createRunner();\nconst fn = mockFn();\nr.test('t', fn);\nexpect(fn).not.toHaveBeenCalled();\nexpect(r.collect()[0].fn).toBe(fn);" },
        { name: 'стек відновлюється після помилки в describe', code: "const r = createRunner();\ntry { r.describe('A', () => { throw new Error('x'); }); } catch (e) {}\nr.test('b', () => {});\nexpect(r.collect().map((t) => t.name)).toEqual(['b']);" }
      ],
      explanation: 'Збір і запуск розділені свідомо: раннер знає всі тести до запуску (кількість, `.only`, фільтри за назвою `-t`), а вкладеність `describe` — лише спосіб структурувати назви й хуки. Тому код у `describe` поза `test` виконується під час збору — класична пастка: асинхронна підготовка там не спрацює.'
    },
    {
      id: 'tr-run', group: 'basics', type: 'code', level: 3,
      title: 'Крок 3. run: виконання і звіт',
      description: `
**Завдання.** Додайте в раннер \`async run()\`:
- тести виконуються **послідовно** в порядку реєстрації;
- тест може бути асинхронним (повертати проміс) — чекаємо на нього;
- помилка (синхронна або відхилений проміс) → тест \`failed\` з \`error\` = \`message\`; решта тестів продовжує виконуватися;
- результат: \`{ passed, failed, results: [{ name, status: 'passed' | 'failed', error? }] }\`.

**Де трапляється:** так Jest і Vitest послідовно виконують тести, ловлять помилки й формують звіт «✓ 12 passed, ✗ 1 failed».

**Як це працює:** тести виконуються **послідовно**: \`await\` у циклі чекає на кожен, а \`try/catch\` перетворює кинуту помилку на «провал» цього тесту, тож одна невдала перевірка не зупиняє решту.
`,
      starter: HELPERS + '\n' + EXPECT + `
function createRunner() {
  const tests = [];
  const path = [];
  return {
    describe(name, fn) {
      path.push(name);
      try { fn(); } finally { path.pop(); }
    },
    test(name, fn) {
      tests.push({ name: path.concat(name).join(' > '), fn });
    },
    collect() {
      return tests.slice();
    },
    async run() {
      // TODO: for (const t of tests) { try { await t.fn(); ... } catch (e) { ... } }
    },
  };
}
`,
      solution: HELPERS + '\n' + EXPECT + '\n' + RUNNER_RUN,
      hints: ['`await t.fn()` працює і для синхронних функцій, і для тих, що повертають проміс; обидва типи помилок ловить один `try/catch`.', 'Повідомлення: `e instanceof Error ? e.message : String(e)` — кинути можна що завгодно.'],
      tests: [
        { name: 'звіт', code: "const r = createRunner();\nr.test('ok', () => expectThat(1).toBe(1));\nr.test('fail', () => expectThat(1).toBe(2));\nr.test('async ok', async () => { await Promise.resolve(); });\nconst res = await r.run();\nexpect(res.passed).toBe(2);\nexpect(res.failed).toBe(1);\nexpect(res.results[1]).toEqual({ name: 'fail', status: 'failed', error: 'Очікувалось 2, отримано 1' });" },
        { name: 'відхилений проміс', code: "const r = createRunner();\nr.test('rejects', () => Promise.reject(new Error('мережа')));\nconst res = await r.run();\nexpect(res.results[0]).toEqual({ name: 'rejects', status: 'failed', error: 'мережа' });" },
        { name: 'послідовно, без перекриття', code: "const r = createRunner();\nconst log = [];\nr.test('a', async () => { log.push('a-start'); await new Promise((res) => setTimeout(res, 5)); log.push('a-end'); });\nr.test('b', () => { log.push('b'); });\nawait r.run();\nexpect(log).toEqual(['a-start', 'a-end', 'b']);" }
      ],
      explanation: 'Послідовність усередині файлу — свідомий вибір Jest і Vitest: тести одного файлу часто ділять стан (моки, DOM). Паралельність — на рівні **файлів** (воркери). Типова помилка у тестах — забутий `await` або `return` промісу: тест «проходить» до завершення перевірки.'
    },
    {
      id: 'tr-hooks', group: 'hooks-mocks', type: 'code', level: 3,
      title: 'Крок 4. beforeEach і afterEach',
      description: `
**Завдання.** Додайте хуки \`beforeEach(fn)\` і \`afterEach(fn)\`, що належать **поточній** групі (або кореню):
- перед кожним тестом — \`beforeEach\` від **зовнішньої** групи до **внутрішньої**;
- після тесту — \`afterEach\` від **внутрішньої** до **зовнішньої**;
- \`afterEach\` виконуються **навіть якщо тест упав** (прибирання);
- помилка в хуку → тест \`failed\`; хуки можуть бути асинхронними.

**Де трапляється:** \`beforeEach\`/\`afterEach\` скидають стан між тестами (чистий DOM, новий стор, відновлені моки) — інакше результат залежить від порядку тестів.

**Як це працює:** замість стеку назв — стек груп \`{ name, before, after }\`. Тест запам'ятовує копію стеку на момент реєстрації (ланцюжок своїх груп).
`,
      starter: HELPERS + '\n' + EXPECT + `
function createRunner() {
  const tests = [];
  const root = { name: '', before: [], after: [] };
  const stack = [root];
  const current = () => stack[stack.length - 1];
  return {
    describe(name, fn) {
      stack.push({ name, before: [], after: [] });
      try { fn(); } finally { stack.pop(); }
    },
    beforeEach(fn) { /* TODO */ },
    afterEach(fn) { /* TODO */ },
    test(name, fn) {
      const chain = stack.slice();
      tests.push({ name: chain.slice(1).map((s) => s.name).concat(name).join(' > '), fn, chain });
    },
    collect() {
      return tests.map(({ name, fn }) => ({ name, fn }));
    },
    async run() {
      const results = [];
      for (const t of tests) {
        // TODO: before-хуки (зовнішні → внутрішні), тест, after-хуки (внутрішні → зовнішні) завжди
      }
      return {
        passed: results.filter((r) => r.status === 'passed').length,
        failed: results.filter((r) => r.status === 'failed').length,
        results,
      };
    },
  };
}
`,
      solution: HELPERS + '\n' + EXPECT + '\n' + RUNNER_HOOKS,
      hints: ['before: `for (const suite of t.chain) for (const hook of suite.before) await hook();` — у тому самому `try`, що й тест.', 'after: окремий цикл **після** `try/catch` по `t.chain.slice().reverse()`; помилку хука запам\'ятати, якщо тест сам не впав.'],
      tests: [
        { name: 'порядок хуків', code: "const r = createRunner();\nconst log = [];\nr.beforeEach(() => log.push('root-before'));\nr.afterEach(() => log.push('root-after'));\nr.describe('A', () => {\n  r.beforeEach(() => log.push('A-before'));\n  r.afterEach(() => log.push('A-after'));\n  r.test('t', () => log.push('test'));\n});\nawait r.run();\nexpect(log).toEqual(['root-before', 'A-before', 'test', 'A-after', 'root-after']);" },
        { name: 'хуки групи не діють поза нею', code: "const r = createRunner();\nconst log = [];\nr.describe('A', () => { r.beforeEach(() => log.push('A')); r.test('in', () => {}); });\nr.test('out', () => log.push('out'));\nawait r.run();\nexpect(log).toEqual(['A', 'out']);" },
        { name: 'afterEach після падіння і помилка хука', code: "const r = createRunner();\nconst log = [];\nr.afterEach(() => log.push('cleanup'));\nr.test('fails', () => { throw new Error('x'); });\nr.describe('B', () => { r.beforeEach(() => { throw new Error('setup'); }); r.test('t', () => log.push('never')); });\nconst res = await r.run();\nexpect(log).toEqual(['cleanup', 'cleanup']);\nexpect(res.results.map((x) => x.status)).toEqual(['failed', 'failed']);\nexpect(res.results[1].error).toBe('setup');" }
      ],
      explanation: 'Порядок «зовнішнє → внутрішнє» для підготовки і «внутрішнє → зовнішнє» для прибирання — як стек: що створено останнім, прибирається першим. `afterEach` у `finally`-семантиці — щоб упалий тест не залишив моки, таймери чи DOM для наступного (інакше каскад «червоних» тестів). Є ще `beforeAll/afterAll` — раз на групу.'
    },
    {
      id: 'tr-mocks', group: 'hooks-mocks', type: 'code', level: 3,
      title: 'Крок 5. createMock і матчери викликів',
      description: `
**Завдання.**
1. \`createMock(impl?)\` — функція-шпигун:
   - кожен виклик записує масив аргументів у \`mock.calls\`;
   - \`mockReturnValueOnce(v)\` — наступний виклик поверне \`v\` (можна ставити в чергу кілька);
   - \`mockImplementation(fn)\` — замінити реалізацію; без реалізації — \`undefined\`.
2. Додайте в \`expectThat\` матчери \`toHaveBeenCalledTimes(n)\` і \`toHaveBeenCalledWith(...args)\` (хоча б один виклик з глибоко рівними аргументами).

**Де трапляється:** перевірити, що обробник викликано, аналітику надіслано, API отримало правильні параметри — без справжньої мережі.

**Як це працює:** функція в JS — об'єкт, тож на неї можна повісити властивості (\`mock.calls\`) і методи.
`,
      starter: HELPERS + '\n' + EXPECT.replace("      toThrow(text) {", "      // TODO: toHaveBeenCalledTimes(n), toHaveBeenCalledWith(...args)\n      toThrow(text) {") + `
function createMock(impl) {
  // TODO: function mock(...args) { ... }; mock.calls = []; методи
}
`,
      solution: HELPERS + '\n' + EXPECT_MOCK,
      hints: ['`function mock(...args) { mock.calls.push(args); if (once.length) return once.shift(); return current ? current.apply(this, args) : undefined; }`', 'Матчер: `actual.calls.some((call) => isDeepEqual(call, args))`.'],
      tests: [
        { name: 'записує виклики', code: "const m = createMock();\nm(1, 'a');\nm({ x: 1 });\nexpect(m.calls).toEqual([[1, 'a'], [{ x: 1 }]]);" },
        { name: 'реалізація і черга значень', code: "const m = createMock((x) => x * 2);\nm.mockReturnValueOnce('A').mockReturnValueOnce('B');\nexpect([m(1), m(1), m(5)]).toEqual(['A', 'B', 10]);\nm.mockImplementation(() => 'new');\nexpect(m()).toBe('new');" },
        { name: 'матчери викликів', code: "const m = createMock();\nm('save', { id: 1 });\nexpect(() => expectThat(m).toHaveBeenCalledTimes(1)).not.toThrow();\nexpect(() => expectThat(m).toHaveBeenCalledWith('save', { id: 1 })).not.toThrow();\nexpect(() => expectThat(m).toHaveBeenCalledWith('save', { id: 2 })).toThrow();\nexpect(() => expectThat(m).not.toHaveBeenCalledTimes(1)).toThrow();" }
      ],
      explanation: 'Мок — функція з пам\'яттю про виклики. `vi.fn()`/`jest.fn()` додають `mock.results`, `mock.instances`, `mockResolvedValue`, скидання `mockClear/mockReset`. Модульні моки (`vi.mock(\'./api\')`) працюють інакше: раннер підміняє модуль у своєму реєстрі модулів ще до імпорту (тому `vi.mock` «піднімається» на початок файлу).'
    },
    {
      id: 'tr-quiz-hook-order', group: 'hooks-mocks', type: 'quiz', level: 2,
      title: 'Порядок хуків у Jest/Vitest',
      question: `
У якому порядку виконається код?

\`\`\`js
beforeEach(() => log('1'));
afterEach(() => log('2'));
describe('group', () => {
  beforeEach(() => log('3'));
  afterEach(() => log('4'));
  test('t', () => log('5'));
});
\`\`\`
`,
      options: ['`1 3 5 4 2`', '`3 1 5 2 4`', '`1 3 5 2 4`', '`3 1 5 4 2`'],
      answer: 0,
      why: [
        'Так: підготовка зовні всередину, прибирання зсередини назовні.',
        'Ні: зовнішній beforeEach іде першим.',
        'Ні: внутрішній afterEach — раніше за зовнішній.',
        'Ні: before-хуки — від зовнішніх до внутрішніх.'
      ],
      hint: 'Подумайте про стек: що «відкрили» останнім, те «закривають» першим.',
      explanation: 'Саме так ви реалізували в кроці 4. Повний порядок Jest: `beforeAll` (зовні → всередину), для кожного тесту `beforeEach` (зовні → всередину) → тест → `afterEach` (всередині → назовні), наприкінці `afterAll` (всередині → назовні).'
    },
    {
      id: 'tr-only-timeout', group: 'control', type: 'code', level: 4,
      title: 'Крок 6. only, skip і тайм-аути',
      description: `
**Завдання.** Розширте раннер:
- \`test.only(name, fn)\` — якщо є хоча б один \`only\`, запускаються **лише** такі тести; решта — \`skipped\`;
- \`test.skip(name, fn)\` — тест не запускається, статус \`'skipped'\`;
- \`run({ timeout = 1000 })\` — тест, що не завершився за \`timeout\` мс, — \`failed\` з помилкою \`'Тест перевищив тайм-аут N мс'\`;
- у звіті додайте \`skipped\` (кількість).

**Де трапляється:** \`test.only\` — щоб налагодити один тест, \`test.skip\` — для тимчасово вимкнених, а тайм-аут не дає «завислому» промісу заблокувати CI.

**Як це працює:** \`test\` — функція, і на неї можна повісити методи \`only\`/\`skip\`. Тайм-аут — \`Promise.race\` між тестом і промісом, що відхиляється по \`setTimeout\`. Таймер треба очистити, коли тест завершився вчасно.
`,
      starter: HELPERS + '\n' + EXPECT + `
function withTimeout(value, ms) {
  // TODO: Promise.race([Promise.resolve(value), проміс-тайм-аут]) + clearTimeout у finally
}

` + RUNNER_HOOKS.replace("    test(name, fn) {", "    // TODO: test.only і test.skip (режим тесту: 'normal' | 'only' | 'skip')\n    test(name, fn) {").replace('    async run() {', '    async run() {\n      // TODO: тайм-аут через withTimeout, only/skip, лічильник skipped'),
      solution: HELPERS + '\n' + EXPECT + '\n' + RUNNER_FULL,
      hints: ['`const test = (name, fn) => add(name, fn, \'normal\'); test.only = ...; test.skip = ...;` і повертайте `test` в об\'єкті раннера.', 'Пропуск: `t.mode === \'skip\' || (hasOnly && t.mode !== \'only\')`. Виконання: `await withTimeout(t.fn(), timeout)`.'],
      tests: [
        { name: 'skip', code: "const r = createRunner();\nconst fn = mockFn();\nr.test.skip('s', fn);\nr.test('t', () => {});\nconst res = await r.run();\nexpect(fn).not.toHaveBeenCalled();\nexpect([res.passed, res.skipped]).toEqual([1, 1]);" },
        { name: 'only', code: "const r = createRunner();\nconst log = [];\nr.test('a', () => log.push('a'));\nr.test.only('b', () => log.push('b'));\nr.describe('G', () => { r.test.only('c', () => log.push('c')); });\nconst res = await r.run();\nexpect(log).toEqual(['b', 'c']);\nexpect(res.results.map((x) => x.status)).toEqual(['skipped', 'passed', 'passed']);" },
        { name: 'тайм-аут', code: "const r = createRunner();\nr.test('hang', () => new Promise(() => {}));\nr.test('fast', async () => {});\nconst res = await r.run({ timeout: 30 });\nexpect(res.results[0]).toEqual({ name: 'hang', status: 'failed', error: 'Тест перевищив тайм-аут 30 мс' });\nexpect(res.results[1].status).toBe('passed');" }
      ],
      explanation: '`Promise.race` не **зупиняє** зависший тест — лише перестає чекати на нього; справжні раннери ще й ізолюють файли у воркерах, щоб зависання чи нескінченний цикл не вбили весь процес. `.only` у закоміченому коді — часта помилка; ESLint-правило `no-focused-tests` і прапорець CI `--no-only` (Vitest `allowOnly: false`) захищають від цього.'
    },
    {
      id: 'tr-real-runners', group: 'control', type: 'theory', level: 3, interview: true,
      title: 'Як влаштовані Jest і Vitest',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Тестові файли зазвичай виконуються паралельно в окремих воркерах, а тести всередині файлу — послідовно',
        'Кожен тестовий файл отримує власний реєстр модулів, тож стан модулів не протікає між файлами',
        '`vi.mock(\'./api\')` підміняє модуль до того, як його імпортує тест, тому виклик піднімається на початок файлу',
        'Фейкові таймери прискорюють справжній час процесора',
        'У watch-режимі Vitest перезапускає лише тести, пов\'язані зі зміненими файлами через граф модулів'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: паралельність між файлами, порядок у файлі.',
        'Так: ізоляція на рівні файлу.',
        'Так: hoisting `vi.mock`/`jest.mock`.',
        'Ні: вони підміняють setTimeout/Date, а час «просувається» викликами advanceTimers.',
        'Так: той самий граф модулів, що для HMR.'
      ],
      hint: 'Що з цього стосується ізоляції, а що — швидкості?',
      answer: `
**Конвеєр тест-раннера:** пошук файлів → воркери → у кожному: свіжий реєстр модулів + середовище (\`node\`, \`jsdom\`/\`happy-dom\`) → збір (\`describe\`/\`test\`) → запуск з хуками → звіт → покриття (V8 coverage або instrumentation).

| | Jest | Vitest |
|---|---|---|
| Трансформація | Babel/ts-jest | Vite (той самий конфіг, що в застосунку) |
| ESM | складніше | нативно |
| API | \`jest.fn\`, \`jest.mock\` | сумісне: \`vi.fn\`, \`vi.mock\` |
| Watch | за git-змінами | за графом модулів Vite |

**Ваш міні-раннер уже має:** матчери з \`.not\`, збір з повними назвами, послідовний async-запуск, хуки з правильним порядком, моки, \`only/skip\`, тайм-аути. Чого бракує: ізоляції у воркерах, реєстру модулів і \`vi.mock\`, фейкових таймерів, снапшотів, диффів у повідомленнях, покриття.
`,
      keyPoints: ['Файли паралельно, тести у файлі послідовно', 'Ізольований реєстр модулів на файл', 'vi.mock піднімається', 'Фейкові таймери — підміна API, не прискорення', 'Watch за графом модулів']
    }
  ]
});
})();
