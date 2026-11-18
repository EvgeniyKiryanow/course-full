FE.chapter('web-components-book', { body: `
Web Components — три стандарти браузера, з яких будують власні теги: **Custom Elements**, **Shadow DOM** і **\`<template>\`/слоти**. Працюють без фреймворку і в будь-якому фреймворку.

## Custom Elements і життєвий цикл

\`\`\`js
class UserCard extends HTMLElement {
  static observedAttributes = ['name'];

  constructor() {
    super();                                   // обов'язково першим
    this.attachShadow({ mode: 'open' });
  }
  connectedCallback() { this.render(); }       // вставлено в документ
  disconnectedCallback() { /* зняти слухачі, таймери */ }
  attributeChangedCallback(name, oldV, newV) { this.render(); }

  get name() { return this.getAttribute('name') ?? ''; }
  set name(v) { this.setAttribute('name', v); } // віддзеркалення властивості в атрибут

  render() { this.shadowRoot.textContent = 'Привіт, ' + this.name; }
}
customElements.define('user-card', UserCard);
\`\`\`
- ім'я **з дефісом**; повторний \`define\` — помилка (\`customElements.get\` для перевірки);
- \`connectedCallback\` може спрацювати **кілька разів** (переміщення елемента);
- \`attributeChangedCallback\` — лише для \`observedAttributes\`, викликається й для початкових атрибутів;
- у конструкторі не читайте атрибути й дітей;
- **upgrade:** теги в HTML до \`define\` стають компонентами після реєстрації; \`:not(:defined)\` — стилі до цього моменту; \`customElements.whenDefined()\`.

Атрибути — рядки (для HTML і CSS-селекторів), властивості — будь-які значення (масиви й об'єкти передають властивостями).

## Shadow DOM, слоти і стилі

\`attachShadow({ mode: 'open' })\` створює ізольоване дерево:
- селектори сторінки **не** бачать вміст, стилі компонента **не** протікають назовні;
- **проходять:** успадковувані властивості (\`color\`, \`font\`) і **CSS-змінні** — основа темізації;
- \`::part(name)\` — зовні стилізувати елементи з \`part="name"\`.

\`\`\`html
<!-- усередині shadow root -->
<style>
  :host { display: block; }               /* сам елемент */
  :host([disabled]) { opacity: .5; }      /* за атрибутом хоста */
  ::slotted(p) { margin: 0; }             /* верхній рівень вмісту слота */
</style>
<header part="header"><slot name="title">Без назви</slot></header>
<slot></slot>
\`\`\`
**Слоти** показують light DOM-дітей у потрібних місцях: \`slot="title"\` → іменований слот, решта → слот за замовчуванням. Вміст фізично лишається в light DOM (стилізується сторінкою). Події: \`slotchange\`; методи: \`assignedElements()\`.

Спільні стилі для багатьох компонентів — \`adoptedStyleSheets\` з \`new CSSStyleSheet()\`.

## Події, шаблони і місце серед фреймворків

**Події:** назовні \`event.target\` перенацілюється на хост (retargeting); повний шлях — \`event.composedPath()\`. Власні події, щоб вийти з shadow root, потребують \`{ bubbles: true, composed: true }\`. Принцип **props down, events up**: дані — атрибутами/властивостями, зміни — подіями.

**\`<template>\`** — інертна розмітка: \`tpl.content.cloneNode(true)\` для кожного екземпляра.

**Реальні проєкти:**
| Задача | Рішення |
|---|---|
| SSR | Declarative Shadow DOM: \`<template shadowrootmode="open">\` |
| поле форми | \`static formAssociated = true\` + \`attachInternals()\` (значення, валідація) |
| доступність | ARIA-ідентифікатори не перетинають shadow root; \`internals.role\`, \`internals.ariaLabel\` |
| зручність | Lit: реактивні властивості + шаблони поверх стандартів |

Сильні сторони: дизайн-системи для кількох фреймворків, віджети для чужих сайтів, мікрофронтенди. Чого немає: роутингу, стану застосунку — це рівень фреймворку.

## Типові питання

- **Три частини Web Components?** Custom Elements, Shadow DOM, templates/slots.
- **Колбеки життєвого циклу?** connected, disconnected, attributeChanged (+observedAttributes), adopted.
- **Що проходить крізь Shadow DOM?** Успадковувані властивості, CSS-змінні, ::part; не селектори.
- **Як вивести власну подію з shadow root?** composed: true (+ bubbles).
- **Web Components vs React?** Стандарт інкапсуляції компонента vs бібліотека стану й рендерингу; добре поєднуються.
`});
