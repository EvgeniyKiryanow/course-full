(function () {
// Фінальний проєкт, частина 1. Код кроків — у константах: кожен наступний крок починається з коду попереднього.
const STEP1 = `export type TaskStatus = 'todo' | 'doing' | 'done';
export const STATUSES: readonly TaskStatus[] = ['todo', 'doing', 'done'];

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: string | null;
  updatedAt: string; // дата ISO
};

export type TaskPage = { items: Task[]; total: number; page: number; pageSize: number };

export class ValidationError extends Error {
  path: string;
  constructor(path: string, reason: string) {
    super(path + ': ' + reason);
    this.name = 'ValidationError';
    this.path = path;
  }
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonNegativeInt(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new ValidationError(path, 'очікувалось ціле число ≥ 0');
  }
  return value;
}

export function parseTask(raw: unknown, path = 'task'): Task {
  if (!isRecord(raw)) throw new ValidationError(path, "очікувався об'єкт");
  const { id, title, status, assignee, updatedAt } = raw;
  if (typeof id !== 'string' || id === '') throw new ValidationError(path + '.id', 'очікувався непорожній рядок');
  if (typeof title !== 'string' || title.trim() === '') throw new ValidationError(path + '.title', 'очікувався непорожній рядок');
  if (!isTaskStatus(status)) throw new ValidationError(path + '.status', 'невідомий статус ' + JSON.stringify(status));
  let owner: string | null = null;
  if (typeof assignee === 'string') owner = assignee;
  else if (assignee !== undefined && assignee !== null) throw new ValidationError(path + '.assignee', 'очікувався рядок або null');
  if (typeof updatedAt !== 'string' || Number.isNaN(Date.parse(updatedAt))) throw new ValidationError(path + '.updatedAt', 'очікувалась дата ISO');
  return { id, title: title.trim(), status, assignee: owner, updatedAt };
}

export function parseTaskPage(raw: unknown): TaskPage {
  if (!isRecord(raw)) throw new ValidationError('page', "очікувався об'єкт");
  if (!Array.isArray(raw.items)) throw new ValidationError('page.items', 'очікувався масив');
  return {
    items: raw.items.map((item, i) => parseTask(item, 'page.items[' + i + ']')),
    total: nonNegativeInt(raw.total, 'page.total'),
    page: nonNegativeInt(raw.page, 'page.page'),
    pageSize: nonNegativeInt(raw.pageSize, 'page.pageSize'),
  };
}
`;

const STEP2 = `// ---- Крок 2: API-клієнт
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export type ListParams = { q?: string; status?: TaskStatus | 'all'; page?: number; signal?: AbortSignal };
export type NewTask = { title: string; assignee?: string | null };
export type TaskPatch = Partial<Pick<Task, 'title' | 'status' | 'assignee'>>;

export function createTasksApi(baseUrl: string) {
  async function request(path: string, init: RequestInit = {}): Promise<unknown> {
    const res = await fetch(baseUrl + path, init); // AbortError і мережеві помилки летять далі як є
    const text = await res.text();
    let body: unknown = null;
    if (text) {
      try { body = JSON.parse(text); } catch { body = text; }
    }
    if (!res.ok) {
      const message = typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string'
        ? body.message
        : 'HTTP ' + res.status;
      throw new ApiError(res.status, message);
    }
    return body;
  }

  function json(method: string, data: unknown): RequestInit {
    return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
  }

  return {
    async list({ q = '', status = 'all', page = 1, signal }: ListParams = {}): Promise<TaskPage> {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (status !== 'all') params.set('status', status);
      params.set('page', String(page));
      return parseTaskPage(await request('/tasks?' + params.toString(), { signal }));
    },
    async create(input: NewTask): Promise<Task> {
      return parseTask(await request('/tasks', json('POST', { title: input.title.trim(), assignee: input.assignee ?? null })));
    },
    async update(id: string, patch: TaskPatch): Promise<Task> {
      return parseTask(await request('/tasks/' + encodeURIComponent(id), json('PATCH', patch)));
    },
  };
}

export type TasksApi = ReturnType<typeof createTasksApi>;
`;

const STEP3 = `// ---- Крок 3: кеш запитів
export function createQueryCache({ staleTime = 30000, now = () => Date.now() }: { staleTime?: number; now?: () => number } = {}) {
  const data = new Map<string, { value: unknown; at: number }>();
  const inflight = new Map<string, Promise<unknown>>();

  function fetchQuery<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const cached = data.get(key);
    if (cached && now() - cached.at < staleTime) return Promise.resolve(cached.value as T);
    const running = inflight.get(key);
    if (running) return running as Promise<T>;
    const promise = loader()
      .then((value) => {
        data.set(key, { value, at: now() });
        return value;
      })
      .finally(() => inflight.delete(key)); // помилка не кешується: наступний виклик спробує знову
    inflight.set(key, promise);
    return promise;
  }

  function peek<T>(key: string): T | undefined {
    return data.get(key)?.value as T | undefined;
  }

  function invalidate(prefix: string): void {
    for (const key of [...data.keys()]) if (key.startsWith(prefix)) data.delete(key);
  }

  return { fetch: fetchQuery, peek, invalidate };
}

export function taskListKey({ q = '', status = 'all', page = 1 }: Omit<ListParams, 'signal'> = {}): string {
  return 'tasks:' + JSON.stringify({ q: q.trim(), status, page });
}
`;

const TASK = '{ id: "t1", title: "Купити домен", status: "todo", assignee: null, updatedAt: "2026-11-18T10:00:00Z" }';

FE.topic('capstone-core', {
  intro: `
## Що будуємо

**Дошку задач команди** — типове тестове завдання (take-home), яке дають на Middle/Strong Middle: список задач з пошуком і фільтром статусу, створення задачі через форму, зміна статусу одним кліком. Частина 1 — шар даних на TypeScript, частина 2 — інтерфейс на **вашому основному фреймворку** (React або Vue), частина 3 — здача і захист.

## Контракт API

| Запит | Відповідь |
|---|---|
| \`GET /tasks?q=&status=&page=\` | \`{ items: Task[], total, page, pageSize }\` |
| \`POST /tasks\` \`{ title, assignee }\` | \`Task\` |
| \`PATCH /tasks/:id\` \`{ title?, status?, assignee? }\` | \`Task\` |
| помилка 4xx/5xx | \`{ message }\` |

\`Task\` = \`{ id, title, status: 'todo' | 'doing' | 'done', assignee: string | null, updatedAt }\`.

## Архітектура

\`\`\`
UI (React / Vue) ──▶ кеш запитів ──▶ API-клієнт ──▶ fetch
       ▲                                   │
       └──── типізовані дані ◀── парсер ◀──┘
\`\`\`

- **Межа довіри — відповідь сервера.** Дані ззовні перевіряє парсер; усередині застосунку типи вже правдиві, без \`as\` і \`any\`.
- **UI не знає про \`fetch\`.** Компоненти отримують \`api\` пропом — тому їх легко тестувати з фейковим API (dependency injection з модуля «Патерни»).
- **Помилки — типізовані:** \`ApiError\` (сервер відповів помилкою), \`ValidationError\` (сервер відповів не те), \`AbortError\` (запит скасовано — не помилка для користувача).

## Що звідки

Звуження типів і type guards — модуль «TS: практика»; \`fetch\`, \`AbortController\` — «Browser API»; кеш і дедуплікація — «Асинхронність» і «Екосистема React/Vue»; debounce і гонки відповідей — «React: хуки» / «Vue: Composition API».
`,
  groups: [
    { id: 'data', title: 'Типи й перевірка даних з API' },
    { id: 'api', title: 'API-клієнт і кеш запитів' }
  ],
  items: [
    {
      id: 'cap-quiz-as-cast', group: 'data', type: 'quiz', level: 2,
      title: 'Чому «as Task» для відповіді сервера — це баг',
      question: `
Розробник типізує відповідь так:
\`\`\`ts
const res = await fetch('/api/tasks/t1');
const task = (await res.json()) as Task;
render(task.title.toUpperCase());
\`\`\`
Сервер після релізу бекенду почав повертати \`{ id, name, status }\` замість \`{ id, title, status }\`. Що станеться?`,
      options: [
        'Код скомпілюється, а в рантаймі впаде з `TypeError` на `task.title.toUpperCase()`',
        'TypeScript повідомить про невідповідність під час компіляції',
        '`as Task` перевірить об\'єкт у рантаймі й кине помилку з назвою поля',
        'Нічого: `title` стане порожнім рядком'
      ],
      answer: 0,
      why: [
        'Так: `as` лише каже компілятору «повір мені»; у рантаймі типів немає, і `undefined.toUpperCase()` кидає `TypeError` далеко від місця, де дані прийшли.',
        'Ні: компілятор не знає, що поверне сервер: `res.json()` має тип `any`, а `as` приймає будь-що.',
        'Ні: типи стираються при компіляції — `as` не генерує жодного коду перевірки.',
        'Ні: відсутнє поле — це `undefined`, а не порожній рядок.'
      ],
      hint: 'Що лишається від `as Task` після компіляції в JavaScript?',
      explanation: 'Дані ззовні (API, `localStorage`, `postMessage`) — межа довіри. На ній потрібна **перевірка в рантаймі**: парсер, що або повертає правдивий `Task`, або кидає помилку з точним шляхом (`task.title: очікувався рядок`). Тоді збій видно одразу на межі, а не в глибині UI. У реальних проєктах такі парсери пишуть на Zod, Valibot чи ArkType — наступний крок робить те саме вручну.'
    },
    {
      id: 'cap-parse-task', group: 'data', type: 'code', runtime: 'ts', level: 3,
      title: 'Крок 1. Типи задачі і парсер відповіді без any',
      description: `
**Завдання.** Опишіть типи даних дошки і напишіть парсер, який перетворює \`unknown\` з API на правдивий \`Task\` або кидає \`ValidationError\` з точним шляхом до поля.

**Де трапляється:** перший шар будь-якого застосунку з API і перше, на що дивиться рев'юер тестового завдання: чи довіряє код серверу наосліп. У проєктах ту саму роль виконують схеми Zod (\`TaskSchema.parse(json)\`).

**Що написати**
- \`type TaskStatus\` = \`'todo' | 'doing' | 'done'\`; \`type Task\` = \`{ id: string; title: string; status: TaskStatus; assignee: string | null; updatedAt: string }\`;
- \`isTaskStatus(value: unknown): value is TaskStatus\`;
- \`parseTask(raw: unknown, path = 'task'): Task\`:
  - не об'єкт → \`ValidationError(path, …)\`;
  - \`id\` — непорожній рядок; \`title\` — рядок, непорожній після \`trim\` (у результат — обрізаний);
  - \`status\` — один із трьох; \`assignee\` — рядок, \`null\` або відсутній (→ \`null\`);
  - \`updatedAt\` — рядок, який розбирає \`Date.parse\`;
  - шлях помилки — \`path + '.поле'\`: \`task.status: невідомий статус "archived"\`;
- \`parseTaskPage(raw: unknown): TaskPage\` — \`items\` (масив, кожен елемент через \`parseTask\` зі шляхом \`page.items[i]\`), \`total\`, \`page\`, \`pageSize\` — цілі ≥ 0;
- клас \`ValidationError\` (з полем \`path\`) уже є.

**Приклад**
\`\`\`ts
parseTask({ id: 't1', title: '  Купити домен ', status: 'todo', updatedAt: '2026-11-18T10:00:00Z' });
// { id: 't1', title: 'Купити домен', status: 'todo', assignee: null, updatedAt: '2026-11-18T10:00:00Z' }
parseTask({ id: 't1', title: 'x', status: 'archived', updatedAt: '…' });
// ValidationError: task.status: невідомий статус "archived"
\`\`\`

**Як це працює:** параметр типу \`unknown\` змушує перевірити все, перш ніж користуватися: \`typeof\`, \`Array.isArray\` і власні type guards звужують тип крок за кроком, і наприкінці TS сам бачить, що об'єкт відповідає \`Task\` — без \`as\`. Шлях у помилці (\`page.items[3].status\`) за секунди показує, яке поле зламав бекенд.

**Врахуйте:** \`typeof null === 'object'\` і масив теж «object» — перевіряйте обидва випадки; \`Number.isInteger\` для лічильників.
`,
      starter: `// TODO: 'todo' | 'doing' | 'done'
export type TaskStatus = string;
export const STATUSES = ['todo', 'doing', 'done'];

// TODO: id, title, status, assignee (string | null), updatedAt (рядок ISO)
export type Task = any;

export type TaskPage = { items: Task[]; total: number; page: number; pageSize: number };

export class ValidationError extends Error {
  path: string;
  constructor(path: string, reason: string) {
    super(path + ': ' + reason);
    this.name = 'ValidationError';
    this.path = path;
  }
}

export function isTaskStatus(value: unknown): boolean {
  // TODO: зробіть type guard: value is TaskStatus
  return false;
}

export function parseTask(raw: unknown, path = 'task'): Task {
  // 1. Не об'єкт (або null, або масив) → throw new ValidationError(path, "очікувався об'єкт")
  // 2. Перевірте id, title, status, assignee, updatedAt; шлях помилки — path + '.поле'
  // 3. Поверніть новий об'єкт: title обрізаний, assignee — рядок або null
  // TODO
}

export function parseTaskPage(raw: unknown): TaskPage {
  // items — масив (кожен через parseTask зі шляхом 'page.items[' + i + ']'); total, page, pageSize — цілі ≥ 0
  // TODO
  return { items: [], total: 0, page: 0, pageSize: 0 };
}
`,
      solution: STEP1,
      typeTests: [
        { name: 'Task має точну форму', code: 'type T1 = Expect<Equal<Task, { id: string; title: string; status: TaskStatus; assignee: string | null; updatedAt: string }>>;' },
        { name: 'неіснуючий статус не компілюється', code: "// @ts-expect-error — такого статусу немає\nconst bad: TaskStatus = 'archived';" },
        { name: 'isTaskStatus звужує тип', code: "const input: unknown = 'todo';\nif (isTaskStatus(input)) {\n  const narrowed: TaskStatus = input;\n}\ntype T2 = Expect<Equal<ReturnType<typeof parseTaskPage>, TaskPage>>;" }
      ],
      hints: [
        'Почніть з допоміжного guard: `function isRecord(v: unknown): v is Record<string, unknown>` — `typeof v === \'object\' && v !== null && !Array.isArray(v)`. Після нього поля читаються як `unknown`.',
        'Кожне поле — окрема перевірка з `throw new ValidationError(path + \'.title\', …)`. Для `assignee` зручно: `let owner: string | null = null; if (typeof assignee === \'string\') owner = assignee; else if (assignee !== undefined && assignee !== null) throw …`.',
        '`parseTaskPage`: `raw.items.map((item, i) => parseTask(item, \'page.items[\' + i + \']\'))` і хелпер для цілих ≥ 0 через `Number.isInteger`.'
      ],
      tests: [
        { name: 'коректна задача: title обрізається, assignee → null', code: 'expect(parseTask({ id: "t1", title: "  Купити домен ", status: "todo", updatedAt: "2026-11-18T10:00:00Z" })).toEqual(' + TASK + ');\nexpect(parseTask({ id: "t2", title: "B", status: "done", assignee: "ann", updatedAt: "2026-11-18" }).assignee).toBe("ann");' },
        { name: 'помилки з точним шляхом', code: 'expect(() => parseTask(null)).toThrow("task: очікувався об\'єкт");\nexpect(() => parseTask([])).toThrow("task: очікувався об\'єкт");\nexpect(() => parseTask({ id: "", title: "x", status: "todo", updatedAt: "2026-11-18" })).toThrow("task.id");\nexpect(() => parseTask({ id: "t", title: "   ", status: "todo", updatedAt: "2026-11-18" })).toThrow("task.title");\nexpect(() => parseTask({ id: "t", title: "x", status: "archived", updatedAt: "2026-11-18" })).toThrow(\'task.status: невідомий статус "archived"\');\nexpect(() => parseTask({ id: "t", title: "x", status: "todo", assignee: 5, updatedAt: "2026-11-18" })).toThrow("task.assignee");\nexpect(() => parseTask({ id: "t", title: "x", status: "todo", updatedAt: "вчора" })).toThrow("task.updatedAt");' },
        { name: 'ValidationError з полем path', code: 'let err = null;\ntry { parseTask({ id: "t", title: "x", status: "nope", updatedAt: "2026-11-18" }, "item"); } catch (e) { err = e; }\nexpect(err instanceof ValidationError).toBe(true);\nexpect(err.path).toBe("item.status");' },
        { name: 'сторінка: шлях до зламаного елемента', code: 'const ok = { items: [' + TASK + '], total: 1, page: 1, pageSize: 20 };\nexpect(parseTaskPage(ok).items[0].id).toBe("t1");\nexpect(() => parseTaskPage({ ...ok, items: [' + TASK + ', { ...' + TASK + ', status: "x" }] })).toThrow("page.items[1].status");\nexpect(() => parseTaskPage({ ...ok, items: null })).toThrow("page.items");\nexpect(() => parseTaskPage({ ...ok, total: -1 })).toThrow("page.total");\nexpect(() => parseTaskPage({ ...ok, page: 1.5 })).toThrow("page.page");' },
        { name: 'isTaskStatus', code: 'expect(isTaskStatus("doing")).toBe(true);\nexpect(isTaskStatus("DONE")).toBe(false);\nexpect(isTaskStatus(1)).toBe(false);' }
      ],
      explanation: `
Парсер на межі довіри — найкорисніший код у застосунку з API: якщо бекенд зламав контракт, ви бачите \`page.items[3].status: невідомий статус "blocked"\` у моніторингу, а не «білий екран» десь у компоненті. Тип \`unknown\` гарантує, що жодне поле не використано без перевірки.

**Типові помилки:** \`as Task\` замість перевірки; \`typeof raw === 'object'\` без перевірки \`null\` і масиву; повертати сам \`raw\` (у результат потрапляють зайві поля і необрізаний \`title\`).

**Що спитають далі:** чим ваш парсер відрізняється від Zod (\`z.infer\` виводить тип зі схеми — одне джерело правди); що робити з невідомим статусом: падати чи показувати «невідомо» (компроміс між строгістю і стійкістю); як генерувати типи з OpenAPI.
`
    },
    {
      id: 'cap-api-client', group: 'api', type: 'code', runtime: 'ts', level: 3,
      title: 'Крок 2. API-клієнт: запити, ApiError і скасування',
      description: `
**Завдання.** Напишіть \`createTasksApi(baseUrl)\` — тонкий клієнт над \`fetch\` для контракту з шпаргалки модуля. Код кроку 1 уже у файлі.

**Де трапляється:** у кожному проєкті є шар \`api/\`: компоненти викликають \`api.list(...)\`, а не \`fetch\` напряму. Так URL, заголовки, помилки й перевірка даних живуть в одному місці, а інтерфейс легко тестувати з фейковим API.

**Що написати**
- клас \`ApiError extends Error\` з полем \`status\`;
- \`createTasksApi(baseUrl)\` → \`{ list, create, update }\`:
  - \`list({ q = '', status = 'all', page = 1, signal } = {})\` → \`GET baseUrl + '/tasks?' + параметри\` через \`URLSearchParams\`: \`q\` (обрізаний; порожній — не додавати), \`status\` (не додавати для \`'all'\`), \`page\` — завжди; \`signal\` передати у \`fetch\`; відповідь — через \`parseTaskPage\`;
  - \`create({ title, assignee })\` → \`POST /tasks\` з JSON \`{ title: обрізаний, assignee: assignee ?? null }\` і заголовком \`Content-Type: application/json\`; відповідь — через \`parseTask\`;
  - \`update(id, patch)\` → \`PATCH /tasks/<id>\` (id через \`encodeURIComponent\`), тіло — \`patch\`; відповідь — через \`parseTask\`;
- відповідь не \`ok\` → \`ApiError(status, message)\`, де \`message\` — поле \`message\` з JSON-тіла, а якщо його немає — \`'HTTP <status>'\`;
- \`AbortError\` і мережеві помилки \`fetch\` — пробрасувати як є;
- \`type TasksApi = ReturnType<typeof createTasksApi>\`.

**Приклад**
\`\`\`ts
const api = createTasksApi('https://api.example.com');
await api.list({ q: ' bug fix ', status: 'todo', page: 2 });
// GET https://api.example.com/tasks?q=bug+fix&status=todo&page=2
await api.update('t1', { status: 'done' });   // PATCH /tasks/t1  {"status":"done"}
await api.create({ title: 'a' });              // 422 { message: 'Назва занадто коротка' } → ApiError(422, 'Назва занадто коротка')
\`\`\`

**Як це працює:** \`fetch\` відхиляє проміс лише при мережевій помилці чи скасуванні, а 404 і 500 — це «успішні» відповіді з \`ok: false\` (модуль «Browser API»). Тому клієнт сам перетворює їх на \`ApiError\`, а дані з тіла проганяє через парсер — і вище по стеку приходить або правдивий \`Task\`, або типізована помилка. \`URLSearchParams\` сам кодує спецсимволи (пробіл → \`+\`).

**Врахуйте:** тіло помилки може бути порожнім чи не JSON — читайте \`res.text()\` і пробуйте \`JSON.parse\`; \`TaskPatch\` не дозволяє змінювати \`id\` чи \`updatedAt\` (перевіряє компілятор).
`,
      starter: STEP1 + `
// ---- Крок 2: API-клієнт
export class ApiError extends Error {
  // TODO: поле status: number; name = 'ApiError'
}

export type ListParams = { q?: string; status?: TaskStatus | 'all'; page?: number; signal?: AbortSignal };
export type NewTask = { title: string; assignee?: string | null };
export type TaskPatch = Partial<Pick<Task, 'title' | 'status' | 'assignee'>>;

export function createTasksApi(baseUrl: string) {
  // 1. request(path, init): fetch → res.text() → JSON.parse (якщо можна);
  //    !res.ok → throw new ApiError(res.status, message з тіла або 'HTTP ' + status)
  // 2. list: URLSearchParams (q, status, page) + { signal } → parseTaskPage
  // 3. create: POST JSON → parseTask;  update: PATCH JSON → parseTask
  // TODO
  return {
    async list(params: ListParams = {}): Promise<TaskPage> { throw new Error('TODO'); },
    async create(input: NewTask): Promise<Task> { throw new Error('TODO'); },
    async update(id: string, patch: TaskPatch): Promise<Task> { throw new Error('TODO'); },
  };
}

export type TasksApi = ReturnType<typeof createTasksApi>;
`,
      solution: STEP1 + '\n' + STEP2,
      typeTests: [
        { name: 'list повертає TaskPage', code: "type L = Expect<Equal<Awaited<ReturnType<TasksApi['list']>>, TaskPage>>;" },
        { name: 'неіснуючий статус у patch не компілюється', code: "// @ts-expect-error — такого статусу немає\ncreateTasksApi('/api').update('t1', { status: 'archived' });" },
        { name: 'id і updatedAt змінювати не можна', code: "// @ts-expect-error — id не входить у TaskPatch\ncreateTasksApi('/api').update('t1', { id: 'x' });" }
      ],
      hints: [
        'Спільна функція `request(path, init)`: `const res = await fetch(baseUrl + path, init)`, далі `res.text()`, `JSON.parse` у `try/catch`, і перевірка `res.ok`.',
        'Повідомлення помилки: `typeof body === \'object\' && body !== null && \'message\' in body && typeof body.message === \'string\' ? body.message : \'HTTP \' + res.status`.',
        '`list`: `const params = new URLSearchParams(); if (q.trim()) params.set(\'q\', q.trim()); …; params.set(\'page\', String(page))`, а тоді `request(\'/tasks?\' + params.toString(), { signal })`.'
      ],
      tests: [
        { name: 'list: URL з параметрами і розбір відповіді', code: 'const f = mockFetch(() => ({ status: 200, body: { items: [' + TASK + '], total: 1, page: 2, pageSize: 20 } }));\nconst api = createTasksApi("https://api.test");\nconst page = await api.list({ q: "  bug fix ", status: "todo", page: 2 });\nexpect(f.mock.calls[0][0]).toBe("https://api.test/tasks?q=bug+fix&status=todo&page=2");\nexpect(page.items[0].title).toBe("Купити домен");\nawait api.list();\nexpect(f.mock.calls[1][0]).toBe("https://api.test/tasks?page=1");' },
        { name: 'create і update: метод, заголовки, тіло', code: 'const f = mockFetch((url, init) => ({ status: 200, body: { id: "t9", title: JSON.parse(init.body).title || "X", status: "doing", assignee: null, updatedAt: "2026-11-18T10:00:00Z" } }));\nconst api = createTasksApi("/api");\nconst created = await api.create({ title: "  Нова  " });\nconst [url, init] = f.mock.calls[0];\nexpect(url).toBe("/api/tasks");\nexpect(init.method).toBe("POST");\nexpect(init.headers["Content-Type"]).toBe("application/json");\nexpect(JSON.parse(init.body)).toEqual({ title: "Нова", assignee: null });\nexpect(created.id).toBe("t9");\nawait api.update("a/b", { status: "done" });\nexpect(f.mock.calls[1][0]).toBe("/api/tasks/a%2Fb");\nexpect(f.mock.calls[1][1].method).toBe("PATCH");\nexpect(JSON.parse(f.mock.calls[1][1].body)).toEqual({ status: "done" });' },
        { name: 'HTTP-помилки → ApiError', code: 'mockFetch(() => ({ status: 422, body: { message: "Назва занадто коротка" } }));\nconst api = createTasksApi("/api");\nlet err = null;\ntry { await api.create({ title: "a" }); } catch (e) { err = e; }\nexpect(err instanceof ApiError).toBe(true);\nexpect(err.status).toBe(422);\nexpect(err.message).toBe("Назва занадто коротка");\nmockFetch(() => ({ status: 503, body: "" }));\nawait expect(api.list()).rejects.toThrow("HTTP 503");\nmockFetch(() => ({ status: 500, body: "<html>Bad gateway</html>" }));\nawait expect(api.list()).rejects.toThrow("HTTP 500");' },
        { name: 'некоректні дані → ValidationError', code: 'mockFetch(() => ({ status: 200, body: { items: [{ id: 1 }], total: 1, page: 1, pageSize: 20 } }));\nconst api = createTasksApi("/api");\nlet err = null;\ntry { await api.list(); } catch (e) { err = e; }\nexpect(err instanceof ValidationError).toBe(true);\nexpect(err.path).toBe("page.items[0].id");' },
        { name: 'скасування: signal передається, AbortError не перетворюється', code: 'const f = mockFetch(() => ({ status: 200, body: { items: [], total: 0, page: 1, pageSize: 20 }, delay: 50 }));\nconst api = createTasksApi("/api");\nconst ctrl = new AbortController();\nconst p = api.list({ signal: ctrl.signal });\nctrl.abort();\nlet err = null;\ntry { await p; } catch (e) { err = e; }\nexpect(err.name).toBe("AbortError");\nexpect(f.mock.calls[0][1].signal).toBe(ctrl.signal);' }
      ],
      explanation: `
Клієнт перетворює «сирий» \`fetch\` на функції предметної області з трьома видами результату: правдиві дані, \`ApiError\` (сервер сказав «ні» — показати повідомлення), \`ValidationError\` (сервер відповів не за контрактом — звіт у моніторинг), а \`AbortError\` інтерфейс просто ігнорує.

**Типові помилки:** вважати, що \`fetch\` відхиляє проміс на 500; \`res.json()\` для тіла помилки без \`try\` (HTML від проксі ламає обробку); склеювати query-рядок вручну без кодування; огортати \`AbortError\` в \`ApiError\` (UI покаже «помилку» на звичайне скасування).

**Що спитають далі:** де додати токен авторизації і повтор після 401 (refresh token); як робити ретраї з backoff лише для ідемпотентних методів (модуль «Мережа»); як згенерувати такий клієнт з OpenAPI.
`
    },
    {
      id: 'cap-query-cache', group: 'api', type: 'code', runtime: 'ts', level: 3,
      title: 'Крок 3. Кеш запитів: свіжість, дедуплікація, інвалідація',
      description: `
**Завдання.** Напишіть \`createQueryCache\` — маленький кеш серверних даних між інтерфейсом і API-клієнтом, і \`taskListKey\` — ключ кешу для параметрів списку. Код кроків 1–2 уже у файлі.

**Де трапляється:** повернення на дошку не має показувати спінер і робити той самий запит; два компоненти, що одночасно просять той самий список, — один запит; після створення задачі списки мають оновитися. Це ядро TanStack Query, SWR і RTK Query — і часте питання «як би ви кешували дані» на тестовому завданні.

**Що написати**
- \`createQueryCache({ staleTime = 30000, now = () => Date.now() } = {})\` → \`{ fetch, peek, invalidate }\`:
  - \`fetch<T>(key, loader: () => Promise<T>): Promise<T>\`: свіжі дані (вік < \`staleTime\`) → без виклику \`loader\`; той самий ключ уже завантажується → **той самий** проміс; інакше викликати \`loader\` і зберегти результат з часом \`now()\`; помилки не кешуються;
  - \`peek<T>(key)\` → збережені дані або \`undefined\` (щоб показати старий список, поки йде новий запит);
  - \`invalidate(prefix)\` → видалити дані всіх ключів, що починаються з \`prefix\`;
- \`taskListKey({ q, status, page })\` → рядок \`'tasks:' + JSON.stringify({ q: обрізаний, status, page })\` з тими самими значеннями за замовчуванням, що в \`list\` (\`''\`, \`'all'\`, \`1\`); \`signal\` у ключ не входить.

**Приклад**
\`\`\`ts
const cache = createQueryCache({ staleTime: 30_000 });
const key = taskListKey({ q: 'bug ' });                  // 'tasks:{"q":"bug","status":"all","page":1}'
await cache.fetch(key, () => api.list({ q: 'bug' }));    // запит
await cache.fetch(key, () => api.list({ q: 'bug' }));    // з кешу, без запиту
cache.invalidate('tasks:');                              // після створення задачі — усі списки застаріли
\`\`\`

**Як це працює:** дві \`Map\`: готові дані з часом збереження і проміси «у польоті». Свіжість — порівняння часу; дедуплікація — повернення вже створеного промісу (як \`memoizeAsync\` у модулі «Асинхронність»); інвалідація за префіксом працює, бо ключі мають спільний початок \`tasks:\`. \`now\` передається параметром, щоб час у тестах керувався вручну.

**Врахуйте:** однакові параметри мають давати однаковий ключ (\`{ q: ' bug' }\` і \`{ q: 'bug', page: 1 }\`); після помилки наступний \`fetch\` знову викликає \`loader\`.
`,
      starter: STEP1 + '\n' + STEP2 + `
// ---- Крок 3: кеш запитів
export function createQueryCache({ staleTime = 30000, now = () => Date.now() }: { staleTime?: number; now?: () => number } = {}) {
  const data = new Map<string, { value: unknown; at: number }>();
  const inflight = new Map<string, Promise<unknown>>();

  function fetchQuery<T>(key: string, loader: () => Promise<T>): Promise<T> {
    // 1. Свіжі дані (now() - at < staleTime) → Promise.resolve(value)
    // 2. Є проміс у польоті → повернути його
    // 3. Інакше loader(): успіх → зберегти { value, at: now() }; finally → прибрати з inflight
    // TODO
    return loader();
  }

  function peek<T>(key: string): T | undefined {
    // TODO
    return undefined;
  }

  function invalidate(prefix: string): void {
    // TODO: видалити дані всіх ключів, що починаються з prefix
  }

  return { fetch: fetchQuery, peek, invalidate };
}

export function taskListKey(params: Omit<ListParams, 'signal'> = {}): string {
  // TODO: 'tasks:' + JSON.stringify({ q: обрізаний, status, page }) зі значеннями за замовчуванням
  return 'tasks:' + JSON.stringify(params);
}
`,
      solution: STEP1 + '\n' + STEP2 + '\n' + STEP3,
      typeTests: [
        { name: 'тип даних виводиться з loader', code: "const c1 = createQueryCache();\nconst p1 = c1.fetch('k', async () => 42);\ntype P1 = Expect<Equal<typeof p1, Promise<number>>>;" },
        { name: 'loader має повертати проміс', code: "// @ts-expect-error — loader повертає число, а не проміс\ncreateQueryCache().fetch('k', () => 42);" },
        { name: 'ключ — рядок, signal у параметрах ключа не потрібен', code: "type K1 = Expect<Equal<ReturnType<typeof taskListKey>, string>>;\n// @ts-expect-error — signal не частина ключа\ntaskListKey({ signal: new AbortController().signal });" }
      ],
      hints: [
        '`const cached = data.get(key); if (cached && now() - cached.at < staleTime) return Promise.resolve(cached.value as T);`',
        'Дедуплікація: `const running = inflight.get(key); if (running) return running as Promise<T>;` Новий запит: `loader().then(зберегти і повернути).finally(() => inflight.delete(key))`, і цей проміс покласти в `inflight` до повернення.',
        '`invalidate`: `for (const key of [...data.keys()]) if (key.startsWith(prefix)) data.delete(key);` Ключ: деструктуризація з дефолтами `{ q = \'\', status = \'all\', page = 1 }`.'
      ],
      tests: [
        { name: 'свіжі дані — без повторного запиту, застарілі — новий запит', code: 'let t = 0;\nconst cache = createQueryCache({ staleTime: 1000, now: () => t });\nconst loader = mockFn(() => Promise.resolve([1]));\nawait cache.fetch("a", loader);\nt = 999;\nexpect(await cache.fetch("a", loader)).toEqual([1]);\nexpect(loader).toHaveBeenCalledTimes(1);\nt = 1000;\nawait cache.fetch("a", loader);\nexpect(loader).toHaveBeenCalledTimes(2);' },
        { name: 'дедуплікація: той самий проміс', code: 'const cache = createQueryCache();\nconst loader = mockFn(() => new Promise((r) => setTimeout(() => r("ok"), 20)));\nconst p1 = cache.fetch("a", loader);\nconst p2 = cache.fetch("a", loader);\nexpect(p2).toBe(p1);\nexpect(await p2).toBe("ok");\nexpect(loader).toHaveBeenCalledTimes(1);' },
        { name: 'помилки не кешуються', code: 'const cache = createQueryCache();\nlet n = 0;\nconst loader = () => (++n === 1 ? Promise.reject(new Error("500")) : Promise.resolve("ok"));\nawait expect(cache.fetch("a", loader)).rejects.toThrow("500");\nexpect(cache.peek("a")).toBe(undefined);\nexpect(await cache.fetch("a", loader)).toBe("ok");' },
        { name: 'peek та invalidate за префіксом', code: 'const cache = createQueryCache();\nawait cache.fetch("tasks:1", () => Promise.resolve("A"));\nawait cache.fetch("tasks:2", () => Promise.resolve("B"));\nawait cache.fetch("user:1", () => Promise.resolve("U"));\nexpect(cache.peek("tasks:1")).toBe("A");\ncache.invalidate("tasks:");\nexpect(cache.peek("tasks:1")).toBe(undefined);\nexpect(cache.peek("tasks:2")).toBe(undefined);\nexpect(cache.peek("user:1")).toBe("U");\nconst loader = mockFn(() => Promise.resolve("A2"));\nexpect(await cache.fetch("tasks:1", loader)).toBe("A2");\nexpect(loader).toHaveBeenCalledTimes(1);' },
        { name: 'taskListKey нормалізує параметри', code: 'expect(taskListKey()).toBe(\'tasks:{"q":"","status":"all","page":1}\');\nexpect(taskListKey({ q: "  " })).toBe(taskListKey({ status: "all", page: 1 }));\nexpect(taskListKey({ q: "bug " })).toBe(taskListKey({ q: "bug", page: 1 }));\nexpect(taskListKey({ status: "todo" })).not.toBe(taskListKey({}));' }
      ],
      explanation: `
Кеш розділяє дві речі: **дані** (з часом свіжості) і **запити в польоті** (для дедуплікації). Ключ — серіалізовані нормалізовані параметри, тому еквівалентні запити поділяють запис, а префікс дозволяє інвалідувати цілу групу.

**Типові помилки:** кешувати проміс разом із помилкою (одна невдача «назавжди»); ключ \`JSON.stringify(params)\` без нормалізації (\`{ q: 'a' }\` і \`{ q: 'a', page: 1 }\` — різні записи); не прибирати проміс з \`inflight\` після завершення.

**Що спитають далі:** stale-while-revalidate — показати старі дані й тихо оновити; збирання сміття для давно невикористаних ключів (\`gcTime\` у TanStack Query); оптимістичне оновлення кешу після мутації замість повного перезапиту.
`
    }
  ]
});
})();
