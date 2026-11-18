FE.topic('js-prototypes', {
  intro: `
**Прототипне наслідування:** кожен об'єкт має приховане посилання \`[[Prototype]]\` на інший об'єкт (або \`null\`). Якщо властивості немає в об'єкті — пошук іде далі по ланцюжку прототипів.

## Три різні речі

| Що | Де є | Що це |
|---|---|---|
| \`[[Prototype]]\` | у кожного об'єкта | внутрішній слот — справжній прототип |
| \`obj.__proto__\` | геттер/сеттер на \`Object.prototype\` | застарілий доступ до \`[[Prototype]]\` (краще \`Object.getPrototypeOf/setPrototypeOf\`) |
| \`Fn.prototype\` | у звичайних функцій і класів | об'єкт, який стане \`[[Prototype]]\` для \`new Fn()\` |

\`\`\`js
function User(name) { this.name = name; }
User.prototype.hi = function () { return 'Hi, ' + this.name; };
const u = new User('Ann');
Object.getPrototypeOf(u) === User.prototype;          // true
Object.getPrototypeOf(User.prototype) === Object.prototype; // true
// u → User.prototype → Object.prototype → null
\`\`\`

## Що робить \`new F(...args)\`

1. Створює об'єкт з \`[[Prototype]] = F.prototype\`;
2. викликає \`F\` з \`this\` = цей об'єкт;
3. якщо \`F\` повернула **об'єкт** — результат він, інакше — створений об'єкт.

## Ланцюжок і запис

- **Читання** йде по ланцюжку; **запис** (\`obj.x = 1\`) створює власну властивість (затінення, shadowing) — якщо в ланцюжку немає сеттера чи non-writable \`x\`.
- Мутація об'єкта/масиву з прототипу (\`a.items.push\`) змінює **спільний** стан для всіх.
- \`obj instanceof F\` ⇔ \`F.prototype\` є десь у ланцюжку \`obj\`.

## Класи

\`\`\`js
class Animal {
  #id = 1;                       // приватне поле
  legs = 4;                      // поле екземпляра
  static count = 0;              // статичне поле
  constructor(name) { this.name = name; }
  speak() { return this.name; }  // метод на прототипі (неперелічуваний)
  get id() { return this.#id; }
  static create(n) { return new this(n); }
}
class Dog extends Animal {
  constructor(name) { super(name); /* this доступний лише після super() */ }
  speak() { return super.speak() + ' barks'; }
}
\`\`\`

Відмінності класів від функцій-конструкторів: виклик лише з \`new\`, TDZ (не можна використати до оголошення), тіло завжди в strict mode, методи неперелічувані, коректне наслідування вбудованих класів (\`Array\`, \`Error\`).

\`extends\` будує **два** ланцюжки: \`Dog.prototype → Animal.prototype\` (методи) і \`Dog → Animal\` (статика).

## Пастки

- Стрілкове поле (\`handle = () => {}\`) — нова функція в **кожному** екземплярі, не на прототипі.
- Базовий конструктор, що викликає перевизначений метод, бачить поля нащадка ще **не ініціалізованими**.
- \`Object.create(null)\` — немає \`toString\`, \`hasOwnProperty\`; \`String(obj)\` → \`TypeError\`.
- \`Object.setPrototypeOf\` на існуючому об'єкті повільний — задавайте прототип при створенні.
- Prototype pollution: \`obj['__proto__'].x = 1\` змінює **всі** об'єкти.
`,
  groups: [
    { id: 'chain', title: '[[Prototype]] і ланцюжок прототипів' },
    { id: 'constructors', title: 'Функції-конструктори, prototype і new' },
    { id: 'instanceof', title: 'instanceof' },
    { id: 'es5-inheritance', title: 'Наслідування без class' },
    { id: 'classes', title: 'Класи: що всередині' },
    { id: 'extends', title: 'extends і super' },
    { id: 'private', title: 'Інкапсуляція: #приватні поля' },
    { id: 'design', title: 'Поля-стрілки, композиція, міксини, безпека' }
  ],
  items: [
    // ---------------------------------------------------------------- 1. Ланцюжок прототипів
    {
      id: 'proto-quiz-shadowing',
      group: 'chain',
      type: 'quiz',
      level: 2,
      title: 'Спільний стан у прототипі та затінення',
      tags: ['prototypes', 'shadowing'],
      question: `
**Як це працює:** кожен об'єкт має приховане посилання \`[[Prototype]]\` на інший об'єкт. Якщо властивості немає в самому об'єкті, її шукають у прототипі, далі в його прототипі — до \`null\`. \`Object.create(proto)\` створює порожній об'єкт з прототипом \`proto\`. **Запис** \`obj.x = v\` завжди створює власну властивість.

Що виведе код?

\`\`\`js
const proto = { items: [], count: 0 };
const a = Object.create(proto);
const b = Object.create(proto);

a.items.push('x');
a.count++;

console.log(b.items, b.count, a.count, Object.keys(a));
\`\`\`
`,
      options: [
        '`[] 0 1 ["items", "count"]`',
        '`["x"] 1 1 []`',
        '`["x"] 0 1 ["count"]`',
        '`[] 0 1 ["count"]`'
      ],
      answer: 2,
      why: [
        '`a.items.push` не створює власного `items` — він мутує масив, знайдений у прототипі, спільний для `b`.',
        '`a.count++` — це запис, він створює власну `a.count`, а `proto.count` і `b.count` лишаються 0.',
        'Правильно: масив спільний (мутація через прототип), а `count++` створив власну властивість лише в `a`.',
        'Масив не копіюється в `a` — `push` змінив той самий масив, що бачить і `b`.'
      ],
      hint: 'Чим відрізняється **мутація** об\'єкта, знайденого в прототипі, від **присвоєння** властивості?',
      explanation: `
Тому в прототип кладуть **методи** (спільні для всіх), а стан — особливо масиви й об'єкти — створюють для кожного екземпляра окремо (у конструкторі).
`
    },
    {
      id: 'proto-quiz-null-proto',
      group: 'chain',
      type: 'quiz',
      level: 2,
      title: 'Об\'єкт без прототипу',
      tags: ['prototypes', 'object-create'],
      question: `
**Як це працює:** звичайний об'єкт отримує \`toString\`, \`hasOwnProperty\` тощо зі свого прототипу — \`Object.prototype\`. \`Object.create(null)\` створює об'єкт **взагалі без прототипу**.

Що виведе код?

\`\`\`js
const dict = Object.create(null);
dict.key = 'value';
console.log('key' in dict, typeof dict.toString);
console.log(String(dict));
\`\`\`
`,
      options: [
        '`true "undefined"`, потім `TypeError`',
        '`true "function"`, потім `[object Object]`',
        '`true "undefined"`, потім `[object Object]`',
        '`false "undefined"`, потім `""`'
      ],
      answer: 0,
      why: [
        'Правильно: власний `key` знаходиться, `toString` немає, і `String(dict)` не може привести об\'єкт до примітиву.',
        '`toString` береться з `Object.prototype`, якого в ланцюжку немає.',
        'Без `toString`/`valueOf` перетворення на рядок неможливе — це `TypeError`, а не `[object Object]`.',
        '`key` — власна властивість, тому `in` дає `true`.'
      ],
      hint: 'Звідки зазвичай беруться `toString` і `valueOf`?',
      explanation: `
Такі об'єкти — безпечні словники: ключі \`'toString'\`, \`'__proto__'\` не конфліктують з успадкованими (так повертає результат \`Object.groupBy\`). Ціна — немає звичних методів, \`'' + dict\` падає.
`
    },
    {
      id: 'proto-chain-names',
      group: 'chain',
      type: 'code',
      level: 2,
      title: 'Утиліта для дебагу: ланцюжок прототипів',
      tags: ['prototypes', 'chain'],
      description: `
**Завдання.** Напишіть \`getPrototypeChain(value)\` — масив імен **усіх прототипів** значення (сам об'єкт не включається), від найближчого до \`Object.prototype\`.

**Де трапляється:** відлагодження («чому в цього об'єкта є метод X?»), питання «яким буде ланцюжок прототипів масиву / \`document.body\`?».

**Що написати**
- \`getPrototypeChain(value)\` → масив рядків
  - ім'я прототипу — \`name\` його **власної** властивості \`constructor\`; немає власного \`constructor\` або ім'я порожнє → \`'(anonymous)'\`
  - примітиви — через обгортку: \`5\` → \`['Number', 'Object']\`
  - \`null\`/\`undefined\` → \`[]\`

**Приклад**
\`\`\`js
getPrototypeChain([]);                       // ['Array', 'Object']
getPrototypeChain(new TypeError('x'));       // ['TypeError', 'Error', 'Object']
getPrototypeChain(Object.create({ x: 1 }));  // ['(anonymous)', 'Object']
\`\`\`

**Як це працює:** \`Object.getPrototypeOf(obj)\` повертає наступну ланку, в кінці — \`null\`. У вбудованих прототипів (прототип масивів, помилок…) є власна властивість \`constructor\` — функція \`Array\`, \`Error\` тощо, з якої беремо \`name\`.

**Врахуйте:** перевіряйте саме **власний** \`constructor\` (\`Object.hasOwn\`) — успадкований дасть хибне \`'Object'\`; \`Object.create(null)\` → \`[]\`.
`,
      starter: `function getPrototypeChain(value) {
  // 1. null/undefined → []
  // 2. let proto = Object.getPrototypeOf(Object(value)); // Object() — обгортка для примітивів
  // 3. while (proto !== null):
  //    - власний constructor? (Object.hasOwn(proto, 'constructor')) і має name → name
  //    - інакше '(anonymous)'
  //    - proto = Object.getPrototypeOf(proto)
  // TODO
}

// Спробуйте в консолі:
// getPrototypeChain(new TypeError('x')); // ['TypeError', 'Error', 'Object']
`,
      solution: `function getPrototypeChain(value) {
  if (value === null || value === undefined) return [];

  const chain = [];
  let proto = Object.getPrototypeOf(Object(value)); // Object() — обгортка для примітивів

  while (proto !== null) {
    const ctor = Object.hasOwn(proto, 'constructor') ? proto.constructor : null;
    chain.push(typeof ctor === 'function' && ctor.name ? ctor.name : '(anonymous)');
    proto = Object.getPrototypeOf(proto);
  }
  return chain;
}
`,
      hints: [
        'Цикл `while (proto !== null)` з `proto = Object.getPrototypeOf(proto)`.',
        'Перевіряйте **власний** `constructor` через `Object.hasOwn`, інакше для анонімного прототипу отримаєте успадкований `Object`.',
        '`Object(5)` перетворює примітив на обгортку `Number`.'
      ],
      tests: [
        { name: 'вбудовані типи', code: 'expect(getPrototypeChain([])).toEqual(["Array", "Object"]);\nexpect(getPrototypeChain(() => {})).toEqual(["Function", "Object"]);\nexpect(getPrototypeChain({})).toEqual(["Object"]);' },
        { name: 'багаторівневий ланцюжок помилок', code: 'expect(getPrototypeChain(new TypeError("x"))).toEqual(["TypeError", "Error", "Object"]);' },
        { name: 'примітиви через обгортки', code: 'expect(getPrototypeChain(5)).toEqual(["Number", "Object"]);\nexpect(getPrototypeChain("s")).toEqual(["String", "Object"]);' },
        { name: 'null, undefined і Object.create(null)', code: 'expect(getPrototypeChain(null)).toEqual([]);\nexpect(getPrototypeChain(undefined)).toEqual([]);\nexpect(getPrototypeChain(Object.create(null))).toEqual([]);' },
        { name: 'анонімний прототип без власного constructor', code: 'const proto = { speak() {} };\nexpect(getPrototypeChain(Object.create(proto))).toEqual(["(anonymous)", "Object"]);' },
        { name: 'кілька рівнів Object.create', code: 'const base = {};\nconst mid = Object.create(base);\nexpect(getPrototypeChain(Object.create(mid))).toEqual(["(anonymous)", "(anonymous)", "Object"]);' }
      ],
      explanation: `
Обхід через \`Object.getPrototypeOf\` до \`null\` — O(глибина ланцюжка). \`constructor\` ненадійний для перевірки типу (його можна перезаписати) — для цього є \`instanceof\` (далі в темі).

**Що спитають далі:** який ланцюжок у \`document.body\`? (HTMLBodyElement → HTMLElement → Element → Node → EventTarget → Object.)
`
    },

    // ---------------------------------------------------------------- 2. Конструктори і new
    {
      id: 'proto-quiz-proto-vs-prototype',
      group: 'constructors',
      type: 'quiz',
      level: 1,
      interview: true,
      title: 'prototype, __proto__ і getPrototypeOf',
      tags: ['prototypes'],
      question: `
**Як це працює:** у кожної звичайної функції є властивість \`prototype\` — об'єкт, який стане прототипом для всіх об'єктів, створених через \`new F()\`. Методи кладуть туди — і вони спільні для всіх екземплярів:
\`\`\`js
function User(name) { this.name = name; }
User.prototype.hi = function () { return 'Hi, ' + this.name; };
\`\`\`
\`obj.__proto__\` — застарілий спосіб прочитати прототип; сучасний — \`Object.getPrototypeOf(obj)\`.

\`\`\`js
function User(name) { this.name = name; }
const u = new User('Ann');
\`\`\`

Оберіть **усі** вирази, що дорівнюють \`true\`:
`,
      options: [
        '`Object.getPrototypeOf(u) === User.prototype`',
        '`u.prototype === User.prototype`',
        '`User.prototype.constructor === User`',
        '`Object.getPrototypeOf(User) === Function.prototype`',
        '`u.__proto__ === User`',
        '`Object.getPrototypeOf(User.prototype) === Object.prototype`'
      ],
      answer: [0, 2, 3, 5],
      why: [
        'Правильно: `new` робить `User.prototype` прототипом екземпляра.',
        'Хибно: властивість `prototype` є у функцій, а в екземпляра `u.prototype` — `undefined`.',
        'Правильно: `F.prototype` за замовчуванням має `constructor`, що вказує назад на `F`.',
        'Правильно: `User` — функція, її власний прототип — `Function.prototype` (звідти `call`, `bind`).',
        'Хибно: `u.__proto__` — це `User.prototype`, а не сама функція.',
        'Правильно: `User.prototype` — звичайний об\'єкт, його прототип — `Object.prototype`.'
      ],
      hint: 'Властивість `prototype` є у функцій, а не в екземплярів.',
      explanation: `
Три різні речі: \`[[Prototype]]\` (справжній прототип будь-якого об'єкта), \`__proto__\` (легасі-доступ до нього), \`F.prototype\` (заготовка прототипу для \`new F()\`). Ланцюжок: \`u → User.prototype → Object.prototype → null\`.
`
    },
    {
      id: 'proto-theory-prototype',
      group: 'constructors',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Що таке прототип? __proto__ vs prototype',
      tags: ['prototypes'],
      question: 'Що таке прототип і прототипне наслідування в JavaScript? Чим відрізняються [[Prototype]], __proto__ і властивість prototype? Як відбувається пошук властивості? Оберіть **усі** правильні твердження.',
      choices: [
        '`F.prototype` — прототип самої функції `F`, тобто те, що повертає `Object.getPrototypeOf(F)`',
        'Якщо властивості немає в об\'єкті, пошук іде ланцюжком `[[Prototype]]` аж до `null`',
        '`__proto__` — власна властивість кожного об\'єкта, тож вона є й в `Object.create(null)`',
        'Запис `obj.x = v` змінює успадковану властивість `x` прямо в прототипі',
        '`F.prototype` стає `[[Prototype]]` для екземплярів, створених через `new F()`'
      ],
      correct: [1, 4],
      why: [
        'Хибно: прототип самої функції — `Function.prototype`; `F.prototype` — заготовка для її екземплярів.',
        'Правильно: так працює прототипне наслідування.',
        'Хибно: `__proto__` — геттер на `Object.prototype`, тож в об\'єкта без прототипу його немає.',
        'Хибно: запис створює власну властивість, що затіняє успадковану (якщо там немає сеттера).',
        'Правильно: це і є роль властивості `prototype` у функцій.'
      ],
      hint: 'Внутрішній слот, застарілий аксесор і властивість функції-конструктора — це три різні речі.',
      answer: `
- **\`[[Prototype]]\`** — внутрішній слот кожного об'єкта; \`Object.getPrototypeOf\` / задається при створенні (\`Object.create\`, \`new\`, літерал).
- **\`obj.__proto__\`** — легасі-геттер/сеттер на \`Object.prototype\`; немає в \`Object.create(null)\`.
- **\`F.prototype\`** — властивість функції: стане \`[[Prototype]]\` для \`new F()\`; містить \`constructor: F\`.
- **Читання:** власні → прототип → … → \`null\` → \`undefined\`.
- **Запис:** створює власну властивість (shadowing); винятки — сеттер або \`writable: false\` у ланцюжку.
- **Навіщо:** методи один раз на прототипі, спільні для всіх екземплярів; на цьому побудовані класи.
`,
      keyPoints: [
        '[[Prototype]] — внутрішнє посилання; доступ через Object.getPrototypeOf',
        '__proto__ — легасі аксесор на Object.prototype',
        'F.prototype — об\'єкт-прототип для екземплярів new F(), а не прототип самої F',
        'Пошук по ланцюжку до null; запис створює власну властивість (shadowing)'
      ],
      followUps: ['Як створити об\'єкт без прототипу і навіщо?', 'Чому Object.setPrototypeOf вважається повільним?']
    },
    {
      id: 'proto-quiz-constructor-return',
      group: 'constructors',
      type: 'quiz',
      level: 2,
      title: 'Конструктор повертає значення',
      tags: ['prototypes', 'new'],
      question: `
**Як це працює:** \`new F()\` створює об'єкт з прототипом \`F.prototype\`, викликає \`F\` з \`this\` = цей об'єкт і повертає його. Але якщо \`F\` явно повернула **об'єкт** — результатом \`new\` буде він.

Що виведе код?

\`\`\`js
function A() { this.x = 1; return { y: 2 }; }
function B() { this.x = 1; return 42; }

const a = new A();
const b = new B();
console.log(a.x, a.y, b.x, a instanceof A);
\`\`\`
`,
      options: ['`1 2 1 true`', '`undefined 2 42 false`', '`1 undefined 1 true`', '`undefined 2 1 false`'],
      answer: 3,
      why: [
        '`A` повернула об\'єкт, тож створений `this` з `x = 1` викинуто — `a.x` це `undefined`.',
        'Примітив `42` з `B` ігнорується — `new` повертає створений об\'єкт з `x = 1`.',
        '`return { y: 2 }` замінює результат `new A()`, тому `a.y === 2`.',
        'Правильно: об\'єкт з `A` замінив екземпляр (це звичайний літерал, не `instanceof A`), а примітив з `B` проігноровано.'
      ],
      hint: 'Що робить `new`, якщо конструктор повертає об\'єкт, і що — якщо примітив?',
      explanation: `
Повернення об'єкта з конструктора використовують рідко: кеш екземплярів (singleton), повернення Proxy. Примітиви і \`null\` ігноруються.
`
    },
    {
      id: 'proto-theory-new',
      group: 'constructors',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Що робить оператор new?',
      tags: ['prototypes', 'new'],
      question: 'Що відбувається покроково, коли викликається new F(...args)? Що буде, якщо конструктор поверне значення? Які функції не можна викликати з new?',
      choices: [
        'Якщо конструктор повертає примітив, результатом `new` стає саме цей примітив',
        'Стрілки й методи-скорочення можна викликати з `new` — вони просто отримають порожній `this`',
        '`new` копіює всі властивості `F.prototype` у новий об\'єкт як власні',
        'Об\'єкт отримує `[[Prototype]] = F.prototype`; повернений із `F` об\'єкт його замінює'
      ],
      correct: 3,
      why: [
        'Хибно: примітив ігнорується, повертається створений об\'єкт.',
        'Хибно: у стрілок і методів-скорочень немає `[[Construct]]` — `new` кидає `TypeError`.',
        'Хибно: нічого не копіюється — об\'єкт лише посилається на `F.prototype`.',
        'Правильно: це кроки 2 і 4 алгоритму `new`.'
      ],
      answer: `
**Кроки \`new F(...args)\`:**
1. Новий порожній об'єкт.
2. \`[[Prototype]] = F.prototype\` (якщо це не об'єкт — \`Object.prototype\`).
3. Виклик \`F\` з \`this\` = новий об'єкт; усередині \`new.target === F\`.
4. Повернено об'єкт/функцію → результат він; інакше — створений об'єкт.

\`\`\`js
function myNew(F, ...args) {
  const obj = Object.create(F.prototype);
  const result = F.apply(obj, args);
  return result !== null && (typeof result === 'object' || typeof result === 'function') ? result : obj;
}
\`\`\`

- **Не конструктори:** стрілки, методи-скорочення \`{ m() {} }\`, генератори, \`Math.max\` — \`TypeError: ... is not a constructor\`.
- Виклик конструктора **без** \`new\` — \`this\` буде \`undefined\`/глобальним (баг). Захист: \`if (!new.target) return new F(...args)\`.
`,
      keyPoints: [
        'Новий об\'єкт з [[Prototype]] = F.prototype',
        'Виклик F з this = новий об\'єкт',
        'Повернений об\'єкт замінює результат; примітив ігнорується',
        'Стрілки, методи-скорочення, генератори не можна викликати з new'
      ],
      followUps: ['Реалізуйте myNew', 'Як захистити функцію-конструктор від виклику без new?']
    },
    {
      id: 'proto-my-new',
      group: 'constructors',
      type: 'code',
      level: 3,
      interview: true,
      title: 'Реалізувати new: myNew(Ctor, ...args)',
      tags: ['prototypes', 'new', 'polyfill'],
      description: `
**Завдання.** Напишіть \`myNew(Ctor, ...args)\`, що відтворює оператор \`new\` для функцій-конструкторів.

**Де трапляється:** класика співбесід — «що робить new? реалізуйте його».

**Що написати**
- \`myNew(Ctor, ...args)\` → екземпляр або об'єкт, повернений конструктором
- \`Ctor\` не функція або без власного \`prototype\` (стрілка) → \`TypeError\`

**Приклад**
\`\`\`js
function User(name) { this.name = name; }
User.prototype.hi = function () { return 'Hi, ' + this.name; };
const u = myNew(User, 'Ann');
u.hi();            // 'Hi, Ann'
u instanceof User; // true
\`\`\`

**Як це працює:** 1) \`Object.create(Ctor.prototype)\` — об'єкт з потрібним прототипом; 2) \`Ctor.apply(obj, args)\` — виклик з \`this = obj\`; 3) якщо результат — об'єкт або функція, повертаємо його, інакше \`obj\`.

**Врахуйте:** \`return null\` і примітиви з конструктора ігноруються; якщо \`Ctor.prototype\` не об'єкт — прототипом стає \`Object.prototype\`.
`,
      starter: `function myNew(Ctor, ...args) {
  // 1. Ctor не функція або !Object.hasOwn(Ctor, 'prototype') → throw new TypeError(...)
  // 2. const obj = Object.create(Ctor.prototype — або Object.prototype, якщо це не об'єкт)
  // 3. const result = Ctor.apply(obj, args)
  // 4. result — об'єкт (не null) або функція → return result; інакше → return obj
  // TODO
}

// Спробуйте в консолі:
// function P(x) { this.x = x; } myNew(P, 1);
`,
      solution: `function myNew(Ctor, ...args) {
  if (typeof Ctor !== 'function' || !Object.hasOwn(Ctor, 'prototype')) {
    throw new TypeError(String(Ctor) + ' is not a constructor');
  }

  const proto = Ctor.prototype;
  // 1. новий об'єкт з правильним прототипом
  const obj = Object.create(proto !== null && typeof proto === 'object' ? proto : Object.prototype);

  // 2. виклик конструктора з this = obj
  const result = Ctor.apply(obj, args);

  // 3. об'єкт/функція з конструктора замінює результат
  const isObject = result !== null && (typeof result === 'object' || typeof result === 'function');
  return isObject ? result : obj;
}
`,
      hints: [
        'Почніть з `Object.create(Ctor.prototype)` і `Ctor.apply(obj, args)`.',
        'Результат: `typeof result === \'object\'` (але не `null`!) або `\'function\'` → повертайте `result`.',
        'Стрілки не мають власного `prototype` — перевірте `Object.hasOwn(Ctor, \'prototype\')`.'
      ],
      tests: [
        { name: 'створює екземпляр з полями та прототипом', code: 'function User(name) { this.name = name; }\nUser.prototype.hi = function () { return "Hi, " + this.name; };\nconst u = myNew(User, "Ann");\nexpect(u.name).toBe("Ann");\nexpect(u.hi()).toBe("Hi, Ann");\nexpect(u instanceof User).toBe(true);\nexpect(Object.getPrototypeOf(u)).toBe(User.prototype);' },
        { name: 'передає всі аргументи', code: 'function P(a, b, c) { this.sum = a + b + c; }\nexpect(myNew(P, 1, 2, 3).sum).toBe(6);' },
        { name: 'повернений об\'єкт замінює результат', code: 'function F() { this.a = 1; return { b: 2 }; }\nconst r = myNew(F);\nexpect(r).toEqual({ b: 2 });\nexpect(r instanceof F).toBe(false);' },
        { name: 'повернена функція теж замінює результат', code: 'const fn = () => 1;\nfunction F() { return fn; }\nexpect(myNew(F)).toBe(fn);' },
        { name: 'примітив і null ігноруються', code: 'function A() { this.a = 1; return 42; }\nfunction B() { this.b = 1; return null; }\nexpect(myNew(A)).toEqual({ a: 1 });\nexpect(myNew(B)).toEqual({ b: 1 });\nexpect(myNew(B) instanceof B).toBe(true);' },
        { name: 'не-конструктор → TypeError', code: 'expect(() => myNew(() => {})).toThrow(TypeError);\nexpect(() => myNew({})).toThrow(TypeError);\nexpect(() => myNew(null)).toThrow(TypeError);' },
        { name: 'prototype не об\'єкт → Object.prototype', code: 'function F() {}\nF.prototype = 5;\nexpect(Object.getPrototypeOf(myNew(F))).toBe(Object.prototype);' }
      ],
      explanation: `
Три кроки \`[[Construct]]\`: створити об'єкт з прототипом → викликати з \`this\` → перевірити результат. O(1) + час конструктора.

**Типові помилки:** \`typeof result === 'object'\` без перевірки \`null\`; ігнорувати повернені функції.

**Обмеження:** класи так не створити (\`Ctor.apply\` для класу кидає \`TypeError\`) — для цього є \`Reflect.construct\`.
`
    },
    {
      id: 'proto-object-create',
      group: 'constructors',
      type: 'code',
      level: 2,
      title: 'Поліфіл Object.create',
      tags: ['prototypes', 'polyfill'],
      description: `
**Завдання.** Напишіть \`objectCreate(proto, propertiesObject)\` — аналог \`Object.create\` **без** самого \`Object.create\`.

**Де трапляється:** класичний поліфіл Крокфорда — часте питання про зв'язок \`new\` і \`prototype\`.

**Що написати**
- \`objectCreate(proto, propertiesObject?)\` → новий порожній об'єкт з \`[[Prototype]] = proto\`
  - \`proto === null\` → об'єкт без прототипу (тут можна \`Object.setPrototypeOf\`)
  - \`proto\` не об'єкт, не функція і не \`null\` → \`TypeError\`
  - \`propertiesObject\` — дескриптори, як у \`Object.defineProperties\`

**Приклад**
\`\`\`js
const animal = { speak() { return 'sound'; } };
const cat = objectCreate(animal);
cat.speak();                           // 'sound'
Object.getPrototypeOf(cat) === animal; // true
\`\`\`

**Як це працює:** \`new F()\` створює об'єкт з прототипом \`F.prototype\`. Тож: тимчасова порожня функція \`F\`, \`F.prototype = proto\`, \`return new F()\`.

**Врахуйте:** якщо \`F.prototype\` не об'єкт (\`null\`), \`new\` підставить \`Object.prototype\` — виправте вручну; прототип — живе посилання (зміни \`proto\` видно в нащадку).
`,
      starter: `function objectCreate(proto, propertiesObject) {
  // 1. Перевірка proto: не null, не object, не function → TypeError
  // 2. function F() {}  F.prototype = proto;  const obj = new F();
  // 3. proto === null → Object.setPrototypeOf(obj, null)
  // 4. propertiesObject !== undefined → Object.defineProperties(obj, propertiesObject)
  // TODO
}

// Спробуйте в консолі:
// const o = objectCreate({ hi() { return 'hi'; } }); o.hi();
`,
      solution: `function objectCreate(proto, propertiesObject) {
  if (proto !== null && typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError('Object prototype may only be an Object or null: ' + proto);
  }

  // Класичний трюк до ES5: порожній конструктор з потрібним prototype
  function F() {}
  F.prototype = proto;
  const obj = new F();

  // Якщо F.prototype не об'єкт (null), new дасть Object.prototype — виправляємо
  if (proto === null) Object.setPrototypeOf(obj, null);

  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject);
  }
  return obj;
}
`,
      hints: [
        'Що робить `new F()`? Створює об\'єкт з `[[Prototype]] = F.prototype`.',
        'Тимчасова `function F() {}`, `F.prototype = proto`, `new F()`.',
        'Для `null` — `Object.setPrototypeOf(obj, null)`; дескриптори — `Object.defineProperties`.'
      ],
      tests: [
        { name: 'встановлює прототип без Object.create', code: 'const orig = Object.create;\nObject.create = () => { throw new Error("Object.create заборонено"); };\ntry {\n  const proto = { hi() { return "hi"; } };\n  const o = objectCreate(proto);\n  expect(Object.getPrototypeOf(o)).toBe(proto);\n  expect(o.hi()).toBe("hi");\n} finally {\n  Object.create = orig;\n}' },
        { name: 'новий об\'єкт без власних властивостей', code: 'const o = objectCreate({ a: 1 });\nexpect(Reflect.ownKeys(o)).toEqual([]);\nexpect(o.a).toBe(1);' },
        { name: 'null → об\'єкт без прототипу', code: 'const o = objectCreate(null);\nexpect(Object.getPrototypeOf(o)).toBeNull();\nexpect(o.toString).toBeUndefined();' },
        { name: 'другий аргумент — дескриптори', code: 'const o = objectCreate({}, { id: { value: 7 }, name: { value: "x", enumerable: true } });\nexpect(o.id).toBe(7);\nexpect(Object.keys(o)).toEqual(["name"]);\nexpect(Object.getOwnPropertyDescriptor(o, "id").writable).toBe(false);' },
        { name: 'некоректний proto → TypeError', code: 'expect(() => objectCreate(5)).toThrow(TypeError);\nexpect(() => objectCreate(undefined)).toThrow(TypeError);\nexpect(() => objectCreate("str")).toThrow(TypeError);' },
        { name: 'зміни прототипу видно в нащадку', code: 'const proto = {};\nconst o = objectCreate(proto);\nproto.later = 42;\nexpect(o.later).toBe(42);' }
      ],
      explanation: `
Тимчасовий конструктор з \`F.prototype = proto\` — і \`new F()\` дає порожній об'єкт з потрібним прототипом. O(1) (+ O(k) дескрипторів).

**Нюанс:** \`o.constructor\` береться з \`proto\`, як і в справжнього \`Object.create\`.

**Що спитають далі:** як через це побудувати наслідування конструкторів (\`Child.prototype = Object.create(Parent.prototype)\`)? Чому \`Child.prototype = new Parent()\` — погана ідея?
`
    },

    // ---------------------------------------------------------------- 3. instanceof
    {
      id: 'proto-quiz-instanceof',
      group: 'instanceof',
      type: 'quiz',
      level: 2,
      title: 'instanceof з примітивами та null-прототипом',
      tags: ['prototypes', 'instanceof'],
      question: `
**Як це працює:** \`obj instanceof F\` іде ланцюжком прототипів \`obj\` і шукає там \`F.prototype\`. Для примітивів (рядків, чисел) одразу повертає \`false\`.

Що виведе код?

\`\`\`js
console.log(
  [] instanceof Object,
  'str' instanceof String,
  Object.create(null) instanceof Object,
  (() => {}) instanceof Function
);
\`\`\`
`,
      options: ['`true false false true`', '`true true false true`', '`false false false true`', '`true false true true`'],
      answer: 0,
      why: [
        'Правильно: масив має `Object.prototype` у ланцюжку; примітив — завжди `false`; в об\'єкта без прототипу `Object.prototype` немає; стрілка — функція.',
        'Для примітиву `\'str\'` автоупаковки тут немає — `instanceof` одразу дає `false`.',
        'Ланцюжок `[] → Array.prototype → Object.prototype` містить `Object.prototype`, тож `true`.',
        '`Object.create(null)` не має жодного прототипу, тому `Object.prototype` у ланцюжку не знайдеться.'
      ],
      hint: 'Чи має примітив ланцюжок прототипів у сенсі `instanceof`?',
      explanation: `
Для примітивів — \`typeof\`, для масивів — \`Array.isArray\` (працює і між iframe, де \`instanceof Array\` дає \`false\`, бо в кожного вікна свій \`Array.prototype\`).
`
    },
    {
      id: 'proto-my-instanceof',
      group: 'instanceof',
      type: 'code',
      level: 2,
      interview: true,
      title: 'Реалізувати instanceof',
      tags: ['prototypes', 'instanceof', 'polyfill'],
      description: `
**Завдання.** Напишіть \`myInstanceOf(value, Ctor)\` — базовий алгоритм \`instanceof\` **без** самого \`instanceof\` та \`isPrototypeOf\`.

**Де трапляється:** класика співбесід поряд з \`myNew\` і поліфілом \`Object.create\`.

**Що написати**
- \`myInstanceOf(value, Ctor)\` → \`true\`/\`false\`
  - \`Ctor\` не функція → \`TypeError\`
  - примітиви (\`5\`, \`'s'\`, \`null\`, \`undefined\`) → \`false\`

**Приклад**
\`\`\`js
function Widget() {}
function Button() {}
Button.prototype = Object.create(Widget.prototype);
myInstanceOf(new Button(), Widget); // true
myInstanceOf([], Object);           // true
myInstanceOf('str', String);        // false
\`\`\`

**Як це працює:** беремо \`Object.getPrototypeOf(value)\` і піднімаємось до \`null\`; якщо на якомусь кроці прототип \`=== Ctor.prototype\` — \`true\`.

**Врахуйте:** перевіряється **поточний** \`Ctor.prototype\` — якщо його замінили після створення об'єкта, старий екземпляр уже не «instanceof».
`,
      starter: `function myInstanceOf(value, Ctor) {
  // 1. typeof Ctor !== 'function' → throw new TypeError(...)
  // 2. Примітив (не об'єкт і не функція, або null) → false
  // 3. let proto = Object.getPrototypeOf(value);
  //    while (proto !== null): proto === Ctor.prototype → true; інакше крок вгору
  // TODO
}

// Спробуйте в консолі:
// myInstanceOf([], Array); // true
`,
      solution: `function myInstanceOf(value, Ctor) {
  if (typeof Ctor !== 'function') {
    throw new TypeError('Ctor is not callable');
  }
  const isObject = value !== null && (typeof value === 'object' || typeof value === 'function');
  if (!isObject) return false; // примітиви — завжди false

  const target = Ctor.prototype;
  let proto = Object.getPrototypeOf(value);
  while (proto !== null) {
    if (proto === target) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
`,
      hints: [
        'Беріть прототип через `Object.getPrototypeOf` і йдіть вгору до `null`.',
        'На кожному кроці порівнюйте з `Ctor.prototype` через `===`.',
        'Ранній `return false` для примітивів і `TypeError` для не-функції праворуч.'
      ],
      tests: [
        { name: 'ланцюжок конструкторів', code: 'function A() {}\nfunction B() {}\nB.prototype = Object.create(A.prototype);\nfunction C() {}\nconst b = new B();\nexpect(myInstanceOf(b, B)).toBe(true);\nexpect(myInstanceOf(b, A)).toBe(true);\nexpect(myInstanceOf(b, Object)).toBe(true);\nexpect(myInstanceOf(b, C)).toBe(false);' },
        { name: 'вбудовані типи', code: 'expect(myInstanceOf([], Array)).toBe(true);\nexpect(myInstanceOf([], Object)).toBe(true);\nexpect(myInstanceOf(() => {}, Function)).toBe(true);\nexpect(myInstanceOf(new Date(), Array)).toBe(false);' },
        { name: 'примітиви → false', code: 'expect(myInstanceOf("str", String)).toBe(false);\nexpect(myInstanceOf(5, Number)).toBe(false);\nexpect(myInstanceOf(null, Object)).toBe(false);\nexpect(myInstanceOf(undefined, Object)).toBe(false);' },
        { name: 'Object.create(null) не є Object', code: 'expect(myInstanceOf(Object.create(null), Object)).toBe(false);' },
        { name: 'праворуч не функція → TypeError', code: 'expect(() => myInstanceOf({}, {})).toThrow(TypeError);\nexpect(() => myInstanceOf({}, null)).toThrow(TypeError);' },
        { name: 'зміна prototype після створення', code: 'function F() {}\nconst f = new F();\nF.prototype = {};\nexpect(myInstanceOf(f, F)).toBe(false);\nexpect(myInstanceOf(new F(), F)).toBe(true);' },
        { name: 'не використовує instanceof', code: 'expect(/[\\w)\\]]\\s+instanceof\\s+\\w|isPrototypeOf\\s*\\(/.test(String(myInstanceOf))).toBe(false);' }
      ],
      explanation: `
Алгоритм OrdinaryHasInstance — O(глибина ланцюжка). Повний \`instanceof\` спершу дивиться на \`Ctor[Symbol.hasInstance]\` (наступне питання).

**Чому \`instanceof\` ненадійний:** різні realm-и (iframe), заміна \`F.prototype\`, \`Object.create(F.prototype)\` без конструктора. Альтернативи: \`Array.isArray\`, brand checks (\`#field in obj\`).
`
    },
    {
      id: 'proto-quiz-has-instance',
      group: 'instanceof',
      type: 'quiz',
      level: 4,
      title: 'Symbol.hasInstance',
      tags: ['instanceof', 'symbols'],
      question: `
**Як це працює:** \`x instanceof C\` спочатку шукає метод \`C[Symbol.hasInstance]\`. Якщо він є — результат \`instanceof\` повністю визначає він, ланцюжок прототипів не перевіряється.

Що виведе код?

\`\`\`js
const Even = {
  [Symbol.hasInstance](n) {
    return n % 2 === 0;
  },
};
console.log(2 instanceof Even, 3 instanceof Even, ({}) instanceof Even);
\`\`\`
`,
      options: ['`true false true`', '`false false false`', '`true false false`', '`TypeError`'],
      answer: 2,
      why: [
        '`{} % 2` дає `NaN`, а `NaN === 0` — `false`; ланцюжок прототипів тут не дивляться.',
        'Для примітиву `2` викликається наш метод, і `2 % 2 === 0` дає `true`.',
        'Правильно: усе вирішує `Symbol.hasInstance`: 2 — парне, 3 — ні, `{}` → `NaN`.',
        'Праворуч може бути будь-який об\'єкт із `Symbol.hasInstance` — функцією він бути не мусить.'
      ],
      hint: 'Якщо є `Symbol.hasInstance`, `instanceof` делегує перевірку йому.',
      explanation: `
\`instanceof\` — це протокол, а не магія. Але такий трюк заплутує колег; для duck typing краще явні функції-предикати (\`isEven(n)\`).
`
    },

    // ---------------------------------------------------------------- 4. Наслідування без class
    {
      id: 'proto-quiz-replace-prototype',
      group: 'es5-inheritance',
      type: 'quiz',
      level: 3,
      title: 'Заміна F.prototype після створення екземпляра',
      tags: ['prototypes', 'instanceof'],
      question: `
**Як це працює:** \`[[Prototype]]\` екземпляра фіксується в момент \`new\`. Присвоєння \`F.prototype = {...}\` змінює лише заготовку для **майбутніх** екземплярів. Так налаштовують наслідування: \`Child.prototype = Object.create(Parent.prototype)\`.

Що виведе код?

\`\`\`js
function A() {}
const a1 = new A();

A.prototype = { greet: () => 'hi' };
const a2 = new A();

console.log(typeof a1.greet, a2.greet(), a1 instanceof A, a1.constructor === A);
\`\`\`
`,
      options: [
        '`"function" hi true true`',
        '`"undefined" hi false true`',
        '`"undefined" hi true false`',
        '`"undefined" hi false false`'
      ],
      answer: 1,
      why: [
        '`a1` досі посилається на старий прототип, де `greet` немає.',
        'Правильно: `a1` має старий прототип (без `greet`, але з `constructor: A`), а `instanceof` шукає новий `A.prototype` і не знаходить.',
        '`instanceof` перевіряє **поточний** `A.prototype` — у ланцюжку `a1` його немає.',
        '`a1.constructor` береться зі старого прототипу, де він досі `A`.'
      ],
      hint: '`instanceof` перевіряє **поточне** значення `A.prototype`.',
      explanation: `
Бонус: \`a2.constructor === Object\` — у нового літерала немає власного \`constructor\`. Тому при заміні \`prototype\` (зокрема в ES5-наслідуванні) \`constructor\` відновлюють вручну.
`
    },
    {
      id: 'proto-animal-dog',
      group: 'es5-inheritance',
      type: 'code',
      level: 2,
      title: 'Наслідування на функціях-конструкторах: Widget → Button',
      tags: ['prototypes', 'inheritance', 'es5'],
      description: `
**Завдання.** Без \`class\` зробіть так, щоб \`Button\` наслідував \`Widget\` (вже написаний): успадковував поля й методи, перевизначав \`render\` і доповнював батьківський \`describe\`.

**Де трапляється:** класичне питання «як зробити наслідування в ES5?»; легасі-код і бібліотеки до 2015 року (Backbone-віджети).

**Що написати**
- \`function Button(id, label)\` — \`id\` через конструктор \`Widget\`, плюс \`label\`
- \`Button.prototype.render()\` → \`'<button id="ok">OK</button>'\`
- \`Button.prototype.describe()\` → батьківський \`describe\` + \`' (OK)'\` → \`'Widget #ok (OK)'\`
- \`Button.prototype.constructor === Button\`, і він **неперелічуваний**

**Приклад**
\`\`\`js
const btn = new Button('ok', 'OK');
btn.render();          // '<button id="ok">OK</button>'
btn.describe();        // 'Widget #ok (OK)'
btn instanceof Widget; // true
\`\`\`

**Як це працює:**
1. \`Widget.call(this, id)\` — виконати батьківський конструктор над новим об'єктом (аналог \`super(id)\`);
2. \`Button.prototype = Object.create(Widget.prototype)\` — ланцюжок \`btn → Button.prototype → Widget.prototype\`;
3. новий \`Button.prototype\` не має \`constructor\` — відновіть через \`Object.defineProperty\` (\`enumerable: false\`);
4. батьківський метод: \`Widget.prototype.describe.call(this)\`.

**Врахуйте:** методи — на прототипі, не в екземплярі; \`Widget\` не має змінитися.
`,
      starter: `function Widget(id) {
  this.id = id;
}
Widget.prototype.render = function () {
  return '<div id="' + this.id + '"></div>';
};
Widget.prototype.describe = function () {
  return 'Widget #' + this.id;
};

function Button(id, label) {
  // 1. TODO: викликати Widget з поточним this і id
  // 2. TODO: this.label = label
}

// 3. TODO: Button.prototype = Object.create(Widget.prototype)
// 4. TODO: відновити неперелічуваний constructor (Object.defineProperty)
// 5. TODO: Button.prototype.render — '<button id="...">label</button>'
// 6. TODO: Button.prototype.describe — батьківський describe + ' (label)'

// Спробуйте в консолі:
// new Button('ok', 'OK').describe(); // 'Widget #ok (OK)'
`,
      solution: `function Widget(id) {
  this.id = id;
}
Widget.prototype.render = function () {
  return '<div id="' + this.id + '"></div>';
};
Widget.prototype.describe = function () {
  return 'Widget #' + this.id;
};

function Button(id, label) {
  Widget.call(this, id); // аналог super(id)
  this.label = label;
}

// Button.prototype → Widget.prototype (без виклику конструктора Widget)
Button.prototype = Object.create(Widget.prototype);
Object.defineProperty(Button.prototype, 'constructor', {
  value: Button,
  writable: true,
  configurable: true,
  enumerable: false,
});

Button.prototype.render = function () {
  return '<button id="' + this.id + '">' + this.label + '</button>';
};

Button.prototype.describe = function () {
  // аналог super.describe()
  return Widget.prototype.describe.call(this) + ' (' + this.label + ')';
};
`,
      hints: [
        'Поля батька: `Widget.call(this, id)` у конструкторі `Button`.',
        'Зв\'язок прототипів: `Button.prototype = Object.create(Widget.prototype)`, потім `Object.defineProperty(Button.prototype, \'constructor\', { value: Button, enumerable: false, ... })`.',
        'Батьківський метод: `Widget.prototype.describe.call(this)`.'
      ],
      tests: [
        { name: 'поля id і label', code: 'const b = new Button("ok", "OK");\nexpect(b.id).toBe("ok");\nexpect(b.label).toBe("OK");' },
        { name: 'instanceof Button і Widget', code: 'const b = new Button("ok", "OK");\nexpect(b instanceof Button).toBe(true);\nexpect(b instanceof Widget).toBe(true);\nexpect(Object.getPrototypeOf(Button.prototype)).toBe(Widget.prototype);' },
        { name: 'render перевизначено, Widget не зачеплено', code: 'expect(new Button("ok", "OK").render()).toBe(\'<button id="ok">OK</button>\');\nexpect(new Widget("w").render()).toBe(\'<div id="w"></div>\');' },
        { name: 'describe викликає батьківський метод', code: 'expect(new Button("ok", "OK").describe()).toBe("Widget #ok (OK)");\nconst orig = Widget.prototype.describe;\nWidget.prototype.describe = function () { return "patched " + this.id; };\ntry {\n  expect(new Button("ok", "OK").describe()).toBe("patched ok (OK)");\n} finally {\n  Widget.prototype.describe = orig;\n}' },
        { name: 'constructor відновлено й неперелічуваний', code: 'expect(Button.prototype.constructor).toBe(Button);\nexpect(new Button("a", "b").constructor).toBe(Button);\nexpect(Object.keys(Button.prototype)).not.toContain("constructor");' },
        { name: 'методи на прототипі, без class', code: 'const b = new Button("ok", "OK");\nexpect(Object.keys(b)).toEqual(["id", "label"]);\nexpect(Object.hasOwn(Button.prototype, "render")).toBe(true);\nexpect(/^class\\b/.test(String(Button))).toBe(false);' }
      ],
      explanation: `
Три кроки ES5-наслідування: поля (\`Parent.call(this)\`), методи (\`Object.create(Parent.prototype)\`), відновлення \`constructor\`.

**Чому не \`Button.prototype = new Widget()\`:** викликає батьківський конструктор (побічні ефекти, \`id: undefined\` на прототипі). **Чому не \`= Widget.prototype\`:** це той самий об'єкт — методи Button «протечуть» у Widget.

**Що спитають далі:** як це виглядає з \`class extends\` (наступні кроки)? Як успадкувати статичні методи в ES5?
`
    },

    // ---------------------------------------------------------------- 5. Класи
    {
      id: 'proto-quiz-class-basics',
      group: 'classes',
      type: 'quiz',
      level: 1,
      title: 'Що таке клас «усередині»',
      tags: ['classes'],
      question: `
**Як це працює:** \`class\` — зручний синтаксис над функцією-конструктором і прототипом: \`constructor\` стає тілом функції, а методи потрапляють у \`User.prototype\`.
\`\`\`js
class User {
  constructor(name) { this.name = name; } // ≈ function User(name) { ... }
  sayHi() { return 'Hi'; }                // ≈ User.prototype.sayHi = ...
}
\`\`\`

Що виведе код?

\`\`\`js
class User {
  constructor(name) { this.name = name; }
  sayHi() { return 'Hi, ' + this.name; }
}
const a = new User('A');
const b = new User('B');
console.log(typeof User, a.sayHi === b.sayHi, Object.keys(a));
\`\`\`
`,
      options: [
        '`"class" false ["name", "sayHi"]`',
        '`"object" true ["name"]`',
        '`"function" false ["name", "sayHi"]`',
        '`"function" true ["name"]`'
      ],
      answer: 3,
      why: [
        'Типу `\'class\'` немає — клас це функція; а метод лежить у прототипі, а не в екземплярі.',
        'Клас — це функція-конструктор, тому `typeof` дає `\'function\'`.',
        'Метод один на `User.prototype`, тож `a.sayHi === b.sayHi`, і в `Object.keys(a)` його немає.',
        'Правильно: клас — функція, метод спільний на прототипі, в екземплярі лише власне `name`.'
      ],
      hint: 'Де зберігаються методи класу?',
      explanation: `
Методи класу ще й **неперелічувані**. Інакше було б зі стрілковим полем (\`sayHi = () => ...\`) — тоді кожен екземпляр мав би власну функцію (крок «Поля-стрілки»).
`
    },
    {
      id: 'proto-quiz-class-hoisting',
      group: 'classes',
      type: 'quiz',
      level: 2,
      title: 'Клас до оголошення і без new',
      tags: ['classes', 'tdz'],
      question: `
Що виведе код?

\`\`\`js
try { new Foo(); } catch (e) { console.log(e.name); }

class Foo {}

try { Foo(); } catch (e) { console.log(e.name); }
\`\`\`
`,
      options: [
        '`ReferenceError`, потім `TypeError`',
        'Нічого не виведе — обидва виклики успішні',
        '`TypeError`, потім `TypeError`',
        'Перший виклик успішний, потім `TypeError`'
      ],
      answer: 0,
      why: [
        'Правильно: клас до оголошення в TDZ (як `let`), а виклик класу без `new` заборонений.',
        'Так поводилася б функція-конструктор; клас має обидва обмеження.',
        'До оголошення клас недоступний через TDZ — це `ReferenceError`, а не `TypeError`.',
        'Оголошення класу не піднімається як function declaration — до свого рядка воно в TDZ.'
      ],
      hint: 'Чи піднімаються класи так само, як function declaration?',
      explanation: `
1. \`ReferenceError: Cannot access 'Foo' before initialization\` — TDZ.
2. \`TypeError: Class constructor Foo cannot be invoked without 'new'\`.
`
    },
    {
      id: 'proto-quiz-class-fields-keys',
      group: 'classes',
      type: 'quiz',
      level: 2,
      title: 'Поля класу, методи та порядок ключів',
      tags: ['classes', 'fields'],
      question: `
**Як це працює:** **поле** класу (\`role = 'user'\`) — власна властивість кожного екземпляра, присвоюється на початку конструктора. **Метод** живе на прототипі. **\`static\`** — властивість самого класу.

Що виведе код?

\`\`\`js
class User {
  role = 'user';
  constructor(name) {
    this.name = name;
  }
  greet() { return 'hi'; }
  static create(name) { return new User(name); }
}
const u = User.create('Ann');
console.log(Object.keys(u), JSON.stringify(u));
\`\`\`
`,
      options: [
        '`["name", "role"] {"name":"Ann","role":"user"}`',
        '`["role", "name"] {"role":"user","name":"Ann"}`',
        '`["role", "name", "greet"] {"role":"user","name":"Ann"}`',
        '`["role", "name", "greet", "create"] {"role":"user","name":"Ann"}`'
      ],
      answer: 1,
      why: [
        'Поля ініціалізуються **до** тіла конструктора, тому `role` іде першим.',
        'Правильно: спершу поле `role`, потім `name` з конструктора; методи і статика не є власними властивостями.',
        '`greet` — неперелічуваний метод на прототипі, у `Object.keys` його немає.',
        '`create` — властивість класу `User`, а не екземпляра.'
      ],
      hint: 'Коли ініціалізуються поля класу — до чи після тіла конструктора?',
      explanation: `
\`JSON.stringify\` серіалізує власні перелічувані властивості в тому ж порядку. У похідному класі поля ініціалізуються одразу після \`super()\`.
`
    },
    {
      id: 'proto-theory-class-sugar',
      group: 'classes',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Чи є class лише синтаксичним цукром?',
      tags: ['classes', 'prototypes'],
      question: 'Кажуть, що класи в JavaScript — це синтаксичний цукор над прототипами. Чи так це? Чим class відрізняється від функції-конструктора? Оберіть **усі** правильні твердження.',
      choices: [
        'Клас можна викликати без `new` — тоді `this` стане глобальним об\'єктом',
        'Під капотом клас — це функція-конструктор, а його методи лежать у `prototype`',
        'Методи класу перелічувані, як і методи, додані через `B.prototype.m = ...`',
        '`class MyArray extends Array` дає справжній масив, бо `this` створює базовий конструктор',
        'Оголошення класу піднімається як function declaration і доступне до свого рядка'
      ],
      correct: [1, 3],
      why: [
        'Хибно: виклик класу без `new` кидає `TypeError`.',
        'Правильно: це та сама прототипна модель.',
        'Хибно: методи класу неперелічувані, а присвоєні вручну — перелічувані.',
        'Правильно: у похідному класі об\'єкт створює `Array`, тож `length` «магічний»; ES5-способом так не вийде.',
        'Хибно: клас до оголошення в TDZ — `ReferenceError`.'
      ],
      hint: 'Виклик без new, hoisting, strict mode, перелічуваність методів, наслідування вбудованих класів.',
      answer: `
**Здебільшого так** (функція + \`prototype\` + ланцюжок), але є семантика, якої немає у функцій:
1. Виклик лише з \`new\`.
2. TDZ замість повного hoisting.
3. Тіло завжди в strict mode.
4. Методи неперелічувані і не є конструкторами.
5. \`super\` через внутрішній \`[[HomeObject]]\`.
6. У похідному класі \`this\` створює базовий конструктор → коректне наслідування \`Array\`, \`Error\`, \`HTMLElement\`.
7. Статичне наслідування: \`Object.getPrototypeOf(Child) === Parent\`.
8. Справжні приватні \`#поля\`.

\`\`\`js
class A { m() {} }
Object.keys(A.prototype); // []
function B() {}
B.prototype.m = function () {};
Object.keys(B.prototype); // ['m']
\`\`\`
`,
      keyPoints: [
        'Під капотом — функція-конструктор + prototype',
        'Обов\'язковий new, TDZ, strict mode',
        'Методи неперелічувані; super через [[HomeObject]]',
        'this у похідному класі створює базовий конструктор → наслідування Array/Error',
        'Приватні #поля — нова семантика, не цукор'
      ],
      followUps: ['Як розшифрувати клас з extends у ES5-код?', 'Чому в ES5 не можна коректно успадкувати Array?']
    },

    // ---------------------------------------------------------------- 6. extends і super
    {
      id: 'proto-quiz-this-before-super',
      group: 'extends',
      type: 'quiz',
      level: 2,
      title: 'this до super()',
      tags: ['classes', 'super'],
      question: `
**Як це працює:** \`class B extends A\` робить \`A.prototype\` прототипом \`B.prototype\`. У конструкторі \`B\` виклик \`super(...)\` запускає конструктор \`A\` — саме він **створює** об'єкт \`this\`. \`super.method()\` у методі викликає батьківську версію.

Що станеться?

\`\`\`js
class A {
  constructor() { this.a = 1; }
}
class B extends A {
  constructor() {
    this.b = 2;
    super();
  }
}
const obj = new B();
console.log(obj);
\`\`\`
`,
      options: [
        'Виведе `{ a: 1, b: 2 }`',
        'Виведе `{ b: 2, a: 1 }`',
        '`SyntaxError` на етапі розбору',
        '`ReferenceError` під час `new B()`'
      ],
      answer: 3,
      why: [
        'До `super()` об\'єкта `this` ще не існує, тому до `a: 1` справа не дійде.',
        'Запис `this.b` до `super()` неможливий — `this` ще не створено базовим конструктором.',
        'Код синтаксично коректний; помилка виникає лише під час виконання.',
        'Правильно: звернення до `this` до `super()` у похідному класі кидає `ReferenceError`.'
      ],
      hint: 'Хто створює об\'єкт `this` у похідному класі?',
      explanation: `
\`ReferenceError: Must call super constructor in derived class before accessing 'this'\`. Правильно: спочатку \`super()\`, потім \`this.b = 2\`. \`SyntaxError\` буде, якщо написати \`super()\` у класі без \`extends\`.
`
    },
    {
      id: 'proto-theory-extends-super',
      group: 'extends',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Як працюють extends і super',
      tags: ['classes', 'inheritance', 'super'],
      question: 'Що саме робить extends? Як працює super у конструкторі та в методах? Чому не можна звертатися до this до виклику super()?',
      choices: [
        '`extends` налаштовує лише `Child.prototype → Parent.prototype`, статика не успадковується',
        'У похідному класі `this` з\'являється лише після `super()`, бо об\'єкт створює базовий клас',
        '`super.method()` шукає метод у прототипі `this`, тож залежить від того, на чому викликали',
        'Поля нащадка ініціалізуються до `super()`, тому базовий конструктор уже їх бачить'
      ],
      correct: 1,
      why: [
        'Хибно: є і другий ланцюжок `Child → Parent`, тож статичні методи теж успадковуються.',
        'Правильно: базовий конструктор створює об\'єкт, тому до `super()` `this` недоступний.',
        'Хибно: `super` шукає через `[[HomeObject]]` — об\'єкт, де метод визначено, а не через `this`.',
        'Хибно: поля нащадка присвоюються одразу **після** повернення з `super()`.'
      ],
      answer: `
- \`extends\` будує **два** ланцюжки: \`Child.prototype → Parent.prototype\` (методи) і \`Child → Parent\` (статика).
- \`super(...)\` у конструкторі викликає батьківський конструктор; до нього \`this\` → \`ReferenceError\`.
- Без власного конструктора: неявний \`constructor(...args) { super(...args); }\`.
- Поля нащадка ініціалізуються одразу після \`super()\`.
- \`super.method()\` шукає через \`[[HomeObject]]\` — коректно на будь-якій глибині.
\`\`\`js
class Animal {
  static create(name) { return new this(name); } // this = клас, на якому викликали
}
class Dog extends Animal {}
Dog.create('Rex') instanceof Dog; // true
\`\`\`
`,
      keyPoints: [
        'Два ланцюжки: Child.prototype → Parent.prototype і Child → Parent (статика)',
        'super() викликає батьківський конструктор; this з\'являється лише після нього',
        'super.method() шукає через [[HomeObject]], а не через this',
        'Поля нащадка ініціалізуються після super()'
      ],
      followUps: ['Що буде, якщо базовий конструктор викличе метод, перевизначений у нащадку?', 'Як працює super у статичних методах?']
    },
    {
      id: 'proto-quiz-field-init-order',
      group: 'extends',
      type: 'quiz',
      level: 3,
      title: 'Базовий конструктор викликає перевизначений метод',
      tags: ['classes', 'fields', 'super'],
      question: `
Що виведе код?

\`\`\`js
class Base {
  constructor() { this.init(); }
  init() { console.log('base'); }
}
class Child extends Base {
  value = 42;
  init() { console.log(this.value); }
}
new Child();
\`\`\`
`,
      options: ['`base`', '`42`', '`undefined`', '`ReferenceError`'],
      answer: 2,
      why: [
        '`this.init()` шукає метод з `Child.prototype`, тому викликається `Child#init`, а не `Base#init`.',
        'Поле `value = 42` присвоюється лише після повернення з `super()`, а `init` викликано раніше.',
        'Правильно: викликано перевизначений `init`, але поле нащадка ще не ініціалізоване.',
        '`this` уже створений базовим конструктором, тож звертатися до нього можна.'
      ],
      hint: 'Поля нащадка ініціалізуються після `super()`. А який `init` знайде `this.init()`?',
      explanation: `
Порядок: неявний \`super()\` → конструктор \`Base\` → \`this.init()\` (поліморфно \`Child#init\`) → \`value\` ще немає → повернення з \`super()\` → \`value = 42\`. Мораль: не викликайте перевизначувані методи з базового конструктора.
`
    },
    {
      id: 'proto-quiz-static-inherit',
      group: 'extends',
      type: 'quiz',
      level: 3,
      title: 'Статичні поля та наслідування',
      tags: ['classes', 'static'],
      question: `
Що виведе код?

\`\`\`js
class A {
  static count = 0;
  static inc() { this.count++; }
}
class B extends A {}

B.inc();
B.inc();
A.inc();
console.log(A.count, B.count, Object.hasOwn(B, 'count'));
\`\`\`
`,
      options: ['`1 2 true`', '`3 3 false`', '`1 0 false`', '`0 2 true`'],
      answer: 0,
      why: [
        'Правильно: перший `B.inc()` читає 0 з `A` і створює власне `B.count`; далі `B` і `A` рахують окремо.',
        '`this.count++` при `this === B` записує в `B`, а не в спільне `A.count`.',
        'Запис `B.count = ...` створює власну властивість `B`, тому `B.count` не 0.',
        '`A.inc()` змінює `A.count` до 1 — він не лишається 0.'
      ],
      hint: '`Object.getPrototypeOf(B) === A`. Що робить запис `this.count++`, якщо `count` лише в `A`?',
      explanation: `
Статика успадковується через прототип, тож діє те саме затінення, що й для звичайних об'єктів. Для спільного лічильника пишіть явно \`A.count++\`.
`
    },
    {
      id: 'proto-form-fields',
      group: 'extends',
      type: 'code',
      level: 2,
      title: 'Ієрархія полів форми: Field / TextField / EmailField / NumberField',
      tags: ['classes', 'inheritance', 'polymorphism'],
      description: `
**Завдання.** Побудуйте ієрархію класів для валідації форми: абстрактний \`Field\` і три конкретні поля.

**Де трапляється:** бібліотеки форм, конструктори анкет; на співбесіді — «покажіть наслідування, \`super\`, поліморфізм, абстрактний клас».

**Що написати**
- \`Field(name)\` — абстрактний:
  - \`new Field()\` → \`TypeError\`; нащадків створювати можна
  - поля \`name\` і \`type\` (ім'я конкретного класу: \`'TextField'\`…)
  - \`validate(value)\` → кидає \`Error\`, якщо нащадок не перевизначив
  - \`check(value)\` → \`'<name>: <помилка>'\` або \`null\`, якщо \`validate\` повернув \`''\`
  - \`static validateAll(fields, values)\` → масив повідомлень \`check\` (без \`null\`)
- \`TextField(name, { required = false, maxLength = Infinity } = {})\`: \`validate\` → \`'required'\` (порожньо або пробіли при required), \`'too long'\`, або \`''\`
- \`EmailField extends TextField\`: спершу \`super.validate\`, потім формат → \`'invalid email'\` (порожнє непотрібне поле — ок)
- \`NumberField(name, { min = -Infinity, max = Infinity } = {})\`: \`'not a number'\` (не число або \`NaN\`), \`'too small'\`, \`'too large'\`, \`''\`

**Приклад**
\`\`\`js
const email = new EmailField('email', { required: true });
email.check('');        // 'email: required'
email.check('a@b');     // 'email: invalid email'
email.check('a@b.ua');  // null
Field.validateAll([email, new NumberField('age', { min: 18 })], { email: 'a@b.ua', age: 16 });
// ['age: too small']
\`\`\`

**Як це працює:** \`check\` визначено один раз у \`Field\`, але \`this.validate\` знаходить метод конкретного класу через ланцюжок прототипів (поліморфізм). \`new.target\` у базовому конструкторі — клас, який реально створюють: так роблять «абстрактність» і \`type\`. \`super.validate(value)\` у \`EmailField\` перевикористовує логіку \`TextField\`.

**Врахуйте:** \`value\` для текстових полів може бути \`undefined\` (рахуйте як \`''\`); методи — на прототипах; статика успадковується (\`TextField.validateAll === Field.validateAll\`).
`,
      starter: `class Field {
  constructor(name) {
    // 1. new.target === Field → throw new TypeError(...)
    // 2. this.name = name; this.type = new.target.name;
  }

  validate(value) {
    // 3. TODO: throw new Error('validate() не реалізовано в ' + this.type)
  }

  check(value) {
    // 4. TODO: const error = this.validate(value); error ? name + ': ' + error : null
  }

  static validateAll(fields, values) {
    // 5. TODO: fields.map(f => f.check(values[f.name])).filter(Boolean)
  }
}

class TextField extends Field {
  // 6. TODO: constructor(name, { required = false, maxLength = Infinity } = {}) — super(name) першим!
  //    validate(value = '') → 'required' | 'too long' | ''
}

class EmailField extends TextField {
  // 7. TODO: validate — спершу super.validate(value), потім перевірка формату
}

class NumberField extends Field {
  // 8. TODO: constructor з { min, max }; validate → 'not a number' | 'too small' | 'too large' | ''
}

// Спробуйте в консолі:
// new EmailField('email', { required: true }).check('a@b'); // 'email: invalid email'
`,
      solution: `class Field {
  constructor(name) {
    // new.target — клас, який викликали через new (навіть якщо це нащадок)
    if (new.target === Field) throw new TypeError('Field — абстрактний клас');
    this.name = name;
    this.type = new.target.name;
  }

  validate(value) {
    throw new Error('validate() не реалізовано в ' + this.type);
  }

  check(value) {
    const error = this.validate(value); // поліморфний виклик
    return error ? this.name + ': ' + error : null;
  }

  static validateAll(fields, values) {
    return fields.map((field) => field.check(values[field.name])).filter(Boolean);
  }
}

class TextField extends Field {
  constructor(name, { required = false, maxLength = Infinity } = {}) {
    super(name);
    this.required = required;
    this.maxLength = maxLength;
  }

  validate(value = '') {
    if (this.required && value.trim() === '') return 'required';
    if (value.length > this.maxLength) return 'too long';
    return '';
  }
}

class EmailField extends TextField {
  validate(value = '') {
    const base = super.validate(value); // логіка TextField
    if (base) return base;
    if (value !== '' && !/^\\S+@\\S+\\.\\S+$/.test(value)) return 'invalid email';
    return '';
  }
}

class NumberField extends Field {
  constructor(name, { min = -Infinity, max = Infinity } = {}) {
    super(name);
    this.min = min;
    this.max = max;
  }

  validate(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) return 'not a number';
    if (value < this.min) return 'too small';
    if (value > this.max) return 'too large';
    return '';
  }
}
`,
      hints: [
        'У конструкторі `Field` порівняйте `new.target` з `Field`; `new.target.name` дасть ім\'я класу.',
        'У нащадках спершу `super(name)`, лише потім `this.x = ...`. `EmailField` не потребує власного конструктора.',
        '`check` викликає `this.validate(value)` — спрацює метод конкретного класу; у `EmailField` почніть з `super.validate(value)`.'
      ],
      tests: [
        { name: 'TextField: required і maxLength', code: 'const f = new TextField("title", { required: true, maxLength: 5 });\nexpect(f.validate("")).toBe("required");\nexpect(f.validate("   ")).toBe("required");\nexpect(f.validate()).toBe("required");\nexpect(f.validate("toolong")).toBe("too long");\nexpect(f.validate("ok")).toBe("");\nexpect(new TextField("note").validate("")).toBe("");' },
        { name: 'EmailField перевикористовує TextField через super', code: 'const e = new EmailField("email", { required: true });\nexpect(e.validate("")).toBe("required");\nexpect(e.validate("a@b")).toBe("invalid email");\nexpect(e.validate("a@b.ua")).toBe("");\nexpect(new EmailField("e2").validate("")).toBe("");\nexpect(new EmailField("e3", { maxLength: 3 }).validate("a@b.ua")).toBe("too long");' },
        { name: 'NumberField', code: 'const n = new NumberField("age", { min: 18, max: 99 });\nexpect(n.validate("20")).toBe("not a number");\nexpect(n.validate(NaN)).toBe("not a number");\nexpect(n.validate(10)).toBe("too small");\nexpect(n.validate(100)).toBe("too large");\nexpect(n.validate(30)).toBe("");' },
        { name: 'check — поліморфізм', code: 'expect(new EmailField("email").check("x")).toBe("email: invalid email");\nexpect(new EmailField("email").check("a@b.ua")).toBeNull();\nexpect(new NumberField("age", { min: 18 }).check(5)).toBe("age: too small");' },
        { name: 'Field абстрактний, type — ім\'я класу', code: 'expect(() => new Field("x")).toThrow(TypeError);\nclass DateField extends Field {}\nconst d = new DateField("birthday");\nexpect(d.type).toBe("DateField");\nexpect(d.name).toBe("birthday");\nexpect(() => d.validate("2020")).toThrow();\nexpect(new EmailField("e").type).toBe("EmailField");' },
        { name: 'ієрархія instanceof', code: 'const e = new EmailField("e");\nexpect(e instanceof EmailField).toBe(true);\nexpect(e instanceof TextField).toBe(true);\nexpect(e instanceof Field).toBe(true);\nexpect(new NumberField("n") instanceof TextField).toBe(false);' },
        { name: 'static validateAll успадковується', code: 'const fields = [new EmailField("email", { required: true }), new NumberField("age", { min: 18 })];\nexpect(Field.validateAll(fields, { email: "a@b.ua", age: 16 })).toEqual(["age: too small"]);\nexpect(Field.validateAll(fields, { age: 30 })).toEqual(["email: required"]);\nexpect(Field.validateAll(fields, { email: "a@b.ua", age: 30 })).toEqual([]);\nexpect(TextField.validateAll).toBe(Field.validateAll);' },
        { name: 'методи на прототипах', code: 'expect(Object.hasOwn(TextField.prototype, "validate")).toBe(true);\nexpect(Object.hasOwn(EmailField.prototype, "check")).toBe(false);\nexpect(Object.keys(new TextField("t"))).toEqual(["name", "type", "required", "maxLength"]);' }
      ],
      explanation: `
**Поліморфізм:** \`check\` один, а \`this.validate\` знаходить метод конкретного класу: \`email → EmailField.prototype (validate) → TextField.prototype → Field.prototype (check)\`. \`super.validate\` перевикористовує батьківську логіку без копіювання.

**\`new.target\`** у базовому конструкторі дорівнює класу-нащадку — звідси «абстрактність» і \`type\` (у продакшні після мініфікації імена класів ламаються — краще явне поле).

**Що спитають далі:** чим це відрізняється від підходу з об'єктом-схемою і функціями-валідаторами (композиція)? Як це типізувати в TypeScript (\`abstract class\`)?
`
    },
    {
      id: 'proto-quiz-extend-array',
      group: 'extends',
      type: 'quiz',
      level: 3,
      title: 'Наслідування Array і Symbol.species',
      tags: ['classes', 'builtins', 'species'],
      question: `
Що виведе код?

\`\`\`js
class List extends Array {
  sum() { return this.reduce((a, b) => a + b, 0); }
}
const list = List.from([1, 2, 3]);
const doubled = list.map((x) => x * 2);

console.log(doubled instanceof List, doubled.sum(), list.length);
\`\`\`
`,
      options: [
        '`false`, потім `TypeError: doubled.sum is not a function`',
        '`false 12 3`',
        '`true 6 3`',
        '`true 12 3`'
      ],
      answer: 3,
      why: [
        '`map` на екземплярі підкласу створює результат того самого класу (через `Symbol.species`), тож `sum` є.',
        'Якби `doubled` був звичайним масивом, `sum` не існувало б; насправді це `List`.',
        '`doubled` містить подвоєні значення `[2, 4, 6]`, тож сума 12.',
        'Правильно: `map` повертає `List`, сума `2 + 4 + 6 = 12`, а `length` справжнього масиву — 3.'
      ],
      hint: 'Який конструктор використовують `map`, `filter`, `slice` для результату на екземплярі підкласу?',
      explanation: `
\`List.from\` — успадкована статика (\`this === List\`). \`map\` бере конструктор через \`this.constructor[Symbol.species]\` (за замовчуванням \`List\`). Щоб повертати звичайний масив: \`static get [Symbol.species]() { return Array; }\`.
`
    },

    // ---------------------------------------------------------------- 7. Приватні поля
    {
      id: 'proto-theory-private',
      group: 'private',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Приватні поля (#) і способи інкапсуляції',
      tags: ['classes', 'private', 'encapsulation'],
      question: `
**Як це працює:** поле чи метод з \`#\` доступні **лише в тілі класу**:
\`\`\`js
class Counter {
  #count = 0;
  inc() { return ++this.#count; }
}
new Counter().#count; // SyntaxError
\`\`\`

Як працюють приватні поля і чим вони відрізняються від інших способів приховати стан? Оберіть **усі** правильні твердження.
`,
      choices: [
        'Звернення до `#`-поля поза тілом класу дає `SyntaxError` ще на етапі розбору',
        'Нащадки мають доступ до `#`-полів батька, як до `protected` в інших мовах',
        '`obj[\'#count\']` дає доступ до приватного поля в обхід синтаксису `#`',
        '`#x in obj` — надійна перевірка, що об\'єкт створено цим класом (brand check)',
        'TypeScript `private` гарантує приватність і в рантаймі, так само як `#`'
      ],
      correct: [0, 3],
      why: [
        'Правильно: приватність перевіряється ще до виконання коду.',
        'Хибно: `#`-поля бачить лише тіло класу, де вони оголошені; `protected` у JS немає.',
        'Хибно: `obj[\'#count\']` — це звичайна, зовсім інша властивість.',
        'Правильно: `#x` є лише в об\'єктах, що пройшли через конструктор цього класу.',
        'Хибно: TS `private` зникає після компіляції — у рантаймі це звичайна властивість.'
      ],
      answer: `
- \`#поля\`/\`#методи\` — лише в тілі класу; ззовні \`SyntaxError\`.
- Не властивості об'єкта: немає в \`Object.keys\`, \`JSON.stringify\`, не копіюються spread.
- Нащадки доступу не мають.
- Brand check: \`static isCounter(o) { return #count in o; }\`.
- З Proxy: методи, що читають \`#\`-поля, падають, якщо \`this\` — проксі.

| Спосіб | Приватність |
|---|---|
| \`_name\` | ні, домовленість |
| замикання / фабрика | так, але методи на кожен екземпляр |
| \`WeakMap\` поза класом | так (так транспілюється \`#\`) |
| \`Symbol\`-ключ | ні |
| TS \`private\` | лише compile-time |
`,
      keyPoints: [
        '#поля/методи доступні лише в тілі класу; помилка на етапі розбору',
        'Не є властивостями: немає в keys/JSON, не копіюються',
        'Нащадки не мають доступу; немає protected',
        'Brand check: #x in obj',
        'Альтернативи: _конвенція, замикання, WeakMap, Symbol, TS private'
      ],
      followUps: ['Чому приватні поля ламаються з Proxy?', 'Чим TS private відрізняється від #private?']
    },
    {
      id: 'proto-bank-account',
      group: 'private',
      type: 'code',
      level: 2,
      title: 'BankAccount з приватним станом',
      tags: ['classes', 'private', 'validation'],
      description: `
**Завдання.** Напишіть клас \`BankAccount\`, стан якого (баланс, історію) неможливо зламати ззовні.

**Де трапляється:** моделі домену на фронтенді (кошик, гаманець, ліміти); класична задача на інкапсуляцію й інваріанти.

**Що написати**
- \`new BankAccount(owner, initialBalance = 0)\` — \`owner\` непорожній рядок (інакше \`TypeError\`), публічне поле; ненульовий початковий баланс — перший депозит
- \`balance\` — геттер, лише читання
- \`deposit(amount)\` / \`withdraw(amount)\` → \`this\` (ланцюжок); сума — додатне скінченне число, інакше \`TypeError\`; зняття більше за баланс → \`RangeError\`
- \`history\` — геттер, **копія** \`[{ type: 'deposit' | 'withdraw', amount }]\`
- \`static isAccount(value)\` → \`true\` лише для справжніх екземплярів

**Приклад**
\`\`\`js
const acc = new BankAccount('Ann', 100);
acc.deposit(50).withdraw(30).balance; // 120
acc.withdraw(1000);                   // RangeError
Object.keys(acc);                     // ['owner']
\`\`\`

**Як це працює:** \`#balance\` і \`#history\` доступні лише методам класу — інваріант «баланс ≥ 0 і збігається з історією» гарантує мова. Геттер без сеттера дає read-only доступ. \`#balance in value\` — brand check, який не обдурити через \`Object.create(BankAccount.prototype)\`.

**Врахуйте:** \`history\` не має віддавати внутрішній масив; \`in\` з примітивом кидає помилку — спершу перевірте, що це об'єкт.
`,
      starter: `class BankAccount {
  // 1. TODO: приватні поля #balance = 0 і #history = []

  constructor(owner, initialBalance = 0) {
    // 2. TODO: owner — непорожній рядок, інакше TypeError
    this.owner = owner;
    // 3. TODO: initialBalance !== 0 → this.deposit(initialBalance)
  }

  // 4. TODO: get balance(), get history() (копія!)

  deposit(amount) {
    // 5. TODO: перевірити суму, додати, записати в історію, return this
  }

  withdraw(amount) {
    // 6. TODO: перевірити суму; amount > balance → RangeError
  }

  // 7. TODO: приватний метод #assertAmount(amount) — TypeError для некоректних сум

  static isAccount(value) {
    // 8. TODO: об'єкт і #balance in value
  }
}

// Спробуйте в консолі:
// new BankAccount('Ann', 100).deposit(50).balance; // 150
`,
      solution: `class BankAccount {
  #balance = 0;
  #history = [];

  constructor(owner, initialBalance = 0) {
    if (typeof owner !== 'string' || owner.trim() === '') {
      throw new TypeError('owner має бути непорожнім рядком');
    }
    this.owner = owner;
    if (initialBalance !== 0) this.deposit(initialBalance);
  }

  get balance() {
    return this.#balance;
  }

  get history() {
    // копія, щоб ззовні не можна було змінити внутрішній масив
    return this.#history.map((entry) => ({ ...entry }));
  }

  deposit(amount) {
    this.#assertAmount(amount);
    this.#balance += amount;
    this.#history.push({ type: 'deposit', amount });
    return this;
  }

  withdraw(amount) {
    this.#assertAmount(amount);
    if (amount > this.#balance) throw new RangeError('Недостатньо коштів');
    this.#balance -= amount;
    this.#history.push({ type: 'withdraw', amount });
    return this;
  }

  #assertAmount(amount) {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      throw new TypeError('Сума має бути додатним скінченним числом');
    }
  }

  static isAccount(value) {
    // brand check: #balance є лише в об'єктах, створених цим класом
    return value !== null && typeof value === 'object' && #balance in value;
  }
}
`,
      hints: [
        '`#balance` і `#history` — приватні поля; `balance` — `get balance()` без сеттера.',
        'Валідацію суми винесіть у `#assertAmount(amount)`: `typeof`, `Number.isFinite`, `> 0`.',
        '`isAccount`: спершу `value !== null && typeof value === \'object\'`, потім `#balance in value`.'
      ],
      tests: [
        { name: 'депозит, зняття і ланцюжок', code: 'const acc = new BankAccount("Ann", 100);\nexpect(acc.deposit(50).withdraw(30).balance).toBe(120);\nexpect(acc.owner).toBe("Ann");' },
        { name: 'некоректна сума → TypeError', code: 'const acc = new BankAccount("Ann");\nfor (const bad of [-5, 0, "10", NaN, Infinity, null]) {\n  expect(() => acc.deposit(bad)).toThrow(TypeError);\n  expect(() => acc.withdraw(bad)).toThrow(TypeError);\n}\nexpect(acc.balance).toBe(0);' },
        { name: 'недостатньо коштів → RangeError без зміни балансу', code: 'const acc = new BankAccount("Ann", 10);\nexpect(() => acc.withdraw(11)).toThrow(RangeError);\nexpect(acc.balance).toBe(10);' },
        { name: 'balance лише для читання', code: '"use strict";\nconst acc = new BankAccount("Ann", 10);\nexpect(() => { acc.balance = 1000000; }).toThrow(TypeError);\nexpect(acc.balance).toBe(10);' },
        { name: 'некоректний owner → TypeError', code: 'expect(() => new BankAccount("")).toThrow(TypeError);\nexpect(() => new BankAccount("   ")).toThrow(TypeError);\nexpect(() => new BankAccount(42)).toThrow(TypeError);' },
        { name: 'history — копія', code: 'const acc = new BankAccount("Ann", 100);\nacc.withdraw(40);\nexpect(acc.history).toEqual([{ type: "deposit", amount: 100 }, { type: "withdraw", amount: 40 }]);\nacc.history.push({ type: "deposit", amount: 1 });\nacc.history[0].amount = 999;\nexpect(acc.history).toHaveLength(2);\nexpect(acc.history[0].amount).toBe(100);' },
        { name: 'стан прихований', code: 'const acc = new BankAccount("Ann", 100);\nexpect(Object.keys(acc)).toEqual(["owner"]);\nexpect(JSON.stringify(acc)).toBe(\'{"owner":"Ann"}\');' },
        { name: 'isAccount — brand check', code: 'expect(BankAccount.isAccount(new BankAccount("Ann"))).toBe(true);\nexpect(BankAccount.isAccount(Object.create(BankAccount.prototype))).toBe(false);\nexpect(BankAccount.isAccount({ balance: 1, owner: "x" })).toBe(false);\nexpect(BankAccount.isAccount(null)).toBe(false);\nexpect(BankAccount.isAccount(5)).toBe(false);' }
      ],
      explanation: `
\`#balance\` змінюється лише через \`deposit/withdraw\` — інваріант гарантований. \`history\` повертає копію, щоб не «витекло» посилання на приватний масив.

**Нюанс:** гроші у float — погано (\`0.1 + 0.2\`); зберігайте копійки цілими.

**Що спитають далі:** \`transfer(to, amount)\` між рахунками (доступ до \`#balance\` іншого екземпляра того ж класу дозволений!); те саме на замиканнях.
`
    },
    {
      id: 'proto-stack',
      group: 'private',
      type: 'code',
      level: 2,
      title: 'Stack для undo: композиція замість extends Array',
      tags: ['classes', 'composition', 'iterator'],
      description: `
**Завдання.** Напишіть клас \`Stack\` (LIFO), який **інкапсулює** масив у приватному полі, а не наслідує \`Array\` — щоб ніхто не зламав порядок через \`shift\`, \`splice\` чи індекси.

**Де трапляється:** історія undo/redo в редакторі, стек модалок, навігаційна історія; питання «композиція чи наслідування?».

**Що написати**
- \`new Stack(iterable?)\` — початкові елементи (останній — на вершині)
- \`push(...values)\` → новий розмір; \`pop()\` → верхній або \`undefined\`; \`peek()\` — без видалення
- \`size\` — геттер (лише читання); \`isEmpty()\`; \`clear()\`
- \`toArray()\` → **копія** від низу до вершини
- \`for...of\` / spread — **від вершини до низу**
- \`static from(iterable)\` → новий \`Stack\`

**Приклад**
\`\`\`js
const history = new Stack(['v1', 'v2']);
history.push('v3'); // 3
[...history];       // ['v3', 'v2', 'v1']
history.pop();      // 'v3' — undo
history.peek();     // 'v2'
\`\`\`

**Як це працює:** \`#items\` недоступне ззовні, тож публічний API — лише потрібні методи (stack «має» масив, а не «є» масивом). Метод-генератор \`*[Symbol.iterator]()\` робить екземпляр ітерабельним.

**Врахуйте:** \`Object.keys(stack)\` → \`[]\`; \`toArray\` не віддає внутрішній масив; \`static from\` через \`new this(...)\`.
`,
      starter: `class Stack {
  // 1. TODO: приватне поле #items = []

  constructor(iterable = []) {
    // 2. TODO: покласти елементи iterable у #items
  }

  push(...values) {}   // 3. TODO: → новий розмір
  pop() {}             // TODO
  peek() {}            // TODO
  // 4. TODO: get size()
  isEmpty() {}         // TODO
  clear() {}           // TODO
  toArray() {}         // 5. TODO: копія

  // 6. TODO: *[Symbol.iterator]() — від кінця масиву до початку

  static from(iterable) {
    // 7. TODO: new this(iterable)
  }
}

// Спробуйте в консолі:
// const s = new Stack([1, 2]); s.push(3); [...s]; // [3, 2, 1]
`,
      solution: `class Stack {
  #items = [];

  constructor(iterable = []) {
    for (const value of iterable) this.#items.push(value);
  }

  push(...values) {
    this.#items.push(...values);
    return this.#items.length;
  }

  pop() {
    return this.#items.pop();
  }

  peek() {
    return this.#items[this.#items.length - 1];
  }

  get size() {
    return this.#items.length;
  }

  isEmpty() {
    return this.#items.length === 0;
  }

  clear() {
    this.#items.length = 0;
  }

  toArray() {
    return [...this.#items]; // копія, а не внутрішній масив
  }

  *[Symbol.iterator]() {
    // від вершини до низу
    for (let i = this.#items.length - 1; i >= 0; i--) yield this.#items[i];
  }

  static from(iterable) {
    return new this(iterable); // this — клас (працює і для нащадків)
  }
}
`,
      hints: [
        'Елементи — у приватному полі `#items = []`; методи лише делегують йому.',
        '`size` — `get size()` без сеттера; `toArray()` → `[...this.#items]`.',
        'Ітерованість: `*[Symbol.iterator]() { for (let i = this.#items.length - 1; i >= 0; i--) yield this.#items[i]; }`.'
      ],
      tests: [
        { name: 'LIFO: push/pop/peek', code: 'const s = new Stack();\nexpect(s.push(1)).toBe(1);\nexpect(s.push(2, 3)).toBe(3);\nexpect(s.peek()).toBe(3);\nexpect(s.pop()).toBe(3);\nexpect(s.pop()).toBe(2);\nexpect(s.size).toBe(1);' },
        { name: 'порожній стек', code: 'const s = new Stack();\nexpect(s.pop()).toBeUndefined();\nexpect(s.peek()).toBeUndefined();\nexpect(s.isEmpty()).toBe(true);\nexpect(s.size).toBe(0);' },
        { name: 'початкові елементи і ітерація від вершини', code: 'const s = new Stack([1, 2, 3]);\nexpect(s.peek()).toBe(3);\nexpect([...s]).toEqual([3, 2, 1]);\nexpect(s.toArray()).toEqual([1, 2, 3]);' },
        { name: 'інкапсуляція: немає методів масиву і внутрішнього стану', code: 'const s = new Stack([1, 2]);\nexpect(Array.isArray(s)).toBe(false);\nexpect(s.shift).toBeUndefined();\nexpect(s.splice).toBeUndefined();\nexpect(s[0]).toBeUndefined();\nexpect(Object.keys(s)).toEqual([]);' },
        { name: 'toArray повертає копію', code: 'const s = new Stack([1, 2]);\nconst arr = s.toArray();\narr.push(99);\nexpect(s.size).toBe(2);\nexpect(s.peek()).toBe(2);' },
        { name: 'size лише для читання', code: '"use strict";\nconst s = new Stack([1]);\nexpect(() => { s.size = 10; }).toThrow(TypeError);\nexpect(s.size).toBe(1);' },
        { name: 'static from і clear', code: 'const s = Stack.from(new Set(["a", "b"]));\nexpect(s).toBeInstanceOf(Stack);\nexpect(s.peek()).toBe("b");\ns.clear();\nexpect(s.isEmpty()).toBe(true);' }
      ],
      explanation: `
\`class Stack extends Array\` успадкував би весь API масиву, і будь-хто міг би порушити LIFO. Композиція відкриває лише потрібне («has-a», а не «is-a»). \`push\`/\`pop\`/\`peek\` — амортизовано O(1).

**Коли \`extends Array\` доречний:** коли справді потрібен масив з кількома додатковими методами (див. \`Symbol.species\`).

**Що спитають далі:** \`Queue\` з O(1) \`dequeue\`; стек з \`getMin()\` за O(1).
`
    },

    // ---------------------------------------------------------------- 8. Поля-стрілки, композиція, безпека
    {
      id: 'proto-quiz-arrow-field-this',
      group: 'design',
      type: 'quiz',
      level: 2,
      title: 'Втрата this: метод vs стрілкове поле',
      tags: ['classes', 'this', 'fields'],
      question: `
**Як це працює:** метод класу лежить на прототипі, і його \`this\` залежить від виклику (тіло класу — завжди strict mode). Поле-стрілка (\`inc = () => {...}\`) створюється в конструкторі для кожного екземпляра і назавжди бере \`this\` цього екземпляра.

Що виведе код?

\`\`\`js
class Counter {
  count = 0;
  incMethod() { this.count++; return this.count; }
  incArrow = () => { this.count++; return this.count; };
}
const c = new Counter();
const { incMethod, incArrow } = c;

console.log(incArrow());
console.log(incMethod());
\`\`\`
`,
      options: [
        '`1`, потім `2`',
        '`1`, потім `TypeError`',
        '`1`, потім `NaN`',
        '`TypeError` на першому ж виклику'
      ],
      answer: 1,
      why: [
        'Відірваний метод викликається без об\'єкта — `this === undefined`, до `c.count` він не дістанеться.',
        'Правильно: стрілкове поле тримає `this === c`, а відірваний метод у strict mode отримує `undefined` і падає.',
        '`NaN` було б у sloppy mode поза класом; тіло класу завжди strict, тож `this.count` кидає `TypeError`.',
        'Стрілкове поле не залежить від способу виклику — перший виклик працює.'
      ],
      hint: 'Яким буде `this` у методі, викликаному без об\'єкта, якщо код класу завжди strict?',
      explanation: `
Виправлення для методу: \`c.incMethod.bind(c)\`, обгортка \`() => c.incMethod()\` або стрілкове поле. Ціна поля — окрема функція в кожному екземплярі.
`
    },
    {
      id: 'proto-theory-fields-vs-methods',
      group: 'design',
      type: 'theory',
      level: 3,
      title: 'Методи класу vs стрілкові поля',
      tags: ['classes', 'fields', 'this'],
      question: 'Чим відрізняється метод класу method() {} від поля-стрілкової функції method = () => {}? Коли що використовувати і які підводні камені?',
      choices: [
        'Поле-стрілка лежить у `prototype`, тому нащадок може викликати `super.method()`',
        'Метод класу зберігає `this` після деструктуризації, бо тіло класу — strict mode',
        'Метод — один на `prototype` з динамічним `this`; поле-стрілка — копія в кожному екземплярі',
        'Метод нащадка `handle() {}` завжди перевизначає поле-стрілку `handle`, оголошене в базовому класі'
      ],
      correct: 2,
      why: [
        'Хибно: поле — власна властивість екземпляра, на прототипі його немає, тож `super.method` недоступний.',
        'Хибно: strict mode якраз робить `this` відірваного методу `undefined`.',
        'Правильно: це головна різниця, звідси всі trade-offs.',
        'Хибно: власне поле екземпляра затінює метод прототипу, тож «перевизначення» не спрацює.'
      ],
      answer: `
| | \`method() {}\` | \`method = () => {}\` |
|---|---|---|
| Де | один раз на \`prototype\` | у кожному екземплярі |
| \`this\` | динамічний, губиться в колбеках | лексичний, завжди екземпляр |
| Пам'ять | O(1) | O(n) екземплярів |
| \`super.method()\` | так | ні |
| Мокання | \`Class.prototype\` | на кожному екземплярі |

- Пастка: поле в базовому класі затінює метод нащадка з тим самим ім'ям.
- За замовчуванням — методи; поля-стрілки — для обробників, що передаються як колбеки.
- Альтернатива: \`this.handle = this.handle.bind(this)\` у конструкторі.
`,
      keyPoints: [
        'Метод — на prototype, один на всі екземпляри; стрілкове поле — у кожному екземплярі',
        'Стрілкове поле має лексичний this — не губиться в колбеках',
        'Поле в базовому класі затінює метод нащадка; немає super.method()',
        'Альтернатива: bind у конструкторі'
      ],
      followUps: ['Чому в React class components писали this.handleClick = this.handleClick.bind(this)?', 'Як поле класу транспілюється Babel?']
    },
    {
      id: 'proto-theory-composition',
      group: 'design',
      type: 'theory',
      level: 3,
      title: 'Наслідування vs композиція, міксини',
      tags: ['classes', 'composition', 'mixins'],
      question: 'Що таке «favor composition over inheritance»? Які проблеми глибоких ієрархій класів? Що таке міксини в JavaScript і як їх реалізувати? Оберіть **усі** правильні твердження.',
      choices: [
        'Композиція моделює відношення «має» (has-a): об\'єкт делегує роботу іншим об\'єктам',
        'Глибокі ієрархії крихкі (fragile base class): зміна базового класу ламає нащадків',
        '`Object.assign(User.prototype, mixin)` переносить геттери міксина саме як геттери',
        'Міксини усувають конфлікти імен, бо кожен міксин має власний простір імен',
        'JavaScript підтримує множинне наслідування: `class A extends B, C {}`'
      ],
      correct: [0, 1],
      why: [
        'Правильно: `Car` має `Engine` і делегує йому роботу.',
        'Правильно: нащадки залежать від деталей базового класу.',
        'Хибно: `Object.assign` викликає геттер і копіює значення.',
        'Хибно: міксини пишуть в один об\'єкт, тож пізніший перезаписує попередній.',
        'Хибно: `extends` приймає один клас; поведінку з кількох джерел дають міксини чи композиція.'
      ],
      answer: `
- **Наслідування** — is-a; **композиція** — has-a (делегування).
- Проблеми ієрархій: fragile base class, «банан і горила», одиночне наслідування, порушення LSP.
\`\`\`js
const canFly = (state) => ({ fly: () => state.name + ' flies' });
const canSwim = (state) => ({ swim: () => state.name + ' swims' });
const createDuck = (name) => {
  const state = { name };
  return { ...canFly(state), ...canSwim(state) };
};
\`\`\`
- **Міксини:** 1) копіювання дескрипторів у \`prototype\` (не \`Object.assign\`); 2) subclass factory: \`const Serializable = (Base) => class extends Base { ... }\`.
- Ризики: конфлікти імен, неявні залежності.
- У React хуки замінили міксини — композиція поведінки.
`,
      keyPoints: [
        'Наслідування — is-a, композиція — has-a / делегування',
        'Проблеми: fragile base class, жорстка зв\'язаність, одиночне наслідування',
        'Міксини через копіювання дескрипторів або Base => class extends Base',
        'Ризики міксинів: конфлікти імен, неявні залежності'
      ],
      followUps: ['Чому Object.assign погано підходить для міксинів з геттерами?', 'Як хуки React замінили міксини?']
    },
    {
      id: 'proto-mixin',
      group: 'design',
      type: 'code',
      level: 3,
      title: 'mixin: Serializable і Titled для моделей',
      tags: ['classes', 'mixins', 'descriptors'],
      description: `
**Завдання.** Напишіть \`mixin(target, ...sources)\`, що додає в \`target\` (зазвичай \`SomeClass.prototype\`) усі власні властивості джерел — **через дескриптори**.

**Де трапляється:** спільна поведінка для моделей без спільного предка (\`serialize\`, \`toJSON\`, події); питання «чому \`Object.assign\` ламає геттери?».

**Що написати**
- \`mixin(target, ...sources)\` → \`target\`
  - копіювати **дескриптори** — геттери лишаються геттерами і не викликаються
  - включно із символьними та неперелічуваними ключами (методи іншого класу)
  - \`constructor\` не копіювати
  - скопійоване — **неперелічуване** (як методи класу)
  - пізніші джерела перезаписують попередні

**Приклад**
\`\`\`js
const Serializable = { serialize() { return JSON.stringify(this); } };
const Titled = { get title() { return 'Mr. ' + this.name; } };
class User { constructor(name) { this.name = name; } }
mixin(User.prototype, Serializable, Titled);
new User('Ann').title;       // 'Mr. Ann'
new User('Ann').serialize(); // '{"name":"Ann"}'
\`\`\`

**Як це працює:** \`Object.assign\` робить \`target[key] = source[key]\` — викликає геттер і записує результат. Натомість \`Object.getOwnPropertyDescriptor\` + \`Object.defineProperty\` переносять сам геттер. \`Reflect.ownKeys\` дає всі ключі: рядкові (і неперелічувані) та символьні.

**Врахуйте:** \`User.prototype.constructor\` має лишитися \`User\`.
`,
      starter: `function mixin(target, ...sources) {
  // 1. Для кожного source — для кожного key з Reflect.ownKeys(source):
  //    - key === 'constructor' → пропустити
  //    - const d = Object.getOwnPropertyDescriptor(source, key)
  //    - Object.defineProperty(target, key, { ...d, enumerable: false })
  // TODO: зараз Object.assign — він викликає геттери
  return Object.assign(target, ...sources);
}

// Спробуйте в консолі:
// const t = mixin({ name: 'Ann' }, { get title() { return 'Mr. ' + this.name; } }); t.title;
`,
      solution: `function mixin(target, ...sources) {
  for (const source of sources) {
    // Reflect.ownKeys: рядкові (включно з неперелічуваними) і символьні ключі
    for (const key of Reflect.ownKeys(source)) {
      if (key === 'constructor') continue;
      const descriptor = Object.getOwnPropertyDescriptor(source, key);
      // копіюємо дескриптор: геттери лишаються геттерами
      Object.defineProperty(target, key, { ...descriptor, enumerable: false });
    }
  }
  return target;
}
`,
      hints: [
        '`Object.assign` копіює значення — потрібні `Object.getOwnPropertyDescriptor` + `Object.defineProperty`.',
        'Усі ключі, включно із символами та неперелічуваними методами класів, — `Reflect.ownKeys`.',
        'Перед `defineProperty` поставте `enumerable: false` і пропустіть `constructor`.'
      ],
      tests: [
        { name: 'методи доступні в екземплярах', code: 'const Serializable = { serialize() { return JSON.stringify(this); } };\nclass User { constructor(name) { this.name = name; } }\nmixin(User.prototype, Serializable);\nexpect(new User("Ann").serialize()).toBe(\'{"name":"Ann"}\');' },
        { name: 'геттери лишаються геттерами', code: 'const Titled = { get title() { return "Mr. " + this.name; } };\nclass User { constructor(name) { this.name = name; } }\nmixin(User.prototype, Titled);\nexpect(new User("Ann").title).toBe("Mr. Ann");\nexpect(typeof Object.getOwnPropertyDescriptor(User.prototype, "title").get).toBe("function");' },
        { name: 'геттери не викликаються під час копіювання', code: 'let calls = 0;\nconst src = { get lazy() { calls++; return 1; } };\nmixin({}, src);\nexpect(calls).toBe(0);' },
        { name: 'скопійоване неперелічуване', code: 'class User { constructor(name) { this.name = name; } }\nmixin(User.prototype, { hello() {} });\nconst keys = [];\nfor (const k in new User("A")) keys.push(k);\nexpect(keys).toEqual(["name"]);' },
        { name: 'методи іншого класу та символи, без constructor', code: 'class Other { m() { return 1; } }\nconst tag = Symbol("tag");\nclass User {}\nmixin(User.prototype, Other.prototype, { [tag]: "x" });\nconst u = new User();\nexpect(u.m()).toBe(1);\nexpect(u[tag]).toBe("x");\nexpect(User.prototype.constructor).toBe(User);' },
        { name: 'пізніші джерела перемагають; повертає target', code: 'const target = {};\nconst r = mixin(target, { f() { return "a"; } }, { f() { return "b"; } });\nexpect(r).toBe(target);\nexpect(target.f()).toBe("b");' }
      ],
      explanation: `
Копіювання дескрипторів тримає аксесори «живими»; \`Reflect.ownKeys\` потрібен, бо методи класів неперелічувані. O(сумарна кількість ключів).

**Обмеження:** методи з \`super\` посилаються на \`[[HomeObject]]\` джерела; \`#\`-поля не перенести — для цього subclass factory \`(Base) => class extends Base {}\`.

**Що спитають далі:** як виявляти конфлікти імен (кидати помилку, якщо ключ уже є)?
`
    },
    {
      id: 'proto-theory-pollution-perf',
      group: 'design',
      type: 'theory',
      level: 4,
      title: 'Prototype pollution, setPrototypeOf і розширення вбудованих прототипів',
      tags: ['prototypes', 'security', 'performance'],
      question: 'Що таке prototype pollution і як від нього захиститися? Чому не рекомендують Object.setPrototypeOf на існуючих об\'єктах і розширення вбудованих прототипів (Array.prototype.myMethod)?',
      choices: [
        'Ключ `__proto__` у наївному merge дописує властивість в `Object.prototype` для всіх об\'єктів',
        'Prototype pollution можлива лише через `eval`, тож код без `eval` від неї захищений',
        '`Object.setPrototypeOf` на готовому об\'єкті лише міняє посилання і ніяк не впливає на швидкодію',
        'Розширювати `Array.prototype` безпечно, якщо дати методу унікальну назву'
      ],
      correct: 0,
      why: [
        'Правильно: `target[\'__proto__\']` — це `Object.prototype`, тож запис у нього бачать усі об\'єкти.',
        'Хибно: досить рекурсивного merge чи `set(obj, path)` з даними від користувача.',
        'Хибно: зміна прототипу інвалідує приховані класи й inline caches рушія — код деоптимізується.',
        'Хибно: назва може з\'явитися в стандарті (SmooshGate), а присвоєний метод видно в `for...in`.'
      ],
      answer: `
**Prototype pollution:**
\`\`\`js
const payload = JSON.parse('{"__proto__": {"isAdmin": true}}');
naiveMerge({}, payload); // Object.prototype.isAdmin = true
({}).isAdmin;            // true — у всіх об'єктів!
\`\`\`
- Вектори: рекурсивний merge, \`set(obj, path)\`, парсери query (\`?__proto__[x]=1\`).
- Захист: блокувати \`__proto__\`/\`constructor\`/\`prototype\`; словники — \`Object.create(null)\` або \`Map\`; \`Object.hasOwn\`; валідація за схемою; оновлення залежностей.

**\`Object.setPrototypeOf\`** на готовому об'єкті ламає hidden classes / inline caches → деоптимізація. Задавайте прототип при створенні (\`Object.create\`, \`extends\`).

**Monkey patching вбудованих:** конфлікт з майбутнім стандартом (\`flatten\` → \`flat\`, «SmooshGate»), конфлікти бібліотек, перелічувані властивості. Допустимо лише для поліфілів стандарту (\`if (!Array.prototype.at)\` + \`defineProperty\` з \`enumerable: false\`).
`,
      keyPoints: [
        'Prototype pollution: запис у Object.prototype через __proto__/constructor.prototype',
        'Захист: блок-лист ключів, Object.create(null)/Map, Object.hasOwn, схеми',
        'setPrototypeOf ламає hidden classes / inline caches — задавайте прототип при створенні',
        'Monkey patching вбудованих прототипів: конфлікти зі стандартом, лише поліфіли'
      ],
      followUps: ['Як знайти prototype pollution у залежностях?', 'Як правильно написати поліфіл, щоб він не з\'являвся у for..in?']
    }
  ]
});
