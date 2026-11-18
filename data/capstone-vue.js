(function () {
// Фінальний проєкт, частина 2 (Vue 3 + TypeScript). Типи — з частини 1; компоненти отримують api пропом.
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
type TaskPatch = Partial<Pick<Task, 'title' | 'status' | 'assignee'>>;`;

// Демо-дані для перегляду (у тестах — фейкові api з mockFn).
const DEMO = `const demoTasks = [
  { id: 't1', title: 'Купити домен', status: 'todo', assignee: null, updatedAt: '2026-11-18T10:00:00Z' },
  { id: 't2', title: 'Налаштувати CI', status: 'doing', assignee: 'ann', updatedAt: '2026-11-18T10:00:00Z' },
  { id: 't3', title: 'Оновити README', status: 'done', assignee: null, updatedAt: '2026-11-18T10:00:00Z' },
];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const demoApi = {
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
};`;

const T = 'const task = (id, title, status = "todo") => ({ id, title, status, assignee: null, updatedAt: "2026-11-18T10:00:00Z" });\nconst page = (items) => ({ items, total: items.length, page: 1, pageSize: 20 });\nconst texts = (m, s) => [...m.container.querySelectorAll(s)].map((el) => el.textContent.trim());\n';

const BOARD_TEMPLATE = `<template>
  <section>
    <input v-model="query" type="search" aria-label="Пошук задач">
    <select v-model="status" aria-label="Статус">
      <option v-for="(label, value) in LABELS" :key="value" :value="value">{{ label }}</option>
    </select>
    <p v-if="state.status === 'loading'" role="status">Завантаження…</p>
    <div v-else-if="state.status === 'error'">
      <p role="alert">Не вдалося завантажити: {{ state.error }}</p>
      <button @click="attempt++">Спробувати ще</button>
    </div>
    <p v-else-if="state.data.items.length === 0">Нічого не знайдено</p>
    <template v-else>
      <p class="total">Знайдено: {{ state.data.total }}</p>
      <ul aria-label="Задачі">
        <li v-for="t in state.data.items" :key="t.id">{{ t.title }}</li>
      </ul>
    </template>
  </section>
</template>`;

FE.topic('capstone-vue', {
  intro: `
## Частина 2 на Vue

Інтерфейс дошки поверх шару з частини 1. Компоненти отримують \`api\` пропом (той самий контракт, що повертає \`createTasksApi\`), тож тести підставляють фейкове API, а перегляд — демо-API із затримкою.

| Крок | Що тренує |
|---|---|
| Дошка | composable з debounce в окремому \`.ts\`-файлі, \`watch\` з \`immediate\`, скасування через \`onWatcherCleanup\`, стани й повтор |
| Форма | \`v-model\`, валідація, \`aria-invalid\` + \`aria-describedby\`, template ref і фокус, стан відправки |
| Оптимістичне оновлення | миттєвий UI, точковий відкат, реактивний \`Set\` для запитів у польоті |

Скрипти — \`<script setup lang="ts">\`: справжній \`tsc --strict\` з типами Vue 3 перевіряє пропи, ref-и й composables (шаблони в реальних проєктах перевіряє \`vue-tsc\`).
`,
  groups: [
    { id: 'board', title: 'Vue: дошка, debounce і скасування запитів' },
    { id: 'mutations', title: 'Vue: форма й оптимістичні оновлення' }
  ],
  items: [
    {
      id: 'cap-vue-quiz-cleanup', group: 'board', type: 'quiz', level: 3,
      title: 'onWatcherCleanup і застарілий запит',
      question: `
\`\`\`ts
watch(query, async (q) => {
  const controller = new AbortController();
  onWatcherCleanup(() => controller.abort());
  results.value = await search(q, controller.signal);
});
\`\`\`
\`query\` змінилося з «b» на «c», поки запит для «b» ще в дорозі. Що станеться?`,
      options: [
        'Cleanup скасує запит для «b», його `await` кине `AbortError`, і Vue передасть її в `app.config.errorHandler`',
        'Обидва запити завершаться, а в `results` опиниться відповідь, що прийшла останньою, — можливо, для «b»',
        'Cleanup спрацює лише при розмонтуванні компонента, тож запит для «b» дійде до кінця і перезапише `results`',
        'Vue сам перериває `fetch` усередині колбека watch, тож `AbortController` тут нічого не змінює'
      ],
      answer: 0,
      why: [
        'Так: перед повторним запуском колбека Vue викликає зареєстрований cleanup; відхилений проміс async-колбека йде в обробник помилок Vue — тому `AbortError` варто перехопити.',
        'Ні: так було б без cleanup; тут перед запуском колбека для «c» запит для «b» скасовується.',
        'Ні: cleanup викликається і перед кожним повторним запуском, і при зупинці спостерігача (зокрема при розмонтуванні).',
        'Ні: Vue нічого не знає про ваші запити — скасовує їх лише ваш `AbortController`.'
      ],
      hint: 'Коли Vue викликає функцію, зареєстровану через `onWatcherCleanup`? І куди дівається помилка з async-колбека?',
      explanation: 'Перевірено у Vue 3.5: журнал `cleanup b | done c`, а `AbortError` приходить в `app.config.errorHandler` з позначкою «watcher callback»; при розмонтуванні cleanup викликається ще раз. Тому в реальному коді або `try { … } catch (e) { if (e.name !== \'AbortError\') throw e; }`, або `.then(onOk, onErr)` з перевіркою `signal.aborted`, як у наступній задачі. `onWatcherCleanup` треба викликати **до** першого `await` — після нього Vue вже не знає, якому спостерігачу належить виклик.'
    },
    {
      id: 'cap-vue-board', group: 'board', type: 'dom', runtime: 'vue', level: 3,
      title: 'Крок 4 (Vue). Дошка: composable з debounce, скасування і повтор',
      description: `
**Завдання.** Напишіть composable \`useDebouncedRef\` у файлі \`useDebounced.ts\` і компонент \`TaskBoard.vue\` з пропами \`api\` (метод \`list\` з частини 1) і \`delay\` (за замовчуванням 300).
- \`useDebouncedRef<T>(source: Ref<T>, delay: number): Ref<T>\` — значення, що оновлюється через \`delay\` мс після останньої зміни \`source\`; таймер прибирається при знищенні області (\`onScopeDispose\`);
- \`<input type="search" aria-label="Пошук задач">\` і \`<select aria-label="Статус">\` з варіантами \`all\` (Усі), \`todo\`, \`doing\`, \`done\`;
- запит \`api.list({ q, status, signal })\` — одразу при створенні та при зміні **відкладеного** тексту або статусу (статус — без затримки);
- новий запит скасовує попередній (\`onWatcherCleanup\` + \`AbortController\`); відповідь чи помилка скасованого запиту на екран не потрапляє, **навіть якщо API не відхилило проміс**;
- завантаження → \`<p role="status">Завантаження…</p>\`; помилка → \`<p role="alert">Не вдалося завантажити: {повідомлення}</p>\` і кнопка «Спробувати ще»; успіх → \`<p class="total">Знайдено: {total}</p>\` і \`<ul aria-label="Задачі">\` з \`<li>\`; порожньо → \`<p>Нічого не знайдено</p>\`.

**Де трапляється:** головний екран будь-якої адмінки, CRM чи трекера — і найчастіша частина тестового завдання на Vue. Composables на кшталт \`useDebounceFn\` з VueUse роблять саме це.

**Як це працює:** \`watch([q, status, attempt], …, { immediate: true })\` запускає завантаження одразу і при кожній зміні джерел. Перед повторним запуском Vue викликає функцію з \`onWatcherCleanup\` — там \`abort()\`. Повтор — це просто \`attempt++\`, яке перезапускає той самий \`watch\`. Composable у \`.ts\`-файлі живе в області компонента: \`onScopeDispose\` прибирає таймер при розмонтуванні.

**Аналогія:** \`createTasksApi\` з кроку 2 уже передає \`signal\` у \`fetch\` — справжній запит переривається; тут ви вмикаєте це з боку інтерфейсу.
`,
      html: HTML, css: CSS,
      js: `<!-- file: useDebounced.ts -->
import { shallowRef, watch, onScopeDispose, type Ref } from 'vue';

export function useDebouncedRef<T>(source: Ref<T>, delay: number): Ref<T> {
  // TODO: shallowRef(source.value); watch(source) → clearTimeout + setTimeout(delay);
  //       onScopeDispose(() => clearTimeout(timer))
  return source;
}

<!-- file: TaskBoard.vue -->
<script setup lang="ts">
import { ref, watch, onWatcherCleanup } from 'vue';
import { useDebouncedRef } from './useDebounced';

` + TYPES + `
type BoardApi = { list(params?: ListParams): Promise<TaskPage> };

const { api, delay = 300 } = defineProps<{ api: BoardApi; delay?: number }>();
const query = ref('');
// TODO: status, attempt, state (loading | error | success), q = useDebouncedRef(query, delay)
// TODO: watch([q, status, attempt], …, { immediate: true }): AbortController, onWatcherCleanup,
//       api.list({ q, status, signal }), результат скасованого запиту ігнорувати
</script>

<template>
  <section>
    <input v-model="query" type="search" aria-label="Пошук задач">
    <!-- TODO: select статусу; стани: завантаження / помилка з повтором / список / порожньо -->
  </section>
</template>

<!-- file: App.vue -->
<script setup>
import TaskBoard from './TaskBoard.vue';
` + DEMO + `
</script>

<template>
  <TaskBoard :api="demoApi" />
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: useDebounced.ts -->
import { shallowRef, watch, onScopeDispose, type Ref } from 'vue';

export function useDebouncedRef<T>(source: Ref<T>, delay: number): Ref<T> {
  const debounced = shallowRef(source.value);
  let timer: ReturnType<typeof setTimeout> | undefined;
  watch(source, (value) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      debounced.value = value;
    }, delay);
  });
  onScopeDispose(() => clearTimeout(timer)); // компонент знищено — таймер не потрібен
  return debounced;
}

<!-- file: TaskBoard.vue -->
<script setup lang="ts">
import { ref, watch, onWatcherCleanup } from 'vue';
import { useDebouncedRef } from './useDebounced';

` + TYPES + `
type BoardApi = { list(params?: ListParams): Promise<TaskPage> };
type StatusFilter = TaskStatus | 'all';
type RequestState = { status: 'loading' } | { status: 'error'; error: string } | { status: 'success'; data: TaskPage };

const { api, delay = 300 } = defineProps<{ api: BoardApi; delay?: number }>();

const LABELS: Record<StatusFilter, string> = { all: 'Усі', todo: 'До роботи', doing: 'У роботі', done: 'Готово' };
const query = ref('');
const status = ref<StatusFilter>('all');
const attempt = ref(0);
const state = ref<RequestState>({ status: 'loading' });
const q = useDebouncedRef(query, delay);

watch([q, status, attempt], ([text, filter]) => {
  const controller = new AbortController();
  onWatcherCleanup(() => controller.abort()); // до будь-якого await
  state.value = { status: 'loading' };
  api.list({ q: text, status: filter, signal: controller.signal }).then(
    (data) => {
      if (!controller.signal.aborted) state.value = { status: 'success', data };
    },
    (err: unknown) => {
      if (controller.signal.aborted) return; // скасований запит — не помилка для користувача
      state.value = { status: 'error', error: err instanceof Error ? err.message : String(err) };
    },
  );
}, { immediate: true });
</script>

` + BOARD_TEMPLATE + `

<!-- file: App.vue -->
<script setup>
import TaskBoard from './TaskBoard.vue';
` + DEMO + `
</script>

<template>
  <TaskBoard :api="demoApi" />
</template>
` },
      typeTests: [
        { name: 'useDebouncedRef зберігає тип значення', code: "import { ref as makeRef, type Ref as RefOf } from 'vue';\nconst probeSource = makeRef(5);\nconst probe = useDebouncedRef(probeSource, 10);\ntype D1 = Expect<Equal<typeof probe, RefOf<number>>>;\n// @ts-expect-error — delay має бути числом\nuseDebouncedRef(probeSource, '10');" }
      ],
      hints: [
        'Composable: `const debounced = shallowRef(source.value); let timer: ReturnType<typeof setTimeout> | undefined; watch(source, (v) => { clearTimeout(timer); timer = setTimeout(() => { debounced.value = v; }, delay); });` і `onScopeDispose(() => clearTimeout(timer))`.',
        '`watch([q, status, attempt], ([text, filter]) => { const controller = new AbortController(); onWatcherCleanup(() => controller.abort()); … }, { immediate: true })` — без `async`, результат через `.then(onOk, onErr)`.',
        'В обох колбеках `then` спершу `if (controller.signal.aborted) return`. Повтор — `@click="attempt++"`; стан — розрізнюване об\'єднання `RequestState` у `ref`.'
      ],
      tests: [
        { name: 'перше завантаження: статус, потім список', code: T + 'const api = { list: mockFn(() => Promise.resolve(page([task("t1", "Купити домен"), task("t2", "Налаштувати CI")]))) };\nconst m = mount(TaskBoard, { api, delay: 10 });\nexpect(m.container.querySelector(\'[role="status"]\').textContent).toBe("Завантаження…");\nawait settle(20);\nexpect(texts(m, "li")).toEqual(["Купити домен", "Налаштувати CI"]);\nexpect(m.container.querySelector(".total").textContent).toBe("Знайдено: 2");\nexpect(api.list.mock.calls[0][0].q).toBe("");\nexpect(api.list.mock.calls[0][0].status).toBe("all");\nm.unmount();' },
        { name: 'debounce: один запит на останній текст', code: T + 'const api = { list: mockFn(({ q }) => Promise.resolve(page(q ? [task("t1", "Результат " + q)] : []))) };\nconst m = mount(TaskBoard, { api, delay: 30 });\nawait settle(40);\nconst field = m.container.querySelector(\'input[type="search"]\');\nawait typeInto(field, "b");\nawait typeInto(field, "bu");\nawait typeInto(field, "bug");\nawait settle(80);\nexpect(api.list.mock.calls.map((c) => c[0].q)).toEqual(["", "bug"]);\nexpect(texts(m, "li")).toEqual(["Результат bug"]);\nm.unmount();' },
        { name: 'статус — одразу, попередній запит скасовано', code: T + 'const signals = [];\nconst api = { list: mockFn(({ status, signal }) => { signals.push(signal); return new Promise((resolve) => setTimeout(() => resolve(page([task("t-" + status, "Задачі: " + status, status === "all" ? "todo" : status)])), status === "all" ? 80 : 5)); }) };\nconst m = mount(TaskBoard, { api, delay: 10 });\nawait typeInto(m.container.querySelector("select"), "done");\nawait settle(120);\nexpect(signals[0].aborted).toBe(true);\nexpect(api.list.mock.calls[1][0].status).toBe("done");\nexpect(texts(m, "li")).toEqual(["Задачі: done"]);\nm.unmount();' },
        { name: 'помилка і повтор', code: T + 'let n = 0;\nconst api = { list: mockFn(() => (++n === 1 ? Promise.reject(new Error("500")) : Promise.resolve(page([task("t1", "A")])))) };\nconst m = mount(TaskBoard, { api, delay: 10 });\nawait settle(10);\nexpect(m.container.querySelector(\'[role="alert"]\').textContent).toBe("Не вдалося завантажити: 500");\nconst retry = [...m.container.querySelectorAll("button")].find((b) => b.textContent.trim() === "Спробувати ще");\nclick(retry);\nawait settle(10);\nexpect(m.container.querySelector(\'[role="alert"]\')).toBe(null);\nexpect(texts(m, "li")).toEqual(["A"]);\nexpect(api.list).toHaveBeenCalledTimes(2);\nm.unmount();' },
        { name: 'порожній результат', code: T + 'const api = { list: mockFn(() => Promise.resolve(page([]))) };\nconst m = mount(TaskBoard, { api, delay: 10 });\nawait settle(10);\nexpect(texts(m, "p")).toContain("Нічого не знайдено");\nexpect(m.container.querySelector("ul")).toBe(null);\nm.unmount();' }
      ],
      explanation: `
Composable з debounce, \`watch\` з \`immediate\` і \`onWatcherCleanup\` разом дають те саме, що \`useEffect\` з cleanup у React: кожна зміна джерел — новий запит, попередній скасовано, а перевірка \`signal.aborted\` не пускає застарілу відповідь на екран.

**Типові помилки:** \`async\`-колбек з \`onWatcherCleanup\` після \`await\` (cleanup не зареєструється); без \`immediate\` (немає першого завантаження); \`ref\` замість \`shallowRef\` для довільного \`T\` (тип стає \`Ref<UnwrapRef<T>>\` і не збігається з \`Ref<T>\`); таймер без \`onScopeDispose\`.

**Що спитають далі:** як синхронізувати фільтри з URL через Vue Router (\`route.query\`); як показати попередній список під час нового запиту (\`peek\` з кешу кроку 3); чим це замінює \`useQuery\` з TanStack Query для Vue чи Pinia Colada.
`
    },
    {
      id: 'cap-vue-form', group: 'mutations', type: 'dom', runtime: 'vue', level: 3,
      title: 'Крок 5 (Vue). Форма нової задачі: валідація, доступність, стан відправки',
      description: `
**Завдання.** Напишіть \`NewTaskForm.vue\` з пропом \`create: (input: NewTask) => Promise<Task>\` — це \`api.create\` з частини 1.
- поля в \`<label>\`: \`Назва\` (\`<input name="title">\`) і \`Виконавець (необов'язково)\` (\`<input name="assignee">\`); форма з \`novalidate\` і \`@submit.prevent\`;
- при відправці назва обрізається; коротша за 3 символи → \`Назва — щонайменше 3 символи\`, довша за 80 → \`Назва — до 80 символів\`;
- помилка: \`<p id="title-error" class="field-error">\`, у поля \`aria-invalid="true"\` і \`aria-describedby="title-error"\`, фокус переходить у поле назви (template ref); \`create\` не викликається;
- якщо помилку вже показано, вона оновлюється під час введення і зникає, щойно назва стала коректною;
- коректно → \`create({ title, assignee: обрізаний виконавець або null })\`; поки чекаємо — кнопка \`disabled\` з текстом \`Створюю…\` (інакше \`Створити\`);
- успіх → поля очищуються, \`<p role="status">Задачу «{назва}» створено</p>\`; помилка → \`<p role="alert">{повідомлення}</p>\`, введене зберігається.

**Де трапляється:** будь-яка форма створення — задачі, коментаря, замовлення. Форма без зрозумілих помилок, фокусу й захисту від подвійного сабміту — типова причина відмови за тестовим завданням.

**Як це працює:** \`aria-invalid\` каже screen reader-у, що поле з помилкою, а \`aria-describedby\` зачитує текст помилки разом з назвою поля (модуль «Доступність»). Template ref (\`ref="titleInput"\` + \`ref<HTMLInputElement | null>(null)\`) дає доступ до DOM-поля для \`focus()\`. \`watch(title, …)\` оновлює вже показану помилку під час введення.

**Врахуйте:** атрибути \`aria-*\` без помилки не виводьте зовсім (\`undefined\` прибирає атрибут); \`finally\` повертає кнопку і після успіху, і після помилки.
`,
      html: HTML, css: CSS,
      js: `<!-- file: NewTaskForm.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue';

` + TYPES + `

const { create } = defineProps<{ create: (input: NewTask) => Promise<Task> }>();
const title = ref('');
const assignee = ref('');
// TODO: error, serverError, created, pending, titleInput = ref<HTMLInputElement | null>(null)

async function onSubmit() {
  // 1. Перевірка назви (3…80 символів після trim): помилка → показати, фокус у поле, вийти
  // 2. pending = true; try { await create(...); очистити поля; created } catch { serverError } finally { pending = false }
  // TODO
}
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <label>
      Назва
      <input v-model="title" name="title">
    </label>
    <label>
      Виконавець (необов'язково)
      <input v-model="assignee" name="assignee">
    </label>
    <button type="submit">Створити</button>
  </form>
</template>

<!-- file: App.vue -->
<script setup>
import NewTaskForm from './NewTaskForm.vue';
` + DEMO + `
</script>

<template>
  <NewTaskForm :create="demoApi.create" />
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: NewTaskForm.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue';

` + TYPES + `

const { create } = defineProps<{ create: (input: NewTask) => Promise<Task> }>();
const title = ref('');
const assignee = ref('');
const error = ref<string | null>(null);
const serverError = ref<string | null>(null);
const created = ref<string | null>(null);
const pending = ref(false);
const titleInput = ref<HTMLInputElement | null>(null);

function validateTitle(value: string): string | null {
  const text = value.trim();
  if (text.length < 3) return 'Назва — щонайменше 3 символи';
  if (text.length > 80) return 'Назва — до 80 символів';
  return null;
}

// Показану помилку оновлюємо під час введення.
watch(title, (value) => {
  if (error.value) error.value = validateTitle(value);
});

async function onSubmit() {
  const problem = validateTitle(title.value);
  error.value = problem;
  serverError.value = null;
  created.value = null;
  if (problem) {
    titleInput.value?.focus();
    return;
  }
  pending.value = true;
  try {
    const task = await create({ title: title.value.trim(), assignee: assignee.value.trim() || null });
    title.value = '';
    assignee.value = '';
    created.value = task.title;
  } catch (err) {
    serverError.value = err instanceof Error ? err.message : 'Не вдалося створити задачу';
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <label>
      Назва
      <input
        ref="titleInput"
        v-model="title"
        name="title"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? 'title-error' : undefined"
      >
    </label>
    <p v-if="error" id="title-error" class="field-error">{{ error }}</p>
    <label>
      Виконавець (необов'язково)
      <input v-model="assignee" name="assignee">
    </label>
    <button type="submit" :disabled="pending">{{ pending ? 'Створюю…' : 'Створити' }}</button>
    <p v-if="serverError" role="alert">{{ serverError }}</p>
    <p v-if="created" role="status">Задачу «{{ created }}» створено</p>
  </form>
</template>

<!-- file: App.vue -->
<script setup>
import NewTaskForm from './NewTaskForm.vue';
` + DEMO + `
</script>

<template>
  <NewTaskForm :create="demoApi.create" />
</template>
` },
      hints: [
        'Винесіть перевірку у `validateTitle(value): string | null`; `watch(title, (v) => { if (error.value) error.value = validateTitle(v); })` оновлює вже показану помилку.',
        'Атрибути поля: `:aria-invalid="error ? \'true\' : undefined"` і `:aria-describedby="error ? \'title-error\' : undefined"`; фокус — `titleInput.value?.focus()` через `ref="titleInput"`.',
        'Відправка: `pending.value = true; try { const task = await create({ … }); … } catch (err) { … } finally { pending.value = false; }`.'
      ],
      tests: [
        { name: 'коротка назва: помилка, aria і фокус', code: 'const create = mockFn(() => Promise.resolve({}));\nconst m = mount(NewTaskForm, { create });\nconst title = m.container.querySelector(\'input[name="title"]\');\nawait typeInto(title, " ab ");\nsubmit(m.container.querySelector("form"));\nawait nextTick();\nexpect(m.container.querySelector("#title-error").textContent).toBe("Назва — щонайменше 3 символи");\nexpect(title.getAttribute("aria-invalid")).toBe("true");\nexpect(title.getAttribute("aria-describedby")).toBe("title-error");\nexpect(document.activeElement).toBe(title);\nexpect(create).not.toHaveBeenCalled();\nm.unmount();' },
        { name: 'помилка зникає після виправлення; задовга назва', code: 'const m = mount(NewTaskForm, { create: mockFn(() => Promise.resolve({})) });\nconst title = m.container.querySelector(\'input[name="title"]\');\nconst form = m.container.querySelector("form");\nsubmit(form);\nawait nextTick();\nexpect(m.container.querySelector("#title-error")).not.toBe(null);\nawait typeInto(title, "Нова задача");\nexpect(m.container.querySelector("#title-error")).toBe(null);\nexpect(title.hasAttribute("aria-invalid")).toBe(false);\nawait typeInto(title, "x".repeat(81));\nsubmit(form);\nawait nextTick();\nexpect(m.container.querySelector("#title-error").textContent).toBe("Назва — до 80 символів");\nm.unmount();' },
        { name: 'успіх: стан відправки, дані, очищення', code: 'let finish;\nconst create = mockFn((input) => new Promise((r) => { finish = () => r({ id: "t9", title: input.title, status: "todo", assignee: input.assignee, updatedAt: "2026-11-18T10:00:00Z" }); }));\nconst m = mount(NewTaskForm, { create });\nconst q = (s) => m.container.querySelector(s);\nawait typeInto(q(\'input[name="title"]\'), "  Оновити README  ");\nsubmit(q("form"));\nawait nextTick();\nexpect(create).toHaveBeenCalledWith({ title: "Оновити README", assignee: null });\nexpect(q(\'button[type="submit"]\').disabled).toBe(true);\nexpect(q(\'button[type="submit"]\').textContent.trim()).toBe("Створюю…");\nfinish();\nawait settle(0);\nexpect(q(\'[role="status"]\').textContent).toBe("Задачу «Оновити README» створено");\nexpect(q(\'input[name="title"]\').value).toBe("");\nexpect(q(\'button[type="submit"]\').disabled).toBe(false);\nm.unmount();' },
        { name: 'помилка сервера: alert, введене збережено', code: 'const create = mockFn(() => Promise.reject(new Error("Сервер недоступний")));\nconst m = mount(NewTaskForm, { create });\nconst q = (s) => m.container.querySelector(s);\nawait typeInto(q(\'input[name="title"]\'), "Нова задача");\nawait typeInto(q(\'input[name="assignee"]\'), " ann ");\nsubmit(q("form"));\nawait settle(0);\nexpect(q(\'[role="alert"]\').textContent).toBe("Сервер недоступний");\nexpect(q(\'input[name="title"]\').value).toBe("Нова задача");\nexpect(create).toHaveBeenCalledWith({ title: "Нова задача", assignee: "ann" });\nexpect(q(\'button[type="submit"]\').disabled).toBe(false);\nm.unmount();' }
      ],
      explanation: `
Доступна форма — це не лише \`<label>\`: помилка зв'язана з полем (\`aria-describedby\`), поле позначене (\`aria-invalid\`), фокус переведено до проблеми. Помилку показуємо після відправки, а прибираємо одразу під час виправлення.

**Типові помилки:** валідація лише через \`disabled\` кнопку; помилка без зв'язку з полем; \`assignee: ''\` замість \`null\`; немає \`finally\` — кнопка лишається заблокованою після помилки; функція-проп названа \`onCreate\` (Vue вважає \`on*\` слухачами подій — для подій є \`emit\`, а для колбека з результатом — звичайна назва).

**Що спитають далі:** як перевести валідацію на VeeValidate + Zod (одна схема для типу й правил); чому тут проп-колбек, а не \`emit('create')\` (потрібен результат — успіх чи помилка); як показати помилки сервера біля конкретних полів (422 з \`{ field: message }\`).
`
    },
    {
      id: 'cap-vue-optimistic', group: 'mutations', type: 'dom', runtime: 'vue', level: 3,
      title: 'Крок 6 (Vue). Оптимістична зміна статусу з точковим відкатом',
      description: `
**Завдання.** Напишіть \`TaskList.vue\` з пропами \`initial\` (масив задач) і \`api\` (метод \`update(id, patch)\` з частини 1).
- \`<ul aria-label="Задачі">\`; у кожному \`<li>\` — \`<label>\` з \`<input type="checkbox">\` (позначено, якщо \`status === 'done'\`) і назвою;
- клік → статус змінюється **одразу** (\`done\` ↔ \`todo\`), потім \`api.update(id, { status })\`;
- поки запит цієї задачі триває, її чекбокс \`disabled\`;
- успіх → задача замінюється відповіддю сервера; \`<p role="status">Задачу «{назва}» виконано</p>\` (або \`повернуто в роботу\`);
- помилка → відкат статусу **лише цієї** задачі і \`<p role="alert">Не вдалося оновити «{назва}»: {повідомлення}</p>\`.

**Де трапляється:** галочки в трекерах і списках покупок, лайки, «прочитано» в пошті — інтерфейс реагує миттєво, а мережа наздоганяє.

**Як це працює:** попередній статус запам'ятовується в замиканні обробника, тож при помилці відкочується саме він, а заміна за \`id\` не чіпає задач, що змінились за цей час. \`ref(new Set<string>())\` — реактивний \`Set\`: Vue відстежує \`has\`, \`add\` і \`delete\`, тож \`:disabled="pending.has(t.id)"\` оновлюється сам (модуль «Vue: Composition API»).

**Аналогія:** \`arch-optimistic-store\` з модуля «Архітектура» — той самий точковий відкат, тепер у компоненті.

**Врахуйте:** \`role="status"\` і \`role="alert"\` — окремі елементи: успіх іншої задачі не повинен сховати помилку; пропи не мутуйте — працюйте з локальною копією \`initial\`.
`,
      html: HTML, css: CSS,
      js: `<!-- file: TaskList.vue -->
<script setup lang="ts">
import { ref } from 'vue';

` + TYPES + `
type UpdateApi = { update(id: string, patch: TaskPatch): Promise<Task> };

const { initial, api } = defineProps<{ initial: Task[]; api: UpdateApi }>();
const tasks = ref<Task[]>(initial.map((t) => ({ ...t })));
// TODO: pending = ref(new Set<string>()), statusText, alertText

async function toggle(task: Task) {
  // 1. previous = task.status, next = done ↔ todo; одразу змінити статус цієї задачі, додати id у pending
  // 2. try: saved = await api.update(task.id, { status: next }) → замінити задачу на saved, statusText
  // 3. catch: повернути previous лише цій задачі, alertText;  finally: прибрати id з pending
  // TODO
}
</script>

<template>
  <ul aria-label="Задачі">
    <li v-for="t in tasks" :key="t.id">
      <label>
        <input type="checkbox" :checked="t.status === 'done'" @change="toggle(t)">
        {{ t.title }}
      </label>
    </li>
  </ul>
</template>

<!-- file: App.vue -->
<script setup>
import TaskList from './TaskList.vue';
` + DEMO + `
</script>

<template>
  <TaskList :initial="demoTasks" :api="demoApi" />
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: TaskList.vue -->
<script setup lang="ts">
import { ref } from 'vue';

` + TYPES + `
type UpdateApi = { update(id: string, patch: TaskPatch): Promise<Task> };

const { initial, api } = defineProps<{ initial: Task[]; api: UpdateApi }>();
const tasks = ref<Task[]>(initial.map((t) => ({ ...t }))); // локальна копія: пропи не мутуємо
const pending = ref(new Set<string>());
const statusText = ref<string | null>(null);
const alertText = ref<string | null>(null);

function setStatusOf(id: string, status: TaskStatus) {
  tasks.value = tasks.value.map((t) => (t.id === id ? { ...t, status } : t));
}

async function toggle(task: Task) {
  const previous = task.status;
  const next: TaskStatus = previous === 'done' ? 'todo' : 'done';
  setStatusOf(task.id, next); // оптимістично — одразу
  pending.value.add(task.id);
  try {
    const saved = await api.update(task.id, { status: next });
    tasks.value = tasks.value.map((t) => (t.id === saved.id ? saved : t));
    statusText.value = 'Задачу «' + saved.title + '» ' + (saved.status === 'done' ? 'виконано' : 'повернуто в роботу');
  } catch (err) {
    setStatusOf(task.id, previous); // відкат лише цієї задачі
    alertText.value = 'Не вдалося оновити «' + task.title + '»: ' + (err instanceof Error ? err.message : String(err));
  } finally {
    pending.value.delete(task.id);
  }
}
</script>

<template>
  <div>
    <ul aria-label="Задачі">
      <li v-for="t in tasks" :key="t.id">
        <label>
          <input type="checkbox" :checked="t.status === 'done'" :disabled="pending.has(t.id)" @change="toggle(t)">
          {{ t.title }}
        </label>
      </li>
    </ul>
    <p v-if="statusText" role="status">{{ statusText }}</p>
    <p v-if="alertText" role="alert">{{ alertText }}</p>
  </div>
</template>

<!-- file: App.vue -->
<script setup>
import TaskList from './TaskList.vue';
` + DEMO + `
</script>

<template>
  <TaskList :initial="demoTasks" :api="demoApi" />
</template>
` },
      hints: [
        'Перед запитом `const previous = task.status;` — у `catch` відкотіть саме його лише для `task.id`: `tasks.value = tasks.value.map((t) => (t.id === id ? { ...t, status: previous } : t))`.',
        '`const pending = ref(new Set<string>())`: `pending.value.add(id)` перед запитом, `pending.value.delete(id)` у `finally`, у шаблоні `:disabled="pending.has(t.id)"`.',
        'Успіх і помилка — окремі `ref` (`statusText`, `alertText`) і окремі `<p role="status">` та `<p role="alert">`.'
      ],
      tests: [
        { name: 'оптимістично: галочка одразу, повторний клік заблоковано', code: T + 'let finish;\nconst api = { update: mockFn((id, patch) => new Promise((r) => { finish = () => r({ ...task(id, "A (сервер)"), status: patch.status }); })) };\nconst m = mount(TaskList, { initial: [task("t1", "A"), task("t2", "B")], api });\nconst box = () => m.container.querySelectorAll(\'input[type="checkbox"]\')[0];\nclick(box());\nawait nextTick();\nexpect(box().checked).toBe(true);\nexpect(box().disabled).toBe(true);\nexpect(api.update).toHaveBeenCalledWith("t1", { status: "done" });\nfinish();\nawait settle(0);\nexpect(box().disabled).toBe(false);\nexpect(texts(m, "li")[0]).toBe("A (сервер)");\nexpect(m.container.querySelector(\'[role="status"]\').textContent).toBe("Задачу «A (сервер)» виконано");\nm.unmount();' },
        { name: 'помилка: відкат лише цієї задачі', code: T + 'const api = { update: mockFn((id, patch) => (id === "t1" ? Promise.reject(new Error("Немає доступу")) : Promise.resolve({ ...task(id, "B"), status: patch.status }))) };\nconst m = mount(TaskList, { initial: [task("t1", "A"), task("t2", "B")], api });\nconst boxes = () => m.container.querySelectorAll(\'input[type="checkbox"]\');\nclick(boxes()[0]);\nclick(boxes()[1]);\nawait settle(0);\nexpect(boxes()[0].checked).toBe(false);\nexpect(boxes()[1].checked).toBe(true);\nexpect(m.container.querySelector(\'[role="alert"]\').textContent).toBe("Не вдалося оновити «A»: Немає доступу");\nexpect(boxes()[0].disabled).toBe(false);\nm.unmount();' },
        { name: 'повернення в роботу; пропи не мутуються', code: T + 'const initial = [task("t1", "Звіт", "done")];\nconst api = { update: mockFn((id, patch) => Promise.resolve({ ...task(id, "Звіт"), status: patch.status })) };\nconst m = mount(TaskList, { initial, api });\nconst box = () => m.container.querySelector(\'input[type="checkbox"]\');\nexpect(box().checked).toBe(true);\nclick(box());\nawait settle(0);\nexpect(api.update).toHaveBeenCalledWith("t1", { status: "todo" });\nexpect(box().checked).toBe(false);\nexpect(m.container.querySelector(\'[role="status"]\').textContent).toBe("Задачу «Звіт» повернуто в роботу");\nexpect(initial[0].status).toBe("done");\nm.unmount();' }
      ],
      explanation: `
Оптимістичне оновлення = змінити UI одразу + запам'ятати, як повернути + звірити з відповіддю сервера. Відкат за id і заміна задачі відповіддю сервера роблять його коректним навіть при кількох паралельних запитах.

**Типові помилки:** відкат «знімком» усього списку (губляться інші зміни); мутувати проп \`initial\` (Vue попередить, а батьківський стан тихо зміниться); не блокувати повторний клік (два запити з протилежними статусами — гонка); тихий відкат без повідомлення.

**Що спитають далі:** як оновити кеш списків з кроку 3 замість повного перезапиту; де тримати цю логіку у великому застосунку (action у Pinia-сторі з відкатом); коли оптимістичне оновлення недоречне (оплата, незворотні дії).
`
    }
  ]
});
})();
