FE.topic('js-types', {
  intro: `
## 8 типів даних

**7 примітивів:** \`undefined\`, \`null\`, \`boolean\`, \`number\`, \`bigint\`, \`string\`, \`symbol\` + **\`object\`** (масиви, функції — теж об'єкти).

| Вираз | \`typeof\` | Пастка |
|---|---|---|
| \`null\` | \`"object"\` | історичний баг, перевірка — \`v === null\` |
| \`function(){}\` | \`"function"\` | функція — об'єкт, але typeof виділяє її окремо |
| \`[]\` | \`"object"\` | масив — \`Array.isArray(v)\` |
| \`NaN\` | \`"number"\` | перевірка — \`Number.isNaN(v)\` |
| неоголошена змінна | \`"undefined"\` | без ReferenceError |

## Приведення типів

| Значення | Number | String | Boolean |
|---|---|---|---|
| \`undefined\` | \`NaN\` | \`"undefined"\` | false |
| \`null\` | \`0\` | \`"null"\` | false |
| \`true\` / \`false\` | \`1\` / \`0\` | \`"true"\` | — |
| \`""\` / \`"  "\` | \`0\` | — | false / **true** |
| \`"12px"\` | \`NaN\` | — | true |
| \`[]\` / \`[5]\` / \`[1,2]\` | \`0\` / \`5\` / \`NaN\` | \`""\` / \`"5"\` / \`"1,2"\` | true |
| \`{}\` | \`NaN\` | \`"[object Object]"\` | true |

**Falsy (рівно 8):** \`false\`, \`0\`, \`-0\`, \`0n\`, \`""\`, \`null\`, \`undefined\`, \`NaN\`. Усе інше truthy (\`[]\`, \`{}\`, \`"0"\`, \`"false"\`).

**Оператори:** бінарний \`+\` з рядком — конкатенація, інакше — числа. \`- * / %\`, унарний \`+\`, \`<\` \`>\` — числові.

**Об'єкт → примітив:** рядковий контекст (\`String(o)\`, \`\${o}\`) — спершу \`toString()\`; числовий, \`+\` і \`==\` — спершу \`valueOf()\`.

## Рівність

- \`===\` — без приведення (але \`NaN !== NaN\`, \`+0 === -0\`).
- \`Object.is\` — як \`===\`, але \`Object.is(NaN, NaN) === true\`, \`Object.is(0, -0) === false\`.
- \`==\`: \`null == undefined\` (і більше ні з чим); число vs рядок → число; boolean → число; об'єкт → примітив.
- \`null >= 0\` → \`true\`, але \`null == 0\` → \`false\`.

## Примітиви vs посилання

Примітиви копіюються за значенням; для об'єкта копіюється посилання: мутація всередині функції видна ззовні, перепризначення параметра — ні.
`,
  groups: [
    { id: 'typeof', title: 'Типи даних і typeof' },
    { id: 'null-nan', title: 'null, undefined, NaN' },
    { id: 'conversion', title: 'Явне приведення: Number, String, Boolean' },
    { id: 'operators', title: 'Оператори та об\'єкт → примітив' },
    { id: 'equality', title: '==, === і Object.is' },
    { id: 'references', title: 'Примітиви, посилання й обгортки' }
  ],
  items: [
    // ================================================================ 1. typeof
    {
      id: 'types-data-types',
      group: 'typeof',
      type: 'theory',
      level: 1,
      interview: true,
      title: 'Які типи даних є в JavaScript?',
      tags: ['types', 'typeof'],
      question: 'Які типи даних існують у JavaScript? Чим примітиви відрізняються від об\'єктів? Оберіть **усі** правильні твердження.',
      choices: [
        'Типів 8: сім примітивів (`undefined`, `null`, `boolean`, `number`, `bigint`, `string`, `symbol`) і `object`',
        'Масиви й функції — окремі типи даних, тому `typeof []` повертає `"array"`',
        'Примітиви порівнюються за значенням, а об\'єкти — за посиланням: `{} === {}` дає `false`',
        '`\'abc\'.length` працює, бо рядок зберігається як об\'єкт із власними властивостями',
        '`null` — це підтип `object`, тому `typeof null === "object"` — коректна поведінка'
      ],
      correct: [0, 2],
      why: [
        "Правильно: 7 примітивів + object — повний список.",
        "Масив і функція — різновиди object; `typeof []` дає «object».",
        "Правильно: два літерали `{}` — два різні об'єкти з різними посиланнями.",
        "Рядок — примітив; `.length` доступна через тимчасову обгортку (autoboxing).",
        "`null` — окремий примітив; «object» — баг першої версії JS, залишений заради сумісності."
      ],
      hint: 'Їх рівно вісім.',
      answer: `
- **7 примітивів:** \`undefined\`, \`null\`, \`boolean\`, \`number\` (\`42\`, \`NaN\`), \`bigint\` (\`10n\`), \`string\`, \`symbol\`.
- **object:** \`{}\`, \`[]\`, функції.
- Примітиви незмінні, копіюються й порівнюються за значенням.
- Об'єкти — за посиланням:
\`\`\`js
const a = { n: 1 };
const b = a;   // копіюється посилання
b.n = 2;
a.n;           // 2
\`\`\`
- \`typeof null === "object"\` — історичний баг.
`,
      keyPoints: [
        '7 примітивів + object',
        'Примітиви — за значенням, об\'єкти — за посиланням',
        'Масиви й функції — об\'єкти',
        'typeof null === "object" — баг'
      ],
      followUps: ['Чому typeof null повертає "object"?', 'Як рядок, будучи примітивом, має метод toUpperCase?']
    },
    {
      id: 'types-typeof-basics',
      group: 'typeof',
      type: 'quiz',
      level: 1,
      interview: true,
      title: 'typeof: класичні пастки',
      tags: ['typeof'],
      question: `
\`typeof x\` повертає **рядок** з назвою типу: \`typeof 42\` → \`"number"\`, \`typeof 'hi'\` → \`"string"\`.

Що виведе код?

\`\`\`js
console.log(typeof null);
console.log(typeof function () {});
console.log(typeof []);
console.log(typeof undeclaredVariable);
\`\`\`
`,
      options: [
        '`null function array undefined`',
        '`object function object undefined`',
        '`object object object ReferenceError`',
        '`null function object ReferenceError`'
      ],
      answer: 1,
      why: [
        "typeof ніколи не повертає «null» чи «array» — таких рядків у нього немає.",
        "Правильно: null → «object» (баг), функція → «function», масив → «object», неоголошена змінна → «undefined».",
        "Функцію typeof виділяє окремо, а для неоголошеної змінної не кидає помилку.",
        "`typeof null` — «object», і typeof безпечний для неоголошених змінних."
      ],
      hint: 'typeof ніколи не повертає "null" чи "array".',
      explanation: `
Три сліпі зони typeof: \`null\` → \`"object"\`, масив → \`"object"\`, функція → \`"function"\` (хоча це об'єкт). Тому: \`v === null\`, \`Array.isArray(v)\`. Неоголошена змінна в typeof дає \`"undefined"\`, а не ReferenceError.
`
    },
    {
      id: 'types-typeof-tricky',
      group: 'typeof',
      type: 'quiz',
      level: 2,
      title: 'typeof: менш очевидні випадки',
      tags: ['typeof'],
      question: `
Що виведе код?

\`\`\`js
console.log(typeof typeof 42);
console.log(typeof NaN);
console.log(typeof 10n);
console.log(typeof [1, 2, 3].length);
console.log(typeof { list: [] });
\`\`\`
`,
      options: [
        '`number NaN number number array`',
        '`string number bigint number object`',
        '`string number number number object`',
        '`number number bigint object object`'
      ],
      answer: 1,
      why: [
        "typeof завжди повертає рядок, а рядків «NaN» і «array» в нього немає.",
        "Правильно: «number» — рядок; NaN має тип number; `10n` — bigint; length — число; об'єкт — object.",
        "`10n` — літерал окремого типу bigint, а не number.",
        "Результат typeof — рядок, тому `typeof typeof x` завжди «string»."
      ],
      hint: 'typeof завжди повертає рядок. Суфікс n робить літерал окремим типом.',
      explanation: `
\`typeof typeof 42\` → \`typeof "number"\` → \`"string"\`. NaN — значення типу number. \`10n\` — bigint. Вміст об'єкта на typeof не впливає.
`
    },
    {
      id: 'types-is-primitive',
      group: 'typeof',
      type: 'code',
      level: 1,
      title: 'isPrimitive(value)',
      tags: ['typeof', 'primitives'],
      description: `
**Завдання.** Напишіть \`isPrimitive(value)\`: \`true\` для примітиву, \`false\` для будь-якого об'єкта (включно з масивами та функціями).

**Де трапляється:** перший рядок у \`deepClone\` / \`deepEqual\` (класика live coding): примітив повертаємо як є, об'єкт обходимо.

**Що написати**
- \`isPrimitive(value)\` → \`true\` або \`false\`

**Приклад**
\`\`\`js
isPrimitive(42);        // true
isPrimitive(undefined); // true
isPrimitive(null);      // true   ← хоча typeof null === 'object'
isPrimitive([]);        // false
isPrimitive(() => {});  // false
\`\`\`

**Як це працює:** для об'єктів \`typeof\` повертає лише \`"object"\` або \`"function"\`, усе інше — примітив. Виняток — \`null\`.

**Врахуйте:** \`NaN\`, \`0\`, \`""\` — теж примітиви.
`,
      starter: `function isPrimitive(value) {
  // 1. null — примітив, хоча typeof null === 'object'.
  // TODO

  // 2. typeof об'єкта — лише 'object' або 'function'. Усе інше — примітив.
  // TODO
}

// Спробуйте в консолі:
// isPrimitive(null); // true
// isPrimitive([]);   // false
`,
      solution: `function isPrimitive(value) {
  // typeof null === 'object', тому null перевіряємо окремо
  if (value === null) return true;
  const t = typeof value;
  return t !== 'object' && t !== 'function';
}
`,
      hints: [
        'Спершу `if (value === null) return true;`.',
        'Далі: `return typeof value !== \'object\' && typeof value !== \'function\';`'
      ],
      tests: [
        { name: 'усі 7 примітивів → true', code: 'for (const v of [undefined, null, true, 42, 10n, "str", Symbol("s")]) {\n  expect(isPrimitive(v)).toBe(true);\n}' },
        { name: 'NaN, 0, "" — теж примітиви', code: 'expect(isPrimitive(NaN)).toBe(true);\nexpect(isPrimitive(0)).toBe(true);\nexpect(isPrimitive("")).toBe(true);' },
        { name: 'об\'єкти та масиви → false', code: 'expect(isPrimitive({})).toBe(false);\nexpect(isPrimitive([])).toBe(false);\nexpect(isPrimitive({ a: 1 })).toBe(false);\nexpect(isPrimitive([1, 2])).toBe(false);' },
        { name: 'функції → false', code: 'expect(isPrimitive(function () {})).toBe(false);\nexpect(isPrimitive(() => {})).toBe(false);' },
        { name: 'об\'єкти-обгортки (new String) — теж об\'єкти', code: 'expect(isPrimitive(new String("a"))).toBe(false);\nexpect(isPrimitive(new Number(1))).toBe(false);' }
      ],
      explanation: `
O(1). Типові помилки: забути \`null\`; перевіряти лише \`typeof v !== 'object'\` — тоді функція «примітив».

Альтернатива: \`Object(value) !== value\` (\`Object()\` загортає примітив у новий об'єкт, а об'єкт повертає як є).
`
    },
    {
      id: 'types-check-type',
      group: 'typeof',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Як надійно перевірити тип значення?',
      tags: ['typeof', 'type-checking'],
      question: 'Як надійно перевірити тип значення в JS: примітив, `null`, масив, `NaN`?',
      choices: [
        '`typeof v === "object"` гарантує справжній об\'єкт, бо `null` і масиви мають власні результати typeof',
        '`Array.isArray(v)` — надійна перевірка масиву, а `null` перевіряють строгим порівнянням `v === null`',
        '`typeof NaN` повертає `"NaN"`, тому NaN легко відрізнити від звичайних чисел через typeof',
        '`isNaN(v)` повертає `true` лише для самого значення NaN, без жодного приведення типів',
        '`typeof` для неоголошеної змінної кидає ReferenceError, тому його обгортають у try/catch'
      ],
      correct: 1,
      why: [
        "`typeof null` і `typeof []` обидва дають «object», тому їх відсікають окремо.",
        "Правильно: це стандартні точні перевірки для масиву й null.",
        "`typeof NaN` — «number»; для NaN є `Number.isNaN(v)`.",
        "Глобальний `isNaN` спершу приводить до числа: `isNaN('abc')` → true.",
        "typeof безпечний: для неоголошеної змінної повертає «undefined»."
      ],
      hint: 'У typeof є три сліпі зони: null, масиви, NaN.',
      answer: `
- примітиви, функції — \`typeof v === 'string'\` тощо;
- \`null\` — \`v === null\`;
- масив — \`Array.isArray(v)\`;
- NaN — \`Number.isNaN(v)\`;
- скінченне число — \`Number.isFinite(v)\`;
- «звичайний» об'єкт — \`typeof v === 'object' && v !== null && !Array.isArray(v)\`.
`,
      keyPoints: [
        'typeof: null → "object", масиви → "object", NaN → "number"',
        'null — через === null, масив — Array.isArray',
        'NaN — Number.isNaN, а не глобальний isNaN'
      ],
      followUps: ['Як одним виразом перевірити «справжній» об\'єкт?', 'Чим isNaN відрізняється від Number.isNaN?']
    },
    {
      id: 'types-get-type',
      group: 'typeof',
      type: 'code',
      level: 2,
      title: 'getType і повідомлення про помилку типу',
      tags: ['typeof', 'type-checking', 'validation'],
      description: `
**Завдання.** Напишіть \`getType(value)\` — точнішу версію \`typeof\`, що окремо називає \`null\` і масиви, і \`checkType(value, expected)\` — повідомлення про невідповідність типу.

**Де трапляється:** валідація відповіді API чи пропсів: «очікувався array, отримано null». Голий \`typeof\` сказав би «object».

**Що написати**
- \`getType(value)\` → \`'null'\`, \`'array'\` або результат \`typeof\`
- \`checkType(value, expected)\` → \`null\`, якщо \`getType(value) === expected\`, інакше \`'очікувався <expected>, отримано <тип>'\`

**Приклад**
\`\`\`js
getType(null);       // 'null'
getType([1, 2]);     // 'array'
getType({ a: 1 });   // 'object'
getType(NaN);        // 'number'

checkType([], 'array');    // null
checkType(null, 'array');  // 'очікувався array, отримано null'
\`\`\`

**Як це працює:** \`typeof\` правильно називає все, крім двох випадків, де каже \`'object'\`: \`null\` і масив. Перехопіть їх до \`typeof\`.

**Врахуйте:** \`NaN\` — \`'number'\`; \`{ list: [] }\` — \`'object'\`.
`,
      starter: `function getType(value) {
  // 1. null → 'null'
  // 2. масив (Array.isArray) → 'array'
  // 3. решта → typeof value
  // TODO
}

function checkType(value, expected) {
  // 1. const actual = getType(value)
  // 2. збіг → null, інакше 'очікувався ..., отримано ...'
  // TODO
}

// Спробуйте в консолі:
// getType([]);              // 'array'
// checkType(null, 'array'); // 'очікувався array, отримано null'
`,
      solution: `function getType(value) {
  if (value === null) return 'null';        // typeof null === 'object'
  if (Array.isArray(value)) return 'array'; // typeof [] === 'object'
  return typeof value;
}

function checkType(value, expected) {
  const actual = getType(value);
  return actual === expected ? null : 'очікувався ' + expected + ', отримано ' + actual;
}
`,
      hints: [
        'Два `if` перед `return typeof value`: `=== null` і `Array.isArray`.',
        '`checkType`: тернарний оператор `actual === expected ? null : \'очікувався \' + expected + ...`.'
      ],
      tests: [
        { name: 'примітиви', code: 'expect(getType(undefined)).toBe("undefined");\nexpect(getType(true)).toBe("boolean");\nexpect(getType(NaN)).toBe("number");\nexpect(getType(10n)).toBe("bigint");\nexpect(getType("")).toBe("string");\nexpect(getType(Symbol())).toBe("symbol");' },
        { name: 'null і масиви розпізнаються', code: 'expect(getType(null)).toBe("null");\nexpect(getType([])).toBe("array");\nexpect(getType([1, [2]])).toBe("array");' },
        { name: 'функції → function', code: 'expect(getType(function () {})).toBe("function");\nexpect(getType(() => {})).toBe("function");' },
        { name: 'об\'єкти → object', code: 'expect(getType({})).toBe("object");\nexpect(getType({ list: [] })).toBe("object");' },
        { name: 'checkType повертає null при збігу', code: 'expect(checkType([], "array")).toBeNull();\nexpect(checkType(null, "null")).toBeNull();\nexpect(checkType(5, "number")).toBeNull();' },
        { name: 'checkType формує повідомлення', code: 'expect(checkType(null, "array")).toBe("очікувався array, отримано null");\nexpect(checkType("5", "number")).toBe("очікувався number, отримано string");\nexpect(checkType([], "object")).toBe("очікувався object, отримано array");' }
      ],
      explanation: `
O(1). Помилка — перевіряти \`typeof === 'object'\` раніше за \`null\`/масив.

Далі можуть спитати: як розпізнати дату (\`instanceof\` — тема про прототипи)? Як повернути шлях до помилки (\`address.city\`)?
`
    },

    // ================================================================ 2. null, undefined, NaN
    {
      id: 'types-null-vs-undefined',
      group: 'null-nan',
      type: 'theory',
      level: 1,
      interview: true,
      title: 'null vs undefined',
      tags: ['null', 'undefined'],
      question: 'Чим відрізняються null та undefined? Коли JS сам повертає undefined, і коли варто використовувати null?',
      choices: [
        '`undefined` ставить рушій (немає значення чи `return`), а `null` — програміст навмисно',
        '`null === undefined` дає `true`; відрізняються вони лише результатом `typeof`',
        'Параметр за замовчуванням спрацьовує і для `null`, і для `undefined`, бо обидва falsy',
        '`JSON.stringify` зберігає властивості зі значенням `undefined` так само, як із `null`',
        '`Number(null)` і `Number(undefined)` обидва дають `NaN`, бо це «порожні» значення'
      ],
      correct: 0,
      why: [
        "Правильно: undefined — «ще не задано», null — «навмисно порожньо».",
        "Строго вони не рівні (`null === undefined` → false); рівні лише через `==`.",
        "Значення за замовчуванням підставляється лише для `undefined`: `f(null)` залишить null.",
        "JSON видаляє властивості з `undefined`, а `null` зберігає.",
        "`Number(null)` → 0, `Number(undefined)` → NaN."
      ],
      hint: 'Хто встановлює значення: рушій чи програміст?',
      answer: `
- **undefined** ставить рушій: \`let x;\`, відсутня властивість, непереданий параметр, функція без \`return\`.
- **null** ставить програміст: «значення навмисно немає».
- \`typeof\`: \`"undefined"\` vs \`"object"\`.
- \`Number(undefined)\` → \`NaN\`, \`Number(null)\` → \`0\`.
- Default-параметр спрацьовує лише для \`undefined\`.
\`\`\`js
null == undefined;   // true
null === undefined;  // false
function f(x = 5) { return x; }
f(undefined); // 5
f(null);      // null
\`\`\`
`,
      keyPoints: [
        'undefined — рушій, null — програміст',
        'null == undefined, але не ===',
        'Number(null) → 0, Number(undefined) → NaN',
        'Default-параметр — лише для undefined'
      ],
      followUps: ['Що поверне null + 1 та undefined + 1?', 'Як перевірити «null або undefined» одним виразом?']
    },
    {
      id: 'types-nan',
      group: 'null-nan',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'NaN, isNaN і Number.isNaN',
      tags: ['nan', 'number'],
      question: `
\`NaN\` — результат невдалої числової операції (\`Number('abc')\`, \`0 / 0\`). Його тип — \`number\`.

Що виведе код?

\`\`\`js
console.log(NaN === NaN);
console.log(isNaN('hello'));
console.log(Number.isNaN('hello'));
console.log([NaN].includes(NaN));
console.log([NaN].indexOf(NaN));
\`\`\`
`,
      options: [
        '`false false false true -1`',
        '`false true false false -1`',
        '`true true true true 0`',
        '`false true false true -1`',
        '`false true true true 0`'
      ],
      answer: 3,
      why: [
        "Глобальний `isNaN('hello')` спершу робить `Number('hello')` → NaN, тому дає true.",
        "`includes` вміє знаходити NaN — він порівнює так, що NaN дорівнює NaN.",
        "NaN — єдине значення, яке не дорівнює собі, тож `NaN === NaN` → false.",
        "Правильно: NaN ≠ NaN; isNaN приводить до числа; Number.isNaN — ні; includes знаходить NaN, indexOf — ні.",
        "`Number.isNaN` не приводить тип: рядок 'hello' — не NaN; а `indexOf` порівнює через === і NaN не знаходить."
      ],
      hint: 'Глобальний isNaN спочатку приводить аргумент до числа.',
      explanation: `
NaN не дорівнює собі. \`isNaN(x)\` = «чи стане x NaN після \`Number(x)\`», \`Number.isNaN(x)\` = «чи x — саме NaN». \`indexOf\` шукає через \`===\` (NaN не знайде), \`includes\` — ні. На практиці: \`Number.isNaN\`.
`
    },

    // ================================================================ 3. явне приведення
    {
      id: 'types-conversions',
      group: 'conversion',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Явне та неявне приведення типів',
      tags: ['coercion', 'conversion'],
      question: 'Розкажіть про приведення типів: явне vs неявне, які значення у що перетворюються. Оберіть **усі** правильні твердження.',
      choices: [
        '`Boolean(" ")` дає `false`, бо рядок із пробілів вважається порожнім',
        '`Number(x)`, `String(x)`, `Boolean(x)` — явне приведення; `if (x)`, `x - 1`, `x == y` — неявне',
        'Falsy-значень рівно 8, а `"0"`, `"false"`, `[]` і `{}` — truthy',
        '`Number("12px")` дає `12`: Number читає цифри до першого нечислового символу',
        '`&&` і `||` завжди повертають boolean, тому `\'a\' || \'b\'` дає `true`'
      ],
      correct: [1, 2],
      why: [
        "Falsy лише порожній рядок `\"\"`; рядок із пробілом непорожній, тому truthy.",
        "Правильно: явне — коли викликаємо самі, неявне — коли це робить оператор чи if.",
        "Правильно: falsy — false, 0, -0, 0n, \"\", null, undefined, NaN; будь-який об'єкт truthy.",
        "Так поводиться `parseInt`; `Number` вимагає, щоб увесь рядок був числом, тому NaN.",
        "`&&`/`||` повертають один з операндів: `'a' || 'b'` → 'a'."
      ],
      hint: 'Три цільові типи: число, рядок, boolean.',
      answer: `
- **Явне:** \`Number(x)\`, \`String(x)\`, \`Boolean(x)\`, \`!!x\`, \`+x\`, \`parseInt(x, 10)\`.
- **Неявне:** \`if (x)\`, \`!x\`, \`x - 1\`, \`x + ''\`, \`x == y\`.
- **Number:** \`""\` → 0, \`" 7 "\` → 7, \`"12px"\` → NaN, \`null\` → 0, \`undefined\` → NaN, \`true\` → 1, \`[]\` → 0.
- **String:** \`null\` → \`"null"\`, \`[1, 2]\` → \`"1,2"\`, \`{}\` → \`"[object Object]"\`.
- **Boolean:** 8 falsy (\`false\`, \`0\`, \`-0\`, \`0n\`, \`""\`, \`null\`, \`undefined\`, \`NaN\`), решта truthy.
- \`a || b\` повертає операнд, а не boolean.
`,
      keyPoints: [
        'Явне (Number/String/Boolean) vs неявне (оператори, if)',
        'null→0, undefined→NaN, ""→0, "12px"→NaN',
        '8 falsy; [] і "0" — truthy',
        '&& / || повертають операнд'
      ],
      followUps: ['Що повертає a || b — boolean чи операнд?', 'Чим Number відрізняється від parseInt?']
    },
    {
      id: 'types-truthy',
      group: 'conversion',
      type: 'quiz',
      level: 1,
      interview: true,
      title: 'Які значення truthy?',
      tags: ['truthy', 'falsy'],
      question: 'В `if (x)` значення перетворюється на boolean. Оберіть **усі** truthy значення:',
      options: ['`"0"`', '`[]`', '`0n`', '`"false"`', '`-0`', '`" "`'],
      answer: [0, 1, 3, 5],
      why: [
        "Truthy: непорожній рядок, байдуже що в ньому.",
        "Truthy: будь-який об'єкт, навіть порожній масив.",
        "Falsy: BigInt-нуль входить до 8 falsy.",
        "Truthy: це непорожній рядок, а не boolean false.",
        "Falsy: `-0` поводиться як `0`.",
        "Truthy: пробіл — непорожній рядок (хоча `Number(\" \")` → 0)."
      ],
      hint: 'Falsy значень рівно вісім. Будь-який об\'єкт — truthy.',
      explanation: `
Falsy: \`false\`, \`0\`, \`-0\`, \`0n\`, \`""\`, \`null\`, \`undefined\`, \`NaN\`. Усе інше truthy. Пастка в коді: \`if (items)\` для порожнього масиву виконається — перевіряйте \`items.length\`.
`
    },
    {
      id: 'types-number-conversion',
      group: 'conversion',
      type: 'quiz',
      level: 2,
      title: 'Number(): що вийде?',
      tags: ['conversion', 'number'],
      question: `
Що виведе код?

\`\`\`js
console.log(Number(''));
console.log(Number(' 12 '));
console.log(Number('12px'));
console.log(Number(null));
console.log(Number(undefined));
console.log(Number([5]));
console.log(Number([1, 2]));
\`\`\`
`,
      options: [
        '`0 12 NaN 0 NaN 5 NaN`',
        '`NaN 12 12 0 NaN 5 NaN`',
        '`0 NaN NaN 0 0 5 NaN`',
        '`NaN 12 NaN NaN NaN NaN NaN`',
        '`0 12 NaN 0 NaN 5 12`'
      ],
      answer: 0,
      why: [
        "Правильно: '' → 0, пробіли по краях обрізаються, '12px' → NaN, null → 0, undefined → NaN, [5] → '5' → 5, [1,2] → '1,2' → NaN.",
        "Це логіка parseInt; `Number('')` → 0, а '12px' для Number — NaN.",
        "Пробіли по краях Number ігнорує, а `Number(undefined)` — NaN, не 0.",
        "Порожній рядок і null дають 0, а масив з одного числа — це число.",
        "`[1, 2]` стає рядком '1,2', а він не є числом — NaN."
      ],
      hint: 'Увесь рядок (без пробілів по краях) має бути числом. Масив спочатку стає рядком.',
      explanation: `
\`Number('')\` → 0 — часта причина багів у формах (порожнє поле стає нулем). \`null\` → 0, але \`undefined\` → NaN. Масив → рядок через кому → число.
`
    },
    {
      id: 'types-parseint-vs-number',
      group: 'conversion',
      type: 'quiz',
      level: 2,
      title: 'Number vs parseInt vs parseFloat',
      tags: ['conversion', 'parseInt'],
      question: `
\`parseInt\`/\`parseFloat\` читають рядок зліва, поки символи схожі на число. \`Number\` вимагає, щоб увесь рядок був числом.

Що виведе код?

\`\`\`js
console.log(Number('12px'), parseInt('12px'));
console.log(Number(''), parseInt(''));
console.log(parseFloat('3.14.15'), parseInt('1e3'));
console.log(Number('1e3'), parseInt('0x1F'));
\`\`\`
`,
      options: [
        '`NaN 12` / `0 NaN` / `3.14 1` / `1000 31`',
        '`NaN 12` / `0 0` / `3.14 1000` / `1000 31`',
        '`12 12` / `NaN NaN` / `NaN 1` / `1000 0`',
        '`NaN 12` / `0 NaN` / `3.1415 1` / `1000 NaN`'
      ],
      answer: 0,
      why: [
        "Правильно: parseInt зупиняється на 'p' і 'e', parseFloat — на другій крапці, а '0x' parseInt розуміє як шістнадцяткове.",
        "`parseInt('')` — NaN (немає жодної цифри), а `parseInt('1e3')` — 1: експоненту parseInt не розуміє.",
        "`Number('12px')` — NaN, а `Number('')` — 0.",
        "parseFloat зупиняється на другій крапці (3.14), а `parseInt('0x1F')` — 31."
      ],
      hint: 'parseInt читає, поки може. Number — усе або NaN.',
      explanation: `
Для валідації вводу — \`Number()\` + \`Number.isFinite\` (і окремо порожній рядок). Щоб «витягти» число з \`'12px'\` — \`parseFloat\`/\`parseInt\`. У \`parseInt\` завжди передавайте основу: \`parseInt(str, 10)\`.
`
    },
    {
      id: 'types-map-parseint',
      group: 'conversion',
      type: 'quiz',
      level: 3,
      title: 'parseInt: основа системи і 0.0000005',
      tags: ['parseInt', 'trick'],
      question: `
Другий аргумент \`parseInt(str, radix)\` — основа системи числення (2–36; 0 або відсутній — «визначити автоматично»).

Що виведе код?

\`\`\`js
console.log(parseInt('1', 0));
console.log(parseInt('2', 1));
console.log(parseInt('3', 2));
console.log(parseInt(0.0000005));
\`\`\`
`,
      options: [
        '`1 2 3 0`',
        '`1 NaN NaN 5`',
        '`NaN NaN NaN 0`',
        '`1 NaN 3 5`',
        '`1 2 3 5e-7`'
      ],
      answer: 1,
      why: [
        "Основа 1 невалідна, а в двійковій системі немає цифри 3 — обидва дадуть NaN.",
        "Правильно: основа 0 → авто (1), основа 1 невалідна (NaN), '3' не двійкова цифра (NaN), а 0.0000005 стає рядком '5e-7'.",
        "Основа 0 означає «автоматично», тому '1' розбирається нормально.",
        "У двійковій системі лише цифри 0 і 1, тому '3' дає NaN.",
        "parseInt повертає ціле: з рядка '5e-7' він читає лише '5'."
      ],
      hint: 'parseInt спершу перетворює аргумент на рядок. Як виглядає String(0.0000005)?',
      explanation: `
Саме це відбувається в класиці \`['1', '2', '3'].map(parseInt)\` → \`[1, NaN, NaN]\`: map передає індекс другим аргументом. \`String(0.0000005)\` → \`"5e-7"\`, звідси 5. Висновок: parseInt — лише для рядків і з основою 10; для округлення чисел — \`Math.trunc\`.
`
    },
    {
      id: 'types-parse-number',
      group: 'conversion',
      type: 'code',
      level: 2,
      title: 'parseNumber — безпечне число з форми',
      tags: ['conversion', 'validation', 'number'],
      description: `
**Завдання.** Напишіть \`parseNumber(input)\`: перетворює значення з поля форми чи API на скінченне число або повертає \`null\`. Ніколи не кидає помилок.

**Де трапляється:** поля «Кількість», «Ціна», query-параметри. Наївний \`Number(input)\` перетворює порожнє поле на \`0\`.

**Що написати**
- \`parseNumber(input)\` → число або \`null\`:
  - число → воно саме, якщо скінченне (\`NaN\`, \`Infinity\` → \`null\`);
  - рядок → \`trim()\`; порожній → \`null\`; інакше \`Number(...)\`, якщо результат скінченний, інакше \`null\`;
  - будь-який інший тип → \`null\`.

**Приклад**
\`\`\`js
parseNumber(' 42 ');  // 42
parseNumber('0');     // 0
parseNumber('');      // null  (а Number('') === 0!)
parseNumber('12px');  // null
parseNumber(null);    // null  (а Number(null) === 0!)
parseNumber(true);    // null  (а Number(true) === 1!)
\`\`\`

**Як це працює:** небезпечні неявні перетворення — \`'' → 0\`, \`null → 0\`, \`true → 1\`, \`[7] → 7\`. Тож спершу відсікаємо всі типи, крім number і string, а потім перевіряємо \`Number.isFinite(n)\` — вона відкидає і NaN, і ±Infinity.

**Врахуйте:** \`0\` і \`'0'\` — валідні; \`'1,5'\` → \`null\`; рядок з одних пробілів → \`null\`.
`,
      starter: `function parseNumber(input) {
  // 1. Число: поверніть його, якщо Number.isFinite, інакше null.
  // TODO

  // 2. Рядок: trim(); порожній → null; інакше Number(...) і та сама перевірка.
  // TODO

  // 3. Усе інше → null.
  // TODO
}

// Спробуйте в консолі:
// parseNumber(' 42 '); // 42
// parseNumber('');     // null
`,
      solution: `function parseNumber(input) {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : null;
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed === '') return null; // Number('') === 0 — пастка
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  // null, boolean, об'єкти, масиви, bigint — відкидаємо
  return null;
}
`,
      hints: [
        'Розгалужтеся за `typeof input`: `"number"`, `"string"`, решта → `null`.',
        'Для рядка: `const s = input.trim(); if (s === \'\') return null;` і далі `Number(s)` + `Number.isFinite`.'
      ],
      tests: [
        { name: 'валідні рядки та числа', code: 'expect(parseNumber("42")).toBe(42);\nexpect(parseNumber(" 3.5 ")).toBe(3.5);\nexpect(parseNumber("-7")).toBe(-7);\nexpect(parseNumber("1e3")).toBe(1000);\nexpect(parseNumber(15)).toBe(15);' },
        { name: 'нуль — валідне число (не falsy-пастка)', code: 'expect(parseNumber(0)).toBe(0);\nexpect(parseNumber("0")).toBe(0);\nexpect(parseNumber("  0  ")).toBe(0);' },
        { name: 'порожні рядки → null', code: 'expect(parseNumber("")).toBeNull();\nexpect(parseNumber("   ")).toBeNull();\nexpect(parseNumber("\\n\\t")).toBeNull();' },
        { name: 'невалідні рядки → null', code: 'expect(parseNumber("12px")).toBeNull();\nexpect(parseNumber("abc")).toBeNull();\nexpect(parseNumber("1,5")).toBeNull();\nexpect(parseNumber("Infinity")).toBeNull();' },
        { name: 'NaN та Infinity → null', code: 'expect(parseNumber(NaN)).toBeNull();\nexpect(parseNumber(Infinity)).toBeNull();\nexpect(parseNumber(-Infinity)).toBeNull();' },
        { name: 'інші типи → null', code: 'expect(parseNumber(null)).toBeNull();\nexpect(parseNumber(undefined)).toBeNull();\nexpect(parseNumber(true)).toBeNull();\nexpect(parseNumber([7])).toBeNull();\nexpect(parseNumber({})).toBeNull();\nexpect(parseNumber(10n)).toBeNull();' },
        { name: 'не кидає на symbol', code: 'expect(() => parseNumber(Symbol("x"))).not.toThrow();\nexpect(parseNumber(Symbol("x"))).toBeNull();' }
      ],
      explanation: `
O(n) за довжиною рядка. Типові помилки: \`if (!n) return null\` відкидає валідний \`0\`; глобальний \`isNaN\`/\`isFinite\` приводять тип; \`parseFloat\` прийме \`'12px'\`.

Далі можуть спитати: як підтримати кому як десятковий роздільник?
`
    },

    // ================================================================ 4. оператори, об'єкт → примітив
    {
      id: 'types-plus-operator',
      group: 'operators',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Оператор + та арифметика з різними типами',
      tags: ['coercion', 'operators'],
      question: `
Бінарний \`+\`: якщо хоч один операнд — рядок, це конкатенація, інакше — додавання чисел. \`-\`, \`*\`, \`/\`, унарний \`+\` — завжди числові. Масив у \`+\` спершу стає рядком (\`[]\` → \`""\`).

Які значення (з урахуванням типу) дадуть вирази?

\`\`\`js
1 + '2';
'3' - 1;
true + 1;
[] + 1;
null + 1;
undefined + 1;
'5' + + '2';
\`\`\`
`,
      options: [
        '`3, 2, 2, 1, 1, NaN, 7`',
        '`"12", "31", 2, "1", 1, NaN, "52"`',
        '`"12", 2, "true1", "1", "null1", "undefined1", "52"`',
        '`"12", 2, 2, 1, 1, NaN, "52"`',
        '`"12", 2, 2, "1", 1, NaN, "52"`'
      ],
      answer: 4,
      why: [
        "`1 + '2'` — є рядок, тож це конкатенація «12», а не 3.",
        "Мінус лише числовий: `'3' - 1` → 2, а не «31».",
        "true, null і undefined без рядка поруч стають числами (1, 0, NaN), а не рядками.",
        "`[] + 1` — масив стає рядком `\"\"`, тож результат — рядок «1», а не число.",
        "Правильно: рядок у + дає конкатенацію, решта операндів стає числами; `+'2'` — число 2, але `'5' + 2` → «52»."
      ],
      hint: 'Шукайте рядок серед операндів (після перетворення масиву).',
      explanation: `
\`[] + 1\` → \`"" + 1\` → \`"1"\`. \`null + 1\` → \`0 + 1\`. \`undefined + 1\` → \`NaN\`. \`'5' + + '2'\` = \`'5' + (+'2')\` = \`'5' + 2\` = \`"52"\`.
`
    },
    {
      id: 'types-bigint',
      group: 'operators',
      type: 'quiz',
      level: 3,
      title: 'BigInt: що кине TypeError?',
      tags: ['bigint', 'number'],
      question: '`bigint` — тип для великих цілих (`10n`). Оберіть **усі** вирази, що кинуть `TypeError`:',
      options: ['`1n + 1`', '`1n == 1`', '`+1n`', '`Math.max(1n, 2n)`', '`2n > 1`', '`BigInt(1.5)`'],
      answer: [0, 2, 3],
      why: [
        "TypeError: арифметику BigInt і number змішувати не можна — потрібне явне `BigInt(1)` або `Number(1n)`.",
        "Порівняння BigInt з number дозволені: `1n == 1` → true.",
        "TypeError: унарний плюс приводить до number, а неявне BigInt → number заборонене.",
        "TypeError: `Math.*` працюють лише з number.",
        "Порівняння `>` між BigInt і number дозволене → true.",
        "Це RangeError, а не TypeError: дріб не можна перетворити на BigInt."
      ],
      hint: 'Змішувати в арифметиці не можна, порівнювати — можна.',
      explanation: `
Заборона неявних перетворень захищає від тихої втрати точності. Явно: \`Number(1n) + 1\`, \`1n + BigInt(1)\`. Ще: \`5n / 2n === 2n\` (дріб відкидається).
`
    },
    {
      id: 'types-to-primitive',
      group: 'operators',
      type: 'theory',
      level: 3,
      title: 'Як об\'єкт стає примітивом',
      tags: ['coercion', 'to-primitive'],
      question: 'Як JavaScript перетворює об\'єкт на примітив (наприклад, у `obj + 1` чи `` `${obj}` ``)? Яку роль грають `valueOf` і `toString`?',
      choices: [
        'Завжди першим викликається `toString()`, а `valueOf()` — лише коли `toString` в об\'єкта відсутній',
        'Для бінарного `+` і `==` спершу викликається `valueOf()`, а для `String(obj)` — спершу `toString()`',
        'У звичайного об\'єкта `valueOf()` повертає число `0`, тому вираз `{} * 2` дає `0`',
        'Якщо і `valueOf()`, і `toString()` повернули об\'єкти, результатом стає `"[object Object]"`',
        '`[1, 2] + ""` дає `"[1, 2]"`, бо масив перетворюється на рядок разом із дужками'
      ],
      correct: 1,
      why: [
        "Порядок залежить від контексту: рядковий — toString першим, числовий і `+`/`==` — valueOf першим.",
        "Правильно: `+` і `==` не знають, рядок чи число потрібні, тому починають з valueOf.",
        "`({}).valueOf()` повертає сам об'єкт, тож спрацьовує toString → «[object Object]» → NaN.",
        "Якщо жоден метод не повернув примітив — TypeError «Cannot convert object to primitive value».",
        "Масив перетворюється через `join(',')`: `[1, 2]` → «1,2», без дужок."
      ],
      hint: 'Контекст визначає порядок: рядковий чи числовий.',
      answer: `
- **Рядковий контекст** (\`String(o)\`, \`\${o}\`): \`toString()\` → якщо не примітив, \`valueOf()\`.
- **Числовий** (\`*\`, \`-\`, \`<\`, \`Number(o)\`) і **\`+\` / \`==\`**: \`valueOf()\` → потім \`toString()\`.
- Береться перший примітив; немає — TypeError.
- Звичайний об'єкт: \`valueOf()\` повертає себе → працює \`toString()\` → \`"[object Object]"\`. Масив: \`toString\` = \`join(',')\`.
\`\`\`js
const obj = { valueOf: () => 42, toString: () => 'obj' };
obj + 1;      // 43
\`\${obj}\`;    // "obj"
obj + '';     // "42" — + бере valueOf!
\`\`\`
- Нюанс: дата в \`+\` стає рядком; є ще спеціальний метод \`Symbol.toPrimitive\` (тема ES6+).
`,
      keyPoints: [
        'Рядковий контекст: toString першим',
        'Числовий, + і ==: valueOf першим',
        'Звичайний об\'єкт → "[object Object]", масив → join(",")',
        'Немає примітиву — TypeError'
      ],
      followUps: ['Що дасть [] + {}?', 'Чому obj + "" і String(obj) можуть відрізнятися?']
    },
    {
      id: 'types-toprimitive-output',
      group: 'operators',
      type: 'quiz',
      level: 3,
      title: 'valueOf vs toString: що виведе?',
      tags: ['to-primitive', 'coercion'],
      question: `
Що виведе код?

\`\`\`js
const obj = {
  valueOf() { return 42; },
  toString() { return 'obj'; }
};

console.log(obj + 1);
console.log(\`\${obj}\`);
console.log(obj * 2);
console.log(String(obj));
console.log(obj + '');
console.log([obj] + '');
\`\`\`
`,
      options: [
        '`43 42 84 42 42 42`',
        '`43 obj 84 obj obj obj`',
        '`obj1 obj NaN obj obj obj`',
        '`43 obj 84 obj 42 obj`',
        '`43 obj 84 obj 42 42`'
      ],
      answer: 3,
      why: [
        "Шаблонний рядок і `String()` — рядковий контекст, тому беруть toString → «obj».",
        "`obj + ''` — це бінарний +, а він починає з valueOf → «42».",
        "+ починає з valueOf (42), тож `obj + 1` → 43, а `obj * 2` → 84.",
        "Правильно: + і * беруть valueOf, шаблон і String() — toString, а масив перетворює елементи як рядки.",
        "`[obj] + ''` — масив робить join, а join перетворює елементи через toString → «obj»."
      ],
      hint: '+ починає з valueOf навіть поруч із рядком.',
      explanation: `
\`obj + ''\` і \`String(obj)\` не еквівалентні, коли в об'єкта є власний \`valueOf\`: перше → \`"42"\`, друге → \`"obj"\`. Масив \`[obj]\` → \`join\` → кожен елемент як рядок → \`"obj"\`.
`
    },
    {
      id: 'types-to-primitive-money',
      group: 'operators',
      type: 'code',
      level: 3,
      title: 'Об\'єкт-сума: valueOf і toString',
      tags: ['to-primitive', 'coercion'],
      description: `
**Завдання.** Напишіть фабрику \`createMoney(amount, currency)\`: об'єкт-суму, який сам перетворюється на число в розрахунках і на рядок у тексті.

**Де трапляється:** value-об'єкти для цін: щоб \`\${price}\` у шаблоні давав «100 UAH», а \`price * qty\` і сортування працювали як з числом. На співбесіді — «як об'єкт стає примітивом».

**Що написати**
- \`createMoney(amount, currency)\` → об'єкт із властивостями \`amount\`, \`currency\` і методами:
  - \`valueOf()\` → число \`amount\`
  - \`toString()\` → рядок \`'<amount> <currency>'\`

**Приклад**
\`\`\`js
const m = createMoney(100, 'UAH');
m * 2;       // 200        числовий контекст → valueOf
m > 50;      // true
\`\${m}\`;    // '100 UAH'  рядковий контекст → toString
m + 1;       // 101        + теж починає з valueOf
\`\`\`

**Як це працює:** коли об'єкт потрапляє в оператор, рушій викликає \`valueOf()\` (числа, \`+\`, \`==\`) або \`toString()\` (\`String()\`, шаблон). Методи бачать параметри \`amount\` і \`currency\` фабрики.

**Врахуйте:** \`m + ''\` дасть \`'100'\` — бінарний \`+\` бере \`valueOf\`. Сортування \`(a, b) => a - b\` має працювати.
`,
      starter: `function createMoney(amount, currency) {
  return {
    amount,
    currency,
    // 1. Числовий контекст (m * 2, m > 50, m + 1).
    valueOf() {
      // TODO: поверніть число
    },
    // 2. Рядковий контекст (String(m), шаблонний рядок).
    toString() {
      // TODO: поверніть рядок на кшталт '100 UAH'
    }
  };
}

// Спробуйте в консолі:
// const m = createMoney(100, 'UAH');
// m * 2;      // 200
// String(m);  // '100 UAH'
`,
      solution: `function createMoney(amount, currency) {
  return {
    amount,
    currency,
    // числовий контекст, а також + і ==
    valueOf() {
      return amount;
    },
    // String(m), шаблонний рядок
    toString() {
      return amount + ' ' + currency;
    }
  };
}
`,
      hints: [
        '`valueOf() { return amount; }` — параметр фабрики доступний усередині методу.',
        '`toString() { return amount + \' \' + currency; }`'
      ],
      tests: [
        { name: 'числовий контекст', code: 'const m = createMoney(100, "UAH");\nexpect(+m).toBe(100);\nexpect(m * 2).toBe(200);\nexpect(Number(m)).toBe(100);\nexpect(m > 50).toBe(true);\nexpect(m < 50).toBe(false);' },
        { name: 'рядковий контекст', code: 'const m = createMoney(100, "UAH");\nexpect(String(m)).toBe("100 UAH");\nexpect(`${m}`).toBe("100 UAH");\nexpect(`Ціна: ${createMoney(5, "USD")}`).toBe("Ціна: 5 USD");' },
        { name: '+ і == беруть valueOf', code: 'const m = createMoney(100, "UAH");\nexpect(m + 1).toBe(101);\nexpect(m == 100).toBe(true);\nexpect(m + "").toBe("100");' },
        { name: 'властивості доступні', code: 'const m = createMoney(7, "EUR");\nexpect(m.amount).toBe(7);\nexpect(m.currency).toBe("EUR");' },
        { name: 'сортування за сумою', code: 'const list = [createMoney(30, "UAH"), createMoney(10, "UAH"), createMoney(20, "UAH")];\nlist.sort((a, b) => a - b);\nexpect(list.map((x) => x.amount)).toEqual([10, 20, 30]);' }
      ],
      explanation: `
\`a - b\` у сортуванні — числовий контекст, тому працює через \`valueOf\`. Компроміс: \`m + ''\` → \`'100'\`, бо \`+\` бере \`valueOf\`.

Помилка: повернути з методу об'єкт → TypeError «Cannot convert object to primitive value». Далі можуть спитати: як порівнювати суми в різних валютах (краще явний метод, ніж неявне приведення)?
`
    },

    // ================================================================ 5. рівність
    {
      id: 'types-equality',
      group: 'equality',
      type: 'theory',
      level: 2,
      interview: true,
      title: '== vs === і алгоритм нестрогої рівності',
      tags: ['equality', 'coercion'],
      question: 'Чим відрізняються == та ===? Як працює ==? Коли == доречний? Оберіть **усі** правильні твердження.',
      choices: [
        '`null == 0` істинне, бо `null` у нестрогому порівнянні перетворюється на `0`',
        '`NaN === NaN` дає `true`, а `NaN == NaN` — `false` через приведення типів',
        'Boolean-операнд у `==` спершу стає числом, тому `\'true\' == true` дає `false`',
        'Об\'єкт і примітив у `==` порівнюються за посиланням, без жодного приведення',
        '`value == null` — прийнятна ідіома: вона ловить і `null`, і `undefined`'
      ],
      correct: [2, 4],
      why: [
        "У `==` null дорівнює лише undefined; до числа він тут не приводиться.",
        "NaN не дорівнює нічому, навіть собі — і через ===, і через ==.",
        "Правильно: true → 1, 'true' → NaN, а NaN ≠ 1.",
        "Об'єкт спершу стає примітивом (valueOf/toString): `[1] == 1` → true.",
        "Правильно: за правилом null == undefined, і більше ні з чим."
      ],
      hint: 'Однакові типи → як ===. Різні: null/undefined, число/рядок, boolean, об\'єкт.',
      answer: `
- \`===\`: без приведення; \`NaN !== NaN\`, \`+0 === -0\`.
- \`==\`, коли типи різні:
  1. \`null == undefined\` → true; з іншим — false.
  2. число vs рядок → рядок у число.
  3. boolean → число, потім порівняти знову.
  4. об'єкт vs примітив → об'єкт у примітив.
\`\`\`js
'' == 0;       // true
'0' == false;  // true
[] == false;   // true, хоча [] truthy
null == 0;     // false
\`\`\`
- \`==\` не транзитивне: \`'0' == 0\`, \`0 == ''\`, але \`'0' != ''\`.
- Практика: \`===\` (ESLint \`eqeqeq\`); виняток — \`v == null\`.
`,
      keyPoints: [
        '=== без приведення',
        'null == undefined, і більше ні з чим',
        'Boolean → число; truthy/falsy у == не діє',
        'Виняток: v == null'
      ],
      followUps: ['Чому [] == ![] дає true?', 'Чому == не транзитивне?']
    },
    {
      id: 'types-loose-equality',
      group: 'equality',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Які вирази з == істинні?',
      tags: ['equality', 'coercion'],
      question: 'Оберіть **усі** вирази, що повертають `true`:',
      options: ['`null == 0`', '`null == undefined`', '`\'0\' == false`', '`\'true\' == true`', '`[] == \'\'`', '`NaN == NaN`'],
      answer: [1, 2, 4],
      why: [
        "false: null нестрого дорівнює лише undefined.",
        "true: спеціальне правило null == undefined.",
        "true: false → 0, '0' → 0.",
        "false: true → 1, 'true' → NaN.",
        "true: [] стає рядком ''.",
        "false: NaN не дорівнює нічому, навіть собі."
      ],
      hint: 'Boolean у == перетворюється на число. null дорівнює лише undefined.',
      explanation: `
Головна пастка — boolean: він стає **числом**, а не рядком, тому \`'true' == true\` хибне. І \`null\` не приводиться до 0 у \`==\`.
`
    },
    {
      id: 'types-object-is',
      group: 'equality',
      type: 'quiz',
      level: 2,
      title: 'Object.is, -0 та Infinity',
      tags: ['object-is', 'number'],
      question: `
\`Object.is(a, b)\` порівнює як \`===\`, але з двома винятками.

Що виведе код?

\`\`\`js
console.log(0 === -0);
console.log(Object.is(0, -0));
console.log(Object.is(NaN, 0 / 0));
console.log(1 / -0);
\`\`\`
`,
      options: [
        '`true true true Infinity`',
        '`false false true -Infinity`',
        '`true false true -Infinity`',
        '`true false false NaN`'
      ],
      answer: 2,
      why: [
        "`Object.is` розрізняє `0` і `-0`, а `1 / -0` дає від'ємну нескінченність.",
        "`===` не бачить знак нуля: `0 === -0` → true.",
        "Правильно: === не розрізняє нулі, Object.is — розрізняє; NaN для Object.is дорівнює NaN; 1 / -0 → -Infinity.",
        "`0 / 0` — це NaN, а `Object.is(NaN, NaN)` → true; ділення на -0 дає -Infinity, а не NaN."
      ],
      hint: 'Два винятки Object.is — це NaN і -0.',
      explanation: `
\`===\`: NaN ≠ NaN, +0 = -0. \`Object.is\`: NaN = NaN, +0 ≠ -0. \`-0\` можна виявити й без Object.is: \`1 / -0 === -Infinity\`. Буває в \`Math.round(-0.4)\`, \`-1 * 0\`.
`
    },
    {
      id: 'types-object-is-polyfill',
      group: 'equality',
      type: 'code',
      level: 3,
      title: 'Поліфіл Object.is',
      tags: ['object-is', 'polyfill', 'nan'],
      description: `
**Завдання.** Реалізуйте \`objectIs(a, b)\` — аналог \`Object.is\` **без** використання \`Object.is\`.

**Де трапляється:** React так порівнює старий і новий стан (\`useState\`, залежності \`useEffect\`): однакові — ререндеру немає. Поліфіли — класика співбесід.

**Що написати**
- \`objectIs(a, b)\` → \`true\` / \`false\`: як \`a === b\`, але \`objectIs(NaN, NaN)\` → \`true\`, \`objectIs(0, -0)\` → \`false\`

**Приклад**
\`\`\`js
objectIs(1, 1);      // true
objectIs(NaN, NaN);  // true   (NaN === NaN → false)
objectIs(0, -0);     // false  (0 === -0 → true)
objectIs({}, {});    // false
\`\`\`

**Як це працює:** NaN — єдине значення, для якого \`x !== x\`. Нулі відрізняються діленням: \`1 / 0 === Infinity\`, \`1 / -0 === -Infinity\`.

**Врахуйте:** \`objectIs(NaN, 'NaN')\` → \`false\`; \`objectIs(-0, -0)\` → \`true\`.
`,
      starter: `function objectIs(a, b) {
  // 1. a === b: рівні, КРІМ пари +0 / -0 (порівняйте 1 / a і 1 / b).
  // TODO

  // 2. a !== b: різні, КРІМ випадку, коли обидва NaN (x !== x).
  // TODO
}

// Спробуйте в консолі:
// objectIs(NaN, NaN); // true
// objectIs(0, -0);    // false
`,
      solution: `function objectIs(a, b) {
  if (a === b) {
    // +0 === -0, але 1/+0 = Infinity, 1/-0 = -Infinity
    return a !== 0 || 1 / a === 1 / b;
  }
  // NaN — єдине значення, не рівне собі
  return a !== a && b !== b;
}
`,
      hints: [
        'Два випадки: `a === b` (можуть бути +0 і -0) і `a !== b` (можуть бути два NaN).',
        'Перший: `return a !== 0 || 1 / a === 1 / b;`. Другий: `return a !== a && b !== b;`.'
      ],
      tests: [
        { name: 'NaN дорівнює NaN', code: 'expect(objectIs(NaN, NaN)).toBe(true);\nexpect(objectIs(NaN, 0 / 0)).toBe(true);' },
        { name: '+0 і -0 різні', code: 'expect(objectIs(0, -0)).toBe(false);\nexpect(objectIs(-0, 0)).toBe(false);\nexpect(objectIs(-0, -0)).toBe(true);\nexpect(objectIs(0, 0)).toBe(true);' },
        { name: 'звичайні значення — як ===', code: 'expect(objectIs(1, 1)).toBe(true);\nexpect(objectIs("a", "a")).toBe(true);\nexpect(objectIs(1, "1")).toBe(false);\nexpect(objectIs(null, undefined)).toBe(false);\nexpect(objectIs(NaN, "NaN")).toBe(false);' },
        { name: 'об\'єкти — за посиланням', code: 'const o = {};\nexpect(objectIs(o, o)).toBe(true);\nexpect(objectIs({}, {})).toBe(false);' },
        { name: 'не використовує Object.is', code: 'const orig = Object.is;\nlet r1, r2, err = null;\nObject.is = () => { throw new Error("Object.is заборонено"); };\ntry {\n  r1 = objectIs(NaN, NaN);\n  r2 = objectIs(0, -0);\n} catch (e) {\n  err = e;\n} finally {\n  Object.is = orig;\n}\nexpect(err).toBeNull();\nexpect(r1).toBe(true);\nexpect(r2).toBe(false);' }
      ],
      explanation: `
O(1), це поліфіл з MDN. Не беріть глобальний \`isNaN\`: \`isNaN('a') && isNaN('b')\` → \`true\`. Альтернатива для NaN — \`Number.isNaN(a) && Number.isNaN(b)\`.
`
    },
    {
      id: 'types-null-comparisons',
      group: 'equality',
      type: 'quiz',
      level: 3,
      title: 'null >= 0: класика',
      tags: ['equality', 'comparison', 'null'],
      question: `
Що виведе код?

\`\`\`js
console.log(null > 0);
console.log(null == 0);
console.log(null >= 0);
console.log(undefined >= 0);
console.log(undefined == null);
\`\`\`
`,
      options: [
        '`false false false false true`',
        '`false false true false true`',
        '`false true true false true`',
        '`false false true true false`'
      ],
      answer: 1,
      why: [
        "`>=` приводить null до 0, а `0 >= 0` — true.",
        "Правильно: `>`/`>=` рахують числами (null → 0, undefined → NaN), а `==` має окреме правило для null.",
        "`null == 0` — false: у == null дорівнює лише undefined.",
        "undefined → NaN, а будь-яке порівняння з NaN — false; `undefined == null` — true."
      ],
      hint: '>= і == — різні алгоритми.',
      explanation: `
\`>\`, \`>=\` приводять до числа: \`null\` → 0, \`undefined\` → NaN. \`==\` для null не приводить, а застосовує правило «лише undefined». Висновок: перевіряйте null явно перед порівнянням.
`
    },
    {
      id: 'types-wat',
      group: 'equality',
      type: 'quiz',
      level: 3,
      title: '[] == ![] та інші «WAT»',
      tags: ['equality', 'coercion', 'trick'],
      question: `
Що виведе код?

\`\`\`js
console.log([] == ![]);
console.log([] + {});
console.log([1, 2] + [3]);
console.log([] + null + 1);
\`\`\`
`,
      options: [
        '`false` / `[object Object]` / `1,23` / `null1`',
        '`true` / `{}` / `[1,2,3]` / `1`',
        '`true` / `[object Object]` / `1,23` / `null1`',
        '`true` / `[object Object]` / `6` / `1`'
      ],
      answer: 2,
      why: [
        "`![]` → false, далі `[] == false` → `'' == 0` → true.",
        "Об'єкт у + стає «[object Object]», масиви — рядками через кому, не з'єднуються як масиви.",
        "Правильно: масиви й об'єкти в + стають рядками, а після першого рядка все склеюється.",
        "`[1, 2] + [3]` — це «1,2» + «3» = «1,23»; `'' + null` дає «null», а не 0."
      ],
      hint: 'Спочатку ![] (об\'єкт truthy). Масиви в + стають рядками.',
      explanation: `
\`[] == ![]\`: \`![]\` → false → 0; \`[]\` → \`''\` → 0; \`0 == 0\`. \`[] + null + 1\` → \`'' + null\` = \`'null'\`, далі \`'null1'\` (обчислення зліва направо).
`
    },
    {
      id: 'types-select-filter',
      group: 'equality',
      type: 'code',
      level: 2,
      title: 'Фільтр зі <select>: порівняння без ==',
      tags: ['equality', 'coercion', 'forms'],
      description: `
**Завдання.** Напишіть \`matchesFilter(value, selected)\` для фільтра списку. \`selected\` — значення з \`<select>\` (завжди рядок), \`value\` — поле товару з API (число, boolean, рядок або null).

**Де трапляється:** фільтри каталогу й таблиць: \`<option value="0">\`, \`<option value="true">\`. Порівняння через \`==\` дає неочевидні збіги й пропуски.

**Що написати**
- \`matchesFilter(value, selected)\` → boolean:
  - \`selected === ''\` («Усі») → \`true\`;
  - \`value\` — \`null\` або \`undefined\` → \`false\`;
  - інакше \`true\`, якщо \`String(value) === selected\`.

**Приклад**
\`\`\`js
matchesFilter(0, '0');          // true
matchesFilter(false, 'false');  // true   (а false == 'false' → false!)
matchesFilter(true, '1');       // false  (а true == '1' → true!)
matchesFilter(null, '0');       // false
matchesFilter(5, '');           // true   — фільтр не вибрано
\`\`\`

**Як це працює:** \`==\` перетворює boolean на число: \`false == 'false'\` → \`0 == NaN\` → false; \`true == '1'\` → \`1 == 1\` → true. Явне \`String(value) === selected\` порівнює те, що бачить користувач.

**Врахуйте:** \`matchesFilter('', '0')\` → \`false\`; \`matchesFilter(null, 'null')\` → \`false\`.
`,
      starter: `function matchesFilter(value, selected) {
  // 1. selected === '' означає «Усі» → true.
  // TODO

  // 2. null / undefined ніколи не збігаються з вибраним значенням.
  // TODO

  // 3. Порівняйте явно: String(value) === selected (не ==).
  // TODO
}

// Спробуйте в консолі:
// matchesFilter(false, 'false'); // true
// matchesFilter(true, '1');      // false
`,
      solution: `function matchesFilter(value, selected) {
  if (selected === '') return true;                        // «Усі»
  if (value === null || value === undefined) return false;
  // явне приведення замість ==: true == '1' → true, false == 'false' → false
  return String(value) === selected;
}
`,
      hints: [
        'Три рядки: перевірка `selected === \'\'`, перевірка null/undefined, порівняння.',
        'Останній рядок: `return String(value) === selected;`'
      ],
      tests: [
        { name: 'порожній selected — показуємо все', code: 'expect(matchesFilter(5, "")).toBe(true);\nexpect(matchesFilter(null, "")).toBe(true);\nexpect(matchesFilter(false, "")).toBe(true);' },
        { name: 'числа', code: 'expect(matchesFilter(0, "0")).toBe(true);\nexpect(matchesFilter(10, "10")).toBe(true);\nexpect(matchesFilter(10, "1")).toBe(false);' },
        { name: 'boolean — без пасток ==', code: 'expect(matchesFilter(false, "false")).toBe(true);\nexpect(matchesFilter(true, "true")).toBe(true);\nexpect(matchesFilter(true, "1")).toBe(false);\nexpect(matchesFilter(false, "0")).toBe(false);' },
        { name: 'null та undefined не проходять', code: 'expect(matchesFilter(null, "0")).toBe(false);\nexpect(matchesFilter(null, "null")).toBe(false);\nexpect(matchesFilter(undefined, "undefined")).toBe(false);' },
        { name: 'рядки', code: 'expect(matchesFilter("new", "new")).toBe(true);\nexpect(matchesFilter("", "0")).toBe(false);\nexpect(matchesFilter("New", "new")).toBe(false);' }
      ],
      explanation: `
O(1). З \`==\` фільтр «true» не знайшов би \`true\` за \`'true'\`, зате \`'1'\` збігся б з \`true\`. Явне приведення + \`===\` робить поведінку передбачуваною.

Далі можуть спитати: як порівнювати без урахування регістру (\`toLowerCase\` — наступна тема)?
`
    },

    // ================================================================ 6. примітиви, посилання, обгортки
    {
      id: 'types-primitive-vs-reference',
      group: 'references',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Передача за значенням і за посиланням',
      tags: ['primitives', 'references', 'memory'],
      question: 'Як у JavaScript передаються аргументи у функцію — за значенням чи за посиланням? Що відбувається при присвоєнні об\'єкта іншій змінній? Оберіть **усі** правильні твердження.',
      choices: [
        'Усе передається за значенням; для об\'єкта цим значенням є посилання (call by sharing)',
        'Об\'єкти передаються за посиланням, як `ref` у C#, тож `user = {}` змінить зовнішню змінну',
        '`const obj = {}` робить об\'єкт незмінним, тому `obj.x = 1` кине помилку',
        'Мутація властивостей параметра видна викликачу, а перепризначення параметра — ні',
        'Присвоєння `const copy = obj` створює копію, тож зміна `copy.x` не зачепить `obj`'
      ],
      correct: [0, 3],
      why: [
        "Правильно: копіюється значення змінної, а для об'єкта це посилання.",
        "Перепризначення параметра змінює лише локальну змінну — зовнішня й далі вказує на старий об'єкт.",
        "`const` забороняє лише перепризначити змінну; вміст об'єкта змінювати можна.",
        "Правильно: обидві змінні вказують на той самий об'єкт, але параметр — окрема змінна.",
        "Копіюється посилання: `copy` і `obj` — той самий об'єкт."
      ],
      hint: 'Чим мутація відрізняється від перепризначення параметра?',
      answer: `
- Усе передається **за значенням**; для об'єкта значення — посилання (**call by sharing**).
- Мутація (\`user.name = 'Bob'\`, \`list.push(1)\`) видна ззовні.
- Перепризначення (\`user = {...}\`) змінює лише локальну змінну.
\`\`\`js
function update(user) {
  user.name = 'Bob';          // видно ззовні
  user = { name: 'Charlie' }; // не видно
}
const u = { name: 'Alice' };
update(u);
u.name; // 'Bob'
\`\`\`
- \`const\` забороняє перепризначення, не мутацію.
- Об'єкти порівнюються за посиланням: \`{a: 1} === {a: 1}\` → false.
`,
      keyPoints: [
        'Call by sharing: копія посилання',
        'Мутація видна, перепризначення — ні',
        'const не робить об\'єкт незмінним',
        'Порівняння об\'єктів — за посиланням'
      ],
      followUps: ['Як зробити функцію, що не мутує вхідний масив?', 'Чому в React не можна мутувати state?']
    },
    {
      id: 'types-pass-by-sharing',
      group: 'references',
      type: 'quiz',
      level: 2,
      title: 'Мутація vs перепризначення параметра',
      tags: ['references', 'functions'],
      question: `
Що виведе код?

\`\`\`js
function update(user, count, list) {
  user.name = 'Bob';
  user = { name: 'Charlie' };
  count++;
  list.push(4);
  list = [];
}

const u = { name: 'Alice' };
let c = 1;
const l = [1, 2, 3];
update(u, c, l);
console.log(u.name, c, l.length);
\`\`\`
`,
      options: [
        '`Charlie 2 0`',
        '`Alice 1 3`',
        '`Bob 2 4`',
        '`Charlie 1 0`',
        '`Bob 1 4`'
      ],
      answer: 4,
      why: [
        "Перепризначення `user = ...` і `list = []` не впливає на зовнішні змінні, а `count++` змінює лише копію числа.",
        "Мутації `user.name = 'Bob'` і `list.push(4)` змінюють спільні об'єкти — копії не створюються.",
        "`c` — примітив: `count++` змінює лише локальну копію, тож c лишається 1.",
        "Перепризначення параметрів не зачіпає зовнішні змінні — це не передача за посиланням.",
        "Правильно: мутації видно (Bob, довжина 4), перепризначення і count++ — ні."
      ],
      hint: 'Параметр — локальна змінна з копією значення (для об\'єкта — копією посилання).',
      explanation: `
\`user.name = 'Bob'\` і \`list.push(4)\` мутують спільні об'єкти. \`user = {...}\`, \`list = []\`, \`count++\` змінюють лише локальні змінні функції.
`
    },
    {
      id: 'types-wrappers',
      group: 'references',
      type: 'theory',
      level: 2,
      title: 'Об\'єкти-обгортки та autoboxing',
      tags: ['primitives', 'wrappers'],
      question: 'Якщо рядок — примітив, чому в нього є методи (`\'abc\'.toUpperCase()`)? Що таке об\'єкти-обгортки і чому не варто писати `new String` / `new Number`?',
      choices: [
        'Рядкові літерали — це об\'єкти `String`, тому методи зберігаються в кожному рядку',
        '`String(123)` і `new String(123)` еквівалентні: обидва повертають примітив `\'123\'`',
        'Властивість, записана в примітив (`s.custom = 1`), зберігається до наступного читання',
        'Autoboxing: рушій на мить обгортає примітив об\'єктом `String`, звідки й береться метод'
      ],
      correct: 3,
      why: [
        "Літерал — примітив (`typeof 'a'` → «string»); об'єкт створюється лише тимчасово.",
        "`String(123)` без new — приведення до примітиву, а `new String(123)` — об'єкт.",
        "Запис іде в тимчасову обгортку, яка одразу зникає; наступне читання дасть undefined.",
        "Правильно: обгортка живе лише на час звернення до властивості."
      ],
      hint: 'Тимчасовий об\'єкт на мить звернення до властивості.',
      answer: `
- \`'abc'.length\`, \`(5).toFixed(2)\` → рушій створює тимчасову обгортку (\`String\`, \`Number\`, \`Boolean\`), бере метод і викидає її.
- \`s.custom = 1\` губиться (у strict mode — TypeError).
- \`String(x)\` без \`new\` — приведення, примітив; \`new String(x)\` — об'єкт.
\`\`\`js
new String('a') === 'a';  // false
typeof new String('a');   // "object"
if (new Boolean(false)) { /* виконається — об'єкт truthy */ }
\`\`\`
- \`null\`/\`undefined\` обгорток не мають → \`null.foo\` — TypeError.
`,
      keyPoints: [
        'Autoboxing — тимчасова обгортка',
        'Властивість, записана в примітив, губиться',
        'String(x) — приведення, new String(x) — об\'єкт',
        'new Boolean(false) truthy'
      ],
      followUps: ['Чому 5.toFixed(2) — синтаксична помилка, а (5).toFixed(2) — ні?', 'Чому null.foo кидає TypeError?']
    },
    {
      id: 'types-wrapper-output',
      group: 'references',
      type: 'quiz',
      level: 3,
      title: 'Примітиви, обгортки та властивості',
      tags: ['primitives', 'wrappers'],
      question: `
Що виведе код (не strict mode)?

\`\`\`js
let str = 'hello';
str.custom = 42;
console.log(str.custom);
console.log(typeof new String('a'));
console.log(new String('a') == 'a');
console.log(new String('a') === new String('a'));
console.log(new Boolean(false) ? 'yes' : 'no');
\`\`\`
`,
      options: [
        '`42 string true true no`',
        '`undefined object true false yes`',
        '`undefined string true false no`',
        '`undefined object false false yes`',
        '`42 object true false yes`'
      ],
      answer: 1,
      why: [
        "Властивість у примітиві не зберігається, а `new` завжди створює об'єкт.",
        "Правильно: властивість загубилась, new дає об'єкт, == приводить обгортку до 'a', два об'єкти різні, об'єкт truthy.",
        "`new String('a')` — об'єкт («object»), а будь-який об'єкт truthy → 'yes'.",
        "`==` перетворює обгортку на примітив 'a', тому `new String('a') == 'a'` → true.",
        "Запис `str.custom = 42` іде в тимчасову обгортку, тож читання дає undefined."
      ],
      hint: 'new завжди створює об\'єкт, а об\'єкти порівнюються за посиланням.',
      explanation: `
Читання \`str.custom\` створює нову обгортку — властивості немає. Два \`new String\` — два різні об'єкти. \`new Boolean(false)\` — об'єкт, тому truthy. Висновок: не використовуйте \`new\` з обгортками.
`
    },
    {
      id: 'types-is-empty',
      group: 'references',
      type: 'code',
      level: 2,
      title: 'isEmpty(value): показати «Нічого не знайдено»',
      tags: ['type-checking', 'objects'],
      description: `
**Завдання.** Напишіть \`isEmpty(value)\`, що визначає, чи значення «порожнє» — щоб показати заглушку замість списку.

**Де трапляється:** API повертає для «немає даних» то \`null\`, то \`''\`, то \`[]\`, то \`{}\`. Потрібно показати «Кошик порожній». Аналог \`_.isEmpty\` з lodash.

**Що написати**
- \`isEmpty(value)\` → boolean:
  - \`null\`, \`undefined\` → \`true\`;
  - рядок і масив → \`true\`, якщо \`length === 0\` (рядок з пробілів — **не** порожній);
  - об'єкт → \`true\`, якщо немає власних ключів (\`Object.keys(value).length === 0\`);
  - числа (включно з \`0\`, \`NaN\`), boolean, bigint, функції → \`false\`.

**Приклад**
\`\`\`js
isEmpty(null);             // true
isEmpty('');               // true
isEmpty([]);               // true
isEmpty({});               // true
isEmpty(0);                // false  — 0 це значення, а не «нічого»
isEmpty({ a: undefined }); // false  — ключ є
\`\`\`

**Як це працює:** \`!value\` тут не підходить: \`0\` і \`false\` falsy, хоча не порожні, а \`[]\` і \`{}\` truthy, хоча порожні. Тому звужуємо тип по черзі. \`Object.keys(obj)\` повертає масив власних ключів об'єкта.

**Врахуйте:** перевірку масиву зробіть до перевірки об'єкта (\`typeof [] === 'object'\`).
`,
      starter: `function isEmpty(value) {
  // 1. null / undefined → true
  // TODO

  // 2. Рядок або масив → length === 0
  // TODO

  // 3. Об'єкт → немає ключів (Object.keys)
  // TODO

  // 4. Усе інше (числа, boolean, функції) → false
  // TODO
}

// Спробуйте в консолі:
// isEmpty([]); // true
// isEmpty(0);  // false
`,
      solution: `function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  // числа, boolean, bigint, функції — це значення, а не колекції
  return false;
}
`,
      hints: [
        'Порядок: null/undefined → рядок/масив (`length`) → об\'єкт (`Object.keys`) → `false`.',
        'Для об\'єкта: `if (typeof value === \'object\') return Object.keys(value).length === 0;`'
      ],
      tests: [
        { name: 'null та undefined → true', code: 'expect(isEmpty(null)).toBe(true);\nexpect(isEmpty(undefined)).toBe(true);' },
        { name: 'рядки та масиви', code: 'expect(isEmpty("")).toBe(true);\nexpect(isEmpty(" ")).toBe(false);\nexpect(isEmpty([])).toBe(true);\nexpect(isEmpty([undefined])).toBe(false);\nexpect(isEmpty([0])).toBe(false);' },
        { name: 'об\'єкти', code: 'expect(isEmpty({})).toBe(true);\nexpect(isEmpty({ a: undefined })).toBe(false);\nexpect(isEmpty({ items: [] })).toBe(false);' },
        { name: 'числа, boolean та функції → false', code: 'expect(isEmpty(0)).toBe(false);\nexpect(isEmpty(NaN)).toBe(false);\nexpect(isEmpty(false)).toBe(false);\nexpect(isEmpty(0n)).toBe(false);\nexpect(isEmpty(() => {})).toBe(false);' }
      ],
      explanation: `
O(1) для рядків і масивів, O(k) для об'єкта (\`Object.keys\` будує масив ключів). Помилки: \`!value\`; \`JSON.stringify(value) === '{}'\` — повільно і ламається на \`undefined\`-значеннях.

Далі можуть спитати: чи вважати рядок з пробілів порожнім для валідації форми (\`trim\`)?
`
    },
    {
      id: 'types-type-guard',
      group: 'references',
      type: 'code',
      level: 3,
      title: 'Перевірка відповіді API за схемою',
      tags: ['type-checking', 'validation', 'recursion'],
      description: `
**Завдання.** Напишіть \`matches(value, schema)\` — перевірку, що дані (наприклад, відповідь API) відповідають схемі. Повертає \`true\`/\`false\`.

**Де трапляється:** захист від «зламаної» відповіді бекенду перед рендером; спрощена версія Zod/Yup.

**Що написати**
- \`matches(value, schema)\` → boolean, де \`schema\` — одне з:
  - рядок-тип: \`'string'\`, \`'number'\` (NaN не проходить), \`'boolean'\`, \`'bigint'\`, \`'function'\`, \`'undefined'\`, \`'null'\`, \`'array'\`, \`'object'\` (не null і не масив), \`'any'\`;
  - рядок із \`?\` у кінці (\`'string?'\`) — також дозволено \`undefined\` / відсутній ключ;
  - \`[schema]\` — масив, **кожен** елемент відповідає \`schema\`;
  - \`{ key: schema }\` — об'єкт, кожен ключ відповідає своїй схемі, **зайві ключі заборонені**.

**Приклад**
\`\`\`js
const userSchema = { id: 'number', name: 'string', email: 'string?', tags: ['string'] };

matches({ id: 1, name: 'Ann', tags: [] }, userSchema);    // true
matches({ id: '1', name: 'Ann', tags: [] }, userSchema);  // false — id не число
matches(null, 'object');                                  // false
matches(NaN, 'number');                                   // false
matches({ a: 1, extra: 2 }, { a: 'number' });             // false — зайвий ключ
\`\`\`

**Як це працює:** розгалуження за видом схеми. Для вкладених схем функція викликає сама себе (рекурсія) для кожного елемента/ключа. \`typeof\` закриває більшість типів, окремо — \`null\`, \`array\`, \`object\` і NaN.

**Врахуйте:** відсутній ключ дає \`undefined\` — для \`'string?'\` це ок. \`schema.slice(0, -1)\` — рядок без останнього символу.
`,
      starter: `function matches(value, schema) {
  // 1. Рядок-тип.
  if (typeof schema === 'string') {
    // a) закінчується на '?' → undefined або matches(value, тип без '?')
    // b) 'any', 'null', 'array', 'object', 'number' (без NaN) — окремі правила
    // c) решта — typeof value === schema
    // TODO
  }

  // 2. Масив [itemSchema]: value — масив і кожен елемент matches(item, schema[0]).
  // TODO

  // 3. Об'єкт { key: schema }: value — об'єкт (не null, не масив),
  //    жодного ключа поза схемою, кожен ключ схеми — matches(value[key], schema[key]).
  // TODO
}

// Спробуйте в консолі:
// matches({ id: 1 }, { id: 'number' }); // true
// matches([1, '2'], ['number']);        // false
`,
      solution: `function isObjectLike(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function matches(value, schema) {
  // 1. рядок-тип
  if (typeof schema === 'string') {
    if (schema[schema.length - 1] === '?') {
      return value === undefined || matches(value, schema.slice(0, -1));
    }
    if (schema === 'any') return true;
    if (schema === 'null') return value === null;
    if (schema === 'array') return Array.isArray(value);
    if (schema === 'object') return isObjectLike(value); // typeof null === 'object'
    if (schema === 'number') return typeof value === 'number' && !Number.isNaN(value);
    return typeof value === schema;
  }

  // 2. масив [itemSchema]
  if (Array.isArray(schema)) {
    if (!Array.isArray(value)) return false;
    for (const item of value) {
      if (!matches(item, schema[0])) return false;
    }
    return true;
  }

  // 3. об'єкт { key: schema }
  if (!isObjectLike(value)) return false;
  for (const key of Object.keys(value)) {
    if (!Object.hasOwn(schema, key)) return false; // зайвий ключ
  }
  for (const key of Object.keys(schema)) {
    if (!matches(value[key], schema[key])) return false;
  }
  return true;
}
`,
      hints: [
        'Почніть з рядків-типів: `?` → `value === undefined || matches(value, schema.slice(0, -1))`; далі `if` для особливих типів і `typeof value === schema`.',
        'Масив і об\'єкт — цикли `for...of` з рекурсивним `matches`; зайві ключі шукайте через `Object.hasOwn(schema, key)`.'
      ],
      tests: [
        { name: 'прості типи', code: 'expect(matches("a", "string")).toBe(true);\nexpect(matches(1, "string")).toBe(false);\nexpect(matches(1, "number")).toBe(true);\nexpect(matches(NaN, "number")).toBe(false);\nexpect(matches(null, "null")).toBe(true);\nexpect(matches(undefined, "null")).toBe(false);\nexpect(matches(() => {}, "function")).toBe(true);\nexpect(matches(5n, "bigint")).toBe(true);' },
        { name: 'object і array розрізняються', code: 'expect(matches({}, "object")).toBe(true);\nexpect(matches(null, "object")).toBe(false);\nexpect(matches([], "object")).toBe(false);\nexpect(matches([], "array")).toBe(true);\nexpect(matches({ length: 0 }, "array")).toBe(false);\nexpect(matches(() => {}, "object")).toBe(false);' },
        { name: 'опціональні типи', code: 'expect(matches(undefined, "string?")).toBe(true);\nexpect(matches("x", "string?")).toBe(true);\nexpect(matches(null, "string?")).toBe(false);\nexpect(matches({}, { email: "string?" })).toBe(true);' },
        { name: 'масиви елементів', code: 'expect(matches([], ["number"])).toBe(true);\nexpect(matches([1, 2, 3], ["number"])).toBe(true);\nexpect(matches([1, "2"], ["number"])).toBe(false);\nexpect(matches("abc", ["string"])).toBe(false);\nexpect(matches([[1], [2, 3]], [["number"]])).toBe(true);' },
        { name: 'вкладені об\'єкти', code: 'const schema = { id: "number", name: "string", tags: ["string"], address: { city: "string", zip: "string?" } };\nexpect(matches({ id: 1, name: "Ann", tags: ["a"], address: { city: "Kyiv" } }, schema)).toBe(true);\nexpect(matches({ id: 1, name: "Ann", tags: ["a"], address: { city: 5 } }, schema)).toBe(false);\nexpect(matches({ id: 1, name: "Ann", tags: ["a"] }, schema)).toBe(false);\nexpect(matches({ id: 1, name: "Ann", tags: ["a"], address: null }, schema)).toBe(false);' },
        { name: 'зайві ключі заборонені', code: 'expect(matches({ a: 1, extra: 2 }, { a: "number" })).toBe(false);\nexpect(matches({ a: 1, b: { c: 1, d: 2 } }, { a: "number", b: { c: "number" } })).toBe(false);' },
        { name: 'any пропускає все', code: 'expect(matches({ data: [1, "x", null] }, { data: "any" })).toBe(true);\nexpect(matches({ data: undefined }, { data: "any" })).toBe(true);' }
      ],
      explanation: `
O(n) за кількістю вузлів у даних. Пастки, що ламають наївні валідатори: \`typeof null\`, \`typeof []\`, \`typeof NaN\`. \`Object.hasOwn\` не бачить успадкованих ключів (на відміну від \`in\`).

Далі можуть спитати: як повертати шлях до помилки (\`address.city: expected string\`)? Як додати union (\`'string|null'\`)?
`
    }
  ]
});
