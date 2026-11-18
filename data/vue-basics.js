(function () {
const HTML = '<div id="root"></div>';
const CSS = `body { font-family: system-ui, sans-serif; padding: 12px; }
button { padding: 4px 10px; margin: 2px; }
.card { border: 1px solid #ddd; border-radius: 10px; padding: 10px; margin: 6px 0; }
.card.online { border-color: #42b883; }
.done span, li.done { text-decoration: line-through; color: #888; }
.error { color: #c00; margin: 2px 0; }`;

FE.topic('vue-basics', {
  intro: `
**Vue 3** — прогресивний фреймворк з **реактивністю на Proxy** і **шаблонами**, що компілюються в render-функції. Ви пишете однофайлові компоненти (\`.vue\`): \`<script setup>\` (логіка), \`<template>\` (розмітка), \`<style scoped>\` (стилі лише цього компонента). У тренажері вони компілюються тим самим \`@vue/compiler-sfc\`, що й у Vite.

| Ідея | Vue | React (для порівняння) |
|---|---|---|
| Стан | \`ref(0)\` / \`reactive({})\` — мутуєте напряму | \`useState\` — замінюєте значення |
| Що оновлюється | лише компоненти, що **читали** змінене значення | компонент і його діти |
| Розмітка | шаблон + директиви (\`v-if\`, \`v-for\`, \`v-model\`) | JSX |
| Похідні дані | \`computed\` (кешується) | обчислення в рендері / \`useMemo\` |
| setup | виконується **один раз** — немає застарілих замикань | функція викликається на кожен рендер |

Реактивність ви вже бачили зсередини: «Глибокий observable через Proxy» (модуль «Сучасний JS») і сигнали (модуль «Патерни»).

**Кілька компонентів** в одному редакторі розділяються рядком \`<!-- file: Назва.vue -->\`; у тестах компонент доступний за назвою файлу.
`,
  groups: [
    { id: 'sfc', title: 'Однофайлові компоненти і шаблони' },
    { id: 'reactivity', title: 'Реактивність: ref, reactive, computed' },
    { id: 'directives', title: 'Директиви: v-if, v-show, v-for, події' },
    { id: 'forms', title: 'Форми і v-model' },
    { id: 'components', title: 'Компоненти: props, emits, слоти' }
  ],
  items: [
    // ---------------------------------------------------------------- sfc
    {
      id: 'vb-sfc-theory', group: 'sfc', type: 'theory', level: 1,
      title: 'Як влаштований .vue-компонент',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        '`<template>` компілюється в render-функцію, що повертає віртуальний DOM — під час збірки, а не в браузері',
        'Змінні й функції, оголошені в `<script setup>`, доступні в шаблоні без `return`',
        '`<style scoped>` додає елементам компонента атрибут `data-v-…` і переписує селектори, щоб стилі не «витікали»',
        '`{{ html }}` вставляє рядок як HTML-розмітку',
        '`<script setup>` виконується заново при кожному оновленні компонента, тож усі змінні в ньому щоразу створюються наново'
      ],
      correct: [0, 1, 2],
      why: [
        'Так: компілятор ще й позначає статичні вузли, щоб diff їх пропускав.',
        'Так: компілятор сам «експортує» в шаблон усе з верхнього рівня setup.',
        'Так: `.btn` → `.btn[data-v-7ba5bd90]`.',
        'Ні: інтерполяція екранується (як textContent); HTML вставляє лише `v-html` — ризик XSS.',
        'Ні: setup виконується один раз при створенні; оновлення перезапускають лише render-функцію.'
      ],
      hint: 'Що компілятор робить з кожним блоком файлу?',
      answer: `
\`\`\`vue
<script setup>
import { ref, computed } from 'vue';
const props = defineProps({ title: String });   // макрос компілятора, імпорт не потрібен
const count = ref(0);
const double = computed(() => count.value * 2);
</script>

<template>
  <h2>{{ title }}</h2>
  <button @click="count++">{{ count }} × 2 = {{ double }}</button>
</template>

<style scoped>
button { color: #42b883; }
</style>
\`\`\`
- **макроси** \`defineProps\`, \`defineEmits\`, \`defineModel\`, \`defineExpose\`, \`defineSlots\` існують лише під час компіляції;
- у шаблоні \`ref\` розгортається автоматично (\`count\`, а не \`count.value\`);
- \`setup\` виконується **один раз** на екземпляр, а реактивність сама перезапускає render, коли змінились прочитані дані;
- шаблон компілюється з оптимізаціями (static hoisting, patch flags) — Vue знає, які частини динамічні.

**Аналогія:** render-функція = ваш \`h()\` з міні-фреймворку; Vue використовує VDOM, але реактивність визначає, **який** компонент перерендерити.
`,
      keyPoints: ['template → render-функція', 'script setup: усе доступне в шаблоні', 'scoped через data-v-атрибути', 'setup — один раз', 'Інтерполяція екранується']
    },
    {
      id: 'vb-profile-card', group: 'sfc', type: 'dom', runtime: 'vue', level: 1,
      title: 'Картка профілю: props, інтерполяція, v-bind',
      description: `
**Завдання.** Напишіть \`ProfileCard.vue\`:
- \`defineProps\`: \`name\` (рядок, обов'язковий), \`role\` (рядок, за замовчуванням \`'Учасник'\`), \`avatar\` (рядок), \`online\` (булеве);
- корінь \`<article class="card">\` з додатковим класом \`online\`, якщо \`online\` — через \`:class="{ online }"\`;
- якщо є \`avatar\` — \`<img :src="avatar" :alt="name">\`, інакше \`<span class="initials">\` з ініціалами: перші літери до двох слів імені, великими (\`'ann lee'\` → \`'AL'\`) — через \`computed\`;
- \`<h3>\` з іменем і \`<p>\` з роллю.

**Де трапляється:** картки користувачів, товарів, авторів у будь-якому каталозі чи соцмережі.

**Аналогія:** \`:атрибут="вираз"\` — як \`атрибут={вираз}\` у JSX; \`{{ }}\` — як \`{ }\` у JSX-тексті; \`defineProps\` — як деструктуризація props у React, але з рантайм-перевіркою типів.
`,
      html: HTML, css: CSS,
      js: `<!-- file: ProfileCard.vue -->
<script setup>
import { computed } from 'vue';
// TODO: defineProps — name (обов'язковий рядок), role (рядок, 'Учасник' за замовчуванням), avatar (рядок), online (булеве)
// TODO: computed initials
</script>

<template>
  <article class="card">
    <!-- TODO: img або ініціали, h3, p -->
  </article>
</template>

<!-- file: App.vue -->
<script setup>
import ProfileCard from './ProfileCard.vue';
</script>

<template>
  <ProfileCard name="Ann Lee" role="Frontend" online />
  <ProfileCard name="bob" />
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: ProfileCard.vue -->
<script setup>
import { computed } from 'vue';
const props = defineProps({
  name: { type: String, required: true },
  role: { type: String, default: 'Учасник' },
  avatar: String,
  online: Boolean
});
const initials = computed(() =>
  props.name.split(/\\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
);
</script>

<template>
  <article class="card" :class="{ online }">
    <img v-if="avatar" :src="avatar" :alt="name">
    <span v-else class="initials">{{ initials }}</span>
    <h3>{{ name }}</h3>
    <p>{{ role }}</p>
  </article>
</template>

<!-- file: App.vue -->
<script setup>
import ProfileCard from './ProfileCard.vue';
</script>

<template>
  <ProfileCard name="Ann Lee" role="Frontend" online />
  <ProfileCard name="bob" />
</template>
` },
      hints: ['`const props = defineProps({ name: { type: String, required: true }, role: { type: String, default: \'Учасник\' }, avatar: String, online: Boolean })`.', '`<img v-if="avatar" :src="avatar" :alt="name">` + `<span v-else class="initials">{{ initials }}</span>`; ініціали: `name.split(/\\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join(\'\')`.'],
      tests: [
        { name: 'з аватаром і online', code: "const m = mount(ProfileCard, { name: 'Ann Lee', role: 'Dev', avatar: 'a.png', online: true });\nconst card = m.container.querySelector('article');\nexpect(card.className).toBe('card online');\nexpect(card.querySelector('img').getAttribute('src')).toBe('a.png');\nexpect(card.querySelector('img').getAttribute('alt')).toBe('Ann Lee');\nexpect(card.querySelector('h3').textContent).toBe('Ann Lee');\nexpect(card.querySelector('p').textContent).toBe('Dev');\nexpect(card.querySelector('.initials')).toBeNull();" },
        { name: 'ініціали і значення за замовчуванням', code: "const m = mount(ProfileCard, { name: 'ann lee smith' });\nconst card = m.container.querySelector('article');\nexpect(card.className).toBe('card');\nexpect(card.querySelector('.initials').textContent).toBe('AL');\nexpect(card.querySelector('img')).toBeNull();\nexpect(card.querySelector('p').textContent).toBe('Учасник');" },
        { name: 'реагує на зміну props', code: "const m = mount(ProfileCard, { name: 'Ann' });\nawait m.setProps({ name: 'Bob Marley', online: true });\nexpect(m.container.querySelector('.initials').textContent).toBe('BM');\nexpect(m.container.querySelector('article').className).toBe('card online');" }
      ],
      explanation: 'Булевий проп без значення (`<ProfileCard online />`) у Vue дорівнює `true` — як у HTML-атрибутах. Статичний `class` і `:class` зливаються. `computed` перераховується лише при зміні `props.name`. Аналог React: `className={online ? \'card online\' : \'card\'}`, ініціали — обчислення в тілі компонента або `useMemo`.'
    },
    {
      id: 'vb-quiz-vhtml', group: 'sfc', type: 'quiz', level: 2,
      title: 'Коментар користувача з HTML',
      question: `
Користувач залишив коментар \`<img src=x onerror="alert(1)">\`. Що станеться?

\`\`\`vue
<p>{{ comment }}</p>
<div v-html="comment"></div>
\`\`\`
`,
      options: [
        '`<p>` покаже текст, а `v-html` виконає onerror — XSS',
        'Обидва безпечні: Vue санітизує HTML перед вставкою',
        'Обидва покажуть зображення і виконають alert(1)',
        'Помилка компіляції: у шаблоні не можна виводити теги'
      ],
      answer: 0,
      why: [
        'Так: інтерполяція — як textContent, v-html — як innerHTML.',
        'Ні: Vue не санітизує v-html.',
        'Ні: інтерполяція екранує теги.',
        'Ні: це звичайні рядки даних.'
      ],
      hint: 'Що з цього аналог textContent, а що — innerHTML?',
      explanation: 'v-html — лише для довіреного вмісту або після санітизації (DOMPurify) — модуль «Безпека». React має той самий поділ: `{text}` vs `dangerouslySetInnerHTML`.'
    },
    // ---------------------------------------------------------------- reactivity
    {
      id: 'vb-counter', group: 'reactivity', type: 'dom', runtime: 'vue', level: 1,
      title: 'Лічильник з кроком і межами: ref і computed',
      description: `
**Завдання.** Напишіть \`Counter.vue\` з пропами \`min\` (число, за замовчуванням 0) і \`max\` (число, за замовчуванням 10):
- стан \`count\` (початково \`min\`) і \`step\` (початково 1); поле \`<input type="number" class="step" v-model.number="step">\`;
- \`<output>{{ count }}</output>\`;
- кнопки \`<button class="dec">−</button>\` і \`<button class="inc">+</button>\` змінюють \`count\` на \`step\`; кнопка \`disabled\`, якщо крок виведе за межі \`[min, max]\` (через \`computed\`);
- \`<p class="parity">\` — \`парне\` або \`непарне\`;
- \`<button class="reset">Скинути</button>\` повертає \`count\` до \`min\`.

**Де трапляється:** вибір кількості товару, гостей у бронюванні, кроку в налаштуваннях — значення з межами і похідним станом.

**Аналогія:** \`ref\` — комірка стану, як \`useState\`, але її **мутують** (\`count.value += step.value\`); \`computed\` — як \`useMemo\`, лише залежності відстежуються автоматично.
`,
      html: HTML, css: CSS,
      js: `<!-- file: Counter.vue -->
<script setup>
import { ref, computed } from 'vue';
const props = defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 10 }
});
// TODO: count, step, canDec, canInc, isEven, функції
</script>

<template>
  <div>
    <input type="number" class="step">
    <output>0</output>
    <button class="dec">−</button>
    <button class="inc">+</button>
    <p class="parity"></p>
    <button class="reset">Скинути</button>
  </div>
</template>

<!-- file: App.vue -->
<script setup>
import Counter from './Counter.vue';
</script>

<template>
  <Counter :min="0" :max="10" />
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: Counter.vue -->
<script setup>
import { ref, computed } from 'vue';
const props = defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 10 }
});
const count = ref(props.min);
const step = ref(1);
const canDec = computed(() => count.value - step.value >= props.min);
const canInc = computed(() => count.value + step.value <= props.max);
const isEven = computed(() => count.value % 2 === 0);
function dec() { if (canDec.value) count.value -= step.value; }
function inc() { if (canInc.value) count.value += step.value; }
</script>

<template>
  <div>
    <input type="number" class="step" v-model.number="step">
    <output>{{ count }}</output>
    <button class="dec" :disabled="!canDec" @click="dec">−</button>
    <button class="inc" :disabled="!canInc" @click="inc">+</button>
    <p class="parity">{{ isEven ? 'парне' : 'непарне' }}</p>
    <button class="reset" @click="count = min">Скинути</button>
  </div>
</template>

<!-- file: App.vue -->
<script setup>
import Counter from './Counter.vue';
</script>

<template>
  <Counter :min="0" :max="10" />
</template>
` },
      hints: ['`const count = ref(props.min); const step = ref(1);` у скрипті — через `.value`, у шаблоні — без.', '`const canInc = computed(() => count.value + step.value <= props.max)` і `:disabled="!canInc"`.'],
      tests: [
        { name: 'клік і парність', code: "const m = mount(Counter);\nconst q = (s) => m.container.querySelector(s);\nexpect(q('output').textContent).toBe('0');\nexpect(q('.parity').textContent).toBe('парне');\nclick(q('.inc'));\nawait nextTick();\nexpect(q('output').textContent).toBe('1');\nexpect(q('.parity').textContent).toBe('непарне');" },
        { name: 'крок і межі', code: "const m = mount(Counter, { min: 0, max: 10 });\nconst q = (s) => m.container.querySelector(s);\nawait typeInto(q('.step'), '5');\nclick(q('.inc'));\nawait nextTick();\nexpect(q('output').textContent).toBe('5');\nclick(q('.inc'));\nawait nextTick();\nexpect(q('output').textContent).toBe('10');\nexpect(q('.inc').disabled).toBe(true);\nexpect(q('.dec').disabled).toBe(false);" },
        { name: 'min і скидання', code: "const m = mount(Counter, { min: 3, max: 5 });\nconst q = (s) => m.container.querySelector(s);\nexpect(q('output').textContent).toBe('3');\nexpect(q('.dec').disabled).toBe(true);\nclick(q('.inc'));\nclick(q('.inc'));\nawait nextTick();\nexpect(q('output').textContent).toBe('5');\nclick(q('.reset'));\nawait nextTick();\nexpect(q('output').textContent).toBe('3');" }
      ],
      explanation: '`v-model.number` перетворює рядок з поля на число (інакше `5 + \'5\'` = `\'55\'` — модуль «Типи»). Оновлення DOM асинхронні: після `click` чекаємо `await nextTick()`. Два кліки поспіль — одне оновлення DOM (батчинг, як у React 18).'
    },
    {
      id: 'vb-quiz-async-dom', group: 'reactivity', type: 'quiz', level: 2, interview: true,
      title: 'Коли оновлюється DOM',
      question: `
Що виведе код (кнопка показує \`{{ count }}\`, початково 0)?

\`\`\`js
count.value++;
console.log(button.textContent);
await nextTick();
console.log(button.textContent);
\`\`\`
`,
      options: [
        '`0`, потім `1`: DOM оновлюється асинхронно, у мікрозадачі',
        '`1`, потім `1`: присвоєння одразу синхронно оновлює DOM',
        '`0`, потім `0`: без $forceUpdate DOM не зміниться',
        '`1`, потім `2`: nextTick ще раз збільшує значення'
      ],
      answer: 0,
      why: [
        'Так: перевірено на Vue 3.5 — «sync=0 afterTick=1».',
        'Ні: зміни накопичуються в черзі, щоб кілька змін дали одне оновлення.',
        'Ні: реактивність сама планує оновлення.',
        'Ні: nextTick лише чекає завершення оновлення.'
      ],
      hint: 'Згадайте «рендер мікрозадачею» з кроку 4 міні-фреймворку.',
      explanation: 'Vue збирає зміни в чергу і виконує оновлення в мікрозадачі — три зміни поспіль дадуть один рендер (перевірено: `updates=1`). `nextTick()` — проміс, що виконається після оновлення DOM: потрібен, щоб виміряти DOM або поставити фокус після зміни стану.'
    },
    {
      id: 'vb-quiz-destructure', group: 'reactivity', type: 'quiz', level: 3,
      title: 'Деструктуризація reactive',
      question: `
Чи оновиться шаблон \`{{ state.count }}\` після кліку на кнопку з \`inc\`?

\`\`\`js
const state = reactive({ count: 0 });
let { count } = state;
function inc() { count++; }
\`\`\`
`,
      options: [
        'Ні: `count` — копія числа, зв\'язок з Proxy втрачено',
        'Так: деструктуризація reactive зберігає реактивність',
        'Так, бо змінну оголошено через `let`, а не `const`',
        'Ні, але лише в режимі розробки, не в продакшені'
      ],
      answer: 0,
      why: [
        'Так: перевірено — після inc лишається 0, а `state.count++` дає 1.',
        'Ні: Proxy перехоплює лише звернення через сам об\'єкт.',
        'Ні: `let` лише дозволяє змінювати локальну копію.',
        'Ні: поведінка однакова всюди.'
      ],
      hint: 'Що саме перехоплює Proxy — змінну чи звернення `state.count`?',
      explanation: 'Рішення: звертатися через `state.count`, `toRefs(state)` (кожна властивість — ref, пов\'язаний з об\'єктом) або використовувати `ref`. Та сама пастка з props (`const { title } = defineProps()` — у Vue 3.5 компілятор робить деструктуризацію props реактивною, але лише для `defineProps`) і зі сторами Pinia (`storeToRefs`).'
    },
    {
      id: 'vb-reactivity-theory', group: 'reactivity', type: 'theory', level: 2, interview: true,
      title: 'ref, reactive, computed: як працює реактивність',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        '`ref(x)` — об\'єкт з властивістю `.value`; у шаблоні розгортається автоматично',
        '`reactive(obj)` повертає Proxy; працює лише з об\'єктами (масиви, Map, Set), не з примітивами',
        '`computed` кешує результат і перераховує лише тоді, коли змінилися реактивні залежності',
        'Заміна всього об\'єкта `state = reactive({...})` зберігає підписки шаблону',
        'Під час читання Vue запам\'ятовує, який ефект (render, computed, watch) прочитав властивість, а під час запису — перезапускає ці ефекти'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: обгортка потрібна, бо примітив не можна відстежити за посиланням.',
        'Так: для примітивів — ref.',
        'Так: перевірено — зміна іншого ref не викликає getter (calls лишився 1).',
        'Ні: шаблон підписаний на старий Proxy; змінюйте властивості або використовуйте ref.',
        'Так: track при get, trigger при set.'
      ],
      hint: 'Хто «знає», що шаблон залежить від `count`?',
      answer: `
**Механізм (як у вашому observable на Proxy):**
1. render-функція виконується як **ефект**; читання \`state.count\` викликає \`track(state, 'count')\` — ефект записується в залежності;
2. запис \`state.count = 1\` викликає \`trigger(state, 'count')\` — Vue ставить у чергу всі ефекти, що читали цю властивість;
3. черга виконується в мікрозадачі — один рендер на пакет змін.

| | \`ref\` | \`reactive\` |
|---|---|---|
| Типи | будь-які | лише об'єкти |
| Доступ у скрипті | \`.value\` | напряму |
| Заміна цілком | \`r.value = {...}\` — ок | ламає зв'язок |
| Деструктуризація | — | втрачає реактивність → \`toRefs\` |

Офіційна рекомендація — **\`ref\` за замовчуванням**. \`ref\` з об'єктом робить його глибоко реактивним (через \`reactive\`); \`shallowRef\` — лише \`.value\` (великі незмінні дані).

**computed** — лінивий кешований ефект; не мутуйте стан усередині getter-а. **Порівняння з React:** немає масивів залежностей і \`useMemo\` — залежності відстежуються під час виконання.
`,
      keyPoints: ['ref — .value, будь-які типи', 'reactive — Proxy для об\'єктів', 'computed кешується', 'track при читанні, trigger при записі', 'Не замінюйте reactive цілком']
    },
    // ---------------------------------------------------------------- directives
    {
      id: 'vb-todo-list', group: 'directives', type: 'dom', runtime: 'vue', level: 2,
      title: 'Список задач: v-for, v-if, події',
      description: `
**Завдання.** Напишіть \`TodoList.vue\` з пропом \`initial\` (масив \`{ id, text, done }\`, за замовчуванням порожній):
- форма \`<form @submit.prevent="add">\` з полем \`v-model.trim\` і кнопкою \`Додати\`; порожній текст не додається; після додавання поле очищується;
- якщо задачі є — \`<ul>\` з \`<li v-for … :key="t.id">\`, клас \`done\` для виконаних; у кожному \`<label><input type="checkbox" v-model="t.done"> <span>{{ t.text }}</span></label>\` і \`<button class="remove">✕</button>\`;
- якщо задач немає — \`<p class="empty">Задач немає</p>\` (\`v-else\`);
- \`<p class="left">Залишилось: N</p>\` — кількість невиконаних (\`computed\`).

**Де трапляється:** списки задач, коментарів, товарів у кошику — рендер масиву з додаванням, видаленням і фільтрами.

**Аналогія:** \`v-for\` = \`map\` у JSX, \`:key\` — та сама ідентичність (крок 6 міні-фреймворку); \`@submit.prevent\` = \`onSubmit\` + \`e.preventDefault()\`. На відміну від React, масив можна мутувати (\`push\`, \`splice\`) — Proxy це відстежить.
`,
      html: HTML, css: CSS,
      js: `<!-- file: TodoList.vue -->
<script setup>
import { ref, computed } from 'vue';
const props = defineProps({ initial: { type: Array, default: () => [] } });
// TODO: todos (копія initial), text, remaining, add, remove
</script>

<template>
  <div>
    <form>
      <input placeholder="Нова задача">
      <button>Додати</button>
    </form>
    <!-- TODO: список або порожній стан -->
    <p class="left">Залишилось: 0</p>
  </div>
</template>

<!-- file: App.vue -->
<script setup>
import TodoList from './TodoList.vue';
</script>

<template>
  <TodoList :initial="[{ id: 1, text: 'Вивчити ref', done: true }, { id: 2, text: 'Вивчити v-for', done: false }]" />
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: TodoList.vue -->
<script setup>
import { ref, computed } from 'vue';
const props = defineProps({ initial: { type: Array, default: () => [] } });
const todos = ref(props.initial.map((t) => ({ ...t })));
const text = ref('');
const remaining = computed(() => todos.value.filter((t) => !t.done).length);
let nextId = 1000;
function add() {
  if (!text.value) return;
  todos.value.push({ id: nextId++, text: text.value, done: false });
  text.value = '';
}
function remove(id) {
  todos.value = todos.value.filter((t) => t.id !== id);
}
</script>

<template>
  <div>
    <form @submit.prevent="add">
      <input v-model.trim="text" placeholder="Нова задача">
      <button>Додати</button>
    </form>
    <ul v-if="todos.length">
      <li v-for="t in todos" :key="t.id" :class="{ done: t.done }">
        <label><input type="checkbox" v-model="t.done"> <span>{{ t.text }}</span></label>
        <button class="remove" @click="remove(t.id)">✕</button>
      </li>
    </ul>
    <p v-else class="empty">Задач немає</p>
    <p class="left">Залишилось: {{ remaining }}</p>
  </div>
</template>

<!-- file: App.vue -->
<script setup>
import TodoList from './TodoList.vue';
</script>

<template>
  <TodoList :initial="[{ id: 1, text: 'Вивчити ref', done: true }, { id: 2, text: 'Вивчити v-for', done: false }]" />
</template>
` },
      hints: ['`const todos = ref(props.initial.map((t) => ({ ...t })))` — копія, щоб не мутувати проп; `todos.value.push(...)` у `add`.', '`<ul v-if="todos.length">` … `<p v-else class="empty">`; `<li v-for="t in todos" :key="t.id" :class="{ done: t.done }">`.'],
      tests: [
        { name: 'додавання і trim', code: "const m = mount(TodoList);\nconst form = m.container.querySelector('form');\nexpect(m.container.querySelector('.empty').textContent).toBe('Задач немає');\nawait typeInto(form.querySelector('input'), '  Купити хліб  ');\nconst r = submit(form);\nawait nextTick();\nexpect(r.prevented).toBe(true);\nexpect([...m.container.querySelectorAll('li span')].map((s) => s.textContent)).toEqual(['Купити хліб']);\nexpect(form.querySelector('input').value).toBe('');\nawait typeInto(form.querySelector('input'), '   ');\nsubmit(form);\nawait nextTick();\nexpect(m.container.querySelectorAll('li').length).toBe(1);" },
        { name: 'перемикання і лічильник', code: "const m = mount(TodoList, { initial: [{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: false }] });\nexpect(m.container.querySelector('.left').textContent).toBe('Залишилось: 2');\nclick(m.container.querySelectorAll('input[type=checkbox]')[1]);\nawait nextTick();\nexpect(m.container.querySelectorAll('li')[1].className).toBe('done');\nexpect(m.container.querySelector('.left').textContent).toBe('Залишилось: 1');" },
        { name: 'видалення до порожнього стану, проп не мутується', code: "const initial = [{ id: 1, text: 'a', done: false }];\nconst m = mount(TodoList, { initial });\nclick(m.container.querySelector('.remove'));\nawait nextTick();\nexpect(m.container.querySelector('ul')).toBeNull();\nexpect(m.container.querySelector('.empty')).toBeTruthy();\nexpect(initial.length).toBe(1);" }
      ],
      explanation: 'Мутація `todos.value.push()` і заміна `todos.value = filter(...)` — обидва способи реактивні. Копія `initial` важлива: проп належить батькові. `v-if` повністю прибирає/створює елементи; `v-show` лише перемикає `display`. `v-model` на чекбоксі всередині `v-for` мутує сам об\'єкт задачі — зручно, але в спільному сторі краще явні дії.'
    },
    {
      id: 'vb-quiz-vif-vfor', group: 'directives', type: 'quiz', level: 3, interview: true,
      title: 'v-if і v-for на одному елементі',
      question: `
Що станеться у Vue 3?

\`\`\`vue
<li v-for="t in todos" v-if="t.done" :key="t.id">{{ t.text }}</li>
\`\`\`
`,
      options: [
        'Помилка: v-if виконується раніше за v-for, `t` не визначено',
        'Відрендеряться лише виконані задачі — як filter()',
        'v-if ігнорується, тож рендеряться всі задачі списку',
        'Відрендериться лише перша виконана задача зі списку'
      ],
      answer: 0,
      why: [
        'Так: перевірено — «Cannot read properties of undefined (reading \'done\')».',
        'Ні: так працювало у Vue 2 (там v-for мав вищий пріоритет).',
        'Ні: v-if виконується, і саме першим.',
        'Ні: до циклу справа не доходить.'
      ],
      hint: 'У Vue 2 і Vue 3 пріоритет цих директив різний.',
      explanation: 'Правильно: фільтр у `computed` (`doneTodos`) і `v-for` по ньому, або `<template v-for>` з `<li v-if>` усередині. Офіційний стиль-гайд забороняє ставити обидві директиви на один елемент.'
    },
    {
      id: 'vb-quiz-vshow', group: 'directives', type: 'quiz', interview: true, level: 2,
      title: 'v-if чи v-show',
      question: 'Панель фільтрів користувач відкриває й закриває десятки разів, вона містить поля зі станом. Що краще?',
      options: [
        '`v-show`: створюється раз, перемикається лише `display`',
        '`v-if`: щоразу створює компонент заново — так швидше',
        'Різниці немає: обидві директиви лише ховають елемент',
        '`v-for` по масиву з одним елементом-панеллю'
      ],
      answer: 0,
      why: [
        'Так: дешеве перемикання; ціна — початковий рендер навіть прихованого вмісту.',
        'Ні: створення і знищення дорожчі, а стан полів втрачається.',
        'Ні: v-if прибирає елемент з DOM і знищує компоненти.',
        'Ні: це не має сенсу.'
      ],
      hint: 'Що дорожче: часто створювати DOM чи один раз відрендерити прихований?',
      explanation: '`v-if` — для рідких перемикань і того, що часто не знадобиться (ліниво); `v-show` — для частих. Зберегти стан при `v-if` / перемиканні компонентів допомагає `<KeepAlive>`. У React аналог v-show — `hidden`/CSS, аналог v-if — умовний рендер.'
    },
    // ---------------------------------------------------------------- forms
    {
      id: 'vb-signup', group: 'forms', type: 'dom', runtime: 'vue', level: 2,
      title: 'Форма реєстрації: v-model і валідація',
      description: `
**Завдання.** Напишіть \`SignupForm.vue\`, що емітить подію \`register\`:
- поля: \`<input name="email" v-model.trim>\`, \`<input name="age" type="number" v-model.number>\`, \`<select name="plan">\` з опціями \`free\` / \`pro\` (за замовчуванням \`free\`), \`<input name="agree" type="checkbox">\`;
- помилки (\`computed\`): email без \`@\` → \`Некоректний email\`; вік менше 18 або порожній → \`Від 18 років\`; без згоди → \`Потрібна згода\`;
- помилки показуються **лише після першої спроби** відправки: \`<p class="error">\` для кожної;
- сабміт (\`@submit.prevent\`) без помилок → \`emit('register', { email, age, plan })\`.

**Де трапляється:** реєстрація, логін, оформлення замовлення — поля з \`v-model\` і валідацією є майже в кожному застосунку.

**Аналогія:** \`v-model\` — це \`:value\` + \`@input\` (контрольоване поле з React без ручного onChange); модифікатори \`.trim\` і \`.number\` замінюють ручне перетворення.
`,
      html: HTML, css: CSS,
      js: `<!-- file: SignupForm.vue -->
<script setup>
import { ref, computed } from 'vue';
const emit = defineEmits(['register']);
// TODO: email, age, plan, agree, submitted, errors, onSubmit
</script>

<template>
  <form>
    <input name="email" placeholder="Email">
    <input name="age" type="number" placeholder="Вік">
    <select name="plan">
      <option value="free">Free</option>
      <option value="pro">Pro</option>
    </select>
    <label><input name="agree" type="checkbox"> Погоджуюсь з умовами</label>
    <button>Зареєструватися</button>
  </form>
</template>

<!-- file: App.vue -->
<script setup>
import SignupForm from './SignupForm.vue';
function onRegister(data) { console.log('register', data); }
</script>

<template>
  <SignupForm @register="onRegister" />
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: SignupForm.vue -->
<script setup>
import { ref, computed } from 'vue';
const emit = defineEmits(['register']);
const email = ref('');
const age = ref('');
const plan = ref('free');
const agree = ref(false);
const submitted = ref(false);
const errors = computed(() => {
  const list = [];
  if (!email.value.includes('@')) list.push('Некоректний email');
  if (!(Number(age.value) >= 18)) list.push('Від 18 років');
  if (!agree.value) list.push('Потрібна згода');
  return list;
});
function onSubmit() {
  submitted.value = true;
  if (errors.value.length) return;
  emit('register', { email: email.value, age: age.value, plan: plan.value });
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <input name="email" v-model.trim="email" placeholder="Email">
    <input name="age" type="number" v-model.number="age" placeholder="Вік">
    <select name="plan" v-model="plan">
      <option value="free">Free</option>
      <option value="pro">Pro</option>
    </select>
    <label><input name="agree" type="checkbox" v-model="agree"> Погоджуюсь з умовами</label>
    <template v-if="submitted">
      <p v-for="e in errors" :key="e" class="error">{{ e }}</p>
    </template>
    <button>Зареєструватися</button>
  </form>
</template>

<!-- file: App.vue -->
<script setup>
import SignupForm from './SignupForm.vue';
function onRegister(data) { console.log('register', data); }
</script>

<template>
  <SignupForm @register="onRegister" />
</template>
` },
      hints: ['`const errors = computed(() => { const list = []; if (!email.value.includes(\'@\')) list.push(\'Некоректний email\'); … return list; })`.', 'Окремий `submitted = ref(false)`: у `onSubmit` ставимо `true`, у шаблоні `<template v-if="submitted"><p v-for="e in errors" …>`.'],
      tests: [
        { name: 'помилки лише після сабміту', code: "const onRegister = mockFn();\nconst m = mount(SignupForm, { onRegister });\nexpect(m.container.querySelectorAll('.error').length).toBe(0);\nsubmit(m.container.querySelector('form'));\nawait nextTick();\nexpect([...m.container.querySelectorAll('.error')].map((e) => e.textContent)).toEqual(['Некоректний email', 'Від 18 років', 'Потрібна згода']);\nexpect(onRegister).not.toHaveBeenCalled();" },
        { name: 'успішна реєстрація', code: "const onRegister = mockFn();\nconst m = mount(SignupForm, { onRegister });\nconst f = m.container.querySelector('form');\nawait typeInto(f.querySelector('[name=email]'), '  a@b.c ');\nawait typeInto(f.querySelector('[name=age]'), '20');\nawait typeInto(f.querySelector('[name=plan]'), 'pro');\nclick(f.querySelector('[name=agree]'));\nawait nextTick();\nsubmit(f);\nawait nextTick();\nexpect(m.container.querySelectorAll('.error').length).toBe(0);\nexpect(onRegister).toHaveBeenCalledWith({ email: 'a@b.c', age: 20, plan: 'pro' });" },
        { name: 'помилки зникають після виправлення', code: "const m = mount(SignupForm, { onRegister: mockFn() });\nconst f = m.container.querySelector('form');\nsubmit(f);\nawait nextTick();\nawait typeInto(f.querySelector('[name=age]'), '17');\nexpect([...m.container.querySelectorAll('.error')].map((e) => e.textContent)).toContain('Від 18 років');\nawait typeInto(f.querySelector('[name=age]'), '30');\nexpect([...m.container.querySelectorAll('.error')].map((e) => e.textContent)).not.toContain('Від 18 років');" }
      ],
      explanation: 'Помилки — похідний стан (`computed`), а не окремі ref-и, які треба синхронізувати. `defineEmits([\'register\'])` також прибирає `onRegister` з fallthrough-атрибутів. Великі форми у Vue — VeeValidate або FormKit зі схемами Zod/Valibot; доступність — `aria-invalid`, `aria-describedby` (модуль «Доступність»).'
    },
    {
      id: 'vb-quiz-vmodel', group: 'forms', type: 'quiz', level: 2,
      title: 'Що робить v-model на компоненті',
      question: 'На що компілюється `<SearchBox v-model="query" />` у Vue 3?',
      options: [
        '`:modelValue="query"` + `@update:modelValue="v => query = v"`',
        '`:value="query"` + `@input="query = $event.target.value"`',
        '`:query="query"` + `@change="query = $event"`',
        'Двосторонній зв\'язок: дитина напряму змінює змінну батька'
      ],
      answer: 0,
      why: [
        'Так: дитина отримує проп і емітить подію; `defineModel()` робить це за вас.',
        'Ні: так v-model працює на нативному `<input>`.',
        'Ні: імена фіксовані — modelValue / update:modelValue (або v-model:назва).',
        'Ні: потік даних односпрямований, це лише синтаксичний цукор.'
      ],
      hint: 'v-model на компоненті — це проп + подія з фіксованими іменами.',
      explanation: '`v-model:title="t"` → проп `title` + подія `update:title` — кілька v-model на одному компоненті. У дочірньому компоненті: `const model = defineModel()` (з Vue 3.4) — ref, запис у який емітить подію. У Vue 2 використовувались `value` / `input`.'
    },
    // ---------------------------------------------------------------- components
    {
      id: 'vb-todo-item', group: 'components', type: 'dom', runtime: 'vue', level: 2,
      title: 'Дочірній компонент: props вниз, події вгору',
      description: `
**Завдання.** Напишіть два компоненти:
- \`TodoItem.vue\`: проп \`todo\` (\`{ id, text, done }\`, обов'язковий); емітить \`toggle\` і \`remove\` з \`id\`. Розмітка: \`<li :class="{ done: todo.done }">\`, чекбокс \`:checked="todo.done"\` (подія \`change\` → \`toggle\`), \`<span>\` з текстом, кнопка \`✕\` → \`remove\`. **Проп не мутувати.**
- \`App.vue\`: стан \`todos\` (дано), рендерить \`TodoItem\` для кожної задачі й обробляє події: \`toggle\` перемикає \`done\`, \`remove\` видаляє.

**Де трапляється:** будь-який список із діями над рядком (видалити, позначити, редагувати): дитина повідомляє про намір, а дані змінює їхній власник.

**Аналогія:** «дані вниз — події вгору», як колбеки \`onToggle\` у React; тільки замість пропа-функції дитина викликає \`emit\`, а батько слухає \`@toggle\`.
`,
      html: HTML, css: CSS,
      js: `<!-- file: TodoItem.vue -->
<script setup>
// TODO: defineProps({ todo }), defineEmits(['toggle', 'remove'])
</script>

<template>
  <li>
    <!-- TODO -->
  </li>
</template>

<!-- file: App.vue -->
<script setup>
import { ref } from 'vue';
import TodoItem from './TodoItem.vue';
const todos = ref([
  { id: 1, text: 'Props', done: true },
  { id: 2, text: 'Emits', done: false },
  { id: 3, text: 'Slots', done: false }
]);
// TODO: toggle(id), remove(id)
</script>

<template>
  <ul>
    <!-- TODO: TodoItem для кожної задачі -->
  </ul>
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: TodoItem.vue -->
<script setup>
defineProps({ todo: { type: Object, required: true } });
const emit = defineEmits(['toggle', 'remove']);
</script>

<template>
  <li :class="{ done: todo.done }">
    <input type="checkbox" :checked="todo.done" @change="emit('toggle', todo.id)">
    <span>{{ todo.text }}</span>
    <button @click="emit('remove', todo.id)">✕</button>
  </li>
</template>

<!-- file: App.vue -->
<script setup>
import { ref } from 'vue';
import TodoItem from './TodoItem.vue';
const todos = ref([
  { id: 1, text: 'Props', done: true },
  { id: 2, text: 'Emits', done: false },
  { id: 3, text: 'Slots', done: false }
]);
function toggle(id) {
  const t = todos.value.find((x) => x.id === id);
  if (t) t.done = !t.done;
}
function remove(id) {
  todos.value = todos.value.filter((x) => x.id !== id);
}
</script>

<template>
  <ul>
    <TodoItem v-for="t in todos" :key="t.id" :todo="t" @toggle="toggle" @remove="remove" />
  </ul>
</template>
` },
      hints: ['У TodoItem: `const emit = defineEmits([\'toggle\', \'remove\'])` і `@change="emit(\'toggle\', todo.id)"`.', 'В App: `<TodoItem v-for="t in todos" :key="t.id" :todo="t" @toggle="toggle" @remove="remove" />`.'],
      tests: [
        { name: 'TodoItem емітить події з id', code: "const onToggle = mockFn();\nconst onRemove = mockFn();\nconst m = mount(TodoItem, { todo: { id: 7, text: 'x', done: true }, onToggle, onRemove });\nexpect(m.container.querySelector('li').className).toBe('done');\nexpect(m.container.querySelector('input').checked).toBe(true);\nclick(m.container.querySelector('input'));\nclick(m.container.querySelector('button'));\nexpect(onToggle).toHaveBeenCalledWith(7);\nexpect(onRemove).toHaveBeenCalledWith(7);" },
        { name: 'TodoItem не мутує проп', code: "const todo = { id: 1, text: 'x', done: false };\nconst m = mount(TodoItem, { todo, onToggle: mockFn() });\nclick(m.container.querySelector('input'));\nawait nextTick();\nexpect(todo.done).toBe(false);" },
        { name: 'App: перемикання і видалення', code: "const m = mount(App);\nconst items = () => [...m.container.querySelectorAll('li')];\nexpect(items().map((li) => li.querySelector('span').textContent)).toEqual(['Props', 'Emits', 'Slots']);\nclick(items()[1].querySelector('input'));\nawait nextTick();\nexpect(items()[1].className).toBe('done');\nclick(items()[0].querySelector('button'));\nawait nextTick();\nexpect(items().map((li) => li.querySelector('span').textContent)).toEqual(['Emits', 'Slots']);" }
      ],
      explanation: 'Власник даних (App) — єдиний, хто їх змінює; TodoItem лише повідомляє про намір. Оголошені `emits` документують API компонента і не потрапляють у `$attrs`. З TypeScript: `defineEmits<{ toggle: [id: number]; remove: [id: number] }>()`.'
    },
    {
      id: 'vb-data-list', group: 'components', type: 'dom', runtime: 'vue', level: 3,
      title: 'Слоти: іменовані, scoped, з fallback',
      description: `
**Завдання.** Напишіть універсальний \`DataList.vue\` з пропами \`items\` (масив) і \`loading\` (булеве):
- корінь \`<section class="list">\`; спершу іменований слот \`header\` (без fallback);
- \`loading\` → \`<p class="loading">Завантаження…</p>\`;
- порожній масив → слот \`empty\` з fallback \`Порожньо\`;
- інакше \`<ul>\` з \`<li>\` для кожного елемента, у якому **scoped-слот** \`item\` з пропами \`item\` і \`index\`; fallback — \`{{ item }}\`.

**Де трапляється:** таблиці й списки в UI-бібліотеках (Vuetify, Element Plus, PrimeVue): батько через слоти визначає вигляд рядка, порожнього стану й завантаження.

Компонент не знає, як виглядає елемент, — це вирішує батько: \`<template #item="{ item, index }">…</template>\`.

**Аналогія:** слот за замовчуванням — \`children\` у React; scoped-слот — **render prop** (\`renderItem={(item, i) => …}\`).
`,
      html: HTML, css: CSS,
      js: `<!-- file: DataList.vue -->
<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  loading: Boolean
});
</script>

<template>
  <section class="list">
    <!-- TODO: header, loading, empty, ul з scoped-слотом item -->
  </section>
</template>

<!-- file: App.vue -->
<script setup>
import DataList from './DataList.vue';
const users = [{ id: 1, name: 'Ann' }, { id: 2, name: 'Bob' }];
</script>

<template>
  <DataList :items="users">
    <template #header><h3>Користувачі</h3></template>
    <template #item="{ item, index }">{{ index + 1 }}. {{ item.name }}</template>
  </DataList>
  <DataList :items="[]" />
</template>
`,
      editable: ['js'],
      solution: { js: `<!-- file: DataList.vue -->
<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  loading: Boolean
});
</script>

<template>
  <section class="list">
    <slot name="header" />
    <p v-if="loading" class="loading">Завантаження…</p>
    <slot v-else-if="!items.length" name="empty">Порожньо</slot>
    <ul v-else>
      <li v-for="(item, index) in items" :key="index">
        <slot name="item" :item="item" :index="index">{{ item }}</slot>
      </li>
    </ul>
  </section>
</template>

<!-- file: App.vue -->
<script setup>
import DataList from './DataList.vue';
const users = [{ id: 1, name: 'Ann' }, { id: 2, name: 'Bob' }];
</script>

<template>
  <DataList :items="users">
    <template #header><h3>Користувачі</h3></template>
    <template #item="{ item, index }">{{ index + 1 }}. {{ item.name }}</template>
  </DataList>
  <DataList :items="[]" />
</template>
` },
      hints: ['`<slot name="item" :item="item" :index="index">{{ item }}</slot>` усередині `<li v-for="(item, index) in items">` — вміст тегу slot є fallback.', 'Ланцюжок: `<p v-if="loading">` → `<slot v-else-if="!items.length" name="empty">Порожньо</slot>` → `<ul v-else>`.'],
      tests: [
        { name: 'scoped-слот отримує item і index', code: "const m = mount(DataList, { items: [{ name: 'Ann' }, { name: 'Bob' }] }, { item: ({ item, index }) => Vue.h('b', index + ':' + item.name), header: () => Vue.h('h3', 'Заголовок') });\nexpect(m.container.querySelector('h3').textContent).toBe('Заголовок');\nexpect([...m.container.querySelectorAll('li b')].map((b) => b.textContent)).toEqual(['0:Ann', '1:Bob']);" },
        { name: 'fallback елемента і порожнього стану', code: "const m = mount(DataList, { items: ['x', 'y'] });\nexpect([...m.container.querySelectorAll('li')].map((li) => li.textContent)).toEqual(['x', 'y']);\nconst e = mount(DataList, { items: [] });\nexpect(e.container.querySelector('section').textContent.trim()).toBe('Порожньо');\nexpect(e.container.querySelector('ul')).toBeNull();" },
        { name: 'власний empty і loading', code: "const e = mount(DataList, { items: [] }, { empty: () => 'Нічого не знайдено' });\nexpect(e.container.textContent.trim()).toBe('Нічого не знайдено');\nconst l = mount(DataList, { items: [1], loading: true });\nexpect(l.container.querySelector('.loading').textContent).toBe('Завантаження…');\nexpect(l.container.querySelector('ul')).toBeNull();" }
      ],
      explanation: 'Слоти — головний інструмент композиції у Vue: таблиці, списки, модалки, layout-и. Scoped-слот передає дані дитини батькові (інверсія керування), як render props у React. `defineSlots<{ item(props: { item: T; index: number }): any }>()` типізує слоти в TS; `$slots.header` дозволяє перевірити, чи слот передано.'
    },
    {
      id: 'vb-quiz-prop-mutate', group: 'components', type: 'quiz', level: 2, interview: true,
      title: 'Зміна пропа в дочірньому компоненті',
      question: `
Що станеться після кліку?

\`\`\`vue
<script setup>
const props = defineProps({ title: String });
function rename() { props.title = 'Новий'; }
</script>
<template><h1 @click="rename">{{ title }}</h1></template>
\`\`\`
`,
      options: [
        'Не зміниться: props лише для читання, буде попередження',
        'Заголовок зміниться і в дитині, і в батьківському компоненті',
        'Заголовок зміниться лише в дочірньому компоненті',
        'Помилка компіляції шаблону через присвоєння'
      ],
      answer: 0,
      why: [
        'Так: перевірено — «Set operation on key "title" failed: target is readonly».',
        'Ні: потік даних односпрямований.',
        'Ні: props — readonly Proxy.',
        'Ні: код компілюється, помилка виникає під час виконання.'
      ],
      hint: 'Кому належать props?',
      explanation: 'Правильно: емітити подію (`emit(\'update:title\', …)` або `defineModel`), або завести локальну копію `const draft = ref(props.title)`, якщо потрібна чернетка. Об\'єкти в props технічно можна мутувати всередині (`props.user.name = …`), але це той самий антипатерн — зміни приховано від власника.'
    },
    {
      id: 'vb-quiz-fallthrough', group: 'components', type: 'quiz', level: 2,
      title: 'Fallthrough-атрибути: class і data-*',
      question: `
\`Child.vue\` не оголошує props, його шаблон — \`<div class="b">child</div>\`. Що буде в DOM?

\`\`\`vue
<Child class="a" data-x="1" />
\`\`\`
`,
      options: [
        '`<div class="b a" data-x="1">` — атрибути переходять на корінь',
        '`<div class="a" data-x="1">` — клас батька замінює клас дитини',
        '`<div class="b">` — неоголошені атрибути відкидаються',
        'Попередження і помилка: атрибути треба оголосити як props'
      ],
      answer: 0,
      why: [
        'Так: перевірено на Vue 3.5 — `class=b a`, `data-x=1`; class і style зливаються.',
        'Ні: class зливається, а не замінюється.',
        'Ні: неоголошені атрибути потрапляють у `$attrs` і на корінь.',
        'Ні: це штатна поведінка.'
      ],
      hint: 'Куди дівається атрибут, який компонент не оголосив як prop чи emit?',
      explanation: 'Так обгортки над нативними елементами (кнопка, поле) приймають будь-які атрибути (`aria-*`, `disabled`, `onClick`). Щоб перенести їх не на корінь, а на внутрішній `<input>`: `defineOptions({ inheritAttrs: false })` + `<input v-bind="$attrs">`. Компонент із кількома кореневими вузлами має явно вказати, куди йдуть `$attrs`, інакше Vue попередить.'
    },
    {
      id: 'vb-components-theory', group: 'components', type: 'theory', level: 2, interview: true,
      title: 'Компоненти Vue: props, emits, attrs, slots',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Атрибути, не оголошені як props чи emits (class, style, data-*, onClick), автоматично потрапляють на кореневий елемент дитини',
        'Статичний `class` батька зливається з класом кореня дитини, а не замінює його',
        'Props валідуються в рантаймі (type, required, validator) — попередження в консолі в режимі розробки',
        'Дитина може напряму викликати функцію батька без props чи emits через `this.$parent` — це рекомендований спосіб',
        'Слот за замовчуванням передає дитині розмітку від батька, а scoped-слот ще й дає батькові дані дитини для цієї розмітки'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: fallthrough attributes; `inheritAttrs: false` + `v-bind="$attrs"` — щоб перенести на інший елемент.',
        'Так: перевірено — `class="b a"`.',
        'Так: на продакшені перевірки вимкнено.',
        'Ні: `$parent` створює приховану залежність; для глибини — provide/inject або стор.',
        'Так: обидва передають розмітку; у React їхні аналоги — `children` і render prop.'
      ],
      hint: 'Що відбувається з атрибутом, який компонент не оголосив?',
      answer: `
**API компонента:**
- **props** — вхідні дані (лише читання), з типами й дефолтами; у TS — \`defineProps<{ title: string; count?: number }>()\` + \`withDefaults\` (або деструктуризація з дефолтами у Vue 3.5);
- **emits** — події вгору: \`emit('select', id)\`; батько слухає \`@select\`;
- **v-model** — проп + подія (\`defineModel\`);
- **slots** — розмітка від батька: за замовчуванням, іменовані (\`#header\`), scoped (\`#item="{ item }"\`);
- **attrs** — усе неоголошене (fallthrough на корінь); компонент з кількома кореневими вузлами має явно вказати, куди йдуть \`$attrs\`;
- **expose** — \`defineExpose({ focus })\` відкриває методи для батьківського template ref (компоненти з \`<script setup>\` закриті за замовчуванням).

**Реєстрація:** у \`<script setup>\` імпортований компонент доступний у шаблоні одразу (локальна реєстрація); глобальна — \`app.component()\` (погано для tree shaking).

**Порівняння з React:** у React усе — props (зокрема \`children\` і колбеки); у Vue — окремі механізми для даних, подій, розмітки й атрибутів.
`,
      keyPoints: ['Fallthrough attrs і злиття class', 'Рантайм-валідація props', 'emits замість колбеків', 'Слоти ≈ children / render props', 'Без $parent']
    }
  ]
});
})();
