FE.topic('a11y', {
  intro: `
## Навіщо

Постійні (~16% людей), тимчасові (зламана рука) та ситуативні (сонце на екрані) обмеження. Закони: ADA (США), **European Accessibility Act** (з червня 2025), EN 301 549 → WCAG AA. Бонуси: SEO, кращий UX, тестованість.

## WCAG 2.2 — POUR

| Принцип | Суть | Приклади |
|---|---|---|
| **P**erceivable | можна сприйняти | alt, субтитри, контраст 4.5:1 |
| **O**perable | можна керувати | клавіатура, без пасток фокусу, target size 24px |
| **U**nderstandable | зрозуміло | lang, передбачувана поведінка, зрозумілі помилки |
| **R**obust | сумісно з AT | правильні імʼя, роль, стан |

Рівні: **A** (мінімум), **AA** (стандарт законів і ТЗ), **AAA** (бажано).

## ARIA

1. **Перше правило:** є нативний елемент — беріть його (\`<button>\`, а не \`<div role="button">\`).
2. ARIA змінює **лише семантику** — не додає фокус, клавіатуру, поведінку.
3. **Ролі** (\`role="tab"\`), **стани** (\`aria-expanded\`, \`aria-selected\`, \`aria-checked\`, \`aria-pressed\`), **властивості** (\`aria-controls\`, \`aria-labelledby\`, \`aria-describedby\`).
4. \`aria-hidden="true"\` — ніколи на фокусованих елементах; щоб заблокувати область — \`inert\`.

**Доступне імʼя:** \`aria-labelledby\` > \`aria-label\` > нативне (\`<label>\`, \`alt\`, \`<caption>\`) > вміст > \`title\`/\`placeholder\`. \`aria-describedby\` — опис.

## Фокус і клавіатура

- \`tabindex="0"\` — у природному порядку; \`"-1"\` — лише \`el.focus()\`; **додатні — ніколи**.
- \`:focus-visible { outline: 2px solid; }\` — не прибирати outline без заміни.
- Кнопка: Enter і Space; посилання: Enter; Escape закриває модалки/меню.
- Модалка: фокус усередину → trap → Esc → фокус на тригер. Або \`<dialog>.showModal()\`.
- Складені віджети: **roving tabindex** — один \`tabindex="0"\`, стрілки переміщують фокус.
- Skip link «Перейти до вмісту» → \`#main\`.

## Live regions

\`\`\`html
<div role="status"></div> <!-- polite -->
<div role="alert"></div>  <!-- assertive: помилки -->
\`\`\`
Регіон має **існувати в DOM до** зміни тексту.

## Візуальне і тестування

- Контраст тексту ≥ **4.5:1**, великого тексту і UI-компонентів ≥ **3:1**; не лише кольором.
- \`prefers-reduced-motion\`, zoom 200%, reflow на 320px.
- axe/Lighthouse (~30–40% проблем) → клавіатура → screen reader (NVDA, VoiceOver) → \`getByRole\` у тестах.
`,
  groups: [
    {
      id: 'basics',
      title: 'Навіщо доступність і WCAG'
    },
    {
      id: 'aria',
      title: 'Семантика і ARIA'
    },
    {
      id: 'naming',
      title: 'Доступне імʼя, alt і приховування'
    },
    {
      id: 'live',
      title: 'Live regions і помилки у формах'
    },
    {
      id: 'focus',
      title: 'Фокус, tabindex і skip link'
    },
    {
      id: 'modal',
      title: 'Доступне модальне вікно'
    },
    {
      id: 'widgets',
      title: 'Складені віджети: акордеон, вкладки'
    },
    {
      id: 'visual',
      title: 'Контраст, рух і тестування'
    }
  ],
  items: [
    // ───────────────────────── 1. Навіщо і WCAG ─────────────────────────
    {
      id: 'a11y-why',
      group: 'basics',
      type: 'theory',
      level: 1,
      interview: true,
      title: 'Що таке доступність і навіщо вона бізнесу?',
      tags: ['basics'],
      question: 'Що таке веб-доступність (a11y)? Для кого вона і чому це не «опціональна фіча»? Оберіть **усі** правильні твердження.',
      choices: [
        'Доступність потрібна не лише людям з постійною інвалідністю, а й при тимчасових і ситуативних обмеженнях',
        'European Accessibility Act з червня 2025 робить доступність обовʼязковою для e-commerce і банків у ЄС',
        'Доступність стосується лише незрячих, тому достатньо забезпечити сумісність зі screen reader',
        'Оверлей-скрипт доступності повністю закриває юридичні вимоги без жодних змін у розмітці',
        'Доступність — суто юридична вимога: на SEO чи якість і тестованість коду вона не впливає'
      ],
      correct: [0, 1],
      why: [
        'Правильно: зламана рука, яскраве сонце чи одна вільна рука теж створюють барʼєри.',
        'Правильно: EAA (через EN 301 549 → WCAG AA) обовʼязковий для e-commerce, банків, транспорту в ЄС з 28.06.2025.',
        'Хибно: є ще користувачі лише з клавіатурою, слабозорі, люди з порушеннями слуху та когнітивними особливостями.',
        'Хибно: оверлей не виправляє розмітку і не захищає від позовів — проблему вирішують у коді.',
        'Хибно: семантична розмітка покращує SEO, а доступні компоненти легше тестувати через getByRole.'
      ],
      hint: 'Подумайте про різні типи обмежень (постійні, тимчасові, ситуативні), закони та побічні вигоди.',
      answer: `
**Доступність (a11y)** — інтерфейсом можуть користуватися люди з різними можливостями: незрячі й слабозорі, з порушеннями слуху, моторики (лише клавіатура, голос), когнітивними особливостями.

**Хто виграє:** постійні обмеження (~16% людей, ВООЗ), тимчасові (травма), ситуативні (сонце, шумне метро, одна рука), літні люди, «power users» з клавіатурою.

**Чому обовʼязково:**
- **Закони:** ADA і Section 508 (США), **European Accessibility Act** (з 28.06.2025) → EN 301 549 → WCAG AA. Тисячі позовів щороку.
- **Гроші:** якщо «Оплатити» — це \`div\`, частина клієнтів не купить.
- **SEO і якість:** семантика краще індексується, код легше тестувати (\`getByRole\`).

**Як забезпечується:** семантичний HTML, клавіатура, видимий фокус, текстові альтернативи, контраст, ARIA там, де HTML не вистачає, перевірка зі screen reader.
`,
      keyPoints: [
        'Постійні, тимчасові та ситуативні обмеження',
        'Закони: ADA, European Accessibility Act (2025), EN 301 549',
        'Бізнес: більше клієнтів, SEO, менше юридичних ризиків',
        'Основа — семантичний HTML, клавіатура, контраст, текстові альтернативи'
      ],
      followUps: ['Що таке WCAG і які в ньому рівні?', 'З чого почнете аудит доступності існуючого проєкту?', 'Чи можна «зробити доступність» оверлей-віджетом?']
    },
    {
      id: 'a11y-quiz-wcag-level',
      group: 'basics',
      type: 'quiz',
      level: 1,
      title: 'Який рівень WCAG — стандарт індустрії?',
      tags: ['wcag'],
      question: 'Замовник каже: «сайт має відповідати вимогам доступності, як у законодавстві ЄС». Який рівень WCAG зазвичай мається на увазі?',
      options: ['A', 'AA', 'AAA', 'Будь-який — рівні відрізняються лише рекомендаціями'],
      answer: 1,
      why: [
        'A — лише мінімум; закони вимагають більше (контраст, видимий фокус, зрозумілі помилки).',
        'Правильно: EN 301 549 (на нього посилається EAA), ADA-практика і Section 508 орієнтуються на WCAG AA.',
        'W3C не радить вимагати AAA для цілого сайту — частину критеріїв неможливо виконати для всього контенту.',
        'Рівні — це набори конкретних перевірюваних критеріїв, а не рекомендації; AA включає всі критерії A.'
      ],
      hint: 'Один рівень — мінімум, інший — недосяжний для всього сайту. Що посередині?',
      explanation: `
Цільовий рівень у законах і ТЗ — **WCAG 2.1/2.2 AA**. Він включає всі критерії A плюс контраст 4.5:1, видимий фокус, reflow, зрозумілі помилки. Коли в ТЗ пишуть «доступний сайт» без уточнення — уточнюйте версію і рівень, але за замовчуванням це 2.2 AA.
`
    },
    {
      id: 'a11y-wcag-pour',
      group: 'basics',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'WCAG 2.2: рівні та принципи POUR',
      tags: ['wcag'],
      question: 'Що таке WCAG? Розкажіть про рівні відповідності, принципи POUR і що нового в WCAG 2.2.',
      choices: [
        'AAA — цільовий рівень більшості законів і ТЗ, а AA — лише рекомендація для державних сайтів',
        'POUR — це Performance, Operability, Usability, Reliability: чотири метрики якості інтерфейсу',
        'WCAG 2.2 несумісний з 2.1, тому сайти доводиться перевіряти за обома версіями окремо',
        'Новий у 2.2 критерій Target Size (AA) вимагає цілей щонайменше 44×44 CSS px без винятків',
        'AA — типова вимога законів і ТЗ; 2.2 додала, зокрема, Focus Not Obscured і Target Size 24×24'
      ],
      correct: 4,
      why: [
        'Навпаки: AA — цільовий рівень законів, а AAA на весь сайт зазвичай недосяжний.',
        'POUR — Perceivable, Operable, Understandable, Robust: принципи, а не метрики продуктивності.',
        '2.2 зворотно сумісна: сайт, що відповідає 2.2, відповідає і 2.1 та 2.0.',
        'Мінімум AA у 2.2 — 24×24 CSS px (або достатній відступ); 44×44 — рекомендація рівня AAA.',
        'Правильно: AA — стандарт індустрії, а 2.2 додала Focus Not Obscured, Target Size, Dragging, Accessible Authentication.'
      ],
      hint: 'A / AA / AAA; Perceivable, Operable, Understandable, Robust.',
      answer: `
**WCAG** — стандарт W3C. Актуальна версія **2.2** (2023), зворотно сумісна з 2.0/2.1. Структура: принципи → настанови → **критерії успіху** (перевірювані).

**Рівні:** **A** — мінімум (alt, клавіатура, без пасток фокусу); **AA** — ціль законів і ТЗ (контраст 4.5:1, видимий фокус, reflow, зрозумілі помилки); **AAA** — найвищий (контраст 7:1), на весь сайт недосяжний.

**POUR:**
- **Perceivable** — текстові альтернативи, субтитри, контраст, не лише колір.
- **Operable** — усе з клавіатури, достатньо часу, без мерехтіння > 3 разів/с, навігація (skip links, заголовки).
- **Understandable** — \`lang\`, передбачувана поведінка, допомога з помилками.
- **Robust** — коректні імʼя, роль, значення (4.1.2 Name, Role, Value).

**Нове в 2.2:** Focus Not Obscured (фокус не закритий sticky-хедером), Dragging Movements (альтернатива drag-and-drop), Target Size ≥ 24×24 px, Accessible Authentication (дозволяти вставку пароля), Consistent Help, Redundant Entry; 4.1.1 Parsing вилучено.
`,
      keyPoints: [
        'WCAG 2.2 — стандарт W3C, критерії успіху',
        'Рівні A / AA / AAA; AA — типова вимога',
        'POUR: Perceivable, Operable, Understandable, Robust',
        'Нове в 2.2: Focus Not Obscured, Target Size 24px, Dragging, Accessible Authentication'
      ],
      followUps: ['Що означає критерій 4.1.2 Name, Role, Value?', 'Наведіть приклади критеріїв рівня A.', 'Як перевірити Target Size?']
    },

    // ───────────────────────── 2. Семантика і ARIA ─────────────────────────
    {
      id: 'a11y-quiz-role-button',
      group: 'aria',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Що дає role="button" на div?',
      tags: ['aria', 'keyboard'],
      question: `
Що саме змінить додавання \`role="button"\`?

\`\`\`html
<div class="btn" role="button" onclick="save()">Зберегти</div>
\`\`\`
`,
      options: [
        'Div стане повноцінною кнопкою: фокус Tab-ом, Enter і Space викличуть `save()`',
        'Div стане фокусованим, але Enter/Space треба обробити самостійно',
        'Нічого: ARIA-ролі ігноруються, якщо є `onclick`',
        'Screen reader оголосить «Зберегти, кнопка», але фокусу з клавіатури і реакції на Enter/Space не буде'
      ],
      answer: 3,
      why: [
        'ARIA не додає поведінки: ні фокусу, ні обробки клавіш — лише семантику для screen reader.',
        'Фокус дає лише `tabindex="0"`, а не роль — без нього div взагалі не потрапить у Tab-послідовність.',
        'Роль не залежить від обробників подій: вона змінює дерево доступності в будь-якому разі.',
        'Правильно: змінюється тільки дерево доступності (роль), а фокус і клавіатуру треба додати вручну.'
      ],
      hint: 'ARIA — це про семантику для допоміжних технологій. Чи впливає вона на поведінку браузера?',
      explanation: `
ARIA змінює лише **дерево доступності** (роль, імʼя, стан). Щоб div поводився як кнопка, потрібні ще \`tabindex="0"\`, обробка Enter (keydown) і Space (keyup), стан disabled. Найкраще рішення — \`<button type="button">\`, що дає все безкоштовно.
`
    },
    {
      id: 'a11y-first-rule-aria',
      group: 'aria',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Перше правило ARIA. Ролі, стани, властивості',
      tags: ['aria', 'semantics'],
      question: 'Що таке ARIA і коли її використовувати? Що таке «перше правило ARIA»? Чим відрізняються ролі, стани і властивості?',
      choices: [
        '`role="button"` на `div` робить його фокусованим і сам додає обробку Enter та Space',
        'ARIA змінює лише дерево доступності; фокус і клавіатурну поведінку треба реалізувати самому',
        'Перше правило ARIA — явно задавати `role` кожному елементу, навіть нативному `<button>`',
        '`aria-expanded` і `aria-label` — це ролі, а `role="dialog"` — стан, що змінюється взаємодією',
        'Що більше ARIA-атрибутів на сторінці, то менше на ній помилок доступності — так каже WebAIM'
      ],
      correct: 1,
      why: [
        'Роль не дає ні фокусу, ні обробки клавіш — це лише «обіцянка» для screen reader.',
        'Правильно: ARIA — семантика для accessibility tree, поведінку (фокус, клавіші) пише розробник.',
        'Навпаки: перше правило — використовувати нативний елемент; дублювати role у `<button>` не треба.',
        'Переплутано: `aria-expanded` — стан, `aria-label` — властивість, `role="dialog"` — роль.',
        'WebAIM Million показує протилежне: сторінки з ARIA в середньому мають більше помилок.'
      ],
      hint: '«No ARIA is better than bad ARIA». Що ARIA змінює, а що — ні?',
      answer: `
**WAI-ARIA** — атрибути, що доповнюють семантику HTML у **дереві доступності**. Потрібні там, де HTML не має елемента: вкладки, комбобокси, live regions.

**Правила ARIA:**
1. **Є нативний елемент — використовуйте його** (\`<button>\`, \`<input type="checkbox">\`).
2. Не змінюйте нативну семантику без потреби.
3. Усі інтерактивні ARIA-контроли працюють з клавіатури.
4. Без \`aria-hidden\` / \`role="presentation"\` на фокусованих елементах.
5. Кожен інтерактивний елемент має доступне імʼя.

**Типи атрибутів:**
- **Ролі** — що це: \`dialog\`, \`tab\`, \`switch\`, \`alert\`.
- **Стани** — динамічні: \`aria-expanded\`, \`aria-selected\`, \`aria-checked\`, \`aria-pressed\`, \`aria-invalid\`.
- **Властивості** — звʼязки, характеристики: \`aria-label\`, \`aria-labelledby\`, \`aria-describedby\`, \`aria-controls\`.

\`\`\`html
<button aria-expanded="false" aria-controls="menu">Меню</button>
<ul id="menu" hidden>…</ul>
\`\`\`

«No ARIA is better than bad ARIA»: за WebAIM Million сторінки з ARIA мають у середньому більше помилок.
`,
      keyPoints: [
        'ARIA змінює лише дерево доступності, не поведінку',
        'Перше правило: нативний елемент замість ARIA',
        'Ролі (що це), стани (динамічні), властивості (звʼязки, характеристики)',
        'ARIA-контроли мають працювати з клавіатури і мати імʼя',
        'Погана ARIA гірша, ніж відсутня'
      ],
      followUps: ['Чим aria-disabled відрізняється від disabled?', 'Коли aria-label шкодить?', 'Що таке accessibility tree і як його подивитися в DevTools?']
    },
    {
      id: 'a11y-div-button',
      group: 'aria',
      type: 'dom',
      level: 2,
      title: 'Зробити div-кнопку доступною',
      tags: ['aria', 'keyboard'],
      description: `
**Завдання.** Зробіть \`<div id="like">\` повноцінною кнопкою-перемикачем «Подобається» — лише через JS (HTML не змінюємо).

**Де трапляється:** легасі-компонент або дизайн-система, де «кнопки» — це div. Класичне питання співбесіди: «що потрібно, щоб div став кнопкою?»

**Дано (HTML)**
- \`<div class="like-btn" id="like">♥ Подобається</div>\` — «кнопка»;
- \`<span id="count">0</span>\` — лічильник;
- у JS уже є \`toggleLike()\` (міняє \`liked\` і лічильник) і обробник \`click\`.

**Що написати**
- на старті: \`role="button"\`, \`tabindex="0"\`, \`aria-pressed="false"\` на \`#like\`;
- \`toggleLike()\` додатково оновлює \`aria-pressed\` → \`"true"\` / \`"false"\`;
- \`keydown\` на \`#like\`: **Enter** → \`toggleLike()\`; **Space** (\`e.key === ' '\`) → лише \`preventDefault()\`;
- \`keyup\` на \`#like\`: **Space** → \`toggleLike()\`;
- інші клавіші нічого не роблять.

**Приклад**
\`\`\`text
клік          → aria-pressed="true",  #count = 1
Enter         → aria-pressed="false", #count = 0
Space (вниз)  → нічого, сторінка не скролиться
Space (вгору) → aria-pressed="true",  #count = 1
\`\`\`

**Як це працює:** ARIA змінює лише дерево доступності: \`role\` → screen reader каже «кнопка», \`aria-pressed\` → «натиснуто/не натиснуто». Фокус дає тільки \`tabindex="0"\`. Нативна кнопка спрацьовує на Enter при натисканні (keydown), а на Space — при відпусканні (keyup); повторюємо саме це.

**Врахуйте:** кожна дія перемикає стан **рівно один раз** (не обробляйте Space і в keydown, і в keyup); Space без \`preventDefault\` прокручує сторінку; не \`tabindex="1"\`.
`,
      html: `<div class="like-btn" id="like">♥ Подобається</div>
<span id="count">0</span>`,
      css: `.like-btn { display: inline-block; padding: 8px 14px; border: 1px solid #e11d48; border-radius: 6px; cursor: pointer; }
.like-btn[aria-pressed="true"] { background: #e11d48; color: #fff; }
.like-btn:focus-visible { outline: 3px solid #2563eb; outline-offset: 2px; }`,
      js: `const btn = document.querySelector('#like');
const countEl = document.querySelector('#count');
let liked = false;

// 1. Атрибути на старті: role="button", tabindex="0", aria-pressed="false"
// TODO

function toggleLike() {
  liked = !liked;
  countEl.textContent = liked ? '1' : '0';
  // 2. TODO: синхронізуйте aria-pressed зі станом liked (String(liked))
}

btn.addEventListener('click', toggleLike);

// 3. keydown: Enter → toggleLike(); Space (' ') → лише e.preventDefault()
btn.addEventListener('keydown', (e) => {
  // TODO
});

// 4. keyup: Space → toggleLike()
btn.addEventListener('keyup', (e) => {
  // TODO
});

// Спробуйте: Tab до «Подобається» → Space. Стан має змінитися один раз, сторінка — не скролитися.
`,
      editable: ['js'],
      solution: {
        js: `const btn = document.querySelector('#like');
const countEl = document.querySelector('#count');
let liked = false;

btn.setAttribute('role', 'button');
btn.setAttribute('tabindex', '0');
btn.setAttribute('aria-pressed', 'false');

function toggleLike() {
  liked = !liked;
  countEl.textContent = liked ? '1' : '0';
  btn.setAttribute('aria-pressed', String(liked));
}

btn.addEventListener('click', toggleLike);

btn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    toggleLike();            // нативна кнопка спрацьовує на Enter одразу (keydown)
  } else if (e.key === ' ') {
    e.preventDefault();      // не прокручувати сторінку
  }
});

btn.addEventListener('keyup', (e) => {
  if (e.key === ' ') toggleLike(); // а на Space — при відпусканні (keyup)
});
`
      },
      hints: [
        'Почніть з атрибутів: `setAttribute(\'role\', \'button\')`, `tabindex` = `\'0\'`, `aria-pressed` = `\'false\'`. У `toggleLike` додайте `btn.setAttribute(\'aria-pressed\', String(liked))`.',
        'У `keydown` перевіряйте `e.key === \'Enter\'` і `e.key === \' \'`. Для Space — тільки `e.preventDefault()`.',
        'У `keyup`: `if (e.key === \' \') toggleLike();`. Якщо викликати toggleLike для Space і в keydown, і в keyup — стан перемкнеться двічі.'
      ],
      tests: [
        { name: 'роль кнопки і tabindex="0"', code: "const b = $('#like');\nexpect(b.getAttribute('role')).toBe('button');\nexpect(b.getAttribute('tabindex')).toBe('0');\nb.focus();\nexpect(document.activeElement).toBe(b);" },
        { name: 'на старті aria-pressed="false"', code: "expect($('#like').getAttribute('aria-pressed')).toBe('false');\nexpect($('#count').textContent).toBe('0');" },
        { name: 'клік перемикає aria-pressed і лічильник', code: "click('#like');\nexpect($('#like').getAttribute('aria-pressed')).toBe('true');\nexpect($('#count').textContent).toBe('1');\nclick('#like');\nexpect($('#like').getAttribute('aria-pressed')).toBe('false');\nexpect($('#count').textContent).toBe('0');" },
        { name: 'Enter перемикає рівно один раз', code: "press('#like', 'Enter');\nexpect($('#like').getAttribute('aria-pressed')).toBe('true');\npress('#like', 'Enter');\nexpect($('#like').getAttribute('aria-pressed')).toBe('false');" },
        { name: 'Space перемикає рівно один раз і не прокручує', code: "const ev = press('#like', ' ');\nexpect(ev.defaultPrevented).toBe(true);\nexpect($('#like').getAttribute('aria-pressed')).toBe('true');\nexpect($('#count').textContent).toBe('1');\npress('#like', ' ');\nexpect($('#like').getAttribute('aria-pressed')).toBe('false');" },
        { name: 'інші клавіші нічого не роблять', code: "press('#like', 'a');\npress('#like', 'Tab');\npress('#like', 'Escape');\nexpect($('#like').getAttribute('aria-pressed')).toBe('false');\nexpect($('#count').textContent).toBe('0');" }
      ],
      explanation: `
Ми вручну відтворили те, що \`<button>\` має з коробки: **роль** (screen reader каже «кнопка»), **фокус** (\`tabindex="0"\`), **стан** (\`aria-pressed\`), **клавіатуру** (Enter на keydown, Space на keyup). Для повноти ще знадобилися б \`aria-disabled\` з блокуванням обробників і \`:focus-visible\`.

~20 рядків проти одного тега — найкращий аргумент за **перше правило ARIA**.

**Типові помилки:** \`tabindex="1"\`; обробка застарілої \`keypress\`; подвійне спрацювання на Space.

**Що спитають далі:** чим \`aria-pressed\` відрізняється від \`role="switch"\` + \`aria-checked\`? Чому \`<a href="#">\` — погана кнопка? (Це навігація: Space скролить сторінку, SR каже «посилання».)
`
    },

    // ───────────────────────── 3. Доступне імʼя, alt і приховування ─────────────────────────
    {
      id: 'a11y-quiz-alt',
      group: 'naming',
      type: 'quiz',
      level: 1,
      title: 'Який alt у логотипа-посилання?',
      tags: ['images', 'naming'],
      question: `
Логотип — єдиний вміст посилання на головну. Який \`alt\` найкращий?

\`\`\`html
<a href="/"><img src="acme-logo.svg" alt="?"></a>
\`\`\`
`,
      options: [
        '`alt="logo"`',
        '`alt=""` — логотип декоративний',
        '`alt="Логотип: синій квадрат з білою літерою А"`',
        '`alt="Acme — головна сторінка"`'
      ],
      answer: 3,
      why: [
        '«logo» не каже ні назви компанії, ні куди веде посилання.',
        'Порожній alt залишить посилання без імені — screen reader прочитає URL або просто «посилання».',
        'Опис вигляду доречний для інформативних ілюстрацій, а для посилання важлива функція — куди воно веде.',
        'Правильно: alt стає іменем посилання і каже, куди воно веде: «Acme — головна сторінка, посилання».'
      ],
      hint: 'Якщо зображення — єдиний вміст посилання, його alt стає іменем посилання.',
      explanation: `
Для інтерактивного зображення \`alt\` описує **функцію**, а не вигляд. Загальні правила: без «зображення…» на початку (SR і так це каже); декоративне — \`alt=""\`; складна діаграма — короткий alt + розгорнутий опис поруч (\`figcaption\`, таблиця).
`
    },
    {
      id: 'a11y-accessible-name',
      group: 'naming',
      type: 'theory',
      level: 3,
      title: 'Як обчислюється доступне імʼя (accessible name)',
      tags: ['aria', 'naming'],
      question: 'Що таке доступне імʼя елемента і як браузер його обчислює? Коли використовувати aria-label, aria-labelledby, aria-describedby?',
      choices: [
        '`placeholder` — надійна заміна `<label>`, бо screen reader бере імʼя поля саме з нього першим',
        '`aria-describedby` задає імʼя елемента й має найвищий пріоритет серед усіх джерел імені',
        '`aria-label` можна безпечно ставити на будь-який `div` чи `span` без ролі — його прочитають усі',
        '`aria-labelledby` має найвищий пріоритет, а `aria-label` перекриває видимий текст елемента',
        'Кнопка з текстом «Купити» і `aria-label="Додати товар у кошик"` ок, бо імʼя детальніше'
      ],
      correct: 3,
      why: [
        '`placeholder` — останній резерв: зникає при введенні і підтримується ненадійно; потрібен `<label>`.',
        '`aria-describedby` задає не імʼя, а опис, який читається після імені.',
        'На `div`/`span` без ролі `aria-label` заборонений специфікацією і частина screen readers його ігнорує.',
        'Правильно: пріоритет aria-labelledby > aria-label > нативне > вміст, і aria-label замінює видимий текст.',
        'Порушує WCAG 2.5.3 Label in Name: голосова команда «натисни Купити» не спрацює — імʼя має містити видимий текст.'
      ],
      hint: 'Є пріоритет джерел. Подумайте про кнопку-іконку, поле з label і модальне вікно.',
      answer: `
**Доступне імʼя** — назва елемента для screen reader: «**Зберегти**, кнопка». **Опис** — додаткова інформація після паузи: «Пароль, *мінімум 8 символів*».

**Пріоритет (спрощений accname):**
1. \`aria-labelledby\` — id інших елементів (можна кілька, навіть прихованих).
2. \`aria-label\` — рядок.
3. Нативне: \`<label>\`, \`alt\`, \`<caption>\`, \`<legend>\`, \`<figcaption>\`.
4. Вміст — для button, link, heading, tab (\`aria-hidden\`-нащадки пропускаються).
5. \`title\`, \`placeholder\` — ненадійний резерв.

\`\`\`html
<button aria-label="Закрити"><svg aria-hidden="true">…</svg></button>
<div role="dialog" aria-labelledby="dlg-title"><h2 id="dlg-title">Видалити файл?</h2></div>
<input id="pwd" type="password" aria-describedby="pwd-hint">
<p id="pwd-hint">Мінімум 8 символів</p>
\`\`\`

**Нюанси:** імʼя має **містити** видимий текст (2.5.3 Label in Name); \`aria-label\` не для \`div\`/\`span\` без ролі; \`aria-label\` не перекладається автоперекладачем, \`aria-labelledby\` з видимим текстом — так. Перевірка: DevTools → Accessibility → Computed Name.
`,
      keyPoints: [
        'Імʼя vs опис (aria-describedby)',
        'Пріоритет: aria-labelledby > aria-label > нативне (label/alt/caption) > вміст > title/placeholder',
        'Кнопки-іконки: aria-label або прихований текст, SVG — aria-hidden',
        'Label in Name: імʼя має містити видимий текст',
        'aria-label не для div/span без ролі; перевірка через DevTools Accessibility'
      ],
      followUps: ['Як дати імʼя кнопці-іконці без aria-label?', 'Що таке клас .sr-only / visually-hidden?', 'Чи читається title screen reader-ами?']
    },
    {
      id: 'a11y-quiz-accessible-name',
      group: 'naming',
      type: 'quiz',
      level: 3,
      title: 'Яке доступне імʼя в кнопки?',
      tags: ['aria', 'naming'],
      question: `
Що оголосить screen reader як імʼя кнопки?

\`\`\`html
<span id="lbl">Видалити замовлення</span>
<button aria-labelledby="lbl" aria-label="Закрити" title="Кнопка">
  <svg aria-hidden="true">…</svg> Del
</button>
\`\`\`
`,
      options: ['«Закрити»', '«Видалити замовлення»', '«Del»', '«Кнопка»', '«Видалити замовлення Закрити Del»'],
      answer: 1,
      why: [
        '`aria-label` програє `aria-labelledby` — він має нижчий пріоритет.',
        'Правильно: `aria-labelledby` — найвищий пріоритет, імʼя = текст `#lbl`.',
        'Вміст кнопки використовується, лише якщо немає aria-labelledby та aria-label.',
        '`title` — останній резерв; тут він стане хіба що описом.',
        'Джерела не складаються: береться перше за пріоритетом (конкатенація лише всередині `aria-labelledby="a b"`).'
      ],
      hint: 'Джерела імені не складаються — береться перше за пріоритетом.',
      explanation: `
Алгоритм бере **перше** джерело: \`aria-labelledby\` → «Видалити замовлення». Решта ігнорується, \`title\` може стати описом.

До речі, ця кнопка порушує *Label in Name*: видимий текст «Del» не входить в імʼя — голосова команда «натисни Del» не спрацює.
`
    },
    {
      id: 'a11y-quiz-hidden-ways',
      group: 'naming',
      type: 'quiz',
      level: 2,
      title: 'Що ховає елемент від screen reader?',
      tags: ['aria', 'hiding'],
      question: 'Оберіть **усі** способи, які приховують елемент **від screen reader** (виключають з дерева доступності):',
      options: [
        '`display: none`',
        '`opacity: 0`',
        '`aria-hidden="true"`',
        'клас `.sr-only` (`position: absolute; width: 1px; height: 1px; clip: rect(0 0 0 0); overflow: hidden`)',
        'атрибут `hidden`',
        '`visibility: hidden`'
      ],
      answer: [0, 2, 4, 5],
      why: [
        'Так: `display: none` ховає від усіх — очей, screen reader і фокусу.',
        'Ні: `opacity: 0` ховає лише візуально — SR і Tab елемент знаходять (часта «невидима пастка»).',
        'Так: це саме «сховати лише від screen reader», візуально елемент лишається.',
        'Ні: `.sr-only` — навпаки, «лише для screen reader»: візуально прихований, але читається.',
        'Так: атрибут `hidden` = `display: none` за замовчуванням.',
        'Так: `visibility: hidden` ховає від усіх, але зберігає місце в layout.'
      ],
      hint: 'Розділіть способи на «сховати від усіх», «сховати лише від очей» і «сховати лише від screen reader».',
      explanation: `
| Спосіб | Очі | Screen reader | Фокус |
|---|---|---|---|
| \`display: none\`, \`hidden\`, \`visibility: hidden\` | ✗ | ✗ | ✗ |
| \`aria-hidden="true"\` | ✓ | ✗ | **✓** (пастка!) |
| \`opacity: 0\`, \`.sr-only\` | ✗ | ✓ | ✓ |

\`aria-hidden\` не ставлять на фокусовані елементи — для блокування області разом з фокусом є \`inert\`.
`
    },
    {
      id: 'a11y-aria-hidden-inert',
      group: 'naming',
      type: 'theory',
      level: 3,
      title: 'aria-hidden, inert, hidden, visually-hidden',
      tags: ['aria', 'hiding', 'focus'],
      question: 'Як правильно ховати вміст: лише візуально, лише від screen reader, від усіх? Що таке атрибут inert і чим він кращий за aria-hidden для фону модалки? Оберіть **усі** правильні твердження.',
      choices: [
        '`inert` прибирає піддерево з дерева доступності й блокує в ньому фокус і кліки',
        '`aria-hidden="true"` на фоні модалки сам по собі блокує Tab-фокус на посиланнях у ньому',
        'Текст лише для screen reader ховають класом `.sr-only`, а не через `display: none`',
        '`aria-hidden="false"` знову робить доступним вміст, схований через `display: none`',
        '`<dialog>.showModal()` робить решту сторінки інертною автоматично, без ручного `inert`'
      ],
      correct: [0, 2, 4],
      why: [
        'Правильно: inert = без фокусу, кліків, виділення і поза деревом доступності.',
        'Хибно: aria-hidden ховає лише від SR, а Tab і далі заходить у посилання — фокус потрапляє в «порожнечу».',
        'Правильно: `display: none` ховає від усіх, включно зі screen reader, тому для SR-тексту — `.sr-only`.',
        'Хибно: CSS-приховування сильніше; `aria-hidden="false"` нічого не «показує».',
        'Правильно: modal-режим `<dialog>` робить фон інертним сам.'
      ],
      hint: 'Таблиця «очі / screen reader / фокус» для кожного способу.',
      answer: `
**Три різні задачі:**
1. **Від усіх** — \`hidden\`, \`display: none\`, \`visibility: hidden\` (остання зберігає місце й анімується).
2. **Лише візуально** (текст для SR) — клас visually-hidden:
\`\`\`css
.sr-only {
  position: absolute; width: 1px; height: 1px;
  margin: -1px; padding: 0; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap; border: 0;
}
\`\`\`
Підпис кнопки-іконки, «(відкриється в новій вкладці)».
3. **Лише від SR** — \`aria-hidden="true"\`: декоративні іконки, дубльований текст. **Ніколи** на фокусованому елементі чи його предку.

**inert** — піддерево повністю неінтерактивне: без фокусу, кліків, виділення, поза деревом доступності. Для фону модалки, неактивних слайдів, закритого off-canvas меню:
\`\`\`js
document.querySelector('#app').inert = true;
\`\`\`
На відміну від \`aria-hidden\`, блокує ще й **фокус і кліки**. \`<dialog>.showModal()\` робить фон інертним сам.

**Пастки:** \`aria-hidden="false"\` не показує схований CSS вміст; \`role="presentation"\` прибирає лише семантику ролі, а не вміст.
`,
      keyPoints: [
        'Від усіх: hidden / display:none / visibility:hidden',
        'Лише візуально: .sr-only (clip), не display:none',
        'Лише від SR: aria-hidden="true", ніколи на фокусованих елементах',
        'inert: без фокусу, кліків і з дерева доступності — для фону модалок',
        'showModal() робить фон інертним автоматично'
      ],
      followUps: ['Чому не можна ховати .sr-only через display:none?', 'Як зробити неактивні слайди каруселі недоступними?', 'Що буде, якщо поставити aria-hidden на body при відкритій модалці всередині body?']
    },
    {
      id: 'a11y-icon-buttons',
      group: 'naming',
      type: 'dom',
      level: 2,
      title: 'Кнопки-іконки: .sr-only і aria-hidden',
      tags: ['naming', 'hiding', 'images'],
      description: `
**Завдання.** У хедері є кнопка пошуку та посилання на кошик — лише іконки без тексту. Screen reader читає їх як «кнопка» і «посилання» без імені. Дайте їм імена прихованим текстом.

**Де трапляється:** будь-який хедер/тулбар: лупа, кошик, «закрити ×», бургер-меню. Найчастіша знахідка axe — «Buttons must have discernible text».

**Дано (HTML)**
- \`<header class="toolbar">\`, у ньому:
- \`<button type="button" id="search">\` з \`<svg>\` лупи;
- \`<a href="/cart" id="cart">\` з \`<svg>\` кошика і \`<span class="badge">3</span>\`.

**Що написати**
- **CSS:** клас \`.sr-only\` — візуально прихований (≈1×1 px, \`position: absolute\`), але **не** \`display: none\` і **не** \`visibility: hidden\`;
- **HTML:** усім \`<svg>\` у \`.toolbar\` — \`aria-hidden="true"\` (декор);
- у \`#search\` — \`<span class="sr-only">Пошук</span>\`;
- у \`#cart\` перед бейджем — \`<span class="sr-only">Кошик, товарів:</span>\`.

**Приклад**
\`\`\`text
#search → «Пошук, кнопка»
#cart   → «Кошик, товарів: 3, посилання»
\`\`\`

**Як це працює:** імʼя кнопки/посилання обчислюється з **вмісту**. \`.sr-only\` лишає текст у дереві доступності, але вирізає його візуально (кліп до 1 px). \`aria-hidden\` прибирає SVG з дерева, щоб SR не читав «зображення» чи вміст \`<title>\`.

**Врахуйте:** \`display: none\` прибрав би текст і зі screen reader; бейдж «3» лишається видимим і входить в імʼя; альтернатива — \`aria-label\`, але прихований текст перекладається автоперекладачем.
`,
      html: `<header class="toolbar">
  <button type="button" id="search">
    <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-4-4" stroke="currentColor" stroke-width="2"/></svg>
  </button>
  <a href="/cart" id="cart">
    <svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 4h2l2 12h11l2-8H7" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    <span class="badge">3</span>
  </a>
</header>`,
      css: `body { font-family: system-ui, sans-serif; }
.toolbar { display: flex; gap: 12px; align-items: center; }
.toolbar button, .toolbar a { display: inline-flex; align-items: center; gap: 4px; padding: 6px; color: #111; }
.badge { background: #e11d48; color: #fff; border-radius: 10px; padding: 0 6px; font-size: 12px; }

/* 1. Візуально приховати, але залишити для screen reader:
      position: absolute; width/height: 1px; overflow: hidden;
      clip-path: inset(50%); white-space: nowrap; margin: -1px; padding: 0; border: 0; */
.sr-only {
  /* TODO */
}
`,
      js: '',
      editable: ['html', 'css'],
      solution: {
        html: `<header class="toolbar">
  <button type="button" id="search">
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-4-4" stroke="currentColor" stroke-width="2"/></svg>
    <span class="sr-only">Пошук</span>
  </button>
  <a href="/cart" id="cart">
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M3 4h2l2 12h11l2-8H7" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    <span class="sr-only">Кошик, товарів:</span>
    <span class="badge">3</span>
  </a>
</header>`,
        css: `body { font-family: system-ui, sans-serif; }
.toolbar { display: flex; gap: 12px; align-items: center; }
.toolbar button, .toolbar a { display: inline-flex; align-items: center; gap: 4px; padding: 6px; color: #111; }
.badge { background: #e11d48; color: #fff; border-radius: 10px; padding: 0 6px; font-size: 12px; }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
`
      },
      hints: [
        'HTML: додайте `aria-hidden="true"` в обидва `<svg>` і по одному `<span class="sr-only">…</span>` у кнопку та посилання.',
        'CSS: `position: absolute; width: 1px; height: 1px; overflow: hidden;` — елемент лишається в DOM і дереві доступності, але не займає місця.',
        'Додайте `clip-path: inset(50%); white-space: nowrap; margin: -1px; padding: 0; border: 0;` — щоб текст не «прозирав» і не переносився в стовпчик.'
      ],
      tests: [
        { name: 'усі svg у .toolbar мають aria-hidden="true"', code: "const svgs = $$('.toolbar svg');\nexpect(svgs.length).toBe(2);\nsvgs.forEach(s => expect(s.getAttribute('aria-hidden')).toBe('true'));" },
        { name: 'у кнопки пошуку є прихований текст «Пошук»', code: "const s = $('#search .sr-only');\nexpect(s).toBeTruthy();\nexpect(s.textContent.trim()).toBe('Пошук');" },
        { name: 'посилання кошика: прихований текст «Кошик…» і бейдж 3', code: "const s = $('#cart .sr-only');\nexpect(s).toBeTruthy();\nexpect(s.textContent).toMatch('Кошик');\nexpect($('#cart .badge').textContent.trim()).toBe('3');\nexpect($('#cart').textContent.replace(/\\s+/g, ' ')).toMatch(/Кошик.*3/);" },
        { name: '.sr-only прихований візуально, але не display:none / visibility:hidden', code: "$$('.sr-only').forEach(el => {\n  expect(css(el, 'display')).not.toBe('none');\n  expect(css(el, 'visibility')).toBe('visible');\n  expect(css(el, 'position')).toBe('absolute');\n  const r = rect(el);\n  expect(r.width <= 1 && r.height <= 1).toBe(true);\n});" }
      ],
      explanation: `
Імʼя кнопки/посилання береться з **вмісту**, тому найнадійніше — справжній текст, прихований візуально. \`.sr-only\` — стандартний патерн (Bootstrap, Tailwind \`sr-only\`): 1×1 px, \`overflow: hidden\` і кліп ховають текст від очей, але не від дерева доступності.

\`aria-hidden="true"\` на SVG — щоб screen reader не оголошував «зображення» і не читав вміст іконки.

**Альтернативи:** \`aria-label="Пошук"\` на кнопці (простіше, але не перекладається і не працює для \`div\` без ролі); \`<svg role="img" aria-label="…">\`.

**Типові помилки:** \`display: none\` для «тексту для SR»; кнопка-іконка без імені; бейдж «3» без контексту («3, посилання»).

**Що спитають далі:** як зробити skip link на основі \`.sr-only\`, що стає видимим при фокусі?
`
    },
    {
      id: 'a11y-toggle-switch',
      group: 'naming',
      type: 'dom',
      level: 2,
      title: 'Перемикач теми: role="switch" і aria-checked',
      tags: ['aria', 'switch', 'naming'],
      description: `
**Завдання.** Кнопка \`#dark\` — перемикач темної теми, але screen reader чує лише «кнопка» без імені і стану. Виправте в JS (HTML не змінюємо).

**Де трапляється:** налаштування профілю, перемикачі «Сповіщення», «Темна тема» в будь-якому застосунку.

**Дано (HTML)**
- \`<span id="dark-label">Темна тема</span>\` — видимий підпис;
- \`<button type="button" id="dark" class="switch">\` з декоративним \`<span class="thumb">\`;
- CSS уже стилізує \`.switch[aria-checked="true"]\` і \`body.dark\`.

**Що написати**
- на старті: \`role="switch"\`, \`aria-checked="false"\`, \`aria-labelledby="dark-label"\` на \`#dark\`;
- \`toggle()\` → нічого не повертає; інвертує \`aria-checked\` і додає/прибирає клас \`dark\` на \`body\`;
- \`click\` на \`#dark\` **і** на \`#dark-label\` викликає \`toggle()\`.

**Приклад**
\`\`\`text
клік по #dark       → aria-checked="true",  body.dark
клік по «Темна тема» → aria-checked="false", без body.dark
\`\`\`

**Як це працює:** \`role="switch"\` + \`aria-checked\` → «Темна тема, перемикач, вимкнено». Імʼя береться з видимого тексту через \`aria-labelledby\` (найвищий пріоритет). Enter і Space нативна \`<button>\` перетворює на \`click\` сама — клавіатуру окремо слухати не треба.

**Врахуйте:** стан зберігайте в самому \`aria-checked\` (одне джерело правди); не змінюйте текст підпису залежно від стану — інакше стан дублюється.
`,
      html: `<div class="setting">
  <span id="dark-label">Темна тема</span>
  <button type="button" id="dark" class="switch"><span class="thumb"></span></button>
</div>`,
      css: `body { font-family: system-ui, sans-serif; }
body.dark { background: #111; color: #eee; }
.setting { display: flex; align-items: center; gap: 12px; }
#dark-label { cursor: pointer; }
.switch { width: 44px; height: 24px; border-radius: 12px; border: 2px solid #666; background: #ddd; position: relative; padding: 0; }
.thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left .2s; }
.switch[aria-checked="true"] { background: #2563eb; }
.switch[aria-checked="true"] .thumb { left: 22px; }
@media (prefers-reduced-motion: reduce) { .thumb { transition: none; } }`,
      js: `const sw = document.querySelector('#dark');
const label = document.querySelector('#dark-label');

// 1. Роль, стан і імʼя: role="switch", aria-checked="false", aria-labelledby="dark-label"
// TODO

// 2. Перемкнути стан: прочитати aria-checked, інвертувати, синхронізувати body.dark
function toggle() {
  // TODO
}

// 3. Клік по кнопці і по підпису викликає toggle()
// TODO

// Спробуйте: клацніть «Темна тема» — фон має стати темним, aria-checked="true".
`,
      editable: ['js'],
      solution: {
        js: `const sw = document.querySelector('#dark');
const label = document.querySelector('#dark-label');

sw.setAttribute('role', 'switch');
sw.setAttribute('aria-checked', 'false');
sw.setAttribute('aria-labelledby', 'dark-label');

function toggle() {
  const on = sw.getAttribute('aria-checked') !== 'true';
  sw.setAttribute('aria-checked', String(on));
  document.body.classList.toggle('dark', on);
}

sw.addEventListener('click', toggle);
label.addEventListener('click', toggle);
`
      },
      hints: [
        'Три `setAttribute` на старті: `role`, `aria-checked`, `aria-labelledby`.',
        'У `toggle`: `const on = sw.getAttribute(\'aria-checked\') !== \'true\';` — потім запишіть `String(on)` назад.',
        '`document.body.classList.toggle(\'dark\', on)` — з другим аргументом клас встановлюється явно, без розсинхронізації.'
      ],
      tests: [
        { name: 'role="switch", aria-checked="false"', code: "expect($('#dark').getAttribute('role')).toBe('switch');\nexpect($('#dark').getAttribute('aria-checked')).toBe('false');\nexpect(document.body.classList.contains('dark')).toBe(false);" },
        { name: 'імʼя з видимого тексту через aria-labelledby', code: "expect($('#dark').getAttribute('aria-labelledby')).toBe('dark-label');" },
        { name: 'клік вмикає і вимикає', code: "click('#dark');\nexpect($('#dark').getAttribute('aria-checked')).toBe('true');\nexpect(document.body.classList.contains('dark')).toBe(true);\nclick('#dark');\nexpect($('#dark').getAttribute('aria-checked')).toBe('false');\nexpect(document.body.classList.contains('dark')).toBe(false);" },
        { name: 'клік по тексту теж перемикає', code: "click('#dark-label');\nexpect($('#dark').getAttribute('aria-checked')).toBe('true');\nexpect(document.body.classList.contains('dark')).toBe(true);\nclick('#dark-label');\nexpect($('#dark').getAttribute('aria-checked')).toBe('false');" }
      ],
      explanation: `
\`role="switch"\` + \`aria-checked\` → «Темна тема, перемикач, вимкнено». Switch — налаштування «увімкнено/вимкнено», що діє одразу; toggle button (\`aria-pressed\`) — «натиснута/не натиснута» кнопка (жирний шрифт у редакторі).

**Альтернатива:** \`<input type="checkbox" role="switch">\` + \`<label>\` — нативні фокус, Space, клік по label, участь у формі. Часто це найкращий варіант.

**Нюанси:** анімація поважає \`prefers-reduced-motion\`; стан передається не лише кольором, а й позицією повзунка.

**Що спитають далі:** чим \`aria-pressed\` відрізняється від \`aria-checked\`?
`
    },

    // ───────────────────────── 4. Live regions і помилки у формах ─────────────────────────
    {
      id: 'a11y-live-regions',
      group: 'live',
      type: 'theory',
      level: 2,
      title: 'Live regions: aria-live, role=status, role=alert',
      tags: ['aria', 'live-regions'],
      question: 'Як повідомити користувача screen reader про зміни на сторінці, які відбулися без переміщення фокусу (товар додано в кошик, помилка збереження, результати пошуку оновилися)?',
      choices: [
        'Достатньо вставити в DOM `<div aria-live="polite">` одразу разом із текстом — його озвучать',
        'Для будь-якого статусу краще `aria-live="assertive"`, щоб користувач точно почув повідомлення',
        'Порожній регіон `role="status"` має бути в DOM заздалегідь, а потім змінюють його `textContent`',
        'Live region можна сховати через `display: none` — screen reader однаково стежить за змінами',
        'Єдиний спосіб — перевести фокус на тост, бо зміни поза фокусом screen reader не озвучує'
      ],
      correct: 2,
      why: [
        'Озвучуються зміни вже наявного регіону; створений разом із текстом регіон часто мовчить.',
        'assertive перериває мовлення — лише для критичного (помилки), інакше це як співрозмовник, що постійно перебиває.',
        'Правильно: регіон є від старту, screen reader «підписаний» на нього, і зміна тексту озвучується.',
        '`display: none` прибирає регіон з дерева доступності — для невидимого регіону беріть `.sr-only`.',
        'Live regions існують саме для того, щоб озвучувати зміни без переміщення фокусу.'
      ],
      hint: 'polite vs assertive, ролі status/alert/log, коли регіон має зʼявитися в DOM.',
      answer: `
**Live region** — область, зміни якої screen reader озвучує автоматично, не переміщуючи фокус.

\`\`\`html
<div role="status"></div> <!-- «Товар додано в кошик» -->
<div role="alert"></div>  <!-- «Не вдалося зберегти» -->
\`\`\`
\`\`\`js
statusEl.textContent = 'Товар додано. У кошику: 3';
\`\`\`

**Режими:** \`aria-live="polite"\` (роль \`status\`) — дочекається паузи, для більшості повідомлень; \`aria-live="assertive"\` (роль \`alert\`) — перериває, лише для критичного; \`role="log"\` — чат, журнал.

**Додатково:** \`aria-atomic="true"\` — читати весь регіон; \`aria-busy="true"\` — «зачекай, оновлюю».

**Пастки:**
1. Регіон має **існувати в DOM до зміни** тексту.
2. Не \`display: none\` — використовуйте \`.sr-only\`.
3. Однаковий текст двічі поспіль може не озвучитися — очищайте регіон перед новим текстом.
4. Не зловживати assertive.

Тости без live region **невидимі** для screen reader — класичний баг.
`,
      keyPoints: [
        'Live region озвучує зміни без переміщення фокусу',
        'polite (role=status) vs assertive (role=alert)',
        'Регіон має бути в DOM до зміни тексту',
        'aria-atomic, aria-relevant, aria-busy',
        'Не display:none; не зловживати assertive'
      ],
      followUps: ['Як зробити доступні toast-повідомлення?', 'Як оголосити зміну маршруту в SPA?', 'Чим role=log відрізняється від role=status?']
    },
    {
      id: 'a11y-quiz-live-region-timing',
      group: 'live',
      type: 'quiz',
      level: 3,
      title: 'Чому повідомлення не озвучилось?',
      tags: ['aria', 'live-regions'],
      question: `
Після збереження виконується цей код. Що, найімовірніше, почує користувач screen reader?

\`\`\`js
const msg = document.createElement('div');
msg.setAttribute('aria-live', 'polite');
msg.textContent = 'Зміни збережено';
document.body.append(msg);
\`\`\`
`,
      options: [
        '«Зміни збережено» — polite-регіони завжди озвучуються',
        'Повідомлення буде озвучене лише після переходу фокусу на `msg`',
        'Швидше за все нічого: регіон зʼявився в DOM разом із текстом, а озвучуються **зміни** вже наявного регіону',
        'Повідомлення буде озвучене двічі: при вставці і при зміні тексту'
      ],
      answer: 2,
      why: [
        'Polite-регіон озвучує лише зміни після того, як screen reader почав за ним стежити — тут «до» не було.',
        'Фокус для live region не потрібен — у цьому весь його сенс.',
        'Правильно: немає попереднього стану регіону, тож у більшості пар браузер + SR повідомлення не прозвучить.',
        'Проблема протилежна: повідомлення, найпевніше, не прозвучить жодного разу.'
      ],
      hint: 'Live region відстежує зміни. Що було «до» в цьому випадку?',
      explanation: `
Правильний патерн — порожній регіон у розмітці від старту, потім змінюємо текст:
\`\`\`html
<div id="status" role="status" class="sr-only"></div>
\`\`\`
\`\`\`js
document.querySelector('#status').textContent = 'Зміни збережено';
\`\`\`
\`role="alert"\`, вставлений разом із текстом, озвучується надійніше, але для polite-повідомлень на це не покладаються.
`
    },
    {
      id: 'a11y-live-announcer',
      group: 'live',
      type: 'dom',
      level: 2,
      title: 'Озвучення дій у кошику через live regions',
      tags: ['aria', 'live-regions'],
      description: `
**Завдання.** Кошик оновлюється без перезавантаження, і користувач screen reader нічого не чує. Додайте live regions і повідомлення.

**Де трапляється:** «Додати в кошик», «Збережено», тости і снекбари в будь-якому SPA.

**Дано (HTML)**
- \`<button id="add">Додати в кошик</button>\`, \`<button id="pay">Оплатити</button>\`;
- порожні \`<div id="status">\` і \`<div id="error">\`;
- у JS — змінні \`statusEl\`, \`errorEl\`, \`count = 0\`.

**Що написати**
- **HTML:** \`#status\` → \`role="status"\` (polite); \`#error\` → \`role="alert"\` (assertive). Можна додати й явні \`aria-live\`;
- клік \`#add\` → \`count++\`, \`#error\` очистити, у \`#status\` текст \`Товар додано. У кошику: N\`;
- клік \`#pay\` при \`count === 0\` → у \`#error\` текст \`Кошик порожній\`;
- клік \`#pay\` з товарами → \`count = 0\`, \`#error\` очистити, у \`#status\` \`Замовлення оформлено\`.

**Приклад**
\`\`\`text
Оплатити          → #error:  «Кошик порожній»
Додати, Додати    → #status: «Товар додано. У кошику: 2»
Оплатити          → #status: «Замовлення оформлено», #error порожній
\`\`\`

**Як це працює:** screen reader стежить за регіонами, що вже є в DOM, і озвучує зміну їхнього тексту: polite — після паузи, assertive — одразу, перериваючи мовлення.

**Врахуйте:** не перестворюйте регіони — змінюйте лише \`textContent\`; текст має бути самодостатнім (його почують без контексту).
`,
      html: `<button type="button" id="add">Додати в кошик</button>
<button type="button" id="pay">Оплатити</button>
<div id="status"></div>
<div id="error"></div>`,
      css: `body { font-family: system-ui, sans-serif; }
#error { color: #b91c1c; }`,
      js: `const statusEl = document.querySelector('#status');
const errorEl = document.querySelector('#error');
let count = 0;

// 0. У HTML: #status → role="status", #error → role="alert"

// 1. «Додати в кошик»: count++, очистити помилку, повідомити в #status
document.querySelector('#add').addEventListener('click', () => {
  // TODO
});

// 2. «Оплатити»: порожній кошик → помилка в #error; інакше обнулити і повідомити в #status
document.querySelector('#pay').addEventListener('click', () => {
  // TODO
});

// Спробуйте: «Оплатити» → «Кошик порожній»; «Додати» двічі → «Товар додано. У кошику: 2».
`,
      editable: ['html', 'js'],
      solution: {
        html: `<button type="button" id="add">Додати в кошик</button>
<button type="button" id="pay">Оплатити</button>
<div id="status" role="status" aria-live="polite"></div>
<div id="error" role="alert" aria-live="assertive"></div>`,
        js: `const statusEl = document.querySelector('#status');
const errorEl = document.querySelector('#error');
let count = 0;

document.querySelector('#add').addEventListener('click', () => {
  count++;
  errorEl.textContent = '';
  statusEl.textContent = 'Товар додано. У кошику: ' + count;
});

document.querySelector('#pay').addEventListener('click', () => {
  if (count === 0) {
    errorEl.textContent = 'Кошик порожній';
    return;
  }
  count = 0;
  errorEl.textContent = '';
  statusEl.textContent = 'Замовлення оформлено';
});
`
      },
      hints: [
        'HTML: `role="status"` має неявний `aria-live="polite"`, `role="alert"` — `aria-live="assertive"`. Можна вказати обидва атрибути для надійності.',
        'Регіони вже є в розмітці — у JS лише змінюйте `textContent`, не створюйте нові елементи.',
        'У `#pay`: `if (count === 0) { errorEl.textContent = \'Кошик порожній\'; return; }`, далі обнулення і статус.'
      ],
      tests: [
        { name: '#status — polite live region', code: "const s = $('#status');\nexpect(s.getAttribute('role') === 'status' || s.getAttribute('aria-live') === 'polite').toBe(true);\nexpect(s.getAttribute('aria-live')).not.toBe('assertive');" },
        { name: '#error — assertive live region', code: "const e = $('#error');\nexpect(e.getAttribute('role') === 'alert' || e.getAttribute('aria-live') === 'assertive').toBe(true);" },
        { name: 'оплата з порожнім кошиком → «Кошик порожній» у #error', code: "click('#pay');\nexpect($('#error').textContent.trim()).toBe('Кошик порожній');" },
        { name: 'додавання оновлює #status, регіон не перестворюється', code: "const s = $('#status');\nclick('#add');\nexpect($('#status')).toBe(s);\nexpect(s.textContent.trim()).toBe('Товар додано. У кошику: 1');\nclick('#add');\nexpect(s.textContent.trim()).toBe('Товар додано. У кошику: 2');" },
        { name: 'успішна оплата: статус, помилку очищено, кошик обнулено', code: "click('#pay');\nexpect($('#status').textContent.trim()).toBe('Замовлення оформлено');\nexpect($('#error').textContent.trim()).toBe('');\nclick('#pay');\nexpect($('#error').textContent.trim()).toBe('Кошик порожній');" }
      ],
      explanation: `
Live regions — єдиний спосіб повідомити про зміну **не там, де фокус**. Регіони є в DOM від старту, змінюється лише текст; polite — для інформації, assertive — для помилок, що блокують дію.

**Для продакшну:** однакові повідомлення поспіль можуть не озвучитися — допомагає очищення регіону + \`setTimeout\` перед новим текстом; один глобальний \`announce(message, priority)\` на застосунок (так роблять Angular CDK LiveAnnouncer, React Aria).

**Що спитають далі:** як озвучити кількість результатів пошуку, але не на кожне натискання клавіші? (debounce + polite.)
`
    },
    {
      id: 'a11y-form-errors',
      group: 'live',
      type: 'dom',
      level: 2,
      title: 'Доступні помилки у формі: aria-invalid + aria-describedby',
      tags: ['forms', 'aria'],
      description: `
**Завдання.** Форма підписки має \`novalidate\`, тож помилки показуємо самі. Зробіть їх доступними: label, звʼязок поля з текстом помилки, стан невалідності і фокус.

**Де трапляється:** будь-яка форма (реєстрація, checkout, підписка); на співбесідах — «як зробити доступну валідацію?»

**Дано (HTML)**
- \`<form id="sub" novalidate>\`;
- \`<input id="name" required placeholder="Імʼя">\` + порожній \`<p class="error" id="name-error">\`;
- \`<input id="email" type="email" required placeholder="Email">\` + \`<p class="error" id="email-error">\`;
- кнопка \`type="submit"\`.

**Що написати**
- **HTML:** видимі \`<label for="name">Імʼя</label>\` і \`<label for="email">Email</label>\` (placeholder — не label); на полях \`aria-describedby="name-error"\` / \`"email-error"\`;
- **JS** \`getError(field)\` → рядок помилки або \`''\`: імʼя порожнє → \`Вкажіть імʼя\`; email порожній → \`Вкажіть email\`; email некоректний → \`Email має містити @ і домен\`;
- **JS** \`showError(field, message)\` → нічого не повертає; пише текст у \`#<id>-error\`; з помилкою ставить \`aria-invalid="true"\`, без — прибирає \`aria-invalid\`;
- **JS** обробник \`submit\`: є помилки → \`preventDefault()\` і \`focus()\` на **перше** невалідне поле; валідна форма відправляється.

**Приклад**
\`\`\`text
name="",      email=""      → обидва aria-invalid="true", фокус на #name
name="Олена", email="olena" → «Email має містити @ і домен», фокус на #email
name="Олена", email="o@x.ua" → відправка не скасована, помилки очищено
\`\`\`

**Як це працює:** при фокусі на полі screen reader читає імʼя (label), стан (\`aria-invalid\` → «недійсне значення») і опис (\`aria-describedby\` → текст помилки). \`field.validity.valueMissing\` / \`typeMismatch\` працюють і з \`novalidate\` — він вимикає лише нативні підказки.

**Врахуйте:** валідні поля очищаються після повторної відправки; червона рамка — лише візуальний сигнал (WCAG 1.4.1); не ставте \`aria-invalid\` при завантаженні.
`,
      html: `<form id="sub" novalidate>
  <input id="name" name="name" placeholder="Імʼя" required>
  <p class="error" id="name-error"></p>
  <input id="email" name="email" type="email" placeholder="Email" required>
  <p class="error" id="email-error"></p>
  <button type="submit">Підписатися</button>
</form>`,
      css: `form { display: grid; gap: 4px; max-width: 300px; font-family: system-ui, sans-serif; }
.error { color: #b91c1c; margin: 0 0 8px; min-height: 1.2em; font-size: 14px; }
[aria-invalid="true"] { border: 2px solid #b91c1c; }`,
      js: `const form = document.querySelector('#sub');
// 0. У HTML: <label for> для полів і aria-describedby="name-error" / "email-error"

// 1. Текст помилки за field.validity (valueMissing, typeMismatch) або ''
function getError(field) {
  // TODO
}

// 2. Записати текст у #<id>-error і виставити/прибрати aria-invalid
function showError(field, message) {
  // TODO
}

// 3. submit: перевірити поля, запамʼятати перше невалідне,
//    якщо є — preventDefault() і focus() на нього
form.addEventListener('submit', (e) => {
  // TODO
});

// Спробуйте: натисніть «Підписатися» з порожніми полями — фокус має стати на «Імʼя».
`,
      editable: ['html', 'js'],
      solution: {
        html: `<form id="sub" novalidate>
  <label for="name">Імʼя</label>
  <input id="name" name="name" autocomplete="name" required aria-describedby="name-error">
  <p class="error" id="name-error"></p>
  <label for="email">Email</label>
  <input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-error">
  <p class="error" id="email-error"></p>
  <button type="submit">Підписатися</button>
</form>`,
        js: `const form = document.querySelector('#sub');

function getError(field) {
  const v = field.validity;
  if (field.id === 'name' && v.valueMissing) return 'Вкажіть імʼя';
  if (field.id === 'email' && v.valueMissing) return 'Вкажіть email';
  if (field.id === 'email' && v.typeMismatch) return 'Email має містити @ і домен';
  return '';
}

function showError(field, message) {
  const errorEl = document.getElementById(field.id + '-error');
  errorEl.textContent = message;
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
}

form.addEventListener('submit', (e) => {
  const fields = [form.elements.name, form.elements.email];
  let firstInvalid = null;
  fields.forEach((field) => {
    const message = getError(field);
    showError(field, message);
    if (message && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) {
    e.preventDefault();
    firstInvalid.focus(); // screen reader прочитає label + aria-invalid + опис помилки
  }
});
`
      },
      hints: [
        'HTML: `<label for="name">Імʼя</label>` перед полем і `aria-describedby="name-error"` на полі; так само для email.',
        'У `getError` перевіряйте `field.id` і `field.validity.valueMissing` / `typeMismatch`. У `showError` — `document.getElementById(field.id + \'-error\')`.',
        'У `submit` пройдіться по `[form.elements.name, form.elements.email]`, запамʼятайте перше поле з помилкою; наприкінці — `e.preventDefault()` і `firstInvalid.focus()`.'
      ],
      tests: [
        { name: 'поля мають видимі label', code: "['#name', '#email'].forEach(s => {\n  const el = $(s);\n  expect(el.labels.length).toBeGreaterThan(0);\n  expect(el.labels[0].textContent.trim().length).toBeGreaterThan(2);\n});" },
        { name: 'поля повʼязані з помилками через aria-describedby', code: "expect(($('#name').getAttribute('aria-describedby') || '').split(/\\s+/)).toContain('name-error');\nexpect(($('#email').getAttribute('aria-describedby') || '').split(/\\s+/)).toContain('email-error');" },
        { name: 'порожня форма: відправку скасовано, aria-invalid і тексти помилок', code: "input('#name', '');\ninput('#email', '');\nconst r = submit('#sub');\nexpect(r.fired).toBe(true);\nexpect(r.prevented).toBe(true);\nexpect($('#name').getAttribute('aria-invalid')).toBe('true');\nexpect($('#email').getAttribute('aria-invalid')).toBe('true');\nexpect($('#name-error').textContent.trim()).toBe('Вкажіть імʼя');\nexpect($('#email-error').textContent.trim()).toBe('Вкажіть email');" },
        { name: 'фокус — на першому невалідному полі', code: "input('#name', '');\ninput('#email', '');\nsubmit('#sub');\nexpect(document.activeElement).toBe($('#name'));" },
        { name: 'некоректний email: окремий текст, фокус на email, імʼя валідне', code: "input('#name', 'Олена');\ninput('#email', 'olena');\nconst r = submit('#sub');\nexpect(r.prevented).toBe(true);\nexpect($('#email-error').textContent.trim()).toBe('Email має містити @ і домен');\nexpect(document.activeElement).toBe($('#email'));\nexpect($('#name').getAttribute('aria-invalid')).not.toBe('true');\nexpect($('#name-error').textContent.trim()).toBe('');" },
        { name: 'валідна форма відправляється, помилки очищено', code: "input('#name', 'Олена');\ninput('#email', 'olena@example.com');\nconst r = submit('#sub');\nexpect(r.fired).toBe(true);\nexpect(r.prevented).toBe(false);\nexpect($('#email').getAttribute('aria-invalid')).not.toBe('true');\nexpect($('#email-error').textContent.trim()).toBe('');" }
      ],
      explanation: `
Після невдалої відправки фокус на полі → «**Імʼя**, редагований текст, **недійсне значення**, обовʼязкове, **Вкажіть імʼя**»: label (імʼя) + \`aria-invalid\` (стан) + \`aria-describedby\` (опис) пояснюють, що сталося і що робити (WCAG 3.3.1, 3.3.3).

**Альтернативи:** error summary над формою з посиланнями на поля — для довгих форм; \`role="alert"\` на контейнері помилок — але не для 10 полів одночасно; \`aria-errormessage\` — підтримка слабша, ніж у \`aria-describedby\`.

**Типові помилки:** помилки лише кольором; placeholder замість label; валідація з озвучуванням на кожне натискання клавіші.

**Що спитають далі:** коли показувати помилку — на blur, на submit чи під час введення?
`
    },

    // ───────────────────────── 5. Фокус, tabindex, skip link ─────────────────────────
    {
      id: 'a11y-focus-tabindex',
      group: 'focus',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Фокус: tabindex, порядок, :focus-visible, skip link',
      tags: ['focus', 'keyboard'],
      question: 'Як працює фокус і навігація з клавіатури? Що означають tabindex 0, -1 і додатні значення? Як правильно стилізувати фокус? Оберіть **усі** правильні твердження.',
      choices: [
        '`tabindex="-1"` прибирає елемент із Tab-послідовності, але дозволяє фокусувати його через `el.focus()`',
        'Додатний `tabindex` — зручний спосіб задати точний порядок фокусу, його радять для складних форм',
        'CSS `order` і `row-reverse` змінюють і візуальний порядок, і порядок переходу по Tab',
        '`:focus-visible` показує фокус при навігації з клавіатури й зазвичай не показує при кліку мишею',
        'Після SPA-переходу фокус варто перевести на `h1` з `tabindex="-1"` або оголосити новий маршрут'
      ],
      correct: [0, 3, 4],
      why: [
        'Правильно: так роблять для цілей програмного фокусу — `main` для skip link, заголовок, контейнер модалки.',
        'Хибно: додатні значення йдуть перед усіма елементами і ламають логічний порядок — це антипатерн.',
        'Хибно: CSS змінює лише вигляд, Tab іде за порядком DOM — звідси розбіжність (WCAG 2.4.3).',
        'Правильно: браузер евристично показує фокус при клавіатурній навігації (для полів вводу — завжди).',
        'Правильно: інакше фокус лишається на зниклому посиланні або губиться на `body`.'
      ],
      hint: 'Природний порядок DOM, програмний фокус, outline: none — гріх, skip links.',
      answer: `
**Фокусовані за замовчуванням:** \`<a href>\`, \`<button>\`, \`<input>\`, \`<select>\`, \`<textarea>\`, \`<summary>\`, \`contenteditable\`. Порядок Tab — **порядок у DOM**.

**tabindex:**
- \`0\` — у Tab-послідовності в порядку DOM (кастомні віджети);
- \`-1\` — лише програмно \`el.focus()\` (заголовок після SPA-переходу, ціль skip link, неактивні вкладки);
- додатні — ідуть першими, ламають порядок — **антипатерн**.

**Порядок фокусу = візуальний порядок.** CSS \`order\`, \`row-reverse\`, grid-розміщення Tab не змінюють (2.4.3).

\`\`\`css
*:focus { outline: none; }                                    /* ❌ без заміни */
:focus-visible { outline: 3px solid #2563eb; outline-offset: 2px; } /* ✅ */
\`\`\`
WCAG 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured (sticky-хедер → \`scroll-padding-top\`).

**Skip link** — перше посилання «Перейти до основного вмісту» → \`#main\` (2.4.1 Bypass Blocks).

**SPA і видалення:** після переходу — фокус на \`h1\` або live-оголошення; після видалення рядка — фокус на сусідній елемент. Події \`focus\`/\`blur\` не спливають, \`focusin\`/\`focusout\` — спливають.
`,
      keyPoints: [
        'Порядок Tab = порядок DOM; візуальний порядок має збігатися',
        'tabindex 0 — у потоці, -1 — лише програмно, додатні — антипатерн',
        'Не прибирати outline без заміни; :focus-visible',
        'Skip link до #main',
        'Керування фокусом у SPA і після видалення елементів'
      ],
      followUps: ['Чим focus/blur відрізняються від focusin/focusout?', 'Як зробити, щоб sticky-хедер не закривав фокус?', 'Куди переводити фокус після закриття модалки?']
    },
    {
      id: 'a11y-quiz-tabindex-order',
      group: 'focus',
      type: 'quiz',
      level: 2,
      title: 'Порядок Tab з різними tabindex',
      tags: ['focus', 'keyboard'],
      question: `
У якому порядку елементи отримають фокус при натисканні Tab (від початку сторінки)?

\`\`\`html
<button tabindex="2">A</button>
<button>B</button>
<button tabindex="1">C</button>
<button tabindex="-1">D</button>
<a href="/help">E</a>
\`\`\`
`,
      options: ['A, B, C, D, E', 'C, A, B, E', 'C, A, B, D, E', 'B, E, C, A'],
      answer: 1,
      why: [
        'Це просто порядок DOM — але додатні tabindex ідуть першими, а D (-1) взагалі не в Tab-послідовності.',
        'Правильно: спершу додатні за зростанням (C=1, A=2), потім решта в порядку DOM (B, E); D пропускається.',
        'D має `tabindex="-1"` — він фокусується лише через `D.focus()`, не клавішею Tab.',
        'Навпаки: елементи з додатним tabindex отримують фокус раніше за всі інші.'
      ],
      hint: 'Спочатку елементи з додатним tabindex (за зростанням), потім — решта в порядку DOM. А що з -1?',
      explanation: `
**C → A → B → E.** Додатні tabindex — першими за зростанням, далі \`tabindex="0"\` і нативно фокусовані — у порядку DOM, \`-1\` — поза Tab-послідовністю.

Тому додатні tabindex — антипатерн: порядок фокусу перестає відповідати візуальному, і кожен новий елемент змушує перераховувати значення.
`
    },
    {
      id: 'a11y-skip-link',
      group: 'focus',
      type: 'dom',
      level: 1,
      title: 'Skip link «Перейти до основного вмісту»',
      tags: ['focus', 'keyboard'],
      description: `
**Завдання.** Додайте skip link: перше посилання сторінки, яке з клавіатури переносить одразу до основного вмісту, оминаючи меню.

**Де трапляється:** будь-який сайт з хедером і навігацією (GOV.UK, GitHub, Rozetka); вимога WCAG 2.4.1 Bypass Blocks.

**Дано (HTML)**
- \`<header>\` з логотипом \`<a class="logo">\` і \`<nav>\` з трьома посиланнями;
- \`<main>\` з \`<h1>Каталог</h1>\` і текстом.

**Що написати**
- **HTML:** **першим** елементом \`body\` — \`<a class="skip-link" href="#main">Перейти до основного вмісту</a>\`;
- **HTML:** \`<main id="main" tabindex="-1">\` — ціль переходу;
- **CSS:** \`.skip-link\` у звичайному стані — за межами екрана (\`position: absolute; top: -100px\`);
- **CSS:** \`.skip-link:focus\` — у видимій області (наприклад, \`top: 8px\`).

**Приклад**
\`\`\`text
Tab (1-й раз) → зʼявляється «Перейти до основного вмісту»
Enter         → фокус на <main>, наступний Tab — по вмісту сторінки
\`\`\`

**Як це працює:** посилання на \`#main\` прокручує до цілі, а \`tabindex="-1"\` дозволяє \`main\` отримати фокус — тоді наступний Tab іде від нього, а не з початку сторінки.

**Врахуйте:** не ховайте посилання через \`display: none\`/\`visibility: hidden\`/\`hidden\` — воно стане нефокусованим; \`main:focus { outline: none; }\` допустимо — це контейнер, а не контрол.
`,
      html: `<header>
  <a href="/" class="logo">Acme</a>
  <nav>
    <a href="#">Каталог</a>
    <a href="#">Доставка</a>
    <a href="#">Контакти</a>
  </nav>
</header>
<main>
  <h1>Каталог</h1>
  <p>Вміст сторінки…</p>
</main>`,
      css: `body { font-family: system-ui, sans-serif; }
nav a { margin-right: 12px; }

/* 1. Сховати за межами екрана, але залишити фокусованим */
.skip-link {
  /* TODO: position, top, left, z-index, фон, відступи */
}

/* 2. Показати при фокусі */
.skip-link:focus {
  /* TODO */
}
`,
      js: '',
      editable: ['html', 'css'],
      solution: {
        html: `<a class="skip-link" href="#main">Перейти до основного вмісту</a>
<header>
  <a href="/" class="logo">Acme</a>
  <nav>
    <a href="#">Каталог</a>
    <a href="#">Доставка</a>
    <a href="#">Контакти</a>
  </nav>
</header>
<main id="main" tabindex="-1">
  <h1>Каталог</h1>
  <p>Вміст сторінки…</p>
</main>`,
        css: `body { font-family: system-ui, sans-serif; }
nav a { margin-right: 12px; }

.skip-link {
  position: absolute;
  left: 8px;
  top: -100px;           /* за межами екрана, але фокусоване */
  z-index: 1000;
  padding: 8px 16px;
  background: #111;
  color: #fff;
}
.skip-link:focus {
  top: 8px;              /* зʼявляється при фокусі */
}
main:focus { outline: none; } /* контейнер-ціль, а не контрол */
`
      },
      hints: [
        'Посилання має стояти в HTML **перед** `<header>`, а `main` — отримати `id="main"` і `tabindex="-1"`.',
        'Сховати, зберігши фокусованість: `position: absolute; top: -100px;`.',
        'Показати: `.skip-link:focus { top: 8px; }`. Додайте фон і `padding`, щоб посилання було помітним.'
      ],
      tests: [
        { name: 'перший фокусований елемент — skip link на #main', code: "const focusable = $$('a[href], button, input, select, textarea, [tabindex]').filter(el => el.getAttribute('tabindex') !== '-1');\nconst first = focusable[0];\nexpect(first.classList.contains('skip-link')).toBe(true);\nexpect(first.getAttribute('href')).toBe('#main');\nexpect(first.textContent).toMatch('основного вмісту');" },
        { name: 'ціль: main#main з tabindex="-1"', code: "const m = $('main');\nexpect(m.id).toBe('main');\nexpect(m.getAttribute('tabindex')).toBe('-1');" },
        { name: 'без фокусу посилання поза екраном, але фокусоване', code: "const s = $('.skip-link');\ns.blur();\nexpect(css(s, 'display')).not.toBe('none');\nexpect(css(s, 'visibility')).toBe('visible');\nconst r = rect(s);\nconst offscreen = r.bottom <= 0 || r.right <= 0 || r.top >= innerHeight || (r.width <= 1 && r.height <= 1);\nexpect(offscreen).toBe(true);" },
        { name: 'при фокусі посилання видно', code: "const s = $('.skip-link');\ns.focus();\nexpect(document.activeElement).toBe(s);\nconst r = rect(s);\nexpect(r.top).toBeGreaterThanOrEqual(0);\nexpect(r.left).toBeGreaterThanOrEqual(0);\nexpect(r.width).toBeGreaterThan(20);\nexpect(r.height).toBeGreaterThan(10);\ns.blur();" }
      ],
      explanation: `
Без skip link користувач клавіатури на **кожній** сторінці проходить Tab-ом логотип і все меню.

- Ховаємо так, щоб елемент лишався **фокусованим** — \`display: none\` / \`visibility: hidden\` виключають його з Tab.
- \`tabindex="-1"\` на \`main\` гарантує, що фокус справді перейде на ціль (історично деякі браузери лише прокручували).
- Альтернатива позиціонуванню — \`.sr-only\`, який при \`:focus\` скидає кліп.

**Що спитають далі:** чи потрібні skip links, якщо є landmarks? (Так: landmarks доступні лише користувачам screen reader, а skip link — і зрячим користувачам клавіатури.)
`
    },

    // ───────────────────────── 6. Модальне вікно ─────────────────────────
    {
      id: 'a11y-modal-patterns',
      group: 'modal',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Доступне модальне вікно: вимоги',
      tags: ['focus', 'dialog', 'aria'],
      question: 'Які вимоги до доступного модального вікна? Як ви його реалізуєте — з нуля і на нативному <dialog>? Оберіть **усі** правильні твердження.',
      choices: [
        'При відкритті фокус переходить усередину модалки, а при закритті повертається на елемент-тригер',
        'Достатньо `role="dialog"` — screen reader сам заблокує фон і обробить натискання Escape',
        'Tab з останнього фокусованого елемента модалки має переводити фокус на перший (focus trap)',
        'У деструктивному діалозі фокус варто одразу ставити на «Видалити», щоб пришвидшити дію',
        '`<dialog>.show()` дає те саме, що `showModal()`: top layer, `::backdrop` та інертний фон'
      ],
      correct: [0, 2],
      why: [
        'Правильно: інакше користувач клавіатури після закриття опиняється на початку сторінки.',
        'Хибно: роль — лише семантика; фон, Escape і фокус реалізуєте ви (або `showModal()`).',
        'Правильно: фокус не має виходити на фон, поки модалка відкрита.',
        'Хибно: фокус ставлять на найменш деструктивну дію («Скасувати»), щоб випадковий Enter не видалив дані.',
        'Хибно: `show()` відкриває немодальний діалог — без backdrop і без інертного фону.'
      ],
      hint: 'Роль та імʼя, куди йде фокус при відкритті, що з Tab, Escape, що з фоном, куди повертається фокус.',
      answer: `
**Вимоги (WAI-ARIA APG, Dialog Modal):**
1. \`role="dialog"\` (\`alertdialog\` для підтверджень), \`aria-modal="true"\`, \`aria-labelledby\` на заголовок.
2. **Фокус при відкритті** — всередину: перший елемент, найменш деструктивна дія або заголовок (\`tabindex="-1"\`) для довгого вмісту.
3. **Focus trap:** Tab з останнього → перший, Shift+Tab з першого → останній.
4. **Escape** закриває.
5. **Фон неактивний:** \`inert\` + блокування скролу.
6. **Повернення фокусу** на тригер (запамʼятати \`document.activeElement\`).

\`\`\`js
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') return close();
  if (e.key !== 'Tab') return;
  const items = focusables();
  if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1).focus(); }
  else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0].focus(); }
});
\`\`\`

**Нативно — \`showModal()\`:** top layer, \`::backdrop\`, інертний фон, Escape (подія \`cancel\`), повернення фокусу після \`close()\`. Лишається \`aria-labelledby\` і блокування скролу (\`body:has(dialog[open]) { overflow: hidden }\`). Рекомендований підхід.

**Пастки:** модалка всередині контейнера з \`inert\`; немає повернення фокусу; список фокусованих обчислено один раз.
`,
      keyPoints: [
        'role="dialog", aria-modal, aria-labelledby',
        'Фокус усередину при відкритті',
        'Focus trap (Tab / Shift+Tab по колу) та Escape',
        'Фон inert, скрол заблоковано',
        'Повернення фокусу на тригер; <dialog>.showModal() робить більшість із цього нативно'
      ],
      followUps: ['Чим alertdialog відрізняється від dialog?', 'Куди ставити фокус у діалозі підтвердження видалення?', 'Як заблокувати скрол сторінки під модалкою?']
    },
    {
      id: 'a11y-modal-focus-trap',
      group: 'modal',
      type: 'dom',
      level: 3,
      title: 'Модалка: focus trap, Escape, повернення фокусу',
      tags: ['focus', 'dialog', 'keyboard'],
      description: `
**Завдання.** Реалізуйте поведінку доступної модалки «Налаштування»: відкриття з фокусом усередину, focus trap, Escape і повернення фокусу (HTML не змінюємо).

**Де трапляється:** самописні модалки в легасі/дизайн-системах; одна з найпопулярніших a11y-задач на співбесідах.

**Дано (HTML)**
- \`<div id="page">\` — сторінка з кнопкою \`#open\` і посиланням;
- \`<div id="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>\` — **поза** \`#page\`;
- у модалці по порядку: \`input#name\`, \`input#news\` (checkbox), \`button#save\`, \`button#close\` (×).

**Що написати**
- \`getFocusable()\` → масив фокусованих елементів модалки (селектор \`FOCUSABLE\` уже є);
- \`openModal()\` → запамʼятати \`document.activeElement\` в \`opener\`, прибрати \`hidden\`, \`page.inert = true\`, фокус на **перший** елемент;
- \`closeModal()\` → \`hidden = true\`, \`page.inert = false\`, \`opener.focus()\`;
- \`keydown\` на \`#modal\`: **Escape** → закрити; **Tab** на останньому → фокус на перший; **Shift+Tab** на першому → на останній (\`preventDefault\` лише в цих двох випадках);
- клік \`#open\` → \`openModal\`, клік \`#close\` → \`closeModal\`.

**Приклад**
\`\`\`text
клік «Налаштування» → модалка видима, #page inert, фокус на #name
Tab на ×            → фокус на #name
Shift+Tab на #name  → фокус на ×
Escape              → модалка схована, фокус знову на #open
\`\`\`

**Як це працює:** \`inert\` робить фон нефокусованим і невидимим для screen reader. Усередині модалки Tab працює нативно — ми перехоплюємо лише вихід за межі (перший/останній елемент). Події клавіш з полів спливають до \`#modal\`, тож одного обробника достатньо.

**Врахуйте:** обчислюйте список фокусованих при кожному натисканні (вміст може змінитися); у \`closeModal\` спершу зніміть \`inert\`, потім \`focus()\` — на інертний елемент фокус не стане; коли модалку закрито, клавіатура не перехоплюється.
`,
      html: `<div id="page">
  <h1>Профіль</h1>
  <button type="button" id="open">Налаштування</button>
  <p>Інший вміст сторінки і <a href="#">посилання</a>.</p>
</div>
<div id="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
  <h2 id="modal-title">Налаштування</h2>
  <label>Імʼя <input id="name"></label>
  <label><input type="checkbox" id="news"> Розсилка</label>
  <button type="button" id="save">Зберегти</button>
  <button type="button" id="close" aria-label="Закрити">×</button>
</div>`,
      css: `body { font-family: system-ui, sans-serif; }
#modal { position: fixed; inset: 60px auto auto 60px; width: 320px; padding: 16px; background: #fff; border: 1px solid #ccc; box-shadow: 0 10px 30px rgba(0,0,0,.2); display: grid; gap: 8px; }
#modal[hidden] { display: none; }`,
      js: `const modal = document.querySelector('#modal');
const page = document.querySelector('#page');
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
let opener = null;

// 1. Масив фокусованих елементів усередині модалки
function getFocusable() {
  // TODO
}

// 2. Відкрити: opener = activeElement, показати, page.inert = true, фокус на перший елемент
function openModal() {
  // TODO
}

// 3. Закрити: сховати, зняти inert, повернути фокус на opener
function closeModal() {
  // TODO
}

// 4. Escape → closeModal(); Tab / Shift+Tab на межах → по колу
modal.addEventListener('keydown', (e) => {
  // TODO
});

// 5. Кнопки відкриття і закриття
// TODO

// Спробуйте: «Налаштування» → Tab кілька разів — фокус не має виходити з модалки; Escape — фокус знову на кнопці.
`,
      editable: ['js'],
      solution: {
        js: `const modal = document.querySelector('#modal');
const page = document.querySelector('#page');
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
let opener = null;

function getFocusable() {
  return Array.from(modal.querySelectorAll(FOCUSABLE));
}

function openModal() {
  opener = document.activeElement; // запамʼятовуємо, куди повернути фокус
  modal.hidden = false;
  page.inert = true;               // фон: без фокусу, кліків і для screen reader
  const items = getFocusable();
  if (items.length) items[0].focus();
}

function closeModal() {
  modal.hidden = true;
  page.inert = false;              // спершу зняти inert — інакше фокус не повернеться
  if (opener && typeof opener.focus === 'function') opener.focus();
  opener = null;
}

modal.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal();
    return;
  }
  if (e.key !== 'Tab') return;
  const items = getFocusable();
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

document.querySelector('#open').addEventListener('click', openModal);
document.querySelector('#close').addEventListener('click', closeModal);
`
      },
      hints: [
        '`getFocusable`: `Array.from(modal.querySelectorAll(FOCUSABLE))`. У `openModal` перед показом збережіть `document.activeElement` — це тригер.',
        'У `keydown`: `if (e.key !== \'Tab\') return;` після обробки Escape. Порівнюйте `document.activeElement` з `items[0]` і `items[items.length - 1]`, враховуючи `e.shiftKey`.',
        'У `closeModal` порядок важливий: `modal.hidden = true; page.inert = false; opener.focus();`.'
      ],
      tests: [
        { name: 'відкриття: модалка видима, фон inert, фокус на першому полі', code: "$('#open').focus();\nclick('#open');\nexpect($('#modal').hidden).toBe(false);\nexpect($('#page').inert).toBe(true);\nexpect(document.activeElement).toBe($('#name'));" },
        { name: 'Tab на останньому елементі → перший', code: "$('#close').focus();\nconst ev = press('#close', 'Tab');\nexpect(ev.defaultPrevented).toBe(true);\nexpect(document.activeElement).toBe($('#name'));" },
        { name: 'Shift+Tab на першому елементі → останній', code: "$('#name').focus();\nconst ev = press('#name', 'Tab', { shiftKey: true });\nexpect(ev.defaultPrevented).toBe(true);\nexpect(document.activeElement).toBe($('#close'));" },
        { name: 'Tab не на межі не перехоплюється', code: "$('#news').focus();\nconst ev = press('#news', 'Tab');\nexpect(ev.defaultPrevented).toBe(false);\nconst ev2 = press('#news', 'Tab', { shiftKey: true });\nexpect(ev2.defaultPrevented).toBe(false);" },
        { name: 'Escape закриває і повертає фокус на тригер', code: "$('#save').focus();\npress('#save', 'Escape');\nexpect($('#modal').hidden).toBe(true);\nexpect($('#page').inert).toBe(false);\nexpect(document.activeElement).toBe($('#open'));" },
        { name: 'кнопка × закриває і повертає фокус', code: "$('#open').focus();\nclick('#open');\nexpect(document.activeElement).toBe($('#name'));\nclick('#close');\nexpect($('#modal').hidden).toBe(true);\nexpect(document.activeElement).toBe($('#open'));" },
        { name: 'закрита модалка нічого не перехоплює', code: "const ev = press('#open', 'Tab');\nexpect(ev.defaultPrevented).toBe(false);\nconst ev2 = press(document.body, 'Escape');\nexpect(ev2.defaultPrevented).toBe(false);" }
      ],
      explanation: `
- **opener** — без повернення фокусу користувач клавіатури після закриття опиняється на початку документа.
- **inert на фоні** — фон не фокусується, не клікається, прихований від SR. Тому модалка має бути **поза** інертним контейнером.
- **Trap лише на межах** — усередині Tab нативний; список елементів обчислюється щоразу, бо вміст динамічний.

**Нативна альтернатива** — \`<dialog>\` + \`showModal()\`: inert-фон, Escape і повернення фокусу браузер робить сам.

**Типові помилки:** \`aria-hidden="true"\` на \`body\` (модалка теж зникає з дерева); список фокусованих один раз при ініціалізації; закриття лише кліком по фону.

**Що спитають далі:** як обробити вкладені модалки (стек opener-ів)? Як відфільтрувати невидимі елементи (\`checkVisibility()\`)?
`
    },

    // ───────────────────────── 7. Складені віджети ─────────────────────────
    {
      id: 'a11y-accordion',
      group: 'widgets',
      type: 'dom',
      level: 2,
      title: 'Доступний акордеон: aria-expanded і aria-controls',
      tags: ['aria', 'accordion'],
      description: `
**Завдання.** Зробіть FAQ-акордеон за патерном WAI-ARIA APG: кнопка в заголовку керує своєю панеллю (HTML не змінюємо).

**Де трапляється:** FAQ, «Доставка / Оплата / Повернення» на сторінці товару, фільтри в каталозі.

**Дано (HTML)**
- \`.accordion\` з трьома парами: \`<h3><button class="acc-trigger" id="acc1">…</button></h3>\` + \`<div class="acc-panel" id="acc1-panel">\` (так само \`acc2\`, \`acc3\`);
- CSS уже малює стрілку за \`[aria-expanded]\`.

**Що написати** (у циклі по \`triggers\`)
- кнопка: \`aria-expanded="false"\`, \`aria-controls\` = id панелі (\`<id кнопки>-panel\`);
- панель: \`role="region"\`, \`aria-labelledby\` = id кнопки, \`hidden = true\`;
- \`click\` по кнопці → інвертує \`aria-expanded\` і \`hidden\` своєї панелі. Панелі незалежні — можна відкрити кілька.

**Приклад**
\`\`\`text
клік «Оплата»   → #acc2 aria-expanded="true", #acc2-panel видима
клік «Доставка» → відкриті обидві
клік «Оплата»   → #acc2-panel знову схована
\`\`\`

**Як це працює:** заголовок дає навігацію по структурі (клавіша H у screen reader), нативна \`<button>\` — фокус і Enter/Space, \`aria-expanded\` — стан «розгорнуто/згорнуто», \`aria-controls\` — звʼязок з панеллю. \`hidden\` прибирає панель і з екрана, і з дерева доступності.

**Врахуйте:** стан тримайте в самому атрибуті \`aria-expanded\` — одне джерело правди для ARIA і CSS; \`aria-expanded\` ставиться на кнопку, а не на панель.
`,
      html: `<div class="accordion">
  <h3><button type="button" class="acc-trigger" id="acc1">Доставка</button></h3>
  <div class="acc-panel" id="acc1-panel">Доставка по Україні за 1–3 дні.</div>
  <h3><button type="button" class="acc-trigger" id="acc2">Оплата</button></h3>
  <div class="acc-panel" id="acc2-panel">Карткою онлайн або при отриманні.</div>
  <h3><button type="button" class="acc-trigger" id="acc3">Повернення</button></h3>
  <div class="acc-panel" id="acc3-panel">14 днів на повернення без пояснень.</div>
</div>`,
      css: `body { font-family: system-ui, sans-serif; }
h3 { margin: 0; }
.acc-trigger { width: 100%; text-align: left; padding: 10px; font: inherit; font-weight: 600; }
.acc-trigger[aria-expanded="true"]::after { content: ' ▲'; }
.acc-trigger[aria-expanded="false"]::after { content: ' ▼'; }
.acc-panel { padding: 8px 10px; }`,
      js: `const triggers = Array.from(document.querySelectorAll('.acc-trigger'));

triggers.forEach((btn) => {
  const panel = document.getElementById(btn.id + '-panel');

  // 1. Кнопка: aria-expanded="false", aria-controls = panel.id
  // TODO

  // 2. Панель: role="region", aria-labelledby = btn.id, hidden
  // TODO

  // 3. Клік: прочитати aria-expanded, інвертувати його і panel.hidden
  btn.addEventListener('click', () => {
    // TODO
  });
});

// Спробуйте: Tab до «Оплата» → Enter. Панель має відкритися, стрілка — змінитися на ▲.
`,
      editable: ['js'],
      solution: {
        js: `const triggers = Array.from(document.querySelectorAll('.acc-trigger'));

triggers.forEach((btn) => {
  const panel = document.getElementById(btn.id + '-panel');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', panel.id);
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', btn.id);
  panel.hidden = true;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded;
  });
});
`
      },
      hints: [
        'Ініціалізація — чотири `setAttribute` і `panel.hidden = true` для кожної пари.',
        'У кліку: `const expanded = btn.getAttribute(\'aria-expanded\') === \'true\';` — атрибут завжди рядок.',
        'Далі `btn.setAttribute(\'aria-expanded\', String(!expanded)); panel.hidden = expanded;` — була відкрита → ховаємо.'
      ],
      tests: [
        { name: 'кнопки: aria-expanded="false" і aria-controls', code: "$$('.acc-trigger').forEach(b => {\n  expect(b.getAttribute('aria-expanded')).toBe('false');\n  expect(b.getAttribute('aria-controls')).toBe(b.id + '-panel');\n});" },
        { name: 'панелі: region, aria-labelledby, приховані', code: "$$('.acc-panel').forEach(p => {\n  expect(p.getAttribute('role')).toBe('region');\n  expect(p.getAttribute('aria-labelledby')).toBe(p.id.replace('-panel', ''));\n  expect(p.hidden).toBe(true);\n  expect(css(p, 'display')).toBe('none');\n});" },
        { name: 'клік відкриває панель', code: "click('#acc2');\nexpect($('#acc2').getAttribute('aria-expanded')).toBe('true');\nexpect($('#acc2-panel').hidden).toBe(false);\nexpect(css('#acc2-panel', 'display')).not.toBe('none');" },
        { name: 'панелі незалежні', code: "click('#acc1');\nexpect($('#acc1-panel').hidden).toBe(false);\nexpect($('#acc2-panel').hidden).toBe(false);\nexpect($('#acc3-panel').hidden).toBe(true);" },
        { name: 'повторний клік закриває', code: "click('#acc2');\nexpect($('#acc2').getAttribute('aria-expanded')).toBe('false');\nexpect($('#acc2-panel').hidden).toBe(true);\nexpect($('#acc1-panel').hidden).toBe(false);" }
      ],
      explanation: `
Патерн «кнопка в заголовку»: структура (H) + фокус і клавіатура (\`<button>\`) + стан (\`aria-expanded\`) + звʼязок (\`aria-controls\`). \`role="region"\` з іменем робить панель landmark-ом — APG радить це лише для невеликої кількості панелей (до ~6).

**Чому не \`<details>\`?** Він теж доступний і простіший, але дає менше контролю (анімації, стилізація). На співбесіді назвіть обидва варіанти.

**Типові помилки:** \`div\` з \`onclick\` замість кнопки; \`aria-expanded\` на панелі; приховування через \`height: 0\` без \`hidden\` (вміст лишається доступним для Tab).
`
    },
    {
      id: 'a11y-keyboard-patterns',
      group: 'widgets',
      type: 'theory',
      level: 4,
      title: 'Roving tabindex vs aria-activedescendant',
      tags: ['keyboard', 'focus', 'aria'],
      question: 'Як організувати клавіатурну навігацію в складених віджетах (tabs, menu, listbox, grid, toolbar)? Порівняйте roving tabindex і aria-activedescendant.',
      choices: [
        'Віджет — один Tab-стоп, далі стрілки; у комбобоксі з `aria-activedescendant` фокус лишається в input',
        'Кожна кнопка тулбара має отримати `tabindex="0"`, щоб користувач міг пройти їх усі клавішею Tab',
        'З `aria-activedescendant` DOM-фокус реально переходить на активну опцію, тож `:focus-visible` працює',
        'Roving tabindex — це `tabindex="0"` на всіх елементах і перехоплення стрілок на рівні контейнера',
        '`aria-activedescendant` найкраще пасує для tabs і toolbar, а roving tabindex — для комбобокса'
      ],
      correct: 0,
      why: [
        'Правильно: Tab заходить у віджет і виходить з нього, стрілки — всередині; у комбобоксі фокус лишається в полі, щоб можна було друкувати.',
        'Хибно: тулбар з 20 кнопок перетвориться на 20 натискань Tab — складений віджет має бути одним Tab-стопом.',
        'Хибно: DOM-фокус лишається на контейнері/input, активну опцію стилізують і прокручують вручну.',
        'Хибно: у roving tabindex лише активний елемент має `0`, решта — `-1`.',
        'Навпаки: tabs/toolbar — roving tabindex, а комбобокс — aria-activedescendant.'
      ],
      hint: 'Один Tab-стоп на віджет; стрілки всередині. Де фізично знаходиться фокус у кожному підході?',
      answer: `
**Принцип APG:** складений віджет — **один Tab-стоп**; усередині — стрілки, Home/End, іноді type-ahead.

**Roving tabindex:** активний елемент \`tabindex="0"\`, решта \`-1\`; стрілка переставляє tabindex і викликає \`.focus()\`.
- ✅ Реальний фокус: \`:focus-visible\`, прокрутка, природне читання SR; Tab повертає на останній активний.
- ❌ Оновлювати tabindex у багатьох елементах.

**aria-activedescendant:**
\`\`\`html
<input role="combobox" aria-controls="list" aria-expanded="true" aria-activedescendant="opt-3">
<ul role="listbox" id="list">
  <li role="option" id="opt-3" aria-selected="true">Київ</li>
</ul>
\`\`\`
DOM-фокус **на контейнері/input**, «віртуально активний» нащадок — через id.
- ✅ Незамінний для комбобокса (фокус у полі, можна друкувати).
- ❌ Стилізація і \`scrollIntoView\` вручну; елемент має бути в DOM (проблема з віртуалізацією).

**Рішення:** автоматична чи ручна активація вкладок (ручна — якщо панель вантажиться з мережі); обгортання; \`aria-orientation="vertical"\` → ArrowUp/Down.

**Вибір:** tabs, toolbar, radiogroup, menu, tree, grid — roving; combobox — activedescendant. Готові: React Aria, Radix, Headless UI.
`,
      keyPoints: [
        'Складений віджет — один Tab-стоп, всередині стрілки/Home/End',
        'Roving tabindex: 0 у активного, -1 у решти, реальний focus()',
        'aria-activedescendant: фокус на контейнері/input, віртуальний активний id',
        'Комбобокс — activedescendant; tabs/toolbar/menu — roving',
        'Автоматична vs ручна активація; орієнтація; обгортання'
      ],
      followUps: ['Як зробити type-ahead у списку?', 'Як поєднати віртуалізацію списку з aria-activedescendant?', 'Коли вкладки мають використовувати ручну активацію?']
    },
    {
      id: 'a11y-tabs-roving',
      group: 'widgets',
      type: 'dom',
      level: 3,
      title: 'Доступні вкладки: ролі, aria-selected, roving tabindex',
      tags: ['keyboard', 'aria', 'tabs'],
      description: `
**Завдання.** Зробіть вкладки картки товару за WAI-ARIA APG: ролі, звʼязки, roving tabindex і навігація стрілками (HTML не змінюємо, усе в JS).

**Де трапляється:** «Опис / Характеристики / Відгуки» на сторінці товару, налаштування профілю; часта live-coding задача на a11y.

**Дано (HTML)**
- \`<div class="tablist">\` з трьома \`<button>\`: \`#tab-desc\`, \`#tab-specs\`, \`#tab-reviews\`; у кожної \`data-panel\` = id панелі;
- панелі \`<div class="panel">\`: \`#panel-desc\`, \`#panel-specs\`, \`#panel-reviews\`.

**Що написати**
- ініціалізація: \`.tablist\` → \`role="tablist"\`; кнопки → \`role="tab"\` + \`aria-controls\` = \`data-panel\`; панелі → \`role="tabpanel"\` + \`aria-labelledby\` = id вкладки + \`tabindex="0"\`;
- \`selectTab(index, { focus = true } = {})\` → нічого не повертає; активна вкладка: \`aria-selected="true"\`, \`tabIndex = 0\`, панель видима; інші: \`"false"\`, \`-1\`, \`hidden\`; якщо \`focus\` — \`tabs[index].focus()\`;
- на старті \`selectTab(0, { focus: false })\` (не красти фокус при завантаженні);
- клік по вкладці → \`selectTab\`;
- \`keydown\` на \`.tablist\`: \`ArrowRight\`/\`ArrowLeft\` — наступна/попередня **з обгортанням**, \`Home\`/\`End\` — перша/остання, \`preventDefault()\`; інші клавіші — нічого.

**Приклад**
\`\`\`text
старт                        → aria-selected: true,false,false; tabindex: 0,-1,-1
ArrowRight на «Відгуки»      → фокус і вибір на «Опис» (обгортання)
ArrowLeft на «Опис»          → «Відгуки»
End / Home                   → остання / перша
\`\`\`

**Як це працює:** roving tabindex робить вкладки **одним Tab-стопом**: Tab заходить на активну вкладку, наступний Tab — у панель (тому в неї \`tabindex="0"\`). Screen reader оголошує «Відгуки, вкладка, вибрано, 3 з 3» — позицію бере зі структури \`tablist → tab\`.

**Врахуйте:** \`(i + 1) % n\` і \`(i - 1 + n) % n\` для обгортання; поточну вкладку беріть з \`document.activeElement\` (або \`e.target\`); \`ArrowDown\` у горизонтальних вкладках не обробляється.
`,
      html: `<div class="tabs">
  <div class="tablist" aria-label="Інформація про товар">
    <button type="button" id="tab-desc" data-panel="panel-desc">Опис</button>
    <button type="button" id="tab-specs" data-panel="panel-specs">Характеристики</button>
    <button type="button" id="tab-reviews" data-panel="panel-reviews">Відгуки</button>
  </div>
  <div id="panel-desc" class="panel">Легкий ноутбук для роботи і навчання.</div>
  <div id="panel-specs" class="panel">16 ГБ RAM, 512 ГБ SSD, 14 дюймів.</div>
  <div id="panel-reviews" class="panel">4.8 з 5 — 120 відгуків.</div>
</div>`,
      css: `body { font-family: system-ui, sans-serif; }
.tablist { display: flex; gap: 4px; border-bottom: 1px solid #ccc; }
[role="tab"] { padding: 8px 12px; border: 0; background: none; }
[role="tab"][aria-selected="true"] { border-bottom: 3px solid #2563eb; font-weight: 600; }
.panel { padding: 12px 0; }`,
      js: `const tabs = Array.from(document.querySelectorAll('.tablist button'));
const tablist = document.querySelector('.tablist');

// 1. Ролі і звʼязки: tablist / tab + aria-controls / tabpanel + aria-labelledby + tabindex="0"
// TODO

// 2. Вибрати вкладку: aria-selected, tabIndex (0 / -1), hidden у панелей, опційно focus()
function selectTab(index, { focus = true } = {}) {
  // TODO
}

// 3. Клік по вкладці (делегування на tablist)
// TODO

// 4. Клавіші: ArrowRight / ArrowLeft (по колу), Home, End; інші — ігнорувати
tablist.addEventListener('keydown', (e) => {
  // TODO
});

// 5. Початковий стан без крадіжки фокусу
// selectTab(0, { focus: false });

// Спробуйте: Tab до «Опис» → ArrowRight, ArrowRight, ArrowRight — фокус має повернутися на «Опис».
`,
      editable: ['js'],
      solution: {
        js: `const tabs = Array.from(document.querySelectorAll('.tablist button'));
const tablist = document.querySelector('.tablist');
tablist.setAttribute('role', 'tablist');

tabs.forEach((tab) => {
  const panel = document.getElementById(tab.dataset.panel);
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', panel.id);
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', tab.id);
  panel.setAttribute('tabindex', '0');
});

function selectTab(index, { focus = true } = {}) {
  tabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;          // roving tabindex
    document.getElementById(tab.dataset.panel).hidden = !selected;
  });
  if (focus) tabs[index].focus();
}

tablist.addEventListener('click', (e) => {
  const tab = e.target.closest('[role="tab"]');
  if (tab) selectTab(tabs.indexOf(tab));
});

tablist.addEventListener('keydown', (e) => {
  const current = tabs.indexOf(document.activeElement);
  const from = current === -1 ? tabs.indexOf(e.target) : current;
  let next = null;
  switch (e.key) {
    case 'ArrowRight': next = (from + 1) % tabs.length; break;
    case 'ArrowLeft': next = (from - 1 + tabs.length) % tabs.length; break;
    case 'Home': next = 0; break;
    case 'End': next = tabs.length - 1; break;
    default: return;
  }
  e.preventDefault();
  selectTab(next);
});

selectTab(0, { focus: false });
`
      },
      hints: [
        'Спершу в циклі по `tabs` проставте ролі і звʼязки (`aria-controls` ↔ `aria-labelledby`), панель — `document.getElementById(tab.dataset.panel)`.',
        '`selectTab` проходить усі вкладки: `selected = i === index` → `aria-selected`, `tab.tabIndex = selected ? 0 : -1`, `panel.hidden = !selected`.',
        'У `keydown`: `from = tabs.indexOf(document.activeElement)`, далі `switch (e.key)` з `(from + 1) % tabs.length` / `(from - 1 + tabs.length) % tabs.length` / `0` / `tabs.length - 1`; `default: return` — до `preventDefault()`.'
      ],
      tests: [
        { name: 'ролі tablist / tab / tabpanel', code: "expect($('.tablist').getAttribute('role')).toBe('tablist');\nexpect($$('[role=\"tab\"]')).toHaveLength(3);\nexpect($$('[role=\"tabpanel\"]')).toHaveLength(3);" },
        { name: 'звʼязки aria-controls ↔ aria-labelledby', code: "$$('.tablist button').forEach(tab => {\n  const panelId = tab.getAttribute('aria-controls');\n  expect(panelId).toBe(tab.dataset.panel);\n  const panel = document.getElementById(panelId);\n  expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);\n  expect(panel.getAttribute('tabindex')).toBe('0');\n});" },
        { name: 'початковий стан: активна перша вкладка, roving tabindex', code: "const tabs = $$('.tablist button');\nexpect(tabs.map(t => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);\nexpect(tabs.map(t => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);\nexpect([$('#panel-desc').hidden, $('#panel-specs').hidden, $('#panel-reviews').hidden]).toEqual([false, true, true]);" },
        { name: 'клік активує вкладку', code: "click('#tab-reviews');\nconst tabs = $$('.tablist button');\nexpect(tabs.map(t => t.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true']);\nexpect(tabs.map(t => t.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);\nexpect($('#panel-reviews').hidden).toBe(false);\nexpect($('#panel-desc').hidden).toBe(true);" },
        { name: 'ArrowRight з останньої → перша (обгортання), фокус переходить', code: "$('#tab-reviews').focus();\nconst ev = press('#tab-reviews', 'ArrowRight');\nexpect(ev.defaultPrevented).toBe(true);\nexpect(document.activeElement).toBe($('#tab-desc'));\nexpect($('#tab-desc').getAttribute('aria-selected')).toBe('true');\nexpect($('#panel-desc').hidden).toBe(false);\nexpect($('#panel-reviews').hidden).toBe(true);" },
        { name: 'ArrowLeft з першої → остання', code: "$('#tab-desc').focus();\npress('#tab-desc', 'ArrowLeft');\nexpect(document.activeElement).toBe($('#tab-reviews'));\nexpect($('#tab-reviews').getAttribute('aria-selected')).toBe('true');\npress('#tab-reviews', 'ArrowLeft');\nexpect(document.activeElement).toBe($('#tab-specs'));\nexpect($('#tab-specs').tabIndex).toBe(0);" },
        { name: 'Home / End', code: "$('#tab-specs').focus();\npress('#tab-specs', 'End');\nexpect(document.activeElement).toBe($('#tab-reviews'));\npress('#tab-reviews', 'Home');\nexpect(document.activeElement).toBe($('#tab-desc'));\nexpect($('#tab-desc').getAttribute('aria-selected')).toBe('true');" },
        { name: 'інші клавіші нічого не змінюють', code: "$('#tab-desc').focus();\nconst ev = press('#tab-desc', 'ArrowDown');\npress('#tab-desc', 'a');\nexpect(ev.defaultPrevented).toBe(false);\nexpect($('#tab-desc').getAttribute('aria-selected')).toBe('true');\nexpect(document.activeElement).toBe($('#tab-desc'));" }
      ],
      explanation: `
**Roving tabindex** робить вкладки одним Tab-стопом, стрілки рухають і фокус, і вибір (автоматична активація). Одна функція \`selectTab\` синхронізує ARIA-стан, tabindex і видимість — без розсинхронізації.

**Що проговорити:** автоматична vs ручна активація (якщо панель вантажить дані — стрілки рухають лише фокус, Enter/Space активують); вертикальні вкладки — \`aria-orientation="vertical"\` + ArrowUp/Down; ініціалізація без \`focus()\`.

**Типові помилки:** усі вкладки з \`tabindex="0"\`; \`aria-selected\` без \`role="tab"\`; ховати панелі класом, не синхронізуючи ARIA.

**Що спитають далі:** як зробити вкладки, що працюють без JS (progressive enhancement)? Як синхронізувати активну вкладку з URL?
`
    },

    // ───────────────────────── 8. Контраст, рух і тестування ─────────────────────────
    {
      id: 'a11y-contrast-motion',
      group: 'visual',
      type: 'theory',
      level: 2,
      title: 'Контраст, колір, рух і масштабування',
      tags: ['contrast', 'motion', 'visual'],
      question: 'Які вимоги WCAG до візуального оформлення: контраст, колір, анімації, масштабування? Як ви це враховуєте у верстці?',
      choices: [
        'Мінімальний контраст рівня AA для будь-якого тексту — 7:1, незалежно від розміру шрифту',
        'Якщо поле з помилкою позначено червоною рамкою, цього достатньо — колір і є індикатор стану',
        '`prefers-reduced-motion` потрібен лише людям з епілепсією, тому досить прибрати мерехтіння',
        'AA: 4.5:1 для звичайного тексту, 3:1 для великого тексту, меж полів та іконок-кнопок',
        'Заборона масштабування через `user-scalable=no` допустима, якщо верстка вже адаптивна'
      ],
      correct: 3,
      why: [
        '7:1 — це AAA; для AA звичайний текст ≥ 4.5:1, великий — ≥ 3:1.',
        'WCAG 1.4.1: інформацію не можна передавати лише кольором — потрібні текст та/або іконка.',
        'Рух шкодить і людям з вестибулярними розладами (нудота від паралаксу); мерехтіння — окремий критерій.',
        'Правильно: це пороги 1.4.3 (текст) і 1.4.11 (нетекстові UI-елементи).',
        'Блокування zoom порушує 1.4.4: слабозорі збільшують сторінку незалежно від адаптивності.'
      ],
      hint: '4.5:1 і 3:1, «не лише колір», prefers-reduced-motion, 200% zoom і reflow на 320px.',
      answer: `
**Контраст (1.4.3, 1.4.11, AA):** звичайний текст **≥ 4.5:1**; великий (≥ 24px або ≥ 18.66px жирний) **≥ 3:1**; межі полів, іконки-кнопки, індикатор фокусу **≥ 3:1**. Винятки: disabled, декор, логотипи. AAA — 7:1. Перевірка: DevTools color picker, axe. Текст на зображенні — підкладка/затемнення.

**Не лише колір (1.4.1):** помилка = рамка + іконка + текст; посилання в тексті — підкреслення.

**Рух:**
\`\`\`css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
\`\`\`
Паралакс — нудота; мерехтіння > 3 разів/с — ризик нападу (2.3.1); автоматичний рух > 5 с — пауза (2.2.2).

**Масштаб:** zoom 200% (1.4.4), без \`user-scalable=no\`; reflow на 320px без горизонтального скролу (1.4.10); шрифти в \`rem\`; не фіксувати висоти текстових блоків (1.4.12).

**Ще:** \`forced-colors: active\` (Windows High Contrast — важливі межі через \`border\`/\`outline\`, не \`box-shadow\`), \`prefers-contrast\`, Target Size ≥ 24×24 px.
`,
      keyPoints: [
        'Контраст 4.5:1 текст, 3:1 великий текст і UI-компоненти',
        'Інформація не лише кольором',
        'prefers-reduced-motion, без мерехтіння, пауза для автоматичного руху',
        'Zoom 200%, reflow на 320px, rem замість px для шрифтів',
        'forced-colors / prefers-contrast; target size 24×24'
      ],
      followUps: ['Як перевірити контраст тексту на зображенні?', 'Що ламається у Windows High Contrast Mode?', 'Чому px для font-size — погана ідея?']
    },
    {
      id: 'a11y-quiz-contrast',
      group: 'visual',
      type: 'quiz',
      level: 2,
      title: 'Що проходить контраст WCAG AA?',
      tags: ['contrast', 'visual'],
      question: 'Оберіть **усі** варіанти, які відповідають WCAG 2.2 рівня **AA**:',
      options: [
        'Основний текст 16px, звичайний, контраст 4.6:1',
        'Основний текст 16px, звичайний, контраст 3.8:1',
        'Заголовок 24px, звичайний, контраст 3.2:1',
        'Підпис 14px **жирний**, контраст 3.5:1',
        'Межа поля вводу до фону, контраст 3.1:1',
        'Текст на **неактивній** (disabled) кнопці, контраст 2:1'
      ],
      answer: [0, 2, 4, 5],
      why: [
        'Так: 4.6 ≥ 4.5 — поріг для звичайного тексту.',
        'Ні: 3.8 < 4.5; 3:1 достатньо лише для великого тексту.',
        'Так: 24px (18pt) — «великий текст», для нього поріг 3:1.',
        'Ні: жирний стає «великим» з 14 **pt** ≈ 18.66px, а 14px — звичайний текст, потрібно 4.5:1.',
        'Так: межі UI-компонентів — нетекстовий контраст (1.4.11), поріг 3:1.',
        'Так формально: неактивні компоненти виключені з вимог контрасту (хоча читабельність усе одно бажана).'
      ],
      hint: 'Великий текст — це 24px звичайний або 14 **пунктів** (≈18.66px) жирний. Чи 14px = 14pt? І чи є винятки для неактивних елементів?',
      explanation: `
Пороги AA: **4.5:1** — звичайний текст; **3:1** — великий текст (≥ 24px, або ≥ 18.66px жирний) і межі/іконки UI-компонентів. Неактивні елементи й декор — без вимог. Головна пастка — плутати пункти (pt) з пікселями: 14pt ≈ 18.66px.
`
    },
    {
      id: 'a11y-testing',
      group: 'visual',
      type: 'theory',
      level: 2,
      title: 'Як тестувати доступність',
      tags: ['testing', 'tools'],
      question: 'Як ви перевіряєте доступність свого коду? Які інструменти використовуєте і які в них обмеження? Оберіть **усі** правильні твердження.',
      choices: [
        'Автоматичні інструменти на кшталт axe і Lighthouse знаходять лише приблизно 30–40% проблем',
        'Якщо Lighthouse дає 100 балів за Accessibility, сайт гарантовано відповідає WCAG AA',
        'Ручний прохід Tab/Shift+Tab перевіряє досяжність, логічний порядок і видимість фокусу',
        'Запит `getByRole("button", { name: "Зберегти" })` у тестах заодно перевіряє роль та імʼя',
        'Перевіряти зі screen reader має лише QA-команда, бо на Windows і macOS вони всі платні'
      ],
      correct: [0, 2, 3],
      why: [
        'Правильно: машина перевіряє наявність alt, label, контраст, але не змістовність і поведінку.',
        'Хибно: Lighthouse не перевірить порядок фокусу, роботу модалки з клавіатури чи змістовність alt.',
        'Правильно: 5 хвилин з клавіатурою ловлять найкритичніші проблеми.',
        'Правильно: якщо елемент не знаходиться за роллю та імʼям — він, найпевніше, недоступний.',
        'Хибно: NVDA безкоштовний, VoiceOver вбудований у macOS/iOS — розробник може перевіряти сам.'
      ],
      hint: 'Автоматика (лінтери, axe, Lighthouse), ручні перевірки (клавіатура, screen reader, zoom), тести з getByRole.',
      answer: `
**1. Автоматика** (~30–40% проблем): axe DevTools, Lighthouse, WAVE; лінтери \`eslint-plugin-jsx-a11y\`, \`@angular-eslint\`; у CI — \`@axe-core/playwright\`, \`jest-axe\`, \`pa11y\`. Не скаже, чи alt змістовний, чи логічний порядок фокусу, чи працює модалка.

**2. Клавіатура** (5 хв на сторінку): Tab/Shift+Tab — усе досяжне, порядок логічний, фокус видно, немає пасток; Enter/Space, Escape, стрілки; фокус після модалок і переходів.

**3. Screen reader:** NVDA (безкоштовний) / JAWS на Windows, VoiceOver (macOS, iOS), TalkBack (Android). Перевіряємо імена й ролі, заголовки, landmarks, форми, live regions.

**4. Візуальне:** zoom 200–400%, ширина 320px, forced-colors, reduced motion — DevTools → Rendering.

**5. DevTools Accessibility pane** — дерево доступності, обчислені name/role/state.

**6. Тести компонентів:** Testing Library \`getByRole('button', { name: 'Зберегти' })\` → \`getByLabelText\` → … \`getByTestId\` останнім; \`user-event\` для клавіатури (\`user.tab()\`).

**7. Процес:** a11y у Definition of Done, дизайн-рев'ю, аудит за WCAG-чеклістом. Оверлей-віджети не вирішують проблем.
`,
      keyPoints: [
        'Автоматика (axe, Lighthouse, jsx-a11y) ловить лише ~30–40%',
        'Ручна перевірка клавіатурою: досяжність, порядок, видимий фокус, пастки',
        'Screen readers: NVDA, JAWS, VoiceOver, TalkBack',
        'Zoom 200%, reflow 320px, forced-colors, reduced motion',
        'Testing Library getByRole як перевірка доступності в тестах'
      ],
      followUps: ['Як додати a11y-перевірки в CI?', 'Чому getByRole кращий за getByTestId?', 'Як швидко перевірити сторінку з клавіатури?']
    }
  ]
});
