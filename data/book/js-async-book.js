FE.chapter('js-async-book', { body: `
Асинхронність — тема №1 на співбесідах: порядок виконання, проміси, async/await, гонки й скасування.

## Event loop: стек, черга, таймери

JS виконується в **одному потоці**. Довгі операції (мережа, таймери, файли) виконує середовище, а результат приходить пізніше через черги.
\`\`\`text
стек викликів порожній?
  → виконати всі мікрозадачі (поки черга не порожня)
  → (можливо) рендеринг кадру: rAF → style → layout → paint
  → взяти одну задачу (macrotask) з черги
\`\`\`
- \`setTimeout(fn, 0)\` — не «одразу», а «після поточного коду, мікрозадач і, можливо, рендерингу»; вкладені таймери обмежуються ≥ 4 мс; у фонових вкладках — сильніше;
- довгий синхронний код **блокує** все: кліки, рендеринг, таймери;
- цикл подій реалізує середовище (Blink, libuv), а не V8.

## Мікрозадачі vs макрозадачі

| Мікрозадачі | Задачі (macrotasks) |
|---|---|
| \`.then/catch/finally\`, продовження після \`await\`, \`queueMicrotask\`, \`MutationObserver\` | \`setTimeout\`, \`setInterval\`, події, \`MessageChannel\`, мережеві колбеки |

\`\`\`js
console.log(1);
setTimeout(() => console.log(2));
Promise.resolve().then(() => console.log(3));
queueMicrotask(() => console.log(4));
console.log(5);
// 1 5 3 4 2
\`\`\`
Мікрозадачі виконуються **всі** до наступної задачі, включно з доданими під час виконання — нескінченний ланцюжок мікрозадач «вішає» вкладку. У Node.js ще \`process.nextTick\` (раніше за проміси) і фази libuv.

## Promise: стани і створення

- стани: **pending** → **fulfilled** або **rejected**; змінюється лише раз (settled);
- \`new Promise((resolve, reject) => …)\` — executor виконується **синхронно**; виняток у ньому = reject;
- \`resolve(thenable)\` «розгортає» інший проміс; \`Promise.resolve(x)\`, \`Promise.reject(e)\`;
- **промісифікація** колбек-API:
\`\`\`js
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const promisify = (fn) => (...args) => new Promise((res, rej) => fn(...args, (err, val) => (err ? rej(err) : res(val))));
\`\`\`
- \`Promise.withResolvers()\` (ES2024) — \`{ promise, resolve, reject }\` назовні.

## Ланцюжки then і обробка помилок

- \`then\` повертає **новий** проміс; значення з колбека передається далі, проміс — «чекається»; виняток → reject;
- \`catch(fn)\` = \`then(undefined, fn)\`; після \`catch\` ланцюжок знову fulfilled (якщо не перекинути помилку);
- \`finally\` не отримує значення й не змінює його (крім винятку в ньому);
- **забутий return** у \`then\` — наступний крок не чекає внутрішнього промісу;
- **відхилений проміс без обробника** → подія \`unhandledrejection\`.

## Комбінатори: all, allSettled, race, any

| | Чекає | Результат | Відхиляється |
|---|---|---|---|
| \`Promise.all\` | усі | масив значень у порядку вхідних | при першій помилці (інші продовжують виконуватись!) |
| \`Promise.allSettled\` | усі | \`[{status, value \\| reason}]\` | ніколи |
| \`Promise.race\` | перший settled | його значення/помилка | якщо перший — помилка |
| \`Promise.any\` | перший fulfilled | значення | \`AggregateError\`, коли всі відхилені |

Порожній масив: \`all\` → \`[]\`, \`any\` → AggregateError, \`race\` — вічно pending. Паралельні незалежні запити — \`Promise.all\` замість послідовних \`await\`.

## async / await

- \`async\`-функція **завжди** повертає проміс; \`return x\` → resolve(x), \`throw\` → reject;
- \`await\` ставить функцію на паузу до settle промісу; продовження — мікрозадачею; код до першого \`await\` виконується синхронно;
- помилки — звичайним \`try/catch\`;
- паралельність: \`const [a, b] = await Promise.all([getA(), getB()])\` — не \`await\` у циклі для незалежних запитів;
- \`await\` у \`forEach\` не чекає — \`for...of\` (послідовно) або \`Promise.all(items.map(...))\` (паралельно);
- top-level \`await\` — у ES-модулях.

## Утиліти: retry, пул, кеш, скасування

- **retry** з експоненційною затримкою і jitter, лише для тимчасових помилок і ідемпотентних операцій;
- **пул** з обмеженням паралельності (\`mapLimit(items, 3, fn)\`) — не завалити сервер сотнею запитів;
- **дедуплікація** однакових запитів «у польоті» + кеш з TTL;
- **таймаут:** \`Promise.race\` з таймером або \`AbortSignal.timeout(ms)\`;
- **скасування:** \`AbortController\` — \`fetch(url, { signal })\`, \`addEventListener(..., { signal })\`, власні функції перевіряють \`signal.aborted\` і слухають \`abort\`; \`AbortSignal.any([...])\` — комбінування.

## Помилки в асинхронному коді

- \`try/catch\` ловить лише те, що **почекали** (\`await\`); проміс без \`await\` і без \`.catch\` — unhandled rejection;
- **гонка відповідей** (race condition): відповідь на старий запит приходить після нового і перезаписує стан → скасування попереднього або перевірка «актуальності» (id запиту);
- **async у обробниках подій:** помилки треба ловити всередині, інакше — unhandled;
- \`Promise.all\` при першій помилці не скасовує інші запити — використовуйте \`AbortController\`;
- \`async\` колбек у \`setTimeout\`/\`addEventListener\` — винятки не повертаються викликачу.

## Асинхронна ітерація: for await і async-генератори

\`\`\`js
async function* paginate(fetchPage) {
  let cursor = null;
  while (true) {
    const { items, nextCursor } = await fetchPage(cursor);
    yield* items;
    if (nextCursor == null) return;
    cursor = nextCursor;
  }
}
for await (const order of paginate(api.orders)) {
  if (order.id === target) break;     // решта сторінок не запитується
}
\`\`\`
- \`next()\` async-генератора завжди повертає проміс: \`for await\` чекає на кожному кроці — тіло циклу виконується після поточного синхронного коду;
- генератор **лінивий** і зупиняється на \`break\` (викликається \`return()\`);
- \`for await\` працює з \`Symbol.asyncIterator\` і ітерабельними промісів; так читають потоки (Node.js, браузерні \`ReadableStream\` із підтримкою async-ітерації).

## Типові питання

- **Як працює event loop? Мікро- vs макрозадачі.**
- **Що виведе код з setTimeout, then і queueMicrotask?**
- **Promise.all vs allSettled vs race vs any.**
- **Як працює async/await під капотом?**
- **Як скасувати запит і уникнути гонки відповідей?**
- **Напишіть promisify / retry / Promise.all.**
`});
