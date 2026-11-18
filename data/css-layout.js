FE.topic('css-layout', {
  intro: `
## Flexbox — одновимірна розкладка

| Контейнер | Що робить |
|---|---|
| \`flex-direction\` | головна вісь: \`row\` (за замовч.) / \`column\` / \`*-reverse\` |
| \`flex-wrap\` | \`nowrap\` (за замовч.) / \`wrap\` — перенос на нові рядки |
| \`justify-content\` | вирівнювання вздовж **головної** осі (\`space-between\`, \`center\`…) |
| \`align-items\` | вирівнювання вздовж **поперечної** осі (за замовч. \`stretch\`) |
| \`align-content\` | розподіл **рядків** (працює лише при \`flex-wrap: wrap\`) |
| \`gap\` | відступи між елементами (не по краях) |

| Елемент | Що робить |
|---|---|
| \`flex-grow\` | частка **вільного** простору, яку забирає елемент |
| \`flex-shrink\` | наскільки стискається (зважено на \`flex-basis\`!) |
| \`flex-basis\` | базовий розмір до розподілу (пріоритетніший за \`width\`) |
| \`order\`, \`align-self\` | візуальний порядок / власне вирівнювання |

\`\`\`css
flex: 1;        /* 1 1 0%   — рівні частки незалежно від контенту */
flex: auto;     /* 1 1 auto — частки вільного місця після контенту */
flex: none;     /* 0 0 auto — не росте й не стискається */
flex: initial;  /* 0 1 auto — значення за замовчуванням */
flex: 0 0 200px;/* жорстка ширина 200px */
\`\`\`

- \`margin-left: auto\` у flex-елемента «відштовхує» його праворуч (забирає весь вільний простір).
- **Пастка:** у flex-елементів \`min-width: auto\` = min-content → довгий текст / \`nowrap\` розпирає контейнер. Ліки: \`min-width: 0\` або \`overflow: hidden\`.

## Grid — двовимірна розкладка

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;               /* fr — частка вільного місця */
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); /* адаптивно без media */
  grid-template-areas: "header header" "nav main" "footer footer";
  gap: 16px;
}
.item { grid-column: 1 / -1; grid-row: span 2; grid-area: main; }
\`\`\`

- **auto-fill** залишає порожні треки, **auto-fit** схлопує їх → елементи розтягуються на всю ширину.
- Неявна сітка (implicit grid): \`grid-auto-rows\`, \`grid-auto-flow: row | column | dense\`.
- \`justify-items/align-items\` — вирівнювання **в комірці**; \`justify-content/align-content\` — вирівнювання **всієї сітки** в контейнері; \`place-items: center\` — обидва одразу.
- \`subgrid\` — вкладена сітка використовує треки батька (вирівнювання карток між собою).

## Flex чи Grid?
- **Flex** — контент визначає розмір, одна вісь: навбар, ряд кнопок, медіа-об'єкт.
- **Grid** — розкладка визначає розмір, дві осі: каркас сторінки, галереї, форми.

## Центрування
\`\`\`css
.parent { display: grid; place-items: center; }               /* 1 */
.parent { display: flex; justify-content: center; align-items: center; } /* 2 */
.child  { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); } /* 3 */
.child  { margin: 0 auto; width: 300px; }                     /* 4 — лише горизонталь */
\`\`\`

## Адаптивність
- **Mobile-first:** базові стилі для мобільних + \`@media (min-width: ...)\` для більших екранів.
- **Container queries:** \`container-type: inline-size\` на батьку + \`@container (min-width: 500px) { ... }\`; одиниці \`cqi\`, \`cqw\`.
- \`clamp(min, preferred, max)\` — плавна типографіка: \`font-size: clamp(1rem, 2.5vw, 2rem)\`.
- \`aspect-ratio: 16 / 9\`, \`object-fit: cover\` для зображень/відео.
- Не забувайте \`<meta name="viewport" content="width=device-width, initial-scale=1">\`.
`,
  groups: [
    { id: "flex-basics", title: "Flexbox: осі й вирівнювання" },
    { id: "flex-sizing", title: "Flexbox: розміри елементів" },
    { id: "flex-practice", title: "Flexbox на практиці" },
    { id: "grid", title: "CSS Grid" },
    { id: "centering", title: "Центрування і класичні макети" },
    { id: "responsive", title: "Адаптивність: media, container queries, clamp" }
  ],
  items: [
    // ---------------------------------------------------------------- Flexbox
    {
      id: 'layout-flex-basics-theory', group: "flex-basics", why: ["Ні: напрям осей залежить від flex-direction.","Так: при column головна вісь вертикальна, і justify-content працює по вертикалі.","Так: stretch розтягує елементи на висоту рядка.","Ні: align-content розподіляє рядки (при wrap), а не елементи.","Ні: grow/basis/align-self — властивості елемента, не контейнера."],
      type: 'theory',
      level: 1,
      interview: true,
      title: 'Як працює Flexbox: осі та властивості',
      tags: ['flexbox'],
      question: 'Поясніть, як працює Flexbox. Що таке головна та поперечна осі? Які властивості задаються контейнеру, а які — елементам? Оберіть **усі** правильні твердження.',
      choices: [
        '`justify-content` завжди вирівнює по горизонталі, а `align-items` — по вертикалі, хоч би який був `flex-direction`',
        'Головну вісь задає `flex-direction`; при `column` `justify-content` вирівнює вже по вертикалі',
        '`align-items` за замовчуванням `stretch`, тому елементи в рядку отримують однакову висоту',
        '`align-content` розподіляє елементи всередині одного рядка, коли стоїть `flex-wrap: nowrap`',
        '`flex-grow`, `flex-basis` і `align-self` задаються контейнеру й діють на всіх дітей одразу'
      ],
      correct: [1, 2],
      hint: 'Почніть з того, що змінює flex-direction, і розділіть властивості на дві групи.',
      answer: `
**Flexbox** — модель **одновимірної** розкладки: елементи розташовуються вздовж однієї осі (рядок або колонка) і гнучко ділять між собою вільний простір.

**Осі:**
- **Головна вісь (main axis)** задається \`flex-direction\`: \`row\` — горизонтально, \`column\` — вертикально (\`*-reverse\` — у зворотному напрямку).
- **Поперечна вісь (cross axis)** — перпендикулярна до головної.

Тому \`justify-content\` при \`row\` вирівнює по горизонталі, а при \`column\` — по вертикалі. Це найчастіша плутанина.

**Властивості контейнера** (\`display: flex | inline-flex\`):
- \`flex-direction\`, \`flex-wrap\` (скорочено \`flex-flow\`);
- \`justify-content\` — вздовж головної осі (\`flex-start\`, \`center\`, \`space-between\`, \`space-around\`, \`space-evenly\`);
- \`align-items\` — вздовж поперечної осі (за замовчуванням \`stretch\` → однакова висота колонок);
- \`align-content\` — розподіл **рядків**, коли є перенос (\`wrap\`);
- \`gap\` / \`row-gap\` / \`column-gap\`.

**Властивості елементів:**
- \`flex-grow\`, \`flex-shrink\`, \`flex-basis\` (скорочено \`flex\`);
- \`order\` — візуальний порядок;
- \`align-self\` — перевизначає \`align-items\` для одного елемента;
- \`margin: auto\` — поглинає вільний простір (класичний трюк «відштовхнути вправо»).

\`\`\`css
.navbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.navbar .search { flex: 1; }   /* забирає все вільне місце */
\`\`\`

**Нюанси:** дочірні елементи flex-контейнера **блокофікуються** (inline стає block-level), \`float\` на них не діє, \`vertical-align\` ігнорується, margin між ними не схлопуються. Мінімальний розмір flex-елемента за замовчуванням — \`min-width: auto\` (не менше за min-content), через що довгий текст може розпирати контейнер.
`,
      keyPoints: [
        'Flexbox — одновимірна розкладка (одна вісь)',
        'Головна вісь задається flex-direction, поперечна перпендикулярна до неї',
        'justify-content — головна вісь, align-items — поперечна',
        'Контейнер: direction, wrap, justify/align, gap; елементи: flex-grow/shrink/basis, order, align-self',
        'align-items за замовчуванням stretch; align-content працює лише з кількома рядками'
      ],
      followUps: [
        'Що зміниться, якщо поставити flex-direction: column — як тепер центрувати по горизонталі?',
        'Чим відрізняється align-items від align-content?',
        'Що відбувається з float та vertical-align у flex-елементів?'
      ]
    },
    {
      id: 'layout-navbar-space-between', group: "flex-basics",
      type: 'dom',
      level: 1,
      title: 'Навбар: логотип ліворуч, меню праворуч',
      tags: ['flexbox', 'justify-content'],
      description: `
**Завдання.** Зверстайте шапку сайту:

**Де трапляється:** шапка кожного сайту: логотип і меню.

- \`.logo\` — притиснутий до **лівого** краю (з урахуванням padding шапки);
- \`.menu\` — притиснуте до **правого** краю;
- обидва **відцентровані по вертикалі** всередині шапки висотою 64px.

HTML і розміри не змінюйте — лише CSS.

**Як це працює:** display: flex робить шапку flex-контейнером, а justify-content: space-between розносить перший і останній елементи до країв; align-items: center вирівнює їх по вертикалі.
`,
      html: `<header class="navbar">
  <div class="logo"></div>
  <nav class="menu">
    <a href="#">Головна</a>
    <a href="#">Блог</a>
    <a href="#">Контакти</a>
  </nav>
</header>`,
      css: `.navbar {
  height: 64px;
  padding: 0 16px;
  background: #1e293b;
}
.logo {
  width: 100px;
  height: 32px;
  background: #38bdf8;
  border-radius: 6px;
}
.menu a {
  color: #fff;
  margin-left: 16px;
  text-decoration: none;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.navbar {
  height: 64px;
  padding: 0 16px;
  background: #1e293b;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  width: 100px;
  height: 32px;
  background: #38bdf8;
  border-radius: 6px;
}
.menu a {
  color: #fff;
  margin-left: 16px;
  text-decoration: none;
}
`
      },
      hints: [
        'Зробіть `.navbar` flex-контейнером — тоді `.logo` і `.menu` стануть flex-елементами в один ряд.',
        '`justify-content` розподіляє елементи вздовж головної осі. Яке значення розносить їх по краях?',
        '`justify-content: space-between` + `align-items: center`.'
      ],
      tests: [
        { name: 'логотип притиснутий ліворуч', code: "const n = rect('.navbar'), l = rect('.logo');\nexpect(Math.abs(l.left - (n.left + 16))).toBeLessThanOrEqual(1);" },
        { name: 'меню притиснуте праворуч', code: "const n = rect('.navbar');\nconst last = $$('.menu a').pop();\nexpect(Math.abs(rect(last).right - (n.right - 16))).toBeLessThanOrEqual(1.5);" },
        { name: 'логотип і меню відцентровані по вертикалі', code: "const n = rect('.navbar'), l = rect('.logo'), m = rect('.menu');\nconst cy = n.top + n.height / 2;\nexpect(Math.abs(l.top + l.height / 2 - cy)).toBeLessThanOrEqual(1);\nexpect(Math.abs(m.top + m.height / 2 - cy)).toBeLessThanOrEqual(1);" },
        { name: 'висота шапки та логотипа не змінились', code: "expect(Math.round(rect('.navbar').height)).toBe(64);\nexpect(Math.round(rect('.logo').width)).toBe(100);" }
      ],
      explanation: `
\`display: flex\` ставить дочірні елементи в ряд, \`justify-content: space-between\` віддає весь вільний простір **між** елементами (перший — до початку, останній — до кінця), а \`align-items: center\` центрує їх по поперечній (вертикальній) осі.

**Альтернативи:**
- \`.menu { margin-left: auto; }\` — auto-margin забирає весь вільний простір ліворуч від меню. Зручно, коли елементів більше двох, а праворуч треба лише останній.
- Grid: \`grid-template-columns: auto auto; justify-content: space-between; align-items: center\`.

**Типові помилки:** \`float: right\` для меню (ламає вертикальне центрування, потребує clearfix); \`position: absolute; right: 0\` (меню випадає з потоку і може накладатися на логотип); \`text-align: right\` для блоку — не вирівнює по вертикалі.

**Що можуть спитати далі:** як додати пошук посередині, який розтягується (\`flex: 1\`)? Як зробити бургер-меню на мобільних?
`
    },
    {
      id: 'layout-flex-margin-auto', group: "flex-basics",
      type: 'dom',
      level: 2,
      title: 'margin-left: auto — кнопка «Увійти» праворуч',
      tags: ['flexbox', 'margin-auto'],
      description: `
**Завдання.** У навігаційній панелі три пункти меню та кнопка \`.login\`. Потрібно:

**Де трапляється:** навбари з кнопкою праворуч, футери карток.

- пункти \`.item\` стоять **ліворуч поруч** (з відступом 8px, який уже задає \`gap\`);
- кнопка \`.login\` притиснута до **правого** краю панелі;
- це має працювати за будь-якої ширини панелі.

Не змінюйте HTML, не додавайте обгортки. Підказка: \`justify-content: space-between\` тут **не підходить** — подумайте чому.

**Як це працює:** У flex-контейнері margin-left: auto забирає весь вільний простір ліворуч від елемента — він «відштовхується» до правого краю, а решта елементів лишається ліворуч.
`,
      html: `<nav class="bar">
  <a class="item" href="#">Головна</a>
  <a class="item" href="#">Каталог</a>
  <a class="item" href="#">Про нас</a>
  <button class="login">Увійти</button>
</nav>`,
      css: `.bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 56px;
  background: #f1f5f9;
}
.item {
  width: 80px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  background: #cbd5e1;
  color: #0f172a;
  text-decoration: none;
}
.login {
  width: 90px;
  height: 32px;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 56px;
  background: #f1f5f9;
}
.item {
  width: 80px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  background: #cbd5e1;
  color: #0f172a;
  text-decoration: none;
}
.login {
  width: 90px;
  height: 32px;
  margin-left: auto;
}
`
      },
      hints: [
        'Auto-margin у flex-контейнері поглинає **весь** вільний простір з того боку, де він заданий.',
        'Достатньо однієї властивості на `.login`.',
        '`.login { margin-left: auto; }`'
      ],
      tests: [
        { name: 'пункти меню стоять ліворуч поруч', code: "const b = rect('.bar');\nconst it = $$('.item').map(rect);\nexpect(Math.abs(it[0].left - (b.left + 12))).toBeLessThanOrEqual(1);\nexpect(Math.abs(it[1].left - (it[0].right + 8))).toBeLessThanOrEqual(1);\nexpect(Math.abs(it[2].left - (it[1].right + 8))).toBeLessThanOrEqual(1);" },
        { name: 'кнопка притиснута праворуч', code: "const b = rect('.bar'), l = rect('.login');\nexpect(Math.abs(l.right - (b.right - 12))).toBeLessThanOrEqual(1);" },
        { name: 'працює і при ширині панелі 500px', code: "const bar = $('.bar');\nbar.style.width = '500px';\ntry {\n  const b = rect(bar), l = rect('.login'), it = $$('.item').map(rect);\n  expect(Math.abs(l.right - (b.right - 12))).toBeLessThanOrEqual(1);\n  expect(Math.abs(it[2].left - (it[1].right + 8))).toBeLessThanOrEqual(1);\n} finally { bar.style.width = ''; }" },
        { name: 'розміри елементів не змінились', code: "expect(Math.round(rect('.login').width)).toBe(90);\n$$('.item').forEach(i => expect(Math.round(rect(i).width)).toBe(80));" }
      ],
      explanation: `
У flex-контейнері \`margin: auto\` має особливу поведінку: до розподілу \`justify-content\` вільний простір віддається auto-марджинам. \`margin-left: auto\` на \`.login\` забирає **весь** простір ліворуч від кнопки, тож вона опиняється біля правого краю, а пункти меню лишаються поруч.

**Чому не \`space-between\`:** він розподіляє простір між **усіма** сусідами — три пункти розлетілися б по ширині.

**Інші застосування auto-margin:**
- \`margin: auto\` на єдиному дочірньому елементі — центрування по обох осях;
- \`margin-top: auto\` у колонці — притиснути кнопку картки донизу.

**Що можуть спитати далі:** як розмістити дві кнопки праворуч (auto-margin лише на першій з них)? Чи працює \`margin: auto\` по вертикалі у звичайному блоці (ні — у block-потоці вертикальні auto-марджини дорівнюють 0)?
`
    },
    {
      id: 'layout-quiz-flex-1', group: "flex-sizing", why: ["Так: flex: 1 = 1 1 0%.","Ні: це flex: 1 0 auto — не стискається.","Ні: це flex: auto.","Ні: скорочений запис задає всі три значення, basis стає 0%."],
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Що означає flex: 1?',
      tags: ['flexbox', 'flex-shorthand'],
      question: 'Яким трьом властивостям еквівалентний запис `flex: 1`?',
      options: [
        '`flex-grow: 1; flex-shrink: 1; flex-basis: 0%`',
        '`flex-grow: 1; flex-shrink: 0; flex-basis: auto`',
        '`flex-grow: 1; flex-shrink: 1; flex-basis: auto`',
        '`flex-grow: 1`, а shrink і basis лишаються за замовчуванням (`1` і `auto`)'
      ],
      answer: 0,
      hint: 'Коли в шорткаті `flex` вказане одне безрозмірне число, basis не лишається `auto`.',
      explanation: `
Однозначне безрозмірне значення \`flex: <число>\` розгортається в \`<число> 1 0%\`. Саме \`flex-basis: 0%\` робить елементи **рівними** незалежно від контенту: весь простір вважається вільним і ділиться за grow.

| Запис | Розгортання |
|---|---|
| \`flex: initial\` (за замовч.) | \`0 1 auto\` |
| \`flex: auto\` | \`1 1 auto\` — ділиться лише простір **після** контенту |
| \`flex: none\` | \`0 0 auto\` |
| \`flex: 1\` | \`1 1 0%\` |
| \`flex: 200px\` | \`1 1 200px\` |
| \`flex: 2 3\` | \`2 3 0%\` |

- \`1 1 auto\` — це \`flex: auto\`, а не \`flex: 1\`: з ним довший текст дасть ширший елемент.
- \`1 0 auto\` — інша поведінка (не стискається).
- Варіант «лише grow» — це запис \`flex-grow: 1\`, а не шорткат: шорткат завжди скидає всі три складові.
`
    },
    {
      id: 'layout-quiz-flex-grow-calc', group: "flex-sizing", why: ["Ні: grow ділить вільне місце, а не всю ширину.","Ні: ігнорує basis 100px у кожного.","Так: вільно 600−300=300, ділиться 1:1:2 → +75, +75, +150.","Ні: grow не застосовано."],
      type: 'quiz',
      level: 2,
      title: 'Розрахунок flex-grow',
      tags: ['flexbox', 'flex-grow'],
      question: `
Контейнер шириною **600px** (без padding і gap). Яка ширина елементів?

\`\`\`css
.a { flex: 1 1 100px; }
.b { flex: 1 1 100px; }
.c { flex: 2 1 100px; }
\`\`\`
`,
      options: ['`200 200 200`', '`150 150 300`', '`175 175 250`', '`100 100 400`'],
      answer: 2,
      hint: 'flex-grow ділить не всю ширину, а лише вільний простір, що лишився після flex-basis.',
      explanation: `
1. Сума базових розмірів: 100 + 100 + 100 = 300px.
2. Вільний простір: 600 − 300 = **300px**.
3. Сума grow: 1 + 1 + 2 = 4 → одна частка = 75px.
4. \`.a\` = 100 + 75 = **175**, \`.b\` = **175**, \`.c\` = 100 + 150 = **250**.

- \`150 150 300\` було б при \`flex-basis: 0\` (\`flex: 1\` / \`flex: 2\`) — тоді вся ширина вважається вільною.
- \`200 200 200\` — ніби grow однаковий.
- \`100 100 400\` — ніби весь вільний простір дістався лише \`.c\`.
`
    },
    {
      id: 'layout-quiz-flex-shrink-calc', group: "flex-sizing", why: ["Ні: стискання зважується на shrink × basis.","Ні: однаковий результат був би лише без зважування.","Ні: невірні пропорції стискання.","Так: нестача ділиться пропорційно shrink × basis."],
      type: 'quiz',
      level: 4,
      title: 'Розрахунок flex-shrink (зважене стискання)',
      tags: ['flexbox', 'flex-shrink'],
      question: `
Контейнер шириною **400px** (без padding і gap), елементи без контенту, що заважав би стисканню. Яка ширина \`.a\` і \`.b\`?

\`\`\`css
.a { flex: 0 1 300px; }
.b { flex: 0 1 200px; }
\`\`\`
`,
      options: ['`250 150`', '`200 200`', '`300 100`', '`240 160`'],
      answer: 3,
      hint: 'Стискання, на відміну від росту, зважується не лише на flex-shrink, а й на розмір елемента.',
      explanation: `
1. Сума базових розмірів 500px, переповнення = 500 − 400 = **100px**.
2. На відміну від grow, стискання пропорційне **flex-shrink × flex-basis** (scaled flex shrink factor): \`.a\`: 1 × 300 = 300, \`.b\`: 1 × 200 = 200, разом 500.
3. \`.a\` втрачає 100 × 300/500 = 60 → **240px**; \`.b\` втрачає 100 × 200/500 = 40 → **160px**.

Логіка: великі елементи стискаються сильніше, щоб маленькі не «зникли».

- \`250 150\` — ніби переповнення поділили порівну (як для grow).
- \`200 200\` — ніби basis ігнорується.
- \`300 100\` — ніби стискається лише останній елемент.

Нюанс: стискання обмежене \`min-width\` (за замовчуванням \`auto\` = min-content), тож реальний текст може не дати елементу стиснутися.
`
    },
    {
      id: 'layout-quiz-basis-vs-width', group: "flex-sizing", why: ["Так: basis важливіший за width, але max-width обмежує результат.","Ні: basis важливіший за width.","Ні: max-width сильніший за basis.","Ні: розміри задані явно, контент не впливає."],
      type: 'quiz',
      level: 3,
      title: 'flex-basis vs width vs max-width',
      tags: ['flexbox', 'flex-basis'],
      question: `
Flex-контейнер (\`flex-direction: row\`) шириною 800px містить один елемент. Яка його фінальна ширина?

\`\`\`css
.item {
  width: 300px;
  flex-basis: 200px;
  max-width: 150px;
  /* flex-grow за замовчуванням 0 */
}
\`\`\`
`,
      options: ['`150px`', '`300px`', '`200px`', 'Залежить від контенту'],
      answer: 0,
      hint: 'Згадайте ієрархію: що обмежує, а що лише пропонує розмір.',
      explanation: `
Порядок пріоритетів для розміру flex-елемента вздовж головної осі:

1. \`min-width\` / \`max-width\` — **жорсткі обмеження**, перемагають усе;
2. \`flex-basis\` (якщо не \`auto\`) — базовий розмір;
3. \`width\` — використовується лише при \`flex-basis: auto\`;
4. розмір контенту — якщо і \`width: auto\`.

Тут \`flex-basis: 200px\` перекриває \`width: 300px\`, але потім \`max-width: 150px\` обрізає до **150px**.

- \`300px\` — \`width\` ігнорується, бо basis не \`auto\`.
- \`200px\` — забули, що max-width сильніший за basis.
- «Залежить від контенту» — контент важливий лише при \`width: auto\` і \`flex-basis: auto\` (або через \`min-width: auto\`, але явний max-width і так менший).

Важливо: \`flex-basis\` діє вздовж **головної** осі — при \`flex-direction: column\` він конкурує вже з \`height\`.
`
    },
    {
      id: 'layout-quiz-align-content', group: "flex-sizing", why: ["Ні: однорядковий контейнер ігнорує align-content.","Ні: align-* працює по поперечній осі.","Так: align-content діє лише при кількох рядках (wrap).","Ні: stretch за замовчуванням лишається."],
      type: 'quiz',
      level: 3,
      title: 'align-items vs align-content',
      tags: ['flexbox', 'align-content'],
      question: `
Що станеться з елементами?

\`\`\`css
.box {
  display: flex;          /* flex-wrap за замовчуванням nowrap */
  height: 400px;
  align-content: center;
}
\`\`\`
`,
      options: [
        'Елементи відцентруються по вертикалі',
        'Елементи відцентруються по горизонталі',
        'Нічого не зміниться: у однорядковому (nowrap) контейнері align-content не діє',
        'Елементи стиснуться до висоти контенту і стануть по центру'
      ],
      answer: 2,
      hint: 'align-content розподіляє не елементи, а щось інше.',
      explanation: `
\`align-content\` розподіляє **flex-рядки** (lines) у поперечному напрямку. У контейнері з \`flex-wrap: nowrap\` рядок завжди один і займає всю висоту контейнера, тож розподіляти нічого — властивість не має ефекту. Елементи лишаються розтягнутими (\`align-items: stretch\`).

- Щоб відцентрувати елементи по вертикалі, потрібен \`align-items: center\`.
- По горизонталі (головна вісь при \`row\`) центрує \`justify-content\`.
- З \`flex-wrap: wrap\` \`align-content: center\` вже працює — навіть якщо рядок лише один: група рядків стискається до контенту й стає по центру.

**Запам'ятати:** \`align-items\` — елементи всередині рядка; \`align-content\` — рядки всередині контейнера.
`
    },
    {
      id: 'layout-equal-columns', group: "flex-practice",
      type: 'dom',
      level: 2,
      title: 'Три рівні колонки однакової висоти',
      tags: ['flexbox', 'flex-shorthand', 'equal-height'],
      description: `
**Завдання.** У \`.row\` три колонки з текстом різної довжини. Зробіть так, щоб:

**Де трапляється:** тарифні плани, блоки переваг на лендингах.

- колонки мали **однакову ширину** незалежно від кількості тексту;
- між колонками був відступ **20px** (по краях — без відступу);
- колонки мали **однакову висоту** (як найвища);
- разом займали всю ширину \`.row\`.

Ширину \`.row\` і HTML не змінюйте.

**Як це працює:** flex: 1 дає колонкам базу 0 і однаковий grow — ширина ділиться порівну незалежно від тексту. Висота однакова, бо align-items за замовчуванням stretch.
`,
      html: `<div class="row">
  <div class="col">Коротко.</div>
  <div class="col">Трохи довший текст у середній колонці.</div>
  <div class="col">Найдовший текст: він займає кілька рядків, тому ця колонка найвища, а решта мають підлаштуватися під неї за висотою.</div>
</div>`,
      css: `.row {
  width: 620px;
  display: flex;
  align-items: flex-start;
}
.col {
  padding: 12px;
  background: #e0f2fe;
  border: 1px solid #7dd3fc;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.row {
  width: 620px;
  display: flex;
  gap: 20px;
}
.col {
  flex: 1;
  padding: 12px;
  background: #e0f2fe;
  border: 1px solid #7dd3fc;
}
`
      },
      hints: [
        'Однакова висота у flex-ряду — це поведінка `align-items` за замовчуванням. Що їй заважає?',
        'Щоб ширина не залежала від контенту, базовий розмір має бути 0, а вільний простір — ділитися порівну.',
        '`.row { gap: 20px }` (без `align-items: flex-start`) + `.col { flex: 1 }`.'
      ],
      tests: [
        { name: 'колонки однакової ширини', code: "const w = $$('.col').map(c => rect(c).width);\nexpect(Math.abs(w[0] - w[1])).toBeLessThanOrEqual(1);\nexpect(Math.abs(w[1] - w[2])).toBeLessThanOrEqual(1);" },
        { name: 'відступ між колонками 20px', code: "const c = $$('.col').map(rect);\nexpect(Math.abs(c[1].left - c[0].right - 20)).toBeLessThanOrEqual(1);\nexpect(Math.abs(c[2].left - c[1].right - 20)).toBeLessThanOrEqual(1);" },
        { name: 'колонки займають усю ширину ряду', code: "const r = rect('.row'), c = $$('.col').map(rect);\nexpect(Math.abs(c[0].left - r.left)).toBeLessThanOrEqual(1);\nexpect(Math.abs(c[2].right - r.right)).toBeLessThanOrEqual(1);" },
        { name: 'колонки однакової висоти', code: "const h = $$('.col').map(c => rect(c).height);\nexpect(Math.abs(h[0] - h[2])).toBeLessThanOrEqual(1);\nexpect(Math.abs(h[1] - h[2])).toBeLessThanOrEqual(1);" }
      ],
      explanation: `
- \`flex: 1\` = \`1 1 0%\`: базовий розмір кожної колонки — 0, тож **уся** ширина (мінус gap) вважається вільною і ділиться порівну. З \`flex: auto\` (basis \`auto\`) довша колонка вийшла б ширшою.
- \`align-items: stretch\` (значення за замовчуванням) розтягує елементи на висоту рядка — це і є «рівні колонки», які до flexbox робили через \`display: table-cell\` або «faux columns».
- \`gap\` додає відступ лише **між** елементами — не треба боротися з \`margin\` на останньому.

**Альтернатива:** \`display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;\` — комірки в рядку сітки теж однакової висоти.

**Пастка:** \`flex: 1\` дає рівні колонки, доки довге слово/картинка не перевищить ширину колонки — тоді спрацює \`min-width: auto\`. Для гарантії — \`min-width: 0\` або в Grid \`minmax(0, 1fr)\`.
`
    },
    {
      id: 'layout-sidebar-fixed-fluid', group: "flex-practice",
      type: 'dom',
      level: 3,
      title: 'Сайдбар 200px + гумовий контент',
      tags: ['flexbox', 'flex-shrink', 'layout'],
      description: `
**Завдання.** Розкладка «сайдбар + контент»:

**Де трапляється:** адмінки, документація, поштові клієнти.

- \`.sidebar\` — завжди рівно **200px** завширшки, не стискається навіть коли в контенті довгий текст;
- \`.content\` — займає **всю решту** ширини \`.layout\`;
- має працювати за будь-якої ширини \`.layout\` (тест змінюватиме її).

Зараз довгий абзац «розпирає» контент і стискає сайдбар. Виправте лише CSS.

**Як це працює:** Сайдбару flex: 0 0 200px (не росте, не стискається), контенту flex: 1 і min-width: 0 — тоді довгий вміст не розпирає розкладку.
`,
      html: `<div class="layout">
  <aside class="sidebar">Меню</aside>
  <main class="content">
    <p>Довгий абзац основного контенту. Flexbox розраховує базовий розмір елемента з flex-basis: auto за його вмістом, а для довгого тексту це ширина всього тексту в один рядок. Тому під час стискання сайдбар втрачає ширину пропорційно до свого розміру. Нам потрібна жорстка ширина сайдбару і гумовий контент.</p>
  </main>
</div>`,
      css: `.layout {
  display: flex;
  width: 760px;
}
.sidebar {
  width: 200px;
  background: #fde68a;
}
.content {
  background: #f1f5f9;
}
.content p {
  margin: 0;
  padding: 12px;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.layout {
  display: flex;
  width: 760px;
}
.sidebar {
  flex: 0 0 200px;
  background: #fde68a;
}
.content {
  flex: 1;
  min-width: 0;
  background: #f1f5f9;
}
.content p {
  margin: 0;
  padding: 12px;
}
`
      },
      hints: [
        'За замовчуванням flex-елементи мають `flex-shrink: 1` — сайдбар теж стискається.',
        'Сайдбару потрібні `flex-grow: 0`, `flex-shrink: 0`, `flex-basis: 200px`; контенту — забрати весь вільний простір.',
        '`.sidebar { flex: 0 0 200px }`, `.content { flex: 1; min-width: 0 }`.'
      ],
      tests: [
        { name: 'сайдбар рівно 200px', code: "expect(Math.abs(rect('.sidebar').width - 200)).toBeLessThanOrEqual(1);" },
        { name: 'контент займає решту ширини', code: "const l = rect('.layout'), s = rect('.sidebar'), c = rect('.content');\nexpect(Math.abs(c.left - s.right)).toBeLessThanOrEqual(1);\nexpect(Math.abs(c.right - l.right)).toBeLessThanOrEqual(1);" },
        { name: 'при ширині 500px сайдбар не стискається', code: "const l = $('.layout');\nl.style.width = '500px';\ntry {\n  expect(Math.abs(rect('.sidebar').width - 200)).toBeLessThanOrEqual(1);\n  expect(Math.abs(rect('.content').width - 300)).toBeLessThanOrEqual(1);\n} finally { l.style.width = ''; }" },
        { name: 'при ширині 400px контент — 200px', code: "const l = $('.layout');\nl.style.width = '400px';\ntry {\n  expect(Math.abs(rect('.sidebar').width - 200)).toBeLessThanOrEqual(1);\n  expect(Math.abs(rect('.content').right - rect(l).right)).toBeLessThanOrEqual(1);\n} finally { l.style.width = ''; }" }
      ],
      explanation: `
**Чому зламалось:** у контенту \`flex-basis: auto\` + \`width: auto\` → базовий розмір = max-content абзацу (тисячі пікселів). Сума базових розмірів значно більша за контейнер, і обидва елементи стискаються **пропорційно до flex-shrink × basis** — сайдбар теж втрачає ширину.

**Рішення:**
- \`.sidebar { flex: 0 0 200px }\` — не росте, не стискається, базовий розмір 200px;
- \`.content { flex: 1; min-width: 0 }\` — забирає весь вільний простір; \`min-width: 0\` страхує від розпирання довгими словами, таблицями, \`<pre>\`.

**Альтернатива на Grid:** \`grid-template-columns: 200px 1fr\` (або \`200px minmax(0, 1fr)\` для повної гарантії) — часто навіть чистіше, бо розмір задає контейнер, а не елементи.

**Типова помилка:** лише \`width: 200px\` на сайдбарі — у flex-контексті це лише базовий розмір, який може стискатися. Ще варіант — \`flex-shrink: 0\` + \`width: 200px\`.

**Що можуть спитати далі:** як зробити сайдбар, що ховається на мобільних? Як зробити його «липким» (\`position: sticky\`) при скролі?
`
    },
    {
      id: 'layout-flex-wrap-cards', group: "flex-practice",
      type: 'dom',
      level: 1,
      title: 'Перенос карток на нові рядки (flex-wrap)',
      tags: ['flexbox', 'flex-wrap', 'gap'],
      description: `
**Завдання.** У \`.list\` шість карток по **180px**. Зараз вони стискаються в один ряд. Зробіть так, щоб:

**Де трапляється:** списки карток товарів, тегів, фільтрів.

- картки **зберігали ширину 180px** і переносилися на новий рядок, коли не вміщаються;
- відступ між картками — **12px** і по горизонталі, і по вертикалі.

При ширині \`.list\` 600px у рядку вміщається 3 картки, при 400px — 2.

**Як це працює:** flex-wrap: wrap дозволяє переносити елементи на новий рядок замість стискання; flex-shrink: 0 або flex: 0 0 180px зберігає ширину карток.
`,
      html: `<div class="list">
  <div class="card">1</div>
  <div class="card">2</div>
  <div class="card">3</div>
  <div class="card">4</div>
  <div class="card">5</div>
  <div class="card">6</div>
</div>`,
      css: `.list {
  display: flex;
  width: 600px;
}
.card {
  width: 180px;
  height: 80px;
  background: #ddd6fe;
  border-radius: 8px;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 600px;
}
.card {
  width: 180px;
  height: 80px;
  background: #ddd6fe;
  border-radius: 8px;
}
`
      },
      hints: [
        'За замовчуванням `flex-wrap: nowrap` — усі елементи в одному рядку, навіть ціною стискання.',
        '`gap` у flexbox працює і для рядків, і для колонок.',
        '`flex-wrap: wrap; gap: 12px;`'
      ],
      tests: [
        { name: 'картки зберігають ширину 180px', code: "$$('.card').forEach(c => expect(Math.abs(rect(c).width - 180)).toBeLessThanOrEqual(1));" },
        { name: 'у рядку 3 картки, відступи 12px', code: "const c = $$('.card').map(rect);\nconst inRow = c.filter(r => Math.abs(r.top - c[0].top) < 1).length;\nexpect(inRow).toBe(3);\nexpect(Math.abs(c[1].left - c[0].right - 12)).toBeLessThanOrEqual(1);\nexpect(Math.abs(c[3].top - c[0].bottom - 12)).toBeLessThanOrEqual(1);" },
        { name: 'при ширині 400px — по 2 картки в рядку', code: "const l = $('.list');\nl.style.width = '400px';\ntry {\n  const c = $$('.card').map(rect);\n  expect(c.filter(r => Math.abs(r.top - c[0].top) < 1).length).toBe(2);\n} finally { l.style.width = ''; }" }
      ],
      explanation: `
\`flex-wrap: wrap\` дозволяє переносити елементи на нові flex-рядки, а не стискати їх (\`flex-shrink\` не знадобиться, бо в кожному рядку достатньо місця). \`gap\` задає і \`row-gap\`, і \`column-gap\`.

**Розрахунок:** (600 + 12) / (180 + 12) ≈ 3.2 → 3 картки; (400 + 12) / 192 ≈ 2.1 → 2.

**Нюанси:**
- Останній рядок вирівнюється за \`justify-content\`; якщо поставити \`space-between\`, одна картка в останньому рядку «розлетиться» — класична проблема flex-сіток, яку красиво розв'язує Grid з \`repeat(auto-fill, minmax())\`.
- Якщо карткам дати \`flex: 1 1 180px\`, вони розтягуватимуться, заповнюючи рядок, — але в неповному останньому рядку будуть ширшими за інші.
- До підтримки \`gap\` у flexbox (2021) відступи робили через від'ємні margin на контейнері.
`
    },
    {
      id: 'layout-flex-order', group: "flex-practice",
      type: 'dom',
      level: 1,
      title: 'Візуальний порядок без зміни HTML (order)',
      tags: ['flexbox', 'order', 'a11y'],
      description: `
**Завдання.** Блоки в HTML ідуть у порядку: реклама → основний контент → навігація. Візуально (зверху вниз) потрібен порядок:

**Де трапляється:** мобільна перестановка блоків без зміни HTML.

1. \`.main\`
2. \`.nav\`
3. \`.ads\`

Відступ між блоками 10px має зберегтися. HTML не змінюйте.

**Як це працює:** order змінює лише візуальний порядок flex-елементів (менше значення — раніше), DOM лишається тим самим. Порядок читання скрінрідерами не змінюється.
`,
      html: `<div class="page">
  <aside class="ads">Реклама</aside>
  <main class="main">Основний контент</main>
  <nav class="nav">Навігація</nav>
</div>`,
      css: `.page {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 400px;
}
.ads  { height: 60px;  background: #fecaca; }
.main { height: 120px; background: #bbf7d0; }
.nav  { height: 50px;  background: #bfdbfe; }
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.page {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 400px;
}
.ads  { height: 60px;  background: #fecaca; order: 1; }
.main { height: 120px; background: #bbf7d0; }
.nav  { height: 50px;  background: #bfdbfe; }
`
      },
      hints: [
        'Властивість `order` (за замовчуванням 0) змінює візуальний порядок flex-елементів. Елементи з однаковим `order` йдуть у порядку DOM.',
        'Зверніть увагу: `.main` і `.nav` вже стоять у потрібному порядку відносно одне одного. Що достатньо зробити з `.ads`?',
        '`.ads { order: 1; }`'
      ],
      tests: [
        { name: '.main — першим зверху', code: "expect(Math.abs(rect('.main').top - rect('.page').top)).toBeLessThanOrEqual(1);" },
        { name: '.nav — другим, через 10px', code: "expect(Math.abs(rect('.nav').top - rect('.main').bottom - 10)).toBeLessThanOrEqual(1);" },
        { name: '.ads — останнім, через 10px', code: "expect(Math.abs(rect('.ads').top - rect('.nav').bottom - 10)).toBeLessThanOrEqual(1);" },
        { name: 'порядок у DOM не змінено', code: "expect($('.page').firstElementChild.className).toBe('ads');" }
      ],
      explanation: `
\`order\` сортує flex- (і grid-) елементи за зростанням значення; рівні — за порядком у DOM. Усі мають \`order: 0\`, тож \`.ads { order: 1 }\` відправляє рекламу в кінець, а \`.main\` і \`.nav\` зберігають свій відносний порядок. Те саме дає \`.main, .nav { order: -1 }\`.

**Важливо для співбесіди — доступність (a11y):** \`order\`, \`flex-direction: *-reverse\`, розміщення в Grid змінюють лише **візуальний** порядок. Порядок табуляції (Tab), читання скрінрідером і виділення тексту лишаються за DOM. Якщо візуальний порядок суттєво розходиться з логічним, це порушує WCAG 1.3.2 / 2.4.3. Тому \`order\` доречний для дрібних перестановок (наприклад, адаптивно перенести блок), а не для зміни сенсу.

**Що можуть спитати далі:** чому \`.main\` краще ставити першим у DOM (SEO, скрінрідери, «skip link»)? Як працює \`order\` у Grid?
`
    },
    {
      id: 'layout-flex-min-width-ellipsis', group: "flex-practice",
      type: 'dom',
      level: 3,
      title: 'Трикрапка у flex-елементі: проблема min-width',
      tags: ['flexbox', 'min-width', 'text-overflow'],
      description: `
**Завдання.** Рядок списку чатів: аватар, блок \`.body\` (ім'я + останнє повідомлення) і час. Для \`.msg\` вже задано \`white-space: nowrap; overflow: hidden; text-overflow: ellipsis\`, але трикрапка не з'являється — довге повідомлення **виштовхує час за межі рядка**.

**Де трапляється:** списки чатів, таблиці з довгими назвами — частий баг.

Виправте так, щоб:
- \`.body\` займав весь вільний простір між аватаром і часом;
- повідомлення обрізалося з трикрапкою;
- час (\`44px\`) і аватар (\`40px\`) не стискалися.

Змінюйте лише CSS.

**Як це працює:** Flex-елемент за замовчуванням має min-width: auto і не стискається менше за свій вміст. min-width: 0 дозволяє стиснення, і тоді text-overflow: ellipsis спрацьовує.
`,
      html: `<ul class="chats">
  <li class="chat">
    <div class="avatar"></div>
    <div class="body">
      <div class="name">Олена Коваленко</div>
      <div class="msg">Привіт! Надсилаю фінальну версію макета головної сторінки, глянь, будь ласка, до вечора — особливо адаптив і темну тему</div>
    </div>
    <time class="time">12:45</time>
  </li>
</ul>`,
      css: `.chats {
  width: 360px;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid #e2e8f0;
}
.chat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
}
.avatar {
  flex: 0 0 40px;
  height: 40px;
  border-radius: 50%;
  background: #a5b4fc;
}
.body {
  flex: 1;
}
.name {
  font-weight: bold;
}
.msg {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #64748b;
}
.time {
  flex: 0 0 44px;
  color: #94a3b8;
  font-size: 12px;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.chats {
  width: 360px;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid #e2e8f0;
}
.chat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
}
.avatar {
  flex: 0 0 40px;
  height: 40px;
  border-radius: 50%;
  background: #a5b4fc;
}
.body {
  flex: 1;
  min-width: 0;
}
.name {
  font-weight: bold;
}
.msg {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #64748b;
}
.time {
  flex: 0 0 44px;
  color: #94a3b8;
  font-size: 12px;
}
`
      },
      hints: [
        'Проблема не в `.msg`, а в його flex-батьку. Який мінімальний розмір має flex-елемент за замовчуванням?',
        'У flex-елементів `min-width: auto` — вони не стискаються менше за свій min-content, а для тексту з `nowrap` це вся його довжина.',
        'Додайте `.body { min-width: 0; }` (або `overflow: hidden`).'
      ],
      tests: [
        { name: 'час не виходить за межі рядка', code: "const ch = rect('.chat'), t = rect('.time');\nexpect(t.right).toBeLessThanOrEqual(ch.right - 8 + 1);" },
        { name: '.body займає простір між аватаром і часом', code: "const a = rect('.avatar'), b = rect('.body'), t = rect('.time');\nexpect(Math.abs(b.left - a.right - 12)).toBeLessThanOrEqual(1);\nexpect(Math.abs(t.left - b.right - 12)).toBeLessThanOrEqual(1);" },
        { name: 'повідомлення обрізане з трикрапкою', code: "const m = $('.msg');\nexpect(css(m, 'text-overflow')).toBe('ellipsis');\nexpect(m.scrollWidth).toBeGreaterThan(m.clientWidth);\nexpect(m.clientWidth).toBeLessThan(300);" },
        { name: 'аватар і час не стиснулись', code: "expect(Math.round(rect('.avatar').width)).toBe(40);\nexpect(Math.round(rect('.time').width)).toBe(44);" }
      ],
      explanation: `
**Корінь проблеми — автоматичний мінімальний розмір flex-елемента.** Для flex-елементів \`min-width\` за замовчуванням не \`0\`, а \`auto\`, що означає «не менше за min-content». Min-content блоку \`.body\` визначається найширшим нестискуваним вмістом — рядком \`.msg\` з \`white-space: nowrap\`, тобто всією довжиною повідомлення. Тож \`.body\` не може стати вужчим, \`.msg\` не переповнюється і трикрапці немає звідки взятися, а час виштовхується назовні.

**Рішення:**
- \`.body { min-width: 0 }\` — дозволяє елементу стискатися нижче min-content;
- або \`.body { overflow: hidden }\` — для елементів з overflow, відмінним від \`visible\`, автоматичний мінімум теж стає 0.

**Де ще трапляється:** \`<pre>\`/код у колонці, широкі таблиці, \`<input>\` у flex-ряду, вкладені flex-контейнери (\`min-width: 0\` треба на кожному рівні!). У Grid аналог — \`1fr\` = \`minmax(auto, 1fr)\`, лікується через \`minmax(0, 1fr)\`.

**Для ellipsis потрібні всі три:** \`white-space: nowrap\` + \`overflow: hidden\` + \`text-overflow: ellipsis\`, і в елемента має бути обмежена ширина.

**Що можуть спитати далі:** як обрізати текст на 2–3 рядки (\`-webkit-line-clamp\`)? Чому \`min-height: 0\` потрібен для скролу всередині flex-колонки?
`
    },

    // ---------------------------------------------------------------- Grid
    {
      id: 'layout-grid-basics-theory', group: "grid", why: ["Ні: fr ділить вільне місце, а мінімальний розмір контенту може це порушити.","Ні: навпаки — явна сітка з template, неявну створює браузер.","Так: fr ділить залишок; minmax задає межі треку.","Ні: 1 / -1 — від першої до останньої лінії, на всю ширину.","Ні: minmax працює і для колонок."],
      type: 'theory',
      level: 2,
      interview: true,
      title: 'CSS Grid: треки, fr, minmax, лінії, області',
      tags: ['grid'],
      question: 'Розкажіть про CSS Grid: що таке треки, лінії, області, одиниця fr, функції repeat() і minmax()? Чим явна сітка відрізняється від неявної?',
      choices: [
        '`1fr` — це завжди рівно `1/n` ширини контейнера, тож трек `1fr` ніколи не стане ширшим за сусідні',
        'Неявна сітка — це треки з `grid-template-*`, а явну браузер створює сам для «зайвих» елементів',
        '`fr` ділить вільний простір після фіксованих треків і gap; `1fr` не стисне трек менше за min-content',
        '`grid-column: 1 / -1` ставить елемент у першу колонку, а `-1` означає «зайняти рівно один трек»',
        '`minmax(150px, 1fr)` працює лише для висоти рядків, а для колонок розмір задають тільки через `repeat()`'
      ],
      correct: 2,
      hint: 'Пройдіться від термінології до розміщення елементів і автоматичного розміщення.',
      answer: `
**CSS Grid** — модель **двовимірної** розкладки: контейнер задає рядки й колонки одночасно, а елементи розміщуються в комірки або області.

**Термінологія:**
- **Трек (track)** — рядок або колонка; **лінія (line)** — межа між треками (нумерація з 1, від'ємні — з кінця: \`-1\` — остання лінія);
- **Комірка (cell)** і **область (area)** — прямокутник з кількох комірок.

**Розміри треків:**
- \`fr\` — частка **вільного** простору (після фіксованих треків і gap);
- \`repeat(3, 1fr)\`, \`repeat(auto-fill, minmax(150px, 1fr))\`;
- \`minmax(min, max)\` — трек не менший за min і не більший за max;
- \`auto\`, \`min-content\`, \`max-content\`, \`fit-content(300px)\`.

\`\`\`css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  gap: 16px;
}
.header { grid-area: header; }
.card   { grid-column: 1 / -1; }    /* від першої до останньої лінії */
.wide   { grid-column: span 2; }    /* займає 2 колонки там, де стане */
\`\`\`

**Явна vs неявна сітка:** явна (explicit) задається \`grid-template-*\`. Якщо елементів більше, ніж комірок, або елемент розміщено за межами (\`grid-row: 10\`), браузер створює **неявні** (implicit) треки, розмір яких задають \`grid-auto-rows\` / \`grid-auto-columns\`. Напрямок автозаповнення — \`grid-auto-flow: row | column\`, а \`dense\` дозволяє заповнювати «дірки».

**Вирівнювання:** \`justify-items\`/\`align-items\` (елемент у комірці), \`justify-content\`/\`align-content\` (уся сітка в контейнері), \`justify-self\`/\`align-self\`, шорткати \`place-*\`.

**Нюанси:** \`1fr\` = \`minmax(auto, 1fr)\` — трек не стиснеться менше за min-content контенту (лікується \`minmax(0, 1fr)\`); відсоткові gap та fr рахуються від контейнера; порядок у DOM і візуальний можуть розходитися (a11y).
`,
      keyPoints: [
        'Grid — двовимірна розкладка: рядки й колонки одночасно',
        'fr — частка вільного простору; 1fr = minmax(auto, 1fr)',
        'repeat(), minmax(), auto-fill/auto-fit',
        'Розміщення за лініями (grid-column: 1 / -1, span) та областями (grid-template-areas)',
        'Неявна сітка: grid-auto-rows/columns, grid-auto-flow (dense)'
      ],
      followUps: [
        'Чим відрізняється 1fr від minmax(0, 1fr)?',
        'Як працює grid-auto-flow: dense і які в нього ризики для доступності?',
        'Що таке subgrid і яку задачу він розв\'язує?'
      ]
    },
    {
      id: 'layout-quiz-fr-calc', group: "grid", why: ["Ні: не враховано gap.","Так: (700 − 2×20 − 100) / 1.5 × 1 ≈ 373.33.","Ні: неточний розрахунок вільного місця.","Ні: не враховано фіксовану колонку."],
      type: 'quiz',
      level: 2,
      title: 'Розрахунок fr з gap',
      tags: ['grid', 'fr'],
      question: `
Контейнер шириною **700px**. Яка ширина третьої колонки?

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: 100px 1fr 2fr;
  gap: 20px;
}
\`\`\`
`,
      options: ['`400px`', '`373.33px`', '`386.67px`', '`466.67px`'],
      answer: 1,
      hint: 'fr ділить те, що лишилось після фіксованих треків І проміжків.',
      explanation: `
1. Фіксоване: колонка 100px + два gap по 20px = 140px.
2. Вільний простір: 700 − 140 = **560px**.
3. Сума fr = 3 → 1fr ≈ 186.67px, 2fr ≈ **373.33px**.

- \`400px\` — ніби gap не враховано: (700 − 100) / 3 × 2.
- \`386.67px\` — враховано лише один gap.
- \`466.67px\` — ніби fr рахується від усієї ширини контейнера: 700 / 3 × 2, без урахування фіксованої колонки та gap.

Саме тому fr зручніший за відсотки: \`33.33%\` + \`gap\` переповнюють контейнер, а fr — ні.
`
    },
    {
      id: 'layout-grid-auto-fill-cards', group: "grid",
      type: 'dom',
      level: 2,
      title: 'Адаптивна сітка карток без media queries',
      tags: ['grid', 'auto-fill', 'minmax', 'responsive'],
      description: `
**Завдання.** Зробіть сітку карток, яка **сама** підбирає кількість колонок під ширину контейнера:

**Де трапляється:** галереї й каталоги без media queries.

- картка не вужча за **150px**;
- колонки однакові й розтягуються, заповнюючи всю ширину \`.grid\`;
- відступи між картками — **16px**;
- без media queries.

Очікувано: ширина 640px → 3 колонки, 400px → 2 колонки, 300px → 1 колонка.

**Як це працює:** repeat(auto-fill, minmax(150px, 1fr)) створює стільки колонок по 150px+, скільки влазить, а залишок ділить між ними — сітка адаптується без media queries.
`,
      html: `<div class="grid">
  <div class="card">1</div>
  <div class="card">2</div>
  <div class="card">3</div>
  <div class="card">4</div>
  <div class="card">5</div>
  <div class="card">6</div>
  <div class="card">7</div>
</div>`,
      css: `.grid {
  width: 640px;
  display: grid;
  grid-template-columns: 150px 150px 150px;
  gap: 16px;
}
.card {
  height: 80px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.grid {
  width: 640px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}
.card {
  height: 80px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
}
`
      },
      hints: [
        '`repeat()` уміє сам рахувати кількість колонок, якщо замість числа передати ключове слово.',
        'Колонка має бути «щонайменше 150px, а далі — рівна частка вільного місця». Яка функція описує діапазон?',
        '`grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));`'
      ],
      tests: [
        { name: '640px → 3 колонки на всю ширину', code: "const g = rect('.grid');\nconst c = $$('.card').map(rect);\nconst cols = new Set(c.map(r => Math.round(r.left))).size;\nexpect(cols).toBe(3);\nexpect(Math.abs(c[2].right - g.right)).toBeLessThanOrEqual(1);\nexpect(Math.abs(c[1].left - c[0].right - 16)).toBeLessThanOrEqual(1);" },
        { name: '400px → 2 колонки', code: "const el = $('.grid');\nel.style.width = '400px';\ntry {\n  const c = $$('.card').map(rect);\n  expect(new Set(c.map(r => Math.round(r.left))).size).toBe(2);\n  expect(Math.abs(c[1].right - rect(el).right)).toBeLessThanOrEqual(1);\n} finally { el.style.width = ''; }" },
        { name: '300px → 1 колонка на всю ширину', code: "const el = $('.grid');\nel.style.width = '300px';\ntry {\n  const c = $$('.card').map(rect);\n  expect(new Set(c.map(r => Math.round(r.left))).size).toBe(1);\n  expect(Math.abs(c[0].width - 300)).toBeLessThanOrEqual(1);\n} finally { el.style.width = ''; }" },
        { name: 'картки не вужчі за 150px і однакові', code: "const el = $('.grid');\nfor (const w of [640, 500, 340]) {\n  el.style.width = w + 'px';\n  const ws = $$('.card').map(c => rect(c).width);\n  ws.forEach(x => expect(x).toBeGreaterThanOrEqual(149.5));\n  expect(Math.max(...ws) - Math.min(...ws)).toBeLessThanOrEqual(1);\n}\nel.style.width = '';" }
      ],
      explanation: `
\`repeat(auto-fill, minmax(150px, 1fr))\` читається так: «створи стільки колонок, скільки вміститься, якщо кожна щонайменше 150px; потім розтягни їх порівну (\`1fr\`)».

Браузер рахує кількість: \`floor((W + gap) / (150 + gap))\` → 640px: 656/166 ≈ 3.95 → 3; 400px: 416/166 ≈ 2.5 → 2; 300px → 1.

**auto-fill vs auto-fit:** різниця видно, коли елементів **менше**, ніж колонок, що вміщаються. \`auto-fill\` лишає порожні треки (картки не розтягуються на весь рядок), \`auto-fit\` схлопує порожні треки до 0 — і наявні картки розтягуються на всю ширину.

**Пастка:** якщо контейнер вужчий за 150px, картка переповнить його. Захист: \`minmax(min(150px, 100%), 1fr)\`.

**Порівняння з flex-wrap:** у flex неповний останній рядок розтягує картки ширше за інші (або лишає «дірки» при \`space-between\`), а в Grid колонки однакові завжди.

**Що можуть спитати далі:** як зробити те саме, але з максимум 4 колонками? (\`minmax(max(150px, (100% - 3 * gap) / 4), 1fr)\`.)
`
    },
    {
      id: 'layout-quiz-auto-fill-vs-fit', group: "grid", why: ["Ні: навпаки.","Ні: auto-fill лишає порожні треки.","Так: auto-fit схлопує порожні треки, auto-fill — ні.","Ні: auto-fit розтягує елементи."],
      type: 'quiz',
      level: 3,
      interview: true,
      title: 'auto-fill vs auto-fit',
      tags: ['grid', 'auto-fill'],
      question: `
Контейнер **1000px**, gap 0, у ньому лише **2** елементи. Яка ширина елементів у кожному випадку?

\`\`\`css
.a { grid-template-columns: repeat(auto-fit,  minmax(100px, 1fr)); }
.b { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
\`\`\`
`,
      options: [
        'auto-fit: по 100px; auto-fill: по 500px',
        'В обох випадках по 500px',
        'auto-fit: по 500px; auto-fill: по 100px',
        'В обох випадках по 100px'
      ],
      answer: 2,
      hint: 'Обидва варіанти створюють 10 треків. Різниця — що відбувається з порожніми.',
      explanation: `
В обох випадках браузер створює стільки треків, скільки вміщається: 1000 / 100 = **10**.

- **auto-fill** лишає порожні 8 треків як є: 10 колонок по 100px, елементи займають дві з них → **100px**.
- **auto-fit** схлопує порожні треки до 0, і \`1fr\` розподіляє весь простір між двома зайнятими → **500px**.

Коли елементів достатньо, щоб заповнити рядок, різниці немає.

**Коли що:** \`auto-fit\` — коли кілька елементів мають розтягнутися на всю ширину (наприклад, 1–3 тарифи). \`auto-fill\` — коли картки мають зберігати «сітковий» розмір незалежно від кількості (каталог, галерея).
`
    },
    {
      id: 'layout-holy-grail-areas', group: "grid",
      type: 'dom',
      level: 2,
      title: 'Holy Grail через grid-template-areas',
      tags: ['grid', 'grid-template-areas', 'layout'],
      description: `
**Завдання.** Зверстайте класичний макет «Святий Грааль» у \`.page\` (700×400px) за допомогою **\`grid-template-areas\`**:

**Де трапляється:** каркас сторінки: шапка, меню, контент, футер.

\`\`\`text
┌──────────── header ────────────┐
│ nav 150 │     main     │ aside 150 │
└──────────── footer ────────────┘
\`\`\`

- \`header\` (60px) — зверху на всю ширину, \`footer\` (50px) — знизу на всю ширину;
- \`nav\` — ліворуч 150px, \`aside\` — праворуч 150px, \`main\` — решта;
- середній ряд розтягується на всю висоту, що лишилась;
- відступи між областями — **10px**.

Зверніть увагу: у HTML \`main\` іде **одразу після** \`header\` (так краще для SEO та скрінрідерів). HTML не змінюйте.

**Як це працює:** grid-template-areas малює макет іменами областей; кожному блоку задаємо grid-area з тим самим іменем. Розміри задають grid-template-columns/rows.
`,
      html: `<div class="page">
  <header class="header">Header</header>
  <main class="main">Main</main>
  <nav class="nav">Nav</nav>
  <aside class="aside">Aside</aside>
  <footer class="footer">Footer</footer>
</div>`,
      css: `.page {
  width: 700px;
  height: 400px;
}
.header { height: 60px; background: #c7d2fe; }
.footer { height: 50px; background: #c7d2fe; }
.nav    { background: #fde68a; }
.main   { background: #f1f5f9; }
.aside  { background: #bbf7d0; }
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.page {
  width: 700px;
  height: 400px;
  display: grid;
  grid-template-columns: 150px 1fr 150px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  gap: 10px;
}
.header { grid-area: header; height: 60px; background: #c7d2fe; }
.footer { grid-area: footer; height: 50px; background: #c7d2fe; }
.nav    { grid-area: nav; background: #fde68a; }
.main   { grid-area: main; background: #f1f5f9; }
.aside  { grid-area: aside; background: #bbf7d0; }
`
      },
      hints: [
        'Задайте сітку з 3 колонок (`150px 1fr 150px`) і 3 рядків, де середній — `1fr`.',
        '`grid-template-areas` описує макет рядками з іменами областей; елементам дайте `grid-area: <ім\'я>`.',
        '`"header header header" "nav main aside" "footer footer footer"`, рядки `auto 1fr auto`, `gap: 10px`.'
      ],
      tests: [
        { name: 'використано grid-template-areas', code: "expect(css('.page', 'display')).toBe('grid');\nexpect(css('.page', 'grid-template-areas')).not.toBe('none');" },
        { name: 'header зверху на всю ширину, footer знизу', code: "const p = rect('.page'), h = rect('.header'), f = rect('.footer');\nexpect(Math.abs(h.top - p.top)).toBeLessThanOrEqual(1);\nexpect(Math.abs(h.width - 700)).toBeLessThanOrEqual(1);\nexpect(Math.abs(f.bottom - p.bottom)).toBeLessThanOrEqual(1);\nexpect(Math.abs(f.width - 700)).toBeLessThanOrEqual(1);" },
        { name: 'nav ліворуч і aside праворуч по 150px, main між ними', code: "const p = rect('.page'), n = rect('.nav'), m = rect('.main'), a = rect('.aside');\nexpect(Math.abs(n.left - p.left)).toBeLessThanOrEqual(1);\nexpect(Math.abs(n.width - 150)).toBeLessThanOrEqual(1);\nexpect(Math.abs(a.right - p.right)).toBeLessThanOrEqual(1);\nexpect(Math.abs(a.width - 150)).toBeLessThanOrEqual(1);\nexpect(Math.abs(m.left - n.right - 10)).toBeLessThanOrEqual(1);\nexpect(Math.abs(a.left - m.right - 10)).toBeLessThanOrEqual(1);" },
        { name: 'середній ряд заповнює висоту', code: "const h = rect('.header'), f = rect('.footer');\n['.nav', '.main', '.aside'].forEach(s => {\n  const r = rect(s);\n  expect(Math.abs(r.top - h.bottom - 10)).toBeLessThanOrEqual(1);\n  expect(Math.abs(f.top - r.bottom - 10)).toBeLessThanOrEqual(1);\n});" }
      ],
      explanation: `
\`grid-template-areas\` — «ASCII-арт» макета: кожен рядок у лапках — рядок сітки, кожне слово — комірка. Однакові імена, що утворюють **прямокутник**, зливаються в область. Порожню комірку позначають крапкою \`.\`.

- \`grid-template-rows: auto 1fr auto\` — header і footer за висотою контенту, середина забирає решту (так само реалізується sticky footer на Grid).
- Розміщення за іменами не залежить від порядку в DOM — \`main\` може йти першим у розмітці.

**Адаптивність за 3 рядки:** на мобільних просто перевизначити області:
\`\`\`css
@media (max-width: 600px) {
  .page { grid-template-columns: 1fr; grid-template-areas: "header" "main" "nav" "aside" "footer"; }
}
\`\`\`

**Типові помилки:** непрямокутна область (\`"a a" "a b"\` з L-подібною \`a\` — уся властивість стає невалідною); різна кількість комірок у рядках; забуте \`grid-area\` в елемента (він піде автоматичним розміщенням).

**Що можуть спитати далі:** як зробити те саме на Flexbox (вкладені контейнери) і чому Grid тут природніший?
`
    },
    {
      id: 'layout-grid-span-featured', group: "grid",
      type: 'dom',
      level: 1,
      title: 'Розміщення за лініями: картка 2×2',
      tags: ['grid', 'grid-column', 'span'],
      description: `
**Завдання.** Сітка 4×N з комірками 100×100 і gap 10px. Розмістіть \`.featured\` так, щоб вона займала **колонки 2–3 і рядки 1–2** (блок 2×2, тобто 210×210px).

**Де трапляється:** виділена картка в галереї або дашборді.

Решта карток мають автоматично розташуватися навколо неї: перша — у колонці 1, друга — у колонці 4 першого рядка тощо.

HTML не змінюйте (\`.featured\` у розмітці — третя).

**Як це працює:** grid-column: 2 / 4 і grid-row: 1 / 3 ставлять елемент між лініями сітки — він займає 2×2 комірки, решта елементів обтікає його автоматично.
`,
      html: `<div class="grid">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item featured">★</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>`,
      css: `.grid {
  display: grid;
  grid-template-columns: repeat(4, 100px);
  grid-auto-rows: 100px;
  gap: 10px;
}
.item {
  background: #e2e8f0;
  border-radius: 6px;
}
.featured {
  background: #fbbf24;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.grid {
  display: grid;
  grid-template-columns: repeat(4, 100px);
  grid-auto-rows: 100px;
  gap: 10px;
}
.item {
  background: #e2e8f0;
  border-radius: 6px;
}
.featured {
  background: #fbbf24;
  grid-column: 2 / span 2;
  grid-row: 1 / span 2;
}
`
      },
      hints: [
        'Розміщення задається номерами **ліній**, а не колонок: колонки 2–3 — це від лінії 2 до лінії 4.',
        'Можна записати `grid-column: 2 / 4` або `grid-column: 2 / span 2`. Те саме для рядків.',
        '`.featured { grid-column: 2 / span 2; grid-row: 1 / span 2; }`'
      ],
      tests: [
        { name: '.featured — колонки 2–3, рядки 1–2', code: "const g = rect('.grid'), f = rect('.featured');\nexpect(Math.abs(f.left - g.left - 110)).toBeLessThanOrEqual(1);\nexpect(Math.abs(f.top - g.top)).toBeLessThanOrEqual(1);\nexpect(Math.abs(f.width - 210)).toBeLessThanOrEqual(1);\nexpect(Math.abs(f.height - 210)).toBeLessThanOrEqual(1);" },
        { name: 'картки 1 і 2 — по краях першого рядка', code: "const g = rect('.grid'), it = $$('.item:not(.featured)').map(rect);\nexpect(Math.abs(it[0].left - g.left)).toBeLessThanOrEqual(1);\nexpect(Math.abs(it[0].top - g.top)).toBeLessThanOrEqual(1);\nexpect(Math.abs(it[1].left - g.left - 330)).toBeLessThanOrEqual(1);\nexpect(Math.abs(it[1].top - g.top)).toBeLessThanOrEqual(1);" },
        { name: 'картки 3 і 4 — по краях другого рядка', code: "const g = rect('.grid'), it = $$('.item:not(.featured)').map(rect);\nexpect(Math.abs(it[2].left - g.left)).toBeLessThanOrEqual(1);\nexpect(Math.abs(it[2].top - g.top - 110)).toBeLessThanOrEqual(1);\nexpect(Math.abs(it[3].left - g.left - 330)).toBeLessThanOrEqual(1);" }
      ],
      explanation: `
Grid нумерує **лінії** з 1 (від'ємні — з кінця). \`grid-column: 2 / span 2\` = «почати з лінії 2 і зайняти 2 треки», тобто те саме, що \`2 / 4\`.

**Алгоритм авторозміщення:** спершу розміщуються елементи з повністю заданою позицією (\`.featured\`), потім решта по порядку DOM займають першу вільну комірку, рухаючись по рядках. Тому 1 → (1,1), 2 → (1,4), 3 → (2,1), 4 → (2,4), 5 → (3,1)…

**Корисні записи:**
- \`grid-column: 1 / -1\` — на всю ширину явної сітки;
- \`grid-column: span 2\` — дві колонки там, де елемент стане автоматично;
- \`grid-area: 1 / 2 / 3 / 4\` — row-start / column-start / row-end / column-end.

**Пастка:** \`grid-column: 2 / 3\` — це **одна** колонка (від лінії 2 до 3), а не дві.
`
    },
    {
      id: 'layout-grid-dense', group: "grid",
      type: 'dom',
      level: 3,
      title: 'Дірки в сітці: grid-auto-flow: dense',
      tags: ['grid', 'grid-auto-flow', 'implicit-grid'],
      description: `
**Завдання.** Сітка з 3 колонок по 100px. Картки \`.wide\` займають по 2 колонки. Через це після першої широкої картки в першому рядку лишається **порожня комірка** (колонка 3), бо друга широка туди не вміщається.

**Де трапляється:** мозаїчні галереї (masonry-подібні сітки).

Зробіть так, щоб алгоритм авторозміщення **заповнював дірки** наступними картками, що вміщаються: \`.c\` має стати в рядок 1, колонку 3, а \`.d\` — у рядок 2, колонку 3.

Не змінюйте HTML і не задавайте позиції окремим карткам вручну.

**Як це працює:** grid-auto-flow: dense дозволяє авторозміщенню заповнювати «дірки», що лишились раніше, меншими елементами — порядок у DOM при цьому візуально порушується.
`,
      html: `<div class="grid">
  <div class="item wide a">A</div>
  <div class="item wide b">B</div>
  <div class="item c">C</div>
  <div class="item d">D</div>
  <div class="item e">E</div>
</div>`,
      css: `.grid {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  grid-auto-rows: 100px;
}
.item {
  background: #e0e7ff;
  outline: 1px solid #6366f1;
}
.wide {
  grid-column: span 2;
  background: #c7d2fe;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.grid {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  grid-auto-rows: 100px;
  grid-auto-flow: row dense;
}
.item {
  background: #e0e7ff;
  outline: 1px solid #6366f1;
}
.wide {
  grid-column: span 2;
  background: #c7d2fe;
}
`
      },
      hints: [
        'За замовчуванням авторозміщення «sparse»: курсор рухається лише вперед і не повертається до пропущених комірок.',
        'Потрібне ключове слово для `grid-auto-flow`, яке змушує алгоритм шукати першу вільну комірку з початку сітки.',
        '`grid-auto-flow: dense;` (те саме, що `row dense`).'
      ],
      tests: [
        { name: '.c заповнює дірку в рядку 1, колонці 3', code: "const g = rect('.grid'), c = rect('.c');\nexpect(Math.abs(c.left - g.left - 200)).toBeLessThanOrEqual(1);\nexpect(Math.abs(c.top - g.top)).toBeLessThanOrEqual(1);" },
        { name: '.d — рядок 2, колонка 3', code: "const g = rect('.grid'), d = rect('.d');\nexpect(Math.abs(d.left - g.left - 200)).toBeLessThanOrEqual(1);\nexpect(Math.abs(d.top - g.top - 100)).toBeLessThanOrEqual(1);" },
        { name: 'широкі картки на місці', code: "const g = rect('.grid'), a = rect('.a'), b = rect('.b');\nexpect(Math.abs(a.top - g.top)).toBeLessThanOrEqual(1);\nexpect(Math.abs(b.top - g.top - 100)).toBeLessThanOrEqual(1);\nexpect(Math.abs(b.width - 200)).toBeLessThanOrEqual(1);" },
        { name: 'використано grid-auto-flow: dense', code: "expect(css('.grid', 'grid-auto-flow')).toContain('dense');" }
      ],
      explanation: `
**Як працює авторозміщення (sparse, за замовчуванням):** курсор іде по комірках вперед; A займає (1,1–2). B потребує 2 колонки, у (1,3) не влазить → (2,1–2). Курсор уже за B, тож C стає в (2,3), а комірка (1,3) лишається порожньою назавжди.

**\`dense\`:** для кожного наступного елемента пошук починається **з початку** сітки, тож C (1 колонка) заповнює (1,3), D — (2,3), E — (3,1).

**Неявна сітка:** рядки не задані явно — їх створює \`grid-auto-rows: 100px\` у міру потреби. Аналогічно \`grid-auto-flow: column\` заповнював би колонками, створюючи неявні колонки (\`grid-auto-columns\`).

**Ризик для доступності:** \`dense\` переставляє елементи візуально, а порядок Tab/скрінрідера лишається DOM-овим. Для галерей зображень це ок, для форм і текстового контенту — ні.

**Що можуть спитати далі:** чим \`grid-auto-flow: column\` відрізняється від \`flex-direction: column\`? Як зробити masonry-розкладку (поки — JS або \`grid-template-rows: masonry\`/«grid lanes» за прапорцем)?
`
    },
    {
      id: 'layout-quiz-implicit-grid', group: "grid", why: ["Ні: розміщення за лініями не ігнорується.","Ні: браузер не обрізає до явної сітки.","Ні: елемент лишається видимим.","Так: браузер додає неявні треки розміру grid-auto-columns."],
      type: 'quiz',
      level: 3,
      title: 'Елемент за межами явної сітки',
      tags: ['grid', 'implicit-grid'],
      question: `
Що станеться з \`.item\`?

\`\`\`css
.grid { display: grid; grid-template-columns: repeat(3, 100px); }
.item { grid-column: 5; }
\`\`\`
`,
      options: [
        'Властивість ігнорується, елемент стане в наступну вільну комірку',
        'Елемент розтягнеться до останньої (третьої) колонки',
        'Елемент стане прихованим, бо за межами сітки',
        'Браузер створить неявні колонки 4 і 5, розмір яких задає grid-auto-columns'
      ],
      answer: 3,
      hint: 'Сітка в Grid не обмежена тим, що ви явно описали в grid-template-columns.',
      explanation: `
Якщо елемент розміщено за межами **явної** сітки, браузер добудовує **неявні** (implicit) треки до потрібної лінії. Тут з'являться колонки 4 і 5; їхній розмір — \`grid-auto-columns\` (за замовчуванням \`auto\`, тобто порожня колонка 4 матиме ширину 0, а 5 — ширину контенту).

- Властивість не ігнорується — вона валідна.
- Grid не «обрізає» позицію до останньої колонки.
- Елемент не ховається: контейнер просто стає ширшим (може переповнитися).

Так само працюють рядки: зайві елементи створюють неявні рядки розміру \`grid-auto-rows\`. \`grid-column: 1 / -1\` при цьому охоплює лише **явну** сітку.
`
    },
    {
      id: 'layout-quiz-grid-justify', group: "grid", why: ["Ні: центрує вміст усередині комірок.","Ні: стосується одного елемента в комірці.","Ні: це вертикальна вісь.","Так: justify-content рухає всю сітку в контейнері."],
      type: 'quiz',
      level: 2,
      title: 'justify-items vs justify-content у Grid',
      tags: ['grid', 'alignment'],
      question: 'Сітка `grid-template-columns: repeat(3, 100px)` лежить у контейнері шириною 600px, тож праворуч лишається 300px порожнечі. Яка властивість **зсуне всі три колонки** до центру контейнера?',
      options: [
        '`justify-items: center`',
        '`justify-self: center`',
        '`align-content: center`',
        '`justify-content: center`'
      ],
      answer: 3,
      hint: 'Одна група властивостей вирівнює елемент у комірці, інша — треки в контейнері.',
      explanation: `
- \`justify-content\` / \`align-content\` вирівнюють **усю сітку (треки)** в контейнері, коли сумарний розмір треків менший за контейнер. Тут колонки займуть 150–450px.
- \`justify-items\` (для всіх) і \`justify-self\` (для одного) вирівнюють **елемент усередині своєї комірки** — колонки лишаться на місці, а елементи стиснуться до контенту й стануть по центру своїх 100px.
- \`align-content\` працює по осі блоку (вертикалі), а не по горизонталі.

**Мнемоніка:** \`*-content\` — про треки, \`*-items\`/\`*-self\` — про елементи. \`justify-*\` — inline-вісь (горизонталь), \`align-*\` — block-вісь (вертикаль). \`place-items: center\` = \`align-items: center; justify-items: center\`.
`
    },
    {
      id: 'layout-grid-subgrid', group: "grid",
      type: 'dom',
      level: 4,
      title: 'Вирівнювання вмісту карток через subgrid',
      tags: ['grid', 'subgrid'],
      description: `
**Завдання.** Три картки в ряд, у кожній: заголовок, текст і кнопка. Заголовки й тексти різної довжини, тож тексти та кнопки в сусідніх картках «скачуть».

**Де трапляється:** картки, де кнопки й тексти мають бути на одному рівні.

Зробіть так, щоб **заголовки, тексти і кнопки всіх карток стояли на однакових рівнях** (текст починається після найвищого заголовка, кнопки — після найдовшого тексту). Рішення має працювати за будь-якої довжини заголовків — тест змінить текст заголовка.

Підказка: внутрішні рядки карток мають стати рядками **батьківської** сітки.

**Як це працює:** grid-template-rows: subgrid на картці змушує її рядки використовувати треки батьківської сітки — заголовки, тексти й кнопки сусідніх карток вирівнюються.
`,
      html: `<div class="cards">
  <article class="card">
    <h3 class="title">Старт</h3>
    <p class="text">Для невеликих проєктів.</p>
    <button class="btn">Обрати</button>
  </article>
  <article class="card">
    <h3 class="title">Професійний тариф для команд, що ростуть</h3>
    <p class="text">Усе зі стартового плюс аналітика.</p>
    <button class="btn">Обрати</button>
  </article>
  <article class="card">
    <h3 class="title">Бізнес</h3>
    <p class="text">Необмежені проєкти, пріоритетна підтримка, SSO, аудит-логи, окремий менеджер і SLA 99.9%.</p>
    <button class="btn">Обрати</button>
  </article>
</div>`,
      css: `.cards {
  width: 640px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
}
.title, .text {
  margin: 0;
}
.btn {
  justify-self: start;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.cards {
  width: 640px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid;
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
}
.title, .text {
  margin: 0;
}
.btn {
  justify-self: start;
}
`
      },
      hints: [
        'Кожна картка має займати **3 рядки** батьківської сітки (`grid-row: span 3`).',
        'Тоді картка може сама стати grid-контейнером і успадкувати рядки батька: `grid-template-rows: subgrid`.',
        '`.card { display: grid; grid-row: span 3; grid-template-rows: subgrid; gap: 8px; }`'
      ],
      tests: [
        { name: 'тексти починаються на одному рівні', code: "const t = $$('.text').map(e => rect(e).top);\nexpect(Math.max(...t) - Math.min(...t)).toBeLessThanOrEqual(1);" },
        { name: 'кнопки на одному рівні', code: "const b = $$('.btn').map(e => rect(e).top);\nexpect(Math.max(...b) - Math.min(...b)).toBeLessThanOrEqual(1);" },
        { name: 'картки однакової висоти', code: "const h = $$('.card').map(e => rect(e).height);\nexpect(Math.max(...h) - Math.min(...h)).toBeLessThanOrEqual(1);" },
        { name: 'працює після зміни довжини заголовка', code: "const t0 = $$('.title')[0];\nconst old = t0.textContent;\nt0.textContent = 'Дуже довгий заголовок першої картки, що займає аж чотири рядки тексту';\ntry {\n  const t = $$('.text').map(e => rect(e).top);\n  expect(Math.max(...t) - Math.min(...t)).toBeLessThanOrEqual(1);\n  expect(rect(t0).bottom).toBeLessThanOrEqual(Math.min(...t));\n} finally { t0.textContent = old; }" }
      ],
      explanation: `
**Проблема:** кожна картка — незалежний контекст розкладки, тому висота заголовка в одній картці ніяк не впливає на сусідні. Раніше це розв'язували фіксованими висотами або JS.

**subgrid:** картка займає 3 рядки батьківської сітки (\`grid-row: span 3\`) і замість власних треків використовує батьківські (\`grid-template-rows: subgrid\`). Тепер рядок «заголовок» спільний для всіх карток і має висоту найвищого заголовка; так само для тексту й кнопки.

**Нюанси:**
- subgrid успадковує gap батька, але його можна перевизначити у вкладеній сітці (тут \`gap: 8px\`).
- Padding/border картки додаються до крайніх треків.
- Підтримка — усі сучасні браузери з 2023 року (Chrome 117+). Для старих — \`@supports (grid-template-rows: subgrid)\` і запасний варіант.
- \`grid-template-columns: subgrid\` — те саме для колонок (наприклад, вирівнювання label/input у формі).

**Альтернативи без subgrid:** \`display: contents\` на картці (але втрачається сама картка як бокс — фон, рамка, a11y-семантика в деяких браузерах), фіксовані висоти, JS-вирівнювання.
`
    },
    {
      id: 'layout-flex-vs-grid-theory', group: "grid", why: ["Так: flex — одна вісь, розміри від контенту.","Ні: Grid чудово підходить і для компонентів.","Так: у flex-wrap рядки незалежні — колонки не вирівнюються.","Ні: gap працює і у Flexbox.","Так: найчастіше їх комбінують."],
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Flexbox чи Grid — коли що?',
      tags: ['flexbox', 'grid'],
      question: 'Чим відрізняються Flexbox і Grid? Як ви вирішуєте, що використати в конкретному випадку? Оберіть **усі** правильні твердження.',
      choices: [
        'Flexbox одновимірний і content-out: розміри задає контент, а вільне місце ділиться між елементами',
        'Grid варто брати лише для каркаса сторінки — для компонентів усередині він помітно повільніший',
        'При `flex-wrap` колонки в різних рядках між собою не вирівнюються, а в Grid — вирівнюються',
        '`gap` працює лише в Grid, тому у Flexbox відступи між елементами доводиться робити через margin',
        'Їх комбінують: Grid — для макета сторінки, Flexbox — для розкладки всередині компонентів'
      ],
      correct: [0, 2, 4],
      hint: 'Подумайте: хто визначає розмір — контент чи контейнер? Скільки осей?',
      answer: `
**Головна різниця:**
- **Flexbox — одновимірний і content-out:** елементи стоять уздовж однієї осі, розмір визначає контент, а вільний простір розподіляється між ними. Перенос (\`wrap\`) створює незалежні рядки — колонки між рядками не вирівнюються.
- **Grid — двовимірний і layout-in:** спочатку описується сітка (рядки й колонки), потім елементи розміщуються в неї. Колонки вирівняні в усіх рядках.

**Коли Flexbox:**
- компоненти в один ряд/колонку: навбар, тулбар, група кнопок, теги, «медіа-об'єкт» (аватар + текст);
- коли кількість і розмір елементів наперед невідомі і мають визначатися контентом;
- вирівнювання і розподіл простору в одному напрямку, трюк з \`margin-left: auto\`.

**Коли Grid:**
- каркас сторінки (header/sidebar/main/footer), дашборди;
- картки-галереї з рівними колонками (\`repeat(auto-fill, minmax())\`);
- форми з вирівняними label/input, накладання елементів в одну комірку;
- коли потрібен контроль і рядків, і колонок одночасно, або перестановка областей за брейкпоінтами.

\`\`\`css
/* Grid для каркаса, Flex — усередині компонентів */
.app    { display: grid; grid-template-columns: 240px 1fr; }
.header { display: flex; justify-content: space-between; align-items: center; }
\`\`\`

**Нюанси:** вони не конкурують, а комбінуються. Обидва підтримують \`gap\`, \`order\`, вирівнювання Box Alignment. Продуктивність майже однакова; для дуже великих списків важливіша віртуалізація, ніж вибір розкладки. Grid краще працює з неповним останнім рядком (картки не розтягуються), а Flex — коли елементи різної ширини мають йти щільно (теги, чіпси).
`,
      keyPoints: [
        'Flex — одна вісь, розмір від контенту (content-out)',
        'Grid — дві осі, розмір від сітки (layout-in)',
        'Flex: навбари, групи кнопок, компоненти; Grid: каркас сторінки, галереї, форми',
        'Колонки Grid вирівняні між рядками, у flex-wrap — ні',
        'Їх комбінують: Grid для макета, Flex усередині компонентів'
      ],
      followUps: [
        'Як зробити картки однакової ширини в неповному останньому рядку на Flexbox?',
        'Що таке subgrid і коли він знадобиться?',
        'Чи можна обійтися лише Grid для всього?'
      ]
    },

    // ---------------------------------------------------------------- Центрування
    {
      id: 'layout-centering-theory', group: "centering", why: ["Ні: vertical-align працює для inline і комірок таблиці.","Ні: margin auto центрує по вертикалі лише у flex/grid або absolute з inset.","Ні: так центрується лівий верхній кут, а не центр.","Так: translate(-50%, -50%) компенсує власний розмір.","Ні: text-align центрує inline-вміст, не блоки."],
      type: 'theory',
      level: 1,
      interview: true,
      title: 'Способи відцентрувати елемент',
      tags: ['centering'],
      question: 'Як відцентрувати елемент по горизонталі та вертикалі? Назвіть кілька способів і коли який підходить.',
      choices: [
        '`vertical-align: middle` на блоці центрує його по вертикалі всередині батька будь-якої висоти',
        '`margin: auto` центрує блок по обох осях у звичайному block-потоці, якщо йому задано `height`',
        '`top: 50%; left: 50%` на absolute-елементі вже ставить у центр його середину, transform не потрібен',
        '`translate(-50%, -50%)` зсуває елемент на половину власного розміру, тож його розміри знати не треба',
        '`text-align: center` на батькові центрує і блочних дітей із заданою шириною, і inline-вміст'
      ],
      correct: 3,
      hint: 'Розгляньте Grid, Flex, position + transform, margin: auto, і окремо — центрування тексту.',
      answer: `
**1. Grid — найкоротший:**
\`\`\`css
.parent { display: grid; place-items: center; }
\`\`\`

**2. Flexbox:**
\`\`\`css
.parent { display: flex; justify-content: center; align-items: center; }
/* або */ .parent { display: flex; } .child { margin: auto; }
\`\`\`

**3. Абсолютне позиціонування + transform** — для елемента невідомого розміру поверх контенту (модалки, лоадери):
\`\`\`css
.parent { position: relative; }
.child  { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
\`\`\`
\`top/left: 50%\` зсуває лівий верхній кут у центр, \`translate(-50%, -50%)\` повертає елемент на половину **власного** розміру.

**4. Absolute + inset + margin: auto** — коли розмір відомий (або \`width: fit-content\`):
\`\`\`css
.child { position: absolute; inset: 0; margin: auto; width: 200px; height: 100px; }
\`\`\`

**5. Горизонтально в block-потоці:** \`margin: 0 auto\` для блоку з заданою шириною; \`text-align: center\` — для inline/inline-block вмісту.

**6. Вертикально один рядок тексту:** \`line-height\` = висоті контейнера (застарілий трюк).

**Нюанси і пастки:**
- \`transform\` може давати розмиття на дробових пікселях і створює stacking context та containing block для fixed-нащадків;
- \`margin: auto\` по вертикалі не працює у звичайному block-потоці, лише у flex/grid або з absolute + inset;
- \`vertical-align: middle\` працює лише для inline/table-cell елементів, а не для блоків.
`,
      keyPoints: [
        'Grid: place-items: center',
        'Flex: justify-content + align-items: center (або margin: auto на дочірньому)',
        'position: absolute + top/left 50% + transform: translate(-50%, -50%)',
        'margin: 0 auto для блоку з шириною; text-align для inline-вмісту',
        'Розуміння, чому vertical-align і вертикальний margin: auto не працюють у block-потоці'
      ],
      followUps: [
        'Чому translate(-50%) рахується від розміру самого елемента, а left: 50% — від батька?',
        'Як відцентрувати модалку, що вища за viewport, і дати їй скролитися?',
        'Які побічні ефекти має transform?'
      ]
    },
    {
      id: 'layout-center-grid-stack', group: "centering",
      type: 'dom',
      level: 2,
      title: 'Центрування і накладання через Grid',
      tags: ['grid', 'centering', 'place-items'],
      description: `
**Завдання.** У \`.hero\` є «картинка» \`.img\` і підпис \`.caption\`. Потрібно:

**Де трапляється:** hero-банери з текстом поверх зображення.

- обидва елементи **відцентрувати** по горизонталі й вертикалі в \`.hero\`;
- підпис має лежати **поверх** картинки (в одній і тій самій точці);
- **без** \`position: absolute\` — лише засобами Grid.

Розміри елементів і HTML не змінюйте.

**Як це працює:** display: grid; place-items: center центрує. Щоб накласти елементи, ставимо їх в одну комірку: grid-area: 1 / 1 для обох.
`,
      html: `<div class="hero">
  <div class="img"></div>
  <div class="caption">Підпис</div>
</div>`,
      css: `.hero {
  width: 400px;
  height: 260px;
  background: #0f172a;
}
.img {
  width: 300px;
  height: 180px;
  background: linear-gradient(135deg, #f472b6, #60a5fa);
}
.caption {
  width: 160px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background: rgba(255, 255, 255, 0.85);
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.hero {
  width: 400px;
  height: 260px;
  background: #0f172a;
  display: grid;
  place-items: center;
}
.img,
.caption {
  grid-area: 1 / 1;
}
.img {
  width: 300px;
  height: 180px;
  background: linear-gradient(135deg, #f472b6, #60a5fa);
}
.caption {
  width: 160px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background: rgba(255, 255, 255, 0.85);
}
`
      },
      hints: [
        '`place-items: center` центрує елементи всередині їхніх комірок по обох осях.',
        'Щоб два елементи опинилися в одній комірці, явно розмістіть обидва в рядку 1, колонці 1 — Grid дозволяє перекриття.',
        '`.hero { display: grid; place-items: center } .img, .caption { grid-area: 1 / 1 }`'
      ],
      tests: [
        { name: 'картинка по центру', code: "const h = rect('.hero'), i = rect('.img');\nexpect(Math.abs(i.left + i.width / 2 - (h.left + h.width / 2))).toBeLessThanOrEqual(1);\nexpect(Math.abs(i.top + i.height / 2 - (h.top + h.height / 2))).toBeLessThanOrEqual(1);" },
        { name: 'підпис по центру (поверх картинки)', code: "const h = rect('.hero'), c = rect('.caption');\nexpect(Math.abs(c.left + c.width / 2 - (h.left + h.width / 2))).toBeLessThanOrEqual(1);\nexpect(Math.abs(c.top + c.height / 2 - (h.top + h.height / 2))).toBeLessThanOrEqual(1);" },
        { name: 'підпис видно поверх картинки', code: "const c = rect('.caption');\nconst el = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2);\nexpect($('.caption').contains(el)).toBe(true);" },
        { name: 'без position: absolute, розміри збережено', code: "expect(css('.img', 'position')).toBe('static');\nexpect(css('.caption', 'position')).toBe('static');\nexpect(Math.round(rect('.img').width)).toBe(300);\nexpect(Math.round(rect('.caption').height)).toBe(40);" }
      ],
      explanation: `
\`place-items: center\` — шорткат \`align-items: center; justify-items: center\`: кожен елемент центрується **у своїй комірці**. Оскільки сітка має одну комірку на весь контейнер (неявний трек \`auto\` розтягується завдяки \`align-content/justify-content: normal\` → stretch), елемент опиняється в центрі \`.hero\`.

\`grid-area: 1 / 1\` кладе обидва елементи в ту саму комірку. Grid, на відміну від Flex, дозволяє **перекриття** елементів без позиціонування. Хто зверху — визначає порядок у DOM (пізніший вище) або \`z-index\` (працює для grid-елементів навіть без \`position\`).

**Чим краще за absolute:** елементи лишаються в потоці — контейнер може рости за контентом (наприклад, довгий підпис збільшить висоту \`.hero\`), не треба \`transform\`.

**Де застосовують:** текст поверх зображення в hero-блоці, бейджі, оверлеї карток, «стек» шарів.
`
    },
    {
      id: 'layout-center-absolute', group: "centering",
      type: 'dom',
      level: 2,
      title: 'Центрування блоку невідомого розміру (absolute)',
      tags: ['centering', 'position', 'transform'],
      description: `
**Завдання.** У \`.stage\` потрібно відцентрувати спливне повідомлення \`.popup\`, **розмір якого невідомий** (залежить від тексту).

**Де трапляється:** модалки, тости, лоадери поверх контенту.

Обмеження: \`.stage\` має лишитися звичайним блоком (\`display: block\`) — у ньому є інший контент, який не можна перебудовувати на flex/grid. Тому використайте **абсолютне позиціонування**.

Тест змінить текст повідомлення — воно має лишитися по центру.

**Як це працює:** position: absolute; top: 50%; left: 50% ставить лівий верхній кут у центр, а transform: translate(-50%, -50%) зсуває елемент на половину власного розміру.
`,
      html: `<div class="stage">
  <p>Інший контент сторінки, що не має зсуватися.</p>
  <div class="popup">Збережено!</div>
</div>`,
      css: `.stage {
  width: 500px;
  height: 300px;
  background: #f1f5f9;
}
.stage p {
  margin: 0;
  padding: 12px;
}
.popup {
  padding: 12px 20px;
  white-space: nowrap;
  background: #16a34a;
  color: #fff;
  border-radius: 8px;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.stage {
  width: 500px;
  height: 300px;
  background: #f1f5f9;
  position: relative;
}
.stage p {
  margin: 0;
  padding: 12px;
}
.popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 20px;
  white-space: nowrap;
  background: #16a34a;
  color: #fff;
  border-radius: 8px;
}
`
      },
      hints: [
        'Абсолютний елемент позиціонується відносно найближчого **позиціонованого** предка — зробіть ним `.stage`.',
        '`top: 50%; left: 50%` ставить у центр **лівий верхній кут** елемента. Як зсунути його назад на половину власного розміру?',
        '`transform: translate(-50%, -50%)` — відсотки в translate рахуються від розміру самого елемента.'
      ],
      tests: [
        { name: 'повідомлення по центру .stage', code: "const s = rect('.stage'), p = rect('.popup');\nexpect(Math.abs(p.left + p.width / 2 - (s.left + s.width / 2))).toBeLessThanOrEqual(1);\nexpect(Math.abs(p.top + p.height / 2 - (s.top + s.height / 2))).toBeLessThanOrEqual(1);" },
        { name: 'лишається по центру після зміни тексту', code: "const p = $('.popup');\nconst old = p.textContent;\np.textContent = 'Зміни успішно збережено на сервері';\ntry {\n  const s = rect('.stage'), r = rect(p);\n  expect(Math.abs(r.left + r.width / 2 - (s.left + s.width / 2))).toBeLessThanOrEqual(1);\n  expect(Math.abs(r.top + r.height / 2 - (s.top + s.height / 2))).toBeLessThanOrEqual(1);\n} finally { p.textContent = old; }" },
        { name: '.stage лишився блоком, popup — absolute', code: "expect(css('.stage', 'display')).toBe('block');\nexpect(css('.popup', 'position')).toBe('absolute');" },
        { name: 'абзац не зсунувся', code: "expect(Math.abs(rect('.stage p').top - rect('.stage').top)).toBeLessThanOrEqual(1);" }
      ],
      explanation: `
- \`position: relative\` на \`.stage\` робить його **containing block** для абсолютного нащадка (без цього popup позиціонувався б відносно початкового containing block — viewport).
- \`top: 50%; left: 50%\` — відсотки від розмірів containing block: лівий верхній кут popup стає в центр.
- \`transform: translate(-50%, -50%)\` — відсотки від розмірів **самого елемента**, тому центрування працює для будь-якого розміру.

**Альтернатива:** \`inset: 0; margin: auto; width: fit-content; height: fit-content;\` — без transform (не створює stacking context, немає розмиття на дробових пікселях).

**Нюанси:**
- абсолютний елемент випадає з потоку — абзац не зсувається;
- без \`white-space: nowrap\` ширина shrink-to-fit обмежилась би доступним простором від \`left: 50%\` до краю (половина контейнера) — текст переносився б раніше, ніж очікуєте;
- transform-зсув на непарних розмірах дає дробові координати → можливе розмиття тексту.

**Що можуть спитати далі:** відносно чого позиціонується absolute, якщо в предка є \`transform\`? (Предок з transform теж стає containing block.)
`
    },

    // ---------------------------------------------------------------- Класичні макети
    {
      id: 'layout-sticky-footer', group: "centering",
      type: 'dom',
      level: 2,
      title: 'Sticky footer: футер притиснутий донизу',
      tags: ['flexbox', 'layout', 'sticky-footer'],
      description: `
**Завдання.** Класичний «sticky footer»:

**Де трапляється:** сторінки з малою кількістю контенту.

- коли контенту мало — футер притиснутий до **низу вікна** (viewport iframe — 600px);
- коли контенту багато — футер іде **після** контенту (не накладається на нього і не прилипає до вікна);
- шапка — на самому верху сторінки (приберіть стандартний \`margin\` у \`body\`).

HTML не змінюйте. Тест додасть у \`main\` багато контенту і перевірить друге правило.

**Як це працює:** Колонковий flex на min-height: 100vh: контенту flex: 1 — він забирає вільну висоту і притискає футер донизу, а при довгому контенті футер просто йде після нього.
`,
      html: `<div class="page">
  <header class="header">Шапка</header>
  <main class="main">
    <p>Контенту поки мало.</p>
  </main>
  <footer class="footer">Футер</footer>
</div>`,
      css: `.header {
  height: 50px;
  background: #1e293b;
  color: #fff;
}
.main {
  padding: 16px;
}
.main p {
  margin: 0;
}
.footer {
  height: 40px;
  background: #334155;
  color: #fff;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `body {
  margin: 0;
}
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.header {
  height: 50px;
  background: #1e293b;
  color: #fff;
}
.main {
  flex: 1;
  padding: 16px;
}
.main p {
  margin: 0;
}
.footer {
  height: 40px;
  background: #334155;
  color: #fff;
}
`
      },
      hints: [
        'Сторінка має бути **щонайменше** заввишки з вікно — яка одиниця відповідає висоті viewport?',
        'Зробіть `.page` flex-колонкою, а `main` нехай забирає весь вільний простір.',
        '`body { margin: 0 } .page { min-height: 100vh; display: flex; flex-direction: column } .main { flex: 1 }` — саме `min-height`, а не `height`.'
      ],
      tests: [
        { name: 'шапка на самому верху', code: "expect(Math.abs(rect('.header').top)).toBeLessThanOrEqual(1);" },
        { name: 'мало контенту → футер внизу вікна', code: "expect(Math.abs(rect('.footer').bottom - window.innerHeight)).toBeLessThanOrEqual(1);" },
        { name: 'багато контенту → футер після контенту', code: "const extra = document.createElement('div');\nextra.style.height = '1000px';\n$('.main').append(extra);\ntry {\n  const f = rect('.footer'), e = rect(extra);\n  expect(f.top).toBeGreaterThanOrEqual(e.bottom - 1);\n  expect(f.bottom).toBeGreaterThan(window.innerHeight + 100);\n} finally { extra.remove(); }" },
        { name: 'висота футера та шапки не змінилась', code: "expect(Math.round(rect('.footer').height)).toBe(40);\nexpect(Math.round(rect('.header').height)).toBe(50);" }
      ],
      explanation: `
- \`min-height: 100vh\` — сторінка щонайменше на висоту вікна, але може рости. З \`height: 100vh\` довгий контент виліз би за межі \`.page\`, а футер лишився б на позиції 560px поверх тексту — найчастіша помилка.
- \`flex-direction: column\` + \`main { flex: 1 }\` — main забирає весь вільний простір по вертикалі, відштовхуючи футер донизу.

**Альтернатива на Grid:**
\`\`\`css
.page { min-height: 100vh; display: grid; grid-template-rows: auto 1fr auto; }
\`\`\`

**Мобільні браузери:** \`100vh\` на iOS/Android дорівнює висоті з **прихованою** адресною панеллю, тож футер може опинитися під панеллю. Сучасне рішення — \`min-height: 100dvh\` (dynamic viewport), також є \`svh\` (найменша) і \`lvh\` (найбільша висота).

**Застарілі способи:** від'ємний \`margin-top\` футера + \`padding-bottom\` контенту (потрібна фіксована висота футера), \`display: table\`.

**Що можуть спитати далі:** чим відрізняється sticky footer від \`position: fixed; bottom: 0\` і від \`position: sticky\`?
`
    },

    // ---------------------------------------------------------------- Адаптивність
    {
      id: 'layout-responsive-theory', group: "responsive", why: ["Так: без viewport мобільний браузер рендерить ширину ~980px.","Так: mobile-first: база для малих, min-width для більших.","Ні: брейкпоінти обирають там, де ламається дизайн.","Ні: заборона зуму шкодить доступності.","Ні: є hover, pointer, prefers-* та інші медіа-фічі."],
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Адаптивна верстка: mobile-first, media queries, брейкпоінти',
      tags: ['responsive', 'media-queries'],
      question: 'Що таке адаптивна верстка? Поясніть підхід mobile-first, як працюють media queries, як обирати брейкпоінти і навіщо meta viewport. Оберіть **усі** правильні твердження.',
      choices: [
        'Без meta viewport з `width=device-width` мобільний браузер рендерить сторінку як ~980px-десктоп і зменшує',
        'Mobile-first — базові стилі для малих екранів, а для більших — доповнення через `@media (min-width: …)`',
        'Брейкпоінти найкраще брати під популярні пристрої, наприклад точну ширину iPhone та iPad',
        '`user-scalable=no` у meta viewport — рекомендована практика, щоб верстка не «ламалася» при зумі',
        'Медіазапити бувають лише за шириною й висотою; тач-пристрій засобами CSS розпізнати неможливо'
      ],
      correct: [0, 1],
      hint: 'Розгляньте: viewport meta, min-width vs max-width, звідки брати брейкпоінти, інструменти окрім media queries.',
      answer: `
**Адаптивна (responsive) верстка** — один HTML/CSS, що підлаштовує розкладку під ширину екрана, щільність пікселів, орієнтацію, режим вводу.

**1. Meta viewport** — без неї мобільний браузер рендерить сторінку як 980px-десктоп і зменшує:
\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1">
\`\`\`
(Не забороняйте масштабування \`user-scalable=no\` — це порушення a11y.)

**2. Mobile-first** — базові стилі пишуться для найменших екранів, а для більших додаються через \`min-width\`:
\`\`\`css
.grid { display: grid; gap: 16px; }                     /* мобільні: 1 колонка */
@media (min-width: 768px)  { .grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1200px) { .grid { grid-template-columns: repeat(4, 1fr); } }
\`\`\`
Переваги: мобільні отримують найпростіший CSS без перевизначень; змушує пріоритезувати контент; прогресивне покращення. Desktop-first (\`max-width\`) — навпаки, багато «скасувань» стилів.

**3. Брейкпоінти** обирають **за контентом**, а не під конкретні пристрої: розширюйте вікно, доки макет не «зламається», — там і брейкпоінт. Типові орієнтири: ~480, 768, 1024, 1280px. Краще в \`em\` (поважають масштаб шрифту користувача).

**4. Інші медіа-ознаки:** \`orientation\`, \`hover: hover\` / \`pointer: coarse\` (тач-пристрої), \`prefers-color-scheme\`, \`prefers-reduced-motion\`, \`resolution\`. Нова діапазонна форма: \`@media (768px <= width < 1024px)\`.

**5. Інструменти без media queries («intrinsic design»):** \`repeat(auto-fill, minmax())\`, \`flex-wrap\`, \`clamp()\` для шрифтів і відступів, \`min()/max()\`, \`aspect-ratio\`, **container queries** для компонентів.

**6. Зображення:** \`srcset\`/\`sizes\`, \`<picture>\` для art direction, \`max-width: 100%\`, \`object-fit\`.

**Пастки:** порядок media-правил (при рівній специфічності виграє пізніше), \`100vh\` на мобільних (краще \`dvh\`), горизонтальний скрол через фіксовані ширини.
`,
      keyPoints: [
        'Meta viewport width=device-width, initial-scale=1',
        'Mobile-first: базові стилі для мобільних + min-width медіазапити',
        'Брейкпоінти — за контентом, а не під пристрої; бажано в em',
        'Медіа-ознаки: hover/pointer, prefers-color-scheme, prefers-reduced-motion',
        'Intrinsic-інструменти: auto-fill/minmax, clamp, container queries, srcset'
      ],
      followUps: [
        'Чому брейкпоінти краще задавати в em, а не в px?',
        'Чим container queries кращі за media queries для компонентів?',
        'Як зробити адаптивні зображення (srcset, sizes, picture)?'
      ]
    },
    {
      id: 'layout-quiz-media-order', group: "responsive", why: ["Так: при 1200px спрацьовують обидва min-width, перемагає пізніше правило.","Ні: media-правила застосовуються.","Ні: правило для 768px перекрите пізнішим.","Ні: конфлікт вирішує каскад — порядок у файлі."],
      type: 'quiz',
      level: 2,
      title: 'Порядок media queries',
      tags: ['responsive', 'media-queries', 'cascade'],
      question: `
Яка ширина \`.box\` на екрані шириною **1200px**?

\`\`\`css
.box { width: 100%; }
@media (min-width: 1024px) { .box { width: 33%; } }
@media (min-width: 768px)  { .box { width: 50%; } }
\`\`\`
`,
      options: ['`50%`', '`100%`', '`33%`', 'Правила конфліктують, тому не застосується жодне'],
      answer: 0,
      hint: 'Media query не додає специфічності. Скільки умов виконується на 1200px?',
      explanation: `
На 1200px виконуються **обидва** медіазапити. Media query не підвищує специфічність, тож усі три правила мають однакову специфічність \`.box\` (0,1,0), і перемагає **останнє** в коді — \`width: 50%\`.

- \`33%\` — було б, якби запити йшли за зростанням: спочатку 768, потім 1024. Саме тому в mobile-first медіазапити пишуть **від меншого до більшого**.
- \`100%\` — базове правило перекрите обома запитами.
- Жодного «конфлікту» немає — це звичайний каскад.

У desktop-first (\`max-width\`) навпаки: запити йдуть від більшого до меншого.
`
    },
    {
      id: 'layout-mobile-first-media', group: "responsive",
      type: 'dom',
      level: 3,
      title: 'Переписати desktop-first на mobile-first',
      tags: ['responsive', 'media-queries', 'mobile-first'],
      description: `
**Завдання.** Зараз стилі написані **desktop-first**: базово картки стоять у ряд, а для вузьких екранів \`max-width\`-запит перебудовує їх у колонку.

**Де трапляється:** сучасний стандарт адаптивної верстки.

Перепишіть на **mobile-first**:

- **базові стилі (без media query)** — картки в колонку одна під одною, на всю ширину \`.cards\`, відступ 12px;
- **\`@media (min-width: 700px)\`** — три картки в ряд, однакової ширини, з відступом 12px.

Viewport тренажера — 800px, тому зараз має діяти «десктопний» варіант. Тест тимчасово вимкне ваші медіазапити, щоб перевірити мобільний варіант.

**Як це працює:** База — стилі для вузьких екранів (колонка), а широкий варіант вмикається через @media (min-width: …). Так менше перевизначень і мобільний CSS найпростіший.
`,
      html: `<div class="cards">
  <div class="card">1</div>
  <div class="card">2</div>
  <div class="card">3</div>
</div>`,
      css: `.cards {
  display: flex;
  gap: 12px;
}
.card {
  flex: 1;
  height: 80px;
  background: #ccfbf1;
}
@media (max-width: 699px) {
  .cards {
    flex-direction: column;
  }
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card {
  height: 80px;
  background: #ccfbf1;
}
@media (min-width: 700px) {
  .cards {
    flex-direction: row;
  }
  .card {
    flex: 1;
  }
}
`
      },
      hints: [
        'Mobile-first: спочатку опишіть мобільний вигляд **без** медіазапитів — тобто колонку.',
        'Потім додайте `@media (min-width: 700px)`, у якому `.cards` стає рядом, а картки — рівними (`flex: 1`).',
        'Запит з `max-width` має зникнути.'
      ],
      tests: [
        { name: 'на 800px три картки в ряд однакової ширини', code: "const c = $$('.card').map(rect);\nexpect(Math.abs(c[0].top - c[2].top)).toBeLessThanOrEqual(1);\nexpect(Math.abs(c[0].width - c[2].width)).toBeLessThanOrEqual(1);\nexpect(Math.abs(c[1].left - c[0].right - 12)).toBeLessThanOrEqual(1);" },
        { name: 'використано min-width медіазапит, без max-width', code: "const conds = [];\nfor (const sh of document.styleSheets) for (const r of sh.cssRules) if (r instanceof CSSMediaRule) conds.push(r.conditionText || r.media.mediaText);\nexpect(conds.some(c => /min-width|width\\s*>=?/.test(c))).toBe(true);\nexpect(conds.some(c => /max-width|width\\s*<=?/.test(c))).toBe(false);" },
        { name: 'без медіазапитів (мобільні) — колонка на всю ширину', code: "const removed = [];\nfor (const sh of document.styleSheets) {\n  for (let i = sh.cssRules.length - 1; i >= 0; i--) {\n    if (sh.cssRules[i] instanceof CSSMediaRule) { removed.push([sh, i, sh.cssRules[i].cssText]); sh.deleteRule(i); }\n  }\n}\ntry {\n  const box = rect('.cards'), c = $$('.card').map(rect);\n  expect(Math.abs(c[0].left - c[1].left)).toBeLessThanOrEqual(1);\n  expect(Math.abs(c[1].top - c[0].bottom - 12)).toBeLessThanOrEqual(1);\n  expect(Math.abs(c[2].width - box.width)).toBeLessThanOrEqual(1);\n} finally {\n  removed.reverse().forEach(([sh, i, t]) => sh.insertRule(t, i));\n}" }
      ],
      explanation: `
**Mobile-first** — базовий CSS описує найпростіший (мобільний) стан, а медіазапити з \`min-width\` **додають** складність для ширших екранів.

**Чому так краще:**
- мобільні пристрої (найслабші) не парсять і не застосовують «десктопні» стилі, щоб потім їх скасовувати;
- менше перевизначень: у desktop-first часто доводиться писати \`flex: none\`, \`float: none\`, \`width: auto\` — «скидання»;
- природне прогресивне покращення: якщо медіазапити не спрацюють, користувач отримає робочу одноколонкову версію.

**Як тест перевіряє мобільну версію:** вікно тренажера фіксоване (800px), тому тест видаляє всі \`CSSMediaRule\` з таблиці стилів через CSSOM (\`sheet.deleteRule\`), вимірює розкладку і повертає правила назад — це рівно те, що побачить пристрій, для якого жоден \`min-width\`-запит не виконався.

**Типові помилки:** забути перенести \`flex: 1\` у медіазапит (тоді в колонці картки отримають \`flex-basis: 0\` — у колонці з auto-висотою контейнера це ок, але в інших випадках дає сюрпризи); залишити обидва типи запитів, і вони перекривають один одного на межі (699.5px на дробових DPR!).

**Що можуть спитати далі:** як уникнути «щілини» між \`max-width: 767px\` і \`min-width: 768px\`? (Діапазонний синтаксис \`width < 768px\`.)
`
    },
    {
      id: 'layout-aspect-ratio-media', group: "responsive",
      type: 'dom',
      level: 1,
      title: 'aspect-ratio для відео та object-fit для зображень',
      tags: ['responsive', 'aspect-ratio', 'object-fit'],
      description: `
**Завдання.** Два завдання з медіа:

**Де трапляється:** вбудовані відео, прев'ю зображень без стрибків.

1. \`.video\` — плеєр на всю ширину \`.player\` зі співвідношенням сторін **16:9** (висота має перераховуватися при зміні ширини; тест змінить ширину \`.player\`).
2. \`.avatar\` — зображення 2:1 треба показати **квадратом 120×120** без спотворення пропорцій: зайве **обрізається** по краях.

HTML не змінюйте.

**Як це працює:** aspect-ratio: 16 / 9 рахує висоту від ширини. Для зображення object-fit: cover заповнює рамку з обрізанням, не спотворюючи пропорції.
`,
      html: `<div class="player">
  <div class="video"></div>
</div>
<img class="avatar" alt="Аватар" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100'%3E%3Crect width='200' height='100' fill='%2393c5fd'/%3E%3Ccircle cx='100' cy='50' r='40' fill='%231d4ed8'/%3E%3C/svg%3E">`,
      css: `.player {
  width: 640px;
  margin-bottom: 16px;
}
.video {
  width: 100%;
  background: #000;
}
.avatar {
  display: block;
  width: 120px;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.player {
  width: 640px;
  margin-bottom: 16px;
}
.video {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
}
.avatar {
  display: block;
  width: 120px;
  height: 120px;
  object-fit: cover;
}
`
      },
      hints: [
        'Для співвідношення сторін є окрема властивість — без хаків з `padding-top`.',
        'Для зображення задайте обидва розміри (або `aspect-ratio: 1`), а як вписати картинку в бокс — керує `object-fit`.',
        '`.video { aspect-ratio: 16 / 9 }`, `.avatar { height: 120px; object-fit: cover }`.'
      ],
      tests: [
        { name: 'відео 16:9 при ширині 640px', code: "const v = rect('.video');\nexpect(Math.abs(v.width - 640)).toBeLessThanOrEqual(1);\nexpect(Math.abs(v.height - 360)).toBeLessThanOrEqual(1);" },
        { name: 'відео 16:9 при ширині 320px', code: "const p = $('.player');\np.style.width = '320px';\ntry {\n  expect(Math.abs(rect('.video').height - 180)).toBeLessThanOrEqual(1);\n} finally { p.style.width = ''; }" },
        { name: 'аватар — квадрат 120×120', code: "const a = rect('.avatar');\nexpect(Math.round(a.width)).toBe(120);\nexpect(Math.round(a.height)).toBe(120);" },
        { name: 'аватар обрізається, а не спотворюється', code: "expect(css('.avatar', 'object-fit')).toBe('cover');" }
      ],
      explanation: `
**aspect-ratio** задає бажане співвідношення сторін: якщо відомий один розмір (тут ширина 100%), інший обчислюється. Раніше використовували хак \`padding-top: 56.25%\` (відсотки padding рахуються від **ширини** батька) + абсолютно позиціонований вміст.

**object-fit** керує тим, як вміст заміщуваного елемента (\`img\`, \`video\`) вписується в його бокс:
- \`fill\` (за замовчуванням) — розтягує, спотворюючи пропорції;
- \`contain\` — вписує повністю, лишаючи порожні смуги;
- \`cover\` — заповнює бокс, обрізаючи зайве;
- \`none\`, \`scale-down\`.
\`object-position\` визначає, яку частину показати (\`center\` за замовчуванням, \`top\` для портретів).

**CLS (Cumulative Layout Shift):** атрибути \`width\`/\`height\` на \`<img>\` дають браузеру співвідношення сторін ще до завантаження — місце резервується, контент не «стрибає». Для блоків із динамічним вмістом — \`aspect-ratio\`.

**Що можуть спитати далі:** чим \`object-fit: cover\` відрізняється від \`background-size: cover\`? Коли обирати \`<img>\`, а коли фон (семантика, alt, lazy loading, LCP)?
`
    },
    {
      id: 'layout-container-queries-theory', group: "responsive", why: ["Ні: @container стилізує нащадків, не сам контейнер.","Так: inline-size containment дозволяє запитувати ширину контейнера.","Ні: media queries потрібні для viewport і фіч пристрою.","Ні: containment ламає shrink-to-fit елементи — потрібна визначена ширина.","Ні: cqi/cqw рахуються від контейнера."],
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Container queries: навіщо і як',
      tags: ['responsive', 'container-queries'],
      question: 'Що таке container queries? Чим вони відрізняються від media queries і коли їх застосовувати? Які є обмеження?',
      choices: [
        '`@container` стилізує і сам контейнер, якщо йому задано `container-type`, а не лише нащадків',
        '`container-type: inline-size` вмикає containment: ширина контейнера має приходити ззовні, а не від вмісту',
        'Container queries повністю замінюють media queries, зокрема для `prefers-*`, `hover` і print',
        '`container-type: inline-size` можна ставити будь-де: shrink-to-fit ширина елемента при цьому збережеться',
        'Одиниці `cqi`/`cqw` рахуються від розміру viewport, як `vw`, але без урахування скролбару'
      ],
      correct: 1,
      hint: 'Подумайте про компонент, який використовується і в сайдбарі, і в основній колонці.',
      answer: `
**Container queries** дозволяють стилізувати елемент залежно від розміру **його контейнера**, а не всього viewport.

**Проблема media queries:** компонент «картка» може стояти в широкій основній колонці та у вузькому сайдбарі на тому самому екрані. Media query знає лише ширину вікна, тож доводиться писати модифікатори (\`.card--compact\`) і пам'ятати контекст.

**Синтаксис:**
\`\`\`css
.card-wrap {
  container-type: inline-size;   /* стає query container за шириною */
  container-name: card;          /* необов'язково; шорткат: container: card / inline-size */
}
@container card (min-width: 500px) {
  .card { grid-template-columns: 200px 1fr; }
}
.card h3 { font-size: clamp(1rem, 4cqi, 1.5rem); }  /* контейнерні одиниці */
\`\`\`

**Як працює:**
- \`container-type: inline-size\` вмикає **containment** за inline-розміром: розмір контейнера не може залежати від вмісту (інакше — циклічна залежність). Тому контейнер має отримувати ширину ззовні (блок, flex/grid-елемент).
- \`size\` — запити і за шириною, і за висотою (потрібна явна висота).
- Запит стилізує **нащадків** контейнера, але не сам контейнер.
- Одиниці \`cqw\`, \`cqh\`, \`cqi\`, \`cqb\`, \`cqmin\`, \`cqmax\` — відсоток від розміру найближчого контейнера.
- Без імені \`@container\` шукає найближчого предка-контейнера.

**Style queries:** \`@container style(--variant: compact)\` — запит за значенням custom property (підтримка ще неповна).

**Коли що:**
- **media queries** — макет сторінки, глобальні речі (навігація, \`prefers-*\`, \`hover\`, print);
- **container queries** — перевикористовувані компоненти в дизайн-системі.

**Обмеження/пастки:** \`container-type: inline-size\` на елементі зі shrink-to-fit шириною (inline-block, float, absolute, flex-елемент без basis) схлопне його до 0 — розмір мусить бути зовнішнім. Також \`container-type\` вмикає style containment (наприклад, CSS-лічильники всередині ізольовані). Підтримка — усі сучасні браузери з 2023 року.
`,
      keyPoints: [
        'Стилі залежать від розміру контейнера, а не viewport',
        'container-type: inline-size (або size) + @container (min-width: ...)',
        'Запит стилізує нащадків, а не сам контейнер',
        'Containment: розмір контейнера не може залежати від вмісту',
        'Контейнерні одиниці cqi/cqw; media — для макета, container — для компонентів'
      ],
      followUps: [
        'Чому не можна запитувати розмір контейнера, що залежить від власного вмісту?',
        'Що таке style queries?',
        'Як зробити fallback для браузерів без підтримки (@supports)?'
      ]
    },
    {
      id: 'layout-container-query-card', group: "responsive",
      type: 'dom',
      level: 3,
      title: 'Картка, що перебудовується за шириною контейнера',
      tags: ['responsive', 'container-queries'],
      description: `
**Завдання.** Компонент картки має адаптуватися до ширини **свого контейнера** \`.wrap\`, а не вікна:

**Де трапляється:** компоненти, що живуть у сайдбарі й у широкому контенті.

- за замовчуванням (вузький контейнер) — вертикально: \`.thumb\` на всю ширину зверху, \`.content\` під нею;
- коли ширина \`.wrap\` **≥ 500px** — горизонтально: \`.thumb\` ліворуч шириною **200px**, \`.content\` праворуч (їхні верхні краї на одному рівні);
- відступ між частинами — 12px.

Зробіть \`.wrap\` query-контейнером і використайте \`@container\`. Тест змінюватиме ширину \`.wrap\`.

**Як це працює:** container-type: inline-size на обгортці дозволяє @container (min-width: …) реагувати на ширину саме контейнера, а не вікна.
`,
      html: `<div class="wrap">
  <article class="card">
    <div class="thumb"></div>
    <div class="content">
      <h3>Container queries</h3>
      <p>Компонент сам вирішує, як виглядати, залежно від місця, яке йому дали.</p>
    </div>
  </article>
</div>`,
      css: `.wrap {
  width: 600px;
}
.card {
  display: grid;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
}
.thumb {
  height: 120px;
  background: #a78bfa;
}
.content h3,
.content p {
  margin: 0 0 8px;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.wrap {
  width: 600px;
  container-type: inline-size;
}
.card {
  display: grid;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
}
.thumb {
  height: 120px;
  background: #a78bfa;
}
.content h3,
.content p {
  margin: 0 0 8px;
}
@container (min-width: 500px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
}
`
      },
      hints: [
        'Спочатку оголосіть контейнер: `container-type: inline-size` на `.wrap`.',
        'Потім `@container (min-width: 500px) { ... }` — усередині змініть розкладку `.card` (сам `.wrap` у запиті стилізувати не можна).',
        'У запиті достатньо `grid-template-columns: 200px 1fr` для `.card`.'
      ],
      tests: [
        { name: '.wrap — query container', code: "expect(css('.wrap', 'container-type')).toBe('inline-size');" },
        { name: '600px → горизонтально, thumb 200px', code: "const t = rect('.thumb'), c = rect('.content');\nexpect(Math.abs(t.width - 200)).toBeLessThanOrEqual(1);\nexpect(Math.abs(c.left - t.right - 12)).toBeLessThanOrEqual(1);\nexpect(Math.abs(c.top - t.top)).toBeLessThanOrEqual(1);" },
        { name: '400px → вертикально, thumb на всю ширину', code: "const w = $('.wrap');\nw.style.width = '400px';\ntry {\n  const card = rect('.card'), t = rect('.thumb'), c = rect('.content');\n  expect(Math.abs(t.width - (card.width - 26))).toBeLessThanOrEqual(1);\n  expect(Math.abs(c.top - t.bottom - 12)).toBeLessThanOrEqual(1);\n} finally { w.style.width = ''; }" },
        { name: 'рівно 500px → вже горизонтально', code: "const w = $('.wrap');\nw.style.width = '500px';\ntry {\n  expect(Math.abs(rect('.thumb').width - 200)).toBeLessThanOrEqual(1);\n} finally { w.style.width = ''; }" }
      ],
      explanation: `
1. \`container-type: inline-size\` робить \`.wrap\` **query container** за шириною.
2. \`@container (min-width: 500px)\` перевіряє ширину найближчого предка-контейнера і застосовує правила до його нащадків.

**Чому обгортка:** запит не може стилізувати сам контейнер (інакше стилі змінювали б розмір, від якого залежить запит, — цикл). Тому контейнер — \`.wrap\`, а змінюється \`.card\`.

**Перевага над media queries:** ту саму картку можна покласти в сайдбар 300px і в основну колонку 800px — на одному екрані вона виглядатиме по-різному без жодних модифікаторів.

**Пастки:**
- \`container-type: inline-size\` вмикає size containment по ширині — якщо контейнер не має зовнішньої ширини (inline-block, \`width: fit-content\`, absolute без розмірів), він схлопнеться до 0;
- іменуйте контейнери (\`container: card / inline-size\` + \`@container card (...)\`), коли вони вкладені, інакше запит піде до найближчого;
- запит з \`min-width: 500px\` перевіряє content-box контейнера.

**Що можуть спитати далі:** як зробити розмір шрифту, залежний від контейнера (\`cqi\`)? Чим відрізняються \`inline-size\` і \`size\`?
`
    },
    {
      id: 'layout-quiz-clamp', group: "responsive", why: ["Ні: максимум обмежено 2rem = 32px.","Ні: мінімум — 1rem = 16px.","Ні: максимум 32px.","Так: значення затиснуте між 16px і 32px."],
      type: 'quiz',
      level: 2,
      title: 'clamp() для плавної типографіки',
      tags: ['responsive', 'clamp', 'typography'],
      question: `
Root font-size — 16px. Який розмір шрифту на екранах шириною **1440px** і **400px**?

\`\`\`css
h1 { font-size: clamp(1rem, 2.5vw, 2rem); }
\`\`\`
`,
      options: ['`36px` і `10px`', '`32px` і `10px`', '`36px` і `16px`', '`32px` і `16px`'],
      answer: 3,
      hint: 'clamp(MIN, VAL, MAX) = max(MIN, min(VAL, MAX)).',
      explanation: `
\`clamp(MIN, VAL, MAX)\` повертає VAL, обмежене знизу MIN і зверху MAX.

- 1440px: 2.5vw = 36px > 2rem (32px) → **32px**.
- 400px: 2.5vw = 10px < 1rem (16px) → **16px**.
- Між 640px і 1280px розмір змінюється плавно.

Варіанти з 36px і 10px ігнорують межі — це значення «голого» \`2.5vw\`.

**Нюанс для a11y:** чисте \`vw\` не реагує на масштабування шрифту користувачем (WCAG 1.4.4). Краще поєднувати з rem: \`clamp(1rem, 0.75rem + 1.5vw, 2rem)\`.
`
    },
    {
      id: 'layout-clamp-fluid-type', group: "responsive",
      type: 'dom',
      level: 3,
      title: 'Плавний розмір заголовка: clamp() + контейнерні одиниці',
      tags: ['responsive', 'clamp', 'container-queries', 'typography'],
      description: `
**Завдання.** Розмір заголовка \`.title\` має плавно залежати від ширини блоку \`.wrap\`:

**Де трапляється:** плавні заголовки на лендингах без брейкпоінтів.

- бажане значення — **5% ширини контейнера** (одиниця \`cqi\`);
- але не менше **20px** і не більше **40px**.

Очікувано: \`.wrap\` 600px → 30px, 300px → 20px, 1000px → 40px.

> Чому не \`vw\`: viewport тренажера фіксований (800px), а компонент має реагувати на свій контейнер. Зробіть \`.wrap\` query-контейнером.

**Як це працює:** clamp(min, бажане, max) обмежує значення. Бажане у cqi (відсоток ширини контейнера) змінюється плавно, а мінімум і максимум не дають тексту стати надто дрібним чи великим.
`,
      html: `<div class="wrap">
  <h1 class="title">Плавна типографіка</h1>
</div>`,
      css: `.wrap {
  width: 600px;
}
.title {
  margin: 0;
  font-size: 32px;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.wrap {
  width: 600px;
  container-type: inline-size;
}
.title {
  margin: 0;
  font-size: clamp(20px, 5cqi, 40px);
}
`
      },
      hints: [
        '`cqi` = 1% inline-розміру найближчого query-контейнера. Без `container-type` на предку одиниця рахується від viewport.',
        '`clamp(MIN, БАЖАНЕ, MAX)`.',
        '`.wrap { container-type: inline-size } .title { font-size: clamp(20px, 5cqi, 40px) }`'
      ],
      tests: [
        { name: '600px → 30px', code: "expect(parseFloat(css('.title', 'font-size'))).toBeCloseTo(30, 0);" },
        { name: '300px → мінімум 20px', code: "const w = $('.wrap');\nw.style.width = '300px';\ntry { expect(parseFloat(css('.title', 'font-size'))).toBeCloseTo(20, 0); } finally { w.style.width = ''; }" },
        { name: '1000px → максимум 40px', code: "const w = $('.wrap');\nw.style.width = '1000px';\ntry { expect(parseFloat(css('.title', 'font-size'))).toBeCloseTo(40, 0); } finally { w.style.width = ''; }" },
        { name: '480px → 24px (плавно між межами)', code: "const w = $('.wrap');\nw.style.width = '480px';\ntry { expect(parseFloat(css('.title', 'font-size'))).toBeCloseTo(24, 0); } finally { w.style.width = ''; }" }
      ],
      explanation: `
- \`container-type: inline-size\` робить \`.wrap\` контейнером, і \`cqi\` рахується від його ширини: 5cqi при 600px = 30px.
- \`clamp(20px, 5cqi, 40px)\` обмежує значення: на 300px 5cqi = 15px → 20px; на 1000px 50px → 40px.

**Класичний варіант на viewport:**
\`\`\`css
h1 { font-size: clamp(1.25rem, 1rem + 2vw, 2.5rem); }
\`\`\`
Формула «rem + vw» важлива для доступності: частина \`rem\` масштабується з налаштуваннями шрифту користувача, а чисте \`vw\` — ні.

**Як підібрати коефіцієнти:** для лінійного росту від 20px на 400px до 40px на 1200px: нахил = (40 − 20) / (1200 − 400) = 2.5vw, зсув = 20 − 400 × 0.025 = 10px → \`clamp(20px, 10px + 2.5vw, 40px)\`.

**Також для відступів:** \`padding: clamp(16px, 4cqi, 48px)\` — «плавні» відступи без медіазапитів.

**Що можуть спитати далі:** чим \`clamp()\` відрізняється від \`min()\`/\`max()\`? Як обчислюється \`cqi\`, якщо контейнерів кілька або їх немає?
`
    }
  ]
});
