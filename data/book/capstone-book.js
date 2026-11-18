FE.chapter('capstone-book', { body: `
Фінальний проєкт — «Дошка задач команди» у форматі тестового завдання (take-home), яке компанії дають кандидатам на Middle і Strong Middle. Він збирає докупи все пройдене: типи й звуження з TypeScript, \`fetch\` і \`AbortController\` з Browser API, event loop і дедуплікацію з «Асинхронності», ефекти й хуки з React або \`watch\` і composables з Vue, доступність форм, оптимістичні оновлення з «Архітектури».

\`\`\`text
UI (React / Vue)
   │  api пропом (dependency injection)
   ▼
кеш запитів ── дедуплікація, staleTime, invalidate('tasks:')
   ▼
API-клієнт ── URL, JSON, ApiError, signal
   ▼
fetch ──▶ сервер
   ▲
парсер ── unknown → Task | ValidationError   (межа довіри)
\`\`\`

## Типи й перевірка даних з API

Відповідь сервера — **межа довіри**. TypeScript не бачить, що прийде по мережі: \`res.json()\` повертає \`any\`, а \`as Task\` лише вимикає перевірку. Якщо бекенд перейменує поле, код скомпілюється і впаде в глибині інтерфейсу з \`TypeError\`.

Правильний підхід — **парсер**: функція приймає \`unknown\` і або повертає правдивий \`Task\`, або кидає помилку з точним шляхом до поля.

\`\`\`ts
export function parseTask(raw: unknown, path = 'task'): Task {
  if (!isRecord(raw)) throw new ValidationError(path, "очікувався об'єкт");
  const { id, title, status } = raw;                 // усі — unknown
  if (typeof id !== 'string' || id === '') throw new ValidationError(path + '.id', 'очікувався непорожній рядок');
  if (!isTaskStatus(status)) throw new ValidationError(path + '.status', 'невідомий статус ' + JSON.stringify(status));
  // …
  return { id, title: title.trim(), status, assignee: owner, updatedAt };   // без as
}
\`\`\`

- \`unknown\` змушує перевірити кожне поле; type guards (\`value is TaskStatus\`) звужують тип, і наприкінці TS сам бачить \`Task\`.
- Шлях у помилці (\`page.items[3].status: невідомий статус "blocked"\`) за секунди показує в моніторингу, що саме зламав бекенд.
- У продакшні те саме роблять Zod, Valibot чи ArkType: \`const Task = z.object({ … }); type Task = z.infer<typeof Task>\` — одне джерело правди для типу й перевірки.
- Компроміс строгості: невідомий статус можна або вважати помилкою (як тут), або показувати як «невідомо», щоб нова фіча бекенду не ламала старий клієнт.

## API-клієнт і кеш запитів

**Клієнт** перетворює \`fetch\` на функції предметної області: \`list\`, \`create\`, \`update\`. Головні правила:

- \`fetch\` відхиляє проміс лише при мережевій помилці чи скасуванні; 404 і 500 — це відповіді з \`ok: false\`, їх перетворюють на \`ApiError(status, message)\`;
- тіло помилки читають через \`res.text()\` і пробують \`JSON.parse\` — проксі може повернути HTML;
- \`AbortError\` не огортають: інтерфейс просто ігнорує скасування;
- параметри — через \`URLSearchParams\` (кодування спецсимволів), id у шляху — через \`encodeURIComponent\`.

\`\`\`ts
async list({ q = '', status = 'all', page = 1, signal }: ListParams = {}) {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  if (status !== 'all') params.set('status', status);
  params.set('page', String(page));
  return parseTaskPage(await request('/tasks?' + params.toString(), { signal }));
}
\`\`\`

**Кеш** — ядро TanStack Query, SWR і RTK Query в мініатюрі:

| Механізм | Навіщо | Як |
|---|---|---|
| \`staleTime\` | повернення на екран без спінера і повторного запиту | дані з часом збереження |
| дедуплікація | два компоненти — один запит | проміс «у польоті» за ключем |
| \`invalidate(prefix)\` | після створення задачі всі списки застаріли | ключі \`tasks:…\` зі спільним префіксом |
| нормалізований ключ | \`{ q: ' bug' }\` і \`{ q: 'bug', page: 1 }\` — один запис | \`JSON.stringify\` параметрів з дефолтами |

Помилки не кешуються: наступний виклик знову йде в мережу. Час (\`now\`) передається параметром — тоді тести керують ним без фейкових таймерів.

## React: дошка, debounce і гонки відповідей

Дошка поєднує три механізми з модуля «React: хуки»:

\`\`\`tsx
const q = useDebouncedValue(query, delay);           // менше запитів
useEffect(() => {
  const controller = new AbortController();
  setState({ status: 'loading' });
  api.list({ q, status, signal: controller.signal }).then(
    (data) => { if (!controller.signal.aborted) setState({ status: 'success', data }); },
    (err) => { if (!controller.signal.aborted) setState({ status: 'error', error: message(err) }); },
  );
  return () => controller.abort();                   // скасування попереднього запиту
}, [api, q, status, attempt]);
\`\`\`

- **Debounce не прибирає гонку**: повільна відповідь на «ab» може прийти після швидкої на «abc». Прибирає її лише скасування або перевірка «чи це ще актуальний запит».
- Перевірка \`signal.aborted\` захищає і тоді, коли API не відхиляє проміс (кеш, фейкове API в тестах).
- \`attempt\` у залежностях — повтор після помилки без дублювання логіки.
- \`RequestState\` як розрізнюване об'єднання робить неможливим «і помилка, і дані».

## React: форма й оптимістичні оновлення

**Форма.** Помилку показують після відправки й прибирають одразу під час виправлення. Доступність: \`aria-invalid="true"\` на полі, \`aria-describedby\` → id тексту помилки, фокус на першому полі з помилкою, \`role="alert"\` для помилки сервера і \`role="status"\` для успіху. Кнопка \`disabled\` на час запиту, \`finally\` повертає її в будь-якому випадку.

**Оптимістичне оновлення.**

\`\`\`tsx
const previous = task.status;
setStatusOf(task.id, next);                 // одразу
try {
  const saved = await api.update(task.id, { status: next });
  setTasks((list) => list.map((t) => (t.id === saved.id ? saved : t)));
} catch {
  setStatusOf(task.id, previous);           // відкат лише цієї задачі
}
\`\`\`

Функціональні оновлення (\`setTasks((list) => …)\`) працюють з актуальним списком, тож відкат однієї задачі не стирає зміни інших. Набір id у польоті блокує повторний клік. У React 19 простіші випадки покриває \`useOptimistic\`.

## Vue: дошка, debounce і скасування запитів

Той самий сценарій засобами Vue:

\`\`\`ts
// useDebounced.ts — composable в окремому файлі
export function useDebouncedRef<T>(source: Ref<T>, delay: number): Ref<T> {
  const debounced = shallowRef(source.value);
  let timer: ReturnType<typeof setTimeout> | undefined;
  watch(source, (v) => { clearTimeout(timer); timer = setTimeout(() => { debounced.value = v; }, delay); });
  onScopeDispose(() => clearTimeout(timer));
  return debounced;
}

// TaskBoard.vue
watch([q, status, attempt], ([text, filter]) => {
  const controller = new AbortController();
  onWatcherCleanup(() => controller.abort());        // до будь-якого await
  api.list({ q: text, status: filter, signal: controller.signal }).then(onOk, onErr);
}, { immediate: true });
\`\`\`

- \`onWatcherCleanup\` викликається перед кожним повторним запуском колбека і при зупинці спостерігача; реєструвати його треба синхронно, до першого \`await\`.
- Помилка з async-колбека \`watch\` іде в \`app.config.errorHandler\` — тому скасування обробляють через \`.then(onOk, onErr)\` або \`try/catch\` з перевіркою \`AbortError\`.
- \`shallowRef\` зберігає тип \`Ref<T>\` для довільного \`T\` (\`ref\` дав би \`Ref<UnwrapRef<T>>\`).
- TypeScript у \`<script setup lang="ts">\` перевіряє \`tsc\`; шаблони в проєктах перевіряє \`vue-tsc\`.

## Vue: форма й оптимістичні оновлення

**Форма**: \`v-model\`, \`@submit.prevent\`, template ref (\`ref="titleInput"\` + \`ref<HTMLInputElement | null>(null)\`) для фокусу, \`watch(title)\` для оновлення вже показаної помилки. Функцію створення передають пропом (\`create\`), бо потрібен результат — успіх чи помилка; для «просто повідомити батька» у Vue є \`emit\`. Пропи з префіксом \`on\` Vue трактує як слухачі подій, тому колбек названо без нього.

**Оптимістичне оновлення**: локальна копія \`initial\` (пропи не мутують), реактивний \`ref(new Set<string>())\` для запитів у польоті — Vue відстежує \`has\`, \`add\`, \`delete\`. Відкат — за id, повідомлення успіху й помилки — в окремих елементах з \`role="status"\` і \`role="alert"\`. У великому застосунку цю логіку переносять в action Pinia-стора.

## Що перевіряє рев'юер і пріоритети

За 20–30 хвилин рев'юер відповідає собі: чи можна довірити цій людині продакшн-код, чи вміє вона розставляти пріоритети, чи пояснить рішення команді.

- **Запуск**: \`npm ci && npm run dev\` за README на чистій машині.
- **Надійність**: усі стани (завантаження, помилка з повтором, порожньо), немає гонок, дані з API перевірені.
- **Доступність**: клавіатура, \`label\`, зв'язані помилки, видимий фокус.
- **Тести**: кілька змістовних — парсер, ключовий сценарій, баг, який виправили.
- **Масштаб рішення**: без «enterprise» абстракцій під маленьку задачу.
- **Процес**: невеликі осмислені коміти.

Коли часу мало: спершу основний сценарій без падінь (обробка помилок), потім README з чесним «не встиг і як би зробив», потім тести, і лише потім полірування.

## README і захист рішення

Структура README: як запустити → що зроблено → **рішення й компроміси** → що не встигли і як би зробили → як запустити тести. Компроміси — найцінніший розділ: код показує *що*, а компроміси — *чому*.

\`\`\`md
## Рішення і компроміси
- Дані з API перевіряє parseTask; у продакшні — Zod (тип і схема з одного джерела).
- Власний кеш (дедуплікація + staleTime); не встиг stale-while-revalidate і gcTime — у продакшні TanStack Query.
- Оптимістично оновлюється лише статус; створення — звичайний запит, бо id видає сервер.
\`\`\`

На співбесіді з розбору коду: коротко презентуйте архітектуру, **самі** назвіть слабкі місця, на питання про масштаб відповідайте з вимірюваннями (пагінація, віртуалізація, профілювання), зміни наживо робіть з планом уголос. Розумійте кожен рядок — зокрема той, що підказав ШІ-асистент: питатимуть про будь-який.
` });
