(function () {
// Фінальний проєкт, частина 2 (React + TypeScript). Типи — з частини 1; компоненти отримують api пропом.
const HTML = '<div id="root"></div>';
const CSS = `body { font-family: system-ui, sans-serif; padding: 12px; }
input, select, button { font: inherit; padding: 4px 8px; margin: 2px; }
label { display: block; margin: 6px 0; }
.field-error, [role="alert"] { color: #b00020; }
.total { color: #555; }`;

const TYPES = `// ---- Типи з частини 1 (дані й API)
type TaskStatus = 'todo' | 'doing' | 'done';
type Task = { id: string; title: string; status: TaskStatus; assignee: string | null; updatedAt: string };
type TaskPage = { items: Task[]; total: number; page: number; pageSize: number };
type ListParams = { q?: string; status?: TaskStatus | 'all'; page?: number; signal?: AbortSignal };
type NewTask = { title: string; assignee?: string | null };
type TaskPatch = Partial<Pick<Task, 'title' | 'status' | 'assignee'>>;
type TasksApi = {
  list(params?: ListParams): Promise<TaskPage>;
  create(input: NewTask): Promise<Task>;
  update(id: string, patch: TaskPatch): Promise<Task>;
};
`;

// Демо-API для перегляду (у тестах — фейкові api з mockFn).
const DEMO = `
const demoTasks: Task[] = [
  { id: 't1', title: 'Купити домен', status: 'todo', assignee: null, updatedAt: '2026-11-18T10:00:00Z' },
  { id: 't2', title: 'Налаштувати CI', status: 'doing', assignee: 'ann', updatedAt: '2026-11-18T10:00:00Z' },
  { id: 't3', title: 'Оновити README', status: 'done', assignee: null, updatedAt: '2026-11-18T10:00:00Z' },
];
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const demoApi: TasksApi = {
  async list({ q = '', status = 'all' } = {}) {
    await wait(300);
    const items = demoTasks.filter((t) => (status === 'all' || t.status === status) && t.title.toLowerCase().includes(q.trim().toLowerCase()));
    return { items, total: items.length, page: 1, pageSize: 20 };
  },
  async create(input) {
    await wait(300);
    return { id: 't' + Date.now(), title: input.title, status: 'todo', assignee: input.assignee ?? null, updatedAt: new Date().toISOString() };
  },
  async update(id, patch) {
    await wait(300);
    const task = demoTasks.find((t) => t.id === id);
    if (!task) throw new Error('Задачу не знайдено');
    return { ...task, ...patch, updatedAt: new Date().toISOString() };
  },
};
`;

const T = 'const task = (id, title, status = "todo") => ({ id, title, status, assignee: null, updatedAt: "2026-11-18T10:00:00Z" });\nconst page = (items) => ({ items, total: items.length, page: 1, pageSize: 20 });\n';

FE.topic('capstone-react', {
  intro: `
## Частина 2 на React

Інтерфейс дошки поверх шару з частини 1. Компоненти отримують \`api\` пропом (\`TasksApi\` — той самий контракт, що повертає \`createTasksApi\`), тож тести підставляють фейкове API, а перегляд — демо-API із затримкою.

| Крок | Що тренує |
|---|---|
| Дошка | debounce, скасування запитів у cleanup ефекту, стани завантаження/помилки/порожньо, повтор |
| Форма | контрольовані поля, валідація, \`aria-invalid\` + \`aria-describedby\`, фокус на помилці, стан відправки |
| Оптимістичне оновлення | миттєвий UI, точковий відкат, блокування повторного кліку, оголошення через \`role="status"\` |

Код — TSX: справжній \`tsc --strict\` з \`@types/react\` перевіряє пропи, події й узагальнені хуки.
`,
  groups: [
    { id: 'board', title: 'React: дошка, debounce і гонки відповідей' },
    { id: 'mutations', title: 'React: форма й оптимістичні оновлення' }
  ],
  items: [
    {
      id: 'cap-react-quiz-race', group: 'board', type: 'quiz', level: 3,
      title: 'Пошук без скасування: що побачить користувач',
      question: `
\`\`\`tsx
function TaskBoard({ api }: { api: TasksApi }) {
  const [q, setQ] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    api.list({ q }).then((page) => setTasks(page.items));
  }, [api, q]);
  // …поле пошуку викликає setQ
}
\`\`\`
Користувач набрав «ab», а потім «abc». Відповідь на \`q = 'ab'\` прийшла через 900 мс, на \`q = 'abc'\` — через 200 мс. Що буде на екрані через секунду?`,
      options: [
        'Результати для «ab»',
        'Результати для «abc»: React скасовує запит попереднього ефекту',
        'Результати для «abc»: ефект чекає, доки завершиться попередній запит',
        'Порожній список: два `setTasks` конфліктують, і React скидає стан'
      ],
      answer: 0,
      why: [
        'Так: застаріла відповідь прийшла останньою і перезаписала свіжу — класична гонка відповідей (race condition).',
        'Ні: React викликає cleanup попереднього ефекту, але cleanup тут немає — сам React нічого не знає про запит.',
        'Ні: ефекти не чекають на проміси — новий ефект запускається одразу після рендеру з новим `q`.',
        'Ні: кожен `setTasks` просто замінює стан; виграє той, що викликаний останнім.'
      ],
      hint: 'У якому порядку виконаються два колбеки `then`? Хто з них викличе `setTasks` останнім?',
      explanation: 'Порядок відповідей мережі не гарантований, тож без скасування на екрані опиняється та, що прийшла останньою. Виправлення — cleanup ефекту: `const c = new AbortController(); …({ q, signal: c.signal }); return () => c.abort();` і перевірка `c.signal.aborted` перед `setState` (або прапорець `ignore`). Debounce зменшує кількість запитів, але гонку не прибирає: повільна відповідь може прийти після паузи. Наступна задача робить усе це разом. У Strict Mode React у розробці навмисно запускає ефект двічі — саме щоб такі баги проявилися.'
    },
    {
      id: 'cap-react-board', group: 'board', type: 'dom', runtime: 'react', lang: 'tsx', level: 3,
      title: 'Крок 4 (React). Дошка: фільтри, debounce, скасування і повтор',
      description: `
**Завдання.** Напишіть \`TaskBoard({ api, delay = 300 })\` — список задач з пошуком і фільтром статусу поверх API з частини 1.
- хук \`useDebouncedValue<T>(value: T, delay: number): T\` (як у модулі «React: хуки»);
- \`<input type="search" aria-label="Пошук задач">\` і \`<select aria-label="Статус">\` з варіантами \`all\` (Усі), \`todo\`, \`doing\`, \`done\`;
- запит \`api.list({ q, status, signal })\` — при монтуванні та при зміні **відкладеного** тексту (\`delay\` мс) або статусу (статус — одразу);
- кожен новий запит скасовує попередній (\`AbortController\` у cleanup ефекту); відповідь чи помилка скасованого запиту на екран не потрапляє, **навіть якщо API не відхилило проміс**;
- завантаження → \`<p role="status">Завантаження…</p>\`; помилка → \`<p role="alert">Не вдалося завантажити: {повідомлення}</p>\` і кнопка «Спробувати ще», що повторює запит; успіх → \`<p className="total">Знайдено: {total}</p>\` і \`<ul aria-label="Задачі">\` з \`<li>{title}</li>\`; порожньо → \`<p>Нічого не знайдено</p>\`.

**Де трапляється:** головний екран будь-якої адмінки, CRM чи трекера — і найчастіша частина тестового завдання. Рев'юер перевіряє саме це: debounce, гонки відповідей, усі стани і повтор після помилки.

**Як це працює:** ефект залежить від \`[api, q, status, attempt]\`: будь-яка зміна запускає новий запит, а React перед цим викликає cleanup попереднього — там \`abort()\`. Кнопка повтору просто збільшує лічильник \`attempt\`, і ефект перезапускається. Стан запиту — розрізнюване об'єднання \`RequestState\` (модуль «TS: практика»), тож «помилка разом з даними» неможлива.

**Аналогія:** \`createTasksApi\` з кроку 2 уже передає \`signal\` у \`fetch\` — справжній запит переривається; тут ви вмикаєте це з боку інтерфейсу.
`,
      html: HTML, css: CSS,
      js: `import { useEffect, useState } from 'react';

` + TYPES + `
type RequestState<T> = { status: 'loading' } | { status: 'error'; error: string } | { status: 'success'; data: T };

export function useDebouncedValue<T>(value: T, delay: number): T {
  // TODO: setTimeout в ефекті, clearTimeout у cleanup (модуль «React: хуки»)
  return value;
}

export function TaskBoard({ api, delay = 300 }: { api: any; delay?: number }) {
  const [query, setQuery] = useState('');
  // TODO: status ('all' | TaskStatus), attempt (лічильник повторів), state: RequestState<TaskPage>
  // TODO: q = useDebouncedValue(query, delay)
  // TODO: ефект на [api, q, status, attempt]: AbortController, api.list({ q, status, signal }),
  //       результат скасованого запиту ігнорувати, cleanup → abort()
  return (
    <section>
      <input type="search" aria-label="Пошук задач" value={query} onChange={(e) => setQuery(e.target.value)} />
      {/* TODO: select статусу; стани: завантаження / помилка з повтором / список / порожньо */}
    </section>
  );
}
` + DEMO + `
function App() {
  return <TaskBoard api={demoApi} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useEffect, useState } from 'react';

` + TYPES + `
type RequestState<T> = { status: 'loading' } | { status: 'error'; error: string } | { status: 'success'; data: T };
type StatusFilter = TaskStatus | 'all';

const STATUS_LABELS: Record<StatusFilter, string> = { all: 'Усі', todo: 'До роботи', doing: 'У роботі', done: 'Готово' };
const FILTERS = Object.keys(STATUS_LABELS) as StatusFilter[];

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function TaskBoard({ api, delay = 300 }: { api: Pick<TasksApi, 'list'>; delay?: number }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<RequestState<TaskPage>>({ status: 'loading' });
  const q = useDebouncedValue(query, delay);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    api.list({ q, status, signal: controller.signal }).then(
      (data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data });
      },
      (err: unknown) => {
        if (controller.signal.aborted) return; // скасований запит — не помилка для користувача
        setState({ status: 'error', error: err instanceof Error ? err.message : String(err) });
      },
    );
    return () => controller.abort();
  }, [api, q, status, attempt]);

  return (
    <section>
      <input type="search" aria-label="Пошук задач" value={query} onChange={(e) => setQuery(e.target.value)} />
      <select aria-label="Статус" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
        {FILTERS.map((f) => <option key={f} value={f}>{STATUS_LABELS[f]}</option>)}
      </select>
      {state.status === 'loading' && <p role="status">Завантаження…</p>}
      {state.status === 'error' && (
        <div>
          <p role="alert">Не вдалося завантажити: {state.error}</p>
          <button onClick={() => setAttempt((n) => n + 1)}>Спробувати ще</button>
        </div>
      )}
      {state.status === 'success' && (state.data.items.length === 0 ? (
        <p>Нічого не знайдено</p>
      ) : (
        <>
          <p className="total">Знайдено: {state.data.total}</p>
          <ul aria-label="Задачі">
            {state.data.items.map((t) => <li key={t.id}>{t.title}</li>)}
          </ul>
        </>
      ))}
    </section>
  );
}
` + DEMO + `
function App() {
  return <TaskBoard api={demoApi} />;
}
` },
      typeTests: [
        { name: 'useDebouncedValue зберігає тип значення', code: 'function DebounceProbe({ count }: { count: number }) {\n  const v = useDebouncedValue(count, 100);\n  type V = Expect<Equal<typeof v, number>>;\n  const tags = useDebouncedValue<string[]>([], 100);\n  type W = Expect<Equal<typeof tags, string[]>>;\n  return null;\n}' },
        { name: 'api має повертати TaskPage', code: "const goodApi = { list: async () => ({ items: [], total: 0, page: 1, pageSize: 20 }) };\nconst okBoard = <TaskBoard api={goodApi} />;\nconst badApi = { list: async () => [] };\n// @ts-expect-error — list повертає не TaskPage\nconst badBoard = <TaskBoard api={badApi} />;" }
      ],
      hints: [
        'Стан: `query`, `status`, `attempt` і `state: RequestState<TaskPage>`; відкладений текст — `const q = useDebouncedValue(query, delay)`.',
        'Ефект: `const controller = new AbortController(); setState({ status: \'loading\' }); api.list({ q, status, signal: controller.signal }).then(onOk, onErr); return () => controller.abort();` — в обох колбеках спершу `if (controller.signal.aborted) return`.',
        'Повтор — `setAttempt((n) => n + 1)`: `attempt` у залежностях ефекту перезапускає запит. Список і «Нічого не знайдено» — лише в гілці `state.status === \'success\'`.'
      ],
      tests: [
        { name: 'перше завантаження: статус, потім список', code: T + 'const api = { list: mockFn(() => Promise.resolve(page([task("t1", "Купити домен"), task("t2", "Налаштувати CI")]))) };\nconst m = mount(TaskBoard, { api, delay: 10 });\nexpect(m.container.querySelector(\'[role="status"]\').textContent).toBe("Завантаження…");\nawait settle(20);\nexpect([...m.container.querySelectorAll("li")].map((li) => li.textContent)).toEqual(["Купити домен", "Налаштувати CI"]);\nexpect(m.container.querySelector(".total").textContent).toBe("Знайдено: 2");\nexpect(api.list.mock.calls[0][0].q).toBe("");\nexpect(api.list.mock.calls[0][0].status).toBe("all");\nm.unmount();' },
        { name: 'debounce: один запит на останній текст', code: T + 'const api = { list: mockFn(({ q }) => Promise.resolve(page(q ? [task("t1", "Результат " + q)] : []))) };\nconst m = mount(TaskBoard, { api, delay: 30 });\nawait settle(40);\nconst field = m.container.querySelector(\'input[type="search"]\');\nawait act(() => typeInto(field, "b"));\nawait act(() => typeInto(field, "bu"));\nawait act(() => typeInto(field, "bug"));\nawait settle(80);\nexpect(api.list.mock.calls.map((c) => c[0].q)).toEqual(["", "bug"]);\nexpect(m.container.querySelector("li").textContent).toBe("Результат bug");\nm.unmount();' },
        { name: 'статус — одразу, попередній запит скасовано', code: T + 'const signals = [];\nconst api = { list: mockFn(({ status, signal }) => { signals.push(signal); return new Promise((resolve) => setTimeout(() => resolve(page([task("t-" + status, "Задачі: " + status, status === "all" ? "todo" : status)])), status === "all" ? 80 : 5)); }) };\nconst m = mount(TaskBoard, { api, delay: 10 });\nawait act(() => typeInto(m.container.querySelector("select"), "done"));\nawait settle(120);\nexpect(signals[0].aborted).toBe(true);\nexpect(api.list.mock.calls[1][0].status).toBe("done");\nexpect([...m.container.querySelectorAll("li")].map((li) => li.textContent)).toEqual(["Задачі: done"]);\nm.unmount();' },
        { name: 'помилка і повтор', code: T + 'let n = 0;\nconst api = { list: mockFn(() => (++n === 1 ? Promise.reject(new Error("500")) : Promise.resolve(page([task("t1", "A")])))) };\nconst m = mount(TaskBoard, { api, delay: 10 });\nawait settle(10);\nexpect(m.container.querySelector(\'[role="alert"]\').textContent).toBe("Не вдалося завантажити: 500");\nconst retry = [...m.container.querySelectorAll("button")].find((b) => b.textContent === "Спробувати ще");\nawait act(() => click(retry));\nawait settle(10);\nexpect(m.container.querySelector(\'[role="alert"]\')).toBe(null);\nexpect(m.container.querySelector("li").textContent).toBe("A");\nexpect(api.list).toHaveBeenCalledTimes(2);\nm.unmount();' },
        { name: 'порожній результат', code: T + 'const api = { list: mockFn(() => Promise.resolve(page([]))) };\nconst m = mount(TaskBoard, { api, delay: 10 });\nawait settle(10);\nexpect([...m.container.querySelectorAll("p")].map((p) => p.textContent)).toContain("Нічого не знайдено");\nexpect(m.container.querySelector("ul")).toBe(null);\nm.unmount();' }
      ],
      explanation: `
Три механізми в одному компоненті: debounce зменшує кількість запитів, \`AbortController\` у cleanup скасовує непотрібні, а перевірка \`signal.aborted\` гарантує, що застаріла відповідь не потрапить на екран, навіть якщо API її не відхилило. \`RequestState\` робить стани взаємовиключними, а \`attempt\` дає повтор без дублювання логіки.

**Типові помилки:** debounce без скасування (гонка лишається); \`catch\`, що показує «помилку» на звичайне скасування; три окремі \`useState\` для \`loading\`/\`error\`/\`data\`, що розсинхронізуються; \`api\` поза залежностями ефекту.

**Що спитають далі:** як синхронізувати фільтри з URL (\`?q=&status=\`), щоб посиланням можна було поділитися; як показувати старий список під час нового запиту (\`peek\` з кешу кроку 3 або \`useDeferredValue\`); чим це замінює TanStack Query (\`useQuery({ queryKey: ['tasks', q, status], queryFn: ({ signal }) => api.list({ q, status, signal }) })\`).
`
    },
    {
      id: 'cap-react-form', group: 'mutations', type: 'dom', runtime: 'react', lang: 'tsx', level: 3,
      title: 'Крок 5 (React). Форма нової задачі: валідація, доступність, стан відправки',
      description: `
**Завдання.** Напишіть \`NewTaskForm({ onCreate })\`, де \`onCreate(input: NewTask) => Promise<Task>\` — це \`api.create\` з частини 1.
- поля в \`<label>\`: \`Назва\` (\`<input name="title">\`) і \`Виконавець (необов'язково)\` (\`<input name="assignee">\`); форма з \`noValidate\`;
- при відправці назва обрізається; коротша за 3 символи → \`Назва — щонайменше 3 символи\`, довша за 80 → \`Назва — до 80 символів\`;
- помилка: \`<p id="title-error" className="field-error">\`, у поля \`aria-invalid="true"\` і \`aria-describedby="title-error"\`, фокус переходить у поле назви; \`onCreate\` не викликається;
- якщо помилку вже показано, вона оновлюється під час введення і зникає, щойно назва стала коректною;
- коректно → \`onCreate({ title, assignee: обрізаний виконавець або null })\`; поки чекаємо — кнопка \`disabled\` з текстом \`Створюю…\` (інакше \`Створити\`);
- успіх → поля очищуються, \`<p role="status">Задачу «{назва}» створено</p>\`; помилка → \`<p role="alert">{повідомлення}</p>\`, введене зберігається.

**Де трапляється:** будь-яка форма створення — задачі, коментаря, замовлення. На тестовому завданні форма без зрозумілих помилок, фокусу й захисту від подвійного сабміту — типова причина відмови.

**Як це працює:** \`aria-invalid\` каже screen reader-у, що поле з помилкою, а \`aria-describedby\` зачитує текст помилки разом з назвою поля (модуль «Доступність»). Фокус на першому полі з помилкою веде користувача клавіатури прямо до проблеми. \`disabled\` на час запиту прибирає подвійну відправку; \`finally\` повертає кнопку і при успіху, і при помилці.

**Врахуйте:** \`aria-invalid\` і \`aria-describedby\` без помилки не виводьте зовсім (\`undefined\`); \`e.preventDefault()\` — інакше браузер перезавантажить сторінку.
`,
      html: HTML, css: CSS,
      js: `import { useRef, useState, type FormEvent } from 'react';

` + TYPES + `
export function NewTaskForm({ onCreate }: { onCreate: any }) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  // TODO: error, serverError, created, pending; titleRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // 1. Перевірка назви (3…80 символів після trim): помилка → показати, фокус у поле, вийти
    // 2. pending = true; try { await onCreate(...); очистити поля; created } catch { serverError } finally { pending = false }
    // TODO
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>
        Назва
        <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        Виконавець (необов'язково)
        <input name="assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
      </label>
      <button type="submit">Створити</button>
    </form>
  );
}
` + DEMO + `
function App() {
  return <NewTaskForm onCreate={demoApi.create} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useRef, useState, type FormEvent } from 'react';

` + TYPES + `
function validateTitle(value: string): string | null {
  const title = value.trim();
  if (title.length < 3) return 'Назва — щонайменше 3 символи';
  if (title.length > 80) return 'Назва — до 80 символів';
  return null;
}

export function NewTaskForm({ onCreate }: { onCreate: (input: NewTask) => Promise<Task> }) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  function changeTitle(value: string) {
    setTitle(value);
    if (error) setError(validateTitle(value)); // показану помилку оновлюємо під час введення
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const problem = validateTitle(title);
    setError(problem);
    setServerError(null);
    setCreated(null);
    if (problem) {
      titleRef.current?.focus();
      return;
    }
    setPending(true);
    try {
      const task = await onCreate({ title: title.trim(), assignee: assignee.trim() || null });
      setTitle('');
      setAssignee('');
      setCreated(task.title);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Не вдалося створити задачу');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>
        Назва
        <input
          ref={titleRef}
          name="title"
          value={title}
          onChange={(e) => changeTitle(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'title-error' : undefined}
        />
      </label>
      {error && <p id="title-error" className="field-error">{error}</p>}
      <label>
        Виконавець (необов'язково)
        <input name="assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
      </label>
      <button type="submit" disabled={pending}>{pending ? 'Створюю…' : 'Створити'}</button>
      {serverError && <p role="alert">{serverError}</p>}
      {created && <p role="status">Задачу «{created}» створено</p>}
    </form>
  );
}
` + DEMO + `
function App() {
  return <NewTaskForm onCreate={demoApi.create} />;
}
` },
      typeTests: [
        { name: 'onCreate має повертати Promise<Task>', code: '// @ts-expect-error — колбек повертає число\nconst badForm = <NewTaskForm onCreate={() => 42} />;' },
        { name: 'аргумент onCreate — NewTask', code: "const okForm = <NewTaskForm onCreate={async (input) => ({ id: 'x', title: input.title, status: 'todo', assignee: input.assignee ?? null, updatedAt: '' })} />;\n// @ts-expect-error — у NewTask немає поля status\nconst badForm2 = <NewTaskForm onCreate={async (input) => ({ id: 'x', title: input.status, status: 'todo', assignee: null, updatedAt: '' })} />;" }
      ],
      hints: [
        'Винесіть перевірку в `validateTitle(value): string | null` — її використовують і відправка, і введення (якщо помилку вже показано).',
        'Атрибути поля: `aria-invalid={error ? true : undefined}` і `aria-describedby={error ? \'title-error\' : undefined}`; фокус — `titleRef.current?.focus()`.',
        'Відправка: `setPending(true); try { const task = await onCreate({ title: title.trim(), assignee: assignee.trim() || null }); … } catch (err) { … } finally { setPending(false); }`.'
      ],
      tests: [
        { name: 'коротка назва: помилка, aria і фокус', code: 'const onCreate = mockFn(() => Promise.resolve({}));\nconst m = mount(NewTaskForm, { onCreate });\nconst title = m.container.querySelector(\'input[name="title"]\');\nawait act(() => typeInto(title, " ab "));\nawait act(async () => { submit(m.container.querySelector("form")); });\nexpect(m.container.querySelector("#title-error").textContent).toBe("Назва — щонайменше 3 символи");\nexpect(title.getAttribute("aria-invalid")).toBe("true");\nexpect(title.getAttribute("aria-describedby")).toBe("title-error");\nexpect(document.activeElement).toBe(title);\nexpect(onCreate).not.toHaveBeenCalled();\nm.unmount();' },
        { name: 'помилка зникає після виправлення; задовга назва', code: 'const m = mount(NewTaskForm, { onCreate: mockFn(() => Promise.resolve({})) });\nconst title = m.container.querySelector(\'input[name="title"]\');\nconst form = m.container.querySelector("form");\nawait act(async () => { submit(form); });\nexpect(m.container.querySelector("#title-error")).not.toBe(null);\nawait act(() => typeInto(title, "Нова задача"));\nexpect(m.container.querySelector("#title-error")).toBe(null);\nexpect(title.hasAttribute("aria-invalid")).toBe(false);\nawait act(() => typeInto(title, "x".repeat(81)));\nawait act(async () => { submit(form); });\nexpect(m.container.querySelector("#title-error").textContent).toBe("Назва — до 80 символів");\nm.unmount();' },
        { name: 'успіх: стан відправки, дані, очищення', code: 'let finish;\nconst onCreate = mockFn((input) => new Promise((r) => { finish = () => r({ id: "t9", title: input.title, status: "todo", assignee: input.assignee, updatedAt: "2026-11-18T10:00:00Z" }); }));\nconst m = mount(NewTaskForm, { onCreate });\nconst q = (s) => m.container.querySelector(s);\nawait act(() => typeInto(q(\'input[name="title"]\'), "  Оновити README  "));\nawait act(async () => { submit(q("form")); });\nexpect(onCreate).toHaveBeenCalledWith({ title: "Оновити README", assignee: null });\nexpect(q(\'button[type="submit"]\').disabled).toBe(true);\nexpect(q(\'button[type="submit"]\').textContent).toBe("Створюю…");\nawait act(async () => { finish(); });\nawait settle(0);\nexpect(q(\'[role="status"]\').textContent).toBe("Задачу «Оновити README» створено");\nexpect(q(\'input[name="title"]\').value).toBe("");\nexpect(q(\'button[type="submit"]\').disabled).toBe(false);\nm.unmount();' },
        { name: 'помилка сервера: alert, введене збережено', code: 'const onCreate = mockFn(() => Promise.reject(new Error("Сервер недоступний")));\nconst m = mount(NewTaskForm, { onCreate });\nconst q = (s) => m.container.querySelector(s);\nawait act(() => typeInto(q(\'input[name="title"]\'), "Нова задача"));\nawait act(() => typeInto(q(\'input[name="assignee"]\'), " ann "));\nawait act(async () => { submit(q("form")); });\nawait settle(0);\nexpect(q(\'[role="alert"]\').textContent).toBe("Сервер недоступний");\nexpect(q(\'input[name="title"]\').value).toBe("Нова задача");\nexpect(onCreate).toHaveBeenCalledWith({ title: "Нова задача", assignee: "ann" });\nexpect(q(\'button[type="submit"]\').disabled).toBe(false);\nm.unmount();' }
      ],
      explanation: `
Доступна форма — це не лише \`<label>\`: помилка має бути зв'язана з полем (\`aria-describedby\`), поле — позначене (\`aria-invalid\`), а фокус — переведений до проблеми. Помилку показуємо після відправки, а прибираємо одразу під час виправлення («карати пізно, хвалити рано»).

**Типові помилки:** валідація лише через \`disabled\` кнопку (незрозуміло, що не так); помилка без зв'язку з полем; \`assignee: ''\` замість \`null\`; немає \`finally\` — кнопка лишається заблокованою після помилки.

**Що спитають далі:** як перевести це на React Hook Form + Zod (одна схема для типу й валідації — модуль «Екосистема React»); як використати \`useActionState\` з React 19 замість ручного \`pending\`; як показати помилки сервера біля конкретних полів (422 з \`{ field: message }\`).
`
    },
    {
      id: 'cap-react-optimistic', group: 'mutations', type: 'dom', runtime: 'react', lang: 'tsx', level: 3,
      title: 'Крок 6 (React). Оптимістична зміна статусу з точковим відкатом',
      description: `
**Завдання.** Напишіть \`TaskList({ initial, api })\`, де \`api.update(id, patch)\` — метод з частини 1.
- \`<ul aria-label="Задачі">\`; у кожному \`<li>\` — \`<label>\` з \`<input type="checkbox">\` (позначено, якщо \`status === 'done'\`) і назвою;
- клік → статус змінюється **одразу** (\`done\` ↔ \`todo\`), потім \`api.update(id, { status })\`;
- поки запит цієї задачі триває, її чекбокс \`disabled\`;
- успіх → задача замінюється відповіддю сервера; \`<p role="status">Задачу «{назва}» виконано</p>\` (або \`повернуто в роботу\`);
- помилка → відкат статусу **лише цієї** задачі (зміни інших задач лишаються) і \`<p role="alert">Не вдалося оновити «{назва}»: {повідомлення}</p>\`.

**Де трапляється:** галочки в трекерах і списках покупок, лайки, «прочитано» в пошті — інтерфейс реагує миттєво, а мережа наздоганяє. На тестовому завданні це «вау-фактор», якщо зроблено з коректним відкатом.

**Як це працює:** попередній статус запам'ятовується в замиканні обробника, тож при помилці відкочується саме він. Оновлення через функцію (\`setTasks((list) => …)\`) працюють з актуальним списком: якщо за час запиту змінилась інша задача, відкат її не зачепить. Набір id у польоті (\`Set\`) блокує повторний клік, доки не прийде відповідь.

**Аналогія:** \`arch-optimistic-store\` з модуля «Архітектура» — той самий точковий відкат, тепер у компоненті; у React 19 для простих випадків є \`useOptimistic\`.

**Врахуйте:** \`role="status"\` і \`role="alert"\` — окремі елементи: успіх іншої задачі не повинен сховати помилку.
`,
      html: HTML, css: CSS,
      js: `import { useState } from 'react';

` + TYPES + `
export function TaskList({ initial, api }: { initial: Task[]; api: any }) {
  const [tasks, setTasks] = useState(initial);
  // TODO: pending (Set<string> з id у польоті), statusText, alertText

  async function toggle(task: Task) {
    // 1. next = done ↔ todo; одразу змінити статус цієї задачі (setTasks з функцією), додати id у pending
    // 2. try: saved = await api.update(task.id, { status: next }) → замінити задачу на saved, statusText
    // 3. catch: повернути попередній статус лише цієї задачі, alertText
    // 4. finally: прибрати id з pending
    // TODO
  }

  return (
    <ul aria-label="Задачі">
      {tasks.map((t) => (
        <li key={t.id}>
          <label>
            <input type="checkbox" checked={t.status === 'done'} onChange={() => toggle(t)} />
            {t.title}
          </label>
        </li>
      ))}
    </ul>
  );
}
` + DEMO + `
function App() {
  return <TaskList initial={demoTasks} api={demoApi} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState } from 'react';

` + TYPES + `
export function TaskList({ initial, api }: { initial: Task[]; api: Pick<TasksApi, 'update'> }) {
  const [tasks, setTasks] = useState(initial);
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());
  const [statusText, setStatusText] = useState<string | null>(null);
  const [alertText, setAlertText] = useState<string | null>(null);

  function setStatusOf(id: string, status: TaskStatus) {
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  async function toggle(task: Task) {
    const previous = task.status;
    const next: TaskStatus = previous === 'done' ? 'todo' : 'done';
    setStatusOf(task.id, next); // оптимістично — одразу
    setPending((s) => new Set(s).add(task.id));
    try {
      const saved = await api.update(task.id, { status: next });
      setTasks((list) => list.map((t) => (t.id === saved.id ? saved : t)));
      setStatusText('Задачу «' + saved.title + '» ' + (saved.status === 'done' ? 'виконано' : 'повернуто в роботу'));
    } catch (err) {
      setStatusOf(task.id, previous); // відкат лише цієї задачі
      setAlertText('Не вдалося оновити «' + task.title + '»: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setPending((s) => {
        const copy = new Set(s);
        copy.delete(task.id);
        return copy;
      });
    }
  }

  return (
    <div>
      <ul aria-label="Задачі">
        {tasks.map((t) => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={t.status === 'done'} disabled={pending.has(t.id)} onChange={() => toggle(t)} />
              {t.title}
            </label>
          </li>
        ))}
      </ul>
      {statusText && <p role="status">{statusText}</p>}
      {alertText && <p role="alert">{alertText}</p>}
    </div>
  );
}
` + DEMO + `
function App() {
  return <TaskList initial={demoTasks} api={demoApi} />;
}
` },
      typeTests: [
        { name: 'initial — масив Task', code: "const goodUpdate = { update: async (id: string, patch: TaskPatch): Promise<Task> => ({ id, title: 'x', status: patch.status ?? 'todo', assignee: null, updatedAt: '' }) };\nconst okList = <TaskList initial={[]} api={goodUpdate} />;\n// @ts-expect-error — елемент не відповідає Task\nconst badList = <TaskList initial={[{ id: 1 }]} api={goodUpdate} />;" }
      ],
      hints: [
        'Перед оновленням запам\'ятайте `const previous = task.status;` — у `catch` відкотіть саме його: `setTasks((list) => list.map((t) => (t.id === task.id ? { ...t, status: previous } : t)))`.',
        'Id у польоті — `useState<ReadonlySet<string>>(new Set())`; додавати `setPending((s) => new Set(s).add(id))`, прибирати копією з `delete` у `finally`; `disabled={pending.has(t.id)}`.',
        'Успіх і помилка — окремі стани (`statusText`, `alertText`) і окремі елементи з `role="status"` та `role="alert"`.'
      ],
      tests: [
        { name: 'оптимістично: галочка одразу, повторний клік заблоковано', code: T + 'let finish;\nconst api = { update: mockFn((id, patch) => new Promise((r) => { finish = () => r({ ...task(id, "A (сервер)"), status: patch.status }); })) };\nconst m = mount(TaskList, { initial: [task("t1", "A"), task("t2", "B")], api });\nconst box = m.container.querySelectorAll(\'input[type="checkbox"]\')[0];\nawait act(() => click(box));\nexpect(box.checked).toBe(true);\nexpect(box.disabled).toBe(true);\nexpect(api.update).toHaveBeenCalledWith("t1", { status: "done" });\nawait act(async () => { finish(); });\nawait settle(0);\nexpect(box.disabled).toBe(false);\nexpect(m.container.querySelector("li").textContent).toBe("A (сервер)");\nexpect(m.container.querySelector(\'[role="status"]\').textContent).toBe("Задачу «A (сервер)» виконано");\nm.unmount();' },
        { name: 'помилка: відкат лише цієї задачі', code: T + 'const api = { update: mockFn((id, patch) => (id === "t1" ? Promise.reject(new Error("Немає доступу")) : Promise.resolve({ ...task(id, "B"), status: patch.status }))) };\nconst m = mount(TaskList, { initial: [task("t1", "A"), task("t2", "B")], api });\nconst [b1, b2] = m.container.querySelectorAll(\'input[type="checkbox"]\');\nawait act(() => click(b1));\nawait act(() => click(b2));\nawait settle(0);\nexpect(b1.checked).toBe(false);\nexpect(b2.checked).toBe(true);\nexpect(m.container.querySelector(\'[role="alert"]\').textContent).toBe("Не вдалося оновити «A»: Немає доступу");\nexpect(b1.disabled).toBe(false);\nm.unmount();' },
        { name: 'повернення в роботу', code: T + 'const api = { update: mockFn((id, patch) => Promise.resolve({ ...task(id, "Звіт"), status: patch.status })) };\nconst m = mount(TaskList, { initial: [task("t1", "Звіт", "done")], api });\nconst box = m.container.querySelector(\'input[type="checkbox"]\');\nexpect(box.checked).toBe(true);\nawait act(() => click(box));\nawait settle(0);\nexpect(api.update).toHaveBeenCalledWith("t1", { status: "todo" });\nexpect(box.checked).toBe(false);\nexpect(m.container.querySelector(\'[role="status"]\').textContent).toBe("Задачу «Звіт» повернуто в роботу");\nm.unmount();' }
      ],
      explanation: `
Оптимістичне оновлення = змінити UI одразу + запам'ятати, як повернути + звірити з відповіддю сервера. Функціональні оновлення стану й відкат за id роблять його коректним навіть при кількох паралельних запитах.

**Типові помилки:** відкат «знімком» усього списку (губляться інші зміни, що встигли статися); не блокувати повторний клік (два запити з протилежними статусами — гонка); тихий відкат без повідомлення (користувач не розуміє, чому галочка зникла).

**Що спитають далі:** як зробити те саме з \`useOptimistic\` і Actions у React 19; як оновити кеш списків з кроку 3 замість повного перезапиту (\`setQueryData\` у TanStack Query); коли оптимістичне оновлення недоречне (оплата, незворотні дії).
`
    }
  ]
});
})();
