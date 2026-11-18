FE.topic('algo-advanced', {
  intro: `
## Шпаргалка: рекурсія, backtracking, сортування, бінарний пошук, DP, greedy

| Алгоритм / патерн | Час | Пам'ять | Примітка |
|---|---|---|---|
| Рекурсія без кешу (fib) | O(2ⁿ) | O(n) стек | Підзадачі перекриваються → мемоізація |
| Мемоізація / bottom-up DP | O(станів × переходів) | O(станів) | Часто стискається до O(1) / O(рядка) |
| Backtracking: підмножини / перестановки | O(n·2ⁿ) / O(n·n!) | O(n) | Вихід сам по собі такого розміру |
| Bubble / Selection / Insertion | O(n²) | O(1) | Insertion — O(n) на майже відсортованих |
| Merge sort | O(n log n) завжди | O(n) | Стабільний |
| Quick sort | O(n log n) сер., O(n²) гірш. | O(log n) | Нестабільний, випадковий pivot |
| Counting sort | O(n + k) | O(k) | Лише цілі в малому діапазоні |
| Quickselect (k-й елемент) | O(n) сер. | O(1) | Partition без повного сортування |
| Бінарний пошук | O(log n) | O(1) | Потрібна монотонність |

## Як впізнати патерн

- «усі підмножини / перестановки / комбінації» → **backtracking** (choose → explore → unchoose).
- «відсортований масив», «знайти межу», «мінімальне X, при якому можна…» → **бінарний пошук** (по індексу або по відповіді).
- «кількість способів», «мінімум/максимум», «чи можна», рішення складається з менших → **DP**.
- Рекурсія рахує одне й те саме багато разів → **мемоізація**, потім bottom-up.
- «інтервали», «найраніше закінчення», «локально найкращий крок не шкодить» → **greedy** + сортування.
- «k-й найбільший» → quickselect O(n) або купа O(n log k), а не сортування.

## Шаблони

\`\`\`js
// Backtracking
function backtrack(path, start) {
  if (isComplete(path)) { result.push([...path]); return; } // копія!
  for (let i = start; i < choices.length; i++) {
    path.push(choices[i]);      // choose
    backtrack(path, i + 1);     // explore
    path.pop();                 // unchoose
  }
}

// Lower bound: перший індекс, де arr[i] >= x (межі [lo, hi))
let lo = 0, hi = arr.length;
while (lo < hi) {
  const mid = (lo + hi) >> 1;
  if (arr[mid] < x) lo = mid + 1; else hi = mid;
}

// Бінарний пошук по відповіді: мінімальне v, для якого ok(v) === true
while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);
  if (ok(mid)) hi = mid; else lo = mid + 1;
}

// Bottom-up DP
const dp = new Array(n + 1).fill(0);
dp[0] = base;
for (let i = 1; i <= n; i++) dp[i] = transition(dp, i);
\`\`\`

## Пастки

- \`[10, 1, 2].sort()\` → \`[1, 10, 2]\`: без компаратора порівнюються **рядки**.
- \`sort\` стабільний з ES2019, але **мутує** масив — \`toSorted()\` ні.
- JS **не** оптимізує хвостову рекурсію (окрім Safari) — глибина ~10⁴ кадрів, далі \`RangeError\`.
- У backtracking додавайте **копію** шляху (\`[...path]\`), а не сам масив.
- Бінарний пошук: \`lo = mid\` без \`+ 1\` → нескінченний цикл; не змішуйте межі \`[lo, hi]\` і \`[lo, hi)\`.
`,
  groups: [
    { id: 'recursion', title: 'Рекурсія і мемоізація' },
    { id: 'backtracking', title: 'Backtracking: перебір з поверненням' },
    { id: 'sort-builtin', title: 'Вбудований sort і компаратори' },
    { id: 'sort-algos', title: 'Алгоритми сортування' },
    { id: 'binary-search', title: 'Бінарний пошук' },
    { id: 'dp-1d', title: 'Динамічне програмування: 1D' },
    { id: 'dp-2d', title: 'Динамічне програмування: сітки, рядки, рюкзак' },
    { id: 'greedy', title: 'Жадібні алгоритми та інтервали' }
  ],
  items: [
    // ---------------------------------------------------------------- Рекурсія і мемоізація
    {
      id: 'algoadv-recursion-theory',
      group: 'recursion',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Рекурсія: базовий випадок, стек викликів, переповнення',
      tags: ['recursion'],
      question: 'Що таке рекурсія? З чого складається коректна рекурсивна функція, як вона виконується і які в неї обмеження в JavaScript? Оберіть **усі** правильні твердження.',
      choices: [
        'Хвостова рекурсія в Chrome і Node не переповнює стек, бо TCO є в специфікації ES2015',
        'Коректна рекурсія має базовий випадок і рекурсивний крок, що наближає до нього',
        'Нехвостову рекурсію неможливо переписати ітеративно, навіть з явним стеком',
        'Кожен рекурсивний виклик створює кадр у call stack, тому памʼять — O(глибина)',
        'Мемоізація зменшує глибину стеку, але не впливає на кількість обчислень',
      ],
      correct: [1, 3],
      hint: 'Подумайте про базовий випадок, рекурсивний крок, call stack і RangeError.',
      answer: `
- **Рекурсія** — функція розв'язує задачу через виклик себе на меншій підзадачі.
- **Обов'язково:** базовий випадок + крок, що до нього наближає.
- **Call stack:** кожен виклик — кадр, пам'ять O(глибина).
- **Ліміт JS:** ~10⁴ кадрів → \`RangeError: Maximum call stack size exceeded\`; TCO працює лише в Safari.
- **Перекриття підзадач** (fib) → мемоізація.
- **Глибокі дані** → явний стек + цикл.

\`\`\`js
function sum(arr, i = 0) {
  if (i === arr.length) return 0;   // базовий випадок
  return arr[i] + sum(arr, i + 1);  // крок
}
\`\`\`
`,
      why: [
        'Хибно: TCO є в специфікації, але V8 і Firefox її не реалізують (лише Safari) — глибока хвостова рекурсія теж дає RangeError.',
        'Правильно: без базового випадку або без наближення до нього рекурсія ніколи не зупиниться.',
        'Хибно: будь-яку рекурсію можна переписати циклом з явним стеком-масивом.',
        'Правильно: кожен виклик тримає свій кадр, доки не поверне результат, тож пам\'ять росте з глибиною.',
        'Хибно навпаки: мемоізація прибирає повторні обчислення (fib: O(2ⁿ) → O(n)), а глибину стеку не змінює.'
      ],
      keyPoints: [
        'Базовий випадок + крок, що наближає до нього',
        'Кожен виклик — кадр у call stack, пам\'ять O(глибина)',
        'Ліміт стеку → RangeError: Maximum call stack size exceeded',
        'TCO у JS фактично не працює (лише Safari)',
        'Перетворення в ітерацію через явний стек',
        'Перекриття підзадач → мемоізація'
      ],
      followUps: [
        'Як переписати обхід дерева без рекурсії?',
        'Чим хвостова рекурсія відрізняється від звичайної?',
        'Яка пам\'ять у рекурсивного merge sort?'
      ]
    },
    {
      id: 'algoadv-quiz-fib-complexity',
      group: 'recursion',
      type: 'quiz',
      level: 2,
      title: 'Складність наївного рекурсивного fib',
      tags: ['recursion', 'big-o'],
      question: `
Яка часова та просторова складність цієї функції?

\`\`\`js
function fib(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}
\`\`\`
`,
      options: [
        'Час O(2ⁿ), пам\'ять O(n)',
        'Час O(2ⁿ), пам\'ять O(2ⁿ)',
        'Час O(n), пам\'ять O(n)',
        'Час O(n²), пам\'ять O(1)'
      ],
      answer: 0,
      why: [
        'Правильно: викликів ~φⁿ (час), але в стеку одночасно лише шлях від кореня до листка довжиною ≤ n (пам\'ять).',
        'Хибно: O(2ⁿ) — загальна кількість викликів, а в стеку одночасно живе лише поточний шлях, O(n).',
        'Хибно: O(n) за часом має версія з мемоізацією, а тут ті самі fib(k) рахуються багато разів.',
        'Хибно: кожен виклик породжує два нових — це експонента, а не квадрат; і стек росте до n.'
      ],
      hint: 'Намалюйте дерево викликів для fib(5). Скільки вузлів у дереві і скільки з них одночасно в стеку?',
      explanation: `
Кожен виклик породжує два → ~1.618ⁿ вузлів, **O(2ⁿ)** часу (\`fib(5)\` рахує \`fib(2)\` тричі). Стек тримає лише поточний шлях → **O(n)** пам'яті. Ліки — кеш або цикл.
`
    },
    {
      id: 'algoadv-fib-memo',
      group: 'recursion',
      type: 'code',
      level: 2,
      interview: true,
      title: 'Фібоначчі: мемоізація та bottom-up',
      tags: ['recursion', 'memoization', 'dp'],
      description: `
**Завдання.** Напишіть дві швидкі версії числа Фібоначчі (\`F(0) = 0\`, \`F(1) = 1\`, \`F(n) = F(n-1) + F(n-2)\`).

**Де трапляється:** класика співбесід про мемоізацію і DP; та сама ідея — кешування дорогих обчислень (\`useMemo\`, кеш запитів).

**Що написати**
- \`fibMemo(n)\` → число; рекурсія + кеш (top-down)
- \`fibIter(n)\` → число; цикл, пам'ять O(1) (bottom-up)

**Приклад**
\`\`\`js
fibMemo(10); // 55
fibIter(50); // 12586269025
\`\`\`

**Як це працює:** наївна рекурсія рахує ті самі \`F(k)\` знову і знову (~2ⁿ викликів). Кеш зберігає \`F(k)\` після першого обчислення → O(n). Цикл іде знизу вгору, тримаючи лише два останні числа.

**Врахуйте:**
- \`0 ≤ n ≤ 78\`, \`n = 78\` — миттєво;
- \`if (memo[n])\` хибне для збереженого \`0\` — перевіряйте \`n in memo\`.
`,
      starter: `function fibMemo(n, memo = {}) {
  // 1. n < 2 → повернути n.
  // 2. n уже в memo → повернути memo[n].
  // 3. memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo); повернути.
  // TODO
}

function fibIter(n) {
  // 1. a = 0, b = 1.
  // 2. n разів: (a, b) → (b, a + b).
  // 3. Повернути a.
  // TODO
}

// Спробуйте в консолі: fibMemo(10); fibIter(50);
`,
      solution: `function fibMemo(n, memo = new Map()) {
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n);
  const value = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, value);
  return value;
}

function fibIter(n) {
  let a = 0; // F(i)
  let b = 1; // F(i + 1)
  for (let i = 0; i < n; i++) {
    const next = a + b;
    a = b;
    b = next;
  }
  return a;
}
`,
      hints: [
        'Збережіть уже пораховані `F(k)` і перевіряйте кеш **перед** обчисленням.',
        'Для `fibIter` досить двох змінних: попереднє і поточне число.',
        '`let a = 0, b = 1; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a;`'
      ],
      tests: [
        { name: 'базові випадки: F(0) = 0, F(1) = 1', code: 'expect(fibMemo(0)).toBe(0);\nexpect(fibMemo(1)).toBe(1);\nexpect(fibIter(0)).toBe(0);\nexpect(fibIter(1)).toBe(1);' },
        { name: 'F(2) = 1, F(10) = 55', code: 'expect(fibMemo(2)).toBe(1);\nexpect(fibMemo(10)).toBe(55);\nexpect(fibIter(2)).toBe(1);\nexpect(fibIter(10)).toBe(55);' },
        { name: 'F(50) = 12586269025', code: 'expect(fibMemo(50)).toBe(12586269025);\nexpect(fibIter(50)).toBe(12586269025);' },
        { name: 'повторні виклики дають той самий результат', code: 'expect(fibMemo(20)).toBe(6765);\nexpect(fibMemo(20)).toBe(6765);\nexpect(fibMemo(19)).toBe(4181);' },
        { name: 'продуктивність: F(78) миттєво (наївна рекурсія зависне)', code: 'const t0 = performance.now();\nexpect(fibMemo(78)).toBe(8944394323791464);\nexpect(fibIter(78)).toBe(8944394323791464);\nexpect(performance.now() - t0).toBeLessThan(500);' }
      ],
      explanation: `
**Чому працює:** підзадачі перекриваються — кожне \`F(k)\` рахуємо один раз.

| Версія | Час | Пам'ять |
|---|---|---|
| Наївна рекурсія | O(2ⁿ) | O(n) |
| Мемоізація | O(n) | O(n) |
| Цикл | O(n) | O(1) |

**Типові помилки:** \`if (memo[n])\` для нуля; мемоізована рекурсія для \`n = 10⁵\` падає зі stack overflow (цикл — ні).

**Що спитають далі:** універсальний \`memoize(fn)\`? Чому лише для чистих функцій?
`
    },
    {
      id: 'algoadv-quiz-tail-call',
      group: 'recursion',
      type: 'quiz',
      level: 3,
      title: 'Хвостова рекурсія в JavaScript',
      tags: ['recursion'],
      question: `
Що станеться при запуску цього коду в Chrome або Node.js?

\`\`\`js
'use strict';
function sum(n, acc = 0) {
  if (n === 0) return acc;
  return sum(n - 1, acc + n); // хвостовий виклик
}
console.log(sum(1e6));
\`\`\`
`,
      options: [
        '`500000500000`',
        '`RangeError: Maximum call stack size exceeded`',
        '`Infinity`',
        '`undefined`'
      ],
      answer: 1,
      why: [
        'Хибно: так було б у рушії з proper tail calls (Safari), а V8 тримає всі 10⁶ кадрів у стеку.',
        'Правильно: V8 і Firefox не оптимізують хвостові виклики, тож мільйон кадрів переповнює стек.',
        'Хибно: сума 1..10⁶ скінченна (~5·10¹¹), до Infinity не дійде.',
        'Хибно: базовий випадок повертає acc, і кожен рівень повертає результат глибшого.'
      ],
      hint: 'Специфікація ES2015 описує proper tail calls. А чи реалізували їх V8?',
      explanation: `
Виклик хвостовий, і ES2015 вимагає TCO, але **V8 і Firefox її не реалізують** (лише Safari) → 10⁶ кадрів → \`RangeError\`. Для великої глибини пишіть цикл.
`
    },
    {
      id: 'algoadv-flatten-iterative',
      group: 'recursion',
      type: 'code',
      level: 3,
      title: 'Рекурсія → ітерація: flattenDeep з явним стеком',
      tags: ['recursion', 'stack'],
      description: `
**Завдання.** Напишіть \`flattenDeep(arr)\`: «розплющити» масив будь-якої вкладеності, зберігаючи порядок, — **без рекурсії**.

**Де трапляється:** поліфіл \`flat(Infinity)\` на співбесіді; розгортання вкладених коментарів / меню в плаский список. Follow-up: «а вкладеність 100 000?» — рекурсія впаде.

**Що написати**
- \`flattenDeep(arr)\` → новий плаский масив

**Приклад**
\`\`\`js
flattenDeep([1, [2, [3, [4]]], 5]); // [1, 2, 3, 4, 5]
flattenDeep([[], [[]]]);           // []
\`\`\`

**Як це працює:** рекурсія — це неявний стек. Зробіть його явним: масив кадрів \`[масив, індекс]\`. Кінець масиву → \`pop\` (як \`return\`), елемент-масив → \`push\` кадру (як виклик), інакше — у результат.

**Врахуйте:**
- без рекурсії і без \`flat\` (тест на глибину 100 000);
- не мутувати вхід; \`null\`, об'єкти, рядки — лишаються як є.
`,
      starter: `function flattenDeep(arr) {
  const result = [];
  const stack = [[arr, 0]]; // кадр: [масив, індекс наступного елемента]

  // 1. Поки stack не порожній — беремо верхній кадр.
  // 2. Індекс дійшов до кінця → stack.pop().
  // 3. Інакше беремо елемент, збільшуємо індекс у кадрі:
  //    масив → stack.push([item, 0]), інакше → result.push(item).
  // TODO

  return result;
}

// Спробуйте в консолі: flattenDeep([1, [2, [3, [4]]], 5]);
`,
      solution: `function flattenDeep(arr) {
  const result = [];
  // Явний стек кадрів: [масив, індекс наступного елемента] — імітація call stack
  const stack = [[arr, 0]];
  while (stack.length) {
    const frame = stack[stack.length - 1];
    const list = frame[0];
    const i = frame[1];
    if (i >= list.length) {
      stack.pop(); // «повернення» з рекурсії
      continue;
    }
    frame[1] = i + 1;
    const item = list[i];
    if (Array.isArray(item)) stack.push([item, 0]); // «рекурсивний виклик»
    else result.push(item);
  }
  return result;
}
`,
      hints: [
        'Рекурсія — неявний стек. Замініть його масивом-стеком.',
        'Кадр = «масив + позиція». Кінець → `pop`; елемент-масив → `push([item, 0])`; інакше → у результат.',
        'Альтернатива: стек елементів у зворотному порядку, `pop` по одному, масив — розгорнути назад у стек.'
      ],
      tests: [
        { name: 'порожній масив → []', code: 'expect(flattenDeep([])).toEqual([]);' },
        { name: 'розплющує кілька рівнів, зберігає порядок', code: 'expect(flattenDeep([1, [2, [3, [4]]], 5])).toEqual([1, 2, 3, 4, 5]);\nexpect(flattenDeep([[1, 2], [3, [4, 5]], 6])).toEqual([1, 2, 3, 4, 5, 6]);' },
        { name: 'порожні вкладені масиви зникають', code: 'expect(flattenDeep([[], [[]], [[], [1]]])).toEqual([1]);' },
        { name: 'не мутує вхідний масив', code: 'const a = [1, [2, [3]]];\nflattenDeep(a);\nexpect(a).toEqual([1, [2, [3]]]);' },
        { name: 'зберігає не-масивні значення як є', code: 'const o = { x: 1 };\nexpect(flattenDeep([o, [null, ["s", [0]]]])).toEqual([o, null, "s", 0]);' },
        { name: 'вкладеність 100 000 без flat і без переповнення стеку', code: `const orig = Array.prototype.flat;
Array.prototype.flat = function () { throw new Error('flat заборонено'); };
let r;
try {
  let a = [0];
  for (let i = 1; i < 100000; i++) a = [a, i];
  r = flattenDeep(a);
} finally {
  Array.prototype.flat = orig;
}
expect(r.length).toBe(100000);
expect(r[0]).toBe(0);
expect(r[500]).toBe(500);
expect(r[99999]).toBe(99999);` }
      ],
      explanation: `
**Чому працює:** кадр \`[list, index]\` зберігає те саме, що call stack у рекурсивній версії, але в купі — глибина обмежена лише пам'яттю.

**Складність:** O(N) часу, O(глибина) пам'яті.

**Типові помилки:** стек елементів без розвороту — порядок перевернутий; \`shift()\` замість \`pop()\` — O(n) на крок; \`push(...item)\` для величезних масивів перевищує ліміт аргументів.

**Що спитають далі:** параметр \`depth\` як у \`flat(depth)\`? Обхід DOM-дерева без рекурсії?
`
    },
    // ---------------------------------------------------------------- Backtracking: перебір з поверненням
    {
      id: 'algoadv-backtracking-theory',
      group: 'backtracking',
      type: 'theory',
      level: 3,
      title: 'Backtracking: шаблон і складність',
      tags: ['backtracking', 'recursion'],
      question: 'Що таке backtracking (пошук з поверненням)? Опишіть загальний шаблон, як оцінити складність і як прискорити перебір.',
      choices: [
        'Backtracking — це BFS по дереву рішень, тому відповідь завжди знаходиться за мінімум кроків',
        'У результат можна додавати сам `path` без копії, бо після `pop` він більше не змінюється',
        'Генерація всіх підмножин коштує O(n²), бо кожен елемент порівнюється з кожним іншим',
        'Для перестановок використовують параметр `start`, а для комбінацій — масив прапорців `used`',
        'Шаблон choose → explore → unchoose, а pruning відсікає гілки, що точно не дадуть відповіді',
      ],
      correct: 4,
      hint: 'Choose → explore → unchoose; дерево рішень; відсікання (pruning).',
      answer: `
- **Що це:** перебір рішень крок за кроком, DFS по дереву рішень.
- **Шаблон:** choose → explore → unchoose.
- **Варіації:** \`start\` — комбінації/підмножини; \`used\` — перестановки; сортування + пропуск однакових — дублікати; рекурсія з \`i\` (не \`i + 1\`) — повторне використання.
- **Складність:** вузли дерева × робота у вузлі: підмножини O(n·2ⁿ), перестановки O(n·n!).
- **Pruning:** відсікати гілки, що точно не дадуть відповіді (сума > цілі, зайнята діагональ).
- **Пастки:** \`result.push(path)\` без копії; забутий відкат.

\`\`\`js
function backtrack(start) {
  if (isSolution(path)) result.push([...path]);
  for (let i = start; i < choices.length; i++) {
    path.push(choices[i]);   // choose
    backtrack(i + 1);        // explore
    path.pop();              // unchoose
  }
}
\`\`\`
`,
      why: [
        'Хибно: backtracking — це DFS (йде вглиб однієї гілки до кінця), а не BFS, і мінімальну кількість кроків не гарантує.',
        'Хибно: path продовжує змінюватись після push, тож усі елементи результату виявляться одним і тим самим масивом — потрібна копія [...path].',
        'Хибно: підмножин 2ⁿ, і кожну треба скопіювати, тому O(n·2ⁿ), а не O(n²).',
        'Хибно навпаки: start — для комбінацій (порядок не важливий), used — для перестановок (на кожну позицію пробуємо будь-який невикористаний).',
        'Правильно: зробили вибір → рекурсія → відкотили; pruning обрізає безперспективні гілки.'
      ],
      keyPoints: [
        'Перебір через побудову рішення крок за кроком — DFS по дереву рішень',
        'Шаблон choose → explore → unchoose',
        'start для комбінацій, used для перестановок, сортування для дублікатів',
        'Складність експоненційна: O(n·2ⁿ), O(n·n!)',
        'Pruning — відсікання безперспективних гілок',
        'Зберігати копію path, а не посилання'
      ],
      followUps: [
        'Чим backtracking відрізняється від DP?',
        'Як згенерувати перестановки без рекурсії?',
        'Як оцінити кількість вузлів дерева рішень для N-Queens?'
      ]
    },
    {
      id: 'algoadv-subsets',
      group: 'backtracking',
      type: 'code',
      level: 2,
      title: 'Усі підмножини (power set)',
      tags: ['backtracking'],
      description: `
**Завдання.** Поверніть **усі підмножини** масиву різних чисел (включно з порожньою і самим масивом).

**Де трапляється:** класика backtracking на співбесідах; на практиці — усі комбінації увімкнених фільтрів чи опцій товару.

**Що написати**
- \`subsets(nums)\` → масив масивів; порядок підмножин і елементів — будь-який

**Приклад**
\`\`\`js
subsets([1, 2, 3]);
// [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
subsets([]); // [[]]
\`\`\`

**Як це працює:** \`backtrack(start)\`: поточний \`path\` — уже готова підмножина, зберігаємо її **копію**. Далі для кожного \`i >= start\`: додали \`nums[i]\` → рекурсія з \`i + 1\` → прибрали. \`start\` не дає взяти елемент «назад», тож \`[1,2]\` і \`[2,1]\` не задвоюються.

**Врахуйте:** \`[]\` → \`[[]]\`; не мутувати вхід; кожна підмножина — окремий масив.
`,
      starter: `function subsets(nums) {
  const result = [];
  const path = [];

  function backtrack(start) {
    // 1. Додати КОПІЮ path у result.
    // 2. Для i від start до кінця: path.push(nums[i]) → backtrack(i + 1) → path.pop().
    // TODO
  }

  // 3. Запустити backtrack(0).
  return result;
}

// Спробуйте в консолі: subsets([1, 2, 3]);
`,
      solution: `function subsets(nums) {
  const result = [];
  const path = [];
  function backtrack(start) {
    result.push([...path]); // кожен вузол дерева — валідна підмножина
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);   // choose
      backtrack(i + 1);     // explore
      path.pop();           // unchoose
    }
  }
  backtrack(0);
  return result;
}
`,
      hints: [
        'Кожен елемент або входить у підмножину, або ні — 2ⁿ варіантів.',
        'На початку `backtrack(start)` додайте `[...path]`, потім перебирайте `i >= start`.',
        'Без рекурсії: `let res = [[]]; for (const x of nums) res = res.concat(res.map(s => [...s, x]));`'
      ],
      tests: [
        { name: 'порожній масив → [[]]', code: 'expect(subsets([])).toEqual([[]]);' },
        { name: 'один елемент → [] і [x]', code: 'const norm = r => r.map(s => JSON.stringify([...s].sort((a, b) => a - b))).sort();\nexpect(norm(subsets([5]))).toEqual(norm([[], [5]]));' },
        { name: 'три елементи → 8 підмножин', code: 'const norm = r => r.map(s => JSON.stringify([...s].sort((a, b) => a - b))).sort();\nconst exp = [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]];\nexpect(norm(subsets([1, 2, 3]))).toEqual(norm(exp));' },
        { name: 'працює з від\'ємними та нулем', code: 'const norm = r => r.map(s => JSON.stringify([...s].sort((a, b) => a - b))).sort();\nexpect(norm(subsets([-1, 0]))).toEqual(norm([[], [-1], [0], [-1, 0]]));' },
        { name: 'n = 12 → 4096 різних підмножин', code: 'const nums = Array.from({ length: 12 }, (_, i) => i);\nconst r = subsets(nums);\nexpect(r).toHaveLength(4096);\nconst keys = new Set(r.map(s => [...s].sort((a, b) => a - b).join(",")));\nexpect(keys.size).toBe(4096);' },
        { name: 'не мутує вхідний масив', code: 'const a = [3, 1, 2];\nsubsets(a);\nexpect(a).toEqual([3, 1, 2]);' }
      ],
      explanation: `
**Чому працює:** кожен вузол дерева рішень — унікальна підмножина, бо елементи беруться лише в порядку зростання індексу.

**Складність:** O(n·2ⁿ) часу (2ⁿ підмножин × копія), O(n) стек.

**Типові помилки:** \`result.push(path)\` — 2ⁿ посилань на один (зрештою порожній) масив; цикл з \`0\` замість \`start\` — дублікати.

**Що спитають далі:** якщо в \`nums\` є дублікати (Subsets II)? Підмножини розміру рівно k? Бітові маски?
`
    },
    {
      id: 'algoadv-permutations',
      group: 'backtracking',
      type: 'code',
      level: 2,
      interview: true,
      title: 'Усі перестановки',
      tags: ['backtracking'],
      description: `
**Завдання.** Поверніть **усі перестановки** масиву різних чисел.

**Де трапляється:** класика співбесід; на практиці — перебір усіх порядків кроків чи тест-кейсів.

**Що написати**
- \`permute(nums)\` → масив перестановок; порядок — будь-який

**Приклад**
\`\`\`js
permute([1, 2, 3]);
// [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
permute([]); // [[]]
\`\`\`

**Як це працює:** порядок важливий, тож на кожну позицію пробуємо **будь-який** ще не взятий елемент (масив \`used\`), а не лише «правіші». Повний \`path\` → копія в результат. Після рекурсії відкочуємо і \`path\`, і \`used[i]\`.

**Врахуйте:** \`[]\` → \`[[]]\`; не мутувати вхід.
`,
      starter: `function permute(nums) {
  const result = [];
  const path = [];
  const used = new Array(nums.length).fill(false);

  function backtrack() {
    // 1. path.length === nums.length → копію в result, return.
    // 2. Для кожного i з !used[i]: позначити, push, backtrack(), pop, зняти позначку.
    // TODO
  }

  backtrack();
  return result;
}

// Спробуйте в консолі: permute([1, 2, 3]);
`,
      solution: `function permute(nums) {
  const result = [];
  const path = [];
  const used = new Array(nums.length).fill(false);
  function backtrack() {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      backtrack();
      path.pop();
      used[i] = false;
    }
  }
  backtrack();
  return result;
}
`,
      hints: [
        'На кожній позиції — будь-який ще не використаний елемент.',
        'Перебирайте `i` з нуля, пропускайте `used[i]`; після рекурсії відкотіть обидві зміни.',
        'Без `used`: міняйте `nums[start]` з кожним `nums[i]` (i ≥ start) на копії масиву, рекурсія з `start + 1`, міняйте назад.'
      ],
      tests: [
        { name: 'порожній масив → [[]]', code: 'expect(permute([])).toEqual([[]]);' },
        { name: 'один елемент', code: 'expect(permute([7])).toEqual([[7]]);' },
        { name: 'три елементи → 6 перестановок', code: 'const norm = r => r.map(p => JSON.stringify(p)).sort();\nconst exp = [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]];\nexpect(norm(permute([1, 2, 3]))).toEqual(norm(exp));' },
        { name: 'від\'ємні числа', code: 'const norm = r => r.map(p => JSON.stringify(p)).sort();\nexpect(norm(permute([0, -1]))).toEqual(norm([[0, -1], [-1, 0]]));' },
        { name: 'n = 7 → 5040 унікальних перестановок', code: 'const r = permute([1, 2, 3, 4, 5, 6, 7]);\nexpect(r).toHaveLength(5040);\nexpect(new Set(r.map(p => p.join(","))).size).toBe(5040);\nexpect(r.every(p => p.length === 7)).toBe(true);' },
        { name: 'не мутує вхідний масив', code: 'const a = [3, 1, 2];\npermute(a);\nexpect(a).toEqual([3, 1, 2]);' }
      ],
      explanation: `
**Складність:** n! перестановок × O(n) на копію → O(n·n!); пам'ять O(n).

**Типові помилки:** забути \`used[i] = false\`; пуш \`path\` без копії; з дублікатами цей код дасть повтори.

**Що спитають далі:** що робити з дублікатами? k-та перестановка без генерації всіх? Next permutation?
`
    },
    {
      id: 'algoadv-combinations',
      group: 'backtracking',
      type: 'code',
      level: 2,
      title: 'Комбінації: k чисел з 1..n',
      tags: ['backtracking'],
      description: `
**Завдання.** Поверніть усі комбінації з \`k\` чисел з діапазону \`1..n\`.

**Де трапляється:** класика співбесід; на практиці — «оберіть k з n» (усі пари варіантів для A/B-тесту, набори з k фільтрів).

**Що написати**
- \`combine(n, k)\` → масив комбінацій; кожна — за **зростанням**, порядок комбінацій будь-який

**Приклад**
\`\`\`js
combine(4, 2); // [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
combine(3, 0); // [[]]
combine(2, 3); // []
\`\`\`

**Як це працює:** це підмножини, що зупиняються на розмірі \`k\`. Після числа \`i\` беремо лише більші (\`start = i + 1\`), тож кожна комбінація зростає і не повторюється. Pruning: якщо чисел до \`n\` лишилось менше, ніж бракує, — далі не йдемо.

**Врахуйте:** \`k = 0\` → \`[[]]\`; \`k > n\` → \`[]\`.
`,
      starter: `function combine(n, k) {
  const result = [];
  const path = [];

  function backtrack(start) {
    // 1. path.length === k → копію в result, return.
    // 2. Для i від start до n: push(i) → backtrack(i + 1) → pop().
    //    (Бонус: верхня межа n - (k - path.length) + 1.)
    // TODO
  }

  backtrack(1);
  return result;
}

// Спробуйте в консолі: combine(4, 2);
`,
      solution: `function combine(n, k) {
  const result = [];
  const path = [];
  function backtrack(start) {
    if (path.length === k) {
      result.push([...path]);
      return;
    }
    // Pruning: якщо чисел, що лишились, не вистачить — далі не йдемо
    const need = k - path.length;
    for (let i = start; i <= n - need + 1; i++) {
      path.push(i);
      backtrack(i + 1);
      path.pop();
    }
  }
  backtrack(1);
  return result;
}
`,
      hints: [
        'Як підмножини, але зберігайте лише шлях довжини `k`.',
        '`backtrack(start)`: при `path.length === k` — копія; інакше `i` від `start` до `n`, рекурсія з `i + 1`.',
        'Відсікання: межа циклу `n - (k - path.length) + 1`.'
      ],
      tests: [
        { name: 'combine(4, 2) → 6 комбінацій', code: 'const norm = r => r.map(c => JSON.stringify(c)).sort();\nexpect(norm(combine(4, 2))).toEqual(norm([[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]));' },
        { name: 'k = 0 → [[]]', code: 'expect(combine(3, 0)).toEqual([[]]);' },
        { name: 'k = n → одна комбінація', code: 'expect(combine(3, 3)).toEqual([[1, 2, 3]]);\nexpect(combine(1, 1)).toEqual([[1]]);' },
        { name: 'k > n → []', code: 'expect(combine(2, 3)).toEqual([]);' },
        { name: 'кожна комбінація зростає, C(16, 8) = 12870', code: 'const r = combine(16, 8);\nexpect(r).toHaveLength(12870);\nexpect(r.every(c => c.length === 8 && c.every((x, i) => i === 0 || c[i - 1] < x))).toBe(true);\nexpect(new Set(r.map(c => c.join(","))).size).toBe(12870);' }
      ],
      explanation: `
**Складність:** O(k·C(n, k)); пам'ять O(k).

**Brute force:** згенерувати всі 2ⁿ підмножин і відфільтрувати — для n = 20, k = 2 мільйон підмножин замість 190.

**Типові помилки:** цикл щоразу з 1 (дублікати \`[1,2]\`/\`[2,1]\`); \`i < n\` замість \`i <= n\`; пуш без копії.

**Що спитають далі:** порахувати C(n, k) без генерації (трикутник Паскаля)?
`
    },
    {
      id: 'algoadv-permutations-unique',
      group: 'backtracking',
      type: 'code',
      level: 3,
      title: 'Перестановки з дублікатами',
      tags: ['backtracking'],
      description: `
**Завдання.** Поверніть усі **унікальні** перестановки масиву, який **може містити дублікати**.

**Де трапляється:** follow-up до «усіх перестановок» на співбесіді — перевіряють прийом «пропуск дублікатів на рівні».

**Що написати**
- \`permuteUnique(nums)\` → масив унікальних перестановок; порядок — будь-який

**Приклад**
\`\`\`js
permuteUnique([1, 1, 2]); // [[1,1,2],[1,2,1],[2,1,1]]
\`\`\`

**Як це працює:** відсортуйте копію — однакові стануть поруч. Далі звичайні перестановки з \`used\`, але пропускаємо \`i\`, якщо \`nums[i] === nums[i-1]\` і \`!used[i-1]\`: однакові значення беруться лише зліва направо, тож на одній позиції кожне значення пробується один раз.

**Врахуйте:** не мутувати вхід; генерувати n! і потім чистити — занадто повільно (тест: 10 елементів).
`,
      starter: `function permuteUnique(nums) {
  // 1. Відсортована копія — однакові поруч.
  const sorted = [...nums].sort((a, b) => a - b);
  const result = [];
  const path = [];
  const used = new Array(sorted.length).fill(false);

  function backtrack() {
    // 2. path повний → копію в result.
    // 3. Для кожного i: пропустити used[i];
    //    пропустити, якщо sorted[i] === sorted[i - 1] && !used[i - 1];
    //    інакше choose → backtrack() → unchoose.
    // TODO
  }

  backtrack();
  return result;
}

// Спробуйте в консолі: permuteUnique([1, 1, 2]);
`,
      solution: `function permuteUnique(nums) {
  const sorted = [...nums].sort((a, b) => a - b); // однакові — поруч
  const result = [];
  const path = [];
  const used = new Array(sorted.length).fill(false);
  function backtrack() {
    if (path.length === sorted.length) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < sorted.length; i++) {
      if (used[i]) continue;
      // Серед однакових значень беремо їх строго зліва направо:
      // якщо попередній такий самий ще не використаний на цьому шляху — пропускаємо.
      if (i > 0 && sorted[i] === sorted[i - 1] && !used[i - 1]) continue;
      used[i] = true;
      path.push(sorted[i]);
      backtrack();
      path.pop();
      used[i] = false;
    }
  }
  backtrack();
  return result;
}
`,
      hints: [
        'Відсортуйте копію: однакові числа опиняться поруч.',
        'Однакові значення мають використовуватись у фіксованому порядку (зліва направо).',
        'Пропускайте `i`, якщо `nums[i] === nums[i - 1] && !used[i - 1]`.'
      ],
      tests: [
        { name: '[1, 1, 2] → 3 перестановки', code: 'const norm = r => r.map(p => JSON.stringify(p)).sort();\nexpect(norm(permuteUnique([1, 1, 2]))).toEqual(norm([[1,1,2],[1,2,1],[2,1,1]]));' },
        { name: 'без дублікатів поводиться як permute', code: 'expect(permuteUnique([1, 2, 3])).toHaveLength(6);' },
        { name: 'усі однакові → одна перестановка', code: 'expect(permuteUnique([2, 2, 2, 2])).toEqual([[2, 2, 2, 2]]);' },
        { name: 'порожній та одиничний масив', code: 'expect(permuteUnique([])).toEqual([[]]);\nexpect(permuteUnique([-3])).toEqual([[-3]]);' },
        { name: 'результат без повторів, не мутує вхід', code: 'const a = [3, 1, 3, 1];\nconst r = permuteUnique(a);\nexpect(r).toHaveLength(6);\nexpect(new Set(r.map(p => p.join(","))).size).toBe(6);\nexpect(a).toEqual([3, 1, 3, 1]);' },
        { name: 'продуктивність: [1×5, 2×5] → 252 без генерації 10!', code: 'const t0 = performance.now();\nconst r = permuteUnique([1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);\nexpect(r).toHaveLength(252);\nexpect(performance.now() - t0).toBeLessThan(400);' }
      ],
      explanation: `
**Чому працює:** \`!used[i-1]\` означає «попередню копію цього значення на цьому рівні вже пробували і відкотили» — повтор гілки відсікається.

**Складність:** O(n · U), U — кількість унікальних перестановок; + O(n log n) сортування.

**Типові помилки:** забути відсортувати; генерувати n! і чистити через \`Set\` (для \`[1×5, 2×5]\` — 3.6 млн замість 252).

**Що спитають далі:** Subsets II / Combination Sum II — той самий прийом?
`
    },
    {
      id: 'algoadv-combination-sum',
      group: 'backtracking',
      type: 'code',
      level: 3,
      title: 'Combination Sum (з повторним використанням)',
      tags: ['backtracking'],
      description: `
**Завдання.** Знайдіть усі унікальні комбінації чисел з \`candidates\`, сума яких дорівнює \`target\`. Кожне число можна брати **скільки завгодно разів**.

**Де трапляється:** класика співбесід; на практиці — підібрати набір товарів / номіналів на точну суму.

**Що написати**
- \`combinationSum(candidates, target)\` → масив комбінацій (\`[2,2,3]\` і \`[2,3,2]\` — одна й та сама)

**Приклад**
\`\`\`js
combinationSum([2, 3, 6, 7], 7); // [[2, 2, 3], [7]]
combinationSum([2, 3, 5], 8);    // [[2, 2, 2, 2], [2, 3, 3], [3, 5]]
combinationSum([2], 1);          // []
\`\`\`

**Як це працює:** стан — \`remain\` (скільки ще набрати) і \`start\` (з якого індексу можна брати). Рекурсія з тим самим \`i\` дозволяє взяти число повторно, а \`start\` прибирає перестановки. Після сортування: \`nums[i] > remain\` → \`break\`, далі лише більші.

**Врахуйте:** числа різні й додатні, \`candidates\` може бути невідсортованим; не мутувати вхід.
`,
      starter: `function combinationSum(candidates, target) {
  const nums = [...candidates].sort((a, b) => a - b);
  const result = [];
  const path = [];

  function backtrack(start, remain) {
    // 1. remain === 0 → копію path у result, return.
    // 2. Для i від start: якщо nums[i] > remain — break.
    //    push(nums[i]) → backtrack(i, remain - nums[i]) → pop().
    // TODO
  }

  backtrack(0, target);
  return result;
}

// Спробуйте в консолі: combinationSum([2, 3, 6, 7], 7);
`,
      solution: `function combinationSum(candidates, target) {
  const nums = [...candidates].sort((a, b) => a - b);
  const result = [];
  const path = [];
  function backtrack(start, remain) {
    if (remain === 0) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < nums.length; i++) {
      if (nums[i] > remain) break; // відсортовано → далі лише більші
      path.push(nums[i]);
      backtrack(i, remain - nums[i]); // i, а не i + 1: число можна взяти ще раз
      path.pop();
    }
  }
  backtrack(0, target);
  return result;
}
`,
      hints: [
        'Стан: «скільки лишилось набрати» і «з якого індексу можна брати».',
        'Беріть лише індекси ≥ `start`; для повторного використання рекурсуйте з тим самим `i`.',
        'На відсортованому масиві при `nums[i] > remain` — `break`.'
      ],
      tests: [
        { name: '[2,3,6,7], 7 → [[2,2,3],[7]]', code: 'const norm = r => r.map(c => JSON.stringify([...c].sort((a, b) => a - b))).sort();\nexpect(norm(combinationSum([2, 3, 6, 7], 7))).toEqual(norm([[2, 2, 3], [7]]));' },
        { name: '[2,3,5], 8 → три комбінації', code: 'const norm = r => r.map(c => JSON.stringify([...c].sort((a, b) => a - b))).sort();\nexpect(norm(combinationSum([2, 3, 5], 8))).toEqual(norm([[2, 2, 2, 2], [2, 3, 3], [3, 5]]));' },
        { name: 'немає розв\'язку → []', code: 'expect(combinationSum([2], 1)).toEqual([]);\nexpect(combinationSum([4, 6], 9)).toEqual([]);' },
        { name: 'одне число кілька разів', code: 'expect(combinationSum([1], 3)).toEqual([[1, 1, 1]]);' },
        { name: 'невідсортовані кандидати, без повторів комбінацій', code: 'const r = combinationSum([7, 3, 2], 7);\nconst keys = r.map(c => [...c].sort((a, b) => a - b).join(","));\nexpect(keys.sort()).toEqual(["2,2,3", "7"]);' },
        { name: 'кожна комбінація дає target, не мутує вхід', code: 'const c = [8, 2, 3, 5];\nconst r = combinationSum(c, 16);\nexpect(r.length).toBeGreaterThan(5);\nexpect(r.every(x => x.reduce((s, v) => s + v, 0) === 16)).toBe(true);\nexpect(new Set(r.map(x => [...x].sort((a, b) => a - b).join(","))).size).toBe(r.length);\nexpect(c).toEqual([8, 2, 3, 5]);' }
      ],
      explanation: `
**Складність:** експоненційна, глибина дерева ≤ target / min(candidates).

**Типові помилки:** рекурсія з \`i + 1\` (кожне число лише раз — це Combination Sum II); без \`start\` — дублікати-перестановки; сортування вхідного масиву на місці.

**Що спитають далі:** якщо потрібна лише **кількість** способів — як перейти до DP (Coin Change II)?
`
    },
    {
      id: 'algoadv-generate-parentheses',
      group: 'backtracking',
      type: 'code',
      level: 3,
      title: 'Генерація правильних дужкових послідовностей',
      tags: ['backtracking', 'recursion'],
      description: `
**Завдання.** Поверніть усі правильні дужкові послідовності з \`n\` пар круглих дужок.

**Де трапляється:** одна з найчастіших backtracking-задач на співбесідах.

**Що написати**
- \`generateParenthesis(n)\` → масив рядків; порядок — будь-який

**Приклад**
\`\`\`js
generateParenthesis(3);
// ["((()))", "(()())", "(())()", "()(())", "()()()"]
generateParenthesis(0); // [""]
\`\`\`

**Як це працює:** будуємо лише валідні префікси. Стан: рядок, кількість \`open\` і \`close\`. \`(\` можна, поки \`open < n\`; \`)\` — лише якщо \`close < open\`. Довжина \`2n\` → рядок гарантовано правильний.

**Врахуйте:** \`n = 0\` → \`[""]\`; \`n = 10\` (16 796 рядків) — швидко.
`,
      starter: `function generateParenthesis(n) {
  const result = [];

  function backtrack(current, open, close) {
    // 1. current.length === 2 * n → у result, return.
    // 2. open < n → backtrack(current + '(', open + 1, close).
    // 3. close < open → backtrack(current + ')', open, close + 1).
    // TODO
  }

  backtrack('', 0, 0);
  return result;
}

// Спробуйте в консолі: generateParenthesis(3);
`,
      solution: `function generateParenthesis(n) {
  const result = [];
  function backtrack(current, open, close) {
    if (current.length === 2 * n) {
      result.push(current);
      return;
    }
    // Відкриту можна ставити, поки не вичерпали n
    if (open < n) backtrack(current + '(', open + 1, close);
    // Закриту — лише якщо є незакрита відкрита
    if (close < open) backtrack(current + ')', open, close + 1);
  }
  backtrack('', 0, 0);
  return result;
}
`,
      hints: [
        'Не генеруйте всі 2²ⁿ рядків — будуйте лише валідні префікси.',
        '`(` — якщо `open < n`; `)` — якщо `close < open`.'
      ],
      tests: [
        { name: 'n = 0 → [""]', code: 'expect(generateParenthesis(0)).toEqual([""]);' },
        { name: 'n = 1 → ["()"]', code: 'expect(generateParenthesis(1)).toEqual(["()"]);' },
        { name: 'n = 3 → 5 послідовностей', code: 'expect([...generateParenthesis(3)].sort()).toEqual(["((()))", "(()())", "(())()", "()(())", "()()()"]);' },
        { name: 'усі результати правильні та унікальні (n = 6 → 132)', code: 'const r = generateParenthesis(6);\nexpect(r).toHaveLength(132);\nexpect(new Set(r).size).toBe(132);\nconst valid = s => { let b = 0; for (const ch of s) { b += ch === "(" ? 1 : -1; if (b < 0) return false; } return b === 0; };\nexpect(r.every(s => s.length === 12 && valid(s))).toBe(true);' },
        { name: 'n = 10 → 16796 (числа Каталана) швидко', code: 'const t0 = performance.now();\nexpect(generateParenthesis(10)).toHaveLength(16796);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
      ],
      explanation: `
**Складність:** кількість відповідей — число Каталана Cₙ ≈ 4ⁿ / n^1.5; час O(n·Cₙ), пам'ять O(n).

**Типові помилки:** \`close < n\` замість \`close < open\` (з'являються \`)(\`); забутий \`n = 0\`.

**Що спитають далі:** перевірити правильність рядка з різними дужками (стек)? Порахувати кількість без генерації?
`
    },
    {
      id: 'algoadv-word-search',
      group: 'backtracking',
      type: 'code',
      level: 3,
      title: 'Пошук слова в сітці (Word Search)',
      tags: ['backtracking', 'grid', 'dfs'],
      description: `
**Завдання.** Чи можна скласти слово з сусідніх (по горизонталі/вертикалі) клітинок сітки, використовуючи кожну не більше одного разу?

**Де трапляється:** класика співбесід (backtracking на сітці); ігри-головоломки типу «знайди слово».

**Що написати**
- \`exist(board, word)\` → \`true\` / \`false\`; \`board\` — масив масивів символів, \`word\` — непорожній

**Приклад**
\`\`\`js
const board = [
  ['A', 'B', 'C', 'E'],
  ['S', 'F', 'C', 'S'],
  ['A', 'D', 'E', 'E'],
];
exist(board, 'ABCCED'); // true
exist(board, 'ABCB');   // false — B двічі не можна
\`\`\`

**Як це працює:** \`dfs(r, c, i)\` — «чи можна скласти \`word[i..]\` з клітинки (r, c)». Позначаємо клітинку (\`'#'\`), пробуємо 4 напрямки, **відновлюємо** символ. Відвіданість — лише в межах поточного шляху, тому без відкату не обійтись.

**Врахуйте:** діагоналі не рахуються; після виклику \`board\` має бути незмінним.
`,
      starter: `function exist(board, word) {
  const rows = board.length;
  const cols = rows ? board[0].length : 0;

  function dfs(r, c, i) {
    // 1. i === word.length → true.
    // 2. Вихід за межі або board[r][c] !== word[i] → false.
    // 3. Зберегти символ, поставити '#', спробувати 4 сусідів з i + 1.
    // 4. Відновити символ і повернути результат.
    // TODO
  }

  // 5. Запустити dfs з кожної клітинки.
  // TODO
  return false;
}

// Спробуйте в консолі: exist([['A','B'],['C','D']], 'ABDC');
`,
      solution: `function exist(board, word) {
  const rows = board.length;
  const cols = rows ? board[0].length : 0;

  function dfs(r, c, i) {
    if (i === word.length) return true;
    if (r < 0 || c < 0 || r >= rows || c >= cols) return false;
    if (board[r][c] !== word[i]) return false;
    const saved = board[r][c];
    board[r][c] = '#'; // позначаємо «відвідано» на поточному шляху
    const found =
      dfs(r + 1, c, i + 1) ||
      dfs(r - 1, c, i + 1) ||
      dfs(r, c + 1, i + 1) ||
      dfs(r, c - 1, i + 1);
    board[r][c] = saved; // відкат (unchoose)
    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}
`,
      hints: [
        'Запускайте DFS з кожної клітинки.',
        'Позначте клітинку, спробуйте 4 напрямки для `i + 1`, зніміть позначку.',
        'Відновлюйте символ і тоді, коли слово знайдено (обчисліть `found`, потім відновіть).'
      ],
      tests: [
        { name: 'класичний приклад: ABCCED, SEE → true', code: 'const b = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]];\nexpect(exist(b, "ABCCED")).toBe(true);\nexpect(exist(b, "SEE")).toBe(true);' },
        { name: 'клітинку не можна використати двічі: ABCB → false', code: 'const b = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]];\nexpect(exist(b, "ABCB")).toBe(false);' },
        { name: 'одна клітинка', code: 'expect(exist([["a"]], "a")).toBe(true);\nexpect(exist([["a"]], "b")).toBe(false);\nexpect(exist([["a"]], "aa")).toBe(false);' },
        { name: 'діагональ не рахується', code: 'expect(exist([["a","b"],["c","d"]], "ad")).toBe(false);\nexpect(exist([["a","b"],["c","d"]], "abdc")).toBe(true);' },
        { name: 'потрібен відкат: перший шлях глухий', code: 'const b = [["C","A","A"],["A","A","A"],["B","C","D"]];\nexpect(exist(b, "AAB")).toBe(true);\nexpect(exist([["a","a","b"],["a","a","b"]], "aaaab")).toBe(true);' },
        { name: 'board не змінюється після виклику', code: 'const b = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]];\nconst copy = JSON.stringify(b);\nexist(b, "ABCCED");\nexist(b, "ABCB");\nexpect(JSON.stringify(b)).toBe(copy);' }
      ],
      explanation: `
**Складність:** O(R·C·3ᴸ), L — довжина слова; пам'ять O(L).

**Типові помилки:** глобальний \`visited\` без скидання (клітинка, невдала на одному шляху, підходить на іншому); \`return true\` до відновлення символу; перевірка \`i === word.length\` після перевірки меж.

**Що спитають далі:** Word Search II — багато слів (trie + DFS)? Без мутації сітки?
`
    },
    {
      id: 'algoadv-n-queens',
      group: 'backtracking',
      type: 'code',
      level: 4,
      title: 'N-Queens: кількість розстановок',
      tags: ['backtracking'],
      description: `
**Завдання.** Порахуйте, скількома способами можна розставити \`n\` ферзів на дошці \`n × n\`, щоб жодні два не били один одного.

**Де трапляється:** класика backtracking з відсіканням; на фронтенд-співбесідах рідше, але перевіряє вміння робити O(1)-перевірку конфліктів.

**Що написати**
- \`totalNQueens(n)\` → число розстановок

**Приклад**
\`\`\`js
totalNQueens(4); // 2
totalNQueens(8); // 92
\`\`\`

**Як це працює:** ставимо по одному ферзю в рядок і обираємо стовпець. Конфлікт — той самий стовпець, \`r + c\` (одна діагональ) або \`r - c\` (інша). Три масиви прапорців дають перевірку за O(1); після рекурсії прапорці знімаємо.

**Врахуйте:** \`n = 2, 3\` → 0; \`n = 10\` — швидше за секунду; \`r - c\` від'ємне — зсуньте на \`+ n\`.
`,
      starter: `function totalNQueens(n) {
  const cols = new Array(n).fill(false);
  const diag = new Array(2 * n).fill(false); // індекс r + c
  const anti = new Array(2 * n).fill(false); // індекс r - c + n
  let count = 0;

  function place(row) {
    // 1. row === n → count++, return.
    // 2. Для кожного c: якщо cols[c] / diag[row + c] / anti[row - c + n] зайняті — пропустити.
    // 3. Позначити → place(row + 1) → зняти позначки.
    // TODO
  }

  place(0);
  return count;
}

// Спробуйте в консолі: totalNQueens(4);
`,
      solution: `function totalNQueens(n) {
  const cols = new Array(n).fill(false);
  const diag = new Array(2 * n).fill(false);     // r + c однакове на «/»-діагоналі
  const anti = new Array(2 * n).fill(false);     // r - c + n однакове на «\\»-діагоналі
  let count = 0;

  function place(row) {
    if (row === n) {
      count++;
      return;
    }
    for (let c = 0; c < n; c++) {
      const d = row + c;
      const a = row - c + n;
      if (cols[c] || diag[d] || anti[a]) continue; // O(1) перевірка
      cols[c] = diag[d] = anti[a] = true;
      place(row + 1);
      cols[c] = diag[d] = anti[a] = false;
    }
  }

  place(0);
  return count;
}
`,
      hints: [
        'У кожному рядку рівно один ферзь — backtracking по рядках.',
        'Конфлікт: той самий стовпець, `r + c` або `r - c`. Тримайте три масиви зайнятих значень.'
      ],
      tests: [
        { name: 'n = 1 → 1', code: 'expect(totalNQueens(1)).toBe(1);' },
        { name: 'n = 2 і n = 3 → 0', code: 'expect(totalNQueens(2)).toBe(0);\nexpect(totalNQueens(3)).toBe(0);' },
        { name: 'n = 4 → 2, n = 5 → 10, n = 6 → 4', code: 'expect(totalNQueens(4)).toBe(2);\nexpect(totalNQueens(5)).toBe(10);\nexpect(totalNQueens(6)).toBe(4);' },
        { name: 'n = 8 → 92', code: 'expect(totalNQueens(8)).toBe(92);' },
        { name: 'продуктивність: n = 10 → 724 менш ніж за секунду', code: 'const t0 = performance.now();\nexpect(totalNQueens(10)).toBe(724);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
      ],
      explanation: `
**Складність:** O(n!) у гіршому, реально значно менше завдяки відсіканню; пам'ять O(n).

**Типові помилки:** перевірка конфлікту проходом по всіх ферзях (O(n) замість O(1)); від'ємний індекс \`r - c\`; забутий відкат.

**Що спитають далі:** повернути самі дошки? Бітові маски? Використати симетрію?
`
    },
    // ---------------------------------------------------------------- Вбудований sort і компаратори
    {
      id: 'algoadv-quiz-sort-stable', group: 'sort-builtin', type: 'quiz', level: 2,
      title: 'Стабільне сортування: два проходи',
      tags: ['sorting', 'stability'],
      question: `Що виведе код?
\`\`\`js
const users = [
  { name: 'Cid', age: 30 },
  { name: 'Dan', age: 25 },
  { name: 'Ann', age: 30 },
  { name: 'Bob', age: 25 },
];
const sorted = users
  .toSorted((a, b) => a.name.localeCompare(b.name)) // спершу за ім'ям
  .toSorted((a, b) => a.age - b.age);               // потім за віком

console.log(sorted.map((u) => u.name).join(' '));
\`\`\``,
      options: [
        '`Bob Dan Ann Cid`',
        '`Dan Bob Cid Ann`',
        '`Bob Dan Cid Ann`',
        'Порядок людей одного віку не гарантований — у різних рушіях результат різний'
      ],
      answer: 0,
      why: [
        'Так: сортування стабільне, тож однолітки зберігають порядок з першого проходу — за ім\'ям.',
        'Ні: це порядок вихідного масиву, а другий прохід отримує вже відсортований за ім\'ям масив.',
        'Ні: серед 30-річних після першого проходу Ann стоїть перед Cid, і стабільне сортування цей порядок зберігає.',
        'Ні: з ES2019 стабільність `sort` (і `toSorted`) вимагає специфікація — так поводяться всі сучасні рушії.'
      ],
      hint: 'Що стабільне сортування робить з елементами, які компаратор вважає рівними?',
      explanation: 'Стабільне сортування не міняє місцями елементи з рівним ключем. Тому сортування за кількома ключами можна зробити кількома проходами: спершу за **другорядним** ключем, потім за головним. Частіше пишуть один компаратор: `a.age - b.age || a.name.localeCompare(b.name)` — як у задачі нижче. До ES2019 V8 для довгих масивів використовував нестабільний quicksort, тепер — TimSort.'
    },
    {
      id: 'algoadv-sort-builtin-theory', why: ["Ні: компаратор має повертати число (<0, 0, >0), а не boolean.","Так: за замовчуванням елементи порівнюються як рядки.","Ні: sort мутує масив; без мутації — toSorted.","Ні: random-компаратор дає упереджене перемішування — потрібен Fisher–Yates.","Так: стабільність гарантована з ES2019."],
      group: 'sort-builtin',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Як працює Array.prototype.sort',
      tags: ['sorting'],
      question: 'Розкажіть про Array.prototype.sort: який алгоритм, складність, стабільність, як правильно писати компаратор і які є пастки? Оберіть **усі** правильні твердження.',
      choices: [
        'Компаратор `(a, b) => a > b` коректний: `sort` сам перетворить `true`/`false` на порядок',
        'Без компаратора `[10, 2, 1].sort()` дає `[1, 10, 2]`, бо елементи порівнюються як рядки',
        '`sort` повертає новий відсортований масив, а вихідний масив лишається без змін',
        'Компаратор `() => Math.random() - 0.5` дає рівномірне перемішування масиву',
        'З ES2019 `sort` стабільний: елементи з рівними ключами зберігають відносний порядок',
      ],
      correct: [1, 4],
      hint: 'TimSort, ES2019, рядкове порівняння за замовчуванням, мутація, toSorted.',
      answer: `
**Алгоритм:** специфікація не фіксує алгоритм, але V8 (Chrome, Node) з 2018 року використовує **TimSort** — гібрид merge sort та insertion sort. Він шукає вже відсортовані «прогони» (runs), сортує короткі ділянки вставками і зливає прогони.

**Складність:** O(n log n) у гіршому, **O(n)** на вже відсортованих або майже відсортованих даних; пам'ять O(n).

**Стабільність:** з **ES2019** \`sort\` зобов'язаний бути **стабільним** — елементи з рівними ключами зберігають відносний порядок. Це дозволяє сортувати за кількома ключами послідовними сортуваннями (спочатку за другорядним, потім за головним).

**Компаратор:** \`compare(a, b)\` повертає число: < 0 — \`a\` раніше, > 0 — \`b\` раніше, 0 — рівні. Він має бути узгодженим (той самий результат для тих самих аргументів, транзитивним).

\`\`\`js
nums.sort((a, b) => a - b);                       // числа за зростанням
users.sort((a, b) => a.name.localeCompare(b.name)); // рядки з урахуванням мови
items.sort((a, b) => a.group - b.group || b.price - a.price); // кілька ключів
\`\`\`

**Пастки:**
- Без компаратора — **рядкове** порівняння: \`[10, 2, 1].sort()\` → \`[1, 10, 2]\`.
- Компаратор, що повертає boolean (\`(a, b) => a > b\`), — некоректний: \`false\` → 0, порядок непередбачуваний.
- \`sort\` **мутує** масив і повертає те саме посилання. Для іммутабельності — \`[...arr].sort()\` або \`arr.toSorted()\` (ES2023). Важливо для React-стану.
- \`undefined\` завжди йде в кінець, компаратор для нього не викликається; «дірки» розрідженого масиву — після них.
- \`a - b\` не підходить для рядків і дат-рядків; для великої кількості рядків швидший \`Intl.Collator().compare\`.
- Випадковий компаратор (\`() => Math.random() - 0.5\`) не дає рівномірного перемішування — використовуйте Fisher–Yates.
`,
      keyPoints: [
        'V8 використовує TimSort: O(n log n), O(n) на відсортованих даних',
        'Стабільний з ES2019',
        'За замовчуванням порівнює рядки',
        'Компаратор повертає число (< 0, 0, > 0), не boolean',
        'Мутує масив; toSorted / копія для іммутабельності'
      ],
      followUps: [
        'Як відсортувати за кількома полями?',
        'Чому () => Math.random() - 0.5 — погане перемішування?',
        'Як відсортувати рядки з урахуванням української абетки?'
      ]
    },
    {
      id: 'algoadv-sort-multi-key',
      group: 'sort-builtin',
      type: 'code',
      level: 2,
      title: 'Сортування за кількома ключами',
      tags: ['sorting'],
      description: `
**Завдання.** Напишіть \`sortEmployees(list)\`, що повертає **новий** масив співробітників \`{ id, name, department, salary }\`, відсортований:

**Де трапляється:** таблиці з сортуванням за кількома колонками.

1. за \`department\` — за зростанням (алфавітно);
2. при однаковому відділі — за \`salary\` **за спаданням**;
3. при однаковій зарплаті — за \`name\` за зростанням;
4. якщо й імена однакові — зберегти вихідний порядок (стабільність).

Вхідний масив не мутувати.

\`\`\`js
sortEmployees([
  { id: 1, name: 'Bob', department: 'IT', salary: 100 },
  { id: 2, name: 'Ann', department: 'HR', salary: 90 },
  { id: 3, name: 'Cid', department: 'IT', salary: 120 },
]).map(e => e.id); // [2, 3, 1]
\`\`\`

**Як це працює:** Один компаратор, що порівнює ключі по черзі: якщо перший ключ рівний (0), переходимо до другого, і так далі. Напрям (спадання) — просто поміняти місцями a і b для цього ключа. [...list] — щоб не мутувати вхід.
`,
      starter: `function sortEmployees(list) {
  // 1. Скопіювати масив: [...list]
  // 2. sort з компаратором: department за зростанням
  // 3. при рівності — salary за спаданням, далі name
  // TODO
}
`,
      solution: `function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function sortEmployees(list) {
  // Копія, бо sort мутує. Стабільність sort (ES2019) забезпечує пункт 4.
  return [...list].sort(
    (a, b) =>
      compareStrings(a.department, b.department) ||
      b.salary - a.salary ||
      compareStrings(a.name, b.name)
  );
}
`,
      hints: [
        'Один компаратор може перевіряти ключі по черзі: якщо перший дав 0, переходимо до наступного. Оператор `||` робить це компактно.',
        'Для спадання поміняйте аргументи місцями: `b.salary - a.salary`. Для рядків поверніть -1/0/1 (або `localeCompare`).',
        '`return [...list].sort((a, b) => cmp(a.department, b.department) || b.salary - a.salary || cmp(a.name, b.name));`'
      ],
      tests: [
        { name: 'приклад з умови', code: 'const r = sortEmployees([\n  { id: 1, name: "Bob", department: "IT", salary: 100 },\n  { id: 2, name: "Ann", department: "HR", salary: 90 },\n  { id: 3, name: "Cid", department: "IT", salary: 120 }\n]);\nexpect(r.map(e => e.id)).toEqual([2, 3, 1]);' },
        { name: 'зарплата за спаданням, потім ім\'я за зростанням', code: 'const r = sortEmployees([\n  { id: 1, name: "Zoe", department: "QA", salary: 50 },\n  { id: 2, name: "Max", department: "QA", salary: 70 },\n  { id: 3, name: "Amy", department: "QA", salary: 50 },\n  { id: 4, name: "Kim", department: "Dev", salary: 10 }\n]);\nexpect(r.map(e => e.id)).toEqual([4, 2, 3, 1]);' },
        { name: 'стабільність при повністю однакових ключах', code: 'const r = sortEmployees([\n  { id: 1, name: "Ann", department: "IT", salary: 10 },\n  { id: 2, name: "Bob", department: "HR", salary: 10 },\n  { id: 3, name: "Ann", department: "IT", salary: 10 },\n  { id: 4, name: "Ann", department: "IT", salary: 10 }\n]);\nexpect(r.map(e => e.id)).toEqual([2, 1, 3, 4]);' },
        { name: 'не мутує вхідний масив і повертає новий', code: 'const list = [\n  { id: 1, name: "B", department: "Z", salary: 1 },\n  { id: 2, name: "A", department: "A", salary: 1 }\n];\nconst r = sortEmployees(list);\nexpect(r).not.toBe(list);\nexpect(list.map(e => e.id)).toEqual([1, 2]);\nexpect(r.map(e => e.id)).toEqual([2, 1]);' },
        { name: 'порожній масив і один елемент', code: 'expect(sortEmployees([])).toEqual([]);\nconst one = { id: 7, name: "X", department: "Y", salary: 0 };\nexpect(sortEmployees([one])).toEqual([one]);' }
      ],
      explanation: `
**Патерн:** складений компаратор (composite comparator) + стабільне сортування.

**Ідея:** компаратор послідовно порівнює ключі; перший ненульовий результат вирішує порядок. \`a || b\` повертає \`b\`, лише якщо \`a === 0\` — саме те, що потрібно. Спадання — заміна \`a\` і \`b\` місцями. Повністю рівні елементи лишаються у вихідному порядку завдяки стабільності \`sort\` (гарантується з ES2019).

**Складність:** O(n log n · k), де k — кількість ключів у компараторі; пам'ять O(n) на копію.

**Альтернатива:** кілька стабільних сортувань — від найменш важливого ключа до найважливішого (name → salary → department). Працює саме через стабільність, але робить k проходів.

**Типові помилки:**
- \`list.sort(...)\` без копії — мутує вхідні дані (у React — стан не оновиться/зламається).
- \`a.name > b.name\` як результат компаратора (boolean) — некоректно.
- \`a.department - b.department\` для рядків → \`NaN\`.
- \`localeCompare\` враховує локаль і регістр по-іншому, ніж \`<\` — для українських назв це перевага (\`'є'\`, \`'ї'\`), для технічних ключів — непередбачуваність. Для великих масивів — \`new Intl.Collator('uk').compare\`.

**Що спитають далі:** як зробити універсальний \`sortBy(list, [{ key, dir }])\`? Як сортувати \`null\`/\`undefined\` значення в кінець? Чому до ES2019 цей код міг поводитись по-різному в браузерах?
`
    },
    // ---------------------------------------------------------------- Алгоритми сортування
    {
      id: 'algoadv-quiz-insertion-best', why: ["Ні: на відсортованих даних внутрішній цикл не виконується.","Ні: вставка лінійна, без бінарного пошуку.","Так: один прохід без зсувів.","Ні: на випадкових даних — O(n²)."],
      group: 'sort-algos',
      type: 'quiz',
      level: 2,
      title: 'Insertion sort: найкращий випадок',
      tags: ['sorting', 'big-o'],
      question: `
Яка складність insertion sort у **найкращому** випадку і на яких даних він досягається?

\`\`\`js
function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const x = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > x) { a[j + 1] = a[j]; j--; }
    a[j + 1] = x;
  }
  return a;
}
\`\`\`
`,
      options: [
        'O(n²) — завжди, бо два вкладені цикли',
        'O(log n) — на відсортованому масиві, бо вставка схожа на бінарний пошук',
        'O(n) — на вже відсортованому масиві',
        'O(n log n) — на випадковому масиві'
      ],
      answer: 2,
      hint: 'Скільки ітерацій робить внутрішній `while`, якщо `a[i - 1] <= a[i]` для всіх i?',
      explanation: `
На відсортованому масиві умова \`a[j] > x\` одразу хибна, тож внутрішній цикл робить 0 ітерацій → лише зовнішній прохід, **O(n)**. На майже відсортованому (k інверсій) — O(n + k).

- «Два цикли → завжди O(n²)» — помилка: кількість ітерацій внутрішнього циклу залежить від даних. O(n²) — лише середній і гірший (обернений масив) випадки.
- O(log n) неможливо: треба хоча б раз переглянути кожен елемент. Бінарний пошук місця вставки зменшує кількість порівнянь, але не зсувів.
- На випадкових даних insertion sort — O(n²), а не O(n log n).

Саме тому TimSort сортує короткі ділянки (до ~32–64 елементів) вставками.
`
    },
    {
      id: 'algoadv-quiz-stable-sorts', why: ["Так: міняє лише сусідні елементи, коли строго більше.","Ні: далекий обмін ламає порядок рівних.","Так: вставка не перестрибує рівні елементи.","Так: при злитті з рівних береться лівий.","Ні: partition міняє далекі елементи.","Ні: побудова купи ламає порядок рівних."],
      group: 'sort-algos',
      type: 'quiz',
      level: 2,
      title: 'Які алгоритми сортування стабільні?',
      tags: ['sorting'],
      question: 'Оберіть **усі** алгоритми, які у класичній реалізації є **стабільними** (не змінюють відносний порядок рівних елементів):',
      options: [
        'Bubble sort',
        'Selection sort',
        'Insertion sort',
        'Merge sort',
        'Quick sort (in-place, Lomuto/Hoare)',
        'Heap sort'
      ],
      answer: [0, 2, 3],
      hint: 'Нестабільність виникає, коли елемент «перестрибує» через рівні йому елементи на велику відстань.',
      explanation: `
| Алгоритм | Час (сер./гірш.) | Пам'ять | Стабільний |
|---|---|---|---|
| Bubble | O(n²) / O(n²) | O(1) | так — міняє лише сусідів і лише при \`>\` |
| Selection | O(n²) / O(n²) | O(1) | **ні** — swap мінімуму з далекою позицією |
| Insertion | O(n²) / O(n²), найкращий O(n) | O(1) | так — зсуває лише строго більші |
| Merge | O(n log n) / O(n log n) | O(n) | так, якщо при рівності брати з лівої половини (\`<=\`) |
| Quick | O(n log n) / O(n²) | O(log n) | **ні** — partition міняє далекі елементи |
| Heap | O(n log n) / O(n log n) | O(1) | **ні** — перебудова купи переставляє рівні |

Приклад нестабільності selection sort: \`[2a, 2b, 1]\` → мінімум \`1\` міняється з \`2a\` → \`[1, 2b, 2a]\`.
`
    },
    {
      id: 'algoadv-merge-sort',
      group: 'sort-algos',
      type: 'code',
      level: 2,
      title: 'Реалізуйте merge sort',
      tags: ['sorting', 'divide-and-conquer', 'recursion'],
      description: `
**Завдання.** Реалізуйте \`mergeSort(arr, compare = (a, b) => a - b)\` — **стабільне** сортування злиттям.

**Де трапляється:** класика співбесід; так сортує TimSort частинами.

- Повертає **новий** відсортований масив, вхідний не мутує.
- \`compare\` працює як у \`Array.prototype.sort\`.
- Не використовуйте \`Array.prototype.sort\` / \`toSorted\`.
- 100 000 елементів мають сортуватися швидше ніж за секунду.

\`\`\`js
mergeSort([5, 2, 4, 6, 1, 3]);           // [1, 2, 3, 4, 5, 6]
mergeSort([3, 1, 2], (a, b) => b - a);   // [3, 2, 1]
\`\`\`

**Як це працює:** Розділяй і володарюй: ділимо масив навпіл, рекурсивно сортуємо половини і зливаємо двома вказівниками. При рівності беремо елемент з лівої половини — так сортування стабільне. O(n log n) завжди.
`,
      starter: `function mergeSort(arr, compare = (a, b) => a - b) {
  // 1. Довжина <= 1 → повернути копію
  // 2. Поділити навпіл і рекурсивно відсортувати обидві половини
  // 3. Злити двома вказівниками (при рівності — з лівої)
  // TODO
}
`,
      solution: `function mergeSort(arr, compare = (a, b) => a - b) {
  if (arr.length <= 1) return arr.slice();
  const mid = arr.length >> 1;
  const left = mergeSort(arr.slice(0, mid), compare);
  const right = mergeSort(arr.slice(mid), compare);
  return merge(left, right, compare);
}

function merge(left, right, compare) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    // <= 0: при рівності беремо з лівої половини — це і дає стабільність
    if (compare(left[i], right[j]) <= 0) result.push(left[i++]);
    else result.push(right[j++]);
  }
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}
`,
      hints: [
        'Divide & conquer: розділіть масив навпіл, відсортуйте кожну половину рекурсивно, злийте дві відсортовані половини.',
        'Злиття — два вказівники: порівнюйте `left[i]` і `right[j]`, менший — у результат. Потім дописуйте залишок. Базовий випадок — масив довжини ≤ 1.',
        'Для стабільності при `compare(left[i], right[j]) === 0` беріть елемент з **лівої** половини (умова `<= 0`).'
      ],
      tests: [
        { name: 'порожній і одноелементний масив', code: 'expect(mergeSort([])).toEqual([]);\nexpect(mergeSort([42])).toEqual([42]);' },
        { name: 'сортує числа за зростанням', code: 'expect(mergeSort([5, 2, 4, 6, 1, 3])).toEqual([1, 2, 3, 4, 5, 6]);' },
        { name: 'від\'ємні числа та дублікати', code: 'expect(mergeSort([3, -1, 3, 0, -5, 3])).toEqual([-5, -1, 0, 3, 3, 3]);' },
        { name: 'не мутує вхід і повертає новий масив', code: 'const a = [3, 1, 2];\nconst r = mergeSort(a);\nexpect(r).toEqual([1, 2, 3]);\nexpect(a).toEqual([3, 1, 2]);\nexpect(r).not.toBe(a);' },
        { name: 'кастомний компаратор і стабільність', code: 'expect(mergeSort([1, 3, 2], (a, b) => b - a)).toEqual([3, 2, 1]);\nconst items = [{ k: 2, id: "a" }, { k: 1, id: "b" }, { k: 2, id: "c" }, { k: 1, id: "d" }, { k: 2, id: "e" }];\nexpect(mergeSort(items, (x, y) => x.k - y.k).map(x => x.id)).toEqual(["b", "d", "a", "c", "e"]);' },
        { name: '100 000 елементів без Array.prototype.sort менш ніж за секунду', code: `let s = 12345;
const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0);
const a = Array.from({ length: 100000 }, () => (rnd() % 1000000) - 500000);
const expected = [...a].sort((x, y) => x - y);
const origSort = Array.prototype.sort;
const origToSorted = Array.prototype.toSorted;
Array.prototype.sort = function () { throw new Error('Array.prototype.sort заборонено'); };
if (origToSorted) Array.prototype.toSorted = Array.prototype.sort;
let r;
const t0 = performance.now();
try {
  r = mergeSort(a);
} finally {
  Array.prototype.sort = origSort;
  if (origToSorted) Array.prototype.toSorted = origToSorted;
}
const ms = performance.now() - t0;
expect(r).toEqual(expected);
expect(ms).toBeLessThan(1000);` }
      ],
      explanation: `
**Патерн:** divide & conquer (розділяй і володарюй) + злиття двома вказівниками.

**Ідея:**
1. **Divide:** ділимо масив навпіл.
2. **Conquer:** рекурсивно сортуємо половини (база — довжина ≤ 1).
3. **Combine:** зливаємо дві відсортовані половини за O(n) двома вказівниками.

**Складність:** глибина рекурсії log n, на кожному рівні злиття сумарно O(n) → **O(n log n)** у будь-якому випадку. Пам'ять **O(n)** (допоміжні масиви) + O(log n) стек.

**Brute force vs оптимум:** bubble/insertion — O(n²): для 10⁵ елементів ~5·10⁹ операцій (секунди) проти ~1.7·10⁶ у merge sort.

**Чому стабільний:** при рівних елементах беремо лівий, а він у вихідному масиві стояв раніше.

**Типові помилки:**
- \`<\` замість \`<= 0\` у злитті → втрата стабільності.
- \`arr.shift()\` у злитті — O(n) на кожен крок, загалом O(n² log n).
- Забути дописати залишок однієї з половин.
- \`Math.floor(arr.length / 2)\` без базового випадку для довжини 1 → нескінченна рекурсія.

**Що спитають далі:** як зробити bottom-up (ітеративний) merge sort? Як злити k відсортованих масивів (купа)? Як порахувати кількість інверсій модифікацією злиття? Чому TimSort швидший на реальних даних?
`
    },
    {
      id: 'algoadv-quick-sort',
      group: 'sort-algos',
      type: 'code',
      level: 3,
      title: 'Реалізуйте quick sort (in-place, partition)',
      tags: ['sorting', 'divide-and-conquer'],
      description: `
**Завдання.** Реалізуйте \`quickSort(arr)\`, що сортує масив чисел **на місці** (in-place) за зростанням і повертає **той самий** масив.

**Де трапляється:** класика співбесід про partition і складність.

Вимоги:
- не використовувати \`Array.prototype.sort\`;
- **уже відсортований** масив і масив з **однакових** елементів (по 100 000) не повинні деградувати до O(n²) чи переповнювати стек;
- 100 000 випадкових чисел — менш ніж за секунду.

\`\`\`js
const a = [3, 6, 1, 8, 2];
quickSort(a) === a; // true
a;                  // [1, 2, 3, 6, 8]
\`\`\`

**Як це працює:** Обираємо опорний елемент (pivot) і розбиваємо відрізок: менші ліворуч, більші праворуч (partition). Потім рекурсивно сортуємо обидві частини. В середньому O(n log n), найгірше — O(n²) при поганому pivot.
`,
      starter: `function quickSort(arr) {
  // 1. Функція sortRange(lo, hi): поки lo < hi
  // 2. partition: обрати pivot, менші — ліворуч, більші — праворуч
  // 3. Рекурсивно відсортувати обидві частини
  // TODO
  return arr;
}
`,
      solution: `function quickSort(arr) {
  sortRange(arr, 0, arr.length - 1);
  return arr;
}

function sortRange(arr, lo, hi) {
  while (lo < hi) {
    const p = partition(arr, lo, hi);
    // Рекурсія в меншу частину, цикл — у більшу: глибина стеку O(log n) гарантовано
    if (p - lo < hi - p) {
      sortRange(arr, lo, p);
      lo = p + 1;
    } else {
      sortRange(arr, p + 1, hi);
      hi = p;
    }
  }
}

// Схема Хоара з випадковим pivot: повертає j, таке що arr[lo..j] <= pivot <= arr[j+1..hi]
function partition(arr, lo, hi) {
  const r = lo + Math.floor(Math.random() * (hi - lo + 1));
  swap(arr, lo, r); // pivot на початок — гарантує lo <= j < hi
  const pivot = arr[lo];
  let i = lo - 1;
  let j = hi + 1;
  while (true) {
    do i++; while (arr[i] < pivot);
    do j--; while (arr[j] > pivot);
    if (i >= j) return j;
    swap(arr, i, j);
  }
}

function swap(arr, i, j) {
  const t = arr[i];
  arr[i] = arr[j];
  arr[j] = t;
}
`,
      hints: [
        'Quick sort: обрати опорний елемент (pivot), переставити масив так, щоб менші були зліва, більші — справа (partition), і рекурсивно відсортувати частини.',
        'Pivot = останній елемент на відсортованому масиві дає O(n²) і глибину рекурсії n. Обирайте **випадковий** pivot. Для дублікатів використайте схему Хоара (два вказівники назустріч, зупинка на рівних pivot) або 3-way partition.',
        'Щоб стек гарантовано був O(log n), рекурсуйте в меншу частину, а більшу обробляйте циклом `while (lo < hi)`.'
      ],
      tests: [
        { name: 'повертає той самий масив (in-place)', code: 'const a = [3, 6, 1, 8, 2];\nconst r = quickSort(a);\nexpect(r).toBe(a);\nexpect(a).toEqual([1, 2, 3, 6, 8]);' },
        { name: 'порожній, один і два елементи', code: 'expect(quickSort([])).toEqual([]);\nexpect(quickSort([1])).toEqual([1]);\nexpect(quickSort([2, 1])).toEqual([1, 2]);' },
        { name: 'від\'ємні числа та дублікати', code: 'expect(quickSort([0, -2, 5, -2, 5, 0, 3])).toEqual([-2, -2, 0, 0, 3, 5, 5]);' },
        { name: 'відповідає еталону на випадкових даних (без sort)', code: `let s = 7;
const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0);
const a = Array.from({ length: 2000 }, () => (rnd() % 200) - 100);
const expected = [...a].sort((x, y) => x - y);
const origSort = Array.prototype.sort;
Array.prototype.sort = function () { throw new Error('Array.prototype.sort заборонено'); };
try { quickSort(a); } finally { Array.prototype.sort = origSort; }
expect(a).toEqual(expected);` },
        { name: '100 000 випадкових чисел менш ніж за секунду', code: `let s = 99;
const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0);
const a = Array.from({ length: 100000 }, () => rnd() % 1000000);
const expected = [...a].sort((x, y) => x - y);
const t0 = performance.now();
quickSort(a);
const ms = performance.now() - t0;
expect(a).toEqual(expected);
expect(ms).toBeLessThan(1000);` },
        { name: 'відсортований і однаковий масиви по 100 000 без деградації', code: `const sorted = Array.from({ length: 100000 }, (_, i) => i);
const same = new Array(100000).fill(7);
const t0 = performance.now();
quickSort(sorted);
quickSort(same);
const ms = performance.now() - t0;
expect(sorted[0]).toBe(0);
expect(sorted[99999]).toBe(99999);
expect(sorted.every((x, i) => x === i)).toBe(true);
expect(same.every(x => x === 7)).toBe(true);
expect(ms).toBeLessThan(1000);` }
      ],
      explanation: `
**Патерн:** divide & conquer з **partition** (розбиття навколо опорного елемента).

**Ідея:**
1. Обираємо pivot (випадково).
2. **Partition (Хоар):** вказівник \`i\` йде зліва, поки \`arr[i] < pivot\`, \`j\` — справа, поки \`arr[j] > pivot\`; міняємо їх місцями, поки не зустрінуться. Після цього ліва частина ≤ pivot ≤ права.
3. Рекурсивно сортуємо обидві частини (меншу — рекурсією, більшу — циклом).

**Складність:** O(n log n) у середньому; O(n²) у гіршому (якщо pivot щоразу крайній), але з випадковим pivot ймовірність мізерна. Пам'ять O(log n) — стек. **Нестабільний.**

**Чому не Lomuto з останнім pivot:**
- На відсортованому масиві pivot завжди максимум → розбиття n−1 / 0 → O(n²) і глибина рекурсії n → \`RangeError\` при 10⁵.
- На масиві однакових елементів Lomuto (\`<= pivot\` в одну сторону) теж дає O(n²). Схема Хоара зупиняється на рівних pivot з обох боків і ділить такий масив навпіл. Альтернатива — **3-way partition** (Dutch national flag): \`< pivot | == pivot | > pivot\`.

**Quick sort vs merge sort:** quick sort in-place (O(log n) пам'яті) і зазвичай швидший через кеш-локальність; merge sort стабільний і гарантує O(n log n).

**Типові помилки:** pivot = \`arr[hi]\` у схемі Хоара (можливий нескінченний цикл, бо \`j\` може дорівнювати \`hi\`); рекурсія в \`[lo, p - 1]\` для Хоара (там pivot не на своєму місці — треба \`[lo, p]\` і \`[p + 1, hi]\`); версія «\`[...left, pivot, ...right]\` з \`filter\`» — не in-place, O(n) пам'яті на рівень.

**Що спитають далі:** як знайти k-й елемент за O(n) (quickselect)? Що таке introsort? Чому V8 відмовився від quick sort на користь TimSort?
`
    },
    {
      id: 'algoadv-counting-sort',
      group: 'sort-algos',
      type: 'code',
      level: 2,
      title: 'Counting sort: сортування за O(n + k)',
      tags: ['sorting'],
      description: `
**Завдання.** Реалізуйте \`countingSort(arr)\` для масиву **цілих** чисел (можуть бути від'ємні), де діапазон \`max - min\` не перевищує 10⁶. Поверніть **новий** відсортований масив, не використовуючи \`Array.prototype.sort\` і порівняльні сортування.

**Де трапляється:** сортування оцінок, віку, малих діапазонів за O(n).

\`\`\`js
countingSort([4, 2, -1, 2, 0]); // [-1, 0, 2, 2, 4]
\`\`\`

**Як це працює:** Знаходимо min і max, рахуємо кількість кожного значення в масиві лічильників довжини max − min + 1, потім виписуємо значення по порядку стільки разів, скільки вони зустрілись. O(n + k) без порівнянь.
`,
      starter: `function countingSort(arr) {
  // 1. Порожній масив → []
  // 2. Знайти min і max, масив лічильників довжини max − min + 1
  // 3. Порахувати, потім виписати значення по порядку
  // TODO
}
`,
      solution: `function countingSort(arr) {
  if (arr.length === 0) return [];
  let min = arr[0];
  let max = arr[0];
  for (const x of arr) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  // count[v - min] — скільки разів зустрілося значення v (зсув на min для від'ємних)
  const count = new Array(max - min + 1).fill(0);
  for (const x of arr) count[x - min]++;
  const result = new Array(arr.length);
  let k = 0;
  for (let v = 0; v < count.length; v++) {
    for (let c = count[v]; c > 0; c--) result[k++] = v + min;
  }
  return result;
}
`,
      hints: [
        'Порівняльні сортування не можуть бути швидшими за O(n log n). Але якщо значення — цілі в малому діапазоні, їх можна просто **порахувати**.',
        'Знайдіть `min` і `max`, створіть масив лічильників довжини `max - min + 1`, збільшуйте `count[x - min]`.',
        'Пройдіть по лічильниках від меншого значення до більшого і випишіть кожне значення `count[v]` разів.'
      ],
      tests: [
        { name: 'порожній масив і один елемент', code: 'expect(countingSort([])).toEqual([]);\nexpect(countingSort([5])).toEqual([5]);' },
        { name: 'сортує з дублікатами', code: 'expect(countingSort([3, 1, 2, 3, 1, 0])).toEqual([0, 1, 1, 2, 3, 3]);' },
        { name: 'від\'ємні числа', code: 'expect(countingSort([4, 2, -1, 2, 0, -7])).toEqual([-7, -1, 0, 2, 2, 4]);' },
        { name: 'не мутує вхідний масив', code: 'const a = [2, 1];\nconst r = countingSort(a);\nexpect(r).toEqual([1, 2]);\nexpect(a).toEqual([2, 1]);' },
        { name: '200 000 чисел без sort швидко', code: `let s = 3;
const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0);
const a = Array.from({ length: 200000 }, () => (rnd() % 1001) - 500);
const expected = [...a].sort((x, y) => x - y);
const origSort = Array.prototype.sort;
Array.prototype.sort = function () { throw new Error('Array.prototype.sort заборонено'); };
let r;
const t0 = performance.now();
try { r = countingSort(a); } finally { Array.prototype.sort = origSort; }
const ms = performance.now() - t0;
expect(r).toEqual(expected);
expect(ms).toBeLessThan(1000);` }
      ],
      explanation: `
**Патерн:** сортування підрахунком (counting sort) — **непорівняльне** сортування.

**Ідея:**
1. Знаходимо діапазон \`[min, max]\`.
2. Рахуємо, скільки разів зустрілося кожне значення (індекс = значення − min).
3. Проходимо лічильники по зростанню і відтворюємо масив.

**Складність:** **O(n + k)** часу і O(k) додаткової пам'яті, де k = max − min + 1. Вигідно, коли k = O(n); при k ≫ n (наприклад, \`[0, 10⁹]\`) — гірше за O(n log n) і їсть пам'ять.

**Чому швидше за n log n:** нижня межа Ω(n log n) діє лише для **порівняльних** сортувань. Counting sort використовує значення як індекс.

**Стабільна версія** (для сортування об'єктів за ключем): префіксні суми по \`count\` → позиції, і прохід по вхідному масиву **з кінця**. На цьому побудований **radix sort** (сортування за розрядами).

**Типові помилки:** забути зсув на \`min\` (від'ємні індекси); \`new Array(max + 1)\` при великому \`max\`; використання об'єкта замість масиву з подальшим \`Object.keys\` (ключі-рядки, від'ємні йдуть не за порядком).

**Що спитають далі:** як зробити стабільний counting sort для об'єктів? Що таке radix sort і bucket sort? Коли counting sort — погана ідея?
`
    },
    {
      id: 'algoadv-quickselect',
      group: 'sort-algos',
      type: 'code',
      level: 4,
      title: 'K-й найбільший елемент (quickselect)',
      tags: ['sorting', 'quickselect', 'divide-and-conquer'],
      description: `
**Завдання.** Напишіть \`findKthLargest(nums, k)\` — k-й найбільший елемент масиву (у відсортованому за спаданням порядку, дублікати рахуються). \`1 ≤ k ≤ nums.length\`.

**Де трапляється:** топ-k елементів без повного сортування.

Вимоги:
- **не** використовувати \`Array.prototype.sort\` (очікується quickselect із середньою складністю O(n) або купа O(n log k));
- вхідний масив не мутувати;
- 100 000 елементів, зокрема всі однакові, — менш ніж за секунду.

\`\`\`js
findKthLargest([3, 2, 1, 5, 6, 4], 2);          // 5
findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4); // 4
\`\`\`

**Як це працює:** Як quick sort, але після partition рекурсія йде лише в ту частину, де лежить потрібний індекс (n − k у порядку зростання). У середньому O(n).
`,
      starter: `function findKthLargest(nums, k) {
  // 1. Скопіювати масив; цільовий індекс = length − k
  // 2. partition відрізка [lo, hi]
  // 3. Звузити пошук до частини з цільовим індексом
  // TODO
}
`,
      solution: `function findKthLargest(nums, k) {
  const a = nums.slice(); // не мутуємо вхід
  const target = a.length - k; // індекс у порядку зростання
  let lo = 0;
  let hi = a.length - 1;
  while (lo <= hi) {
    const pivot = a[lo + Math.floor(Math.random() * (hi - lo + 1))];
    // 3-way partition: [lo, lt) < pivot, [lt, gt] === pivot, (gt, hi] > pivot
    let lt = lo;
    let gt = hi;
    let i = lo;
    while (i <= gt) {
      if (a[i] < pivot) swap(a, lt++, i++);
      else if (a[i] > pivot) swap(a, i, gt--);
      else i++;
    }
    if (target < lt) hi = lt - 1;      // шукаємо лише в лівій частині
    else if (target > gt) lo = gt + 1; // або лише в правій
    else return a[target];             // потрапили в блок рівних pivot
  }
}

function swap(a, i, j) {
  const t = a[i];
  a[i] = a[j];
  a[j] = t;
}
`,
      hints: [
        'k-й найбільший — це елемент з індексом `n - k` у відсортованому за зростанням масиві. Повне сортування не потрібне.',
        'Quickselect: partition навколо випадкового pivot, як у quick sort, але далі йдемо лише в ту частину, де лежить потрібний індекс. Середня робота n + n/2 + n/4 + … = O(n).',
        'Масив з однакових елементів зламає Lomuto (O(n²)). Використайте 3-way partition: `< pivot`, `=== pivot`, `> pivot` — якщо цільовий індекс у середньому блоці, відповідь знайдена.'
      ],
      tests: [
        { name: 'базові приклади', code: 'expect(findKthLargest([3, 2, 1, 5, 6, 4], 2)).toBe(5);\nexpect(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)).toBe(4);' },
        { name: 'один елемент', code: 'expect(findKthLargest([1], 1)).toBe(1);' },
        { name: 'k = 1 — максимум, k = n — мінімум', code: 'expect(findKthLargest([7, -2, 9, 4], 1)).toBe(9);\nexpect(findKthLargest([7, -2, 9, 4], 4)).toBe(-2);' },
        { name: 'від\'ємні та дублікати', code: 'expect(findKthLargest([-1, -5, -3, -1], 2)).toBe(-1);\nexpect(findKthLargest([2, 2, 2, 1], 3)).toBe(2);\nexpect(findKthLargest([2, 2, 2, 1], 4)).toBe(1);' },
        { name: 'не мутує вхідний масив', code: 'const a = [5, 1, 4, 2, 3];\nexpect(findKthLargest(a, 2)).toBe(4);\nexpect(a).toEqual([5, 1, 4, 2, 3]);' },
        { name: '100 000 елементів (випадкові й однакові) без sort', code: `let s = 2024;
const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0);
const a = Array.from({ length: 100000 }, () => rnd() % 1000000);
const expected = [...a].sort((x, y) => y - x)[49999];
const same = new Array(100000).fill(3);
const origSort = Array.prototype.sort;
Array.prototype.sort = function () { throw new Error('Array.prototype.sort заборонено'); };
let r1, r2;
const t0 = performance.now();
try {
  r1 = findKthLargest(a, 50000);
  r2 = findKthLargest(same, 777);
} finally {
  Array.prototype.sort = origSort;
}
const ms = performance.now() - t0;
expect(r1).toBe(expected);
expect(r2).toBe(3);
expect(ms).toBeLessThan(1000);` }
      ],
      explanation: `
**Патерн:** quickselect (алгоритм Хоара для порядкових статистик) — partition без повного сортування.

**Ідея:**
1. k-й найбільший = елемент на позиції \`target = n − k\` після сортування за зростанням.
2. Розбиваємо масив навколо випадкового pivot на три блоки: \`< pivot\`, \`= pivot\`, \`> pivot\`.
3. Якщо \`target\` у лівому блоці — продовжуємо лише там; у правому — лише там; у середньому — відповідь \`pivot\`.

**Складність:** у середньому n + n/2 + n/4 + … = **O(n)**; у гіршому O(n²) (з випадковим pivot — вкрай малоймовірно; детерміновано O(n) дає median of medians). Пам'ять O(n) на копію (O(1), якщо дозволено мутувати).

| Підхід | Час | Пам'ять |
|---|---|---|
| Сортування | O(n log n) | O(n) |
| Min-heap розміру k | O(n log k) | O(k) |
| Quickselect | O(n) сер. | O(1) / O(n) копія |

Купа краща, коли дані — потік (не вміщуються в пам'ять) або k малий; quickselect — коли весь масив у пам'яті.

**Типові помилки:**
- 2-way Lomuto на масиві однакових елементів → O(n²) (10¹⁰ операцій для 10⁵).
- Плутанина «k-й найбільший» з індексом \`k - 1\` у масиві за зростанням.
- Рекурсія в обидві половини (це вже quick sort, O(n log n)).

**Що спитають далі:** top-k найчастіших елементів? Медіана потоку чисел (дві купи)? Що таке median of medians і навіщо він?
`
    },
    // ---------------------------------------------------------------- Бінарний пошук
    {
      id: 'algoadv-binary-search',
      group: 'binary-search',
      type: 'code',
      level: 1,
      interview: true,
      title: 'Класичний бінарний пошук',
      tags: ['binary-search'],
      description: `
**Завдання.** Напишіть \`binarySearch(arr, target)\` — повертає індекс \`target\` у **відсортованому за зростанням** масиві **різних** чисел або \`-1\`, якщо його немає. Складність має бути O(log n): \`indexOf\` / \`includes\` / лінійний цикл не пройдуть тест продуктивності.

**Де трапляється:** пошук у відсортованих даних, git bisect.

\`\`\`js
binarySearch([-1, 0, 3, 5, 9, 12], 9); // 4
binarySearch([-1, 0, 3, 5, 9, 12], 2); // -1
\`\`\`

**Як це працює:** Тримаємо відрізок [lo, hi], де може бути відповідь. Беремо середину: дорівнює — знайшли; менша за target — відкидаємо ліву половину, більша — праву. Кожен крок ділить відрізок навпіл: O(log n).
`,
      starter: `function binarySearch(arr, target) {
  // 1. lo = 0, hi = length − 1
  // 2. Поки lo <= hi: mid; рівний → mid; менший → lo = mid + 1; інакше hi = mid − 1
  // 3. Не знайшли → −1
  // TODO
}
`,
      solution: `function binarySearch(arr, target) {
  let lo = 0;
  let hi = arr.length - 1; // шукаємо на відрізку [lo, hi] включно
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
`,
      hints: [
        'Масив відсортований: порівнявши `target` із середнім елементом, можна відкинути половину масиву.',
        'Тримайте межі `lo = 0`, `hi = n - 1`. Поки `lo <= hi`: `mid` — середина; якщо `arr[mid] < target`, шукайте праворуч (`lo = mid + 1`), інакше ліворуч (`hi = mid - 1`).',
        'Не забудьте `+ 1` / `- 1` при зсуві меж — інакше можливий нескінченний цикл.'
      ],
      tests: [
        { name: 'знаходить елемент', code: 'expect(binarySearch([-1, 0, 3, 5, 9, 12], 9)).toBe(4);\nexpect(binarySearch([-1, 0, 3, 5, 9, 12], -1)).toBe(0);\nexpect(binarySearch([-1, 0, 3, 5, 9, 12], 12)).toBe(5);' },
        { name: 'відсутній елемент → -1', code: 'expect(binarySearch([-1, 0, 3, 5, 9, 12], 2)).toBe(-1);\nexpect(binarySearch([-1, 0, 3, 5, 9, 12], 100)).toBe(-1);\nexpect(binarySearch([-1, 0, 3, 5, 9, 12], -50)).toBe(-1);' },
        { name: 'порожній масив → -1', code: 'expect(binarySearch([], 1)).toBe(-1);' },
        { name: 'один елемент', code: 'expect(binarySearch([5], 5)).toBe(0);\nexpect(binarySearch([5], 4)).toBe(-1);' },
        { name: 'кожен елемент масиву знаходиться', code: 'const arr = [-7, -3, 0, 2, 8, 11, 15, 20];\narr.forEach((x, i) => expect(binarySearch(arr, x)).toBe(i));' },
        { name: 'продуктивність: 100 000 пошуків у масиві з 100 000 елементів', code: `const n = 100000;
const arr = Array.from({ length: n }, (_, i) => i * 2);
let ok = true;
const t0 = performance.now();
for (let i = 0; i < n; i++) {
  const t = i * 2 + (i % 2); // парні i — є в масиві, непарні — ні
  if (binarySearch(arr, t) !== (i % 2 === 0 ? i : -1)) { ok = false; break; }
}
const ms = performance.now() - t0;
expect(ok).toBe(true);
expect(ms).toBeLessThan(1000);` }
      ],
      explanation: `
**Патерн:** бінарний пошук (binary search) — відкидання половини простору пошуку на кожному кроці.

**Ідея:**
1. Інваріант: якщо \`target\` є, він лежить на відрізку \`[lo, hi]\`.
2. Порівнюємо з \`arr[mid]\`: рівний — знайшли; менший — шукаємо праворуч; більший — ліворуч.
3. Коли \`lo > hi\`, відрізок порожній → \`-1\`.

**Складність:** **O(log n)** часу (10⁶ елементів — ~20 кроків), O(1) пам'яті.

**Brute force vs оптимум:** \`indexOf\` — O(n) на запит; 10⁵ запитів по 10⁵ елементів — ~5·10⁹ порівнянь проти ~1.7·10⁶.

**Типові помилки:**
- \`while (lo < hi)\` з межами \`[lo, hi]\` — пропускає останній кандидат.
- \`lo = mid\` / \`hi = mid\` без ±1 у включній версії → нескінченний цикл.
- \`(lo + hi) / 2\` без \`Math.floor\` → дробовий індекс. Переповнення \`lo + hi\` (класика Java/C++) у JS не страшне для розумних довжин, але \`lo + ((hi - lo) >> 1)\` — звичка, яку цінують.
- Бінарний пошук на невідсортованих даних.

**Що спитають далі:** знайти першу/останню позицію при дублікатах? Позицію вставки? Пошук у зсунутому масиві? Бінарний пошук по відповіді?
`
    },
    {
      id: 'algoadv-search-insert',
      group: 'binary-search',
      type: 'code',
      level: 1,
      title: 'Позиція вставки (lower bound)',
      tags: ['binary-search'],
      description: `
**Завдання.** Дано відсортований за зростанням масив **різних** чисел і \`target\`. Поверніть індекс \`target\`, якщо він є, інакше — індекс, куди його треба вставити, щоб масив лишився відсортованим. O(log n).

**Де трапляється:** вставка в відсортований список зі збереженням порядку.

\`\`\`js
searchInsert([1, 3, 5, 6], 5); // 2
searchInsert([1, 3, 5, 6], 2); // 1
searchInsert([1, 3, 5, 6], 7); // 4
searchInsert([1, 3, 5, 6], 0); // 0
\`\`\`

**Як це працює:** Шукаємо першу позицію, де елемент >= target (lower bound): напіввідкритий відрізок [lo, hi), і якщо nums[mid] < target — lo = mid + 1, інакше hi = mid. Коли lo === hi — це відповідь.
`,
      starter: `function searchInsert(nums, target) {
  // 1. lo = 0, hi = length (напіввідкритий відрізок)
  // 2. nums[mid] < target → lo = mid + 1, інакше hi = mid
  // 3. Повернути lo
  // TODO
}
`,
      solution: `function searchInsert(nums, target) {
  // lower bound: перший індекс, де nums[i] >= target. Межі [lo, hi) — hi може дорівнювати n
  let lo = 0;
  let hi = nums.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
`,
      hints: [
        'Шукаємо **перший** індекс, де `nums[i] >= target` (lower bound). Якщо такого немає — це `nums.length`.',
        'Використайте напіввідкриті межі `[lo, hi)` з `hi = nums.length`. Якщо `nums[mid] < target` — відповідь праворуч (`lo = mid + 1`), інакше `mid` може бути відповіддю (`hi = mid`).',
        'Цикл `while (lo < hi)` завершиться, коли `lo === hi` — це і є відповідь.'
      ],
      tests: [
        { name: 'елемент є в масиві', code: 'expect(searchInsert([1, 3, 5, 6], 5)).toBe(2);\nexpect(searchInsert([1, 3, 5, 6], 1)).toBe(0);' },
        { name: 'вставка в середину', code: 'expect(searchInsert([1, 3, 5, 6], 2)).toBe(1);\nexpect(searchInsert([1, 3, 5, 6], 4)).toBe(2);' },
        { name: 'вставка на початок і в кінець', code: 'expect(searchInsert([1, 3, 5, 6], 0)).toBe(0);\nexpect(searchInsert([1, 3, 5, 6], 7)).toBe(4);' },
        { name: 'порожній масив → 0', code: 'expect(searchInsert([], 5)).toBe(0);' },
        { name: 'від\'ємні числа', code: 'expect(searchInsert([-10, -3, 0, 4], -5)).toBe(1);\nexpect(searchInsert([-10, -3, 0, 4], -10)).toBe(0);' },
        { name: 'продуктивність: 100 000 запитів', code: `const n = 100000;
const arr = Array.from({ length: n }, (_, i) => i * 2);
let ok = true;
const t0 = performance.now();
for (let i = 0; i < n; i++) {
  if (searchInsert(arr, i * 2) !== i || searchInsert(arr, i * 2 + 1) !== i + 1) { ok = false; break; }
}
const ms = performance.now() - t0;
expect(ok).toBe(true);
expect(ms).toBeLessThan(1000);` }
      ],
      explanation: `
**Патерн:** бінарний пошук **lower bound** (перший елемент ≥ x) з напіввідкритими межами \`[lo, hi)\`.

**Ідея:**
1. Відповідь лежить у \`[0, n]\` — тому \`hi = n\` (вставка в кінець).
2. Якщо \`nums[mid] < target\`, \`mid\` і все ліворуч точно не відповідь → \`lo = mid + 1\`.
3. Інакше \`mid\` — кандидат, але може бути й лівіше → \`hi = mid\`.
4. Коли межі зійшлись — це перший індекс з \`nums[i] >= target\`.

**Складність:** O(log n) часу, O(1) пам'яті. Лінійний пошук — O(n).

**Чому цей шаблон важливий:** lower bound / upper bound — основа для «першого входження», «кількості елементів у діапазоні», вставки у відсортований список, LIS за O(n log n).

**Типові помилки:** \`hi = n - 1\` (не можна повернути \`n\`); \`hi = mid - 1\` у напіввідкритій версії (пропуск відповіді); змішування стилів \`[lo, hi]\` і \`[lo, hi)\`.

**Що спитають далі:** upper bound (перший > x)? Скільки елементів у діапазоні \`[a, b]\` у відсортованому масиві? Що робити, якщо в масиві дублікати?
`
    },
    {
      id: 'algoadv-quiz-binary-search-bug', why: ["Ні: цикл не завершиться.","Так: при lo = mid і округленні вниз межі перестають зсуватися.","Ні: до повернення не дійде.","Ні: до повернення не дійде."],
      group: 'binary-search',
      type: 'quiz',
      level: 3,
      title: 'Баг у бінарному пошуку',
      tags: ['binary-search'],
      question: `
Що станеться при виклику \`lastLess([1, 3], 5)\`? Функція мала б повертати індекс останнього елемента, меншого за \`x\`.

\`\`\`js
function lastLess(arr, x) {
  let lo = 0, hi = arr.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] < x) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}
\`\`\`
`,
      options: [
        'Поверне `0`',
        'Нескінченний цикл',
        'Поверне `1`',
        'Поверне `-1`'
      ],
      answer: 1,
      hint: 'Простежте значення `lo`, `hi`, `mid`, коли між ними різниця 1.',
      explanation: `
\`lo = 0, hi = 1\` → \`mid = Math.floor(0.5) = 0\`; \`arr[0] = 1 < 5\` → \`lo = mid = 0\`. Стан не змінився → **нескінченний цикл**.

Причина: при \`lo = mid\` середину треба округлювати **вгору**, інакше для двох елементів \`mid === lo\` і відрізок не зменшується. Виправлення: \`const mid = Math.ceil((lo + hi) / 2)\` (або \`(lo + hi + 1) >> 1\`).

Правило: кожна ітерація має **строго** зменшувати відрізок. Пари, що працюють: \`lo = mid + 1\` / \`hi = mid\` з округленням вниз, або \`lo = mid\` / \`hi = mid - 1\` з округленням вгору.

Варіанти \`0\`, \`1\`, \`-1\` — це те, що можна очікувати, не простеживши цикл: правильна відповідь мала б бути \`1\`, але функція до неї не доходить.
`
    },
    {
      id: 'algoadv-search-range',
      group: 'binary-search',
      type: 'code',
      level: 2,
      title: 'Перше та останнє входження',
      tags: ['binary-search'],
      description: `
**Завдання.** Дано відсортований за зростанням масив (з **дублікатами**) і \`target\`. Поверніть \`[first, last]\` — індекси першого та останнього входження, або \`[-1, -1]\`, якщо елемента немає. Складність — O(log n) **навіть якщо** майже весь масив складається з \`target\`.

**Де трапляється:** діапазон записів за датою у відсортованому лозі.

\`\`\`js
searchRange([5, 7, 7, 8, 8, 10], 8); // [3, 4]
searchRange([5, 7, 7, 8, 8, 10], 6); // [-1, -1]
searchRange([], 0);                  // [-1, -1]
\`\`\`

**Як це працює:** Два бінарні пошуки межі: перша позиція >= target і перша позиція > target. Якщо на першій позиції не target — відповідь [-1, -1], інакше [first, second − 1].
`,
      starter: `function searchRange(nums, target) {
  // 1. Допоміжна функція: перший індекс, для якого умова істинна
  // 2. first = перший >= target; last = перший > target − 1
  // 3. Якщо nums[first] !== target → [-1, -1]
  // TODO
}
`,
      solution: `function searchRange(nums, target) {
  // Перший індекс, для якого pred(nums[i]) хибне (масив монотонний щодо pred)
  function boundary(pred) {
    let lo = 0;
    let hi = nums.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (pred(nums[mid])) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }
  const first = boundary((x) => x < target);      // lower bound: перший >= target
  if (first === nums.length || nums[first] !== target) return [-1, -1];
  const afterLast = boundary((x) => x <= target); // upper bound: перший > target
  return [first, afterLast - 1];
}
`,
      hints: [
        'Знайти будь-яке входження і розширюватись вліво/вправо — це O(n) у гіршому випадку (масив з одних `target`).',
        'Зробіть **два** бінарні пошуки: lower bound (перший індекс з `nums[i] >= target`) і upper bound (перший з `nums[i] > target`).',
        'Відповідь: `[lower, upper - 1]`, якщо `nums[lower] === target`, інакше `[-1, -1]`.'
      ],
      tests: [
        { name: 'кілька входжень', code: 'expect(searchRange([5, 7, 7, 8, 8, 10], 8)).toEqual([3, 4]);\nexpect(searchRange([5, 7, 7, 8, 8, 10], 7)).toEqual([1, 2]);' },
        { name: 'відсутній елемент', code: 'expect(searchRange([5, 7, 7, 8, 8, 10], 6)).toEqual([-1, -1]);\nexpect(searchRange([5, 7, 7, 8, 8, 10], 11)).toEqual([-1, -1]);\nexpect(searchRange([5, 7, 7, 8, 8, 10], 4)).toEqual([-1, -1]);' },
        { name: 'порожній масив', code: 'expect(searchRange([], 0)).toEqual([-1, -1]);' },
        { name: 'одне входження і один елемент', code: 'expect(searchRange([1], 1)).toEqual([0, 0]);\nexpect(searchRange([5, 7, 9], 9)).toEqual([2, 2]);' },
        { name: 'увесь масив — target, від\'ємні числа', code: 'expect(searchRange([2, 2, 2, 2], 2)).toEqual([0, 3]);\nexpect(searchRange([-3, -3, -1, 0], -3)).toEqual([0, 1]);' },
        { name: 'продуктивність: великий блок дублікатів, 50 000 запитів', code: `const nums = [].concat(new Array(40000).fill(0), new Array(20000).fill(5), new Array(40000).fill(9));
const cases = [[5, [40000, 59999]], [0, [0, 39999]], [9, [60000, 99999]], [3, [-1, -1]], [10, [-1, -1]], [-1, [-1, -1]]];
let ok = true;
const t0 = performance.now();
for (let q = 0; q < 50000; q++) {
  const c = cases[q % cases.length];
  const r = searchRange(nums, c[0]);
  if (r[0] !== c[1][0] || r[1] !== c[1][1]) { ok = false; break; }
}
const ms = performance.now() - t0;
expect(ok).toBe(true);
expect(ms).toBeLessThan(1000);` }
      ],
      explanation: `
**Патерн:** два бінарні пошуки — **lower bound** і **upper bound** (пошук межі за предикатом).

**Ідея:**
1. Масив розбивається предикатом на «true…true false…false». Бінарний пошук знаходить першу \`false\`.
2. \`x < target\` → перший індекс ≥ target (початок блоку).
3. \`x <= target\` → перший індекс > target (позиція одразу після блоку).
4. Якщо на позиції \`first\` не \`target\` — елемента немає.

**Складність:** 2 × O(log n) = **O(log n)**, пам'ять O(1).

**Brute force vs оптимум:** знайти входження і «повзти» в обидва боки — O(n), якщо блок великий (у тесті — 20 000 однакових на кожен запит). \`indexOf\` + \`lastIndexOf\` — теж O(n).

**Типові помилки:**
- Повертати \`mid\` одразу при збігу (це «будь-яке», а не «перше» входження).
- Трюк \`lowerBound(target + 1) - 1\` працює лише для цілих чисел.
- Не перевірити \`first === nums.length\` → читання \`undefined\`.

**Що спитають далі:** порахувати кількість входжень \`target\` за O(log n)? Як узагальнити до «першого елемента, що задовольняє умову» — бінарний пошук по відповіді?
`
    },
    {
      id: 'algoadv-int-sqrt',
      group: 'binary-search',
      type: 'code',
      level: 2,
      title: 'Цілий квадратний корінь без Math.sqrt',
      tags: ['binary-search'],
      description: `
**Завдання.** Напишіть \`mySqrt(x)\` — ціла частина квадратного кореня з невід'ємного цілого \`x\` (\`0 ≤ x ≤ 2³¹ − 1\`). Не використовуйте \`Math.sqrt\`, \`Math.pow\` і \`** 0.5\`.

**Де трапляється:** бінарний пошук по відповіді — частий патерн.

\`\`\`js
mySqrt(4);          // 2
mySqrt(8);          // 2  (√8 ≈ 2.83)
mySqrt(2147483647); // 46340
\`\`\`

Лінійний перебір \`i * i <= x\` занадто повільний для 100 000 викликів з великими \`x\`.

**Як це працює:** Бінарний пошук по відповіді: шукаємо найбільше mid, для якого mid * mid <= x. Якщо умова виконується — запам'ятовуємо mid і йдемо праворуч, інакше ліворуч.
`,
      starter: `function mySqrt(x) {
  // 1. Межі пошуку: 0..x
  // 2. mid * mid <= x → запам'ятати mid і йти праворуч, інакше ліворуч
  // 3. Повернути запам'ятоване
  // TODO
}
`,
      solution: `function mySqrt(x) {
  // Шукаємо найбільше m, для якого m * m <= x (бінарний пошук по відповіді)
  let lo = 0;
  let hi = Math.min(x, 46341); // √(2^31 - 1) < 46341 — менше ітерацій і без великих добутків
  let ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (mid * mid <= x) {
      ans = mid;      // mid підходить — пробуємо більше
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}
`,
      hints: [
        'Функція `m → m * m` зростає. Отже, можна бінарним пошуком знайти найбільше `m`, для якого `m * m <= x`.',
        'Межі пошуку: `lo = 0`, `hi = x` (або менше). Якщо `mid * mid <= x` — запам\'ятайте `mid` як кандидата і йдіть праворуч, інакше — ліворуч.',
        'Альтернатива — метод Ньютона: `r = x; while (r * r > x) r = Math.floor((r + x / r) / 2);`'
      ],
      tests: [
        { name: 'x = 0 і x = 1', code: 'expect(mySqrt(0)).toBe(0);\nexpect(mySqrt(1)).toBe(1);' },
        { name: 'точні квадрати', code: 'expect(mySqrt(4)).toBe(2);\nexpect(mySqrt(144)).toBe(12);\nexpect(mySqrt(1000000)).toBe(1000);' },
        { name: 'не квадрати округлюються вниз', code: 'expect(mySqrt(8)).toBe(2);\nexpect(mySqrt(15)).toBe(3);\nexpect(mySqrt(99)).toBe(9);' },
        { name: 'максимальне значення 2^31 - 1', code: 'expect(mySqrt(2147483647)).toBe(46340);' },
        { name: 'усі x від 0 до 3000 без Math.sqrt / Math.pow', code: `const expected = [];
for (let x = 0; x <= 3000; x++) expected.push(Math.floor(Math.sqrt(x)));
const origSqrt = Math.sqrt, origPow = Math.pow;
Math.sqrt = () => { throw new Error('Math.sqrt заборонено'); };
Math.pow = () => { throw new Error('Math.pow заборонено'); };
const got = [];
try {
  for (let x = 0; x <= 3000; x++) got.push(mySqrt(x));
} finally {
  Math.sqrt = origSqrt;
  Math.pow = origPow;
}
expect(got).toEqual(expected);` },
        { name: 'продуктивність: 100 000 викликів з великими x', code: `const xs = [];
const expected = [];
for (let i = 0; i < 100000; i++) {
  const x = 2147483647 - i * 997;
  xs.push(x);
  expected.push(Math.floor(Math.sqrt(x)));
}
let ok = true;
const t0 = performance.now();
for (let i = 0; i < xs.length; i++) {
  if (mySqrt(xs[i]) !== expected[i]) { ok = false; break; }
}
const ms = performance.now() - t0;
expect(ok).toBe(true);
expect(ms).toBeLessThan(1000);` }
      ],
      explanation: `
**Патерн:** бінарний пошук **по відповіді** на монотонній функції (найбільше m з умовою \`m² ≤ x\`).

**Ідея:**
1. Простір відповідей — цілі \`[0, x]\`; умова \`m² ≤ x\` істинна для малих m і хибна для великих — монотонна.
2. Бінарним пошуком знаходимо межу; кожен \`mid\`, що підходить, — кандидат.

**Складність:** O(log x) ≈ 31 ітерація; пам'ять O(1). Лінійний перебір — O(√x) ≈ 46 000 кроків на виклик (для 10⁵ викликів — 4.6·10⁹). Метод Ньютона — квадратична збіжність, ще менше ітерацій.

**Типові помилки:**
- \`hi = x / 2\` без перевірки x = 1 (відповідь 1 > 0.5).
- Повернення \`lo\` замість \`hi\`/\`ans\` після циклу — зсув на одиницю.
- \`mid * mid\` переповнює 32-бітні цілі в інших мовах (у JS числа — double, точні до 2⁵³; але звичка писати \`mid <= x / mid\` або обмежувати \`hi\` цінується).

**Що спитають далі:** корінь з точністю до 10⁻⁶ (бінарний пошук по дійсних числах)? Чи є число точним квадратом? Метод Ньютона — чому сходиться?
`
    },
    {
      id: 'algoadv-search-rotated',
      group: 'binary-search',
      type: 'code',
      level: 3,
      title: 'Пошук у зсунутому відсортованому масиві',
      tags: ['binary-search'],
      description: `
**Завдання.** Відсортований за зростанням масив **різних** чисел циклічно зсунули на невідому позицію (наприклад, \`[0,1,2,4,5,6,7]\` → \`[4,5,6,7,0,1,2]\`). Напишіть \`searchRotated(nums, target)\`, що повертає індекс \`target\` або \`-1\` за **O(log n)**.

**Де трапляється:** класика співбесід на модифікований бінпошук.

\`\`\`js
searchRotated([4, 5, 6, 7, 0, 1, 2], 0); // 4
searchRotated([4, 5, 6, 7, 0, 1, 2], 3); // -1
searchRotated([1], 0);                   // -1
\`\`\`

**Як це працює:** У зсунутому масиві одна з половин відносно mid завжди відсортована. Визначаємо яка, і перевіряємо, чи target у її межах: так — шукаємо там, ні — в іншій половині.
`,
      starter: `function searchRotated(nums, target) {
  // 1. Звичайний бінарний пошук, але на кожному кроці:
  // 2. визначити, яка половина відсортована (nums[lo] <= nums[mid]?)
  // 3. target у межах відсортованої половини → туди, інакше в іншу
  // TODO
}
`,
      solution: `function searchRotated(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      // Ліва половина [lo..mid] відсортована
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      // Права половина [mid..hi] відсортована
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}
`,
      hints: [
        'Якщо розрізати зсунутий масив посередині, **хоча б одна** з половин буде звичайним відсортованим масивом.',
        'Порівняйте `nums[lo]` з `nums[mid]`: якщо `nums[lo] <= nums[mid]`, відсортована ліва половина, інакше — права.',
        'Перевірте, чи `target` потрапляє в діапазон відсортованої половини (`nums[lo] <= target < nums[mid]`). Якщо так — шукайте там, інакше — в іншій.'
      ],
      tests: [
        { name: 'класичний приклад', code: 'expect(searchRotated([4, 5, 6, 7, 0, 1, 2], 0)).toBe(4);\nexpect(searchRotated([4, 5, 6, 7, 0, 1, 2], 5)).toBe(1);\nexpect(searchRotated([4, 5, 6, 7, 0, 1, 2], 3)).toBe(-1);' },
        { name: 'один і нуль елементів', code: 'expect(searchRotated([1], 0)).toBe(-1);\nexpect(searchRotated([1], 1)).toBe(0);\nexpect(searchRotated([], 5)).toBe(-1);' },
        { name: 'незсунутий масив і два елементи', code: 'expect(searchRotated([1, 2, 3, 4, 5], 4)).toBe(3);\nexpect(searchRotated([3, 1], 1)).toBe(1);\nexpect(searchRotated([3, 1], 3)).toBe(0);' },
        { name: 'усі зсуви та всі цілі (з від\'ємними)', code: `const base = [-9, -6, -3, 0, 3, 6, 9, 12, 15, 18];
let ok = true;
for (let r = 0; r < base.length && ok; r++) {
  const arr = base.slice(r).concat(base.slice(0, r));
  for (let t = -11; t <= 20; t++) {
    if (searchRotated(arr, t) !== arr.indexOf(t)) { ok = false; break; }
  }
}
expect(ok).toBe(true);` },
        { name: 'продуктивність: 100 000 запитів, n = 100 000', code: `const n = 100000, shift = 37000;
const arr = Array.from({ length: n }, (_, i) => (i + shift) % n);
let ok = true;
const t0 = performance.now();
for (let t = 0; t < n; t++) {
  if (searchRotated(arr, t) !== (t - shift + n) % n) { ok = false; break; }
}
if (searchRotated(arr, -5) !== -1 || searchRotated(arr, n) !== -1) ok = false;
const ms = performance.now() - t0;
expect(ok).toBe(true);
expect(ms).toBeLessThan(1000);` }
      ],
      explanation: `
**Патерн:** модифікований бінарний пошук — «одна з половин завжди відсортована».

**Ідея:**
1. Беремо \`mid\`. Якщо \`nums[lo] <= nums[mid]\` — відрізок \`[lo, mid]\` відсортований (точка зсуву праворуч), інакше відсортований \`[mid, hi]\`.
2. Для відсортованої половини легко перевірити, чи \`target\` у її діапазоні.
3. Так — звужуємось туди, ні — в іншу половину.

**Складність:** **O(log n)** часу, O(1) пам'яті.

**Brute force vs оптимум:** \`indexOf\` — O(n). Альтернатива за O(log n): спершу бінарним пошуком знайти точку зсуву (мінімум), потім звичайний бінарний пошук у потрібній половині — два проходи, але простіша логіка.

**Типові помилки:**
- \`nums[lo] < nums[mid]\` замість \`<=\` — ламається, коли \`lo === mid\` (два елементи).
- Невірні строгі/нестрогі нерівності в перевірці діапазону (\`target < nums[mid]\`, бо рівність уже перевірена).
- З **дублікатами** (\`[1, 0, 1, 1, 1]\`) неможливо визначити відсортовану половину — у гіршому випадку O(n): при \`nums[lo] === nums[mid]\` робимо \`lo++\`.

**Що спитають далі:** знайти мінімум у зсунутому масиві? Знайти кількість зсувів? Що змінюється, якщо дозволені дублікати?
`
    },
    {
      id: 'algoadv-ship-capacity',
      group: 'binary-search',
      type: 'code',
      level: 4,
      title: 'Бінарний пошук по відповіді: вантажопідйомність',
      tags: ['binary-search'],
      description: `
**Завдання.** Конвеєр має відправити посилки з вагами \`weights\` **у заданому порядку** протягом \`days\` днів. Щодня корабель вантажиться посилками підряд, поки їхня сума не перевищує вантажопідйомність. Знайдіть **мінімальну** вантажопідйомність, за якої все буде відправлено за \`days\` днів.

**Де трапляється:** підбір мінімального ліміту (розмір батча, пропускна здатність).

\`\`\`js
shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5); // 15
// [1..5] [6,7] [8] [9] [10]
shipWithinDays([3, 2, 2, 4, 1, 4], 3); // 6
shipWithinDays([1, 2, 3, 1, 1], 4);    // 3
\`\`\`

Обмеження: до 50 000 посилок вагою до 500, \`1 ≤ days ≤ weights.length\`.

**Як це працює:** Відповідь лежить між вагою найважчої посилки і сумою всіх. Для кандидата capacity жадібно рахуємо, скільки днів потрібно. Шукаємо бінарно найменшу capacity, що вкладається в days.
`,
      starter: `function shipWithinDays(weights, days) {
  // 1. lo = найважча посилка, hi = сума всіх
  // 2. canShip(cap): жадібно рахуємо дні, не більше days?
  // 3. Бінарно шукаємо найменшу cap, для якої canShip
  // TODO
}
`,
      solution: `function shipWithinDays(weights, days) {
  let lo = 0; // мінімум — найважча посилка (інакше її не відправити)
  let hi = 0; // максимум — усе за один день
  for (const w of weights) {
    lo = Math.max(lo, w);
    hi += w;
  }

  // Чи вистачить днів при вантажопідйомності cap? Жадібно вантажимо, поки влазить.
  function canShip(cap) {
    let needDays = 1;
    let load = 0;
    for (const w of weights) {
      if (load + w > cap) {
        needDays++;
        load = 0;
      }
      load += w;
    }
    return needDays <= days;
  }

  // canShip монотонна: false ... false true ... true — шукаємо першу true
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (canShip(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
`,
      hints: [
        'Якщо вантажопідйомності `C` вистачає, то вистачить і будь-якої більшої — умова монотонна. Шукайте відповідь бінарним пошуком у діапазоні значень, а не індексів.',
        'Межі: `lo = max(weights)`, `hi = sum(weights)`. Допоміжна `canShip(cap)` жадібно рахує, скільки днів потрібно: додаємо посилки, поки сума ≤ cap, інакше — новий день.',
        'Шукайте **першу** вантажопідйомність, для якої `canShip` повертає `true`: `if (canShip(mid)) hi = mid; else lo = mid + 1;`.'
      ],
      tests: [
        { name: 'приклади з умови', code: 'expect(shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)).toBe(15);\nexpect(shipWithinDays([3, 2, 2, 4, 1, 4], 3)).toBe(6);\nexpect(shipWithinDays([1, 2, 3, 1, 1], 4)).toBe(3);' },
        { name: 'одна посилка', code: 'expect(shipWithinDays([7], 1)).toBe(7);' },
        { name: 'days = кількість посилок → максимальна вага', code: 'expect(shipWithinDays([4, 9, 2, 6], 4)).toBe(9);' },
        { name: 'days = 1 → сума всіх', code: 'expect(shipWithinDays([4, 9, 2, 6], 1)).toBe(21);' },
        { name: 'продуктивність: 50 000 посилок, результат мінімальний і достатній', code: `let s = 11;
const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0);
const weights = Array.from({ length: 50000 }, () => (rnd() % 500) + 1);
const days = 10;
const need = cap => { let d = 1, load = 0; for (const w of weights) { if (load + w > cap) { d++; load = 0; } load += w; } return d; };
const t0 = performance.now();
const r = shipWithinDays(weights, days);
const ms = performance.now() - t0;
expect(need(r)).toBeLessThanOrEqual(days);
expect(need(r - 1)).toBeGreaterThan(days);
expect(ms).toBeLessThan(1000);` }
      ],
      explanation: `
**Патерн:** **бінарний пошук по відповіді** (binary search on answer) + жадібна перевірка здійсненності.

**Як впізнати:** «знайти **мінімальне** X, при якому можна …» (або максимальне), і якщо X підходить, то будь-яке більше теж підходить. Схожі задачі: Koko Eating Bananas, Split Array Largest Sum, мінімальна швидкість, щоб встигнути.

**Ідея:**
1. Простір відповідей: від \`max(weights)\` (менше — найважча посилка не влізе) до \`sum(weights)\` (усе за день).
2. \`canShip(cap)\` — жадібна симуляція за O(n): вантажимо, поки влазить.
3. Монотонність → бінарний пошук першої \`true\`.

**Складність:** **O(n · log(sum))** — для n = 5·10⁴ і суми ~1.25·10⁷: ~24 × 5·10⁴ ≈ 1.2·10⁶ операцій. Пам'ять O(1).

**Brute force vs оптимум:** перебирати \`cap\` від \`max\` вгору — O(n · (sum − max)): мільйони кандидатів × 5·10⁴ ≈ 10¹⁰⁺. DP-розбиття на \`days\` частин — O(n² · days).

**Типові помилки:**
- \`lo = 1\` або \`0\` замість \`max(weights)\` — \`canShip\` має обробляти посилку, важчу за cap (інакше нескінченний «новий день»).
- Неправильний напрямок пошуку (шукати останню \`false\` і забути \`+ 1\`).
- Сортування ваг — порядок посилок фіксований!

**Що спитають далі:** Split Array Largest Sum — та сама задача іншими словами? Koko Eating Bananas? Як довести, що жадібна перевірка оптимальна для фіксованого cap?
`
    },
    // ---------------------------------------------------------------- Динамічне програмування: 1D
    {
      id: 'algoadv-dp-theory', why: ["Ні: без перекриття підзадач кеш нічого не дає.","Так: перекриття + оптимальна підструктура — ознаки DP.","Ні: навпаки — top-down рахує лише потрібні стани.","Ні: складність = стани × вартість переходу.","Ні: bottom-up якраз зручно стискати до кількох змінних."],
      group: 'dp-1d',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Динамічне програмування: як підходити до задачі',
      tags: ['dp'],
      question: 'Що таке динамічне програмування? Коли його застосовувати і як крок за кроком побудувати DP-рішення? Чим top-down відрізняється від bottom-up?',
      choices: [
        'DP застосовне до будь-якої рекурсії, навіть коли підзадачі не перекриваються, як у merge sort',
        'DP працює, коли підзадачі перекриваються і є оптимальна підструктура: кожну розвʼязують раз',
        'Top-down завжди рахує всі стани таблиці, а bottom-up — лише ті, що реально знадобляться',
        'Складність DP визначає лише кількість станів, а вартість переходу на неї ніяк не впливає',
        'Bottom-up не дозволяє стиснути памʼять, тому завжди потребує повної таблиці всіх станів',
      ],
      correct: 1,
      hint: 'Перекриття підзадач, оптимальна підструктура; стан, перехід, база, порядок обчислення.',
      answer: `
**Динамічне програмування (DP)** — техніка розв'язання задач, що розкладаються на **підзадачі, які перекриваються** (overlapping subproblems), і мають **оптимальну підструктуру** (optimal substructure): оптимальна відповідь будується з оптимальних відповідей підзадач. Кожна підзадача розв'язується **один раз**, результат зберігається.

**Ознаки DP-задачі:** «кількість способів», «мінімум/максимум», «чи можна», «найдовша/найкоротша …», і наївна рекурсія повторює ті самі обчислення.

**Рецепт (5 кроків):**
1. **Стан:** що означає \`dp[i]\` (або \`dp[i][j]\`)? Наприклад, «мінімум монет для суми i».
2. **Перехід (рекурентність):** як \`dp[i]\` виражається через менші стани: \`dp[i] = min(dp[i - c] + 1)\`.
3. **База:** \`dp[0] = 0\`.
4. **Порядок обчислення:** так, щоб залежності були пораховані раніше.
5. **Відповідь:** \`dp[n]\`, \`max(dp)\` тощо.

**Top-down vs bottom-up:**

| | Top-down (мемоізація) | Bottom-up (табуляція) |
|---|---|---|
| Як | Рекурсія + кеш | Цикли, заповнення таблиці |
| Плюси | Природно з рекурентності, рахує лише потрібні стани | Без рекурсії (немає переповнення стеку), легко стиснути пам'ять |
| Мінуси | Стек, накладні витрати на виклики | Треба продумати порядок, рахує всі стани |

\`\`\`js
// Climbing stairs: bottom-up зі стисненням пам'яті до O(1)
function climb(n) {
  let a = 1, b = 1; // dp[i-2], dp[i-1]
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}
\`\`\`

**Складність:** (кількість станів) × (вартість переходу). Пам'ять часто стискається: якщо \`dp[i]\` залежить лише від \`dp[i-1]\`, \`dp[i-2]\` — дві змінні; для 2D — один рядок.

**DP vs інші:** divide & conquer — підзадачі **не** перекриваються (merge sort); greedy — локальний вибір без перегляду альтернатив (працює лише за спеціальних властивостей); backtracking — перебір усіх рішень, DP — агрегування без явного перебору.
`,
      keyPoints: [
        'Перекриття підзадач + оптимальна підструктура',
        'Стан → перехід → база → порядок → відповідь',
        'Top-down (мемоізація) vs bottom-up (табуляція) і їх trade-offs',
        'Складність = кількість станів × вартість переходу',
        'Стиснення пам\'яті до рядка / кількох змінних',
        'Відмінність від greedy і divide & conquer'
      ],
      followUps: [
        'Як відновити саме рішення (а не лише його вартість)?',
        'Коли top-down вигідніший за bottom-up?',
        'Як зменшити пам\'ять 2D-DP до O(min(m, n))?'
      ]
    },
    {
      id: 'algoadv-climbing-stairs',
      group: 'dp-1d',
      type: 'code',
      level: 1,
      interview: true,
      title: 'Climbing Stairs',
      tags: ['dp'],
      description: `
**Завдання.** Щоб піднятися сходами з \`n\` сходинок, за один крок можна піднятися на **1 або 2** сходинки. Скількома способами можна дійти до верху? \`1 ≤ n ≤ 70\`.

**Де трапляється:** перша задача на DP на будь-якій співбесіді.

\`\`\`js
climbStairs(2); // 2  (1+1, 2)
climbStairs(3); // 3  (1+1+1, 1+2, 2+1)
\`\`\`

Рішення має миттєво працювати для \`n = 70\`.

**Як це працює:** На сходинку i можна потрапити з i − 1 або з i − 2, тож ways(i) = ways(i − 1) + ways(i − 2) — числа Фібоначчі. Досить двох змінних замість масиву.
`,
      starter: `function climbStairs(n) {
  // 1. Два попередні значення: для 0 і 1 сходинки — по 1
  // 2. У циклі: поточне = сума двох попередніх, зсунути змінні
  // TODO
}
`,
      solution: `function climbStairs(n) {
  // dp[i] = dp[i - 1] + dp[i - 2]: на i-ту сходинку приходимо з i-1 або з i-2
  let prev2 = 1; // dp[0]: один спосіб «нічого не робити»
  let prev1 = 1; // dp[1]
  for (let i = 2; i <= n; i++) {
    const cur = prev1 + prev2;
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}
`,
      hints: [
        'Останній крок на сходинку `n` — або з `n - 1`, або з `n - 2`. Отже, `ways(n) = ways(n - 1) + ways(n - 2)`.',
        'Це послідовність Фібоначчі. Наївна рекурсія — O(2ⁿ); рахуйте знизу вгору.',
        'Достатньо двох змінних: `prev2 = 1`, `prev1 = 1`, далі в циклі `cur = prev1 + prev2`.'
      ],
      tests: [
        { name: 'n = 1 → 1, n = 2 → 2', code: 'expect(climbStairs(1)).toBe(1);\nexpect(climbStairs(2)).toBe(2);' },
        { name: 'n = 3 → 3, n = 5 → 8', code: 'expect(climbStairs(3)).toBe(3);\nexpect(climbStairs(5)).toBe(8);' },
        { name: 'n = 10 → 89', code: 'expect(climbStairs(10)).toBe(89);' },
        { name: 'n = 45 → 1836311903', code: 'expect(climbStairs(45)).toBe(1836311903);' },
        { name: 'продуктивність: n = 70 миттєво', code: 'const t0 = performance.now();\nexpect(climbStairs(70)).toBe(308061521170129);\nexpect(performance.now() - t0).toBeLessThan(500);' }
      ],
      explanation: `
**Патерн:** 1D DP (Фібоначчі-подібна рекурентність).

**Ідея:**
1. **Стан:** \`dp[i]\` — кількість способів дійти до сходинки i.
2. **Перехід:** \`dp[i] = dp[i-1] + dp[i-2]\` (останній крок — 1 або 2).
3. **База:** \`dp[0] = 1\`, \`dp[1] = 1\`.
4. Залежність лише від двох попередніх → дві змінні.

**Складність:** O(n) часу, O(1) пам'яті.

**Brute force vs оптимум:** рекурсія \`f(n-1) + f(n-2)\` без кешу — O(2ⁿ): для n = 45 це ~10⁹ викликів, для 70 — роки. З мемоізацією — O(n) часу й пам'яті, bottom-up — O(n) / O(1).

**Типові помилки:** неправильна база (\`dp[0] = 0\` дає зсув відповіді); рекурсія без кешу; \`n = 1\` поза циклом не обробляється.

**Що спитають далі:** а якщо можна ходити на 1, 2 або 3 сходинки? Довільний набір кроків \`steps\`? Min Cost Climbing Stairs — кожна сходинка має ціну? Як порахувати для n = 10⁹ (матричне піднесення, модульна арифметика)?
`
    },
    {
      id: 'algoadv-house-robber',
      group: 'dp-1d',
      type: 'code',
      level: 2,
      title: 'House Robber',
      tags: ['dp'],
      description: `
**Завдання.** Вздовж вулиці стоять будинки, у кожному — \`nums[i] ≥ 0\` грошей. Не можна грабувати **два сусідні** будинки. Поверніть максимальну суму.

**Де трапляється:** класичний DP вибору без сусідів.

\`\`\`js
rob([1, 2, 3, 1]);    // 4  (1 + 3)
rob([2, 7, 9, 3, 1]); // 12 (2 + 9 + 1)
rob([]);              // 0
\`\`\`

До 100 000 будинків — без рекурсії, щоб не переповнити стек.

**Як це працює:** Для кожного будинку обираємо: пропустити (найкраще до попереднього) або пограбувати (найкраще до i − 2 + гроші тут). dp(i) = max(dp(i − 1), dp(i − 2) + nums[i]).
`,
      starter: `function rob(nums) {
  // 1. prev2 (до i − 2) і prev1 (до i − 1)
  // 2. Для кожного будинку: cur = max(prev1, prev2 + гроші)
  // 3. Зсунути змінні; відповідь — prev1
  // TODO
}
`,
      solution: `function rob(nums) {
  // dp[i] = max(dp[i-1], dp[i-2] + nums[i]) — пропустити будинок або взяти його
  let prev2 = 0; // найкраще до i-2
  let prev1 = 0; // найкраще до i-1
  for (const money of nums) {
    const cur = Math.max(prev1, prev2 + money);
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}
`,
      hints: [
        'Для кожного будинку два варіанти: пограбувати його (тоді попередній — ні) або пропустити.',
        '`dp[i]` — максимум серед перших i будинків: `dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])`.',
        'Як і у Фібоначчі, достатньо двох змінних `prev1`, `prev2`.'
      ],
      tests: [
        { name: 'порожня вулиця → 0', code: 'expect(rob([])).toBe(0);' },
        { name: 'один і два будинки', code: 'expect(rob([5])).toBe(5);\nexpect(rob([2, 9])).toBe(9);' },
        { name: 'класичні приклади', code: 'expect(rob([1, 2, 3, 1])).toBe(4);\nexpect(rob([2, 7, 9, 3, 1])).toBe(12);' },
        { name: 'вигідно пропустити два поспіль', code: 'expect(rob([2, 1, 1, 2])).toBe(4);\nexpect(rob([10, 0, 0, 10])).toBe(20);' },
        { name: 'нулі', code: 'expect(rob([0, 0, 0])).toBe(0);' },
        { name: 'продуктивність: 100 000 будинків', code: 'const n = 100000;\nconst ones = new Array(n).fill(1);\nconst alt = Array.from({ length: n }, (_, i) => (i % 2 ? 100 : 1));\nconst t0 = performance.now();\nexpect(rob(ones)).toBe(50000);\nexpect(rob(alt)).toBe(5000000);\nexpect(performance.now() - t0).toBeLessThan(500);' }
      ],
      explanation: `
**Патерн:** 1D DP «брати / не брати» з обмеженням на сусідів.

**Ідея:**
1. **Стан:** \`dp[i]\` — максимум з перших i будинків.
2. **Перехід:** або не беремо i-й (\`dp[i-1]\`), або беремо його й найкраще до i−2 (\`dp[i-2] + nums[i]\`).
3. **База:** \`dp[-1] = dp[-2] = 0\`.
4. Стискаємо до двох змінних.

**Складність:** O(n) часу, O(1) пам'яті.

**Brute force vs оптимум:** перебір усіх підмножин без сусідів — O(φⁿ). Рекурсія з мемоізацією — O(n), але глибина 10⁵ → \`RangeError\` у JS. Bottom-up — без цих проблем.

**Типові помилки:**
- Жадібне «брати всі парні або всі непарні» — неправильно для \`[2, 1, 1, 2]\` (відповідь 4: перший і останній).
- \`dp[1] = nums[1]\` замість \`max(nums[0], nums[1])\`.

**Що спитають далі:** House Robber II — будинки по колу (два запуски: без першого і без останнього)? House Robber III — будинки у вузлах дерева (DP на дереві: пара «з коренем / без кореня»)? Як відновити, які саме будинки взяти?
`
    },
    {
      id: 'algoadv-quiz-greedy-coins', why: ["Ні: жадібний бере 4+1+1 = 3 монети.","Ні: оптимум — 3+3 = 2 монети.","Ні: переплутано.","Так: жадібний 4+1+1, а оптимально 3+3."],
      group: 'dp-1d',
      type: 'quiz',
      level: 2,
      title: 'Коли жадібний розмін монет помиляється',
      tags: ['greedy', 'dp'],
      question: `
Жадібний алгоритм розміну щоразу бере **найбільшу** монету, що не перевищує залишок. Монети: \`[1, 3, 4]\`, сума \`6\`. Скільки монет поверне жадібний алгоритм і скільки — оптимальний розв'язок?
`,
      options: [
        'Жадібний — 2, оптимум — 2',
        'Жадібний — 3, оптимум — 3',
        'Жадібний — 2, оптимум — 3',
        'Жадібний — 3, оптимум — 2'
      ],
      answer: 3,
      hint: 'Розпишіть кроки жадібного: яку монету він візьме першою? А тепер спробуйте знайти розклад з двох монет.',
      explanation: `
Жадібний: \`6 → 4\` (лишилось 2) → \`1\` → \`1\` = **3 монети** (4 + 1 + 1). Оптимум: \`3 + 3\` = **2 монети**.

Жадібність працює для «канонічних» систем монет (як 1, 2, 5, 10, 25, 50 — реальні гроші), але не для довільних. Тому загальна задача Coin Change розв'язується **DP**: \`dp[a] = min(dp[a - c] + 1)\` по всіх монетах c.

Варіант «жадібний 2, оптимум 3» неможливий: жадібний не може бути кращим за оптимум. «Обидва 2» або «обидва 3» — результат, якщо не простежити жадібні кроки або не помітити \`3 + 3\`.
`
    },
    {
      id: 'algoadv-coin-change',
      group: 'dp-1d',
      type: 'code',
      level: 3,
      title: 'Coin Change: мінімальна кількість монет',
      tags: ['dp'],
      description: `
**Завдання.** Дано номінали монет \`coins\` (кожного — необмежена кількість) і суму \`amount\`. Поверніть **мінімальну** кількість монет, якою можна набрати суму, або \`-1\`, якщо це неможливо.

**Де трапляється:** розмін, підбір пакетів, мінімум кроків.

\`\`\`js
coinChange([1, 2, 5], 11); // 3  (5 + 5 + 1)
coinChange([2], 3);        // -1
coinChange([1], 0);        // 0
coinChange([1, 3, 4], 6);  // 2  (3 + 3) — жадібний дав би 3
\`\`\`

Обмеження: \`amount ≤ 10⁴\`, до 12 номіналів.

**Як це працює:** dp[a] — мінімум монет для суми a. dp[0] = 0, для кожної суми перебираємо монети: dp[a] = min(dp[a], dp[a − c] + 1). Якщо dp[amount] лишився Infinity — повертаємо −1.
`,
      starter: `function coinChange(coins, amount) {
  // 1. dp довжини amount + 1, заповнити Infinity, dp[0] = 0
  // 2. Для кожної суми перебрати монети: dp[a] = min(dp[a], dp[a − c] + 1)
  // 3. Infinity → −1
  // TODO
}
`,
      solution: `function coinChange(coins, amount) {
  // dp[a] — мінімум монет для суми a
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) {
        dp[a] = dp[a - c] + 1; // остання монета — c
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
`,
      hints: [
        'Жадібність не працює (приклад `[1, 3, 4]`, 6). Подумайте: яка **остання** монета в оптимальному розкладі суми `a`?',
        'Якщо остання монета `c`, то решта — оптимальний розклад суми `a - c`. Отже, `dp[a] = min(dp[a - c] + 1)` по всіх `c <= a`.',
        'Заповніть `dp` від 0 до `amount`, початкові значення — `Infinity`, `dp[0] = 0`. Якщо в кінці `Infinity` — поверніть `-1`.'
      ],
      tests: [
        { name: 'класичний приклад', code: 'expect(coinChange([1, 2, 5], 11)).toBe(3);' },
        { name: 'неможливо → -1', code: 'expect(coinChange([2], 3)).toBe(-1);\nexpect(coinChange([5, 10], 3)).toBe(-1);' },
        { name: 'сума 0 → 0', code: 'expect(coinChange([1], 0)).toBe(0);\nexpect(coinChange([7], 0)).toBe(0);' },
        { name: 'пастка для жадібного', code: 'expect(coinChange([1, 3, 4], 6)).toBe(2);\nexpect(coinChange([2, 5], 6)).toBe(3);' },
        { name: 'невідсортовані номінали', code: 'expect(coinChange([5, 1, 2], 7)).toBe(2);' },
        { name: 'продуктивність: великі суми (наївна рекурсія експоненційна)', code: 'const t0 = performance.now();\nexpect(coinChange([186, 419, 83, 408], 6249)).toBe(20);\nexpect(coinChange([1, 7, 23, 89, 233], 10000)).toBe(48);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
      ],
      explanation: `
**Патерн:** 1D DP «unbounded knapsack» — мінімізація по останньому вибору.

**Ідея:**
1. **Стан:** \`dp[a]\` — мінімум монет для суми a.
2. **Перехід:** \`dp[a] = min(dp[a - c] + 1)\` по всіх монетах \`c ≤ a\`.
3. **База:** \`dp[0] = 0\`, решта \`Infinity\` («недосяжно»).
4. **Відповідь:** \`dp[amount]\` або \`-1\`.

**Складність:** O(amount · k) часу, O(amount) пам'яті (k — кількість номіналів). Для 10⁴ × 5 — 5·10⁴ операцій.

**Brute force vs оптимум:** рекурсія \`1 + min(f(a - c))\` без кешу — O(k^(amount/min_coin)), експоненційно. Жадібний — швидкий, але неправильний для неканонічних систем. BFS по сумах (рівень = кількість монет) — альтернатива з тією ж складністю.

**Типові помилки:**
- Ініціалізація \`0\` замість \`Infinity\` → мінімум завжди 0.
- \`dp[a - c] + 1\` при \`dp[a - c] === Infinity\` — нормально (\`Infinity + 1 = Infinity\`), але в мовах з цілими числами це переповнення; у JS можна використати \`amount + 1\` як «нескінченність».
- Повертати \`Infinity\` замість \`-1\`.

**Що спитають далі:** Coin Change II — **кількість способів** (порядок циклів важливий: монети ззовні → комбінації, суми ззовні → перестановки)? Як відновити самі монети (масив «остання монета»)?
`
    },
    {
      id: 'algoadv-word-break',
      group: 'dp-1d',
      type: 'code',
      level: 3,
      title: 'Word Break',
      tags: ['dp', 'strings'],
      description: `
**Завдання.** Дано рядок \`s\` і словник \`wordDict\`. Поверніть \`true\`, якщо \`s\` можна розбити на послідовність слів зі словника (слова можна використовувати повторно).

**Де трапляється:** розбиття рядка на токени зі словника.

\`\`\`js
wordBreak('leetcode', ['leet', 'code']);                       // true
wordBreak('applepenapple', ['apple', 'pen']);                  // true
wordBreak('catsandog', ['cats', 'dog', 'sand', 'and', 'cat']); // false
\`\`\`

Довжина \`s\` — до 1000. Наївна рекурсія на рядку на кшталт \`"aaaa…ab"\` працює експоненційно довго.

**Як це працює:** dp[i] — чи можна розбити перші i символів. dp[0] = true; dp[i] = true, якщо існує j < i, де dp[j] і s.slice(j, i) є в словнику. Set для словника дає швидку перевірку.
`,
      starter: `function wordBreak(s, wordDict) {
  // 1. Set слів; dp довжини s.length + 1, dp[0] = true
  // 2. dp[i] = true, якщо є j з dp[j] і s.slice(j, i) у словнику
  // 3. Відповідь — dp[s.length]
  // TODO
}
`,
      solution: `function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const lengths = [...new Set(wordDict.map((w) => w.length))];
  // dp[i] — чи можна розбити префікс s.slice(0, i)
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true; // порожній префікс
  for (let i = 1; i <= s.length; i++) {
    for (const len of lengths) {
      if (len <= i && dp[i - len] && words.has(s.slice(i - len, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[s.length];
}
`,
      hints: [
        'Префікс `s[0..i)` можна розбити, якщо існує `j < i`, такий що префікс `s[0..j)` розбивається, а `s[j..i)` — слово зі словника.',
        '`dp[0] = true`; для кожного `i` перевірте кандидатів `j`. Словник покладіть у `Set` для O(1) перевірки.',
        'Оптимізація: перебирайте лише довжини слів зі словника: `j = i - len`.'
      ],
      tests: [
        { name: 'розбивається', code: 'expect(wordBreak("leetcode", ["leet", "code"])).toBe(true);\nexpect(wordBreak("applepenapple", ["apple", "pen"])).toBe(true);' },
        { name: 'не розбивається', code: 'expect(wordBreak("catsandog", ["cats", "dog", "sand", "and", "cat"])).toBe(false);' },
        { name: 'порожній рядок → true', code: 'expect(wordBreak("", ["a"])).toBe(true);' },
        { name: 'порожній словник', code: 'expect(wordBreak("a", [])).toBe(false);' },
        { name: 'повторне використання і потреба відкату', code: 'expect(wordBreak("aaaa", ["a"])).toBe(true);\nexpect(wordBreak("aaaaaaa", ["aaaa", "aaa"])).toBe(true);\nexpect(wordBreak("cars", ["car", "ca", "rs"])).toBe(true);' },
        { name: 'продуктивність: "a" × 1000 + "b" (експоненційний випадок для рекурсії)', code: 'const s = "a".repeat(1000) + "b";\nconst dict = ["a", "aa", "aaa", "aaaa", "aaaaa", "aaaaaa"];\nconst t0 = performance.now();\nexpect(wordBreak(s, dict)).toBe(false);\nexpect(wordBreak("a".repeat(1000), dict)).toBe(true);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
      ],
      explanation: `
**Патерн:** 1D DP по префіксах рядка (segmentation DP).

**Ідея:**
1. **Стан:** \`dp[i]\` — чи можна розбити префікс довжини i.
2. **Перехід:** \`dp[i] = true\`, якщо є слово \`w\` з \`dp[i - w.length]\` і \`s.slice(i - w.length, i) === w\`.
3. **База:** \`dp[0] = true\`.

**Складність:** O(n · L · m), де n — довжина рядка, L — кількість різних довжин слів, m — довжина слова (slice + хеш). Перебір усіх \`j < i\` — O(n² · m). Пам'ять O(n + розмір словника).

**Brute force vs оптимум:** рекурсія «відкусити слово-префікс і рекурсувати на решті» без кешу — O(2ⁿ) на \`"aaa…ab"\`: кожне розбиття \`a\`-шок перевіряється заново. Мемоізація за початковим індексом — теж O(n²), але з рекурсією.

**Типові помилки:**
- Жадібно брати найдовше/найкоротше слово (\`"cars"\` з \`["car", "ca", "rs"]\`).
- Пошук слова в масиві (\`includes\`) замість \`Set\` — зайвий множник.
- Забути \`dp[0] = true\`.

**Що спитають далі:** Word Break II — повернути всі розбиття (backtracking + мемоізація)? Як використати trie замість Set? Яка складність у найгіршому випадку з урахуванням \`slice\`?
`
    },
    {
      id: 'algoadv-lis',
      group: 'dp-1d',
      type: 'code',
      level: 4,
      title: 'Найдовша зростаюча підпослідовність: O(n log n)',
      tags: ['dp', 'binary-search'],
      description: `
**Завдання.** Напишіть \`lengthOfLIS(nums)\` — довжину найдовшої **строго зростаючої** підпослідовності (не обов'язково підряд).

**Де трапляється:** складна класика DP + бінарний пошук.

\`\`\`js
lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]); // 4  (2, 3, 7, 18)
lengthOfLIS([0, 1, 0, 3, 2, 3]);           // 4
lengthOfLIS([7, 7, 7, 7]);                 // 1
\`\`\`

Масив — до 100 000 елементів: класичний DP за O(n²) не встигне, потрібен **O(n log n)**.

**Як це працює:** tails[k] — найменший можливий «хвіст» зростаючої підпослідовності довжини k + 1. Для кожного числа бінарним пошуком знаходимо перший tails >= x і замінюємо його (або додаємо в кінець). Довжина tails — відповідь.
`,
      starter: `function lengthOfLIS(nums) {
  // 1. Масив tails
  // 2. Для кожного x: бінарним пошуком перший tails[k] >= x
  // 3. Замінити tails[k] = x (або push, якщо такого немає); відповідь — tails.length
  // TODO
}
`,
      solution: `function lengthOfLIS(nums) {
  // tails[k] — найменший можливий останній елемент зростаючої підпослідовності довжини k + 1.
  // tails завжди строго зростає, тому місце для x знаходимо бінарним пошуком.
  const tails = [];
  for (const x of nums) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1; // lower bound: перший tails[i] >= x
      else hi = mid;
    }
    tails[lo] = x; // або продовжуємо найдовшу (lo === length), або покращуємо хвіст
  }
  return tails.length;
}
`,
      hints: [
        'Спершу O(n²): `dp[i]` — довжина LIS, що закінчується на `nums[i]` = 1 + max `dp[j]` для `j < i` з `nums[j] < nums[i]`. Для 10⁵ це забагато.',
        'Підтримуйте масив `tails`: `tails[k]` — найменший хвіст зростаючої підпослідовності довжини `k + 1`. Він завжди відсортований.',
        'Для кожного `x`: знайдіть бінарним пошуком перший `tails[i] >= x` і замініть його на `x`; якщо такого немає — додайте `x` у кінець. Відповідь — `tails.length`.'
      ],
      tests: [
        { name: 'класичні приклади', code: 'expect(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])).toBe(4);\nexpect(lengthOfLIS([0, 1, 0, 3, 2, 3])).toBe(4);' },
        { name: 'однакові елементи — строго зростаюча', code: 'expect(lengthOfLIS([7, 7, 7, 7])).toBe(1);\nexpect(lengthOfLIS([1, 2, 2, 3])).toBe(3);' },
        { name: 'порожній і одноелементний масив', code: 'expect(lengthOfLIS([])).toBe(0);\nexpect(lengthOfLIS([5])).toBe(1);' },
        { name: 'від\'ємні та спадний масив', code: 'expect(lengthOfLIS([-2, -1, -3, 0])).toBe(3);\nexpect(lengthOfLIS([5, 4, 3, 2, 1])).toBe(1);' },
        { name: 'хвіст замінюється, а не підпослідовність', code: 'expect(lengthOfLIS([3, 4, -1, 0, 6, 2, 3])).toBe(4);\nexpect(lengthOfLIS([4, 10, 4, 3, 8, 9])).toBe(3);' },
        { name: 'продуктивність: 100 000 елементів (O(n²) не встигне)', code: `const n = 100000;
const inc = Array.from({ length: n }, (_, i) => i);
const zigzag = Array.from({ length: n }, (_, i) => (i % 2 ? i : n - i));
const t0 = performance.now();
expect(lengthOfLIS(inc)).toBe(n);
const z = lengthOfLIS(zigzag);
const ms = performance.now() - t0;
expect(z).toBeGreaterThan(1);
expect(ms).toBeLessThan(1000);` }
      ],
      explanation: `
**Патерн:** DP + **бінарний пошук** (patience sorting — «пасьянс»).

**Ідея O(n²):** \`dp[i]\` = 1 + max(\`dp[j]\`) по \`j < i\` з \`nums[j] < nums[i]\`. Просто, але 10⁵² / 2 = 5·10⁹ операцій.

**Ідея O(n log n):**
1. \`tails[k]\` — найменший хвіст серед усіх зростаючих підпослідовностей довжини k+1. Менший хвіст — краще: його легше продовжити.
2. \`tails\` строго зростає (довша підпослідовність не може мати менший мінімальний хвіст).
3. Для кожного \`x\`: lower bound у \`tails\`. Якщо \`x\` більший за всі — LIS подовжується. Інакше \`x\` замінює перший хвіст ≥ x — та сама довжина, але кращий хвіст.
4. Відповідь — \`tails.length\`.

**Важливо:** \`tails\` — **не** сама LIS (для \`[3, 4, -1]\` tails = \`[-1, 4]\`, а такої підпослідовності немає), лише її довжина правильна.

**Складність:** O(n log n) часу, O(n) пам'яті.

**Типові помилки:**
- upper bound (\`<=\`) замість lower bound — рахує **неспадну** підпослідовність (\`[7,7,7]\` → 3).
- Вважати \`tails\` відповіддю.
- Сортувати масив (LIS залежить від порядку!).

**Що спитають далі:** відновити саму підпослідовність (зберігати індекси та попередників)? Russian Doll Envelopes (сортування за шириною + LIS за висотою з хитрим порядком)? Кількість LIS?
`
    },
    // ---------------------------------------------------------------- Динамічне програмування: сітки, рядки, рюкзак
    {
      id: 'algoadv-unique-paths',
      group: 'dp-2d',
      type: 'code',
      level: 2,
      title: 'Unique Paths: кількість шляхів у сітці',
      tags: ['dp', 'grid'],
      description: `
**Завдання.** Робот стоїть у лівому верхньому куті сітки \`m × n\` і може рухатися лише **вправо** або **вниз**. Скільки є різних шляхів до правого нижнього кута? \`1 ≤ m, n ≤ 18\`.

**Де трапляється:** DP на сітці — база для задач з картами.

\`\`\`js
uniquePaths(3, 7); // 28
uniquePaths(3, 2); // 3
uniquePaths(1, 1); // 1
\`\`\`

**Як це працює:** У клітинку можна прийти лише зверху або зліва, тож paths(r, c) = paths(r − 1, c) + paths(r, c − 1). Перший рядок і перший стовпець — по одному шляху. Досить одного рядка-масиву.
`,
      starter: `function uniquePaths(m, n) {
  // 1. Рядок з n одиниць (перший рядок сітки)
  // 2. Для кожного наступного рядка: row[c] += row[c − 1]
  // 3. Відповідь — останній елемент
  // TODO
}
`,
      solution: `function uniquePaths(m, n) {
  // dp[r][c] = dp[r-1][c] + dp[r][c-1]; зберігаємо лише один рядок
  const row = new Array(n).fill(1); // перший рядок: один шлях у кожну клітинку
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      row[c] += row[c - 1]; // row[c] (зверху) + row[c-1] (зліва)
    }
  }
  return row[n - 1];
}
`,
      hints: [
        'У клітинку (r, c) можна прийти лише зверху або зліва. Отже, кількість шляхів — сума шляхів у ці дві клітинки.',
        'Перший рядок і перший стовпець — по одному шляху. Заповнюйте таблицю `dp[r][c] = dp[r-1][c] + dp[r][c-1]` рядок за рядком.',
        'Достатньо одного масиву довжини `n`: `row[c] += row[c - 1]`.'
      ],
      tests: [
        { name: '1 × 1 → 1', code: 'expect(uniquePaths(1, 1)).toBe(1);' },
        { name: 'одна лінія → 1', code: 'expect(uniquePaths(1, 10)).toBe(1);\nexpect(uniquePaths(10, 1)).toBe(1);' },
        { name: 'приклади з умови', code: 'expect(uniquePaths(3, 7)).toBe(28);\nexpect(uniquePaths(3, 2)).toBe(3);\nexpect(uniquePaths(7, 3)).toBe(28);' },
        { name: '10 × 10 → 48620', code: 'expect(uniquePaths(10, 10)).toBe(48620);' },
        { name: 'продуктивність: 18 × 18 миттєво (наївна рекурсія — мільярди викликів)', code: 'const t0 = performance.now();\nexpect(uniquePaths(18, 18)).toBe(2333606220);\nexpect(performance.now() - t0).toBeLessThan(500);' }
      ],
      explanation: `
**Патерн:** 2D DP на сітці (grid DP) зі стисненням до одного рядка.

**Ідея:**
1. **Стан:** \`dp[r][c]\` — кількість шляхів до клітинки (r, c).
2. **Перехід:** \`dp[r][c] = dp[r-1][c] + dp[r][c-1]\`.
3. **База:** перший рядок і стовпець — 1.
4. Рядок r залежить лише від рядка r−1 → один масив: перед оновленням \`row[c]\` ще зберігає значення «зверху», а \`row[c-1]\` — уже нове «зліва».

**Складність:** O(m·n) часу, O(n) пам'яті.

**Brute force vs оптимум:** рекурсія без кешу — кількість викликів дорівнює кількості шляхів, C(m+n−2, m−1) (для 18×18 — 2.3·10⁹). **Комбінаторика:** шлях — це вибір, які з m+n−2 кроків будуть «вниз»: C(m+n−2, m−1), O(min(m, n)) обчислень.

**Типові помилки:** \`new Array(m).fill(new Array(n))\` — усі рядки — один і той самий масив; межі циклу з 0 замість 1; плутанина m/n.

**Що спитають далі:** Unique Paths II — з перешкодами (клітинка-перешкода → 0)? Minimum Path Sum — мінімальна сума на шляху? Як обчислити C(n, k) без переповнення?
`
    },
    {
      id: 'algoadv-lcs',
      group: 'dp-2d',
      type: 'code',
      level: 3,
      title: 'Найдовша спільна підпослідовність (LCS)',
      tags: ['dp', 'strings'],
      description: `
**Завдання.** Напишіть \`longestCommonSubsequence(a, b)\` — довжину найдовшої спільної **підпослідовності** двох рядків. Підпослідовність отримується видаленням деяких символів без зміни порядку решти (не обов'язково підряд).

**Де трапляється:** diff текстів і порівняння версій.

\`\`\`js
longestCommonSubsequence('abcde', 'ace'); // 3  ("ace")
longestCommonSubsequence('abc', 'def');   // 0
\`\`\`

Довжини рядків — до 2000.

**Як це працює:** dp[i][j] — LCS перших i символів a і перших j символів b. Символи рівні → dp[i − 1][j − 1] + 1, інакше max(dp[i − 1][j], dp[i][j − 1]). Зберігаємо лише попередній рядок.
`,
      starter: `function longestCommonSubsequence(a, b) {
  // 1. Попередній рядок dp з нулів довжини b.length + 1
  // 2. Символи рівні → prev[j − 1] + 1, інакше max(prev[j], cur[j − 1])
  // 3. Відповідь — останній елемент останнього рядка
  // TODO
}
`,
      solution: `function longestCommonSubsequence(a, b) {
  // dp[i][j] — LCS префіксів a[0..i) та b[0..j). Зберігаємо лише попередній рядок.
  let prev = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    const cur = new Array(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        cur[j] = prev[j - 1] + 1;              // символи збігаються — продовжуємо LCS
      } else {
        cur[j] = Math.max(prev[j], cur[j - 1]); // відкидаємо символ з a або з b
      }
    }
    prev = cur;
  }
  return prev[b.length];
}
`,
      hints: [
        'Порівнюйте останні символи префіксів. Якщо вони рівні — вони входять у LCS. Якщо ні — один з них можна відкинути.',
        '`dp[i][j]` — LCS для `a[0..i)` і `b[0..j)`: якщо `a[i-1] === b[j-1]`, то `dp[i-1][j-1] + 1`, інакше `max(dp[i-1][j], dp[i][j-1])`. База — нулі.',
        'Таблиця (n+1)×(m+1); відповідь — `dp[n][m]`. Для економії пам\'яті тримайте лише попередній і поточний рядки.'
      ],
      tests: [
        { name: 'класичний приклад', code: 'expect(longestCommonSubsequence("abcde", "ace")).toBe(3);' },
        { name: 'однакові рядки', code: 'expect(longestCommonSubsequence("abc", "abc")).toBe(3);' },
        { name: 'немає спільних символів', code: 'expect(longestCommonSubsequence("abc", "def")).toBe(0);' },
        { name: 'порожній рядок', code: 'expect(longestCommonSubsequence("", "abc")).toBe(0);\nexpect(longestCommonSubsequence("abc", "")).toBe(0);' },
        { name: 'порядок має значення, повтори символів', code: 'expect(longestCommonSubsequence("abc", "cba")).toBe(1);\nexpect(longestCommonSubsequence("aab", "azb")).toBe(2);\nexpect(longestCommonSubsequence("bsbininm", "jmjkbkjkv")).toBe(1);' },
        { name: 'продуктивність: два рядки по 2000 символів', code: 'const a = "ab".repeat(1000);\nconst b = "ba".repeat(1000);\nconst t0 = performance.now();\nexpect(longestCommonSubsequence(a, b)).toBe(1999);\nexpect(performance.now() - t0).toBeLessThan(1500);' }
      ],
      explanation: `
**Патерн:** 2D DP на двох рядках (two-sequence DP) — той самий каркас, що й edit distance, diff.

**Ідея:**
1. **Стан:** \`dp[i][j]\` — LCS префіксів \`a[0..i)\`, \`b[0..j)\`.
2. **Перехід:** збіг останніх символів → \`dp[i-1][j-1] + 1\`; інакше \`max(dp[i-1][j], dp[i][j-1])\`.
3. **База:** порожній префікс → 0.
4. Рядок i залежить лише від рядка i−1 → два масиви.

**Складність:** O(n·m) часу (4·10⁶ для 2000×2000), O(m) пам'яті (O(n·m), якщо треба відновити саму підпослідовність).

**Brute force vs оптимум:** перебір 2ⁿ підпослідовностей a з перевіркою в b — неможливо вже для n = 40. Рекурсія без кешу — O(2^(n+m)).

**Де на фронтенді:** алгоритми diff (git diff, порівняння текстів), reconciliation у віртуальному DOM спирається на схожі ідеї (але React використовує евристики O(n), а не LCS).

**Типові помилки:** плутати підпослідовність з **підрядком** (substring — інша рекурентність: при незбігу 0); зсув індексів \`a[i]\` замість \`a[i - 1]\`; \`Array(n).fill([])\` — спільний рядок.

**Що спитають далі:** відновити саму LCS (прохід назад по таблиці)? Longest Common Substring? Мінімальна кількість видалень, щоб рядки стали рівними (n + m − 2·LCS)?
`
    },
    {
      id: 'algoadv-edit-distance',
      group: 'dp-2d',
      type: 'code',
      level: 4,
      title: 'Відстань редагування (Левенштейн)',
      tags: ['dp', 'strings'],
      description: `
**Завдання.** Напишіть \`minDistance(a, b)\` — мінімальну кількість операцій, щоб перетворити \`a\` на \`b\`. Дозволені операції над одним символом: **вставка**, **видалення**, **заміна**.

**Де трапляється:** підказки «можливо, ви мали на увазі», нечіткий пошук.

\`\`\`js
minDistance('horse', 'ros');           // 3  (horse → rorse → rose → ros)
minDistance('intention', 'execution'); // 5
minDistance('', 'abc');                // 3
\`\`\`

Довжини — до 1500.

**Як це працює:** dp[i][j] — операцій, щоб перетворити перші i символів a на перші j символів b. Символи рівні → dp[i − 1][j − 1], інакше 1 + min(вставка, видалення, заміна). База: dp[i][0] = i, dp[0][j] = j.
`,
      starter: `function minDistance(a, b) {
  // 1. Перший рядок: 0..m (лише вставки)
  // 2. Для кожного i: cur[0] = i; рівні → prev[j − 1], інакше 1 + min(трьох сусідів)
  // 3. Відповідь — prev[m] після останнього рядка
  // TODO
}
`,
      solution: `function minDistance(a, b) {
  const n = a.length;
  const m = b.length;
  // prev[j] — відстань між a[0..i-1) і b[0..j); старт: з порожнього рядка — j вставок
  let prev = Array.from({ length: m + 1 }, (_, j) => j);
  for (let i = 1; i <= n; i++) {
    const cur = new Array(m + 1);
    cur[0] = i; // i видалень, щоб отримати порожній рядок
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        cur[j] = prev[j - 1]; // символи рівні — операція не потрібна
      } else {
        cur[j] = 1 + Math.min(
          prev[j - 1], // заміна
          prev[j],     // видалення a[i-1]
          cur[j - 1]   // вставка b[j-1]
        );
      }
    }
    prev = cur;
  }
  return prev[m];
}
`,
      hints: [
        '`dp[i][j]` — відстань між префіксами `a[0..i)` і `b[0..j)`. База: `dp[i][0] = i`, `dp[0][j] = j`.',
        'Якщо `a[i-1] === b[j-1]` — `dp[i][j] = dp[i-1][j-1]`. Інакше `1 + min(заміна dp[i-1][j-1], видалення dp[i-1][j], вставка dp[i][j-1])`.',
        'Як і в LCS, достатньо двох рядків таблиці.'
      ],
      tests: [
        { name: 'класичні приклади', code: 'expect(minDistance("horse", "ros")).toBe(3);\nexpect(minDistance("intention", "execution")).toBe(5);\nexpect(minDistance("kitten", "sitting")).toBe(3);' },
        { name: 'порожні рядки', code: 'expect(minDistance("", "")).toBe(0);\nexpect(minDistance("", "abc")).toBe(3);\nexpect(minDistance("abc", "")).toBe(3);' },
        { name: 'однакові рядки → 0', code: 'expect(minDistance("same", "same")).toBe(0);' },
        { name: 'одна операція кожного типу', code: 'expect(minDistance("cat", "cut")).toBe(1);\nexpect(minDistance("cat", "cats")).toBe(1);\nexpect(minDistance("cat", "at")).toBe(1);' },
        { name: 'симетричність', code: 'expect(minDistance("sunday", "saturday")).toBe(3);\nexpect(minDistance("saturday", "sunday")).toBe(3);' },
        { name: 'продуктивність: рядки по 1500 символів', code: 'const t0 = performance.now();\nexpect(minDistance("abc".repeat(500), "abd".repeat(500))).toBe(500);\nexpect(minDistance("a".repeat(1500), "b".repeat(1500))).toBe(1500);\nexpect(performance.now() - t0).toBeLessThan(1500);' }
      ],
      explanation: `
**Патерн:** 2D DP на двох рядках (як LCS), три переходи — три операції.

**Ідея:**
1. **Стан:** \`dp[i][j]\` — мінімум операцій, щоб \`a[0..i)\` перетворити на \`b[0..j)\`.
2. **База:** \`dp[i][0] = i\` (видалити все), \`dp[0][j] = j\` (вставити все).
3. **Перехід:** рівні останні символи → \`dp[i-1][j-1]\`; інакше \`1 + min\` з трьох:
   - заміна \`a[i-1]\` на \`b[j-1]\` → \`dp[i-1][j-1]\`;
   - видалення \`a[i-1]\` → \`dp[i-1][j]\`;
   - вставка \`b[j-1]\` → \`dp[i][j-1]\`.

**Складність:** O(n·m) часу, O(min(n, m)) пам'яті з двома рядками.

**Brute force vs оптимум:** рекурсія з трьома гілками без кешу — O(3^(n+m)). З мемоізацією — O(n·m), але глибина рекурсії до n+m.

**Де на фронтенді:** нечіткий пошук і «Можливо, ви мали на увазі…», автокорекція, підсвічування змін (diff), сортування результатів пошуку за схожістю.

**Типові помилки:** забута база (перший рядок/стовпець); переплутані напрямки вставки/видалення (на відповідь не впливає, але на співбесіді треба пояснити); \`cur[j - 1]\` з попереднього рядка замість поточного.

**Що спитають далі:** відновити послідовність операцій? Відстань Дамерау–Левенштейна (з перестановкою сусідніх)? Як перевірити «відстань ≤ 1» за O(n) (One Edit Distance)?
`
    },
    {
      id: 'algoadv-knapsack',
      group: 'dp-2d',
      type: 'code',
      level: 4,
      title: '0/1 Knapsack (задача про рюкзак)',
      tags: ['dp'],
      description: `
**Завдання.** Є \`n\` предметів з вагами \`weights[i]\` і цінностями \`values[i]\` та рюкзак місткістю \`capacity\`. Кожен предмет можна взяти **не більше одного разу**. Поверніть максимальну сумарну цінність, що вміщується в рюкзак.

**Де трапляється:** вибір під обмеження бюджету чи місця.

\`\`\`js
knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7); // 9  (ваги 3 + 4)
knapsack([2], [3], 10);                  // 3  — один предмет лише раз
\`\`\`

Обмеження: \`n ≤ 100\`, \`capacity ≤ 10⁴\`, ваги — додатні цілі.

**Як це працює:** dp[c] — найкраща цінність при місткості c. Для кожного предмета йдемо по c ЗВЕРХУ ВНИЗ: dp[c] = max(dp[c], dp[c − w] + v). Зворотний порядок гарантує, що предмет взято не більше разу.
`,
      starter: `function knapsack(weights, values, capacity) {
  // 1. dp довжини capacity + 1 з нулів
  // 2. Для кожного предмета: c від capacity до w включно
  // 3. dp[c] = max(dp[c], dp[c − w] + v)
  // TODO
}
`,
      solution: `function knapsack(weights, values, capacity) {
  // dp[c] — максимальна цінність при місткості c (для вже розглянутих предметів)
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i];
    const v = values[i];
    // Йдемо з кінця: dp[c - w] ще «старий» (без предмета i), тож предмет береться лише раз
    for (let c = capacity; c >= w; c--) {
      dp[c] = Math.max(dp[c], dp[c - w] + v);
    }
  }
  return dp[capacity];
}
`,
      hints: [
        'Для кожного предмета — два варіанти: взяти чи ні. Перебір 2ⁿ — неможливий для n = 100. Стан DP — (скільки предметів розглянули, скільки місця використали).',
        '`dp[i][c]` — найкраща цінність з перших i предметів при місткості c: `max(dp[i-1][c], dp[i-1][c - w] + v)`.',
        'Стисніть до одного масиву `dp[c]` і проходьте `c` **від capacity вниз до w** — інакше предмет можна буде взяти кілька разів.'
      ],
      tests: [
        { name: 'класичний приклад', code: 'expect(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7)).toBe(9);' },
        { name: 'кожен предмет лише раз', code: 'expect(knapsack([2], [3], 10)).toBe(3);\nexpect(knapsack([1, 1], [5, 5], 10)).toBe(10);' },
        { name: 'нульова місткість і порожній список', code: 'expect(knapsack([1, 2], [10, 20], 0)).toBe(0);\nexpect(knapsack([], [], 50)).toBe(0);' },
        { name: 'предмет важчий за рюкзак', code: 'expect(knapsack([11], [100], 10)).toBe(0);' },
        { name: 'жадібний за питомою цінністю помиляється', code: 'expect(knapsack([10, 20, 30], [60, 100, 120], 50)).toBe(220);\nexpect(knapsack([5, 4, 6, 3], [10, 40, 30, 50], 10)).toBe(90);' },
        { name: 'продуктивність: 100 предметів (перебір 2^100 неможливий)', code: `const w = [], v = [];
for (let i = 0; i < 100; i++) { w.push((i * 37) % 97 + 1); v.push((i * 53) % 89 + 1); }
const t0 = performance.now();
expect(knapsack(w, v, 1000)).toBe(2176);
expect(performance.now() - t0).toBeLessThan(1000);` }
      ],
      explanation: `
**Патерн:** 0/1 knapsack — 2D DP «предмети × місткість», стиснений до 1D зі зворотним проходом.

**Ідея:**
1. **Стан:** \`dp[i][c]\` — максимум цінності з перших i предметів при місткості c.
2. **Перехід:** не брати → \`dp[i-1][c]\`; брати (якщо \`w ≤ c\`) → \`dp[i-1][c - w] + v\`.
3. **Стиснення:** один масив; ітерація \`c\` **згори вниз** гарантує, що \`dp[c - w]\` ще відповідає рядку i−1.

**Складність:** O(n · capacity) часу (10⁶ для 100 × 10⁴), O(capacity) пам'яті. Це **псевдополіноміальний** алгоритм: залежить від числового значення capacity, а не від розміру вводу (задача NP-повна).

**Brute force vs оптимум:** перебір підмножин — O(2ⁿ); для n = 100 ~10³⁰. Жадібний за \`v / w\` — неправильний для 0/1 (правильний лише для **дробового** рюкзака).

**Типові помилки:**
- Прохід \`c\` від \`w\` угору → кожен предмет береться багато разів (це **unbounded** knapsack — теж корисно знати!).
- Плутанина з coin change: там мінімізація кількості, тут максимізація цінності.

**Що спитають далі:** відновити набір предметів? Partition Equal Subset Sum (чи можна розбити масив на дві рівні суми — рюкзак з boolean)? Target Sum? Що робити, якщо capacity = 10⁹, а n = 30 (meet in the middle)?
`
    },
    // ---------------------------------------------------------------- Жадібні алгоритми та інтервали
    {
      id: 'algoadv-greedy-theory', why: ["Ні: для [1, 3, 4] і суми 6 жадібний помиляється.","Ні: сортують за часом закінчення.","Ні: greedy не переглядає рішення, DP перебирає варіанти.","Так: коректність доводять аргументом обміну.","Ні: для 0/1 рюкзака жадібний неоптимальний — потрібен DP."],
      group: 'greedy',
      type: 'theory',
      level: 3,
      title: 'Жадібні алгоритми: коли працюють і як це довести',
      tags: ['greedy', 'dp'],
      question: 'Що таке жадібний алгоритм? Як зрозуміти, що жадібний підхід дає оптимальну відповідь, і чим він відрізняється від DP? Наведіть приклади, де він працює і де ні.',
      choices: [
        'Жадібний розмін оптимальний для будь-якого набору монет, наприклад для `[1, 3, 4]` і суми 6',
        'Для максимуму непересічних інтервалів їх сортують за часом початку й беруть перший вільний',
        'Greedy і DP відрізняються лише записом: обидва переглядають усі варіанти підзадач',
        'Greedy коректний за властивості жадібного вибору: це доводять обміном або шукають контрприклад',
        'Для 0/1 рюкзака оптимально брати предмети за спаданням цінності на кілограм ваги, поки влазять',
      ],
      correct: 3,
      hint: 'Greedy choice property, exchange argument, контрприклад; інтервали, монети, рюкзак.',
      answer: `
**Жадібний алгоритм (greedy)** на кожному кроці робить **локально найкращий** вибір і ніколи його не переглядає. Він зазвичай простий і швидкий (часто O(n log n) через сортування + O(n) прохід), але правильний лише для задач з особливими властивостями.

**Коли greedy коректний:**
1. **Властивість жадібного вибору (greedy choice property):** існує оптимальне рішення, яке починається з жадібного вибору.
2. **Оптимальна підструктура:** після вибору лишається менша задача того самого типу.

**Як довести — аргумент обміну (exchange argument):** беремо будь-яке оптимальне рішення, що відрізняється від жадібного, і показуємо, що його перший «нежадібний» елемент можна замінити жадібним без погіршення.

**Класичний приклад — interval scheduling** (максимум непересічних зустрічей): сортуємо за **часом закінчення** і беремо кожну зустріч, що не перетинається з останньою взятою.

\`\`\`js
function maxNonOverlapping(intervals) {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]);
  let count = 0, lastEnd = -Infinity;
  for (const [s, e] of sorted) {
    if (s >= lastEnd) { count++; lastEnd = e; }
  }
  return count;
}
\`\`\`

Чому за кінцем: зустріч, що закінчується найраніше, залишає найбільше часу для решти (обмін: замініть першу зустріч оптимального розкладу на нашу — нічого не зламається). Сортування за початком або тривалістю — **неправильне** (є контрприклади).

**Де greedy працює:** interval scheduling, мінімум кімнат для зустрічей, Jump Game, Best Time to Buy and Sell Stock, коди Хаффмана, Дейкстра, Прім/Крускал, дробовий рюкзак, розмін у канонічних системах монет.

**Де ні:** розмін монет \`[1, 3, 4]\` на 6 (greedy 3 монети, оптимум 2), 0/1 рюкзак, найдовший шлях. Тут потрібен **DP**, який розглядає **всі** варіанти підзадач і агрегує їх.

**Практика на співбесіді:** запропонуйте жадібну ідею, **спробуйте знайти контрприклад** на маленьких даних; якщо не вдається — коротко поясніть exchange argument. Якщо контрприклад знайшовся — переходьте до DP.
`,
      keyPoints: [
        'Локально оптимальний вибір без перегляду',
        'Greedy choice property + оптимальна підструктура',
        'Доведення через exchange argument або пошук контрприкладу',
        'Interval scheduling: сортування за часом закінчення',
        'Контрприклади: монети [1, 3, 4], 0/1 рюкзак → DP'
      ],
      followUps: [
        'Чому Дейкстра — жадібний алгоритм і чому він не працює з від\'ємними вагами?',
        'Чому для interval scheduling не можна сортувати за тривалістю?',
        'Як відрізнити задачу на greedy від задачі на DP на співбесіді?'
      ]
    },
    {
      id: 'algoadv-best-time-stock',
      group: 'greedy',
      type: 'code',
      level: 1,
      interview: true,
      title: 'Best Time to Buy and Sell Stock',
      tags: ['greedy', 'arrays'],
      description: `
**Завдання.** \`prices[i]\` — ціна акції в день \`i\`. Можна **один раз** купити і пізніше **один раз** продати. Поверніть максимальний прибуток (або \`0\`, якщо заробити неможливо).

**Де трапляється:** одна з найпоширеніших задач співбесід.

\`\`\`js
maxProfit([7, 1, 5, 3, 6, 4]); // 5  (купити за 1, продати за 6)
maxProfit([7, 6, 4, 3, 1]);    // 0
\`\`\`

До 100 000 днів — потрібен один прохід.

**Як це працює:** Один прохід: тримаємо мінімальну ціну до сьогодні і найкращий прибуток. Кожен день — або нова мінімальна ціна купівлі, або кандидат на продаж: ціна − мінімум.
`,
      starter: `function maxProfit(prices) {
  // 1. minPrice = Infinity, best = 0
  // 2. Кожен день: оновити мінімум або best = max(best, ціна − minPrice)
  // TODO
}
`,
      solution: `function maxProfit(prices) {
  let minPrice = Infinity; // найдешевша ціна на сьогодні
  let best = 0;
  for (const p of prices) {
    if (p < minPrice) minPrice = p;           // краще купувати сьогодні
    else if (p - minPrice > best) best = p - minPrice; // або продати сьогодні
  }
  return best;
}
`,
      hints: [
        'Перебір усіх пар (купівля, продаж) — O(n²). Для кожного дня продажу найкраща купівля — це **мінімальна ціна до цього дня**.',
        'Ідіть зліва направо, тримаючи `minPrice` — мінімум серед уже переглянутих днів, і оновлюйте відповідь `price - minPrice`.',
        '`for (const p of prices) { minPrice = Math.min(minPrice, p); best = Math.max(best, p - minPrice); }`'
      ],
      tests: [
        { name: 'класичний приклад', code: 'expect(maxProfit([7, 1, 5, 3, 6, 4])).toBe(5);' },
        { name: 'ціни лише падають → 0', code: 'expect(maxProfit([7, 6, 4, 3, 1])).toBe(0);' },
        { name: 'порожній масив і один день → 0', code: 'expect(maxProfit([])).toBe(0);\nexpect(maxProfit([5])).toBe(0);' },
        { name: 'мінімум після максимуму не допомагає', code: 'expect(maxProfit([2, 4, 1])).toBe(2);\nexpect(maxProfit([3, 8, 1, 5])).toBe(5);' },
        { name: 'однакові ціни → 0', code: 'expect(maxProfit([3, 3, 3])).toBe(0);' },
        { name: 'продуктивність: 100 000 днів', code: `const n = 100000;
const up = Array.from({ length: n }, (_, i) => i);
const down = Array.from({ length: n }, (_, i) => n - i);
const v = Array.from({ length: n }, (_, i) => Math.abs(50000 - i) + 1);
const t0 = performance.now();
expect(maxProfit(up)).toBe(n - 1);
expect(maxProfit(down)).toBe(0);
expect(maxProfit(v)).toBe(49999);
expect(performance.now() - t0).toBeLessThan(500);` }
      ],
      explanation: `
**Патерн:** жадібний один прохід з «найкращим на цей момент» (running minimum). Також можна бачити як Kadane на різницях сусідніх цін.

**Ідея:**
1. Продаючи в день i, найвигідніше було купити за мінімальною ціною серед днів 0..i−1.
2. Тримаємо \`minPrice\` і на кожному кроці оновлюємо \`best = max(best, p - minPrice)\`.

**Складність:** O(n) часу, O(1) пам'яті.

**Brute force vs оптимум:** подвійний цикл по парах (i < j) — O(n²): 5·10⁹ для 10⁵ днів.

**Типові помилки:**
- \`max(prices) - min(prices)\` — ігнорує порядок (мінімум може бути після максимуму: \`[2, 4, 1]\`).
- Повертати від'ємний прибуток замість 0.
- Ініціалізувати \`minPrice = prices[0]\` без перевірки порожнього масиву.

**Що спитають далі:** необмежена кількість угод (Stock II — сума всіх додатних різниць)? Максимум дві угоди (Stock III — DP зі станами)? Комісія/кулдаун (DP зі станами «тримаю / не тримаю»)? Повернути самі дні купівлі та продажу?
`
    },
    {
      id: 'algoadv-jump-game',
      group: 'greedy',
      type: 'code',
      level: 2,
      title: 'Jump Game',
      tags: ['greedy', 'arrays'],
      description: `
**Завдання.** Ви стоїте на індексі 0 масиву \`nums\`. \`nums[i]\` — **максимальна** довжина стрибка з позиції \`i\` (можна стрибнути на будь-яку відстань від 1 до \`nums[i]\`). Чи можна дістатися **останнього** індексу?

**Де трапляється:** жадібна досяжність, класика співбесід.

\`\`\`js
canJump([2, 3, 1, 1, 4]); // true
canJump([3, 2, 1, 0, 4]); // false — усі шляхи впираються в 0 на індексі 3
\`\`\`

До 100 000 елементів зі значеннями до 10⁵.

**Як це працює:** Жадібно тримаємо найдальший досяжний індекс reach. Якщо поточний i > reach — далі не пройти. Інакше reach = max(reach, i + nums[i]); досягли кінця — true.
`,
      starter: `function canJump(nums) {
  // 1. reach = 0
  // 2. Для кожного i: i > reach → false; reach = max(reach, i + nums[i])
  // 3. Дійшли до кінця → true
  // TODO
}
`,
      solution: `function canJump(nums) {
  let reach = 0; // найдальший індекс, досяжний на цей момент
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false; // до i не дістатись — далі теж
    reach = Math.max(reach, i + nums[i]);
    if (reach >= nums.length - 1) return true;
  }
  return true; // порожній масив або вже на місці
}
`,
      hints: [
        'Не потрібно знати, **як** саме стрибати. Достатньо знати, наскільки далеко взагалі можна дістатися.',
        'Тримайте `reach` — найдальший досяжний індекс. Ідіть зліва направо: якщо `i > reach`, позиція i недосяжна → `false`.',
        'Інакше оновлюйте `reach = max(reach, i + nums[i])`. Якщо `reach >= n - 1` — `true`.'
      ],
      tests: [
        { name: 'досяжно', code: 'expect(canJump([2, 3, 1, 1, 4])).toBe(true);\nexpect(canJump([2, 0, 0])).toBe(true);' },
        { name: 'недосяжно', code: 'expect(canJump([3, 2, 1, 0, 4])).toBe(false);\nexpect(canJump([0, 1])).toBe(false);' },
        { name: 'один елемент — уже на місці', code: 'expect(canJump([0])).toBe(true);\nexpect(canJump([5])).toBe(true);' },
        { name: 'треба перестрибнути нулі', code: 'expect(canJump([1, 2, 0, 1, 0])).toBe(true);\nexpect(canJump([1, 1, 0, 1])).toBe(false);' },
        { name: 'продуктивність: 100 000 елементів з довгими стрибками', code: `const n = 100000;
const bad = Array.from({ length: n }, (_, i) => Math.max(0, n - 2 - i)); // усі стрибки впираються в n - 2
const good = new Array(n).fill(1);
const t0 = performance.now();
expect(canJump(bad)).toBe(false);
expect(canJump(good)).toBe(true);
expect(performance.now() - t0).toBeLessThan(500);` }
      ],
      explanation: `
**Патерн:** greedy з підтримкою **найдальшої досяжної межі** (farthest reach).

**Ідея:**
1. Множина досяжних індексів — завжди суцільний відрізок \`[0, reach]\` (якщо дістались до j, то й до всіх менших на шляху).
2. Проходимо зліва направо: кожен індекс у межах \`reach\` розширює межу до \`i + nums[i]\`.
3. Якщо зустріли \`i > reach\` — розрив, кінець недосяжний.

**Складність:** O(n) часу, O(1) пам'яті.

**Brute force vs оптимум:**
- DFS/рекурсія по всіх стрибках — експоненційно.
- DP «\`good[i]\` = чи досяжний кінець з i», перевіряючи всі стрибки, — O(n · max(nums)) = O(n²): на тесті з довгими стрибками ~5·10⁹ операцій.
- Greedy — O(n).

**Типові помилки:** BFS з позначенням кожної клітинки в діапазоні стрибка (O(n²)); забути, що \`nums[i]\` — **максимум**, а не точна довжина; не обробити масив з одного елемента.

**Що спитають далі:** Jump Game II — **мінімальна** кількість стрибків (greedy по «рівнях» BFS: межа поточного стрибка і найдальша досяжна)? Jump Game III — стрибки на \`i ± nums[i]\` (BFS/DFS)? Чому greedy тут коректний?
`
    },
    {
      id: 'algoadv-erase-overlap-intervals',
      group: 'greedy',
      type: 'code',
      level: 3,
      title: 'Interval scheduling: мінімум видалень',
      tags: ['greedy', 'intervals', 'sorting'],
      description: `
**Завдання.** Дано масив інтервалів \`[start, end]\`. Поверніть **мінімальну** кількість інтервалів, які треба видалити, щоб решта **не перетиналися**. Інтервали, що лише торкаються (\`[1, 2]\` і \`[2, 3]\`), не перетинаються. Вхідний масив не мутувати.

**Де трапляється:** розклад, бронювання без накладок.

\`\`\`js
eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]]); // 1  (видалити [1, 3])
eraseOverlapIntervals([[1, 2], [1, 2], [1, 2]]);         // 2
eraseOverlapIntervals([[1, 2], [2, 3]]);                 // 0
\`\`\`

**Як це працює:** Сортуємо за часом закінчення і жадібно беремо інтервал, що закінчується найраніше і не перетинається з попереднім взятим. Відповідь = всього − взятих.
`,
      starter: `function eraseOverlapIntervals(intervals) {
  // 1. Сортувати за кінцем інтервалу
  // 2. Брати інтервал, якщо його початок >= кінця попереднього взятого
  // 3. Відповідь: всього − взятих
  // TODO
}
`,
      solution: `function eraseOverlapIntervals(intervals) {
  // Максимум непересічних = жадібно за найранішим кінцем; видалити треба решту
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]);
  let kept = 0;
  let lastEnd = -Infinity;
  for (const [start, end] of sorted) {
    if (start >= lastEnd) {
      kept++;
      lastEnd = end;
    }
  }
  return intervals.length - kept;
}
`,
      hints: [
        'Мінімум видалень = загальна кількість − **максимум непересічних** інтервалів. Друге — класична задача interval scheduling.',
        'Жадібно: відсортуйте за **кінцем** і беріть інтервал, якщо він починається не раніше кінця останнього взятого.',
        '`sort((a, b) => a[1] - b[1])`, `lastEnd = -Infinity`, `if (start >= lastEnd) { kept++; lastEnd = end; }`; відповідь — `n - kept`.'
      ],
      tests: [
        { name: 'приклади з умови', code: 'expect(eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]])).toBe(1);\nexpect(eraseOverlapIntervals([[1, 2], [1, 2], [1, 2]])).toBe(2);\nexpect(eraseOverlapIntervals([[1, 2], [2, 3]])).toBe(0);' },
        { name: 'порожній масив і один інтервал', code: 'expect(eraseOverlapIntervals([])).toBe(0);\nexpect(eraseOverlapIntervals([[5, 9]])).toBe(0);' },
        { name: 'довгий інтервал заважає кільком коротким', code: 'expect(eraseOverlapIntervals([[1, 100], [11, 22], [1, 11], [2, 12]])).toBe(2);\nexpect(eraseOverlapIntervals([[0, 10], [1, 2], [3, 4], [5, 6]])).toBe(1);' },
        { name: 'від\'ємні координати', code: 'expect(eraseOverlapIntervals([[-5, -1], [-3, 2], [-1, 3]])).toBe(1);' },
        { name: 'не мутує вхідний масив', code: 'const a = [[3, 4], [1, 2], [2, 3]];\nexpect(eraseOverlapIntervals(a)).toBe(0);\nexpect(a).toEqual([[3, 4], [1, 2], [2, 3]]);' },
        { name: 'продуктивність: 100 000 інтервалів', code: `const n = 100000;
const intervals = [];
for (let i = n - 1; i >= 0; i--) intervals.push([i, i + 2]);
const t0 = performance.now();
expect(eraseOverlapIntervals(intervals)).toBe(50000);
expect(performance.now() - t0).toBeLessThan(1000);` }
      ],
      explanation: `
**Патерн:** greedy **interval scheduling** — сортування за кінцем + один прохід.

**Ідея:**
1. Мінімум видалень = n − (максимальна кількість непересічних інтервалів).
2. Сортуємо за кінцем. Інтервал, що закінчується найраніше, — найкращий перший вибір: він лишає найбільше місця для решти (exchange argument).
3. Беремо інтервал, якщо \`start >= lastEnd\`, інакше «видаляємо».

**Складність:** O(n log n) на сортування + O(n) прохід; пам'ять O(n) на копію.

**Brute force vs оптимум:** перебір підмножин — O(2ⁿ); DP «як LIS» по відсортованих інтервалах — O(n²) (5·10⁹ для 10⁵). Greedy — O(n log n).

**Типові помилки:**
- Сортування за **початком** без додаткової логіки: \`[[1, 100], [2, 3], [4, 5]]\` — візьмемо \`[1, 100]\` і втратимо два. (Можна сортувати за початком, але при перетині залишати інтервал з меншим кінцем.)
- \`start > lastEnd\` замість \`>=\` — дотичні інтервали вважатимуться пересічними.
- Мутувати вхідний масив сортуванням.

**Що спитають далі:** Minimum Number of Arrows to Burst Balloons (та сама ідея, торкання — перетин)? Merge Intervals? Скільки кімнат потрібно для всіх зустрічей (наступна задача)?
`
    },
    {
      id: 'algoadv-meeting-rooms',
      group: 'greedy',
      type: 'code',
      level: 3,
      title: 'Meeting Rooms II: мінімум переговорних',
      tags: ['greedy', 'intervals', 'sorting'],
      description: `
**Завдання.** Дано розклад зустрічей \`[start, end]\` (напіввідкриті інтервали: зустріч, що закінчується о 10, і зустріч, що починається о 10, можуть бути в одній кімнаті). Поверніть **мінімальну** кількість переговорних кімнат, щоб провести всі зустрічі. Вхідний масив не мутувати.

**Де трапляється:** календарі: скільки кімнат потрібно одночасно.

\`\`\`js
minMeetingRooms([[0, 30], [5, 10], [15, 20]]); // 2
minMeetingRooms([[7, 10], [2, 4]]);            // 1
minMeetingRooms([[1, 10], [10, 20]]);          // 1
\`\`\`

До 100 000 зустрічей.

**Як це працює:** Окремо сортуємо початки і кінці. Йдемо по початках: якщо найраніший кінець ≤ поточного початку — кімната звільнилась (зсуваємо вказівник кінців), інакше потрібна нова кімната.
`,
      starter: `function minMeetingRooms(intervals) {
  // 1. Відсортувати окремо початки і кінці
  // 2. Для кожного початку: якщо найраніший кінець <= початку — зсунути вказівник кінців
  // 3. інакше rooms++
  // TODO
}
`,
      solution: `function minMeetingRooms(intervals) {
  const starts = intervals.map((m) => m[0]).sort((a, b) => a - b);
  const ends = intervals.map((m) => m[1]).sort((a, b) => a - b);
  let rooms = 0;
  let j = 0; // вказівник на найраніше закінчення серед ще «відкритих» зустрічей
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] < ends[j]) {
      rooms++; // жодна кімната не звільнилась — потрібна нова
    } else {
      j++;     // кімната звільнилась (end <= start) — використовуємо її повторно
    }
  }
  return rooms;
}
`,
      hints: [
        'Відповідь — максимальна кількість зустрічей, що йдуть **одночасно** в якийсь момент.',
        'Розділіть початки й кінці в два окремі відсортовані масиви. Йдіть по початках: якщо найраніший ще не використаний кінець ≤ поточного початку — кімната звільнилась, інакше потрібна нова.',
        'Альтернатива: відсортувати зустрічі за початком і тримати min-heap кінців; або «лінія подій» (+1 на початку, −1 на кінці, кінці раніше початків при рівному часі).'
      ],
      tests: [
        { name: 'класичний приклад', code: 'expect(minMeetingRooms([[0, 30], [5, 10], [15, 20]])).toBe(2);' },
        { name: 'зустрічі не перетинаються', code: 'expect(minMeetingRooms([[7, 10], [2, 4]])).toBe(1);' },
        { name: 'дотичні зустрічі — одна кімната', code: 'expect(minMeetingRooms([[1, 10], [10, 20], [20, 30]])).toBe(1);' },
        { name: 'порожній розклад і одна зустріч', code: 'expect(minMeetingRooms([])).toBe(0);\nexpect(minMeetingRooms([[1, 5]])).toBe(1);' },
        { name: 'однакові зустрічі', code: 'expect(minMeetingRooms([[1, 5], [1, 5], [1, 5], [1, 5]])).toBe(4);\nexpect(minMeetingRooms([[1, 4], [2, 5], [3, 6], [4, 7]])).toBe(3);' },
        { name: 'не мутує вхідний масив', code: 'const a = [[5, 8], [1, 3]];\nminMeetingRooms(a);\nexpect(a).toEqual([[5, 8], [1, 3]]);' },
        { name: 'продуктивність: 100 000 зустрічей', code: `const n = 100000;
const intervals = [];
for (let i = n - 1; i >= 0; i--) intervals.push([i, i + 100]); // у кожен момент — 100 зустрічей
const t0 = performance.now();
expect(minMeetingRooms(intervals)).toBe(100);
expect(performance.now() - t0).toBeLessThan(1000);` }
      ],
      explanation: `
**Патерн:** інтервали → **окремо відсортовані початки й кінці** + два вказівники (або sweep line / min-heap).

**Ідея:**
1. Кількість кімнат = максимум одночасних зустрічей.
2. Сортуємо початки й кінці окремо (яка зустріч чия — неважливо, важливі лише моменти подій).
3. Для кожного початку: якщо найраніший незакритий кінець ≤ початку — кімната звільнилась (\`j++\`), інакше відкриваємо нову (\`rooms++\`). \`rooms\` ніколи не зменшується і в кінці дорівнює максимуму.

**Складність:** O(n log n) на сортування, O(n) пам'яті.

| Підхід | Час |
|---|---|
| Для кожної зустрічі порахувати перетини з усіма | O(n²) |
| Сортування + min-heap кінців | O(n log n) |
| Два відсортовані масиви | O(n log n), простіший код |
| Sweep line (події +1/−1) | O(n log n) |

**Типові помилки:**
- \`starts[i] <= ends[j]\` — дотичні зустрічі займуть дві кімнати.
- У sweep line при рівному часі обробляти початок раніше кінця (та сама помилка).
- Мутувати вхід сортуванням масиву зустрічей.

**Що спитають далі:** Meeting Rooms I — чи може одна людина відвідати всі зустрічі (сортування + перевірка сусідів)? Повернути розподіл зустрічей по кімнатах (heap з id кімнат)? Як змінити рішення, якщо інтервали закриті \`[start, end]\`?
`
    }
  ]
});
