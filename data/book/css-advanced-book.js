FE.chapter('css-advanced-book', { body: `
Поглиблений CSS: позиціонування, шари накладання, контексти форматування, анімації, змінні, сучасні можливості й архітектура стилів.

## position і containing block

| \`position\` | Відносно чого | У потоці? |
|---|---|---|
| \`static\` | — (top/left не діють) | так |
| \`relative\` | своєї звичайної позиції | так (місце зберігається) |
| \`absolute\` | **containing block** — найближчого позиціонованого предка (не static) | ні |
| \`fixed\` | вікна (viewport) | ні |
| \`sticky\` | «прилипає» в межах прокручуваного предка після порогу \`top\` | так |

**Containing block** для \`absolute\` — найближчий предок з \`position\` ≠ static, а також з \`transform\`, \`filter\`, \`perspective\`, \`contain: paint\` чи \`will-change: transform\`. Ці ж властивості роблять предка containing block і для \`fixed\` — тому модалка з \`position: fixed\` усередині батька з \`transform\` «прилипає» до батька.

\`sticky\` не працює, якщо в предка \`overflow: hidden/auto\` без потрібної висоти або немає \`top\`. \`inset: 0\` = \`top/right/bottom/left: 0\`.

## Stacking context і z-index

\`z-index\` порівнюється лише **всередині одного контексту накладання**. Новий контекст створюють: корінь, позиціонований елемент з \`z-index\` ≠ auto, \`opacity < 1\`, \`transform\`, \`filter\`, \`isolation: isolate\`, \`position: fixed/sticky\`, flex/grid-елементи з \`z-index\`, \`will-change\`, \`mix-blend-mode\`, \`contain: paint\`.

Наслідок: елемент з \`z-index: 9999\` усередині контексту з \`z-index: 1\` не підніметься над сусіднім контекстом з \`z-index: 2\`. Порядок малювання в контексті: фон/рамки → від'ємні z-index → блоки потоку → float → інлайн → \`z-index: 0/auto\` позиціоновані → додатні z-index.

Практика: шкала z-index у змінних (\`--z-dropdown: 100; --z-modal: 1000\`), \`isolation: isolate\` на компоненті, модалки й поповери — у **top layer** (\`<dialog>\`, popover) або порталом у кінець \`body\`.

## BFC, float, margin collapse

**Block Formatting Context** — ізольована область розкладки: всередині float-и й margin не «виходять» назовні. Створюють: \`display: flow-root\` (спеціально для цього), \`overflow\` ≠ visible, float, \`position: absolute/fixed\`, \`display: inline-block\`, flex/grid-елементи, \`contain: layout\`.

Навіщо: батько охоплює float-дітей (замість clearfix), margin дитини не схлопується з батьком, блок не обтікає float.
\`\`\`css
.clearfix::after { content: ''; display: block; clear: both; }   /* історичний прийом */
.wrapper { display: flow-root; }                                  /* сучасна заміна */
\`\`\`
\`float\` сьогодні — для обтікання текстом (зображення в статті, \`shape-outside\`), не для розкладки.

## Transitions, animations, transform

\`\`\`css
.btn { transition: transform 150ms ease-out, background-color 150ms; }
.btn:hover { transform: translateY(-2px); }
@keyframes spin { to { transform: rotate(360deg); } }
.loader { animation: spin 1s linear infinite; }
\`\`\`
- **transition** — плавна зміна між станами; **animation** — ключові кадри, повтори, \`animation-fill-mode: forwards\` (лишити фінальний стан), \`animation-play-state\`;
- \`display\` не анімується класично; сучасно — \`transition-behavior: allow-discrete\` + \`@starting-style\` для появи елементів;
- **дешево анімувати:** \`transform\`, \`opacity\` (композитинг); \`top/left/width/height\` — layout на кожному кадрі;
- \`transform\` не змінює потік (сусіди не зсуваються) і створює stacking context і containing block;
- \`will-change\` — лише перед анімацією; \`prefers-reduced-motion\` — вимикати велику анімацію;
- події: \`transitionend\`, \`animationend\`; JS-альтернатива — Web Animations API (\`el.animate(...)\`).

## CSS-змінні

\`\`\`css
:root { --brand: #3b6cf0; --radius: 8px; --space: 8px; }
.card { border-radius: var(--radius); padding: calc(var(--space) * 2); color: var(--text, #111); }
.card.compact { --space: 4px; }                    /* каскадне перевизначення */
\`\`\`
- змінні **успадковуються** й каскадуються (тема на \`:root\`, перевизначення в компоненті), проходять у Shadow DOM;
- обчислюються під час використання; невалідне значення → \`initial\` для властивості, а не фолбек;
- JS: \`el.style.setProperty('--x', '10px')\`, \`getComputedStyle(el).getPropertyValue('--x')\`;
- \`@property --angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }\` — типізована змінна, яку можна **анімувати** (градієнти, кути).

## Сучасний CSS і архітектура стилів

**Можливості:** нативна вкладеність (\`.card { &:hover {} .title {} }\`), \`:has()\`, container queries, \`@layer\`, \`subgrid\`, \`@scope\`, логічні властивості (\`margin-inline\`, \`padding-block\`, \`inset-inline-start\` — для RTL), \`aspect-ratio\`, \`accent-color\`, \`text-wrap: balance/pretty\`, anchor positioning.

**Підтримка:** \`@supports (display: grid)\` / \`@supports selector(:has(*))\`; Baseline на MDN; Autoprefixer за \`browserslist\`.

**Архітектура:**
| Підхід | Суть | Компроміси |
|---|---|---|
| BEM | \`.block__element--modifier\`, низька специфічність | дисципліна, довгі імена |
| CSS Modules | локальні класи за замовчуванням | прив'язка до збирача |
| CSS-in-JS | стилі в JS (runtime або compile-time) | runtime-версії шкодять швидкодії |
| Utility-first (Tailwind) | класи-утиліти в розмітці | «шум» у HTML, але швидко й послідовно |
| Препроцесори (Sass) | змінні, міксини, вкладеність | частину замінив нативний CSS |

Reset (обнулити все) vs normalize (вирівняти відмінності браузерів, зберігши корисні стилі) — сучасні мінімальні reset поєднують обидва підходи.

## Темна тема, кольори й ефекти

\`\`\`css
:root { --bg: #fff; --text: #1f2937; color-scheme: light dark; }
[data-theme="dark"] { --bg: #0f172a; --text: #e5e7eb; color-scheme: dark; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --bg: #0f172a; --text: #e5e7eb; }
}
\`\`\`
- компоненти — лише на змінних; тема — їх перевизначення; явний вибір користувача сильніший за системний;
- \`color-scheme\` перефарбовує стандартні елементи й вмикає \`light-dark()\`; синхронний скрипт у \`<head>\` ставить тему до першого кадру (без «спалаху» — FOUC);
- **кольори:** \`oklch()\` — перцептивно рівномірна світлість для палітр; \`color-mix(in oklch, var(--brand), black 15%)\` — відтінки станів;
- **ефекти:** \`filter\` (сам елемент; \`drop-shadow\` за альфа-каналом), \`backdrop-filter\` (фон позаду, потрібна напівпрозорість), \`mix-blend-mode\`; великі blur дорогі; \`filter\` створює containing block для fixed-нащадків.

## Scroll-snap, View Transitions і друк

- **scroll-snap** — карусель без JS: контейнер \`overflow-x: auto; scroll-snap-type: x mandatory\`, слайди \`scroll-snap-align: start\`; \`scroll-behavior: smooth\`, \`overscroll-behavior: contain\`;
- **View Transitions:** \`document.startViewTransition(() => update())\` анімує перехід між станами DOM (\`::view-transition-old/new\`, \`view-transition-name\` для «морфінгу»); між сторінками — \`@view-transition { navigation: auto; }\`; завжди з перевіркою підтримки;
- **друк:** \`@media print\` — приховати навігацію й кнопки, показати URL посилань (\`a[href^="http"]::after { content: " (" attr(href) ")" }\`), \`break-inside: avoid\`, \`@page { margin }\`; перевірка — DevTools → Rendering → Emulate CSS media.

## Типові питання

- **Відносно чого позиціонується absolute?**
- **Чому z-index: 9999 не допомагає?**
- **Що таке BFC і як його створити?**
- **Які властивості дешево анімувати і чому?**
- **CSS-змінні vs змінні Sass?**
- **Як зробити темну тему без «спалаху»?**
- **BEM, CSS Modules, Tailwind — компроміси?**
`});
