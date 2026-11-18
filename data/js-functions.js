FE.topic('js-functions', {
  intro: `
## Способи оголосити функцію

| | Declaration | Expression | Arrow |
|---|---|---|---|
| Синтаксис | \`function f() {}\` | \`const f = function () {}\` | \`const f = () => {}\` |
| Hoisting | повністю | лише змінна (TDZ / undefined) | лише змінна |
| \`arguments\` | так | так | **ні** (бере зовнішній) |
| \`new\` | так | так | **ні** (TypeError) |
| Дублікати параметрів (sloppy) | можна | можна | SyntaxError |

Функції — **значення першого класу (first-class)**: їх зберігають у змінних, передають, повертають, додають їм властивості. Функція, що приймає або повертає функцію, — **функція вищого порядку (HOF)**.

## Параметри

- **Default** обчислюється **при кожному виклику**, зліва направо, лише для \`undefined\` (не для \`null\`).
- **Rest** \`(...args)\` — справжній масив; \`arguments\` — array-like, у стрілках відсутній.
- \`fn.length\` — параметри **до першого** default/rest; \`fn.name\` виводиться і для \`const f = () => {}\`.

## Замикання (closure)

Функція + посилання на оточення, де її створено. Бачить **живі змінні**, а не копії.

\`\`\`js
function makeCounter() {
  let count = 0;          // приватний стан
  return () => ++count;   // замикає count
}
const c = makeCounter();
c(); c(); // 2
\`\`\`

Застосування: приватний стан, фабрики, \`once\`/\`memoize\`, обробники подій, модулі (IIFE). Ризик: утримання великих об'єктів у пам'яті.

## Рекурсія

- Обов'язкова **базова умова**; кожен виклик — кадр у стеку.
- Переповнення → \`RangeError: Maximum call stack size exceeded\` (~10 000 кадрів).
- TCO працює лише в Safari — для глибоких даних ітерація з явним стеком.

## Чисті функції

Однаковий результат для однакових аргументів + **немає побічних ефектів**. Легко тестувати, кешувати, комбінувати.
`,
  groups: [
    { id: 'kinds', title: 'Declaration, expression, стрілки' },
    { id: 'params', title: 'Параметри: default, rest, arguments' },
    { id: 'hof', title: 'Функції як значення: колбеки, фабрики, HOF' },
    { id: 'closures', title: 'Замикання' },
    { id: 'decorators', title: 'Замикання на практиці: once, memoize, декоратори' },
    { id: 'iife', title: 'IIFE' },
    { id: 'recursion', title: 'Рекурсія і стек викликів' },
    { id: 'pure', title: 'Чисті функції і пам\'ять' }
  ],
  items: [
    // ================================================================ kinds
    {
      id: 'fn-declaration-vs-expression',
      group: 'kinds',
      type: 'theory',
      level: 1,
      interview: true,
      title: 'Function Declaration vs Function Expression',
      tags: ['functions', 'hoisting'],
      question: 'Чим Function Declaration відрізняється від Function Expression? Що таке Named Function Expression і навіщо воно потрібне?',
      choices: [
        'Function Expression, присвоєний через `const`, можна викликати до рядка оголошення',
        'Ім\'я NFE `function fact(n) {}` видно лише всередині функції, і воно незмінне',
        'Ім\'я NFE стає змінною зовнішньої області, тож `fact()` доступна після присвоєння',
        'Різниця суто стилістична: обидві форми однаково піднімаються з тілом функції'
      ],
      correct: 1,
      why: [
        'Хибно: до рядка присвоєння `const`-змінна в TDZ → ReferenceError.',
        'Правильно: ім\'я NFE — локальне для тіла функції, тому рекурсія через нього надійна.',
        'Хибно: ззовні ім\'я NFE не видно — `fact()` поза функцією дасть ReferenceError.',
        'Хибно: declaration піднімається з тілом, а expression — лише як змінна.'
      ],
      hint: 'Hoisting, де функцію можна викликати, і чи має вона ім\'я.',
      answer: `
- **Declaration** — інструкція: \`function sum(a, b) {}\`. Створюється до виконання коду → можна викликати **до** оголошення.
- **Expression** — функція всередині виразу: \`const sum = function () {}\`, колбек, \`return\`. Існує лише після виконання рядка: до цього змінна в TDZ (\`const\`) або \`undefined\` (\`var\` → TypeError при виклику).

**NFE (Named Function Expression):**
\`\`\`js
const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1);
};
\`\`\`
\`fact\` видно лише всередині, і його не перезапишуть ззовні. Плюси: надійна рекурсія, зрозумілі стектрейси.

**Що обрати:** declaration — для основних функцій модуля; expression/стрілки — для колбеків і умовного створення.
`,
      keyPoints: [
        'Declaration — інструкція, Expression — частина виразу',
        'Declaration піднімається повністю, Expression — ні (TDZ або undefined)',
        'NFE: ім\'я доступне лише всередині функції, незмінне',
        'NFE корисне для рекурсії та стектрейсів'
      ],
      followUps: ['Що буде, якщо викликати function expression до оголошення через var і через const?', 'Чи має стрілкова функція ім\'я (fn.name)?']
    },
    {
      id: 'fn-arrow-arguments',
      group: 'kinds',
      type: 'quiz',
      level: 2,
      title: 'arguments у стрілковій функції',
      tags: ['arrow-functions', 'arguments'],
      question: `
Що виведе код?

\`\`\`js
function outer() {
  const arrow = () => arguments[0];
  return arrow('arrow');
}

console.log(outer('outer'));
\`\`\`
`,
      options: ['`arrow`', '`outer`', '`undefined`', '`ReferenceError: arguments is not defined`'],
      answer: 1,
      why: [
        'Своїх `arguments` у стрілки немає, тож її аргумент `\'arrow\'` сюди не потрапляє.',
        'Правильно: стрілка бере `arguments` найближчої звичайної функції — `outer`.',
        '`arguments[0]` існує — це перший аргумент `outer`.',
        'ReferenceError був би лише на верхньому рівні, де немає зовнішньої звичайної функції.'
      ],
      hint: 'Чи є в стрілки власний arguments? Якщо ні — звідки він береться?',
      explanation: `
Стрілка не має власного \`arguments\` — він береться лексично з \`outer\`. Тому \`arguments[0]\` → \`'outer'\`.

Власні аргументи стрілки — лише через rest: \`(...args) => args[0]\`.
`
    },
    {
      id: 'fn-arrow-differences',
      group: 'kinds',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Стрілкові функції vs звичайні',
      tags: ['arrow-functions', 'arguments'],
      question: 'Чим стрілкові функції відрізняються від звичайних (крім довжини запису)? Оберіть **усі** правильні твердження.',
      choices: [
        'Стрілка піднімається разом із тілом, як Function Declaration',
        '`() => { a: 1 }` повертає об\'єкт `{ a: 1 }`',
        'Стрілку не можна викликати з `new` — буде TypeError',
        'Власного `arguments` у стрілки немає — замість нього беруть rest-параметри',
        'Стрілка з тілом у фігурних дужках повертає останній вираз без `return`'
      ],
      correct: [2, 3],
      why: [
        'Хибно: стрілка — це вираз, присвоєний змінній; до присвоєння її викликати не можна.',
        'Хибно: фігурні дужки — це тіло функції, `a:` — мітка; результат `undefined`. Для об\'єкта: `() => ({ a: 1 })`.',
        'Правильно: стрілки не є конструкторами.',
        'Правильно: `arguments` береться із зовнішньої функції, тож свої аргументи — через `...args`.',
        'Хибно: неявне повернення працює лише без фігурних дужок: `x => x * 2`.'
      ],
      hint: 'arguments, new, неявне повернення, повернення об\'єкта.',
      answer: `
1. **Немає \`arguments\`** — використовуйте \`(...args)\`.
2. **Не конструктор** — \`new arrow()\` → TypeError.
3. **Неявне повернення** лише для виразу: \`x => x * 2\`. Об'єкт — у дужках: \`() => ({ a: 1 })\`.
4. **Дублікати параметрів** заборонені навіть у sloppy mode.
5. **Hoisting** — як у змінної, якій її присвоєно.

\`\`\`js
const toUser = (name) => ({ name, active: true }); // ок
const broken = (name) => { name };                 // undefined
\`\`\`

Ще одна ключова відмінність — поведінка \`this\` — розбирається в темі «this, call / apply / bind».

**Де стрілки найкращі:** колбеки (\`map\`, \`setTimeout\`, обробники), короткі чисті функції.
`,
      keyPoints: [
        'Немає arguments — використовуйте rest',
        'Не можна викликати з new',
        'Неявне повернення лише без {}; об\'єкт — у дужках',
        'Hoisting як у змінної'
      ],
      followUps: ['Що поверне () => {} і чому () => ({})?', 'Чому стрілки зручні як колбеки?']
    },
    {
      id: 'fn-arrow-errors',
      group: 'kinds',
      type: 'quiz',
      level: 2,
      title: 'Що не можна робити зі стрілками?',
      tags: ['arrow-functions'],
      question: 'Оберіть **усі** фрагменти, що кинуть помилку (браузер, звичайний скрипт, sloppy mode):',
      options: [
        '`new (() => {})();`',
        '`const f = () => ({ a: 1 }); f().a;`',
        '`(() => arguments)();` (на верхньому рівні скрипта)',
        '`const f = (a, a) => a;`',
        '`const f = (...args) => args.length; f(1, 2);`',
        '`function g(a, a) { return a; }`'
      ],
      answer: [0, 2, 3],
      why: [
        'Помилка: стрілка не конструктор → TypeError.',
        'Без помилки: об\'єкт у дужках повертається, `f().a` → `1`.',
        'Помилка: власного `arguments` немає, зовнішньої функції теж → ReferenceError.',
        'Помилка: стрілки забороняють дублікати параметрів навіть у sloppy mode → SyntaxError.',
        'Без помилки: rest у стрілці — звичайний масив, результат `2`.',
        'Без помилки: у sloppy mode звичайній функції дублікати дозволені (у strict — SyntaxError).'
      ],
      hint: 'У стрілок немає [[Construct]] та arguments. А правило про дублікати параметрів для них суворіше.',
      explanation: `
Стрілки — «полегшені» функції: без \`new\`, без \`arguments\`, із суворішим синтаксисом параметрів. Rest-параметри й повернення об'єкта в дужках працюють як звичайно.
`
    },
    // ================================================================ params
    {
      id: 'fn-params',
      group: 'params',
      type: 'theory',
      level: 2,
      title: 'Default-параметри, rest і arguments',
      tags: ['parameters', 'arguments', 'rest'],
      question: 'Як працюють параметри за замовчуванням? Чим rest-параметри відрізняються від arguments? Що повертає fn.length?',
      choices: [
        'Default обчислюється один раз при оголошенні функції, тож `list = []` спільний між викликами',
        'Default спрацьовує для будь-якого falsy-значення: `undefined`, `null`, `0`, `\'\'`',
        '`arguments` — справжній масив із методами `map`/`filter`, доступний і в стрілках',
        '`fn.length` рахує параметри до першого default чи rest: `(a, b = 1, c) => {}` дає `1`'
      ],
      correct: 3,
      why: [
        'Хибно (це модель Python): у JS default обчислюється при кожному виклику — масив щоразу новий.',
        'Хибно: default спрацьовує лише для `undefined`; `null`, `0`, `\'\'` — це значення.',
        'Хибно: `arguments` — array-like без методів масиву, і в стрілках його немає.',
        'Правильно: `length` зупиняється на першому параметрі з default або rest.'
      ],
      hint: 'Коли обчислюється default-значення? Для яких значень спрацьовує? Чи є arguments справжнім масивом?',
      answer: `
**Default-параметри**
- обчислюються **при кожному виклику**, зліва направо; можна посилатися на попередні: \`(a, b = a * 2)\`;
- спрацьовують **лише для \`undefined\`**.

\`\`\`js
function add(item, list = []) { list.push(item); return list; }
add(1); // [1]
add(2); // [2] — новий масив щоразу
\`\`\`

**Rest \`(...args)\`** — справжній масив «решти» аргументів, останній параметр, працює у стрілках.

**\`arguments\`** — array-like (є \`length\` та індекси, немає \`map\`): \`Array.from(arguments)\`. Немає у стрілках.

**\`fn.length\`** — параметри до першого default/rest: \`(a, b = 1, c) => {}\` → \`1\`. Використовують бібліотеки каррінгу.

**Практика:** rest замість \`arguments\`; опції — деструктуризацією: \`function init({ debug = false } = {})\`.
`,
      keyPoints: [
        'Default обчислюється при кожному виклику, лише для undefined',
        'Параметри ініціалізуються зліва направо',
        'Rest — справжній масив, arguments — array-like, немає у стрілках',
        'fn.length рахує параметри до першого default/rest'
      ],
      followUps: ['Чому f(null) не використовує default-значення?', 'Як перетворити arguments на масив?']
    },
    {
      id: 'fn-default-params-eval',
      group: 'params',
      type: 'quiz',
      level: 2,
      title: 'Коли обчислюється default-параметр?',
      tags: ['parameters'],
      question: `
Що виведе код?

\`\`\`js
let count = 0;

function f(a = ++count) {
  return a;
}

console.log(f(), f(10), f(), f(undefined), f(null));
\`\`\`
`,
      options: [
        '`1 10 1 1 null`',
        '`1 10 2 2 1`',
        '`1 10 2 3 null`',
        '`1 10 2 undefined null`',
        '`0 10 1 2 null`'
      ],
      answer: 2,
      why: [
        'Це модель «обчислити один раз при оголошенні» — у JS default обчислюється при кожному виклику.',
        '`f(undefined)` теж запускає default (→ 3), а `null` — ні, тож останнє — `null`.',
        'Правильно: `++count` виконується для `f()`, `f()`, `f(undefined)`; `10` і `null` — передані значення.',
        'Явний `undefined` еквівалентний відсутньому аргументу — default спрацьовує.',
        '`++count` — префіксний інкремент: повертає вже збільшене значення, тобто перше — `1`.'
      ],
      hint: 'Вираз за замовчуванням виконується при кожному виклику, де параметр дорівнює undefined. А null — це undefined?',
      explanation: `
Default-вираз виконується лише тоді, коли параметр \`undefined\` (відсутній або переданий явно): \`f()\` → 1, \`f(10)\` → 10 (\`count\` не змінюється), \`f()\` → 2, \`f(undefined)\` → 3, \`f(null)\` → \`null\`.
`
    },
    {
      id: 'fn-default-params-chain',
      group: 'params',
      type: 'quiz',
      level: 3,
      title: 'Default-параметри, що посилаються на попередні',
      tags: ['parameters'],
      question: `
Що виведе код?

\`\`\`js
function f(a, b = a * 2, c = b + 1) {
  return [a, b, c];
}

console.log(f(1));
console.log(f(1, undefined, 5));
console.log(f(1, null));
\`\`\`
`,
      options: [
        '`[1, 2, 3]` / `[1, 2, 5]` / `[1, 2, 3]`',
        '`[1, 2, 3]` / `[1, undefined, 5]` / `[1, null, NaN]`',
        '`[1, 2, 3]` / `[1, 2, 5]` / `[1, null, 1]`',
        '`[1, NaN, NaN]` / `[1, 2, 5]` / `[1, null, 1]`'
      ],
      answer: 2,
      why: [
        '`null` не запускає default, тож `b = null`, а не `2`.',
        'Явний `undefined` запускає default (`b = 2`), а `null + 1` дає `1`, не `NaN`.',
        'Правильно: параметри ініціалізуються зліва направо, `null` — значення, і `null + 1 === 1`.',
        'На момент обчислення `b` параметр `a` вже дорівнює `1`, тож `b = 2`, а не `NaN`.'
      ],
      hint: 'Параметри ініціалізуються зліва направо. null не запускає default, але бере участь в арифметиці. Чому дорівнює null + 1?',
      explanation: `
1. \`f(1)\`: \`b = 1 * 2 = 2\`, \`c = 2 + 1 = 3\`.
2. \`f(1, undefined, 5)\`: \`b\` → default \`2\`, \`c = 5\` передано.
3. \`f(1, null)\`: \`b = null\`, \`c = null + 1 = 1\` (\`null\` → \`0\`).

Посилатися на параметр **праворуч** не можна: \`function g(a = b, b = 1)\` → ReferenceError при \`g()\` (TDZ).
`
    },
    {
      id: 'fn-length-name',
      group: 'params',
      type: 'quiz',
      level: 3,
      title: 'fn.length і fn.name',
      tags: ['functions', 'parameters'],
      question: `
Що виведе код?

\`\`\`js
function a(x, y = 1, z) {}
const b = (...args) => {};
const c = function ({ p }, [q]) {};
const d = function named() {};

console.log(a.length, b.length, c.length, c.name, d.name);
\`\`\`
`,
      options: [
        '`3 0 2 c named`',
        '`1 0 2 c named`',
        '`1 1 2 anonymous d`',
        '`1 0 0 "" named`',
        '`2 0 2 c d`'
      ],
      answer: 1,
      why: [
        '`length` зупиняється на першому параметрі з default (`y = 1`), тож `a.length` — `1`, а не `3`.',
        'Правильно: `1` (до default), `0` (rest не рахується), `2` (два позиційні), ім\'я виводиться зі змінної, власне ім\'я NFE має пріоритет.',
        'Rest не рахується (`0`), а `name` анонімної функції береться зі змінної — `c`.',
        'Деструктуровані параметри — звичайні позиційні, тож `c.length` — `2`.',
        'Параметри після першого default не рахуються, а у NFE `name` — власне ім\'я `named`.'
      ],
      hint: 'length зупиняється на першому параметрі з default. Rest не рахується. Деструктуровані параметри — звичайні позиційні.',
      explanation: `
- \`a.length\` → \`1\`: рахується до першого default.
- \`b.length\` → \`0\`: rest не рахується.
- \`c.length\` → \`2\`: \`{ p }\` і \`[q]\` — два позиційні параметри.
- \`c.name\` → \`"c"\`: ім'я виводиться зі змінної (ES2015).
- \`d.name\` → \`"named"\`: власне ім'я NFE має пріоритет.
`
    },
    // ================================================================ hof
    {
      id: 'fn-first-class-hof',
      group: 'hof',
      type: 'theory',
      level: 1,
      title: 'First-class функції, HOF і колбеки',
      tags: ['hof', 'callbacks', 'first-class'],
      question: 'Що означає, що функції в JS — об\'єкти першого класу? Що таке функції вищого порядку та колбеки? Оберіть **усі** правильні твердження.',
      choices: [
        'Функції — звичайні значення: їх зберігають, передають, повертають і додають їм властивості',
        'Функція вищого порядку — будь-яка функція, оголошена на верхньому рівні модуля',
        'Колбек завжди асинхронний: його виклик відкладається до наступного тіку event loop',
        '`setTimeout` і `addEventListener` — функції вищого порядку, бо приймають функцію',
        'HOF мусить і приймати, і повертати функцію, інакше це звичайна функція'
      ],
      correct: [0, 3],
      why: [
        'Правильно: це і є «first-class» — функція поводиться як будь-яке інше значення.',
        'Хибно: HOF визначається не місцем оголошення, а тим, що вона приймає або повертає функцію.',
        'Хибно: колбек може бути синхронним — наприклад, колбек `arr.forEach(cb)` викликається одразу.',
        'Правильно: вони приймають функцію-колбек, отже це HOF.',
        'Хибно: достатньо однієї умови — приймає **або** повертає функцію.'
      ],
      hint: 'Що можна робити з функцією як зі значенням?',
      answer: `
**First-class functions** — функції є значеннями:
\`\`\`js
const handlers = { save: () => {} };           // зберегти
button.addEventListener('click', handlers.save); // передати
const add = (a) => (b) => a + b;                 // повернути
handlers.save.label = 'Зберегти';                // додати властивість
\`\`\`

**HOF** — приймає функцію **і/або** повертає функцію: \`setTimeout\`, \`addEventListener\`, \`forEach\`, фабрики, декоратори (\`once\`, \`debounce\`).

**Колбек** — функція, передана іншій функції для виклику:
- **синхронний** — викликається одразу (\`arr.forEach(cb)\`);
- **асинхронний** — пізніше (\`setTimeout(cb)\`, обробники подій).

**Навіщо:** HOF відокремлюють «що зробити» від «як/коли» — основа обробників, декораторів, композиції.
`,
      keyPoints: [
        'Функції — значення: зберігаються, передаються, повертаються, мають властивості',
        'HOF приймає та/або повертає функцію',
        'Колбек — функція, передана для подальшого виклику',
        'Синхронні vs асинхронні колбеки'
      ],
      followUps: ['Наведіть приклад синхронного і асинхронного колбека.', 'Чим декоратор функції відрізняється від звичайної HOF?']
    },
    {
      id: 'fn-create-adder',
      group: 'hof',
      type: 'code',
      level: 1,
      title: 'Фабрики функцій: знижка і форматер ціни',
      tags: ['closures', 'hof'],
      description: `
**Завдання.** Напишіть дві фабрики — функції, що створюють і повертають інші функції.

**Де трапляється:** у магазині є кілька акцій (−10%, −25%) і кілька валют. Замість \`applyDiscount(price, 10)\` у кожному місці один раз створюють \`const blackFriday = createDiscount(25)\` і далі передають її як колбек.

**Що написати**
- \`createDiscount(percent)\` → функція \`(price) => число\`: ціна зі знижкою \`percent\`%
- \`createFormatter(currency)\` → функція \`(amount) => рядок\`: \`'12.50 UAH'\` (2 знаки після коми, пробіл, валюта)

**Приклад**
\`\`\`js
const sale = createDiscount(10);
sale(200); // 180
sale(50);  // 45

const uah = createFormatter('UAH');
uah(12.5); // '12.50 UAH'
\`\`\`

**Як це працює:** кожен виклик \`createDiscount(10)\` створює нове оточення зі своїм \`percent\`. Повернута функція «пам'ятає» його (замикання), навіть коли \`createDiscount\` вже завершилась.

**Врахуйте:**
- \`createDiscount(0)\` — ціна без змін;
- різні фабрики незалежні: \`createDiscount(10)\` і \`createDiscount(50)\` не впливають одна на одну.
`,
      starter: `function createDiscount(percent) {
  // TODO: поверніть функцію (price) => ...,
  //       яка використовує percent із зовнішньої функції
}

function createFormatter(currency) {
  // TODO: поверніть функцію (amount) => 'XX.XX ' + currency
  //       підказка: amount.toFixed(2)
}

// Спробуйте в консолі: createDiscount(10)(200) // 180
`,
      solution: `function createDiscount(percent) {
  // percent запам'ятовується в замиканні
  return (price) => price * (1 - percent / 100);
}

function createFormatter(currency) {
  return (amount) => amount.toFixed(2) + ' ' + currency;
}
`,
      hints: [
        'Функція може повертати іншу функцію: `return (price) => ...`. Внутрішня функція бачить `percent`.',
        'Знижка: `price * (1 - percent / 100)`. Форматування: `amount.toFixed(2) + \' \' + currency`.'
      ],
      tests: [
        { name: 'createDiscount рахує знижку', code: 'const sale = createDiscount(10);\nexpect(sale(200)).toBeCloseTo(180);\nexpect(sale(50)).toBeCloseTo(45);\nexpect(createDiscount(0)(99)).toBe(99);' },
        { name: 'createFormatter форматує', code: 'const uah = createFormatter("UAH");\nexpect(uah(12.5)).toBe("12.50 UAH");\nexpect(uah(0)).toBe("0.00 UAH");\nexpect(createFormatter("$")(3)).toBe("3.00 $");' },
        { name: 'повертають функції', code: 'expect(typeof createDiscount(5)).toBe("function");\nexpect(typeof createFormatter("UAH")).toBe("function");' },
        { name: 'фабрики незалежні', code: 'const a = createDiscount(10);\nconst b = createDiscount(50);\nexpect(a(100)).toBeCloseTo(90);\nexpect(b(100)).toBeCloseTo(50);\nexpect(a(100)).toBeCloseTo(90);' }
      ],
      explanation: `
Кожен виклик фабрики — нове оточення з власним \`percent\`/\`currency\`; повернута стрілка його замикає. O(1).

Це **часткове застосування (partial application)**: фіксуємо один аргумент, решту передаємо пізніше.

**Типова помилка:** повернути результат замість функції (\`return price * ...\` — \`price\` ще не існує).

**Що спитають далі:** як узагальнити до \`partial(fn, ...fixedArgs)\`? Чим це відрізняється від каррінгу?
`
    },
    {
      id: 'fn-compose-two',
      group: 'hof',
      type: 'code',
      level: 1,
      title: 'Композиція двох функцій',
      tags: ['hof', 'composition'],
      description: `
**Завдання.** Реалізуйте \`compose2(f, g)\` — повертає нову функцію, яка обчислює \`f(g(...args))\`.

**Де трапляється:** збирання обробки даних з маленьких функцій: «застосувати знижку → відформатувати ціну». Класика співбесід — далі просять \`compose(...fns)\`.

**Що написати**
- \`compose2(f, g)\` → функція \`(...args) => f(g(...args))\`. \`g\` отримує всі аргументи, \`f\` — один (результат \`g\`).

**Приклад**
\`\`\`js
const discount = (price) => price * 0.9;
const format = (n) => n.toFixed(2) + ' ₴';

const finalPrice = compose2(format, discount);
finalPrice(100); // '90.00 ₴'

const sum = (a, b) => a + b;
compose2(format, sum)(2, 3); // '5.00 ₴'
\`\`\`

**Як це працює:** \`compose2\` нічого не обчислює одразу — повертає функцію, яка замикає \`f\` і \`g\` і викличе їх, коли викличуть її. Порядок «справа наліво», як у математиці: \`(f ∘ g)(x) = f(g(x))\`.

**Врахуйте:**
- \`g\` може приймати кілька аргументів — передайте всі (rest \`...args\`);
- під час \`compose2(f, g)\` ні \`f\`, ні \`g\` не викликаються.
`,
      starter: `function compose2(f, g) {
  // TODO: поверніть функцію, що приймає будь-яку кількість аргументів (...args),
  //       викликає g з ними, а результат передає в f
}

// Спробуйте в консолі: compose2((x) => x + 1, (x) => x * 2)(5) // 11
`,
      solution: `function compose2(f, g) {
  // справа наліво: спершу g, потім f
  return (...args) => f(g(...args));
}
`,
      hints: [
        'Поверніть нову функцію з rest-параметром `...args`.',
        'Порядок: спершу `g(...args)`, потім `f(результат)`.'
      ],
      tests: [
        { name: 'порядок справа наліво', code: 'const inc = (x) => x + 1;\nconst double = (x) => x * 2;\nexpect(compose2(inc, double)(5)).toBe(11);\nexpect(compose2(double, inc)(5)).toBe(12);' },
        { name: 'g отримує всі аргументи', code: 'const sum = (a, b, c = 0) => a + b + c;\nconst double = (x) => x * 2;\nexpect(compose2(double, sum)(2, 3)).toBe(10);\nexpect(compose2(double, sum)(1, 2, 3)).toBe(12);' },
        { name: 'f викликається з одним аргументом — результатом g', code: 'const f = mockFn((x) => x);\nconst g = mockFn(() => "r");\ncompose2(f, g)(1, 2);\nexpect(g).toHaveBeenCalledWith(1, 2);\nexpect(f).toHaveBeenCalledWith("r");' },
        { name: 'функції не викликаються під час композиції', code: 'const f = mockFn();\nconst g = mockFn();\nconst h = compose2(f, g);\nexpect(f).not.toHaveBeenCalled();\nexpect(g).not.toHaveBeenCalled();\nexpect(typeof h).toBe("function");' }
      ],
      explanation: `
HOF: приймає дві функції, повертає третю, що їх замикає. Виклик **лінивий**. O(1) + вартість \`f\` і \`g\`.

**compose vs pipe:** \`compose(f, g)\` — справа наліво, \`pipe(g, f)\` — зліва направо (як конвеєр).

**Типові помилки:** переплутати порядок; повернути \`f(g(x))\` одразу; прийняти лише \`x\` і втратити решту аргументів.

**Що спитають далі:** \`compose(...fns)\` для N функцій (тема «Функціональне програмування»).
`
    },
    {
      id: 'fn-unary-ary',
      group: 'hof',
      type: 'code',
      level: 2,
      interview: true,
      title: 'unary та ary: чому map(parseInt) ламається',
      tags: ['hof', 'arity', 'parameters'],
      description: `
**Завдання.** Реалізуйте обгортки, що обмежують кількість аргументів, які отримає функція.

**Де трапляється:** класика співбесід — \`['1', '2', '3'].map(parseInt)\` дає \`[1, NaN, NaN]\`. Колбек отримує \`(element, index, array)\`, і \`index\` стає \`radix\` для \`parseInt\`. Те саме буває з будь-якою вашою функцією з необов'язковим другим параметром.

**Що написати**
- \`ary(fn, n)\` → функція, яка викликає \`fn\` лише з **першими \`n\`** аргументами і повертає її результат
- \`unary(fn)\` → те саме, що \`ary(fn, 1)\`

**Приклад**
\`\`\`js
['1', '2', '3'].map(parseInt);        // [1, NaN, NaN]
['1', '2', '3'].map(unary(parseInt)); // [1, 2, 3]

const collect = (...args) => args;
ary(collect, 2)(1, 2, 3, 4); // [1, 2]
\`\`\`

**Як це працює:** обгортка збирає всі аргументи в масив через rest, відрізає перші \`n\` (\`slice\`) і передає їх у \`fn\` через spread.

**Врахуйте:**
- аргументів менше за \`n\` — передайте, скільки є (не доповнюйте \`undefined\`);
- \`fn\` не викликається під час створення обгортки.
`,
      starter: `function ary(fn, n) {
  // TODO: поверніть функцію (...args) => ...,
  //       яка викликає fn лише з args.slice(0, n) і повертає результат
}

function unary(fn) {
  // TODO: перевикористайте ary
}

// Спробуйте в консолі: ['1', '2', '3'].map(unary(parseInt))
`,
      solution: `function ary(fn, n) {
  return (...args) => fn(...args.slice(0, n));
}

function unary(fn) {
  return ary(fn, 1);
}
`,
      hints: [
        'Поверніть нову функцію з rest-параметром `...args`.',
        'Передайте в `fn` лише `args.slice(0, n)` через spread: `fn(...args.slice(0, n))`.'
      ],
      tests: [
        { name: 'unary виправляє map(parseInt)', code: 'expect(["1", "2", "3"].map(unary(parseInt))).toEqual([1, 2, 3]);\nexpect(["10", "10", "10"].map(unary(parseInt))).toEqual([10, 10, 10]);' },
        { name: 'ary обрізає аргументи', code: 'const collect = (...args) => args;\nexpect(ary(collect, 2)(1, 2, 3, 4)).toEqual([1, 2]);\nexpect(ary(collect, 0)(1, 2)).toEqual([]);' },
        { name: 'аргументів менше за n — не доповнює', code: 'const collect = (...args) => args;\nexpect(ary(collect, 5)(1, 2)).toEqual([1, 2]);' },
        { name: 'повертає результат fn', code: 'const add = (a, b = 100) => a + b;\nexpect(unary(add)(1, 2)).toBe(101);' },
        { name: 'fn не викликається при створенні обгортки', code: 'const f = mockFn();\nunary(f);\nary(f, 2);\nexpect(f).not.toHaveBeenCalled();' }
      ],
      explanation: `
Rest + \`slice\` + spread. O(n) на виклик.

**На практиці** частіше пишуть явно: \`arr.map((s) => parseInt(s, 10))\` — читабельніше. \`unary\`/\`ary\` є в lodash.

**Типова помилка:** \`args.length = n\` — мутує масив і **подовжує** його, якщо аргументів менше.

**Що спитають далі:** чому \`['1','2','3'].map(Number)\` працює коректно? (Бо \`Number\` використовує лише перший аргумент.)
`
    },
    // ================================================================ closures
    {
      id: 'fn-closure-independent',
      group: 'closures',
      type: 'quiz',
      level: 2,
      title: 'Незалежні замикання і деструктуризація методу',
      tags: ['closures'],
      question: `
Що виведе код?

\`\`\`js
function makeCounter() {
  let count = 0;
  return {
    inc: () => ++count,
    get: () => count,
  };
}

const a = makeCounter();
const b = makeCounter();
a.inc();
a.inc();
b.inc();

const { inc } = a;
inc();

console.log(a.get(), b.get());
\`\`\`
`,
      options: ['`3 1`', '`4 4`', '`2 1`', '`TypeError: Cannot read properties of undefined`', '`3 3`'],
      answer: 0,
      why: [
        'Правильно: у `a` і `b` різні `count`; витягнутий `inc` досі замикає `count` об\'єкта `a`.',
        'Кожен виклик `makeCounter()` створює окремий `count` — лічильники не спільні.',
        'Витягнутий `inc` — та сама функція, вона теж збільшує `count` лічильника `a` → 3.',
        '`inc` звертається до `count` через замикання, а не через об\'єкт, тож після деструктуризації працює.',
        '`b.inc()` викликали лише раз, і стан `b` окремий → 1.'
      ],
      hint: 'Скільки змінних count створено? Звідки inc бере count — з об\'єкта чи із замикання?',
      explanation: `
Кожен виклик \`makeCounter()\` — нове оточення зі своєю \`count\`. Методи \`inc\`/\`get\` одного виклику ділять одну \`count\`.

\`const { inc } = a\` — просто посилання на ту саму функцію; вона знаходить \`count\` через замикання, тож працює і окремо від об'єкта.
`
    },
    {
      id: 'fn-closure-live-binding',
      group: 'closures',
      type: 'quiz',
      level: 3,
      interview: true,
      title: 'Замикання бачить змінну, а не значення',
      tags: ['closures', 'let'],
      question: `
Що виведе код?

\`\`\`js
function createLogger() {
  let message = 'initial';
  const log = () => message;
  message = 'updated';
  return log;
}
console.log(createLogger()());

function makeFns() {
  const fns = [];
  let i = 0;
  while (i < 3) {
    fns.push(() => i);
    i++;
  }
  return fns;
}
const fns = makeFns();
console.log(fns[0](), fns[1](), fns[2]());
\`\`\`
`,
      options: [
        '`initial` / `0 1 2`',
        '`updated` / `0 1 2`',
        '`initial` / `3 3 3`',
        '`updated` / `3 3 3`'
      ],
      answer: 3,
      why: [
        'Замикання не копіює значення: `log` читає `message` у момент виклику, а вона вже `updated`.',
        '`let i` оголошено один раз поза циклом — усі три функції бачать одну `i`, яка стала 3.',
        'Обидві частини хибні: замикання бачить актуальні значення змінних.',
        'Правильно: `log` бачить оновлену `message`, а всі стрілки замикають одну спільну `i`.'
      ],
      hint: 'Замикання зберігає посилання на змінну. Скільки змінних i існує в makeFns — одна чи по одній на ітерацію?',
      explanation: `
1. \`log\` замикає **змінну** \`message\`; при виклику вона вже \`'updated'\`.
2. \`let i\` створено **один раз** поза циклом. Нова змінна на кожну ітерацію буває лише для \`let\` у **заголовку \`for\`**. Тут усі стрілки бачать одну \`i\` = 3.

Виправлення: \`for (let i = 0; i < 3; i++)\` або \`const current = i;\` усередині тіла циклу.
`
    },
    {
      id: 'fn-closures-deep',
      group: 'closures',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Замикання в деталях: як працюють і де стріляють',
      tags: ['closures', 'lexical-environment'],
      question: 'Поясніть замикання «під капотом»: що саме запам\'ятовує функція, чи копіюються значення, і які типові проблеми виникають на практиці (зокрема в React)? Оберіть **усі** правильні твердження.',
      choices: [
        'Замикання копіює значення зовнішніх змінних у момент створення функції',
        'Функція тримає посилання на оточення створення, тож бачить актуальні значення змінних',
        'Два виклики `makeCounter()` ділять один `count`, бо код функції той самий',
        'Замикання утворюють лише функції, які повернули з іншої функції через `return`',
        'Stale closure у React: ефект із `[]` бачить змінні першого рендеру, бо замкнув їх'
      ],
      correct: [1, 4],
      why: [
        'Хибно: замикаються змінні (прив\'язки), а не їхні значення.',
        'Правильно: функція зберігає посилання на лексичне оточення (`[[Environment]]`).',
        'Хибно: кожен виклик створює нове оточення з власним `count`.',
        'Хибно: замикання — будь-яка функція, що використовує зовнішні змінні (колбек, обробник події).',
        'Правильно: кожен рендер — новий виклик з новими змінними, а ефект «застряг» на першому.'
      ],
      hint: '[[Environment]], живі прив\'язки, нове оточення на кожен виклик, stale closure.',
      answer: `
**Механізм.** Створюючи функцію, рушій записує в неї посилання на поточне лексичне оточення (\`[[Environment]]\`). Тому функція бачить змінні місця, де її **створено**, навіть після завершення зовнішньої функції.

1. Замикаються **змінні**, а не значення — зміни видно.
2. Кожен виклик зовнішньої функції — **нове** оточення.
3. Функції, створені в одному виклику, **ділять** оточення.

**Застосування:** приватний стан, фабрики, \`once\`/\`memoize\`/\`debounce\`, обробники з даними.

**Проблеми:**
- \`var\` у циклі — усі колбеки ділять одну змінну;
- **stale closure** у React:
\`\`\`js
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000); // count завжди 0
  return () => clearInterval(id);
}, []);
// виправлення: setCount((c) => c + 1)
\`\`\`
- утримання пам'яті: поки живе замикання (обробник, таймер), живе і його оточення.
`,
      keyPoints: [
        'Функція зберігає посилання на оточення створення',
        'Замикаються живі змінні, а не копії значень',
        'Кожен виклик зовнішньої функції — нове оточення',
        'Проблеми: var у циклі, stale closure, утримання пам\'яті'
      ],
      followUps: ['Як виправити stale closure у setInterval всередині useEffect?', 'Чи всі змінні зовнішньої функції залишаються в пам\'яті?']
    },
    {
      id: 'fn-make-counter',
      group: 'closures',
      type: 'code',
      level: 2,
      interview: true,
      title: 'Лічильник-функція з методами',
      tags: ['closures', 'functions-as-objects'],
      description: `
**Завдання.** Реалізуйте \`makeCounter(step = 1)\`, що повертає **функцію-лічильник** з додатковими методами. Стан — приватний.

**Де трапляється:** класика співбесід на замикання. Функції з методами трапляються щодня: \`debounced.cancel()\`, \`jest.fn().mock\`, \`memoized.cache\`.

**Що написати**
- \`counter()\` → число: збільшує значення на \`step\` (старт з 0) і повертає нове
- \`counter.current()\` → поточне значення без зміни
- \`counter.reset()\` → скидає до 0
- \`counter.set(value)\` → встановлює значення

**Приклад**
\`\`\`js
const counter = makeCounter();
counter();          // 1
counter();          // 2
counter.current();  // 2
counter.set(10);
counter();          // 11
counter.reset();
counter.current();  // 0

makeCounter(5)();   // 5
\`\`\`

**Як це працює:** \`let value\` живе в оточенні виклику \`makeCounter\`. Функція \`counter\` і стрілки-методи створені в тому самому виклику, тож бачать ту саму \`value\`. Функція — це об'єкт, тому їй можна додати властивості: \`counter.reset = () => {...}\`.

**Врахуйте:**
- \`c.value = 100\` ззовні не повинно зламати лічильник — не зберігайте стан у властивостях;
- методи мають працювати після деструктуризації: \`const { reset } = counter\`;
- лічильники незалежні.
`,
      starter: `function makeCounter(step = 1) {
  // 1. Приватний стан: let value = 0;

  // 2. Основна функція: збільшує value на step і повертає його.
  function counter() {
    // TODO
  }

  // 3. Методи як властивості функції — вони теж замикають value.
  counter.current = () => {
    // TODO
  };
  counter.reset = () => {};
  counter.set = (next) => {};

  return counter;
}

// Спробуйте в консолі: const c = makeCounter(); c(); c(); c.current() // 2
`,
      solution: `function makeCounter(step = 1) {
  let value = 0; // приватний стан у замиканні

  function counter() {
    value += step;
    return value;
  }

  // функція — це об'єкт, тож додаємо їй методи
  counter.current = () => value;
  counter.reset = () => {
    value = 0;
  };
  counter.set = (next) => {
    value = next;
  };

  return counter;
}
`,
      hints: [
        'Зберігайте значення в `let value` всередині `makeCounter`.',
        'Методи — стрілки, що читають/змінюють `value`: `counter.reset = () => { value = 0; };`.',
        'Не зберігайте значення як `counter.value` — тоді його можна зіпсувати ззовні.'
      ],
      tests: [
        { name: 'counter() збільшує і повертає значення', code: 'const c = makeCounter();\nexpect(typeof c).toBe("function");\nexpect(c()).toBe(1);\nexpect(c()).toBe(2);\nexpect(c.current()).toBe(2);' },
        { name: 'кастомний крок', code: 'const c = makeCounter(5);\nexpect(c()).toBe(5);\nexpect(c()).toBe(10);\nconst d = makeCounter(-1);\nexpect(d()).toBe(-1);' },
        { name: 'set і reset', code: 'const c = makeCounter();\nc.set(10);\nexpect(c()).toBe(11);\nc.reset();\nexpect(c.current()).toBe(0);\nexpect(c()).toBe(1);' },
        { name: 'лічильники незалежні', code: 'const a = makeCounter();\nconst b = makeCounter();\na(); a(); a();\nexpect(b()).toBe(1);\nexpect(a.current()).toBe(3);' },
        { name: 'стан приватний', code: 'const c = makeCounter();\nc();\nc.value = 100; c.count = 100;\nexpect(c()).toBe(2);' },
        { name: 'методи працюють після деструктуризації', code: 'const c = makeCounter();\nconst { current, reset } = c;\nc(); c();\nexpect(current()).toBe(2);\nreset();\nexpect(c.current()).toBe(0);' }
      ],
      explanation: `
Усі методи створені в одному виклику \`makeCounter\` і ділять одне оточення з \`value\`. Вони не залежать від об'єкта, через який їх викликали, тому працюють після деструктуризації. Усі операції O(1).

**Альтернатива** \`counter.value\` — простіше, але стан публічний.

**Що спитають далі:** як зробити \`current\` геттером? Як зробити лічильник з кроком, що змінюється (\`counter.setStep\`)?
`
    },
    // ================================================================ decorators
    {
      id: 'fn-once',
      group: 'decorators',
      type: 'code',
      level: 2,
      interview: true,
      title: 'once(fn): виконати лише раз',
      tags: ['closures', 'hof', 'decorators'],
      description: `
**Завдання.** Реалізуйте \`once(fn)\` — обгортку, яка викликає \`fn\` лише при **першому** виклику, а далі повертає збережений результат.

**Де трапляється:** ініціалізація SDK аналітики, захист від подвійної відправки форми (подвійний клік по «Оплатити»), ліниве створення важкого об'єкта. Класика співбесід.

**Що написати**
- \`once(fn)\` → функція \`(...args) => результат\`: перший виклик викликає \`fn(...args)\` і запам'ятовує результат; наступні повертають його, не викликаючи \`fn\`

**Приклад**
\`\`\`js
const initAnalytics = once(() => {
  console.log('init!');
  return { ready: true };
});
initAnalytics(); // логує 'init!', повертає { ready: true }
initAnalytics(); // нічого не логує, повертає той самий об'єкт
\`\`\`

**Як це працює:** обгортка замикає два значення — прапорець «вже викликали» і результат. Вони живуть між викликами, але ззовні недоступні.

**Врахуйте:**
- \`fn\` може повернути \`undefined\` або \`0\` — не перевіряйте «чи є результат», використовуйте окремий прапорець;
- аргументи першого виклику передаються в \`fn\`;
- дві обгортки \`once(f)\` незалежні.
`,
      starter: `function once(fn) {
  // 1. Стан у замиканні: прапорець called і збережений result.

  return (...args) => {
    // 2. TODO: якщо ще не викликали — позначити, викликати fn(...args), зберегти результат
    // 3. Повернути збережений результат
  };
}

// Спробуйте в консолі: const init = once(() => 42); init(); init();
`,
      solution: `function once(fn) {
  let called = false;
  let result;

  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
      fn = null; // звільняємо посилання для GC
    }
    return result;
  };
}
`,
      hints: [
        'Потрібні дві змінні в замиканні: прапорець «вже викликали» і збережений результат.',
        'Не перевіряйте `if (result === undefined)` — функція може легально повернути `undefined`, і тоді її викличуть знову.'
      ],
      tests: [
        { name: 'fn викликається лише один раз', code: 'const f = mockFn(() => 42);\nconst g = once(f);\nexpect(g()).toBe(42);\nexpect(g()).toBe(42);\nexpect(g()).toBe(42);\nexpect(f).toHaveBeenCalledTimes(1);' },
        { name: 'передає аргументи першого виклику', code: 'const f = mockFn((a, b) => a + b);\nconst g = once(f);\nexpect(g(1, 2)).toBe(3);\nexpect(g(10, 20)).toBe(3);\nexpect(f).toHaveBeenCalledWith(1, 2);' },
        { name: 'результат undefined теж кешується', code: 'const f = mockFn(() => undefined);\nconst g = once(f);\ng(); g(); g();\nexpect(f).toHaveBeenCalledTimes(1);' },
        { name: 'falsy-результат кешується', code: 'const f = mockFn(() => 0);\nconst g = once(f);\nexpect(g()).toBe(0);\nexpect(g()).toBe(0);\nexpect(f).toHaveBeenCalledTimes(1);' },
        { name: 'різні обгортки незалежні', code: 'const f = mockFn((x) => x);\nconst g1 = once(f);\nconst g2 = once(f);\nexpect(g1(1)).toBe(1);\nexpect(g2(2)).toBe(2);\nexpect(f).toHaveBeenCalledTimes(2);' }
      ],
      explanation: `
\`called\` і \`result\` живуть у замиканні обгортки. O(1).

**\`fn = null\`** — після першого виклику обгортка більше не тримає \`fn\` у пам'яті.

**Нативний аналог для подій:** \`addEventListener('click', cb, { once: true })\`.

**Типові помилки:** перевірка за значенням результату; \`fn()\` без аргументів.

**Що спитають далі:** що робити, якщо перший виклик кинув помилку — пробувати знову? Як узагальнити до \`before(n, fn)\`?
`
    },
    {
      id: 'fn-with-call-count',
      group: 'decorators',
      type: 'code',
      level: 2,
      title: 'Декоратор, що рахує виклики (як jest.fn)',
      tags: ['hof', 'decorators', 'functions-as-objects'],
      description: `
**Завдання.** Реалізуйте декоратор \`withCallCount(fn)\`: обгортка поводиться як \`fn\`, але рахує свої виклики.

**Де трапляється:** так влаштовані шпигуни в тестах (\`jest.fn()\` має \`.mock.calls\`), лічильники для аналітики/профілювання («скільки разів рендерився компонент»).

**Що написати**
- \`withCallCount(fn)\` → функція \`wrapper(...args)\`: викликає \`fn(...args)\` і повертає результат
- \`wrapper.callCount\` → число викликів (рахуються й виклики, де \`fn\` кинула помилку)
- \`wrapper.resetCount()\` → обнуляє лічильник

**Приклад**
\`\`\`js
const add = withCallCount((a, b) => a + b);
add(1, 2);       // 3
add(3, 4);       // 7
add.callCount;   // 2
add.resetCount();
add.callCount;   // 0
\`\`\`

**Як це працює:** обгортка — іменована функція, тож усередині себе вона може звертатися до власної властивості \`wrapper.callCount\`. На відміну від \`once\`, тут стан **публічний** — його читають ззовні.

**Врахуйте:**
- збільшуйте лічильник **до** виклику \`fn\` — помилка з \`fn\` має «пролетіти» далі, але виклик зарахуватись;
- обгортки однієї \`fn\` незалежні.
`,
      starter: `function withCallCount(fn) {
  function wrapper(...args) {
    // 1. TODO: збільшити wrapper.callCount (до виклику fn!)
    // 2. TODO: викликати fn з тими самими аргументами і повернути результат
  }

  // 3. Початковий стан і метод скидання.
  wrapper.callCount = 0;
  wrapper.resetCount = () => {
    // TODO
  };

  return wrapper;
}

// Спробуйте в консолі: const f = withCallCount(Math.max); f(1, 2); f.callCount
`,
      solution: `function withCallCount(fn) {
  function wrapper(...args) {
    wrapper.callCount++; // до виклику — врахуємо і виклик з помилкою
    return fn(...args);
  }

  wrapper.callCount = 0;
  wrapper.resetCount = () => {
    wrapper.callCount = 0;
  };

  return wrapper;
}
`,
      hints: [
        'Усередині `wrapper` пишіть `wrapper.callCount++` — функція бачить саму себе за іменем.',
        'Лічильник збільшуйте першим рядком, потім `return fn(...args)`.'
      ],
      tests: [
        { name: 'рахує виклики і повертає результат', code: 'const add = withCallCount((a, b) => a + b);\nexpect(add.callCount).toBe(0);\nexpect(add(1, 2)).toBe(3);\nexpect(add(3, 4)).toBe(7);\nexpect(add.callCount).toBe(2);' },
        { name: 'resetCount обнуляє', code: 'const f = withCallCount(() => {});\nf(); f(); f();\nf.resetCount();\nexpect(f.callCount).toBe(0);\nf();\nexpect(f.callCount).toBe(1);' },
        { name: 'передає всі аргументи', code: 'const spy = mockFn();\nconst f = withCallCount(spy);\nf(1, "a", null);\nexpect(spy).toHaveBeenCalledWith(1, "a", null);' },
        { name: 'помилка пролітає, але виклик рахується', code: 'const f = withCallCount(() => { throw new Error("boom"); });\nexpect(() => f()).toThrow("boom");\nexpect(f.callCount).toBe(1);' },
        { name: 'обгортки незалежні', code: 'const base = (x) => x;\nconst a = withCallCount(base);\nconst b = withCallCount(base);\na(1); a(2);\nexpect(a.callCount).toBe(2);\nexpect(b.callCount).toBe(0);' }
      ],
      explanation: `
Декоратор додає поведінку, не змінюючи код \`fn\`. Стан — властивість самої обгортки. O(1).

**Чому до виклику:** \`callCount++\` після \`fn(...)\` не виконається при помилці. Альтернатива — \`try { return fn(...args); } finally { wrapper.callCount++; }\`.

**Що спитають далі:** як зберігати ще й аргументи кожного виклику (\`wrapper.calls.push(args)\`)?
`
    },
    {
      id: 'fn-memoize',
      group: 'decorators',
      type: 'code',
      level: 3,
      interview: true,
      title: 'memoize: кеш для функції одного аргументу',
      tags: ['closures', 'memoization'],
      description: `
**Завдання.** Реалізуйте \`memoize(fn)\` для функцій **одного аргументу-рядка або числа**: кожне значення обчислюється один раз, далі береться з кешу.

**Де трапляється:** дорогі обчислення за ключем — форматування/переклад за кодом, розрахунок за id у селекторах. Класика співбесід (далі питають про кеш для кількох аргументів і LRU).

**Що написати**
- \`memoize(fn)\` → функція \`memoized(arg)\`: повертає \`fn(arg)\`, але викликає \`fn\` лише раз для кожного \`arg\`
- \`memoized.cache\` → об'єкт-кеш \`{ [arg]: результат }\` (видно ззовні, можна видалити ключ)

**Приклад**
\`\`\`js
const slowSquare = (n) => { /* довго */ return n * n; };
const fastSquare = memoize(slowSquare);
fastSquare(9); // 81 — обчислює
fastSquare(9); // 81 — з кешу
fastSquare.cache; // { 9: 81 }
\`\`\`

**Як це працює:** кеш — об'єкт у замиканні. Перевіряти треба **наявність ключа**, а не значення: \`Object.hasOwn(cache, key)\` → \`true\`, лише якщо ключ записано саме в цей об'єкт. \`cache[key]\` тут не підходить: результат може бути \`0\`/\`undefined\`, а \`cache['toString']\` повертає вбудовану функцію навіть у порожньому об'єкті.

**Врахуйте:**
- кешуються й falsy-результати (\`0\`, \`''\`, \`undefined\`);
- аргументи \`'toString'\`, \`'constructor'\` — звичайні ключі;
- ключі об'єкта — рядки, тож \`1\` і \`'1'\` злипнуться (для довільних ключів у темі ES6+ буде \`Map\`).
`,
      starter: `function memoize(fn) {
  // 1. Кеш у замиканні.
  const cache = {};

  function memoized(arg) {
    // 2. TODO: якщо Object.hasOwn(cache, arg) — повернути cache[arg]
    // 3. TODO: інакше обчислити fn(arg), записати в кеш і повернути
  }

  // 4. Відкрийте кеш назовні.
  memoized.cache = cache;
  return memoized;
}

// Спробуйте в консолі: const sq = memoize((n) => n * n); sq(9); sq.cache
`,
      solution: `function memoize(fn) {
  const cache = {};

  function memoized(arg) {
    // hasOwn, а не cache[arg]: кешуються falsy-результати,
    // а 'toString' / 'constructor' не плутаються з вбудованими властивостями
    if (Object.hasOwn(cache, arg)) return cache[arg];
    const result = fn(arg);
    cache[arg] = result;
    return result;
  }

  memoized.cache = cache;
  return memoized;
}
`,
      hints: [
        'Кеш — об\'єкт у замиканні; `memoized.cache = cache` робить його видимим ззовні.',
        'Перевіряйте наявність ключа через `Object.hasOwn(cache, arg)`, а не `if (cache[arg])` — інакше `0`, `undefined` перераховуються, а `\'toString\'` «знаходиться» в порожньому кеші.'
      ],
      tests: [
        { name: 'обчислює один раз для кожного аргументу', code: 'const f = mockFn((n) => n * n);\nconst m = memoize(f);\nexpect(m(3)).toBe(9);\nexpect(m(3)).toBe(9);\nexpect(m(4)).toBe(16);\nexpect(f).toHaveBeenCalledTimes(2);' },
        { name: 'кешує falsy та undefined результати', code: 'const f = mockFn(() => undefined);\nconst m = memoize(f);\nm("x"); m("x");\nconst g = mockFn(() => 0);\nconst mg = memoize(g);\nexpect(mg(1)).toBe(0);\nexpect(mg(1)).toBe(0);\nexpect(f).toHaveBeenCalledTimes(1);\nexpect(g).toHaveBeenCalledTimes(1);' },
        { name: '"toString" і "constructor" — звичайні ключі', code: 'const f = mockFn((s) => s.length);\nconst m = memoize(f);\nexpect(m("toString")).toBe(8);\nexpect(m("constructor")).toBe(11);\nexpect(f).toHaveBeenCalledTimes(2);' },
        { name: 'кеш доступний через .cache', code: 'const f = mockFn((x) => x + 1);\nconst m = memoize(f);\nm(1);\nexpect(m.cache).toEqual({ 1: 2 });\ndelete m.cache[1];\nm(1);\nexpect(f).toHaveBeenCalledTimes(2);' },
        { name: 'кеші різних memoize незалежні', code: 'const a = memoize((x) => x * 2);\nconst b = memoize((x) => x * 3);\nexpect(a(2)).toBe(4);\nexpect(b(2)).toBe(6);' }
      ],
      explanation: `
O(1) на виклик з кешу; пам'ять — O(k) для k унікальних аргументів.

**Підводні камені:**
- мемоїзувати можна лише **чисті** функції;
- кеш росте необмежено — у довгоживучих застосунках потрібне витіснення (LRU, TTL);
- кілька аргументів → потрібен ключ: \`JSON.stringify(args)\` або резолвер ключа (\`_.memoize(fn, resolver)\`).

**Типові помилки:** \`if (cache[arg])\` — губить falsy і ламається на \`'toString'\`.

**Що спитають далі:** як обмежити розмір кешу? Як мемоїзувати функцію з аргументом-об'єктом (у темі ES6+ — \`Map\`/\`WeakMap\`)?
`
    },
    {
      id: 'fn-infinite-sum',
      group: 'decorators',
      type: 'code',
      level: 3,
      interview: true,
      title: 'sum(1)(2)(3)() — нескінченний ланцюжок',
      tags: ['closures', 'recursion', 'hof'],
      description: `
**Завдання.** Реалізуйте \`sum\`, яку можна викликати ланцюжком довільної довжини. Виклик **без аргументу** повертає накопичену суму.

**Де трапляється:** класика співбесід на замикання і повернення функцій (варіація каррінгу).

**Що написати**
- \`sum(a)\` → функція, якщо \`a\` передано; \`0\`, якщо ні
- кожна наступна ланка \`(b)\` → нова функція, або сума, якщо \`b\` не передано

**Приклад**
\`\`\`js
sum(1)(2)(3)();   // 6
sum(5)();         // 5
sum();            // 0

const s = sum(1);
s(2)();           // 3
s(10)();          // 11 — а не 13!
\`\`\`

**Як це працює:** кожна ланка — нова функція, що замикає **власну** проміжну суму. Ми не змінюємо спільну змінну, а створюємо нове замикання з \`total + b\` — тому гілки \`s(2)\` і \`s(10)\` не заважають одна одній.

**Врахуйте:**
- \`sum(1)(0)\` — це ще функція (перевіряйте \`=== undefined\`, а не \`!b\`);
- від'ємні числа.
`,
      starter: `function sum(a) {
  // 1. Немає аргументу → 0.

  // 2. Допоміжна фабрика: add(total) повертає функцію (b) => ...
  //    TODO: якщо b === undefined → повернути total, інакше → add(total + b)

  // 3. Поверніть add(a).
}

// Спробуйте в консолі: sum(1)(2)(3)()
`,
      solution: `function sum(a) {
  if (a === undefined) return 0;

  // кожна ланка замикає власний незмінний total
  const add = (total) => (b) => (b === undefined ? total : add(total + b));

  return add(a);
}
`,
      hints: [
        'Виклик з аргументом повертає **функцію**, без аргументу — число.',
        'Допоміжна `add(total)` повертає `(b) => ...`: якщо `b === undefined` — `total`, інакше — `add(total + b)`.',
        'Не зберігайте суму в одній `let total`, яку мутує кожна ланка, — тоді гілки `s(2)` і `s(10)` зіпсують одна одну.'
      ],
      tests: [
        { name: 'базовий ланцюжок', code: 'expect(sum(1)(2)(3)()).toBe(6);\nexpect(sum(1)(2)(3)(4)(5)()).toBe(15);' },
        { name: 'один аргумент і жодного', code: 'expect(sum(5)()).toBe(5);\nexpect(sum()).toBe(0);' },
        { name: 'нулі та від\'ємні числа', code: 'expect(sum(0)(0)()).toBe(0);\nexpect(sum(-1)(1)(-5)()).toBe(-5);\nexpect(sum(0)()).toBe(0);' },
        { name: 'проміжні функції незалежні', code: 'const s = sum(1);\nexpect(s(2)()).toBe(3);\nexpect(s(10)()).toBe(11);\nconst t = s(2);\nexpect(t(3)()).toBe(6);\nexpect(t(4)()).toBe(7);\nexpect(s()).toBe(1);' },
        { name: 'проміжні результати — функції', code: 'expect(typeof sum(1)).toBe("function");\nexpect(typeof sum(1)(2)).toBe("function");' }
      ],
      explanation: `
Кожна ланка — нове замикання з власним \`total\`, стан не мутується. O(1) на виклик.

**Варіант без завершального \`()\`:** \`next.valueOf = () => total\` → \`+sum(1)(2)(3)\` дає 6, але \`sum(1)(2) === 3\` — \`false\`.

**Типові помилки:** спільна \`let total\` з мутацією; \`if (!b)\` замість \`=== undefined\`.

**Що спитають далі:** як підтримати кілька аргументів за виклик (\`sum(1, 2)(3)()\`)? Чим це відрізняється від \`curry(fn)\`?
`
    },
    {
      id: 'fn-batch-calls',
      group: 'decorators',
      type: 'code',
      level: 3,
      title: 'Відправка аналітики пачками (batching)',
      tags: ['closures', 'timers', 'hof'],
      description: `
**Завдання.** Реалізуйте \`batchCalls(fn, ms, maxSize = Infinity)\` — обгортку, що збирає виклики в буфер і передає їх у \`fn\` однією пачкою.

**Де трапляється:** відправка подій аналітики/логів: замість запиту на кожен клік — один запит раз на \`ms\` мс зі списком подій.

**Що написати**
- \`wrapped(...args)\` → нічого не повертає; додає масив \`args\` у буфер
- коли спрацює таймер → \`fn(batch)\`, де \`batch = [[...args1], [...args2], ...]\`, буфер очищується
- \`wrapped.flush()\` → негайно викликати \`fn\` з буфером (якщо він не порожній) і скасувати таймер
- \`wrapped.pending()\` → кількість викликів у буфері

**Приклад**
\`\`\`js
const track = batchCalls((batch) => sendToServer(batch), 100);
track('click', 'buy');
track('scroll');
// через 100 мс: sendToServer([['click', 'buy'], ['scroll']])
\`\`\`

**Як це працює:** буфер і id таймера живуть у замиканні між викликами. **Перший** виклик у порожній буфер запускає \`setTimeout(flush, ms)\`; наступні таймер **не** переносять (на відміну від debounce), тож затримка — не більше \`ms\` від першої події.

**Врахуйте:**
- буфер досяг \`maxSize\` → \`fn\` викликається одразу, таймер скасовується;
- після відправки буфер — **новий** масив (\`fn\` міг зберегти старий);
- після спрацювання таймера наступний виклик відкриває нове вікно.
`,
      starter: `function batchCalls(fn, ms, maxSize = Infinity) {
  // 1. Стан у замиканні: буфер і id таймера.
  let buffer = [];
  let timer = null;

  function flush() {
    // 2. TODO: clearTimeout, timer = null;
    //    якщо буфер не порожній — підмінити буфер на новий масив і викликати fn(старий)
  }

  function wrapped(...args) {
    // 3. TODO: buffer.push(args);
    //    якщо досягли maxSize — flush(), інакше запустити таймер, якщо його ще немає
  }

  wrapped.flush = flush;
  wrapped.pending = () => 0; // TODO
  return wrapped;
}

// Спробуйте в консолі:
// const t = batchCalls(console.log, 100); t('a'); t('b');
`,
      solution: `function batchCalls(fn, ms, maxSize = Infinity) {
  let buffer = [];
  let timer = null;

  function flush() {
    clearTimeout(timer);
    timer = null;
    if (buffer.length === 0) return;
    const batch = buffer;
    buffer = []; // новий масив: fn може зберегти batch у себе
    fn(batch);
  }

  function wrapped(...args) {
    buffer.push(args);
    if (buffer.length >= maxSize) {
      flush();
    } else if (timer === null) {
      // вікно відкривається першим викликом і не переноситься
      timer = setTimeout(flush, ms);
    }
  }

  wrapped.flush = flush;
  wrapped.pending = () => buffer.length;
  return wrapped;
}
`,
      hints: [
        'Таймер ставиться лише якщо його ще немає (`timer === null`).',
        '`flush()`: скасувати таймер, `timer = null`, якщо буфер не порожній — `const batch = buffer; buffer = []; fn(batch);`.',
        'У `wrapped` після `push` перевірте `maxSize`: досягнуто — `flush()`, інакше — запуск таймера за потреби.'
      ],
      tests: [
        { name: 'групує виклики у вікні', code: 'useFakeTimers();\nconst f = mockFn();\nconst b = batchCalls(f, 100);\nb(1);\nb(2, 3);\nexpect(f).not.toHaveBeenCalled();\nadvanceTimersByTime(100);\nexpect(f).toHaveBeenCalledTimes(1);\nexpect(f).toHaveBeenCalledWith([[1], [2, 3]]);' },
        { name: 'вікно не переноситься наступними викликами', code: 'useFakeTimers();\nconst f = mockFn();\nconst b = batchCalls(f, 100);\nb("a");\nadvanceTimersByTime(60);\nb("b");\nadvanceTimersByTime(40);\nexpect(f).toHaveBeenCalledWith([["a"], ["b"]]);' },
        { name: 'нове вікно після спрацювання, без зайвих викликів', code: 'useFakeTimers();\nconst f = mockFn();\nconst b = batchCalls(f, 100);\nb(1);\nadvanceTimersByTime(100);\nb(2);\nadvanceTimersByTime(100);\nadvanceTimersByTime(1000);\nexpect(f).toHaveBeenCalledTimes(2);\nexpect(f).toHaveBeenLastCalledWith([[2]]);' },
        { name: 'maxSize викликає fn одразу', code: 'useFakeTimers();\nconst f = mockFn();\nconst b = batchCalls(f, 100, 2);\nb("a");\nb("b");\nexpect(f).toHaveBeenCalledWith([["a"], ["b"]]);\nexpect(getTimerCount()).toBe(0);\nb("c");\nadvanceTimersByTime(100);\nexpect(f).toHaveBeenCalledTimes(2);\nexpect(f).toHaveBeenLastCalledWith([["c"]]);' },
        { name: 'flush() і pending()', code: 'useFakeTimers();\nconst f = mockFn();\nconst b = batchCalls(f, 100);\nb(1); b(2);\nexpect(b.pending()).toBe(2);\nb.flush();\nexpect(f).toHaveBeenCalledWith([[1], [2]]);\nexpect(b.pending()).toBe(0);\nadvanceTimersByTime(200);\nexpect(f).toHaveBeenCalledTimes(1);' },
        { name: 'flush порожнього буфера не викликає fn', code: 'useFakeTimers();\nconst f = mockFn();\nconst b = batchCalls(f, 100);\nb.flush();\nexpect(f).not.toHaveBeenCalled();' },
        { name: 'fn отримує незалежний масив', code: 'useFakeTimers();\nconst batches = [];\nconst b = batchCalls((batch) => batches.push(batch), 50);\nb(1);\nadvanceTimersByTime(50);\nb(2);\nadvanceTimersByTime(50);\nexpect(batches).toEqual([[[1]], [[2]]]);' }
      ],
      explanation: `
O(1) на виклик. Відмінність від debounce: таймер не скидається новими викликами.

**На що дивиться інтерв'юер:**
- \`buffer = []\`, а не \`buffer.length = 0\` — інакше очистимо масив, який отримав \`fn\`;
- \`timer = null\` після спрацювання — інакше нове вікно не відкриється;
- \`clearTimeout\` у \`flush\` — інакше «осиротілий» таймер відправить наступну пачку раніше.

**Що спитають далі:** як гарантувати відправку при закритті вкладки (\`pagehide\` + \`navigator.sendBeacon\`)?
`
    },
    // ================================================================ iife
    {
      id: 'fn-iife',
      group: 'iife',
      type: 'theory',
      level: 2,
      title: 'IIFE: що це і навіщо',
      tags: ['iife', 'module-pattern'],
      question: 'Що таке IIFE? Які проблеми вона вирішувала і чи потрібна вона в сучасному коді?',
      choices: [
        'IIFE — вираз, викликаний одразу; дужки перетворюють declaration на expression',
        'IIFE обов\'язкова в ES-модулях, інакше змінні модуля потрапляють у `window`',
        '`function () {}()` без дужок — валідна IIFE, дужки лише для читабельності',
        'Рушій кешує результат IIFE, тож повторне звернення до неї не виконує тіло знову'
      ],
      correct: 0,
      why: [
        'Правильно: рядок, що починається з `function`, — це declaration; дужки роблять його виразом, який можна одразу викликати.',
        'Хибно: ES-модуль і так має власну область видимості файлу.',
        'Хибно: без дужок це declaration без імені → SyntaxError.',
        'Хибно: IIFE виконується рівно один раз, у момент створення; «звернутися до неї» вдруге неможливо.'
      ],
      hint: 'Чому функцію треба обгорнути в дужки? Що замінило IIFE в ES6+?',
      answer: `
**IIFE (Immediately Invoked Function Expression)** — функціональний вираз, викликаний одразу:
\`\`\`js
const counter = (function () {
  let count = 0;                               // приватне
  return { inc: () => ++count, get: () => count };
})();
\`\`\`

**Чому дужки:** \`function\` на початку рядка — declaration, його не можна одразу викликати. Дужки (або \`!\`, \`void\`) роблять вираз.

**Що вирішувала до ES6:** ізоляція змінних від глобальної області, module pattern (приватний стан + публічний API), фіксація значення в циклах з \`var\`.

**Сьогодні:** ES-модулі та \`let\`/\`const\` у блоці \`{}\` роблять те саме. IIFE лишилась у збірках бібліотек для \`<script>\` і для обчислення значення «на місці».

**Пастка ASI:** без \`;\` у попередньому рядку \`(function(){})()\` стане викликом попереднього виразу.
`,
      keyPoints: [
        'Функціональний вираз, викликаний одразу після створення',
        'Дужки перетворюють declaration на expression',
        'Ізоляція області видимості і module pattern',
        'Замінена ES-модулями та блоковими змінними'
      ],
      followUps: ['Чому function(){}() — синтаксична помилка?', 'Як ASI ламає IIFE?']
    },
    {
      id: 'fn-iife-hoisting',
      group: 'iife',
      type: 'quiz',
      level: 2,
      title: 'IIFE та підняття змінних',
      tags: ['iife', 'hoisting'],
      question: `
Що виведе код?

\`\`\`js
var x = 1;

(function () {
  console.log(x);
  var x = 2;
  console.log(x);
})();

console.log(x);
\`\`\`
`,
      options: ['`1 2 2`', '`1 2 1`', '`undefined 2 1`', '`undefined 2 2`', '`ReferenceError`'],
      answer: 2,
      why: [
        'Локальна `var x` затінює глобальну ще до першого `console.log`, а глобальна `x` не змінюється.',
        'До рядка `var x = 2` всередині функції вже видно локальну `x` (піднята, `undefined`), а не глобальну.',
        'Правильно: локальна `x` піднята як `undefined`, потім стає 2; глобальна лишилась 1.',
        'IIFE змінює лише свою локальну `x`, глобальна лишається 1.',
        'ReferenceError був би з `let x` (TDZ), а `var` піднімається зі значенням `undefined`.'
      ],
      hint: 'У IIFE є власна область видимості. Що відбувається з var x усередині неї на фазі створення?',
      explanation: `
IIFE — звичайна функція з власним оточенням. На фазі створення в ньому реєструється **локальна** \`var x = undefined\`, яка затінює глобальну: перший лог — \`undefined\`, другий — \`2\`, глобальна \`x\` — \`1\`.
`
    },
    {
      id: 'fn-iife-asi',
      group: 'iife',
      type: 'quiz',
      level: 3,
      title: 'IIFE без крапки з комою',
      tags: ['iife', 'asi', 'trick'],
      question: `
Що станеться при виконанні коду?

\`\`\`js
const greeting = 'hi'
(function () {
  console.log('IIFE')
})()
\`\`\`
`,
      options: [
        'Виведе `IIFE`',
        'Виведе `hi`, потім `IIFE`',
        '`TypeError: "hi" is not a function`',
        '`SyntaxError: Unexpected token \'(\'`'
      ],
      answer: 2,
      why: [
        'Крапка з комою не вставляється, тож IIFE так і не виконується.',
        '`hi` ніхто не логує, а IIFE не запускається — рядок намагаються викликати як функцію.',
        'Правильно: парсер читає `\'hi\'(function () {...})()` — виклик рядка → TypeError.',
        'Синтаксично код валідний: `\'hi\'(...)` — це виклик, помилка виникає лише під час виконання.'
      ],
      hint: 'Чи вставить парсер крапку з комою після \'hi\', якщо наступний рядок починається з дужки?',
      explanation: `
ASI вставляє \`;\` лише тоді, коли наступний токен **не може** продовжити вираз. \`(\` може — це виклик. Парсер бачить \`const greeting = 'hi'(function () {...})()\` → **TypeError: "hi" is not a function**.

Те саме з рядками, що починаються з \`[\` або шаблонного рядка.У стилі «без крапок з комою» такі рядки починають з \`;\`.
`
    },
    // ================================================================ recursion
    {
      id: 'fn-recursion',
      group: 'recursion',
      type: 'theory',
      level: 3,
      title: 'Рекурсія, стек викликів і хвостові виклики',
      tags: ['recursion', 'call-stack', 'tco'],
      question: 'Як працює рекурсія з точки зору стеку викликів? Що таке переповнення стека, хвостова рекурсія і чи оптимізує її JavaScript?',
      choices: [
        'V8 автоматично оптимізує хвостову рекурсію, тож із акумулятором стек ніколи не переповнюється',
        'Глибина стека не обмежена: рекурсія падає лише тоді, коли закінчується вся пам\'ять',
        'TCO є в специфікації ES2015, але реалізований лише в Safari, тому на нього не покладаються',
        'Ітерація з явним масивом-стеком так само переповнює стек викликів на глибоких даних'
      ],
      correct: 2,
      why: [
        'Хибно: V8 (Chrome, Node) не реалізує TCO — хвостова рекурсія теж переповнить стек.',
        'Хибно: стек викликів обмежений (~10 000 кадрів у V8) — далі RangeError.',
        'Правильно: формально TCO є, але реально працює лише в Safari.',
        'Хибно: масив-стек живе в купі, а не в стеку викликів, тому глибина обмежена лише пам\'яттю.'
      ],
      hint: 'Кадр стеку на кожен виклик; ES2015 TCO і реальна підтримка рушіями; явний стек.',
      answer: `
**Рекурсія** = базовий випадок + рекурсивний крок:
\`\`\`js
function factorial(n) {
  if (n <= 1) return 1;          // базовий випадок
  return n * factorial(n - 1);   // крок
}
\`\`\`

**Стек викликів:** кожен виклик — кадр зі змінними; \`factorial(5)\` тримає 5 кадрів одночасно. Ліміт у V8 ~10 000 кадрів → \`RangeError: Maximum call stack size exceeded\`.

**Хвостовий виклик** — рекурсивний виклик як остання дія: \`return factorial(n - 1, n * acc)\`. TCO міг би перевикористати кадр, але працює лише в Safari.

**Глибокі дані:** ітерація з явним стеком (масив у купі) або trampoline.

**Де рекурсія доречна:** дерева (DOM, JSON, меню, коментарі), «розділяй і володарюй», backtracking — коли глибина невелика.
`,
      keyPoints: [
        'Базовий випадок + рекурсивний крок',
        'Кожен виклик — кадр у стеку; переповнення → RangeError',
        'TCO є в специфікації, але працює лише в Safari',
        'Глибокі структури — ітерація з явним стеком'
      ],
      followUps: ['Як переписати рекурсивний обхід дерева ітеративно?', 'Чому наївна рекурсія Фібоначчі повільна і як це виправити?']
    },
    {
      id: 'fn-sum-nested',
      group: 'recursion',
      type: 'code',
      level: 2,
      title: 'Рекурсивна сума вкладених масивів',
      tags: ['recursion', 'arrays'],
      description: `
**Завдання.** Напишіть **рекурсивну** \`sumNested(arr)\` — суму всіх чисел у масиві довільної вкладеності.

**Де трапляється:** класика співбесід на рекурсію. Той самий прийом — обхід дерева: меню з підменю, коментарі з відповідями, вкладені категорії товарів.

**Що написати**
- \`sumNested(arr)\` → число. Елементи — числа або масиви (теж з числами чи масивами).

**Приклад**
\`\`\`js
sumNested([1, 2, 3]);              // 6
sumNested([1, [2, [3, [4]]], 5]);  // 15
sumNested([[], [[]]]);             // 0
\`\`\`

**Як це працює:** «сума масиву = сума його чисел + сума кожного вкладеного масиву». Для вкладеного масиву функція викликає саму себе — це та сама задача меншого розміру. Порожній масив дає 0 — це базовий випадок.

**Врахуйте:**
- перевірка масиву — \`Array.isArray(item)\`, а не \`typeof\` (\`typeof [] === 'object'\`);
- не використовуйте глобальну змінну-акумулятор — повторний виклик дасть неправильну суму.
`,
      starter: `function sumNested(arr) {
  let total = 0;
  for (const item of arr) {
    // TODO: якщо item — масив, додати sumNested(item), інакше — сам item
  }
  return total;
}

// Спробуйте в консолі: sumNested([1, [2, [3]]]) // 6
`,
      solution: `function sumNested(arr) {
  let total = 0;
  for (const item of arr) {
    // рекурсивний крок для масиву, базовий випадок — число
    total += Array.isArray(item) ? sumNested(item) : item;
  }
  return total;
}
`,
      hints: [
        'Для елемента-масиву потрібна та сама задача меншого розміру — викличте `sumNested(item)`.',
        '`total += Array.isArray(item) ? sumNested(item) : item;`'
      ],
      tests: [
        { name: 'плоский масив', code: 'expect(sumNested([1, 2, 3])).toBe(6);\nexpect(sumNested([])).toBe(0);' },
        { name: 'вкладені масиви', code: 'expect(sumNested([1, [2, [3, [4]]], 5])).toBe(15);\nexpect(sumNested([[1, 2], [3, [4, [5, [6]]]]])).toBe(21);' },
        { name: 'порожні вкладені масиви', code: 'expect(sumNested([[], [[]], [[[]]]])).toBe(0);' },
        { name: 'від\'ємні та дробові', code: 'expect(sumNested([-1, [2.5, [-0.5]]])).toBe(1);' },
        { name: 'повторний виклик дає той самий результат', code: 'expect(sumNested([1, [2]])).toBe(3);\nexpect(sumNested([1, [2]])).toBe(3);' },
        { name: 'глибина 1000', code: 'let a = [1];\nfor (let i = 0; i < 1000; i++) a = [a, 1];\nexpect(sumNested(a)).toBe(1001);' }
      ],
      explanation: `
O(n) за кількістю елементів; пам'ять — O(d) кадрів стеку, де d — глибина.

**Типові помилки:** \`typeof item === 'object'\` замість \`Array.isArray\`; забути додати результат рекурсивного виклику; глобальний акумулятор.

**Що спитають далі:** що буде при вкладеності 100 000 (RangeError — наступна задача)? Як реалізувати \`flat(depth)\` рекурсивно?
`
    },
    {
      id: 'fn-sum-deep-iterative',
      group: 'recursion',
      type: 'code',
      level: 3,
      title: 'Глибока вкладеність без переповнення стека',
      tags: ['recursion', 'call-stack', 'iteration'],
      description: `
**Завдання.** Реалізуйте \`sumDeep(arr)\` — суму всіх чисел у масиві довільної вкладеності **без рекурсії**, щоб працювало навіть для 100 000 рівнів.

**Де трапляється:** рекурсивна версія падає з \`RangeError: Maximum call stack size exceeded\` на глибоких даних (довгий ланцюжок відповідей у коментарях, згенерований JSON). На співбесіді це типове продовження задачі про рекурсію.

**Що написати**
- \`sumDeep(arr)\` → число; без рекурсивних викликів

**Приклад**
\`\`\`js
sumDeep([1, [2, [3, [4]]], 5]); // 15

let deep = [1];
for (let i = 0; i < 100000; i++) deep = [deep, 1];
sumDeep(deep); // 100001
\`\`\`

**Як це працює:** рекурсія зберігає «що ще обробити» у **стеку викликів** — він малий. Те саме можна зберігати у звичайному масиві (\`stack\`) — він живе в купі й обмежений лише пам'яттю. Цикл \`while\` дістає з нього масив, числа додає, вкладені масиви кладе назад у \`stack\`.

**Врахуйте:**
- порожні масиви на будь-якому рівні;
- не мутуйте вхідні дані (не робіть \`shift\` з вкладених масивів).
`,
      starter: `function sumDeep(arr) {
  let total = 0;
  // 1. Явний стек: масиви, які ще треба обробити.
  const stack = [arr];

  // 2. TODO: поки stack не порожній — дістати масив (pop),
  //    числа додати до total, вкладені масиви покласти в stack (push)

  return total;
}

// Спробуйте в консолі: sumDeep([1, [2, [3]]]) // 6
`,
      solution: `function sumDeep(arr) {
  let total = 0;
  // явний стек у купі замість стеку викликів
  const stack = [arr];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const item of current) {
      if (Array.isArray(item)) stack.push(item);
      else total += item;
    }
  }
  return total;
}
`,
      hints: [
        'Замініть рекурсію на цикл `while (stack.length > 0)` з власним масивом-стеком.',
        'Усередині: `const current = stack.pop();` і для кожного `item` — або `stack.push(item)`, або `total += item`.'
      ],
      tests: [
        { name: 'звичайні випадки', code: 'expect(sumDeep([1, 2, 3])).toBe(6);\nexpect(sumDeep([1, [2, [3, [4]]], 5])).toBe(15);\nexpect(sumDeep([])).toBe(0);\nexpect(sumDeep([[], [[]]])).toBe(0);' },
        { name: 'вкладеність 100 000 рівнів', code: 'let deep = [1];\nfor (let i = 0; i < 100000; i++) deep = [deep, 1];\nexpect(sumDeep(deep)).toBe(100001);' },
        { name: 'глибина ліворуч і праворуч', code: 'let deep = [1];\nfor (let i = 0; i < 50000; i++) deep = [1, deep];\nexpect(sumDeep(deep)).toBe(50001);' },
        { name: 'широкий масив', code: 'const wide = Array.from({ length: 100000 }, () => [1]);\nexpect(sumDeep(wide)).toBe(100000);' },
        { name: 'не мутує вхідні дані', code: 'const a = [1, [2, [3]]];\nsumDeep(a);\nexpect(a).toEqual([1, [2, [3]]]);' }
      ],
      explanation: `
Обхід у глибину (DFS) з явним стеком. O(n) часу, O(w) пам'яті (масиви, що чекають у стеку).

**Чому не хвостова рекурсія:** у V8 немає TCO — стек усе одно переповниться.

**Типові помилки:** \`arr.flat(Infinity)\` — теж рекурсивний усередині і падає на такій глибині; мутація вхідних масивів.

**Що спитають далі:** коли потрібна черга (BFS) замість стеку? Як ітеративно обійти дерево коментарів і зберегти порядок?
`
    },
    // ================================================================ pure
    {
      id: 'fn-pure-functions',
      group: 'pure',
      type: 'theory',
      level: 2,
      title: 'Чисті та нечисті функції',
      tags: ['pure-functions', 'side-effects'],
      question: 'Що таке чиста функція і побічні ефекти? Чому чисті функції цінують? Оберіть **усі** правильні твердження.',
      choices: [
        'Чиста функція для однакових аргументів завжди повертає однаковий результат',
        'Функція з `Date.now()` чи `Math.random()` лишається чистою, якщо нічого не мутує',
        'Чисті функції безпечно мемоізувати, а побічні ефекти ізолюють на краях системи',
        'Мутувати аргумент у чистій функції можна, якщо повернути той самий об\'єкт',
        '`console.log` усередині не робить функцію нечистою, бо не змінює її результат'
      ],
      correct: [0, 2],
      why: [
        'Правильно: детермінованість — перша умова чистоти.',
        'Хибно: результат залежить від часу/випадковості, тож функція недетермінована.',
        'Правильно: результат залежить лише від аргументів — кеш коректний; ефекти виносять в обробники/сервіси.',
        'Хибно: мутація аргументу — побічний ефект, його побачить код, що викликав функцію.',
        'Хибно: вивід у консоль — це I/O, тобто побічний ефект.'
      ],
      hint: 'Два критерії: детермінованість і відсутність побічних ефектів.',
      answer: `
**Чиста функція:**
1. однакові аргументи → однаковий результат;
2. немає побічних ефектів.

**Побічні ефекти:** мутація аргументів/зовнішніх змінних, DOM, \`localStorage\`, мережа, \`console.log\`, таймери; читання \`Date.now()\`/\`Math.random()\` порушує детермінованість.

\`\`\`js
// нечиста: мутує аргумент і залежить від зовнішньої змінної
let taxRate = 0.2;
function addTax(order) { order.total *= 1 + taxRate; return order; }

// чиста
function withTax(order, rate) {
  return { ...order, total: order.total * (1 + rate) };
}
\`\`\`

**Переваги:** легко тестувати, безпечно мемоізувати, передбачувано. React-рендер і Redux-редюсери мають бути чистими.

**Ефекти** неминучі — їх ізолюють на краях: чисте ядро логіки + обробники/сервіси для I/O.
`,
      keyPoints: [
        'Детермінованість: однакові входи → однаковий вихід',
        'Відсутність побічних ефектів (мутації, I/O, DOM, мережа)',
        'Переваги: тестування, мемоізація, передбачуваність',
        'Ефекти ізолюють на краях системи'
      ],
      followUps: ['Чи чиста функція, що кидає помилку?', 'Навіщо React.StrictMode викликає рендер двічі?']
    },
    {
      id: 'fn-closures-memory',
      group: 'pure',
      type: 'theory',
      level: 4,
      title: 'Замикання і пам\'ять: що реально утримується',
      tags: ['closures', 'memory', 'gc', 'v8'],
      question: 'Як замикання впливають на пам\'ять? Які змінні зовнішньої функції реально утримуються і як шукати такі витоки?',
      choices: [
        'V8 завжди утримує все оточення зовнішньої функції, незалежно від того, що використано',
        'Замикання однієї області ділять один Context: змінна живе, поки живе будь-яке з них',
        'Змінна звільняється, щойно її перестає використовувати повернене назовні замикання',
        'Прямий `eval` у функції лише сповільнює її, але на утримання змінних не впливає'
      ],
      correct: 1,
      why: [
        'Хибно: V8 переносить у Context лише змінні, які використовують вкладені функції.',
        'Правильно: Context спільний для всіх замикань одного виклику — звідси неочевидні витоки.',
        'Хибно: якщо змінну використовує інше замикання того ж виклику, вона житиме, поки живе будь-яке з них.',
        'Хибно: з прямим `eval` рушій не знає, що знадобиться, і зберігає всі змінні.'
      ],
      hint: 'Не всі змінні потрапляють у контекст. Але всі замикання одного виклику ділять один об\'єкт Context.',
      answer: `
**Що утримується.** V8 аналізує код і переносить у об'єкт **Context** (у купі) лише змінні, які використовують вкладені функції. Решта звільняється після повернення.

**Пастка: один Context на всі замикання виклику.**
\`\`\`js
function setup() {
  const hugeData = new Array(1e6).fill('x');
  const logSize = () => console.log(hugeData.length); // використовує hugeData
  return () => console.log('tick');                   // не використовує...
}
const tick = setup(); // ...але hugeData утримується: Context спільний
\`\`\`

\`eval\`/\`with\` у функції змушують зберігати **всі** змінні.

**Типові витоки:** не видалені обробники подій і підписки, \`setInterval\` без \`clearInterval\`, необмежені кеші (memoize), замикання на видалені DOM-вузли.

**Як шукати:** DevTools → Memory → Heap snapshot: порівняння знімків, фільтр «Detached», ланцюжок Retainers.

**Як виправляти:** прибирати обробники й таймери, обнуляти великі посилання (\`hugeData = null\`), обмежувати кеші.
`,
      keyPoints: [
        'У Context потрапляють лише змінні, які використовують вкладені функції',
        'Усі замикання одного виклику ділять один Context',
        'eval/with змушують зберігати всі змінні',
        'Витоки: обробники, setInterval, необмежені кеші, detached DOM',
        'Діагностика: Heap snapshot, Retainers'
      ],
      followUps: ['Як знайти detached DOM-вузли в DevTools?', 'Чому обробник на window може утримувати компонент у пам\'яті?']
    }
  ]
});
