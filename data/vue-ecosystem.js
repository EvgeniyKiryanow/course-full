(function () {
const HTML = '<div id="root"></div>';
const CSS = `body { font-family: system-ui, sans-serif; padding: 12px; }
button { padding: 4px 10px; margin: 2px; }
nav a { margin-right: 8px; }
nav a[aria-current="page"] { font-weight: 700; }
.badge { display: inline-block; padding: 4px 8px; border-radius: 999px; background: #42b883; color: #fff; }
.admin { background: #c0392b; }`;

const PINIA_GIVEN = `<!-- file: stores.js -->
import { ref, computed } from 'vue';
import { defineStore } from './pinia.js';

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);
  const count = computed(() => items.value.reduce((s, i) => s + i.qty, 0));
  const total = computed(() => items.value.reduce((s, i) => s + i.qty * i.price, 0));
  function add(product) {
    const found = items.value.find((i) => i.id === product.id);
    if (found) found.qty++;
    else items.value.push({ ...product, qty: 1 });
  }
  function clear() { items.value = []; }
  return { items, count, total, add, clear };
});

<!-- file: CartBadge.vue -->
<script setup>
import { storeToRefs } from './pinia.js';
import { useCartStore } from './stores.js';
const cart = useCartStore();
const { count, total } = storeToRefs(cart);
</script>

<template>
  <span class="badge">{{ count }} шт · {{ total }} ₴</span>
</template>

<!-- file: ProductList.vue -->
<script setup>
import { useCartStore } from './stores.js';
const cart = useCartStore();
const products = [{ id: 1, title: 'Чашка', price: 120 }, { id: 2, title: 'Блокнот', price: 80 }];
</script>

<template>
  <ul>
    <li v-for="p in products" :key="p.id">{{ p.title }} — {{ p.price }} ₴ <button @click="cart.add(p)">У кошик</button></li>
  </ul>
</template>

<!-- file: App.vue -->
<script setup>
import { createPinia, setActivePinia } from './pinia.js';
import CartBadge from './CartBadge.vue';
import ProductList from './ProductList.vue';
setActivePinia(createPinia());
</script>

<template>
  <header>Кошик: <CartBadge /></header>
  <ProductList />
</template>
`;

const ROUTER_GIVEN = `<!-- file: routes.js -->
import { h, reactive } from 'vue';
import { useRoute, useRouter } from './router.js';

export const auth = reactive({ loggedIn: false });
const Home = { setup: () => () => h('h1', 'Головна') };
const Login = {
  setup() {
    const router = useRouter();
    return () => h('div', [
      h('h1', 'Вхід'),
      h('button', { class: 'login', onClick: () => { auth.loggedIn = true; router.push('/admin'); } }, 'Увійти')
    ]);
  }
};
const Admin = { setup: () => () => h('h1', 'Адмінка') };
const User = { setup() { const route = useRoute(); return () => h('h1', 'Користувач ' + route.value.params.id); } };
const NotFound = { setup: () => () => h('h1', '404') };

export const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/admin', component: Admin, meta: { requiresAuth: true } },
  { path: '/users/:id', component: User },
  { path: '*', component: NotFound }
];

<!-- file: RouterView.vue -->
<script setup>
import { inject } from 'vue';
import { RouterKey } from './router.js';
const router = inject(RouterKey);
</script>

<template>
  <component v-if="router.currentRoute.value.component" :is="router.currentRoute.value.component" />
</template>

<!-- file: RouterLink.vue -->
<script setup>
import { inject, computed } from 'vue';
import { RouterKey } from './router.js';
const props = defineProps({ to: { type: String, required: true } });
const router = inject(RouterKey);
const active = computed(() => router.currentRoute.value.path === props.to);
</script>

<template>
  <a :href="to" :aria-current="active ? 'page' : undefined" @click.prevent="router.push(to)"><slot /></a>
</template>

<!-- file: App.vue -->
<script setup>
import { provide } from 'vue';
import { createRouter, RouterKey } from './router.js';
import { routes, auth } from './routes.js';
import RouterView from './RouterView.vue';
import RouterLink from './RouterLink.vue';
const router = createRouter({ routes });
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.loggedIn) return '/login';
});
provide(RouterKey, router);
router.push('/');
</script>

<template>
  <nav>
    <RouterLink to="/">Головна</RouterLink>
    <RouterLink to="/admin">Адмінка</RouterLink>
    <RouterLink to="/users/42">Користувач 42</RouterLink>
  </nav>
  <RouterView />
</template>
`;

const ROUTER_HEAD = `<!-- file: router.js -->
import { shallowRef, inject } from 'vue';

export const RouterKey = Symbol('router');

// Дано: '/users/:id' + '/users/42' → { id: '42' }; '*' — будь-який шлях; інакше null.
export function matchPath(pattern, path) {
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

export function useRouter() { return inject(RouterKey); }
export function useRoute() { return inject(RouterKey).currentRoute; }
`;

FE.topic('vue-ecosystem', {
  intro: `
**Екосистема Vue** офіційна й узгоджена: Pinia (стан), Vue Router (маршрути), Vite (збірка), Vitest + Vue Test Utils (тести), Nuxt (SSR-фреймворк), VueUse (composables). Як і в модулі «Екосистема React», ви пишете мінімальні версії інструментів — Pinia і роутер з guards — щоб справжні бібліотеки читалися як знайомий код.

| Задача | Vue | React |
|---|---|---|
| Глобальний стан | Pinia | Zustand, Redux Toolkit |
| Серверний стан | TanStack Query, Pinia Colada, Nuxt \`useFetch\` | TanStack Query |
| Маршрутизація | Vue Router | React Router |
| Тести компонентів | Vue Test Utils / Testing Library + Vitest | Testing Library + Vitest |
| SSR-фреймворк | Nuxt | Next.js |
`,
  groups: [
    { id: 'pinia', title: 'Pinia: стан застосунку' },
    { id: 'router', title: 'Vue Router' },
    { id: 'testing', title: 'Тестування Vue-компонентів' },
    { id: 'ts-migration', title: 'TypeScript, Options API і міграція' },
    { id: 'nuxt', title: 'Nuxt і вибір між Vue та React' }
  ],
  items: [
    // ---------------------------------------------------------------- pinia
    {
      id: 've-mini-pinia', group: 'pinia', type: 'dom', runtime: 'vue', level: 4,
      title: 'Своя Pinia: defineStore і storeToRefs',
      description: `
**Завдання.** У \`pinia.js\` реалізуйте ядро Pinia для setup-сторів:
- \`createPinia()\` → \`{ _s: new Map() }\` — реєстр сторів одного застосунку; \`setActivePinia(pinia)\` робить його активним;
- \`defineStore(id, setup)\` → функція \`useStore()\`: для активної Pinia створює стор **один раз** (\`reactive(setup())\` усередині \`effectScope(true)\`, щоб computed і watch стора не зупинились разом із компонентом), далі повертає той самий об'єкт; без активної Pinia — \`Error('Немає активної Pinia')\`;
- \`storeToRefs(store)\` → об'єкт refs (\`toRef(store, key)\`) для стану й getter-ів — лише для властивостей, що в оригінальному об'єкті (\`toRaw\`) є ref або reactive; функції (actions) пропускаються.

**Де трапляється:** Pinia — офіційний стор Vue. Як \`defineStore\` кешує стор і чому деструктуризація ламає реактивність — часті питання на співбесідах.

Стор кошика і компоненти вже написані (див. \`stores.js\`).

**Аналогія:** ваш \`createStore\` + \`useSyncExternalStore\` з модуля «Екосистема React» — тут реактивність Vue сама підписує компоненти, а Pinia лише гарантує **один екземпляр** стора на застосунок.
`,
      html: HTML, css: CSS,
      js: `<!-- file: pinia.js -->
import { reactive, effectScope, toRaw, toRef, isRef, isReactive } from 'vue';

let activePinia = null;

export function createPinia() {
  // TODO
}

export function setActivePinia(pinia) {
  // TODO
}

export function defineStore(id, setup) {
  // TODO: повернути useStore()
  return () => reactive(setup());
}

export function storeToRefs(store) {
  // TODO
  return {};
}

` + PINIA_GIVEN,
      editable: ['js'],
      solution: { js: `<!-- file: pinia.js -->
import { reactive, effectScope, toRaw, toRef, isRef, isReactive } from 'vue';

let activePinia = null;

export function createPinia() {
  return { _s: new Map() };
}

export function setActivePinia(pinia) {
  activePinia = pinia;
}

export function defineStore(id, setup) {
  function useStore() {
    const pinia = activePinia;
    if (!pinia) throw new Error('Немає активної Pinia');
    if (!pinia._s.has(id)) {
      const scope = effectScope(true);
      const store = scope.run(() => reactive(setup()));
      store.$id = id;
      store.$dispose = () => { scope.stop(); pinia._s.delete(id); };
      pinia._s.set(id, store);
    }
    return pinia._s.get(id);
  }
  useStore.$id = id;
  return useStore;
}

export function storeToRefs(store) {
  const raw = toRaw(store);
  const refs = {};
  for (const key of Object.keys(raw)) {
    const value = raw[key];
    if (isRef(value) || isReactive(value)) refs[key] = toRef(store, key);
  }
  return refs;
}

` + PINIA_GIVEN },
      hints: [
        '`useStore()`: `if (!pinia._s.has(id)) { const scope = effectScope(true); pinia._s.set(id, scope.run(() => reactive(setup()))); } return pinia._s.get(id);`',
        '`reactive()` розгортає refs: `store.count` — число. Але в `toRaw(store)` лежать оригінальні refs — за ними й визначайте, що перетворювати через `toRef(store, key)`.'
      ],
      tests: [
        { name: 'один стор на id', code: "setActivePinia(createPinia());\nconst a = useCartStore();\nconst b = useCartStore();\nexpect(a).toBe(b);\na.add({ id: 1, price: 10 });\na.add({ id: 1, price: 10 });\nexpect(b.count).toBe(2);\nexpect(b.total).toBe(20);" },
        { name: 'нова Pinia — новий стан; без Pinia — помилка', code: "setActivePinia(createPinia());\nuseCartStore().add({ id: 1, price: 10 });\nsetActivePinia(createPinia());\nexpect(useCartStore().count).toBe(0);\nsetActivePinia(null);\nexpect(() => useCartStore()).toThrow('Немає активної Pinia');" },
        { name: 'storeToRefs: refs для стану й getter-ів, без actions', code: "setActivePinia(createPinia());\nconst s = useCartStore();\nconst refs = storeToRefs(s);\nexpect(Object.keys(refs).sort()).toEqual(['count', 'items', 'total']);\nexpect(Vue.isRef(refs.count)).toBe(true);\ns.add({ id: 2, price: 5 });\nexpect(refs.count.value).toBe(1);\nexpect(refs.items.value.length).toBe(1);" },
        { name: 'компоненти ділять стор', code: "const m = mount(App);\nconst badge = () => m.container.querySelector('.badge').textContent;\nexpect(badge()).toBe('0 шт · 0 ₴');\nconst btns = m.container.querySelectorAll('li button');\nclick(btns[0]);\nclick(btns[1]);\nclick(btns[0]);\nawait nextTick();\nexpect(badge()).toBe('3 шт · 320 ₴');" },
        { name: 'стан переживає розмонтування компонента', code: "setActivePinia(createPinia());\nconst m = mount(ProductList);\nclick(m.container.querySelector('li button'));\nm.unmount();\nconst cart = useCartStore();\nexpect(cart.count).toBe(1);\ncart.add({ id: 9, price: 1 });\nexpect(cart.total).toBe(121);" }
      ],
      explanation: 'Справжня Pinia додатково: option-стори (`state`/`getters`/`actions`) з `$reset`, `$patch`, `$subscribe`, `$onAction`, плагіни (персистентність), інтеграцію з DevTools і HMR, SSR (окрема Pinia на кожен запит — тому `useStore()` викликають у setup, а не на рівні модуля). `app.use(pinia)` робить її активною і передає через provide.'
    },
    {
      id: 've-quiz-store-destructure', group: 'pinia', type: 'quiz', level: 2,
      title: 'Деструктуризація стора',
      question: `
Чи оновлюватиметься \`{{ total }}\` після \`add()\`?

\`\`\`js
const cart = useCartStore();
const { total, add } = cart;
\`\`\`
`,
      options: [
        'Ні: `total` скопійовано; `add` працює',
        'Так: Pinia робить деструктуризацію реактивною',
        'Ні, і `add` теж зламається, бо втратить `this`',
        'Так, але лише в option-сторах'
      ],
      answer: 0,
      why: [
        'Так: стор — reactive-об\'єкт; для стану і getter-ів — `storeToRefs(cart)`, actions можна брати напряму.',
        'Ні: це звичайна деструктуризація Proxy.',
        'Ні: actions прив\'язані до стора, `this` не потрібен.',
        'Ні: тип стора не має значення.'
      ],
      hint: 'Стор — це reactive-об\'єкт. Що ви знаєте про деструктуризацію reactive?',
      explanation: '`const { total } = storeToRefs(cart); const { add } = cart;` — канонічний патерн. Те саме ви реалізували в `storeToRefs`.'
    },
    {
      id: 've-pinia-theory', group: 'pinia', type: 'theory', level: 3, interview: true,
      title: 'Pinia: option- і setup-стори',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Pinia — офіційний стейт-менеджер Vue, що замінив Vuex; у ньому немає mutations',
        'Setup-стор — це composable: `ref` → state, `computed` → getters, функції → actions',
        '`$reset()` доступний в option-сторах; для setup-стора його треба написати самому',
        'Стори можна використовувати лише в компонентах, а не в інших сторах чи guard-ах роутера',
        'У SSR кожен запит має власний екземпляр Pinia, щоб стан користувачів не змішувався'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: actions змінюють стан напряму, синхронно чи асинхронно.',
        'Так: обидва синтаксиси дають однаковий стор.',
        'Так: setup-стор не знає початкового стану.',
        'Ні: стор можна викликати в іншому сторі, у guard-ах (після встановлення Pinia), у composables.',
        'Так: модульна змінна на сервері була б спільною для всіх користувачів.'
      ],
      hint: 'Чим Pinia відрізняється від Vuex і від глобальної змінної?',
      answer: `
\`\`\`js
// option-стор
export const useCounter = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: { double: (s) => s.count * 2 },
  actions: { inc() { this.count++; }, async load() { this.count = await api.get(); } }
});
// setup-стор
export const useCounter = defineStore('counter', () => {
  const count = ref(0);
  const double = computed(() => count.value * 2);
  function inc() { count.value++; }
  return { count, double, inc };
});
\`\`\`
- \`store.$patch({ a: 1, b: 2 })\` або \`$patch((s) => { … })\` — кілька змін одним записом у DevTools;
- \`store.$subscribe((mutation, state) => localStorage.setItem(...))\` — реакція на зміни; \`$onAction\` — на виклики дій;
- плагіни: \`pinia.use(({ store }) => …)\` (наприклад, \`pinia-plugin-persistedstate\`);
- серверні дані краще тримати в TanStack Query / Pinia Colada / Nuxt \`useFetch\`, а не копіювати в стор.

**Vuex → Pinia:** немає mutations, плоскі модулі замість вкладених, повна підтримка TS, менше шаблонного коду.
`,
      keyPoints: ['Офіційна заміна Vuex', 'Option- і setup-стори', 'storeToRefs', '$patch, $subscribe, плагіни', 'Окрема Pinia на запит у SSR']
    },
    // ---------------------------------------------------------------- router
    {
      id: 've-router-guards', group: 'router', type: 'dom', runtime: 'vue', level: 3,
      title: 'Свій Vue Router: навігація і guards',
      description: `
**Завдання.** У \`router.js\` вже є \`matchPath\`, \`useRouter\`, \`useRoute\`. Реалізуйте \`createRouter({ routes })\` → \`{ currentRoute, push, beforeEach, resolve }\`:
- \`currentRoute\` — \`shallowRef\`, початково \`{ path: '', params: {}, meta: {}, component: null }\`;
- \`resolve(path)\` → перший маршрут, що збігся: \`{ path, params, meta (або {}), component }\`, інакше \`null\`;
- \`beforeEach(guard)\` додає guard і повертає функцію, що його видаляє;
- \`async push(path)\`: для знайденого маршруту по черзі \`await guard(to, from)\`:
  - \`false\` → навігацію скасовано, \`push\` повертає \`false\`;
  - рядок → **редирект** (\`push\` на цей шлях); більше 10 редиректів поспіль → \`Error('Забагато редиректів')\`;
  - інше → наступний guard;
  - усі пропустили → \`currentRoute.value = to\`, повернути \`true\`.

**Де трапляється:** сторінки лише для залогінених, редірект на логін і назад, підтвердження «є незбережені зміни» — guards у Vue Router.

App, сторінки, \`RouterView\` і \`RouterLink\` уже написані; App захищає \`/admin\` guard-ом.

**Аналогія:** ваш роутер з модуля «Екосистема React» + middleware-ланцюжок; guards у Vue Router працюють саме так (повертають \`false\`, шлях або нічого).
`,
      html: HTML, css: CSS,
      js: ROUTER_HEAD + `
export function createRouter({ routes }) {
  const currentRoute = shallowRef({ path: '', params: {}, meta: {}, component: null });
  // TODO: guards, resolve, push, beforeEach
  return { currentRoute, push: async () => false, beforeEach: () => () => {}, resolve: () => null };
}

` + ROUTER_GIVEN,
      editable: ['js'],
      solution: { js: ROUTER_HEAD + `
export function createRouter({ routes }) {
  const currentRoute = shallowRef({ path: '', params: {}, meta: {}, component: null });
  const guards = [];

  function resolve(path) {
    for (const r of routes) {
      const params = matchPath(r.path, path);
      if (params) return { path, params, meta: r.meta || {}, component: r.component };
    }
    return null;
  }

  async function push(path, redirects = 0) {
    if (redirects > 10) throw new Error('Забагато редиректів');
    const to = resolve(path);
    if (!to) return false;
    const from = currentRoute.value;
    for (const guard of [...guards]) {
      const result = await guard(to, from);
      if (result === false) return false;
      if (typeof result === 'string') return push(result, redirects + 1);
    }
    currentRoute.value = to;
    return true;
  }

  function beforeEach(guard) {
    guards.push(guard);
    return () => {
      const i = guards.indexOf(guard);
      if (i >= 0) guards.splice(i, 1);
    };
  }

  return { currentRoute, push, beforeEach, resolve };
}

` + ROUTER_GIVEN },
      hints: [
        '`resolve`: `for (const r of routes) { const params = matchPath(r.path, path); if (params) return { path, params, meta: r.meta || {}, component: r.component }; }`',
        '`push(path, redirects = 0)`: цикл `for (const guard of guards) { const result = await guard(to, from); if (result === false) return false; if (typeof result === \'string\') return push(result, redirects + 1); }`, потім `currentRoute.value = to`.'
      ],
      tests: [
        { name: 'resolve і параметри', code: "const r = createRouter({ routes });\nexpect(await r.push('/users/5')).toBe(true);\nexpect(r.currentRoute.value.path).toBe('/users/5');\nexpect(r.currentRoute.value.params).toEqual({ id: '5' });\nexpect(r.resolve('/admin').meta).toEqual({ requiresAuth: true });\nexpect(r.resolve('/').meta).toEqual({});\nawait r.push('/nope/x');\nexpect(r.currentRoute.value.component).toBe(routes[4].component);" },
        { name: 'guard: false, видалення, async-редирект', code: "const r = createRouter({ routes });\nawait r.push('/');\nconst off = r.beforeEach((to) => (to.path === '/admin' ? false : undefined));\nexpect(await r.push('/admin')).toBe(false);\nexpect(r.currentRoute.value.path).toBe('/');\noff();\nr.beforeEach(async (to) => { await new Promise((res) => setTimeout(res, 5)); if (to.path === '/admin') return '/login'; });\nawait r.push('/admin');\nexpect(r.currentRoute.value.path).toBe('/login');" },
        { name: 'guard отримує to і from', code: "const r = createRouter({ routes });\nawait r.push('/');\nconst calls = [];\nr.beforeEach((to, from) => { calls.push(from.path + '→' + to.path); });\nawait r.push('/users/1');\nexpect(calls).toEqual(['/→/users/1']);" },
        { name: 'нескінченний редирект', code: "const r = createRouter({ routes });\nr.beforeEach(() => '/login');\nlet err = '';\ntry { await r.push('/admin'); } catch (e) { err = e.message; }\nexpect(err).toBe('Забагато редиректів');" },
        { name: 'App: захищений маршрут і aria-current', code: "auth.loggedIn = false;\nconst m = mount(App);\nawait settle(0);\nconst h1 = () => m.container.querySelector('h1').textContent;\nconst links = m.container.querySelectorAll('nav a');\nexpect(h1()).toBe('Головна');\nexpect(links[0].getAttribute('aria-current')).toBe('page');\nclick(links[1]);\nawait settle(0);\nexpect(h1()).toBe('Вхід');\nclick(m.container.querySelector('.login'));\nawait settle(0);\nexpect(h1()).toBe('Адмінка');\nclick(links[2]);\nawait settle(0);\nexpect(h1()).toBe('Користувач 42');" }
      ],
      explanation: 'Справжній Vue Router: `createWebHistory()` (History API, потрібен fallback на сервері) або `createWebHashHistory()`; вкладені маршрути з `<RouterView>` на кожному рівні; іменовані маршрути й `query`; guards глобальні (`beforeEach`, `beforeResolve`, `afterEach`), на маршруті (`beforeEnter`) і в компоненті (`onBeforeRouteLeave` — «незбережені зміни»); ліниві компоненти `() => import(\'./Page.vue\')`; `scrollBehavior`. Перевірка прав у guard — лише UX: дані захищає сервер.'
    },
    {
      id: 've-quiz-param-reuse', group: 'router', type: 'quiz', level: 3,
      title: 'Перехід /users/1 → /users/2',
      question: 'Сторінка `UserPage` завантажує користувача в `onMounted` за `route.params.id`. Користувач переходить з `/users/1` на `/users/2`. Що станеться?',
      options: [
        'Компонент перевикористається, onMounted не повториться — дані лишаться старі',
        'Компонент змонтується заново, onMounted завантажить користувача 2',
        'Vue Router перезавантажить сторінку',
        'Помилка: два маршрути з однаковим компонентом'
      ],
      answer: 0,
      why: [
        'Так: той самий маршрут і компонент — Vue лише оновлює props/route (перевірено аналогічний випадок: «mounted 1», потім «updated 2»).',
        'Ні: перемонтування немає.',
        'Ні: це SPA-навігація.',
        'Ні: це той самий маршрут з іншим параметром.'
      ],
      hint: 'Чи змінився тип компонента на цій позиції дерева?',
      explanation: 'Рішення: `watch(() => route.params.id, load, { immediate: true })`, guard `onBeforeRouteUpdate`, або примусове перемонтування `<RouterView :key="route.fullPath" />`. У React той самий ефект: компонент на тій самій позиції зберігає стан, тому дані залежать від `id` в масиві залежностей ефекту або від `key`.'
    },
    {
      id: 've-router-theory', group: 'router', type: 'theory', level: 3,
      title: 'Vue Router: ключові можливості',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        '`createWebHistory()` дає «чисті» URL, але сервер має віддавати index.html для будь-якого шляху',
        '`useRoute()` повертає реактивний об\'єкт поточного маршруту (params, query, meta)',
        '`component: () => import(\'./Admin.vue\')` — ліниве завантаження: окремий чанк для маршруту',
        'Guard `beforeEach` виконується лише при першому завантаженні сторінки',
        '`<RouterLink>` додає класи `router-link-active` / `router-link-exact-active` і `aria-current="page"`'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: інакше пряме відкриття /users/42 — 404 від сервера.',
        'Так: на нього можна ставити watch.',
        'Так: route-based code splitting.',
        'Ні: при кожній навігації.',
        'Так: зручно для стилів і доступності.'
      ],
      hint: 'Що відбувається, коли користувач відкриває глибоке посилання напряму?',
      answer: `
\`\`\`js
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/users/:id(\\\\d+)', component: () => import('./UserPage.vue'), props: true },
    { path: '/admin', component: AdminLayout, meta: { requiresAuth: true },
      children: [{ path: 'reports', component: Reports }] },
    { path: '/:pathMatch(.*)*', component: NotFound }
  ],
  scrollBehavior: (to, from, saved) => saved || { top: 0 }
});
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !useAuthStore().isLoggedIn) return { name: 'login', query: { redirect: to.fullPath } };
});
app.use(router);
\`\`\`
- \`props: true\` — передає params як props (компонент не залежить від роутера, легше тестувати);
- \`router.push({ name, params, query })\`, \`router.replace\`, \`router.back()\`;
- в компоненті: \`onBeforeRouteLeave\` (незбережені зміни), \`onBeforeRouteUpdate\` (зміна params).
`,
      keyPoints: ['Web vs hash history', 'Реактивний useRoute', 'Ліниві маршрути', 'Guards на кожну навігацію', 'RouterLink і aria-current']
    },
    // ---------------------------------------------------------------- testing
    {
      id: 've-testing-theory', group: 'testing', type: 'theory', level: 3,
      title: 'Тестування: Vitest, Vue Test Utils, Testing Library',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        '`await wrapper.trigger(\'click\')` і `await wrapper.setValue(\'x\')` повертають проміс — чекають оновлення DOM',
        '`wrapper.emitted(\'select\')` повертає масив викликів події з аргументами',
        '`shallowMount` замінює дочірні компоненти заглушками — тест ізольований, але менш реалістичний',
        'Для компонентів зі стором у тесті не можна підключити Pinia',
        'Testing Library для Vue (`@testing-library/vue`) пропонує запити за ролями, як і для інших фреймворків'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: оновлення DOM асинхронне (nextTick).',
        'Так: `[[\'arg1\'], [\'arg2\']]`.',
        'Так: зручно для unit, але інтеграційні тести з `mount` ловлять більше.',
        'Ні: `global: { plugins: [createTestingPinia()] }` — стор з мок-діями.',
        'Так: ті самі `getByRole` і `user-event`, що для React чи Svelte.'
      ],
      hint: 'Що повертає trigger і навіщо його чекати?',
      answer: `
\`\`\`js
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

test('додає товар', async () => {
  const wrapper = mount(ProductCard, {
    props: { product: { id: 1, title: 'Чашка' } },
    global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
  });
  await wrapper.get('button').trigger('click');
  expect(wrapper.emitted('added')).toEqual([[1]]);
  expect(useCartStore().add).toHaveBeenCalledWith({ id: 1, title: 'Чашка' });
});
\`\`\`
- **Vitest** — раннер (сумісний з Jest API, працює через Vite);
- середовище — jsdom/happy-dom або **Vitest Browser Mode** (реальний браузер);
- роутер у тестах: реальний \`createRouter\` з \`createMemoryHistory()\`;
- мережа — **MSW**; E2E — **Playwright**;
- принцип той самий, що в React: перевіряти поведінку (DOM, події), а не внутрішній стан.

**Аналогія:** \`mount\`, \`nextTick\`, \`typeInto\` у цьому тренажері — спрощені версії саме цих API.
`,
      keyPoints: ['await trigger / setValue', 'emitted()', 'mount vs shallowMount', 'createTestingPinia', 'Поведінка, не реалізація']
    },
    {
      id: 've-quiz-await-trigger', group: 'testing', type: 'quiz', level: 2,
      title: 'Тест падає після кліку',
      question: `
Тест падає: «expected '0' to contain '1'». Чому?

\`\`\`js
const wrapper = mount(Counter);
wrapper.find('button').trigger('click');
expect(wrapper.text()).toContain('1');
\`\`\`
`,
      options: [
        'Немає `await`: DOM оновлюється асинхронно',
        'trigger не імітує кліки, потрібен `fireEvent`',
        'Лічильник не реактивний без `reactive()`',
        'wrapper.text() кешує вміст першого рендеру'
      ],
      answer: 0,
      why: [
        'Так: `await wrapper.find(\'button\').trigger(\'click\')` — те саме, що `await nextTick()` (перевірено: sync=0, afterTick=1).',
        'Ні: trigger відправляє подію.',
        'Ні: стан змінився, DOM ще ні.',
        'Ні: text() читає актуальний DOM.'
      ],
      hint: 'Згадайте квіз «Коли оновлюється DOM» з модуля «Основи».',
      explanation: 'Правило Vue Test Utils: чекати `trigger`, `setValue`, `setProps`. Для асинхронних даних (запити) — `await flushPromises()`. У Testing Library — `await user.click(...)` і `findBy*`.'
    },
    // ---------------------------------------------------------------- ts-migration
    {
      id: 've-ts-props', group: 'ts-migration', type: 'dom', runtime: 'vue', level: 2,
      title: '<script setup lang="ts">: типізовані props і emits',
      description: `
**Завдання.** Напишіть \`UserBadge.vue\` на TypeScript:
- \`interface Props { name: string; role?: 'admin' | 'user'; size?: number }\`;
- \`const { name, role = 'user', size = 32 } = defineProps<Props>()\` — реактивна деструктуризація props зі значеннями за замовчуванням (Vue 3.5);
- \`const emit = defineEmits<{ select: [name: string] }>()\`;
- \`initials\` (\`computed\`) — перші літери слів імені, великими;
- \`<button class="badge" :class="role" :title="name" :style="{ width: size + 'px', height: size + 'px' }">\` з ініціалами; клік → \`emit('select', name)\`.

**Де трапляється:** компоненти дизайн-систем і спільних бібліотек на Vue 3 + TypeScript: типи props і emits ловлять помилки ще в редакторі.

**Аналогія:** типи props у React (\`function UserBadge({ name, role = 'user' }: Props)\`) — тут компілятор Vue ще й генерує з інтерфейсу рантайм-перевірки.

**Зверніть увагу:** у тренажері типи лише прибираються (як в esbuild/Vite); у проєкті їх перевіряє \`vue-tsc --noEmit\`.
`,
      html: HTML, css: CSS,
      js: `<!-- file: UserBadge.vue -->
<script setup lang="ts">
import { computed } from 'vue';
// TODO: interface Props, defineProps<Props>() з деструктуризацією і дефолтами, defineEmits<…>(), initials
</script>

<template>
  <button class="badge">?</button>
</template>

<!-- file: App.vue -->
<script setup lang="ts">
import UserBadge from './UserBadge.vue';
function onSelect(name: string) { console.log('обрано', name); }
</script>

<template>
  <UserBadge name="Ann Lee" role="admin" :size="48" @select="onSelect" />
  <UserBadge name="bob" @select="onSelect" />
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: UserBadge.vue -->
<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  name: string;
  role?: 'admin' | 'user';
  size?: number;
}

const { name, role = 'user', size = 32 } = defineProps<Props>();
const emit = defineEmits<{ select: [name: string] }>();
const initials = computed(() =>
  name.split(/\\s+/).filter(Boolean).map((w) => w[0].toUpperCase()).join('')
);
</script>

<template>
  <button class="badge" :class="role" :title="name" :style="{ width: size + 'px', height: size + 'px' }" @click="emit('select', name)">{{ initials }}</button>
</template>

<!-- file: App.vue -->
<script setup lang="ts">
import UserBadge from './UserBadge.vue';
function onSelect(name: string) { console.log('обрано', name); }
</script>

<template>
  <UserBadge name="Ann Lee" role="admin" :size="48" @select="onSelect" />
  <UserBadge name="bob" @select="onSelect" />
</template>
` },
      hints: ['`const { name, role = \'user\', size = 32 } = defineProps<Props>();` — компілятор перетворить звернення до `name` на `__props.name`, тож реактивність зберігається.', '`const emit = defineEmits<{ select: [name: string] }>();` і `@click="emit(\'select\', name)"`.'],
      tests: [
        { name: 'значення за замовчуванням', code: "const m = mount(UserBadge, { name: 'ann lee' });\nconst b = m.container.querySelector('button');\nexpect(b.textContent).toBe('AL');\nexpect(b.className).toBe('badge user');\nexpect(b.style.width).toBe('32px');\nexpect(b.title).toBe('ann lee');" },
        { name: 'передані props і подія', code: "const onSelect = mockFn();\nconst m = mount(UserBadge, { name: 'Bob', role: 'admin', size: 48, onSelect });\nconst b = m.container.querySelector('button');\nexpect(b.className).toBe('badge admin');\nexpect(b.style.height).toBe('48px');\nclick(b);\nexpect(onSelect).toHaveBeenCalledWith('Bob');" },
        { name: 'деструктуризація реактивна', code: "const m = mount(UserBadge, { name: 'Ann' });\nawait m.setProps({ name: 'Zed Young' });\nexpect(m.container.querySelector('button').textContent).toBe('ZY');" }
      ],
      explanation: 'До Vue 3.5 значення за замовчуванням для type-based props задавали через `withDefaults(defineProps<Props>(), { role: \'user\' })`, а деструктуризація ламала реактивність. Типізація інших API: `ref<User | null>(null)`, `computed<number>(…)`, `useTemplateRef<HTMLInputElement>(\'el\')`, `InjectionKey<T>` для provide/inject, `defineSlots<…>()`, generic-компоненти `<script setup lang="ts" generic="T">`.'
    },
    {
      id: 've-options-to-composition', group: 'ts-migration', type: 'dom', runtime: 'vue', level: 3,
      title: 'Міграція: Options API → <script setup>',
      description: `
**Завдання.** \`ProductFilter.vue\` написаний на **Options API** (типовий легасі-код). Перепишіть його на \`<script setup>\` зі збереженням поведінки:
- \`data\` → \`ref\`; \`computed\` → \`computed\`; \`watch\` → \`watch\`; \`methods\` → функції; \`mounted\` + \`this.$refs\` → \`onMounted\` + template ref; \`$emit\` → \`defineEmits\`; \`props\` → \`defineProps\`;
- шаблон майже не змінюється.

**Де трапляється:** міграція легасі-проєктів з Vue 2 / Options API на \`<script setup>\` — типова задача в реальних командах.

Поведінка: фільтр за підрядком (без урахування регістру), пагінація по \`pageSize\` елементів, зміна фільтра повертає на сторінку 1, кнопки \`←\`/\`→\` не виходять за межі, клік по елементу емітить \`pick\`, поле фільтра отримує фокус після монтування.

**Аналогія:** перехід з класових компонентів React на хуки — та сама логіка, згрупована за змістом, а не за типом опції.
`,
      html: HTML, css: CSS,
      js: `<!-- file: ProductFilter.vue -->
<script>
export default {
  props: {
    products: { type: Array, required: true },
    pageSize: { type: Number, default: 2 }
  },
  emits: ['pick'],
  data() {
    return { query: '', page: 1 };
  },
  computed: {
    filtered() {
      const q = this.query.trim().toLowerCase();
      return this.products.filter((p) => p.toLowerCase().includes(q));
    },
    pages() {
      return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    },
    visible() {
      const start = (this.page - 1) * this.pageSize;
      return this.filtered.slice(start, start + this.pageSize);
    }
  },
  watch: {
    query() { this.page = 1; }
  },
  mounted() {
    this.$refs.search.focus();
  },
  methods: {
    next() { if (this.page < this.pages) this.page++; },
    prev() { if (this.page > 1) this.page--; }
  }
};
</script>

<template>
  <div>
    <input ref="search" v-model="query" placeholder="Фільтр">
    <ul><li v-for="p in visible" :key="p" @click="$emit('pick', p)">{{ p }}</li></ul>
    <button class="prev" @click="prev">←</button>
    <span class="page">{{ page }} / {{ pages }}</span>
    <button class="next" @click="next">→</button>
  </div>
</template>

<!-- file: App.vue -->
<script setup>
import ProductFilter from './ProductFilter.vue';
const products = ['Чашка', 'Чайник', 'Блокнот', 'Ручка', 'Чохол'];
</script>

<template>
  <ProductFilter :products="products" @pick="(p) => console.log(p)" />
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: ProductFilter.vue -->
<script setup>
import { ref, computed, watch, onMounted } from 'vue';
const props = defineProps({
  products: { type: Array, required: true },
  pageSize: { type: Number, default: 2 }
});
const emit = defineEmits(['pick']);
const query = ref('');
const page = ref(1);
const search = ref(null);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return props.products.filter((p) => p.toLowerCase().includes(q));
});
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / props.pageSize)));
const visible = computed(() => {
  const start = (page.value - 1) * props.pageSize;
  return filtered.value.slice(start, start + props.pageSize);
});

watch(query, () => { page.value = 1; });
onMounted(() => search.value.focus());

function next() { if (page.value < pages.value) page.value++; }
function prev() { if (page.value > 1) page.value--; }
</script>

<template>
  <div>
    <input ref="search" v-model="query" placeholder="Фільтр">
    <ul><li v-for="p in visible" :key="p" @click="emit('pick', p)">{{ p }}</li></ul>
    <button class="prev" @click="prev">←</button>
    <span class="page">{{ page }} / {{ pages }}</span>
    <button class="next" @click="next">→</button>
  </div>
</template>

<!-- file: App.vue -->
<script setup>
import ProductFilter from './ProductFilter.vue';
const products = ['Чашка', 'Чайник', 'Блокнот', 'Ручка', 'Чохол'];
</script>

<template>
  <ProductFilter :products="products" @pick="(p) => console.log(p)" />
</template>
` },
      hints: ['`this.query` → `const query = ref(\'\')` і `query.value` у скрипті; `this.products` → `props.products`; `this.$refs.search` → `const search = ref(null)` з тим самим `ref="search"` у шаблоні.', '`watch: { query() {…} }` → `watch(query, () => { page.value = 1; })`; `mounted()` → `onMounted(() => search.value.focus())`; `$emit` → `const emit = defineEmits([\'pick\'])`.'],
      tests: [
        { name: 'компонент на Composition API', code: "expect(typeof ProductFilter.setup).toBe('function');\nexpect(ProductFilter.data).toBeUndefined();\nexpect(ProductFilter.methods).toBeUndefined();" },
        { name: 'пагінація і межі', code: "const m = mount(ProductFilter, { products: ['a1', 'a2', 'a3'], pageSize: 2 });\nconst q = (s) => m.container.querySelector(s);\nexpect([...m.container.querySelectorAll('li')].map((l) => l.textContent)).toEqual(['a1', 'a2']);\nexpect(q('.page').textContent).toBe('1 / 2');\nclick(q('.next'));\nclick(q('.next'));\nawait nextTick();\nexpect(q('.page').textContent).toBe('2 / 2');\nexpect([...m.container.querySelectorAll('li')].map((l) => l.textContent)).toEqual(['a3']);\nclick(q('.prev'));\nclick(q('.prev'));\nawait nextTick();\nexpect(q('.page').textContent).toBe('1 / 2');" },
        { name: 'фільтр скидає сторінку, pick, фокус', code: "const onPick = mockFn();\nconst m = mount(ProductFilter, { products: ['Чашка', 'Чайник', 'Блокнот', 'Чохол'], pageSize: 2, onPick });\nconst field = m.container.querySelector('input');\nexpect(document.activeElement).toBe(field);\nclick(m.container.querySelector('.next'));\nawait nextTick();\nawait typeInto(field, 'ЧА');\nexpect(m.container.querySelector('.page').textContent).toBe('1 / 1');\nexpect([...m.container.querySelectorAll('li')].map((l) => l.textContent)).toEqual(['Чашка', 'Чайник']);\nclick(m.container.querySelectorAll('li')[1]);\nexpect(onPick).toHaveBeenCalledWith('Чайник');\nm.unmount();" }
      ],
      explanation: 'Options API досі підтримується у Vue 3 і трапляється в легасі-проєктах; обидва стилі можна змішувати під час міграції. Composition API групує код за функцією (пошук, пагінація), а не за типом опції, і дозволяє винести логіку в composable (`usePagination(list, pageSize)`). Пам\'ятайте: у Options API `this` — проксі екземпляра; у `<script setup>` його немає.'
    },
    {
      id: 've-options-theory', group: 'ts-migration', type: 'theory', level: 3, interview: true,
      title: 'Options API, Vue 2 → Vue 3',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Підтримку Vue 2 завершено 31 грудня 2023 року — легасі-проєкти мігрують на Vue 3',
        'У Vue 3 застосунок створюється через `createApp(App)` замість `new Vue()`, а плагіни підключаються до екземпляра застосунку',
        'Фільтри (`{{ price | currency }}`) і шина подій `$on`/`$off` у Vue 3 видалені',
        'Компонент Vue 3 може мати кілька кореневих елементів (фрагменти)',
        'Options API у Vue 3 видалено — лишився лише Composition API'
      ],
      correct: [0, 1, 2, 3],
      why: [
        'Так: Vue 2 досяг кінця життя (EOL) наприкінці 2023 року.',
        'Так: глобальна конфігурація більше не спільна між застосунками.',
        'Так: фільтри → функції/computed, шина подій → бібліотека (mitt) або стор.',
        'Так: тоді треба явно вказати, куди йдуть `$attrs`.',
        'Ні: Options API повністю підтримується.'
      ],
      hint: 'Що змінилось у створенні застосунку, шаблонах і подіях?',
      answer: `
| Options API | Composition API |
|---|---|
| \`data()\` | \`ref\` / \`reactive\` |
| \`computed: {}\` | \`computed()\` |
| \`watch: {}\` | \`watch()\` |
| \`methods: {}\` | звичайні функції |
| \`mounted()\` | \`onMounted()\` |
| \`this.$emit\` | \`defineEmits\` |
| \`this.$refs.x\` | \`useTemplateRef('x')\` |
| міксини | composables |

**Інші зміни Vue 3:** \`v-model\` на компонентах (\`modelValue\` замість \`value\`, кілька v-model); \`v-if\` має пріоритет над \`v-for\`; \`$listeners\` об'єднано з \`$attrs\`; опція \`emits\`; нові \`Teleport\`, \`Suspense\`, фрагменти; кращий TypeScript.

**Інструменти міграції:** \`@vue/compat\` (режим сумісності з попередженнями), поступове переписування компонентів; Vuex → Pinia, Vue CLI/webpack → Vite.
`,
      keyPoints: ['Vue 2 EOL — кінець 2023', 'createApp', 'Без фільтрів і $on', 'Фрагменти', 'Options API підтримується']
    },
    // ---------------------------------------------------------------- nuxt
    {
      id: 've-nuxt-theory', group: 'nuxt', type: 'theory', level: 3, interview: true,
      title: 'Nuxt: SSR-фреймворк для Vue',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Nuxt будує маршрути з файлів у `pages/` (`pages/users/[id].vue` → `/users/:id`)',
        'Компоненти, composables і API Vue в Nuxt імпортуються автоматично (auto-imports)',
        '`useFetch` / `useAsyncData` завантажують дані на сервері й передають результат клієнту в payload, тож при гідратації запит не повторюється',
        'Nuxt підтримує лише SSR, статична генерація неможлива',
        'Серверні ендпоінти пишуть у `server/api/` — їх обслуговує рушій Nitro'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: файлова маршрутизація, як у Next.js.',
        'Так: зручно, але варто знати, звідки береться кожна функція.',
        'Так: ключова відмінність від `$fetch` у setup.',
        'Ні: SSR, SSG (`nuxt generate`), SPA і гібрид — `routeRules` на рівні маршрутів.',
        'Так: Nitro також адаптує застосунок під різні хостинги (Node, edge, serverless).'
      ],
      hint: 'Що спільного в Nuxt і Next.js?',
      answer: `
\`\`\`vue
<!-- app/pages/products/[id].vue -->
<script setup lang="ts">
const route = useRoute();
const { data: product, error, status } = await useFetch(\`/api/products/\${route.params.id}\`);
useSeoMeta({ title: () => product.value?.title });
</script>
\`\`\`
\`\`\`ts
// server/api/products/[id].get.ts
export default defineEventHandler((event) => getProduct(getRouterParam(event, 'id')));

// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: { '/': { prerender: true }, '/blog/**': { isr: 3600 }, '/admin/**': { ssr: false } }
});
\`\`\`
- **Nuxt 4** (2025): код застосунку в каталозі \`app/\`, оновлена робота з даними;
- \`useState\` — SSR-безпечний спільний стан; Pinia — через модуль \`@pinia/nuxt\`;
- \`layouts/\`, \`middleware/\` (guards маршрутів), \`plugins/\`, \`runtimeConfig\` (секрети лише на сервері);
- гідратація: ті самі правила, що в React — перший клієнтський рендер має збігтися з серверним HTML (\`<ClientOnly>\` для браузерних віджетів).

**Порівняння:** Nuxt ≈ Next.js (App Router), але без моделі Server Components — компоненти рендеряться на сервері й гідратуються повністю (експериментальні server components в Nuxt існують як острівці).
`,
      keyPoints: ['pages/ — маршрути', 'auto-imports', 'useFetch без подвійного запиту', 'SSR, SSG, гібрид routeRules', 'server/api і Nitro']
    },
    {
      id: 've-quiz-nuxt-fetch', group: 'nuxt', type: 'quiz', level: 3,
      title: '$fetch у setup сторінки Nuxt',
      question: `
Чому в Nuxt не пишуть так?

\`\`\`vue
<script setup>
const posts = ref(await $fetch('/api/posts'));
</script>
\`\`\`
`,
      options: [
        'Запит піде двічі: на сервері і ще раз при гідратації',
        '`$fetch` не працює на сервері',
        'top-level `await` у `<script setup>` заборонений',
        'Дані не потраплять у HTML, тому SEO постраждає'
      ],
      answer: 0,
      why: [
        'Так: `$fetch` не передає результат у payload; `useFetch` / `useAsyncData` передають і дедуплікують за ключем.',
        'Ні: `$fetch` (ofetch) працює і на сервері, і на клієнті.',
        'Ні: дозволений (компонент стає async, потрібен Suspense — Nuxt це забезпечує).',
        'Ні: при SSR дані будуть у HTML — проблема в подвійному запиті.'
      ],
      hint: 'Скільки разів виконується setup сторінки при SSR + гідратації?',
      explanation: '`$fetch` доречний в обробниках подій (сабміт форми) і в серверному коді. Для даних сторінки — `useFetch` (URL) або `useAsyncData(key, fn)` (довільна функція). Аналог у Next.js — завантаження в Server Component, де клієнт узагалі не повторює запит.'
    },
    {
      id: 've-vue-vs-react', group: 'nuxt', type: 'theory', level: 3, interview: true,
      title: 'Vue чи React: порівняння для співбесіди',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'У Vue реактивність визначає, які компоненти оновити; у React компонент перерендерюється з дітьми, а оптимізують memo або React Compiler',
        'Шаблони Vue компілюються з оптимізаціями (статичні вузли, patch flags); JSX у React — це виклики функцій без такого аналізу',
        'Composables не мають застарілих замикань, бо setup виконується один раз',
        'React підтримує лише клієнтський рендеринг, а Vue — лише SSR',
        'Обидва використовують віртуальний DOM (Vue готує Vapor Mode без VDOM як опцію)'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: різні моделі оновлення.',
        'Так: компілятор Vue знає структуру шаблону; React Compiler додає автоматичну мемоізацію, а не аналіз DOM.',
        'Так: у React функція-компонент викликається на кожен рендер.',
        'Ні: обидва підтримують CSR, SSR, SSG (Next.js, Nuxt).',
        'Так: Vapor Mode у Vue 3.6.'
      ],
      hint: 'Порівняйте модель оновлення, шаблони, логіку і екосистему.',
      answer: `
| | Vue 3 | React 19 |
|---|---|---|
| Оновлення | реактивність (Proxy) → лише залежні компоненти | перерендер піддерева; memo / Compiler |
| Розмітка | шаблони + директиви (JSX можливий) | JSX |
| Стан | мутабельні \`ref\` / \`reactive\` | іммутабельні оновлення \`setState\` |
| Логіка | composables, setup один раз | хуки, рендер щоразу |
| Двостороннє зв'язування | \`v-model\`, \`defineModel\` | контрольовані поля вручну |
| Стилі | \`<style scoped>\` з коробки | CSS Modules, Tailwind… |
| Стан застосунку | Pinia (офіційний) | Zustand, Redux Toolkit… |
| Фреймворк | Nuxt | Next.js (Server Components) |
| Ринок | сильний у Європі й Азії | найбільша частка вакансій |

**Як відповідати «що обрати»:** залежить від команди, екосистеми, вимог до SSR/RSC і найму. Обидва — зрілі інструменти; знання основ (реактивність, компоненти, рендеринг, браузер) переноситься між ними — саме тому в курсі багато аналогій.
`,
      keyPoints: ['Реактивність vs перерендер', 'Шаблони vs JSX', 'Мутабельний vs іммутабельний стан', 'Composables vs хуки', 'Nuxt vs Next.js']
    }
  ]
});
})();
