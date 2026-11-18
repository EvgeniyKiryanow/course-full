FE.topic('js-arrays', {
  intro: `
**Масив** — об'єкт з цілочисельними ключами та «магічною» \`length\` (найбільший індекс + 1). Може мати «дірки» (sparse arrays).

## Створення

\`\`\`js
Array.of(3);                            // [3]
new Array(3);                           // [ <3 empty items> ] — дірки!
new Array(3).fill(0);                   // [0, 0, 0]
Array.from({ length: 3 }, (_, i) => i); // [0, 1, 2]
new Array(3).fill([]);                  // ⚠ ОДИН масив у трьох комірках
\`\`\`

## Мутуючі vs немутуючі

| Мутують оригінал | Повертають новий масив |
|---|---|
| \`push\`, \`pop\`, \`shift\`, \`unshift\` | \`concat\`, \`slice\`, \`map\`, \`filter\`, \`flat\`, \`flatMap\` |
| \`splice\`, \`sort\`, \`reverse\` | **ES2023:** \`toSpliced\`, \`toSorted\`, \`toReversed\` |
| \`fill\`, \`copyWithin\` | \`with(index, value)\` |

\`sort\` і \`reverse\` **повертають той самий масив** (мутований).

## Пошук

| Метод | Повертає | NaN |
|---|---|---|
| \`indexOf\` | індекс або \`-1\` (\`===\`) | не знаходить |
| \`includes\` | \`boolean\` | знаходить |
| \`find\` / \`findIndex\` | елемент / індекс | через предикат |
| \`some\` / \`every\` | \`boolean\`, зупиняються достроково | |

## Сортування

- \`sort()\` без компаратора порівнює **рядки**: \`[10, 9, 1].sort()\` → \`[1, 10, 9]\`.
- Числа: \`(a, b) => a - b\`; рядки: \`a.localeCompare(b)\`. Сортування **стабільне**.

## Пастки

- \`reduce\` — завжди передавайте \`initialValue\`.
- \`forEach\` не перервати — \`for..of\` + \`break\`, \`some\`, \`find\`.
- \`arr.at(-1)\` — останній; \`arr[-1]\` → \`undefined\`.
- \`includes\`/\`indexOf\` у циклі = O(n²) — будуйте об'єкт-словник для пошуку.
- \`Array.isArray(x)\` — надійна перевірка (\`typeof [] === 'object'\`).
`,
  groups: [
    { id: 'create', title: 'Створення масивів і length' },
    { id: 'search', title: 'Перебір і пошук' },
    { id: 'transform', title: 'map, filter, reduce зсередини' },
    { id: 'mutation', title: 'Мутуючі та немутуючі методи' },
    { id: 'sort', title: 'Сортування' },
    { id: 'flat', title: 'at, flat, дірки, array-like' },
    { id: 'slicing', title: 'Розбиття і перестановка: chunk, zip, rotate, windowed' },
    { id: 'lookup', title: 'Дублікати, групування, множини за O(n)' }
  ],
  items: [
    // ================================================================ create
    {
      id: 'arr-theory-creation',
      group: 'create',
      type: 'theory',
      level: 1,
      title: 'Способи створення масивів',
      tags: ['arrays', 'basics'],
      question: 'Чим відрізняються new Array(3), Array.of(3) і Array.from({ length: 3 })? Яка пастка з fill?',
      choices: [
        '`new Array(3)` створює `[3]`, `Array.of(3)` — три дірки, а `Array.from({ length: 3 })` кидає TypeError, бо об\'єкт не ітерований',
        '`new Array(3)` і `Array.from({ length: 3 })` дають однакові три дірки, тому `map` по обох нічого не обчислить',
        '`new Array(3)` — три дірки, `Array.of(3)` — `[3]`, `Array.from({ length: 3 })` — три `undefined`, і `map` по ньому працює',
        '`new Array(3).fill({})` створює три різні об\'єкти, тож мутація `grid[0]` не зачепить інші комірки масиву'
      ],
      correct: 2,
      why: [
        'Хибно: навпаки — `new Array(3)` дає дірки, `Array.of(3)` — `[3]`, а `Array.from` приймає array-like `{ length }`.',
        'Хибно: `Array.from` заповнює кожен індекс значенням `undefined` (дірок немає), тож `map` працює.',
        'Правильно: саме тому для генерації беруть `Array.from({ length }, fn)`.',
        'Хибно: `{}` обчислюється один раз, `fill` кладе одне посилання в усі комірки.'
      ],
      answer: `
- **Літерал** \`[1, 2, 3]\` — основний спосіб.
- **\`new Array(n)\`** — довжина \`n\` **з дірками**; \`new Array(1, 2)\` → \`[1, 2]\`. Через неоднозначність майже не використовують.
- **\`Array.of(...items)\`** — завжди з аргументів: \`Array.of(3)\` → \`[3]\`.
- **\`Array.from(source, mapFn?)\`** — з рядка, array-like (\`{ length: 3 }\`, \`arguments\`) тощо; \`mapFn\` викликається для **кожного** індексу.

\`\`\`js
Array.from({ length: 3 }, (_, i) => i * 2);     // [0, 2, 4]
const grid = new Array(3).fill([]);             // одне посилання в трьох комірках
const ok = Array.from({ length: 3 }, () => []); // три різні масиви
\`\`\`

**Нюанс:** \`new Array(3).map((_, i) => i)\` → \`[ <3 empty items> ]\` — \`map\` пропускає дірки.
`,
      keyPoints: [
        'new Array(n) — масив з дірками',
        'Array.of завжди створює масив з аргументів',
        'Array.from з array-like + функція-мапер',
        'fill з об\'єктом — одне спільне посилання'
      ],
      followUps: ['Як створити двовимірну матрицю n×m?', 'Чому new Array(3).map(...) нічого не обчислює?']
    },
    {
      id: 'arr-quiz-array-from',
      group: 'create',
      type: 'quiz',
      level: 2,
      title: 'new Array vs Array.of vs Array.from',
      tags: ['arrays', 'creation'],
      question: `
Що виведе код?

\`\`\`js
console.log(new Array(3).length, new Array('3').length, Array.of(3).length);
console.log(Array.from({ length: 3 }, (_, i) => i * 2));
\`\`\`
`,
      options: [
        '`3 1 1` і `[0, 2, 4]`',
        '`3 3 1` і `[0, 2, 4]`',
        '`3 1 3` і `[undefined, undefined, undefined]`',
        '`1 1 1` і `[0, 1, 2]`'
      ],
      answer: 0,
      why: [
        'Правильно: число → довжина, рядок → елемент, `Array.of` → завжди елементи; мапер викликається для кожного індексу.',
        '`new Array(\'3\')` — аргумент рядок, тож це масив з одним елементом `\'3\'`.',
        '`Array.of(3)` — це `[3]` (довжина 1), а мапер `i * 2` дає числа, не `undefined`.',
        '`new Array(3)` з числом створює довжину 3, а мапер повертає `i * 2`, тобто `[0, 2, 4]`.'
      ],
      hint: 'Конструктор `Array` поводиться по-особливому, лише якщо отримав **один аргумент типу number**.',
      explanation: `
Конструктор \`Array\` з одним **числом** створює порожній масив цієї довжини, з будь-чим іншим — масив з цих елементів. \`Array.of\` усуває неоднозначність. \`Array.from({ length: 3 }, mapFn)\` викликає мапер для кожного індексу.
`
    },
    {
      id: 'arr-quiz-fill-objects',
      group: 'create',
      type: 'quiz',
      level: 2,
      title: 'fill з об\'єктом',
      tags: ['arrays', 'creation', 'reference'],
      question: `
Що виведе код?

\`\`\`js
const grid = new Array(3).fill([]);
grid[0].push(1);
console.log(grid);
\`\`\`
`,
      options: ['`[[1], [], []]`', '`[1, [], []]`', '`[[1], [1], [1]]`', '`TypeError`'],
      answer: 2,
      why: [
        'Так було б, якби в кожній комірці був окремий масив, але `fill` кладе одне посилання.',
        '`push` додає в масив у комірці, а не замінює комірку числом.',
        'Правильно: `[]` створено один раз, усі три комірки посилаються на нього.',
        'Помилки немає: `grid[0]` — масив, у нього є `push`.'
      ],
      hint: 'Скільки масивів створює `fill([])` — три чи один?',
      explanation: `
Аргумент \`[]\` обчислюється **один раз**, \`fill\` записує те саме посилання в усі комірки.

Незалежні елементи — через мапер: \`Array.from({ length: 3 }, () => [])\`. Класичний баг з матрицями: \`Array(n).fill(Array(m).fill(0))\`.
`
    },
    {
      id: 'arr-quiz-length',
      group: 'create',
      type: 'quiz',
      level: 2,
      title: 'Магія length',
      tags: ['arrays', 'length', 'sparse'],
      question: `
Що виведе код?

\`\`\`js
const arr = [1, 2, 3];
arr[10] = 11;
console.log(arr.length);
arr.length = 2;
console.log(arr, arr[2]);
\`\`\`
`,
      options: [
        '`4`, потім `[1, 2]` і `undefined`',
        '`11`, потім `[1, 2, 3, 11]` і `3`',
        '`11`, потім `[1, 2]` і `undefined`',
        '`4`, потім `[1, 2]` і `3`'
      ],
      answer: 2,
      why: [
        '`length` — не кількість елементів, а найбільший індекс + 1, тобто 11.',
        'Присвоєння `length = 2` обрізає масив — елементи з індексом ≥ 2 видаляються.',
        'Правильно: `length` став 11 (індекси 3–9 — дірки), потім масив обрізано до двох елементів.',
        'Після обрізання `arr[2]` вже не існує, а перша довжина — 11, не 4.'
      ],
      hint: '`length` — не кількість елементів, а «найбільший індекс + 1». А що буде, якщо його зменшити?',
      explanation: `
\`arr[10] = 11\` → \`length = 11\`, індекси 3–9 — дірки. \`arr.length = 2\` безповоротно видаляє елементи з індексом ≥ 2.

\`arr.length = 0\` очищує масив **на місці** (усі посилання побачать порожній), на відміну від \`arr = []\`.
`
    },
    {
      id: 'arr-range',
      group: 'create',
      type: 'code',
      level: 1,
      title: 'range(start, end, step): номери сторінок',
      tags: ['arrays', 'creation'],
      description: `
**Завдання.** Реалізуйте \`range\` — масив чисел від \`start\` (включно) до \`end\` (**не** включно) з кроком \`step\`.

**Де трапляється:** номери сторінок у пагінації (\`range(1, totalPages + 1)\`), роки в селекті дати народження, \`range(5)\` для скелетонів-заглушок під час завантаження.

**Що написати**
- \`range(end)\` → \`[0, 1, …, end - 1]\`
- \`range(start, end, step?)\` → масив; без \`step\` крок \`1\`, якщо \`start <= end\`, інакше \`-1\`

**Приклад**
\`\`\`js
range(5);          // [0, 1, 2, 3, 4]
range(1, 5);       // [1, 2, 3, 4]
range(0, 10, 3);   // [0, 3, 6, 9]
range(5, 0, -2);   // [5, 3, 1]
range(3, 0);       // [3, 2, 1]
\`\`\`

**Як це працює:** кількість елементів = \`Math.ceil((end - start) / step)\` (від'ємна → 0). Далі \`Array.from({ length }, (_, i) => start + i * step)\` генерує масив без циклу \`while\`, тож нескінченний цикл неможливий.

**Врахуйте:**
- крок «не в той бік» → \`[]\`;
- \`step === 0\` → \`RangeError\`.
`,
      starter: `function range(start, end, step) {
  // 1. Один аргумент: range(5) → start = 0, end = 5.

  // 2. Крок за замовчуванням: 1 або -1. step === 0 → throw new RangeError(...)

  // 3. TODO: length = Math.max(Math.ceil((end - start) / step), 0)
  //    і Array.from({ length }, (_, i) => ...)
}

// Спробуйте в консолі: range(1, 5) // [1, 2, 3, 4]
`,
      solution: `function range(start, end, step) {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  if (step === undefined) step = start <= end ? 1 : -1;
  if (step === 0) throw new RangeError('step не може бути 0');

  // кількість елементів; від'ємна (крок не в той бік) → 0
  const length = Math.max(Math.ceil((end - start) / step), 0);
  return Array.from({ length }, (_, i) => start + i * step);
}
`,
      hints: [
        'Один аргумент: `end = start`, `start = 0`.',
        'Кількість елементів = `Math.ceil((end - start) / step)`; якщо вона від\'ємна — масив порожній.',
        '`Array.from({ length }, (_, i) => start + i * step)` згенерує результат.'
      ],
      tests: [
        { name: 'один аргумент', code: 'expect(range(5)).toEqual([0, 1, 2, 3, 4]);\nexpect(range(0)).toEqual([]);' },
        { name: 'start і end', code: 'expect(range(1, 5)).toEqual([1, 2, 3, 4]);' },
        { name: 'крок', code: 'expect(range(0, 10, 3)).toEqual([0, 3, 6, 9]);\nexpect(range(0, 1, 0.25)).toEqual([0, 0.25, 0.5, 0.75]);' },
        { name: 'від\'ємний крок і автоматичний -1', code: 'expect(range(5, 0, -2)).toEqual([5, 3, 1]);\nexpect(range(3, 0)).toEqual([3, 2, 1]);\nexpect(range(-1, -4)).toEqual([-1, -2, -3]);' },
        { name: 'крок не в той бік → []', code: 'expect(range(0, 5, -1)).toEqual([]);\nexpect(range(5, 0, 1)).toEqual([]);' },
        { name: 'step 0 → RangeError', code: 'expect(() => range(0, 5, 0)).toThrow(RangeError);' }
      ],
      explanation: `
Формула довжини працює для будь-якого знаку кроку, \`Math.max(..., 0)\` відсікає «крок не в той бік». O(n).

**Чому не \`while (i < end)\`:** для від'ємного кроку потрібна інша умова, а при \`step = 0\` — нескінченний цикл.

**Що спитають далі:** як зробити пагінацію з «…» (\`1 … 4 5 6 … 20\`)?
`
    },
    // ================================================================ search
    {
      id: 'arr-quiz-foreach-break',
      group: 'search',
      type: 'quiz',
      level: 1,
      title: 'return у forEach і дострокова зупинка some',
      tags: ['arrays', 'iteration'],
      question: `
Що виведе код?

\`\`\`js
const res = [];
[1, 2, 3, 4].forEach((x) => {
  if (x === 2) return;
  res.push(x);
});
const found = [1, 2, 3, 4].some((x) => {
  res.push('s' + x);
  return x === 2;
});
console.log(res, found);
\`\`\`
`,
      options: [
        '`[1] true`',
        '`[1, 3, 4, "s1", "s2"] true`',
        '`[1, 3, 4, "s1", "s2", "s3", "s4"] true`',
        '`[1, "s1", "s2"] true`'
      ],
      answer: 1,
      why: [
        '`return` у колбеку `forEach` не зупиняє перебір, а `some` теж додає свої елементи.',
        'Правильно: `return` у `forEach` — як `continue`, а `some` зупиняється на першому `true`.',
        '`some` не перебирає далі після першого truthy-результату — `s3`, `s4` не додаються.',
        '`return` завершує лише поточний виклик колбека, тож `3` і `4` теж потрапляють у `res`.'
      ],
      hint: '`return` усередині колбека завершує лише поточний виклик колбека. А `some` зупиняється, щойно отримає truthy.',
      explanation: `
\`forEach\` неможливо перервати (лише винятком — антипатерн). Для дострокового виходу — \`for..of\` з \`break\`, \`some\`/\`every\`/\`find\`/\`findIndex\`.
`
    },
    {
      id: 'arr-quiz-includes-nan',
      group: 'search',
      type: 'quiz',
      level: 2,
      title: 'includes vs indexOf з NaN',
      tags: ['arrays', 'search', 'nan'],
      question: `
Що виведе код?

\`\`\`js
const arr = [1, NaN, -0];
console.log(arr.includes(NaN), arr.indexOf(NaN), arr.findIndex(Number.isNaN), arr.includes(0));
\`\`\`
`,
      options: [
        '`true 1 1 false`',
        '`false -1 1 true`',
        '`true -1 1 false`',
        '`true -1 1 true`'
      ],
      answer: 3,
      why: [
        '`indexOf` порівнює через `===`, а `NaN !== NaN` → `-1`; і `includes` вважає `0` та `-0` рівними.',
        '`includes` вміє знаходити `NaN` (алгоритм SameValueZero).',
        '`includes(0)` знайде `-0`: для SameValueZero `0` і `-0` рівні.',
        'Правильно: `includes` знаходить `NaN` і `-0`, `indexOf` не знаходить `NaN`, предикат знаходить.'
      ],
      hint: '`indexOf` порівнює через `===`, а `includes` — через алгоритм SameValueZero.',
      explanation: `
- \`includes\` — **SameValueZero**: як \`===\`, але \`NaN\` дорівнює \`NaN\`; \`0\` і \`-0\` рівні.
- \`indexOf\` — \`===\`, тож \`NaN\` не знаходить.
- \`findIndex(Number.isNaN)\` — пошук предикатом → \`1\`.

Для «є чи немає» беріть \`includes\`, для пошуку за умовою — \`find\`/\`findIndex\`/\`some\`.
`
    },
    {
      id: 'arr-partition',
      group: 'search',
      type: 'code',
      level: 1,
      title: 'partition: виконані і невиконані задачі',
      tags: ['arrays', 'utils'],
      description: `
**Завдання.** Напишіть \`partition(arr, predicate)\`, що за **один прохід** ділить масив на дві частини.

**Де трапляється:** todo-список «Активні / Виконані», імпорт CSV «валідні рядки / рядки з помилками», товари «в наявності / немає».

**Що написати**
- \`partition(arr, predicate)\` → \`[pass, fail]\`: елементи з truthy \`predicate(value, index, arr)\` і решта; порядок зберігається

**Приклад**
\`\`\`js
const todos = [{ t: 'a', done: true }, { t: 'b', done: false }, { t: 'c', done: true }];
partition(todos, (todo) => todo.done);
// [[{ t: 'a', ... }, { t: 'c', ... }], [{ t: 'b', ... }]]

partition([0, 1, '', 'a', null], Boolean); // [[1, 'a'], [0, '', null]]
\`\`\`

**Як це працює:** \`forEach\` викликає колбек для кожного елемента з \`(value, index, array)\`. Усередині вирішуємо, в який із двох масивів зробити \`push\`.

**Врахуйте:**
- предикат викликається **рівно один раз** на елемент (не робіть два \`filter\`);
- truthy-семантика: \`Boolean\` як предикат;
- порожній масив → \`[[], []]\`.
`,
      starter: `function partition(arr, predicate) {
  const pass = [];
  const fail = [];
  // TODO: один прохід (forEach або for..of з індексом):
  //       predicate(value, index, arr) truthy → pass, інакше → fail
  return [pass, fail];
}

// Спробуйте в консолі: partition([1, 2, 3, 4], (n) => n % 2 === 0) // [[2, 4], [1, 3]]
`,
      solution: `function partition(arr, predicate) {
  const pass = [];
  const fail = [];
  arr.forEach((value, index) => {
    (predicate(value, index, arr) ? pass : fail).push(value);
  });
  return [pass, fail];
}
`,
      hints: [
        '`arr.forEach((value, index) => { ... })` — один прохід.',
        'Вибір масиву виразом: `(predicate(value, index, arr) ? pass : fail).push(value)`.'
      ],
      tests: [
        'expect(partition([1, 2, 3, 4, 5], (n) => n % 2 === 0)).toEqual([[2, 4], [1, 3, 5]])',
        { name: 'truthy-семантика (Boolean як предикат)', code: 'expect(partition([0, 1, "", "a", null], Boolean)).toEqual([[1, "a"], [0, "", null]]);' },
        { name: 'предикат отримує index і масив', code: 'const arr = ["a", "b", "c"];\nconst fn = mockFn((v, i) => i > 0);\nexpect(partition(arr, fn)).toEqual([["b", "c"], ["a"]]);\nexpect(fn).toHaveBeenCalledWith("a", 0, arr);' },
        { name: 'один прохід: предикат викликається n разів', code: 'const fn = mockFn((x) => x > 1);\npartition([1, 2, 3], fn);\nexpect(fn).toHaveBeenCalledTimes(3);' },
        { name: 'порожній масив', code: 'expect(partition([], Boolean)).toEqual([[], []]);' }
      ],
      explanation: `
O(n). Два \`filter\` (\`[arr.filter(p), arr.filter((x) => !p(x))]\`) читаються просто, але викликають предикат **двічі** — погано, якщо він дорогий.

**Що спитають далі:** як узагальнити на N груп (\`groupBy\` — у кінці теми)?
`
    },
    // ================================================================ transform
    {
      id: 'arr-my-map',
      group: 'transform',
      type: 'code',
      level: 2,
      interview: true,
      title: 'Свій map: як він працює всередині',
      tags: ['arrays', 'polyfill'],
      description: `
**Завдання.** Реалізуйте \`myMap(arr, callback)\` — повторіть поведінку \`arr.map(callback)\`, **не використовуючи** вбудований \`map\`.

**Де трапляється:** класика співбесід «напишіть свій map / filter / reduce» — перевіряють, чи розумієте ви, що саме робить метод. (Часто просять як метод масиву \`arr.myMap(fn)\` — це буде в темах про контекст виклику і прототипи; логіка та сама.)

**Що написати**
- \`myMap(arr, callback)\` → **новий** масив тієї ж довжини; \`result[i] = callback(arr[i], i, arr)\`

**Приклад**
\`\`\`js
myMap([1, 2, 3], (x) => x * 2);        // [2, 4, 6]
myMap(['a', 'b'], (v, i) => v + i);    // ['a0', 'b1']
\`\`\`

**Як це працює:** \`map\` фіксує довжину до початку обходу, створює масив цієї довжини і для кожного **існуючого** індексу викликає колбек. Дірку (\`[1, , 3]\`) видно перевіркою \`i in arr\` → \`false\`: колбек для неї не викликається, у результаті — теж дірка.

**Врахуйте:**
- \`callback\` не функція → \`TypeError\`;
- елементи, додані під час обходу, не обробляються;
- працює і для array-like: \`myMap({ length: 2, 0: 'a', 1: 'b' }, fn)\`;
- оригінал не змінюється.
`,
      starter: `function myMap(arr, callback) {
  // 1. TODO: callback не функція → throw new TypeError(...)

  // 2. Зафіксуйте довжину ДО обходу і створіть результат: new Array(length)

  // 3. TODO: цикл по індексах; якщо i in arr — result[i] = callback(arr[i], i, arr)

  // 4. Поверніть результат.
}

// Спробуйте в консолі: myMap([1, 2, 3], (x) => x * 2)
`,
      solution: `function myMap(arr, callback) {
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }
  const length = arr.length;          // фіксуємо довжину до обходу
  const result = new Array(length);   // дірки там, де колбек не викличеться

  for (let i = 0; i < length; i++) {
    if (i in arr) {                   // пропускаємо дірки
      result[i] = callback(arr[i], i, arr);
    }
  }
  return result;
}
`,
      hints: [
        'Збережіть `const length = arr.length` до циклу і створіть `new Array(length)`.',
        'Дірку виявляє `i in arr` — для порожнього слота `false`.',
        'Колбек отримує три аргументи: `callback(arr[i], i, arr)`.'
      ],
      tests: [
        { name: 'базове перетворення без вбудованого map', code: 'let r;\nconst orig = Array.prototype.map;\nArray.prototype.map = function () { throw new Error("map заборонено"); };\ntry {\n  r = myMap([1, 2, 3], (x) => x * 2);\n} finally {\n  Array.prototype.map = orig;\n}\nexpect(r).toEqual([2, 4, 6]);' },
        { name: 'аргументи колбека: value, index, array', code: 'const arr = ["a", "b"];\nconst fn = mockFn((v, i) => v + i);\nexpect(myMap(arr, fn)).toEqual(["a0", "b1"]);\nexpect(fn).toHaveBeenCalledWith("a", 0, arr);\nexpect(fn).toHaveBeenCalledWith("b", 1, arr);' },
        { name: 'дірки пропускаються і зберігаються', code: 'const fn = mockFn((x) => x * 2);\nconst r = myMap([1, , 3], fn);\nexpect(fn).toHaveBeenCalledTimes(2);\nexpect(r.length).toBe(3);\nexpect(1 in r).toBe(false);\nexpect(r[2]).toBe(6);' },
        { name: 'довжина фіксується до обходу, оригінал не мутується', code: 'const arr = [1, 2];\nconst r = myMap(arr, (x) => { arr.push(x); return x; });\nexpect(r).toEqual([1, 2]);\nconst src = [1, 2, 3];\nmyMap(src, (x) => x + 1);\nexpect(src).toEqual([1, 2, 3]);' },
        { name: 'не функція → TypeError', code: 'expect(() => myMap([1])).toThrow(TypeError);\nexpect(() => myMap([1], "x")).toThrow(TypeError);' },
        { name: 'array-like', code: 'expect(myMap({ length: 2, 0: "a", 1: "b" }, (x) => x.toUpperCase())).toEqual(["A", "B"]);' }
      ],
      explanation: `
O(n). Ключові деталі: фіксована \`length\`, \`i in arr\` для дірок, новий масив тієї ж довжини.

**Чому \`new Array(length)\`, а не \`push\`:** дірки мають лишитися на тих самих місцях.

**Типові помилки:** \`for..of\` замість індексного циклу (дірки стануть \`undefined\`); \`arr.length\` в умові циклу (обробляться додані елементи).

**Що спитають далі:** чим \`map\` відрізняється від \`forEach\`? чому \`['1','2','3'].map(parseInt)\` дає \`[1, NaN, NaN]\`?
`
    },
    {
      id: 'arr-my-filter',
      group: 'transform',
      type: 'code',
      level: 2,
      interview: true,
      title: 'Свій filter',
      tags: ['arrays', 'polyfill'],
      description: `
**Завдання.** Реалізуйте \`myFilter(arr, predicate)\` — поведінку \`arr.filter(predicate)\` без вбудованого \`filter\`.

**Де трапляється:** класика співбесід у парі з \`myMap\` і \`myReduce\`.

**Що написати**
- \`myFilter(arr, predicate)\` → новий **щільний** масив (без дірок) з елементів, для яких \`predicate(value, index, arr)\` **truthy**

**Приклад**
\`\`\`js
myFilter([1, 2, 3, 4], (x) => x % 2 === 0);  // [2, 4]
myFilter([0, 'a', '', null, 5], Boolean);    // ['a', 5]
\`\`\`

**Як це працює:** структура як у \`map\`, але результат — порожній масив, у який робимо \`push\` лише «пройдених» елементів. Значення читаємо **до** виклику предиката.

**Врахуйте:**
- truthy, а не \`=== true\` — \`filter(Boolean)\` має працювати;
- дірки пропускаються, довжина фіксується до обходу;
- \`predicate\` не функція → \`TypeError\`.
`,
      starter: `function myFilter(arr, predicate) {
  // 1. TODO: predicate не функція → TypeError
  const length = arr.length;
  const result = [];

  // 2. TODO: для кожного існуючого індексу (i in arr):
  //    якщо predicate(value, i, arr) truthy — result.push(value)

  return result;
}

// Спробуйте в консолі: myFilter([1, 2, 3, 4], (x) => x > 2)
`,
      solution: `function myFilter(arr, predicate) {
  if (typeof predicate !== 'function') {
    throw new TypeError(predicate + ' is not a function');
  }
  const length = arr.length;
  const result = [];

  for (let i = 0; i < length; i++) {
    if (!(i in arr)) continue;     // дірка
    const value = arr[i];          // читаємо до виклику: предикат може мутувати масив
    if (predicate(value, i, arr)) result.push(value);
  }
  return result;
}
`,
      hints: [
        'Як у `myMap`, але `result = []` і `push` лише для truthy-предиката.',
        'Не порівнюйте з `true` — пишіть просто `if (predicate(value, i, arr))`.'
      ],
      tests: [
        { name: 'фільтрує без вбудованого filter', code: 'let r;\nconst orig = Array.prototype.filter;\nArray.prototype.filter = function () { throw new Error("filter заборонено"); };\ntry {\n  r = myFilter([1, 2, 3, 4], (x) => x % 2 === 0);\n} finally {\n  Array.prototype.filter = orig;\n}\nexpect(r).toEqual([2, 4]);' },
        { name: 'truthy-семантика', code: 'expect(myFilter([0, 1, "", "a", null, {}], (x) => x)).toEqual([1, "a", {}]);\nexpect(myFilter([1, 2, 3], () => 1)).toEqual([1, 2, 3]);' },
        { name: 'аргументи предиката', code: 'const arr = [5, 6];\nconst fn = mockFn((v, i) => i === 1);\nexpect(myFilter(arr, fn)).toEqual([6]);\nexpect(fn).toHaveBeenCalledWith(5, 0, arr);' },
        { name: 'дірки пропускаються, результат щільний', code: 'const fn = mockFn(() => true);\nconst r = myFilter([1, , 3], fn);\nexpect(fn).toHaveBeenCalledTimes(2);\nexpect(r).toEqual([1, 3]);\nexpect(r.length).toBe(2);' },
        { name: 'порожній масив і не мутує оригінал', code: 'expect(myFilter([], () => true)).toEqual([]);\nconst src = [1, 2, 3];\nconst r = myFilter(src, () => true);\nexpect(r).not.toBe(src);\nexpect(src).toEqual([1, 2, 3]);' },
        { name: 'не функція → TypeError', code: 'expect(() => myFilter([1], null)).toThrow(TypeError);' }
      ],
      explanation: `
O(n). На відміну від \`map\`, результат щільний (\`push\`).

**Типові помилки:** \`=== true\` ламає truthy-семантику; \`for..of\` — дірки стануть \`undefined\` і потраплять у результат.

**Ідіоми:** \`arr.filter(Boolean)\` — прибрати falsy.

**Що спитають далі:** чим \`filter\` відрізняється від \`find\`? як зробити \`filter\` + \`map\` за один прохід?
`
    },
    {
      id: 'arr-quiz-reduce-no-init',
      group: 'transform',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'reduce без початкового значення',
      tags: ['arrays', 'reduce'],
      question: `
Що виведе код?

\`\`\`js
console.log([1, 2, 3].reduce((a, b) => a + b));
console.log([{ n: 1 }, { n: 2 }].reduce((acc, x) => acc + x.n));
console.log([].reduce((a, b) => a + b));
\`\`\`
`,
      options: [
        '`6`, `3`, `undefined`',
        '`6`, `"[object Object]2"`, потім `TypeError`',
        '`6`, `NaN`, `0`',
        '`6`, `3`, потім `TypeError`'
      ],
      answer: 1,
      why: [
        'Без `initialValue` акумулятор — перший об\'єкт, тож сума не вийде; а порожній масив кидає помилку.',
        'Правильно: акумулятор — `{ n: 1 }`, `{ n: 1 } + 2` дає рядок; порожній масив без initialValue → TypeError.',
        'Об\'єкт + число — це конкатенація рядків, а не `NaN`; порожній масив без initialValue не повертає `0`.',
        'Акумулятором стає перший елемент-об\'єкт, а не `0`, тому другий результат — рядок.'
      ],
      hint: 'Без `initialValue` акумулятором стає **перший елемент**, а обхід починається з другого.',
      explanation: `
Без \`initialValue\` акумулятор — перший елемент, колбек — з другого.
1. \`1 + 2 + 3\` → \`6\`.
2. \`{ n: 1 } + 2\` → \`'[object Object]2'\` — забули \`, 0\`.
3. \`[]\` без \`initialValue\` → \`TypeError: Reduce of empty array with no initial value\`.

**Правило:** завжди передавайте \`initialValue\`.
`
    },
    {
      id: 'arr-my-reduce',
      group: 'transform',
      type: 'code',
      level: 3,
      interview: true,
      title: 'Свій reduce',
      tags: ['arrays', 'polyfill', 'reduce'],
      description: `
**Завдання.** Реалізуйте \`myReduce(arr, callback, initialValue?)\` — поведінку \`arr.reduce(callback, initialValue)\` без вбудованого \`reduce\`.

**Де трапляється:** найскладніший із трійки «свій map/filter/reduce» на співбесідах — через дві гілки старту.

**Що написати**
- \`myReduce(arr, callback)\` → акумулятор = перший **існуючий** елемент, обхід з наступного
- \`myReduce(arr, callback, initialValue)\` → акумулятор = \`initialValue\` (навіть явний \`undefined\`!), обхід з 0
- \`callback(acc, value, index, arr)\` → новий акумулятор

**Приклад**
\`\`\`js
myReduce([1, 2, 3], (a, b) => a + b);      // 6
myReduce([1, 2, 3], (a, b) => a + b, 10);  // 16
myReduce([], (a, b) => a + b);             // TypeError
\`\`\`

**Як це працює:** «передано \`undefined\`» і «не передано нічого» відрізняються лише **кількістю аргументів**. Тому третій параметр збирають rest-параметром \`...rest\` і дивляться на \`rest.length\`, а не на значення.

**Врахуйте:**
- порожній масив (або лише дірки) без \`initialValue\` → \`TypeError\`;
- дірки пропускаються;
- \`callback\` не функція → \`TypeError\`.
`,
      starter: `function myReduce(arr, callback, ...rest) {
  // 1. TODO: callback не функція → TypeError
  const length = arr.length;
  let i = 0;
  let acc;

  if (rest.length > 0) {
    // 2. initialValue передано (навіть undefined)
    // TODO
  } else {
    // 3. TODO: знайти перший існуючий індекс (i in arr), взяти його як acc, i++
    //    якщо такого немає — TypeError
  }

  // 4. TODO: для решти існуючих індексів: acc = callback(acc, arr[i], i, arr)
  return acc;
}

// Спробуйте в консолі: myReduce([1, 2, 3], (a, b) => a + b, 10) // 16
`,
      solution: `function myReduce(arr, callback, ...rest) {
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }
  const length = arr.length;
  let i = 0;
  let acc;

  if (rest.length > 0) {
    // initialValue передано — навіть якщо це undefined
    acc = rest[0];
  } else {
    // шукаємо перший існуючий елемент (пропускаючи дірки)
    while (i < length && !(i in arr)) i++;
    if (i >= length) throw new TypeError('Reduce of empty array with no initial value');
    acc = arr[i++];
  }

  for (; i < length; i++) {
    if (i in arr) acc = callback(acc, arr[i], i, arr);
  }
  return acc;
}
`,
      hints: [
        'Відрізняйте «не передано» від «передано undefined» за `rest.length`, а не за значенням.',
        'Без initialValue: `while (i < length && !(i in arr)) i++;` — якщо дійшли до кінця, `TypeError`; інакше `acc = arr[i++]`.',
        'У основному циклі теж пропускайте дірки.'
      ],
      tests: [
        { name: 'з initialValue і без, без вбудованого reduce', code: 'let a, b;\nconst orig = Array.prototype.reduce;\nArray.prototype.reduce = function () { throw new Error("reduce заборонено"); };\ntry {\n  a = myReduce([1, 2, 3], (x, y) => x + y);\n  b = myReduce([1, 2, 3], (x, y) => x + y, 10);\n} finally {\n  Array.prototype.reduce = orig;\n}\nexpect(a).toBe(6);\nexpect(b).toBe(16);' },
        { name: 'без initialValue колбек викликається n-1 разів', code: 'const fn = mockFn((acc, x) => acc + x);\nexpect(myReduce([5], fn)).toBe(5);\nexpect(fn).not.toHaveBeenCalled();\nconst fn2 = mockFn((acc, x) => acc + x);\nmyReduce([1, 2, 3], fn2);\nexpect(fn2).toHaveBeenCalledTimes(2);' },
        { name: 'порожній масив', code: 'expect(() => myReduce([], (a, b) => a + b)).toThrow(TypeError);\nexpect(() => myReduce([, ,], (a, b) => a + b)).toThrow(TypeError);\nexpect(myReduce([], (a, b) => a + b, 0)).toBe(0);' },
        { name: 'явний initialValue = undefined', code: 'expect(myReduce([1, 2], (acc, x) => String(acc) + x, undefined)).toBe("undefined12");' },
        { name: 'аргументи колбека', code: 'const arr = [10, 20];\nconst fn = mockFn((acc, x) => acc + x);\nmyReduce(arr, fn, 0);\nexpect(fn).toHaveBeenCalledWith(0, 10, 0, arr);\nexpect(fn).toHaveBeenLastCalledWith(10, 20, 1, arr);' },
        { name: 'дірки пропускаються', code: 'const fn = mockFn((acc, x) => acc + x);\nexpect(myReduce([, 1, , 2], fn)).toBe(3);\nexpect(fn).toHaveBeenCalledTimes(1);' },
        { name: 'акумулятор будь-якого типу', code: 'const r = myReduce(["a", "b", "a"], (acc, x) => { acc[x] = (acc[x] || 0) + 1; return acc; }, {});\nexpect(r).toEqual({ a: 2, b: 1 });' },
        { name: 'не функція → TypeError', code: 'expect(() => myReduce([1])).toThrow(TypeError);' }
      ],
      explanation: `
O(n) часу, O(1) пам'яті. Дві гілки старту — головна тонкість.

**\`reduce\` — не завжди найкращий вибір:** \`reduce\` зі spread (\`(acc, x) => ({ ...acc, [x.id]: x })\`) — O(n²); складні \`reduce\` часто читаються гірше за \`for..of\`.

**Що спитають далі:** як через \`reduce\` реалізувати \`map\` і \`filter\`? що таке \`reduceRight\`?
`
    },
    // ================================================================ mutation
    {
      id: 'arr-quiz-which-mutate',
      group: 'mutation',
      type: 'quiz',
      level: 1,
      interview: true,
      title: 'Які методи мутують масив?',
      tags: ['arrays', 'immutability'],
      question: 'Оберіть **усі** методи, що **змінюють** оригінальний масив:',
      options: ['`sort`', '`slice`', '`splice`', '`toSorted`', '`reverse`', '`concat`'],
      answer: [0, 2, 4],
      why: [
        'Мутує: сортує на місці і повертає той самий масив.',
        'Не мутує: повертає копію частини масиву.',
        'Мутує: видаляє/вставляє на місці, повертає видалені елементи.',
        'Не мутує: це ES2023-копія `sort`.',
        'Мутує: розвертає на місці.',
        'Не мутує: повертає новий масив.'
      ],
      hint: 'Схожі назви `slice`/`splice` поводяться протилежно. А для мутуючих методів в ES2023 з\'явились копіюючі пари з префіксом `to`.',
      explanation: `
Мнемоніка: «s**p**lice — **p**sує». Мутуючі: \`push\`, \`pop\`, \`shift\`, \`unshift\`, \`splice\`, \`sort\`, \`reverse\`, \`fill\`. Їхні копіюючі пари з ES2023: \`toSorted\`, \`toReversed\`, \`toSpliced\`, \`with\`.
`
    },
    {
      id: 'arr-quiz-sort-returns',
      group: 'mutation',
      type: 'quiz',
      level: 2,
      title: 'sort повертає той самий масив',
      tags: ['arrays', 'sort', 'immutability'],
      question: `
Що виведе код?

\`\`\`js
const a = [3, 1, 2];
const b = a.sort();
const c = a.toReversed();
console.log(a === b, a, c);
\`\`\`
`,
      options: [
        '`true [1, 2, 3] [3, 2, 1]`',
        '`false [3, 1, 2] [2, 1, 3]`',
        '`false [3, 1, 2] [3, 2, 1]`',
        '`true [3, 2, 1] [3, 2, 1]`'
      ],
      answer: 0,
      why: [
        'Правильно: `sort` мутує `a` і повертає його ж, `toReversed` дає новий масив.',
        '`sort` не створює копію: `b` — той самий масив, і `a` вже відсортований.',
        '`a.sort()` змінює `a`, тож `a` не може лишитися `[3, 1, 2]`.',
        '`toReversed` не мутує `a` — він лишається `[1, 2, 3]`.'
      ],
      hint: 'Чи створює `sort` новий масив? А `toReversed`?',
      explanation: `
\`const sorted = arr.sort()\` — **не** копія. До ES2023 писали \`[...arr].sort()\`, тепер — \`arr.toSorted()\`.
`
    },
    {
      id: 'arr-theory-mutating',
      group: 'mutation',
      type: 'theory',
      level: 2,
      title: 'Мутуючі методи і стан у React',
      tags: ['arrays', 'immutability'],
      question: 'Чому в React/Redux важливо не мутувати масиви? Що з\'явилось в ES2023? Оберіть **усі** правильні твердження.',
      choices: [
        '`sort` і `reverse` мутують масив і повертають посилання на той самий масив, а не копію',
        '`toSorted`, `toReversed`, `toSpliced` і `with` (ES2023) повертають новий масив, не змінюючи оригінал',
        '`state.items.push(x); setItems(state.items)` викличе ре-рендер, бо вміст масиву змінився',
        '`slice` і `splice` обидва повертають новий масив і не змінюють оригінальний',
        '`toSorted` робить глибоку копію, тому об\'єкти в новому масиві вже не спільні з оригіналом'
      ],
      correct: [0, 1],
      why: [
        'Правильно: тому `const sorted = arr.sort()` — не копія.',
        'Правильно: це «change array by copy» з ES2023.',
        'Хибно: React порівнює за посиланням — посилання те саме, ре-рендеру не буде.',
        'Хибно: `splice` мутує оригінал і повертає видалені елементи.',
        'Хибно: копія поверхнева — об\'єкти всередині ті самі.'
      ],
      answer: `
**Мутують:** \`push\`, \`pop\`, \`shift\`, \`unshift\`, \`splice\`, \`sort\`, \`reverse\`, \`fill\`, запис за індексом.
**Нові масиви:** \`map\`, \`filter\`, \`slice\`, \`concat\`, \`flat\`, spread.

| Мутуючий | ES2023-копія |
|---|---|
| \`sort(fn)\` | \`toSorted(fn)\` |
| \`reverse()\` | \`toReversed()\` |
| \`splice(i, n, ...x)\` | \`toSpliced(i, n, ...x)\` |
| \`arr[i] = v\` | \`with(i, v)\` |

**Чому важливо:** React/Redux визначають зміни **за посиланням**:
\`\`\`js
items.push(x); setItems(items);  // те саме посилання → без ре-рендеру
setItems([...items, x]);         // ок
setItems(items.toSorted(byName)); // ок
\`\`\`
Ще: мутація аргументів — прихований побічний ефект (\`sort\` на пропсах).

**Нюанс:** копії поверхневі; у локальних масивах усередині функції мутація — нормально.
`,
      keyPoints: [
        'Мутують: push/pop/shift/unshift, splice, sort, reverse, fill',
        'sort і reverse повертають той самий масив',
        'ES2023: toSorted, toReversed, toSpliced, with',
        'React/Redux порівнюють за посиланням',
        'Копії поверхневі'
      ],
      followUps: ['Як іммутабельно видалити елемент за індексом?', 'Чим slice відрізняється від splice?']
    },
    {
      id: 'arr-move-element',
      group: 'mutation',
      type: 'code',
      level: 2,
      title: 'moveElement: перетягування в списку (drag & drop)',
      tags: ['arrays', 'immutability', 'utils'],
      description: `
**Завдання.** Напишіть \`moveElement(arr, from, to)\` — повертає **новий** масив, де елемент з індексу \`from\` переміщено на індекс \`to\`.

**Де трапляється:** сортування drag & drop (канбан, плейлист, порядок полів форми). Функція \`arrayMove\` є в dnd-kit; новий масив потрібен, щоб React побачив зміну стану.

**Що написати**
- \`moveElement(arr, from, to)\` → новий масив; \`to\` — позиція в **результаті**; підтримуються від'ємні індекси (як у \`at\`)

**Приклад**
\`\`\`js
moveElement(['a', 'b', 'c', 'd'], 0, 2);  // ['b', 'c', 'a', 'd']
moveElement(['a', 'b', 'c', 'd'], 3, 1);  // ['a', 'd', 'b', 'c']
moveElement(['a', 'b', 'c', 'd'], -1, 0); // ['d', 'a', 'b', 'c']
\`\`\`

**Як це працює:** \`splice(i, 1)\` вирізає елемент (повертає масив з нього), \`splice(to, 0, item)\` вставляє без видалення. Але \`splice\` **мутує**, тому працюємо з копією \`arr.slice()\`.

**Врахуйте:**
- від'ємний індекс: \`i < 0 ? n + i : i\`;
- індекс поза межами → \`RangeError\` (\`splice\` мовчки «обрізав» би його);
- \`from === to\` → копія, не той самий масив.
`,
      starter: `function moveElement(arr, from, to) {
  const n = arr.length;
  // 1. TODO: нормалізуйте від'ємні from/to: i < 0 ? n + i : i
  // 2. TODO: поза межами [0, n) → throw new RangeError(...)
  // 3. TODO: копія arr.slice(); на копії splice(from, 1) і splice(to, 0, item)
}

// Спробуйте в консолі: moveElement(['a', 'b', 'c'], 0, 2) // ['b', 'c', 'a']
`,
      solution: `function moveElement(arr, from, to) {
  const n = arr.length;
  const start = from < 0 ? n + from : from;
  const end = to < 0 ? n + to : to;
  if (start < 0 || start >= n || end < 0 || end >= n) {
    throw new RangeError('Індекс поза межами масиву');
  }
  const copy = arr.slice();          // працюємо з копією
  const [item] = copy.splice(start, 1);
  copy.splice(end, 0, item);
  return copy;
}
`,
      hints: [
        'Нормалізуйте від\'ємні індекси: `i < 0 ? n + i : i`, і перевірте межі.',
        'На копії: `const [item] = copy.splice(start, 1); copy.splice(end, 0, item);`.'
      ],
      tests: [
        'expect(moveElement(["a", "b", "c", "d"], 0, 2)).toEqual(["b", "c", "a", "d"])',
        { name: 'переміщення назад', code: 'expect(moveElement(["a", "b", "c", "d"], 3, 1)).toEqual(["a", "d", "b", "c"]);' },
        { name: 'від\'ємні індекси', code: 'expect(moveElement(["a", "b", "c", "d"], -1, 0)).toEqual(["d", "a", "b", "c"]);\nexpect(moveElement(["a", "b", "c"], 0, -1)).toEqual(["b", "c", "a"]);' },
        { name: 'той самий індекс — копія', code: 'const src = ["a", "b"];\nconst r = moveElement(src, 1, 1);\nexpect(r).toEqual(["a", "b"]);\nexpect(r).not.toBe(src);' },
        { name: 'не мутує оригінал', code: 'const src = ["a", "b", "c"];\nmoveElement(src, 0, 2);\nexpect(src).toEqual(["a", "b", "c"]);' },
        { name: 'поза межами → RangeError', code: 'expect(() => moveElement(["a"], 1, 0)).toThrow(RangeError);\nexpect(() => moveElement(["a", "b"], 0, 5)).toThrow(RangeError);\nexpect(() => moveElement(["a", "b"], -3, 0)).toThrow(RangeError);' }
      ],
      explanation: `
Копія + два \`splice\` — O(n).

**ES2023 без мутацій:** \`arr.toSpliced(from, 1).toSpliced(to, 0, arr[from])\`.

**Типові помилки:** мутація вхідного масиву (стан React не оновиться); немає перевірки меж.

**Що спитають далі:** як переносити елемент між двома списками (канбан-колонки)?
`
    },
    // ================================================================ sort
    {
      id: 'arr-quiz-sort-default',
      group: 'sort',
      type: 'quiz',
      level: 1,
      title: 'sort() без компаратора',
      tags: ['arrays', 'sort'],
      question: `
Що виведе код?

\`\`\`js
console.log([1, 10, 2, 21, -1].sort());
\`\`\`
`,
      options: [
        '`[-1, 1, 2, 10, 21]`',
        '`[1, 10, 2, 21, -1]`',
        '`[21, 10, 2, 1, -1]`',
        '`[-1, 1, 10, 2, 21]`'
      ],
      answer: 3,
      why: [
        'Так було б з компаратором `(a, b) => a - b`; без нього порівнюються рядки.',
        '`sort` змінює порядок — він не повертає масив як є.',
        'За замовчуванням порядок зростаючий, і порівнюються рядки, а не числа.',
        'Правильно: рядки `\'-1\' < \'1\' < \'10\' < \'2\' < \'21\'` — порівняння посимвольне.'
      ],
      hint: 'Без компаратора `sort` приводить елементи до рядків.',
      explanation: `
Без компаратора \`sort\` порівнює **рядки** посимвольно: \`'10' < '2'\`, бо \`'1' < '2'\`; \`'-'\` має менший код, ніж цифри.

Для чисел: \`arr.sort((a, b) => a - b)\`.
`
    },
    {
      id: 'arr-theory-sort',
      group: 'sort',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Як працює sort і компаратор',
      tags: ['arrays', 'sort'],
      question: 'Як працює sort? Яким має бути компаратор? Чи стабільне сортування в JS?',
      choices: [
        '`[10, 9, 1].sort()` поверне `[1, 9, 10]`: без компаратора `sort` порівнює числа як числа',
        'Компаратор `(a, b) => a > b` коректний: рушій трактує `true`/`false` як `1` і `-1`',
        'Сортування в JS нестабільне, тому для кількох ключів доводиться писати власний merge sort',
        'Без компаратора елементи порівнюються як рядки; для чисел — `(a, b) => a - b`; з ES2019 `sort` стабільний'
      ],
      correct: 3,
      why: [
        'Хибно: без компаратора порівнюються рядки — `[1, 10, 9]`.',
        'Хибно: `false` → `0` («рівні»), а `-1` компаратор так і не поверне — сортування ламається.',
        'Хибно: з ES2019 `sort` гарантовано стабільний.',
        'Правильно: це три ключові факти про `sort`.'
      ],
      answer: `
**Без компаратора** — порівняння рядків: \`[10, 9, 1].sort()\` → \`[1, 10, 9]\`. Сортує **на місці**.

**Компаратор** \`(a, b) => число\`: \`< 0\` — \`a\` раніше, \`> 0\` — \`b\` раніше, \`0\` — рівні. Повертати **число**, не boolean.

\`\`\`js
nums.sort((a, b) => a - b);                       // числа
names.sort((a, b) => a.localeCompare(b, 'uk'));    // рядки з урахуванням мови
users.sort((a, b) => a.age - b.age || a.name.localeCompare(b.name)); // кілька ключів
\`\`\`

**Стабільність (ES2019):** рівні елементи зберігають порядок.

**Рядки:** \`<\` порівнює коди символів: \`'Є' < 'А'\` (U+0404 < U+0410) — для людського порядку \`localeCompare\` або \`Intl.Collator\`.

\`sort(() => Math.random() - 0.5)\` — неузгоджений компаратор, перемішування нерівномірне.
`,
      keyPoints: [
        'Без компаратора — порівняння рядків',
        'Компаратор повертає число (<0, 0, >0)',
        'Стабільне з ES2019',
        'Рядки — localeCompare, числа — a - b, кілька ключів — через ||'
      ],
      followUps: ['Чому sort(() => Math.random() - 0.5) — погане перемішування?', 'Як відсортувати \'file10\' після \'file2\'?']
    },
    {
      id: 'arr-sort-by',
      group: 'sort',
      type: 'code',
      level: 3,
      title: 'sortBy: сортування таблиці за кількома колонками',
      tags: ['arrays', 'sort', 'intl'],
      description: `
**Завдання.** Напишіть \`sortBy(arr, criteria)\` — повертає **новий** масив, відсортований за списком критеріїв.

**Де трапляється:** таблиця співробітників з сортуванням за колонками: «за відділом, а всередині — за зарплатою від більшої».

**Що написати**
- \`sortBy(arr, criteria)\` → новий масив; оригінал не мутується
- кожен критерій — рядок (назва поля, за зростанням), функція \`item => key\` (за зростанням) або об'єкт \`{ key, order }\`, де \`order\` — \`'asc'\` (за замовчуванням) або \`'desc'\`

**Приклад**
\`\`\`js
sortBy(users, ['age']);
sortBy(users, [{ key: 'dept' }, { key: 'salary', order: 'desc' }]);
sortBy(users, [(u) => u.name.length]);
\`\`\`

**Як це працює:** спершу кожен критерій зводимо до пари \`{ get, dir }\` (функція отримання ключа і \`1\`/\`-1\`). Компаратор проходить критерії по черзі: перший ненульовий результат порівняння × \`dir\` — відповідь; усі нулі → \`0\`, і стабільний \`sort\` збереже початковий порядок.

**Врахуйте:**
- числа порівнюються числово, рядки — \`a.localeCompare(b, 'uk')\` (\`'Андрій' < 'Євген'\`);
- рівні за всіма критеріями — у початковому порядку;
- не мутуйте вхід: \`[...arr].sort(...)\` або \`toSorted\`.
`,
      starter: `function sortBy(arr, criteria) {
  // 1. TODO: нормалізуйте кожен критерій до { get: (item) => key, dir: 1 | -1 }

  // 2. Порівняння двох значень: рядки — localeCompare(b, 'uk'), інше — < / >
  const compareValues = (a, b) => {
    // TODO
  };

  // 3. TODO: [...arr].sort((x, y) => перший ненульовий compareValues(...) * dir, інакше 0)
}

// Спробуйте в консолі: sortBy([{ v: 10 }, { v: 9 }], ['v'])
`,
      solution: `function sortBy(arr, criteria) {
  // нормалізуємо критерії: { get: item => key, dir: 1 | -1 }
  const normalized = criteria.map((criterion) => {
    const { key, order = 'asc' } =
      typeof criterion === 'object' && criterion !== null ? criterion : { key: criterion };
    const get = typeof key === 'function' ? key : (item) => item[key];
    return { get, dir: order === 'desc' ? -1 : 1 };
  });

  const compareValues = (a, b) => {
    if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b, 'uk');
    return a < b ? -1 : a > b ? 1 : 0;
  };

  // копія + стабільний sort
  return [...arr].sort((x, y) => {
    for (const { get, dir } of normalized) {
      const result = compareValues(get(x), get(y));
      if (result !== 0) return result * dir;
    }
    return 0;
  });
}
`,
      hints: [
        'Нормалізуйте критерій: рядок → `{ key: criterion }`; ключ-рядок → `(item) => item[key]`; `order === \'desc\'` → `dir = -1`.',
        'У компараторі: `for (const { get, dir } of normalized)` — перший ненульовий `compareValues(get(x), get(y)) * dir` повертайте; після циклу — `0`.',
        'Сортуйте копію: `[...arr].sort(...)`.'
      ],
      tests: [
        { name: 'за одним числовим ключем (не лексикографічно)', code: 'const r = sortBy([{ v: 10 }, { v: 9 }, { v: 100 }], ["v"]);\nexpect(r.map((x) => x.v)).toEqual([9, 10, 100]);' },
        { name: 'desc', code: 'const r = sortBy([{ v: 1 }, { v: 3 }, { v: 2 }], [{ key: "v", order: "desc" }]);\nexpect(r.map((x) => x.v)).toEqual([3, 2, 1]);' },
        { name: 'кілька ключів з різними напрямками', code: 'const users = [\n  { name: "a", dept: "it", salary: 100 },\n  { name: "b", dept: "hr", salary: 200 },\n  { name: "c", dept: "it", salary: 300 },\n  { name: "d", dept: "hr", salary: 50 }\n];\nconst r = sortBy(users, [{ key: "dept" }, { key: "salary", order: "desc" }]);\nexpect(r.map((u) => u.name)).toEqual(["b", "d", "c", "a"]);' },
        { name: 'ключ-функція', code: 'const r = sortBy(["ccc", "a", "bb"], [(s) => s.length]);\nexpect(r).toEqual(["a", "bb", "ccc"]);' },
        { name: 'стабільність для рівних елементів', code: 'const items = [{ id: 1, g: 2 }, { id: 2, g: 1 }, { id: 3, g: 2 }, { id: 4, g: 1 }];\nexpect(sortBy(items, ["g"]).map((x) => x.id)).toEqual([2, 4, 1, 3]);' },
        { name: 'не мутує оригінал', code: 'const src = [{ v: 2 }, { v: 1 }];\nconst r = sortBy(src, ["v"]);\nexpect(src.map((x) => x.v)).toEqual([2, 1]);\nexpect(r).not.toBe(src);' },
        { name: 'українські рядки в людському порядку', code: 'const r = sortBy([{ n: "Євген" }, { n: "Андрій" }, { n: "Ігор" }, { n: "Борис" }], ["n"]);\nexpect(r.map((x) => x.n)).toEqual(["Андрій", "Борис", "Євген", "Ігор"]);' }
      ],
      explanation: `
O(n log n · k), k — кількість критеріїв.

**Ключове:** комбінований компаратор «перший ненульовий»; у простих випадках — \`a.x - b.x || b.y - a.y\`. Стабільність гарантована з ES2019.

**Оптимізація:** для великих масивів — \`new Intl.Collator('uk').compare\` (не створює collator на кожне порівняння).

**Що спитають далі:** як ставити \`null\`/\`undefined\` завжди в кінець? як сортувати \`'file2'\` перед \`'file10'\` (\`numeric: true\`)?
`
    },
    {
      id: 'arr-shuffle',
      group: 'sort',
      type: 'code',
      level: 3,
      title: 'Перемішування Fisher–Yates',
      tags: ['arrays', 'random', 'algorithms'],
      description: `
**Завдання.** Реалізуйте \`shuffle(arr)\` — повертає **новий** масив з рівномірно випадковою перестановкою (кожна з n! перестановок рівноймовірна).

**Де трапляється:** перемішати питання у квізі, картки в грі «Мемо», порядок варіантів відповіді. Класика співбесід — з питанням «чому не \`sort(() => Math.random() - 0.5)\`?».

**Що написати**
- \`shuffle(arr)\` → новий масив з тими самими елементами у випадковому порядку; використовуйте \`Math.random()\`

**Приклад**
\`\`\`js
shuffle([1, 2, 3, 4]); // наприклад [3, 1, 4, 2]
\`\`\`

**Як це працює (Fisher–Yates):** ідемо з кінця. На кроці \`i\` обираємо випадковий \`j\` з **\`[0, i]\`** і міняємо \`result[i]\` та \`result[j]\` місцями — позиція \`i\` зафіксована. Кількість можливих послідовностей виборів — рівно \`n!\`, тож розподіл рівномірний.

**Врахуйте:**
- оригінал не мутується;
- тести підміняють \`Math.random\` і перевіряють **рівномірність** — \`sort\` з випадковим компаратором чи обмін з будь-яким \`j ∈ [0, n)\` не пройдуть.
`,
      starter: `function shuffle(arr) {
  // 1. Копія, щоб не мутувати оригінал.
  const result = arr.slice();

  // 2. TODO: for (let i = result.length - 1; i > 0; i--)
  //    j = Math.floor(Math.random() * (i + 1));
  //    поміняти result[i] і result[j]

  return result;
}

// Спробуйте в консолі: shuffle([1, 2, 3, 4, 5])
`,
      solution: `function shuffle(arr) {
  const result = arr.slice(); // не мутуємо оригінал
  // Fisher–Yates: ідемо з кінця, міняємо i з випадковим j ∈ [0, i]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
`,
      hints: [
        'Прохід з кінця: `for (let i = result.length - 1; i > 0; i--)`.',
        'Випадковий індекс з `[0, i]` включно: `Math.floor(Math.random() * (i + 1))`. Не з `[0, n)` — це дає зміщення.',
        'Обмін деструктуризацією: `[a[i], a[j]] = [a[j], a[i]]`.'
      ],
      tests: [
        { name: 'результат — перестановка тих самих елементів', code: 'const src = [5, 1, 4, 2, 3, 3];\nconst r = shuffle(src);\nexpect(r).toHaveLength(src.length);\nexpect([...r].sort()).toEqual([...src].sort());' },
        { name: 'не мутує оригінал і повертає новий масив', code: 'const src = [1, 2, 3, 4, 5];\nconst r = shuffle(src);\nexpect(src).toEqual([1, 2, 3, 4, 5]);\nexpect(r).not.toBe(src);' },
        { name: 'порожній і з одного елемента', code: 'expect(shuffle([])).toEqual([]);\nexpect(shuffle([7])).toEqual([7]);' },
        { name: 'використовує Math.random', code: 'const orig = Math.random;\nconst spy = mockFn(() => 0.5);\nMath.random = spy;\ntry {\n  shuffle([1, 2, 3, 4]);\n} finally {\n  Math.random = orig;\n}\nexpect(spy).toHaveBeenCalled();' },
        { name: 'рівномірний розподіл перестановок (60000 запусків)', code: 'const orig = Math.random;\nlet seed = 42;\nMath.random = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };\nconst counts = {};\ntry {\n  for (let k = 0; k < 60000; k++) {\n    const key = shuffle([0, 1, 2]).join("");\n    counts[key] = (counts[key] || 0) + 1;\n  }\n} finally {\n  Math.random = orig;\n}\nexpect(Object.keys(counts).length).toBe(6);\nfor (const c of Object.values(counts)) {\n  expect(c).toBeGreaterThan(9500);\n  expect(c).toBeLessThan(10500);\n}' }
      ],
      explanation: `
O(n) часу. Кожна з \`n!\` послідовностей виборів дає унікальну перестановку → рівномірно.

**Чому інші підходи погані:**
- \`sort(() => Math.random() - 0.5)\` — неузгоджений компаратор, сильне зміщення, O(n log n);
- обмін з \`j ∈ [0, n)\` — \`nⁿ\` шляхів, а \`nⁿ\` не ділиться на \`n!\` → зміщення.

\`Math.random\` не криптостійкий — для лотерей і токенів \`crypto.getRandomValues\`.

**Що спитають далі:** як вибрати k випадкових елементів без повторів?
`
    },
    // ================================================================ flat
    {
      id: 'arr-quiz-at-with',
      group: 'flat',
      type: 'quiz',
      level: 1,
      title: 'at() і with() з від\'ємними індексами',
      tags: ['arrays', 'at', 'es2023'],
      question: `
Що виведе код?

\`\`\`js
const arr = [10, 20, 30];
console.log(arr.at(-1), arr[-1], arr.with(-1, 99), arr);
\`\`\`
`,
      options: [
        '`30 30 [10, 20, 99] [10, 20, 99]`',
        '`30 undefined [99, 20, 30] [10, 20, 30]`',
        '`undefined undefined [10, 20, 30, 99] [10, 20, 30]`',
        '`30 undefined [10, 20, 99] [10, 20, 30]`'
      ],
      answer: 3,
      why: [
        '`arr[-1]` — це властивість з ключем `\'-1\'`, а не останній елемент; і `with` не мутує `arr`.',
        '`with(-1, …)` рахує з кінця, тож замінює останній елемент, а не перший.',
        '`at` підтримує від\'ємні індекси, а `with` замінює елемент, а не додає.',
        'Правильно: `at` і `with` рахують з кінця, `[]` — ні; `with` повертає копію.'
      ],
      hint: 'Квадратні дужки не розуміють від\'ємних індексів — `-1` для них просто ключ-рядок.',
      explanation: `
\`at(-1)\` — останній елемент (замість \`arr[arr.length - 1]\`). \`arr[-1]\` шукає властивість \`'-1'\` → \`undefined\`. \`with(i, v)\` (ES2023) — копія з заміною, оригінал не змінюється.
`
    },
    {
      id: 'arr-quiz-flat',
      group: 'flat',
      type: 'quiz',
      level: 1,
      title: 'flat і flatMap',
      tags: ['arrays', 'flat'],
      question: `
Що виведе код?

\`\`\`js
console.log([1, [2, [3, [4]]]].flat());
console.log(['a b', 'c'].flatMap((s) => s.split(' ')));
\`\`\`
`,
      options: [
        '`[1, 2, 3, 4]` і `["a", "b", "c"]`',
        '`[1, 2, [3, [4]]]` і `[["a", "b"], ["c"]]`',
        '`[1, 2, [3, [4]]]` і `["a", "b", "c"]`',
        '`[1, [2, [3, [4]]]]` і `["a b", "c"]`'
      ],
      answer: 2,
      why: [
        '`flat()` за замовчуванням розгортає лише один рівень, не всі.',
        '`flatMap` після `map` розгортає один рівень, тож вкладених масивів не лишиться.',
        'Правильно: глибина `flat` за замовчуванням — 1, а `flatMap` = `map` + `flat(1)`.',
        'Обидва методи розгортають хоча б один рівень.'
      ],
      hint: 'Яка глибина `flat` за замовчуванням? І на скільки рівнів «сплющує» `flatMap`?',
      explanation: `
\`flat()\` — глибина **1**; повністю — \`flat(Infinity)\`. \`flatMap(fn)\` = \`map(fn)\` + \`flat(1)\`.

\`flatMap\` зручний, щоб перетворити й відфільтрувати за прохід: повернути \`[]\` — елемент зникне, \`[x, y]\` — з'являться два.
`
    },
    {
      id: 'arr-my-flat',
      group: 'flat',
      type: 'code',
      level: 3,
      interview: true,
      title: 'Свій flat(depth)',
      tags: ['arrays', 'polyfill', 'recursion'],
      description: `
**Завдання.** Реалізуйте \`myFlat(arr, depth = 1)\` — поведінку \`arr.flat(depth)\` без вбудованих \`flat\`/\`flatMap\`.

**Де трапляється:** класика співбесід на рекурсію + методи масивів. На практиці — «сплющити» вкладені категорії чи відповіді API.

**Що написати**
- \`myFlat(arr, depth = 1)\` → новий масив; вкладені **масиви** розгортаються до глибини \`depth\` (\`Infinity\` — повністю)

**Приклад**
\`\`\`js
myFlat([1, [2, [3, [4]]]]);            // [1, 2, [3, [4]]]
myFlat([1, [2, [3, [4]]]], 2);         // [1, 2, 3, [4]]
myFlat([1, [2, [3, [4]]]], Infinity);  // [1, 2, 3, 4]
myFlat([1, , [2, , 3]]);               // [1, 2, 3]
\`\`\`

**Як це працює:** допоміжна рекурсивна функція \`flatten(items, depth)\` дописує в один спільний \`result\`: якщо елемент — масив і \`depth > 0\`, викликає себе з \`depth - 1\`, інакше робить \`push\`. \`Infinity - 1 === Infinity\`, тож «повністю» працює без окремої гілки.

**Врахуйте:**
- \`depth <= 0\` → поверхнева копія;
- дірки **видаляються** (як у справжнього \`flat\`);
- рядки й array-like не розгортаються — лише \`Array.isArray\`;
- оригінал не змінюється.
`,
      starter: `function myFlat(arr, depth = 1) {
  const result = [];

  function flatten(items, currentDepth) {
    // TODO: для кожного існуючого індексу (i in items):
    //   масив і currentDepth > 0 → flatten(value, currentDepth - 1)
    //   інакше → result.push(value)
  }

  flatten(arr, depth);
  return result;
}

// Спробуйте в консолі: myFlat([1, [2, [3]]], Infinity)
`,
      solution: `function myFlat(arr, depth = 1) {
  const result = [];

  function flatten(items, currentDepth) {
    for (let i = 0; i < items.length; i++) {
      if (!(i in items)) continue;          // дірки видаляються
      const value = items[i];
      if (Array.isArray(value) && currentDepth > 0) {
        flatten(value, currentDepth - 1);   // Infinity - 1 === Infinity
      } else {
        result.push(value);
      }
    }
  }

  flatten(arr, depth);
  return result;
}
`,
      hints: [
        'Рекурсивна `flatten(items, depth)` дописує елементи в спільний `result`.',
        '`Array.isArray(value) && currentDepth > 0` → рекурсія з `currentDepth - 1`; інакше `push`.',
        'Дірки пропускайте перевіркою `i in items`.'
      ],
      tests: [
        { name: 'глибина 1 за замовчуванням, без вбудованого flat', code: 'let r;\nconst orig = Array.prototype.flat;\nArray.prototype.flat = function () { throw new Error("flat заборонено"); };\ntry {\n  r = myFlat([1, [2, [3, [4]]]]);\n} finally {\n  Array.prototype.flat = orig;\n}\nexpect(r).toEqual([1, 2, [3, [4]]]);' },
        { name: 'задана глибина та Infinity', code: 'expect(myFlat([1, [2, [3, [4]]]], 2)).toEqual([1, 2, 3, [4]]);\nexpect(myFlat([1, [2, [3, [4, [5]]]]], Infinity)).toEqual([1, 2, 3, 4, 5]);' },
        { name: 'depth 0 — поверхнева копія', code: 'const src = [1, [2]];\nconst r = myFlat(src, 0);\nexpect(r).toEqual([1, [2]]);\nexpect(r).not.toBe(src);\nexpect(r[1]).toBe(src[1]);' },
        { name: 'дірки видаляються', code: 'const r = myFlat([1, , [2, , 3]]);\nexpect(r).toEqual([1, 2, 3]);\nexpect(r.length).toBe(3);' },
        { name: 'рядки й array-like не розгортаються', code: 'const al = { length: 1, 0: "x" };\nconst r = myFlat([["a"], "bc", al], Infinity);\nexpect(r).toEqual(["a", "bc", al]);' },
        { name: 'не мутує оригінал; порожні масиви', code: 'const src = [[1], [[2]], []];\nmyFlat(src, Infinity);\nexpect(src).toEqual([[1], [[2]], []]);\nexpect(myFlat([[], [[]]], Infinity)).toEqual([]);' },
        { name: 'глибока вкладеність', code: 'let deep = [0];\nfor (let i = 1; i <= 1000; i++) deep = [deep, i];\nconst r = myFlat(deep, Infinity);\nexpect(r).toHaveLength(1001);\nexpect(r[0]).toBe(0);\nexpect(r[1000]).toBe(1000);' }
      ],
      explanation: `
O(N) за загальною кількістю елементів; рекурсія завглибшки до \`depth\`.

**Класична альтернатива** — \`reduce\` + \`concat\`:
\`\`\`js
const flat = (arr, d = 1) =>
  d > 0 ? arr.reduce((acc, x) => acc.concat(Array.isArray(x) ? flat(x, d - 1) : x), []) : arr.slice();
\`\`\`
Коротко, але копіює акумулятор на кожному кроці.

**Типові помилки:** \`typeof x === 'object'\` замість \`Array.isArray\`; не видалені дірки; ігнорування \`depth = 0\`.

**Що спитають далі:** реалізуйте без рекурсії (явний стек)?
`
    },
    {
      id: 'arr-quiz-holes',
      group: 'flat',
      type: 'quiz',
      level: 3,
      title: 'Дірки в масивах: різні методи — різна поведінка',
      tags: ['arrays', 'sparse'],
      question: `
Що виведе код?

\`\`\`js
const a = [1, , 3];
let count = 0;
a.forEach(() => count++);
console.log(a.length, count, Object.keys(a), a.includes(undefined), a.indexOf(undefined));
\`\`\`
`,
      options: [
        '`3 3 ["0", "1", "2"] true 1`',
        '`2 2 ["0", "1"] false -1`',
        '`3 2 ["0", "2"] false -1`',
        '`3 2 ["0", "2"] true -1`'
      ],
      answer: 3,
      why: [
        'Дірка — відсутня властивість: `forEach` її пропускає, `Object.keys` її не бачить.',
        'Дірка займає позицію, тож `length` — 3.',
        '`includes` читає `a[i]` для кожного індексу, і читання дірки дає `undefined` → `true`.',
        'Правильно: `forEach`, `Object.keys`, `indexOf` пропускають дірку, а `includes` бачить її як `undefined`.'
      ],
      hint: 'Дірка — це відсутність властивості, а не значення `undefined`. Одні методи перевіряють наявність індексу, інші просто читають `a[i]`.',
      explanation: `
Старі методи (\`forEach\`, \`map\`, \`filter\`, \`reduce\`, \`indexOf\`, \`some\`, \`every\`) пропускають дірки (перевіряють \`i in a\`); новіші (\`includes\`, \`find\`, \`for..of\`, spread, \`Array.from\`) бачать на їх місці \`undefined\`.
`
    },
    {
      id: 'arr-theory-array-like',
      group: 'flat',
      type: 'theory',
      level: 3,
      title: 'Array-like об\'єкти і Array.from',
      tags: ['arrays', 'array-like'],
      question: 'Що таке array-like об\'єкти? Наведіть приклади. Як перетворити їх на масив? Оберіть **усі** правильні твердження.',
      choices: [
        '`Array.from` працює з array-like, а spread `[...x]` з `{ length: 2, 0: \'a\', 1: \'b\' }` кидає TypeError',
        'Будь-який array-like можна перебрати `for..of`, бо він має індекси від `0` до `length - 1`',
        '`arguments` — справжній масив, тому в нього є `map` і `filter`',
        'Рядок поводиться як array-like: має `length` і доступ за індексом `str[0]`'
      ],
      correct: [0, 3],
      why: [
        'Правильно: `Array.from` читає `length` та індекси, а spread вимагає ітерованості, якої в простого об\'єкта немає.',
        'Хибно: `for..of` потребує ітерованості, а не просто `length` та індексів (про ітератори — у темі ES6+).',
        'Хибно: `arguments` — array-like без методів масиву; замість нього — rest `(...args)`.',
        'Правильно: `\'abc\'.length === 3`, `\'abc\'[0] === \'a\'`.'
      ],
      answer: `
**Array-like** — об'єкт з числовою \`length\` та ключами \`0..length-1\`, але **без методів масиву**.
Приклади: \`arguments\`, рядки, \`{ length: 2, 0: 'a', 1: 'b' }\`, DOM-колекції (\`el.children\`).

**Перетворення:**
\`\`\`js
Array.from({ length: 2, 0: 'a', 1: 'b' }); // ['a', 'b']
Array.from('abc', (c) => c.toUpperCase()); // ['A', 'B', 'C']
[...{ length: 2 }];                        // TypeError: not iterable
\`\`\`

\`Array.from\` працює і з array-like, і з ітерованими (масиви, рядки) + має мапер. Spread — лише з ітерованими (докладно — у темі ES6+).

**Практика:** замість \`arguments\` — rest-параметри; \`Array.isArray(x)\` — єдина надійна перевірка масиву.
`,
      keyPoints: [
        'Array-like: length + індекси, без методів масиву',
        'Приклади: arguments, рядки, DOM-колекції',
        'Array.from — для array-like; spread — лише для ітерованих',
        'Array.isArray для перевірки'
      ],
      followUps: ['Чому rest-параметри кращі за arguments?', 'Що поверне Array.from({ length: 3 })?']
    },
    {
      id: 'arr-theory-sparse',
      group: 'flat',
      type: 'theory',
      level: 4,
      title: 'Розріджені масиви (дірки)',
      tags: ['arrays', 'sparse', 'performance'],
      question: 'Що таке «дірки» (holes) у масивах? Як вони виникають, як їх обробляють методи і чому їх варто уникати? Оберіть **усі** правильні твердження.',
      choices: [
        '`1 in [1, , 3]` дає `false`: дірка — це відсутня властивість, а не елемент зі значенням `undefined`',
        '`delete arr[0]` видаляє елемент і зсуває решту вліво, тож дірки при цьому не виникає',
        '`forEach` і `map` пропускають дірки, а `for..of`, spread і `Array.from` бачать на їх місці `undefined`',
        'Дірки не впливають на продуктивність: V8 зберігає такі масиви так само, як щільні',
        'Масив, що отримав дірку, лишається в `HOLEY`-режимі V8 навіть після заповнення пропусків'
      ],
      correct: [0, 2, 4],
      why: [
        'Правильно: `[1, undefined, 3]` і `[1, , 3]` — різні масиви.',
        'Хибно: `delete` не зсуває елементи, а саме лишає дірку; видаляйте `splice`/`filter`.',
        'Правильно: ES5-методи перевіряють `i in arr`, новіші читають `arr[i]`.',
        'Хибно: «дірявий» масив V8 зберігає в повільнішому режимі.',
        'Правильно: перехід у HOLEY незворотний.'
      ],
      answer: `
**Дірка** — індекс у межах \`length\` без властивості: \`1 in [1, , 3]\` → \`false\`, а \`1 in [1, undefined, 3]\` → \`true\`.

**Як виникають:** \`new Array(3)\`, \`[1, , 3]\`, \`arr[100] = 1\`, \`delete arr[0]\`, \`arr.length = 10\`.

**Методи:** \`forEach\`, \`map\` (дірки зберігає), \`filter\`, \`reduce\`, \`indexOf\`, \`Object.keys\` — пропускають; \`for..of\`, spread, \`Array.from\`, \`includes\`, \`find\` — бачать \`undefined\`; \`flat\` видаляє; \`JSON.stringify\` → \`null\`.

**Продуктивність:** V8 відстежує «elements kind» (\`PACKED_*\` / \`HOLEY_*\`). Дірка переводить масив у \`HOLEY\` — доступ повільніший, перехід **незворотний**. Дуже розріджені (\`arr[1e6] = 1\`) — «dictionary mode».

**Як уникати:** \`Array.from({ length: n }, fn)\`, \`fill\`, \`push\` замість запису за індексом, \`splice\`/\`filter\` замість \`delete\`.
`,
      keyPoints: [
        'Дірка — відсутня властивість, а не значення undefined',
        'Виникають: new Array(n), [1, , 3], delete, запис за межами',
        'ES5-методи пропускають дірки, новіші бачать undefined',
        'HOLEY elements kind у V8 — повільніше, незворотно'
      ],
      followUps: ['Чим delete arr[i] відрізняється від arr.splice(i, 1)?', 'Що таке elements kinds у V8?']
    },
    // ================================================================ slicing
    {
      id: 'arr-chunk',
      group: 'slicing',
      type: 'code',
      level: 1,
      interview: true,
      title: 'chunk: розбити на пачки',
      tags: ['arrays', 'utils'],
      description: `
**Завдання.** Напишіть \`chunk(arr, size)\` — розбиває масив на підмасиви довжини \`size\` (останній може бути коротшим).

**Де трапляється:** API приймає максимум 50 id за запит — розбиваємо 230 id на пачки; рядки сітки товарів по 4; пагінація на клієнті.

**Що написати**
- \`chunk(arr, size)\` → масив масивів

**Приклад**
\`\`\`js
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
chunk([1, 2], 5);          // [[1, 2]]
chunk([], 3);              // []
\`\`\`

**Як це працює:** цикл з кроком \`size\`: \`for (let i = 0; i < arr.length; i += size)\`. \`arr.slice(i, i + size)\` не мутує масив і сам обрізає кінець, якщо елементів менше.

**Врахуйте:**
- \`size\` — ціле ≥ 1, інакше \`RangeError\` (при \`0\` цикл був би нескінченним);
- оригінал не мутувати.
`,
      starter: `function chunk(arr, size) {
  // 1. TODO: size не ціле або < 1 → throw new RangeError(...)
  const result = [];
  // 2. TODO: цикл з кроком size, result.push(arr.slice(i, i + size))
  return result;
}

// Спробуйте в консолі: chunk([1, 2, 3, 4, 5], 2)
`,
      solution: `function chunk(arr, size) {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError('size має бути цілим числом ≥ 1');
  }
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size)); // slice не виходить за межі масиву
  }
  return result;
}
`,
      hints: [
        'Цикл з кроком `size`: `for (let i = 0; i < arr.length; i += size)`.',
        'Перевірка: `Number.isInteger(size) && size >= 1`.'
      ],
      tests: [
        'expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])',
        { name: 'рівний поділ', code: 'expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);\nexpect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);' },
        { name: 'size більший за довжину', code: 'expect(chunk([1, 2], 5)).toEqual([[1, 2]]);' },
        { name: 'порожній масив', code: 'expect(chunk([], 3)).toEqual([]);' },
        { name: 'некоректний size → RangeError', code: 'expect(() => chunk([1], 0)).toThrow(RangeError);\nexpect(() => chunk([1], -1)).toThrow(RangeError);\nexpect(() => chunk([1], 1.5)).toThrow(RangeError);' },
        { name: 'не мутує оригінал', code: 'const src = [1, 2, 3];\nchunk(src, 2);\nexpect(src).toEqual([1, 2, 3]);' }
      ],
      explanation: `
O(n).

**Типові помилки:** немає валідації \`size\`; \`while (arr.length) res.push(arr.splice(0, size))\` — знищує вхідний масив і O(n²) через зсуви.

**Що спитають далі:** як надіслати запити пачками по N послідовно (тема про асинхронність)?
`
    },
    {
      id: 'arr-zip',
      group: 'slicing',
      type: 'code',
      level: 2,
      title: 'zip: підписи і значення для графіка',
      tags: ['arrays', 'utils'],
      description: `
**Завдання.** Реалізуйте \`zip\` (групує елементи за індексом) і обернену \`unzip\`.

**Де трапляється:** API віддає паралельні масиви \`labels\` і \`values\`, а бібліотеці графіків потрібні пари \`[label, value]\`; заголовки CSV + рядок → \`Object.fromEntries(zip(headers, row))\`.

**Що написати**
- \`zip(...arrays)\` → масив, де i-й елемент — \`[a[i], b[i], …]\`; довжина — **найбільша**, відсутні значення — \`undefined\`
- \`unzip(zipped)\` → обернена операція

**Приклад**
\`\`\`js
zip(['Пн', 'Вт', 'Ср'], [12, 7, 9]); // [['Пн', 12], ['Вт', 7], ['Ср', 9]]
zip([1, 2], ['a']);                 // [[1, 'a'], [2, undefined]]
unzip([[1, 'a'], [2, 'b']]);        // [[1, 2], ['a', 'b']]
zip();                              // []
\`\`\`

**Як це працює:** це транспонування таблиці (рядки ↔ стовпці). Довжина — \`Math.max(0, ...arrays.map((a) => a.length))\`, i-й рядок — \`arrays.map((a) => a[i])\`. \`unzip\` — той самий \`zip\`, застосований до рядків.

**Врахуйте:**
- \`Math.max()\` без аргументів — \`-Infinity\`, тому \`0\` першим аргументом;
- вхідні масиви не мутуються.
`,
      starter: `function zip(...arrays) {
  // 1. TODO: length = найбільша довжина (0, якщо масивів немає)
  // 2. TODO: Array.from({ length }, (_, i) => елементи з індексом i з кожного масиву)
}

function unzip(zipped) {
  // TODO: перевикористайте zip
}

// Спробуйте в консолі: zip(['Пн', 'Вт'], [12, 7])
`,
      solution: `function zip(...arrays) {
  const length = Math.max(0, ...arrays.map((arr) => arr.length));
  return Array.from({ length }, (_, i) => arrays.map((arr) => arr[i]));
}

function unzip(zipped) {
  return zip(...zipped); // транспонування — сам собі обернений
}
`,
      hints: [
        'Довжина — `Math.max(0, ...arrays.map(a => a.length))`.',
        'i-й елемент результату — `arrays.map(arr => arr[i])`; `unzip(z)` — це `zip(...z)`.'
      ],
      tests: [
        'expect(zip([1, 2, 3], ["a", "b", "c"])).toEqual([[1, "a"], [2, "b"], [3, "c"]])',
        { name: 'різна довжина — доповнення undefined', code: 'const r = zip([1, 2], ["a"]);\nexpect(r).toHaveLength(2);\nexpect(r[1]).toHaveLength(2);\nexpect(r[1][1]).toBeUndefined();' },
        { name: 'три масиви', code: 'expect(zip([1, 2], [3, 4], [5, 6])).toEqual([[1, 3, 5], [2, 4, 6]]);' },
        { name: 'без аргументів і з порожніми', code: 'expect(zip()).toEqual([]);\nexpect(zip([], [])).toEqual([]);' },
        { name: 'unzip — обернена операція', code: 'expect(unzip([[1, "a"], [2, "b"]])).toEqual([[1, 2], ["a", "b"]]);\nconst a = [1, 2, 3], b = [4, 5, 6];\nexpect(unzip(zip(a, b))).toEqual([a, b]);' },
        { name: 'практика: об\'єкт з заголовків і рядка', code: 'expect(Object.fromEntries(zip(["name", "age"], ["Ann", 30]))).toEqual({ name: "Ann", age: 30 });' }
      ],
      explanation: `
O(n · k), k — кількість масивів.

**Нюанс:** spread у \`Math.max\` для сотень тисяч масивів може переповнити ліміт аргументів — тоді цикл.

**Що спитають далі:** \`zipWith(fn, ...arrays)\`? варіант, що обрізає до найкоротшого (як у Python)?
`
    },
    {
      id: 'arr-rotate',
      group: 'slicing',
      type: 'code',
      level: 2,
      title: 'rotate: тиждень з понеділка, каруселі',
      tags: ['arrays', 'utils'],
      description: `
**Завдання.** Напишіть \`rotate(arr, k)\` — новий масив, циклічно зсунутий **вправо** на \`k\` позицій (від'ємне \`k\` — вліво).

**Де трапляється:** \`Date.getDay()\` рахує з неділі, а в українському календарі тиждень з понеділка: \`rotate(days, -1)\`. Каруселі й слайдери, ротація банерів.

**Що написати**
- \`rotate(arr, k)\` → новий масив; \`k\` може бути будь-яким цілим (і дуже великим)

**Приклад**
\`\`\`js
rotate(['Нд', 'Пн', 'Вт', 'Ср'], -1); // ['Пн', 'Вт', 'Ср', 'Нд']
rotate([1, 2, 3, 4, 5], 2);          // [4, 5, 1, 2, 3]
rotate([1, 2, 3], 4);                // [3, 1, 2]
rotate([], 3);                       // []
\`\`\`

**Як це працює:** зсув на \`n\` повертає масив у початковий стан, тож потрібен лише залишок. Але в JS \`%\` зберігає знак діленого: \`-1 % 5 === -1\`. Нормалізація \`((k % n) + n) % n\` дає число в \`[0, n)\` для будь-якого \`k\`. Далі — «хвіст» + «голова» через два \`slice\`.

**Врахуйте:**
- порожній масив (ділення на 0 у \`%\` дасть \`NaN\`);
- \`k = 0\` → копія, не той самий масив;
- оригінал не мутувати.
`,
      starter: `function rotate(arr, k) {
  const n = arr.length;
  // 1. TODO: порожній масив → []
  // 2. TODO: shift = ((k % n) + n) % n
  // 3. TODO: [...arr.slice(n - shift), ...arr.slice(0, n - shift)]
}

// Спробуйте в консолі: rotate(['Нд', 'Пн', 'Вт'], -1)
`,
      solution: `function rotate(arr, k) {
  const n = arr.length;
  if (n === 0) return [];
  // нормалізуємо k у діапазон [0, n): працює і для від'ємних, і для великих
  const shift = ((k % n) + n) % n;
  return [...arr.slice(n - shift), ...arr.slice(0, n - shift)];
}
`,
      hints: [
        'Потрібен лише залишок `k % n`, нормалізований у `[0, n)`: `((k % n) + n) % n`.',
        'Результат — `[...arr.slice(n - shift), ...arr.slice(0, n - shift)]`.'
      ],
      tests: [
        'expect(rotate([1, 2, 3, 4, 5], 2)).toEqual([4, 5, 1, 2, 3])',
        { name: 'від\'ємний k — вліво', code: 'expect(rotate([1, 2, 3, 4, 5], -1)).toEqual([2, 3, 4, 5, 1]);\nexpect(rotate(["Нд", "Пн", "Вт"], -1)).toEqual(["Пн", "Вт", "Нд"]);\nexpect(rotate([1, 2, 3], -4)).toEqual([2, 3, 1]);' },
        { name: 'k більший за довжину', code: 'expect(rotate([1, 2, 3], 4)).toEqual([3, 1, 2]);\nexpect(rotate([1, 2, 3], 3)).toEqual([1, 2, 3]);' },
        { name: 'k = 0 — копія, не той самий масив', code: 'const src = [1, 2];\nconst r = rotate(src, 0);\nexpect(r).toEqual([1, 2]);\nexpect(r).not.toBe(src);' },
        { name: 'порожній масив і не мутує вхід', code: 'expect(rotate([], 3)).toEqual([]);\nconst src = [1, 2, 3];\nrotate(src, 1);\nexpect(src).toEqual([1, 2, 3]);' },
        { name: 'величезний k обробляється миттєво', code: 'expect(rotate([1, 2, 3], 1e9 + 1)).toEqual([2, 3, 1]);' }
      ],
      explanation: `
O(n) незалежно від \`k\`.

**Чому не «\`k\` разів \`unshift(pop())\`»:** O(n · k), для \`k = 10⁹\` — вічність.

**Що спитають далі:** зсув на місці за O(1) пам'яті (три розвороти)? як перевірити, що рядок — циклічний зсув іншого (\`(a + a).includes(b)\`)?
`
    },
    {
      id: 'arr-windowed',
      group: 'slicing',
      type: 'code',
      level: 2,
      title: 'windowed: ковзне середнє для графіка',
      tags: ['arrays', 'utils'],
      description: `
**Завдання.** Реалізуйте \`windowed\` (ковзні вікна) і \`pairs\` (сусідні пари).

**Де трапляється:** ковзне середнє на графіку продажів (згладжування за 7 днів), зміна між сусідніми точками (\`+3\`, \`-2\`), перевірка, що список відсортований.

**Що написати**
- \`windowed(arr, size, step = 1)\` → масив вікон довжини **рівно** \`size\`, що зсуваються на \`step\`; неповні вікна в кінці відкидаються
- \`pairs(arr)\` → сусідні пари (вікна розміру 2)

**Приклад**
\`\`\`js
windowed([1, 2, 3, 4, 5], 3);    // [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
windowed([1, 2, 3, 4, 5], 2, 2); // [[1, 2], [3, 4]]
pairs([10, 13, 11]);             // [[10, 13], [13, 11]]
pairs([10, 13, 11]).map(([a, b]) => b - a); // [3, -2]
\`\`\`

**Як це працює:** цикл по стартовому індексу вікна з кроком \`step\`; умова \`i + size <= arr.length\` гарантує, що вікно повне. Кожне вікно — \`arr.slice(i, i + size)\`.

**Врахуйте:**
- \`size\` і \`step\` — цілі ≥ 1, інакше \`RangeError\`;
- вікно більше за масив → \`[]\`.
`,
      starter: `function windowed(arr, size, step = 1) {
  // 1. TODO: валідація size і step → RangeError
  const result = [];
  // 2. TODO: for (let i = 0; i + size <= arr.length; i += step) — push(arr.slice(...))
  return result;
}

function pairs(arr) {
  // TODO: перевикористайте windowed
}

// Спробуйте в консолі: windowed([1, 2, 3, 4], 2)
`,
      solution: `function windowed(arr, size, step = 1) {
  if (!Number.isInteger(size) || size < 1 || !Number.isInteger(step) || step < 1) {
    throw new RangeError('size і step мають бути цілими ≥ 1');
  }
  const result = [];
  // i + size <= length — лише повні вікна
  for (let i = 0; i + size <= arr.length; i += step) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function pairs(arr) {
  return windowed(arr, 2);
}
`,
      hints: [
        'Цикл по стартовому індексу: `for (let i = 0; i + size <= arr.length; i += step)`.',
        '`pairs(arr)` — це `windowed(arr, 2)`.'
      ],
      tests: [
        'expect(windowed([1, 2, 3, 4, 5], 3)).toEqual([[1, 2, 3], [2, 3, 4], [3, 4, 5]])',
        { name: 'з кроком', code: 'expect(windowed([1, 2, 3, 4, 5], 2, 2)).toEqual([[1, 2], [3, 4]]);\nexpect(windowed([1, 2, 3, 4, 5, 6], 2, 3)).toEqual([[1, 2], [4, 5]]);' },
        { name: 'вікно більше за масив', code: 'expect(windowed([1, 2], 3)).toEqual([]);\nexpect(windowed([], 1)).toEqual([]);' },
        { name: 'некоректні параметри', code: 'expect(() => windowed([1], 0)).toThrow(RangeError);\nexpect(() => windowed([1], 1, 0)).toThrow(RangeError);' },
        { name: 'pairs', code: 'expect(pairs([1, 2, 3])).toEqual([[1, 2], [2, 3]]);\nexpect(pairs([1])).toEqual([]);' },
        { name: 'практика: ковзне середнє', code: 'const avg = windowed([2, 4, 6, 8], 2).map(([a, b]) => (a + b) / 2);\nexpect(avg).toEqual([3, 5, 7]);' }
      ],
      explanation: `
O(кількість вікон · size).

**Оптимізація:** якщо потрібна лише сума вікна — *sliding window*: додати новий елемент, відняти старий, O(n) без створення масивів.

**Що спитають далі:** ковзне середнє за O(n)? як перевірити відсортованість через \`pairs\` (\`every(([a, b]) => a <= b)\`)?
`
    },
    // ================================================================ lookup
    {
      id: 'arr-unique-by',
      group: 'lookup',
      type: 'code',
      level: 2,
      title: 'unique і uniqueBy: прибрати дублікати після «Завантажити ще»',
      tags: ['arrays', 'dictionary', 'utils'],
      description: `
**Завдання.** Реалізуйте \`unique\` (для рядків і чисел) і \`uniqueBy\` (за ключем) — обидві за **O(n)**.

**Де трапляється:** «Завантажити ще» підвантажує сторінку, і частина товарів дублюється (дані змістились) — прибираємо за \`id\`. Унікальні теги для фільтра. Класика співбесід («а без O(n²)?»).

**Що написати**
- \`unique(values)\` → масив без дублікатів; \`1\` і \`'1'\` — різні; \`NaN\` — як звичайне значення; порядок перших входжень
- \`uniqueBy(arr, iteratee)\` → лишає **перший** елемент з кожним ключем; \`iteratee\` — назва поля або функція \`item => key\`

**Приклад**
\`\`\`js
unique([1, 2, 1, NaN, NaN, '1']); // [1, 2, NaN, '1']
uniqueBy([{ id: 1, v: 'a' }, { id: 1, v: 'b' }, { id: 2 }], 'id'); // [{ id: 1, v: 'a' }, { id: 2 }]
uniqueBy(['A', 'a', 'b'], (s) => s.toLowerCase());                  // ['A', 'b']
\`\`\`

**Як це працює:** \`includes\` у циклі — O(n²). Замість нього — об'єкт-словник «бачені ключі»: перевірка й запис O(1). Ключі об'єкта — рядки, тому \`1\` і \`'1'\` злиплися б. Трюк: ключ \`typeof value + ':' + value\` → \`'number:1'\` і \`'string:1'\` різні (і ніколи не збігаються з вбудованими \`'toString'\`/\`'constructor'\`).

**Врахуйте:**
- порожній масив → \`[]\`;
- вхід не мутувати;
- 100 000 елементів мають оброблятися миттєво.
`,
      starter: `function unique(values) {
  const seen = {};
  const result = [];
  // TODO: для кожного value: key = typeof value + ':' + value;
  //       якщо ключа ще немає в seen — запам'ятати і додати value в result
  return result;
}

function uniqueBy(arr, iteratee) {
  // 1. TODO: рядок → (item) => item[iteratee]
  // 2. TODO: filter, що лишає лише перший елемент з кожним ключем
  //    (перевірка: Object.hasOwn(seen, key))
}

// Спробуйте в консолі: unique([1, 1, '1', 2])
`,
      solution: `function unique(values) {
  const seen = {};
  const result = [];
  for (const value of values) {
    // тип у ключі: 1 і '1' не злипаються, а 'toString' не конфліктує з вбудованим
    const key = typeof value + ':' + value;
    if (!seen[key]) {
      seen[key] = true;
      result.push(value);
    }
  }
  return result;
}

function uniqueBy(arr, iteratee) {
  const getKey = typeof iteratee === 'function' ? iteratee : (item) => item[iteratee];
  const seen = {};
  return arr.filter((item) => {
    const key = getKey(item);
    if (Object.hasOwn(seen, key)) return false;
    seen[key] = true;
    return true;
  });
}
`,
      hints: [
        'Словник «бачених» ключів: `if (!seen[key]) { seen[key] = true; result.push(value); }` — O(1) на елемент.',
        'Для `unique` ключ із типом: `typeof value + \':\' + value`.',
        'Для `uniqueBy` нормалізуйте `iteratee` у функцію і використайте `filter` + `Object.hasOwn(seen, key)`.'
      ],
      tests: [
        { name: 'unique: примітиви й порядок', code: 'expect(unique([3, 1, 3, 2, 1])).toEqual([3, 1, 2]);\nexpect(unique([1, "1", 1])).toEqual([1, "1"]);' },
        { name: 'unique: NaN', code: 'const r = unique([NaN, 1, NaN]);\nexpect(r).toHaveLength(2);\nexpect(r[0]).toBeNaN();' },
        { name: 'unique: рядки на кшталт "toString"', code: 'expect(unique(["toString", "constructor", "toString"])).toEqual(["toString", "constructor"]);' },
        { name: 'uniqueBy за властивістю — перший перемагає', code: 'const r = uniqueBy([{ id: 1, v: "a" }, { id: 1, v: "b" }, { id: 2, v: "c" }], "id");\nexpect(r).toEqual([{ id: 1, v: "a" }, { id: 2, v: "c" }]);' },
        { name: 'uniqueBy за функцією', code: 'expect(uniqueBy(["A", "a", "b", "B", "c"], (s) => s.toLowerCase())).toEqual(["A", "b", "c"]);' },
        { name: 'порожній масив і не мутує вхід', code: 'expect(unique([])).toEqual([]);\nexpect(uniqueBy([], "id")).toEqual([]);\nconst src = [1, 1, 2];\nunique(src);\nexpect(src).toEqual([1, 1, 2]);' },
        { name: 'великий вхід (O(n))', code: 'const big = Array.from({ length: 100000 }, (_, i) => i);\nexpect(unique(big)).toHaveLength(100000);\nexpect(uniqueBy(big, (x) => x % 10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);' }
      ],
      explanation: `
O(n): кожен елемент — одна перевірка й один запис у словник.

**Чому не \`arr.filter((x, i) => arr.indexOf(x) === i)\`:** O(n²) і губить \`NaN\` (\`indexOf(NaN) === -1\`).

**Обмеження об'єкта-словника:** об'єкти як ключі не розрізнити (усі стануть \`'[object Object]'\`). У темі ES6+ це вирішує \`Set\`: \`[...new Set(arr)]\`.

**Що спитають далі:** як лишити **останній** елемент з кожним ключем? як прибрати дублікати об'єктів за вмістом?
`
    },
    {
      id: 'arr-find-duplicates',
      group: 'lookup',
      type: 'code',
      level: 2,
      title: 'Дублікати email при імпорті контактів',
      tags: ['arrays', 'dictionary', 'complexity'],
      description: `
**Завдання.** Напишіть \`findDuplicates(arr)\` — значення, що трапляються **більше одного разу**, кожне один раз, у порядку **першої появи**. Складність O(n).

**Де трапляється:** імпорт контактів з CSV — підсвітити email, що повторюються; перевірка унікальності артикулів перед збереженням. На співбесідах — базовий патерн «підрахунок частот».

**Що написати**
- \`findDuplicates(arr)\` → масив повторюваних значень (рядки/числа; \`1\` і \`'1'\` — різні; \`NaN\` — звичайне значення)

**Приклад**
\`\`\`js
findDuplicates(['a@x.com', 'b@x.com', 'a@x.com', 'c@x.com', 'b@x.com']); // ['a@x.com', 'b@x.com']
findDuplicates([1, 2, 3, 2, 1, 4, 1]); // [1, 2]
findDuplicates(['a', 'b']);            // []
\`\`\`

**Як це працює:** два проходи. Перший рахує частоти в об'єкті \`counts\` (ключ із типом, як у \`unique\`). Другий іде по вхідному масиву ще раз — це зберігає порядок першої появи — і забирає значення з \`count > 1\`, позначаючи вже додані.

**Врахуйте:**
- кожен дублікат — один раз у результаті;
- 100 000 елементів — миттєво (не \`indexOf\` у циклі).
`,
      starter: `function findDuplicates(arr) {
  const keyOf = (value) => typeof value + ':' + value;

  // 1. TODO: перший прохід — counts[keyOf(value)] = кількість
  const counts = {};

  // 2. TODO: другий прохід по arr — якщо count > 1 і ще не додано → push
  const result = [];
  return result;
}

// Спробуйте в консолі: findDuplicates([1, 2, 1, 3, 2])
`,
      solution: `function findDuplicates(arr) {
  const keyOf = (value) => typeof value + ':' + value;

  const counts = {};
  for (const value of arr) {
    const key = keyOf(value);
    counts[key] = (counts[key] || 0) + 1; // ключі з префіксом — без колізій з вбудованими
  }

  const added = {};
  const result = [];
  for (const value of arr) {
    const key = keyOf(value);
    if (counts[key] > 1 && !added[key]) {
      added[key] = true;
      result.push(value);
    }
  }
  return result;
}
`,
      hints: [
        'Перший прохід: `counts[key] = (counts[key] || 0) + 1`, де `key = typeof value + \':\' + value`.',
        'Другий прохід по `arr` (а не по `counts`!) зберігає порядок першої появи; ще один об\'єкт `added` не дає додати значення двічі.'
      ],
      tests: [
        'expect(findDuplicates([1, 2, 3, 2, 1, 4, 1])).toEqual([1, 2])',
        { name: 'email', code: 'expect(findDuplicates(["a@x.com", "b@x.com", "a@x.com", "c@x.com", "b@x.com"])).toEqual(["a@x.com", "b@x.com"]);' },
        { name: 'немає дублікатів', code: 'expect(findDuplicates(["a", "b"])).toEqual([]);\nexpect(findDuplicates([])).toEqual([]);' },
        { name: 'типи не змішуються', code: 'expect(findDuplicates([1, "1", 2])).toEqual([]);' },
        { name: 'NaN', code: 'const r = findDuplicates([NaN, 1, NaN]);\nexpect(r).toHaveLength(1);\nexpect(r[0]).toBeNaN();' },
        { name: 'порядок першої появи (числові значення не пересортовуються)', code: 'expect(findDuplicates([30, 5, 30, 5])).toEqual([30, 5]);' },
        { name: 'O(n) на 100 000 елементів', code: 'const big = Array.from({ length: 100000 }, (_, i) => i);\nbig.push(5, 99999);\nexpect(findDuplicates(big)).toEqual([5, 99999]);' }
      ],
      explanation: `
O(n) часу, O(k) пам'яті (k — різних значень).

**Чому другий прохід по масиву, а не по \`counts\`:** у об'єкта цілочисельні ключі йдуть першими за зростанням — порядок появи зламався б (тут ключі з префіксом, але звичка корисна).

**Що спитають далі:** повернути також кількість повторів? знайти перший повторюваний елемент за один прохід?
`
    },
    {
      id: 'arr-group-by',
      group: 'lookup',
      type: 'code',
      level: 2,
      interview: true,
      title: 'groupBy: колонки канбан-дошки',
      tags: ['arrays', 'groupBy', 'utils'],
      description: `
**Завдання.** Реалізуйте \`groupBy\` і \`countBy\` (без \`Object.groupBy\`).

**Де трапляється:** задачі розкладають по колонках канбану за статусом, користувачів — за роллю; лічильники над колонками.

**Що написати**
- \`groupBy(arr, iteratee)\` → \`{ [key]: елементи[] }\`
- \`countBy(arr, iteratee)\` → \`{ [key]: кількість }\`
- \`iteratee\` — назва поля або функція \`item => key\`

**Приклад**
\`\`\`js
const tasks = [{ t: 'a', status: 'todo' }, { t: 'b', status: 'done' }, { t: 'c', status: 'todo' }];
groupBy(tasks, 'status');            // { todo: [a, c], done: [b] }
groupBy([1.1, 1.9, 2.5], Math.floor); // { 1: [1.1, 1.9], 2: [2.5] }
countBy(['a', 'b', 'a'], (x) => x);  // { a: 2, b: 1 }
\`\`\`

**Як це працює:** один прохід; для кожного елемента рахуємо ключ і додаємо в масив групи, створюючи його за потреби. Існування групи — через \`Object.hasOwn(result, key)\`: у \`{}\` уже «є» \`constructor\` і \`toString\`, тож \`result[key] || []\` для такого ключа зламається.

**Врахуйте:**
- порядок елементів у групах — як у вході;
- ключі приводяться до рядків (\`true\` → \`'true'\`);
- порожній масив → \`{}\`.
`,
      starter: `function toKeyFn(iteratee) {
  // TODO: функцію повернути як є, рядок → (item) => item[iteratee]
}

function groupBy(arr, iteratee) {
  const getKey = toKeyFn(iteratee);
  const result = {};
  // TODO: для кожного item: якщо !Object.hasOwn(result, key) → result[key] = []; потім push
  return result;
}

function countBy(arr, iteratee) {
  // TODO: як groupBy, але лічильник замість масиву
}

// Спробуйте в консолі: groupBy([1.1, 1.9, 2.5], Math.floor)
`,
      solution: `function toKeyFn(iteratee) {
  return typeof iteratee === 'function' ? iteratee : (item) => item[iteratee];
}

function groupBy(arr, iteratee) {
  const getKey = toKeyFn(iteratee);
  const result = {};
  for (const item of arr) {
    const key = getKey(item);
    // Object.hasOwn, а не result[key]: інакше 'constructor' «знайдеться» серед вбудованих
    if (!Object.hasOwn(result, key)) result[key] = [];
    result[key].push(item);
  }
  return result;
}

function countBy(arr, iteratee) {
  const getKey = toKeyFn(iteratee);
  const result = {};
  for (const item of arr) {
    const key = getKey(item);
    result[key] = (Object.hasOwn(result, key) ? result[key] : 0) + 1;
  }
  return result;
}
`,
      hints: [
        'Нормалізуйте `iteratee`: рядок → `item => item[iteratee]`.',
        'Перевіряйте існування групи через `Object.hasOwn(result, key)`, а не `result[key] || []`.'
      ],
      tests: [
        { name: 'groupBy за функцією', code: 'expect(groupBy([1.1, 1.9, 2.5], Math.floor)).toEqual({ 1: [1.1, 1.9], 2: [2.5] });' },
        { name: 'groupBy за властивістю, порядок збережено', code: 'const users = [{ n: "a", role: "admin" }, { n: "b", role: "user" }, { n: "c", role: "admin" }];\nconst r = groupBy(users, "role");\nexpect(r.admin.map((u) => u.n)).toEqual(["a", "c"]);\nexpect(r.user.map((u) => u.n)).toEqual(["b"]);' },
        { name: 'countBy', code: 'expect(countBy(["a", "b", "a", "c", "a"], (x) => x)).toEqual({ a: 3, b: 1, c: 1 });\nexpect(countBy([{ t: "x" }, { t: "y" }, { t: "x" }], "t")).toEqual({ x: 2, y: 1 });' },
        { name: 'порожній масив', code: 'expect(groupBy([], (x) => x)).toEqual({});\nexpect(countBy([], (x) => x)).toEqual({});' },
        { name: 'ключі "constructor" і "toString"', code: 'expect(groupBy(["constructor", "toString", "constructor"], (x) => x)).toEqual({ constructor: ["constructor", "constructor"], toString: ["toString"] });\nexpect(countBy(["constructor", "valueOf"], (x) => x)).toEqual({ constructor: 1, valueOf: 1 });' },
        { name: 'boolean-ключі стають рядками', code: 'expect(groupBy([1, 2, 3], (n) => n > 1)).toEqual({ false: [1], true: [2, 3] });' }
      ],
      explanation: `
Один прохід — O(n).

**Вбудована альтернатива:** \`Object.groupBy(tasks, (t) => t.status)\` (ES2024) — повертає об'єкт без вбудованих методів, тож проблеми з \`'constructor'\` там немає.

**Типова помилка:** \`reduce\` зі spread (\`{ ...acc, [k]: [...(acc[k] || []), x] }\`) — O(n²).

**Що спитають далі:** як згрупувати за кількома полями (\`'role|team'\`)?
`
    },
    {
      id: 'arr-set-ops',
      group: 'lookup',
      type: 'code',
      level: 2,
      title: 'intersection, difference, union: що змінилось у виборі',
      tags: ['arrays', 'dictionary', 'complexity'],
      description: `
**Завдання.** Реалізуйте операції над масивами як над множинами за **O(n + m)**.

**Де трапляється:** користувач змінив вибрані фільтри/товари — треба знати, які id додали (\`difference(next, prev)\`), прибрали (\`difference(prev, next)\`), лишились (\`intersection\`). Тести — по 100 000 id.

**Що написати**
- \`intersection(a, b)\` → елементи \`a\`, що є в \`b\`
- \`difference(a, b)\` → елементи \`a\`, яких немає в \`b\`
- \`union(a, b)\` → усі елементи обох масивів
- результат **без дублікатів**, у порядку першої появи (спершу \`a\`, потім \`b\`)

**Приклад**
\`\`\`js
intersection([1, 2, 2, 3], [2, 3, 4]); // [2, 3]
difference([1, 2, 3], [2]);           // [1, 3]
union([1, 2], [2, 3]);                // [1, 2, 3]
\`\`\`

**Як це працює:** \`b.includes(x)\` усередині \`filter\` — O(n·m): на 10⁵ × 10⁵ це 10¹⁰ операцій. Будуємо зі \`b\` словник \`{ [key]: true }\` один раз (O(m)), далі кожна перевірка — O(1). Ключ із типом (\`'number:1'\`), як у \`unique\`.

**Врахуйте:**
- дублікати в \`a\` не мають потрапити в результат двічі;
- вхідні масиви не мутуються.
`,
      starter: `const keyOf = (value) => typeof value + ':' + value;

function toLookup(arr) {
  // TODO: { [keyOf(x)]: true } для кожного x
}

function intersection(a, b) {
  // TODO: inB = toLookup(b); пройти a, лишити x з inB[keyOf(x)], без повторів
}

function difference(a, b) {
  // TODO
}

function union(a, b) {
  // TODO: пройти a, потім b, додаючи лише ще не бачені
}

// Спробуйте в консолі: intersection([1, 2, 3], [2, 3, 4])
`,
      solution: `const keyOf = (value) => typeof value + ':' + value;

function toLookup(arr) {
  const lookup = {};
  for (const x of arr) lookup[keyOf(x)] = true;
  return lookup;
}

// спільний хелпер: лишає унікальні елементи списку, що проходять перевірку
function uniqueWhere(list, test) {
  const seen = {};
  const result = [];
  for (const x of list) {
    const key = keyOf(x);
    if (!seen[key] && test(key)) {
      seen[key] = true;
      result.push(x);
    }
  }
  return result;
}

function intersection(a, b) {
  const inB = toLookup(b);
  return uniqueWhere(a, (key) => inB[key] === true);
}

function difference(a, b) {
  const inB = toLookup(b);
  return uniqueWhere(a, (key) => inB[key] !== true);
}

function union(a, b) {
  return uniqueWhere([...a, ...b], () => true);
}
`,
      hints: [
        'Перетворіть `b` на словник один раз: `lookup[keyOf(x)] = true` — перевірка O(1).',
        'Щоб уникнути дублікатів у результаті, ведіть ще один словник `seen`.',
        'Усі три операції — «пройти список і лишити унікальні, що проходять умову»: винесіть це в хелпер.'
      ],
      tests: [
        { name: 'intersection', code: 'expect(intersection([1, 2, 2, 3], [2, 3, 4])).toEqual([2, 3]);\nexpect(intersection([1, 2], [3])).toEqual([]);' },
        { name: 'difference', code: 'expect(difference([1, 2, 3, 1], [2])).toEqual([1, 3]);\nexpect(difference([1], [])).toEqual([1]);' },
        { name: 'union без дублікатів, порядок першої появи', code: 'expect(union([1, 2, 1], [2, 3, 3])).toEqual([1, 2, 3]);\nexpect(union([], [])).toEqual([]);' },
        { name: 'рядкові id і числа не змішуються', code: 'expect(intersection(["1", "2"], [1, "2"])).toEqual(["2"]);' },
        { name: 'не мутує вхідні масиви', code: 'const a = [1, 2], b = [2, 3];\nintersection(a, b); difference(a, b); union(a, b);\nexpect(a).toEqual([1, 2]);\nexpect(b).toEqual([2, 3]);' },
        { name: 'великі масиви — O(n + m)', code: 'const a = Array.from({ length: 100000 }, (_, i) => i);\nconst b = Array.from({ length: 100000 }, (_, i) => i + 100000);\nexpect(intersection(a, b)).toEqual([]);\nexpect(difference(a, b)).toHaveLength(100000);\nexpect(union(a, b)).toHaveLength(200000);' }
      ],
      explanation: `
Побудова словника O(m) + прохід O(n) = O(n + m) замість O(n · m).

**Об'єкти за полем:** будуйте словник з ключів: \`const ids = toLookup(b.map((x) => x.id)); a.filter((x) => ids[keyOf(x.id)])\`.

**Далі:** у темі ES6+ те саме робить \`Set\` (\`new Set(b).has(x)\`), а ES2025 додає \`set.intersection(other)\`.

**Типова помилка:** \`includes\` у циклі — найчастіша причина повільного коду на великих списках.
`
    },
    {
      id: 'arr-theory-performance',
      group: 'lookup',
      type: 'theory',
      level: 3,
      title: 'Продуктивність роботи з масивами',
      tags: ['arrays', 'performance', 'complexity'],
      question: 'Яка складність основних операцій з масивами? Які типові помилки продуктивності трапляються у фронтенд-коді? Оберіть **усі** правильні твердження.',
      choices: [
        '`push`/`pop` — O(1) амортизовано, а `shift`/`unshift` — O(n), бо зсувають усі елементи',
        '`ids.includes()` усередині `filter` дає O(n·m); словник з `ids`, побудований один раз, зводить це до O(n + m)',
        '`reduce` зі spread акумулятора `({ ...acc, [k]: v })` лінійний, бо spread копіює лише посилання',
        'Головний виграш дає заміна `forEach` на `for`; асимптотика у фронтенді майже не важлива',
        '`shift` — найкращий вибір для черги в BFS, бо видаляє елемент з початку за O(1)'
      ],
      correct: [0, 1],
      why: [
        'Правильно: видалення/вставка на початку перенумеровує всі індекси.',
        'Правильно: пошук у словнику O(1) замість O(m) на кожен елемент.',
        'Хибно: spread копіює всі ключі акумулятора на кожному кроці → O(n²).',
        'Хибно: асимптотика й кількість алокацій важать набагато більше за `for` vs `forEach`.',
        'Хибно: `shift` — O(n); для черги — індекс-вказівник.'
      ],
      answer: `
| Операція | Складність |
|---|---|
| \`arr[i]\`, \`length\`, \`at\`, \`push\`, \`pop\` | O(1) |
| \`shift\`, \`unshift\`, \`splice\` на початку | O(n) |
| \`indexOf\`, \`includes\`, \`find\`, \`some\` | O(n) |
| \`map\`, \`filter\`, \`slice\`, spread | O(n) + нова пам'ять |
| \`sort\` | O(n log n) |

**Типові помилки:**
1. **Пошук у циклі — O(n·m):**
\`\`\`js
items.filter((item) => ids.includes(item.id)); // O(n·m)
const byId = {};
for (const id of ids) byId[id] = true;
items.filter((item) => byId[item.id]);         // O(n + m)
\`\`\`
2. **Spread в акумуляторі** \`reduce\` — O(n²). Мутуйте локальний акумулятор.
3. **\`shift\` як черга** — O(n²) на великих даних.
4. **Повторне обчислення** відфільтрованих списків на кожен рендер → \`useMemo\`.
5. **Дірки й змішані типи** сповільнюють масив у V8.

**Мікрооптимізації** (\`for\` vs \`forEach\`) зазвичай неважливі — вимірюйте профайлером. Великі списки в UI — віртуалізація.
`,
      keyPoints: [
        'push/pop O(1), shift/unshift O(n)',
        'includes/find у циклі = O(n·m) → словник для пошуку',
        'Spread в акумуляторі reduce — O(n²)',
        'Асимптотика й алокації важливіші за for vs forEach'
      ],
      followUps: ['Як реалізувати чергу з O(1) dequeue?', 'Що таке віртуалізація списку?']
    }
  ]
});
