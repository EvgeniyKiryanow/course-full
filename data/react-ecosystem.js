(function () {
const HTML = '<div id="root"></div>';
const CSS = `body { font-family: system-ui, sans-serif; padding: 12px; }
button { padding: 4px 10px; margin: 2px; }
nav a { margin-right: 8px; }
.error { color: #c00; }
.answer { white-space: pre-wrap; border: 1px solid #ddd; padding: 8px; min-height: 40px; }`;

FE.topic('react-ecosystem', {
  intro: `
**Екосистема React** — інструменти, з якими ви працюватимете щодня в комерційному проєкті. Ви не просто вчите їхні API, а пишете мінімальні версії кожного: стор на \`useSyncExternalStore\`, кеш запитів, роутер, \`getByRole\`. Після цього справжні бібліотеки читаються як знайомий код.

| Задача | Інструмент у проєктах | Що зробите тут |
|---|---|---|
| Глобальний клієнтський стан | Zustand, Redux Toolkit, Context | стор із селекторами |
| Серверний стан | TanStack Query, SWR, RTK Query | кеш із дедуплікацією та інвалідацією |
| Потокові відповіді (ШІ-чат) | fetch-стріми, SSE, AI SDK | потокова відповідь із зупинкою |
| Маршрутизація | React Router, Next.js | in-memory роутер з параметрами |
| Форми | React Hook Form + Zod | — |
| Тести | Vitest/Jest + Testing Library, MSW | \`getByRole\` |
| Фреймворк | Next.js App Router, Server Components | — |
`,
  groups: [
    { id: 'state', title: 'Глобальний стан: стори, Zustand, Redux Toolkit' },
    { id: 'server', title: 'Серверний стан і потокові дані' },
    { id: 'routing', title: 'Маршрутизація' },
    { id: 'forms-testing', title: 'Форми й тестування' },
    { id: 'stack', title: 'TypeScript і стилі в React' },
    { id: 'nextjs', title: 'Next.js, SSR і Server Components' }
  ],
  items: [
    // ---------------------------------------------------------------- state
    {
      id: 're-state-kinds', group: 'state', type: 'theory', level: 2, interview: true,
      title: 'Види стану і де його тримати',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Дані з сервера (списки, профіль) — це серверний стан: його кешують і синхронізують (TanStack Query), а не копіюють у глобальний стор',
        'Фільтри, сторінка, пошуковий запит, які мають переживати перезавантаження і поширюватися посиланням, — у URL',
        'Context — повноцінний стейт-менеджер: споживачі перерендерюються лише тоді, коли змінюється потрібна їм частина значення',
        'Zustand і Redux дають підписку з селектором: компонент перерендерюється лише при зміні вибраної частини',
        'Будь-який стан варто класти в глобальний стор, щоб він був доступний усюди'
      ],
      correct: [0, 1, 3],
      why: [
        'Так: кеш, ревалідація, дедуплікація — це задача бібліотек серверного стану.',
        'Так: URL — теж стан (search params).',
        'Ні: Context не має селекторів — перерендерюються всі споживачі (квіз модуля «Хуки»).',
        'Так: це їхня головна перевага над Context для частих оновлень.',
        'Ні: локальний стан — у компоненті (колокація), інакше зайві залежності й перерендери.'
      ],
      hint: 'Розкладіть стан на «чий він» і «звідки береться»: сервер, URL, форма, UI.',
      answer: `
| Вид стану | Приклад | Де тримати |
|---|---|---|
| Локальний UI | відкрито меню, значення поля | \`useState\` у компоненті |
| Спільний для гілки | тема, поточний користувач | Context (рідкі зміни) |
| Глобальний клієнтський | кошик, налаштування редактора, часті зміни | Zustand / Redux Toolkit |
| Серверний | товари, профіль | TanStack Query / RTK Query / SWR |
| URL | фільтри, сторінка, вкладка | search params роутера |
| Форма | значення, помилки, touched | React Hook Form / Actions |

**Zustand** — мінімальний стор: \`create((set) => ({ count: 0, inc: () => set((s) => ({ count: s.count + 1 })) }))\`, у компоненті \`useStore((s) => s.count)\`.
**Redux Toolkit** — стандартний Redux: \`configureStore\`, \`createSlice\` (редюсери пишуться «мутаційно» завдяки Immer), DevTools, middleware; RTK Query — серверний стан. Обирають для великих команд і складних потоків подій.

**Аналогія:** pub/sub-стор з модуля «Архітектура» — саме так вони працюють усередині.
`,
      keyPoints: ['Серверний стан ≠ клієнтський', 'URL як стан', 'Context без селекторів', 'Стори з селекторами', 'Колокація локального стану']
    },
    {
      id: 're-create-store', group: 'state', type: 'dom', runtime: 'react', level: 3,
      title: 'Свій Zustand: стор і useStore з селектором',
      description: `
**Завдання.** Напишіть:
- \`createStore(initial)\` → \`{ getState, setState, subscribe }\`; \`setState(partial)\` приймає об'єкт **або функцію** \`(state) => partial\`, створює **новий** об'єкт стану (\`{ ...state, ...partial }\`) і сповіщає підписників; \`subscribe(listener)\` повертає функцію відписки;
- \`useStore(store, selector)\` на \`useSyncExternalStore\`: повертає \`selector(state)\`; компонент перерендерюється лише тоді, коли **результат селектора** змінився.

**Де трапляється:** Zustand, Redux і Jotai влаштовані саме так: зовнішній стор плюс підписка із селектором через \`useSyncExternalStore\`.

Компоненти \`Count\` і \`Name\` уже написані й рахують рендери.

**Аналогія:** \`createStore\` — той самий pub/sub, що в модулі «Архітектура». \`useSyncExternalStore(subscribe, getSnapshot)\` — офіційний міст між зовнішнім стором і React (так влаштовані Zustand і react-redux).
`,
      html: HTML, css: CSS,
      js: `import { useSyncExternalStore } from 'react';

function createStore(initial) {
  // TODO: state, listeners, getState, setState (об'єкт або функція), subscribe
  return { getState: () => initial, setState() {}, subscribe: () => () => {} };
}

function useStore(store, selector) {
  // TODO: useSyncExternalStore(store.subscribe, () => selector(store.getState()))
  return selector(store.getState());
}

const appStore = createStore({ count: 0, name: 'Ann' });
window.renders = { count: 0, name: 0 };

function Count({ store }) {
  window.renders.count++;
  const count = useStore(store, (s) => s.count);
  return <button onClick={() => store.setState((s) => ({ count: s.count + 1 }))}>Лічильник {count}</button>;
}
function Name({ store }) {
  window.renders.name++;
  const name = useStore(store, (s) => s.name);
  return <p>Ім'я: {name}</p>;
}
function App() {
  return <div><Count store={appStore} /><Name store={appStore} /></div>;
}
`,
      editable: ['js'],
      solution: { js: `import { useSyncExternalStore } from 'react';

function createStore(initial) {
  let state = initial;
  const listeners = new Set();
  return {
    getState: () => state,
    setState(partial) {
      const patch = typeof partial === 'function' ? partial(state) : partial;
      state = { ...state, ...patch };
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

function useStore(store, selector) {
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()));
}

const appStore = createStore({ count: 0, name: 'Ann' });
window.renders = { count: 0, name: 0 };

function Count({ store }) {
  window.renders.count++;
  const count = useStore(store, (s) => s.count);
  return <button onClick={() => store.setState((s) => ({ count: s.count + 1 }))}>Лічильник {count}</button>;
}
function Name({ store }) {
  window.renders.name++;
  const name = useStore(store, (s) => s.name);
  return <p>Ім'я: {name}</p>;
}
function App() {
  return <div><Count store={appStore} /><Name store={appStore} /></div>;
}
` },
      hints: ['`setState`: `const patch = typeof partial === \'function\' ? partial(state) : partial; state = { ...state, ...patch }; listeners.forEach((l) => l());`', '`useStore`: `return useSyncExternalStore(store.subscribe, () => selector(store.getState()));` — React сам порівнює знімки через Object.is.'],
      tests: [
        { name: 'createStore: об\'єкт, функція, відписка', code: "const s = createStore({ a: 1, b: 2 });\nconst log = mockFn();\nconst off = s.subscribe(log);\nconst first = s.getState();\ns.setState({ a: 5 });\nexpect(s.getState()).toEqual({ a: 5, b: 2 });\nexpect(s.getState()).not.toBe(first);\ns.setState((st) => ({ b: st.b * 10 }));\nexpect(s.getState()).toEqual({ a: 5, b: 20 });\noff();\ns.setState({ a: 0 });\nexpect(log).toHaveBeenCalledTimes(2);" },
        { name: 'оновлення з UI', code: "const s = createStore({ count: 0, name: 'Ann' });\nconst m = mount(Count, { store: s });\nawait act(() => click(m.container.querySelector('button')));\nawait act(() => click(m.container.querySelector('button')));\nexpect(m.container.textContent).toBe('Лічильник 2');" },
        { name: 'селектор: зміна count не рендерить Name', code: "const s = createStore({ count: 0, name: 'Ann' });\nconst m = mount(Name, { store: s });\nconst before = window.renders.name;\nawait act(() => s.setState({ count: 1 }));\nexpect(window.renders.name).toBe(before);\nawait act(() => s.setState({ name: 'Bob' }));\nexpect(window.renders.name).toBe(before + 1);\nexpect(m.container.textContent).toBe(\"Ім'я: Bob\");" }
      ],
      explanation: '`useSyncExternalStore` викликає `getSnapshot` і порівнює результат з попереднім через `Object.is`: якщо селектор повернув те саме примітивне значення, рендеру немає. Також він захищає від «tearing» — коли під час конкурентного рендеру різні компоненти бачать різні версії стору. У Zustand для вибору кількох полів є `useShallow`.'
    },
    {
      id: 're-quiz-selector-object', group: 'state', type: 'quiz', level: 3,
      title: 'Селектор повертає новий об\'єкт',
      question: `
Що станеться з цим компонентом (стор з попереднього завдання)?

\`\`\`jsx
function Stats({ store }) {
  const { count, name } = useSyncExternalStore(store.subscribe,
    () => ({ count: store.getState().count, name: store.getState().name }));
  return <p>{name}: {count}</p>;
}
\`\`\`
`,
      options: [
        'Нескінченний цикл: getSnapshot щоразу дає новий об\'єкт',
        'Працюватиме, але перерендерюватиметься при будь-якій зміні стору',
        'Працюватиме: React порівнює об\'єкти знімка поверхнево',
        'Помилка компіляції: деструктуризація результату хука'
      ],
      answer: 0,
      why: [
        'Так: перевірено на React 19 — попередження «The result of getSnapshot should be cached» і помилка максимальної глибини оновлень.',
        'Ні: гірше — знімок «змінюється» навіть без змін стору.',
        'Ні: порівняння через Object.is.',
        'Ні: синтаксис коректний.'
      ],
      hint: 'getSnapshot має повертати те саме значення, поки стор не змінився. `{...} === {...}`?',
      explanation: 'Рішення: два окремі селектори з примітивами; кешувати похідний об\'єкт (мемоізувати за станом); `useShallow` у Zustand або `shallowEqual` у react-redux. Це та сама вимога до стабільних посилань, що й у `memo`.'
    },
    {
      id: 're-quiz-immer', group: 'state', type: 'quiz', level: 2,
      title: 'Redux Toolkit: «мутація» в редюсері',
      question: `
Чи порушує цей редюсер іммутабельність?

\`\`\`js
const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    added(state, action) { state.push(action.payload); }
  }
});
\`\`\`
`,
      options: [
        'Ні: createSlice обгортає редюсер у Immer — `state` — це draft-проксі, а результатом буде новий незмінений масив',
        'Так: push мутує стан, компоненти не оновляться',
        'Так, але Redux Toolkit автоматично робить глибоку копію всього стану перед кожним викликом',
        'Ні, бо масиви в Redux мутабельні за задумом'
      ],
      answer: 0,
      why: [
        'Так: Immer записує зміни у draft і будує новий об\'єкт зі structural sharing.',
        'Ні: усередині createSlice це безпечно (поза ним — справжня мутація).',
        'Ні: Immer копіює лише змінені гілки, а не весь стан.',
        'Ні: Redux вимагає іммутабельності, Immer її забезпечує.'
      ],
      hint: 'Що таке `state` усередині редюсера createSlice? Згадайте Proxy з модуля «Сучасний JS».',
      explanation: 'Immer — Proxy, що перехоплює записи (як глибокий observable на Proxy з модуля «Сучасний JS») і після виконання створює нову копію лише змінених вузлів. Правило: або мутуйте draft, або повертайте новий стан — не обидва одразу.'
    },
    // ---------------------------------------------------------------- server
    {
      id: 're-query-client', group: 'server', type: 'dom', runtime: 'react', level: 4,
      title: 'Свій TanStack Query: кеш, дедуплікація, інвалідація',
      description: `
**Завдання.** Хук \`useQuery\` і компонент \`UserName\` уже написані. Реалізуйте \`createQueryClient()\`:
- \`getState(key)\` → \`{ status, data, error, isFetching }\`; для невідомого ключа — **одна й та сама** константа \`{ status: 'pending', data: undefined, error: null, isFetching: false }\` (getSnapshot має бути стабільним);
- \`fetchQuery(key, fetcher)\`: якщо запит для ключа вже триває — **не** запускати новий (дедуплікація); інакше \`isFetching: true\` (старі \`data\` лишаються — stale-while-revalidate); успіх → \`status: 'success'\`, \`data\`; помилка → \`status: 'error'\`, \`error\`; запам'ятати \`fetcher\` для ключа;
- \`subscribe(key, listener)\` → відписка; кожна зміна стану ключа створює **новий** об'єкт і сповіщає підписників ключа;
- \`invalidate(key)\` — повторно завантажити ключ збереженим fetcher.

**Де трапляється:** TanStack Query, SWR і RTK Query є майже в кожному сучасному React-застосунку: кеш серверних даних, дедуплікація й інвалідація після мутацій.

**Аналогія:** дедуплікація — кешування промісу з модуля «Асинхронність»; stale-while-revalidate — директива HTTP-кешу з модуля «Мережа»; підписка — стор з попереднього завдання.
`,
      html: HTML, css: CSS,
      js: `import { useSyncExternalStore, useEffect, useCallback } from 'react';

function createQueryClient() {
  // TODO
  const EMPTY = { status: 'pending', data: undefined, error: null, isFetching: false };
  return {
    getState: (key) => EMPTY,
    fetchQuery(key, fetcher) {},
    subscribe: (key, listener) => () => {},
    invalidate(key) {}
  };
}

function useQuery(client, key, fetcher) {
  const subscribe = useCallback((cb) => client.subscribe(key, cb), [client, key]);
  const state = useSyncExternalStore(subscribe, () => client.getState(key));
  useEffect(() => { client.fetchQuery(key, fetcher); }, [client, key]);
  return state;
}

function UserName({ client, fetcher }) {
  const q = useQuery(client, 'user', fetcher);
  if (q.status === 'pending') return <p>Завантаження…</p>;
  if (q.status === 'error') return <p className="error">{q.error.message}</p>;
  return <p>{q.data.name}{q.isFetching ? ' (оновлення)' : ''}</p>;
}

const client = createQueryClient();
const fetchUser = () => new Promise((r) => setTimeout(() => r({ name: 'Ann' }), 500));
function App() {
  return <div><UserName client={client} fetcher={fetchUser} /><UserName client={client} fetcher={fetchUser} /></div>;
}
`,
      editable: ['js'],
      solution: { js: `import { useSyncExternalStore, useEffect, useCallback } from 'react';

function createQueryClient() {
  const EMPTY = { status: 'pending', data: undefined, error: null, isFetching: false };
  const states = new Map();
  const listeners = new Map();
  const inFlight = new Map();
  const fetchers = new Map();

  function getState(key) {
    return states.get(key) || EMPTY;
  }
  function update(key, patch) {
    states.set(key, { ...getState(key), ...patch });
    (listeners.get(key) || new Set()).forEach((l) => l());
  }
  function fetchQuery(key, fetcher) {
    fetchers.set(key, fetcher);
    if (inFlight.has(key)) return inFlight.get(key);
    update(key, { isFetching: true });
    const promise = Promise.resolve()
      .then(fetcher)
      .then(
        (data) => update(key, { status: 'success', data, error: null, isFetching: false }),
        (error) => update(key, { status: 'error', error, isFetching: false })
      )
      .finally(() => inFlight.delete(key));
    inFlight.set(key, promise);
    return promise;
  }
  function subscribe(key, listener) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(listener);
    return () => listeners.get(key).delete(listener);
  }
  function invalidate(key) {
    const fetcher = fetchers.get(key);
    if (fetcher) return fetchQuery(key, fetcher);
  }
  return { getState, fetchQuery, subscribe, invalidate };
}

function useQuery(client, key, fetcher) {
  const subscribe = useCallback((cb) => client.subscribe(key, cb), [client, key]);
  const state = useSyncExternalStore(subscribe, () => client.getState(key));
  useEffect(() => { client.fetchQuery(key, fetcher); }, [client, key]);
  return state;
}

function UserName({ client, fetcher }) {
  const q = useQuery(client, 'user', fetcher);
  if (q.status === 'pending') return <p>Завантаження…</p>;
  if (q.status === 'error') return <p className="error">{q.error.message}</p>;
  return <p>{q.data.name}{q.isFetching ? ' (оновлення)' : ''}</p>;
}

const client = createQueryClient();
const fetchUser = () => new Promise((r) => setTimeout(() => r({ name: 'Ann' }), 500));
function App() {
  return <div><UserName client={client} fetcher={fetchUser} /><UserName client={client} fetcher={fetchUser} /></div>;
}
` },
      hints: [
        'Чотири Map: стани, підписники, запити в процесі (`inFlight`), fetcher-и. `getState` повертає `states.get(key) || EMPTY`.',
        '`fetchQuery`: якщо `inFlight.has(key)` — повернути його; інакше `update(key, { isFetching: true })`, створити проміс, у `finally` видалити з `inFlight`.'
      ],
      tests: [
        { name: 'getState стабільний для невідомого ключа', code: "const c = createQueryClient();\nexpect(c.getState('x')).toBe(c.getState('x'));\nexpect(c.getState('x')).toEqual({ status: 'pending', data: undefined, error: null, isFetching: false });" },
        { name: 'дедуплікація: два компоненти — один запит', code: "const c = createQueryClient();\nconst fetcher = mockFn(() => new Promise((r) => setTimeout(() => r({ name: 'Ann' }), 10)));\nfunction Two() { return React.createElement('div', null, React.createElement(UserName, { client: c, fetcher }), React.createElement(UserName, { client: c, fetcher })); }\nconst m = mount(Two);\nexpect(m.container.textContent).toBe('Завантаження…Завантаження…');\nawait settle(30);\nexpect(fetcher).toHaveBeenCalledTimes(1);\nexpect(m.container.textContent).toBe('AnnAnn');" },
        { name: 'кеш: повторне монтування показує дані одразу і ревалідує', code: "const c = createQueryClient();\nlet name = 'Ann';\nconst fetcher = mockFn(() => new Promise((r) => setTimeout(() => r({ name }), 10)));\nconst m1 = mount(UserName, { client: c, fetcher });\nawait settle(30);\nm1.unmount();\nname = 'Анна';\nconst m2 = mount(UserName, { client: c, fetcher });\nexpect(m2.container.textContent).toBe('Ann (оновлення)');\nawait settle(30);\nexpect(m2.container.textContent).toBe('Анна');\nexpect(fetcher).toHaveBeenCalledTimes(2);" },
        { name: 'помилка', code: "const c = createQueryClient();\nconst m = mount(UserName, { client: c, fetcher: () => Promise.reject(new Error('500: сервер')) });\nawait settle(10);\nexpect(m.container.querySelector('.error').textContent).toBe('500: сервер');" },
        { name: 'invalidate після мутації', code: "const c = createQueryClient();\nlet name = 'Ann';\nconst m = mount(UserName, { client: c, fetcher: () => Promise.resolve({ name }) });\nawait settle(10);\nexpect(m.container.textContent).toBe('Ann');\nname = 'Bob';\nawait act(async () => { await c.invalidate('user'); });\nexpect(m.container.textContent).toBe('Bob');" }
      ],
      explanation: 'Це ядро TanStack Query: кеш за ключем, спільний для всіх компонентів; дедуплікація; показ старих даних під час фонового оновлення; інвалідація після мутацій. Справжня бібліотека додає `staleTime`/`gcTime`, ретраї з backoff, рефетч при фокусі вікна й відновленні мережі, скасування через AbortSignal, пагінацію, оптимістичні мутації, SSR-гідратацію кешу. Ключі там — масиви (`[\'user\', id]`), що серіалізуються детерміновано.'
    },
    {
      id: 're-query-theory', group: 'server', type: 'theory', level: 3, interview: true,
      title: 'TanStack Query: ключові поняття',
      question: 'Оберіть **усі** правильні твердження про TanStack Query (v5).',
      choices: [
        '`queryKey` (наприклад `[\'todos\', { page }]`) ідентифікує дані в кеші; зміна ключа — новий запит',
        '`staleTime` — скільки дані вважаються свіжими (без фонового рефетчу); за замовчуванням 0',
        '`gcTime` — скільки невикористані дані лишаються в кеші після розмонтування всіх споживачів (за замовчуванням 5 хв)',
        'Після `useMutation` кеш оновлюється автоматично для всіх запитів',
        'Бібліотека замінює собою будь-який клієнтський стан, включно з відкритими модалками'
      ],
      correct: [0, 1, 2],
      why: [
        'Так: ключ — «адреса» в кеші, залежності запиту входять у ключ.',
        'Так: тому дані за замовчуванням ревалідуються при кожному монтуванні/фокусі.',
        'Так: у v4 це називалося cacheTime.',
        'Ні: після мутації ви самі викликаєте `queryClient.invalidateQueries({ queryKey })` або `setQueryData`.',
        'Ні: це інструмент саме для серверного стану.'
      ],
      hint: 'Розрізніть «дані свіжі» (не треба рефетчити) і «дані ще в кеші» (можна показати одразу).',
      answer: `
\`\`\`jsx
const { data, isPending, isError, error, isFetching } = useQuery({
  queryKey: ['todos', { page }],
  queryFn: ({ signal }) => fetch('/api/todos?page=' + page, { signal }).then((r) => r.json()),
  staleTime: 30_000
});

const qc = useQueryClient();
const add = useMutation({
  mutationFn: createTodo,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] })
});
\`\`\`
- **isPending** — даних ще немає; **isFetching** — іде будь-який запит (зокрема фоновий);
- рефетч при фокусі вікна, відновленні мережі, монтуванні — для застарілих (stale) даних;
- **дедуплікація** однакових ключів, **ретраї** (3 за замовчуванням), скасування через \`signal\`;
- оптимістичні мутації: \`onMutate\` (знімок + оновлення кешу) → \`onError\` (відкат) → \`onSettled\` (інвалідація).

**Аналоги:** SWR (Vercel), RTK Query (Redux), Apollo (GraphQL), у Vue — та сама TanStack Query або Pinia Colada.
`,
      keyPoints: ['queryKey — адреса в кеші', 'staleTime vs gcTime', 'isPending vs isFetching', 'invalidateQueries після мутації', 'Лише серверний стан']
    },
    {
      id: 're-quiz-stale', group: 'server', type: 'quiz', level: 3,
      title: 'Повернення на сторінку зі списком',
      question: 'Користувач відкрив список (TanStack Query, налаштування за замовчуванням), перейшов на іншу сторінку і через хвилину повернувся. Що побачить?',
      options: [
        'Список з кешу одразу, а у фоні піде повторний запит і оновить дані',
        'Спінер і новий запит, бо компонент розмонтовувався',
        'Список з кешу без жодного запиту, поки не мине 5 хвилин',
        'Порожній список, доки не натисне «Оновити»'
      ],
      answer: 0,
      why: [
        'Так: дані ще в кеші (gcTime 5 хв), але вже stale (staleTime 0) — показ + фонова ревалідація.',
        'Ні: спінер лише тоді, коли в кеші нічого немає.',
        'Ні: 5 хвилин — це gcTime (зберігання), а не staleTime (свіжість).',
        'Ні: кеш і рефетч автоматичні.'
      ],
      hint: 'Два таймери: скільки дані «свіжі» і скільки вони «зберігаються».',
      explanation: 'Саме це ви реалізували в `createQueryClient`: «Ann (оновлення)» → «Анна». Щоб не робити запит при кожному поверненні — збільшіть `staleTime`.'
    },
    {
      id: 're-streaming-chat', group: 'server', type: 'dom', runtime: 'react', level: 3,
      title: 'Потокова відповідь (ШІ-чат) із зупинкою',
      description: `
**Завдання.** Напишіть \`ChatAnswer({ streamAnswer })\` — UI потокової відповіді, як у ChatGPT/Claude:
- форма: поле \`<input name="prompt">\` і кнопка \`Надіслати\`; сабміт (\`onSubmit\` + \`preventDefault\`) очищає попередню відповідь і запускає потік;
- \`streamAnswer(prompt, { signal })\` повертає **async iterable** шматків тексту; кожен шматок одразу дописується в \`<div className="answer">\`;
- \`<p className="status">\`: \`Генерую…\` під час потоку, \`Готово\` після, \`Зупинено\` після зупинки;
- кнопка \`<button className="stop">Зупинити</button>\` (лише під час потоку) викликає \`abort()\`; після неї **жоден** новий шматок не дописується, навіть якщо джерело ігнорує сигнал;
- розмонтування теж скасовує потік.

**Де трапляється:** інтерфейси ШІ-асистентів (ChatGPT, Claude, Copilot): відповідь з'являється частинами, а кнопка «Зупинити» скасовує запит.

**Аналогія:** \`for await...of\` і async-ітератори (модуль «Асинхронність»), AbortController (там само), читання \`response.body.getReader()\` частинами — модуль «Browser API», SSE — модуль «Мережа». У продакшені \`streamAnswer\` читає \`response.body\` через \`TextDecoderStream\` або SSE.
`,
      html: HTML, css: CSS,
      js: `import { useState, useRef, useEffect } from 'react';

function ChatAnswer({ streamAnswer }) {
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('idle');
  // TODO: ref для AbortController, onSubmit з for await, stop, cleanup при розмонтуванні
  return (
    <div>
      <form>
        <input name="prompt" placeholder="Питання" />
        <button>Надіслати</button>
      </form>
      <div className="answer">{answer}</div>
    </div>
  );
}

async function* demoStream(prompt, { signal }) {
  const words = ('Відповідь на «' + prompt + '»: React рендерить UI як функцію від стану.').split(' ');
  for (const w of words) {
    await new Promise((r) => setTimeout(r, 150));
    if (signal.aborted) return;
    yield w + ' ';
  }
}

function App() {
  return <ChatAnswer streamAnswer={demoStream} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState, useRef, useEffect } from 'react';

const STATUS = { streaming: 'Генерую…', done: 'Готово', stopped: 'Зупинено' };

function ChatAnswer({ streamAnswer }) {
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('idle');
  const controllerRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function onSubmit(e) {
    e.preventDefault();
    const prompt = new FormData(e.currentTarget).get('prompt');
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setAnswer('');
    setStatus('streaming');
    try {
      for await (const chunk of streamAnswer(prompt, { signal: controller.signal })) {
        if (controller.signal.aborted) return;
        setAnswer((a) => a + chunk);
      }
      if (!controller.signal.aborted) setStatus('done');
    } catch (err) {
      if (err.name !== 'AbortError') setStatus('idle');
    }
  }

  function stop() {
    controllerRef.current?.abort();
    setStatus('stopped');
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input name="prompt" placeholder="Питання" />
        <button>Надіслати</button>
      </form>
      {status === 'streaming' && <button className="stop" onClick={stop}>Зупинити</button>}
      {STATUS[status] && <p className="status">{STATUS[status]}</p>}
      <div className="answer">{answer}</div>
    </div>
  );
}

async function* demoStream(prompt, { signal }) {
  const words = ('Відповідь на «' + prompt + '»: React рендерить UI як функцію від стану.').split(' ');
  for (const w of words) {
    await new Promise((r) => setTimeout(r, 150));
    if (signal.aborted) return;
    yield w + ' ';
  }
}

function App() {
  return <ChatAnswer streamAnswer={demoStream} />;
}
` },
      hints: [
        '`for await (const chunk of streamAnswer(prompt, { signal: controller.signal })) { if (controller.signal.aborted) return; setAnswer((a) => a + chunk); }`',
        'Контролер тримайте в `useRef`; `stop()` — `abort()` + статус; ефект з `[]` повертає `() => controllerRef.current?.abort()`.'
      ],
      tests: [
        { name: 'шматки з\'являються поступово', code: "async function* src(p) { for (const w of ['При', 'віт', '!']) { await new Promise((r) => setTimeout(r, 15)); yield w; } }\nconst m = mount(ChatAnswer, { streamAnswer: src });\nconst form = m.container.querySelector('form');\nform.querySelector('input').value = 'hi';\nawait act(async () => { submit(form); });\nexpect(m.container.querySelector('.status').textContent).toBe('Генерую…');\nawait settle(20);\nconst partial = m.container.querySelector('.answer').textContent;\nexpect(partial.length > 0 && partial !== 'Привіт!').toBe(true);\nawait settle(60);\nexpect(m.container.querySelector('.answer').textContent).toBe('Привіт!');\nexpect(m.container.querySelector('.status').textContent).toBe('Готово');\nexpect(m.container.querySelector('.stop')).toBeNull();" },
        { name: 'промпт і signal передаються', code: "const calls = [];\nasync function* src(p, opts) { calls.push([p, opts.signal instanceof AbortSignal]); yield 'ok'; }\nconst m = mount(ChatAnswer, { streamAnswer: src });\nconst form = m.container.querySelector('form');\nform.querySelector('input').value = 'Що таке JSX?';\nawait act(async () => { submit(form); });\nawait settle(5);\nexpect(calls).toEqual([['Що таке JSX?', true]]);" },
        { name: 'зупинка: нічого не дописується, навіть якщо джерело ігнорує сигнал', code: "async function* src() { for (const w of ['a', 'b', 'c', 'd']) { await new Promise((r) => setTimeout(r, 15)); yield w; } }\nconst m = mount(ChatAnswer, { streamAnswer: src });\nconst form = m.container.querySelector('form');\nform.querySelector('input').value = 'x';\nawait act(async () => { submit(form); });\nawait settle(20);\nawait act(() => click(m.container.querySelector('.stop')));\nconst cut = m.container.querySelector('.answer').textContent;\nawait settle(80);\nexpect(m.container.querySelector('.answer').textContent).toBe(cut);\nexpect(m.container.querySelector('.status').textContent).toBe('Зупинено');" },
        { name: 'розмонтування скасовує', code: "let signal;\nasync function* src(p, opts) { signal = opts.signal; await new Promise((r) => setTimeout(r, 30)); yield 'x'; }\nconst m = mount(ChatAnswer, { streamAnswer: src });\nconst form = m.container.querySelector('form');\nform.querySelector('input').value = 'x';\nawait act(async () => { submit(form); });\nm.unmount();\nexpect(signal.aborted).toBe(true);" }
      ],
      explanation: 'Перевірка `signal.aborted` у циклі — захист від джерел, які не підтримують скасування. Функціональне оновлення `a => a + chunk` обов\'язкове: замикання бачить `answer` з моменту сабміту. Для дуже частих шматків оновлення можна батчити (буфер + `requestAnimationFrame`). Vercel AI SDK (`useChat`) реалізує те саме плюс історію повідомлень. Markdown у відповіді рендерять санітизованим (модуль «Безпека»: XSS).'
    },
    // ---------------------------------------------------------------- routing
    {
      id: 're-router', group: 'routing', type: 'dom', runtime: 'react', level: 3,
      title: 'Свій роутер: Routes, Link, useParams',
      description: `
**Завдання.** Реалізуйте мінімальний in-memory роутер з API як у React Router:
- \`matchPath(pattern, path)\` → об'єкт параметрів або \`null\`: \`'/users/:id'\` і \`'/users/42'\` → \`{ id: '42' }\`; кількість сегментів має збігатися; параметри декодуються (\`decodeURIComponent\`); \`'*'\` збігається з будь-яким шляхом → \`{}\`;
- \`MemoryRouter({ initialPath = '/', children })\` — стан шляху й \`navigate\` у контексті;
- \`Routes({ children })\` рендерить **перший** \`<Route path element>\`, що збігся (через \`React.Children.toArray\`), і передає параметри в контекст;
- \`Link({ to, children })\` → \`<a href={to}>\`, клік без перезавантаження (\`preventDefault\` + \`navigate\`);
- хуки \`useParams()\`, \`useNavigate()\`, \`useLocation()\` (повертає \`{ pathname }\`).

**Де трапляється:** React Router і Next.js: параметри в URL (\`/users/:id\`), переходи без перезавантаження сторінки, вкладені маршрути.

**Аналогія:** History API і делегування подій (модулі «DOM» і «Browser API»): SPA перехоплює кліки по посиланнях і сама вирішує, що показати. \`MemoryRouter\` існує й у React Router — для тестів і вбудованих віджетів.
`,
      html: HTML, css: CSS,
      js: `import { createContext, useContext, useState, Children } from 'react';

const RouterContext = createContext(null);
const ParamsContext = createContext({});

function matchPath(pattern, path) {
  // TODO
  return null;
}

function MemoryRouter({ initialPath = '/', children }) {
  // TODO
  return children;
}
function Routes({ children }) {
  // TODO
  return null;
}
function Route() {
  return null; // Routes читає props Route, сам Route нічого не рендерить
}
function Link({ to, children }) {
  return <a href={to}>{children}</a>;
}
function useParams() { return {}; }
function useNavigate() { return () => {}; }
function useLocation() { return { pathname: '/' }; }

function User() {
  const { id } = useParams();
  return <h1>Користувач {id}</h1>;
}
function Home() {
  const navigate = useNavigate();
  return <div><h1>Головна</h1><button onClick={() => navigate('/users/7')}>До 7</button></div>;
}
function App({ initialPath }) {
  return (
    <MemoryRouter initialPath={initialPath}>
      <nav><Link to="/">Головна</Link><Link to="/users/42">Користувач 42</Link></nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users/:id" element={<User />} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </MemoryRouter>
  );
}
`,
      editable: ['js'],
      solution: { js: `import { createContext, useContext, useState, Children } from 'react';

const RouterContext = createContext(null);
const ParamsContext = createContext({});

function matchPath(pattern, path) {
  if (pattern === '*') return {};
  const p = pattern.split('/').filter(Boolean);
  const s = path.split('/').filter(Boolean);
  if (p.length !== s.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}

function MemoryRouter({ initialPath = '/', children }) {
  const [pathname, setPathname] = useState(initialPath);
  return <RouterContext.Provider value={{ pathname, navigate: setPathname }}>{children}</RouterContext.Provider>;
}
function Routes({ children }) {
  const { pathname } = useContext(RouterContext);
  for (const route of Children.toArray(children)) {
    const params = matchPath(route.props.path, pathname);
    if (params) return <ParamsContext.Provider value={params}>{route.props.element}</ParamsContext.Provider>;
  }
  return null;
}
function Route() {
  return null;
}
function Link({ to, children }) {
  const { navigate } = useContext(RouterContext);
  return (
    <a href={to} onClick={(e) => { e.preventDefault(); navigate(to); }}>{children}</a>
  );
}
function useParams() { return useContext(ParamsContext); }
function useNavigate() { return useContext(RouterContext).navigate; }
function useLocation() { return { pathname: useContext(RouterContext).pathname }; }

function User() {
  const { id } = useParams();
  return <h1>Користувач {id}</h1>;
}
function Home() {
  const navigate = useNavigate();
  return <div><h1>Головна</h1><button onClick={() => navigate('/users/7')}>До 7</button></div>;
}
function App({ initialPath }) {
  return (
    <MemoryRouter initialPath={initialPath}>
      <nav><Link to="/">Головна</Link><Link to="/users/42">Користувач 42</Link></nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users/:id" element={<User />} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </MemoryRouter>
  );
}
` },
      hints: [
        '`matchPath`: розбийте обидва рядки `split(\'/\').filter(Boolean)`, порівняйте довжини, сегмент з `:` — параметр, інакше має збігтися буквально.',
        '`Routes`: `for (const route of Children.toArray(children)) { const params = matchPath(route.props.path, pathname); if (params) return <ParamsContext.Provider value={params}>{route.props.element}</ParamsContext.Provider>; }`'
      ],
      tests: [
        { name: 'matchPath', code: "expect(matchPath('/users/:id', '/users/42')).toEqual({ id: '42' });\nexpect(matchPath('/users/:id', '/users')).toBeNull();\nexpect(matchPath('/users/:id', '/posts/42')).toBeNull();\nexpect(matchPath('/a/:x/b/:y', '/a/1/b/2')).toEqual({ x: '1', y: '2' });\nexpect(matchPath('/search/:q', '/search/a%20b')).toEqual({ q: 'a b' });\nexpect(matchPath('/', '/')).toEqual({});\nexpect(matchPath('*', '/any/thing')).toEqual({});" },
        { name: 'Link і параметри', code: "const m = mount(App, { initialPath: '/' });\nexpect(m.container.querySelector('h1').textContent).toBe('Головна');\nconst link = m.container.querySelectorAll('nav a')[1];\nexpect(link.getAttribute('href')).toBe('/users/42');\nlet ev;\nawait act(() => { ev = click(link); });\nexpect(ev.defaultPrevented).toBe(true);\nexpect(m.container.querySelector('h1').textContent).toBe('Користувач 42');" },
        { name: 'useNavigate і 404', code: "const m = mount(App, { initialPath: '/' });\nawait act(() => click(m.container.querySelector('button')));\nexpect(m.container.querySelector('h1').textContent).toBe('Користувач 7');\nconst m2 = mount(App, { initialPath: '/nope' });\nexpect(m2.container.querySelector('h1').textContent).toBe('404');" },
        { name: 'useLocation', code: "function Where() { return React.createElement('p', null, useLocation().pathname); }\nconst m = mount(() => React.createElement(MemoryRouter, { initialPath: '/x/y' }, React.createElement(Where)));\nexpect(m.container.textContent).toBe('/x/y');" }
      ],
      explanation: 'Справжній `BrowserRouter` замість `useState` синхронізується з `history.pushState` і подією `popstate` (кнопки «назад/вперед»). React Router також ранжує маршрути за специфічністю (а не лише порядком), підтримує вкладені маршрути з `<Outlet>`, search params (`useSearchParams`), data-режим із `loader`/`action` і ліниві маршрути (code splitting).'
    },
    {
      id: 're-router-theory', group: 'routing', type: 'theory', level: 3,
      title: 'Маршрутизація в React-застосунках',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Вкладені маршрути: батьківський layout рендерить `<Outlet />`, куди підставляється дочірній маршрут',
        'Стан фільтрів і пагінації краще тримати в search params — посилання відтворює екран',
        'Маршрути варто завантажувати ліниво (`lazy`), щоб кожна сторінка була окремим чанком',
        'Захищений маршрут на клієнті (редирект, якщо немає токена) — достатній захист даних',
        'SPA на статичному хостингу потребує fallback: сервер віддає index.html для будь-якого шляху'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: так будуються спільні layout-и (шапка, меню).',
        'Так: URL як стан — з першої теорії модуля.',
        'Так: route-based code splitting — найефективніший поділ.',
        'Ні: клієнтський код можна обійти — права перевіряє сервер (API), клієнт лише покращує UX.',
        'Так: інакше пряме відкриття /users/42 дасть 404 від сервера (або використовуйте hash-роутинг).'
      ],
      hint: 'Що станеться, якщо відкрити глибоке посилання напряму? І хто насправді захищає дані?',
      answer: `
**React Router (v7)** — три режими: декларативний (\`<BrowserRouter>\` + \`<Routes>\`), data-режим (\`createBrowserRouter\` з \`loader\`/\`action\`, завантаження даних паралельно з кодом) і framework-режим (колишній Remix: SSR, файлова маршрутизація).

**Ключове:**
- вкладені маршрути й \`<Outlet />\`; індексні маршрути;
- \`useParams\`, \`useSearchParams\`, \`useNavigate\`, \`<Link>\` / \`<NavLink>\` (активний стан + \`aria-current="page"\`);
- \`loader\` завантажує дані **до** рендеру сторінки → немає каскаду «код → рендер → fetch»;
- **доступність:** після переходу перемістити фокус на заголовок нової сторінки або оголосити зміну (live region).

**Next.js** — файлова маршрутизація: \`app/users/[id]/page.tsx\`, \`layout.tsx\`, \`loading.tsx\` (Suspense), \`error.tsx\` (Error Boundary).

**Vue Router** — та сама модель: вкладені маршрути, \`<RouterView>\` замість Outlet.
`,
      keyPoints: ['Вкладені маршрути й Outlet', 'URL як стан', 'Ліниві маршрути', 'Захист — на сервері', 'SPA fallback на хостингу']
    },
    // ---------------------------------------------------------------- forms & testing
    {
      id: 're-forms-theory', group: 'forms-testing', type: 'theory', level: 3,
      title: 'Форми у великих застосунках: React Hook Form і Zod',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'React Hook Form за замовчуванням працює з неконтрольованими полями (`register`) — введення не перерендерює всю форму',
        'Схема Zod описує валідацію один раз; `z.infer<typeof schema>` дає TypeScript-тип даних форми',
        'Якщо форма валідується на клієнті, сервер може не перевіряти дані',
        'Помилку поля пов\'язують з ним через `aria-invalid` і `aria-describedby`',
        'Контрольовані поля (`value` + `onChange`) неможливі в React Hook Form'
      ],
      correct: [0, 1, 3],
      why: [
        'Так: значення читаються з DOM через ref, підписки — точкові.',
        'Так: одна схема — і рантайм-перевірка, і тип; ту саму схему можна використати на сервері.',
        'Ні: клієнтську перевірку обходять — сервер валідує завжди.',
        'Так: модуль «Доступність», форми.',
        'Ні: для сторонніх компонентів є `Controller` / `useController`.'
      ],
      hint: 'Чому велика форма на `useState` для кожного поля «гальмує»? І кому не можна довіряти?',
      answer: `
\`\`\`tsx
const schema = z.object({
  email: z.string().email('Некоректний email'),
  age: z.coerce.number().min(18, 'Від 18 років')
});
type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors, isSubmitting } } =
  useForm<FormData>({ resolver: zodResolver(schema) });

<form onSubmit={handleSubmit(onValid)}>
  <input {...register('email')} aria-invalid={!!errors.email} />
  {errors.email && <p role="alert">{errors.email.message}</p>}
</form>
\`\`\`
**Альтернативи:** React 19 Actions + \`useActionState\` (простіші форми, Server Actions), TanStack Form. Валідація — коли показувати помилки: on blur / on submit, а не на кожен символ.

**Аналогія:** ваша контрольована форма з модуля «Основи» і Constraint Validation API з модуля HTML — ці бібліотеки автоматизують те саме.
`,
      keyPoints: ['RHF: неконтрольовані поля, мало рендерів', 'Zod: схема + z.infer', 'Сервер валідує завжди', 'aria-invalid / aria-describedby', 'Controller для сторонніх полів']
    },
    {
      id: 're-get-by-role', group: 'forms-testing', type: 'dom', level: 3,
      title: 'Свій getByRole з Testing Library',
      description: `
**Завдання.** \`getByRole\` — головний запит Testing Library: тест шукає елементи так, як їх «бачить» screen reader. Напишіть спрощену версію:
- \`queryAllByRole(container, role, { name } = {})\` → масив елементів;
- \`getByRole(container, role, options)\` → **один** елемент; 0 збігів → \`Error('Не знайдено роль ' + role)\`, більше одного → \`Error('Кілька елементів з роллю ' + role)\`.

**Де трапляється:** кожен тест на Testing Library (\`screen.getByRole('button', { name: 'Зберегти' })\`) і Playwright (\`page.getByRole\`) — пошук елемента так, як його «бачить» screen reader.

**Роль:** явний атрибут \`role\` має пріоритет; інакше неявна: \`button\` (button, input type=button/submit), \`link\` (\`a[href]\`), \`textbox\` (input без type або type=text/email, textarea), \`checkbox\`, \`heading\` (h1–h6).

**Доступне ім'я** (\`name\` — рядок для точного збігу або RegExp): \`aria-label\` → \`aria-labelledby\` (текст елемента за id) → для полів \`<label for>\` або обгортковий \`<label>\` → для решти текстовий вміст. Пробіли нормалізуються (\`trim\` + один пробіл).

Елементи всередині \`[hidden]\` або \`[aria-hidden="true"]\` пропускаються.

**Аналогія:** неявні ролі й доступне ім'я — модуль «Доступність»; ваш тест-раннер — модуль «Міні тест-раннер».
`,
      html: `<form id="app">
  <h2>Профіль</h2>
  <label for="email">Email</label> <input id="email" type="email">
  <label>Ім'я <input name="n"></label>
  <span id="bio-l">Про себе</span> <textarea aria-labelledby="bio-l"></textarea>
  <label><input type="checkbox"> Підписатися</label>
  <button type="submit">Зберегти</button>
  <button type="button" aria-label="Закрити">✕</button>
  <div role="button" tabindex="0">Скасувати</div>
  <button role="tab">Вкладка</button>
  <a href="/help">Допомога</a> <a>Не посилання</a>
  <div hidden><button>Схована</button></div>
  <div aria-hidden="true"><button>Для зрячих</button></div>
</form>`,
      css: 'form { display: grid; gap: 6px; max-width: 320px; font-family: system-ui; }',
      js: `const IMPLICIT = {
  button: 'button, input[type=button], input[type=submit]',
  link: 'a[href]',
  textbox: 'input:not([type]), input[type=text], input[type=email], textarea',
  checkbox: 'input[type=checkbox]',
  heading: 'h1, h2, h3, h4, h5, h6'
};

function accessibleName(el) {
  // TODO: aria-label → aria-labelledby → label (для полів) → textContent
  return '';
}

function queryAllByRole(container, role, { name } = {}) {
  // TODO
  return [];
}

function getByRole(container, role, options) {
  // TODO
}
`,
      editable: ['js'],
      solution: { js: `const IMPLICIT = {
  button: 'button, input[type=button], input[type=submit]',
  link: 'a[href]',
  textbox: 'input:not([type]), input[type=text], input[type=email], textarea',
  checkbox: 'input[type=checkbox]',
  heading: 'h1, h2, h3, h4, h5, h6'
};

const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
const isField = (el) => el.matches('input, textarea, select');

function accessibleName(el) {
  const label = el.getAttribute('aria-label');
  if (label) return clean(label);
  const by = el.getAttribute('aria-labelledby');
  if (by) return clean(by.split(' ').map((id) => document.getElementById(id)?.textContent).join(' '));
  if (isField(el)) {
    const explicit = el.id && document.querySelector('label[for="' + el.id + '"]');
    const lbl = explicit || el.closest('label');
    return lbl ? clean(lbl.textContent) : '';
  }
  return clean(el.textContent);
}

function roleOf(el) {
  if (el.hasAttribute('role')) return el.getAttribute('role');
  return Object.keys(IMPLICIT).find((r) => el.matches(IMPLICIT[r])) || null;
}

function queryAllByRole(container, role, { name } = {}) {
  return [...container.querySelectorAll('*')].filter((el) => {
    if (roleOf(el) !== role) return false;
    if (el.closest('[hidden], [aria-hidden="true"]')) return false;
    if (name === undefined) return true;
    const n = accessibleName(el);
    return name instanceof RegExp ? name.test(n) : n === name;
  });
}

function getByRole(container, role, options) {
  const found = queryAllByRole(container, role, options);
  if (found.length === 0) throw new Error('Не знайдено роль ' + role);
  if (found.length > 1) throw new Error('Кілька елементів з роллю ' + role);
  return found[0];
}
` },
      hints: [
        '`roleOf(el)`: `el.getAttribute(\'role\')` або перший ключ `IMPLICIT`, для якого `el.matches(selector)`. Перебирайте `container.querySelectorAll(\'*\')`.',
        'Ім\'я поля: `label[for="id"]` або `el.closest(\'label\')`; нормалізація — `.replace(/\\s+/g, \' \').trim()`.'
      ],
      tests: [
        { name: 'неявні ролі й імена', code: "const app = $('#app');\nexpect(getByRole(app, 'heading').textContent).toBe('Профіль');\nexpect(getByRole(app, 'button', { name: 'Зберегти' }).type).toBe('submit');\nexpect(getByRole(app, 'link').getAttribute('href')).toBe('/help');\nexpect(getByRole(app, 'checkbox', { name: 'Підписатися' }).type).toBe('checkbox');" },
        { name: 'імена полів: label for, обгортка, aria-labelledby', code: "const app = $('#app');\nexpect(getByRole(app, 'textbox', { name: 'Email' }).id).toBe('email');\nexpect(getByRole(app, 'textbox', { name: \"Ім'я\" }).name).toBe('n');\nexpect(getByRole(app, 'textbox', { name: 'Про себе' }).tagName).toBe('TEXTAREA');\nexpect(queryAllByRole(app, 'textbox').length).toBe(3);" },
        { name: 'явна роль, aria-label, RegExp', code: "const app = $('#app');\nexpect(getByRole(app, 'button', { name: 'Закрити' }).textContent).toBe('✕');\nexpect(getByRole(app, 'button', { name: 'Скасувати' }).tagName).toBe('DIV');\nexpect(getByRole(app, 'tab').textContent).toBe('Вкладка');\nexpect(queryAllByRole(app, 'button', { name: /^З/ }).length).toBe(2);" },
        { name: 'приховані пропускаються', code: "const app = $('#app');\nexpect(queryAllByRole(app, 'button').map((b) => accessibleName(b))).toEqual(['Зберегти', 'Закрити', 'Скасувати']);" },
        { name: 'помилки', code: "const app = $('#app');\nexpect(() => getByRole(app, 'button')).toThrow('Кілька елементів з роллю button');\nexpect(() => getByRole(app, 'button', { name: 'Видалити' })).toThrow('Не знайдено роль button');\nexpect(() => getByRole(app, 'link', { name: 'Не посилання' })).toThrow('Не знайдено роль link');" }
      ],
      explanation: 'Тест `getByRole(\'button\', { name: \'Зберегти\' })` одночасно перевіряє доступність: div без ролі чи кнопка-іконка без `aria-label` просто не знайдуться. Справжній алгоритм — специфікація «Accessible Name and Description Computation» (title, alt, placeholder, вкладені ролі…); Testing Library бере його з бібліотеки `dom-accessibility-api`.'
    },
    {
      id: 're-testing-theory', group: 'forms-testing', type: 'theory', level: 3, interview: true,
      title: 'Тестування React: Testing Library, Vitest, MSW',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Пріоритет запитів: `getByRole` / `getByLabelText` → `getByText` → `getByTestId` в останню чергу',
        '`userEvent` імітує повну взаємодію (фокус, keydown, input, keyup), тому ближчий до реальності, ніж `fireEvent`',
        '`findBy*` повертає проміс і чекає, поки елемент з\'явиться (асинхронний рендер)',
        'Добрий тест перевіряє внутрішній стан і виклики хуків компонента',
        'MSW перехоплює запити на мережевому рівні — компонент використовує справжній `fetch`'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: запити за роллю відображають те, як користувач (і screen reader) бачить сторінку.',
        'Так: fireEvent відправляє одну подію.',
        'Так: `await screen.findByText(\'Готово\')`.',
        'Ні: тестують поведінку (що бачить і робить користувач), а не реалізацію — інакше рефакторинг ламає тести.',
        'Так: ті самі хендлери можна використати в dev-режимі й Storybook.'
      ],
      hint: 'Тест має зламатися, коли зламалася поведінка, і не ламатися від рефакторингу.',
      answer: `
\`\`\`jsx
test('додає задачу', async () => {
  const user = userEvent.setup();
  render(<Todos />);
  await user.type(screen.getByRole('textbox', { name: 'Нова задача' }), 'Купити хліб');
  await user.click(screen.getByRole('button', { name: 'Додати' }));
  expect(await screen.findByRole('listitem')).toHaveTextContent('Купити хліб');
});
\`\`\`
| Рівень | Інструменти | Що перевіряє |
|---|---|---|
| Unit | Vitest / Jest | функції, хуки (\`renderHook\`) |
| Компонентні / інтеграційні | Testing Library + jsdom або Vitest Browser Mode | поведінка компонентів разом |
| E2E | Playwright | реальний браузер, критичні сценарії |
| Візуальні / a11y | Storybook, axe | вигляд, доступність |

**Те, що ви писали в цьому курсі** (\`mount\`, \`act\`, \`click\`, \`typeInto\`, \`mockFetch\`) — спрощені версії саме цих інструментів.
`,
      keyPoints: ['Запити за роллю', 'userEvent > fireEvent', 'findBy для async', 'Поведінка, не реалізація', 'MSW для мережі']
    },
    {
      id: 're-quiz-icon-button', group: 'forms-testing', type: 'quiz', level: 2,
      title: 'Тест не знаходить кнопку-іконку',
      question: `
\`screen.getByRole('button', { name: 'Видалити' })\` падає: «Unable to find role button with name Видалити». Компонент:

\`\`\`jsx
<button onClick={onDelete}><TrashIcon /></button>
\`\`\`
Що найкраще зробити?
`,
      options: [
        'Додати кнопці `aria-label="Видалити"`',
        'Перейти на `getByTestId(\'delete\')` і додати data-testid',
        'Шукати через `container.querySelector(\'button svg\')`',
        'Замінити `<button>` на `<div onClick>`, щоб тест не залежав від ролі'
      ],
      answer: 0,
      why: [
        'Так: тест виявив реальну проблему доступності — у кнопки немає імені.',
        'Ні: тест пройде, але кнопка лишиться «безіменною» для screen reader.',
        'Ні: залежність від розмітки, проблема доступності лишається.',
        'Ні: це зламає доступність ще більше.'
      ],
      hint: 'Чи бачить користувач screen reader’а ім’я цієї кнопки?',
      explanation: 'Тести за роллю — безкоштовна перевірка a11y. Альтернатива aria-label — візуально прихований текст (`.visually-hidden`) у кнопці. `getByTestId` доречний, коли елемент справді не має семантичної ролі.'
    },
    // ---------------------------------------------------------------- stack
    {
      id: 're-ts-react', group: 'stack', type: 'theory', level: 3, interview: true,
      title: 'TypeScript у React',
      question: 'Оберіть **усі** правильні твердження (React 19 + @types/react 19, strict).',
      choices: [
        '`useState([])` без параметра типу виводить `never[]` — `setList([\'x\'])` не скомпілюється, потрібно `useState<string[]>([])`',
        '`useRef<HTMLInputElement>(null).current` має тип `HTMLInputElement` — null неможливий',
        '`children: React.ReactNode` — будь-що, що React вміє відрендерити (елементи, рядки, числа, масиви, null)',
        '`React.ComponentProps<\'button\'>` дає всі пропи нативної кнопки — зручно для обгорток',
        '`React.FC` обов\'язковий для типізації компонентів'
      ],
      correct: [0, 2, 3],
      why: [
        'Так: перевірено tsc — «Type \'string\' is not assignable to type \'never\'».',
        'Ні: тип — `HTMLInputElement | null` (перевірено tsc), тому `ref.current?.focus()`.',
        'Так: ширший за `ReactElement`.',
        'Так: `type Props = ComponentProps<\'button\'> & { variant: \'primary\' | \'ghost\' }`.',
        'Ні: зазвичай типізують пропи напряму: `function Button({ variant }: Props)`.'
      ],
      hint: 'Що TypeScript може вивести з порожнього масиву? І що лежить у ref до монтування?',
      answer: `
\`\`\`tsx
type ButtonProps = React.ComponentProps<'button'> & { variant?: 'primary' | 'ghost' };
function Button({ variant = 'primary', ...rest }: ButtonProps) {
  return <button className={'btn btn-' + variant} {...rest} />;
}

function Search({ onSearch }: { onSearch: (q: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<string[]>([]);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value);
  return <input ref={ref} onChange={onChange} />;
}

// Узагальнений компонент
function List<T>({ items, render }: { items: T[]; render: (item: T) => React.ReactNode }) {
  return <ul>{items.map(render)}</ul>;
}
\`\`\`
- події: \`React.ChangeEvent<HTMLInputElement>\`, \`React.MouseEvent<HTMLButtonElement>\`, \`React.FormEvent<HTMLFormElement>\`;
- discriminated unions для пропів-варіантів і стану запиту (модуль TS «Практика»);
- \`ref\` у React 19 — звичайний проп: \`ComponentProps<'input'>\` уже містить \`ref\`.
`,
      keyPoints: ['useState<T[]>([])', 'useRef<T>(null) → T | null', 'ReactNode для children', 'ComponentProps для обгорток', 'Без обов\'язкового FC']
    },
    {
      id: 're-tsx-button', group: 'stack', type: 'dom', runtime: 'react', lang: 'tsx', level: 2,
      title: 'TSX: типізований Button на основі ComponentProps<\'button\'>',
      description: `
**Завдання.** Напишіть компонент \`Button\` дизайн-системи на TypeScript. Код перевіряє справжній \`tsc --strict\` з \`@types/react\` 19.
- \`type ButtonProps\` = усі нативні пропи \`<button>\` (\`ComponentProps<'button'>\`) + \`variant?: 'primary' | 'ghost' | 'danger'\` (за замовчуванням \`'primary'\`) + \`loading?: boolean\`;
- \`className\` кнопки — \`btn btn-<variant>\`, а якщо передано свій \`className\` — додається через пробіл;
- \`type\` за замовчуванням \`'button'\` (щоб кнопка у формі випадково не відправляла її), але переданий \`type\` має пріоритет;
- під час \`loading\`: \`disabled\`, \`aria-busy="true"\`, текст \`Зачекайте…\` замість \`children\`;
- решта пропів (\`onClick\`, \`aria-label\`, \`form\`…) потрапляє на \`<button>\` без змін.

**Де трапляється:** кожна дизайн-система й UI-кіт (shadcn/ui, MUI, Chakra) типізує обгортки саме так: компонент приймає все, що вміє нативний елемент, плюс свої варіанти — і редактор підказує й \`variant\`, і \`aria-*\`.

**Приклад**
\`\`\`tsx
<Button variant="ghost" onClick={(e) => e.currentTarget.blur()}>Скасувати</Button>
<Button type="submit" loading={saving}>Зберегти</Button>
<Button variant="huge" />   // помилка компіляції: такого варіанта немає
<Button href="/home" />     // помилка: у <button> немає href
\`\`\`

**Як це працює:** \`ComponentProps<'button'>\` дістає з типів React повний набір атрибутів і подій кнопки, а перетин \`&\` додає свої пропи. Деструктуризація \`{ variant = 'primary', loading = false, className, children, ...rest }\` відокремлює «свої» пропи від нативних, і \`rest\` безпечно розкладається на \`<button {...rest}>\`. Тип події в \`onClick\` (\`MouseEvent<HTMLButtonElement>\`) TS виводить сам.

**Врахуйте:** \`{...rest}\` ставте **перед** своїми атрибутами, інакше чужий \`className\` чи \`disabled\` затре ваш; \`aria-busy\` без \`loading\` не виводьте зовсім.
`,
      html: HTML, css: CSS,
      js: `import type { ComponentProps } from 'react';

// TODO: нативні пропи <button> + variant ('primary' | 'ghost' | 'danger') + loading
type ButtonProps = any;

export function Button(props: ButtonProps) {
  // TODO: className 'btn btn-<variant>' (+ className з пропів), type 'button' за замовчуванням,
  // disabled і aria-busy під час loading, текст «Зачекайте…», решта пропів — на <button>
  return <button>{props.children}</button>;
}

function App() {
  return (
    <div>
      <Button onClick={() => console.log('primary')}>Зберегти</Button>
      <Button variant="ghost">Скасувати</Button>
      <Button loading>Надсилаю</Button>
    </div>
  );
}
`,
      editable: ['js'],
      solution: { js: `import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
};

export function Button({ variant = 'primary', loading = false, className, disabled, type = 'button', children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={['btn', 'btn-' + variant, className].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? 'Зачекайте…' : children}
    </button>
  );
}

function App() {
  return (
    <div>
      <Button onClick={() => console.log('primary')}>Зберегти</Button>
      <Button variant="ghost">Скасувати</Button>
      <Button loading>Надсилаю</Button>
    </div>
  );
}
` },
      typeTests: [
        { name: 'variant — лише з переліку', code: '// @ts-expect-error — такого варіанта немає\nconst bad1 = <Button variant="huge">x</Button>;' },
        { name: 'нативні пропи і тип події доступні', code: 'const ok1 = <Button type="submit" aria-label="Зберегти" onClick={(e) => e.currentTarget.disabled}>x</Button>;' },
        { name: 'чужі пропи заборонені', code: '// @ts-expect-error — у <button> немає href\nconst bad2 = <Button href="/home">x</Button>;' },
        { name: 'loading — boolean', code: '// @ts-expect-error — рядок замість boolean\nconst bad3 = <Button loading="yes">x</Button>;' }
      ],
      hints: [
        '`type ButtonProps = ComponentProps<\'button\'> & { variant?: \'primary\' | \'ghost\' | \'danger\'; loading?: boolean };`',
        'Деструктуризуйте свої пропи з дефолтами (`variant = \'primary\'`, `type = \'button\'`), а решту зберіть у `...rest` і розкладіть першою: `<button {...rest} type={type} …>`.',
        '`className={[\'btn\', \'btn-\' + variant, className].filter(Boolean).join(\' \')}`, `disabled={disabled || loading}`, `aria-busy={loading || undefined}` — `undefined` прибирає атрибут.'
      ],
      tests: [
        { name: 'клас за варіантом і власний className', code: "const a = mount(Button, { children: 'OK' });\nexpect(a.container.querySelector('button').className).toBe('btn btn-primary');\nconst b = mount(Button, { variant: 'ghost', className: 'wide', children: 'OK' });\nexpect(b.container.querySelector('button').className).toBe('btn btn-ghost wide');" },
        { name: 'type за замовчуванням і перевизначення', code: "const a = mount(Button, { children: 'OK' });\nexpect(a.container.querySelector('button').getAttribute('type')).toBe('button');\nconst b = mount(Button, { type: 'submit', children: 'OK' });\nexpect(b.container.querySelector('button').getAttribute('type')).toBe('submit');" },
        { name: 'loading: disabled, aria-busy і текст', code: "const a = mount(Button, { loading: true, children: 'Зберегти' });\nconst btn = a.container.querySelector('button');\nexpect(btn.disabled).toBe(true);\nexpect(btn.getAttribute('aria-busy')).toBe('true');\nexpect(btn.textContent).toBe('Зачекайте…');\nconst b = mount(Button, { children: 'Зберегти' });\nexpect(b.container.querySelector('button').hasAttribute('aria-busy')).toBe(false);" },
        { name: 'нативні пропи й обробник передаються', code: "const onClick = mockFn();\nconst m = mount(Button, { onClick, 'aria-label': 'Закрити', children: '×' });\nconst btn = m.container.querySelector('button');\nexpect(btn.getAttribute('aria-label')).toBe('Закрити');\nawait act(() => click(btn));\nexpect(onClick).toHaveBeenCalledTimes(1);" }
      ],
      explanation: 'Перетин `ComponentProps<\'button\'> & { … }` — стандартний спосіб типізувати обгортки: компонент автоматично приймає всі атрибути й події кнопки, а свої пропи перевіряються суворо. `rest` після деструктуризації містить лише нативні пропи, тож `{...rest}` безпечний. **Типові помилки:** `React.FC<any>` (типізація зникає); `{...rest}` наприкінці (затирає `className`/`disabled`); `type` без дефолту (кнопка у формі відправляє її — модуль HTML). У React 19 `ref` — звичайний проп і вже входить у `ComponentProps<\'button\'>`.'
    },
    {
      id: 're-tsx-data-list', group: 'stack', type: 'dom', runtime: 'react', lang: 'tsx', level: 3,
      title: 'TSX: generic DataList<T> і стан запиту без неможливих комбінацій',
      description: `
**Завдання.** Напишіть на TypeScript узагальнений компонент списку, що сам показує завантаження, помилку й порожній стан. Код перевіряє \`tsc --strict\` з \`@types/react\`.
- \`type RequestState<T>\` — розрізнюване об'єднання за \`status\`: \`{ status: 'loading' }\` | \`{ status: 'error'; error: string }\` | \`{ status: 'success'; data: T[] }\`;
- \`DataList<T>({ state, getKey, renderItem, empty })\`:
  - \`getKey: (item: T) => string | number\`, \`renderItem: (item: T) => ReactNode\`, \`empty?: ReactNode\` (за замовчуванням \`'Порожньо'\`);
  - \`loading\` → \`<p role="status">Завантаження…</p>\`;
  - \`error\` → \`<p role="alert">{error}</p>\`;
  - \`success\` з порожнім \`data\` → \`<p>{empty}</p>\`, інакше \`<ul>\` з \`<li key={getKey(item)}>{renderItem(item)}</li>\`.

**Де трапляється:** списки замовлень, користувачів, повідомлень у будь-якому застосунку з API. Generic-компонент пишуть один раз, а TS для кожного використання виводить тип елемента: у \`renderItem\` підказуються поля саме \`User\` чи \`Order\`.

**Приклад**
\`\`\`tsx
type User = { id: number; name: string };
const state: RequestState<User> = { status: 'success', data: [{ id: 1, name: 'Ann' }] };

<DataList state={state} getKey={(u) => u.id} renderItem={(u) => <b>{u.name}</b>} />
<DataList state={state} getKey={(u) => u.id} renderItem={(u) => u.title} />  // помилка: у User немає title
const broken: RequestState<User> = { status: 'success' };                       // помилка: немає data
\`\`\`

**Як це працює:** параметр типу \`<T>\` у компонента TS виводить з пропа \`state\`, і той самий \`T\` потрапляє в \`getKey\` і \`renderItem\` — тип «протікає» крізь компонент. Розрізнюване об'єднання робить неможливими стани на кшталт «успіх без даних» чи «помилка без тексту», а \`switch (state.status)\` звужує тип у кожній гілці (модуль «TS: практика»).

**Аналогія:** той самий \`RequestState\`, що в задачі «Стан запиту без неможливих комбінацій» модуля TypeScript, — тепер він керує рендером.
`,
      html: HTML, css: CSS,
      js: `import type { ReactNode } from 'react';

// TODO: розрізнюване об'єднання за status:
// 'loading' | 'error' (+ error: string) | 'success' (+ data: T[])
type RequestState<T> = any;

// TODO: DataList<T> з пропами state, getKey, renderItem, empty
export function DataList(props: any) {
  return null;
}

type User = { id: number; name: string };

function App() {
  const state: RequestState<User> = { status: 'success', data: [{ id: 1, name: 'Ann' }, { id: 2, name: 'Bob' }] };
  return <DataList state={state} getKey={(u: User) => u.id} renderItem={(u: User) => <b>{u.name}</b>} />;
}
`,
      editable: ['js'],
      solution: { js: `import type { ReactNode } from 'react';

type RequestState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T[] };

type DataListProps<T> = {
  state: RequestState<T>;
  getKey: (item: T) => string | number;
  renderItem: (item: T) => ReactNode;
  empty?: ReactNode;
};

export function DataList<T>({ state, getKey, renderItem, empty = 'Порожньо' }: DataListProps<T>) {
  switch (state.status) {
    case 'loading':
      return <p role="status">Завантаження…</p>;
    case 'error':
      return <p role="alert">{state.error}</p>;
    case 'success':
      if (state.data.length === 0) return <p>{empty}</p>;
      return (
        <ul>
          {state.data.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}
        </ul>
      );
  }
}

type User = { id: number; name: string };

function App() {
  const state: RequestState<User> = { status: 'success', data: [{ id: 1, name: 'Ann' }, { id: 2, name: 'Bob' }] };
  return <DataList state={state} getKey={(u) => u.id} renderItem={(u) => <b>{u.name}</b>} />;
}
` },
      typeTests: [
        { name: 'тип елемента виводиться зі state', code: 'type Person = { id: number; name: string };\nconst people: RequestState<Person> = { status: \'success\', data: [{ id: 1, name: \'Ann\' }] };\nconst okList = <DataList state={people} getKey={(p) => p.id} renderItem={(p) => p.name.toUpperCase()} />;\n// @ts-expect-error — у Person немає title\nconst badList = <DataList state={people} getKey={(p) => p.id} renderItem={(p) => p.title} />;' },
        { name: 'неможливі стани не описати', code: '// @ts-expect-error — success без data\nconst s1: RequestState<number> = { status: \'success\' };\n// @ts-expect-error — error без тексту\nconst s2: RequestState<number> = { status: \'error\' };\nconst s3: RequestState<number> = { status: \'loading\' };' },
        { name: 'ключ — лише рядок або число', code: 'const nums: RequestState<number> = { status: \'success\', data: [1, 2] };\n// @ts-expect-error — ключ не може бути об\'єктом\nconst badKey = <DataList state={nums} getKey={(n) => ({ n })} renderItem={(n) => n} />;' }
      ],
      hints: [
        '`type RequestState<T> = { status: \'loading\' } | { status: \'error\'; error: string } | { status: \'success\'; data: T[] };`',
        'Узагальнений компонент — звичайна generic-функція: `function DataList<T>({ … }: DataListProps<T>)`, де `DataListProps<T>` описує `state: RequestState<T>`, `getKey: (item: T) => string | number`, `renderItem: (item: T) => ReactNode`.',
        '`switch (state.status)`: у гілці `\'error\'` TS дозволяє `state.error`, у `\'success\'` — `state.data`; порожній масив перевірте до `map`.'
      ],
      tests: [
        { name: 'loading і error', code: "const id = (x) => x;\nconst a = mount(DataList, { state: { status: 'loading' }, getKey: id, renderItem: id });\nexpect(a.container.querySelector('[role=\"status\"]').textContent).toBe('Завантаження…');\nconst b = mount(DataList, { state: { status: 'error', error: 'Мережа недоступна' }, getKey: id, renderItem: id });\nexpect(b.container.querySelector('[role=\"alert\"]').textContent).toBe('Мережа недоступна');" },
        { name: 'success: елементи через renderItem', code: "const m = mount(DataList, { state: { status: 'success', data: [{ id: 1, name: 'Ann' }, { id: 2, name: 'Bob' }] }, getKey: (u) => u.id, renderItem: (u) => React.createElement('b', null, u.name) });\nconst items = [...m.container.querySelectorAll('li')];\nexpect(items.length).toBe(2);\nexpect(items.map((li) => li.querySelector('b').textContent)).toEqual(['Ann', 'Bob']);" },
        { name: 'порожній список і власний empty', code: "const id = (x) => x;\nconst a = mount(DataList, { state: { status: 'success', data: [] }, getKey: id, renderItem: id });\nexpect(a.container.querySelector('p').textContent).toBe('Порожньо');\nexpect(a.container.querySelector('ul')).toBe(null);\nconst b = mount(DataList, { state: { status: 'success', data: [] }, getKey: id, renderItem: id, empty: 'Замовлень ще немає' });\nexpect(b.container.querySelector('p').textContent).toBe('Замовлень ще немає');" },
        { name: 'зміна стану перерендерює', code: "const id = (x) => x;\nconst m = mount(DataList, { state: { status: 'loading' }, getKey: id, renderItem: id });\nm.rerender({ state: { status: 'success', data: ['a', 'b', 'c'] }, getKey: id, renderItem: id });\nexpect(m.container.querySelectorAll('li').length).toBe(3);\nexpect(m.container.querySelector('[role=\"status\"]')).toBe(null);" }
      ],
      explanation: 'Generic-компонент — це generic-функція, тож усе з модуля «TS: generics» працює і тут: `T` виводиться з `state` і зв\'язує типи `getKey` та `renderItem`. Розрізнюване об\'єднання прибирає з типу неможливі стани, а `switch` по `status` дає звужений тип у кожній гілці — без `!` і `as`. **Типові помилки:** три незалежні пропи `loading`, `error`, `data` (з\'являються стани «і помилка, і дані»); `renderItem: (item: any) => …` (зникає підказка полів); ключ `key={index}` (модуль «React: основи»). **Що спитають далі:** як типізувати generic-компонент зі стрілкою в TSX (`<T,>`); як прокинути `ref` у generic-компонент; чим це схоже на `useQuery` у TanStack Query.'
    },
    {
      id: 're-styling', group: 'stack', type: 'theory', level: 2,
      title: 'Стилі в React: CSS Modules, Tailwind, CSS-in-JS',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'CSS Modules генерують унікальні імена класів під час збірки — стилі локальні для компонента без рантайм-витрат',
        'Tailwind генерує лише використані утиліти; варіанти компонентів зручно збирати бібліотеками на кшталт cva',
        'Рантайм CSS-in-JS (styled-components, Emotion) обчислює стилі в браузері, а з Server Components потребує клієнтських меж',
        'Інлайн `style={{...}}` підтримує медіазапити і `:hover`',
        'Zero-runtime рішення (vanilla-extract, StyleX, Panda) витягують CSS під час збірки'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: `styles.button` → `Button_button__x7f2`.',
        'Так: компілятор сканує класи у файлах.',
        'Так: тому нові проєкти з App Router зазвичай обирають CSS Modules або Tailwind.',
        'Ні: інлайн-стилі не мають псевдокласів і медіазапитів.',
        'Так: типізовані стилі без рантайму.'
      ],
      hint: 'Що відбувається під час збірки, а що — у браузері користувача?',
      answer: `
| Підхід | Плюси | Мінуси |
|---|---|---|
| CSS Modules | звичайний CSS, локальність, нуль рантайму | динамічні стилі — через класи / CSS-змінні |
| Tailwind | швидкість, дизайн-токени, малий CSS | довгі \`className\`, потрібні домовленості |
| Рантайм CSS-in-JS | динаміка з props | рантайм, складності з SSR/RSC |
| Zero-runtime CSS-in-JS | типи, нуль рантайму | збірка складніша |

**Динамічні значення** — через CSS-змінні: \`style={{ '--progress': value + '%' }}\` + \`width: var(--progress)\`.
**Дизайн-системи:** headless-компоненти (Radix, React Aria) + власні стилі; shadcn/ui копіює код компонентів у проєкт.

**Аналогія:** каскад, специфічність, \`@layer\` і CSS-змінні з модулів CSS — основа будь-якого підходу.
`,
      keyPoints: ['CSS Modules — локальні класи', 'Tailwind — утиліти', 'Рантайм CSS-in-JS і RSC', 'CSS-змінні для динаміки', 'Headless + стилі']
    },
    // ---------------------------------------------------------------- nextjs
    {
      id: 're-render-strategies', group: 'nextjs', type: 'theory', level: 3, interview: true,
      title: 'CSR, SSR, SSG, ISR, стрімінг і гідратація',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'CSR: сервер віддає майже порожній HTML, контент з\'являється після завантаження і виконання JS',
        'SSR: HTML генерується на кожен запит — швидкий перший показ контенту і краще SEO',
        'SSG: HTML генерується під час збірки; ISR — перегенерація статичних сторінок у фоні за часом або за подією',
        'Гідратація — процес, коли React у браузері підключає обробники подій і стан до готового серверного HTML',
        'Після SSR сторінка інтерактивна одразу, ще до завантаження JS'
      ],
      correct: [0, 1, 2, 3],
      why: [
        'Так: класичне SPA (Vite + React).',
        'Так: але сервер працює на кожен запит, TTFB залежить від даних.',
        'Так: статика з CDN — найшвидше; ISR оновлює без повної перезбірки.',
        'Так: `hydrateRoot` прив\'язує React до існуючого DOM.',
        'Ні: HTML видно, але кнопки не працюють, доки JS не завантажився й не гідратував.'
      ],
      hint: 'Розрізняйте «контент видно» і «сторінка реагує на кліки».',
      answer: `
| Стратегія | Коли генерується HTML | Для чого |
|---|---|---|
| CSR | у браузері | кабінети, адмінки за логіном |
| SSR | на кожен запит | персоналізовані сторінки, SEO |
| SSG | при збірці | документація, лендінги, блог |
| ISR | при збірці + фонова перегенерація | каталоги, новини |
| Стрімінг SSR | частинами (Suspense) | швидка «оболонка» + повільні дані |

**Стрімінг:** сервер одразу шле оболонку, а повільні частини — пізніше, кожна в межах \`<Suspense>\`; **selective hydration** гідратує спершу ту частину, з якою взаємодіє користувач.

**Метрики:** SSR/SSG покращують LCP; великий JS для гідратації погіршує INP (модуль «Продуктивність»). Server Components зменшують цей JS.
`,
      keyPoints: ['CSR / SSR / SSG / ISR', 'Гідратація', 'Стрімінг із Suspense', 'Видно ≠ інтерактивно', 'Вибір за типом сторінки']
    },
    {
      id: 're-rsc-theory', group: 'nextjs', type: 'theory', level: 4, interview: true,
      title: 'Server Components і Server Actions (Next.js App Router)',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'У App Router компоненти за замовчуванням серверні: виконуються на сервері, їхній код не потрапляє в клієнтський бандл',
        'Серверний компонент може бути `async` і читати дані напряму (БД, файли, приватні API-ключі)',
        'У серверних компонентах доступні `useState`, `useEffect` і обробники `onClick`',
        '`\'use client\'` позначає межу: цей модуль і все, що він імпортує, стає клієнтським кодом',
        'Пропи з серверного компонента в клієнтський мають бути серіалізованими (функції передати не можна, крім Server Actions)'
      ],
      correct: [0, 1, 3, 4],
      why: [
        'Так: на клієнт іде лише результат (RSC payload).',
        'Так: секрети лишаються на сервері.',
        'Ні: стан, ефекти й обробники — лише в клієнтських компонентах.',
        'Так: межа — на рівні модуля-імпорту.',
        'Так: дані перетинають мережу; Server Action — функція з `\'use server\'`, яку клієнт викликає як RPC.'
      ],
      hint: 'Де виконується код і що має перетнути мережу між сервером і браузером?',
      answer: `
\`\`\`tsx
// app/products/page.tsx — серверний компонент
export default async function Page() {
  const products = await db.product.findMany();   // напряму, без API
  return <ProductList products={products} />;
}

// app/products/AddToCart.tsx
'use client';
export function AddToCart({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return <button disabled={pending} onClick={() => start(() => addToCart(id))}>У кошик</button>;
}

// app/actions.ts
'use server';
export async function addToCart(id: string) { /* перевірка сесії, запис у БД, revalidatePath */ }
\`\`\`
**Правила композиції:** клієнтський компонент не може імпортувати серверний, але може отримати його як \`children\` (серверний рендериться раніше). Тримайте \`'use client'\` якомога нижче — на інтерактивних «листках».

**Безпека:** Server Action — публічний ендпоінт: перевіряйте автентифікацію, права і валідуйте аргументи (Zod) у кожній.

**Кешування** в Next.js змінювалося між версіями (Next 15 — запити без кешу за замовчуванням; Next 16 — Cache Components і директива \`'use cache'\`) — звіряйтеся з документацією своєї версії.

**Аналоги:** React Router framework mode, TanStack Start; у Vue — Nuxt (SSR, але без моделі Server Components).
`,
      keyPoints: ['Серверні за замовчуванням', 'async-компоненти й прямий доступ до даних', '\'use client\' — межа модуля', 'Серіалізовані пропи', 'Server Action — публічний ендпоінт']
    },
    {
      id: 're-quiz-use-client', group: 'nextjs', type: 'quiz', level: 3,
      title: 'Якому компоненту потрібен \'use client\'',
      question: 'Next.js App Router. Який компонент **обов\'язково** має бути клієнтським?',
      options: [
        'Кнопка «Показати ще», що зберігає кількість показаних елементів у `useState`',
        '`async` компонент, що читає статті з БД і рендерить список',
        'Футер зі статичними посиланнями',
        'Компонент, що форматує ціну через `Intl.NumberFormat` і показує її'
      ],
      answer: 0,
      why: [
        'Так: стан і обробник кліку — лише на клієнті.',
        'Ні: async і доступ до БД — якраз серверний компонент.',
        'Ні: статичний вміст — на сервері, без JS.',
        'Ні: Intl доступний і на сервері, взаємодії немає.'
      ],
      hint: 'Що з цього реагує на дії користувача або тримає стан?',
      explanation: 'Принцип: серверне за замовчуванням, `\'use client\'` — лише для інтерактивності (стан, ефекти, обробники, браузерні API). Чим менше клієнтських компонентів, тим менше JS для завантаження й гідратації.'
    },
    {
      id: 're-quiz-hydration', group: 'nextjs', type: 'quiz', level: 3,
      title: 'Помилка гідратації',
      question: `
Компонент рендериться на сервері (SSR) і гідратується в браузері. Чому в консолі помилка «Hydration failed… server rendered HTML didn't match the client»?

\`\`\`jsx
function Greeting() {
  const hour = new Date().getHours();
  return <p>{hour < 12 ? 'Доброго ранку' : 'Добрий день'}, {typeof window === 'undefined' ? 'гість' : localStorage.name}</p>;
}
\`\`\`
`,
      options: [
        'Клієнт рендерить інший HTML: результат залежить від середовища й часу',
        'localStorage недоступний у браузері до завершення гідратації',
        'SSR не підтримує тернарні оператори всередині JSX',
        'Це лише в режимі розробки — у продакшені HTML збігається'
      ],
      answer: 0,
      why: [
        'Так: `typeof window` і час/часовий пояс різні на сервері й клієнті → різний HTML.',
        'Ні: у браузері доступний; проблема — що на сервері його немає.',
        'Ні: тернарні оператори — звичайний JS.',
        'Ні: невідповідність лишається, React перебудує дерево на клієнті (повільніше).'
      ],
      hint: 'Що React порівнює під час гідратації?',
      explanation: 'Виправлення: значення, специфічні для браузера, читати в `useEffect` після гідратації (перший рендер — як на сервері); `useSyncExternalStore` з `getServerSnapshot`; або винести в клієнтський компонент з `dynamic(..., { ssr: false })`. Для неминучих різниць (час) — `suppressHydrationWarning` на конкретному елементі. Часовий пояс сервера і користувача різний — дати форматуйте узгоджено.'
    }
  ]
});
})();
