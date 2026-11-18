(function () {
FE.topic('node-overview', {
  intro: `
**Node.js для фронтендера** — без написання серверів: як влаштований рантайм, у якому працюють ваші інструменти (Vite, ESLint, Vitest, TypeScript), SSR-фреймворки (Next.js, Nuxt) і BFF-шари. На співбесіді Strong Middle очікують розуміти, чим event loop Node відрізняється від браузерного, що блокує сервер і як Node знаходить модулі.

| Браузер | Node.js |
|---|---|
| V8 + Web APIs (DOM, fetch, таймери) | V8 + **libuv** + вбудовані модулі (\`fs\`, \`http\`, \`stream\`, \`crypto\`) |
| event loop браузера (задачі, мікрозадачі, рендер) | фази libuv + \`process.nextTick\` + \`setImmediate\` |
| \`window\`, \`document\` | \`globalThis\`, \`process\`, \`Buffer\`; Web API: \`fetch\`, \`AbortController\`, \`URL\`, \`structuredClone\` |
| пісочниця | доступ до файлової системи, мережі, процесів |
`,
  groups: [
    { id: 'runtime', title: 'Як влаштований Node.js: V8, libuv, пул потоків' },
    { id: 'event-loop', title: 'Event loop у Node: фази, nextTick, setImmediate' },
    { id: 'modules', title: 'Модулі й запуск коду в Node' },
    { id: 'frontend', title: 'Потоки, процеси і де фронтенд зустрічає Node' }
  ],
  items: [
    // ---------------------------------------------------------------- runtime
    {
      id: 'node-architecture', group: 'runtime', type: 'theory', level: 2, interview: true,
      title: 'Архітектура Node.js',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'JavaScript у Node виконується в одному потоці, а асинхронний ввід-вивід забезпечує бібліотека libuv',
        'Мережеві сокети libuv обслуговує через механізми ОС (epoll, kqueue, IOCP), а файлові операції — через пул потоків',
        'Пул потоків libuv за замовчуванням має 4 потоки (змінна UV_THREADPOOL_SIZE)',
        'Кожен HTTP-запит у Node обробляється в окремому потоці JavaScript',
        'Node надає частину Web API: глобальні fetch, AbortController, URL, WebSocket'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: один стек викликів, як у браузері.',
        'Так: ОС не має універсального асинхронного API для файлів, тому libuv виконує їх у потоках пулу.',
        'Так: за документацією libuv; максимум — 1024.',
        'Ні: усі обробники виконуються в одному потоці; паралельно йде лише ввід-вивід.',
        'Так: fetch — з Node 18 (стабільний з 21), WebSocket-клієнт — у сучасних версіях (перевірено на Node 24).'
      ],
      hint: 'Що саме виконується паралельно: JavaScript чи ввід-вивід?',
      answer: `
\`\`\`text
ваш JS  →  V8 (стек, купа, JIT)
            │ виклики fs / net / crypto
            ▼
         C++ bindings  →  libuv
                           ├─ event loop (фази)
                           ├─ ОС: epoll / kqueue / IOCP — сокети, таймери
                           └─ пул потоків (4): fs, dns.lookup, crypto (pbkdf2, scrypt), zlib
\`\`\`
- **неблокувальний ввід-вивід:** поки ОС чи пул виконує операцію, JS-потік обробляє інші події; результат повертається колбеком у чергу event loop;
- тому Node добре тримає тисячі одночасних з'єднань (I/O-bound), але погано — важкі обчислення в головному потоці (CPU-bound);
- **V8 той самий**, що в Chrome: JIT, приховані класи, збирання сміття (модуль «Рушій V8»).
`,
      keyPoints: ['Один потік JS', 'libuv: ОС і пул потоків', 'Пул — 4 потоки', 'I/O-bound — сильна сторона', 'Частина Web API в Node']
    },
    {
      id: 'node-quiz-threadpool', group: 'runtime', type: 'quiz', level: 3,
      title: 'Що виконується в пулі потоків',
      question: 'Яка з операцій Node.js виконується в пулі потоків libuv?',
      options: [
        '`fs.readFile` великого файлу',
        'Очікування відповіді на HTTP-запит через сокет',
        '`setTimeout(fn, 1000)`',
        'Виконання функції `JSON.parse`'
      ],
      answer: 0,
      why: [
        'Так: файлові операції, а також `crypto.pbkdf2`, `zlib`, `dns.lookup` — у пулі.',
        'Ні: сокети обслуговує ОС (epoll/kqueue/IOCP) без потоків пулу.',
        'Ні: таймери — у фазі timers event loop.',
        'Ні: це синхронний JS у головному потоці.'
      ],
      hint: 'Для чого в ОС немає зручного асинхронного API?',
      explanation: 'Наслідок: багато одночасних `fs`/`crypto`-операцій стоять у черзі до 4 потоків — збільшення `UV_THREADPOOL_SIZE` іноді прискорює, наприклад, хешування паролів. Мережа від розміру пулу не залежить.'
    },
    {
      id: 'node-quiz-cpu-block', group: 'runtime', type: 'quiz', level: 3,
      title: 'Важке обчислення в обробнику запиту',
      question: 'SSR-сервер в одному з обробників синхронно 2 секунди генерує великий звіт. Що відбувається з іншими запитами в цей час?',
      options: [
        'Чекають: event loop заблоковано, обробники не виконуються',
        'Обробляються паралельно в інших потоках JS',
        'Node автоматично переносить важкий код у пул потоків',
        'Чекають лише запити до того самого URL'
      ],
      answer: 0,
      why: [
        'Так: один JS-потік зайнятий — нічого іншого не виконується (як довга задача в браузері).',
        'Ні: JS-потік один.',
        'Ні: пул обслуговує лише вбудовані I/O та crypto-операції.',
        'Ні: блокується весь процес.'
      ],
      hint: 'Згадайте довгі задачі й INP у браузері.',
      explanation: 'Рішення: `worker_threads` (окремий потік з власним V8-ізолятом, обмін повідомленнями), винесення в окремий сервіс/чергу задач, розбиття роботи на частини (`setImmediate` між шматками), кешування результату. `cluster`/кілька процесів дають паралелізм між запитами, але не прискорюють один важкий запит.'
    },
    // ---------------------------------------------------------------- event-loop
    {
      id: 'node-event-loop-theory', group: 'event-loop', type: 'theory', level: 3, interview: true,
      title: 'Фази event loop у Node',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Фази циклу: timers → pending callbacks → poll (очікування I/O) → check (`setImmediate`) → close callbacks',
        'Черга `process.nextTick` обробляється раніше за мікрозадачі промісів',
        'Мікрозадачі виконуються після кожного колбека таймера, а не лише в кінці фази',
        'У колбеку файлової операції `setTimeout(fn, 0)` гарантовано спрацює раніше за `setImmediate`',
        'Рекурсивний `process.nextTick` може «заморити голодом» ввід-вивід'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: плюс службові idle/prepare.',
        'Так: перевірено на Node 24 — `nextTick` перед `promise`.',
        'Так: з Node 11 — перевірено: `t1 n1 p1 t2`.',
        'Ні: навпаки — після poll іде check, тому `setImmediate` першим (перевірено).',
        'Так: черга nextTick спорожнюється повністю, перш ніж цикл піде далі.'
      ],
      hint: 'Яка фаза йде одразу після очікування I/O?',
      answer: `
\`\`\`text
   ┌─► timers          — колбеки setTimeout / setInterval, чий час настав
   │   pending         — відкладені системні колбеки
   │   poll            — отримати події I/O, виконати їхні колбеки (тут цикл чекає)
   │   check           — колбеки setImmediate
   └── close           — 'close' (сокети тощо)
   після КОЖНОГО колбека: черга process.nextTick → мікрозадачі (проміси, queueMicrotask)
\`\`\`
**Відмінності від браузера:**
- немає фази рендеру й \`requestAnimationFrame\`;
- є \`process.nextTick\` (власна черга з найвищим пріоритетом) і \`setImmediate\` (після I/O);
- у головному модулі порядок \`setTimeout(…, 0)\` і \`setImmediate\` документація **не гарантує** — залежить від того, скільки часу минуло до входу в цикл.

**Практика:** \`setImmediate\` — «після поточного I/O», щоб розбити довгу роботу; \`queueMicrotask\`/проміси — «одразу після поточного коду»; \`nextTick\` — рідко, переважно в бібліотеках (емітувати подію після повернення з функції).
`,
      keyPoints: ['timers → poll → check → close', 'nextTick раніше за проміси', 'Мікрозадачі після кожного колбека', 'setImmediate першим після I/O', 'nextTick може заблокувати I/O']
    },
    {
      id: 'node-quiz-order-main', group: 'event-loop', type: 'quiz', level: 3,
      title: 'Порядок у головному модулі',
      question: `
Що гарантовано про порядок виводу (Node 24, головний модуль)?

\`\`\`js
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));
console.log('sync');
\`\`\`
`,
      options: [
        '`sync`, `nextTick`, `promise`, далі timeout та immediate у негарантованому порядку',
        '`sync`, `promise`, `nextTick`, `timeout`, `immediate`',
        '`nextTick`, `sync`, `promise`, `immediate`, `timeout`',
        '`sync`, `timeout`, `immediate`, `nextTick`, `promise`'
      ],
      answer: 0,
      why: [
        'Так: перші три — детерміновано (перевірено); відносний порядок timeout/immediate у головному модулі документація Node не гарантує.',
        'Ні: черга nextTick обробляється раніше за проміси.',
        'Ні: синхронний код завжди першим.',
        'Ні: мікрозадачі й nextTick — до будь-якої фази циклу.'
      ],
      hint: 'Спершу синхронний код, потім дві черги мікро-рівня, потім фази циклу.',
      explanation: 'У моїх запусках на Node 24 `immediate` виходив раніше за `timeout`, але покладатися на це не можна: таймер на 0 мс фактично має 1 мс, і чи встиг він «настати» до фази timers, залежить від швидкості старту процесу. Детермінований порядок — лише всередині I/O-колбека (наступне питання).'
    },
    {
      id: 'node-quiz-order-io', group: 'event-loop', type: 'quiz', level: 3,
      title: 'Порядок усередині колбека I/O',
      question: `
Що виведе код?

\`\`\`js
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
  process.nextTick(() => console.log('nextTick'));
});
\`\`\`
`,
      options: [
        '`nextTick`, `immediate`, `timeout` — завжди',
        '`nextTick`, `timeout`, `immediate` — завжди',
        '`timeout`, `immediate`, `nextTick`',
        'Порядок випадковий, як у головному модулі'
      ],
      answer: 0,
      why: [
        'Так: колбек виконується у фазі poll, далі check (immediate), timers — лише в наступному оберті. Перевірено 3/3 запуски.',
        'Ні: до timers цикл дійде лише після check.',
        'Ні: nextTick виконується одразу після поточного колбека.',
        'Ні: тут порядок детермінований.'
      ],
      hint: 'У якій фазі виконується колбек readFile і яка фаза наступна?',
      explanation: 'Звідси правило: щоб виконати щось «одразу після обробки I/O», використовуйте `setImmediate`, а не `setTimeout(…, 0)`.'
    },
    // ---------------------------------------------------------------- modules
    {
      id: 'node-modules-theory', group: 'modules', type: 'theory', level: 3,
      title: 'Модулі й запуск коду в сучасному Node',
      question: 'Оберіть **усі** правильні твердження (Node 24).',
      choices: [
        '`require(\'lodash\')` шукає `node_modules/lodash` у поточному каталозі, потім у батьківських — аж до кореня диска',
        'Префікс `node:` (`import fs from \'node:fs\'`) явно вказує на вбудований модуль і не може бути підмінений пакетом',
        '`require()` ES-модуля (без top-level await) у Node 24 працює без прапорців',
        'Node 24 запускає `.ts`-файли, прибираючи типи, і перевіряє їх як tsc',
        'В ESM замість `__dirname` використовують `import.meta.dirname` (або `import.meta.url`)'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: алгоритм резолюції Node; поле `exports`/`main` у package.json визначає вхідний файл.',
        'Так: захист від пакетів з іменами вбудованих модулів.',
        'Так: перевірено — `require(\'./lib.mjs\')` повернув експорт (за замовчуванням з Node 22.12 / 20.19).',
        'Ні: лише type stripping без перевірки типів (перевірено: працює, але `enum` дає помилку — потрібен прапорець transform-types); перевіряє tsc / IDE.',
        'Так: `__dirname` і `require` в ESM не визначені.'
      ],
      hint: 'Що Node робить з типами TypeScript: перевіряє чи лише прибирає?',
      answer: `
**Резолюція \`require('pkg')\` / \`import 'pkg'\`:**
1. вбудований модуль (\`fs\`, \`node:fs\`) — одразу;
2. відносний шлях (\`./x\`) — файл (у CJS з підбором розширень, в ESM розширення обов'язкове);
3. ім'я пакета — \`node_modules/pkg\` у поточному каталозі, далі вгору; у пакеті — \`exports\` (умовні: \`import\`/\`require\`/\`types\`) або \`main\`.

**Сучасні можливості Node (корисні для інструментів і скриптів):**
| Можливість | Для чого |
|---|---|
| \`node --watch app.js\` | перезапуск при зміні файлів (замість nodemon) |
| \`node --env-file=.env\` | змінні середовища без dotenv |
| \`node:test\` + \`node --test\` | вбудований тест-раннер |
| type stripping | запуск \`.ts\` без збірки (лише прибирання типів) |
| \`require(esm)\` | менше болю з dual-пакетами |

CommonJS vs ESM, \`"type": "module"\`, live bindings і публікація dual-пакетів — модуль «Інструменти».
`,
      keyPoints: ['Пошук node_modules вгору', 'Префікс node:', 'require(esm)', 'Type stripping без перевірки', 'import.meta.dirname']
    },
    {
      id: 'node-quiz-resolution', group: 'modules', type: 'quiz', level: 2,
      title: 'Звідки береться пакет у монорепо',
      question: 'Файл `apps/web/src/main.js` викликає `require(\'zod\')`. Пакет `zod` встановлено лише в кореневому `node_modules` монорепо. Що станеться?',
      options: [
        'Знайдеться: Node підніметься до кореневого node_modules',
        'Помилка: Node шукає лише в `apps/web/node_modules`',
        'Помилка: потрібно вказати повний шлях до пакета',
        'Node встановить пакет автоматично'
      ],
      answer: 0,
      why: [
        'Так: пошук іде вгору каталогами — на цьому побудоване «підняття» залежностей (hoisting) у workspaces.',
        'Ні: це лише перший крок пошуку.',
        'Ні: імена пакетів резолвляться без шляху.',
        'Ні: Node нічого не встановлює.'
      ],
      hint: 'Куди йде пошук, якщо в поточному каталозі пакета немає?',
      explanation: 'Звідси «фантомні залежності»: код випадково працює з пакетом, якого немає в його `package.json`, бо той піднятий у корінь. pnpm цьому запобігає: суворий `node_modules` із симлінками лише на оголошені залежності (модуль «Інструменти»).'
    },
    // ---------------------------------------------------------------- frontend
    {
      id: 'node-streams-processes', group: 'frontend', type: 'theory', level: 3,
      title: 'Потоки, Buffer і паралелізм у Node',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Потоки (streams) обробляють дані частинами — великий файл не потрібно повністю завантажувати в пам\'ять',
        'Backpressure: якщо споживач повільніший за джерело, `pipeline()` призупиняє читання, щоб не переповнити буфер',
        '`worker_threads` — окремі потоки з власним V8-ізолятом для CPU-важкої роботи; дані передаються повідомленнями',
        '`Buffer` — масив рядків для текстових даних',
        'Стрімінговий SSR React (`renderToPipeableStream`) пише HTML у потік відповіді частинами'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: Readable, Writable, Duplex, Transform.',
        'Так: `pipeline` ще й коректно обробляє помилки і закриває потоки.',
        'Так: можна передавати й SharedArrayBuffer.',
        'Ні: Buffer — двійкові дані (підклас Uint8Array).',
        'Так: аналог для Web Streams — `renderToReadableStream`.'
      ],
      hint: 'Що станеться з пам\'яттю, якщо прочитати 2 ГБ лог-файлу через readFile?',
      answer: `
\`\`\`js
import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';
await pipeline(createReadStream('access.log'), createGzip(), createWriteStream('access.log.gz'));
\`\`\`
| Інструмент | Для чого |
|---|---|
| streams | великі файли, HTTP-відповіді, стрімінговий SSR, обробка логів |
| \`worker_threads\` | CPU-важкі задачі (зображення, парсинг), не блокуючи event loop |
| \`child_process\` | запуск інших програм (git, компілятори) — так працюють інструменти збірки |
| \`cluster\` / кілька процесів | використати всі ядра для обробки запитів (часто це робить оркестратор або PM2) |

Web Streams (\`ReadableStream\`) теж доступні в Node — той самий API, що в браузері (модуль «Browser API»).
`,
      keyPoints: ['Streams — частинами', 'Backpressure і pipeline', 'worker_threads для CPU', 'Buffer — двійкові дані', 'Стрімінговий SSR']
    },
    {
      id: 'node-for-frontend', group: 'frontend', type: 'theory', level: 2,
      title: 'Де фронтенд-розробник зустрічає Node',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Vite, ESLint, Prettier, Vitest, tsc, Storybook — програми на Node, які запускаються через npm-скрипти',
        'SSR-фреймворки (Next.js, Nuxt) рендерять сторінки в Node-процесі або в edge-середовищі з Web API',
        'BFF (Backend for Frontend) — тонкий серверний шар, що агрегує API під потреби конкретного UI',
        'Код, що працює в браузері, завжди працює і в Node, бо обидва використовують V8',
        'Версію Node для проєкту фіксують у `.nvmrc` або полі `engines`, щоб уся команда й CI використовували однакову'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: тому помилки на кшталт «heap out of memory» при збірці — це ліміти пам\'яті Node.',
        'Так: edge-рантайми (Cloudflare Workers, Vercel Edge) мають Web API, але не всі модулі Node.',
        'Так: часто це Next.js route handlers / Nuxt server routes.',
        'Ні: у Node немає DOM, `window`, `localStorage` — звідси помилки гідратації і `typeof window` у SSR-коді.',
        'Так: парні версії Node стають LTS — для продакшену беруть їх.'
      ],
      hint: 'Що є в браузері, але немає в Node?',
      answer: `
**Типові ситуації:**
- **«window is not defined»** під час SSR — браузерний код виконався на сервері; переносьте в \`onMounted\`/\`useEffect\` або клієнтський компонент;
- **збірка падає з нестачею пам'яті** — \`NODE_OPTIONS=--max-old-space-size=4096\`;
- **різні результати в CI і локально** — різні версії Node/npm, зафіксуйте версію і використовуйте \`npm ci\`;
- **змінні середовища:** \`process.env\` існує лише в Node; у браузерний бандл потрапляють тільки явно дозволені (\`import.meta.env.VITE_*\`, \`NEXT_PUBLIC_*\`) — секрети туди не кладуть.

**Альтернативні рантайми:** Deno (безпека за дозволами, TS з коробки), Bun (швидкий рантайм + пакетний менеджер + бандлер) — обидва сумісні з більшістю npm-пакетів.

**Коли бекенд:** повноцінний серверний Node (HTTP, бази даних, черги, автентифікація) — тема окремого розділу «Бекенд».
`,
      keyPoints: ['Інструменти — програми на Node', 'SSR у Node або edge', 'BFF', 'Немає DOM у Node', 'Фіксована версія, LTS']
    }
  ]
});
})();
