FE.topic('html', {
  intro: `
## Документ

\`\`\`html
<!DOCTYPE html>               <!-- standards mode; без нього — quirks mode -->
<html lang="uk">              <!-- мова: screen readers, перенесення слів, переклад -->
<head>
  <meta charset="utf-8">      <!-- першим, у перших 1024 байтах -->
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Унікальний заголовок сторінки</title>
  <meta name="description" content="Сніпет у пошуку (~150–160 символів)">
  <link rel="canonical" href="https://site.com/page">
  <meta property="og:title" content="..."> <!-- превʼю в соцмережах -->
</head>
\`\`\`

## Семантика

| Тег | Для чого | Landmark |
|---|---|---|
| \`header\` / \`footer\` | шапка / підвал сторінки або секції | banner / contentinfo (лише на верхньому рівні) |
| \`nav\` | основна навігація | navigation |
| \`main\` | унікальний основний вміст (один видимий) | main |
| \`article\` | самодостатній вміст (пост, картка, коментар) | — |
| \`section\` | тематична група **з заголовком** | region (якщо є імʼя) |
| \`aside\` | побічний вміст | complementary |
| \`figure\` + \`figcaption\` | ілюстрація з підписом | — |
| \`time datetime\` | машинозчитувана дата | — |

\`div\`/\`span\` — коли потрібна лише обгортка для стилів, без змісту. Заголовки \`h1–h6\` — без пропусків рівнів.

## Форми — топ пасток

- \`<button>\` у формі без \`type\` = **\`type="submit"\`**.
- Поле без \`name\` не потрапляє у \`FormData\`; \`disabled\` — теж ні; \`readonly\` — потрапляє.
- \`<label for="id">\` або обгортання — інакше поле без доступного імені. \`placeholder\` ≠ label.
- Валідація: \`required\`, \`type\`, \`pattern\`, \`min/max/step\`, \`minlength/maxlength\`; \`novalidate\` на формі вимикає нативні підказки.
- Constraint Validation API: \`el.validity.*\`, \`checkValidity()\`, \`reportValidity()\`, \`setCustomValidity(msg)\` (скидати через \`''\`!).
- Порожнє необовʼязкове поле завжди валідне.

## Зображення

\`\`\`html
<img src="photo-800.jpg"
     srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1600.jpg 1600w"
     sizes="(max-width: 600px) 100vw, 50vw"
     width="800" height="600" alt="Опис змісту" loading="lazy" decoding="async">
\`\`\`

- \`width/height\` → браузер резервує місце (немає CLS). LCP-зображення — **без** \`lazy\`, краще \`fetchpriority="high"\`.
- \`alt=""\` — декоративне зображення; відсутній \`alt\` — помилка.
- \`<picture>\` + \`<source>\` — art direction і формати (AVIF/WebP).

## Інше

- \`target="_blank"\` + \`rel="noopener noreferrer"\` (захист від reverse tabnabbing).
- \`<script defer>\` — після парсингу, по порядку; \`async\` — щойно завантажився, без порядку; \`type="module"\` — defer за замовчуванням.
- \`data-user-id\` → \`el.dataset.userId\` (завжди рядок).
- Таблиці: \`caption\`, \`thead/tbody\`, \`th scope="col|row"\`.
- \`<dialog>\`: \`showModal()\` — top layer, Esc, інертний фон, \`returnValue\`. \`<details>/<summary>\` — акордеон без JS.
- SEO: унікальні \`title\`/\`description\`, семантика, \`canonical\`, \`robots\`, JSON-LD, SSR/SSG для контенту.
`,
  groups: [
    {
      id: 'document',
      title: 'Документ і <head>'
    },
    {
      id: 'semantics',
      title: 'Семантична розмітка'
    },
    {
      id: 'forms',
      title: 'Форми: label, name, кнопки'
    },
    {
      id: 'validation',
      title: 'Валідація форм'
    },
    {
      id: 'media',
      title: 'Зображення'
    },
    {
      id: 'links',
      title: 'Посилання, data-*, iframe'
    },
    {
      id: 'native',
      title: 'Таблиці, details, dialog'
    },
    {
      id: 'seo',
      title: 'SEO-основи'
    },
    { id: 'media-popover', title: 'Відео, аудіо і Popover' }
  ],
  items: [
    // ───────────────────────── 1. Документ і head ─────────────────────────
    {
      id: 'html-doctype',
      group: 'document',
      type: 'theory',
      level: 1,
      title: 'Навіщо <!DOCTYPE html>?',
      tags: ['document', 'doctype'],
      question: 'Навіщо потрібен `<!DOCTYPE html>`? Що станеться, якщо його не вказати?',
      choices: [
        '`<!DOCTYPE html>` підключає HTML5 — без нього теги на кшталт `<main>` браузер не розпізнає',
        'DOCTYPE потрібен лише валідатору W3C, а на рендеринг сторінки браузером не впливає',
        'Без DOCTYPE браузер покаже сторінку як звичайний текст, не розбираючи розмітку',
        'DOCTYPE вмикає standards mode; без нього — quirks mode з емуляцією старих багів верстки',
        'DOCTYPE можна ставити будь-де в `<head>`, головне — до першого підключеного стилю'
      ],
      correct: 3,
      why: [
        'Ні: теги HTML5 браузер розпізнає й без DOCTYPE — від нього залежить лише режим рендерингу.',
        'Ні: DOCTYPE прямо впливає на рендеринг — без нього вмикається quirks mode.',
        'Ні: розмітка розбирається завжди; змінюються лише правила layout (quirks mode).',
        'Так: DOCTYPE перемикає standards/quirks mode; перевірка — `document.compatMode`.',
        'Ні: DOCTYPE має бути першим рядком документа, ще до `<html>`.'
      ],
      hint: 'Подумайте про режими рендерингу: standards, almost standards, quirks.',
      answer: `
**DOCTYPE** визначає **режим рендерингу**. \`<!DOCTYPE html>\` вмикає **standards mode**.

- **Standards** — CSS і layout за специфікаціями.
- **Almost standards** — старі transitional-doctype; відмінність лише у зображеннях у клітинках таблиць.
- **Quirks** — емуляція багів IE5: інша box model для частини елементів, таблиці не успадковують \`font-size\`, інакше працює \`height: 100%\`.

Перевірка: \`document.compatMode\` → \`'CSS1Compat'\` (standards) або \`'BackCompat'\` (quirks).

**Нюанси:** DOCTYPE — першим рядком; регістр не важливий (\`<!doctype html>\`); без нього верстка ламається неочевидно — дебажити боляче.
`,
      keyPoints: [
        'DOCTYPE визначає режим рендерингу, а не версію «тегів»',
        'Без нього — quirks mode з емуляцією старих багів',
        'document.compatMode: CSS1Compat vs BackCompat',
        'Має стояти першим рядком документа'
      ],
      followUps: ['Які конкретні відмінності quirks mode ви знаєте?', 'Що таке almost standards mode?', 'Навіщо атрибут lang на <html>?']
    },
    {
      id: 'html-quiz-charset',
      group: 'document',
      type: 'quiz',
      level: 1,
      title: 'Де має стояти <meta charset>?',
      tags: ['document', 'meta'],
      question: 'Чому `<meta charset="utf-8">` рекомендують ставити **першим** елементом у `<head>`?',
      options: [
        'Інакше `<title>` не відобразиться у вкладці',
        'Кодування має бути оголошене в перших 1024 байтах, інакше браузер може декодувати початок неправильно і перепарсити документ',
        'Це вимога SEO: пошукові системи ігнорують charset нижче за `<title>`',
        'Без цього браузер вмикає quirks mode'
      ],
      answer: 1,
      why: [
        'Ні: `<title>` відобразиться, але кирилиця в ньому може стати «кракозябрами».',
        'Так: браузер шукає кодування в перших 1024 байтах (prescan) — усе до нього може бути декодоване хибно.',
        'Ні: SEO тут ні до чого — йдеться про правильне декодування байтів у символи.',
        'Ні: quirks mode вмикає відсутність DOCTYPE, а не позиція charset.'
      ],
      hint: 'Браузер має знати кодування, щоб правильно прочитати символи, які йдуть далі.',
      explanation: `
Браузер «підглядає» в перші **1024 байти** документа, шукаючи оголошення кодування. Якщо \`charset\` нижче — текст до нього може бути декодований хибно, і парсинг доведеться перезапустити.

Найнадійніше — ще й HTTP-заголовок \`Content-Type: text/html; charset=utf-8\` (він має пріоритет над meta).
`
    },
    {
      id: 'html-head-meta',
      group: 'document',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Важливі meta-теги та вміст <head>',
      tags: ['document', 'meta', 'seo'],
      question: 'Які теги в `<head>` ви вважаєте обовʼязковими для продакшн-сторінки і навіщо кожен? Оберіть **усі** правильні твердження.',
      choices: [
        '`<meta charset="utf-8">` — першим у `<head>`, а `viewport` з `width=device-width` — для мобільних',
        '`<meta name="keywords">` досі суттєво впливає на ранжування, тож його обов\'язково заповнюють',
        '`maximum-scale=1` у viewport — хороша практика: верстка не «роз\'їжджається» при масштабуванні',
        'Унікальні `<title>` і `description` на кожній сторінці; `canonical` — головна URL при дублікатах',
        '`description` напряму підвищує позицію в пошуку, тому він важливіший за `<title>`'
      ],
      correct: [0, 3],
      why: [
        'Так: charset потрібен для правильного декодування, viewport — щоб мобільний не рендерив сторінку як 980px-десктоп.',
        'Ні: пошуковики давно ігнорують keywords — їх заспамили.',
        'Ні: заборона масштабування — порушення доступності (WCAG), людям зі слабким зором потрібен zoom.',
        'Так: title і description формують сніпет у видачі, canonical консолідує дублікати URL.',
        'Ні: description не впливає на ранжування напряму (лише на CTR), а title — один з найважливіших сигналів.'
      ],
      hint: 'Кодування, мобільні пристрої, пошук, соцмережі, дублікати URL.',
      answer: `
**Мінімум:**

\`\`\`html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Купити ноутбук Lenovo X1 — Магазин</title>
<meta name="description" content="Короткий опис для сніпета в пошуку">
<link rel="canonical" href="https://shop.com/laptops/x1">
<link rel="icon" href="/favicon.svg">
\`\`\`

- **charset** — першим (перші 1024 байти).
- **viewport** — без нього мобільний рендерить сторінку як 980px і зменшує. Не забороняйте масштабування.
- **title** — вкладка, закладки, заголовок у видачі; унікальний, головне — спереду.
- **description** — сніпет, впливає на CTR, не на позицію.
- **canonical** — «головна» URL при дублікатах.

**За потреби:** Open Graph (\`og:title\`, \`og:image\`…) для превʼю в соцмережах, \`<meta name="robots" content="noindex">\` для службових сторінок, \`hreflang\` для мовних версій, \`preconnect\`/\`preload\` для критичних ресурсів.
`,
      keyPoints: [
        'charset + viewport — технічний мінімум',
        'Унікальні title і description для кожної сторінки',
        'canonical проти дублікатів',
        'Open Graph для превʼю в соцмережах',
        'Не забороняти масштабування у viewport (a11y)'
      ],
      followUps: ['Що буде на мобільному без viewport?', 'Чим відрізняється preload від prefetch?', 'Як зробити, щоб сторінка не індексувалась?']
    },
    {
      id: 'html-quiz-script-order',
      group: 'document',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Порядок виконання defer і async',
      tags: ['scripts'],
      question: `
\`a.js\` — великий і повільний, \`b.js\` і \`c.js\` — маленькі. Яке твердження **гарантовано** правдиве?

\`\`\`html
<head>
  <script defer src="a.js"></script>
  <script async src="b.js"></script>
  <script defer src="c.js"></script>
</head>
\`\`\`
`,
      options: [
        '`c.js` виконається раніше за `a.js`, бо завантажиться швидше',
        'Усі три скрипти виконаються до `DOMContentLoaded`',
        '`b.js` виконається останнім, бо стоїть між defer-скриптами',
        '`a.js` виконається раніше за `c.js`; момент виконання `b.js` не визначений'
      ],
      answer: 3,
      why: [
        'Ні: defer-скрипти виконуються в порядку документа, незалежно від швидкості завантаження.',
        'Ні: async-скрипт може виконатися і після `DOMContentLoaded` — гарантія лише для defer.',
        'Ні: async виконується щойно завантажився; позиція в розмітці нічого не гарантує.',
        'Так: defer зберігає порядок (a → c), а async — «хто перший завантажився».'
      ],
      hint: 'Який із атрибутів зберігає порядок документа, а який — ні?',
      explanation: `
- **defer**: завантаження паралельно з парсингом, виконання **після** парсингу, **у порядку документа**, до \`DOMContentLoaded\`.
- **async**: виконання одразу після завантаження, без гарантій порядку, до або після \`DOMContentLoaded\`.

\`type="module"\` за замовчуванням поводиться як \`defer\`. Детальніше — у темі «Рендеринг».
`
    },

    // ───────────────────────── 2. Семантика ─────────────────────────
    {
      id: 'html-semantics-why',
      group: 'semantics',
      type: 'theory',
      level: 1,
      interview: true,
      title: 'Що таке семантична верстка і навіщо вона?',
      tags: ['semantics'],
      question: 'Що таке семантичний HTML? Чому не можна все зробити на `div` і класах? Оберіть **усі** правильні твердження.',
      choices: [
        'Семантика потрібна лише для SEO — для screen reader `<div class="nav">` рівноцінний `<nav>`',
        '`<button>` отримує фокус і натискається з клавіатури (Enter/Space) без JS, а `<div onclick>` — ні',
        'Screen reader оголошує ролі й дає переходити по landmarks і заголовках завдяки семантичним тегам',
        'Семантика означає повну відмову від `div` і `span`, навіть для суто стильових обгорток',
        'Атрибут `role="button"` сам дає `<div>` фокус і реакцію на Enter/Space, як у `<button>`'
      ],
      correct: [1, 2],
      why: [
        'Ні: класи нічого не означають для дерева доступності — `<nav>` створює landmark, а `div.nav` — ні.',
        'Так: нативні елементи мають вбудовану поведінку — фокус, клавіатуру, відправку форми.',
        'Так: ролі й landmarks беруться із семантичних тегів, і по них користувач screen reader навігує.',
        'Ні: `div`/`span` — нормальні обгортки для стилів, коли жоден семантичний тег не підходить.',
        'Ні: `role` змінює лише те, що оголошує screen reader; фокус (`tabindex`) і клавіатуру треба додати вручну.'
      ],
      hint: 'Хто, крім людини з очима, «читає» вашу розмітку?',
      answer: `
**Семантичний HTML** — елементи за **змістом**, а не виглядом: \`<nav>\` для навігації, \`<button>\` для дії, \`<a>\` для переходу, \`<h1–h6>\` для заголовків, \`<ul>\` для списку.

**Навіщо:**
1. **Доступність** — ролі, landmarks, навігація по заголовках.
2. **Вбудована поведінка** — \`<button>\` фокусується й натискається з клавіатури, \`<details>\` розгортається без JS.
3. **SEO** — пошуковик розуміє структуру.
4. **Підтримуваність** — \`<header><nav>\` читається краще за \`<div class="top"><div class="menu">\`.

\`\`\`html
<!-- погано --> <div class="btn" onclick="save()">Зберегти</div>
<!-- добре -->  <button type="button" onclick="save()">Зберегти</button>
\`\`\`

\`div\`/\`span\` — нормально для обгорток суто під стилі.
`,
      keyPoints: [
        'Елементи за змістом, а не за виглядом',
        'Доступність: ролі, landmarks, навігація по заголовках',
        'Вбудована поведінка (фокус, клавіатура) без JS',
        'SEO та підтримуваність',
        'div/span — для суто стильових обгорток'
      ],
      followUps: ['Чим відрізняється <article> від <section>?', 'Скільки <main> може бути на сторінці?', 'Чому <a href="#" onclick> — погана кнопка?']
    },
    {
      id: 'html-quiz-article-section',
      group: 'semantics',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'article, section чи div?',
      tags: ['semantics'],
      question: 'Картка товару в каталозі (фото, назва, ціна, кнопка «Купити»), яку можна показати окремо в іншому місці сайту чи в RSS. Який елемент найкраще підходить для обгортки картки?',
      options: ['`<section>`', '`<div>`', '`<article>`', '`<aside>`'],
      answer: 2,
      why: [
        'Ні: `<section>` — тематичний розділ документа з заголовком («Відгуки»), частина цілого, а не самодостатній блок.',
        'Ні: `<div>` допустимий, але втрачає семантику, яку тут можна мати безкоштовно.',
        'Так: картка має сенс сама по собі (тест «можна витягти в RSS») — це `<article>`.',
        'Ні: `<aside>` — побічний вміст (сайдбар, примітка), а картка — основний вміст каталогу.'
      ],
      hint: 'Тест: чи має вміст сенс сам по собі, у відриві від сторінки?',
      explanation: `
\`<article>\` — **самодостатній** фрагмент: пост, коментар, картка товару, віджет. Тест: «чи можна витягти його в RSS / на іншу сторінку без втрати змісту?».

Якщо для \`<section>\` не можете придумати заголовок — швидше за все, це \`div\`. Article можуть бути вкладені (коментарі в пості), section може містити article і навпаки.
`
    },
    {
      id: 'html-quiz-landmarks',
      group: 'semantics',
      type: 'quiz',
      level: 2,
      title: 'Які елементи створюють landmarks?',
      tags: ['semantics', 'a11y'],
      question: 'Оберіть **усі** елементи, які за замовчуванням (без атрибутів, на верхньому рівні сторінки) створюють landmark-регіон для screen reader:',
      options: ['`<main>`', '`<article>`', '`<nav>`', '`<section>` без заголовка й aria-label', '`<aside>`', '`<div class="header">`'],
      answer: [0, 2, 4],
      why: [
        'Так: `<main>` має неявну роль main.',
        'Ні: роль article — структурна, а не landmark.',
        'Так: `<nav>` — роль navigation.',
        'Ні: `<section>` стає landmark (region) лише з доступним імʼям (`aria-label`/`aria-labelledby`).',
        'Так: `<aside>` — роль complementary.',
        'Ні: класи не впливають на дерево доступності.'
      ],
      hint: 'Landmarks — це великі «орієнтири» сторінки, між якими користувач screen reader стрибає однією клавішею.',
      explanation: `
Неявні ролі: \`main\` → **main**, \`nav\` → **navigation**, \`aside\` → **complementary**, \`header\`/\`footer\` на верхньому рівні → **banner**/**contentinfo**. \`form\` і \`section\` стають **form**/**region** лише з доступним імʼям — інакше сторінка засмічувалася б безіменними регіонами.
`
    },
    {
      id: 'html-quiz-p-div',
      group: 'semantics',
      type: 'quiz',
      level: 3,
      title: 'Що зробить парсер з <div> всередині <p>?',
      tags: ['content-model', 'parsing'],
      question: `
Скільки елементів \`<p>\` буде в DOM після парсингу цієї розмітки?

\`\`\`html
<p>Текст<div>Блок</div></p>
\`\`\`
`,
      options: ['1 — div стане дочірнім елементом p', '2', '0 — некоректна розмітка відкидається', '1, а div опиниться після нього'],
      answer: 1,
      why: [
        'Ні: `<p>` може містити лише phrasing content, тож div туди не потрапить.',
        'Так: div неявно закриває p, а «зайвий» `</p>` створює новий порожній `<p></p>`.',
        'Ні: HTML-парсер ніколи не відкидає документ — він виправляє розмітку за алгоритмом.',
        'Майже: div справді опиниться після першого p, але `</p>` без відкритого p створить ще один.'
      ],
      hint: '`<p>` може містити лише phrasing content. Що робить парсер, коли зустрічає блочний елемент у відкритому `<p>`? А що він зробить із «зайвим» `</p>`?',
      explanation: `
1. \`<p>Текст\` — відкрито p.
2. \`<div>\` не може бути в p → парсер **неявно закриває** \`<p>\`.
3. \`</div>\` закриває div.
4. \`</p>\` без відкритого p → створюється **новий порожній** \`<p></p>\`.

Результат: \`<p>Текст</p><div>Блок</div><p></p>\`. Тому \`p div {}\` у CSS не спрацює. Схожі пастки: \`<a>\` в \`<a>\`, \`<form>\` у \`<form>\`, таблиця без \`<tbody>\` (парсер додає його сам).
`
    },
    {
      id: 'html-semantic-skeleton',
      group: 'semantics',
      type: 'dom',
      level: 1,
      title: 'Семантичний каркас сторінки',
      tags: ['semantics', 'headings'],
      description: `
**Завдання.** Перепишіть «div-суп» сторінки блогу на семантичні теги. Текст лишається тим самим — змінюються лише теги.

**Де трапляється:** рефакторинг легасі-верстки; класичне завдання співбесіди «зверстайте каркас сторінки».

**Дано (HTML):** \`.header\` з логотипом і \`.menu\` (3 посилання), \`.content\` із заголовком \`.title\` і двома \`.post\` (у кожному \`.post-title\` + абзац), \`.sidebar\` з \`.sidebar-title\`, \`.footer\`.

**Що написати**
- шапка → \`<header>\`, меню → \`<nav>\` усередині неї (3 посилання);
- основний вміст → **один** \`<main>\`;
- «Як підготуватися до співбесіди» → **єдиний** \`<h1>\`, усередині \`main\`;
- кожен пост → \`<article>\` з \`<h2>\`;
- сайдбар → \`<aside>\` з \`<h2>\`;
- підвал → \`<footer>\` на рівні сторінки (не в \`main\`/\`article\`/\`aside\`).

**Приклад** (фрагмент результату)
\`\`\`html
<main>
  <h1>Як підготуватися до співбесіди</h1>
  <article>
    <h2>Вивчіть основи HTML</h2>
    <p>…</p>
  </article>
  …
</main>
\`\`\`

**Як це працює:** семантичні контейнери створюють landmarks (banner, navigation, main, complementary, contentinfo), між якими screen reader стрибає однією клавішею. Заголовки формують «зміст» сторінки, тому їхній рівень — це структура, а не розмір шрифту.

**Врахуйте:** рівні заголовків без пропусків (після h1 — h2, не h3); логотип — не \`<h1>\`.
`,
      html: `<!-- 1. Шапка: який тег для .header, а який — для меню з посиланнями? TODO -->
<div class="header">
  <div class="logo">FrontPrep</div>
  <div class="menu">
    <a href="#">Головна</a>
    <a href="#">Курси</a>
    <a href="#">Блог</a>
  </div>
</div>
<!-- 2. .content → один основний контейнер; .title → заголовок 1 рівня;
        кожен .post → самодостатній блок із заголовком 2 рівня. TODO -->
<div class="content">
  <div class="title">Як підготуватися до співбесіди</div>
  <div class="post">
    <div class="post-title">Вивчіть основи HTML</div>
    <p>Семантика — фундамент доступності та SEO.</p>
  </div>
  <div class="post">
    <div class="post-title">Розберіться з CSS</div>
    <p>Каскад, специфічність і box model питають завжди.</p>
  </div>
</div>
<!-- 3. Сайдбар (заголовок теж 2 рівня) і підвал. TODO -->
<div class="sidebar">
  <div class="sidebar-title">Популярне</div>
  <p>Event Loop за 5 хвилин</p>
</div>
<div class="footer">© 2026 FrontPrep</div>
<!-- Перевірте в консолі: [...document.querySelectorAll('h1,h2,h3')].map(h => h.tagName) -->`,
      css: `body { font-family: system-ui, sans-serif; }
nav a { margin-right: 12px; }`,
      js: '',
      editable: ['html'],
      solution: {
        html: `<header>
  <a href="#" class="logo">FrontPrep</a>
  <nav aria-label="Головне меню">
    <a href="#">Головна</a>
    <a href="#">Курси</a>
    <a href="#">Блог</a>
  </nav>
</header>
<main>
  <h1>Як підготуватися до співбесіди</h1>
  <article>
    <h2>Вивчіть основи HTML</h2>
    <p>Семантика — фундамент доступності та SEO.</p>
  </article>
  <article>
    <h2>Розберіться з CSS</h2>
    <p>Каскад, специфічність і box model питають завжди.</p>
  </article>
</main>
<aside>
  <h2>Популярне</h2>
  <p>Event Loop за 5 хвилин</p>
</aside>
<footer>© 2026 FrontPrep</footer>`
      },
      hints: [
        'Почніть з landmarks: `header`, `nav`, `main`, `aside`, `footer`. Класи на кшталт `.header` нічого не означають для браузера.',
        'Логотип — не заголовок сторінки: залиште його посиланням або текстом, а `<h1>` віддайте назві сторінки в `main`.',
        'Пости — самодостатній вміст, тому `<article>`, а їхні заголовки — `<h2>` (на рівень нижче за h1).'
      ],
      tests: [
        { name: 'є header, а в ньому nav з трьома посиланнями', code: "const nav = $('header nav');\nexpect(nav).toBeTruthy();\nexpect(nav.querySelectorAll('a').length).toBe(3);" },
        { name: 'рівно один main', code: "expect($$('main')).toHaveLength(1);" },
        { name: 'рівно один h1, і він усередині main', code: "expect($$('h1')).toHaveLength(1);\nexpect($('h1').closest('main')).toBeTruthy();\nexpect($('h1').textContent).toMatch('Як підготуватися');" },
        { name: 'кожен пост — article з h2', code: "const arts = $$('main article');\nexpect(arts).toHaveLength(2);\narts.forEach(a => expect(a.querySelector('h2')).toBeTruthy());" },
        { name: 'бічна панель — aside з h2', code: "expect($('aside h2')).toBeTruthy();\nexpect($('aside h2').textContent).toMatch('Популярне');" },
        { name: 'footer на рівні сторінки', code: "const f = $$('footer').find(el => !el.closest('main, article, aside'));\nexpect(f).toBeTruthy();" },
        { name: 'заголовки без пропусків рівнів', code: "const levels = $$('h1, h2, h3, h4, h5, h6').map(h => Number(h.tagName[1]));\nexpect(levels[0]).toBe(1);\nfor (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);" }
      ],
      explanation: `
Landmarks дають screen reader «карту» сторінки, заголовки — «зміст» (у NVDA клавіша \`H\`).

**Типові помилки:** логотип у \`<h1>\` на кожній сторінці; рівень заголовка за розміром шрифту («h4, бо менший»); \`<section>\` без заголовка замість \`div\`; кілька видимих \`<main>\`.

**Що можуть спитати далі:** чи може \`<header>\` бути всередині \`<article>\`? (Так — шапка статті, але тоді це не landmark banner.) Навіщо \`aria-label\` на \`nav\`, якщо навігацій кілька?
`
    },
    {
      id: 'html-article-card',
      group: 'semantics',
      type: 'dom',
      level: 2,
      title: 'Картка статті: time, figure, address, mark',
      tags: ['semantics'],
      description: `
**Завдання.** Зробіть картку статті в стрічці блогу семантичною: кожен «div з класом» замініть на тег, що описує зміст.

**Де трапляється:** картки новин/постів у будь-якому блозі чи медіа; результати пошуку з підсвіченим запитом.

**Дано (HTML):** \`.card\` → \`.card-title\`, \`.meta\` з датою у \`<span>\`, \`.image\` (\`<img>\` + \`.caption\`), абзац з \`<b>:has()</b>\`, \`.author\` з mailto-посиланням.

**Що написати**
- уся картка → \`<article>\`, назва → \`<h2>\`;
- дата → \`<time datetime="2026-03-15">\` (людський текст лишається);
- зображення з підписом → \`<figure>\` з \`<img>\` і \`<figcaption>\`; у \`img\` — змістовний непорожній \`alt\`;
- контакти автора → \`<address>\`;
- користувач прийшов з пошуку за «:has()» → виділіть це \`<mark>\` замість \`<b>\`.

**Приклад**
\`\`\`html
<p>Опубліковано: <time datetime="2026-03-15">15 березня 2026</time></p>
\`\`\`

**Як це працює:** \`datetime\` дає машинозчитувану дату (пошуковики, календарі), \`figcaption\` автоматично стає підписом зображення в дереві доступності, \`<mark>\` означає «релевантне в поточному контексті».

**Врахуйте:** \`alt\` на кшталт «image» чи «cover.png» — гірше, ніж нічого; \`<address>\` — лише для контактів автора/сторінки, не для будь-якої адреси в тексті.
`,
      html: `<!-- 1. .card → самодостатній блок, .card-title → заголовок. TODO -->
<div class="card">
  <div class="card-title">Що нового в CSS 2026</div>
  <!-- 2. Дата: машинозчитуваний формат YYYY-MM-DD в атрибуті. TODO -->
  <div class="meta">Опубліковано: <span>15 березня 2026</span></div>
  <!-- 3. Ілюстрація з підписом + змістовний alt. TODO -->
  <div class="image">
    <img src="cover.png">
    <div class="caption">Рис. 1. Підтримка :has() у браузерах</div>
  </div>
  <!-- 4. Підсвітка пошукового запиту замість <b>. TODO -->
  <p>Селектор <b>:has()</b> нарешті підтримується всюди.</p>
  <!-- 5. Контакти автора. TODO -->
  <div class="author">Автор: <a href="mailto:olena@example.com">Олена</a></div>
</div>
<!-- Перевірте в консолі: document.querySelector('time')?.dateTime -->`,
      css: `body { font-family: system-ui, sans-serif; }
img { display: block; width: 200px; height: 100px; background: #ddd; }`,
      js: '',
      editable: ['html'],
      solution: {
        html: `<article class="card">
  <h2>Що нового в CSS 2026</h2>
  <p class="meta">Опубліковано: <time datetime="2026-03-15">15 березня 2026</time></p>
  <figure>
    <img src="cover.png" alt="Діаграма підтримки :has() у браузерах" width="200" height="100">
    <figcaption>Рис. 1. Підтримка :has() у браузерах</figcaption>
  </figure>
  <p>Селектор <mark>:has()</mark> нарешті підтримується всюди.</p>
  <address>Автор: <a href="mailto:olena@example.com">Олена</a></address>
</article>`
      },
      hints: [
        'Кожен «div з класом» має семантичного двійника: card → article, card-title → h2, image → figure, caption → figcaption, author → address.',
        '`<time>` показує людський текст, а в `datetime` — ISO-формат (`YYYY-MM-DD`), який розуміють машини.',
        '`<mark>` — «релевантне для поточного контексту» (результат пошуку), на відміну від `<strong>` (важливість) і `<b>` (лише стилістичне виділення).'
      ],
      tests: [
        { name: 'картка — article з h2', code: "expect($('article')).toBeTruthy();\nexpect($('article h2').textContent).toMatch('CSS 2026');" },
        { name: 'дата — time з datetime="2026-03-15"', code: "const t = $('article time');\nexpect(t).toBeTruthy();\nexpect(t.getAttribute('datetime')).toBe('2026-03-15');" },
        { name: 'figure містить img і figcaption', code: "const f = $('article figure');\nexpect(f).toBeTruthy();\nexpect(f.querySelector('img')).toBeTruthy();\nexpect(f.querySelector('figcaption').textContent).toMatch('Рис. 1');" },
        { name: 'img має змістовний alt', code: "const img = $('figure img');\nexpect(img.hasAttribute('alt')).toBe(true);\nexpect(img.getAttribute('alt').trim().length).toBeGreaterThan(3);" },
        { name: 'контакти автора в address', code: "expect($('article address a[href^=\"mailto:\"]')).toBeTruthy();" },
        { name: ':has() виділено через mark, а не b', code: "expect($('mark')).toBeTruthy();\nexpect($('mark').textContent).toBe(':has()');\nexpect($('p b')).toBeNull();" }
      ],
      explanation: `
- \`<time datetime>\` — машинозчитувана дата при довільному людському тексті.
- \`<figure>\` — самодостатня ілюстрація (зображення, код, діаграма); \`<figcaption>\` — її підпис.
- \`<address>\` — контакти для найближчого \`article\` або сторінки.
- \`<mark>\` — релевантність, \`<strong>\` — важливість, \`<em>\` — наголос, \`<b>/<i>\` — стиль без змісту.

**Що можуть спитати далі:** чим \`<strong>\` відрізняється від \`<b>\` для screen reader? Коли \`<figure>\` використовують для коду?
`
    },

    // ───────────────────────── 3. Форми ─────────────────────────
    {
      id: 'html-forms-basics',
      group: 'forms',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Форми: label, name, типи полів, кнопки',
      tags: ['forms'],
      question: 'Розкажіть, як правильно зверстати форму: звʼязок label і поля, атрибути name/value, типи input, типи кнопок. Які типові помилки ви бачите в чужому коді?',
      choices: [
        '`<button>` у формі без `type` — це `submit`; у `FormData` йдуть лише поля з `name` і без `disabled`',
        '`placeholder` повноцінно замінює `<label>`: screen reader зачитає його так само, як підпис',
        'Поле з `readonly` не відправляється з формою — так само, як і поле з атрибутом `disabled`',
        'Для телефону чи номера картки найкраще `type="number"` — він дає цифрову клавіатуру',
        'Обробник краще вішати на `click` кнопки, а не на `submit` форми — так надійніше з Enter'
      ],
      correct: 0,
      why: [
        'Так: це дві найчастіші пастки — неявний submit і поля без name/з disabled, що не потрапляють у дані.',
        'Ні: placeholder зникає при введенні, має низький контраст і озвучується ненадійно — потрібен label.',
        'Ні: `readonly` відправляється (його лише не можна редагувати), не відправляється тільки `disabled`.',
        'Ні: `number` губить нулі на початку, дозволяє `e` і крутиться колесом; краще `type="tel"` або `inputmode="numeric"`.',
        'Ні: навпаки — Enter у полі генерує `submit` форми, а обробник на click кнопки цей сценарій пропускає.'
      ],
      hint: 'Що потрапляє у FormData? Що зробить кнопка без type? Чому placeholder — не label?',
      answer: `
**Label** — доступне імʼя поля; клік по ньому фокусує поле:

\`\`\`html
<label for="email">Email</label>
<input id="email" name="email" type="email" autocomplete="email" required>
<label><input type="checkbox" name="terms" required> Погоджуюсь з умовами</label>
\`\`\`

**name / value.** У дані форми потрапляють поля з \`name\`, не \`disabled\`; checkbox/radio — лише \`checked\` (без \`value\` → \`"on"\`). Radio групуються однаковим \`name\`.

**Типи input** дають валідацію і правильну мобільну клавіатуру: \`email\`, \`tel\`, \`url\`, \`date\`, \`search\`, \`password\`… Для «цифрових рядків» — \`inputmode="numeric"\` + \`pattern\`.

**Кнопки:** \`submit\` (за замовчуванням!), \`button\`, \`reset\`.

**Групи:** \`<fieldset>\` + \`<legend>\`; \`disabled\` на fieldset вимикає все всередині. **autocomplete** (\`name\`, \`email\`, \`new-password\`, \`one-time-code\`) — швидше заповнення.

**Типові помилки:** немає label/name; кнопки без type; \`<div>\` замість \`<button>\`; обробник на click кнопки замість submit форми.
`,
      keyPoints: [
        'label for/id або обгортання; placeholder ≠ label',
        'У FormData — лише поля з name, не disabled, checked для checkbox/radio',
        'button у формі за замовчуванням type="submit"',
        'Правильні type та autocomplete (мобільна клавіатура, автозаповнення)',
        'fieldset/legend для груп; слухати submit форми, а не click кнопки'
      ],
      followUps: ['Чим readonly відрізняється від disabled?', 'Що таке implicit submission (Enter у полі)?', 'Чому type="number" погано підходить для номера картки?']
    },
    {
      id: 'html-quiz-button-default-type',
      group: 'forms',
      type: 'quiz',
      level: 1,
      title: 'Що зробить <button> без type у формі?',
      tags: ['forms', 'buttons'],
      question: `
Що станеться при кліку на кнопку «Показати пароль»?

\`\`\`html
<form action="/login">
  <input type="password" name="password">
  <button onclick="togglePassword()">Показати пароль</button>
  <button type="submit">Увійти</button>
</form>
\`\`\`
`,
      options: [
        'Лише викличеться `togglePassword()`',
        'Нічого: кнопка без `type` неактивна',
        'Викличеться `togglePassword()`, а потім форма **відправиться**',
        'Форма відправиться, а `togglePassword()` не викличеться'
      ],
      answer: 2,
      why: [
        'Ні: кнопка без type у формі — submit, тож після обробника спрацює ще й відправка.',
        'Ні: кнопка без type цілком активна — вона має тип submit за замовчуванням.',
        'Так: спочатку виконуються обробники click, потім дія за замовчуванням — відправка форми.',
        'Ні: обробник click завжди виконується до дії за замовчуванням.'
      ],
      hint: 'Яке значення має атрибут `type` у `<button>` за замовчуванням?',
      explanation: `
\`<button>\` без \`type\` = \`type="submit"\`. Після обробників \`click\` (якщо ніхто не викликав \`preventDefault()\`) настає дія за замовчуванням — відправка і перезавантаження сторінки. Виправлення: \`type="button"\`.

Бонус-пастка: Enter у текстовому полі «клікає» **першу** submit-кнопку форми (implicit submission). Якщо «Показати пароль» стоїть першою без \`type\`, Enter перемикатиме пароль.
`
    },
    {
      id: 'html-quiz-formdata',
      group: 'forms',
      type: 'quiz',
      level: 2,
      title: 'Що потрапить у FormData?',
      tags: ['forms'],
      question: `
Оберіть **усі** поля, які потраплять у \`new FormData(form)\`:

\`\`\`html
<form>
  <input name="login" value="olena">                 <!-- 1 -->
  <input name="id" value="42" disabled>              <!-- 2 -->
  <input name="role" value="admin" readonly>         <!-- 3 -->
  <input value="no-name">                            <!-- 4 -->
  <input type="checkbox" name="news">                <!-- 5: не відмічено -->
  <input type="checkbox" name="terms" checked>       <!-- 6 -->
</form>
\`\`\`
`,
      options: ['1 — login', '2 — id (disabled)', '3 — role (readonly)', '4 — поле без name', '5 — news (не відмічено)', '6 — terms (відмічено)'],
      answer: [0, 2, 5],
      why: [
        'Так: є name, поле активне.',
        'Ні: `disabled`-поля виключаються з даних форми (і не валідуються).',
        'Так: `readonly` не можна редагувати, але значення відправляється.',
        'Ні: без `name` немає ключа — поле ігнорується.',
        'Ні: невідмічений checkbox не відправляється взагалі — на сервері ключа просто немає.',
        'Так: відмічений checkbox без value дає `terms=on`.'
      ],
      hint: 'Три умови: є `name`, поле не вимкнене, а для checkbox/radio — воно `checked`.',
      explanation: `
Поле входить у дані форми, якщо має **\`name\`**, **не \`disabled\`**, а checkbox/radio — **\`checked\`**.

Практичний наслідок: щоб показати незмінне значення **і** відправити його — \`readonly\` або \`<input type="hidden">\`, а не \`disabled\`. «Не відмічено» на сервері = відсутній ключ, тож обробляйте його як \`false\`.
`
    },
    {
      id: 'html-fix-button-type',
      group: 'forms',
      type: 'dom',
      level: 2,
      title: 'Баг: кнопка відправляє форму',
      tags: ['forms', 'buttons'],
      description: `
**Завдання.** На сторінці входу клік на «Показати пароль» перезавантажує сторінку, а «Скинути» нічого не скидає. Виправте **лише HTML** (JS змінювати не можна).

**Де трапляється:** один з найчастіших багів у формах — допоміжна кнопка без \`type\` відправляє форму.

**Дано (HTML):** \`form#login\` з полями \`#email\` і \`#pass\` (з початковими \`value\`) та трьома кнопками без \`type\`: \`#toggle\`, \`#reset\`, \`#send\`. JS уже вішає на \`#toggle\` обробник \`click\`, що перемикає \`#pass\` між \`password\` і \`text\`.

**Що написати**
- \`#toggle\` — перемикає пароль і **не** відправляє форму;
- \`#reset\` — повертає полям початкові значення (з атрибутів \`value\`);
- \`#send\` — відправляє форму, тип вказано **явно**.

**Приклад**
\`\`\`text
клік #toggle → пароль видно, подія submit НЕ сталася
змінили email, клік #reset → email знову user@example.com
клік #send → подія submit
\`\`\`

**Як це працює:** \`<button>\` у формі без \`type\` — це \`submit\`: після обробника \`click\` браузер виконує дію за замовчуванням (відправку). Тип кнопки визначає, яку дію за замовчуванням вона має: \`submit\`, \`reset\` або жодної (\`button\`).

**Врахуйте:** Enter у полі «клікає» першу submit-кнопку форми — вона має бути саме «Увійти».
`,
      html: `<form id="login" action="/login">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" value="user@example.com">
  <label for="pass">Пароль</label>
  <input id="pass" name="password" type="password" value="secret123">
  <!-- 1. Яку дію за замовчуванням має <button> без type у формі? -->
  <!-- 2. TODO: вкажіть кожній кнопці явний type, що відповідає її ролі. -->
  <button id="toggle">Показати пароль</button>
  <button id="reset">Скинути</button>
  <button id="send">Увійти</button>
</form>
<!-- Перевірте в консолі: [...document.querySelectorAll('button')].map(b => b.type) -->`,
      css: `form { display: grid; gap: 6px; max-width: 260px; font-family: system-ui, sans-serif; }`,
      js: `document.querySelector('#toggle').addEventListener('click', () => {
  const pass = document.querySelector('#pass');
  pass.type = pass.type === 'password' ? 'text' : 'password';
});
`,
      editable: ['html'],
      solution: {
        html: `<form id="login" action="/login">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" value="user@example.com">
  <label for="pass">Пароль</label>
  <input id="pass" name="password" type="password" value="secret123">
  <button type="button" id="toggle">Показати пароль</button>
  <button type="reset" id="reset">Скинути</button>
  <button type="submit" id="send">Увійти</button>
</form>`
      },
      hints: [
        'Яке значення `type` має `<button>` усередині форми, якщо атрибут не вказано?',
        'Є три типи кнопок: `submit`, `reset`, `button`. Підберіть для кожної кнопки свій.'
      ],
      tests: [
        { name: '«Показати пароль» не відправляє форму, але перемикає пароль', code: "const form = $('#login');\nlet submits = 0;\nconst onSubmit = (e) => { submits++; e.preventDefault(); };\nform.addEventListener('submit', onSubmit);\nclick('#toggle');\nform.removeEventListener('submit', onSubmit);\nexpect(submits).toBe(0);\nexpect($('#pass').type).toBe('text');\nclick('#toggle');" },
        { name: '«Скинути» повертає початкові значення', code: "input('#email', 'hacker@evil.com');\nclick('#reset');\nexpect($('#email').value).toBe('user@example.com');" },
        { name: '«Увійти» має явний type="submit" і відправляє форму', code: "expect($('#send').getAttribute('type')).toBe('submit');\nconst form = $('#login');\nlet submits = 0;\nconst onSubmit = (e) => { submits++; e.preventDefault(); };\nform.addEventListener('submit', onSubmit);\nclick('#send');\nform.removeEventListener('submit', onSubmit);\nexpect(submits).toBe(1);" },
        { name: 'implicit submission (Enter) використає саме «Увійти»', code: "const firstSubmit = $('#login').querySelector('button[type=\"submit\"], button:not([type])');\nexpect(firstSubmit.id).toBe('send');" }
      ],
      explanation: `
\`type="button"\` прибирає дію за замовчуванням, \`type="reset"\` скидає поля до значень з атрибутів \`value\`/\`checked\`, \`type="submit"\` відправляє.

**Альтернатива** — \`e.preventDefault()\` в обробнику кліку — лікує симптом: розмітка лишається оманливою, а Enter у полі все одно «клікне» не ту кнопку.

**Що можуть спитати далі:** чи потрібна кнопка reset взагалі? (UX — радше ні.) Чим \`form.requestSubmit()\` відрізняється від \`form.submit()\`? (Перший запускає валідацію і подію \`submit\`.)
`
    },
    {
      id: 'html-accessible-form',
      group: 'forms',
      type: 'dom',
      level: 2,
      title: 'Доступна форма реєстрації',
      tags: ['forms', 'a11y'],
      description: `
**Завдання.** Перепишіть форму реєстрації так, щоб нею було зручно користуватися з клавіатури, screen reader і на мобільному. Наявні \`id\` полів залиште.

**Де трапляється:** будь-яка форма реєстрації/оформлення замовлення; на співбесіді часто дають «погану форму» і просять знайти проблеми.

**Дано (HTML):** \`form#signup\`; підписи — це \`<div>\`, а не label; поля \`#name\`, \`#email\` (text), \`#password\` (text), \`#phone\`; дві radio без \`name\`; checkbox \`#terms\`; «кнопка» — \`div.btn\`.

**Що написати**
1. Кожне поле (включно з radio і checkbox) має повʼязаний \`<label>\`.
2. Типи: \`#email\` → email, \`#password\` → password, \`#phone\` → tel.
3. \`name\`: \`name\`, \`email\`, \`password\`, \`phone\`, \`contact\` (обидві radio), \`terms\`.
4. Обовʼязкові: імʼя, email, пароль, згода з умовами. Пароль — мінімум 8 символів.
5. \`autocomplete\`: імʼя → \`name\`, email → \`email\`, пароль → \`new-password\`, телефон → \`tel\`.
6. Radio «Спосіб звʼязку» — у \`<fieldset>\` з \`<legend>\`.
7. «Зареєструватися» — справжня кнопка відправки.

**Приклад**
\`\`\`html
<label for="email">Email</label>
<input id="email" name="email" type="email" autocomplete="email" required>
\`\`\`

**Як це працює:** label дає полю доступне імʼя («Email, редагований текст, обовʼязкове») і більшу зону кліку; \`type\` вмикає валідацію і потрібну мобільну клавіатуру; \`name\` визначає ключ у даних форми; \`fieldset/legend\` змушує screen reader оголошувати назву групи перед кожною radio.

**Врахуйте:** \`placeholder\` — не підпис; телефон необовʼязковий; radio однієї групи — однаковий \`name\`.
`,
      html: `<!-- 1. Підписи: <div> → <label> (for="id" або обгортання поля). TODO
     2. Поля: type, name, required, minlength, autocomplete. TODO
     3. Radio: спільний name + група з підписом. TODO
     4. «Кнопка»: справжня кнопка відправки. TODO -->
<form id="signup">
  <div>Імʼя</div>
  <input id="name">
  <div>Email</div>
  <input id="email" type="text" placeholder="Email">
  <div>Пароль</div>
  <input id="password" type="text">
  <div>Телефон</div>
  <input id="phone">
  <div>Спосіб звʼязку</div>
  <input type="radio" value="email"> Email
  <input type="radio" value="phone"> Телефон
  <div><input type="checkbox" id="terms"> Погоджуюсь з умовами</div>
  <div class="btn">Зареєструватися</div>
</form>
<!-- Перевірте в консолі: [...document.querySelectorAll('input')].map(i => i.labels.length) -->`,
      css: `form { display: grid; gap: 6px; max-width: 320px; font-family: system-ui, sans-serif; }
.btn, button { padding: 8px; background: #2563eb; color: #fff; border: 0; }`,
      js: '',
      editable: ['html'],
      solution: {
        html: `<form id="signup">
  <label for="name">Імʼя</label>
  <input id="name" name="name" autocomplete="name" required>

  <label for="email">Email</label>
  <input id="email" name="email" type="email" autocomplete="email" required>

  <label for="password">Пароль (мінімум 8 символів)</label>
  <input id="password" name="password" type="password" autocomplete="new-password" minlength="8" required>

  <label for="phone">Телефон</label>
  <input id="phone" name="phone" type="tel" autocomplete="tel">

  <fieldset>
    <legend>Спосіб звʼязку</legend>
    <label><input type="radio" name="contact" value="email"> Email</label>
    <label><input type="radio" name="contact" value="phone"> Телефон</label>
  </fieldset>

  <label><input type="checkbox" id="terms" name="terms" required> Погоджуюсь з умовами</label>

  <button type="submit">Зареєструватися</button>
</form>`
      },
      hints: [
        'Звʼязати label з полем можна двома способами: `<label for="id">` або обгорнути поле в `<label>`. Перевірка — властивість `input.labels`.',
        'Radio в одній групі мають мати **однаковий** `name`, а групу підписує `<legend>` усередині `<fieldset>`.',
        'Для пароля при реєстрації — `autocomplete="new-password"` (менеджер паролів запропонує згенерувати), для входу — `current-password`.'
      ],
      tests: [
        { name: 'кожне поле має повʼязаний label', code: "const inputs = $$('#signup input');\nexpect(inputs.length).toBe(7);\ninputs.forEach(i => expect(i.labels.length).toBeGreaterThan(0));" },
        { name: 'правильні типи полів', code: "expect($('#email').type).toBe('email');\nexpect($('#password').type).toBe('password');\nexpect($('#phone').type).toBe('tel');" },
        { name: 'усі поля мають правильні name', code: "['name', 'email', 'password', 'phone'].forEach(n => expect($('#' + n).name).toBe(n));\nexpect($$('input[type=\"radio\"][name=\"contact\"]')).toHaveLength(2);\nexpect($('#terms').name).toBe('terms');" },
        { name: 'required і minlength', code: "['#name', '#email', '#password', '#terms'].forEach(s => expect($(s).required).toBe(true));\nexpect($('#phone').required).toBe(false);\nexpect($('#password').minLength).toBe(8);" },
        { name: 'autocomplete для автозаповнення', code: "expect($('#name').getAttribute('autocomplete')).toBe('name');\nexpect($('#email').getAttribute('autocomplete')).toBe('email');\nexpect($('#password').getAttribute('autocomplete')).toBe('new-password');\nexpect($('#phone').getAttribute('autocomplete')).toBe('tel');" },
        { name: 'radio у fieldset з legend', code: "const fs = $('#signup fieldset');\nexpect(fs).toBeTruthy();\nexpect(fs.querySelector('legend').textContent).toMatch('звʼязку');\nexpect(fs.querySelectorAll('input[type=\"radio\"]').length).toBe(2);" },
        { name: 'є справжня кнопка відправки', code: "const b = $('#signup button');\nexpect(b).toBeTruthy();\nexpect(b.type).toBe('submit');\nexpect(b.textContent).toMatch('Зареєструватися');" },
        { name: 'порожня форма невалідна, заповнена — валідна', code: "const form = $('#signup');\nexpect(form.checkValidity()).toBe(false);\n$('#name').value = 'Олена';\n$('#email').value = 'olena@example.com';\n$('#password').value = 'short';\nexpect(form.checkValidity()).toBe(false);\n$('#password').value = 'long-enough-1';\n$('#terms').checked = true;\nexpect(form.checkValidity()).toBe(true);" }
      ],
      explanation: `
Кожна зміна має причину: label — доступне імʼя і зона кліку; type — валідація і клавіатура; name — ключ у \`FormData\`; required/minlength — нативна валідація; autocomplete — автозаповнення (WCAG 1.3.5); fieldset/legend — назва групи; button — фокус, Enter, подія \`submit\`.

**Нюанс (L3):** \`minlength\` (\`tooShort\`) перевіряється лише для значень, **змінених користувачем** — програмне \`input.value = 'short'\` не дасть \`tooShort\`. Серверна валідація обовʼязкова завжди.

**Що можуть спитати далі:** як показати власне повідомлення про помилку доступно? (\`aria-invalid\` + \`aria-describedby\` — тема a11y.)
`
    },

    // ───────────────────────── 4. Валідація ─────────────────────────
    {
      id: 'html-quiz-empty-optional',
      group: 'validation',
      type: 'quiz',
      level: 2,
      title: 'Порожнє поле з pattern — валідне?',
      tags: ['forms', 'validation'],
      question: `
Поле індексу **без** \`required\`. Яке значення матимуть два вирази?

\`\`\`html
<input id="zip" name="zip" pattern="[0-9]{5}">
\`\`\`
\`\`\`js
zip.value = '';
zip.validity.valid;            // (1)
zip.value = '123456';
zip.validity.patternMismatch;  // (2)
\`\`\`
`,
      options: ['(1) `false`, (2) `false`', '(1) `true`, (2) `true`', '(1) `false`, (2) `true`', '(1) `true`, (2) `false`'],
      answer: 1,
      why: [
        'Ні: без `required` порожнє поле валідне, а 6 цифр не проходять шаблон рівно з 5.',
        'Так: порожнє необовʼязкове поле завжди валідне, а `pattern` перевіряє весь рядок — 6 цифр не підходять.',
        'Ні: `pattern` до порожнього значення не застосовується — порожнечу забороняє лише `required`.',
        'Ні: `pattern` неявно «заякорений» (`^(?:…)$`), тож `123456` не збігається з рівно 5 цифрами.'
      ],
      hint: 'Хто відповідає за заборону порожнього значення? І чи шукає `pattern` збіг у будь-якому місці рядка?',
      explanation: `
- Обмеження \`pattern\`, \`type\`, \`min/max\`, \`minlength\` **не застосовуються до порожнього значення** — порожнечу ловить лише \`required\` (\`valueMissing\`).
- \`pattern\` браузер обгортає в \`^(?:…)$\`, тож \`[0-9]{5}\` — **рівно** 5 цифр.

Висновок: для обовʼязкового поля з форматом потрібні обидва атрибути — \`required\` і \`pattern\`.
`
    },
    {
      id: 'html-input-constraints',
      group: 'validation',
      type: 'dom',
      level: 2,
      title: 'Обмеження полів: min/max/step, pattern, date, url',
      tags: ['forms', 'validation'],
      description: `
**Завдання.** Додайте полям форми замовлення нативні обмеження через атрибути, щоб браузер сам не пускав некоректні дані.

**Де трапляється:** форма замовлення/доставки в інтернет-магазині; на співбесіді — «чим замінити 50 рядків JS-валідації».

**Дано (HTML):** \`form#order\` з полями без атрибутів: \`#qty\`, \`#discount\`, \`#zip\`, \`#date\`, \`#site\` і кнопкою submit. Тести перевіряють \`el.validity\`.

**Що написати**

| Поле | Вимоги |
|---|---|
| \`#qty\` кількість | число, **обовʼязкове**, від 1 до 10, лише цілі |
| \`#discount\` знижка | число від 0 до 50 з кроком 5 |
| \`#zip\` індекс | рівно 5 цифр (може починатися з 0!), цифрова клавіатура на мобільному |
| \`#date\` доставка | дата, не раніше 2026-12-01 |
| \`#site\` сайт | необовʼязковий URL |

**Приклад**
\`\`\`js
qty.value = '11';   qty.validity.rangeOverflow;      // true
zip.value = '01234'; zip.validity.valid;             // true, і value лишився '01234'
site.value = '';    site.validity.valid;             // true — поле необовʼязкове
\`\`\`

**Як це працює:** кожен атрибут вмикає свій прапорець у \`ValidityState\` (\`rangeOverflow\`, \`stepMismatch\`, \`patternMismatch\`…), а \`validity.valid\` — це «жоден прапорець не піднятий». \`step\` відраховується від \`min\`.

**Врахуйте:** індекс — це рядок цифр, а не число: \`type="number"\` загубить нуль на початку.
`,
      html: `<!-- 1. #qty: тип «число» + межі + крок + обовʼязковість. TODO
     2. #discount: межі і крок 5. TODO
     3. #zip: НЕ number — шаблон з 5 цифр + цифрова клавіатура. TODO
     4. #date: тип «дата» + мінімальна дата. TODO
     5. #site: тип URL. TODO -->
<form id="order">
  <label>Кількість (1–10) <input id="qty" name="qty"></label>
  <label>Знижка, % (0–50, крок 5) <input id="discount" name="discount"></label>
  <label>Поштовий індекс <input id="zip" name="zip"></label>
  <label>Дата доставки <input id="date" name="date"></label>
  <label>Сайт компанії <input id="site" name="site"></label>
  <button type="submit">Замовити</button>
</form>
<!-- Перевірте в консолі: qty.value = '0'; qty.validity -->`,
      css: `form { display: grid; gap: 8px; max-width: 320px; font-family: system-ui, sans-serif; }
input:invalid { outline: 2px solid #dc2626; }`,
      js: '',
      editable: ['html'],
      solution: {
        html: `<form id="order">
  <label>Кількість (1–10) <input id="qty" name="qty" type="number" min="1" max="10" step="1" required></label>
  <label>Знижка, % (0–50, крок 5) <input id="discount" name="discount" type="number" min="0" max="50" step="5"></label>
  <label>Поштовий індекс <input id="zip" name="zip" inputmode="numeric" pattern="[0-9]{5}" autocomplete="postal-code"></label>
  <label>Дата доставки <input id="date" name="date" type="date" min="2026-12-01"></label>
  <label>Сайт компанії <input id="site" name="site" type="url"></label>
  <button type="submit">Замовити</button>
</form>`
      },
      hints: [
        'Для чисел — `type="number"` з `min`, `max`, `step`. Крок за замовчуванням дорівнює 1, і відлік іде від `min`.',
        'Індекс — рядок цифр, а не число: `type="number"` загубить нуль на початку. Використайте `pattern` + `inputmode="numeric"`.',
        '`pattern` автоматично «заякорений» (`^(?:...)$`), тож `[0-9]{5}` означає рівно 5 цифр.'
      ],
      tests: [
        { name: '#qty: обовʼязкове ціле 1–10', code: "const q = $('#qty');\nexpect(q.type).toBe('number');\nq.value = '';\nexpect(q.validity.valueMissing).toBe(true);\nq.value = '0';\nexpect(q.validity.rangeUnderflow).toBe(true);\nq.value = '11';\nexpect(q.validity.rangeOverflow).toBe(true);\nq.value = '2.5';\nexpect(q.validity.stepMismatch).toBe(true);\nq.value = '10';\nexpect(q.validity.valid).toBe(true);" },
        { name: '#discount: 0–50 з кроком 5', code: "const d = $('#discount');\nexpect(d.type).toBe('number');\nd.value = '7';\nexpect(d.validity.stepMismatch).toBe(true);\nd.value = '55';\nexpect(d.validity.rangeOverflow).toBe(true);\nd.value = '15';\nexpect(d.validity.valid).toBe(true);\nd.value = '';\nexpect(d.validity.valid).toBe(true);" },
        { name: '#zip: рівно 5 цифр, нуль на початку дозволений', code: "const z = $('#zip');\nexpect(z.type).not.toBe('number');\nz.value = '1234';\nexpect(z.validity.patternMismatch).toBe(true);\nz.value = '12345a';\nexpect(z.validity.patternMismatch).toBe(true);\nz.value = '01234';\nexpect(z.validity.valid).toBe(true);\nexpect(z.value).toBe('01234');" },
        { name: '#zip: цифрова клавіатура (inputmode)', code: "expect($('#zip').inputMode).toBe('numeric');" },
        { name: '#date: дата не раніше 2026-12-01', code: "const dt = $('#date');\nexpect(dt.type).toBe('date');\ndt.value = '2026-11-30';\nexpect(dt.validity.rangeUnderflow).toBe(true);\ndt.value = '2026-12-01';\nexpect(dt.validity.valid).toBe(true);" },
        { name: '#site: необовʼязковий URL', code: "const s = $('#site');\nexpect(s.type).toBe('url');\ns.value = 'example';\nexpect(s.validity.typeMismatch).toBe(true);\ns.value = 'https://example.com';\nexpect(s.validity.valid).toBe(true);\ns.value = '';\nexpect(s.validity.valid).toBe(true);" },
        { name: 'форма з коректними даними валідна', code: "$('#qty').value = '3';\n$('#discount').value = '10';\n$('#zip').value = '04210';\n$('#date').value = '2026-12-24';\n$('#site').value = '';\nexpect($('#order').checkValidity()).toBe(true);" }
      ],
      explanation: `
**Нюанси, які люблять питати:**
- \`step\` рахується від \`min\`: при \`min="1" step="2"\` валідні 1, 3, 5…
- Порожнє необовʼязкове поле завжди валідне.
- \`type="number"\` для індексу/телефону/картки — погано: губить нулі, дозволяє \`e\` і \`-\`, крутиться колесом.
- \`type="date"\` завжди повертає \`value\` у форматі \`YYYY-MM-DD\`, незалежно від локалі відображення.

Клієнтська валідація — це UX, а не безпека: сервер перевіряє все повторно.
`
    },
    {
      id: 'html-constraint-validation',
      group: 'validation',
      type: 'theory',
      level: 3,
      title: 'Constraint Validation API',
      tags: ['forms', 'validation'],
      question: 'Як працює нативна валідація форм у браузері? Розкажіть про Constraint Validation API і як зробити власні повідомлення про помилки. Оберіть **усі** правильні твердження.',
      choices: [
        '`form.submit()` оминає валідацію і подію `submit`, а `requestSubmit()` поводиться як клік по кнопці',
        'Після `setCustomValidity(msg)` помилка скидається сама, щойно користувач змінить значення поля',
        '`novalidate` вимикає і бульбашки, і `validity` — тоді поля доводиться перевіряти повністю вручну',
        'Якщо поле невалідне, при спробі відправки на ньому спрацьовує подія `invalid`, а `submit` — ні',
        '`checkValidity()` повертає `true/false` без UI, а `reportValidity()` ще й показує повідомлення'
      ],
      correct: [0, 3, 4],
      why: [
        'Так: `submit()` — «сира» відправка без перевірок, `requestSubmit()` запускає валідацію і подію `submit`.',
        'Ні: кастомна помилка тримається, доки не викликати `setCustomValidity(\'\')`.',
        'Ні: `novalidate` вимикає лише автоматичну перевірку при відправці і бульбашки; `validity` і `checkValidity()` працюють.',
        'Так: браузер генерує `invalid` на кожному невалідному полі, фокусує перше і не допускає `submit`.',
        'Так: обидва методи перевіряють стан, але показує повідомлення лише `reportValidity()`.'
      ],
      hint: 'validity, checkValidity vs reportValidity, setCustomValidity, подія invalid, novalidate.',
      answer: `
**З коробки:** атрибути \`required\`, \`type\`, \`pattern\`, \`min/max/step\`, \`minlength/maxlength\`. При інтерактивній відправці (кнопка, Enter, \`requestSubmit()\`) невалідні поля отримують подію \`invalid\`, перше — фокус і бульбашку; \`submit\` не настає.

**API поля:**

\`\`\`js
input.validity          // ValidityState: valueMissing, typeMismatch, patternMismatch, ... valid
input.validationMessage // локалізований текст помилки
input.checkValidity()   // true/false + подія invalid, без UI
input.reportValidity()  // те саме + бульбашка
input.setCustomValidity('Паролі не збігаються');
input.setCustomValidity(''); // ОБОВʼЯЗКОВО скинути
\`\`\`

\`form.submit()\` оминає валідацію і \`submit\`; \`form.requestSubmit()\` — як клік по кнопці.

**Власний UI помилок:** \`<form novalidate>\` + у \`submit\` перевірити \`form.checkValidity()\`, вивести \`validationMessage\` у свої елементи (з \`aria-invalid\` і \`aria-describedby\`). У CSS є \`:invalid\` і \`:user-invalid\` (після взаємодії) — тема CSS.

**Пастки:** не скинута кастомна помилка; надія на клієнтську валідацію як на захист.
`,
      keyPoints: [
        'validity (ValidityState) з окремими прапорцями і validationMessage',
        'checkValidity vs reportValidity; submit() оминає валідацію, requestSubmit() — ні',
        'setCustomValidity(msg) і обовʼязкове скидання через ""',
        'novalidate — власний UI помилок, API продовжує працювати',
        'Подія invalid і блокування submit'
      ],
      followUps: ['Чи спливає подія invalid?', 'Як зробити валідацію «на льоту», але не дратувати користувача?', 'Як зробити помилки доступними для screen reader?']
    },
    {
      id: 'html-quiz-custom-validity',
      group: 'validation',
      type: 'quiz',
      level: 3,
      title: 'Чому форма не відправляється після виправлення?',
      tags: ['forms', 'validation'],
      question: `
Користувач ввів різні паролі, побачив помилку, виправив — тепер вони однакові. Але форма **все одно** не відправляється. Чому?

\`\`\`js
confirmInput.addEventListener('input', () => {
  if (confirmInput.value !== password.value) {
    confirmInput.setCustomValidity('Паролі не збігаються');
  }
});
\`\`\`
`,
      options: [
        'Подія `input` не генерується для полів `type="password"`',
        'Потрібно викликати `reportValidity()`, інакше стан не оновлюється',
        'Кастомна помилка лишається, доки її явно не скинути `setCustomValidity(\'\')`',
        '`customError` скидається лише після `blur`'
      ],
      answer: 2,
      why: [
        'Ні: `input` генерується для будь-яких текстових полів, включно з password.',
        'Ні: `reportValidity()` лише показує повідомлення, стан він не змінює.',
        'Так: у коді немає гілки «збігаються», тож `customError` ніхто не знімає.',
        'Ні: `blur` ніяк не впливає на `customError`.'
      ],
      hint: 'Що в цьому коді відбувається, коли паролі **збігаються**?',
      explanation: `
\`setCustomValidity(msg)\` з непорожнім рядком ставить \`validity.customError = true\` назавжди — до виклику \`setCustomValidity('')\`.

\`\`\`js
confirmInput.setCustomValidity(
  confirmInput.value === password.value ? '' : 'Паролі не збігаються'
);
\`\`\`

Ще одна часта помилка — перевіряти лише при зміні confirm: якщо змінити **перший** пароль, стан confirm не перерахується.
`
    },
    {
      id: 'html-password-confirm',
      group: 'validation',
      type: 'dom',
      level: 3,
      title: 'Підтвердження пароля через setCustomValidity',
      tags: ['forms', 'validation'],
      description: `
**Завдання.** Реалізуйте перевірку «паролі збігаються» у формі реєстрації через **Constraint Validation API**, щоб браузер сам не пускав форму з різними паролями. HTML змінювати не можна.

**Де трапляється:** форма реєстрації/зміни пароля — класичне завдання на співбесідах і в реальних проєктах.

**Дано (HTML):** \`form#signup\`, поля \`#pass\` (required, minlength 8) і \`#confirm\` (required, \`aria-describedby="confirm-error"\`), абзац \`#confirm-error\` з \`aria-live="polite"\`, кнопка submit. У JS уже є змінні \`form\`, \`pass\`, \`confirmInput\`, \`errorEl\`.

**Що написати**
- \`validateMatch()\` → нічого не повертає:
  - якщо \`#confirm\` **непорожній** і не дорівнює \`#pass\` → \`confirmInput.setCustomValidity('Паролі не збігаються')\` і той самий текст у \`errorEl\`;
  - інакше → скинути помилку (\`setCustomValidity('')\`) і очистити \`errorEl\`;
- викликати \`validateMatch\` на подію \`input\` **обох** полів.

**Приклад**
\`\`\`js
// ввели pass = 'supersecret', confirm = 'supersecreT'
confirmInput.validationMessage; // 'Паролі не збігаються'
form.requestSubmit();           // подія submit НЕ настане
// виправили confirm = 'supersecret'
confirmInput.validity.valid;    // true
\`\`\`

**Як це працює:** \`setCustomValidity\` вбудовує ваше правило в нативну валідацію: поле отримує \`validity.customError\`, і при відправці браузер блокує \`submit\` так само, як для \`required\` — без жодного \`preventDefault\` з вашого боку.

**Врахуйте:**
- зміна **першого** пароля теж має перерахувати стан;
- порожній confirm — справа \`required\` (\`valueMissing\`), кастомну помилку на нього не ставте;
- без \`setCustomValidity('')\` поле «залипне» невалідним.
`,
      html: `<form id="signup">
  <label for="pass">Пароль</label>
  <input id="pass" name="password" type="password" required minlength="8">
  <label for="confirm">Повторіть пароль</label>
  <input id="confirm" name="confirm" type="password" required aria-describedby="confirm-error">
  <p id="confirm-error" class="error" aria-live="polite"></p>
  <button type="submit">Зареєструватися</button>
</form>`,
      css: `form { display: grid; gap: 6px; max-width: 280px; font-family: system-ui, sans-serif; }
.error { color: #b91c1c; min-height: 1.2em; margin: 0; }`,
      js: `const form = document.querySelector('#signup');
const pass = document.querySelector('#pass');
const confirmInput = document.querySelector('#confirm');
const errorEl = document.querySelector('#confirm-error');

// 1. Перевірка збігу.
function validateMatch() {
  // TODO: mismatch = confirm непорожній І не дорівнює pass
  // TODO: setCustomValidity — текст помилки або '' (скидання!)
  // TODO: той самий текст — у errorEl.textContent
}

// 2. TODO: викликати validateMatch на подію input ОБОХ полів.

// Спробуйте в консолі: confirmInput.validity.customError, confirmInput.validationMessage
`,
      editable: ['js'],
      solution: {
        js: `const form = document.querySelector('#signup');
const pass = document.querySelector('#pass');
const confirmInput = document.querySelector('#confirm');
const errorEl = document.querySelector('#confirm-error');

function validateMatch() {
  // Порожнє поле — справа атрибута required (valueMissing), не наша.
  const mismatch = confirmInput.value !== '' && confirmInput.value !== pass.value;
  const message = mismatch ? 'Паролі не збігаються' : '';
  confirmInput.setCustomValidity(message); // '' скидає customError
  errorEl.textContent = message;
}

pass.addEventListener('input', validateMatch);
confirmInput.addEventListener('input', validateMatch);
`
      },
      hints: [
        'Одна функція `validateMatch()`, яку викликають обробники `input` на обох полях.',
        '`setCustomValidity(\'\')` скидає помилку — завжди викликайте його в гілці «все добре».',
        'Не дублюйте `required`: якщо confirm порожній, кастомну помилку ставити не треба — браузер сам дасть `valueMissing`.'
      ],
      tests: [
        { name: 'різні паролі → customError з потрібним текстом', code: "input('#pass', 'supersecret');\ninput('#confirm', 'supersecreT');\nexpect($('#confirm').validity.customError).toBe(true);\nexpect($('#confirm').validationMessage).toBe('Паролі не збігаються');" },
        { name: 'текст помилки показано в #confirm-error', code: "input('#pass', 'supersecret');\ninput('#confirm', 'other-value');\nexpect($('#confirm-error').textContent.trim()).toBe('Паролі не збігаються');" },
        { name: 'форма з різними паролями не відправляється', code: "input('#pass', 'supersecret');\ninput('#confirm', 'supersecreT');\nconst r = submit('#signup');\nexpect(r.fired).toBe(false);" },
        { name: 'після виправлення помилка зникає', code: "input('#pass', 'supersecret');\ninput('#confirm', 'supersecreT');\ninput('#confirm', 'supersecret');\nexpect($('#confirm').validity.customError).toBe(false);\nexpect($('#confirm').validity.valid).toBe(true);\nexpect($('#confirm-error').textContent.trim()).toBe('');" },
        { name: 'зміна першого пароля теж перевіряє збіг', code: "input('#pass', 'supersecret');\ninput('#confirm', 'supersecret');\ninput('#pass', 'another-secret');\nexpect($('#confirm').validity.customError).toBe(true);\ninput('#pass', 'supersecret');\nexpect($('#confirm').validity.customError).toBe(false);" },
        { name: 'порожній confirm — це valueMissing, а не customError', code: "input('#pass', 'supersecret');\ninput('#confirm', 'x');\ninput('#confirm', '');\nexpect($('#confirm').validity.customError).toBe(false);\nexpect($('#confirm').validity.valueMissing).toBe(true);" },
        { name: 'однакові паролі → форма відправляється', code: "input('#pass', 'supersecret');\ninput('#confirm', 'supersecret');\nconst r = submit('#signup');\nexpect(r.fired).toBe(true);" }
      ],
      explanation: `
Одна функція на обидва поля + обовʼязкове скидання \`''\` — і нативна валідація робить решту: \`:invalid\`, блокування \`submit\`, повідомлення в бульбашці.

**Типові помилки:** не скинути помилку; слухати лише confirm; ставити кастомну помилку на порожнє поле (дубль \`required\`).

**Доступність:** \`aria-describedby\` звʼязує текст помилки з полем, \`aria-live="polite"\` озвучує зміну. Можна синхронно ставити \`aria-invalid\`.

**Що можуть спитати далі:** чим \`checkValidity\` відрізняється від \`reportValidity\`? Коли краще \`novalidate\` + повністю власна валідація?
`
    },

    // ───────────────────────── 5. Зображення ─────────────────────────
    {
      id: 'html-images',
      group: 'media',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Зображення: alt, розміри, srcset/sizes, lazy',
      tags: ['images', 'performance'],
      question: 'Як правильно вставити зображення на сучасну сторінку? Розкажіть про alt, width/height, srcset/sizes, <picture>, lazy loading.',
      choices: [
        '`loading="lazy"` варто ставити на всі зображення, включно з hero, — це завжди покращує LCP',
        'Атрибути `width`/`height` жорстко фіксують розмір, тож адаптивна картинка з ними неможлива',
        '`width`/`height` резервують місце проти CLS, а `srcset` + `sizes` дають обрати файл під слот',
        'Декоративному зображенню `alt` краще не писати зовсім — тоді screen reader його пропустить',
        'У `<picture>` браузер бере останній підхожий `<source>`, а `<img>` всередині необов\'язковий'
      ],
      correct: 2,
      why: [
        'Ні: lazy на hero відкладає завантаження LCP-зображення і погіршує LCP — йому потрібен `fetchpriority="high"`.',
        'Ні: атрибути задають пропорцію; у CSS можна `width: 100%; height: auto`, і місце все одно резервується.',
        'Так: розміри прибирають стрибки макета, а `srcset`/`sizes` економлять трафік на мобільних.',
        'Ні: без `alt` screen reader прочитає імʼя файлу; декоративному потрібен саме порожній `alt=""`.',
        'Ні: береться **перший** підхожий `<source>`, а `<img>` обовʼязковий — саме він рендериться.'
      ],
      hint: 'Доступність, CLS, вибір розміру під екран і DPR, формати, LCP.',
      answer: `
**alt** — що зображення **означає** в контексті. Декоративне — \`alt=""\`.

**width / height** (без одиниць) — пропорція: браузер резервує місце до завантаження → немає **CLS**.

**srcset + sizes** — браузер обирає файл під ширину слоту × DPR:

\`\`\`html
<img src="photo-800.jpg"
     srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1600.jpg 1600w"
     sizes="(max-width: 600px) 100vw, 50vw"
     width="1600" height="900" alt="Команда на хакатоні">
\`\`\`

\`sizes\` потрібен, бо при виборі файлу браузер ще не знає CSS; без нього — \`100vw\`. Для фіксованого розміру — \`srcset="logo.png 1x, logo@2x.png 2x"\`.

**<picture>** — art direction (інший кадр) або формати: \`<source type="image/avif">\`, \`<source type="image/webp">\`, \`<img>\` — fallback. Береться **перший** підхожий source.

**loading="lazy"** — для зображень нижче згину; LCP-зображенню — \`fetchpriority="high"\`. **decoding="async"** — декодування не блокує рендер.

**Пастки:** CSS-фони без alt і невидимі для preload scanner; величезні PNG замість AVIF/WebP; немає розмірів → стрибки.
`,
      keyPoints: [
        'alt за змістом; alt="" для декоративних',
        'width/height проти CLS',
        'srcset (w-дескриптори) + sizes — браузер обирає файл під слот і DPR',
        '<picture>/<source> — art direction і формати AVIF/WebP',
        'loading="lazy" не для LCP-зображення; fetchpriority="high"'
      ],
      followUps: ['Чим w-дескриптори відрізняються від x-дескрипторів?', 'Як браузер вибирає source у <picture>?', 'Чим поганий lazy loading для hero-зображення?']
    },
    {
      id: 'html-quiz-srcset-sizes',
      group: 'media',
      type: 'quiz',
      level: 3,
      title: 'Який файл вибере браузер із srcset?',
      tags: ['images', 'performance'],
      question: `
Екран телефона: ширина viewport **400 CSS px**, \`devicePixelRatio = 2\`. Який файл найімовірніше завантажить браузер (кеш порожній)?

\`\`\`html
<img src="img-800.jpg"
     srcset="img-400.jpg 400w, img-800.jpg 800w, img-1600.jpg 1600w"
     sizes="(max-width: 600px) 100vw, 50vw"
     alt="...">
\`\`\`
`,
      options: ['`img-400.jpg` — бо viewport 400px', '`img-800.jpg`', '`img-1600.jpg` — найякісніший', '`img-400.jpg` — бо 50vw від 800'],
      answer: 1,
      why: [
        'Ні: браузер враховує DPR — 400px слоту × 2 = 800 фізичних пікселів, 400w буде розмитим.',
        'Так: слот 100vw = 400px, × DPR 2 = 800 → найменший файл, що покриває потребу, — 800w.',
        'Ні: браузер бере найменший достатній файл, а не найбільший — 1600w це зайві байти.',
        'Ні: `50vw` діє лише на екранах ширших за 600px; тут виконалась умова `(max-width: 600px)`.'
      ],
      hint: 'Спочатку визначте ширину слоту з `sizes`, потім помножте на DPR.',
      explanation: `
1. \`sizes\`: \`(max-width: 600px)\` виконується → слот = \`100vw\` = **400 CSS px**.
2. Потрібно фізичних пікселів: 400 × 2 = **800**.
3. Найменший підхожий кандидат — \`img-800.jpg 800w\`.

Специфікація дає браузеру свободу (на повільній мережі взяти менший, з кешу — більший), тому «найімовірніше».
`
    },
    {
      id: 'html-responsive-image',
      group: 'media',
      type: 'dom',
      level: 2,
      title: 'Адаптивні та ліниві зображення',
      tags: ['images', 'performance'],
      description: `
**Завдання.** Оптимізуйте зображення лендингу розпродажу: головне зображення — швидко і під розмір екрана, галерея — ліниво, декор — прихований від screen reader, банер — інший кадр на мобільному.

**Де трапляється:** оптимізація LCP/CLS на лендингах і в каталогах; часте питання «як ви оптимізуєте зображення».

**Дано (HTML):** \`.hero img\` (LCP-елемент), \`.gallery\` з двома \`img\` нижче згину, \`img.divider\`, \`.promo img\` (\`promo-wide.jpg\`). Жодних атрибутів, крім \`src\`. Файли умовні — тести перевіряють розмітку.

**Що написати**
1. **Hero:** \`srcset="hero-800.jpg 800w, hero-1600.jpg 1600w, hero-2400.jpg 2400w"\`, \`sizes="100vw"\`, \`width="1600" height="800"\`, змістовний \`alt\`, **не** lazy, \`fetchpriority="high"\`.
2. **Галерея:** \`loading="lazy"\`, \`decoding="async"\`, \`width\`/\`height\`, змістовний \`alt\`.
3. **Роздільник** \`.divider\` — суто декоративний.
4. **Промо:** \`<picture>\` — до 600px показувати \`promo-square.jpg\`, інакше \`promo-wide.jpg\`; з \`alt\`.

**Приклад** (art direction)
\`\`\`html
<picture>
  <source media="(max-width: 600px)" srcset="small.jpg">
  <img src="wide.jpg" alt="…">
</picture>
\`\`\`

**Як це працює:** з \`srcset\`/\`sizes\` браузер сам обирає файл під ширину слоту × DPR; \`width/height\` резервують місце (немає CLS); \`media\` в \`<source>\` — жорстка умова, а \`<img>\` наприкінці — елемент, що реально рендериться.

**Врахуйте:** декоративне — це \`alt=""\` (атрибут є, але порожній), а не відсутній \`alt\`; \`<img>\` у \`<picture>\` — останнім.
`,
      html: `<!-- 1. Hero (LCP): srcset + sizes, розміри, alt, високий пріоритет, НЕ lazy. TODO -->
<article class="hero">
  <img src="hero-1600.jpg">
  <h2>Весняний розпродаж</h2>
</article>
<!-- 2. Галерея нижче згину: ліниво + асинхронне декодування + розміри + alt. TODO -->
<section class="gallery">
  <h2>Галерея</h2>
  <img src="cat-800.jpg">
  <img src="dog-800.jpg">
</section>
<!-- 3. Декоративний роздільник. TODO -->
<img src="divider.png" class="divider">
<!-- 4. Промо: <picture> з <source media="..."> для вузьких екранів. TODO -->
<div class="promo">
  <img src="promo-wide.jpg">
</div>
<!-- Перевірте в консолі: document.querySelector('.hero img').currentSrc -->`,
      css: `img { max-width: 100%; height: auto; display: block; background: #e5e7eb; }`,
      js: '',
      editable: ['html'],
      solution: {
        html: `<article class="hero">
  <img src="hero-1600.jpg"
       srcset="hero-800.jpg 800w, hero-1600.jpg 1600w, hero-2400.jpg 2400w"
       sizes="100vw"
       width="1600" height="800"
       alt="Знижки до 50% на весняну колекцію"
       fetchpriority="high">
  <h2>Весняний розпродаж</h2>
</article>
<section class="gallery">
  <h2>Галерея</h2>
  <img src="cat-800.jpg" width="800" height="600" alt="Рудий кіт спить на підвіконні" loading="lazy" decoding="async">
  <img src="dog-800.jpg" width="800" height="600" alt="Собака ловить фрисбі в парку" loading="lazy" decoding="async">
</section>
<img src="divider.png" class="divider" alt="">
<div class="promo">
  <picture>
    <source media="(max-width: 600px)" srcset="promo-square.jpg">
    <img src="promo-wide.jpg" alt="Безкоштовна доставка від 1000 грн" width="1200" height="400">
  </picture>
</div>`
      },
      hints: [
        'Для hero: w-дескриптори в `srcset` + `sizes`. LCP-зображення не можна робити лінивим — навпаки, підвищіть пріоритет.',
        'Декоративне зображення — це `alt=""` (атрибут є, але порожній), а не відсутній `alt`.',
        'Art direction: `<picture>` → `<source media="(max-width: 600px)" srcset="...">` → обовʼязковий `<img>` наприкінці.'
      ],
      tests: [
        { name: 'hero: srcset з трьох w-кандидатів і sizes', code: "const img = $('.hero img');\nconst cands = img.getAttribute('srcset').split(',').map(s => s.trim());\nexpect(cands).toHaveLength(3);\ncands.forEach(c => expect(c).toMatch(/^hero-\\d+\\.jpg \\d+w$/));\nexpect(img.getAttribute('sizes')).toBe('100vw');" },
        { name: 'hero: розміри, alt, не lazy, fetchpriority=high', code: "const img = $('.hero img');\nexpect(img.getAttribute('width')).toBe('1600');\nexpect(img.getAttribute('height')).toBe('800');\nexpect((img.getAttribute('alt') || '').trim().length).toBeGreaterThan(3);\nexpect(img.loading).not.toBe('lazy');\nexpect(img.getAttribute('fetchpriority')).toBe('high');" },
        { name: 'галерея: lazy, async, розміри, alt', code: "const imgs = $$('.gallery img');\nexpect(imgs).toHaveLength(2);\nimgs.forEach(img => {\n  expect(img.getAttribute('loading')).toBe('lazy');\n  expect(img.getAttribute('decoding')).toBe('async');\n  expect(img.hasAttribute('width') && img.hasAttribute('height')).toBe(true);\n  expect((img.getAttribute('alt') || '').trim().length).toBeGreaterThan(3);\n});" },
        { name: 'декоративний роздільник має alt=""', code: "const d = $('.divider');\nexpect(d.hasAttribute('alt')).toBe(true);\nexpect(d.getAttribute('alt')).toBe('');" },
        { name: 'промо: picture з source для вузьких екранів', code: "const pic = $('.promo picture');\nexpect(pic).toBeTruthy();\nconst src = pic.querySelector('source');\nexpect(src.getAttribute('media').replace(/\\s/g, '')).toBe('(max-width:600px)');\nexpect(src.getAttribute('srcset')).toBe('promo-square.jpg');\nconst img = pic.querySelector('img');\nexpect(img.getAttribute('src')).toBe('promo-wide.jpg');\nexpect(pic.lastElementChild).toBe(img);\nexpect((img.getAttribute('alt') || '').length).toBeGreaterThan(3);" }
      ],
      explanation: `
- \`srcset + sizes\` — менше байтів на мобільних; \`width/height\` — немає CLS.
- LCP не лінуємо: \`lazy\` відкладає запит до layout. \`fetchpriority="high"\` піднімає пріоритет.
- \`lazy + decoding="async"\` нижче згину — менше конкуренції за мережу на старті.
- У \`<picture>\` \`media\` — жорстка умова (на відміну від \`srcset\`, де браузер має свободу); alt, розміри й події — на \`<img>\`.

**Що можуть спитати далі:** як додати AVIF/WebP з fallback? (\`<source type="image/avif">\`.) Чому для hero краще \`<img>\`, ніж CSS-фон? (Preload scanner знаходить \`<img>\` одразу, є alt.)
`
    },

    // ───────────────────────── 6. Посилання, data-*, iframe ─────────────────────────
    {
      id: 'html-quiz-target-blank',
      group: 'links',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Навіщо rel="noopener noreferrer"?',
      tags: ['links', 'security'],
      question: 'Навіщо до посилання з `target="_blank"` на зовнішній сайт додають `rel="noopener noreferrer"`?',
      options: [
        'Щоб пошуковики не переходили за посиланням',
        '`noopener` — нова вкладка не отримує `window.opener` і не може підмінити вашу сторінку (reverse tabnabbing); `noreferrer` — ще й не передає заголовок Referer',
        'Щоб посилання відкривалось швидше завдяки preconnect',
        'Без цього браузер заблокує відкриття нової вкладки'
      ],
      answer: 1,
      why: [
        'Ні: для пошуковиків — `rel="nofollow"` / `ugc` / `sponsored`.',
        'Так: без opener чужа сторінка не зможе виконати `window.opener.location = \'фішинг\'`.',
        'Ні: preconnect — окрема підказка `<link rel="preconnect">`, з rel посилання не повʼязана.',
        'Ні: браузер відкриває вкладку і без цих значень.'
      ],
      hint: 'Що може зробити відкрита сторінка з `window.opener.location`?',
      explanation: `
Без \`noopener\` відкрита сторінка отримує \`window.opener\` і може підмінити вашу вкладку фішинговою копією — **reverse tabnabbing**. \`noreferrer\` додатково не передає \`Referer\` (і теж вимикає opener).

Сучасні браузери неявно застосовують \`noopener\` для \`target="_blank"\`, але явний атрибут — гарна практика і вимога лінтерів (\`react/jsx-no-target-blank\`).
`
    },
    {
      id: 'html-quiz-dataset',
      group: 'links',
      type: 'quiz',
      level: 1,
      title: 'data-* атрибути і dataset',
      tags: ['attributes', 'dom'],
      question: `
Яке значення матимуть вирази?

\`\`\`html
<div id="card" data-user-id="42" data-is-admin></div>
\`\`\`
\`\`\`js
const el = document.querySelector('#card');
el.dataset.userId;   // ?
el.dataset.isAdmin;  // ?
\`\`\`
`,
      options: ['`42` (число) і `true`', '`undefined` і `undefined` — треба писати `dataset["user-id"]`', '`"42"` і `true`', '`"42"` і `""`'],
      answer: 3,
      why: [
        'Ні: атрибути завжди рядки, а атрибут без значення — порожній рядок, не `true`.',
        'Ні: kebab-case автоматично стає camelCase; саме `dataset["user-id"]` поверне `undefined`.',
        'Майже: `"42"` правильно, але атрибут без `=` має значення `""`, а не `true`.',
        'Так: `data-user-id` → `userId` зі значенням-рядком, атрибут без значення → `""`.'
      ],
      hint: 'Атрибути завжди рядки. А яке значення має атрибут, записаний без `=`?',
      explanation: `
- \`data-user-id\` → \`dataset.userId\` (і навпаки: \`el.dataset.userId = 7\` → \`data-user-id="7"\`).
- Значення **завжди рядок** — не забувайте \`Number(...)\`.
- \`""\` — falsy! Наявність перевіряйте через \`'isAdmin' in el.dataset\` або \`el.hasAttribute('data-is-admin')\`.
`
    },
    {
      id: 'html-iframe-sandbox',
      group: 'links',
      type: 'theory',
      level: 3,
      title: 'iframe: sandbox, безпека, продуктивність',
      tags: ['iframe', 'security'],
      question: 'Що потрібно знати про <iframe>? Як вбудувати сторонній контент безпечно і як захистити свій сайт від вбудовування? Оберіть **усі** правильні твердження.',
      choices: [
        'Порожній `sandbox` забороняє скрипти, форми й попапи і дає документу унікальний opaque origin',
        '`allow-scripts` + `allow-same-origin` для документа з вашого ж origin фактично знімають sandbox',
        'Найнадійніший захист від clickjacking — JS-перевірка `top !== self` з редиректом',
        'Батьківська сторінка може читати DOM будь-якого вбудованого iframe, навіть з іншого origin',
        'Від вбудовування вашого сайту захищає заголовок `Content-Security-Policy: frame-ancestors \'self\'`'
      ],
      correct: [0, 1, 4],
      why: [
        'Так: sandbox без токенів — максимум обмежень, токени `allow-*` їх послаблюють.',
        'Так: скрипт у такому фреймі дістається до `parent` і може зняти атрибут sandbox з власного iframe.',
        'Ні: JS frame-busting легко обійти (наприклад, sandbox без allow-top-navigation); надійні лише заголовки.',
        'Ні: Same-Origin Policy забороняє доступ до DOM чужого origin — лише `postMessage`.',
        'Так: `frame-ancestors` (або застарілий `X-Frame-Options`) забороняє вбудовувати вашу сторінку.'
      ],
      hint: 'Атрибут sandbox та його токени, Same-Origin Policy, postMessage, X-Frame-Options / frame-ancestors.',
      answer: `
**iframe** — вкладений браузерний контекст. Між різними origin DOM недоступний (Same-Origin Policy), спілкування — \`postMessage\` з обовʼязковою перевіркою \`event.origin\`.

\`\`\`html
<iframe src="https://widget.example" sandbox="allow-scripts allow-forms"
        allow="clipboard-write" loading="lazy" title="Віджет оплати"></iframe>
\`\`\`

- **sandbox** без токенів: без скриптів, форм, попапів, навігації top-вікна; opaque origin (немає cookies/localStorage свого домену).
- **Пастка:** \`allow-scripts\` + \`allow-same-origin\` для свого origin = sandbox не працює.
- **allow** (Permissions Policy) — камера, геолокація, fullscreen, clipboard.
- **Захист від clickjacking:** \`Content-Security-Policy: frame-ancestors 'self'\` або \`X-Frame-Options: DENY | SAMEORIGIN\`.
- **Продуктивність і a11y:** кожен iframe — окремий документ; \`loading="lazy"\` нижче згину; \`title\` — доступне імʼя; для YouTube — «фасад» (превʼю, iframe по кліку).

Цей тренажер запускає ваш код саме в \`sandbox="allow-scripts allow-forms"\`.
`,
      keyPoints: [
        'Same-Origin Policy і postMessage з перевіркою origin',
        'sandbox: усе заборонено, токени послаблюють; opaque origin',
        'allow-scripts + allow-same-origin для свого origin знищує sandbox',
        'Захист від clickjacking: CSP frame-ancestors / X-Frame-Options',
        'loading="lazy", title, фасади для важких вбудовувань'
      ],
      followUps: ['Як безпечно обробляти message від iframe?', 'Що таке clickjacking і як від нього захиститися?', 'Чим srcdoc відрізняється від src?']
    },

    // ───────────────────────── 7. Таблиці, details, dialog ─────────────────────────
    {
      id: 'html-data-table',
      group: 'native',
      type: 'dom',
      level: 2,
      title: 'Доступна таблиця даних',
      tags: ['tables', 'a11y'],
      description: `
**Завдання.** Перетворіть таблицю тарифів, зверстану «для вигляду», на справжню таблицю даних, яку screen reader читає з заголовками.

**Де трапляється:** сторінки тарифів, порівняння товарів, звіти в адмінках.

**Дано (HTML):** \`table.prices\` — усі рядки в \`<tr><td>\`; заголовки виділені \`<b>\`; останній рядок «Ціни без ПДВ» з двома порожніми клітинками; підпис «Тарифи на 2026 рік» — окремий \`<p>\` під таблицею.

**Що написати**
- підпис → \`<caption>\` першим дочірнім елементом (окремий \`<p>\` приберіть);
- рядок заголовків → \`<thead>\`, клітинки → \`<th scope="col">\`;
- рядки тарифів → \`<tbody>\`, назва тарифу → \`<th scope="row">\`;
- «Ціни без ПДВ» → \`<tfoot>\`, одна клітинка на всю ширину (\`colspan="3"\`);
- жодного \`<b>\` у таблиці.

**Приклад**
\`\`\`html
<tr><th scope="row">Team</th><td>$29</td><td>10</td></tr>
\`\`\`

**Як це працює:** \`th\` + \`scope\` повідомляють, до яких клітинок належить заголовок, тож при переході до «$29» screen reader прочитає «Team, Ціна/міс, $29». \`<caption>\` — доступне імʼя таблиці.

**Врахуйте:** парсер сам додає \`<tbody>\`, якщо його немає; \`<caption>\` — лише першим.
`,
      html: `<!-- 1. Підпис таблиці — першим елементом усередині <table>. TODO
     2. Заголовки стовпців: <thead> + <th scope="col">. TODO
     3. Тарифи: <tbody>, назва — заголовок рядка. TODO
     4. Примітка: <tfoot>, одна клітинка на 3 стовпці. TODO -->
<table class="prices">
  <tr><td><b>Тариф</b></td><td><b>Ціна/міс</b></td><td><b>Користувачі</b></td></tr>
  <tr><td>Starter</td><td>$9</td><td>1</td></tr>
  <tr><td>Team</td><td>$29</td><td>10</td></tr>
  <tr><td>Business</td><td>$99</td><td>50</td></tr>
  <tr><td>Ціни без ПДВ</td><td></td><td></td></tr>
</table>
<p>Тарифи на 2026 рік</p>
<!-- Перевірте в консолі: document.querySelector('table').caption -->`,
      css: `table { border-collapse: collapse; font-family: system-ui, sans-serif; }
th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
caption { font-weight: 600; margin-bottom: 6px; }`,
      js: '',
      editable: ['html'],
      solution: {
        html: `<table class="prices">
  <caption>Тарифи на 2026 рік</caption>
  <thead>
    <tr>
      <th scope="col">Тариф</th>
      <th scope="col">Ціна/міс</th>
      <th scope="col">Користувачі</th>
    </tr>
  </thead>
  <tbody>
    <tr><th scope="row">Starter</th><td>$9</td><td>1</td></tr>
    <tr><th scope="row">Team</th><td>$29</td><td>10</td></tr>
    <tr><th scope="row">Business</th><td>$99</td><td>50</td></tr>
  </tbody>
  <tfoot>
    <tr><td colspan="3">Ціни без ПДВ</td></tr>
  </tfoot>
</table>`
      },
      hints: [
        '`<caption>` має бути **першим** дочірнім елементом `<table>`.',
        '`scope="col"` — заголовок стовпця, `scope="row"` — заголовок рядка.',
        'Клітинка на всю ширину: `<td colspan="3">`.'
      ],
      tests: [
        { name: 'caption — перший елемент таблиці', code: "const t = $('table.prices');\nexpect(t.caption).toBeTruthy();\nexpect(t.firstElementChild).toBe(t.caption);\nexpect(t.caption.textContent.trim()).toBe('Тарифи на 2026 рік');\nexpect($$('p').filter(p => p.textContent.includes('Тарифи'))).toHaveLength(0);" },
        { name: 'thead з трьома th scope="col"', code: "const ths = $$('table.prices thead th');\nexpect(ths).toHaveLength(3);\nths.forEach(th => expect(th.getAttribute('scope')).toBe('col'));" },
        { name: 'tbody: у кожному рядку th scope="row" + дві td', code: "const rows = $$('table.prices tbody tr');\nexpect(rows).toHaveLength(3);\nrows.forEach(r => {\n  expect(r.cells[0].tagName).toBe('TH');\n  expect(r.cells[0].getAttribute('scope')).toBe('row');\n  expect(r.querySelectorAll('td').length).toBe(2);\n});" },
        { name: 'tfoot з клітинкою colspan=3', code: "const cell = $('table.prices tfoot td, table.prices tfoot th');\nexpect(cell).toBeTruthy();\nexpect(cell.colSpan).toBe(3);\nexpect(cell.textContent).toMatch('ПДВ');" },
        { name: 'немає <b> у таблиці', code: "expect($$('table.prices b')).toHaveLength(0);" }
      ],
      explanation: `
Screen reader використовує \`th\` + \`scope\`, щоб при переміщенні між клітинками оголошувати заголовки рядка і стовпця; \`<caption>\` читається при вході в таблицю.

\`thead/tbody/tfoot\` — семантичні групи: \`thead\` повторюється при друці на кожній сторінці. Через автододавання \`<tbody>\` селектор \`table > tr\` не спрацює.

**Складні таблиці** (багаторівневі заголовки) — атрибут \`headers="id1 id2"\` на клітинках. **Антипатерн:** таблиці для layout.
`
    },
    {
      id: 'html-dialog-details',
      group: 'native',
      type: 'theory',
      level: 3,
      title: '<dialog> та <details>: нативні інтерактивні елементи',
      tags: ['dialog', 'details', 'a11y'],
      question: 'Навіщо елемент <dialog>? Чим відрізняються show() і showModal()? Що дає <details>/<summary> і коли їх варто використовувати замість власних компонентів?',
      choices: [
        '`show()` і `showModal()` різняться лише `::backdrop`; фон в обох випадках лишається інтерактивним',
        'Атрибут `open` на `<dialog>` — повний еквівалент `showModal()`, просто без виклику JS',
        '`<details>` потребує JS для клавіатури та стану `aria-expanded`, інакше він недоступний',
        'Після `showModal()` focus trap і повернення фокусу після закриття доводиться писати вручну',
        '`showModal()` малює діалог у top layer, робить решту сторінки інертною і закривається по Escape'
      ],
      correct: 4,
      why: [
        'Ні: після `showModal()` фон стає інертним, а після `show()` — ні; різниця не лише в backdrop.',
        'Ні: атрибут `open` — аналог немодального `show()`, без top layer, інертності й Escape.',
        'Ні: `<details>/<summary>` доступні з коробки — фокус, Enter/Space, стан expanded.',
        'Ні: модальний dialog сам тримає фокус усередині (фон інертний) і повертає його після `close()`.',
        'Так: це і є головні переваги нативної модалки над самописною.'
      ],
      hint: 'Top layer, ::backdrop, Escape, інертний фон, method="dialog", returnValue; name на details.',
      answer: `
**<dialog>** — нативне діалогове вікно:

\`\`\`html
<dialog id="confirm" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Видалити файл?</h2>
  <form method="dialog">
    <button value="cancel">Скасувати</button>
    <button value="ok">Видалити</button>
  </form>
</dialog>
\`\`\`
\`\`\`js
dialog.showModal();
dialog.addEventListener('close', () => console.log(dialog.returnValue)); // 'ok' | 'cancel'
\`\`\`

**showModal():** top layer (без боротьби з \`z-index\`), \`::backdrop\`, інертний фон, Escape (подія \`cancel\`), фокус усередину і повернення після закриття.
**show()** — немодальний: фон доступний, Escape не закриває.

\`<form method="dialog">\` закриває діалог без відправки, \`returnValue\` = \`value\` кнопки.

**<details>/<summary>** — розкривний блок без JS: клавіатура, стан expanded, подія \`toggle\`; однаковий \`name\` — ексклюзивний акордеон; Ctrl+F розкриває details зі збігом.

**Власний компонент** мусить вручну відтворити все це (focus trap, Esc, \`aria-modal\`, повернення фокусу) — і часто це роблять погано.
`,
      keyPoints: [
        'showModal(): top layer, ::backdrop, інертний фон, Escape, повернення фокусу',
        'show() — немодальний; атрибут open ≠ showModal',
        'form method="dialog" і returnValue',
        'details/summary — доступний акордеон без JS, name → ексклюзивність',
        'Самописні аналоги мусять вручну відтворити focus trap, Esc, aria'
      ],
      followUps: ['Що таке top layer?', 'Чим Popover API відрізняється від <dialog>?', 'Як закрити dialog кліком по backdrop?']
    },
    {
      id: 'html-details-faq',
      group: 'native',
      type: 'dom',
      level: 1,
      title: 'FAQ-акордеон на <details> без JS',
      tags: ['details', 'semantics'],
      description: `
**Завдання.** Перепишіть блок FAQ на нативних елементах, щоб він розкривався без жодного JavaScript.

**Де трапляється:** FAQ на лендингах, розділи «Доставка/Оплата», фільтри в каталозі.

**Дано (HTML):** заголовок \`<h2>\` і три \`div.faq\`, у кожному \`.q\` (питання) і \`.a\` (відповідь).

**Що написати**
- кожна пара → \`<details>\`, питання → \`<summary>\` (першим дочірнім елементом), відповідь — поруч у тому ж \`details\`;
- перше питання відкрите за замовчуванням;
- одночасно відкрите **лише одне** питання.

**Приклад**
\`\`\`html
<details name="group" open>
  <summary>Питання?</summary>
  <p>Відповідь.</p>
</details>
\`\`\`

**Як це працює:** \`<summary>\` фокусується і перемикається Enter/Space, screen reader чує стан «розгорнуто/згорнуто». Булевий атрибут \`open\` — стан. Однаковий атрибут \`name\` у групі \`details\` працює як у радіокнопок: відкриття одного закриває інші.

**Врахуйте:** без жодного \`<script>\`; \`summary\` — саме перший дочірній елемент.
`,
      html: `<h2>Часті питання</h2>
<!-- 1. .faq → розкривний блок, .q → його заголовок (першим), .a → вміст. TODO
     2. Перше питання відкрите. TODO
     3. Лише одне відкрите одночасно — спільний атрибут для всіх блоків. TODO -->
<div class="faq">
  <div class="q">Чи є безкоштовний період?</div>
  <div class="a">Так, 14 днів без привʼязки картки.</div>
</div>
<div class="faq">
  <div class="q">Чи можна змінити тариф?</div>
  <div class="a">Так, у будь-який момент у налаштуваннях.</div>
</div>
<div class="faq">
  <div class="q">Як скасувати підписку?</div>
  <div class="a">Профіль → Підписка → Скасувати.</div>
</div>
<!-- Перевірте в консолі: [...document.querySelectorAll('details')].map(d => d.open) -->`,
      css: `body { font-family: system-ui, sans-serif; }
details { border: 1px solid #ddd; border-radius: 6px; padding: 8px 12px; margin-bottom: 8px; }
summary { cursor: pointer; font-weight: 600; }`,
      js: '',
      editable: ['html'],
      solution: {
        html: `<h2>Часті питання</h2>
<details name="faq" open>
  <summary>Чи є безкоштовний період?</summary>
  <p>Так, 14 днів без привʼязки картки.</p>
</details>
<details name="faq">
  <summary>Чи можна змінити тариф?</summary>
  <p>Так, у будь-який момент у налаштуваннях.</p>
</details>
<details name="faq">
  <summary>Як скасувати підписку?</summary>
  <p>Профіль → Підписка → Скасувати.</p>
</details>`
      },
      hints: [
        '`<details>` + `<summary>` — це нативний розкривний блок. Відкритий стан задає булевий атрибут `open`.',
        'Однаковий атрибут `name="faq"` на всіх `<details>` робить групу ексклюзивною (як радіокнопки).'
      ],
      tests: [
        { name: 'три details, у кожному summary першим', code: "const ds = $$('details');\nexpect(ds).toHaveLength(3);\nds.forEach(d => expect(d.firstElementChild.tagName).toBe('SUMMARY'));\nexpect(ds[1].querySelector('summary').textContent).toMatch('змінити тариф');" },
        { name: 'відповідь — усередині details, поза summary', code: "const d = $$('details')[0];\nexpect(d.textContent).toMatch('14 днів');\nexpect(d.querySelector('summary').textContent).not.toMatch('14 днів');" },
        { name: 'перше питання відкрите, інші — ні', code: "const ds = $$('details');\nexpect(ds[0].open).toBe(true);\nexpect(ds[1].open).toBe(false);\nexpect(ds[2].open).toBe(false);" },
        { name: 'усі details мають однаковий name', code: "const names = $$('details').map(d => d.getAttribute('name'));\nexpect(names[0]).toBeTruthy();\nexpect(new Set(names).size).toBe(1);" },
        { name: 'відкриття іншого питання закриває перше', code: "const ds = $$('details');\nds[2].open = true;\nexpect(ds[2].open).toBe(true);\nexpect(ds[0].open).toBe(false);" },
        { name: 'жодного JavaScript', code: "const userScripts = $$('body script').filter(s => s.textContent.trim() && !s.textContent.includes('__fe'));\nexpect(userScripts).toHaveLength(0);" }
      ],
      explanation: `
\`<details>/<summary>\` дає безкоштовно фокус, Enter/Space, стан для screen reader, подію \`toggle\` і розкриття при пошуку Ctrl+F. Атрибут \`name\` (усі сучасні браузери з 2024) робить групу ексклюзивною — раніше це вимагало JS.

**Обмеження:** анімувати висоту складніше; для акордеонів за APG з особливою поведінкою — кнопки з \`aria-expanded\` (тема a11y).

**Що можуть спитати далі:** як прибрати стандартний трикутник? Як відреагувати на відкриття в JS? (Подія \`toggle\`, вона не спливає.)
`
    },
    {
      id: 'html-dialog-confirm',
      group: 'native',
      type: 'dom',
      level: 2,
      title: 'Підтвердження видалення на <dialog>',
      tags: ['dialog', 'forms'],
      description: `
**Завдання.** Зробіть підтвердження видалення файлу з нативним модальним \`<dialog>\` замість \`confirm()\`: клік «Видалити» відкриває діалог з назвою файлу, «Так, видалити» прибирає файл зі списку, «Скасувати» або Escape — нічого не видаляють.

**Де трапляється:** будь-яка «небезпечна дія» в адмінці чи файловому менеджері; на співбесіді — «як зробити доступну модалку без бібліотек».

**Дано (HTML):**
- \`ul#files\` — три \`li\` з \`data-name\` (\`report.pdf\`, \`photo.png\`, \`notes.txt\`), у кожному \`button.delete\`;
- \`p#status\` (\`role="status"\`) — сюди пишемо результат;
- \`dialog#confirm\` з \`<span id="confirm-name">\` у заголовку і \`<form method="dialog">\` з кнопками \`value="cancel"\` («Скасувати») та \`value="ok"\` («Так, видалити»).

**Що написати** (JS)
- клік по \`.delete\` (делегування на \`#files\`) → запамʼятати \`li\`, записати \`data-name\` у \`#confirm-name\`, скинути \`dialog.returnValue = ''\`, відкрити \`dialog.showModal()\`;
- подія \`close\` діалогу:
  - \`returnValue === 'ok'\` → видалити запамʼятований \`li\`, \`#status\` = \`Видалено: <назва>\`;
  - інакше → \`#status\` = \`Скасовано\`.

**Приклад**
\`\`\`text
клік .delete біля photo.png → модальний діалог «Видалити photo.png?»
клік «Так, видалити»       → li зник, #status: «Видалено: photo.png»
клік .delete, потім Escape → #status: «Скасовано», список без змін
\`\`\`

**Як це працює:** кнопка всередині \`<form method="dialog">\` не відправляє форму на сервер, а закриває діалог і записує свій \`value\` у \`dialog.returnValue\`; після закриття спрацьовує подія \`close\`. \`showModal()\` робить фон інертним, переносить фокус у діалог і закриває його по Escape — без вашого коду.

**Врахуйте:** Escape (або \`dialog.close()\` без аргументу) **не змінює** \`returnValue\` — без скидання перед відкриттям лишиться \`'ok'\` з минулого разу, і файл видалиться помилково.
`,
      html: `<ul id="files">
  <li data-name="report.pdf">report.pdf <button type="button" class="delete">Видалити</button></li>
  <li data-name="photo.png">photo.png <button type="button" class="delete">Видалити</button></li>
  <li data-name="notes.txt">notes.txt <button type="button" class="delete">Видалити</button></li>
</ul>
<p id="status" role="status"></p>

<dialog id="confirm" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Видалити <span id="confirm-name"></span>?</h2>
  <form method="dialog">
    <button value="cancel" autofocus>Скасувати</button>
    <button value="ok">Так, видалити</button>
  </form>
</dialog>`,
      css: `body { font-family: system-ui, sans-serif; }
li { margin: 4px 0; }
dialog::backdrop { background: rgb(0 0 0 / 0.4); }`,
      js: `const list = document.querySelector('#files');
const dialog = document.querySelector('#confirm');
const nameEl = document.querySelector('#confirm-name');
const statusEl = document.querySelector('#status');
let pendingItem = null; // li, який чекає підтвердження

// 1. Делегування: клік по .delete всередині #files.
list.addEventListener('click', (e) => {
  // TODO: знайти кнопку .delete (closest), інакше вийти
  // TODO: pendingItem = її li; nameEl.textContent = li.dataset.name
  // TODO: скинути dialog.returnValue і відкрити модально
});

// 2. Результат — у події close.
dialog.addEventListener('close', () => {
  // TODO: 'ok' → видалити pendingItem, статус «Видалено: <назва>»
  // TODO: інакше — статус «Скасовано»
});

// Спробуйте в консолі: document.querySelector('.delete').click(); dialog.open
`,
      editable: ['js'],
      solution: {
        js: `const list = document.querySelector('#files');
const dialog = document.querySelector('#confirm');
const nameEl = document.querySelector('#confirm-name');
const statusEl = document.querySelector('#status');
let pendingItem = null;

list.addEventListener('click', (e) => {
  const btn = e.target.closest('.delete');
  if (!btn) return;
  pendingItem = btn.closest('li');
  nameEl.textContent = pendingItem.dataset.name;
  dialog.returnValue = ''; // Escape не змінює returnValue — скидаємо старий 'ok'
  dialog.showModal();
});

dialog.addEventListener('close', () => {
  if (dialog.returnValue === 'ok' && pendingItem) {
    statusEl.textContent = 'Видалено: ' + pendingItem.dataset.name;
    pendingItem.remove();
  } else {
    statusEl.textContent = 'Скасовано';
  }
  pendingItem = null;
});
`
      },
      hints: [
        'Відкриття: `e.target.closest(\'.delete\')` → `closest(\'li\')` → `dialog.showModal()`. Модальність перевіряється через `dialog.matches(\':modal\')`.',
        'Не обробляйте кліки по кнопках діалогу вручну: `<form method="dialog">` сам закриє діалог, а відповідь прочитайте з `dialog.returnValue` у події `close`.',
        'Перед кожним `showModal()` пишіть `dialog.returnValue = \'\'` — інакше після Escape лишиться відповідь з минулого разу.'
      ],
      tests: [
        { name: 'клік «Видалити» відкриває модальний діалог з назвою файлу', code: "click($$('#files .delete')[0]);\nconst d = $('#confirm');\nexpect(d.open).toBe(true);\nexpect(d.matches(':modal')).toBe(true);\nexpect($('#confirm-name').textContent).toBe('report.pdf');" },
        { name: '«Скасувати» закриває діалог і нічого не видаляє', code: "click('#confirm button[value=\"cancel\"]');\nawait waitFor(() => $('#status').textContent === 'Скасовано');\nexpect($('#confirm').open).toBe(false);\nexpect($$('#files li')).toHaveLength(3);" },
        { name: '«Так, видалити» прибирає саме обраний файл', code: "click($$('#files .delete')[1]);\nexpect($('#confirm-name').textContent).toBe('photo.png');\nclick('#confirm button[value=\"ok\"]');\nawait waitFor(() => $('#status').textContent === 'Видалено: photo.png');\nexpect($$('#files li').map(li => li.dataset.name)).toEqual(['report.pdf', 'notes.txt']);" },
        { name: 'Escape після попереднього «ok» не видаляє файл (returnValue скинуто)', code: "click($$('#files .delete')[0]);\nexpect($('#confirm').open).toBe(true);\n$('#confirm').close(); // як Escape: без нового returnValue\nawait waitFor(() => $('#status').textContent === 'Скасовано');\nexpect($$('#files li')).toHaveLength(2);" }
      ],
      explanation: `
Нативний \`<dialog>\` + \`showModal()\` закриває більшість вимог до доступної модалки: top layer, інертний фон, фокус усередину і повернення на кнопку «Видалити» після закриття, Escape. \`<form method="dialog">\` прибирає потребу в обробниках на кожну кнопку.

**Типові помилки:** не скинутий \`returnValue\` (видалення після Escape); обробка кліку по кнопках діалогу замість події \`close\`; \`dialog.setAttribute('open', '')\` замість \`showModal()\` — фон лишається інтерактивним.

**Що можуть спитати далі:** як закрити діалог кліком по backdrop? Як скасувати закриття по Escape (подія \`cancel\` + \`preventDefault\`)? Чому \`confirm()\` гірший (блокує потік, не стилізується)?
`
    },

    // ───────────────────────── 8. SEO ─────────────────────────
    {
      id: 'html-seo-basics',
      group: 'seo',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'SEO-основи для фронтенд-розробника',
      tags: ['seo'],
      question: 'Що фронтенд-розробник може зробити для SEO сторінки? Оберіть **усі** правильні твердження.',
      choices: [
        'Навігація через справжні `<a href>`: краулер переходить за `href`, а не за `onClick` на `div`',
        '`robots.txt` з `Disallow` гарантовано прибирає сторінку з індексу пошуковика',
        'JSON-LD зі schema.org дає розширені сніпети: ціну, рейтинг, FAQ, хлібні крихти',
        'Неіснуюча сторінка може віддавати 200 з текстом «не знайдено» — пошуковику це байдуже',
        'Core Web Vitals (LCP, INP, CLS) впливають на ранжування, а індексація — mobile-first'
      ],
      correct: [0, 2, 4],
      why: [
        'Так: краулер збирає посилання з `href`; клікати по елементах і виконувати обробники він не буде.',
        'Ні: `robots.txt` забороняє **сканування**; URL може потрапити в індекс за зовнішніми посиланнями. Для виключення — `noindex`.',
        'Так: структуровані дані дають пошуковику факти про сторінку і розширені сніпети.',
        'Ні: це «soft 404» — засмічує індекс і витрачає бюджет сканування; потрібен справжній статус 404.',
        'Так: швидкість — фактор ранжування, а Google індексує мобільну версію сторінки.'
      ],
      hint: 'Мета-теги, семантика, посилання, швидкість, індексація, структуровані дані, рендеринг.',
      answer: `
**Контент і розмітка:** унікальні \`<title>\` (~60 символів) і \`description\` (~155); один \`<h1>\` і логічні \`h2–h6\`; \`alt\`; \`lang\`; справжні \`<a href>\`.

**Індексація:** \`canonical\` проти дублікатів; \`<meta name="robots" content="noindex">\` для службових сторінок (\`robots.txt\` — лише сканування); \`sitemap.xml\`; \`hreflang\`; коректні статуси (404, 301).

**Структуровані дані** (JSON-LD):

\`\`\`html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Product", "name": "Lenovo X1",
  "offers": { "@type": "Offer", "price": "52000", "priceCurrency": "UAH" } }
</script>
\`\`\`

**Продуктивність:** Core Web Vitals; mobile-first індексація.

**Рендеринг:** контент, що зʼявляється лише після JS (CSR), індексується із затримкою, соцмережі його часто не бачать → SSR/SSG для публічних сторінок.
`,
      keyPoints: [
        'Унікальні title/description, один h1, семантика',
        'Справжні <a href> для навігації',
        'canonical, robots, sitemap, коректні статуси',
        'JSON-LD для розширених сніпетів',
        'Core Web Vitals і SSR/SSG для публічного контенту'
      ],
      followUps: ['Чим robots.txt відрізняється від meta robots?', 'Як SPA впливає на SEO?', 'Що таке canonical і коли його ставити?']
    },
    {
      id: 'html-quiz-canonical',
      group: 'seo',
      type: 'quiz',
      level: 2,
      title: 'Дублікати сторінок і canonical',
      tags: ['seo'],
      question: 'Сторінка товару відкривається за адресами `/p/123`, `/p/123?utm_source=fb` та `/p/123?sort=price`. Пошуковик бачить три «різні» сторінки з однаковим вмістом. Що зробити?',
      options: [
        'Додати `<meta name="robots" content="noindex">` на `/p/123`',
        'Заборонити в `robots.txt` усі URL з `?`',
        'Додати `<meta name="keywords">` з назвою товару',
        'На всіх варіантах вказати `<link rel="canonical" href="https://shop.com/p/123">`'
      ],
      answer: 3,
      why: [
        'Ні: `noindex` на основній сторінці прибере з видачі саме її — протилежне потрібному.',
        'Ні: заблокований URL краулер не прочитає — а отже, не побачить і canonical; сигнали не консолідуються.',
        'Ні: `meta keywords` пошуковики ігнорують.',
        'Так: canonical вказує головну URL, і сигнали дублікатів консолідуються на ній.'
      ],
      hint: 'Потрібно не сховати сторінки, а підказати, яка з них «головна».',
      explanation: `
\`rel="canonical"\` повідомляє пошуковику основну URL: посилання й рейтинг консолідуються на ній, дублікати не конкурують між собою. Ставлять і на саму основну сторінку (self-referencing canonical), з абсолютною URL.
`
    },
    {
      id: 'html-seo-rendering',
      group: 'seo',
      type: 'theory',
      level: 4,
      title: 'CSR, SSR, SSG — вплив на SEO',
      tags: ['seo', 'rendering'],
      question: 'Як спосіб рендерингу (CSR, SSR, SSG/ISR) впливає на SEO і продуктивність? Що робити, якщо проєкт — класична SPA?',
      choices: [
        'Googlebot рендерить JS одразу при першому скануванні, тому для SEO CSR рівноцінний SSR',
        'CSR дає порожній HTML і пізнішу індексацію, тож публічні сторінки SPA переводять на SSR/SSG',
        'SSG генерує HTML на кожен запит, тому підходить для сторінок, що змінюються щосекунди',
        'SSR не має мінусів: гідрація безплатна, а навантаження на сервер таке ж, як при CSR',
        'Для SEO у SPA краще hash-роутинг `#/page` — пошуковик індексує кожен hash окремо'
      ],
      correct: 1,
      why: [
        'Ні: рендеринг JS у Google відкладений (друга хвиля), а інші боти й соцмережі JS часто не виконують.',
        'Так: у першій відповіді CSR немає контенту, тому публічні сторінки рендерять на сервері або при збірці.',
        'Ні: SSG генерує HTML на етапі **збірки**; для частих змін — SSR або ISR.',
        'Ні: SSR навантажує сервер, підвищує TTFB, а важка гідрація шкодить INP.',
        'Ні: усе після `#` на сервер не йде і пошуковиком не індексується окремо — потрібні чисті URL (History API).'
      ],
      hint: 'Що отримує краулер у першій HTML-відповіді? Як Googlebot обробляє JS?',
      answer: `
| Підхід | Як | SEO / продуктивність |
|---|---|---|
| **CSR** | порожній \`<div id="root">\` + бандл | контент після JS; індексація у дві хвилі; соцмережі не бачать OG; гірший LCP |
| **SSR** | HTML на кожен запит + гідрація | контент одразу; ціна — сервер, TTFB, hydration mismatch, INP |
| **SSG** | HTML на етапі збірки, CDN | найшвидше й найдешевше; для контенту, що рідко змінюється |
| **ISR** | SSG + фонова перегенерація | компроміс для каталогів і блогів |

Гібриди: streaming SSR, React Server Components, islands (Astro) — менше JS на клієнті.

**Якщо проєкт — SPA:**
- публічні сторінки → SSR/SSG (Next.js, Nuxt, Remix, Astro), кабінет лишити CSR;
- або prerendering на етапі збірки;
- оновлювати \`title\`/meta/canonical на кожному маршруті;
- History API замість \`#/page\`, справжні \`<a href>\`, сервер віддає 404 для неіснуючих маршрутів.
`,
      keyPoints: [
        'CSR: контент після JS, дві хвилі індексації, соцмережі не бачать OG',
        'SSR: контент у першій відповіді, ціна — сервер і гідрація',
        'SSG/ISR: HTML на етапі збірки, CDN, найкраща продуктивність',
        'Для SPA: SSR/SSG для публічних сторінок, prerender, оновлення title/meta, History API'
      ],
      followUps: ['Що таке гідрація і hydration mismatch?', 'Коли SSG не підходить?', 'Як перевірити, що бачить Googlebot?']
    },
    {
      id: 'html-video-autoplay', group: 'media-popover', type: 'quiz', level: 2,
      title: 'Яке відео запуститься автоматично',
      question: 'Фонове відео на лендингу має стартувати саме, без кліку, у Chrome і Safari на iPhone. Яка розмітка спрацює?',
      options: [
        '`<video src="bg.mp4" autoplay></video>`',
        '`<video src="bg.mp4" autoplay muted playsinline loop></video>`',
        '`<video src="bg.mp4" controls autoplay></video>`',
        '`<video src="bg.mp4" preload="auto"></video>` + `video.play()` у `DOMContentLoaded`'
      ],
      answer: 1,
      why: [
        'Ні: відео зі звуком браузери не запускають без взаємодії користувача.',
        'Так: без звуку автозапуск дозволено; playsinline не дає iOS розгорнути відео на весь екран.',
        'Ні: controls не обходить політику — звук усе одно блокує автозапуск.',
        'Ні: play() зі звуком без жесту користувача відхиляється (NotAllowedError).'
      ],
      hint: 'Що дратує користувачів найбільше — і що браузери заборонили без кліку?',
      explanation: '**Autoplay policy:** без жесту користувача можна автоматично відтворювати лише відео **без звуку** (`muted`). На iOS додатково потрібен `playsinline`. `video.play()` повертає проміс — його варто обробляти: `video.play().catch(() => showPlayButton())`. Для фонового відео — ще `loop`, а для доступності — повага до `prefers-reduced-motion`.'
    },
    {
      id: 'html-video-captions', group: 'media-popover', type: 'dom', level: 2,
      title: 'Доступне відео з субтитрами',
      tags: ['video', 'track', 'a11y'],
      description: `
**Завдання.** У \`<figure>\` додайте відео:
- \`<video>\` з \`controls\` і \`width="640"\`;
- два джерела \`<source>\`: \`intro.webm\` (\`type="video/webm"\`) і \`intro.mp4\` (\`type="video/mp4"\`) — саме в такому порядку;
- субтитри \`<track kind="captions" src="intro.uk.vtt" srclang="uk" label="Українська" default>\`;
- текст-запасний варіант усередині \`<video>\` з посиланням на \`intro.mp4\`;
- підпис \`<figcaption>Вступ до курсу</figcaption>\`.

**Де трапляється:** відео в курсах, продуктові демо, онбординг. Субтитри потрібні людям з порушеннями слуху і тим, хто дивиться без звуку (вимога WCAG 1.2.2).

**Як це працює:** браузер бере **перше** \`<source>\`, формат якого підтримує; \`<track>\` підключає WebVTT-файл з текстом і таймкодами; \`default\` вмикає субтитри одразу.
`,
      html: `<figure>
  <!-- TODO: video з двома source, track і запасним текстом -->
  <!-- TODO: figcaption -->
</figure>`,
      css: `video { max-width: 100%; }`,
      js: '',
      editable: ['html'],
      solution: {
        html: `<figure>
  <video controls width="640">
    <source src="intro.webm" type="video/webm">
    <source src="intro.mp4" type="video/mp4">
    <track kind="captions" src="intro.uk.vtt" srclang="uk" label="Українська" default>
    Ваш браузер не відтворює відео. <a href="intro.mp4">Завантажте його</a>.
  </video>
  <figcaption>Вступ до курсу</figcaption>
</figure>`
      },
      hints: ['`<source>` і `<track>` розміщуються **всередині** `<video>`; запасний текст — теж усередині, після них.', 'Порядок джерел важливий: браузер бере перше підтримуване.'],
      tests: [
        { name: 'video з controls і шириною', code: "const v = $('figure video');\nexpect(v).toBeTruthy();\nexpect(v.hasAttribute('controls')).toBe(true);\nexpect(v.getAttribute('width')).toBe('640');" },
        { name: 'два source у правильному порядку', code: "const s = $$('video source');\nexpect(s.map((x) => x.getAttribute('type'))).toEqual(['video/webm', 'video/mp4']);\nexpect(s[1].getAttribute('src')).toBe('intro.mp4');" },
        { name: 'субтитри українською за замовчуванням', code: "const t = $('video track');\nexpect(t.getAttribute('kind')).toBe('captions');\nexpect(t.getAttribute('srclang')).toBe('uk');\nexpect(t.getAttribute('label')).toBeTruthy();\nexpect(t.hasAttribute('default')).toBe(true);" },
        { name: 'запасний текст з посиланням і підпис', code: "expect($('video a[href=\"intro.mp4\"]')).toBeTruthy();\nexpect($('figure figcaption').textContent.trim()).toBe('Вступ до курсу');" }
      ],
      explanation: '`kind="captions"` — субтитри з описом звуків («[сміх]»), `subtitles` — переклад мови. Формат WebVTT: `00:00.000 --> 00:03.000` і текст. Для фонового чи декоративного відео субтитри не потрібні, але потрібні `muted` і можливість зупинити (WCAG 2.2.2). Важке відео не завантажуйте одразу: `preload="none"` або `metadata` і `poster`.'
    },
    {
      id: 'html-popover', group: 'media-popover', type: 'dom', level: 2,
      title: 'Меню через Popover API — без JavaScript',
      tags: ['popover', 'html'],
      description: `
**Завдання.** Зробіть випадаюче меню **без жодного рядка JS**:
- кнопка \`<button>\` з текстом «Меню» відкриває і закриває панель \`#menu\`;
- панель — \`<div id="menu" popover>\` зі списком з трьох посилань;
- клік поза меню або **Esc** закриває його (це браузер робить сам).

**Де трапляється:** випадаючі меню, підказки, тости, діалоги вибору. Раніше для цього писали JS: відкриття, закриття по кліку зовні, Esc, z-index.

**Як це працює:** атрибут \`popover\` робить елемент прихованим і виносить його у **top layer** — поверх усього, без боротьби з \`z-index\` і \`overflow: hidden\` батьків. Кнопка з \`popovertarget="menu"\` перемикає його. \`popover\` (= \`auto\`) дає «light dismiss»: клік зовні та Esc закривають.
`,
      html: `<nav class="bar">
  <!-- TODO: кнопка, що перемикає #menu -->
  <!-- TODO: панель #menu з атрибутом popover і трьома посиланнями -->
</nav>`,
      css: `.bar { padding: 16px; }
#menu { margin: 0; padding: 8px; border: 1px solid #ccc; border-radius: 8px; }
#menu a { display: block; padding: 6px 12px; }`,
      js: '',
      editable: ['html'],
      solution: {
        html: `<nav class="bar">
  <button popovertarget="menu">Меню</button>
  <div id="menu" popover>
    <ul>
      <li><a href="#profile">Профіль</a></li>
      <li><a href="#settings">Налаштування</a></li>
      <li><a href="#logout">Вийти</a></li>
    </ul>
  </div>
</nav>`
      },
      hints: ['Панелі потрібен `id` і атрибут `popover`, кнопці — `popovertarget` з цим id.', 'Відкритий popover відповідає псевдокласу `:popover-open`.'],
      tests: [
        { name: 'меню спочатку приховане', code: "const m = $('#menu');\nexpect(m.hasAttribute('popover')).toBe(true);\nexpect(m.matches(':popover-open')).toBe(false);\nexpect(css(m, 'display')).toBe('none');" },
        { name: 'кнопка відкриває і закриває меню', code: "const b = $('button[popovertarget=\"menu\"]');\nexpect(b.textContent.trim()).toBe('Меню');\nb.click();\nexpect($('#menu').matches(':popover-open')).toBe(true);\nb.click();\nexpect($('#menu').matches(':popover-open')).toBe(false);" },
        { name: 'у меню три посилання', code: "expect($$('#menu a')).toHaveLength(3);" },
        { name: 'без обробників у розмітці', code: "expect($('button[popovertarget]').hasAttribute('onclick')).toBe(false);" }
      ],
      explanation: 'Popover API (Baseline 2024): `popover="auto"` — light dismiss і закриття інших auto-popover; `popover="manual"` — закривається лише явно. JS-керування: `el.showPopover()`, `hidePopover()`, `togglePopover()`, подія `toggle`. Відмінність від `<dialog>`: popover **не модальний** (сторінка лишається інтерактивною), а `dialog.showModal()` блокує решту сторінки й утримує фокус. Позиціювання біля кнопки — CSS anchor positioning або JS.'
    }
  ]
});
