FE.topic('css-basics', {
  intro: `
## Селектори

| Селектор | Що вибирає |
|---|---|
| \`div p\` | p — будь-який нащадок div |
| \`div > p\` | p — прямий дочірній div |
| \`h2 + p\` | p одразу після h2 (сусід) |
| \`h2 ~ p\` | усі p після h2 на тому ж рівні |
| \`[href^="https"]\` / \`$=".pdf"\` / \`*="docs"\` | починається / закінчується / містить |
| \`[class~="btn"]\` / \`[lang\\|="en"]\` | слово у списку / \`en\` або \`en-…\` |
| \`[href$=".pdf" i]\` | без урахування регістру |

**Pseudo-classes** (стан): \`:hover\`, \`:focus-visible\`, \`:checked\`, \`:disabled\`, \`:first-child\`, \`:nth-child(2n+1)\`, \`:nth-of-type()\`, \`:not()\`, \`:is()\`, \`:where()\`, \`:has()\`, \`:empty\`.
**Pseudo-elements** (частина елемента): \`::before\`/\`::after\` (потрібен \`content\`), \`::placeholder\`, \`::marker\`, \`::first-line\`, \`::selection\`.

- \`:nth-child(2)\` — другий **серед усіх** дітей (і він ще має підходити під селектор); \`:nth-of-type(2)\` — другий **серед свого тегу**.
- \`-n+3\` — перші три; \`n+4\` — з четвертого; \`2n\`/\`even\`; \`2n+1\`/\`odd\`.

## Специфічність (a, b, c)

| | a | b | c |
|---|---|---|---|
| \`#id\` | 1 | | |
| \`.class\`, \`[attr]\`, \`:hover\` | | 1 | |
| \`div\`, \`::before\` | | | 1 |
| \`*\`, комбінатори, \`:where()\` | 0 | 0 | 0 |

\`:is()\`, \`:not()\`, \`:has()\` — специфічність **найспецифічнішого** аргументу. Inline \`style\` перемагає будь-які селектори; \`!important\` — перемагає inline.

## Каскад (від сильнішого)

1. Походження та важливість: transitions → \`!important\` UA → \`!important\` user → \`!important\` author → animations → author → user → UA.
2. Inline-стилі (\`style=""\`).
3. **@layer**: для звичайних — пізніший шар сильніший, **поза шарами — найсильніші**; для \`!important\` — навпаки.
4. Специфічність.
5. Порядок у коді — останнє правило перемагає.

**Успадковане значення завжди програє будь-якому прямому правилу**, навіть \`*\`.

## Успадкування

Успадковуються переважно текстові: \`color\`, \`font-*\`, \`line-height\`, \`text-align\`, \`visibility\`, \`cursor\`, \`list-style\`. Не успадковуються: \`margin\`, \`padding\`, \`border\`, \`background\`, \`width\`, \`display\`, \`position\`.
Ключові слова: \`inherit\`, \`initial\` (початкове за специфікацією: \`display: initial\` → **inline**!), \`unset\`, \`revert\` (до стилів браузера), \`revert-layer\`.

## Box model

\`\`\`css
*, *::before, *::after { box-sizing: border-box; } /* width включає padding і border */
\`\`\`
- **Margin collapsing** (лише вертикальні, лише в блочному потоці): сусіди → max(30, 20) = 30; батько + перша/остання дитина без padding/border/BFC; порожній блок. Не колапсують у flex/grid, з \`display: flow-root\`, \`overflow ≠ visible\`, padding/border.
- Inline-елементи ігнорують \`width\`/\`height\` і вертикальні \`margin\`.

## Приховування

| | Місце | Кліки | Screen reader | Анімується |
|---|---|---|---|---|
| \`display: none\` | ✗ | ✗ | ✗ | ✗ (крім нових API) |
| \`visibility: hidden\` | ✓ | ✗ | ✗ | ✓ |
| \`opacity: 0\` | ✓ | ✓ | ✓ | ✓ |

## Одиниці

\`em\` — від font-size **батька** (для font-size) або власного (для інших властивостей) → накопичується при вкладенні; \`rem\` — від \`html\`; \`%\` у \`padding/margin\` — від **ширини** контейнера; \`vh\` vs \`dvh\` (мобільна адресна панель); \`ch\` — ширина «0».
`,
  groups: [
    {
      id: 'selectors',
      title: 'Селектори і комбінатори'
    },
    {
      id: 'pseudo',
      title: 'Псевдокласи та псевдоелементи'
    },
    {
      id: 'specificity',
      title: 'Специфічність'
    },
    {
      id: 'cascade',
      title: 'Каскад: !important, inline, @layer'
    },
    {
      id: 'inheritance',
      title: 'Успадкування'
    },
    {
      id: 'box-model',
      title: 'Box model і схлопування margin'
    },
    {
      id: 'display',
      title: 'display, переповнення, приховування'
    },
    {
      id: 'units',
      title: 'Одиниці та значення'
    }
  ],
  items: [
    {
      id: 'css-quiz-combinators',
      group: 'selectors',
      type: 'quiz',
      level: 1,
      title: 'Комбінатор ~ (загальні брати)',
      tags: ['selectors'],
      question: `
**Як це працює:** комбінатори задають звʼязок: \`A B\` — нащадок на будь-якій глибині, \`A > B\` — пряма дитина, \`A + B\` — брат одразу після A, \`A ~ B\` — усі брати після A (той самий батько).

Які абзаци стануть червоними?

\`\`\`html
<div class="box">
  <p>A</p>
  <h2>Заголовок</h2>
  <p>B</p>
  <section><p>C</p></section>
  <p>D</p>
</div>
\`\`\`
\`\`\`css
h2 ~ p { color: red; }
\`\`\`
`,
      options: ['Лише B', 'B і D', 'B, C і D', 'A, B і D'],
      answer: 1,
      why: [
        '`h2 + p` вибрав би лише B, а `~` бере всіх наступних братів.',
        'Так: B і D — брати h2 (батько `.box`), що стоять після нього; section між ними не заважає.',
        'C лежить усередині `section`, тобто він не брат h2, а нащадок брата.',
        'A стоїть до h2, а `~` дивиться лише вперед.'
      ],
      hint: '`~` вибирає братів (той самий батько), які йдуть **після** елемента.',
      explanation: `
\`h2 ~ p\` — усі \`p\` з тим самим батьком, що й \`h2\`, які йдуть **після** нього. Попередніх братів класичними комбінаторами не вибрати — лише через \`:has()\`: \`p:has(~ h2)\`.
`
    },
    {
      id: 'css-quiz-attr-selectors',
      group: 'selectors',
      type: 'quiz',
      level: 2,
      title: 'Атрибутні селектори',
      tags: ['selectors'],
      question: `
**Як це працює:** \`[attr=v]\` — точний збіг усього значення, \`^=\` починається, \`$=\` закінчується, \`*=\` містить, \`~=\` одне слово зі списку через пробіл, \`|=\` дорівнює або починається з \`v-\`. Значення чутливі до регістру; прапорець \` i\` це вимикає.

Оберіть **усі** селектори, що збігаються з цим елементом:

\`\`\`html
<a href="https://docs.example.com/guide.PDF" class="link link--external" lang="en-US">Guide</a>
\`\`\`
`,
      options: [
        '`a[href^="https"]`',
        '`a[href$=".pdf"]`',
        '`a[href$=".pdf" i]`',
        '`a[class="link"]`',
        '`a[class~="link"]`',
        '`a[lang|="en"]`'
      ],
      answer: [0, 2, 4, 5],
      why: [
        'Так: значення `href` починається з `https`.',
        'Ні: файл закінчується на `.PDF`, а без прапорця `i` регістр має значення.',
        'Так: прапорець `i` вимикає чутливість до регістру.',
        'Ні: `=` порівнює весь рядок `"link link--external"`, а не одне слово.',
        'Так: `~=` шукає слово у списку через пробіл — саме так працює `.link`.',
        'Так: `|=` збігається з `en` або з `en-…`.'
      ],
      hint: 'Значення атрибутів порівнюються з урахуванням регістру. `=` — точний збіг **усього** значення.',
      explanation: `
Атрибутні селектори мають вагу класу (0,1,0). Типові застосування: \`a[href^="http"]\`, \`[aria-expanded="true"]\`, \`input[type="checkbox"]\`, \`[data-state="open"]\`.
`
    },
    {
      id: 'css-external-links',
      group: 'selectors',
      type: 'dom',
      level: 1,
      title: 'Стилізувати посилання за атрибутами',
      tags: ['selectors', 'attributes'],
      description: `
**Завдання.** Не змінюючи HTML і не додаючи класів, стилізуйте посилання за значенням \`href\`.

**Де трапляється:** позначити зовнішні посилання й файли в статтях та футері — розмітка приходить із CMS без класів.

**Дано**
\`\`\`html
<nav class="links">
  <a href="/about">…</a> <a href="#contacts">…</a>       <!-- внутрішні -->
  <a href="https://github.com/acme">…</a> <a href="http://old.example.com">…</a>
  <a href="/files/price.pdf">…</a> <a href="mailto:hi@acme.com">…</a>
</nav>
\`\`\`

**Що написати** (лише CSS)
- зовнішні (\`href\` починається з \`http://\` або \`https://\`): \`color: #dc2626\` + значок \` ↗\` через \`::after\`;
- PDF (\`href\` закінчується на \`.pdf\`): \`font-weight: 700\`;
- \`mailto:\`: \`text-decoration: none\`;
- внутрішні лишаються \`#2563eb\`, підкреслені, без значка.

**Як це працює:** \`[href^="…"]\` — починається з, \`[href$="…"]\` — закінчується на. \`.links a[href^="https://"]\` має вагу (0,2,1) і перемагає базове \`.links a\` (0,1,1).

**Врахуйте:** зовнішніх префіксів два — потрібен список селекторів через кому.
`,
      html: `<nav class="links">
  <a href="/about">Про нас</a>
  <a href="#contacts">Контакти</a>
  <a href="https://github.com/acme">GitHub</a>
  <a href="http://old.example.com">Старий сайт</a>
  <a href="/files/price.pdf">Прайс (PDF)</a>
  <a href="mailto:hi@acme.com">Написати</a>
</nav>`,
      css: `.links a {
  display: block;
  margin-bottom: 6px;
  color: #2563eb;
  font-family: system-ui, sans-serif;
}

/* 1. Зовнішні (http:// і https://): червоний колір */
/* TODO */

/* 2. Значок " ↗" для зовнішніх через ::after { content: ... } */
/* TODO */

/* 3. PDF — жирні */
/* TODO */

/* 4. mailto: — без підкреслення */
/* TODO */
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.links a {
  display: block;
  margin-bottom: 6px;
  color: #2563eb;
  font-family: system-ui, sans-serif;
}

/* зовнішні: http:// і https:// */
.links a[href^="http://"],
.links a[href^="https://"] {
  color: #dc2626;
}
.links a[href^="http://"]::after,
.links a[href^="https://"]::after {
  content: " ↗";
}

/* PDF (з урахуванням .PDF у верхньому регістрі) */
.links a[href$=".pdf" i] {
  font-weight: 700;
}

.links a[href^="mailto:"] {
  text-decoration: none;
}
`
      },
      hints: [
        '`a[href^="https://"]` — починається з, `a[href$=".pdf"]` — закінчується на.',
        'Два префікси — список: `.links a[href^="http://"], .links a[href^="https://"] { … }`, і такий самий для `::after`.'
      ],
      tests: [
        { name: 'зовнішні посилання червоні', code: 'const ext = $$(\'.links a\').filter(a => /^https?:\\/\\//.test(a.getAttribute(\'href\')));\nexpect(ext).toHaveLength(2);\next.forEach(a => expect(css(a, \'color\')).toBe(\'rgb(220, 38, 38)\'));' },
        { name: 'у зовнішніх є значок ↗ через ::after', code: 'const a = $(\'a[href^="https"]\');\nexpect(getComputedStyle(a, \'::after\').content).toMatch(\'↗\');\nconst b = $(\'a[href^="http://"]\');\nexpect(getComputedStyle(b, \'::after\').content).toMatch(\'↗\');' },
        { name: 'внутрішні — сині й без значка', code: '[\'/about\', \'#contacts\', \'/files/price.pdf\'].forEach(h => {\n  const a = $(\'a[href="\' + h + \'"]\');\n  expect(css(a, \'color\')).toBe(\'rgb(37, 99, 235)\');\n  const c = getComputedStyle(a, \'::after\').content;\n  expect(c === \'none\' || c === \'normal\').toBe(true);\n});' },
        { name: 'PDF — жирне', code: 'expect(css(\'a[href$=".pdf"]\', \'font-weight\')).toBe(\'700\');\nexpect(css(\'a[href="/about"]\', \'font-weight\')).toBe(\'400\');' },
        { name: 'mailto без підкреслення, інші — з підкресленням', code: 'expect(css(\'a[href^="mailto:"]\', \'text-decoration-line\')).toBe(\'none\');\nexpect(css(\'a[href="/about"]\', \'text-decoration-line\')).toBe(\'underline\');' }
      ],
      explanation: `
Атрибутні селектори стилізують за даними, а не за класами. \`[href^="http"]\` коротший, але зачепить і відносне \`httpbin.html\`, тому надійніше два явні префікси. Для регістру — \`[href$=".pdf" i]\`.

**Що можуть спитати далі:** як не позначати абсолютні посилання на свій домен? (\`a[href^="http"]:not([href^="https://acme.com"])\`.)
`
    },
    {
      id: 'css-selectors',
      group: 'selectors',
      type: 'theory',
      level: 1,
      interview: true,
      title: 'Види селекторів і комбінатори',
      tags: ['selectors'],
      question: `
Співбесіда: які види CSS-селекторів ви знаєте і чим відрізняються комбінатори пробіл, \`>\`, \`+\`, \`~\`? Оберіть **усі** правильні твердження.
`,
      choices: [
        '`h2 + p` вибирає лише `p`, що йде одразу після `h2`, а `h2 ~ p` — усі наступні `p` того ж рівня',
        '`.menu > li` вибирає `li` на будь-якій глибині в `.menu`, а пробіл — лише прямих дітей',
        'Батька чи попереднього брата класичними комбінаторами не вибрати — для цього є `:has()`',
        'Якщо в списку `h1, h2, h3:foo` один селектор невалідний, ігнорується лише він, решта працюють',
        'Браузер матчить селектор зліва направо: спершу знаходить `.nav`, потім шукає в ньому `a`'
      ],
      correct: [0, 2],
      why: [
        'Так: `+` — лише безпосередньо наступний брат, `~` — усі наступні брати з тим самим батьком.',
        'Навпаки: `>` — лише прямі діти, а пробіл — нащадки на будь-якій глибині.',
        'Так: комбінатори дивляться лише вниз і вперед, а `:has()` дозволяє `.card:has(img)`.',
        'Ні: один невалідний селектор ламає весь список; «прощаючі» лише списки в `:is()`/`:where()`.',
        'Ні: браузер матчить справа наліво — спершу всі `a`, потім шукає серед предків `.nav`.'
      ],
      hint: 'Простi селектори (тег, клас, id, атрибут), псевдокласи/псевдоелементи, комбінатори, групування.',
      answer: `
- **Прості:** тег, \`.class\`, \`#id\`, \`*\`, атрибутні (\`^= $= *= ~= |=\`, прапорець \`i\`).
- **Комбінатори:** \`A B\` нащадок, \`A > B\` дитина, \`A + B\` наступний брат, \`A ~ B\` усі наступні брати.
- Батька / попереднього брата — лише \`:has()\`: \`.card:has(img)\`, \`h2:has(+ p)\`.
- **Список** \`h1, h2, h3\`: невалідний селектор ламає весь список (крім \`:is()\`/\`:where()\`).
- Браузер матчить **справа наліво** → плоскі класи (\`.nav-link\`) дешевші за \`div div a\`.
- У продакшені — переважно класи: id і довгі ланцюжки ускладнюють перевизначення.
`,
      keyPoints: [
        'Тег, клас, id, *, атрибутні селектори (^= $= *= ~= |= і прапорець i)',
        'Комбінатори: нащадок, >, +, ~',
        'Вибрати батька/попереднього брата — лише через :has()',
        'Невалідний селектор ламає весь список (крім :is/:where)',
        'Браузер матчить справа наліво; перевага плоских класів'
      ],
      followUps: [
        'Як вибрати батька елемента в CSS?',
        'Чому id-селектори не рекомендують для стилів?',
        'Що таке «прощаючий» список селекторів?'
      ]
    },
    {
      id: 'css-quiz-nth-child-vs-of-type',
      group: 'pseudo',
      type: 'quiz',
      level: 2,
      title: ':nth-child vs :nth-of-type',
      tags: ['selectors', 'pseudo-classes'],
      question: `
**Як це працює:** \`p:nth-child(2)\` читається як «другий серед **усіх** дітей батька **і** при цьому \`p\`». \`p:nth-of-type(2)\` — «другий серед \`p\`».

Який текст стане червоним?

\`\`\`html
<div class="list">
  <h3>Title</h3>
  <p>One</p>
  <p>Two</p>
  <p>Three</p>
</div>
\`\`\`
\`\`\`css
.list p:nth-child(2) { color: red; }
\`\`\`
`,
      options: ['One', 'Two', 'Нічого — другий дочірній елемент не p', 'Title'],
      answer: 0,
      why: [
        'Так: другий дочірній елемент — `<p>One</p>`, і він є `p`.',
        '«Two» — другий серед `p`; так рахує `:nth-of-type(2)`.',
        'Другий дочірній — саме `p` (One), перший — `h3`.',
        '`h3` — перший дочірній і не `p`, тож селектор `p:…` його не вибирає.'
      ],
      hint: '`:nth-child` рахує **всіх** дітей батька, незалежно від тегу. А потім перевіряє, чи це `p`.',
      explanation: `
Пастка навпаки: \`p:nth-child(1)\` тут не вибере нічого. Новий синтаксис \`:nth-child(2 of p)\` рахує лише серед підходящих і приймає будь-який селектор: \`:nth-child(2 of .visible)\`.
`
    },
    {
      id: 'css-quiz-nth-formulas',
      group: 'pseudo',
      type: 'quiz',
      level: 2,
      title: 'Формули an+b у :nth-child',
      tags: ['selectors', 'pseudo-classes'],
      question: `
**Як це працює:** у \`:nth-child(an+b)\` n пробігає 0, 1, 2…; вибираються елементи з отриманими додатними номерами (рахунок з 1).

У списку 10 елементів \`<li>\` (діти одного \`<ul>\`). Оберіть **усі** селектори, які вибирають **рівно перші три**:
`,
      options: [
        '`li:nth-child(-n+3)`',
        '`li:nth-child(n+3)`',
        '`li:nth-child(3n)`',
        '`li:not(:nth-child(n+4))`',
        '`li:nth-child(1), li:nth-child(2), li:nth-child(3)`',
        '`li:nth-last-child(-n+3)`'
      ],
      answer: [0, 3, 4],
      why: [
        'Так: n = 0, 1, 2, 3 дає 3, 2, 1, 0 — лишаються номери 1–3.',
        'Ні: `n+3` дає 3, 4, 5… — з третього до кінця.',
        'Ні: `3n` дає 3, 6, 9 — кожен третій.',
        'Так: «усі, крім з 4-го і далі» — це перші три.',
        'Так: громіздко, але вибирає рівно 1, 2 і 3.',
        'Ні: `nth-last-child` рахує з кінця — це останні три.'
      ],
      hint: 'Підставте n = 0, 1, 2, 3… і залиште лише додатні результати.',
      explanation: `
Шаблони: \`even\`/\`2n\`, \`odd\`/\`2n+1\`, \`n+4\` — з 4-го, \`-n+3\` — перші три, \`:nth-child(n+3):nth-child(-n+6)\` — з 3-го по 6-й.
`
    },
    {
      id: 'css-zebra-table',
      group: 'pseudo',
      type: 'dom',
      level: 1,
      title: 'Зебра-таблиця на :nth-child',
      tags: ['selectors', 'pseudo-classes'],
      description: `
**Завдання.** Без класів на рядках зробіть «зебру» і вирівнювання в таблиці замовлень.

**Де трапляється:** таблиці в адмінках і кабінетах; рядки додаються динамічно, тож класи \`.odd/.even\` довелося б перераховувати в JS.

**Дано**
\`\`\`html
<table class="orders">
  <thead><tr><th>№</th><th>Товар</th><th>Ціна</th></tr></thead>
  <tbody> <tr><td>1</td><td>…</td><td>1 200 ₴</td></tr> … (5 рядків) </tbody>
</table>
\`\`\`

**Що написати** (лише CSS)
- парні рядки \`tbody\` (2-й, 4-й): \`background: #f3f4f6\`; непарні — прозорі;
- рядок у \`thead\` зебра не чіпає (лишається \`#1f2937\`);
- перший стовпчик у \`tbody\`: \`font-weight: 700\`;
- останній стовпчик (ціна): \`text-align: right\` і в \`thead\`, і в \`tbody\`.

**Як це працює:** \`tr:nth-child(even)\` рахує позицію серед братів, тож новий рядок автоматично отримає правильний фон. \`td:first-child\` / \`:last-child\` — перша й остання клітинка рядка.

**Врахуйте:** обмежте зебру \`tbody\`, інакше зачепите \`thead\`.
`,
      html: `<table class="orders">
  <thead>
    <tr><th>№</th><th>Товар</th><th>Ціна</th></tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>Клавіатура</td><td>1 200 ₴</td></tr>
    <tr><td>2</td><td>Миша</td><td>650 ₴</td></tr>
    <tr><td>3</td><td>Монітор</td><td>8 900 ₴</td></tr>
    <tr><td>4</td><td>Навушники</td><td>2 300 ₴</td></tr>
    <tr><td>5</td><td>Веб-камера</td><td>1 800 ₴</td></tr>
  </tbody>
</table>`,
      css: `.orders { border-collapse: collapse; font-family: system-ui, sans-serif; }
.orders th, .orders td { padding: 6px 12px; text-align: left; }
.orders thead tr { background: #1f2937; color: #fff; }

/* 1. Парні рядки tbody — фон #f3f4f6 */
/* TODO */

/* 2. Перший стовпчик tbody — жирний */
/* TODO */

/* 3. Останній стовпчик (th і td) — праворуч */
/* TODO */
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.orders { border-collapse: collapse; font-family: system-ui, sans-serif; }
.orders th, .orders td { padding: 6px 12px; text-align: left; }
.orders thead tr { background: #1f2937; color: #fff; }

.orders tbody tr:nth-child(even) {
  background: #f3f4f6;
}
.orders tbody td:first-child {
  font-weight: 700;
}
.orders th:last-child,
.orders td:last-child {
  text-align: right;
}
`
      },
      hints: [
        '`.orders tbody tr:nth-child(even)` — парні рядки лише в тілі таблиці.',
        '`td:first-child` і `th:last-child, td:last-child`; вага (0,2,1) переможе базове `.orders td` (0,1,1).'
      ],
      tests: [
        { name: 'парні рядки tbody мають фон #f3f4f6', code: 'const rows = $$(\'.orders tbody tr\');\n[1, 3].forEach(i => expect(css(rows[i], \'background-color\')).toBe(\'rgb(243, 244, 246)\'));' },
        { name: 'непарні рядки tbody прозорі', code: 'const rows = $$(\'.orders tbody tr\');\n[0, 2, 4].forEach(i => expect(css(rows[i], \'background-color\')).toBe(\'rgba(0, 0, 0, 0)\'));' },
        { name: 'thead не зачеплено', code: 'expect(css(\'.orders thead tr\', \'background-color\')).toBe(\'rgb(31, 41, 55)\');' },
        { name: 'перший стовпчик tbody — жирний, інші — ні', code: '$$(\'.orders tbody tr\').forEach(r => {\n  expect(css(r.cells[0], \'font-weight\')).toBe(\'700\');\n  expect(css(r.cells[1], \'font-weight\')).toBe(\'400\');\n});' },
        { name: 'останній стовпчик вирівняний праворуч', code: '$$(\'.orders tr\').forEach(r => {\n  expect(css(r.cells[2], \'text-align\')).toBe(\'right\');\n  expect(css(r.cells[1], \'text-align\')).toBe(\'left\');\n});' },
        { name: 'зебра працює для нових рядків', code: 'const tr = document.createElement(\'tr\');\ntr.innerHTML = \'<td>6</td><td>Колонки</td><td>3 100 ₴</td>\';\n$(\'.orders tbody\').append(tr);\nexpect(css(tr, \'background-color\')).toBe(\'rgb(243, 244, 246)\');\ntr.remove();' }
      ],
      explanation: `
Структурні псевдокласи працюють без JS при будь-якій кількості рядків. Пастка: сховані рядки (\`[hidden]\`) теж рахуються і ламають зебру — рішення \`:nth-child(even of :not([hidden]))\`.
`
    },
    {
      id: 'css-checked-label',
      group: 'pseudo',
      type: 'dom',
      level: 2,
      title: ':checked + сусідні комбінатори',
      tags: ['selectors', 'pseudo-classes', 'combinators'],
      description: `
**Завдання.** Список справ без JavaScript: стиль відміченої справи залежить від стану чекбокса.

**Де трапляється:** кастомні чекбокси, перемикачі, todo-списки — класичне питання про \`:checked\` і комбінатори.

**Дано**
\`\`\`html
<ul class="todos">
  <li><input type="checkbox" id="t1"><label for="t1">…</label> <span class="badge">готово</span></li>
  … (3 справи, друга відмічена)
</ul>
\`\`\`

**Що написати** (лише CSS)
- \`label\` відміченої справи: \`text-decoration: line-through\`, \`color: #9ca3af\`;
- \`.badge\` видно лише у відміченої (\`display: inline-block\`), в інших — \`display: none\`.

**Як це працює:** \`:checked\` оновлюється при кожному кліку. \`input:checked + label\` — label одразу після чекбокса; \`input:checked ~ .badge\` — будь-який наступний брат.

**Врахуйте:** між чекбоксом і бейджем стоїть label, тому для бейджа \`+\` не підходить.
`,
      html: `<ul class="todos">
  <li><input type="checkbox" id="t1"><label for="t1">Купити хліб</label> <span class="badge">готово</span></li>
  <li><input type="checkbox" id="t2" checked><label for="t2">Вивчити каскад</label> <span class="badge">готово</span></li>
  <li><input type="checkbox" id="t3"><label for="t3">Зробити ревʼю</label> <span class="badge">готово</span></li>
</ul>`,
      css: `.todos { list-style: none; padding: 0; font-family: system-ui, sans-serif; }
.todos li { margin-bottom: 6px; }
.todos label { color: #111827; }
.badge { padding: 0 6px; border-radius: 4px; background: #dcfce7; color: #166534; font-size: 12px; }

/* 1. Бейдж за замовчуванням прихований */
/* TODO */

/* 2. Label одразу після відміченого чекбокса — закреслений і сірий */
/* TODO */

/* 3. Бейдж після відміченого чекбокса — inline-block */
/* TODO */
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.todos { list-style: none; padding: 0; font-family: system-ui, sans-serif; }
.todos li { margin-bottom: 6px; }
.todos label { color: #111827; }
.badge { padding: 0 6px; border-radius: 4px; background: #dcfce7; color: #166534; font-size: 12px; }

.badge { display: none; }

/* + : label стоїть одразу після чекбокса */
.todos input:checked + label {
  text-decoration: line-through;
  color: #9ca3af;
}

/* ~ : бейдж — не сусід, а «загальний брат» після чекбокса */
.todos input:checked ~ .badge {
  display: inline-block;
}
`
      },
      hints: [
        '`input:checked + label` — сусід одразу після відміченого чекбокса.',
        'Для бейджа потрібен `~`: `.todos input:checked ~ .badge { display: inline-block; }`.'
      ],
      tests: [
        { name: 'відмічена справа: label закреслений і сірий', code: 'const l = $(\'label[for="t2"]\');\nexpect(css(l, \'text-decoration-line\')).toBe(\'line-through\');\nexpect(css(l, \'color\')).toBe(\'rgb(156, 163, 175)\');' },
        { name: 'невідмічена справа: звичайний label', code: 'const l = $(\'label[for="t1"]\');\nexpect(css(l, \'text-decoration-line\')).toBe(\'none\');\nexpect(css(l, \'color\')).toBe(\'rgb(17, 24, 39)\');' },
        { name: 'бейдж видно лише у відміченої', code: 'const badges = $$(\'.badge\');\nexpect(css(badges[0], \'display\')).toBe(\'none\');\nexpect(css(badges[1], \'display\')).toBe(\'inline-block\');\nexpect(css(badges[2], \'display\')).toBe(\'none\');' },
        { name: 'стилі реагують на зміну стану', code: '$(\'#t1\').checked = true;\nexpect(css(\'label[for="t1"]\', \'text-decoration-line\')).toBe(\'line-through\');\nexpect(css($$(\'.badge\')[0], \'display\')).toBe(\'inline-block\');\n$(\'#t2\').checked = false;\nexpect(css(\'label[for="t2"]\', \'color\')).toBe(\'rgb(17, 24, 39)\');\nexpect(css($$(\'.badge\')[1], \'display\')).toBe(\'none\');' }
      ],
      explanation: `
Комбінатори бачать лише наступних братів, тому чекбокс мусить стояти першим. \`:has()\` знімає це обмеження: \`li:has(input:checked) label { … }\` — і можна стилізувати навіть сам \`li\`.
`
    },
    {
      id: 'css-badge-after',
      group: 'pseudo',
      type: 'dom',
      level: 1,
      title: 'Бейдж-лічильник через ::after і attr()',
      tags: ['pseudo-elements'],
      description: `
**Завдання.** Додайте кнопкам \`.cart\` бейдж із кількістю товарів лише CSS-ом.

**Де трапляється:** лічильник у кнопці кошика чи сповіщень — число приходить у \`data-count\`, JS лише оновлює атрибут.

**Дано**
\`\`\`html
<button class="cart" data-count="3">Кошик</button>
<button class="cart" data-count="0">Обране</button>
\`\`\`

**Що написати** (лише CSS) — псевдоелемент \`.cart::after\`:
- текст = значення \`data-count\`;
- \`display: inline-block\`, \`margin-left: 8px\`, фон \`#dc2626\`, текст білий;
- якщо \`data-count="0"\` — \`display: none\`.

**Як це працює:** \`::after\` — віртуальна остання дитина елемента, рендериться лише з \`content\`. \`content: attr(data-count)\` читає атрибут «живцем»: змінили атрибут — бейдж оновився.

**Врахуйте:** для нуля потрібен атрибутний селектор на кнопці, а не на псевдоелементі.
`,
      html: `<button type="button" class="cart" data-count="3">Кошик</button>
<button type="button" class="cart" data-count="0">Обране</button>`,
      css: `.cart {
  margin: 20px 12px;
  padding: 10px 18px;
  font: 16px system-ui, sans-serif;
}

/* 1. Бейдж: .cart::after з content із data-count */
/* TODO: content, display, margin-left, padding, border-radius, background, color */

/* 2. data-count="0" — бейдж приховано */
/* TODO */
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.cart {
  margin: 20px 12px;
  padding: 10px 18px;
  font: 16px system-ui, sans-serif;
}

.cart::after {
  content: attr(data-count);   /* значення атрибута як текст */
  display: inline-block;
  margin-left: 8px;
  padding: 0 6px;
  border-radius: 999px;        /* «пігулка» росте з кількістю цифр */
  background: #dc2626;
  color: #fff;
  font-size: 12px;
  line-height: 18px;
}

.cart[data-count="0"]::after {
  display: none;
}
`
      },
      hints: [
        '`content: attr(data-count);` вставляє значення атрибута як текст.',
        'Для нуля: `.cart[data-count="0"]::after { display: none; }`.'
      ],
      tests: [
        { name: '::after показує data-count', code: 'const c = getComputedStyle($(\'.cart\'), \'::after\').content;\nexpect([\'attr(data-count)\', \'"3"\']).toContain(c);' },
        { name: 'бейдж inline-block, червоний, білий текст, відступ 8px', code: 'const s = getComputedStyle($(\'.cart\'), \'::after\');\nexpect(s.display).toBe(\'inline-block\');\nexpect(s.backgroundColor).toBe(\'rgb(220, 38, 38)\');\nexpect(s.color).toBe(\'rgb(255, 255, 255)\');\nexpect(s.marginLeft).toBe(\'8px\');' },
        { name: 'data-count="0" — бейдж приховано', code: 'const zero = $$(\'.cart\')[1];\nexpect(getComputedStyle(zero, \'::after\').display).toBe(\'none\');\nexpect(getComputedStyle($$(\'.cart\')[0], \'::after\').display).not.toBe(\'none\');' },
        { name: 'бейдж реагує на зміну атрибута', code: 'const b = $$(\'.cart\')[1];\nb.dataset.count = \'5\';\nexpect(getComputedStyle(b, \'::after\').display).not.toBe(\'none\');\nb.dataset.count = \'0\';\nexpect(getComputedStyle(b, \'::after\').display).toBe(\'none\');' }
      ],
      explanation: `
\`attr()\` у \`content\` повертає рядок і (класично) працює лише в \`content\`. Для доступності кнопці краще дати імʼя \`aria-label="Кошик, 3 товари"\`: screen reader прочитає «Кошик3». \`border-radius: 999px\` дає пігулку, \`50%\` — еліпс.
`
    },
    {
      id: 'css-pseudo-classes-elements',
      group: 'pseudo',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Псевдокласи vs псевдоелементи',
      tags: ['pseudo-classes', 'pseudo-elements'],
      question: `
Співбесіда: чим псевдокласи відрізняються від псевдоелементів і які особливості \`::before\`/\`::after\`?
`,
      choices: [
        'Псевдоклас вибирає існуючий елемент у певному стані, а псевдоелемент — віртуальну частину, якої немає в DOM',
        'Псевдоклас створює віртуальний вузол у DOM, а псевдоелемент описує стан уже існуючого елемента',
        'Різниця лише в синтаксисі: `:` і `::` взаємозамінні для всіх псевдоелементів, включно з новими',
        '`::before`/`::after` вставляють вміст як сусідів елемента, тому працюють і на `<img>` та `<input>`',
        'Текст із `content` у `::before` screen reader-и повністю ігнорують, тож він суто декоративний'
      ],
      correct: 0,
      why: [
        'Так: `:hover`/`:checked` — стан існуючого вузла, `::before`/`::placeholder` — частина без вузла в DOM.',
        'Навпаки: віртуальну частину створює псевдоелемент, а псевдоклас описує стан.',
        'Одна двокрапка працює лише для старих `:before`/`:after` заради сумісності, нові — тільки `::`.',
        '`::before/::after` вставляються всередину як перша/остання дитина, тому на `<img>`/`<input>` не працюють.',
        'Текст із `content` screen reader-и читають, тому важливе туди не кладуть.'
      ],
      hint: 'Стан vs віртуальна частина; одна vs дві двокрапки; content; replaced elements.',
      answer: `
- **Псевдоклас** \`:\` — стан/позиція існуючого елемента: \`:hover\`, \`:focus-visible\`, \`:checked\`, \`:nth-child()\`, \`:not()\`, \`:has()\`. Вага (0,1,0).
- **Псевдоелемент** \`::\` — віртуальна частина: \`::before\`, \`::after\`, \`::placeholder\`, \`::marker\`, \`::selection\`. Вага (0,0,1).
- \`::before/::after\`: потрібен \`content\` (хоча б \`""\`), inline за замовчуванням, це перша/остання **дитина**.
- Не працюють на \`<img>\`, \`<input>\`, \`<br>\` — немає вмісту, куди вставити.
- \`content\` читається screen reader-ом, але не копіюється; альтернатива: \`content: "★" / "рейтинг"\`.
- З JS — лише \`getComputedStyle(el, '::before')\`.
`,
      keyPoints: [
        'Псевдоклас — стан існуючого елемента, псевдоелемент — віртуальна частина',
        '::before/::after потребують content, inline за замовчуванням',
        'Не працюють на img/input та інших replaced/void елементах',
        'Вміст content читається SR, але не копіюється — не для важливого тексту',
        'Специфічність: псевдоклас як клас, псевдоелемент як тег'
      ],
      followUps: [
        'Чому ::after не працює на <img>?',
        'Як стилізувати маркери списку?',
        'Як отримати значення content з JS?'
      ]
    },
    {
      id: 'css-quiz-color-id-vs-class',
      group: 'specificity',
      type: 'quiz',
      level: 1,
      title: 'Якого кольору посилання? (id vs класи)',
      tags: ['specificity'],
      question: `
**Як це працює:** специфічність — трійка **(a, b, c)**: a — id, b — класи/атрибути/псевдокласи, c — теги/псевдоелементи. Порівнюють зліва направо, як номери версій; рівна вага → перемагає пізніше правило.

\`\`\`html
<nav id="nav"><a class="link" href="#">Головна</a></nav>
\`\`\`
\`\`\`css
#nav a       { color: red; }
.link        { color: green; }
nav a.link   { color: blue; }
\`\`\`
Якого кольору буде текст посилання?
`,
      options: [
        'Червоний',
        'Зелений',
        'Синій — правило найдовше і найконкретніше',
        'Стандартний синій колір посилань браузера'
      ],
      answer: 0,
      why: [
        'Так: `#nav a` — (1,0,1), єдиний з id, а перший розряд вирішує.',
        '`.link` — (0,1,0), найслабший з трьох.',
        '`nav a.link` — (0,1,2): важить склад селектора, а не довжина.',
        'Стилі браузера (UA) програють будь-яким авторським правилам.'
      ],
      hint: 'Порахуйте (a, b, c) для кожного селектора.',
      explanation: `
\`#nav a\` (1,0,1) > \`nav a.link\` (0,1,2) > \`.link\` (0,1,0). Перевірити можна в DevTools: наведіть на селектор у панелі Styles.
`
    },
    {
      id: 'css-quiz-specificity-calc',
      group: 'specificity',
      type: 'quiz',
      level: 3,
      title: 'Порахувати специфічність складного селектора',
      tags: ['specificity'],
      question: 'Яка специфічність селектора `#app .list > li:not(.active)::before`?',
      options: ['(1,3,2)', '(1,2,1)', '(1,1,2)', '(1,2,2)'],
      answer: 3,
      why: [
        'Помилка: `:not` порахували окремо, а сам він нічого не важить — рахується лише аргумент.',
        'Забули `::before` — псевдоелемент додає до c, як тег.',
        'Забули `.active` з `:not(.active)` — аргумент важить як клас.',
        'Так: `#app` (a=1), `.list` і `.active` (b=2), `li` і `::before` (c=2).'
      ],
      hint: 'Сам `:not` не рахується — рахується його аргумент. Комбінатор `>` — нуль.',
      explanation: `
\`#app\` → a; \`.list\` → b; \`>\` → 0; \`li\` → c; \`:not(.active)\` → b (лише аргумент); \`::before\` → c. Разом (1,2,2).
`
    },
    {
      id: 'css-quiz-is-where',
      group: 'specificity',
      type: 'quiz',
      level: 3,
      title: ':is() vs :where() — специфічність',
      tags: ['specificity', 'selectors'],
      question: `
Якого кольору буде текст?

\`\`\`html
<div id="app"><div class="card"><p>Текст</p></div></div>
\`\`\`
\`\`\`css
:is(#app, .card) p   { color: green; }
.card p              { color: blue; }
:where(#app) .card p { color: red; }
\`\`\`
`,
      options: ['Синій', 'Червоний', 'Зелений', 'Чорний (жодне правило не спрацює)'],
      answer: 2,
      why: [
        'Синій `.card p` — (0,1,1), слабше за (1,0,1) першого правила.',
        'Червоний `:where(#app) .card p` — (0,1,1), бо `:where()` завжди 0; він переміг би лише синій.',
        'Так: `:is(#app, .card)` бере вагу найсильнішого аргументу — id, разом (1,0,1).',
        'Усі три правила вибирають `p`, тож колір точно заданий.'
      ],
      hint: 'Специфічність `:is()` — це специфічність **найспецифічнішого** аргументу. А `:where()`?',
      explanation: `
\`:is()\` бере максимум аргументів, навіть якщо елемент збігся через слабший. \`:where()\` — завжди 0, тому ним пишуть reset і стилі бібліотек: їх легко перевизначити будь-яким класом.
`
    },
    {
      id: 'css-specificity-battle',
      group: 'specificity',
      type: 'dom',
      level: 2,
      title: 'Виграти війну специфічності без !important',
      tags: ['specificity', 'cascade'],
      description: `
**Завдання.** Кнопка \`.btn-primary\` у сайдбарі виглядає як звичайне посилання, бо легасі-правило \`#sidebar a\` сильніше. Поверніть кнопці стиль без важливих оголошень.

**Де трапляється:** легасі-код зі стилями за id ламає нові компоненти — «війна специфічності».

**Дано**
\`\`\`html
<aside id="sidebar">
  <a href="#">Звичайне посилання</a>
  <a href="#" class="btn btn-primary">Купити</a>
</aside>
<main><a href="#" class="btn btn-primary" id="main-btn">Оформити</a></main>
\`\`\`

**Що написати** (лише CSS)
- кнопка в сайдбарі: білий текст, фон \`#2563eb\`, без підкреслення;
- звичайне посилання в сайдбарі лишається сірим \`#374151\` і підкресленим;
- кнопка поза сайдбаром працює як раніше.

**Як це працює:** \`#sidebar a\` = (1,0,1), \`.btn-primary\` = (0,1,0) — id перемагає. Потрібен селектор вагою більше (1,0,1), наприклад з id і класом: (1,1,0).

**Врахуйте:** правило \`#sidebar a\` не видаляйте і не змінюйте; \`!important\` заборонено (тест шукає цей рядок у CSS).
`,
      html: `<aside id="sidebar">
  <a href="#">Звичайне посилання</a>
  <a href="#" class="btn btn-primary">Купити</a>
</aside>
<main>
  <a href="#" class="btn btn-primary" id="main-btn">Оформити</a>
</main>`,
      css: `/* легасі — не змінювати */
#sidebar a {
  color: #374151;
  background: transparent;
  text-decoration: underline;
}

/* компонент кнопки */
.btn-primary {
  display: inline-block;
  padding: 8px 16px;
  color: #ffffff;
  background: #2563eb;
  text-decoration: none;
}

/* 1. Порахуйте вагу: #sidebar a — (1,0,1), .btn-primary — (0,1,0) */
/* 2. TODO: селектор для кнопки в сайдбарі з вагою більшою за (1,0,1) */
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `/* легасі — не змінювати */
#sidebar a {
  color: #374151;
  background: transparent;
  text-decoration: underline;
}

