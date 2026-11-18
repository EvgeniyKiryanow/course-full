(function () {
const HTML = '<div id="root"></div>';
const CSS = `body { font-family: system-ui, sans-serif; padding: 12px; }
button { padding: 4px 10px; margin: 2px; }
.menu { list-style: none; padding: 4px; border: 1px solid #ccc; border-radius: 8px; width: 160px; }
.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: grid; place-items: center; }
.modal { background: #fff; padding: 16px; border-radius: 10px; }
.dark { background: #1e1e1e; color: #eee; }`;

FE.topic('vue-composition', {
  intro: `
**Composition API** — спосіб організувати логіку компонента функціями: реактивний стан, спостерігачі, хуки життєвого циклу й **composables** (аналог власних хуків React). Ключова відмінність від React: \`setup\` виконується **один раз**, тому немає застарілих замикань, масивів залежностей і правил порядку викликів.

| Задача | Vue | React |
|---|---|---|
| Реакція на зміну даних | \`watch\` / \`watchEffect\` | \`useEffect\` з залежностями |
| DOM після монтування | \`onMounted\` + template ref | \`useEffect\` + \`useRef\` |
| Прибирання | \`onUnmounted\`, \`onWatcherCleanup\` | cleanup-функція ефекту |
| Перевикористання логіки | composable \`useX()\` | власний хук |
| Передача в глибину | \`provide\` / \`inject\` | Context |
| Рендер в інше місце DOM | \`<Teleport>\` | \`createPortal\` |

У цьому модулі файли можуть бути й звичайними модулями: \`<!-- file: useFetch.js -->\` з \`export function useFetch…\` і \`import { useFetch } from './useFetch.js'\`.
`,
  groups: [
    { id: 'watchers', title: 'watch і watchEffect' },
    { id: 'lifecycle', title: 'Життєвий цикл і template refs' },
    { id: 'composables', title: 'Composables: перевикористання логіки' },
    { id: 'provide', title: 'provide/inject, Teleport і вбудовані компоненти' },
    { id: 'reactivity-deep', title: 'Реактивність зсередини і пастки' }
  ],
  items: [
    // ---------------------------------------------------------------- watchers
    {
      id: 'vc-quiz-watch-basics', group: 'watchers', type: 'quiz', level: 2,
      title: 'watch і watchEffect: коли й скільки разів',
      question: `
**Як це працює:** \`watch(джерело, колбек)\` — лінивий: колбек викликається лише після зміни й отримує нове і старе значення. \`watchEffect(fn)\` виконується **одразу** і сам відстежує все, що прочитав. Обидва за замовчуванням спрацьовують не на кожне присвоєння, а один раз перед наступним оновленням DOM.

Що виведе код?
\`\`\`js
const q = ref('a');
watch(q, (val, old) => console.log('watch', old, '→', val));
watchEffect(() => console.log('effect', q.value));
q.value = 'b';
q.value = 'c';
await nextTick();
\`\`\``,
      options: [
        '`effect a`, потім `watch a → c` і `effect c`',
        '`effect a`, `watch a → b`, `effect b`, `watch b → c`, `effect c`',
        '`watch a → c` і `effect c`',
        '`effect a`, `watch undefined → a`, `watch a → c`, `effect c`'
      ],
      answer: 0,
      why: [
        'Так: `watchEffect` виконався одразу при створенні, а обидва присвоєння злилися в один запуск перед оновленням — уже зі значенням `c`.',
        'Ні: спостерігачі не реагують на кожне присвоєння — Vue ставить їх у чергу і запускає один раз перед оновленням DOM.',
        'Ні: `watchEffect`, на відміну від `watch`, виконується одразу при створенні, щоб дізнатися свої залежності.',
        'Ні: `watch` лінивий — без `{ immediate: true }` колбек при створенні не викликається.'
      ],
      hint: 'Який зі спостерігачів запускається одразу при створенні? І чи кожне присвоєння `q.value` викликає колбеки?',
      explanation: 'Перевірено у Vue 3.5: `effect a`, а після обох присвоєнь — `watch a→c` і `effect c`; проміжне `b` спостерігачі не побачили. `watch` обирають, коли потрібні старе значення, конкретне джерело чи лінивий старт (запит лише після зміни фільтра); `watchEffect` — коли залежностей багато і всі вони читаються в тілі. `{ immediate: true }` робить `watch` нелінивим, а `flush: \'sync\'` запускає його на кожну зміну — дорого і майже завжди зайве.'
    },
    {
      id: 'vc-price-filter', group: 'watchers', type: 'dom', runtime: 'vue', level: 2,
      title: 'Фільтр за ціною: computed для списку, watch для збереження',
      description: `
**Завдання.** Напишіть \`PriceFilter.vue\` з пропом \`products\` (масив \`{ id, name, price }\`):
- \`<input type="range" class="max" min="0" max="1000" step="50">\`, прив'язаний до \`max\` через \`v-model.number\`;
- початкове \`max\` — число з \`localStorage.getItem('maxPrice')\`, а якщо там нічого немає — \`1000\`;
- \`<output>{{ max }}</output>\` і список \`<li>\` з назвами товарів, у яких \`price <= max\` (через \`computed\`);
- кожна зміна \`max\` зберігається: \`localStorage.setItem('maxPrice', String(max))\` — через \`watch\`;
- якщо нічого не підходить — \`<p class="empty">Нічого не знайдено</p>\` замість списку.

**Де трапляється:** фільтри каталогу, які мають пережити перезавантаження сторінки: діапазон ціни, вибраний розмір, сортування.

**Як це працює:** \`computed\` описує **похідне значення** (список, що відповідає фільтру): його не зберігають окремо, а обчислюють. \`watch\` — для **побічного ефекту** у відповідь на зміну: запис у \`localStorage\`, запит на сервер, аналітика. Правило: потрібне в шаблоні — \`computed\`; треба «щось зробити» — \`watch\`.

**Аналогія:** \`watch(max, …)\` — як \`useEffect(() => …, [max])\` у React, але без масиву залежностей і без запуску при першому рендері (для цього є \`{ immediate: true }\`).

**Врахуйте:** \`localStorage\` зберігає рядки — перетворіть на число; \`'0'\` у сховищі — валідне значення, його не можна підміняти на 1000.
`,
      html: HTML, css: CSS,
      js: `<!-- file: PriceFilter.vue -->
<script setup>
import { ref, computed, watch } from 'vue';
const props = defineProps({ products: { type: Array, default: () => [] } });
// 1. const saved = localStorage.getItem('maxPrice');  max = ref(saved === null ? 1000 : Number(saved))
// 2. visible = computed(() => товари з price <= max)
// 3. watch(max, (value) => localStorage.setItem('maxPrice', String(value)))
// TODO
</script>

<template>
  <div>
    <input type="range" class="max" min="0" max="1000" step="50">
    <output>1000</output>
    <ul>
      <li v-for="p in products" :key="p.id">{{ p.name }}</li>
    </ul>
  </div>
</template>

<!-- file: App.vue -->
<script setup>
import PriceFilter from './PriceFilter.vue';
const products = [
  { id: 1, name: 'Навушники', price: 300 },
  { id: 2, name: 'Клавіатура', price: 750 },
  { id: 3, name: 'Монітор', price: 950 },
];
</script>

<template>
  <PriceFilter :products="products" />
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: PriceFilter.vue -->
<script setup>
import { ref, computed, watch } from 'vue';
const props = defineProps({ products: { type: Array, default: () => [] } });

const saved = localStorage.getItem('maxPrice');           // рядок або null
const max = ref(saved === null ? 1000 : Number(saved));   // '0' лишається 0

// Похідне значення — computed, а не окремий стан.
const visible = computed(() => props.products.filter((p) => p.price <= max.value));

// Побічний ефект у відповідь на зміну — watch.
watch(max, (value) => localStorage.setItem('maxPrice', String(value)));
</script>

<template>
  <div>
    <input type="range" class="max" min="0" max="1000" step="50" v-model.number="max">
    <output>{{ max }}</output>
    <ul v-if="visible.length">
      <li v-for="p in visible" :key="p.id">{{ p.name }}</li>
    </ul>
    <p v-else class="empty">Нічого не знайдено</p>
  </div>
</template>

<!-- file: App.vue -->
<script setup>
import PriceFilter from './PriceFilter.vue';
const products = [
  { id: 1, name: 'Навушники', price: 300 },
  { id: 2, name: 'Клавіатура', price: 750 },
  { id: 3, name: 'Монітор', price: 950 },
];
</script>

<template>
  <PriceFilter :products="products" />
</template>
` },
      hints: [
        'Збережене значення читайте один раз при створенні: `localStorage.getItem(\'maxPrice\')` повертає рядок або `null` — перевіряйте саме `null`, щоб `\'0\'` не став 1000.',
        '`const visible = computed(() => props.products.filter((p) => p.price <= max.value))`; у шаблоні — `v-for="p in visible"` і `v-if`/`v-else` для порожнього стану.',
        '`watch(max, (value) => localStorage.setItem(\'maxPrice\', String(value)))` — колбек отримує нове значення.'
      ],
      tests: [
        { name: 'початкове значення: 1000 або збережене', code: "localStorage.clear();\nconst items = [{ id: 1, name: 'A', price: 300 }, { id: 2, name: 'B', price: 750 }];\nconst m1 = mount(PriceFilter, { products: items });\nexpect(m1.container.querySelector('output').textContent).toBe('1000');\nexpect(m1.container.querySelectorAll('li').length).toBe(2);\nm1.unmount();\nlocalStorage.setItem('maxPrice', '500');\nconst m2 = mount(PriceFilter, { products: items });\nexpect(m2.container.querySelector('output').textContent).toBe('500');\nexpect([...m2.container.querySelectorAll('li')].map((li) => li.textContent)).toEqual(['A']);\nm2.unmount();\nlocalStorage.clear();" },
        { name: 'повзунок фільтрує список і зберігає значення', code: "localStorage.clear();\nconst items = [{ id: 1, name: 'Навушники', price: 300 }, { id: 2, name: 'Клавіатура', price: 750 }, { id: 3, name: 'Монітор', price: 950 }];\nconst m = mount(PriceFilter, { products: items });\nawait typeInto(m.container.querySelector('.max'), '800');\nexpect(m.container.querySelector('output').textContent).toBe('800');\nexpect([...m.container.querySelectorAll('li')].map((li) => li.textContent)).toEqual(['Навушники', 'Клавіатура']);\nexpect(localStorage.getItem('maxPrice')).toBe('800');\nm.unmount();\nlocalStorage.clear();" },
        { name: 'порожній результат і 0 зі сховища', code: "localStorage.setItem('maxPrice', '0');\nconst m = mount(PriceFilter, { products: [{ id: 1, name: 'A', price: 300 }] });\nexpect(m.container.querySelector('output').textContent).toBe('0');\nexpect(m.container.querySelector('.empty').textContent).toBe('Нічого не знайдено');\nexpect(m.container.querySelector('ul')).toBe(null);\nm.unmount();\nlocalStorage.clear();" },
        { name: 'список похідний: нові пропи теж фільтруються', code: "localStorage.setItem('maxPrice', '400');\nconst m = mount(PriceFilter, { products: [{ id: 1, name: 'A', price: 300 }] });\nawait m.setProps({ products: [{ id: 1, name: 'A', price: 300 }, { id: 2, name: 'C', price: 100 }, { id: 3, name: 'D', price: 900 }] });\nexpect([...m.container.querySelectorAll('li')].map((li) => li.textContent)).toEqual(['A', 'C']);\nm.unmount();\nlocalStorage.clear();" }
      ],
      explanation: '`computed` перераховується сам, коли змінюються `max` чи `products`, тож список завжди узгоджений із даними. `watch` лише виконує дію назовні. **Типові помилки:** тримати відфільтрований список в окремому `ref` і оновлювати його у `watch` (дублювання стану, розсинхрон при зміні пропів); `Number(saved) || 1000` (губить 0); писати в `localStorage` усередині `computed` (він має бути чистим, без побічних ефектів).'
    },
    {
      id: 'vc-search', group: 'watchers', type: 'dom', runtime: 'vue', level: 3,
      title: 'Пошук: watch з debounce і скасуванням',
      description: `
**Завдання.** Напишіть \`SearchBox.vue\` з пропами \`search\` (функція \`(q, { signal }) => Promise<string[]>\`, обов'язкова) і \`delay\` (число, за замовчуванням 300):
- поле \`<input v-model="query">\`; \`watch(query, …)\`:
  - порожній запит (після \`trim\`) → результати \`[]\`, статус \`idle\`, без виклику \`search\`;
  - інакше — через \`delay\` мс викликати \`search(текст, { signal })\` (debounce: кожна нова літера скасовує попередній таймер);
  - \`onWatcherCleanup\` очищує таймер і викликає \`abort()\` попереднього запиту — відповідь застарілого запиту **не** потрапляє в результати;
- \`<p class="status">\`: \`Шукаю…\` під час запиту, \`Нічого не знайдено\` для порожнього результату, \`Помилка пошуку\` при помилці;
- \`<ul>\` з \`<li>\` для результатів.

**Де трапляється:** живий пошук у каталозі чи автокомпліт адрес: запит після паузи, а застарілі запити скасовуються.

**Аналогія:** \`useEffect\` з cleanup і AbortController з модуля «Хуки» React; debounce з модуля «Функції». Тут \`onWatcherCleanup\` (Vue 3.5) — «cleanup попереднього запуску».
`,
      html: HTML, css: CSS,
      js: `<!-- file: SearchBox.vue -->
<script setup>
import { ref, watch, onWatcherCleanup } from 'vue';
const props = defineProps({
  search: { type: Function, required: true },
  delay: { type: Number, default: 300 }
});
const query = ref('');
const results = ref([]);
const status = ref('idle'); // idle | loading | done | error
// TODO: watch(query, (q) => { … onWatcherCleanup(…) })
</script>

<template>
  <div>
    <input v-model="query" placeholder="Пошук міста">
    <p class="status"></p>
    <ul></ul>
  </div>
</template>

<!-- file: App.vue -->
<script setup>
import SearchBox from './SearchBox.vue';
const cities = ['Київ', 'Львів', 'Луцьк', 'Одеса', 'Харків', 'Херсон'];
function search(q, { signal }) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => resolve(cities.filter((c) => c.toLowerCase().includes(q.toLowerCase()))), 400);
    signal.addEventListener('abort', () => { clearTimeout(id); reject(new DOMException('Скасовано', 'AbortError')); });
  });
}
</script>

<template>
  <SearchBox :search="search" />
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: SearchBox.vue -->
<script setup>
import { ref, watch, onWatcherCleanup } from 'vue';
const props = defineProps({
  search: { type: Function, required: true },
  delay: { type: Number, default: 300 }
});
const query = ref('');
const results = ref([]);
const status = ref('idle'); // idle | loading | done | error

watch(query, (q) => {
  const text = q.trim();
  if (!text) {
    results.value = [];
    status.value = 'idle';
    return;
  }
  const controller = new AbortController();
  const timer = setTimeout(async () => {
    status.value = 'loading';
    try {
      const list = await props.search(text, { signal: controller.signal });
      if (controller.signal.aborted) return;
      results.value = list;
      status.value = 'done';
    } catch (e) {
      if (!controller.signal.aborted) status.value = 'error';
    }
  }, props.delay);
  onWatcherCleanup(() => {
    clearTimeout(timer);
    controller.abort();
  });
});
</script>

<template>
  <div>
    <input v-model="query" placeholder="Пошук міста">
    <p class="status">
      <template v-if="status === 'loading'">Шукаю…</template>
      <template v-else-if="status === 'error'">Помилка пошуку</template>
      <template v-else-if="status === 'done' && !results.length">Нічого не знайдено</template>
    </p>
    <ul><li v-for="r in results" :key="r">{{ r }}</li></ul>
  </div>
</template>

<!-- file: App.vue -->
<script setup>
import SearchBox from './SearchBox.vue';
const cities = ['Київ', 'Львів', 'Луцьк', 'Одеса', 'Харків', 'Херсон'];
function search(q, { signal }) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => resolve(cities.filter((c) => c.toLowerCase().includes(q.toLowerCase()))), 400);
    signal.addEventListener('abort', () => { clearTimeout(id); reject(new DOMException('Скасовано', 'AbortError')); });
  });
}
</script>

<template>
  <SearchBox :search="search" />
</template>
` },
      hints: [
        'Усередині watch: `const controller = new AbortController(); const timer = setTimeout(async () => { … }, props.delay);`',
        '`onWatcherCleanup(() => { clearTimeout(timer); controller.abort(); })` викликайте **синхронно** в колбеку watch (до будь-якого await); після await перевіряйте `controller.signal.aborted`.'
      ],
      tests: [
        { name: 'debounce: один запит на останній текст', code: "const search = mockFn(() => Promise.resolve(['Київ']));\nconst m = mount(SearchBox, { search, delay: 20 });\nconst field = m.container.querySelector('input');\nawait typeInto(field, 'К');\nawait typeInto(field, 'Ки');\nawait typeInto(field, 'Киї');\nawait settle(50);\nexpect(search).toHaveBeenCalledTimes(1);\nexpect(search.mock.calls[0][0]).toBe('Киї');\nexpect([...m.container.querySelectorAll('li')].map((l) => l.textContent)).toEqual(['Київ']);" },
        { name: 'застаріла відповідь не потрапляє в результати', code: "const signals = [];\nconst search = (q, { signal }) => { signals.push(signal); return new Promise((r) => setTimeout(() => r([q + '!']), q === 'a' ? 60 : 5)); };\nconst m = mount(SearchBox, { search, delay: 5 });\nconst field = m.container.querySelector('input');\nawait typeInto(field, 'a');\nawait settle(15);\nexpect(m.container.querySelector('.status').textContent.trim()).toBe('Шукаю…');\nawait typeInto(field, 'ab');\nawait settle(100);\nexpect(signals[0].aborted).toBe(true);\nexpect([...m.container.querySelectorAll('li')].map((l) => l.textContent)).toEqual(['ab!']);" },
        { name: 'порожній запит і порожній результат', code: "const search = mockFn(() => Promise.resolve([]));\nconst m = mount(SearchBox, { search, delay: 5 });\nconst field = m.container.querySelector('input');\nawait typeInto(field, '   ');\nawait settle(20);\nexpect(search).not.toHaveBeenCalled();\nawait typeInto(field, 'zz');\nawait settle(20);\nexpect(m.container.querySelector('.status').textContent.trim()).toBe('Нічого не знайдено');" },
        { name: 'помилка', code: "const m = mount(SearchBox, { search: () => Promise.reject(new Error('500')), delay: 5 });\nawait typeInto(m.container.querySelector('input'), 'x');\nawait settle(20);\nexpect(m.container.querySelector('.status').textContent.trim()).toBe('Помилка пошуку');" }
      ],
      explanation: '`onWatcherCleanup` виконується перед наступним запуском колбека і при зупинці watcher-а (розмонтування компонента) — той самий контракт, що cleanup у `useEffect`. До Vue 3.5 — третій аргумент колбека: `watch(src, (v, old, onCleanup) => …)`. Watcher, створений синхронно в setup, зупиняється автоматично при розмонтуванні.'
    },
    {
      id: 'vc-quiz-watch-flush', group: 'watchers', type: 'quiz', level: 3,
      title: 'Що бачить watch у DOM',
      question: `
\`p\` — template ref на \`<p>{{ n }}</p>\`, \`n\` змінюється з 0 на 1. Що виведуть колбеки?

\`\`\`js
watch(n, () => console.log('A:' + p.value.textContent));
watch(n, () => console.log('B:' + p.value.textContent), { flush: 'post' });
\`\`\`
`,
      options: [
        '`A:0`, `B:1` — за замовчуванням watch до оновлення DOM',
        '`A:1`, `B:1` — DOM оновлюється синхронно',
        '`A:0`, `B:0` — watch завжди бачить старий DOM',
        '`A:1`, `B:0` — flush: post виконується першим'
      ],
      answer: 0,
      why: [
        'Так: перевірено на Vue 3.5 — «pre:0», «post:1».',
        'Ні: оновлення DOM асинхронне.',
        'Ні: flush: \'post\' — після оновлення DOM.',
        'Ні: post — після оновлення компонента.'
      ],
      hint: 'flush: \'pre\' (за замовчуванням), \'post\', \'sync\' — відносно оновлення компонента.',
      explanation: '`flush: \'post\'` (або `watchPostEffect`) — коли в колбеку потрібен оновлений DOM: виміряти розмір, прокрутити до нового повідомлення. `flush: \'sync\'` — синхронно при кожній зміні, без батчингу (рідко, обережно). Аналогія з React: `useLayoutEffect`/`useEffect` теж виконуються після commit.'
    },
    {
      id: 'vc-watch-theory', group: 'watchers', type: 'theory', level: 3, interview: true,
      title: 'computed, watch, watchEffect: що коли',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Похідне значення — `computed`; побічна дія у відповідь на зміну (запит, localStorage, аналітика) — `watch`/`watchEffect`',
        '`watchEffect` виконується одразу і сам відстежує все, що прочитав; `watch` — лінивий і має явне джерело',
        '`watch(() => state.user, cb)` спрацює при зміні `state.user.name`',
        '`watch(reactiveObj, cb)` за замовчуванням глибокий',
        'watch, створений після `await` у звичайній функції або в setTimeout, автоматично зупиниться при розмонтуванні'
      ],
      correct: [0, 1, 3],
      why: [
        'Так: computed — чисте обчислення з кешем, watch — для ефектів.',
        'Так: watch має доступ до старого значення і опції immediate/once.',
        'Ні: getter, що повертає той самий об\'єкт, — неглибоке джерело (перевірено: не спрацював); потрібен `{ deep: true }` або getter `() => state.user.name`.',
        'Так: перевірено — «deep-source» спрацював на вкладену зміну.',
        'Ні: автозупинка — лише для watcher-ів, створених синхронно в setup; інакше зберігайте `const stop = watch(…)` і викликайте `stop()`.'
      ],
      hint: 'Що саме є джерелом: ref, getter чи reactive-об\'єкт?',
      answer: `
\`\`\`js
watch(id, async (newId, oldId) => { user.value = await fetchUser(newId); }, { immediate: true });
watch(() => props.filters.page, loadPage);              // getter — конкретна властивість
watch([a, b], ([na, nb], [oa, ob]) => {});              // кілька джерел
watch(settings, save, { deep: true });                  // або deep: 1 — глибина (3.5)
watch(token, cb, { once: true });                       // одноразово (3.4)
watchEffect(() => { document.title = title.value; });   // залежності — усе прочитане
\`\`\`
| | Коли | Залежності | Старе значення |
|---|---|---|---|
| \`computed\` | ліниво, при читанні | автоматично | — |
| \`watch\` | при зміні джерела (або \`immediate\`) | явно | є |
| \`watchEffect\` | одразу + при змінах | автоматично (лише прочитане **синхронно** до першого \`await\`) | — |

**Пастки:** мутація стану в \`computed\`; \`watch\` для того, що має бути \`computed\` (зайвий стан і рендер — як «ефект для синхронізації стану» в React); асинхронний \`watchEffect\` не відстежує читання після \`await\`.
`,
      keyPoints: ['computed — значення, watch — ефект', 'watchEffect — авто-залежності', 'Getter об\'єкта неглибокий', 'reactive-джерело глибоке', 'Автозупинка лише в синхронному setup']
    },
    // ---------------------------------------------------------------- lifecycle
    {
      id: 'vc-dropdown', group: 'lifecycle', type: 'dom', runtime: 'vue', level: 3,
      title: 'Випадне меню: template refs, клік поза, фокус',
      description: `
**Завдання.** Напишіть \`Dropdown.vue\` з пропом \`items\` (масив рядків), що емітить \`select\`:
- корінь \`<div class="dropdown">\` (template ref), кнопка \`<button class="toggle" aria-haspopup="true" :aria-expanded>\` перемикає меню;
- відкрите меню — \`<ul class="menu">\` з \`<li><button>…</button></li>\`; після відкриття фокус на **першому** пункті (template ref + \`nextTick\`);
- клік по пункту → \`emit('select', item)\` і закрити;
- **клік поза** компонентом закриває меню: слухач \`click\` на \`document\` додається в \`onMounted\` і знімається в \`onUnmounted\`;
- \`Escape\` закриває меню й повертає фокус на кнопку.

**Де трапляється:** меню профілю, вибір мови, контекстні меню: закриття кліком поза меню, клавішею Escape і повернення фокусу.

**Аналогія:** \`useRef\` + \`useEffect\` з cleanup у React; делегування і \`contains\` — модуль «Події»; керування фокусом — модуль «Доступність».
`,
      html: HTML, css: CSS,
      js: `<!-- file: Dropdown.vue -->
<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
defineProps({ items: { type: Array, required: true } });
const emit = defineEmits(['select']);
const open = ref(false);
const root = ref(null);
const toggleBtn = ref(null);
const menu = ref(null);
// TODO: toggle (фокус на перший пункт), choose, onKeydown, клік поза (onMounted/onUnmounted)
</script>

<template>
  <div class="dropdown">
    <button class="toggle" aria-haspopup="true">Дії ▾</button>
    <ul class="menu">
      <li v-for="item in items" :key="item"><button>{{ item }}</button></li>
    </ul>
  </div>
</template>

<!-- file: App.vue -->
<script setup>
import Dropdown from './Dropdown.vue';
function onSelect(action) { console.log('обрано:', action); }
</script>

<template>
  <Dropdown :items="['Редагувати', 'Дублювати', 'Видалити']" @select="onSelect" />
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: Dropdown.vue -->
<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
defineProps({ items: { type: Array, required: true } });
const emit = defineEmits(['select']);
const open = ref(false);
const root = ref(null);
const toggleBtn = ref(null);
const menu = ref(null);

async function toggle() {
  open.value = !open.value;
  if (open.value) {
    await nextTick();
    menu.value.querySelector('button').focus();
  }
}
function choose(item) {
  emit('select', item);
  open.value = false;
}
function onKeydown(e) {
  if (e.key === 'Escape' && open.value) {
    open.value = false;
    toggleBtn.value.focus();
  }
}
function onDocumentClick(e) {
  if (open.value && !root.value.contains(e.target)) open.value = false;
}
onMounted(() => document.addEventListener('click', onDocumentClick));
onUnmounted(() => document.removeEventListener('click', onDocumentClick));
</script>

<template>
  <div class="dropdown" ref="root" @keydown="onKeydown">
    <button ref="toggleBtn" class="toggle" aria-haspopup="true" :aria-expanded="open" @click="toggle">Дії ▾</button>
    <ul v-if="open" ref="menu" class="menu">
      <li v-for="item in items" :key="item"><button @click="choose(item)">{{ item }}</button></li>
    </ul>
  </div>
</template>

<!-- file: App.vue -->
<script setup>
import Dropdown from './Dropdown.vue';
function onSelect(action) { console.log('обрано:', action); }
</script>

<template>
  <Dropdown :items="['Редагувати', 'Дублювати', 'Видалити']" @select="onSelect" />
</template>
` },
      hints: [
        'Template ref: `const menu = ref(null)` + `ref="menu"` в шаблоні (або `useTemplateRef(\'menu\')`). Після `open.value = true` — `await nextTick()`, потім `menu.value.querySelector(\'button\').focus()`.',
        'Клік поза: `if (open.value && !root.value.contains(e.target)) open.value = false;` — слухач додати в `onMounted`, зняти в `onUnmounted`.'
      ],
      tests: [
        { name: 'відкриття і фокус на першому пункті', code: "const m = mount(Dropdown, { items: ['a', 'b'] });\nconst btn = m.container.querySelector('.toggle');\nexpect(m.container.querySelector('.menu')).toBeNull();\nclick(btn);\nawait settle(0);\nexpect(btn.getAttribute('aria-expanded')).toBe('true');\nexpect(document.activeElement.textContent).toBe('a');\nm.unmount();" },
        { name: 'вибір пункту', code: "const onSelect = mockFn();\nconst m = mount(Dropdown, { items: ['a', 'b'], onSelect });\nclick(m.container.querySelector('.toggle'));\nawait settle(0);\nclick(m.container.querySelectorAll('.menu button')[1]);\nawait nextTick();\nexpect(onSelect).toHaveBeenCalledWith('b');\nexpect(m.container.querySelector('.menu')).toBeNull();\nm.unmount();" },
        { name: 'клік поза і Escape', code: "const m = mount(Dropdown, { items: ['a'] });\nconst btn = m.container.querySelector('.toggle');\nclick(btn);\nawait settle(0);\nclick(m.container.querySelector('.menu'));\nawait nextTick();\nexpect(m.container.querySelector('.menu')).toBeTruthy();\nclick(document.body);\nawait nextTick();\nexpect(m.container.querySelector('.menu')).toBeNull();\nclick(btn);\nawait settle(0);\npress(document.activeElement, 'Escape');\nawait nextTick();\nexpect(m.container.querySelector('.menu')).toBeNull();\nexpect(document.activeElement).toBe(btn);\nm.unmount();" },
        { name: 'слухач знімається при розмонтуванні', code: "const removed = [];\nconst orig = document.removeEventListener;\ndocument.removeEventListener = function (type, fn, o) { removed.push(type); return orig.call(this, type, fn, o); };\nconst m = mount(Dropdown, { items: ['a'] });\nm.unmount();\ndocument.removeEventListener = orig;\nexpect(removed).toContain('click');" }
      ],
      explanation: 'Template ref заповнюється після монтування (у setup він `null`), а для елемента під `v-if` — після оновлення DOM, тому `nextTick`. Без зняття слухача кожен змонтований/розмонтований Dropdown залишав би обробник на document — витік пам\'яті й помилки (`root.value` уже `null`). У Vue 3.5 зручніше `useTemplateRef(\'menu\')`; готові composables — `onClickOutside`, `useFocusTrap` з VueUse.'
    },
    {
      id: 'vc-quiz-lifecycle-order', group: 'lifecycle', type: 'quiz', level: 2,
      title: 'Порядок onMounted батька і дитини',
      question: 'Батько `App` рендерить дочірній `Child`, обидва логують в `onMounted`. Що виведеться першим?',
      options: [
        '`child mounted`, бо батько змонтований лише з дітьми',
        '`parent mounted`: батько завжди раніше за дітей',
        'Порядок випадковий і залежить від браузера',
        'Обидва одночасно, одним повідомленням'
      ],
      answer: 0,
      why: [
        'Так: перевірено — parent setup → parent beforeMount → child setup → child beforeMount → child mounted → parent mounted.',
        'Ні: setup і beforeMount батька — раніше, але mounted — пізніше.',
        'Ні: порядок детермінований.',
        'Ні: це окремі виклики.'
      ],
      hint: 'Коли DOM батька можна вважати готовим?',
      explanation: 'У `onMounted` батька DOM дітей уже існує — можна звертатися до template refs дітей. Розмонтування: `child unmounted`, потім `parent unmounted` (перевірено). Той самий порядок у React: ефекти дітей виконуються раніше за ефекти батька.'
    },
    {
      id: 'vc-lifecycle-theory', group: 'lifecycle', type: 'theory', level: 2, interview: true,
      title: 'Хуки життєвого циклу і template refs',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'У `<script setup>` template ref ще `null`; DOM доступний в `onMounted`',
        '`onMounted` не викликається під час SSR — браузерні API (window, document) використовують у ньому',
        'Хуки життєвого циклу можна реєструвати в setTimeout усередині setup',
        '`onUnmounted` — місце для зняття слухачів, таймерів, підписок',
        '`onErrorCaptured` дозволяє батькові перехопити помилку нащадка — аналог Error Boundary'
      ],
      correct: [0, 1, 3, 4],
      why: [
        'Так: setup виконується до рендеру.',
        'Так: на сервері немає DOM і монтування.',
        'Ні: хуки реєструються синхронно в setup — Vue прив\'язує їх до поточного екземпляра.',
        'Так: інакше витоки пам\'яті.',
        'Так: повернення false зупиняє поширення помилки.'
      ],
      hint: 'Що існує під час виконання setup, а що з\'являється пізніше?',
      answer: `
| Хук | Коли | Аналог у React |
|---|---|---|
| \`setup\` (тіло \`<script setup>\`) | один раз, до рендеру | тіло компонента (але в React — щоразу) |
| \`onBeforeMount\` / \`onMounted\` | до / після вставки в DOM | \`useLayoutEffect\` / \`useEffect\` з \`[]\` |
| \`onBeforeUpdate\` / \`onUpdated\` | до / після оновлення DOM | ефект без залежностей |
| \`onBeforeUnmount\` / \`onUnmounted\` | до / після видалення | cleanup ефекту |
| \`onActivated\` / \`onDeactivated\` | показ/приховування в \`<KeepAlive>\` | — (\`<Activity>\` у React 19.2) |
| \`onErrorCaptured\` | помилка нащадка | Error Boundary |

**Template refs:**
\`\`\`vue
<script setup>
import { useTemplateRef, onMounted } from 'vue';
const input = useTemplateRef('search');        // Vue 3.5; раніше: const search = ref(null)
onMounted(() => input.value.focus());
</script>
<template><input ref="search"></template>
\`\`\`
Ref на компоненті дає його публічний екземпляр — лише те, що компонент відкрив через \`defineExpose\`. Ref у \`v-for\` — масив елементів.
`,
      keyPoints: ['setup до рендеру, один раз', 'DOM — в onMounted', 'onMounted не на сервері', 'Cleanup в onUnmounted', 'onErrorCaptured ≈ Error Boundary']
    },
    // ---------------------------------------------------------------- composables
    {
      id: 'vc-use-fetch', group: 'composables', type: 'dom', runtime: 'vue', level: 3,
      title: 'Composable useFetch у окремому файлі',
      description: `
**Завдання.** У файлі \`useFetch.js\` напишіть composable \`useFetch(url)\`:
- \`url\` — рядок, ref **або** getter (\`() => '/api/users/' + props.id\`); значення читайте через \`toValue(url)\`;
- повертає **refs** \`{ data, error, loading }\` (не reactive-об'єкт — щоб деструктуризація не ламала реактивність);
- завантажує одразу і при кожній зміні url (\`watch(() => toValue(url), …, { immediate: true })\`);
- \`fetch\` зі \`signal\`; \`!response.ok\` → \`error\` = \`'HTTP ' + status\`; попередній запит скасовується через \`onWatcherCleanup\`, тож застаріла відповідь не перезаписує нову.

**Де трапляється:** завантаження даних у компонентах: той самий composable перевикористовують десятки сторінок (як \`useFetch\` у Nuxt і VueUse).

Компонент \`UserCard.vue\` уже використовує його.

**Аналогія:** власний хук \`useFetch\` з React, але без масиву залежностей: \`toValue\` + \`watch\` самі відстежують, від чого залежить url.
`,
      html: HTML, css: CSS,
      js: `<!-- file: useFetch.js -->
import { ref, watch, toValue, onWatcherCleanup } from 'vue';

export function useFetch(url) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(false);
  // TODO: watch(() => toValue(url), …, { immediate: true }) з AbortController
  return { data, error, loading };
}

<!-- file: UserCard.vue -->
<script setup>
import { useFetch } from './useFetch.js';
const props = defineProps({ id: { type: Number, required: true } });
const { data, error, loading } = useFetch(() => '/api/users/' + props.id);
</script>

<template>
  <p v-if="loading" class="loading">Завантаження…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <h3 v-else-if="data">{{ data.name }}</h3>
</template>

<!-- file: App.vue -->
<script setup>
import { ref } from 'vue';
import UserCard from './UserCard.vue';
const id = ref(1);
</script>

<template>
  <button @click="id++">Наступний користувач ({{ id }})</button>
  <UserCard :id="id" />
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: useFetch.js -->
import { ref, watch, toValue, onWatcherCleanup } from 'vue';

export function useFetch(url) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(false);

  watch(() => toValue(url), async (current) => {
    const controller = new AbortController();
    onWatcherCleanup(() => controller.abort());
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(current, { signal: controller.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if (!controller.signal.aborted) data.value = json;
    } catch (e) {
      if (!controller.signal.aborted) error.value = e.message;
    } finally {
      if (!controller.signal.aborted) loading.value = false;
    }
  }, { immediate: true });

  return { data, error, loading };
}

<!-- file: UserCard.vue -->
<script setup>
import { useFetch } from './useFetch.js';
const props = defineProps({ id: { type: Number, required: true } });
const { data, error, loading } = useFetch(() => '/api/users/' + props.id);
</script>

<template>
  <p v-if="loading" class="loading">Завантаження…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <h3 v-else-if="data">{{ data.name }}</h3>
</template>

<!-- file: App.vue -->
<script setup>
import { ref } from 'vue';
import UserCard from './UserCard.vue';
const id = ref(1);
</script>

<template>
  <button @click="id++">Наступний користувач ({{ id }})</button>
  <UserCard :id="id" />
</template>
` },
      hints: [
        '`watch(() => toValue(url), async (current) => { const controller = new AbortController(); onWatcherCleanup(() => controller.abort()); … }, { immediate: true })` — `onWatcherCleanup` до першого `await`.',
        'Після кожного `await` перевіряйте `controller.signal.aborted`, перш ніж записувати `data`/`error`/`loading`.'
      ],
      tests: [
        { name: 'завантаження і дані', code: "mockFetch((url) => ({ body: { name: 'User ' + url.split('/').pop() }, delay: 10 }));\nconst m = mount(UserCard, { id: 7 });\nawait nextTick();\nexpect(m.container.querySelector('.loading')).toBeTruthy();\nawait settle(30);\nexpect(m.container.querySelector('h3').textContent).toBe('User 7');" },
        { name: 'помилка HTTP', code: "mockFetch(() => ({ status: 404, body: {} }));\nconst m = mount(UserCard, { id: 1 });\nawait settle(20);\nexpect(m.container.querySelector('.error').textContent).toBe('HTTP 404');" },
        { name: 'зміна id: застаріла відповідь не перезаписує нову', code: "mockFetch((url) => url.endsWith('/1') ? { body: { name: 'Перший' }, delay: 60 } : { body: { name: 'Другий' }, delay: 5 });\nconst m = mount(UserCard, { id: 1 });\nawait settle(5);\nawait m.setProps({ id: 2 });\nawait settle(100);\nexpect(m.container.querySelector('h3').textContent).toBe('Другий');" },
        { name: 'приймає ref і рядок', code: "mockFetch((url) => ({ body: { name: url } }));\nconst src = Vue.ref('/a');\nlet api;\nconst C = { setup() { api = useFetch(src); return () => null; } };\nconst m = mount(C);\nawait settle(10);\nexpect(api.data.value.name).toBe('/a');\nsrc.value = '/b';\nawait settle(10);\nexpect(api.data.value.name).toBe('/b');\nexpect(Vue.isRef(api.loading)).toBe(true);" }
      ],
      explanation: 'Конвенції composables: назва `use…`; приймати `MaybeRefOrGetter` і читати через `toValue`; повертати об\'єкт з refs; викликати синхронно в setup (тоді watch і хуки прив\'язуються до компонента й зупиняються з ним). Повноцінний серверний стан у Vue — TanStack Query (`@tanstack/vue-query`) або Pinia Colada; у Nuxt — `useFetch`.'
    },
    {
      id: 'vc-quiz-composable-reactive', group: 'composables', type: 'quiz', level: 3,
      title: 'Composable повертає reactive',
      question: `
Чи оновлюватиметься \`{{ x }}\` при русі миші?

\`\`\`js
function useMouse() {
  const pos = reactive({ x: 0, y: 0 });
  window.addEventListener('mousemove', (e) => { pos.x = e.pageX; pos.y = e.pageY; });
  return pos;
}
const { x, y } = useMouse();
\`\`\`
`,
      options: [
        'Ні: деструктуризація reactive дає копії чисел',
        'Так: composables завжди зберігають реактивність',
        'Так, але лише якщо додати `await nextTick()`',
        'Ні, бо `mousemove` не працює в setup'
      ],
      answer: 0,
      why: [
        'Так: той самий механізм, що в квізі «Деструктуризація reactive» модуля «Основи».',
        'Ні: реактивність Proxy не переживає копіювання примітивів.',
        'Ні: nextTick не відновить зв\'язок.',
        'Ні: слухач працює, проблема в деструктуризації.'
      ],
      hint: 'Що отримують `x` і `y` при деструктуризації Proxy?',
      explanation: 'Рішення: повертати refs (`const x = ref(0)`) або `toRefs(pos)`. Ще одна вада цього коду — слухач ніколи не знімається: потрібен `onUnmounted(() => window.removeEventListener(...))` (у VueUse — `useEventListener` знімає сам).'
    },
    {
      id: 'vc-composables-theory', group: 'composables', type: 'theory', level: 3, interview: true,
      title: 'Composables проти хуків React і міксинів',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Composable викликається один раз у setup, тому в ньому немає застарілих замикань і масивів залежностей',
        'Composables можна викликати в умовах, бо Vue не зіставляє їх за порядком викликів',
        'Міксини (Options API) мали проблеми: неявне джерело властивостей і конфлікти імен — composables їх розв\'язують',
        'Кожен виклик composable створює новий незалежний стан; спільний стан — змінна поза функцією або Pinia',
        'Composable можна викликати в обробнику кліку, щоб створити новий стан під час роботи компонента'
      ],
      correct: [0, 1, 2, 3],
      why: [
        'Так: setup не перезапускається, функції бачать актуальні refs.',
        'Так: технічно можна (умовний виклик у setup), хоча зазвичай не потрібно; хуки життєвого циклу всередині мають викликатись синхронно в setup.',
        'Так: `const { x } = useMouse()` — явно видно, звідки x.',
        'Так: модульна змінна = глобальний синглтон (обережно з SSR).',
        'Ні: хуки й watch усередині не прив\'яжуться до компонента — composables викликають синхронно в setup.'
      ],
      hint: 'Чим відрізняється «функція, що викликається один раз» від «функції на кожен рендер»?',
      answer: `
| | Хук React | Composable Vue |
|---|---|---|
| Коли викликається | на кожен рендер | один раз у setup |
| Залежності | масиви, лінтер | автоматично (реактивність) |
| Замикання | можуть застаріти | завжди актуальні refs |
| Порядок викликів | суворо фіксований | не важливий для стану |
| Повертає | значення, сеттери | refs, функції |

**Як писати:**
- приймати \`MaybeRefOrGetter<T>\` і читати через \`toValue()\`;
- повертати звичайний об'єкт з refs (деструктуризація без втрат);
- побічні ефекти прибирати (\`onUnmounted\`, \`onScopeDispose\` — працює й поза компонентом в \`effectScope\`);
- готова бібліотека — **VueUse** (\`useStorage\`, \`useDebounceFn\`, \`useIntersectionObserver\`, \`onClickOutside\`…).
`,
      keyPoints: ['Один виклик у setup', 'Без масивів залежностей', 'Замість міксинів', 'Новий стан на виклик', 'VueUse']
    },
    // ---------------------------------------------------------------- provide
    {
      id: 'vc-theme-provide', group: 'provide', type: 'dom', runtime: 'vue', level: 3,
      title: 'provide/inject: тема з ключем-символом',
      description: `
**Завдання.** У файлі \`theme.js\`:
- \`export const ThemeKey = Symbol('theme')\`;
- \`export function useTheme()\` — \`inject(ThemeKey)\`; якщо провайдера немає — \`throw new Error('useTheme поза ThemeProvider')\`.

**Де трапляється:** тема, локалізація, налаштування дизайн-системи — так Vuetify й Element Plus передають конфігурацію вглиб дерева.

У \`ThemeProvider.vue\`: стан \`theme\` (\`'light'\`/\`'dark'\`), \`provide(ThemeKey, { theme: readonly(theme), toggle })\`, обгортка \`<div :class="theme">\` зі слотом.

\`ThemeButton.vue\` уже написаний.

**Аналогія:** \`createContext\` + \`useContext\` + хук, що кидає помилку поза провайдером (патерн з модуля «Хуки» React). \`readonly\` — щоб споживачі не змінювали стан повз \`toggle\` (одне джерело змін).
`,
      html: HTML, css: CSS,
      js: `<!-- file: theme.js -->
import { inject } from 'vue';
// TODO: ThemeKey, useTheme

<!-- file: ThemeProvider.vue -->
<script setup>
import { ref, readonly, provide } from 'vue';
import { ThemeKey } from './theme.js';
// TODO: theme, toggle, provide
</script>

<template>
  <div><slot /></div>
</template>

<!-- file: ThemeButton.vue -->
<script setup>
import { useTheme } from './theme.js';
const { theme, toggle } = useTheme();
</script>

<template>
  <button @click="toggle">Тема: {{ theme }}</button>
</template>

<!-- file: App.vue -->
<script setup>
import ThemeProvider from './ThemeProvider.vue';
import ThemeButton from './ThemeButton.vue';
</script>

<template>
  <ThemeProvider>
    <p>Будь-яка глибина вкладеності:</p>
    <ThemeButton />
  </ThemeProvider>
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: theme.js -->
import { inject } from 'vue';
export const ThemeKey = Symbol('theme');
export function useTheme() {
  const ctx = inject(ThemeKey, null);
  if (!ctx) throw new Error('useTheme поза ThemeProvider');
  return ctx;
}

<!-- file: ThemeProvider.vue -->
<script setup>
import { ref, readonly, provide } from 'vue';
import { ThemeKey } from './theme.js';
const theme = ref('light');
function toggle() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
}
provide(ThemeKey, { theme: readonly(theme), toggle });
</script>

<template>
  <div :class="theme"><slot /></div>
</template>

<!-- file: ThemeButton.vue -->
<script setup>
import { useTheme } from './theme.js';
const { theme, toggle } = useTheme();
</script>

<template>
  <button @click="toggle">Тема: {{ theme }}</button>
</template>

<!-- file: App.vue -->
<script setup>
import ThemeProvider from './ThemeProvider.vue';
import ThemeButton from './ThemeButton.vue';
</script>

<template>
  <ThemeProvider>
    <p>Будь-яка глибина вкладеності:</p>
    <ThemeButton />
  </ThemeProvider>
</template>
` },
      hints: ['`export const ThemeKey = Symbol(\'theme\')`; `const ctx = inject(ThemeKey, null); if (!ctx) throw new Error(...)`.', 'У провайдері: `provide(ThemeKey, { theme: readonly(theme), toggle })` і `<div :class="theme"><slot /></div>`.'],
      tests: [
        { name: 'перемикання через провайдер', code: "const m = mount(App);\nconst btn = m.container.querySelector('button');\nexpect(btn.textContent).toBe('Тема: light');\nexpect(m.container.querySelector('.light')).toBeTruthy();\nclick(btn);\nawait nextTick();\nexpect(btn.textContent).toBe('Тема: dark');\nexpect(m.container.querySelector('.dark')).toBeTruthy();" },
        { name: 'поза провайдером — помилка', code: "let msg = '';\ntry { mount(ThemeButton); } catch (e) { msg = e.message; }\nexpect(msg).toBe('useTheme поза ThemeProvider');" },
        { name: 'стан доступний лише для читання', code: "let ctx;\nconst Spy = { setup() { ctx = useTheme(); return () => null; } };\nmount(ThemeProvider, {}, { default: () => Vue.h(Spy) });\nexpect(typeof ThemeKey).toBe('symbol');\nexpect(Vue.isReadonly(ctx.theme)).toBe(true);\nctx.toggle();\nexpect(ctx.theme.value).toBe('dark');" }
      ],
      explanation: 'Ключ-символ виключає конфлікти імен між бібліотеками; у TS — `InjectionKey<{ theme: Readonly<Ref<string>>; toggle(): void }>` дає типізований inject. `provide` реактивний, якщо передати ref/reactive. На відміну від React Context, зміна значення оновлює лише ті компоненти, що реально **читають** `theme`. Для глобального стану застосунку — Pinia; `app.provide()` — для залежностей на рівні застосунку (API-клієнт, i18n).'
    },
    {
      id: 'vc-modal-teleport', group: 'provide', type: 'dom', runtime: 'vue', level: 3,
      title: 'Модальне вікно з Teleport',
      description: `
**Завдання.** Напишіть \`Modal.vue\` з пропами \`open\` (булеве) і \`title\` (рядок), що емітить \`close\`:
- \`<Teleport to="body">\` → \`<div v-if="open" class="backdrop" @click.self="emit('close')">\` → \`<div class="modal" role="dialog" aria-modal="true" :aria-label="title">\` з \`<h2>\`, слотом і кнопкою \`Закрити\`;
- клік по затемненню (але **не** всередині вікна) і кнопка → \`close\`;
- \`Escape\` → \`close\`, лише поки вікно відкрите: слухач \`keydown\` на \`document\` у \`watch(() => props.open, …, { immediate: true })\` з \`onWatcherCleanup\`.

**Де трапляється:** модалки, тости й тултіпи, які мають рендеритися в \`body\`, поза \`overflow: hidden\` і z-index батьків.

**Аналогія:** \`createPortal\` з модуля «React глибше». Модифікатор \`.self\` — обробник лише якщо \`e.target === e.currentTarget\` (модуль «Події»).
`,
      html: HTML, css: CSS,
      js: `<!-- file: Modal.vue -->
<script setup>
import { watch, onWatcherCleanup } from 'vue';
const props = defineProps({ open: Boolean, title: { type: String, default: '' } });
const emit = defineEmits(['close']);
// TODO: Escape-слухач, поки open
</script>

<template>
  <!-- TODO: Teleport у body -->
</template>

<!-- file: App.vue -->
<script setup>
import { ref } from 'vue';
import Modal from './Modal.vue';
const open = ref(false);
</script>

<template>
  <div style="overflow: hidden; height: 40px">
    <button @click="open = true">Відкрити</button>
    <Modal :open="open" title="Підтвердження" @close="open = false">
      <p>Видалити файл?</p>
    </Modal>
  </div>
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: Modal.vue -->
<script setup>
import { watch, onWatcherCleanup } from 'vue';
const props = defineProps({ open: Boolean, title: { type: String, default: '' } });
const emit = defineEmits(['close']);
watch(() => props.open, (isOpen) => {
  if (!isOpen) return;
  const onKey = (e) => { if (e.key === 'Escape') emit('close'); };
  document.addEventListener('keydown', onKey);
  onWatcherCleanup(() => document.removeEventListener('keydown', onKey));
}, { immediate: true });
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="backdrop" @click.self="emit('close')">
      <div class="modal" role="dialog" aria-modal="true" :aria-label="title">
        <h2>{{ title }}</h2>
        <slot />
        <button @click="emit('close')">Закрити</button>
      </div>
    </div>
  </Teleport>
</template>

<!-- file: App.vue -->
<script setup>
import { ref } from 'vue';
import Modal from './Modal.vue';
const open = ref(false);
</script>

<template>
  <div style="overflow: hidden; height: 40px">
    <button @click="open = true">Відкрити</button>
    <Modal :open="open" title="Підтвердження" @close="open = false">
      <p>Видалити файл?</p>
    </Modal>
  </div>
</template>
` },
      hints: ['`<Teleport to="body"><div v-if="open" class="backdrop" @click.self="emit(\'close\')">…</div></Teleport>`.', 'Escape: `watch(() => props.open, (isOpen) => { if (!isOpen) return; document.addEventListener(\'keydown\', onKey); onWatcherCleanup(() => document.removeEventListener(\'keydown\', onKey)); }, { immediate: true })`.'],
      tests: [
        { name: 'рендер у body', code: "const m = mount(Modal, { open: true, title: 'T' }, { default: () => 'вміст' });\nconst dialog = document.querySelector('[role=dialog]');\nexpect(dialog).toBeTruthy();\nexpect(m.container.contains(dialog)).toBe(false);\nexpect(dialog.parentElement.parentElement).toBe(document.body);\nexpect(dialog.getAttribute('aria-label')).toBe('T');\nm.unmount();\nexpect(document.querySelector('[role=dialog]')).toBeNull();" },
        { name: 'затемнення закриває, вміст — ні', code: "const onClose = mockFn();\nconst m = mount(Modal, { open: true, title: 'T', onClose });\nclick(document.querySelector('.modal h2'));\nexpect(onClose).not.toHaveBeenCalled();\nclick(document.querySelector('.backdrop'));\nclick(document.querySelector('.modal button'));\nexpect(onClose).toHaveBeenCalledTimes(2);\nm.unmount();" },
        { name: 'Escape лише коли відкрито', code: "const onClose = mockFn();\nconst m = mount(Modal, { open: false, title: 'T', onClose });\npress(document.body, 'Escape');\nexpect(onClose).not.toHaveBeenCalled();\nawait m.setProps({ open: true });\npress(document.body, 'Escape');\nexpect(onClose).toHaveBeenCalledTimes(1);\nawait m.setProps({ open: false });\npress(document.body, 'Escape');\nexpect(onClose).toHaveBeenCalledTimes(1);\nm.unmount();" }
      ],
      explanation: '`<Teleport>` переносить DOM, але компонент лишається в дереві Vue: props, події, provide/inject працюють як завжди. `:disabled="isMobile"` вимикає перенесення. Повноцінна модалка ще керує фокусом (перенос усередину, повернення, focus trap або `inert`) і блокує прокрутку; нативна альтернатива — `<dialog>` + `showModal()`.'
    },
    {
      id: 'vc-builtins-theory', group: 'provide', type: 'theory', level: 3,
      title: 'Вбудовані компоненти: KeepAlive, Transition, Suspense, async-компоненти',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        '`<KeepAlive>` кешує екземпляри перемиканих компонентів: стан зберігається, викликаються onActivated/onDeactivated',
        '`<Transition>` додає CSS-класи `v-enter-from`, `v-enter-active`, `v-leave-to`… на вхід/вихід елемента з `v-if`/`v-show`',
        '`defineAsyncComponent(() => import(\'./Chart.vue\'))` вантажить компонент окремим чанком при першому рендері',
        '`provide`/`inject` передає дані лише безпосереднім дітям',
        '`<TransitionGroup>` анімує вставку, видалення і переміщення елементів списку'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: `include`/`exclude`/`max` керують кешем.',
        'Так: або JS-хуки `@enter`/`@leave`.',
        'Так: аналог `React.lazy`.',
        'Ні: будь-якій глибині нащадків.',
        'Так: клас `v-move` для FLIP-анімації переміщень.'
      ],
      hint: 'Які з цих компонентів керують життєвим циклом, а які — анімаціями чи завантаженням?',
      answer: `
| Компонент | Для чого | Аналог у React |
|---|---|---|
| \`<Teleport to="body">\` | рендер в інше місце DOM | \`createPortal\` |
| \`<KeepAlive>\` | кеш екземплярів (вкладки, кроки майстра) | \`<Activity>\` (19.2) |
| \`<Transition>\` / \`<TransitionGroup>\` | CSS/JS-анімації входу/виходу/переміщення | бібліотеки (Motion) |
| \`<Suspense>\` | очікування async setup і async-компонентів (усе ще експериментальний) | \`<Suspense>\` |
| \`defineAsyncComponent\` | ліниве завантаження компонента | \`lazy\` |

**Директиви оптимізації:** \`v-once\` (відрендерити один раз), \`v-memo="[deps]"\` (пропустити оновлення піддерева, поки залежності не змінились — для дуже великих списків).

**Власні директиви:** \`const vFocus = { mounted: (el) => el.focus() }\` → \`<input v-focus>\` — для низькорівневої роботи з DOM.
`,
      keyPoints: ['KeepAlive — кеш стану', 'Transition — класи входу/виходу', 'defineAsyncComponent ≈ lazy', 'Suspense експериментальний', 'v-once, v-memo']
    },
    // ---------------------------------------------------------------- reactivity-deep
    {
      id: 'vc-mini-reactivity', group: 'reactivity-deep', type: 'code', level: 4,
      title: 'Своя реактивність Vue: reactive, effect, computed',
      description: `
**Завдання.** Реалізуйте ядро реактивності Vue 3:
- \`reactive(obj)\` → Proxy; \`get\` викликає \`track(target, key)\`, \`set\` (якщо значення змінилось, \`Object.is\`) — \`trigger(target, key)\`; вкладені об'єкти обгортаються **ліниво** при читанні; той самий об'єкт → той самий Proxy (кеш у \`WeakMap\`);
- \`effect(fn)\` — виконує \`fn\` одразу і повторно при зміні будь-якої властивості, яку \`fn\` прочитала під час **останнього** запуску; перед кожним запуском залежності очищуються (умовні гілки);
- \`computed(getter)\` → \`{ get value() }\`: лінивий (getter не викликається до першого читання), кешує результат, перераховує лише після зміни залежностей; ефект, що читає \`computed.value\`, перезапускається, коли computed змінився.

**Де трапляється:** так працюють \`@vue/reactivity\`, MobX і сигнали в Solid та Angular. На співбесідах з Vue часто просять пояснити механізм або написати спрощену версію.

Структура залежностей: \`WeakMap<target, Map<key, Set<effect>>>\`.

**Аналогія:** у модулі «Сучасний JS» ваш observable сповіщав про **будь-яку** зміну; тут система знає, **хто** від чого залежить, — саме так Vue вирішує, який компонент перерендерити.
`,
      starter: `const targetMap = new WeakMap();
let activeEffect = null;

function track(target, key) {
  // TODO: записати activeEffect у targetMap[target][key]
}

function trigger(target, key) {
  // TODO: перезапустити ефекти, що залежать від target[key]
}

function reactive(obj) {
  // TODO: Proxy з get/set, лінива глибина, кеш Proxy
}

function effect(fn) {
  // TODO: запуск з очищенням залежностей
}

function computed(getter) {
  // TODO: лінивий кеш з прапорцем dirty
}
`,
      solution: `const targetMap = new WeakMap();
const proxyCache = new WeakMap();
let activeEffect = null;

function track(target, key) {
  if (!activeEffect) return;
  let deps = targetMap.get(target);
  if (!deps) targetMap.set(target, (deps = new Map()));
  let dep = deps.get(key);
  if (!dep) deps.set(key, (dep = new Set()));
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

function trigger(target, key) {
  const dep = targetMap.get(target)?.get(key);
  if (!dep) return;
  [...dep].forEach((eff) => (eff.scheduler ? eff.scheduler() : eff.run()));
}

function reactive(obj) {
  if (proxyCache.has(obj)) return proxyCache.get(obj);
  const proxy = new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key);
      const value = Reflect.get(target, key, receiver);
      return value !== null && typeof value === 'object' ? reactive(value) : value;
    },
    set(target, key, value, receiver) {
      const old = target[key];
      const ok = Reflect.set(target, key, value, receiver);
      if (!Object.is(old, value)) trigger(target, key);
      return ok;
    }
  });
  proxyCache.set(obj, proxy);
  return proxy;
}

function createEffect(fn, scheduler) {
  const eff = {
    deps: [],
    scheduler,
    run() {
      eff.deps.forEach((dep) => dep.delete(eff));
      eff.deps = [];
      const prev = activeEffect;
      activeEffect = eff;
      try { return fn(); } finally { activeEffect = prev; }
    }
  };
  return eff;
}

function effect(fn) {
  const eff = createEffect(fn);
  eff.run();
  return eff;
}

function computed(getter) {
  let value;
  let dirty = true;
  const self = {};
  const eff = createEffect(getter, () => {
    if (!dirty) {
      dirty = true;
      trigger(self, 'value');
    }
  });
  Object.defineProperty(self, 'value', {
    get() {
      track(self, 'value');
      if (dirty) {
        value = eff.run();
        dirty = false;
      }
      return value;
    }
  });
  return self;
}
`,
      hints: [
        'Ефект — об\'єкт `{ run, deps }`: `run` знімає себе з усіх `deps`, ставить `activeEffect = eff`, викликає `fn`, відновлює попередній `activeEffect` (вкладені ефекти).',
        '`computed`: внутрішній ефект з **scheduler**: замість перерахунку лише ставить `dirty = true` і викликає `trigger(self, \'value\')`; у getter-і `value` — `track(self, \'value\')` і перерахунок, якщо dirty.'
      ],
      tests: [
        { name: 'effect: одразу і при зміні', code: "const s = reactive({ n: 1, other: 0 });\nconst seen = [];\neffect(() => seen.push(s.n));\ns.n = 2;\ns.other = 5;\ns.n = 2;\nexpect(seen).toEqual([1, 2]);" },
        { name: 'вкладені об\'єкти і кеш Proxy', code: "const raw = { user: { name: 'a' } };\nconst s = reactive(raw);\nexpect(reactive(raw)).toBe(s);\nexpect(s.user).toBe(s.user);\nconst seen = [];\neffect(() => seen.push(s.user.name));\ns.user.name = 'b';\nexpect(seen).toEqual(['a', 'b']);\nexpect(raw.user.name).toBe('b');" },
        { name: 'умовні залежності очищуються', code: "const s = reactive({ ok: true, text: 'hi' });\nlet runs = 0;\neffect(() => { runs++; return s.ok ? s.text : 'off'; });\ns.ok = false;\nconst after = runs;\ns.text = 'changed';\nexpect(runs).toBe(after);\nexpect(runs).toBe(2);" },
        { name: 'computed: лінивий і кешований', code: "const s = reactive({ a: 1 });\nlet calls = 0;\nconst c = computed(() => { calls++; return s.a * 2; });\nexpect(calls).toBe(0);\nexpect(c.value).toBe(2);\nexpect(c.value).toBe(2);\nexpect(calls).toBe(1);\ns.a = 5;\nexpect(calls).toBe(1);\nexpect(c.value).toBe(10);\nexpect(calls).toBe(2);" },
        { name: 'ефект залежить від computed', code: "const s = reactive({ a: 1 });\nconst c = computed(() => s.a + 1);\nconst seen = [];\neffect(() => seen.push(c.value));\ns.a = 10;\nexpect(seen).toEqual([2, 11]);" }
      ],
      explanation: 'Це спрощена `@vue/reactivity`: справжня ще відстежує `has`/`deleteProperty`/ітерацію (`ownKeys`), масиви й колекції, планує ефекти компонентів у чергу (батчинг, nextTick), а з Vue 3.4/3.5 використовує версіонування й двозв\'язні списки для швидкості. Той самий принцип — у MobX, Solid, Preact Signals і Angular Signals.'
    },
    {
      id: 'vc-quiz-shallow', group: 'reactivity-deep', type: 'quiz', level: 3,
      title: 'shallowRef і зміна вкладеного поля',
      question: `
Чи оновиться \`{{ s.n }}\` після \`mutate()\`?

\`\`\`js
const s = shallowRef({ n: 0 });
function mutate() { s.value.n++; }
\`\`\`
`,
      options: [
        'Ні: shallowRef реагує лише на заміну `.value`',
        'Так: shallowRef відстежує вкладені поля',
        'Так, але з затримкою в один кадр',
        'Помилка: об\'єкт у shallowRef заморожений'
      ],
      answer: 0,
      why: [
        'Так: перевірено — після mutate 0, після `triggerRef(s)` — 1.',
        'Ні: це робить звичайний `ref`.',
        'Ні: оновлення не буде взагалі.',
        'Ні: об\'єкт звичайний, просто не реактивний.'
      ],
      hint: 'Що означає «shallow»?',
      explanation: '`shallowRef` / `shallowReactive` / `markRaw` — для великих або сторонніх об\'єктів (дані графіка на 100 000 точок, екземпляр карти), щоб не обгортати кожен вкладений об\'єкт у Proxy. Оновлення — заміною: `s.value = { ...s.value, n: s.value.n + 1 }` або `triggerRef(s)`.'
    },
    {
      id: 'vc-reactivity-internals', group: 'reactivity-deep', type: 'theory', level: 4, interview: true,
      title: 'Реактивність Vue зсередини',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Vue 2 використовував Object.defineProperty і не помічав додавання нових властивостей та зміни масиву за індексом — Proxy у Vue 3 це виправив',
        'Зміни стану не оновлюють DOM одразу: ефекти рендеру ставляться в чергу і виконуються в мікрозадачі (nextTick)',
        '`toRaw(proxy)` повертає оригінальний об\'єкт без відстеження',
        'Шаблон перерендерює всі компоненти застосунку при будь-якій зміні стану',
        'Компілятор шаблонів позначає статичні вузли і динамічні прив\'язки (patch flags), щоб diff пропускав незмінне'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: звідси `Vue.set` у Vue 2.',
        'Так: батчинг.',
        'Так: для передачі в сторонні бібліотеки чи порівнянь.',
        'Ні: оновлюються лише компоненти, чиї render-ефекти прочитали змінене значення.',
        'Так: «compiler-informed virtual DOM».'
      ],
      hint: 'Як Vue знає, які компоненти залежать від зміненого значення?',
      answer: `
**Конвеєр оновлення:**
1. запис у Proxy → \`trigger\` → render-ефекти залежних компонентів у черзі;
2. мікрозадача → кожен компонент у черзі виконує render-функцію → новий VDOM;
3. patch, оптимізований компілятором: статичні вузли винесені (hoisted), динамічні позначені флагами — порівнюються лише вони (block tree).

**Порівняння:**
| | Vue 3 | React | Signals (Solid, Angular) |
|---|---|---|---|
| Хто оновлюється | залежні компоненти | компонент і діти | конкретні вузли DOM |
| Механізм | Proxy + VDOM | перерендер + reconciliation | граф сигналів без VDOM |

**Vapor Mode** (Vue 3.6, наразі на стадії RC) — opt-in режим компіляції без VDOM: шаблон компілюється в пряму роботу з DOM, як у Solid.

**Інструменти:** \`isRef\`, \`unref\`, \`toRef\`, \`toRefs\`, \`isReactive\`, \`readonly\`, \`markRaw\`, \`effectScope\` (групування ефектів для одночасної зупинки — так Pinia керує сторами).
`,
      keyPoints: ['Proxy замість defineProperty', 'Черга і nextTick', 'Оновлюються залежні компоненти', 'Compiler-informed VDOM', 'Vapor Mode (3.6)']
    }
  ]
});
})();
