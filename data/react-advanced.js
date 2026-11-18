(function () {
const HTML = '<div id="root"></div>';
const CSS = `body { font-family: system-ui, sans-serif; padding: 12px; }
button { padding: 4px 10px; margin: 2px; }
[role="tab"][aria-selected="true"] { font-weight: 700; border-bottom: 2px solid #3b6cf0; }
.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: grid; place-items: center; }
.modal { background: #fff; padding: 16px; border-radius: 10px; }
.error { color: #c00; }`;

FE.topic('react-advanced', {
  intro: `
**React глибше** — те, що відрізняє Strong Middle: розуміння, **коли і чому** компонент рендериться, як зберігається стан, коли мемоізація допомагає, а коли шкодить, патерни бібліотек компонентів і нові можливості React 19.

| Тема | Ключове |
|---|---|
| Рендеринг | render → commit; стан прив'язаний до **позиції і типу** в дереві; \`key\` скидає стан |
| Продуктивність | \`memo\` порівнює props через \`Object.is\`; нові об'єкти/функції ламають memo; React Compiler мемоізує автоматично |
| Патерни | composition, compound components (контекст), портали, error boundaries |
| Конкурентність | \`Suspense\`, \`lazy\`, \`useTransition\`, \`useDeferredValue\` |
| React 19 | Actions, \`useActionState\`, \`useFormStatus\`, \`useOptimistic\`, \`use\`, ref як проп |

Ви вже реалізували reconciliation і ключі в міні-фреймворку — тут ті самі ідеї в React.
`,
  groups: [
    { id: 'rendering', title: 'Як React рендерить і зберігає стан' },
    { id: 'performance', title: 'Продуктивність: memo, useMemo, useCallback' },
    { id: 'patterns', title: 'Патерни: compound components, портали, межі помилок' },
    { id: 'concurrent', title: 'Suspense, lazy і transitions' },
    { id: 'react19', title: 'React 19: Actions, useOptimistic, use' }
  ],
  items: [
    // ---------------------------------------------------------------- rendering
    {
      id: 'ra-render-triggers', group: 'rendering', type: 'theory', level: 2, interview: true,
      title: 'Коли компонент перерендерюється',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Компонент перерендерюється, коли змінюється його стан',
        'Коли перерендерюється батько, діти теж перерендерюються за замовчуванням — навіть з тими самими props',
        'Компонент перерендерюється, коли змінюється значення контексту, який він читає',
        'Рендер означає, що React перестворює DOM-вузли компонента',
        'Зміна props сама по собі, без рендеру батька, перерендерює компонент'
      ],
      correct: [0, 1, 2],
      why: [
        'Так: власний стан — основна причина.',
        'Так: React не порівнює props, якщо компонент не обгорнутий у memo.',
        'Так: useContext підписує на зміни.',
        'Ні: рендер — виклик функції-компонента; DOM змінюється лише за різницею (commit).',
        'Ні: props змінюються лише тоді, коли батько рендериться з новими значеннями.'
      ],
      hint: 'Звідки береться новий виклик функції-компонента?',
      answer: `
**Тригери рендеру:** зміна стану компонента, рендер батька, зміна контексту. Сам по собі «рендер» — це виклик функції; **commit** застосовує до DOM лише різницю (reconciliation, як \`patch\` у міні-фреймворку).

**Стан прив'язаний до позиції:** той самий тип компонента на тій самій позиції дерева → стан зберігається; інший тип або інший \`key\` → компонент розмонтовується, стан втрачається.

**Чому «зайві» рендери зазвичай не проблема:** рендер дешевий, якщо компонент простий. Оптимізують, коли профайлер (React DevTools Profiler) показує реальну проблему: важкі списки, часті оновлення (введення, анімація), дорогі обчислення.
`,
      keyPoints: ['Тригери: стан, батько, контекст', 'Рендер ≠ зміна DOM', 'Стан прив\'язаний до типу і позиції', 'Оптимізувати після вимірювання']
    },
    {
      id: 'ra-quiz-inner-component', group: 'rendering', type: 'quiz', level: 3,
      title: 'Компонент, оголошений усередині іншого',
      question: `
Користувач вводить текст у поле, потім натискає «+». Що станеться з введеним текстом?

\`\`\`jsx
function Outer() {
  const [n, setN] = useState(0);
  function Inner() {
    const [v, setV] = useState('');
    return <input value={v} onChange={(e) => setV(e.target.value)} />;
  }
  return <div><Inner /><button onClick={() => setN(n + 1)}>+</button></div>;
}
\`\`\`
`,
      options: [
        'Текст зникне: Inner — нова функція на кожному рендері, React бачить інший тип і перемонтовує його',
        'Текст збережеться, бо Inner на тій самій позиції',
        'React кине помилку про вкладений компонент',
        'Текст збережеться лише без StrictMode'
      ],
      answer: 0,
      why: [
        'Так: тип порівнюється за посиланням на функцію; нова функція = новий тип = новий стан.',
        'Ні: позиція та сама, але тип — ні.',
        'Ні: це легально, але майже завжди баг.',
        'Ні: StrictMode тут ні до чого.'
      ],
      hint: 'Як React вирішує, що компонент «той самий»? Чи `Inner` з різних рендерів — одна функція?',
      explanation: 'Перевірено на React 19: стан скидається. Компоненти оголошують на верхньому рівні модуля. Це той самий механізм, що в квізі «Зміна типу обгортки» з міні-фреймворку.'
    },
    {
      id: 'ra-key-reset', group: 'rendering', type: 'dom', runtime: 'react', level: 2,
      title: 'Скинути стан форми ключем',
      description: `
**Завдання.** \`EditForm({ user })\` уже написана: локальний стан поля ініціалізується з \`user.name\`. Напишіть \`UserSwitcher({ users })\`:
- кнопки з іменами користувачів, клік обирає користувача (спочатку — перший);
- під ними — \`<EditForm user={selected} />\` так, щоб при **виборі іншого користувача** форма показувала **його** ім'я (а не чернетку попереднього).

**Де трапляється:** форма редагування, що має скинутися при виборі іншого запису (користувача, товару, чату) — без ефектів і ручного скидання.

**Аналогія:** \`key\` — ідентичність елемента (крок 6 міні-фреймворку). Новий key = інший компонент = новий стан.

**Як це працює:** \`useState(user.name)\` читає початкове значення лише при монтуванні. Замість ефекту «синхронізуй стан з пропом» — \`<EditForm key={selected.id} … />\`.
`,
      html: HTML, css: CSS,
      js: `import { useState } from 'react';

function EditForm({ user }) {
  const [name, setName] = useState(user.name);
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}

function UserSwitcher({ users }) {
  // TODO: стан обраного користувача, кнопки, EditForm з правильним key
  return null;
}

function App() {
  return <UserSwitcher users={[{ id: 1, name: 'Ann' }, { id: 2, name: 'Bob' }]} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState } from 'react';

function EditForm({ user }) {
  const [name, setName] = useState(user.name);
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}

function UserSwitcher({ users }) {
  const [selectedId, setSelectedId] = useState(users[0].id);
  const selected = users.find((u) => u.id === selectedId);
  return (
    <div>
      {users.map((u) => (
        <button key={u.id} onClick={() => setSelectedId(u.id)}>{u.name}</button>
      ))}
      <EditForm key={selected.id} user={selected} />
    </div>
  );
}

function App() {
  return <UserSwitcher users={[{ id: 1, name: 'Ann' }, { id: 2, name: 'Bob' }]} />;
}
` },
      hints: ['Зберігайте в стані `selectedId`, а об\'єкт користувача обчислюйте `users.find(...)`.', '`<EditForm key={selected.id} user={selected} />`'],
      tests: [
        { name: 'перемикання показує ім\'я обраного', code: "const m = mount(UserSwitcher, { users: [{ id: 1, name: 'Ann' }, { id: 2, name: 'Bob' }] });\nconst field = () => m.container.querySelector('input');\nexpect(field().value).toBe('Ann');\nawait act(() => typeInto(field(), 'Ann чернетка'));\nawait act(() => click(m.container.querySelectorAll('button')[1]));\nexpect(field().value).toBe('Bob');" },
        { name: 'повернення — свіжий стан', code: "const m = mount(UserSwitcher, { users: [{ id: 1, name: 'Ann' }, { id: 2, name: 'Bob' }] });\nconst [a, b] = m.container.querySelectorAll('button');\nawait act(() => typeInto(m.container.querySelector('input'), 'xxx'));\nawait act(() => click(b));\nawait act(() => click(a));\nexpect(m.container.querySelector('input').value).toBe('Ann');" }
      ],
      explanation: 'Без `key` React бачить `EditForm` того самого типу на тій самій позиції — і зберігає стан (чернетку Ann під іменем Bob). Анти-патерн — `useEffect(() => setName(user.name), [user])`: зайвий рендер з неправильним значенням і два джерела правди. `key` — офіційний спосіб «почати з чистого аркуша».'
    },
    // ---------------------------------------------------------------- performance
    {
      id: 'ra-quiz-memo-inline', group: 'performance', type: 'quiz', level: 3, interview: true,
      title: 'memo і інлайн-об\'єкт у props',
      question: `
\`Child\` обгорнутий у \`React.memo\`. Батько перерендерюється через власний стан. Чи перерендериться \`Child\`?

\`\`\`jsx
<Child style={{ color: 'red' }} />
\`\`\`
`,
      options: [
        'Так: `{ color: \'red\' }` — новий об\'єкт на кожному рендері',
        'Ні: memo порівнює props глибоко',
        'Ні: style — особливий проп, React його ігнорує',
        'Лише якщо колір зміниться'
      ],
      answer: 0,
      why: [
        'Так: memo порівнює кожен проп через Object.is — нове посилання = «змінився».',
        'Ні: порівняння поверхневе.',
        'Ні: style — звичайний проп.',
        'Ні: важливе посилання, а не вміст.'
      ],
      hint: '`{} === {}`?',
      explanation: 'Перевірено на React 19. Те саме з інлайн-функціями (`onClick={() => …}`) і масивами (`items={list.filter(...)}`). Рішення: винести константу за межі компонента, `useMemo` для об\'єктів, `useCallback` для функцій — або React Compiler, який робить це автоматично.'
    },
    {
      id: 'ra-memo-list', group: 'performance', type: 'dom', runtime: 'react', level: 3, interview: true,
      title: 'memo + useCallback: не перерендерювати рядки',
      description: `
**Завдання.** \`Row\` рахує свої рендери в \`window.rowRenders\`. Напишіть:
- \`Row\` — обгорнутий у \`memo\`: \`<li>\` з текстом і кнопкою, що викликає \`onToggle(item.id)\`; виконані — клас \`done\`;
- \`TodoBoard({ initial })\` — стан задач і окремий лічильник \`<button className="tick">\` (не стосується задач); \`onToggle\` — **стабільна** функція (\`useCallback\` з функціональним оновленням).

**Де трапляється:** довгі таблиці й списки в CRM та адмінках, де введення в поле фільтра перерендерює сотні рядків.

Вимога: клік по лічильнику **не** перерендерює жоден \`Row\`; перемикання задачі перерендерює лише **одну** \`Row\`.

**Аналогія:** \`Object.is\` для кожного пропа — як порівняння посилань в іммутабельному стані.
`,
      html: HTML, css: CSS,
      js: `import { useState, useCallback, memo } from 'react';

window.rowRenders = 0;

function Row({ item, onToggle }) {
  window.rowRenders++;
  return (
    <li className={item.done ? 'done' : undefined}>
      {item.text} <button onClick={() => onToggle(item.id)}>✓</button>
    </li>
  );
}

function TodoBoard({ initial }) {
  const [todos, setTodos] = useState(initial);
  const [ticks, setTicks] = useState(0);
  const onToggle = (id) => setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  // TODO: memo для Row, useCallback для onToggle
  return (
    <div>
      <button className="tick" onClick={() => setTicks(ticks + 1)}>Тік {ticks}</button>
      <ul>{todos.map((t) => <Row key={t.id} item={t} onToggle={onToggle} />)}</ul>
    </div>
  );
}

function App() {
  return <TodoBoard initial={[{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: false }]} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState, useCallback, memo } from 'react';

window.rowRenders = 0;

const Row = memo(function Row({ item, onToggle }) {
  window.rowRenders++;
  return (
    <li className={item.done ? 'done' : undefined}>
      {item.text} <button onClick={() => onToggle(item.id)}>✓</button>
    </li>
  );
});

function TodoBoard({ initial }) {
  const [todos, setTodos] = useState(initial);
  const [ticks, setTicks] = useState(0);
  const onToggle = useCallback((id) => {
    setTodos((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);
  return (
    <div>
      <button className="tick" onClick={() => setTicks(ticks + 1)}>Тік {ticks}</button>
      <ul>{todos.map((t) => <Row key={t.id} item={t} onToggle={onToggle} />)}</ul>
    </div>
  );
}

function App() {
  return <TodoBoard initial={[{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: false }]} />;
}
` },
      hints: ['`const Row = memo(function Row(...) { ... })`.', '`useCallback((id) => setTodos((list) => list.map(...)), [])` — функціональне оновлення робить залежності порожніми, а функцію стабільною.'],
      tests: [
        { name: 'тік не перерендерює рядки', code: "const m = mount(TodoBoard, { initial: [{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: false }] });\nconst before = window.rowRenders;\nawait act(() => click(m.container.querySelector('.tick')));\nawait act(() => click(m.container.querySelector('.tick')));\nexpect(window.rowRenders).toBe(before);" },
        { name: 'перемикання — лише один рядок', code: "const m = mount(TodoBoard, { initial: [{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: false }] });\nconst before = window.rowRenders;\nawait act(() => click(m.container.querySelectorAll('li button')[1]));\nexpect(window.rowRenders - before).toBe(1);\nexpect(m.container.querySelectorAll('li')[1].className).toBe('done');" }
      ],
      explanation: 'Незмінений рядок отримує **той самий** об\'єкт `item` (map повертає старий об\'єкт для інших id) і ту саму `onToggle` — memo пропускає рендер. `useCallback` без функціонального оновлення мав би `todos` у залежностях і змінювався б при кожному перемиканні. **React Compiler** (стабільна версія з 2025) автоматично мемоізує компоненти й значення — ручні memo/useCallback у новому коді стають рідшими, але розуміти механізм потрібно.'
    },
    {
      id: 'ra-use-memo', group: 'performance', type: 'dom', runtime: 'react', level: 2,
      title: 'useMemo для дорогих обчислень',
      description: `
**Завдання.** \`countPrimes(limit)\` — дорога функція (рахує свої виклики в \`window.primeCalls\`). Напишіть \`PrimeStats({ limit })\`:
- \`<p className="result">Простих чисел до N: K</p>\`;
- кнопка \`Тема\` перемикає \`dark\`-клас обгортки (стан, що не стосується обчислення);
- \`countPrimes\` викликається лише при зміні \`limit\`, а **не** при перемиканні теми.

**Де трапляється:** важкі обчислення в рендері: фільтрація й сортування великих списків, агрегати для графіків, побудова дерева з плаского списку.

**Аналогія:** мемоізація з модуля «Функції»: кеш результату за аргументами, лише з одним останнім значенням.
`,
      html: HTML, css: CSS,
      js: `import { useState, useMemo } from 'react';

window.primeCalls = 0;
function countPrimes(limit) {
  window.primeCalls++;
  let count = 0;
  for (let n = 2; n <= limit; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
    if (prime) count++;
  }
  return count;
}

function PrimeStats({ limit }) {
  const [dark, setDark] = useState(false);
  const count = countPrimes(limit); // TODO: мемоізувати
  return (
    <div className={dark ? 'dark' : ''}>
      <p className="result">Простих чисел до {limit}: {count}</p>
      <button onClick={() => setDark(!dark)}>Тема</button>
    </div>
  );
}

function App() {
  return <PrimeStats limit={50000} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState, useMemo } from 'react';

window.primeCalls = 0;
function countPrimes(limit) {
  window.primeCalls++;
  let count = 0;
  for (let n = 2; n <= limit; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
    if (prime) count++;
  }
  return count;
}

function PrimeStats({ limit }) {
  const [dark, setDark] = useState(false);
  const count = useMemo(() => countPrimes(limit), [limit]);
  return (
    <div className={dark ? 'dark' : ''}>
      <p className="result">Простих чисел до {limit}: {count}</p>
      <button onClick={() => setDark(!dark)}>Тема</button>
    </div>
  );
}

function App() {
  return <PrimeStats limit={50000} />;
}
` },
      hints: ['`const count = useMemo(() => countPrimes(limit), [limit]);`', 'Залежність — лише `limit`.'],
      tests: [
        { name: 'результат', code: "const m = mount(PrimeStats, { limit: 100 });\nexpect(m.container.querySelector('.result').textContent).toBe('Простих чисел до 100: 25');" },
        { name: 'тема не перераховує', code: "const m = mount(PrimeStats, { limit: 1000 });\nconst before = window.primeCalls;\nawait act(() => click(m.container.querySelector('button')));\nawait act(() => click(m.container.querySelector('button')));\nexpect(window.primeCalls).toBe(before);" },
        { name: 'зміна limit — перерахунок', code: "const m = mount(PrimeStats, { limit: 10 });\nconst before = window.primeCalls;\nm.rerender({ limit: 20 });\nexpect(window.primeCalls).toBe(before + 1);\nexpect(m.container.querySelector('.result').textContent).toBe('Простих чисел до 20: 8');" }
      ],
      explanation: '`useMemo` — кеш з **одним** значенням: при зміні залежностей обчислює знову. Це оптимізація, а не гарантія (React може скинути кеш). Не мемоізуйте все підряд: порівняння залежностей теж коштує. Справді важке (мегабайти даних) — у Web Worker.'
    },
    {
      id: 'ra-perf-theory', group: 'performance', type: 'theory', level: 3, interview: true,
      title: 'Продуктивність React: що реально допомагає',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Спершу вимірювати: React DevTools Profiler показує, які компоненти рендеряться і скільки часу',
        'Стан, що часто змінюється, варто тримати якомога нижче в дереві, щоб не перерендерювати великі гілки',
        'Обгортати кожен компонент у memo — завжди найкращий вибір',
        'Довгі списки — віртуалізація; важкі незначущі оновлення — useTransition/useDeferredValue',
        'React Compiler автоматично мемоізує компоненти і значення'
      ],
      correct: [0, 1, 3, 4],
      why: [
        'Так: оптимізація без вимірювань — здогадки.',
        'Так: «колокація стану» — найдешевша оптимізація.',
        'Ні: memo має ціну (порівняння props) і ламається від нових посилань.',
        'Так: віртуалізація з модуля «Архітектура»; transitions — нижче.',
        'Так: стабільний з 2025, вмикається плагіном збирача.'
      ],
      hint: 'Що дешевше: оптимізувати компонент чи не рендерити його взагалі?',
      answer: `
**Порядок дій:**
1. Виміряти (Profiler, Performance, INP у полі).
2. **Колокація стану:** перенести стан, що часто змінюється (введення, hover), у маленький компонент.
3. **children як проп:** \`<Layout><Expensive/></Layout>\` — \`Expensive\` створює батько вище, тож зміна стану \`Layout\` його не перерендерює.
4. \`memo\` + стабільні props (\`useMemo\`, \`useCallback\`) — точково.
5. Віртуалізація довгих списків, ліниве завантаження (\`lazy\`), розділення коду.
6. \`useTransition\` / \`useDeferredValue\` для некритичних оновлень.

**React Compiler** аналізує код під час збірки і вставляє мемоізацію автоматично — за умови, що код дотримується правил React (чисті компоненти, без мутацій props/state).

**Аналогія з Vue:** fine-grained реактивність оновлює лише залежні компоненти — потреба в ручній мемоізації там менша.
`,
      keyPoints: ['Вимірювати Profiler\'ом', 'Колокація стану', 'children як проп', 'memo точково, зі стабільними props', 'React Compiler']
    },
    // ---------------------------------------------------------------- patterns
    {
      id: 'ra-tabs-compound', group: 'patterns', type: 'dom', runtime: 'react', level: 3,
      title: 'Compound components: доступні вкладки',
      description: `
**Завдання.** Реалізуйте набір компонентів, що працюють разом через контекст:
\`\`\`jsx
<Tabs defaultValue="a">
  <TabList>
    <Tab value="a">Опис</Tab>
    <Tab value="b">Відгуки</Tab>
  </TabList>
  <TabPanel value="a">…</TabPanel>
  <TabPanel value="b">…</TabPanel>
</Tabs>
\`\`\`
- \`Tabs\` зберігає активне значення і передає його через контекст;
- \`TabList\` — \`<div role="tablist">\`; \`Tab\` — \`<button role="tab" aria-selected>\`, клік активує;
- \`TabPanel\` — \`<div role="tabpanel">\` рендериться **лише** для активного значення.

**Де трапляється:** API дизайн-систем: \`<Tabs>\`, \`<Select>\`, \`<Accordion>\` у Radix UI чи Headless UI — компоненти, що працюють разом через контекст.

**Аналогія:** вкладки з модуля «Доступність» (ролі tab/tabpanel) + Context. Так побудовані Radix UI, Headless UI, shadcn/ui.
`,
      html: HTML, css: CSS,
      js: `import { createContext, useContext, useState } from 'react';

const TabsContext = createContext(null);

function Tabs({ defaultValue, children }) {
  // TODO
  return children;
}
function TabList({ children }) {
  return <div role="tablist">{children}</div>;
}
function Tab({ value, children }) {
  // TODO
  return <button role="tab">{children}</button>;
}
function TabPanel({ value, children }) {
  // TODO
  return <div role="tabpanel">{children}</div>;
}

function App() {
  return (
    <Tabs defaultValue="a">
      <TabList>
        <Tab value="a">Опис</Tab>
        <Tab value="b">Відгуки</Tab>
      </TabList>
      <TabPanel value="a">Опис товару</TabPanel>
      <TabPanel value="b">Відгуки покупців</TabPanel>
    </Tabs>
  );
}
`,
      editable: ['js'],
      solution: { js: `import { createContext, useContext, useState } from 'react';

const TabsContext = createContext(null);

function Tabs({ defaultValue, children }) {
  const [active, setActive] = useState(defaultValue);
  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>;
}
function TabList({ children }) {
  return <div role="tablist">{children}</div>;
}
function Tab({ value, children }) {
  const { active, setActive } = useContext(TabsContext);
  return (
    <button role="tab" aria-selected={active === value} onClick={() => setActive(value)}>
      {children}
    </button>
  );
}
function TabPanel({ value, children }) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div role="tabpanel">{children}</div>;
}

function App() {
  return (
    <Tabs defaultValue="a">
      <TabList>
        <Tab value="a">Опис</Tab>
        <Tab value="b">Відгуки</Tab>
      </TabList>
      <TabPanel value="a">Опис товару</TabPanel>
      <TabPanel value="b">Відгуки покупців</TabPanel>
    </Tabs>
  );
}
` },
      hints: ['`Tabs`: стан `active` + `<TabsContext.Provider value={{ active, setActive }}>`.', '`Tab`: `aria-selected={active === value}` і `onClick={() => setActive(value)}`; `TabPanel` повертає `null`, якщо неактивна.'],
      tests: [
        { name: 'початкова вкладка', code: "const m = mount(App);\nconst tabs = m.container.querySelectorAll('[role=tab]');\nexpect(tabs[0].getAttribute('aria-selected')).toBe('true');\nexpect(tabs[1].getAttribute('aria-selected')).toBe('false');\nexpect([...m.container.querySelectorAll('[role=tabpanel]')].map((p) => p.textContent)).toEqual(['Опис товару']);" },
        { name: 'перемикання', code: "const m = mount(App);\nawait act(() => click(m.container.querySelectorAll('[role=tab]')[1]));\nexpect(m.container.querySelector('[role=tabpanel]').textContent).toBe('Відгуки покупців');\nexpect(m.container.querySelectorAll('[role=tab]')[1].getAttribute('aria-selected')).toBe('true');" }
      ],
      explanation: 'Compound components дають гнучку розмітку (користувач компонента розставляє частини як хоче) без пропсів-конфігів. Повна доступність вкладок — ще `aria-controls`/`id` (через `useId`), roving tabindex і стрілки ←/→ — модуль «Доступність». Headless-бібліотеки (Radix, React Aria) дають поведінку й a11y без стилів.'
    },
    {
      id: 'ra-portal-modal', group: 'patterns', type: 'dom', runtime: 'react', level: 3,
      title: 'Портал: модальне вікно',
      description: `
**Завдання.** Напишіть \`Modal({ open, onClose, title, children })\`:
- якщо \`open\` — рендерить **через портал у \`document.body\`**: \`<div className="backdrop">\` → \`<div className="modal" role="dialog" aria-modal="true" aria-label={title}>\` з \`<h2>{title}</h2>\`, \`children\` і кнопкою \`Закрити\`;
- клавіша \`Escape\` (слухач на \`document\`, лише поки відкрито) і кнопка викликають \`onClose\`;
- закрите — нічого не рендерить.

**Де трапляється:** модалки, тултіпи, дропдауни й тости, які мають вирватися з-під \`overflow: hidden\` і stacking context батька.

**Аналогія:** модалку виносять у кінець body, щоб \`overflow: hidden\`, \`transform\` і z-index батьків не обрізали її (модуль «Поглиблений CSS»: containing block і stacking context). Слухач на \`document\` — з cleanup (модуль «Події»).

**Як це працює:** \`createPortal(jsx, document.body)\` рендерить DOM в іншому місці, але **події React спливають за деревом компонентів**, а не DOM.
`,
      html: HTML, css: CSS,
      js: `import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function Modal({ open, onClose, title, children }) {
  // TODO: слухач Escape з cleanup; портал
  return null;
}

function App() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ overflow: 'hidden', height: 40 }}>
      <button onClick={() => setOpen(true)}>Відкрити</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Підтвердження">
        <p>Видалити файл?</p>
      </Modal>
    </div>
  );
}
`,
      editable: ['js'],
      solution: { js: `import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Закрити</button>
      </div>
    </div>,
    document.body
  );
}

function App() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ overflow: 'hidden', height: 40 }}>
      <button onClick={() => setOpen(true)}>Відкрити</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Підтвердження">
        <p>Видалити файл?</p>
      </Modal>
    </div>
  );
}
` },
      hints: ['`return createPortal(<div className="backdrop">…</div>, document.body);`', 'Ефект з `[open, onClose]`: `if (!open) return;` додати слухач keydown на document, cleanup — зняти.'],
      tests: [
        { name: 'рендер у body, а не в контейнер', code: "const m = mount(Modal, { open: true, onClose: mockFn(), title: 'T', children: 'вміст' });\nconst dialog = document.querySelector('[role=dialog]');\nexpect(dialog).toBeTruthy();\nexpect(m.container.contains(dialog)).toBe(false);\nexpect(dialog.parentElement.parentElement).toBe(document.body);\nm.unmount();\nexpect(document.querySelector('[role=dialog]')).toBeNull();" },
        { name: 'Escape і кнопка закривають', code: "const onClose = mockFn();\nconst m = mount(Modal, { open: true, onClose, title: 'T' });\nawait act(() => press(document.body, 'Escape'));\nawait act(() => click(document.querySelector('.modal button')));\nexpect(onClose).toHaveBeenCalledTimes(2);\nm.unmount();" },
        { name: 'закрите — без слухача і розмітки', code: "const onClose = mockFn();\nconst m = mount(Modal, { open: false, onClose, title: 'T' });\nawait act(() => press(document.body, 'Escape'));\nexpect(onClose).not.toHaveBeenCalled();\nexpect(document.querySelector('[role=dialog]')).toBeNull();\nm.unmount();" }
      ],
      explanation: 'Продакшен-модалка ще: переносить фокус усередину і повертає після закриття, утримує Tab (focus trap або `inert` на решті), блокує прокрутку сторінки. Альтернатива — нативний `<dialog>` + `showModal()` (top layer без порталу) — модуль HTML. Події з порталу спливають до React-батьків: `onClick` на обгортці `Modal` у дереві компонентів спрацює, хоча в DOM модалка в body.'
    },
    {
      id: 'ra-error-boundary', group: 'patterns', type: 'dom', runtime: 'react', level: 3, interview: true,
      title: 'Межа помилок (Error Boundary)',
      description: `
**Завдання.** Напишіть клас \`ErrorBoundary\` з пропами \`fallback\` і \`children\`:
- якщо нащадок кидає помилку під час рендеру — показує \`fallback\`;
- \`static getDerivedStateFromError\` ставить \`{ error }\`; \`componentDidCatch(error, info)\` викликає \`props.onError?.(error)\` (логування, Sentry);
- кнопка \`Спробувати ще\` у fallback-обгортці (\`<div className="error">{fallback} <button>Спробувати ще</button></div>\`) скидає помилку.

**Де трапляється:** ізоляція збоїв: падіння одного віджета (графік, коментарі) не повинно «білити» всю сторінку. Так працюють \`error.tsx\` у Next.js і межі помилок Sentry.

**Аналогія:** \`try/catch\` для дерева компонентів (модуль «Помилки»), але лише для рендеру, а не для обробників подій чи async-коду.

**Як це працює:** межі помилок досі пишуть **класами** — хука для цього в React немає (або бібліотека \`react-error-boundary\`).
`,
      html: HTML, css: CSS,
      js: `import { Component, useState } from 'react';

class ErrorBoundary extends Component {
  // TODO: state = { error: null }; static getDerivedStateFromError; componentDidCatch; render
  render() {
    return this.props.children;
  }
}

function Bomb({ explode }) {
  if (explode) throw new Error('Бабах');
  return <p>Усе гаразд</p>;
}

function App() {
  return (
    <ErrorBoundary fallback={<span>Щось пішло не так</span>}>
      <Bomb explode={true} />
    </ErrorBoundary>
  );
}
`,
      editable: ['js'],
      solution: { js: `import { Component, useState } from 'react';

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error">
          {this.props.fallback} <button onClick={() => this.setState({ error: null })}>Спробувати ще</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Bomb({ explode }) {
  if (explode) throw new Error('Бабах');
  return <p>Усе гаразд</p>;
}

function App() {
  return (
    <ErrorBoundary fallback={<span>Щось пішло не так</span>}>
      <Bomb explode={true} />
    </ErrorBoundary>
  );
}
` },
      hints: ['`static getDerivedStateFromError(error) { return { error }; }` і `state = { error: null }`.', 'У render: якщо є помилка — fallback і кнопка `onClick={() => this.setState({ error: null })}`.'],
      tests: [
        { name: 'fallback і onError', code: "const onError = mockFn();\nconst m = mount(ErrorBoundary, { fallback: React.createElement('span', null, 'Збій'), onError, children: React.createElement(Bomb, { explode: true }) });\nexpect(m.container.querySelector('.error').textContent).toContain('Збій');\nexpect(onError).toHaveBeenCalledTimes(1);\nexpect(onError.mock.calls[0][0].message).toBe('Бабах');" },
        { name: 'без помилки — діти', code: "const m = mount(ErrorBoundary, { fallback: 'x', children: React.createElement(Bomb, { explode: false }) });\nexpect(m.container.textContent).toBe('Усе гаразд');" },
        { name: 'скидання після виправлення', code: "let explode = true;\nfunction Maybe() { return React.createElement(Bomb, { explode }); }\nconst m = mount(ErrorBoundary, { fallback: 'збій', children: React.createElement(Maybe) });\nexplode = false;\nawait act(() => click(m.container.querySelector('.error button')));\nexpect(m.container.textContent).toBe('Усе гаразд');" }
      ],
      explanation: 'Межі помилок **не** ловлять: помилки в обробниках подій (там звичайний try/catch), в асинхронному коді (проміси, setTimeout), у самій межі та під час SSR. Ставте їх на рівні сторінок і незалежних віджетів, щоб збій одного блоку не «білив» увесь застосунок. У React 19 є ще `onCaughtError`/`onUncaughtError` у `createRoot` — для глобального логування.'
    },
    {
      id: 'ra-quiz-boundary-limits', group: 'patterns', type: 'quiz', level: 2,
      title: 'Що не ловить Error Boundary',
      question: 'Яку помилку **не** зловить Error Boundary?',
      options: [
        'Помилку в `onClick`-обробнику кнопки всередині межі',
        'Помилку під час рендеру дочірнього компонента',
        'Помилку в конструкторі дочірнього класового компонента',
        'Помилку в методі життєвого циклу дочірнього компонента'
      ],
      answer: 0,
      why: [
        'Так: обробники подій виконуються поза рендером — потрібен звичайний try/catch.',
        'Ні: саме для цього межі й існують.',
        'Ні: конструктор — частина рендер-фази.',
        'Ні: помилки життєвого циклу теж ловляться.'
      ],
      hint: 'Межа помилок працює, коли React рендерить дерево. А коли виконується onClick?',
      explanation: 'Для помилок у обробниках і async-коді: try/catch + стан помилки (`setError`) або передача помилки в межу через `setState(() => { throw err })`. Бібліотека `react-error-boundary` дає хук `useErrorBoundary().showBoundary(error)`.'
    },
    // ---------------------------------------------------------------- concurrent
    {
      id: 'ra-suspense-theory', group: 'concurrent', type: 'theory', level: 3,
      title: 'Suspense, lazy і transitions',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        '`React.lazy(() => import(\'./Page\'))` + `<Suspense fallback={…}>` — розділення коду: модуль вантажиться при першому рендері',
        'Suspense показує fallback, поки компонент усередині «чекає» (lazy-модуль, use(promise), дані фреймворку)',
        '`useTransition` позначає оновлення як некритичне: React може перервати його рендер заради введення користувача',
        '`useDeferredValue` затримує значення на фіксовані 300 мс, як debounce',
        'Оновлення в transition не показує fallback для вже показаного вмісту — старий екран лишається, поки новий не готовий'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: динамічний import() → окремий чанк (модуль «Бандлер»).',
        'Так: це механізм «очікування» в дереві.',
        'Так: concurrent rendering — перериваний рендер.',
        'Ні: затримки немає — React рендерить з відкладеним значенням, коли є час; на швидкому пристрої майже одразу.',
        'Так: тому переходи між сторінками в transition не «миготять» спінером.'
      ],
      hint: 'Чим відрізняється «показати спінер» від «залишити старий екран, поки готується новий»?',
      answer: `
**Suspense** — декларативне очікування: \`<Suspense fallback={<Spinner/>}>\` показує fallback, доки щось усередині не готове:
- \`lazy\` компонент (код вантажиться окремим чанком — \`import()\`);
- \`use(promise)\` (React 19) або дані фреймворку (Next.js, TanStack Query з \`useSuspenseQuery\`).

**Concurrent rendering** (React 18+): рендер можна перервати.
- \`useTransition\` → \`[isPending, startTransition]\`: оновлення в \`startTransition\` некритичне — введення в поле лишається чуйним, а важкий список оновиться, коли буде час; \`isPending\` — для індикатора;
- \`useDeferredValue(value)\` — відкладена копія значення: поле показує свіже значення, а важкий список рендериться з відкладеним;
- на відміну від debounce, затримки немає — React підлаштовується під пристрій.

**Аналогія:** пріоритети задач і \`scheduler.yield()\` з модуля «Продуктивність» (INP): важка робота не блокує введення.
`,
      keyPoints: ['lazy + Suspense = code splitting', 'Suspense чекає lazy, use(promise), дані фреймворку', 'useTransition — некритичні оновлення', 'useDeferredValue — без фіксованої затримки', 'Transition не ховає вже показаний вміст']
    },
    {
      id: 'ra-quiz-deferred', group: 'concurrent', type: 'quiz', level: 3,
      title: 'useDeferredValue чи debounce',
      question: 'Поле пошуку фільтрує локальний список з 20 000 рядків, введення «гальмує». Запитів до мережі немає. Що найдоречніше?',
      options: [
        '`useDeferredValue(query)` для списку: поле оновлюється одразу, список — коли React має час',
        'debounce на 1 секунду — список оновиться після паузи',
        'Перенести фільтрацію в useEffect',
        '`useLayoutEffect`, щоб оновлення відбувалось до відмальовки'
      ],
      answer: 0,
      why: [
        'Так: швидкий пристрій бачить результат майже одразу, повільний — поле не гальмує.',
        'Ні: debounce штучно затримує навіть на швидкому пристрої (доречний для мережевих запитів).',
        'Ні: ефект додасть зайвий рендер, а робота лишиться в головному потоці.',
        'Ні: це зробить гальмування ще помітнішим.'
      ],
      hint: 'Що краще для локальної роботи: фіксована пауза чи пріоритети рендеру?',
      explanation: 'Для мережевих запитів debounce (менше запитів) лишається правильним — і їх можна поєднувати. Для дуже довгих списків — ще й віртуалізація. Важкі обчислення без рендеру — у Web Worker.'
    },
    // ---------------------------------------------------------------- React 19
    {
      id: 'ra-optimistic-like', group: 'react19', type: 'dom', runtime: 'react', level: 3,
      title: 'useOptimistic: лайк без очікування сервера',
      description: `
**Завдання.** Напишіть \`LikeButton({ initialLikes, sendLike })\`:
- кнопка показує кількість лайків (\`<button>❤ N</button>\`);
- клік **одразу** показує N + 1 (оптимістично), викликає \`await sendLike()\`;
- успіх → стан лайків +1 (кнопка лишається N + 1); помилка → значення повертається до N.

**Де трапляється:** лайки, позначки «прочитано», перемикачі в налаштуваннях — інтерфейс оновлюється одразу, а при помилці сервера відкочується.

Використайте \`useOptimistic(likes, (current, delta) => current + delta)\` і \`startTransition(async () => { ... })\`.

**Аналогія:** оптимістичне оновлення з відкатом із модуля «Архітектура» (\`createTodoStore\`), але React сам «відкочує» оптимістичний стан, коли action завершився.
`,
      html: HTML, css: CSS,
      js: `import { useState, useOptimistic, useTransition } from 'react';

function LikeButton({ initialLikes, sendLike }) {
  const [likes, setLikes] = useState(initialLikes);
  // TODO: useOptimistic, startTransition з async-дією
  return <button>❤ {likes}</button>;
}

function App() {
  return <LikeButton initialLikes={10} sendLike={() => new Promise((r) => setTimeout(r, 800))} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState, useOptimistic, useTransition } from 'react';

function LikeButton({ initialLikes, sendLike }) {
  const [likes, setLikes] = useState(initialLikes);
  const [optimisticLikes, addOptimistic] = useOptimistic(likes, (current, delta) => current + delta);
  const [, startTransition] = useTransition();

  function like() {
    startTransition(async () => {
      addOptimistic(1);
      try {
        await sendLike();
        startTransition(() => setLikes((l) => l + 1));
      } catch (e) {
        // помилка: оптимістичне значення відкотиться саме
      }
    });
  }

  return <button onClick={like}>❤ {optimisticLikes}</button>;
}

function App() {
  return <LikeButton initialLikes={10} sendLike={() => new Promise((r) => setTimeout(r, 800))} />;
}
` },
      hints: ['`const [optimisticLikes, addOptimistic] = useOptimistic(likes, (cur, d) => cur + d);` — показуйте `optimisticLikes`.', 'У `startTransition(async () => { addOptimistic(1); await sendLike(); setLikes(...) })`; помилку ловіть `try/catch`.'],
      tests: [
        { name: 'одразу +1, після успіху лишається', code: "let resolve;\nconst sendLike = () => new Promise((r) => { resolve = r; });\nconst m = mount(LikeButton, { initialLikes: 10, sendLike });\nconst btn = m.container.querySelector('button');\nawait act(async () => { click(btn); });\nexpect(btn.textContent).toBe('❤ 11');\nawait act(async () => { resolve(); });\nexpect(btn.textContent).toBe('❤ 11');" },
        { name: 'помилка — відкат', code: "let reject;\nconst sendLike = () => new Promise((_, r) => { reject = r; });\nconst m = mount(LikeButton, { initialLikes: 5, sendLike });\nconst btn = m.container.querySelector('button');\nawait act(async () => { click(btn); });\nexpect(btn.textContent).toBe('❤ 6');\nawait act(async () => { reject(new Error('мережа')); });\nexpect(btn.textContent).toBe('❤ 5');" }
      ],
      explanation: 'Оптимістичне значення живе, доки триває action (transition); коли він завершився — React показує справжній стан. Тому успіх треба «закріпити» оновленням `likes`, а відкат при помилці стається сам. Перевірено на React 19. Для серверного стану з кешем та сама ідея — `onMutate`/`onError` у TanStack Query.'
    },
    {
      id: 'ra-action-state', group: 'react19', type: 'dom', runtime: 'react', level: 3,
      title: 'Форма з useActionState',
      description: `
**Завдання.** Напишіть \`SubscribeForm({ subscribe })\` на **Actions** React 19:
- \`<form action={formAction}>\` з полем \`<input name="email">\` і кнопкою \`Підписатися\`;
- \`useActionState(async (prev, formData) => …, { message: '' })\`: бере \`formData.get('email')\`, порожній або без \`@\` → \`{ message: 'Некоректний email' }\` (без виклику subscribe); інакше \`await subscribe(email)\` → \`{ message: 'Підписано: <email>' }\`, помилка → \`{ message: err.message }\`;
- поки action триває — кнопка \`disabled\` (третій елемент \`useActionState\` — \`isPending\`);
- повідомлення — \`<p>{state.message}</p>\`.

**Де трапляється:** форми підписки, коментарів і логіну на React 19 та Next.js Server Actions: стан відправки й помилки без ручних \`useState\`.

**Аналогія:** замість \`onSubmit\` + \`preventDefault\` + кількох \`useState\` (як у модулі «Основи») — action отримує \`FormData\` (модуль «Browser API»), а React керує станом очікування.
`,
      html: HTML, css: CSS,
      js: `import { useActionState } from 'react';

function SubscribeForm({ subscribe }) {
  // TODO: const [state, formAction, isPending] = useActionState(async (prev, formData) => { ... }, { message: '' });
  return (
    <form>
      <input name="email" placeholder="Email" />
      <button>Підписатися</button>
      <p></p>
    </form>
  );
}

function App() {
  return <SubscribeForm subscribe={(email) => new Promise((r) => setTimeout(r, 600))} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useActionState } from 'react';

function SubscribeForm({ subscribe }) {
  const [state, formAction, isPending] = useActionState(async (prev, formData) => {
    const email = String(formData.get('email') || '').trim();
    if (!email.includes('@')) return { message: 'Некоректний email' };
    try {
      await subscribe(email);
      return { message: 'Підписано: ' + email };
    } catch (err) {
      return { message: err.message };
    }
  }, { message: '' });

  return (
    <form action={formAction}>
      <input name="email" placeholder="Email" />
      <button disabled={isPending}>Підписатися</button>
      <p>{state.message}</p>
    </form>
  );
}

function App() {
  return <SubscribeForm subscribe={(email) => new Promise((r) => setTimeout(r, 600))} />;
}
` },
      hints: ['`const [state, formAction, isPending] = useActionState(async (prev, formData) => {...}, { message: \'\' })` і `<form action={formAction}>`.', 'Email — `formData.get(\'email\')`; кнопці — `disabled={isPending}`.'],
      tests: [
        { name: 'валідація без запиту', code: "const subscribe = mockFn(() => Promise.resolve());\nconst m = mount(SubscribeForm, { subscribe });\nconst form = m.container.querySelector('form');\nform.querySelector('input').value = 'nope';\nawait act(async () => { submit(form); });\nawait settle(5);\nexpect(m.container.querySelector('p').textContent).toBe('Некоректний email');\nexpect(subscribe).not.toHaveBeenCalled();" },
        { name: 'очікування і успіх', code: "const subscribe = mockFn(() => new Promise((r) => setTimeout(r, 20)));\nconst m = mount(SubscribeForm, { subscribe });\nconst form = m.container.querySelector('form');\nform.querySelector('input').value = 'a@b.c';\nawait act(async () => { submit(form); });\nexpect(m.container.querySelector('button').disabled).toBe(true);\nawait settle(40);\nexpect(m.container.querySelector('p').textContent).toBe('Підписано: a@b.c');\nexpect(m.container.querySelector('button').disabled).toBe(false);\nexpect(subscribe).toHaveBeenCalledWith('a@b.c');" },
        { name: 'помилка сервера', code: "const m = mount(SubscribeForm, { subscribe: () => Promise.reject(new Error('Сервер недоступний')) });\nconst form = m.container.querySelector('form');\nform.querySelector('input').value = 'a@b.c';\nawait act(async () => { submit(form); });\nawait settle(10);\nexpect(m.container.querySelector('p').textContent).toBe('Сервер недоступний');" }
      ],
      explanation: 'Actions (React 19): функція в `action` форми виконується в transition — React сам керує `isPending`, послідовністю відправок і (для неконтрольованих полів) скиданням форми після успіху. `useFormStatus()` з `react-dom` дає стан очікування дочірній кнопці без prop drilling. У Next.js та сама модель з **Server Actions** — функція виконується на сервері.'
    },
    {
      id: 'ra-react19-theory', group: 'react19', type: 'theory', level: 3, interview: true,
      title: 'Що нового в React 19',
      question: 'Оберіть **усі** правильні твердження про React 19.',
      choices: [
        '`use(promise)` читає значення промісу під час рендеру (з Suspense) і, на відміну від хуків, може викликатися в умовах',
        '`ref` можна передавати у функціональний компонент як звичайний проп — `forwardRef` більше не потрібен',
        '`<title>` і `<meta>` у будь-якому компоненті React піднімає в `<head>`',
        'Server Components працюють у будь-якому SPA без фреймворку і бандлера',
        '`<Context value={…}>` можна використовувати як провайдер замість `<Context.Provider>`'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: але проміс не можна створювати під час рендеру — його кешують або передають ззовні.',
        'Так: ref — проп.',
        'Так: вбудована підтримка метаданих документа.',
        'Ні: потрібна інтеграція фреймворку і бандлера (Next.js App Router).',
        'Так: новий синтаксис провайдера.'
      ],
      hint: 'Що з цього працює «з коробки», а що потребує фреймворку?',
      answer: `
**React 19 — головне:**
| Можливість | Суть |
|---|---|
| **Actions** | async-функції в transitions; \`<form action={fn}>\` |
| \`useActionState\` | стан результату action + \`isPending\` |
| \`useFormStatus\` | стан очікування батьківської форми (react-dom) |
| \`useOptimistic\` | оптимістичний стан на час action |
| \`use(resource)\` | читання промісу (з Suspense) або контексту, можна в умовах |
| ref як проп | без \`forwardRef\`; cleanup-функція з ref-колбека |
| \`<Context>\` як провайдер | замість \`.Provider\` |
| метадані | \`<title>\`, \`<meta>\`, \`<link>\` з компонентів → у \`<head>\` |
| ресурси | \`preload\`, \`preinit\`; стилі з \`precedence\` |

**Server Components / Server Actions** — частина архітектури React, але використовуються через фреймворк (Next.js App Router): компонент виконується на сервері, у бандл клієнта не потрапляє, може напряму читати БД; \`'use client'\` позначає інтерактивну межу.

**React Compiler** (окремо від 19, стабільний з 2025) — автоматична мемоізація.
`,
      keyPoints: ['Actions + useActionState + useFormStatus', 'useOptimistic', 'use(promise) з Suspense', 'ref як проп, <Context> як провайдер', 'Server Components — через фреймворк']
    }
  ]
});
})();