/* компонент кнопки */
.btn-primary {
  display: inline-block;
  padding: 8px 16px;
  color: #ffffff;
  background: #2563eb;
  text-decoration: none;
}

/* (1,1,0) > (1,0,1): перемагаємо легасі-правило точково */
#sidebar .btn-primary {
  color: #ffffff;
  background: #2563eb;
  text-decoration: none;
}
`
      },
      hints: [
        'Порівняйте (1,0,1) і (0,1,0): без id у селекторі легасі не перемогти.',
        '`#sidebar .btn-primary` — (1,1,0) > (1,0,1); повторіть у ньому color, background і text-decoration.'
      ],
      tests: [
        { name: 'кнопка в сайдбарі біла на синьому без підкреслення', code: 'const b = $(\'#sidebar .btn-primary\');\nexpect(css(b, \'color\')).toBe(\'rgb(255, 255, 255)\');\nexpect(css(b, \'background-color\')).toBe(\'rgb(37, 99, 235)\');\nexpect(css(b, \'text-decoration-line\')).toBe(\'none\');' },
        { name: 'звичайне посилання в сайдбарі не змінилось', code: 'const a = $(\'#sidebar a:not(.btn)\');\nexpect(css(a, \'color\')).toBe(\'rgb(55, 65, 81)\');\nexpect(css(a, \'text-decoration-line\')).toBe(\'underline\');\nexpect(css(a, \'background-color\')).toBe(\'rgba(0, 0, 0, 0)\');' },
        { name: 'кнопка поза сайдбаром працює', code: 'expect(css(\'#main-btn\', \'color\')).toBe(\'rgb(255, 255, 255)\');\nexpect(css(\'#main-btn\', \'background-color\')).toBe(\'rgb(37, 99, 235)\');' },
        { name: 'легасі-правило #sidebar a збережено', code: 'function find(rules) {\n  for (const r of rules) {\n    if (r.selectorText && r.selectorText.trim() === \'#sidebar a\') return r;\n    if (r.cssRules) { const f = find(r.cssRules); if (f) return f; }\n  }\n  return null;\n}\nlet rule = null;\nfor (const sheet of document.styleSheets) { rule = rule || find(sheet.cssRules); }\nexpect(rule).toBeTruthy();\nexpect(rule.style.color).toBe(\'rgb(55, 65, 81)\');\nexpect(rule.style.textDecorationLine || rule.style.textDecoration).toMatch(\'underline\');' },
        { name: 'без !important', code: 'const text = $$(\'style\').map(s => s.textContent).join(\'\\n\');\nexpect(text.includes(\'!important\')).toBe(false);' }
      ],
      explanation: `
Варіанти: \`#sidebar .btn-primary\` (просто, але закріплює id); \`:where(#sidebar) a\` у легасі (якщо можна змінювати) — вага (0,0,1); загорнути легасі в \`@layer legacy { … }\` — стилі поза шарами сильніші за будь-які шарові. \`!important\` запускає «гонку озброєнь».
`
    },
    {
      id: 'css-specificity',
      group: 'specificity',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Як рахується специфічність',
      tags: ['specificity', 'cascade'],
      question: `
Співбесіда: як рахується специфічність і де місце inline-стилів та \`!important\`?
`,
      choices: [
        'Специфічність — сума балів (id = 100, клас = 10, тег = 1), тому 11 класів переможуть один id',
        '`!important` додає до специфічності окремий старший розряд, тому між двома `!important` вирішує порядок',
        'Успадковане значення зберігає специфічність селектора батька і може перемогти правило з `*`',
        'Трійка (id, класи/атрибути/псевдокласи, теги) порівнюється зліва направо: 15 класів не переможуть id',
        '`:where()` і `:is()` обидва беруть специфічність найсильнішого аргументу, різниця лише в підтримці'
      ],
      correct: 3,
      why: [
        'Ні: розряди не сумуються, (0,11,0) все одно слабше за (1,0,0).',
        'Ні: `!important` — окремий рівень каскаду, а не розряд специфічності.',
        'Ні: успадковане значення не має специфічності — навіть `*` його перемагає.',
        'Так: трійки порівнюють зліва направо, тож жодна кількість класів не переможе id.',
        'Ні: `:is()` бере максимум аргументів, а `:where()` — завжди 0.'
      ],
      hint: 'Трійка (a, b, c), порівняння зліва направо; що дає 0; :is/:not/:has/:where.',
      answer: `
- **(a, b, c):** id / класи, атрибути, псевдокласи / теги, псевдоелементи; порівняння зліва направо.
- \`*\`, комбінатори, \`:where()\` — 0; \`:is()\`, \`:not()\`, \`:has()\` — вага найсильнішого аргументу.
- **Inline** \`style\` сильніший за будь-який селектор; **\`!important\`** — окремий рівень каскаду, сильніший за inline.
- Успадковане значення специфічності не має.
- Проти війн: один клас на селектор (BEM), без id у стилях, \`:where()\` у базових стилях, \`@layer\`.
`,
      keyPoints: [
        'Трійка (id, класи/атрибути/псевдокласи, теги/псевдоелементи), порівняння зліва направо',
        'Жодна кількість класів не переможе id',
        ':is/:not/:has — максимум аргументів, :where — 0, * і комбінатори — 0',
        'Inline сильніший за селектори; !important — окремий рівень каскаду',
        'Успадковане значення програє будь-якому прямому правилу; @layer і BEM проти війн'
      ],
      followUps: [
        'Яка специфічність у :not(.a):not(.b)?',
        'Чи можна перевизначити inline-стиль без зміни HTML?',
        'Чим @layer кращий за підвищення специфічності?'
      ]
    },
    {
      id: 'css-quiz-color-important',
      group: 'cascade',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Якого кольору текст? (!important і порядок)',
      tags: ['specificity', 'cascade'],
      question: `
**Як це працює:** каскад обирає значення за критеріями по черзі: **важливість** (\`!important\`) → inline-стиль → \`@layer\` → специфічність → порядок у коді. Наступний критерій діє лише при нічиїй.

\`\`\`html
<main id="main"><p class="text">Привіт</p></main>
\`\`\`
\`\`\`css
.text       { color: red !important; }
#main .text { color: blue; }
.text       { color: green; }
\`\`\`
`,
      options: [
        'Синій — найвища специфічність',
        'Зелений — останнє правило',
        'Червоний',
        'Синій, бо !important діє лише на inline-стилі'
      ],
      answer: 2,
      why: [
        'Специфічність порівнюють лише між оголошеннями однакової важливості, а `!important` тут у червоного.',
        'Порядок — останній критерій, до нього справа не доходить.',
        'Так: важливе оголошення перемагає всі звичайні незалежно від специфічності й порядку.',
        '`!important` діє на будь-які оголошення, а не лише на inline.'
      ],
      hint: '`!important` — це не «+1000 до специфічності», а окремий шар каскаду.',
      explanation: `
\`!important\` — не «+1000 до специфічності», а окремий рівень. Якби його мали два правила, між ними знову вирішували б специфічність і порядок — звідси «гонка озброєнь».
`
    },
    {
      id: 'css-quiz-inline-important',
      group: 'cascade',
      type: 'quiz',
      level: 2,
      title: 'Inline-стиль проти !important',
      tags: ['specificity', 'cascade'],
      question: `
\`\`\`html
<div id="content"><p class="msg" style="color: green">Привіт</p></div>
\`\`\`
\`\`\`css
#content .msg { color: red; }
.msg          { color: blue !important; }
\`\`\`
`,
      options: [
        'Синій',
        'Зелений — inline-стилі перемагають усе',
        'Червоний',
        'Зелений, бо inline-стиль теж вважається !important'
      ],
      answer: 0,
      why: [
        'Так: авторське `!important` сильніше за звичайний inline-стиль.',
        'Inline перемагає лише звичайні оголошення, а не важливі.',
        '`#content .msg` — звичайне правило; і inline, і `!important` сильніші.',
        'Inline без `!important` — звичайне оголошення; важливим його робить лише `style="color: green !important"`.'
      ],
      hint: 'Inline-стиль сильніший за будь-який **звичайний** селектор. А за важливе оголошення?',
      explanation: `
Порядок: важливість → inline → специфічність. Так на практиці перевизначають inline-стилі сторонніх віджетів: \`!important\` у CSS.
`
    },
    {
      id: 'css-quiz-layers',
      group: 'cascade',
      type: 'quiz',
      level: 3,
      title: '@layer: шари проти специфічності',
      tags: ['cascade', 'layers'],
      question: `
\`\`\`html
<button id="buy" class="btn">Купити</button>
\`\`\`
\`\`\`css
@layer base, components;

@layer components {
  .btn { color: blue; }
}
@layer base {
  #buy.btn { color: red; }
}
.btn { color: green; }
\`\`\`
Якого кольору текст кнопки?
`,
      options: [
        'Червоний — найвища специфічність',
        'Синій — шар components оголошено пізніше',
        'Синій — блок components стоїть першим у коді',
        'Зелений'
      ],
      answer: 3,
      why: [
        'Специфічність порівнюють лише всередині шару, а червоне правило в найслабшому шарі base.',
        'Синій переміг би, якби не unlayered-правило: components оголошено пізніше за base.',
        'Важить порядок першого оголошення шару (`@layer base, components;`), а не порядок блоків.',
        'Так: звичайні стилі поза шарами сильніші за будь-які шарові.'
      ],
      hint: 'Що сильніше: стилі в шарі чи поза шарами? І чи порівнюється специфічність між різними шарами?',
      explanation: `
Шари перевіряються **до** специфічності: пізніший шар сильніший, unlayered — найсильніші. Для \`!important\` порядок інвертується — тоді переміг би червоний з першого шару base.
`
    },
    {
      id: 'css-cascade',
      group: 'cascade',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Каскад: повний порядок пріоритетів і @layer',
      tags: ['cascade', 'layers'],
      question: `
Співбесіда: як працює каскад, у якому порядку перевіряються критерії і що змінює \`@layer\`? Оберіть **усі** правильні твердження.
`,
      choices: [
        'Першим перевіряється походження і важливість, а для `!important` порядок походжень інвертується',
        'Специфічність перевіряється раніше за `@layer`, тому `#id` у нижньому шарі переможе клас у верхньому',
        'Звичайні стилі поза будь-яким `@layer` сильніші за стилі в шарах, незалежно від специфічності',
        'Серед `!important`-оголошень найсильніше те, що лежить в останньому оголошеному шарі',
        'Порядок у коді вирішує лише тоді, коли походження, шар і специфічність збігаються'
      ],
      correct: [0, 2, 4],
      why: [
        'Так: спершу походження і важливість; для `!important` порядок походжень інвертується, щоб користувач міг перевизначити сайт.',
        'Ні: шари перевіряються до специфічності — клас у пізнішому шарі переможе `#id` у ранньому.',
        'Так: для звичайних оголошень unlayered-стилі найсильніші.',
        'Ні: для `!important` найсильніше оголошення в **першому** шарі.',
        'Так: порядок появи — останній критерій.'
      ],
      hint: 'Походження і важливість → контекст → inline → шари → специфічність → порядок.',
      answer: `
1. **Походження + важливість:** transitions → \`!important\` UA → user → author → animations → author → user → UA.
2. **Shadow DOM-контекст.**
3. **Inline** \`style\`.
4. **@layer:** пізніший шар сильніший, поза шарами — найсильніші; для \`!important\` — навпаки.
5. **Специфічність.**
6. **Порядок** у коді.

Немає оголошень → успадкування або initial.

\`\`\`css
@layer reset, vendor, components, utilities;
@import url(bootstrap.css) layer(vendor);
\`\`\`
`,
      keyPoints: [
        'Перший критерій — походження і важливість; для !important порядок інвертується',
        'Inline сильніший за селектори',
        '@layer: пізніший шар сильніший, unlayered найсильніші; для !important — навпаки',
        'Далі специфічність, потім порядок у коді',
        'Без оголошень — успадкування або initial'
      ],
      followUps: [
        'Чому для !important порядок походжень інвертований?',
        'Як підключити Bootstrap у шар?',
        'Що сильніше: анімація чи звичайне правило з id?'
      ]
    },
    {
      id: 'css-methodologies',
      group: 'cascade',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'BEM, методології і reset/normalize',
      tags: ['architecture', 'bem'],
      question: `
Співбесіда: як організувати CSS у великому проєкті (BEM, CSS Modules, CSS-in-JS, Tailwind) і чим reset відрізняється від normalize? Оберіть **усі** правильні твердження.
`,
      choices: [
        'BEM тримає специфічність плоскою: кожен селектор — один клас на кшталт `.card__title--large`',
        'Normalize.css обнуляє всі стилі браузера, а reset зберігає корисні дефолти й виправляє баги',
        'CSS Modules локалізують імена класів під час збірки й не додають runtime-витрат',
        'styled-components не має runtime-витрат, бо всі стилі завжди генеруються під час збірки',
        'Для глибокої вкладеності в BEM правильно писати ланцюжки «онуків»: `.card__header__title`'
      ],
      correct: [0, 2],
      why: [
        'Так: один клас на селектор дає вагу (0,1,0) скрізь — війн немає.',
        'Навпаки: reset обнуляє стилі браузера, а normalize зберігає корисні дефолти й вирівнює відмінності.',
        'Так: імена класів переписуються під час збірки, у рантаймі — звичайний CSS.',
        'Ні: styled-components генерує стилі в рантаймі; zero-runtime — vanilla-extract, Linaria.',
        'Ні: BEM забороняє «онуків» — елемент завжди належить блоку: `.card__title`.'
      ],
      hint: 'Проблеми глобального простору імен і специфічності; блок, елемент, модифікатор.',
      answer: `
- **Проблеми:** глобальні імена, війни специфічності, мертвий код.
- **BEM:** \`.block__element--modifier\`, один клас — плоска вага; без «онуків».
- **CSS Modules:** локальні імена під час збірки, нуль runtime.
- **CSS-in-JS:** стилі в компонентах, динаміка з props; мінус — runtime і SSR (є zero-runtime варіанти).
- **Tailwind:** утиліти в розмітці, малий бандл, токени; мінус — шумна розмітка.
- **@layer / ITCSS:** порядок від загального до конкретного.
- **Reset** обнуляє, **normalize** вирівнює, **modern reset** — компроміс (\`box-sizing\`, \`margin: 0\`, \`font: inherit\`).
`,
      keyPoints: [
        'Проблеми: глобальні імена, специфічність, мертвий код',
        'BEM: block__element--modifier, один клас — плоска специфічність',
        'CSS Modules, CSS-in-JS (runtime vs zero-runtime), Tailwind — trade-offs',
        'ITCSS і @layer для впорядкування',
        'Reset обнуляє, normalize вирівнює; modern reset — компроміс'
      ],
      followUps: [
        'Які мінуси runtime CSS-in-JS?',
        'Як організувати @layer у проєкті з Tailwind?',
        'Як знаходити і видаляти невикористаний CSS?'
      ]
    },
    {
      id: 'css-quiz-color-inherited',
      group: 'inheritance',
      type: 'quiz',
      level: 2,
      title: 'Успадковане значення vs пряме правило',
      tags: ['specificity', 'inheritance'],
      question: `
**Як це працює:** якщо в елемента немає власного оголошення, текстові властивості (\`color\`, \`font-*\`, \`line-height\`) беруться від батька. Але успадковане значення **не має специфічності**: будь-яке правило, що вибирає сам елемент, сильніше.

\`\`\`html
<div id="parent" class="box"><p>Текст</p></div>
\`\`\`
\`\`\`css
#parent { color: red; }
.box    { color: green; }
p       { color: blue; }
\`\`\`
Якого кольору \`Текст\`?
`,
      options: [
        'Червоний — id найсильніший',
        'Синій',
        'Зелений',
        'Червоний, бо успадкування важливіше за селектор тегу'
      ],
      answer: 1,
      why: [
        '`#parent` вибирає `div`, а для `p` його колір був би лише успадкованим.',
        'Так: `p { color: blue }` — єдине правило для самого `p`, а пряме правило сильніше за успадкування.',
        '`.box` теж вибирає `div`; для div переміг би червоний.',
        'Навпаки: успадковане значення програє будь-якому прямому правилу.'
      ],
      hint: 'Яке з правил узагалі вибирає саме елемент `<p>`?',
      explanation: `
Специфічність порівнюють лише між правилами для **того самого** елемента. Класика: \`#header { color: white }\` не діє на посилання — у \`a\` є власний колір зі стилів браузера.
`
    },
    {
      id: 'css-quiz-important-inheritance',
      group: 'inheritance',
      type: 'quiz',
      level: 3,
      title: 'Чи успадковується «важливість»?',
      tags: ['inheritance', 'cascade'],
      question: `
\`\`\`html
<div class="parent"><span class="child">Текст</span></div>
\`\`\`
\`\`\`css
.parent { color: red !important; }
span    { color: blue; }
\`\`\`
Якого кольору \`Текст\`?
`,
      options: [
        'Червоний — !important сильніший за будь-що',
        'Синій',
        'Червоний, бо .parent має вищу специфічність, ніж span',
        'Фіолетовий — кольори змішуються'
      ],
      answer: 1,
      why: [
        '`!important` впливає лише на конкуренцію оголошень для `div.parent`, нащадку передається звичайне значення.',
        'Так: `span { color: blue }` — пряме правило, а успадковане значення йому програє.',
        'Вага `.parent` важлива лише для самого div.',
        'Кольори не змішуються — каскад обирає одне значення.'
      ],
      hint: 'Яке правило безпосередньо вибирає `span`? І що саме успадковується — оголошення чи обчислене значення?',
      explanation: `
Успадковується **обчислене значення** (\`red\`), а не оголошення з його важливістю. Щоб змінити колір нащадків, потрібен селектор для них (\`.parent *\`) або \`color: inherit\` у нащадків.
`
    },
    {
      id: 'css-inherit-reset',
      group: 'inheritance',
      type: 'dom',
      level: 2,
      title: 'Футер: посилання й кнопка беруть color і font від батька',
      tags: ['inheritance', 'forms'],
      description: `
**Завдання.** У темному футері посилання синє, а кнопка — чорним системним шрифтом. Зробіть, щоб обидва брали колір і шрифт футера.

**Де трапляється:** перший блок будь-якого reset/normalize: \`button, input { font: inherit }\`, \`a { color: inherit }\` у темних секціях.

**Дано**
\`\`\`html
<footer class="footer">
  <p>© 2026 Acme</p>
  <a href="#" class="link">Політика конфіденційності</a>
  <button type="button" class="subscribe">Підписатися</button>
</footer>
\`\`\`
Футер має \`color: #e5e7eb\` і \`font: 18px/1.5 Georgia, serif\`.

**Що написати** (лише CSS)
- \`.link\` і \`.subscribe\`: колір = колір футера (\`rgb(229, 231, 235)\`);
- \`.subscribe\`: шрифт = шрифт футера (18px, Georgia);
- якщо колір чи розмір шрифту футера зміниться — посилання й кнопка підхоплять нове значення (тест це перевірить).

**Як це працює:** \`color\` успадковується, але в \`a\` є власний колір зі стилів браузера, а в \`button\` — власні \`color\` і \`font\`. Ключове слово \`inherit\` явно бере значення батька.

**Врахуйте:** не хардкодьте \`#e5e7eb\` чи \`18px\` — тоді зміна футера не підхопиться.
`,
      html: `<footer class="footer">
  <p>© 2026 Acme</p>
  <a href="#" class="link">Політика конфіденційності</a>
  <button type="button" class="subscribe">Підписатися</button>
</footer>
`,
      css: `.footer {
  padding: 16px;
  background: #111827;
  color: #e5e7eb;
  font: 18px/1.5 Georgia, serif;
}
.subscribe {
  margin-top: 8px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid; /* колір рамки = currentColor */
}

/* 1. Посилання у футері — колір від батька */
/* TODO */

/* 2. Кнопка у футері — колір і шрифт від батька */
/* TODO */
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.footer {
  padding: 16px;
  background: #111827;
  color: #e5e7eb;
  font: 18px/1.5 Georgia, serif;
}
.subscribe {
  margin-top: 8px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid; /* колір рамки = currentColor */
}

/* перебиваємо стилі браузера: беремо значення батька */
.footer a,
.footer button {
  color: inherit;
  font: inherit;
}
`
      },
      hints: [
        'Пряме правило браузера (`a:link`, `button`) сильніше за успадковане значення — його треба перебити своїм правилом.',
        '`.footer a, .footer button { color: inherit; font: inherit; }`.'
      ],
      tests: [
        { name: 'посилання має колір футера', code: 'expect(css(\'.link\', \'color\')).toBe(css(\'.footer\', \'color\'));' },
        { name: 'кнопка має колір і шрифт футера', code: 'expect(css(\'.subscribe\', \'color\')).toBe(\'rgb(229, 231, 235)\');\nexpect(css(\'.subscribe\', \'font-size\')).toBe(\'18px\');\nexpect(css(\'.subscribe\', \'font-family\')).toMatch(\'Georgia\');' },
        { name: 'зміна футера підхоплюється', code: 'const f = $(\'.footer\');\nf.style.color = \'rgb(250, 204, 21)\';\nf.style.fontSize = \'20px\';\ntry {\n  expect(css(\'.link\', \'color\')).toBe(\'rgb(250, 204, 21)\');\n  expect(css(\'.subscribe\', \'color\')).toBe(\'rgb(250, 204, 21)\');\n  expect(css(\'.subscribe\', \'font-size\')).toBe(\'20px\');\n  expect(css(\'.subscribe\', \'border-top-color\')).toBe(\'rgb(250, 204, 21)\');\n} finally { f.style.color = \'\'; f.style.fontSize = \'\'; }' }
      ],
      explanation: `
Стилі браузера — теж прямі правила, тож вони перемагають успадкування. \`inherit\` працює для будь-якої властивості. Рамка без кольору бере \`currentColor\` — тому змінюється разом із текстом.

**Що можуть спитати далі:** чим \`inherit\` відрізняється від \`unset\` і \`revert\`?
`
    },
    {
      id: 'css-quiz-initial-display',
      group: 'inheritance',
      type: 'quiz',
      level: 2,
      title: 'display: initial у div',
      tags: ['inheritance', 'display'],
      question: `
Яке обчислене значення \`display\` матиме \`<div>\`?

\`\`\`css
div { display: initial; }
\`\`\`
`,
      options: ['`block`', '`inline`', '`none`', 'Залежить від браузера'],
      answer: 1,
      why: [
        '`block` задають стилі браузера для `div`; повернути їх можна через `display: revert`.',
        'Так: початкове значення `display` у специфікації — `inline`.',
        '`none` — не початкове значення `display`.',
        'Початкове значення визначає специфікація, тож воно однакове в усіх браузерах.'
      ],
      hint: '`initial` бере початкове значення властивості **зі специфікації CSS**, а не зі стилів браузера для конкретного тегу.',
      explanation: `
\`initial\` бере значення зі специфікації й нічого не знає про стилі браузера для тегу. Тому \`all: initial\` раптом робить блоки inline.
`
    },
    {
      id: 'css-inheritance',
      group: 'inheritance',
      type: 'theory',
      level: 2,
      title: 'Успадкування та ключові слова inherit / initial / unset / revert',
      tags: ['inheritance', 'cascade'],
      question: `
Співбесіда: які властивості успадковуються і чим відрізняються \`inherit\`, \`initial\`, \`unset\`, \`revert\`?
`,
      choices: [
        '`initial` повертає стиль браузера за замовчуванням, тому `div { display: initial }` дасть `block`',
        '`unset` завжди дорівнює `initial`, а `revert` — те саме, що `inherit`, але з нижчим пріоритетом',
        '`unset` діє як `inherit` для успадковуваних властивостей і як `initial` — для всіх інших',
        '`margin` і `padding` успадковуються від батька, якщо в нащадка немає власного оголошення',
        '`inherit` працює лише для успадковуваних властивостей, тому `border: inherit` ігнорується'
      ],
      correct: 2,
      why: [
        'Ні: `initial` — значення зі специфікації, для `display` це `inline`; до стилів браузера повертає `revert`.',
        'Ні: `unset` — це inherit або initial залежно від властивості, а `revert` — відкат до стилів браузера.',
        'Так: `color: unset` успадкується, а `border: unset` скинеться до початкового.',
        'Ні: margin і padding не успадковуються, інакше відступи множилися б на кожному рівні.',
        'Ні: `inherit` працює для будь-якої властивості, `border: inherit` скопіює рамку батька.'
      ],
      hint: 'Текстові vs «коробкові» властивості; що таке initial value за специфікацією.',
      answer: `
- **Успадковуються** (текст): \`color\`, \`font-*\`, \`line-height\`, \`text-align\`, \`letter-spacing\`, \`visibility\`, \`cursor\`, \`list-style\`, custom properties.
- **Не успадковуються** (коробка): \`margin\`, \`padding\`, \`border\`, \`background\`, \`width\`, \`display\`, \`position\`, \`opacity\`.
- \`inherit\` — значення батька (для будь-якої властивості).
- \`initial\` — значення зі специфікації (\`display: initial\` → \`inline\`).
- \`unset\` — inherit для успадковуваних, initial для решти.
- \`revert\` — до стилів браузера; \`revert-layer\` — до попереднього шару.
- Форми не успадковують шрифт → \`button, input { font: inherit }\`.
`,
      keyPoints: [
        'Успадковуються текстові властивості (color, font, line-height…), не успадковуються коробкові',
        'inherit — від батька; initial — значення зі специфікації',
        'unset — inherit або initial залежно від властивості',
        'revert — до стилів браузера; display: initial → inline',
        'Елементи форм не успадковують font без font: inherit'
      ],
      followUps: [
        'Чому кнопки не успадковують шрифт сторінки?',
        'Що робить all: unset і чим це небезпечно?',
        'Чи успадковуються CSS custom properties?'
      ]
    },
    {
      id: 'css-value-pipeline',
      group: 'inheritance',
      type: 'theory',
      level: 4,
      title: 'Specified → computed → used → actual: що повертає getComputedStyle',
      tags: ['cascade', 'internals'],
      question: `
Співбесіда: які етапи проходить значення CSS-властивості і що саме повертає \`getComputedStyle\`?
`,
      choices: [
        '`getComputedStyle` повертає computed value, тому для `width: 50%` завжди отримаємо рядок `"50%"`',
        '`getComputedStyle` повертає те саме, що `el.style`, але вже з урахуванням `!important`',
        '`getComputedStyle` читає готові значення з кешу і ніколи не змушує браузер рахувати layout',
        '`line-height: normal` у результаті — ознака, що браузер ще не встиг застосувати шрифт',
        '`getComputedStyle` повертає resolved value: для геометрії відрендереного елемента — used value в px'
      ],
      correct: 4,
      why: [
        'Ні: для геометрії відрендереного елемента повертається used value в px, наприклад `347.5px`.',
        'Ні: `el.style` — лише inline-оголошення, а `getComputedStyle` — результат каскаду, успадкування й layout.',
        'Ні: читання геометрії може форсувати перерахунок стилів і layout.',
        'Ні: `normal` — валідне обчислене значення `line-height`.',
        'Так: це resolved value — для більшості властивостей computed, для width/margin — used у px.'
      ],
      hint: 'Declared, cascaded, specified, computed, used, actual; resolved value.',
      answer: `
- **Declared** → **cascaded** (переможець каскаду) → **specified** (+ успадкування/initial) → **computed** (\`2em\` → \`32px\`, але \`50%\` ширини лишається %) → **used** (після layout: \`50%\` → \`347.5px\`) → **actual** (округлення пристроєм).
- Нащадки успадковують **computed**: тому \`line-height: 150%\` успадковується як px, а \`1.5\` — як множник.
- \`getComputedStyle\` повертає **resolved value**: computed, а для геометрії — used у px.
- Читання геометрії форсує layout; у циклі з записами — layout thrashing.
- \`el.style\` — лише inline-стиль.
`,
      keyPoints: [
        'Declared → cascaded → specified → computed → used → actual',
        'Успадковується computed value',
        'getComputedStyle повертає resolved value: для геометрії — used у px',
        'line-height: % vs безрозмірне — наслідок успадкування computed',
        'getComputedStyle може форсувати layout; el.style — лише inline'
      ],
      followUps: [
        'Чому getComputedStyle для display:none-елемента повертає дивні розміри?',
        'Що таке CSS Typed OM?',
        'Як уникнути layout thrashing при читанні стилів?'
      ]
    },
    {
      id: 'css-quiz-box-width',
      group: 'box-model',
      type: 'quiz',
      level: 1,
      title: 'Яка реальна ширина елемента?',
      tags: ['box-model'],
      question: `
**Як це працює:** коробка елемента = content → padding → border → margin. За замовчуванням (\`box-sizing: content-box\`) \`width\` задає лише content; \`getBoundingClientRect().width\` повертає ширину до зовнішнього краю рамки.

Що поверне \`el.getBoundingClientRect().width\`?

\`\`\`css
.box {
  width: 200px;
  padding: 20px;
  border: 5px solid;
  margin: 10px;
}
\`\`\`
`,
      options: ['`200`', '`250`', '`270`', '`240`'],
      answer: 1,
      why: [
        '200 було б з `box-sizing: border-box`.',
        'Так: 200 + 2×20 + 2×5 = 250 — рамкова коробка без margin.',
        '270 — додали margin, але він не входить у розмір елемента.',
        '240 — врахували padding лише з одного боку.'
      ],
      hint: 'За замовчуванням `box-sizing: content-box`. Чи входить margin у розмір коробки?',
      explanation: `
\`content-box\`: реальна ширина = width + padding + border. \`offsetWidth\` повертає те саме. Margin — відступ навколо коробки.
`
    },
    {
      id: 'css-border-box-columns',
      group: 'box-model',
      type: 'dom',
      level: 1,
      title: 'Колонки 50% з padding не вміщуються',
      tags: ['box-model'],
      description: `
**Завдання.** Дві колонки по \`width: 50%\` мають стояти поруч у контейнері 600px, але друга переноситься вниз. Виправте CSS.

**Де трапляється:** будь-яка сітка з відсотковими ширинами й padding; саме тому \`box-sizing: border-box\` — перший рядок кожного reset.

**Дано**
\`\`\`html
<div class="row">            <!-- width: 600px -->
  <div class="col">Ліва</div>  <!-- float: left; width: 50%; padding: 20px; border: 2px -->
  <div class="col">Права</div>
</div>
\`\`\`

**Що має вийти**
- колонки в одному ряду, кожна рівно **300px** завширшки;
- \`padding: 20px\` і рамка 2px збережені.

**Як це працює:** з \`content-box\` колонка займає 300 + 2×20 + 2×2 = 344px, дві — 688px > 600px. \`box-sizing: border-box\` включає padding і border у \`width\`: коробка — 300px, вміст стискається до 256px.

**Врахуйте:** зазвичай \`border-box\` ставлять глобально: \`*, *::before, *::after { … }\`.
`,
      html: `<div class="row">
  <div class="col">Ліва колонка</div>
  <div class="col">Права колонка</div>
</div>`,
      css: `/* 1. TODO: зробіть, щоб width включав padding і border */

.row {
  width: 600px;
  display: flow-root; /* містить float-и */
  background: #eef2ff;
}
.col {
  float: left;
  width: 50%;
  padding: 20px;
  border: 2px solid #6366f1;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `*, *::before, *::after {
  box-sizing: border-box;
}
.row {
  width: 600px;
  display: flow-root; /* містить float-и */
  background: #eef2ff;
}
.col {
  float: left;
  width: 50%;
  padding: 20px;
  border: 2px solid #6366f1;
}
`
      },
      hints: [
        'Порахуйте реальну ширину колонки: 300 + 2×20 + 2×2 = ?',
        'Потрібна одна властивість: `box-sizing: border-box`.'
      ],
      tests: [
        { name: 'колонки в одному ряду', code: 'const [a, b] = $$(\'.col\').map(rect);\nexpect(Math.abs(a.top - b.top)).toBeLessThan(1);\nexpect(b.left).toBeGreaterThanOrEqual(a.right - 1);' },
        { name: 'кожна колонка рівно 300px', code: '$$(\'.col\').forEach(c => expect(Math.abs(rect(c).width - 300)).toBeLessThan(1));' },
        { name: 'колонки не виходять за контейнер', code: 'const row = rect(\'.row\');\nconst b = rect($$(\'.col\')[1]);\nexpect(b.right).toBeLessThanOrEqual(row.right + 1);\nexpect(Math.abs(row.width - 600)).toBeLessThan(1);' },
        { name: 'padding і рамку збережено', code: 'const c = $(\'.col\');\nexpect(css(c, \'padding-left\')).toBe(\'20px\');\nexpect(css(c, \'padding-right\')).toBe(\'20px\');\nexpect(css(c, \'border-left-width\')).toBe(\'2px\');' }
      ],
      explanation: `
Альтернатива \`width: calc(50% - 44px)\` крихка: змінили padding — перераховуйте. З \`border-box\` розмір коробки дорівнює \`width\`, що й очікує дизайнер.
`
    },
    {
      id: 'css-box-model',
      group: 'box-model',
      type: 'theory',
      level: 1,
      interview: true,
      title: 'Box model і box-sizing',
      tags: ['box-model'],
      question: `
Співбесіда: що таке box model і чим \`content-box\` відрізняється від \`border-box\`?
`,
      choices: [
        'З `content-box` у `width` входять padding і border, а з `border-box` — лише сам вміст',
        'З `border-box` `width` включає padding і border, тож `width: 50%` з padding не вилізе за межі',
        'З `border-box` у `width` входить і `margin`, тому сусідні блоки ніколи не переповнюють рядок',
        '`box-shadow` і `outline` збільшують коробку так само, як border, тож їх треба враховувати у `width`'
      ],
      correct: 1,
      why: [
        'Навпаки: з `content-box` width — лише вміст, а з `border-box` — вміст + padding + border.',
        'Так: padding і border «зʼїдають» простір усередині заданої ширини.',
        'Ні: margin не входить у width за жодного `box-sizing`.',
        'Ні: `box-shadow` і `outline` малюються поверх і місця в layout не займають.'
      ],
      hint: 'Чотири області коробки; що саме задає width.',
      answer: `
- Області: **content → padding → border → margin** (margin прозорий, може бути відʼємним).
- \`content-box\` (за замовч.): ширина = width + padding + border.
- \`border-box\`: ширина = width; зручно для \`width: 50%\` з padding.
- Reset: \`*, *::before, *::after { box-sizing: border-box; }\`.
- \`offsetWidth\` — border box; \`clientWidth\` — content + padding; \`outline\`/\`box-shadow\` місця не займають.
`,
      keyPoints: [
        'content → padding → border → margin',
        'content-box: width лише для content; border-box: включає padding і border',
        'Margin ніколи не входить у width',
        'Глобальний reset на border-box і чому він зручний',
        'offsetWidth / clientWidth / getBoundingClientRect'
      ],
      followUps: [
        'Чим outline відрізняється від border?',
        'Що таке margin collapsing?',
        'Чим clientWidth відрізняється від offsetWidth?'
      ]
    },
    {
      id: 'css-quiz-margin-collapse',
      group: 'box-model',
      type: 'quiz',
      level: 2,
      title: 'Відстань між блоками зі схлопуванням',
      tags: ['box-model', 'margin'],
      question: `
**Як це працює:** у звичайному блочному потоці вертикальні margin сусідніх блоків не додаються, а **схлопуються** — береться більший. Горизонтальні margin і flex/grid-елементи не схлопуються.

Яка відстань по вертикалі буде між \`.a\` і \`.b\`?

\`\`\`html
<div class="a">A</div>
<div class="b">B</div>
\`\`\`
\`\`\`css
.a { margin-bottom: 30px; }
.b { margin-top: 20px; }
\`\`\`
`,
      options: ['50px', '30px', '20px', '10px'],
      answer: 1,
      why: [
        '50px було б у flex/grid-контейнері або для горизонтальних margin — там вони додаються.',
        'Так: вертикальні margin сусідніх блоків схлопуються в max(30, 20).',
        'Береться більший margin, а не менший.',
        'Margin не віднімаються.'
      ],
      hint: 'Звичайні блоки в нормальному потоці, вертикальні відступи стикаються.',
      explanation: `
З відʼємним margin: max(додатних) + min(відʼємних), тобто 30 і −10 дають 20px. Тому багато команд задають лише \`margin-bottom\` — відступи передбачувані.
`
    },
    {
      id: 'css-prevent-margin-collapse',
      group: 'box-model',
      type: 'dom',
      level: 3,
      title: 'Margin дитини «випадає» з батька',
      tags: ['box-model', 'margin', 'bfc'],
      description: `
**Завдання.** \`margin-top\` заголовка зʼявляється **над** сірою карткою, а не всередині, а \`margin-bottom\` останнього абзацу «випадає» вниз. Виправте.

**Де трапляється:** картки, модалки, секції з фоном — класичний «баг» верстки, про який питають на співбесідах.

**Дано**
\`\`\`html
<p class="before">Текст до картки</p>          <!-- margin-bottom: 16px -->
<section class="card">                         <!-- фон #e5e7eb, без padding/border -->
  <h2 class="title">Заголовок картки</h2>      <!-- margin-top: 24px -->
  <p class="last">Останній абзац картки</p>    <!-- margin-bottom: 16px -->
</section>
\`\`\`

**Що має вийти**
- заголовок на 24px нижче верхнього краю картки;
- останній абзац на 16px вище нижнього краю картки;
- між \`.before\` і карткою — 16px (зараз 24px).

**Як це працює:** margin першої/останньої дитини схлопується з margin батька, якщо між ними немає padding чи border. \`display: flow-root\` створює новий блоковий контекст (BFC), і margin дітей лишаються всередині батька.

**Врахуйте:** margin заголовка й абзаців не змінюйте, padding і border картці не додавайте.
`,
      html: `<p class="before">Текст до картки</p>
<section class="card">
  <h2 class="title">Заголовок картки</h2>
  <p class="last">Останній абзац картки</p>
</section>`,
      css: `.before { margin: 0 0 16px; }
.card {
  background: #e5e7eb;
  /* TODO: не випускати margin дітей назовні */
}
.title { margin: 24px 0 8px; }
.last { margin: 0 0 16px; }
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.before { margin: 0 0 16px; }
.card {
  background: #e5e7eb;
  display: flow-root; /* новий BFC: margin дітей не виходять назовні */
}
.title { margin: 24px 0 8px; }
.last { margin: 0 0 16px; }
`
      },
      hints: [
        'Margin дитини «випадає», бо зливається з margin батька — потрібно, щоб картка стала окремим блоковим контекстом.',
        '`.card { display: flow-root; }` — створює BFC без побічних ефектів.'
      ],
      tests: [
        { name: 'заголовок на 24px нижче верхнього краю картки', code: 'expect(Math.abs(rect(\'.title\').top - rect(\'.card\').top - 24)).toBeLessThan(1);' },
        { name: 'останній абзац на 16px вище нижнього краю', code: 'expect(Math.abs(rect(\'.card\').bottom - rect(\'.last\').bottom - 16)).toBeLessThan(1);' },
        { name: 'між .before і карткою 16px', code: 'expect(Math.abs(rect(\'.card\').top - rect(\'.before\').bottom - 16)).toBeLessThan(1);' },
        { name: 'margin і padding/border не змінювались', code: 'expect(css(\'.title\', \'margin-top\')).toBe(\'24px\');\nexpect(css(\'.last\', \'margin-bottom\')).toBe(\'16px\');\nexpect(css(\'.card\', \'padding-top\')).toBe(\'0px\');\nexpect(css(\'.card\', \'padding-bottom\')).toBe(\'0px\');\nexpect(css(\'.card\', \'border-top-width\')).toBe(\'0px\');' }
      ],
      explanation: `
До виправлення 24px заголовка опиняються над карткою і схлопуються з 16px \`.before\` → 24px. Альтернатива \`overflow: hidden\` теж створює BFC, але обрізає тіні й випадаючі меню.

**Що можуть спитати далі:** що ще робить BFC? (Містить float-и — сучасна заміна clearfix.)
`
    },
    {
      id: 'css-margin-collapse',
      group: 'box-model',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Схлопування margin (margin collapsing)',
      tags: ['box-model', 'margin'],
      question: `
Співбесіда: що таке схлопування margin, коли воно відбувається і як ним керувати? Оберіть **усі** правильні твердження.
`,
      choices: [
        '`margin-bottom: 30px` і `margin-top: 20px` сусідніх блоків дають відстань `30px`, а не `50px`',
        'Горизонтальні margin сусідніх inline-block елементів теж схлопуються, якщо між ними немає пробілу',
        'У flex- і grid-контейнерах margin дітей не схлопуються ні між собою, ні з контейнером',
        '`display: flow-root` на батькові не дає margin першої дитини «випасти» назовні батька',
        'Для `30px` і `-10px` результатом буде `30px`, бо при схлопуванні завжди береться максимум'
      ],
      correct: [0, 2, 3],
      why: [
        'Так: вертикальні margin сусідніх блоків зливаються в більший — 30px.',
        'Ні: горизонтальні margin не схлопуються ніколи, inline-block теж.',
        'Так: у flex/grid схлопування немає — ні між дітьми, ні з контейнером.',
        'Так: `flow-root` створює BFC, і margin дітей лишаються всередині.',
        'Ні: з відʼємним — max(додатних) + min(відʼємних) = 20px.'
      ],
      hint: 'Три випадки: сусіди, батько і перша/остання дитина, порожній блок. Що «ламає» схлопування?',
      answer: `
- Лише **вертикальні** margin у **блочному** потоці; результат — максимум.
- Випадки: сусіди; батько + перша/остання дитина (без padding/border); порожній блок.
- Відʼємні: max(додатних) + min(відʼємних).
- Не схлопуються: flex/grid, padding/border між ними, BFC (\`display: flow-root\`, \`overflow ≠ visible\`), float.
- Керування: \`flow-root\`, padding замість margin, відступи лише в один бік, \`gap\`.
`,
      keyPoints: [
        'Лише вертикальні margin у блочному потоці; результат — максимум',
        'Три випадки: сусіди, батько + перша/остання дитина, порожній блок',
        'Відʼємні: max(додатних) + min(відʼємних)',
        'Немає схлопування у flex/grid, з padding/border, при BFC (flow-root, overflow)',
        'Керування: flow-root, padding, односторонні відступи, gap'
      ],
      followUps: [
        'Що таке BFC і як його створити?',
        'Чому overflow: hidden — не найкращий спосіб?',
        'Чи схлопуються margin у inline-block?'
      ]
    },
    {
      id: 'css-quiz-inline-box',
      group: 'display',
      type: 'quiz',
      level: 2,
      title: 'Що працює для inline-елемента?',
      tags: ['box-model', 'display'],
      question: `
**Як це працює:** \`display\` визначає, як елемент стоїть у потоці. \`block\` — з нового рядка, поважає width/height. \`inline\` (\`span\`, \`a\`) — шматок тексту в рядку: розмір задають вміст і \`line-height\`. \`inline-block\` — у рядку, але з розмірами як у блоку.

Оберіть **усі** правила, які вплинуть на \`span\` так, як очікує автор:

\`\`\`css
span.tag {
  width: 200px;
  height: 50px;
  margin: 20px;
  padding: 10px;
}
\`\`\`
`,
      options: [
        '`width: 200px` задасть ширину',
        '`height: 50px` задасть висоту',
        '`margin-left/right: 20px` відсунуть сусідній текст',
        '`margin-top/bottom: 20px` відсунуть рядки вище і нижче',
        '`padding` розширить фон з усіх боків, але вертикальний не зсуне сусідні рядки'
      ],
      answer: [2, 4],
      why: [
        'Inline-елемент ігнорує `width` — ширина від вмісту.',
        '`height` теж ігнорується — висоту рядка задає `line-height`.',
        'Так: горизонтальні margin працюють і відсувають сусідній текст.',
        'Вертикальні margin у inline-елемента на layout не впливають.',
        'Так: фон розширюється, але висоту рядка вертикальний padding не змінює.'
      ],
      hint: 'Inline-елемент — це фрагмент тексту в рядку. Його висоту визначає line-height, а не коробка.',
      explanation: `
Щоб працювали розміри й вертикальні margin — \`display: inline-block\` або \`block\`. Виняток — заміщені елементи (\`img\`, \`input\`): їм width/height працюють і в inline.
`
    },
    {
      id: 'css-quiz-hide-click',
      group: 'display',
      type: 'quiz',
      level: 2,
      title: 'Невидимий, але клікабельний',
      tags: ['display', 'visibility'],
      question: `
**Як це працює:** \`display: none\` — елемента немає; \`visibility: hidden\` — місце є, але кліків і screen reader немає; \`opacity: 0\` — лише прозорі пікселі, елемент на місці й отримує події.

Після «приховування» модалки користувачі не можуть клікнути по кнопках під нею. Яким способом модалку, найімовірніше, сховали?
`,
      options: ['`display: none`', '`visibility: hidden`', '`opacity: 0`', 'атрибутом `hidden`'],
      answer: 2,
      why: [
        '`display: none` прибирає елемент повністю — кліки дійшли б до кнопок.',
        '`visibility: hidden` не отримує подій миші — кліки проходять крізь нього.',
        'Так: прозорий елемент лишається на місці й перехоплює кліки.',
        '`hidden` = `display: none` зі стилів браузера.'
      ],
      hint: 'Який спосіб ховає елемент лише візуально, залишаючи його повноцінним учасником layout і подій?',
      explanation: `
Невидимий шар «зʼїдає» кліки, отримує фокус і читається screen reader-ом. Виправлення для плавного зникнення: \`opacity: 0; visibility: hidden;\` (transition на обидві) або атрибут \`inert\`.
`
    },
    {
      id: 'css-ellipsis',
      group: 'display',
      type: 'dom',
      level: 1,
      title: 'Обрізати текст трикрапкою (1 і 2 рядки)',
      tags: ['overflow', 'text'],
      description: `
**Завдання.** У картці товару обріжте назву в один рядок, а опис — у два рядки з трикрапкою.

**Де трапляється:** картки товарів, списки чатів, таблиці — довгі назви не мають ламати верстку.

**Дано**
\`\`\`html
<div class="card">                  <!-- width: 200px -->
  <p class="title">Ноутбук Lenovo ThinkPad X1 … </p>   <!-- line-height: 24px -->
  <p class="desc">Легкий і міцний ультрабук … </p>     <!-- line-height: 20px -->
</div>
\`\`\`

**Що має вийти**
- \`.title\` — один рядок висотою 24px, надлишок обрізано \`…\`;
- \`.desc\` — максимум 2 рядки (висота ≈ 40px), далі \`…\`.

**Як це працює:** для одного рядка потрібні всі три: \`white-space: nowrap\` (не переносити), \`overflow: hidden\` (сховати надлишок), \`text-overflow: ellipsis\` (показати \`…\`). Для кількох рядків — \`-webkit-line-clamp\` разом із \`display: -webkit-box; -webkit-box-orient: vertical\`.

**Врахуйте:** ширину картки й HTML не змінюйте.
`,
      html: `<div class="card">
  <p class="title">Ноутбук Lenovo ThinkPad X1 Carbon Gen 12 з екраном 14 дюймів</p>
  <p class="desc">Легкий і міцний ультрабук для бізнесу: процесор Intel Core Ultra, 32 ГБ памʼяті, SSD на 1 ТБ і автономність до 15 годин роботи.</p>
</div>`,
      css: `.card { width: 200px; border: 1px solid #ddd; padding: 8px; font-family: system-ui, sans-serif; }
.title { margin: 0 0 6px; font-size: 16px; line-height: 24px; font-weight: 600; }
.desc { margin: 0; font-size: 14px; line-height: 20px; color: #4b5563; }

/* 1. .title — один рядок з … (три властивості) */
/* TODO */

/* 2. .desc — не більше 2 рядків з … */
/* TODO */
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.card { width: 200px; border: 1px solid #ddd; padding: 8px; font-family: system-ui, sans-serif; }
.title { margin: 0 0 6px; font-size: 16px; line-height: 24px; font-weight: 600; }
.desc { margin: 0; font-size: 14px; line-height: 20px; color: #4b5563; }

.title {
  white-space: nowrap;      /* заборонити перенос */
  overflow: hidden;         /* сховати надлишок */
  text-overflow: ellipsis;  /* показати … */
}

.desc {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}
`
      },
      hints: [
        'Один рядок: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`.',
        'Два рядки: `display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;`.'
      ],
      tests: [
        { name: '.title — один рядок висотою 24px', code: 'expect(Math.abs(rect(\'.title\').height - 24)).toBeLessThan(1);\nexpect(css(\'.title\', \'white-space\')).toBe(\'nowrap\');' },
        { name: '.title обрізається трикрапкою', code: 'expect(css(\'.title\', \'overflow-x\')).toBe(\'hidden\');\nexpect(css(\'.title\', \'text-overflow\')).toBe(\'ellipsis\');\nconst t = $(\'.title\');\nexpect(t.scrollWidth).toBeGreaterThan(t.clientWidth);' },
        { name: 'ширина картки не змінилась', code: 'expect(Math.abs(rect(\'.title\').width - 200)).toBeLessThan(1);' },
        { name: '.desc — не більше двох рядків з clamp', code: 'expect(css(\'.desc\', \'-webkit-line-clamp\')).toBe(\'2\');\nexpect(css(\'.desc\', \'overflow-y\')).toBe(\'hidden\');\nexpect(rect(\'.desc\').height).toBeLessThanOrEqual(41);\nexpect(rect(\'.desc\').height).toBeGreaterThanOrEqual(39);' }
      ],
      explanation: `
Без будь-якої з трьох властивостей трикрапка не зʼявиться. \`-webkit-line-clamp\` з префіксом стандартизований і працює в усіх браузерах. Повний текст лишається в DOM — screen reader прочитає його; зрячим варто дати \`title\` чи тултип.
`
    },
    {
      id: 'css-display-hide',
      group: 'display',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'display, а також display:none vs visibility vs opacity',
      tags: ['display', 'visibility'],
      question: `
Співбесіда: чим відрізняються block, inline, inline-block і як порівняти \`display: none\`, \`visibility: hidden\`, \`opacity: 0\`? Оберіть **усі** правильні твердження.
`,
      choices: [
        'Елемент з `opacity: 0` невидимий, але лишається клікабельним, фокусованим і читається screen reader-ом',
        '`visibility: hidden` прибирає елемент із потоку, як `display: none`, але дозволяє плавну анімацію',
        'Нащадок елемента з `visibility: hidden` може знову стати видимим через `visibility: visible`',
        'Inline-елементу можна задати `width`, `height` і вертикальні margin — вони лише не схлопуються',
        '`display: none` лишає елемент у дереві доступності, тому screen reader його все одно прочитає'
      ],
      correct: [0, 2],
      why: [
        'Так: `opacity` робить лише пікселі прозорими — події й доступність лишаються.',
        'Ні: `visibility: hidden` зберігає місце; з потоку прибирає лише `display: none`.',
        'Так: `visibility` успадковується, і нащадок може повернути `visible`.',
        'Ні: inline-елемент ігнорує width/height і вертикальні margin.',
        'Ні: `display: none` прибирає елемент і з дерева доступності.'
      ],
      hint: 'Хто займає місце, хто отримує кліки, хто читається screen reader, що можна анімувати.',
      answer: `
| | block | inline | inline-block |
|---|---|---|---|
| Новий рядок | так | ні | ні |
| width/height, вертикальні margin | ✓ | ✗ | ✓ |

| | \`display: none\` | \`visibility: hidden\` | \`opacity: 0\` |
|---|---|---|---|
| Місце | ✗ | ✓ | ✓ |
| Кліки, фокус | ✗ | ✗ | ✓ |
| Screen reader | ✗ | ✗ | ✓ |
| Плавна анімація | ✗ | дискретно | ✓ |

- Плавне зникнення: \`opacity\` + \`visibility\` з transition.
- Сховати лише візуально, але лишити для SR — клас \`.sr-only\`.
- Атрибут \`hidden\` легко перебити своїм \`display\` — додають \`[hidden] { display: none !important; }\`.
`,
      keyPoints: [
        'block / inline / inline-block: рядок, ширина, width/height, вертикальні margin',
        'display:none — немає місця, подій, SR',
        'visibility:hidden — місце є, подій і SR немає, діти можуть стати видимими',
        'opacity:0 — місце, кліки, фокус і SR залишаються',
        'Анімація зникнення: opacity + visibility; hidden легко перебити display'
      ],
      followUps: [
        'Що таке display: contents і які в нього проблеми?',
        'Як анімувати появу з display: none?',
        'Чому під картинкою зʼявляється відступ?'
      ]
    },
    {
      id: 'css-quiz-em-compounding',
      group: 'units',
      type: 'quiz',
      level: 2,
      title: 'Накопичення em у вкладених елементах',
      tags: ['units'],
      question: `
**Як це працює:** \`rem\` — від font-size \`html\`. \`em\` у \`font-size\` — від шрифту **батька**, тому при вкладенні множиться на кожному рівні. В інших властивостях (\`padding\`) \`em\` — від власного шрифту елемента.

Який обчислений \`font-size\` у тексту «Пункт»?

\`\`\`css
html  { font-size: 16px; }
.menu { font-size: 1.25em; }
\`\`\`
\`\`\`html
<ul class="menu">
  <li>
    <ul class="menu">
      <li>Пункт</li>
    </ul>
  </li>
</ul>
\`\`\`
`,
      options: ['20px', '16px', '25px', '31.25px'],
      answer: 2,
      why: [
        '20px — лише зовнішнє меню; внутрішнє множить ще раз.',
        '16px — шрифт кореня, а `1.25em` у `.menu` його збільшує.',
        'Так: 16 × 1.25 = 20 (зовнішнє), 20 × 1.25 = 25 (внутрішнє).',
        '31.25px було б на третьому рівні вкладеності.'
      ],
      hint: '`em` у font-size — від шрифту батька. Скільки разів множимо на 1.25?',
      explanation: `
З \`1.25rem\` обидва меню мали б рівно 20px незалежно від глибини.
`
    },
    {
      id: 'css-em-rem',
      group: 'units',
      type: 'dom',
      level: 2,
      title: 'em vs rem: виправити розмір шрифтів',
      tags: ['units'],
      description: `
**Завдання.** Виправте одиниці: пункти меню на будь-якій глибині однакові, а відступи кнопок пропорційні їхньому шрифту.

**Де трапляється:** вкладені меню, коментарі, дизайн-система з кнопками кількох розмірів.

**Дано**
\`\`\`html
<nav class="menu"><ul><li class="l1">Каталог <ul><li class="l2">… <ul><li class="l3">…</li></ul></li></ul></li></ul></nav>
<button class="btn">Купити</button>
<button class="btn btn--large">Купити зараз</button>
\`\`\`

**Що має вийти** (корінь \`html\` — 16px)
- \`.l1\`, \`.l2\`, \`.l3\` — усі **19.2px** (зараз ростуть з кожним рівнем);
- \`.btn\` — 16px, padding \`8px 16px\`; \`.btn--large\` — 20px, padding \`10px 20px\`;
- якщо корінь стане 20px (тест змінить), усе масштабується: \`.l3\` = 24px, \`.btn--large\` = 25px з padding-left 25px.

**Як це працює:** \`em\` у \`font-size\` множиться на шрифт батька на кожному рівні, \`rem\` — завжди від \`html\`. \`em\` у \`padding\` рахується від шрифту самого елемента, тож велика кнопка автоматично отримує більші відступи.

**Врахуйте:** px у font-size не відреагує на зміну кореня.
`,
      html: `<nav class="menu">
  <ul>
    <li class="l1">Каталог
      <ul>
        <li class="l2">Ноутбуки
          <ul>
            <li class="l3">Ультрабуки</li>
          </ul>
        </li>
      </ul>
    </li>
  </ul>
</nav>
<button type="button" class="btn">Купити</button>
<button type="button" class="btn btn--large">Купити зараз</button>`,
      css: `html { font-size: 16px; }

/* 1. TODO: розмір меню без накопичення при вкладенні */
.menu ul { font-size: 1.2em; }

/* 2. TODO: шрифт кнопок від кореня, padding = 0.5 × 1 від власного шрифту */
.btn { font-size: 16px; padding: 8px 16px; }
.btn--large { font-size: 20px; }
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `html { font-size: 16px; }
.menu ul { font-size: 1.2rem; }      /* від кореня — без накопичення */
.btn { font-size: 1rem; padding: 0.5em 1em; } /* padding — від власного шрифту */
.btn--large { font-size: 1.25rem; }
`
      },
      hints: [
        'Яка одиниця рахується завжди від `html`, без множення на батька?',
        'Для padding від власного шрифту кнопки — `em`: `padding: 0.5em 1em`; шрифти — `1rem` і `1.25rem`.'
      ],
      tests: [
        { name: 'пункти меню на всіх рівнях — 19.2px', code: '[\'.l1\', \'.l2\', \'.l3\'].forEach(s => expect(parseFloat(css(s, \'font-size\'))).toBeCloseTo(19.2, 1));' },
        { name: 'кнопки: 16px і 20px', code: 'expect(css(\'.btn:not(.btn--large)\', \'font-size\')).toBe(\'16px\');\nexpect(css(\'.btn--large\', \'font-size\')).toBe(\'20px\');' },
        { name: 'padding звичайної кнопки 8px 16px', code: 'const b = $(\'.btn:not(.btn--large)\');\nexpect(css(b, \'padding-top\')).toBe(\'8px\');\nexpect(css(b, \'padding-left\')).toBe(\'16px\');' },
        { name: 'padding великої кнопки пропорційний: 10px 20px', code: 'const b = $(\'.btn--large\');\nexpect(css(b, \'padding-top\')).toBe(\'10px\');\nexpect(css(b, \'padding-left\')).toBe(\'20px\');' },
        { name: 'усе масштабується від кореневого шрифту', code: 'const root = document.documentElement;\nroot.style.fontSize = \'20px\';\ntry {\n  expect(parseFloat(css(\'.l3\', \'font-size\'))).toBeCloseTo(24, 1);\n  expect(css(\'.btn--large\', \'font-size\')).toBe(\'25px\');\n  expect(css(\'.btn--large\', \'padding-left\')).toBe(\'25px\');\n} finally {\n  root.style.fontSize = \'\';\n}' }
      ],
      explanation: `
Патерн дизайн-систем: **rem** — для розміру компонента, **em** — для його внутрішніх пропорцій. \`html { font-size: 16px }\` у px перебиває налаштування шрифту користувача — краще \`100%\` або не задавати.
`
    },
    {
      id: 'css-quiz-percent-padding',
      group: 'units',
      type: 'quiz',
      level: 3,
      title: 'Відсотки у padding-top',
      tags: ['box-model', 'units'],
      question: `
Чому дорівнюватиме \`padding-top\` дочірнього елемента?

\`\`\`css
.parent { width: 400px; height: 100px; }
.child  { padding-top: 50%; }
\`\`\`
`,
      options: [
        '`50px` — половина висоти батька',
        '`0` — відсотки у padding не працюють без явної висоти дитини',
        '`200px`',
        '`100px`'
      ],
      answer: 2,
      why: [
        'Від висоти виникла б циклічна залежність: висота батька залежить від padding дитини.',
        'Відсоткові padding працюють завжди — вони рахуються від ширини контейнера.',
        'Так: відсоткові padding і margin з усіх боків рахуються від **ширини** контейнера: 50% × 400 = 200px.',
        '100px — це висота батька, а відсоток рахується від ширини.'
      ],
      hint: 'Відсотки в padding і margin — **з усіх чотирьох сторін** — рахуються від однієї й тієї ж величини контейнера.',
      explanation: `
На цьому стояв старий хак пропорційних блоків: \`height: 0; padding-top: 56.25%\` (16:9). Сьогодні — \`aspect-ratio: 16 / 9\`. А \`height\` у відсотках рахується від висоти батька.
`
    },
    {
      id: 'css-quiz-currentcolor',
      group: 'units',
      type: 'quiz',
      level: 1,
      title: 'currentColor',
      tags: ['colors'],
      question: `
Якого кольору буде рамка кнопки при наведенні?

\`\`\`css
.icon-btn {
  color: #2563eb;
  border: 2px solid currentColor;
}
.icon-btn:hover {
  color: #dc2626;
}
\`\`\`
`,
      options: [
        'Синя — currentColor обчислюється один раз при завантаженні',
        'Червона',
        'Чорна — currentColor завжди дорівнює кольору тексту батька',
        'Прозора — currentColor працює лише в SVG'
      ],
      answer: 1,
      why: [
        '`currentColor` не «заморожується» — перераховується разом із `color`.',
        'Так: на hover `color` стає червоним, і рамка з `currentColor` — теж.',
        'Береться `color` самого елемента, а тут він заданий явно.',
        '`currentColor` працює в будь-якій властивості з кольором: border, outline, box-shadow, fill.'
      ],
      hint: '`currentColor` — це посилання на поточне значення властивості `color` цього ж елемента.',
      explanation: `
Одне правило на hover змінює і текст, і рамку, і SVG-іконку з \`fill: currentColor\`. \`border-color\` за замовчуванням і так дорівнює \`currentColor\`.
`
    },
    {
      id: 'css-units',
      group: 'units',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Одиниці виміру: px, em, rem, %, vw/vh/dvh, ch',
      tags: ['units'],
      question: `
Співбесіда: які одиниці ви використовуєте і коли? Чим em відрізняється від rem? Що не так із \`100vh\` на мобільних? Оберіть **усі** правильні твердження.
`,
      choices: [
        '`rem` рахується від font-size `html`, тому не накопичується при вкладенні, на відміну від `em`',
        '`%` у `padding-top` рахується від висоти контейнера, а в `padding-left` — від його ширини',
        'На мобільних `100vh` відповідає viewport без адресної панелі, тож низ контенту ховається; `100dvh` це виправляє',
        '`em` для будь-якої властивості, зокрема `padding`, рахується від font-size батька',
        '`html { font-size: 14px }` безпечний для a11y, бо `rem` однаково масштабується з налаштуваннями шрифту'
      ],
      correct: [0, 2],
      why: [
        'Так: `rem` завжди від кореня, а `em` у font-size множиться на кожному рівні.',
        'Ні: відсоткові padding з усіх боків рахуються від ширини контейнера.',
        'Так: `100vh` — найбільший viewport (панель схована), `dvh` змінюється разом із панеллю.',
        'Ні: em у `font-size` — від батька, а в `padding` — від власного шрифту.',
        'Ні: px у корені перебиває налаштування шрифту користувача, і rem уже не масштабується.'
      ],
      hint: 'Абсолютні vs відносні; від чого рахується кожна відносна одиниця.',
      answer: `
- \`px\` — рамки, тіні, дрібні деталі.
- \`rem\` — шрифти й відступи; поважає налаштування шрифту користувача.
- \`em\` — від шрифту батька (font-size) або власного (інші властивості); накопичується; зручно для padding компонентів.
- \`%\` — залежить від властивості: width/padding/margin — від ширини контейнера, height — від висоти.
- \`vw\`/\`vh\`; на мобільних \`100vh\` ховає низ під панеллю → \`100dvh\` (\`svh\`, \`lvh\`).
- \`ch\` — ширина «0» (\`max-width: 65ch\`).
- Функції: \`calc()\`, \`min()\`, \`max()\`, \`clamp()\`.
`,
      keyPoints: [
        'em — від шрифту батька (для font-size) і накопичується; rem — від html',
        'rem для шрифтів поважає налаштування користувача (a11y)',
        '% у padding/margin — від ширини контейнера',
        '100vh на мобільних і dvh/svh/lvh',
        'ch для довжини рядка, clamp() для адаптивної типографіки'
      ],
      followUps: [
        'Чому line-height краще задавати без одиниць?',
        'Чому 100vw дає горизонтальний скрол?',
        'Коли em кращий за rem?'
      ]
    }
  ]
});
