FE.topic('js-this', {
  intro: `
## Головне правило

\`this\` у звичайній функції визначається **способом виклику**, а не місцем оголошення. Стрілка власного \`this\` не має — бере його з оточення, де її створено.

## Правила прив'язки

| Правило | Як викликано | \`this\` |
|---|---|---|
| **new** | \`new Fn()\` | новий об'єкт |
| **Явне** | \`fn.call(obj)\`, \`fn.apply(obj)\`, \`fn.bind(obj)()\` | \`obj\` |
| **Неявне** | \`obj.fn()\` | \`obj\` (об'єкт перед крапкою) |
| **За замовчуванням** | \`fn()\` | \`undefined\` у strict, \`globalThis\` у sloppy |
| **Стрілка** | будь-як | \`this\` зовнішнього оточення |

**Пріоритет:** \`new\` > \`bind\`/\`call\`/\`apply\` > неявне > за замовчуванням.

## Втрата контексту

\`\`\`js
const user = { name: 'Ann', hi() { return this.name; } };
const hi = user.hi;          // посилання на функцію, без об'єкта
hi();                        // undefined (strict)
setTimeout(user.hi, 0);      // теж втрата
setTimeout(() => user.hi(), 0);     // виправлення 1
setTimeout(user.hi.bind(user), 0);  // виправлення 2
\`\`\`

## call / apply / bind

| | Викликає одразу? | Аргументи |
|---|---|---|
| \`fn.call(ctx, a, b)\` | так | через кому |
| \`fn.apply(ctx, [a, b])\` | так | масивом |
| \`fn.bind(ctx, a)\` | **ні** — нова функція | часткове застосування |

- \`fn.bind(a).bind(b)\` → \`this === a\` (перепривʼязати не можна).
- \`new\` ігнорує прив'язаний \`this\`, але часткові аргументи зберігає.

## Обробники подій

\`addEventListener('click', function () { this })\` → \`this === event.currentTarget\`. Для \`removeEventListener\` потрібне **те саме** посилання — \`bind\` щоразу створює нову функцію.

## Ланцюжки методів

Метод повертає \`this\` → \`calc.add(2).multiply(3).value()\`.
`,
  groups: [
    { id: 'implicit', title: 'Неявна прив\'язка: obj.method()' },
    { id: 'arrows', title: 'Стрілки і вкладені функції' },
    { id: 'explicit', title: 'call, apply, bind' },
    { id: 'losing', title: 'Втрата контексту і як її виправити' },
    { id: 'new', title: 'new і пріоритет правил' },
    { id: 'polyfills', title: 'Поліфіли call, apply, bind' }
  ],
  items: [
    // ---------------------------------------------------------------- 1. Неявна прив'язка
    {
      id: 'this-method-vs-function',
      group: 'implicit',
      type: 'quiz',
      level: 1,
      interview: true,
      title: 'Метод vs окрема функція',
      tags: ['this', 'implicit-binding'],
      question: `
**Як це працює:** \`this\` у звичайній функції — це об'єкт **перед крапкою в момент виклику**. \`user.greet()\` → \`this === user\`. Простий виклик \`greet()\` → \`this === undefined\` у strict mode.

Що виведе код?

\`\`\`js
'use strict';

const user = {
  name: 'Ann',
  greet() {
    return 'Hi, ' + this.name;
  },
};

console.log(user.greet());
const greet = user.greet;
console.log(greet());
\`\`\`
`,
      options: [
        '`Hi, Ann` і `Hi, Ann`',
        '`Hi, Ann` і `Hi, undefined`',
        '`Hi, Ann` і `TypeError: Cannot read properties of undefined (reading \'name\')`',
        '`Hi, undefined` і `TypeError`'
      ],
      answer: 2,
      why: [
        'Функція не пам\'ятає, з якого об\'єкта її взяли: `greet()` викликано без об\'єкта.',
        '`Hi, undefined` було б, якби `this` був об\'єктом без `name`; у strict mode `this` — `undefined`, тож читання `.name` кидає помилку.',
        'Правильно: перший виклик — неявна прив\'язка до `user`; другий — простий виклик, `this === undefined`, і `undefined.name` кидає `TypeError`.',
        'Перший виклик іде через `user.`, тож `this === user` і результат `Hi, Ann`.'
      ],
      hint: 'Що стоїть перед крапкою в момент виклику у другому випадку?',
      explanation: `
\`const greet = user.greet\` копіює лише посилання на функцію. У sloppy mode \`this\` був би \`window\` і результат — \`'Hi, '\` + \`window.name\`; strict mode показує помилку одразу.
`
    },
    {
      id: 'this-implicit-chain',
      group: 'implicit',
      type: 'quiz',
      level: 3,
      title: 'Неявна прив\'язка і «відрив» посилання',
      tags: ['this', 'implicit-binding', 'trick'],
      question: `
Що виведе код (strict mode)?

\`\`\`js
'use strict';

const obj = {
  name: 'outer',
  inner: {
    name: 'inner',
    getName() {
      return this ? this.name : 'no this';
    },
  },
};

let fn;
console.log(obj.inner.getName());
console.log((obj.inner.getName)());
console.log((0, obj.inner.getName)());
console.log((fn = obj.inner.getName)());
\`\`\`
`,
      options: [
        '`inner inner inner inner`',
        '`outer inner no this no this`',
        '`inner no this no this no this`',
        '`inner inner no this no this`',
        '`inner inner no this inner`'
      ],
      answer: 3,
      why: [
        'Оператор кома і присвоєння повертають саму функцію без об\'єкта — це простий виклик.',
        '`this` — лише **останній** об\'єкт перед крапкою (`obj.inner`), проміжні не враховуються.',
        'Групувальні дужки не «відривають» функцію: `(obj.inner.getName)()` — досі виклик методу.',
        'Правильно: виклик через крапку і в дужках зберігає `obj.inner`, а кома та присвоєння дають голу функцію.',
        'Присвоєння `fn = ...` повертає значення-функцію, тому виклик іде без об\'єкта.'
      ],
      hint: 'Дужки зберігають «посилання з об\'єктом». Кома і присвоєння повертають уже саме значення — функцію.',
      explanation: `
\`(0, obj.fn)()\` — відомий трюк бандлерів, щоб викликати імпорт без \`this\`. Правило: \`this\` визначає **вираз виклику** — якщо перед \`()\` стоїть \`obj.prop\` (навіть у дужках), це метод; будь-яке обчислення до значення відриває функцію.
`
    },
    {
      id: 'this-chainable-calculator',
      group: 'implicit',
      type: 'code',
      level: 2,
      title: 'Калькулятор з ланцюжком методів',
      tags: ['this', 'method-chaining'],
      description: `
**Завдання.** Доповніть \`createCalculator(initial = 0)\`, щоб методи можна було викликати **ланцюжком**.

**Де трапляється:** fluent API — jQuery (\`$(el).addClass('a').show()\`), query builder-и, Cypress; класика співбесід.

**Що написати**
- \`add(n)\`, \`subtract(n)\`, \`multiply(n)\`, \`divide(n)\`, \`reset()\` → змінюють значення і повертають **той самий** об'єкт
- \`divide(0)\` → \`Error('Division by zero')\`, значення не змінюється
- \`value()\` → поточне число

**Приклад**
\`\`\`js
createCalculator(10).add(5).multiply(2).subtract(4).divide(2).value(); // 13
const calc = createCalculator();
calc.add(1) === calc; // true
\`\`\`

**Як це працює:** у виклику \`calc.add(1)\` \`this === calc\`. Якщо \`add\` повертає \`this\`, наступний \`.multiply(2)\` викликається на тому самому об'єкті.

**Врахуйте:** перевірку на нуль — до зміни значення; калькулятори незалежні.
`,
      starter: `function createCalculator(initial = 0) {
  let current = initial; // стан у замиканні

  return {
    // 1. TODO: кожен «змінюючий» метод має повертати об'єкт (this)
    add(n) { current += n; },
    subtract(n) { current -= n; },
    multiply(n) { current *= n; },
    // 2. TODO: n === 0 → throw new Error('Division by zero') ДО зміни current
    divide(n) { current /= n; },
    reset() { current = initial; },
    value() { return current; },
  };
}

// Спробуйте в консолі:
// createCalculator(10).add(5).value(); // 15
`,
      solution: `function createCalculator(initial = 0) {
  let current = initial;
  return {
    add(n) {
      current += n;
      return this; // повертаємо об'єкт для продовження ланцюжка
    },
    subtract(n) {
      current -= n;
      return this;
    },
    multiply(n) {
      current *= n;
      return this;
    },
    divide(n) {
      if (n === 0) throw new Error('Division by zero');
      current /= n;
      return this;
    },
    reset() {
      current = initial;
      return this;
    },
    value() {
      return current;
    },
  };
}
`,
      hints: [
        'Чим є `this` у виклику `calc.add(1)`? Саме його і треба повернути.',
        'Додайте `return this;` у кожен змінюючий метод; у `divide` спершу перевірте нуль.'
      ],
      tests: [
        { name: 'ланцюжок обчислень', code: 'expect(createCalculator(10).add(5).multiply(2).subtract(4).divide(2).value()).toBe(13);\nexpect(createCalculator().value()).toBe(0);' },
        { name: 'методи повертають той самий об\'єкт', code: 'const c = createCalculator();\nexpect(c.add(1)).toBe(c);\nexpect(c.subtract(1)).toBe(c);\nexpect(c.multiply(2)).toBe(c);\nexpect(c.divide(2)).toBe(c);\nexpect(c.reset()).toBe(c);' },
        { name: 'ділення на нуль', code: 'const c = createCalculator(8);\nexpect(() => c.divide(0)).toThrow("Division by zero");\nexpect(c.value()).toBe(8);' },
        { name: 'reset повертає до initial', code: 'const c = createCalculator(5);\nexpect(c.add(10).reset().add(1).value()).toBe(6);' },
        { name: 'калькулятори незалежні', code: 'const a = createCalculator(1);\nconst b = createCalculator(1);\na.add(10);\nexpect(b.value()).toBe(1);\nexpect(a.value()).toBe(11);' }
      ],
      explanation: `
Кожен метод повертає \`this\`, тож ланцюжок триває на тому самому об'єкті. O(1) на операцію.

**Нюанс:** відірваний метод (\`const { add } = calc\`) поверне \`undefined\` і ланцюжок зламається. Надійніше: \`const api = {...}; return api;\` усередині методів.

**Типові помилки:** забути \`return this\` в одному методі; стрілки замість методів (\`this\` буде зовнішній).

**Що спитають далі:** іммутабельна версія (кожен метод повертає новий калькулятор); \`undo()\`.
`
    },

    // ---------------------------------------------------------------- 2. Стрілки
    {
      id: 'this-nested-functions',
      group: 'arrows',
      type: 'quiz',
      level: 2,
      title: 'this у вкладеній функції',
      tags: ['this', 'arrow-functions'],
      question: `
**Як це працює:** вкладена звичайна функція **не успадковує** \`this\` зовнішньої — її \`this\` залежить від того, як її викликали. Стрілка власного \`this\` не має і бере його з функції, де її створено (як змінну із замикання).

Що виведе код?

\`\`\`js
'use strict';

const obj = {
  value: 42,
  method() {
    const self = this;
    function inner() {
      return this;
    }
    const arrow = () => this.value;
    return [inner(), self.value, arrow()];
  },
};

console.log(obj.method());
\`\`\`
`,
      options: [
        '`[obj, 42, 42]`',
        '`[undefined, 42, undefined]`',
        '`[window, 42, 42]`',
        '`[undefined, 42, 42]`'
      ],
      answer: 3,
      why: [
        '`inner()` — простий виклик; місце оголошення всередині методу на `this` не впливає.',
        'Стрілка бере `this` з `method`, де `this === obj`, тому `arrow()` дає `42`.',
        '`window` був би лише в sloppy mode; тут `\'use strict\'`, тому `undefined`.',
        'Правильно: `inner()` у strict → `undefined`; `self` зберіг `obj` через замикання; стрілка взяла `this` методу.'
      ],
      hint: 'Як викликана `inner`? А де створено стрілку?',
      explanation: `
\`const self = this\` — до-ES6 прийом; сьогодні для колбеків усередині методів використовують стрілки. Правило: звичайна функція — \`this\` від виклику, стрілка — від місця створення.
`
    },
    {
      id: 'this-arrow-in-object',
      group: 'arrows',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Стрілка як метод об\'єкта',
      tags: ['this', 'arrow-functions'],
      question: `
Що виведе код у **ES-модулі** (на верхньому рівні модуля \`this === undefined\`)?

\`\`\`js
const obj = {
  name: 'obj',
  regular() {
    return this.name;
  },
  arrow: () => this?.name,
  nested() {
    const inner = () => this.name;
    return inner();
  },
};

console.log(obj.regular(), obj.arrow(), obj.nested());
\`\`\`
`,
      options: [
        '`obj obj obj`',
        '`obj undefined obj`',
        '`obj undefined undefined`',
        '`obj obj undefined`'
      ],
      answer: 1,
      why: [
        'Фігурні дужки літерала — не функція і не створюють `this`; стрілка `arrow` бере `this` модуля.',
        'Правильно: метод — неявна прив\'язка; `arrow` створено на верхньому рівні (`this` — undefined); `inner` створено всередині методу.',
        '`inner` створено під час виклику `obj.nested()`, тож вона бачить `this === obj`.',
        '`arrow` не отримує `obj`: стрілка не бере `this` від виклику через крапку.'
      ],
      hint: 'Літерал об\'єкта `{}` не створює область видимості для `this`. Де створено `arrow`, а де — `inner`?',
      explanation: `
Стрілки погано підходять як методи об'єкта, якщо потрібен \`this\`, але ідеальні для колбеків **усередині** методів. У звичайному скрипті \`arrow\` бачила б \`window\`.
`
    },
    {
      id: 'this-settimeout',
      group: 'arrows',
      type: 'quiz',
      level: 2,
      title: 'this у колбеку setTimeout',
      tags: ['this', 'timers', 'arrow-functions'],
      question: `
Що виведе код у браузері (звичайний скрипт)?

\`\`\`js
const timer = {
  seconds: 10,
  regular() {
    setTimeout(function () {
      console.log(this.seconds);
    }, 0);
  },
  arrow() {
    setTimeout(() => {
      console.log(this.seconds);
    }, 0);
  },
};

timer.regular();
timer.arrow();
\`\`\`
`,
      options: ['`10 10`', '`undefined 10`', '`10 undefined`', '`TypeError` і `10`'],
      answer: 1,
      why: [
        'Колбек `regular` таймер викликає без об\'єкта — зв\'язку з `timer` у нього немає.',
        'Правильно: звичайний колбек отримує `this === window` (`window.seconds` — undefined), стрілка бере `this === timer` з методу.',
        'Навпаки: саме стрілка бачить `timer`, а звичайна функція — ні.',
        'Браузер викликає колбек таймера з `this === window`, а не `undefined`, тому помилки немає.'
      ],
      hint: 'Хто і як викликає колбек таймера? Чи пов\'язаний цей виклик з `timer`?',
      explanation: `
Таймер викликає колбек як просту функцію (у браузері з \`this === window\` навіть у strict mode). Виправлення для \`regular\`: стрілка, \`.bind(this)\` або \`const self = this\`.
`
    },

    // ---------------------------------------------------------------- 3. call / apply / bind
    {
      id: 'this-call-apply-bind-output',
      group: 'explicit',
      type: 'quiz',
      level: 1,
      title: 'call, apply, bind на практиці',
      tags: ['call', 'apply', 'bind'],
      question: `
**Як це працює:** \`this\` можна задати явно:
- \`fn.call(ctx, a, b)\` — викликати одразу, аргументи через кому;
- \`fn.apply(ctx, [a, b])\` — викликати одразу, аргументи масивом;
- \`fn.bind(ctx, a)\` — **не викликає**, повертає нову функцію з прив'язаним \`this\` і першими аргументами.

Що виведе код?

\`\`\`js
function intro(greeting, punct) {
  return greeting + ', ' + this.name + punct;
}
const p = { name: 'Ann' };

console.log(intro.call(p, 'Hi', '!'));
console.log(intro.apply(p, ['Hello', '?']));
console.log(intro.bind(p, 'Hey')('.'));
\`\`\`
`,
      options: [
        '`Hi, Ann!` / `Hello, Ann?` / `Hey, Ann.`',
        '`Hi, Ann!` / `Hello,?, Ann` / `Hey, Ann.`',
        '`Hi, Ann!` / `Hello, Ann?` / функцію',
        '`Hi, Ann!` / `Hello, Ann?` / `Hey, Annundefined`'
      ],
      answer: 0,
      why: [
        'Правильно: `apply` розгортає масив у позиційні аргументи, а `bind` додає `\'.\'` після збереженого `\'Hey\'`.',
        '`apply` не передає масив одним аргументом — він розгортає його в `greeting` і `punct`.',
        'Функцію повернув би сам `bind`, але тут її одразу викликано другою парою дужок.',
        'Аргументи виклику додаються після прив\'язаних, тому `punct = \'.\'`.'
      ],
      hint: '`apply` розгортає масив. `bind` запам\'ятовує перші аргументи, решта додаються при виклику.',
      explanation: `
Мнемоніка: **A**pply — **A**rray, **C**all — **C**omma. \`bind\` — для «потім»: колбеки, обробники, часткове застосування (\`multiply.bind(null, 2)\`).
`
    },
    {
      id: 'this-call-apply-bind',
      group: 'explicit',
      type: 'theory',
      level: 1,
      interview: true,
      title: 'call, apply і bind: різниця',
      tags: ['call', 'apply', 'bind'],
      question: 'Чим відрізняються call, apply і bind? Наведіть практичні приклади використання кожного.',
      choices: [
        '`apply` приймає аргументи через кому, а `call` — одним масивом',
        '`bind` одразу викликає функцію й запам\'ятовує `this` для наступних викликів',
        '`call` і `apply` викликають функцію одразу, а `bind` повертає нову функцію',
        'Для стрілки `call(obj)` підміняє `this`, а `bind(obj)` — ні'
      ],
      correct: 2,
      why: [
        'Навпаки: `apply` — масивом, `call` — через кому.',
        '`bind` нічого не викликає — він лише повертає нову функцію.',
        'Правильно: це головна різниця; аргументи — через кому (`call`) або масивом (`apply`).',
        'Стрілка ігнорує `this` і з `call`, і з `bind` — він завжди лексичний.'
      ],
      answer: `
| Метод | Що робить | Аргументи | Повертає |
|---|---|---|---|
| \`fn.call(ctx, a, b)\` | викликає | по одному | результат |
| \`fn.apply(ctx, [a, b])\` | викликає | масивом / array-like | результат |
| \`fn.bind(ctx, a)\` | не викликає | часткові | нову функцію |

- **call:** позичити чужий метод — \`({}).toString.call([])\` → \`'[object Array]'\`, \`[].slice.call(arguments)\`.
- **apply:** аргументи вже в масиві — \`Math.max.apply(null, nums)\` (сьогодні \`Math.max(...nums)\`), декоратори \`fn.apply(this, args)\`.
- **bind:** колбеки й обробники (\`setTimeout(obj.m.bind(obj))\`), часткове застосування.
- Для стрілок \`ctx\` ігнорується; bound-функцію не можна перепривʼязати.
- Sloppy mode: \`call(null)\` → \`this = globalThis\`, примітив загортається в об'єкт.
`,
      keyPoints: [
        'call і apply викликають одразу, bind повертає нову функцію',
        'call — аргументи через кому, apply — масивом',
        'bind підтримує часткове застосування аргументів',
        'Для стрілок thisArg ігнорується; bound-функцію не можна перепривʼязати'
      ],
      followUps: ['Що буде, якщо викликати bind двічі?', 'Як позичити метод масиву для arguments?']
    },
    {
      id: 'this-bind-twice',
      group: 'explicit',
      type: 'quiz',
      level: 3,
      title: 'Подвійний bind',
      tags: ['bind', 'trick'],
      question: `
Що виведе код?

\`\`\`js
function f() {
  return this.x;
}

const a = f.bind({ x: 1 });
const b = a.bind({ x: 2 });

console.log(a(), b(), a.call({ x: 3 }));
\`\`\`
`,
      options: ['`1 2 3`', '`1 1 3`', '`1 1 1`', '`1 2 1`'],
      answer: 2,
      why: [
        'Bound-функція ігнорує свій поточний `this`, тому ні другий `bind`, ні `call` нічого не змінюють.',
        '`call` на bound-функції так само ігнорується — вона завжди викликає `f` зі збереженим `{ x: 1 }`.',
        'Правильно: перший `bind` фіксує `this` назавжди; повторний `bind` і `call` можуть лише додати аргументи.',
        '`b` викликає `a` з `{ x: 2 }`, але `a` цей `this` не читає.'
      ],
      hint: 'Чи читає bound-функція той `this`, з яким її викликали?',
      explanation: `
Bound-функція при виклику завжди викликає ціль зі збереженим \`this\`. Повторний \`bind\` лише накопичує часткові аргументи. Обійти прив'язаний \`this\` може тільки \`new\`.
`
    },
    {
      id: 'this-tricky-mix',
      group: 'explicit',
      type: 'quiz',
      level: 3,
      title: 'Фабрики стрілкових і звичайних функцій',
      tags: ['this', 'arrow-functions', 'call'],
      question: `
Що виведе код (браузер, звичайний скрипт, sloppy mode)?

\`\`\`js
var name = 'global';

const obj = {
  name: 'obj',
  getArrow() {
    return () => this.name;
  },
  getRegular() {
    return function () {
      return this.name;
    };
  },
};

const arrow = obj.getArrow();
const regular = obj.getRegular();

console.log(arrow(), regular(), arrow.call({ name: 'x' }), regular.call({ name: 'x' }));
\`\`\`
`,
      options: [
        '`obj obj x x`',
        '`obj global obj x`',
        '`global global x x`',
        '`obj global x x`',
        '`obj undefined obj x`'
      ],
      answer: 1,
      why: [
        'Звичайна функція, повернута з методу, не пам\'ятає `obj` — її `this` визначає виклик.',
        'Правильно: стрілка назавжди тримає `this === obj`; `regular()` без об\'єкта бачить `window` (`var name`); `call` змінює лише звичайну функцію.',
        'Стрілку створено в `obj.getArrow()`, тому вона бачить `obj`, а не глобальний об\'єкт.',
        '`call` не може змінити `this` стрілки — вона лишається з `obj`.',
        '`var name` на верхньому рівні скрипта створює `window.name = \'global\'`, тому не `undefined`.'
      ],
      hint: 'Стрілка запам\'ятовує `this` при створенні, звичайна функція отримує його при виклику.',
      explanation: `
У strict mode \`regular()\` кинув би \`TypeError\` (\`this === undefined\`). З \`let name\` замість \`var\` властивість \`window.name\` не змінилась би.
`
    },

    // ---------------------------------------------------------------- 4. Втрата контексту
    {
      id: 'this-losing-context',
      group: 'losing',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Втрата контексту: причини і рішення',
      tags: ['this', 'callbacks', 'bind'],
      question: `
**Як це працює:** \`obj.method\` без дужок — лише посилання на функцію. Коли його передають кудись (таймер, обробник, колбек масиву), функцію потім викличуть **без об'єкта**:
\`\`\`js
setTimeout(user.sayHi, 1000);      // this втрачено
setTimeout(() => user.sayHi(), 1000); // ок
\`\`\`

Що таке «втрата контексту» і чому вона відбувається?
`,
      choices: [
        'Контекст губиться, бо `setTimeout` виконує колбек асинхронно, коли `this` уже очищено',
        '`obj.method` без виклику — лише посилання на функцію; зв\'язок з `obj` є лише при `obj.method()`',
        'Деструктуризація `const { sayHi } = user` зберігає прив\'язку, бо функцію взято саме з об\'єкта `user`',
        'Втрата контексту буває лише в sloppy mode — у strict `this` лишається вихідним об\'єктом'
      ],
      correct: 1,
      why: [
        'Час тут ні до чого: `this` не «очищається», він просто визначається способом виклику.',
        'Правильно: зв\'язок з об\'єктом виникає лише в момент виклику через крапку.',
        'Деструктуризація копіює лише посилання на функцію — виклик `sayHi()` уже без об\'єкта.',
        'У strict mode втрата навіть помітніша: `this === undefined` і читання поля кидає `TypeError`.'
      ],
      answer: `
**Де трапляється:** \`setTimeout(obj.m)\`, \`addEventListener('click', obj.m)\` (там \`this\` — елемент), \`const { m } = obj\`, \`arr.forEach(obj.m)\`, передача методу в props.

**Рішення:**
1. Стрілка-обгортка: \`setTimeout(() => obj.m(), 0)\` — просто й читабельно.
2. \`bind\`: \`obj.m.bind(obj)\` — фіксує \`this\`; кожен виклик \`bind\` — нова функція (важливо для \`removeEventListener\`).
3. Прив'язати один раз і зберегти: \`obj.m = obj.m.bind(obj)\`.
4. \`thisArg\` у методах масивів: \`arr.forEach(obj.m, obj)\`.
5. Методи без \`this\` — стан у замиканні (фабрика): втрачати нічого.
`,
      keyPoints: [
        'obj.method без виклику — лише посилання на функцію, без об\'єкта',
        'Ситуації: setTimeout, addEventListener, деструктуризація, колбеки масивів',
        'Рішення: стрілка-обгортка, bind, прив\'язка один раз, thisArg, замикання',
        'bind створює нову функцію — зберігайте посилання для removeEventListener'
      ],
      followUps: ['Чому в addEventListener this — це елемент?', 'Як зняти обробник, доданий через bind?']
    },
    {
      id: 'this-events',
      group: 'losing',
      type: 'theory',
      level: 2,
      title: 'this в обробниках подій',
      tags: ['this', 'events', 'dom'],
      question: 'Яке значення має this в обробниках DOM-подій? Як поводяться стрілки і як правильно знімати обробники, прив\'язані через bind? Оберіть **усі** правильні твердження.',
      choices: [
        'У звичайній функції-обробнику `this === event.currentTarget` — елемент, де висить обробник',
        'У звичайній функції-обробнику `this` — це `event.target`, елемент, по якому клікнули',
        '`removeEventListener(\'click\', fn.bind(obj))` знімає обробник, доданий таким самим `bind`',
        'Стрілка-обробник отримує `this` елемента, бо браузер прив\'язує його примусово',
        'Обробники можна зняти групою через `AbortController` і опцію `signal`'
      ],
      correct: [0, 4],
      why: [
        'Правильно: браузер викликає обробник з `this` = елемент, на якому висить слухач.',
        'Хибно: `target` — де сталася подія (може бути вкладений `<span>`), а `this` — `currentTarget`.',
        'Хибно: кожен `bind` створює нову функцію, а зняти можна лише те саме посилання.',
        'Хибно: стрілка ігнорує спосіб виклику і бере `this` з оточення; елемент — у `e.currentTarget`.',
        'Правильно: `ctrl.abort()` знімає всі обробники, додані з цим `signal`.'
      ],
      answer: `
- Звичайна функція: \`this === e.currentTarget\` (де висить обробник); \`e.target\` — де клікнули.
- Стрілка: \`this\` зовнішній; елемент брати з \`e.currentTarget\`.
- Метод об'єкта як обробник: \`btn.addEventListener('click', menu.toggle)\` → \`this === btn\`, не \`menu\`.
- Знімання: потрібне **те саме** посилання:
\`\`\`js
const onClick = menu.toggle.bind(menu);
el.addEventListener('click', onClick);
el.removeEventListener('click', onClick);
// або: { signal: ctrl.signal } і ctrl.abort()
\`\`\`
- Об'єкт з \`handleEvent(e)\` замість функції — браузер викличе його з \`this === obj\`.
`,
      keyPoints: [
        'Звичайна функція-обробник: this === event.currentTarget',
        'currentTarget (де висить обробник) vs target (де сталася подія)',
        'Стрілка — зовнішній this, елемент брати з e.currentTarget',
        'removeEventListener потребує того самого посилання; bind створює нове'
      ],
      followUps: ['Чим target відрізняється від currentTarget при делегуванні?', 'Як працює об\'єкт з handleEvent?']
    },
    {
      id: 'this-fix-stopwatch',
      group: 'losing',
      type: 'code',
      level: 2,
      title: 'Виправити втрату контексту в секундомірі',
      tags: ['this', 'timers', 'bind'],
      description: `
**Завдання.** Секундомір з \`createStopwatch()\` не працює: лічильник не росте, а методи ламаються, якщо їх передати як обробники. Виправте обидві проблеми з \`this\`.

**Де трапляється:** таймери, слайдери, віджети: \`setInterval\` усередині методу і \`button.onclick = sw.stop\`.

**Що написати**
- \`createStopwatch()\` → об'єкт з методами:
  - \`start()\` — щосекунди \`ticks + 1\`; повторний \`start()\` не запускає другий інтервал
  - \`stop()\`, \`reset()\`, \`getTicks()\` → число
- методи працюють і після \`const { start } = sw\`, і як колбеки

**Приклад**
\`\`\`js
const sw = createStopwatch();
sw.start();          // через 3 с:
sw.getTicks();       // 3
const { stop } = sw;
stop();              // працює
\`\`\`

**Як це працює:** колбек \`setInterval\` таймер викликає без об'єкта — звичайна функція там не бачить секундомір, а стрілка бере \`this\` з методу \`start\`. Відірваний метод (\`const { start } = sw\`) — це простий виклик; \`bind\` робить копію з назавжди прив'язаним \`this\`.

**Врахуйте:** у \`stop\` скидайте \`timerId = null\`; секундоміри незалежні.
`,
      starter: `function createStopwatch() {
  const sw = {
    ticks: 0,
    timerId: null,
    start() {
      if (this.timerId !== null) return;
      // 1. TODO: колбек втрачає this — замініть на функцію, що бере this з start
      this.timerId = setInterval(function () {
        this.ticks++;
      }, 1000);
    },
    stop() {
      clearInterval(this.timerId);
      this.timerId = null;
    },
    reset() {
      this.ticks = 0;
    },
    getTicks() {
      return this.ticks;
    },
  };

  // 2. TODO: прив'яжіть start, stop, reset, getTicks до sw (sw[key] = sw[key].bind(sw))

  return sw;
}

// Спробуйте в консолі:
// const sw = createStopwatch(); sw.start(); setTimeout(() => console.log(sw.getTicks()), 2100);
`,
      solution: `function createStopwatch() {
  const sw = {
    ticks: 0,
    timerId: null,
    start() {
      if (this.timerId !== null) return;
      // стрілка бере this методу start
      this.timerId = setInterval(() => {
        this.ticks++;
      }, 1000);
    },
    stop() {
      clearInterval(this.timerId);
      this.timerId = null;
    },
    reset() {
      this.ticks = 0;
    },
    getTicks() {
      return this.ticks;
    },
  };

  // прив'язуємо методи, щоб їх можна було передавати як колбеки
  for (const key of ['start', 'stop', 'reset', 'getTicks']) {
    sw[key] = sw[key].bind(sw);
  }
  return sw;
}
`,
      hints: [
        'Проблема 1: яка функція бере `this` з оточення, а не з виклику?',
        'Проблема 2: після створення об\'єкта пройдіться по іменах методів і замініть кожен на `sw[key].bind(sw)`.',
        'Альтернатива: тримати стан у замиканні (`let ticks = 0`) і писати методи без `this`.'
      ],
      tests: [
        { name: 'лічить секунди', code: 'useFakeTimers();\nconst sw = createStopwatch();\nsw.start();\nadvanceTimersByTime(3000);\nexpect(sw.getTicks()).toBe(3);' },
        { name: 'stop зупиняє лічбу', code: 'useFakeTimers();\nconst sw = createStopwatch();\nsw.start();\nadvanceTimersByTime(2000);\nsw.stop();\nadvanceTimersByTime(5000);\nexpect(sw.getTicks()).toBe(2);' },
        { name: 'методи працюють після деструктуризації', code: 'useFakeTimers();\nconst { start, stop, getTicks, reset } = createStopwatch();\nstart();\nadvanceTimersByTime(2000);\nexpect(getTicks()).toBe(2);\nstop();\nreset();\nexpect(getTicks()).toBe(0);' },
        { name: 'методи працюють як колбеки', code: 'useFakeTimers();\nconst sw = createStopwatch();\nconst handlers = { onStart: sw.start, onStop: sw.stop };\nhandlers.onStart();\nadvanceTimersByTime(1000);\nhandlers.onStop();\nadvanceTimersByTime(1000);\nexpect(sw.getTicks()).toBe(1);' },
        { name: 'повторний start не дублює інтервал', code: 'useFakeTimers();\nconst sw = createStopwatch();\nsw.start();\nsw.start();\nadvanceTimersByTime(1000);\nexpect(sw.getTicks()).toBe(1);\nexpect(getTimerCount()).toBe(1);' },
        { name: 'секундоміри незалежні', code: 'useFakeTimers();\nconst a = createStopwatch();\nconst b = createStopwatch();\na.start();\nadvanceTimersByTime(2000);\nb.start();\nadvanceTimersByTime(1000);\nexpect(a.getTicks()).toBe(3);\nexpect(b.getTicks()).toBe(1);' }
      ],
      explanation: `
Стрілка в \`setInterval\` бере \`this\` методу \`start\`; \`bind\` дає кожному методу назавжди прив'язаний \`this\`. O(1) на операцію.

**Найнадійніша альтернатива:** стан у замиканні (\`let ticks = 0; const start = () => {...}\`) — немає \`this\`, нема чого втрачати.

**Типові помилки:** \`setInterval(this.tick, 1000)\` (та сама втрата); забути \`timerId = null\` у \`stop\`.

**Що спитають далі:** чому \`setInterval\` дрейфує і як рахувати час точно (різниця \`Date.now()\`)?
`
    },
    {
      id: 'this-bind-all',
      group: 'losing',
      type: 'code',
      level: 2,
      title: 'bindAll: методи об\'єкта як обробники подій',
      tags: ['this', 'bind'],
      description: `
**Завдання.** Напишіть \`bindAll(obj, ...methodNames)\` (аналог \`_.bindAll\` з lodash): прив'язує вказані методи до \`obj\`, щоб їх можна було передавати як колбеки.

**Де трапляється:** vanilla-компоненти й віджети: \`button.addEventListener('click', modal.open)\`, \`setTimeout(toast.hide, 3000)\`.

**Що написати**
- \`bindAll(obj, ...methodNames)\` → той самий \`obj\`; кожен \`obj[name]\` замінено на прив'язану версію
- властивість не функція (або відсутня) → \`TypeError\`

**Приклад**
\`\`\`js
const modal = { isOpen: false, open() { this.isOpen = true; } };
bindAll(modal, 'open');
const { open } = modal;
open();
modal.isOpen; // true
\`\`\`

**Як це працює:** \`fn.bind(obj)\` повертає нову функцію, яка завжди викликає \`fn\` з \`this === obj\`, хоч би як її викликали. Запис \`obj[name] = obj[name].bind(obj)\` замінює метод прив'язаною копією.

**Врахуйте:** методи, не вказані в списку, не змінюються; \`call\` з іншим контекстом теж не змінює \`this\` прив'язаного методу.
`,
      starter: `function bindAll(obj, ...methodNames) {
  // 1. Для кожного name:
  //    - const method = obj[name]; не функція → throw new TypeError(...)
  //    - obj[name] = method.bind(obj)
  // TODO
  return obj;
}

// Спробуйте в консолі:
// const c = { n: 0, inc() { this.n++; } };
// bindAll(c, 'inc'); setTimeout(c.inc, 0);
`,
      solution: `function bindAll(obj, ...methodNames) {
  for (const name of methodNames) {
    const method = obj[name];
    if (typeof method !== 'function') {
      throw new TypeError('bindAll: "' + name + '" is not a function');
    }
    obj[name] = method.bind(obj);
  }
  return obj;
}
`,
      hints: [
        'Перебирайте `methodNames` і перевіряйте `typeof obj[name] === \'function\'`.',
        'Запишіть `obj[name] = obj[name].bind(obj)` — відтепер метод можна передавати куди завгодно.'
      ],
      tests: [
        { name: 'прив\'язує методи (деструктуризація)', code: 'const user = { name: "Ann", hi() { return "Hi " + this.name; } };\nbindAll(user, "hi");\nconst { hi } = user;\nexpect(hi()).toBe("Hi Ann");' },
        { name: 'повертає той самий об\'єкт; call не змінює this', code: 'const o = { m() { return this; } };\nexpect(bindAll(o, "m")).toBe(o);\nexpect(o.m.call({})).toBe(o);' },
        { name: 'не чіпає інші методи', code: 'const o = { a() { return this; }, b() { return this; } };\nconst origB = o.b;\nbindAll(o, "a");\nexpect(o.b).toBe(origB);' },
        { name: 'TypeError для не-функцій', code: 'expect(() => bindAll({ x: 1 }, "x")).toThrow(TypeError);\nexpect(() => bindAll({}, "missing")).toThrow(TypeError);' },
        { name: 'працює як колбек таймера', code: 'useFakeTimers();\nconst c = { n: 0, inc() { this.n++; } };\nbindAll(c, "inc");\nsetTimeout(c.inc, 10);\nadvanceTimersByTime(10);\nexpect(c.n).toBe(1);' },
        { name: 'працює як колбек масиву', code: 'const logger = { lines: [], log(msg) { this.lines.push("> " + msg); } };\nbindAll(logger, "log");\n["a", "b"].forEach(logger.log);\nexpect(logger.lines).toEqual(["> a", "> b"]);' }
      ],
      explanation: `
Прив'язана копія ігнорує спосіб виклику, тож метод можна безпечно передати в таймер, обробник чи \`forEach\`. O(k) для k методів.

**Trade-off:** кожен об'єкт тримає власні копії функцій — більше пам'яті, зате немає втрати контексту.

**Типова помилка:** \`bind\` прямо в \`addEventListener\` без збереження — потім неможливо зняти обробник.
`
    },

    // ---------------------------------------------------------------- 5. new і пріоритет
    {
      id: 'this-new-vs-bind',
      group: 'new',
      type: 'quiz',
      level: 3,
      title: 'new з bound-функцією',
      tags: ['bind', 'new'],
      question: `
**Як це працює:** \`new Fn(args)\` створює **новий порожній об'єкт**, викликає \`Fn\` з \`this\` = цей об'єкт і повертає його (якщо \`Fn\` сама не повернула інший об'єкт):
\`\`\`js
function User(name) { this.name = name; }
const u = new User('Ann'); // { name: 'Ann' }
\`\`\`

Що виведе код?

\`\`\`js
function Person(name) {
  this.name = name;
}

const ctx = { name: 'ctx' };
const Bound = Person.bind(ctx);
const p = new Bound('Ann');

console.log(p.name, ctx.name, p instanceof Person);
\`\`\`
`,
      options: [
        '`ctx Ann true`',
        '`Ann ctx true`',
        '`Ann Ann false`',
        '`TypeError: Bound is not a constructor`'
      ],
      answer: 1,
      why: [
        '`new` не використовує прив\'язаний `ctx` — запис іде в новий об\'єкт, тож `ctx` не змінюється.',
        'Правильно: `new` ігнорує прив\'язаний `this`, створює новий екземпляр `Person`, а `ctx` лишається незмінним.',
        'Екземпляр створює оригінальна `Person`, тому `instanceof Person` — `true`, а `ctx` не чіпається.',
        'Bound-версія звичайної функції може бути конструктором; `TypeError` був би лише для стрілки.'
      ],
      hint: 'Яке правило прив\'язки має найвищий пріоритет?',
      explanation: `
\`new\` > \`bind\`: при виклику через \`new\` прив'язаний \`this\` ігнорується, а часткові аргументи \`bind\` зберігаються (\`Person.bind(null, 'Ann')\` → «конструктор з наперед заданим ім'ям»).
`
    },
    {
      id: 'this-class-fields',
      group: 'new',
      type: 'quiz',
      level: 3,
      title: 'Стрілка vs звичайна функція, створені в конструкторі',
      tags: ['this', 'arrow-functions', 'new'],
      question: `
Що виведе код?

\`\`\`js
'use strict';

function Button(label) {
  this.label = label;
  this.handleArrow = () => this.label;
  this.handleRegular = function () {
    return this?.label;
  };
}

const b = new Button('OK');
const { handleArrow, handleRegular } = b;

console.log(handleArrow(), handleRegular());
\`\`\`
`,
      options: ['`OK OK`', '`OK undefined`', '`undefined undefined`', '`OK TypeError`'],
      answer: 1,
      why: [
        '`handleRegular` після деструктуризації викликано без об\'єкта — її `this` вже не `b`.',
        'Правильно: стрілку створено в конструкторі, де `this` — новий об\'єкт, і вона його запам\'ятала; звичайна функція отримала `this === undefined`.',
        'Стрілка не залежить від виклику: вона назавжди тримає `this` конструктора.',
        '`this?.label` безпечно повертає `undefined`, коли `this` — `undefined`, тому помилки немає.'
      ],
      hint: 'Де і коли створено стрілку? Як викликано `handleRegular` після деструктуризації?',
      explanation: `
Стрілка, створена в конструкторі, — спосіб зробити «завжди прив'язаний» обробник (\`button.addEventListener('click', b.handleArrow)\`). Ціна: нова функція для кожного об'єкта. Той самий підхід у класах — поля-стрілки (наступна тема).
`
    },
    {
      id: 'this-precedence',
      group: 'new',
      type: 'quiz',
      level: 4,
      title: 'Пріоритет правил прив\'язки',
      tags: ['this', 'binding-rules', 'bind', 'new'],
      question: `
Що виведе код?

\`\`\`js
function foo(x) {
  this.a = x;
}

const obj1 = { foo };
const obj2 = {};

obj1.foo.call(obj2, 2);
console.log(obj1.a, obj2.a);

const bar = foo.bind(obj1);
const baz = new bar(3);
console.log(obj1.a, baz.a);
\`\`\`
`,
      options: [
        '`2 undefined` / `3 3`',
        '`undefined 2` / `3 undefined`',
        '`2 2` / `3 3`',
        '`undefined 2` / `undefined 3`',
        '`undefined 2` / `3 3`'
      ],
      answer: 3,
      why: [
        'Явна прив\'язка `call(obj2)` сильніша за неявну `obj1.`, тому запис іде в `obj2`.',
        '`new` ігнорує прив\'язаний `obj1` і пише в новий об\'єкт `baz`.',
        '`this` у першому виклику один — `obj2`; `obj1` не змінюється.',
        'Правильно: `call` перемагає неявну прив\'язку, а `new` перемагає `bind`, тож `obj1.a` так і не з\'являється.',
        '`obj1.a` не змінює і `new bar(3)` — запис іде лише в новий об\'єкт.'
      ],
      hint: 'Явна прив\'язка сильніша за неявну. А що сильніше за bind?',
      explanation: `
Пріоритет: \`new\` > явна (\`call\`/\`apply\`/\`bind\`) > неявна (\`obj.fn()\`) > за замовчуванням. Тут \`obj1\` жодного разу не стає \`this\`.
`
    },
    {
      id: 'this-bind-internals',
      group: 'new',
      type: 'theory',
      level: 3,
      title: 'Bound function під капотом',
      tags: ['bind', 'spec', 'new'],
      question: 'Як влаштована функція, повернута bind? Чому її не можна перепривʼязати, що відбувається при виклику з new, які в неї name і length? Оберіть **усі** правильні твердження.',
      choices: [
        'Повторний `bind` на bound-функції перепризначає `this` на новий об\'єкт',
        'При `new` bound-функція ігнорує прив\'язаний `this`, але часткові аргументи зберігає',
        'Bound-функція має власний `prototype` — копію `prototype` оригінальної функції',
        '`name` — `"bound " + ім\'я цілі`, а `length` зменшується на кількість часткових аргументів',
        '`bound.call(other)` змінює контекст, бо явний `call` сильніший за `bind`'
      ],
      correct: [1, 3],
      why: [
        'Хибно: bound-функція не читає свій `this`, тому повторний `bind` лише додає аргументи.',
        'Правильно: `new Bound(...)` ≈ `new Target(...boundArgs, ...args)`.',
        'Хибно: власної властивості `prototype` у bound-функції немає — `new` використовує ціль.',
        'Правильно: `greet.bind(null, \'Hi\')` має `name === \'bound greet\'` і `length` на 1 менше.',
        'Хибно: `call` передає `this`, який bound-функція просто ігнорує.'
      ],
      answer: `
- Внутрішні слоти: \`[[BoundTargetFunction]]\`, \`[[BoundThis]]\`, \`[[BoundArguments]]\`.
- **Виклик:** ціль з \`this = [[BoundThis]]\` і аргументами \`[...boundArgs, ...args]\`; власний \`this\` ігнорується.
- **\`new\`:** \`[[BoundThis]]\` ігнорується, викликається \`new Target(...boundArgs, ...args)\`; \`instanceof\` працює з ціллю.
\`\`\`js
function Point(x, y) { this.x = x; this.y = y; }
const AtZeroX = Point.bind(null, 0);
new AtZeroX(5); // { x: 0, y: 5 }
\`\`\`
- \`name\` = \`"bound Point"\`, \`length\` = \`max(0, target.length - boundArgs.length)\`, власного \`prototype\` немає.
- Bind стрілки не можна викликати з \`new\`.
- Кожен \`bind\` — нова функція (важливо для \`removeEventListener\` і React-рендерів).
`,
      keyPoints: [
        'Внутрішні слоти: BoundTargetFunction, BoundThis, BoundArguments',
        'Bound-функція ігнорує свій this → неможливо перепривʼязати',
        'new ігнорує BoundThis, але зберігає часткові аргументи',
        'name = "bound fn", length зменшується',
        'Кожен bind — нова функція'
      ],
      followUps: ['Як поліфіл bind визначає, що його викликали з new?', 'Що поверне (() => this).bind({ a: 1 })()?']
    },
    {
      id: 'this-rules',
      group: 'new',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Як визначається this? (підсумок)',
      tags: ['this', 'binding-rules'],
      question: 'Як визначається значення this у JavaScript? Опишіть усі правила прив\'язки, їх пріоритет і поведінку стрілкових функцій. Оберіть **усі** правильні твердження.',
      choices: [
        '`this` звичайної функції визначається способом виклику, а не місцем оголошення',
        'Неявна прив\'язка `obj.fn()` має вищий пріоритет, ніж функція, прив\'язана `bind`',
        '`new` перемагає `bind`: `new Bound()` створює новий об\'єкт і ігнорує прив\'язаний `this`',
        '`this` стрілки можна змінити через `call`, якщо передати інший об\'єкт',
        'Простий виклик `fn()` у strict mode дає `this === window`'
      ],
      correct: [0, 2],
      why: [
        'Правильно: це головне правило для звичайних функцій.',
        'Хибно: bound-функція ігнорує об\'єкт перед крапкою — `bind` сильніший.',
        'Правильно: `new` — найвищий пріоритет.',
        'Хибно: `this` стрілки лексичний, `call`/`apply`/`bind` на нього не впливають.',
        'Хибно: у strict mode простий виклик дає `undefined`; `window` — лише в sloppy.'
      ],
      hint: 'Чотири правила + стрілки. Спосіб виклику, а не місце оголошення.',
      answer: `
**Алгоритм для співбесіди:**
1. Стрілка? → \`this\` з оточення, де створена.
2. \`new Fn()\`? → новий об'єкт.
3. \`call\`/\`apply\`/\`bind\`? → вказаний об'єкт.
4. \`obj.fn()\`? → \`obj\` (останній перед крапкою).
5. Інакше → \`undefined\` (strict) / \`globalThis\` (sloppy).

\`\`\`js
function setA(x) { this.a = x; }
const obj = { setA };
obj.setA.call(other, 1);      // явна > неявна: other.a = 1
new (setA.bind(obj))(2);      // new > bind: obj.a не змінено
\`\`\`

**Інші контексти:** обробник DOM-події — \`e.currentTarget\`; верхній рівень модуля — \`undefined\`; \`arr.map(fn, thisArg)\`.
`,
      keyPoints: [
        'this визначається способом виклику (для звичайних функцій)',
        'Чотири правила: new, явна (call/apply/bind), неявна (obj.fn()), за замовчуванням',
        'Пріоритет: new > bind > неявна > default',
        'Default: undefined у strict, globalThis у sloppy',
        'Стрілки: лексичний this, не змінюється call/bind/new'
      ],
      followUps: ['Що буде з this у методі, переданому в setTimeout?', 'Яке значення this на верхньому рівні ES-модуля?']
    },

    // ---------------------------------------------------------------- 6. Поліфіли
    {
      id: 'this-my-call-apply',
      group: 'polyfills',
      type: 'code',
      level: 3,
      interview: true,
      title: 'Поліфіли call та apply',
      tags: ['call', 'apply', 'polyfill', 'symbol'],
      description: `
**Завдання.** Напишіть \`myCall(fn, context, ...args)\` і \`myApply(fn, context, argsArray)\` — аналоги \`fn.call\`/\`fn.apply\` **без** нативних \`call\`, \`apply\`, \`bind\`.

**Де трапляється:** класика співбесід «напишіть поліфіл call/apply» (у справжньому поліфілі це методи всіх функцій — як їх туди додати, побачимо в темі про прототипи).

**Що написати**
- \`myCall(fn, context, ...args)\` → результат \`fn\` з \`this = context\`
- \`myApply(fn, context, argsArray)\` → те саме, аргументи — масив або array-like (\`null\`/\`undefined\` → без аргументів)

**Приклад**
\`\`\`js
function greet(greeting) { return greeting + ', ' + this.name; }
myCall(greet, { name: 'Ann' }, 'Hi');     // 'Hi, Ann'
myApply(greet, { name: 'Bob' }, ['Hey']); // 'Hey, Bob'
\`\`\`

**Як це працює:** явну прив'язку зводимо до **неявної**: тимчасово кладемо \`fn\` у \`context\` під унікальним ключем \`Symbol()\` і викликаємо як метод \`ctx[key](...args)\` → \`this === ctx\`. Потім ключ видаляємо.

**Врахуйте:**
- \`context\` \`null\`/\`undefined\` → \`globalThis\`; примітив → \`Object(context)\`;
- на \`context\` не лишається слідів, навіть якщо \`fn\` кинула помилку (\`try/finally\`);
- \`fn\` не функція → \`TypeError\`; \`argsArray\` — примітив (не null) → \`TypeError\`.
`,
      starter: `function myCall(fn, context, ...args) {
  // 1. fn не функція → throw new TypeError(...)
  // 2. ctx = null/undefined → globalThis, інакше Object(context)
  // 3. const key = Symbol('fn'); ctx[key] = fn;
  // 4. try { return ctx[key](...args); } finally { delete ctx[key]; }
  // TODO
}

function myApply(fn, context, argsArray) {
  // 1. null/undefined → myCall без аргументів
  // 2. примітив → TypeError
  // 3. інакше myCall(fn, context, ...Array.from(argsArray))
  // TODO
}

// Спробуйте в консолі:
// myCall(function (g) { return g + ' ' + this.name; }, { name: 'Ann' }, 'Hi');
`,
      solution: `function myCall(fn, context, ...args) {
  if (typeof fn !== 'function') {
    throw new TypeError('myCall expects a function');
  }
  // null/undefined -> globalThis, примітиви -> обгортка (як у sloppy mode)
  const ctx = context === null || context === undefined ? globalThis : Object(context);
  // Symbol гарантує, що ми не перезапишемо існуючу властивість
  const key = Symbol('fn');
  ctx[key] = fn;
  try {
    // неявна прив'язка: виклик як метод ctx
    return ctx[key](...args);
  } finally {
    delete ctx[key]; // прибираємо навіть якщо fn кинула помилку
  }
}

function myApply(fn, context, argsArray) {
  if (argsArray === null || argsArray === undefined) {
    return myCall(fn, context);
  }
  if (typeof argsArray !== 'object' && typeof argsArray !== 'function') {
    throw new TypeError('CreateListFromArrayLike called on non-object');
  }
  return myCall(fn, context, ...Array.from(argsArray));
}
`,
      hints: [
        'Як без `call` отримати потрібний `this`? Зробіть функцію тимчасовим методом об\'єкта і викличте `ctx.method()`.',
        'Ключ — `Symbol()`: не конфліктує з існуючими полями й не видно в `Object.keys`. Видаляйте в `finally`.',
        '`myApply` зводиться до `myCall` через `Array.from(argsArray)` і spread.'
      ],
      tests: [
        { name: 'myCall: this і аргументи', code: 'function greet(g, p) { return g + ", " + this.name + p; }\nexpect(myCall(greet, { name: "Ann" }, "Hi", "!")).toBe("Hi, Ann!");' },
        { name: 'myApply: масив і array-like', code: 'function sum(a, b, c) { return this.base + a + b + c; }\nexpect(myApply(sum, { base: 10 }, [1, 2, 3])).toBe(16);\nexpect(myApply(sum, { base: 0 }, { length: 3, 0: 1, 1: 1, 2: 1 })).toBe(3);\nfunction count() { return arguments.length; }\nexpect(myApply(count, {})).toBe(0);\nexpect(myApply(count, {}, null)).toBe(0);' },
        { name: 'null/undefined → globalThis, примітив → обгортка', code: 'function getThis() { return this; }\nexpect(myCall(getThis, null)).toBe(globalThis);\nexpect(myCall(getThis, undefined)).toBe(globalThis);\nconst t = myCall(getThis, 5);\nexpect(typeof t).toBe("object");\nexpect(t.valueOf()).toBe(5);\nexpect(myApply(getThis, "str", []) instanceof String).toBe(true);' },
        { name: 'не залишає слідів на context', code: 'function f() { return Object.keys(this).length; }\nconst ctx = { a: 1, fn: "keep" };\nmyCall(f, ctx);\nmyApply(f, ctx, []);\nexpect(Reflect.ownKeys(ctx)).toEqual(["a", "fn"]);\nexpect(ctx.fn).toBe("keep");' },
        { name: 'прибирає за собою після помилки', code: 'function boom() { throw new Error("boom"); }\nconst ctx = {};\nexpect(() => myCall(boom, ctx)).toThrow("boom");\nexpect(() => myApply(boom, ctx, [])).toThrow("boom");\nexpect(Reflect.ownKeys(ctx)).toEqual([]);' },
        { name: 'TypeError для не-функцій та невалідних аргументів', code: 'expect(() => myCall({}, null)).toThrow(TypeError);\nfunction f() {}\nexpect(() => myApply(f, null, 5)).toThrow(TypeError);' },
        { name: 'не використовує нативні call/apply/bind', code: 'const saved = { call: Function.prototype.call, apply: Function.prototype.apply, bind: Function.prototype.bind };\nfunction f(a, b) { return this.x + a + b; }\nlet r1, r2, err = null;\nconst ban = () => { throw new Error("нативні call/apply/bind заборонені"); };\nFunction.prototype.call = ban; Function.prototype.apply = ban; Function.prototype.bind = ban;\ntry {\n  r1 = myCall(f, { x: 1 }, 2, 3);\n  r2 = myApply(f, { x: 1 }, [2, 3]);\n} catch (e) {\n  err = e;\n} finally {\n  Object.assign(Function.prototype, saved);\n}\nexpect(err).toBeNull();\nexpect(r1).toBe(6);\nexpect(r2).toBe(6);' }
      ],
      explanation: `
Явна прив'язка через неявну: функція тимчасово стає методом контексту. Symbol не перезапише поле і не видний у \`Object.keys\`. O(n) за аргументами.

**Обмеження (варто назвати):** не працює із замороженим контекстом; strict-функції з нативним \`call(null)\` отримують \`null\`, а поліфіл — \`globalThis\`.

**Типові помилки:** рядковий ключ \`'fn'\`; не видаляти ключ після помилки; забути \`return\`.

**Що спитають далі:** як реалізувати \`bind\` через \`myCall\`?
`
    },
    {
      id: 'this-my-bind',
      group: 'polyfills',
      type: 'code',
      level: 3,
      interview: true,
      title: 'Поліфіл bind',
      tags: ['bind', 'polyfill', 'closures'],
      description: `
**Завдання.** Напишіть \`myBind(fn, context, ...boundArgs)\` — аналог \`fn.bind(context, ...boundArgs)\` **без** нативного \`bind\` (\`call\`/\`apply\` можна).

**Де трапляється:** одне з найчастіших завдань на співбесідах про \`this\` і замикання.

**Що написати**
- \`myBind(fn, context, ...boundArgs)\` → нова функція; її виклик з \`...callArgs\` повертає результат \`fn\` з \`this = context\` і аргументами \`[...boundArgs, ...callArgs]\`
- \`fn\` не функція → \`TypeError\`

**Приклад**
\`\`\`js
function greet(greeting, punct) { return greeting + ', ' + this.name + punct; }
const hi = myBind(greet, { name: 'Ann' }, 'Hi');
hi('!');                       // 'Hi, Ann!'
hi.call({ name: 'Bob' }, '?'); // 'Hi, Ann?' — this не змінюється
\`\`\`

**Як це працює:** повернута функція через замикання пам'ятає \`fn\`, \`context\` і \`boundArgs\` і **не використовує власний \`this\`** — тому \`call\`, \`apply\` і повторний \`myBind\` не змінюють контекст.

**Врахуйте:** часткові аргументи накопичуються при повторному \`myBind\`; результат \`fn\` треба повернути. (Підтримка \`new\` — наступна задача.)
`,
      starter: `function myBind(fn, context, ...boundArgs) {
  // 1. fn не функція → throw new TypeError(...)
  // 2. Поверніть функцію (...callArgs) => результат fn.apply(context, [...boundArgs, ...callArgs])
  // TODO
}

// Спробуйте в консолі:
// const hi = myBind(function (p) { return this.name + p; }, { name: 'Ann' }); hi('!');
`,
      solution: `function myBind(fn, context, ...boundArgs) {
  if (typeof fn !== 'function') {
    throw new TypeError('myBind expects a function');
  }
  return function (...callArgs) {
    // власний this обгортки ігнорується — тому перепривʼязати неможливо
    return fn.apply(context, [...boundArgs, ...callArgs]);
  };
}
`,
      hints: [
        'Поверніть нову функцію, яка збирає свої аргументи через rest.',
        'Усередині — `fn.apply(context, [...boundArgs, ...callArgs])` і `return` результату.',
        'Чому не можна перепривʼязати? Обгортка **не читає** свій `this` — лише збережений `context`.'
      ],
      tests: [
        { name: 'прив\'язує this', code: 'function getName() { return this.name; }\nconst f = myBind(getName, { name: "Ann" });\nexpect(f()).toBe("Ann");\nconst obj = { name: "Obj", f };\nexpect(obj.f()).toBe("Ann");' },
        { name: 'часткове застосування', code: 'function sum(a, b, c) { return a + b + c; }\nexpect(myBind(sum, null, 1)(2, 3)).toBe(6);\nexpect(myBind(sum, null, 1, 2)(3)).toBe(6);\nexpect(myBind(sum, null, 1, 2, 3)()).toBe(6);' },
        { name: 'call/apply не змінюють this', code: 'function getX() { return this.x; }\nconst f = myBind(getX, { x: 1 });\nexpect(f.call({ x: 2 })).toBe(1);\nexpect(f.apply({ x: 3 })).toBe(1);' },
        { name: 'повторний myBind: this не змінюється, аргументи накопичуються', code: 'function f(a, b) { return [this.x, a, b]; }\nconst g = myBind(myBind(f, { x: 1 }, "a"), { x: 2 }, "b");\nexpect(g()).toEqual([1, "a", "b"]);' },
        { name: 'повертає результат і працює як колбек', code: 'useFakeTimers();\nconst counter = { n: 0, inc() { this.n++; return this.n; } };\nconst inc = myBind(counter.inc, counter);\nexpect(inc()).toBe(1);\nsetTimeout(inc, 10);\nadvanceTimersByTime(10);\nexpect(counter.n).toBe(2);' },
        { name: 'TypeError на не-функції', code: 'expect(() => myBind({ a: 1 })).toThrow(TypeError);' },
        { name: 'не використовує нативний bind', code: 'const nativeBind = Function.prototype.bind;\nfunction f(a) { return this.v + a; }\nlet res, err = null;\nFunction.prototype.bind = () => { throw new Error("нативний bind заборонено"); };\ntry {\n  res = myBind(f, { v: 1 }, 2)();\n} catch (e) {\n  err = e;\n} finally {\n  Function.prototype.bind = nativeBind;\n}\nexpect(err).toBeNull();\nexpect(res).toBe(3);' }
      ],
      explanation: `
Замикання зберігає \`fn\`, \`context\`, \`boundArgs\`; обгортка ігнорує свій \`this\`. O(n) за аргументами на виклик.

**Відмінності від нативного:** не підтримує \`new\`; \`name\`/\`length\` не як у \`"bound greet"\`.

**Типові помилки:** використати \`this\` обгортки замість \`context\`; переплутати порядок аргументів; забути \`return\`.

**Що спитають далі:** як підтримати \`new\`? Як зберегти \`length\` (\`Object.defineProperty\`)?
`
    },
    {
      id: 'this-my-bind-new',
      group: 'polyfills',
      type: 'code',
      level: 4,
      title: 'Поліфіл bind з підтримкою new',
      tags: ['bind', 'polyfill', 'new'],
      description: `
**Завдання.** Розширте \`myBind(fn, context, ...boundArgs)\`, щоб результат поводився як нативний \`bind\` **і при виклику з \`new\`**.

**Де трапляється:** «ускладнене» продовження задачі про поліфіл bind на співбесідах рівня Middle+/Senior.

**Що написати**
- \`myBind(fn, context, ...boundArgs)\` → функція \`bound\`:
  - звичайний виклик — як у попередній задачі
  - \`new bound(...args)\` — прив'язаний \`context\` **ігнорується**, повертається \`new fn(...boundArgs, ...args)\`

**Приклад**
\`\`\`js
function Person(name, age) { this.name = name; this.age = age; }
const BoundPerson = myBind(Person, { ignored: true }, 'Ann');
const p = new BoundPerson(30);
p.name;              // 'Ann'
p instanceof Person; // true
\`\`\`

**Як це працює:** усередині функції мета-властивість \`new.target\` — це сама функція, якщо її викликали через \`new\`, і \`undefined\` при звичайному виклику. У гілці з \`new\` викликаємо \`new fn(...)\` — оригінал сам створить екземпляр.

**Врахуйте:** якщо конструктор повертає об'єкт — \`new\` повертає саме його; для стрілки \`new\` має кинути \`TypeError\`.
`,
      starter: `function myBind(fn, context, ...boundArgs) {
  if (typeof fn !== 'function') {
    throw new TypeError('myBind expects a function');
  }
  return function bound(...args) {
    const allArgs = [...boundArgs, ...args];
    // 1. TODO: якщо викликано через new (new.target) → return new fn(...allArgs)
    // 2. Інакше — звичайний виклик з прив'язаним context
    return fn.apply(context, allArgs);
  };
}

// Спробуйте в консолі:
// function P(n) { this.n = n; } const B = myBind(P, {}, 5); new B();
`,
      solution: `function myBind(fn, context, ...boundArgs) {
  if (typeof fn !== 'function') {
    throw new TypeError('myBind expects a function');
  }
  return function bound(...args) {
    const allArgs = [...boundArgs, ...args];
    if (new.target) {
      // виклик через new: прив'язаний context ігнорується,
      // екземпляр створює оригінальна функція
      return new fn(...allArgs);
    }
    return fn.apply(context, allArgs);
  };
}
`,
      hints: [
        'Як усередині функції дізнатися, що її викликали через `new`? Мета-властивість `new.target`.',
        'У гілці з `new` поверніть `new fn(...allArgs)` — тоді `instanceof fn`, повернений конструктором об\'єкт і `TypeError` для стрілки працюють самі.'
      ],
      tests: [
        { name: 'звичайний виклик як у bind', code: 'function f(a, b) { return [this.x, a, b]; }\nconst g = myBind(f, { x: 1 }, "a");\nexpect(g("b")).toEqual([1, "a", "b"]);\nexpect(g.call({ x: 2 }, "c")).toEqual([1, "a", "c"]);' },
        { name: 'new ігнорує прив\'язаний this', code: 'function Person(name, age) { this.name = name; this.age = age; }\nconst ctx = {};\nconst B = myBind(Person, ctx, "Ann");\nconst p = new B(30);\nexpect(p.name).toBe("Ann");\nexpect(p.age).toBe(30);\nexpect(ctx).toEqual({});' },
        { name: 'екземпляр оригіналу з його методами', code: 'function Person(name) { this.name = name; this.hi = function () { return "hi " + this.name; }; }\nconst B = myBind(Person, null, "Bob");\nconst p = new B();\nexpect(p instanceof Person).toBe(true);\nexpect(p.hi()).toBe("hi Bob");' },
        { name: 'конструктор, що повертає об\'єкт', code: 'function F() { this.a = 1; return { custom: true }; }\nconst B = myBind(F, {});\nexpect(new B()).toEqual({ custom: true });' },
        { name: 'стрілку не можна викликати з new', code: 'const B = myBind(() => 1, null);\nexpect(B()).toBe(1);\nexpect(() => new B()).toThrow(TypeError);' },
        { name: 'не використовує нативний bind', code: 'const nativeBind = Function.prototype.bind;\nfunction P(n) { this.n = n; }\nlet inst, val, err = null;\nFunction.prototype.bind = () => { throw new Error("нативний bind заборонено"); };\ntry {\n  const B = myBind(P, { n: 0 }, 5);\n  inst = new B();\n  val = myBind(function () { return this.n; }, { n: 7 })();\n} catch (e) {\n  err = e;\n} finally {\n  Function.prototype.bind = nativeBind;\n}\nexpect(err).toBeNull();\nexpect(inst.n).toBe(5);\nexpect(val).toBe(7);' }
      ],
      explanation: `
\`new.target\` надійно відрізняє \`new bound()\` від \`bound()\`. \`new fn(...)\` дає правильний екземпляр, поважає об'єкт, повернений конструктором, і кидає \`TypeError\` для стрілок. O(n) за аргументами.

**Класичний ES5-варіант** — перевірка \`this instanceof bound\` і ручне налаштування прототипу; його розберемо в темі про прототипи.

**Типові помилки:** використати \`context\` при \`new\`; загубити часткові аргументи в гілці \`new\`.
`
    },
    {
      id: 'this-soft-bind',
      group: 'polyfills',
      type: 'code',
      level: 4,
      title: 'softBind: «м\'яка» прив\'язка',
      tags: ['bind', 'this', 'polyfill'],
      description: `
**Завдання.** Напишіть \`softBind(fn, defaultThis, ...boundArgs)\` — **м'яку** прив'язку: \`defaultThis\` використовується, лише коли функцію викликали без контексту.

**Де трапляється:** задача з «You Don't Know JS» на глибоке розуміння правил \`this\`; ідея — колбек не втрачає контекст, але функцію досі можна «позичати» іншим об'єктам.

**Що написати**
- \`softBind(fn, defaultThis, ...boundArgs)\` → функція:
  - \`this\` — \`undefined\`, \`null\` або \`globalThis\` → викликає \`fn\` з \`defaultThis\`
  - інакше (метод, \`call\`/\`apply\`) → з поточним \`this\`
  - аргументи \`[...boundArgs, ...args]\`

**Приклад**
\`\`\`js
function name() { return this.name; }
const soft = softBind(name, { name: 'Ann' });
soft();                      // 'Ann' — немає контексту
const bob = { name: 'Bob', getName: soft };
bob.getName();               // 'Bob' — неявна прив'язка перемагає
soft.call({ name: 'Eve' });  // 'Eve'
\`\`\`

**Як це працює:** обгортка — звичайна \`function\`, тож має власний динамічний \`this\` і перевіряє його при кожному виклику. Простий виклик дає \`undefined\` (strict) або \`globalThis\` (sloppy) — тоді підставляємо \`defaultThis\`.

**Врахуйте:** стрілка як обгортка не підійде (лексичний \`this\`); \`!this\` не спрацює для \`globalThis\`.
`,
      starter: `function softBind(fn, defaultThis, ...boundArgs) {
  return function (...args) {
    // 1. TODO: noContext = this === undefined || this === null || this === globalThis
    // 2. TODO: викликати fn з (noContext ? defaultThis : this)
    return fn.apply(defaultThis, [...boundArgs, ...args]);
  };
}

// Спробуйте в консолі:
// const s = softBind(function () { return this.n; }, { n: 'def' }); s(); ({ n: 'obj', s }).s();
`,
      solution: `function softBind(fn, defaultThis, ...boundArgs) {
  if (typeof fn !== 'function') {
    throw new TypeError('softBind expects a function');
  }
  return function (...args) {
    // "немає контексту": default binding дав undefined/null (strict) або globalThis (sloppy)
    const noContext = this === undefined || this === null || this === globalThis;
    return fn.apply(noContext ? defaultThis : this, [...boundArgs, ...args]);
  };
}
`,
      hints: [
        'Обгортка має бути звичайною `function`, щоб мати власний `this`.',
        'Умова «контексту немає»: `this` — `undefined`, `null` або `globalThis`.',
        'Далі `fn.apply(noContext ? defaultThis : this, [...boundArgs, ...args])`.'
      ],
      tests: [
        { name: 'без контексту → defaultThis', code: 'function name() { return this.name; }\nconst soft = softBind(name, { name: "Ann" });\nexpect(soft()).toBe("Ann");' },
        { name: 'неявна прив\'язка перемагає', code: 'function name() { return this.name; }\nconst bob = { name: "Bob", getName: softBind(name, { name: "Ann" }) };\nexpect(bob.getName()).toBe("Bob");' },
        { name: 'call/apply перемагають', code: 'function name() { return this.name; }\nconst soft = softBind(name, { name: "Ann" });\nexpect(soft.call({ name: "Eve" })).toBe("Eve");\nexpect(soft.apply({ name: "Max" })).toBe("Max");\nexpect(soft.call(null)).toBe("Ann");\nexpect(soft.call(undefined)).toBe("Ann");' },
        { name: 'колбек таймера отримує defaultThis', code: 'useFakeTimers();\nconst results = [];\nfunction push() { results.push(this.id); }\nsetTimeout(softBind(push, { id: 1 }), 10);\nadvanceTimersByTime(10);\nexpect(results).toEqual([1]);' },
        { name: 'часткові аргументи', code: 'function f(a, b) { return this.p + a + b; }\nconst soft = softBind(f, { p: "D" }, "1");\nexpect(soft("2")).toBe("D12");\nexpect(soft.call({ p: "X" }, "3")).toBe("X13");' },
        { name: 'відрізняється від bind', code: 'function who() { return this.n; }\nconst hard = who.bind({ n: "hard" });\nconst soft = softBind(who, { n: "soft" });\nconst o = { n: "obj", hard, soft };\nexpect(o.hard()).toBe("hard");\nexpect(o.soft()).toBe("obj");' }
      ],
      explanation: `
\`softBind\` змінює лише правило за замовчуванням: замість \`undefined\`/\`globalThis\` — \`defaultThis\`; неявна та явна прив'язки працюють. O(n) за аргументами.

**Компроміс:** навмисний \`soft.call(globalThis)\` теж отримає default.

**Типові помилки:** стрілка-обгортка; перевірка \`!this\`; \`this || defaultThis\`.
`
    }
  ]
});
