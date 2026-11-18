FE.chapter('vue-basics-book', { body: `
Vue 3 — фреймворк з **реактивністю на Proxy** і **шаблонами**, що компілюються в render-функції. Якщо ви пройшли React, найважливіша відмінність така: у Vue стан **мутують** (\`count.value++\`), а фреймворк сам знає, які компоненти залежать від зміненого значення. Код \`<script setup>\` виконується **один раз** на екземпляр компонента.

| Ви вже знаєте | У Vue |
|---|---|
| Proxy і observable (модуль «Сучасний JS») | \`reactive()\`, \`ref()\` |
| сигнали (модуль «Патерни») | \`computed\`, автоматичні залежності |
| \`h()\` і VDOM (міні-фреймворк) | шаблон → render-функція → VDOM |
| \`useState\` / \`useMemo\` (React) | \`ref\` / \`computed\` |

## Однофайлові компоненти і шаблони

Файл \`.vue\` складається з трьох блоків:
\`\`\`vue
<script setup>
import { ref } from 'vue';
const props = defineProps({ title: { type: String, required: true } });
const count = ref(0);
</script>

<template>
  <h2>{{ title }}</h2>
  <button :disabled="count >= 10" @click="count++">Клік: {{ count }}</button>
</template>

<style scoped>
button { color: #42b883; }
</style>
\`\`\`
- \`<script setup>\` — усе з верхнього рівня (змінні, функції, імпортовані компоненти) доступне в шаблоні;
- **макроси компілятора** \`defineProps\`, \`defineEmits\`, \`defineModel\`, \`defineExpose\`, \`defineSlots\` не імпортуються;
- \`<template>\` компілюється (Vite + \`@vue/compiler-sfc\`) у render-функцію з оптимізаціями: статичні частини винесено, динамічні позначено;
- \`<style scoped>\` додає елементам атрибут \`data-v-хеш\` і переписує селектори; \`:deep(.child)\` — стилізувати вкладений компонент; \`<style module>\` — CSS Modules.

**Синтаксис шаблону:**
| Запис | Означає | JSX-аналог |
|---|---|---|
| \`{{ expr }}\` | текст (екранований) | \`{expr}\` |
| \`:href="url"\` | \`v-bind\` — динамічний атрибут/проп | \`href={url}\` |
| \`@click="fn"\` | \`v-on\` — подія | \`onClick={fn}\` |
| \`:class="{ active: isActive }"\` | об'єкт/масив класів | рядок \`className\` |
| \`v-html="html"\` | вставка HTML (ризик XSS) | \`dangerouslySetInnerHTML\` |

Вирази в шаблоні — звичайний JS з обмеженим доступом до глобальних об'єктів (\`Math\`, \`Date\` можна, змінні \`window\` — ні).

## Реактивність: ref, reactive, computed

\`\`\`js
const count = ref(0);                       // { value: 0 }
const user = reactive({ name: 'Ann' });     // Proxy
const double = computed(() => count.value * 2);
count.value++;                               // у скрипті — .value
user.name = 'Bob';                           // reactive — напряму
\`\`\`
**Як це працює:** render-функція виконується як ефект. Читання \`count.value\` записує залежність (track), запис — ставить залежні ефекти в чергу (trigger). Черга виконується в мікрозадачі, тому кілька змін → **одне** оновлення DOM, а сам DOM оновлюється **асинхронно**: після зміни стану чекайте \`await nextTick()\`, якщо потрібен оновлений DOM.

| | \`ref\` | \`reactive\` |
|---|---|---|
| Значення | будь-яке | лише об'єкти, масиви, Map, Set |
| У скрипті | \`.value\` | напряму |
| У шаблоні | розгортається автоматично | напряму |
| Заміна цілком | можна | ламає зв'язок |
| Деструктуризація | — | втрачає реактивність → \`toRefs\` |

Рекомендація документації — **\`ref\` за замовчуванням**. \`computed\` кешує результат і перераховує лише при зміні залежностей; getter має бути чистим (без змін стану й запитів). Для записуваного computed — \`computed({ get, set })\`.

**Пастки:** деструктуризація \`reactive\` дає копії примітивів; заміна \`state = reactive({...})\` — шаблон лишається підписаним на старий об'єкт; великі незмінні дані — \`shallowRef\`/\`markRaw\`, щоб не обгортати кожен вкладений об'єкт.

## Директиви: v-if, v-show, v-for, події

\`\`\`vue
<p v-if="loading">Завантаження…</p>
<p v-else-if="error" class="error">{{ error }}</p>
<ul v-else>
  <li v-for="(item, index) in items" :key="item.id">{{ index + 1 }}. {{ item.title }}</li>
</ul>
<aside v-show="filtersOpen">…</aside>
\`\`\`
- \`v-if\` створює/знищує елементи (ліниво); \`v-show\` лише перемикає \`display\` (дешево для частих перемикань);
- \`v-for\` з **обов'язковим** \`:key\` — стабільний id; \`<template v-for>\` — кілька елементів без обгортки;
- у Vue 3 \`v-if\` має **вищий** пріоритет за \`v-for\` на тому самому елементі — фільтруйте в \`computed\`;
- масиви можна мутувати (\`push\`, \`splice\`, \`sort\`) — Proxy це відстежує.

**Події й модифікатори:**
\`\`\`vue
<form @submit.prevent="save">            <!-- preventDefault -->
<div @click.self="close">                <!-- лише якщо target === currentTarget -->
<input @keydown.enter="search" @keydown.esc="clear">
<button @click.once="init">
\`\`\`
\`$event\` — об'єкт події в інлайн-обробнику: \`@input="onInput($event.target.value)"\`.

## Форми і v-model

\`v-model\` — двостороннє зв'язування, яке компілюється в \`:value\` + \`@input\` (для чекбокса — \`:checked\` + \`@change\`):
\`\`\`vue
<input v-model.trim="email">
<input v-model.number="age" type="number">
<select v-model="plan"><option value="free">Free</option><option value="pro">Pro</option></select>
<input type="checkbox" v-model="agree">
<input type="checkbox" v-model="tags" value="vue">   <!-- масив вибраних -->
<textarea v-model.lazy="bio"></textarea>           <!-- оновлення на change -->
\`\`\`
- модифікатори: \`.trim\`, \`.number\` (рядок → число), \`.lazy\`;
- помилки валідації — \`computed\` від полів; показуйте після спроби відправки або blur; \`aria-invalid\`, \`aria-describedby\`;
- великі форми — VeeValidate або FormKit зі схемами Zod/Valibot.

**v-model на компоненті:** \`<SearchBox v-model="q" />\` = \`:modelValue="q"\` + \`@update:modelValue="v => q = v"\`; кілька: \`v-model:title\`, \`v-model:content\`. У дитині — \`const model = defineModel()\` (ref, запис у який емітить подію).

## Компоненти: props, emits, слоти

**Потік даних односпрямований:** props вниз, події вгору.
\`\`\`vue
<!-- TodoItem.vue -->
<script setup>
const props = defineProps({ todo: { type: Object, required: true } });
const emit = defineEmits(['toggle', 'remove']);
</script>
<template>
  <li :class="{ done: todo.done }">
    <input type="checkbox" :checked="todo.done" @change="emit('toggle', todo.id)">
    {{ todo.text }} <button @click="emit('remove', todo.id)">✕</button>
  </li>
</template>

<!-- батько -->
<TodoItem v-for="t in todos" :key="t.id" :todo="t" @toggle="toggle" @remove="remove" />
\`\`\`
- props — **readonly**: спроба змінити дає попередження; для чернетки — локальна копія \`ref(props.title)\`;
- props валідуються в рантаймі (\`type\`, \`required\`, \`default\` — для об'єктів фабрика \`() => []\`, \`validator\`);
- **fallthrough attributes:** неоголошені атрибути (\`class\`, \`style\`, \`data-*\`, \`onClick\`) потрапляють на корінь дитини; \`class\` зливається; \`defineOptions({ inheritAttrs: false })\` + \`v-bind="$attrs"\` — перенести на інший елемент.

**Слоти** — розмітка від батька:
\`\`\`vue
<!-- DataList.vue -->
<section>
  <slot name="header" />
  <slot v-if="!items.length" name="empty">Порожньо</slot>   <!-- вміст = fallback -->
  <ul v-else><li v-for="item in items" :key="item.id"><slot name="item" :item="item">{{ item }}</slot></li></ul>
</section>

<!-- використання -->
<DataList :items="users">
  <template #header><h3>Користувачі</h3></template>
  <template #item="{ item }"><b>{{ item.name }}</b></template>
</DataList>
\`\`\`
Слот за замовчуванням ≈ \`children\` у React; **scoped-слот** (дитина передає дані в слот) ≈ render prop.

## Типові питання

- **Як працює реактивність Vue 3? Чим відрізняється від Vue 2?** Proxy + track/trigger; Vue 2 — \`Object.defineProperty\`, не бачив нових властивостей.
- **ref vs reactive?** Обгортка з \`.value\` для будь-яких значень vs Proxy для об'єктів.
- **computed vs метод vs watch?** Кешоване значення vs виклик щоразу vs побічний ефект.
- **v-if vs v-show?** Створення/знищення vs \`display\`.
- **Чому DOM не оновився одразу?** Асинхронна черга, \`nextTick\`.
- **Як передати дані від дитини батькові?** \`emit\`, \`v-model\`, scoped-слоти.
`});
