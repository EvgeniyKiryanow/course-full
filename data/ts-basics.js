FE.topic('ts-basics', {
  intro: `
**TypeScript** — JavaScript з типами, які перевіряються **до запуску**. Після компіляції типи зникають: у браузері виконується звичайний JS.

| Що | Як |
|---|---|
| Анотація | \`let age: number = 30;\` \`function f(x: string): boolean\` |
| Виведення | \`let a = 'hi'\` → \`string\`, \`const b = 'hi'\` → \`'hi'\` |
| Об'єкт | \`interface User { name: string; age?: number; readonly id: number }\` |
| Об'єднання | \`string \\| number\`, літерали \`'asc' \\| 'desc'\` |
| Звуження | \`typeof\`, \`===\`, \`in\`, \`instanceof\` усередині \`if\` |
| Безпечне «щось» | \`unknown\` (треба перевірити) замість \`any\` (вимикає перевірку) |

**Як перевіряються задачі.** Код компілюється з \`--strict\` — помилки типів показуються у вкладці «Тести» з номером рядка. Тести типів використовують \`Expect<Equal<A, B>>\` (типи мають збігатися точно) і \`// @ts-expect-error\` (рядок нижче **має** давати помилку). Ці хелпери доступні й вам. Помилки компілятора — англійською, як у реальних проєктах: TS2322 «Type X is not assignable to type Y» — найчастіша.
`,
  groups: [
    { id: 'annotations', title: 'Анотації та виведення типів' },
    { id: 'objects', title: 'Об\'єкти, масиви і кортежі' },
    { id: 'unions', title: 'Об\'єднання, літерали і звуження' },
    { id: 'functions', title: 'Функції: параметри, void, перевантаження' },
    { id: 'interfaces', title: 'Interface vs type, enum vs as const' },
    { id: 'unknown-any', title: 'any, unknown, never, as і satisfies' }
  ],
  items: [
    // ---------------------------------------------------------------- анотації
    {
      id: 'ts-quiz-inference', group: 'annotations', type: 'quiz', level: 1,
      title: 'Що виведе TypeScript',
      question: `
Які типи TypeScript виведе для \`a\` і \`b\`?

\`\`\`ts
let a = 'hello';
const b = 'hello';
\`\`\`
`,
      options: ['`string` і `string`', '`string` і `"hello"`', '`"hello"` і `"hello"`', '`any` і `string`'],
      answer: 1,
      why: [
        'Ні: const не можна перепризначити, тож TS звужує тип до літерала.',
        'Так: let може змінитися на інший рядок — тип розширюється до string; const — літеральний тип.',
        'Ні: let розширюється (widening), бо значення може змінитися.',
        'Ні: виведення працює з ініціалізатора, any не з\'являється.'
      ],
      hint: 'Яке значення може опинитися в змінній пізніше?',
      explanation: '**Widening:** `let` отримує загальний тип (`string`), `const` — літеральний (`"hello"`). Для об\'єктів навіть з `const` властивості розширюються: `const d = { role: \'admin\' }` → `{ role: string }`, бо властивість можна змінити. Звузити до літералів можна через `as const`. Масив `[1, \'x\']` виводиться як `(string | number)[]`, а не кортеж.'
    },
    {
      id: 'ts-format-price', group: 'annotations', type: 'code', runtime: 'ts', level: 1,
      title: 'Перша типізована функція',
      description: `
**Завдання.** Додайте типи до \`formatPrice(amount, currency)\`:
- \`amount\` — число;
- \`currency\` — лише \`'UAH'\` або \`'USD'\`, за замовчуванням \`'UAH'\`;
- функція повертає рядок: \`'125.50 UAH'\` (дві цифри після коми).

**Де трапляється:** будь-яка утиліта форматування. Без типів \`formatPrice('100')\` чи \`formatPrice(10, 'EUR')\` «тихо» працює неправильно, з типами — це помилка ще в редакторі.

**Як це працює:** у режимі \`strict\` параметр без типу — помилка (*implicitly has an 'any' type*). Тип параметра пишуть після двокрапки, тип результату — після дужок.
`,
      starter: `function formatPrice(amount, currency = 'UAH') {
  return amount.toFixed(2) + ' ' + currency;
}
`,
      solution: `function formatPrice(amount: number, currency: 'UAH' | 'USD' = 'UAH'): string {
  return amount.toFixed(2) + ' ' + currency;
}
`,
      hints: ['`amount: number`, а для валюти — об\'єднання літералів `\'UAH\' | \'USD\'`.', 'Тип результату: `): string {`.'],
      tests: [
        "expect(formatPrice(125.5)).toBe('125.50 UAH')",
        "expect(formatPrice(10, 'USD')).toBe('10.00 USD')"
      ],
      typeTests: [
        { name: 'рядок замість числа — помилка', code: "// @ts-expect-error\nformatPrice('100');" },
        { name: 'невідома валюта — помилка', code: "// @ts-expect-error\nformatPrice(10, 'EUR');" },
        { name: 'повертає string', code: "type R = Expect<Equal<ReturnType<typeof formatPrice>, string>>;" }
      ],
      explanation: 'Літеральні типи (`\'UAH\' | \'USD\'`) — найпростіший спосіб обмежити значення без enum. Тип результату можна вивести автоматично, але явний `: string` на публічних функціях — документація і захист від випадкової зміни. `strict` (зокрема `noImplicitAny` і `strictNullChecks`) — стандарт для нових проєктів.'
    },
    {
      id: 'ts-quiz-type-erasure', group: 'annotations', type: 'quiz', level: 2,
      title: 'Чи існують типи під час виконання',
      question: `
Що станеться під час **виконання**?

\`\`\`ts
interface User { name: string }
const data = JSON.parse('{"nme": "Ann"}') as User;
console.log(data.name.toUpperCase());
\`\`\`
`,
      options: [
        'TypeScript перевірить JSON і кине помилку валідації',
        '`TypeError`: `data.name` — undefined; типи зникли після компіляції і нічого не перевірили',
        'Виведе `ANN`, бо `as User` перейменує поле',
        'Помилка компіляції: JSON.parse не можна приводити до інтерфейсу'
      ],
      answer: 1,
      why: [
        'Ні: TS не генерує перевірок — інтерфейси зникають (type erasure).',
        'Так: `as` — лише обіцянка компілятору; реальні дані не перевіряються.',
        'Ні: `as` не змінює дані.',
        'Ні: JSON.parse повертає any, приведення дозволене.'
      ],
      hint: 'Що лишається від `interface` у скомпільованому JavaScript?',
      explanation: 'Типи існують лише під час компіляції. Дані ззовні (API, `localStorage`, форми) треба **перевіряти в рантаймі**: власні type guards або бібліотеки схем (Zod, Valibot), які дають і перевірку, і тип: `type User = z.infer<typeof UserSchema>`. `JSON.parse` повертає `any` — тому краще `unknown` + перевірка.'
    },
    // ---------------------------------------------------------------- об'єкти
    {
      id: 'ts-quiz-structural', group: 'objects', type: 'quiz', level: 2, interview: true,
      title: 'Структурна типізація і зайві властивості',
      question: `
Який рядок дасть помилку?

\`\`\`ts
interface Point { x: number; y: number }
const p1: Point = { x: 1, y: 2, z: 3 };   // A
const raw = { x: 1, y: 2, z: 3 };
const p2: Point = raw;                    // B
\`\`\`
`,
      options: ['Обидва', 'Лише A', 'Лише B', 'Жоден'],
      answer: 1,
      why: [
        'Ні: B компілюється — у raw є всі потрібні поля.',
        'Так: перевірка зайвих властивостей діє лише для літерала об\'єкта, записаного одразу в типізоване місце.',
        'Ні: навпаки.',
        'Ні: A — помилка TS2353 (z не існує в Point).'
      ],
      hint: 'TypeScript порівнює форму об\'єкта. А навіщо тоді помилка на літералі?',
      explanation: '**Структурна типізація:** тип сумісний, якщо має всі потрібні властивості — назва типу не важлива, зайві поля дозволені. **Excess property check** — окрема перевірка для **свіжих** літералів: найімовірніше, `z` — друкарська помилка. Для змінної `raw` такої перевірки немає.'
    },
    {
      id: 'ts-full-name', group: 'objects', type: 'code', runtime: 'ts', level: 1,
      title: 'Interface з необов\'язковим і readonly полем',
      description: `
**Завдання.** Опишіть \`interface User\`:
- \`id\` — число, **лише для читання**;
- \`firstName\`, \`lastName\` — рядки;
- \`middleName\` — **необов'язковий** рядок.

Напишіть \`fullName(user: User): string\`: \`'Taras Shevchenko'\` або з по батькові — \`'Taras H. Shevchenko'\` (перша літера + крапка).

**Де трапляється:** моделі даних з API: частина полів може бути відсутня, ідентифікатори не змінюються.

**Як це працює:** \`middleName?: string\` означає \`string | undefined\` — перед використанням поле треба перевірити (\`strictNullChecks\`).
`,
      starter: `interface User {
  // TODO
}

function fullName(user: User): string {
  // TODO
  return '';
}
`,
      solution: `interface User {
  readonly id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
}

function fullName(user: User): string {
  const middle = user.middleName ? ' ' + user.middleName[0] + '.' : '';
  return user.firstName + middle + ' ' + user.lastName;
}
`,
      hints: ['`readonly id: number;` і `middleName?: string;`', 'Без перевірки `user.middleName[0]` — помилка: «possibly undefined».'],
      tests: [
        "expect(fullName({ id: 1, firstName: 'Taras', lastName: 'Shevchenko' })).toBe('Taras Shevchenko')",
        "expect(fullName({ id: 2, firstName: 'Taras', middleName: 'Hryhorovych', lastName: 'Shevchenko' })).toBe('Taras H. Shevchenko')"
      ],
      typeTests: [
        { name: 'id не можна змінити', code: "declare const u: User;\n// @ts-expect-error\nu.id = 5;" },
        { name: 'lastName обов\'язкове', code: "// @ts-expect-error\nconst bad: User = { id: 1, firstName: 'A' };" },
        { name: 'middleName — необов\'язкове', code: "const ok: User = { id: 1, firstName: 'A', lastName: 'B' };" }
      ],
      explanation: '`?` додає `undefined` до типу і дозволяє не передавати поле. `readonly` забороняє присвоєння, але **не** робить вкладені об\'єкти незмінними (неглибоко) і не існує в рантаймі. Для масивів — `readonly string[]` або `ReadonlyArray<string>`.'
    },
    {
      id: 'ts-quiz-tuple', group: 'objects', type: 'quiz', level: 2,
      title: 'Кортеж і вихід за межі',
      question: `
Що повідомить TypeScript?

\`\`\`ts
const pair: [string, number] = ['a', 1];
const x = pair[2];
\`\`\`
`,
      options: [
        'Нічого: x має тип `string | number`',
        'Помилку: у кортежу довжини 2 немає елемента з індексом 2',
        'Нічого: x має тип `undefined`',
        'Помилку: кортеж не можна індексувати'
      ],
      answer: 1,
      why: [
        'Ні: для кортежів довжина відома, TS перевіряє індекс.',
        'Так: TS2493.',
        'Ні: це помилка, а не undefined.',
        'Ні: pair[0] і pair[1] — коректні доступи.'
      ],
      hint: 'Чим кортеж відрізняється від масиву `(string | number)[]`?',
      explanation: '**Кортеж** — масив фіксованої довжини з відомим типом кожної позиції: `[string, number]`. Типові застосування: повернення кількох значень (`useState` повертає `[value, setValue]`), пари ключ–значення. Мітки для читабельності: `[min: number, max: number]`.'
    },
    {
      id: 'ts-min-max', group: 'objects', type: 'code', runtime: 'ts', level: 2,
      title: 'readonly-масив на вході, кортеж на виході',
      description: `
**Завдання.** Напишіть \`minMax(nums)\`:
- приймає **будь-який** масив чисел, зокрема \`readonly\` (наприклад, створений через \`as const\`);
- повертає кортеж \`[min, max]\` або \`null\` для порожнього масиву.

**Де трапляється:** функції, що не змінюють вхідні дані, мають приймати і незмінні масиви — інакше їх не можна викликати з \`as const\`-даними чи пропсами.

**Як це працює:** \`number[]\` вимагає змінюваний масив, тому \`readonly\`-масив туди не передати. \`readonly number[]\` приймає обидва.
`,
      starter: `function minMax(nums: number[]) {
  if (nums.length === 0) return null;
  return [Math.min(...nums), Math.max(...nums)];
}
`,
      solution: `function minMax(nums: readonly number[]): [min: number, max: number] | null {
  if (nums.length === 0) return null;
  return [Math.min(...nums), Math.max(...nums)];
}
`,
      hints: ['Параметр: `nums: readonly number[]`.', 'Без явного типу результат виводиться як `number[] | null` — масив, а не кортеж. Додайте `: [number, number] | null`.'],
      tests: [
        "expect(minMax([3, 1, 7])).toEqual([1, 7])",
        "expect(minMax([])).toBeNull()"
      ],
      typeTests: [
        { name: 'приймає readonly-масив', code: "const ro = [5, 2, 9] as const;\nminMax(ro);" },
        { name: 'повертає кортеж або null', code: "type R = Expect<Equal<ReturnType<typeof minMax>, [number, number] | null>>;" }
      ],
      explanation: 'Правило: якщо функція не змінює масив чи об\'єкт — приймайте `readonly`-версію. Це і документація, і захист. Мітки кортежу (`[min: number, max: number]`) не змінюють тип — лише підказки в редакторі. Без анотації TS виводить `number[]`, бо масиви за замовчуванням не стають кортежами.'
    },
    // ---------------------------------------------------------------- об'єднання і звуження
    {
      id: 'ts-quiz-narrowing', group: 'unions', type: 'quiz', level: 1,
      title: 'Звуження типу в if',
      question: `
Які типи має \`x\` у позначених місцях?

\`\`\`ts
function fmt(x: string | number | null) {
  if (x === null) return '-';
  if (typeof x === 'string') {
    return x.trim();       // (1)
  }
  return x.toFixed(2);     // (2)
}
\`\`\`
`,
      options: [
        '(1) `string`, (2) `number`',
        '(1) `string | number`, (2) `number | null`',
        '(1) `string`, (2) `number | null`',
        'В обох місцях `string | number | null`'
      ],
      answer: 0,
      why: [
        'Так: після `return` для null і перевірки typeof лишається лише number.',
        'Ні: усередині `if (typeof x === \'string\')` тип звужений до string.',
        'Ні: null відсіяно першим `if` з `return`.',
        'Ні: TS відстежує потік керування (control flow analysis).'
      ],
      hint: 'TS «пам\'ятає» перевірки і ранні `return`.',
      explanation: '**Control flow analysis:** TypeScript звужує об\'єднання після перевірок `typeof`, `===`, `in`, `instanceof`, перевірок на truthy і після ранніх `return`/`throw`. Тому код з об\'єднаннями типобезпечний без приведень `as`.'
    },
    {
      id: 'ts-normalize-id', group: 'unions', type: 'code', runtime: 'ts', level: 2,
      title: 'Звуження string | number',
      description: `
**Завдання.** Напишіть \`normalizeId(id: string | number): string\`:
- число → \`'id-42'\`;
- рядок → без пробілів по краях і в нижньому регістрі: \`'  ABC '\` → \`'abc'\`.

**Де трапляється:** ідентифікатори з різних джерел (URL, API, форми) приходять то числом, то рядком.

**Як це працює:** \`id.trim()\` на \`string | number\` — помилка: у числа немає \`trim\`. Після \`typeof id === 'number'\` TS знає точний тип у кожній гілці.
`,
      starter: `function normalizeId(id: string | number): string {
  // TODO: гілка для number і для string
  return '';
}
`,
      solution: `function normalizeId(id: string | number): string {
  if (typeof id === 'number') return 'id-' + id;
  return id.trim().toLowerCase();
}
`,
      hints: ['`if (typeof id === \'number\') return ...;`', 'Після цього `if` TS знає, що `id` — рядок.'],
      tests: [
        "expect(normalizeId(42)).toBe('id-42')",
        "expect(normalizeId('  ABC ')).toBe('abc')"
      ],
      typeTests: [
        { name: 'null не приймається', code: "// @ts-expect-error\nnormalizeId(null);" }
      ],
      explanation: 'Звуження — основний інструмент роботи з об\'єднаннями: не `as`, а перевірки, які компілятор розуміє. Для об\'єктів — `in` (`\'email\' in user`), `instanceof` для класів, а найпотужніше — **розрізнювані об\'єднання** з полем-тегом (`kind`, `type`) — у модулі «TypeScript на практиці».'
    },
    {
      id: 'ts-quiz-optional-chain', group: 'unions', type: 'quiz', level: 1,
      title: 'Необов\'язкове поле і strictNullChecks',
      question: `
Який рядок дасть помилку і який тип матиме \`m\`?

\`\`\`ts
interface User { name: string; age?: number }
function f(u: User) {
  const n = u.age.toFixed(0);    // A
  const m = u.age?.toFixed(0);   // B
}
\`\`\`
`,
      options: [
        'Помилка в A; m: `string | undefined`',
        'Помилка в B; m: `string`',
        'Помилок немає; m: `string`',
        'Помилка в обох; m: `undefined`'
      ],
      answer: 0,
      why: [
        'Так: TS18048 «u.age is possibly undefined»; `?.` повертає undefined, якщо age немає.',
        'Ні: `?.` — правильний спосіб, помилки немає.',
        'Ні: без перевірки age може бути undefined.',
        'Ні: B коректний, а m — string | undefined.'
      ],
      hint: 'Що означає `?` у `age?: number`?',
      explanation: '`strictNullChecks` — найцінніший прапорець strict: `null` і `undefined` не входять у типи автоматично, тому «cannot read properties of undefined» ловиться на етапі компіляції. Інструменти: `?.`, `??`, перевірка в `if`, значення за замовчуванням. Оператор `!` (non-null assertion) вимикає перевірку — використовуйте лише коли точно знаєте більше за компілятор.'
    },
    // ---------------------------------------------------------------- функції
    {
      id: 'ts-quiz-void', group: 'functions', type: 'quiz', level: 3,
      title: 'void у типі функції',
      question: `
Який рядок дасть помилку?

\`\`\`ts
const f: () => void = () => 42;          // A
function g(): void { return 42; }        // B
\`\`\`
`,
      options: ['Обидва', 'Лише A', 'Лише B', 'Жоден'],
      answer: 2,
      why: [
        'Ні: A компілюється — тип функції з void дозволяє повертати що завгодно.',
        'Ні: навпаки.',
        'Так: оголошення `function g(): void` забороняє повертати значення, а тип `() => void` — ні.',
        'Ні: B — TS2322 (number не можна присвоїти void).'
      ],
      hint: 'Подумайте про `[1, 2].forEach((x) => arr.push(x))`: push повертає число, а forEach чекає `() => void`.',
      explanation: '`void` у **типі функції** означає «результат ігнорується», тому `arr.forEach(x => list.push(x))` компілюється, хоча `push` повертає число. А явна анотація `: void` в **оголошенні** функції забороняє `return значення`. Результат виклику `f()` має тип `void` — використовувати його не можна.'
    },
    {
      id: 'ts-quiz-overloads', group: 'functions', type: 'quiz', level: 3,
      title: 'Перевантаження функцій',
      question: `
Що повідомить TypeScript?

\`\`\`ts
function parse(x: string): number;
function parse(x: number): string;
function parse(x: string | number) {
  return typeof x === 'string' ? Number(x) : String(x);
}
const r1 = parse('1');
const r2 = parse(true);
\`\`\`
`,
      options: [
        'r1: `number`; на `parse(true)` — помилка «No overload matches this call»',
        'r1: `string | number`; помилок немає',
        'r1: `number`; помилок немає, `true` перетвориться на рядок',
        'Помилка: не можна оголошувати функцію тричі'
      ],
      answer: 0,
      why: [
        'Так: виклик зіставляється з сигнатурами перевантаження, реалізація ззовні не видима.',
        'Ні: тип результату береться з першої сигнатури, що підійшла.',
        'Ні: boolean не підходить жодній сигнатурі.',
        'Ні: це синтаксис перевантажень — сигнатури + одна реалізація.'
      ],
      hint: 'Яку сигнатуру бачить той, хто викликає функцію?',
      explanation: '**Перевантаження:** кілька сигнатур + одна реалізація з сумісним загальним типом. Сигнатура реалізації ззовні недоступна. Часто замість перевантажень простіше об\'єднання чи generic з умовним типом. Перевантаження корисні, коли тип результату залежить від типу аргументу (як у `document.createElement(\'canvas\')` → `HTMLCanvasElement`).'
    },
    {
      id: 'ts-sum-by', group: 'functions', type: 'code', runtime: 'ts', level: 2,
      title: 'Колбек як параметр',
      description: `
**Завдання.** Напишіть \`sumBy(items, getValue)\`: сума чисел, отриманих з кожного елемента функцією \`getValue\`.
- \`items\` — масив об'єктів \`Product\` (\`{ title: string; price: number; qty: number }\`);
- \`getValue\` — функція \`(item: Product) => number\`;
- результат — число.

**Де трапляється:** підсумки кошика, сума замовлень, статистика.

**Приклад**
\`\`\`ts
sumBy(cart, (p) => p.price * p.qty); // p виводиться як Product
\`\`\`

**Як це працює:** тип параметра-функції записують як \`(аргументи) => результат\`. Тоді в колбеці тип \`p\` виводиться автоматично (contextual typing).
`,
      starter: `interface Product {
  title: string;
  price: number;
  qty: number;
}

function sumBy(items, getValue) {
  // TODO: типи параметрів і результату
  return 0;
}
`,
      solution: `interface Product {
  title: string;
  price: number;
  qty: number;
}

function sumBy(items: readonly Product[], getValue: (item: Product) => number): number {
  let total = 0;
  for (const item of items) total += getValue(item);
  return total;
}
`,
      hints: ['`getValue: (item: Product) => number`', 'Тіло — звичайний цикл; не забудьте тип результату `: number`.'],
      tests: [
        "expect(sumBy([{ title: 'a', price: 10, qty: 2 }, { title: 'b', price: 5, qty: 1 }], (p) => p.price * p.qty)).toBe(25)",
        "expect(sumBy([], (p) => p.price)).toBe(0)"
      ],
      typeTests: [
        { name: 'колбек має повертати число', code: "// @ts-expect-error\nsumBy([], (p) => p.title);" },
        { name: 'тип p виводиться з параметра', code: "sumBy([], (p) => { type P = Expect<Equal<typeof p, Product>>; return 0; });" }
      ],
      explanation: 'Типи функцій — основа типізації колбеків, обробників подій і пропсів. Пізніше `sumBy` стане generic (`<T>(items: T[], getValue: (item: T) => number)`), і працюватиме з будь-якими об\'єктами — це модуль «Generics».'
    },
    // ---------------------------------------------------------------- interface/type, enum/as const
    {
      id: 'ts-interface-vs-type', group: 'interfaces', type: 'theory', level: 2, interview: true,
      title: 'interface чи type',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Два `interface` з однаковим ім\'ям зливаються в один (declaration merging), два `type` — помилка',
        'Тільки `type` може описати об\'єднання (`\'a\' | \'b\'`), кортеж чи результат умовного типу',
        '`interface` перевіряється в рантаймі, а `type` — ні',
        '`interface` розширюють через `extends`, `type` — через перетин `&`',
        'Для опису форми об\'єкта можна використати і те, і інше'
      ],
      correct: [0, 1, 3, 4],
      why: [
        'Так: на цьому побудоване доповнення глобальних типів (Window, бібліотеки).',
        'Так: interface описує лише об\'єктні форми.',
        'Ні: обидва зникають після компіляції.',
        'Так: extends для interface, & для type (interface може і extends type).',
        'Так: для об\'єктів вибір — переважно питання домовленостей команди.'
      ],
      hint: 'Що з них уміє «зливатися», а що — описувати не-об\'єкти?',
      answer: `
| | \`interface\` | \`type\` |
|---|---|---|
| Об'єктні форми | так | так |
| Об'єднання, кортежі, примітиви, умовні та mapped-типи | ні | так |
| Розширення | \`extends\` | \`&\` (перетин) |
| Declaration merging | так | ні (дублікат — помилка) |

**Практика:** \`interface\` — для публічних об'єктних контрактів, які можуть доповнюватися (наприклад, \`declare global { interface Window { analytics: Analytics } }\`); \`type\` — для об'єднань, утилітних і обчислюваних типів. Головне — послідовність у проєкті.
`,
      keyPoints: [
        'interface — лише об\'єктні форми, зливається',
        'type — будь-які типи: об\'єднання, кортежі, умовні',
        'extends vs &',
        'Обидва зникають у рантаймі'
      ]
    },
    {
      id: 'ts-quiz-merging', group: 'interfaces', type: 'quiz', level: 2,
      title: 'Однакові імена: interface і type',
      question: `
Що повідомить TypeScript?

\`\`\`ts
interface Win { a: number }
interface Win { b: string }
const w: Win = { a: 1, b: 'x' };

type T1 = { a: number };
type T1 = { b: string };
\`\`\`
`,
      options: [
        'Помилка лише для `type T1`: Duplicate identifier',
        'Помилка лише для `interface Win`',
        'Помилки для обох',
        'Помилок немає, обидва злилися'
      ],
      answer: 0,
      why: [
        'Так: інтерфейси злилися в { a; b }, а type не можна оголосити двічі.',
        'Ні: злиття інтерфейсів — легальна можливість.',
        'Ні: Win коректний.',
        'Ні: type aliases не зливаються.'
      ],
      hint: 'Що таке declaration merging?',
      explanation: 'Declaration merging дозволяє бібліотекам і вам доповнювати типи: `interface Window { myGlobal: X }` у `declare global`. Зворотний бік: випадкове злиття двох інтерфейсів з однаковим ім\'ям у глобальній області.'
    },
    {
      id: 'ts-quiz-enum', group: 'interfaces', type: 'quiz', level: 2, interview: true,
      title: 'enum чи об\'єднання літералів',
      question: `
Що повідомить TypeScript (версія 5.0+)?

\`\`\`ts
enum Color { Red, Green }
const c: Color = 5;            // A

type C2 = 'red' | 'green';
const d: C2 = 'blue';          // B
\`\`\`
`,
      options: ['Помилки в A і B', 'Лише B', 'Лише A', 'Жодної помилки'],
      answer: 0,
      why: [
        'Так: з TS 5.0 числові enum суворі — 5 не є значенням Color; B — \'blue\' не входить в об\'єднання.',
        'Ні: у старих версіях A проходив, але з TS 5.0 — помилка.',
        'Ні: B — помилка TS2322.',
        'Ні: обидва присвоєння некоректні.'
      ],
      hint: 'Чи може будь-яке число бути значенням enum?',
      explanation: '**enum** генерує JavaScript-об\'єкт (а `const enum` — ні, але з обмеженнями при ізольованій компіляції). Багато команд замість enum використовують **об\'єднання літералів** або `as const`-об\'єкт: нуль рантайм-коду, краща сумісність з Node.js type stripping (там enum не підтримується без перетворення коду) і з прапорцем `erasableSyntaxOnly`.'
    },
    {
      id: 'ts-statuses-as-const', group: 'interfaces', type: 'code', runtime: 'ts', level: 2,
      title: 'as const: тип з масиву значень',
      description: `
**Завдання.**
1. Зробіть масив \`STATUSES\` незмінним з літеральними типами (\`as const\`).
2. Виведіть з нього тип \`Status\` = \`'draft' | 'review' | 'published'\` — **без повторення** рядків вручну.
3. Напишіть \`nextStatus(s: Status): Status\`: draft → review → published → published.

**Де трапляється:** список значень потрібен і в рантаймі (опції select, валідація), і як тип. \`as const\` дає одне джерело правди.

**Як це працює:** \`as const\` робить масив \`readonly ['draft', 'review', 'published']\`. \`(typeof STATUSES)[number]\` — тип елемента за будь-яким числовим індексом, тобто об'єднання.
`,
      starter: `const STATUSES = ['draft', 'review', 'published'];

type Status = string; // TODO: вивести з STATUSES

function nextStatus(s: Status): Status {
  // TODO
  return s;
}
`,
      solution: `const STATUSES = ['draft', 'review', 'published'] as const;

type Status = (typeof STATUSES)[number];

function nextStatus(s: Status): Status {
  const i = STATUSES.indexOf(s);
  return STATUSES[Math.min(i + 1, STATUSES.length - 1)];
}
`,
      hints: ['`const STATUSES = [...] as const;` і `type Status = (typeof STATUSES)[number];`', 'Наступний статус — за індексом у масиві, обмеженим останнім елементом.'],
      tests: [
        "expect(nextStatus('draft')).toBe('review')",
        "expect(nextStatus('review')).toBe('published')",
        "expect(nextStatus('published')).toBe('published')"
      ],
      typeTests: [
        { name: 'Status — об\'єднання літералів', code: "type T = Expect<Equal<Status, 'draft' | 'review' | 'published'>>;" },
        { name: 'невідомий статус — помилка', code: "// @ts-expect-error\nnextStatus('deleted');" }
      ],
      explanation: '`typeof` у позиції типу бере тип значення, а `[number]` — індексний доступ (indexed access type). Так само для об\'єктів: `const ROLES = { admin: \'Адміністратор\', user: \'Користувач\' } as const; type Role = keyof typeof ROLES;`. Це сучасна альтернатива enum без рантайм-коду.'
    },
    // ---------------------------------------------------------------- any/unknown/never/as/satisfies
    {
      id: 'ts-quiz-unknown', group: 'unknown-any', type: 'quiz', level: 2, interview: true,
      title: 'any проти unknown',
      question: `
Який рядок дасть помилку?

\`\`\`ts
const a: any = JSON.parse('{}');
const u: unknown = JSON.parse('{}');
a.name.first;     // A
u.name;           // B
\`\`\`
`,
      options: ['Лише A', 'Лише B', 'Обидва', 'Жоден'],
      answer: 1,
      why: [
        'Ні: any вимикає перевірки — будь-який доступ дозволений (і впаде в рантаймі).',
        'Так: з unknown нічого не можна робити без звуження (TS18046).',
        'Ні: A компілюється.',
        'Ні: B — помилка.'
      ],
      hint: 'Який з типів змушує перевірити значення перед використанням?',
      explanation: '`any` — «вимкнути TypeScript» для значення, і він «заражає» все, до чого торкається. `unknown` — безпечний «будь-який»: спершу перевірка (`typeof`, `in`, type guard, схема), потім використання. Правило: дані ззовні — `unknown`, `any` — лише як тимчасовий крок міграції (і з ESLint `no-explicit-any`).'
    },
    {
      id: 'ts-parse-age', group: 'unknown-any', type: 'code', runtime: 'ts', level: 2,
      title: 'unknown на вході: безпечний парсинг',
      description: `
**Завдання.** Напишіть \`parseAge(input: unknown): number | null\`:
- ціле число від 0 до 150 → це число;
- рядок, що після \`trim\` є цілим числом від 0 до 150 (\`' 42 '\`) → число;
- усе інше (\`null\`, \`'abc'\`, \`-1\`, \`3.5\`, об'єкти) → \`null\`.

**Де трапляється:** дані з форм, URL, \`localStorage\`, \`JSON.parse\` — тип невідомий, перевірити треба до використання.

**Як це працює:** з \`unknown\` можна працювати лише після звуження: \`typeof input === 'string'\` → у цій гілці \`input\` — рядок.
`,
      starter: `function parseAge(input: unknown): number | null {
  // TODO: звузити тип через typeof і перевірити значення
  return null;
}
`,
      solution: `function parseAge(input: unknown): number | null {
  let n: number;
  if (typeof input === 'number') n = input;
  else if (typeof input === 'string' && /^\\d+$/.test(input.trim())) n = Number(input.trim());
  else return null;
  return Number.isInteger(n) && n >= 0 && n <= 150 ? n : null;
}
`,
      hints: ['Дві гілки: `typeof input === \'number\'` і `typeof input === \'string\'`.', 'Для рядка: `/^\\d+$/.test(input.trim())`, потім `Number(...)`. Наприкінці — `Number.isInteger` і межі.'],
      tests: [
        "expect(parseAge(42)).toBe(42)",
        "expect(parseAge(' 42 ')).toBe(42)",
        "expect([parseAge(null), parseAge('abc'), parseAge(-1), parseAge(3.5), parseAge({}), parseAge(200)]).toEqual([null, null, null, null, null, null])"
      ],
      explanation: '`unknown` змушує описати всі перевірки явно — саме тут ховаються баги з даними ззовні. Повторювані перевірки виносять у **type guards** (`function isUser(x: unknown): x is User`) або схеми (Zod) — модуль «TypeScript на практиці».'
    },
    {
      id: 'ts-quiz-satisfies', group: 'unknown-any', type: 'quiz', level: 3,
      title: 'Анотація чи satisfies',
      question: `
\`\`\`ts
type Cfg = Record<string, number | string>;
const a: Cfg = { port: 3000, host: 'x' };
const b = { port: 3000, host: 'x' } satisfies Cfg;
\`\`\`
Які типи мають \`a.port\` і \`b.port\`, і де \`.prt\` дасть помилку?
`,
      options: [
        '`a.port`: `number | string`, `b.port`: `number`; помилка лише в `b.prt`',
        'Обидва `number`; помилка в обох `.prt`',
        'Обидва `number | string`; помилок немає',
        '`a.port`: `number`, `b.port`: `number | string`; помилка лише в `a.prt`'
      ],
      answer: 0,
      why: [
        'Так: анотація «забуває» конкретну форму (тип — Record), satisfies перевіряє відповідність, але зберігає виведений тип.',
        'Ні: анотація робить тип Record — `.prt` дозволений як ключ string.',
        'Ні: satisfies зберігає точні ключі й типи.',
        'Ні: навпаки.'
      ],
      hint: 'Анотація замінює виведений тип. А satisfies?',
      explanation: '`satisfies` (TS 4.9+) перевіряє, що значення підходить під тип, **не розширюючи** його: ключі й типи значень лишаються точними, тож автодоповнення і перевірка друкарських помилок працюють. Типове застосування — конфігурації, мапи маршрутів, теми: `const routes = {...} satisfies Record<string, Route>`.'
    },
    {
      id: 'ts-quiz-never', group: 'unknown-any', type: 'quiz', level: 3, interview: true,
      title: 'never і перевірка вичерпності',
      question: `
У \`Shape\` три варіанти, а \`switch\` обробляє два. Що станеться?

\`\`\`ts
type Shape =
  | { kind: 'circle'; r: number }
  | { kind: 'square'; a: number }
  | { kind: 'tri'; b: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.r ** 2;
    case 'square': return s.a ** 2;
    default: {
      const _x: never = s;
      return _x;
    }
  }
}
\`\`\`
`,
      options: [
        'Помилка компіляції: тип `tri` не можна присвоїти `never`',
        'Компілюється, а для трикутника поверне undefined',
        'Помилка в рантаймі на першому виклику',
        'Компілюється без помилок — `never` приймає будь-що'
      ],
      answer: 0,
      why: [
        'Так: у default лишився варіант tri, а never не приймає жодного значення.',
        'Ні: саме цю ситуацію і ловить перевірка вичерпності.',
        'Ні: помилка виникає при компіляції.',
        'Ні: never — порожній тип, йому не можна присвоїти нічого.'
      ],
      hint: 'Що лишається в `s` у гілці default і що можна присвоїти `never`?',
      explanation: '**Exhaustiveness check:** у default змінна має тип «усе, що не оброблено». Якщо все оброблено — це `never`, і присвоєння проходить. Додали новий варіант у тип — компілятор покаже всі `switch`, які треба оновити. Типовий хелпер: `function assertNever(x: never): never { throw new Error(\'Unexpected: \' + x); }`.'
    }
  ]
});
