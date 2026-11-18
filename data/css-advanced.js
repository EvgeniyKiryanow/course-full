FE.topic('css-advanced', {
  intro: `
## position і containing block

| Значення | У потоці? | Відносно чого зсувається |
|---|---|---|
| \`static\` | так | \`top/left\` не діють |
| \`relative\` | так (місце зберігається) | відносно своєї звичайної позиції |
| \`absolute\` | ні | найближчий предок з \`position\` ≠ static (padding-box) |
| \`fixed\` | ні | viewport (**але** предок з \`transform\`/\`filter\`/\`perspective\`/\`contain\`/\`will-change: transform\` перехоплює!) |
| \`sticky\` | так | прилипає в межах найближчого **scroll-контейнера** і свого батька |

## Stacking context (контекст накладання)
Створюють: корінь; \`position\` ≠ static + \`z-index\` ≠ auto; \`position: fixed/sticky\`; flex/grid-елемент з \`z-index\`; \`opacity < 1\`; \`transform\`, \`filter\`, \`backdrop-filter\`, \`perspective\`, \`clip-path\`, \`mask\`; \`isolation: isolate\`; \`mix-blend-mode\`; \`will-change\` з цими властивостями; \`contain: layout/paint\`, \`container-type\`.

- \`z-index\` порівнюється **лише між сусідами в одному контексті**. Дитина з \`z-index: 9999\` не вилізе вище за «дядька», якщо батько має нижчий рівень.
- \`z-index\` не діє на non-positioned елементи (крім flex/grid-елементів).

## BFC (block formatting context)
Створюють: \`display: flow-root\`, \`overflow\` ≠ visible/clip, \`float\`, \`position: absolute/fixed\`, \`inline-block\`, flex/grid-елементи, \`contain: layout\`, multicol.
Навіщо: містить float-и (висота батька), не дає margin схлопнутися з дітьми, не обтікає float.

## Transitions і animations
\`\`\`css
.btn { transition: transform 200ms ease-out, opacity 200ms; }
.spinner { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
\`\`\`
- Timing: \`ease\`, \`linear\`, \`ease-in-out\`, \`cubic-bezier(x1, y1, x2, y2)\`, \`steps(n)\`.
- \`animation-fill-mode: forwards\` — зберегти кінцевий стан; \`animation-direction: alternate\`; \`animation-play-state: paused\`.
- Дешево анімувати лише **\`transform\` і \`opacity\`** (композитор). \`width/top/margin\` → layout, \`color/box-shadow\` → paint.
- \`display\` не анімується звичайним transition (рішення: opacity + visibility, \`@starting-style\`, \`transition-behavior: allow-discrete\`).

## Custom properties
\`\`\`css
:root { --accent: #2563eb; }
[data-theme="dark"] { --bg: #121212; }
.btn { color: var(--accent, blue); }  /* fallback */
\`\`\`
- Успадковуються, підкоряються каскаду, живуть у runtime (змінюються з JS: \`el.style.setProperty('--x', '10px')\`).
- Невалідне значення на етапі обчислення → властивість стає \`unset\` (fallback **не** спрацьовує).

## Сучасний CSS
- \`:has()\` — «батьківський» селектор: \`.card:has(input:checked)\`.
- \`@layer\` — шари каскаду: порядок шарів важливіший за специфічність; стилі поза шарами перемагають.
- Нативний nesting: \`.card { &:hover {} .title {} }\`; \`@supports (display: grid) {}\`; \`@property\` — типізовані змінні (можна анімувати).
- Логічні властивості: \`margin-inline\`, \`padding-block\`, \`inset-inline-start\` — працюють для RTL.
`,
  groups: [
    { id: "position", title: "position і containing block" },
    { id: "stacking", title: "Stacking context і z-index" },
    { id: "bfc", title: "BFC, float, margin collapse" },
    { id: "animation", title: "Transitions, animations, transform" },
    { id: "custom-props", title: "CSS-змінні" },
    { id: "modern", title: "Сучасний CSS і архітектура стилів" },
    { id: 'theming', title: 'Темна тема, кольори й ефекти' },
    { id: 'scroll-transitions', title: 'Scroll-snap, View Transitions і друк' }
  ],
  items: [
    // ---------------------------------------------------------------- Позиціонування
    {
      id: 'cssadv-position-theory', group: "position", why: ["Ні: absolute відносно найближчого позиціонованого предка.","Ні: relative лишає місце в потоці.","Так: transform на предку стає containing block для fixed.","Ні: sticky працює в межах найближчого прокручуваного предка і батька.","Ні: на static-елементи top/left не діють."],
      type: 'theory',
      level: 2,
      interview: true,
      title: 'position: static/relative/absolute/fixed/sticky',
      tags: ['position', 'containing-block'],
      question: 'Розкажіть про значення властивості position. Що таке containing block і як він визначається для absolute та fixed елементів?',
      choices: [
        '`absolute` позиціонується відносно безпосереднього батька, навіть якщо в нього `position: static`',
        '`relative` виймає елемент із потоку, і сусіди займають його місце так само, як при `absolute`',
        '`fixed` привʼязаний до viewport, але предок із `transform` чи `filter` стає його containing block',
        '`sticky` завжди прилипає відносно viewport, навіть якщо предок має `overflow: auto`',
        '`top`/`left` діють і на `static`-елементи, просто з нижчим пріоритетом, ніж `margin`'
      ],
      correct: 2,
      hint: 'Для кожного значення: чи лишається елемент у потоці і відносно чого працюють top/left.',
      answer: `
**static** — за замовчуванням: елемент у звичайному потоці, \`top/left/z-index\` не діють.

**relative** — елемент лишається в потоці (його місце зберігається), але візуально зсувається відносно своєї звичайної позиції. Головне практичне застосування — зробити елемент containing block для absolute-нащадків, не зрушивши його.

**absolute** — елемент **випадає з потоку**; позиціонується відносно **containing block** — padding-box найближчого предка з \`position\` ≠ static. Якщо такого немає — відносно початкового containing block (розмір viewport, прив'язаний до початку документа). Ширина за замовчуванням — shrink-to-fit.

**fixed** — випадає з потоку, позиціонується відносно **viewport** і не рухається при скролі. **Пастка:** якщо в предка є \`transform\`, \`filter\`, \`perspective\`, \`backdrop-filter\`, \`contain: paint/layout\`, \`will-change: transform\` — containing block стає цей предок, і «fixed» поводиться як absolute (модалка в анімованій картці перестає бути повноекранною).

**sticky** — гібрид: поводиться як relative, доки елемент не дійде до порогу (\`top: 0\`) у найближчому **scroll-контейнері**, тоді прилипає. Обмежений межами свого батька — коли батько прокручується повністю, sticky-елемент їде разом із ним.

\`\`\`css
.card  { position: relative; }
.badge { position: absolute; top: -8px; right: -8px; }   /* відносно .card */
.modal { position: fixed; inset: 0; }                       /* на весь viewport */
.thead { position: sticky; top: 0; }                        /* липкий заголовок */
\`\`\`

**Нюанси:**
- \`inset: 0\` = \`top/right/bottom/left: 0\`; для absolute з усіма чотирма й \`width: auto\` елемент розтягується;
- відсотки в \`top/bottom\` — від висоти containing block, у \`left/right\` — від ширини;
- \`position: fixed/sticky\` і \`absolute/relative\` з \`z-index\` створюють stacking context;
- absolute-елемент блокофікується (\`display: inline\` → block).
`,
      keyPoints: [
        'static — потік, offsets не діють; relative — у потоці, зсув від своєї позиції',
        'absolute — поза потоком, відносно найближчого позиціонованого предка (padding-box)',
        'fixed — відносно viewport, але предок з transform/filter/perspective перехоплює containing block',
        'sticky — прилипає в найближчому scroll-контейнері в межах батька',
        'relative часто використовують лише як якір для absolute-нащадків'
      ],
      followUps: [
        'Чому position: fixed може перестати бути прив\'язаним до viewport?',
        'Відносно якого бокса (content/padding/border) рахуються offsets absolute-елемента?',
        'Чому sticky не працює всередині overflow: hidden?'
      ]
    },
    {
      id: 'cssadv-badge-corner', group: "position",
      type: 'dom',
      level: 1,
      title: 'Бейдж у правому верхньому куті картки',
      tags: ['position', 'absolute'],
      description: `
**Завдання.** Бейдж \`.badge\` з лічильником має «висіти» на правому верхньому куті картки: на **10px правіше і вище** за кут (\`top: -10px; right: -10px\` уже задані). Але зараз він опинився в куті сторінки.

**Де трапляється:** лічильники повідомлень на іконках і аватарах.

Виправте так, щоб бейдж позиціонувався відносно \`.card\`. Картка має лишитися на своєму місці в потоці.

**Як це працює:** Картці position: relative — вона стає containing block. Бейджу position: absolute з top/right від'ємними значеннями — він виступає за кут.
`,
      html: `<div class="card">
  <h3>Кошик</h3>
  <p>Товари, що ви додали.</p>
  <span class="badge">3</span>
</div>`,
      css: `.card {
  width: 240px;
  margin: 40px;
  padding: 16px;
  background: #f1f5f9;
  border-radius: 12px;
}
.card h3,
.card p {
  margin: 0 0 8px;
}
.badge {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  font-size: 12px;
  line-height: 24px;
  text-align: center;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.card {
  position: relative;
  width: 240px;
  margin: 40px;
  padding: 16px;
  background: #f1f5f9;
  border-radius: 12px;
}
.card h3,
.card p {
  margin: 0 0 8px;
}
.badge {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  font-size: 12px;
  line-height: 24px;
  text-align: center;
}
`
      },
      hints: [
        'Абсолютний елемент шукає найближчого предка, у якого `position` не `static`. Якщо не знаходить — позиціонується відносно viewport.',
        'Картка має стати containing block, але **не зрушити** з місця. Яке значення `position` залишає елемент у потоці без зсуву?',
        '`.card { position: relative; }`'
      ],
      tests: [
        { name: 'бейдж на 10px правіше за правий край картки', code: "const c = rect('.card'), b = rect('.badge');\nexpect(Math.abs(b.right - (c.right + 10))).toBeLessThanOrEqual(1);" },
        { name: 'бейдж на 10px вище за верхній край картки', code: "const c = rect('.card'), b = rect('.badge');\nexpect(Math.abs(b.top - (c.top - 10))).toBeLessThanOrEqual(1);" },
        { name: 'картка лишилась на місці', code: "const body = rect(document.body), c = rect('.card');\nexpect(Math.abs(c.left - body.left - 40)).toBeLessThanOrEqual(1);\nexpect(Math.round(c.width)).toBe(272);" }
      ],
      explanation: `
\`position: absolute\` позиціонує елемент відносно **containing block** — padding-box найближчого предка з \`position\`, відмінним від \`static\`. У стартовому коді такого предка немає, тож бейдж позиціонувався відносно початкового containing block (viewport) і втік у кут сторінки.

\`position: relative\` без \`top/left\` не зсуває картку і не виймає її з потоку, але робить її якорем для абсолютних нащадків.

**Нюанси:**
- offsets рахуються від **padding-box** (усередині border): якщо в картки є \`border: 2px\`, бейдж зсунеться ще на 2px;
- \`overflow: hidden\` на картці обріже бейдж, що виступає за межі, — частий баг;
- альтернатива без relative — Grid-накладання (\`grid-area: 1/1\` + \`place-self: start end\`) з від'ємним translate.

**Що можуть спитати далі:** що станеться, якщо картці дати \`transform\`? (Вона теж стане containing block — навіть без \`position\`.)
`
    },
    {
      id: 'cssadv-tooltip-position', group: "position",
      type: 'dom',
      level: 2,
      title: 'Тултіп над кнопкою',
      tags: ['position', 'absolute', 'transform'],
      description: `
**Завдання.** Розмістіть підказку \`.tooltip\` **над** кнопкою:

**Де трапляється:** тултіпи й поповери в інтерфейсах.

- нижній край тултіпа — на **8px вище** за верхній край кнопки;
- тултіп **відцентрований по горизонталі** відносно кнопки (ширина тултіпа невідома — залежить від тексту);
- тултіп не впливає на розкладку: \`.has-tip\` має бути розміром рівно з кнопку;
- текст тултіпа — в один рядок.

HTML не змінюйте.

**Як це працює:** Обгортці position: relative; тултіпу absolute з bottom: calc(100% + 8px) (над кнопкою) і left: 50% + translateX(-50%) для центрування.
`,
      html: `<div class="demo">
  <span class="has-tip">
    <button class="btn">Копіювати</button>
    <span class="tooltip" role="tooltip">Скопійовано в буфер обміну</span>
  </span>
</div>`,
      css: `.demo {
  padding: 80px 160px;
}
.has-tip {
  display: inline-flex;
}
.btn {
  padding: 8px 14px;
}
.tooltip {
  padding: 4px 8px;
  background: #111827;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.demo {
  padding: 80px 160px;
}
.has-tip {
  display: inline-flex;
  position: relative;
}
.btn {
  padding: 8px 14px;
}
.tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 4px 8px;
  background: #111827;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
}
`
      },
      hints: [
        'Тултіп має вийти з потоку (`position: absolute`), а якорем стане обгортка `.has-tip`.',
        '`bottom: 100%` ставить нижній край тултіпа на верхній край якоря; відступ — через `calc()` або `margin-bottom`. Центрування — `left: 50%` + `translateX(-50%)`.',
        'Не забудьте `white-space: nowrap`: ширина absolute-елемента shrink-to-fit обмежена місцем від `left: 50%` до краю якоря.'
      ],
      tests: [
        { name: 'тултіп на 8px над кнопкою', code: "const b = rect('.btn'), t = rect('.tooltip');\nexpect(Math.abs(t.bottom - (b.top - 8))).toBeLessThanOrEqual(1);" },
        { name: 'тултіп відцентрований відносно кнопки', code: "const b = rect('.btn'), t = rect('.tooltip');\nexpect(Math.abs((t.left + t.width / 2) - (b.left + b.width / 2))).toBeLessThanOrEqual(1);" },
        { name: 'тултіп не впливає на розкладку', code: "const h = rect('.has-tip'), b = rect('.btn');\nexpect(Math.abs(h.width - b.width)).toBeLessThanOrEqual(1);\nexpect(Math.abs(h.height - b.height)).toBeLessThanOrEqual(1);" },
        { name: 'текст тултіпа в один рядок', code: "const t = rect('.tooltip');\nexpect(t.height).toBeLessThan(30);\nexpect(t.width).toBeGreaterThan(rect('.btn').width);" }
      ],
      explanation: `
- \`.has-tip { position: relative }\` — якір (containing block) для тултіпа.
- \`position: absolute\` виймає тултіп з потоку — обгортка має розмір кнопки.
- \`bottom: calc(100% + 8px)\` — відсотки \`bottom\` рахуються від висоти containing block: нижній край тултіпа піднімається на всю висоту якоря + 8px.
- \`left: 50%; transform: translateX(-50%)\` — центрування елемента невідомої ширини.
- \`white-space: nowrap\` — без нього доступна ширина для shrink-to-fit = від \`left: 50%\` до правого краю якоря (половина кнопки), і текст ламається на кілька рядків. Альтернатива — \`width: max-content\`.

**У продакшні** тултіпи часто рендерять у портал (\`document.body\`) і позиціонують JS-бібліотеками (Floating UI), бо absolute всередині \`overflow: hidden\` обрізається, а біля краю екрана тултіп треба «перевертати». Сучасна нативна альтернатива — **CSS Anchor Positioning** (\`anchor-name\`, \`position-anchor\`, \`position-try\`) та Popover API.

**Доступність:** \`role="tooltip"\` + \`aria-describedby\` на кнопці; показувати і на \`:hover\`, і на \`:focus-visible\`; закривати по Escape.
`
    },
    {
      id: 'cssadv-quiz-containing-block', group: "position", why: ["Ні: transform у ближчого предка перехоплює роль containing block.","Так: transform робить .b containing block для absolute і fixed.","Ні: є позиціоновані предки ближче.","Ні: body не є containing block тут."],
      type: 'quiz',
      level: 3,
      title: 'Containing block для absolute: пастка з transform',
      tags: ['position', 'containing-block', 'transform'],
      question: `
Відносно якого елемента позиціонується \`.c\`?

\`\`\`html
<div class="a" style="position: relative">
  <div class="b" style="transform: translateX(0)">
    <div class="c" style="position: absolute; top: 0; left: 0"></div>
  </div>
</div>
\`\`\`
`,
      options: [
        '`.a` — найближчий предок з position ≠ static',
        '`.b` — бо має transform',
        'Viewport (initial containing block)',
        '`<body>`'
      ],
      answer: 1,
      hint: 'Не лише position робить предка containing block-ом.',
      explanation: `
Containing block для \`absolute\` — найближчий предок, який **або** позиціонований (\`position\` ≠ static), **або** має \`transform\`/\`translate\`/\`rotate\`/\`scale\` ≠ none, \`perspective\`, \`filter\`, \`backdrop-filter\`, \`contain: layout/paint\`, \`will-change\` з такими властивостями. Навіть «нульовий» \`translateX(0)\` — це не \`none\`, тож \`.b\` перехоплює.

- \`.a\` — було б правильно без transform на \`.b\`.
- Viewport — якби не було ні \`.a\`, ні transform.
- \`<body>\` за замовчуванням \`static\` і containing block-ом не є (поширена помилка).

Те саме стосується \`position: fixed\` — саме тому модалки «ламаються» всередині анімованих контейнерів.
`
    },
    {
      id: 'cssadv-fixed-overlay-modal', group: "position",
      type: 'dom',
      level: 2,
      title: 'Повноекранний оверлей з модалкою по центру',
      tags: ['position', 'fixed', 'modal'],
      description: `
**Завдання.** Сторінка довга (є прокрутка). Зробіть оверлей \`.overlay\`, який:

**Де трапляється:** модальні вікна і лоадери на весь екран.

- покриває **весь видимий viewport** (від лівого верхнього кута, на всю ширину і висоту вікна);
- лишається на місці під час **прокрутки сторінки**;
- центрує модалку \`.modal\` по горизонталі й вертикалі.

Зараз оверлей позиціонований абсолютно — після прокрутки він «їде» вгору разом зі сторінкою. HTML не змінюйте.

**Як це працює:** position: fixed; inset: 0 прив'язує оверлей до viewport, тож прокрутка його не зсуває. Модалку всередині центруємо flex/grid.
`,
      html: `<main class="content">Довгий контент сторінки…</main>
<div class="overlay">
  <div class="modal" role="dialog" aria-modal="true">Ви впевнені?</div>
</div>`,
      css: `.content {
  height: 2000px;
  background: linear-gradient(#e0f2fe, #fde68a);
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
}
.modal {
  width: 300px;
  height: 160px;
  background: #fff;
  border-radius: 12px;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.content {
  height: 2000px;
  background: linear-gradient(#e0f2fe, #fde68a);
}
.overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.6);
}
.modal {
  width: 300px;
  height: 160px;
  background: #fff;
  border-radius: 12px;
}
`
      },
      hints: [
        'Яке значення `position` прив\'язує елемент до viewport, а не до документа?',
        '`inset: 0` розтягує fixed-елемент на весь viewport. Для центрування модалки зробіть оверлей flex- або grid-контейнером.',
        '`.overlay { position: fixed; inset: 0; display: grid; place-items: center; }`'
      ],
      tests: [
        { name: 'оверлей покриває viewport', code: "window.scrollTo(0, 0);\nconst o = rect('.overlay'), de = document.documentElement;\nexpect(Math.abs(o.top)).toBeLessThanOrEqual(1);\nexpect(Math.abs(o.left)).toBeLessThanOrEqual(1);\nexpect(Math.abs(o.width - de.clientWidth)).toBeLessThanOrEqual(1);\nexpect(Math.abs(o.height - de.clientHeight)).toBeLessThanOrEqual(1);" },
        { name: 'після прокрутки оверлей на місці', code: "window.scrollTo(0, 500);\ntry {\n  expect(window.scrollY).toBeGreaterThan(0);\n  const o = rect('.overlay');\n  expect(Math.abs(o.top)).toBeLessThanOrEqual(1);\n  expect(Math.abs(o.bottom - document.documentElement.clientHeight)).toBeLessThanOrEqual(1);\n} finally { window.scrollTo(0, 0); }" },
        { name: 'модалка по центру viewport', code: "const m = rect('.modal'), de = document.documentElement;\nexpect(Math.abs(m.left + m.width / 2 - de.clientWidth / 2)).toBeLessThanOrEqual(1);\nexpect(Math.abs(m.top + m.height / 2 - de.clientHeight / 2)).toBeLessThanOrEqual(1);" },
        { name: 'розміри модалки не змінились', code: "expect(Math.round(rect('.modal').width)).toBe(300);\nexpect(Math.round(rect('.modal').height)).toBe(160);" }
      ],
      explanation: `
- \`position: fixed\` позиціонує відносно **viewport**: елемент не рухається під час прокрутки.
- \`inset: 0\` (= \`top/right/bottom/left: 0\`) розтягує його на весь viewport — без \`width: 100vw\`, яке на десктопі з видимим скролбаром дає горизонтальну прокрутку (100vw включає ширину скролбара).
- \`display: grid; place-items: center\` центрує модалку.

**Чому absolute не підходить:** absolute без позиціонованого предка прив'язаний до початкового containing block — прямокутника розміром з viewport, але **прикріпленого до початку документа**. Після прокрутки він їде разом зі сторінкою.

**Що ще потрібно справжній модалці:**
- блокування прокрутки фону (\`body { overflow: hidden }\` або \`overscroll-behavior: contain\` для самої модалки);
- \`max-height\` + \`overflow: auto\` для високого вмісту;
- фокус-пастка, закриття по Escape, повернення фокусу; \`role="dialog"\` + \`aria-modal\`.
- Сучасна альтернатива — нативний \`<dialog>\` з \`showModal()\`: top layer (без z-index-воєн), \`::backdrop\`, Escape і фокус «з коробки».

**Пастка:** якщо будь-який предок оверлея має \`transform\`/\`filter\`, \`fixed\` перетвориться на «absolute» відносно цього предка.
`
    },
    {
      id: 'cssadv-fixed-transform-trap', group: "position",
      type: 'dom',
      level: 3,
      title: 'fixed не на весь екран: пастка з transform',
      tags: ['position', 'fixed', 'transform', 'containing-block'],
      description: `
**Завдання.** Оверлей \`.overlay\` має \`position: fixed; inset: 0\`, але чомусь покриває лише картку, а не весь viewport.

**Де трапляється:** модалка всередині анімованого контейнера — частий баг.

Знайдіть причину і виправте, щоб:
- оверлей покривав **весь viewport**;
- картка лишилась візуально **на тому самому місці** (зараз вона зсунута на 20px праворуч від своєї позиції в потоці).

HTML не змінюйте.

**Як це працює:** Предок з transform (або filter, will-change: transform) стає containing block для fixed-нащадків — fixed рахується від нього, а не від вікна. Прибрати transform з предка.
`,
      html: `<div class="card">
  <p>Картка, яку зсунули через transform.</p>
  <div class="overlay">Повноекранний оверлей</div>
</div>`,
      css: `.card {
  width: 300px;
  margin: 40px;
  padding: 16px;
  background: #f1f5f9;
  transform: translateX(20px);
}
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  color: #fff;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.card {
  width: 300px;
  margin: 40px;
  padding: 16px;
  background: #f1f5f9;
  position: relative;
  left: 20px;
}
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  color: #fff;
}
`
      },
      hints: [
        'Подивіться на властивості предка оверлея. Які з них змінюють containing block для fixed-елементів?',
        '`transform` (і навіть окремі `translate`/`rotate`/`scale`) на предку робить його containing block для fixed-нащадків. Його треба прибрати.',
        'Зсунути картку на 20px можна без transform: `position: relative; left: 20px` або збільшити `margin-left`.'
      ],
      tests: [
        { name: 'оверлей покриває весь viewport', code: "const o = rect('.overlay'), de = document.documentElement;\nexpect(Math.abs(o.top)).toBeLessThanOrEqual(1);\nexpect(Math.abs(o.left)).toBeLessThanOrEqual(1);\nexpect(Math.abs(o.width - de.clientWidth)).toBeLessThanOrEqual(1);\nexpect(Math.abs(o.height - de.clientHeight)).toBeLessThanOrEqual(1);" },
        { name: 'картка на тому самому місці', code: "const body = rect(document.body), c = rect('.card');\nexpect(Math.abs(c.left - body.left - 60)).toBeLessThanOrEqual(1);\nexpect(Math.round(c.width)).toBe(332);" },
        { name: 'у картки немає transform', code: "expect(css('.card', 'transform')).toBe('none');\nexpect(css('.card', 'translate')).toBe('none');" }
      ],
      explanation: `
**Причина:** за специфікацією елемент з \`transform\` ≠ none (а також \`translate\`, \`rotate\`, \`scale\`, \`perspective\`, \`filter\`, \`backdrop-filter\`, \`contain: paint\`, \`will-change: transform\`) стає **containing block для fixed- і absolute-нащадків**. Тому \`inset: 0\` рахувався від картки.

**Рішення:** прибрати transform з предка і зсунути картку іншим способом — \`position: relative; left: 20px\` (не впливає на сусідів, як і transform) або \`margin-left: 60px\`.

**Де це трапляється в реальних проєктах:**
- модалка всередині анімованого контейнера (\`transform\` у keyframes появи) або слайдера;
- \`will-change: transform\` «для продуктивності» на обгортці сторінки;
- \`filter: blur()\` на батьку.

**Як розв'язують у фреймворках:** рендерять модалки/тултіпи через **портал** у \`document.body\` (React \`createPortal\`, Vue \`<Teleport>\`), або використовують \`<dialog>\`/Popover API — елементи в top layer не залежать від предків.

**Що можуть спитати далі:** які ще наслідки має transform (stacking context, новий шар компоновки)? Чому \`translate: 20px\` теж не допоможе?
`
    },
    {
      id: 'cssadv-quiz-sticky-broken', group: "position", why: ["Так: без порогу sticky не знає, де прилипати.","Ні: z-index впливає на накладання, не на прилипання.","Так: overflow у предка стає контейнером прокрутки.","Ні: position: relative у батька не заважає.","Так: sticky рухається лише в межах батька."],
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Чому position: sticky не працює?',
      tags: ['position', 'sticky'],
      question: 'Оберіть **усі** причини, через які `position: sticky` може не прилипати:',
      options: [
        'Не задано жодного з `top` / `bottom` / `left` / `right`',
        'Sticky-елементу задано `z-index`',
        'Один із предків між елементом і вікном має `overflow: hidden` або `auto`',
        'У батьківського елемента `position: relative`',
        'Батько не вищий за сам sticky-елемент (немає куди «їхати»)'
      ],
      answer: [0, 2, 4],
      hint: 'Sticky потребує порогу, scroll-контейнера, що реально прокручується, і місця в батьку.',
      explanation: `
- **Немає порогу** — без \`top: 0\` (або іншого offset) sticky поводиться як relative.
- **\`overflow\` у предка** — будь-яке значення, крім \`visible\`/\`clip\`, робить предка scroll-контейнером. Sticky прилипає саме до **найближчого** scroll-контейнера; якщо той не прокручується (\`overflow: hidden\`), прилипання не видно. Рішення — \`overflow: clip\` (обрізає, але не створює scroll-контейнер) або прибрати overflow.
- **Батько завнизький** — sticky обмежений межами батька: якщо батько такої ж висоти, як елемент, йому немає де прилипати. Типово: sticky-сайдбар у flex-ряду з \`align-items: stretch\` — сайдбар розтягнутий на всю висоту; лікується \`align-self: flex-start\`.

Неправильні:
- \`z-index\` на sticky лише впливає на накладання (зазвичай його навпаки додають, щоб контент проходив **під** заголовком).
- \`position: relative\` батька ніяк не заважає sticky.
`
    },
    {
      id: 'cssadv-sticky-header-scroll', group: "position",
      type: 'dom',
      level: 3,
      title: 'Sticky-заголовок не прилипає: знайдіть причину',
      tags: ['position', 'sticky', 'overflow'],
      description: `
**Завдання.** У списку контактів заголовок \`.header\` має \`position: sticky; top: 0\`, але при прокрутці \`.scroller\` він їде вгору разом із рядками.

**Де трапляється:** прилипаючі заголовки в списках і таблицях.

Виправте так, щоб заголовок прилипав до верху \`.scroller\` під час прокрутки. При цьому **заокруглені кути \`.inner\` мають і далі обрізати вміст** (дизайнер на цьому наполягає). HTML не змінюйте.

**Як це працює:** sticky прилипає в межах найближчого прокручуваного предка. overflow: hidden у проміжного предка «перехоплює» прокрутку — заміна на overflow: clip або видалення повертає прилипання.
`,
      html: `<div class="scroller">
  <div class="inner">
    <div class="header">Контакти</div>
    <div class="row">Андрій</div>
    <div class="row">Богдана</div>
    <div class="row">Василь</div>
    <div class="row">Галина</div>
    <div class="row">Дмитро</div>
    <div class="row">Євгенія</div>
    <div class="row">Жанна</div>
    <div class="row">Зіновій</div>
    <div class="row">Ірина</div>
    <div class="row">Кирило</div>
    <div class="row">Леся</div>
    <div class="row">Максим</div>
  </div>
</div>`,
      css: `.scroller {
  width: 300px;
  height: 240px;
  overflow-y: auto;
  border: 1px solid #cbd5e1;
}
.inner {
  overflow: hidden;
  border-radius: 12px;
}
.header {
  position: sticky;
  top: 0;
  height: 40px;
  line-height: 40px;
  padding: 0 12px;
  background: #1e293b;
  color: #fff;
}
.row {
  height: 40px;
  line-height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid #e2e8f0;
  box-sizing: border-box;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.scroller {
  width: 300px;
  height: 240px;
  overflow-y: auto;
  border: 1px solid #cbd5e1;
}
.inner {
  overflow: clip;
  border-radius: 12px;
}
.header {
  position: sticky;
  top: 0;
  height: 40px;
  line-height: 40px;
  padding: 0 12px;
  background: #1e293b;
  color: #fff;
}
.row {
  height: 40px;
  line-height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid #e2e8f0;
  box-sizing: border-box;
}
`
      },
      hints: [
        'Sticky прилипає до **найближчого scroll-контейнера**. Хто він для `.header`?',
        '`overflow: hidden` робить `.inner` scroll-контейнером (хоч він і не прокручується), тож заголовок «прилипає» до нього, а не до `.scroller`.',
        'Значення `overflow: clip` обрізає вміст так само, але **не** створює scroll-контейнер.'
      ],
      tests: [
        { name: 'спочатку заголовок угорі', code: "const s = $('.scroller');\ns.scrollTop = 0;\nexpect(Math.abs(rect('.header').top - (rect(s).top + s.clientTop))).toBeLessThanOrEqual(1);" },
        { name: 'після прокрутки на 200px заголовок прилип', code: "const s = $('.scroller');\ns.scrollTop = 200;\ntry {\n  expect(s.scrollTop).toBeGreaterThan(150);\n  expect(Math.abs(rect('.header').top - (rect(s).top + s.clientTop))).toBeLessThanOrEqual(1);\n  expect(rect($$('.row')[0]).top).toBeLessThan(rect(s).top);\n} finally { s.scrollTop = 0; }" },
        { name: 'рядки прокручуються під заголовком', code: "const s = $('.scroller');\ns.scrollTop = 120;\ntry {\n  const h = rect('.header');\n  const el = document.elementFromPoint(h.left + 20, h.top + h.height / 2);\n  expect($('.header').contains(el)).toBe(true);\n} finally { s.scrollTop = 0; }" },
        { name: 'вміст .inner і далі обрізається', code: "expect(['hidden', 'clip']).toContain(css('.inner', 'overflow-x'));\nexpect(css('.inner', 'border-top-left-radius')).toBe('12px');" }
      ],
      explanation: `
**Причина:** будь-яке значення \`overflow\`, крім \`visible\` і \`clip\` (тобто \`hidden\`, \`auto\`, \`scroll\`), робить елемент **scroll-контейнером** — навіть якщо прокрутки немає. Sticky-елемент прилипає до найближчого scroll-контейнера; тут це \`.inner\`, який сам не прокручується (його прокручує \`.scroller\`), тож ефекту немає.

**Рішення:** \`overflow: clip\` — обрізає вміст за межами бокса (з урахуванням \`border-radius\`), але **не** створює scroll-контейнер і не дозволяє програмну прокрутку. Тому sticky «бачить» \`.scroller\`. Підтримка — усі сучасні браузери з 2022 року.

**Інші варіанти:** прибрати overflow і заокруглити сам \`.scroller\`; перенести sticky на рівень, де немає проміжних overflow-предків.

**Чеклист «sticky не працює»:**
1. задано \`top\`/\`bottom\`;
2. немає проміжного предка з \`overflow: hidden/auto\`;
3. батько вищий за sticky-елемент;
4. у flex-контейнері — \`align-self: flex-start\` для sticky-сайдбару.

**Що можуть спитати далі:** як зробити липкий заголовок таблиці (\`th { position: sticky; top: 0 }\`)? Чому \`overflow: hidden\` на \`body\` ламає sticky на всій сторінці?
`
    },

    // ---------------------------------------------------------------- z-index і stacking context
    {
      id: 'cssadv-stacking-context-theory', group: "stacking", why: ["Так: дитина не вийде за межі контексту батька.","Ні: z-index працює і для flex/grid-елементів без position.","Так: opacity < 1 і transform створюють контекст.","Ні: потрібен z-index на рівні контексту шапки, а не дропдауна.","Так: isolation: isolate — чистий спосіб створити контекст."],
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Stacking context і z-index',
      tags: ['z-index', 'stacking-context'],
      question: 'Що таке stacking context (контекст накладання)? Що його створює і чому z-index: 9999 іноді «не працює»? Оберіть **усі** правильні твердження.',
      choices: [
        '`z-index` дитини порівнюється лише всередині її контексту, тож `9999` не підніме її вище за контекст батька',
        '`z-index` діє лише на елементи з `position`, тому flex-елемент без position завжди його ігнорує',
        '`opacity: 0.99` чи `transform` на предку створюють новий stacking context навіть без `z-index`',
        'Щоб дропдаун у шапці перекрив сусідню секцію, достатньо дати самому дропдауну більший `z-index`',
        '`isolation: isolate` створює контекст накладання без жодних інших візуальних побічних ефектів'
      ],
      correct: [0, 2, 4],
      hint: 'z-index — не глобальна величина. Порівнюйте з вкладеною нумерацією розділів книги: 1.9999 < 2.1.',
      answer: `
**Stacking context** — група елементів, яка накладається на інші як **одне ціле**. Усередині контексту діти впорядковуються за своїми \`z-index\`, але назовні весь контекст має лише один рівень — рівень свого кореня.

Аналогія: z-index — це нумерація розділів. Елемент \`z-index: 9999\` усередині батька з \`z-index: 1\` — це «розділ 1.9999», який завжди нижче за «розділ 2».

**Що створює stacking context:**
- кореневий елемент \`<html>\`;
- \`position: relative/absolute\` + \`z-index\` ≠ auto;
- \`position: fixed\` або \`sticky\` (завжди);
- flex- або grid-**елемент** з \`z-index\` ≠ auto (навіть без position);
- \`opacity\` < 1;
- \`transform\`, \`translate/rotate/scale\`, \`perspective\`, \`filter\`, \`backdrop-filter\`, \`clip-path\`, \`mask\`;
- \`mix-blend-mode\` ≠ normal;
- \`isolation: isolate\` — спеціально, щоб створити контекст без побічних ефектів;
- \`will-change\` з будь-якою з цих властивостей;
- \`contain: layout/paint\`, \`container-type: size/inline-size\`, елементи top layer (\`<dialog>\`, popover).

**Порядок малювання всередині контексту (знизу вгору):**
1. фон і рамка кореня контексту;
2. діти з від'ємним \`z-index\`;
3. звичайні блоки в потоці;
4. float-и;
5. inline-вміст;
6. позиціоновані з \`z-index: auto/0\` (і контексти без z-index, як-от opacity/transform) — у порядку DOM;
7. позиціоновані з додатним \`z-index\`.

**Типовий баг:**
\`\`\`css
.header   { position: relative; z-index: 1; }
.dropdown { position: absolute; z-index: 9999; }  /* усередині header */
.hero     { position: relative; z-index: 2; }     /* перекриє dropdown! */
\`\`\`
Рішення — підняти **контекст** (\`.header { z-index: 3 }\`), а не дитину; або винести дропдаун у портал / top layer.

**Практика:** заведіть шкалу z-index у токенах (\`--z-dropdown: 100; --z-modal: 1000\`), використовуйте \`isolation: isolate\` для компонентів, щоб їхні внутрішні z-index не протікали назовні.
`,
      keyPoints: [
        'Stacking context накладається як одне ціле; z-index порівнюється лише між сусідами в одному контексті',
        'Створюють: position + z-index, fixed/sticky, opacity < 1, transform, filter, isolation, flex/grid-елемент з z-index',
        'Дочірній z-index не може «вистрибнути» вище за рівень батьківського контексту',
        'Порядок малювання: фон → від\'ємні → блоки → float → inline → z-index auto/0 → додатні',
        'Рішення багів: піднімати контекст, isolation: isolate, портали/top layer, шкала z-index'
      ],
      followUps: [
        'Чим відрізняється z-index: auto від z-index: 0?',
        'Навіщо isolation: isolate, якщо є z-index?',
        'Як <dialog> і popover уникають z-index-воєн (top layer)?'
      ]
    },
    {
      id: 'cssadv-quiz-zindex-parent', group: "stacking", why: ["Ні: z-index дитини діє лише в контексті батька.","Ні: порядок DOM вирішує лише за рівних z-index у одному контексті.","Так: контекст батька нижчий за .sibling — усе всередині під ним.","Ні: поведінка визначена специфікацією."],
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'z-index: 9999 проти батьківського контексту',
      tags: ['z-index', 'stacking-context'],
      question: `
\`.child\` і \`.sibling\` перекриваються. Хто буде зверху?

\`\`\`html
<div class="parent" style="position: relative; z-index: 1">
  <div class="child" style="position: absolute; z-index: 9999">Child</div>
</div>
<div class="sibling" style="position: relative; z-index: 2">Sibling</div>
\`\`\`
`,
      options: [
        '`.child` — у нього найбільший z-index',
        'Той, хто пізніше в DOM, — `.child`',
        '`.sibling`',
        'Залежить від браузера'
      ],
      answer: 2,
      hint: 'Чи може дитина піднятися вище за рівень свого батька, якщо батько створив stacking context?',
      explanation: `
\`.parent\` має \`position: relative\` + \`z-index: 1\` → створює stacking context. Усе всередині нього (включно з \`.child\` і його 9999) назовні накладається як одне ціле **на рівні 1**. \`.sibling\` має рівень 2 у тому самому (кореневому) контексті → **2 > 1**, \`.sibling\` зверху.

- «Найбільший z-index» — 9999 порівнюється лише з іншими дітьми \`.parent\`.
- Порядок DOM вирішує лише за **рівних** рівнів (і \`.sibling\`, до речі, пізніше в DOM).
- Поведінка стандартизована.

Виправлення, якщо дитина має бути зверху: прибрати \`z-index\` у \`.parent\` (тоді він не створює контекст і 9999 порівнюється з 2) або підняти \`.parent\` до \`z-index: 3\`.
`
    },
    {
      id: 'cssadv-quiz-what-creates-sc', group: "stacking", why: ["Так: opacity < 1.","Ні: без z-index відносне позиціонування контексту не створює.","Так: будь-який transform.","Так: створено саме для цього.","Ні: сам flex-контейнер контекст не створює.","Так: flex-елемент з z-index створює контекст навіть без position."],
      type: 'quiz',
      level: 3,
      title: 'Що створює stacking context?',
      tags: ['stacking-context'],
      question: 'Оберіть **усі** оголошення, які створюють новий stacking context:',
      options: [
        '`opacity: 0.99`',
        '`position: relative` (без z-index)',
        '`transform: translateZ(0)`',
        '`isolation: isolate`',
        '`display: flex` на контейнері',
        '`z-index: 1` на flex-елементі без position'
      ],
      answer: [0, 2, 3, 5],
      hint: 'Сам по собі position: relative контекст не створює. А z-index працює не лише з position.',
      explanation: `
Створюють контекст:
- \`opacity\` < 1 — навіть 0.99;
- будь-який \`transform\` ≠ none (тому «хак» \`translateZ(0)\` для GPU-шару має побічні ефекти);
- \`isolation: isolate\` — його єдине призначення;
- \`z-index\` ≠ auto на **flex- чи grid-елементі** — працює навіть без \`position\`.

Не створюють:
- \`position: relative\` без \`z-index\` (з \`z-index: auto\`) — елемент малюється в шарі позиціонованих, але дітей не «ізолює»;
- \`display: flex\` на контейнері — це лише модель розкладки; створюють контекст його **діти** з z-index.

Також створюють: \`position: fixed/sticky\`, \`filter\`, \`backdrop-filter\`, \`clip-path\`, \`mask\`, \`mix-blend-mode\`, \`perspective\`, \`will-change\` з цими властивостями, \`contain: paint\`.
`
    },
    {
      id: 'cssadv-quiz-opacity-zindex', group: "stacking", why: ["Ні: .a з opacity — окремий контекст рівня 0.","Ні: opacity не піднімає, а ізолює.","Ні: перекриття визначене z-порядком.","Так: контекст .a нижче за .b з z-index 1."],
      type: 'quiz',
      level: 3,
      title: 'z-index-пазл з opacity',
      tags: ['z-index', 'stacking-context', 'opacity'],
      question: `
\`.a-child\` і \`.b\` перекриваються. Хто зверху?

\`\`\`html
<div class="a" style="opacity: 0.9">               <!-- не позиціонований -->
  <div class="a-child" style="position: relative; z-index: 10">A</div>
</div>
<div class="b" style="position: relative; z-index: 1">B</div>
\`\`\`
`,
      options: [
        '`.a-child` — z-index 10 більший за 1',
        '`.a-child` — opacity піднімає елемент над іншими',
        'Елементи напівпрозоро змішаються, жоден не зверху',
        '`.b`'
      ],
      answer: 3,
      hint: '`opacity < 1` створює stacking context. На якому рівні малюється такий контекст, якщо z-index не задано?',
      explanation: `
\`opacity: 0.9\` перетворює \`.a\` на корінь stacking context. Контекст без z-index малюється в кореневому контексті **так, ніби в нього \`z-index: 0\`** (шар позиціонованих з auto/0). Його \`z-index: 10\` усередині нічого не важить назовні.

У кореневому контексті порівнюються: \`.a\` (рівень 0) та \`.b\` (рівень 1) → **\`.b\` зверху**.

- «10 > 1» — порівняння некоректне, бо елементи в різних контекстах.
- opacity нічого не «піднімає» — навпаки, вона замикає дітей у контексті рівня 0.
- Напівпрозорість впливає на колір, а не на порядок накладання.

Такий баг часто з'являється, коли до блоку додають анімацію \`opacity\` чи \`transform\` — і випадаюче меню всередині раптом ховається під сусідами.
`
    },
    {
      id: 'cssadv-quiz-negative-zindex', group: "stacking", why: ["Ні: від'ємний z-index малює дитину під фоном батька.","Так: батько без контексту — дитина опускається під його фон.","Ні: елемент видно, якщо його не перекрито.","Ні: absolute не гарантує верхній шар."],
      type: 'quiz',
      level: 4,
      title: 'Від\'ємний z-index і фон батька',
      tags: ['z-index', 'stacking-context', 'paint-order'],
      question: `
Що буде видно там, де \`.child\` перекриває \`.parent\`?

\`\`\`css
.parent { position: relative; background: yellow; }          /* без z-index */
.child  { position: absolute; inset: 0; z-index: -1; background: red; }
\`\`\`
`,
      options: [
        'Червоний фон `.child` — він же нащадок і малюється пізніше',
        'Жовтий фон `.parent` — `.child` опиниться під ним',
        'Нічого: елементи з від\'ємним z-index не відображаються',
        'Червоний, бо absolute завжди вище за потік'
      ],
      answer: 1,
      hint: '`.parent` без z-index не створює stacking context. До якого контексту тоді належить `.child`?',
      explanation: `
\`.parent\` має \`z-index: auto\` → **не** створює stacking context. \`.child\` з \`z-index: -1\` належить найближчому предковому контексту (тут — кореневому) і малюється в його шарі від'ємних z-index, тобто **під** усіма блоками в потоці, включно з фоном \`.parent\`. Видно жовтий.

Якщо дати \`.parent { z-index: 0 }\` або \`isolation: isolate\`, батько стане коренем контексту: фон кореня малюється **найпершим**, потім діти з від'ємним z-index → червоний буде над жовтим фоном, але під текстом \`.parent\`.

**Практичне застосування:** декоративні підкладки через \`::before { z-index: -1 }\` — без \`isolation: isolate\` на батьку вони «провалюються» під фон сторінки.

- «Нащадок малюється пізніше» — правильно лише в межах одного шару порядку малювання.
- Від'ємний z-index цілком відображається, просто низько.
- absolute з від'ємним z-index малюється раніше за потік.
`
    },
    {
      id: 'cssadv-zindex-stacking-bug', group: "stacking",
      type: 'dom',
      level: 3,
      title: 'Дропдаун ховається під банером (stacking context)',
      tags: ['z-index', 'stacking-context', 'debugging'],
      description: `
**Завдання.** Випадаюче меню \`.dropdown\` (\`z-index: 9999\`) має відкриватися під шапкою **поверх** банера \`.hero\`, але воно ховається під банером.

**Де трапляється:** дропдауни й меню, що ховаються під банерами.

Виправте баг. Обмеження:
- **не змінюйте** стилі \`.hero\` (його \`position: relative; z-index: 2\` потрібні для іншої частини сайту);
- меню має лишитися на тому самому місці: одразу під шапкою, з відступом 16px від її лівого краю.

Тест перевірить через \`document.elementFromPoint\`, хто реально зверху.

**Як це працює:** z-index порівнюється лише в межах одного stacking context. Якщо батько дропдауна створює власний контекст нижчий за банер — дропдаун не вилізе. Треба підняти контекст батька (z-index) або прибрати зайвий.
`,
      html: `<header class="header">
  <span>Меню ▾</span>
  <ul class="dropdown">
    <li>Профіль</li>
    <li>Налаштування</li>
    <li>Вийти</li>
  </ul>
</header>
<section class="hero">Hero-банер</section>`,
      css: `.header {
  height: 50px;
  padding: 0 16px;
  line-height: 50px;
  background: #1e293b;
  color: #fff;
  transform: translateZ(0); /* «для продуктивності» */
}
.dropdown {
  position: absolute;
  top: 50px;
  left: 16px;
  z-index: 9999;
  width: 180px;
  margin: 0;
  padding: 8px 0;
  list-style: none;
  line-height: 32px;
  background: #fff;
  color: #111827;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
.dropdown li {
  padding: 0 12px;
}
.hero {
  position: relative;
  z-index: 2;
  height: 300px;
  padding: 16px;
  background: #6366f1;
  color: #fff;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.header {
  position: relative;
  z-index: 3;
  height: 50px;
  padding: 0 16px;
  line-height: 50px;
  background: #1e293b;
  color: #fff;
}
.dropdown {
  position: absolute;
  top: 50px;
  left: 16px;
  z-index: 9999;
  width: 180px;
  margin: 0;
  padding: 8px 0;
  list-style: none;
  line-height: 32px;
  background: #fff;
  color: #111827;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
.dropdown li {
  padding: 0 12px;
}
.hero {
  position: relative;
  z-index: 2;
  height: 300px;
  padding: 16px;
  background: #6366f1;
  color: #fff;
}
`
      },
      hints: [
        '`z-index: 9999` порівнюється лише всередині stacking context. Хто створює контекст для `.dropdown`?',
        '`transform` на `.header` створює stacking context рівня 0 у кореневому контексті, а `.hero` має рівень 2. Треба, щоб контекст шапки був вище за 2 (або щоб його не було).',
        'Наприклад: `.header { position: relative; z-index: 3; }` (transform можна прибрати — `position: relative` збереже якір для меню).'
      ],
      tests: [
        { name: 'меню одразу під шапкою, з відступом 16px', code: "const h = rect('.header'), d = rect('.dropdown');\nexpect(Math.abs(d.top - h.bottom)).toBeLessThanOrEqual(1);\nexpect(Math.abs(d.left - h.left - 16)).toBeLessThanOrEqual(1);" },
        { name: 'меню реально зверху над банером', code: "const d = rect('.dropdown');\nexpect(d.bottom).toBeGreaterThan(rect('.hero').top + 20);\nconst el = document.elementFromPoint(d.left + d.width / 2, d.top + d.height / 2);\nexpect($('.dropdown').contains(el)).toBe(true);" },
        { name: 'стилі .hero не змінено', code: "expect(css('.hero', 'position')).toBe('relative');\nexpect(css('.hero', 'z-index')).toBe('2');" },
        { name: 'поза меню банер і далі видно', code: "const hr = rect('.hero');\nconst el = document.elementFromPoint(hr.left + 500, hr.top + 150);\nexpect(el).toBe($('.hero'));" }
      ],
      explanation: `
**Діагностика:** \`transform\` на \`.header\` створює **stacking context** (і заодно containing block для \`.dropdown\`). Контекст без z-index малюється на рівні 0 кореневого контексту. \`.hero\` — на рівні 2. Тож увесь header разом із меню (його 9999 діє лише всередині header) опиняється під банером.

**Рішення (будь-яке з):**
1. \`.header { position: relative; z-index: 3 }\` — підняти **контекст**, а не дитину (наше еталонне рішення, \`transform\` прибрано як непотрібний);
2. прибрати \`transform\` і дати \`.header { position: relative }\` без z-index — тоді header не створює контекст, і 9999 меню порівнюється напряму з 2 банера;
3. винести меню в портал (кінець \`body\`) або використати Popover API (\`popover\` + top layer).

**Як дебажити в DevTools:** панель **Layers** (3D View) показує контексти й шари; у Computed видно, які властивості створюють контекст. Chrome DevTools також підсвічує, чому \`z-index\` «не має ефекту».

**Профілактика:** шкала z-index у змінних (\`--z-header: 100; --z-dropdown: 200; --z-modal: 1000\`), \`isolation: isolate\` для компонентів, обережність з \`transform\`/\`opacity\`/\`filter\` на обгортках.
`
    },

    // ---------------------------------------------------------------- BFC і float
    {
      id: 'cssadv-bfc-theory', group: "bfc", why: ["Так: BFC містить float-нащадків.","Ні: clearfix не створює BFC, лише очищує float.","Так: flow-root — чистий спосіб без обрізання.","Ні: BFC-блок не обтікає float, а стає поруч.","Ні: BFC створюють flow-root, flex/grid-елементи, inline-block тощо."],
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Block Formatting Context (BFC)',
      tags: ['bfc', 'float', 'margin-collapse'],
      question: 'Що таке Block Formatting Context? Що його створює і які практичні задачі він розв\'язує? Оберіть **усі** правильні твердження.',
      choices: [
        'BFC-контейнер враховує висоту float-нащадків, тож батько не «схлопується» до нуля',
        'Clearfix через `::after` з `clear: both` створює BFC, тому теж зупиняє схлопування margin',
        '`display: flow-root` створює BFC без побічних ефектів на кшталт обрізання тіней',
        'BFC-блок поруч із float обтікає його, як звичайний текст, і частково заходить під нього',
        'BFC створює лише `overflow: hidden`, а решта способів тільки імітує його поведінку'
      ],
      correct: [0, 2],
      hint: 'Три класичні задачі: float-и, схлопування margin, обтікання.',
      answer: `
**BFC (блоковий контекст форматування)** — ізольована область, у якій блоки розкладаються вертикально за правилами block-потоку, і яка **не взаємодіє** з float-ами та margin-ами зовні.

**Що створює BFC:**
- \`display: flow-root\` — сучасний спосіб «без побічних ефектів»;
- \`overflow\` ≠ \`visible\`/\`clip\` (\`hidden\`, \`auto\`, \`scroll\`);
- \`float\` ≠ none; \`position: absolute/fixed\`;
- \`display: inline-block\`, \`table-cell\`, \`table-caption\`;
- flex- та grid-**елементи** (самі flex/grid-контейнери створюють свій flex/grid formatting context, який теж ізолює);
- \`contain: layout/content/paint\`, multicol (\`column-count\`).

**Що дає BFC:**

1. **Містить float-и:** висота BFC-контейнера враховує float-нащадків — батько не «схлопується».
\`\`\`css
.gallery { display: flow-root; }  /* замість clearfix */
\`\`\`
2. **Блокує схлопування margin** між батьком і дітьми: margin дитини не «протікає» назовні батька.
3. **Не перекривається з float-ами:** BFC-блок поруч із float стає поруч, а не під ним (текст не обтікає, а утворює колонку):
\`\`\`css
.media-img  { float: left; width: 80px; }
.media-body { display: flow-root; }  /* колонка праворуч від картинки */
\`\`\`

**Нюанси:**
- \`overflow: hidden\` — найстаріший спосіб, але обрізає тіні, тултіпи, дропдауни;
- clearfix (\`::after { content: ""; display: table; clear: both }\`) містить float-и, але BFC **не** створює (margin усе ще схлопуються);
- сьогодні більшість задач розв'язують flex/grid, але BFC питають, бо він пояснює «дивну» поведінку float, margin і overflow.
`,
      keyPoints: [
        'BFC — ізольована область block-розкладки',
        'Створюють: display: flow-root, overflow ≠ visible, float, absolute/fixed, inline-block, flex/grid-елементи',
        'Містить float-и (батько не схлопується)',
        'Запобігає схлопуванню margin батька з дітьми',
        'BFC-блок не перекривається з сусіднім float'
      ],
      followUps: [
        'Чим display: flow-root кращий за overflow: hidden?',
        'Чи схлопуються margin у flex-контейнері?',
        'Чим clearfix відрізняється від створення BFC?'
      ]
    },
    {
      id: 'cssadv-flow-root-floats', group: "bfc",
      type: 'dom',
      level: 2,
      title: 'Батько схлопнувся: містити float-и',
      tags: ['bfc', 'float', 'flow-root'],
      description: `
**Завдання.** Мініатюри в \`.gallery\` зроблені через \`float: left\`. Через це контейнер **схлопнувся**: його рамка й фон не охоплюють мініатюр, а абзац \`.after\` налазить на них.

**Де трапляється:** легасі-верстка на float, обтікання картинок текстом.

Виправте так, щоб:
- \`.gallery\` охоплював float-и (висота визначається вмістом — тест збільшить мініатюри);
- \`.after\` починався нижче галереї;
- **без** \`overflow\` (у мініатюр будуть тіні й тултіпи, які не можна обрізати), без нових HTML-елементів і без фіксованої висоти;
- мініатюри лишаються float-ами.

**Як це працює:** Float-елементи не входять у висоту батька. display: flow-root створює новий BFC, і батько знову враховує float-нащадків.
`,
      html: `<div class="gallery">
  <div class="thumb"></div>
  <div class="thumb"></div>
  <div class="thumb"></div>
</div>
<p class="after">Текст після галереї.</p>`,
      css: `.gallery {
  padding: 8px;
  border: 2px solid #64748b;
  background: #f8fafc;
}
.thumb {
  float: left;
  width: 100px;
  height: 100px;
  margin-right: 10px;
  background: #fda4af;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.gallery {
  display: flow-root;
  padding: 8px;
  border: 2px solid #64748b;
  background: #f8fafc;
}
.thumb {
  float: left;
  width: 100px;
  height: 100px;
  margin-right: 10px;
  background: #fda4af;
}
`
      },
      hints: [
        'Float-и не впливають на висоту звичайного батька. Батько має стати новим блоковим контекстом форматування (BFC).',
        'Є значення `display`, яке створює BFC без жодних побічних ефектів.',
        '`.gallery { display: flow-root; }` (або класичний clearfix через `::after`).'
      ],
      tests: [
        { name: 'галерея охоплює мініатюри', code: "const g = rect('.gallery'), t = rect('.thumb');\nexpect(Math.abs(g.bottom - (t.bottom + 10))).toBeLessThanOrEqual(1);" },
        { name: 'абзац нижче галереї', code: "expect(rect('.after').top).toBeGreaterThanOrEqual(rect('.gallery').bottom - 1);" },
        { name: 'висота підлаштовується під вміст', code: "const ts = $$('.thumb');\nts.forEach(t => t.style.height = '150px');\ntry {\n  expect(Math.abs(rect('.gallery').bottom - (rect(ts[0]).bottom + 10))).toBeLessThanOrEqual(1);\n} finally { ts.forEach(t => t.style.height = ''); }" },
        { name: 'без overflow, мініатюри — float', code: "expect(css('.gallery', 'overflow')).toBe('visible');\nexpect(css('.thumb', 'float')).toBe('left');" }
      ],
      explanation: `
**Чому схлопується:** float-и виймаються з нормального потоку, тож висота батька в block-потоці їх не враховує. Висота \`.gallery\` = лише padding + border.

**\`display: flow-root\`** створює новий BFC, а BFC за специфікацією включає float-нащадків у свою висоту. Жодних побічних ефектів — це саме те, для чого його додали в CSS.

**Альтернативи:**
- **clearfix** (класика з епохи float-верстки):
\`\`\`css
.gallery::after { content: ""; display: table; clear: both; }
\`\`\`
псевдоелемент із \`clear: both\` опускається нижче float-ів і «розпирає» батька;
- \`overflow: hidden/auto\` — теж створює BFC, але обрізає тіні/дропдауни або може показати скролбар;
- \`float\` на самому батьку, \`display: inline-block\` — ламають ширину й потік;
- найкраще в новому коді — взагалі не використовувати float для розкладки (flex/grid). Float лишається для **обтікання тексту** навколо зображень.

**Що можуть спитати далі:** що робить \`clear: both\`? Як BFC допомагає з margin collapse?
`
    },
    {
      id: 'cssadv-quiz-clearfix', group: "bfc", why: ["Ні: це робить display: flow-root.","Ні: float у дітей лишається.","Так: псевдоелемент з clear: both стоїть під float-ами.","Ні: нічого не обрізається."],
      type: 'quiz',
      level: 1,
      title: 'Як працює clearfix',
      tags: ['float', 'clearfix'],
      question: `
Що саме робить класичний clearfix?

\`\`\`css
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}
\`\`\`
`,
      options: [
        'Створює для контейнера новий BFC',
        'Прибирає float у дочірніх елементів',
        'Додає в кінець контейнера порожній блок, який через `clear: both` опускається нижче всіх float-ів і цим розтягує висоту батька',
        'Обрізає float-и, що виходять за межі контейнера'
      ],
      answer: 2,
      hint: 'Подивіться, що означає clear для елемента в потоці.',
      explanation: `
\`::after\` додає останнього нащадка в потоці. \`clear: both\` змушує його стати **нижче** за всі попередні float-и (ліві й праві). Оскільки це звичайний блок у потоці, батько мусить розтягнутися, щоб його вмістити, — і тим самим охоплює float-и. \`content: ""\` потрібен, щоб псевдоелемент взагалі згенерувався; \`display: table\` — традиція «micro clearfix» (там ще й \`::before { display: table }\` не дає верхньому margin першої дитини схлопнутися з батьком).

- BFC clearfix **не** створює: margin дітей усе ще можуть схлопуватися з батьком, сусідні float-и ззовні все ще впливають. BFC створює \`display: flow-root\`.
- Float у дітей лишається.
- Нічого не обрізається — обрізання робить \`overflow: hidden\`.

Сьогодні замість clearfix — \`display: flow-root\`, а для розкладки — flex/grid.
`
    },
    {
      id: 'cssadv-quiz-margin-collapse', group: "bfc", why: ["Так: новий BFC зупиняє протікання.","Ні: relative не впливає на схлопування.","Так: padding розділяє margins.","Так: у flex-контейнері margins не схлопуються.","Ні: z-index не впливає."],
      type: 'quiz',
      level: 2,
      title: 'Margin дитини «протікає» назовні батька',
      tags: ['margin-collapse', 'bfc'],
      question: `
Замість відступу 20px **усередині** \`.parent\` весь \`.parent\` зсунувся на 20px донизу (margin дитини «протік» назовні).

\`\`\`css
.parent { background: #eee; }           /* без padding і border */
.child  { margin-top: 20px; }
\`\`\`

Оберіть **усі** зміни \`.parent\`, які виправлять це (margin опиниться всередині):
`,
      options: [
        '`display: flow-root`',
        '`position: relative`',
        '`padding-top: 1px`',
        '`display: flex; flex-direction: column`',
        '`z-index: 1`'
      ],
      answer: [0, 2, 3],
      hint: 'Схлопування батька з дитиною можливе, лише коли між їхніми margin немає «перешкоди» і вони в одному block formatting context.',
      explanation: `
**Схлопування margin (margin collapsing)** — вертикальні margin суміжних блоків у block-потоці зливаються в один (береться максимальний). Для батька й першої дитини це відбувається, якщо між ними немає border, padding, inline-вмісту, і батько не створює новий контекст форматування.

Виправляють:
- \`display: flow-root\` — новий BFC: margin дітей не схлопуються з батьком;
- \`padding-top\` (або \`border-top\`) — «перешкода» між margin;
- \`display: flex\` — у flex (і grid) контексті margin **ніколи не схлопуються**.

Не виправляють:
- \`position: relative\` — не змінює контекст форматування;
- \`z-index\` — стосується накладання, а не розкладки (до того ж без position на звичайному блоці не діє).

Також схлопуються: margin сусідніх блоків (30px + 20px → 30px) і верхній/нижній margin порожнього блоку. Горизонтальні margin не схлопуються ніколи.
`
    },

    // ---------------------------------------------------------------- Transitions, animations, transforms
    {
      id: 'cssadv-transition-animation-theory', group: "animation", why: ["Так: transition реагує на зміну, animation — незалежна.","Ні: animation має проміжні кадри й цикли.","Ні: forwards лишає стилі останнього кадру.","Ні: display і height: auto класичним transition не анімуються.","Ні: steps робить стрибки без проміжних значень."],
      type: 'theory',
      level: 2,
      interview: true,
      title: 'transition vs animation (@keyframes)',
      tags: ['transition', 'animation'],
      question: 'Чим відрізняються CSS transitions і animations? Які властивості можна анімувати? Розкажіть про timing functions, fill-mode та інші параметри.',
      choices: [
        'Transition потребує тригера зміни значення, а animation з `@keyframes` стартує сама й може повторюватися',
        'Transition і animation відрізняються лише синтаксисом: обидві запускаються самі під час завантаження сторінки',
        '`animation-fill-mode: forwards` застосовує стилі першого кадру ще під час `animation-delay`',
        '`display` і `height: auto` анімуються звичайним `transition` так само плавно, як `opacity`',
        '`steps(n)` робить анімацію плавнішою, додаючи n проміжних кадрів між ключовими'
      ],
      correct: 0,
      hint: 'Хто запускає: зміна стану чи сама анімація? Скільки проміжних кадрів можна описати?',
      answer: `
**Transition** — плавний перехід між **двома станами**, коли значення властивості змінюється (hover, клас, зміна стилю з JS). Потрібен тригер.
\`\`\`css
.btn { transition: transform 200ms ease-out, background-color 150ms linear 50ms; }
.btn:hover { transform: translateY(-2px); background-color: #1d4ed8; }
\`\`\`
Складові: \`transition-property\`, \`-duration\`, \`-timing-function\`, \`-delay\`.

**Animation** — сценарій із довільною кількістю кадрів (\`@keyframes\`), запускається сам при застосуванні стилю, може повторюватися.
\`\`\`css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.1); }
}
.dot { animation: pulse 1.2s ease-in-out 0s infinite alternate both; }
\`\`\`
Складові: \`animation-name\`, \`-duration\`, \`-timing-function\`, \`-delay\`, \`-iteration-count\` (число / \`infinite\`), \`-direction\` (\`normal\`, \`reverse\`, \`alternate\`), \`-fill-mode\` (\`none\`, \`forwards\` — зберегти кінцевий кадр, \`backwards\` — застосувати перший кадр під час delay, \`both\`), \`-play-state\` (\`running\`/\`paused\`).

**Timing functions:** \`ease\` (за замовчуванням), \`linear\`, \`ease-in\`, \`ease-out\` (найприродніше для появи), \`ease-in-out\`, \`cubic-bezier(x1, y1, x2, y2)\` (y поза 0..1 → «пружина»), \`steps(n, jump-start|end)\` (покадрово — спрайти, таймери), \`linear()\` з точками — складні easing на кшталт bounce.

**Що анімується:** властивості з інтерпольованими значеннями — числа, довжини, відсотки, кольори, transform, opacity, filter, тіні, \`clip-path\`. **Не анімуються** дискретні: \`display\`, \`visibility\` (перемикається в кінці/на початку), \`font-family\`. Також не інтерполюється \`height: auto\` (рішення: \`grid-template-rows: 0fr → 1fr\`, \`interpolate-size: allow-keywords\`, max-height-хак).

**Коли що:** transition — інтерактивні стани (hover, focus, відкриття меню); animation — лоадери, привернення уваги, складні послідовності, анімація при появі.

**JS-події:** \`transitionend\`, \`animationstart/iteration/end\`; Web Animations API (\`el.animate()\`) — керування з JS.

**Доступність:** \`@media (prefers-reduced-motion: reduce)\` — вимикати або спрощувати рух.
`,
      keyPoints: [
        'Transition — між двома станами за тригером; animation — @keyframes, стартує сама, може повторюватись',
        'Параметри transition: property, duration, timing-function, delay',
        'Animation: iteration-count, direction, fill-mode (forwards/backwards/both), play-state',
        'Timing functions: ease, linear, cubic-bezier, steps',
        'display/height: auto не анімуються звичайним способом; prefers-reduced-motion'
      ],
      followUps: [
        'Як анімувати появу елемента з display: none?',
        'Чому transition: all — погана ідея?',
        'Як анімувати висоту до auto?'
      ]
    },
    {
      id: 'cssadv-keyframes-spinner', group: "animation",
      type: 'dom',
      level: 1,
      title: 'Лоадер-спінер на @keyframes',
      tags: ['animation', 'keyframes'],
      description: `
**Завдання.** Зробіть з \`.spinner\` анімований лоадер:

**Де трапляється:** лоадери під час завантаження даних.

- оголосіть \`@keyframes spin\`, що повертає елемент від 0 до **360°**;
- \`.spinner\` крутиться безкінечно, один оберт за **1s**, з **рівномірною** швидкістю;
- спінер круглий (\`border-radius: 50%\`).

Рамка з одним кольоровим боком уже задана.

**Як це працює:** @keyframes описує кадри (from/to або відсотки), animation підключає їх до елемента з тривалістю, кривою і кількістю повторень (infinite).
`,
      html: `<div class="spinner" role="status" aria-label="Завантаження"></div>`,
      css: `.spinner {
  width: 40px;
  height: 40px;
  margin: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.spinner {
  width: 40px;
  height: 40px;
  margin: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
`
      },
      hints: [
        '`@keyframes spin { to { transform: rotate(360deg); } }` — кадр `from` можна не писати, він візьметься з поточного стилю.',
        'Шорткат `animation`: ім\'я, тривалість, timing function, кількість повторів.',
        'Рівномірна швидкість — `linear`; безкінечно — `infinite`.'
      ],
      tests: [
        { name: 'використано анімацію spin тривалістю 1s', code: "expect(css('.spinner', 'animation-name')).toBe('spin');\nexpect(css('.spinner', 'animation-duration')).toBe('1s');" },
        { name: 'безкінечно і рівномірно', code: "expect(css('.spinner', 'animation-iteration-count')).toBe('infinite');\nexpect(css('.spinner', 'animation-timing-function')).toBe('linear');" },
        { name: '@keyframes spin повертає на 360°', code: "let kf = null;\nfor (const sh of document.styleSheets) for (const r of sh.cssRules) if (r instanceof CSSKeyframesRule && r.name === 'spin') kf = r;\nexpect(kf).not.toBeNull();\nconst text = Array.from(kf.cssRules).map(k => k.cssText).join(' ');\nexpect(text).toMatch(/rotate\\((360deg|1turn)\\)/);" },
        { name: 'спінер круглий', code: "expect(css('.spinner', 'border-top-left-radius')).toBe('50%');" }
      ],
      explanation: `
- \`@keyframes spin { to { transform: rotate(360deg) } }\` — кадр \`from\` (0%) береться з поточного стилю елемента (\`transform: none\` = 0°).
- \`animation: spin 1s linear infinite\` — ім'я, тривалість, рівномірна швидкість (з \`ease\` спінер «пригальмовував» би на кожному оберті), безкінечне повторення.

**Чому \`transform\`:** анімація \`transform\`/\`opacity\` виконується на **компоновщику** (compositor thread) і не перераховує layout/paint — спінер крутиться плавно, навіть коли основний потік зайнятий JS.

**Доступність:**
- \`role="status"\` + \`aria-label\` — скрінрідер повідомить про завантаження;
- \`@media (prefers-reduced-motion: reduce) { .spinner { animation-duration: 3s; } }\` — повільніше або без обертання.

**Що можуть спитати далі:** як поставити анімацію на паузу (\`animation-play-state: paused\`)? Як зробити «пульсацію» туди-назад (\`alternate\`)? Як слухати завершення (\`animationend\`)?
`
    },
    {
      id: 'cssadv-hover-transform-transition', group: "animation",
      type: 'dom',
      level: 2,
      title: 'Плавний hover без перерахунку layout',
      tags: ['transition', 'transform', 'performance'],
      description: `
**Завдання.** Картка при наведенні «піднімається» на 4px. Зараз це зроблено через \`top\` і \`transition: all\` — це смикає layout і анімує все підряд.

**Де трапляється:** ховер-ефекти карток без ривків.

Перепишіть так, щоб:
- при \`:hover\` картка піднімалася через **\`transform: translateY(-4px)\`** (без \`top\`/\`margin\`);
- transition стосувався **лише** \`transform\`;
- тривалість **200ms**, функція плавності **ease-out**.

**Як це працює:** transform: translateY(-4px) рухає елемент без перерахунку layout, а transition: transform 0.2s анімує лише цю властивість замість all.
`,
      html: `<div class="card">
  <h3>Тариф Pro</h3>
  <p>Наведіть, щоб побачити ефект.</p>
</div>`,
      css: `.card {
  position: relative;
  width: 240px;
  margin: 40px;
  padding: 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}
.card:hover {
  top: -4px;
}
.card h3,
.card p {
  margin: 0 0 8px;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.card {
  width: 240px;
  margin: 40px;
  padding: 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 200ms ease-out;
}
.card:hover {
  transform: translateY(-4px);
}
.card h3,
.card p {
  margin: 0 0 8px;
}
`
      },
      hints: [
        '`transition: all` анімує будь-яку властивість, що зміниться, — включно з тими, які ви не планували. Перелічіть явно.',
        'Шорткат: `transition: <property> <duration> <timing-function>`.',
        '`transition: transform 200ms ease-out;` і `.card:hover { transform: translateY(-4px); }`'
      ],
      tests: [
        { name: 'transition лише для transform', code: "expect(css('.card', 'transition-property')).toBe('transform');" },
        { name: 'тривалість 200ms, ease-out', code: "expect(css('.card', 'transition-duration')).toBe('0.2s');\nexpect(css('.card', 'transition-timing-function')).toBe('ease-out');" },
        { name: ':hover використовує translateY(-4px), а не top/margin', code: "const rules = [];\nfor (const sh of document.styleSheets) for (const r of sh.cssRules) if (r.selectorText && /\\.card:hover/.test(r.selectorText)) rules.push(r);\nexpect(rules.length).toBeGreaterThan(0);\nexpect(rules.some(r => /translateY\\(-4px\\)/.test(r.style.transform))).toBe(true);\nrules.forEach(r => {\n  expect(r.style.top).toBe('');\n  expect(r.style.marginTop).toBe('');\n});" }
      ],
      explanation: `
**Чому \`transform\`, а не \`top\`:** зміна \`top\`/\`margin\`/\`width\` запускає весь конвеєр рендерингу: **Layout → Paint → Composite** на кожному кадрі. \`transform\` і \`opacity\` змінюються лише на етапі **Composite** — елемент уже намальований у власному шарі, GPU просто зсуває його. Результат — стабільні 60 fps навіть на слабких пристроях.

**Чому не \`transition: all\`:**
- анімуються випадкові властивості (змінили колір теми — все «попливло»);
- браузер мусить відстежувати всі властивості;
- можливі анімації layout-властивостей, що гальмують.

**ease-out** (швидкий старт, плавне гальмування) відчувається природніше для реакції на дію користувача; \`ease-in\` — для зникнення.

**Додатково:**
- тінь при hover краще анімувати через \`opacity\` псевдоелемента з більшою тінню (box-shadow — це paint);
- \`@media (prefers-reduced-motion: reduce) { .card { transition: none; } }\`;
- на тач-пристроях hover «липне» — обгорніть у \`@media (hover: hover)\`.

**Що можуть спитати далі:** що таке will-change і коли його ставити? Як перевірити в DevTools, що анімація не викликає layout (Performance, Rendering → Paint flashing)?
`
    },
    {
      id: 'cssadv-quiz-fill-mode', group: "animation", why: ["Так: forwards фіксує останній кадр, без нього повертається базове значення.","Ні: без forwards стилі анімації зникають.","Ні: навпаки.","Ні: 0.5 ні до чого."],
      type: 'quiz',
      level: 2,
      title: 'animation-fill-mode: forwards',
      tags: ['animation', 'fill-mode'],
      question: `
Яка \`opacity\` у \`.box\` **після завершення** анімації — з \`forwards\` і без нього?

\`\`\`css
.box { opacity: 0; animation: fade-in 1s forwards; }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
\`\`\`
`,
      options: [
        'З forwards — `1`; без forwards — `0` (повернеться до значення з `.box`)',
        'З forwards — `1`; без forwards — теж `1`',
        'З forwards — `0`; без forwards — `1`',
        'В обох випадках `0.5`'
      ],
      answer: 0,
      hint: 'Чи «залишає» анімація свої значення після закінчення за замовчуванням?',
      explanation: `
За замовчуванням (\`animation-fill-mode: none\`) стилі з keyframes діють **лише під час** анімації. Після завершення елемент повертається до власних стилів — \`opacity: 0\`, і блок «зникає» назад.

\`forwards\` зберігає значення **останнього** кадру (з урахуванням \`direction\` і \`iteration-count\`) → \`1\`.

Інші значення:
- \`backwards\` — під час \`animation-delay\` застосовує **перший** кадр (корисно, щоб елемент не «блимав» до старту);
- \`both\` — і те, і інше.

Пастка: значення з \`forwards\` має пріоритет анімації в каскаді — пізніше змінити \`opacity\` звичайним правилом не вийде, доки анімація застосована.
`
    },
    {
      id: 'cssadv-quiz-steps', group: "animation", why: ["Ні: це плавне значення без steps.","Ні: перший крок уже настав.","Ні: steps не дає проміжних значень.","Так: 0.3s — другий крок з чотирьох (end) → 100px."],
      type: 'quiz',
      level: 3,
      title: 'Timing function steps()',
      tags: ['animation', 'timing-function'],
      question: `
Яке значення \`translateX\` буде через **0.3s** після старту?

\`\`\`css
.sprite { animation: move 1s steps(4, end) forwards; }
@keyframes move { from { transform: translateX(0); } to { transform: translateX(400px); } }
\`\`\`
`,
      options: ['`120px`', '`0px`', '`75px`', '`100px`'],
      answer: 3,
      hint: 'steps(4) ділить анімацію на 4 рівні інтервали й «стрибає» замість плавного руху. Коли саме відбувається стрибок при `end`?',
      explanation: `
\`steps(4, end)\` (= \`steps(4)\`) розбиває 1s на 4 інтервали по 0.25s. Значення змінюється стрибками **в кінці** кожного інтервалу: 0–0.25s → 0px, 0.25–0.5s → 100px, 0.5–0.75s → 200px, 0.75–1s → 300px, у самому кінці — 400px. О 0.3s — **100px**.

- \`120px\` — значення при \`linear\` (30% від 400).
- \`0px\` — було б о 0.3s при \`steps(2, end)\` чи для першої чверті.
- \`75px\` — немає такого кроку.

З \`jump-start\` (\`start\`) стрибок на початку інтервалу: 0–0.25s → 100px, 0.25–0.5s → 200px.

**Де застосовують:** спрайт-анімації, «друкарська машинка», секундна стрілка, блимання курсора. Для «пружних» ефектів — \`cubic-bezier()\` зі значеннями y поза діапазоном 0..1, наприклад \`cubic-bezier(0.34, 1.56, 0.64, 1)\`.
`
    },
    {
      id: 'cssadv-quiz-transition-display', group: "animation", why: ["Ні: display дискретна і в transition не анімується.","Так: елемент з'являється без початкового кадру — потрібен visibility/opacity або @starting-style.","Ні: анімація height не вирішує проблему display.","Ні: затримка не створює стартовий кадр."],
      type: 'quiz',
      level: 3,
      title: 'Чому transition не працює з display: none',
      tags: ['transition', 'display'],
      question: `
Меню має плавно з'являтися, але показується миттєво. Чому і як це виправити класично?

\`\`\`css
.menu { display: none; opacity: 0; transition: opacity 0.3s; }
.menu.open { display: block; opacity: 1; }
\`\`\`
`,
      options: [
        'Потрібно перелічити display у transition-property: `transition: display 0.3s, opacity 0.3s`',
        '`display` дискретна, а в момент появи в елемента немає попереднього відрендереного стану, з якого стартувати. Класичне рішення — замість display перемикати `visibility` + `opacity` (+ `pointer-events`)',
        'opacity не анімується разом з display, треба анімувати `height`',
        'Потрібен `transition-delay`, інакше браузер не встигає'
      ],
      answer: 1,
      hint: 'Що браузер знає про стилі елемента, який до цього моменту взагалі не рендерився?',
      explanation: `
\`display: none\` → елемент не має бокса і обчислених стилів «до» зміни. Коли додається \`.open\`, браузер обчислює стилі вже з \`display: block; opacity: 1\` — стартового значення для переходу немає, тож opacity одразу 1.

**Класичне рішення:**
\`\`\`css
.menu { visibility: hidden; opacity: 0; transition: opacity .3s, visibility .3s; }
.menu.open { visibility: visible; opacity: 1; }
\`\`\`
\`visibility\` дискретна, але **анімується особливим чином** (перемикається в кінці переходу при зникненні і на початку при появі), тож зникання теж плавне. Невидимий елемент не клікається і не фокусується (на відміну від одного \`opacity: 0\`).

**Сучасне рішення (2024+):**
\`\`\`css
.menu { transition: opacity .3s, display .3s allow-discrete; }
.menu.open { display: block; opacity: 1; }
@starting-style { .menu.open { opacity: 0; } }
\`\`\`
\`@starting-style\` задає стан «до першого рендеру», а \`transition-behavior: allow-discrete\` дозволяє display чекати завершення.

- Просто додати \`display\` у transition без \`allow-discrete\` не допоможе.
- \`height\` тут ні до чого (і \`height: auto\` теж не інтерполюється).
- Затримка не створить стартового стану.
`
    },
    {
      id: 'cssadv-quiz-transform-order', group: "animation", why: ["Ні: порядок функцій змінює результат.","Так: функції застосовуються справа наліво; поворот змінює напрям осі.","Ні: навпаки.","Ні: .a спершу зсувається, потім обертається на місці."],
      type: 'quiz',
      level: 2,
      title: 'Порядок функцій у transform',
      tags: ['transform'],
      question: `
Куди зміститься центр елемента відносно початкового положення в кожному випадку? (Вісь Y спрямована вниз.)

\`\`\`css
.a { transform: translateX(100px) rotate(90deg); }
.b { transform: rotate(90deg) translateX(100px); }
\`\`\`
`,
      options: [
        'Обидва — на 100px праворуч',
        '`.a` — на 100px праворуч; `.b` — на 100px донизу',
        '`.a` — на 100px донизу; `.b` — на 100px праворуч',
        'Обидва — на 100px донизу'
      ],
      answer: 1,
      hint: 'Кожна функція трансформує систему координат для наступних функцій.',
      explanation: `
Функції в \`transform\` застосовуються зліва направо, і кожна змінює **локальну систему координат** для наступних (математично — множення матриць).

- \`.a\`: спершу зсув на 100px праворуч, потім поворот на місці → центр праворуч на 100px.
- \`.b\`: спершу поворот на 90° — локальна вісь X тепер дивиться **вниз**; \`translateX(100px)\` зсуває вздовж повернутої осі → центр на 100px нижче.

Тому порядок має значення, і \`transform\` в \`:hover\` повністю **перезаписує** базовий (поширений баг: \`transform: scale(1.1)\` на hover «скасовує» \`rotate\`).

**Рішення — окремі властивості** \`translate\`, \`rotate\`, \`scale\` (усі сучасні браузери): вони не перезаписують одна одну і застосовуються в фіксованому порядку translate → rotate → scale → transform.

\`transform-origin\` (за замовчуванням \`50% 50%\`) задає точку, навколо якої відбуваються rotate і scale.
`
    },
    {
      id: 'cssadv-individual-transforms', group: "animation",
      type: 'dom',
      level: 3,
      title: 'Окремі властивості rotate і scale',
      tags: ['transform', 'individual-transforms'],
      description: `
**Завдання.** Іконка \`.icon\` повернута на 45° (ромб). При класі \`.active\` вона має збільшуватися в **1.2 раза**, але зараз \`transform: scale(1.2)\` перетирає поворот — і ромб стає квадратом.

**Де трапляється:** іконки зі станами (поворот + масштаб).

Виправте, використавши **окремі властивості** \`rotate\` і \`scale\` замість \`transform\`, щоб стани не перезаписували одне одного:
- базово: \`rotate: 45deg\`;
- з \`.active\`: додатково \`scale: 1.2\`, поворот зберігається.

**Як це працює:** Окремі властивості rotate і scale не перезаписують одна одну, на відміну від transform: ...: стан .active може змінити лише scale, а rotate лишиться.
`,
      html: `<div class="stage">
  <div class="icon"></div>
</div>`,
      css: `.stage {
  padding: 40px;
}
.icon {
  width: 40px;
  height: 40px;
  background: #f59e0b;
  transform: rotate(45deg);
}
.icon.active {
  transform: scale(1.2);
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.stage {
  padding: 40px;
}
.icon {
  width: 40px;
  height: 40px;
  background: #f59e0b;
  rotate: 45deg;
}
.icon.active {
  scale: 1.2;
}
`
      },
      hints: [
        '`transform` — одна властивість: нове значення повністю замінює старе, функції не «додаються».',
        'CSS має окремі властивості `translate`, `rotate`, `scale`, які живуть незалежно.',
        '`.icon { rotate: 45deg }`, `.icon.active { scale: 1.2 }`.'
      ],
      tests: [
        { name: 'базово ромб: поворот 45°', code: "const icon = $('.icon');\nicon.classList.remove('active');\nexpect(css(icon, 'rotate')).toBe('45deg');\nexpect(rect(icon).width).toBeCloseTo(40 * Math.SQRT2, 0);" },
        { name: '.active: збільшено в 1.2 раза і поворот збережено', code: "const icon = $('.icon');\nicon.classList.add('active');\ntry {\n  expect(css(icon, 'rotate')).toBe('45deg');\n  expect(css(icon, 'scale')).toBe('1.2');\n  expect(rect(icon).width).toBeCloseTo(48 * Math.SQRT2, 0);\n} finally { icon.classList.remove('active'); }" },
        { name: 'transform не використовується', code: "const icon = $('.icon');\nicon.classList.add('active');\ntry { expect(css(icon, 'transform')).toBe('none'); } finally { icon.classList.remove('active'); }" }
      ],
      explanation: `
**Проблема:** \`transform\` — це одна властивість зі списком функцій. Правило \`.icon.active { transform: scale(1.2) }\` має вищу специфічність і **повністю замінює** \`rotate(45deg)\`. Класичний обхід — повторювати все: \`transform: rotate(45deg) scale(1.2)\`, що погано масштабується (кожен стан мусить знати про інші).

**Окремі властивості** \`translate\`, \`rotate\`, \`scale\` (Chrome 104+, Safari 14.1+, Firefox 72+):
- незалежні — їх можна задавати в різних правилах і анімувати окремо (\`transition: scale .2s\`);
- застосовуються у фіксованому порядку: translate → rotate → scale → потім \`transform\`;
- як і \`transform\`, створюють stacking context і containing block.

**Перевірка геометрії:** описаний прямокутник квадрата 40px, поверненого на 45°, має ширину 40·√2 ≈ 56.6px; після scale(1.2) — 48·√2 ≈ 67.9px.

**Що можуть спитати далі:** як анімувати \`rotate\` і \`scale\` з різною тривалістю? Як \`transform-origin\` впливає на rotate/scale?
`
    },
    {
      id: 'cssadv-quiz-compositor-props', group: "animation", why: ["Ні: width — layout.","Так: transform — composite.","Ні: top — layout.","Ні: тінь — paint.","Так: opacity — composite.","Ні: колір фону — paint."],
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Які властивості дешево анімувати',
      tags: ['performance', 'animation'],
      question: 'Оберіть **усі** властивості, анімація яких зазвичай виконується лише на етапі композиції (без layout і paint на кожному кадрі):',
      options: ['`width`', '`transform`', '`top`', '`box-shadow`', '`opacity`', '`background-color`'],
      answer: [1, 4],
      hint: 'Конвеєр: Style → Layout → Paint → Composite. Що можна змінити, не перемальовуючи пікселі шару?',
      explanation: `
- **\`transform\` і \`opacity\`** — шар елемента вже намальований; GPU лише зсуває/масштабує/змінює прозорість. Анімація може йти на compositor thread навіть при зайнятому main thread. (Також у Chrome часто композиторні \`filter\` і \`backdrop-filter\`.)
- \`width\`, \`top\` (і \`height\`, \`margin\`, \`padding\`, \`left\`, \`font-size\`) → **layout** (reflow) + paint + composite на кожному кадрі — найдорожче, особливо якщо зачіпає сусідів.
- \`box-shadow\`, \`background-color\` (і \`color\`, \`border-radius\`) → **paint** + composite: розмітка не змінюється, але пікселі перемальовуються.

**Прийоми:** замість \`width\` — \`transform: scaleX()\`; замість \`top/left\` — \`translate\`; замість анімації тіні — \`opacity\` псевдоелемента з потрібною тінню; FLIP-техніка для анімації layout-змін.
`
    },
    {
      id: 'cssadv-animation-performance-theory', group: "animation", why: ["Так: лише composite, без layout і paint.","Ні: left/top змінюють геометрію.","Ні: масове will-change витрачає пам'ять.","Так: will-change має побічні ефекти для верстки.","Так: FLIP робить дорогі зміни layout дешевими."],
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Продуктивність CSS-анімацій і will-change',
      tags: ['performance', 'animation', 'will-change'],
      question: 'Як зробити CSS-анімації плавними? Поясніть конвеєр рендерингу, шари компоновки, will-change і типові помилки. Оберіть **усі** правильні твердження.',
      choices: [
        'Анімація `transform` і `opacity` зазвичай потребує лише етапу Composite й може йти на compositor thread',
        'Анімувати `left`/`top` так само дешево, як `transform`, бо в обох випадках елемент лише зсувається',
        '`* { will-change: transform }` — добра практика: браузер заздалегідь підготує шари для всіх елементів',
        '`will-change: transform` створює stacking context і containing block для fixed-нащадків',
        'FLIP анімує зміну layout через `transform`: вимірює старе й нове положення та програє різницю'
      ],
      correct: [0, 3, 4],
      hint: 'Style → Layout → Paint → Composite. Що з цього можна пропустити?',
      answer: `
**Конвеєр рендерингу кадру:** JS → **Style** (обчислення стилів) → **Layout** (геометрія) → **Paint** (растеризація пікселів у шари) → **Composite** (зведення шарів на GPU). Для 60 fps на кадр є ~16 мс (з урахуванням роботи браузера — ~10 мс).

**Вартість анімації залежить від того, з якого етапу починається перерахунок:**
- \`width\`, \`height\`, \`top\`, \`margin\`, \`font-size\` → Layout + Paint + Composite (найдорожче, каскадно зачіпає сусідів);
- \`color\`, \`background\`, \`box-shadow\` → Paint + Composite;
- \`transform\`, \`opacity\` (часто \`filter\`) → лише Composite — може виконуватися на **compositor thread**, не блокуючись JS у main thread.

**Шари компоновки (layers):** браузер виносить елемент в окремий GPU-шар, коли він анімує transform/opacity, має 3D-transform, \`will-change\`, \`<video>\`, \`position: fixed\` тощо. Тоді зсув не потребує перемальовування.

**will-change** — підказка браузеру заздалегідь підготувати шар:
\`\`\`css
.drawer { will-change: transform; }       /* перед частою анімацією */
\`\`\`
Правила: ставити точково і **ненадовго** (наприклад, на hover батька або з JS перед анімацією, потім прибирати); не писати \`* { will-change: transform }\` — кожен шар їсть відеопам'ять, надто багато шарів (layer explosion) гальмує композицію. Побічні ефекти: створює stacking context і (для transform) containing block для fixed. Застарілий аналог — хак \`transform: translateZ(0)\`.

**Типові помилки:**
- анімація \`left/top/width\` замість \`transform\`;
- \`transition: all\`;
- layout thrashing у JS (читання \`offsetHeight\` після кожної зміни стилю);
- анімація великих тіней і \`filter: blur\` на великих площах;
- анімація з JS через \`setTimeout\` замість CSS/\`requestAnimationFrame\`/Web Animations API.

**FLIP (First, Last, Invert, Play):** щоб анімувати зміну layout (перестановку списку), вимірюють старе і нове положення і анімують різницю через \`transform\`.

**Інструменти:** DevTools Performance (червоні кадри, Layout/Paint події), Rendering → Paint flashing, Layer borders, панель Layers.

**Доступність:** \`prefers-reduced-motion\`.
`,
      keyPoints: [
        'Конвеєр: Style → Layout → Paint → Composite; бюджет ~16 мс на кадр',
        'transform і opacity — лише composite, можуть іти на compositor thread',
        'Layout-властивості (width/top/margin) — найдорожчі',
        'will-change — точково й тимчасово; надлишок шарів шкодить; створює stacking context',
        'FLIP для анімації змін layout, інструменти DevTools (Paint flashing, Performance)'
      ],
      followUps: [
        'Що таке layout thrashing і як його уникнути?',
        'Чим CSS-анімації відрізняються від requestAnimationFrame за продуктивністю?',
        'Як реалізувати FLIP-анімацію?'
      ]
    },

    // ---------------------------------------------------------------- Custom properties
    {
      id: 'cssadv-custom-props-theory', group: "custom-props", why: ["Ні: CSS-змінні живуть у рантаймі.","Ні: невалідне значення — invalid at computed-value time, fallback не спрацює.","Ні: у media query var() не працює.","Так: успадковуються, каскадуються, змінюються з JS.","Ні: плавно анімуються лише зареєстровані через @property."],
      type: 'theory',
      level: 2,
      interview: true,
      title: 'CSS custom properties vs змінні препроцесорів',
      tags: ['custom-properties', 'theming'],
      question: 'Що таке CSS custom properties (CSS-змінні)? Чим вони відрізняються від змінних Sass/Less? Як з ними працювати з JS і як будувати теми?',
      choices: [
        'CSS-змінні підставляються під час збірки, як Sass-змінні, тому змінити їх із JS неможливо',
        'Якщо `--x` містить невалідне для властивості значення, спрацює fallback із `var(--x, fallback)`',
        'Custom properties можна підставляти в умови медіазапитів: `@media (min-width: var(--bp))`',
        'Custom properties успадковуються й підкоряються каскаду: перевизначення діє на все піддерево',
        'Будь-яку CSS-змінну можна плавно анімувати через `transition` без жодної реєстрації типу'
      ],
      correct: 3,
      hint: 'Ключове слово — runtime. А ще: каскад і успадкування.',
      answer: `
**Custom properties** — властивості з префіксом \`--\`, значення яких підставляються через \`var()\`:
\`\`\`css
:root { --accent: #2563eb; --radius: 8px; }
.btn  { background: var(--accent); border-radius: var(--radius, 4px); } /* 4px — fallback */
\`\`\`

**Відмінності від Sass/Less-змінних:**
| | Sass \`$var\` | CSS \`--var\` |
|---|---|---|
| Коли обчислюється | під час компіляції | у браузері, в runtime |
| Каскад і успадкування | немає | є: значення успадковується нащадками, можна перевизначити в будь-якому селекторі / медіазапиті |
| Зміна з JS | неможлива | \`el.style.setProperty('--x', '10px')\` |
| Видно в DevTools | ні | так |

**Скоупінг:** змінна, оголошена на \`.card\`, діє для \`.card\` і нащадків; перевизначення на вкладеному елементі впливає лише на його піддерево. Це дає «параметри компонента»:
\`\`\`css
.btn { background: var(--btn-bg, var(--accent)); }
.btn--danger { --btn-bg: #dc2626; }
\`\`\`

**Теми:**
\`\`\`css
:root { --bg: #fff; --text: #111; color-scheme: light; }
[data-theme="dark"] { --bg: #121212; --text: #eee; color-scheme: dark; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --bg: #121212; --text: #eee; }
}
body { background: var(--bg); color: var(--text); }
\`\`\`
JS лише перемикає атрибут: \`document.documentElement.dataset.theme = 'dark'\` (+ збереження в localStorage, застосування до першого рендеру, щоб не було «спалаху»).

**Читання з JS:** \`getComputedStyle(el).getPropertyValue('--accent')\`.

**Нюанси та пастки:**
- значення — це **послідовність токенів**, тип не перевіряється при оголошенні; невалідна підстановка → властивість стає \`unset\` (invalid at computed-value time), fallback не допомагає;
- без \`@property\` змінні не анімуються (немає типу для інтерполяції); з \`@property --angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }\` — анімуються;
- не можна використати в селекторах і в умовах media queries;
- \`var(--gap) * 2\` не працює без \`calc()\`: \`calc(var(--gap) * 2)\`; число в одиниці: \`calc(var(--n) * 1px)\`.
`,
      keyPoints: [
        'Custom properties живуть у runtime, підкоряються каскаду й успадковуються',
        'Sass-змінні — compile-time, без каскаду та без доступу з JS',
        'var(--x, fallback); змінювати з JS — style.setProperty, читати — getComputedStyle',
        'Теми: перевизначення змінних на [data-theme] / prefers-color-scheme',
        'Невалідне значення → unset (fallback не спрацьовує); @property для типізації й анімації'
      ],
      followUps: [
        'Як уникнути «спалаху» світлої теми при завантаженні (FOUC)?',
        'Що таке @property і навіщо реєструвати змінну?',
        'Чому не можна використати var() у медіазапиті?'
      ]
    },
    {
      id: 'cssadv-quiz-var-scope', group: "custom-props", why: ["Так: A всередині .card успадковує 24px, B — значення :root.","Ні: .card перевизначає змінну для A.","Ні: B не всередині .card.","Ні: навпаки."],
      type: 'quiz',
      level: 1,
      title: 'Область дії CSS-змінної',
      tags: ['custom-properties', 'inheritance'],
      question: `
Який \`padding\` у кожного \`.item\`?

\`\`\`html
<div class="card"><div class="item">A</div></div>
<div class="item">B</div>
\`\`\`
\`\`\`css
:root { --gap: 8px; }
.card { --gap: 24px; }
.item { padding: var(--gap); }
\`\`\`
`,
      options: ['A — `24px`, B — `8px`', 'A — `8px`, B — `8px`', 'A — `24px`, B — `24px`', 'A — `8px`, B — `24px`'],
      answer: 0,
      hint: 'Custom properties успадковуються, як color.',
      explanation: `
Custom properties — **успадковувані** властивості. \`.item\` всередині \`.card\` успадковує \`--gap: 24px\` від найближчого предка, де її перевизначено. \`.item\` поза карткою успадковує значення з \`:root\` — \`8px\`.

Саме так будуються «параметри компонента» і теми: перевизначили змінну на контейнері — змінилось усе піддерево.

- Однакові значення були б, якби змінні були глобальними (як у Sass, де останнє присвоєння «перемагає» на етапі компіляції).
- Варіант «A — 8px, B — 24px» — переплутано напрямок успадкування.
`
    },
    {
      id: 'cssadv-theme-custom-props', group: "custom-props",
      type: 'dom',
      level: 2,
      title: 'Темна тема на CSS-змінних і data-theme',
      tags: ['custom-properties', 'theming'],
      description: `
**Завдання.** Реалізуйте світлу і темну тему через **CSS custom properties**. Тема перемикається атрибутом \`data-theme="dark"\` на \`<html>\`.

**Де трапляється:** темна тема на сайтах і в застосунках.

Оголосіть змінні \`--bg\`, \`--text\`, \`--surface\`, \`--accent\` і використайте їх:

| | світла (за замовч.) | темна (\`[data-theme="dark"]\`) |
|---|---|---|
| \`body\` фон (\`--bg\`) | \`#ffffff\` | \`#121212\` |
| \`body\` текст (\`--text\`) | \`#111111\` | \`#eeeeee\` |
| \`.card\` фон (\`--surface\`) | \`#f1f5f9\` | \`#1e1e1e\` |
| \`.btn\` фон (\`--accent\`) | \`#2563eb\` | \`#60a5fa\` |

Тест також змінить \`--accent\` на \`:root\` через JS — кнопка має це підхопити.

**Як це працює:** Кольори задаємо змінними на :root, а в [data-theme="dark"] перевизначаємо лише значення змінних. Компоненти використовують var(--…), тож тема перемикається без зміни їхніх стилів.
`,
      html: `<div class="card">
  <h3>Налаштування</h3>
  <p>Тема застосовується атрибутом data-theme на &lt;html&gt;.</p>
  <button class="btn">Зберегти</button>
</div>`,
      css: `body {
  background: #ffffff;
  color: #111111;
}
.card {
  padding: 16px;
  border-radius: 12px;
  background: #f1f5f9;
}
.btn {
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  color: #fff;
  background: #2563eb;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `:root {
  --bg: #ffffff;
  --text: #111111;
  --surface: #f1f5f9;
  --accent: #2563eb;
}
:root[data-theme="dark"] {
  --bg: #121212;
  --text: #eeeeee;
  --surface: #1e1e1e;
  --accent: #60a5fa;
}
body {
  background: var(--bg);
  color: var(--text);
}
.card {
  padding: 16px;
  border-radius: 12px;
  background: var(--surface);
}
.btn {
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  color: #fff;
  background: var(--accent);
}
`
      },
      hints: [
        'Оголосіть змінні в `:root`, а в правилах замініть кольори на `var(--...)`.',
        'Для темної теми достатньо **перевизначити змінні** в селекторі `[data-theme="dark"]` (атрибут стоїть на `<html>`, тобто на `:root`).',
        '`:root[data-theme="dark"] { --bg: #121212; --text: #eeeeee; --surface: #1e1e1e; --accent: #60a5fa; }`'
      ],
      tests: [
        { name: 'світла тема за замовчуванням', code: "delete document.documentElement.dataset.theme;\nexpect(css(document.body, 'background-color')).toBe('rgb(255, 255, 255)');\nexpect(css(document.body, 'color')).toBe('rgb(17, 17, 17)');\nexpect(css('.card', 'background-color')).toBe('rgb(241, 245, 249)');\nexpect(css('.btn', 'background-color')).toBe('rgb(37, 99, 235)');" },
        { name: 'темна тема через data-theme="dark"', code: "document.documentElement.dataset.theme = 'dark';\ntry {\n  expect(css(document.body, 'background-color')).toBe('rgb(18, 18, 18)');\n  expect(css(document.body, 'color')).toBe('rgb(238, 238, 238)');\n  expect(css('.card', 'background-color')).toBe('rgb(30, 30, 30)');\n  expect(css('.btn', 'background-color')).toBe('rgb(96, 165, 250)');\n} finally { delete document.documentElement.dataset.theme; }" },
        { name: 'кольори задані через змінні', code: "const cs = getComputedStyle(document.documentElement);\n['--bg', '--text', '--surface', '--accent'].forEach(v => expect(cs.getPropertyValue(v).trim()).not.toBe(''));" },
        { name: 'зміна --accent з JS змінює кнопку', code: "const root = document.documentElement;\nroot.style.setProperty('--accent', '#ff0000');\ntry { expect(css('.btn', 'background-color')).toBe('rgb(255, 0, 0)'); } finally { root.style.removeProperty('--accent'); }" }
      ],
      explanation: `
**Ідея:** компоненти використовують лише **семантичні змінні** (\`--bg\`, \`--surface\`, \`--accent\`), а тема — це просто інший набір значень цих змінних. Перемикання теми не вимагає жодного правила для кожного компонента.

**Чому працює зміна з JS:** custom properties обчислюються в runtime. Inline-стиль \`<html style="--accent: red">\` має вищий пріоритет у каскаді, і всі \`var(--accent)\` у документі одразу отримують нове значення (успадкування від \`:root\`).

**Продакшн-доповнення:**
\`\`\`css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --bg: #121212; /* ... */ }
}
:root { color-scheme: light; }
:root[data-theme="dark"] { color-scheme: dark; } /* скролбари, інпути */
\`\`\`
- поважайте системну тему за замовчуванням, а вибір користувача зберігайте в \`localStorage\`;
- застосовуйте тему **inline-скриптом у \`<head>\`** до першого рендеру — інакше «спалах» світлої теми;
- нова функція \`light-dark(#fff, #121212)\` разом із \`color-scheme\` — компактна альтернатива.

**Типові помилки:** дублювати всі правила під \`.dark .card {...}\` (вибух специфічності й коду); називати змінні за кольором (\`--blue\`), а не за роллю; забути \`color-scheme\` (системні контроли лишаються світлими).
`
    },
    {
      id: 'cssadv-quiz-var-invalid', group: "custom-props", why: ["Ні: fallback працює лише коли змінна не визначена.","Ні: попереднє оголошення вже відкинуто під час каскаду.","Так: invalid at computed-value time — color успадковується від батька.","Ні: для успадковуваної властивості береться значення батька."],
      type: 'quiz',
      level: 4,
      title: 'Невалідна підстановка var(): invalid at computed-value time',
      tags: ['custom-properties', 'cascade'],
      question: `
Якого кольору буде текст \`.box\`?

\`\`\`css
.parent { color: blue; }
.box {
  color: green;
  --c: 20px;
  color: var(--c, red);
}
\`\`\`
\`\`\`html
<div class="parent"><div class="box">Текст</div></div>
\`\`\`
`,
      options: [
        '`red` — спрацює fallback',
        '`green` — невалідне оголошення відкинеться, лишиться попереднє',
        '`blue`',
        '`black` — початкове значення'
      ],
      answer: 2,
      hint: 'Коли браузер дізнається, що `20px` — не колір: під час парсингу чи пізніше?',
      explanation: `
1. Під час **парсингу** \`color: var(--c, red)\` валідне — браузер не знає, що буде в змінній, тож це оголошення **перемагає** в каскаді й \`color: green\` відкидається.
2. Під час **обчислення** підставляється \`20px\` — це не колір. Змінна \`--c\` існує, тому fallback \`red\` **не** використовується (fallback діє лише для невизначеної змінної або \`initial\`).
3. Оголошення стає **invalid at computed-value time** → властивість поводиться як \`unset\`. \`color\` успадковувана, тож \`unset\` = \`inherit\` → **blue** від \`.parent\`.

- «red» — fallback не працює, коли змінна визначена, хай і невідповідним значенням.
- «green» — так було б зі звичайним невалідним оголошенням (\`color: 20px\` відкидається парсером), але не з \`var()\`.
- «black» — було б для неуспадковуваної властивості (\`unset\` = \`initial\`) або якби батько не мав кольору.

Захист — \`@property --c { syntax: '<color>'; inherits: true; initial-value: black; }\`: тоді невалідне значення змінної відкидається, а підставляється \`initial-value\`.
`
    },
    {
      id: 'cssadv-custom-prop-js', group: "custom-props",
      type: 'dom',
      level: 3,
      title: 'Прогрес-бар: керування CSS-змінною з JS',
      tags: ['custom-properties', 'calc', 'clamp', 'js'],
      description: `
**Завдання.** Реалізуйте \`setProgress(percent)\`, яка оновлює прогрес-бар. Вимоги:

**Де трапляється:** прогрес-бари, слайдери, динамічні стилі з JS.

- JS **не** пише \`style.width\` у \`.fill\` — лише встановлює на \`.progress\` CSS-змінну \`--progress\` з **безрозмірним числом** (наприклад, \`25\`);
- CSS сам обчислює ширину \`.fill\`: \`--progress\` відсотків від ширини бару, **обмежених** діапазоном 0–100% (функції \`calc()\` і \`clamp()\`);
- оновлюйте \`aria-valuenow\` на \`.progress\` (значення в межах 0–100).

\`\`\`js
setProgress(25);   // .fill — 25% ширини
setProgress(150);  // .fill — 100%
\`\`\`

**Як це працює:** JS записує лише число: el.style.setProperty('--progress', value). CSS сам рахує ширину через calc і обмежує clamp — логіка відображення лишається в стилях.
`,
      html: `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
  <div class="fill"></div>
</div>`,
      css: `.progress {
  width: 400px;
  height: 12px;
  border-radius: 6px;
  background: #e2e8f0;
  overflow: hidden;
}
.fill {
  height: 100%;
  width: 0;
  background: #22c55e;
}
`,
      js: `function setProgress(percent) {
  // ваш код
}
`,
      editable: ['js', 'css'],
      solution: {
        js: `function setProgress(percent) {
  const bar = document.querySelector('.progress');
  // CSS сам обмежить значення, але для ARIA потрібне коректне число
  const safe = Math.min(100, Math.max(0, Number(percent) || 0));
  bar.style.setProperty('--progress', String(percent));
  bar.setAttribute('aria-valuenow', String(safe));
}
`,
        css: `.progress {
  --progress: 0;
  width: 400px;
  height: 12px;
  border-radius: 6px;
  background: #e2e8f0;
  overflow: hidden;
}
.fill {
  height: 100%;
  width: clamp(0%, calc(var(--progress) * 1%), 100%);
  background: #22c55e;
}
`
      },
      hints: [
        'У JS: `element.style.setProperty(\'--progress\', \'25\')`.',
        'Безрозмірне число перетворюється на відсотки множенням: `calc(var(--progress) * 1%)`.',
        'Обмеження: `width: clamp(0%, calc(var(--progress) * 1%), 100%)`. Задайте `--progress: 0` за замовчуванням на `.progress`.'
      ],
      tests: [
        { name: 'setProgress(25) → 25% ширини', code: "setProgress(25);\nexpect(rect('.fill').width).toBeCloseTo(100, 0);" },
        { name: 'JS встановлює змінну, а не width', code: "setProgress(40);\nexpect($('.progress').style.getPropertyValue('--progress').trim()).toBe('40');\nexpect($('.fill').style.width).toBe('');\nexpect(rect('.fill').width).toBeCloseTo(160, 0);" },
        { name: 'значення обмежуються 0–100%', code: "setProgress(150);\nexpect(rect('.fill').width).toBeCloseTo(400, 0);\nsetProgress(-10);\nexpect(rect('.fill').width).toBeCloseTo(0, 0);" },
        { name: 'оновлюється aria-valuenow', code: "setProgress(70);\nexpect($('.progress').getAttribute('aria-valuenow')).toBe('70');\nsetProgress(120);\nexpect($('.progress').getAttribute('aria-valuenow')).toBe('100');" }
      ],
      explanation: `
**Розподіл відповідальності:** JS передає **дані** (число), а CSS вирішує, **як** їх показати. Завтра дизайнер захоче кругову діаграму — достатньо змінити CSS (\`conic-gradient(... calc(var(--progress) * 1%) ...)\`), JS лишається тим самим.

**Деталі:**
- \`calc(var(--progress) * 1%)\` — стандартний спосіб перетворити безрозмірне число на одиниці (множення на \`1%\`, \`1px\`, \`1deg\`). Зворотне (одиниці → число) без \`@property\`/нових функцій неможливе.
- \`clamp(0%, X, 100%)\` — обмеження прямо в CSS, тож навіть некоректне значення не зламає верстку.
- Значення за замовчуванням \`--progress: 0\` — без нього \`var()\` був би невизначений, і вся властивість стала б невалідною.

**Анімація:** \`transition: width .3s\` дасть плавність (width — layout-властивість, але для одного маленького елемента прийнятно; оптимальніше — \`transform: scaleX()\` з \`transform-origin: left\`). Анімувати саму змінну можна, лише зареєструвавши її: \`@property --progress { syntax: '<number>'; inherits: true; initial-value: 0; }\`.

**Доступність:** \`role="progressbar"\` + \`aria-valuemin/max/now\` (або нативний \`<progress>\`).
`
    },

    // ---------------------------------------------------------------- Сучасний CSS
    {
      id: 'cssadv-modern-css-theory', group: "modern", why: ["Так: :has — селектор «батька за вмістом».","Ні: нативний nesting не склеює рядки як &__title.","Так: шари важливіші за специфічність.","Так: логічні властивості враховують напрям письма.","Ні: @supports selector() перевіряє і селектори."],
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Сучасний CSS: :has, @layer, nesting, @supports, логічні властивості',
      tags: ['modern-css', 'has', 'layer', 'nesting'],
      question: 'Які можливості сучасного CSS ви використовуєте? Розкажіть про :has(), @layer, нативний nesting, @supports, логічні властивості та @property. Оберіть **усі** правильні твердження.',
      choices: [
        '`:has()` вибирає елемент за його вмістом або наступними сусідами, наприклад `.card:has(img)`',
        'Нативний nesting вміє конкатенацію як Sass: `&__title` усередині `.card` дає `.card__title`',
        'Шар важливіший за специфічність: клас у пізнішому `@layer` переможе `#id` з ранішого шару',
        'Логічні властивості на кшталт `margin-inline-start` автоматично враховують напрямок письма',
        '`@supports` перевіряє лише підтримку властивостей, а для селекторів такої перевірки немає'
      ],
      correct: [0, 2, 3],
      hint: 'Для кожної фічі: яку проблему розв\'язує і невеликий приклад.',
      answer: `
**\`:has()\` — «батьківський» (relational) селектор.** Вибирає елемент, якщо всередині (або після нього) є щось, що відповідає аргументу:
\`\`\`css
.card:has(img) { padding-top: 0; }
.field:has(input:invalid) label { color: red; }
h2:has(+ p) { margin-bottom: 4px; }          /* h2, за яким іде p */
body:has(dialog[open]) { overflow: hidden; }  /* блокування скролу без JS */
\`\`\`
Специфічність — як у найспецифічнішого аргументу. Підтримка — усі сучасні браузери з 2023.

**\`@layer\` — каскадні шари.** Явно задають пріоритет груп стилів **незалежно від специфічності**:
\`\`\`css
@layer reset, base, components, utilities;
@layer components { .btn { padding: 8px; } }
@layer utilities  { .p-0 { padding: 0; } }  /* перемагає, бо шар пізніший */
\`\`\`
Стилі поза шарами сильніші за будь-який шар (для звичайних оголошень). Ідеально для підключення сторонніх бібліотек (\`@import url(lib.css) layer(vendor)\`) і боротьби з «війнами специфічності».

**Нативний nesting:**
\`\`\`css
.card {
  padding: 16px;
  &:hover { box-shadow: ...; }
  .title { font-weight: 700; }
  @media (width >= 768px) { padding: 24px; }
}
\`\`\`
На відміну від Sass, немає конкатенації рядків (\`&__title\` не працює), а вкладені селектори поводяться як \`:is()\` (впливає на специфічність).

**\`@supports\` — feature queries:**
\`\`\`css
@supports (container-type: inline-size) { ... }
@supports not selector(:has(a)) { ... }
\`\`\`

**Логічні властивості** — прив'язані до напрямку письма, а не до фізичних сторін: \`margin-inline-start\` (ліворуч у LTR, праворуч у RTL), \`padding-block\`, \`inset-inline\`, \`inline-size\`/\`block-size\`, \`border-start-start-radius\`. Обов'язкові для інтернаціоналізації (арабська, іврит).

**\`@property\`** — реєстрація типізованої змінної: тип, успадкування, початкове значення. Дає анімацію градієнтів/кутів і захист від невалідних значень:
\`\`\`css
@property --angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.ring { background: conic-gradient(red var(--angle), #eee 0); transition: --angle 1s; }
\`\`\`

**Інше:** container queries, \`subgrid\`, \`clamp()/min()/max()\`, \`aspect-ratio\`, \`:is()/:where()\` (\`:where\` — нульова специфічність), \`:focus-visible\`, \`accent-color\`, \`@starting-style\`, View Transitions, Anchor Positioning, \`color-mix()\`, \`oklch()\`.

**Як впроваджувати:** перевіряти caniuse/Baseline, прогресивне покращення через \`@supports\`, autoprefixer/PostCSS для старих браузерів.
`,
      keyPoints: [
        ':has() — вибір елемента за його вмістом/наступними сусідами',
        '@layer — пріоритет шарів важливіший за специфічність; стилі поза шарами сильніші',
        'Нативний nesting: &, без конкатенації як у Sass',
        '@supports для feature detection і прогресивного покращення',
        'Логічні властивості для RTL; @property для типізованих і анімованих змінних'
      ],
      followUps: [
        'Як :has() впливає на продуктивність і специфічність?',
        'Чим :where() відрізняється від :is()?',
        'Як підключити сторонню бібліотеку стилів у шар з найнижчим пріоритетом?'
      ]
    },
    {
      id: 'cssadv-has-selector', group: "modern",
      type: 'dom',
      level: 3,
      title: ':has() — стилізація батька за станом дитини',
      tags: ['has', 'modern-css', 'forms'],
      description: `
**Завдання.** Без жодного JS, лише CSS-селектором \`:has()\`:

**Де трапляється:** стилізація форм і карток за станом без JS.

1. Картка-опція \`.option\` з **відміченим** чекбоксом отримує рамку \`#2563eb\` і фон \`#eff6ff\` (за замовчуванням рамка \`#cbd5e1\`, фон білий).
2. У поля \`.field\`, що містить **невалідний** інпут, підпис \`label\` стає червоним \`#dc2626\` (за замовчуванням \`#334155\`). Порожнє поле вважається валідним.

**Як це працює:** :has() вибирає елемент за його вмістом: .option:has(input:checked) — картка з відміченим чекбоксом. Так стилізується батько за станом дитини без JS.
`,
      html: `<label class="option">
  <input type="checkbox" class="check">
  Щомісячна розсилка
</label>

<div class="field">
  <label for="email">Email</label>
  <input id="email" type="email" class="input">
</div>`,
      css: `.option {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 260px;
  padding: 12px;
  margin-bottom: 16px;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
}
.field label {
  display: block;
  margin-bottom: 4px;
  color: #334155;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.option {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 260px;
  padding: 12px;
  margin-bottom: 16px;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
}
.option:has(.check:checked) {
  border-color: #2563eb;
  background: #eff6ff;
}
.field label {
  display: block;
  margin-bottom: 4px;
  color: #334155;
}
.field:has(input:invalid) label {
  color: #dc2626;
}
`
      },
      hints: [
        '`A:has(B)` вибирає `A`, якщо всередині є елемент, що відповідає `B`.',
        'Стани: `:checked` для чекбокса, `:invalid` для інпута (type="email" з некоректним значенням).',
        '`.option:has(.check:checked) { ... }` і `.field:has(input:invalid) label { color: #dc2626; }`'
      ],
      tests: [
        { name: 'за замовчуванням — нейтральні стилі', code: "const cb = $('.check'), inp = $('.input');\ncb.checked = false; inp.value = '';\nexpect(css('.option', 'border-top-color')).toBe('rgb(203, 213, 225)');\nexpect(css('.option', 'background-color')).toBe('rgb(255, 255, 255)');\nexpect(css('.field label', 'color')).toBe('rgb(51, 65, 85)');" },
        { name: 'відмічений чекбокс підсвічує картку', code: "const cb = $('.check');\ncb.checked = true;\ntry {\n  expect(css('.option', 'border-top-color')).toBe('rgb(37, 99, 235)');\n  expect(css('.option', 'background-color')).toBe('rgb(239, 246, 255)');\n} finally { cb.checked = false; }\nexpect(css('.option', 'border-top-color')).toBe('rgb(203, 213, 225)');" },
        { name: 'невалідний email робить підпис червоним', code: "const inp = $('.input');\ninp.value = 'not-an-email';\ntry {\n  expect(css('.field label', 'color')).toBe('rgb(220, 38, 38)');\n  inp.value = 'dev@example.com';\n  expect(css('.field label', 'color')).toBe('rgb(51, 65, 85)');\n} finally { inp.value = ''; }" },
        { name: 'використано :has()', code: "let found = false;\nfor (const sh of document.styleSheets) for (const r of sh.cssRules) if (r.selectorText && r.selectorText.includes(':has(')) found = true;\nexpect(found).toBe(true);" }
      ],
      explanation: `
\`:has()\` — перший у CSS селектор, що дивиться **вниз** (на вміст) або **вперед** (на наступних сусідів) і стилізує сам елемент. Раніше для цього потрібен був JS (\`input.addEventListener('change', () => card.classList.toggle(...))\`).

**Розбір:**
- \`.option:has(.check:checked)\` — картка, всередині якої є відмічений чекбокс;
- \`.field:has(input:invalid) label\` — підпис у полі, що містить невалідний інпут.

**UX-нюанс:** \`:invalid\` спрацьовує одразу (наприклад, для порожнього \`required\` ще до взаємодії). Сучасна альтернатива — \`:user-invalid\`: стає активним лише після того, як користувач змінив поле або спробував відправити форму.

**Ще приклади \`:has()\`:**
\`\`\`css
.grid:has(> :nth-child(5)) { grid-template-columns: repeat(3, 1fr); } /* кількісні запити */
form:has(:invalid) button[type="submit"] { opacity: .5; }
html:has(.modal[open]) { overflow: hidden; }
\`\`\`

**Нюанси:** специфічність \`:has(X)\` = специфічність X; не можна вкладати \`:has()\` у \`:has()\`; надто широкі селектори (\`body:has(...)\` з частими змінами DOM) можуть коштувати продуктивності — тримайте якір якомога ближче.
`
    },
    {
      id: 'cssadv-line-clamp', group: "modern",
      type: 'dom',
      level: 1,
      title: 'Обрізати текст до 3 рядків',
      tags: ['text-overflow', 'line-clamp'],
      description: `
**Завдання.** Анонс статті \`.excerpt\` має показувати **максимум 3 рядки** з трикрапкою в кінці. Висоту не фіксуйте: короткий текст в один рядок має займати один рядок (тест це перевірить).

**Де трапляється:** анонси статей і описи товарів у картках.

Висота рядка — 20px (вже задана).

**Як це працює:** display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden обрізає текст до 3 рядків з трикрапкою, не фіксуючи висоту.
`,
      html: `<article class="card">
  <h3>Як працює event loop</h3>
  <p class="excerpt">У цій статті ми детально розберемо, як браузер виконує JavaScript: стек викликів, черги макрозадач і мікрозадач, рендеринг між ними, requestAnimationFrame та чому setTimeout(fn, 0) не виконується миттєво. Наприкінці — типові питання зі співбесід із розбором відповідей.</p>
</article>`,
      css: `.card {
  width: 300px;
  padding: 16px;
  background: #f8fafc;
}
.card h3 {
  margin: 0 0 8px;
}
.excerpt {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.card {
  width: 300px;
  padding: 16px;
  background: #f8fafc;
}
.card h3 {
  margin: 0 0 8px;
}
.excerpt {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
`
      },
      hints: [
        '`text-overflow: ellipsis` працює лише для одного рядка. Для кількох рядків є властивість `line-clamp` (поки що з префіксом `-webkit-`).',
        'Вона працює в парі зі старим `display: -webkit-box` і `-webkit-box-orient: vertical`, плюс `overflow: hidden`.',
        '`display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden;`'
      ],
      tests: [
        { name: 'довгий текст — рівно 3 рядки', code: "expect(rect('.excerpt').height).toBeCloseTo(60, 0);" },
        { name: 'текст реально обрізаний', code: "const p = $('.excerpt');\nexpect(p.scrollHeight).toBeGreaterThan(p.clientHeight);" },
        { name: 'короткий текст займає один рядок', code: "const p = $('.excerpt');\nconst old = p.textContent;\np.textContent = 'Короткий анонс.';\ntry { expect(rect(p).height).toBeCloseTo(20, 0); } finally { p.textContent = old; }" }
      ],
      explanation: `
**Як працює:** \`-webkit-line-clamp\` обмежує кількість рядків у блоці зі старою flexbox-моделлю (\`display: -webkit-box\` + \`-webkit-box-orient: vertical\`) і додає трикрапку в кінці останнього видимого рядка. \`overflow: hidden\` ховає решту. Попри префікс, це працює в усіх сучасних браузерах і стандартизовано (стандартна \`line-clamp\` поступово з'являється).

**Чому не фіксована висота:** \`max-height: 60px; overflow: hidden\` теж обріже, але без трикрапки і з ризиком обрізати рядок навпіл, якщо зміниться шрифт чи line-height. \`max-height: calc(3 * 1lh)\` — сучасніший варіант без трикрапки.

**Однорядкова версія:**
\`\`\`css
.title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
\`\`\`

**Нюанси:**
- padding-bottom у такому блоці покаже «шматок» 4-го рядка — padding краще давати обгортці;
- повний текст варто зробити доступним (\`title\`, розгортання «Читати далі»);
- у flex-контейнері не забудьте \`min-width: 0\` для батька.
`
    },
    {
      id: 'cssadv-quiz-layer-important', group: 'modern', type: 'quiz', level: 3,
      title: '@layer і !important: порядок перевертається',
      tags: ['layer', 'cascade', 'important'],
      question: `Якого кольору буде кнопка \`<button class="btn">\`?
\`\`\`css
@layer base, components;

@layer base       { .btn { color: red !important; } }
@layer components { .btn { color: blue !important; } }

.btn { color: green !important; } /* поза шарами */
\`\`\``,
      options: ['Червоного', 'Синього', 'Зеленого', 'Залежить від порядку правил у файлі'],
      answer: 0,
      why: [
        'Так: для `!important` порядок шарів дзеркальний — найраніший шар найсильніший, а будь-який шар сильніший за `!important` поза шарами.',
        'Ні: так було б для звичайних оголошень (пізніший шар перемагає ранній), але з `!important` порядок перевертається.',
        'Ні: стилі поза шарами перемагають шари лише серед звичайних оголошень; серед `!important` вони найслабші.',
        'Ні: шари порівнюються за порядком оголошення в `@layer base, components;`, а специфічність тут однакова.'
      ],
      hint: 'Звичайні оголошення: поза шарами > пізніший шар > ранній. Що відбувається з цим порядком для `!important`?',
      explanation: 'Для звичайних оголошень пізніший шар перемагає ранній, а стилі поза шарами — будь-який шар. Для `!important` порядок дзеркальний: ранній шар сильніший за пізній, а `!important` у будь-якому шарі сильніший за `!important` поза шарами. Так задумано, щоб базовий шар (reset, бібліотека компонентів) міг захистити критичні правила, наприклад `[hidden] { display: none !important }`. Перевірено в Chrome: `rgb(255, 0, 0)`. Без `!important` у тому самому прикладі переміг би зелений (див. квіз про шари в «Основах CSS»).'
    },
    {
      id: 'cssadv-quiz-nesting', group: "modern", why: ["Ні: & — це .card, а .title стоїть перед ним.","Ні: між ними пробіл, це комбінатор нащадка.","Ні: & можна ставити будь-де.","Так: .title & = .title .card."],
      type: 'quiz',
      level: 2,
      title: 'Нативний CSS nesting і &',
      tags: ['nesting', 'modern-css'],
      question: `
Який селектор отримає правило \`color: red\`?

\`\`\`css
.card {
  color: black;
  .title & { color: red; }
}
\`\`\`
`,
      options: [
        '`.card .title`',
        '`.card.title`',
        'Помилка: `&` має стояти на початку вкладеного селектора',
        '`.title .card`'
      ],
      answer: 3,
      hint: '`&` — це посилання на батьківський селектор, і його можна ставити будь-де.',
      explanation: `
\`&\` підставляє батьківський селектор у те місце, де він стоїть: \`.title &\` → **\`.title .card\`** — картка всередині елемента \`.title\`. Так зручно описувати «стиль компонента в певному контексті».

- \`.card .title\` — це був би запис \`.title { }\` або \`& .title { }\` усередині \`.card\`.
- \`.card.title\` — \`&.title { }\` (без пробілу).
- \`&\` може стояти де завгодно, і навіть кілька разів (\`& + & { }\` → \`.card + .card\`).

**Відмінності від Sass:**
- немає конкатенації: \`&__title\` у нативному CSS **не** дасть \`.card__title\` (у Sass — дасть);
- вкладені селектори поводяться як \`:is()\`: \`.a, #b { .c & {} }\` має специфічність \`#b\` для обох;
- \`&:hover\` і \`& :hover\` — різні селектори (пробіл = нащадок).
`
    },
    {
      id: 'cssadv-quiz-logical-props', group: "modern", why: ["Ні: у RTL inline-start праворуч.","Так: inline-start у RTL — правий бік.","Ні: inline — горизонтальна вісь.","Ні: задано лише одну сторону."],
      type: 'quiz',
      level: 2,
      title: 'Логічні властивості та RTL',
      tags: ['logical-properties', 'i18n'],
      question: `
У документі з \`dir="rtl"\` (арабська, іврит) і горизонтальним письмом — з якого боку буде відступ?

\`\`\`css
.icon { margin-inline-start: 8px; }
\`\`\`
`,
      options: ['Ліворуч', 'Праворуч', 'Зверху', 'Однаково з обох боків'],
      answer: 1,
      hint: '«Start» — це початок рядка у поточному напрямку письма.',
      explanation: `
Логічні властивості прив'язані до **напрямку письма**, а не до фізичних сторін:
- \`inline\` — вісь рядка (горизонталь у звичайних мовах), \`block\` — вісь блоків (вертикаль);
- \`start\`/\`end\` — початок і кінець у поточному напрямку.

У RTL рядок починається **праворуч** → \`margin-inline-start\` = \`margin-right\`. У LTR той самий код дає \`margin-left\` — одна таблиця стилів для обох напрямків.

- «Ліворуч» — так у LTR.
- «Зверху» — це \`margin-block-start\` (у горизонтальному письмі).
- «З обох боків» — це \`margin-inline: 8px\`.

Корисні: \`padding-block\`, \`inset-inline-end\`, \`inline-size\` (= width), \`block-size\`, \`text-align: start\`, \`border-start-start-radius\`.
`
    },

    // ---------------------------------------------------------------- Архітектура CSS
    {
      id: 'cssadv-quiz-bem', group: "modern", why: ["Так: блок__елемент--модифікатор.","Ні: переплутано порядок.","Ні: дефіси не розділяють елемент і модифікатор у BEM.","Ні: це вкладені селектори, не BEM."],
      type: 'quiz',
      level: 1,
      title: 'Іменування за BEM',
      tags: ['bem', 'architecture'],
      question: 'Як за методологією BEM назвати клас для модифікатора `large` елемента `title` у блоці `card`?',
      options: ['`.card__title--large`', '`.card--title__large`', '`.card-title-large`', '`.card .title.large`'],
      answer: 0,
      hint: 'Блок__Елемент--Модифікатор.',
      explanation: `
BEM: **Block** (\`card\`) — самостійний компонент; **Element** (\`card__title\`) — частина блоку, через два підкреслення; **Modifier** (\`card__title--large\`) — варіант вигляду/стану, через два дефіси.

\`\`\`html
<article class="card card--featured">
  <h3 class="card__title card__title--large">...</h3>
</article>
\`\`\`

- \`.card--title__large\` — переставлено елемент і модифікатор.
- \`.card-title-large\` — не відрізнити блок від елемента й модифікатора.
- \`.card .title.large\` — вкладені й складені селектори: вища специфічність і залежність від структури DOM, якої BEM якраз уникає (усі селектори — один клас, специфічність 0,1,0).

Модифікатор додається **разом** з базовим класом, а не замість нього. Не створюйте «елементи елементів» (\`card__title__icon\`) — достатньо \`card__icon\`.
`
    },
    {
      id: 'cssadv-css-architecture-theory', group: "modern", why: ["Ні: BEM — лише домовленість, не ізоляція.","Так: CSS Modules дають локальні імена під час збірки.","Ні: runtime CSS-in-JS має вартість у рантаймі і проблеми з SSR.","Ні: Tailwind генерує лише використані класи.","Ні: токени задаються в конфігурації."],
      type: 'theory',
      level: 4,
      interview: true,
      title: 'BEM vs CSS Modules vs CSS-in-JS vs utility-first',
      tags: ['architecture', 'bem', 'css-modules', 'css-in-js', 'tailwind'],
      question: 'Які підходи до організації CSS ви знаєте? Порівняйте BEM, CSS Modules, CSS-in-JS та utility-first (Tailwind). Що б ви обрали для нового проєкту і чому?',
      choices: [
        'BEM дає справжню ізоляцію стилів на рівні збірки, тому колізії імен у ньому неможливі',
        'CSS Modules хешують імена класів під час збірки й дають локальну ізоляцію без runtime-витрат',
        'Runtime CSS-in-JS на кшталт styled-components — найкращий вибір для React Server Components',
        'Tailwind генерує всі можливі утиліти наперед, тому CSS-бандл росте разом із проєктом',
        'Utility-first прибирає потребу в дизайн-токенах, бо значення пишуть прямо в розмітці'
      ],
      correct: 1,
      hint: 'Яку проблему розв\'язують усі вони? Глобальний простір імен і специфічність. Далі — компроміси.',
      answer: `
**Проблема:** CSS глобальний — будь-який клас може зіткнутися з іншим, а специфічність і порядок підключення створюють непередбачувані перевизначення. Усі підходи по-різному дають **ізоляцію** і **передбачуваність**.

**BEM (методологія іменування)**
- \`.block__element--modifier\`, лише одинарні класи → пласка специфічність.
- ➕ без інструментів, зрозуміло в будь-якому стеку, добре з SSR. ➖ довгі імена, ізоляція лише «за домовленістю», мертвий CSS важко знайти.

**CSS Modules**
- Звичайний CSS, але імена класів хешуються під час збірки (\`.title\` → \`Card_title__x7a2\`), імпорт \`styles.title\` у JS.
- ➕ справжня локальна ізоляція, нуль runtime, звичний CSS (+ Sass), підтримка у Vite/webpack/Next з коробки. ➖ динамічні стилі через класи/змінні, композиція між модулями (\`composes\`) обмежена.

**CSS-in-JS** (styled-components, Emotion — runtime; vanilla-extract, Linaria, Panda — zero-runtime)
- Стилі пишуться в JS поруч із компонентом, можна використовувати пропси.
- ➕ колокація, динамічні стилі, типізація тем, автоматичне видалення невикористаного. ➖ runtime-версії додають вагу бандла й роботу при рендері (генерація стилів, вставка \`<style>\`), складнощі з SSR/streaming і React Server Components; тому тренд — zero-runtime рішення.

**Utility-first (Tailwind)**
- Атомарні класи \`flex gap-4 p-6 text-sm md:grid-cols-3\`, дизайн-токени в конфігу, JIT генерує лише використане.
- ➕ дуже швидка розробка, консистентні токени, CSS не росте з проєктом, немає проблеми іменування, мертвий код зникає разом із розміткою. ➖ «шумна» розмітка, крива навчання, складні стани/варіанти потребують \`cva\`/\`@apply\`, ризик розмазування дизайн-рішень по шаблонах.

**Як обирати:** розмір команди і проєкту, фреймворк (RSC → без runtime CSS-in-JS), наявність дизайн-системи, вимоги до продуктивності та SSR. Типові сучасні вибори: Tailwind + компонентна бібліотека; CSS Modules + custom properties для тем; zero-runtime CSS-in-JS для дизайн-систем з TypeScript.

**Незалежно від підходу:** дизайн-токени у custom properties, \`@layer\` для керування пріоритетами (reset → base → components → utilities), лінтинг (Stylelint), уникати глибоких вкладень і \`!important\`.
`,
      keyPoints: [
        'Усі підходи розв\'язують глобальний простір імен і війни специфічності',
        'BEM — домовленість про імена, без інструментів; CSS Modules — хешовані локальні класи, нуль runtime',
        'CSS-in-JS: колокація і динаміка, але runtime-вартість і проблеми з SSR/RSC; zero-runtime альтернативи',
        'Utility-first: швидкість, токени, малий CSS, але шумна розмітка',
        'Вибір залежить від команди, фреймворку, SSR і дизайн-системи; токени в custom properties, @layer'
      ],
      followUps: [
        'Чому runtime CSS-in-JS погано поєднується з React Server Components?',
        'Як у Tailwind організувати варіанти компонента (кнопка primary/secondary, розміри)?',
        'Як ви боретеся з мертвим CSS у великому проєкті?'
      ]
    },
    {
      id: 'cssadv-critical-css-theory', group: "modern", why: ["Так: без CSSOM браузер не знає, як малювати.","Так: inline critical CSS + асинхронне решти.","Ні: CSS для іншого media не блокує рендер.","Ні: @import створює послідовні запити.","Ні: inline-стилі кешуються лише разом з HTML."],
      type: 'theory',
      level: 3,
      title: 'Critical CSS і завантаження стилів',
      tags: ['performance', 'critical-css', 'rendering'],
      question: 'Чому CSS блокує рендеринг? Що таке critical CSS і які ще є способи пришвидшити завантаження стилів? Оберіть **усі** правильні твердження.',
      choices: [
        'Перший рендер чекає на весь CSS для поточного медіа, бо без CSSOM не побудувати render tree',
        'Critical CSS — стилі першого екрана, вбудовані в `<style>` у `<head>`; решта вантажиться асинхронно',
        '`<link rel="stylesheet" media="print">` блокує рендер на екрані так само, як звичайний stylesheet',
        '`@import` у CSS пришвидшує завантаження, бо браузер паралельно тягне всі вкладені файли',
        'Інлайн critical CSS кешується браузером окремо від HTML, тому його розмір майже не важливий'
      ],
      correct: [0, 1],
      hint: 'Browser не може намалювати сторінку без CSSOM. Що потрібно для першого екрана?',
      answer: `
**CSS — render-blocking ресурс.** Браузер будує DOM і CSSOM; рендер-дерево (і перше відображення) можливе лише коли **весь** CSS, що стосується поточного медіа, завантажено і розібрано. Інакше користувач побачив би неоформлений контент (FOUC). Також CSS блокує виконання синхронних скриптів, що йдуть після нього (скрипт може читати стилі).

**Critical CSS** — мінімальний набір стилів для **першого екрана** (above the fold), вбудований прямо в \`<style>\` у \`<head>\`. Решта стилів підвантажується асинхронно:
\`\`\`html
<style>/* critical: каркас, шапка, hero, шрифти */</style>
<link rel="preload" href="/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/main.css"></noscript>
\`\`\`
Перший рендер не чекає мережевого запиту → кращі **FCP** і **LCP**. Інструменти: critical, Critters (Angular/Next), penthouse; багато SSR-фреймворків роблять це автоматично для CSS-in-JS/CSS Modules.

**Компроміси:** вбудований CSS не кешується окремо і збільшує HTML (тримайте його в межах ~14 КБ першого TCP-вікна); дублювання стилів; складно підтримувати вручну.

**Інші техніки:**
- \`media\` на \`<link>\`: \`<link rel="stylesheet" href="print.css" media="print">\` — не блокує рендер для screen;
- розбиття CSS по маршрутах/компонентах (code splitting), видалення невикористаного (PurgeCSS, Tailwind JIT);
- мініфікація, стиснення (Brotli), довге кешування з хешем у імені;
- уникати \`@import\` у CSS (послідовні запити — «водоспад»);
- шрифти: \`font-display: swap\`, \`preload\` для ключових, \`size-adjust\` проти CLS;
- \`content-visibility: auto\` для важких блоків нижче першого екрана;
- HTTP/2 і \`103 Early Hints\` / \`preload\` для раннього старту завантаження.

**Як міряти:** Lighthouse («Eliminate render-blocking resources», «Reduce unused CSS»), вкладка Coverage у DevTools, Web Vitals (FCP, LCP, CLS).
`,
      keyPoints: [
        'CSS блокує рендеринг: без CSSOM немає render tree',
        'Critical CSS — інлайн стилі першого екрана, решта — асинхронно (preload/onload)',
        'Компроміси: немає кешу для інлайну, розмір HTML, підтримка',
        'media-атрибут, code splitting, видалення невикористаного, уникати @import',
        'Метрики FCP/LCP, інструменти Lighthouse і Coverage'
      ],
      followUps: [
        'Чому @import у CSS погіршує продуктивність?',
        'Чи блокує CSS виконання JavaScript?',
        'Як font-display впливає на CLS і FOIT/FOUT?'
      ]
    },
    {
      id: 'cssadv-dark-theme', group: 'theming', type: 'dom', level: 2,
      title: 'Темна тема: системна + перемикач',
      tags: ['theme', 'prefers-color-scheme', 'custom-properties'],
      description: `
**Завдання.** Налаштуйте теми через CSS-змінні:
1. \`:root\` — світлі значення (\`--bg: #ffffff\`, \`--text: #1f2937\`) і \`color-scheme: light dark\`;
2. \`[data-theme="dark"]\` — темні значення (\`--bg: #0f172a\`, \`--text: #e5e7eb\`) і \`color-scheme: dark\`;
3. \`@media (prefers-color-scheme: dark)\` — ті самі темні значення для \`:root:not([data-theme="light"])\`.

**Де трапляється:** майже кожен сучасний інтерфейс: за замовчуванням тема як у системі, а перемикач на сайті має пріоритет.

**Як це працює:** компоненти використовують лише змінні (\`var(--bg)\`), а тема — це перевизначення змінних. \`:not([data-theme="light"])\` не дає системній темній темі перебити явний вибір «світла». \`color-scheme\` підказує браузеру, як фарбувати скролбари і стандартні поля форм.
`,
      html: `<main class="page">
  <h1>Налаштування</h1>
  <p>Текст сторінки.</p>
  <input placeholder="Поле вводу">
</main>`,
      css: `:root {
  --bg: #ffffff;
  --text: #1f2937;
  /* TODO: color-scheme */
}

/* TODO: [data-theme="dark"] — темні значення і color-scheme: dark */

/* TODO: @media (prefers-color-scheme: dark) для :root:not([data-theme="light"]) */

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
}
.page { padding: 24px; }
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `:root {
  --bg: #ffffff;
  --text: #1f2937;
  color-scheme: light dark;
}

[data-theme="dark"] {
  --bg: #0f172a;
  --text: #e5e7eb;
  color-scheme: dark;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0f172a;
    --text: #e5e7eb;
  }
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
}
.page { padding: 24px; }
`
      },
      hints: ['Атрибут ставиться на `<html>`: `[data-theme="dark"]` має ту саму специфічність, що й `:root`, тому має йти **після** нього.', 'Усередині `@media (prefers-color-scheme: dark) { ... }` — селектор `:root:not([data-theme="light"])`.'],
      tests: [
        { name: 'за замовчуванням — як у системі', code: "const sysDark = matchMedia('(prefers-color-scheme: dark)').matches;\nexpect(css('body', 'background-color')).toBe(sysDark ? 'rgb(15, 23, 42)' : 'rgb(255, 255, 255)');\nexpect(getComputedStyle(document.documentElement).colorScheme).toBe('light dark');" },
        { name: 'явна світла тема перемагає системну', code: "const root = document.documentElement;\nroot.dataset.theme = 'light';\ntry {\n  expect(css('body', 'background-color')).toBe('rgb(255, 255, 255)');\n} finally { delete root.dataset.theme; }" },
        { name: 'перемикач data-theme="dark"', code: "const root = document.documentElement;\nroot.dataset.theme = 'dark';\ntry {\n  expect(css('body', 'background-color')).toBe('rgb(15, 23, 42)');\n  expect(css('body', 'color')).toBe('rgb(229, 231, 235)');\n  expect(getComputedStyle(root).colorScheme).toBe('dark');\n} finally { delete root.dataset.theme; }" },
        { name: 'системна темна тема не перебиває явну світлу', code: "const rules = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch (e) { return []; } });\nconst m = rules.find((r) => r.media && /prefers-color-scheme:\\s*dark/.test(r.media.mediaText));\nexpect(m).toBeTruthy();\nconst inner = [...m.cssRules].find((r) => /:root:not\\(\\[data-theme=\"?light\"?\\]\\)/.test(r.selectorText));\nexpect(inner).toBeTruthy();\nexpect(inner.style.getPropertyValue('--bg').trim()).toBe('#0f172a');" }
      ],
      explanation: 'Повна схема теми: (1) системна за замовчуванням через `prefers-color-scheme`; (2) явний вибір у `data-theme` на `<html>`, збережений у `localStorage`; (3) маленький інлайн-скрипт у `<head>` ставить атрибут **до** першого кадру — інакше буде «спалах» світлої теми. Так зроблено і в цьому тренажері. Сучасна альтернатива для простих випадків — функція `light-dark(#fff, #0f172a)`, яка працює разом із `color-scheme`.'
    },
    {
      id: 'cssadv-color-scheme', group: 'theming', type: 'quiz', level: 2,
      title: 'Що робить color-scheme',
      question: 'Що змінить рядок `:root { color-scheme: light dark; }` на сторінці, де ще немає власних стилів для темної теми?',
      options: [
        'Перефарбує всі ваші власні кольори в темні, якщо в системі ввімкнена темна тема',
        'Стандартні елементи (фон, скролбари, поля форм) підлаштуються під системну тему',
        'Примусово ввімкне темну тему для всіх користувачів незалежно від налаштувань',
        'Нічого не змінить: ця властивість впливає лише на зображення і відео'
      ],
      answer: 1,
      why: [
        'Ні: ваші кольори браузер не змінює — лише системні й стандартні.',
        'Так: це підказка, які схеми сторінка підтримує.',
        'Ні: `light dark` означає «підтримую обидві», вибір за користувачем.',
        'Ні: зображення не змінюються.'
      ],
      hint: 'Хто фарбує скролбар, чекбокс і фон сторінки за замовчуванням?',
      explanation: '`color-scheme` повідомляє браузеру, які схеми підтримує сторінка. Від цього залежать стандартні кольори (Canvas, CanvasText), скролбари, поля форм, а також `light-dark()`. Без цієї властивості в темній темі на темному фоні можна побачити білі нативні поля вводу. Аналог у HTML — `<meta name="color-scheme" content="light dark">`: він діє ще до завантаження CSS.'
    },
    {
      id: 'cssadv-oklch', group: 'theming', type: 'quiz', level: 3,
      title: 'Чому палітри будують в oklch',
      question: 'Дизайн-система генерує 10 відтінків бренд-кольору кроком однакової «світлості». Чому для цього дедалі частіше беруть `oklch()`, а не `hsl()`?',
      options: [
        'Бо функція `hsl()` не підтримує прозорість і альфа-канал',
        'Однаковий L в oklch сприймається як однакова яскравість',
        'Бо кольори в oklch браузер рендерить помітно швидше',
        'Бо oklch — єдиний формат, який розуміє функція `color-mix()`'
      ],
      answer: 1,
      why: [
        'Ні: `hsl(220 80% 50% / 0.5)` підтримує прозорість.',
        'Так: у hsl жовтий і синій з L 50% виглядають дуже різними за яскравістю.',
        'Ні: швидкість рендерингу однакова.',
        'Ні: `color-mix()` працює в багатьох просторах (srgb, oklab, oklch…).'
      ],
      hint: 'Порівняйте `hsl(60 100% 50%)` (жовтий) і `hsl(240 100% 50%)` (синій). Однаково яскраві?',
      explanation: '`oklch(L C H)` — перцептивно рівномірний простір: L — світлість, C — насиченість, H — відтінок. Палітри й контраст передбачуваніші, а ще доступні кольори широкого гамуту (P3). Практичний прийом для станів кнопки: `background: color-mix(in oklch, var(--brand), black 15%)` — hover без окремого токена.'
    },
    {
      id: 'cssadv-filters', group: 'theming', type: 'theory', level: 3,
      title: 'filter, backdrop-filter, mix-blend-mode',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        '`backdrop-filter: blur()` розмиває те, що **позаду** елемента, тому фону елемента потрібна прозорість',
        '`filter: drop-shadow()` повторює форму прозорого PNG чи SVG, а `box-shadow` — лише прямокутник рамки',
        '`filter: blur()` на великому елементі під час анімації нічого не коштує: результат рахується один раз',
        'Елемент з `filter` (не `none`) стає containing block для нащадків з `position: fixed`',
        '`mix-blend-mode` змінює лише колір тексту елемента'
      ],
      correct: [0, 1, 3],
      why: [
        'Так: ефект «матового скла» видно лише крізь напівпрозорий фон.',
        'Так: drop-shadow враховує альфа-канал.',
        'Ні: при зміні кадрів фільтр перераховується — на великих площах це дорого.',
        'Так: несподіваний побічний ефект — fixed-нащадок «прилипає» до елемента, а не до вікна.',
        'Ні: змішується весь вміст елемента з тим, що під ним.'
      ],
      hint: 'Пригадайте ефект «матового скла» в меню macOS. Що саме там розмито?',
      answer: `
| Властивість | Що робить | Нюанси |
|---|---|---|
| \`filter\` | ефекти **самого елемента**: \`blur\`, \`brightness\`, \`grayscale\`, \`drop-shadow\` | створює контекст накладання і containing block для \`fixed\`/\`absolute\` нащадків |
| \`backdrop-filter\` | ефекти **фону позаду** елемента | потрібен напівпрозорий фон; дорогий на великих площах |
| \`mix-blend-mode\` | змішування елемента з тим, що під ним (\`multiply\`, \`screen\`…) | \`isolation: isolate\` на батьку обмежує змішування |

**Продуктивність:** \`blur\` на великих площах і анімований \`backdrop-filter\` навантажують GPU. На слабких пристроях краще статичний ефект і \`@media (prefers-reduced-transparency: reduce)\`.

**Пастка:** модальне вікно з \`position: fixed\` усередині батька з \`filter\` чи \`transform\` позиціонується відносно батька. Тому модалки рендерять у кінець \`body\` (портал) або в top layer (\`<dialog>\`, popover).
`,
      keyPoints: [
        'filter — сам елемент, backdrop-filter — фон позаду',
        'drop-shadow враховує форму за альфа-каналом',
        'filter і transform створюють containing block для fixed-нащадків',
        'Blur на великих площах дорогий'
      ]
    },
    {
      id: 'cssadv-fouc-theme', group: 'theming', type: 'quiz', level: 3,
      title: 'Білий спалах перед темною темою',
      question: 'Користувач обрав темну тему (збережено в `localStorage`). Під час завантаження він на мить бачить білу сторінку, потім вона темніє. Тему застосовує модуль `app.js` з `type="module"`. Як прибрати спалах?',
      options: [
        'Додати `transition: background 0.3s` на body, щоб перехід був плавним',
        'Інлайн-скрипт у `<head>`, що ставить `data-theme` до першого кадру',
        'Перенести підключення `app.js` у самий кінець `<body>`',
        'Застосовувати збережену тему в обробнику `window.onload`'
      ],
      answer: 1,
      why: [
        'Ні: спалах стане плавним, але залишиться.',
        'Так: блокуючий скрипт у head виконується до рендерингу — перший кадр уже правильний.',
        'Ні: модуль і так виконується після парсингу — уже після першого кадру.',
        'Ні: це ще пізніше — після завантаження всіх ресурсів.'
      ],
      hint: 'Що має статися **до** першого відмальованого кадру?',
      explanation: 'Це різновид **FOUC** (flash of unstyled/incorrect content). Класичний FOUC — коли CSS підвантажується пізно: стилі в `<head>` блокують рендеринг саме для того, щоб його уникнути. Для теми: синхронний скрипт `<script>document.documentElement.dataset.theme = localStorage.getItem(\'theme\') || \'\'</script>` у `<head>` + `color-scheme`. Для SSR — cookie з темою і атрибут, відрендерений сервером.'
    },
    {
      id: 'cssadv-scroll-snap', group: 'scroll-transitions', type: 'dom', level: 2,
      title: 'Карусель на scroll-snap без JavaScript',
      tags: ['scroll-snap', 'flex', 'overflow'],
      description: `
**Завдання.** Перетворіть \`.carousel\` на горизонтальну карусель:
- слайди в один ряд, кожен шириною **на всю** каруселі (400px), без стискання;
- горизонтальна прокрутка (\`overflow-x: auto\`);
- прокрутка «прилипає» до початку слайда: \`scroll-snap-type: x mandatory\` на контейнері, \`scroll-snap-align: start\` на слайдах.

**Де трапляється:** галереї товарів, онбординг, сторіз. Свайпи на мобільних, інерційна прокрутка і клавіатура працюють нативно — без бібліотек.

**Як це працює:** \`scroll-snap-type: x mandatory\` на контейнері прокрутки вмикає «прилипання», а \`scroll-snap-align\` на дітях задає точку, до якої браузер докручує після жесту. Це нативна поведінка без JavaScript і бібліотек каруселей; \`scroll-padding\` враховує липкі заголовки.
`,
      html: `<div class="carousel">
  <div class="slide">1</div>
  <div class="slide">2</div>
  <div class="slide">3</div>
  <div class="slide">4</div>
</div>`,
      css: `.carousel {
  width: 400px;
  /* TODO: ряд, горизонтальна прокрутка, snap */
}
.slide {
  height: 200px;
  display: grid;
  place-items: center;
  font: 700 48px sans-serif;
  background: #e0e7ff;
  border: 1px solid #fff;
  box-sizing: border-box;
  /* TODO: ширина на весь контейнер без стискання, snap-align */
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.carousel {
  width: 400px;
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.slide {
  height: 200px;
  display: grid;
  place-items: center;
  font: 700 48px sans-serif;
  background: #e0e7ff;
  border: 1px solid #fff;
  box-sizing: border-box;
  flex: 0 0 100%;
  scroll-snap-align: start;
}
`
      },
      hints: ['Ряд — `display: flex`. Щоб flex не стискав слайди: `flex: 0 0 100%`.', 'Контейнер: `overflow-x: auto; scroll-snap-type: x mandatory`; слайди: `scroll-snap-align: start`.'],
      tests: [
        { name: 'слайди в один ряд на всю ширину', code: "const s = $$('.slide');\nexpect(rect(s[0]).width).toBeCloseTo(400, 0);\nexpect(rect(s[1]).left - rect(s[0]).left).toBeCloseTo(400, 0);\nexpect(rect(s[1]).top).toBe(rect(s[0]).top);" },
        { name: 'горизонтальна прокрутка', code: "expect(css('.carousel', 'overflow-x')).toBe('auto');\nconst c = $('.carousel');\nexpect(c.scrollWidth).toBeGreaterThan(c.clientWidth);" },
        { name: 'scroll-snap', code: "expect(css('.carousel', 'scroll-snap-type')).toBe('x mandatory');\nexpect(css('.slide', 'scroll-snap-align')).toBe('start');" }
      ],
      explanation: '`mandatory` — прокрутка завжди зупиняється на точці прив\'язки, `proximity` — лише поблизу неї. Корисні доповнення: `scroll-behavior: smooth` для кнопок «вперед/назад» (`carousel.scrollBy({ left: 400 })`), `scroll-padding` для відступів, `overscroll-behavior-x: contain`, щоб свайп не гортав сторінку назад. Доступність: кнопки з `aria-label` і `aria-roledescription="carousel"`; автопрокрутку — лише з паузою.'
    },
    {
      id: 'cssadv-view-transitions', group: 'scroll-transitions', type: 'quiz', level: 3,
      title: 'View Transitions і браузери без підтримки',
      question: `
Перехід між екранами анімується так:
\`\`\`js
document.startViewTransition(() => renderPage(next));
\`\`\`
У браузері без View Transitions API сторінка падає з \`TypeError\`. Як правильно?
`,
      options: [
        'Обгорнути виклик у `try/catch` і просто ігнорувати помилку',
        'Перевірити `navigator.userAgent` і викликати API лише в Chrome',
        '`if (!document.startViewTransition) return renderPage(next);`',
        'Відмовитися від API, поки його не підтримають усі браузери'
      ],
      answer: 2,
      why: [
        'Ні: помилка виникне до виклику renderPage — сторінка просто не оновиться.',
        'Ні: UA-sniffing ненадійний; перевіряють саму можливість.',
        'Так: feature detection + progressive enhancement.',
        'Ні: progressive enhancement дає анімацію тим, хто її підтримує, нічого не ламаючи іншим.'
      ],
      hint: 'Перевіряти браузер чи перевіряти наявність потрібної функції?',
      explanation: '`startViewTransition(update)` знімає «знімок» старого стану, виконує `update`, і браузер анімує перехід через псевдоелементи `::view-transition-old(root)` і `::view-transition-new(root)`. `view-transition-name` на окремих елементах дає «морфінг» картки в деталі. Для переходів між документами (MPA) — CSS `@view-transition { navigation: auto; }`. Повагу до `prefers-reduced-motion` вмикають вимкненням анімацій цих псевдоелементів.'
    },
    {
      id: 'cssadv-print', group: 'scroll-transitions', type: 'dom', level: 2,
      title: 'Стилі для друку',
      tags: ['@media print', 'break-inside'],
      description: `
**Завдання.** Додайте \`@media print\`:
- приховати \`nav\` і все з класом \`.no-print\` (\`display: none\`);
- після зовнішніх посилань \`a[href^="http"]\` виводити адресу: \`content: " (" attr(href) ")"\` у \`::after\`;
- картки \`.card\` не розривати між сторінками: \`break-inside: avoid\`;
- \`body\`: чорний текст на білому (\`color: #000; background: #fff\`).

**Де трапляється:** рахунки, квитки, інструкції, статті, які друкують або зберігають у PDF.

**Як це працює:** правила всередині \`@media print\` діють лише під час друку і в «Зберегти як PDF». Зазвичай там ховають навігацію й рекламу, ставлять темний текст на білому тлі, а \`break-inside: avoid\` не дає розірвати блок між сторінками.
`,
      html: `<nav>Головна · Каталог · Кошик</nav>
<article>
  <h1>Замовлення №1042</h1>
  <div class="card">Товар: навушники — 2 499 грн</div>
  <div class="card">Доставка: Нова пошта — 80 грн</div>
  <p>Умови: <a href="https://shop.example/terms">правила магазину</a></p>
  <button class="no-print">Оплатити</button>
</article>`,
      css: `body { font-family: sans-serif; color: #e5e7eb; background: #111827; }
.card { padding: 12px; margin: 8px 0; border: 1px solid #374151; }

@media print {
  /* TODO */
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `body { font-family: sans-serif; color: #e5e7eb; background: #111827; }
.card { padding: 12px; margin: 8px 0; border: 1px solid #374151; }

@media print {
  nav,
  .no-print {
    display: none;
  }
  a[href^="http"]::after {
    content: " (" attr(href) ")";
  }
  .card {
    break-inside: avoid;
  }
  body {
    color: #000;
    background: #fff;
  }
}
`
      },
      hints: ['Усе всередині одного блоку `@media print { ... }`.', '`a[href^="http"]::after { content: " (" attr(href) ")"; }` — `attr()` у `content` працює у всіх браузерах.'],
      tests: [
        { name: 'на екрані нічого не змінилось', code: "expect(css('nav', 'display')).not.toBe('none');\nexpect(css('.no-print', 'display')).not.toBe('none');" },
        { name: 'у друці приховано nav і .no-print', code: "const rules = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch (e) { return []; } });\nconst p = rules.find((r) => r.media && r.media.mediaText === 'print');\nexpect(p).toBeTruthy();\nconst inner = [...p.cssRules];\nconst hide = inner.filter((r) => r.style && r.style.display === 'none').map((r) => r.selectorText).join(',');\nexpect(hide).toContain('nav');\nexpect(hide).toContain('.no-print');" },
        { name: 'адреси посилань, картки без розривів, контраст', code: "const rules = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch (e) { return []; } });\nconst inner = [...rules.find((r) => r.media && r.media.mediaText === 'print').cssRules];\nconst after = inner.find((r) => /a\\[href\\^=\"?http\"?\\]::after/.test(r.selectorText));\nexpect(after && after.style.content).toContain('attr(href)');\nconst card = inner.find((r) => r.selectorText === '.card');\nexpect(card && card.style.getPropertyValue('break-inside')).toBe('avoid');\nconst body = inner.find((r) => r.selectorText === 'body');\nexpect(body && body.style.color).toBe('rgb(0, 0, 0)');" }
      ],
      explanation: 'Чек-лист друку: прибрати навігацію, кнопки й рекламу; показати адреси посилань; заборонити розриви карток і таблиць (`break-inside: avoid`); заголовки не залишати внизу сторінки (`break-after: avoid`); `@page { margin: 2cm; }` для полів. Перевірка: DevTools → Rendering → Emulate CSS media type: print. Друк можна викликати й з JS: `window.print()`, подія `beforeprint`.'
    }
  ]
});
