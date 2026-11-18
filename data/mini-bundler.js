(function () {
// Код попередніх кроків — кожен наступний крок починається з готового рішення.
const PARSE = `function parseDeps(code) {
  const re = /^\\s*(?:import\\s+(?:[\\w*{}\\s,]+\\s+from\\s+)?|export\\s+(?:\\*(?:\\s+as\\s+\\w+)?|\\{[^}]*\\})\\s+from\\s+)['"]([^'"]+)['"]/gm;
  const out = [];
  let m;
  while ((m = re.exec(code))) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  return out;
}
`;
const RESOLVE = `function resolvePath(from, spec) {
  if (!spec.startsWith('.') && !spec.startsWith('/')) return spec;
  const base = spec.startsWith('/') ? [] : from.split('/').slice(0, -1);
  const out = [];
  for (const part of base.concat(spec.split('/'))) {
    if (part === '' || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  const last = out[out.length - 1] || '';
  return '/' + out.join('/') + (last.includes('.') ? '' : '.js');
}
`;
const GRAPH = `function buildGraph(entry, files) {
  if (!(entry in files)) throw new Error('Модуль не знайдено: ' + entry);
  const modules = {};
  const externals = [];
  const queue = [entry];
  while (queue.length > 0) {
    const path = queue.shift();
    if (modules[path]) continue;
    const deps = {};
    for (const spec of parseDeps(files[path])) {
      if (!spec.startsWith('.') && !spec.startsWith('/')) {
        if (!externals.includes(spec)) externals.push(spec);
        continue;
      }
      const resolved = resolvePath(path, spec);
      if (!(resolved in files)) throw new Error('Модуль не знайдено: ' + spec + ' (з ' + path + ')');
      deps[spec] = resolved;
      if (!modules[resolved]) queue.push(resolved);
    }
    modules[path] = { deps };
  }
  return { modules, externals };
}
`;
const TRANSFORM = `function transform(code) {
  const exported = [];
  let out = code
    .replace(/^([ \\t]*)import\\s+\\*\\s+as\\s+(\\w+)\\s+from\\s+(['"][^'"]+['"]);?/gm, '$1const $2 = require($3);')
    .replace(/^([ \\t]*)import\\s+\\{([^}]*)\\}\\s+from\\s+(['"][^'"]+['"]);?/gm, (m, ind, names, src) =>
      ind + 'const { ' + names.split(',').map((s) => s.trim()).filter(Boolean).map((s) => s.replace(/\\s+as\\s+/, ': ')).join(', ') + ' } = require(' + src + ');')
    .replace(/^([ \\t]*)import\\s+(\\w+)\\s+from\\s+(['"][^'"]+['"]);?/gm, '$1const $2 = require($3).default;')
    .replace(/^([ \\t]*)import\\s+(['"][^'"]+['"]);?/gm, '$1require($2);')
    .replace(/^([ \\t]*)export\\s+default\\s+/gm, '$1exports.default = ')
    .replace(/^([ \\t]*)export\\s+(const|let|var|function|async function|class)\\s+(\\w+)/gm, (m, ind, kw, name) => {
      exported.push([name, name]);
      return ind + kw + ' ' + name;
    })
    .replace(/^([ \\t]*)export\\s*\\{([^}]*)\\};?/gm, (m, ind, names) => {
      names.split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => {
        const [local, as] = s.split(/\\s+as\\s+/);
        exported.push([as || local, local]);
      });
      return '';
    });
  if (exported.length > 0) {
    out = out.replace(/\\s*$/, '') + '\\n' + exported.map(([name, local]) => 'exports.' + name + ' = ' + local + ';').join('\\n') + '\\n';
  }
  return out;
}
`;

FE.topic('mini-bundler', {
  intro: `
**Проєкт: свій бандлер.** За шість кроків ви зберете спрощений webpack/Rollup і зрозумієте, що відбувається між \`import\` у коді та одним файлом \`bundle.js\`.

\`\`\`text
parseDeps    → які модулі імпортує файл
resolvePath  → './utils' з '/src/app.js' → '/src/utils.js'
buildGraph   → граф залежностей від точки входу (BFS)
findCycle    → циклічні залежності (як madge)
transform    → import/export → require/exports
bundle       → один файл: мапа модулів + рантайм require з кешем
\`\`\`

Поєднує: регулярні вирази, рядки, об'єкти як словники, черги і графи (BFS/DFS), замикання, ESM і CommonJS.
`,
  groups: [
    { id: 'parse-resolve', title: 'Парсинг імпортів і шляхів' },
    { id: 'graph', title: 'Граф залежностей і цикли' },
    { id: 'transform-bundle', title: 'Перетворення модулів і бандл' },
    { id: 'real-bundlers', title: 'Як працюють справжні бандлери' }
  ],
  items: [
    {
      id: 'mb-parse-deps', group: 'parse-resolve', type: 'code', level: 2,
      title: 'Крок 1. parseDeps: що імпортує модуль',
      description: `
**Завдання.** Напишіть \`parseDeps(code)\` — масив **унікальних** специфікаторів модулів у порядку появи з інструкцій:
- \`import x from 'a'\`, \`import { a, b } from "b"\` (фігурні дужки можуть займати кілька рядків), \`import * as ns from './c'\`;
- \`import './side-effect.js'\` (імпорт заради побічного ефекту);
- реекспорт: \`export * from './d'\`, \`export { x } from './e'\`.

Інструкція починається на початку рядка (можливі пробіли). Не вважати залежністю рядки в звичайному коді (\`const s = "import x from 'y'"\`) і \`export const name = 'value'\`.

**Де трапляється:** першим кроком будь-який бандлер, лінтер імпортів чи аналізатор залежностей читає імпорти файлу.

**Як це працює:** регулярний вираз з прапорцями \`g\` (усі збіги) і \`m\` (\`^\` — початок кожного рядка); \`exec\` у циклі дає збіги по черзі.
`,
      starter: `function parseDeps(code) {
  // Підказка: один RegExp з альтернативою (import ... | export ... from) і групою для шляху в лапках
  const out = [];
  return out;
}
`,
      solution: PARSE,
      hints: ['Каркас: `/^\\s*(?:import\\s+(?:[\\w*{}\\s,]+\\s+from\\s+)?|export\\s+(?:\\*(?:\\s+as\\s+\\w+)?|\\{[^}]*\\})\\s+from\\s+)[\'"]([^\'"]+)[\'"]/gm`.', '`while ((m = re.exec(code)))` і `if (!out.includes(m[1])) out.push(m[1])`.'],
      tests: [
        { name: 'усі форми імпорту', code: "const code = \"import x from './a';\\nimport { b, c } from \\\"./b\\\";\\nimport * as ns from '../c.js';\\nimport './style.js';\";\nexpect(parseDeps(code)).toEqual(['./a', './b', '../c.js', './style.js']);" },
        { name: 'багаторядкові дужки і реекспорт', code: "const code = \"import {\\n  one,\\n  two\\n} from './multi';\\nexport * from './all';\\nexport { z } from './z';\";\nexpect(parseDeps(code)).toEqual(['./multi', './all', './z']);" },
        { name: 'не плутає з рядками і export const', code: "const code = \"const s = \\\"import x from 'nope'\\\";\\nexport const name = 'value';\\nimport a from './a';\\nimport again from './a';\";\nexpect(parseDeps(code)).toEqual(['./a']);" }
      ],
      explanation: 'Справжні бандлери не використовують regex: вони будують AST (Acorn, SWC, esbuild), бо regex не розрізняє коментарі, рядки й шаблони. Але статичність `import` — те, що робить аналіз можливим: імпорти не можна писати в `if`, а специфікатор — лише рядковий літерал. Тому бандлер знає граф **до виконання** коду — на цьому тримаються tree shaking і code splitting.'
    },
    {
      id: 'mb-resolve', group: 'parse-resolve', type: 'code', level: 2,
      title: 'Крок 2. resolvePath: від імпорту до файлу',
      description: `
**Завдання.** Напишіть \`resolvePath(from, spec)\`:
- відносні (\`./\`, \`../\`) і абсолютні (\`/...\`) шляхи → абсолютний нормалізований шлях від кореня \`/\`;
- \`.\` прибирається, \`..\` піднімається на рівень вище (вище кореня не піднімаємось);
- якщо в останньому сегменті немає крапки — додати \`.js\`;
- «голий» специфікатор (\`'lodash'\`, \`'react-dom/client'\`) — повернути як є: це зовнішній пакет.

**Де трапляється:** так webpack, Vite і Node розв'язують \`import './utils'\` у конкретний файл — з розширенням або \`index.js\`.

**Приклад**
\`\`\`js
resolvePath('/src/app.js', './utils');              // '/src/utils.js'
resolvePath('/src/pages/home.js', '../lib/api.js'); // '/src/lib/api.js'
resolvePath('/src/a.js', 'lodash');                 // 'lodash'
\`\`\`

**Як це працює:** шляхи \`./\` і \`../\` розв'язуються від теки файлу, що імпортує. Якщо розширення немає, пробують \`.js\`, потім \`/index.js\` — так само роблять Node (CommonJS) і бандлери.
`,
      starter: PARSE + `
function resolvePath(from, spec) {
  // 1. Голий специфікатор → як є
  // 2. База: папка файлу from (або корінь для '/...')
  // 3. Пройти сегменти: '' і '.' пропустити, '..' — pop, інакше push
  // 4. Додати '.js', якщо в останньому сегменті немає крапки
}
`,
      solution: PARSE + '\n' + RESOLVE,
      hints: ['Папка файлу: `from.split(\'/\').slice(0, -1)` — без останнього сегмента (імені файлу).', 'Стек сегментів: `..` → `out.pop()`; результат — `\'/\' + out.join(\'/\')`.'],
      tests: [
        "expect(resolvePath('/src/app.js', './utils')).toBe('/src/utils.js')",
        "expect(resolvePath('/src/pages/home.js', '../lib/api.js')).toBe('/src/lib/api.js')",
        "expect(resolvePath('/src/a.js', './x/../y')).toBe('/src/y.js')",
        "expect(resolvePath('/a.js', '../../b')).toBe('/b.js')",
        "expect([resolvePath('/src/a.js', 'lodash'), resolvePath('/src/a.js', '/lib/z')]).toEqual(['lodash', '/lib/z.js'])"
      ],
      explanation: 'Справжнє розв\'язання (Node resolution, `moduleResolution: bundler`) складніше: розширення `.ts/.tsx/.mjs`, `index.js` у папці, поле `exports`/`module`/`main` у `package.json`, пошук у `node_modules` вгору по дереву, аліаси (`@/components`). Саме тому в бандлерах і TS є окремий крок resolve з плагінами.'
    },
    {
      id: 'mb-quiz-static', group: 'parse-resolve', type: 'quiz', level: 2,
      title: 'Чому import статичний',
      question: 'Чому бандлер може побудувати граф з `import x from \'./a\'`, але не завжди може з `require(name)`?',
      options: [
        '`import` — статична інструкція з рядковим літералом на верхньому рівні; `require` — звичайна функція, її аргумент може обчислюватися в рантаймі',
        '`require` працює лише в Node.js',
        '`import` виконується швидше',
        'Бандлери не підтримують CommonJS'
      ],
      answer: 0,
      why: [
        'Так: граф ESM відомий до виконання коду.',
        'Ні: бандлери підтримують require, але для `require(variable)` не знають, що включити.',
        'Ні: справа не в швидкості.',
        'Ні: webpack і Rollup (з плагіном) підтримують CommonJS.'
      ],
      hint: 'Чи можна написати `import` всередині `if`?',
      explanation: 'Статичність ESM дає: граф до виконання, **tree shaking** (невикористані експорти видно статично), раннє виявлення помилок імпорту. Динамічний `import(\'./page\')` — окремий випадок: бандлер бачить рядок і робить окремий **chunk** (code splitting).'
    },
    {
      id: 'mb-build-graph', group: 'graph', type: 'code', level: 3,
      title: 'Крок 3. buildGraph: граф від точки входу',
      description: `
**Завдання.** Напишіть \`buildGraph(entry, files)\`, де \`files\` — об'єкт «шлях → код». Обійдіть модулі **в ширину** (BFS) від \`entry\` і поверніть:
\`\`\`js
{
  modules: { '/src/index.js': { deps: { './math': '/src/math.js' } }, ... },
  externals: ['lodash']          // голі специфікатори, унікальні, в порядку появи
}
\`\`\`
- кожен модуль обробляється **один раз**, навіть якщо його імпортують кілька модулів або є цикл;
- відсутній файл → \`Error('Модуль не знайдено: ./x (з /src/index.js)')\`;
- ключі \`modules\` — у порядку обходу (вхід перший).

**Де трапляється:** граф модулів будує кожен бандлер (webpack, Rollup, esbuild): з нього беруть порядок збирання, code splitting і HMR.

\`parseDeps\` і \`resolvePath\` уже є.

**Як це працює:** обхід у ширину (BFS) з чергою і множиною відвіданих: кожен модуль парситься рівно один раз, навіть якщо його імпортують десятки файлів, а цикли імпортів не зациклюють обхід.
`,
      starter: PARSE + '\n' + RESOLVE + `
function buildGraph(entry, files) {
  const modules = {};
  const externals = [];
  const queue = [entry];
  // TODO: while (queue.length) { ... }
  return { modules, externals };
}
`,
      solution: PARSE + '\n' + RESOLVE + '\n' + GRAPH,
      hints: ['Черга BFS: `const path = queue.shift(); if (modules[path]) continue;` — пропуск уже оброблених.', 'Для кожного спеціфікатора: голий → externals; інакше `resolvePath(path, spec)`, перевірка `resolved in files`, `deps[spec] = resolved`, у чергу.'],
      tests: [
        { name: 'граф і порядок обходу', code: "const files = { '/src/index.js': \"import { sum } from './math';\\nimport greet from './greet';\", '/src/math.js': 'export const sum = (a, b) => a + b;', '/src/greet.js': \"import { sum } from './math';\\nexport default (s) => s;\" };\nconst g = buildGraph('/src/index.js', files);\nexpect(Object.keys(g.modules)).toEqual(['/src/index.js', '/src/math.js', '/src/greet.js']);\nexpect(g.modules['/src/greet.js'].deps).toEqual({ './math': '/src/math.js' });" },
        { name: 'зовнішні пакети', code: "const g = buildGraph('/a.js', { '/a.js': \"import _ from 'lodash';\\nimport { b } from './b';\\nimport x from 'lodash';\", '/b.js': \"import React from 'react';\" });\nexpect(g.externals).toEqual(['lodash', 'react']);\nexpect(g.modules['/a.js'].deps).toEqual({ './b': '/b.js' });" },
        { name: 'цикл не зациклює обхід', code: "const g = buildGraph('/a.js', { '/a.js': \"import './b';\", '/b.js': \"import './a';\" });\nexpect(Object.keys(g.modules)).toEqual(['/a.js', '/b.js']);" },
        { name: 'відсутній модуль', code: "expect(() => buildGraph('/a.js', { '/a.js': \"import './nope';\" })).toThrow('Модуль не знайдено: ./nope (з /a.js)');" }
      ],
      explanation: 'Граф модулів — центральна структура бандлера, dev-сервера (Vite будує його для HMR: який модуль оновити при зміні файлу) і монорепо-інструментів (Nx, Turborepo: що перезібрати після зміни). Обхід у ширину з множиною відвіданих — той самий BFS, що в задачах про графи.'
    },
    {
      id: 'mb-find-cycle', group: 'graph', type: 'code', level: 3,
      title: 'Крок 4. findCycle: циклічні залежності',
      description: `
**Завдання.** Напишіть \`findCycle(graph, entry)\`: пошук у глибину від \`entry\` по \`graph.modules[id].deps\`. Повертає перший знайдений цикл як шлях, де перший і останній елементи збігаються (\`['/a.js', '/b.js', '/c.js', '/a.js']\`), або \`null\`.

**Де трапляється:** циклічні імпорти — джерело «undefined при імпорті» і проблем ініціалізації. Інструменти на кшталт madge і правило ESLint \`import/no-cycle\` шукають саме так.

**Як це працює:** DFS з трьома станами вузла: не відвіданий, «в процесі» (зараз у стеку) і «готовий». Ребро у вузол «в процесі» = цикл; шлях циклу — частина стеку від цього вузла.
`,
      starter: `function findCycle(graph, entry) {
  const state = {};   // 1 — у стеку обходу, 2 — оброблено
  const stack = [];
  // TODO: рекурсивний dfs(id)
  return null;
}
`,
      solution: `function findCycle(graph, entry) {
  const state = {};
  const stack = [];
  function dfs(id) {
    state[id] = 1;
    stack.push(id);
    for (const dep of Object.values(graph.modules[id].deps)) {
      if (state[dep] === 1) return stack.slice(stack.indexOf(dep)).concat(dep);
      if (!state[dep]) {
        const cycle = dfs(dep);
        if (cycle) return cycle;
      }
    }
    stack.pop();
    state[id] = 2;
    return null;
  }
  return dfs(entry);
}
`,
      hints: ['Вузол у стані 1 зустрівся знову — цикл: `stack.slice(stack.indexOf(dep)).concat(dep)`.', 'Після обходу всіх сусідів: `stack.pop(); state[id] = 2;` — щоб спільні залежності не вважались циклом.'],
      tests: [
        { name: 'без циклів (ромб)', code: "const g = { modules: { '/a.js': { deps: { './b': '/b.js', './c': '/c.js' } }, '/b.js': { deps: { './d': '/d.js' } }, '/c.js': { deps: { './d': '/d.js' } }, '/d.js': { deps: {} } } };\nexpect(findCycle(g, '/a.js')).toBeNull();" },
        { name: 'цикл через три модулі', code: "const g = { modules: { '/a.js': { deps: { './b': '/b.js' } }, '/b.js': { deps: { './c': '/c.js' } }, '/c.js': { deps: { './a': '/a.js' } } } };\nexpect(findCycle(g, '/a.js')).toEqual(['/a.js', '/b.js', '/c.js', '/a.js']);" },
        { name: 'цикл не з точки входу', code: "const g = { modules: { '/main.js': { deps: { './x': '/x.js' } }, '/x.js': { deps: { './y': '/y.js' } }, '/y.js': { deps: { './x': '/x.js' } } } };\nexpect(findCycle(g, '/main.js')).toEqual(['/x.js', '/y.js', '/x.js']);" }
      ],
      explanation: 'Три стани (білий/сірий/чорний) — класичний DFS для пошуку циклів у орієнтованому графі; двох станів «відвіданий/ні» мало: ромб a→b→d, a→c→d дав би хибний цикл. ESM дозволяє цикли, але порядок ініціалізації стає крихким: модуль може отримати ще не ініціалізований експорт (ReferenceError через TDZ або undefined у CommonJS).'
    },
    {
      id: 'mb-transform', group: 'transform-bundle', type: 'code', level: 3,
      title: 'Крок 5. transform: import/export → require/exports',
      description: `
**Завдання.** Напишіть \`transform(code)\`, що перетворює ESM на CommonJS-подібний код:

| Було | Стало |
|---|---|
| \`import x from './a';\` | \`const x = require('./a').default;\` |
| \`import { a, b as c } from './m';\` | \`const { a, b: c } = require('./m');\` |
| \`import * as ns from './n';\` | \`const ns = require('./n');\` |
| \`import './style.js';\` | \`require('./style.js');\` |
| \`export default ВИРАЗ\` | \`exports.default = ВИРАЗ\` |
| \`export const\` / \`let\` / \`function\` / \`class\` \`name\` | оголошення без \`export\` + у **кінці** модуля \`exports.name = name;\` |
| \`export { a, b as c };\` | рядок прибрати, у кінці \`exports.a = a;\` і \`exports.c = b;\` |

**Де трапляється:** саме так Babel/TypeScript компілюють модулі в CommonJS (\`module: commonjs\`), а webpack — у власний рантайм.

**Як це працює:** \`import { a } from './x'\` стає \`const { a } = require('./x')\`, а \`export\` — записом в об'єкт \`exports\`. Після цього будь-який модуль можна виконати як звичайну функцію \`(require, exports) => { … }\`.
`,
      starter: `function transform(code) {
  const exported = [];   // пари [ім'я експорту, локальне ім'я]
  let out = code;
  // TODO: послідовні replace з прапорцем m для кожного рядка таблиці
  return out;
}
`,
      solution: TRANSFORM,
      hints: ['Кожен рядок таблиці — окремий `replace` з `^([ \\t]*)` (збереження відступу) і прапорцем `gm`. Специфічніші форми (`* as`, `{ }`) — раніше за `import x`.', 'Для експортів збирайте пари в `exported`, а наприкінці додайте `exports.name = local;` для кожної.'],
      tests: [
        "expect(transform(\"import x from './a';\")).toBe(\"const x = require('./a').default;\")",
        "expect(transform(\"import { a, b as c } from './m';\")).toBe(\"const { a, b: c } = require('./m');\")",
        "expect([transform(\"import * as ns from './n';\"), transform(\"import './style.js';\")]).toEqual([\"const ns = require('./n');\", \"require('./style.js');\"])",
        { name: 'експорти працюють при виконанні', code: "const code = \"export const PI = 3.14;\\nexport function sq(x) { return x * x; }\\nconst secret = 7;\\nexport { secret as answer };\\nexport default 'main';\";\nconst exp = {};\nnew Function('require', 'exports', transform(code))(() => ({}), exp);\nexpect(exp.PI).toBe(3.14);\nexpect(exp.sq(3)).toBe(9);\nexpect(exp.answer).toBe(7);\nexpect(exp.default).toBe('main');" },
        { name: 'імпорти викликають require з правильними іменами', code: "const calls = [];\nconst req = (p) => { calls.push(p); return { default: 'D', a: 1, b: 2 }; };\nconst exp = {};\nnew Function('require', 'exports', transform(\"import d from './x';\\nimport { a, b as bee } from './y';\\nexport const res = d + a + bee;\"))(req, exp);\nexpect(calls).toEqual(['./x', './y']);\nexpect(exp.res).toBe('D12');" }
      ],
      explanation: 'Ключова втрата такого перетворення — **live bindings**: в ESM імпорт — «вікно» на змінну модуля, а `exports.count = count` у кінці копіює значення один раз. Тому webpack генерує геттери (`Object.defineProperty(exports, \'count\', { get: () => count })`), а Babel переписує звертання на `_module.count`. Справжні трансформери працюють з AST, а не з регулярними виразами.'
    },
    {
      id: 'mb-bundle', group: 'transform-bundle', type: 'code', level: 4,
      title: 'Крок 6. bundle: один файл з рантаймом require',
      description: `
**Завдання.** Напишіть \`bundle(entry, files)\` — повертає **рядок** JavaScript, який при виконанні запускає всю програму і **повертає експорти точки входу**.

**Де трапляється:** це суть вихідного файлу webpack: модулі загорнуті у функції, а маленький рантайм \`require\` з кешем з'єднує їх між собою.

Структура бандла (так влаштований webpack):
\`\`\`js
(function (modules) {
  const cache = {};
  function load(id) {
    if (cache[id]) return cache[id].exports;      // модуль виконується лише раз
    const module = { exports: {} };
    cache[id] = module;                           // до виконання — для циклів
    modules[id].factory((spec) => load(modules[id].deps[spec]), module, module.exports);
    return module.exports;
  }
  return load(ENTRY);
})({ '/src/index.js': { deps: {...}, factory: function (require, module, exports) { /* transform(код) */ } }, ... });
\`\`\`
- граф — \`buildGraph\`, код модулів — \`transform\` (обидва вже є);
- якщо є зовнішні пакети → \`Error('Зовнішні пакети не підтримуються: lodash')\`.

**Як це працює:** кожен модуль загортають у функцію \`(require, module, exports)\` і кладуть в об'єкт за шляхом. Рантайм \`require\` виконує модуль при першому зверненні й кешує його \`exports\`, тож модуль не виконується двічі навіть при циклічних імпортах.
`,
      starter: PARSE + '\n' + RESOLVE + '\n' + GRAPH + '\n' + TRANSFORM + `
function bundle(entry, files) {
  const graph = buildGraph(entry, files);
  // 1. externals → помилка
  // 2. Для кожного модуля: JSON.stringify(path) + ': { deps: ..., factory: function (require, module, exports) {\\n' + transform(code) + '\\n} }'
  // 3. Обгорнути в рантайм (див. умову) і повернути рядок
}
`,
      solution: PARSE + '\n' + RESOLVE + '\n' + GRAPH + '\n' + TRANSFORM + `
function bundle(entry, files) {
  const graph = buildGraph(entry, files);
  if (graph.externals.length > 0) {
    throw new Error('Зовнішні пакети не підтримуються: ' + graph.externals.join(', '));
  }
  const parts = Object.keys(graph.modules).map((path) =>
    JSON.stringify(path) + ': { deps: ' + JSON.stringify(graph.modules[path].deps) +
    ', factory: function (require, module, exports) {\\n' + transform(files[path]) + '\\n} }');
  return '(function (modules) {\\n' +
    '  const cache = {};\\n' +
    '  function load(id) {\\n' +
    '    if (cache[id]) return cache[id].exports;\\n' +
    '    const module = { exports: {} };\\n' +
    '    cache[id] = module;\\n' +
    '    modules[id].factory(function (spec) { return load(modules[id].deps[spec]); }, module, module.exports);\\n' +
    '    return module.exports;\\n' +
    '  }\\n' +
    '  return load(' + JSON.stringify(entry) + ');\\n' +
    '})({\\n' + parts.join(',\\n') + '\\n});';
}
`,
      hints: ['Тіло кожного модуля обгортається функцією `function (require, module, exports) { ... }` — так кожен модуль отримує власну область видимості.', '`cache[id] = module` **до** виклику factory: тоді циклічний імпорт отримає частково заповнені exports замість нескінченної рекурсії.'],
      tests: [
        { name: 'програма з кількох модулів', code: "const files = { '/src/index.js': \"import { sum } from './math';\\nimport greet from './greet';\\nexport const out = greet(String(sum(2, 3)));\", '/src/math.js': 'export const sum = (a, b) => a + b;', '/src/greet.js': \"export default function greet(s) { return 'Привіт, ' + s; }\" };\nconst result = (0, eval)(bundle('/src/index.js', files));\nexpect(result.out).toBe('Привіт, 5');" },
        { name: 'спільний модуль виконується один раз', code: "globalThis.__mbRuns = 0;\nconst files = { '/a.js': \"import './c';\\nimport './b';\", '/b.js': \"import './c';\", '/c.js': 'globalThis.__mbRuns++;' };\n(0, eval)(bundle('/a.js', files));\nexpect(globalThis.__mbRuns).toBe(1);" },
        { name: 'цикл не зациклює виконання', code: "const files = { '/a.js': \"import { b } from './b';\\nexport const a = 'A' + b;\", '/b.js': \"import { a } from './a';\\nexport const b = 'B';\" };\nexpect((0, eval)(bundle('/a.js', files)).a).toBe('AB');" },
        { name: 'зовнішні пакети', code: "expect(() => bundle('/a.js', { '/a.js': \"import _ from 'lodash';\" })).toThrow('Зовнішні пакети не підтримуються: lodash');" }
      ],
      explanation: 'Ви щойно написали ядро webpack: **мапа модулів-функцій + require з кешем**. Справжній бандлер додає: зовнішні пакети з `node_modules`, лоадери (CSS, зображення, TS), tree shaking, мініфікацію, source maps, кілька чанків з динамічним `import()` (чанк вантажиться через `<script>` і реєструється в тій самій мапі), HMR (заміна factory модуля без перезавантаження). Rollup і esbuild для ESM роблять «scope hoisting» — складають модулі в одну область видимості без обгорток.'
    },
    {
      id: 'mb-quiz-live-bindings', group: 'real-bundlers', type: 'quiz', level: 3,
      title: 'Live bindings: ESM vs наш бандлер',
      question: `
Що виведе код у **справжньому ESM** і після нашого \`transform\` (копія \`exports.count = count\` у кінці модуля)?

\`\`\`js
// counter.js
export let count = 0;
export function inc() { count++; }

// main.js
import { count, inc } from './counter.js';
inc();
console.log(count);
\`\`\`
`,
      options: ['ESM: `1`; наш бандлер: `0`', 'Обидва `1`', 'Обидва `0`', 'ESM: `0`; наш бандлер: `1`'],
      answer: 0,
      why: [
        'Так: імпорт ESM — живе посилання на змінну, а наш exports.count — копія на момент ініціалізації.',
        'Ні: наш transform копіює значення один раз.',
        'Ні: в ESM count оновлюється для імпортерів.',
        'Ні: навпаки.'
      ],
      hint: 'Імпорт в ESM — це копія значення чи «вікно» на змінну модуля?',
      explanation: '**Live bindings** — частина специфікації ESM: імпортер бачить поточне значення експортованої змінної (але не може її присвоїти). CommonJS експортує значення властивостей об\'єкта `exports`. Бандлери емулюють live bindings геттерами — тому `export let` з мутаціями працює однаково в dev і prod.'
    },
    {
      id: 'mb-real-bundlers', group: 'real-bundlers', type: 'theory', level: 3, interview: true,
      title: 'Справжні бандлери: Vite, Rollup, esbuild, webpack',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Vite у dev-режимі не бандлить ваш код: браузер вантажить ES-модулі напряму, а Vite трансформує файли на льоту',
        'Tree shaking можливий завдяки статичній структурі import/export',
        'Динамічний `import(\'./page\')` зазвичай стає окремим чанком, що вантажиться за потребою',
        'Бандлер виконує код застосунку, щоб дізнатися, які модулі потрібні',
        'HMR замінює змінений модуль у запущеному застосунку без повного перезавантаження сторінки'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: тому dev-старт миттєвий незалежно від розміру проєкту.',
        'Так: невикористані експорти видно без виконання.',
        'Так: це code splitting.',
        'Ні: граф будується статичним аналізом.',
        'Так: через граф модулів знаходять, кого оновити.'
      ],
      hint: 'Що з цього можна зробити без запуску коду?',
      answer: `
**Конвеєр бандлера:** resolve (шляхи, \`node_modules\`, аліаси) → load + transform (TS, JSX, CSS через лоадери/плагіни) → граф модулів → оптимізації (tree shaking, scope hoisting, мініфікація) → чанки (code splitting за динамічними імпортами, спільні вендор-чанки) → вивід з хешами в іменах і source maps.

| Інструмент | Особливість |
|---|---|
| **Vite** | dev — нативний ESM + esbuild для залежностей, prod — Rollup (новіші версії — Rolldown) |
| **Rollup** | ESM-орієнтований, scope hoisting, бібліотеки |
| **esbuild** | на Go, дуже швидкий транспілер/бандлер |
| **webpack** | найгнучкіший, лоадери й плагіни, Module Federation |
| **Rspack, Turbopack** | швидкі бандлери на Rust |

**Що запам'ятати:** ESM-статичність → граф і tree shaking; \`import()\` → чанки; бандл — мапа модулів + рантайм завантаження; dev і prod можуть працювати по-різному (Vite).
`,
      keyPoints: ['resolve → transform → граф → оптимізації → чанки', 'Tree shaking на статичному ESM', 'import() → окремий чанк', 'Vite dev без бандлингу', 'HMR через граф модулів']
    }
  ]
});
})();
