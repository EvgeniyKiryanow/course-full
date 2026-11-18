FE.chapter('js-arrays-book', { body: `
Масиви — найуживаніша структура: списки з API, рядки таблиць, елементи меню. Головне — знати, які методи мутують, їхню складність і пастки.

## Створення масивів і length

\`\`\`js
const a = [1, 2, 3];
Array.from({ length: 3 }, (_, i) => i * 2);   // [0, 2, 4]
Array.from('abc');                             // ['a', 'b', 'c']
Array.of(7);                                   // [7]  (а new Array(7) — 7 дірок)
new Array(3).fill(0);                          // [0, 0, 0]
\`\`\`
- \`length\` = найбільший індекс + 1; запис \`arr.length = 0\` очищує масив; запис за межі створює **дірки**;
- \`fill\` з об'єктом заповнює **одним і тим самим** посиланням: \`new Array(3).fill([])\` — три посилання на один масив (використовуйте \`Array.from\` з функцією).

## Перебір і пошук

| Метод | Повертає |
|---|---|
| \`for...of\`, \`for\` з індексом | — (можна \`break\`) |
| \`forEach\` | \`undefined\`, не зупинити (крім винятку) |
| \`find\` / \`findLast\` | елемент або \`undefined\` |
| \`findIndex\` / \`findLastIndex\` | індекс або -1 |
| \`indexOf\` / \`includes\` | індекс / boolean (\`includes\` бачить \`NaN\`) |
| \`some\` / \`every\` | boolean, зупиняються достроково |

\`await\` всередині \`forEach\` не чекає — для послідовних асинхронних дій \`for...of\`.

## map, filter, reduce зсередини

\`\`\`js
Array.prototype.myMap = function (cb, thisArg) {
  const out = new Array(this.length);
  for (let i = 0; i < this.length; i++) if (i in this) out[i] = cb.call(thisArg, this[i], i, this);
  return out;
};
\`\`\`
- \`map\` — новий масив тієї ж довжини; \`filter\` — підмножина; \`reduce(cb, initial)\` — згортка в одне значення;
- **reduce без initial** бере перший елемент як акумулятор і кидає \`TypeError\` на порожньому масиві;
- колбек отримує \`(value, index, array)\`: пастка \`['1', '2', '3'].map(parseInt)\` → \`[1, NaN, NaN]\` (індекс стає основою системи числення);
- дірки пропускаються колбеками \`map/forEach/filter\`, але не \`for\` і не \`Array.from\`;
- ланцюжки \`filter().map()\` створюють проміжні масиви — для великих даних один \`reduce\` або цикл.

## Мутуючі та немутуючі методи

| Мутують | Немутуючі аналоги |
|---|---|
| \`push\`, \`pop\`, \`shift\`, \`unshift\` | спред \`[...a, x]\`, \`slice\` |
| \`splice\` | \`toSpliced\`, \`slice\` + спред |
| \`sort\`, \`reverse\` | \`toSorted\`, \`toReversed\` (ES2023) |
| \`fill\`, \`copyWithin\` | \`with(index, value)\` |

Стан у React/Redux, пропси, дані з кешу — **не мутувати**: інакше порівняння за посиланням не побачить змін. \`shift/unshift\` — O(n) (зсув усіх елементів).

## Сортування

- \`sort()\` без компаратора порівнює **рядки** (UTF-16): \`[10, 9, 1].sort()\` → \`[1, 10, 9]\`;
- компаратор: від'ємне — \`a\` раніше: \`(a, b) => a - b\`; рядки — \`a.localeCompare(b, 'uk')\` або \`Intl.Collator\` (швидше для великих масивів);
- за кількома ключами: \`(a, b) => a.age - b.age || a.name.localeCompare(b.name)\`;
- \`sort\` **стабільний** (ES2019) і мутує; \`toSorted\` — копія;
- компаратор має бути консистентним (не \`() => Math.random() - 0.5\` для перемішування — використовуйте Fisher–Yates).

## at, flat, дірки, array-like

- \`arr.at(-1)\` — останній елемент; \`flat(depth)\`, \`flat(Infinity)\`; \`flatMap\` — map + flat(1) (можна повертати \`[]\` для фільтрації);
- **дірки** (\`[1, , 3]\`, \`delete arr[i]\`) — відсутні елементи; методи обробляють їх по-різному, а рушій оптимізує такі масиви гірше (HOLEY);
- **array-like** — об'єкти з \`length\` і індексами (\`arguments\`, \`NodeList\`, рядок): перетворення — \`Array.from(x)\` або \`[...x]\` (для ітерабельних); \`Array.prototype.slice.call(x)\` — історичний спосіб.

## Розбиття і перестановка: chunk, zip, rotate, windowed

\`\`\`js
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));
const zip = (a, b) => Array.from({ length: Math.min(a.length, b.length) }, (_, i) => [a[i], b[i]]);
const rotate = (a, k) => { const n = a.length; k = ((k % n) + n) % n; return [...a.slice(-k), ...a.slice(0, -k)]; };
const windowed = (a, size) => a.length < size ? [] : Array.from({ length: a.length - size + 1 }, (_, i) => a.slice(i, i + size));
\`\`\`
Застосування: пагінація й пакети запитів (chunk), поєднання колонок (zip), каруселі (rotate), ковзні середні й графіки (windowed). Крайові випадки: порожній масив, \`k > length\`, від'ємні зсуви.

## Дублікати, групування, множини за O(n)

- унікальні: \`[...new Set(arr)]\`; унікальні за ключем — \`Map\` з ключем \`id\` (останній або перший виграє);
- групування: \`Object.groupBy(items, (x) => x.status)\` / \`Map.groupBy\` (ES2024) або \`reduce\`;
- перетин/різниця за O(n): \`const set = new Set(b); a.filter((x) => set.has(x))\` — замість \`includes\` у циклі (O(n·m));
- нові методи \`Set\` (ES2025): \`union\`, \`intersection\`, \`difference\`, \`isSubsetOf\`;
- частоти: \`Map\` + один прохід.

## Типові питання

- **Які методи мутують масив?**
- **Чому [10, 9, 1].sort() дає [1, 10, 9]?**
- **Що виведе ['1','2','3'].map(parseInt)?**
- **Реалізуйте map / filter / reduce.**
- **Як прибрати дублікати і знайти перетин за O(n)?**
- **forEach vs for...of з await?**
- **Що таке array-like і як перетворити на масив?**
`});
