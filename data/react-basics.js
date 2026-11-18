(function () {
const HTML = '<div id="root"></div>';
const CSS = `body { font-family: system-ui, sans-serif; padding: 12px; }
button { padding: 4px 10px; margin: 2px; }
.card { border: 1px solid #ddd; border-radius: 10px; padding: 12px; margin: 8px 0; }
.card--out { opacity: .6; }
.done { text-decoration: line-through; color: #888; }
.error { color: #c00; font-size: 13px; }`;

FE.topic('react-basics', {
  intro: `
**React** — бібліотека для побудови інтерфейсу з **компонентів**: функцій, що повертають опис UI (JSX). Ви вже знаєте все, на чому він стоїть:

| У React | Ви вже бачили |
|---|---|
| JSX → \`React.createElement(type, props, ...children)\` | \`h()\` у проєкті «Свій міні-фреймворк» |
| компонент = функція \`(props) => JSX\` | чисті функції (модуль «Функціональне програмування») |
| \`useState\` — комірки стану за порядком викликів | крок 5 міні-фреймворку |
| стан — **знімок**, оновлення — новий об'єкт | замикання + іммутабельність |
| \`key\` у списках | крок 6 міні-фреймворку |
| \`onClick\` на корені застосунку | делегування подій |

**Як перевіряються задачі.** Ви пишете компоненти (можна \`import { useState } from 'react'\`). Тести рендерять їх через \`mount(Компонент, props)\`, натискають кнопки \`act(() => click(...))\`, вводять текст \`act(() => typeInto(input, 'текст'))\`. У вкладці «Перегляд» автоматично рендериться ваш компонент **\`App\`** — зручно перевіряти руками.
`,
  groups: [
    { id: 'jsx', title: 'JSX і компоненти' },
    { id: 'lists', title: 'Списки, умови і ключі' },
    { id: 'state', title: 'Події і стан' },
    { id: 'forms', title: 'Форми: контрольовані поля' },
    { id: 'lifting', title: 'Підйом стану і потік даних' }
  ],
  items: [
    // ---------------------------------------------------------------- JSX
    {
      id: 'rb-quiz-jsx', group: 'jsx', type: 'quiz', level: 1, interview: true,
      title: 'На що компілюється JSX',
      question: `
На що перетворюється цей JSX (класичний рантайм)?

\`\`\`jsx
<button className="primary" onClick={save}>Зберегти</button>
\`\`\`
`,
      options: [
        'На HTML-рядок, який React потім вставляє в сторінку через innerHTML',
        '`React.createElement(\'button\', { … }, \'Зберегти\')`',
        'На виклик `document.createElement(\'button\')` прямо в цьому рядку',
        'На шаблон, який браузер розуміє без жодної компіляції'
      ],
      answer: 1,
      why: [
        'Ні: React не використовує innerHTML — тому текст із даних безпечний від XSS.',
        'Так: це той самий `h(type, props, ...children)`, який ви писали в міні-фреймворку.',
        'Ні: DOM створюється пізніше, під час рендеру (commit).',
        'Ні: JSX — розширення синтаксису, його компілює Babel/TS/esbuild.'
      ],
      hint: 'Пригадайте крок 1 проєкту «Свій міні-фреймворк».',
      explanation: 'JSX — синтаксичний цукор для виклику функції, що повертає об\'єкт (React element). Тому в JSX: `className` замість `class` (зарезервоване слово JS), `htmlFor` замість `for`, `style` — об\'єкт (`style={{ color: \'red\' }}`), у `{}` — лише **вирази** (не `if`/`for`). Новий рантайм (React 17+) компілює в `jsx()` з автоматичним імпортом.'
    },
    {
      id: 'rb-greeting', group: 'jsx', type: 'dom', runtime: 'react', level: 1,
      title: 'Перший компонент і props',
      description: `
**Завдання.** Напишіть компонент \`Greeting\`, що приймає \`name\` і повертає \`<h1>Привіт, {name}!</h1>\`. Якщо \`name\` не передали — \`Привіт, гостю!\`.

**Де трапляється:** будь-який інтерфейс складається з таких маленьких компонентів з параметрами.

**Аналогія:** компонент — звичайна функція, props — її аргументи (об'єкт). Значення за замовчуванням — як у деструктуризації параметрів: \`function Greeting({ name = 'гостю' })\`.

**Як це працює:** назва компонента — з **великої** літери: так JSX відрізняє компонент від HTML-тегу.
`,
      html: HTML, css: CSS,
      js: `function Greeting(props) {
  // TODO: деструктуризуйте name зі значенням за замовчуванням і поверніть <h1>
  return null;
}

function App() {
  return <Greeting name="світ" />;
}
`,
      editable: ['js'],
      solution: { js: `function Greeting({ name = 'гостю' }) {
  return <h1>Привіт, {name}!</h1>;
}

function App() {
  return <Greeting name="світ" />;
}
` },
      hints: ['`function Greeting({ name = \'гостю\' }) { ... }`', 'У JSX значення вставляють у фігурних дужках: `<h1>Привіт, {name}!</h1>`.'],
      tests: [
        { name: 'з іменем', code: "const m = mount(Greeting, { name: 'Ann' });\nexpect(m.container.querySelector('h1').textContent).toBe('Привіт, Ann!');" },
        { name: 'без імені', code: "const m = mount(Greeting);\nexpect(m.container.querySelector('h1').textContent).toBe('Привіт, гостю!');" },
        { name: 'текст не інтерпретується як HTML', code: "const m = mount(Greeting, { name: '<b>x</b>' });\nexpect(m.container.querySelector('b')).toBeNull();" }
      ],
      explanation: 'Props — **лише для читання**: компонент не змінює їх (як чиста функція не змінює аргументи). Текст у `{}` React вставляє як текстовий вузол — XSS через підстановку неможливий (на відміну від `innerHTML`). Для HTML з даних є лише свідомо незручний `dangerouslySetInnerHTML`.'
    },
    {
      id: 'rb-product-card', group: 'jsx', type: 'dom', runtime: 'react', level: 1,
      title: 'Картка товару: props, умови, className',
      description: `
**Завдання.** Напишіть \`ProductCard({ title, price, inStock })\`:
- \`<article>\` з класом \`card\`, а якщо товару немає — \`card card--out\`;
- \`<h3>\` з назвою, \`<p className="price">\` з ціною у форматі \`1 299 грн\` (через \`toLocaleString('uk-UA')\`);
- якщо \`inStock === false\` — \`<span className="badge">Немає в наявності</span>\`, інакше бейджа немає.

**Де трапляється:** каталоги, списки, дашборди — компонент показує дані з props за правилами.

**Як це працює:** в атрибутах JSX — вирази: \`className={inStock ? 'card' : 'card card--out'}\`. Умовний елемент — \`{!inStock && <span>…</span>}\`.
`,
      html: HTML, css: CSS,
      js: `function ProductCard({ title, price, inStock }) {
  // TODO
  return null;
}

function App() {
  return (
    <>
      <ProductCard title="Навушники" price={1299} inStock />
      <ProductCard title="Колонка" price={2499} inStock={false} />
    </>
  );
}
`,
      editable: ['js'],
      solution: { js: `function ProductCard({ title, price, inStock }) {
  return (
    <article className={inStock ? 'card' : 'card card--out'}>
      <h3>{title}</h3>
      <p className="price">{price.toLocaleString('uk-UA')} грн</p>
      {!inStock && <span className="badge">Немає в наявності</span>}
    </article>
  );
}

function App() {
  return (
    <>
      <ProductCard title="Навушники" price={1299} inStock />
      <ProductCard title="Колонка" price={2499} inStock={false} />
    </>
  );
}
` },
      hints: ['`className={inStock ? \'card\' : \'card card--out\'}`', 'Бейдж: `{!inStock && <span className="badge">Немає в наявності</span>}`.'],
      tests: [
        { name: 'у наявності', code: "const m = mount(ProductCard, { title: 'A', price: 1299, inStock: true });\nconst a = m.container.querySelector('article');\nexpect(a.className).toBe('card');\nexpect(a.querySelector('h3').textContent).toBe('A');\nexpect(a.querySelector('.price').textContent.replace(/\\s/g, ' ')).toBe('1 299 грн');\nexpect(a.querySelector('.badge')).toBeNull();" },
        { name: 'немає в наявності', code: "const m = mount(ProductCard, { title: 'B', price: 10, inStock: false });\nexpect(m.container.querySelector('article').className).toBe('card card--out');\nexpect(m.container.querySelector('.badge').textContent).toBe('Немає в наявності');" }
      ],
      explanation: 'Булевий проп без значення (`<ProductCard inStock />`) — це `true`. `<>...</>` — **фрагмент**: кілька елементів без зайвої обгортки в DOM. Форматування чисел — через `Intl`/`toLocaleString`, як у модулі «Рядки і числа»; українська локаль використовує нерозривний пробіл як роздільник тисяч.'
    },
    {
      id: 'rb-card-children', group: 'jsx', type: 'dom', runtime: 'react', level: 2,
      title: 'Композиція: children',
      description: `
**Завдання.** Напишіть компонент-обгортку \`Panel({ title, children, footer })\`:
- \`<section className="card">\` → \`<h2>{title}</h2>\` → \`<div className="body">{children}</div>\`;
- якщо передано \`footer\` — \`<footer>{footer}</footer>\`, інакше футера немає.

**Де трапляється:** модалки, картки, макети сторінок — обгортка задає структуру, а вміст передає той, хто її використовує.

**Аналогія:** \`children\` — як \`<slot>\` у Web Components: компонент вирішує **де**, а батько — **що**.

**Як це працює:** усе між \`<Panel>\` і \`</Panel>\` приходить у проп \`children\`; передати JSX можна і через звичайний проп (\`footer={<button>OK</button>}\`).
`,
      html: HTML, css: CSS,
      js: `function Panel({ title, children, footer }) {
  // TODO
  return null;
}

function App() {
  return (
    <Panel title="Профіль" footer={<button>Зберегти</button>}>
      <p>Ім'я: Ann</p>
    </Panel>
  );
}
`,
      editable: ['js'],
      solution: { js: `function Panel({ title, children, footer }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="body">{children}</div>
      {footer && <footer>{footer}</footer>}
    </section>
  );
}

function App() {
  return (
    <Panel title="Профіль" footer={<button>Зберегти</button>}>
      <p>Ім'я: Ann</p>
    </Panel>
  );
}
` },
      hints: ['`children` — звичайний проп: `<div className="body">{children}</div>`.', 'Футер: `{footer && <footer>{footer}</footer>}`.'],
      tests: [
        { name: 'children у body', code: "const m = mount(Panel, { title: 'T', children: React.createElement('p', null, 'вміст') });\nexpect(m.container.querySelector('h2').textContent).toBe('T');\nexpect(m.container.querySelector('.body p').textContent).toBe('вміст');\nexpect(m.container.querySelector('footer')).toBeNull();" },
        { name: 'footer як проп', code: "const m = mount(Panel, { title: 'T', footer: React.createElement('button', null, 'OK') });\nexpect(m.container.querySelector('footer button').textContent).toBe('OK');" }
      ],
      explanation: 'Композиція — головний спосіб повторного використання в React (замість наслідування). Передавати JSX у пропси (`footer`, `icon`, `actions`) — патерн «слоти». Це ж розв\'язує **prop drilling** без Context: замість протягувати дані крізь 5 рівнів, передайте вже готовий елемент.'
    },
    // ---------------------------------------------------------------- lists
    {
      id: 'rb-todo-list', group: 'lists', type: 'dom', runtime: 'react', level: 1, interview: true,
      title: 'Список з ключами',
      description: `
**Завдання.** Напишіть \`TodoList({ todos })\`, де \`todos\` — масив \`{ id, text, done }\`:
- \`<ul>\` з \`<li key={id}>\` для кожної задачі; виконані — з класом \`done\`;
- порожній масив → \`<p>Немає задач</p>\` (без \`<ul>\`).

**Де трапляється:** будь-який список із даних: замовлення, коментарі, результати пошуку. Неправильний \`key\` — частий баг, коли введений текст «переїжджає» в сусідній рядок.

**Аналогія:** \`map\` → масив елементів; \`key\` — ідентичність елемента між рендерами, як \`__key\` у кроці 6 міні-фреймворку.

**Як це працює:** \`key\` ставлять на елемент, що повертається з \`map\` (зовнішній), він має бути унікальним серед сусідів і стабільним (\`id\` з даних, не індекс).
`,
      html: HTML, css: CSS,
      js: `function TodoList({ todos }) {
  // TODO
  return null;
}

function App() {
  return <TodoList todos={[{ id: 1, text: 'Вивчити JSX', done: true }, { id: 2, text: 'Вивчити хуки', done: false }]} />;
}
`,
      editable: ['js'],
      solution: { js: `function TodoList({ todos }) {
  if (todos.length === 0) return <p>Немає задач</p>;
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id} className={t.done ? 'done' : undefined}>{t.text}</li>
      ))}
    </ul>
  );
}

function App() {
  return <TodoList todos={[{ id: 1, text: 'Вивчити JSX', done: true }, { id: 2, text: 'Вивчити хуки', done: false }]} />;
}
` },
      hints: ['`{todos.map((t) => <li key={t.id}>{t.text}</li>)}`', 'Ранній `return` для порожнього списку; клас — `className={t.done ? \'done\' : undefined}`.'],
      tests: [
        { name: 'елементи і клас done', code: "const m = mount(TodoList, { todos: [{ id: 1, text: 'a', done: true }, { id: 2, text: 'b', done: false }] });\nconst li = m.container.querySelectorAll('li');\nexpect([...li].map((x) => x.textContent)).toEqual(['a', 'b']);\nexpect(li[0].className).toBe('done');\nexpect(li[1].className).toBe('');" },
        { name: 'порожній список', code: "const m = mount(TodoList, { todos: [] });\nexpect(m.container.querySelector('ul')).toBeNull();\nexpect(m.container.textContent).toBe('Немає задач');" },
        { name: 'немає попереджень про key', code: "clearLogs();\nmount(TodoList, { todos: [{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: false }] });\nexpect(getLogs().join(' ')).not.toContain('unique \"key\"');" }
      ],
      explanation: 'Без `key` React у dev-режимі попереджає («Each child in a list should have a unique key») і зіставляє елементи за позицією — стан рядків «переїжджає» при вставці чи видаленні. `className={undefined}` прибирає атрибут, а `\'\'` залишив би порожній `class`.'
    },
    {
      id: 'rb-quiz-zero', group: 'lists', type: 'quiz', level: 2,
      title: 'Пастка: 0 && <Компонент />',
      question: `
\`count\` дорівнює \`0\`. Що відрендерить компонент?

\`\`\`jsx
function Badge({ count }) {
  return <div>{count && <b>нові</b>}</div>;
}
\`\`\`
`,
      options: ['Порожній `<div>`', '`<div>0</div>`', '`<div><b>нові</b></div>`', 'Помилку рендеру'],
      answer: 1,
      why: [
        'Ні: `0 && X` повертає 0, а число React рендерить як текст.',
        'Так: false, null, undefined, true не рендеряться, а 0 і NaN — так.',
        'Ні: `&&` з falsy лівим операндом повертає лівий операнд.',
        'Ні: 0 — валідний дочірній елемент.'
      ],
      hint: 'Що повертає `0 && щось` у JavaScript? А що React робить з числом?',
      explanation: 'Правильно: `{count > 0 && <b>нові</b>}` або тернарний `{count ? <b/> : null}`. Це той самий випадок, що в кроці 1 міні-фреймворку: `null/undefined/true/false` відкидаються, а числа перетворюються на текст.'
    },
    {
      id: 'rb-quiz-key-place', group: 'lists', type: 'quiz', level: 2,
      title: 'Де ставити key',
      question: `
Список рендериться через компонент \`Row\`. Куди поставити \`key\`?

\`\`\`jsx
function Row({ user }) {
  return <li>{user.name}</li>;
}
function List({ users }) {
  return <ul>{users.map((u) => <Row user={u} />)}</ul>;
}
\`\`\`
`,
      options: [
        'На `<Row key={u.id} user={u} />` у `map`',
        'На `<li key={user.id}>` всередині Row',
        'На `<ul key="list">`',
        'В обидва місця — і на Row, і на li'
      ],
      answer: 0,
      why: [
        'Так: key потрібен елементам масиву, тобто тому, що повертає map.',
        'Ні: всередині Row li — єдиний елемент, key там нічого не дає.',
        'Ні: ul — не елемент масиву.',
        'Ні: key на li зайвий; важливий лише рівень масиву.'
      ],
      hint: 'React зіставляє між рендерами елементи **масиву**. Що в цьому масиві?',
      explanation: '`key` — не проп компонента (усередині `Row` `props.key` недоступний), а підказка React для зіставлення сусідніх елементів. Потрібен там, де є масив: результат `map`, `filter`, `Array.from`.'
    },
    // ---------------------------------------------------------------- state
    {
      id: 'rb-counter', group: 'state', type: 'dom', runtime: 'react', level: 1,
      title: 'Лічильник: useState і обробники',
      description: `
**Завдання.** Напишіть \`Counter({ initial = 0, step = 1 })\`:
- \`<output>\` з поточним значенням;
- кнопки \`−\`, \`+\` (зменшити/збільшити на \`step\`) і \`Скинути\` (повернути \`initial\`).

**Де трапляється:** кількість товару в кошику, номер сторінки, крок форми — найпростіший локальний стан.

**Аналогія:** \`useState\` — комірка стану компонента (крок 5 міні-фреймворку); виклик сетера планує новий рендер з новим значенням.

**Як це працює:** \`onClick={() => setCount(count + step)}\` — передаємо **функцію**, а не результат виклику (\`onClick={setCount(1)}\` викличеться під час рендеру і зациклить його).
`,
      html: HTML, css: CSS,
      js: `import { useState } from 'react';

function Counter({ initial = 0, step = 1 }) {
  // TODO: const [count, setCount] = useState(initial);
  return (
    <div>
      <button>−</button>
      <output>{initial}</output>
      <button>+</button>
      <button>Скинути</button>
    </div>
  );
}

function App() {
  return <Counter initial={10} step={5} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState } from 'react';

function Counter({ initial = 0, step = 1 }) {
  const [count, setCount] = useState(initial);
  return (
    <div>
      <button onClick={() => setCount((c) => c - step)}>−</button>
      <output>{count}</output>
      <button onClick={() => setCount((c) => c + step)}>+</button>
      <button onClick={() => setCount(initial)}>Скинути</button>
    </div>
  );
}

function App() {
  return <Counter initial={10} step={5} />;
}
` },
      hints: ['`const [count, setCount] = useState(initial);`', 'Обробник: `onClick={() => setCount((c) => c + step)}`.'],
      tests: [
        { name: '+ і − з кроком', code: "const m = mount(Counter, { initial: 10, step: 5 });\nconst [minus, plus] = m.container.querySelectorAll('button');\nawait act(() => click(plus));\nawait act(() => click(plus));\nawait act(() => click(minus));\nexpect(m.container.querySelector('output').textContent).toBe('15');" },
        { name: 'скидання і значення за замовчуванням', code: "const m = mount(Counter);\nconst b = m.container.querySelectorAll('button');\nawait act(() => click(b[1]));\nexpect(m.container.querySelector('output').textContent).toBe('1');\nawait act(() => click(b[2]));\nexpect(m.container.querySelector('output').textContent).toBe('0');" },
        { name: 'лічильники незалежні', code: "const a = mount(Counter);\nconst b = mount(Counter);\nawait act(() => click(a.container.querySelectorAll('button')[1]));\nexpect(a.container.querySelector('output').textContent).toBe('1');\nexpect(b.container.querySelector('output').textContent).toBe('0');" }
      ],
      explanation: 'Кожен екземпляр компонента має власний стан — як кожен виклик фабрики має власне замикання. `useState(initial)` використовує `initial` лише на першому рендері: зміна пропа `initial` пізніше стан не змінить (для цього — `key` або ефект синхронізації).'
    },
    {
      id: 'rb-quiz-snapshot', group: 'state', type: 'quiz', level: 2, interview: true,
      title: 'Стан — знімок: три setCount поспіль',
      question: `
\`n\` дорівнює 0. Що буде виведено в консоль і яким стане \`n\` після кліку?

\`\`\`jsx
<button onClick={() => {
  setN(n + 1);
  setN(n + 1);
  setN(n + 1);
  console.log(n);
}}>+</button>
\`\`\`
`,
      options: [
        'Виведе `0`, n стане `1`',
        'Виведе `3`, n стане `3`',
        'Виведе `0`, n стане `3`',
        'Виведе `1`, n стане `1`'
      ],
      answer: 0,
      why: [
        'Так: у цьому рендері n — константа 0; тричі ставимо «1».',
        'Ні: сетер не змінює змінну n одразу.',
        'Ні: щоб отримати 3, потрібні функціональні оновлення `setN((x) => x + 1)`.',
        'Ні: console.log бачить значення цього рендеру — 0.'
      ],
      hint: 'n — це `const` з замикання поточного рендеру. Що робить сетер — змінює змінну чи планує новий рендер?',
      explanation: '**Стан — знімок**: кожен рендер має власні константи props і state, обробники бачать значення **свого** рендеру (замикання). Сетер ставить оновлення в чергу; кілька оновлень в одному обробнику React групує (batching) в один рендер. `setN((x) => x + 1)` тричі отримає 0 → 1 → 2 → 3 — саме так працював `setValue(next)` з функцією у кроці 5 міні-фреймворку.'
    },
    {
      id: 'rb-tags', group: 'state', type: 'dom', runtime: 'react', level: 2,
      title: 'Масив у стані: додати й видалити без мутацій',
      description: `
**Завдання.** Напишіть \`TagEditor({ initial = [] })\`:
- поле \`<input>\` і кнопка \`Додати\`: додає тег (без пробілів по краях), якщо він непорожній і ще не існує; після додавання поле очищується;
- список \`<li>\` з тегом і кнопкою \`×\` (видаляє цей тег).

**Де трапляється:** теги статті, вибрані фільтри, список отримувачів листа — стан-масив, який оновлюють без мутацій, інакше React не перерендерить.

**Аналогія:** оновлення масиву в стані — як у модулі «Функціональне програмування»: \`[...tags, tag]\` і \`tags.filter(...)\`, а не \`push\`/\`splice\`.

**Як це працює:** React порівнює старий і новий стан через \`Object.is\`. Мутований той самий масив = «нічого не змінилось» → рендеру не буде.
`,
      html: HTML, css: CSS,
      js: `import { useState } from 'react';

function TagEditor({ initial = [] }) {
  const [tags, setTags] = useState(initial);
  const [text, setText] = useState('');

  function add() {
    // TODO: trim, перевірки, новий масив, очистити поле
  }

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={add}>Додати</button>
      <ul>
        {/* TODO: теги з кнопкою × */}
      </ul>
    </div>
  );
}

function App() {
  return <TagEditor initial={['react', 'js']} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState } from 'react';

function TagEditor({ initial = [] }) {
  const [tags, setTags] = useState(initial);
  const [text, setText] = useState('');

  function add() {
    const tag = text.trim();
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
    setText('');
  }

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={add}>Додати</button>
      <ul>
        {tags.map((t) => (
          <li key={t}>
            {t} <button onClick={() => setTags(tags.filter((x) => x !== t))}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return <TagEditor initial={['react', 'js']} />;
}
` },
      hints: ['Додати: `setTags([...tags, tag])`; видалити: `setTags(tags.filter((x) => x !== t))`.', 'Тег — унікальний рядок, тож він і є стабільним `key`.'],
      tests: [
        { name: 'додавання і очищення поля', code: "const m = mount(TagEditor, { initial: ['a'] });\nconst field = m.container.querySelector('input');\nawait act(() => typeInto(field, '  react '));\nawait act(() => click(m.container.querySelector('button')));\nexpect([...m.container.querySelectorAll('li')].map((li) => li.firstChild.textContent.trim())).toEqual(['a', 'react']);\nexpect(field.value).toBe('');" },
        { name: 'дублікати й порожні не додаються', code: "const m = mount(TagEditor, { initial: ['a'] });\nconst field = m.container.querySelector('input');\nawait act(() => typeInto(field, 'a'));\nawait act(() => click(m.container.querySelector('button')));\nawait act(() => typeInto(field, '   '));\nawait act(() => click(m.container.querySelector('button')));\nexpect(m.container.querySelectorAll('li')).toHaveLength(1);" },
        { name: 'видалення і незмінність initial', code: "const initial = ['a', 'b'];\nconst m = mount(TagEditor, { initial });\nawait act(() => click(m.container.querySelectorAll('li button')[0]));\nexpect(m.container.querySelectorAll('li')).toHaveLength(1);\nexpect(initial).toEqual(['a', 'b']);" }
      ],
      explanation: 'Перевірка «нічого не змінилось» через `Object.is` — та сама ідея, що в іммутабельних оновленнях Redux і в селекторах. Мутація `tags.push(x); setTags(tags)` — класичний баг «стан змінився, а екран — ні». Для глибоко вкладеного стану — спред на кожному рівні або Immer (`useImmer`).'
    },
    {
      id: 'rb-quiz-mutate', group: 'state', type: 'quiz', level: 2,
      title: 'Мутація масиву в стані',
      question: `
Що станеться після кліку?

\`\`\`jsx
const [items, setItems] = useState([1]);
<button onClick={() => { items.push(2); setItems(items); }}>
  {items.length}
</button>
\`\`\`
`,
      options: [
        'Компонент перерендериться, і кнопка покаже число 2',
        'Перерендеру не буде — посилання те саме',
        'React кине помилку про пряму мутацію стану компонента',
        'Компонент перерендериться двічі — до і після push'
      ],
      answer: 1,
      why: [
        'Ні: React порівнює посилання, а посилання те саме.',
        'Так: `Object.is(старий, новий)` → true, оновлення пропускається.',
        'Ні: React не відстежує мутації (на відміну від Vue).',
        'Ні: рендеру не буде зовсім.'
      ],
      hint: 'Як React дізнається, що стан змінився?',
      explanation: 'Масив **змінився в пам\'яті**, але React цього не бачить — екран показує старе значення, доки щось інше не викличе рендер (тоді «раптом» з\'явиться 2 — важкий для пошуку баг). Порівняйте з Vue: там реактивність на Proxy відстежує мутації, і `items.push(2)` працює.'
    },
    // ---------------------------------------------------------------- forms
    {
      id: 'rb-signup-form', group: 'forms', type: 'dom', runtime: 'react', level: 2, interview: true,
      title: 'Контрольована форма з валідацією',
      description: `
**Завдання.** Напишіть \`SignupForm({ onSubmit })\`:
- поля \`email\` і \`password\` (\`type="password"\`) та чекбокс \`agree\` — **контрольовані** (значення в стані);
- кнопка \`Зареєструватися\` (\`type="submit"\`) **вимкнена**, доки форма невалідна: email містить \`@\`, пароль ≥ 8 символів, чекбокс увімкнено;
- якщо пароль непорожній, але коротший за 8 — під полем \`<p className="error">Мінімум 8 символів</p>\`;
- при відправці: \`preventDefault()\` і \`onSubmit({ email, password })\`.

**Де трапляється:** реєстрація, логін, оформлення замовлення — контрольовані поля з валідацією є майже в кожному застосунку.

**Аналогія:** відправка — подія \`submit\` форми (модуль «Події»), а не \`click\` кнопки: так працює і Enter у полі.

**Як це працює:** контрольоване поле: \`value={email}\` + \`onChange={(e) => setEmail(e.target.value)}\`; для чекбокса — \`checked\` і \`e.target.checked\`. Валідність — **похідне** значення, обчислюється під час рендеру, а не зберігається в стані.
`,
      html: HTML, css: CSS,
      js: `import { useState } from 'react';

function SignupForm({ onSubmit }) {
  // TODO: стан полів, похідна valid, обробник submit
  return (
    <form>
      <input name="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Пароль" />
      <label><input name="agree" type="checkbox" /> Погоджуюсь з умовами</label>
      <button type="submit">Зареєструватися</button>
    </form>
  );
}

function App() {
  return <SignupForm onSubmit={(data) => console.log('submit', data)} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState } from 'react';

function SignupForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const valid = email.includes('@') && password.length >= 8 && agree;

  function handleSubmit(e) {
    e.preventDefault();
    if (valid) onSubmit({ email, password });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input name="password" type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
      {password && password.length < 8 && <p className="error">Мінімум 8 символів</p>}
      <label><input name="agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> Погоджуюсь з умовами</label>
      <button type="submit" disabled={!valid}>Зареєструватися</button>
    </form>
  );
}

function App() {
  return <SignupForm onSubmit={(data) => console.log('submit', data)} />;
}
` },
      hints: ['Три `useState` і похідне `const valid = email.includes(\'@\') && password.length >= 8 && agree;`.', '`<form onSubmit={handleSubmit}>`, у ньому `e.preventDefault()`; кнопці — `disabled={!valid}`.'],
      tests: [
        { name: 'кнопка вимкнена до валідності', code: "const m = mount(SignupForm, { onSubmit: mockFn() });\nconst btn = m.container.querySelector('button');\nexpect(btn.disabled).toBe(true);\nawait act(() => typeInto(m.container.querySelector('[name=email]'), 'a@b.c'));\nawait act(() => typeInto(m.container.querySelector('[name=password]'), '12345678'));\nexpect(btn.disabled).toBe(true);\nawait act(() => click(m.container.querySelector('[name=agree]')));\nexpect(btn.disabled).toBe(false);" },
        { name: 'підказка про короткий пароль', code: "const m = mount(SignupForm, { onSubmit: mockFn() });\nexpect(m.container.querySelector('.error')).toBeNull();\nawait act(() => typeInto(m.container.querySelector('[name=password]'), '123'));\nexpect(m.container.querySelector('.error').textContent).toBe('Мінімум 8 символів');" },
        { name: 'onSubmit з даними', code: "const onSubmit = mockFn();\nconst m = mount(SignupForm, { onSubmit });\nawait act(() => typeInto(m.container.querySelector('[name=email]'), 'a@b.c'));\nawait act(() => typeInto(m.container.querySelector('[name=password]'), 'secret123'));\nawait act(() => click(m.container.querySelector('[name=agree]')));\nawait act(() => submit(m.container.querySelector('form')));\nexpect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.c', password: 'secret123' });" }
      ],
      explanation: 'Контрольоване поле — React джерело правди: значення завжди в стані, тому легко валідувати, форматувати й скидати. Неконтрольоване (`defaultValue` + `ref` або `FormData` при submit) — менше рендерів, простіше для великих форм; на ньому побудований React Hook Form. У React 19 є ще **actions** (`<form action={fn}>`, `useActionState`) — у модулі «React глибше».'
    },
    {
      id: 'rb-quiz-controlled', group: 'forms', type: 'quiz', level: 2,
      title: 'value без onChange',
      question: 'Що станеться з полем `<input value={name} />` без `onChange`?',
      options: [
        'Поле «заморозиться», а React попередить у консолі',
        'Поле працюватиме як звичайне, а `name` оновиться автоматично',
        'React кине помилку і взагалі не відрендерить компонент',
        'Значення збережеться лише в DOM, але не в стані компонента'
      ],
      answer: 0,
      why: [
        'Так: React повертає value до `name` на кожному рендері; dev-попередження пропонує onChange, readOnly або defaultValue.',
        'Ні: двостороннього зв\'язування в React немає (на відміну від v-model у Vue).',
        'Ні: це лише попередження.',
        'Ні: React примусово ставить value зі стану.'
      ],
      hint: 'Хто в контрольованому полі — джерело правди?',
      explanation: 'Варіанти: контрольоване (`value` + `onChange`), лише для читання (`readOnly`), неконтрольоване з початковим значенням (`defaultValue`). Порівняйте з Vue: `v-model` — двостороннє зв\'язування, яке компілюється в ту саму пару `value` + `input`.'
    },
    // ---------------------------------------------------------------- lifting state
    {
      id: 'rb-temperature', group: 'lifting', type: 'dom', runtime: 'react', level: 2,
      title: 'Підйом стану: синхронні поля',
      description: `
**Завдання.** Напишіть \`TemperatureConverter\`, що містить два компоненти \`TemperatureInput({ label, value, onChange })\`:
- поле «Цельсій» і поле «Фаренгейт»; зміна будь-якого оновлює інше (F = C × 9/5 + 32);
- значення округлюються до 1 знака після коми; порожнє поле → інше теж порожнє.

**Де трапляється:** два поля, що мають бути синхронними: конвертер валют, ціна з ПДВ і без, діапазон дат «від — до».

**Аналогія:** «props down, events up» — як \`<counter-button>\` з модуля Web Components: дочірній компонент не має власного стану, він отримує \`value\` і повідомляє про зміни через \`onChange\`.

**Як це працює:** **підйом стану** — спільний стан живе в найближчому спільному батькові. Зберігайте одне значення (і шкалу, з якої його ввели), а друге **обчислюйте**.
`,
      html: HTML, css: CSS,
      js: `import { useState } from 'react';

function TemperatureInput({ label, value, onChange }) {
  return (
    <label>
      {label}: <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function TemperatureConverter() {
  // TODO: один стан { scale, value } і обчислення другого поля
  return (
    <div>
      <TemperatureInput label="Цельсій" value="" onChange={() => {}} />
      <TemperatureInput label="Фаренгейт" value="" onChange={() => {}} />
    </div>
  );
}

function App() {
  return <TemperatureConverter />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState } from 'react';

function TemperatureInput({ label, value, onChange }) {
  return (
    <label>
      {label}: <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

const round1 = (x) => String(Math.round(x * 10) / 10);

function TemperatureConverter() {
  const [scale, setScale] = useState('c');
  const [value, setValue] = useState('');
  const num = parseFloat(value);
  const valid = value.trim() !== '' && !Number.isNaN(num);
  const celsius = scale === 'c' ? value : valid ? round1(((num - 32) * 5) / 9) : '';
  const fahrenheit = scale === 'f' ? value : valid ? round1((num * 9) / 5 + 32) : '';

  return (
    <div>
      <TemperatureInput label="Цельсій" value={celsius} onChange={(v) => { setScale('c'); setValue(v); }} />
      <TemperatureInput label="Фаренгейт" value={fahrenheit} onChange={(v) => { setScale('f'); setValue(v); }} />
    </div>
  );
}

function App() {
  return <TemperatureConverter />;
}
` },
      hints: ['Зберігайте лише `{ scale, value }`: що ввели і в якому полі. Друге поле — обчислюване.', 'C → F: `num * 9 / 5 + 32`; F → C: `(num - 32) * 5 / 9`; округлення — `Math.round(x * 10) / 10`.'],
      tests: [
        { name: 'Цельсій → Фаренгейт', code: "const m = mount(TemperatureConverter);\nconst [c, f] = m.container.querySelectorAll('input');\nawait act(() => typeInto(c, '100'));\nexpect(f.value).toBe('212');\nawait act(() => typeInto(c, '37'));\nexpect(f.value).toBe('98.6');" },
        { name: 'Фаренгейт → Цельсій і порожнє', code: "const m = mount(TemperatureConverter);\nconst [c, f] = m.container.querySelectorAll('input');\nawait act(() => typeInto(f, '32'));\nexpect(c.value).toBe('0');\nawait act(() => typeInto(f, ''));\nexpect(c.value).toBe('');" }
      ],
      explanation: 'Якби кожне поле мало власний стан і синхронізувалось ефектами — два джерела правди і «мерехтіння» оновлень. Одне джерело правди + обчислення під час рендеру — базове правило React (і архітектури взагалі, див. «Похідний стан»).'
    },
    {
      id: 'rb-searchable-list', group: 'lifting', type: 'dom', runtime: 'react', level: 2,
      title: 'Фільтр списку: похідний стан',
      description: `
**Завдання.** Напишіть \`SearchableList({ items })\` (\`items\` — масив рядків):
- поле пошуку; список \`<li>\` лише з елементами, що містять запит (без урахування регістру й пробілів по краях);
- \`<p className="count">Знайдено: N</p>\`;
- у стані — **лише** запит; відфільтрований список обчислюється під час рендеру.

**Де трапляється:** фільтр каталогу, пошук у контактах чи налаштуваннях. Часта помилка — тримати відфільтрований список в окремому стані.

**Аналогія:** похідний стан не зберігають — як \`total\` кошика в модулі «Архітектура»: інакше два джерела правди розійдуться.
`,
      html: HTML, css: CSS,
      js: `import { useState } from 'react';

function SearchableList({ items }) {
  const [query, setQuery] = useState('');
  // TODO: const visible = ...
  return (
    <div>
      <input placeholder="Пошук" value={query} onChange={(e) => setQuery(e.target.value)} />
      <p className="count">Знайдено: {items.length}</p>
      <ul>{/* TODO */}</ul>
    </div>
  );
}

function App() {
  return <SearchableList items={['React', 'Vue', 'Svelte', 'Angular', 'Preact']} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState } from 'react';

function SearchableList({ items }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const visible = items.filter((item) => item.toLowerCase().includes(q));
  return (
    <div>
      <input placeholder="Пошук" value={query} onChange={(e) => setQuery(e.target.value)} />
      <p className="count">Знайдено: {visible.length}</p>
      <ul>{visible.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}

function App() {
  return <SearchableList items={['React', 'Vue', 'Svelte', 'Angular', 'Preact']} />;
}
` },
      hints: ['`const visible = items.filter((x) => x.toLowerCase().includes(query.trim().toLowerCase()));`', 'І лічильник, і список беруть `visible`.'],
      tests: [
        { name: 'фільтрація без регістру', code: "const m = mount(SearchableList, { items: ['React', 'Vue', 'Preact'] });\nawait act(() => typeInto(m.container.querySelector('input'), ' REACT '));\nexpect([...m.container.querySelectorAll('li')].map((li) => li.textContent)).toEqual(['React', 'Preact']);\nexpect(m.container.querySelector('.count').textContent).toBe('Знайдено: 2');" },
        { name: 'без запиту — усі', code: "const m = mount(SearchableList, { items: ['a', 'b'] });\nexpect(m.container.querySelectorAll('li')).toHaveLength(2);" },
        { name: 'зміна items від батька враховується', code: "const m = mount(SearchableList, { items: ['a'] });\nm.rerender({ items: ['a', 'ab', 'c'] });\nawait act(() => typeInto(m.container.querySelector('input'), 'a'));\nexpect(m.container.querySelectorAll('li')).toHaveLength(2);" }
      ],
      explanation: 'Якщо фільтрація дорога (тисячі елементів, складні умови) — `useMemo(() => filter(...), [items, query])`, а не окремий стан з ефектом синхронізації. Останній тест показує, чому: дані від батька змінилися — обчислене значення автоматично актуальне.'
    },
    {
      id: 'rb-data-flow', group: 'lifting', type: 'theory', level: 2, interview: true,
      title: 'Потік даних у React',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Дані йдуть зверху вниз через props; дочірній компонент повідомляє про зміни, викликаючи функцію з props',
        'Дочірній компонент може змінити props, щоб оновити батька',
        'Спільний для кількох компонентів стан переносять у найближчого спільного батька',
        'Значення, яке можна обчислити з props і state, краще обчислювати під час рендеру, а не зберігати окремо',
        'Кожне поле форми обов\'язково має бути в глобальному сторі'
      ],
      correct: [0, 2, 3],
      why: [
        'Так: односпрямований потік — props down, events up.',
        'Ні: props лише для читання.',
        'Так: підйом стану.',
        'Так: одне джерело правди.',
        'Ні: стан — якомога ближче до місця використання.'
      ],
      hint: 'Хто власник стану і хто має право його змінювати?',
      answer: `
**Односпрямований потік даних:** стан належить одному компоненту; він передає значення вниз через props і функції-обробники; нащадки викликають ці функції — власник оновлює стан — React перерендерює гілку.

**Де тримати стан:**
1. у компоненті, що його використовує;
2. якщо потрібен кільком — у найближчому спільному батькові (**підйом стану**);
3. якщо потрібен глибоко й багатьом — Context або стор (модуль «Хуки»);
4. дані з сервера — кеш запитів (TanStack Query), фільтри — в URL (модуль «Архітектура»).

**Похідне — обчислювати:** відфільтровані списки, суми, валідність форм. **Аналогія:** у Vue той самий принцип: \`props\` вниз, \`emit\` вгору, похідне — \`computed\`.
`,
      keyPoints: ['Props down, events up', 'Props лише для читання', 'Підйом стану до спільного батька', 'Похідне обчислювати під час рендеру', 'Стан якомога ближче до місця використання']
    }
  ]
});
})();
