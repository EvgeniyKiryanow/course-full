FE.topic('js-start', {
  intro: `
**Перші кроки** — мінімум синтаксису, з яким можна писати справжні програми.

| Що | Як |
|---|---|
| Змінна | \`const name = 'Ann';\` (не змінюється), \`let count = 0;\` (змінюється) |
| Функція | \`function sum(a, b) { return a + b; }\` |
| Умова | \`if (x > 0) { … } else if (x < 0) { … } else { … }\` |
| Цикл | \`for (let i = 0; i < n; i++) { … }\`, \`for (const item of arr) { … }\` |
| Масив | \`const arr = [1, 2, 3]; arr.length; arr[0]; arr.push(4);\` |
| Об'єкт | \`const user = { name: 'Ann' }; user.name; user['name'];\` |
| Клас | \`class Counter { constructor() { this.count = 0; } inc() { this.count++; } }\` |

- \`===\` — порівняння без сюрпризів; \`%\` — остача від ділення (\`7 % 2\` → 1).
- Функція без \`return\` повертає \`undefined\`.
- Шаблонний рядок: \`\` \`Привіт, \${name}!\` \`\`.
`,
  groups: [
    { id: 'values', title: 'Змінні і функції' },
    { id: 'conditions', title: 'Умови' },
    { id: 'loops', title: 'Цикли' },
    { id: 'arrays', title: 'Масиви' },
    { id: 'objects', title: 'Об\'єкти' },
    { id: 'classes', title: 'Перші класи' }
  ],
  items: [
    // ================================================================ 1. Змінні і функції
    {
      id: 'start-quiz-let-const', group: 'values', type: 'quiz', level: 1, interview: false,
      title: 'let, const і виклик функції',
      question: `
**Розбір прикладу.** Прочитайте код і передбачте вивід. Потім запустіть його в консолі праворуч.

\`\`\`js
const price = 100;
let total = price;
total = total + 50;

function withTax(sum) {
  return sum * 1.2;
}

console.log(total, withTax(total));
\`\`\`
`,
      options: ['`150 180`', '`100 120`', '`150 undefined`', '`TypeError`'],
      answer: 0,
      why: [
        'Так: total став 150, а функція повернула 150 * 1.2 = 180.',
        'Ні: total перепризначили (let це дозволяє), він уже 150.',
        'Ні: функція має return, тож повертає число, а не undefined.',
        'Ні: перепризначаємо let, а не const — помилки немає.'
      ],
      hint: 'let можна перепризначати. А що повертає функція з return?',
      explanation: '`const` — значення не перепризначити, `let` — можна. Функція отримує аргумент у параметр `sum` і повертає результат через `return`.'
    },
    {
      id: 'start-greet', group: 'values', type: 'code', level: 1,
      title: 'Привітання: функція з параметром',
      description: `
**Завдання.** Напишіть функцію \`greet(name)\`, яка повертає рядок \`Привіт, <name>!\`.

**Де трапляється:** будь-який текст в інтерфейсі, зібраний з даних: «Вітаємо, Олено!», «3 товари в кошику».

**Приклад**
\`\`\`js
greet('Ann');  // 'Привіт, Ann!'
greet('Ігор'); // 'Привіт, Ігор!'
\`\`\`

**Як це працює:** шаблонний рядок у зворотних лапках підставляє значення виразу на місце \`\${...}\`.
`,
      starter: `function greet(name) {
  // Каркас уже майже готовий: допишіть рядок у зворотних лапках
  return \`Привіт, ...\`;
}

// Спробуйте в консолі: greet('Ann')
`,
      solution: `function greet(name) {
  return \`Привіт, \${name}!\`;
}
`,
      hints: ['Підставте параметр: `${name}` всередині зворотних лапок.', 'Не забудьте знак оклику в кінці.'],
      tests: [
        "expect(greet('Ann')).toBe('Привіт, Ann!')",
        "expect(greet('Ігор')).toBe('Привіт, Ігор!')",
        { name: 'повертає рядок, а не виводить його', code: "expect(typeof greet('X')).toBe('string');" }
      ],
      explanation: 'Функція **повертає** значення (`return`), а не друкує його. Різниця важлива: результат можна передати далі, зберегти, перевірити тестом.'
    },
    {
      id: 'start-celsius', group: 'values', type: 'code', level: 1,
      title: 'Цельсій → Фаренгейт',
      description: `
**Завдання.** Напишіть \`toFahrenheit(celsius)\`: переводить градуси Цельсія у Фаренгейта за формулою \`F = C × 9/5 + 32\`.

**Де трапляється:** перетворення одиниць у віджетах погоди, калькуляторах, форматерах.

**Приклад**
\`\`\`js
toFahrenheit(0);   // 32
toFahrenheit(100); // 212
toFahrenheit(-40); // -40
\`\`\`

**Як це працює:** функція отримує значення через параметр, обчислює вираз і віддає результат через \`return\` (без \`return\` виклик дає \`undefined\`). Множення й ділення виконуються раніше за додавання, тож дужки потрібні лише там, де порядок інший.
`,
      starter: `function toFahrenheit(celsius) {
  // TODO: поверніть результат формули
}
`,
      solution: `function toFahrenheit(celsius) {
  return celsius * 9 / 5 + 32;
}
`,
      hints: ['Множення й ділення виконуються раніше за додавання — дужки не потрібні.', '`return celsius * 9 / 5 + 32;`'],
      tests: ['expect(toFahrenheit(0)).toBe(32)', 'expect(toFahrenheit(100)).toBe(212)', 'expect(toFahrenheit(-40)).toBe(-40)', 'expect(toFahrenheit(37)).toBeCloseTo(98.6)'],
      explanation: 'Пріоритет операторів як у математиці: `*` і `/` раніше за `+`. Для дробових результатів у тестах використовують порівняння з похибкою (`toBeCloseTo`).'
    },
    // ================================================================ 2. Умови
    {
      id: 'start-quiz-if', group: 'conditions', type: 'quiz', level: 1,
      title: 'Яка гілка виконається?',
      question: `
**Розбір прикладу.** Що виведе код?

\`\`\`js
function label(n) {
  if (n > 10) {
    return 'велике';
  } else if (n > 5) {
    return 'середнє';
  } else {
    return 'мале';
  }
}

console.log(label(12), label(7), label(5));
\`\`\`
`,
      options: ['`велике середнє середнє`', '`велике середнє мале`', '`велике велике мале`', '`мале середнє велике`'],
      answer: 1,
      why: [
        'Ні: 5 > 5 — false (строга нерівність), тож 5 потрапляє в else.',
        'Так: перевірки йдуть згори вниз, спрацьовує перша істинна.',
        'Ні: 7 > 10 — false, тому 7 не «велике».',
        'Ні: гілки перевіряються по черзі, а не навпаки.'
      ],
      hint: 'Умови перевіряються по черзі. Чи 5 > 5?',
      explanation: '`if / else if / else` перевіряє умови зверху вниз і виконує **першу** істинну гілку. `>` — строга нерівність: `5 > 5` дає false.'
    },
    {
      id: 'start-is-even', group: 'conditions', type: 'code', level: 1,
      title: 'Парне чи непарне',
      description: `
**Завдання.** Напишіть \`isEven(n)\`: \`true\`, якщо ціле число парне, інакше \`false\`.

**Де трапляється:** «зебра» в таблицях, чергування елементів, валідація.

**Приклад**
\`\`\`js
isEven(4);  // true
isEven(7);  // false
isEven(-2); // true
\`\`\`

**Як це працює:** оператор \`%\` дає остачу від ділення: \`7 % 2\` → 1, \`4 % 2\` → 0.
`,
      starter: `function isEven(n) {
  // TODO: остача від ділення на 2 дорівнює 0?
}
`,
      solution: `function isEven(n) {
  return n % 2 === 0;
}
`,
      hints: ['Порівняння саме по собі вже є boolean — `if` не потрібен.', '`return n % 2 === 0;`'],
      tests: ['expect(isEven(4)).toBe(true)', 'expect(isEven(7)).toBe(false)', 'expect(isEven(0)).toBe(true)', 'expect(isEven(-3)).toBe(false)'],
      explanation: 'Вираз `n % 2 === 0` уже дає `true`/`false`, тому писати `if (...) return true; else return false;` зайве. Для від\'ємних непарних `-3 % 2` дає `-1`, тож перевірка на `=== 1` була б помилкою — порівнюйте з нулем.'
    },
    {
      id: 'start-grade', group: 'conditions', type: 'code', level: 1,
      title: 'Оцінка за балами',
      description: `
**Завдання.** Напишіть \`grade(score)\`, що перетворює бали (0–100) на оцінку:

| Бали | Оцінка |
|---|---|
| 90 і більше | \`'A'\` |
| 75–89 | \`'B'\` |
| 60–74 | \`'C'\` |
| менше 60 | \`'F'\` |

**Де трапляється:** статуси за порогами — рівень пароля, рейтинг, знижка за сумою.

**Як це працює:** \`if / else if / else\` перевіряються згори донизу, і виконується лише перша гілка з істинною умовою. Тому межі зручно перевіряти від найбільшої до найменшої — тоді в кожній гілці досить однієї умови.

**Врахуйте:** межі (90, 75, 60) належать вищій оцінці.
`,
      starter: `function grade(score) {
  // 1. Перевіряйте від найвищого порогу до найнижчого
  // 2. Перша істинна умова повертає оцінку
  // TODO
}
`,
      solution: `function grade(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  return 'F';
}
`,
      hints: ['Ідіть від найбільшого порогу: тоді кожна наступна умова може бути простою.', 'Використовуйте `>=`, щоб межа належала вищій оцінці.'],
      tests: ["expect(grade(95)).toBe('A')", "expect(grade(90)).toBe('A')", "expect(grade(89)).toBe('B')", "expect(grade(60)).toBe('C')", "expect(grade(59)).toBe('F')"],
      explanation: 'Ранні `return` роблять код плоским: кожна наступна перевірка вже знає, що попередні не спрацювали. Тестуйте **межі** — саме там найчастіше помиляються (`>` замість `>=`).'
    },
    {
      id: 'start-fizzbuzz', group: 'conditions', type: 'code', level: 1, interview: true,
      title: 'FizzBuzz для одного числа',
      description: `
**Завдання.** Напишіть \`fizzBuzz(n)\`:
- кратне і 3, і 5 → \`'FizzBuzz'\`;
- кратне 3 → \`'Fizz'\`;
- кратне 5 → \`'Buzz'\`;
- інакше → число як рядок (\`String(n)\`).

**Де трапляється:** найвідоміша перевірка «чи вміє людина писати умови» на співбесідах.

**Приклад**
\`\`\`js
fizzBuzz(15); // 'FizzBuzz'
fizzBuzz(9);  // 'Fizz'
fizzBuzz(7);  // '7'
\`\`\`

**Як це працює:** оператор \`%\` дає остачу від ділення: \`n % 3 === 0\` означає «ділиться на 3». Перевірку «і на 3, і на 5» ставлять першою, бо ланцюжок \`if…else\` зупиняється на першій істинній умові.
`,
      starter: `function fizzBuzz(n) {
  // TODO
}
`,
      solution: `function fizzBuzz(n) {
  if (n % 15 === 0) return 'FizzBuzz';
  if (n % 3 === 0) return 'Fizz';
  if (n % 5 === 0) return 'Buzz';
  return String(n);
}
`,
      hints: ['Порядок перевірок важливий: яка умова має йти першою?', 'Кратне і 3, і 5 — це кратне 15. Перевірте його першим.'],
      tests: ["expect(fizzBuzz(15)).toBe('FizzBuzz')", "expect(fizzBuzz(30)).toBe('FizzBuzz')", "expect(fizzBuzz(9)).toBe('Fizz')", "expect(fizzBuzz(10)).toBe('Buzz')", "expect(fizzBuzz(7)).toBe('7')"],
      explanation: 'Типова помилка — перевірити `% 3` першим: тоді 15 поверне `Fizz`. Найконкретніша умова має стояти першою.'
    },
    // ================================================================ 3. Цикли
    {
      id: 'start-quiz-loop', group: 'loops', type: 'quiz', level: 1,
      title: 'Скільки разів виконається цикл?',
      question: `
**Розбір прикладу.** Що виведе код?

\`\`\`js
let sum = 0;
for (let i = 1; i <= 4; i++) {
  sum = sum + i;
}
console.log(sum);
\`\`\`
`,
      options: ['`6`', '`10`', '`4`', '`15`'],
      answer: 1,
      why: [
        'Ні: це сума 1 + 2 + 3 — але умова `i <= 4` включає і 4.',
        'Так: 1 + 2 + 3 + 4 = 10.',
        'Ні: 4 — кількість ітерацій, а виводимо суму.',
        'Ні: це сума до 5, а цикл зупиняється після 4.'
      ],
      hint: 'Випишіть значення i на кожній ітерації: з якого починається, на якому зупиняється?',
      explanation: '`for (початок; умова; крок)`: i = 1, 2, 3, 4; при i = 5 умова `i <= 4` хибна — цикл завершується. Сума 1 + 2 + 3 + 4 = 10.'
    },
    {
      id: 'start-sum-to', group: 'loops', type: 'code', level: 1,
      title: 'Сума чисел від 1 до n',
      description: `
**Завдання.** Напишіть \`sumTo(n)\` — сума всіх цілих від 1 до n включно. Для \`n <= 0\` — 0.

**Де трапляється:** будь-який підсумок у циклі: загальна сума замовлень, бали за пройдені рівні. На співбесідах для початківців після циклу часто просять формулу \`n * (n + 1) / 2\` без циклу.

**Приклад**
\`\`\`js
sumTo(4);   // 10
sumTo(100); // 5050
sumTo(0);   // 0
\`\`\`

**Як це працює:** цикл \`for (let i = 1; i <= n; i++)\` повторює тіло, поки умова істинна. Змінну-накопичувач оголошують до циклу зі значенням 0 і на кожному кроці додають до неї \`i\`.
`,
      starter: `function sumTo(n) {
  let sum = 0;
  // TODO: цикл від 1 до n включно, додаючи i до sum
  return sum;
}
`,
      solution: `function sumTo(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}
`,
      hints: ['`for (let i = 1; i <= n; i++) { ... }`', '`sum += i` — те саме, що `sum = sum + i`.'],
      tests: ['expect(sumTo(4)).toBe(10)', 'expect(sumTo(100)).toBe(5050)', 'expect(sumTo(1)).toBe(1)', 'expect(sumTo(0)).toBe(0)'],
      explanation: 'Цикл — O(n). Є і формула Гаусса `n * (n + 1) / 2` — O(1). На співбесіді гарно спершу написати цикл, а потім згадати формулу.'
    },
    {
      id: 'start-count-char', group: 'loops', type: 'code', level: 1,
      title: 'Скільки разів трапляється символ',
      description: `
**Завдання.** Напишіть \`countChar(text, ch)\` — скільки разів символ \`ch\` трапляється в рядку \`text\` (з урахуванням регістру).

**Де трапляється:** лічильники символів у полях вводу, прості аналізатори тексту.

**Приклад**
\`\`\`js
countChar('banana', 'a'); // 3
countChar('Hello', 'l');  // 2
countChar('Hello', 'h');  // 0 — регістр важливий
\`\`\`

**Як це працює:** рядок можна перебирати циклом \`for...of\` — по одному символу.
`,
      starter: `function countChar(text, ch) {
  let count = 0;
  for (const c of text) {
    // TODO: якщо c дорівнює ch — збільшити count
  }
  return count;
}
`,
      solution: `function countChar(text, ch) {
  let count = 0;
  for (const c of text) {
    if (c === ch) count++;
  }
  return count;
}
`,
      hints: ['Порівнюйте строго: `c === ch`.', '`count++` збільшує лічильник на 1.'],
      tests: ["expect(countChar('banana', 'a')).toBe(3)", "expect(countChar('Hello', 'l')).toBe(2)", "expect(countChar('Hello', 'h')).toBe(0)", "expect(countChar('', 'a')).toBe(0)"],
      explanation: 'Патерн «лічильник»: змінна до циклу, збільшення за умовою, повернення після циклу. Він знадобиться в десятках задач.'
    },
    {
      id: 'start-factorial', group: 'loops', type: 'code', level: 1,
      title: 'Факторіал',
      description: `
**Завдання.** Напишіть \`factorial(n)\` — добуток усіх цілих від 1 до n. \`factorial(0)\` = 1.

**Де трапляється:** кількість способів упорядкувати елементи (перестановки, комбінаторика); класична перша задача на цикл, а пізніше — на рекурсію.

**Приклад**
\`\`\`js
factorial(5); // 120  (1·2·3·4·5)
factorial(0); // 1
\`\`\`

**Як це працює:** той самий накопичувач, що й для суми, але для добутку він стартує з 1 — нейтрального елемента множення. Почати з 0 — і результат завжди буде 0.
`,
      starter: `function factorial(n) {
  // TODO: з чого почати добуток, щоб для n = 0 вийшла 1?
}
`,
      solution: `function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
`,
      hints: ['Для добутку початкове значення — 1 (для суми було 0).', 'Множте в циклі: `result *= i`.'],
      tests: ['expect(factorial(5)).toBe(120)', 'expect(factorial(1)).toBe(1)', 'expect(factorial(0)).toBe(1)', 'expect(factorial(10)).toBe(3628800)'],
      explanation: 'Нейтральний елемент: для суми — 0, для добутку — 1. Помилка «почати з 0» дає завжди 0. Факторіал росте дуже швидко: уже `factorial(21)` перевищує `Number.MAX_SAFE_INTEGER` — для великих n потрібен BigInt.'
    },
    // ================================================================ 4. Масиви
    {
      id: 'start-quiz-array', group: 'arrays', type: 'quiz', level: 1,
      title: 'Індекси і довжина масиву',
      question: `
**Розбір прикладу.** Що виведе код?

\`\`\`js
const colors = ['red', 'green', 'blue'];
colors.push('black');
console.log(colors.length, colors[0], colors[colors.length]);
\`\`\`
`,
      options: ['`3 red blue`', '`4 green black`', '`4 red undefined`', '`4 red black`'],
      answer: 2,
      why: [
        'Ні: push додав четвертий елемент — довжина 4.',
        'Ні: індексація з нуля, colors[0] — перший елемент.',
        'Так: останній індекс — length − 1, а colors[4] не існує.',
        'Ні: black має індекс 3, а colors[colors.length] — це colors[4].'
      ],
      hint: 'Індекси починаються з 0. Який індекс в останнього елемента?',
      explanation: 'Індекси від `0` до `length − 1`. Звернення за межі не кидає помилку, а повертає `undefined`. Останній елемент — `arr[arr.length - 1]` або `arr.at(-1)`.'
    },
    {
      id: 'start-sum-array', group: 'arrays', type: 'code', level: 1,
      title: 'Сума елементів масиву',
      description: `
**Завдання.** Напишіть \`sumArray(numbers)\` — сума всіх чисел масиву. Порожній масив → 0.

**Де трапляється:** сума кошика, загальна кількість, підсумок у таблиці.

**Приклад**
\`\`\`js
sumArray([1, 2, 3]); // 6
sumArray([]);        // 0
\`\`\`

**Як це працює:** \`for…of\` по черзі дає кожне значення масиву. Для порожнього масиву тіло циклу не виконається жодного разу — лишиться початкове значення накопичувача.
`,
      starter: `function sumArray(numbers) {
  let total = 0;
  // TODO: for (const n of numbers) { ... }
  return total;
}
`,
      solution: `function sumArray(numbers) {
  let total = 0;
  for (const n of numbers) {
    total += n;
  }
  return total;
}
`,
      hints: ['`for (const n of numbers)` дає кожен елемент по черзі.', 'Додавайте до total: `total += n`.'],
      tests: ['expect(sumArray([1, 2, 3])).toBe(6)', 'expect(sumArray([])).toBe(0)', 'expect(sumArray([-5, 5, 10])).toBe(10)'],
      explanation: '`for...of` перебирає значення масиву. Пізніше ви навчитесь робити те саме через `reduce`, але цикл — найзрозуміліший старт.'
    },
    {
      id: 'start-max-array', group: 'arrays', type: 'code', level: 1,
      title: 'Найбільше число в масиві',
      description: `
**Завдання.** Напишіть \`findMax(numbers)\` **без** \`Math.max\`. Порожній масив → \`undefined\`.

**Де трапляється:** найдорожчий товар у кошику, найвищий бал у таблиці лідерів, найбільша висота рядка перед рендером. На співбесіді перевіряють, чи пам'ятаєте про порожній масив.

**Приклад**
\`\`\`js
findMax([3, 9, 2]);   // 9
findMax([-4, -2, -9]); // -2
findMax([]);          // undefined
\`\`\`

**Як це працює:** кандидата на максимум беруть з першого елемента і порівнюють з рештою. Стартувати з 0 не можна: масив лише з від'ємних чисел дасть хибне 0.

**Врахуйте:** усі числа можуть бути від'ємними — тому початкове значення 0 не підходить.
`,
      starter: `function findMax(numbers) {
  // 1. Порожній масив → undefined
  // 2. Початкове значення — перший елемент
  // 3. Пройти рештою і оновлювати максимум
  // TODO
}
`,
      solution: `function findMax(numbers) {
  if (numbers.length === 0) return undefined;
  let max = numbers[0];
  for (const n of numbers) {
    if (n > max) max = n;
  }
  return max;
}
`,
      hints: ['Почніть з `let max = numbers[0]` — це працює і для від\'ємних.', 'У циклі: `if (n > max) max = n;`'],
      tests: ['expect(findMax([3, 9, 2])).toBe(9)', 'expect(findMax([-4, -2, -9])).toBe(-2)', 'expect(findMax([7])).toBe(7)', 'expect(findMax([])).toBeUndefined()'],
      explanation: 'Класична пастка — `let max = 0`: для масиву з від\'ємних чисел відповідь буде 0. Брати перший елемент масиву як стартове значення — надійно.'
    },
    {
      id: 'start-only-positive', group: 'arrays', type: 'code', level: 1,
      title: 'Відфільтрувати додатні числа',
      description: `
**Завдання.** Напишіть \`onlyPositive(numbers)\` — **новий** масив лише з додатних чисел (> 0). Вхідний масив не змінювати.

**Де трапляється:** фільтри списків: лише активні користувачі, товари в наявності.

**Приклад**
\`\`\`js
onlyPositive([3, -1, 0, 5]); // [3, 5]
\`\`\`

**Як це працює:** новий масив збирають через \`push\` у циклі, не змінюючи вхідний. Функція, яка не змінює свої аргументи, передбачувана: її можна викликати повторно з тими самими даними.
`,
      starter: `function onlyPositive(numbers) {
  const result = [];
  // TODO: додавайте підхожі числа через result.push(n)
  return result;
}
`,
      solution: `function onlyPositive(numbers) {
  const result = [];
  for (const n of numbers) {
    if (n > 0) result.push(n);
  }
  return result;
}
`,
      hints: ['Новий масив створюємо до циклу, а `push` додає в кінець.', '0 — не додатне, умова `n > 0`.'],
      tests: [
        'expect(onlyPositive([3, -1, 0, 5])).toEqual([3, 5])',
        'expect(onlyPositive([-1, -2])).toEqual([])',
        { name: 'не змінює вхідний масив', code: 'const input = [1, -1];\nonlyPositive(input);\nexpect(input).toEqual([1, -1]);' }
      ],
      explanation: '`result` — `const`, але масив усередині змінюється через `push`: `const` забороняє перепризначити змінну, а не змінювати вміст. Пізніше те саме зробить метод масиву `filter` — у модулі про масиви.'
    },
    // ================================================================ 5. Об'єкти
    {
      id: 'start-quiz-object', group: 'objects', type: 'quiz', level: 1,
      title: 'Крапка чи квадратні дужки',
      question: `
**Розбір прикладу.** Що виведе код?

\`\`\`js
const user = { name: 'Ann', age: 30 };
const key = 'age';
console.log(user.key, user[key], user['name']);
\`\`\`
`,
      options: ['`30 30 Ann`', '`undefined 30 Ann`', '`age 30 Ann`', '`undefined undefined Ann`'],
      answer: 1,
      why: [
        'Ні: `user.key` шукає властивість з назвою «key», а її немає.',
        'Так: крапка — буквальна назва, дужки — значення змінної.',
        'Ні: `user.key` не підставляє змінну key.',
        'Ні: `user[key]` підставляє значення змінної — це \'age\'.'
      ],
      hint: 'Чим `user.key` відрізняється від `user[key]`?',
      explanation: '`obj.name` — назва властивості написана буквально. `obj[expr]` — назва береться з виразу (змінної, рядка). Відсутня властивість дає `undefined`.'
    },
    {
      id: 'start-create-user', group: 'objects', type: 'code', level: 1,
      title: 'Створити об\'єкт користувача',
      description: `
**Завдання.** Напишіть \`createUser(name, age)\`, що повертає об'єкт \`{ name, age, isAdult }\`, де \`isAdult\` — \`true\` для віку 18+.

**Де трапляється:** перетворення даних з форми чи API на об'єкт для інтерфейсу.

**Приклад**
\`\`\`js
createUser('Ann', 30); // { name: 'Ann', age: 30, isAdult: true }
createUser('Bob', 15); // { name: 'Bob', age: 15, isAdult: false }
\`\`\`

**Як це працює:** \`{ name }\` — скорочений запис \`{ name: name }\`.
`,
      starter: `function createUser(name, age) {
  return {
    // TODO: name, age і isAdult
  };
}
`,
      solution: `function createUser(name, age) {
  return {
    name,
    age,
    isAdult: age >= 18,
  };
}
`,
      hints: ['`isAdult: age >= 18` — порівняння вже є boolean.', 'Скорочення: `{ name, age }` замість `{ name: name, age: age }`.'],
      tests: [
        "expect(createUser('Ann', 30)).toEqual({ name: 'Ann', age: 30, isAdult: true })",
        "expect(createUser('Bob', 15)).toEqual({ name: 'Bob', age: 15, isAdult: false })",
        { name: '18 — уже дорослий', code: "expect(createUser('Kate', 18).isAdult).toBe(true);" }
      ],
      explanation: 'Функція-«фабрика» повертає новий об\'єкт на кожен виклик. Обчислені поля (`isAdult`) рахуються в момент створення.'
    },
    {
      id: 'start-full-name', group: 'objects', type: 'code', level: 1,
      title: 'Повне ім\'я з необов\'язковим прізвищем',
      description: `
**Завдання.** Напишіть \`fullName(user)\`: \`'Ім'я Прізвище'\`, а якщо прізвища немає (\`lastName\` відсутній або порожній) — лише ім'я.

**Де трапляється:** підпис користувача в шапці сайту, листах і коментарях, коли частину профілю не заповнено.

**Приклад**
\`\`\`js
fullName({ firstName: 'Ann', lastName: 'Lee' }); // 'Ann Lee'
fullName({ firstName: 'Ann' });                  // 'Ann'
fullName({ firstName: 'Ann', lastName: '' });    // 'Ann'
\`\`\`

**Як це працює:** порожній рядок \`''\` і \`undefined\` в умові поводяться як \`false\`, тож \`if (user.lastName)\` відсікає обидва випадки одразу. Шаблонний рядок \`\${a} \${b}\` у зворотних лапках склеює частини з пробілом.

**Врахуйте:** відсутня властивість дає \`undefined\`, порожній рядок — falsy.
`,
      starter: `function fullName(user) {
  // TODO: якщо lastName є — 'firstName lastName', інакше лише firstName
}
`,
      solution: `function fullName(user) {
  if (user.lastName) {
    return user.firstName + ' ' + user.lastName;
  }
  return user.firstName;
}
`,
      hints: ['`if (user.lastName)` — false і для undefined, і для порожнього рядка.', 'Не допустіть зайвого пробілу в кінці.'],
      tests: [
        "expect(fullName({ firstName: 'Ann', lastName: 'Lee' })).toBe('Ann Lee')",
        "expect(fullName({ firstName: 'Ann' })).toBe('Ann')",
        "expect(fullName({ firstName: 'Ann', lastName: '' })).toBe('Ann')"
      ],
      explanation: 'Дані з API часто неповні — перевіряйте наявність поля перед використанням. Інакше отримаєте `\'Ann undefined\'` в інтерфейсі.'
    },
    {
      id: 'start-count-votes', group: 'objects', type: 'code', level: 2,
      title: 'Порахувати голоси (об\'єкт як словник)',
      description: `
**Завдання.** Напишіть \`countVotes(votes)\`: приймає масив рядків і повертає об'єкт «варіант → кількість».

**Де трапляється:** підрахунки й групування: скільки замовлень у кожному статусі, скільки разів натиснули кожну кнопку.

**Приклад**
\`\`\`js
countVotes(['js', 'css', 'js']); // { js: 2, css: 1 }
countVotes([]);                  // {}
\`\`\`

**Як це працює:** \`counts[vote]\` з квадратними дужками звертається до властивості, назва якої — значення змінної.
`,
      starter: `function countVotes(votes) {
  const counts = {};
  for (const vote of votes) {
    // TODO: якщо ключа ще немає — почати з 0, потім додати 1
  }
  return counts;
}
`,
      solution: `function countVotes(votes) {
  const counts = {};
  for (const vote of votes) {
    if (counts[vote] === undefined) counts[vote] = 0;
    counts[vote] += 1;
  }
  return counts;
}
`,
      hints: ['Ключ відсутній → `counts[vote]` дає `undefined`.', 'Коротко: `counts[vote] = (counts[vote] || 0) + 1;`'],
      tests: [
        "expect(countVotes(['js', 'css', 'js'])).toEqual({ js: 2, css: 1 })",
        'expect(countVotes([])).toEqual({})',
        "expect(countVotes(['a', 'a', 'a'])).toEqual({ a: 3 })"
      ],
      explanation: 'Патерн «частотний словник» — один із найчастіших в алгоритмічних задачах (анаграми, дублікати, найчастіший елемент). Один прохід — O(n).'
    },
    // ================================================================ 6. Перші класи
    {
      id: 'start-quiz-class', group: 'classes', type: 'quiz', level: 1,
      title: 'Клас, new і this',
      question: `
**Розбір прикладу.** Що виведе код?

\`\`\`js
class Cat {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return this.name + ': мяу';
  }
}

const a = new Cat('Мурка');
const b = new Cat('Барсик');
console.log(a.speak(), b.speak());
\`\`\`
`,
      options: ['`Мурка: мяу Мурка: мяу`', '`undefined: мяу undefined: мяу`', '`Мурка: мяу Барсик: мяу`', '`TypeError`'],
      answer: 2,
      why: [
        'Ні: кожен new створює окремий об\'єкт зі своїм name.',
        'Ні: конструктор записав name у this — він заданий.',
        'Так: this у методі — об\'єкт, на якому метод викликали.',
        'Ні: класи викликаються з new, тому помилки немає.'
      ],
      hint: 'new створює новий об\'єкт. На який об\'єкт вказує this у speak()?',
      explanation: '`class` — шаблон для об\'єктів. `new Cat(...)` створює **новий** об\'єкт і викликає `constructor`, де `this` — цей об\'єкт. У методі `a.speak()` `this` — це `a`.'
    },
    {
      id: 'start-counter-class', group: 'classes', type: 'code', level: 1,
      title: 'Клас Counter',
      description: `
**Завдання.** Створіть клас \`Counter\`:
- \`new Counter(start = 0)\` — початкове значення;
- \`inc()\` — збільшує на 1 і повертає нове значення;
- \`dec()\` — зменшує на 1 і повертає нове значення;
- \`value()\` — повертає поточне значення.

**Де трапляється:** лічильник товарів у кошику, кліків, кроків форми.

**Приклад**
\`\`\`js
const c = new Counter(5);
c.inc();   // 6
c.dec();   // 5
c.value(); // 5
\`\`\`

**Як це працює:** дані об'єкта зберігаються в \`this.<поле>\`, а методи класу читають і змінюють їх.
`,
      starter: `class Counter {
  constructor(start = 0) {
    // TODO: збережіть start у this.count
  }

  inc() {
    // TODO: збільшити і повернути
  }

  dec() {
    // TODO
  }

  value() {
    // TODO
  }
}

// Спробуйте в консолі: const c = new Counter(); c.inc()
`,
      solution: `class Counter {
  constructor(start = 0) {
    this.count = start;
  }

  inc() {
    this.count += 1;
    return this.count;
  }

  dec() {
    this.count -= 1;
    return this.count;
  }

  value() {
    return this.count;
  }
}
`,
      hints: ['У конструкторі: `this.count = start;`', 'У методах звертайтеся до `this.count`, а не до змінної.'],
      tests: [
        'expect(new Counter().value()).toBe(0)',
        { name: 'inc і dec повертають нове значення', code: 'const c = new Counter(5);\nexpect(c.inc()).toBe(6);\nexpect(c.dec()).toBe(5);\nexpect(c.value()).toBe(5);' },
        { name: 'лічильники незалежні', code: 'const a = new Counter();\nconst b = new Counter(10);\na.inc();\nexpect(a.value()).toBe(1);\nexpect(b.value()).toBe(10);' }
      ],
      explanation: 'Кожен `new Counter()` має власне `this.count`, тому лічильники не заважають один одному. Типова помилка — забути `this.` і звернутися до неіснуючої змінної `count`.'
    },
    {
      id: 'start-rectangle', group: 'classes', type: 'code', level: 1,
      title: 'Клас Rectangle',
      description: `
**Завдання.** Створіть клас \`Rectangle\`:
- \`new Rectangle(width, height)\`;
- \`area()\` — площа;
- \`perimeter()\` — периметр;
- \`isSquare()\` — \`true\`, якщо сторони рівні.

**Де трапляється:** моделі для геометрії інтерфейсу: розміри блоків, обрізання зображень, перевірка «чи вміститься банер у контейнер».

**Приклад**
\`\`\`js
const r = new Rectangle(3, 4);
r.area();      // 12
r.perimeter(); // 14
r.isSquare();  // false
\`\`\`

**Як це працює:** \`class\` описує шаблон об'єктів: \`constructor\` викликається при \`new\` і записує поля в \`this\`, а методи спільні для всіх екземплярів і бачать поля конкретного об'єкта через \`this\`.
`,
      starter: `class Rectangle {
  constructor(width, height) {
    // TODO
  }

  area() {}

  perimeter() {}

  isSquare() {}
}
`,
      solution: `class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }

  perimeter() {
    return 2 * (this.width + this.height);
  }

  isSquare() {
    return this.width === this.height;
  }
}
`,
      hints: ['Збережіть обидва параметри в `this`.', 'Периметр — `2 * (width + height)`.'],
      tests: [
        { name: 'площа і периметр', code: 'const r = new Rectangle(3, 4);\nexpect(r.area()).toBe(12);\nexpect(r.perimeter()).toBe(14);' },
        'expect(new Rectangle(3, 4).isSquare()).toBe(false)',
        'expect(new Rectangle(5, 5).isSquare()).toBe(true)'
      ],
      explanation: 'Методи працюють з даними об\'єкта через `this`. Обчислювані величини (площа) краще рахувати в методі, ніж зберігати: тоді вони не «розсинхронізуються» зі сторонами.'
    },
    {
      id: 'start-bank-account', group: 'classes', type: 'code', level: 2,
      title: 'Клас BankAccount з перевірками',
      description: `
**Завдання.** Створіть клас \`BankAccount\`:
- \`new BankAccount(owner)\` — баланс 0;
- \`deposit(amount)\` — додає суму; сума ≤ 0 → \`throw new Error('Сума має бути додатною')\`;
- \`withdraw(amount)\` — знімає; сума ≤ 0 → та сама помилка; більше за баланс → \`throw new Error('Недостатньо коштів')\`;
- \`getBalance()\` — поточний баланс;
- \`getHistory()\` — масив операцій \`{ type: 'deposit' | 'withdraw', amount }\` у порядку виконання.

**Де трапляється:** бізнес-логіка з правилами: кошик (ліміти), бронювання (вільні місця), гаманець.

**Приклад**
\`\`\`js
const acc = new BankAccount('Ann');
acc.deposit(100);
acc.withdraw(30);
acc.getBalance(); // 70
acc.withdraw(500); // Error: Недостатньо коштів
\`\`\`

**Як це працює:** \`throw new Error('текст')\` зупиняє метод — рядки після нього не виконуються, а помилку отримує той, хто викликав метод.

**Врахуйте:** невдала операція не змінює ні баланс, ні історію.
`,
      starter: `class BankAccount {
  constructor(owner) {
    // TODO: owner, balance = 0, history = []
  }

  deposit(amount) {
    // 1. Перевірити суму (кинути Error, якщо <= 0)
    // 2. Змінити баланс і додати запис в історію
  }

  withdraw(amount) {
    // TODO: перевірки → зміна балансу → запис в історію
  }

  getBalance() {}

  getHistory() {}
}
`,
      solution: `class BankAccount {
  constructor(owner) {
    this.owner = owner;
    this.balance = 0;
    this.history = [];
  }

  deposit(amount) {
    if (amount <= 0) throw new Error('Сума має бути додатною');
    this.balance += amount;
    this.history.push({ type: 'deposit', amount });
  }

  withdraw(amount) {
    if (amount <= 0) throw new Error('Сума має бути додатною');
    if (amount > this.balance) throw new Error('Недостатньо коштів');
    this.balance -= amount;
    this.history.push({ type: 'withdraw', amount });
  }

  getBalance() {
    return this.balance;
  }

  getHistory() {
    return this.history;
  }
}
`,
      hints: ['Спершу всі перевірки (і `throw`), лише потім зміни — тоді невдала операція нічого не зіпсує.', 'Запис історії: `this.history.push({ type: \'deposit\', amount })`.'],
      tests: [
        { name: 'поповнення і зняття', code: "const a = new BankAccount('Ann');\na.deposit(100);\na.withdraw(30);\nexpect(a.getBalance()).toBe(70);" },
        { name: 'не можна зняти більше, ніж є', code: "const a = new BankAccount('Ann');\na.deposit(50);\nexpect(() => a.withdraw(100)).toThrow('Недостатньо коштів');\nexpect(a.getBalance()).toBe(50);" },
        { name: 'сума має бути додатною', code: "const a = new BankAccount('Ann');\nexpect(() => a.deposit(0)).toThrow('Сума має бути додатною');\nexpect(() => a.withdraw(-5)).toThrow('Сума має бути додатною');" },
        { name: 'історія лише успішних операцій', code: "const a = new BankAccount('Ann');\na.deposit(100);\ntry { a.withdraw(500); } catch (e) {}\na.withdraw(40);\nexpect(a.getHistory()).toEqual([{ type: 'deposit', amount: 100 }, { type: 'withdraw', amount: 40 }]);" }
      ],
      explanation: 'Принцип «спершу перевір, потім зміни» (guard clauses) робить операції атомарними: помилка не залишає об\'єкт у напівзміненому стані. `throw` зупиняє метод — код після нього не виконається.\n\n**Далі на співбесіді спитають:** як заборонити змінювати `balance` ззовні? (приватні поля `#balance` — у модулі про класи).'
    },
    {
      id: 'start-todo-list', group: 'classes', type: 'code', level: 2,
      title: 'Клас TodoList',
      description: `
**Завдання.** Створіть клас \`TodoList\`:
- \`add(text)\` — додає задачу \`{ id, text, done: false }\`, повертає її \`id\` (1, 2, 3… по порядку);
- \`toggle(id)\` — перемикає \`done\`;
- \`remove(id)\` — видаляє задачу;
- \`getAll()\` — усі задачі;
- \`getActive()\` — лише невиконані.

**Де трапляється:** класичне тестове завдання для junior/middle — стан списку і операції над ним.

**Приклад**
\`\`\`js
const list = new TodoList();
const id = list.add('Купити хліб'); // 1
list.add('Вивчити класи');          // 2
list.toggle(id);
list.getActive(); // [{ id: 2, text: 'Вивчити класи', done: false }]
\`\`\`

**Як це працює:** масив об'єктів \`{ id, text, done }\` — модель будь-якого списку в інтерфейсі. Знайшовши елемент за \`id\`, змінюють його поле — і список уже в новому стані; рахувати виконані зручно лічильником у циклі.
`,
      starter: `class TodoList {
  constructor() {
    this.items = [];
    this.nextId = 1;
  }

  add(text) {
    // TODO: створити задачу з id = this.nextId, збільшити nextId, повернути id
  }

  toggle(id) {
    // TODO: знайти задачу за id і перемкнути done
  }

  remove(id) {
    // TODO: залишити всі, крім задачі з цим id
  }

  getAll() {
    return this.items;
  }

  getActive() {
    // TODO
  }
}
`,
      solution: `class TodoList {
  constructor() {
    this.items = [];
    this.nextId = 1;
  }

  add(text) {
    const id = this.nextId;
    this.nextId += 1;
    this.items.push({ id, text, done: false });
    return id;
  }

  toggle(id) {
    for (const item of this.items) {
      if (item.id === id) item.done = !item.done;
    }
  }

  remove(id) {
    const kept = [];
    for (const item of this.items) {
      if (item.id !== id) kept.push(item);
    }
    this.items = kept;
  }

  getAll() {
    return this.items;
  }

  getActive() {
    const active = [];
    for (const item of this.items) {
      if (!item.done) active.push(item);
    }
    return active;
  }
}
`,
      hints: ['Окремий лічильник `nextId` гарантує унікальні id навіть після видалень.', 'Для remove і getActive зручно збирати новий масив циклом з умовою.'],
      tests: [
        { name: 'add повертає id по порядку', code: "const l = new TodoList();\nexpect(l.add('a')).toBe(1);\nexpect(l.add('b')).toBe(2);\nexpect(l.getAll()).toEqual([{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: false }]);" },
        { name: 'toggle і getActive', code: "const l = new TodoList();\nconst a = l.add('a');\nl.add('b');\nl.toggle(a);\nexpect(l.getActive()).toEqual([{ id: 2, text: 'b', done: false }]);\nl.toggle(a);\nexpect(l.getActive()).toHaveLength(2);" },
        { name: 'remove і унікальні id після видалення', code: "const l = new TodoList();\nconst a = l.add('a');\nl.add('b');\nl.remove(a);\nexpect(l.getAll()).toEqual([{ id: 2, text: 'b', done: false }]);\nexpect(l.add('c')).toBe(3);" }
      ],
      explanation: 'Id не варто рахувати як `items.length + 1`: після видалення з\'являться дублікати. Окремий лічильник — надійно. Пізніше ці цикли замінять `find`, `filter` і `map` — логіка та сама.'
    }
  ]
});
