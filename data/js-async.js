FE.topic('js-async', {
  intro: `
## Event loop за 30 секунд

JS однопотоковий: є **стек викликів (call stack)**, **черга макрозадач (macrotask / task queue)** і **черга мікрозадач (microtask queue)**.

Один «оберт» циклу подій (event loop):
1. Взяти **одну** макрозадачу (скрипт, \`setTimeout\`, \`setInterval\`, подія DOM, \`MessageChannel\`, I/O) і виконати до кінця.
2. Виконати **всі** мікрозадачі (\`Promise.then/catch/finally\`, \`await\`-продовження, \`queueMicrotask\`, \`MutationObserver\`), включно з доданими під час виконання.
3. За потреби — рендер: \`requestAnimationFrame\` → style → layout → paint.
4. Повторити.

| Що | Куди потрапляє |
|---|---|
| Синхронний код, executor \`new Promise(fn)\` | одразу, у стеку |
| \`.then/.catch/.finally\`, код після \`await\` | мікрозадача |
| \`queueMicrotask(fn)\` | мікрозадача |
| \`setTimeout(fn, 0)\`, \`setInterval\` | макрозадача (мінімум ~0–4 мс) |
| \`requestAnimationFrame\` | перед наступним рендером |

\`\`\`js
console.log(1);
setTimeout(() => console.log(2));
Promise.resolve().then(() => console.log(3));
console.log(4);
// 1 4 3 2
\`\`\`

## Promise
- Стани: \`pending\` → \`fulfilled\` | \`rejected\`. Встановлений (settled) стан **незмінний**: повторні \`resolve/reject\` ігноруються.
- \`then\` завжди повертає **новий** проміс. Повернули значення → наступний \`then\` отримає його; повернули проміс → ланцюжок чекає на нього; кинули помилку → відхилення.
- \`then(onOk, onErr)\`: \`onErr\` **не ловить** помилки з \`onOk\` — для цього \`.catch\` нижче.
- \`finally\` не отримує значення і (якщо не кинув) **не змінює** результат.
- Резолв промісом / thenable додає **2 зайві тіки** мікрозадач.

| Комбінатор | Виконується | Відхиляється | \`[]\` |
|---|---|---|---|
| \`Promise.all\` | всі успішні → масив у порядку входу | перша помилка | \`[]\` |
| \`Promise.allSettled\` | завжди, \`{status, value/reason}\` | ніколи | \`[]\` |
| \`Promise.race\` | перший встановлений | перший встановлений | вічно pending |
| \`Promise.any\` | перший успішний | всі впали → \`AggregateError\` | \`AggregateError\` |

## async/await
- \`async\` функція **завжди** повертає проміс; \`throw\` → rejected.
- \`await x\` = «підпишись на \`Promise.resolve(x)\` і продовж у мікрозадачі».
- Послідовно: \`await a(); await b();\`. Паралельно: \`await Promise.all([a(), b()])\`.
- \`arr.forEach(async ...)\` **не чекає** — використовуйте \`for...of\` або \`Promise.all(arr.map(...))\`.

## Пастки
- \`fetch\` не відхиляється на 404/500 — перевіряйте \`res.ok\`.
- Нескінченні мікрозадачі блокують рендер і таймери (starvation).
- \`setInterval\` дрейфує і «накопичується» — краще рекурсивний \`setTimeout\`.
- Необроблені відхилення → подія \`unhandledrejection\`.
- Скасування — \`AbortController\` / \`AbortSignal\`; «гонка» відповідей — перевіряйте, що відповідь досі актуальна.
`,
  groups: [
    { id: 'event-loop', title: 'Event loop: стек, черга, таймери' },
    { id: 'microtasks', title: 'Мікрозадачі vs макрозадачі' },
    { id: 'promise-basics', title: 'Promise: стани і створення' },
    { id: 'chaining', title: 'Ланцюжки then і обробка помилок' },
    { id: 'combinators', title: 'Комбінатори: all, allSettled, race, any' },
    { id: 'async-await', title: 'async / await' },
    { id: 'utilities', title: 'Утиліти: retry, пул, кеш, скасування' },
    { id: 'async-errors', title: 'Помилки в асинхронному коді' },
    { id: 'async-iteration', title: 'Асинхронна ітерація: for await і async-генератори' }
  ],
  items: [
    // ------------------------------------------------------------ Event loop: стек, черга, таймери
    {
      id: 'async-event-loop-theory',
      group: 'event-loop',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Як працює event loop?',
      tags: [
        'event-loop'
      ],
      question: 'Поясніть, як працює event loop у браузері. Що таке call stack, черга макрозадач і мікрозадач? Чому JS однопотоковий, але не блокується на мережевих запитах? Оберіть **усі** правильні твердження.',
      choices: [
        'Поки call stack не порожній, жоден колбек з черг не виконується — навіть таймер, що вже «спрацював»',
        'Браузер виконує колбеки `fetch` паралельно з основним кодом в окремому потоці JS-рушія',
        'За оберт виконується одна макрозадача, потім уся черга мікрозадач, і лише потім можливий рендер',
        '`setTimeout(fn, 0)` виконається раніше за `Promise.resolve().then(...)`, бо його заплановано першим',
        'Важкий синхронний цикл блокує кліки, таймери й рендер, доки не завершиться'
      ],
      answer: `
- **Один потік, один call stack.** Таймери, мережу, I/O виконує середовище (Web APIs) і по завершенні ставить колбек у **чергу**.
- **Макрозадачі:** скрипт, \`setTimeout\`/\`setInterval\`, події DOM, \`MessageChannel\`.
- **Мікрозадачі:** \`then/catch/finally\`, продовження після \`await\`, \`queueMicrotask\`, \`MutationObserver\`.
- **Оберт циклу:** одна макрозадача → **усі** мікрозадачі (включно з новими) → за потреби рендер (\`requestAnimationFrame\` → style → layout → paint).

\`\`\`js
console.log('sync 1');
setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('micro'));
console.log('sync 2');
// sync 1, sync 2, micro, timeout
\`\`\`
- \`setTimeout(fn, 0)\` = «не раніше, ніж стек звільниться і мікрозадачі виконаються».
- Довгий синхронний код блокує все → ділити на шматки (\`setTimeout\`, \`scheduler.yield()\`) або Web Worker.
- Node.js: фази (timers, poll, check) і \`process.nextTick\` (раніше за проміси).
`,
      correct: [0, 2, 4],
      why: [
        'Так: event loop бере нову задачу лише коли стек порожній — тому «спрацьований» таймер чекає, доки синхронний код не завершиться.',
        'Ні: мережу обробляє браузер, а колбек усе одно виконується в єдиному JS-потоці, коли до нього дійде черга.',
        'Так: це і є один «оберт»: одна макрозадача → уся черга мікрозадач → (можливо) рендер кадру.',
        'Ні: колбек `then` — мікрозадача, вона завжди виконується раніше за наступну макрозадачу (таймер).',
        'Так: поки стек зайнятий циклом, event loop не може взяти ні клік, ні таймер, ні рендер.'
      ],
      hint: 'Розкажіть про один «оберт» циклу: скільки макрозадач і скільки мікрозадач виконується за раз, і де тут рендер.',
      keyPoints: [
        'Один потік і один call stack; асинхронні операції виконує середовище (Web APIs)',
        'Макрозадачі: скрипт, таймери, події; мікрозадачі: проміси, await, queueMicrotask',
        'За оберт: одна макрозадача → всі мікрозадачі → (можливо) рендер',
        'setTimeout 0 виконається після всіх мікрозадач',
        'Довгий синхронний код блокує рендер і взаємодію'
      ],
      followUps: [
        'Де в циклі виконується requestAnimationFrame?',
        'Що буде, якщо в then рекурсивно додавати нові then?',
        'Чим event loop у Node.js відрізняється від браузерного?',
        'Як розбити важке обчислення, щоб не блокувати UI?'
      ]
    },
    {
      id: 'async-quiz-timeout-zero',
      group: 'event-loop',
      type: 'quiz',
      level: 1,
      interview: true,
      title: 'setTimeout з нулем',
      tags: [
        'event-loop'
      ],
      question: `
Що виведе код?

\`\`\`js
console.log('A');
setTimeout(() => console.log('B'), 0);
console.log('C');
\`\`\`
`,
      options: [
        '`A B C`',
        '`A C B`',
        '`B A C`',
        'Залежить від браузера'
      ],
      answer: 1,
      why: [
        'Ні: `setTimeout(fn, 0)` не викликає `fn` одразу — лише ставить її в чергу макрозадач.',
        'Так: спершу весь синхронний скрипт (`A`, `C`), колбек таймера — коли стек звільниться.',
        'Ні: колбек не може виконатися до синхронного коду, що стоїть перед ним.',
        'Ні: порядок гарантований специфікацією event loop і однаковий у всіх браузерах.'
      ],
      hint: 'Коли саме event loop може взяти колбек таймера з черги?',
      explanation: `
Колбек таймера — окрема макрозадача. Поточний скрипт (теж макрозадача) виконується до кінця, і лише потім event loop бере колбек з черги. «0 мс» означає «щойно звільниться стек», а не «одразу».
`
    },
    {
      id: 'async-timers-theory',
      group: 'event-loop',
      type: 'theory',
      level: 3,
      title: 'Точність таймерів і дрейф setInterval',
      tags: [
        'timers',
        'event-loop'
      ],
      question: 'Чи гарантує setTimeout(fn, 100) виклик рівно через 100 мс? Чим рекурсивний setTimeout кращий за setInterval? Що таке дрейф таймера і як його компенсувати? Оберіть **усі** правильні твердження.',
      choices: [
        'Затримка — це мінімум: колбек виконається лише коли стек вільний, а у фоні таймери ще й обмежуються',
        '`setInterval` чекає, поки асинхронний колбек завершиться, тож запити з нього ніколи не накладаються',
        'Дрейф лікують зменшенням затримки на 4 мс у кожному виклику, щоб компенсувати clamp браузера',
        'Рекурсивний `setTimeout` планує наступний виклик після завершення поточного й дозволяє міняти затримку',
        'Дрейф компенсують лічильником тиків, а не порівнянням з абсолютним часом `performance.now()`'
      ],
      answer: `
- **Затримка — мінімум, не гарантія:** колбек потрапить у чергу не раніше ніж через \`ms\`, але виконається, лише коли стек вільний. Вкладені таймери — ≥4 мс; фонові вкладки — до 1 разу/с; максимум 2³¹−1 мс.
- **\`setInterval\`** рахує від старту попереднього виклику і не чекає асинхронної роботи → виклики злипаються чи накладаються.
- **Рекурсивний \`setTimeout\`** планує наступний виклик після завершення поточного:
\`\`\`js
function poll() {
  checkStatus(() => {               // колбек — коли перевірка завершилась
    timer = setTimeout(poll, 5000);  // наступна — лише після цього
  });
}
\`\`\`
- **Дрейф** — накопичена похибка тиків. Компенсація — від абсолютного часу:
\`\`\`js
const next = start + n * 1000;
setTimeout(tick, Math.max(0, next - performance.now()));
\`\`\`
- Анімації — \`requestAnimationFrame\` + стан з \`timestamp\`.
`,
      correct: [0, 3],
      why: [
        'Так: затримка — мінімум; далі колбек чекає вільного стеку, вкладені таймери отримують ≥4 мс, а фонові вкладки — throttling.',
        'Ні: `setInterval` не чекає завершення асинхронної роботи колбека — запити можуть накладатися.',
        'Ні: «мінус 4 мс» нічого не гарантує — дрейф лікують розрахунком від абсолютного часу.',
        'Так: наступний виклик планується в кінці поточного, тож пауза між викликами гарантована, а затримку можна міняти (backoff).',
        'Ні: навпаки — лічильник тиків накопичує похибку, а `performance.now()` дає реальний час і компенсує дрейф.'
      ],
      keyPoints: [
        'Затримка — мінімальна, реальний виклик пізніше (черга, clamp 4 мс, throttling у фоні)',
        'setInterval не чекає завершення колбеку, асинхронні виклики можуть накладатися',
        'Рекурсивний setTimeout гарантує паузу між викликами, дозволяє backoff',
        'Дрейф компенсується розрахунком від абсолютного часу (performance.now)'
      ],
      followUps: [
        'Чому для таймера на екрані краще Date.now/performance.now, ніж лічильник тіків?',
        'Що станеться з setTimeout(fn, 2 ** 31)?',
        'Як зупинити рекурсивний setTimeout?'
      ]
    },
    {
      id: 'async-process-in-chunks',
      group: 'event-loop',
      type: 'code',
      level: 2,
      title: 'Обробка великого списку порціями, не блокуючи UI',
      tags: [
        'event-loop',
        'timers',
        'performance'
      ],
      description: `
**Завдання.** Обробіть великий масив **порціями**: одну порцію — одразу, кожну наступну — в окремій макрозадачі через \`setTimeout(…, 0)\`, щоб між порціями браузер встигав малювати й обробляти кліки.

**Де трапляється:** рендер/фільтрація 50 000 рядків таблиці, парсинг великого файлу, підсвітка синтаксису — без «замерзання» сторінки. На співбесіді: «як не блокувати UI важким циклом?».

**Що написати**
- \`processInChunks(items, fn, { chunkSize = 100, onDone } = {})\` → нічого не повертає:
  - викликає \`fn(item, index)\` для кожного елемента по порядку;
  - перша порція (\`chunkSize\` елементів) — **синхронно** під час виклику;
  - кожна наступна — через \`setTimeout(…, 0)\`;
  - після останнього елемента один раз викликає \`onDone()\`.

**Приклад**
\`\`\`js
processInChunks(rows, renderRow, {
  chunkSize: 500,
  onDone: () => console.log('готово'),
});
// 500 рядків одразу, далі по 500 за кожен «оберт» event loop
\`\`\`

**Як це працює:** поки виконується синхронний код, event loop не може взяти ні клік, ні рендер. \`setTimeout(next, 0)\` завершує поточну макрозадачу і ставить продовження в чергу — між ними браузер встигає намалювати кадр і обробити події.

**Врахуйте:** порожній масив → \`onDone\` одразу, без таймерів; \`items.length\` не кратне \`chunkSize\`.
`,
      starter: `function processInChunks(items, fn, { chunkSize = 100, onDone = () => {} } = {}) {
  let index = 0; // скільки елементів уже оброблено

  function runChunk() {
    // 1. Обробіть до chunkSize елементів, починаючи з index: fn(items[index], index)
    // 2. Якщо ще щось лишилось — setTimeout(runChunk, 0)
    // 3. Інакше — onDone()
    // TODO
  }

  runChunk(); // перша порція — одразу
}

// Спробуйте в консолі:
// processInChunks([1, 2, 3, 4, 5], (x) => console.log(x), { chunkSize: 2, onDone: () => console.log('done') });
`,
      solution: `function processInChunks(items, fn, { chunkSize = 100, onDone = () => {} } = {}) {
  let index = 0;

  function runChunk() {
    const end = Math.min(index + chunkSize, items.length);
    for (; index < end; index++) fn(items[index], index);
    // віддаємо керування event loop: між порціями браузер може рендерити й обробляти події
    if (index < items.length) setTimeout(runChunk, 0);
    else onDone();
  }

  runChunk();
}
`,
      hints: [
        'Межа порції: `const end = Math.min(index + chunkSize, items.length)`, далі цикл `for (; index < end; index++)`.',
        'Після циклу: `index < items.length ? setTimeout(runChunk, 0) : onDone()`.'
      ],
      tests: [
        {
          name: 'перша порція — одразу, решта — у наступних макрозадачах',
          code: 'useFakeTimers();\nconst fn = mockFn();\nprocessInChunks([1, 2, 3, 4, 5], fn, { chunkSize: 2 });\nexpect(fn).toHaveBeenCalledTimes(2);\nrunOnlyPendingTimers();\nexpect(fn).toHaveBeenCalledTimes(4);\nrunOnlyPendingTimers();\nexpect(fn).toHaveBeenCalledTimes(5);'
        },
        {
          name: 'між порціями запланований таймер',
          code: 'useFakeTimers();\nprocessInChunks([1, 2, 3], () => {}, { chunkSize: 1 });\nexpect(getTimerCount()).toBe(1);'
        },
        {
          name: 'fn отримує елемент та індекс по порядку',
          code: 'useFakeTimers();\nconst seen = [];\nprocessInChunks(["a", "b", "c"], (x, i) => seen.push([x, i]), { chunkSize: 2 });\nrunAllTimers();\nexpect(seen).toEqual([["a", 0], ["b", 1], ["c", 2]]);'
        },
        {
          name: 'onDone один раз після останньої порції',
          code: 'useFakeTimers();\nconst onDone = mockFn();\nprocessInChunks([1, 2, 3], () => {}, { chunkSize: 2, onDone });\nexpect(onDone).not.toHaveBeenCalled();\nrunAllTimers();\nexpect(onDone).toHaveBeenCalledTimes(1);\nexpect(getTimerCount()).toBe(0);'
        },
        {
          name: 'порожній масив — onDone одразу, без таймерів',
          code: 'useFakeTimers();\nconst fn = mockFn();\nconst onDone = mockFn();\nprocessInChunks([], fn, { chunkSize: 2, onDone });\nexpect(fn).not.toHaveBeenCalled();\nexpect(onDone).toHaveBeenCalledTimes(1);\nexpect(getTimerCount()).toBe(0);'
        }
      ],
      explanation: `
Кожна порція — окрема макрозадача; між ними event loop виконує мікрозадачі, рендер і обробники подій. Сторінка лишається чуйною, хоча загальний час трохи більший.

**Складність:** O(n) викликів \`fn\`, O(n / chunkSize) макрозадач.

**Типові помилки:** ділити через \`Promise.resolve().then\` (мікрозадачі не дають рендеру); забути \`onDone\` для порожнього масиву.

**Що можуть спитати далі:** чим краще \`scheduler.yield()\`/\`requestIdleCallback\`; коли винести роботу у Web Worker?
`
    },
    // ------------------------------------------------------------ Мікрозадачі vs макрозадачі
    {
      id: 'async-quiz-micro-vs-macro',
      group: 'microtasks',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Promise.then проти setTimeout',
      tags: [
        'event-loop',
        'microtasks'
      ],
      question: `
**Як це працює:** \`Promise.resolve().then(fn)\` ставить \`fn\` у чергу **мікрозадач**, а \`setTimeout(fn, 0)\` — у чергу **макрозадач**. Після кожної макрозадачі (і після всього скрипта) event loop виконує **всі** мікрозадачі, і лише потім бере наступну макрозадачу.

Що виведе код?

\`\`\`js
console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);
\`\`\`
`,
      options: [
        '`1 2 3 4`',
        '`1 4 2 3`',
        '`1 4 3 2`',
        '`1 3 4 2`'
      ],
      answer: 2,
      why: [
        'Ні: таймер і `then` не виконуються синхронно — `4` друкується раніше за обидва.',
        'Ні: черги різні; мікрозадача `3` виконується до наступної макрозадачі `2`, хоч таймер поставлено першим.',
        'Так: синхронно `1 4`, потім усі мікрозадачі (`3`), потім макрозадача-таймер (`2`).',
        'Ні: колбек `then` завжди асинхронний, навіть для вже виконаного промісу — тому `3` після `4`.'
      ],
      hint: 'Яка черга спорожнюється повністю одразу після завершення поточної макрозадачі?',
      explanation: `
1. Синхронно: \`1\`, таймер → макрозадачі, \`then\` → мікрозадачі, \`4\`.
2. Скрипт завершився → усі мікрозадачі: \`3\`.
3. Наступна макрозадача: \`2\`.
`
    },
    {
      id: 'async-microtasks-render-theory',
      group: 'microtasks',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Мікрозадачі, рендер і microtask starvation',
      tags: [
        'event-loop',
        'microtasks',
        'rendering'
      ],
      question: 'Чим мікрозадачі відрізняються від макрозадач з точки зору рендеру? Що таке microtask starvation і як requestAnimationFrame вписується в event loop?',
      choices: [
        'Між двома мікрозадачами браузер встигає намалювати кадр, тому зміни DOM у кожній з них видно окремо',
        '`requestAnimationFrame` — це мікрозадача, тож виконується одразу після поточного синхронного коду',
        'Рекурсивний `Promise.resolve().then(loop)` вішає сторінку, а `setTimeout(loop, 0)` — ні: між тасками є рендер',
        'Важкі обчислення варто ділити через проміси: кожен `then` віддає керування браузеру для рендеру'
      ],
      answer: `
- Після кожної макрозадачі виконується **вся** черга мікрозадач (разом із новими) — лише потім рендер і наступна макрозадача.
\`\`\`js
function loop() { Promise.resolve().then(loop); } // сторінка зависає назавжди
function loop2() { setTimeout(loop2, 0); }         // сторінка живе
\`\`\`
- **Microtask starvation:** рекурсивні мікрозадачі не дають циклу дійти до рендеру, кліків і таймерів.
- **rAF** — у кроці рендеру: resize/scroll → rAF-колбеки → style → layout → paint. Найкраще місце для анімацій.
- Зміни DOM у кількох мікрозадачах поспіль користувач не побачить окремо.
- Важка робота — шматками через макрозадачі або у Worker; \`queueMicrotask\` — «після поточного коду, але до рендеру» (батчинг оновлень у фреймворках).
- Long task > 50 мс погіршує INP.
`,
      correct: 2,
      why: [
        'Ні: між мікрозадачами рендеру немає — браузер малює лише фінальний стан після всієї черги.',
        'Ні: rAF — не мікрозадача, він виконується в кроці рендеру, перед paint, раз на кадр.',
        'Так: черга мікрозадач ніколи не порожніє (starvation), а між макрозадачами браузер встигає рендерити й обробляти події.',
        'Ні: `then` не віддає керування рендеру — важку роботу ділять через макрозадачі (`setTimeout`, `scheduler.yield`) або Worker.'
      ],
      hint: 'Подумайте, коли браузер має шанс намалювати кадр і що може йому завадити.',
      keyPoints: [
        'Мікрозадачі виконуються всі підряд, до рендеру й до наступної макрозадачі',
        'Рекурсивні мікрозадачі блокують рендер і події (starvation), макрозадачі — ні',
        'rAF виконується перед paint, раз на кадр',
        'Важку роботу ділимо на макрозадачі або виносимо у Worker'
      ],
      followUps: [
        'Чим requestIdleCallback відрізняється від requestAnimationFrame?',
        'Як React/Vue використовують мікрозадачі для батчингу оновлень?',
        'Що таке long task і як він впливає на INP?'
      ]
    },
    {
      id: 'async-quiz-timeout-in-then',
      group: 'microtasks',
      type: 'quiz',
      level: 3,
      title: 'Таймери всередині then і then всередині таймерів',
      tags: [
        'event-loop',
        'microtasks'
      ],
      question: `
Що виведе код?

\`\`\`js
setTimeout(() => {
  console.log('t1');
  Promise.resolve().then(() => console.log('p1'));
}, 0);
setTimeout(() => console.log('t2'), 0);
Promise.resolve().then(() => {
  console.log('p2');
  setTimeout(() => console.log('t3'), 0);
});
\`\`\`
`,
      options: [
        '`p2 t1 t2 p1 t3`',
        '`t1 p1 t2 p2 t3`',
        '`p2 t1 p1 t2 t3`',
        '`p2 t1 p1 t3 t2`'
      ],
      answer: 2,
      why: [
        'Ні: мікрозадача `p1` виконується одразу після макрозадачі `t1`, ще до `t2`.',
        'Ні: мікрозадача `p2` зі скрипта виконується раніше за будь-який таймер.',
        'Так: `p2` → `t1` → одразу його мікрозадача `p1` → `t2` → `t3` (доданий у кінець черги).',
        'Ні: `t3` поставлено в чергу пізніше за `t2` з тією ж затримкою, тож він виконається після `t2`.'
      ],
      hint: 'Мікрозадачі виконуються після **кожної** макрозадачі, а не лише після скрипта.',
      explanation: `
1. Після скрипта: макрозадачі \`[t1, t2]\`, мікрозадачі \`[p2]\` → \`p2\` додає \`t3\` у кінець: \`[t1, t2, t3]\`.
2. \`t1\` додає мікрозадачу \`p1\` → вона виконується одразу після \`t1\`.
3. Далі \`t2\`, \`t3\`. Мікрозадачі спорожнюються після **кожної** макрозадачі.
`
    },
    // ------------------------------------------------------------ Promise: стани і створення
    {
      id: 'async-promise-states-theory',
      group: 'promise-basics',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Що таке Promise і які в нього стани?',
      tags: [
        'promises'
      ],
      question: 'Що таке Promise? Які в нього стани, чи може стан змінитися після встановлення? Як працює ланцюжок then і що повертає then?',
      choices: [
        '`then` завжди повертає новий проміс, стан якого визначає повернуте з колбека значення, проміс або `throw`',
        'Після `resolve(1)` виклик `reject(err)` переводить проміс у `rejected`, бо пізніший виклик перемагає',
        'І executor `new Promise(fn)`, і колбеки `then` виконуються асинхронно, як мікрозадачі',
        '`resolve(otherPromise)` створює проміс у промісі, тому в `then` його доведеться розгортати вручну'
      ],
      answer: `
- **Promise** — об'єкт-результат асинхронної операції. Стани: \`pending\` → \`fulfilled\` | \`rejected\` (разом — **settled**). Перехід **один раз**.
\`\`\`js
const p = new Promise((resolve, reject) => {
  // executor виконується СИНХРОННО
  resolve(1);
  reject(new Error('ignored')); // уже fulfilled
});
\`\`\`
- **\`then(onOk, onErr)\` повертає новий проміс:** значення → fulfilled; проміс → чекає на нього; \`throw\` → rejected; не-функція в \`then\` → значення проходить наскрізь.
- Колбеки \`then\` — завжди асинхронно (мікрозадача), навіть для готового промісу.
- \`throw\` в executor = \`reject\`.
- Проміс не скасовується — для цього \`AbortController\`.
`,
      correct: 0,
      why: [
        'Так: повернули значення → новий проміс виконано ним; повернули проміс → «приймає» його стан; кинули → відхилено.',
        'Ні: стан встановлюється один раз — перший `resolve(1)` перемагає, наступні виклики ігноруються.',
        'Ні: executor виконується синхронно в момент `new Promise`; асинхронні лише колбеки `then`.',
        'Ні: проміси розгортаються (flatten) — `resolve(otherPromise)` чекає на нього, вкладеного промісу не буде.'
      ],
      keyPoints: [
        'Три стани: pending, fulfilled, rejected; settled — незмінний',
        'then повертає новий проміс; значення/проміс/помилка з колбеку визначають його стан',
        'Колбеки завжди асинхронні (мікрозадачі), executor — синхронний',
        'Помилка пропускає then без onRejected і доходить до найближчого catch',
        'Проміси розгортаються (flatten) і не скасовуються'
      ],
      followUps: [
        'Чим Promise.resolve(p) відрізняється від new Promise(r => r(p))?',
        'Що таке thenable?',
        'Чому колбеки then асинхронні навіть для готового промісу?'
      ]
    },
    {
      id: 'async-quiz-executor-sync',
      group: 'promise-basics',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Executor промісу і queueMicrotask',
      tags: [
        'event-loop',
        'microtasks'
      ],
      question: `
Що виведе код?

\`\`\`js
console.log('start');
const p = new Promise((resolve) => {
  console.log('executor');
  resolve('done');
  console.log('after resolve');
});
p.then((v) => console.log(v));
queueMicrotask(() => console.log('micro'));
console.log('end');
\`\`\`
`,
      options: [
        '`start executor after resolve end done micro`',
        '`start executor end done micro after resolve`',
        '`start end executor after resolve done micro`',
        '`start executor after resolve end micro done`'
      ],
      answer: 0,
      why: [
        'Так: executor синхронний і `resolve` його не перериває; `then` і `queueMicrotask` — мікрозадачі у порядку постановки.',
        'Ні: `resolve()` не зупиняє executor — `after resolve` друкується одразу, синхронно.',
        'Ні: функція, передана в `new Promise`, викликається одразу, ще до `end`.',
        'Ні: обидві — мікрозадачі однієї черги (FIFO); `then` поставлено раніше, тож `done` перед `micro`.'
      ],
      hint: 'Функція, передана в `new Promise`, викликається синхронно. А `resolve` перериває виконання executor?',
      explanation: `
- Executor виконується **синхронно** в момент \`new Promise\`; \`resolve\` лише змінює стан.
- \`p.then\` на готовому промісі ставить мікрозадачу №1, \`queueMicrotask\` — №2.
- Після синхронного \`end\` — мікрозадачі по черзі: \`done\`, \`micro\`.
`
    },
    {
      id: 'async-quiz-settle-once',
      group: 'promise-basics',
      type: 'quiz',
      level: 2,
      title: 'Повторний resolve/reject',
      tags: [
        'promises'
      ],
      question: `
Що виведе код?

\`\`\`js
const p = new Promise((resolve, reject) => {
  resolve('ok');
  reject(new Error('fail'));
  resolve('again');
  throw new Error('boom');
});

p.then((v) => console.log('then:', v))
 .catch((e) => console.log('catch:', e.message));
\`\`\`
`,
      options: [
        '`catch: boom`',
        '`catch: fail`',
        '`then: again`',
        '`then: ok`'
      ],
      answer: 3,
      why: [
        'Ні: `throw` після `resolve` ігнорується — проміс уже встановлений.',
        'Ні: `reject` після `resolve` нічого не змінює — стан встановлюється один раз.',
        'Ні: «останній виклик перемагає» — хибно; перемагає перший.',
        'Так: перший `resolve(\'ok\')` фіксує стан `fulfilled`, усе подальше ігнорується.'
      ],
      hint: 'Скільки разів проміс може змінити стан?',
      explanation: `
Стан промісу встановлюється **один раз**: перший \`resolve('ok')\` → \`fulfilled\`. Подальші \`reject\`, \`resolve\` і навіть \`throw\` в executor ігноруються.
`
    },
    {
      id: 'async-delay',
      group: 'promise-basics',
      type: 'code',
      level: 1,
      title: 'delay(ms, value)',
      tags: [
        'promises',
        'timers'
      ],
      description: `
**Завдання.** Напишіть \`delay(ms, value)\` — проміс, що виконується значенням \`value\` через \`ms\` мс.

**Де трапляється:** паузи між повторними спробами запиту, анімації, тести, демо «завантаження». Класика співбесід як перша задача на проміси.

**Що написати**
- \`delay(ms, value)\` → \`Promise\`, який через \`ms\` мс виконується значенням \`value\` (без \`value\` — \`undefined\`).

**Приклад**
\`\`\`js
delay(100).then(() => console.log('минуло 100 мс'));
delay(50, 'done').then((v) => console.log(v)); // 'done'
\`\`\`

**Як це працює:** \`new Promise((resolve, reject) => { ... })\` викликає функцію-executor одразу і дає дві функції: \`resolve(value)\` виконує проміс, \`reject(err)\` — відхиляє. Тут достатньо викликати \`resolve\` з колбека \`setTimeout\`.

**Врахуйте:** не викликати \`resolve\` раніше часу; повертати саме проміс.
`,
      starter: `function delay(ms, value) {
  // 1. Поверніть new Promise((resolve) => { ... })
  // 2. Усередині: через ms мс викличте resolve(value)
  // TODO
}

// Спробуйте в консолі:
// delay(500, 'hi').then(console.log); // через 0.5 с: hi
`,
      solution: `function delay(ms, value) {
  return new Promise((resolve) => setTimeout(resolve, ms, value));
}
`,
      hints: [
        'Поверніть `new Promise((resolve) => setTimeout(...))`.',
        '`setTimeout(() => resolve(value), ms)` або коротше `setTimeout(resolve, ms, value)`.'
      ],
      tests: [
        {
          name: 'повертає проміс',
          code: 'useFakeTimers();\nexpect(delay(10)).toBeInstanceOf(Promise);'
        },
        {
          name: 'не виконується раніше часу',
          code: 'useFakeTimers();\nlet done = false;\ndelay(100).then(() => { done = true; });\nadvanceTimersByTime(99);\nawait flushPromises();\nexpect(done).toBe(false);\nadvanceTimersByTime(1);\nawait flushPromises();\nexpect(done).toBe(true);'
        },
        {
          name: 'виконується переданим значенням',
          code: 'useFakeTimers();\nconst p = delay(50, "done");\nadvanceTimersByTime(50);\nawait expect(p).resolves.toBe("done");'
        },
        {
          name: 'без value → undefined',
          code: 'useFakeTimers();\nconst p = delay(0);\nadvanceTimersByTime(0);\nawait expect(p).resolves.toBeUndefined();'
        }
      ],
      explanation: `
Проміс «загортає» колбечний API: \`setTimeout\` викличе \`resolve\` через \`ms\`. Третій аргумент \`setTimeout\` передається в колбек: \`setTimeout(resolve, ms, value)\`.

**Типові помилки:** \`setTimeout(resolve(value), ms)\` — виклик одразу; забули \`return\`.

**Що можуть спитати далі:** як скасувати \`delay\` (\`AbortSignal\`)? Як зробити версію, що відхиляється (\`timeout\`)?
`
    },
    {
      id: 'async-promisify',
      group: 'promise-basics',
      type: 'code',
      level: 2,
      interview: true,
      title: 'promisify для node-style колбеків',
      tags: [
        'promises',
        'callbacks'
      ],
      description: `
**Завдання.** Напишіть \`promisify(fn)\`: перетворює функцію з колбеком у стилі Node.js (\`callback(err, result)\` останнім аргументом) на функцію, що повертає проміс.

**Де трапляється:** старі API та бібліотеки на колбеках (Node \`fs\`, \`geolocation\`, SDK). Класика співбесід (аналог \`util.promisify\`).

**Що написати**
- \`promisify(fn)\` → нова функція \`(...args) => Promise\`:
  - викликає \`fn(...args, callback)\`;
  - \`err\` truthy → reject(\`err\`), інакше resolve(\`result\`);
  - зберігає \`this\` (для методів об'єктів);
  - синхронний \`throw\` у \`fn\` → reject.

**Приклад**
\`\`\`js
function readConfig(name, cb) {
  setTimeout(() => cb(null, { name }), 10);
}
const readConfigAsync = promisify(readConfig);
readConfigAsync('app').then(console.log); // { name: 'app' }
\`\`\`

**Як це працює:** усередині \`new Promise\` передаємо в \`fn\` власний колбек, який «перекладає» \`(err, result)\` у \`reject/resolve\`. \`throw\` всередині executor автоматично стає \`reject\`, а повторні виклики колбека ігноруються (стан — один раз).

**Врахуйте:** \`this\` — звичайна \`function\` + \`fn.call(this, ...)\` (у стрілки свого \`this\` немає).
`,
      starter: `function promisify(fn) {
  return function (...args) {
    // 1. Поверніть new Promise((resolve, reject) => { ... })
    // 2. Викличте fn з тим самим this: fn.call(this, ...args, callback)
    // 3. callback = (err, result) => err ? reject(err) : resolve(result)
    // TODO
  };
}

// Спробуйте в консолі:
// const sum = (a, b, cb) => cb(null, a + b);
// promisify(sum)(2, 3).then(console.log); // 5
`,
      solution: `function promisify(fn) {
  return function (...args) {
    // звичайна function — щоб отримати this виклику
    return new Promise((resolve, reject) => {
      // throw всередині executor автоматично перетворюється на reject
      fn.call(this, ...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}
`,
      hints: [
        'Колбек, який ви передаєте останнім: `(err, result) => (err ? reject(err) : resolve(result))`.',
        'Для `this` поверніть звичайну `function` і всередині стрілки executor викличте `fn.call(this, ...args, callback)`.'
      ],
      tests: [
        {
          name: 'резолвиться результатом',
          code: 'const fn = (a, b, cb) => cb(null, a + b);\nawait expect(promisify(fn)(2, 3)).resolves.toBe(5);'
        },
        {
          name: 'відхиляється помилкою',
          code: 'const fn = (cb) => cb(new Error("nope"));\nawait expect(promisify(fn)()).rejects.toThrow("nope");'
        },
        {
          name: 'працює з асинхронним колбеком',
          code: 'useFakeTimers();\nconst fn = (x, cb) => setTimeout(() => cb(null, x * 2), 100);\nconst p = promisify(fn)(21);\nadvanceTimersByTime(100);\nawait expect(p).resolves.toBe(42);'
        },
        {
          name: 'зберігає this',
          code: 'const obj = { base: 10, add(x, cb) { cb(null, this.base + x); } };\nobj.addAsync = promisify(obj.add);\nawait expect(obj.addAsync(5)).resolves.toBe(15);'
        },
        {
          name: 'синхронний throw → reject',
          code: 'const fn = () => { throw new Error("sync"); };\nlet p;\nexpect(() => { p = promisify(fn)(); }).not.toThrow();\nawait expect(p).rejects.toThrow("sync");'
        },
        {
          name: 'повторний виклик колбеку ігнорується',
          code: 'const fn = (cb) => { cb(null, 1); cb(null, 2); cb(new Error("late")); };\nawait expect(promisify(fn)()).resolves.toBe(1);'
        }
      ],
      explanation: `
Колбек перекладає \`(err, result)\` у \`reject/resolve\`. Повторні виклики колбека безпечні — проміс встановлюється один раз; синхронний \`throw\` в executor стає \`reject\`.

**Типові помилки:** стрілкова обгортка (губиться \`this\`); колбек першим аргументом; \`err !== null\` замість \`if (err)\`.

**Що можуть спитати далі:** \`callbackify\`; чому не можна промісифікувати \`setInterval\` чи події (колбек викликається багато разів)?
`
    },
    // ------------------------------------------------------------ Ланцюжки then і обробка помилок
    {
      id: 'async-quiz-then-non-function',
      group: 'chaining',
      type: 'quiz',
      level: 2,
      title: 'then з не-функцією',
      tags: [
        'promises'
      ],
      question: `
**Як це працює:** \`then\` чекає **функцію**. Якщо передати не функцію, вона ігнорується, а значення проходить далі ланцюжком без змін.

Що виведе код?

\`\`\`js
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .then(console.log);
\`\`\`
`,
      options: [
        '`1`',
        '`2`',
        '`3`',
        '`Promise {<fulfilled>: 3}`'
      ],
      answer: 0,
      why: [
        'Так: `then(2)` і `then(Promise.resolve(3))` отримали не функції, тож значення `1` пройшло наскрізь.',
        'Ні: `then(2)` не підставляє `2` — аргумент-не-функція ігнорується.',
        'Ні: проміс, переданий у `then` (а не повернутий з колбека), теж ігнорується.',
        'Ні: `console.log` отримує розгорнуте значення, а не проміс — і це `1`.'
      ],
      hint: 'Що робить `then`, якщо його аргумент — не функція?',
      explanation: `
Не-функція в \`then\` замінюється на \`x => x\`. Типовий баг: \`.then(doSomething())\` замість \`.then(() => doSomething())\` — функцію викликано одразу, а в \`then\` пішов її результат.
`
    },
    {
      id: 'async-quiz-then-onerror',
      group: 'chaining',
      type: 'quiz',
      level: 2,
      title: 'then(onOk, onErr) проти catch',
      tags: [
        'promises',
        'errors'
      ],
      question: `
Що виведе код?

\`\`\`js
Promise.resolve()
  .then(
    () => { throw new Error('A'); },
    (e) => console.log('handler 1:', e.message)
  )
  .catch((e) => console.log('handler 2:', e.message));
\`\`\`
`,
      options: [
        '`handler 1: A`',
        '`handler 2: A`',
        '`handler 1: A` і `handler 2: A`',
        'Нічого, помилка необроблена'
      ],
      answer: 1,
      why: [
        'Ні: другий аргумент `then` слухає лише вхідний проміс, а помилку кинуто в першому колбеку того самого `then`.',
        'Так: помилка з `onOk` відхиляє НОВИЙ проміс, і її ловить наступний `.catch`.',
        'Ні: `handler 1` не спрацює — вхідний проміс виконаний успішно.',
        'Ні: `.catch` нижче ланцюжка обробляє помилку, тож вона не лишається необробленою.'
      ],
      hint: 'Другий аргумент `then` обробляє відхилення якого саме промісу?',
      explanation: `
\`then(onOk, onErr)\`: обидва колбеки підписані на **попередній** проміс. Помилка з \`onOk\` відхиляє проміс, який повертає цей \`then\`, — його ловить наступний \`.catch\`. Тому \`.then(ok).catch(err)\` ловить більше, ніж \`.then(ok, err)\`.
`
    },
    {
      id: 'async-quiz-catch-recovers',
      group: 'chaining',
      type: 'quiz',
      level: 3,
      interview: true,
      title: 'Що відбувається після catch',
      tags: [
        'promises',
        'errors'
      ],
      question: `
Що виведе код?

\`\`\`js
Promise.reject(new Error('x'))
  .then(() => console.log('then 1'))
  .catch((e) => {
    console.log('catch', e.message);
    return 'recovered';
  })
  .then((v) => console.log('then 2', v))
  .catch(() => console.log('catch 2'))
  .finally(() => console.log('finally'));
\`\`\`
`,
      options: [
        '`catch x`, `finally`',
        '`then 1`, `catch x`, `then 2 recovered`, `finally`',
        '`catch x`, `catch 2`, `finally`',
        '`catch x`, `then 2 recovered`, `finally`'
      ],
      answer: 3,
      why: [
        'Ні: після `catch`, що повернув значення, ланцюжок відновлюється — `then 2` теж виконується.',
        'Ні: `then 1` пропускається — у нього немає обробника помилки.',
        'Ні: другий `catch` не спрацює — після першого `catch` проміс виконаний, помилки вже немає.',
        'Так: помилка пропускає `then 1`, `catch` повертає `\'recovered\'`, далі `then 2 recovered`, і `finally` — завжди.'
      ],
      hint: '`catch` — це просто `then(undefined, fn)`. Який стан матиме проміс, що його повертає `catch`, якщо обробник нормально повернув значення?',
      explanation: `
\`catch(fn)\` = \`then(undefined, fn)\`. Якщо обробник **повернув значення**, проміс після нього **виконаний** — ланцюжок відновився. Щоб помилка йшла далі, у \`catch\` треба \`throw err\`.
`
    },
    {
      id: 'async-fetch-json',
      group: 'chaining',
      type: 'code',
      level: 2,
      title: 'fetchJson: fetch + перевірка res.ok у ланцюжку then',
      tags: [
        'promises',
        'fetch',
        'errors'
      ],
      description: `
**Завдання.** Напишіть \`fetchJson(url)\` через ланцюжок \`then\` (без \`async/await\`): завантажити JSON і перетворити HTTP-помилки на відхилення промісу.

**Де трапляється:** обгортка над \`fetch\` є в кожному проєкті. Питання співбесіди: «чи відхиляється fetch на 404?» — ні.

**Що написати**
- \`fetchJson(url)\` → \`Promise\`:
  - статус 2xx (\`res.ok\`) → виконується розпарсеним тілом (\`res.json()\`);
  - інший статус → відхиляється \`Error('HTTP <status>')\`;
  - мережева помилка \`fetch\` → відхиляється нею ж.

**Приклад**
\`\`\`js
fetchJson('/api/user/1').then((user) => render(user));
fetchJson('/api/missing').catch((e) => console.log(e.message)); // 'HTTP 404'
\`\`\`

**Як це працює:** \`fetch\` відхиляється **лише** при мережевій помилці; 404/500 — це успішно отримана відповідь з \`res.ok === false\`. У ланцюжку \`then\`: \`throw\` у колбеку відхиляє наступний проміс, а повернутий проміс (\`res.json()\`) ланцюжок дочекається сам.

**Врахуйте:** не забути \`return\` перед \`res.json()\` і перед \`fetch(...)\`.
`,
      starter: `function fetchJson(url) {
  return fetch(url).then((res) => {
    // 1. Якщо !res.ok — кинути new Error('HTTP ' + res.status)
    // 2. Інакше повернути res.json() (це теж проміс — ланцюжок його дочекається)
    // TODO
    return res;
  });
}

// Спробуйте в консолі (з реальним API):
// fetchJson('https://jsonplaceholder.typicode.com/todos/1').then(console.log);
`,
      solution: `function fetchJson(url) {
  return fetch(url).then((res) => {
    // fetch не відхиляється на 404/500 — перевіряємо статус самі
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json(); // проміс: наступний then отримає вже розпарсені дані
  });
}
`,
      hints: [
        'Усередині `then`: `if (!res.ok) throw new Error(\'HTTP \' + res.status);`.',
        'Потім `return res.json();` — без `return` ланцюжок отримає `undefined`.'
      ],
      tests: [
        {
          name: 'повертає розпарсений JSON',
          code: 'mockFetch(() => ({ id: 1, name: "Ann" }));\nawait expect(fetchJson("/api/user")).resolves.toEqual({ id: 1, name: "Ann" });'
        },
        {
          name: 'запитує переданий url',
          code: 'const f = mockFetch(() => ({}));\nawait fetchJson("/api/x");\nexpect(f.mock.calls[0][0]).toBe("/api/x");'
        },
        {
          name: '404 → відхилення HTTP 404',
          code: 'mockFetch(() => ({ status: 404, body: { error: "not found" } }));\nawait expect(fetchJson("/api/missing")).rejects.toThrow("HTTP 404");'
        },
        {
          name: '500 → відхилення HTTP 500',
          code: 'mockFetch(() => ({ status: 500, body: "oops" }));\nawait expect(fetchJson("/api/x")).rejects.toThrow("HTTP 500");'
        },
        {
          name: 'мережева помилка прокидається',
          code: 'mockFetch(() => new TypeError("Failed to fetch"));\nawait expect(fetchJson("/api/x")).rejects.toThrow("Failed to fetch");'
        }
      ],
      explanation: `
\`throw\` у колбеку \`then\` перетворюється на відхилення, а повернутий проміс \`res.json()\` ланцюжок розгортає сам. Мережева помилка проходить наскрізь до викликача.

**Типові помилки:** не перевіряти \`res.ok\`; забути \`return\` (ланцюжок «рветься», \`then\` отримує \`undefined\`).

**Що можуть спитати далі:** як додати таймаут/скасування (\`AbortController\`); як передати в помилку тіло відповіді (власний \`HttpError\` зі \`status\`)?
`
    },
    {
      id: 'async-quiz-finally-value',
      group: 'chaining',
      type: 'quiz',
      level: 3,
      title: 'Що повертає finally',
      tags: [
        'promises',
        'finally'
      ],
      question: `
Що виведе код?

\`\`\`js
Promise.resolve(1)
  .finally(() => {
    console.log('finally');
    return 2;
  })
  .then((v) => console.log('then', v));

Promise.reject(new Error('x'))
  .finally(() => console.log('finally2'))
  .catch((e) => console.log('catch', e.message));
\`\`\`
`,
      options: [
        '`finally, finally2, then 2, catch x`',
        '`finally, then 1, finally2, catch x`',
        '`finally, finally2, then 1, catch x`',
        '`finally, finally2, then undefined, catch x`'
      ],
      answer: 2,
      why: [
        'Ні: `return 2` у `finally` ігнорується — далі йде початкове значення `1`.',
        'Ні: незалежні ланцюжки переплітаються: обидва `finally` стоять у черзі раніше за `then 1`.',
        'Так: спершу обидва `finally`, потім ланцюжки продовжуються з ПОЧАТКОВИМ результатом: `then 1`, `catch x`.',
        'Ні: `finally` не «з\'їдає» значення — ланцюжок отримує `1`, а не `undefined`.'
      ],
      hint: 'Чи може `finally` замінити значення ланцюжка звичайним `return`? А чи «ловить» він помилку?',
      explanation: `
\`finally(fn)\` викликає \`fn\` без аргументів, **ігнорує** її результат і пропускає далі початкове значення чи помилку. Змінити результат може лише \`throw\` у \`finally\`. Порядок: обидва \`finally\` у черзі з самого початку, тож вони перші.
`
    },
    {
      id: 'async-quiz-interleaving-chains',
      group: 'chaining',
      type: 'quiz',
      level: 3,
      title: 'Два ланцюжки then переплітаються',
      tags: [
        'event-loop',
        'promises'
      ],
      question: `
Що виведе код?

\`\`\`js
Promise.resolve()
  .then(() => console.log('a1'))
  .then(() => console.log('a2'))
  .then(() => console.log('a3'));

Promise.resolve()
  .then(() => console.log('b1'))
  .then(() => console.log('b2'));
\`\`\`
`,
      options: [
        '`a1 a2 a3 b1 b2`',
        '`a1 b1 a2 b2 a3`',
        '`b1 b2 a1 a2 a3`',
        '`a1 b1 a2 a3 b2`'
      ],
      answer: 1,
      why: [
        'Ні: ланцюжок не виконується «пачкою» — кожен `then` стає мікрозадачею лише після попереднього.',
        'Так: черга `[a1, b1]` → `a1` ставить `a2`, `b1` ставить `b2` → `[a2, b2]` → `a2` ставить `a3`.',
        'Ні: ланцюжок `b` створено пізніше, тож `b1` стоїть у черзі після `a1`.',
        'Ні: `b2` стоїть у черзі раніше за `a3`, бо `b1` виконався раніше за `a2`.'
      ],
      hint: 'Коли саме в чергу потрапляє колбек другого `.then` ланцюжка — одразу чи після виконання першого?',
      explanation: `
Наступний \`then\` чекає на проміс попереднього, тож його колбек потрапляє в чергу **лише після** виконання попереднього колбека. Незалежні ланцюжки переплітаються: \`a1 b1 a2 b2 a3\`.
`
    },
    // ------------------------------------------------------------ Комбінатори: all, allSettled, race, any
    {
      id: 'async-combinators-theory',
      group: 'combinators',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Promise.all, allSettled, race, any',
      tags: [
        'promises',
        'combinators'
      ],
      question: 'Чим відрізняються Promise.all, Promise.allSettled, Promise.race і Promise.any? Коли що використовувати? Що вони повертають для порожнього масиву? Оберіть **усі** правильні твердження.',
      choices: [
        '`Promise.all` після першої помилки скасовує решту запитів, тож мережа не витрачається даремно',
        '`Promise.allSettled` ніколи не відхиляється й повертає масив об\'єктів зі `status`',
        '`Promise.any` дає перший успішний результат, а якщо впали всі — відхиляється з `AggregateError`',
        '`Promise.all` повертає значення в порядку завершення промісів, а не в порядку входу',
        '`Promise.race([])` ніколи не встановлюється, а `Promise.all([])` одразу виконується з `[]`'
      ],
      answer: `
| | Виконується | Відхиляється | \`[]\` |
|---|---|---|---|
| \`all\` | **всі** успішні → масив у порядку входу | перша помилка (fail-fast) | \`[]\` |
| \`allSettled\` | **всі** встановлені → \`{status, value/reason}\` | ніколи | \`[]\` |
| \`race\` | перший встановлений (успіх) | перший встановлений (помилка) | вічно pending |
| \`any\` | перший **успішний** | всі впали → \`AggregateError\` | \`AggregateError\` |

\`\`\`js
Promise.all([getUser(id), getPosts(id)]).then(([user, posts]) => render(user, posts));
Promise.allSettled(widgets.map(load)).then((results) => results.filter((r) => r.status === 'fulfilled'));
Promise.race([fetch(url), timeout(5000)]);
Promise.any(mirrors.map((m) => fetch(m)));
\`\`\`
- Приймають будь-який ітерабельний; не-проміси загортаються в \`Promise.resolve\`.
- **Жоден не скасовує** «програвших» — для цього \`AbortController\`.
`,
      correct: [1, 2, 4],
      why: [
        'Ні: проміси не скасовуються — `all` лише перестає чекати, решта запитів іде далі.',
        'Так: `allSettled` чекає всіх і дає `{ status, value }` або `{ status, reason }` для кожного.',
        'Так: `any` бере перший успіх, а коли впали всі — `AggregateError` з масивом `errors`.',
        'Ні: результати йдуть у порядку ВХОДУ, незалежно від того, хто завершився першим.',
        'Так: у `race([])` немає учасників — проміс вічно pending; «всі з нуля» в `all([])` виконані одразу.'
      ],
      keyPoints: [
        'all — всі успішні, fail-fast на першій помилці, порядок як у вході',
        'allSettled — ніколи не відхиляється, масив об\'єктів зі status',
        'race — перший встановлений (успіх або помилка)',
        'any — перший успішний; всі впали → AggregateError',
        'Порожній масив: all/allSettled → [], race → pending, any → AggregateError',
        'Програвші проміси не скасовуються'
      ],
      followUps: [
        'Як реалізувати Promise.all вручну?',
        'Як зробити Promise.all з обмеженням паралельності?',
        'Як скасувати решту запитів, коли один упав?'
      ]
    },
    {
      id: 'async-quiz-combinators-edge',
      group: 'combinators',
      type: 'quiz',
      level: 2,
      title: 'Крайові випадки комбінаторів',
      tags: [
        'promises',
        'combinators'
      ],
      question: 'Оберіть **усі** правильні твердження:',
      options: [
        '`Promise.all([])` одразу виконується з `[]`',
        '`Promise.race([])` відхиляється з `TypeError`',
        '`Promise.any([])` відхиляється з `AggregateError`',
        '`Promise.all([1, Promise.resolve(2)])` виконується з `[1, 2]`',
        '`Promise.allSettled` відхиляється, якщо хоча б один проміс відхилено',
        '`Promise.all` скасовує решту промісів після першої помилки'
      ],
      answer: [0, 2, 3],
      why: [
        'Правильно: «усі з нуля виконані» — одразу `[]`.',
        'Ні: `race([])` не відхиляється, а вічно pending — немає кого чекати.',
        'Правильно: «жоден не виконався» → `AggregateError` з порожнім `errors`.',
        'Правильно: `1` загортається в `Promise.resolve(1)`, порядок — як у вході.',
        'Ні: `allSettled` ніколи не відхиляється — для того і створений.',
        'Ні: проміси не мають механізму скасування; `all` лише перестає чекати.'
      ],
      hint: 'Подумайте, що означає «перший встановлений» для порожнього списку, і чи вміють проміси скасовуватись взагалі.',
      explanation: `
Порожній вхід: \`all\`/\`allSettled\` → \`[]\`, \`race\` → pending, \`any\` → \`AggregateError\`. Не-проміси загортаються в \`Promise.resolve\`. Жоден комбінатор нічого не скасовує.
`
    },
    {
      id: 'async-promise-all',
      group: 'combinators',
      type: 'code',
      level: 2,
      interview: true,
      title: 'Поліфіл Promise.all',
      tags: [
        'promises',
        'polyfill',
        'combinators'
      ],
      description: `
**Завдання.** Реалізуйте \`promiseAll(iterable)\` — аналог \`Promise.all\` без вбудованих комбінаторів.

**Де трапляється:** топ-задача співбесід на проміси; в роботі — паралельне завантаження даних сторінки.

**Що написати**
- \`promiseAll(iterable)\` → \`Promise\`:
  - виконується масивом результатів **у порядку входу**;
  - відхиляється **першою** помилкою, не чекаючи решти;
  - елементи — проміси, thenable або звичайні значення; вхід — будь-який ітерабельний (\`Set\`, генератор);
  - порожній вхід → \`[]\`.

**Приклад**
\`\`\`js
promiseAll([delay(30, 'a'), 'b', Promise.resolve('c')]).then(console.log); // ['a', 'b', 'c']
promiseAll([Promise.reject(new Error('x')), never]).catch((e) => e.message); // 'x'
\`\`\`

**Як це працює:** \`Promise.resolve(item)\` загортає і значення, і thenable. Результат пишемо **за індексом**, а лічильник завершених показує, коли всі готові. \`reject\` можна передати напряму — проміс встановлюється один раз, решта викликів ігнорується.

**Врахуйте:** не \`push\` (порядок завершення ≠ порядок входу); порожній вхід інакше ніколи не виконається.
`,
      starter: `function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable);
    const results = new Array(items.length);
    let remaining = items.length;
    // 1. Порожній вхід → одразу resolve(results)
    // 2. Для кожного item з індексом i:
    //    Promise.resolve(item).then(value => { results[i] = value; ... }, reject)
    // 3. Коли remaining дійшов до 0 — resolve(results)
    // TODO
  });
}

// Спробуйте в консолі:
// promiseAll([1, Promise.resolve(2)]).then(console.log); // [1, 2]
`,
      solution: `function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable);
    const results = new Array(items.length);
    let remaining = items.length;

    if (remaining === 0) {
      resolve(results);
      return;
    }

    items.forEach((item, index) => {
      // Promise.resolve загортає значення і thenable
      Promise.resolve(item).then((value) => {
        results[index] = value; // за індексом — зберігаємо порядок входу
        remaining -= 1;
        if (remaining === 0) resolve(results);
      }, reject); // перший reject встановить проміс, решта проігноруються
    });
  });
}
`,
      hints: [
        'Підписка: `Promise.resolve(item).then((value) => { results[i] = value; if (--remaining === 0) resolve(results); }, reject)`.',
        'Порожній вхід: `if (remaining === 0) return resolve(results);` до циклу.'
      ],
      tests: [
        {
          name: 'зберігає порядок входу',
          code: 'useFakeTimers();\nconst d = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));\nconst p = promiseAll([d(30, "a"), d(10, "b"), d(20, "c")]);\nadvanceTimersByTime(30);\nawait expect(p).resolves.toEqual(["a", "b", "c"]);'
        },
        { name: 'порожній масив → []', code: 'await expect(promiseAll([])).resolves.toEqual([]);' },
        {
          name: 'звичайні значення і thenable',
          code: 'const thenable = { then(r) { r(5); } };\nawait expect(promiseAll([1, Promise.resolve(2), "x", thenable])).resolves.toEqual([1, 2, "x", 5]);'
        },
        {
          name: 'відхиляється першою помилкою, не чекаючи pending',
          code: 'const p = promiseAll([Promise.resolve(1), Promise.reject(new Error("boom")), new Promise(() => {})]);\nawait expect(p).rejects.toThrow("boom");'
        },
        { name: 'приймає Set та інші ітерабельні', code: 'await expect(promiseAll(new Set([Promise.resolve(1), 2]))).resolves.toEqual([1, 2]);' },
        {
          name: 'відхиляється тією помилкою, що сталася раніше в часі',
          code: 'useFakeTimers();\nconst late = new Promise((_, rej) => setTimeout(() => rej(new Error("late")), 50));\nconst early = new Promise((_, rej) => setTimeout(() => rej(new Error("early")), 10));\nlate.catch(() => {});\nconst p = promiseAll([late, early]);\nadvanceTimersByTime(50);\nawait expect(p).rejects.toThrow("early");'
        }
      ],
      explanation: `
\`Promise.resolve\` уніфікує значення й thenable; запис за індексом зберігає порядок; лічильник показує завершення; \`reject\` встановлює результат один раз.

**Складність:** O(n).

**Типові помилки:** \`push\`; перевірка \`results.length\` замість лічильника (\`results[2] = x\` одразу дає довжину 3); забутий порожній вхід.

**Що можуть спитати далі:** \`allSettled\`, \`race\`, \`any\`; обмеження паралельності; скасування решти через \`AbortController\`.
`
    },
    {
      id: 'async-promise-all-settled',
      group: 'combinators',
      type: 'code',
      level: 2,
      interview: true,
      title: 'Поліфіл Promise.allSettled',
      tags: [
        'promises',
        'polyfill',
        'combinators'
      ],
      description: `
**Завдання.** Реалізуйте \`promiseAllSettled(iterable)\` — аналог \`Promise.allSettled\` без вбудованих комбінаторів.

**Де трапляється:** дашборд з незалежними віджетами — показати те, що завантажилось, і помилку для решти. Часте продовження задачі про \`Promise.all\`.

**Що написати**
- \`promiseAllSettled(iterable)\` → \`Promise\`, що **ніколи не відхиляється** і виконується масивом у порядку входу:
  - \`{ status: 'fulfilled', value }\` — для успішних;
  - \`{ status: 'rejected', reason }\` — для відхилених.

**Приклад**
\`\`\`js
promiseAllSettled([1, Promise.reject('err')]).then(console.log);
// [{ status: 'fulfilled', value: 1 }, { status: 'rejected', reason: 'err' }]
\`\`\`

**Як це працює:** спершу перетворюємо кожен елемент на проміс, що **завжди виконується** описом результату: \`.then(value => ({...}), reason => ({...}))\`. Далі — та сама схема, що в \`Promise.all\` (індекс + лічильник), але відхилень уже бути не може.

**Врахуйте:** порожній вхід → \`[]\`; у об'єкті лише потрібні поля (\`value\` або \`reason\`).
`,
      starter: `function promiseAllSettled(iterable) {
  // 1. Перетворіть кожен елемент на проміс, що ЗАВЖДИ виконується:
  //    Promise.resolve(item).then(value => ({ status: 'fulfilled', value }), reason => ({ ... }))
  // 2. Дочекайтеся всіх, як у promiseAll (результат за індексом + лічильник)
  // TODO
}

// Спробуйте в консолі:
// promiseAllSettled([1, Promise.reject('e')]).then(console.log);
`,
      solution: `function promiseAllSettled(iterable) {
  // Перетворюємо кожен елемент на проміс, що НІКОЛИ не відхиляється,
  // і чекаємо їх усіх так само, як у promiseAll.
  const items = Array.from(iterable, (item) =>
    Promise.resolve(item).then(
      (value) => ({ status: 'fulfilled', value }),
      (reason) => ({ status: 'rejected', reason })
    )
  );

  return new Promise((resolve) => {
    const results = new Array(items.length);
    let remaining = items.length;
    if (remaining === 0) return resolve(results);
    items.forEach((p, i) => {
      p.then((outcome) => {
        results[i] = outcome;
        if (--remaining === 0) resolve(results);
      });
    });
  });
}
`,
      hints: [
        'Нормалізація: `Array.from(iterable, (item) => Promise.resolve(item).then(onOk, onErr))`, де обидва колбеки повертають об\'єкт-опис.',
        'Далі `new Promise((resolve) => ...)` з лічильником, як у `promiseAll`; порожній вхід — одразу `resolve([])`.'
      ],
      tests: [
        {
          name: 'змішані результати у порядку входу',
          code: 'const r = await promiseAllSettled([Promise.reject("e1"), 1, Promise.resolve(2)]);\nexpect(r).toEqual([{ status: "rejected", reason: "e1" }, { status: "fulfilled", value: 1 }, { status: "fulfilled", value: 2 }]);'
        },
        { name: 'порожній вхід → []', code: 'await expect(promiseAllSettled([])).resolves.toEqual([]);' },
        {
          name: 'не відхиляється, навіть якщо всі впали',
          code: 'const err = new Error("x");\nconst r = await promiseAllSettled([Promise.reject(err), Promise.reject(err)]);\nexpect(r.every((o) => o.status === "rejected" && o.reason === err)).toBe(true);'
        },
        {
          name: 'чекає на всі проміси',
          code: 'useFakeTimers();\nlet done = false;\nconst slow = new Promise((r) => setTimeout(() => r("slow"), 100));\nconst p = promiseAllSettled([Promise.reject(1), slow]).then((v) => { done = true; return v; });\nawait flushPromises();\nexpect(done).toBe(false);\nadvanceTimersByTime(100);\nawait expect(p).resolves.toEqual([{ status: "rejected", reason: 1 }, { status: "fulfilled", value: "slow" }]);'
        },
        {
          name: 'немає зайвих полів',
          code: 'const [a, b] = await promiseAllSettled([1, Promise.reject(2)]);\nexpect(Object.keys(a).sort()).toEqual(["status", "value"]);\nexpect(Object.keys(b).sort()).toEqual(["reason", "status"]);'
        }
      ],
      explanation: `
Трюк — «нормалізувати» кожен елемент у проміс, що завжди виконується описом. Після цього задача зводиться до \`Promise.all\`, який уже не може відхилитися.

**Складність:** O(n).

**Типові помилки:** один \`catch\` на весь результат (одна помилка «з'їдає» все); \`value\` і \`reason\` в одному об'єкті.

**Що можуть спитати далі:** як після \`allSettled\` зібрати помилки в \`AggregateError\`?
`
    },
    {
      id: 'async-promise-race',
      group: 'combinators',
      type: 'code',
      level: 2,
      title: 'Поліфіл Promise.race',
      tags: [
        'promises',
        'polyfill',
        'combinators'
      ],
      description: `
**Завдання.** Реалізуйте \`promiseRace(iterable)\` — аналог \`Promise.race\`: результат як у **першого встановленого** елемента (успіх або помилка).

**Де трапляється:** таймаут запиту (\`race\` запиту з таймером); поліфіл — часта коротка задача співбесід.

**Що написати**
- \`promiseRace(iterable)\` → \`Promise\`, що встановлюється так само, як перший встановлений елемент;
- не-проміси вважаються вже виконаними;
- порожній вхід → проміс **ніколи не встановлюється**.

**Приклад**
\`\`\`js
promiseRace([delay(30, 'slow'), delay(10, 'fast')]).then(console.log); // 'fast'
\`\`\`

**Як це працює:** проміс встановлюється лише один раз. Достатньо підписати \`resolve\` і \`reject\` нового промісу на кожен елемент — хто перший, той і переміг, решта викликів ігнорується.

**Врахуйте:** не обробляйте \`[]\` окремо — «вічно pending» і є правильна поведінка.
`,
      starter: `function promiseRace(iterable) {
  return new Promise((resolve, reject) => {
    // Для кожного item: Promise.resolve(item).then(resolve, reject)
    // TODO
  });
}

// Спробуйте в консолі:
// promiseRace([new Promise(() => {}), 42]).then(console.log); // 42
`,
      solution: `function promiseRace(iterable) {
  return new Promise((resolve, reject) => {
    for (const item of iterable) {
      // перший, хто викличе resolve/reject, переможе — решта ігноруються
      Promise.resolve(item).then(resolve, reject);
    }
  });
}
`,
      hints: [
        'Цикл `for (const item of iterable)` — працює для будь-якого ітерабельного.',
        'Тіло циклу — один рядок: `Promise.resolve(item).then(resolve, reject);`.'
      ],
      tests: [
        {
          name: 'виконується найшвидшим',
          code: 'useFakeTimers();\nconst d = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));\nconst p = promiseRace([d(30, "slow"), d(10, "fast")]);\nadvanceTimersByTime(30);\nawait expect(p).resolves.toBe("fast");'
        },
        {
          name: 'відхиляється, якщо першою стала помилка',
          code: 'useFakeTimers();\nconst ok = new Promise((r) => setTimeout(() => r("ok"), 50));\nconst bad = new Promise((_, rej) => setTimeout(() => rej(new Error("bad")), 10));\nconst p = promiseRace([ok, bad]);\nadvanceTimersByTime(50);\nawait expect(p).rejects.toThrow("bad");'
        },
        { name: 'не-проміс виграє у pending', code: 'await expect(promiseRace([new Promise(() => {}), 42])).resolves.toBe(42);' },
        {
          name: 'порожній вхід — вічно pending',
          code: 'let settled = false;\npromiseRace([]).then(() => { settled = true; }, () => { settled = true; });\nawait flushPromises();\nexpect(settled).toBe(false);'
        }
      ],
      explanation: `
Ми підписуємо \`resolve\`/\`reject\` на всі елементи; перший встановлений перемагає, бо проміс незмінний після встановлення.

**Складність:** O(n).

**Типові помилки:** \`resolve(undefined)\` для порожнього входу — не відповідає специфікації.

**Що можуть спитати далі:** чому таймаут через \`race\` не зупиняє запит? Як скасувати «програвших» (\`AbortController\`)?
`
    },
    {
      id: 'async-with-timeout',
      group: 'combinators',
      type: 'code',
      level: 2,
      interview: true,
      title: 'withTimeout(promise, ms)',
      tags: [
        'promises',
        'timers',
        'combinators'
      ],
      description: `
**Завдання.** Напишіть \`withTimeout(promise, ms)\`: повертає результат \`promise\`, якщо він встиг за \`ms\` мс, інакше відхиляється з \`TimeoutError\`.

**Де трапляється:** запит, що «висить» без відповіді — показати помилку через 5 с замість вічного спінера.

**Що написати**
- \`withTimeout(promise, ms)\` → \`Promise\`:
  - \`promise\` встановився раніше → його значення або помилка;
  - інакше → помилка з \`name === 'TimeoutError'\` і \`message === 'Timeout after <ms>ms'\`;
  - таймер **очищається**, коли \`promise\` встановився.

**Приклад**
\`\`\`js
withTimeout(fetchUser(), 5000)
  .then(render)
  .catch((e) => e.name === 'TimeoutError' && showRetry());
\`\`\`

**Як це працює:** це гонка двох подій — завершення \`promise\` і таймера. Хто перший викличе \`resolve\`/\`reject\` нового промісу, той і переміг. На відміну від \`Promise.race\`, ми самі очищаємо таймер, щоб він не «висів».

**Врахуйте:** таймаут не зупиняє саму операцію — для цього потрібен \`AbortController\`.
`,
      starter: `function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    // 1. const timer = setTimeout(() => { створити Error, задати name = 'TimeoutError', reject }, ms)
    // 2. Promise.resolve(promise).then(
    //      value => { clearTimeout(timer); resolve(value) },
    //      error => { clearTimeout(timer); reject(error) })
    // TODO
  });
}

// Спробуйте в консолі:
// withTimeout(new Promise(() => {}), 1000).catch((e) => console.log(e.name, e.message));
`,
      solution: `function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error('Timeout after ' + ms + 'ms');
      err.name = 'TimeoutError';
      reject(err);
    }, ms);

    Promise.resolve(promise).then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); }
    );
  });
}
`,
      hints: [
        'Помилка: `const err = new Error(\'Timeout after \' + ms + \'ms\'); err.name = \'TimeoutError\'; reject(err);`.',
        'В обох обробниках `promise` спершу `clearTimeout(timer)`, потім `resolve`/`reject`.'
      ],
      tests: [
        {
          name: 'повертає результат, якщо встиг',
          code: 'useFakeTimers();\nconst p = withTimeout(new Promise((r) => setTimeout(() => r("ok"), 50)), 100);\nadvanceTimersByTime(50);\nawait expect(p).resolves.toBe("ok");'
        },
        {
          name: 'відхиляється після таймауту',
          code: 'useFakeTimers();\nconst p = withTimeout(new Promise(() => {}), 100);\nadvanceTimersByTime(100);\nawait expect(p).rejects.toThrow("Timeout after 100ms");'
        },
        {
          name: 'помилка має name TimeoutError',
          code: 'useFakeTimers();\nconst p = withTimeout(new Promise(() => {}), 10);\nadvanceTimersByTime(10);\nconst e = await p.catch((x) => x);\nexpect(e).toBeInstanceOf(Error);\nexpect(e.name).toBe("TimeoutError");'
        },
        {
          name: 'прокидає помилку оригінального промісу',
          code: 'useFakeTimers();\nconst p = withTimeout(Promise.reject(new Error("orig")), 100);\nawait expect(p).rejects.toThrow("orig");'
        },
        {
          name: 'не відхиляється до спливу часу',
          code: 'useFakeTimers();\nlet settled = false;\nwithTimeout(new Promise(() => {}), 100).catch(() => { settled = true; });\nadvanceTimersByTime(99);\nawait flushPromises();\nexpect(settled).toBe(false);'
        },
        {
          name: 'очищає таймер після завершення',
          code: 'useFakeTimers();\nconst p = withTimeout(Promise.resolve(1), 1000);\nawait p;\nawait flushPromises();\nexpect(getTimerCount()).toBe(0);'
        }
      ],
      explanation: `
Таймер і проміс змагаються за право встановити результат. \`Promise.race([promise, timeoutPromise])\` теж працює, але таймер лишиться висіти до спливу \`ms\`.

**Типові помилки:** не очищений таймер; \`reject('timeout')\` рядком замість \`Error\`.

**Що можуть спитати далі:** як справді скасувати \`fetch\` — \`AbortSignal.timeout(ms)\`; як поєднати з \`retry\`?
`
    },
    {
      id: 'async-promise-any',
      group: 'combinators',
      type: 'code',
      level: 3,
      title: 'Поліфіл Promise.any з AggregateError',
      tags: [
        'promises',
        'polyfill',
        'combinators'
      ],
      description: `
**Завдання.** Реалізуйте \`promiseAny(iterable)\` — аналог \`Promise.any\`: перший **успішний** результат; якщо впали всі — \`AggregateError\`.

**Де трапляється:** кілька дзеркал/CDN — взяти першу успішну відповідь; задача співбесід «дзеркало \`Promise.all\`».

**Що написати**
- \`promiseAny(iterable)\` → \`Promise\`:
  - виконується значенням першого успішного елемента;
  - всі відхилені → \`AggregateError\`, \`errors\` — причини **у порядку входу**, \`message\` — \`'All promises were rejected'\`;
  - порожній вхід → одразу \`AggregateError\` з \`errors: []\`.

**Приклад**
\`\`\`js
promiseAny([Promise.reject(1), delay(20, 'ok')]).then(console.log); // 'ok'
promiseAny([Promise.reject(1), Promise.reject(2)]).catch((e) => e.errors); // [1, 2]
\`\`\`

**Як це працює:** дзеркально до \`Promise.all\`: **успіх** одразу викликає \`resolve\`, а помилки накопичуються за індексом з лічильником. Коли відхилено всі — \`reject(new AggregateError(errors, message))\`.

**Врахуйте:** \`errors.push\` дасть порядок відхилення, а треба порядок входу.
`,
      starter: `function promiseAny(iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable);
    const errors = new Array(items.length);
    let remaining = items.length;
    // 1. Порожній вхід → reject(new AggregateError([], 'All promises were rejected'))
    // 2. Для кожного item: Promise.resolve(item).then(resolve, (reason) => { errors[i] = reason; ... })
    // 3. Коли відхилено всі — reject(new AggregateError(errors, 'All promises were rejected'))
    // TODO
  });
}

// Спробуйте в консолі:
// promiseAny([Promise.reject(1), 7]).then(console.log); // 7
`,
      solution: `function promiseAny(iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable);
    const errors = new Array(items.length);
    let remaining = items.length;

    const fail = () => reject(new AggregateError(errors, 'All promises were rejected'));
    if (remaining === 0) return fail();

    items.forEach((item, i) => {
      Promise.resolve(item).then(resolve, (reason) => {
        errors[i] = reason; // за індексом, щоб порядок відповідав входу
        if (--remaining === 0) fail();
      });
    });
  });
}
`,
      hints: [
        'Успіх — просто `resolve`, тож другим аргументом `then` йде обробник помилки: `errors[i] = reason; if (--remaining === 0) fail();`.',
        'Порожній вхід — «всі (нуль) відхилені»: одразу `fail()`.'
      ],
      tests: [
        {
          name: 'перший успішний, навіть якщо раніше були помилки',
          code: 'useFakeTimers();\nconst bad = Promise.reject(new Error("x"));\nconst ok = new Promise((r) => setTimeout(() => r("ok"), 20));\nconst p = promiseAny([bad, ok]);\nadvanceTimersByTime(20);\nawait expect(p).resolves.toBe("ok");'
        },
        {
          name: 'усі відхилені → AggregateError',
          code: 'const err = await promiseAny([Promise.reject(1), Promise.reject(2)]).catch((e) => e);\nexpect(err).toBeInstanceOf(AggregateError);\nexpect(err.errors).toEqual([1, 2]);\nexpect(err.message).toBe("All promises were rejected");'
        },
        {
          name: 'errors у порядку входу, а не відхилення',
          code: 'useFakeTimers();\nconst rej = (ms, v) => new Promise((_, r) => setTimeout(() => r(v), ms));\nconst p = promiseAny([rej(30, "a"), rej(10, "b"), rej(20, "c")]).catch((e) => e.errors);\nadvanceTimersByTime(30);\nawait expect(p).resolves.toEqual(["a", "b", "c"]);'
        },
        {
          name: 'порожній вхід → AggregateError з []',
          code: 'const err = await promiseAny([]).catch((e) => e);\nexpect(err).toBeInstanceOf(AggregateError);\nexpect(err.errors).toEqual([]);'
        },
        { name: 'звичайне значення — успіх', code: 'await expect(promiseAny([Promise.reject(1), 7])).resolves.toBe(7);' }
      ],
      explanation: `
\`any\` — дзеркало \`all\`: fail-fast на успіх, накопичення помилок за індексами. \`AggregateError\` (ES2021) несе масив \`errors\`.

**Відмінність від \`race\`:** швидка помилка не «вбиває» результат.

**Типові помилки:** \`errors.push\`; звичайний \`Error\` замість \`AggregateError\`; зависання на \`[]\`.
`
    },
    // ------------------------------------------------------------ async / await
    {
      id: 'async-await-theory',
      group: 'async-await',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'async/await: як працює і як обробляти помилки',
      tags: [
        'async-await'
      ],
      question: 'Як працюють async/await? Що повертає async-функція? Як обробляти помилки? Як виконати кілька запитів послідовно і паралельно, і яка пастка з forEach?',
      choices: [
        '`await` блокує весь потік до завершення промісу, тому інші обробники подій чекають на нього',
        'Async-функція повертає саме значення з `return`, а проміс — лише якщо всередині є `await`',
        '`arr.forEach(async (x) => await f(x))` виконує `f` послідовно й чекає на всі виклики',
        'Два незалежні запити краще запустити через `Promise.all`, а не двома послідовними `await`'
      ],
      answer: `
- \`async function\` **завжди повертає проміс**: \`return x\` → fulfilled, \`throw e\` → rejected.
- \`await x\` призупиняє **лише цю функцію**, продовження — мікрозадача. Відхилений проміс у \`await\` **кидає** помилку → ловимо \`try/catch\`.
\`\`\`js
async function load() {
  try {
    const res = await fetch('/api');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (err) {
    report(err);
    throw err;
  } finally {
    setLoading(false);
  }
}
\`\`\`
- **Послідовно:** \`await a(); await b();\` (лише коли \`b\` залежить від \`a\`). **Паралельно:** \`await Promise.all([a(), b()])\`.
- **Цикли:** \`forEach(async …)\` не чекає; \`for...of\` + \`await\` — послідовно; \`Promise.all(arr.map(f))\` — паралельно.
- Top-level \`await\` — лише в ES-модулях.
`,
      correct: 3,
      why: [
        'Ні: `await` призупиняє лише поточну async-функцію; потік вільний для подій і іншого коду.',
        'Ні: async-функція ЗАВЖДИ повертає проміс, навіть без жодного `await`.',
        'Ні: `forEach` ігнорує повернуті проміси — виклики стартують одночасно, і ніхто їх не чекає.',
        'Так: два послідовні `await` складають час запитів, а `Promise.all` запускає їх одночасно.'
      ],
      keyPoints: [
        'async завжди повертає проміс; throw → rejected',
        'await призупиняє лише функцію, продовження — мікрозадача',
        'Помилки — try/catch навколо await або .catch у викликача',
        'Незалежні операції запускати паралельно (Promise.all), а не послідовними await',
        'forEach не чекає async-колбеків — for...of або Promise.all(map)',
        'Top-level await працює лише в модулях'
      ],
      followUps: [
        'Чим return await відрізняється від return у try/catch?',
        'Як реалізувати async/await через генератори?',
        'Як обмежити кількість паралельних запитів?'
      ]
    },
    {
      id: 'async-quiz-async-returns',
      group: 'async-await',
      type: 'quiz',
      level: 1,
      title: 'Що повертає async-функція',
      tags: [
        'async-await'
      ],
      question: `
Що виведе код?

\`\`\`js
async function getNumber() {
  return 42;
}

const result = getNumber();
console.log(result instanceof Promise, typeof result);
\`\`\`
`,
      options: [
        '`false number`',
        '`true object`',
        '`true number`',
        '`false object`'
      ],
      answer: 1,
      why: [
        'Ні: async-функція не повертає «сире» значення — `return 42` загортається в проміс.',
        'Так: результат — проміс, а `typeof` будь-якого промісу — `\'object\'`.',
        'Ні: `typeof` промісу — `\'object\'`, а не тип значення всередині.',
        'Ні: результат саме `Promise` — `instanceof Promise` дає `true`.'
      ],
      hint: 'Що б не повертала async-функція, викликач отримує одне й те саме.',
      explanation: `
\`async\` функція **завжди** повертає проміс: \`return 42\` ≡ \`Promise.resolve(42)\`. Щоб отримати число — \`await getNumber()\` або \`.then\`.
`
    },
    {
      id: 'async-quiz-await-basic',
      group: 'async-await',
      type: 'quiz',
      level: 2,
      title: 'Що відбувається на await',
      tags: [
        'event-loop',
        'async-await'
      ],
      question: `
**Як це працює:** async-функція виконується **синхронно до першого \`await\`**. На \`await\` вона призупиняється, решта тіла стає мікрозадачею, а керування повертається тому, хто її викликав.

Що виведе код?

\`\`\`js
async function foo() {
  console.log('foo start');
  await null;
  console.log('foo end');
}

console.log('1');
foo();
console.log('2');
\`\`\`
`,
      options: [
        '`1 foo start foo end 2`',
        '`1 2 foo start foo end`',
        '`1 foo start 2 foo end`',
        '`foo start 1 2 foo end`'
      ],
      answer: 2,
      why: [
        'Ні: код після `await` не виконується синхронно, навіть якщо чекаємо не проміс.',
        'Ні: до першого `await` функція виконується одразу — `foo start` друкується до `2`.',
        'Так: `foo start` синхронно, на `await` керування повертається — `2`, потім мікрозадача `foo end`.',
        'Ні: `foo()` викликається після `console.log(\'1\')`, тож `1` — першим.'
      ],
      hint: 'До першого `await` async-функція виконується як звичайна. Що відбувається з рештою тіла?',
      explanation: `
\`await null\` ≈ \`Promise.resolve(null).then(продовження)\`. Тому \`foo end\` виконується після синхронного \`2\`. Навіть \`await\` не-промісу віддає керування хоча б на один тік.
`
    },
    {
      id: 'async-quiz-foreach-async',
      group: 'async-await',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'forEach з async-колбеком',
      tags: [
        'async-await',
        'loops'
      ],
      question: `
Що виведе код?

\`\`\`js
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  [3, 1, 2].forEach(async (n) => {
    await delay(n * 100);
    console.log(n);
  });
  console.log('done');
}

run();
\`\`\`
`,
      options: [
        '`3 1 2 done`',
        '`1 2 3 done`',
        '`done 3 1 2`',
        '`done 1 2 3`'
      ],
      answer: 3,
      why: [
        'Ні: `forEach` не чекає async-колбеків, тож `done` друкується синхронно першим.',
        'Ні: `done` виводиться до будь-якого таймера — `forEach` не чекає.',
        'Ні: `done` перший, але числа йдуть за тривалістю таймерів, а не за порядком масиву.',
        'Так: `done` синхронно, далі таймери спрацьовують за тривалістю: 100 → `1`, 200 → `2`, 300 → `3`.'
      ],
      hint: 'Що `forEach` робить зі значенням, яке повертає колбек?',
      explanation: `
\`forEach\` ігнорує результат колбека — проміси ніхто не чекає, усі таймери стартують одночасно. Виправлення: \`for...of\` + \`await\` (послідовно) або \`await Promise.all(arr.map(async …))\` (паралельно).
`
    },
    {
      id: 'async-quiz-sequential-vs-parallel',
      group: 'async-await',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Послідовно чи паралельно?',
      tags: [
        'async-await',
        'performance'
      ],
      question: `
Приблизно скільки часу виконуватимуться \`a()\` і \`b()\`?

\`\`\`js
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function a() {
  await delay(100);
  await delay(100);
}

async function b() {
  const p1 = delay(100);
  const p2 = delay(100);
  await p1;
  await p2;
}
\`\`\`
`,
      options: [
        '`a` ≈ 200 мс, `b` ≈ 200 мс',
        '`a` ≈ 100 мс, `b` ≈ 100 мс',
        '`a` ≈ 200 мс, `b` ≈ 100 мс',
        '`a` ≈ 100 мс, `b` ≈ 200 мс'
      ],
      answer: 2,
      why: [
        'Ні: у `b` обидва таймери запущені одразу — чекання перекривається.',
        'Ні: у `a` другий `delay` стартує лише після першого — це 200 мс.',
        'Так: операція стартує в момент виклику; у `a` виклики послідовні, у `b` — одночасні.',
        'Ні: навпаки — `a` повільніша, бо чекає кожен таймер по черзі.'
      ],
      hint: 'Коли саме стартує таймер — у момент виклику `delay` чи у момент `await`?',
      explanation: `
Асинхронна операція **стартує в момент виклику**, \`await\` лише чекає результат. У \`b\` обидва таймери вже йдуть, тому ≈100 мс. Ідіоматично: \`await Promise.all([p1, p2])\` — інакше відхилення \`p2\` під час чекання \`p1\` стане unhandled.
`
    },
    {
      id: 'async-run-sequentially',
      group: 'async-await',
      type: 'code',
      level: 2,
      title: 'runSequentially(tasks)',
      tags: [
        'async-await',
        'promises'
      ],
      description: `
**Завдання.** Напишіть \`runSequentially(tasks)\`: виконати асинхронні задачі **строго по черзі** і зібрати результати.

**Де трапляється:** міграції/кроки онбордингу, де кожен запит залежить від попереднього; завантаження файлів по одному, щоб не перевантажити сервер.

**Що написати**
- \`runSequentially(tasks)\` → \`Promise<array>\`:
  - \`tasks\` — масив **функцій**, кожна повертає проміс або значення;
  - наступна задача стартує лише після завершення попередньої;
  - результати в тому ж порядку;
  - помилка задачі → відхилення цією помилкою, **наступні не запускаються**.

**Приклад**
\`\`\`js
await runSequentially([
  () => fetchJson('/a'),
  () => fetchJson('/b'),
]); // [a, b] — '/b' запитано лише після відповіді '/a'
\`\`\`

**Як це працює:** \`await\` усередині \`for...of\` призупиняє функцію на кожній ітерації. Помилка з \`await\` перериває цикл і відхиляє проміс async-функції. Задачі — функції, бо проміс запускає операцію вже в момент створення.

**Врахуйте:** порожній масив → \`[]\`; задача може повернути звичайне значення.
`,
      starter: `async function runSequentially(tasks) {
  const results = [];
  // 1. for (const task of tasks) { ... }
  // 2. Викличте task() і дочекайтеся результату через await, додайте в results
  // TODO
  return results;
}

// Спробуйте в консолі:
// runSequentially([() => 1, async () => 2]).then(console.log); // [1, 2]
`,
      solution: `async function runSequentially(tasks) {
  const results = [];
  for (const task of tasks) {
    // await у for...of — наступна ітерація чекає завершення попередньої
    results.push(await task());
  }
  return results;
}
`,
      hints: [
        '`for (const task of tasks) results.push(await task());` — і це все.',
        'Не пишіть `tasks.forEach(async …)` чи `tasks.map((t) => t())` — так задачі стартують одночасно.'
      ],
      tests: [
        {
          name: 'повертає результати по порядку',
          code: 'const r = await runSequentially([() => Promise.resolve(1), () => 2, async () => 3]);\nexpect(r).toEqual([1, 2, 3]);'
        },
        {
          name: 'наступна задача стартує після завершення попередньої',
          code: 'useFakeTimers();\nconst started = [];\nconst task = (id, ms) => () => { started.push(id); return new Promise((r) => setTimeout(() => r(id), ms)); };\nconst p = runSequentially([task("a", 100), task("b", 10)]);\nawait flushPromises();\nexpect(started).toEqual(["a"]);\nadvanceTimersByTime(100);\nawait flushPromises();\nexpect(started).toEqual(["a", "b"]);\nadvanceTimersByTime(10);\nawait expect(p).resolves.toEqual(["a", "b"]);'
        },
        {
          name: 'помилка зупиняє виконання',
          code: 'const third = mockFn(() => 3);\nconst p = runSequentially([() => 1, () => Promise.reject(new Error("stop")), third]);\nawait expect(p).rejects.toThrow("stop");\nexpect(third).not.toHaveBeenCalled();'
        },
        { name: 'порожній масив → []', code: 'await expect(runSequentially([])).resolves.toEqual([]);' }
      ],
      explanation: `
\`await\` у \`for...of\` дає строгу послідовність; помилка перериває цикл. Задачі — фабрики (thunks), інакше всі операції стартували б одразу.

**Складність:** загальний час — сума тривалостей.

**Типові помилки:** \`forEach(async …)\`; \`tasks.map(t => t())\` — паралельний запуск.

**Що можуть спитати далі:** паралельно, але не більше N (\`mapLimit\`); через \`reduce\` і \`then\`.
`
    },
    {
      id: 'async-quiz-classic-order',
      group: 'async-await',
      type: 'quiz',
      level: 3,
      interview: true,
      title: 'Класика: async1/async2/setTimeout/promise',
      tags: [
        'event-loop',
        'async-await'
      ],
      question: `
Що виведе код (сучасний рушій, ES2019+)?

\`\`\`js
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}
async function async2() {
  console.log('async2');
}

console.log('script start');
setTimeout(() => console.log('setTimeout'), 0);
async1();
new Promise((resolve) => {
  console.log('promise1');
  resolve();
}).then(() => console.log('promise2'));
console.log('script end');
\`\`\`
`,
      options: [
        '`script start, async1 start, async2, promise1, script end, async1 end, promise2, setTimeout`',
        '`script start, async1 start, async2, promise1, script end, promise2, async1 end, setTimeout`',
        '`script start, async1 start, async2, async1 end, promise1, script end, promise2, setTimeout`',
        '`script start, setTimeout, async1 start, async2, promise1, script end, async1 end, promise2`'
      ],
      answer: 0,
      why: [
        'Так: синхронно до `script end`; продовження `async1` стало в чергу раніше за `promise2`, а `setTimeout` — макрозадача, тож останній.',
        'Ні: так поводились старі рушії (3 тіки на `await`); з ES2019 `await` готового промісу — 1 тік.',
        'Ні: код після `await` завжди асинхронний — `async1 end` не може бути раніше за `promise1`.',
        'Ні: таймер — макрозадача, він виконується після всього синхронного коду й мікрозадач.'
      ],
      hint: 'Що повертає `async2()` і скільки тіків потрібно `await`, щоб дочекатися вже виконаного нативного промісу?',
      explanation: `
1. Синхронно: \`script start\`, \`async1 start\`, \`async2\` (викликається до \`await\`), \`promise1\` (executor), \`script end\`.
2. Мікрозадачі: продовження \`async1\` поставлене раніше за \`then\` → \`async1 end\`, \`promise2\`.
3. Макрозадача: \`setTimeout\`.
`
    },
    {
      id: 'async-quiz-resolve-with-promise-ticks',
      group: 'async-await',
      type: 'quiz',
      level: 4,
      title: 'return промісу з async: зайві тіки',
      tags: [
        'event-loop',
        'promises',
        'spec'
      ],
      question: `
Що виведе код?

\`\`\`js
async function a() {
  return Promise.resolve('A');
}

a().then((v) => console.log(v));

Promise.resolve()
  .then(() => console.log(1))
  .then(() => console.log(2))
  .then(() => console.log(3));
\`\`\`
`,
      options: [
        '`A 1 2 3`',
        '`1 A 2 3`',
        '`1 2 A 3`',
        '`1 2 3 A`'
      ],
      answer: 2,
      why: [
        'Ні: `return Promise.resolve(\'A\')` у async додає 2 зайві тіки — `A` не може бути першим.',
        'Ні: один тік мало — резолв thenable-ом коштує два додаткові.',
        'Так: проміс `a()` резолвиться промісом → 2 зайві тіки, тож `A` з\'являється після `2`.',
        'Ні: затримка — 2 тіки, не 3; `A` випереджає `3`.'
      ],
      hint: 'Проміс async-функції резолвиться іншим промісом (thenable). Як специфікація обробляє резолв thenable-об\'єктом?',
      explanation: `
Резолв промісу **іншим промісом/thenable** ставить \`ResolveThenableJob\`, який викликає \`inner.then(...)\` — ще один тік. Разом +2 тіки, тому \`1 2 A 3\`. З \`return 'A'\` було б \`A 1 2 3\`. Головне — знати, що резолв thenable асинхронний.
`
    },
    // ------------------------------------------------------------ Утиліти: retry, пул, кеш, скасування
    {
      id: 'async-retry',
      group: 'utilities',
      type: 'code',
      level: 3,
      interview: true,
      title: 'retry з експоненційною затримкою',
      tags: [
        'async-await',
        'timers',
        'resilience'
      ],
      description: `
**Завдання.** Напишіть \`retry(fn, attempts, baseDelay)\`: повторювати невдалу асинхронну операцію з експоненційною паузою.

**Де трапляється:** нестабільна мережа, 503 від сервера, мобільний інтернет. Топ-задача співбесід.

**Що написати**
- \`retry(fn, attempts = 3, baseDelay = 100)\` → \`Promise\`:
  - викликає \`fn(attempt)\` (\`attempt\` з 1); \`fn\` повертає проміс/значення або кидає синхронно;
  - успіх → результат;
  - помилка → пауза і нова спроба, **не більше \`attempts\` спроб загалом**;
  - паузи: \`baseDelay\`, \`baseDelay * 2\`, \`baseDelay * 4\`…;
  - після останньої невдачі — **одразу** відхилення **останньою** помилкою.

**Приклад**
\`\`\`js
const data = await retry(() => fetchJson('/flaky'), 5, 200);
// спроби: 0 мс, +200, +400, +800, +1600
\`\`\`

**Як це працює:** цикл по спробах з \`try { return await fn(attempt) } catch\`. Саме \`return await\` (а не \`return fn()\`) розгортає проміс усередині \`try\`, тож відхилення потрапляє в \`catch\`. Паузу робимо через \`await new Promise((r) => setTimeout(r, ms))\`.

**Врахуйте:** синхронний \`throw\` теж ловиться; після останньої спроби не чекати.
`,
      starter: `async function retry(fn, attempts = 3, baseDelay = 100) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    // 1. try { return await fn(attempt); }
    // 2. catch (err) { lastError = err; якщо це не остання спроба — пауза baseDelay * 2 ** (attempt - 1) }
    // TODO
  }
  // 3. Усі спроби невдалі — throw lastError
}

// Спробуйте в консолі:
// let n = 0; retry(() => (++n < 3 ? Promise.reject(new Error('fail')) : 'ok')).then(console.log);
`,
      solution: `async function retry(fn, attempts = 3, baseDelay = 100) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      // await всередині try — ловимо і reject, і синхронний throw
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      if (attempt < attempts) {
        const wait = baseDelay * 2 ** (attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, wait));
      }
    }
  }
  throw lastError;
}
`,
      hints: [
        '`return await fn(attempt)` усередині `try`: без `await` відхилений проміс «пролетить» повз `catch`.',
        'Пауза лише якщо `attempt < attempts`: `await new Promise((r) => setTimeout(r, baseDelay * 2 ** (attempt - 1)))`.'
      ],
      tests: [
        {
          name: 'успіх з першої спроби',
          code: 'const fn = mockFn(() => Promise.resolve("ok"));\nawait expect(retry(fn)).resolves.toBe("ok");\nexpect(fn).toHaveBeenCalledTimes(1);\nexpect(fn).toHaveBeenCalledWith(1);'
        },
        {
          name: 'експоненційні затримки 100 → 200',
          code: 'useFakeTimers();\nlet n = 0;\nconst fn = mockFn(() => (++n < 3 ? Promise.reject(new Error("fail " + n)) : Promise.resolve("ok")));\nconst p = retry(fn, 5, 100);\nawait flushPromises();\nexpect(fn).toHaveBeenCalledTimes(1);\nadvanceTimersByTime(99);\nawait flushPromises();\nexpect(fn).toHaveBeenCalledTimes(1);\nadvanceTimersByTime(1);\nawait flushPromises();\nexpect(fn).toHaveBeenCalledTimes(2);\nadvanceTimersByTime(199);\nawait flushPromises();\nexpect(fn).toHaveBeenCalledTimes(2);\nadvanceTimersByTime(1);\nawait expect(p).resolves.toBe("ok");\nexpect(fn).toHaveBeenCalledTimes(3);'
        },
        {
          name: 'після всіх спроб — остання помилка',
          code: 'useFakeTimers();\nlet n = 0;\nconst fn = mockFn(() => Promise.reject(new Error("fail " + ++n)));\nconst p = retry(fn, 3, 10);\nfor (let i = 0; i < 5; i++) { await flushPromises(); advanceTimersByTime(100); }\nawait expect(p).rejects.toThrow("fail 3");\nexpect(fn).toHaveBeenCalledTimes(3);'
        },
        {
          name: 'ловить синхронний throw',
          code: 'useFakeTimers();\nlet n = 0;\nconst fn = () => { if (++n === 1) throw new Error("sync"); return "second"; };\nconst p = retry(fn, 2, 50);\nawait flushPromises();\nadvanceTimersByTime(50);\nawait expect(p).resolves.toBe("second");'
        },
        {
          name: 'не чекає після останньої спроби',
          code: 'useFakeTimers();\nconst fn = () => Promise.reject(new Error("x"));\nlet rejected = false;\nretry(fn, 2, 100).catch(() => { rejected = true; });\nawait flushPromises();\nadvanceTimersByTime(100);\nawait flushPromises();\nexpect(rejected).toBe(true);'
        }
      ],
      explanation: `
\`return await\` у \`try\` ловить і reject, і синхронний \`throw\`. Між спробами — \`baseDelay * 2^(n-1)\`.

**Production-версія:** jitter (щоб клієнти не повторювали синхронно); повторювати лише тимчасові помилки (мережа, 503, 429), не 400/404; ідемпотентність запиту; \`maxDelay\` і \`AbortSignal\`.

**Типові помилки:** \`return fn()\` без \`await\`; пауза після останньої спроби; повертати першу помилку замість останньої.
`
    },
    {
      id: 'async-poll-until',
      group: 'utilities',
      type: 'code',
      level: 3,
      title: 'pollUntil(condition, { interval, timeout })',
      tags: [
        'async-await',
        'timers'
      ],
      description: `
**Завдання.** Напишіть \`pollUntil(conditionFn, { interval, timeout })\`: перевіряти умову періодично, доки вона не стане truthy або не мине \`timeout\`.

**Де трапляється:** чекати, поки бекенд згенерує звіт/відео (статус задачі \`done\`), перевірка оплати.

**Що написати**
- \`pollUntil(conditionFn, { interval = 100, timeout = 1000 } = {})\` → \`Promise\`:
  - перша перевірка **одразу**, наступні — через \`interval\` мс **після завершення** попередньої (\`conditionFn\` може бути async);
  - truthy результат → виконується ним;
  - не встигли за \`timeout\` → \`Error('pollUntil timeout')\` (не раніше);
  - \`conditionFn\` кинула/відхилилась → одразу відхилення цією помилкою;
  - після завершення — жодних таймерів і викликів.

**Приклад**
\`\`\`js
const job = await pollUntil(async () => {
  const j = await getJob(id);
  return j.status === 'done' && j;
}, { interval: 1000, timeout: 30000 });
\`\`\`

**Як це працює:** рекурсивний \`setTimeout\` планує наступну перевірку лише після завершення поточної — повільні перевірки не накладаються (на відміну від \`setInterval\`). Час рахуємо від \`Date.now()\` на старті.

**Врахуйте:** зупиняти полінг після resolve/reject.
`,
      starter: `function pollUntil(conditionFn, { interval = 100, timeout = 1000 } = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    async function check() {
      // 1. try { const result = await conditionFn(); }
      // 2. truthy → resolve(result)
      // 3. минув timeout → reject(new Error('pollUntil timeout'))
      // 4. інакше → setTimeout(check, interval)
      // 5. catch (err) → reject(err)
      // TODO
    }

    check();
  });
}

// Спробуйте в консолі:
// let n = 0; pollUntil(() => ++n === 3 && 'ready', { interval: 200 }).then(console.log);
`,
      solution: `function pollUntil(conditionFn, { interval = 100, timeout = 1000 } = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    let timer = null;

    async function check() {
      try {
        const result = await conditionFn();
        if (result) return resolve(result);
        if (Date.now() - start >= timeout) {
          return reject(new Error('pollUntil timeout'));
        }
        // наступна перевірка — лише ПІСЛЯ завершення поточної (рекурсивний setTimeout)
        timer = setTimeout(check, interval);
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    }

    check();
  });
}
`,
      hints: [
        'Після невдалої перевірки: `if (Date.now() - start >= timeout) return reject(new Error(\'pollUntil timeout\'));`.',
        'Наступна перевірка — `setTimeout(check, interval)` наприкінці `check`, а не `setInterval`.'
      ],
      tests: [
        {
          name: 'одразу truthy — без таймерів',
          code: 'useFakeTimers();\nconst fn = mockFn(() => "ready");\nawait expect(pollUntil(fn)).resolves.toBe("ready");\nexpect(fn).toHaveBeenCalledTimes(1);\nexpect(getTimerCount()).toBe(0);'
        },
        {
          name: 'перевіряє кожні interval мс',
          code: 'useFakeTimers();\nlet n = 0;\nconst fn = mockFn(() => (++n === 3 ? { n } : null));\nconst p = pollUntil(fn, { interval: 100, timeout: 1000 });\nawait flushPromises();\nexpect(fn).toHaveBeenCalledTimes(1);\nadvanceTimersByTime(100);\nawait flushPromises();\nexpect(fn).toHaveBeenCalledTimes(2);\nadvanceTimersByTime(100);\nawait expect(p).resolves.toEqual({ n: 3 });\nawait flushPromises();\nexpect(getTimerCount()).toBe(0);'
        },
        {
          name: 'async умова',
          code: 'useFakeTimers();\nlet n = 0;\nconst p = pollUntil(async () => ++n >= 2, { interval: 50 });\nawait flushPromises();\nadvanceTimersByTime(50);\nawait expect(p).resolves.toBe(true);'
        },
        {
          name: 'відхиляється після timeout, не раніше',
          code: 'useFakeTimers();\nconst fn = mockFn(() => false);\nlet error = null;\npollUntil(fn, { interval: 100, timeout: 300 }).catch((e) => { error = e; });\nfor (let i = 0; i < 2; i++) { await flushPromises(); advanceTimersByTime(100); }\nawait flushPromises();\nexpect(error).toBeNull();\nfor (let i = 0; i < 5; i++) { await flushPromises(); advanceTimersByTime(100); }\nawait flushPromises();\nexpect(error).toBeInstanceOf(Error);\nexpect(error.message).toBe("pollUntil timeout");\nconst calls = fn.callCount;\nadvanceTimersByTime(1000);\nawait flushPromises();\nexpect(fn.callCount).toBe(calls);'
        },
        {
          name: 'помилка умови відхиляє результат',
          code: 'useFakeTimers();\nconst p = pollUntil(() => { throw new Error("broken"); });\nawait expect(p).rejects.toThrow("broken");\nexpect(getTimerCount()).toBe(0);'
        }
      ],
      explanation: `
Рекурсивний \`setTimeout\` після кожної перевірки гарантує, що перевірки не накладаються навіть для повільних запитів.

**Типові помилки:** \`setInterval\` з async-умовою; полінг після resolve (витік); помилка умови «ковтається».

**Що можуть спитати далі:** \`AbortSignal\`; експоненційний інтервал; коли краще WebSocket/SSE?
`
    },
    {
      id: 'async-memoize-async',
      group: 'utilities',
      type: 'code',
      level: 3,
      title: 'memoizeAsync з дедуплікацією запитів',
      tags: [
        'async-await',
        'caching'
      ],
      description: `
**Завдання.** Напишіть \`memoizeAsync(fn)\` — кеш для асинхронної функції з **дедуплікацією запитів «у польоті»**.

**Де трапляється:** три компоненти одночасно просять \`getUser(1)\` — має піти один запит (так працюють React Query, SWR).

**Що написати**
- \`memoizeAsync(fn)\` → функція, що повертає проміс:
  - ключ кешу — \`JSON.stringify(args)\`;
  - виклик з ключем, що вже виконується → **той самий** проміс, \`fn\` не викликається вдруге;
  - **помилки не кешуються**: після відхилення наступний виклик знову викликає \`fn\`;
  - синхронний \`throw\` у \`fn\` → відхилений проміс.

**Приклад**
\`\`\`js
const getUser = memoizeAsync((id) => fetchJson('/users/' + id));
getUser(1); getUser(1); // один запит
\`\`\`

**Як це працює:** кешуємо **сам проміс** і робимо це **синхронно** в момент виклику — тоді другий виклик, що прийшов, поки перший у дорозі, знайде проміс у кеші. Якщо кешувати значення після \`await\`, паралельні виклики кешу ще не побачать.

**Врахуйте:** при відхиленні видаляйте запис, лише якщо в кеші досі саме цей проміс.
`,
      starter: `function memoizeAsync(fn) {
  const cache = new Map(); // key -> Promise

  return function (...args) {
    const key = JSON.stringify(args);
    // 1. Є в кеші — повернути збережений проміс
    // 2. Створити проміс: new Promise((resolve) => resolve(fn.apply(this, args)))
    //    (так синхронний throw стане reject)
    // 3. Одразу покласти його в cache
    // 4. promise.catch(() => видалити запис, якщо cache.get(key) === promise)
    // 5. Повернути проміс
    // TODO
  };
}

// Спробуйте в консолі:
// const m = memoizeAsync(async (x) => { console.log('fetch', x); return x; });
// m(1); m(1); // 'fetch 1' — один раз
`,
      solution: `function memoizeAsync(fn) {
  const cache = new Map(); // key -> Promise

  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);

    // кешуємо САМ ПРОМІС одразу — так паралельні виклики отримають той самий
    const promise = new Promise((resolve) => resolve(fn.apply(this, args)));
    cache.set(key, promise);

    // помилки не кешуємо: прибираємо запис, щоб наступний виклик повторив запит
    promise.catch(() => {
      if (cache.get(key) === promise) cache.delete(key);
    });

    return promise;
  };
}
`,
      hints: [
        'У кеш кладіть проміс одразу, до будь-якого `await` — тоді паралельні виклики його побачать.',
        'Помилки: `promise.catch(() => { if (cache.get(key) === promise) cache.delete(key); })`.'
      ],
      tests: [
        {
          name: 'паралельні виклики — один запит',
          code: 'useFakeTimers();\nconst fn = mockFn((id) => new Promise((r) => setTimeout(() => r({ id }), 100)));\nconst m = memoizeAsync(fn);\nconst p1 = m(1), p2 = m(1);\nadvanceTimersByTime(100);\nexpect(await p1).toEqual({ id: 1 });\nexpect(await p2).toBe(await p1);\nexpect(fn).toHaveBeenCalledTimes(1);'
        },
        {
          name: 'кешує після завершення',
          code: 'const fn = mockFn(async (x) => x * 2);\nconst m = memoizeAsync(fn);\nexpect(await m(2)).toBe(4);\nexpect(await m(2)).toBe(4);\nexpect(fn).toHaveBeenCalledTimes(1);'
        },
        {
          name: 'різні аргументи — різні виклики',
          code: 'const fn = mockFn(async (a, b) => a + b);\nconst m = memoizeAsync(fn);\nexpect(await m(1, 2)).toBe(3);\nexpect(await m(2, 1)).toBe(3);\nexpect(fn).toHaveBeenCalledTimes(2);'
        },
        {
          name: 'помилки не кешуються',
          code: 'let n = 0;\nconst fn = mockFn(async () => { if (++n === 1) throw new Error("fail"); return "ok"; });\nconst m = memoizeAsync(fn);\nawait expect(m("k")).rejects.toThrow("fail");\nawait flushPromises();\nawait expect(m("k")).resolves.toBe("ok");\nexpect(fn).toHaveBeenCalledTimes(2);'
        },
        {
          name: 'паралельні виклики разом отримують помилку',
          code: 'useFakeTimers();\nconst fn = mockFn(() => new Promise((_, rej) => setTimeout(() => rej(new Error("down")), 50)));\nconst m = memoizeAsync(fn);\nconst a = m(1), b = m(1);\nadvanceTimersByTime(50);\nawait expect(a).rejects.toThrow("down");\nawait expect(b).rejects.toThrow("down");\nexpect(fn).toHaveBeenCalledTimes(1);'
        },
        {
          name: 'синхронний throw → відхилений проміс',
          code: 'const m = memoizeAsync(() => { throw new Error("sync"); });\nlet p;\nexpect(() => { p = m(); }).not.toThrow();\nawait expect(p).rejects.toThrow("sync");'
        }
      ],
      explanation: `
Кешування **промісу** дає in-flight deduplication; видалення відхилених промісів не дає одній мережевій помилці «отруїти» кеш.

**Production:** TTL/інвалідація, LRU-обмеження, \`JSON.stringify\` не підходить для циклічних об'єктів і чутливий до порядку ключів.

**Типові помилки:** кешувати значення після \`await\`; кешувати відхилені проміси.
`
    },
    {
      id: 'async-map-limit',
      group: 'utilities',
      type: 'code',
      level: 3,
      interview: true,
      title: 'mapLimit: пул з обмеженням паралельності',
      tags: [
        'async-await',
        'concurrency'
      ],
      description: `
**Завдання.** Напишіть \`mapLimit(items, limit, fn)\` — як \`Promise.all(items.map(fn))\`, але **одночасно не більше \`limit\`** викликів.

**Де трапляється:** завантажити 100 картинок/файлів, не більше 4 одночасно (ліміт з'єднань, rate limit API). Топ-задача співбесід («promise pool»).

**Що написати**
- \`mapLimit(items, limit, fn)\` → \`Promise<array>\`:
  - \`fn(item, index)\` повертає проміс;
  - результат у порядку \`items\`;
  - щойно один виклик завершився — одразу стартує наступний (не чекаємо всю «пачку»);
  - одразу стартує \`min(limit, items.length)\` задач;
  - перша помилка → відхилення.

**Приклад**
\`\`\`js
const images = await mapLimit(urls, 4, loadImage);
\`\`\`

**Як це працює:** «пул воркерів»: запускаємо \`limit\` async-функцій, кожна в циклі забирає наступний індекс зі спільного лічильника, поки робота не скінчиться. \`nextIndex++\` безпечний — JS однопотоковий і між читанням та записом немає \`await\`.

**Врахуйте:** порожній масив; \`limit\` більший за кількість елементів.
`,
      starter: `async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    // 1. Поки nextIndex < items.length:
    //    const i = nextIndex++;  results[i] = await fn(items[i], i);
    // TODO
  }

  // 2. Запустіть min(limit, items.length) воркерів
  // 3. await Promise.all(воркери) і поверніть results
  // TODO
}

// Спробуйте в консолі:
// mapLimit([1, 2, 3], 2, async (x) => x * 10).then(console.log); // [10, 20, 30]
`,
      solution: `async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let nextIndex = 0;

  // «Воркер» бере наступний вільний індекс, поки є робота.
  // JS однопотоковий, тож nextIndex++ безпечний — гонок немає.
  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await fn(items[i], i);
    }
  }

  const count = Math.min(limit, items.length);
  const workers = [];
  for (let k = 0; k < count; k++) workers.push(worker());

  await Promise.all(workers);
  return results;
}
`,
      hints: [
        'Воркер: `while (nextIndex < items.length) { const i = nextIndex++; results[i] = await fn(items[i], i); }`.',
        '`const workers = Array.from({ length: Math.min(limit, items.length) }, worker); await Promise.all(workers);`.'
      ],
      tests: [
        {
          name: 'не більше limit одночасно і порядок результатів',
          code: 'useFakeTimers();\nlet active = 0, maxActive = 0;\nconst fn = (x) => { active++; maxActive = Math.max(maxActive, active); return new Promise((r) => setTimeout(() => { active--; r(x * 2); }, x * 10)); };\nconst p = mapLimit([5, 1, 3, 2, 4], 2, fn);\nfor (let i = 0; i < 20; i++) { advanceTimersByTime(10); await flushPromises(); }\nawait expect(p).resolves.toEqual([10, 2, 6, 4, 8]);\nexpect(maxActive).toBe(2);'
        },
        {
          name: 'одразу стартує limit задач',
          code: 'useFakeTimers();\nconst fn = mockFn(() => new Promise((r) => setTimeout(r, 100)));\nmapLimit([1, 2, 3, 4, 5], 3, fn);\nawait flushPromises();\nexpect(fn).toHaveBeenCalledTimes(3);'
        },
        {
          name: 'нова задача стартує, щойно звільнилось місце',
          code: 'useFakeTimers();\nconst started = [];\nconst fn = (ms, i) => { started.push(i); return new Promise((r) => setTimeout(r, ms)); };\nmapLimit([100, 10, 100, 100], 2, fn);\nawait flushPromises();\nexpect(started).toEqual([0, 1]);\nadvanceTimersByTime(10);\nawait flushPromises();\nexpect(started).toEqual([0, 1, 2]);'
        },
        { name: 'порожній масив → []', code: 'await expect(mapLimit([], 3, async (x) => x)).resolves.toEqual([]);' },
        { name: 'limit більший за кількість елементів', code: 'await expect(mapLimit([1, 2], 10, async (x, i) => x + i)).resolves.toEqual([1, 3]);' },
        {
          name: 'помилка відхиляє результат',
          code: 'const fn = async (x) => { if (x === 2) throw new Error("bad " + x); return x; };\nawait expect(mapLimit([1, 2, 3], 2, fn)).rejects.toThrow("bad 2");'
        }
      ],
      explanation: `
Воркер, що звільнився, одразу бере нову задачу — завжди виконується рівно \`limit\` задач (ковзне вікно).

**Погана альтернатива:** чанки по \`limit\` з \`await Promise.all(chunk)\` — повільна задача блокує весь чанк.

**Типові помилки:** \`results.push\`; \`items.map(fn)\` — проміси стартують одразу, обмеження немає.

**Що можуть спитати далі:** зупиняти нові задачі після помилки; версія з \`allSettled\`-результатами.
`
    },
    {
      id: 'async-abort-theory',
      group: 'utilities',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Скасування: AbortController і race conditions',
      tags: [
        'cancellation',
        'fetch',
        'race-conditions'
      ],
      question: 'Як скасувати fetch або іншу асинхронну операцію? Що таке race condition у фронтенді (наприклад, у пошуку з автодоповненням) і як її уникнути? Оберіть **усі** правильні твердження.',
      choices: [
        '`controller.abort()` відхиляє `fetch` з `AbortError`, який зазвичай не показують користувачу як помилку',
        'Debounce повністю усуває race condition, бо запити після нього більше не йдуть паралельно',
        '`Promise.race` з таймаутом скасовує сам запит, тож окремий `AbortController` уже не потрібен',
        'Застарілу відповідь можна відкинути, порівнявши id запиту з останнім перед оновленням стану',
        'Race condition неможливий в однопотоковому JS, бо колбеки ніколи не виконуються одночасно'
      ],
      answer: `
- Проміси не скасовуються; стандарт — **кооперативне скасування** через \`AbortController\`:
\`\`\`js
const controller = new AbortController();
fetch('/api/search?q=js', { signal: controller.signal })
  .catch((err) => { if (err.name !== 'AbortError') throw err; });
controller.abort(); // fetch відхиляється з AbortError
\`\`\`
- \`signal.aborted\`, \`signal.reason\`, подія \`abort\`; \`AbortSignal.timeout(ms)\`, \`AbortSignal.any([...])\`; \`addEventListener(type, fn, { signal })\`.
- **Race condition:** відповідь на «re» прийшла пізніше за «react» і перезаписала результати.
- **Рішення:** скасувати попередній запит; або ігнорувати застарілі відповіді:
\`\`\`js
let requestId = 0;
async function search(q) {
  const id = ++requestId;
  const data = await api(q);
  if (id !== requestId) return; // застаріла відповідь
  render(data);
}
\`\`\`
- **Debounce** зменшує кількість запитів, але гонку не усуває. У React — \`ignore\`/\`AbortController\` у cleanup \`useEffect\`.
`,
      correct: [0, 3],
      why: [
        'Так: `abort()` відхиляє `fetch` з `AbortError` — це очікувана подія, її зазвичай тихо ігнорують.',
        'Ні: після debounce повільний старий запит усе ще може повернутися пізніше за новий.',
        'Ні: `race` лише перестає чекати — запит продовжує йти; скасовує його лише `AbortController`.',
        'Так: лічильник/id запиту дозволяє проігнорувати застарілу відповідь перед оновленням UI.',
        'Ні: колбеки не виконуються одночасно, але ВІДПОВІДІ можуть прийти в іншому порядку — це і є гонка.'
      ],
      keyPoints: [
        'AbortController + signal → fetch відхиляється з AbortError',
        'AbortError обробляють окремо, не показують як помилку',
        'Race condition: застаріла відповідь перезаписує новішу',
        'Рішення: скасування попереднього запиту або перевірка актуальності (id/версія)',
        'Debounce зменшує навантаження, але не усуває гонку'
      ],
      followUps: [
        'Як скасувати запит у cleanup useEffect?',
        'Що таке switchMap у RxJS?',
        'Чи скасовує abort вже відправлений на сервер запит?'
      ]
    },
    {
      id: 'async-cancellable-delay',
      group: 'utilities',
      type: 'code',
      level: 3,
      title: 'Скасовуваний delay з AbortSignal',
      tags: [
        'cancellation',
        'timers',
        'promises'
      ],
      description: `
**Завдання.** Напишіть \`cancellableDelay(ms, { signal })\` — \`delay\`, який можна скасувати через \`AbortController\`, як \`fetch\`.

**Де трапляється:** пауза в \`retry\`/полінгу, яку треба перервати, коли користувач пішов зі сторінки чи компонент розмонтовано.

**Що написати**
- \`cancellableDelay(ms, { signal } = {})\` → \`Promise\`:
  - через \`ms\` мс виконується \`undefined\`;
  - \`signal\` скасовано під час очікування → **одразу** відхилення з \`signal.reason\`, таймер очищено;
  - \`signal\` уже скасований на старті → відхилення без таймера;
  - після нормального завершення обробник \`abort\` знято.

**Приклад**
\`\`\`js
const controller = new AbortController();
cancellableDelay(5000, { signal: controller.signal }).catch((e) => console.log(e.name)); // 'AbortError'
controller.abort();
\`\`\`

**Як це працює:** \`AbortSignal\` — це \`EventTarget\`: при \`controller.abort(reason)\` він стає \`aborted\`, отримує \`reason\` (за замовчуванням \`DOMException\` \`AbortError\`) і генерує подію \`abort\`. Ми слухаємо її, очищаємо таймер і відхиляємо проміс.

**Врахуйте:** подія \`abort\` не прийде, якщо сигнал уже скасований — перевірте \`signal.aborted\` на старті.
`,
      starter: `function cancellableDelay(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    // 1. signal?.aborted → reject(signal.reason) і вийти
    // 2. const onAbort = () => { clearTimeout(timer); reject(signal.reason); };
    // 3. const timer = setTimeout(() => { зняти onAbort; resolve(); }, ms);
    // 4. signal?.addEventListener('abort', onAbort, { once: true })
    // TODO
  });
}

// Спробуйте в консолі:
// const c = new AbortController(); cancellableDelay(3000, { signal: c.signal }).catch(console.log); c.abort();
`,
      solution: `function cancellableDelay(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) {
      reject(signal.reason);
      return;
    }

    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };

    const timer = setTimeout(() => {
      if (signal) signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    if (signal) signal.addEventListener('abort', onAbort, { once: true });
  });
}
`,
      hints: [
        'Перший рядок: `if (signal && signal.aborted) return reject(signal.reason);`.',
        'У колбеку таймера: `if (signal) signal.removeEventListener(\'abort\', onAbort); resolve();`.'
      ],
      tests: [
        {
          name: 'виконується через ms',
          code: 'useFakeTimers();\nconst p = cancellableDelay(100);\nadvanceTimersByTime(100);\nawait expect(p).resolves.toBeUndefined();'
        },
        {
          name: 'abort під час очікування → AbortError і без таймерів',
          code: 'useFakeTimers();\nconst c = new AbortController();\nconst p = cancellableDelay(1000, { signal: c.signal });\nadvanceTimersByTime(100);\nc.abort();\nconst e = await p.catch((x) => x);\nexpect(e.name).toBe("AbortError");\nexpect(getTimerCount()).toBe(0);'
        },
        {
          name: 'abort з власною причиною',
          code: 'useFakeTimers();\nconst c = new AbortController();\nconst p = cancellableDelay(1000, { signal: c.signal });\nc.abort(new Error("stop"));\nawait expect(p).rejects.toThrow("stop");'
        },
        {
          name: 'вже скасований сигнал — відхилення без таймера',
          code: 'useFakeTimers();\nconst c = new AbortController();\nc.abort();\nconst p = cancellableDelay(100, { signal: c.signal });\nexpect(getTimerCount()).toBe(0);\nawait expect(p).rejects.toSatisfy((e) => e.name === "AbortError");'
        },
        {
          name: 'abort після завершення нічого не ламає',
          code: 'useFakeTimers();\nconst c = new AbortController();\nconst p = cancellableDelay(10, { signal: c.signal });\nadvanceTimersByTime(10);\nawait expect(p).resolves.toBeUndefined();\nexpect(() => c.abort()).not.toThrow();'
        }
      ],
      explanation: `
Будь-яку власну асинхронну операцію можна зробити скасовуваною: слухати \`abort\`, звільнити ресурс (таймер), відхилити \`signal.reason\`.

**Чому знімати обробник:** довгоживучий сигнал інакше накопичує обробники й замикання — витік пам'яті.

**Типові помилки:** не перевірили \`signal.aborted\` на старті; \`reject(new Error('aborted'))\` замість \`signal.reason\`.
`
    },
    {
      id: 'async-latest-validator',
      group: 'utilities',
      type: 'code',
      level: 3,
      title: 'Debounced async-валідатор без race condition',
      tags: [
        'race-conditions',
        'debounce',
        'async-await'
      ],
      description: `
**Завдання.** Напишіть \`createLatestValidator(checkFn, options)\` для перевірки логіна на сервері: debounce + **лише остання відповідь перемагає**.

**Де трапляється:** поле «логін зайнятий?», автодоповнення пошуку. Класичний race condition: повільна відповідь на «a» приходить пізніше за «ab» і перезаписує статус.

**Що написати**
- \`createLatestValidator(checkFn, { wait = 300, onResult, onError })\` → \`validate(value)\`:
  1. \`checkFn(value)\` викликається через \`wait\` мс після **останнього** \`validate\`;
  2. якщо після старту перевірки був ще хоча б один \`validate\`, її результат **ігнорується**;
  3. актуальний результат → \`onResult(result, value)\`; актуальна помилка → \`onError(error, value)\`.

**Приклад**
\`\`\`js
const validate = createLatestValidator(checkLogin, {
  wait: 300,
  onResult: (free, login) => showStatus(login, free),
});
input.addEventListener('input', (e) => validate(e.target.value));
\`\`\`

**Як це працює:** debounce зменшує кількість запитів, але дві перевірки все одно можуть бути «в дорозі» разом. Лічильник \`version\` збільшується на кожному \`validate\`; кожен виклик запам'ятовує свій номер у замиканні й після \`await\` порівнює його з поточним.

**Врахуйте:** помилки застарілих перевірок теж ігнорувати.
`,
      starter: `function createLatestValidator(checkFn, { wait = 300, onResult = () => {}, onError = () => {} } = {}) {
  let timer = null;
  // 1. Додайте лічильник version — номер останнього виклику validate

  return function validate(value) {
    // 2. const current = ++version;
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        const result = await checkFn(value);
        // 3. TODO: викликати onResult, лише якщо current === version
        onResult(result, value);
      } catch (err) {
        // 4. TODO: так само для onError
        onError(err, value);
      }
    }, wait);
  };
}
`,
      solution: `function createLatestValidator(checkFn, { wait = 300, onResult = () => {}, onError = () => {} } = {}) {
  let timer = null;
  let version = 0; // номер останнього виклику validate

  return function validate(value) {
    const current = ++version;
    clearTimeout(timer);

    timer = setTimeout(async () => {
      try {
        const result = await checkFn(value);
        // поки ми чекали, міг прийти новіший validate — тоді результат застарів
        if (current === version) onResult(result, value);
      } catch (err) {
        if (current === version) onError(err, value);
      }
    }, wait);
  };
}
`,
      hints: [
        'Debounce уже є. Проблема — старий запит, що вже стартував, може завершитися пізніше за новий.',
        'Після `await checkFn(value)`: `if (current === version) onResult(result, value);` — те саме в `catch`.'
      ],
      tests: [
        {
          name: 'debounce: лише остання перевірка',
          code: 'useFakeTimers();\nconst check = mockFn(async (v) => v.length > 2);\nconst onResult = mockFn();\nconst validate = createLatestValidator(check, { wait: 100, onResult });\nvalidate("a"); advanceTimersByTime(50);\nvalidate("ab"); advanceTimersByTime(50);\nvalidate("abc"); advanceTimersByTime(100);\nawait flushPromises();\nexpect(check).toHaveBeenCalledTimes(1);\nexpect(check).toHaveBeenCalledWith("abc");\nexpect(onResult).toHaveBeenCalledWith(true, "abc");'
        },
        {
          name: 'застаріла повільна відповідь ігнорується',
          code: 'useFakeTimers();\nconst check = (v) => new Promise((r) => setTimeout(() => r("res:" + v), v === "a" ? 500 : 50));\nconst onResult = mockFn();\nconst validate = createLatestValidator(check, { wait: 100, onResult });\nvalidate("a");\nadvanceTimersByTime(100);\nvalidate("ab");\nadvanceTimersByTime(150);\nawait flushPromises();\nexpect(onResult).toHaveBeenCalledTimes(1);\nexpect(onResult).toHaveBeenLastCalledWith("res:ab", "ab");\nadvanceTimersByTime(500);\nawait flushPromises();\nexpect(onResult).toHaveBeenCalledTimes(1);'
        },
        {
          name: 'відповідь застаріває, навіть якщо новий запит ще в debounce',
          code: 'useFakeTimers();\nconst check = (v) => new Promise((r) => setTimeout(() => r(v), 50));\nconst onResult = mockFn();\nconst validate = createLatestValidator(check, { wait: 100, onResult });\nvalidate("a");\nadvanceTimersByTime(100);\nvalidate("ab");\nadvanceTimersByTime(60);\nawait flushPromises();\nexpect(onResult).not.toHaveBeenCalled();\nadvanceTimersByTime(100);\nawait flushPromises();\nexpect(onResult).toHaveBeenCalledTimes(1);\nexpect(onResult).toHaveBeenCalledWith("ab", "ab");'
        },
        {
          name: 'помилка актуальної перевірки → onError',
          code: 'useFakeTimers();\nconst onError = mockFn();\nconst onResult = mockFn();\nconst validate = createLatestValidator(async () => { throw new Error("500"); }, { wait: 10, onResult, onError });\nvalidate("x");\nadvanceTimersByTime(10);\nawait flushPromises();\nexpect(onResult).not.toHaveBeenCalled();\nexpect(onError).toHaveBeenCalledTimes(1);\nexpect(onError.mock.calls[0][1]).toBe("x");'
        },
        {
          name: 'помилка застарілої перевірки ігнорується',
          code: 'useFakeTimers();\nconst check = (v) => new Promise((res, rej) => setTimeout(() => (v === "a" ? rej(new Error("old")) : res("ok")), v === "a" ? 300 : 10));\nconst onError = mockFn();\nconst onResult = mockFn();\nconst validate = createLatestValidator(check, { wait: 100, onResult, onError });\nvalidate("a");\nadvanceTimersByTime(100);\nvalidate("ab");\nadvanceTimersByTime(400);\nawait flushPromises();\nexpect(onError).not.toHaveBeenCalled();\nexpect(onResult).toHaveBeenCalledWith("ok", "ab");'
        }
      ],
      explanation: `
**Debounce** — менше запитів; **версіонування** — UI бачить лише відповідь на останній ввід.

**Альтернатива:** \`AbortController\` — скасовувати попередню перевірку (ще й економить мережу); на практиці поєднують.

**Типові помилки:** лише debounce; порівнювати значення (\`value === lastValue\`) замість версії — ламається, якщо користувач повернувся до того самого тексту.
`
    },
    {
      id: 'async-queue-concurrency',
      group: 'utilities',
      type: 'code',
      level: 4,
      title: 'Асинхронна черга: concurrency, pause/resume, onIdle',
      tags: [
        'concurrency',
        'async-await',
        'design'
      ],
      description: `
**Завдання.** Напишіть \`createQueue(concurrency)\` — чергу асинхронних задач з обмеженням паралельності, паузою і очікуванням завершення.

**Де трапляється:** завантаження файлів у Google Drive-подібному UI, фонова синхронізація, rate limit API (бібліотеки \`p-queue\`, \`p-limit\`).

**Що написати**
- \`createQueue(concurrency = 1)\` → об'єкт:
  - \`add(task)\` → проміс з результатом/помилкою задачі; \`task\` — функція; старт одразу, якщо є слот і не пауза, інакше FIFO;
  - одночасно не більше \`concurrency\`; помилка задачі **не зупиняє** чергу;
  - \`pause()\` — нові не стартують (поточні доробляються); \`resume()\` — продовжити;
  - \`size\` — скільки чекають; \`pending\` — скільки виконуються;
  - \`onIdle()\` → проміс, що виконується, коли черга порожня і нічого не виконується.

**Приклад**
\`\`\`js
const q = createQueue(2);
files.forEach((f) => q.add(() => upload(f)).catch(report));
await q.onIdle();
\`\`\`

**Як це працює:** зберігаємо в черзі задачу разом з \`resolve/reject\` промісу, який повернув \`add\` (патерн deferred). Один планувальник \`runNext()\` запускає задачі, поки є слоти, і викликається скрізь, де слот може звільнитися: \`add\`, завершення задачі, \`resume\`.

**Врахуйте:** синхронний \`throw\` у задачі → відхилення її промісу; \`onIdle\` для порожньої черги — одразу.
`,
      starter: `function createQueue(concurrency = 1) {
  const waiting = []; // { task, resolve, reject }
  let running = 0;
  let paused = false;
  let idleWaiters = []; // resolve-функції для onIdle

  function runNext() {
    // 1. Поки !paused && running < concurrency && waiting.length:
    //    дістати задачу, running++, запустити new Promise((r) => r(task()))
    // 2. По завершенню: running--, runNext(), перевірити idle, передати результат у resolve/reject
    // TODO
  }

  return {
    add(task) {
      // TODO: new Promise((resolve, reject) => { waiting.push(...); runNext(); })
    },
    pause() {},
    resume() {},
    get size() { return 0; },
    get pending() { return 0; },
    onIdle() {
      // TODO: одразу Promise.resolve(), якщо нічого не виконується і не чекає; інакше — в idleWaiters
    },
  };
}
`,
      solution: `function createQueue(concurrency = 1) {
  const waiting = []; // { task, resolve, reject }
  let running = 0;
  let paused = false;
  let idleWaiters = [];

  function notifyIdle() {
    if (running === 0 && waiting.length === 0) {
      idleWaiters.forEach((resolve) => resolve());
      idleWaiters = [];
    }
  }

  function runNext() {
    while (!paused && running < concurrency && waiting.length > 0) {
      const { task, resolve, reject } = waiting.shift();
      running++;
      // new Promise(r => r(task())) — синхронний throw теж стане reject
      const run = new Promise((r) => r(task()));
      const finish = () => {
        running--;
        runNext();
        notifyIdle();
      };
      run.then(
        (value) => { finish(); resolve(value); },
        (error) => { finish(); reject(error); }
      );
    }
  }

  return {
    add(task) {
      return new Promise((resolve, reject) => {
        waiting.push({ task, resolve, reject });
        runNext();
      });
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
      runNext();
    },
    get size() {
      return waiting.length;
    },
    get pending() {
      return running;
    },
    onIdle() {
      if (running === 0 && waiting.length === 0) return Promise.resolve();
      return new Promise((resolve) => idleWaiters.push(resolve));
    },
  };
}
`,
      hints: [
        '`add` повертає `new Promise((resolve, reject) => { waiting.push({ task, resolve, reject }); runNext(); })`.',
        'Після завершення задачі: `running--; runNext();` і якщо `running === 0 && !waiting.length` — викликати всіх `idleWaiters`.'
      ],
      tests: [
        {
          name: 'add повертає результат задачі',
          code: 'const q = createQueue(2);\nawait expect(q.add(() => 1)).resolves.toBe(1);\nawait expect(q.add(async () => "a")).resolves.toBe("a");'
        },
        {
          name: 'не більше concurrency одночасно, FIFO',
          code: 'useFakeTimers();\nconst q = createQueue(2);\nconst started = [];\nconst t = (id, ms) => () => { started.push(id); return new Promise((r) => setTimeout(() => r(id), ms)); };\nq.add(t("a", 100)); q.add(t("b", 50)); q.add(t("c", 10)); q.add(t("d", 10));\nawait flushPromises();\nexpect(started).toEqual(["a", "b"]);\nexpect(q.pending).toBe(2);\nexpect(q.size).toBe(2);\nadvanceTimersByTime(50);\nawait flushPromises();\nexpect(started).toEqual(["a", "b", "c"]);'
        },
        {
          name: 'помилка не зупиняє чергу',
          code: 'const q = createQueue(1);\nconst p1 = q.add(() => { throw new Error("bad"); });\nconst p2 = q.add(() => "next");\nawait expect(p1).rejects.toThrow("bad");\nawait expect(p2).resolves.toBe("next");'
        },
        {
          name: 'pause/resume',
          code: 'useFakeTimers();\nconst q = createQueue(1);\nconst started = [];\nconst t = (id) => () => { started.push(id); return new Promise((r) => setTimeout(() => r(id), 10)); };\nq.add(t("a")); q.add(t("b")); q.add(t("c"));\nawait flushPromises();\nq.pause();\nadvanceTimersByTime(10);\nawait flushPromises();\nexpect(started).toEqual(["a"]);\nexpect(q.size).toBe(2);\nexpect(q.pending).toBe(0);\nq.resume();\nawait flushPromises();\nexpect(started).toEqual(["a", "b"]);'
        },
        {
          name: 'onIdle чекає завершення всіх задач',
          code: 'useFakeTimers();\nconst q = createQueue(2);\nlet idle = false;\n[30, 10, 20].forEach((ms) => q.add(() => new Promise((r) => setTimeout(r, ms))));\nq.onIdle().then(() => { idle = true; });\nadvanceTimersByTime(20);\nawait flushPromises();\nexpect(idle).toBe(false);\nadvanceTimersByTime(20);\nawait flushPromises();\nawait flushPromises();\nexpect(idle).toBe(true);\nexpect(q.pending).toBe(0);'
        },
        {
          name: 'onIdle одразу виконується для порожньої черги',
          code: 'const q = createQueue();\nlet idle = false;\nq.onIdle().then(() => { idle = true; });\nawait flushPromises();\nexpect(idle).toBe(true);'
        }
      ],
      explanation: `
FIFO-черга + лічильник активних + планувальник \`runNext()\`. \`new Promise(r => r(task()))\` уніфікує значення, проміси й синхронні винятки.

**Складність:** \`add\` — O(1) амортизовано (\`shift\` — O(n); для великих черг — кільцевий буфер).

**Що можуть спитати далі:** пріоритети; таймаут на задачу; \`clear()\`; rate limit «N задач за секунду».
`
    },
    // ------------------------------------------------------------ Помилки в асинхронному коді
    {
      id: 'async-wait-for-event',
      group: 'utilities',
      type: 'code',
      level: 3,
      title: 'waitForEvent: Promise.withResolvers, таймаут, скасування',
      tags: ['promise', 'abort', 'es2024'],
      description: `
**Завдання.** Напишіть \`waitForEvent(target, type, { timeout, signal } = {})\` → проміс першої події \`type\` на \`target\` (будь-який \`EventTarget\`):
- подія настала → проміс виконується з об'єктом події;
- задано \`timeout\` (мс) і подія не настала → відхилення помилкою з \`name = 'TimeoutError'\` і повідомленням \`'Подія <type> не настала за <timeout> мс'\`;
- \`signal\` скасовано (до виклику або під час очікування) → відхилення з \`signal.reason\`;
- **у будь-якому випадку** слухачі знімаються, а таймер очищується — без витоків.

Використайте \`Promise.withResolvers()\` (ES2024): він повертає \`{ promise, resolve, reject }\`, тож не потрібно вкладати всю логіку в колбек \`new Promise(...)\`.

**Де трапляється:** «дочекатися \`load\` у iframe або \`message\` від воркера, але не довше 5 с», очікування події WebSocket у тестах, кроки онбордингу.

**Приклад**
\`\`\`js
const ev = await waitForEvent(worker, 'message', { timeout: 5000 });
await waitForEvent(video, 'canplay', { signal: controller.signal });
\`\`\`

**Як це працює:** \`Promise.withResolvers()\` повертає \`{ promise, resolve, reject }\`, тож проміс можна завершити з обробника події, таймера чи сигналу скасування. Хто б не спрацював першим, решту треба прибрати (зняти слухача, \`clearTimeout\`), інакше залишаться витоки.
`,
      starter: `function waitForEvent(target, type, { timeout, signal } = {}) {
  const { promise, resolve, reject } = Promise.withResolvers();
  // TODO: уже скасований signal; слухач події; таймер; слухач abort; спільний cleanup
  return promise;
}
`,
      solution: `function waitForEvent(target, type, { timeout, signal } = {}) {
  const { promise, resolve, reject } = Promise.withResolvers();
  if (signal?.aborted) {
    reject(signal.reason);
    return promise;
  }
  let timer;
  function cleanup() {
    target.removeEventListener(type, onEvent);
    signal?.removeEventListener('abort', onAbort);
    clearTimeout(timer);
  }
  function onEvent(event) {
    cleanup();
    resolve(event);
  }
  function onAbort() {
    cleanup();
    reject(signal.reason);
  }
  target.addEventListener(type, onEvent);
  signal?.addEventListener('abort', onAbort);
  if (timeout !== undefined) {
    timer = setTimeout(() => {
      cleanup();
      const err = new Error('Подія ' + type + ' не настала за ' + timeout + ' мс');
      err.name = 'TimeoutError';
      reject(err);
    }, timeout);
  }
  return promise;
}
`,
      hints: [
        'Одна функція `cleanup()` знімає слухач події, слухач `abort` і викликає `clearTimeout` — викликайте її в кожній гілці перед `resolve`/`reject`.',
        'Уже скасований сигнал перевірте одразу: `if (signal?.aborted) { reject(signal.reason); return promise; }`.'
      ],
      tests: [
        { name: 'подія', code: "const t = new EventTarget();\nconst p = waitForEvent(t, 'ready');\nt.dispatchEvent(new Event('ready'));\nconst e = await p;\nexpect(e.type).toBe('ready');" },
        { name: 'таймаут і очищення', code: "useFakeTimers();\nconst t = new EventTarget();\nconst p = waitForEvent(t, 'ready', { timeout: 100 });\nlet err = null;\np.catch((e) => { err = e; });\nadvanceTimersByTime(99);\nawait flushPromises();\nexpect(err).toBe(null);\nadvanceTimersByTime(1);\nawait flushPromises();\nexpect(err.name).toBe('TimeoutError');\nexpect(err.message).toBe('Подія ready не настала за 100 мс');\nexpect(getTimerCount()).toBe(0);" },
        { name: 'скасування до і під час очікування', code: "const t = new EventTarget();\nconst c = new AbortController();\nconst p = waitForEvent(t, 'ready', { signal: c.signal });\nc.abort(new Error('скасовано'));\nlet msg = '';\ntry { await p; } catch (e) { msg = e.message; }\nexpect(msg).toBe('скасовано');\nlet msg2 = '';\ntry { await waitForEvent(t, 'ready', { signal: AbortSignal.abort(new Error('вже')) }); } catch (e) { msg2 = e.message; }\nexpect(msg2).toBe('вже');" },
        { name: 'слухачі й таймер знімаються після події', code: "useFakeTimers();\nclass Spy extends EventTarget {\n  constructor() { super(); this.n = 0; }\n  addEventListener(...a) { this.n++; super.addEventListener(...a); }\n  removeEventListener(...a) { this.n--; super.removeEventListener(...a); }\n}\nconst t = new Spy();\nconst p = waitForEvent(t, 'x', { timeout: 500 });\nexpect(t.n).toBe(1);\nt.dispatchEvent(new Event('x'));\nawait p;\nexpect(t.n).toBe(0);\nexpect(getTimerCount()).toBe(0);" }
      ],
      explanation: '`Promise.withResolvers()` зручний, коли resolve/reject викликаються з різних місць (слухачі, таймер, abort) або зберігаються на потім (черги, «ворота», deferred у тестах). Альтернатива для однієї події без таймауту — `target.addEventListener(type, fn, { once: true, signal })`. Таймаут можна віддати браузеру: `AbortSignal.any([signal, AbortSignal.timeout(ms)])` — тоді причина буде `DOMException` з `name = \'TimeoutError\'`.',
      followUps: ['Чим Promise.withResolvers кращий за new Promise тут?', 'Як зробити те саме через AbortSignal.any і AbortSignal.timeout?']
    },
    {
      id: 'async-new-apis-theory',
      group: 'utilities',
      type: 'theory',
      level: 3,
      title: 'Нові асинхронні API: withResolvers, Promise.try, Array.fromAsync, AbortSignal',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        '`Promise.withResolvers()` повертає `{ promise, resolve, reject }` — керування промісом ззовні без вкладеного колбека',
        '`Promise.try(fn)` викликає fn синхронно і перетворює і повернене значення, і синхронний throw на проміс',
        '`await Array.fromAsync(asyncIterable)` збирає всі значення асинхронного ітератора в масив',
        '`Promise.try(fn)` відкладає виклик fn до наступної мікрозадачі',
        '`AbortSignal.timeout(ms)` і `AbortSignal.any([a, b])` дозволяють скасовувати fetch за таймаутом або будь-яким із кількох сигналів'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: ES2024.',
        'Так: ES2025; перевірено — виклик синхронний («ab»), а throw ловиться як відхилення.',
        'Так: ES2024; для пагінованих API, потоків.',
        'Ні: fn виконується одразу (перевірено в Node 24).',
        'Так: `fetch(url, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]) })`.'
      ],
      hint: 'Яка з функцій синхронна, а яка збирає асинхронну послідовність?',
      answer: `
\`\`\`js
// deferred
const { promise, resolve } = Promise.withResolvers();
socket.addEventListener('open', resolve, { once: true });
await promise;

// єдина обробка помилок для функції, що може бути і sync, і async
Promise.try(() => JSON.parse(raw)).then(use).catch(report);

// усі сторінки API
const all = await Array.fromAsync(paginate('/api/items'));

// таймаут + ручне скасування
const res = await fetch(url, { signal: AbortSignal.any([ctrl.signal, AbortSignal.timeout(5000)]) });
\`\`\`
Також варто знати: \`await using\` + \`Symbol.asyncDispose\` (асинхронне звільнення ресурсів), \`structuredClone\` (глибока копія), \`scheduler.yield()\` (поступитися головним потоком — модуль «Продуктивність»).
`,
      keyPoints: ['Promise.withResolvers', 'Promise.try синхронний', 'Array.fromAsync', 'AbortSignal.timeout / any', 'await using']
    },
    {
      id: 'async-quiz-try-without-await',
      group: 'async-errors',
      type: 'quiz',
      level: 2,
      title: 'try/catch без await не ловить відхилення',
      tags: [
        'async-await',
        'errors'
      ],
      question: `
**Як це працює:** async-функція не кидає виняток назовні — її \`throw\` відхиляє **повернутий проміс**. Зловити це \`try/catch\` може лише через \`await\`.

Що буде виведено **через \`console.log\`**?

\`\`\`js
async function save() {
  throw new Error('fail');
}

function onClick() {
  try {
    save();
    console.log('saved?');
  } catch (e) {
    console.log('caught', e.message);
  }
}

onClick();
console.log('end');
\`\`\`
`,
      options: [
        '`caught fail`, `end`',
        '`saved?`, `caught fail`, `end`',
        '`saved?`, `end`',
        '`saved?`, `end`, `caught fail`'
      ],
      answer: 2,
      why: [
        'Ні: `save()` не кидає синхронно — вона повертає відхилений проміс, тож `saved?` друкується.',
        'Ні: виняток не вилітає з `save()` — `catch` у `onClick` не спрацьовує.',
        'Так: `save()` повертає відхилений проміс, `try` завершується без винятку, а відхилення стає unhandled rejection.',
        'Ні: `catch` не «чекає» на проміс — коли той відхилився, `try/catch` уже завершився.'
      ],
      hint: 'Що повертає виклик async-функції — значення, виняток чи щось третє?',
      explanation: `
\`save()\` повертає **відхилений проміс**; синхронного винятку немає, тож \`catch\` мовчить, а браузер покаже «Uncaught (in promise) Error: fail». Виправлення: \`async function onClick() { try { await save(); } catch … }\` або \`save().catch(...)\`.
`
    },
    {
      id: 'async-unhandled-rejection-theory',
      group: 'async-errors',
      type: 'theory',
      level: 3,
      title: 'Необроблені відхилення промісів',
      tags: [
        'promises',
        'errors'
      ],
      question: 'Що таке unhandled promise rejection? Коли він виникає, як його відловити глобально і чому помилка всередині setTimeout не ловиться зовнішнім try/catch?',
      choices: [
        'Виклик async-функції без `await` і без `.catch` дає unhandled rejection, якщо вона відхилиться',
        'Помилка в async-функції завжди потрапляє в найближчий зовнішній `try/catch` викликача, навіть без `await`',
        'Глобальний `unhandledrejection` — повноцінна заміна локальних `catch`, тож у викликах їх можна не писати',
        'Unhandled rejection виникає лише в `new Promise` без `reject`; виклик async-функції без `await` — ні'
      ],
      answer: `
- **Unhandled rejection** — проміс відхилено, а обробника помилки немає. Браузер генерує \`unhandledrejection\` і пише в консоль; Node.js (v15+) **завершує процес**.
\`\`\`js
async function save() { throw new Error('fail'); }
save();               // ✘ unhandled
save().catch(report); // ✔
\`\`\`
- **Причини:** fire-and-forget виклик; \`forEach(async …)\`; проміс створено заздалегідь, а \`await\` — пізніше; забутий \`return\` у \`then\`.
- **Глобальний відлов** (моніторинг, не заміна локальної обробки):
\`\`\`js
window.addEventListener('unhandledrejection', (event) => {
  report(event.reason);
  event.preventDefault();
});
// Node.js: process.on('unhandledRejection', ...)
\`\`\`
- \`try/catch\` ловить відхилення лише через \`await\` всередині блоку.
`,
      correct: 0,
      why: [
        'Так: відхилений проміс, на який ніхто не підписав обробник, — це і є unhandled rejection.',
        'Ні: без `await` викликач отримує проміс, а не виняток — `try` завершується раніше, ніж проміс відхилиться.',
        'Ні: глобальний обробник — лише сітка для моніторингу; UI і стан має обробити локальний `catch`.',
        'Ні: будь-який відхилений проміс без обробника, зокрема результат async-функції, — unhandled.'
      ],
      keyPoints: [
        'Відхилений проміс без обробника → unhandledrejection (у Node — падіння процесу)',
        'Причини: fire-and-forget, forEach(async), забутий return/await',
        'Глобальні обробники — для моніторингу, не заміна локальних catch',
        'try/catch ловить відхилення лише через await всередині блоку'
      ],
      followUps: [
        'Як Sentry відловлює помилки?',
        'Чи буде unhandled rejection, якщо catch додати через setTimeout?',
        'Чим відрізняється window.onerror від addEventListener("error")?'
      ]
    },
    {
      id: 'err-quiz-return-without-await',
      group: 'async-errors',
      type: 'quiz',
      level: 3,
      title: 'return promise vs return await у try/catch',
      tags: [
        'async',
        'try-catch'
      ],
      question: `
Чим завершаться \`a()\` і \`b()\`?

\`\`\`js
async function fails() {
  throw new Error('boom');
}

async function a() {
  try {
    return fails();
  } catch {
    return 'caught';
  }
}

async function b() {
  try {
    return await fails();
  } catch {
    return 'caught';
  }
}

a().then((v) => console.log('a:', v), (e) => console.log('a err:', e.message));
b().then((v) => console.log('b:', v), (e) => console.log('b err:', e.message));
\`\`\`
`,
      options: [
        '`a: caught` і `b: caught`',
        '`a err: boom` і `b: caught`',
        '`a: caught` і `b err: boom`',
        '`a err: boom` і `b err: boom`'
      ],
      answer: 1,
      why: [
        'Ні: у `a` немає `await`, тож відхилення відбувається вже після виходу з `try` — `catch` у `a` не спрацює.',
        'Так: `a` повертає відхилений проміс повз `catch`, а `await` у `b` перетворює відхилення на виняток усередині `try`.',
        'Ні: навпаки — саме `b` ловить помилку, бо `await` розгортає проміс у `try`.',
        'Ні: `b` ловить помилку завдяки `return await`.'
      ],
      hint: 'Коли саме відхиляється проміс `fails()` — поки функція `a` ще всередині `try`, чи вже після виходу з неї?',
      explanation: `
\`return fails()\` у \`a\` одразу виходить з \`try\` з промісом — відхилення «пролітає» повз \`catch\`. \`return await\` у \`b\` розгортає проміс **усередині** \`try\`. Правило: у \`try/catch\` пишіть \`return await\`.
`
    },
    {
      id: 'err-to-helper',
      group: 'async-errors',
      type: 'code',
      level: 2,
      title: 'to(promise) → [err, data]',
      tags: [
        'async',
        'promises'
      ],
      description: `
**Завдання.** Напишіть \`to(promise)\` — хелпер, що перетворює відхилення на значення: \`[err, data]\` замість \`try/catch\`.

**Де трапляється:** кілька послідовних запитів без «драбини» \`try/catch\` (бібліотека \`await-to-js\`); часто питають на співбесідах.

**Що написати**
- \`to(promiseOrValue)\` → \`Promise\`, що **ніколи не відхиляється**:
  - успіх → \`[null, data]\`;
  - відхилення → \`[error, undefined]\`;
  - відхилення falsy-значенням (\`undefined\`, \`null\`, \`0\`, \`''\`, \`false\`) → \`error\` = \`Error('Promise rejected with <String(reason)>')\` з \`cause\` = причина;
  - приймає й звичайні значення.

**Приклад**
\`\`\`js
const [err, user] = await to(fetchUser(id));
if (err) return showError(err);
render(user);
\`\`\`

**Як це працює:** \`await\` відхиленого промісу **кидає** виняток у точці \`await\`, тож \`try { await promise } catch\` у async-функції перетворює відхилення на звичайну гілку коду. Falsy-причину загортаємо в \`Error\`, щоб \`if (err)\` не пропустив відхилення.

**Врахуйте:** falsy **дані** (\`0\`, \`null\`) — це успіх, а не помилка.
`,
      starter: `async function to(promise) {
  // 1. try { const data = await promise; return [null, data]; }
  // 2. catch (reason) {
  //      error = reason, або new Error('Promise rejected with ' + String(reason), { cause: reason }) для falsy
  //      return [error, undefined];
  //    }
  // TODO
}

// Спробуйте в консолі:
// to(Promise.reject(new Error('x'))).then(console.log); // [Error: x, undefined]
`,
      solution: `async function to(promise) {
  try {
    const data = await promise;
    return [null, data];
  } catch (reason) {
    // гарантуємо truthy-помилку, щоб "if (err)" не пропустив відхилення
    const error = reason
      ? reason
      : new Error('Promise rejected with ' + String(reason), { cause: reason });
    return [error, undefined];
  }
}
`,
      hints: [
        '`await` усередині `try` у async-функції: відхилення потрапить у `catch`.',
        'Для `Promise.reject()` без аргументу `reason === undefined` — загорніть: `reason || new Error(..., { cause: reason })`.'
      ],
      tests: [
        { name: 'успіх → [null, data]', code: 'await expect(to(Promise.resolve({ id: 1 }))).resolves.toEqual([null, { id: 1 }]);' },
        {
          name: 'помилка → [err, undefined]',
          code: 'const e = new Error("fail");\nconst res = await to(Promise.reject(e));\nexpect(res[0]).toBe(e);\nexpect(res[1]).toBeUndefined();\nexpect(res).toHaveLength(2);'
        },
        { name: 'ніколи не відхиляється', code: 'await expect(to(Promise.reject(new Error("x")))).resolves.toBeDefined();' },
        {
          name: 'falsy-причина обгортається в Error',
          code: 'const [err] = await to(Promise.reject());\nexpect(err).toBeInstanceOf(Error);\nexpect(err.message).toBe("Promise rejected with undefined");\nconst [err2] = await to(Promise.reject(0));\nexpect(err2.message).toBe("Promise rejected with 0");\nexpect(err2.cause).toBe(0);'
        },
        { name: 'звичайне значення', code: 'await expect(to(5)).resolves.toEqual([null, 5]);' },
        {
          name: 'falsy дані не плутаються з помилкою',
          code: 'await expect(to(Promise.resolve(0))).resolves.toEqual([null, 0]);\nawait expect(to(Promise.resolve(null))).resolves.toEqual([null, null]);'
        }
      ],
      explanation: `
Патерн «помилка як значення»: послідовні запити обробляються лінійно (\`if (e1) return …\`). Нормалізація falsy-причин не дає піти далі з \`undefined\`-даними.

**Trade-off:** легко забути перевірити \`err\` (а з \`try/catch\` помилка полетіла б далі).

**Типові помилки:** \`return [null, promise]\` без \`await\`; не обробити falsy-причину.
`
    },
    {
      id: 'async-for-await-order', group: 'async-iteration', type: 'quiz', level: 2,
      title: 'Порядок виконання з for await',
      question: `
Що виведе код?

\`\`\`js
async function* gen() {
  yield 1;
  yield 2;
}

(async () => {
  for await (const x of gen()) console.log('got', x);
  console.log('done');
})();

console.log('sync');
\`\`\`
`,
      options: [
        '`got 1`, `got 2`, `done`, `sync`',
        '`got 1`, `sync`, `got 2`, `done`',
        '`sync`, `got 1`, `got 2`, `done`',
        '`sync`, `done`, `got 1`, `got 2`'
      ],
      answer: 2,
      why: [
        'Ні: `for await` чекає на проміс навіть від першого `next()`, тому синхронний код іде раніше.',
        'Ні: першого значення доводиться чекати так само — `next()` async-генератора завжди повертає проміс.',
        'Так: асинхронна функція «засинає» на першому await усередині `for await`, і виконується `sync`.',
        'Ні: `done` виводиться лише після завершення циклу.'
      ],
      hint: '`next()` у async-генератора завжди повертає Promise. Що робить `for await` з промісом?',
      explanation: '`for await...of` викликає `next()` і **чекає** на результат-проміс на кожному кроці, навіть якщо генератор віддає значення одразу. Тому все тіло циклу виконується в мікрозадачах, після поточного синхронного коду. Цикл працює з async-ітерабельними (`Symbol.asyncIterator`) і зі звичайними ітерабельними промісів.'
    },
    {
      id: 'async-paginate-generator', group: 'async-iteration', type: 'code', level: 3,
      title: 'Пагінація API через async-генератор',
      description: `
**Завдання.** Напишіть async-генератор \`paginate(fetchPage)\`. Він по черзі віддає **окремі елементи** з усіх сторінок API:
- \`fetchPage(cursor)\` повертає \`Promise<{ items, nextCursor }>\`; першу сторінку запитують з \`cursor = null\`;
- коли \`nextCursor\` дорівнює \`null\`, сторінки закінчились;
- генератор **лінивий**: наступну сторінку запитує лише тоді, коли споживач дочитав попередню.

**Де трапляється:** експорт усіх замовлень, синхронізація даних, «завантажити все» з API з cursor-пагінацією. Споживач пише простий цикл і може зупинитися будь-коли, не завантажуючи зайвого.

**Приклад**
\`\`\`js
for await (const order of paginate((cursor) => api.orders({ cursor }))) {
  if (order.id === targetId) break; // решта сторінок не запитується
}
\`\`\`

**Як це працює:** \`async function*\` віддає значення через \`yield\`, а \`for await…of\` чекає на кожне. Генератор лінивий: наступну сторінку він завантажує лише тоді, коли споживач просить наступний елемент, а \`break\` зупиняє його без зайвих запитів.
`,
      starter: `async function* paginate(fetchPage) {
  let cursor = null;
  // TODO: у циклі: отримати сторінку, віддати кожен елемент через yield,
  // перейти до nextCursor; зупинитися, коли nextCursor === null
}
`,
      solution: `async function* paginate(fetchPage) {
  let cursor = null;
  while (true) {
    const { items, nextCursor } = await fetchPage(cursor);
    for (const item of items) {
      yield item;
    }
    if (nextCursor === null || nextCursor === undefined) return;
    cursor = nextCursor;
  }
}
`,
      hints: ['`while (true) { const { items, nextCursor } = await fetchPage(cursor); ... }`', '`yield` кожного елемента — у вкладеному `for...of`; вихід з генератора — `return`.'],
      tests: [
        { name: 'усі елементи з усіх сторінок', code: "const pages = { null: { items: [1, 2], nextCursor: 'p2' }, p2: { items: [3], nextCursor: 'p3' }, p3: { items: [4, 5], nextCursor: null } };\nconst fetchPage = mockFn(async (c) => pages[c]);\nconst out = [];\nfor await (const x of paginate(fetchPage)) out.push(x);\nexpect(out).toEqual([1, 2, 3, 4, 5]);\nexpect(fetchPage.mock.calls).toEqual([[null], ['p2'], ['p3']]);" },
        { name: 'break не запитує зайвих сторінок', code: "const fetchPage = mockFn(async (c) => ({ items: c === null ? [1, 2] : [3, 4], nextCursor: c === null ? 'next' : null }));\nconst out = [];\nfor await (const x of paginate(fetchPage)) { out.push(x); if (x === 2) break; }\nexpect(out).toEqual([1, 2]);\nexpect(fetchPage).toHaveBeenCalledTimes(1);" },
        { name: 'нічого не запитує до початку ітерації', code: "const fetchPage = mockFn(async () => ({ items: [], nextCursor: null }));\nconst it = paginate(fetchPage);\nawait flushPromises();\nexpect(fetchPage).not.toHaveBeenCalled();\nawait it.next();\nexpect(fetchPage).toHaveBeenCalledTimes(1);" },
        { name: 'порожня сторінка з курсором — ідемо далі', code: "const fetchPage = mockFn(async (c) => c === null ? { items: [], nextCursor: 'x' } : { items: [7], nextCursor: null });\nconst out = [];\nfor await (const x of paginate(fetchPage)) out.push(x);\nexpect(out).toEqual([7]);" }
      ],
      explanation: 'Async-генератор поєднує **ліниву ітерацію** і `await`: споживач керує темпом, а `break` викликає `return()` генератора — подальші запити не робляться. Альтернатива без генератора — callback `onPage` або накопичення масиву, але тоді або все вантажиться в пам\'ять, або логіка розмазується. Той самий прийом читає потоки: `for await (const chunk of stream)` у Node.js і в браузерах, де `ReadableStream` підтримує асинхронну ітерацію.'
    }
  ]
});
