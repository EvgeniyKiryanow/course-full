(function () {
// Код попередніх кроків проєкту — кожен наступний крок починається з готового рішення попереднього.
const H = `function h(type, props, ...children) {
  return { type, props: props || {}, children: flattenChildren(children) };
}

function flattenChildren(list) {
  const out = [];
  for (const child of list) {
    if (Array.isArray(child)) out.push(...flattenChildren(child));
    else if (child === null || child === undefined || typeof child === 'boolean') continue;
    else out.push(typeof child === 'object' ? child : String(child));
  }
  return out;
}
`;

const CREATE = `function isEvent(key) {
  return key.startsWith('on');
}

function setProp(el, key, value) {
  if (key === 'key') return;
  if (isEvent(key)) {
    const type = key.slice(2).toLowerCase();
    el.__handlers = el.__handlers || {};
    if (!el.__handlers[type]) {
      el.addEventListener(type, (e) => el.__handlers[type] && el.__handlers[type](e));
    }
    el.__handlers[type] = value;
  } else if (key === 'value' || key === 'checked') {
    el[key] = value;
  } else {
    el.setAttribute(key, value);
  }
}

function removeProp(el, key) {
  if (isEvent(key)) {
    if (el.__handlers) el.__handlers[key.slice(2).toLowerCase()] = null;
  } else if (key === 'value') {
    el.value = '';
  } else if (key === 'checked') {
    el.checked = false;
  } else {
    el.removeAttribute(key);
  }
}

function createElement(vnode) {
  if (typeof vnode === 'string') return document.createTextNode(vnode);
  const el = document.createElement(vnode.type);
  for (const key in vnode.props) setProp(el, key, vnode.props[key]);
  for (const child of vnode.children) el.appendChild(createElement(child));
  return el;
}
`;

const PATCH = `function updateProps(el, oldProps, newProps) {
  for (const key in oldProps) {
    if (!(key in newProps)) removeProp(el, key);
  }
  for (const key in newProps) {
    if (oldProps[key] !== newProps[key]) setProp(el, key, newProps[key]);
  }
}

function changed(a, b) {
  return typeof a !== typeof b ||
    (typeof a === 'string' && a !== b) ||
    (typeof a === 'object' && a.type !== b.type);
}

function patch(parent, newVnode, oldVnode, index = 0) {
  if (oldVnode === undefined) {
    parent.appendChild(createElement(newVnode));
    return;
  }
  const el = parent.childNodes[index];
  if (newVnode === undefined) {
    parent.removeChild(el);
    return;
  }
  if (changed(newVnode, oldVnode)) {
    parent.replaceChild(createElement(newVnode), el);
    return;
  }
  if (typeof newVnode === 'string') return;
  updateProps(el, oldVnode.props, newVnode.props);
  const newLen = newVnode.children.length;
  const oldLen = oldVnode.children.length;
  for (let i = 0; i < Math.min(newLen, oldLen); i++) {
    patch(el, newVnode.children[i], oldVnode.children[i], i);
  }
  for (let i = oldLen; i < newLen; i++) {
    el.appendChild(createElement(newVnode.children[i]));
  }
  for (let i = oldLen - 1; i >= newLen; i--) {
    el.removeChild(el.childNodes[i]);
  }
}
`;

FE.topic('mini-framework', {
  intro: `
**Проєкт: свій міні-фреймворк.** За шість кроків ви зберете ядро React-подібної бібліотеки й зрозумієте, що відбувається «під капотом» \`setState\`, JSX і ключів у списках.

\`\`\`text
h()            → віртуальний DOM (опис інтерфейсу об'єктами)
createElement  → віртуальний DOM → справжні вузли
patch          → порівняти старе і нове дерево, змінити лише різницю
createApp      → стан + дії + пакетний рендер через мікрозадачі
useState       → стан компонента в «комірках» за порядком викликів
keys           → перевикористання вузлів у списках
\`\`\`

Кожен крок починається з готового коду попередніх: можна йти по порядку або почати з будь-якого.
`,
  groups: [
    { id: 'vdom', title: 'Віртуальний DOM: h і createElement' },
    { id: 'reconcile', title: 'Diff і patch: змінюємо лише різницю' },
    { id: 'app-state', title: 'Стан, дії і пакетний рендер' },
    { id: 'hooks-keys', title: 'Хуки і ключі' },
    { id: 'real-world', title: 'Як це влаштовано у справжніх фреймворках' }
  ],
  items: [
    {
      id: 'mf-h', group: 'vdom', type: 'code', level: 2,
      title: 'Крок 1. h(): опис інтерфейсу об\'єктами',
      description: `
**Завдання.** Напишіть \`h(type, props, ...children)\` — функцію, у яку компілюється JSX (\`<li class="x">Hi</li>\` → \`h('li', { class: 'x' }, 'Hi')\`). Вона повертає **vnode**:
\`\`\`js
{ type: 'li', props: { class: 'x' }, children: ['Hi'] }
\`\`\`
Правила для \`children\`:
- вкладені масиви розгортаються в один рівень (результат \`items.map(...)\`);
- \`null\`, \`undefined\`, \`true\`, \`false\` — відкидаються (щоб працював патерн \`isOpen && h(...)\`);
- числа перетворюються на рядки;
- \`props\` може бути \`null\` → \`{}\`.

**Де трапляється:** саме так влаштовані JSX-рантайми React, Preact, Vue (\`h\`) і hyperscript.

**Як це працює:** \`h(type, props, ...children)\` нічого не малює, а лише повертає звичайний об'єкт-опис (vnode). Порівняти два таких об'єкти дешевше, ніж читати справжній DOM, тому фреймворки спершу будують опис і лише потім вносять мінімальні зміни.
`,
      starter: `function h(type, props, ...children) {
  // TODO: { type, props: props || {}, children: flattenChildren(children) }
}

function flattenChildren(list) {
  const out = [];
  // TODO: масиви — рекурсивно; null/undefined/boolean — пропустити; числа — String(...)
  return out;
}
`,
      solution: H,
      hints: ['Рекурсія для масивів: `out.push(...flattenChildren(child))`.', 'Відкинути: `child === null || child === undefined || typeof child === \'boolean\'`.'],
      tests: [
        "expect(h('li', { class: 'x' }, 'Hi')).toEqual({ type: 'li', props: { class: 'x' }, children: ['Hi'] })",
        { name: 'props: null → {}', code: "expect(h('br', null)).toEqual({ type: 'br', props: {}, children: [] });" },
        { name: 'масиви з map розгортаються', code: "const items = ['a', 'b'];\nconst v = h('ul', null, items.map((x) => h('li', null, x)), h('li', null, 'c'));\nexpect(v.children.map((c) => c.children[0])).toEqual(['a', 'b', 'c']);" },
        { name: 'умовний рендер і числа', code: "const isOpen = false;\nexpect(h('div', null, isOpen && h('p', null, 'x'), null, undefined, true, 0, 42).children).toEqual(['0', '42']);" }
      ],
      explanation: 'Vnode — **опис** того, що треба показати, а не сам DOM: створювати об\'єкти дешево, і їх можна порівнювати. Зверніть увагу на `0`: число 0 рендериться як текст «0». Тому в React `{count && <Badge/>}` при `count = 0` показує «0». Правильно — `{count > 0 && ...}`.'
    },
    {
      id: 'mf-create-element', group: 'vdom', type: 'dom', level: 2,
      title: 'Крок 2. createElement: vnode → DOM',
      tags: ['virtual DOM', 'createElement'],
      description: `
**Завдання.** Допишіть \`setProp\` і \`createElement(vnode)\`:
- рядок → текстовий вузол \`document.createTextNode\`;
- об'єкт → елемент \`vnode.type\` з усіма \`props\` і рекурсивно створеними дітьми.

**Де трапляється:** так React DOM і Vue перетворюють віртуальні вузли на справжні під час першого рендеру (mount).

Правила \`setProp(el, key, value)\`:
- \`key\` → нічого (службовий проп для списків);
- \`onClick\`, \`onInput\`… → обробник події \`click\`, \`input\`. Обробник зберігається в \`el.__handlers[type]\`, а слухач додається **один раз** і викликає поточний обробник. Це знадобиться в кроці 3;
- \`value\`, \`checked\` → **властивість** елемента (\`el.value = ...\`);
- решта → \`setAttribute\`.

**Як це працює:** текст завжди через \`createTextNode\`, а не \`innerHTML\` — тому рядок \`'<img onerror=...>'\` залишиться текстом. Так фреймворки за замовчуванням захищають від XSS.
`,
      html: `<div id="root"></div>`,
      css: `body { font-family: sans-serif; }`,
      js: H + `
function isEvent(key) {
  return key.startsWith('on');
}

function setProp(el, key, value) {
  if (key === 'key') return;
  // TODO: події через el.__handlers, value/checked — властивості, решта — setAttribute
}

function createElement(vnode) {
  // TODO
}

// Спробуйте: document.getElementById('root').append(createElement(h('p', { class: 'hi' }, 'Привіт')))
`,
      editable: ['js'],
      solution: { js: H + '\n' + CREATE.replace(/\nfunction removeProp[\s\S]*?\n}\n/, '\n') },
      hints: ['Події: `const type = key.slice(2).toLowerCase(); el.__handlers = el.__handlers || {}; if (!el.__handlers[type]) el.addEventListener(type, (e) => el.__handlers[type] && el.__handlers[type](e)); el.__handlers[type] = value;`', '`createElement`: для кожного `key in vnode.props` — `setProp`, для кожної дитини — `el.appendChild(createElement(child))`.'],
      tests: [
        { name: 'дерево з атрибутами й текстом', code: "const root = $('#root');\nroot.innerHTML = '';\nroot.append(createElement(h('ul', { class: 'list' }, h('li', null, 'a'), h('li', null, 'b'))));\nexpect(root.innerHTML).toBe('<ul class=\"list\"><li>a</li><li>b</li></ul>');" },
        { name: 'обробник події', code: "const onClick = mockFn();\nconst btn = createElement(h('button', { onClick }, 'OK'));\nbtn.click();\nexpect(onClick).toHaveBeenCalledTimes(1);\nexpect(btn.hasAttribute('onClick')).toBe(false);" },
        { name: 'value — властивість', code: "const field = createElement(h('input', { value: 'Ann' }));\nexpect(field.value).toBe('Ann');" },
        { name: 'текст не інтерпретується як HTML', code: "const p = createElement(h('p', null, '<img src=x onerror=\"window.__xss=1\">'));\nexpect(p.querySelector('img')).toBeNull();\nexpect(p.textContent).toContain('<img');" }
      ],
      explanation: 'Чому `value` — властивість, а не атрибут: атрибут `value` — лише **початкове** значення поля; після введення тексту актуальне значення — у властивості. Збереження обробника в `__handlers` з одним постійним слухачем — спрощена версія того, що робить Preact: при оновленні не треба знімати й додавати слухачі. React іде далі і використовує делегування: один слухач на корені застосунку.'
    },
    {
      id: 'mf-patch', group: 'reconcile', type: 'dom', level: 3,
      title: 'Крок 3. patch: оновити лише те, що змінилось',
      tags: ['diff', 'reconciliation'],
      description: `
**Завдання.** Напишіть \`updateProps(el, oldProps, newProps)\` і \`patch(parent, newVnode, oldVnode, index = 0)\` — оновлення DOM за різницею двох vnode. Тут \`index\` — позиція вузла серед \`parent.childNodes\`.

| Випадок | Дія |
|---|---|
| \`oldVnode\` немає | \`appendChild(createElement(newVnode))\` |
| \`newVnode\` немає | видалити \`childNodes[index]\` |
| різні типи / різний текст / різний \`type\` | \`replaceChild\` |
| той самий елемент | \`updateProps\` + рекурсивно діти |

Для дітей: спершу спільні індекси (рекурсивний \`patch\`), потім додати нові, потім видалити зайві — **з кінця**, щоб не зсувалися індекси.

**Де трапляється:** reconciliation — серце React, Vue, Preact. Головна ідея: **той самий вузол лишається тим самим** (фокус, курсор, скрол, стан \`<input>\` не втрачаються), змінюються лише атрибути й текст.

**Як це працює:** patch порівнює старий і новий vnode. Інший тип — вузол замінюють цілком; той самий тип — оновлюють лише змінені атрибути й рекурсивно дітей. DOM-вузли без змін лишаються тими самими, тож фокус і введений текст не губляться.
`,
      html: `<div id="root"></div>`,
      css: `body { font-family: sans-serif; }`,
      js: H + '\n' + CREATE + `
function updateProps(el, oldProps, newProps) {
  // TODO: видалити ті, яких немає в newProps; встановити змінені
}

function changed(a, b) {
  return typeof a !== typeof b ||
    (typeof a === 'string' && a !== b) ||
    (typeof a === 'object' && a.type !== b.type);
}

function patch(parent, newVnode, oldVnode, index = 0) {
  // TODO: 4 випадки з таблиці; діти: спільні → нові → зайві з кінця
}
`,
      editable: ['js'],
      solution: { js: H + '\n' + CREATE + '\n' + PATCH },
      hints: ['Діти: `for (i < min) patch(el, new[i], old[i], i)`, потім `for (i = oldLen; i < newLen)` — append, потім `for (i = oldLen - 1; i >= newLen; i--)` — `el.removeChild(el.childNodes[i])`.', '`updateProps`: `for (key in oldProps) if (!(key in newProps)) removeProp(el, key)`; `for (key in newProps) if (oldProps[key] !== newProps[key]) setProp(...)`.'],
      tests: [
        { name: 'зміна тексту зберігає ті самі елементи', code: "const root = $('#root');\nroot.innerHTML = '';\nconst v1 = h('ul', null, h('li', null, 'a'), h('li', null, 'b'));\npatch(root, v1);\nconst li = root.querySelectorAll('li')[1];\nconst v2 = h('ul', null, h('li', null, 'a'), h('li', null, 'B!'));\npatch(root, v2, v1);\nexpect(root.querySelectorAll('li')[1]).toBe(li);\nexpect(root.innerHTML).toBe('<ul><li>a</li><li>B!</li></ul>');" },
        { name: 'інший тип — заміна вузла', code: "const root = $('#root');\nroot.innerHTML = '';\nconst v1 = h('div', null, h('p', null, 'x'));\npatch(root, v1);\nconst p = root.querySelector('p');\npatch(root, h('div', null, h('span', null, 'x')), v1);\nexpect(root.querySelector('p')).toBeNull();\nexpect(root.querySelector('span').textContent).toBe('x');\nexpect(p.isConnected).toBe(false);" },
        { name: 'додавання і видалення дітей', code: "const root = $('#root');\nroot.innerHTML = '';\nconst a = h('ul', null, h('li', null, '1'), h('li', null, '2'), h('li', null, '3'));\npatch(root, a);\nconst b = h('ul', null, h('li', null, '1'));\npatch(root, b, a);\nexpect(root.innerHTML).toBe('<ul><li>1</li></ul>');\npatch(root, a, b);\nexpect(root.innerHTML).toBe('<ul><li>1</li><li>2</li><li>3</li></ul>');" },
        { name: 'атрибути: зміна і видалення; input зберігає введене', code: "const root = $('#root');\nroot.innerHTML = '';\nconst v1 = h('div', { class: 'a', title: 't' }, h('input', { placeholder: 'Ім\\'я' }));\npatch(root, v1);\nconst field = root.querySelector('input');\nfield.value = 'введений текст';\nconst v2 = h('div', { class: 'b' }, h('input', { placeholder: 'Name' }));\npatch(root, v2, v1);\nconst div = root.firstChild;\nexpect(div.getAttribute('class')).toBe('b');\nexpect(div.hasAttribute('title')).toBe(false);\nexpect(root.querySelector('input')).toBe(field);\nexpect(field.value).toBe('введений текст');" },
        { name: 'оновлений обробник події', code: "const root = $('#root');\nroot.innerHTML = '';\nconst f1 = mockFn();\nconst f2 = mockFn();\nconst v1 = h('button', { onClick: f1 }, 'go');\npatch(root, v1);\npatch(root, h('button', { onClick: f2 }, 'go'), v1);\nroot.querySelector('button').click();\nexpect(f1).not.toHaveBeenCalled();\nexpect(f2).toHaveBeenCalledTimes(1);" }
      ],
      explanation: 'Повне порівняння двох дерев — O(n³). Фреймворки використовують **евристики** за O(n): (1) різний `type` — піддерево перестворюється повністю; (2) діти порівнюються за позицією або за **ключем**. Наш `patch` порівнює за позицією — тому вставка на початок списку змушує оновити всі елементи. Це розв\'язують ключі (крок 6). Тест з `<input>` показує головну цінність reconciliation: користувацький стан DOM переживає перерендер.'
    },
    {
      id: 'mf-why-type-remount', group: 'reconcile', type: 'quiz', level: 3,
      title: 'Зміна типу обгортки',
      question: `
Після перемикання \`isCompact\` користувач втрачає введений у форму текст. Чому?

\`\`\`js
const view = (isCompact) =>
  isCompact
    ? h('section', null, h('input', { name: 'q' }))
    : h('div', null, h('input', { name: 'q' }));
\`\`\`
`,
      options: [
        'Атрибут `name` у полі змінюється при кожному новому рендері',
        'Змінився тип кореня — піддерево перестворюється',
        'Під час patch елемент `<input>` завжди перестворюється заново',
        'Через відсутність атрибута `key` у самого елемента `<input>`'
      ],
      answer: 1,
      why: [
        'Ні: name той самий.',
        'Так: евристика «інший тип → заміна всього піддерева» — і в нашому patch, і в React.',
        'Ні: input того самого типу на тому самому місці перевикористовується.',
        'Ні: key важливий у списках; тут проблема в типі батька.'
      ],
      hint: 'Що робить `patch`, коли `type` старого і нового вузла різний?',
      explanation: 'Різний тип елемента чи компонента на тій самій позиції → старе піддерево знищується (у React — unmount з втратою стану), нове монтується. Рішення: тримати стабільну структуру і змінювати лише класи чи атрибути (`h(\'div\', { class: isCompact ? \'compact\' : \'\' }, ...)`). Цей самий механізм іноді використовують навмисно: змінити `key`, щоб скинути стан компонента.'
    },
    {
      id: 'mf-create-app', group: 'app-state', type: 'dom', level: 3,
      title: 'Крок 4. createApp: стан, дії і пакетний рендер',
      tags: ['state', 'batching', 'microtask'],
      description: `
**Завдання.** Напишіть \`createApp({ state, view, actions }, root)\` → \`{ getState, actions }\`:
- одразу рендерить \`view(state, boundActions)\` у \`root\` (через \`patch\`);
- \`actions\` — об'єкт функцій \`(state, payload) => частина нового стану\`;
- \`boundActions.inc(payload)\` об'єднує результат зі станом (\`{ ...state, ...result }\`) і **планує** перерендер;
- кілька дій підряд в одному синхронному блоці → **один** рендер у мікрозадачі (\`queueMicrotask\`);
- рендер викликає \`view\` з актуальним станом і оновлює DOM через \`patch(root, newVnode, oldVnode)\`.

**Де трапляється:** це архітектура Elm/Hyperapp і по суті Redux + React: стан → view → події → дії → новий стан. Пакетування (batching) — те, що React 18 робить автоматично для всіх оновлень.

**Як це працює:** дія змінює стан і лише **планує** рендер через \`queueMicrotask\`, тож кілька дій в одному обробнику дають один рендер. Так само React 18+ пакетує оновлення стану (automatic batching).
`,
      html: `<div id="root"></div>`,
      css: `body { font-family: sans-serif; } button { margin: 4px; }`,
      js: H + '\n' + CREATE + '\n' + PATCH + `
function createApp({ state, view, actions }, root) {
  let current = state;
  let oldVnode;
  let scheduled = false;

  function render() {
    // TODO: newVnode = view(current, bound); patch(root, newVnode, oldVnode); oldVnode = newVnode
  }

  function schedule() {
    // TODO: якщо ще не заплановано — queueMicrotask(...)
  }

  const bound = {};
  for (const name in actions) {
    bound[name] = (payload) => {
      // TODO: оновити current і запланувати рендер
    };
  }

  render();
  return { getState: () => current, actions: bound };
}

// Спробуйте:
// createApp({
//   state: { count: 0 },
//   actions: { inc: (s) => ({ count: s.count + 1 }) },
//   view: (s, a) => h('button', { onClick: () => a.inc() }, 'Кліків: ' + s.count),
// }, document.getElementById('root'));
`,
      editable: ['js'],
      solution: {
        js: H + '\n' + CREATE + '\n' + PATCH + `
function createApp({ state, view, actions }, root) {
  let current = state;
  let oldVnode;
  let scheduled = false;

  function render() {
    scheduled = false;
    const newVnode = view(current, bound);
    patch(root, newVnode, oldVnode);
    oldVnode = newVnode;
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(render);
  }

  const bound = {};
  for (const name in actions) {
    bound[name] = (payload) => {
      current = { ...current, ...actions[name](current, payload) };
      schedule();
    };
  }

  render();
  return { getState: () => current, actions: bound };
}
`
      },
      hints: ['Рендер: `const v = view(current, bound); patch(root, v, oldVnode); oldVnode = v;`. Скиньте `scheduled = false` на початку рендеру.', 'Дія: `current = { ...current, ...actions[name](current, payload) }; schedule();`'],
      tests: [
        { name: 'початковий рендер і клік', code: "const root = $('#root');\nroot.innerHTML = '';\nconst app = createApp({ state: { count: 0 }, actions: { inc: (s) => ({ count: s.count + 1 }) }, view: (s, a) => h('button', { onClick: () => a.inc() }, 'Кліків: ' + s.count) }, root);\nexpect(root.textContent).toBe('Кліків: 0');\nroot.querySelector('button').click();\nexpect(app.getState().count).toBe(1);\nawait flushPromises();\nexpect(root.textContent).toBe('Кліків: 1');" },
        { name: 'кілька дій підряд — один рендер', code: "const root = $('#root');\nroot.innerHTML = '';\nconst view = mockFn((s) => h('p', null, String(s.n)));\nconst app = createApp({ state: { n: 0 }, actions: { add: (s, x) => ({ n: s.n + x }) }, view }, root);\nexpect(view).toHaveBeenCalledTimes(1);\napp.actions.add(1);\napp.actions.add(2);\napp.actions.add(3);\nexpect(view).toHaveBeenCalledTimes(1);\nawait flushPromises();\nexpect(view).toHaveBeenCalledTimes(2);\nexpect(root.textContent).toBe('6');" },
        { name: 'DOM-вузли перевикористовуються', code: "const root = $('#root');\nroot.innerHTML = '';\nconst app = createApp({ state: { name: '' }, actions: { set: (s, v) => ({ name: v }) }, view: (s) => h('div', null, h('input', { placeholder: 'Ім\\'я' }), h('p', null, 'Привіт, ' + s.name)) }, root);\nconst field = root.querySelector('input');\napp.actions.set('Ann');\nawait flushPromises();\nexpect(root.querySelector('input')).toBe(field);\nexpect(root.querySelector('p').textContent).toBe('Привіт, Ann');" }
      ],
      explanation: 'Батчинг через мікрозадачу: усі синхронні зміни стану (обробник кліку викликав 3 дії) застосовуються до одного рендеру **до** відмальовки кадру — користувач не бачить проміжних станів, а view викликається один раз. Vue планує оновлення так само (`nextTick` — мікрозадача), React 18 — через власний планувальник з пріоритетами. Чому не `setTimeout`: між задачами браузер може відмалювати кадр зі старим DOM.'
    },
    {
      id: 'mf-why-microtask', group: 'app-state', type: 'quiz', level: 3,
      title: 'Чому рендер планують мікрозадачею',
      question: 'У `createApp` перерендер планується через `queueMicrotask(render)`. Чому не `setTimeout(render, 0)`?',
      options: [
        'Функцію setTimeout не можна викликати всередині обробника кліку',
        'Мікрозадача встигне до відмальовки кадру',
        'queueMicrotask виконує функцію render в окремому фоновому потоці',
        'Різниці немає — це лише питання стилю коду в команді'
      ],
      answer: 1,
      why: [
        'Ні: setTimeout можна викликати будь-де.',
        'Так: мікрозадачі виконуються одразу після поточного коду, до рендерингу кадру; таймер — окрема задача, між ними браузер може намалювати кадр.',
        'Ні: усе виконується в головному потоці.',
        'Ні: різниця у видимих проміжних станах і затримці (вкладені таймери обмежені ~4 мс).'
      ],
      hint: 'Пригадайте порядок: задача → мікрозадачі → можливий рендер кадру → наступна задача.',
      explanation: 'Пакетування в мікрозадачі = «застосувати всі синхронні зміни й оновити DOM в одному кадрі». Так роблять Vue (`nextTick`) і Preact. React має власний планувальник: термінові оновлення (клік, введення) виконуються синхронно в кінці події, а `startTransition` позначає некритичні, які можна перервати.'
    },
    {
      id: 'mf-use-state', group: 'hooks-keys', type: 'code', level: 3,
      title: 'Крок 5. useState: стан у «комірках» за порядком викликів',
      description: `
**Завдання.** Напишіть \`createComponent(renderFn)\` → \`{ render, getOutput }\`. \`renderFn(useState)\` — «компонент», що викликає \`useState\` і повертає результат.

\`useState(initial)\` → \`[value, setValue]\`:
- стан зберігається в масиві \`hooks\` за **порядковим номером виклику** в межах рендеру;
- \`initial\` використовується лише на першому рендері; якщо це функція — викликається один раз (лінива ініціалізація);
- \`setValue(next)\` приймає значення або функцію \`prev => next\`, зберігає і **перерендерює** компонент;
- \`render()\` скидає лічильник викликів, викликає \`renderFn\` і зберігає результат для \`getOutput()\`.

**Де трапляється:** так влаштовані хуки React. Саме звідси правило «хуки не можна викликати в умовах і циклах».

**Як це працює:** стан компонента лежить у масиві «комірок», а \`useState\` бере комірку за порядковим номером виклику під час рендеру. Тому хуки не можна викликати в умовах і циклах: зсув порядку віддасть компоненту чужий стан.
`,
      starter: `function createComponent(renderFn) {
  const hooks = [];
  let index = 0;
  let output;

  function useState(initial) {
    const i = index++;
    // TODO: якщо комірки i ще немає — створити (initial або initial())
    // setValue: значення або функція від попереднього; після запису — render()
  }

  function render() {
    // TODO: index = 0; output = renderFn(useState); return output
  }

  return { render, getOutput: () => output };
}
`,
      solution: `function createComponent(renderFn) {
  const hooks = [];
  let index = 0;
  let output;

  function useState(initial) {
    const i = index++;
    if (i >= hooks.length) {
      hooks.push(typeof initial === 'function' ? initial() : initial);
    }
    const setValue = (next) => {
      hooks[i] = typeof next === 'function' ? next(hooks[i]) : next;
      render();
    };
    return [hooks[i], setValue];
  }

  function render() {
    index = 0;
    output = renderFn(useState);
    return output;
  }

  return { render, getOutput: () => output };
}
`,
      hints: ['Комірка створюється лише раз: `if (i >= hooks.length) hooks.push(...)`. Сетер замикає свій `i`.', '`render` обов\'язково скидає `index = 0` — інакше другий рендер читатиме чужі комірки.'],
      tests: [
        { name: 'лічильник', code: "const c = createComponent((useState) => {\n  const [count, setCount] = useState(0);\n  return { count, inc: () => setCount(count + 1) };\n});\nc.render();\nexpect(c.getOutput().count).toBe(0);\nc.getOutput().inc();\nexpect(c.getOutput().count).toBe(1);\nc.getOutput().inc();\nexpect(c.getOutput().count).toBe(2);" },
        { name: 'кілька станів незалежні', code: "const c = createComponent((useState) => {\n  const [name, setName] = useState('Ann');\n  const [age, setAge] = useState(30);\n  return { name, age, setName, setAge };\n});\nc.render();\nc.getOutput().setAge(31);\nexpect(c.getOutput()).toMatchObject({ name: 'Ann', age: 31 });\nc.getOutput().setName('Kate');\nexpect(c.getOutput()).toMatchObject({ name: 'Kate', age: 31 });" },
        { name: 'функціональне оновлення', code: "const c = createComponent((useState) => {\n  const [n, setN] = useState(0);\n  return { n, addTwice: () => { setN((x) => x + 1); setN((x) => x + 1); } };\n});\nc.render();\nc.getOutput().addTwice();\nexpect(c.getOutput().n).toBe(2);" },
        { name: 'лінива ініціалізація — один раз', code: "const init = mockFn(() => 5);\nconst c = createComponent((useState) => {\n  const [v, setV] = useState(init);\n  return { v, setV };\n});\nc.render();\nc.getOutput().setV(6);\nc.render();\nexpect(init).toHaveBeenCalledTimes(1);\nexpect(c.getOutput().v).toBe(6);" }
      ],
      explanation: 'Хук не знає свого «імені» — лише **номер виклику**. Якщо `useState` стоїть в `if` і на другому рендері не викличеться, усі наступні хуки отримають чужі комірки. Тест «функціональне оновлення» показує, навіщо `setN(x => x + 1)`: у замиканні `n` — значення з **того** рендеру, а функція отримує актуальне. У React стан зберігається в об\'єкті компонента (fiber), а `setState` лише планує рендер (батчинг), а не рендерить одразу, як у нашій спрощеній версії.'
    },
    {
      id: 'mf-rules-of-hooks', group: 'hooks-keys', type: 'quiz', level: 3,
      title: 'Хук в умові',
      question: `
Перший рендер: \`isAdmin = true\`. Другий: \`isAdmin = false\`. Що поверне \`useState('')\` для \`name\` на другому рендері?

\`\`\`js
function Profile({ isAdmin }) {
  if (isAdmin) {
    const [role] = useState('admin');
  }
  const [name] = useState('');
  return name;
}
\`\`\`
`,
      options: ['`\'\'` — як і очікувалось', '`\'admin\'` — значення з першої комірки', '`undefined`', 'Помилку, бо `role` не оголошено'],
      answer: 1,
      why: [
        'Ні: на другому рендері `name` — перший виклик, тож отримає комірку 0.',
        'Так: на першому рендері комірка 0 = \'admin\', комірка 1 = \'\'. Тепер `name` читає комірку 0.',
        'Ні: комірка 0 уже існує.',
        'Ні: `role` оголошено в блоці `if` — помилки синтаксису немає.'
      ],
      hint: 'Хуки ідентифікуються номером виклику. Який номер у `useState(\'\')` на другому рендері?',
      explanation: 'Звідси **правила хуків**: викликати лише на верхньому рівні компонента, не в умовах, циклах і вкладених функціях. Порядок викликів має бути однаковим на кожному рендері. React у dev-режимі виявляє зміну кількості хуків і кидає помилку, а ESLint-плагін `react-hooks` ловить це ще в редакторі.'
    },
    {
      id: 'mf-keys', group: 'hooks-keys', type: 'dom', level: 4,
      title: 'Крок 6. Ключі: перевикористання вузлів у списку',
      tags: ['key', 'reconciliation', 'Map'],
      description: `
**Завдання.** Напишіть \`reconcileKeyed(parent, vnodes)\`: \`parent\` містить елементи, створені раніше цією ж функцією, \`vnodes\` — новий список з \`props.key\`. Після виклику:
- діти \`parent\` ідуть у порядку \`vnodes\`;
- вузол з тим самим \`key\` — **той самий об'єкт DOM** (переміщений, а не перестворений);
- нові ключі → нові вузли через \`createElement\` (запам'ятайте ключ: \`node.__key = key\`);
- вузли зі зниклими ключами видаляються.

Оновлювати вміст вузлів не потрібно — лише перевикористання і порядок.

**Де трапляється:** \`key\` у React і Vue. Без ключів вставка на початок списку з полями вводу «перемішує» введений текст між рядками.

**Як це працює:** \`Map\` «ключ → наявний вузол»; для кожної позиції \`i\`, якщо там не потрібний вузол — \`insertBefore(node, childNodes[i])\` (якщо вузол уже в DOM, він **переміщується**).
`,
      html: `<ul id="list"></ul>`,
      css: `body { font-family: sans-serif; }`,
      js: H + '\n' + CREATE + `
function reconcileKeyed(parent, vnodes) {
  const existing = new Map();
  for (const node of parent.childNodes) existing.set(node.__key, node);

  // TODO: для кожного vnode (позиція i): знайти або створити вузол,
  // поставити на позицію i; потім видалити невикористані
}

// Спробуйте:
// const list = document.getElementById('list');
// reconcileKeyed(list, ['a', 'b', 'c'].map((k) => h('li', { key: k }, k)));
// reconcileKeyed(list, ['c', 'a'].map((k) => h('li', { key: k }, k)));
`,
      editable: ['js'],
      solution: {
        js: H + '\n' + CREATE + `
function reconcileKeyed(parent, vnodes) {
  const existing = new Map();
  for (const node of parent.childNodes) existing.set(node.__key, node);

  const used = new Set();
  vnodes.forEach((vnode, i) => {
    const key = vnode.props.key;
    let node = existing.get(key);
    if (!node) {
      node = createElement(vnode);
      node.__key = key;
    }
    used.add(node);
    const current = parent.childNodes[i];
    if (current !== node) parent.insertBefore(node, current || null);
  });

  for (const node of existing.values()) {
    if (!used.has(node)) node.remove();
  }
}
`
      },
      hints: ['На позиції `i`: `const current = parent.childNodes[i]; if (current !== node) parent.insertBefore(node, current || null);`. Вузли до `i` уже правильні, тож зайві «зсуваються» в кінець.', 'Після циклу видаліть вузли з `existing`, яких немає в множині використаних.'],
      tests: [
        { name: 'перестановка зберігає ті самі вузли', code: "const list = $('#list');\nlist.innerHTML = '';\nconst li = (k) => h('li', { key: k }, k);\nreconcileKeyed(list, ['a', 'b', 'c'].map(li));\nconst [a, b, c] = list.children;\nreconcileKeyed(list, ['c', 'a', 'b'].map(li));\nexpect([...list.children]).toEqual([c, a, b]);" },
        { name: 'видалення і додавання', code: "const list = $('#list');\nlist.innerHTML = '';\nconst li = (k) => h('li', { key: k }, k);\nreconcileKeyed(list, ['a', 'b', 'c'].map(li));\nconst [a, b, c] = list.children;\nreconcileKeyed(list, ['d', 'c', 'a'].map(li));\nexpect(list.textContent).toBe('dca');\nexpect(list.children[1]).toBe(c);\nexpect(list.children[2]).toBe(a);\nexpect(b.isConnected).toBe(false);" },
        { name: 'введений текст їде разом з рядком', code: "const list = $('#list');\nlist.innerHTML = '';\nconst row = (k) => h('li', { key: k }, h('input', { 'data-k': k }));\nreconcileKeyed(list, ['x', 'y'].map(row));\nlist.querySelector('[data-k=\"y\"]').value = 'текст для y';\nreconcileKeyed(list, ['new', 'x', 'y'].map(row));\nexpect(list.children[2].querySelector('input').value).toBe('текст для y');\nexpect(list.children[0].querySelector('input').value).toBe('');" }
      ],
      explanation: 'Ключ — **ідентичність** елемента між рендерами. Індекс як ключ ламається при вставці чи видаленні не в кінці: ключ «0» починає позначати інший рядок. Наш алгоритм робить зайві переміщення; справжні фреймворки мінімізують їх (Vue 3 використовує найдовшу зростаючу підпослідовність — LIS, щоб знайти вузли, які можна не чіпати).'
    },
    {
      id: 'mf-index-key', group: 'hooks-keys', type: 'quiz', level: 2, interview: true,
      title: 'Індекс як key',
      question: 'Список задач з полями вводу рендериться з `key={index}`. Користувач вводить текст у другий рядок і видаляє **перший**. Що побачить?',
      options: [
        'Усе правильно: текст лишиться в рядку, де його вводили',
        'Введений текст опиниться в іншому рядку',
        'Список після видалення не оновиться зовсім',
        'React кине помилку про дублікати ключів у списку'
      ],
      answer: 1,
      why: [
        'Ні: це так лише зі стабільними ключами (id).',
        'Так: колишній рядок з key=1 видалено як «зайвий», а вузол з key=0 тепер показує іншу задачу, зберігши старий DOM-стан.',
        'Ні: оновиться, але зіставлення рядків неправильне.',
        'Ні: індекси унікальні, дублікатів немає.'
      ],
      hint: 'Після видалення першого елемента — яка задача тепер має індекс 0?',
      explanation: 'Ключ має бути **стабільним і унікальним** серед сусідів: `id` з даних. Індекс як ключ допустимий лише для статичних списків, які не змінюють порядок і не мають стану в рядках. Генерувати ключ під час рендеру (`Math.random()`) — ще гірше: усі рядки перестворюються щоразу.'
    },
    {
      id: 'mf-jsx-component', group: 'real-world', type: 'quiz', level: 2,
      title: 'На що компілюється JSX з компонентом',
      question: 'На що перетворюється `<Button kind="primary">OK</Button>` після компіляції (класичний JSX-рантайм)?',
      options: [
        'На рядок HTML `"<button kind=\\"primary\\">OK</button>"`',
        '`h(Button, { kind: \'primary\' }, \'OK\')`',
        '`document.createElement(\'Button\')`',
        '`new Button({ kind: \'primary\' })`'
      ],
      answer: 1,
      why: [
        'Ні: JSX — не рядки, а виклики функцій, що створюють об\'єкти.',
        'Так: компонент із великої літери передається як посилання на функцію; рядкові типи — для HTML-тегів.',
        'Ні: DOM створюється пізніше, під час рендеру.',
        'Ні: функціональні компоненти не створюються через new; фреймворк сам їх викликає.'
      ],
      hint: 'Чим `<button>` (мала літера) відрізняється від `<Button>` (велика) для компілятора?',
      explanation: 'Велика літера — сигнал компілятору: це змінна-компонент, а не HTML-тег. Під час рендеру фреймворк бачить `typeof vnode.type === \'function\'`, викликає її з props (`children` усередині props) і рендерить результат. Новий рантайм (React 17+) компілює в `jsx(Button, { kind: \'primary\', children: \'OK\' })` з автоматичним імпортом.'
    },
    {
      id: 'mf-real-frameworks', group: 'real-world', type: 'theory', level: 3, interview: true,
      title: 'Як влаштовані React, Vue і фреймворки на сигналах',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'React порівнює віртуальні дерева (reconciliation) і застосовує до DOM лише різницю',
        'Fiber дозволяє React переривати рендеринг і виконувати важливіші оновлення першими',
        'Віртуальний DOM завжди швидший за пряму роботу з DOM',
        'Фреймворки на сигналах (Solid, Svelte 5, Vue через ref/computed) оновлюють конкретні вузли без порівняння цілого дерева',
        'JSX виконується браузером напряму, без компіляції'
      ],
      correct: [0, 1, 3],
      why: [
        'Так: саме це ми зробили у кроці 3.',
        'Так: рендер ділиться на одиниці роботи з пріоритетами (concurrent rendering).',
        'Ні: VDOM — накладні витрати заради зручності декларативного коду; ручні точкові зміни DOM швидші.',
        'Так: залежності відстежуються під час виконання, оновлення точкові.',
        'Ні: JSX компілюється у виклики `jsx()` / `h()` — як у кроці 1.'
      ],
      hint: 'VDOM — це інструмент зручності чи швидкості? Що робить fine-grained реактивність?',
      answer: `
**Два підходи до оновлення UI:**

| | Virtual DOM (React, Preact) | Fine-grained / сигнали (Solid, Svelte 5, Vue-реактивність) |
|---|---|---|
| що відбувається при зміні стану | компонент перерендерюється → нове дерево → diff | оновлюються лише вузли, що залежать від сигналу |
| ціна | рендер і diff піддерева | відстеження залежностей |
| оптимізації | \`memo\`, \`useMemo\`, React Compiler | майже не потрібні |

**React під капотом:** JSX → \`jsx()\` (наш \`h\`); reconciliation з евристиками (тип, ключі); **Fiber** — дерево одиниць роботи, яке можна переривати (\`startTransition\`, Suspense); **батчинг** оновлень; хуки зберігаються у fiber за порядком викликів. **Vue 3** поєднує обидва світи: реактивність (Proxy) визначає, **який** компонент оновити, а VDOM з оптимізаціями компілятора (статичні вузли пропускаються) — **як**.

**Головне для співбесіди:** VDOM не робить DOM «швидшим» — він дає декларативність (UI = f(state)) з прийнятною ціною. Швидкість дають правильні ключі, менше зайвих рендерів і віртуалізація довгих списків.
`,
      keyPoints: [
        'JSX → h()/jsx() → vnode',
        'Reconciliation: тип і ключі, O(n)-евристики',
        'Fiber: переривний рендеринг з пріоритетами',
        'Сигнали: точкові оновлення без diff дерева',
        'VDOM — про декларативність, не про «швидше за DOM»'
      ],
      followUps: ['Навіщо React.memo і коли він не допомагає?', 'Чим реактивність Vue на Proxy відрізняється від сигналів Solid?']
    }
  ]
});
})();
