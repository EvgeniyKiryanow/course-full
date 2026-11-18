FE.topic('js-errors', {
  intro: `
## try / catch / finally
\`\`\`js
try {
  risky();
} catch (err) {        // або catch { ... } без змінної (ES2019)
  handle(err);
  throw err;           // rethrow, якщо не можемо обробити
} finally {
  cleanup();           // виконується ЗАВЖДИ: після try, catch, return і throw
}
\`\`\`
- \`return\` у \`finally\` **перекриває** \`return\` і навіть \`throw\` з \`try/catch\` — не робіть так.
- Значення \`return x\` обчислюється **до** \`finally\`.
- \`try/catch\` ловить лише те, що кинуто **синхронно всередині блоку**. Колбек \`setTimeout\` чи обробник події виконається пізніше — зовнішній \`try\` вже не діє.

## Вбудовані типи помилок
| Тип | Коли |
|---|---|
| \`TypeError\` | значення не того типу: \`null.x\`, \`undefined()\`, присвоєння \`const\` |
| \`ReferenceError\` | неоголошена змінна, TDZ (\`let\` до оголошення) |
| \`RangeError\` | поза діапазоном: \`new Array(-1)\`, \`toFixed(101)\`, переповнення стеку |
| \`SyntaxError\` | \`JSON.parse('{')\`, \`eval\`/\`new Function\` |
| \`AggregateError\` | кілька помилок разом, поле \`errors\` |

Властивості: \`name\`, \`message\`, \`stack\`, \`cause\` (ES2022). \`message\` і \`stack\` неперелічувані → \`JSON.stringify(err)\` дає \`'{}'\`.

## Власні помилки
\`\`\`js
class HttpError extends Error {
  constructor(status, message, options) {
    super(message, options);       // options = { cause }
    this.name = 'HttpError';
    this.status = status;
  }
}
throw new HttpError(404, 'Not found', { cause: originalError });
if (err instanceof HttpError && err.status === 404) { /* ... */ }
\`\`\`
- Кидайте **лише \`Error\`** (або нащадків): у рядка немає \`stack\`, \`message\`, \`instanceof\` не працює.
- \`cause\` — ланцюжок причин без втрати оригіналу.

## Принципи
- **Fail fast:** перевіряйте вхід і кидайте помилку якомога раніше, з корисним повідомленням.
- Не «ковтайте» помилки (\`catch {}\`) — щонайменше логуйте.
- Ловіть там, де можете **осмислено обробити** (показати UI, fallback), інакше — rethrow.
- Очікувані помилки (валідація, 404) ≠ баги (TypeError).
- Помилки в асинхронному коді (проміси, \`await\`) — у темі js-async.
`,
  groups: [
    { id: 'error-object', title: 'Об\'єкт Error і вбудовані типи' },
    { id: 'try-catch', title: 'try / catch / finally' },
    { id: 'throw', title: 'throw: що кидати і як ловити невідоме' },
    { id: 'custom', title: 'Власні класи помилок' },
    { id: 'cause', title: 'cause і AggregateError' },
    { id: 'strategy', title: 'Де ловити: fail fast і глобальні обробники' },
    { id: 'debugging', title: 'Налагодження: DevTools і пошук багів' }
  ],
  items: [
    // ------------------------------------------------------------ Об'єкт Error і вбудовані типи
    {
      id: 'err-error-types-theory',
      group: 'error-object',
      type: 'theory',
      level: 1,
      title: 'Вбудовані типи помилок',
      tags: [
        'error-types'
      ],
      question: 'Які вбудовані типи помилок є в JavaScript і коли виникає кожен? Які властивості має об\'єкт Error?',
      choices: [
        '`null.x` кидає `ReferenceError`, а звернення до неоголошеної змінної — `TypeError`',
        'Звернення до `let` у TDZ дає `ReferenceError`, а нескінченна рекурсія — `RangeError`',
        '`JSON.parse(\'{bad}\')` повертає `undefined`, а `SyntaxError` буває лише при парсингу скрипта',
        'Присвоєння `const`-змінній кидає `SyntaxError`, а виклик не-функції `obj.fn()` — `RangeError`'
      ],
      answer: `
Усі вбудовані помилки успадковуються від \`Error\`:

- **\`TypeError\`** — значення не того типу: \`null.x\`, виклик не-функції, присвоєння \`const\`, \`new\` для стрілкової функції.
- **\`ReferenceError\`** — неоголошена змінна або \`let/const\` у TDZ.
- **\`RangeError\`** — поза діапазоном: \`new Array(-1)\`, \`(1).toFixed(101)\`, переповнення стеку.
- **\`SyntaxError\`** — невалідний синтаксис: парсинг скрипта (тоді він не виконується взагалі), \`eval\`, \`JSON.parse('{bad}')\`.
- **\`URIError\`** — \`decodeURIComponent('%')\`; **\`AggregateError\`** — контейнер для кількох помилок (\`errors\`).

\`\`\`js
try {
  JSON.parse(userInput);
} catch (err) {
  if (err instanceof SyntaxError) showError('Невалідний JSON');
  else throw err; // невідома помилка — не ковтаємо
}
\`\`\`

**Властивості:** \`name\`, \`message\`, \`stack\` (нестандартна, але є всюди), \`cause\` (ES2022).

**Практика:** \`TypeError\`/\`ReferenceError\` у продакшні — майже завжди **баг** (виправляти, а не ловити). \`SyntaxError\` від \`JSON.parse\`, мережеві помилки, валідація — **очікувані**, їх обробляють і показують користувачу.
`,
      correct: 1,
      why: [
        'Навпаки: `null.x` — TypeError (значення є, але «не того типу»), а неоголошена змінна — ReferenceError (значення немає взагалі).',
        'Так: звернення до `let` до оголошення (TDZ) — ReferenceError, а нескінченна рекурсія — RangeError: Maximum call stack size exceeded.',
        '`JSON.parse` на невалідному рядку кидає SyntaxError, а не повертає `undefined` — тому його й обгортають у try/catch.',
        'Обидва — TypeError: «Assignment to constant variable» і «obj.fn is not a function».'
      ],
      keyPoints: [
        'TypeError — не той тип (null.x, виклик не-функції, присвоєння const)',
        'ReferenceError — неоголошена змінна або TDZ',
        'RangeError — поза діапазоном, переповнення стеку',
        'SyntaxError — парсинг коду та JSON.parse',
        'Властивості: name, message, stack, cause'
      ],
      followUps: [
        'Чи можна зловити SyntaxError у власному скрипті через try/catch?',
        'Що таке TDZ?',
        'Як відрізнити баг від очікуваної помилки?'
      ]
    },
    {
      id: 'err-quiz-which-type-error',
      group: 'error-object',
      type: 'quiz',
      level: 1,
      title: 'Що кидає TypeError?',
      tags: [
        'error-types'
      ],
      question: 'Оберіть **усі** вирази, які кидають саме `TypeError`:',
      options: [
        '`null.foo`',
        '`console.log(undeclaredVariable)`',
        '`const a = 1; a = 2;`',
        '`new Array(-1)`',
        '`JSON.parse("{")`',
        '`Symbol("id") + ""`'
      ],
      answer: [0, 2, 5],
      why: [
        'Правильно: читання властивості `null` — TypeError: Cannot read properties of null.',
        'Ні: змінної взагалі не існує — це ReferenceError: undeclaredVariable is not defined.',
        'Правильно: присвоєння константі — TypeError: Assignment to constant variable.',
        'Ні: від\'ємна довжина — RangeError: Invalid array length.',
        'Ні: невалідний JSON — SyntaxError.',
        'Правильно: символ не перетворюється в рядок неявно — TypeError: Cannot convert a Symbol value to a string.'
      ],
      hint: 'TypeError — коли значення є, але воно «не того типу» для операції. Коли значення немає взагалі — інший тип помилки.',
      explanation: `
Правило: **значення є, але операція до нього не застосовна → TypeError**; значення/імені немає → ReferenceError; число поза межами → RangeError; невалідний текст коду/JSON → SyntaxError.
`
    },
    // ------------------------------------------------------------ try / catch / finally
    {
      id: 'err-try-catch-theory',
      group: 'try-catch',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'try/catch/finally: семантика і пастки',
      tags: [
        'try-catch',
        'finally'
      ],
      question: 'Як працює try/catch/finally? Коли виконується finally і що буде, якщо в ньому є return? Що таке optional catch binding? Які помилки try/catch не ловить? Оберіть **усі** правильні твердження.',
      choices: [
        '`finally` виконується, навіть коли в `try` спрацював `return` або в `catch` кинуто нову помилку',
        'Зміна змінної у `finally` змінює значення, яке вже повертає `return x` з блоку `try`',
        '`return` у `finally` перекриває результат `try` і мовчки проковтує кинуту помилку',
        '`try { setTimeout(() => JSON.parse(\'{\'), 0) } catch {}` не зловить помилку з колбека таймера',
        '`catch` без параметра — синтаксична помилка: ім\'я змінної для помилки обов\'язкове'
      ],
      answer: `
**Механіка:**
- \`try\` — код, що може кинути;
- \`catch (err)\` — виконується, якщо в \`try\` кинуто виняток; \`err\` — **будь-яке** кинуте значення;
- \`finally\` — виконується **завжди**: після \`try\`, після \`catch\`, навіть після \`return\`, \`break\` чи нового \`throw\`.

\`\`\`js
function loadSettings() {
  showSpinner();
  try {
    return JSON.parse(localStorage.getItem('settings')); // значення return обчислене ДО finally
  } catch (err) {
    throw new Error('Settings are corrupted', { cause: err });
  } finally {
    hideSpinner(); // і при return, і при throw
  }
}
\`\`\`

- **\`return\` у \`finally\`** перекриває і \`return\`, і кинуту помилку (вона зникає) — антипатерн.
- **Optional catch binding:** \`try { ... } catch { ... }\`.

**Що try/catch НЕ ловить:**
- помилки в колбеках, що виконаються пізніше (\`setTimeout\`, обробники подій) — \`try\` до того моменту вже завершився;
- \`SyntaxError\` у самому скрипті (він не парситься);
- асинхронні помилки промісів без \`await\` (тема js-async).

**Гігієна:** ловіть вузько; не ковтайте (\`catch {}\`); невідомі помилки — rethrow; кидання помилки дороге (збір стеку) — не використовуйте винятки для звичайного керування потоком.
`,
      correct: [0, 2, 3],
      why: [
        'Так: `finally` — це «прибирання», яке гарантовано виконується за будь-якого виходу з `try/catch`.',
        'Ні: вираз у `return x` обчислюється ДО `finally`; зміна змінної потім не впливає на вже зафіксоване значення.',
        'Так: `return` у `finally` замінює будь-яке завершення (і `return`, і `throw`) — тому це антипатерн (ESLint `no-unsafe-finally`).',
        'Так: колбек виконається пізніше, в окремій макрозадачі, коли блок `try` давно завершився.',
        'Ні: з ES2019 можна писати `catch { ... }` без змінної (optional catch binding), якщо сама помилка не потрібна.'
      ],
      keyPoints: [
        'finally виконується завжди, навіть після return і throw',
        'return у finally перекриває return і проковтує помилку — антипатерн',
        'Значення return обчислюється до finally',
        'catch без параметра — optional catch binding',
        'Не ловить: асинхронні колбеки, проміси без await, SyntaxError скрипта',
        'Ловити вузько, не ковтати, rethrow невідомих помилок'
      ],
      followUps: [
        'Що виведе функція з return у try і return у finally?',
        'Як зловити помилку з обробника події?',
        'Чи впливає try/catch на продуктивність?'
      ]
    },
    {
      id: 'err-quiz-finally-return',
      group: 'try-catch',
      type: 'quiz',
      level: 2,
      title: 'return у finally',
      tags: [
        'try-catch',
        'finally'
      ],
      question: `
Що виведе код?

\`\`\`js
function f() {
  try {
    return 'try';
  } finally {
    return 'finally';
  }
}

function g() {
  try {
    throw new Error('oops');
  } catch (e) {
    return 'catch';
  } finally {
    console.log('cleanup');
  }
}

console.log(f(), g());
\`\`\`
`,
      options: [
        '`try catch`, потім `cleanup`',
        '`cleanup`, потім `finally catch`',
        '`cleanup`, потім `try catch`',
        '`finally cleanup`'
      ],
      answer: 1,
      why: [
        'Ні: `return` у `finally` перекриває `return \'try\'`, і `cleanup` виводиться до головного `console.log`.',
        'Так: аргументи обчислюються першими — під час `g()` друкується `cleanup`; `f()` повертає `\'finally\'`, `g()` — `\'catch\'`.',
        'Ні: `cleanup` справді першим, але `f()` повертає `\'finally\'`, а не `\'try\'` — `return` у `finally` сильніший.',
        'Ні: `g()` повертає `\'catch\'`, а `cleanup` виводить окремий `console.log` усередині `finally`.'
      ],
      hint: 'Аргументи `console.log` обчислюються до виклику. І що сильніше — `return` з `try` чи з `finally`?',
      explanation: `
1. Обчислюються аргументи \`console.log\`: \`f()\` — \`return 'try'\` запам'ятовано, але \`finally\` повертає своє → \`'finally'\`.
2. \`g()\` — помилку зловлено, \`return 'catch'\` запам'ятовано, \`finally\` друкує \`cleanup\` (без \`return\` — результат не змінюється).
3. Лише тепер друкується \`finally catch\`.
`
    },
    {
      id: 'err-quiz-finally-swallow',
      group: 'try-catch',
      type: 'quiz',
      level: 3,
      title: 'finally проковтує помилку і значення return',
      tags: [
        'try-catch',
        'finally'
      ],
      question: `
Що виведе код?

\`\`\`js
function h() {
  try {
    throw new Error('A');
  } finally {
    return 'B';
  }
}

let x = 1;
function k() {
  try {
    return x;
  } finally {
    x = 2;
  }
}

console.log(h(), k(), x);
\`\`\`
`,
      options: [
        '`Uncaught Error: A`',
        '`B 2 2`',
        '`B 1 2`',
        '`B 1 1`'
      ],
      answer: 2,
      why: [
        'Ні: `return \'B\'` у `finally` замінює «завершення з помилкою» на звичайне повернення — помилка мовчки зникає.',
        'Ні: `return x` повертає ЗНАЧЕННЯ, обчислене до `finally` (1), а не змінну.',
        'Так: `h()` → `B` (помилку проковтнуто), `k()` → `1` (значення зафіксоване до `finally`), `x` після `finally` — `2`.',
        'Ні: `finally` у `k` таки виконався і змінив `x` на 2 — просто вже після обчислення `return`.'
      ],
      hint: 'У який момент обчислюється значення виразу в `return` — до чи після `finally`?',
      explanation: `
- \`h()\`: \`return\` у \`finally\` перекриває кинуту \`Error('A')\` — тому він небезпечний.
- \`k()\`: \`return x\` обчислюється **до** \`finally\` → повертається \`1\`; \`finally\` змінює лише змінну.
- \`x\` після виклику — \`2\`.
`
    },
    {
      id: 'err-quiz-async-not-caught',
      group: 'try-catch',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Що не ловить try/catch: колбек таймера',
      tags: [
        'try-catch',
        'timers'
      ],
      question: `
Що буде виведено **через \`console.log\`** (не враховуючи червоного повідомлення браузера про помилку)?

\`\`\`js
try {
  setTimeout(() => {
    throw new Error('late');
  }, 0);
  console.log('scheduled');
} catch (e) {
  console.log('caught', e.message);
}
console.log('end');
\`\`\`
`,
      options: [
        '`scheduled`, `caught late`, `end`',
        '`scheduled`, `end`',
        '`caught late`, `end`',
        '`scheduled`, `end`, `caught late`'
      ],
      answer: 1,
      why: [
        'Ні: усередині `try` нічого не кидається синхронно — `setTimeout` лише планує колбек на потім.',
        'Так: `try` завершився без помилок; колбек виконається пізніше, і його помилка стане «Uncaught Error: late».',
        'Ні: `scheduled` друкується одразу — виклик `setTimeout` не кидає і не зупиняє код.',
        'Ні: коли колбек кидає помилку, блок `try/catch` уже давно завершився — `catch` не «чекає» на таймер.'
      ],
      hint: 'Що саме відбувається всередині `try` в момент виклику `setTimeout` — колбек виконується чи лише планується?',
      explanation: `
\`try/catch\` ловить лише те, що кинуто **синхронно, поки виконується блок**. \`setTimeout\` лише ставить колбек у чергу; помилка \`late\` виникне пізніше, в іншій макрозадачі → потрапить у глобальний обробник (\`window.onerror\` / подія \`error\`).

Як зловити: \`try/catch\` **всередині** колбека. Те саме з обробниками подій: \`try\` навколо \`addEventListener\` не ловить помилки з обробника.
`
    },
    {
      id: 'err-safe-json-parse',
      group: 'try-catch',
      type: 'code',
      level: 1,
      title: 'safeJsonParse → [error, data]',
      tags: [
        'try-catch',
        'json'
      ],
      description: `
**Завдання.** Напишіть \`safeJsonParse(text)\`, яка **ніколи не кидає**, а повертає пару \`[error, data]\`.

**Де трапляється:** читання налаштувань із \`localStorage\`, даних із \`postMessage\` чи URL: рядок може бути зіпсований, а сторінка не повинна падати.

**Що написати**
- \`safeJsonParse(text)\` → \`[null, data]\`, якщо JSON валідний;
- \`[error, null]\`, якщо ні (\`error\` — оригінальна помилка \`JSON.parse\`, тобто \`SyntaxError\`).

**Приклад**
\`\`\`js
safeJsonParse('{"theme":"dark"}'); // [null, { theme: 'dark' }]
safeJsonParse('{bad');             // [SyntaxError, null]

const [err, config] = safeJsonParse(localStorage.getItem('config'));
if (err) useDefaults();
\`\`\`

**Як це працює:** \`JSON.parse\` на невалідному рядку синхронно кидає \`SyntaxError\`. Блок \`try { ... } catch (error) { ... }\` перехоплює виняток, кинутий будь-де всередині \`try\`: виконання переходить у \`catch\`, а не «вбиває» весь скрипт. Повертаючи помилку як значення, ми змушуємо викликача явно перевірити \`err\`.

**Врахуйте:**
- \`'null'\`, \`'42'\`, \`'"hi"'\` — валідний JSON (тож \`data\` може бути \`null\` — перевіряйте саме \`err\`);
- порожній рядок і \`undefined\` — помилка (\`JSON.parse(undefined)\` парсить рядок \`'undefined'\`).
`,
      starter: `function safeJsonParse(text) {
  // 1. Спробуйте розпарсити text у блоці try
  //    і поверніть [null, результат].
  // 2. У catch (error) поверніть [error, null].
  // TODO
}

// Спробуйте в консолі:
// safeJsonParse('{"a":1}');  // [null, { a: 1 }]
// safeJsonParse('{bad');     // [SyntaxError, null]
`,
      solution: `function safeJsonParse(text) {
  try {
    return [null, JSON.parse(text)];
  } catch (error) {
    return [error, null];
  }
}
`,
      hints: [
        'Усе, що може кинути, — лише `JSON.parse(text)`. Саме його й обгортайте в `try`.',
        'Структура: `try { return [null, JSON.parse(text)]; } catch (error) { ... }`.',
        'У `catch` поверніть `[error, null]` — саму помилку, щоб не втратити діагностику.'
      ],
      tests: [
        { name: 'валідний JSON', code: 'expect(safeJsonParse(\'{"a":1,"b":[true,null]}\')).toEqual([null, { a: 1, b: [true, null] }]);' },
        {
          name: 'невалідний JSON → SyntaxError, не кидає',
          code: 'let res;\nexpect(() => { res = safeJsonParse("{bad"); }).not.toThrow();\nexpect(res[0]).toBeInstanceOf(SyntaxError);\nexpect(res[1]).toBeNull();'
        },
        {
          name: 'примітиви JSON',
          code: 'expect(safeJsonParse("42")).toEqual([null, 42]);\nexpect(safeJsonParse("null")).toEqual([null, null]);\nexpect(safeJsonParse(\'"hi"\')).toEqual([null, "hi"]);'
        },
        {
          name: 'порожній рядок і undefined → помилка',
          code: 'expect(safeJsonParse("")[0]).toBeInstanceOf(SyntaxError);\nexpect(safeJsonParse(undefined)[0]).toBeInstanceOf(SyntaxError);'
        }
      ],
      explanation: `
Патерн «помилка як значення» (як у Go): викликач **змушений** подумати про помилку, а код без вкладених \`try/catch\` читається лінійно.

**Пастка:** \`safeJsonParse('null')\` → \`[null, null]\` — дані \`null\` валідні, тому перевіряйте \`err\`, а не \`data\`.

**Складність:** O(n) від довжини рядка.

**Типові помилки:** повертати \`undefined\` при помилці (не відрізнити від даних); \`catch\` без збереження помилки.

**Що можуть спитати далі:** додати валідацію схеми після парсингу; як зробити те саме для промісів (\`to(promise)\` — у темі js-async)?
`
    },
    // ------------------------------------------------------------ throw: що кидати і як ловити невідоме
    {
      id: 'err-quiz-using',
      group: 'try-catch',
      type: 'quiz',
      level: 3,
      title: 'using: автоматичне звільнення ресурсів',
      question: `
Що виведе код (Chrome 134+, Node 24)?

\`\`\`js
const log = [];
{
  using a = { [Symbol.dispose]() { log.push('a'); } };
  using b = { [Symbol.dispose]() { log.push('b'); } };
  log.push('body');
}
console.log(log.join(' '));
\`\`\`
`,
      options: [
        '`body b a` — звільнення у зворотному порядку',
        '`body a b` — у порядку оголошення',
        '`a b body` — dispose одразу після оголошення',
        '`body` — dispose треба викликати вручну'
      ],
      answer: 0,
      why: [
        'Так: перевірено в Node 24 — як стек, останній отриманий ресурс звільняється першим.',
        'Ні: порядок зворотний, бо пізніший ресурс може залежати від ранішого.',
        'Ні: dispose викликається при виході з блоку.',
        'Ні: саме для цього `using` і створено.'
      ],
      hint: 'Це заміна якої конструкції з цього модуля?',
      explanation: '`using` — синтаксичний цукор над `try/finally`: `[Symbol.dispose]()` викликається при виході з блоку навіть після `throw` або `return`. Для асинхронного звільнення — `await using` і `[Symbol.asyncDispose]()` (закрити з\'єднання, файл). `DisposableStack` збирає кілька ресурсів. Підтримка свіжа (Chrome 134+, Node 24) — у Safari перевіряйте, TypeScript підтримує з 5.2.',
      followUps: ['Чим using відрізняється від try/finally?', 'Що станеться, якщо dispose сам кине помилку?']
    },
    {
      id: 'err-quiz-throw-string',
      group: 'throw',
      type: 'quiz',
      level: 2,
      title: 'Кидаємо рядок замість Error',
      tags: [
        'custom-errors'
      ],
      question: `
Що виведе код?

\`\`\`js
try {
  throw 'Something went wrong';
} catch (e) {
  console.log(e instanceof Error, e.message, typeof e);
}
\`\`\`
`,
      options: [
        '`true Something went wrong object`',
        '`false Something went wrong string`',
        '`false undefined string`',
        '`TypeError: throw expects an Error`'
      ],
      answer: 2,
      why: [
        'Ні: `throw` нічого не перетворює — рядок не стає об\'єктом `Error`.',
        'Ні: у рядка немає властивості `message`, тому `e.message` — `undefined`.',
        'Так: у `catch` потрапляє той самий рядок: не `Error`, без `message`, `typeof` — `\'string\'`.',
        'Ні: `throw` приймає будь-яке значення — помилки тут немає, це просто погана практика.'
      ],
      hint: '`throw` не перетворює значення ні на що — `catch` отримує рівно те, що кинули.',
      explanation: `
\`throw\` приймає **будь-яке** значення і передає його в \`catch\` як є. Наслідки \`throw 'рядок'\`: немає стеку викликів, \`err.message\` ламається, моніторинг не групує помилки.

Тому **кидаємо** лише \`new Error(...)\`, а **ловимо** захисно: сторонній код може кинути що завгодно.
`
    },
    {
      id: 'err-get-error-message',
      group: 'throw',
      type: 'code',
      level: 1,
      title: 'getErrorMessage: текст для тосту з будь-якої помилки',
      tags: [
        'try-catch',
        'defensive'
      ],
      description: `
**Завдання.** Напишіть \`getErrorMessage(err, fallback)\`, яка з **будь-якого** значення, що прилетіло в \`catch\`, дістає текст для показу користувачу.

**Де трапляється:** у кожному застосунку є місце \`catch (err) { toast(getErrorMessage(err)) }\`. У \`catch\` може прилетіти що завгодно: \`Error\`, рядок від сторонньої бібліотеки, об'єкт відповіді API \`{ message, code }\`, навіть \`undefined\`.

**Що написати**
- \`getErrorMessage(err, fallback = 'Щось пішло не так')\` → рядок:
  - \`err instanceof Error\` → \`err.message\`;
  - рядок → він сам;
  - об'єкт з рядковою властивістю \`message\` → \`err.message\`;
  - будь-що інше → \`fallback\`;
  - порожнє повідомлення (\`''\`) → \`fallback\`.

**Приклад**
\`\`\`js
getErrorMessage(new TypeError('Failed to fetch')); // 'Failed to fetch'
getErrorMessage('Невірний пароль');                // 'Невірний пароль'
getErrorMessage({ message: 'Email зайнятий', code: 409 }); // 'Email зайнятий'
getErrorMessage(null);                             // 'Щось пішло не так'
getErrorMessage(42, 'Помилка');                    // 'Помилка'
\`\`\`

**Як це працює:** \`throw\` може кинути **будь-яке** значення, і \`catch\` отримує його як є — без перетворення на \`Error\`. Тому в \`catch\` не можна сліпо писати \`err.message\`: для \`null\`/\`undefined\` це впаде з \`TypeError\`, для рядка дасть \`undefined\`. Спершу перевіряємо тип: \`instanceof Error\`, \`typeof === 'string'\`, \`typeof === 'object'\`.

**Врахуйте:** \`typeof null === 'object'\` — перевіряйте \`null\` окремо; \`{ message: 5 }\` — не рядок → \`fallback\`.
`,
      starter: `function getErrorMessage(err, fallback = 'Щось пішло не так') {
  // 1. Error (і нащадки: TypeError, власні класи) → err.message
  // 2. Рядок → сам рядок
  // 3. Об'єкт (не null!) з рядковим message → err.message
  // 4. Інакше, а також для порожнього тексту → fallback
  // TODO
}

// Спробуйте в консолі:
// try { null.x } catch (e) { getErrorMessage(e) }  // "Cannot read properties of null..."
// getErrorMessage(undefined)                       // 'Щось пішло не так'
`,
      solution: `function getErrorMessage(err, fallback = 'Щось пішло не так') {
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'string') return err || fallback;
  // typeof null === 'object', тому null відсікаємо явно
  if (err !== null && typeof err === 'object' && typeof err.message === 'string' && err.message) {
    return err.message;
  }
  return fallback;
}
`,
      hints: [
        'Перевіряйте типи по черзі й одразу повертайте: `if (err instanceof Error) return ...`.',
        'Для порожнього тексту зручно `return err.message || fallback` — порожній рядок falsy.',
        'Об\'єкт: `err !== null && typeof err === \'object\' && typeof err.message === \'string\'`.'
      ],
      tests: [
        {
          name: 'Error і нащадки → message',
          code: 'expect(getErrorMessage(new Error("Нема мережі"))).toBe("Нема мережі");\nexpect(getErrorMessage(new TypeError("Failed to fetch"))).toBe("Failed to fetch");'
        },
        { name: 'рядок повертається як є', code: 'expect(getErrorMessage("Невірний пароль")).toBe("Невірний пароль");' },
        { name: 'об\'єкт з message (відповідь API)', code: 'expect(getErrorMessage({ message: "Email зайнятий", code: 409 })).toBe("Email зайнятий");' },
        { name: 'невідомі значення → fallback', code: '[null, undefined, 42, {}, { message: 5 }, true].forEach((v) => expect(getErrorMessage(v, "X")).toBe("X"));' },
        {
          name: 'порожнє повідомлення → fallback',
          code: 'expect(getErrorMessage(new Error(""), "X")).toBe("X");\nexpect(getErrorMessage("", "X")).toBe("X");\nexpect(getErrorMessage({ message: "" }, "X")).toBe("X");'
        },
        {
          name: 'fallback за замовчуванням',
          code: 'expect(getErrorMessage(null)).toBe("Щось пішло не так");\nexpect(() => getErrorMessage(undefined)).not.toThrow();'
        }
      ],
      explanation: `
\`catch\` отримує **будь-яке** кинуте значення, тому код обробки має бути захисним: спершу з'ясувати, що це, потім діставати текст. У TypeScript \`err\` у \`catch\` має тип \`unknown\` саме з цієї причини.

**Складність:** O(1).

**Типові помилки:** \`err.message\` без перевірки (падає на \`null\`, дає \`undefined\` для рядка); забути, що \`typeof null === 'object'\`; показувати користувачу технічні тексти багів.

**Що можуть спитати далі:** як не показувати внутрішні повідомлення (\`TypeError\`) користувачу, а замінювати на загальне? Як мапити коди помилок API на переклади?
`
    },
    // ------------------------------------------------------------ Власні класи помилок
    {
      id: 'err-custom-errors-theory',
      group: 'custom',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Власні класи помилок, cause, AggregateError',
      tags: [
        'custom-errors',
        'cause'
      ],
      question: 'Як створити власний клас помилки і навіщо? Чому не варто кидати рядки чи об\'єкти? Що таке error.cause і AggregateError? Оберіть **усі** правильні твердження.',
      choices: [
        '`throw \'Not found\'` рівноцінний `throw new Error(\'Not found\')`: рядок теж має `stack` і `message`',
        'Власний клас `extends Error` дає змогу розрізняти помилки через `instanceof` і додати поля як `status`',
        'У нащадку `Error` можна не викликати `super(message)` — `message` і `name` підставляться самі',
        '`new Error(\'msg\', { cause: err })` обгортає низькорівневу помилку, не втрачаючи оригіналу',
        '`AggregateError` зливає стеки кількох помилок в одне поле `stack`, а масиву `errors` не має'
      ],
      answer: `
**Навіщо:** розрізняти **види** помилок і обробляти по-різному (підсвітити поле при валідації, редірект на логін при 401) і додавати контекст (\`status\`, \`field\`).

\`\`\`js
class AppError extends Error {
  constructor(message, options) {
    super(message, options);     // options: { cause }
    this.name = new.target.name; // 'ValidationError' для нащадків
  }
}
class ValidationError extends AppError {
  constructor(field, message) {
    super(message);
    this.field = field;
  }
}

try {
  validateForm(form);
} catch (err) {
  if (err instanceof ValidationError) highlight(err.field, err.message);
  else throw err; // невідоме — далі
}
\`\`\`
- обов'язково \`super(message)\` і \`name\` (інакше в логах буде \`Error\`);
- \`instanceof\` працює завдяки \`extends\`; \`stack\` заповнюється автоматично;
- між iframe/воркерами \`instanceof\` ненадійний — додають поле \`code\`.

**Чому не \`throw 'рядок'\`:** немає \`stack\`, \`message\`, \`instanceof Error\` → \`false\`, Sentry пише «Non-Error exception».

**\`cause\`** — обгортаємо низькорівневу помилку в зрозумілу для свого шару: \`throw new Error('Не вдалося зберегти', { cause: err })\`.

**\`AggregateError\`** — кілька помилок одним об'єктом: \`new AggregateError([e1, e2], 'Batch failed')\`, поле \`errors\`. Зручний для валідації форми чи пакетної обробки.
`,
      correct: [1, 3],
      why: [
        'Ні: у рядка немає `stack` і `message`, а `instanceof Error` дає `false` — кидайте лише `Error` та нащадків.',
        'Так: `extends Error` дає `instanceof`-перевірку для різної обробки і місце для полів (`status`, `field`).',
        'Ні: у класі-нащадку `super()` обов\'язковий до `this`, а без `super(message)` повідомлення не буде; `name` теж треба задати самому.',
        'Так: `cause` (ES2022) зберігає оригінальну помилку всередині нової — ланцюжок причин не губиться.',
        'Ні: `AggregateError` зберігає помилки в масиві `errors`, кожна зі своїм стеком.'
      ],
      keyPoints: [
        'Власні класи: extends Error, super(message, options), name, додаткові поля',
        'Розрізнення через instanceof (або code для крос-контекстних помилок)',
        'Кидати лише Error: рядки без stack, message, instanceof',
        'cause — обгортання помилок зі збереженням оригіналу',
        'AggregateError — кілька помилок, поле errors'
      ],
      followUps: [
        'Чому в старому Babel (ES5) instanceof для нащадків Error не працював?',
        'Як серіалізувати помилку в JSON (message і stack неперелічувані)?',
        'Як побудувати ієрархію помилок для API-клієнта?'
      ]
    },
    {
      id: 'err-invariant',
      group: 'custom',
      type: 'code',
      level: 1,
      title: 'invariant(condition, message) — fail fast',
      tags: [
        'custom-errors',
        'defensive'
      ],
      description: `
**Завдання.** Напишіть клас \`InvariantError\` і функцію-перевірку \`invariant(condition, message)\`, яка кидає помилку, якщо умова хибна.

**Де трапляється:** перевірки «цього не може бути» на вході функцій (\`tiny-invariant\`, вихідний код React). Краще впасти одразу з чітким повідомленням, ніж отримати незрозумілий \`TypeError\` десятьма викликами пізніше.

**Що написати**
- \`class InvariantError extends Error\` — \`name === 'InvariantError'\`;
- \`invariant(condition, message)\` → нічого не повертає; якщо \`condition\` **falsy** — кидає \`InvariantError\` з \`message\`;
- \`message\` може бути **функцією** — тоді її викликають лише при провалі (дорогий опис не рахується даремно).

**Приклад**
\`\`\`js
invariant(user, 'user is required');           // ок, якщо user є
invariant(amount > 0, () => 'bad amount: ' + JSON.stringify(order));
invariant(0, 'zero');  // throws InvariantError: zero
\`\`\`

**Як це працює:** \`class X extends Error\` успадковує \`message\` і \`stack\`; у конструкторі спершу \`super(message)\` (він створює сам об'єкт помилки), потім можна писати \`this.name = ...\`. \`name\` використовується в \`String(err)\` і консолі: \`InvariantError: zero\`.

**Врахуйте:** усі falsy (\`0\`, \`''\`, \`null\`, \`undefined\`, \`NaN\`) — провал; функцію-повідомлення не викликати при успіху.
`,
      starter: `class InvariantError extends Error {
  constructor(message) {
    // 1. Передайте message батьківському Error через super(...)
    // 2. Задайте this.name = 'InvariantError'
  }
}

function invariant(condition, message) {
  // 1. Якщо condition truthy — просто вийти
  // 2. Інакше визначити текст: message може бути функцією
  // 3. Кинути new InvariantError(text)
  // TODO
}

// Спробуйте в консолі:
// invariant(1 > 0, 'ok');      // нічого
// invariant('', 'empty');      // InvariantError: empty
`,
      solution: `class InvariantError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvariantError';
  }
}

function invariant(condition, message) {
  if (condition) return;
  // повідомлення обчислюємо лише коли воно справді потрібне
  const text = typeof message === 'function' ? message() : message;
  throw new InvariantError(text);
}
`,
      hints: [
        'У конструкторі: `super(message); this.name = \'InvariantError\';` — саме в такому порядку.',
        'Перша рядок `invariant`: `if (condition) return;` — так покриваються всі falsy.',
        'Текст: `typeof message === \'function\' ? message() : message`, потім `throw new InvariantError(text)`.'
      ],
      tests: [
        {
          name: 'truthy умова — без помилки',
          code: 'expect(() => invariant(true, "x")).not.toThrow();\nexpect(() => invariant(1, "x")).not.toThrow();\nexpect(invariant("ok", "x")).toBeUndefined();'
        },
        {
          name: 'falsy умова → InvariantError',
          code: 'let err;\ntry { invariant(false, "must be true"); } catch (e) { err = e; }\nexpect(err).toBeInstanceOf(InvariantError);\nexpect(err).toBeInstanceOf(Error);\nexpect(err.name).toBe("InvariantError");\nexpect(err.message).toBe("must be true");'
        },
        { name: 'усі falsy значення — провал', code: '[0, "", null, undefined, NaN].forEach((v) => expect(() => invariant(v, "bad")).toThrow(InvariantError));' },
        {
          name: 'лінивий message-функція',
          code: 'const msg = mockFn(() => "computed");\ninvariant(true, msg);\nexpect(msg).not.toHaveBeenCalled();\nexpect(() => invariant(false, msg)).toThrow("computed");\nexpect(msg).toHaveBeenCalledTimes(1);'
        }
      ],
      explanation: `
**Fail fast**: перевіряємо припущення на вході й падаємо з чітким повідомленням. Окремий клас відрізняє «порушення контракту» (баг) від очікуваних помилок.

**Лінивий message** — не витрачаємо \`JSON.stringify\` на кожному успішному виклику.

**Складність:** O(1).

**Типові помилки:** \`if (condition === false)\` — пропускає інші falsy; обчислення повідомлення до перевірки.

**Що можуть спитати далі:** чим invariant відрізняється від валідації вводу користувача (баг vs очікувана ситуація)? Чи прибирати такі перевірки з продакшн-збірки?
`
    },
    {
      id: 'err-error-hierarchy',
      group: 'custom',
      type: 'code',
      level: 2,
      title: 'Ієрархія помилок: ValidationError, HttpError, NotFoundError',
      tags: [
        'custom-errors',
        'classes'
      ],
      description: `
**Завдання.** Побудуйте ієрархію помилок для API-клієнта: базову \`AppError\` і три нащадки.

**Де трапляється:** класика співбесід і реальні проєкти — API-шар кидає \`NotFoundError\`/\`HttpError\`, форма — \`ValidationError\`, а UI обробляє їх по-різному через \`instanceof\`.

**Що написати**
- \`AppError extends Error\` — \`constructor(message, options)\`, передає \`options\` (з \`cause\`) у \`super\`; \`name\` = ім'я **конкретного** класу;
- \`ValidationError extends AppError\` — \`constructor(field, message, options)\`, поле \`field\`;
- \`HttpError extends AppError\` — \`constructor(status, message, options)\`, поле \`status\`; без \`message\` → \`'HTTP <status>'\`;
- \`NotFoundError extends HttpError\` — \`constructor(resource, options)\`: \`status = 404\`, \`message = '<resource> not found'\`, поле \`resource\`.

**Приклад**
\`\`\`js
const err = new NotFoundError('User');
err instanceof HttpError; // true
err.status;               // 404
String(err);              // 'NotFoundError: User not found'
new HttpError(500).message; // 'HTTP 500'
\`\`\`

**Як це працює:** \`super(message, options)\` у \`Error\` встановлює \`message\`, \`stack\` і \`cause\` (якщо \`options.cause\` є). \`new.target\` — клас, через який викликали \`new\`, тому \`this.name = new.target.name\` у базовому класі дає правильне ім'я для кожного нащадка без повторення коду.

**Врахуйте:** \`cause\` має прокидатися на всіх рівнях; різні гілки не плутаються (\`ValidationError\` — не \`HttpError\`).
`,
      starter: `class AppError extends Error {
  constructor(message, options) {
    // 1. super(message, options) — так з'являться message, stack і cause
    // 2. this.name = ім'я конкретного класу (підказка: new.target)
  }
}

class ValidationError extends AppError {
  // TODO: constructor(field, message, options) + поле field
}

class HttpError extends AppError {
  // TODO: constructor(status, message = ..., options) + поле status
}

class NotFoundError extends HttpError {
  // TODO: constructor(resource, options): 404, '<resource> not found', поле resource
}

// Спробуйте в консолі:
// String(new NotFoundError('User')); // 'NotFoundError: User not found'
`,
      solution: `class AppError extends Error {
  constructor(message, options) {
    super(message, options); // options = { cause } — ES2022
    // new.target — клас, через який викликали new, тому name коректний для нащадків
    this.name = new.target.name;
  }
}

class ValidationError extends AppError {
  constructor(field, message, options) {
    super(message, options);
    this.field = field;
  }
}

class HttpError extends AppError {
  constructor(status, message = 'HTTP ' + status, options) {
    super(message, options);
    this.status = status;
  }
}

class NotFoundError extends HttpError {
  constructor(resource, options) {
    super(404, resource + ' not found', options);
    this.resource = resource;
  }
}
`,
      hints: [
        'У конструкторі нащадка спершу `super(...)`, лише потім `this.поле = ...`.',
        'Щоб не задавати `name` у кожному класі, в `AppError` напишіть `this.name = new.target.name`.',
        'Параметр за замовчуванням може використовувати попередні: `constructor(status, message = \'HTTP \' + status, options)`. `NotFoundError` викликає `super(404, resource + \' not found\', options)`.'
      ],
      tests: [
        {
          name: 'ValidationError',
          code: 'const e = new ValidationError("email", "Invalid email");\nexpect(e).toBeInstanceOf(ValidationError);\nexpect(e).toBeInstanceOf(AppError);\nexpect(e).toBeInstanceOf(Error);\nexpect(e.name).toBe("ValidationError");\nexpect(e.message).toBe("Invalid email");\nexpect(e.field).toBe("email");'
        },
        {
          name: 'HttpError з повідомленням за замовчуванням',
          code: 'const e = new HttpError(500);\nexpect(e.message).toBe("HTTP 500");\nexpect(e.status).toBe(500);\nexpect(e.name).toBe("HttpError");\nexpect(new HttpError(503, "Maintenance").message).toBe("Maintenance");'
        },
        {
          name: 'NotFoundError',
          code: 'const e = new NotFoundError("User");\nexpect(e).toBeInstanceOf(HttpError);\nexpect(e.status).toBe(404);\nexpect(e.resource).toBe("User");\nexpect(e.message).toBe("User not found");\nexpect(String(e)).toBe("NotFoundError: User not found");'
        },
        {
          name: 'cause передається',
          code: 'const orig = new TypeError("Failed to fetch");\nexpect(new HttpError(502, "Bad gateway", { cause: orig }).cause).toBe(orig);\nexpect(new NotFoundError("Post", { cause: orig }).cause).toBe(orig);\nexpect(new ValidationError("x", "bad", { cause: orig }).cause).toBe(orig);'
        },
        {
          name: 'є stack і різні класи не плутаються',
          code: 'const e = new ValidationError("a", "b");\nexpect(typeof e.stack).toBe("string");\nexpect(e instanceof HttpError).toBe(false);\nexpect(new AppError("x").name).toBe("AppError");'
        }
      ],
      explanation: `
\`extends Error\` + \`super(message, options)\` дають \`message\`, \`stack\` і \`cause\` «з коробки», а \`new.target.name\` задає \`name\` для всіх нащадків. Ієрархія дозволяє ловити на потрібному рівні: \`instanceof HttpError\` — усі HTTP-помилки, \`instanceof NotFoundError\` — лише 404.

**Нюанси:** мініфікатор може перейменувати класи (\`name\` стане \`'t'\`) — у продакшні \`name\` часто задають рядком; \`JSON.stringify(err)\` не бачить \`message\`/\`stack\` (неперелічувані).

**Що можуть спитати далі:** як централізовано обробляти ці помилки (мапа клас → дія); як API-клієнт перетворює відповідь 404 на \`NotFoundError\`?
`
    },
    // ------------------------------------------------------------ cause і AggregateError
    {
      id: 'err-quiz-cause-json',
      group: 'cause',
      type: 'quiz',
      level: 2,
      title: 'cause і JSON.stringify(error)',
      tags: [
        'cause',
        'serialization'
      ],
      question: `
\`new Error(message, { cause })\` (ES2022) зберігає оригінальну помилку у властивості \`cause\` — так кожен шар додає контекст, не втрачаючи причини.

Що виведе код?

\`\`\`js
const original = new TypeError('Failed to fetch');
const err = new Error('Load failed', { cause: original });

console.log(err.cause === original, err.cause.name, JSON.stringify(err));
\`\`\`
`,
      options: [
        '`false TypeError {}`',
        '`true TypeError {"message":"Load failed"}`',
        '`true TypeError {}`',
        '`true Error {"cause":{}}`'
      ],
      answer: 2,
      why: [
        'Ні: `cause` зберігає саме переданий об\'єкт, не копію — порівняння дає `true`.',
        'Ні: `message` у `Error` — неперелічувана власна властивість, `JSON.stringify` її не бачить.',
        'Так: `cause` — той самий об\'єкт `TypeError`, а `message`, `stack` і `cause` неперелічувані, тому JSON — `{}`.',
        'Ні: `err.cause.name` — ім\'я причини (`TypeError`), і `cause` теж неперелічувана, тож у JSON її немає.'
      ],
      hint: '`JSON.stringify` бере лише власні **перелічувані** властивості. Які властивості `Error` такі?',
      explanation: `
\`message\`, \`stack\` і \`cause\` створюються як **неперелічувані** властивості, тому \`JSON.stringify(err)\` → \`'{}'\`. Практичний наслідок: щоб надіслати помилку в лог/на сервер, копіюйте поля явно:

\`\`\`js
const toJSON = (e) => ({ name: e.name, message: e.message, stack: e.stack, cause: e.cause && toJSON(e.cause) });
\`\`\`
`
    },
    {
      id: 'err-run-batch',
      group: 'cause',
      type: 'code',
      level: 2,
      title: 'Масовий імпорт: зібрати помилки всіх рядків',
      tags: [
        'aggregate-error',
        'try-catch'
      ],
      description: `
**Завдання.** Обробіть кожен елемент списку функцією, яка може кинути, і **не зупиняйтеся на першій помилці**: зберіть результати й усі помилки.

**Де трапляється:** імпорт CSV/Excel, масова валідація рядків таблиці, збереження кількох налаштувань — користувач хоче побачити звіт «рядки 2 і 5 невалідні», а не першу помилку.

**Що написати**
- \`processAll(items, fn)\` → \`{ results, errors }\`:
  - \`results[i]\` — результат \`fn(items[i], i)\` або \`undefined\`, якщо впав;
  - \`errors\` — масив \`{ index, error }\` у порядку індексів;
  - ніколи не кидає.
- \`processAllOrThrow(items, fn)\` → масив результатів, якщо все успішно; інакше кидає \`AggregateError\`: \`errors\` — помилки по порядку, \`message\` — \`'<впало> of <усього> items failed'\`.

**Приклад**
\`\`\`js
const parseRow = (row) => {
  if (!row.includes(';')) throw new Error('bad row: ' + row);
  return row.split(';');
};
processAll(['a;1', 'oops', 'b;2'], parseRow);
// { results: [['a','1'], undefined, ['b','2']],
//   errors: [{ index: 1, error: Error('bad row: oops') }] }

processAllOrThrow(['a;1', 'oops'], parseRow);
// throws AggregateError: '1 of 2 items failed', err.errors = [Error('bad row: oops')]
\`\`\`

**Як це працює:** \`try/catch\` **всередині** циклу ізолює кожну ітерацію: помилка одного елемента потрапляє в \`catch\`, а цикл іде далі. \`AggregateError(errors, message)\` — вбудований клас (ES2021), що несе масив помилок одним винятком.

**Врахуйте:** порожній список; кинуто може бути не лише \`Error\` (рядок теж зберігаємо як є); \`fn\` отримує \`(item, index)\`.
`,
      starter: `function processAll(items, fn) {
  const results = [];
  const errors = [];
  // 1. Пройдіть по items з індексом.
  // 2. Для кожного: try { results[i] = fn(item, i) }
  //    catch (error) { results[i] = undefined; errors.push({ index: i, error }) }
  // TODO
  return { results, errors };
}

function processAllOrThrow(items, fn) {
  // 1. Викличте processAll.
  // 2. Якщо є помилки — throw new AggregateError(масив помилок, '<n> of <total> items failed').
  // 3. Інакше поверніть results.
  // TODO
}

// Спробуйте в консолі:
// processAll(['1', 'x'], (s) => { if (isNaN(s)) throw new Error('NaN: ' + s); return Number(s); });
`,
      solution: `function processAll(items, fn) {
  const results = [];
  const errors = [];
  items.forEach((item, index) => {
    // try всередині циклу: одна помилка не зупиняє обробку решти
    try {
      results[index] = fn(item, index);
    } catch (error) {
      results[index] = undefined;
      errors.push({ index, error });
    }
  });
  return { results, errors };
}

function processAllOrThrow(items, fn) {
  const { results, errors } = processAll(items, fn);
  if (errors.length > 0) {
    throw new AggregateError(
      errors.map((e) => e.error),
      errors.length + ' of ' + items.length + ' items failed'
    );
  }
  return results;
}
`,
      hints: [
        'Якщо обгорнути в `try` весь цикл, перша ж помилка його перерве. Де має стояти `try`?',
        '`try/catch` усередині `forEach((item, index) => { ... })`: успіх → `results[index] = ...`, помилка → `errors.push({ index, error })`.',
        'Для другої функції: `throw new AggregateError(errors.map((e) => e.error), errors.length + \' of \' + items.length + \' items failed\')`.'
      ],
      tests: [
        { name: 'усі успішні', code: 'expect(processAll(["1", "2", "3"], (s) => Number(s))).toEqual({ results: [1, 2, 3], errors: [] });' },
        {
          name: 'збирає помилки з індексами',
          code: 'const parse = (row) => { if (!row.includes(";")) throw new Error("bad row: " + row); return row.split(";"); };\nconst r = processAll(["a;1", "oops", "b;2", "x"], parse);\nexpect(r.results).toEqual([["a", "1"], undefined, ["b", "2"], undefined]);\nexpect(r.errors.map((e) => e.index)).toEqual([1, 3]);\nexpect(r.errors[0].error.message).toBe("bad row: oops");'
        },
        {
          name: 'обробляє всі елементи після помилки і передає індекс',
          code: 'const fn = mockFn((x) => { if (x === 1) throw new Error("x"); return x; });\nprocessAll([1, 2, 3], fn);\nexpect(fn).toHaveBeenCalledTimes(3);\nexpect(fn).toHaveBeenCalledWith(3, 2);'
        },
        {
          name: 'не-Error значення зберігаються як є',
          code: 'const r = processAll([1], () => { throw "str"; });\nexpect(r.errors).toEqual([{ index: 0, error: "str" }]);'
        },
        { name: 'processAllOrThrow: успіх', code: 'expect(processAllOrThrow(["a", "b"], (s) => s.toUpperCase())).toEqual(["A", "B"]);' },
        {
          name: 'processAllOrThrow: AggregateError',
          code: 'const e1 = new Error("x"), e2 = new Error("y");\nconst fns = [() => { throw e1; }, () => 1, () => { throw e2; }];\nlet err;\ntry { processAllOrThrow(fns, (f) => f()); } catch (e) { err = e; }\nexpect(err).toBeInstanceOf(AggregateError);\nexpect(err.errors).toEqual([e1, e2]);\nexpect(err.message).toBe("2 of 3 items failed");'
        },
        {
          name: 'порожній список',
          code: 'expect(processAll([], () => 1)).toEqual({ results: [], errors: [] });\nexpect(processAllOrThrow([], () => 1)).toEqual([]);'
        }
      ],
      explanation: `
Пакетні операції — випадок, коли **fail-fast шкодить**: користувач хоче знати всі проблемні рядки, а не першу. \`try/catch\` всередині циклу ізолює ітерації, а \`AggregateError\` — стандартний спосіб віддати кілька помилок одним винятком.

**Складність:** O(n).

**Типові помилки:** \`try\` навколо всього циклу (зупиняється на першій помилці); \`results.push\` (зсуваються індекси, коли елемент впав); звичайний \`Error\` замість \`AggregateError\` (губляться деталі).

**Що можуть спитати далі:** як повторити лише невдалі рядки; як те саме зробити для асинхронних задач (\`Promise.allSettled\` — тема js-async)?
`
    },
    {
      id: 'err-wrap-error-chain',
      group: 'cause',
      type: 'code',
      level: 3,
      title: 'Ланцюжок причин: wrapError, getErrorChain, findCause',
      tags: [
        'cause',
        'custom-errors'
      ],
      description: `
**Завдання.** Напишіть три утиліти для ланцюжка причин \`error.cause\`: обгорнути помилку, отримати всі повідомлення ланцюжка і знайти в ньому помилку потрібного типу.

**Де трапляється:** логування й моніторинг: UI показує «Не вдалося відкрити сторінку», а в лог іде весь ланцюжок до кореня \`TypeError: Failed to fetch\`. \`findCause\` — щоб, наприклад, не показувати помилку, якщо корінь — скасування.

**Що написати**
- \`wrapError(err, message)\` → **новий** \`Error\` з \`message\` і \`cause === err\`;
- \`getErrorChain(err)\` → масив повідомлень від зовнішньої помилки до кореня:
  - для об'єктів з \`message\` — \`message\`, для інших значень — \`String(value)\`;
  - йде по \`cause\`, поки \`cause !== undefined\`;
  - **захищена від циклів** (кожну помилку — один раз);
- \`findCause(err, ErrorClass)\` → перша помилка ланцюжка (включно з \`err\`), що \`instanceof ErrorClass\`, або \`null\`.

**Приклад**
\`\`\`js
const net = new TypeError('Failed to fetch');
const err = wrapError(wrapError(net, 'Load profile'), 'Render page');
getErrorChain(err);        // ['Render page', 'Load profile', 'Failed to fetch']
findCause(err, TypeError); // net
findCause(err, RangeError); // null
\`\`\`

**Як це працює:** \`new Error(message, { cause })\` (ES2022) зберігає причину у властивості \`cause\`. Ланцюжок — це зв'язний список: \`err → err.cause → err.cause.cause…\`. Обхід — цикл \`while\`; від циклів (\`a.cause = b; b.cause = a\`) захищає \`Set\` уже відвіданих.

**Врахуйте:** \`cause\` може бути рядком, числом або \`null\` (\`String(null)\` → \`'null'\`); у примітива далі йти нікуди.
`,
      starter: `function wrapError(err, message) {
  // TODO: new Error(message, { cause: ... })
}

function getErrorChain(err) {
  const chain = [];
  const seen = new Set();
  let current = err;
  // 1. Поки current !== undefined і ще не відвіданий:
  //    - додати в seen
  //    - chain.push(повідомлення: message для об'єктів, String(...) для решти)
  //    - перейти до current.cause (у примітивів — зупинитись)
  // TODO
  return chain;
}

function findCause(err, ErrorClass) {
  // TODO: той самий обхід; повернути першу current instanceof ErrorClass, інакше null
}

// Спробуйте в консолі:
// getErrorChain(wrapError(new TypeError('net'), 'outer')); // ['outer', 'net']
`,
      solution: `function wrapError(err, message) {
  return new Error(message, { cause: err });
}

function getErrorChain(err) {
  const chain = [];
  const seen = new Set();
  let current = err;
  while (current !== undefined && !seen.has(current)) {
    seen.add(current);
    const isObject = current !== null && typeof current === 'object';
    chain.push(isObject && 'message' in current ? current.message : String(current));
    current = isObject ? current.cause : undefined; // у примітивів причини немає
  }
  return chain;
}

function findCause(err, ErrorClass) {
  const seen = new Set();
  let current = err;
  while (current !== undefined && current !== null && !seen.has(current)) {
    if (current instanceof ErrorClass) return current;
    seen.add(current);
    current = typeof current === 'object' ? current.cause : undefined;
  }
  return null;
}
`,
      hints: [
        '`wrapError` — один рядок: `return new Error(message, { cause: err });`.',
        'Обхід: `while (current !== undefined && !seen.has(current)) { ...; current = isObject ? current.cause : undefined; }`.',
        '«Об\'єкт з message»: `current !== null && typeof current === \'object\' && \'message\' in current`. У `findCause` також зупиняйтеся на `null`.'
      ],
      tests: [
        {
          name: 'wrapError зберігає причину',
          code: 'const orig = new TypeError("x");\nconst w = wrapError(orig, "outer");\nexpect(w).toBeInstanceOf(Error);\nexpect(w).not.toBe(orig);\nexpect(w.message).toBe("outer");\nexpect(w.cause).toBe(orig);'
        },
        {
          name: 'ланцюжок з трьох помилок',
          code: 'const net = new TypeError("Failed to fetch");\nconst err = wrapError(wrapError(net, "Load profile"), "Render page");\nexpect(getErrorChain(err)).toEqual(["Render page", "Load profile", "Failed to fetch"]);'
        },
        { name: 'помилка без cause', code: 'expect(getErrorChain(new Error("solo"))).toEqual(["solo"]);' },
        {
          name: 'не-Error причини',
          code: 'const err = new Error("top", { cause: "low-level string" });\nexpect(getErrorChain(err)).toEqual(["top", "low-level string"]);\nexpect(getErrorChain(new Error("a", { cause: 42 }))).toEqual(["a", "42"]);\nexpect(getErrorChain(new Error("a", { cause: null }))).toEqual(["a", "null"]);'
        },
        {
          name: 'захист від циклів',
          code: 'const a = new Error("a");\nconst b = new Error("b", { cause: a });\na.cause = b;\nexpect(getErrorChain(b)).toEqual(["b", "a"]);\nexpect(findCause(b, RangeError)).toBeNull();'
        },
        {
          name: 'findCause знаходить потрібний тип',
          code: 'const net = new TypeError("net");\nconst err = wrapError(wrapError(net, "mid"), "top");\nexpect(findCause(err, TypeError)).toBe(net);\nexpect(findCause(err, Error)).toBe(err);\nexpect(findCause(err, RangeError)).toBeNull();'
        }
      ],
      explanation: `
\`cause\` дає кожному шару додати свій контекст, не втрачаючи оригінальної помилки. До ES2022 це робили вручну (\`err.original = e\`) або втрачали причину (\`throw new Error(e.message)\`).

**Обхід:** прохід по зв'язному списку; \`Set\` — захист від циклів (\`cause\` — звичайна записувана властивість).

**Складність:** O(k), k — довжина ланцюжка.

**Типові помилки:** \`err.cause.message\` без перевірки типу; нескінченний цикл на циклічних посиланнях.

**Що можуть спитати далі:** як серіалізувати ланцюжок для відправки на сервер; як поєднати \`AggregateError\` і \`cause\` (дерево помилок)?
`
    },
    // ------------------------------------------------------------ Де ловити: fail fast і глобальні обробники
    {
      id: 'err-global-handlers-theory',
      group: 'strategy',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Глобальна обробка помилок і моніторинг',
      tags: [
        'global-handlers',
        'monitoring',
        'async'
      ],
      question: 'Як відловлювати всі помилки у фронтенд-застосунку? Що таке window.onerror, подія error, unhandledrejection? Як працюють системи моніторингу на кшталт Sentry і що ще потрібно для якісного error reporting?',
      choices: [
        'React Error Boundary ловить помилки рендеру, обробників подій і таймерів, тож глобальні обробники зайві',
        'Помилки завантаження `<img>` і `<script>` спливають до `window`, тож їх ловить звичайний обробник `error`',
        'Скрипт з іншого домену передає в `window.onerror` повний стек навіть без `crossorigin` і CORS-заголовків',
        'Неперехоплену помилку з обробника кліку чи таймера ловить подія `error` на `window`, а для мініфікованого коду потрібні source maps'
      ],
      answer: `
**Сітки безпеки в браузері:**
\`\`\`js
// 1. Неперехоплені помилки (зокрема з колбеків таймерів і обробників подій)
window.addEventListener('error', (event) => {
  report(event.error ?? event.message, { file: event.filename, line: event.lineno });
});

// 2. Помилки завантаження ресурсів (img, script, link) — лише capture-фаза, бо не спливають
window.addEventListener('error', (event) => {
  if (event.target !== window) reportResource(event.target.src || event.target.href);
}, true);
\`\`\`
\`window.onerror = (message, source, line, col, error) => {}\` — старіший варіант. Для відхилених промісів є окрема подія \`unhandledrejection\` (тема js-async).

**Нюанси:**
- cross-origin скрипти без \`crossorigin\` + CORS дають лише \`"Script error."\`;
- продакшн-код мініфікований — потрібні **source maps** (у системі моніторингу, не обов'язково публічні);
- React **Error Boundaries** ловлять помилки рендеру, але не обробники подій і асинхронний код.

**Як працює Sentry:** SDK ставить глобальні обробники, обгортає \`setTimeout\`, \`addEventListener\`, збирає стек, **breadcrumbs** (кліки, навігація, запити перед помилкою), контекст релізу і групує однакові помилки.

**Якісний error reporting:** кидати \`Error\` з \`message\`/\`cause\`; відокремлювати очікувані помилки від багів; не надсилати персональні дані; sampling; показувати користувачу шлях відновлення замість білого екрана.
`,
      correct: 3,
      why: [
        'Ні: Error Boundary ловить лише помилки під час рендеру дерева компонентів, але не в обробниках подій і таймерах.',
        'Ні: помилки ресурсів НЕ спливають — їх ловлять лише у фазі перехоплення: `addEventListener(\'error\', fn, true)`.',
        'Ні: без `crossorigin` + CORS браузер ховає деталі й передає лише «Script error.».',
        'Так: подія `error` (або `window.onerror`) — сітка безпеки для неперехоплених синхронних помилок, а source maps відновлюють реальні рядки коду.'
      ],
      keyPoints: [
        'Подія error на window / window.onerror — неперехоплені синхронні помилки',
        'Помилки ресурсів — error у capture-фазі (не спливають)',
        'Script error. для cross-origin без crossorigin/CORS; source maps для мініфікованого коду',
        'Error Boundaries у React не ловлять обробники подій і async-код',
        'Моніторинг: стек, breadcrumbs, контекст релізу, групування, без PII'
      ],
      followUps: [
        'Чому замість деталей помилки приходить "Script error."?',
        'Що таке breadcrumbs?',
        'Як не показувати користувачу білий екран при помилці рендеру?'
      ]
    },
    {
      id: 'err-defensive-theory',
      group: 'strategy',
      type: 'theory',
      level: 3,
      title: 'Fail fast vs defensive coding: де ловити помилки',
      tags: [
        'defensive',
        'architecture'
      ],
      question: 'Що таке fail fast і defensive programming? Де в застосунку треба ловити помилки, а де — дати їм «злетіти»? Чим погане порожнє catch?',
      choices: [
        'Дані валідують на межах системи (API, форми, storage), а помилки ловлять там, де можна осмислено відреагувати',
        'Кожна функція має перевіряти всі аргументи й обгортати тіло в `try/catch`, щоб застосунок ніколи не падав',
        'Порожній `catch {}` — прийнятний спосіб прибрати шум з консолі, якщо помилка трапляється рідко й не критична',
        'Fail fast означає якнайдовше працювати з частковими даними й падати лише в крайньому, безвихідному випадку'
      ],
      answer: `
- **Fail fast** — виявити некоректний стан якомога раніше і впасти з чітким повідомленням (\`invariant\`), а не працювати з «битими» даними.
- **Defensive programming** — валідувати **зовнішній** ввід (API, форми, \`localStorage\`, URL) на межах системи; далі довіряти даним.
- **Де ловити:** там, де можна осмислено відреагувати (повідомлення, повтор, кеш, відкат); на межах шарів — обгорнути з \`cause\`; на верхньому рівні — Error Boundary, глобальні обробники.
- **Де не ловити:** глибоко в утилітах «про всяк випадок» — нехай помилка долетить до того, хто знає контекст.
- **Порожній \`catch {}\`** ховає баги. Мінімум — лог; якщо ігнорування справді доречне — вузький \`try\` і коментар.

\`\`\`js
try { saveDraft(); } catch {} // ✘ збереження тихо не працює
\`\`\`
- **Очікувані помилки** (валідація, 404, offline) обробляють явно; **баги** (TypeError) — виправляють.
`,
      correct: 0,
      why: [
        'Так: на межах дані «чужі» — їх валідують; а ловлять там, де є що зробити (показати повідомлення, fallback, повтор).',
        'Ні: `try/catch` у кожній функції ховає баги і робить стан непередбачуваним — помилка має долетіти до того, хто знає контекст.',
        'Ні: порожній `catch` робить збій невидимим (наприклад, чернетка тихо не зберігається); мінімум — логування.',
        'Ні: fail fast — навпаки, падати якомога раніше з чітким повідомленням, а не жити з «битими» даними.'
      ],
      keyPoints: [
        'Fail fast: падати рано і з чітким повідомленням',
        'Валідація на межах системи (API, форми, storage), далі — довіра',
        'Ловити там, де можна осмислено обробити; інакше — rethrow',
        'Порожній catch ховає баги; мінімум — логування з поясненням',
        'Очікувані помилки ≠ баги, обробляються по-різному'
      ],
      followUps: [
        'Як валідувати відповіді API в рантаймі?',
        'Коли повертати помилку як значення, а коли кидати?',
        'Що таке оптимістичне оновлення і як його відкотити при помилці?'
      ]
    },
    {
      id: 'err-debugger-closed', group: 'debugging', type: 'quiz', level: 1,
      title: 'debugger без відкритих DevTools',
      question: 'У коді лишився рядок `debugger;`. Що станеться в користувача, у якого DevTools **закриті**?',
      options: [
        'Виконання зупиниться, доки користувач не натисне F8',
        'Нічого: інструкція ігнорується, код виконується далі',
        'Браузер кине `SyntaxError`',
        'Відкриється вікно DevTools'
      ],
      answer: 1,
      why: [
        'Ні: пауза буває лише тоді, коли відкритий налагоджувач.',
        'Так: без підключеного налагоджувача `debugger` нічого не робить.',
        'Ні: це валідна інструкція мови.',
        'Ні: DevTools самі не відкриваються.'
      ],
      hint: 'Хто має «зловити» паузу, щоб вона сталася?',
      explanation: '`debugger;` — програмна точка зупину: спрацьовує лише з відкритими DevTools. Проте в продакшн її не лишають: лінтер (`no-debugger`) і збирач видаляють такі рядки. Зручніші за `debugger` точки зупину в самих DevTools — їх не треба комітити.'
    },
    {
      id: 'err-devtools-toolkit', group: 'debugging', type: 'theory', level: 2,
      title: 'Інструменти налагодження в DevTools',
      question: 'Оберіть **усі** правильні твердження про налагодження в Chrome DevTools.',
      choices: [
        'Умовна точка зупину спрацьовує лише тоді, коли вираз (наприклад, `user.id === 42`) істинний',
        'Logpoint виводить значення в консоль без зміни коду і без паузи',
        '«Pause on caught exceptions» зупиняє навіть на помилках, перехоплених у `try/catch`',
        'DOM breakpoint «subtree modifications» показує, який код змінив частину сторінки',
        'Без source maps налагодити мініфікований продакшн-код неможливо в принципі'
      ],
      correct: [0, 1, 2, 3],
      why: [
        'Так: зручно в циклах і часто викликаних функціях.',
        'Так: це «console.log без коміту».',
        'Так: допомагає знайти «проковтнуті» помилки.',
        'Так: відповідає на питання «хто змінив DOM?».',
        'Ні: важче, але можливо — кнопка Pretty print `{}`; source maps дають оригінальний код.'
      ],
      hint: 'Згадайте, що можна зробити правою кнопкою на номері рядка у вкладці Sources.',
      answer: `
**Точки зупину (Sources):**
- звичайна і **умовна** (Conditional breakpoint) — пауза лише за умови;
- **Logpoint** — вивід у консоль без паузи і без зміни коду;
- **DOM breakpoints** (Elements → Break on): зміна піддерева, атрибутів, видалення вузла;
- **XHR/fetch breakpoints** — пауза на запиті з певним URL;
- **Event listener breakpoints** — пауза на будь-якому \`click\`, \`keydown\`…;
- **Pause on exceptions** (зокрема перехоплених).

**Під час паузи:** Call Stack (з асинхронними кадрами — видно, звідки прийшов \`then\`), Scope (локальні змінні й замикання), Watch, виконання виразів у консолі в контексті кадру; кроки Step over / into / out.

**Консоль:** \`console.table\` (масиви об'єктів), \`console.trace\` (хто викликав), \`console.time/timeEnd\`, \`console.assert\`, \`console.dir\`, \`$0\` (виділений елемент), \`copy(obj)\`.

**Методика пошуку бага:** відтворити → звузити (бінарний пошук: коментувати половини, \`git bisect\`) → гіпотеза → перевірка в налагоджувачі → виправлення **разом із тестом**, що ловить цей баг.
`,
      keyPoints: [
        'Умовні точки зупину і logpoints замість console.log',
        'DOM, fetch і event listener breakpoints',
        'Pause on exceptions — зокрема перехоплених',
        'Call Stack з async-кадрами і Scope',
        'Відтворити → звузити → гіпотеза → виправити + тест'
      ],
      followUps: ['Як знайти, який скрипт змінює стиль елемента?', 'Що таке git bisect і коли він рятує?']
    },
    {
      id: 'err-console-trace', group: 'debugging', type: 'quiz', level: 2,
      title: 'Хто викликав функцію?',
      question: 'Функцію `saveDraft()` хтось викликає зайвий раз, і незрозуміло, звідки. Який метод консолі найшвидше покаже ланцюжок викликів?',
      options: ['`console.table()`', '`console.trace()`', '`console.dir()`', '`console.count()`'],
      answer: 1,
      why: [
        'Ні: table показує масиви й об\'єкти таблицею.',
        'Так: виводить стек викликів у момент виклику.',
        'Ні: dir показує властивості об\'єкта.',
        'Ні: count лише рахує виклики — корисно, щоб довести зайвий виклик, але не знайти джерело.'
      ],
      hint: 'Потрібен не вміст даних, а **шлях**, яким ми сюди прийшли.',
      explanation: '`console.trace()` друкує stack trace. Комбінація для такого бага: `console.count(\'saveDraft\')`, щоб побачити кількість, і `console.trace()`, щоб побачити джерело. Ще швидше — точка зупину в `saveDraft` і панель Call Stack.'
    },
    {
      id: 'err-bug-top-scores', group: 'debugging', type: 'code', level: 2,
      title: 'Баг-репорт: неправильний топ результатів',
      description: `
**Баг-репорт від QA:**
> \`getTopScores([100, 25, 3, 90], 2)\` повертає \`[90, 3]\`, очікувалось \`[100, 90]\`. А ще після виклику змінюється порядок у вихідному масиві \`scores\` — таблиця результатів на сторінці «перемішується».

**Завдання.** Знайдіть причини (їх **дві**) і виправте функцію: \`getTopScores(scores, n)\` повертає \`n\` найбільших чисел за спаданням і **не змінює** вхідний масив.

**Де трапляється:** типовий баг-репорт з продакшену: таблиця лідерів показує не тих гравців, а після сортування «ламається» інший екран, бо масив змінено на місці.

**Як діяти:** запустіть код і в консолі викличте \`getTopScores([100, 25, 3, 90], 2)\`. Перевірте, що повертає \`[100, 25, 3, 90].sort()\`. Подивіться, що стало з масивом після виклику.
`,
      starter: `function getTopScores(scores, n) {
  const sorted = scores.sort().reverse();
  return sorted.slice(0, n);
}
`,
      solution: `function getTopScores(scores, n) {
  const sorted = [...scores].sort((a, b) => b - a);
  return sorted.slice(0, n);
}
`,
      hints: ['`sort()` без компаратора порівнює елементи як **рядки**: \'100\' < \'25\' < \'3\' < \'90\'.', '`sort()` змінює масив на місці. Скопіюйте його спершу: `[...scores]`.'],
      tests: [
        "expect(getTopScores([100, 25, 3, 90], 2)).toEqual([100, 90])",
        { name: 'не змінює вхідний масив', code: "const scores = [100, 25, 3, 90];\ngetTopScores(scores, 2);\nexpect(scores).toEqual([100, 25, 3, 90]);" },
        "expect(getTopScores([5, 1], 10)).toEqual([5, 1])",
        "expect(getTopScores([-1, -10, 7], 1)).toEqual([7])"
      ],
      explanation: 'Дві класичні пастки: (1) `sort()` за замовчуванням сортує як рядки (UTF-16) — для чисел потрібен компаратор `(a, b) => b - a`; (2) `sort()` і `reverse()` **мутують** масив, а дані з пропсів чи стану мутувати не можна. Сучасні немутуючі аналоги: `toSorted()` і `toReversed()` (ES2023). Хороша практика після виправлення бага — тест, який відтворює саме цей баг-репорт.'
    },
    {
      id: 'err-bug-cart-total', group: 'debugging', type: 'code', level: 2,
      title: 'Баг-репорт: сума кошика «0105.5»',
      description: `
**Баг-репорт:**
> У кошику товари за 10 і 5.5 грн, а в підсумку показано «0105.5». Для товарів за 0.1 і 0.2 показано 0.30000000000000004.

Ціни приходять з полів форми, тобто **рядками**: \`[{ price: '10' }, { price: '5.5' }]\`.

**Завдання.** Виправте \`cartTotal(items)\`: повертає **число**, суму цін, округлену до копійок (2 знаки після коми). Ціни можуть бути і рядками, і числами.

**Де трапляється:** кошик, у якому ціни приходять з API рядками: «0105.5» замість 115.5 — реальний баг склеювання рядків замість додавання чисел.
`,
      starter: `function cartTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
`,
      solution: `function cartTotal(items) {
  const total = items.reduce((sum, item) => sum + Number(item.price), 0);
  return Math.round(total * 100) / 100;
}
`,
      hints: ['`0 + \'10\'` — це конкатенація рядків, а не додавання. Перетворіть ціну: `Number(item.price)`.', 'Округлення до копійок: `Math.round(total * 100) / 100`.'],
      tests: [
        "expect(cartTotal([{ price: '10' }, { price: '5.5' }])).toBe(15.5)",
        "expect(cartTotal([{ price: 0.1 }, { price: 0.2 }])).toBe(0.3)",
        "expect(cartTotal([{ price: 3 }, { price: '2' }])).toBe(5)",
        "expect(cartTotal([])).toBe(0)"
      ],
      explanation: 'Дані з форм, URL і `localStorage` — завжди рядки, і `+` з рядком склеює. Дробові числа в двійковій формі неточні (`0.1 + 0.2`). У реальних фінансових розрахунках гроші зберігають у **копійках цілими числами** (`1050` замість `10.5`), а форматують через `Intl.NumberFormat` лише для показу.'
    }
  ]
});
