FE.chapter('vue-composition-book', { body: `
Composition API — це функції Vue (\`ref\`, \`computed\`, \`watch\`, хуки життєвого циклу, \`provide\`/\`inject\`), з яких складається логіка компонента. Ключове: \`setup\` виконується **один раз**, а реактивні значення завжди актуальні. Тому тут немає того, що в React вимагає дисципліни: масивів залежностей, застарілих замикань і правил порядку хуків.

## watch і watchEffect

\`computed\` — для **значень**. \`watch\` / \`watchEffect\` — для **побічних ефектів** у відповідь на зміну: запит, запис у localStorage, аналітика, робота з DOM.

\`\`\`js
watch(query, (q, oldQ) => { … });                      // ref
watch(() => props.userId, load, { immediate: true });  // getter — конкретна властивість
watch([page, sort], ([p, s]) => { … });                 // кілька джерел
watch(settings, save, { deep: true });                  // глибоко (deep: 1 — на один рівень, 3.5)
watch(token, onLogin, { once: true });                  // один раз (3.4)
watchEffect(() => { document.title = title.value; });   // залежності — усе прочитане
\`\`\`
- \`reactive\`-об'єкт як джерело — глибокий; getter \`() => state.user\` — **неглибокий** (спрацює лише при заміні \`user\`);
- \`watchEffect\` відстежує лише читання **до першого await**;
- **flush:** за замовчуванням \`'pre'\` — до оновлення DOM компонента; \`'post'\` (\`watchPostEffect\`) — після, коли треба виміряти DOM; \`'sync'\` — синхронно (рідко);
- **cleanup:** \`onWatcherCleanup(() => controller.abort())\` (3.5) виконується перед наступним запуском і при зупинці — так скасовують застарілі запити й таймери debounce;
- watcher, створений синхронно в setup, зупиняється разом із компонентом; створений асинхронно — \`const stop = watch(…)\` і \`stop()\` вручну.

**Антипатерн:** \`watch\`, що копіює одне значення в інше (\`watch(a, v => b.value = v * 2)\`) — це \`computed\`.

## Життєвий цикл і template refs

| Хук | Коли | React |
|---|---|---|
| тіло \`<script setup>\` | один раз, до рендеру | тіло компонента (щоразу) |
| \`onBeforeMount\` / \`onMounted\` | до / після вставки в DOM | \`useLayoutEffect\` / \`useEffect(…, [])\` |
| \`onBeforeUpdate\` / \`onUpdated\` | навколо оновлення DOM | ефект без залежностей |
| \`onBeforeUnmount\` / \`onUnmounted\` | перед / після видалення | cleanup |
| \`onActivated\` / \`onDeactivated\` | у \`<KeepAlive>\` | \`<Activity>\` |
| \`onErrorCaptured\` | помилка нащадка | Error Boundary |

**Порядок:** setup батька → beforeMount батька → setup і beforeMount дитини → **mounted дитини** → mounted батька. Розмонтування — спершу діти.

**Template refs:**
\`\`\`vue
<script setup>
import { useTemplateRef, onMounted, nextTick } from 'vue';
const input = useTemplateRef('search');     // Vue 3.5; раніше: const search = ref(null)
onMounted(() => input.value.focus());
async function openMenu() { open.value = true; await nextTick(); menu.value.querySelector('button').focus(); }
</script>
<template><input ref="search"></template>
\`\`\`
- у setup ref ще \`null\`; елемент під \`v-if\` з'являється після оновлення — \`nextTick\`;
- ref на компоненті дає лише те, що він відкрив через \`defineExpose({ focus })\`;
- слухачі на \`window\`/\`document\` додають в \`onMounted\` і **обов'язково** знімають в \`onUnmounted\` (модуль «Події»: витоки пам'яті);
- \`onMounted\` не викликається під час SSR — браузерні API використовуйте в ньому.

## Composables: перевикористання логіки

Composable — функція \`use…\`, що інкапсулює логіку зі станом:
\`\`\`js
// useFetch.js
import { ref, watch, toValue, onWatcherCleanup } from 'vue';
export function useFetch(url) {
  const data = ref(null), error = ref(null), loading = ref(false);
  watch(() => toValue(url), async (current) => {
    const controller = new AbortController();
    onWatcherCleanup(() => controller.abort());
    loading.value = true; error.value = null;
    try {
      const res = await fetch(current, { signal: controller.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      data.value = await res.json();
    } catch (e) { if (!controller.signal.aborted) error.value = e.message; }
    finally { if (!controller.signal.aborted) loading.value = false; }
  }, { immediate: true });
  return { data, error, loading };
}
// у компоненті
const { data, loading } = useFetch(() => '/api/users/' + props.id);
\`\`\`
**Конвенції:**
- приймати \`MaybeRefOrGetter\` і читати через \`toValue()\` — тоді composable реагує на зміни аргументу;
- повертати **об'єкт з refs** (не \`reactive\`) — деструктуризація без втрати реактивності;
- викликати **синхронно** в setup — хуки й watch прив'язуються до компонента;
- прибирати побічні ефекти (\`onUnmounted\`, \`onScopeDispose\`);
- кожен виклик — новий стан; спільний стан — змінна модуля (обережно з SSR) або Pinia.

**Замість міксинів:** міксини Options API приховували джерело властивостей і конфліктували іменами; composables явні. Готова бібліотека — **VueUse** (\`useStorage\`, \`useDebounceFn\`, \`onClickOutside\`, \`useIntersectionObserver\`, \`useEventListener\`).

## provide/inject, Teleport і вбудовані компоненти

**provide / inject** — передача значення в будь-яку глибину (аналог Context):
\`\`\`js
// theme.js
export const ThemeKey = Symbol('theme');           // у TS: InjectionKey<ThemeCtx>
export function useTheme() {
  const ctx = inject(ThemeKey, null);
  if (!ctx) throw new Error('useTheme поза ThemeProvider');
  return ctx;
}
// ThemeProvider.vue
provide(ThemeKey, { theme: readonly(theme), toggle });
\`\`\`
Ключ-символ виключає конфлікти; \`readonly\` залишає змінювати стан лише провайдеру. На відміну від React Context, оновлюються лише компоненти, що **читають** змінене значення. \`app.provide()\` — залежності рівня застосунку (API-клієнт, i18n).

**Вбудовані компоненти:**
- \`<Teleport to="body">\` — рендер у інше місце DOM (модалки, тости), компонент лишається в дереві Vue (props, події, inject працюють); аналог \`createPortal\`;
- \`<KeepAlive include="…" :max="5">\` — кеш екземплярів перемиканих компонентів (вкладки, кроки майстра);
- \`<Transition>\` / \`<TransitionGroup>\` — класи \`v-enter-from\`, \`v-enter-active\`, \`v-leave-to\`, \`v-move\` (FLIP для списків);
- \`<Suspense>\` — очікування async setup (досі експериментальний);
- \`defineAsyncComponent(() => import('./Chart.vue'))\` — ліниве завантаження (аналог \`React.lazy\`).

**Директиви:** \`v-once\`, \`v-memo="[deps]"\` (пропустити оновлення великого піддерева), власні директиви \`const vFocus = { mounted: (el) => el.focus() }\`.

## Реактивність зсередини і пастки

Ядро (\`@vue/reactivity\`) — те, що ви реалізували в завданні:
\`\`\`js
targetMap: WeakMap<target, Map<key, Set<effect>>>
get  → track(target, key)    // activeEffect записується в залежності
set  → trigger(target, key)  // залежні ефекти — у чергу
effect.run(): очистити старі залежності → activeEffect = effect → fn()
computed: внутрішній ефект зі scheduler → позначає dirty і сповіщає підписників; перерахунок — при читанні
\`\`\`
**Конвеєр оновлення:** запис → trigger → render-ефекти залежних компонентів у черзі → мікрозадача → render → patch, який завдяки компілятору порівнює лише динамічні вузли (block tree, patch flags).

**Пастки:**
- деструктуризація \`reactive\`/стора/результату composable з \`reactive\` → \`toRefs\`, \`storeToRefs\`;
- \`shallowRef\` реагує лише на заміну \`.value\` (\`triggerRef\` — примусово);
- порівняння \`proxy === raw\` хибне — \`toRaw\`;
- сторонні об'єкти (карти, графіки, класи з приватними полями \`#\`) — \`markRaw\`, бо Proxy ламає приватні поля;
- \`watch\` getter-а, що повертає об'єкт, — неглибокий.

**Vue 2 → 3:** \`Object.defineProperty\` не помічав нових властивостей і індексів масиву (\`Vue.set\`); Proxy це розв'язав. **Vapor Mode** (Vue 3.6, наразі RC) — opt-in компіляція без VDOM, ближча до Solid.

## Типові питання

- **watch vs watchEffect vs computed?**
- **Як скасувати застарілий запит у watch?** \`onWatcherCleanup\` + AbortController.
- **Коли доступний DOM? Порядок mounted батька і дитини?**
- **Чим composable відрізняється від хука React і від міксина?**
- **provide/inject vs Pinia?** Залежності піддерева vs глобальний стан застосунку.
- **Як влаштована реактивність? Чому деструктуризація її ламає?**
`});
