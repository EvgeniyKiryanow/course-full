FE.chapter('dom-book', { body: `
DOM — об'єктне представлення документа, з яким працює JS. Ефективна робота з DOM — це правильні методи, мінімум перерахунків layout і безпека вставки контенту.

## DOM-дерево і пошук елементів

- вузли: \`Element\`, \`Text\`, \`Comment\`, \`Document\`, \`DocumentFragment\`; \`nodeType\`;
- пошук: \`querySelector\` / \`querySelectorAll\` (CSS-селектори; \`querySelectorAll\` повертає **статичний** \`NodeList\`), \`getElementById\`, \`getElementsByClassName\`/\`TagName\` (**живі** \`HTMLCollection\` — оновлюються при змінах DOM);
- \`el.closest(sel)\` — найближчий предок (включно з собою) — основа делегування; \`el.matches(sel)\` — чи відповідає селектору;
- пошук у межах елемента: \`container.querySelector(...)\` — швидше і безпечніше за глобальний.

## Обхід дерева

| Усі вузли | Лише елементи |
|---|---|
| \`parentNode\` | \`parentElement\` |
| \`childNodes\` | \`children\` |
| \`firstChild\` / \`lastChild\` | \`firstElementChild\` / \`lastElementChild\` |
| \`nextSibling\` / \`previousSibling\` | \`nextElementSibling\` / \`previousElementSibling\` |

Пробіли й переноси між тегами — текстові вузли, тому \`childNodes\` часто «містить зайве». \`contains(node)\` — чи є нащадком. Для обходу великих дерев — \`TreeWalker\`.

## Створення, вставка, видалення вузлів

\`\`\`js
const li = document.createElement('li');
li.textContent = item.title;
list.append(li);                         // в кінець (кілька вузлів і рядків)
list.prepend(header);                    // на початок
li.before(x); li.after(y); li.replaceWith(z); li.remove();
list.insertAdjacentHTML('beforeend', html);   // beforebegin | afterbegin | beforeend | afterend
const copy = li.cloneNode(true);         // глибока копія (без обробників!)
\`\`\`
Вставка **існуючого** вузла **переміщує** його. \`replaceChildren(...nodes)\` — замінити весь вміст.

## Вміст: innerHTML vs textContent

- \`textContent\` — текст усіх нащадків; запис — **безпечно** (текст не парситься як HTML);
- \`innerText\` — видимий текст з урахуванням CSS (викликає layout — повільніше);
- \`innerHTML\` — парсинг HTML: **XSS-ризик** з даними користувача; перезаписує всіх нащадків (втрачаються обробники і стан полів);
- безпечна вставка розмітки з даними: \`createElement\` + \`textContent\`, шаблони з екрануванням, санітизація (DOMPurify), Trusted Types; новіше — \`setHTML()\` з Sanitizer API.

## Атрибути, властивості, класи, стилі

- **атрибут** — у HTML (рядок): \`getAttribute/setAttribute/hasAttribute/removeAttribute\`; **властивість** — у DOM-об'єкті (будь-який тип): \`input.value\`, \`el.id\`, \`checkbox.checked\`;
- часто синхронізовані, але не завжди: \`value\`-атрибут — **початкове** значення, \`value\`-властивість — поточне; \`href\`-властивість — абсолютний URL;
- \`data-*\` → \`el.dataset\`;
- класи: \`classList.add/remove/toggle(cls, force)/contains/replace\`;
- стилі: \`el.style.color\` — inline; \`style.setProperty('--x', v)\` для змінних; \`getComputedStyle(el)\` — підсумкові стилі (читання може викликати layout). Краще перемикати класи, ніж писати inline-стилі.

## Пакетні вставки: fragment і template

\`\`\`js
const frag = document.createDocumentFragment();
for (const item of items) {
  const li = tpl.content.cloneNode(true);       // <template id="row">…</template>
  li.querySelector('.title').textContent = item.title;
  frag.append(li);
}
list.append(frag);                               // одна вставка — один reflow
\`\`\`
- \`DocumentFragment\` — легкий контейнер поза DOM; при вставці переносяться його діти;
- \`<template>\` — інертна розмітка (скрипти не виконуються, зображення не вантажаться) — \`content.cloneNode(true)\`;
- для дуже довгих списків — віртуалізація.

## Розміри, прокрутка і координати

| | Що це |
|---|---|
| \`getBoundingClientRect()\` | позиція і розмір відносно **вікна** (з transform) |
| \`offsetWidth/Height\`, \`offsetTop/Left\` | розмір з padding і border; зсув відносно \`offsetParent\` |
| \`clientWidth/Height\` | без border і скролбара |
| \`scrollWidth/Height\`, \`scrollTop/Left\` | повний вміст і прокрутка |

Координати вікна (\`clientX/Y\`, \`getBoundingClientRect\`) — для \`fixed\` і перевірки видимості; документа (\`pageX/Y\` = client + \`scrollX/Y\`) — для \`absolute\`. Позиціювання підказки: перевірка, чи вміщається, у координатах вікна (flip, clamp), запис з додаванням прокрутки. Прокрутка: \`scrollIntoView({ behavior: 'smooth', block: 'center' })\`, \`scrollTo\`. Читання геометрії після запису стилів — **forced reflow**: спершу читання, потім записи.

## MutationObserver, серіалізація, keyed-оновлення

- **MutationObserver** — асинхронне (мікрозадачею) сповіщення про зміни DOM: \`childList\`, \`attributes\`, \`characterData\`, \`subtree\`; застосування — сторонні віджети, автоматична ініціалізація, аналітика; \`disconnect()\`;
- **серіалізація:** \`outerHTML\`, \`XMLSerializer\`; парсинг рядка в документ — \`DOMParser\` (скрипти не виконуються);
- **keyed-оновлення списку:** перевикористовувати наявні вузли за ключем (\`data-id\`), переміщувати замість перестворення — зберігаються фокус, введений текст, анімації (так працюють ключі у фреймворках).

## Виділення тексту: Selection і Range

\`\`\`js
const sel = getSelection();
if (sel.rangeCount && !sel.isCollapsed) {
  const range = sel.getRangeAt(0);
  const mark = document.createElement('mark');
  mark.append(range.extractContents());      // розрізає теги на межах
  range.insertNode(mark);
  sel.removeAllRanges();
}
\`\`\`
- **Selection** — виділення користувача; **Range** — фрагмент документа між двома точками (вузол + зміщення);
- \`surroundContents\` кидає помилку, якщо діапазон частково зачіпає елемент;
- поля вводу — окреме API: \`selectionStart/End\`, \`setSelectionRange\`, \`setRangeText()\`;
- підсвітка без зміни DOM — CSS Custom Highlight API (\`::highlight()\`).

## Типові питання

- **querySelectorAll vs getElementsByClassName (статичний vs живий)?**
- **innerHTML vs textContent vs innerText?**
- **Атрибут vs властивість?**
- **Як ефективно вставити 1000 елементів?**
- **getBoundingClientRect vs offset*; clientY vs pageY?**
- **Що таке forced reflow?**
- **Навіщо MutationObserver?**
`});
