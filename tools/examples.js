/*
 * Еталонні приклади кожного типу завдань (завантажуються лише валідатором з ?examples=1).
 * Використовуйте як зразок формату під час написання data/<topic>.js.
 */
FE.topic('js-functions', {
  intro: `
**Замикання (closure)** — функція разом із посиланням на лексичне оточення, де її створено.

- Функція «пам'ятає» змінні зовнішньої області навіть після завершення зовнішньої функції.
- Кожен виклик зовнішньої функції створює **нове** оточення.

\`\`\`js
function makeCounter() {
  let count = 0;
  return () => ++count;
}
\`\`\`
`,
  items: [
    {
      id: 'example-counter',
      type: 'code',
      level: 1,
      interview: true,
      title: 'Лічильник на замиканні',
      tags: ['closures'],
      description: `
Напишіть функцію \`createCounter(start = 0)\`, яка повертає об'єкт з методами:

- \`inc()\` — збільшує значення на 1 і повертає нове значення;
- \`dec()\` — зменшує на 1 і повертає нове значення;
- \`value()\` — повертає поточне значення.

Лічильники мають бути **незалежними** один від одного.

\`\`\`js
const c = createCounter(5);
c.inc();   // 6
c.dec();   // 5
c.value(); // 5
\`\`\`
`,
      starter: `function createCounter(start = 0) {
  // ваш код
}
`,
      solution: `function createCounter(start = 0) {
  let count = start;
  return {
    inc: () => ++count,
    dec: () => --count,
    value: () => count,
  };
}
`,
      hints: [
        'Збережіть значення у локальній змінній всередині `createCounter` — методи об\'єкта матимуть до неї доступ через замикання.',
        'Префіксний інкремент `++count` змінює змінну і повертає **нове** значення.'
      ],
      tests: [
        'expect(createCounter().value()).toBe(0)',
        { name: 'inc() повертає нове значення', code: 'const c = createCounter(5);\nexpect(c.inc()).toBe(6);\nexpect(c.inc()).toBe(7);' },
        { name: 'dec() зменшує значення', code: 'const c = createCounter(1);\nexpect(c.dec()).toBe(0);\nexpect(c.value()).toBe(0);' },
        { name: 'лічильники незалежні', code: 'const a = createCounter();\nconst b = createCounter(10);\na.inc(); a.inc();\nexpect(a.value()).toBe(2);\nexpect(b.value()).toBe(10);' },
        { name: 'значення не можна змінити ззовні', code: 'const c = createCounter();\nc.count = 100;\nexpect(c.inc()).toBe(1);' }
      ],
      explanation: `
Змінна \`count\` живе в лексичному оточенні виклику \`createCounter\`. Усі три стрілкові функції створені в цьому оточенні, тому мають до нього доступ — це і є **замикання**.

Кожен виклик \`createCounter\` створює нове оточення, тому лічильники незалежні. Ззовні дістатися до \`count\` неможливо — це класичний спосіб зробити **приватний стан** (до появи \`#private\` полів у класах).

**Що можуть спитати далі:** як реалізувати те саме через клас з \`#count\`? Чи є тут витік пам'яті?
`
    },
    {
      id: 'example-debounce',
      type: 'code',
      level: 2,
      interview: true,
      title: 'debounce (з фейковими таймерами)',
      tags: ['closures', 'timers'],
      description: `
Реалізуйте \`debounce(fn, ms)\`: повертає функцію, яка викликає \`fn\` лише через \`ms\` мілісекунд **після останнього** виклику. Аргументи та \`this\` останнього виклику мають передатися в \`fn\`.
`,
      starter: `function debounce(fn, ms) {
  return fn;
}
`,
      solution: `function debounce(fn, ms) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}
`,
      hints: [
        'Зберігайте id таймера у замиканні і скасовуйте попередній таймер на кожному виклику (`clearTimeout`).',
        'Щоб зберегти `this`, повертайте звичайну `function`, а всередині `setTimeout` використайте стрілкову функцію + `fn.apply(this, args)`.'
      ],
      tests: [
        { name: 'не викликає fn одразу', code: 'useFakeTimers();\nconst f = mockFn();\nconst d = debounce(f, 100);\nd();\nexpect(f).not.toHaveBeenCalled();' },
        { name: 'викликає один раз після паузи', code: 'useFakeTimers();\nconst f = mockFn();\nconst d = debounce(f, 100);\nd(1); advanceTimersByTime(50);\nd(2); advanceTimersByTime(50);\nd(3); advanceTimersByTime(99);\nexpect(f).not.toHaveBeenCalled();\nadvanceTimersByTime(1);\nexpect(f).toHaveBeenCalledTimes(1);\nexpect(f).toHaveBeenCalledWith(3);' },
        { name: 'зберігає this', code: 'useFakeTimers();\nconst obj = { v: 42, m: debounce(function () { this.res = this.v; }, 10) };\nobj.m();\nadvanceTimersByTime(10);\nexpect(obj.res).toBe(42);' }
      ],
      explanation: `
Кожен виклик скасовує попередній таймер і ставить новий, тож \`fn\` спрацює лише коли виклики припинились на \`ms\` мс.

Складність — O(1) на виклик. Типові помилки: втрата \`this\` (стрілкова функція як обгортка) та передача аргументів першого, а не останнього виклику.
`
    },
    {
      id: 'example-fetch-json',
      type: 'code',
      level: 2,
      title: 'fetch з обробкою помилок (mockFetch)',
      tags: ['fetch', 'async'],
      description: `
Напишіть \`async function getUser(id)\`, що робить \`fetch('/api/users/' + id)\`. Якщо \`response.ok === false\` — кидайте \`Error\` з повідомленням \`HTTP <status>\`. Інакше поверніть розпарсений JSON.
`,
      starter: `async function getUser(id) {
  const res = await fetch('/api/users/' + id);
  return res.json();
}
`,
      solution: `async function getUser(id) {
  const res = await fetch('/api/users/' + id);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}
`,
      hints: ['`fetch` не відхиляє проміс при 404/500 — перевіряйте `res.ok` або `res.status` вручну.', '`throw` всередині `async` функції перетворюється на відхилений проміс.'],
      tests: [
        { name: 'повертає JSON', code: "const f = mockFetch(url => ({ id: 1, url }));\nawait expect(getUser(1)).resolves.toEqual({ id: 1, url: '/api/users/1' });\nexpect(f).toHaveBeenCalledTimes(1);" },
        { name: '404 → помилка HTTP 404', code: "mockFetch(() => ({ status: 404, body: { error: 'nope' } }));\nawait expect(getUser(2)).rejects.toThrow('HTTP 404');" },
        { name: '500 → помилка HTTP 500', code: "mockFetch(() => ({ status: 500, body: '' }));\nawait expect(getUser(3)).rejects.toThrow('HTTP 500');" }
      ],
      explanation: '`fetch` відхиляє проміс лише при мережевій помилці або abort. HTTP-помилки (4xx/5xx) — це успішна відповідь з `ok: false`, тож перевірка обов\'язкова.'
    },
    {
      id: 'example-quiz-closure-loop',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'var у циклі з setTimeout',
      question: `
Що виведе код?

\`\`\`js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
\`\`\`
`,
      options: ['`0 1 2`', '`3 3 3`', '`undefined undefined undefined`', '`0 0 0`'],
      answer: 1,
      hint: 'Скільки змінних `i` існує при використанні `var` — одна на весь цикл чи одна на кожну ітерацію?',
      explanation: `
\`var\` має функціональну (тут — глобальну) область видимості, тож існує **одна** змінна \`i\`. Колбеки \`setTimeout\` виконаються після завершення циклу, коли \`i === 3\`.

З \`let\` кожна ітерація отримує власну прив'язку \`i\`, і результат буде \`0 1 2\`.
`
    },
    {
      id: 'example-quiz-multi',
      type: 'quiz',
      level: 1,
      title: 'Які значення falsy?',
      question: 'Оберіть **усі** falsy значення:',
      options: ['`0`', '`"0"`', '`NaN`', '`[]`', '`""`', '`null`'],
      answer: [0, 2, 4, 5],
      hint: 'Falsy значень у JS рівно вісім. Порожній масив — це об\'єкт.',
      explanation: 'Falsy: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. Будь-який об\'єкт (включно з `[]` і `{}`) та непорожній рядок (`"0"`) — truthy.'
    },
    {
      id: 'example-theory-closure',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Що таке замикання?',
      question: 'Що таке замикання (closure) у JavaScript? Наведіть практичні приклади використання.',
      hint: 'Подумайте про лексичне оточення та момент створення функції.',
      answer: `
**Замикання** — це функція разом із посиланням на лексичне оточення (Lexical Environment), у якому її було створено. Завдяки цьому функція має доступ до змінних зовнішньої області видимості навіть після того, як зовнішня функція завершилась.

Технічно: кожна функція має внутрішню властивість \`[[Environment]]\`, яка зберігає посилання на оточення в момент створення. Під час виклику створюється нове оточення, зовнішнім для якого стає \`[[Environment]]\`.

**Де використовується:**
- приватний стан (лічильники, модулі, фабрики);
- \`debounce\`/\`throttle\`/\`memoize\` — збереження таймера чи кешу між викликами;
- каррінг і часткове застосування;
- обробники подій, що «пам'ятають» дані.

\`\`\`js
function memoize(fn) {
  const cache = new Map();
  return (x) => cache.has(x) ? cache.get(x) : (cache.set(x, fn(x)), cache.get(x));
}
\`\`\`

**Підводні камені:** замикання утримують змінні в пам'яті (можливі витоки при великих об'єктах в обробниках подій); класична помилка з \`var\` у циклі.
`,
      keyPoints: [
        'Функція + лексичне оточення, де вона створена',
        'Доступ до зовнішніх змінних після завершення зовнішньої функції',
        'Практичні приклади: приватний стан, debounce, memoize, каррінг',
        'Ризики: утримання пам\'яті, var у циклі'
      ],
      followUps: ['Чим відрізняється замикання від області видимості?', 'Як замикання впливає на збирач сміття?', 'Як зробити приватні змінні без замикань?']
    }
  ]
});

