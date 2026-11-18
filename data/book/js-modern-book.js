FE.chapter('js-modern-book', { body: `
Сучасний синтаксис і вбудовані структури ES2015+: те, без чого не обходиться жоден сучасний код і жодна співбесіда.

## Деструктуризація, spread і rest

\`\`\`js
const { name, address: { city } = {}, role = 'user', ...rest } = user;   // перейменування, вкладене, default, rest
const [first, , third = 0, ...others] = arr;                              // пропуск, default, rest
[a, b] = [b, a];                                                           // обмін
function f({ id, opts: { retry = 3 } = {} } = {}) {}                       // в параметрах
const merged = { ...defaults, ...options };                                // пізніше перемагає
const copy = [...arr, x];
\`\`\`
- default спрацьовує лише для \`undefined\` (не \`null\`); деструктуризація \`null\`/\`undefined\` — \`TypeError\`;
- spread копіює **власні перелічувані** властивості, поверхнево; геттери обчислюються, прототип не копіюється;
- rest у деструктуризації — останнім; \`...\` у виклику — розгортання ітерабельного (\`Math.max(...nums)\`, обережно з дуже великими масивами — ліміт аргументів).

## ?. ?? і логічне присвоєння

- \`a?.b\`, \`a?.[key]\`, \`fn?.()\` — коротке замикання: якщо ліворуч \`null\`/\`undefined\`, весь ланцюжок — \`undefined\`;
- \`a ?? b\` — \`b\` лише для \`null\`/\`undefined\` (на відміну від \`||\`, де \`0\`, \`''\`, \`false\` теж замінюються); не можна змішувати з \`||\`/\`&&\` без дужок;
- \`a ||= b\`, \`a &&= b\`, \`a ??= b\` — присвоєння **лише за умови** (і лише тоді викликається сеттер): \`cache[key] ??= compute()\`, \`(groups[k] ??= []).push(x)\`.

## Тегові шаблони

\`\`\`js
function tag(strings, ...values) {  // strings — статичні частини, values — підстановки
  return strings.reduce((out, s, i) => out + s + (i < values.length ? escape(values[i]) : ''), '');
}
tag\`Привіт, \${name}!\`;
String.raw\`C:\\new\`;               // без обробки escape-послідовностей
\`\`\`
- \`strings.length === values.length + 1\`; \`strings.raw\` — сирий текст; масив \`strings\` для одного місця коду однаковий між викликами (кеш розбору);
- застосування: безпечні HTML-шаблони з екрануванням (lit-html), стилі (styled-components), SQL з параметрами, \`gql\`, i18n.

## Map, Set, WeakMap

| | Object | Map |
|---|---|---|
| Ключі | рядки, символи | будь-які (об'єкти, NaN) |
| Порядок | цілі ключі сортуються | порядок вставки |
| Розмір | \`Object.keys().length\` | \`size\` |
| Прототипні ключі | є ризик | немає |
| Часті додавання/видалення | гірше | оптимізовано |

- \`Set\` — унікальні значення (SameValueZero: \`NaN\` дорівнює \`NaN\`), \`has\` за O(1); ES2025: \`union\`, \`intersection\`, \`difference\`;
- \`WeakMap\`/\`WeakSet\` — ключі лише об'єкти, утримуються **слабко** (не заважають GC), немає перебору й \`size\`: метадані для DOM-вузлів, приватні дані, кеш для об'єктів;
- \`WeakRef\` і \`FinalizationRegistry\` — низькорівневі інструменти, поведінка залежить від GC; рідко потрібні.

## Symbol і well-known symbols

- \`Symbol('desc')\` — унікальне значення-ключ: не конфліктує з іншими ключами, не видно в \`Object.keys\`/\`JSON\`; \`Symbol.for('key')\` — глобальний реєстр;
- **well-known symbols** — гачки в поведінку мови:
  - \`Symbol.iterator\` — \`for...of\`, спред;
  - \`Symbol.asyncIterator\` — \`for await\`;
  - \`Symbol.toPrimitive\` — приведення до примітиву;
  - \`Symbol.hasInstance\` — \`instanceof\`;
  - \`Symbol.toStringTag\` — \`Object.prototype.toString\`.

## Протоколи iterable та iterator

**Ітератор** — об'єкт з \`next()\` → \`{ value, done }\`. **Ітерабельний** — має \`[Symbol.iterator]()\`, що повертає ітератор. Ітерабельні: масиви, рядки, Map, Set, \`arguments\`, NodeList, генератори.
\`\`\`js
const range = {
  from: 1, to: 3,
  *[Symbol.iterator]() { for (let i = this.from; i <= this.to; i++) yield i; },
};
[...range];   // [1, 2, 3]
\`\`\`
Споживачі: \`for...of\`, спред, деструктуризація масиву, \`Array.from\`, \`Promise.all\`, \`new Map(iterable)\`. Звичайний об'єкт не ітерабельний — \`Object.entries\`. Ітератор може мати \`return()\` — викликається при \`break\` (звільнення ресурсів). Нові Iterator helpers: \`iterator.map/filter/take\` — ліниві операції.

## Генератори

\`\`\`js
function* ids() { let i = 0; while (true) yield ++i; }
const gen = ids();
gen.next().value;   // 1 — виконання ставиться на паузу на кожному yield
\`\`\`
- **лінивість:** значення обчислюються на вимогу — нескінченні послідовності, пагінація, обхід дерева;
- \`yield*\` — делегування іншому ітерабельному (рекурсивний обхід);
- двосторонній зв'язок: \`gen.next(value)\` передає значення в \`yield\`; \`gen.return()\`, \`gen.throw()\`;
- **async-генератори** (\`async function*\`) + \`for await\` — потоки даних, сторінки API;
- історично генератори + проміси дали основу async/await (co, redux-saga).

## Proxy і Reflect

\`\`\`js
const logged = new Proxy(target, {
  get(t, key, receiver) { console.log('get', key); return Reflect.get(t, key, receiver); },
  set(t, key, value, receiver) { if (key === 'age' && value < 0) throw new RangeError('age'); return Reflect.set(t, key, value, receiver); },
});
\`\`\`
- **пастки:** \`get\`, \`set\`, \`has\` (\`in\`), \`deleteProperty\`, \`ownKeys\`, \`apply\`, \`construct\`…; \`Reflect\` — методи з тією самою семантикою за замовчуванням (передавайте \`receiver\` для геттерів і успадкування);
- застосування: **реактивність Vue 3** (track у \`get\`, trigger у \`set\`), валідація, логування, від'ємні індекси, RPC-обгортки, mock-об'єкти;
- Vue 2 використовував \`Object.defineProperty\` і не бачив нових властивостей та індексів масиву — Proxy розв'язав це;
- ціна: повільніше за прямий доступ, \`proxy !== target\`, приватні поля \`#\` і вбудовані слоти (Map, Date) потребують обгорток.

## Типові питання

- **?? vs ||?**
- **Деструктуризація з default і перейменуванням.**
- **Map vs Object, Set vs Array, WeakMap — навіщо?**
- **Що таке iterable/iterator? Зробіть об'єкт ітерабельним.**
- **Що таке генератор і навіщо лінивість?**
- **Як Proxy використовується у Vue 3?**
- **Що таке Symbol і well-known symbols?**
`});
