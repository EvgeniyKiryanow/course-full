FE.topic('js-fp', {
  intro: `
## Чисті функції
- **Чиста функція:** результат залежить лише від аргументів + **немає побічних ефектів** (мутації аргументів/зовнішніх змінних, I/O, DOM, мережа, \`Date.now()\`, \`Math.random()\`).
- **Референційна прозорість:** виклик можна замінити його результатом без зміни поведінки програми → мемоізація, тестування, паралелізм.
- Побічні ефекти неминучі — їх **ізолюють на краях** (обробники, ефекти, сервіси), ядро логіки лишається чистим.

## Іммутабельність
\`\`\`js
const next = { ...state, user: { ...state.user, name: 'Bob' } }; // structural sharing
const added = [...list, item];          // замість push
const removed = list.filter((x) => x.id !== id);
const updated = list.map((x) => (x.id === id ? { ...x, done: true } : x));
const sorted = list.toSorted(cmp);      // ES2023: toSorted/toReversed/toSpliced/with
\`\`\`
- \`Object.freeze\` — **поверхневий**; у нестрогому режимі запис мовчки ігнорується, у strict — \`TypeError\`.
- Незмінені гілки зберігають **ідентичність** → дешеві перевірки \`prev === next\` (React, Redux, memo).

## Функції вищого порядку, композиція
\`\`\`js
const compose = (...fns) => (x) => fns.reduceRight((acc, f) => f(acc), x); // справа наліво
const pipe = (...fns) => (x) => fns.reduce((acc, f) => f(acc), x);         // зліва направо
const slugify = pipe(trim, toLower, (s) => s.replace(/\\s+/g, '-'));
\`\`\`
- **Point-free:** \`arr.map(toUpper)\` замість \`arr.map((s) => toUpper(s))\` — але обережно з функціями з кількома параметрами (\`map(parseInt)\`!).

## Каррінг і часткове застосування
\`\`\`js
const curry = (fn) => function curried(...args) {
  return args.length >= fn.length ? fn.apply(this, args) : (...more) => curried.apply(this, [...args, ...more]);
};
const add3 = curry((a, b, c) => a + b + c);
add3(1)(2)(3); add3(1, 2)(3);              // 6
const partial = (fn, ...preset) => (...rest) => fn(...preset, ...rest);
\`\`\`
- **Каррінг** — \`f(a, b, c)\` → \`f(a)(b)(c)\`. **Часткове застосування** — зафіксувати частину аргументів.
- \`fn.length\` не враховує параметри з default і rest.

## Мемоізація
- Лише для **чистих** функцій. Ключ кешу: перший аргумент / resolver / \`JSON.stringify\` / \`WeakMap\` для об'єктів.
- Обмежуйте кеш (LRU, TTL) — інакше витік пам'яті.

## Декларативно vs імперативно
\`\`\`js
// імперативно — ЯК
const res = []; for (const u of users) if (u.active) res.push(u.name);
// декларативно — ЩО
const names = users.filter((u) => u.active).map((u) => u.name);
\`\`\`
**Функтор** — контейнер з \`map\`, що зберігає структуру (\`Array\`, \`Maybe\`, \`Result\`); \`flatMap\` — без вкладених контейнерів.
`,
  groups: [
    { id: 'pure', title: 'Чисті функції й побічні ефекти' },
    { id: 'immutability', title: 'Іммутабельність: оновлення без мутацій' },
    { id: 'hof', title: 'Функції вищого порядку і композиція' },
    { id: 'currying', title: 'Каррінг і часткове застосування' },
    { id: 'memoization', title: 'Мемоізація' },
    { id: 'functors', title: 'Функтори і Result (просунуто)' }
  ],
  items: [
    // ------------------------------------------------------------ Чисті функції й побічні ефекти
    {
      id: 'fp-pure-functions-theory',
      group: 'pure',
      type: 'theory',
      level: 1,
      interview: true,
      title: 'Чисті функції та побічні ефекти',
      tags: [
        'pure-functions',
        'side-effects'
      ],
      question: 'Що таке чиста функція? Що таке побічний ефект і референційна прозорість? Чому чисті функції — це добре, і як бути з побічними ефектами, без яких застосунок неможливий? Оберіть **усі** правильні твердження.',
      choices: [
        'Чиста функція при однакових аргументах завжди повертає той самий результат і нічого не змінює поза собою',
        'Функція, що лише читає `Date.now()` і нічого не мутує, чиста, бо побічних ефектів у неї немає',
        'Референційна прозорість означає, що виклик можна замінити його результатом без зміни поведінки',
        'Ефекти не прибирають, а виносять на краї: обробники подій, `useEffect`, middleware, сервісні шари',
        'Функція, що мутує переданий об\'єкт, але завжди повертає те саме значення, лишається чистою'
      ],
      answer: `
- **Чиста функція:** однакові аргументи → однаковий результат + **немає побічних ефектів**.
- **Побічні ефекти:** мутація аргументів/зовнішніх змінних, мережа, \`localStorage\`, DOM, \`console.log\`, таймери; \`Date.now()\`/\`Math.random()\` — недетермінованість.
\`\`\`js
let taxRate = 0.2;
function addTax(order) { order.total *= 1 + taxRate; return order; } // ✘ мутує + зовнішня змінна
const withTax = (order, rate) => ({ ...order, total: order.total * (1 + rate) }); // ✔
\`\`\`
- **Референційна прозорість:** виклик можна замінити результатом.
- **Переваги:** тести без моків, мемоізація, передбачуваність (редʼюсери Redux, React StrictMode рендерить двічі, щоб виявити нечистоту).
- **Ефекти ізолюють на краях:** обробники подій, \`useEffect\`, middleware, сервіси.
`,
      correct: [0, 2, 3],
      why: [
        'Так: це два критерії чистоти — детермінованість і відсутність побічних ефектів.',
        'Ні: `Date.now()` дає щоразу інший результат — функція недетермінована, а отже нечиста.',
        'Так: це наслідок чистоти — `withTax(o, 0.2)` можна замінити на його результат.',
        'Так: «functional core, imperative shell» — логіка чиста, ефекти на краях застосунку.',
        'Ні: мутація аргументу — побічний ефект для викликача, навіть якщо результат той самий.'
      ],
      keyPoints: [
        'Чиста = детермінована + без побічних ефектів',
        'Побічні ефекти: мутації, I/O, DOM, мережа, час, випадковість',
        'Референційна прозорість — виклик можна замінити результатом',
        'Переваги: тестування, мемоізація, передбачуваність',
        'Ефекти ізолюють на краях (functional core, imperative shell)'
      ],
      followUps: [
        'Чи є чистою функція, яка всередині мутує локальний масив?',
        'Чому редʼюсер у Redux має бути чистим?',
        'Навіщо React StrictMode рендерить компонент двічі?'
      ]
    },
    {
      id: 'fp-quiz-which-pure',
      group: 'pure',
      type: 'quiz',
      level: 1,
      title: 'Які функції чисті?',
      tags: [
        'pure-functions'
      ],
      question: 'Оберіть **усі** чисті функції:',
      options: [
        '`const add = (a, b) => a + b;`',
        '`const now = () => Date.now();`',
        '`const push = (arr, x) => { arr.push(x); return arr; };`',
        '`const withItem = (arr, x) => [...arr, x];`',
        '`let rate = 1.2; const price = (x) => x * rate;`',
        '`const log = (x) => { console.log(x); return x; };`'
      ],
      answer: [0, 3],
      why: [
        'Чиста: результат залежить лише від аргументів, нічого не змінює.',
        'Нечиста: щоразу інший результат — залежить від часу.',
        'Нечиста: `push` мутує масив, переданий викликачем.',
        'Чиста: створює новий масив, вхід не змінює.',
        'Нечиста: залежить від зовнішньої змінної `let rate` — зміниться `rate`, зміниться результат.',
        'Нечиста: вивід у консоль — побічний ефект (I/O), хоч результат і детермінований.'
      ],
      hint: 'Перевірте кожну на дві умови: «той самий вхід — той самий вихід» і «нічого не змінює та не виводить назовні».',
      explanation: `
Перевіряйте дві умови: «той самий вхід → той самий вихід» і «нічого не змінює/не виводить назовні». Чисті лише \`add\` і \`withItem\`.
`
    },
    // ------------------------------------------------------------ Іммутабельність: оновлення без мутацій
    {
      id: 'fp-immutability-theory',
      group: 'immutability',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Іммутабельність і structural sharing',
      tags: [
        'immutability'
      ],
      question: 'Що таке іммутабельність даних і навіщо вона у фронтенді (React, Redux)? Як іммутабельно оновити вкладений об\'єкт і масив? Чи робить Object.freeze об\'єкт повністю незмінним?',
      choices: [
        '`Object.freeze` заморожує об\'єкт рекурсивно, тож вкладені об\'єкти теж стають незмінними',
        '`structuredClone(state)` — найкращий спосіб оновити стан, бо зберігає спільні посилання на гілки',
        'Оновлення копіює лише шлях до зміни, незмінені гілки лишаються спільними, а `memo` порівнює посилання',
        'Іммутабельність потрібна React, щоб глибоко порівнювати старий і новий стан поле за полем'
      ],
      answer: `
- **Іммутабельність:** «зміна» = нова версія даних, оригінал не чіпаємо.
- **Навіщо:** дешеве виявлення змін через \`prev !== next\` (\`React.memo\`, залежності хуків, селектори); ніхто не змінить дані «за спиною»; undo/time-travel.
- **Structural sharing** — копіюється лише шлях до зміни:
\`\`\`js
const next = { ...state, user: { ...state.user, city: 'Lviv' } };
next.settings === state.settings; // true
[...items, item];                                   // додати
items.filter((i) => i.id !== id);                   // видалити
items.map((i) => (i.id === id ? { ...i, done: true } : i)); // оновити
items.toSorted(cmp); items.with(index, value);      // ES2023
\`\`\`
- Уникати на стані: \`push\`, \`splice\`, \`sort\`, \`reverse\`, \`obj.x =\`.
- \`Object.freeze\` поверхневий; у strict mode запис кидає \`TypeError\`, інакше мовчки ігнорується.
- **Immer** — «мутуючий» код на чернетці (Proxy) → іммутабельний результат зі structural sharing.
`,
      correct: 2,
      why: [
        'Ні: `freeze` поверхневий — вкладені об\'єкти лишаються змінними.',
        'Ні: `structuredClone` створює ВСІ посилання заново — structural sharing зникає, і `memo` вважає змінним усе.',
        'Так: копіюється лише шлях до зміни, решта гілок спільна — тому порівняння посилань дешеве й точне.',
        'Ні: React порівнює посилання (`Object.is`), а не глибоко — саме тому потрібна нова версія об\'єкта.'
      ],
      keyPoints: [
        'Зміна = нова версія даних, оригінал не змінюється',
        'Дешеве виявлення змін через порівняння посилань (React.memo, селектори)',
        'Structural sharing: копіюється лише шлях до зміни',
        'Немутуючі методи: spread, map, filter, toSorted, with',
        'Object.freeze поверхневий; Immer для зручних оновлень'
      ],
      followUps: [
        'Чому глибока копія всього стану — погана ідея для React?',
        'Як Immer реалізує іммутабельність через Proxy?',
        'Як реалізувати deepFreeze?'
      ]
    },
    {
      id: 'fp-quiz-structural-sharing', group: 'immutability', type: 'quiz', level: 2,
      title: 'Structural sharing: які посилання збереглися',
      tags: ['immutability', 'structural-sharing'],
      question: `Що виведе код?
\`\`\`js
const state = {
  filter: 'all',
  todos: [{ id: 1, done: false }, { id: 2, done: false }],
};
const next = {
  ...state,
  todos: state.todos.map((t) => (t.id === 2 ? { ...t, done: true } : t)),
};
console.log(
  next.todos === state.todos,
  next.todos[0] === state.todos[0],
  next.todos[1] === state.todos[1],
  next.filter === state.filter,
);
\`\`\``,
      options: ['`false true false true`', '`false false false true`', '`true true false true`', '`false true false false`'],
      answer: 0,
      why: [
        'Так: новими стали лише корінь, масив `todos` і змінена задача; задача 1 і `filter` — ті самі значення.',
        'Ні: `map` створює новий масив, але кладе в нього **ті самі** об\'єкти, які повернув колбек, — задачу 1 він повертає без змін.',
        'Ні: `map` завжди повертає новий масив, тож `next.todos !== state.todos`.',
        'Ні: `filter` — рядок, а примітиви порівнюються за значенням; spread скопіював те саме значення.'
      ],
      hint: 'Які об\'єкти тут створюються наново: `{ ... }`, `map`, `{ ...t }`? А що повертається без змін?',
      explanation: 'Іммутабельне оновлення копіює лише шлях до зміни: новий корінь, новий масив `todos` і новий об\'єкт задачі 2. Решта — задача 1, `filter` — спільні зі старим станом (structural sharing). Тому оновлення дешеве, а `React.memo`, селектори й `computed` можуть порівнювати `===` і пропускати незмінені частини. Глибока копія всього стану (`structuredClone`) цю перевагу знищила б.'
    },
    {
      id: 'fp-quiz-hidden-mutation',
      group: 'immutability',
      type: 'quiz',
      level: 3,
      title: 'Приховані мутації: sort і reverse',
      tags: [
        'immutability',
        'arrays'
      ],
      question: `
Що виведе код?

\`\`\`js
const nums = [10, 1, 9];
const sorted = nums.sort();
const reversed = nums.reverse();

console.log(nums, sorted === nums, reversed);
\`\`\`
`,
      options: [
        '`[10, 1, 9] false [9, 1, 10]`',
        '`[1, 9, 10] true [10, 9, 1]`',
        '`[9, 10, 1] true [9, 10, 1]`',
        '`[10, 9, 1] true [10, 9, 1]`'
      ],
      answer: 2,
      why: [
        'Ні: `sort` мутує вихідний масив і повертає те саме посилання.',
        'Ні: без компаратора `sort` порівнює рядки (`\'10\' < \'9\'`), тож `[1, 9, 10]` не вийде.',
        'Так: `sort()` → `[1, 10, 9]` (рядкове порівняння) у тому ж масиві, `reverse()` → `[9, 10, 1]` теж у ньому.',
        'Ні: числового сортування не було — порядок після `sort()` рядковий: `[1, 10, 9]`.'
      ],
      hint: 'Чи створюють `sort` і `reverse` нові масиви? І як `sort()` без компаратора порівнює числа?',
      explanation: `
\`sort\` і \`reverse\` **мутують** і повертають той самий масив; \`sort()\` без компаратора порівнює рядки. Іммутабельно: \`toSorted((a, b) => a - b)\`, \`toReversed()\` або \`[...nums].sort(...)\`. \`state.items.sort()\` у React — класичний баг.
`
    },
    {
      id: 'fp-todos-reducer',
      group: 'immutability',
      type: 'code',
      level: 2,
      title: 'Редʼюсер списку задач без мутацій',
      tags: [
        'immutability',
        'pure-functions',
        'redux'
      ],
      description: `
**Завдання.** Напишіть чистий редʼюсер \`todosReducer(state, action)\` для списку задач: додати, перемкнути, видалити — без мутацій.

**Де трапляється:** \`useReducer\`/Redux у кожному React-проєкті; на співбесіді — «онови елемент масиву в стані без мутації».

**Що написати**
- \`todosReducer(state, action)\` → **новий** масив задач \`{ id, text, done }\`:
  - \`{ type: 'add', id, text }\` → додає \`{ id, text, done: false }\` у кінець;
  - \`{ type: 'toggle', id }\` → інвертує \`done\` у задачі з цим \`id\`;
  - \`{ type: 'remove', id }\` → видаляє задачу;
  - невідомий \`type\` → повертає **той самий** \`state\`.

**Приклад**
\`\`\`js
let s = [];
s = todosReducer(s, { type: 'add', id: 1, text: 'Купити хліб' });
s = todosReducer(s, { type: 'toggle', id: 1 });
// [{ id: 1, text: 'Купити хліб', done: true }]
\`\`\`

**Як це працює:** React перерендерює, коли посилання на стан змінилось (\`prev !== next\`). Тому замість \`push\`/\`splice\`/\`todo.done = …\` повертаємо нові масиви (\`[...state, x]\`, \`map\`, \`filter\`) і нові об'єкти лише для змінених задач (\`{ ...t, done: !t.done }\`).

**Врахуйте:** незмінені задачі зберігають посилання (\`===\`), щоб \`React.memo\` не перерендерював їх.
`,
      starter: `function todosReducer(state, action) {
  switch (action.type) {
    case 'add':
      // TODO: новий масив з новою задачею в кінці (done: false)
      return state;
    case 'toggle':
      // TODO: map — змінена задача як { ...t, done: !t.done }, інші без змін
      return state;
    case 'remove':
      // TODO: filter за id
      return state;
    default:
      return state;
  }
}

// Спробуйте в консолі:
// todosReducer([], { type: 'add', id: 1, text: 'x' }); // [{ id: 1, text: 'x', done: false }]
`,
      solution: `function todosReducer(state, action) {
  switch (action.type) {
    case 'add':
      return [...state, { id: action.id, text: action.text, done: false }];
    case 'toggle':
      // нова копія лише для зміненої задачі — інші посилання зберігаються
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case 'remove':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}
`,
      hints: [
        '`add`: `[...state, { id: action.id, text: action.text, done: false }]`.',
        '`toggle`: `state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t))`; `remove`: `state.filter(...)`.'
      ],
      tests: [
        {
          name: 'add додає задачу і не мутує стан',
          code: 'const s = [{ id: 1, text: "a", done: false }];\nconst snap = structuredClone(s);\nconst n = todosReducer(s, { type: "add", id: 2, text: "b" });\nexpect(n).toEqual([{ id: 1, text: "a", done: false }, { id: 2, text: "b", done: false }]);\nexpect(n).not.toBe(s);\nexpect(s).toEqual(snap);'
        },
        {
          name: 'toggle змінює лише потрібну задачу',
          code: 'const s = [{ id: 1, text: "a", done: false }, { id: 2, text: "b", done: false }];\nconst n = todosReducer(s, { type: "toggle", id: 2 });\nexpect(n[1]).toEqual({ id: 2, text: "b", done: true });\nexpect(s[1].done).toBe(false);\nexpect(n[1]).not.toBe(s[1]);\nexpect(n[0]).toBe(s[0]);'
        },
        {
          name: 'toggle двічі повертає done назад',
          code: 'let s = [{ id: 1, text: "a", done: false }];\ns = todosReducer(s, { type: "toggle", id: 1 });\ns = todosReducer(s, { type: "toggle", id: 1 });\nexpect(s[0].done).toBe(false);'
        },
        {
          name: 'remove видаляє задачу',
          code: 'const s = [{ id: 1, text: "a", done: false }, { id: 2, text: "b", done: true }];\nconst n = todosReducer(s, { type: "remove", id: 1 });\nexpect(n).toEqual([{ id: 2, text: "b", done: true }]);\nexpect(s).toHaveLength(2);'
        },
        {
          name: 'невідомий action → той самий стан',
          code: 'const s = [{ id: 1, text: "a", done: false }];\nexpect(todosReducer(s, { type: "unknown" })).toBe(s);'
        }
      ],
      explanation: `
Редʼюсер чистий: ті самі \`state\` і \`action\` → той самий результат, вхід не змінюється. Нове посилання сигналізує React/Redux про зміну, а збережені посилання незмінених задач дозволяють \`memo\` пропустити їх рендер.

**Типові помилки:** \`state.push(...)\`; \`todo.done = !todo.done\` у \`map\`; нове посилання для невідомої дії (зайві рендери).

**Що можуть спитати далі:** як те саме написати з Immer; чому редʼюсер не може робити запити?
`
    },
    {
      id: 'fp-update-in',
      group: 'immutability',
      type: 'code',
      level: 2,
      title: 'updateIn — іммутабельне оновлення за шляхом',
      tags: [
        'immutability',
        'structural-sharing'
      ],
      description: `
**Завдання.** Напишіть \`updateIn(obj, path, updater)\` — іммутабельне оновлення значення за шляхом зі structural sharing.

**Де трапляється:** оновлення вкладеного стану в Redux/React (\`state.user.visits++\` без мутації); аналог \`lodash/fp/update\`, Immer.

**Що написати**
- \`updateIn(obj, path, updater)\` → **новий** об'єкт, де значення за \`path\` (масив ключів) замінене на \`updater(старе)\`;
  - вхід не мутується;
  - копіюються лише вузли на шляху, решта гілок — ті самі посилання (\`===\`);
  - масиви копіюються як масиви;
  - відсутній проміжний вузол → порожній об'єкт.

**Приклад**
\`\`\`js
const state = { user: { name: 'Ann', visits: 1 }, settings: { theme: 'dark' } };
const next = updateIn(state, ['user', 'visits'], (v) => v + 1);
next.user.visits;                 // 2
next.settings === state.settings; // true
state.user.visits;                // 1
\`\`\`

**Як це працює:** рекурсія по шляху: на кожному рівні робимо **поверхневу** копію вузла (\`{ ...node }\` або \`node.slice()\`) і замінюємо в ній одну дитину на результат рекурсивного виклику. Інші дочірні посилання переходять у копію без змін — це і є structural sharing.

**Врахуйте:** порожній шлях → \`updater(obj)\`.
`,
      starter: `function updateIn(obj, path, updater) {
  // 1. База: path порожній → return updater(obj)
  // 2. const [key, ...rest] = path; вузол = obj ?? {}
  // 3. copy = масив ? node.slice() : { ...node }
  // 4. copy[key] = updateIn(node[key], rest, updater); return copy
  // TODO
}

// Спробуйте в консолі:
// updateIn({ a: { b: 1 } }, ['a', 'b'], (v) => v + 1); // { a: { b: 2 } }
`,
      solution: `function updateIn(obj, path, updater) {
  if (path.length === 0) return updater(obj);

  const [key, ...rest] = path;
  const source = obj ?? {};
  // копіюємо ЛИШЕ вузол на шляху; решта посилань — спільні
  const copy = Array.isArray(source) ? source.slice() : { ...source };
  copy[key] = updateIn(source[key], rest, updater);
  return copy;
}
`,
      hints: [
        'База рекурсії: `if (path.length === 0) return updater(obj);`.',
        'Копія вузла: `Array.isArray(node) ? node.slice() : { ...node }`, відсутній вузол — `obj ?? {}`.'
      ],
      tests: [
        {
          name: 'оновлює значення',
          code: 'const s = { user: { name: "Ann", visits: 1 } };\nexpect(updateIn(s, ["user", "visits"], (v) => v + 1).user.visits).toBe(2);'
        },
        {
          name: 'не мутує оригінал',
          code: 'const s = { user: { visits: 1, tags: ["a"] } };\nconst snapshot = structuredClone(s);\nupdateIn(s, ["user", "visits"], (v) => v + 1);\nupdateIn(s, ["user", "tags", 0], (t) => t.toUpperCase());\nexpect(s).toEqual(snapshot);'
        },
        {
          name: 'structural sharing',
          code: 'const s = { user: { name: "Ann", visits: 1 }, settings: { theme: "dark" }, list: [{ id: 1 }, { id: 2 }] };\nconst n = updateIn(s, ["list", 1, "id"], () => 20);\nexpect(n).not.toBe(s);\nexpect(n.list).not.toBe(s.list);\nexpect(n.list[1]).not.toBe(s.list[1]);\nexpect(n.list[0]).toBe(s.list[0]);\nexpect(n.user).toBe(s.user);\nexpect(n.settings).toBe(s.settings);'
        },
        {
          name: 'масиви лишаються масивами',
          code: 'const s = { tags: ["a", "b"] };\nconst n = updateIn(s, ["tags", 0], (t) => t + "!");\nexpect(Array.isArray(n.tags)).toBe(true);\nexpect(n.tags).toEqual(["a!", "b"]);'
        },
        {
          name: 'створює відсутні вузли',
          code: 'const n = updateIn({}, ["a", "b", "c"], (v) => (v ?? 0) + 1);\nexpect(n).toEqual({ a: { b: { c: 1 } } });'
        },
        { name: 'порожній шлях', code: 'expect(updateIn(5, [], (x) => x * 2)).toBe(10);' }
      ],
      explanation: `
Копіюється лише шлях: глибина копіювання = довжина шляху, а не розмір дерева. Тому \`React.memo(Settings)\` не перерендериться — \`next.settings === state.settings\`.

**Складність:** O(d · w) — d довжина шляху, w ключів у вузлах.

**Типові помилки:** \`{ ...arr }\` для масиву (стає об'єктом); копія лише верхнього рівня; \`structuredClone\` усього стану.
`
    },
    {
      id: 'fp-set-in',
      group: 'immutability',
      type: 'code',
      level: 3,
      title: 'setIn з рядковим шляхом і no-op оптимізацією',
      tags: [
        'immutability',
        'structural-sharing'
      ],
      description: `
**Завдання.** Напишіть \`setIn(obj, path, value)\` — іммутабельне встановлення значення за рядковим шляхом \`'a.b[0].c'\`, без копій, якщо нічого не змінилось.

**Де трапляється:** форми з вкладеними полями (\`name="address.city"\`, \`items[0].qty\`) — \`setIn\` у Formik, \`lodash.set\` без мутації.

**Що написати**
- \`setIn(obj, path, value)\` → нова версія \`obj\`:
  - \`path\` — рядок \`'a.b[0].c'\` або масив ключів;
  - вхід не мутується, незачеплені гілки — ті самі посилання;
  - відсутній вузол: **масив**, якщо його ключ — ціле число (\`0\`, \`'0'\`), інакше об'єкт;
  - **no-op:** значення вже \`Object.is\`-рівне \`value\` → повертається **той самий** \`obj\`;
  - кореневий масив підтримується.

**Приклад**
\`\`\`js
setIn({}, 'user.tags[0]', 'js'); // { user: { tags: ['js'] } }
const s = { a: { b: 1 } };
setIn(s, 'a.b', 1) === s;        // true — нічого не змінилось
\`\`\`

**Як це працює:** \`'a[0].b'\` → \`['a', '0', 'b']\` (замінити \`[x]\` на \`.x\` і розбити по крапці). Далі рекурсія як в \`updateIn\`; якщо рекурсивний виклик повернув те саме значення, що й було, вузол повертає **себе** — і так угору, тож no-op не створює жодної копії.

**Врахуйте:** \`Object.is(NaN, NaN)\` — \`true\`; \`null\` на шляху замінюється вузлом.
`,
      starter: `function toPath(path) {
  // TODO: масив → як є; рядок 'a.b[0]' → ['a', 'b', '0']
}

const isIndex = (key) => typeof key === 'number' || /^\\d+$/.test(key);

function setAt(node, keys, i, value) {
  // 1. i === keys.length → return value
  // 2. container = node існує ? node : (isIndex(keys[i]) ? [] : {})
  // 3. next = setAt(container[key], keys, i + 1, value)
  // 4. Якщо node існував, ключ у ньому є і Object.is(prev, next) → return node (no-op)
  // 5. Інакше копія контейнера з copy[key] = next
  // TODO
}

function setIn(obj, path, value) {
  return setAt(obj, toPath(path), 0, value);
}

// Спробуйте в консолі:
// setIn({}, 'list[0].name', 'x'); // { list: [{ name: 'x' }] }
`,
      solution: `function toPath(path) {
  if (Array.isArray(path)) return path;
  return String(path)
    .replace(/\\[(\\w+)\\]/g, '.$1') // a[0] → a.0
    .split('.')
    .filter((key) => key !== '');
}

const isIndex = (key) => typeof key === 'number' || /^\\d+$/.test(key);

function setAt(node, keys, i, value) {
  if (i === keys.length) return value;
  const key = keys[i];
  const exists = node !== null && node !== undefined;
  const container = exists ? node : isIndex(key) ? [] : {};
  const prev = container[key];
  const next = setAt(prev, keys, i + 1, value);

  // нічого не змінилось — повертаємо той самий вузол (і так угору по рекурсії)
  if (exists && Object.is(prev, next) && key in container) return node;

  const copy = Array.isArray(container) ? container.slice() : { ...container };
  copy[key] = next;
  return copy;
}

function setIn(obj, path, value) {
  return setAt(obj, toPath(path), 0, value);
}
`,
      hints: [
        '`toPath`: `String(path).replace(/\\[(\\w+)\\]/g, \'.$1\').split(\'.\').filter((k) => k !== \'\')`.',
        'No-op: `if (exists && key in container && Object.is(prev, next)) return node;` — перевірка «піднімається» рекурсією.'
      ],
      tests: [
        {
          name: 'рядковий шлях з індексами',
          code: 'const s = { user: { posts: [{ title: "a" }, { title: "b" }] } };\nconst n = setIn(s, "user.posts[1].title", "B");\nexpect(n.user.posts[1].title).toBe("B");\nexpect(s.user.posts[1].title).toBe("b");'
        },
        {
          name: 'створює масиви для числових ключів',
          code: 'const n = setIn({}, "user.tags[0]", "js");\nexpect(n).toEqual({ user: { tags: ["js"] } });\nexpect(Array.isArray(n.user.tags)).toBe(true);\nconst m = setIn({}, ["list", 0, "name"], "x");\nexpect(Array.isArray(m.list)).toBe(true);\nexpect(m.list[0]).toEqual({ name: "x" });'
        },
        {
          name: 'structural sharing і без мутацій',
          code: 'const s = { a: { x: 1 }, b: { y: [1, 2] } };\nconst snap = structuredClone(s);\nconst n = setIn(s, "b.y[0]", 10);\nexpect(s).toEqual(snap);\nexpect(n.a).toBe(s.a);\nexpect(n.b).not.toBe(s.b);\nexpect(n.b.y).toEqual([10, 2]);'
        },
        {
          name: 'no-op повертає той самий об\'єкт',
          code: 'const s = { a: { b: 1, c: NaN } };\nexpect(setIn(s, "a.b", 1)).toBe(s);\nexpect(setIn(s, ["a", "c"], NaN)).toBe(s);\nexpect(setIn(s, "a.b", 2)).not.toBe(s);'
        },
        {
          name: 'кореневий масив',
          code: 'const arr = [1, 2, 3];\nconst n = setIn(arr, [1], 20);\nexpect(n).toEqual([1, 20, 3]);\nexpect(Array.isArray(n)).toBe(true);\nexpect(arr).toEqual([1, 2, 3]);'
        },
        { name: 'перезапис примітиву вузлом', code: 'expect(setIn({ a: null }, "a.b", 1)).toEqual({ a: { b: 1 } });' }
      ],
      explanation: `
Дві «дорослі» деталі: тип нового вузла за ключем (\`list[0]\` → масив, як у \`lodash.set\`) і **no-op без копій** — «оновлення» тим самим значенням не створює новий стан і не викликає перерендер.

**Нюанси:** \`Object.is\` коректний для \`NaN\` і \`±0\`; ключ \`__proto__\` у шляху — вектор prototype pollution.

**Типові помилки:** завжди створювати об'єкти; копіювати без змін (нескінченні ре-рендери).
`
    },
    // ------------------------------------------------------------ Функції вищого порядку і композиція
    {
      id: 'fp-hof-compose-theory',
      group: 'hof',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Функції вищого порядку, compose і pipe',
      tags: [
        'higher-order-functions',
        'composition'
      ],
      question: 'Що таке функції вищого порядку? Що таке композиція функцій, чим compose відрізняється від pipe? Що таке point-free стиль і в чому різниця між декларативним та імперативним кодом? Оберіть **усі** правильні твердження.',
      choices: [
        '`compose(f, g)(x)` обчислює `f(g(x))` — справа наліво, а `pipe(f, g)(x)` — `g(f(x))`',
        '`pipe` і `compose` виконують функції в однаковому порядку, різниця лише в назві в бібліотеці',
        '`[\'1\', \'2\', \'3\'].map(parseInt)` дає `[1, 2, 3]`, тож point-free зі вбудованими функціями безпечний',
        'HOF — функція, що приймає та/або повертає функцію; приклади — `map`, `debounce`, HOC у React',
        'Декларативний код завжди швидший за імперативний, бо рушій оптимізує `map` і `filter` краще за цикли'
      ],
      answer: `
- **HOF** — функція, що приймає та/або повертає функцію: \`map\`, \`filter\`, \`addEventListener\`, \`debounce\`, \`memoize\`, HOC, middleware.
- **Композиція** — вихід однієї функції стає входом наступної:
\`\`\`js
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x); // справа наліво
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);         // зліва направо
const slugify = pipe(trim, lower, (s) => s.replace(/\\s+/g, '-'));
\`\`\`
- **Point-free:** \`arr.map(toUpper)\` без явних аргументів. Пастки: арність (\`map(parseInt)\`) і \`this\` (\`arr.map(obj.method)\`).
- **Декларативно** — що (\`filter\`/\`map\`); **імперативно** — як (цикли, мутації). Імперативне іноді швидше (один прохід, \`break\`).
`,
      correct: [0, 3],
      why: [
        'Так: `compose` — як у математиці, справа наліво; `pipe` — в порядку запису, як конвеєр.',
        'Ні: порядок протилежний — `compose(f, g)` спершу застосовує `g`, `pipe(f, g)` — спершу `f`.',
        'Ні: `map` передає ще й індекс, який `parseInt` сприймає як основу → `[1, NaN, NaN]`.',
        'Так: функції в JS — значення, тож їх можна приймати й повертати; це і є HOF.',
        'Ні: декларативний код простіший, але не обов\'язково швидший — цикл з `break` буває швидшим.'
      ],
      keyPoints: [
        'HOF приймає або повертає функції; функції — first-class values',
        'compose — справа наліво, pipe — зліва направо',
        'Композиція будує складні перетворення з малих чистих функцій',
        'Point-free: лаконічно, але пастки з арністю (map(parseInt)) і this',
        'Декларативно — що; імперативно — як; trade-off з продуктивністю'
      ],
      followUps: [
        'Як зробити асинхронний pipe?',
        'Чому [\'1\',\'2\',\'3\'].map(parseInt) дає [1, NaN, NaN]?',
        'Що таке HOC у React і чим його замінили хуки?'
      ]
    },
    {
      id: 'fp-quiz-compose-order',
      group: 'hof',
      type: 'quiz',
      level: 2,
      title: 'Порядок у compose і pipe',
      tags: [
        'composition'
      ],
      question: `
Що виведе код?

\`\`\`js
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

const inc = (x) => x + 1;
const double = (x) => x * 2;

console.log(compose(inc, double)(5), pipe(inc, double)(5));
\`\`\`
`,
      options: [
        '`12 11`',
        '`11 12`',
        '`12 12`',
        '`11 11`'
      ],
      answer: 1,
      why: [
        'Ні: напрямок переплутано — `compose(inc, double)` спершу подвоює.',
        'Так: `compose` = `inc(double(5))` = 11, `pipe` = `double(inc(5))` = 12.',
        'Ні: `compose` і `pipe` дають різний порядок, тож результати різні.',
        'Ні: `pipe(inc, double)(5)` = `double(6)` = 12, а не 11.'
      ],
      hint: 'Яка з функцій у `compose(inc, double)` застосується до `5` першою?',
      explanation: `
\`reduceRight\` починає з останньої функції → \`compose(f, g)(x) = f(g(x))\`. \`reduce\` — з першої → \`pipe(f, g)(x) = g(f(x))\`. Мнемоніка: \`compose\` — як \`(f ∘ g)(x)\`, \`pipe\` — як Unix \`a | b\`.
`
    },
    {
      id: 'fp-compose-pipe',
      group: 'hof',
      type: 'code',
      level: 1,
      interview: true,
      title: 'compose і pipe',
      tags: [
        'composition',
        'higher-order-functions'
      ],
      description: `
**Завдання.** Напишіть \`compose(...fns)\` і \`pipe(...fns)\` — збирання нової функції з кількох.

**Де трапляється:** класика співбесід; Redux \`compose\` для enhancers, конвеєри обробки даних (\`pipe(trim, lower, slugify)\`).

**Що написати**
- \`compose(...fns)\` → функція, що застосовує \`fns\` **справа наліво**: \`compose(f, g, h)(x) === f(g(h(x)))\`;
- \`pipe(...fns)\` → **зліва направо**: \`pipe(f, g, h)(x) === h(g(f(x)))\`;
- перша застосована функція може приймати **кілька** аргументів, решта — по одному;
- без аргументів → тотожність \`x => x\`.

**Приклад**
\`\`\`js
const add = (a, b) => a + b;
const square = (x) => x * x;
pipe(add, square)(2, 3);    // 25
compose(square, add)(2, 3); // 25
\`\`\`

**Як це працює:** \`fns.reduce((f, g) => (...args) => f(g(...args)))\` поступово «загортає» функції одна в одну: найвнутрішня отримує всі аргументи, кожна зовнішня — результат попередньої. Для \`pipe\` — той самий прийом з оберненим порядком.

**Врахуйте:** \`reduce\` без початкового значення на \`[]\` кидає \`TypeError\` — порожній список обробіть окремо.
`,
      starter: `function compose(...fns) {
  // 1. Немає функцій → поверніть (x) => x
  // 2. Інакше «загорніть» функції: fns.reduce((f, g) => (...args) => ...)
  // TODO
}

function pipe(...fns) {
  // Те саме, але зліва направо
  // TODO
}

// Спробуйте в консолі:
// pipe((s) => s.trim(), (s) => s.toUpperCase())('  hi '); // 'HI'
`,
      solution: `function compose(...fns) {
  if (fns.length === 0) return (x) => x;
  // reduce «загортає» функції: (f, g) => (...args) => f(g(...args))
  return fns.reduce((f, g) => (...args) => f(g(...args)));
}

function pipe(...fns) {
  if (fns.length === 0) return (x) => x;
  return fns.reduce((f, g) => (...args) => g(f(...args)));
}
`,
      hints: [
        '`compose`: `fns.reduce((f, g) => (...args) => f(g(...args)))` — для `[f, g, h]` вийде `f(g(h(...args)))`.',
        '`pipe`: `fns.reduce((f, g) => (...args) => g(f(...args)))`. Не забудьте `if (!fns.length) return (x) => x;`.'
      ],
      tests: [
        {
          name: 'compose — справа наліво',
          code: 'const inc = (x) => x + 1, double = (x) => x * 2;\nexpect(compose(inc, double)(5)).toBe(11);\nexpect(compose(double, inc)(5)).toBe(12);'
        },
        {
          name: 'pipe — зліва направо',
          code: 'const inc = (x) => x + 1, double = (x) => x * 2;\nexpect(pipe(inc, double)(5)).toBe(12);\nexpect(pipe((s) => s.trim(), (s) => s.toUpperCase(), (s) => s + "!")("  hi ")).toBe("HI!");'
        },
        {
          name: 'перша функція отримує кілька аргументів',
          code: 'const add = (a, b) => a + b, square = (x) => x * x;\nexpect(pipe(add, square)(2, 3)).toBe(25);\nexpect(compose(square, add)(2, 3)).toBe(25);'
        },
        {
          name: 'без функцій — тотожність',
          code: 'expect(compose()(7)).toBe(7);\nexpect(pipe()("x")).toBe("x");'
        },
        {
          name: 'одна функція',
          code: 'const f = mockFn((x) => x * 3);\nexpect(pipe(f)(2)).toBe(6);\nexpect(compose(f)(2)).toBe(6);\nexpect(f).toHaveBeenCalledTimes(2);'
        },
        {
          name: 'кожна функція викликається один раз у правильному порядку',
          code: 'const log = [];\nconst a = (x) => (log.push("a"), x), b = (x) => (log.push("b"), x), c = (x) => (log.push("c"), x);\ncompose(a, b, c)(0);\nexpect(log).toEqual(["c", "b", "a"]);'
        }
      ],
      explanation: `
\`reduce\`-загортання дає одну функцію; перша застосована отримує всі аргументи.

**Складність:** виклик — O(n) (і глибина стеку n — для тисяч функцій краще цикл).

**Типові помилки:** переплутаний порядок; втрата додаткових аргументів першої функції; падіння на порожньому списку.
`
    },
    {
      id: 'fp-quiz-pointfree-method', group: 'hof', type: 'quiz', level: 2,
      title: 'Point-free з методом: де зникає this',
      tags: ['point-free', 'higher-order-functions', 'this'],
      question: `Що станеться?
\`\`\`js
const names = ['  Ann ', 'Bob  '];
const a = names.map((s) => s.trim());
const b = names.map(String.prototype.trim);
\`\`\``,
      options: [
        '`a` — `["Ann", "Bob"]`, а рядок з `b` кине `TypeError`',
        'Обидва дадуть `["Ann", "Bob"]`',
        '`b` дасть `["  Ann ", "Bob  "]`: `trim` без рядка нічого не змінює',
        '`b` дасть `["", ""]`: `trim` обробляє `undefined` як порожній рядок'
      ],
      answer: 0,
      why: [
        'Так: `map` викликає колбек як звичайну функцію, тож `this` у `trim` — `undefined`, і метод кидає «called on null or undefined».',
        'Ні: метод прототипу працює з `this`, а `map` не передає рядок як `this` — лише аргументом.',
        'Ні: `trim` не повертає вхід без змін, а кидає помилку, бо не знає, з яким рядком працювати.',
        'Ні: методи `String.prototype` не перетворюють `undefined` на рядок — вони кидають `TypeError`.'
      ],
      hint: 'Що таке `this` у функції, яку `map` викликає як колбек? Звідки `trim` бере рядок?',
      explanation: 'Point-free стиль передає функцію без обгортки — і це безпечно лише для функцій, яким не потрібен `this` і не заважають зайві аргументи. `map` викликає колбек як звичайну функцію (`this` — `undefined`), а метод прототипу працює саме з `this`. Виправлення — стрілка `(s) => s.trim()`. Споріднені пастки: `map(parseInt)` отримує зайвий аргумент-індекс (модуль «Функції»), `arr.forEach(obj.method)` губить `this` (модуль «this»). Перевірено: `TypeError: String.prototype.trim called on null or undefined`.'
    },
    {
      id: 'fp-small-combinators',
      group: 'hof',
      type: 'code',
      level: 2,
      title: 'Комбінатори: tap, flip, negate, ifElse',
      tags: [
        'higher-order-functions',
        'point-free'
      ],
      description: `
**Завдання.** Напишіть чотири маленькі HOF-обгортки: \`tap\`, \`flip\`, \`negate\`, \`ifElse\`.

**Де трапляється:** \`tap\` — логування чи аналітика всередині \`pipe\` без зміни даних; \`negate\` — інверсія предиката (\`items.filter(negate(isArchived))\`); \`ifElse\` — розгалуження в конвеєрі; \`flip\` — адаптувати порядок аргументів чужої функції. Так влаштовані Ramda і lodash/fp.

**Що написати**
- \`tap(fn)\` → функція \`x => x\`, що викликає \`fn(x)\` і повертає \`x\` без змін;
- \`flip(fn)\` → викликає \`fn\` з **переставленими першими двома** аргументами (решта як є);
- \`negate(predicate)\` → функція з тими самими аргументами, що повертає \`!predicate(...args)\` — саме \`true\`/\`false\`;
- \`ifElse(predicate, onTrue, onFalse)\` → функція, що з тими самими аргументами викликає \`onTrue\` або \`onFalse\` залежно від \`predicate\` і повертає результат; невибрана гілка не викликається.

**Приклад**
\`\`\`js
const isDone = (t) => t.done;
todos.filter(negate(isDone));                       // невиконані
const label = ifElse((n) => n === 1, () => 'один товар', (n) => n + ' шт.');
label(1); // 'один товар'
label(5); // '5 шт.'
flip((a, b) => a - b)(1, 10);                       // 9
pipe(tap(console.log), (x) => x * 2)(5);            // лог 5, результат 10
\`\`\`

**Як це працює:** кожна функція повертає обгортку, яка змінює спосіб виклику \`fn\`: порядок аргументів, результат чи вибір гілки. Обгортки передають далі **всі** аргументи (\`...args\`) і зберігають \`this\` (звичайна \`function\` + \`fn.apply(this, args)\`), тож працюють і як методи об'єкта.

**Врахуйте:** \`negate(() => 0)()\` → \`true\`, а не \`1\`; предикат у \`filter\` отримує ще й індекс — \`negate\` має його передати.
`,
      starter: `function tap(fn) {
  // TODO: повернути function (x) { fn.call(this, x); return x; }
}

function flip(fn) {
  // TODO: function (a, b, ...rest) { return fn.call(this, b, a, ...rest); }
}

function negate(predicate) {
  // TODO: function (...args) { ... !predicate.apply(this, args) ... }
}

function ifElse(predicate, onTrue, onFalse) {
  // 1. Повернути function (...args)
  // 2. predicate.apply(this, args) ? onTrue.apply(this, args) : onFalse.apply(this, args)
  // TODO
}

// Спробуйте в консолі:
// [1, 2, 3, 4].filter(negate((x) => x % 2 === 0)); // [1, 3]
`,
      solution: `function tap(fn) {
  return function (x) {
    fn.call(this, x);
    return x;
  };
}

function flip(fn) {
  return function (a, b, ...rest) {
    return fn.call(this, b, a, ...rest);
  };
}

function negate(predicate) {
  return function (...args) {
    return !predicate.apply(this, args);
  };
}

function ifElse(predicate, onTrue, onFalse) {
  return function (...args) {
    return predicate.apply(this, args) ? onTrue.apply(this, args) : onFalse.apply(this, args);
  };
}
`,
      hints: [
        'Усі чотири — функції, що повертають функцію. Щоб не губити `this`, повертайте звичайну `function`, а `fn` викликайте через `call`/`apply(this, …)`.',
        '`negate`: `return !predicate.apply(this, args)` — подвійне заперечення не потрібне, `!` уже дає булеве значення.',
        '`ifElse`: обчисліть умову один раз і викличте лише одну з гілок з тими самими `args`.'
      ],
      tests: [
        { name: 'tap повертає вхід і викликає fn', code: 'const seen = [];\nconst logIt = tap((x) => seen.push(x));\nconst obj = { a: 1 };\nexpect(logIt(obj)).toBe(obj);\nexpect(seen.length).toBe(1);\nexpect(seen[0]).toBe(obj);' },
        { name: 'flip переставляє перші два аргументи', code: 'const f = flip((a, b, c) => [a, b, c]);\nexpect(f(1, 2, 3)).toEqual([2, 1, 3]);\nexpect(flip((a, b) => a - b)(1, 10)).toBe(9);' },
        { name: 'negate: булевий результат і всі аргументи', code: 'expect([1, 2, 3, 4].filter(negate((x, i) => i % 2 === 0))).toEqual([2, 4]);\nexpect(negate(() => 0)()).toBe(true);\nexpect(negate(() => "x")()).toBe(false);' },
        { name: 'ifElse обирає гілку і не викликає іншу', code: 'const yes = mockFn(() => "один товар");\nconst no = mockFn((n) => n + " шт.");\nconst label = ifElse((n) => n === 1, yes, no);\nexpect(label(1)).toBe("один товар");\nexpect(label(5)).toBe("5 шт.");\nexpect(yes).toHaveBeenCalledTimes(1);\nexpect(no).toHaveBeenCalledTimes(1);\nexpect(no).toHaveBeenCalledWith(5);' },
        { name: 'обгортки зберігають this', code: 'const counter = { n: 2, isBig(limit) { return this.n > limit; } };\ncounter.isSmall = negate(counter.isBig);\nexpect(counter.isSmall(5)).toBe(true);\ncounter.flipped = flip(function (a, b) { return this.n + a - b; });\nexpect(counter.flipped(1, 10)).toBe(11);' }
      ],
      explanation: `
Комбінатори — найменші будівельні блоки функціонального стилю: кожен змінює одну річ у виклику (порядок, результат, гілку), а разом із \`pipe\` вони замінюють умовні оператори й проміжні змінні в конвеєрах даних.

**Типові помилки:** стрілка замість \`function\` в обгортці (губиться \`this\` методу); \`negate\` передає лише перший аргумент (ламається з індексом у \`filter\`); \`ifElse\` викликає обидві гілки «про запас».

**Що спитають далі:** як реалізувати \`cond\` (масив пар «предикат → обробник»); чим \`tap\` у RxJS схожий на наш; коли point-free шкодить читабельності (квіз про \`this\` у point-free вище).
`
    },
    {
      id: 'fp-data-last', group: 'hof', type: 'code', level: 2,
      title: 'Data-last хелпери для pipe: where, sortBy, take',
      tags: ['pipe', 'currying', 'pure-functions'],
      description: `
**Завдання.** Напишіть три маленькі **data-last** функції, кожна з яких повертає функцію «масив → новий масив», і зберіть з них конвеєр через \`pipe\`.

**Де трапляється:** так влаштовані Ramda, lodash/fp і оператори RxJS: спершу налаштування, дані — останніми, тож кроки складаються в \`pipe\` без обгорток. На роботі — підготовка списку для екрана: відфільтрувати, відсортувати, взяти першу сторінку.

**Що написати**
- \`pipe(...fns)\` уже є (з попередньої задачі);
- \`where(predicate)\` → \`(items) =>\` новий масив елементів, для яких \`predicate(item)\` істинний;
- \`sortBy(key, dir = 'asc')\` → \`(items) =>\` **новий** масив, відсортований за \`item[key]\` (\`'asc'\` або \`'desc'\`); рядки — через \`localeCompare\`, числа — різницею; рівні елементи зберігають порядок;
- \`take(n)\` → \`(items) =>\` перші \`n\` елементів;
- \`topActive\` — конвеєр: активні (\`active: true\`) користувачі за спаданням \`score\`, перші 3.

**Приклад**
\`\`\`js
const users = [
  { name: 'Ann', score: 70, active: true },
  { name: 'Bob', score: 95, active: false },
  { name: 'Cid', score: 88, active: true },
  { name: 'Dan', score: 92, active: true },
  { name: 'Eve', score: 60, active: true },
];
topActive(users).map((u) => u.name);                              // ['Dan', 'Cid', 'Ann']
pipe(sortBy('name', 'desc'), take(2))(users).map((u) => u.name);  // ['Eve', 'Dan']
\`\`\`

**Як це працює:** \`sortBy('score', 'desc')\` нічого не сортує — повертає функцію, яка запам'ятала налаштування в замиканні й чекає на дані. Усі кроки мають одну форму «масив → масив», тож складаються в \`pipe\` як деталі конструктора. Аналогія — ланцюжок \`.filter().toSorted().slice()\`, але кожен крок має ім'я і перевикористовується.

**Врахуйте:** вхідний масив не мутувати (\`sort\` мутує — використовуйте \`toSorted\`); \`take(0)\` → \`[]\`; кирилиця сортується правильно лише через \`localeCompare\` (за кодами символів «Є» опиниться перед «А»).
`,
      starter: `const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x); // з попередньої задачі

function where(predicate) {
  // повернути (items) => новий масив елементів, для яких predicate(item) істинний
  // TODO
}

function sortBy(key, dir = 'asc') {
  // повернути (items) => НОВИЙ масив, відсортований за item[key]:
  // рядки — localeCompare, числа — різниця; 'desc' — протилежний знак
  // TODO
}

function take(n) {
  // повернути (items) => перші n елементів
  // TODO
}

// Активні користувачі за спаданням score, перші 3:
const topActive = (users) => users; // TODO: зберіть з where, sortBy і take через pipe
`,
      solution: `const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

function where(predicate) {
  return (items) => items.filter(predicate);
}

function sortBy(key, dir = 'asc') {
  const sign = dir === 'desc' ? -1 : 1;
  return (items) =>
    items.toSorted((a, b) => {
      const x = a[key];
      const y = b[key];
      const diff = typeof x === 'string' ? x.localeCompare(y) : x - y;
      return diff * sign;
    });
}

function take(n) {
  return (items) => items.slice(0, n);
}

const topActive = pipe(
  where((u) => u.active),
  sortBy('score', 'desc'),
  take(3),
);
`,
      hints: [
        'Кожна функція повертає стрілку `(items) => …`: `where` — через `filter`, `take` — через `slice(0, n)`.',
        '`sortBy`: `items.toSorted((a, b) => …)`; для рядків `a[key].localeCompare(b[key])`, для чисел — різниця; для `desc` помножте результат на -1.',
        '`topActive = pipe(where((u) => u.active), sortBy(\'score\', \'desc\'), take(3))` — без власної функції-обгортки.'
      ],
      tests: [
        { name: 'where повертає функцію-фільтр', code: 'const f = where((x) => x > 1);\nexpect(typeof f).toBe("function");\nconst src = [1, 2, 3];\nexpect(f(src)).toEqual([2, 3]);\nexpect(src).toEqual([1, 2, 3]);' },
        { name: 'sortBy: числа, напрям, без мутації', code: 'const src = [{ n: 3 }, { n: 1 }, { n: 2 }];\nexpect(sortBy("n")(src).map((x) => x.n)).toEqual([1, 2, 3]);\nexpect(sortBy("n", "desc")(src).map((x) => x.n)).toEqual([3, 2, 1]);\nexpect(src.map((x) => x.n)).toEqual([3, 1, 2]);' },
        { name: 'sortBy: кирилиця і стабільність', code: 'const src = [{ name: "Ігор", g: 1 }, { name: "Андрій", g: 2 }, { name: "Єва", g: 1 }];\nexpect(sortBy("name")(src).map((x) => x.name)).toEqual(["Андрій", "Єва", "Ігор"]);\nexpect(sortBy("g")(src).map((x) => x.name)).toEqual(["Ігор", "Єва", "Андрій"]);' },
        { name: 'take', code: 'expect(take(2)([1, 2, 3])).toEqual([1, 2]);\nexpect(take(0)([1, 2])).toEqual([]);\nexpect(take(5)([1])).toEqual([1]);' },
        { name: 'topActive і власний конвеєр', code: 'const users = [{ name: "Ann", score: 70, active: true }, { name: "Bob", score: 95, active: false }, { name: "Cid", score: 88, active: true }, { name: "Dan", score: 92, active: true }, { name: "Eve", score: 60, active: true }];\nexpect(topActive(users).map((u) => u.name)).toEqual(["Dan", "Cid", "Ann"]);\nexpect(pipe(sortBy("name", "desc"), take(2))(users).map((u) => u.name)).toEqual(["Eve", "Dan"]);\nexpect(users[0].name).toBe("Ann");' }
      ],
      explanation: `
Data-last + каррінг перетворюють функції на «будівельні блоки» однієї форми, які \`pipe\` складає без обгорток. Той самий принцип у RxJS: \`source.pipe(filter(...), map(...), take(3))\`.

**Типові помилки:** \`items.sort(...)\` (мутує вхідний масив, а з ним — стан компонента); порівняння рядків через \`a > b ? 1 : -1\` (кирилиця, регістр, нестабільність); \`topActive\` як функція з ручним викликом кроків замість конвеєра.

**Що спитають далі:** чим data-last краще для композиції, ніж data-first (lodash vs lodash/fp); як типізувати \`pipe\` у TypeScript (перевантаження); як зробити конвеєр лінивим (iterator helpers у модулі ES6+).
`
    },
    {
      id: 'fp-pipe-async',
      group: 'hof',
      type: 'code',
      level: 2,
      title: 'pipeAsync — конвеєр з async-функцій',
      tags: [
        'composition',
        'async'
      ],
      description: `
**Завдання.** Напишіть \`pipeAsync(...fns)\` — конвеєр, де кроки можуть бути async, а кожен наступний чекає на попередній.

**Де трапляється:** завантаження → нормалізація → збереження в кеш; middleware-ланцюжки обробки запиту.

**Що написати**
- \`pipeAsync(...fns)\` → \`(input) => Promise\`:
  - застосовує \`fns\` зліва направо; кожна функція отримує **розгорнутий** результат попередньої;
  - функції синхронні або async;
  - помилка (throw/reject) на будь-якому кроці → відхилення, наступні кроки не виконуються;
  - без функцій → проміс з \`input\`.

**Приклад**
\`\`\`js
const loadUserName = pipeAsync(
  (id) => fetchJson('/users/' + id),
  (user) => user.name,
  (name) => name.toUpperCase()
);
await loadUserName(1); // 'ANN'
\`\`\`

**Як це працює:** \`fns.reduce((p, fn) => p.then(fn), Promise.resolve(input))\` будує ланцюжок \`then\`. \`then\` розгортає проміс, повернутий \`fn\`, а \`throw\` всередині колбека стає відхиленням і пропускає решту кроків.

**Врахуйте:** звичайний \`pipe\` передав би наступній функції **проміс**, а не значення.
`,
      starter: `function pipeAsync(...fns) {
  return (input) => {
    // Почніть з Promise.resolve(input) і на кожному кроці додавайте .then(fn)
    // TODO
  };
}

// Спробуйте в консолі:
// pipeAsync((x) => x + 1, async (x) => x * 2)(5).then(console.log); // 12
`,
      solution: `function pipeAsync(...fns) {
  return (input) =>
    // кожен крок чекає на попередній: then розгортає і значення, і проміси
    fns.reduce((promise, fn) => promise.then(fn), Promise.resolve(input));
}
`,
      hints: [
        '`fns.reduce((promise, fn) => promise.then(fn), Promise.resolve(input))`.',
        'Варіант з `async`: `let acc = input; for (const fn of fns) acc = await fn(acc); return acc;`.'
      ],
      tests: [
        {
          name: 'змішані sync і async кроки',
          code: 'const p = pipeAsync((x) => x + 1, async (x) => x * 2, (x) => Promise.resolve(x - 3));\nawait expect(p(5)).resolves.toBe(9);'
        },
        {
          name: 'завжди повертає проміс',
          code: 'const r = pipeAsync((x) => x)(1);\nexpect(r).toBeInstanceOf(Promise);\nawait expect(r).resolves.toBe(1);'
        },
        {
          name: 'кроки виконуються послідовно',
          code: 'useFakeTimers();\nconst second = mockFn((x) => x + "!");\nconst p = pipeAsync((x) => new Promise((r) => setTimeout(() => r(x + "a"), 100)), second)("z");\nawait flushPromises();\nexpect(second).not.toHaveBeenCalled();\nadvanceTimersByTime(100);\nawait expect(p).resolves.toBe("za!");\nexpect(second).toHaveBeenCalledWith("za");'
        },
        {
          name: 'помилка зупиняє конвеєр',
          code: 'const after = mockFn();\nconst p = pipeAsync(async () => { throw new Error("step failed"); }, after)(1);\nawait expect(p).rejects.toThrow("step failed");\nexpect(after).not.toHaveBeenCalled();'
        },
        {
          name: 'синхронний throw → reject',
          code: 'const p = pipeAsync(() => { throw new Error("sync"); })(1);\nawait expect(p).rejects.toThrow("sync");'
        },
        { name: 'без функцій', code: 'await expect(pipeAsync()(42)).resolves.toBe(42);' }
      ],
      explanation: `
Ланцюжок \`then\` уніфікує sync- і async-кроки; помилка пропускає решту.

**Типові помилки:** звичайний \`pipe\` з async-функціями; \`Promise.all\` (паралельно, а не конвеєр); \`fns[0](input)\` поза ланцюжком (синхронний throw вилітає назовні).

**Що можуть спитати далі:** таймаут/скасування всього конвеєра; middleware як у Koa (\`next()\`).
`
    },
    // ------------------------------------------------------------ Каррінг і часткове застосування
    {
      id: 'fp-currying-theory',
      group: 'currying',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Каррінг і часткове застосування',
      tags: [
        'currying',
        'partial-application'
      ],
      question: 'Що таке каррінг (currying)? Чим він відрізняється від часткового застосування (partial application)? Як реалізувати curry і які в нього обмеження? Де каррінг корисний на практиці?',
      choices: [
        'Каррінг і часткове застосування — одне й те саме: обидва фіксують частину аргументів через `bind`',
        'Автокаррінг на `fn.length` коректно враховує параметри з default і rest, тож арність задавати не треба',
        'Каррована функція викликається одразу з частиною аргументів, а відсутні параметри стають `undefined`',
        'Каррінг перетворює `f(a, b, c)` на `f(a)(b)(c)`, а часткове застосування разово фіксує частину аргументів'
      ],
      answer: `
- **Каррінг:** \`f(a, b, c)\` → \`f(a)(b)(c)\`; «автокаррінг» дозволяє \`f(a, b)(c)\` — виклик, коли набралась арність.
\`\`\`js
const curry = (fn) => function curried(...args) {
  return args.length >= fn.length ? fn.apply(this, args) : (...more) => curried.apply(this, [...args, ...more]);
};
\`\`\`
- **Часткове застосування:** зафіксувати частину аргументів за раз: \`const logError = partial(console.log, '[ERROR]')\`; вбудоване — \`fn.bind(null, ...preset)\`.
- **\`fn.length\`** не рахує default і rest: \`(a, b = 1) => {}\` має length 1 → \`curry(fn, arity)\`.
- **Де корисно:** «спершу налаштування, потім дані» (\`formatCurrency('uk-UA')('UAH')\`), предикати \`items.filter(hasRole('admin'))\`, унарні функції для \`pipe\`.
- **Ціна:** читабельність, стектрейси, типізація в TS.
`,
      correct: 3,
      why: [
        'Ні: каррінг — перетворення функції на ланцюжок викликів, а часткове застосування — разове фіксування аргументів (`bind` робить лише друге).',
        'Ні: `fn.length` не рахує параметри з default і rest — для таких функцій арність задають явно.',
        'Ні: каррована функція повертає нову функцію, поки не набереться арність, а не викликає `fn` з `undefined`.',
        'Так: `f(a, b, c)` → `f(a)(b)(c)` — каррінг; `partial(f, a)` → функція від решти — часткове застосування.'
      ],
      keyPoints: [
        'Каррінг: f(a, b, c) → f(a)(b)(c), виклик після набору арності',
        'Часткове застосування: зафіксувати частину аргументів (partial, bind)',
        'curry спирається на fn.length — не рахує default і rest параметри',
        'Практика: data-last конфігурація, спеціалізовані предикати, композиція в pipe',
        'Ціна: читабельність, стектрейси, типізація'
      ],
      followUps: [
        'Реалізуйте curry з плейсхолдерами',
        'Чому в Ramda дані передаються останнім аргументом?',
        'Як bind пов\'язаний з частковим застосуванням?'
      ]
    },
    {
      id: 'fp-curry',
      group: 'currying',
      type: 'code',
      level: 2,
      interview: true,
      title: 'curry(fn) на основі fn.length',
      tags: [
        'currying',
        'closures'
      ],
      description: `
**Завдання.** Напишіть \`curry(fn)\`: каррована функція збирає аргументи між викликами й викликає \`fn\`, щойно їх набралось \`fn.length\`.

**Де трапляється:** топ-задача співбесід; на практиці — налаштовані хелпери (\`const getUser = api('/users')\`), предикати для \`filter\`, функції для \`pipe\`.

**Що написати**
- \`curry(fn)\` → \`curried(...args)\`:
  - аргументів \`>= fn.length\` → результат \`fn(...args)\`;
  - інакше → нова функція, що чекає решту;
  - можна передавати будь-яку кількість за раз: \`f(1)(2)(3)\`, \`f(1, 2)(3)\`, \`f(1, 2, 3)\`;
  - проміжні функції багаторазові й незалежні; зайві аргументи передаються у \`fn\`; \`this\` першого виклику — у \`fn\`.

**Приклад**
\`\`\`js
const add3 = curry((a, b, c) => a + b + c);
const add1 = add3(1);
add1(2)(3);   // 6
add1(10, 20); // 31 — add1 не «зіпсувався»
\`\`\`

**Як це працює:** кожен проміжний виклик повертає нову стрілку, яка в **замиканні** тримає свій масив \`args\` і рекурсивно викликає \`curried\` з \`[...args, ...more]\`. Новий масив на кожному кроці — тому часткові функції не мають спільного стану.

**Врахуйте:** умова \`>=\`, а не \`===\`; функція без параметрів викликається одразу.
`,
      starter: `function curry(fn) {
  return function curried(...args) {
    // 1. Якщо args.length >= fn.length — return fn.apply(this, args)
    // 2. Інакше — return (...more) => curried.apply(this, [...args, ...more])
    // TODO
  };
}

// Спробуйте в консолі:
// curry((a, b) => a * b)(3)(4); // 12
`,
      solution: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    // нова функція з НОВИМ масивом аргументів — тому проміжні результати незалежні
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}
`,
      hints: [
        'Порівнюйте `args.length >= fn.length` — так зайві аргументи теж підходять.',
        'Не зберігайте аргументи в спільному масиві поза `curried` — інакше `add1(2)` «зіпсує» `add1`.'
      ],
      tests: [
        {
          name: 'усі способи передачі аргументів',
          code: 'const f = curry((a, b, c) => a + b + c);\nexpect(f(1)(2)(3)).toBe(6);\nexpect(f(1, 2)(3)).toBe(6);\nexpect(f(1)(2, 3)).toBe(6);\nexpect(f(1, 2, 3)).toBe(6);'
        },
        {
          name: 'проміжні функції незалежні',
          code: 'const f = curry((a, b, c) => [a, b, c]);\nconst one = f(1);\nconst oneTwo = one(2);\nexpect(oneTwo(3)).toEqual([1, 2, 3]);\nexpect(one(5)(6)).toEqual([1, 5, 6]);\nexpect(oneTwo(4)).toEqual([1, 2, 4]);'
        },
        {
          name: 'fn не викликається до набору арності',
          code: 'const spy = mockFn((a, b) => a * b);\nconst f = curry(function (a, b) { return spy(a, b); });\nconst g = f(2);\nexpect(spy).not.toHaveBeenCalled();\nexpect(g(5)).toBe(10);'
        },
        {
          name: 'зайві аргументи передаються',
          code: 'const f = curry(function (a, b) { return Array.from(arguments); });\nexpect(f(1)(2, 3, 4)).toEqual([1, 2, 3, 4]);'
        },
        {
          name: 'зберігає this',
          code: 'const obj = { base: 100, add: curry(function (a, b) { return this.base + a + b; }) };\nexpect(obj.add(1, 2)).toBe(103);\nexpect(obj.add(1)(2)).toBe(103);'
        },
        {
          name: 'функція без параметрів викликається одразу',
          code: 'const f = curry(() => "now");\nexpect(f()).toBe("now");'
        }
      ],
      explanation: `
Аргументи накопичуються в замиканнях, кожен крок — новий масив, тож часткові функції перевикористовувані.

**Складність:** O(k) на виклик (копіювання масиву).

**Типові помилки:** спільний \`args.push\`; \`===\` замість \`>=\`; \`fn.length\` з default-параметрами.

**Що можуть спитати далі:** плейсхолдери; явна арність; чим відрізняється від \`bind\`?
`
    },
    {
      id: 'fp-partial-placeholder',
      group: 'currying',
      type: 'code',
      level: 3,
      title: 'partial з плейсхолдерами',
      tags: [
        'partial-application',
        'symbol'
      ],
      description: `
**Завдання.** Напишіть \`partial(fn, ...preset)\` — часткове застосування з плейсхолдером \`_\`, що «залишає дірку» на будь-якій позиції.

**Де трапляється:** \`_.partial\` у lodash, \`R.__\` у Ramda; зафіксувати не перший аргумент: \`partial(setTimeout, _, 1000)\`, \`partial(greet, _, 'Ann')\`.

**Що написати**
- \`partial(fn, ...preset)\` → функція:
  - аргументи з \`preset\` стоять на своїх позиціях;
  - кожен \`_\` заповнюється **по черзі** аргументами виклику;
  - залишок аргументів виклику — в кінець;
  - не вистачило аргументів → на місці \`_\` передається \`undefined\`;
  - \`this\` виклику передається у \`fn\`.

**Приклад**
\`\`\`js
const greet = (greeting, name, punct) => greeting + ', ' + name + punct;
partial(greet, 'Hello', _, '!')('Ann'); // 'Hello, Ann!'
partial(greet, _, 'Ann')('Hi', '?');    // 'Hi, Ann?'
\`\`\`

**Як це працює:** на кожному виклику будуємо **новий** масив: \`preset.map(arg => arg === _ ? later[next++] : arg)\`, потім додаємо \`later.slice(next)\`. \`_\` — унікальний \`Symbol\`, тож він не сплутається зі справжнім значенням.

**Врахуйте:** не мутуйте \`preset\` — функцію викликатимуть багато разів.
`,
      starter: `const _ = Symbol('placeholder');

function partial(fn, ...preset) {
  return function (...later) {
    // 1. let next = 0;
    // 2. args = preset.map(arg => arg === _ ? later[next++] : arg)
    // 3. return fn.apply(this, args.concat(later.slice(next)))
    // TODO
  };
}

// Спробуйте в консолі:
// partial((a, b) => a - b, _, 1)(10); // 9
`,
      solution: `const _ = Symbol('placeholder');

function partial(fn, ...preset) {
  return function (...later) {
    let next = 0;
    // заповнюємо плейсхолдери по черзі аргументами поточного виклику
    const args = preset.map((arg) => (arg === _ ? later[next++] : arg));
    // невикористані аргументи — в кінець
    return fn.apply(this, args.concat(later.slice(next)));
  };
}
`,
      hints: [
        'Лічильник `next` показує, скільки аргументів виклику вже пішло в «дірки».',
        'Залишок: `later.slice(next)` — додайте в кінець; виклик через `fn.apply(this, ...)`.'
      ],
      tests: [
        {
          name: 'плейсхолдер посередині',
          code: 'const greet = (g, n, p) => g + ", " + n + p;\nexpect(partial(greet, "Hello", _, "!")("Ann")).toBe("Hello, Ann!");'
        },
        {
          name: 'плейсхолдер на початку + додаткові аргументи',
          code: 'const greet = (g, n, p) => g + ", " + n + p;\nexpect(partial(greet, _, "Ann")("Hi", "?")).toBe("Hi, Ann?");'
        },
        {
          name: 'кілька плейсхолдерів заповнюються по черзі',
          code: 'const f = (a, b, c, d) => [a, b, c, d];\nexpect(partial(f, _, 2, _)(1, 3, 4)).toEqual([1, 2, 3, 4]);'
        },
        {
          name: 'без плейсхолдерів — звичайне часткове застосування',
          code: 'const f = (a, b, c) => a + b + c;\nexpect(partial(f, 1, 2)(3)).toBe(6);'
        },
        {
          name: 'незаповнені плейсхолдери → undefined',
          code: 'const f = (...args) => args;\nexpect(partial(f, _, "x")()).toEqual([undefined, "x"]);'
        },
        {
          name: 'багаторазове використання і this',
          code: 'const f = function (a, b) { return this.p + a + b; };\nconst p = partial(f, _, "!");\nexpect(p.call({ p: ">" }, "a")).toBe(">a!");\nexpect(p.call({ p: "<" }, "b")).toBe("<b!");'
        }
      ],
      explanation: `
Плейсхолдер дозволяє фіксувати **будь-які** позиції, а не лише перші (як \`bind\`). Новий масив на кожному виклику робить функцію багаторазовою.

**Типові помилки:** мутувати \`preset\`; плейсхолдер-рядок (\`'_'\`) замість символу; губити зайві аргументи.
`
    },
    {
      id: 'fp-curry-placeholder',
      group: 'currying',
      type: 'code',
      level: 4,
      title: 'curry з плейсхолдерами (як у Ramda)',
      tags: [
        'currying',
        'partial-application'
      ],
      description: `
**Завдання.** Напишіть \`curry(fn, arity)\` з плейсхолдером \`_\` у **будь-якому** виклику (як у Ramda).

**Де трапляється:** відома задача BFE.dev/співбесід рівня Strong Middle+; у Ramda — \`R.subtract(R.__, 1)\`.

**Що написати**
- \`curry(fn, arity = fn.length)\` → каррована функція:
  - аргументи накопичуються між викликами;
  - \`_\` резервує позицію; нові аргументи **спершу заповнюють** «дірки» зліва направо, залишок — у кінець;
  - «дірку» можна заповнити іншим \`_\` (вона лишається вільною);
  - \`fn\` викликається, коли **перші \`arity\` позицій** — реальні значення;
  - проміжні функції незалежні.

**Приклад**
\`\`\`js
const f = curry((a, b, c) => [a, b, c]);
f(_, 2)(1)(3);    // [1, 2, 3]
f(_, _, 3)(1)(2); // [1, 2, 3]
f(_, 2)(_, 3)(1); // [1, 2, 3]
\`\`\`

**Як це працює:** зберігаємо масив зібраних аргументів (з \`_\`) у замиканні. Новий виклик: пройти зібрані, кожну \`_\` замінити черговим новим аргументом, решту нових дописати. Готово, коли \`merged.length >= arity\` і серед перших \`arity\` немає \`_\`.

**Врахуйте:** кожен крок — новий масив і нова функція.
`,
      starter: `const _ = Symbol('placeholder');

function curry(fn, arity = fn.length) {
  function collect(collected) {
    return function (...args) {
      // 1. Заповніть «дірки» в collected новими args зліва направо
      // 2. Невикористані args — у кінець
      // 3. Готово (перші arity — без _) → fn.apply(this, merged), інакше collect(merged)
      // TODO
    };
  }
  return collect([]);
}

// Спробуйте в консолі:
// curry((a, b) => a - b)(_, 1)(10); // 9
`,
      solution: `const _ = Symbol('placeholder');

function curry(fn, arity = fn.length) {
  function collect(collected) {
    return function (...args) {
      // 1) заповнюємо «дірки» в уже зібраних аргументах
      let next = 0;
      const merged = collected.map((arg) =>
        arg === _ && next < args.length ? args[next++] : arg
      );
      // 2) решту нових аргументів — у кінець
      while (next < args.length) merged.push(args[next++]);

      // 3) готові, якщо перші arity позицій — реальні значення
      const ready =
        merged.length >= arity && merged.slice(0, arity).every((arg) => arg !== _);

      return ready ? fn.apply(this, merged) : collect(merged);
    };
  }
  return collect([]);
}
`,
      hints: [
        'Злиття: `collected.map((arg) => (arg === _ && next < args.length ? args[next++] : arg))`, потім `while (next < args.length) merged.push(args[next++])`.',
        'Готовність: `merged.length >= arity && merged.slice(0, arity).every((a) => a !== _)`.'
      ],
      tests: [
        {
          name: 'без плейсхолдерів працює як звичайний curry',
          code: 'const f = curry((a, b, c) => a + b + c);\nexpect(f(1)(2)(3)).toBe(6);\nexpect(f(1, 2)(3)).toBe(6);\nexpect(f(1, 2, 3)).toBe(6);'
        },
        {
          name: 'плейсхолдер на початку',
          code: 'const f = curry((a, b, c) => [a, b, c]);\nexpect(f(_, 2)(1)(3)).toEqual([1, 2, 3]);\nexpect(f(_, _, 3)(1)(2)).toEqual([1, 2, 3]);'
        },
        {
          name: 'кілька дірок заповнюються одним викликом',
          code: 'const f = curry((a, b, c) => [a, b, c]);\nexpect(f(_, 2, _)(1, 3)).toEqual([1, 2, 3]);'
        },
        {
          name: 'плейсхолдер заповнюється плейсхолдером',
          code: 'const f = curry((a, b, c) => [a, b, c]);\nexpect(f(_, 2)(_, 3)(1)).toEqual([1, 2, 3]);'
        },
        {
          name: 'не викликає fn, поки є дірки',
          code: 'const spy = mockFn((a, b) => a - b);\nconst f = curry(spy, 2);\nconst g = f(_, 1);\nexpect(spy).not.toHaveBeenCalled();\nexpect(typeof g).toBe("function");\nexpect(g(10)).toBe(9);'
        },
        {
          name: 'незалежні проміжні функції',
          code: 'const f = curry((a, b, c) => [a, b, c]);\nconst g = f(_, "b");\nexpect(g("a1", "c1")).toEqual(["a1", "b", "c1"]);\nexpect(g("a2")("c2")).toEqual(["a2", "b", "c2"]);'
        },
        {
          name: 'явна арність',
          code: 'const f = curry((...xs) => xs.join("-"), 3);\nexpect(f(_, "b")("a")("c")).toBe("a-b-c");'
        }
      ],
      explanation: `
Ключ — злиття: дірки заповнюються першими, залишок дописується. Приклад \`f(_, 2)(_, 3)(1)\`: \`[_, 2]\` → \`[_, 2, 3]\` → \`[1, 2, 3]\` → виклик.

**Типові помилки:** готовність лише за \`length\`; спільний масив між викликами.

**Що можуть спитати далі:** чим це краще за стрілку \`(x) => subtract(x, 1)\` (часто — нічим: стрілка зрозуміліша)?
`
    },
    // ------------------------------------------------------------ Мемоізація
    {
      id: 'fp-quiz-memoize-key',
      group: 'memoization',
      type: 'quiz',
      level: 2,
      title: 'Мемоізація з ключем-об\'єктом у звичайному {}',
      tags: [
        'memoization'
      ],
      question: `
**Як це працює:** мемоізація зберігає результат за ключем і при повторному ключі повертає збережене, не викликаючи функцію. Ключі звичайного об'єкта \`{}\` — завжди **рядки**.

Що виведе код?

\`\`\`js
const memo = (fn) => {
  const cache = {};
  return (arg) => (arg in cache ? cache[arg] : (cache[arg] = fn(arg)));
};

const getLabel = memo((user) => user.name.toUpperCase());
console.log(getLabel({ name: 'ann' }), getLabel({ name: 'bob' }));
\`\`\`
`,
      options: [
        '`ANN BOB`',
        '`ANN ANN`',
        '`TypeError: Cannot convert object to primitive value`',
        '`undefined undefined`'
      ],
      answer: 1,
      why: [
        'Ні: другий виклик знаходить «той самий» ключ у кеші й функцію не викликає.',
        'Так: обидва об\'єкти як ключ стають рядком `\'[object Object]\'`, тож другий виклик повертає закешоване `ANN`.',
        'Ні: звичайний об\'єкт перетворюється на рядок `\'[object Object]\'` без помилки.',
        'Ні: перший виклик обчислює й зберігає `ANN`, тож `undefined` не буде.'
      ],
      hint: 'На який рядок перетворюється об\'єкт, коли його використовують як ключ `{}`?',
      explanation: `
Ключ \`{}\` приводиться до рядка: будь-який об'єкт → \`'[object Object]'\`, тож різні користувачі «збігаються». Виправлення: \`Map\`/\`WeakMap\` (ключ — посилання) або \`resolver\` (\`user.id\`). Мемоізувати варто лише чисті функції.
`
    },
    {
      id: 'fp-memoize-one',
      group: 'memoization',
      type: 'code',
      level: 2,
      title: 'memoizeOne: кеш останнього виклику (як useMemo / reselect)',
      tags: [
        'memoization',
        'react'
      ],
      description: `
**Завдання.** Напишіть \`memoizeOne(fn)\`: пам'ятати **лише останній** виклик і повертати збережений результат, якщо аргументи ті самі (за посиланням).

**Де трапляється:** селектори (\`reselect\`), \`useMemo\`, бібліотека \`memoize-one\`: \`visibleTodos(todos, filter)\` не перераховується на кожен рендер, поки \`todos\` і \`filter\` не змінились.

**Що написати**
- \`memoizeOne(fn)\` → \`memoized(...args)\`:
  - ті самі аргументи, що й минулого разу (кількість + кожен \`Object.is\`) → збережений результат без виклику \`fn\`;
  - інакше → викликати \`fn\`, запам'ятати аргументи й результат;
  - пам'ятає лише **один** останній виклик.

**Приклад**
\`\`\`js
const visibleTodos = memoizeOne((todos, filter) => todos.filter((t) => filter === 'all' || t.done));
visibleTodos(todos, 'all'); // обчислено
visibleTodos(todos, 'all'); // з кешу — той самий масив (===)
visibleTodos([...todos], 'all'); // нове посилання → обчислено знову
\`\`\`

**Як це працює:** у замиканні — \`lastArgs\` і \`lastResult\`. Порівняння за посиланням дешеве і працює, бо іммутабельні оновлення створюють нові масиви лише при зміні. Повернений той самий результат (\`===\`) не змушує дочірні компоненти перерендерюватися.

**Врахуйте:** перший виклик завжди рахує; \`Object.is(NaN, NaN)\` — \`true\`.
`,
      starter: `function memoizeOne(fn) {
  let lastArgs = null; // аргументи останнього виклику
  let lastResult;

  return function (...args) {
    // 1. Якщо lastArgs є, довжина та сама і кожен Object.is(args[i], lastArgs[i]) → return lastResult
    // 2. Інакше lastResult = fn.apply(this, args); lastArgs = args; return lastResult
    // TODO
  };
}

// Спробуйте в консолі:
// const f = memoizeOne((a) => { console.log('calc'); return a * 2; }); f(1); f(1); f(2);
`,
      solution: `function memoizeOne(fn) {
  let lastArgs = null;
  let lastResult;

  return function (...args) {
    const same =
      lastArgs !== null &&
      lastArgs.length === args.length &&
      args.every((arg, i) => Object.is(arg, lastArgs[i])); // порівняння за посиланням
    if (same) return lastResult;
    lastResult = fn.apply(this, args);
    lastArgs = args;
    return lastResult;
  };
}
`,
      hints: [
        'Порівняння: `lastArgs !== null && lastArgs.length === args.length && args.every((a, i) => Object.is(a, lastArgs[i]))`.',
        'Зберігайте `lastArgs = args` після виклику `fn` — лише один останній набір.'
      ],
      tests: [
        {
          name: 'ті самі аргументи → один виклик і той самий результат',
          code: 'const todos = [{ done: true }, { done: false }];\nconst fn = mockFn((list) => list.filter((t) => t.done));\nconst m = memoizeOne(fn);\nconst a = m(todos);\nconst b = m(todos);\nexpect(fn).toHaveBeenCalledTimes(1);\nexpect(b).toBe(a);'
        },
        {
          name: 'нове посилання → перерахунок',
          code: 'const fn = mockFn((list) => list.length);\nconst m = memoizeOne(fn);\nm([1, 2]);\nm([1, 2]);\nexpect(fn).toHaveBeenCalledTimes(2);'
        },
        {
          name: 'пам\'ятає лише останній виклик',
          code: 'const fn = mockFn((x) => x * 2);\nconst m = memoizeOne(fn);\nm(1); m(2); m(1);\nexpect(fn).toHaveBeenCalledTimes(3);\nm(1);\nexpect(fn).toHaveBeenCalledTimes(3);'
        },
        {
          name: 'кілька аргументів і різна кількість',
          code: 'const fn = mockFn((a, b) => [a, b]);\nconst m = memoizeOne(fn);\nm(1, "all");\nm(1, "all");\nexpect(fn).toHaveBeenCalledTimes(1);\nm(1, "done");\nm(1);\nexpect(fn).toHaveBeenCalledTimes(3);'
        },
        {
          name: 'NaN і undefined-результат кешуються',
          code: 'const fn = mockFn(() => undefined);\nconst m = memoizeOne(fn);\nm(NaN); m(NaN);\nexpect(fn).toHaveBeenCalledTimes(1);'
        }
      ],
      explanation: `
Кеш на один запис + порівняння за посиланням — дешевий і передбачуваний (немає витоку пам'яті). Працює в парі з іммутабельністю: нове посилання з'являється лише при реальній зміні.

**Типові помилки:** глибоке порівняння (дорожче за саме обчислення); \`===\` замість \`Object.is\` для \`NaN\`; кеш без перевірки кількості аргументів.

**Що можуть спитати далі:** чим \`useMemo\` відрізняється (кеш на компонент, масив залежностей); кастомна функція порівняння.
`
    },
    {
      id: 'fp-memoize-resolver',
      group: 'memoization',
      type: 'code',
      level: 3,
      title: 'memoize з resolver і LRU-обмеженням',
      tags: [
        'memoization',
        'caching',
        'closures'
      ],
      description: `
**Завдання.** Напишіть \`memoize(fn, { resolver, maxSize })\` — кеш результатів з власним ключем і LRU-обмеженням розміру.

**Де трапляється:** дорогі обчислення (форматування, фільтрація великих списків, парсинг) з повторюваними аргументами; \`_.memoize\` у lodash. Часта задача співбесід.

**Що написати**
- \`memoize(fn, { resolver, maxSize = Infinity } = {})\` → \`memoized(...args)\`:
  - ключ — \`resolver(...args)\`, якщо передано, інакше **перший аргумент** (як у lodash);
  - кешується будь-який результат, включно з \`undefined\`;
  - переповнення → видалити **найдавніше використаний** запис (читання «освіжає» запис);
  - \`memoized.cache\` (\`Map\`) і \`memoized.clear()\`;
  - \`this\` передається у \`fn\` і \`resolver\`.

**Приклад**
\`\`\`js
const area = memoize((w, h) => w * h, { resolver: (w, h) => w + 'x' + h });
area(2, 3); area(2, 3); // одне обчислення
\`\`\`

**Як це працює:** \`Map\` приймає будь-які ключі (об'єкти не стають \`'[object Object]'\`), \`has\` коректно бачить \`undefined\`, а **порядок вставки** дає простий LRU: «освіжити» = \`delete\` + \`set\`, «витіснити» = видалити \`cache.keys().next().value\`.

**Врахуйте:** без \`resolver\` ключ — лише перший аргумент (свідома поведінка).
`,
      starter: `function memoize(fn, { resolver, maxSize = Infinity } = {}) {
  const cache = new Map();

  function memoized(...args) {
    // 1. key = resolver ? resolver.apply(this, args) : args[0]
    // 2. Є в кеші (cache.has) → «освіжити» (delete + set) і повернути
    // 3. Інакше обчислити fn.apply(this, args), покласти в кеш
    // 4. cache.size > maxSize → видалити найстаріший: cache.keys().next().value
    // TODO
  }

  memoized.cache = cache;
  // 5. memoized.clear = ...
  return memoized;
}

// Спробуйте в консолі:
// const sq = memoize((x) => { console.log('calc'); return x * x; }); sq(3); sq(3);
`,
      solution: `function memoize(fn, { resolver, maxSize = Infinity } = {}) {
  const cache = new Map(); // Map зберігає порядок вставки — основа простого LRU

  function memoized(...args) {
    const key = resolver ? resolver.apply(this, args) : args[0];

    if (cache.has(key)) {
      const value = cache.get(key);
      // «освіжаємо» запис: переносимо в кінець порядку
      cache.delete(key);
      cache.set(key, value);
      return value;
    }

    const value = fn.apply(this, args);
    cache.set(key, value);
    if (cache.size > maxSize) {
      // перший ключ у Map — найдавніше використаний
      cache.delete(cache.keys().next().value);
    }
    return value;
  }

  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  return memoized;
}
`,
      hints: [
        'Перевіряйте `cache.has(key)`, а не `if (cache.get(key))` — інакше `undefined` і `0` не кешуються.',
        'LRU на `Map`: при попаданні `cache.delete(key); cache.set(key, value)`; при переповненні `cache.delete(cache.keys().next().value)`.'
      ],
      tests: [
        {
          name: 'кешує за першим аргументом за замовчуванням',
          code: 'const fn = mockFn((a, b) => a + (b || 0));\nconst m = memoize(fn);\nexpect(m(1, 2)).toBe(3);\nexpect(m(1, 100)).toBe(3);\nexpect(fn).toHaveBeenCalledTimes(1);'
        },
        {
          name: 'resolver для кількох аргументів',
          code: 'const fn = mockFn((w, h) => w * h);\nconst m = memoize(fn, { resolver: (w, h) => w + "x" + h });\nexpect(m(2, 3)).toBe(6);\nexpect(m(2, 3)).toBe(6);\nexpect(m(3, 2)).toBe(6);\nexpect(fn).toHaveBeenCalledTimes(2);'
        },
        {
          name: 'кешує undefined і falsy',
          code: 'const fn = mockFn(() => undefined);\nconst m = memoize(fn);\nm("a"); m("a");\nconst z = mockFn(() => 0);\nconst mz = memoize(z);\nmz(1); mz(1);\nexpect(fn).toHaveBeenCalledTimes(1);\nexpect(z).toHaveBeenCalledTimes(1);'
        },
        {
          name: 'LRU-витіснення',
          code: 'const fn = mockFn((x) => x * 10);\nconst m = memoize(fn, { maxSize: 2 });\nm(1); m(2);\nm(1);\nm(3);\nexpect([...m.cache.keys()]).toEqual([1, 3]);\nfn.mockClear();\nm(1);\nexpect(fn).not.toHaveBeenCalled();\nm(2);\nexpect(fn).toHaveBeenCalledTimes(1);'
        },
        {
          name: 'cache і clear',
          code: 'const fn = mockFn((x) => x);\nconst m = memoize(fn);\nm("a");\nexpect(m.cache).toBeInstanceOf(Map);\nexpect(m.cache.get("a")).toBe("a");\nm.clear();\nm("a");\nexpect(fn).toHaveBeenCalledTimes(2);'
        },
        {
          name: 'об\'єкти як ключі і this',
          code: 'const fn = mockFn(function (o) { return this.k + o.v; });\nconst m = memoize(fn);\nconst ctx = { k: 1, m };\nconst key = { v: 2 };\nexpect(ctx.m(key)).toBe(3);\nexpect(ctx.m(key)).toBe(3);\nexpect(ctx.m({ v: 2 })).toBe(3);\nexpect(fn).toHaveBeenCalledTimes(2);'
        }
      ],
      explanation: `
\`Map\` дає будь-які ключі, коректне кешування falsy і LRU за O(1) завдяки порядку вставки.

**Коли мемоізувати:** лише **чисті** дорогі функції з повторюваними аргументами.

**Типові помилки:** кеш на \`{}\` (ключі-рядки, колізії); \`if (cache[key])\`; безмежний кеш (витік пам'яті).

**Що можуть спитати далі:** TTL; \`WeakMap\` для об'єктних ключів; LRU vs LFU.
`
    },
    // ------------------------------------------------------------ Функтори і Result (просунуто)
    {
      id: 'fp-functors-theory',
      group: 'functors',
      type: 'theory',
      level: 4,
      title: 'Функтори, Maybe, Either — коротко',
      tags: [
        'functors',
        'monads'
      ],
      question: 'Що таке функтор? Поясніть на прикладі Array і Maybe. Що таке монада простими словами і чому Promise — «майже монада»? Чи варто використовувати Maybe/Either у фронтенд-коді?',
      choices: [
        'Функтор — будь-який об\'єкт з методом `then`, тож кожен thenable автоматично є і функтором, і монадою',
        'Функтор — контейнер з `map`, що повертає контейнер того ж типу; монада додає `flatMap` без вкладення',
        'Promise — строга монада: `then` не розгортає повернутий проміс, тож `Promise<Promise<T>>` цілком можливий',
        '`Maybe` кидає `TypeError` на `null`, щоб відсутнє значення не пролетіло ланцюжком непоміченим'
      ],
      answer: `
- **Функтор** — контейнер з \`map(fn)\`, що повертає контейнер **того ж типу**: \`[1, 2].map(inc)\` → масив. Закони: \`F.map(x => x) ≡ F\`, \`F.map(f).map(g) ≡ F.map(x => g(f(x)))\`.
- **Maybe** — «значення може бути відсутнім»:
\`\`\`js
const Maybe = (v) => ({
  map: (fn) => (v == null ? Maybe(null) : Maybe(fn(v))),
  getOrElse: (fallback) => (v == null ? fallback : v),
});
Maybe(user).map((u) => u.address).map((a) => a.city).getOrElse('Unknown');
// сьогодні: user?.address?.city ?? 'Unknown'
\`\`\`
- **Either/Result** — значення або помилка; \`map\` працює лише з успіхом, помилка «пролітає» без \`try/catch\`.
- **Монада** (спрощено) — функтор з \`flatMap\`: \`[1, 2].flatMap((x) => [x, x])\` → \`[1, 1, 2, 2]\`.
- **Promise — «майже монада»:** \`then\` = і \`map\`, і \`flatMap\`, але через автоматичне розгортання закони формально порушені.
- У фронтенді: \`?.\`, \`??\` і TS покривають більшість Maybe; Result корисний для очікуваних помилок (\`neverthrow\`, \`Effect\`).
`,
      correct: 1,
      why: [
        'Ні: функтор — контейнер з `map`; `then` — інший інтерфейс, і thenable не стає функтором автоматично.',
        'Так: `map` зберігає тип контейнера (масив → масив), а `flatMap` дозволяє функції повертати контейнер без вкладення.',
        'Ні: навпаки — `then` розгортає повернутий проміс, тому `Promise<Promise<T>>` отримати неможливо.',
        'Ні: суть `Maybe` — НЕ кидати: на `null` ланцюжок `map` просто пропускається до `getOrElse`.'
      ],
      keyPoints: [
        'Функтор — контейнер з map, що зберігає структуру (закони тотожності та композиції)',
        'Array — функтор; Maybe прибирає перевірки на null',
        'Either/Result — значення або помилка без try/catch',
        'Монада — функтор з flatMap (без вкладених контейнерів)',
        'Promise.then — і map, і flatMap; «майже монада»',
        'У JS багато випадків покривають ?., ?? і TypeScript'
      ],
      followUps: [
        'Чим map відрізняється від flatMap?',
        'Як реалізувати Result-тип для обробки помилок API?',
        'Чому Promise не є «справжньою» монадою?'
      ]
    },
    {
      id: 'fp-result-type',
      group: 'functors',
      type: 'code',
      level: 3,
      title: 'Result: обробка помилок без try/catch у ланцюжку',
      tags: [
        'functors',
        'errors',
        'composition'
      ],
      description: `
**Завдання.** Реалізуйте мінімальний тип \`Result\` (успіх або помилка) і функції для роботи з ним: \`ok\`, \`err\`, \`map\`, \`flatMap\`, \`getOrElse\`, \`fromTry\`.

**Де трапляється:** валідація форм і розбір відповідей API, де помилка — очікувана ситуація (\`neverthrow\`, \`fp-ts\`, \`Effect\`); тип \`Result\` у Rust/Swift.

**Що написати**
- \`ok(value)\` → \`{ ok: true, value }\`; \`err(error)\` → \`{ ok: false, error }\`;
- \`map(result, fn)\` → успіх: \`ok(fn(value))\`; помилка: **той самий** \`result\`, \`fn\` не викликається;
- \`flatMap(result, fn)\` → успіх: \`fn(value)\` (вона сама повертає \`Result\`); помилка: той самий \`result\`;
- \`getOrElse(result, fallback)\` → \`value\` або \`fallback\`;
- \`fromTry(fn)\` → \`ok(fn())\` або \`err(кинута помилка)\`.

**Приклад**
\`\`\`js
const parseAge = (input) =>
  flatMap(fromTry(() => JSON.parse(input)), (n) =>
    Number.isInteger(n) && n > 0 ? ok(n) : err(new Error('bad age')));

getOrElse(map(parseAge('30'), (n) => n + 1), 0); // 31
parseAge('abc').ok;           // false (SyntaxError)
parseAge('-5').error.message; // 'bad age'
\`\`\`

**Як це працює:** \`Result\` — функтор: \`map\` застосовує функцію до вмісту лише для успіху, а помилка «пролітає» ланцюжок без змін — без \`try/catch\` на кожному кроці. \`flatMap\` потрібен, коли крок сам може провалитися: він повертає \`Result\`, і ми не отримуємо \`ok(ok(…))\`.

**Врахуйте:** не мутувати вхідний \`result\`.
`,
      starter: `const ok = (value) => {
  // TODO: { ok: true, value }
};
const err = (error) => {
  // TODO: { ok: false, error }
};

function map(result, fn) {
  // TODO: успіх → ok(fn(result.value)); помилка → result
}

function flatMap(result, fn) {
  // TODO: успіх → fn(result.value); помилка → result
}

function getOrElse(result, fallback) {
  // TODO
}

function fromTry(fn) {
  // TODO: try { return ok(fn()) } catch (e) { return err(e) }
}

// Спробуйте в консолі:
// getOrElse(map(ok(2), (x) => x * 10), 0); // 20
`,
      solution: `const ok = (value) => ({ ok: true, value });
const err = (error) => ({ ok: false, error });

function map(result, fn) {
  // помилка «пролітає» без змін, fn не викликається
  return result.ok ? ok(fn(result.value)) : result;
}

function flatMap(result, fn) {
  // fn сама повертає Result — не загортаємо вдруге
  return result.ok ? fn(result.value) : result;
}

function getOrElse(result, fallback) {
  return result.ok ? result.value : fallback;
}

function fromTry(fn) {
  try {
    return ok(fn());
  } catch (e) {
    return err(e);
  }
}
`,
      hints: [
        'Усі функції — один тернарний вираз за `result.ok`; для помилки повертайте сам `result`.',
        'Різниця: `map` загортає результат `fn` в `ok(...)`, а `flatMap` повертає результат `fn` як є.'
      ],
      tests: [
        {
          name: 'ok і err',
          code: 'const e = new Error("x");\nexpect(ok(1)).toEqual({ ok: true, value: 1 });\nexpect(err(e)).toEqual({ ok: false, error: e });'
        },
        {
          name: 'map: успіх і помилка',
          code: 'expect(map(ok(2), (x) => x * 10)).toEqual(ok(20));\nconst failed = err("bad");\nconst fn = mockFn();\nexpect(map(failed, fn)).toBe(failed);\nexpect(fn).not.toHaveBeenCalled();'
        },
        {
          name: 'flatMap не вкладає Result',
          code: 'expect(flatMap(ok(2), (x) => ok(x * 2))).toEqual({ ok: true, value: 4 });\nexpect(flatMap(ok(2), () => err("neg"))).toEqual({ ok: false, error: "neg" });\nconst failed = err("e");\nexpect(flatMap(failed, () => ok(1))).toBe(failed);'
        },
        {
          name: 'getOrElse',
          code: 'expect(getOrElse(ok(0), 5)).toBe(0);\nexpect(getOrElse(err("x"), 5)).toBe(5);'
        },
        {
          name: 'fromTry',
          code: 'expect(fromTry(() => 42)).toEqual(ok(42));\nconst r = fromTry(() => JSON.parse("{bad"));\nexpect(r.ok).toBe(false);\nexpect(r.error).toBeInstanceOf(SyntaxError);'
        },
        {
          name: 'ланцюжок parseAge',
          code: 'const parseAge = (input) => flatMap(fromTry(() => JSON.parse(input)), (n) => (Number.isInteger(n) && n > 0 ? ok(n) : err(new Error("bad age"))));\nexpect(getOrElse(map(parseAge("30"), (n) => n + 1), 0)).toBe(31);\nexpect(parseAge("abc").ok).toBe(false);\nexpect(parseAge("-5").error.message).toBe("bad age");'
        },
        {
          name: 'не мутує вхід',
          code: 'const r = ok(1);\nmap(r, (x) => x + 1);\nexpect(r).toEqual({ ok: true, value: 1 });'
        }
      ],
      explanation: `
\`Result\` робить помилку **значенням**: ланцюжок \`map\`/\`flatMap\` описує лише щасливий шлях, а перша помилка проходить до кінця без змін. Це функтор (\`map\`) і монада (\`flatMap\`) на практиці.

**Типові помилки:** \`map\` з функцією, що повертає \`Result\` (вийде \`ok(err(...))\` — потрібен \`flatMap\`); кидати винятки всередині кроків.

**Що можуть спитати далі:** порівняйте з \`[err, data]\` і \`try/catch\`; як типізувати \`Result<T, E>\` у TypeScript?
`
    }
  ]
});
