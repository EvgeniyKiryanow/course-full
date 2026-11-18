FE.topic('js-scope', {
  intro: `
## var, let, const

| | \`var\` | \`let\` | \`const\` |
|---|---|---|---|
| Область видимості | функція | блок \`{}\` | блок \`{}\` |
| Hoisting | так, зі значенням \`undefined\` | так, але TDZ | так, але TDZ |
| Повторне оголошення | можна | SyntaxError | SyntaxError |
| Перепризначення | можна | можна | TypeError |
| Властивість \`window\` (скрипт) | так | ні | ні |

\`const\` забороняє перепризначення, а не зміну вмісту: \`const arr = []; arr.push(1)\` — ок.

## Hoisting і TDZ

- Перед виконанням рушій реєструє всі оголошення області (нічого не «переміщує»).
- \`function foo() {}\` — доступна повністю до рядка оголошення.
- \`var x\` — існує зі значенням \`undefined\`; \`var f = function(){}\` до присвоєння — \`undefined\` → \`f()\` = TypeError.
- \`let\`/\`const\` — існують, але до рядка оголошення будь-який доступ → \`ReferenceError\` (Temporal Dead Zone), навіть \`typeof\`.

## Лексична область видимості

- Змінна шукається від поточного блоку назовні по ланцюжку (scope chain) до глобальної.
- Важливо, **де функцію оголошено**, а не звідки викликано.
- Функція пам'ятає змінні місця створення — так працюють приватний стан і модулі на IIFE.

## Цикли

\`\`\`js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3 — одна i
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 0 1 2 — нова i щоразу
\`\`\`

## Глобальна область і strict mode

- \`var\` і function declaration верхнього рівня скрипта → властивості \`window\`; \`let\`/\`const\` — ні.
- \`let a = b = 5\` у sloppy mode створює глобальну \`b\`; у strict mode — ReferenceError.
- Strict mode: \`'use strict'\`, автоматично в ES-модулях і класах; помилки замість мовчазних збоїв.
`,
  groups: [
    { id: 'declarations', title: 'var, let, const' },
    { id: 'blocks', title: 'Блокова область і затінення' },
    { id: 'hoisting', title: 'Hoisting' },
    { id: 'tdz', title: 'Temporal Dead Zone' },
    { id: 'lexical', title: 'Лексична область і приватний стан' },
    { id: 'loops', title: 'let у циклах і колбеки' },
    { id: 'global', title: 'Глобальна область і strict mode' }
  ],
  items: [
    // ================================================================ 1. var, let, const
    {
      id: 'scope-var-let-const',
      group: 'declarations',
      type: 'theory',
      level: 1,
      interview: true,
      title: 'var, let і const: різниця',
      tags: ['var', 'let', 'const'],
      question: 'Чим відрізняються var, let і const? Що ви використовуєте за замовчуванням і чому? Оберіть **усі** правильні твердження.',
      choices: [
        '`var` має функціональну область видимості, а `let` і `const` — блокову',
        '`let` і `const` не піднімаються взагалі, тому до оголошення їх просто не видно',
        '`const` робить значення незмінним, тож `push` у `const`-масив кине помилку',
        '`let` у `for` створює нову змінну на кожну ітерацію, а `var` — одну на весь цикл',
        '`let` на верхньому рівні скрипта, як і `var`, створює властивість `window`'
      ],
      correct: [0, 3],
      why: [
        "Правильно: `var` видно в усій функції, `let`/`const` — лише в блоці `{}`.",
        "Вони піднімаються, але до рядка оголошення перебувають у TDZ — доступ кидає ReferenceError.",
        "`const` забороняє лише перепризначення змінної; вміст масиву чи об'єкта змінювати можна.",
        "Правильно: тому колбеки в циклі з `let` бачать «своє» значення.",
        "Глобальні `let`/`const` живуть в окремому сховищі й не стають властивостями window."
      ],
      hint: 'Область видимості, підняття, перепризначення, цикли.',
      answer: `
- **Область:** \`var\` — функція; \`let\`/\`const\` — блок.
- **Hoisting:** \`var\` → \`undefined\`; \`let\`/\`const\` → TDZ (ReferenceError до оголошення).
- **Повторне оголошення:** \`var\` можна, \`let\`/\`const\` — SyntaxError.
- **const:** не можна перепризначити, але можна мутувати вміст.
- **Цикли:** \`let\` — нова змінна на ітерацію.
- **Практика:** \`const\` за замовчуванням, \`let\` — якщо треба перепризначати, \`var\` — не використовувати.
`,
      keyPoints: ['var — функціональна область, let/const — блокова', 'TDZ для let/const', 'const ≠ незмінне значення', 'let у циклі — нова змінна щоразу', 'const за замовчуванням'],
      followUps: ['Що таке TDZ?', 'Чому в циклі з var усі setTimeout бачать останнє значення?']
    },
    {
      id: 'scope-const-mutation',
      group: 'declarations',
      type: 'quiz',
      level: 1,
      title: 'const і let: що заборонено?',
      tags: ['const', 'let'],
      question: '`const` забороняє **перепризначити змінну**, але не змінювати вміст об\'єкта. Оберіть **усі** фрагменти, що кинуть помилку. Кожен фрагмент — окремий звичайний скрипт (не strict mode).',
      options: [
        '`const arr = []; arr.push(1);`',
        '`const n = 1; n++;`',
        '`const obj = {}; obj.a = 1;`',
        '`const s = \'ab\'; s[0] = \'X\';`',
        '`let y = 1; let y = 2;`',
        '`const x;`'
      ],
      answer: [1, 4, 5],
      why: [
        "Без помилки: `push` змінює вміст масиву, а змінна arr вказує туди ж.",
        "TypeError: `n++` — це перепризначення `n = n + 1`.",
        "Без помилки: додавання властивості — мутація об'єкта, не перепризначення.",
        "Без помилки (лише тут важливий режим): рядки незмінні, і в звичайному режимі запис мовчки ігнорується; у strict mode був би TypeError.",
        "SyntaxError у будь-якому режимі: `let` не можна оголосити двічі в одній області.",
        "SyntaxError у будь-якому режимі (і strict, і ні): `const` обов'язково ініціалізують одразу."
      ],
      hint: 'const захищає змінну, а не значення. А ще const вимагає значення одразу.',
      explanation: `
\`const\` — про змінну: її не можна перепризначити (\`=\`, \`++\`, \`+=\`). Об'єкт/масив усередині змінювати можна. Повторний \`let\`/\`const\` в одній області — SyntaxError (весь скрипт не запуститься).
`
    },

    // ================================================================ 2. блоки й затінення
    {
      id: 'scope-block-scope',
      group: 'blocks',
      type: 'quiz',
      level: 1,
      title: 'Блокова область видимості',
      tags: ['block-scope'],
      question: `
Блок — це будь-які \`{ }\`: тіло \`if\`, \`for\`, просто фігурні дужки. \`let\`/\`const\` живуть лише всередині блоку, \`var\` — у всій функції (або глобально).

Що виведе код?

\`\`\`js
if (true) {
  var a = 1;
  let b = 2;
  const c = 3;
}
console.log(typeof a, typeof b, typeof c);
\`\`\`
`,
      options: ['`number number number`', '`undefined undefined undefined`', '`number undefined undefined`', '`ReferenceError`'],
      answer: 2,
      why: [
        "`let` і `const` не виходять за межі блоку `if`.",
        "`var` ігнорує блок, тож `a` видно після if.",
        "Правильно: var «протікає» з блоку, let/const — ні; typeof для невідомого імені дає «undefined».",
        "`typeof` не кидає помилку для імені, якого немає в області видимості."
      ],
      hint: 'Блок if обмежує лише let/const.',
      explanation: `
Звичайне \`console.log(b)\` тут кинуло б ReferenceError — \`typeof\` безпечний. Висновок: \`var\` «протікає» з блоків, тому його й замінили на \`let\`/\`const\`.
`
    },
    {
      id: 'scope-shadowing',
      group: 'blocks',
      type: 'quiz',
      level: 2,
      title: 'Затінення у вкладених блоках',
      tags: ['block-scope', 'shadowing'],
      question: `
Якщо у вкладеному блоці оголосити змінну з тим самим ім'ям, вона **затінює** (shadowing) зовнішню. Присвоєння без \`let\` змінює найближчу знайдену змінну.

Що виведе код?

\`\`\`js
let a = 1;
{
  let a = 2;
  {
    a = 3;
    console.log(a);
  }
  console.log(a);
}
console.log(a);
\`\`\`
`,
      options: ['`3 2 1`', '`3 3 3`', '`3 3 1`', '`3 2 3`'],
      answer: 2,
      why: [
        "`a = 3` не створює нову змінну, а змінює найближчу — ту, що оголошена в середньому блоці.",
        "Зовнішня `a` затінена середньою, тож присвоєння до неї не дійшло.",
        "Правильно: `a = 3` змінив середню `a`; зовнішня лишилась 1.",
        "Присвоєння змінило середню `a`, а не зовнішню."
      ],
      hint: 'a = 3 без let — це зміна найближчої змінної по ланцюжку.',
      explanation: `
Пошук імені йде від поточного блоку назовні й зупиняється на першому збігу. Затінення часто призводить до багів — лінтер (\`no-shadow\`) про це попереджає.
`
    },

    // ================================================================ 3. hoisting
    {
      id: 'scope-hoisting',
      group: 'hoisting',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Що таке hoisting?',
      tags: ['hoisting'],
      question: 'Що таке підняття (hoisting)? Як воно працює для var, let/const, function declaration і function expression?',
      choices: [
        'Рушій фізично переносить усі оголошення на початок функції перед її виконанням',
        'Function expression `var f = function () {}` піднімається повністю, як і declaration',
        '`var` піднімається зі значенням `undefined`, а `let`/`const` — без ініціалізації (TDZ)',
        'Function declaration піднімається лише ім\'ям, тому виклик до оголошення кине TypeError'
      ],
      correct: 2,
      why: [
        "Код не переміщується: перед виконанням рушій лише реєструє всі оголошення області.",
        "Піднімається лише змінна `f` зі значенням undefined; функція присвоюється, коли дійде черга.",
        "Правильно: обидва види реєструються заздалегідь, але let/const недоступні до рядка оголошення.",
        "Declaration піднімається разом з тілом — її можна викликати вище оголошення."
      ],
      hint: 'Насправді нічого «не переміщується» — є фаза підготовки перед виконанням.',
      answer: `
- Перед виконанням функції/скрипта рушій реєструє всі оголошення (фаза створення).
- \`function foo() {}\` — повністю, можна викликати раніше.
- \`var x\` — зі значенням \`undefined\`.
- \`var f = function () {}\` — \`f\` є, але \`undefined\` → \`f()\` = TypeError.
- \`let\`/\`const\` — зареєстровані, але в TDZ → ReferenceError до рядка оголошення.
\`\`\`js
console.log(a); // undefined
foo();          // працює
var a = 1;
function foo() {}
\`\`\`
`,
      keyPoints: ['Фаза створення реєструє оголошення', 'function declaration — повністю', 'var — undefined', 'let/const — TDZ', 'function expression — як змінна'],
      followUps: ['Що виведе typeof f до var f = function(){}?', 'Що буде, якщо var і function мають одне ім\'я?']
    },
    {
      id: 'scope-hoisting-var-fn',
      group: 'hoisting',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Hoisting: var, function declaration, expression',
      tags: ['hoisting'],
      question: `
Що виведе код?

\`\`\`js
console.log(a);
console.log(foo());
console.log(typeof bar);

var a = 1;
function foo() { return 'foo'; }
var bar = function () { return 'bar'; };
\`\`\`
`,
      options: [
        '`1 foo function`',
        '`undefined foo undefined`',
        '`ReferenceError`',
        '`undefined TypeError`',
        '`undefined foo function`'
      ],
      answer: 1,
      why: [
        "Присвоєння `a = 1` ще не виконалось — є лише піднята змінна зі значенням undefined.",
        "Правильно: var → undefined, declaration — повністю, bar ще не отримала функцію.",
        "`var` і function declaration піднімаються, тож звернення до них не кидає помилку.",
        "`foo` — declaration, вона піднята з тілом і викликається нормально.",
        "Функцію присвоюють `bar` лише в останньому рядку, тож поки що це undefined."
      ],
      hint: 'Function declaration піднімається з тілом. Для var bar піднімається лише змінна.',
      explanation: `
Якби було \`bar()\` до присвоєння — \`TypeError: bar is not a function\` (викликаємо undefined), а не ReferenceError.
`
    },
    {
      id: 'scope-fn-vs-var-hoisting',
      group: 'hoisting',
      type: 'quiz',
      level: 3,
      title: 'Функція і var з однаковим ім\'ям',
      tags: ['hoisting'],
      question: `
Що виведе код?

\`\`\`js
console.log(typeof foo);
var foo = 'str';
function foo() {}
console.log(typeof foo);
\`\`\`
`,
      options: [
        '`undefined string`',
        '`function function`',
        '`string string`',
        '`function string`',
        '`SyntaxError: Identifier \'foo\' has already been declared`'
      ],
      answer: 3,
      why: [
        "На старті foo вже містить функцію: declaration «перемагає» var без значення.",
        "Рядок `foo = 'str'` виконується до другого console.log і перезаписує функцію.",
        "До присвоєння `'str'` у foo лежить піднята функція.",
        "Правильно: спершу функція (hoisting), потім виконання присвоює рядок.",
        "`var` і function з одним ім'ям дозволені; SyntaxError був би з let."
      ],
      hint: 'На старті declaration важливіша за var без значення. Але присвоєння відбувається під час виконання.',
      explanation: `
Фаза створення: \`foo\` = функція (\`var foo\` без значення її не перезаписує). Виконання: \`foo = 'str'\`; рядок \`function foo() {}\` вже нічого не робить.
`
    },

    // ================================================================ 4. TDZ
    {
      id: 'scope-tdz-shadowing',
      group: 'tdz',
      type: 'quiz',
      level: 2,
      title: 'TDZ і затінення',
      tags: ['tdz', 'shadowing'],
      question: `
\`let\`/\`const\` існують з початку свого блоку, але до рядка оголошення будь-яке звернення кидає \`ReferenceError\`. Цей проміжок — Temporal Dead Zone (TDZ).

Що виведе код?

\`\`\`js
let x = 1;

function test() {
  console.log(x);
  let x = 2;
}

test();
\`\`\`
`,
      options: ['`1`', '`2`', '`undefined`', '`ReferenceError: Cannot access \'x\' before initialization`'],
      answer: 3,
      why: [
        "Внутрішня `x` уже існує в усій функції й затінює зовнішню, тож до зовнішньої пошук не дійде.",
        "Рядок `let x = 2` ще не виконався.",
        "`undefined` дав би `var`; для `let` до оголошення — TDZ.",
        "Правильно: знайдено внутрішню x, але вона ще в TDZ."
      ],
      hint: 'Внутрішня let x існує в усій функції з самого початку — просто ще не ініціалізована.',
      explanation: `
TDZ ловить баги «використав до оголошення», які з \`var\` тихо давали \`undefined\`.
`
    },
    {
      id: 'scope-tdz',
      group: 'tdz',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Temporal Dead Zone',
      tags: ['tdz'],
      question: 'Що таке Temporal Dead Zone? Де вона виникає, чому «temporal», і навіщо її додали? Оберіть **усі** правильні твердження.',
      choices: [
        'TDZ залежить від позиції в тексті: функція, що читає змінну вище оголошення, завжди впаде',
        'У TDZ змінна вже існує й затінює зовнішню, але доступ до неї кидає `ReferenceError`',
        'TDZ є й у параметрах за замовчуванням: `function f(a = b, b = 1) {}` падає при `f()`',
        '`typeof x` у TDZ безпечно повертає `"undefined"`, як і для неоголошеної змінної',
        'У TDZ змінна вже має значення `undefined`, просто запис у неї заборонений'
      ],
      correct: [1, 2],
      why: [
        "«Temporal» — про час виконання: функцію можна оголосити вище, головне — викликати після ініціалізації.",
        "Правильно: тому зовнішня змінна з тим самим ім'ям недоступна.",
        "Правильно: параметри ініціалізуються зліва направо, `b` ще в TDZ.",
        "У TDZ навіть `typeof` кидає ReferenceError.",
        "У TDZ змінна не має жодного значення — і читання, і запис кидають помилку."
      ],
      hint: 'Важить порядок виконання, а не розташування в тексті.',
      answer: `
- TDZ — від початку блоку до виконання рядка оголошення \`let\`/\`const\`.
- Будь-який доступ (навіть \`typeof\`) → ReferenceError.
- «Temporal» — залежить від часу виконання:
\`\`\`js
function read() { return x; } // оголошено вище — ок
let x = 1;
read(); // 1 — викликано після ініціалізації
\`\`\`
- Є й у default-параметрах: \`f(a = b, b = 1)\`.
- Навіщо: ловити використання до ініціалізації і зробити \`const\` осмисленим.
`,
      keyPoints: ['Від початку блоку до рядка оголошення', 'ReferenceError, навіть typeof', 'Залежить від часу виконання', 'Затінює зовнішню змінну'],
      followUps: ['Чому typeof неоголошеної змінної безпечний, а в TDZ — ні?', 'Що виведе let x = x + 1?']
    },
    {
      id: 'scope-reference-errors',
      group: 'tdz',
      type: 'quiz',
      level: 3,
      title: 'Що кине саме ReferenceError?',
      tags: ['tdz', 'hoisting', 'errors'],
      question: 'Оберіть **усі** фрагменти, що кинуть саме `ReferenceError`:',
      options: [
        '`console.log(typeof undeclared);`',
        '`console.log(typeof x); let x = 1;`',
        '`foo(); function foo() {}`',
        '`bar(); var bar = function () {};`',
        '`let z = z + 1;`',
        '`function f(a = b, b = 1) {} f();`'
      ],
      answer: [1, 4, 5],
      why: [
        "Помилки немає: typeof неоголошеного імені дає «undefined».",
        "ReferenceError: x у TDZ, а там навіть typeof кидає помилку.",
        "Помилки немає: function declaration піднята з тілом.",
        "Це TypeError: bar існує, але дорівнює undefined, а undefined не викликається.",
        "ReferenceError: права частина читає z, поки та ще в TDZ.",
        "ReferenceError: параметр b ще в TDZ, коли обчислюється значення a."
      ],
      hint: 'TDZ — це ReferenceError. Виклик undefined як функції — інший тип помилки.',
      explanation: `
ReferenceError — «ім'я недоступне» (не оголошене або в TDZ). TypeError — «ім'я є, але значення не те» (\`undefined()\`).
`
    },

    // ================================================================ 5. лексична область
    {
      id: 'scope-lexical-vs-dynamic',
      group: 'lexical',
      type: 'quiz',
      level: 2,
      title: 'Лексична область видимості',
      tags: ['lexical-scope'],
      question: `
Функція шукає зовнішні змінні там, де її **оголошено** (лексична область), а не там, звідки її викликали.

Що виведе код?

\`\`\`js
const x = 'global';

function printX() {
  console.log(x);
}

function run() {
  const x = 'local';
  printX();
}

run();
\`\`\`
`,
      options: ['`global`', '`local`', '`undefined`', '`ReferenceError`'],
      answer: 0,
      why: [
        "Правильно: printX оголошена на верхньому рівні, тож бачить глобальну x.",
        "Так було б при динамічній області; у JS місце виклику не впливає на пошук змінних.",
        "x знайдено в глобальній області зі значенням 'global'.",
        "Глобальна x оголошена й ініціалізована до виклику run()."
      ],
      hint: 'Що важить: де функцію оголошено чи звідки викликано?',
      explanation: `
Ланцюжок областей функції фіксується під час її створення: \`printX\` → глобальна область. Локальна \`x\` у \`run\` для \`printX\` невидима.
`
    },
    {
      id: 'scope-lexical-environment',
      group: 'lexical',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Лексичне оточення і scope chain',
      tags: ['lexical-scope', 'closures'],
      question: 'Що таке лексичне оточення (Lexical Environment) і ланцюжок областей видимості (scope chain)?',
      choices: [
        'Зовнішні змінні беруться з оточення місця виклику, тому `printX()` у `run` бачить локальну `x`',
        'Лексичне оточення функції знищується одразу після `return`, навіть якщо на нього є посилання',
        'Кожен блок `{}` створює окремий виклик функції і кладе його в стек викликів',
        'Функція запам\'ятовує оточення, де її створено, і пошук змінних іде звідти назовні'
      ],
      correct: 3,
      why: [
        "У JS лексична область: важливе місце оголошення, а не місце виклику.",
        "Оточення живе, поки на нього посилається хоч одна функція — так працює приватний стан.",
        "Блок створює нове оточення для let/const, але не виклик функції і не запис у стеку.",
        "Правильно: це посилання на зовнішнє оточення і є основою scope chain."
      ],
      hint: 'Таблиця змінних + посилання на зовнішнє оточення.',
      answer: `
- **Лексичне оточення** = таблиця змінних області + посилання на зовнішнє оточення.
- Створюється для скрипта, кожного виклику функції, кожного блоку з \`let\`/\`const\`.
- **Scope chain:** пошук імені — поточне → зовнішнє → … → глобальне → ReferenceError.
- Функція при створенні запам'ятовує оточення, де її оголошено:
\`\`\`js
function makeCounter() {
  let count = 0;            // живе, поки є inc
  return function inc() { return ++count; };
}
const inc = makeCounter();
inc(); inc(); // 1, 2
\`\`\`
- Детально про замикання — у темі «Функції та замикання».
`,
      keyPoints: ['Таблиця змінних + посилання outer', 'Пошук від внутрішнього до глобального', 'Функція запам\'ятовує місце створення', 'Оточення живе, поки на нього є посилання'],
      followUps: ['Чому count не зникає після виходу з makeCounter?', 'Скільки оточень створює цикл for з let?']
    },
    {
      id: 'scope-id-generator',
      group: 'lexical',
      type: 'code',
      level: 1,
      title: 'Генератор id без глобальних змінних',
      tags: ['closures', 'private-state'],
      description: `
**Завдання.** Напишіть \`createIdGenerator(prefix, start = 1)\`, що повертає об'єкт з методами \`next\`, \`peek\`, \`reset\`. Лічильник не має бути доступний ззовні.

**Де трапляється:** тимчасові id для нових todo, рядків форми чи \`<label for>\` до збереження на сервері.

**Що написати**
- \`createIdGenerator(prefix, start = 1)\` → \`{ next, peek, reset }\`:
  - \`next()\` → \`'<prefix>-<n>'\` і збільшує лічильник;
  - \`peek()\` → id, який видасть наступний \`next()\`, без зміни стану;
  - \`reset()\` → лічильник знову \`start\`, нічого не повертає.

**Приклад**
\`\`\`js
const todoId = createIdGenerator('todo');
todoId.next();  // 'todo-1'
todoId.next();  // 'todo-2'
todoId.peek();  // 'todo-3'
todoId.reset();
todoId.next();  // 'todo-1'
\`\`\`

**Як це працює:** \`let current\` усередині \`createIdGenerator\` — локальна змінна виклику. Методи оголошені там само, тож бачать її через лексичну область навіть після \`return\`. Кожен виклик \`createIdGenerator\` створює **окрему** \`current\`.

**Врахуйте:** генератори незалежні; \`g.current = 999\` ззовні не має впливати.
`,
      starter: `function createIdGenerator(prefix, start = 1) {
  // 1. Приватний лічильник: let current = start;
  // TODO

  // 2. Методи бачать current через лексичну область.
  return {
    next() {
      // TODO: повернути prefix + '-' + current і збільшити current
    },
    peek() {
      // TODO: те саме, але без збільшення
    },
    reset() {
      // TODO
    }
  };
}

// Спробуйте в консолі:
// const g = createIdGenerator('todo'); g.next(); g.next(); g.peek();
`,
      solution: `function createIdGenerator(prefix, start = 1) {
  let current = start; // приватний стан: доступний лише методам нижче

  return {
    next() {
      return prefix + '-' + current++; // current++ повертає старе значення
    },
    peek() {
      return prefix + '-' + current;
    },
    reset() {
      current = start;
    }
  };
}
`,
      hints: [
        '`let current = start;` перед `return` — методи її бачать.',
        '`next() { return prefix + \'-\' + current++; }` — постфіксний `++` повертає старе значення.'
      ],
      tests: [
        { name: 'next() видає послідовні id', code: 'const g = createIdGenerator("user");\nexpect(g.next()).toBe("user-1");\nexpect(g.next()).toBe("user-2");\nexpect(g.next()).toBe("user-3");' },
        { name: 'кастомний start', code: 'const g = createIdGenerator("order", 100);\nexpect(g.next()).toBe("order-100");\nexpect(g.next()).toBe("order-101");' },
        { name: 'peek() не змінює стан', code: 'const g = createIdGenerator("a");\ng.next();\nexpect(g.peek()).toBe("a-2");\nexpect(g.peek()).toBe("a-2");\nexpect(g.next()).toBe("a-2");' },
        { name: 'reset() повертає до start', code: 'const g = createIdGenerator("x", 5);\ng.next(); g.next();\ng.reset();\nexpect(g.next()).toBe("x-5");' },
        { name: 'генератори незалежні', code: 'const a = createIdGenerator("a");\nconst b = createIdGenerator("b");\na.next(); a.next();\nexpect(b.next()).toBe("b-1");\nexpect(a.next()).toBe("a-3");' },
        { name: 'стан недоступний ззовні', code: 'const g = createIdGenerator("p");\nexpect(Object.keys(g).sort()).toEqual(["next", "peek", "reset"]);\ng.current = 999; g.count = 999;\nexpect(g.next()).toBe("p-1");' }
      ],
      explanation: `
O(1). Глобальний лічильник спільний для всіх і доступний будь-кому; локальна змінна + методи — приватний стан на кожен генератор.
`
    },
    {
      id: 'scope-iife-module',
      group: 'lexical',
      type: 'code',
      level: 2,
      title: 'Кошик-модуль на IIFE з приватним станом',
      tags: ['iife', 'module-pattern', 'private-state'],
      description: `
**Завдання.** Реалізуйте модуль \`cart\` за патерном **Module**: функція, що одразу викликається (IIFE), з приватним масивом товарів і публічними методами.

**Де трапляється:** код до ES-модулів (jQuery-плагіни, бібліотеки), класичне питання «як зробити приватний стан без класів».

**Що написати**
- \`add(name, price, qty = 1)\` → нічого; додає товар або збільшує \`qty\` наявного
- \`remove(name)\` → \`true\`, якщо товар був і його видалено, інакше \`false\`
- \`total()\` → сума \`price * qty\`
- \`count()\` → загальна кількість одиниць
- \`list()\` → **копія**: \`[{ name, price, qty }]\` у порядку додавання
- \`clear()\` → очищує кошик

**Приклад**
\`\`\`js
cart.add('apple', 10, 2);
cart.add('pear', 25);
cart.total();  // 45
cart.count();  // 3
cart.list();   // [{ name: 'apple', price: 10, qty: 2 }, { name: 'pear', price: 25, qty: 1 }]
\`\`\`

**Як це працює:** \`(function () { ... })()\` виконується один раз; змінна \`items\` всередині — локальна для цього виклику й ззовні недоступна. Повернуті методи оголошені в тій самій області, тож бачать \`items\`.

**Врахуйте:** \`list()\` повертає нові об'єкти — зміна копії не має впливати на кошик; \`cart.items\` — \`undefined\`.
`,
      starter: `const cart = (function () {
  // 1. Приватний стан: масив товарів { name, price, qty }.
  // TODO

  // 2. Публічні методи — бачать стан через лексичну область.
  return {
    add(name, price, qty = 1) {
      // TODO: знайти товар за name; є — збільшити qty, немає — додати
    },
    remove(name) {
      // TODO: видалити (splice) і повернути true, або false
    },
    total() {},
    count() {},
    list() {
      // TODO: повернути КОПІЮ — нові об'єкти
    },
    clear() {}
  };
})();

// Спробуйте в консолі: cart.add('apple', 10, 2); cart.total()
`,
      solution: `const cart = (function () {
  // приватний стан: доступний лише функціям нижче
  const items = [];

  function find(name) {
    for (const item of items) {
      if (item.name === name) return item;
    }
    return null;
  }

  return {
    add(name, price, qty = 1) {
      const existing = find(name);
      if (existing) existing.qty += qty;
      else items.push({ name: name, price: price, qty: qty });
    },
    remove(name) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].name === name) {
          items.splice(i, 1);
          return true;
        }
      }
      return false;
    },
    total() {
      let sum = 0;
      for (const item of items) sum += item.price * item.qty;
      return sum;
    },
    count() {
      let n = 0;
      for (const item of items) n += item.qty;
      return n;
    },
    list() {
      // нові об'єкти — зовнішні зміни не зачеплять стан
      const copy = [];
      for (const item of items) copy.push({ name: item.name, price: item.price, qty: item.qty });
      return copy;
    },
    clear() {
      items.length = 0;
    }
  };
})();
`,
      hints: [
        '`const items = [];` усередині IIFE і допоміжна `find(name)` з циклом `for...of`.',
        '`list()`: цикл, що пушить `{ name: item.name, price: item.price, qty: item.qty }` — інакше ззовні можна змінити `qty` у кошику.'
      ],
      tests: [
        { name: 'add, total, count', code: 'cart.clear();\ncart.add("apple", 10, 3);\ncart.add("pear", 25);\nexpect(cart.total()).toBe(55);\nexpect(cart.count()).toBe(4);' },
        { name: 'повторне додавання збільшує кількість', code: 'cart.clear();\ncart.add("apple", 10);\ncart.add("apple", 10, 2);\nexpect(cart.list()).toEqual([{ name: "apple", price: 10, qty: 3 }]);' },
        { name: 'remove повертає boolean', code: 'cart.clear();\ncart.add("a", 1);\nexpect(cart.remove("a")).toBe(true);\nexpect(cart.remove("a")).toBe(false);\nexpect(cart.count()).toBe(0);\nexpect(cart.total()).toBe(0);' },
        { name: 'list — копія в порядку додавання', code: 'cart.clear();\ncart.add("b", 2);\ncart.add("a", 1);\nconst l = cart.list();\nexpect(l.map((i) => i.name)).toEqual(["b", "a"]);\nl.push({ name: "hack", price: 1000, qty: 1 });\nl[0].qty = 100;\nexpect(cart.count()).toBe(2);\nexpect(cart.total()).toBe(3);' },
        { name: 'стан приватний', code: 'cart.clear();\ncart.add("a", 5);\nexpect(Object.values(cart).every((v) => typeof v === "function")).toBe(true);\nexpect(cart.items).toBeUndefined();' },
        { name: 'clear очищує', code: 'cart.clear();\ncart.add("x", 1, 5);\ncart.clear();\nexpect(cart.list()).toEqual([]);\nexpect(cart.total()).toBe(0);' }
      ],
      explanation: `
\`add\`/\`remove\` — O(n) пошуком по масиву (з \`Map\` з теми ES6+ — O(1)). Пастка — повертати з \`list()\` сам масив \`items\`: тоді «приватність» зникає. Сьогодні те саме дають ES-модулі (незмінні змінні модуля) і приватні поля класів.
`
    },

    // ================================================================ 6. цикли
    {
      id: 'scope-loop-let-var',
      group: 'loops',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Функції в циклах: let vs var',
      tags: ['closures', 'loops'],
      question: `
\`for (let i ...)\` створює **нову** змінну \`i\` для кожної ітерації. \`var i\` — одна змінна на весь цикл. Функція, створена в циклі, бачить ту \`i\`, яка була в її області.

Що виведе код?

\`\`\`js
const fns = [];

for (let i = 0; i < 3; i++) {
  fns.push(() => i);
}
for (var j = 0; j < 3; j++) {
  fns.push(() => j);
}

let out = '';
for (const f of fns) out += f() + ' ';
console.log(out);
\`\`\`
`,
      options: ['`0 1 2 0 1 2`', '`3 3 3 3 3 3`', '`0 1 2 3 3 3`', '`2 2 2 2 2 2`', '`0 1 2 2 2 2`'],
      answer: 2,
      why: [
        "Функції з другого циклу ділять одну `j`, яка після циклу дорівнює 3.",
        "З `let` кожна функція має власну i (0, 1, 2).",
        "Правильно: let — окрема i на ітерацію, var — одна j, що закінчилась на 3.",
        "Цикл зупиняється, коли j = 3 (умова j < 3 хибна), а не на 2.",
        "Після останнього `j++` змінна дорівнює 3, а не 2."
      ],
      hint: 'Скільки окремих змінних створює кожен цикл? Коли викликаються функції?',
      explanation: `
Функції викликаються **після** циклів. З \`var\` усі три читають одну \`j\`, що вже дорівнює 3. Це класика співбесід — далі буде практична задача.
`
    },
    {
      id: 'scope-fix-loop-timers',
      group: 'loops',
      type: 'code',
      level: 2,
      title: 'Поява елементів по черзі: виправити цикл з таймерами',
      tags: ['closures', 'loops', 'timers'],
      description: `
**Завдання.** \`scheduleLogs(n, log)\` має запланувати \`log(i)\` через \`i * 100\` мс для \`i = 0..n-1\`. Зараз усі виклики отримують одне значення — виправте.

**Де трапляється:** анімація появи елементів списку по черзі (stagger), черга тостів; класика співбесід «що виведе setTimeout у циклі з var».

**Що написати**
- \`scheduleLogs(n, log)\` → нічого; планує \`n\` викликів \`log(0)\`, \`log(1)\`, …

**Приклад**
\`\`\`js
scheduleLogs(3, console.log);
// через 0 мс:   0
// через 100 мс: 1
// через 200 мс: 2
\`\`\`

**Як це працює:** колбеки \`setTimeout\` виконуються **після** завершення циклу. З \`var\` є одна \`i\`, і на той момент вона дорівнює \`n\`. З \`let\` кожна ітерація має власну \`i\`, і кожен колбек бачить свою.

**Врахуйте:** \`n = 0\` — нічого не планувати.
`,
      starter: `function scheduleLogs(n, log) {
  // Баг: одна змінна i на весь цикл — колбеки бачать її фінальне значення.
  // TODO: виправте оголошення лічильника
  for (var i = 0; i < n; i++) {
    setTimeout(function () {
      log(i);
    }, i * 100);
  }
}

// Спробуйте в консолі: scheduleLogs(3, console.log);
`,
      solution: `function scheduleLogs(n, log) {
  // let створює нову i для кожної ітерації
  for (let i = 0; i < n; i++) {
    setTimeout(() => log(i), i * 100);
  }
}
`,
      hints: [
        'Скільки змінних `i` існує з `var`? Чому вона дорівнює `n`, коли спрацьовує таймер?',
        'Замініть `var` на `let`. Без `let`: `setTimeout(log, i * 100, i)` — третій аргумент передається в колбек.'
      ],
      tests: [
        { name: 'логи з правильними значеннями', code: 'useFakeTimers();\nconst log = mockFn();\nscheduleLogs(3, log);\nrunAllTimers();\nexpect(log.mock.calls.map((c) => c[0])).toEqual([0, 1, 2]);' },
        { name: 'правильні затримки', code: 'useFakeTimers();\nconst log = mockFn();\nscheduleLogs(3, log);\nadvanceTimersByTime(0);\nexpect(log.mock.calls.map((c) => c[0])).toEqual([0]);\nadvanceTimersByTime(100);\nexpect(log.mock.calls.map((c) => c[0])).toEqual([0, 1]);\nadvanceTimersByTime(99);\nexpect(log).toHaveBeenCalledTimes(2);\nadvanceTimersByTime(1);\nexpect(log).toHaveBeenLastCalledWith(2);' },
        { name: 'n = 0 — нічого не планує', code: 'useFakeTimers();\nconst log = mockFn();\nscheduleLogs(0, log);\nexpect(getTimerCount()).toBe(0);\nrunAllTimers();\nexpect(log).not.toHaveBeenCalled();' },
        { name: 'великий n', code: 'useFakeTimers();\nconst log = mockFn();\nscheduleLogs(50, log);\nrunAllTimers();\nexpect(log).toHaveBeenCalledTimes(50);\nexpect(log.mock.calls[49][0]).toBe(49);' }
      ],
      explanation: `
Одне слово виправляє баг: \`let\` у заголовку \`for\` створює нову змінну на кожну ітерацію і копіює в неї поточне значення. До ES6 це робили через функцію-обгортку — наступна задача.
`
    },
    {
      id: 'scope-emulate-block-scope',
      group: 'loops',
      type: 'code',
      level: 3,
      title: 'Обробники кліків у циклі без let (ES5)',
      tags: ['closures', 'loops', 'es5'],
      description: `
**Завдання.** Виправте \`attachHandlers(buttons, onSelect)\` **без \`let\` і \`const\`** (лише \`var\` і функції): кожна кнопка має при кліку повідомляти свій індекс і підпис.

**Де трапляється:** легасі-код без Babel (ES5, jQuery), а також саме так Babel перетворює \`let\` у циклі. Класика співбесід «як виправити без let».

**Що написати**
- \`attachHandlers(buttons, onSelect)\` → нічого; кожній \`buttons[i]\` (об'єкт \`{ text }\`) задає \`onclick\` — функцію, що викликає \`onSelect(i, label)\`, де \`label = (i + 1) + '. ' + buttons[i].text\`

**Приклад**
\`\`\`js
const buttons = [{ text: 'Home' }, { text: 'About' }];
attachHandlers(buttons, (i, label) => console.log(i, label));
buttons[0].onclick(); // 0 '1. Home'
buttons[1].onclick(); // 1 '2. About'
\`\`\`

**Як це працює:** \`var\` має область функції, а не блоку, тож \`i\` і \`label\` — одні на весь цикл. Нова область у ES5 з'являється лише з **новим викликом функції**: винесіть тіло циклу в функцію \`bind(i)\` — тоді її параметр \`i\` і локальна \`var label\` будуть окремими для кожного виклику.

**Врахуйте:** порожній список; кнопки клікають у будь-якому порядку й повторно.
`,
      starter: `function attachHandlers(buttons, onSelect) {
  // Баг: i і label — одні на весь цикл, тож усі обробники бачать останні значення.
  // 1. Винесіть тіло циклу в окрему функцію bind(i) — вона створить нову область.
  // 2. У циклі викликайте bind(i).
  // TODO (без let / const)
  for (var i = 0; i < buttons.length; i++) {
    var label = (i + 1) + '. ' + buttons[i].text;
    buttons[i].onclick = function () {
      onSelect(i, label);
    };
  }
}

// Спробуйте в консолі:
// var b = [{ text: 'A' }, { text: 'B' }]; attachHandlers(b, console.log); b[0].onclick();
`,
      solution: `function attachHandlers(buttons, onSelect) {
  // кожен виклик bind — нова область зі своїми i та label (так робить Babel)
  function bind(i) {
    var label = (i + 1) + '. ' + buttons[i].text;
    buttons[i].onclick = function () {
      onSelect(i, label);
    };
  }
  for (var i = 0; i < buttons.length; i++) {
    bind(i);
  }
}
`,
      hints: [
        'Новий виклик функції = нова область. Оголосіть `function bind(i) { ... }` і перенесіть туди `var label` та призначення `onclick`.',
        'Альтернатива — IIFE в тілі циклу: `(function (j) { ... })(i);`.'
      ],
      tests: [
        { name: 'кожен обробник бачить свій індекс і підпис', code: 'const buttons = [{ text: "Home" }, { text: "About" }, { text: "Contact" }];\nconst onSelect = mockFn();\nattachHandlers(buttons, onSelect);\nbuttons[0].onclick();\nbuttons[2].onclick();\nexpect(onSelect.mock.calls).toEqual([[0, "1. Home"], [2, "3. Contact"]]);' },
        { name: 'будь-який порядок і повторні кліки', code: 'const buttons = [{ text: "A" }, { text: "B" }];\nconst onSelect = mockFn();\nattachHandlers(buttons, onSelect);\nbuttons[1].onclick();\nbuttons[0].onclick();\nbuttons[1].onclick();\nexpect(onSelect.mock.calls).toEqual([[1, "2. B"], [0, "1. A"], [1, "2. B"]]);' },
        { name: 'порожній список', code: 'const onSelect = mockFn();\nexpect(() => attachHandlers([], onSelect)).not.toThrow();\nexpect(onSelect).not.toHaveBeenCalled();' },
        { name: 'без let/const', code: 'const strip = (fn) => fn.toString().replace(/\\/\\*[\\s\\S]*?\\*\\/|\\/\\/.*$/gm, "");\nexpect(/\\b(let|const)\\b/.test(strip(attachHandlers))).toBe(false);' }
      ],
      explanation: `
Кожен виклик \`bind\` створює нове лексичне оточення, і функція \`onclick\` запам'ятовує саме його. Сучасне рішення — просто \`let\`; у реальному DOM — делегування подій (тема «Події»).
`
    },

    // ================================================================ 7. глобальна область і strict mode
    {
      id: 'scope-global-object',
      group: 'global',
      type: 'theory',
      level: 2,
      title: 'Глобальний об\'єкт і глобальні змінні',
      tags: ['global', 'globalThis'],
      question: 'Що таке глобальний об\'єкт? Чим глобальна змінна через var відрізняється від let/const? Що таке globalThis і неявні глобальні змінні? Оберіть **усі** правильні твердження.',
      choices: [
        '`let` і `const` верхнього рівня скрипта стають властивостями `window`, як і `var`',
        '`globalThis` — універсальне посилання на глобальний об\'єкт у браузері, воркері та Node.js',
        'Присвоєння неоголошеному імені у strict mode створює нову глобальну змінну',
        '`var` на верхньому рівні ES-модуля теж створює властивість `window`',
        'У sloppy mode присвоєння неоголошеному імені створює властивість глобального об\'єкта'
      ],
      correct: [1, 4],
      why: [
        "Глобальні let/const зберігаються окремо й не з'являються у window.",
        "Правильно: window, self, global — різні імена, globalThis працює всюди.",
        "У strict mode це ReferenceError — саме для захисту від таких помилок.",
        "Модуль має власну область: його var не стає глобальною.",
        "Правильно: так з'являються неявні глобальні змінні (часто через опечатку)."
      ],
      hint: 'Глобальна область має дві частини: «у window» і окреме сховище.',
      answer: `
- Глобальний об'єкт: \`window\` (браузер), \`self\` (воркер), \`global\` (Node) → універсально \`globalThis\`.
- \`var\` і function declaration верхнього рівня **скрипта** → властивості \`window\`.
- \`let\`/\`const\`/class → глобальні, але **не** у \`window\`.
- ES-модуль: усе верхнього рівня — локальне для модуля.
- Неявна глобальна: \`x = 1\` без оголошення у sloppy → \`window.x\`; у strict → ReferenceError.
`,
      keyPoints: ['globalThis — універсально', 'var → window, let/const — ні', 'Модулі мають власну область', 'Неявні глобальні змінні та strict mode'],
      followUps: ['Чому глобальні змінні — погано?', 'Що виведе let a = b = 5?']
    },
    {
      id: 'scope-global-var-let',
      group: 'global',
      type: 'quiz',
      level: 2,
      title: 'var і let у глобальній області',
      tags: ['global'],
      question: `
Що виведе код, якщо він виконується як звичайний \`<script>\` (не модуль) у браузері?

\`\`\`js
var a = 1;
let b = 2;
function c() {}

console.log(window.a, window.b, typeof window.c, 'b' in window);
\`\`\`
`,
      options: ['`1 2 function true`', '`1 undefined function false`', '`undefined undefined undefined false`', '`1 undefined undefined false`'],
      answer: 1,
      why: [
        "Глобальна `let` не стає властивістю window.",
        "Правильно: var і function declaration — у window, let — в окремому сховищі.",
        "У звичайному скрипті (не модулі) var і function declaration стають властивостями window.",
        "Function declaration верхнього рівня теж потрапляє у window, як і var."
      ],
      hint: 'Глобальна область має дві частини: прив\'язану до window і окрему.',
      explanation: `
Тому \`var\` у скрипті може випадково перезаписати \`window.name\` чи \`window.status\`. У модулі (\`type="module"\`) усі три були б \`undefined\`.
`
    },
    {
      id: 'scope-implicit-global',
      group: 'global',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'let a = b = 5',
      tags: ['global', 'strict-mode'],
      question: `
Що виведе код (sloppy mode)?

\`\`\`js
function test() {
  let a = b = 5;
}

test();
console.log(typeof a, typeof b);
\`\`\`
`,
      options: ['`number number`', '`undefined undefined`', '`undefined number`', '`ReferenceError`'],
      answer: 2,
      why: [
        "`a` оголошена через let усередині функції й ззовні не видна.",
        "`b` не оголошена, тож присвоєння в sloppy mode створило глобальну змінну.",
        "Правильно: це `let a = (b = 5)` — b стала неявною глобальною.",
        "typeof безпечний, а в sloppy mode присвоєння неоголошеній b не кидає помилку."
      ],
      hint: 'Присвоєння правоасоціативне: let a = (b = 5). Де оголошено b?',
      explanation: `
\`let\` стосується лише \`a\`. У strict mode \`b = 5\` кинуло б ReferenceError — ще одна причина вмикати strict mode (у модулях він увімкнений сам).
`
    },
    {
      id: 'scope-strict-mode',
      group: 'global',
      type: 'theory',
      level: 2,
      title: 'Strict mode: що змінює',
      tags: ['strict-mode'],
      question: 'Що таке strict mode? Як його увімкнути і які зміни в поведінці він вносить?',
      choices: [
        'Присвоєння неоголошеній змінній кидає `ReferenceError` замість створення глобальної',
        'Strict mode треба вмикати вручну директивою навіть в ES-модулях і тілах класів',
        'Strict mode лише додає попередження в консоль, а поведінка коду не змінюється',
        'Запис властивості в примітив (`\'abc\'.x = 1`) у strict mode мовчки ігнорується, як і раніше'
      ],
      correct: 0,
      why: [
        "Правильно: strict mode перетворює мовчазні помилки на винятки.",
        "У модулях і класах strict mode увімкнений автоматично.",
        "Він змінює поведінку: частина коду починає кидати помилки.",
        "У strict mode такий запис кидає TypeError."
      ],
      hint: 'Помилки замість мовчазних збоїв.',
      answer: `
- Вмикається: \`'use strict';\` на початку файлу/функції; автоматично в ES-модулях і класах.
- Неоголошена змінна → ReferenceError.
- Запис у властивість примітиву, у read-only властивість → TypeError.
- Заборонено: \`with\`, однакові імена параметрів, вісімкові літерали \`010\`.
- Функція в блоці — блокова.
`,
      keyPoints: ['use strict, авто в модулях і класах', 'Неоголошені змінні — ReferenceError', 'Мовчазні помилки → TypeError', 'Заборонений застарілий синтаксис'],
      followUps: ['Чи потрібен use strict у коді з import/export?', 'Як поводиться function declaration у блоці в strict mode?']
    },
    {
      id: 'scope-function-in-block',
      group: 'global',
      type: 'quiz',
      level: 3,
      title: 'Function declaration усередині блоку',
      tags: ['hoisting', 'strict-mode'],
      question: `
Що виведе код **у sloppy mode** і **у strict mode**?

\`\`\`js
console.log(typeof greet);
if (true) {
  function greet() { return 'hi'; }
}
console.log(typeof greet);
\`\`\`
`,
      options: [
        'sloppy: `function function`; strict: `function function`',
        'sloppy: `undefined function`; strict: `undefined undefined`',
        'sloppy: `undefined undefined`; strict: `ReferenceError`',
        'sloppy: `function function`; strict: `undefined undefined`'
      ],
      answer: 1,
      why: [
        "У strict mode функція в блоці видна лише всередині блоку.",
        "Правильно: sloppy — назовні з'являється var-подібна змінна (undefined, потім функція); strict — функція блокова.",
        "У sloppy mode після виконання блоку greet стає доступною назовні.",
        "До входу в блок функція назовні ще не присвоєна — у sloppy там undefined."
      ],
      hint: 'У strict mode функція в блоці — блокова. У sloppy діють правила сумісності.',
      explanation: `
Поведінка різна в різних режимах — тому не оголошуйте функції в блоках, використовуйте \`const greet = () => ...\`.
`
    },
    {
      id: 'scope-nfe',
      group: 'global',
      type: 'quiz',
      level: 3,
      title: 'Named Function Expression: область імені',
      tags: ['functions', 'scope'],
      question: `
Ім'я у \`var f = function g() {}\` (named function expression) видно лише **всередині** функції, і його не можна перепризначити.

Що виведе код (sloppy mode)?

\`\`\`js
var f = function g() {
  g = 42;
  return typeof g;
};

console.log(f(), typeof g);
\`\`\`
`,
      options: ['`number number`', '`undefined undefined`', '`function function`', '`function undefined`', '`TypeError`'],
      answer: 3,
      why: [
        "Ім'я g — незмінне, `g = 42` у sloppy mode мовчки ігнорується.",
        "Усередині функції g видно — це вона сама.",
        "Ззовні ім'я g не видно, тож `typeof g` — «undefined».",
        "Правильно: всередині g — функція (присвоєння проігноровано), ззовні g немає.",
        "TypeError був би лише у strict mode при спробі перепризначити g."
      ],
      hint: 'Ім\'я NFE доступне лише всередині функції і є незмінним.',
      explanation: `
NFE зручне для рекурсії та стек-трейсів: ім'я надійно вказує на саму функцію, навіть якщо змінну \`f\` перепризначать.
`
    }
  ]
});
