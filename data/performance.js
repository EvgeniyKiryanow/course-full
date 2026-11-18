FE.topic('performance', {
  intro: `
## Core Web Vitals (оцінюються на **75-му перцентилі** реальних користувачів)

| Метрика | Що вимірює | Good | Poor |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | коли відмалювався найбільший елемент у viewport | ≤ 2.5 с | > 4 с |
| **INP** (Interaction to Next Paint) | затримка від взаємодії до наступного кадру (найгірші взаємодії за візит) | ≤ 200 мс | > 500 мс |
| **CLS** (Cumulative Layout Shift) | неочікувані зсуви макета | ≤ 0.1 | > 0.25 |

- **INP замінив FID у березні 2024.** FID міряв лише *затримку старту обробки першої* взаємодії; INP — повну затримку до кадру для **всіх** взаємодій.
- Допоміжні: **TTFB** (≤ 0.8 с), **FCP** (≤ 1.8 с), TBT (лабораторний проксі для INP).
- **Lab** (Lighthouse, DevTools) — контрольовані умови, для дебагу. **Field** (CrUX, RUM, \`web-vitals\`) — реальні користувачі, саме вони впливають на пошук.

## LCP

\`TTFB → затримка старту завантаження ресурсу → завантаження → затримка рендерингу\`
- \`<img fetchpriority="high">\` для героя, **не** \`loading="lazy"\` на LCP-зображенні, \`preload\` для фонових картинок, CDN, SSR/SSG, менше render-blocking CSS/JS.

## CLS

- \`width\`/\`height\` або \`aspect-ratio\` для зображень і відео, зарезервоване місце для реклами/ембедів, не вставляти контент над наявним, \`font-display: optional\` або метрики fallback-шрифту (\`size-adjust\`), анімації лише через \`transform\`.

## INP

- **Long task** — задача на головному потоці > 50 мс. Розбивайте роботу і **поступайтеся потоком**:
\`\`\`js
async function yieldToMain() {
  if (globalThis.scheduler?.yield) return scheduler.yield();
  return new Promise((r) => setTimeout(r, 0));
}
\`\`\`
- Спершу візуальний відгук, потім важка робота; debounce вводу; Web Workers; менший DOM; \`content-visibility: auto\`.

## Завантаження

| Підказка | Коли |
|---|---|
| \`preconnect\` | критичний сторонній origin (DNS+TCP+TLS заздалегідь) |
| \`dns-prefetch\` | некритичні сторонні origin |
| \`preload\` | ресурс поточної сторінки, який браузер знайде пізно (шрифт, фон, LCP) |
| \`modulepreload\` | ES-модулі та їх залежності |
| \`prefetch\` | ресурс **наступної** навігації, з низьким пріоритетом |

- Code splitting (\`import()\`), tree shaking (ESM + \`sideEffects: false\`), аналіз бандла, AVIF/WebP + \`srcset\`/\`sizes\`, \`loading="lazy"\` для того, що нижче першого екрана.

## Пам'ять

- Витоки: забуті \`setInterval\`/слухачі/підписки, від'єднані (detached) DOM-вузли в масивах/мапах, необмежені кеші, замикання з великими даними.
- Пошук: DevTools → Memory → heap snapshots (порівняння до/після, фільтр *Detached*), Performance monitor.

## Вимірювання

\`\`\`js
performance.mark('start'); work(); performance.mark('end');
performance.measure('work', 'start', 'end');
new PerformanceObserver((list) => list.getEntries().forEach(console.log))
  .observe({ type: 'largest-contentful-paint', buffered: true });
\`\`\`
`,
  groups: [
    {
      id: 'metrics',
      title: 'Метрики: Core Web Vitals і вимірювання'
    },
    {
      id: 'lcp',
      title: 'LCP і зображення'
    },
    {
      id: 'cls',
      title: 'CLS і шрифти'
    },
    {
      id: 'loading',
      title: 'Завантаження: resource hints, бандл, кеш'
    },
    {
      id: 'inp',
      title: 'INP і головний потік'
    },
    {
      id: 'rendering',
      title: 'Рендеринг: rAF, layout thrashing, великі списки'
    },
    {
      id: 'memory',
      title: "Пам'ять: витоки і кеші"
    },
    {
      id: 'process',
      title: 'Процес оптимізації'
    }
  ],
  items: [
    {
      id: 'perf-cwv',
      group: 'metrics',
      type: 'theory',
      level: 1,
      interview: true,
      title: 'Core Web Vitals: LCP, INP, CLS',
      tags: ['web-vitals', 'lcp', 'inp', 'cls'],
      question: 'Що таке Core Web Vitals? Які метрики до них входять, що кожна вимірює і які порогові значення? Які ще метрики продуктивності ви знаєте?',
      choices: [
        'LCP ≤ 2.5 с, FID ≤ 100 мс, CLS ≤ 0.1 — оцінка за медіаною лабораторних запусків Lighthouse',
        'LCP ≤ 2.5 с, INP ≤ 200 мс, CLS ≤ 0.1 — оцінка за 75-м перцентилем реальних користувачів',
        'FCP ≤ 1.8 с, TBT ≤ 200 мс, CLS ≤ 0.25 — оцінка за середнім значенням усіх візитів сторінки',
        'LCP ≤ 4 с, INP ≤ 500 мс, CLS ≤ 0.25 — оцінка за 95-м перцентилем найповільніших візитів'
      ],
      answer: `
**Core Web Vitals** — набір метрик від Google, що описують реальний користувацький досвід за трьома осями: **завантаження**, **чутливість**, **візуальна стабільність**. Впливають на ранжування в пошуку (як частина page experience).

| Метрика | Вісь | Що вимірює | Good | Needs improvement | Poor |
|---|---|---|---|---|---|
| **LCP** — Largest Contentful Paint | завантаження | час до рендерингу найбільшого зображення/блоку тексту у viewport | ≤ 2.5 с | 2.5–4 с | > 4 с |
| **INP** — Interaction to Next Paint | чутливість | затримка від кліку/тапу/натискання клавіші до наступного кадру; береться одна з найгірших взаємодій за весь візит | ≤ 200 мс | 200–500 мс | > 500 мс |
| **CLS** — Cumulative Layout Shift | стабільність | сума неочікуваних зсувів макета (найгірше «вікно» сесії) | ≤ 0.1 | 0.1–0.25 | > 0.25 |

**Важливі деталі:**
- Оцінка — за **75-м перцентилем** візитів (окремо для mobile і desktop): сторінка «good», якщо 75% користувачів мають хороший досвід.
- **INP замінив FID 12 березня 2024.** FID (First Input Delay) міряв лише затримку *початку обробки* **першої** взаємодії і майже завжди був «зеленим». INP охоплює всі взаємодії і всю затримку: **input delay + processing time + presentation delay**.
- Скрол і hover в INP не враховуються — лише клік, тап, клавіатура.
- CLS не враховує зсуви протягом 500 мс після взаємодії користувача (очікувані — розгорнув акордеон).

**Інші метрики:**
- **TTFB** (Time to First Byte) — до першого байта відповіді (good ≤ 0.8 с): DNS, з'єднання, редиректи, сервер.
- **FCP** (First Contentful Paint) — перший текст/зображення (good ≤ 1.8 с).
- **TBT** (Total Blocking Time) — сума «зайвих» частин long tasks (понад 50 мс) між FCP і TTI; лабораторний проксі для INP у Lighthouse.
- Застарілі/допоміжні: TTI, Speed Index, FID.
`,
      correct: 1,
      why: [
        'FID замінено на INP у 2024, і оцінюють не лабораторні запуски, а польові дані.',
        'Так: три Core Web Vitals з порогами good, оцінка — p75 реальних візитів.',
        'FCP і TBT — допоміжні метрики (TBT лише лабораторна), і оцінка не за середнім.',
        '4 с / 500 мс / 0.25 — межі poor, а не good; перцентиль — 75-й, не 95-й.'
      ],
      keyPoints: [
        'Три осі: завантаження (LCP), чутливість (INP), стабільність (CLS)',
        'Пороги: LCP ≤ 2.5 с, INP ≤ 200 мс, CLS ≤ 0.1; poor: > 4 с, > 500 мс, > 0.25',
        'Оцінка за 75-м перцентилем реальних користувачів',
        'INP замінив FID у березні 2024: всі взаємодії, повна затримка до кадру',
        'Допоміжні: TTFB, FCP, TBT (лабораторний проксі INP)'
      ],
      followUps: [
        'Чому FID замінили на INP?',
        'З яких частин складається INP?',
        'Які елементи можуть бути LCP-кандидатами?'
      ]
    },
    {
      id: 'perf-quiz-inp-fid',
      group: 'metrics',
      type: 'quiz',
      level: 1,
      title: 'Яка метрика замінила FID',
      tags: ['web-vitals', 'inp'],
      question: 'Яка метрика у березні 2024 замінила FID (First Input Delay) у складі Core Web Vitals?',
      options: [
        'TBT (Total Blocking Time)',
        'TTI (Time to Interactive)',
        'INP (Interaction to Next Paint)',
        'FCP (First Contentful Paint)'
      ],
      answer: 2,
      hint: 'Нова метрика враховує всі взаємодії та час до наступного кадру.',
      why: [
        'TBT — лабораторна метрика Lighthouse, лише корелює з INP і не входить до Core Web Vitals.',
        'TTI — застаріла лабораторна метрика, її навіть прибрали з Lighthouse 10.',
        'Так: INP з 12 березня 2024 — Core Web Vital чутливості замість FID.',
        'FCP — метрика завантаження (перший контент), а не реакції на ввід.'
      ],
      explanation: `
INP враховує **всі** взаємодії за візит і **повну** затримку — до кадру, у якому користувач бачить реакцію. FID міряв лише затримку *старту* обробки *першої* взаємодії і майже завжди був «зеленим», тож погано відображав реальну чутливість.
`
    },
    {
      id: 'perf-quiz-thresholds',
      group: 'metrics',
      type: 'quiz',
      level: 1,
      title: 'Порогові значення «good»',
      tags: ['web-vitals'],
      question: 'Оберіть **усі** значення (75-й перцентиль), що потрапляють у категорію **good**:',
      options: ['INP = 350 мс', 'LCP = 2.3 с', 'CLS = 0.15', 'INP = 180 мс', 'CLS = 0.08', 'LCP = 3.1 с'],
      answer: [1, 3, 4],
      hint: 'Пороги «good»: 2.5 с / 200 мс / 0.1.',
      why: [
        '350 мс > 200 мс — це needs improvement (200–500 мс).',
        '2.3 с ≤ 2.5 с — good.',
        '0.15 > 0.1 — needs improvement (0.1–0.25).',
        '180 мс ≤ 200 мс — good.',
        '0.08 ≤ 0.1 — good.',
        '3.1 с потрапляє в 2.5–4 с — needs improvement.'
      ],
      explanation: `
Запам'ятайте дві трійки: **good** — 2.5 с / 200 мс / 0.1, **poor** — понад 4 с / 500 мс / 0.25. Усе між ними — needs improvement. Оцінюється p75 візитів окремо для mobile і desktop.
`
    },
    {
      id: 'perf-lab-field',
      group: 'metrics',
      type: 'theory',
      level: 2,
      title: 'Lab vs field: Lighthouse, CrUX, RUM, PerformanceObserver',
      tags: ['web-vitals', 'lighthouse', 'rum', 'measurement'],
      question: 'Чим лабораторні дані відрізняються від польових? Чому Lighthouse показує 95, а Search Console — «poor» для INP? Як зібрати Web Vitals з реальних користувачів?',
      choices: [
        'Lighthouse і Search Console беруть ті самі дані, а різниця виникає лише через кеш браузера',
        'Search Console песимістичніший, бо тестує сторінку на емульованому слабкому пристрої з throttling',
        'Розбіжність — баг Lighthouse: польові дані CrUX надто шумні, тому орієнтуватися варто лише на lab',
        'Lighthouse не вимірює INP (немає реальних взаємодій), а Search Console показує польові дані CrUX'
      ],
      answer: `
**Lab data (синтетика)** — Lighthouse, PageSpeed Insights (верхня частина), DevTools Performance, WebPageTest:
- один запуск у контрольованих умовах (емуляція повільного CPU і мережі, холодний кеш, без взаємодій);
- **відтворюване**, ідеальне для дебагу та регресій у CI (Lighthouse CI, бюджети);
- **не вимірює INP** (немає реальних взаємодій) — замість нього TBT; не бачить реальних пристроїв, кешу, розширень, A/B-тестів, персоналізованого контенту, cookie-банерів у різних країнах.

**Field data (RUM — Real User Monitoring)** — реальні користувачі:
- **CrUX** (Chrome User Experience Report) — дані користувачів Chrome, що погодились на збір статистики, ковзне вікно **28 днів**, 75-й перцентиль. Саме його бачите в PageSpeed Insights (нижня частина «Discover what your real users are experiencing»), Search Console і саме він впливає на пошук.
- Власний RUM: бібліотека **\`web-vitals\`** + відправка в аналітику/бекенд, або сервіси (Sentry, Datadog, SpeedCurve, Vercel Analytics).

**Чому розбіжність:** Lighthouse тестує одну сторінку один раз на емульованому пристрої; реальні користувачі мають слабші телефони, повільну мережу, довгі сесії з десятками взаємодій (INP!), рекламу та сторонні скрипти, що вантажаться пізніше.

**Збір у полі:**
\`\`\`js
import { onLCP, onINP, onCLS } from 'web-vitals/attribution';

function send(metric) {
  const body = JSON.stringify({
    name: metric.name, value: metric.value, rating: metric.rating, id: metric.id,
    target: metric.attribution?.interactionTarget ?? metric.attribution?.target,
  });
  // sendBeacon переживає закриття сторінки
  navigator.sendBeacon?.('/analytics', body) || fetch('/analytics', { body, method: 'POST', keepalive: true });
}
onLCP(send); onINP(send); onCLS(send);
\`\`\`
- Метрики фіналізуються пізно (CLS та INP — при прихованні сторінки), тому відправка на \`visibilitychange\` через \`sendBeacon\`/\`keepalive\`.
- **Attribution build** показує *що саме* винне: LCP-елемент і його підчастини, елемент і тип взаємодії для INP, елемент, що зсунувся, для CLS.

**Низькорівневий API — \`PerformanceObserver\`:**
\`\`\`js
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) console.log('LCP candidate', entry.startTime, entry.element);
}).observe({ type: 'largest-contentful-paint', buffered: true });
\`\`\`
Типи записів: \`navigation\`, \`resource\`, \`paint\`, \`largest-contentful-paint\`, \`layout-shift\`, \`event\` (для INP), \`longtask\`, \`long-animation-frame\` (LoAF — точніша атрибуція повільних кадрів). \`buffered: true\` — отримати записи, що сталися до підписки.

**Процес:** field data показує **що** і **де** погано → lab (DevTools Performance, трейс на повільному CPU) пояснює **чому** → виправлення → перевірка в полі через 28 днів (CrUX) або одразу у власному RUM.
`,
      correct: 3,
      why: [
        'Джерела різні: Lighthouse — синтетичний запуск, Search Console — польові дані CrUX.',
        'Search Console нічого не емулює — він показує реальних користувачів Chrome за 28 днів.',
        'Це не баг: саме польові дані відображають реальний досвід і впливають на пошук.',
        'Так: без реальних взаємодій INP не виміряти (Lighthouse дає TBT), а CrUX бачить живі сесії.'
      ],
      keyPoints: [
        'Lab: Lighthouse/DevTools, контрольовані умови, відтворюваність, немає INP (TBT як проксі)',
        'Field: CrUX (28 днів, p75, впливає на пошук) і власний RUM',
        'Причини розбіжностей: пристрої, мережа, взаємодії, сторонні скрипти',
        'web-vitals (+ attribution) і відправка через sendBeacon на visibilitychange',
        'PerformanceObserver з buffered: true; LoAF для атрибуції',
        'Field показує що, lab — чому'
      ],
      followUps: [
        'Чому CLS і INP відправляють при visibilitychange, а не одразу?',
        'Що таке Long Animation Frames API?',
        'Як налаштувати performance budget у CI?'
      ]
    },
    {
      id: 'perf-measure',
      group: 'metrics',
      type: 'code',
      level: 1,
      title: 'measure: заміряти час виконання функції',
      tags: ['measurement', 'performance-now'],
      description: `
**Завдання.** Напишіть дві утиліти, що заміряють, скільки виконується функція, через \`performance.now()\`.

**Де трапляється:** перш ніж оптимізувати, треба виміряти: скільки триває фільтрація каталогу, парсинг відповіді API, рендер таблиці; повільні операції потім логують у RUM. На співбесіді — «як заміряти час виконання і чому не \`Date.now()\`».

**Що написати**
- \`measure(fn)\` → \`{ result, duration }\`: синхронно викликає \`fn()\`; \`result\` — що повернула \`fn\`, \`duration\` — мілісекунди.
- \`measureAsync(fn)\` → проміс \`{ result, duration }\`: викликає \`fn()\` і чекає на результат (проміс **або** звичайне значення).

**Приклад**
\`\`\`js
const { result, duration } = measure(() => filterProducts(products, 'phone'));
// result — відфільтрований масив, duration — напр. 12.4

const { result: user } = await measureAsync(() => fetch('/api/me').then((r) => r.json()));
\`\`\`

**Як це працює:** \`performance.now()\` — монотонний час з дробовими мілісекундами від старту сторінки; він не «стрибає» при синхронізації системного годинника, як \`Date.now()\`. Час беремо до виклику і після, різниця — тривалість. В асинхронній версії «після» має бути **після \`await\`**, інакше заміряємо лише створення промісу.

**Врахуйте:**
- помилку з \`fn\` (або відхилений проміс) не ловіть — вона має полетіти далі;
- \`measureAsync\` приймає й функцію, що повертає звичайне значення.
`,
      starter: `function measure(fn) {
  // 1. Запам'ятайте час старту: performance.now()
  // 2. Викличте fn() і збережіть результат (помилку не ловіть — хай летить далі)
  // 3. Поверніть { result, duration }, де duration = зараз − старт
  // TODO
}

async function measureAsync(fn) {
  // 1. Старт — як у measure
  // 2. await fn() — працює і з промісом, і зі звичайним значенням
  // 3. duration рахуйте ПІСЛЯ await
  // TODO
}

// Спробуйте в консолі:
// measure(() => Array.from({ length: 1e6 }, (_, i) => i).sort((a, b) => b - a).length)
// await measureAsync(() => new Promise((r) => setTimeout(() => r('ok'), 100)))
`,
      solution: `function measure(fn) {
  const start = performance.now();
  const result = fn(); // якщо кине — помилка піде далі сама
  return { result, duration: performance.now() - start };
}

async function measureAsync(fn) {
  const start = performance.now();
  const result = await fn(); // await працює і для промісів, і для звичайних значень
  return { result, duration: performance.now() - start };
}
`,
      hints: [
        "Запам'ятайте `performance.now()` до виклику і порахуйте різницю після.",
        'В асинхронній версії різницю рахуйте **після** `await` — інакше заміряєте лише створення промісу.'
      ],
      tests: [
        { name: 'measure повертає результат і тривалість', code: "useFakeTimers(1000);\nconst r = measure(() => { advanceTimersByTime(25); return 'ok'; });\nexpect(r).toEqual({ result: 'ok', duration: 25 });" },
        { name: 'measureAsync чекає на проміс', code: 'useFakeTimers();\nconst p = measureAsync(() => new Promise((resolve) => setTimeout(() => resolve(5), 100)));\nadvanceTimersByTime(100);\nawait expect(p).resolves.toEqual({ result: 5, duration: 100 });' },
        { name: 'measureAsync працює зі звичайним значенням', code: 'useFakeTimers();\nawait expect(measureAsync(() => 7)).resolves.toEqual({ result: 7, duration: 0 });' },
        { name: 'помилки пробрасуються', code: "expect(() => measure(() => { throw new Error('boom'); })).toThrow('boom');\nawait expect(measureAsync(async () => { throw new Error('async boom'); })).rejects.toThrow('async boom');" }
      ],
      explanation: `
**Чому працює:** різниця двох \`performance.now()\` — тривалість; \`await\` однаково чекає і проміс, і звичайне значення. Помилки пробрасуються самі, бо ми їх не ловимо.

**Чому не \`Date.now()\`:** цілі мілісекунди і може змінитися разом із системним годинником. (\`performance.now\` браузери трохи загрублюють через Spectre.)

**У реальному проєкті** — User Timing API: заміри видно в DevTools Performance і їх можна збирати \`PerformanceObserver\`:
\`\`\`js
performance.mark('filter:start');
filterProducts(list);
performance.measure('filter', 'filter:start');
\`\`\`

**Типова помилка:** у \`measureAsync\` рахувати різницю до \`await\`. Мікробенчмарки обманюють: JIT розігрівається, GC втручається — міряйте кілька прогонів на повільному CPU.

**Далі можуть спитати:** як заміряти час до відмальовування кадру після кліку (Event Timing API / INP)?
`
    },
    {
      id: 'perf-p75',
      group: 'metrics',
      type: 'code',
      level: 2,
      title: 'p75 і рейтинг Web Vitals з польових даних',
      tags: ['web-vitals', 'rum', 'percentile'],
      description: `
**Завдання.** Порахуйте 75-й перцентиль зібраних RUM-замірів метрики і оцініть її як \`good\` / \`needs-improvement\` / \`poor\`.

**Де трапляється:** власний дашборд продуктивності: \`web-vitals\` шле заміри на бекенд, а ви показуєте p75 по сторінках. На співбесіді — «чому p75, а не середнє».

**Що написати**
- \`rateMetric(name, values)\` → \`{ p75, rating }\`, або \`null\`, якщо \`values\` порожній.
  - **p75** (nearest-rank): відсортувати за зростанням, взяти елемент з індексом \`Math.ceil(0.75 * n) - 1\`.
  - **rating**: \`'good'\`, якщо \`p75 <= good\`; \`'poor'\`, якщо \`p75 > poor\`; інакше \`'needs-improvement'\`.

| name | good | poor |
|---|---|---|
| \`LCP\` | 2500 | 4000 |
| \`INP\` | 200 | 500 |
| \`CLS\` | 0.1 | 0.25 |
| \`FCP\` | 1800 | 3000 |
| \`TTFB\` | 800 | 1800 |

**Приклад**
\`\`\`js
rateMetric('LCP', [1200, 3000, 2000, 2600]); // { p75: 2600, rating: 'needs-improvement' }
rateMetric('INP', [50, 600, 120, 80, 150]);  // { p75: 150, rating: 'good' }
rateMetric('CLS', []);                       // null
rateMetric('FID', [10]);                     // кидає Error: невідома метрика
\`\`\`

**Як це працює:** заміри мають «довгий хвіст» (слабкі телефони, погана мережа). Середнє спотворюють викиди, медіана ховає проблеми чверті користувачів; p75 означає «щонайменше 75% візитів мають такий або кращий досвід». Так рахують CrUX і Search Console.

**Врахуйте:**
- \`sort()\` без компаратора сортує як рядки: \`[1000, 200, 30]\` лишиться в такому порядку;
- не мутуйте вхідний масив;
- межі: рівно \`good\` — це ще good, рівно \`poor\` — ще needs-improvement;
- невідома метрика → \`throw new Error(...)\`.
`,
      starter: `// Пороги [good, poor] для кожної метрики
const THRESHOLDS = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

function rateMetric(name, values) {
  // 1. Знайдіть пороги в THRESHOLDS; немає — throw new Error('Unknown metric: ' + name)
  // 2. Порожній масив → null
  // 3. Відсортуйте КОПІЮ за зростанням (з компаратором!)
  // 4. p75 = sorted[Math.ceil(0.75 * n) - 1]
  // 5. rating: <= good → 'good', > poor → 'poor', інакше 'needs-improvement'
  // TODO
}

// Спробуйте в консолі: rateMetric('LCP', [1200, 3000, 2000, 2600])
`,
      solution: `const THRESHOLDS = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

function rateMetric(name, values) {
  const thresholds = THRESHOLDS[name];
  if (!thresholds) throw new Error('Unknown metric: ' + name);
  if (!values.length) return null;

  // копія + числове сортування (sort() без компаратора сортує як рядки!)
  const sorted = [...values].sort((a, b) => a - b);
  const p75 = sorted[Math.ceil(0.75 * sorted.length) - 1];

  const [good, poor] = thresholds;
  const rating = p75 <= good ? 'good' : p75 > poor ? 'poor' : 'needs-improvement';
  return { p75, rating };
}
`,
      hints: [
        'Скопіюйте масив (`[...values]`) і сортуйте з компаратором `(a, b) => a - b` — `sort()` без нього порівнює рядки (`1000 < 200`).',
        'Індекс nearest-rank: `Math.ceil(0.75 * n) - 1`. Межі: `<= good` — good, `> poor` — poor.'
      ],
      tests: [
        { name: 'LCP: числове сортування і needs-improvement', code: "expect(rateMetric('LCP', [1200, 3000, 2000, 2600])).toEqual({ p75: 2600, rating: 'needs-improvement' });" },
        { name: 'INP: good', code: "expect(rateMetric('INP', [50, 600, 120, 80, 150])).toEqual({ p75: 150, rating: 'good' });" },
        { name: 'CLS: дробові значення, poor', code: "expect(rateMetric('CLS', [0.05, 0.3, 0.3, 0.3])).toEqual({ p75: 0.3, rating: 'poor' });" },
        { name: 'межі порогів', code: "expect(rateMetric('LCP', [2500]).rating).toBe('good');\nexpect(rateMetric('LCP', [4000]).rating).toBe('needs-improvement');\nexpect(rateMetric('LCP', [4001]).rating).toBe('poor');\nexpect(rateMetric('TTFB', [800]).rating).toBe('good');" },
        { name: 'сортування не як рядки', code: "expect(rateMetric('INP', [1000, 200, 30, 90]).p75).toBe(200);" },
        { name: 'не мутує вхідні дані', code: "const v = [3000, 1000, 2000];\nrateMetric('FCP', v);\nexpect(v).toEqual([3000, 1000, 2000]);" },
        { name: 'порожній масив і невідома метрика', code: "expect(rateMetric('CLS', [])).toBeNull();\nexpect(() => rateMetric('FID', [10])).toThrow();" }
      ],
      explanation: `
**Чому працює:** копія + числовий компаратор дають правильний порядок, індекс nearest-rank — елемент, нижче або на рівні якого 75% значень. Складність O(n log n) через сортування.

**Типові помилки:** \`values.sort()\` без компаратора, мутація вхідних даних, \`<\` замість \`<=\` на межі, індекс \`Math.floor(0.75 * n)\` (зсув на один елемент).

**Практика:** p75 рахують окремо для mobile і desktop і по шаблонах сторінок — інакше швидка головна на десктопі «сховає» повільний каталог на телефонах.

**Далі можуть спитати:** як рахувати перцентилі на мільярдах подій (гістограми, t-digest — без зберігання всіх значень)?
`
    },
    {
      id: 'perf-images',
      group: 'lcp',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Оптимізація зображень',
      tags: ['images', 'srcset', 'lazy-loading'],
      question: 'Як оптимізувати зображення на сайті? Розкажіть про формати, адаптивні зображення (srcset, sizes, picture), ліниве завантаження і запобігання зсувам макета. Оберіть **усі** правильні твердження.',
      choices: [
        '`srcset` з `w`-дескрипторами + `sizes` дозволяють браузеру обрати файл під ширину слота й DPR',
        '`loading="lazy"` варто ставити на всі зображення, бо браузер сам визначить, що вони на першому екрані',
        'Атрибути `width` і `height` резервують місце (браузер виводить `aspect-ratio`), що запобігає CLS',
        'AVIF підтримується лише в Chrome, тому для нього потрібна JS-детекція браузера з підміною `src`',
        'Анімовані GIF вигідніші за відео MP4/WebM, бо не потребують декодера й важать менше'
      ],
      answer: `
Зображення — найчастіше найважча частина сторінки і найчастіший LCP-елемент.

**1. Формати:**
| Формат | Коли |
|---|---|
| **AVIF** | найкраще стиснення (часто на 30–50% менше JPEG), підтримується всіма сучасними браузерами; повільніше кодування |
| **WebP** | універсальна підтримка, на ~25–35% менше JPEG; добрий fallback |
| JPEG / PNG | fallback; PNG — лише коли потрібна точна графіка без втрат |
| **SVG** | іконки, логотипи, ілюстрації (оптимізувати SVGO) |
| Відео (MP4/WebM) | замість анімованих GIF — у рази менше |

\`\`\`html
<picture>
  <source type="image/avif" srcset="hero.avif">
  <source type="image/webp" srcset="hero.webp">
  <img src="hero.jpg" alt="..." width="1200" height="600">
</picture>
\`\`\`

**2. Адаптивні розміри — \`srcset\` + \`sizes\`:**
\`\`\`html
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1600.jpg 1600w"
  sizes="(max-width: 600px) 100vw, 50vw"
  alt="..." width="1600" height="900">
\`\`\`
- \`w\`-дескриптори — реальна ширина файлу; \`sizes\` — яку ширину займе зображення в макеті. Браузер сам множить на DPR і обирає кандидата (і може взяти більший, якщо він уже в кеші).
- \`x\`-дескриптори (\`1x, 2x\`) — для зображень фіксованого розміру (аватар, логотип).
- \`<picture>\` з \`media\` — для **art direction** (інша кадровка на мобільних).

**3. Ліниве завантаження:**
- \`loading="lazy"\` — нативно, для зображень і iframe **нижче першого екрана**. Ніколи для LCP.
- \`decoding="async"\` — декодування не блокує інший рендеринг.
- \`fetchpriority="high"\` — для героя; \`"low"\` — для каруселей поза кадром.

**4. Без зсувів макета (CLS):**
- Завжди \`width\` і \`height\` атрибути: браузер обчислює \`aspect-ratio\` і резервує місце ще до завантаження (у CSS \`img { max-width: 100%; height: auto; }\`).
- Або CSS \`aspect-ratio: 16 / 9\` для контейнера.

**5. Доставка:**
- Image CDN (Cloudinary, imgix, Vercel/Next Image, Cloudflare Images): ресайз, формат за \`Accept\`, якість на льоту.
- Довге кешування з хешем у назві (\`immutable\`).
- Компресія (якість 60–80 для фото), видалення метаданих (EXIF).
- Плейсхолдери: колір/blur (LQIP), щоб не було «порожнечі».
- CSS-фони не мають \`srcset\` (лише \`image-set()\`) і пізно виявляються — для важливого контенту краще \`<img>\`.
`,
      correct: [0, 2],
      why: [
        'Так: `w` описує ширину файлу, `sizes` — ширину слота, браузер множить на DPR.',
        'Lazy на зображеннях першого екрана (особливо LCP) відкладає їх завантаження і погіршує LCP.',
        'Так: з атрибутів браузер виводить aspect-ratio і резервує місце до завантаження.',
        'AVIF підтримують усі сучасні браузери; fallback робиться через `<picture>`, без JS.',
        'GIF у рази важчий за MP4/WebM; анімацію краще віддавати як `<video autoplay muted loop playsinline>`.'
      ],
      keyPoints: [
        'Формати: AVIF/WebP з fallback через <picture>; SVG для іконок; відео замість GIF',
        'srcset з w-дескрипторами + sizes; x-дескриптори для фіксованого розміру; art direction',
        'loading="lazy" лише нижче першого екрана; fetchpriority, decoding="async"',
        'width/height або aspect-ratio проти CLS',
        'Image CDN, компресія, кешування, плейсхолдери'
      ],
      followUps: [
        'Що станеться, якщо не вказати sizes при w-дескрипторах?',
        'Чим srcset відрізняється від <picture>?',
        'Як Next.js Image оптимізує зображення?'
      ]
    },
    {
      id: 'perf-quiz-lcp-lazy',
      group: 'lcp',
      type: 'quiz',
      level: 2,
      title: 'loading="lazy" на hero-зображенні',
      tags: ['lcp', 'lazy-loading'],
      question: 'Компонент `<Image>` у проєкті за замовчуванням ставить `loading="lazy"` усім картинкам, включно з великим банером на першому екрані (це LCP-елемент). Як це вплине на LCP?',
      options: [
        'Покращить LCP, бо на сторінці вантажиться менше байтів',
        'Погіршить LCP: браузер відкладає lazy-зображення до розрахунку layout і вантажить їх з нижчим пріоритетом',
        'Ніяк: зображення у viewport завантажуються однаково, з lazy чи без',
        'Погіршить лише CLS, а LCP не зміниться'
      ],
      answer: 1,
      hint: 'Коли браузер може дізнатися, чи лінива картинка потрапляє у viewport?',
      why: [
        'Байти банера однаково потрібні на першому екрані — lazy лише відкладає старт їх завантаження.',
        'Так: lazy-картинку браузер починає вантажити лише після layout і з нижчим пріоритетом — росте resource load delay.',
        'Навіть у viewport lazy-зображення стартує пізніше за eager: браузер спершу чекає layout.',
        'CLS залежить від зарезервованих розмірів (width/height), а не від атрибута loading.'
      ],
      explanation: `
Щоб вирішити долю \`loading="lazy"\`, браузер має знати, чи картинка у viewport, — а це відомо лише після CSS і layout. Preload scanner не стартує її завантаження під час розбору HTML.

**Правильно:** LCP-зображення — eager (за замовчуванням) + \`fetchpriority="high"\`; \`lazy\` — лише нижче першого екрана.
`
    },
    {
      id: 'perf-lcp',
      group: 'lcp',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Як оптимізувати LCP',
      tags: ['lcp', 'images', 'loading'],
      question: 'LCP на мобільних — 4.2 с. Як ви будете діяти? З яких частин складається LCP і що можна зробити на кожному етапі? Оберіть **усі** правильні твердження.',
      choices: [
        'Додати `loading="lazy"` на всі зображення, включно з героєм, щоб звільнити канал для LCP',
        'Спершу визначити LCP-елемент і яка з підчастин (TTFB, load delay, load duration, render delay) найбільша',
        'LCP-зображення має бути в початковому HTML як `<img>` з `fetchpriority="high"`, а не вставлятися JS-ом',
        'Перенести героя в CSS `background-image` — так браузер виявить його раніше, ніж `<img>`',
        'Anti-flicker сніпети A/B-тестів, що ховають сторінку до завантаження скрипта, погіршують LCP'
      ],
      answer: `
**Крок 0 — діагностика:** який елемент є LCP (\`web-vitals/attribution\`, DevTools Performance → LCP marker, PageSpeed Insights)? Це зображення, відео-постер, фон чи текст? Чи однаковий він на мобільних і десктопі?

**LCP = 4 підчастини** (для зображення):
| Підчастина | Що це | Ціль |
|---|---|---|
| **TTFB** | до першого байта HTML | ~40% |
| **Resource load delay** | від TTFB до початку завантаження LCP-ресурсу | < 10% |
| **Resource load duration** | саме завантаження ресурсу | ~40% |
| **Element render delay** | від завантаження до відмальовування | < 10% |

**1. TTFB:**
- CDN, кешування HTML на edge (\`stale-while-revalidate\`), SSG/ISR замість SSR на кожен запит, швидший бекенд/БД, менше редиректів.
- \`103 Early Hints\`, HTTP/3, \`preconnect\` до критичних origin.

**2. Resource load delay — браузер має дізнатися про ресурс якомога раніше:**
- LCP-зображення — звичайний \`<img src>\` у **початковому HTML** (не вставлений JS-ом після гідрації, не \`background-image\` у CSS, що знайдеться лише після CSSOM).
- Якщо інакше ніяк — \`<link rel="preload" as="image" href="hero.avif" fetchpriority="high">\` (з \`imagesrcset\`/\`imagesizes\` для адаптивних).
- **\`fetchpriority="high"\`** на LCP-\`<img>\` — браузер піднімає пріоритет одразу, а не після layout.
- **Ніколи \`loading="lazy"\`** на LCP-зображенні (часта помилка, коли лінивість ставлять усім картинкам компонентом).
- Ресурс на тому самому origin або з \`preconnect\` — без додаткових handshake.

**3. Resource load duration:**
- Сучасні формати (**AVIF**, WebP), правильний розмір через \`srcset\`/\`sizes\` (не 3000px картинка в 400px слот), компресія (якість 60–75 зазвичай непомітна), CDN для зображень.
- Менше конкуренції за канал: не вантажити купу некритичних ресурсів паралельно з героєм.

**4. Element render delay:**
- Render-blocking CSS: критичний CSS інлайн, решта — асинхронно; менше CSS загалом.
- Render-blocking JS: \`defer\`/\`type="module"\`, без синхронних сторонніх скриптів у \`<head>\`.
- Клієнтський рендеринг (SPA): LCP чекає на завантаження і виконання JS → **SSR/SSG**, стримінг HTML, або хоча б інлайн-даних для першого екрана.
- Шрифти для LCP-тексту: \`font-display: swap/optional\`, preload головного шрифту.
- A/B-тести і anti-flicker сніпети, що ховають сторінку до завантаження скрипта, — класичний вбивця LCP.

**Перевірка:** lab-трейс зі slow 4G + 4x CPU throttling, потім field-дані (RUM одразу, CrUX — через 28 днів). Додатково: **bfcache** (повернення «назад» майже миттєве — не ламайте його \`unload\`-обробниками і \`Cache-Control: no-store\`) і **Speculation Rules** для prerender наступної сторінки.
`,
      correct: [1, 2, 4],
      hint: "LCP розкладається на чотири послідовні фази. Спершу з'ясуйте, яка з них «товста».",
      why: [
        'Lazy на герої — класична причина поганого LCP: старт завантаження відкладається до layout.',
        'Так: без розбивки на підчастини легко оптимізувати не те (картинку, коли винен TTFB).',
        'Так: preload scanner знаходить `<img>` у HTML одразу, а `fetchpriority` піднімає пріоритет.',
        'Навпаки: CSS-фон знаходиться лише після завантаження CSS і побудови CSSOM — пізніше за `<img>`.',
        'Так: такі сніпети ховають усю сторінку до завантаження скрипта, і LCP чекає на них.'
      ],
      keyPoints: [
        'Спочатку визначити LCP-елемент і «товсту» підчастину',
        'Підчастини: TTFB, load delay, load duration, render delay',
        'Рання видимість ресурсу: img у HTML, preload, fetchpriority="high", без lazy на LCP',
        'Розмір і формат: AVIF/WebP, srcset/sizes, компресія, CDN',
        'Render delay: render-blocking CSS/JS, SSR/SSG замість CSR, шрифти, anti-flicker',
        'TTFB: CDN, edge-кеш, Early Hints; перевірка в lab і field'
      ],
      followUps: [
        'Чому background-image погано підходить для героя?',
        'Як SPA без SSR може покращити LCP?',
        'Що робить fetchpriority і коли його не варто використовувати?'
      ]
    },
    {
      id: 'perf-srcset',
      group: 'lcp',
      type: 'code',
      level: 2,
      title: 'Обрати варіант зображення зі srcset',
      tags: ['images', 'srcset', 'parsing'],
      description: `
**Завдання.** Оберіть із рядка \`srcset\` той файл, який підійде для слота заданої ширини на екрані з заданою щільністю пікселів (DPR) — так, як це робить браузер.

**Де трапляється:** у JS, де нативного \`srcset\` немає: обрати варіант з image-CDN для \`background-image\`, \`<canvas>\`, \`<link rel="preload">\` чи прев'ю в модалці. На співбесіді — «як браузер обирає файл зі srcset і навіщо \`sizes\`».

**Що написати**
- \`pickSrcsetCandidate(srcset, slotWidth, dpr = 1)\` → URL-рядок, або \`null\` для порожнього \`srcset\`.
  - Кандидати розділені комами, кожен — \`URL [дескриптор]\` з довільними пробілами (у URL ком немає).
  - **\`w\`-дескриптори** (\`photo-800.jpg 800w\`): потрібно \`slotWidth * dpr\` фізичних пікселів → **найменший** кандидат з шириною **≥** потрібної; якщо такого немає — **найбільший**.
  - **\`x\`-дескриптори** (\`logo@2x.png 2x\`): \`slotWidth\` ігнорується → найменша щільність **≥ \`dpr\`**, інакше найбільша. Кандидат **без дескриптора** = \`1x\`.
  - В одному \`srcset\` — лише один тип дескрипторів.

**Приклад**
\`\`\`js
const s = 'small.jpg 400w, medium.jpg 800w, large.jpg 1600w';
pickSrcsetCandidate(s, 360, 1);  // 'small.jpg'  (треба 360px)
pickSrcsetCandidate(s, 360, 2);  // 'medium.jpg' (треба 720px)
pickSrcsetCandidate(s, 2000, 2); // 'large.jpg'  (нічого не вистачає → найбільший)
pickSrcsetCandidate('a.png, a@2x.png 2x', 0, 3); // 'a@2x.png'
\`\`\`

**Як це працює:** \`slotWidth\` — це те, що браузер обчислює з \`sizes\` (наприклад, \`50vw\` на 720px-екрані = 360px). На екрані з DPR 2 слот у 360 CSS-пікселів має 720 фізичних, тож потрібен файл шириною ≥ 720. Без \`sizes\` браузер вважає слот \`100vw\` і вантажить зайве.

**Врахуйте:**
- порядок кандидатів у рядку довільний;
- пробіли навколо і кома без пробілу;
- дробові щільності (\`1.5x\`);
- порожній рядок або лише коми → \`null\`.
`,
      starter: `function parseSrcset(srcset) {
  // 1. Розбийте рядок за комами, обріжте пробіли, відкиньте порожні частини
  // 2. Кожну частину — на URL і дескриптор: part.split(/\\s+/); немає дескриптора → '1x'
  // 3. Поверніть масив { url, unit: 'w' | 'x', value: число }
  // TODO
  return [];
}

function pickSrcsetCandidate(srcset, slotWidth, dpr = 1) {
  // 1. candidates = parseSrcset(srcset), відсортовані за value; порожньо → null
  // 2. required = unit 'w' ? slotWidth * dpr : dpr
  // 3. Найменший кандидат з value >= required, інакше — найбільший
  // TODO
}

// Спробуйте в консолі:
// pickSrcsetCandidate('small.jpg 400w, medium.jpg 800w, large.jpg 1600w', 360, 2) // 'medium.jpg'
`,
      solution: `function parseSrcset(srcset) {
  return String(srcset)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [url, descriptor = '1x'] = part.split(/\\s+/);
      const unit = descriptor.slice(-1).toLowerCase(); // 'w' або 'x'
      return { url, unit, value: parseFloat(descriptor) };
    });
}

function pickSrcsetCandidate(srcset, slotWidth, dpr = 1) {
  const candidates = parseSrcset(srcset).sort((a, b) => a.value - b.value);
  if (!candidates.length) return null;

  // для w — потрібна кількість фізичних пікселів, для x — щільність
  const required = candidates[0].unit === 'w' ? slotWidth * dpr : dpr;
  const fit = candidates.find((c) => c.value >= required);
  return (fit || candidates[candidates.length - 1]).url;
}
`,
      hints: [
        "Розберіть рядок у масив `{ url, unit, value }`: `split(',')` → `trim()` → `split(/\\s+/)`. Відсутній дескриптор вважайте `1x`.",
        'Відсортуйте за `value`. Для `w` потрібне значення — `slotWidth * dpr`, для `x` — просто `dpr`.',
        '`candidates.find(c => c.value >= required)` дасть найменший підходящий; якщо `undefined` — візьміть останній (найбільший).'
      ],
      tests: [
        { name: 'w-дескриптори з різним DPR', code: "const s = 'small.jpg 400w, medium.jpg 800w, large.jpg 1600w';\nexpect(pickSrcsetCandidate(s, 360, 1)).toBe('small.jpg');\nexpect(pickSrcsetCandidate(s, 360, 2)).toBe('medium.jpg');\nexpect(pickSrcsetCandidate(s, 360, 3)).toBe('large.jpg');" },
        { name: 'точний збіг і завеликий слот', code: "const s = 'small.jpg 400w, medium.jpg 800w, large.jpg 1600w';\nexpect(pickSrcsetCandidate(s, 800)).toBe('medium.jpg');\nexpect(pickSrcsetCandidate(s, 2000, 2)).toBe('large.jpg');" },
        { name: 'довільний порядок кандидатів', code: "expect(pickSrcsetCandidate('l.jpg 1600w, s.jpg 400w, m.jpg 800w', 500)).toBe('m.jpg');" },
        { name: 'x-дескриптори та кандидат без дескриптора', code: "const s = 'a.png, a@2x.png 2x, a@3x.png 3x';\nexpect(pickSrcsetCandidate(s, 100, 1)).toBe('a.png');\nexpect(pickSrcsetCandidate(s, 100, 2)).toBe('a@2x.png');\nexpect(pickSrcsetCandidate(s, 100, 2.5)).toBe('a@3x.png');\nexpect(pickSrcsetCandidate(s, 100, 4)).toBe('a@3x.png');" },
        { name: 'пробіли та кома без пробілу', code: "expect(pickSrcsetCandidate('  s.jpg 400w,m.jpg   800w ', 401)).toBe('m.jpg');\nexpect(pickSrcsetCandidate('one.jpg 1.5x,two.jpg 2x', 0, 1)).toBe('one.jpg');" },
        { name: 'порожній srcset', code: "expect(pickSrcsetCandidate('', 300)).toBeNull();\nexpect(pickSrcsetCandidate('  ,  ', 300)).toBeNull();" }
      ],
      explanation: `
**Чому працює:** після сортування \`find(c => c.value >= required)\` дає найменший достатній файл, а запасний варіант — останній (найбільший). Складність O(n log n).

**Чим справжній браузер відрізняється:** може взяти **більший** кандидат, якщо той уже в кеші, або **менший** при Save-Data; парсер посимвольний і дозволяє коми в URL; \`sizes="auto"\` для \`loading="lazy"\` бере реальну ширину з layout.

**Типова помилка в розмітці:** \`srcset\` з \`w\` без \`sizes\` — браузер вважає слот \`100vw\` і для мініатюри 200px на десктопі вантажить 1600px-файл.

**Практика:** 3–5 ширин (400/800/1200/1600), точний \`sizes\`; для іконок фіксованого розміру — \`1x\`/\`2x\`.

**Далі можуть спитати:** коли потрібен \`<picture>\` замість \`srcset\` (art direction, формати)?
`
    },
    {
      id: 'perf-cls',
      group: 'cls',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'CLS: причини зсувів і як їх усунути',
      tags: ['cls', 'layout'],
      question: 'Що таке Cumulative Layout Shift, як він рахується? Які найчастіші причини зсувів макета і як їх виправити?',
      choices: [
        'Зсуви групуються в session windows, CLS — найбільше вікно; зсуви за 500 мс після взаємодії не рахуються',
        'CLS — сума всіх зсувів за весь час життя сторінки, тому довгі SPA-сесії завжди мають гірший CLS, ніж короткі',
        'Анімація `transform: translateY` рахується як layout shift так само, як анімація властивості `top`',
        'Зсув через 100 мс після кліку по акордеону погіршує CLS так само, як пізнє завантаження реклами'
      ],
      answer: `
**Layout shift** — коли видимий елемент змінює стартову позицію між кадрами **без дії користувача**. Класика: читаєте текст, завантажилась реклама зверху — текст стрибнув, ви клікнули не туди.

**Як рахується:**
- Оцінка одного зсуву = **impact fraction × distance fraction** (яку частку viewport зачепили нестабільні елементи × на яку частку viewport вони зсунулись).
- Зсуви групуються у **session windows** (зсуви з інтервалом < 1 с, вікно максимум 5 с). **CLS = найбільше вікно** за весь час життя сторінки (тому довгі SPA-сесії не накопичують нескінченний CLS).
- Не рахуються зсуви протягом **500 мс після взаємодії** (клік, тап, клавіша) — вони очікувані. Анімації \`transform\` не викликають layout shift.

**Причини та рішення:**
| Причина | Рішення |
|---|---|
| Зображення/відео без розмірів | атрибути \`width\`/\`height\` (браузер виведе \`aspect-ratio\`) або CSS \`aspect-ratio\` |
| Реклама, ембеди, iframe, віджети | зарезервувати місце: \`min-height\` контейнера під найімовірніший розмір; не схлопувати слот, якщо реклама не прийшла |
| Контент, що вставляється над наявним (банери cookies, «завантажити застосунок», нотифікації) | показувати оверлеєм (\`position: fixed\`) або резервувати місце; вставляти нове лише нижче або після взаємодії |
| Веб-шрифти (FOUT: інша ширина/висота fallback-шрифту) | \`font-display: optional\`; preload шрифту; підгонка метрик fallback (\`size-adjust\`, \`ascent-override\`, \`descent-override\`) |
| Скелетони іншого розміру, ніж контент | скелетон тих самих розмірів |
| Анімації \`top\`/\`left\`/\`height\`/\`margin\` | анімувати \`transform\` і \`opacity\` |
| Пізній CSS / FOUC, клієнтський рендеринг, що змінює макет після гідрації | критичний CSS, SSR з тим самим макетом, однаковий рендер на сервері й клієнті |

**Приклад:**
\`\`\`css
img, video { max-width: 100%; height: auto; } /* + width/height атрибути в HTML */
.embed { aspect-ratio: 16 / 9; }
.ad-slot { min-height: 250px; }
\`\`\`

**Дебаг:** DevTools → Performance (доріжка Layout Shifts), Rendering → Layout Shift Regions (підсвічує зсуви), \`web-vitals/attribution\` (\`largestShiftTarget\`), PerformanceObserver з типом \`layout-shift\`.
`,
      correct: 0,
      why: [
        'Так: CLS — найгірше вікно зсувів (до 5 с), а очікувані зсуви після взаємодії не рахуються.',
        'CLS — не сума за все життя сторінки, а найбільше session window, тож довгі сесії його не накопичують.',
        '`transform` виконується на compositor і не змінює layout, тому зсувом не вважається.',
        'Зсуви протягом 500 мс після кліку очікувані й до CLS не входять.'
      ],
      keyPoints: [
        'Layout shift = impact fraction × distance fraction; CLS — найбільше session window',
        'Не рахуються зсуви протягом 500 мс після взаємодії та transform-анімації',
        'Зображення/відео: width/height або aspect-ratio',
        'Реклама/ембеди: зарезервований простір; не вставляти контент над наявним',
        'Шрифти: font-display: optional, preload, size-adjust; анімувати transform'
      ],
      followUps: [
        'Чому анімація transform не впливає на CLS?',
        'Як резервувати місце під рекламу невідомого розміру?',
        'Як знайти елемент, що дає найбільший зсув?'
      ]
    },
    {
      id: 'perf-fonts',
      group: 'cls',
      type: 'theory',
      level: 2,
      title: 'Оптимізація веб-шрифтів',
      tags: ['fonts', 'cls', 'lcp'],
      question: 'Як оптимізувати завантаження веб-шрифтів? Розкажіть про формати, subsetting, preload, font-display і як прибрати зсув макета при підміні шрифту.',
      choices: [
        '`font-display: block` — найкращий вибір для CLS: текст не показується, доки шрифт не завантажиться',
        '`crossorigin` у preload шрифту потрібен лише для сторонніх доменів, для свого — зайвий',
        'Зсув при підміні прибирають підгонкою fallback-шрифту через `size-adjust` і `ascent-override`',
        'Варто preload-ити всі начертання й ваги шрифтів, щоб жодне з них не завантажувалось пізно'
      ],
      answer: `
**Проблеми шрифтів:** вони виявляються пізно (браузер дізнається про файл лише після побудови CSSOM і знаходження тексту, що його використовує), блокують показ тексту (FOIT) або викликають зсув при підміні (FOUT → CLS), важать сотні КБ.

**1. Формат і розмір:**
- Лише **WOFF2** (стиснення Brotli всередині, підтримка скрізь). TTF/OTF/WOFF для вебу не потрібні.
- **Subsetting** — лише потрібні символи: \`unicode-range\` (браузер завантажить файл, лише якщо на сторінці є символи з діапазону; кирилиця і латиниця — окремі файли):
\`\`\`css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-cyrillic.woff2') format('woff2');
  unicode-range: U+0400-045F, U+0490-0491, U+2116;
  font-display: swap;
}
\`\`\`
- **Variable fonts** — один файл замість 6 начерток (якщо ви справді використовуєте багато ваг).
- Менше начерток: кожна вага/курсив — окремий файл.

**2. Раннє завантаження:**
\`\`\`html
<link rel="preload" href="/fonts/inter-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
\`\`\`
- \`crossorigin\` **обов'язковий** навіть для свого домену (шрифти завжди вантажаться в CORS-режимі), інакше файл завантажиться двічі.
- Preload лише 1–2 критичних шрифтів (основний текст), інакше конкуренція з LCP-ресурсом.
- **Self-hosting** замість Google Fonts: немає додаткового DNS/TCP/TLS до двох доменів, кеш не спільний між сайтами (cache partitioning), повний контроль над \`font-display\` і subset.

**3. \`font-display\`:**
| Значення | Поведінка |
|---|---|
| \`block\` | до ~3 с невидимий текст, потім підміна |
| \`swap\` | одразу fallback, підміна будь-коли пізніше |
| \`fallback\` | ~100 мс block, ~3 с swap, потім fallback назавжди |
| \`optional\` | ~100 мс block, без swap — найкраще для CLS |

**4. Прибрати зсув при підміні — підігнати метрики fallback-шрифту:**
\`\`\`css
@font-face {
  font-family: 'Inter Fallback';
  src: local('Arial');
  size-adjust: 107%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
body { font-family: 'Inter', 'Inter Fallback', sans-serif; }
\`\`\`
Тепер Arial займає майже стільки ж місця, скільки Inter, — підміна не зсуває текст. Next.js (\`next/font\`) і Nuxt генерують такі fallback автоматично; є інструменти на кшталт Fontaine/Capsize.

**5. Системні шрифти** (\`font-family: system-ui, sans-serif\`) — нуль байтів і нуль затримки; чудовий варіант для інтерфейсів і адмінок.
`,
      correct: 2,
      why: [
        '`block` ховає текст до ~3 с (гірший FCP/LCP), а пізня підміна все одно може зсунути макет.',
        'Шрифти завжди вантажаться в CORS-режимі: без `crossorigin` preload не збігається із запитом і файл качається двічі.',
        'Так: fallback із підігнаними метриками займає стільки ж місця, і підміна не зсуває текст.',
        'Preload усіх начерток конкурує з LCP-ресурсом; preload-ять 1–2 критичні файли.'
      ],
      keyPoints: [
        'WOFF2, subsetting через unicode-range, variable fonts, менше начерток',
        'preload as=font з crossorigin для 1–2 критичних шрифтів; self-hosting',
        'font-display: block/swap/fallback/optional і їх вплив на FCP/CLS',
        'size-adjust, ascent/descent-override для fallback без зсувів',
        'system-ui як варіант без витрат'
      ],
      followUps: [
        'Чому preload шрифту без crossorigin завантажує файл двічі?',
        'Чому self-hosting Google Fonts часто швидший?',
        'Як працює unicode-range?'
      ]
    },
    {
      id: 'perf-quiz-font-display',
      group: 'cls',
      type: 'quiz',
      level: 3,
      title: 'font-display і зсуви макета',
      tags: ['fonts', 'cls'],
      question: "Потрібно, щоб текст **одразу** з'являвся (без «невидимого тексту») і веб-шрифт **ніколи не викликав зсуву макета**, навіть якщо це означає, що при першому візиті на повільній мережі користувач побачить системний шрифт. Яке значення `font-display` обрати?",
      options: ['`block`', '`swap`', '`optional`', '`fallback`'],
      answer: 2,
      hint: 'Шукайте значення без «swap period» — вікна, у якому браузер підміняє fallback на веб-шрифт.',
      why: [
        '`block` ховає текст до ~3 с (FOIT), а пізня підміна все одно може зсунути макет.',
        '`swap` показує текст одразу, але веб-шрифт підміняється будь-коли пізніше — це і є зсув.',
        'Так: ~100 мс block і жодного swap — не встиг шрифт, лишається fallback, зсуву немає.',
        '`fallback` має ~3 с swap period — шрифт, що прийшов у цьому вікні, зсуне текст.'
      ],
      explanation: `
\`optional\` — найкращий вибір для CLS: якщо шрифт не встиг за ~100 мс, сторінка до кінця використовує fallback, а файл лягає в кеш для наступних переходів. Разом із \`preload\` шрифт часто встигає навіть на першому візиті.
`
    },
    {
      id: 'perf-cls-reserve-space',
      group: 'cls',
      type: 'dom',
      level: 2,
      title: 'Прибрати CLS: зарезервувати місце під рекламу і відео',
      tags: ['cls', 'aspect-ratio', 'css'],
      description: `
**Завдання.** Змініть **лише CSS** так, щоб місце під рекламу і відео було зарезервоване заздалегідь і текст статті не «стрибав», коли вони довантажаться.

**Де трапляється:** новинні сайти, блоги, лендинги з рекламою та YouTube-ембедами — найчастіше джерело поганого CLS. На співбесіді — «як прибрати зсув від реклами/відео».

**Що є в HTML**
- \`.page\` — стаття шириною 640px;
- \`#ad.ad-slot\` — порожній слот; скрипт пізніше вставить у нього банер **300×250**;
- \`#video.video\` — порожній контейнер; скрипт пізніше вставить у нього \`<iframe>\`;
- \`p.content\` — текст статті.

**Що зробити (CSS)**
1. \`.ad-slot\` — **рівно 250px** заввишки і до, і після вставки банера.
2. \`.video\` — пропорції **16:9** від своєї ширини (на 640px це 360px) ще до появи iframe; без захардкодженої висоти — на будь-якій ширині.
3. \`.video iframe\` — **повністю заповнює** контейнер і не змінює його розмір.

**Приклад**
\`\`\`text
до:     [ad 0px][video 0px][текст]       → після вставки текст з'їжджає на ~610px вниз
після:  [ad 250px][video 360px][текст]   → вставка лише заповнює місце, текст стоїть
\`\`\`

**Як це працює:** зсув виникає, коли браузер дізнається розмір блоку лише з приходом вмісту. Якщо розмір відомий з CSS заздалегідь, вставка вмісту нічого нижче не рухає. \`aspect-ratio\` обчислює висоту з ширини, а абсолютно позиціонований iframe не впливає на розмір батька.

**Врахуйте:**
- тести перевіряють і ширину 320px (висота відео має стати 180px);
- iframe за замовчуванням 300×150 — він не повинен розтягнути чи стиснути контейнер.
`,
      html: `<article class="page">
  <div class="ad-slot" id="ad"></div>
  <div class="video" id="video"></div>
  <p class="content">Основний текст статті. Користувач починає читати його одразу, і він не повинен «стрибати», коли догрузиться реклама чи відео.</p>
</article>`,
      css: `.page {
  width: 640px;
  font: 16px/1.5 sans-serif;
}
.ad-slot {
  background: #f1f1f1;
  /* 1. TODO: зарезервуйте висоту під банер 300x250 */
}
.video {
  background: #000;
  /* 2. TODO: пропорції 16:9 від ширини + точка відліку для iframe */
}
.video iframe {
  border: 0;
  /* 3. TODO: заповнити контейнер повністю, не впливаючи на його розмір */
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.page {
  width: 640px;
  font: 16px/1.5 sans-serif;
}
.ad-slot {
  background: #f1f1f1;
  min-height: 250px; /* місце під банер 300x250 зарезервовано заздалегідь */
}
.video {
  background: #000;
  position: relative;
  aspect-ratio: 16 / 9; /* висота виводиться з ширини */
}
.video iframe {
  border: 0;
  position: absolute; /* абсолютний вміст не впливає на розмір контейнера */
  inset: 0;
  width: 100%;
  height: 100%;
}
`
      },
      hints: [
        'Для слота реклами достатньо `min-height` під очікуваний розмір банера.',
        'Для відео — `aspect-ratio: 16 / 9` на контейнері. Так висота залежить від ширини, а не захардкоджена.',
        'Щоб iframe заповнив контейнер і не впливав на його розмір: `position: relative` на `.video` і `position: absolute; inset: 0; width: 100%; height: 100%` на iframe.'
      ],
      tests: [
        { name: 'слот реклами резервує 250px до завантаження', code: "expect(Math.round(rect('#ad').height)).toBe(250);" },
        { name: 'відео має пропорції 16:9 до завантаження', code: "const r = rect('#video');\nexpect(Math.round(r.width)).toBe(640);\nexpect(Math.abs(r.height - r.width * 9 / 16)).toBeLessThan(1);" },
        { name: 'пропорції не захардкоджені (працюють на іншій ширині)', code: "const page = $('.page');\npage.style.width = '320px';\nconst r = rect('#video');\nexpect(Math.abs(r.height - 180)).toBeLessThan(1);\npage.style.width = '';" },
        { name: 'текст не зсувається після вставки реклами і відео', code: "const before = rect('.content').top;\nconst ad = document.createElement('div');\nad.style.cssText = 'width:300px;height:250px;background:#fc0';\n$('#ad').append(ad);\nconst frame = document.createElement('iframe');\n$('#video').append(frame);\nawait nextFrame();\nexpect(Math.abs(rect('.content').top - before)).toBeLessThan(0.5);\nexpect(Math.round(rect('#ad').height)).toBe(250);" },
        { name: 'iframe повністю заповнює контейнер відео', code: "const frame = $('#video iframe') || $('#video').appendChild(document.createElement('iframe'));\nconst f = rect(frame), v = rect('#video');\nexpect(Math.abs(f.width - v.width)).toBeLessThan(1);\nexpect(Math.abs(f.height - v.height)).toBeLessThan(1);\nexpect(Math.abs(f.top - v.top)).toBeLessThan(1);" }
      ],
      explanation: `
**Принцип:** розмір блоку має бути відомий **до** приходу вмісту — тоді вставка лише заповнює місце.

- \`min-height\` для реклами; при різних розмірах банерів резервують найімовірніший і не схлопують слот, якщо реклама не прийшла.
- \`aspect-ratio: 16 / 9\` — сучасна заміна хаку \`padding-top: 56.25%\` (відсоток padding рахується від ширини батька).
- Абсолютний iframe з \`inset: 0\` не впливає на розмір контейнера.
- Для \`<img>\` той самий ефект дають атрибути \`width\`/\`height\`.

**Перевірка на практиці:** DevTools → Rendering → Layout Shift Regions, доріжка Layout Shifts у Performance.

**Далі можуть спитати:** що робити з cookie-банером, який з'являється зверху? Як резервувати місце під рекламу невідомого розміру?
`
    },
    {
      id: 'perf-resource-hints',
      group: 'loading',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Resource hints: preload, prefetch, preconnect, fetchpriority',
      tags: ['resource-hints', 'loading'],
      question: 'Які resource hints ви знаєте? Чим preload відрізняється від prefetch? Коли використовувати preconnect і dns-prefetch? Що таке fetchpriority і Speculation Rules?',
      choices: [
        '`prefetch` — ресурс поточної сторінки з високим пріоритетом; `preload` — для наступної навігації',
        '`preload` — ресурс поточної сторінки з високим пріоритетом; `prefetch` — для наступної навігації',
        '`dns-prefetch` робить DNS + TCP + TLS, тому його ставлять замість `preconnect` для критичних origin',
        '`fetchpriority="high"` змушує браузер виявити ресурс раніше, ніж його знайде preload scanner'
      ],
      answer: `
| Підказка | Що робить | Коли |
|---|---|---|
| \`dns-prefetch\` | лише DNS-резолвінг | некритичні сторонні origin; дешево, можна багато |
| \`preconnect\` | DNS + TCP + TLS заздалегідь | 2–4 **критичні** сторонні origin (CDN зображень, шрифтів, API); дороге — не зловживати |
| \`preload\` | завантажити ресурс **поточної** сторінки з високим пріоритетом | ресурси, які браузер знайде пізно: шрифти з CSS, фонове LCP-зображення, критичний скрипт, підвантажуваний іншим скриптом |
| \`modulepreload\` | preload + парсинг ES-модуля (і, у Chromium, залежностей) | критичні модулі/чанки |
| \`prefetch\` | завантажити з **низьким** пріоритетом у кеш для **наступної** навігації | чанк наступного кроку (checkout після кошика) |
| Speculation Rules | \`prefetch\` / **prerender** наступних сторінок цілком | миттєві переходи (Chromium) |

\`\`\`html
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
<link rel="dns-prefetch" href="https://analytics.example.com">
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="/hero.avif" fetchpriority="high">
<link rel="modulepreload" href="/assets/app-3f9a.js">
<link rel="prefetch" href="/assets/checkout-a1b2.js">
<script type="speculationrules">
{ "prerender": [{ "where": { "href_matches": "/product/*" }, "eagerness": "moderate" }] }
</script>
\`\`\`

**Нюанси \`preload\`:**
- Обов'язковий \`as\` (інакше неправильний пріоритет і повторне завантаження), для шрифтів — \`crossorigin\` (CORS-режим).
- Завантажений, але не використаний за ~3 с ресурс — попередження в консолі: ви вкрали пропускну здатність у справді критичних ресурсів.
- Не preload-ити те, що й так є в HTML (\`<img src>\`, \`<script src>\` — їх знаходить preload scanner).

**\`fetchpriority\`** (\`high\`/\`low\`/\`auto\`) — підказка пріоритету без зміни моменту виявлення: \`<img fetchpriority="high">\` для LCP-героя, \`low\` для зображень у прихованих слайдах каруселі, \`fetch(url, { priority: 'low' })\` для фонових запитів.

**Через заголовок:** \`Link: </app.css>; rel=preload; as=style\` — і в \`103 Early Hints\`, щоб браузер почав завантаження ще до отримання HTML.

**Пастки:** забагато preconnect (кожен відкриває з'єднання, яке закривається через ~10 с без використання), preload усього підряд (усе «важливе» = нічого не важливе), \`prefetch\` на мобільному трафіку користувача (поважайте \`navigator.connection.saveData\`), prerender сторінок з побічними ефектами (аналітика, кошик) без обробки \`document.prerendering\`.
`,
      correct: 1,
      why: [
        'Переплутано місцями: prefetch — для наступної навігації з низьким пріоритетом.',
        'Так: preload — ресурс цієї сторінки з високим пріоритетом, prefetch — на майбутнє.',
        '`dns-prefetch` робить лише DNS; DNS+TCP+TLS — це `preconnect`.',
        '`fetchpriority` змінює лише пріоритет, а не момент, коли браузер дізнається про ресурс.'
      ],
      keyPoints: [
        'dns-prefetch (лише DNS) vs preconnect (DNS+TCP+TLS) для критичних origin',
        "preload — поточна сторінка, високий пріоритет, обов'язковий as (+crossorigin для шрифтів)",
        'prefetch — наступна навігація, низький пріоритет',
        'modulepreload, fetchpriority, Speculation Rules (prerender)',
        'Пастки: зловживання preload/preconnect, невикористаний preload'
      ],
      followUps: [
        'Чому preload шрифту без crossorigin не працює?',
        'Що таке preload scanner?',
        'Які ризики має prerender?'
      ]
    },
    {
      id: 'perf-quiz-preload',
      group: 'loading',
      type: 'quiz',
      level: 2,
      title: 'Шрифт, знайдений пізно',
      tags: ['resource-hints', 'fonts'],
      question: 'Основний шрифт підключений через `@font-face` у CSS-файлі. Він потрібен для тексту першого екрана **поточної** сторінки, але в waterfall видно, що його завантаження стартує лише після CSS. Що додати в `<head>`?',
      options: [
        '`<link rel="preload" href="/f.woff2" as="font" type="font/woff2" crossorigin>`',
        '`<link rel="prefetch" href="/f.woff2">`',
        '`<link rel="preconnect" href="/f.woff2">`',
        '`<link rel="dns-prefetch" href="/f.woff2">`'
      ],
      answer: 0,
      hint: 'Ресурс потрібен саме цій сторінці і якнайшвидше; домен той самий.',
      why: [
        "Так: preload вантажить ресурс цієї сторінки одразу з `<head>`; `crossorigin` обов'язковий, бо шрифти йдуть у CORS-режимі.",
        '`prefetch` — для наступних навігацій з найнижчим пріоритетом: шрифт прийде запізно.',
        "`preconnect` приймає origin, а не файл, і нічого не завантажує; домен той самий — з'єднання вже є.",
        '`dns-prefetch` лише резолвить DNS для origin і файл не завантажує.'
      ],
      explanation: `
Шрифт з \`@font-face\` браузер знаходить лише після CSSOM і тексту, що його використовує. \`preload\` з \`as="font"\` переносить старт завантаження на момент розбору \`<head>\`. Без \`crossorigin\` запит не збігається з preload, і файл завантажиться двічі.
`
    },
    {
      id: 'perf-js-cost',
      group: 'loading',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Вартість JavaScript: code splitting, tree shaking, аналіз бандла',
      tags: ['javascript', 'bundle', 'code-splitting', 'tree-shaking'],
      question: 'Чому JavaScript — «найдорожчий» ресурс? Як зменшити його вплив: code splitting, dynamic import, tree shaking, аналіз бандла, сторонні скрипти? Оберіть **усі** правильні твердження.',
      choices: [
        '200 КБ JS і 200 КБ JPEG коштують приблизно однаково — важить лише розмір файлу в мережі',
        'JS треба не лише завантажити, а й розпарсити, скомпілювати та виконати на головному потоці',
        '`async` виконує скрипти по порядку після парсингу HTML, а `defer` — одразу після завантаження',
        'Tree shaking працює лише зі статичними ESM; CommonJS (`require`) бандлер статично не проаналізує',
        '`"sideEffects": false` у `package.json` дозволяє бандлеру викидати невикористані модулі цілком'
      ],
      answer: `
**Чому JS дорожчий за картинку того ж розміру:** 200 КБ JPEG треба лише декодувати (часто поза головним потоком). 200 КБ JS (≈ 1 МБ розпакованого коду) треба **завантажити → розпарсити → скомпілювати → виконати** на головному потоці. На бюджетному Android це в 3–5 разів повільніше, ніж на MacBook розробника. Наслідки: пізній LCP (CSR), поганий INP (long tasks гідрації), споживання пам'яті й батареї.

**1. Code splitting — вантажити лише потрібне зараз:**
- **За маршрутами** (найбільший виграш): кожна сторінка — окремий чанк.
- **За компонентами**: модалки, редактори, графіки, карти — те, що не потрібне на першому екрані.
\`\`\`js
const Chart = React.lazy(() => import('./Chart'));       // React
button.addEventListener('click', async () => {
  const { exportToPdf } = await import('./pdf-export');  // за дією користувача
  exportToPdf(data);
});
\`\`\`
- Вантажити наперед, щоб не було затримки при кліку: \`prefetch\` під час простою, при hover/focus на посиланні, \`modulepreload\` для критичних чанків.
- Не дробити надміру: сотні дрібних чанків = накладні витрати й гірше стиснення.

**2. Tree shaking — видалення невикористаних експортів:**
- Працює лише зі **статичними ESM** (\`import\`/\`export\`); CommonJS (\`require\`, \`module.exports\`) аналізувати статично неможливо.
- \`"sideEffects": false\` (або список файлів з побічними ефектами, наприклад CSS) у \`package.json\` — дозволяє бандлеру викидати модулі цілком.
- Не перетворювати ESM в CJS Babel-ом до бандлера; уникати \`import * as x\` з динамічним доступом \`x[name]\`; \`/*#__PURE__*/\` анотації.
- Обирати модульні бібліотеки: \`lodash-es\` / окремі функції замість \`lodash\`, \`date-fns\`/\`Intl\` замість \`moment\`.

**3. Аналіз і контроль:**
- \`rollup-plugin-visualizer\` (Vite), \`webpack-bundle-analyzer\`, \`source-map-explorer\` — що займає місце, дублікати версій.
- DevTools → Coverage — скільки завантаженого коду реально виконалось.
- **Бюджети**: \`size-limit\`, bundlesize у CI, Lighthouse CI — PR не пройде, якщо бандл виріс понад ліміт.
- Сучасні таргети (\`browserslist\` без IE): менше транспіляції й поліфілів.

**4. Сторонні скрипти (аналітика, чати, реклама, A/B):**
- \`async\`/\`defer\`, завантаження після \`load\` або взаємодії, **facade**-патерн (картинка-заглушка замість YouTube/чат-віджета до кліку), Partytown (переносить у Web Worker), регулярний аудит — часто це найбільший шматок JS.

**5. Архітектурні рішення:** SSR/SSG + часткова/прогресивна гідрація, islands (Astro), React Server Components — менше JS у браузері взагалі.

**Завантаження скриптів:** \`defer\` — не блокує парсер, виконується по порядку після парсингу HTML; \`async\` — виконується одразу після завантаження, без порядку (для незалежних скриптів); \`type="module"\` — поводиться як defer.
`,
      correct: [1, 3, 4],
      why: [
        'JPEG лише декодується (часто поза головним потоком), а JS ще парситься, компілюється і виконується.',
        'Так: саме тому 200 КБ JS на слабкому Android — це секунди роботи головного потоку.',
        'Навпаки: `defer` — по порядку після парсингу HTML, `async` — одразу після завантаження, без порядку.',
        'Так: `import`/`export` статичні, а `require` може стояти будь-де з обчисленим шляхом.',
        'Так: прапорець обіцяє, що модулі без використаних експортів можна викинути цілком.'
      ],
      keyPoints: [
        'Вартість JS: завантаження + парсинг + компіляція + виконання на головному потоці; слабкі пристрої',
        'Code splitting за маршрутами і компонентами, dynamic import(), prefetch/modulepreload',
        'Tree shaking: ESM, sideEffects, без CJS-транспіляції, модульні бібліотеки',
        'Аналіз бандла, Coverage, бюджети в CI',
        'Сторонні скрипти: async/defer, facade, відкладене завантаження',
        'SSR/islands/RSC — менше JS у браузері'
      ],
      followUps: [
        'Чому CommonJS заважає tree shaking?',
        'Як уникнути затримки при першому відкритті lazy-маршруту?',
        'Чим async відрізняється від defer?'
      ]
    },
    {
      id: 'perf-quiz-tree-shaking',
      group: 'loading',
      type: 'quiz',
      level: 3,
      title: 'Що заважає tree shaking',
      tags: ['tree-shaking', 'bundle'],
      question: 'Оберіть **усі** ситуації, які заважають бандлеру (Rollup/Vite, webpack) видалити невикористаний код:',
      options: [
        'Бібліотека поставляється лише у CommonJS (`module.exports`, `require`)',
        "Іменований імпорт `import { debounce } from 'lodash-es'`",
        'Модуль має побічні ефекти на верхньому рівні, а в `package.json` немає `"sideEffects": false`',
        "Динамічний доступ до експорту: `import * as utils from './utils'; utils[name]()`",
        "Babel налаштовано з `modules: 'commonjs'`, тож ESM перетворюється на CJS ще до бандлера"
      ],
      answer: [0, 2, 3, 4],
      hint: 'Tree shaking — це статичний аналіз. Що робить аналіз неможливим або небезпечним?',
      why: [
        'Так: `require`/`module.exports` динамічні — статично довести, що експорт не потрібен, неможливо.',
        'Іменований імпорт з ESM-пакета — ідеальний випадок для tree shaking (на відміну від CJS-пакета `lodash`).',
        "Так: модуль може патчити глобальні об'єкти при імпорті — без `sideEffects` бандлер мусить його залишити.",
        "Так: ім'я експорту відоме лише під час виконання, тому лишаються всі експорти.",
        'Так: бандлер отримує вже CommonJS і втрачає статичну структуру; для бандлерів — `modules: false`.'
      ],
      explanation: `
Tree shaking — це статичний аналіз \`import\`/\`export\`. Усе, що робить структуру модулів динамічною (CJS, обчислені імена) або ризикованою (побічні ефекти без позначки), змушує бандлер залишати код.
`
    },
    {
      id: 'perf-sw-strategies',
      group: 'loading',
      type: 'theory',
      level: 3,
      title: 'Service Worker: стратегії кешування',
      tags: ['service-worker', 'caching', 'offline'],
      question: 'Які стратегії кешування в Service Worker ви знаєте? Яку стратегію обрати для HTML, статики з хешем, API, зображень? Які підводні камені оновлення Service Worker? Оберіть **усі** правильні твердження.',
      choices: [
        'Статику з хешем в імені файлу віддають за стратегією cache first',
        'HTML-навігацію найкраще віддавати cache first — так сайт відкривається миттєво і працює офлайн',
        'Новий SW чекає у стані `waiting`, доки не закриються вкладки зі старим; безпечно — банер «Оновити»',
        '`skipWaiting()` + `clients.claim()` — повністю безпечний спосіб оновлення без жодних ризиків',
        'Stale-while-revalidate миттєво віддає кеш і у фоні оновлює його — добре для аватарів і некритичних API'
      ],
      answer: `
**Service Worker** — скрипт-проксі між сторінкою і мережею: перехоплює \`fetch\` у своєму scope і вирішує, звідки взяти відповідь (Cache API, мережа або згенерувати). Працює лише по HTTPS, має власний життєвий цикл (\`install\` → \`activate\` → \`fetch\`).

**Стратегії:**
| Стратегія | Як | Для чого |
|---|---|---|
| **Cache first** | кеш → якщо немає, мережа (і покласти в кеш) | статика з хешем в імені, шрифти, іконки |
| **Network first** | мережа → при помилці/таймауті кеш | HTML-навігація, API, де важлива актуальність, але потрібен офлайн |
| **Stale-while-revalidate** | миттєво з кешу + фоновий запит оновлює кеш | аватари, некритичні API, конфіги, статті |
| **Network only** | лише мережа | POST, платежі, аналітика |
| **Cache only** | лише кеш | precache app shell |

\`\`\`js
// stale-while-revalidate
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open('runtime-v1');
    const cached = await cache.match(event.request);
    const network = fetch(event.request).then((res) => {
      if (res.ok) cache.put(event.request, res.clone()); // тіло можна прочитати лише раз
      return res;
    });
    if (cached) {
      event.waitUntil(network.catch(() => {})); // оновлення у фоні
      return cached;
    }
    return network;
  })());
});
\`\`\`

**Precaching** — у \`install\` завантажити app shell (HTML, головні чанки) з версією; у \`activate\` видалити старі кеші. Workbox генерує маніфест з хешами автоматично.

**Підводні камені:**
- **Cache first для HTML** = користувачі застрягають на старій версії назавжди. HTML — network first або SWR з механізмом «доступна нова версія».
- **Оновлення:** новий SW чекає (\`waiting\`), поки закриються всі вкладки зі старим. \`skipWaiting()\` + \`clients.claim()\` пришвидшують, але сторінка може опинитися зі старим HTML і новим SW, який не має старих чанків → ChunkLoadError. Безпечніше — показати банер «Оновити» і перезавантажити.
- Файл \`sw.js\` не кешувати HTTP-кешем надовго (браузер перевіряє його не рідше ніж раз на 24 год, але краще \`no-cache\`).
- **Опаки-відповіді** (\`no-cors\` сторонніх ресурсів) займають багато квоти й можуть бути помилками — не кешуйте їх cache-first.
- Квоти сховища, очищення старих записів (expiration plugin), не кешувати персональні відповіді між користувачами (logout!).
- **Navigation preload** — запускає мережевий запит навігації паралельно із запуском SW (інакше старт SW додає затримку до TTFB).
`,
      correct: [0, 2, 4],
      why: [
        'Так: файл з хешем в імені ніколи не змінюється, тож кеш завжди актуальний.',
        'Cache first для HTML залишає користувачів на старій версії; HTML — network first або SWR з оновленням.',
        'Так: новий SW активується після закриття старих вкладок; банер «Оновити» дає контрольоване перезавантаження.',
        'Старий HTML з новим SW може не знайти старих чанків (ChunkLoadError) — ризик є.',
        "Так: користувач одразу бачить кеш, а свіжа версія з'явиться наступного разу."
      ],
      keyPoints: [
        'SW — програмований проксі: install/activate/fetch, лише HTTPS',
        'Стратегії: cache first, network first, stale-while-revalidate, network/cache only',
        'Відповідність ресурсам: хешована статика — cache first; HTML — network first; API — SWR/network first',
        'Precache з версіонуванням і очищенням старих кешів',
        'Оновлення: waiting, skipWaiting/clients.claim ризики, банер «Оновити»',
        'Пастки: cache-first HTML, opaque-відповіді, персональні дані, navigation preload'
      ],
      followUps: [
        'Чому новий Service Worker не активується одразу?',
        'Що таке navigation preload?',
        'Як реалізувати офлайн-сторінку?'
      ]
    },
    {
      id: 'perf-quiz-long-task',
      group: 'inp',
      type: 'quiz',
      level: 2,
      title: 'Що таке long task',
      tags: ['long-tasks', 'inp'],
      question: 'Що в термінах Long Tasks API і Web Vitals називають **long task**?',
      options: [
        'Будь-яку задачу довшу за 16 мс (тривалість кадру при 60 Гц)',
        'Мережевий запит, що виконується довше 100 мс',
        'Обробник події, що виконується довше 200 мс',
        'Задачу на головному потоці, що виконується довше 50 мс'
      ],
      answer: 3,
      hint: 'Поріг саме цієї величини використовується і в розрахунку TBT.',
      why: [
        '16.7 мс — бюджет кадру при 60 Гц, важливий для анімацій, але це не визначення long task.',
        'Мережевий запит виконується браузером асинхронно і головний потік не блокує.',
        '200 мс — поріг good для INP, а не межа long task.',
        'Так: задача головного потоку понад 50 мс блокує ввід і рендеринг.'
      ],
      explanation: `
Поки long task виконується, браузер не обробляє ввід і не малює кадри. Поріг 50 мс використовують Long Tasks API і TBT: TBT — сума «надлишків» понад 50 мс усіх long tasks під час завантаження.
`
    },
    {
      id: 'perf-inp',
      group: 'inp',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'INP: long tasks і як розвантажити головний потік',
      tags: ['inp', 'long-tasks', 'main-thread'],
      question: 'Що таке INP і з чого він складається? Що таке long task? Як знайти і виправити повільні взаємодії? Оберіть **усі** правильні твердження.',
      choices: [
        'INP враховує лише першу взаємодію на сторінці, як і FID, але міряє її повну тривалість',
        'INP складається з input delay, processing time і presentation delay до наступного кадру',
        '`requestIdleCallback` — найкращий спосіб відкласти роботу, від якої залежить відгук на клік',
        'Long task — задача на головному потоці довша за 50 мс, що блокує обробку вводу й рендеринг',
        'Скрол і hover теж враховуються в INP, тому важкі `scroll`-обробники напряму його погіршують'
      ],
      answer: `
**INP (Interaction to Next Paint)** — час від взаємодії (клік, тап, клавіша) до **наступного кадру**, у якому користувач бачить реакцію. Протягом візиту реєструються всі взаємодії, звітується одна з найгірших (на сторінках з великою кількістю взаємодій ігнорується по одному викиду на кожні 50). Good ≤ 200 мс.

**Три фази однієї взаємодії:**
1. **Input delay** — подія чекає, поки головний потік звільниться (виконується інша задача: гідрація, аналітика, таймер).
2. **Processing time** — виконання ваших обробників (\`pointerdown\`, \`click\`, \`keydown\`…).
3. **Presentation delay** — після обробників: перерахунок стилів, layout, paint, композитинг наступного кадру (великий DOM, layout thrashing).

**Long task** — задача на головному потоці **> 50 мс**. Поки вона виконується, браузер не може обробити ввід і відмалювати кадр.

**Як знайти:**
- Field: \`web-vitals/attribution\` → \`onINP\` дає \`interactionTarget\`, тип події, розбивку на три фази, а з **Long Animation Frames (LoAF)** — які скрипти винні.
- Lab: DevTools Performance (запис взаємодії з 4–6x CPU throttling), доріжка Interactions, червоні трикутники long tasks; Performance panel показує live INP.

**Як виправити:**
- **Розбивати довгі задачі і поступатися потоком (yield):**
\`\`\`js
async function yieldToMain() {
  if (globalThis.scheduler?.yield) return scheduler.yield(); // продовження з пріоритетом
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function onSaveClick() {
  showSpinner();          // 1. миттєвий візуальний відгук
  await yieldToMain();    // 2. дати браузеру відмалювати кадр
  validateForm();
  await yieldToMain();
  sendAnalytics();        // 3. некритичне — пізніше
}
\`\`\`
  \`scheduler.yield()\` (Chromium, Firefox) ставить продовження **попереду** інших задач, тоді як \`setTimeout\` — у кінець черги. \`scheduler.postTask(fn, { priority: 'background' })\` — для фонових задач.
- **Спершу візуальний відгук, потім робота**: оновити UI, а важке/аналітику — після кадру (\`requestAnimationFrame\` + \`setTimeout\`, або yield).
- **Менше роботи в обробнику**: debounce пошуку при вводі, мемоізація, уникати синхронного \`JSON.parse\` великих даних, не перераховувати весь стан.
- **Web Workers** для важких обчислень (парсинг, фільтрація 100k рядків, криптографія, обробка зображень) — головний потік вільний.
- **Presentation delay**: менший DOM (віртуалізація, \`content-visibility: auto\`), без layout thrashing (не змішувати читання й запис геометрії), CSS-анімації \`transform\`/\`opacity\`, менше перерендерів (React: \`memo\`, \`startTransition\`/\`useDeferredValue\` для неспішних оновлень).
- **Input delay**: зменшити JS при завантаженні (гідрація — головне джерело на старті), відкласти сторонні скрипти, розбити init-код.

**Пастка:** \`requestIdleCallback\` для роботи, від якої залежить відгук на взаємодію, не підходить — він може не виконатися довго на завантаженому потоці.
`,
      correct: [1, 3],
      hint: 'Розкладіть затримку взаємодії на три фази і для кожної назвіть причину та техніку.',
      why: [
        'INP враховує всі взаємодії за візит і звітує одну з найгірших, а не першу.',
        'Так: очікування потоку, виконання обробників і рендер наступного кадру.',
        '`requestIdleCallback` може довго не викликатися на завантаженому потоці — для відгуку на клік не підходить.',
        'Так: поки триває така задача, ввід і кадри чекають.',
        'Скрол і hover в INP не входять — лише клік, тап і клавіатура.'
      ],
      keyPoints: [
        'INP — від взаємодії до наступного кадру, одна з найгірших за візит; good ≤ 200 мс',
        'Три фази: input delay, processing time, presentation delay',
        'Long task > 50 мс блокує ввід і рендеринг',
        'Діагностика: web-vitals attribution, LoAF, DevTools з CPU throttling',
        'Yield: scheduler.yield / setTimeout; спершу відгук, потім робота; Web Workers',
        'Presentation delay: менший DOM, без layout thrashing, startTransition'
      ],
      followUps: [
        'Чим scheduler.yield() кращий за setTimeout(0)?',
        'Чому гідрація погіршує INP на старті сторінки?',
        'Як React 18+ допомагає з INP?'
      ]
    },
    {
      id: 'perf-chunked',
      group: 'inp',
      type: 'code',
      level: 3,
      title: 'Обробка великого масиву частинами з yield',
      tags: ['inp', 'long-tasks', 'timers', 'async'],
      description: `
**Завдання.** Обробіть великий масив частинами, поступаючись головним потоком між ними, щоб сторінка не «замерзала» і реагувала на кліки.

**Де трапляється:** клієнтська фільтрація чи форматування 100 000 рядків таблиці, імпорт великого CSV, підсвітка синтаксису. На співбесіді — «як розбити long task і покращити INP».

**Що написати**
- \`yieldToMain()\` → проміс, що виконується через \`setTimeout(..., 0)\` (допоміжна).
- \`processInChunks(items, fn, { chunkSize = 100 } = {})\` → проміс масиву результатів \`fn(item, index)\` **у тому самому порядку**.

**Приклад**
\`\`\`js
const rows = await processInChunks(rawRows, (row, i) => formatRow(row, i), { chunkSize: 500 });
// 100 000 рядків → 200 частин по 500; між частинами браузер малює кадри й обробляє кліки

await processInChunks([1, 2, 3, 4, 5], (x) => x * 2, { chunkSize: 2 });
// частини [1,2] → yield → [3,4] → yield → [5]  ⇒  [2, 4, 6, 8, 10]
\`\`\`

**Як це працює:** \`await yieldToMain()\` ставить продовження функції новою макрозадачею в кінець черги. Перш ніж до неї дійде черга, браузер встигає обробити ввід і відмалювати кадр — одна задача на 2 с перетворюється на 200 задач по ~10 мс. \`await Promise.resolve()\` так **не** працює: мікрозадачі виконуються до рендерингу.

**Врахуйте:**
- перша частина обробляється одразу, без таймера;
- після останньої частини зайвого yield немає (усе в одній частині — жодного таймера);
- \`fn\` кинула помилку → проміс відхиляється, решта елементів не обробляється;
- використовуйте саме \`setTimeout\` (тести керують фейковими таймерами);
- порожній масив → \`[]\`.
`,
      starter: `function yieldToMain() {
  // TODO: поверніть проміс, що виконається через setTimeout(..., 0)
}

async function processInChunks(items, fn, { chunkSize = 100 } = {}) {
  const results = [];
  // 1. Зовнішній цикл: start = 0, chunkSize, 2 * chunkSize, ...
  // 2. Перед кожною частиною, КРІМ першої, — await yieldToMain()
  // 3. Внутрішній цикл по частині: results[i] = fn(items[i], i)
  // TODO
  return results;
}

// Спробуйте в консолі:
// await processInChunks([1, 2, 3, 4, 5], (x) => x * 2, { chunkSize: 2 })
`,
      solution: `function yieldToMain() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function processInChunks(items, fn, { chunkSize = 100 } = {}) {
  const results = new Array(items.length);

  for (let start = 0; start < items.length; start += chunkSize) {
    // поступаємося потоком МІЖ частинами: браузер встигне обробити ввід і відмалювати кадр
    if (start > 0) await yieldToMain();

    const end = Math.min(start + chunkSize, items.length);
    for (let i = start; i < end; i++) {
      results[i] = fn(items[i], i); // помилка відхилить проміс і зупинить обробку
    }
  }
  return results;
}
`,
      hints: [
        'Зовнішній цикл іде кроком `chunkSize`, внутрішній обробляє одну частину синхронно.',
        'Yield — це `await new Promise(r => setTimeout(r, 0))`. Робіть його **перед** кожною частиною, крім першої, — тоді після останньої зайвого очікування не буде.',
        'Результати пишіть за індексом у заздалегідь створений масив — так зберігається порядок.'
      ],
      tests: [
        { name: 'обробляє частинами і поступається потоком між ними', code: 'useFakeTimers();\nconst fn = mockFn((x) => x * 2);\nconst p = processInChunks([1, 2, 3, 4, 5, 6, 7], fn, { chunkSize: 3 });\nawait flushPromises();\nexpect(fn).toHaveBeenCalledTimes(3);\nexpect(getTimerCount()).toBe(1);\nadvanceTimersByTime(0); await flushPromises();\nexpect(fn).toHaveBeenCalledTimes(6);\nadvanceTimersByTime(0); await flushPromises();\nexpect(fn).toHaveBeenCalledTimes(7);\nawait expect(p).resolves.toEqual([2, 4, 6, 8, 10, 12, 14]);\nexpect(getTimerCount()).toBe(0);' },
        { name: 'одна частина — без жодного таймера', code: "useFakeTimers();\nconst p = processInChunks(['a', 'b'], (x) => x.toUpperCase(), { chunkSize: 5 });\nawait flushPromises();\nexpect(getTimerCount()).toBe(0);\nawait expect(p).resolves.toEqual(['A', 'B']);" },
        { name: 'порожній масив', code: 'useFakeTimers();\nconst fn = mockFn();\nawait expect(processInChunks([], fn)).resolves.toEqual([]);\nexpect(fn).not.toHaveBeenCalled();' },
        { name: 'передає індекс і зберігає порядок', code: "useFakeTimers();\nconst fn = mockFn((x, i) => x + i);\nconst p = processInChunks(['a', 'b', 'c'], fn, { chunkSize: 2 });\nawait flushPromises();\nadvanceTimersByTime(0); await flushPromises();\nawait expect(p).resolves.toEqual(['a0', 'b1', 'c2']);\nexpect(fn.mock.calls[1]).toEqual(['b', 1]);" },
        { name: 'chunkSize за замовчуванням — 100', code: 'useFakeTimers();\nconst fn = mockFn((x) => x);\nconst p = processInChunks(Array.from({ length: 250 }, (_, i) => i), fn);\nawait flushPromises();\nexpect(fn).toHaveBeenCalledTimes(100);\nfor (let i = 0; i < 3; i++) { advanceTimersByTime(0); await flushPromises(); }\nexpect((await p).length).toBe(250);' },
        { name: 'помилка відхиляє проміс і зупиняє обробку', code: "useFakeTimers();\nconst fn = mockFn((x) => { if (x === 4) throw new Error('bad item'); return x; });\nconst p = processInChunks([1, 2, 3, 4, 5, 6], fn, { chunkSize: 2 });\np.catch(() => {});\nfor (let i = 0; i < 5; i++) { await flushPromises(); advanceTimersByTime(0); }\nawait expect(p).rejects.toThrow('bad item');\nexpect(fn).toHaveBeenCalledTimes(4);" },
        { name: 'великий масив', code: 'useFakeTimers();\nconst items = Array.from({ length: 10000 }, (_, i) => i);\nconst p = processInChunks(items, (x) => x % 7, { chunkSize: 1000 });\nfor (let i = 0; i < 12; i++) { await flushPromises(); advanceTimersByTime(0); }\nconst res = await p;\nexpect(res.length).toBe(10000);\nexpect(res[9999]).toBe(9999 % 7);' }
      ],
      explanation: `
**Чому працює:** між частинами функція «засинає» на \`await\` таймера, головний потік вільний. Помилка в \`fn\` перериває цикл і відхиляє проміс async-функції. Складність O(n), кількість yield — \`⌈n / chunkSize⌉ − 1\`.

**Чим поступатися:**
- \`setTimeout(0)\` — у кінець черги; вкладені таймери мають мінімум ~4 мс.
- \`scheduler.yield()\` — продовження з вищим пріоритетом (Chrome, Firefox), з fallback на \`setTimeout\`.
- Мікрозадачі (\`await Promise.resolve()\`, \`queueMicrotask\`) — **не** поступаються.

**Краще за фіксований \`chunkSize\`** — бюджет часу: обробляти, поки минуло < ~8 мс (наступна задача). Якщо DOM не потрібен — Web Worker.

**Типова помилка:** yield усередині внутрішнього циклу на кожному елементі (тисячі таймерів) або перед першою частиною.

**Далі можуть спитати:** як додати скасування через \`AbortSignal\` і прогрес?
`
    },
    {
      id: 'perf-time-budget-scheduler',
      group: 'inp',
      type: 'code',
      level: 4,
      title: 'Черга задач з бюджетом часу на «зріз»',
      tags: ['scheduler', 'inp', 'long-tasks'],
      description: `
**Завдання.** Напишіть чергу дрібних задач, яка виконує їх «зрізами», не довшими за бюджет часу, — щоб не створювати long tasks.

**Де трапляється:** фонова індексація для пошуку, малювання сотень маркерів на карті, відправка аналітики пачками. Так працює React Scheduler (зрізи ~5 мс). Задача рівня senior.

**Що написати**
- \`createTaskQueue({ budget = 5, now, schedule } = {})\` → об'єкт черги. \`now()\` — поточний час (за замовчуванням \`performance.now()\`), \`schedule(cb)\` — запланувати колбек (за замовчуванням \`setTimeout(cb, 0)\`). Їх передають у тестах, щоб керувати часом.
- \`queue.push(task)\` → проміс з результатом \`task()\` (відхилений, якщо \`task\` кинула помилку).
- \`queue.size()\` → скільки задач ще чекає.

**Приклад**
\`\`\`js
const queue = createTaskQueue({ budget: 8 });
markers.forEach((m) => queue.push(() => drawMarker(m)));
queue.size(); // 500 — синхронно нічого не виконано, заплановано ОДИН зріз
// зріз ~8 мс → yield → зріз ~8 мс → ... поки черга не спорожніє
\`\`\`

**Як це працює:** \`push\` кладе задачу в масив і, якщо зріз ще не заплановано, викликає \`schedule(runSlice)\`. Зріз запам'ятовує \`start = now()\` і виконує задачі, поки черга не порожня **і** \`now() - start < budget\`. Якщо щось лишилося — планує наступний зріз. Між зрізами браузер обробляє ввід і малює.

**Врахуйте:**
- у \`push\` нічого не виконується синхронно;
- одночасно запланований лише **один** зріз — навіть якщо \`push\` викликають у циклі або всередині задачі;
- перша задача зрізу виконується завжди (інакше задача, довша за бюджет, зациклить чергу);
- помилка однієї задачі відхиляє лише її проміс, черга працює далі;
- порядок FIFO.
`,
      starter: `function createTaskQueue({ budget = 5, now = () => performance.now(), schedule = (cb) => setTimeout(cb, 0) } = {}) {
  const queue = [];      // елементи { task, resolve, reject }
  let scheduled = false; // чи вже заплановано зріз

  function runSlice() {
    // 1. start = now()
    // 2. Поки черга не порожня І (це перша задача зрізу АБО now() - start < budget):
    //    дістати задачу (FIFO), виконати в try/catch, викликати її resolve/reject
    // 3. scheduled = false; якщо в черзі ще щось є — ensureScheduled()
    // TODO
  }

  function ensureScheduled() {
    // TODO: якщо зріз ще не заплановано — scheduled = true і schedule(runSlice)
  }

  return {
    push(task) {
      // TODO: поверніть new Promise, що кладе { task, resolve, reject } у чергу і викликає ensureScheduled()
    },
    size() {
      return queue.length;
    },
  };
}

// Спробуйте в консолі:
// const q = createTaskQueue(); q.push(() => 1).then(console.log); q.size()
`,
      solution: `function createTaskQueue({ budget = 5, now = () => performance.now(), schedule = (cb) => setTimeout(cb, 0) } = {}) {
  const queue = [];
  let scheduled = false; // чи є запланований / виконуваний зріз

  function runSlice() {
    const start = now();
    let ran = 0;
    // перша задача — завжди (прогрес), далі — поки вміщаємося в бюджет
    while (queue.length && (ran === 0 || now() - start < budget)) {
      const { task, resolve, reject } = queue.shift();
      ran++;
      try {
        resolve(task());
      } catch (err) {
        reject(err); // помилка однієї задачі не зупиняє чергу
      }
    }
    scheduled = false;
    if (queue.length) ensureScheduled();
  }

  function ensureScheduled() {
    if (scheduled) return;
    scheduled = true;
    schedule(runSlice);
  }

  return {
    push(task) {
      return new Promise((resolve, reject) => {
        queue.push({ task, resolve, reject });
        ensureScheduled();
      });
    },
    size() {
      return queue.length;
    },
  };
}
`,
      hints: [
        'Тримайте масив `{ task, resolve, reject }` і прапорець `scheduled`, щоб не планувати кілька зрізів одночасно.',
        'Умова циклу в зрізі: `queue.length && (ran === 0 || now() - start < budget)`. Кожну задачу виконуйте в `try/catch` і викликайте `resolve`/`reject` її промісу.',
        'Скидайте `scheduled = false` у **кінці** зрізу (задачі, додані під час зрізу, не мають створювати дубль) і, якщо черга не порожня, плануйте наступний.'
      ],
      tests: [
        { name: 'нічого не виконує синхронно і планує один зріз', code: "const slices = [];\nconst q = createTaskQueue({ budget: 10, now: () => 0, schedule: (cb) => slices.push(cb) });\nconst order = [];\nq.push(() => order.push('a'));\nq.push(() => order.push('b'));\nexpect(order).toEqual([]);\nexpect(slices.length).toBe(1);\nexpect(q.size()).toBe(2);" },
        { name: 'зріз зупиняється, коли бюджет вичерпано', code: "let t = 0;\nconst slices = [];\nconst q = createTaskQueue({ budget: 10, now: () => t, schedule: (cb) => slices.push(cb) });\nconst order = [];\nconst mk = (name, cost) => () => { t += cost; order.push(name); return name; };\n['a', 'b', 'c', 'd'].forEach((n) => q.push(mk(n, 4)));\nslices.shift()();\nexpect(order).toEqual(['a', 'b', 'c']);\nexpect(q.size()).toBe(1);\nexpect(slices.length).toBe(1);\nslices.shift()();\nexpect(order).toEqual(['a', 'b', 'c', 'd']);\nexpect(slices.length).toBe(0);" },
        { name: 'довга задача все одно виконується (прогрес)', code: "let t = 0;\nconst slices = [];\nconst q = createTaskQueue({ budget: 10, now: () => t, schedule: (cb) => slices.push(cb) });\nconst order = [];\nq.push(() => { t += 50; order.push('big'); });\nq.push(() => { t += 1; order.push('small'); });\nslices.shift()();\nexpect(order).toEqual(['big']);\nslices.shift()();\nexpect(order).toEqual(['big', 'small']);" },
        { name: 'проміси отримують результати; помилка не зупиняє чергу', code: "const slices = [];\nconst q = createTaskQueue({ budget: 100, now: () => 0, schedule: (cb) => slices.push(cb) });\nconst p1 = q.push(() => 1);\nconst p2 = q.push(() => { throw new Error('task failed'); });\nconst p3 = q.push(() => 3);\np2.catch(() => {});\nslices.shift()();\nawait expect(p1).resolves.toBe(1);\nawait expect(p2).rejects.toThrow('task failed');\nawait expect(p3).resolves.toBe(3);" },
        { name: 'задачі, додані під час зрізу, не створюють дубль-зрізу', code: 'let t = 0;\nconst slices = [];\nconst q = createTaskQueue({ budget: 5, now: () => t, schedule: (cb) => slices.push(cb) });\nconst order = [];\nq.push(() => { t += 3; order.push(1); q.push(() => { t += 3; order.push(3); }); });\nq.push(() => { t += 3; order.push(2); });\nslices.shift()();\nexpect(order).toEqual([1, 2]);\nexpect(slices.length).toBe(1);\nslices.shift()();\nexpect(order).toEqual([1, 2, 3]);\nexpect(slices.length).toBe(0);' },
        { name: 'значення за замовчуванням працюють з setTimeout і performance.now', code: "useFakeTimers();\nconst q = createTaskQueue();\nconst p = Promise.all([q.push(() => 'x'), q.push(() => 'y')]);\nexpect(getTimerCount()).toBe(1);\nadvanceTimersByTime(0);\nawait expect(p).resolves.toEqual(['x', 'y']);\nexpect(getTimerCount()).toBe(0);" }
      ],
      explanation: `
**Чому працює:** прапорець \`scheduled\` гарантує один зріз за раз, умова \`ran === 0 || now() - start < budget\` — і бюджет, і прогрес. Скидання прапорця в **кінці** зрізу не дає задачам, доданим під час зрізу, створити дубль.

**Ключові рішення:** бюджет за часом, а не за кількістю (адаптується до пристрою); ізоляція помилок через \`try/catch\`; інжекція \`now\`/\`schedule\` для тестованості — у проді можна підставити \`scheduler.postTask\` чи \`MessageChannel\` (без 4-мс затримки вкладених таймерів).

**Складність:** O(1) на задачу, крім \`shift()\` (O(n)) — для великих черг беруть індекс-голову або кільцевий буфер.

**Далі можуть спитати:** як додати пріоритети (user-blocking / background), скасування через \`AbortSignal\`, захист від голодування задач?
`
    },
    {
      id: 'perf-rendering-throttle',
      group: 'rendering',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'debounce, throttle, rAF і layout thrashing',
      tags: ['debounce', 'throttle', 'raf', 'rendering'],
      question: 'Коли використовувати debounce, throttle і requestAnimationFrame? Що таке layout thrashing і як його уникнути? Як ефективно обробляти scroll і resize?',
      choices: [
        'Debounce виконує функцію не частіше ніж раз на N мс під час потоку подій, а throttle — один раз після паузи',
        '`setTimeout(fn, 16)` рівноцінний `requestAnimationFrame`, бо 16 мс — це тривалість кадру при 60 Гц',
        'Layout thrashing — читання геометрії після запису стилів у циклі; лікується групуванням читань і записів',
        'Layout thrashing виникає через надто часті `requestAnimationFrame`, тому їх замінюють на throttle'
      ],
      answer: `
**Debounce** — виконати **один раз після паузи** в подіях:
- пошук під час набору (запит через 300 мс після останнього символу), автозбереження, валідація поля, \`resize\` → перерахунок макета наприкінці.

**Throttle** — виконувати **не частіше** ніж раз на N мс під час безперервного потоку подій:
- відстеження скролу для аналітики, \`mousemove\` для підказок, кнопка «завантажити ще», обмеження запитів.

**\`requestAnimationFrame\`** — виконати **перед наступним кадром**, синхронно з частотою екрана (60/120 Гц), і браузер сам пригальмовує його у фонових вкладках:
- усе, що змінює вигляд: анімації, позиція елемента при драгу/скролі, паралакс. Це природний «throttle до частоти кадрів»:
\`\`\`js
let scheduled = false;
window.addEventListener('scroll', () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    header.classList.toggle('compact', window.scrollY > 80);
  });
}, { passive: true });
\`\`\`
\`setTimeout(fn, 16)\` не синхронізований з кадрами → пропущені/подвійні кадри, «ривки».

**Layout thrashing (forced synchronous layout):** читання геометрії (\`offsetHeight\`, \`getBoundingClientRect\`, \`scrollTop\`, \`getComputedStyle\`) після запису стилів змушує браузер **синхронно** перерахувати layout. У циклі — це N layout'ів замість одного:
\`\`\`js
// погано: read → write → read → write...
items.forEach((el) => { el.style.width = el.parentNode.offsetWidth / 2 + 'px'; });

// добре: спершу всі читання, потім усі записи
const widths = items.map((el) => el.parentNode.offsetWidth);
items.forEach((el, i) => { el.style.width = widths[i] / 2 + 'px'; });
\`\`\`
Бібліотеки на кшталт fastdom групують читання/записи по кадрах.

**Ефективна обробка scroll/resize/видимості:**
- \`{ passive: true }\` для \`scroll\`, \`touchstart\`, \`wheel\` — браузер не чекає на ваш обробник, щоб почати прокрутку.
- **IntersectionObserver** замість перевірок \`getBoundingClientRect\` у \`scroll\` (lazy loading, infinite scroll, аналітика показів).
- **ResizeObserver** замість \`window.resize\` для розміру конкретного елемента.
- CSS замість JS: \`position: sticky\`, scroll-driven animations (\`animation-timeline: scroll()\`), \`scroll-snap\`.
- Анімувати лише \`transform\` і \`opacity\` (виконуються на compositor, без layout/paint); \`will-change\` — точково, бо кожен шар коштує пам'яті.
- \`content-visibility: auto\` + \`contain-intrinsic-size\` — браузер не рендерить секції поза екраном.
`,
      correct: 2,
      why: [
        'Навпаки: throttle — не частіше раз на N мс, debounce — один виклик після паузи.',
        '`setTimeout` не синхронізований з кадрами і не пригальмовується у фоні — звідси ривки.',
        'Так: читання геометрії після запису змушує синхронний layout; спершу всі читання, потім записи.',
        'Причина — змішування читань і записів геометрії, а rAF якраз допомагає їх згрупувати.'
      ],
      keyPoints: [
        'Debounce — один виклик після паузи (пошук, автозбереження)',
        'Throttle — не частіше N мс (скрол-аналітика, mousemove)',
        'requestAnimationFrame — візуальні оновлення синхронно з кадрами',
        'Layout thrashing: читання геометрії після запису → групувати читання і записи',
        'passive listeners, IntersectionObserver/ResizeObserver, transform/opacity, content-visibility'
      ],
      followUps: [
        'Чим throttle на rAF відрізняється від throttle з таймером?',
        'Які властивості викликають forced layout?',
        'Навіщо { passive: true }?'
      ]
    },
    {
      id: 'perf-quiz-raf',
      group: 'rendering',
      type: 'quiz',
      level: 2,
      title: 'Чим оновлювати DOM під час драгу',
      tags: ['raf', 'rendering'],
      question: 'Під час перетягування елемента приходить ~200 подій `pointermove` на секунду. Як найкраще застосовувати нову позицію (`transform`) до елемента?',
      options: [
        'Прямо в кожному обробнику `pointermove`',
        'Зберігати останні координати і застосовувати їх у `requestAnimationFrame` (не більше одного разу на кадр)',
        '`setInterval(apply, 0)`, щоб оновлювати якомога частіше',
        '`requestIdleCallback(apply)`, щоб не заважати головному потоку'
      ],
      answer: 1,
      hint: 'Скільки разів на секунду екран взагалі може показати нову позицію?',
      why: [
        '200 записів стилю на секунду, з яких екран покаже лише 60–120, — зайва робота головного потоку.',
        'Так: зберігаємо останні координати і застосовуємо їх раз на кадр, рівно перед відмальовуванням.',
        '`setInterval` не синхронізований з кадрами і крутиться, навіть коли нічого не змінилося.',
        '`requestIdleCallback` викликається лише в простої — під час драгу елемент відставатиме від курсора.'
      ],
      explanation: `
Зміни між двома кадрами користувач не бачить. rAF викликає колбек перед відмальовуванням, тож один запис \`transform\` на кадр — мінімум роботи і жодних пропущених кадрів.
`
    },
    {
      id: 'perf-virtualization',
      group: 'rendering',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Віртуалізація довгих списків',
      tags: ['virtualization', 'dom', 'rendering'],
      question: 'Потрібно показати таблицю на 50 000 рядків. Що піде не так при звичайному рендерингу і як працює віртуалізація (windowing)? Які в неї обмеження і альтернативи?',
      choices: [
        'Віртуалізація ховає зайві рядки через `display: none`, тож DOM лишається, але не малюється',
        'Віртуалізація не має обмежень: Ctrl+F, доступність і стан інпутів у рядках працюють як у звичайній таблиці',
        "`content-visibility: auto` видаляє невидимі рядки з DOM і тому економить пам'ять як віртуалізація",
        'Віртуалізація рендерить лише видимі рядки + overscan, а spacer повної висоти дає правильний скролбар'
      ],
      answer: `
**Проблема:** 50 000 рядків × ~10 вузлів = 500 000 DOM-вузлів. Повільний перший рендер (секунди), величезна пам'ять, кожна зміна стилю/layout перераховує гігантське дерево → поганий INP, «тормозний» скрол. Lighthouse радить тримати DOM у межах ~1 500 вузлів.

**Віртуалізація (windowing):** рендерити лише рядки, що **видно** у viewport, + невеликий запас (**overscan**) зверху і знизу.
\`\`\`text
┌ scroll container (overflow: auto, висота viewport) ┐
│ ┌ spacer: height = total × itemHeight ────────┐    │  ← дає правильний скролбар
│ │  translateY(start × itemHeight)             │    │
│ │  [рядок start] … [рядок end - 1]            │    │  ← ~20–40 вузлів замість 50 000
│ └─────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────┘
\`\`\`
- На \`scroll\` обчислюємо \`start = floor(scrollTop / itemHeight) - overscan\`, \`end = ceil((scrollTop + viewportHeight) / itemHeight) + overscan\` і перерендерюємо лише вікно.
- Позиціонування — \`transform: translateY\` (композитинг) або абсолютні позиції.
- **Змінна висота рядків** — складніше: оцінна висота, вимірювання відрендерених рядків (\`ResizeObserver\`), кеш висот і префіксні суми/бінарний пошук для обчислення \`start\`; коригування позиції скролу, щоб контент не «стрибав».

**Бібліотеки:** TanStack Virtual (headless, будь-який фреймворк), react-window, react-virtuoso (змінні висоти, групи, chat-режим), vue-virtual-scroller.

**Обмеження та пастки:**
- **Пошук по сторінці (Ctrl+F)** не знаходить невідрендерені рядки.
- **Доступність:** скрінрідери не бачать усього списку → \`role="grid"\`/\`list\` + \`aria-rowcount\`/\`aria-setsize\`/\`aria-posinset\`; фокус може «зникнути», коли рядок виходить за вікно.
- Швидкий скрол показує порожнечу, якщо overscan замалий або рендер повільний.
- Стан усередині рядків (інпути, розгорнуті елементи) губиться при демонтуванні — зберігати у зовнішньому стані.
- Друк, SEO (контент не в HTML).

**Альтернативи:**
- **Пагінація** або «Завантажити ще» — часто краще для UX і серверу; ніхто не читає 50 000 рядків.
- **\`content-visibility: auto\`** + \`contain-intrinsic-size: auto 48px\` — браузер не робить layout/paint для невидимих секцій, але DOM залишається (простіше, Ctrl+F працює; пам'ять не економить).
- Infinite scroll з IntersectionObserver + віртуалізація для дуже довгих стрічок.
- Серверні фільтрація/сортування/агрегація замість завантаження всього на клієнт.
`,
      correct: 3,
      why: [
        'Віртуалізація не ховає, а взагалі не створює невидимі рядки — DOM лишається маленьким.',
        'Ctrl+F не бачить невідрендерені рядки, скрінрідерам потрібні aria-атрибути, стан інпутів губиться.',
        "`content-visibility: auto` пропускає layout/paint, але вузли лишаються в DOM — пам'ять не економить.",
        'Так: у DOM лише вікно рядків, а spacer повної висоти дає реальний скролбар.'
      ],
      keyPoints: [
        "Проблема: величезний DOM → повільний рендер, пам'ять, поганий INP",
        'Windowing: рендер лише видимих рядків + overscan, spacer для скролбара, translateY',
        'Формули start/end; змінні висоти — вимірювання, кеш висот, бінарний пошук',
        'Пастки: Ctrl+F, доступність (aria-rowcount), втрата стану, фокус',
        'Альтернативи: пагінація, content-visibility: auto, серверна обробка'
      ],
      followUps: [
        'Як віртуалізувати список зі змінною висотою рядків?',
        'Чим content-visibility: auto відрізняється від віртуалізації?',
        'Як зробити віртуалізований список доступним?'
      ]
    },
    {
      id: 'perf-visible-range',
      group: 'rendering',
      type: 'code',
      level: 2,
      title: 'computeVisibleRange для віртуального списку',
      tags: ['virtualization', 'math'],
      description: `
**Завдання.** Для віртуального списку з фіксованою висотою рядка обчисліть, які рядки треба рендерити при поточному скролі.

**Де трапляється:** таблиці й стрічки на тисячі рядків (адмінки, логи, чати) — це ядро TanStack Virtual і react-window. «Зробіть віртуальний список» — часте завдання на співбесідах.

**Що написати**
- \`computeVisibleRange({ scrollTop, viewportHeight, itemHeight, total, overscan = 0 })\` → \`{ start, end, offsetY, totalHeight }\`:
  - \`start\` — перший індекс для рендеру (включно), \`end\` — індекс після останнього (не включно);
  - видимі рядки: від \`floor(scrollTop / itemHeight)\` до \`ceil((scrollTop + viewportHeight) / itemHeight)\`, плюс \`overscan\` рядків з кожного боку, у межах \`[0, total]\`;
  - \`offsetY = start * itemHeight\` — зсув першого відрендереного рядка;
  - \`totalHeight = total * itemHeight\` — висота spacer'а для скролбара.

**Приклад**
\`\`\`js
computeVisibleRange({ scrollTop: 30, viewportHeight: 100, itemHeight: 20, total: 1000 });
// { start: 1, end: 7, offsetY: 20, totalHeight: 20000 }
// рядок 1 видно частково зверху, рядок 6 — частково знизу

computeVisibleRange({ scrollTop: 400, viewportHeight: 100, itemHeight: 20, total: 1000, overscan: 2 });
// { start: 18, end: 27, offsetY: 360, totalHeight: 20000 }
\`\`\`
Компонент рендерить \`items.slice(start, end)\` з \`transform: translateY(offsetY)\` всередині spacer'а висотою \`totalHeight\`.

**Як це працює:** \`floor\` бере рядок, який видно хоча б на піксель зверху, \`ceil\` — знизу. Overscan — запас, щоб при швидкому скролі не було порожніх смуг, поки фреймворк перерендерює. Усе — арифметика, O(1) незалежно від кількості рядків.

**Врахуйте:**
- обмежте \`scrollTop\` діапазоном \`[0, max(0, totalHeight - viewportHeight)]\`: від'ємний буває при «відскоку» на iOS, завеликий — після зменшення списку;
- список коротший за viewport;
- \`total = 0\` → \`{ start: 0, end: 0, offsetY: 0, totalHeight: 0 }\`.
`,
      starter: `function computeVisibleRange({ scrollTop, viewportHeight, itemHeight, total, overscan = 0 }) {
  const totalHeight = total * itemHeight;
  // 1. total === 0 → { start: 0, end: 0, offsetY: 0, totalHeight: 0 }
  // 2. Обмежте scrollTop діапазоном [0, max(0, totalHeight - viewportHeight)]
  // 3. firstVisible = floor(top / itemHeight), lastVisible = ceil((top + viewportHeight) / itemHeight)
  // 4. Додайте overscan з обох боків і обріжте межами [0, total]
  // 5. offsetY = start * itemHeight
  // TODO
}

// Спробуйте в консолі:
// computeVisibleRange({ scrollTop: 30, viewportHeight: 100, itemHeight: 20, total: 1000 })
`,
      solution: `function computeVisibleRange({ scrollTop, viewportHeight, itemHeight, total, overscan = 0 }) {
  const totalHeight = Math.max(0, total * itemHeight);
  if (total <= 0 || itemHeight <= 0) return { start: 0, end: 0, offsetY: 0, totalHeight };

  // обмежуємо scrollTop: від'ємний (overscroll) і завеликий (список зменшився)
  const maxScroll = Math.max(0, totalHeight - viewportHeight);
  const top = Math.min(Math.max(0, scrollTop), maxScroll);

  const firstVisible = Math.floor(top / itemHeight);
  const lastVisible = Math.ceil((top + viewportHeight) / itemHeight); // не включно

  const start = Math.max(0, firstVisible - overscan);
  const end = Math.min(total, lastVisible + overscan);

  return { start, end, offsetY: start * itemHeight, totalHeight };
}
`,
      hints: [
        'Спершу обмежте `scrollTop` діапазоном `[0, max(0, totalHeight - viewportHeight)]`.',
        '`floor` для першого видимого рядка (частково видимий теж рендеримо) і `ceil` для межі знизу. Потім додайте `overscan` і обріжте `Math.max(0, …)` / `Math.min(total, …)`.'
      ],
      tests: [
        { name: 'початок списку', code: 'expect(computeVisibleRange({ scrollTop: 0, viewportHeight: 100, itemHeight: 20, total: 1000 })).toEqual({ start: 0, end: 5, offsetY: 0, totalHeight: 20000 });' },
        { name: 'частково видимі рядки', code: 'expect(computeVisibleRange({ scrollTop: 30, viewportHeight: 100, itemHeight: 20, total: 1000 })).toEqual({ start: 1, end: 7, offsetY: 20, totalHeight: 20000 });' },
        { name: 'overscan з обмеженням знизу та в середині', code: 'expect(computeVisibleRange({ scrollTop: 30, viewportHeight: 100, itemHeight: 20, total: 1000, overscan: 2 })).toEqual({ start: 0, end: 9, offsetY: 0, totalHeight: 20000 });\nexpect(computeVisibleRange({ scrollTop: 400, viewportHeight: 100, itemHeight: 20, total: 1000, overscan: 2 })).toEqual({ start: 18, end: 27, offsetY: 360, totalHeight: 20000 });' },
        { name: 'кінець списку та overscan не виходить за total', code: 'expect(computeVisibleRange({ scrollTop: 19900, viewportHeight: 100, itemHeight: 20, total: 1000, overscan: 3 })).toEqual({ start: 992, end: 1000, offsetY: 19840, totalHeight: 20000 });' },
        { name: 'scrollTop поза межами обмежується', code: 'const base = { viewportHeight: 100, itemHeight: 20, total: 1000 };\nexpect(computeVisibleRange({ ...base, scrollTop: 50000 })).toEqual(computeVisibleRange({ ...base, scrollTop: 19900 }));\nexpect(computeVisibleRange({ ...base, scrollTop: -50 })).toEqual({ start: 0, end: 5, offsetY: 0, totalHeight: 20000 });' },
        { name: 'список коротший за viewport і порожній список', code: 'expect(computeVisibleRange({ scrollTop: 0, viewportHeight: 100, itemHeight: 20, total: 3 })).toEqual({ start: 0, end: 3, offsetY: 0, totalHeight: 60 });\nexpect(computeVisibleRange({ scrollTop: 10, viewportHeight: 100, itemHeight: 20, total: 0 })).toEqual({ start: 0, end: 0, offsetY: 0, totalHeight: 0 });' },
        { name: 'O(1): мільйони рядків', code: 'const r = computeVisibleRange({ scrollTop: 123456789, viewportHeight: 600, itemHeight: 30, total: 10000000, overscan: 5 });\nexpect(r).toEqual({ start: 4115221, end: 4115252, offsetY: 123456630, totalHeight: 300000000 });' }
      ],
      explanation: `
**Чому працює:** формули перетворюють піксельний скрол на індекси, обрізання гарантує валідний діапазон для \`slice\`. **O(1)** — навіть на 10 млн рядків.

**Типові помилки:** не обмежений \`scrollTop\` (від'ємні індекси, порожній екран після зменшення списку), \`end\` включно замість не включно, \`Math.round\` замість \`floor\`/\`ceil\` (порожні смуги по краях).

**Обмеження:** браузери мають максимальну висоту елемента (~33 млн px у Chrome) — для гігантських списків масштабують скрол.

**Далі можуть спитати:** як підтримати змінну висоту рядків (кеш виміряних висот + префіксні суми + бінарний пошук)? Як зберегти позицію при додаванні повідомлень зверху (чат)?
`
    },
    {
      id: 'perf-memory-leaks',
      group: 'memory',
      type: 'theory',
      level: 3,
      title: "Витоки пам'яті у фронтенді: причини і пошук",
      tags: ['memory', 'leaks', 'devtools'],
      question: "Що таке витік пам'яті в JavaScript, якщо є збирач сміття? Які типові джерела витоків у SPA? Як знайти витік за допомогою DevTools? Оберіть **усі** правильні твердження.",
      choices: [
        'У JS зі збирачем сміття витоків не буває: усе, що не використовується, рано чи пізно звільниться',
        "Витік — непотрібний об'єкт, який досі досяжний через забуте посилання, тому GC його не прибирає",
        'Будь-яке зростання heap у Performance monitor — вже доведений витік, навіть без примусового GC',
        '`WeakMap` для метаданих DOM-вузлів спричиняє витоки, бо тримає ключі сильними посиланнями',
        "Від'єднаний DOM-вузол, на який досі є посилання в масиві чи `Map`, тримає в пам'яті все піддерево"
      ],
      answer: `
**GC прибирає лише недосяжне.** Збирач сміття (mark-and-sweep) звільняє об'єкти, до яких немає шляху від коренів (\`window\`/global, стек, активні замикання, DOM-дерево). **Витік** — об'єкт, який більше не потрібен застосунку, але **досі досяжний** через забуте посилання. У SPA це особливо помітно: сторінка не перезавантажується годинами, і кожна навігація додає мегабайти.

**Типові джерела:**
1. **Забуті таймери:** \`setInterval\` у компоненті без \`clearInterval\` — колбек (і все, що він замикає) живе вічно.
2. **Слухачі подій на глобальних об'єктах:** \`window.addEventListener('resize', handler)\` без \`removeEventListener\` при розмонтуванні; підписки на стори, EventEmitter, WebSocket, \`BroadcastChannel\`.
3. **Від'єднані (detached) DOM-вузли:** елемент видалено з документа, але посилання на нього лишилося в масиві, \`Map\`, замиканні або змінній — разом з ним живе все піддерево і слухачі.
4. **Необмежені кеші:** мемоізація без ліміту, \`Map\` «на всяк випадок», логи в масиві.
5. **Замикання з великими даними:** обробник, що замкнув великий масив, якого він навіть не використовує (V8 може тримати весь контекст, якщо інше замикання з того самого scope використовує змінну).
6. **Незавершені проміси/запити** з колбеками, що тримають компонент; \`IntersectionObserver\`/\`ResizeObserver\`/\`MutationObserver\` без \`disconnect()\`.
7. **Глобальні змінні** (випадкові без \`let\` у non-strict, \`window.debugData = ...\`), \`console.log\` об'єктів у DevTools (консоль тримає посилання).

**Як запобігти:**
\`\`\`js
useEffect(() => {
  const controller = new AbortController();
  window.addEventListener('resize', onResize, { signal: controller.signal });
  fetch('/api/data', { signal: controller.signal }).then(setData).catch(() => {});
  const id = setInterval(poll, 5000);
  return () => { controller.abort(); clearInterval(id); }; // cleanup
}, []);
\`\`\`
- Cleanup у \`useEffect\` / \`onUnmounted\` / \`disconnectedCallback\`.
- \`AbortController\` + \`{ signal }\` — один \`abort()\` знімає всі слухачі й скасовує запити.
- \`WeakMap\`/\`WeakSet\` для метаданих об'єктів і DOM-вузлів; \`WeakRef\`/\`FinalizationRegistry\` — для просунутих кешів (обережно, недетерміновано).
- LRU/TTL-ліміти для кешів.

**Як знайти (Chrome DevTools):**
1. **Performance monitor** / Performance panel з галочкою Memory — чи росте JS heap і кількість DOM-вузлів/слухачів після повторення сценарію (відкрити/закрити модалку 10 разів), навіть після примусового GC (іконка сміттєвого кошика).
2. **Memory → Heap snapshot**, техніка трьох знімків: знімок → дія → повернення в початковий стан → знімок → повторити → знімок. Режим **Comparison**: об'єкти, створені між знімками і не звільнені. Фільтр **Detached** показує від'єднані DOM-вузли.
3. Панель **Retainers** — ланцюжок посилань, що тримає об'єкт (від цього шукаємо винуватця: масив, замикання, слухач).
4. **Allocation instrumentation on timeline** — де саме виділяється пам'ять, що не звільняється.

**Пастка:** зростання пам'яті ≠ витік — GC працює ліниво. Витік — це стабільне зростання після повторюваних дій **і** примусового GC.
`,
      correct: [1, 4],
      why: [
        "GC прибирає лише недосяжне; забуте посилання тримає об'єкт вічно.",
        "Так: витік — це досяжний, але вже непотрібний об'єкт.",
        'GC лінивий: доказ витоку — зростання після повторення сценарію і примусового GC.',
        'Навпаки: `WeakMap` тримає ключі слабко і саме тому підходить для метаданих вузлів.',
        'Так: посилання на один вузол тримає все його піддерево і слухачі.'
      ],
      keyPoints: [
        "GC прибирає лише недосяжне; витік — непотрібний, але досяжний об'єкт",
        'Джерела: таймери, глобальні слухачі/підписки, detached DOM, необмежені кеші, замикання, observers',
        'Запобігання: cleanup, AbortController signal, WeakMap, ліміти кешів',
        'Пошук: Performance monitor, heap snapshots (Comparison, техніка трьох знімків), фільтр Detached, Retainers',
        "Зростання пам'яті після примусового GC при повторенні сценарію — ознака витоку"
      ],
      followUps: [
        'Чому WeakMap не заважає збиранню сміття?',
        'Як console.log може спричинити витік?',
        'Як знайти, що саме тримає detached-вузол?'
      ]
    },
    {
      id: 'perf-quiz-leak',
      group: 'memory',
      type: 'quiz',
      level: 3,
      title: "Що спричиняє витік пам'яті",
      tags: ['memory', 'leaks'],
      question: "SPA працює годинами без перезавантаження. Оберіть **усі** фрагменти, що спричиняють витік пам'яті:",
      options: [
        'Компонент при монтуванні робить `setInterval(() => update(bigData), 1000)` і ніколи не викликає `clearInterval`',
        "При кожному монтуванні `window.addEventListener('resize', this.onResize)` без `removeEventListener` при розмонтуванні",
        '`const meta = new WeakMap(); meta.set(node, info);` — вузол потім видаляється з DOM і більше ніде не використовується',
        'Модульний масив `const openedModals = []`, куди додаються DOM-вузли модалок; модалки видаляються з DOM, але з масиву — ні',
        'Функція створює локальний масив на 10 МБ, обчислює суму і повертає число'
      ],
      answer: [0, 1, 3],
      hint: "Для кожного випадку спитайте: чи лишився шлях від глобального об'єкта до цих даних після того, як вони стали непотрібні?",
      why: [
        'Так: таймер живе в браузері вічно, а колбек тримає `bigData`; кожне монтування додає ще один.',
        'Так: `window` тримає обробник, обробник — компонент; після розмонтування його ніхто не звільнить.',
        '`WeakMap` тримає ключ слабко: вузол без інших посилань зникне разом із записом.',
        'Так: масив модуля живе вічно і тримає detached-вузли разом із піддеревом і слухачами.',
        "Локальний масив стає недосяжним після return — тимчасовий пік пам'яті, а не витік."
      ],
      explanation: `
Для кожного випадку питання одне: чи лишився шлях від GC-коренів (\`window\`, змінні модуля, активні таймери й слухачі) до вже непотрібних даних? Якщо так — це витік.
`
    },
    {
      id: 'perf-lru-memo',
      group: 'memory',
      type: 'code',
      level: 3,
      title: 'memoizeLRU: мемоізація з обмеженням розміру',
      tags: ['memoization', 'lru', 'memory'],
      description: `
**Завдання.** Напишіть мемоізацію з обмеженим розміром кешу: коли місце закінчилося, витісняється запис, який найдовше не використовували (LRU).

**Де трапляється:** кеш форматерів цін і дат, результатів пошуку чи важких селекторів у довгій SPA-сесії — безлімітний кеш тут стає витоком пам'яті. «Напишіть LRU-кеш» — класика співбесід.

**Що написати**
- \`memoizeLRU(fn, maxSize = 100)\` → функція \`memoized(...args)\`, що повертає те саме, що \`fn\`, але повторні виклики з тими самими аргументами бере з кешу.
- \`memoized.cache\` — ваша \`Map\` (тести перевіряють її розмір).

**Приклад**
\`\`\`js
const formatPrice = memoizeLRU(
  (amount, currency) => new Intl.NumberFormat('uk-UA', { style: 'currency', currency }).format(amount),
  2
);
formatPrice(100, 'UAH'); // обчислено
formatPrice(5, 'USD');   // обчислено
formatPrice(100, 'UAH'); // з кешу — запис став найсвіжішим
formatPrice(7, 'EUR');   // кеш переповнено → витіснено найдавніший: (5, 'USD')
formatPrice.cache.size;  // 2
\`\`\`

**Як це працює:** \`Map\` пам'ятає порядок вставки. Щоб «освіжити» запис, його видаляють і вставляють знову — він стає останнім. Отже, перший ключ (\`cache.keys().next().value\`) — завжди найдавніше використаний; його й видаляємо при переповненні. Усе — O(1).

**Врахуйте:**
- ключ — \`JSON.stringify(args)\`;
- кешуються й «falsy» результати, зокрема \`undefined\` — перевіряйте \`cache.has\`, а не \`get\`;
- \`fn\` викликається з тим самим \`this\` (\`fn.apply(this, args)\` у звичайній \`function\`);
- якщо \`fn\` кинула помилку — нічого не кешується.
`,
      starter: `function memoizeLRU(fn, maxSize = 100) {
  // Map пам'ятає порядок вставки: перший ключ — найдавніше використаний
  const cache = new Map();

  function memoized(...args) {
    const key = JSON.stringify(args);
    // 1. Ключ є (cache.has, а не get!) → «освіжити»: delete + set, повернути значення
    // 2. Ключа немає → value = fn.apply(this, args)
    // 3. Покласти в кеш; якщо cache.size > maxSize — видалити cache.keys().next().value
    // TODO
  }

  memoized.cache = cache;
  return memoized;
}

// Спробуйте в консолі:
// const sq = memoizeLRU((x) => x * x, 2); sq(2); sq(3); sq(4); sq.cache
`,
      solution: `function memoizeLRU(fn, maxSize = 100) {
  // Map зберігає порядок вставки: перший ключ — найдавніше використаний
  const cache = new Map();

  function memoized(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) { // has, а не get() !== undefined — кешуємо й undefined
      const value = cache.get(key);
      cache.delete(key); // «освіжаємо»: переносимо в кінець
      cache.set(key, value);
      return value;
    }

    const value = fn.apply(this, args); // якщо кине — до кешу не дійдемо
    cache.set(key, value);
    if (cache.size > maxSize) {
      cache.delete(cache.keys().next().value); // витісняємо найстаріший
    }
    return value;
  }

  memoized.cache = cache;
  return memoized;
}
`,
      hints: [
        "`Map` пам'ятає порядок вставки. Щоб «освіжити» запис, видаліть його і вставте знову — він стане останнім.",
        'Найдавніший запис — перший ключ: `cache.keys().next().value`. Видаляйте його, коли `cache.size > maxSize`.',
        'Перевіряйте наявність через `cache.has(key)`, а викликайте `fn.apply(this, args)` у звичайній `function`, щоб зберегти `this`.'
      ],
      tests: [
        { name: 'повторний виклик береться з кешу', code: 'const fn = mockFn((x) => x * 2);\nconst m = memoizeLRU(fn, 10);\nexpect(m(2)).toBe(4);\nexpect(m(2)).toBe(4);\nexpect(fn).toHaveBeenCalledTimes(1);' },
        { name: 'різні аргументи — різні ключі', code: "const fn = mockFn((a, b) => [a, b].join('-'));\nconst m = memoizeLRU(fn, 10);\nm(1, 2); m(2, 1); m(1, 2); m('1', 2);\nexpect(fn).toHaveBeenCalledTimes(3);" },
        { name: 'витісняє найдавніше використаний запис', code: 'const fn = mockFn((x) => x);\nconst m = memoizeLRU(fn, 2);\nm(1); m(2);\nm(1);\nm(3);\nexpect(fn).toHaveBeenCalledTimes(3);\nexpect(m.cache.size).toBe(2);\nm(1);\nexpect(fn).toHaveBeenCalledTimes(3);\nm(2);\nexpect(fn).toHaveBeenCalledTimes(4);' },
        { name: 'розмір кешу не перевищує maxSize', code: 'const m = memoizeLRU((x) => x + 1, 10);\nfor (let i = 0; i < 1000; i++) m(i);\nexpect(m.cache.size).toBe(10);\nexpect(m(999)).toBe(1000);' },
        { name: 'зберігає this', code: 'const obj = { k: 10, get: memoizeLRU(function (x) { return this.k + x; }) };\nexpect(obj.get(1)).toBe(11);' },
        { name: 'кешує undefined', code: "const fn = mockFn(() => undefined);\nconst m = memoizeLRU(fn);\nm('a'); m('a');\nexpect(fn).toHaveBeenCalledTimes(1);" },
        { name: 'помилки не кешуються', code: "let fail = true;\nconst fn = mockFn((x) => { if (fail) throw new Error('fail'); return x; });\nconst m = memoizeLRU(fn);\nexpect(() => m(1)).toThrow('fail');\nfail = false;\nexpect(m(1)).toBe(1);\nexpect(fn).toHaveBeenCalledTimes(2);" }
      ],
      explanation: `
**Чому працює:** «delete + set» переносить ключ у кінець \`Map\`, тож порядок ключів = порядок використання. Витіснення першого ключа — O(1), загалом O(1) на виклик плюс вартість \`JSON.stringify\`.

**Навіщо ліміт:** мемоізація міняє пам'ять на CPU. Без ліміту кеш росте з кожним новим аргументом — повільний витік, помітний лише в довгих сесіях.

**Альтернативи:** \`WeakMap\`, коли ключ — об'єкт (запис зникає разом з ним); TTL для даних, що старіють; класичний LRU на двозв'язному списку + хеш-мапі (його можуть попросити без \`Map\`).

**Типові помилки:** \`get(key) !== undefined\` замість \`has\`, стрілкова функція замість \`function\` (губиться \`this\`), витіснення **до** вставки нового запису. \`JSON.stringify\` залежить від порядку ключів об'єкта і не підходить для функцій.

**Далі можуть спитати:** чому в \`useMemo\`/\`reselect\` кеш розміром 1? Коли мемоізація шкодить?
`
    },
    {
      id: 'perf-quiz-regression',
      group: 'process',
      type: 'quiz',
      level: 2,
      title: 'Lab зелений, поле червоне: з чого почати',
      tags: ['process', 'inp', 'rum'],
      question: 'Lighthouse на ноутбуці розробника показує 98 балів, а в CrUX для мобільних **p75 INP = 420 мс**. З чого почати?',
      options: [
        'Нічого не робити: lab-оцінка 98 доводить, що польові дані просто шумні',
        'Зібрати `web-vitals` з attribution і знайти, які взаємодії й сторінки повільні',
        'Переписати застосунок на інший фреймворк, бо INP залежить лише від фреймворку',
        'Додати `loading="lazy"` усім зображенням, щоб розвантажити головний потік'
      ],
      answer: 1,
      hint: 'Lighthouse не робить реальних взаємодій. Звідки дізнатися, яка саме взаємодія повільна?',
      why: [
        'Lab-тест не робить реальних взаємодій і не вимірює INP — 98 балів нічого не кажуть про реакцію на кліки.',
        'Так: attribution показує елемент, тип взаємодії і фазу затримки — далі це відтворюють у DevTools.',
        'Без діагностики невідомо, що повільне; часто винні сторонні скрипти чи важкий обробник, а не фреймворк.',
        'Ліниві зображення впливають на мережу і LCP, а INP — це робота головного потоку після взаємодії.'
      ],
      explanation: `
Field показує **що** і **де**, lab пояснює **чому**. Після attribution записують трейс саме цієї взаємодії в DevTools Performance з 4–6x CPU throttling, знаходять long task або важкий рендер і виправляють. Ефект перевіряють у власному RUM (CrUX оновиться через 28 днів).
`
    },
    {
      id: 'perf-audit',
      group: 'process',
      type: 'theory',
      level: 4,
      interview: true,
      title: 'Як ви підійдете до оптимізації продуктивності продукту',
      tags: ['process', 'web-vitals', 'budgets'],
      question: 'Вас найняли, бо «сайт повільний». Опишіть свій процес: з чого почнете, як визначите пріоритети, як доведете результат і як не дасте продуктивності деградувати знову? Оберіть **усі** правильні твердження.',
      choices: [
        'Почати з польових даних (CrUX, RUM із сегментацією), щоб знайти, яка метрика й де болить',
        'Головна ціль — 100 балів Lighthouse на MacBook: якщо lab зелений, реальні користувачі теж задоволені',
        'Регресіям запобігають performance budgets, Lighthouse CI на PR і алерти за RUM-метриками',
        'Пріоритет — мікрооптимізації циклів у JS, бо вони дають найбільший приріст для будь-якої метрики',
        'Ефект доводять порівнянням RUM до/після на тому самому сегменті, бо CrUX оновлюється з затримкою'
      ],
      answer: `
**1. Уточнити, що означає «повільний», і для кого.**
- Які сторінки/сценарії (головна, каталог, checkout, дашборд), які користувачі (мобільні, регіони, слабкі пристрої), яка бізнес-метрика страждає (конверсія, відмови, SEO).
- Домовитись про цілі: «p75 LCP < 2.5 с і INP < 200 мс на мобільних для топ-10 шаблонів сторінок».

**2. Виміряти в полі (field first).**
- CrUX (PageSpeed Insights, Search Console, CrUX Dashboard/BigQuery) — загальна картина; якщо немає власного RUM — підключити \`web-vitals\` з attribution і сегментацією (шаблон сторінки, пристрій, країна, тип з'єднання, нова/повторна сесія).
- Знайти найбільші «болі»: яка метрика, на яких сторінках, у якого сегмента.

**3. Діагностувати в лабораторії.**
- Lighthouse / WebPageTest (filmstrip, waterfall), DevTools Performance з CPU throttling на реальному середньому Android.
- Для LCP — розбивка на підчастини; для INP — конкретні взаємодії та long tasks/LoAF; для CLS — елементи, що зсуваються.
- Аналіз бандла, coverage, сторонні скрипти, TTFB (серверний час, кеш CDN).

**4. Пріоритизувати за impact / effort.**
- Швидкі перемоги: \`fetchpriority\`/прибрати \`lazy\` з LCP, розміри зображень, AVIF/WebP, кешування статики, \`preconnect\`, відкладення сторонніх скриптів, видалення невикористаних залежностей.
- Середні: code splitting за маршрутами, критичний CSS, шрифти, віртуалізація важких списків, розбиття long tasks.
- Великі: SSR/SSG/стримінг, зміна архітектури гідрації, edge-кешування HTML, переробка дизайн-системи.
- Кожна зміна — з гіпотезою: «прибравши X, очікуємо −600 мс LCP на мобільних каталогу».

**5. Впровадити і довести.**
- A/B або поетапне викатування з feature flag, порівняння RUM до/після (той самий сегмент), кореляція з бізнес-метриками.
- CrUX оновлюється з затримкою (28-денне вікно) — власний RUM показує ефект за дні.

**6. Не дати деградувати (найважливіше для senior).**
- **Performance budgets**: розмір JS/CSS (\`size-limit\`), Lighthouse CI з порогами на PR, бюджет на сторонні скрипти.
- Моніторинг і алерти за RUM-метриками (p75 по шаблонах), дашборд для команди.
- Процеси: перф-рев'ю для нових залежностей і сторонніх скриптів (хто і навіщо додає тег у GTM?), чекліст для компонентів (розміри зображень, lazy, мемоізація).

**Типові помилки, про які варто сказати:** оптимізувати під Lighthouse score замість реальних користувачів; міряти на MacBook і швидкому Wi-Fi; оптимізувати те, що не впливає на метрики (мікрооптимізації циклів); не мати базової лінії, тож неможливо довести результат.
`,
      correct: [0, 2, 4],
      hint: "Інтерв'юер оцінює системність: вимірювання → гіпотези → пріоритети → перевірка → запобігання регресіям.",
      why: [
        'Так: польові дані показують, яка метрика, на яких сторінках і в якого сегмента болить.',
        'Lab на швидкому ноутбуці не бачить реальних пристроїв, мережі і взаємодій.',
        'Так: без автоматичних бюджетів і алертів продуктивність деградує з кожним релізом.',
        'Мікрооптимізації циклів рідко впливають на Web Vitals; головні виграші — завантаження, JS і рендер.',
        'Так: CrUX має 28-денне вікно, а власний RUM показує ефект за дні.'
      ],
      keyPoints: [
        'Уточнити сценарії, сегменти та цілі (p75, mobile, шаблони сторінок)',
        'Field first: CrUX + власний RUM з сегментацією та attribution',
        'Lab-діагностика: розбивка LCP, INP-взаємодії, CLS-елементи, бандл, сторонні скрипти, TTFB',
        'Пріоритизація impact/effort з гіпотезами',
        'Доведення ефекту: A/B, RUM до/після, бізнес-метрики',
        'Запобігання регресіям: бюджети, Lighthouse CI, алерти, процеси'
      ],
      followUps: [
        'Як переконати бізнес інвестувати в продуктивність?',
        'Що робити, якщо головна проблема — сторонні скрипти маркетингу?',
        'Як налаштувати performance budget у CI?'
      ]
    }
  ]
});
