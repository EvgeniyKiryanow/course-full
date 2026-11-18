FE.chapter('js-prototypes-book', { body: `
JavaScript — прототипна мова: об'єкти успадковують від інших об'єктів. \`class\` — зручний синтаксис над тим самим механізмом з кількома справжніми відмінностями.

## [[Prototype]] і ланцюжок прототипів

- кожен об'єкт має приховане посилання \`[[Prototype]]\` — \`Object.getPrototypeOf(obj)\` (застарілий доступ — \`__proto__\`);
- **читання** властивості йде вгору ланцюжком до \`null\`; **запис** створює власну властивість (затінення), якщо в ланцюжку немає сеттера;
- методи в прототипі — спільні для всіх екземплярів (економія пам'яті); **спільний мутабельний стан у прототипі** (масив) — пастка: усі екземпляри змінюють один масив;
- \`Object.create(proto)\` — новий об'єкт із заданим прототипом; \`Object.create(null)\` — без прототипу («чистий словник», немає \`toString\`, \`hasOwnProperty\`);
- \`Object.setPrototypeOf\` після створення — повільно (ламає оптимізації рушія).

## Функції-конструктори, prototype і new

\`\`\`js
function User(name) { this.name = name; }
User.prototype.hi = function () { return 'Hi ' + this.name; };
const u = new User('Ann');
Object.getPrototypeOf(u) === User.prototype;   // true
User.prototype.constructor === User;           // true
\`\`\`
- \`F.prototype\` — **не** прототип функції, а об'єкт, який стане прототипом екземплярів \`new F()\`; прототип самої функції — \`Function.prototype\`;
- \`new F(...)\`: \`const obj = Object.create(F.prototype)\` → \`F.apply(obj, args)\` → якщо повернуто об'єкт — він, інакше \`obj\`;
- заміна \`F.prototype = {...}\` після створення екземплярів не змінює їхній прототип і губить \`constructor\`.

## instanceof

\`obj instanceof F\` — чи є \`F.prototype\` у ланцюжку прототипів \`obj\`. Тому:
- примітиви → \`false\` (\`'a' instanceof String\`);
- \`Object.create(null)\`-об'єкти → \`false\` для \`Object\`;
- об'єкти з іншого realm (iframe, воркер) → \`false\` (\`[] instanceof Array\` з iframe) — \`Array.isArray\` надійніший;
- поведінку можна змінити \`static [Symbol.hasInstance](x)\`;
- реалізація: цикл \`proto = Object.getPrototypeOf(proto)\` до \`null\` з порівнянням.

## Наслідування без class

\`\`\`js
function Widget(id) { this.id = id; }
Widget.prototype.render = function () { return '<div id="' + this.id + '">'; };
function Button(id, label) {
  Widget.call(this, id);                                   // «super(...)»
  this.label = label;
}
Button.prototype = Object.create(Widget.prototype);         // ланцюжок прототипів
Button.prototype.constructor = Button;                       // відновити constructor
Button.prototype.render = function () {
  return Widget.prototype.render.call(this) + this.label + '</div>';  // «super.render()»
};
\`\`\`
Розуміння цього механізму — основа відповіді на «що робить \`extends\`».

## Класи: що всередині

\`class\` — переважно синтаксичний цукор над конструкторами й прототипами, але з **реальними відмінностями**:
- клас не можна викликати без \`new\` (TypeError);
- тіло класу завжди в strict mode; методи **неперелічувані**;
- класи мають TDZ (не «піднімаються» для використання);
- \`super\` і \`[[HomeObject]]\` методів, \`static\`-блоки, \`#приватні\` поля, поля класу (ініціалізуються перед тілом конструктора; в похідних — після \`super()\`);
- \`typeof class {}\` → \`'function'\`; методи — у \`prototype\`, поля — на екземплярі.

## extends і super

- \`class B extends A\` встановлює **два** ланцюжки: \`B.prototype → A.prototype\` (методи екземплярів) і \`B → A\` (статичні методи);
- у конструкторі похідного класу \`super(...)\` — обов'язково **до** \`this\` (інакше ReferenceError): об'єкт створює базовий конструктор;
- \`super.method()\` — метод батька з поточним \`this\`;
- пастка: базовий конструктор, що викликає перевизначений метод, — метод похідного класу виконується **до** ініціалізації полів похідного класу;
- розширення вбудованих: \`class MyArray extends Array\` (працює, \`Symbol.species\` визначає клас результату \`map\`), \`class AppError extends Error\` (потрібне \`this.name\`).

## Інкапсуляція: #приватні поля

\`\`\`js
class Account {
  #balance = 0;
  static #count = 0;
  #log(msg) { /* приватний метод */ }
  get balance() { return this.#balance; }
  static isAccount(x) { return #balance in x; }   // перевірка «бренду»
}
\`\`\`
- справжня приватність рушія: недоступні ззовні, через \`Object.keys\`, \`JSON\`, \`Proxy\`; доступ ззовні — SyntaxError;
- не успадковуються як доступні: похідний клас не бачить \`#\`-поля батька;
- альтернативи: замикання (фабрики), \`WeakMap\` з приватними даними, конвенція \`_name\` (не захищає).

## Поля-стрілки, композиція, міксини, безпека

- **поле-стрілка** \`handle = () => {}\` — прив'язаний \`this\`, але окрема функція на кожен екземпляр, недоступна через \`super\`, не в прототипі (не перевизначити звичайним методом);
- **композиція замість наслідування:** глибокі ієрархії крихкі (проблема «банан і горила»); краще збирати поведінку з об'єктів-функцій або класів-сервісів;
- **міксини:** \`const Serializable = (Base) => class extends Base { toJSON() {…} }\` — \`class Model extends Serializable(Titled(Base))\`;
- **prototype pollution:** злиття об'єктів з даними користувача, де ключ \`__proto__\` або \`constructor.prototype\`, змінює \`Object.prototype\` для всього застосунку — фільтрувати ключі, \`Object.create(null)\`, \`Map\`;
- **не розширюйте вбудовані прототипи** (\`Array.prototype.myFn\`) у бібліотеках — конфлікти з майбутніми стандартами (історія \`Array.prototype.flatten\` → \`flat\`).

## Типові питання

- **Що таке прототип? __proto__ vs prototype?**
- **Що робить new? Реалізуйте myNew.**
- **Як працює instanceof?**
- **Чи є class лише цукром? Відмінності.**
- **Навіщо super() перед this?**
- **#private vs замикання vs WeakMap?**
- **Наслідування vs композиція; що таке міксин?**
- **Що таке prototype pollution?**
`});
