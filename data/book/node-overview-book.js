FE.chapter('node-overview-book', { body: `
Node.js — середовище виконання JavaScript поза браузером. Фронтендер працює з ним щодня, навіть не пишучи серверів: на Node запускаються Vite, ESLint, Vitest, tsc, Storybook, а Next.js і Nuxt рендерять у ньому сторінки. Цей розділ — про те, як Node влаштований, а не про розробку бекенду (це окремий розділ курсу).

## Як влаштований Node.js: V8, libuv, пул потоків

\`\`\`text
ваш JS → V8 (той самий рушій, що в Chrome)
          ↓ fs / net / crypto / zlib
       C++ bindings → libuv
                       ├─ event loop
                       ├─ механізми ОС (epoll / kqueue / IOCP): сокети, таймери
                       └─ пул потоків (4 за замовчуванням): fs, dns.lookup, crypto.pbkdf2/scrypt, zlib
\`\`\`
- **JavaScript — в одному потоці.** Паралельно виконується лише ввід-вивід: ОС або потоки пулу працюють, а коли результат готовий, колбек потрапляє в чергу event loop;
- тому Node добре масштабується на **I/O-bound** задачах (тисячі з'єднань, проксі, SSR, API-шлюзи) і погано — на **CPU-bound** у головному потоці;
- синхронне важке обчислення в обробнику **блокує весь процес**: інші запити чекають, як інтерфейс браузера під час довгої задачі;
- рішення для CPU: \`worker_threads\`, окремий сервіс чи черга задач, розбиття роботи (\`setImmediate\` між шматками), кешування;
- розмір пулу — \`UV_THREADPOOL_SIZE\` (до 1024): впливає на \`fs\`/\`crypto\`, але не на мережу.

**Глобальне оточення:** \`globalThis\`, \`process\` (env, argv, exit, cwd), \`Buffer\`; Web API — \`fetch\`, \`AbortController\`, \`URL\`, \`TextEncoder\`, \`structuredClone\`, \`WebSocket\`, Web Streams. Немає \`window\`, \`document\`, \`localStorage\`.

## Event loop у Node: фази, nextTick, setImmediate

\`\`\`text
┌─► timers    — setTimeout / setInterval, чий час настав
│   pending   — відкладені системні колбеки
│   poll      — події I/O та їхні колбеки (тут цикл чекає, якщо роботи немає)
│   check     — setImmediate
└── close     — події 'close'
після кожного колбека: черга process.nextTick → мікрозадачі (проміси, queueMicrotask)
\`\`\`
**Перевірено на Node 24:**
- \`sync\` → \`nextTick\` → \`promise\` → … — черга \`nextTick\` пріоритетніша за проміси;
- мікрозадачі виконуються після **кожного** колбека таймера: \`t1 n1 p1 t2\` (з Node 11; раніше — в кінці фази);
- у колбеку I/O \`setImmediate\` завжди раніше за \`setTimeout(…, 0)\`: після poll іде check;
- у головному модулі порядок \`setTimeout(…, 0)\` і \`setImmediate\` **не гарантований** (так у документації), хоч на практиці часто першим іде immediate.

**Відмінності від браузера:** немає рендеру й \`requestAnimationFrame\`; є \`process.nextTick\` і \`setImmediate\`. Рекурсивний \`nextTick\` (як і нескінченні мікрозадачі) «морить голодом» ввід-вивід.

**Що коли використовувати:** \`queueMicrotask\`/проміс — одразу після поточного коду; \`setImmediate\` — після обробки поточного I/O (розбити довгу роботу); \`setTimeout\` — затримка; \`nextTick\` — переважно в бібліотеках.

## Модулі й запуск коду в Node

**Резолюція** \`require('pkg')\` / \`import 'pkg'\`:
1. вбудований модуль (\`fs\` або явно \`node:fs\` — префікс не дає пакету підмінити вбудований модуль);
2. відносний шлях — файл (в ESM розширення обов'язкове);
3. ім'я пакета — \`node_modules/pkg\` у поточному каталозі, потім у батьківських до кореня диска; вхідний файл — з \`exports\` (умовні: \`import\`, \`require\`, \`types\`, \`browser\`) або \`main\`.

Пошук угору пояснює і «підняття» залежностей у монорепо, і **фантомні залежності** (код працює з пакетом, не оголошеним у його \`package.json\`), від яких захищає pnpm.

**Сучасний Node (перевірено на 24):**
| Можливість | Що дає |
|---|---|
| \`require(esm)\` | CommonJS може підключити ES-модуль без top-level await (без прапорців з Node 22.12 / 20.19) |
| type stripping | \`node app.ts\` прибирає типи без перевірки; \`enum\` і \`namespace\` потребують \`--experimental-transform-types\` |
| \`import.meta.dirname\` / \`filename\` | заміна \`__dirname\` в ESM |
| \`--watch\` | перезапуск при змінах |
| \`--env-file=.env\` | змінні середовища без dotenv |
| \`node:test\` | вбудований тест-раннер |

CommonJS vs ESM, \`"type": "module"\`, semver, lock-файли — у розділі «Інструменти».

## Потоки, процеси і де фронтенд зустрічає Node

**Streams** — обробка даних частинами: Readable, Writable, Duplex, Transform.
\`\`\`js
import { pipeline } from 'node:stream/promises';
await pipeline(createReadStream('big.log'), createGzip(), createWriteStream('big.log.gz'));
\`\`\`
- **backpressure:** повільний споживач призупиняє читання — пам'ять не переповнюється; \`pipeline\` ще й обробляє помилки;
- **Buffer** — двійкові дані (підклас \`Uint8Array\`);
- стрімінговий SSR: \`renderToPipeableStream\` (Node streams) / \`renderToReadableStream\` (Web Streams) шлють HTML частинами з межами Suspense.

**Паралелізм:** \`worker_threads\` (CPU-задачі, окремий V8-ізолят), \`child_process\` (запуск git, компіляторів — так працюють інструменти), \`cluster\` чи кілька процесів (усі ядра для запитів; часто це робить оркестратор).

**Де фронтенд зустрічає Node:**
- **інструменти** — Vite, ESLint, Vitest, tsc: «heap out of memory» при збірці лікується \`NODE_OPTIONS=--max-old-space-size=…\`;
- **SSR** — Next.js, Nuxt; помилка «window is not defined» означає, що браузерний код виконався на сервері;
- **edge-рантайми** (Cloudflare Workers, Vercel Edge) — Web API без більшості модулів Node;
- **BFF** — тонкий серверний шар під потреби UI (route handlers, server routes);
- **змінні середовища** — \`process.env\` лише на сервері; у бандл потрапляють тільки явно публічні (\`VITE_*\`, \`NEXT_PUBLIC_*\`);
- **версії** — парні стають LTS; фіксуйте версію в \`.nvmrc\`/\`engines\`, у CI — \`npm ci\`;
- **альтернативи** — Deno, Bun (сумісні з більшістю npm-пакетів).

## Типові питання

- **Node однопотоковий?** JS — так; ввід-вивід — через ОС і пул потоків libuv.
- **Чим event loop Node відрізняється від браузерного?** Фази libuv, nextTick, setImmediate, немає рендеру.
- **nextTick vs setImmediate vs setTimeout(0)?**
- **Що заблокує сервер і як цього уникнути?**
- **Як Node знаходить пакет? Що таке фантомна залежність?**
- **Навіщо streams і що таке backpressure?**
`});
