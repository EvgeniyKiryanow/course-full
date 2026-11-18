FE.chapter('html-book', { body: `
HTML — структура і зміст сторінки. Правильна розмітка дає доступність, SEO, роботу форм без JS і менше CSS/JS-«латок».

## Документ і <head>

\`\`\`html
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Кошик — Магазин</title>
  <meta name="description" content="…">
  <link rel="stylesheet" href="/app.css">
  <script src="/app.js" defer></script>
</head>
<body>…</body>
</html>
\`\`\`
- \`<!DOCTYPE html>\` вмикає стандартний режим рендерингу; без нього — **quirks mode** (інша box model, дивна поведінка таблиць);
- \`lang\` — для скрінрідерів, перекладачів, переносів; \`charset\` — перші 1024 байти документа;
- \`viewport\` — без нього мобільний браузер малює сторінку як для екрана ~980px і зменшує;
- CSS у \`<head>\` (блокує рендеринг — це добре: немає FOUC), скрипти — з \`defer\` або \`type="module"\`.

**Senior:** порядок у head впливає на швидкість: \`charset\` → \`viewport\` → \`preconnect\`/\`preload\` критичного → CSS → скрипти. \`<base>\` змінює всі відносні URL — обережно.

## Семантична розмітка

| Елемент | Сенс |
|---|---|
| \`<header>\`, \`<footer>\` | шапка/підвал сторінки або секції |
| \`<nav>\` | основна навігація |
| \`<main>\` | основний вміст (один на сторінку) |
| \`<article>\` | самодостатній блок (пост, картка товару) |
| \`<section>\` | тематичний розділ із заголовком |
| \`<aside>\` | побічний вміст |
| \`h1–h6\` | ієрархія заголовків без пропусків рівнів |

Семантика = орієнтири для скрінрідерів (перехід між landmarks), сенс для пошуковиків, читабельний код. \`<div>\`/\`<span>\` — лише для стилів без сенсу. Кнопка дії — \`<button>\`, перехід — \`<a href>\`; не навпаки.

Текст: \`<strong>\` (важливість) vs \`<b>\` (лише стиль), \`<em>\` vs \`<i>\`, \`<time datetime="2026-11-17">\`, \`<abbr>\`, \`<code>\`, списки \`<ul>/<ol>/<dl>\`.

## Форми: label, name, кнопки

\`\`\`html
<form action="/login" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" autocomplete="email" required>
  <button type="submit">Увійти</button>
</form>
\`\`\`
- \`<label>\` з \`for\` (або обгортання) — доступне ім'я і більша зона кліку;
- \`name\` — ключ у \`FormData\` і при відправці; без \`name\` поле не відправляється;
- \`<button>\` у формі за замовчуванням \`type="submit"\` — для інших дій \`type="button"\`;
- Enter у полі відправляє форму; подія \`submit\` на формі (а не \`click\` кнопки) — ловить обидва способи;
- \`type\`: \`email\`, \`tel\`, \`number\`, \`date\`, \`search\`, \`password\` — правильна клавіатура на мобільних; \`autocomplete\` — автозаповнення;
- групи: \`<fieldset>\` + \`<legend>\` (радіокнопки), \`<select>\`, \`<textarea>\`.

## Валідація форм

Вбудована: \`required\`, \`minlength/maxlength\`, \`min/max/step\`, \`pattern\`, \`type="email|url"\`. API: \`input.validity\` (\`valueMissing\`, \`typeMismatch\`, \`patternMismatch\`…), \`checkValidity()\`, \`reportValidity()\`, \`setCustomValidity('текст')\` (порожній рядок — валідно). CSS: \`:invalid\`, \`:user-invalid\` (лише після взаємодії — не червоні поля одразу).

\`\`\`js
form.addEventListener('submit', (e) => {
  if (pass.value !== confirm.value) {
    confirm.setCustomValidity('Паролі не збігаються');
    confirm.reportValidity();
    e.preventDefault();
  }
});
\`\`\`
\`novalidate\` на формі — власна валідація з JS. **Клієнтська валідація — для UX, серверна — обов'язкова.** Помилки — текстом біля поля (\`aria-describedby\`, \`aria-invalid\`).

## Зображення

\`\`\`html
<img src="photo-800.jpg"
     srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1600.jpg 1600w"
     sizes="(max-width: 600px) 100vw, 50vw"
     width="800" height="600" alt="Опис змісту" loading="lazy" decoding="async">
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="…" width="1200" height="600" fetchpriority="high">
</picture>
\`\`\`
- \`srcset\` з \`w\` + \`sizes\` — браузер обирає файл за шириною слота і щільністю екрана; \`x\`-дескриптори — для фіксованого розміру;
- \`<picture>\` — формати (AVIF/WebP з фолбеком) або **art direction** (\`media\`);
- \`width\`/\`height\` — браузер резервує місце (немає CLS);
- \`loading="lazy"\` — не для першого екрана (LCP-зображення — \`fetchpriority="high"\`);
- \`alt\`: зміст — опис, декоративне — \`alt=""\`.

## Посилання, data-*, iframe

- \`<a href>\`: \`target="_blank"\` + \`rel="noopener"\` (сучасні браузери ставлять noopener за замовчуванням), \`download\`, \`mailto:\`, \`tel:\`, якорі \`#id\`;
- **data-атрибути:** \`<li data-id="42" data-status="paid">\` → \`el.dataset.id\`, \`el.dataset.status\` (kebab-case → camelCase); для зв'язку DOM і даних, CSS-селекторів \`[data-status="paid"]\`;
- **iframe:** \`sandbox\` (обмеження: без скриптів, форм, top-навігації, якщо не дозволено), \`allow\` (камера, геолокація), \`loading="lazy"\`, \`title\` для доступності. Сторінку від вбудовування захищає CSP \`frame-ancestors\`.

## Таблиці, details, dialog

\`\`\`html
<table>
  <caption>Замовлення</caption>
  <thead><tr><th scope="col">№</th><th scope="col">Сума</th></tr></thead>
  <tbody><tr><th scope="row">1042</th><td>2 579 грн</td></tr></tbody>
</table>
<details><summary>Умови доставки</summary><p>…</p></details>
<dialog id="d"><form method="dialog"><button value="ok">OK</button></form></dialog>
\`\`\`
- таблиці — лише для табличних даних; \`<th scope>\` і \`<caption>\` — для скрінрідерів;
- \`<details>/<summary>\` — акордеон без JS, доступний з клавіатури; атрибут \`name\` об'єднує групу (відкритий лише один);
- \`<dialog>\`: \`showModal()\` — модальний (top layer, \`::backdrop\`, Esc, решта сторінки інертна), \`show()\` — немодальний; \`<form method="dialog">\` закриває діалог, \`dialog.returnValue\` — значення кнопки.

## SEO-основи

- унікальні \`<title>\` і \`<meta name="description">\` для кожної сторінки;
- один \`<h1>\`, логічна ієрархія, семантичні елементи, змістовні \`alt\` і тексти посилань;
- \`<link rel="canonical">\` проти дублікатів; \`hreflang\` для мовних версій;
- Open Graph (\`og:title\`, \`og:image\`) для прев'ю в соцмережах; структуровані дані JSON-LD (\`schema.org\`);
- \`robots.txt\`, \`sitemap.xml\`, \`<meta name="robots" content="noindex">\`;
- контент у HTML: CSR-сторінки індексуються гірше й повільніше — тому SSR/SSG для публічних сторінок; Core Web Vitals впливають на ранжування.

## Відео, аудіо і Popover

\`\`\`html
<video controls width="640" poster="intro.jpg" preload="metadata">
  <source src="intro.webm" type="video/webm">
  <source src="intro.mp4" type="video/mp4">
  <track kind="captions" src="intro.uk.vtt" srclang="uk" label="Українська" default>
  Ваш браузер не відтворює відео. <a href="intro.mp4">Завантажте його</a>.
</video>
<button popovertarget="menu">Меню</button>
<div id="menu" popover>…</div>
\`\`\`
- браузер бере **перше** підтримуване \`<source>\`; \`<track kind="captions">\` — субтитри WebVTT (WCAG вимагає для відео зі звуком);
- autoplay без кліку — лише \`muted\` (+ \`playsinline\` на iOS); \`video.play()\` повертає проміс — обробляйте відмову;
- **Popover API:** \`popover\` (auto) — top layer, закриття кліком зовні й Esc; \`manual\` — лише явно; \`showPopover()/hidePopover()/togglePopover()\`, подія \`toggle\`. На відміну від \`<dialog>\` + \`showModal()\` — немодальний.

## Типові питання

- **Що робить doctype?** Стандартний режим замість quirks.
- **Навіщо семантика?** Доступність, SEO, підтримка.
- **async vs defer?** (розділ «Рендеринг»).
- **Як працюють srcset і sizes?**
- **Навіщо name і label у формі?**
- **dialog vs popover?**
- **Що таке data-атрибути?**
`});
