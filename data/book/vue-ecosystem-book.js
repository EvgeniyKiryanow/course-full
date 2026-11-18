FE.chapter('vue-ecosystem-book', { body: `
Екосистема Vue здебільшого офіційна: Vite, Pinia, Vue Router, Vue Test Utils, Nuxt і VueUse розробляє та сама спільнота з узгодженими API. Як і для React, головне — розуміти, **яку задачу** розв'язує кожен інструмент.

| Задача | Інструмент |
|---|---|
| Збірка | Vite (\`npm create vue@latest\`) |
| Стан застосунку | Pinia |
| Серверний стан | TanStack Query (\`@tanstack/vue-query\`), Pinia Colada, Nuxt \`useFetch\` |
| Маршрути | Vue Router |
| Тести | Vitest + Vue Test Utils / Testing Library, Playwright |
| UI-бібліотеки | PrimeVue, Vuetify, Element Plus, Naive UI, Radix Vue/Reka UI |
| SSR / SSG | Nuxt |

## Pinia: стан застосунку

Pinia — офіційний стейт-менеджер (замінив Vuex): без mutations, з TypeScript, DevTools і плагінами.
\`\`\`js
export const useCartStore = defineStore('cart', () => {
  const items = ref([]);
  const total = computed(() => items.value.reduce((s, i) => s + i.qty * i.price, 0));
  function add(product) { … }
  return { items, total, add };
});

// компонент
const cart = useCartStore();
const { items, total } = storeToRefs(cart);   // стан і getters — з реактивністю
const { add } = cart;                          // actions — напряму
\`\`\`
**Як влаштовано** (ви це реалізували): \`createPinia()\` — реєстр сторів застосунку (\`app.use(pinia)\` робить його активним); \`defineStore\` повертає \`useStore\`, що створює стор **один раз** — \`reactive(setup())\` в окремому \`effectScope\`, щоб watch/computed стора не зупинились із компонентом; \`storeToRefs\` перетворює стан і getters на refs.

- option-стори: \`state\`, \`getters\`, \`actions\` + \`$reset()\`;
- \`$patch\` (кілька змін одним записом), \`$subscribe\` (персистентність), \`$onAction\` (логування), плагіни;
- у SSR — окрема Pinia на запит (тому \`useStore()\` викликають у setup, а не на рівні модуля);
- серверні дані — у бібліотеці кешу, а не в сторі.

## Vue Router

\`\`\`js
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/users/:id', component: () => import('./UserPage.vue'), props: true },
    { path: '/admin', component: AdminLayout, meta: { requiresAuth: true }, children: [ … ] },
    { path: '/:pathMatch(.*)*', component: NotFound }
  ]
});
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !useAuthStore().isLoggedIn) return { path: '/login', query: { redirect: to.fullPath } };
});
\`\`\`
- **guards** повертають \`false\` (скасувати), маршрут/шлях (редирект) або нічого (продовжити); бувають глобальні, на маршруті (\`beforeEnter\`) і в компоненті (\`onBeforeRouteLeave\`, \`onBeforeRouteUpdate\`);
- \`createWebHistory()\` потребує fallback на сервері; \`createWebHashHistory()\` працює на будь-якому статичному хостингу;
- \`useRoute()\` — реактивний маршрут, \`useRouter()\` — навігація (\`push\`, \`replace\`, \`back\`);
- **пастка:** перехід \`/users/1\` → \`/users/2\` перевикористовує компонент — \`onMounted\` не повториться; потрібен \`watch(() => route.params.id, load, { immediate: true })\`;
- \`<RouterLink>\` ставить \`aria-current="page"\`; після переходу перемістіть фокус на заголовок сторінки;
- захист маршрутів на клієнті — лише UX: права перевіряє сервер.

## Тестування Vue-компонентів

\`\`\`js
import { mount, flushPromises } from '@vue/test-utils';

test('додає задачу', async () => {
  const wrapper = mount(TodoList, { props: { initial: [] } });
  await wrapper.get('input').setValue('Купити хліб');
  await wrapper.get('form').trigger('submit');
  expect(wrapper.findAll('li')).toHaveLength(1);
  expect(wrapper.emitted('change')?.[0]).toEqual([1]);
});
\`\`\`
- \`trigger\`, \`setValue\`, \`setProps\` повертають проміс — **чекайте їх** (DOM асинхронний); для запитів — \`flushPromises()\`;
- \`mount\` (з дітьми) для інтеграційних тестів, \`shallowMount\` (діти-заглушки) — для ізольованих;
- плагіни: \`global: { plugins: [createTestingPinia(), router] }\`; роутер у тестах — \`createMemoryHistory()\`;
- **Testing Library для Vue** — ті самі запити за ролями, що в React; мережа — MSW; E2E — Playwright;
- перевіряйте поведінку (DOM, емітовані події), а не внутрішній стан.

## TypeScript, Options API і міграція

**TypeScript у SFC:**
\`\`\`vue
<script setup lang="ts" generic="T extends { id: number }">
interface Props { items: T[]; selected?: number; size?: 'sm' | 'md' }
const { items, selected, size = 'md' } = defineProps<Props>();   // 3.5: реактивна деструктуризація з дефолтами
const emit = defineEmits<{ select: [id: number] }>();
const model = defineModel<string>({ default: '' });
const list = useTemplateRef<HTMLUListElement>('list');
</script>
\`\`\`
- до 3.5 — \`withDefaults(defineProps<Props>(), { size: 'md' })\`;
- \`InjectionKey<T>\` для provide/inject, \`ref<User | null>(null)\`, \`defineSlots\`;
- перевірка типів — \`vue-tsc --noEmit\` (Vite лише прибирає типи).

**Options API** (легасі, але повністю підтримується):
| Options API | Composition API |
|---|---|
| \`data()\`, \`computed\`, \`watch\`, \`methods\` | \`ref\`, \`computed()\`, \`watch()\`, функції |
| \`mounted()\`, \`this.$refs\` | \`onMounted\`, template ref |
| \`this.$emit\`, \`props\` | \`defineEmits\`, \`defineProps\` |
| міксини | composables |

**Vue 2 → Vue 3** (підтримку Vue 2 завершено 31.12.2023): \`createApp\` замість \`new Vue\`; \`v-model\` на компонентах (\`modelValue\`, кілька моделей); видалено фільтри й \`$on\`/\`$off\`; \`$listeners\` у \`$attrs\`; фрагменти, \`Teleport\`, \`emits\`; \`v-if\` пріоритетніший за \`v-for\`. Інструменти: \`@vue/compat\`, Vuex → Pinia, Vue CLI → Vite.

## Nuxt і вибір між Vue та React

**Nuxt** — фреймворк поверх Vue (аналог Next.js):
- файлова маршрутизація (\`app/pages/users/[id].vue\`), \`layouts/\`, \`middleware/\` (guards), \`plugins/\`;
- auto-imports компонентів, composables і API Vue;
- **дані:** \`useFetch(url)\` / \`useAsyncData(key, fn)\` завантажують на сервері й передають результат у payload — при гідратації запит не повторюється; \`$fetch\` у setup сторінки дав би подвійний запит;
- **рендеринг:** SSR за замовчуванням, SSG, SPA і гібрид через \`routeRules\` (\`prerender\`, \`isr\`, \`ssr: false\`);
- \`server/api/*\` — серверні ендпоінти (рушій Nitro, деплой на Node, serverless, edge);
- \`useState\` — SSR-безпечний спільний стан; \`runtimeConfig\` — секрети лише на сервері; \`useSeoMeta\` — метадані;
- Nuxt 4 (2025): код застосунку в \`app/\`.

**Гідратація** працює так само, як у React: перший клієнтський рендер має збігтися із серверним HTML; браузерні віджети — у \`<ClientOnly>\` або \`onMounted\`.

**Vue чи React:**
| | Vue | React |
|---|---|---|
| Оновлення | реактивність → залежні компоненти | перерендер піддерева, memo / Compiler |
| Розмітка | шаблони (компілятор оптимізує) | JSX |
| Стан | мутабельний | іммутабельні оновлення |
| Логіка | composables, setup один раз | хуки, функція щоразу |
| Екосистема | офіційна (Pinia, Router, Nuxt) | широка, вибір за командою |
| SSR | Nuxt | Next.js із Server Components |

Обидва — зрілі; фундамент (JS, браузер, рендеринг, мережа, архітектура) переноситься між ними.

## Типові питання

- **Pinia vs Vuex? Навіщо storeToRefs?**
- **Як захистити маршрут? Чому компонент не оновився при зміні params?**
- **Чому в тесті треба await trigger?**
- **Як типізувати props і emits? Що змінилось у 3.5?**
- **Що змінилось у Vue 3 порівняно з Vue 2?**
- **useFetch vs $fetch у Nuxt? Що таке гідратація?**
- **Vue чи React — у чому різниця?**
`});
