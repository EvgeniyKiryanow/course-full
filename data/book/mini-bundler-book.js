FE.chapter('mini-bundler-book', { body: `
Розділ до проєкту «Свій бандлер»: що відбувається між \`import\` у вашому коді та файлами в \`dist/\`.

## Парсинг імпортів і шляхів

**Статичність ESM** — основа всього: \`import\`/\`export\` лише на верхньому рівні, специфікатор — рядковий літерал. Тому бандлер знає залежності файлу **без виконання** коду.

\`\`\`js
import x from './a';            // default
import { a, b as c } from './m';
import * as ns from './n';
import './style.css';           // побічний ефект
export * from './all';          // реекспорт
const lazy = () => import('./page');   // динамічний — окремий чанк
\`\`\`
Справжні бандлери парсять код в **AST** (Acorn, SWC, esbuild, Oxc), а не регулярними виразами: ті не розрізняють коментарі, рядки й шаблони.

**Resolve** — від специфікатора до файлу: відносні шляхи (\`./\`, \`../\`), розширення (\`.js\`, \`.ts\`, \`.tsx\`), \`index.js\` у папці, «голі» пакети з \`node_modules\` за полями \`exports\`/\`module\`/\`main\` у \`package.json\`, аліаси (\`@/components\`). У TypeScript це \`moduleResolution: "bundler"\`.

## Граф залежностей і цикли

Від точки входу — обхід **у ширину** (BFS) з множиною відвіданих: кожен модуль один раз, навіть якщо його імпортують десятки інших.
\`\`\`text
/src/index.js ─→ /src/math.js
       └──────→ /src/greet.js ─→ /src/math.js   (вже відвіданий)
\`\`\`
Граф використовують: бандлер (що включити), dev-сервер (HMR: кого оновити після зміни файлу), тест-раннер у watch-режимі, монорепо-інструменти (що перезібрати).

**Цикли** шукають DFS з трьома станами вузла (не відвіданий / у стеку / готовий): ребро у вузол «у стеку» — цикл. Двох станів мало — «ромб» a→b→d, a→c→d дав би хибний цикл. Цикли дозволені в ESM, але роблять порядок ініціалізації крихким (TDZ, \`undefined\` в CommonJS). Інструменти: madge, ESLint \`import/no-cycle\`.

## Перетворення модулів і бандл

**ESM → CommonJS:**
| ESM | CommonJS |
|---|---|
| \`import x from './a'\` | \`const x = require('./a').default\` |
| \`import { a } from './a'\` | \`const { a } = require('./a')\` |
| \`export const n = 1\` | \`const n = 1; exports.n = n\` |
| \`export default v\` | \`exports.default = v\` |

**Live bindings:** імпорт в ESM — «вікно» на змінну модуля; копія \`exports.n = n\` — ні. Бандлери емулюють live bindings геттерами (\`Object.defineProperty(exports, 'n', { get: () => n })\`).

**Бандл = мапа модулів + рантайм:**
\`\`\`js
(function (modules) {
  const cache = {};
  function load(id) {
    if (cache[id]) return cache[id].exports;   // кожен модуль виконується один раз
    const module = { exports: {} };
    cache[id] = module;                        // до виконання — для циклів
    modules[id].factory((spec) => load(modules[id].deps[spec]), module, module.exports);
    return module.exports;
  }
  return load('/src/index.js');
})({ /* id → { deps, factory: function (require, module, exports) { … } } */ });
\`\`\`
Обгортка-функція дає кожному модулю власну область видимості — те, що раніше робили IIFE.

## Як працюють справжні бандлери

Конвеєр: **resolve → load/transform** (TS, JSX, CSS, зображення через лоадери/плагіни) → **граф** → **оптимізації** (tree shaking, scope hoisting, мініфікація) → **чанки** (code splitting за \`import()\`, спільні вендор-чанки) → вивід з хешами й source maps.

| Інструмент | Особливості |
|---|---|
| Vite | dev — нативний ESM без бандлингу (миттєвий старт), prod — Rollup/Rolldown |
| Rollup | ESM-орієнтований, scope hoisting, бібліотеки |
| esbuild | Go, дуже швидкий |
| webpack | лоадери й плагіни, Module Federation |
| Rspack, Turbopack | Rust |

- **Tree shaking** — видалення невикористаних експортів; потребує ESM і відсутності побічних ефектів (\`"sideEffects": false\`).
- **Scope hoisting** — модулі складаються в одну область видимості без обгорток (менше коду, швидше).
- **HMR** — заміна factory зміненого модуля в запущеному застосунку; межі оновлення шукаються по графу.

## Типові питання

- **Чому ESM дає tree shaking, а CommonJS — ні?**
- **Що робить бандлер із \`import()\`?**
- **Що таке live bindings?**
- **Чому Vite швидкий у dev-режимі?**
- **Як бандлер обробляє циклічні залежності?**
`});