FE.topic('css-layout', {
  intro: 'Приклад DOM/CSS завдання.',
  items: [
    {
      id: 'example-center-flex',
      type: 'dom',
      level: 1,
      interview: true,
      title: 'Відцентрувати блок (flexbox)',
      description: `
Відцентруйте \`.box\` всередині \`.container\` **по горизонталі та вертикалі**. Не змінюйте HTML і розміри елементів.
`,
      html: `<div class="container">
  <div class="box">центр</div>
</div>`,
      css: `.container {
  width: 400px;
  height: 300px;
  background: #eef;
}
.box {
  width: 100px;
  height: 60px;
  background: #66f;
  color: #fff;
}
`,
      js: '',
      editable: ['css'],
      solution: {
        css: `.container {
  width: 400px;
  height: 300px;
  background: #eef;
  display: flex;
  justify-content: center;
  align-items: center;
}
.box {
  width: 100px;
  height: 60px;
  background: #66f;
  color: #fff;
}
`
      },
      hints: ['Зробіть контейнер flex-контейнером.', '`justify-content` вирівнює вздовж головної осі, `align-items` — вздовж поперечної.'],
      tests: [
        { name: 'по горизонталі по центру', code: "const c = rect('.container'), b = rect('.box');\nexpect(Math.abs((b.left + b.width / 2) - (c.left + c.width / 2))).toBeLessThan(1);" },
        { name: 'по вертикалі по центру', code: "const c = rect('.container'), b = rect('.box');\nexpect(Math.abs((b.top + b.height / 2) - (c.top + c.height / 2))).toBeLessThan(1);" },
        { name: 'розміри не змінились', code: "const b = rect('.box');\nexpect(b.width).toBe(100);\nexpect(b.height).toBe(60);" }
      ],
      explanation: 'Альтернативи: `display: grid; place-items: center;` або `position: absolute` + `inset: 0; margin: auto`.'
    },
    {
      id: 'example-delegation',
      type: 'dom',
      level: 2,
      interview: true,
      title: 'Делегування подій: todo-список',
      description: `
Є список \`#list\`. Клік по кнопці \`.remove\` має видаляти її \`<li>\`. Клік по тексту \`<li>\` перемикає клас \`done\`.

Використайте **один** обробник на \`#list\` (делегування) — нові елементи, додані пізніше, теж мають працювати.
`,
      html: `<ul id="list">
  <li><span>Купити хліб</span> <button class="remove">×</button></li>
  <li><span>Вивчити event loop</span> <button class="remove">×</button></li>
</ul>`,
      css: `.done span { text-decoration: line-through; }`,
      js: `const list = document.querySelector('#list');
// ваш код
`,
      editable: ['js'],
      solution: {
        js: `const list = document.querySelector('#list');
list.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li || !list.contains(li)) return;
  if (e.target.closest('.remove')) {
    li.remove();
  } else {
    li.classList.toggle('done');
  }
});
`
      },
      hints: ['`e.target` — елемент, на якому стався клік; `closest()` знайде найближчого предка за селектором.', 'Перевірте спочатку, чи клік був по `.remove`, інакше — перемикайте `done`.'],
      tests: [
        { name: 'кнопка видаляє li', code: "click($$('#list .remove')[0]);\nexpect($$('#list li')).toHaveLength(1);" },
        { name: 'клік по тексту перемикає done', code: "const li = $('#list li');\nclick(li.querySelector('span'));\nexpect(li.classList.contains('done')).toBe(true);\nclick(li.querySelector('span'));\nexpect(li.classList.contains('done')).toBe(false);" },
        { name: 'працює для нових елементів', code: "const li = document.createElement('li');\nli.innerHTML = '<span>Новий</span> <button class=\"remove\">×</button>';\n$('#list').append(li);\nclick(li.querySelector('.remove'));\nexpect(document.contains(li)).toBe(false);" }
      ],
      explanation: 'Події спливають (bubbling) від `target` до предків, тож один обробник на контейнері обслуговує всіх нащадків, навіть доданих пізніше. Це економить пам\'ять і спрощує код.'
    }
  ]
});
