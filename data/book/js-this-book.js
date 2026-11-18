FE.chapter('js-this-book', { body: `
\`this\` визначається **способом виклику** функції, а не місцем її оголошення (крім стрілок). Чотири правила + стрілки пояснюють будь-яку задачу на співбесіді.

## Неявна прив'язка: obj.method()

\`\`\`js
const user = { name: 'Ann', hi() { return this.name; } };
user.hi();            // 'Ann' — this = об'єкт перед крапкою
const fn = user.hi;
fn();                 // undefined (strict: this = undefined → TypeError при доступі)
\`\`\`
- \`this\` — об'єкт **ліворуч від крапки** в момент виклику; \`a.b.c()\` → \`this = a.b\`;
- «відрив» методу (присвоєння змінній, передача як колбек, деструктуризація) втрачає прив'язку;
- ланцюжок методів (\`builder.add().remove()\`) працює, якщо кожен метод повертає \`this\`.

## Стрілки і вкладені функції

- **стрілка** не має власного \`this\` — бере його з лексичного оточення (як змінну);
- звичайна функція, вкладена в метод, має **свій** \`this\` (\`undefined\` у strict) — класична пастка в колбеках \`setTimeout\`, \`forEach\`;
\`\`\`js
const timer = {
  seconds: 0,
  start() {
    setInterval(() => { this.seconds++; }, 1000);          // стрілка: this = timer
    // setInterval(function () { this.seconds++; }, 1000);  // this = undefined/globalThis
  },
};
\`\`\`
- стрілка як **метод** об'єкта-літерала — \`this\` зовнішній (модуль/вікно), а не об'єкт — помилка;
- стрілку не можна перепривʼязати: \`call/apply/bind\` ігнорують \`thisArg\`.

## call, apply, bind

- \`fn.call(ctx, a, b)\` — виклик з \`this = ctx\` і аргументами списком;
- \`fn.apply(ctx, [a, b])\` — те саме, аргументи масивом (сьогодні частіше спред: \`fn.call(ctx, ...args)\`);
- \`fn.bind(ctx, a)\` — **нова** функція з назавжди прив'язаним \`this\` і частково застосованими аргументами; повторний \`bind\` не змінює \`this\`;
- позичання методів: \`Array.prototype.slice.call(arguments)\`, \`Object.prototype.toString.call(x)\`.

## Втрата контексту і як її виправити

Де губиться \`this\`: передача методу як колбека (\`addEventListener('click', this.onClick)\`, \`setTimeout(obj.m)\`, \`promise.then(obj.m)\`), деструктуризація методу, збереження в змінній.

Рішення:
1. стрілка-обгортка: \`btn.addEventListener('click', () => this.onClick())\`;
2. \`bind\` (у конструкторі або при передачі) — але зберігайте посилання, щоб потім \`removeEventListener\`;
3. **поля-стрілки класу:** \`onClick = () => { … }\` — прив'язка на екземпляр (ціна: функція на кожен екземпляр, не в прототипі);
4. \`handleEvent\`-об'єкт для DOM-подій.

У DOM-обробнику, переданому звичайною функцією, \`this === event.currentTarget\`.

## new і пріоритет правил

Порядок пріоритету визначення \`this\`:
1. **\`new\`** — новий об'єкт (навіть для bound-функції: \`new\` перемагає \`bind\`, але аргументи з bind зберігаються);
2. **явна** — \`call/apply/bind\`;
3. **неявна** — \`obj.method()\`;
4. **за замовчуванням** — \`undefined\` у strict (модулі, класи), \`globalThis\` у нестрогому режимі.

Стрілки — поза правилами: лексичний \`this\`. Що робить \`new F()\`: створює об'єкт з прототипом \`F.prototype\` → викликає \`F\` з \`this\` = цей об'єкт → повертає його (якщо \`F\` не повернула інший **об'єкт**).

## Поліфіли call, apply, bind

\`\`\`js
Function.prototype.myCall = function (ctx, ...args) {
  ctx = ctx == null ? globalThis : Object(ctx);
  const key = Symbol('fn');
  ctx[key] = this;                       // тимчасово робимо функцію методом ctx
  try { return ctx[key](...args); } finally { delete ctx[key]; }
};
Function.prototype.myBind = function (ctx, ...bound) {
  const fn = this;
  function bound2(...args) {
    return this instanceof bound2           // викликали з new → ігноруємо ctx
      ? new fn(...bound, ...args)
      : fn.apply(ctx, [...bound, ...args]);
  }
  bound2.prototype = Object.create(fn.prototype);
  return bound2;
};
\`\`\`
Ідея \`call\` — неявна прив'язка через тимчасову властивість (\`Symbol\`, щоб не перезаписати існуючу). Повний \`bind\` підтримує \`new\`, часткове застосування, \`length\` і \`name\` (\`'bound fn'\`).

## Типові питання

- **Як визначається this? Чотири правила і пріоритет.**
- **this у стрілці vs у звичайній функції.**
- **call vs apply vs bind.**
- **Чому губиться контекст у setTimeout / обробнику і як виправити?**
- **Що виведе bind двічі? new з bound-функцією?**
- **Напишіть поліфіл bind.**
`});
