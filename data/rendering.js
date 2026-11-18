FE.topic('rendering', {
  intro: `
## Конвеєр рендерингу (pixel pipeline)

\`\`\`text
HTML → DOM ─┐
            ├→ Render tree → Layout → Paint → Composite → пікселі
CSS → CSSOM ┘     (style)    (reflow)  (repaint)  (GPU-шари)
\`\`\`

- **DOM** — дерево вузлів з HTML (будується інкрементально, по мірі надходження байтів).
- **CSSOM** — дерево стилів; будується лише **повністю** (каскад!) → CSS **блокує рендеринг**.
- **Render tree** — лише видимі вузли: без \`<head>\`, \`<script>\`, \`display: none\` (і їхніх нащадків). \`visibility: hidden\` і \`opacity: 0\` — **у дереві**.
- **Layout (reflow)** — геометрія: розміри та позиції. **Paint** — заливка пікселів у шари. **Composite** — складання шарів (часто на GPU).

## Скрипти

| Атрибут | Завантаження | Виконання | Порядок |
|---|---|---|---|
| (немає) | блокує парсер | одразу | за документом |
| \`async\` | паралельно | щойно завантажився (перериває парсинг) | **не гарантований** |
| \`defer\` | паралельно | після парсингу, **до** \`DOMContentLoaded\` | за документом |
| \`type="module"\` | паралельно | як \`defer\` (навіть inline!) | за документом |

- \`defer\` для **inline**-скриптів ігнорується; \`async\` на модулі — виконується щойно готовий.
- Класичний скрипт **після** \`<link rel="stylesheet">\` чекає на CSSOM (може читати стилі).
- \`DOMContentLoaded\` — HTML розібрано + defer/module виконано. \`load\` — ще й картинки, стилі, iframe.

## Resource hints

- \`preload\` — «цей ресурс потрібен **цій** сторінці, вантаж зараз» (\`as\` обов'язковий; шрифтам — \`crossorigin\`).
- \`prefetch\` — «знадобиться на **наступній** навігації», низький пріоритет.
- \`preconnect\` — DNS + TCP + TLS заздалегідь; \`dns-prefetch\` — лише DNS.
- **Preload scanner** — паралельно з парсером шукає \`src\`/\`href\` у ще не розібраному HTML.

## Reflow, repaint, composite

| Змінюємо | Layout | Paint | Composite |
|---|---|---|---|
| \`width\`, \`top\`, \`font-size\`, DOM-вузли | ✔ | ✔ | ✔ |
| \`color\`, \`background\`, \`box-shadow\` | — | ✔ | ✔ |
| \`transform\`, \`opacity\` | — | — | ✔ |

**Forced synchronous layout:** читання геометрії (\`offsetHeight\`, \`getBoundingClientRect()\`, \`scrollTop\`, \`getComputedStyle\`) **після** запису стилів змушує браузер зробити layout негайно. У циклі «запис → читання» — **layout thrashing**.

\`\`\`js
// погано: layout на кожній ітерації
items.forEach(el => { el.style.height = el.offsetHeight + 10 + 'px'; });
// добре: спочатку всі читання, потім усі записи
const hs = items.map(el => el.offsetHeight);
items.forEach((el, i) => { el.style.height = hs[i] + 10 + 'px'; });
\`\`\`

## Кадр і rAF

- 60 Гц → бюджет **~16.6 мс** на кадр (з них JS бажано < ~10 мс).
- Цикл: task → мікрозадачі → (якщо час рендерити) **rAF-колбеки** → style → layout → paint → composite.
- \`requestAnimationFrame\` — перед наступним малюванням; у фонових вкладках не викликається. Порядок відносно \`setTimeout\` **не гарантований**.

## Інше

- \`will-change: transform\` — підказка винести елемент в окремий шар; шари коштують пам'яті — не ставте на все.
- \`contain: layout paint\` / \`content-visibility: auto\` (+ \`contain-intrinsic-size\`) — ізоляція й пропуск рендерингу невидимого.
- Шрифти: FOIT (невидимий текст) vs FOUT (fallback → заміна). \`font-display: swap\` — одразу fallback.
`,
  groups: [
    { id: "crp", title: "Critical rendering path" },
    { id: "scripts", title: "Скрипти: блокування, async, defer, hints" },
    { id: "reflow", title: "Reflow, repaint, layout thrashing" },
    { id: "compositing", title: "Композитинг і плавні анімації" },
    { id: "raf", title: "requestAnimationFrame і кадр" },
    { id: "advanced", title: "Оптимізації та діагностика" }
  ],
  items: [
    // ------------------------------------------------------------ Critical rendering path
    {
      id: 'render-crp-basics', group: "crp", why: ["Так: CSSOM потрібен цілком, бо пізніші правила перекривають ранні.","Ні: visibility:hidden лишається в render tree і займає місце.","Ні: порядок: layout → paint → composite; layout рахує CPU.","Так: скрипт може читати стилі, тому чекає на CSSOM.","Ні: DOM будується потоково, по мірі надходження HTML."],
      type: 'theory',
      level: 1,
      interview: true,
      title: 'Critical Rendering Path: DOM, CSSOM, render tree',
      tags: ['crp', 'dom', 'cssom'],
      question: 'Опишіть кроки, через які проходить браузер, щоб перетворити HTML і CSS на пікселі на екрані (critical rendering path). Оберіть **усі** правильні твердження.',
      choices: [
        'DOM будується інкрементально, а CSSOM — лише повністю, тому CSS блокує рендеринг',
        'Елементи з `visibility: hidden` не потрапляють у render tree, так само як `display: none`',
        'Після render tree одразу йде paint, а layout виконується на GPU вже під час composite',
        'Класичний `<script>` зупиняє парсер HTML і, якщо перед ним є стилі, чекає на CSSOM',
        'Браузер чекає завантаження всього HTML-документа і лише потім починає будувати DOM'
      ],
      correct: [0, 3],
      hint: 'Два дерева, їх об\'єднання, а потім три етапи, що стосуються геометрії, пікселів і шарів.',
      answer: `
**Critical Rendering Path (CRP)** — послідовність кроків від отриманих байтів HTML/CSS/JS до першого відмальованого кадру.

1. **Парсинг HTML → DOM.** Байти → символи → токени → вузли → дерево. Відбувається інкрементально: браузер не чекає весь документ.
2. **Парсинг CSS → CSSOM.** На відміну від DOM, CSSOM не можна використати частково — пізніше правило може перекрити попереднє (каскад). Тому CSS **блокує рендеринг** (render-blocking).
3. **Render tree (style).** Об'єднання DOM і CSSOM: для кожного **видимого** вузла обчислюються фінальні стилі. Не потрапляють: \`<head>\`, \`<script>\`, \`<meta>\`, елементи з \`display: none\` та їхні нащадки. Потрапляють псевдоелементи \`::before/::after\`, а також \`visibility: hidden\` (займає місце).
4. **Layout (reflow).** Обчислення геометрії: розмір і позиція кожного блоку у viewport.
5. **Paint.** Перетворення блоків на списки команд малювання (текст, кольори, тіні, рамки) — по шарах.
6. **Composite.** Складання шарів у правильному порядку, часто на GPU в окремому потоці (compositor thread).

\`\`\`text
HTML → DOM ─┐
            ├→ Style/Render tree → Layout → Paint → Composite
CSS → CSSOM ┘
\`\`\`

**JavaScript** вклинюється в цей процес: класичний \`<script>\` зупиняє парсер HTML (parser-blocking), а якщо перед ним є стилі — ще й чекає на CSSOM.

**Як оптимізувати CRP:** зменшити кількість і розмір критичних ресурсів (inline critical CSS, \`media\` для некритичних стилів), \`defer\`/\`async\` для скриптів, скоротити кількість round-trip'ів (preconnect, HTTP/2).
`,
      keyPoints: [
        'DOM будується інкрементально, CSSOM — лише повністю (каскад) → CSS render-blocking',
        'Render tree містить лише видимі вузли (без head, script, display:none)',
        'Layout — геометрія, Paint — пікселі в шарах, Composite — складання шарів',
        'Класичний script блокує парсер і може чекати на CSSOM',
        'Оптимізація: critical CSS, defer/async, менше критичних ресурсів і round-trip'
      ],
      followUps: [
        'Чому CSS блокує рендеринг, а не парсинг?',
        'Чи потрапить у render tree елемент з visibility: hidden? А з opacity: 0?',
        'Що таке critical CSS і як його виділяють?'
      ]
    },
    {
      id: 'render-tree-quiz', group: "crp", why: ["Так: display:none не рендериться.","Ні: невидимий, але займає місце — він у render tree.","Так: нащадки зникають разом з батьком.","Ні: прозорий елемент займає місце і ловить кліки.","Так: head нічого не малює.","Ні: псевдоелемент з content рендериться."],
      type: 'quiz',
      level: 1,
      title: 'Що не потрапляє в render tree',
      tags: ['crp', 'render-tree'],
      question: 'Оберіть **усі** вузли, які **не** потрапляють у render tree:',
      options: [
        'Елемент з `display: none`',
        'Елемент з `visibility: hidden`',
        'Нащадки елемента з `display: none`',
        'Елемент з `opacity: 0`',
        'Вміст `<head>` (`<meta>`, `<link>`, `<script>`)',
        'Псевдоелемент `::before` з `content: "★"`'
      ],
      answer: [0, 2, 4],
      hint: 'Render tree описує те, що займає місце або малюється. Чи займає місце невидимий, але «присутній» елемент?',
      explanation: `
- \`display: none\` — елемент повністю виключається з render tree **разом з усіма нащадками** (навіть якщо нащадок має \`display: block\`).
- \`<head>\` і його вміст не мають візуального представлення.
- \`visibility: hidden\` — елемент **у дереві**: він займає місце в layout, просто не малюється. Нащадок може навіть стати видимим через \`visibility: visible\`.
- \`opacity: 0\` — елемент у дереві, малюється (прозоро), реагує на кліки.
- \`::before\`/\`::after\` — їх **немає в DOM**, але вони є в render tree.

Звідси популярне питання: \`display: none\` → зміна викликає reflow; \`visibility: hidden\` → лише repaint; \`opacity\` → лише composite.
`
    },
    {
      id: 'render-url-to-pixels', group: "crp", why: ["Ні: спочатку DNS, потім TCP і TLS.","Ні: DOM будується потоково, задовго до load.","Так: це повний ланцюжок від кешу до composite.","Ні: SW і кеш перевіряються до мережевого запиту.","Ні: DCL не чекає картинок і стилів (крім тих, що блокують скрипти)."],
      type: 'theory',
      level: 2,
      title: 'Від URL до пікселів: увесь шлях коротко',
      tags: ['navigation', 'network', 'crp'],
      question: 'Що відбувається від моменту, коли користувач ввів URL в адресний рядок і натиснув Enter, до появи пікселів на екрані?',
      choices: [
        'Спершу TCP і TLS, потім DNS-запит через уже захищене з\'єднання, і лише тоді HTTP-запит',
        'Браузер завантажує HTML і всі ресурси, а будувати DOM починає тільки після події `load`',
        'Кеші й HSTS → DNS → TCP + TLS → HTTP → DOM і CSSOM → layout → paint → composite',
        'Service Worker і HTTP-кеш перевіряються лише після того, як сервер повернув заголовки',
        '`DOMContentLoaded` означає, що всі картинки й стилі завантажені, а перший кадр намальовано'
      ],
      correct: 2,
      hint: 'Розділіть на дві частини: мережа (як отримати HTML) і рендеринг (що з ним робити). Не забудьте про кеші.',
      answer: `
**1. Навігація та мережа**
- Браузер розбирає введене: це URL чи пошуковий запит. Перевіряє **HSTS** (одразу https?).
- Перевіряє кеші: Service Worker, HTTP-кеш (\`Cache-Control\`), bfcache для «назад».
- **DNS**: кеш браузера → ОС → резолвер → рекурсивний запит (root → TLD → authoritative) → IP.
- **TCP**-з'єднання (3-way handshake), далі **TLS**-handshake (узгодження шифрів, сертифікат, ключі). У HTTP/3 — QUIC поверх UDP, рукостискання об'єднані.
- **HTTP-запит** (\`GET /\`, cookies, заголовки) → відповідь: статус, заголовки (\`Content-Type\`, \`Cache-Control\`, \`Set-Cookie\`, CSP), тіло. Можливі редіректи 301/302 — все спочатку.

**2. Обробка відповіді**
- Для \`text/html\` створюється (або перевикористовується) renderer-процес (site isolation), документ «commit-иться».

**3. Рендеринг (critical rendering path)**
- Парсер HTML будує **DOM** інкрементально. **Preload scanner** паралельно знаходить \`<link>\`, \`<script src>\`, \`<img>\` і починає їх завантажувати.
- CSS → **CSSOM** (render-blocking). Класичні \`<script>\` блокують парсер; \`defer\`/\`async\`/\`module\` — ні.
- DOM + CSSOM → **render tree** → **layout** → **paint** → **composite** → перший кадр (FCP).
- Подія \`DOMContentLoaded\` — HTML розібрано та виконано defer-скрипти; \`load\` — завантажено всі ресурси.

\`\`\`text
URL → HSTS/кеш → DNS → TCP → TLS → HTTP → HTML
    → DOM + CSSOM → render tree → layout → paint → composite
\`\`\`

**Нюанси, які відрізняють сильного кандидата:** keep-alive і перевикористання з'єднань, HTTP/2 мультиплексування, \`preconnect\`, 103 Early Hints, роль CDN, TTFB як метрика мережевої частини, LCP/FCP як метрики рендерингу.
`,
      keyPoints: [
        'Кеші перед мережею: Service Worker, HTTP-кеш, HSTS',
        'DNS → TCP → TLS → HTTP-запит/відповідь (редіректи, заголовки)',
        'DOM інкрементально + preload scanner; CSSOM блокує рендеринг',
        'Скрипти: класичні блокують парсер, defer/async — ні',
        'Render tree → layout → paint → composite; DOMContentLoaded vs load'
      ],
      followUps: [
        'Як HTTP/2 і HTTP/3 змінюють цю картину?',
        'Що таке TTFB і що на нього впливає?',
        'Як preconnect і dns-prefetch скорочують цей шлях?',
        'Що таке bfcache?'
      ]
    },
    {
      id: 'render-css-blocks-script', group: "scripts", why: ["Ні: скрипт може читати стилі, тому чекає на CSSOM.","Так: inline-скрипт після link чекає на CSS.","Ні: DCL настає пізніше — після виконання скриптів.","Ні: load чекає всіх ресурсів, скрипт виконається раніше."],
      type: 'quiz',
      level: 3,
      title: 'Inline-скрипт після повільного CSS',
      tags: ['crp', 'css', 'scripts'],
      question: `
Файл \`slow.css\` завантажується 2 секунди. Коли виконається inline-скрипт?

\`\`\`html
<head>
  <link rel="stylesheet" href="slow.css">
  <script>
    console.log('inline', performance.now());
  </script>
</head>
\`\`\`
`,
      options: [
        'Одразу — inline-скрипту нічого не потрібно завантажувати',
        'Після того, як `slow.css` завантажиться і буде побудовано CSSOM',
        'Після `DOMContentLoaded`',
        'Після події `load`'
      ],
      answer: 1,
      hint: 'Що, якщо скрипт викличе `getComputedStyle()` або прочитає `offsetWidth`? Звідки браузер візьме правильну відповідь?',
      explanation: `
Скрипт **може читати стилі** (\`getComputedStyle\`, \`offsetWidth\`), тому браузер не виконує класичний скрипт, поки не завантажено й не розібрано стилі, оголошені **перед** ним. А оскільки класичний скрипт блокує парсер — у підсумку **CSS опосередковано блокує парсинг HTML**.

- «Одразу» — типова помилка: inline не потребує мережі, але залежить від CSSOM.
- \`DOMContentLoaded\` і \`load\` настануть пізніше — inline-скрипт виконується під час парсингу.

**Висновок для практики:** не ставте синхронні скрипти після великих стилів у \`<head>\`; використовуйте \`defer\` або розміщуйте скрипти перед стилями, якщо вони не читають стилі (наприклад, аналітика).
`
    },
    // ------------------------------------------------------------ Scripts & lifecycle events
    {
      id: 'render-dcl-vs-load', group: "scripts", why: ["Ні: load чекає всіх картинок і iframe.","Ні: complete відповідає load.","Так: DCL — HTML розібрано і defer-скрипти виконано.","Ні: beforeunload — при виході зі сторінки."],
      type: 'quiz',
      level: 1,
      interview: true,
      title: 'DOMContentLoaded vs load',
      tags: ['lifecycle', 'events'],
      question: 'Яка подія спрацьовує, коли HTML повністю розібрано і виконано `defer`-скрипти, **не чекаючи** на картинки та iframe?',
      options: [
        '`window.onload`',
        '`readystatechange` зі станом `complete`',
        '`DOMContentLoaded`',
        '`beforeunload`'
      ],
      answer: 2,
      hint: 'Одна подія — про DOM, інша — про всі ресурси сторінки.',
      explanation: `
- \`DOMContentLoaded\` (на \`document\`) — DOM готовий, виконані всі синхронні, \`defer\` і \`type="module"\` скрипти. Картинки, iframe, \`async\`-скрипти можуть ще вантажитись. Стилі не блокують DCL напряму, але блокують скрипти, що стоять після них.
- \`load\` (на \`window\`) — завантажено **всі** ресурси: картинки, стилі, iframe, шрифти, що були в запитах.
- \`readyState\`: \`loading\` → \`interactive\` (≈ DCL) → \`complete\` (≈ load).
- \`beforeunload\` — перед виходом зі сторінки.
`
    },
    {
      id: 'render-async-defer-theory', group: "scripts", why: ["Ні: навпаки — порядок зберігає defer.","Так: defer — по порядку після парсингу; async — щойно завантажився.","Ні: defer діє лише на зовнішні скрипти.","Ні: модулі за замовчуванням відкладені, як defer.","Ні: динамічні скрипти парсер не блокують (поводяться як async)."],
      type: 'theory',
      level: 2,
      interview: true,
      title: 'async vs defer vs type="module"',
      tags: ['scripts', 'crp'],
      question: 'Чим відрізняються `<script>`, `<script async>`, `<script defer>` і `<script type="module">`? Коли що використовувати?',
      choices: [
        '`async`-скрипти виконуються в порядку документа, а `defer` — кожен щойно завантажився',
        '`defer` — після парсингу, у порядку документа, до `DOMContentLoaded`; `async` — щойно завантажився',
        'Inline `<script defer>` теж відкладається до кінця парсингу, як і зовнішній скрипт',
        '`type="module"` виконується синхронно й блокує парсер, якщо не додати йому `defer`',
        'Скрипт, створений через `createElement`, блокує парсер так само, як звичайний `<script>`'
      ],
      correct: 1,
      hint: 'Порівнюйте за трьома осями: чи блокує завантаження парсер, коли виконується, чи гарантований порядок.',
      answer: `
| | Завантаження | Виконання | Порядок | Чекає DCL? |
|---|---|---|---|---|
| \`<script>\` | блокує парсер | одразу | за документом | DCL чекає на нього |
| \`async\` | паралельно | щойно завантажився (зупиняє парсер на час виконання) | **як вийде** | ні, може бути до чи після DCL |
| \`defer\` | паралельно | після парсингу HTML | за документом | так, виконується **до** DCL |
| \`type="module"\` | паралельно (+ граф імпортів) | як \`defer\` | за документом | так |

**Нюанси:**
- \`defer\` і \`async\` працюють **лише для зовнішніх** класичних скриптів (з \`src\`). Inline \`<script defer>\` виконається одразу.
- \`type="module"\` за замовчуванням відкладений — **навіть inline**. З \`async\` — виконається щойно завантажиться граф залежностей.
- Модулі: strict mode, власна область видимості, виконуються один раз, CORS для крос-доменних.
- Динамічно вставлений скрипт (\`document.createElement('script')\`) поводиться як \`async\`, якщо не поставити \`s.async = false\`.
- Класичний синхронний скрипт після \`<link rel="stylesheet">\` чекає на CSSOM.

\`\`\`html
<script defer src="vendor.js"></script>   <!-- 1 -->
<script defer src="app.js"></script>      <!-- 2: гарантовано після vendor -->
<script async src="analytics.js"></script> <!-- незалежний -->
\`\`\`

**Коли що:**
- \`defer\` — основний код застосунку, що потребує DOM і порядку залежностей.
- \`async\` — незалежні скрипти: аналітика, реклама, віджети.
- \`module\` — сучасні збірки; \`nomodule\` — fallback для старих браузерів.
- Без атрибутів — лише коли скрипт **має** виконатись до подальшого парсингу (наприклад, мінімальний inline для теми, щоб уникнути «блимання»).
`,
      keyPoints: [
        'Звичайний script блокує парсер на завантаження і виконання',
        'async: паралельне завантаження, виконання одразу, порядок не гарантований',
        'defer: виконання після парсингу, до DOMContentLoaded, у порядку документа',
        'module відкладений за замовчуванням, навіть inline',
        'defer/async ігноруються для inline класичних скриптів'
      ],
      followUps: [
        'Як поводиться динамічно вставлений script?',
        'Що буде, якщо поставити і async, і defer?',
        'Чи блокує async-скрипт DOMContentLoaded?'
      ]
    },
    {
      id: 'render-quiz-dynamic-scripts', group: 'scripts', type: 'quiz', level: 2,
      title: 'Скрипти, вставлені з JavaScript: у якому порядку?',
      tags: ['scripts', 'async'],
      question: `\`a.js\` завантажується 300 мс, \`b.js\` — 50 мс; кожен логує своє ім'я. Скрипти додає код, а не розмітка:
\`\`\`js
for (const src of ['a.js', 'b.js']) {
  const s = document.createElement('script');
  s.src = src;
  document.head.append(s);
}
\`\`\`
Що буде в консолі?`,
      options: [
        '`b`, потім `a`',
        '`a`, потім `b`: скрипти виконуються в порядку вставки',
        'Нічого: скрипти, створені після парсингу HTML, не виконуються',
        '`a`, потім `b`, але лише після `DOMContentLoaded`, як у `defer`'
      ],
      answer: 0,
      why: [
        'Так: вставлені з JavaScript скрипти поводяться як `async` і виконуються в міру завантаження — швидший `b.js` першим.',
        'Ні: порядок вставки зберігається лише з `s.async = false`; за замовчуванням `document.createElement(\'script\').async === true`.',
        'Ні: виконуються; не виконуються лише скрипти, вставлені через `innerHTML`.',
        'Ні: поведінка `defer` тут не вмикається — це «примусово асинхронні» скрипти.'
      ],
      hint: 'Чому дорівнює `document.createElement(\'script\').async`?',
      explanation: 'Для скриптів, вставлених через DOM, специфікація HTML вмикає «force async»: вони не блокують парсер і виконуються одразу після завантаження — у порядку готовності. Потрібен порядок вставки (бібліотека, потім код, що її використовує) — задайте `s.async = false` до вставки: завантаження паралельне, виконання по черзі. Перевірено в Chrome з затримками 300/50 мс: `b.js, a.js`, а з `async = false` — `a.js, b.js`. Скрипт у рядку `innerHTML` не виконується взагалі.'
    },
    {
      id: 'render-inline-defer-module', group: "scripts", why: ["Ні: модуль відкладений до кінця парсингу.","Ні: inline defer ігнорується — 1 виконається одразу.","Так: inline defer = звичайний скрипт (1), потім 3, модуль після парсингу (2), потім 4 з DCL.","Ні: модуль не виконується синхронно.","Ні: модуль виконується до DOMContentLoaded-обробника."],
      type: 'quiz',
      level: 3,
      title: 'inline defer та inline module',
      tags: ['scripts', 'modules'],
      question: `
Що буде виведено в консоль?

\`\`\`html
<script defer>console.log(1)</script>
<script type="module">console.log(2)</script>
<script>console.log(3)</script>
<script>
  document.addEventListener('DOMContentLoaded', () => console.log(4));
</script>
\`\`\`
`,
      options: [
        '`1 2 3 4`',
        '`3 1 2 4`',
        '`1 3 2 4`',
        '`2 1 3 4`',
        '`1 3 4 2`'
      ],
      answer: 2,
      hint: 'Атрибут `defer` має сенс лише для скриптів з `src`. А модулі відкладені завжди.',
      explanation: `
1. \`<script defer>\` **без** \`src\` — атрибут ігнорується, скрипт виконується одразу → \`1\`.
2. \`<script type="module">\` — модулі відкладені **за замовчуванням, навіть inline**: виконаються після парсингу, але до \`DOMContentLoaded\`.
3. Звичайний скрипт → \`3\`.
4. Реєструємо обробник DCL.
5. Парсинг завершено → виконується модуль → \`2\`.
6. Спрацьовує \`DOMContentLoaded\` → \`4\`.

Результат: \`1 3 2 4\`. Варіант \`1 3 4 2\` — типова помилка: забувають, що DCL **чекає** на defer- і module-скрипти.
`
    },
    {
      id: 'render-preload-font', group: "scripts", why: ["Ні: prefetch — для наступної сторінки, низький пріоритет.","Ні: лише DNS, файл не завантажиться раніше.","Ні: з'єднання прогріється, але сам файл почне вантажитись пізно.","Так: preload з as=font і crossorigin вантажить шрифт одразу."],
      type: 'quiz',
      level: 2,
      title: 'preload vs prefetch vs preconnect',
      tags: ['resource-hints', 'performance'],
      question: 'Шрифт для заголовка на першому екрані підключається через `@font-face` у CSS, тому браузер дізнається про нього пізно (після завантаження і розбору CSS). Що найкраще допоможе почати завантаження шрифту якомога раніше?',
      options: [
        '`<link rel="prefetch" href="/f.woff2">`',
        '`<link rel="dns-prefetch" href="//fonts.example.com">`',
        '`<link rel="preconnect" href="https://fonts.example.com">`',
        '`<link rel="preload" href="/f.woff2" as="font" type="font/woff2" crossorigin>`'
      ],
      answer: 3,
      hint: 'Ресурс потрібен на **цій** сторінці, і ми точно знаємо його URL.',
      explanation: `
- **\`preload\`** — обов'язкове завантаження з високим пріоритетом ресурсу, потрібного **поточній** сторінці. Для шрифтів обов'язково \`as="font"\` і \`crossorigin\` (шрифти завжди вантажаться в CORS-режимі; без атрибута буде **подвійне** завантаження).
- \`prefetch\` — низькопріоритетне завантаження для **наступної** навігації; для поточної сторінки може прийти запізно.
- \`preconnect\` — корисно, коли домен шрифтів інший, але це лише з'єднання (DNS+TCP+TLS), а не сам файл. Часто комбінують з preload.
- \`dns-prefetch\` — лише DNS, ще слабше.

Пастка: невикористаний preload — Chrome попередить у консолі через ~3 с; зайві preload'и конкурують за смугу з критичними ресурсами.
`
    },
    {
      id: 'render-resource-hints', group: "scripts", why: ["Ні: scanner бачить лише розмітку, не CSS і не JS.","Так: preload — тут і зараз, prefetch — на майбутнє.","Ні: навпаки — preconnect робить DNS+TCP+TLS.","Ні: зайві preload відбирають смугу в критичних ресурсів.","Так: шрифти завантажуються в CORS-режимі, без crossorigin кеш не збіжиться."],
      type: 'theory',
      level: 3,
      title: 'Preload scanner і resource hints',
      tags: ['resource-hints', 'performance', 'crp'],
      question: 'Що таке preload scanner? Розкажіть про preload, prefetch, preconnect, dns-prefetch, modulepreload і fetchpriority — коли що використовувати? Оберіть **усі** правильні твердження.',
      choices: [
        'Preload scanner знаходить і `background-image` з CSS, і скрипти, додані через `createElement`',
        '`preload` — ресурс поточної сторінки з високим пріоритетом, `prefetch` — для наступної, з низьким',
        '`dns-prefetch` робить DNS + TCP + TLS, а `preconnect` — лише DNS-резолв',
        'Що більше `preload`, то швидше: вони не конкурують за смугу з іншими ресурсами',
        '`preload` шрифту без атрибута `crossorigin` призведе до повторного завантаження файлу'
      ],
      correct: [1, 4],
      hint: 'Подумайте, що браузер робить, поки парсер HTML заблокований синхронним скриптом.',
      answer: `
**Preload scanner** — вторинний легкий парсер, який під час блокування основного парсера (синхронний скрипт) переглядає решту HTML і завчасно запускає завантаження \`<script src>\`, \`<link rel=stylesheet>\`, \`<img src/srcset>\`. Він **не бачить** ресурси, які з'являються лише через JS (\`createElement\`), CSS (\`background-image\`, \`@font-face\`, \`@import\`) чи lazy-атрибути. Саме для них і потрібні hints.

| Hint | Що робить | Коли |
|---|---|---|
| \`dns-prefetch\` | лише DNS-резолв | багато сторонніх доменів, дешево |
| \`preconnect\` | DNS + TCP + TLS | 2–4 критичні домени (CDN, API, шрифти) |
| \`preload\` | завантажити ресурс **цієї** сторінки з високим пріоритетом | шрифти, LCP-картинка з CSS, критичний скрипт |
| \`modulepreload\` | завантажити й розібрати ES-модуль (і кешувати в module map) | чанки модулів, що знадобляться одразу |
| \`prefetch\` | низький пріоритет, у HTTP-кеш для **наступної** сторінки | наступний крок у воронці |
| \`fetchpriority="high\|low"\` | підказка пріоритету | LCP-зображення — high, каруселі поза екраном — low |

\`\`\`html
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
<link rel="preload" as="image" href="/hero.avif" fetchpriority="high">
<link rel="preload" as="font" type="font/woff2" href="/inter.woff2" crossorigin>
<link rel="prefetch" href="/checkout.js">
\`\`\`

**Пастки:**
- \`preload\` без \`as\` — ресурс завантажиться двічі або з неправильним пріоритетом; шрифти без \`crossorigin\` — двічі.
- Надлишок preload'ів «краде» смугу у справді критичних ресурсів — це не «магічне прискорення».
- \`preconnect\` тримає з'єднання ~10 с; зайві — марнують ресурси.
- Також існують заголовок \`Link:\` і **103 Early Hints**: сервер віддає hints ще до готовності HTML.
`,
      keyPoints: [
        'Preload scanner знаходить ресурси в HTML, але не в CSS/JS',
        'preload — для поточної сторінки, prefetch — для наступної',
        'preconnect = DNS+TCP+TLS, dns-prefetch = лише DNS',
        'Для preload обов\'язковий as, для шрифтів — crossorigin',
        'Надлишок hints шкодить: конкуренція за смугу'
      ],
      followUps: [
        'Чому не варто робити preload для всього?',
        'Що таке 103 Early Hints?',
        'Як пришвидшити LCP-зображення, що задане через background-image?'
      ]
    },
    // ------------------------------------------------------------ Reflow / repaint / layout thrashing
    {
      id: 'render-reflow-repaint', group: "reflow", why: ["Так: геометрія → layout, колір → лише paint.","Ні: браузер групує зміни до кадру або до примусового читання.","Так: зміна розміру каскадно зачіпає сусідів і предків.","Так: transform/opacity на шарі — лише composite.","Ні: visibility не змінює геометрію — лише paint."],
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Reflow vs repaint vs composite',
      tags: ['reflow', 'repaint', 'performance'],
      question: 'Що таке reflow (layout) і repaint? Що їх викликає і чому reflow дорожчий? Як мінімізувати їх кількість? Оберіть **усі** правильні твердження.',
      choices: [
        'Зміна `width` чи `font-size` тягне layout, paint і composite, а `color` — лише paint і composite',
        'Браузер робить reflow одразу після кожного присвоєння `el.style.*`, тож три зміни — три reflow',
        'Reflow дорожчий, бо зміна геометрії одного елемента може зачепити нащадків, сусідів і предків',
        '`transform` і `opacity` на елементі з власним шаром потребують лише composite',
        '`visibility: hidden` викликає reflow, бо елемент перестає займати місце в потоці'
      ],
      correct: [0, 2, 3],
      hint: 'Згадайте етапи конвеєра: layout → paint → composite. Зміна на ранньому етапі тягне за собою всі наступні.',
      answer: `
**Reflow (layout)** — перерахунок геометрії елементів: розмірів і позицій. **Repaint** — перемальовування пікселів без зміни геометрії. **Composite** — лише складання вже намальованих шарів.

Конвеєр каскадний: зміна, що потребує layout, тягне за собою paint і composite; зміна, що потребує paint, — ще й composite.

| Що змінюємо | Наслідок |
|---|---|
| \`width\`, \`height\`, \`margin\`, \`padding\`, \`top/left\`, \`font-size\`, \`display\`, текст, додавання/видалення вузлів, resize вікна | layout + paint + composite |
| \`color\`, \`background-color\`, \`box-shadow\`, \`border-radius\`, \`visibility\`, \`outline\` | paint + composite |
| \`transform\`, \`opacity\` (на елементі з власним шаром) | лише composite |

**Чому reflow дорогий:** зміна одного елемента може вплинути на нащадків, сусідів і предків (текст переноситься, flex/grid перераховуються). Рендерер має обійти частину або все дерево layout.

**Важливо:** браузер **не** робить layout після кожної зміни стилю — він позначає дерево як «брудне» (dirty) і робить layout один раз перед наступним кадром. Проблеми починаються, коли JS **читає** геометрію при брудному дереві — це **forced synchronous layout**.

**Як мінімізувати:**
- групувати читання й записи (спочатку всі читання, потім усі записи);
- змінювати клас замість багатьох inline-стилів;
- анімувати \`transform\`/\`opacity\` замість \`top/left/width\`;
- вставляти багато вузлів через \`DocumentFragment\` або один \`innerHTML\`;
- обмежувати область впливу: \`contain: layout\`, \`position: absolute/fixed\` для анімованих елементів;
- віртуалізація довгих списків.

\`\`\`js
// 3 зміни стилю — але лише ОДИН layout перед кадром
el.style.width = '100px';
el.style.height = '50px';
el.style.margin = '10px';
\`\`\`
`,
      keyPoints: [
        'Reflow — геометрія, repaint — пікселі, composite — складання шарів',
        'Каскад: layout тягне paint і composite',
        'Приклади властивостей для кожного етапу; transform/opacity — лише composite',
        'Браузер батчить зміни і робить layout перед кадром; читання геометрії форсує його',
        'Способи мінімізації: групування read/write, класи, transform, fragment, contain'
      ],
      followUps: [
        'Чи викликає зміна visibility reflow? А display?',
        'Які властивості й методи викликають forced synchronous layout?',
        'Як побачити reflow у DevTools?'
      ]
    },
    {
      id: 'render-what-triggers-layout', group: "reflow", why: ["Ні: колір — лише paint.","Так: ширина змінює геометрію.","Ні: transform — composite.","Так: розмір шрифту змінює розміри тексту.","Ні: opacity — composite.","Так: новий текст може змінити розміри."],
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Які зміни викликають layout',
      tags: ['reflow', 'repaint'],
      question: 'Оберіть **усі** зміни, що зазвичай викликають **layout (reflow)**:',
      options: [
        '`el.style.color = "red"`',
        '`el.style.width = "300px"`',
        '`el.style.transform = "translateX(10px)"`',
        '`el.style.fontSize = "20px"`',
        '`el.style.opacity = "0.5"`',
        '`el.textContent = "Новий довший текст"`'
      ],
      answer: [1, 3, 5],
      hint: 'Що з цього може змінити розмір або положення самого елемента чи його сусідів?',
      explanation: `
- \`width\` — пряма зміна геометрії → layout.
- \`fontSize\` — змінює розмір тексту, отже розміри блоку, переноси, позиції сусідів → layout.
- \`textContent\` — новий текст може мати іншу довжину/кількість рядків → layout.
- \`color\` — лише repaint: геометрія та сама.
- \`transform\` — не впливає на layout (елемент займає те саме місце в потоці, зсувається лише візуально); зазвичай лише composite.
- \`opacity\` — лише composite (для елемента у власному шарі) або paint.

Тому для анімацій руху і появи використовують \`transform\` та \`opacity\`.
`
    },
    {
      id: 'render-forced-layout-count', group: "reflow", why: ["Ні: читання offsetWidth після запису змушує рахувати одразу.","Ні: після кожного запису кеш геометрії недійсний.","Так: кожна ітерація «запис → читання» — примусовий layout.","Ні: перерахунок відбувається на кожній ітерації."],
      type: 'quiz',
      level: 2,
      title: 'Скільки разів буде layout?',
      tags: ['reflow', 'layout-thrashing'],
      question: `
\`boxes\` — масив зі 100 елементів. Скільки **синхронних (примусових)** layout'ів приблизно відбудеться під час виконання циклу?

\`\`\`js
for (let i = 0; i < boxes.length; i++) {
  boxes[i].style.width = container.offsetWidth / 2 + 'px';
}
\`\`\`
`,
      options: [
        '0 — браузер відкладає всі зміни до наступного кадру',
        '1 — браузер закешує `offsetWidth` після першого читання',
        '≈ 100 — читання після кожного запису змушує перерахувати layout',
        '2 — один на початку циклу й один у кінці'
      ],
      answer: 2,
      hint: 'Після `boxes[i].style.width = ...` дерево стає «брудним». Що має зробити браузер, щоб чесно повернути `container.offsetWidth` на наступній ітерації?',
      explanation: `
На кожній ітерації: **читання** \`container.offsetWidth\` → **запис** \`style.width\` (дерево стає dirty) → на наступній ітерації знову читання, і браузер **мусить** виконати layout синхронно, бо зміна ширини дитини теоретично могла вплинути на контейнер. Перша ітерація може обійтися без примусового layout (якщо дерево було чистим), решта ~99 — ні. Це **layout thrashing**.

- «0» — браузер справді відкладає записи, **але** лише доки JS не попросить геометрію.
- «1, кешує» — кеш скидається після будь-якого запису стилю.

**Виправлення** — винести читання з циклу:
\`\`\`js
const half = container.offsetWidth / 2;   // одне читання
for (const b of boxes) b.style.width = half + 'px'; // лише записи
\`\`\`
`
    },
    {
      id: 'render-layout-thrashing', group: "reflow", why: ["Так: запис → читання в циклі змушує рахувати layout щоразу.","Ні: thrashing — про примусові layout у JS, а не частоту анімацій.","Ні: саме читання геометрії і форсує layout.","Ні: offsetHeight теж залежить від layout.","Ні: thrashing буває в будь-якому коді, passive тут не допоможе."],
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Forced synchronous layout і layout thrashing',
      tags: ['layout-thrashing', 'reflow', 'performance'],
      question: 'Що таке forced synchronous layout і layout thrashing? Які API його викликають? Як знайти й виправити?',
      choices: [
        'Читання геометрії після запису стилів форсує синхронний layout; у циклі «запис-читання» — щоразу',
        'Thrashing — коли браузер перемальовує сторінку частіше за 60 разів на секунду через CSS-анімації',
        'Layout форсують лише записи стилів, а читання `offsetHeight` чи `getBoundingClientRect` безплатні',
        'Досить замінити `getBoundingClientRect` на `offsetHeight` — ця властивість не залежить від layout',
        'Forced layout виникає лише в обробниках `scroll`, тому вистачить зробити їх passive'
      ],
      correct: 0,
      hint: 'Браузер ледачий з layout — доки його не змусить JS.',
      answer: `
Зазвичай браузер виконує style/layout **один раз перед кадром**. Але якщо JS **читає** геометрію або обчислені стилі, коли є незастосовані зміни, браузер мусить зробити layout **синхронно, просто зараз** — це **forced synchronous layout** (forced reflow). Якщо в циклі чергуються запис і читання — layout виконується на кожній ітерації: **layout thrashing**.

**Що форсує layout (неповний список):**
- \`offsetTop/Left/Width/Height\`, \`offsetParent\`;
- \`clientTop/Left/Width/Height\`, \`scrollTop/Left/Width/Height\`;
- \`getBoundingClientRect()\`, \`getClientRects()\`;
- \`getComputedStyle()\` (доступ до геометричних значень), \`innerText\`;
- \`scrollIntoView()\`, \`focus()\`, \`scrollTo()\`, \`window.innerWidth/scrollY\`;
- \`elementFromPoint()\`.

\`\`\`js
// ❌ thrashing: R W R W R W ...
cards.forEach(c => { c.style.height = c.scrollHeight + 'px'; });

// ✅ батчинг: R R R ... W W W
const heights = cards.map(c => c.scrollHeight);
cards.forEach((c, i) => { c.style.height = heights[i] + 'px'; });
\`\`\`

**Як знайти:** DevTools → Performance: фіолетові блоки *Layout* з червоним трикутником і підписом *Forced reflow is a likely performance bottleneck*, з посиланням на рядок коду.

**Як виправити:**
1. Розділити фази: спочатку всі читання, потім усі записи.
2. Кешувати виміряні значення (не читати \`offsetWidth\` у циклі).
3. Відкладати записи в \`requestAnimationFrame\`, а читання робити на початку кадру; бібліотеки на кшталт **fastdom** організовують черги measure/mutate.
4. Використовувати \`ResizeObserver\`/\`IntersectionObserver\` замість ручних вимірів у scroll/resize.
5. Змінювати класи, а не багато стилів, і обмежувати область layout (\`contain\`).
`,
      keyPoints: [
        'Читання геометрії при «брудному» дереві змушує layout синхронно',
        'Thrashing — чергування write/read у циклі',
        'Перелік API: offset*, client*, scroll*, getBoundingClientRect, getComputedStyle, innerText, focus',
        'Виправлення: батчинг reads → writes, кешування, rAF/fastdom, Observers',
        'Діагностика: Performance panel, попередження Forced reflow'
      ],
      followUps: [
        'Чи викликає читання offsetWidth layout, якщо перед цим нічого не змінювали?',
        'Як влаштовано fastdom?',
        'Чим ResizeObserver кращий за обробник resize з getBoundingClientRect?'
      ]
    },
    {
      id: 'render-fix-thrashing', group: "reflow",
      type: 'dom',
      level: 3,
      title: 'Виправити layout thrashing',
      tags: ['layout-thrashing', 'reflow'],
      description: `
**Завдання.** Функція \`growAll(items)\` отримує **масив** елементів і має збільшити висоту кожного на 10px відносно поточної \`offsetHeight\` (у елементів \`box-sizing: border-box\`, тому \`offsetHeight\` можна напряму записувати в \`style.height\`).

**Де трапляється:** анімації списків, акордеони, вирівнювання висот карток.

Поточна реалізація працює правильно, але спричиняє **layout thrashing**: читання \`offsetHeight\` чергуються із записами \`style.height\`, тож браузер робить layout на кожній ітерації.

Перепишіть \`growAll\` так, щоб **жодне читання геометрії не відбувалося після запису стилю** (усі виміри — до всіх змін). Записуйте висоту через \`el.style.height\`.

Тести відстежують порядок читань (\`offsetHeight\`, \`clientHeight\`, \`getBoundingClientRect\`…) і записів у \`el.style\`.

**Як це працює:** Читання offsetHeight після запису стилю змушує браузер одразу перерахувати layout. Спершу прочитайте всі висоти в масив, потім в окремому циклі запишіть нові — один перерахунок замість N.
`,
      html: `<div id="list">
  <div class="item" style="height: 20px">A</div>
  <div class="item" style="height: 30px">B</div>
  <div class="item" style="height: 40px">C</div>
</div>`,
      css: `.item {
  box-sizing: border-box;
  border: 1px solid #66f;
  margin: 4px 0;
  background: #eef;
}
`,
      js: `function growAll(items) {
  for (const el of items) {
    const h = el.offsetHeight;          // читання
    el.style.height = (h + 10) + 'px';  // запис → наступне читання форсує layout
  }
}
`,
      editable: ['js'],
      solution: {
        js: `function growAll(items) {
  // Фаза 1: лише читання (layout максимум один раз)
  const heights = items.map((el) => el.offsetHeight);
  // Фаза 2: лише записи (layout відкладено до наступного кадру)
  items.forEach((el, i) => {
    el.style.height = heights[i] + 10 + 'px';
  });
}
`
      },
      hints: [
        'Розділіть роботу на дві фази: вимірювання і зміни.',
        'Спочатку зберіть усі висоти в масив через `items.map(el => el.offsetHeight)`, а потім окремим циклом запишіть нові значення.',
        'Не читайте `offsetHeight` (і взагалі геометрію) всередині циклу, де вже були записи `style.height`.'
      ],
      tests: [
        {
          name: 'збільшує висоту кожного елемента на 10px',
          code: `const items = $$('.item');
const before = items.map((el) => el.offsetHeight);
growAll(items);
expect(items.map((el) => el.offsetHeight)).toEqual(before.map((h) => h + 10));`
        },
        {
          name: 'жодного читання геометрії після запису стилю',
          code: `const log = [];
const restore = [];
function wrapGetter(proto, key) {
  const d = Object.getOwnPropertyDescriptor(proto, key);
  if (!d || !d.get) return;
  Object.defineProperty(proto, key, { configurable: true, get() { log.push('R'); return d.get.call(this); } });
  restore.push(() => Object.defineProperty(proto, key, d));
}
['offsetHeight', 'offsetWidth', 'offsetTop'].forEach((k) => wrapGetter(HTMLElement.prototype, k));
['clientHeight', 'clientWidth', 'scrollHeight'].forEach((k) => wrapGetter(Element.prototype, k));
const gbcr = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = function () { log.push('R'); return gbcr.apply(this, arguments); };
restore.push(() => { Element.prototype.getBoundingClientRect = gbcr; });
const sd = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style');
Object.defineProperty(HTMLElement.prototype, 'style', {
  configurable: true,
  get() {
    const s = sd.get.call(this);
    return new Proxy(s, {
      set(t, p, v) { log.push('W'); t[p] = v; return true; },
      get(t, p) {
        const v = t[p];
        if (typeof v !== 'function') return v;
        return (...a) => { if (p === 'setProperty') log.push('W'); return v.apply(t, a); };
      }
    });
  },
  set(v) { sd.set.call(this, v); }
});
restore.push(() => Object.defineProperty(HTMLElement.prototype, 'style', sd));
const items = $$('.item');
try {
  growAll(items);
} finally {
  restore.forEach((f) => f());
}
const firstW = log.indexOf('W');
expect(firstW).toBeGreaterThan(-1);
expect(log.filter((x) => x === 'W').length).toBeGreaterThanOrEqual(items.length);
const readsAfterWrite = log.slice(firstW).filter((x) => x === 'R').length;
expect(readsAfterWrite).toBe(0);`
        },
        {
          name: 'працює з порожнім масивом і з динамічними елементами',
          code: `expect(() => growAll([])).not.toThrow();
const box = document.createElement('div');
const els = [5, 15, 25].map((h) => {
  const d = document.createElement('div');
  d.className = 'item';
  d.style.height = h + 'px';
  box.append(d);
  return d;
});
document.body.append(box);
growAll(els);
expect(els.map((e) => e.offsetHeight)).toEqual([15, 25, 35]);
box.remove();`
        }
      ],
      explanation: `
**Чому старий код повільний:** після \`el.style.height = ...\` дерево layout позначене «брудним». Наступне \`offsetHeight\` змушує браузер виконати layout **синхронно**, щоб повернути актуальне значення. Для N елементів — до N layout'ів замість одного: O(N) перерахунків, кожен з яких сам може бути O(розмір дерева).

**Виправлення:** розділити фази — спочатку всі читання (один layout, якщо дерево брудне), потім усі записи (layout відкладено до кадру). Складність за кількістю layout'ів — O(1) замість O(N); пам'ять — O(N) на масив висот.

**Альтернативи:**
- для «підігнати під вміст» — CSS (\`height: auto\`, \`grid\`, \`fit-content\`) без JS взагалі;
- якщо читання і записи розкидані по різних модулях — черги measure/mutate (fastdom) або \`requestAnimationFrame\` для записів;
- для реакції на зміну розмірів — \`ResizeObserver\` (колбек викликається після layout, читання там «безкоштовні»).

**Типові помилки:** читати \`getBoundingClientRect()\` замість \`offsetHeight\` всередині того ж циклу (це теж форсує layout); використати \`getComputedStyle(el).height\` після запису — теж форсує style/layout.

**Що можуть спитати далі:** які ще властивості форсують layout? Як побачити forced reflow у DevTools? Як би ви організували батчинг, якщо читання та записи відбуваються в різних компонентах?
`
    },
    {
      id: 'render-batch-scheduler', group: "reflow",
      type: 'code',
      level: 3,
      title: 'Планувальник measure/mutate (як fastdom)',
      tags: ['layout-thrashing', 'raf', 'scheduler'],
      description: `
**Завдання.** Реалізуйте \`createScheduler(schedule)\` — спрощений аналог бібліотеки **fastdom**, що усуває layout thrashing, групуючи читання та записи DOM.

**Де трапляється:** бібліотека fastdom і планувальники в UI-фреймворках.

\`schedule(cb)\` — функція планування кадру (у браузері це \`requestAnimationFrame\`; у тестах — ручна черга).

Повертає об'єкт:
- \`measure(fn)\` — додає завдання на читання, повертає токен завдання;
- \`mutate(fn)\` — додає завдання на запис, повертає токен;
- \`clear(token)\` — скасовує ще не виконане завдання; повертає \`true\`, якщо скасовано, інакше \`false\`.

Вимоги:
1. Завдання **не виконуються синхронно**. На перше завдання викликається \`schedule(flush)\` — **один раз** на кадр, скільки б завдань не додали.
2. У \`flush\` спочатку виконуються **всі** measure, потім **усі** mutate — кожна група в порядку додавання.
3. \`mutate\`, доданий **під час фази читань**, виконується в тому ж кадрі (після читань). \`measure\` чи \`mutate\`, доданий **під час фази записів**, переноситься на **наступний** кадр (знову \`schedule\`).
4. Помилка в одному завданні не зупиняє інші (перехопіть її і виведіть через \`console.error\`).

\`\`\`js
const s = createScheduler(requestAnimationFrame);
s.mutate(() => el.style.height = h + 'px');
s.measure(() => { h = other.offsetHeight; });
// у кадрі: спочатку measure, потім mutate
\`\`\`

**Як це працює:** measure і mutate не виконуються одразу, а потрапляють у дві черги. На наступному кадрі (schedule) спершу виконуються всі читання, потім усі записи — тож немає чергування «запис → читання», яке змушує браузер перераховувати layout.
`,
      starter: `// План:
// 1. measure(fn) і mutate(fn) лише кладуть fn у черги reads/writes і повертають токен
// 2. Перший виклик планує flush через schedule (лише один раз на кадр)
// 3. flush: спершу всі reads, потім усі writes; нові задачі під час flush — на наступний кадр
// 4. clear(token) видаляє задачу з черги

function createScheduler(schedule) {
  return {
    measure(fn) { fn(); },
    mutate(fn) { fn(); },
    clear(token) { return false; }
  };
}
`,
      solution: `function createScheduler(schedule) {
  let reads = [];
  let writes = [];
  let scheduled = false;
  let phase = 'idle'; // 'idle' | 'read' | 'write'

  function request() {
    if (scheduled) return;
    scheduled = true;
    schedule(flush);
  }

  function run(task) {
    try {
      task.fn();
    } catch (err) {
      console.error(err);
    }
  }

  function flush() {
    scheduled = false;
    phase = 'read';
    // shift() у циклі: measure, доданий під час читань, теж виконається
    while (reads.length) run(reads.shift());
    phase = 'write';
    const batch = writes; // записи, додані під час записів, — вже в новому масиві
    writes = [];
    batch.forEach(run);
    phase = 'idle';
    if (reads.length || writes.length) request();
  }

  function add(queue, fn) {
    const task = { fn };
    queue.push(task);
    if (phase === 'idle') request();
    return task;
  }

  return {
    measure: (fn) => add(reads, fn),
    mutate: (fn) => add(writes, fn),
    clear(token) {
      for (const q of [reads, writes]) {
        const i = q.indexOf(token);
        if (i !== -1) {
          q.splice(i, 1);
          return true;
        }
      }
      return false;
    }
  };
}
`,
      hints: [
        'Тримайте дві черги (reads, writes) і прапорець `scheduled`, щоб `schedule` викликався лише раз на кадр.',
        'У `flush` спершу спорожніть чергу читань (`while (reads.length) reads.shift()...`), потім заберіть поточний масив записів і замініть його новим — так записи, додані під час фази записів, підуть у наступний кадр.',
        'Токен — це сам об\'єкт завдання `{ fn }`; `clear` шукає його в обох чергах через `indexOf` і видаляє `splice`. Кожне завдання обгорніть у `try/catch`.'
      ],
      tests: [
        {
          name: 'не виконує синхронно і планує кадр лише раз',
          code: `const q = [];
const schedule = mockFn((cb) => q.push(cb));
const s = createScheduler(schedule);
const f = mockFn();
s.measure(f); s.mutate(f); s.measure(f);
expect(f).not.toHaveBeenCalled();
expect(schedule).toHaveBeenCalledTimes(1);
q.shift()();
expect(f).toHaveBeenCalledTimes(3);`
        },
        {
          name: 'усі measure перед усіма mutate, у порядку додавання',
          code: `const q = [];
const s = createScheduler((cb) => q.push(cb));
const log = [];
s.mutate(() => log.push('w1'));
s.measure(() => log.push('r1'));
s.mutate(() => log.push('w2'));
s.measure(() => log.push('r2'));
q.shift()();
expect(log).toEqual(['r1', 'r2', 'w1', 'w2']);`
        },
        {
          name: 'mutate з measure — у тому ж кадрі; measure з mutate — у наступному',
          code: `const q = [];
const schedule = mockFn((cb) => q.push(cb));
const s = createScheduler(schedule);
const log = [];
s.measure(() => {
  log.push('r1');
  s.mutate(() => {
    log.push('w1');
    s.measure(() => log.push('r2'));
  });
});
q.shift()();
expect(log).toEqual(['r1', 'w1']);
expect(schedule).toHaveBeenCalledTimes(2);
q.shift()();
expect(log).toEqual(['r1', 'w1', 'r2']);
expect(q).toHaveLength(0);`
        },
        {
          name: 'clear скасовує завдання',
          code: `const q = [];
const s = createScheduler((cb) => q.push(cb));
const a = mockFn(), b = mockFn();
const ta = s.measure(a);
s.mutate(b);
expect(s.clear(ta)).toBe(true);
expect(s.clear(ta)).toBe(false);
q.shift()();
expect(a).not.toHaveBeenCalled();
expect(b).toHaveBeenCalledTimes(1);`
        },
        {
          name: 'після кадру нове завдання планує новий кадр',
          code: `const q = [];
const schedule = mockFn((cb) => q.push(cb));
const s = createScheduler(schedule);
s.measure(() => {});
q.shift()();
const f = mockFn();
s.mutate(f);
expect(schedule).toHaveBeenCalledTimes(2);
q.shift()();
expect(f).toHaveBeenCalledTimes(1);`
        },
        {
          name: 'помилка в одному завданні не зупиняє інші',
          code: `const q = [];
const s = createScheduler((cb) => q.push(cb));
const after = mockFn();
s.measure(() => { throw new Error('boom'); });
s.measure(after);
s.mutate(after);
expect(() => q.shift()()).not.toThrow();
expect(after).toHaveBeenCalledTimes(2);`
        }
      ],
      explanation: `
**Ідея:** layout thrashing виникає, коли читання й записи DOM чергуються. Планувальник збирає їх у дві черги й виконує раз на кадр: **всі читання** (максимум один layout) → **всі записи** (layout відкладено до рендерингу).

**Деталі реалізації:**
- прапорець \`scheduled\` гарантує один \`schedule(flush)\` на кадр — O(1) на додавання;
- фаза читань спорожнює чергу через \`shift()\` — measure, доданий з measure, виконається тут же (читання після читань безпечні);
- записи забираються «знімком» (\`const batch = writes; writes = []\`) — усе, що додано під час записів, піде в наступний кадр. Це важливо: measure після mutate в тому ж кадрі знову спричинив би forced layout, а mutate з mutate могли б зациклити кадр;
- \`clear\` — O(n) пошук у черзі; можна зробити O(1) через \`Set\` або прапорець \`task.cancelled\`.

**Складність:** додавання O(1), \`flush\` O(k) для k завдань.

**Типові помилки:** забути скинути \`scheduled\` (наступні кадри не плануються); виконувати завдання синхронно; запускати \`schedule\` на кожне завдання; не ізолювати помилки — одна помилка «з'їдає» решту кадру.

**Що можуть спитати далі:** чому саме \`requestAnimationFrame\`, а не \`setTimeout\`? Як додати проміс-API (\`await s.measure(...)\`)? Як React вирішує схожу задачу (батчинг оновлень, фази render/commit, \`useLayoutEffect\`)?
`
    },
    // ------------------------------------------------------------ Compositing & layers
    {
      id: 'render-quiz-busy-main-thread', group: 'compositing', type: 'quiz', level: 2,
      title: 'Головний потік зайнятий: яка анімація не зупиниться',
      tags: ['composite', 'animation', 'main-thread'],
      question: `На сторінці три спінери крутяться без кінця. Кнопка запускає важкий синхронний JavaScript на 2 секунди. Який спінер **продовжить** плавно рухатися, поки головний потік зайнятий?
\`\`\`css
@keyframes spin  { to { transform: rotate(360deg); } }
@keyframes slide { to { left: 100px; } }

.a { animation: spin 1s linear infinite; }
.b { position: relative; animation: slide 1s linear infinite alternate; }
\`\`\`
\`\`\`js
// .c обертається з JavaScript
function tick(t) {
  c.style.transform = \`rotate(\${t / 3}deg)\`;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
\`\`\``,
      options: [
        'Лише `.a`',
        'Усі три',
        '`.a` і `.c`',
        'Жоден'
      ],
      answer: 0,
      why: [
        'Так: CSS-анімацію `transform` виконує compositor в окремому потоці — йому не потрібен головний потік.',
        'Ні: `left` змінює геометрію і вимагає layout на головному потоці, а колбеки `requestAnimationFrame` не викликаються, поки потік зайнятий.',
        'Ні: `.c` теж змінює лише `transform`, але кожен кадр задає JavaScript у колбеку rAF, а він чекає на звільнення головного потоку.',
        'Ні: compositor-анімації продовжуються навіть під час довгої задачі — сторінка «замерзає» лише частково.'
      ],
      hint: 'Де обчислюється кожен кадр кожної анімації: на головному потоці чи в compositor?',
      explanation: 'CSS-анімації й переходи лише `transform` і `opacity` браузер передає compositor-потоку: шар уже намальований, лишається обертати чи зсувати його на GPU. Тому вони продовжуються, навіть коли головний потік виконує довгу задачу. `left` змінює геометрію — потрібен layout на головному потоці, тож анімація зупиняється. Анімація через `requestAnimationFrame` теж стоїть: її колбек виконується на головному потоці. Висновок для плавності й INP: анімуйте `transform`/`opacity` засобами CSS або Web Animations API, а важку роботу ділить на частини (модуль «Продуктивність»).'
    },
    {
      id: 'render-transform-animation', group: "compositing",
      type: 'dom',
      level: 2,
      title: 'Перевести анімацію на transform',
      tags: ['composite', 'animation', 'css'],
      description: `
**Завдання.** Панель \`.panel\` виїжджає на 200px праворуч, коли їй додають клас \`.open\`. Зараз анімується властивість \`left\`, що спричиняє layout і paint на **кожному кадрі**.

**Де трапляється:** бічні меню, модалки, тости — анімації без ривків.

Перепишіть CSS так, щоб:
- у стані \`.open\` панель зсувалася на **200px праворуч** через \`transform\`;
- \`transition\` анімував **лише** \`transform\` (не \`left\` і не \`all\`);
- обчислене значення \`left\` у стані \`.open\` не змінювалося.

HTML і JS не змінюйте.

**Як це працює:** left змінює геометрію і на кожному кадрі викликає layout і paint. transform: translateX рухає вже намальований шар — лише composite, плавно і дешево.
`,
      html: `<div class="track">
  <div class="panel">Panel</div>
</div>`,
      css: `.track {
  position: relative;
  width: 400px;
  height: 100px;
  background: #eee;
}
.panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
  background: #66f;
  color: #fff;
  transition: left 0.3s ease;
}
.panel.open {
  left: 200px;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.track {
  position: relative;
  width: 400px;
  height: 100px;
  background: #eee;
}
.panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
  background: #66f;
  color: #fff;
  /* лише compositor-властивість */
  transition: transform 0.3s ease;
}
.panel.open {
  transform: translateX(200px);
}
`
      },
      hints: [
        'Замість зміни `left` у `.open` використайте `transform: translateX(...)`.',
        'У `transition` вкажіть саме `transform`, а не `left` чи `all`.'
      ],
      tests: [
        {
          name: 'transition анімує лише transform',
          code: `const tp = css('.panel', 'transition-property');
expect(tp).toMatch(/transform/);
expect(tp).not.toMatch(/left|all/);`
        },
        {
          name: '.open зсуває панель на 200px через transform, left не змінюється',
          code: `const p = $('.panel');
p.style.transition = 'none';
const leftBefore = css(p, 'left');
const x0 = rect(p).left - rect('.track').left;
p.classList.add('open');
try {
  expect(css(p, 'left')).toBe(leftBefore);
  expect(css(p, 'transform')).not.toBe('none');
  expect(Math.round(rect(p).left - rect('.track').left - x0)).toBe(200);
} finally {
  p.classList.remove('open');
  void p.offsetWidth; // застосувати стан без анімації
  p.style.transition = '';
}`
        },
        {
          name: 'у закритому стані панель на початку треку',
          code: `const p = $('.panel');
expect(Math.round(rect(p).left - rect('.track').left)).toBe(0);
expect(css(p, 'transform')).toBe('none');`
        }
      ],
      explanation: `
\`left\` — геометрична властивість: на кожному кадрі анімації браузер робить layout і paint. \`transform\` не впливає на потік документа: елемент займає те саме місце, а зсув застосовується на етапі **composite**. Під час анімації браузер виносить елемент в окремий шар, і compositor thread може анімувати його без участі main thread — анімація лишається плавною, навіть якщо JS зайнятий.

**Альтернативи:** \`translate: 200px\` (окрема властивість CSS Transforms Level 2); Web Animations API (\`el.animate([{ transform: ... }], 300)\`).

**Типові помилки:** \`transition: all\` — анімує все підряд, включно з layout-властивостями при майбутніх змінах; залишити \`left\` у \`.open\` разом із transform (подвійний зсув); вішати \`will-change: transform\` на всі елементи «про запас».

**Що можуть спитати далі:** чому \`transform\` не викликає reflow? Що таке FLIP-анімація? Коли \`opacity\`-анімація все-таки спричиняє paint?
`
    },
    {
      id: 'render-layers-will-change', group: "compositing", why: ["Ні: кожен шар коштує пам'яті, масове will-change шкодить.","Так: compositor складає шари без main thread.","Так: шари дорогі, перекриття плодить нові.","Ні: will-change: transform створює stacking context і containing block.","Так: точкове вмикання і вимикання — правильний підхід."],
      type: 'theory',
      level: 3,
      title: 'Шари композитингу та will-change',
      tags: ['composite', 'layers', 'will-change'],
      question: 'Що таке compositing layers? Коли браузер створює окремий шар, чим це корисно і чим шкідливо? Як правильно використовувати `will-change`? Оберіть **усі** правильні твердження.',
      choices: [
        '`will-change: transform` варто дати всім елементам сторінки — тоді всі анімації стануть плавнішими',
        'Анімацію `transform`/`opacity` шару compositor thread складає без layout і paint',
        'Кожен шар займає GPU-пам\'ять, а перекриття неявно створює нові шари (layer explosion)',
        'Окремий шар не впливає на верстку: `will-change` не створює stacking context',
        '`will-change` краще ставити перед анімацією і прибирати після неї, повертаючи `auto`'
      ],
      correct: [1, 2, 4],
      hint: 'Шар — це окрема текстура, яку можна рухати без перемальовування. Але текстури живуть у пам\'яті GPU.',
      answer: `
**Шар композитингу** — частина сторінки, яка малюється в окрему текстуру (bitmap). На етапі composite шари накладаються з урахуванням \`transform\`, \`opacity\`, порядку. Composite виконується в **compositor thread** (і на GPU), тому анімації \`transform\`/\`opacity\` шару не потребують main thread.

**Коли елемент отримує власний шар (Chrome, приблизно):**
- 3D-transform або \`translateZ(0)\` / \`translate3d\` («хак»);
- \`will-change: transform | opacity\`;
- активна CSS-анімація/transition \`transform\` або \`opacity\`;
- \`<video>\`, \`<canvas>\` з WebGL, \`iframe\`;
- \`position: fixed\` (часто), \`backdrop-filter\`;
- **неявно**: елемент перекриває інший шар і має бути над ним → теж виноситься (overlap). Це причина **layer explosion**.

**Користь:** плавні анімації, scroll без перемальовування, ізоляція перемальовувань.

**Шкода:**
- пам'ять: шар 1000×1000 px ≈ 4 МБ (RGBA), на мобільних швидко закінчується GPU-пам'ять;
- більше шарів → дорожчий сам composite і завантаження текстур;
- можлива розмитість тексту (втрата субпіксельного згладжування);
- \`will-change: transform\` створює **stacking context** і **containing block** для \`position: fixed\` нащадків — може зламати верстку.

**\`will-change\` правильно:**
\`\`\`js
el.addEventListener('pointerenter', () => { el.style.willChange = 'transform'; });
el.addEventListener('transitionend', () => { el.style.willChange = 'auto'; });
\`\`\`
- додавати незадовго до анімації і прибирати після;
- точково, на кілька елементів, а не \`* { will-change: ... }\`;
- для постійно анімованих елементів (наприклад, слайдер) можна залишити в CSS.

**Діагностика:** DevTools → Layers panel (кількість, розмір, причина створення), Rendering → *Layer borders*, *Paint flashing*.
`,
      keyPoints: [
        'Шар — окрема текстура, яку compositor складає без layout/paint',
        'Причини створення: 3D transform, will-change, анімації transform/opacity, video/canvas, overlap',
        'Ціна: пам\'ять GPU, layer explosion, розмитий текст',
        'will-change: точково, перед анімацією, прибирати після',
        'will-change/transform створюють stacking context і containing block для fixed'
      ],
      followUps: [
        'Що таке layer explosion і як його виявити?',
        'Чому translateZ(0) раніше використовували як «хак»?',
        'Чому position: fixed всередині елемента з transform перестає бути прив\'язаним до viewport?'
      ]
    },
    {
      id: 'render-will-change-everything', group: "compositing", why: ["Ні: багато шарів — дорого для пам'яті й composite.","Ні: will-change діє незалежно від transition.","Так: пам'ять, дорожчий composite, і transform-контекст ламає position: fixed нащадків.","Ні: z-порядок визначає stacking context, а не саме will-change."],
      type: 'quiz',
      level: 3,
      title: 'will-change на всіх елементах',
      tags: ['will-change', 'layers'],
      question: 'Щоб «прискорити все», розробник додав у глобальні стилі `* { will-change: transform; }`. Що найімовірніше станеться?',
      options: [
        'Усі анімації та скрол стануть плавнішими, побічних ефектів немає',
        'Браузер проігнорує правило, бо `will-change` діє лише на елементи з `transition`',
        'Зросте споживання пам\'яті (багато шарів), composite стане дорожчим, а `position: fixed` елементи всередині можуть «прилипнути» до батьків замість viewport',
        'Зміниться лише порядок відмальовки: елементи з `will-change` завжди будуть поверх інших'
      ],
      answer: 2,
      hint: 'Шари — не безкоштовні. І `will-change: transform` поводиться так, ніби transform уже заданий.',
      explanation: `
- Кожен шар — текстура в пам'яті; тисячі шарів призводять до великого споживання (особливо на мобільних), дорогого composite і навіть до падіння продуктивності.
- \`will-change: transform\` створює **stacking context** і **containing block** для \`position: fixed\`-нащадків, як справжній \`transform\`. Модалки й тулбари з \`position: fixed\` почнуть позиціонуватися відносно предка.
- «Без побічних ефектів» — головна помилка: will-change — підказка з ціною.
- «Ігнорує» — ні, правило застосовується до будь-якого елемента.
- «Завжди поверх» — stacking context впливає на z-index-порядок, але не робить елемент «завжди поверх»; це не основний ефект.

Правильно — ставити \`will-change\` точково і ненадовго.
`
    },
    // ------------------------------------------------------------ requestAnimationFrame
    {
      id: 'render-raf-basics', group: "raf", why: ["Ні: rAF прив'язаний до кадру, а не до таймера.","Так: перед оновленням кадру.","Ні: rAF — не мікрозадача.","Ні: виконується до малювання кадру."],
      type: 'quiz',
      level: 1,
      title: 'Коли викликається requestAnimationFrame',
      tags: ['raf', 'event-loop'],
      question: 'Коли браузер викликає колбек, переданий у `requestAnimationFrame(cb)`?',
      options: [
        'Рівно через 16 мс, як `setTimeout(cb, 16)`',
        'Перед наступним оновленням екрана (перед style/layout/paint кадру)',
        'Одразу після поточного синхронного коду, як мікрозадачу',
        'Після того, як кадр уже відмальовано'
      ],
      answer: 1,
      hint: 'Назва підказує: «запит на кадр анімації». Що логічно зробити перед тим, як малювати?',
      explanation: `
\`requestAnimationFrame\` реєструє колбек, який виконається **перед наступним рендерингом** — після задачі й мікрозадач, але до style/layout/paint. Частота відповідає частоті оновлення екрана (60, 120, 144 Гц…), а не фіксованим 16 мс. У фонових вкладках rAF не викликається (економія батареї).

- \`setTimeout(cb, 16)\` — не синхронізований з кадрами, може «пропускати» кадри або малювати двічі за кадр.
- Мікрозадачі (\`Promise.then\`, \`queueMicrotask\`) виконуються значно раніше — одразу після поточного коду.
- «Після відмальовки» — так поводиться трюк «double rAF» або \`setTimeout\` усередині rAF, але не сам rAF.

Колбек отримує \`DOMHighResTimeStamp\` — час початку кадру; його використовують для анімацій, незалежних від частоти кадрів.
`
    },
    {
      id: 'render-raf-event-loop', group: "raf", why: ["Ні: rAF виконується на кроці рендерингу, не як мікрозадача.","Ні: порядок rAF і setTimeout(0) не гарантований.","Ні: у фонових вкладках rAF зупиняється.","Так: rAF синхронізований з кадром — ідеально для анімацій.","Ні: rAF перед paint, зміни потрапляють у поточний кадр."],
      type: 'theory',
      level: 3,
      interview: true,
      title: 'rAF, бюджет кадру і event loop',
      tags: ['raf', 'event-loop', 'performance'],
      question: 'Що таке бюджет кадру? Де в event loop виконується requestAnimationFrame і чому для анімацій його використовують замість setTimeout/setInterval?',
      choices: [
        '`requestAnimationFrame` — мікрозадача, тому виконується одразу після поточного коду, до таймерів',
        'rAF гарантовано виконується раніше за `setTimeout(fn, 0)`, запланований у тому самому коді',
        'rAF працює з тією ж частотою і у фонових вкладках — так само, як `setInterval`',
        'Кадр при 60 Гц — ~16.6 мс; rAF викликається на кроці рендерингу, перед style/layout/paint',
        'rAF викликається після paint, тож зроблені в ньому зміни з\'являються на екрані лише через кадр'
      ],
      correct: 3,
      hint: 'Один «оберт» event loop: задача → мікрозадачі → можливо, рендеринг. Що входить у крок рендерингу?',
      answer: `
**Бюджет кадру.** При 60 Гц у браузера є ~**16.6 мс** на кадр (при 120 Гц — ~8.3 мс). За цей час треба виконати JS, style, layout, paint, composite. Практична рекомендація — тримати власну роботу в межах ~10 мс. Задачі довші за **50 мс** вважаються *long tasks* і погіршують відгук (INP).

**Місце rAF в event loop (спрощено):**
1. Взяти одну **макрозадачу** (подія, таймер, повідомлення) і виконати.
2. Виконати **всі мікрозадачі**.
3. Якщо настав час оновити екран (*rendering opportunity*):
   - обробити події resize/scroll, media queries;
   - **колбеки \`requestAnimationFrame\`**;
   - style → layout → (ResizeObserver, IntersectionObserver) → paint → composite.
4. Якщо лишився час до наступного кадру — \`requestIdleCallback\`.

\`\`\`js
function animate(ts) {
  const progress = Math.min((ts - start) / 1000, 1);
  box.style.transform = \`translateX(\${progress * 300}px)\`;
  if (progress < 1) requestAnimationFrame(animate);
}
const start = performance.now();
requestAnimationFrame(animate);
\`\`\`

**Чому rAF кращий за таймери:**
- синхронізований з частотою екрана: рівно один виклик на кадр, без «зайвих» оновлень і пропусків (jank);
- ставиться на паузу у фонових вкладках/прихованих iframe;
- зміни, зроблені в rAF, потрапляють у **той самий** кадр, бо layout/paint іде одразу після;
- таймери можуть спрацювати посеред кадру або двічі за кадр, а при навантаженні дрейфують.

**Нюанси:**
- порядок rAF відносно \`setTimeout(fn, 0)\` **не гарантований** — залежить від того, коли настане кадр;
- читати геометрію на початку rAF безпечно (layout ще чистий з попереднього кадру), а записи — після читань;
- rAF, викликаний усередині rAF-колбека, піде в **наступний** кадр;
- «double rAF» — спосіб виконати код **після** відмальовки кадру;
- анімації варто будувати на часі (\`ts\`), а не на кількості кадрів, бо частота різна.
`,
      keyPoints: [
        '~16.6 мс на кадр при 60 Гц; long task > 50 мс',
        'rAF виконується в кроці рендерингу: після задачі й мікрозадач, перед style/layout/paint',
        'Синхронізація з екраном, пауза у фоні — переваги над setTimeout',
        'Порядок rAF vs setTimeout(0) не гарантований',
        'Анімація на основі timestamp, а не кількості кадрів'
      ],
      followUps: [
        'Що таке requestIdleCallback і коли його використовувати?',
        'Що виконається першим: Promise.then чи rAF?',
        'Як виконати код після того, як кадр відмальовано?',
        'Чому анімацію краще рахувати від часу, а не від кадрів?'
      ]
    },
    {
      id: 'render-raf-order', group: "raf", why: ["Ні: timeout може бути і після raf.","Ні: raf не завжди раніше за timeout.","Так: sync і micro — завжди першими, далі залежить від моменту кадру.","Ні: мікрозадачі виконуються до будь-якої макрозадачі."],
      type: 'quiz',
      level: 3,
      title: 'sync, мікрозадача, setTimeout і rAF',
      tags: ['raf', 'event-loop'],
      question: `
Що можна **гарантовано** сказати про порядок виводу?

\`\`\`js
setTimeout(() => console.log('timeout'), 0);
requestAnimationFrame(() => console.log('raf'));
Promise.resolve().then(() => console.log('micro'));
console.log('sync');
\`\`\`
`,
      options: [
        '`sync, micro, timeout, raf` — завжди',
        '`sync, micro, raf, timeout` — завжди',
        '`sync, micro`, а далі порядок `timeout` і `raf` не гарантований',
        '`sync, timeout, micro, raf` — завжди'
      ],
      answer: 2,
      hint: 'rAF прив\'язаний не до черги задач, а до моменту наступного кадру. Коли він настане — залежить від того, де ми зараз у 16-мілісекундному циклі.',
      explanation: `
1. \`sync\` — синхронний код виконується першим.
2. \`micro\` — мікрозадачі виконуються одразу після поточного скрипту, до будь-яких таймерів і рендерингу.
3. Далі — гонка: \`setTimeout(…, 0)\` — це макрозадача, а rAF — частина кроку рендерингу, який відбувається лише тоді, коли настає час нового кадру. Якщо кадр «ось-ось», першим буде \`raf\`; якщо щойно був — \`timeout\`. На практиці в Chrome частіше \`timeout\` першим, але специфікація цього **не гарантує**.

- «timeout перед micro» — класична помилка: мікрозадачі завжди перед наступною макрозадачею.
- Обидва варіанти з «завжди» — неправильні саме через слово «завжди».
`
    },
    {
      id: 'render-raf-throttle', group: "raf",
      type: 'code',
      level: 2,
      title: 'rafThrottle: не частіше одного разу на кадр',
      tags: ['raf', 'scroll', 'performance'],
      description: `
**Завдання.** Події \`scroll\`, \`pointermove\`, \`resize\` можуть приходити частіше, ніж оновлюється екран. Оновлювати DOM частіше за кадр — марна робота.

**Де трапляється:** обробники scroll/pointermove: паралакс, drag, sticky-ефекти.

Реалізуйте \`rafThrottle(fn, schedule)\`:
- повертає функцію, яка викликає \`fn\` **не частіше одного разу на кадр**;
- \`fn\` викликається в наступному кадрі з **аргументами та \`this\` останнього** виклику;
- \`schedule(cb)\` — планувальник кадру (за замовчуванням \`requestAnimationFrame\`); у тестах — ручна черга;
- у поверненої функції є метод \`cancel()\`, що скасовує запланований виклик (наступні виклики знову працюють).

\`\`\`js
const onScroll = rafThrottle((y) => header.classList.toggle('compact', y > 50));
window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
\`\`\`

**Як це працює:** Перший виклик планує кадр через schedule і запам'ятовує аргументи; наступні виклики до кадру лише оновлюють аргументи. У кадрі fn викликається один раз з ОСТАННІМИ аргументами, і прапорець скидається.
`,
      starter: `function rafThrottle(fn, schedule = (cb) => requestAnimationFrame(cb)) {
  let pending = false; // кадр уже заплановано?
  let lastArgs;
  let lastThis;

  function throttled(...args) {
    // 1. Запам'ятати args і this (завжди останні)
    // 2. Якщо кадр уже заплановано — вийти
    // 3. Інакше pending = true і schedule(() => { pending = false; fn.apply(lastThis, lastArgs); })
    // TODO
  }

  throttled.cancel = function () {
    // TODO: скасувати запланований виклик (наприклад, лічильник «поколінь» кадру)
  };

  return throttled;
}
`,
      solution: `function rafThrottle(fn, schedule = (cb) => requestAnimationFrame(cb)) {
  let pending = false;
  let frameId = 0; // «покоління» кадру — для cancel
  let lastArgs;
  let lastThis;

  function throttled(...args) {
    lastArgs = args;
    lastThis = this;
    if (pending) return; // кадр уже заплановано — лише оновили аргументи
    pending = true;
    const id = ++frameId;
    schedule(() => {
      if (id !== frameId) return; // кадр скасовано
      pending = false;
      fn.apply(lastThis, lastArgs);
    });
  }

  throttled.cancel = () => {
    frameId++;
    pending = false;
  };

  return throttled;
}
`,
      hints: [
        'Зберігайте прапорець «кадр уже заплановано» і останні аргументи/`this`.',
        'На кожен виклик оновлюйте `lastArgs`/`lastThis`; `schedule` викликайте лише якщо кадр ще не заплановано. У колбеку кадру скиньте прапорець і викличте `fn.apply(lastThis, lastArgs)`.',
        'Для `cancel()` без доступу до `cancelAnimationFrame` можна використати лічильник поколінь: колбек кадру порівнює свій id з поточним і нічого не робить, якщо вони різні.'
      ],
      tests: [
        {
          name: 'один виклик за кадр з останніми аргументами',
          code: `const q = [];
const schedule = mockFn((cb) => q.push(cb));
const f = mockFn();
const t = rafThrottle(f, schedule);
t(1); t(2); t(3);
expect(f).not.toHaveBeenCalled();
expect(schedule).toHaveBeenCalledTimes(1);
q.shift()();
expect(f).toHaveBeenCalledTimes(1);
expect(f).toHaveBeenCalledWith(3);`
        },
        {
          name: 'зберігає this останнього виклику',
          code: `const q = [];
const t = rafThrottle(function () { this.hit = (this.hit || 0) + 1; }, (cb) => q.push(cb));
const a = { t }, b = { t };
a.t(); b.t();
q.shift()();
expect(a.hit).toBeUndefined();
expect(b.hit).toBe(1);`
        },
        {
          name: 'у наступному кадрі можна викликати знову',
          code: `const q = [];
const f = mockFn();
const t = rafThrottle(f, (cb) => q.push(cb));
t('a');
q.shift()();
t('b'); t('c');
expect(q).toHaveLength(1);
q.shift()();
expect(f.mock.calls).toEqual([['a'], ['c']]);`
        },
        {
          name: 'cancel скасовує запланований виклик',
          code: `const q = [];
const f = mockFn();
const t = rafThrottle(f, (cb) => q.push(cb));
expect(typeof t.cancel).toBe('function');
t(1);
t.cancel();
t(2);
while (q.length) q.shift()();
expect(f).toHaveBeenCalledTimes(1);
expect(f).toHaveBeenCalledWith(2);`
        }
      ],
      explanation: `
Перший виклик планує кадр, наступні до настання кадру лише оновлюють аргументи. У кадрі \`fn\` отримує **найсвіжіші** дані — саме те, що потрібно для відмальовки (позиція скролу чи курсора на момент кадру).

**Складність:** O(1) на виклик, O(1) пам'яті.

**Відмінність від класичного throttle(ms):** інтервал задає не таймер, а частота екрана: на 120 Гц — до 120 оновлень/с, у фоновій вкладці — 0. Немає «leading»-виклику: перший виклик теж відкладається до кадру — це нормально, бо раніше кадру зміни все одно не побачать.

**Чому \`cancel\` через лічильник:** ми не маємо id від \`schedule\` (у тестах це довільна функція). У браузері можна зберігати id з \`requestAnimationFrame\` і викликати \`cancelAnimationFrame\`.

**Типові помилки:** передавати аргументи **першого** виклику; планувати кадр на кожен виклик; не скидати прапорець у колбеку (функція «замерзає» після першого кадру); не зберігати \`this\`.

**Що можуть спитати далі:** чому scroll-обробник варто робити \`passive\`? Чим тут кращий \`IntersectionObserver\` (наприклад, для «липкої» шапки)? Як реалізувати \`cancel\` через \`cancelAnimationFrame\`?
`
    },
    // ------------------------------------------------------------ contain, content-visibility, fonts
    {
      id: 'render-content-visibility', group: "advanced", why: ["Ні: вузли лишаються в DOM.","Ні: вміст рендериться, коли наближається до viewport.","Ні: це не лише картинки — пропускається весь рендеринг секції.","Так: рендеринг поза екраном пропускається, DOM і пошук лишаються."],
      type: 'quiz',
      level: 3,
      title: 'content-visibility: auto',
      tags: ['contain', 'performance', 'css'],
      question: 'Довга сторінка складається з багатьох секцій. Розробник додав `section { content-visibility: auto; contain-intrinsic-size: auto 800px; }`. Що це дає?',
      options: [
        'Секції поза екраном видаляються з DOM і повертаються при скролі (як віртуалізація)',
        'Те саме, що `visibility: hidden` для секцій поза екраном',
        'Лише відкладає завантаження картинок усередині секцій, як `loading="lazy"`',
        'Браузер пропускає style/layout/paint вмісту секцій далеко від viewport; вміст лишається в DOM (пошук, a11y), а `contain-intrinsic-size` задає місце-заглушку, щоб не стрибав скролбар'
      ],
      answer: 3,
      hint: 'Ця властивість — частина специфікації CSS Containment. Що «ізолює» containment?',
      explanation: `
\`content-visibility: auto\` вмикає containment (layout, style, paint) і дозволяє браузеру **не рендерити вміст** елемента, доки він далеко від viewport. Початковий рендеринг довгих сторінок може пришвидшитися в рази.

- Вузли **лишаються в DOM**: доступні для пошуку по сторінці (Ctrl+F), скрінрідерів, якорів — на відміну від віртуалізації.
- Оскільки вміст не прораховано, елемент мав би нульову висоту — тому \`contain-intrinsic-size\` задає оціночний розмір (\`auto\` запам'ятовує реальний після першого рендерингу), інакше скролбар стрибає (CLS).
- \`visibility: hidden\` — елемент займає місце й рахується в layout, просто не малюється; і він ховає вміст навіть у viewport.
- Картинки — окрема історія (\`loading="lazy"\`), хоча зображення в невідрендерених секціях теж можуть не декодуватися.

Суміжне: \`contain: layout paint\` — обмежує вплив змін усередині елемента на решту сторінки.
`
    },
    {
      id: 'render-font-display', group: "advanced", why: ["Ні: це block (FOIT).","Ні: це optional.","Так: fallback одразу, потім заміна (FOUT).","Ні: шрифт вантажиться за потреби, не після load."],
      type: 'quiz',
      level: 2,
      title: 'font-display: swap',
      tags: ['fonts', 'performance'],
      question: 'Як поводиться текст, якщо для веб-шрифту задано `font-display: swap`?',
      options: [
        'Текст невидимий до ~3 с, поки вантажиться шрифт (FOIT), потім fallback',
        'Дуже короткий період невидимості (~100 мс); якщо шрифт не встиг — fallback до кінця візиту',
        'Текст одразу показується fallback-шрифтом і замінюється веб-шрифтом, щойно той завантажиться (FOUT)',
        'Шрифт завантажується лише після події `load`'
      ],
      answer: 2,
      hint: '`swap` — «заміна». Що показується до заміни?',
      explanation: `
Значення \`font-display\` описують «block period» (текст невидимий) і «swap period» (можна замінити fallback на веб-шрифт):

| Значення | Block | Swap | Ефект |
|---|---|---|---|
| \`block\` | ~3 с | ∞ | FOIT — невидимий текст |
| \`swap\` | ~0 | ∞ | FOUT — fallback одразу, потім заміна |
| \`fallback\` | ~100 мс | ~3 с | компроміс |
| \`optional\` | ~100 мс | 0 | шрифт лише якщо встиг (або з кешу) |

- Перший варіант описує \`block\` (і поведінку за замовчуванням \`auto\` у більшості браузерів).
- Другий — \`optional\`.
- \`swap\` добре для FCP/LCP, але заміна шрифту може спричинити **CLS** — зменшують через \`size-adjust\`, \`ascent-override\` у \`@font-face\` для fallback-шрифту та \`preload\` основного шрифту.
`
    },
    // ------------------------------------------------------------ Architecture-level
    {
      id: 'render-vdom-batching', group: "advanced", why: ["Так: дорого перераховувати стилі й layout, а не викликати API.","Ні: ручний точковий код зазвичай швидший; VDOM дає зручність.","Так: батчинг зменшує кількість рендерів.","Ні: Svelte і Solid компілюють точкові оновлення без VDOM.","Ні: useEffect — після paint; до paint — useLayoutEffect."],
      type: 'theory',
      level: 4,
      title: 'Навіщо Virtual DOM і батчинг оновлень',
      tags: ['vdom', 'batching', 'architecture'],
      question: 'Чому кажуть, що «DOM повільний»? Навіщо фреймворки використовують Virtual DOM і батчинг оновлень? Чи VDOM швидший за ручну роботу з DOM? Оберіть **усі** правильні твердження.',
      choices: [
        'Дорогий не сам виклик DOM API, а style/layout/paint, особливо при змішаних читаннях і записах',
        'VDOM швидший за будь-який ручний код, бо diff у JS дешевший навіть за одну DOM-операцію',
        'Батчинг об\'єднує кілька оновлень стану в один рендер і один commit у DOM',
        'Svelte і Solid теж будують VDOM, просто diff у них виконується на етапі компіляції',
        '`useEffect` виконується до paint, тому саме там вимірюють DOM без мерехтіння'
      ],
      correct: [0, 2],
      hint: 'Що саме дороге: виклик методу DOM чи наслідки для конвеєра рендерингу? І що відбувається, коли сотні компонентів незалежно оновлюють DOM?',
      answer: `
**Що насправді дороге.** Сам виклик \`el.textContent = ...\` — це швидкий виклик у C++. Дорогими є **наслідки**: перерахунок стилів, layout і paint, особливо якщо зміни **перемежовуються з читаннями** (forced layout) або зачіпають великі піддерева. Друга проблема — **людська**: імперативно синхронізувати стан і DOM у великому застосунку важко й помилково.

**Virtual DOM** — легке JS-представлення UI. Цикл:
1. стан змінився → компоненти повертають нове VDOM-дерево (**render phase**, чистий JS, без DOM);
2. **reconciliation (diff)**: порівняння зі старим деревом за евристиками O(n) (різний тип → заміна піддерева; списки — за \`key\`);
3. **commit phase**: мінімальний набір DOM-операцій застосовується **одним пакетом** — фактично «всі записи разом», без читань посередині.

**Батчинг.** Кілька \`setState\` в одному обробнику (а з React 18 — і в промісах, таймерах: *automatic batching*) дають **один** рендер і один commit. Це той самий принцип, що в fastdom: не перемежовувати записи з читаннями і не робити роботу частіше, ніж потрібно.

\`\`\`js
// без батчингу: 3 перерендери і 3 серії DOM-змін
setCount(c => c + 1); setFlag(true); setItems(next);
// React 18: один рендер, один commit
\`\`\`

**Читання після commit:** \`useLayoutEffect\` виконується синхронно після змін DOM, але **до** paint — там можна виміряти й скоригувати без мерехтіння (ціною forced layout). \`useEffect\` — після paint.

**Чи VDOM швидший?** Ні, відносно оптимального ручного коду — це **накладні витрати** (створення дерев, diff). Його цінність: декларативність, передбачуваність і «досить швидко за замовчуванням». Тому існують альтернативи **без VDOM**: Svelte (компіляція в точкові DOM-оновлення), Solid/Vue Vapor (fine-grained reactivity, сигнали), які оновлюють лише залежні вузли без diff.

**Пов'язане:** React Fiber розбиває render phase на частини й дає браузеру кадри (concurrent rendering, \`startTransition\`), щоб не блокувати main thread довше бюджету кадру.
`,
      keyPoints: [
        'Дороге не DOM API, а style/layout/paint і forced layout від змішаних read/write',
        'VDOM: render → diff (reconciliation) → commit одним пакетом',
        'Батчинг: кілька оновлень стану → один рендер і commit (automatic batching у React 18)',
        'VDOM — накладні витрати заради декларативності, не «швидше за DOM»',
        'Альтернативи: компіляція (Svelte), fine-grained reactivity (Solid, сигнали)',
        'useLayoutEffect — читання/корекція після commit до paint'
      ],
      followUps: [
        'Навіщо key у списках і що буде з index як key?',
        'Чим useLayoutEffect відрізняється від useEffect з точки зору рендерингу?',
        'Що таке concurrent rendering і як він пов\'язаний з бюджетом кадру?'
      ]
    },
    {
      id: 'render-scroll-jank', group: "advanced", why: ["Ні: will-change всюди лише додасть шарів і пам'яті.","Ні: setInterval не синхронізований з кадром.","Ні: top/left усе одно layout на кожному кадрі.","Ні: debounce затримує реакцію, а причину не прибирає.","Так: спершу профілювання — потім точкове виправлення."],
      type: 'theory',
      level: 4,
      title: 'Діагностика ривків при скролі та анімаціях',
      tags: ['performance', 'jank', 'devtools'],
      question: 'Користувачі скаржаться, що сторінка «смикається» під час скролу і анімацій. Як ви будете діагностувати і виправляти проблему?',
      choices: [
        'Одразу додати `will-change: transform` на всі рухомі елементи — зазвичай цього досить',
        'Перевести анімації на `setInterval` з кроком 16 мс, щоб зафіксувати частоту кадрів',
        'Профілювати зайве: досить замінити JS-анімації на CSS-transition властивостей `top`/`left`',
        'Поставити `debounce` 500 мс на обробник `scroll` — це гарантовано прибирає всі ривки',
        'Записати скрол у Performance з CPU throttling, знайти етап (JS, Layout, Paint) і виправити його'
      ],
      correct: 4,
      hint: 'Почніть з вимірювання, а не з припущень. Розкладіть кадр на етапи і знайдіть, який з них не вкладається в бюджет.',
      answer: `
**1. Відтворити й виміряти** (бажано з CPU throttling 4–6× і на реальному мобільному):
- DevTools → **Performance**: запис скролу; дивимось червоні кадри (dropped frames), **long tasks** (> 50 мс), фіолетові *Layout* з попередженням *Forced reflow*, зелені *Paint*.
- **Rendering**: *Paint flashing* (що перемальовується), *Layer borders*, *Frame Rendering Stats*, *Scrolling performance issues* (непасивні обробники).
- **Layers**: кількість і розмір шарів.
- У продакшені — Long Animation Frames API / INP через web-vitals.

**2. Типові причини і рішення:**

| Симптом | Причина | Рішення |
|---|---|---|
| довгі жовті блоки JS під час скролу | важкий обробник \`scroll\`/\`wheel\`/\`touchmove\` | \`{ passive: true }\`, rAF-throttle, IntersectionObserver замість обчислень |
| Layout з Forced reflow | layout thrashing у обробниках | розділити читання/записи, кешувати виміри, ResizeObserver |
| великий Paint на кожен кадр | анімація \`top/left/width\`, \`box-shadow\`, \`background-attachment: fixed\`, \`filter: blur\` | \`transform/opacity\`, псевдоелемент з тінню + opacity |
| багато Composite / пам'ять | layer explosion, \`will-change\` всюди | точковий will-change, \`isolation\`, менше перекриттів |
| довгий Recalculate Style | величезний DOM, складні селектори, зміна класу на \`body\` | менший DOM, віртуалізація, точкові класи |
| стрибки при першому рендері | багато контенту поза екраном | \`content-visibility: auto\`, lazy-loading, віртуалізація |

**3. Обчислення поза main thread:** парсинг/сортування великих даних — у Web Worker; розбивати довгі задачі (\`scheduler.yield()\`, \`setTimeout\`-chunking); \`requestIdleCallback\` для некритичного.

**4. Перевірити результат** тим самим записом у Performance і закріпити бюджетом (Lighthouse CI, моніторинг INP/LoAF).

Сильна відповідь показує процес: **виміряти → локалізувати етап конвеєра → застосувати відповідну техніку → перевірити**.
`,
      keyPoints: [
        'Починати з вимірювання: Performance panel, CPU throttling, реальний пристрій',
        'Локалізувати етап: JS (long tasks), Layout (forced reflow), Paint, Composite',
        'Passive listeners і rAF/IntersectionObserver для scroll-логіки',
        'Анімувати transform/opacity, обережно з шарами',
        'Віртуалізація/content-visibility, Web Workers, розбиття long tasks',
        'Перевірка результату і моніторинг (INP, LoAF)'
      ],
      followUps: [
        'Чому непасивний обробник touchmove може гальмувати скрол?',
        'Що таке Long Animation Frames API?',
        'Як розбити довгу задачу, щоб не блокувати кадри?'
      ]
    }
  ]
});
