FE.topic('web-components', {
  intro: `
**Web Components** — власні HTML-теги на стандартах браузера, без фреймворку.

| Частина | Що дає |
|---|---|
| **Custom Elements** | \`customElements.define('user-card', class extends HTMLElement {...})\` — свій тег з поведінкою |
| **Shadow DOM** | \`this.attachShadow({ mode: 'open' })\` — ізольоване дерево зі своїми стилями |
| **Слоти** | \`<slot>\` і \`<slot name="title">\` — куди потрапляє вміст, переданий ззовні |
| **\`<template>\`** | інертна розмітка для клонування |

Життєвий цикл: \`constructor\` → \`connectedCallback\` (вставлено в DOM) → \`attributeChangedCallback\` (лише для \`static observedAttributes\`) → \`disconnectedCallback\` (видалено, час прибрати слухачі й таймери).

Назва тегу **обов'язково містить дефіс**: \`user-card\`, а не \`usercard\`.
`,
  groups: [
    { id: 'custom-elements', title: 'Custom Elements і життєвий цикл' },
    { id: 'shadow', title: 'Shadow DOM, слоти і стилі' },
    { id: 'wc-events', title: 'Події, шаблони і місце серед фреймворків' }
  ],
  items: [
    {
      id: 'wc-name-hyphen', group: 'custom-elements', type: 'quiz', level: 1,
      title: 'Ім\'я власного тегу',
      question: `
Що станеться?

\`\`\`js
customElements.define('mybutton', class extends HTMLElement {});
\`\`\`
`,
      options: [
        'Тег `<mybutton>` зареєструється і працюватиме',
        'Буде помилка: ім\'я власного елемента має містити дефіс',
        'Тег зареєструється, але лише з `mode: \'open\'`',
        'Помилки не буде, але тег працюватиме як `<div>`'
      ],
      answer: 1,
      why: [
        'Ні: такі імена зарезервовані під майбутні стандартні теги.',
        'Так: DOMException (SyntaxError) — ім\'я невалідне.',
        'Ні: mode стосується Shadow DOM, а не реєстрації.',
        'Ні: define кидає виняток одразу.'
      ],
      hint: 'Як браузер відрізнить ваш тег від майбутнього стандартного `<mybutton>`?',
      explanation: 'Ім\'я custom element: малі літери, **обов\'язково з дефісом** (`my-button`, `x-icon`). Повторний `define` з тим самим ім\'ям теж кидає помилку — перевіряйте через `customElements.get(name)`. `customElements.whenDefined(name)` повертає проміс, корисний для лінивого завантаження компонентів.'
    },
    {
      id: 'wc-lifecycle', group: 'custom-elements', type: 'theory', level: 2, interview: true,
      title: 'Життєвий цикл custom element',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        '`connectedCallback` викликається при кожній вставці елемента в документ, тож може спрацювати кілька разів',
        '`disconnectedCallback` — місце, щоб зняти глобальні слухачі й зупинити таймери',
        '`attributeChangedCallback` спрацьовує для будь-якого атрибута, навіть без `observedAttributes`',
        'У конструкторі не варто читати атрибути й дітей: їх може ще не бути',
        'Елементи в HTML, що з\'явились до `define`, назавжди лишаються звичайними тегами'
      ],
      correct: [0, 1, 3],
      why: [
        'Так: переміщення елемента — це disconnect + connect.',
        'Так: інакше витік пам\'яті, як у будь-якого компонента.',
        'Ні: лише для імен у `static observedAttributes`.',
        'Так: при створенні через `document.createElement` атрибутів ще немає.',
        'Ні: після `define` браузер «апгрейдить» їх — викликає конструктор і колбеки.'
      ],
      hint: 'Подумайте про переміщення елемента в інше місце сторінки і про скрипт, що завантажився пізніше за HTML.',
      answer: `
\`\`\`js
class UserCard extends HTMLElement {
  static observedAttributes = ['name'];
  constructor() {
    super();                       // обов'язково першим
    this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {            // вставлено в DOM (може бути кілька разів)
    this.render();
    window.addEventListener('resize', this.onResize);
  }
  disconnectedCallback() {         // видалено — прибрати за собою
    window.removeEventListener('resize', this.onResize);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    this.render();                 // лише для observedAttributes
  }
  onResize = () => this.render();
  render() { /* ... */ }
}
customElements.define('user-card', UserCard);
\`\`\`

**Upgrade:** теги в HTML, що з'явились до \`define\`, спершу є «невизначеними» (\`:not(:defined)\` — зручно ховати їх до завантаження). Після \`define\` браузер створює їм екземпляри класу.

**Атрибути vs властивості:** атрибути — рядки в HTML, властивості — будь-які JS-значення. Компоненти зазвичай **віддзеркалюють** прості властивості в атрибути (\`get name() / set name()\`), а складні дані (масиви, об'єкти) передають лише властивостями.
`,
      keyPoints: [
        'constructor: super(), attachShadow; без читання атрибутів',
        'connectedCallback може спрацювати кілька разів',
        'disconnectedCallback — cleanup',
        'attributeChangedCallback — лише для observedAttributes',
        'Upgrade елементів, що з\'явились до define'
      ],
      followUps: ['Як передати в компонент масив об\'єктів?', 'Як сховати компонент до його реєстрації, щоб не було «стрибка»?']
    },
    {
      id: 'wc-user-badge', group: 'custom-elements', type: 'dom', level: 2,
      title: 'Перший компонент: <user-badge>',
      tags: ['customElements', 'observedAttributes'],
      description: `
**Завдання.** Створіть елемент \`<user-badge name="Ann" role="admin">\`, який показує текст:
- \`Ann · admin\`, якщо є \`role\`;
- \`Ann\`, якщо \`role\` немає.

Текст оновлюється при зміні атрибутів \`name\` і \`role\`. Shadow DOM тут не потрібен — рендеримо в \`textContent\`.

**Де трапляється:** бейджі, аватари, іконки, кнопки дизайн-системи — компоненти, які працюють у будь-якому фреймворку і на звичайній сторінці.

**Як це працює:** \`static observedAttributes = ['name', 'role']\` вмикає \`attributeChangedCallback\` для цих атрибутів; \`connectedCallback\` рендерить при вставці.
`,
      html: `<user-badge name="Ann" role="admin"></user-badge>
<user-badge name="Bob"></user-badge>`,
      css: `user-badge { display: inline-block; padding: 4px 10px; margin: 4px; border-radius: 999px; background: #e0e7ff; font: 14px sans-serif; }`,
      js: `class UserBadge extends HTMLElement {
  // TODO: static observedAttributes

  connectedCallback() {
    // TODO
  }

  attributeChangedCallback() {
    // TODO
  }

  render() {
    // TODO: textContent = name або 'name · role'
  }
}

// TODO: customElements.define(...)
`,
      editable: ['js'],
      solution: {
        js: `class UserBadge extends HTMLElement {
  static observedAttributes = ['name', 'role'];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const name = this.getAttribute('name') || '';
    const role = this.getAttribute('role');
    this.textContent = role ? name + ' · ' + role : name;
  }
}

customElements.define('user-badge', UserBadge);
`
      },
      hints: ['`static observedAttributes = [\'name\', \'role\'];` — без цього `attributeChangedCallback` не викличеться.', 'Реєстрація: `customElements.define(\'user-badge\', UserBadge)`.'],
      tests: [
        { name: 'елементи з HTML відрендерились', code: "const b = $$('user-badge');\nexpect(customElements.get('user-badge')).toBeTruthy();\nexpect(b[0].textContent).toBe('Ann · admin');\nexpect(b[1].textContent).toBe('Bob');" },
        { name: 'реагує на зміну атрибутів', code: "const b = $('user-badge');\nb.setAttribute('name', 'Kate');\nexpect(b.textContent).toBe('Kate · admin');\nb.removeAttribute('role');\nexpect(b.textContent).toBe('Kate');" },
        { name: 'створення з JS', code: "const el = document.createElement('user-badge');\nel.setAttribute('name', 'Ira');\ndocument.body.append(el);\ntry { expect(el.textContent).toBe('Ira'); } finally { el.remove(); }" }
      ],
      explanation: '`attributeChangedCallback` викликається і для атрибутів, що вже є в HTML, — ще до `connectedCallback`. Тому рендер має бути безпечним у будь-який момент. Для дизайн-систем на Web Components часто використовують Lit — тонкий шар над цими API з реактивними властивостями і шаблонами.'
    },
    {
      id: 'wc-observed-missing', group: 'custom-elements', type: 'quiz', level: 2,
      title: 'Чому attributeChangedCallback мовчить',
      question: `
Чому після \`el.setAttribute('label', 'OK')\` текст не змінюється?

\`\`\`js
class MyButton extends HTMLElement {
  attributeChangedCallback(name, oldV, newV) {
    this.textContent = newV;
  }
}
customElements.define('my-button', MyButton);
\`\`\`
`,
      options: [
        'Потрібно викликати `super.attributeChangedCallback()`',
        'Не оголошено `static observedAttributes = [\'label\']`',
        'Атрибути можна змінювати лише через властивості',
        'Колбек спрацьовує тільки до `connectedCallback`'
      ],
      answer: 1,
      why: [
        'Ні: у HTMLElement немає такого методу для виклику.',
        'Так: браузер стежить лише за атрибутами з цього списку — заради продуктивності.',
        'Ні: setAttribute — нормальний спосіб.',
        'Ні: колбек спрацьовує будь-коли.'
      ],
      hint: 'Звідки браузер знає, за якими атрибутами стежити?',
      explanation: '`observedAttributes` — статичний список; браузер читає його один раз при `define`. Стежити за всіма атрибутами всіх елементів було б дорого. Для довільних змін DOM є `MutationObserver`.'
    },
    {
      id: 'wc-shadow-encapsulation', group: 'shadow', type: 'theory', level: 2, interview: true,
      title: 'Що ізолює Shadow DOM',
      question: 'Оберіть **усі** правильні твердження про Shadow DOM.',
      choices: [
        '`document.querySelector()` не знаходить елементи всередині shadow root',
        'Глобальне правило `.title { color: red }` не застосується до `.title` всередині shadow root',
        'Успадковувані властивості (`color`, `font`) і CSS-змінні проходять усередину',
        '`mode: \'closed\'` — надійний захист: скрипти сторінки ніяк не дістануться до вмісту',
        '`::part(name)` дозволяє зовні стилізувати елемент з атрибутом `part="name"`',
        'Стилі з shadow root протікають на решту сторінки'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: пошук не перетинає межу shadow root.',
        'Так: селектори сторінки не бачать тіньове дерево.',
        'Так: на цьому будують темізацію компонентів (`--brand`).',
        'Ні: це не межа безпеки; closed лише незручніший для доступу.',
        'Так: компонент сам вирішує, що «відкрити» для стилізації.',
        'Ні: ізоляція працює в обидва боки.'
      ],
      hint: 'Ізоляція — це про селектори. А що проходить крізь межу за правилами успадкування?',
      answer: `
**Shadow DOM** — окреме дерево, прикріплене до елемента-хоста:

| Через межу | Проходить? |
|---|---|
| селектори сторінки всередину | ні |
| стилі компонента назовні | ні |
| успадковувані властивості (\`color\`, \`font-family\`) | так |
| CSS-змінні (\`--brand\`) | так — основний інструмент темізації |
| \`::part(name)\` | так, для елементів з \`part="name"\` |
| \`querySelector\` з document | ні (через \`el.shadowRoot\` — так, якщо \`open\`) |

**Стилі всередині:** \`:host\` (сам елемент), \`:host(.active)\`, \`:host-context()\`, \`::slotted(p)\` (лише верхній рівень вмісту слота).

**Спільні стилі** для багатьох компонентів — Constructable Stylesheets: \`shadowRoot.adoptedStyleSheets = [sheet]\`.
`,
      keyPoints: [
        'Селектори не перетинають межу ні туди, ні звідти',
        'Успадковувані властивості і CSS-змінні проходять',
        '::part — керований доступ до стилізації',
        ':host, ::slotted усередині компонента',
        'closed — не механізм безпеки'
      ]
    },
    {
      id: 'wc-fancy-card', group: 'shadow', type: 'dom', level: 3,
      title: '<fancy-card>: Shadow DOM, слоти і :host',
      tags: ['shadow DOM', 'slot', ':host', 'part'],
      description: `
**Завдання.** Створіть \`<fancy-card>\` з **відкритим** Shadow DOM. Усередині shadow root:
- \`<style>\`: \`:host { display: block; padding: 16px; border: 1px solid #ddd; border-radius: 12px; }\`;
- \`<header part="header"><slot name="title">Без назви</slot></header>\` — іменований слот із запасним текстом;
- \`<slot></slot>\` — слот за замовчуванням для решти вмісту.

**Де трапляється:** картки, модалки, вкладки в дизайн-системі. Зовнішні стилі сторінки не ламають компонент, а користувач компонента вирішує, **що** вставити в слоти.

**Як це працює:** елемент з \`slot="title"\` потрапляє в \`<slot name="title">\`, решта дітей — у слот без імені. Вміст фізично лишається в light DOM — його лише **показано** в місці слота.

**Врахуйте:** у CSS сторінки є правило \`header { color: red; }\` — воно не має потрапити всередину картки.
`,
      html: `<fancy-card id="a">
  <span slot="title">Заголовок</span>
  <p>Текст картки</p>
</fancy-card>
<fancy-card id="b">
  <p>Картка без заголовка</p>
</fancy-card>`,
      css: `body { font-family: sans-serif; }
/* Глобальний стиль сторінки — не має вплинути на header усередині картки */
header { color: red; }
fancy-card { margin: 12px; }`,
      js: `class FancyCard extends HTMLElement {
  constructor() {
    super();
    // TODO: attachShadow({ mode: 'open' }) і розмітка shadow root
  }
}

// TODO: customElements.define('fancy-card', FancyCard);
`,
      editable: ['js'],
      solution: {
        js: `class FancyCard extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = \`
      <style>
        :host { display: block; padding: 16px; border: 1px solid #ddd; border-radius: 12px; }
        header { font-weight: 700; margin-bottom: 8px; }
      </style>
      <header part="header"><slot name="title">Без назви</slot></header>
      <slot></slot>
    \`;
  }
}

customElements.define('fancy-card', FancyCard);
`
      },
      hints: ['`const root = this.attachShadow({ mode: \'open\' }); root.innerHTML = \\`<style>...</style>...\\`;`', 'Стилі самого елемента — через `:host { ... }` у `<style>` всередині shadow root.'],
      tests: [
        { name: 'відкритий shadow root і :host-стилі', code: "const a = $('#a');\nexpect(a.shadowRoot).toBeTruthy();\nexpect(css(a, 'display')).toBe('block');\nexpect(css(a, 'border-top-left-radius')).toBe('12px');" },
        { name: 'іменований і стандартний слоти', code: "const sr = $('#a').shadowRoot;\nconst title = sr.querySelector('slot[name=\"title\"]').assignedElements();\nexpect(title.map((e) => e.textContent)).toEqual(['Заголовок']);\nconst def = sr.querySelector('slot:not([name])').assignedElements();\nexpect(def.map((e) => e.tagName)).toEqual(['P']);" },
        { name: 'запасний текст, якщо заголовок не передали', code: "const slot = $('#b').shadowRoot.querySelector('slot[name=\"title\"]');\nexpect(slot.assignedNodes()).toHaveLength(0);\nexpect(slot.textContent).toBe('Без назви');" },
        { name: 'стилі сторінки не потрапили всередину', code: "const header = $('#a').shadowRoot.querySelector('header');\nexpect(header.getAttribute('part')).toBe('header');\nexpect(getComputedStyle(header).color).not.toBe('rgb(255, 0, 0)');\nexpect(document.querySelector('fancy-card header')).toBeNull();" }
      ],
      explanation: 'Слоти — це **композиція**, як `children` у React чи слоти у Vue. Вміст слота стилізує сторінка (він у light DOM), а компонент може торкнутися лише верхнього рівня через `::slotted()`. Для зовнішнього кастомізування — CSS-змінні (`--card-padding`) і `part`: `fancy-card::part(header) { color: navy; }`.'
    },
    {
      id: 'wc-event-retarget', group: 'wc-events', type: 'quiz', level: 3,
      title: 'event.target для кліку всередині Shadow DOM',
      question: `
Усередині shadow root елемента \`<my-button>\` є \`<button>\`. Користувач клікає по ньому. Що побачить слухач на \`document\`?

\`\`\`js
document.addEventListener('click', (e) => {
  console.log(e.target.tagName, e.composedPath()[0].tagName);
});
\`\`\`
`,
      options: ['`BUTTON BUTTON`', '`MY-BUTTON BUTTON`', '`MY-BUTTON MY-BUTTON`', 'Нічого: події з Shadow DOM не виходять назовні'],
      answer: 1,
      why: [
        'Ні: назовні target «перенацілюється» на хост, щоб не розкривати внутрішню будову.',
        'Так: retargeting для target, а повний шлях — у composedPath().',
        'Ні: composedPath() для open shadow root містить внутрішній button.',
        'Ні: click — composed-подія, вона перетинає межу.'
      ],
      hint: 'Сторінка не повинна «бачити» внутрішні елементи компонента, але подія спливає далі.',
      explanation: '**Retargeting:** для слухачів зовні `event.target` — сам хост. Нативні UI-події (`click`, `input`, `keydown`) мають `composed: true` і перетинають межу. **Власні** події за замовчуванням не виходять назовні: потрібно `new CustomEvent(\'change\', { bubbles: true, composed: true })`.'
    },
    {
      id: 'wc-counter-button', group: 'wc-events', type: 'dom', level: 3,
      title: '<counter-button>: стан, атрибут і власна подія',
      tags: ['CustomEvent', 'composed', 'shadow DOM'],
      description: `
**Завдання.** Створіть \`<counter-button count="0">\`:
- відкритий Shadow DOM з \`<button part="button">\`, у якому показано поточне число;
- клік по кнопці збільшує лічильник на 1, записує його в атрибут \`count\` і генерує подію \`count-change\` з \`detail: { count }\`, яка **спливає і виходить** за межі Shadow DOM;
- зміна атрибута \`count\` ззовні (\`setAttribute\`) оновлює число на кнопці;
- без атрибута — починати з 0.

**Де трапляється:** будь-який інтерактивний компонент дизайн-системи (лічильник у кошику, перемикач, рейтинг) повідомляє сторінку про зміни подією — так само, як нативний \`<input>\` генерує \`change\`.

**Як це працює:** зміни атрибутів, перелічених в \`observedAttributes\`, приходять в \`attributeChangedCallback\` (значення — рядки). Подію з тіньового DOM назовні надсилають \`new CustomEvent(name, { bubbles: true, composed: true })\`: саме \`composed\` дозволяє їй перетнути межу shadow root.
`,
      html: `<counter-button count="0"></counter-button>
<p>Подій: <output id="log">0</output></p>`,
      css: `body { font-family: sans-serif; }`,
      js: `class CounterButton extends HTMLElement {
  static observedAttributes = ['count'];

  constructor() {
    super();
    // TODO: shadow root з <button part="button">, обробник кліку
  }

  get count() {
    return Number(this.getAttribute('count')) || 0;
  }

  attributeChangedCallback() {
    // TODO: оновити текст кнопки
  }
}

customElements.define('counter-button', CounterButton);

// Сторінка слухає подію компонента
let events = 0;
document.addEventListener('count-change', () => {
  document.getElementById('log').textContent = ++events;
});
`,
      editable: ['js'],
      solution: {
        js: `class CounterButton extends HTMLElement {
  static observedAttributes = ['count'];

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = '<button part="button"></button>';
    this.button = root.querySelector('button');
    this.button.textContent = String(this.count);
    this.button.addEventListener('click', () => {
      const next = this.count + 1;
      this.setAttribute('count', String(next));
      this.dispatchEvent(new CustomEvent('count-change', {
        detail: { count: next },
        bubbles: true,
        composed: true,
      }));
    });
  }

  get count() {
    return Number(this.getAttribute('count')) || 0;
  }

  attributeChangedCallback() {
    this.button.textContent = String(this.count);
  }
}

customElements.define('counter-button', CounterButton);

// Сторінка слухає подію компонента
let events = 0;
document.addEventListener('count-change', () => {
  document.getElementById('log').textContent = ++events;
});
`
      },
      hints: ['Подія з хоста: `this.dispatchEvent(new CustomEvent(\'count-change\', { detail: { count }, bubbles: true, composed: true }))`.', 'Стан зберігається в атрибуті `count`, тож зміна ззовні і клік ідуть одним шляхом — через `attributeChangedCallback`.'],
      tests: [
        { name: 'клік збільшує лічильник і атрибут', code: "const el = $('counter-button');\nconst btn = el.shadowRoot.querySelector('button');\nexpect(btn.textContent).toBe('0');\nbtn.click();\nexpect(el.getAttribute('count')).toBe('1');\nexpect(btn.textContent).toBe('1');" },
        { name: 'подія доходить до document з detail', code: "const el = $('counter-button');\nconst seen = [];\nconst h = (e) => seen.push(e.detail.count);\ndocument.addEventListener('count-change', h);\ntry {\n  el.setAttribute('count', '4');\n  el.shadowRoot.querySelector('button').click();\n  expect(seen).toEqual([5]);\n} finally { document.removeEventListener('count-change', h); }" },
        { name: 'атрибут ззовні оновлює кнопку', code: "const el = $('counter-button');\nel.setAttribute('count', '42');\nexpect(el.shadowRoot.querySelector('button').textContent).toBe('42');" },
        { name: 'без атрибута — з нуля', code: "const el = document.createElement('counter-button');\ndocument.body.append(el);\ntry {\n  expect(el.shadowRoot.querySelector('button').textContent).toBe('0');\n  el.shadowRoot.querySelector('button').click();\n  expect(el.getAttribute('count')).toBe('1');\n} finally { el.remove(); }" }
      ],
      explanation: 'Принцип «**props down, events up**» — той самий, що в React і Vue: дані приходять атрибутами/властивостями, зміни повідомляються подіями. Без `composed: true` подія зупинилась би на shadow root, і сторінка її б не побачила. Атрибут як єдине джерело стану дає ще й CSS-стилізацію за станом: `counter-button[count="0"] { opacity: .6 }`.'
    },
    {
      id: 'wc-template-clone', group: 'wc-events', type: 'quiz', level: 2,
      title: '<template>: як використати вміст',
      question: 'На сторінці є `<template id="row"><tr><td class="name"></td></tr></template>`. Як правильно створити 100 рядків таблиці з цього шаблону?',
      options: [
        '`tbody.innerHTML += tpl.innerHTML` у циклі',
        '`const row = tpl.content.cloneNode(true)`, заповнити `.name` і `tbody.append(row)`',
        '`tbody.append(tpl)` 100 разів',
        '`document.importNode(tpl)` без аргументів'
      ],
      answer: 1,
      why: [
        'Ні: щоразу перепарсить уміст tbody — повільно і знищить слухачі.',
        'Так: `content` — DocumentFragment, глибока копія для кожного рядка.',
        'Ні: вставиться сам template, і лише один раз (вузол переміщується).',
        'Ні: потрібен `importNode(tpl.content, true)` — глибока копія вмісту.'
      ],
      hint: 'Вміст template — це не діти тегу, а окремий DocumentFragment.',
      explanation: '`<template>` — інертна розмітка: скрипти не виконуються, зображення не вантажаться, поки її не клонують. `template.content` — DocumentFragment; `cloneNode(true)` робить глибоку копію. Для Shadow DOM шаблон клонують у `shadowRoot.append(tpl.content.cloneNode(true))`. Для 100+ рядків вставляйте їх одним `DocumentFragment` — це один reflow.'
    },
    {
      id: 'wc-vs-frameworks', group: 'wc-events', type: 'theory', level: 3, interview: true,
      title: 'Web Components у реальних проєктах',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Web Components добре підходять для дизайн-систем, які мають працювати в React, Vue і на звичайних сторінках',
        'Для SSR існує Declarative Shadow DOM: `<template shadowrootmode="open">` у HTML',
        'Щоб компонент брав участь у `<form>` як поле вводу, використовують `ElementInternals` і `static formAssociated = true`',
        'Web Components замінюють керування станом застосунку, тому фреймворки не потрібні',
        '`aria-labelledby` не може посилатися на id з іншого боку межі Shadow DOM'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: стандарт браузера, не прив\'язаний до фреймворку.',
        'Так: shadow root рендериться з HTML ще до JS.',
        'Так: це дає валідацію, значення у FormData, reset.',
        'Ні: вони дають інкапсуляцію компонента, а не архітектуру стану чи роутинг.',
        'Так: ID-посилання не перетинають межу — відома проблема доступності.'
      ],
      hint: 'Що Web Components стандартизують, а чого в них немає зовсім?',
      answer: `
**Де Web Components сильні:** дизайн-системи для кількох фреймворків (Shoelace/Web Awesome, Material Web, Adobe Spectrum), віджети для вбудовування на чужі сайти, мікрофронтенди, поступова міграція.

**Обмеження й рішення:**
| Проблема | Рішення |
|---|---|
| SSR | Declarative Shadow DOM (\`<template shadowrootmode="open">\`) |
| участь у формах | \`ElementInternals\`, \`static formAssociated = true\` |
| ARIA-посилання крізь shadow root | ARIA через \`ElementInternals\` (\`internals.role\`, \`ariaLabel\`), структура без перетину межі |
| шаблони й реактивність | бібліотеки поверх стандартів (Lit) |

**Чого немає:** роутингу, керування станом застосунку, потоків даних — це рівень фреймворку. React 19 повноцінно підтримує custom elements (властивості й події).
`,
      keyPoints: [
        'Сильні в дизайн-системах і віджетах між фреймворками',
        'SSR — Declarative Shadow DOM',
        'Форми — ElementInternals і formAssociated',
        'ARIA ID-посилання не перетинають shadow root',
        'Стан і роутинг — не їхня зона'
      ]
    }
  ]
});
