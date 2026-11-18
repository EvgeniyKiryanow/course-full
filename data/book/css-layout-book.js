FE.chapter('css-layout-book', { body: `
Розкладка: Flexbox для одного виміру, Grid для двох, і адаптивність без зайвих медіазапитів.

## Flexbox: осі й вирівнювання

\`display: flex\` — головна вісь задається \`flex-direction\` (\`row\` за замовчуванням, \`column\`, \`*-reverse\`), поперечна — перпендикулярна.
| Властивість | Вісь | Що робить |
|---|---|---|
| \`justify-content\` | головна | розподіл: \`flex-start\`, \`center\`, \`space-between\`, \`space-around\`, \`space-evenly\` |
| \`align-items\` | поперечна | вирівнювання елементів у рядку: \`stretch\` (за замовчуванням), \`center\`, \`flex-start\`, \`baseline\` |
| \`align-content\` | поперечна | розподіл **рядків** (лише при \`flex-wrap: wrap\` і кількох рядках) |
| \`align-self\` | поперечна | для окремого елемента |
| \`gap\` | обидві | відступи між елементами (краще за margin) |

Для \`column\` осі міняються: \`justify-content\` — вертикально. \`margin-left: auto\` у flex «відштовхує» елемент до кінця (кнопка «Вийти» праворуч у шапці).

## Flexbox: розміри елементів

\`flex: <grow> <shrink> <basis>\`:
- \`flex-basis\` — початковий розмір по головній осі (\`auto\` = width/контент);
- \`flex-grow\` — частка **вільного** місця, яку забирає елемент;
- \`flex-shrink\` — як стискається при нестачі (зважено на basis);
- скорочення: \`flex: 1\` = \`1 1 0%\` (рівні частки незалежно від контенту), \`flex: auto\` = \`1 1 auto\`, \`flex: none\` = \`0 0 auto\`.

**Пастка \`min-width: auto\`:** flex-елемент не стискається менше за свій контент — довгий текст чи \`<pre>\` ламають розкладку. Рішення: \`min-width: 0\` (або \`overflow: hidden\`) на елементі.

## Flexbox на практиці

- шапка: лого ліворуч, меню праворуч — \`justify-content: space-between\` або \`margin-left: auto\`;
- картки однакової висоти в рядку — \`align-items: stretch\` (за замовчуванням), кнопка внизу картки — картка \`display: flex; flex-direction: column\` + кнопці \`margin-top: auto\`;
- «липкий» футер — \`body { min-height: 100dvh; display: flex; flex-direction: column }\`, \`main { flex: 1 }\`;
- перенесення тегів — \`flex-wrap: wrap; gap: 8px\`;
- медіа-об'єкт (аватар + текст) — \`display: flex; gap\`, текстові \`min-width: 0\`.

Порядок: \`order\` і \`*-reverse\` змінюють лише візуальний порядок — порядок Tab і скрінрідера лишається з DOM (не ламайте доступність).

## CSS Grid

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));   /* адаптивна сітка без медіазапитів */
  gap: 16px;
}
.layout {
  display: grid;
  grid-template: "header header" auto "nav main" 1fr "footer footer" auto / 240px 1fr;
}
.header { grid-area: header; }
\`\`\`
- \`fr\` — частка вільного простору; \`minmax(min, max)\`; \`repeat()\`;
- \`auto-fill\` створює порожні треки, якщо є місце; \`auto-fit\` схлопує порожні — елементи розтягуються;
- розміщення: \`grid-column: 1 / -1\` (на всю ширину), \`span 2\`, іменовані області;
- \`justify-items/align-items\` — у комірці; \`place-items: center\` — обидва;
- **subgrid**: \`grid-template-columns: subgrid\` — дочірня сітка вирівнюється за лініями батьківської (картки з вирівняними заголовками й кнопками).

**Flex чи Grid:** Flex — одновимірний, від контенту (меню, кнопки, рядки); Grid — двовимірний, від макета (сторінка, галерея, форми з вирівняними колонками). Часто разом.

## Центрування і класичні макети

\`\`\`css
.center-grid { display: grid; place-items: center; }
.center-flex { display: flex; justify-content: center; align-items: center; }
.center-abs  { position: absolute; inset: 0; margin: auto; width: 200px; height: 100px; }
.center-text { text-align: center; }               /* інлайн-контент */
.container   { max-width: 1200px; margin-inline: auto; padding-inline: 16px; }
\`\`\`
Класика: «Holy Grail» (шапка, три колонки, футер) — Grid з областями; сайдбар + контент — \`grid-template-columns: minmax(200px, 25%) 1fr\`; повноширинний блок усередині контейнера — Grid з іменованими лініями (\`[full-start] 1fr [content-start] min(100% - 32px, 1200px) [content-end] 1fr [full-end]\`).

## Адаптивність: media, container queries, clamp

- **mobile-first:** базові стилі для вузьких екранів, розширення через \`@media (min-width: 768px)\` — менше перевизначень;
- **медіа-функції:** \`width\`, \`orientation\`, \`hover: hover\` / \`pointer: coarse\` (сенсорні екрани), \`prefers-color-scheme\`, \`prefers-reduced-motion\`; синтаксис діапазонів \`@media (600px <= width < 900px)\`;
- **container queries** — адаптація до розміру **контейнера**, а не вікна: компонент сам вирішує, як виглядати в сайдбарі чи в основній колонці:
\`\`\`css
.card-wrap { container-type: inline-size; }
@container (min-width: 400px) { .card { display: grid; grid-template-columns: 120px 1fr; } }
\`\`\`
  одиниці \`cqi\`, \`cqw\`;
- **плавні значення:** \`font-size: clamp(1rem, 0.8rem + 1vw, 1.5rem)\`, \`min()\`/\`max()\` для ширин — менше точок перелому;
- **intrinsic layout:** \`auto-fit + minmax\`, \`flex-wrap\`, \`aspect-ratio\` — адаптивність без медіазапитів.

## Типові питання

- **Flex чи Grid — коли що?**
- **Що означає flex: 1?**
- **Чому flex-елемент не стискається і як виправити?**
- **auto-fill vs auto-fit?**
- **Як відцентрувати блок?**
- **Media queries vs container queries?**
- **Що таке mobile-first?**
`});
