FE.topic('dom', {
  intro: `
**DOM (Document Object Model)** — живе дерево об'єктів, яке браузер будує з HTML. JS читає й змінює саме його, а не HTML-текст.

## Типи вузлів (nodeType)

| Константа | nodeType | Приклад |
|---|---|---|
| \`ELEMENT_NODE\` | 1 | \`<div>\` |
| \`TEXT_NODE\` | 3 | текст, **включно з пробілами/переносами між тегами** |
| \`COMMENT_NODE\` | 8 | \`<!-- -->\` |
| \`DOCUMENT_NODE\` | 9 | \`document\` |
| \`DOCUMENT_FRAGMENT_NODE\` | 11 | \`DocumentFragment\`, \`template.content\` |

## Пошук

| Метод | Повертає | Живий? |
|---|---|---|
| \`getElementById\` | елемент / \`null\` | — |
| \`querySelector\` | перший елемент / \`null\` | — |
| \`querySelectorAll\` | \`NodeList\` (є \`forEach\`) | **статичний** |
| \`getElementsByClassName/TagName\` | \`HTMLCollection\` (немає \`forEach\`) | **живий** |
| \`childNodes\` | \`NodeList\` | живий |

## Обхід

- \`parentNode\` (може бути \`document\`/fragment) vs \`parentElement\` (лише елемент або \`null\`).
- \`childNodes\` / \`firstChild\` / \`nextSibling\` — **усі** вузли; \`children\` / \`firstElementChild\` / \`nextElementSibling\` — лише елементи.
- \`el.closest(sel)\` — найближчий предок **включно з самим el**; \`el.matches(sel)\`; \`a.contains(b)\` (\`a.contains(a) === true\`).

## Створення та вставка

\`\`\`js
const li = document.createElement('li');
li.textContent = name;                  // безпечно
list.append(li, 'текст');               // кілька вузлів/рядків, нічого не повертає
list.appendChild(li);                   // один вузол, повертає його
el.before(x); el.after(x); el.replaceWith(x); el.remove();
el.insertAdjacentHTML('beforeend', html); // beforebegin | afterbegin | beforeend | afterend
el.cloneNode(true);                      // глибока копія БЕЗ обробників addEventListener
\`\`\`

Вставка вже існуючого вузла **переміщує** його. Багато вставок — через \`DocumentFragment\` або \`append(...nodes)\`.

## Вміст

- \`innerHTML\` — парсить HTML → ризик **XSS**, знищує вузли (і їх обробники) при \`+=\`.
- \`textContent\` — сирий текст усіх вузлів, швидкий, без layout.
- \`innerText\` — «видимий» текст з урахуванням CSS → викликає **reflow**.

## Атрибути vs властивості

- Атрибут — те, що в HTML (\`getAttribute\`); властивість — поле DOM-об'єкта.
- \`input.value\` — поточне значення; \`getAttribute('value')\` / \`defaultValue\` — початкове.
- \`a.href\` — абсолютний URL; \`getAttribute('href')\` — як написано.
- \`data-user-id\` → \`el.dataset.userId\` (завжди рядок). \`classList.add/remove/toggle/contains/replace\`.
- \`el.style\` — лише **inline**-стилі; \`getComputedStyle(el)\` — підсумкові (read-only, може спричинити layout).

## Розміри

| Властивість | Що включає |
|---|---|
| \`offsetWidth/Height\` | content + padding + border (+ scrollbar) |
| \`clientWidth/Height\` | content + padding − scrollbar |
| \`scrollWidth/Height\` | увесь вміст, включно з прихованим |
| \`scrollTop\` | скільки прокручено (можна писати) |
| \`getBoundingClientRect()\` | дробові координати відносно viewport, з урахуванням transform |

## Пастки

- Цикл по **живій** колекції з видаленням — пропуск елементів.
- \`innerHTML += ...\` — перестворює всіх нащадків.
- Читання розмірів після запису стилів у циклі — layout thrashing.
- \`MutationObserver\` викликається асинхронно (мікрозадача), пачкою записів.
`,
  groups: [
    { id: 'tree', title: 'DOM-дерево і пошук елементів' },
    { id: 'traverse', title: 'Обхід дерева' },
    { id: 'create', title: 'Створення, вставка, видалення вузлів' },
    { id: 'content', title: 'Вміст: innerHTML vs textContent' },
    { id: 'attrs', title: 'Атрибути, властивості, класи, стилі' },
    { id: 'batch', title: 'Пакетні вставки: fragment і template' },
    { id: 'sizes', title: 'Розміри, прокрутка і координати' },
    { id: 'advanced', title: 'MutationObserver, серіалізація, keyed-оновлення' },
    { id: 'selection', title: 'Виділення тексту: Selection і Range' }
  ],
  items: [
    // ---------------------------------------------------------------- DOM-дерево і пошук елементів
    {
      id: 'dom-theory-what-is-dom',
      group: 'tree',
      type: 'theory',
      level: 1,
      interview: true,
      title: 'Що таке DOM і які бувають вузли',
      tags: ['dom-tree', 'nodes'],
      question: 'Що таке DOM? Чим DOM відрізняється від HTML-коду сторінки? Які типи вузлів ви знаєте? Оберіть **усі** правильні твердження.',
      choices: [
        "DOM — дерево об'єктів з API, яке браузер будує з HTML; JS працює з ним, а не з текстом розмітки",
        'DOM завжди збігається з вихідним HTML: DevTools → Elements показує те саме, що «View source»',
        'Пробіли й переноси між тегами стають текстовими вузлами (`nodeType` 3), тож `firstChild` часто не елемент',
        '`childNodes` і `children` повертають однаковий набір — обидва містять лише вузли-елементи',
        'Браузер виправляє невалідну розмітку (дописує `<tbody>`, закриває теги), тому DOM може відрізнятися від HTML'
      ],
      correct: [0, 2, 4],
      why: [
        "Правильно: DOM — живе дерево об'єктів з API; JS, CSS і рендеринг працюють з ним, а не з текстом.",
        'Хибно: View source — вихідний HTML, а Elements — поточний DOM після виправлень і змін з JS.',
        'Правильно: пробіли й переноси між тегами — текстові вузли, тому для елементів беруть firstElementChild.',
        'Хибно: childNodes містить усі вузли (текст, коментарі), children — лише елементи.',
        'Правильно: парсер виправляє розмітку, тож DOM може відрізнятися від HTML.'
      ],
      hint: "Дерево об'єктів, nodeType, текстові вузли між тегами.",
      answer: `
**DOM** — дерево вузлів і API до нього, яке браузер будує з HTML.

**DOM ≠ HTML:** браузер виправляє розмітку (\`<tbody>\`, незакриті теги); JS змінює DOM у рантаймі (View source — вихідний HTML, Elements — поточний DOM).

**Типи вузлів** (\`nodeType\`): \`1\` Element, \`3\` Text (включно з пробілами між тегами), \`8\` Comment, \`9\` Document, \`11\` DocumentFragment.

Ієрархія: \`EventTarget → Node → Element → HTMLElement → HTMLInputElement\` — тому в будь-якого вузла є \`addEventListener\`, а в input — \`value\`.

\`\`\`js
document.body.firstChild.nodeType; // часто 3 — перенос рядка
\`\`\`
`,
      keyPoints: [
        "DOM — дерево об'єктів + API, яке браузер будує з HTML",
        'DOM може відрізнятися від вихідного HTML (виправлення розмітки, зміни з JS)',
        'Основні типи вузлів: Element (1), Text (3), Comment (8), Document (9), DocumentFragment (11)',
        'Пробіли між тегами — це текстові вузли',
        'Ієрархія EventTarget → Node → Element → HTMLElement'
      ],
      followUps: ['Чим відрізняється Node від Element?', 'Що таке Shadow DOM?', 'Чому браузер додає <tbody> у таблицю?']
    },
    {
      id: 'dom-quiz-childnodes',
      group: 'tree',
      type: 'quiz',
      level: 2,
      title: 'childNodes vs children',
      tags: ['nodes', 'traversal'],
      question: `
Що виведе код?

\`\`\`html
<ul id="list">
  <li>A</li>
  <li>B</li>
</ul>
\`\`\`

\`\`\`js
const list = document.getElementById('list');
console.log(list.childNodes.length, list.children.length);
\`\`\`
`,
      options: ['`2 2`', '`5 2`', '`3 2`', '`4 2`'],
      answer: 1,
      why: [
        'Хибно: пробіли й переноси між тегами в DOM зберігаються як текстові вузли.',
        'Правильно: 3 текстові вузли (перед, між, після li) + 2 li = 5; children — лише 2 елементи.',
        'Хибно: забули один із текстових вузлів — їх три, а не один.',
        'Хибно: забули початковий або кінцевий перенос рядка.'
      ],
      hint: 'Що знаходиться між `<ul>` і першим `<li>`, між двома `<li>` і після останнього?',
      explanation: `
\`childNodes\`: текст \`"\\n  "\` → \`<li>A</li>\` → текст → \`<li>B</li>\` → текст \`"\\n"\` = **5**. \`children\` — лише елементи = **2**.

Для обходу елементів беріть \`children\`, \`firstElementChild\`, \`nextElementSibling\`.
`
    },
    {
      id: 'dom-quiz-query-missing',
      group: 'tree',
      type: 'quiz',
      level: 1,
      title: 'Що повертають методи пошуку',
      tags: ['selectors'],
      question: 'Оберіть **усі** правильні твердження:',
      options: [
        '`querySelector` повертає `null`, якщо нічого не знайдено',
        '`querySelectorAll` повертає порожній `NodeList`, якщо нічого не знайдено',
        '`getElementById` повертає `undefined`, якщо елемента немає',
        '`getElementsByClassName` повертає живу `HTMLCollection`',
        'У результату `querySelectorAll` є метод `forEach`',
        'У `HTMLCollection` є метод `forEach`'
      ],
      answer: [0, 1, 3, 4],
      why: [
        'Правильно: методи пошуку одного елемента повертають null.',
        'Правильно: querySelectorAll завжди повертає NodeList, можливо порожній — перевіряти на null не треба.',
        'Хибно: getElementById повертає null, а не undefined.',
        'Правильно: getElementsBy* повертають живу HTMLCollection.',
        'Правильно: у NodeList є forEach.',
        'Хибно: у HTMLCollection forEach немає — потрібно Array.from або for...of.'
      ],
      hint: 'Методи, які шукають один елемент, і методи, які шукають багато, поводяться по-різному при відсутності результату.',
      explanation: `
\`document.querySelector('.x').classList\` при відсутності елемента дасть \`TypeError\` — перевіряйте результат або пишіть \`?.\`. Для \`HTMLCollection\`: \`[...coll].forEach(...)\` або \`for (const el of coll)\`.
`
    },
    {
      id: 'dom-theory-selectors',
      group: 'tree',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'getElementById vs querySelector vs getElementsBy*',
      tags: ['selectors', 'live-collection'],
      question: 'Чим відрізняються getElementById, querySelector(All) та getElementsByClassName/TagName? Що таке «жива» колекція і чим вона небезпечна?',
      choices: [
        '`querySelectorAll` повертає живий `NodeList`, а `getElementsByClassName` — статичний знімок на момент виклику',
        '`getElementsBy*` дають живу `HTMLCollection`: якщо в циклі по ній прибирати клас, індекси зсуваються й елементи пропускаються',
        'Живими є всі колекції пошуку, а методи відрізняються лише швидкістю — `getElementById` найшвидший',
        "Жива колекція небезпечна лише витоком пам'яті: вона назавжди тримає посилання на видалені з DOM вузли",
        '`querySelector` повертає порожній `NodeList`, якщо нічого не знайдено, а `getElementById` — `undefined`'
      ],
      correct: 1,
      why: [
        'Хибно: навпаки — querySelectorAll дає статичний знімок, getElementsByClassName — живу колекцію.',
        'Правильно: жива колекція оновлюється під час циклу, і елементи пропускаються.',
        'Хибно: querySelectorAll статичний; живі лише getElementsBy* і childNodes.',
        "Хибно: головна небезпека — зміна колекції під час ітерації, а не пам'ять.",
        'Хибно: querySelector повертає null, getElementById — теж null.'
      ],
      hint: 'Подумайте про тип результату, живість, швидкість і область пошуку.',
      answer: `
| Метод | Результат | Живий |
|---|---|---|
| \`getElementById(id)\` | елемент / \`null\` | — |
| \`querySelector(css)\` | перший збіг / \`null\` | — |
| \`querySelectorAll(css)\` | \`NodeList\` | статичний |
| \`getElementsByClassName/TagName\` | \`HTMLCollection\` | **живий** |

**Жива колекція** відображає поточний DOM: прибрали клас — елемент зник з колекції.

\`\`\`js
const live = document.getElementsByClassName('item'); // 3
const stat = document.querySelectorAll('.item');      // 3
// додали ще один .item
live.length; // 4
stat.length; // 3
\`\`\`

**Пастка:** цикл з видаленням по живій колекції пропускає елементи. Рішення — \`[...live]\`, цикл з кінця або \`querySelectorAll\`.

**Нюанс:** \`el.querySelectorAll('div span')\` матчить селектор відносно всього документа; лише прямі діти — \`:scope > li\`.
`,
      keyPoints: [
        'querySelector/getElementById повертають null, querySelectorAll — NodeList (може бути порожній)',
        'getElementsBy* — живі HTMLCollection, querySelectorAll — статичний NodeList',
        'Пастка циклу з видаленням по живій колекції',
        'HTMLCollection не має forEach — Array.from / for...of',
        ':scope і контекст селектора в el.querySelector'
      ],
      followUps: [
        'Чи є childNodes живою колекцією?',
        'Як знайти лише прямих нащадків?',
        'Що швидше: getElementById чи querySelector("#id")?'
      ]
    },
    {
      id: 'dom-quiz-live-collection',
      group: 'tree',
      type: 'quiz',
      level: 3,
      interview: true,
      title: 'Видалення класу в циклі по живій колекції',
      tags: ['live-collection', 'selectors'],
      question: `
На сторінці 4 елементи з класом \`item\`. Що виведе код?

\`\`\`js
const items = document.getElementsByClassName('item');
for (let i = 0; i < items.length; i++) {
  items[i].classList.remove('item');
}
console.log(document.getElementsByClassName('item').length);
\`\`\`
`,
      options: ['`0`', '`4`', '`2`', '`TypeError`'],
      answer: 2,
      why: [
        'Хибно: так було б зі статичним querySelectorAll або [...items].',
        'Хибно: колекція оновлюється, і цикл таки прибирає клас у частини елементів.',
        'Правильно: колекція «зсувається» — B і D пропущено, клас лишився у двох.',
        'Хибно: звернень за межі немає — цикл просто закінчується раніше.'
      ],
      hint: 'Що відбувається з `items.length` і індексами після того, як перший елемент втрачає клас?',
      explanation: `
Елементи A, B, C, D:
1. \`i=0\`: A втрачає клас → \`[B, C, D]\`.
2. \`i=1\`: \`items[1]\` — це C (B пропущено) → \`[B, D]\`.
3. \`i=2\`: \`2 < 2\` — кінець. Клас у B і D → **2**.

**Виправлення:** \`for (const el of [...items])\` або цикл з кінця.
`
    },
    {
      id: 'dom-quiz-closest-matches',
      group: 'tree',
      type: 'quiz',
      level: 2,
      title: 'closest, matches, contains',
      tags: ['traversal'],
      question: `
Що виведе код?

\`\`\`html
<div class="card" id="c">
  <p class="text"><span id="s">hi</span></p>
</div>
\`\`\`

\`\`\`js
const s = document.getElementById('s');
const c = document.getElementById('c');
console.log(
  s.closest('span') === s,
  s.closest('.card').id,
  s.matches('.card span'),
  c.contains(c)
);
\`\`\`
`,
      options: ['`false c true false`', '`true c false true`', '`false c false false`', '`true c true true`'],
      answer: 3,
      why: [
        'Хибно: closest перевіряє і сам елемент, а contains(c) для самого вузла — true.',
        'Хибно: matches враховує предків у складному селекторі — .card span збігається.',
        'Хибно: closest починає з самого елемента, а вузол містить сам себе.',
        'Правильно: closest включає сам елемент, matches враховує контекст документа, contains(self) — true.'
      ],
      hint: 'Чи перевіряє `closest` сам елемент? Чи `matches` враховує предків у складному селекторі?',
      explanation: `
- \`closest\` починає з **самого** елемента, потім іде вгору.
- \`matches('.card span')\` перевіряє селектор у контексті всього документа.
- \`a.contains(a) === true\` — вузол «містить» сам себе.

Практика: «клік поза меню» — \`!menu.contains(e.target)\`; кнопка з іконкою — \`e.target.closest('button')\`.
`
    },
    // ---------------------------------------------------------------- Обхід дерева
    {
      id: 'dom-traversal-helpers',
      group: 'traverse',
      type: 'dom',
      level: 2,
      title: 'Хелпери обходу: siblings, ancestors, index',
      tags: ['traversal'],
      description: `
**Завдання.** Напишіть три хелпери обходу DOM, які працюють лише з **елементами** (текстові вузли й коментарі ігноруються).

**Де трапляється:** хлібні крихти (усі предки), «активний пункт меню — який він за номером», підсвітити сусідні картки. На співбесідах перевіряють різницю \`children\` vs \`childNodes\`.

**Дано (HTML)**
- \`<nav id="nav">\` → \`<ul id="menu">\` → три \`<li>\` (A, \`#b\`, C) і коментар між ними;
- у \`#b\` є \`<span id="deep">\`.

**Що написати**
- \`getSiblings(el)\` → масив елементів-сусідів (без самого \`el\`) у порядку документа;
- \`getAncestors(el, stop)\` → масив предків від найближчого вгору; \`stop\` не включається; без \`stop\` — до \`<html>\` включно;
- \`getIndex(el)\` → індекс серед елементів батька або \`-1\`, якщо батька немає.

**Приклад**
\`\`\`js
const b = document.getElementById('b');
getSiblings(b).map((x) => x.textContent); // ['A', 'C']
getIndex(b);                              // 1
getAncestors(b, document.body);           // [ul#menu, nav#nav]
\`\`\`

**Як це працює:** є дві «навігації»: по всіх вузлах (\`childNodes\`, \`nextSibling\`, \`parentNode\`) і лише по елементах (\`children\`, \`previousElementSibling\`, \`parentElement\`). Друга сама відкидає пробіли й коментарі. У \`<html>\` \`parentElement === null\` — природна зупинка циклу.

**Врахуйте:** єдина дитина → \`[]\`; елемент без батька → \`-1\`.
`,
      html: `<nav id="nav">
  <ul id="menu">
    <li>A</li>
    <!-- коментар -->
    <li id="b">B <span id="deep">!</span></li>
    <li>C</li>
  </ul>
</nav>`,
      css: '',
      js: `function getSiblings(el) {
  // 1. TODO: якщо немає el.parentElement — []
  // 2. TODO: Array.from(parent.children) без самого el
}

function getAncestors(el, stop) {
  // 3. TODO: node = el.parentElement; поки node && node !== stop — додати й піднятися
}

function getIndex(el) {
  // 4. TODO: без батька — -1; інакше порахувати previousElementSibling
}

// Спробуйте в консолі: getSiblings(document.getElementById('b'))
`,
      editable: ['js'],
      solution: {
        js: `function getSiblings(el) {
  if (!el.parentElement) return [];
  // children — лише елементи, тож текстові вузли й коментарі відсіюються автоматично
  return Array.from(el.parentElement.children).filter((x) => x !== el);
}

function getAncestors(el, stop) {
  const result = [];
  let node = el.parentElement;
  while (node && node !== stop) {
    result.push(node);
    node = node.parentElement; // у <html> parentElement === null — цикл завершиться
  }
  return result;
}

function getIndex(el) {
  if (!el.parentElement) return -1;
  let i = 0;
  let node = el;
  while ((node = node.previousElementSibling)) i++;
  return i;
}
`
      },
      hints: [
        'Використовуйте властивості, які працюють лише з елементами: `children`, `parentElement`, `previousElementSibling`.',
        'Для предків — цикл `while (node && node !== stop)` з `node = node.parentElement`. У `<html>` `parentElement` дорівнює `null`.',
        'Індекс — порахуйте, скільки разів можна перейти на `previousElementSibling`, або `Array.prototype.indexOf.call(parent.children, el)`.'
      ],
      tests: [
        { name: 'getSiblings повертає лише елементи-сусіди', code: `const b = document.getElementById('b');
const s = getSiblings(b);
expect(Array.isArray(s)).toBe(true);
expect(s.map((x) => x.textContent)).toEqual(['A', 'C']);` },
        { name: 'getSiblings для єдиної дитини → []', code: "expect(getSiblings(document.getElementById('deep'))).toEqual([]);" },
        { name: 'getAncestors зі stop не включає stop', code: `const r = getAncestors(document.getElementById('deep'), document.body);
expect(r.map((x) => x.id || x.tagName)).toEqual(['b', 'menu', 'nav']);` },
        { name: 'getAncestors без stop доходить до <html>', code: `const r = getAncestors(document.getElementById('menu'));
expect(r.map((x) => x.tagName)).toEqual(['NAV', 'BODY', 'HTML']);` },
        { name: 'getIndex ігнорує текстові вузли й коментарі', code: `const lis = document.querySelectorAll('#menu > li');
expect(getIndex(lis[0])).toBe(0);
expect(getIndex(lis[1])).toBe(1);
expect(getIndex(lis[2])).toBe(2);` },
        { name: 'getIndex для відʼєднаного елемента → -1', code: "expect(getIndex(document.createElement('div'))).toBe(-1);" }
      ],
      explanation: `
Ключ — розрізняти навігацію **по всіх вузлах** (\`childNodes\`, \`nextSibling\`, \`parentNode\`) і **лише по елементах** (\`children\`, \`nextElementSibling\`, \`parentElement\`). Друга група сама відкидає текстові вузли з пробілами та коментарі.

- \`getSiblings\`: O(k), де k — кількість дітей батька.
- \`getAncestors\`: O(h), h — глибина вузла.
- \`getIndex\`: O(k). Альтернатива — \`[...el.parentElement.children].indexOf(el)\` (створює масив).

**\`parentNode\` vs \`parentElement\`:** у \`<html>\` \`parentNode === document\`, а \`parentElement === null\`. Тому цикл по \`parentElement\` природно зупиняється на \`<html>\`, а по \`parentNode\` — дійшов би до \`document\` (у якого немає \`tagName\`).

**Типові помилки:** \`nextSibling\` замість \`nextElementSibling\` (потрапляють текстові вузли), \`childNodes.indexOf\` (у \`NodeList\` немає \`indexOf\`), включення самого \`stop\`.

**Що можуть спитати далі:** як знайти найближчого спільного предка двох вузлів? Як реалізувати \`getAncestors\` через \`closest\`? Що поверне \`parentElement\` для елемента у \`DocumentFragment\`?
`
    },
    {
      id: 'dom-count-depth',
      group: 'traverse',
      type: 'dom',
      level: 2,
      title: 'Рекурсивний обхід: кількість елементів і глибина',
      tags: ['traversal', 'recursion'],
      description: `
**Завдання.** Порахуйте кількість елементів і максимальну глибину піддерева рекурсивним обходом — без \`querySelectorAll\`/\`getElementsByTagName\`.

**Де трапляється:** класика співбесід «обійди DOM-дерево»; той самий DFS потрібен для дерева коментарів, меню, файлового дерева.

**Дано (HTML):** \`<div id="app">\` з \`header > h1\`, \`main > p > b > i\` і коментарем.

**Що написати**
- \`countElements(root)\` → число елементів у піддереві, включно з \`root\`;
- \`maxDepth(root)\` → глибина в елементах: \`root\` без дочірніх елементів = \`1\`.

**Приклад**
\`\`\`js
// <div><p><b>x</b></p><span></span></div>
countElements(div); // 4
maxDepth(div);      // 3 (div → p → b)
\`\`\`

**Як це працює:** \`root.children\` дає лише елементи. Рекурсія: результат вузла = 1 (він сам) + сума (або максимум) результатів дітей. Лист — базовий випадок.

**Врахуйте:** текст і коментарі не рахуються; дерево може мати 200 рівнів.
`,
      html: `<div id="app">
  <header><h1>Title</h1></header>
  <main>
    <p>Text <b>bold <i>it</i></b></p>
    <!-- comment -->
  </main>
</div>`,
      css: '',
      js: `function countElements(root) {
  // 1. TODO: count = 1 (сам root)
  // 2. TODO: для кожного child з root.children додати countElements(child)
}

function maxDepth(root) {
  // 3. TODO: deepest = максимум maxDepth(child) серед дітей (0, якщо дітей немає)
  // 4. TODO: повернути deepest + 1
}

// Спробуйте: countElements(document.getElementById('app'))
`,
      editable: ['js'],
      solution: {
        js: `function countElements(root) {
  let count = 1; // сам root
  for (const child of root.children) count += countElements(child);
  return count;
}

function maxDepth(root) {
  let deepest = 0;
  for (const child of root.children) deepest = Math.max(deepest, maxDepth(child));
  return deepest + 1;
}
`
      },
      hints: [
        'Базовий випадок: елемент без дочірніх елементів — це 1 елемент і глибина 1.',
        'Рекурсія по `root.children` (лише елементи!): `count = 1 + сума(countElements(child))`, `depth = 1 + max(maxDepth(child))`.'
      ],
      tests: [
        { name: 'рахує елементи #app', code: `const ORIG = Element.prototype.querySelectorAll;
const ORIG2 = Element.prototype.getElementsByTagName;
Element.prototype.querySelectorAll = Element.prototype.getElementsByTagName = () => { throw new Error('не використовуйте querySelectorAll / getElementsByTagName'); };
try {
  expect(countElements(document.getElementById('app'))).toBe(7);
} finally {
  Element.prototype.querySelectorAll = ORIG;
  Element.prototype.getElementsByTagName = ORIG2;
}` },
        { name: 'глибина #app', code: "expect(maxDepth(document.getElementById('app'))).toBe(5);" },
        { name: 'одиночний елемент: 1 і 1', code: `const el = document.createElement('div');
el.textContent = 'only text';
expect(countElements(el)).toBe(1);
expect(maxDepth(el)).toBe(1);` },
        { name: 'глибоке дерево (200 рівнів)', code: `const root = document.createElement('div');
let cur = root;
for (let i = 0; i < 199; i++) { const d = document.createElement('div'); cur.append(d, document.createElement('span')); cur = d; }
expect(maxDepth(root)).toBe(200);
expect(countElements(root)).toBe(1 + 199 * 2);` }
      ],
      explanation: `
DFS: кожен вузол відвідується раз → **O(n)**, пам'ять **O(h)** на стек викликів.

Ітеративно зі стеком (без ризику переповнення):
\`\`\`js
const stack = [root];
while (stack.length) { const el = stack.pop(); count++; stack.push(...el.children); }
\`\`\`

**Типові помилки:** обхід \`childNodes\` (рахуються текст і коментарі); забутий сам \`root\`; 0 для листа.

**Що спитають далі:** BFS і кількість елементів на кожному рівні? Що таке TreeWalker?
`
    },
    {
      id: 'dom-closest-polyfill',
      group: 'traverse',
      type: 'dom',
      level: 3,
      title: 'Поліфіл closest',
      tags: ['traversal', 'polyfill'],
      description: `
**Завдання.** Напишіть \`myClosest(el, selector)\` — аналог \`el.closest(selector)\` без вбудованого \`closest\`.

**Де трапляється:** класичний поліфіл на співбесідах; сам \`closest\` — основа делегування подій (\`e.target.closest('button')\`).

**Дано (HTML):** \`section.wrap > div.card[data-id="7"] > p.text > span#target\`.

**Що написати**
- \`myClosest(el, selector)\` → перший елемент, починаючи з **самого** \`el\` і вгору, що відповідає \`selector\`, або \`null\`.

**Приклад**
\`\`\`js
const t = document.getElementById('target');
myClosest(t, '.card'); // div.card
myClosest(t, 'span');  // сам t
myClosest(t, '.nope'); // null
\`\`\`

**Як це працює:** \`el.matches(selector)\` перевіряє один елемент. Ідемо вгору по \`parentNode\`, поки вузол — елемент (\`nodeType === 1\`): вище \`<html>\` стоїть \`document\`, у fragment — сам fragment, і в них немає \`matches\`.

**Врахуйте:** складні селектори (\`.wrap > .card\`); елемент у \`DocumentFragment\` не має падати.
`,
      html: `<section class="wrap">
  <div class="card" data-id="7">
    <p class="text"><span id="target">click</span></p>
  </div>
</section>`,
      css: '',
      js: `function myClosest(el, selector) {
  // 1. TODO: let node = el (починаємо з самого елемента!)
  // 2. TODO: поки node && node.nodeType === Node.ELEMENT_NODE:
  //          якщо node.matches(selector) — повернути node; інакше node = node.parentNode
  // 3. TODO: повернути null
}

// Спробуйте: myClosest(document.getElementById('target'), '.card')
`,
      editable: ['js'],
      solution: {
        js: `function myClosest(el, selector) {
  let node = el;
  // nodeType === 1 відсіює document (9) і fragment (11), де matches недоступний
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    if (node.matches(selector)) return node;
    node = node.parentNode;
  }
  return null;
}
`
      },
      hints: [
        'Знадобиться `el.matches(selector)` — перевірка, чи відповідає елемент селектору.',
        'Цикл: поки поточний вузол — елемент (`nodeType === 1`), перевіряйте `matches`, інакше переходьте до `parentNode`.',
        'Не забудьте почати з самого `el`, а не з `el.parentElement`.'
      ],
      tests: [
        { name: 'знаходить предка (без вбудованого closest)', code: `const ORIG = Element.prototype.closest;
Element.prototype.closest = function () { throw new Error('не використовуйте вбудований closest'); };
try {
  const t = document.getElementById('target');
  expect(myClosest(t, '.card').dataset.id).toBe('7');
  expect(myClosest(t, 'section')).toBe(document.querySelector('.wrap'));
} finally {
  Element.prototype.closest = ORIG;
}` },
        { name: 'включає сам елемент', code: `const t = document.getElementById('target');
expect(myClosest(t, 'span')).toBe(t);
expect(myClosest(t, '#target')).toBe(t);` },
        { name: 'повертає null, якщо нічого немає', code: "expect(myClosest(document.getElementById('target'), '.nope')).toBeNull();" },
        { name: 'складні селектори', code: `const t = document.getElementById('target');
expect(myClosest(t, '.wrap > .card').dataset.id).toBe('7');
expect(myClosest(t, 'div[data-id="7"]')).toBe(document.querySelector('.card'));` },
        { name: 'працює у DocumentFragment і не падає на ньому', code: `const frag = document.createDocumentFragment();
const div = document.createElement('div');
div.className = 'x';
div.innerHTML = '<b><i>t</i></b>';
frag.append(div);
const i = frag.querySelector('i');
expect(myClosest(i, '.x')).toBe(div);
expect(myClosest(i, '.missing')).toBeNull();` }
      ],
      explanation: `
Складність **O(h)** перевірок \`matches\`. Альтернатива — ходити по \`parentElement\`: він стає \`null\` і на \`document\`, і на fragment.

**Типові помилки:** почати з \`parentElement\` (сам елемент не перевіряється); не зупинитися на \`document\` (\`TypeError\`); порівнювати \`tagName\` замість \`matches\`.

**Що спитають далі:** як обмежити пошук контейнером \`root\`? Поліфіл \`matches\` через \`querySelectorAll\`?
`
    },
    {
      id: 'dom-find-by-class',
      group: 'traverse',
      type: 'dom',
      level: 3,
      title: 'Свій getElementsByClassName через обхід дерева',
      tags: ['traversal', 'recursion', 'polyfill'],
      description: `
**Завдання.** Напишіть \`findByClass(root, classNames)\` — аналог \`root.getElementsByClassName(classNames)\` через обхід дерева.

**Де трапляється:** класика співбесід (реалізуй вбудований метод); перевіряє обхід дерева і роботу з \`classList\`.

**Дано (HTML):** \`#root\` з кнопками й вкладеними елементами з класами \`btn\`, \`primary\`, \`large\` і пасткою \`btn-primary\`.

**Що написати**
- \`findByClass(root, classNames)\` → масив **нащадків** \`root\` (без самого \`root\`), що мають **усі** класи з рядка, у порядку документа. Порожній рядок → \`[]\`.

Заборонено: \`querySelector(All)\`, \`getElementsByClassName\`, \`matches\`, \`closest\`.

**Приклад**
\`\`\`js
const root = document.getElementById('root');
findByClass(root, 'btn').map((el) => el.id);         // ['a', 'b', 'c', 'd']
findByClass(root, 'primary btn').map((el) => el.id); // ['a', 'c', 'd']
findByClass(root, '  btn   large ');                 // [span#c]
\`\`\`

**Як це працює:** рекурсивний \`walk(node)\` іде по \`node.children\`: спочатку перевіряє дитину, потім спускається в неї (pre-order) — це і є порядок документа.

**Врахуйте:** зайві пробіли в рядку; \`'btn-primary'.includes('btn')\` — хибний збіг, тому \`classList.contains\`.
`,
      html: `<div id="root" class="btn">
  <button class="btn primary" id="a">A</button>
  <div class="group">
    <button class="btn" id="b">B</button>
    <span class="primary btn large" id="c">C<i class="btn primary" id="d">D</i></span>
  </div>
  <button class="btn-primary" id="e">E</button>
</div>`,
      css: '',
      js: `function findByClass(root, classNames) {
  // 1. TODO: wanted = classNames.split(/\\s+/).filter(Boolean); порожньо — []
  const result = [];

  function walk(node) {
    // 2. TODO: для кожного child з node.children:
    //          якщо child має всі класи (every + classList.contains) — result.push(child)
    //          потім walk(child)
  }

  // 3. TODO: walk(root) і повернути result
}

// Спробуйте: findByClass(document.getElementById('root'), 'primary btn')
`,
      editable: ['js'],
      solution: {
        js: `function findByClass(root, classNames) {
  const wanted = classNames.split(/\\s+/).filter(Boolean);
  if (!wanted.length) return [];
  const result = [];
  (function walk(node) {
    for (const child of node.children) {
      // pre-order: спочатку сам елемент, потім його нащадки
      if (wanted.every((c) => child.classList.contains(c))) result.push(child);
      walk(child);
    }
  })(root);
  return result;
}
`
      },
      hints: [
        'Розбийте рядок класів: `classNames.split(/\\s+/).filter(Boolean)` — так прибираються зайві пробіли.',
        'Рекурсивна функція `walk(node)` проходить `node.children`; для кожної дитини спочатку перевіряє класи, потім заходить у неї (pre-order = порядок документа).',
        'Перевірка «усі класи»: `wanted.every(c => el.classList.contains(c))`. Не порівнюйте `className` через `includes` — `"btn-primary".includes("btn")` дасть хибний збіг.'
      ],
      tests: [
        { name: 'один клас, порядок документа, без root (без заборонених API)', code: `const saved = [];
function ban(proto, name) { saved.push([proto, name, proto[name]]); proto[name] = function () { throw new Error(name + ' заборонено'); }; }
ban(Element.prototype, 'querySelectorAll'); ban(Element.prototype, 'querySelector');
ban(Element.prototype, 'getElementsByClassName'); ban(Element.prototype, 'matches'); ban(Element.prototype, 'closest');
let ids;
try {
  ids = findByClass(document.getElementById('root'), 'btn').map((el) => el.id);
} finally {
  saved.forEach(([p, n, f]) => { p[n] = f; });
}
expect(ids).toEqual(['a', 'b', 'c', 'd']);` },
        { name: 'кілька класів — потрібні всі', code: `const ids = findByClass(document.getElementById('root'), 'primary btn').map((el) => el.id);
expect(ids).toEqual(['a', 'c', 'd']);` },
        { name: 'зайві пробіли в рядку класів', code: `const ids = findByClass(document.getElementById('root'), '  btn   large ').map((el) => el.id);
expect(ids).toEqual(['c']);` },
        { name: 'не плутає btn-primary з btn', code: `const ids = findByClass(document.getElementById('root'), 'btn-primary').map((el) => el.id);
expect(ids).toEqual(['e']);` },
        { name: 'порожній рядок і відсутній клас → []', code: `const root = document.getElementById('root');
expect(findByClass(root, '')).toEqual([]);
expect(findByClass(root, 'nope')).toEqual([]);` },
        { name: 'збігається з вбудованим на великому дереві', code: `const box = document.createElement('div');
for (let i = 0; i < 300; i++) { const d = document.createElement('div'); d.className = i % 3 ? 'x' : 'x y'; d.innerHTML = '<span class="y"></span>'; box.append(d); }
const mine = findByClass(box, 'y');
const native = Array.from(box.getElementsByClassName('y'));
expect(mine.length).toBe(native.length);
expect(mine.every((el, i) => el === native[i])).toBe(true);` }
      ],
      explanation: `
Pre-order DFS дає порядок документа, як і вбудований метод. Складність **O(n · k)** (k — кількість шуканих класів).

**Відмінність від вбудованого:** той повертає **живу** колекцію, наш — статичний масив.

**Типові помилки:** \`className.includes\` (хибні збіги); включити сам \`root\`; не прибрати порожні рядки після \`split\`.

**Що спитають далі:** як реалізувати \`getElementsByTagName('*')\`? Ітеративно зі стеком, зберігши порядок?
`
    },
    // ---------------------------------------------------------------- Створення, вставка, видалення вузлів
    {
      id: 'dom-quiz-append-move',
      group: 'create',
      type: 'quiz',
      level: 2,
      title: 'append переміщує вузол; що повертає append',
      tags: ['insertion'],
      question: `
Що виведе код?

\`\`\`js
const a = document.createElement('div');
const p1 = document.createElement('p');
const p2 = document.createElement('p');
p1.append(a);
p2.append(a);
console.log(p1.children.length, p2.children.length);

const r1 = p1.appendChild(document.createElement('i'));
const r2 = p1.append(document.createElement('b'));
console.log(r1.tagName, r2);
\`\`\`
`,
      options: ['`1 1` і `I undefined`', '`0 1` і `I B`', '`1 1` і `undefined undefined`', '`0 1` і `I undefined`'],
      answer: 3,
      why: [
        'Хибно: вузол не копіюється — він може мати лише одного батька.',
        'Хибно: append нічого не повертає, на відміну від appendChild.',
        'Хибно: вставка переміщує вузол, а appendChild повертає вставлений вузол.',
        'Правильно: a переїхав у p2 (0 1), appendChild повернув i, append — undefined.'
      ],
      hint: 'Чи може один вузол одночасно бути в двох місцях дерева? І які з методів вставки щось повертають?',
      explanation: `
1. Вставка вже вставленого вузла **переміщує** його. Копія — \`cloneNode(true)\`.
2. \`appendChild(node)\` — один вузол, повертає його.
3. \`append(...nodes)\` — кілька вузлів і рядків, повертає \`undefined\`. Так само \`prepend\`, \`before\`, \`after\`, \`replaceWith\`, \`replaceChildren\`.
`
    },
    {
      id: 'dom-render-table',
      group: 'create',
      type: 'dom',
      level: 1,
      title: 'Відрендерити таблицю з масиву даних',
      tags: ['insertion', 'textContent'],
      description: `
**Завдання.** Напишіть \`renderUsers(users)\`, що малює рядки таблиці користувачів з масиву даних.

**Де трапляється:** будь-яка адмінка — список замовлень, користувачів, товарів з API.

**Дано (HTML):** \`<table id="users">\` з готовим \`<thead>\` (Ім'я, Email, Вік) і порожнім \`<tbody>\`.

**Що написати**
- \`renderUsers(users)\` → нічого; кожен \`{ name, email, age }\` → \`<tr>\` з трьома \`<td>\` у цьому порядку;
- повторний виклик **замінює** рядки, а не дописує;
- порожній масив → один рядок \`<td colspan="3">Немає даних</td>\`.

**Приклад**
\`\`\`js
renderUsers([{ name: 'Ann', email: 'ann@mail.com', age: 30 }]);
// <tbody><tr><td>Ann</td><td>ann@mail.com</td><td>30</td></tr></tbody>
renderUsers([]); // <tr><td colspan="3">Немає даних</td></tr>
\`\`\`

**Як це працює:** \`createElement\` + \`textContent\` створюють текстовий вузол — рядок не парситься як HTML, тож \`<img onerror=...>\` в імені стане просто текстом. \`tbody.replaceChildren(...rows)\` прибирає старе і вставляє нове за одну операцію.

**Врахуйте:** дані від користувачів — жодного \`innerHTML\`; \`<thead>\` не чіпати; властивість — \`td.colSpan\` (з великою S).
`,
      html: `<table id="users">
  <thead>
    <tr><th>Ім'я</th><th>Email</th><th>Вік</th></tr>
  </thead>
  <tbody></tbody>
</table>`,
      css: `table { border-collapse: collapse; }
td, th { border: 1px solid #ccc; padding: 4px 8px; }`,
      js: `function renderUsers(users) {
  const tbody = document.querySelector('#users tbody');

  // 1. TODO: порожній масив → <tr><td colSpan=3>Немає даних</td></tr> і вийти

  // 2. TODO: для кожного user створіть <tr> і три <td> з textContent = name, email, age

  // 3. TODO: замініть старі рядки новими: tbody.replaceChildren(...rows)
}

// Спробуйте в консолі: renderUsers([{ name: 'Ann', email: 'ann@mail.com', age: 30 }])
`,
      editable: ['js'],
      solution: {
        js: `function renderUsers(users) {
  const tbody = document.querySelector('#users tbody');

  if (!users.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 3;
    td.textContent = 'Немає даних';
    tr.append(td);
    tbody.replaceChildren(tr);
    return;
  }

  const rows = users.map((user) => {
    const tr = document.createElement('tr');
    for (const value of [user.name, user.email, user.age]) {
      const td = document.createElement('td');
      td.textContent = value; // безпечно: рядок не парситься як HTML
      tr.append(td);
    }
    return tr;
  });
  // replaceChildren прибирає старі рядки і вставляє нові за одну операцію
  tbody.replaceChildren(...rows);
}
`
      },
      hints: [
        'Створюйте елементи через `document.createElement` і заповнюйте їх через `textContent` — так дані не стануть HTML.',
        "Щоб замінити старі рядки, очистіть `tbody` (`tbody.textContent = ''`) або використайте `tbody.replaceChildren(...rows)`.",
        "Для порожнього масиву: `td.colSpan = 3` (властивість) або `td.setAttribute('colspan', '3')`."
      ],
      tests: [
        { name: 'рендерить рядки та клітинки', code: `renderUsers([{ name: 'Ann', email: 'ann@mail.com', age: 30 }, { name: 'Bob', email: 'bob@mail.com', age: 25 }]);
const rows = $$('#users tbody tr');
expect(rows).toHaveLength(2);
expect(Array.from(rows[0].cells).map((c) => c.textContent)).toEqual(['Ann', 'ann@mail.com', '30']);
expect(Array.from(rows[1].cells).map((c) => c.textContent)).toEqual(['Bob', 'bob@mail.com', '25']);` },
        { name: 'повторний виклик замінює рядки', code: `renderUsers([{ name: 'A', email: 'a', age: 1 }, { name: 'B', email: 'b', age: 2 }]);
renderUsers([{ name: 'C', email: 'c', age: 3 }]);
const rows = $$('#users tbody tr');
expect(rows).toHaveLength(1);
expect(rows[0].cells[0].textContent).toBe('C');` },
        { name: 'дані не інтерпретуються як HTML', code: `const evil = '<img src=x onerror="window.__xss = 1">';
renderUsers([{ name: evil, email: '<b>e</b>', age: 1 }]);
expect($('#users tbody img')).toBeNull();
expect($('#users tbody b')).toBeNull();
expect($('#users tbody td').textContent).toBe(evil);` },
        { name: 'порожній масив → рядок «Немає даних»', code: `renderUsers([]);
const rows = $$('#users tbody tr');
expect(rows).toHaveLength(1);
expect(rows[0].cells).toHaveLength(1);
expect(rows[0].cells[0].colSpan).toBe(3);
expect(rows[0].cells[0].textContent).toBe('Немає даних');` },
        { name: 'thead не змінюється', code: `renderUsers([{ name: 'X', email: 'x', age: 9 }]);
expect($$('#users thead th').map((th) => th.textContent)).toEqual(["Ім'я", 'Email', 'Вік']);` }
      ],
      explanation: `
Базовий патерн «дані → DOM»: створити, заповнити \`textContent\`, вставити пачкою.

\`\`\`js
tbody.innerHTML = users.map((u) => \`<tr><td>\${u.name}</td>...\`).join(''); // XSS!
\`\`\`
Якщо потрібен \`innerHTML\` — екрануйте \`& < > " '\`.

**Складність:** O(клітинок). Для тисяч рядків — віртуалізація.

**Типові помилки:** дописування замість заміни; \`td.colspan\` замість \`colSpan\`.

**Що спитають далі:** як оновити лише змінений рядок (keyed-оновлення)? Як відрендерити 100 000 рядків?
`
    },
    {
      id: 'dom-h-factory',
      group: 'create',
      type: 'dom',
      level: 2,
      title: 'Фабрика елементів h(tag, props, ...children)',
      tags: ['insertion', 'createElement'],
      description: `
**Завдання.** Напишіть \`h(tag, props, ...children)\` — маленький аналог \`React.createElement\`, що одразу створює реальні DOM-вузли.

**Де трапляється:** у JSX \`<li onClick={f}>x</li>\` компілюється саме у \`h('li', { onClick: f }, 'x')\`; такі хелпери пишуть у проєктах без фреймворку.

**Що написати**
- \`h(tag, props, ...children)\` → новий елемент. \`props\` може бути \`null\`:
  - \`class\`/\`className\` → \`el.className\`;
  - \`style: { color: 'red' }\` і \`dataset: { userId: '5' }\` → застосувати об'єкти;
  - \`onClick\`, \`onInput\`… (функція) → \`addEventListener('click', fn)\`;
  - решта: \`true\` → порожній атрибут, \`false\`/\`null\`/\`undefined\` → пропустити, інше → \`setAttribute(key, String(value))\`.
- \`children\`: рядки/числа → текст; вузли → як є; масиви будь-якої вкладеності → розгорнути; \`null\`, \`undefined\`, \`true\`, \`false\` → пропустити.

**Приклад**
\`\`\`js
const ul = h('ul', { class: 'list' },
  ['a', 'b'].map((x) => h('li', { dataset: { id: x } }, 'item ', x)),
  null,
  h('li', { onClick: () => console.log('hi') }, 'last')
);
// <ul class="list"><li data-id="a">item a</li><li data-id="b">item b</li><li>last</li></ul>
\`\`\`

**Як це працює:** \`el.style\` і \`el.dataset\` — об'єкти, тож \`Object.assign(el.style, {...})\` працює (а \`dataset\` сам робить \`userId\` → \`data-user-id\`). \`el.append('рядок')\` створює текстовий вузол — HTML не парситься.

**Врахуйте:** \`0\` має відрендеритися (не відкидайте його через \`if (!child)\`); \`onclick\` не має з'явитися як атрибут.
`,
      html: '<div id="app"></div>',
      css: '',
      js: `function h(tag, props, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(props || {})) {
    // 1. TODO: class / className → el.className
    // 2. TODO: style / dataset (об'єкти) → Object.assign(el.style | el.dataset, value)
    // 3. TODO: key починається з 'on' і value — функція → addEventListener(key.slice(2).toLowerCase(), value)
    // 4. TODO: true → setAttribute(key, ''); false/null/undefined → пропуск; інше → setAttribute(key, String(value))
  }

  function add(child) {
    // 5. TODO: масив → add для кожного; null/undefined/boolean → пропуск;
    //          Node → el.append(child); інше → el.append(String(child))
  }
  children.forEach(add);

  return el;
}

// Спробуйте: document.getElementById('app').append(h('p', { class: 'x' }, 'Hello ', 42))
`,
      editable: ['js'],
      solution: {
        js: `function h(tag, props, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(props || {})) {
    if (key === 'class' || key === 'className') {
      el.className = value;
    } else if (key === 'style' && value && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key === 'dataset' && value && typeof value === 'object') {
      Object.assign(el.dataset, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      // onClick → click; addEventListener, а не атрибут onclick (не рядок з кодом)
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) {
      el.setAttribute(key, '');
    } else if (value !== false && value != null) {
      el.setAttribute(key, String(value));
    }
  }

  const append = (child) => {
    if (Array.isArray(child)) child.forEach(append);
    else if (child == null || typeof child === 'boolean') return;
    else if (child instanceof Node) el.append(child);
    else el.append(String(child)); // рядок → текстовий вузол, без парсингу HTML
  };
  children.forEach(append);

  return el;
}
`
      },
      hints: [
        'Пройдіться по `Object.entries(props || {})` і обробіть спеціальні ключі (`class`, `style`, `dataset`, `on*`) окремими гілками.',
        "`Object.assign(el.style, styleObj)` і `Object.assign(el.dataset, dataObj)` — найкоротший спосіб застосувати об'єкти стилів і data-атрибутів.",
        'Для дітей напишіть рекурсивну функцію `append(child)`: масив → для кожного елемента рекурсія; `null`/boolean → пропуск; `Node` → `el.append(child)`; інше → `el.append(String(child))`.'
      ],
      tests: [
        { name: 'створює елемент з атрибутами й текстом', code: `const el = h('div', { id: 'x', class: 'a b', title: 'hello' }, 'hi');
expect(el.tagName).toBe('DIV');
expect(el.id).toBe('x');
expect(el.className).toBe('a b');
expect(el.getAttribute('title')).toBe('hello');
expect(el.textContent).toBe('hi');` },
        { name: 'вкладені елементи та масиви дітей', code: `const el = h('ul', null, [1, 2].map((n) => h('li', null, 'item ', n)), [[h('li', { className: 'last' }, 'last')]]);
expect(el.children).toHaveLength(3);
expect(el.children[0].textContent).toBe('item 1');
expect(el.children[1].textContent).toBe('item 2');
expect(el.children[2].className).toBe('last');` },
        { name: 'onClick → addEventListener, не атрибут', code: `const fn = mockFn();
const el = h('button', { onClick: fn }, 'go');
el.click();
el.click();
expect(fn).toHaveBeenCalledTimes(2);
expect(el.hasAttribute('onclick')).toBe(false);
expect(el.hasAttribute('onClick')).toBe(false);` },
        { name: 'style і dataset', code: `const el = h('div', { style: { color: 'red', marginTop: '4px' }, dataset: { userId: '5' } });
expect(el.style.color).toBe('red');
expect(el.style.marginTop).toBe('4px');
expect(el.getAttribute('data-user-id')).toBe('5');` },
        { name: 'булеві атрибути та пропуск falsy дітей', code: `const inp = h('input', { type: 'checkbox', disabled: true, hidden: false, title: null });
expect(inp.hasAttribute('disabled')).toBe(true);
expect(inp.disabled).toBe(true);
expect(inp.hasAttribute('hidden')).toBe(false);
expect(inp.hasAttribute('title')).toBe(false);
const p = h('p', null, 'a', null, false, undefined, true, 0, 'b');
expect(p.textContent).toBe('a0b');` },
        { name: 'рядки-діти не парсяться як HTML', code: `const p = h('p', null, '<b>x</b>');
expect(p.children).toHaveLength(0);
expect(p.textContent).toBe('<b>x</b>');` }
      ],
      explanation: `
**Ключові рішення:** події — через \`addEventListener\` (атрибут \`onclick\` приймає рядок коду і є вектором XSS); рядки → текстові вузли, XSS неможливий; \`0\` рендериться.

**Складність:** O(пропсів + дітей).

**Нюанс:** для \`value\`/\`checked\` атрибут задає лише початкове значення — бібліотеки розрізняють пропси-властивості й атрибути (\`key in el\`). SVG потребує \`createElementNS\`.

**Що спитають далі:** як зробити оновлення (diff/patch) замість перестворення? Як додати \`ref\`?
`
    },
    {
      id: 'dom-nested-menu',
      group: 'create',
      type: 'dom',
      level: 2,
      title: 'Вкладене меню з деревоподібних даних',
      tags: ['insertion', 'recursion'],
      description: `
**Завдання.** Напишіть \`buildMenu(items)\`, що будує вкладене меню \`<ul>\` з деревоподібних даних.

**Де трапляється:** меню категорій інтернет-магазину, сайдбар документації, дерево файлів — дані приходять з API деревом.

**Дано (HTML):** порожній \`<nav id="nav">\`; внизу JS уже вставляє туди результат для перегляду.

**Що написати**
- \`buildMenu(items)\` → **новий** \`<ul>\` (не вставлений у документ):
  - кожен пункт → \`<li>\`, першою дитиною — мітка: \`<a href="url">title</a>\`, якщо є \`url\`, інакше \`<span>title</span>\`;
  - якщо \`children\` — непорожній масив, після мітки в тому ж \`<li>\` — вкладений \`<ul>\`.

**Приклад**
\`\`\`js
buildMenu([
  { title: 'Головна', url: '/' },
  { title: 'Каталог', children: [{ title: 'Ноутбуки', url: '/laptops' }] }
]);
// <ul>
//   <li><a href="/">Головна</a></li>
//   <li><span>Каталог</span><ul><li><a href="/laptops">Ноутбуки</a></li></ul></li>
// </ul>
\`\`\`

**Як це працює:** дерево даних відображається на дерево DOM рекурсією: \`buildMenu(item.children)\` повертає готовий вкладений \`<ul>\`, який просто вставляється в \`<li>\`.

**Врахуйте:** \`children: []\` не створює порожній \`<ul>\`; \`title\` — текст, не HTML; \`[]\` → порожній \`<ul>\`; глибина до 100 рівнів.
`,
      html: '<nav id="nav"></nav>',
      css: '#nav ul { padding-left: 16px; }',
      js: `function buildMenu(items) {
  const ul = document.createElement('ul');
  // 1. TODO: для кожного item створіть <li>
  // 2. TODO: мітка: createElement(item.url ? 'a' : 'span'); href через setAttribute; textContent = title
  // 3. TODO: якщо item.children — непорожній масив: li.append(buildMenu(item.children))
  // 4. TODO: ul.append(li)
  return ul;
}

document.getElementById('nav').append(buildMenu([
  { title: 'Головна', url: '/' },
  { title: 'Каталог', children: [
    { title: 'Ноутбуки', url: '/laptops' },
    { title: 'Телефони', url: '/phones' }
  ] }
]) || '');
`,
      editable: ['js'],
      solution: {
        js: `function buildMenu(items) {
  const ul = document.createElement('ul');
  for (const item of items) {
    const li = document.createElement('li');
    const label = document.createElement(item.url ? 'a' : 'span');
    if (item.url) label.setAttribute('href', item.url);
    label.textContent = item.title;
    li.append(label);
    if (Array.isArray(item.children) && item.children.length) {
      li.append(buildMenu(item.children)); // рекурсія для піддерева
    }
    ul.append(li);
  }
  return ul;
}

document.getElementById('nav').append(buildMenu([
  { title: 'Головна', url: '/' },
  { title: 'Каталог', children: [
    { title: 'Ноутбуки', url: '/laptops' },
    { title: 'Телефони', url: '/phones' }
  ] }
]) || '');
`
      },
      hints: [
        'Функція рекурсивна: `buildMenu(item.children)` повертає вкладений `<ul>`, який можна просто вставити в `<li>`.',
        "Мітку створюйте через `document.createElement(item.url ? 'a' : 'span')`, текст — через `textContent`."
      ],
      tests: [
        { name: 'повертає <ul> з пунктами та посиланнями', code: `const ul = buildMenu([{ title: 'A', url: '/a' }, { title: 'B' }]);
expect(ul.tagName).toBe('UL');
expect(ul.children).toHaveLength(2);
const a = ul.children[0].firstElementChild;
expect(a.tagName).toBe('A');
expect(a.getAttribute('href')).toBe('/a');
expect(a.textContent).toBe('A');
expect(ul.children[1].firstElementChild.tagName).toBe('SPAN');` },
        { name: 'вкладена структура відповідає дереву', code: `function shape(ul) {
  return Array.from(ul.children).map((li) => {
    const sub = Array.from(li.children).find((c) => c.tagName === 'UL');
    return sub ? [li.firstElementChild.textContent, shape(sub)] : li.firstElementChild.textContent;
  });
}
const ul = buildMenu([
  { title: 'Home', url: '/' },
  { title: 'Cat', children: [{ title: 'L', url: '/l' }, { title: 'P', children: [{ title: 'P1', url: '/p1' }] }] }
]);
expect(shape(ul)).toEqual(['Home', ['Cat', ['L', ['P', ['P1']]]]]);
const catLi = ul.children[1];
expect(catLi.children[1].tagName).toBe('UL');` },
        { name: 'порожні children не створюють <ul>', code: `const ul = buildMenu([{ title: 'X', url: '/x', children: [] }]);
expect(ul.querySelectorAll('ul')).toHaveLength(0);
expect(buildMenu([]).children).toHaveLength(0);` },
        { name: 'title — це текст, а не HTML', code: `const ul = buildMenu([{ title: '<img src=x>' }]);
expect(ul.querySelector('img')).toBeNull();
expect(ul.textContent).toBe('<img src=x>');` },
        { name: 'глибина 100 рівнів', code: `let tree = [{ title: 'leaf', url: '/leaf' }];
for (let i = 0; i < 99; i++) tree = [{ title: 'n' + i, children: tree }];
const ul = buildMenu(tree);
expect(ul.querySelectorAll('ul')).toHaveLength(99);
expect(ul.querySelector('a').getAttribute('href')).toBe('/leaf');` }
      ],
      explanation: `
Рекурсія: кожен пункт обробляється раз → **O(n)**, стек — O(глибина).

**Деталі:** \`setAttribute('href', url)\` зберігає URL як є (\`a.href\` поверне абсолютний); \`textContent\` — захист від XSS; без порожніх \`<ul>\` — коректна семантика для скрінрідерів.

**Що спитають далі:** як побудувати дерево з плаского списку \`{ id, parentId }\`? Як знайти шлях (breadcrumbs) до активного пункту?
`
    },
    {
      id: 'dom-quiz-remove-leak',
      group: 'create',
      type: 'quiz',
      level: 3,
      title: "remove(), обробники та витоки пам'яті",
      tags: ['removal', 'memory', 'events'],
      question: `
\`\`\`js
let btn = document.querySelector('#btn');
function onResize() { console.log(btn.offsetWidth); }

btn.addEventListener('click', () => console.log('click'));
window.addEventListener('resize', onResize);

btn.remove();
\`\`\`

Оберіть **усі** правильні твердження:
`,
      options: [
        "Після `remove()` елемент усе ще в пам'яті — на нього посилається змінна `btn`",
        '`remove()` автоматично знімає всі обробники, додані через `addEventListener`',
        "Якщо виконати `btn = null`, елемент може бути зібраний GC навіть без `removeEventListener('click', ...)`",
        '`btn.isConnected` після `remove()` дорівнює `false`',
        'Обробник `resize` на `window` треба знімати окремо — інакше він і далі викликатиметься',
        'Після `remove()` виклик `btn.click()` кине помилку'
      ],
      answer: [0, 2, 3, 4],
      why: [
        "Правильно: remove() лише від'єднує вузол, а змінна btn тримає його в пам'яті.",
        'Хибно: обробники зберігаються на самому вузлі і нікуди не зникають.',
        'Правильно: обробник click — частина вузла; недосяжний вузол GC збирає разом з ним.',
        'Правильно: isConnected показує, чи вузол у документі.',
        'Правильно: window живий завжди, тож його обробник (і замкнений btn) залишаться.',
        "Хибно: від'єднаний вузол — звичайний об'єкт; click() спрацює і виведе click."
      ],
      hint: "Розділіть два питання: що тримає посилання на вузол і на які об'єкти «вішаються» обробники.",
      explanation: `
\`remove()\` від'єднує вузол, але поки на нього є посилання (змінна, масив, замикання), він живе — **detached DOM node** (DevTools → Memory → «Detached»).

Обробники на самому вузлі не заважають GC. Заважають підписки на довгоживучих об'єктах: \`window\`, \`document\`, таймери, observers — їх знімають при «розмонтуванні» компонента.
`
    },
    // ---------------------------------------------------------------- Вміст: innerHTML vs textContent
    {
      id: 'dom-theory-inner-html',
      group: 'content',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'innerHTML vs textContent vs innerText',
      tags: ['innerHTML', 'xss', 'textContent'],
      question: 'Чим відрізняються innerHTML, textContent та innerText? Що безпечніше і що швидше? Оберіть **усі** правильні твердження.',
      choices: [
        'Запис даних користувача в `innerHTML` — це XSS: атрибути-обробники на кшталт `onerror` виконаються',
        '`innerText` враховує CSS (`display: none`, переноси блоків), і його читання змушує браузер рахувати layout',
        '`textContent` повертає лише видимий текст і пропускає вміст прихованих елементів і `<script>`',
        'Тег `<script>`, вставлений через `innerHTML`, виконується так само, як і в початковій розмітці',
        '`el.innerHTML += html` перестворює весь вміст, тому втрачаються обробники, фокус і стан полів'
      ],
      correct: [0, 1, 4],
      why: [
        'Правильно: innerHTML парсить рядок, і атрибути-обробники на кшталт onerror виконуються.',
        'Правильно: innerText враховує CSS, тому читання змушує рахувати layout (reflow).',
        'Хибно: це опис innerText; textContent повертає текст усіх вузлів, включно з прихованими й script.',
        'Хибно: script, вставлений через innerHTML, не виконується — але обробники атрибутів виконуються.',
        'Правильно: += серіалізує і парсить усе заново, старі вузли з обробниками і станом зникають.'
      ],
      hint: 'Парсинг HTML, XSS, урахування CSS і reflow.',
      answer: `
| | \`innerHTML\` | \`textContent\` | \`innerText\` |
|---|---|---|---|
| Читання | розмітка нащадків | текст усіх вузлів | видимий текст |
| Запис | **парсить HTML** | один текстовий вузол | текст (\`\\n\` → \`<br>\`) |
| CSS / layout | ні | ні | **так**, reflow |

\`\`\`js
el.innerHTML = '<img src=x onerror="steal()">'; // код виконається — XSS
el.textContent = '<img src=x onerror="...">';    // просто текст
\`\`\`

- Текст — завжди \`textContent\` (найшвидший і безпечний).
- \`innerHTML\` знищує нащадків (обробники, фокус, стан полів); \`+=\` — антипатерн. Дописувати — \`insertAdjacentHTML('beforeend', html)\` або \`append\`.
- HTML від користувача — лише через санітайзер (DOMPurify).
`,
      keyPoints: [
        'innerHTML парсить HTML → XSS при неекранованих даних',
        'textContent — сирий текст усіх вузлів, швидкий, безпечний',
        'innerText враховує CSS і викликає reflow',
        'innerHTML += перестворює вузли і втрачає обробники/стан',
        'insertAdjacentHTML і санітайзери як альтернативи'
      ],
      followUps: [
        'Чому <script>, вставлений через innerHTML, не виконується?',
        'Що таке Trusted Types?',
        'Як безпечно вставити HTML від користувача?',
        'Чим nodeValue відрізняється від textContent?'
      ]
    },
    {
      id: 'dom-quiz-innerhtml-plus',
      group: 'content',
      type: 'quiz',
      level: 2,
      title: 'innerHTML += і обробники подій',
      tags: ['innerHTML', 'events'],
      question: `
Що виведе код у консоль?

\`\`\`html
<div id="box"><button>OK</button></div>
\`\`\`

\`\`\`js
const box = document.getElementById('box');
const btn = box.querySelector('button');
btn.addEventListener('click', () => console.log('clicked'));

box.innerHTML += '<p>new</p>';

btn.click();
box.querySelector('button').click();
\`\`\`
`,
      options: ['`clicked` двічі', '`clicked` один раз', 'Нічого', '`TypeError`: btn is null'],
      answer: 1,
      why: [
        'Хибно: нова кнопка, створена парсингом, не має обробника.',
        "Правильно: стара від'єднана кнопка зберегла обробник і реагує на btn.click(), нова — без обробника.",
        "Хибно: від'єднаний вузол живий і отримує події, якщо їх задиспатчити.",
        'Хибно: змінна btn не обнуляється — вона тримає старий вузол.'
      ],
      hint: '`innerHTML += x` — це `innerHTML = innerHTML + x`. Що стається зі старими вузлами? І чи зникає змінна `btn`?',
      explanation: `
\`innerHTML += x\` = серіалізувати → дописати → **розпарсити заново**. Старий \`<button>\` видалено, на його місці новий без обробників.

1. \`btn.click()\` — старий від'єднаний вузол з обробником → \`clicked\` (користувач цієї кнопки вже не бачить).
2. \`box.querySelector('button')\` — нова кнопка → нічого.

Дописуйте через \`append\` або \`insertAdjacentHTML('beforeend', ...)\`.
`
    },
    {
      id: 'dom-highlight-safe',
      group: 'content',
      type: 'dom',
      level: 3,
      title: 'Безпечне підсвічування збігів пошуку',
      tags: ['textContent', 'xss', 'regexp'],
      description: `
**Завдання.** Напишіть \`highlight(el, query)\`, що обгортає кожен збіг пошукового запиту в тексті елемента у \`<mark>\` — без XSS.

**Де трапляється:** пошук по сторінці, фільтр списку з підсвіткою, автокомпліт. На співбесідах — «чому \`innerHTML\` з \`replace\` тут небезпечний?».

**Дано (HTML):** \`<input id="q">\` і \`<p id="text">\`; внизу JS уже викликає \`highlight(text, q.value)\` на кожне введення.

**Що написати**
- \`highlight(el, query)\` → кількість збігів. Береться \`el.textContent\` (старі \`<mark>\` стають текстом), вміст замінюється на текстові вузли та \`<mark>\` навколо кожного збігу **без урахування регістру**; у \`<mark>\` — оригінальний регістр.

**Приклад**
\`\`\`js
el.textContent = 'Hello world, hello JS';
highlight(el, 'HELLO'); // 2 → <mark>Hello</mark> world, <mark>hello</mark> JS
highlight(el, '');      // 0 → просто текст
\`\`\`

**Як це працює:** \`new RegExp(escaped, 'gi')\` + цикл \`re.exec(text)\` дає позицію кожного збігу. Шматки між збігами — \`frag.append(text.slice(...))\` (рядок → текстовий вузол), збіг — \`<mark>\` з \`textContent\`. Усе в \`DocumentFragment\`, потім \`el.replaceChildren(frag)\`.

**Врахуйте:** текст і запит — дані користувача, жодного \`innerHTML\`; спецсимволи RegExp у запиті (\`.\`, \`(\`, \`*\`) — звичайні символи (екрануйте); порожній запит — окрема гілка (інакше нескінченний цикл).
`,
      html: `<input id="q" placeholder="пошук" value="dom">
<p id="text">DOM — це дерево. Робота з DOM через textContent безпечна, а &lt;b&gt;innerHTML&lt;/b&gt; — ні.</p>`,
      css: 'mark { background: #ffe066; }',
      js: `function escapeRegExp(str) {
  // готово: екранує спецсимволи RegExp
  return str.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
}

function highlight(el, query) {
  const text = el.textContent;
  const frag = document.createDocumentFragment();
  let count = 0;

  // 1. TODO: порожній query → frag.append(text)
  // 2. TODO: інакше re = new RegExp(escapeRegExp(query), 'gi'); цикл re.exec(text):
  //          текст до збігу → frag.append(text.slice(last, m.index))
  //          збіг → <mark> з textContent = m[0]; count++; last = кінець збігу
  // 3. TODO: хвіст після останнього збігу
  // 4. TODO: el.replaceChildren(frag) і повернути count
}

const q = document.getElementById('q');
const text = document.getElementById('text');
q.addEventListener('input', () => highlight(text, q.value));
highlight(text, q.value);
`,
      editable: ['js'],
      solution: {
        js: `function escapeRegExp(str) {
  return str.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
}

function highlight(el, query) {
  const text = el.textContent; // текст без старих <mark>
  const frag = document.createDocumentFragment();
  let count = 0;

  if (query) {
    const re = new RegExp(escapeRegExp(query), 'gi');
    let last = 0;
    let m;
    while ((m = re.exec(text))) {
      if (m.index > last) frag.append(text.slice(last, m.index)); // рядок → текстовий вузол
      const mark = document.createElement('mark');
      mark.textContent = m[0]; // оригінальний регістр
      frag.append(mark);
      last = m.index + m[0].length;
      count++;
    }
    if (last < text.length) frag.append(text.slice(last));
  } else {
    frag.append(text);
  }

  el.replaceChildren(frag); // одна вставка в живий DOM
  return count;
}

const q = document.getElementById('q');
const text = document.getElementById('text');
q.addEventListener('input', () => highlight(text, q.value));
highlight(text, q.value);
`
      },
      hints: [
        "Не будуйте HTML-рядок з `<mark>` — текст може містити `<img onerror>`. Створюйте вузли: текстові (`frag.append('рядок')`) і `<mark>` через `createElement`.",
        'Цикл `while ((m = re.exec(text)))`: `m.index` — початок збігу, `m[0]` — сам збіг в оригінальному регістрі.',
        'Між збігами додавайте `text.slice(last, m.index)`, після циклу — `text.slice(last)`. Потім `el.replaceChildren(frag)`.'
      ],
      tests: [
        { name: 'підсвічує всі збіги без урахування регістру', code: `const el = document.createElement('p');
document.body.append(el);
try {
  el.textContent = 'Hello world, hello JS';
  expect(highlight(el, 'HELLO')).toBe(2);
  expect(Array.from(el.querySelectorAll('mark')).map((m) => m.textContent)).toEqual(['Hello', 'hello']);
  expect(el.textContent).toBe('Hello world, hello JS');
} finally { el.remove(); }` },
        { name: 'повторний виклик скидає попередні <mark>', code: `const el = document.createElement('p');
document.body.append(el);
try {
  el.textContent = 'one two one';
  highlight(el, 'one');
  expect(highlight(el, 'two')).toBe(1);
  expect(Array.from(el.querySelectorAll('mark')).map((m) => m.textContent)).toEqual(['two']);
  expect(el.querySelector('mark mark')).toBeNull();
  expect(el.textContent).toBe('one two one');
} finally { el.remove(); }` },
        { name: 'текст не інтерпретується як HTML (XSS)', code: `const el = document.createElement('p');
document.body.append(el);
try {
  const evil = '<img src=x onerror="window.__xss = 1"> img';
  el.textContent = evil;
  expect(highlight(el, 'img')).toBe(2);
  expect(el.querySelector('img')).toBeNull();
  expect(el.textContent).toBe(evil);
  await sleep(20);
  expect(window.__xss).toBeUndefined();
} finally { el.remove(); }` },
        { name: 'спецсимволи RegExp у запиті — звичайні символи', code: `const el = document.createElement('p');
try {
  el.textContent = 'a.b axb a.b';
  expect(highlight(el, 'a.b')).toBe(2);
  el.textContent = 'f(x) = (x*2)';
  expect(highlight(el, '(')).toBe(2);
  expect(highlight(el, 'x*')).toBe(1);
} finally { el.remove(); }` },
        { name: 'порожній запит — без <mark>, текст не змінюється', code: `const el = document.createElement('p');
el.textContent = 'abc';
highlight(el, 'b');
expect(highlight(el, '')).toBe(0);
expect(el.querySelector('mark')).toBeNull();
expect(el.textContent).toBe('abc');` },
        { name: 'працює на сторінці з полем пошуку', code: `input('#q', 'DOM');
expect($$('#text mark').map((m) => m.textContent)).toEqual(['DOM', 'DOM']);
expect($('#text b')).toBeNull();` }
      ],
      explanation: `
\`el.innerHTML = text.replace(re, '<mark>$&</mark>')\` — XSS: \`<img onerror>\` у тексті стане справжнім елементом. Правильно — будувати вузли.

**Складність:** O(n) за довжиною тексту; одна вставка — один reflow.

**Без екранування:** \`'a.b'\` збігається з \`'axb'\`, а \`'('\` кидає \`SyntaxError\`.

**Що спитають далі:** як підсвітити, не руйнуючи вкладені теги (обхід текстових вузлів, \`splitText\`)? Що таке CSS Custom Highlight API?
`
    },
    // ---------------------------------------------------------------- Атрибути, властивості, класи, стилі
    {
      id: 'dom-quiz-dataset',
      group: 'attrs',
      type: 'quiz',
      level: 1,
      title: 'dataset: імена та типи',
      tags: ['attributes', 'dataset'],
      question: `
Що виведе код?

\`\`\`html
<div id="u" data-user-id="42" data-is-admin></div>
\`\`\`

\`\`\`js
const u = document.getElementById('u');
console.log(u.dataset.userId, typeof u.dataset.userId, u.dataset.isAdmin);
u.dataset.lastSeen = 'today';
console.log(u.getAttribute('data-last-seen'));
\`\`\`
`,
      options: [
        '`42 number true` і `today`',
        '`42 string true` і `null`',
        '`42 string ""` (порожній рядок) і `today`',
        '`undefined undefined undefined` і `null`'
      ],
      answer: 2,
      why: [
        'Хибно: значення атрибутів — завжди рядки, а порожній атрибут — порожній рядок, не true.',
        "Хибно: data-is-admin без значення дає '', а запис у dataset створює атрибут data-last-seen.",
        "Правильно: '42' — рядок, порожній атрибут — '', lastSeen → data-last-seen.",
        'Хибно: dataset перетворює user-id на userId, тож значення знайдеться.'
      ],
      hint: 'Атрибути завжди зберігаються як рядки. Як dataset перетворює `user-id`?',
      explanation: `
- \`data-user-id\` ↔ \`dataset.userId\` (kebab-case ↔ camelCase).
- Значення — завжди рядки: \`Number(u.dataset.userId)\`.
- Порожній атрибут → \`''\`, а це falsy! Наявність перевіряйте \`'isAdmin' in u.dataset\` або \`hasAttribute\`.
`
    },
    {
      id: 'dom-theory-attr-prop',
      group: 'attrs',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Атрибути vs властивості, dataset, classList',
      tags: ['attributes', 'properties', 'dataset', 'classList'],
      question: 'Чим HTML-атрибут відрізняється від DOM-властивості? Наведіть приклади, коли вони розходяться. Як працюють dataset і classList?',
      choices: [
        "Після введення тексту `getAttribute('value')` повертає введене, бо атрибут синхронізується з властивістю",
        "`setAttribute('disabled', 'false')` знову вмикає поле, бо рядок атрибута перетворюється на boolean",
        'Атрибут — рядок у розмітці, властивість — поле будь-якого типу; `value` — поточне, атрибут — `defaultValue`',
        'Будь-який атрибут, навіть нестандартний `foo="1"`, автоматично стає властивістю `el.foo`',
        '`dataset` зберігає типізовані значення: з `data-count="5"` у `el.dataset.count` буде число `5`'
      ],
      correct: 2,
      why: [
        'Хибно: атрибут value — початкове значення; введене живе у властивості value.',
        'Хибно: булевий атрибут вмикається самою наявністю — будь-яке значення, навіть "false", означає disabled.',
        'Правильно: атрибут — рядок у розмітці, властивість — поточний стан будь-якого типу.',
        'Хибно: у властивості відображаються лише стандартні атрибути; foo читайте через getAttribute.',
        "Хибно: dataset завжди повертає рядки — '5', а не 5."
      ],
      hint: 'value vs defaultValue, href, checked, class/className, нестандартні атрибути.',
      answer: `
**Атрибут** — рядок у розмітці (\`getAttribute/setAttribute\`). **Властивість** — поле DOM-об'єкта будь-якого типу. Стандартні атрибути відображаються у властивості, але не 1:1:

| Приклад | Атрибут | Властивість |
|---|---|---|
| \`<input value="a">\`, ввели «b» | \`'a'\` | \`value === 'b'\`, \`defaultValue === 'a'\` |
| \`<input type="checkbox" checked>\` | початковий стан | \`checked\` — поточний |
| \`<a href="/docs">\` | \`'/docs'\` | абсолютний URL |
| \`class\`, \`for\` | \`class\`, \`for\` | \`className\`/\`classList\`, \`htmlFor\` |
| \`<input disabled>\` | \`''\` | \`true\` |
| \`<div foo="1">\` | \`'1'\` | \`undefined\` |

- **dataset:** \`data-user-id\` ↔ \`el.dataset.userId\`, значення — рядки.
- **classList:** \`add\`, \`remove\`, \`toggle(cls, force)\`, \`contains\`, \`replace\`.
- Стан форми — через властивості; для CSS-селекторів і ARIA — атрибути. Вимкнути поле: \`el.disabled = false\` або \`removeAttribute('disabled')\`.
`,
      keyPoints: [
        "Атрибут — рядок у розмітці, властивість — поле об'єкта будь-якого типу",
        'value/checked — поточний стан, атрибут/defaultValue — початковий',
        'href та src як властивості повертають абсолютний URL',
        'Булеві атрибути: наявність = true; setAttribute("disabled", "false") не вимикає',
        'dataset: kebab-case ↔ camelCase, значення — рядки; classList API'
      ],
      followUps: [
        'Як скинути форму до початкових значень і що для цього використовує браузер?',
        "Чому нестандартний атрибут не з'являється як властивість?",
        'Що краще для стану компонента: data-атрибут чи клас?'
      ]
    },
    {
      id: 'dom-quiz-attr-prop',
      group: 'attrs',
      type: 'quiz',
      level: 3,
      title: 'value, href, checked: атрибут чи властивість',
      tags: ['attributes', 'properties'],
      question: `
\`\`\`html
<input id="i" value="a">
<a id="l" href="/docs">docs</a>
<input id="c" type="checkbox" checked>
\`\`\`

\`\`\`js
const i = document.getElementById('i');
const l = document.getElementById('l');
const c = document.getElementById('c');
i.value = 'b';
c.checked = false;
\`\`\`

Оберіть **усі** правильні твердження після виконання коду:
`,
      options: [
        "`i.getAttribute('value')` дорівнює `'a'`",
        "`i.defaultValue` дорівнює `'a'`",
        "`l.href` дорівнює `'/docs'`",
        "`l.getAttribute('href')` дорівнює `'/docs'`",
        "`c.hasAttribute('checked')` дорівнює `false`",
        "Після `i.setAttribute('value', 'z')` поле покаже `z`"
      ],
      answer: [0, 1, 3],
      why: [
        "Правильно: i.value змінює лише властивість, атрибут лишається 'a'.",
        'Правильно: defaultValue — це відображення атрибута value.',
        'Хибно: властивість href повертає абсолютний URL.',
        'Правильно: getAttribute повертає рівно те, що в розмітці.',
        'Хибно: c.checked змінює властивість, атрибут checked лишається.',
        'Хибно: після зміни value атрибут більше не впливає на видиме значення — він лише дефолт для reset().'
      ],
      hint: 'Атрибут описує початковий стан, властивість — поточний. А що відбувається з URL у властивості href?',
      explanation: `
Атрибут — початковий стан (його використовує \`form.reset()\`), властивість — поточний. Після зміни \`value\` у поля встановлюється dirty flag, і \`setAttribute('value', ...)\` вже не змінює видиме значення. \`href\`/\`src\` як властивості — абсолютні URL.
`
    },
    {
      id: 'dom-quiz-style-computed',
      group: 'attrs',
      type: 'quiz',
      level: 2,
      title: 'element.style vs getComputedStyle',
      tags: ['style', 'getComputedStyle'],
      question: `
Що виведе код?

\`\`\`html
<style>.box { width: 100px; color: red; }</style>
<div class="box" style="height: 50px"></div>
\`\`\`

\`\`\`js
const box = document.querySelector('.box');
console.log(box.style.width, box.style.height, getComputedStyle(box).width);
box.style.width = '200px';
console.log(getComputedStyle(box).width);
\`\`\`
`,
      options: [
        '`"" "50px" "100px"` і `"200px"`',
        '`"100px" "50px" "100px"` і `"200px"`',
        '`"" "50px" "100px"` і `"100px"`',
        '`undefined "50px" "100px"` і `"200px"`'
      ],
      answer: 0,
      why: [
        'Правильно: style бачить лише inline (width порожня), computed — підсумкове значення, і воно живе.',
        'Хибно: el.style не бачить стилів з CSS-класів — лише атрибут style.',
        "Хибно: об'єкт getComputedStyle живий — після зміни inline-стилю поверне 200px.",
        'Хибно: властивості el.style існують завжди; незадана — порожній рядок, не undefined.'
      ],
      hint: "`el.style` — це об'єкт для чого саме: усіх стилів чи лише атрибута `style`?",
      explanation: `
- \`el.style\` — лише inline-стилі (атрибут \`style\`).
- \`getComputedStyle(el)\` — підсумкові значення після каскаду; об'єкт живий, читання може спричинити перерахунок layout.

Записуйте через \`el.style\` або (краще) класи, читайте фактичні значення — через \`getComputedStyle\`.
`
    },
    {
      id: 'dom-tabs',
      group: 'attrs',
      type: 'dom',
      level: 2,
      title: 'Компонент вкладок (tabs)',
      tags: ['attributes', 'classList', 'a11y'],
      description: `
**Завдання.** Оживіть компонент вкладок: клік по вкладці показує її панель і ховає інші.

**Де трапляється:** картка товару (Опис / Характеристики / Відгуки), налаштування профілю — один з найчастіших UI-компонентів і задач на співбесідах.

**Дано (HTML)**
- \`<div class="tabs" id="tabs">\` → \`<div role="tablist">\` з трьома \`<button role="tab" data-tab="p1|p2|p3">\` (у третій є \`<span class="badge">\`);
- три панелі \`<div role="tabpanel" id="p1|p2|p3">\`.

**Що написати**
- \`initTabs(root)\` → нічого; при ініціалізації активна **перша** вкладка;
- \`activate(tab)\`: у активної вкладки клас \`active\` і \`aria-selected="true"\`, в інших — без \`active\` і \`aria-selected="false"\`; панель з \`id === tab.dataset.tab\` видима, інші — з атрибутом \`hidden\`;
- на кожну кнопку-вкладку — \`addEventListener('click', ...)\`, що викликає \`activate\`.

**Приклад**
\`\`\`js
// старт: p1 видима, p2 і p3 hidden
// клік по «Характеристики» → aria-selected: ['false', 'true', 'false'], видима p2
\`\`\`

**Як це працює:** стан живе в DOM: клас — для стилів, \`aria-selected\` — для скрінрідерів, \`hidden\` — для панелей (\`panel.hidden = true\` ставить атрибут). Одна функція \`activate\` змінює все разом, тож стан завжди узгоджений. Клік по \`<span>\` усередині кнопки теж спрацює: подія з дочірнього елемента доходить до кнопки.

**Врахуйте:** шукайте вкладки всередині \`root\` (\`root.querySelectorAll\`) — кілька екземплярів на сторінці мають працювати незалежно.
`,
      html: `<div class="tabs" id="tabs">
  <div role="tablist">
    <button role="tab" data-tab="p1">Опис</button>
    <button role="tab" data-tab="p2">Характеристики</button>
    <button role="tab" data-tab="p3"><span class="badge">3</span> Відгуки</button>
  </div>
  <div role="tabpanel" id="p1">Опис товару</div>
  <div role="tabpanel" id="p2">Вага: 1 кг</div>
  <div role="tabpanel" id="p3">Відгуки покупців</div>
</div>`,
      css: `[role="tab"] { padding: 6px 12px; border: 1px solid #ccc; background: #fff; }
[role="tab"].active { background: #335; color: #fff; }
[role="tabpanel"] { padding: 12px; border: 1px solid #ccc; }`,
      js: `function initTabs(root) {
  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));

  function activate(tab) {
    // 1. TODO: для кожної t з tabs: selected = t === tab
    //    - classList.toggle('active', selected)
    //    - setAttribute('aria-selected', String(selected))
    //    - панель document.getElementById(t.dataset.tab): hidden = !selected
  }

  // 2. TODO: кожній вкладці — обробник click, що викликає activate(tab)

  // 3. TODO: активуйте першу вкладку
}

initTabs(document.getElementById('tabs'));
`,
      editable: ['js'],
      solution: {
        js: `function initTabs(root) {
  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));

  function activate(tab) {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.classList.toggle('active', selected);
      t.setAttribute('aria-selected', String(selected));
      const panel = document.getElementById(t.dataset.tab);
      if (panel) panel.hidden = !selected;
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activate(tab));
  });

  if (tabs.length) activate(tabs[0]);
}

initTabs(document.getElementById('tabs'));
`
      },
      hints: [
        "Функція `activate(tab)` проходить по всіх вкладках: `classList.toggle('active', t === tab)`, `aria-selected` і `panel.hidden = t !== tab`.",
        "Обробники: `tabs.forEach((tab) => tab.addEventListener('click', () => activate(tab)))` — замикання пам'ятає свою вкладку.",
        'Наприкінці `activate(tabs[0])`. Вкладки шукайте через `root.querySelectorAll`, а не `document` — тоді екземпляри незалежні.'
      ],
      tests: [
        { name: 'початковий стан: активна перша вкладка', code: `const tabs = $$('#tabs [role=tab]');
expect(tabs[0].classList.contains('active')).toBe(true);
expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
expect($('#p1').hidden).toBe(false);
expect($('#p2').hidden).toBe(true);
expect(css('#p3', 'display')).toBe('none');` },
        { name: 'клік перемикає вкладку і панель', code: `const tabs = $$('#tabs [role=tab]');
click(tabs[1]);
expect(tabs[1].classList.contains('active')).toBe(true);
expect(tabs[0].classList.contains('active')).toBe(false);
expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
expect($$('#tabs [role=tabpanel]').map((p) => p.hidden)).toEqual([true, false, true]);` },
        { name: 'клік по вкладеному в кнопку елементу', code: `click($('#tabs .badge'));
expect($$('#tabs [role=tab]')[2].getAttribute('aria-selected')).toBe('true');
expect($('#p3').hidden).toBe(false);
expect($('#p1').hidden).toBe(true);` },
        { name: 'повторний клік по активній вкладці лишає її відкритою', code: `const tabs = $$('#tabs [role=tab]');
click(tabs[0]);
click(tabs[0]);
expect(tabs[0].getAttribute('aria-selected')).toBe('true');
expect($('#p1').hidden).toBe(false);
expect($$('#tabs .active')).toHaveLength(1);` },
        { name: 'екземпляри незалежні', code: `const before = $$('#tabs [role=tab]').map((t) => t.getAttribute('aria-selected'));
const root = document.createElement('div');
root.innerHTML = '<div role="tablist"><button role="tab" data-tab="x1">A</button><button role="tab" data-tab="x2">B</button></div><div role="tabpanel" id="x1">a</div><div role="tabpanel" id="x2">b</div>';
document.body.append(root);
try {
  initTabs(root);
  expect(document.getElementById('x2').hidden).toBe(true);
  click(root.querySelectorAll('[role=tab]')[1]);
  expect(document.getElementById('x2').hidden).toBe(false);
  expect(document.getElementById('x1').hidden).toBe(true);
  expect($$('#tabs [role=tab]').map((t) => t.getAttribute('aria-selected'))).toEqual(before);
} finally { root.remove(); }` }
      ],
      explanation: `
**Одна точка зміни стану** (\`activate\`) — клас, ARIA і \`hidden\` завжди узгоджені. Складність перемикання — O(n).

**\`hidden\` vs \`display: none\`:** якщо в CSS панелі задано \`display: block\`, воно перекриє \`hidden\` — додають \`[hidden] { display: none !important; }\`.

**Доступність:** \`role="tablist/tab/tabpanel"\`, \`aria-selected\`, \`aria-controls\`; повний патерн — ще й стрілки на клавіатурі.

**Типові помилки:** шукати вкладки в \`document\` (екземпляри заважають одне одному); \`setAttribute('hidden', false)\` — атрибут усе одно є.

**Що спитають далі:** як зробити один обробник на весь компонент (делегування — тема «Події»)? Як синхронізувати вкладку з \`#hash\`?
`
    },
    // ---------------------------------------------------------------- Пакетні вставки: fragment і template
    {
      id: 'dom-theory-fragment-template',
      group: 'batch',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'DocumentFragment, <template> і пакетні вставки',
      tags: ['fragment', 'template', 'performance'],
      question: 'Що таке DocumentFragment і навіщо він потрібен? Як працює <template>? Як ефективно вставити тисячу елементів? Оберіть **усі** правильні твердження.',
      choices: [
        'Після `parent.append(frag)` вузли переносяться в документ, а сам fragment стає порожнім',
        'Без fragment кожен `append` у циклі робить окремий reflow, тож 1000 вставок — 1000 перерахунків layout',
        'Вміст `<template>` інертний: парситься, але не рендериться, скрипти не виконуються, картинки не вантажаться',
        '`cloneNode(true)` копіює вузол разом з обробниками, доданими через `addEventListener`',
        '`template.content` — звичайний `HTMLElement`, який браузер просто ховає через `display: none`'
      ],
      correct: [0, 2],
      why: [
        'Правильно: при вставці переноситься вміст fragment, а сам він стає порожнім.',
        'Хибно: браузер відкладає layout до кінця задачі або першого читання геометрії — 1000 append без читань не дають 1000 reflow.',
        'Правильно: вміст template інертний, template.content — DocumentFragment.',
        'Хибно: cloneNode копіює атрибути й нащадків, але не обробники addEventListener.',
        'Хибно: template.content — DocumentFragment поза документом, а не прихований елемент.'
      ],
      hint: 'Вставка поза живим деревом, одна мутація, інертний вміст шаблону, cloneNode.',
      answer: `
**DocumentFragment** — контейнер (\`nodeType 11\`) поза документом. При \`parent.append(frag)\` переноситься вміст, fragment порожніє.

\`\`\`js
const frag = document.createDocumentFragment();
for (const item of items) {
  const li = document.createElement('li');
  li.textContent = item;
  frag.append(li);
}
list.append(frag); // одна вставка, один MutationRecord
\`\`\`

**Нюанс:** layout ледачий — шкодять **читання** геометрії (\`offsetHeight\`) між записами (forced layout), а не самі \`append\`. Fragment дає одну мутацію і менше операцій над живим деревом. Еквівалент — \`list.append(...nodes)\`.

**\`<template>\`** — інертний вміст: не рендериться, скрипти не виконуються, картинки не вантажаться.
\`\`\`js
const node = tpl.content.cloneNode(true);
node.querySelector('.name').textContent = user.name;
list.append(node);
\`\`\`

\`cloneNode(true)\` не копіює обробники. Для 10⁴+ елементів — віртуалізація.
`,
      keyPoints: [
        'DocumentFragment — контейнер поза документом, при вставці переносить вміст і стає порожнім',
        'Одна вставка замість багатьох: менше мутацій, один MutationRecord',
        'Reflow ліниві: шкодять читання геометрії між записами, а не самі append',
        '<template> — інертний вміст, template.content — DocumentFragment, клонування cloneNode/importNode',
        'cloneNode не копіює обробники подій',
        'Для 10⁴+ елементів — віртуалізація'
      ],
      followUps: [
        'Чим append(...nodes) відрізняється від вставки fragment?',
        'Чому скрипти в <template> не виконуються?',
        'Що таке layout thrashing і як його уникнути?'
      ]
    },
    {
      id: 'dom-fragment-batch',
      group: 'batch',
      type: 'dom',
      level: 2,
      title: 'Вставити 1000 елементів однією операцією',
      tags: ['fragment', 'performance', 'mutation-observer'],
      description: `
**Завдання.** Виправте \`appendItems(list, items)\`: зараз вона дописує елементи через \`innerHTML +=\` у циклі. Зробіть одну вставку в DOM.

**Де трапляється:** підвантаження наступної сторінки стрічки, додавання результатів пошуку, логи в реальному часі.

**Дано (HTML):** \`<ul id="list">\` з двома \`<li>\`.

**Що написати**
- \`appendItems(list, items)\` → нічого; додає в **кінець** \`list\` по одному \`<li>\` на кожен рядок \`items\`.

**Приклад**
\`\`\`js
appendItems(list, ['третій', 'четвертий']);
// перший, другий, третій, четвертий — перші два ті самі вузли
\`\`\`

**Як це працює:** \`innerHTML +=\` щоразу серіалізує і перепарсює **весь** список (O(n²), старі вузли знищуються). \`DocumentFragment\` збирає нові \`<li>\` поза документом, а \`list.append(frag)\` вставляє їх однією операцією — \`MutationObserver\` побачить рівно один запис.

**Врахуйте:** існуючі елементи не перестворюються; текст — не HTML (\`textContent\`); порожній масив — жодних змін у DOM.
`,
      html: `<ul id="list">
  <li>перший</li>
  <li>другий</li>
</ul>`,
      css: '',
      js: `function appendItems(list, items) {
  // Зараз: innerHTML += у циклі — повільно, перестворює список і небезпечно (XSS)
  for (const item of items) {
    list.innerHTML += '<li>' + item + '</li>';
  }

  // 1. TODO: порожній items — вийти
  // 2. TODO: frag = document.createDocumentFragment()
  // 3. TODO: для кожного item — <li> з textContent у frag
  // 4. TODO: list.append(frag) — одна вставка
}

// Спробуйте: appendItems(document.getElementById('list'), ['третій'])
`,
      editable: ['js'],
      solution: {
        js: `function appendItems(list, items) {
  if (!items.length) return;
  const frag = document.createDocumentFragment();
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    frag.append(li);
  }
  list.append(frag); // одна вставка в живе дерево
}
`
      },
      hints: [
        'Збирайте елементи в `document.createDocumentFragment()` — вставка у fragment не зачіпає документ.',
        'Після циклу — один `list.append(frag)`. Альтернатива: зібрати масив і викликати `list.append(...lis)`.'
      ],
      tests: [
        { name: 'додає в кінець, не перестворюючи існуючі', code: `const list = $('#list');
const first = list.firstElementChild;
appendItems(list, ['третій', 'четвертий']);
expect($$('#list li').map((li) => li.textContent)).toEqual(['перший', 'другий', 'третій', 'четвертий']);
expect(list.firstElementChild).toBe(first);` },
        { name: '1000 елементів — один запис MutationObserver', code: `const list = document.createElement('ul');
list.innerHTML = '<li>0</li>';
document.body.append(list);
const mo = new MutationObserver(() => {});
mo.observe(list, { childList: true, subtree: true });
try {
  appendItems(list, Array.from({ length: 1000 }, (_, i) => 'item ' + i));
  const records = mo.takeRecords();
  expect(records).toHaveLength(1);
  expect(records[0].addedNodes).toHaveLength(1000);
  expect(records[0].removedNodes).toHaveLength(0);
  expect(list.children).toHaveLength(1001);
  expect(list.lastElementChild.textContent).toBe('item 999');
} finally { mo.disconnect(); list.remove(); }` },
        { name: 'текст не парситься як HTML', code: `const list = document.createElement('ul');
appendItems(list, ['<b>bold</b>', 'a & b']);
expect(list.querySelector('b')).toBeNull();
expect(Array.from(list.children).map((li) => li.textContent)).toEqual(['<b>bold</b>', 'a & b']);` },
        { name: 'порожній масив — жодних мутацій', code: `const list = document.createElement('ul');
list.innerHTML = '<li>x</li>';
const mo = new MutationObserver(() => {});
mo.observe(list, { childList: true, subtree: true });
appendItems(list, []);
const records = mo.takeRecords();
mo.disconnect();
expect(records).toHaveLength(0);
expect(list.children).toHaveLength(1);` }
      ],
      explanation: `
Fragment → одна вставка, один запис \`MutationObserver\` з 1000 \`addedNodes\`, O(n).

**Еквіваленти:** \`list.append(...lis)\` (для 10⁵ елементів може впертися в ліміт аргументів), \`insertAdjacentHTML('beforeend', html)\` з екрануванням.

**Чесно про продуктивність:** layout відкладений і без fragment, але менше мутацій важливо для фреймворків і observers, і виключено випадковий forced layout.

**Що спитають далі:** як вставити 100 000 елементів, не заблокувавши UI (чанки, віртуалізація)? Чому \`innerHTML +=\` — O(n²)?
`
    },
    {
      id: 'dom-template-cards',
      group: 'batch',
      type: 'dom',
      level: 2,
      title: 'Картки товарів з <template>',
      tags: ['template', 'cloneNode'],
      description: `
**Завдання.** Напишіть \`renderCards(container, products)\`, що малює картки товарів з HTML-шаблону \`<template>\`.

**Де трапляється:** каталог інтернет-магазину без фреймворку; так само працюють шаблони у Web Components.

**Дано (HTML)**
- \`<template id="card-tpl">\` → \`<article class="card">\` з \`h3.card-title\`, \`p.card-price\`, \`button.card-buy\`;
- порожній \`<div id="cards">\`; внизу JS уже рендерить дві картки.

**Що написати**
- \`renderCards(container, products)\` → нічого; для кожного \`{ id, title, price }\` — клон шаблону:
  - \`.card-title\` — назва (текст), \`.card-price\` — \`'<price> ₴'\`;
  - \`price === 0\` → \`'Безкоштовно'\` і клас \`free\` на \`<article>\`;
  - \`article.dataset.id = id\`;
- вміст \`container\` **замінюється**; сам шаблон не змінюється.

**Приклад**
\`\`\`js
renderCards(box, [{ id: 7, title: 'Мишка', price: 450 }]);
// <article class="card" data-id="7"><h3>Мишка</h3><p>450 ₴</p>...</article>
\`\`\`

**Як це працює:** \`tpl.content\` — DocumentFragment з інертною розміткою. \`tpl.content.cloneNode(true)\` дає нову копію, яку заповнюють через \`querySelector\` **до** вставки: після \`append\` вузли переїжджають і клон-fragment порожніє.

**Врахуйте:** не вставляйте \`tpl.content\` напряму (шаблон спорожніє); назва — через \`textContent\`.
`,
      html: `<template id="card-tpl">
  <article class="card">
    <h3 class="card-title"></h3>
    <p class="card-price"></p>
    <button class="card-buy" type="button">Купити</button>
  </article>
</template>
<div id="cards"></div>`,
      css: `#cards { display: flex; gap: 8px; }
.card { border: 1px solid #ccc; padding: 8px; }
.card.free .card-price { color: green; }`,
      js: `function renderCards(container, products) {
  const tpl = document.getElementById('card-tpl');
  const frag = document.createDocumentFragment();

  for (const p of products) {
    // 1. TODO: const node = tpl.content.cloneNode(true)
    // 2. TODO: article = node.querySelector('.card'); article.dataset.id = p.id
    // 3. TODO: .card-title — textContent = p.title
    // 4. TODO: .card-price — 'Безкоштовно' + клас free при price === 0, інакше p.price + ' ₴'
    // 5. TODO: frag.append(node)
  }

  // 6. TODO: container.replaceChildren(frag)
}

renderCards(document.getElementById('cards'), [
  { id: 1, title: 'Ноутбук', price: 30000 },
  { id: 2, title: 'Наліпка', price: 0 }
]);
`,
      editable: ['js'],
      solution: {
        js: `function renderCards(container, products) {
  const tpl = document.getElementById('card-tpl');
  const frag = document.createDocumentFragment();

  for (const p of products) {
    const node = tpl.content.cloneNode(true); // DocumentFragment з копією шаблону
    const article = node.querySelector('.card');
    article.dataset.id = p.id;
    node.querySelector('.card-title').textContent = p.title;
    const price = node.querySelector('.card-price');
    if (p.price === 0) {
      price.textContent = 'Безкоштовно';
      article.classList.add('free');
    } else {
      price.textContent = p.price + ' ₴';
    }
    frag.append(node);
  }

  container.replaceChildren(frag);
}

renderCards(document.getElementById('cards'), [
  { id: 1, title: 'Ноутбук', price: 30000 },
  { id: 2, title: 'Наліпка', price: 0 }
]);
`
      },
      hints: [
        "`tpl.content` — це DocumentFragment. Клон: `tpl.content.cloneNode(true)` (обов'язково `true` — глибока копія).",
        'Заповнюйте клон через `querySelector` **до** вставки в документ — після вставки fragment стане порожнім.',
        'Зберіть усі клони в один fragment і вставте `container.replaceChildren(frag)`.'
      ],
      tests: [
        { name: 'рендерить картки з даними', code: `const box = document.createElement('div');
renderCards(box, [{ id: 7, title: 'Мишка', price: 450 }, { id: 8, title: 'Килимок', price: 200 }]);
const cards = box.querySelectorAll('article.card');
expect(cards).toHaveLength(2);
expect(cards[0].dataset.id).toBe('7');
expect(cards[0].querySelector('.card-title').textContent).toBe('Мишка');
expect(cards[0].querySelector('.card-price').textContent).toBe('450 ₴');
expect(cards[1].querySelector('.card-buy').textContent).toBe('Купити');` },
        { name: 'ціна 0 → «Безкоштовно» і клас free', code: `const box = document.createElement('div');
renderCards(box, [{ id: 1, title: 'A', price: 0 }, { id: 2, title: 'B', price: 10 }]);
const cards = box.querySelectorAll('.card');
expect(cards[0].classList.contains('free')).toBe(true);
expect(cards[0].querySelector('.card-price').textContent).toBe('Безкоштовно');
expect(cards[1].classList.contains('free')).toBe(false);` },
        { name: 'шаблон не змінюється', code: `const box = document.createElement('div');
renderCards(box, [{ id: 1, title: 'X', price: 5 }]);
const tpl = document.getElementById('card-tpl');
expect(tpl.content.querySelectorAll('.card')).toHaveLength(1);
expect(tpl.content.querySelector('.card-title').textContent).toBe('');
expect(tpl.content.querySelector('.card').hasAttribute('data-id')).toBe(false);` },
        { name: 'повторний виклик замінює вміст', code: `const box = document.createElement('div');
box.innerHTML = '<p>old</p>';
renderCards(box, [{ id: 1, title: 'A', price: 1 }, { id: 2, title: 'B', price: 2 }]);
renderCards(box, [{ id: 3, title: 'C', price: 3 }]);
expect(box.querySelector('p:not(.card-price)')).toBeNull();
expect(box.querySelectorAll('.card')).toHaveLength(1);
expect(box.querySelector('.card').dataset.id).toBe('3');` },
        { name: 'назва не парситься як HTML', code: `const box = document.createElement('div');
renderCards(box, [{ id: 1, title: '<img src=x>', price: 1 }]);
expect(box.querySelector('img')).toBeNull();
expect(box.querySelector('.card-title').textContent).toBe('<img src=x>');` },
        { name: 'сторінка показує початкові картки', code: `expect($$('#cards .card')).toHaveLength(2);
expect($$('#cards .card.free')).toHaveLength(1);` }
      ],
      explanation: `
\`<template>\` тримає розмітку в HTML, а не в JS-рядках: її легко читати, і вона не виконується до клонування. \`document.importNode(tpl.content, true)\` — еквівалент клонування.

**Складність:** O(n · розмір шаблону); одна вставка.

**Типові помилки:** клонувати сам \`<template>\` замість \`.content\`; \`cloneNode()\` без \`true\` (порожній fragment); вставити \`tpl.content\` напряму; \`innerHTML\` з \`\${title}\`.

**Що спитають далі:** як обробити «Купити» для всіх карток одним обробником (делегування)? Як \`<template>\` використовують у Shadow DOM?
`
    },
    {
      id: 'dom-sort-table',
      group: 'batch',
      type: 'dom',
      level: 3,
      title: 'Сортування таблиці по кліку на заголовок',
      tags: ['tables', 'sorting'],
      description: `
**Завдання.** Зробіть таблицю сортованою: клік по заголовку колонки сортує рядки за нею, повторний клік — у зворотному порядку.

**Де трапляється:** таблиці в адмінках і дашбордах; на співбесідах перевіряють компаратори, локаль і стабільність сортування.

**Дано (HTML):** \`<table id="people">\`: у \`<thead>\` три \`<th>\` з \`data-type="string|number"\` (Ім'я, Вік, Бал), у \`<tbody>\` чотири рядки.

**Що написати**
- \`makeSortable(table)\` → нічого; на кожен \`<th>\` — обробник \`click\`:
  - перший клік — за зростанням, повторний по тій самій колонці — перемикає напрям, клік по іншій — знову зростання;
  - активний \`<th>\` має \`data-order="asc|desc"\`, в інших атрибут прибирається;
  - \`number\` — числове порівняння, \`string\` — \`localeCompare\` з локаллю \`'uk'\` без урахування регістру.

**Приклад**
\`\`\`js
// клік «Вік»   → 9, 25, 30, 100 (asc)
// ще раз «Вік» → 100, 30, 25, 9 (desc)
// клік «Ім'я»  → Андрій, богдан, Ірина, Олена
\`\`\`

**Як це працює:** \`Array.from(tbody.rows).sort(compare)\` сортує масив посилань на рядки, а \`tbody.append(...rows)\` вставляє ті самі вузли в новому порядку — вставка існуючого вузла **переміщує** його. \`Array.prototype.sort\` стабільний, тож рівні значення зберігають поточний порядок.

**Врахуйте:** \`'100' < '25'\` у рядках — числа парсіть; для desc множте компаратор на \`-1\` (а не \`reverse()\`, що ламає стабільність); рядки не перестворюються.
`,
      html: `<table id="people">
  <thead>
    <tr><th data-type="string">Ім'я</th><th data-type="number">Вік</th><th data-type="number">Бал</th></tr>
  </thead>
  <tbody>
    <tr><td>Олена</td><td>30</td><td>9.5</td></tr>
    <tr><td>Андрій</td><td>9</td><td>7</td></tr>
    <tr><td>богдан</td><td>100</td><td>7</td></tr>
    <tr><td>Ірина</td><td>25</td><td>10</td></tr>
  </tbody>
</table>`,
      css: `th { cursor: pointer; user-select: none; }
th[data-order="asc"]::after { content: ' ▲'; }
th[data-order="desc"]::after { content: ' ▼'; }
td, th { padding: 4px 10px; border: 1px solid #ddd; }`,
      js: `function makeSortable(table) {
  const tbody = table.tBodies[0];
  const headers = Array.from(table.tHead.rows[0].cells);

  headers.forEach((th, col) => {
    th.addEventListener('click', () => {
      // 1. TODO: order = th.dataset.order === 'asc' ? 'desc' : 'asc'; dir = 1 або -1
      // 2. TODO: value(row) = row.cells[col].textContent.trim()
      // 3. TODO: compare: number → parseFloat(a) - parseFloat(b);
      //          string → a.localeCompare(b, 'uk', { sensitivity: 'base' })
      // 4. TODO: rows = Array.from(tbody.rows).sort((a, b) => dir * compare(a, b))
      // 5. TODO: прибрати data-order у всіх headers, поставити th.dataset.order = order
      // 6. TODO: tbody.append(...rows)
    });
  });
}

makeSortable(document.getElementById('people'));
`,
      editable: ['js'],
      solution: {
        js: `function makeSortable(table) {
  const tbody = table.tBodies[0];
  const headers = Array.from(table.tHead.rows[0].cells);

  headers.forEach((th, col) => {
    th.addEventListener('click', () => {
      const order = th.dataset.order === 'asc' ? 'desc' : 'asc';
      const dir = order === 'asc' ? 1 : -1;
      const isNumber = th.dataset.type === 'number';

      const value = (row) => row.cells[col].textContent.trim();
      const compare = isNumber
        ? (a, b) => parseFloat(value(a)) - parseFloat(value(b))
        : (a, b) => value(a).localeCompare(value(b), 'uk', { sensitivity: 'base' });

      // Array.prototype.sort стабільний (ES2019), тож рівні значення зберігають порядок
      const rows = Array.from(tbody.rows).sort((a, b) => dir * compare(a, b));

      headers.forEach((h) => h.removeAttribute('data-order'));
      th.dataset.order = order;
      // append існуючих вузлів ПЕРЕМІЩУЄ їх — рядки не перестворюються
      tbody.append(...rows);
    });
  });
}

makeSortable(document.getElementById('people'));
`
      },
      hints: [
        'Обробник на кожен `<th>` через `headers.forEach((th, col) => ...)` — індекс колонки вже є. Значення клітинки — `row.cells[col].textContent`.',
        "Числа: `parseFloat(a) - parseFloat(b)`; рядки: `a.localeCompare(b, 'uk', { sensitivity: 'base' })` — звичайне `<` поставить «Ірина» перед «Андрій».",
        'Відсортуйте `Array.from(tbody.rows)` і вставте назад `tbody.append(...rows)`. Для desc множте результат компаратора на -1.'
      ],
      tests: [
        { name: 'числова колонка: зростання й data-order', code: `click($$('#people th')[1]);
expect($$('#people tbody tr').map((r) => r.cells[1].textContent)).toEqual(['9', '25', '30', '100']);
expect($$('#people th')[1].dataset.order).toBe('asc');` },
        { name: 'повторний клік — спадання', code: `const th = $$('#people th');
click(th[0]);
click(th[1]);
click(th[1]);
expect($$('#people tbody tr').map((r) => r.cells[1].textContent)).toEqual(['100', '30', '25', '9']);
expect(th[1].dataset.order).toBe('desc');` },
        { name: 'рядки: українська локаль, без урахування регістру; інші th без data-order', code: `const th = $$('#people th');
click(th[1]);
click(th[0]);
expect($$('#people tbody tr').map((r) => r.cells[0].textContent)).toEqual(['Андрій', 'богдан', 'Ірина', 'Олена']);
expect(th[0].dataset.order).toBe('asc');
expect(th[1].hasAttribute('data-order')).toBe(false);
expect(th[2].hasAttribute('data-order')).toBe(false);` },
        { name: 'стабільне сортування', code: `const th = $$('#people th');
click(th[0]);
if (th[0].dataset.order !== 'desc') click(th[0]);
expect($$('#people tbody tr').map((r) => r.cells[0].textContent)).toEqual(['Олена', 'Ірина', 'богдан', 'Андрій']);
click(th[2]);
expect($$('#people tbody tr').map((r) => r.cells[0].textContent)).toEqual(['богдан', 'Андрій', 'Олена', 'Ірина']);` },
        { name: 'рядки переміщуються, а не перестворюються', code: `const rows = $$('#people tbody tr');
rows.forEach((r, i) => { r.__mark = i; });
click($$('#people th')[1]);
click($$('#people th')[2]);
const after = $$('#people tbody tr');
expect(after).toHaveLength(4);
expect(after.every((r) => rows.includes(r))).toBe(true);` }
      ],
      explanation: `
**Алгоритм:** рядки в масив → \`sort\` з компаратором під тип → ті самі вузли назад. **O(n log n)** порівнянь.

**Пастки:** рядкове порівняння чисел; порівняння кодів символів ставить \`І\` перед \`А\` і малі літери після великих (\`localeCompare\` або \`Intl.Collator('uk')\`); \`reverse()\` ламає стабільність; перебудова через \`innerHTML\` знищить обробники і стан рядків.

**Доступність:** \`aria-sort\` на \`<th>\`, клікабельна частина — \`<button>\`.

**Що спитають далі:** як сортувати дати й порожні значення? Як сортувати 100 000 рядків (сортувати дані, а не DOM; віртуалізація)?
`
    },
    // ---------------------------------------------------------------- Розміри і прокрутка
    {
      id: 'dom-theory-sizes',
      group: 'sizes',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'offset*, client*, scroll*, getBoundingClientRect',
      tags: ['sizes', 'scroll', 'layout'],
      question: 'Як отримати розміри та позицію елемента? Чим відрізняються offsetWidth, clientWidth, scrollWidth і getBoundingClientRect()? Як визначити, що блок прокручено до кінця?',
      choices: [
        '`getBoundingClientRect()` рахує координати відносно документа, тому під час скролу вони не змінюються',
        '`offsetWidth` і `getBoundingClientRect().width` завжди рівні — друге лише дає дробове значення',
        'Кінець прокрутки перевіряють умовою `scrollTop === scrollHeight`, бо `scrollTop` рахується до низу вмісту',
        '`offsetWidth` — з border і scrollbar, `clientWidth` — без них, `scrollWidth` — увесь вміст з прихованим',
        '`clientWidth` включає border і смугу прокрутки, а `offsetWidth` — лише content і padding'
      ],
      correct: 3,
      why: [
        'Хибно: getBoundingClientRect рахує відносно viewport і змінюється при скролі; координата в документі = top + scrollY.',
        'Хибно: offsetWidth — layout-розмір до transform, а rect.width — візуальний після scale.',
        'Хибно: кінець — коли scrollHeight − scrollTop − clientHeight < 1; scrollTop рахується від верху.',
        'Правильно: offset* — з border і scrollbar, client* — без них, scroll* — увесь вміст.',
        'Хибно: навпаки — clientWidth без border і scrollbar, offsetWidth — з ними.'
      ],
      hint: 'Що входить у кожну метрику: border, padding, scrollbar, прихований вміст, transform.',
      answer: `
| Метрика | Що включає |
|---|---|
| \`offsetWidth/Height\` | content + padding + border (+ scrollbar); \`0\` для \`display: none\` |
| \`clientWidth/Height\` | content + padding **без** border і scrollbar |
| \`scrollWidth/Height\` | увесь вміст, включно з прихованим |
| \`scrollTop/Left\` | скільки прокручено (можна записувати) |
| \`getBoundingClientRect()\` | відносно **viewport**, дробові, з урахуванням transform |

\`\`\`js
const pageTop = el.getBoundingClientRect().top + window.scrollY;
const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 1;
\`\`\`

**Продуктивність:** читання геометрії після запису стилів — forced layout; чергування в циклі — layout thrashing. Спочатку читання, потім записи.

**Альтернативи поллінгу:** \`ResizeObserver\`, \`IntersectionObserver\`.
`,
      keyPoints: [
        'offset* = з border; client* = без border і scrollbar; scroll* = весь вміст',
        'getBoundingClientRect — відносно viewport, дробові значення, з урахуванням transform',
        'scrollTop можна записувати; формула «прокручено до кінця» з допуском',
        'Читання геометрії викликає forced layout; не чергувати читання і запис',
        'ResizeObserver / IntersectionObserver як альтернативи поллінгу'
      ],
      followUps: [
        'Як отримати координати елемента відносно документа?',
        'Чому offsetWidth і getBoundingClientRect().width можуть відрізнятися?',
        'Як реалізувати «sticky» поведінку без position: sticky?'
      ]
    },
    {
      id: 'dom-quiz-client-width',
      group: 'sizes',
      type: 'quiz',
      level: 3,
      title: 'offsetWidth, clientWidth і transform',
      tags: ['sizes'],
      question: `
Ширина смуги прокрутки в браузері — **15px**. Що виведе код?

\`\`\`css
.box {
  box-sizing: content-box;
  width: 200px;
  height: 100px;
  padding: 10px;
  border: 5px solid;
  overflow-y: scroll;
}
\`\`\`

\`\`\`js
const box = document.querySelector('.box');
console.log(box.offsetWidth, box.clientWidth);
box.style.transform = 'scale(2)';
console.log(box.offsetWidth, box.getBoundingClientRect().width);
\`\`\`
`,
      options: ['`230 220` і `460 460`', '`200 200` і `230 230`', '`230 205` і `230 460`', '`230 205` і `460 460`'],
      answer: 2,
      why: [
        'Хибно: забули про scrollbar у clientWidth і що transform не змінює offsetWidth.',
        'Хибно: offsetWidth включає padding і border, а не лише CSS width.',
        'Правильно: 200+20+10 = 230; 220 − 15 = 205; transform не чіпає layout, а rect — 230·2 = 460.',
        'Хибно: transform не змінює layout, тож offsetWidth лишається 230.'
      ],
      hint: 'clientWidth не включає рамку і смугу прокрутки. Чи впливає transform на layout-розміри?',
      explanation: `
- \`offsetWidth\` = 200 + 2·10 + 2·5 = **230** (scrollbar забирає місце з content).
- \`clientWidth\` = 200 + 20 − 15 = **205**.
- \`transform\` не змінює layout → \`offsetWidth\` = 230; \`getBoundingClientRect().width\` = 230 · 2 = **460**.

Тому анімації через \`transform\` дешеві: вони не викликають layout.
`
    },
    {
      id: 'dom-client-vs-page', group: 'sizes', type: 'quiz', level: 2,
      title: 'clientY чи pageY',
      question: 'Сторінку прокручено на 300px вниз. Користувач клікає в точку за 100px від верхнього краю **вікна**. Чому дорівнюють `event.clientY` і `event.pageY`?',
      options: ['`100` і `400`', '`400` і `100`', '`100` і `100`', '`300` і `400`'],
      answer: 0,
      why: [
        'Так: clientY — відносно вікна (viewport), pageY — відносно всього документа (clientY + scrollY).',
        'Ні: навпаки.',
        'Ні: pageY враховує прокрутку.',
        'Ні: 300 — це scrollY, а не координата кліку.'
      ],
      hint: 'Одна система координат «приклеєна» до вікна, інша — до документа.',
      explanation: 'Дві системи координат: **відносно вікна** (`clientX/Y`, `getBoundingClientRect()`) — для `position: fixed` і перевірки видимості; **відносно документа** (`pageX/Y` = client + `scrollX/Y`) — для `position: absolute` на сторінці. Ще є `offsetX/Y` (відносно елемента-цілі) і `screenX/Y` (відносно екрана монітора).'
    },
    {
      id: 'dom-position-tooltip', group: 'sizes', type: 'dom', level: 3,
      title: 'Позиціювання підказки: flip і clamp',
      tags: ['getBoundingClientRect', 'scroll', 'tooltip'],
      description: `
**Завдання.** Напишіть \`positionTooltip(anchor, tooltip, gap = 8)\`. Підказка має \`position: absolute\` відносно документа.
1. За замовчуванням — **під** елементом на відстані \`gap\`, по центру горизонтально.
2. **Flip:** якщо знизу не вміщається у вікно (\`innerHeight\`), ставимо **над** елементом.
3. **Clamp:** по горизонталі не ближче ніж \`gap\` до лівого і правого країв вікна.
4. Сторінка може бути прокручена: записуйте в \`style.top/left\` **документні** координати.

**Де трапляється:** підказки, випадаючі меню, поповери. Так працюють Floating UI і Popper.js.

**Як це працює:** \`getBoundingClientRect()\` дає координати відносно вікна — по них перевіряємо, чи вміщається. Для \`position: absolute\` додаємо прокрутку: \`top + scrollY\`.
`,
      html: `<button id="anchor">Інфо</button>
<div id="tip" class="tip">Підказка</div>`,
      css: `body { margin: 0; }
#anchor {
  position: absolute; top: 100px; left: 200px;
  width: 100px; height: 20px; padding: 0; border: 0; box-sizing: border-box;
}
.tip {
  position: absolute; top: 0; left: 0;
  width: 80px; height: 30px; box-sizing: border-box;
  background: #111827; color: #fff; font: 12px sans-serif;
}`,
      js: `function positionTooltip(anchor, tooltip, gap = 8) {
  const a = anchor.getBoundingClientRect();
  const t = tooltip.getBoundingClientRect();

  // 1. top: під елементом; якщо не вміщається у вікно — над ним
  // 2. left: по центру, але в межах [gap, innerWidth - ширина - gap]
  // 3. Записати з урахуванням прокрутки (scrollX / scrollY)
}

// Спробуйте: positionTooltip(document.getElementById('anchor'), document.getElementById('tip'))
`,
      editable: ['js'],
      solution: {
        js: `function positionTooltip(anchor, tooltip, gap = 8) {
  const a = anchor.getBoundingClientRect();
  const t = tooltip.getBoundingClientRect();

  let top = a.bottom + gap;
  if (top + t.height > window.innerHeight) {
    top = a.top - gap - t.height;
  }

  let left = a.left + a.width / 2 - t.width / 2;
  left = Math.max(gap, Math.min(left, window.innerWidth - t.width - gap));

  tooltip.style.top = top + window.scrollY + 'px';
  tooltip.style.left = left + window.scrollX + 'px';
}
`
      },
      hints: ['Центр по горизонталі: `a.left + a.width / 2 - t.width / 2`. Flip: якщо `a.bottom + gap + t.height > innerHeight`, то `top = a.top - gap - t.height`.', 'Clamp: `Math.max(gap, Math.min(left, innerWidth - t.width - gap))`. Перед записом додайте `scrollY` і `scrollX`.'],
      tests: [
        { name: 'під елементом, по центру', code: "const a = $('#anchor');\nconst tip = $('#tip');\npositionTooltip(a, tip);\nexpect(tip.style.top).toBe('128px');\nexpect(tip.style.left).toBe('210px');" },
        { name: 'flip: не вміщається знизу — над елементом', code: "const a = $('#anchor');\nconst tip = $('#tip');\na.style.top = (innerHeight - 40) + 'px';\ntry {\n  positionTooltip(a, tip);\n  expect(tip.style.top).toBe((innerHeight - 40 - 8 - 30) + 'px');\n} finally { a.style.top = ''; }" },
        { name: 'clamp біля лівого і правого країв', code: "const a = $('#anchor');\nconst tip = $('#tip');\na.style.width = '20px';\ntry {\n  a.style.left = '0px';\n  positionTooltip(a, tip);\n  expect(tip.style.left).toBe('8px');\n  a.style.left = (innerWidth - 20) + 'px';\n  positionTooltip(a, tip);\n  expect(tip.style.left).toBe((innerWidth - 80 - 8) + 'px');\n} finally { a.style.left = ''; a.style.width = ''; }" },
        { name: 'сторінка прокручена', code: "const a = $('#anchor');\nconst tip = $('#tip');\ndocument.body.style.height = '3000px';\na.style.top = '400px';\nwindow.scrollTo(0, 300);\ntry {\n  positionTooltip(a, tip);\n  expect(tip.style.top).toBe('428px');\n  expect(Math.round(tip.getBoundingClientRect().top)).toBe(128);\n} finally { window.scrollTo(0, 0); a.style.top = ''; document.body.style.height = ''; }" }
      ],
      explanation: 'Перевірки — у координатах **вікна** (чи вміщається), запис — у координатах **документа** (бо `absolute`). Альтернатива — `position: fixed` для підказки: тоді прокрутку додавати не треба, але при скролі її треба перераховувати. У реальних бібліотеках є ще: перерахунок на `scroll`/`resize` (з rAF), прокручувані контейнери-предки, стрілка підказки, `shift` уздовж осі. Сучасний CSS-підхід — anchor positioning (`anchor-name`, `position-try`).'
    },
    // ---------------------------------------------------------------- MutationObserver, серіалізація, keyed-оновлення
    {
      id: 'dom-theory-mutation-observer',
      group: 'advanced',
      type: 'theory',
      level: 3,
      title: 'MutationObserver',
      tags: ['mutation-observer'],
      question: 'Що таке MutationObserver? Які зміни він відстежує, коли викликається колбек і для чого його застосовують на практиці?',
      choices: [
        'Колбек викликається синхронно одразу після кожної зміни, тому 1000 вставок дають 1000 викликів',
        'Колбек викликається в мікрозадачі після поточного коду, а всі зміни за цей час приходять пачкою',
        'MutationObserver бачить і атрибути, і властивості, тож відстежує введення користувача в `input.value`',
        'Колбек виконується в наступному кадрі перед рендерингом, так само як `requestAnimationFrame`',
        'Він стежить лише за прямими дітьми `target`; зміни глибше в дереві спостерігати неможливо'
      ],
      correct: 1,
      why: [
        'Хибно: так працювали застарілі Mutation Events; MO групує зміни і кличе колбек один раз.',
        'Правильно: колбек — мікрозадача після поточного коду, записи приходять пачкою.',
        'Хибно: MO бачить атрибути, а не властивості — введення в input.value він не помітить.',
        'Хибно: це мікрозадача, а не етап рендерингу на кшталт rAF.',
        'Хибно: subtree: true вмикає спостереження за всім піддеревом.'
      ],
      hint: 'Опції observe, мікрозадачі, пачки записів, takeRecords/disconnect.',
      answer: `
**MutationObserver** — асинхронне відстеження змін DOM (замінив синхронні Mutation Events).

\`\`\`js
const mo = new MutationObserver((records) => {
  for (const r of records) {
    if (r.type === 'childList') console.log(r.addedNodes, r.removedNodes);
    if (r.type === 'attributes') console.log(r.attributeName, r.oldValue);
  }
});
mo.observe(target, { childList: true, attributes: true, attributeOldValue: true, characterData: true, subtree: true });
mo.takeRecords(); // забрати накопичене синхронно
mo.disconnect();
\`\`\`

**Коли:** у мікрозадачі після поточного коду; 1000 вставок → один виклик з багатьма записами.

**Застосування:** реакція на сторонній DOM (віджети, CMS), автоініціалізація \`[data-widget]\`, тести «дочекатися елемента».

**Пастки:** зміна DOM у колбеку → нескінченний цикл; \`subtree\` на \`body\` — дорого; не бачить властивостей; забутий \`disconnect\`.
`,
      keyPoints: [
        'Асинхронне відстеження змін DOM: childList, attributes, characterData, subtree',
        'Колбек викликається в мікрозадачі, записи приходять пачкою',
        'takeRecords і disconnect',
        'Практичні сценарії: сторонній DOM, автоініціалізація, тести',
        'Пастки: нескінченний цикл, вартість subtree, не бачить властивостей'
      ],
      followUps: [
        'Чому Mutation Events визнали застарілими?',
        'Як дочекатися появи елемента в DOM за допомогою MutationObserver?',
        'Чим MutationObserver відрізняється від ResizeObserver?'
      ]
    },
    {
      id: 'dom-quiz-mo-async',
      group: 'advanced',
      type: 'quiz',
      level: 3,
      title: 'Коли спрацьовує MutationObserver',
      tags: ['mutation-observer', 'event-loop'],
      question: `
Що виведе код? (\`list\` — елемент \`<ul>\` у документі)

\`\`\`js
const mo = new MutationObserver(() => console.log('mutation'));
mo.observe(list, { childList: true });

list.append(document.createElement('li'));
setTimeout(() => console.log('timeout'));
list.append(document.createElement('li'));
Promise.resolve().then(() => console.log('promise'));
console.log('sync');
\`\`\`
`,
      options: [
        '`mutation` `mutation` `sync` `promise` `timeout`',
        '`sync` `promise` `mutation` `timeout`',
        '`sync` `mutation` `mutation` `promise` `timeout`',
        '`sync` `mutation` `promise` `timeout`'
      ],
      answer: 3,
      why: [
        'Хибно: колбек MO не синхронний — це мікрозадача після поточного коду.',
        'Хибно: мікрозадача MO поставлена в чергу раніше за then, тож mutation іде перед promise.',
        'Хибно: обидві вставки потрапляють в одну пачку — колбек викликається один раз.',
        'Правильно: sync → одна мікрозадача MO з двома записами → promise → timeout.'
      ],
      hint: 'Колбек викликається синхронно на кожну зміну чи асинхронно і пачкою? У якій черзі він опиняється відносно `then`?',
      explanation: `
1. Перша вставка ставить мікрозадачу MO в чергу; друга лише додає запис до тієї ж пачки.
2. \`then\` ставить свою мікрозадачу **після** MO.
3. \`sync\` → \`mutation\` (один раз, 2 записи) → \`promise\` → макрозадача \`timeout\`.
`
    },
    {
      id: 'dom-serialize-json',
      group: 'advanced',
      type: 'dom',
      level: 3,
      title: 'Серіалізація DOM у JSON і назад',
      tags: ['traversal', 'recursion', 'serialization'],
      description: `
**Завдання.** Напишіть \`serialize(node)\`, що перетворює DOM-піддерево на JSON-структуру, і \`deserialize(json)\`, що будує з неї DOM назад.

**Де трапляється:** снапшоти DOM у тестах, session replay (rrweb), збереження вмісту редактора, передача структури у Web Worker. Формат \`{ tag, attrs, children }\` — по суті віртуальний DOM, класика співбесід.

**Дано (HTML):** \`div#src.card[data-id="5"]\` з \`<h2>\`, коментарем і \`<p>\` з посиланням.

**Що написати**
- \`serialize(node)\`:
  - елемент → \`{ tag, attrs, children }\` (\`tag\` малими літерами, \`attrs\` — усі атрибути або \`{}\`, \`children\` — серіалізовані діти);
  - текстовий вузол → його текст як є; лише з пробілів → \`null\`;
  - коментар та інше → \`null\`; \`null\` у \`children\` не потрапляє.
- \`deserialize(json)\` → вузол: рядок → текстовий вузол, об'єкт → елемент з атрибутами й дітьми.

**Приклад**
\`\`\`js
// <a href="/x" class="link">Go <b>!</b></a>
serialize(a);
// { tag: 'a', attrs: { href: '/x', class: 'link' },
//   children: ['Go ', { tag: 'b', attrs: {}, children: ['!'] }] }
deserialize({ tag: 'p', attrs: {}, children: ['<b>x</b>'] }).textContent; // '<b>x</b>'
\`\`\`

**Як це працює:** рекурсія з розгалуженням за \`node.nodeType\`. Потрібен \`childNodes\`, а не \`children\` — текстові вузли теж вміст. \`node.attributes\` — колекція \`{ name, value }\`; \`localName\` — ім'я тегу малими літерами.

**Врахуйте:** текст у \`deserialize\` не парситься як HTML (\`createTextNode\`); round-trip через \`JSON.stringify\` має давати те саме.
`,
      html: `<div id="src" class="card" data-id="5">
  <h2>Заголовок</h2>
  <!-- коментар -->
  <p>Текст <a href="/more">далі</a></p>
</div>`,
      css: '',
      js: `function serialize(node) {
  // 1. TODO: текстовий вузол (Node.TEXT_NODE) → node.data або null, якщо лише пробіли
  // 2. TODO: не елемент → null
  // 3. TODO: attrs: for (const { name, value } of node.attributes) attrs[name] = value
  // 4. TODO: children: serialize кожного з node.childNodes, без null
  // 5. TODO: повернути { tag: node.localName, attrs, children }
}

function deserialize(json) {
  // 6. TODO: рядок → document.createTextNode(json)
  // 7. TODO: об'єкт → createElement(json.tag), setAttribute для attrs, append(deserialize(child))
}

// Спробуйте: serialize(document.getElementById('src'))
`,
      editable: ['js'],
      solution: {
        js: `function serialize(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.data.trim() === '' ? null : node.data;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null; // коментарі тощо

  const attrs = {};
  for (const { name, value } of node.attributes) attrs[name] = value;

  const children = [];
  for (const child of node.childNodes) {
    const s = serialize(child);
    if (s !== null) children.push(s);
  }
  return { tag: node.localName, attrs, children };
}

function deserialize(json) {
  if (typeof json === 'string') return document.createTextNode(json);
  const el = document.createElement(json.tag);
  for (const [name, value] of Object.entries(json.attrs || {})) el.setAttribute(name, value);
  for (const child of json.children || []) el.append(deserialize(child));
  return el;
}
`
      },
      hints: [
        "Розгалуження за `node.nodeType`: `Node.TEXT_NODE` (3) → рядок, `Node.ELEMENT_NODE` (1) → об'єкт, інше → `null`.",
        'Атрибути — `node.attributes` (NamedNodeMap з `name` і `value`); діти — `node.childNodes` (не `children`, бо потрібні текстові вузли) з рекурсією і фільтром `null`.',
        "`deserialize`: `document.createTextNode(str)` для рядків, `createElement` + `setAttribute` + рекурсивний `append` для об'єктів."
      ],
      tests: [
        { name: 'простий елемент з атрибутами й текстом', code: `const a = document.createElement('a');
a.setAttribute('href', '/x');
a.className = 'link';
a.textContent = 'Go';
expect(serialize(a)).toEqual({ tag: 'a', attrs: { href: '/x', class: 'link' }, children: ['Go'] });` },
        { name: 'вкладеність; пробільні вузли та коментарі пропускаються', code: `expect(serialize(document.getElementById('src'))).toEqual({
  tag: 'div',
  attrs: { id: 'src', class: 'card', 'data-id': '5' },
  children: [
    { tag: 'h2', attrs: {}, children: ['Заголовок'] },
    { tag: 'p', attrs: {}, children: ['Текст ', { tag: 'a', attrs: { href: '/more' }, children: ['далі'] }] }
  ]
});` },
        { name: 'текстовий вузол → рядок, коментар → null', code: `expect(serialize(document.createTextNode('  hi  '))).toBe('  hi  ');
expect(serialize(document.createComment('x'))).toBeNull();
expect(serialize(document.createElement('br'))).toEqual({ tag: 'br', attrs: {}, children: [] });` },
        { name: 'deserialize будує DOM', code: `const el = deserialize({ tag: 'p', attrs: { 'data-id': '1', title: 't' }, children: ['x ', { tag: 'i', attrs: {}, children: ['y'] }] });
expect(el.outerHTML).toBe('<p data-id="1" title="t">x <i>y</i></p>');` },
        { name: 'deserialize не парсить текст як HTML', code: `const el = deserialize({ tag: 'p', attrs: {}, children: ['<b>x</b>'] });
expect(el.children).toHaveLength(0);
expect(el.textContent).toBe('<b>x</b>');` },
        { name: 'round-trip через JSON.stringify', code: `const json = JSON.parse(JSON.stringify(serialize(document.getElementById('src'))));
const copy = deserialize(json);
expect(serialize(copy)).toEqual(json);
expect(copy.querySelector('a').getAttribute('href')).toBe('/more');
expect(copy).not.toBe(document.getElementById('src'));` }
      ],
      explanation: `
Рекурсивний обхід з розгалуженням за типом вузла; обидві функції — **O(n)**.

**Нюанси:** пропуск пробільних вузлів змінює \`<pre>\`; властивості (\`input.value\`) не є атрибутами і не серіалізуються; \`deserialize\` з ненадійних даних небезпечний (\`onclick\`, \`href="javascript:..."\`) — потрібен білий список атрибутів; SVG потребує \`createElementNS\`.

**Що спитають далі:** як знайти мінімальні зміни між двома такими деревами (diff)? Як обійти дуже глибоке дерево без рекурсії?
`
    },
    {
      id: 'dom-keyed-update',
      group: 'advanced',
      type: 'dom',
      level: 4,
      title: 'Keyed-оновлення списку (мінімальні зміни DOM)',
      tags: ['reconciliation', 'performance', 'mutation-observer'],
      description: `
**Завдання.** Напишіть \`updateList(ul, items)\` — оновлення списку «як у фреймворку з \`key\`»: перевикористовувати існуючі \`<li>\` і робити мінімум змін DOM.

**Де трапляється:** саме так React/Vue оновлюють списки з \`key\`; на співбесідах — «навіщо key і що буде без нього?». Ключ зберігає стан вузла (фокус, введений текст, анімацію) при перестановках.

**Дано (HTML):** порожній \`<ul id="todos">\`. Стартовий код — наївне повне перестворення.

**Що написати**
- \`updateList(ul, items)\` → нічого; \`items\` — масив \`{ id, text }\`, кожен \`<li>\` має \`data-key\` (рядок з \`id\`):
  - \`<li>\` з ключем, що є в \`items\`, — той самий вузол, навіть якщо змінилися позиція чи текст;
  - зайві ключі — видалити; нові — створити;
  - порядок \`<li>\` = порядок \`items\`, \`textContent\` = \`text\`.

**Приклад**
\`\`\`js
updateList(ul, [{ id: 1, text: 'a' }, { id: 2, text: 'b' }]);
const [n1, n2] = ul.children;
updateList(ul, [{ id: 2, text: 'b' }, { id: 1, text: 'a' }]);
ul.children[0] === n2; // true — вузол переміщено, а не створено заново
\`\`\`

**Як це працює:** \`Map\` ключ → існуючий \`<li>\`. Спершу видаляємо вузли зайвих ключів. Потім ідемо по \`items\` з індексом \`i\`: якщо на \`ul.children[i]\` вже потрібний вузол — нічого не робимо, інакше \`ul.insertBefore(li, ul.children[i] || null)\` (існуючий вузол переміститься).

**Врахуйте:** незмінні дані → **нуль** мутацій; додати один у кінець або видалити один → рівно одна мутація \`childList\`; \`textContent\` присвоюйте лише якщо текст змінився (присвоєння навіть того самого значення — мутація).
`,
      html: '<ul id="todos"></ul>',
      css: '',
      js: `function updateList(ul, items) {
  // Зараз: повне перестворення — втрачає стан вузлів і робить зайві мутації
  ul.innerHTML = '';
  for (const item of items) {
    const li = document.createElement('li');
    li.dataset.key = item.id;
    li.textContent = item.text;
    ul.append(li);
  }

  // 1. TODO: existing = new Map(); для кожного li з ul.children: existing.set(li.dataset.key, li)
  // 2. TODO: видалити li, чиїх ключів немає в items (ключі порівнюйте як рядки)
  // 3. TODO: items.forEach((item, i) => {
  //            li = existing.get(key) або новий <li data-key>
  //            textContent — лише якщо змінився
  //            якщо ul.children[i] !== li → ul.insertBefore(li, ul.children[i] || null)
  //          })
}
`,
      editable: ['js'],
      solution: {
        js: `function updateList(ul, items) {
  // 1. Індекс існуючих вузлів за ключем
  const existing = new Map();
  for (const li of ul.children) existing.set(li.dataset.key, li);

  // 2. Видаляємо ті, яких більше немає
  const wanted = new Set(items.map((item) => String(item.id)));
  for (const [key, li] of existing) {
    if (!wanted.has(key)) {
      li.remove();
      existing.delete(key);
    }
  }

  // 3. Проходимо цільовий порядок: перевикористовуємо/створюємо і ставимо на позицію i
  items.forEach((item, i) => {
    const key = String(item.id);
    let li = existing.get(key);
    if (!li) {
      li = document.createElement('li');
      li.dataset.key = key;
    }
    if (li.textContent !== item.text) li.textContent = item.text; // лише якщо змінився
    const ref = ul.children[i] || null;
    if (li !== ref) ul.insertBefore(li, ref); // переміщення/вставка лише за потреби
  });
}
`
      },
      hints: [
        'Побудуйте `Map` ключ → існуючий `<li>`. Спочатку видаліть вузли, ключів яких немає в новому масиві.',
        'Пройдіть `items` з індексом `i`: візьміть існуючий вузол або створіть новий. Якщо на позиції `ul.children[i]` уже стоїть саме він — нічого не робіть, інакше `ul.insertBefore(li, ul.children[i] || null)` (перемістить існуючий вузол).',
        'Текст присвоюйте лише якщо `li.textContent !== item.text` — будь-яке присвоєння `textContent` створює мутацію, навіть з тим самим значенням.'
      ],
      tests: [
        { name: 'початковий рендер у порожній список', code: `const ul = document.createElement('ul');
updateList(ul, [{ id: 1, text: 'a' }, { id: 2, text: 'b' }]);
expect(Array.from(ul.children).map((li) => [li.dataset.key, li.textContent])).toEqual([['1', 'a'], ['2', 'b']]);` },
        { name: 'перестановка зберігає ті самі вузли', code: `const ul = document.createElement('ul');
updateList(ul, [{ id: 1, text: 'a' }, { id: 2, text: 'b' }, { id: 3, text: 'c' }]);
const [n1, n2, n3] = ul.children;
updateList(ul, [{ id: 3, text: 'c' }, { id: 1, text: 'a' }, { id: 2, text: 'b' }]);
expect(Array.from(ul.children)).toEqual([n3, n1, n2]);
expect(ul.children[0]).toBe(n3);
expect(ul.children[1]).toBe(n1);` },
        { name: 'видалення, додавання і зміна тексту', code: `const ul = document.createElement('ul');
updateList(ul, [{ id: 1, text: 'a' }, { id: 2, text: 'b' }, { id: 3, text: 'c' }]);
const [n1, , n3] = ul.children;
updateList(ul, [{ id: 3, text: 'C!' }, { id: 4, text: 'd' }, { id: 1, text: 'a' }]);
expect(Array.from(ul.children).map((li) => [li.dataset.key, li.textContent])).toEqual([['3', 'C!'], ['4', 'd'], ['1', 'a']]);
expect(ul.children[0]).toBe(n3);
expect(ul.children[2]).toBe(n1);
expect(ul.querySelector('[data-key="2"]')).toBeNull();` },
        { name: 'незмінні дані → нуль мутацій', code: `const ul = $('#todos');
const data = [{ id: 1, text: 'a' }, { id: 2, text: 'b' }, { id: 3, text: 'c' }];
updateList(ul, data);
const mo = new MutationObserver(() => {});
mo.observe(ul, { childList: true, subtree: true, characterData: true, attributes: true });
try {
  updateList(ul, data.map((x) => ({ ...x })));
  expect(mo.takeRecords()).toHaveLength(0);
} finally { mo.disconnect(); ul.replaceChildren(); }` },
        { name: 'додавання в кінець і видалення одного — по одній мутації', code: `const ul = $('#todos');
updateList(ul, [{ id: 1, text: 'a' }, { id: 2, text: 'b' }, { id: 3, text: 'c' }]);
const mo = new MutationObserver(() => {});
mo.observe(ul, { childList: true, subtree: true, characterData: true, attributes: true });
try {
  updateList(ul, [{ id: 1, text: 'a' }, { id: 2, text: 'b' }, { id: 3, text: 'c' }, { id: 4, text: 'd' }]);
  let records = mo.takeRecords();
  expect(records).toHaveLength(1);
  expect(records[0].addedNodes).toHaveLength(1);
  updateList(ul, [{ id: 1, text: 'a' }, { id: 3, text: 'c' }, { id: 4, text: 'd' }]);
  records = mo.takeRecords();
  expect(records).toHaveLength(1);
  expect(records[0].removedNodes[0].dataset.key).toBe('2');
} finally { mo.disconnect(); ul.replaceChildren(); }` },
        { name: 'оновлення одного тексту не чіпає інші вузли', code: `const ul = document.createElement('ul');
updateList(ul, [{ id: 1, text: 'a' }, { id: 2, text: 'b' }]);
const mo = new MutationObserver(() => {});
mo.observe(ul, { childList: true, subtree: true, characterData: true });
updateList(ul, [{ id: 1, text: 'a' }, { id: 2, text: 'B' }]);
const records = mo.takeRecords();
mo.disconnect();
expect(records.length).toBeGreaterThan(0);
expect(records.every((r) => r.target === ul.children[1] || r.target.parentNode === ul.children[1])).toBe(true);` }
      ],
      explanation: `
Спрощена **reconciliation**: \`Map\` ключ → вузол, видалення зайвих, один прохід по цільовому порядку з \`insertBefore\` лише за потреби. Час — O(n) + кількість переміщень.

**Не мінімально за переміщеннями:** перенос першого елемента в кінець зсуне всі інші. Оптимум — найдовша зростаюча підпослідовність (LIS) старих індексів (Vue 3); React робить прохід з \`lastPlacedIndex\`.

**Чому без зайвих мутацій:** переміщення скидає стан вузла (CSS-анімацію, фокус) і дає роботу для стилів/layout.

**Що спитають далі:** що буде з ключем-індексом при вставці на початок? Як знайти LIS за O(n log n)?
`
    },
    {
      id: 'dom-textarea-caret', group: 'selection', type: 'quiz', level: 2,
      title: 'Курсор у textarea',
      question: 'Треба вставити емодзі в `<textarea>` **у позицію курсора**, а не в кінець. Що використати?',
      options: [
        '`textarea.selectionStart` / `selectionEnd` (або `setRangeText()`)',
        '`textarea.caretPosition`',
        '`textarea.value.length`',
        '`document.activeElement.offsetLeft`'
      ],
      answer: 0,
      why: [
        'Так: це межі виділення; якщо нічого не виділено, вони рівні й показують курсор.',
        'Ні: такої властивості немає.',
        'Ні: це завжди кінець тексту.',
        'Ні: це геометрія елемента, а не позиція в тексті.'
      ],
      hint: 'У полів вводу є власне API виділення, окреме від `window.getSelection()`.',
      explanation: '`textarea.setRangeText(\'😀\', textarea.selectionStart, textarea.selectionEnd, \'end\')` вставляє текст і ставить курсор після нього, а значення змінюється без втрати історії позиції. Для тексту на сторінці (не в полях) — `window.getSelection()` і `Range`.'
    },
    {
      id: 'dom-highlight-selection', group: 'selection', type: 'dom', level: 3,
      title: 'Підсвітити виділений текст',
      tags: ['Selection', 'Range', 'mark'],
      description: `
**Завдання.** Напишіть \`highlightSelection()\`:
- якщо нічого не виділено (немає діапазонів або виділення «згорнуте») → \`null\`;
- інакше обгорнути виділений фрагмент у \`<mark>\`, зняти виділення і повернути створений \`<mark>\`;
- має працювати, навіть коли виділення починається в тексті, а закінчується **всередині** іншого тегу.

**Де трапляється:** підсвітки й нотатки в читалках, «цитувати виділене» в коментарях, кнопки форматування в редакторах.

**Як це працює:** \`getSelection()\` — виділення користувача, \`getRangeAt(0)\` — його діапазон (\`Range\`). \`range.extractContents()\` вирізає фрагмент у \`DocumentFragment\`, при потребі розрізаючи теги на межах. \`range.insertNode(node)\` вставляє вузол на місце початку діапазону.
`,
      html: `<p id="text">Hello <b>big</b> world from JS</p>`,
      css: `mark { background: #fde68a; }`,
      js: `function highlightSelection() {
  const sel = window.getSelection();
  // 1. Нічого не виділено → null
  // 2. range = sel.getRangeAt(0); вирізати вміст у <mark>; вставити <mark>
  // 3. Зняти виділення, повернути mark
}
`,
      editable: ['js'],
      solution: {
        js: `function highlightSelection() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  const mark = document.createElement('mark');
  mark.appendChild(range.extractContents());
  range.insertNode(mark);
  sel.removeAllRanges();
  return mark;
}
`
      },
      hints: ['Порожнє виділення: `sel.rangeCount === 0 || sel.isCollapsed`.', '`range.surroundContents(mark)` кидає помилку, якщо виділення частково зачіпає тег. Надійніше: `mark.appendChild(range.extractContents()); range.insertNode(mark);`.'],
      tests: [
        { name: 'обгортає виділене слово', code: "const p = $('#text');\np.innerHTML = 'Hello world from JS';\nconst r = document.createRange();\nr.setStart(p.firstChild, 6);\nr.setEnd(p.firstChild, 11);\nconst sel = getSelection();\nsel.removeAllRanges();\nsel.addRange(r);\nconst mark = highlightSelection();\nexpect(mark.tagName).toBe('MARK');\nexpect(p.innerHTML).toBe('Hello <mark>world</mark> from JS');\nexpect(getSelection().rangeCount).toBe(0);" },
        { name: 'нічого не виділено → null', code: "getSelection().removeAllRanges();\nexpect(highlightSelection()).toBeNull();\nconst p = $('#text');\nconst r = document.createRange();\nr.setStart(p.firstChild, 2);\nr.collapse(true);\ngetSelection().addRange(r);\nexpect(highlightSelection()).toBeNull();" },
        { name: 'виділення частково зачіпає тег', code: "const p = $('#text');\np.innerHTML = 'Hello <b>big</b> world';\nconst r = document.createRange();\nr.setStart(p.firstChild, 3);\nr.setEnd(p.querySelector('b').firstChild, 2);\nconst sel = getSelection();\nsel.removeAllRanges();\nsel.addRange(r);\nconst mark = highlightSelection();\nexpect(mark.textContent).toBe('lo bi');\nexpect(p.textContent).toBe('Hello big world');" }
      ],
      explanation: '**Selection** — те, що виділив користувач (зазвичай один `Range`); **Range** — довільний фрагмент документа між двома точками (вузол + зміщення). `surroundContents` кидає `InvalidStateError`, якщо діапазон частково перетинає елемент, а `extractContents` коректно розрізає теги на межах. Для підсвітки без зміни DOM є CSS Custom Highlight API (`CSS.highlights` + `::highlight()`).'
    }
  ]
});
