FE.chapter('rendering-book', { body: `
Як байти HTML, CSS і JS стають пікселями — і чому одні зміни інтерфейсу «безкоштовні», а інші гальмують. Це фундамент для метрик LCP, CLS, INP і для питання «чому лагає анімація».

## Critical rendering path

\`\`\`text
HTML → DOM ─┐
            ├→ Style (render tree) → Layout → Paint → Composite
CSS → CSSOM ┘
\`\`\`
1. **DOM** будується потоково, у міру надходження HTML.
2. **CSSOM** використовується лише повністю (пізніші правила перекривають попередні), тому CSS **блокує рендеринг**.
3. **Style:** для кожного видимого вузла — фінальні стилі. \`display: none\` не потрапляє в дерево, \`visibility: hidden\` — потрапляє і займає місце.
4. **Layout:** геометрія — розміри й позиції.
5. **Paint:** списки команд малювання для шарів.
6. **Composite:** складання шарів, часто на GPU в окремому потоці.

Оптимізація: менше критичних ресурсів (inline critical CSS, \`media\` для некритичних стилів), менше round-trip (preconnect, HTTP/2), \`defer\` для скриптів.

## Скрипти: блокування, async, defer, hints

| | Завантаження | Виконання | Порядок |
|---|---|---|---|
| \`<script>\` | блокує парсер | одразу | за порядком |
| \`async\` | паралельно | щойно завантажився (перериває парсер) | **не гарантовано** |
| \`defer\` | паралельно | після парсингу, перед \`DOMContentLoaded\` | за порядком |
| \`type="module"\` | паралельно | як \`defer\` за замовчуванням | за порядком |

Класичний скрипт після \`<link rel="stylesheet">\` ще й **чекає на CSSOM** — скрипт може читати стилі.

**Resource hints:** \`preconnect\` (з'єднання заздалегідь), \`dns-prefetch\`, \`preload\` (критичний ресурс поточної сторінки: шрифт, LCP-зображення), \`prefetch\` (ймовірна наступна сторінка), \`modulepreload\`; \`fetchpriority="high"\` для LCP-зображення.

## Reflow, repaint, layout thrashing

- **Reflow (layout)** — перерахунок геометрії: зміна розмірів, шрифту, вмісту, додавання вузлів. Найдорожче, може зачепити весь документ.
- **Repaint** — перемалювання без зміни геометрії: колір, фон, тінь.
- **Composite-only** — \`transform\`, \`opacity\`: без layout і paint.

**Forced synchronous layout:** читання геометрії (\`offsetHeight\`, \`getBoundingClientRect\`, \`scrollTop\`, \`getComputedStyle\`) одразу після запису стилів змушує браузер порахувати layout **зараз**. У циклі це **layout thrashing**:
\`\`\`js
// погано: читання/запис по черзі — reflow на кожній ітерації
items.forEach((el) => { el.style.width = el.offsetWidth + 10 + 'px'; });
// добре: спершу всі читання, потім усі записи
const widths = items.map((el) => el.offsetWidth);
items.forEach((el, i) => { el.style.width = widths[i] + 10 + 'px'; });
\`\`\`

## Композитинг і плавні анімації

Анімуйте **\`transform\` і \`opacity\`** — їх може обробити compositor без головного потоку, тож анімація плавна навіть під навантаженням JS. Анімація \`top/left/width/height\` — layout щокадру.

Шар (layer) отримують елементи з \`will-change: transform\`, 3D-трансформаціями, \`<video>\`, \`position: fixed\` (часто) тощо. **Не зловживайте:** кожен шар — пам'ять GPU; \`will-change\` ставлять перед анімацією, а не на все підряд.

\`contain: layout paint\` і \`content-visibility: auto\` обмежують, скільки сторінки браузер перераховує.

## requestAnimationFrame і кадр

Кадр при 60 Гц — **~16,7 мс**: JS → style → layout → paint → composite. \`requestAnimationFrame(cb)\` викликає \`cb\` **перед** наступним кадром — ідеально для анімацій і групування записів у DOM.
\`\`\`js
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { updateHeader(window.scrollY); ticking = false; });
}, { passive: true });
\`\`\`
У прихованій вкладці rAF призупиняється. Для анімацій з часом використовуйте timestamp з аргументу колбека, а не лічильник кадрів (частота екранів буває 120 Гц+).

## Оптимізації та діагностика

**DevTools → Performance:** запис взаємодії → довгі задачі (червоні кутики, > 50 мс), фіолетові блоки Layout, зелені Paint, попередження «Forced reflow». **Rendering → Paint flashing / Layer borders** — що перемальовується. **Lighthouse / PageSpeed Insights** — лабораторні метрики, **CrUX** — реальні користувачі.

Чек-лист: анімації лише \`transform/opacity\`; групувати читання і записи DOM; великі списки — віртуалізація або \`content-visibility\`; дорогі обчислення — воркер або дроблення задач (\`scheduler.yield()\`, \`setTimeout\`); зображення з розмірами (без CLS).

## Типові питання

- **Опишіть critical rendering path.** DOM + CSSOM → style → layout → paint → composite; CSS блокує рендеринг.
- **async vs defer?** Порядок і момент виконання.
- **Reflow vs repaint?** Геометрія vs вигляд; transform/opacity — лише композитинг.
- **Що таке layout thrashing?** Чергування читань і записів геометрії, що змушує синхронний layout.
- **Навіщо requestAnimationFrame?** Синхронізація з кадром, групування змін, пауза у фоні.
`});
