FE.topic('js-modern', {
  intro: `
## Деструктуризація та spread/rest
\`\`\`js
const { a, b: renamed = 10, nested: { x } = {}, ...rest } = obj; // перейменування, default, вкладене, rest
const [first, , third = 0, ...others] = arr;                      // пропуск, default, rest
[a, b] = [b, a];                                                   // swap
function f({ id, name = 'anon' } = {}) {}                          // у параметрах
\`\`\`
- Default спрацьовує **лише для \`undefined\`** (не для \`null\`).
- Spread \`{...obj}\`, \`[...arr]\` — **поверхнева** копія. Глибока — \`structuredClone\`.

## Сучасні оператори
- \`a || b\` — праве, якщо ліве **falsy** (\`0\`, \`''\`, \`false\`, \`null\`, \`undefined\`, \`NaN\`).
- \`a ?? b\` — праве, лише якщо ліве \`null\` або \`undefined\`.
- \`a?.b\`, \`a?.[k]\`, \`f?.()\` — \`undefined\`, якщо зліва null/undefined (коротке замикання всього ланцюжка).
- \`x ??= v\`, \`x ||= v\`, \`x &&= v\` — присвоєння лише за умови.

## Тегові шаблони
\`\`\`js
tag\`a\${x}b\`; // ≡ tag(['a', 'b'], x); strings.length === values.length + 1
\`\`\`
Використання: екранування HTML, \`styled-components\`, \`gql\`, i18n.

## Колекції
| | Ключі | Порядок | Розмір | Ітерабельний | GC ключів |
|---|---|---|---|---|---|
| \`Object\` | string/symbol | особливий для чисел | ✘ | ✘ | — |
| \`Map\` | будь-які | вставки | \`size\` | ✔ | ✘ |
| \`WeakMap\` | лише об'єкти | — | ✘ | ✘ | ✔ |
\`Set\`: унікальні значення (SameValueZero, \`NaN\` = \`NaN\`, об'єкти — за посиланням).

## Symbol
- \`Symbol('d') !== Symbol('d')\`, \`Symbol.for('k') === Symbol.for('k')\` (глобальний реєстр).
- Символьні ключі не видно в \`for...in\`, \`Object.keys\`, \`JSON.stringify\`.
- Well-known: \`Symbol.iterator\`, \`Symbol.toPrimitive\`, \`Symbol.toStringTag\`.

## Ітератори та генератори
\`\`\`js
const iterable = { [Symbol.iterator]() { let i = 0; return { next: () => ({ value: i, done: i++ >= 3 }) }; } };
function* gen() { const x = yield 1; yield* [2, 3]; return 4; } // return не потрапляє у for...of / spread
\`\`\`
- Генератор — лінивий, двосторонній: \`next(value)\` повертає значення в \`yield\`; \`return()\`, \`throw()\`.

## Proxy / Reflect
\`\`\`js
const p = new Proxy(target, {
  get(t, key, receiver) { return Reflect.get(t, key, receiver); },
  set(t, key, value, receiver) { return Reflect.set(t, key, value, receiver); }, // має повернути true
});
\`\`\`
Пастки: \`get\`, \`set\`, \`has\` (\`in\`), \`deleteProperty\`, \`ownKeys\`, \`apply\`, \`construct\`. Застосування: валідація, значення за замовчуванням, реактивність (Vue 3).
`,
  groups: [
    { id: 'destructuring', title: 'Деструктуризація, spread і rest' },
    { id: 'operators', title: '?. ?? і логічне присвоєння' },
    { id: 'templates', title: 'Тегові шаблони' },
    { id: 'collections', title: 'Map, Set, WeakMap' },
    { id: 'symbol', title: 'Symbol і well-known symbols' },
    { id: 'iterators', title: 'Протоколи iterable та iterator' },
    { id: 'generators', title: 'Генератори' },
    { id: 'proxy', title: 'Proxy і Reflect' }
  ],
  items: [
    // ------------------------------------------------------------------ 1. Destructuring & spread
    {
      id: 'es-quiz-destructuring-defaults',
      group: 'destructuring',
      type: 'quiz',
      level: 1,
      title: 'Default у деструктуризації: null чи undefined',
      tags: ['destructuring'],
      question: `
**Як це працює:** деструктуризація розпаковує об'єкт у змінні; можна перейменувати поле, задати значення за замовчуванням і розібрати вкладений об'єкт:
\`\`\`js
const { id, name: title = 'Без назви', meta: { views } = {} } = product;
\`\`\`
Default підставляється лише тоді, коли значення **\`undefined\`**.

Що виведе код?

\`\`\`js
const { a = 1, b = 2, c: { d = 3 } = {} } = { a: null, b: undefined };
console.log(a, b, d);
\`\`\`
`,
      options: ['`1 2 3`', '`null 2 3`', '`null undefined 3`', '`TypeError`'],
      answer: 1,
      why: [
        'Так поводився б `??`, але default у деструктуризації реагує лише на `undefined`, а `a` дорівнює `null`.',
        'Правильно: `a` лишається `null`, явний `undefined` у `b` дає 2, відсутній `c` замінюється на `{}`, звідки `d = 3`.',
        'Явний `undefined` теж запускає default — це те саме, що відсутнє поле, тому `b = 2`.',
        '`TypeError` був би без `= {}` для `c` (деструктуризація `undefined`); тут відсутній `c` замінюється порожнім об\'єктом.'
      ],
      hint: 'Для якого саме значення спрацьовує значення за замовчуванням?',
      explanation: `
\`null\` — це «значення є, і воно порожнє», тому default його не підміняє. Відсутнє поле і явний \`undefined\` — однаково. \`= {}\` після вкладеного шаблону захищає від \`TypeError\`, коли вкладеного об'єкта немає. Якщо треба замінити і \`null\` — після деструктуризації \`a ??= 1\`.
`
    },
    {
      id: 'es-quiz-array-destructuring',
      group: 'destructuring',
      type: 'quiz',
      level: 1,
      title: 'Деструктуризація масиву: пропуск, default, rest',
      tags: ['destructuring', 'rest'],
      question: `
**Як це працює:** у масивах змінні беруться **за позицією**; порожнє місце між комами пропускає елемент, а \`...rest\` (лише останнім) збирає залишок у новий масив.

Що виведе код?

\`\`\`js
const [a, , b = 10, ...rest] = [1, 2, undefined, 4, 5];
console.log(a, b, rest);
\`\`\`
`,
      options: ['`1 2 [undefined, 4, 5]`', '`1 10 [4, 5]`', '`1 undefined [4, 5]`', '`1 10 [2, 4, 5]`'],
      answer: 1,
      why: [
        'Кома без імені пропускає `2`, тому `b` бере третій елемент, а не другий.',
        'Правильно: `a = 1`, `2` пропущено, третій елемент `undefined` → default `10`, rest збирає `[4, 5]`.',
        'Явний `undefined` запускає default так само, як відсутній елемент, тож `b = 10`.',
        'Пропущений елемент нікуди не потрапляє — rest збирає лише те, що після останньої змінної.'
      ],
      hint: 'Кома без імені пропускає елемент. Коли спрацьовує default?',
      explanation: `
Позиції: \`a\` ← 0, пропуск ← 1, \`b\` ← 2, \`rest\` ← решта. Rest-елемент має бути **останнім**, інакше \`SyntaxError\`. Практичний приклад: \`const [first, ...others] = list\` або обмін змінних \`[a, b] = [b, a]\`.
`
    },
    {
      id: 'es-quiz-spread-merge', group: 'destructuring', type: 'quiz', level: 2,
      title: 'Злиття налаштувань: spread і undefined',
      tags: ['spread', 'destructuring', 'defaults'],
      question: `Параметри з URL зливають з налаштуваннями за замовчуванням. Що виведе код?
\`\`\`js
const defaults = { theme: 'light', pageSize: 20, lang: 'uk' };
const fromUrl = { theme: undefined, pageSize: 50 };

const settings = { ...defaults, ...fromUrl };
const { theme = 'light', lang = 'en' } = fromUrl;

console.log(settings.theme, settings.pageSize, theme, lang);
\`\`\``,
      options: ['`undefined 50 light en`', '`light 50 light en`', '`undefined 50 undefined en`', '`light 50 light uk`'],
      answer: 0,
      why: [
        'Так: spread копіює властивість `theme` разом зі значенням `undefined`, а default у деструктуризації спрацьовує саме для `undefined` і відсутніх полів.',
        'Ні: spread не пропускає `undefined` — власна властивість зі значенням `undefined` затирає значення з `defaults`.',
        'Ні: default у деструктуризації замінює і явне `undefined`, а не лише відсутню властивість.',
        'Ні: деструктуризація читає `fromUrl`, де `lang` немає, тож береться default `\'en\'`, а не значення з `defaults`.'
      ],
      hint: 'Spread копіює **власні** властивості як є. А коли саме спрацьовує значення за замовчуванням у деструктуризації?',
      explanation: '`{ ...a, ...b }` копіює всі власні перелічувані властивості `b`, зокрема зі значенням `undefined`, тож явне `undefined` затирає значення за замовчуванням — частий баг при злитті параметрів з URL чи форми з налаштуваннями. Default у деструктуризації навпаки спрацьовує для `undefined` і відсутньої властивості (але не для `null`). Виправлення для злиття — прибрати `undefined` перед spread: `Object.fromEntries(Object.entries(b).filter(([, v]) => v !== undefined))`. Про те, що spread копіює лише перший рівень, — у модулі «Об\'єкти».'
    },
    {
      id: 'es-destructuring-theory',
      group: 'destructuring',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Деструктуризація, spread і rest',
      tags: ['destructuring', 'spread'],
      question: 'Розкажіть про деструктуризацію об\'єктів і масивів. Чим spread відрізняється від rest? Чому spread дає поверхневу копію і як зробити глибоку? Оберіть **усі** правильні твердження.',
      choices: [
        'Значення за замовчуванням у деструктуризації спрацьовує лише для `undefined`, а `null` лишається `null`',
        'Rest у `const { a, ...rest } = obj` робить глибоку копію решти полів, тому `rest` безпечно мутувати',
        '`{ ...user }` копіює всі рівні вкладеності, тож зміна `copy.profile.name` не зачепить `user`',
        '`structuredClone` копіює `Map`, `Set`, `Date` і циклічні посилання, але не функції та DOM-вузли',
        '`JSON.parse(JSON.stringify(obj))` — повна глибока копія, що зберігає `Date`, `undefined` і `Map`'
      ],
      correct: [0, 3],
      why: [
        'Правильно: `null` — це значення, тому default його не замінює; для `null` використовують `??`.',
        'Хибно: rest створює новий об\'єкт лише першого рівня — вкладені об\'єкти спільні з оригіналом.',
        'Хибно: spread поверхневий — `copy.profile` і `user.profile` вказують на той самий об\'єкт.',
        'Правильно: structured clone підтримує Map/Set/Date/цикли, а на функції кидає `DataCloneError`.',
        'Хибно: JSON перетворює `Date` на рядок, викидає `undefined` і функції, `Map` стає `{}`, а цикли кидають помилку.'
      ],
      answer: `
**Деструктуризація** — розпакування значень з об'єктів/масивів у змінні.
\`\`\`js
const { id, profile: { name: userName = 'anon' } = {}, email = 'n/a' } = user;
const [firstRole, , third = 'none'] = user.roles;
function connect({ host = 'localhost', port = 80 } = {}) {} // "= {}" — щоб connect() не впав
\`\`\`
- default — лише для \`undefined\`;
- деструктуризація \`null\`/\`undefined\` → \`TypeError\`;
- масивна деструктуризація працює з будь-яким ітерабельним (рядок, Set, Map).

**Rest** збирає: \`const { password, ...safeUser } = user\` — прибрати поле без мутації. **Spread** розгортає: \`[...arr, 4]\`, \`{ ...defaults, ...options }\`, \`fn(...args)\`.

**Поверхнева копія:** spread копіює лише власні перелічувані поля першого рівня; геттери викликає (копіює значення), прототип не переносить.

**Глибока копія:** \`structuredClone\` (Map, Set, Date, цикли; без функцій і DOM). JSON-спосіб губить \`undefined\`, \`Date\`, \`Map\`, падає на циклах. У React/Redux копіюють лише змінені гілки: \`{ ...state, profile: { ...state.profile, name } }\`.
`,
      keyPoints: [
        'Перейменування, значення за замовчуванням, вкладена деструктуризація, rest',
        'Default спрацьовує лише для undefined, не для null',
        'Rest збирає, spread розгортає; у об\'єктах пізніший ключ перемагає',
        'Spread — поверхнева копія, вкладені об\'єкти спільні',
        'Глибока копія: structuredClone і його обмеження; недоліки JSON-способу'
      ],
      followUps: [
        'Що буде при деструктуризації null?',
        'Як прибрати поле з об\'єкта без мутації?',
        'Чим Object.assign відрізняється від spread?'
      ]
    },
    {
      id: 'es-quiz-structured-clone',
      group: 'destructuring',
      type: 'quiz',
      level: 2,
      title: 'Що вміє structuredClone',
      tags: ['structuredClone', 'immutability'],
      question: 'Оберіть **усі** правильні твердження про `structuredClone(value)`:',
      options: [
        'Коректно копіює об\'єкти з циклічними посиланнями',
        'Зберігає `Map`, `Set` і `Date` як відповідні типи',
        'Копіює методи-функції об\'єкта',
        'Геттер `get total()` копіюється як геттер і далі перераховується',
        'Кидає помилку `DataCloneError`, якщо всередині є функція'
      ],
      answer: [0, 1, 4],
      why: [
        'Правильно: алгоритм запам\'ятовує вже скопійовані об\'єкти, тому цикли не ламають копіювання.',
        'Правильно: Map, Set, Date, RegExp, типізовані масиви відтворюються з правильним типом.',
        'Хибно: функції не клонуються — на них `structuredClone` кидає помилку.',
        'Хибно: геттер викликається один раз, і в копію потрапляє його значення як звичайне поле.',
        'Правильно: функцію неможливо передати в інший потік, тому алгоритм кидає `DataCloneError`.'
      ],
      hint: 'Алгоритм structured clone створювали для передачі даних між потоками (`postMessage`). Що з цього можна передати в інший потік?',
      explanation: `
\`structuredClone\` використовує той самий алгоритм, що \`postMessage\` та IndexedDB: копіює **дані**, а не поведінку. Функції → помилка; геттери, неперелічувані поля та прототипи губляться; DOM-вузли не клонуються. Порівняно з \`JSON.parse(JSON.stringify(x))\` — не падає на циклах і зберігає \`Date\`/\`Map\`/\`Set\`.
`
    },
    {
      id: 'es-create-request',
      group: 'destructuring',
      type: 'code',
      level: 1,
      title: 'Конфіг HTTP-запиту: деструктуризація параметрів',
      tags: ['destructuring', 'rest'],
      description: `
**Завдання.** Напишіть \`createRequest(config)\`, яка розбирає конфіг запиту **деструктуризацією прямо в параметрах** і повертає нормалізований об'єкт з усіма значеннями за замовчуванням.

**Де трапляється:** обгортки над \`fetch\`/axios, опції компонентів і хуків — функція приймає один об'єкт налаштувань, де більшість полів необов'язкові.

**Що написати**
- \`createRequest(config)\` → об'єкт \`{ url, method, timeout, retries, meta }\`:

| Поле | Звідки | За замовчуванням |
|---|---|---|
| \`url\` | \`config.url\` | — |
| \`method\` | \`config.method\` | \`'GET'\` |
| \`timeout\` | \`config.options.timeout\` | \`5000\` |
| \`retries\` | \`config.options.retries\` | \`0\` |
| \`meta\` | **усі інші** поля \`config\` | \`{}\` |

**Приклад**
\`\`\`js
createRequest({ url: '/api', options: { timeout: 100 }, auth: true });
// { url: '/api', method: 'GET', timeout: 100, retries: 0, meta: { auth: true } }
createRequest(); // { url: undefined, method: 'GET', timeout: 5000, retries: 0, meta: {} }
\`\`\`

**Як це працює:** шаблон деструктуризації можна писати замість імені параметра: \`function f({ a, b = 1 } = {})\`. Вкладений шаблон \`options: { timeout = 5000 } = {}\` дістає поле з вкладеного об'єкта, а \`= {}\` підставляє порожній об'єкт, якщо \`options\` немає. \`...meta\` в кінці збирає всі інші поля в **новий** об'єкт.

**Врахуйте:**
- \`options\` може бути відсутнім; виклик без аргументів не має падати;
- default лише для \`undefined\`: \`method: null\` лишається \`null\`;
- вхідний об'єкт не змінювати.
`,
      starter: `function createRequest(config) {
  // 1. Замініть параметр config на шаблон деструктуризації:
  //    { url, method = 'GET', options: { ... } = {}, ...meta } = {}
  // 2. Для вкладеного options задайте defaults timeout = 5000, retries = 0
  // 3. Поверніть { url, method, timeout, retries, meta }
  // TODO
}

// Спробуйте в консолі:
// createRequest({ url: '/api', options: { timeout: 100 }, auth: true });
`,
      solution: `function createRequest({
  url,
  method = 'GET',
  options: { timeout = 5000, retries = 0 } = {}, // default для вкладеного об'єкта
  ...meta                                         // rest — усе інше
} = {}) {                                         // default для всього параметра
  return { url, method, timeout, retries, meta };
}
`,
      hints: [
        'Можна деструктуризувати прямо в параметрах: `function f({ a, b = 1 } = {})`.',
        'Для вкладеного `options` потрібен власний default `= {}`, інакше деструктуризація `undefined` кине `TypeError`.',
        '`...meta` в кінці шаблону збере всі інші власні поля в новий об\'єкт: `{ url, method = \'GET\', options: { timeout = 5000, retries = 0 } = {}, ...meta } = {}`.'
      ],
      tests: [
        { name: 'повний конфіг', code: 'expect(createRequest({ url: "/a", method: "POST", options: { timeout: 1, retries: 3 }, auth: true, cache: "no" })).toEqual({ url: "/a", method: "POST", timeout: 1, retries: 3, meta: { auth: true, cache: "no" } });' },
        { name: 'значення за замовчуванням', code: 'expect(createRequest({ url: "/a" })).toEqual({ url: "/a", method: "GET", timeout: 5000, retries: 0, meta: {} });' },
        { name: 'частковий options', code: 'const r = createRequest({ url: "/a", options: { retries: 2 } });\nexpect(r.timeout).toBe(5000);\nexpect(r.retries).toBe(2);' },
        { name: 'без аргументів не падає', code: 'expect(createRequest()).toEqual({ url: undefined, method: "GET", timeout: 5000, retries: 0, meta: {} });' },
        { name: 'null не замінюється default', code: 'expect(createRequest({ url: "/a", method: null }).method).toBeNull();' },
        { name: 'не мутує вхідний об\'єкт', code: 'const cfg = { url: "/a", x: 1 };\nconst r = createRequest(cfg);\nexpect(cfg).toEqual({ url: "/a", x: 1 });\nexpect(r.meta).not.toBe(cfg);' }
      ],
      explanation: `
Уся логіка — у шаблоні параметра: defaults, вкладений шаблон з власним \`= {}\`, rest для решти полів і \`= {}\` для всього параметра. Складність O(k) від кількості полів.

**Типова помилка:** забути \`= {}\` для \`options\` або для параметра → \`TypeError: Cannot read properties of undefined\`.

**Що спитають далі:** як зробити поле обов'язковим? (\`url = required('url')\` — default може бути викликом функції, що кидає помилку.) Чому об'єкт параметрів кращий за довгий список позиційних аргументів?
`
    },

    // ------------------------------------------------------------------ 2. Modern operators
    {
      id: 'es-quiz-nullish-vs-or',
      group: 'operators',
      type: 'quiz',
      level: 1,
      interview: true,
      title: '?? проти ||',
      tags: ['nullish'],
      question: `
**Як це працює:** \`a || b\` повертає \`b\`, якщо \`a\` **falsy** (\`0\`, \`''\`, \`false\`, \`NaN\`, \`null\`, \`undefined\`). \`a ?? b\` повертає \`b\`, лише якщо \`a\` це \`null\` або \`undefined\`:
\`\`\`js
const limit = settings.limit ?? 10; // limit = 0 залишиться 0
\`\`\`

Що виведе код?

\`\`\`js
console.log(0 || 5, 0 ?? 5, '' ?? 'x', null ?? undefined ?? 0);
\`\`\`
`,
      options: ['`5 5 x 0`', '`5 0 x undefined`', '`5 0 (порожній рядок) 0`', '`0 0 (порожній рядок) null`'],
      answer: 2,
      why: [
        'Це поведінка `||` для всіх виразів; `??` не замінює `0` і `\'\'`, бо вони не nullish.',
        '`\'\'` не nullish, тому `\'\' ?? \'x\'` дає порожній рядок; а ланцюжок `??` іде далі, поки не знайде не-nullish `0`.',
        'Правильно: `||` замінює falsy `0` на 5, а `??` пропускає лише `null`/`undefined`, тому `0` і `\'\'` лишаються, а ланцюжок доходить до `0`.',
        '`0 || 5` дає 5, бо `0` falsy; а `null ?? undefined ?? 0` іде праворуч до першого не-nullish значення.'
      ],
      hint: '`??` дивиться лише на два конкретні значення.',
      explanation: `
\`??\` — «значення за замовчуванням, якщо його не передали», \`||\` — «якщо значення порожнє/хибне». Для числових і рядкових налаштувань (\`limit\`, \`page\`, \`opacity\`, \`title\`) майже завжди потрібен \`??\`. Змішувати \`??\` з \`||\`/\`&&\` без дужок не можна — \`SyntaxError\`.
`
    },
    {
      id: 'es-quiz-logical-assignment',
      group: 'operators',
      type: 'quiz',
      level: 2,
      title: 'Логічне присвоєння та optional chaining',
      tags: ['nullish', 'optional-chaining'],
      question: `
**Як це працює:**
- \`x ||= v\` — присвоїти, якщо \`x\` falsy; \`x ??= v\` — якщо \`x\` null/undefined; \`x &&= v\` — якщо \`x\` truthy;
- \`a?.b.c\` — якщо \`a\` це \`null\`/\`undefined\`, **увесь** ланцюжок праворуч пропускається і результат \`undefined\`.

Що виведе код?

\`\`\`js
const o = { count: 0, title: '', list: null };
o.count ||= 10;
o.title ??= 'Untitled';
o.list ??= [];
o.count &&= o.count + 1;

const s = null;
console.log(o.count, JSON.stringify(o.title), o.list, s?.a.b.c);
\`\`\`
`,
      options: [
        '`11 "Untitled" [] undefined`',
        '`11 "" [] undefined`',
        '`1 "" [] undefined`',
        '`11 "" [] TypeError`'
      ],
      answer: 1,
      why: [
        '`\'\'` falsy, але не nullish — `??=` його не замінює; `"Untitled"` дав би `||=`.',
        'Правильно: `0 ||= 10` → 10, потім `&&=` → 11; `\'\'` не nullish і лишається; `null ??= []` → `[]`; `s?.` обриває весь ланцюжок.',
        '`||=` спрацьовує на falsy `0`, тому спочатку `count` стає 10, а потім `&&=` дає 11.',
        '`?.` після `null` пропускає **весь** ланцюжок `.a.b.c`, тому помилки немає — лише `undefined`.'
      ],
      hint: 'Порожній рядок — falsy, але чи nullish? І що робить `?.`, коли зліва `null`, з рештою ланцюжка?',
      explanation: `
Логічне присвоєння виконує присвоєння (і обчислює праву частину) **лише за потреби** — зручно для лінивої ініціалізації: \`cache[key] ??= compute(key)\`. Коротке замикання \`?.\` діє на весь ланцюжок до кінця виразу, тому \`s?.a.b.c\` безпечний, хоча \`.b\` і \`.c\` без знака питання.
`
    },
    {
      id: 'es-operators-theory',
      group: 'operators',
      type: 'theory',
      level: 2,
      interview: true,
      title: '?. ?? і логічне присвоєння',
      tags: ['optional-chaining', 'nullish'],
      question: 'Як працюють optional chaining (?.) і nullish coalescing (??)? Чим ?? відрізняється від ||? Що таке ??=, ||=, &&=?',
      choices: [
        '`??` і `||` еквівалентні, але `??` працює швидше, тому `||` для значень за замовчуванням уже не пишуть',
        '`??` підставляє праве значення лише для `null`/`undefined`, тож `0 ?? 10` дає `0`, а `0 || 10` — `10`',
        '`a ??= b` завжди обчислює `b` і присвоює його, якщо `a` falsy, — це скорочення для `a = a || b`',
        '`user?.profile.name` кидає `TypeError`, якщо `user` — `null`, бо `?.` стоїть лише перед `profile`'
      ],
      correct: 1,
      why: [
        'Хибно: вони реагують на різні значення (`||` — на будь-яке falsy), різниця в семантиці, а не в швидкості.',
        'Правильно: `??` перевіряє лише null/undefined, тому `0`, `\'\'`, `false` залишаються.',
        'Хибно: `??=` реагує лише на null/undefined і обчислює `b` тільки тоді, коли присвоєння потрібне.',
        'Хибно: `?.` обриває весь ланцюжок праворуч, тож результат `undefined` без помилки.'
      ],
      answer: `
**\`?.\`** — якщо ліворуч \`null\`/\`undefined\`, ланцюжок праворуч не обчислюється, результат \`undefined\`.
\`\`\`js
user?.profile?.name;   // властивість
user?.['full-name'];   // обчислюваний ключ
user.getName?.();      // виклик, якщо метод існує
\`\`\`
Не ставте \`?.\` всюди: якщо значення обов'язкове, краще помилка одразу (fail fast). Зліва від присвоєння \`?.\` не можна.

**\`??\`** — праве значення лише для \`null\`/\`undefined\`; \`||\` — для будь-якого falsy:
\`\`\`js
const limit = settings.limit || 10;  // 0 → 10 ✘
const limit2 = settings.limit ?? 10; // 0 → 0 ✔
\`\`\`
Змішувати з \`||\`/\`&&\` без дужок — \`SyntaxError\`.

**Логічне присвоєння** — присвоює (і обчислює праву частину) лише за потреби:
\`\`\`js
opts.timeout ??= 5000;
user.name ||= 'Anon';
session &&= refresh(session);
\`\`\`

**Корисне поруч:** \`Object.hasOwn(obj, key)\`, \`arr.at(-1)\`, \`structuredClone\`, методи без мутації \`toSorted/toReversed/with\` (ES2023), \`Object.groupBy\` (ES2024).
`,
      keyPoints: [
        '?. зупиняє обчислення на null/undefined і повертає undefined',
        '?? реагує лише на null/undefined, || — на будь-яке falsy (0, \'\', false)',
        '??=, ||=, &&= присвоюють тільки за умови (ліниво)',
        'Не зловживати ?. там, де значення обов\'язкове',
        'Object.hasOwn, at(), structuredClone, методи без мутації'
      ],
      followUps: [
        'Чому a ?? b || c — синтаксична помилка?',
        'Чим Object.hasOwn кращий за hasOwnProperty?',
        'Що з\'явилось у ES2023–ES2025?'
      ]
    },
    {
      id: 'es-apply-defaults', group: 'operators', type: 'code', level: 2,
      title: 'Значення за замовчуванням: ?? і ??= не затирають 0, false і порожній рядок',
      tags: ['nullish', 'optional-chaining', 'logical-assignment'],
      description: `
**Завдання.** Напишіть три функції для налаштувань і даних з API, у яких «порожні» значення бувають навмисними.

**Де трапляється:** налаштування з \`localStorage\` чи сервера, де частини полів ще немає (вийшла нова версія застосунку), але \`volume: 0\` (звук вимкнено) чи \`signature: ''\` (підпис прибрано) — свідомий вибір користувача. Заміна \`||\` на \`??\` — один з найчастіших фіксів на код-рев'ю.

**Що написати**
- \`withDefaults(settings)\` → **новий** об'єкт \`{ volume, autoplay, signature, notifications: { email, push } }\`: значення з \`settings\`, а замість \`null\`/\`undefined\` — з \`DEFAULTS\` (уже є); \`settings\` і \`settings.notifications\` можуть бути \`null\`/\`undefined\`;
- \`cityOf(order)\` → \`order.delivery.address.city\` або \`'Самовивіз'\`, якщо на будь-якому кроці \`null\`/\`undefined\`;
- \`initCounters(stats)\` → той самий об'єкт \`stats\`, у якому відсутні \`views\` і \`likes\` стали \`0\`, а \`tags\` — \`[]\`; наявні значення (зокрема \`0\`) не змінюються.

**Приклад**
\`\`\`js
withDefaults({ volume: 0, notifications: { email: false } });
// { volume: 0, autoplay: true, signature: 'Надіслано з FE Trainer', notifications: { email: false, push: true } }
cityOf({ delivery: null });   // 'Самовивіз'
initCounters({ views: 5 });   // { views: 5, likes: 0, tags: [] }
\`\`\`

**Як це працює:** \`a ?? b\` повертає \`b\` лише тоді, коли \`a\` — \`null\` або \`undefined\`; \`||\` спрацьовує на будь-яке falsy-значення (\`0\`, \`''\`, \`false\`), тож \`volume || 70\` перетворить «звук вимкнено» на 70. \`a ??= b\` присвоює лише тоді, коли \`a\` — \`null\`/\`undefined\`. \`?.\` зупиняє ланцюжок на \`null\`/\`undefined\` і повертає \`undefined\`.

**Врахуйте:** \`notifications\` у результаті — новий об'єкт (зміна результату не повинна зачепити \`DEFAULTS\`); порожнє місто \`''\` \`cityOf\` повертає як є.
`,
      starter: `const DEFAULTS = {
  volume: 70,
  autoplay: true,
  signature: 'Надіслано з FE Trainer',
  notifications: { email: true, push: true },
};

function withDefaults(settings) {
  // Новий об'єкт; кожне поле — значення користувача ?? значення з DEFAULTS.
  // settings і settings.notifications можуть бути null / undefined.
  // TODO
}

function cityOf(order) {
  // order?.delivery?.address?.city, а якщо його немає — 'Самовивіз'
  // TODO
}

function initCounters(stats) {
  // Дописати відсутні views = 0, likes = 0, tags = [] через ??= і повернути той самий об'єкт
  // TODO
}

// Спробуйте в консолі:
// withDefaults({ volume: 0 }).volume; // 0, а не 70
`,
      solution: `const DEFAULTS = {
  volume: 70,
  autoplay: true,
  signature: 'Надіслано з FE Trainer',
  notifications: { email: true, push: true },
};

function withDefaults(settings) {
  const s = settings ?? {};
  const n = s.notifications ?? {};
  return {
    volume: s.volume ?? DEFAULTS.volume,          // 0 лишається 0
    autoplay: s.autoplay ?? DEFAULTS.autoplay,    // false лишається false
    signature: s.signature ?? DEFAULTS.signature, // '' лишається ''
    notifications: {
      email: n.email ?? DEFAULTS.notifications.email,
      push: n.push ?? DEFAULTS.notifications.push,
    },
  };
}

function cityOf(order) {
  return order?.delivery?.address?.city ?? 'Самовивіз';
}

function initCounters(stats) {
  stats.views ??= 0;
  stats.likes ??= 0;
  stats.tags ??= [];
  return stats;
}
`,
      hints: [
        'Почніть з `const s = settings ?? {};` і `const n = s.notifications ?? {};` — далі поля можна читати без перевірок.',
        'Кожне поле: `volume: s.volume ?? DEFAULTS.volume`; для `notifications` створіть новий об\'єкт з двома полями.',
        '`initCounters` — три рядки на кшталт `stats.views ??= 0;` і `return stats;`.'
      ],
      tests: [
        { name: '0, false і порожній рядок зберігаються', code: 'const s = withDefaults({ volume: 0, autoplay: false, signature: "" });\nexpect(s.volume).toBe(0);\nexpect(s.autoplay).toBe(false);\nexpect(s.signature).toBe("");' },
        { name: 'відсутнє й null заповнюються, зокрема вкладене', code: 'expect(withDefaults({ notifications: { email: false } })).toEqual({ volume: 70, autoplay: true, signature: "Надіслано з FE Trainer", notifications: { email: false, push: true } });\nexpect(withDefaults(null)).toEqual({ volume: 70, autoplay: true, signature: "Надіслано з FE Trainer", notifications: { email: true, push: true } });\nexpect(withDefaults({ volume: null }).volume).toBe(70);' },
        { name: 'вхідний об\'єкт і DEFAULTS не змінюються', code: 'const input = { volume: 10 };\nconst out = withDefaults(input);\nexpect(input).toEqual({ volume: 10 });\nout.notifications.email = false;\nexpect(DEFAULTS.notifications.email).toBe(true);' },
        { name: 'cityOf: безпечний доступ', code: 'expect(cityOf({ delivery: { address: { city: "Львів" } } })).toBe("Львів");\nexpect(cityOf({ delivery: null })).toBe("Самовивіз");\nexpect(cityOf(undefined)).toBe("Самовивіз");\nexpect(cityOf({ delivery: { address: { city: "" } } })).toBe("");' },
        { name: 'initCounters: той самий об\'єкт, 0 не скидається', code: 'const st = { views: 0, tags: null };\nconst r = initCounters(st);\nexpect(r).toBe(st);\nexpect(st).toEqual({ views: 0, tags: [], likes: 0 });' }
      ],
      explanation: `
\`??\` і \`??=\` розрізняють «значення немає» (\`null\`/\`undefined\`) і «значення є, хоч і falsy». \`?.\` прибирає ланцюжки \`a && a.b && a.b.c\`. Разом вони замінюють більшість ручних перевірок у роботі з даними ззовні.

**Типові помилки:** \`settings.volume || 70\` (губить \`0\`); \`notifications: n ?? DEFAULTS.notifications\` (спільний об'єкт з \`DEFAULTS\` — зміна результату змінить дефолти); \`{ ...DEFAULTS, ...settings }\` (явне \`undefined\` затирає дефолт — квіз про spread у кроці «Деструктуризація»).

**Що спитають далі:** чому \`a || b ?? c\` — SyntaxError (змішувати можна лише з дужками); як злити налаштування довільної глибини (\`deepMerge\` у модулі «Об'єкти»).
`
    },

    // ------------------------------------------------------------------ 3. Tagged templates
    {
      id: 'es-quiz-tagged-template',
      group: 'templates',
      type: 'quiz',
      level: 2,
      title: 'Аргументи тегової функції',
      tags: ['template-literals'],
      question: `
**Як це працює:** якщо перед шаблонним рядком стоїть функція (тег), вона отримує **окремо** рядкові частини і значення підстановок:
\`\`\`js
tag\`Привіт, \${name}!\`; // ≡ tag(['Привіт, ', '!'], name)
\`\`\`
Так бібліотеки відрізняють «код» (частини, написані розробником) від «даних» (підстановок).

Що виведе код?

\`\`\`js
function tag(strings, ...values) {
  return strings.length + '|' + values.join(',') + '|' + JSON.stringify(strings[2]);
}

console.log(tag\`a\${1}b\${2}\`);
\`\`\`
`,
      options: ['`2|1,2|undefined`', '`3|1,2|""`', '`3|1,2|"b"`', '`2|a,b|""`'],
      answer: 1,
      why: [
        'Після останньої підстановки теж є рядкова частина — порожній рядок, тому частин три, а не дві.',
        'Правильно: `strings = [\'a\', \'b\', \'\']`, `values = [1, 2]`, третя частина — порожній рядок.',
        '`\'b\'` — це друга частина (`strings[1]`); `strings[2]` — порожній рядок після `${2}`.',
        'У `values` потрапляють значення підстановок (`1, 2`), а `a` і `b` — це рядкові частини.'
      ],
      hint: 'Рядкових частин завжди на одну більше, ніж підстановок — навіть якщо шаблон закінчується підстановкою.',
      explanation: `
Інваріант: \`strings.length === values.length + 1\`. Є ще \`strings.raw\` — «сирі» рядки без обробки escape-послідовностей (на ньому працює \`String.raw\`). Масив \`strings\` заморожений і однаковий для того самого місця в коді — lit-html використовує це для кешування шаблонів.
`
    },
    {
      id: 'es-html-tag',
      group: 'templates',
      type: 'code',
      level: 3,
      title: 'Тегова функція html з екрануванням (захист від XSS)',
      tags: ['template-literals', 'security', 'xss'],
      description: `
**Завдання.** Реалізуйте тегову функцію \`html\`: рядкові частини шаблону вставляються як є, а **підставлені значення екрануються**, щоб дані користувача не стали HTML-кодом.

**Де трапляється:** рендер рядків HTML без фреймворку (lit-html, серверні шаблони), захист від XSS — часте питання на співбесідах про безпеку.

**Що написати**
- \`html\` (тег) → рядок HTML
- правила для значення підстановки:
  - \`&\` → \`&amp;\`, \`<\` → \`&lt;\`, \`>\` → \`&gt;\`, \`"\` → \`&quot;\`, \`'\` → \`&#39;\`
  - масив → кожен елемент за тими ж правилами, склеїти без роздільника
  - \`null\`, \`undefined\`, \`false\` → \`''\`; числа → рядок (\`0\` → \`'0'\`)
  - \`{ __html: '...' }\` → вставити **без** екранування (явно довірений HTML)

**Приклад**
\`\`\`js
const name = '<img src=x onerror=alert(1)>';
html\`<p>Привіт, \${name}!</p>\`;
// '<p>Привіт, &lt;img src=x onerror=alert(1)&gt;!</p>'
html\`<div>\${{ __html: '<b>ok</b>' }}</div>\`; // '<div><b>ok</b></div>'
\`\`\`

**Як це працює:** тег отримує \`strings\` (на одну частину більше) і \`values\`. Результат: \`strings[0] + render(values[0]) + strings[1] + … + strings[n]\`. Екранування — \`replace(/[&<>"']/g, ch => map[ch])\`: кожен символ замінюється рівно один раз, тому порядок не важливий.

**Врахуйте:** \`&\` теж треба екранувати; рядкові частини шаблону не чіпати; \`false\` не має стати рядком \`'false'\` (умовний рендер \`\${isAdmin && '...'}\`).
`,
      starter: `function escapeHtml(str) {
  // 1. TODO: String(str) і замінити & < > " ' на сутності
}

function renderValue(value) {
  // 2. TODO:
  //    null / undefined / false → ''
  //    масив → value.map(renderValue).join('')
  //    { __html: '...' } → value.__html як є
  //    інше → escapeHtml(value)
}

function html(strings, ...values) {
  // 3. Склейте: strings[0] + renderValue(values[0]) + strings[1] + ...
  let out = strings[0];
  // TODO: цикл по values
  return out;
}

// Спробуйте в консолі:
// html\`<p>\${'<b>'}</p>\`; // '<p>&lt;b&gt;</p>'
`,
      solution: `const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

function renderValue(value) {
  if (value === null || value === undefined || value === false) return '';
  if (Array.isArray(value)) return value.map(renderValue).join('');
  if (typeof value === 'object' && typeof value.__html === 'string') return value.__html; // довірений HTML
  return escapeHtml(value);
}

function html(strings, ...values) {
  // strings.length === values.length + 1
  let out = strings[0];
  for (let i = 0; i < values.length; i++) {
    out += renderValue(values[i]) + strings[i + 1];
  }
  return out;
}
`,
      hints: [
        'Тегова функція отримує `strings` (на одну частину більше) і `values`. Склеюйте: `strings[0] + v0 + strings[1] + v1 + ...`.',
        'Екранування — `String(v).replace(/[&<>"\']/g, ch => map[ch])`, де `map` — об\'єкт символ → сутність.',
        'Окрема функція `renderValue`: спочатку `null/undefined/false`, потім `Array.isArray` (рекурсивно), потім `{ __html }`, інакше — екранування.'
      ],
      tests: [
        { name: 'екранує підстановки', code: 'const name = "<img src=x onerror=alert(1)>";\nexpect(html`<p>${name}</p>`).toBe("<p>&lt;img src=x onerror=alert(1)&gt;</p>");' },
        { name: 'екранує всі небезпечні символи', code: 'expect(html`${"& < > \\" \'"}`).toBe("&amp; &lt; &gt; &quot; &#39;");' },
        { name: 'рядкові частини шаблону не екрануються', code: 'expect(html`<a href="/x">${"ok"}</a>`).toBe(\'<a href="/x">ok</a>\');' },
        { name: 'масиви склеюються, елементи екрануються', code: 'const items = ["a", "<b>"];\nexpect(html`<ul>${items.map((i) => html`<li>${i}</li>`).map((s) => ({ __html: s }))}</ul>`).toBe("<ul><li>a</li><li>&lt;b&gt;</li></ul>");\nexpect(html`${[1, "<", null]}`).toBe("1&lt;");' },
        { name: 'null/undefined/false → порожньо, 0 → "0"', code: 'expect(html`[${null}${undefined}${false}${0}]`).toBe("[0]");' },
        { name: '{ __html } вставляється як є', code: 'expect(html`<div>${{ __html: "<b>bold</b>" }}</div>`).toBe("<div><b>bold</b></div>");' }
      ],
      explanation: `
Тег бачить шаблон **до** склеювання, тому може екранувати лише дані. Так працюють lit-html, \`styled-components\`, \`gql\`, SQL-білдери з параметрами. Складність O(n) від довжини результату.

**Нюанс безпеки:** HTML-екранування не захищає в усіх контекстах — атрибут без лапок, \`href="javascript:..."\`, \`<script>\`, CSS потребують іншого кодування. У DOM краще \`textContent\`, для довіреного HTML — DOMPurify.

**Типові помилки:** забути \`&\`; \`undefined\` → \`'undefined'\`; ланцюжок \`.replace('<',…).replace('&',…)\` у неправильному порядку (подвійне екранування).

**Що спитають далі:** як реалізований \`String.raw\`? Як захиститися від XSS у React (\`dangerouslySetInnerHTML\`)?
`
    },

    // ------------------------------------------------------------------ 4. Collections
    {
      id: 'es-quiz-set-uniqueness',
      group: 'collections',
      type: 'quiz',
      level: 1,
      title: 'Що вважається дублікатом у Set',
      tags: ['set'],
      question: `
**Як це працює:** \`Set\` зберігає лише унікальні значення; \`set.has(x)\` — O(1). Порівняння майже як \`===\`, але \`NaN\` дорівнює \`NaN\`; об'єкти — за посиланням.
\`\`\`js
[...new Set(['a', 'b', 'a'])]; // ['a', 'b'] — прибрати дублікати
\`\`\`

Що виведе код?

\`\`\`js
const s = new Set([1, '1', 1, NaN, NaN, {}, {}]);
console.log(s.size);
\`\`\`
`,
      options: ['`3`', '`4`', '`5`', '`7`'],
      answer: 2,
      why: [
        'Два літерали `{}` — різні об\'єкти, Set порівнює їх за посиланням, а не за вмістом.',
        'Обидва `{}` залишаються окремими елементами, бо це два різні об\'єкти в пам\'яті.',
        'Правильно: `1`, `\'1\'`, один `NaN` і два різні `{}` — разом 5.',
        'Повторні `1` і `NaN` відкидаються: Set вважає `NaN` рівним `NaN`.'
      ],
      hint: 'Set порівнює майже як `===`, але з одним винятком для «нечислового числа». А як порівнюються об\'єкти?',
      explanation: `
Алгоритм SameValueZero: \`1\` і \`'1'\` — різні типи; \`NaN\` = \`NaN\`; об'єкти рівні лише якщо це те саме посилання. Для унікальності об'єктів за значенням використовують ключ (\`id\`) у \`Map\`.
`
    },
    {
      id: 'es-quiz-map-object-keys',
      group: 'collections',
      type: 'quiz',
      level: 2,
      title: 'Об\'єкти як ключі: Object vs Map',
      tags: ['map', 'collections'],
      question: `
**Як це працює:** ключі звичайного об'єкта — лише рядки й символи (інше приводиться до рядка). \`Map\` приймає ключі **будь-якого** типу і зберігає їх як є: \`map.set(key, v)\`, \`map.get(key)\`, \`map.size\`.

Що виведе код?

\`\`\`js
const a = {};
const b = {};

const obj = {};
obj[a] = 1;
obj[b] = 2;

const map = new Map();
map.set(a, 1);
map.set(b, 2);

console.log(obj[a], map.get(a), map.size, Object.keys(obj).length);
\`\`\`
`,
      options: ['`1 1 2 2`', '`2 1 2 1`', '`2 2 2 1`', '`undefined 1 2 0`'],
      answer: 1,
      why: [
        'Обидва об\'єкти стають одним рядком `\'[object Object]\'`, тож у `obj` лише один ключ.',
        'Правильно: в `obj` `b` перезаписав той самий ключ `\'[object Object]\'`, а Map тримає `a` і `b` як два різні ключі.',
        'Map порівнює ключі за посиланням, тому `map.get(a)` повертає саме `1`.',
        'Запис у `obj` відбувся — під рядковим ключем `\'[object Object]\'`, тому `obj[a]` знаходить `2`.'
      ],
      hint: 'На що перетворюється об\'єкт, коли стає ключем звичайного об\'єкта?',
      explanation: `
\`obj[a]\` і \`obj[b]\` — це \`obj['[object Object]']\`. Тому для словників з ключами-об'єктами (DOM-вузли, екземпляри) потрібен \`Map\`. Пастка: \`map[key] = v\` — це не запис у Map, а звичайна властивість об'єкта Map.
`
    },
    {
      id: 'es-map-set-theory',
      group: 'collections',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Map vs Object, Set',
      tags: ['map', 'set', 'collections'],
      question: 'Чим Map відрізняється від звичайного об\'єкта? Коли що використовувати? Що таке Set і як він порівнює значення?',
      choices: [
        '`Map` приймає ключі будь-якого типу й зберігає порядок вставки, а `Set` порівнює за SameValueZero',
        '`Map` — обгортка над `Object`, тож ключ-об\'єкт приводиться до рядка `\'[object Object]\'`',
        '`Set` порівнює об\'єкти за вмістом, тож два однакові літерали `{}` дадуть один елемент',
        '`map[key] = value` рівнозначне `map.set(key, value)`, а `map.size` рахується за O(n)'
      ],
      correct: 0,
      why: [
        'Правильно: ключі Map — будь-які значення в порядку вставки; Set вважає `NaN` рівним `NaN`, а об\'єкти порівнює за посиланням.',
        'Хибно: Map зберігає ключі як є, саме тому ключі-об\'єкти в ньому не злипаються.',
        'Хибно: об\'єкти порівнюються за посиланням, два `{}` — два елементи.',
        'Хибно: `map[key]` створює властивість об\'єкта, а не запис; `size` — O(1).'
      ],
      answer: `
| | \`Object\` | \`Map\` |
|---|---|---|
| Ключі | рядки/символи | будь-які |
| Порядок | цілі числа за зростанням, далі вставка | вставка |
| Розмір | \`Object.keys(o).length\` — O(n) | \`size\` — O(1) |
| Перебір | \`Object.entries\` | \`for (const [k, v] of map)\` |
| JSON | так | \`Object.fromEntries(map)\` |

- **Object** — записи з фіксованими полями, JSON, деструктуризація.
- **Map** — словники з динамічними ключами, ключі-об'єкти, часті add/delete, кеші.
- **Set** — унікальні значення (SameValueZero); \`has\` O(1) замість \`includes\` O(n).
- ES2025: \`a.union(b)\`, \`intersection\`, \`difference\`, \`isSubsetOf\`…
`,
      keyPoints: [
        'Map: будь-які ключі, порядок вставки, size за O(1), ітерабельний',
        'Object — для структур і JSON; Map — для словників з динамічними ключами',
        'Set — унікальні значення, SameValueZero (NaN = NaN, об\'єкти за посиланням)',
        'has у Set/Map — O(1) проти includes — O(n)'
      ],
      followUps: [
        'Як серіалізувати Map у JSON?',
        'Як знайти перетин двох масивів за лінійний час?'
      ]
    },
    {
      id: 'es-set-operations',
      group: 'collections',
      type: 'code',
      level: 2,
      title: 'Права доступу: операції над Set',
      tags: ['set', 'collections'],
      description: `
**Завдання.** Напишіть операції над множинами для системи прав доступу, **без** нативних \`a.union(b)\` тощо (є лише в нових середовищах).

**Де трапляється:** перевірка прав (\`isSubsetOf(required, userPermissions)\`), «що додали / що прибрали» у вибраних фільтрах, спільні теги; на співбесіді — «перетин двох масивів за O(n + m)».

**Що написати** (усі повертають **новий** \`Set\`, крім останньої)
- \`union(a, b)\` — усі елементи обох
- \`intersection(a, b)\` — спільні
- \`difference(a, b)\` — є в \`a\`, немає в \`b\`
- \`symmetricDifference(a, b)\` — є лише в одній з множин
- \`isSubsetOf(a, b)\` → \`true\`/\`false\`: чи всі елементи \`a\` є в \`b\`

**Приклад**
\`\`\`js
const user = new Set(['read', 'write']);
const required = new Set(['read', 'delete']);
isSubsetOf(required, user);    // false
difference(required, user);    // Set {'delete'} — чого бракує
\`\`\`

**Як це працює:** \`new Set(iterable)\` сам прибирає дублікати, а \`b.has(x)\` — O(1). Тож перетин — \`[...a].filter(x => b.has(x))\` за O(|a|).

**Врахуйте:** не змінювати \`a\` і \`b\`; порядок — спочатку елементи \`a\`, потім \`b\`; \`NaN\` і об'єкти — як у Set (за посиланням).
`,
      starter: `function union(a, b) {
  // TODO: new Set з елементів обох
}

function intersection(a, b) {
  // TODO: елементи a, для яких b.has(x)
}

function difference(a, b) {
  // TODO: елементи a, яких немає в b
}

function symmetricDifference(a, b) {
  // TODO: difference в обидва боки
}

function isSubsetOf(a, b) {
  // TODO: false на першому елементі a, якого немає в b
}

// Спробуйте в консолі:
// isSubsetOf(new Set(['read']), new Set(['read', 'write'])); // true
`,
      solution: `function union(a, b) {
  return new Set([...a, ...b]);
}

function intersection(a, b) {
  return new Set([...a].filter((x) => b.has(x)));
}

function difference(a, b) {
  return new Set([...a].filter((x) => !b.has(x)));
}

function symmetricDifference(a, b) {
  return new Set([...difference(a, b), ...difference(b, a)]);
}

function isSubsetOf(a, b) {
  if (a.size > b.size) return false; // швидкий вихід
  for (const x of a) {
    if (!b.has(x)) return false;
  }
  return true;
}
`,
      hints: [
        'Об\'єднання: `new Set([...a, ...b])` — дублікати зникнуть самі.',
        'Перетин і різниця: `[...a].filter(x => b.has(x))` / `!b.has(x)`, результат загорнути в `new Set`.',
        'Симетрична різниця = `difference(a, b)` + `difference(b, a)`.'
      ],
      tests: [
        { name: 'union', code: 'expect(union(new Set([1, 2]), new Set([2, 3]))).toEqual(new Set([1, 2, 3]));\nexpect([...union(new Set([3, 1]), new Set([2, 1]))]).toEqual([3, 1, 2]);' },
        { name: 'intersection і difference', code: 'const a = new Set([1, 2, 3, 4]), b = new Set([3, 4, 5]);\nexpect(intersection(a, b)).toEqual(new Set([3, 4]));\nexpect(difference(a, b)).toEqual(new Set([1, 2]));\nexpect(difference(b, a)).toEqual(new Set([5]));' },
        { name: 'symmetricDifference', code: 'expect([...symmetricDifference(new Set([1, 2, 3]), new Set([3, 4]))]).toEqual([1, 2, 4]);' },
        { name: 'isSubsetOf', code: 'expect(isSubsetOf(new Set([1, 2]), new Set([1, 2, 3]))).toBe(true);\nexpect(isSubsetOf(new Set([1, 4]), new Set([1, 2, 3]))).toBe(false);\nexpect(isSubsetOf(new Set(), new Set([1]))).toBe(true);' },
        { name: 'не мутує вхідні й повертає нові Set', code: 'const a = new Set([1, 2]), b = new Set([2, 3]);\nconst u = union(a, b);\nexpect(u).not.toBe(a);\nexpect(a).toEqual(new Set([1, 2]));\nexpect(b).toEqual(new Set([2, 3]));\nexpect(intersection(a, b)).toBeInstanceOf(Set);' },
        { name: 'працює без нативних методів ES2025', code: 'const names = ["union", "intersection", "difference", "symmetricDifference", "isSubsetOf"];\nconst saved = {};\nnames.forEach((n) => { saved[n] = Set.prototype[n]; delete Set.prototype[n]; });\ntry {\n  const a = new Set([1, 2, 3]), b = new Set([2, 3, 4]);\n  expect(union(a, b)).toEqual(new Set([1, 2, 3, 4]));\n  expect(intersection(a, b)).toEqual(new Set([2, 3]));\n  expect(symmetricDifference(a, b)).toEqual(new Set([1, 4]));\n  expect(isSubsetOf(new Set([2]), a)).toBe(true);\n} finally {\n  names.forEach((n) => { if (saved[n]) Set.prototype[n] = saved[n]; });\n}' },
        { name: 'NaN і об\'єкти (SameValueZero)', code: 'const o = {};\nexpect(intersection(new Set([NaN, o, {}]), new Set([NaN, o]))).toEqual(new Set([NaN, o]));\nexpect(intersection(new Set([NaN, o, {}]), new Set([NaN, o])).size).toBe(2);' }
      ],
      explanation: `
Усе тримається на двох фактах: конструктор \`Set\` прибирає дублікати, \`has\` — O(1). Тому кожна операція O(|a| + |b|), а \`isSubsetOf\` виходить рано.

**Типова помилка:** \`[...a].filter(x => [...b].includes(x))\` — O(n·m).

**Що спитають далі:** перетин двох масивів об'єктів за полем \`id\`; як перевірити рівність двох множин.
`
    },
    {
      id: 'es-weak-theory',
      group: 'collections',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'WeakMap, WeakSet, WeakRef',
      tags: ['weakmap', 'memory', 'gc'],
      question: `
**Як це працює:** \`WeakMap\` — як Map, але ключі лише об'єкти і тримаються **слабко**: коли на об'єкт-ключ більше ніхто не посилається, збирач сміття (GC) видаляє і його, і запис.

Чим WeakMap відрізняється від Map і де його застосовують? Оберіть **усі** правильні твердження.
`,
      choices: [
        'Ключі `WeakMap` — лише об\'єкти (або незареєстровані символи), і запис зникає разом із ключем',
        '`WeakMap` не має `size` та ітерації, бо її вміст залежить від недетермінованого моменту GC',
        '`WeakMap` слабко тримає значення, тому значення може зникнути, поки ключ ще живий',
        'Кеш за об\'єктом у звичайному `Map` утримує ключі, поки живий сам `Map`, — це потенційний витік',
        '`FinalizationRegistry` гарантує виклик колбека одразу після того, як об\'єкт став недосяжним'
      ],
      correct: [0, 1, 3],
      why: [
        'Правильно: примітив не може «померти», тому ключами бувають лише об\'єкти, і запис живе стільки, скільки ключ.',
        'Правильно: результат перебору залежав би від того, чи встиг GC прибрати ключ, тому перебору й `size` немає.',
        'Хибно: слабкий лише ключ — значення живе, поки живий ключ.',
        'Правильно: Map тримає ключ сильним посиланням, тож видалений DOM-вузол чи старий стан не звільняться.',
        'Хибно: момент GC не визначений, колбек може спрацювати пізно або не спрацювати взагалі.'
      ],
      answer: `
- **WeakMap**: ключі — об'єкти, посилання слабке; лише \`get/set/has/delete\`, без \`size\` і перебору.
- **WeakSet**: «позначити» об'єкт (оброблено, відвідано).
- **Сценарії:** кеш обчислень за об'єктом; метадані DOM-вузлів; приватні дані об'єкта; \`visited\` при обході графа.
\`\`\`js
const nodeData = new WeakMap();
nodeData.set(element, { clicks: 0 }); // вузол видалили → дані зникнуть самі
\`\`\`
- Звичайний \`Map\` у цих сценаріях = витік пам'яті.
- **WeakRef** (\`ref.deref()\`) і **FinalizationRegistry** — лише для оптимізацій: момент GC не гарантований.
`,
      keyPoints: [
        'Ключі WeakMap — лише об\'єкти, посилання слабкі, запис зникає разом з ключем',
        'Немає size/ітерації, бо вміст залежить від недетермінованого GC',
        'Сценарії: кеші за об\'єктом, метадані DOM, visited у графах',
        'Map з об\'єктними ключами в тих самих сценаріях = витік пам\'яті'
      ],
      followUps: [
        'Чому у WeakMap немає clear()?',
        'Як знайти витік пам\'яті в DevTools?'
      ]
    },
    {
      id: 'es-weak-memo',
      group: 'collections',
      type: 'code',
      level: 3,
      title: 'Кеш обчислень за об\'єктом через WeakMap',
      tags: ['weakmap', 'memoization', 'memory'],
      description: `
**Завдання.** Напишіть \`memoizeByObject(fn)\`: повертає функцію, яка кешує результат \`fn(obj)\` **за посиланням** на об'єкт-аргумент.

**Де трапляється:** селектори стану (сума кошика, відфільтрований список) — новий стан = новий об'єкт, старий кеш має зникнути сам. Так працюють \`reselect\` і ідея \`useMemo\`.

**Що написати**
- \`memoizeByObject(fn)\` → функція \`(obj) => результат\`
  - той самий об'єкт → \`fn\` не викликається вдруге
  - інший об'єкт, навіть з таким самим вмістом → нове обчислення
  - примітив або \`null\` → \`TypeError\`

**Приклад**
\`\`\`js
const getTotal = memoizeByObject((items) => items.reduce((s, x) => s + x.price, 0));
getTotal(cart); getTotal(cart); // обчислення одне
getTotal([...cart]);            // новий масив → обчислюється знову
\`\`\`

**Як це працює:** \`WeakMap\` у замиканні: ключ — об'єкт, значення — результат. Коли об'єкт більше ніде не потрібен, GC прибирає і запис — кеш не росте безмежно (зі звичайним Map це був би витік).

**Врахуйте:** кешувати і \`undefined\` (перевіряйте \`cache.has\`, а не \`get\`); функції теж можуть бути ключами; у кожної мемоізованої функції — свій кеш.
`,
      starter: `function memoizeByObject(fn) {
  // 1. Кеш у замиканні: const cache = new WeakMap();

  return function (obj) {
    // 2. Примітив або null → throw new TypeError('...')
    //    (об'єкт: typeof obj === 'object' && obj !== null, або функція)
    // 3. cache.has(obj) → повернути cache.get(obj)
    // 4. Інакше: обчислити fn(obj), покласти в кеш, повернути
    // TODO
    return fn(obj);
  };
}

// Спробуйте в консолі:
// const len = memoizeByObject((arr) => { console.log('рахую'); return arr.length; });
// const data = [1, 2]; len(data); len(data); // 'рахую' лише раз
`,
      solution: `function memoizeByObject(fn) {
  const cache = new WeakMap(); // слабкі ключі — не тримаємо об'єкти в пам'яті

  return function (obj) {
    const isObject = (typeof obj === 'object' && obj !== null) || typeof obj === 'function';
    if (!isObject) throw new TypeError('memoizeByObject expects an object argument');

    // has, а не перевірка get() !== undefined — щоб кешувати і undefined
    if (cache.has(obj)) return cache.get(obj);

    const result = fn(obj);
    cache.set(obj, result);
    return result;
  };
}
`,
      hints: [
        '`WeakMap` створіть у зовнішній функції, поза поверненою — інакше кеш буде новим на кожен виклик.',
        'Перевіряйте наявність через `cache.has(obj)` — `if (cache.get(obj))` не кешує falsy-результати.',
        'Примітив як ключ `WeakMap` і так кине помилку, але явна перевірка дає зрозуміле повідомлення.'
      ],
      tests: [
        { name: 'той самий об\'єкт — одне обчислення', code: 'const fn = mockFn((arr) => arr.length);\nconst m = memoizeByObject(fn);\nconst data = [1, 2, 3];\nexpect(m(data)).toBe(3);\nexpect(m(data)).toBe(3);\nexpect(fn).toHaveBeenCalledTimes(1);' },
        { name: 'однаковий вміст, інший об\'єкт — нове обчислення', code: 'const fn = mockFn((o) => o.x);\nconst m = memoizeByObject(fn);\nm({ x: 1 }); m({ x: 1 });\nexpect(fn).toHaveBeenCalledTimes(2);' },
        { name: 'кешує undefined', code: 'const fn = mockFn(() => undefined);\nconst m = memoizeByObject(fn);\nconst o = {};\nm(o); m(o);\nexpect(fn).toHaveBeenCalledTimes(1);' },
        { name: 'примітиви і null → TypeError', code: 'const m = memoizeByObject((x) => x);\nexpect(() => m(1)).toThrow(TypeError);\nexpect(() => m("a")).toThrow(TypeError);\nexpect(() => m(null)).toThrow(TypeError);' },
        { name: 'функції як ключі дозволені', code: 'const fn = mockFn((f) => f.name);\nconst m = memoizeByObject(fn);\nfunction hello() {}\nexpect(m(hello)).toBe("hello");\nm(hello);\nexpect(fn).toHaveBeenCalledTimes(1);' },
        { name: 'у кожної мемоізованої функції свій кеш', code: 'const o = { v: 2 };\nconst double = memoizeByObject((x) => x.v * 2);\nconst triple = memoizeByObject((x) => x.v * 3);\nexpect(double(o)).toBe(4);\nexpect(triple(o)).toBe(6);' }
      ],
      explanation: `
Кеш живе рівно стільки, скільки об'єкт: при іммутабельних оновленнях новий стан — новий ключ, старий запис прибере GC. Звернення до кешу — O(1).

**Типові помилки:** \`if (cache.get(obj))\`; \`JSON.stringify(obj)\` як ключ (повільно, губить ідентичність); \`Map\` замість \`WeakMap\`.

**Що спитають далі:** як мемоізувати функцію з кількома аргументами-об'єктами (вкладені WeakMap)? Що буде, якщо об'єкт мутують після кешування?
`
    },

    // ------------------------------------------------------------------ 5. Symbol
    {
      id: 'es-quiz-symbol-facts',
      group: 'symbol',
      type: 'quiz',
      level: 2,
      title: 'Поведінка Symbol',
      tags: ['symbol'],
      question: `
**Як це працює:** \`Symbol('опис')\` створює **унікальне** значення-примітив; його використовують як ключ, що ні з чим не конфліктує:
\`\`\`js
const meta = Symbol('meta');
const product = { title: 'Чай', [meta]: { source: 'cache' } };
\`\`\`

Оберіть **усі** правильні твердження:
`,
      options: [
        '`Symbol(\'a\') === Symbol(\'a\')` → `true`',
        '`Symbol.for(\'a\') === Symbol.for(\'a\')` → `true`',
        '`JSON.stringify({ [Symbol(\'k\')]: 1, x: 2 })` → `\'{"x":2}\'`',
        '`Object.keys({ [Symbol(\'k\')]: 1 })` → `[]`',
        '`\'id: \' + Symbol(\'id\')` → `\'id: Symbol(id)\'`'
      ],
      answer: [1, 2, 3],
      why: [
        'Хибно: кожен виклик `Symbol()` дає новий символ, опис — лише підпис для дебагу.',
        'Правильно: `Symbol.for` бере символ з глобального реєстру за ключем, тож повертає той самий.',
        'Правильно: `JSON.stringify` ігнорує символьні ключі.',
        'Правильно: `Object.keys` повертає лише рядкові ключі; символи видно через `Object.getOwnPropertySymbols`.',
        'Хибно: неявне перетворення символу на рядок кидає `TypeError`; явно — `String(sym)` або `sym.description`.'
      ],
      hint: 'Подумайте про унікальність, глобальний реєстр і про те, що символ «не хоче» неявно ставати рядком.',
      explanation: `
Символьні ключі «напівприховані»: їх не видно в \`for...in\`, \`Object.keys\`, JSON, але вони **не приватні** (\`Reflect.ownKeys\` їх повертає). \`Symbol.for\` потрібен, коли той самий символ має бути спільним між модулями.
`
    },
    {
      id: 'es-symbol-theory',
      group: 'symbol',
      type: 'theory',
      level: 3,
      title: 'Symbol і well-known symbols',
      tags: ['symbol'],
      question: 'Що таке Symbol? Чим Symbol() відрізняється від Symbol.for()? Що таке well-known symbols? Оберіть **усі** правильні твердження.',
      choices: [
        '`Symbol(\'id\') === Symbol(\'id\')` дає `true`, бо символи з однаковим описом вважаються рівними',
        '`Symbol.for(\'id\')` повертає той самий символ з глобального реєстру навіть між модулями й iframe',
        'Символьні ключі не видно в `Object.keys` і `JSON.stringify`, але `Reflect.ownKeys` їх повертає',
        'Символьні ключі — повноцінно приватні поля: дістати їх ззовні об\'єкта неможливо',
        '`Symbol.iterator` і `Symbol.toPrimitive` налаштовують `for...of` і перетворення на примітив'
      ],
      correct: [1, 2, 4],
      why: [
        'Хибно: опис не впливає на рівність, кожен `Symbol()` унікальний.',
        'Правильно: глобальний реєстр спільний для всього середовища.',
        'Правильно: символи пропускаються звичайними API, але `Reflect.ownKeys`/`getOwnPropertySymbols` їх бачать.',
        'Хибно: символ можна дістати через `Object.getOwnPropertySymbols`, тож це не приватність.',
        'Правильно: це well-known symbols — «гачки», якими об\'єкт налаштовує поведінку мови.'
      ],
      answer: `
- **Symbol** — унікальний примітив; ключ без конфліктів. \`new Symbol()\` — \`TypeError\`.
- **\`Symbol.for(key)\`** — глобальний реєстр; \`Symbol.keyFor(sym)\` — ключ.
- Не видно в \`for...in\`, \`Object.keys\`, JSON; видно в \`Object.getOwnPropertySymbols\`, \`Reflect.ownKeys\`.
- **Well-known symbols:**

| Символ | Налаштовує |
|---|---|
| \`Symbol.iterator\` | \`for...of\`, spread, \`Array.from\` |
| \`Symbol.toPrimitive\` | перетворення на число/рядок |
| \`Symbol.toStringTag\` | \`[object Tag]\` |
| \`Symbol.hasInstance\` | \`instanceof\` |

- Практика: службові ключі в бібліотеках, React \`$$typeof: Symbol.for('react.element')\` (захист від XSS через JSON).
`,
      keyPoints: [
        'Symbol — унікальний примітив; опис не впливає на рівність',
        'Symbol.for — глобальний реєстр, однаковий символ за ключем',
        'Символьні ключі не видно в keys/for...in/JSON, але вони не приватні',
        'Well-known: iterator, toPrimitive, toStringTag, hasInstance'
      ],
      followUps: [
        'Як отримати всі ключі об\'єкта, включно з символами?',
        'Навіщо React використовує $$typeof із символом?'
      ]
    },
    {
      id: 'es-money-symbols',
      group: 'symbol',
      type: 'code',
      level: 3,
      title: 'Value Object Money: Symbol.toPrimitive і toStringTag',
      tags: ['symbol', 'value-object'],
      description: `
**Завдання.** Напишіть фабрику \`createMoney(amount, currency = 'UAH')\`, що повертає незмінний об'єкт грошей, який сам правильно поводиться в арифметиці та в рядках.

**Де трапляється:** ціни в інтернет-магазині: \`\${price}\` у шаблоні показує \`'100 UAH'\`, а \`price * qty\` рахує число.

**Що написати**
- \`createMoney(amount, currency)\` → заморожений об'єкт \`{ amount, currency }\`, у якого:
  - \`[Symbol.toPrimitive](hint)\`: \`hint === 'string'\` → \`'100 UAH'\`, інакше → число \`amount\`
  - \`[Symbol.toStringTag]\` → \`'Money'\` (стандартний опис типу стане \`'[object Money]'\`)

**Приклад**
\`\`\`js
const m = createMoney(100);
\`Ціна: \${m}\`;   // 'Ціна: 100 UAH'  (hint 'string')
m + 50;          // 150              (hint 'default')
m * 2; m > 50;   // 200, true        (hint 'number')
\`\`\`

**Як це працює:** коли об'єкт потрапляє в \`+\`, \`*\`, \`>\` чи шаблонний рядок, рушій викликає \`obj[Symbol.toPrimitive](hint)\` і передає підказку: \`'string'\`, \`'number'\` або \`'default'\` (бінарний \`+\`, \`==\`).

**Врахуйте:** рядок — лише для \`'string'\` (інакше \`m + 1\` дасть \`'100 UAH1'\`); об'єкт заморозити (\`Object.freeze\`).
`,
      starter: `function createMoney(amount, currency = 'UAH') {
  return {
    amount,
    currency,
    // 1. TODO: [Symbol.toPrimitive](hint) { ... }
    //    'string' → amount + ' ' + currency; інакше → amount
    // 2. TODO: [Symbol.toStringTag]: 'Money'
  };
  // 3. TODO: поверніть об'єкт через Object.freeze(...)
}

// Спробуйте в консолі:
// const m = createMoney(100); \`Ціна: \${m}\`; m + 50;
`,
      solution: `function createMoney(amount, currency = 'UAH') {
  return Object.freeze({
    amount,
    currency,
    // hint: 'string' | 'number' | 'default'
    [Symbol.toPrimitive](hint) {
      return hint === 'string' ? amount + ' ' + currency : amount;
    },
    [Symbol.toStringTag]: 'Money',
  });
}
`,
      hints: [
        'Обчислюване ім\'я методу в літералі: `[Symbol.toPrimitive](hint) { ... }`.',
        '`amount` і `currency` доступні з замикання — повертайте рядок лише при `hint === \'string\'`.',
        '`toStringTag` — звичайна властивість-рядок: `[Symbol.toStringTag]: \'Money\'`.'
      ],
      tests: [
        { name: 'числовий контекст', code: 'const m = createMoney(100);\nexpect(+m).toBe(100);\nexpect(m * 2).toBe(200);\nexpect(m > 50).toBe(true);' },
        { name: 'default hint (+) → число', code: 'expect(createMoney(100) + 1).toBe(101);' },
        { name: 'рядковий контекст', code: 'const m = createMoney(100);\nexpect(String(m)).toBe("100 UAH");\nexpect(`Ціна: ${m}`).toBe("Ціна: 100 UAH");\nexpect(String(createMoney(5, "USD"))).toBe("5 USD");' },
        { name: 'toStringTag', code: 'expect(Object.prototype.toString.call(createMoney(1))).toBe("[object Money]");' },
        { name: 'поля доступні і об\'єкт незмінний', code: 'const m = createMoney(7, "EUR");\nexpect(m.amount).toBe(7);\nexpect(m.currency).toBe("EUR");\nexpect(Object.isFrozen(m)).toBe(true);' }
      ],
      explanation: `
\`Symbol.toPrimitive\` має пріоритет над \`valueOf\`/\`toString\`. Нюанс: \`m + ''\` дає \`'100'\`, бо hint \`'default'\`. \`Symbol.toStringTag\` використовують бібліотеки для визначення типу (\`[object Map]\`, \`[object Date]\`).

**Типова помилка:** повертати рядок і для \`'default'\`.

**Що спитають далі:** у якому порядку викликаються \`valueOf\` і \`toString\` без \`toPrimitive\`? Чому гроші краще зберігати в копійках (цілих), а не float?
`
    },

    // ------------------------------------------------------------------ 6. Iteration protocols
    {
      id: 'es-iterators-theory',
      group: 'iterators',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Протоколи iterable та iterator',
      tags: ['iterators', 'symbol'],
      question: `
**Як це працює:** об'єкт **ітерабельний**, якщо має метод \`[Symbol.iterator]()\`, що повертає **ітератор** — об'єкт з \`next()\` → \`{ value, done }\`:
\`\`\`js
const twoItems = {
  [Symbol.iterator]() {
    let i = 0;
    return { next: () => (i < 2 ? { value: i++, done: false } : { value: undefined, done: true }) };
  },
};
[...twoItems]; // [0, 1]
\`\`\`

Як працює \`for...of\` під капотом? Чому звичайний об'єкт не можна перебрати через \`for...of\`?
`,
      choices: [
        '`for...of` перебирає перелічувані ключі об\'єкта, тому працює з будь-яким звичайним об\'єктом',
        'Ітератор — це масив з методом `next()`, а ітерабельний об\'єкт — будь-який об\'єкт із `length`',
        '`{ 0: \'a\', length: 1 }` ітерабельний, тому `[...obj]` і `for...of` над ним працюють без помилок',
        '`for...of` викликає `obj[Symbol.iterator]()` і повторює `next()`, доки не отримає `done: true`'
      ],
      correct: 3,
      why: [
        'Хибно: ключі перебирає `for...in`; `for...of` над звичайним об\'єктом кидає `TypeError: not iterable`.',
        'Хибно: ітератор — будь-який об\'єкт з `next()`, а ітерабельність визначає `Symbol.iterator`, не `length`.',
        'Хибно: це array-like без `Symbol.iterator` — `Array.from` з ним працює, а spread кидає `TypeError`.',
        'Правильно: це і є протокол; при `break` додатково викликається `iterator.return?.()`.'
      ],
      answer: `
- **iterable** — має \`[Symbol.iterator]()\`, що повертає **iterator**; iterator — \`next()\` → \`{ value, done }\`, опційно \`return()\`.
- **\`for...of\`:** \`it = obj[Symbol.iterator]()\` → \`it.next()\` до \`done: true\`; при \`break\`/помилці — \`it.return?.()\`.
- **Протокол використовують:** spread, деструктуризація масиву, \`Array.from\`, \`new Map/Set(iterable)\`, \`yield*\`.
- **Вбудовані ітерабельні:** Array, String (по символах Unicode), Map, Set, NodeList, генератори. Звичайний об'єкт — ні → \`Object.entries(obj)\`.
- **Array-like ≠ iterable:** \`{ 0: 'a', length: 1 }\` — \`Array.from\` так, spread ні.
- Стан тримайте в ітераторі, а не в об'єкті — тоді перебирати можна багато разів.
`,
      keyPoints: [
        'iterable має [Symbol.iterator](), що повертає iterator з next() → { value, done }',
        'for...of, spread, деструктуризація, Array.from, Map/Set працюють через протокол',
        'Звичайний об\'єкт не ітерабельний — Object.entries або власний Symbol.iterator',
        'return() викликається при break — для звільнення ресурсів',
        'Array-like ≠ iterable'
      ],
      followUps: [
        'Чим iterable відрізняється від array-like?',
        'Як зробити об\'єкт, який можна перебирати кілька разів?'
      ]
    },
    {
      id: 'es-range-iterable',
      group: 'iterators',
      type: 'code',
      level: 2,
      title: 'range(start, end, step) — ітерабельний діапазон',
      tags: ['iterators', 'symbol'],
      description: `
**Завдання.** Реалізуйте \`range(start, end, step = 1)\`, що повертає **ітерабельний об'єкт** (не масив!) з числами від \`start\` (включно) до \`end\` (не включно).

**Де трапляється:** класика співбесід на протокол ітерації; на практиці — номери сторінок пагінації \`range(1, total + 1)\`, слоти часу в календарі.

**Що написати**
- \`range(start, end, step = 1)\` → об'єкт з методом \`[Symbol.iterator]()\`

**Приклад**
\`\`\`js
[...range(0, 5)];        // [0, 1, 2, 3, 4]
[...range(5, 0, -2)];    // [5, 3, 1]
for (const x of range(0, Infinity, 5)) { if (x > 10) break; } // не зависає
\`\`\`

**Як це працює:** \`[Symbol.iterator]()\` викликається на початку кожного \`for...of\`/spread. Якщо щоразу створювати новий ітератор зі своїм лічильником, діапазон можна перебирати багато разів, а числа рахуються на вимогу — масив не будується.

**Врахуйте:** від'ємний крок рахує вниз; \`step === 0\` → \`RangeError\` одразу при виклику \`range\`; порожній діапазон \`range(5, 5)\`.
`,
      starter: `function range(start, end, step = 1) {
  // 1. step === 0 → throw new RangeError('...')

  return {
    [Symbol.iterator]() {
      // 2. Лічильник тут — новий для кожного перебору: let current = start;
      return {
        next() {
          // 3. Чи ще в межах? step > 0 ? current < end : current > end
          // 4. Так → { value: current, done: false } і зсунути current;
          //    ні → { value: undefined, done: true }
          // TODO
          return { value: undefined, done: true };
        },
      };
    },
  };
}

// Спробуйте в консолі:
// [...range(0, 10, 3)]; // [0, 3, 6, 9]
`,
      solution: `function range(start, end, step = 1) {
  if (step === 0) throw new RangeError('step must not be 0');

  return {
    [Symbol.iterator]() {
      // стан — у кожному новому ітераторі, тому діапазон можна перебирати багато разів
      let current = start;
      return {
        next() {
          const inRange = step > 0 ? current < end : current > end;
          if (!inRange) return { value: undefined, done: true };
          const value = current;
          current += step;
          return { value, done: false };
        },
      };
    },
  };
}
`,
      hints: [
        'Лічильник оголошуйте всередині `[Symbol.iterator]()`, а не в `range` — інакше другий перебір буде порожнім.',
        'Умова продовження залежить від знаку кроку: `step > 0 ? current < end : current > end`.',
        'Спочатку збережіть `value = current`, потім `current += step`, і поверніть `{ value, done: false }`.'
      ],
      tests: [
        { name: 'базовий діапазон', code: 'expect([...range(0, 5)]).toEqual([0, 1, 2, 3, 4]);' },
        { name: 'крок і від\'ємний крок', code: 'expect([...range(0, 10, 3)]).toEqual([0, 3, 6, 9]);\nexpect([...range(5, 0, -2)]).toEqual([5, 3, 1]);' },
        { name: 'порожній діапазон', code: 'expect([...range(5, 5)]).toEqual([]);\nexpect([...range(5, 0)]).toEqual([]);' },
        { name: 'не масив, але ітерабельний і багаторазовий', code: 'const r = range(1, 4);\nexpect(Array.isArray(r)).toBe(false);\nexpect(typeof r[Symbol.iterator]).toBe("function");\nexpect([...r]).toEqual([1, 2, 3]);\nexpect([...r]).toEqual([1, 2, 3]);' },
        { name: 'лінивий: працює з Infinity', code: 'const out = [];\nfor (const x of range(0, Infinity, 5)) { if (x > 20) break; out.push(x); }\nexpect(out).toEqual([0, 5, 10, 15, 20]);' },
        { name: 'step 0 → RangeError', code: 'expect(() => range(0, 5, 0)).toThrow(RangeError);' }
      ],
      explanation: `
Ключ — розділити iterable («опис» діапазону) і iterator (поточний стан перебору). Пам'ять O(1), кожен \`next()\` — O(1).

**Коротше на генераторі** (наступний крок): \`*[Symbol.iterator]() { for (let i = start; step > 0 ? i < end : i > end; i += step) yield i; }\`.

**Типові помилки:** стан у самому об'єкті (другий \`for...of\` порожній); будувати масив (зависання на \`Infinity\`).

**Що спитають далі:** зробити ітерабельним зв'язний список або дерево; похибка накопичення з кроком \`0.1\`.
`
    },

    // ------------------------------------------------------------------ 7. Generators
    {
      id: 'es-quiz-generator-next-value',
      group: 'generators',
      type: 'quiz',
      level: 2,
      title: 'Генератор: next(value)',
      tags: ['generators'],
      question: `
**Як це працює:** виклик \`function*\` не виконує тіло, а повертає генератор. Кожен \`next()\` виконує код до наступного \`yield\` і ставить на паузу. \`next(v)\` передає \`v\` усередину — воно стає **результатом того \`yield\`, на якому генератор стоїть**.

Що виведе код?

\`\`\`js
function* gen() {
  const x = yield 1;
  const y = yield x * 2;
  return x + y;
}

const g = gen();
console.log(g.next(5).value, g.next(10).value, g.next(3).value, g.next().done);
\`\`\`
`,
      options: ['`5 10 3 true`', '`1 10 13 true`', '`1 20 13 true`', '`1 2 13 false`'],
      answer: 2,
      why: [
        '`next()` повертає значення з `yield`, а не свій аргумент: перший виклик віддає `1`.',
        '`yield 1` повертає не `1`, а аргумент наступного `next(10)`, тож `x = 10` і `x * 2 = 20`.',
        'Правильно: `next(5)` ігнорує 5 і віддає 1; `next(10)` → `x = 10`, віддає 20; `next(3)` → `y = 3`, `return 13`; далі `done: true`.',
        'Аргумент першого `next(5)` ігнорується, тож `x` береться з `next(10)`; після `return` генератор завершений.'
      ],
      hint: 'На чому генератор зупинений до першого `next`? Чи є там `yield`, що чекає значення?',
      explanation: `
1. \`next(5)\` — старт до \`yield 1\`; аргумент нікому віддати → ігнор. → \`1\`
2. \`next(10)\` — \`x = 10\`, \`yield 20\`. → \`20\`
3. \`next(3)\` — \`y = 3\`, \`return 13\` → \`{ value: 13, done: true }\`
4. \`next()\` на завершеному → \`done: true\`.
`
    },
    {
      id: 'es-quiz-generator-return-spread',
      group: 'generators',
      type: 'quiz',
      level: 3,
      title: 'return у генераторі і повторний перебір',
      tags: ['generators', 'iterators'],
      question: `
Що виведе код?

\`\`\`js
function* gen() {
  yield 1;
  yield 2;
  return 3;
}

const g = gen();
console.log([...gen()], [...g, ...g]);
\`\`\`
`,
      options: ['`[1, 2, 3] [1, 2, 3, 1, 2, 3]`', '`[1, 2] [1, 2, 1, 2]`', '`[1, 2] [1, 2]`', '`[1, 2, 3] [1, 2, 3]`'],
      answer: 2,
      why: [
        'Значення `return` приходить з `done: true`, а spread його не бере; і генератор не перезапускається.',
        'Генератор одноразовий: після першого `...g` він вичерпаний, другий нічого не додає.',
        'Правильно: `return 3` не потрапляє у spread, а вичерпаний `g` вдруге віддає порожнечу.',
        'Spread зупиняється на `done: true` і не бере `3`.'
      ],
      hint: 'Що бачить spread, коли ітератор повертає `{ value: 3, done: true }`? І чи можна «перемотати» генератор на початок?',
      explanation: `
Генератор — одноразовий ітератор: його \`[Symbol.iterator]()\` повертає його ж. Щоб перебирати багато разів, викликайте \`gen()\` знову або зробіть об'єкт, що створює новий генератор у \`[Symbol.iterator]\`. Значення \`return\` видно лише через ручний \`next()\` або як результат \`yield*\`.
`
    },
    {
      id: 'es-generators-theory',
      group: 'generators',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Генератори: yield, next, return',
      tags: ['generators'],
      question: 'Що таке генератори? Як працюють yield, yield*, next(value), return(), throw()? Де їх застосовують на практиці? Оберіть **усі** правильні твердження.',
      choices: [
        'Виклик `function*` не виконує тіло, а повертає генератор; код іде до чергового `yield` на кожен `next()`',
        'Значення, передане в перший `next(value)`, стає результатом першого `yield` у тілі генератора',
        'Значення з `return` у генераторі потрапляє у `for...of` як останній елемент перебору',
        '`break` у `for...of` над генератором викликає його `return()`, тож виконується блок `finally`',
        '`yield*` можна застосувати лише до іншого генератора, але не до масиву чи рядка'
      ],
      correct: [0, 3],
      why: [
        'Правильно: генератор — функція на паузі, тіло виконується порціями на кожен `next()`.',
        'Хибно: до першого `next` немає `yield`, що чекає значення, тому перший аргумент ігнорується.',
        'Хибно: `return`-значення приходить з `done: true`, а `for...of` на ньому зупиняється, не беручи його.',
        'Правильно: так генератор може звільнити ресурси при достроковому виході споживача.',
        'Хибно: `yield*` делегує будь-якому ітерабельному — масиву, рядку, Set.'
      ],
      answer: `
- \`function*\` повертає генератор (і iterator, і iterable); тіло — до \`yield\` на кожен \`next()\`.
- \`next(v)\` — \`v\` стає результатом поточного \`yield\`; перший аргумент ігнорується.
- \`return(v)\` — завершити (виконається \`finally\`); \`throw(err)\` — кинути помилку в точці \`yield\`.
- \`yield* iterable\` — делегувати (рекурсивні обходи дерев).
- \`return\`-значення не потрапляє у \`for...of\`/spread.
\`\`\`js
function* idGen() {
  let id = 1;
  while (true) {
    const reset = yield id++;
    if (reset) id = 1;
  }
}
\`\`\`
- **Практика:** ліниві/нескінченні послідовності, обходи дерев, батчинг, redux-saga.
`,
      keyPoints: [
        'Виклик function* повертає генератор; тіло виконується до yield на кожен next()',
        'next(value) передає значення в yield; перший next — без значення',
        'return()/throw() керують генератором ззовні; finally виконується',
        'yield* делегує іншому iterable; return-значення не видно у for...of'
      ],
      followUps: [
        'Що станеться з генератором після break у for...of?',
        'Чим генератор відрізняється від функції, що повертає масив?'
      ]
    },
    {
      id: 'es-fibonacci-generator',
      group: 'generators',
      type: 'code',
      level: 2,
      title: 'Нескінченний генератор Фібоначчі з reset',
      tags: ['generators'],
      description: `
**Завдання.** Напишіть генераторну функцію \`fibonacci()\`, яка нескінченно віддає \`0, 1, 1, 2, 3, 5, 8, …\`, а \`next(true)\` починає послідовність спочатку.

**Де трапляється:** класика співбесід на генератори та двосторонній обмін через \`next(value)\`.

**Що написати**
- \`function* fibonacci()\` → генератор
  - \`g.next().value\` — наступне число
  - \`g.next(true).value\` → \`0\` (скидання)

**Приклад**
\`\`\`js
const g = fibonacci();
g.next().value;     // 0
g.next().value;     // 1
g.next().value;     // 1
g.next(true).value; // 0 — reset
g.next().value;     // 1
\`\`\`

**Як це працює:** \`while (true)\` не зависає — генератор зупиняється на кожному \`yield\`. Вираз \`const reset = yield a\` віддає \`a\` назовні, а коли прийде наступний \`next(value)\`, \`reset\` отримає це значення.

**Врахуйте:** різні виклики \`fibonacci()\` незалежні; генератор ніколи не повертає \`done: true\`.
`,
      starter: `function* fibonacci() {
  // 1. Два останні числа: let a = 0, b = 1;
  // 2. while (true) { ... }
  // 3. const reset = yield a;   ← сюди прийде значення з next(value)
  // 4. reset → a = 0, b = 1; інакше зсув [a, b] = [b, a + b]
  // TODO
}

// Спробуйте в консолі:
// const g = fibonacci(); g.next().value; g.next().value; g.next(true).value;
`,
      solution: `function* fibonacci() {
  let a = 0;
  let b = 1;
  while (true) {
    const reset = yield a; // значення з next(value)
    if (reset) {
      a = 0;
      b = 1;
    } else {
      [a, b] = [b, a + b]; // swap через деструктуризацію
    }
  }
}
`,
      hints: [
        'Нескінченний генератор — `while (true)` з `yield` всередині.',
        'Зберігайте два останні числа і зсувайте їх: `[a, b] = [b, a + b]`.',
        'Результат виразу `yield a` — аргумент наступного `next()`; якщо він truthy — скиньте `a` і `b`.'
      ],
      tests: [
        { name: 'перші 10 чисел', code: 'const g = fibonacci();\nconst out = [];\nfor (let i = 0; i < 10; i++) out.push(g.next().value);\nexpect(out).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);' },
        { name: 'нескінченний (done завжди false)', code: 'const g = fibonacci();\nlet last;\nfor (let i = 0; i < 1000; i++) last = g.next();\nexpect(last.done).toBe(false);' },
        { name: 'reset через next(true)', code: 'const g = fibonacci();\ng.next(); g.next(); g.next(); g.next();\nexpect(g.next(true).value).toBe(0);\nexpect(g.next().value).toBe(1);\nexpect(g.next().value).toBe(1);\nexpect(g.next().value).toBe(2);' },
        { name: 'працює з for...of і break', code: 'const out = [];\nfor (const n of fibonacci()) { if (n > 50) break; out.push(n); }\nexpect(out).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);' },
        { name: 'незалежні генератори', code: 'const a = fibonacci(), b = fibonacci();\na.next(); a.next(); a.next();\nexpect(b.next().value).toBe(0);' }
      ],
      explanation: `
Генератор зберігає локальні змінні між \`next()\` — це «функція на паузі». O(1) на крок і пам'яті. Після 78-го числа перевищується \`Number.MAX_SAFE_INTEGER\` — тоді \`BigInt\` (\`0n, 1n\`).

**Типові помилки:** \`a = b; b = a + b\` без тимчасової змінної; перевіряти reset до \`yield\`.

**Що спитають далі:** як узяти перші n значень без ручного \`next()\` (\`take\`)?
`
    },
    {
      id: 'es-flatten-generator',
      group: 'generators',
      type: 'code',
      level: 2,
      title: 'flatten через yield*: дерево коментарів у список',
      tags: ['generators', 'recursion'],
      description: `
**Завдання.** Напишіть генераторну функцію \`flatten(arr, depth = Infinity)\`, яка **ліниво** віддає елементи вкладених масивів, розгортаючи не глибше ніж \`depth\` рівнів (як вбудований \`arr.flat(depth)\`).

**Де трапляється:** поліфіл \`flat\` — класика співбесід; на практиці — вкладені меню, гілки коментарів, групи товарів у плоский список.

**Що написати**
- \`function* flatten(arr, depth = Infinity)\` → генератор елементів

**Приклад**
\`\`\`js
[...flatten([1, [2, [3, [4]]]])];    // [1, 2, 3, 4]
[...flatten([1, [2, [3, [4]]]], 1)]; // [1, 2, [3, [4]]]
\`\`\`

**Як це працює:** \`yield* other\` віддає назовні **всі** значення іншого ітерабельного по одному — ніби \`for (const x of other) yield x\`. Тому рекурсія виглядає як \`yield* flatten(item, depth - 1)\`.

**Врахуйте:** розгортати лише справжні масиви (\`Array.isArray\`), рядки й об'єкти — ні; порожні масиви зникають; \`depth = 0\` — без змін.
`,
      starter: `function* flatten(arr, depth = Infinity) {
  // 1. for...of по arr
  // 2. Масив і depth > 0 → yield* flatten(item, depth - 1)
  // 3. Інакше → yield item
  // TODO
}

// Спробуйте в консолі:
// [...flatten([1, [2, [3]]], 1)]; // [1, 2, [3]]
`,
      solution: `function* flatten(arr, depth = Infinity) {
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      yield* flatten(item, depth - 1); // делегуємо рекурсивному генератору
    } else {
      yield item;
    }
  }
}
`,
      hints: [
        'Якщо елемент — масив і глибина дозволяє, треба віддати **всі** його розгорнуті елементи.',
        '`yield* flatten(item, depth - 1)` — саме зірочка: без неї назовні піде сам об\'єкт-генератор.'
      ],
      tests: [
        { name: 'повне розгортання', code: 'expect([...flatten([1, [2, [3, [4, [5]]]]])]).toEqual([1, 2, 3, 4, 5]);' },
        { name: 'обмеження глибини', code: 'const a = [1, [2, [3, [4]]]];\nexpect([...flatten(a, 1)]).toEqual([1, 2, [3, [4]]]);\nexpect([...flatten(a, 0)]).toEqual(a);' },
        { name: 'рядки й об\'єкти не розгортаються', code: 'const o = { x: 1 };\nexpect([...flatten(["ab", [o, ["cd"]]])]).toEqual(["ab", o, "cd"]);' },
        { name: 'порожні масиви зникають', code: 'expect([...flatten([[], [[]], 1, [[], 2]])]).toEqual([1, 2]);' },
        { name: 'лінивий: повертає генератор', code: 'const g = flatten([1, [2, 3]]);\nexpect(typeof g.next).toBe("function");\nexpect(g.next()).toEqual({ value: 1, done: false });' }
      ],
      explanation: `
Рекурсія з \`yield*\` — природний спосіб обходити дерева. O(n) елементів, але елемент на глибині d проходить d рівнів делегування. Дуже глибокі структури — ітеративно з явним стеком.

**Типові помилки:** \`yield flatten(...)\` без зірочки; розгортання рядків (рядок ітерабельний → нескінченна рекурсія на односимвольних рядках).

**Що спитають далі:** ітеративна версія зі стеком; обхід DOM-дерева генератором.
`
    },
    {
      id: 'es-chunk-generator',
      group: 'generators',
      type: 'code',
      level: 2,
      title: 'chunk(iterable, size): відправка подій пачками',
      tags: ['generators', 'lazy', 'batching'],
      description: `
**Завдання.** Напишіть генераторну функцію \`chunk(iterable, size)\`, яка ліниво ділить будь-яке ітерабельне на пачки (масиви) по \`size\` елементів.

**Де трапляється:** аналітику шлють пачками по 50 подій; bulk-API приймає до 100 id за запит; великий список рендерять порціями.

**Що написати**
- \`function* chunk(iterable, size)\` → генератор масивів; остання пачка може бути меншою

**Приклад**
\`\`\`js
[...chunk([1, 2, 3, 4, 5], 2)]; // [[1, 2], [3, 4], [5]]
[...chunk('abc', 2)];           // [['a', 'b'], ['c']]
\`\`\`

**Як це працює:** \`for...of\` бере з джерела по одному елементу; щойно пачка набрала \`size\` — \`yield\` і пауза. Тому з нескінченного джерела читається рівно стільки, скільки потрібно споживачу.

**Врахуйте:**
- \`size < 1\` → \`RangeError\` (тіло генератора стартує лише на першому \`next()\` — тоді й помилка);
- після \`yield\` починайте **новий** масив — уже віддані пачки не мають змінюватися;
- порожнє джерело → жодної пачки.
`,
      starter: `function* chunk(iterable, size) {
  // 1. size < 1 → throw new RangeError('...')
  // 2. let batch = [];
  // 3. for...of: batch.push(item); коли batch.length === size —
  //    yield batch і batch = [] (новий масив, не batch.length = 0!)
  // 4. Після циклу: якщо batch не порожній — yield batch
  // TODO
}

// Спробуйте в консолі:
// [...chunk([1, 2, 3, 4, 5], 2)]; // [[1, 2], [3, 4], [5]]
`,
      solution: `function* chunk(iterable, size) {
  if (!(size >= 1)) throw new RangeError('size must be >= 1');
  let batch = [];
  for (const item of iterable) {
    batch.push(item);
    if (batch.length === size) {
      yield batch;
      batch = []; // новий масив — віддану пачку не чіпаємо
    }
  }
  if (batch.length > 0) yield batch; // хвіст
}
`,
      hints: [
        'Накопичуйте елементи в масиві й робіть `yield`, коли довжина досягла `size`.',
        'Після `yield batch` присвойте `batch = []` — `batch.length = 0` зіпсує вже віддану пачку.',
        'Не забудьте неповну пачку після циклу.'
      ],
      tests: [
        { name: 'ділить на пачки, остання менша', code: 'expect([...chunk([1, 2, 3, 4, 5], 2)]).toEqual([[1, 2], [3, 4], [5]]);\nexpect([...chunk([1, 2, 3, 4], 2)]).toEqual([[1, 2], [3, 4]]);' },
        { name: 'порожнє джерело → нічого', code: 'expect([...chunk([], 3)]).toEqual([]);' },
        { name: 'будь-яке ітерабельне: Set і рядок', code: 'expect([...chunk(new Set([1, 2, 3]), 2)]).toEqual([[1, 2], [3]]);\nexpect([...chunk("abcde", 2)]).toEqual([["a", "b"], ["c", "d"], ["e"]]);' },
        { name: 'лінивий: працює з нескінченним джерелом', code: 'function* naturals() { let n = 0; while (true) yield n++; }\nconst g = chunk(naturals(), 3);\nexpect(g.next().value).toEqual([0, 1, 2]);\nexpect(g.next().value).toEqual([3, 4, 5]);' },
        { name: 'не читає джерело наперед', code: 'let pulled = 0;\nfunction* src() { while (true) { pulled++; yield pulled; } }\nconst g = chunk(src(), 2);\ng.next();\nexpect(pulled).toBe(2);' },
        { name: 'віддані пачки не змінюються', code: 'const g = chunk([1, 2, 3, 4], 2);\nconst first = g.next().value;\ng.next();\nexpect(first).toEqual([1, 2]);' },
        { name: 'size < 1 → RangeError на першому next()', code: 'expect(() => chunk([1], 0).next()).toThrow(RangeError);' }
      ],
      explanation: `
Генератор робить батчинг лінивим: O(size) пам'яті, джерело читається на вимогу. Той самий код працює з масивом, Set, рядком чи нескінченним потоком.

**Нюанс:** перевірка аргументів у генераторній функції спрацьовує лише на першому \`next()\`. Щоб кидати одразу — звичайна функція-обгортка, що перевіряє і повертає генератор.

**Що спитають далі:** як відправити пачку ще й за таймаутом (раз на 5 с, навіть неповну)?
`
    },
    {
      id: 'es-lazy-pipeline',
      group: 'generators',
      type: 'code',
      level: 3,
      title: 'Ліниві map / filter / take на генераторах',
      tags: ['generators', 'lazy', 'iterators'],
      description: `
**Завдання.** Реалізуйте три **ліниві** генераторні функції для будь-яких ітерабельних (включно з нескінченними): \`map\`, \`filter\`, \`take\`.

**Де трапляється:** обробка великого логу чи стрічки подій без проміжних масивів; часте питання «чим лінивий конвеєр кращий за \`arr.filter().map()\`».

**Що написати**
- \`map(iterable, fn)\` → генератор \`fn(x)\` для кожного елемента
- \`filter(iterable, predicate)\` → генератор елементів, для яких предикат truthy
- \`take(iterable, n)\` → генератор перших \`n\` елементів; \`n + 1\`-й **не запитується**

**Приклад**
\`\`\`js
function* naturals() { let n = 0; while (true) yield n++; }
[...take(map(filter(naturals(), (x) => x % 2 === 0), (x) => x * x), 3)]; // [0, 4, 16]
\`\`\`

**Як це працює:** це pull-конвеєр: spread просить значення у \`take\`, той — у \`map\`, той — у \`filter\`, той — у джерела. Кожен елемент проходить увесь ланцюжок, перш ніж запитується наступний.

**Врахуйте:** у \`take\` перевіряйте лічильник **після** \`yield\` і виходьте через \`return\` — тоді \`for...of\` закриє джерело (виконається його \`finally\`); \`n <= 0\` → нічого.
`,
      starter: `function* map(iterable, fn) {
  // TODO: for...of + yield fn(x)
}

function* filter(iterable, predicate) {
  // TODO: yield лише ті x, для яких predicate(x)
}

function* take(iterable, n) {
  // 1. n <= 0 → return
  // 2. for...of: yield x; потім, якщо вже віддали n, — return
  // TODO
}

// Спробуйте в консолі:
// [...take(map([1, 2, 3, 4], (x) => x * 10), 2)]; // [10, 20]
`,
      solution: `function* map(iterable, fn) {
  for (const x of iterable) yield fn(x);
}

function* filter(iterable, predicate) {
  for (const x of iterable) {
    if (predicate(x)) yield x;
  }
}

function* take(iterable, n) {
  if (n <= 0) return;
  let count = 0;
  for (const x of iterable) {
    yield x;
    // виходимо одразу після n-го — не запитуємо зайвий елемент;
    // return з for...of викликає iterator.return() джерела
    if (++count >= n) return;
  }
}
`,
      hints: [
        'Кожна функція — `for...of` по вхідному ітерабельному з `yield` всередині.',
        'У `take` перевіряйте лічильник **після** `yield` — інакше `for...of` встигне запитати зайвий елемент.',
        'Випадок `n <= 0` — `return` одразу, до циклу.'
      ],
      tests: [
        { name: 'конвеєр на нескінченному джерелі', code: 'function* naturals() { let n = 0; while (true) yield n++; }\nexpect([...take(map(filter(naturals(), (x) => x % 2 === 0), (x) => x * x), 3)]).toEqual([0, 4, 16]);' },
        { name: 'лінивість: fn викликається лише для потрібних елементів', code: 'const fn = mockFn((x) => x * 10);\nconst res = [...take(map([1, 2, 3, 4, 5], fn), 2)];\nexpect(res).toEqual([10, 20]);\nexpect(fn).toHaveBeenCalledTimes(2);' },
        { name: 'take не запитує зайвий елемент', code: 'let pulled = 0;\nfunction* src() { while (true) { pulled++; yield pulled; } }\nexpect([...take(src(), 3)]).toEqual([1, 2, 3]);\nexpect(pulled).toBe(3);' },
        { name: 'take закриває джерело (finally виконується)', code: 'let closed = false;\nfunction* src() { try { yield 1; yield 2; yield 3; } finally { closed = true; } }\nexpect([...take(src(), 2)]).toEqual([1, 2]);\nexpect(closed).toBe(true);' },
        { name: 'крайові випадки', code: 'expect([...take([1, 2], 0)]).toEqual([]);\nexpect([...take([1, 2], 5)]).toEqual([1, 2]);\nexpect([...filter([1, 2, 3], () => false)]).toEqual([]);\nexpect([...map([], (x) => x)]).toEqual([]);' },
        { name: 'порядок обробки — поелементний', code: 'const log = [];\nconst m = map([1, 2], (x) => { log.push("map" + x); return x; });\nconst f = filter(m, (x) => { log.push("filter" + x); return true; });\n[...f];\nexpect(log).toEqual(["map1", "filter1", "map2", "filter2"]);' }
      ],
      explanation: `
На відміну від \`arr.filter().map()\` (кожен крок — повний новий масив), конвеєр генераторів тримає O(1) додаткової пам'яті і зупиняється рано. O(k) для k запитаних елементів.

**Альтернатива:** ES2025 iterator helpers — \`naturals().filter(isEven).map(sq).take(3).toArray()\`.

**Типова помилка:** \`[...iterable].map(...)\` усередині — втрачається лінивість, зависання на нескінченних.

**Що спитають далі:** ланцюжковий API \`lazy(iter).map().filter().take()\`; pull (ітератори) vs push (Observable).
`
    },
    {
      id: 'es-zip-iterables',
      group: 'generators',
      type: 'code',
      level: 3,
      title: 'zip(...iterables): підписи і значення для графіка',
      tags: ['iterators', 'generators'],
      description: `
**Завдання.** Напишіть генераторну функцію \`zip(...iterables)\`: віддає масиви з i-х елементів кожного джерела і зупиняється, щойно **будь-яке** з них закінчилось.

**Де трапляється:** поєднати підписи осі й значення для графіка, колонки CSV у рядки; на співбесіді — ручна робота з ітераторами та їх закриття.

**Що написати**
- \`function* zip(...iterables)\` → генератор масивів \`[a_i, b_i, ...]\`

**Приклад**
\`\`\`js
[...zip(['Пн', 'Вт', 'Ср'], [10, 20])]; // [['Пн', 10], ['Вт', 20]]
[...zip()];                            // []
\`\`\`

**Як це працює:** беремо ітератори вручну (\`it[Symbol.iterator]()\`) і на кожному кроці викликаємо \`next()\` у всіх. Коли ітераторами керуємо вручну, закривати їх (\`it.return?.()\`) — наша робота: \`try/finally\` у генераторі виконається і при завершенні, і при \`break\` у споживача.

**Врахуйте:** працює з нескінченними генераторами; після завершення або \`break\` викликати \`return()\` у всіх ітераторів; без аргументів — нічого.
`,
      starter: `function* zip(...iterables) {
  // 1. Немає аргументів → return
  // 2. const iterators = iterables.map((it) => it[Symbol.iterator]());
  // 3. try { while (true) { results = next() у всіх; якщо хоч один done — return;
  //                        інакше yield масив value } }
  // 4. finally { у кожного ітератора викликати return, якщо він є }
  // TODO
}

// Спробуйте в консолі:
// [...zip([1, 2, 3], 'ab')]; // [[1, 'a'], [2, 'b']]
`,
      solution: `function* zip(...iterables) {
  if (iterables.length === 0) return;
  const iterators = iterables.map((it) => it[Symbol.iterator]());
  try {
    while (true) {
      const results = iterators.map((it) => it.next());
      if (results.some((r) => r.done)) return;
      yield results.map((r) => r.value);
    }
  } finally {
    // виконується і при нормальному завершенні, і при break/throw у споживача
    for (const it of iterators) {
      if (typeof it.return === 'function') it.return();
    }
  }
}
`,
      hints: [
        'Отримайте ітератори вручну: `it[Symbol.iterator]()`, і на кожному кроці `next()` у всіх.',
        'Якщо хоча б один результат `done` — `return`, інакше `yield` масив значень.',
        'Обгорніть цикл у `try/finally` і у `finally` викличте `it.return?.()` для кожного.'
      ],
      tests: [
        { name: 'зупиняється на найкоротшому', code: 'expect([...zip([1, 2, 3], "ab", new Set([true, false, null]))]).toEqual([[1, "a", true], [2, "b", false]]);' },
        { name: 'працює з нескінченним генератором', code: 'function* naturals() { let n = 0; while (true) yield n++; }\nexpect([...zip(naturals(), ["a", "b", "c"])]).toEqual([[0, "a"], [1, "b"], [2, "c"]]);' },
        { name: 'закриває незавершені ітератори', code: 'let closed = false;\nfunction* g() { try { yield 1; yield 2; yield 3; } finally { closed = true; } }\nexpect([...zip(g(), [10])]).toEqual([[1, 10]]);\nexpect(closed).toBe(true);' },
        { name: 'закриває ітератори при break споживача', code: 'let closed = 0;\nfunction* g() { try { while (true) yield 1; } finally { closed++; } }\nfor (const pair of zip(g(), g())) { break; }\nexpect(closed).toBe(2);' },
        { name: 'без аргументів і з порожнім', code: 'expect([...zip()]).toEqual([]);\nexpect([...zip([1, 2], [])]).toEqual([]);' }
      ],
      explanation: `
Зупинка на найкоротшому робить \`zip\` безпечним для нескінченних джерел. \`for...of\` сам закриває ітератор при \`break\`, але ручні ітератори — наша відповідальність; \`finally\` генератора спрацює, коли споживач вийде достроково. O(k · m).

**Типові помилки:** \`Array.from\` для всіх джерел (зависання на нескінченних); не закривати ітератори; \`every(r => r.done)\` — це вже \`zipLongest\`.
`
    },

    // ------------------------------------------------------------------ 8. Proxy & Reflect
    {
      id: 'es-modern-features-theory',
      group: 'generators',
      type: 'theory',
      level: 2,
      title: 'Нове в ES2023–ES2025: масиви, колекції, ітератори',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        '`toSorted`, `toReversed`, `toSpliced`, `with(i, v)` повертають нову копію масиву, не змінюючи оригінал (ES2023)',
        '`Object.groupBy(list, fn)` групує елементи в об\'єкт за ключем, який повертає fn (ES2024)',
        'Iterator helpers (`map`, `filter`, `take`, `drop`, `toArray`) працюють ліниво — зокрема з нескінченними генераторами (ES2025)',
        '`new Set([1, 2]).union(new Set([2, 3]))` змінює перший Set',
        '`RegExp.escape(str)` екранує спецсимволи, щоб безпечно вставити рядок користувача в регулярний вираз (ES2025)'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: зручно для іммутабельного стану (React).',
        'Так: для Map-ключів — `Map.groupBy`.',
        'Так: перевірено — з нескінченного генератора взято рівно потрібну кількість елементів.',
        'Ні: `union`, `intersection`, `difference`, `symmetricDifference` повертають новий Set.',
        'Так: замість саморобних `replace(/[.*+?^${}()|[\\]\\\\]/g, …)`.'
      ],
      hint: 'Що з цього мутує дані, а що повертає новий об\'єкт?',
      answer: `
| Рік | Що з'явилось |
|---|---|
| ES2023 | \`findLast\` / \`findLastIndex\`, \`toSorted\`, \`toReversed\`, \`toSpliced\`, \`with\` |
| ES2024 | \`Object.groupBy\`, \`Map.groupBy\`, прапорець \`v\` у RegExp, змінний розмір ArrayBuffer |
| ES2025 | iterator helpers, методи Set, \`RegExp.escape\`, import attributes (\`import data from './x.json' with { type: 'json' }\`), \`Float16Array\` |

\`\`\`js
const byRole = Object.groupBy(users, (u) => u.role);       // { admin: [...], user: [...] }
const last = logs.findLast((l) => l.level === 'error');
const fresh = todos.with(2, { ...todos[2], done: true });
const firstTen = Iterator.from(hugeIterable).filter(isValid).map(parse).take(10).toArray();
const common = tagsA.intersection(tagsB);
\`\`\`
Підтримка: усе перелічене — у сучасних Chrome, Firefox, Safari і Node 22+; для старих браузерів — core-js (модуль «Інструменти»: поліфіли).
`,
      keyPoints: ['Копіювальні методи масивів', 'Object.groupBy', 'Ліниві iterator helpers', 'Методи Set повертають новий Set', 'RegExp.escape']
    },
    {
      id: 'es-iterator-helpers',
      group: 'generators',
      type: 'code',
      level: 3,
      title: 'Ліниві конвеєри: iterator helpers',
      tags: ['iterators', 'generators', 'es2025'],
      description: `
**Завдання.** Реалізуйте дві функції, що працюють з **будь-яким** iterable — масивом, Set або нескінченним генератором — і читають з нього **лише стільки елементів, скільки потрібно**:
- \`firstErrors(lines, n)\` — рядки мають вигляд \`'LEVEL повідомлення'\`; повернути масив перших \`n\` повідомлень рівня \`ERROR\` (без префікса \`'ERROR '\`);
- \`pageOf(iterable, page, size)\` — елементи сторінки \`page\` (з 1) розміром \`size\`.

**Де трапляється:** розбір великого лог-файлу потоком, пагінація по генератору записів, «перші 10 валідних рядків» з CSV на мільйон рядків.

**Приклад**
\`\`\`js
firstErrors(['INFO a', 'ERROR disk full', 'ERROR timeout'], 1);   // ['disk full']
pageOf(naturals(), 3, 2);                                         // [5, 6] — прочитано рівно 6 чисел
\`\`\`

**Як це працює:** \`Iterator.from(iterable)\` дає ітератор з методами \`filter\`, \`map\`, \`drop\`, \`take\`, \`toArray\` (ES2025). Вони ліниві: наступний елемент запитується, лише коли його потребує наступний крок конвеєра — як генератори з цього модуля, тільки без ручних циклів.
`,
      starter: `function firstErrors(lines, n) {
  // TODO: Iterator.from(lines).filter(...).map(...).take(n).toArray()
}

function pageOf(iterable, page, size) {
  // TODO: drop + take
}

// Спробуйте в консолі:
// function* naturals() { let i = 1; while (true) yield i++; }
// pageOf(naturals(), 3, 2);
`,
      solution: `function firstErrors(lines, n) {
  return Iterator.from(lines)
    .filter((line) => line.startsWith('ERROR '))
    .map((line) => line.slice('ERROR '.length))
    .take(n)
    .toArray();
}

function pageOf(iterable, page, size) {
  return Iterator.from(iterable)
    .drop((page - 1) * size)
    .take(size)
    .toArray();
}
`,
      hints: [
        '`Iterator.from(lines)` працює і з масивом, і з генератором; далі ланцюжок `.filter(...).map(...).take(n).toArray()`.',
        '`pageOf`: пропустити `(page - 1) * size` елементів через `.drop()`, потім `.take(size)`.'
      ],
      tests: [
        { name: 'масиви і Set', code: "expect(firstErrors(['INFO a', 'ERROR disk full', 'WARN x', 'ERROR timeout'], 5)).toEqual(['disk full', 'timeout']);\nexpect(firstErrors(['ERROR a', 'ERROR b'], 1)).toEqual(['a']);\nexpect(pageOf([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4]);\nexpect(pageOf(new Set(['a', 'b', 'c']), 2, 2)).toEqual(['c']);" },
        { name: 'нескінченний генератор: читає лише потрібне', code: "let pulled = 0;\nfunction* logs() { let i = 0; while (true) { pulled++; i++; yield i % 3 === 0 ? 'ERROR e' + i : 'INFO i' + i; } }\nexpect(firstErrors(logs(), 2)).toEqual(['e3', 'e6']);\nexpect(pulled).toBe(6);" },
        { name: 'pageOf ліниво', code: "let pulled = 0;\nfunction* naturals() { let i = 0; while (true) { pulled++; yield ++i; } }\nexpect(pageOf(naturals(), 3, 2)).toEqual([5, 6]);\nexpect(pulled).toBe(6);" }
      ],
      explanation: 'Масивні `filter/map/slice` створили б проміжні масиви й на нескінченному джерелі зависли б. Iterator helpers — ліниві й закривають джерело після `take` (викликають `return()` генератора — спрацює його `finally`). Асинхронні аналоги (для потоків і пагінованих API) — `for await` і async-генератори (модуль «Асинхронність»).',
      followUps: ['Чим iterator helpers відрізняються від методів масиву?', 'Що станеться з finally генератора після take?', 'Як зробити те саме до ES2025?']
    },
    {
      id: 'es-quiz-proxy-get-default',
      group: 'proxy',
      type: 'quiz',
      level: 2,
      title: 'Proxy без пастки set і has',
      tags: ['proxy'],
      question: `
**Як це працює:** \`new Proxy(target, handler)\` перехоплює операції над об'єктом через **пастки** в handler (\`get\` — читання, \`set\` — запис, \`has\` — оператор \`in\`). Операції без пастки йдуть прямо до target.

Що виведе код?

\`\`\`js
const p = new Proxy({}, {
  get: (target, key) => (key in target ? target[key] : 'no_' + String(key)),
});

p.a = 1;
console.log(p.a, p.b, 'b' in p);
\`\`\`
`,
      options: ['`1 no_b true`', '`no_a no_b false`', '`1 no_b false`', '`1 undefined false`'],
      answer: 2,
      why: [
        'Пастка `get` не впливає на оператор `in` — за нього відповідає окрема пастка `has`, якої тут немає.',
        'Без пастки `set` запис `p.a = 1` іде прямо в target, тож `get` знаходить `a`.',
        'Правильно: запис пройшов у target, відсутній `b` дає `\'no_b\'`, а `in` перевіряє target напряму.',
        'Для відсутнього ключа пастка `get` повертає `\'no_b\'`, а не `undefined`.'
      ],
      hint: 'Які операції перехоплює цей проксі, а які йдуть прямо до target?',
      explanation: `
Кожна операція має власну пастку. Щоб \`in\` узгоджувався з «віртуальними» властивостями з \`get\`, потрібна ще пастка \`has\`. Так роблять значення за замовчуванням для конфігів і словників i18n.
`
    },
    {
      id: 'es-proxy-theory',
      group: 'proxy',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Proxy і Reflect',
      tags: ['proxy', 'reflect', 'metaprogramming'],
      question: 'Що таке Proxy? Які є пастки? Навіщо потрібен Reflect і чому в пастках рекомендують саме його? Де Proxy застосовують на практиці?',
      choices: [
        'Proxy змінює сам target: після створення проксі звичайний доступ до target теж іде через пастки',
        '`Reflect` потрібен лише для старих браузерів; у пастці `target[key]` завжди поводиться так само',
        '`Reflect.get(target, key, receiver)` дає стандартну поведінку й передає правильний receiver у геттери',
        'Проксі ідентичний target: `proxy === target` дає `true`, тому його можна класти в `Set` замість оригіналу'
      ],
      correct: 2,
      why: [
        'Хибно: target не змінюється — пастки спрацьовують лише при доступі через проксі.',
        'Хибно: `target[key]` губить receiver, тому геттери й успадкування бачать target замість проксі.',
        'Правильно: методи `Reflect` мають ті самі сигнатури, що й пастки, і коректно передають receiver.',
        'Хибно: проксі — окремий об\'єкт, `proxy === target` дає `false`.'
      ],
      answer: `
- **Proxy** — обгортка, що перехоплює операції через пастки handler; без пастки — прозоро до target.
- **Пастки:** \`get\`, \`set\`, \`has\` (\`in\`), \`deleteProperty\`, \`ownKeys\` (\`Object.keys\`), \`defineProperty\`, \`apply\` (виклик), \`construct\` (\`new\`).
- **Reflect** — ті самі імена і сигнатури: стандартна поведінка + правильний receiver; \`Reflect.set\` повертає boolean.
- **Інваріанти:** \`set\`, що повертає \`false\`, у strict mode → \`TypeError\`; пастки не можуть «брехати» про non-configurable властивості.
- **Практика:** реактивність (Vue 3, MobX, Immer), валідація, defaults, логування.
- **Ціна:** повільніше за прямий доступ; \`proxy !== target\`; \`Map\`/\`Date\` з внутрішніми слотами ламаються без прив'язки методів; не поліфілиться.
`,
      keyPoints: [
        'Proxy перехоплює операції над об\'єктом через пастки handler',
        'Основні пастки: get, set, has, deleteProperty, ownKeys, apply, construct',
        'Reflect — стандартна поведінка з тими самими сигнатурами, правильний receiver',
        'set має повертати true',
        'Практика: реактивність (Vue 3, MobX, Immer), валідація, логування'
      ],
      followUps: [
        'Як Vue 3 відстежує залежності через Proxy?',
        'Чим Proxy кращий за Object.defineProperty для реактивності (Vue 2)?'
      ]
    },
    {
      id: 'es-negative-index-proxy',
      group: 'proxy',
      type: 'code',
      level: 2,
      title: 'Від\'ємні індекси масиву через Proxy',
      tags: ['proxy', 'reflect'],
      description: `
**Завдання.** Напишіть \`withNegativeIndex(arr)\`: Proxy над масивом, де \`p[-1]\` — останній елемент, \`p[-2]\` — передостанній, і запис \`p[-1] = v\` теж працює.

**Де трапляється:** класична задача на Proxy (у продакшні для читання є \`arr.at(-1)\`).

**Що написати**
- \`withNegativeIndex(arr)\` → Proxy; усе інше (додатні індекси, \`length\`, \`push\`, \`map\`, \`Array.isArray\`) як у звичайного масиву

**Приклад**
\`\`\`js
const p = withNegativeIndex([1, 2, 3]);
p[-1];      // 3
p[-1] = 30; // оригінал тепер [1, 2, 30]
p.push(4);
p[-1];      // 4
\`\`\`

**Як це працює:** у пастку ключ приходить **рядком** (\`p[-1]\` → \`'-1'\`) або символом. Розпізнаємо \`/^-\\d+$/\`, перераховуємо в \`length + Number(key)\`, а решту передаємо в \`Reflect.get/set\` з \`receiver\`.

**Врахуйте:** за межами — \`undefined\`; запис змінює оригінальний масив; порожній масив.
`,
      starter: `function withNegativeIndex(arr) {
  // 1. Хелпер: ключ-рядок виду '-2' → target.length + Number(key);
  //    інші ключі ('0', 'length', 'push', символи) — без змін
  return new Proxy(arr, {
    get(target, key, receiver) {
      // 2. TODO: перерахувати key
      return Reflect.get(target, key, receiver);
    },
    // 3. TODO: пастка set(target, key, value, receiver) — так само для запису
  });
}

// Спробуйте в консолі:
// const p = withNegativeIndex([1, 2, 3]); p[-1]; // 3
`,
      solution: `function withNegativeIndex(arr) {
  // ключі властивостей у пастках — рядки (або символи)
  const toIndex = (target, key) => {
    if (typeof key === 'string' && /^-\\d+$/.test(key)) {
      return target.length + Number(key);
    }
    return key;
  };

  return new Proxy(arr, {
    get(target, key, receiver) {
      return Reflect.get(target, toIndex(target, key), receiver);
    },
    set(target, key, value, receiver) {
      return Reflect.set(target, toIndex(target, key), value, receiver);
    },
  });
}
`,
      hints: [
        'Ключ приходить рядком `\'-1\'`; символи (`Symbol.iterator`) теж можуть прийти — перевіряйте `typeof key === \'string\'`.',
        'Перевірка `/^-\\d+$/.test(key)` і перерахунок `target.length + Number(key)`.',
        'Пастка `set` має повертати результат `Reflect.set(...)` (true).'
      ],
      tests: [
        { name: 'читання від\'ємних індексів', code: 'const p = withNegativeIndex([1, 2, 3]);\nexpect(p[-1]).toBe(3);\nexpect(p[-3]).toBe(1);\nexpect(p[-4]).toBeUndefined();' },
        { name: 'додатні індекси і length без змін', code: 'const p = withNegativeIndex(["a", "b"]);\nexpect(p[0]).toBe("a");\nexpect(p.length).toBe(2);' },
        { name: 'запис через від\'ємний індекс змінює оригінал', code: 'const arr = [1, 2, 3];\nconst p = withNegativeIndex(arr);\np[-1] = 30;\np[-3] = 10;\nexpect(arr).toEqual([10, 2, 30]);' },
        { name: 'методи масиву працюють', code: 'const p = withNegativeIndex([1, 2]);\np.push(5);\nexpect(p[-1]).toBe(5);\nexpect(p.map((x) => x * 2)).toEqual([2, 4, 10]);\nexpect([...p]).toEqual([1, 2, 5]);\nexpect(Array.isArray(p)).toBe(true);' },
        { name: 'порожній масив', code: 'const p = withNegativeIndex([]);\nexpect(p[-1]).toBeUndefined();\nexpect(p.length).toBe(0);' }
      ],
      explanation: `
Ключі в пастках — рядки або символи, тому \`-1\` розпізнаємо як \`'-1'\`. Решту делегуємо в \`Reflect\` з receiver — методи масиву працюють через проксі коректно, а \`Array.isArray\` «бачить крізь» проксі. Накладні витрати O(1) на доступ.

**Типові помилки:** \`key < 0\` без перевірки типу (символ кине \`TypeError\`); забути \`set\`.

**Що спитають далі:** пастка \`has\` для \`-1 in p\`; чим це гірше за \`arr.at(-1)\`.
`
    },
    {
      id: 'es-validated-proxy',
      group: 'proxy',
      type: 'code',
      level: 3,
      title: 'Модель форми з валідацією типів через Proxy',
      tags: ['proxy', 'validation'],
      description: `
**Завдання.** Напишіть \`createValidated(schema)\`: повертає порожній об'єкт-проксі, який дозволяє записувати лише поля зі схеми і лише правильного типу.

**Де трапляється:** runtime-перевірка моделі форми чи конфігу (те, що TypeScript не ловить під час виконання); питання «наведіть практичний приклад Proxy».

**Що написати**
- \`createValidated(schema)\` → проксі; \`schema\` — \`{ поле: 'тип' }\`, тип як у \`typeof\`
  - невідоме поле → \`TypeError('Unknown property: <key>')\`
  - неправильний тип → \`TypeError('Expected <type> for <key>')\`
  - \`delete\` → \`TypeError('Cannot delete <key>')\`

**Приклад**
\`\`\`js
const form = createValidated({ name: 'string', age: 'number' });
form.name = 'Ann'; // ок
form.age = '30';   // TypeError: Expected number for age
form.role = 'x';   // TypeError: Unknown property: role
\`\`\`

**Як це працює:** пастка \`set\` перехоплює **будь-який** запис — \`obj.x =\`, \`obj[key] =\`, \`Object.assign\`. Після перевірок — \`return Reflect.set(...)\` (пастка має повернути \`true\`). \`delete\` перехоплює \`deleteProperty\`.

**Врахуйте:** перевіряйте поле через \`Object.hasOwn(schema, key)\` (не \`in\` — інакше пройде \`toString\` з прототипу); \`Object.keys\` і \`JSON.stringify\` бачать записані поля.
`,
      starter: `function createValidated(schema) {
  return new Proxy({}, {
    set(target, key, value, receiver) {
      // 1. Немає в схемі (Object.hasOwn) → TypeError('Unknown property: ' + String(key))
      // 2. typeof value !== schema[key] → TypeError('Expected ' + ... + ' for ' + ...)
      // TODO
      return Reflect.set(target, key, value, receiver);
    },
    // 3. TODO: deleteProperty(target, key) → TypeError('Cannot delete ' + String(key))
  });
}

// Спробуйте в консолі:
// const f = createValidated({ age: 'number' }); f.age = '1';
`,
      solution: `function createValidated(schema) {
  return new Proxy({}, {
    set(target, key, value, receiver) {
      if (!Object.hasOwn(schema, key)) {
        throw new TypeError('Unknown property: ' + String(key));
      }
      if (typeof value !== schema[key]) {
        throw new TypeError('Expected ' + schema[key] + ' for ' + String(key));
      }
      return Reflect.set(target, key, value, receiver);
    },
    deleteProperty(target, key) {
      throw new TypeError('Cannot delete ' + String(key));
    },
  });
}
`,
      hints: [
        'Потрібні дві пастки: `set` і `deleteProperty`.',
        'Наявність у схемі — `Object.hasOwn(schema, key)`; тип — `typeof value !== schema[key]`.',
        'Після перевірок поверніть `Reflect.set(target, key, value, receiver)`.'
      ],
      tests: [
        { name: 'коректні записи працюють', code: 'const u = createValidated({ name: "string", age: "number", admin: "boolean" });\nu.name = "Ann"; u.age = 30; u.admin = false;\nexpect(u.name).toBe("Ann");\nexpect(JSON.stringify(u)).toBe(\'{"name":"Ann","age":30,"admin":false}\');' },
        { name: 'неправильний тип → TypeError', code: 'const u = createValidated({ age: "number" });\nexpect(() => { u.age = "30"; }).toThrow(TypeError);\nexpect(() => { u.age = "30"; }).toThrow("Expected number for age");\nexpect(u.age).toBeUndefined();' },
        { name: 'невідоме поле → TypeError', code: 'const u = createValidated({ name: "string" });\nexpect(() => { u.role = "admin"; }).toThrow("Unknown property: role");\nexpect(Object.keys(u)).toEqual([]);' },
        { name: 'поля з прототипу схеми не дозволені', code: 'const u = createValidated({ name: "string" });\nexpect(() => { u.toString = "x"; }).toThrow(TypeError);' },
        { name: 'delete → TypeError', code: 'const u = createValidated({ name: "string" });\nu.name = "Ann";\nexpect(() => { delete u.name; }).toThrow(TypeError);\nexpect(u.name).toBe("Ann");' },
        { name: 'Object.assign теж валідується', code: 'const u = createValidated({ a: "number" });\nexpect(() => Object.assign(u, { a: 1, b: 2 })).toThrow("Unknown property: b");\nexpect(u.a).toBe(1);' }
      ],
      explanation: `
Валідація централізована в одній пастці, її не обійти звичайним присвоєнням. O(1) на запис.

**Нюанси:** \`Object.defineProperty(proxy, …)\` іде через пастку \`defineProperty\`, а не \`set\`; \`typeof\` не відрізняє \`null\`/масив від об'єкта — у реальних проєктах беруть zod/yup.

**Типові помилки:** \`set\` не повертає \`true\` (у strict mode → \`TypeError\`); перевірка через \`in\`.
`
    },
    {
      id: 'es-observable-proxy',
      group: 'proxy',
      type: 'code',
      level: 4,
      title: 'Глибокий observable через Proxy (реактивність як у Vue 3)',
      tags: ['proxy', 'reactivity', 'weakmap'],
      description: `
**Завдання.** Напишіть \`observable(target, onChange)\` — спрощену реактивність: будь-яка зміна стану, навіть вкладеного, викликає \`onChange(path, newValue, oldValue)\`.

**Де трапляється:** так працюють Vue 3 \`reactive\`, MobX, Valtio; на співбесіді — «як фреймворк дізнається, що стан змінився?».

**Що написати**
- \`observable(target, onChange)\` → Proxy
  - \`path\` — шлях через крапку: \`'user.address.city'\`, для масивів \`'list.0'\`
  - \`delete\` існуючої властивості → \`onChange(path, undefined, oldValue)\`

**Приклад**
\`\`\`js
const state = observable({ user: { name: 'Ann' }, list: [1, 2] }, console.log);
state.user.name = 'Bob'; // 'user.name' 'Bob' 'Ann'
state.list.push(3);      // 'list.2' 3 undefined
\`\`\`

**Як це працює:** у пастці \`get\`, якщо значення — об'єкт, повертаємо його **теж обгорнутим** у проксі з подовженим шляхом (лінива глибина). \`WeakMap\` «оригінал → проксі» гарантує, що \`state.user === state.user\`.

**Врахуйте:**
- значення не змінилось (\`Object.is\`, зокрема \`NaN\`) → без сповіщення;
- нові вкладені об'єкти теж спостерігаються;
- символьні ключі пропускати; зміни пишуться в оригінальний об'єкт.
`,
      starter: `function observable(target, onChange) {
  // 1. const proxies = new WeakMap();  // оригінал → проксі

  function wrap(obj, path) {
    // 2. Уже обгортали obj → повернути з proxies
    return new Proxy(obj, {
      get(t, key, receiver) {
        const value = Reflect.get(t, key, receiver);
        // 3. TODO: об'єкт (не null) і ключ не символ → wrap(value, [...path, key])
        return value;
      },
      set(t, key, value, receiver) {
        const old = t[key];
        const ok = Reflect.set(t, key, value, receiver);
        // 4. TODO: сповіщати лише якщо !Object.is(old, value); шлях — повний
        onChange(String(key), value, old);
        return ok;
      },
      // 5. TODO: deleteProperty — сповіщати, лише якщо властивість існувала
    });
    // і покласти створений проксі в proxies
  }

  return wrap(target, []);
}

// Спробуйте в консолі:
// const s = observable({ user: { name: 'A' } }, console.log); s.user.name = 'B';
`,
      solution: `function observable(target, onChange) {
  // raw object -> proxy: стабільна ідентичність і відсутність повторних обгорток
  const proxies = new WeakMap();

  function wrap(obj, path) {
    if (proxies.has(obj)) return proxies.get(obj);

    const proxy = new Proxy(obj, {
      get(t, key, receiver) {
        const value = Reflect.get(t, key, receiver);
        if (typeof key === 'symbol') return value;
        // лінива глибина: обгортаємо вкладений об'єкт лише коли до нього звернулись
        if (value !== null && typeof value === 'object') {
          return wrap(value, path.concat(key));
        }
        return value;
      },
      set(t, key, value, receiver) {
        const old = t[key];
        const ok = Reflect.set(t, key, value, receiver);
        if (ok && typeof key !== 'symbol' && !Object.is(old, value)) {
          onChange(path.concat(key).join('.'), value, old);
        }
        return ok;
      },
      deleteProperty(t, key) {
        const had = Object.hasOwn(t, key);
        const old = t[key];
        const ok = Reflect.deleteProperty(t, key);
        if (ok && had && typeof key !== 'symbol') {
          onChange(path.concat(key).join('.'), undefined, old);
        }
        return ok;
      },
    });

    proxies.set(obj, proxy);
    return proxy;
  }

  return wrap(target, []);
}
`,
      hints: [
        'Шлях передавайте масивом ключів і робіть `join(\'.\')` лише при сповіщенні.',
        'Ідентичність: кешуйте проксі у `WeakMap` за оригінальним об\'єктом — інакше кожне читання дає новий Proxy.',
        '`push` записує `list[2]`, потім `length = 3` — завдяки `Object.is` друге сповіщення не з\'явиться.'
      ],
      tests: [
        { name: 'зміна верхнього рівня', code: 'const cb = mockFn();\nconst s = observable({ count: 0 }, cb);\ns.count = 1;\nexpect(cb).toHaveBeenCalledWith("count", 1, 0);' },
        { name: 'глибока зміна з повним шляхом', code: 'const cb = mockFn();\nconst raw = { user: { address: { city: "Kyiv" } } };\nconst s = observable(raw, cb);\ns.user.address.city = "Lviv";\nexpect(cb).toHaveBeenCalledTimes(1);\nexpect(cb).toHaveBeenCalledWith("user.address.city", "Lviv", "Kyiv");\nexpect(raw.user.address.city).toBe("Lviv");' },
        { name: 'без змін — без сповіщення', code: 'const cb = mockFn();\nconst s = observable({ a: 1, n: NaN }, cb);\ns.a = 1;\ns.n = NaN;\nexpect(cb).not.toHaveBeenCalled();' },
        { name: 'масиви: push сповіщає про новий індекс', code: 'const cb = mockFn();\nconst s = observable({ list: [1, 2] }, cb);\ns.list.push(3);\nexpect(cb).toHaveBeenCalledWith("list.2", 3, undefined);\nexpect(cb).toHaveBeenCalledTimes(1);\ns.list[0] = 10;\nexpect(cb).toHaveBeenLastCalledWith("list.0", 10, 1);' },
        { name: 'delete існуючої властивості', code: 'const cb = mockFn();\nconst s = observable({ a: 1, nested: { b: 2 } }, cb);\ndelete s.nested.b;\nexpect(cb).toHaveBeenCalledWith("nested.b", undefined, 2);\ndelete s.missing;\nexpect(cb).toHaveBeenCalledTimes(1);' },
        { name: 'стабільна ідентичність вкладених проксі', code: 'const s = observable({ user: { name: "A" } }, () => {});\nexpect(s.user).toBe(s.user);' },
        { name: 'новий вкладений об\'єкт теж спостерігається', code: 'const cb = mockFn();\nconst s = observable({}, cb);\ns.profile = { theme: "dark" };\ns.profile.theme = "light";\nexpect(cb).toHaveBeenLastCalledWith("profile.theme", "light", "dark");\nexpect(cb).toHaveBeenCalledTimes(2);' }
      ],
      explanation: `
Модель реактивності Vue 3: лінива глибина (обгортка при читанні), \`WeakMap\` для ідентичності без витоків, \`Object.is\` проти «порожніх» записів. O(1) на операцію.

**Обмеження (варто проговорити):** \`Map\`/\`Set\`/\`Date\` на проксі ламаються (внутрішні слоти); один об'єкт за двома шляхами отримає шлях першого доступу; Vue ще й відстежує читання (\`track\`), а сповіщення батчить у мікрозадачу.

**Що спитають далі:** чому Vue 2 на \`Object.defineProperty\` не бачив нових властивостей та індексів масиву?
`
    }
  ]
});
