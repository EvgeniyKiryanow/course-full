FE.topic('js-strings-numbers', {
  intro: `
## Рядки

- Незмінні: методи повертають **новий** рядок, \`s[0] = 'X'\` нічого не змінює.
- \`slice(start, end)\` — від'ємні індекси рахуються з кінця; \`substring\` — від'ємні → 0, а \`start > end\` міняє місцями.
- \`replace('a', 'b')\` — лише перше входження; \`replaceAll\` — усі.
- \`indexOf\`, \`includes\`, \`startsWith\`, \`trim\`, \`split\`, \`join\`, \`padStart\`, \`at(-1)\`, \`toUpperCase\`.
- \`length\` рахує UTF-16 code units: \`'😀'.length === 2\`; \`Array.from(s)\` і \`for...of\` — по code points.

## Числа

- IEEE-754 double: \`0.1 + 0.2 === 0.30000000000000004\`. Порівнюйте з допуском \`Number.EPSILON\`, гроші тримайте в копійках (цілі).
- \`toFixed\` повертає **рядок** і округлює двійкове значення: \`(1.005).toFixed(2) === '1.00'\`.
- \`Math.round(-2.5) === -2\`; \`Math.floor\`, \`Math.ceil\`, \`Math.trunc\`.
- Випадкове ціле \`[min, max]\`: \`Math.floor(Math.random() * (max - min + 1)) + min\`.
- \`Number.MAX_SAFE_INTEGER\` = 2⁵³ − 1; більші цілі — \`BigInt\` (\`10n\`), без змішування з number.

## Intl і Date

- \`new Intl.NumberFormat('uk-UA').format(1234.5)\` → \`'1 234,5'\` (роздільник — нерозривний пробіл).
- \`new Intl.PluralRules('uk').select(n)\` → \`'one' | 'few' | 'many' | 'other'\`.
- \`Date\` зберігає мс від епохи UTC; місяці з **0**; порівняння — через \`getTime()\`.
- \`'2024-03-10'\` парситься як UTC, \`'2024-03-10T10:00'\` — як локальний час.

## RegExp

- Прапорці: \`g\` (усі збіги), \`i\` (без регістру), \`m\` (\`^\`/\`$\` для кожного рядка), \`u\` (Unicode, \`\\p{L}\`).
- Квантифікатори жадібні; \`+?\`, \`*?\` — ліниві.
- Групи \`( )\`, іменовані \`(?<name> )\`, незахоплюючі \`(?: )\`; lookahead \`(?= )\`, lookbehind \`(?<= )\`.
- \`test\`/\`exec\` з прапорцем \`g\` пам'ятають \`lastIndex\`.
- \`str.replace(re, (match, g1) => ...)\` — заміна функцією; у рядку заміни \`$&\`, \`$1\`, \`$<name>\`.
- Ввід користувача перед \`new RegExp\` треба екранувати.
`,
  groups: [
    { id: 'strings', title: 'Рядки: незмінність, slice, базові методи' },
    { id: 'search', title: 'Пошук і заміна в рядку' },
    { id: 'unicode', title: 'Unicode та емодзі' },
    { id: 'numbers', title: 'Числа: float, округлення, Math, BigInt' },
    { id: 'intl', title: 'Intl: формат чисел і множина' },
    { id: 'date', title: 'Date і часові пояси' },
    { id: 'regex', title: 'RegExp: основи та прапорці' },
    { id: 'regex-groups', title: 'RegExp: групи й заміна функцією' }
  ],
  items: [
    // ================================================================ 1. рядки
    {
      id: 'strnum-theory-string-basics',
      group: 'strings',
      type: 'theory',
      level: 1,
      title: 'Рядки: незмінність і основні методи',
      tags: ['strings'],
      question: 'Що означає, що рядки в JavaScript незмінні? Чим відрізняються `slice` і `substring`?',
      choices: [
        '`s[0] = \'X\'` змінює перший символ рядка, а методи на кшталт `trim` теж змінюють рядок на місці',
        'Методи повертають новий рядок; `slice` рахує від\'ємні індекси з кінця, а `substring` перетворює їх на `0`',
        '`substring` і `slice` взаємозамінні: обидва приймають від\'ємні індекси й не міняють аргументи місцями',
        '`substr(start, end)` — сучасна заміна `slice`, а `replace` з рядком замінює всі входження підрядка'
      ],
      correct: 1,
      why: [
        "Рядок змінити неможливо: запис за індексом ігнорується, а `trim` повертає новий рядок.",
        "Правильно: результат методу треба зберегти в змінну, а від'ємні індекси розуміє лише slice.",
        "`substring` замінює від'ємні на 0 і міняє місцями start > end, `slice` — ні.",
        "`substr(start, length)` застарів, а `replace` з рядком замінює лише перше входження."
      ],
      hint: 'Що повертає s.trim() — той самий рядок чи новий?',
      answer: `
- Рядки **незмінні**: методи повертають новий рядок → \`s = s.trim()\`.
- \`slice(-2)\` — два останні символи; \`substring(-2)\` → \`substring(0)\`.
- \`substring(4, 1)\` → як \`(1, 4)\`; \`slice(4, 1)\` → \`''\`.
- Часті методи: \`includes\`, \`indexOf\`, \`startsWith\`, \`trim\`, \`split\`, \`padStart\`, \`toUpperCase\`, \`at(-1)\`.
- Шаблонний рядок (у зворотних лапках) підставляє вирази через \`\${name}\` і може бути багаторядковим.
`,
      keyPoints: ['Рядки незмінні — методи повертають новий рядок', 'slice: від\'ємні з кінця', 'substring: від\'ємні → 0, міняє місцями аргументи', 'replace з рядком — лише перше входження'],
      followUps: ['Як отримати останній символ рядка?', 'Чому substr не рекомендують?']
    },
    {
      id: 'strnum-quiz-immutable',
      group: 'strings',
      type: 'quiz',
      level: 1,
      title: 'Незмінність рядків',
      tags: ['strings'],
      question: `
Що виведе код (не strict mode)?

\`\`\`js
let s = 'hello';
s[0] = 'H';
s.toUpperCase();
console.log(s, s[0], s.at(-1));
\`\`\`
`,
      options: ['`Hello H o`', '`HELLO H O`', '`hello h o`', '`hello h undefined`'],
      answer: 2,
      why: [
        "Запис за індексом у рядок мовчки ігнорується — рядок незмінний.",
        "`toUpperCase()` повертає новий рядок, а результат тут ніде не збережено.",
        "Правильно: s не змінився, а `at(-1)` бере останній символ.",
        "`at(-1)` рахує з кінця й повертає «o»; undefined дав би `s[-1]`."
      ],
      hint: 'Чи змінює toUpperCase рядок s?',
      explanation: `
Рядок змінити не можна: треба \`s = s.toUpperCase()\`. \`at(-1)\` — останній символ, а \`s[-1]\` → \`undefined\`.
`
    },
    {
      id: 'strnum-quiz-slice-substring',
      group: 'strings',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'slice vs substring',
      tags: ['strings'],
      question: `
\`slice(start, end)\` і \`substring(start, end)\` повертають частину рядка з \`start\` до \`end\` (не включно).

Що виведе код?

\`\`\`js
const s = 'abcdef';
console.log(s.slice(-2), s.substring(-2), s.substring(4, 1), s.slice(4, 1));
\`\`\`
`,
      options: [
        '`"ef" "abcdef" "bcd" ""`',
        '`"ef" "ef" "bcd" "bcd"`',
        '`"ef" "" "" ""`',
        '`"ef" "abcdef" "" "bcd"`'
      ],
      answer: 0,
      why: [
        "Правильно: slice рахує -2 з кінця; substring робить -2 нулем і міняє 4 та 1 місцями; slice(4, 1) — порожньо.",
        "`substring` не розуміє від'ємних індексів — -2 стає 0, тож повертається весь рядок.",
        "`substring(-2)` → `substring(0)` — увесь рядок, а не порожній.",
        "Навпаки: місцями аргументи міняє substring, а slice при start > end повертає ''."
      ],
      hint: 'Хто з них розуміє від\'ємні індекси, а хто міняє аргументи місцями?',
      explanation: `
На практиці беріть \`slice\`: передбачуваний і вміє рахувати з кінця (\`slice(-3)\` — останні 3 символи).
`
    },
    {
      id: 'strnum-truncate',
      group: 'strings',
      type: 'code',
      level: 1,
      title: 'truncate з трикрапкою',
      tags: ['strings'],
      description: `
**Завдання.** Напишіть \`truncate(str, maxLength, ellipsis = '…')\`, що обрізає довгий текст і додає трикрапку.

**Де трапляється:** назви товарів у картках, превʼю повідомлень, заголовки в таблицях.

**Що написати**
- \`truncate(str, maxLength, ellipsis = '…')\` → рядок:
  - \`str.length <= maxLength\` → \`str\` без змін;
  - інакше — початок рядка + \`ellipsis\`, разом **не довше** за \`maxLength\`; пробіли в кінці обрізаної частини прибрати.

**Приклад**
\`\`\`js
truncate('Hello world', 20);        // 'Hello world'
truncate('Hello world', 8);         // 'Hello w…'
truncate('Hello world', 7);         // 'Hello…'   (не 'Hello …')
truncate('Hello world', 8, '...');  // 'Hello...'
\`\`\`

**Як це працює:** місце під текст = \`maxLength - ellipsis.length\`. \`str.slice(0, n)\` бере перші n символів, \`trimEnd()\` прибирає пробіли в кінці. Обидва повертають **новий** рядок.

**Врахуйте:** порожній рядок → \`''\`.
`,
      starter: `function truncate(str, maxLength, ellipsis = '…') {
  // 1. Вміщається — поверніть str.
  // TODO

  // 2. Скільки символів тексту лишити: maxLength - ellipsis.length.
  // 3. slice + trimEnd + ellipsis.
  // TODO
}

// Спробуйте в консолі:
// truncate('Hello world', 8); // 'Hello w…'
`,
      solution: `function truncate(str, maxLength, ellipsis = '…') {
  if (str.length <= maxLength) return str;
  const keep = Math.max(maxLength - ellipsis.length, 0);
  // trimEnd — щоб не було 'Hello …'
  return str.slice(0, keep).trimEnd() + ellipsis;
}
`,
      hints: [
        'Спершу `if (str.length <= maxLength) return str;`.',
        '`return str.slice(0, maxLength - ellipsis.length).trimEnd() + ellipsis;`'
      ],
      tests: [
        { name: 'короткий рядок без змін', code: 'expect(truncate("Hello world", 20)).toBe("Hello world");\nexpect(truncate("Hello", 5)).toBe("Hello");' },
        { name: 'обрізає з урахуванням трикрапки', code: 'expect(truncate("Hello world", 8)).toBe("Hello w…");\nexpect(truncate("Hello world", 8).length).toBe(8);' },
        { name: 'прибирає пробіл перед трикрапкою', code: 'expect(truncate("Hello world", 7)).toBe("Hello…");' },
        { name: 'власний ellipsis', code: 'expect(truncate("Hello world", 8, "...")).toBe("Hello...");' },
        { name: 'порожній рядок', code: 'expect(truncate("", 3)).toBe("");' }
      ],
      explanation: `
O(n). Помилка — забути врахувати довжину \`ellipsis\` (результат стає довшим за ліміт). Далі можуть спитати: як не розрізати емодзі (\`'😀'.length === 2\`) — див. крок про Unicode; як обрізати по слову?
`
    },
    {
      id: 'strnum-capitalize-words',
      group: 'strings',
      type: 'code',
      level: 1,
      title: 'Кожне слово з великої літери',
      tags: ['strings'],
      description: `
**Завдання.** Напишіть \`capitalizeWords(str)\`: перша літера кожного слова — велика, решта — малі. Слова розділені пробілами, **кількість пробілів зберігається**.

**Де трапляється:** імена користувачів з форми (\`'іВАН петренко'\`), заголовки карток.

**Що написати**
- \`capitalizeWords(str)\` → новий рядок

**Приклад**
\`\`\`js
capitalizeWords('hello world');    // 'Hello World'
capitalizeWords('hELLO   wORLD');  // 'Hello   World'
capitalizeWords('київ і львів');   // 'Київ І Львів'
\`\`\`

**Як це працює:** \`str.split(' ')\` дає масив слів; кілька пробілів поспіль дають порожні рядки \`''\`, тож \`join(' ')\` відновить їх. \`toUpperCase\`/\`toLowerCase\` працюють і з кирилицею.

**Врахуйте:** порожні «слова» пропускайте (\`''[0]\` → \`undefined\`); дефіс не починає нове слово.
`,
      starter: `function capitalizeWords(str) {
  // 1. Переведіть рядок у нижній регістр і розбийте split(' ').
  // 2. У циклі: для непорожнього слова — word[0].toUpperCase() + word.slice(1).
  // 3. Зберіть назад через join(' ').
  // TODO
}

// Спробуйте в консолі:
// capitalizeWords('hELLO   wORLD'); // 'Hello   World'
`,
      solution: `function capitalizeWords(str) {
  const words = str.toLowerCase().split(' ');
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    // кілька пробілів поспіль дають порожні рядки — їх пропускаємо
    if (word !== '') words[i] = word[0].toUpperCase() + word.slice(1);
  }
  return words.join(' ');
}
`,
      hints: [
        '`const words = str.toLowerCase().split(\' \');` і цикл `for` за індексом.',
        'У циклі: `if (word !== \'\') words[i] = word[0].toUpperCase() + word.slice(1);`, наприкінці `words.join(\' \')`.'
      ],
      tests: [
        'expect(capitalizeWords("hello world")).toBe("Hello World")',
        { name: 'решта літер стає малими', code: 'expect(capitalizeWords("hELLO wORLD")).toBe("Hello World");' },
        { name: 'пробіли зберігаються', code: 'expect(capitalizeWords("  a   b")).toBe("  A   B");' },
        { name: 'кирилиця', code: 'expect(capitalizeWords("київ і львів")).toBe("Київ І Львів");' },
        { name: 'порожній рядок і одне слово', code: 'expect(capitalizeWords("")).toBe("");\nexpect(capitalizeWords("x")).toBe("X");' },
        { name: 'дефіс не починає нове слово', code: 'expect(capitalizeWords("mary-jane smith")).toBe("Mary-jane Smith");' }
      ],
      explanation: `
O(n). Помилка — \`split(/\\s+/)\` і \`join(' ')\` губить кількість пробілів. Альтернатива одним рядком — \`replace\` з регулярним виразом і функцією (крок про RegExp).
`
    },

    // ================================================================ 2. пошук і заміна
    {
      id: 'strnum-quiz-replace',
      group: 'search',
      type: 'quiz',
      level: 1,
      title: 'replace, replaceAll і split',
      tags: ['strings'],
      question: `
\`replace(a, b)\` з рядком замінює **лише перше** входження. \`split(sep)\` розбиває рядок на масив.

Що виведе код?

\`\`\`js
console.log('a-b-c'.replace('-', '+'));
console.log('a-b-c'.replaceAll('-', '+'));
console.log('a-b-c'.split('-'));
\`\`\`
`,
      options: [
        '`a+b+c`, `a+b+c`, `[\'a\', \'b\', \'c\']`',
        '`a+b-c`, `a+b+c`, `[\'a-b-c\']`',
        '`a+b-c`, `a+b+c`, `[\'a\', \'b\', \'c\']`',
        '`a+b-c`, `a+b-c`, `[\'a\', \'-\', \'b\', \'-\', \'c\']`'
      ],
      answer: 2,
      why: [
        "`replace` з рядком замінює лише перше входження — другий дефіс лишиться.",
        "`split('-')` ділить рядок у кожному місці дефіса, а не повертає його цілим.",
        "Правильно: replace — перше входження, replaceAll — усі, split прибирає роздільник.",
        "`replaceAll` замінює всі входження, а роздільник у результат split не потрапляє."
      ],
      hint: 'Скільки входжень замінює replace з рядком?',
      explanation: `
Щоб замінити всі входження: \`replaceAll('-', '+')\` або \`split('-').join('+')\`. Розбиття й склеювання — базовий прийом обробки тексту.
`
    },
    {
      id: 'strnum-count-occurrences',
      group: 'search',
      type: 'code',
      level: 2,
      title: 'Порахувати входження підрядка',
      tags: ['strings', 'search'],
      description: `
**Завдання.** Напишіть \`countOccurrences(str, sub, overlapping = false)\` — кількість входжень \`sub\` у \`str\`.

**Де трапляється:** «Знайдено 3 збіги» в пошуку по сторінці чи документу; класична задача на \`indexOf\`.

**Що написати**
- \`countOccurrences(str, sub, overlapping = false)\` → число:
  - \`overlapping = false\` — входження не перекриваються, \`true\` — можуть;
  - порожній \`sub\` → \`0\`; регістр має значення.

**Приклад**
\`\`\`js
countOccurrences('abababa', 'aba');        // 2
countOccurrences('abababa', 'aba', true);  // 3
countOccurrences('a.b.c', '.');            // 2
\`\`\`

**Як це працює:** \`str.indexOf(sub, from)\` шукає з позиції \`from\` і повертає індекс або \`-1\`. Після збігу продовжуйте пошук з \`index + sub.length\` (без перекриттів) або \`index + 1\` (з перекриттями).

**Врахуйте:** \`sub\` — звичайний текст, \`.\` чи \`(\` не мають спецзначення.
`,
      starter: `function countOccurrences(str, sub, overlapping = false) {
  // 1. Порожній sub → 0.
  // TODO

  // 2. let index = str.indexOf(sub); поки index !== -1:
  //    рахуємо і шукаємо далі з index + (overlapping ? 1 : sub.length).
  // TODO
}

// Спробуйте в консолі:
// countOccurrences('abababa', 'aba', true); // 3
`,
      solution: `function countOccurrences(str, sub, overlapping = false) {
  if (sub.length === 0) return 0;

  let count = 0;
  let index = str.indexOf(sub);
  while (index !== -1) {
    count++;
    // зсув на 1 — дозволяє перекриття; на довжину підрядка — ні
    index = str.indexOf(sub, index + (overlapping ? 1 : sub.length));
  }
  return count;
}
`,
      hints: [
        'Цикл `while (index !== -1)` з `str.indexOf(sub, from)`.',
        'Наступний пошук: `index = str.indexOf(sub, index + (overlapping ? 1 : sub.length));`'
      ],
      tests: [
        { name: 'без перекриттів', code: 'expect(countOccurrences("abababa", "aba")).toBe(2);\nexpect(countOccurrences("hello hello", "hello")).toBe(2);' },
        { name: 'з перекриттями', code: 'expect(countOccurrences("abababa", "aba", true)).toBe(3);\nexpect(countOccurrences("aaaa", "aa", true)).toBe(3);' },
        { name: 'немає входжень', code: 'expect(countOccurrences("abc", "x")).toBe(0);\nexpect(countOccurrences("", "x")).toBe(0);' },
        { name: 'порожній sub → 0', code: 'expect(countOccurrences("abc", "")).toBe(0);' },
        { name: 'спецсимволи — звичайні символи', code: 'expect(countOccurrences("a.b.c", ".")).toBe(2);\nexpect(countOccurrences("1+1+1", "1+1", true)).toBe(2);\nexpect(countOccurrences("(a)(b)", "(")).toBe(2);' },
        { name: 'регістр має значення', code: 'expect(countOccurrences("Aa aA", "a")).toBe(2);' }
      ],
      explanation: `
O(n·m) у гіршому випадку. Пастки: \`split(sub).length - 1\` не вміє перекриття; порожній \`sub\` без перевірки дає нескінченний цикл.
`
    },
    {
      id: 'strnum-safe-html',
      group: 'search',
      type: 'code',
      level: 2,
      interview: true,
      title: 'escapeHtml: захист від XSS',
      tags: ['strings', 'security'],
      description: `
**Завдання.** Напишіть \`escapeHtml(value)\`, що робить текст безпечним для вставки в HTML.

**Де трапляється:** коментар чи ім'я користувача вставляється через \`innerHTML\`. Без екранування \`<img src=x onerror=alert(1)>\` виконає чужий код (XSS).

**Що написати**
- \`escapeHtml(value)\` → рядок, де \`&\` → \`&amp;\`, \`<\` → \`&lt;\`, \`>\` → \`&gt;\`, \`"\` → \`&quot;\`, \`'\` → \`&#39;\`
  - \`null\`, \`undefined\` → \`''\`; інші значення → \`String(value)\` і екранування.

**Приклад**
\`\`\`js
escapeHtml('<b>Hi</b>');      // '&lt;b&gt;Hi&lt;/b&gt;'
escapeHtml('Tom & "Jerry"');  // 'Tom &amp; &quot;Jerry&quot;'
escapeHtml(5);                // '5'
escapeHtml(null);             // ''
\`\`\`

**Як це працює:** браузер показує \`&lt;\` як символ \`<\`, але не сприймає його як тег. \`replaceAll(a, b)\` замінює всі входження.

**Врахуйте:** \`&\` замінюйте **першим** — інакше \`&lt;\` перетвориться на \`&amp;lt;\`.
`,
      starter: `function escapeHtml(value) {
  // 1. null / undefined → ''.
  // TODO

  // 2. Перетворіть на рядок і замініть спецсимволи через replaceAll.
  //    Порядок важливий: & — першим!
  // TODO
}

// Спробуйте в консолі:
// escapeHtml('<b>Hi</b>'); // '&lt;b&gt;Hi&lt;/b&gt;'
`,
      solution: `function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replaceAll('&', '&amp;') // першим — щоб не зіпсувати вже замінені сутності
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
`,
      hints: [
        'Ланцюжок: `String(value).replaceAll(\'&\', \'&amp;\').replaceAll(\'<\', \'&lt;\')...`',
        'Якщо `&` замінити після `<`, то `&lt;` стане `&amp;lt;` — подвійне екранування.'
      ],
      tests: [
        { name: 'екранує теги', code: 'expect(escapeHtml("<img src=x onerror=alert(1)>")).toBe("&lt;img src=x onerror=alert(1)&gt;");' },
        { name: 'екранує &, лапки та апостроф', code: 'expect(escapeHtml("Tom & \\"Jerry\\" it\'s")).toBe("Tom &amp; &quot;Jerry&quot; it&#39;s");' },
        { name: '& замінюється першим (без подвійного екранування)', code: 'expect(escapeHtml("<")).toBe("&lt;");\nexpect(escapeHtml("&lt;")).toBe("&amp;lt;");' },
        { name: 'null / undefined → порожній рядок', code: 'expect(escapeHtml(null)).toBe("");\nexpect(escapeHtml(undefined)).toBe("");' },
        { name: 'інші типи — через String', code: 'expect(escapeHtml(5)).toBe("5");\nexpect(escapeHtml(0)).toBe("0");\nexpect(escapeHtml(false)).toBe("false");' }
      ],
      explanation: `
O(n). Краще взагалі не вставляти текст через \`innerHTML\`, а використовувати \`textContent\` — тоді екранування не потрібне. React екранує текст автоматично (крім \`dangerouslySetInnerHTML\`).
`
    },
    {
      id: 'strnum-palindrome',
      group: 'search',
      type: 'code',
      level: 2,
      interview: true,
      title: 'isPalindrome з кирилицею',
      tags: ['strings', 'two-pointers'],
      description: `
**Завдання.** Напишіть \`isPalindrome(str)\`: чи читається рядок однаково в обидва боки, **ігноруючи регістр, пробіли й розділові знаки**. Враховуються лише літери (будь-якої абетки) та цифри.

**Де трапляється:** класика співбесід (LeetCode «Valid Palindrome»); перевіряє роботу з рядками й два вказівники.

**Що написати**
- \`isPalindrome(str)\` → \`true\` / \`false\`

**Приклад**
\`\`\`js
isPalindrome('A man, a plan, a canal: Panama'); // true
isPalindrome('Я несу гусеня');                  // true
isPalindrome('race a car');                     // false
isPalindrome('');                               // true
\`\`\`

**Як це працює:** символ — літера, якщо \`ch.toLowerCase() !== ch.toUpperCase()\` (працює для будь-якої абетки); цифра — \`ch >= '0' && ch <= '9'\`. Потім два вказівники рухаються з кінців до центру.

**Врахуйте:** рядок без літер (\`' ,.! '\`) — паліндром.
`,
      starter: `function isPalindrome(str) {
  // 1. Зберіть рядок лише з літер і цифр у нижньому регістрі (цикл for...of).
  // TODO

  // 2. Два вказівники: left = 0, right = довжина - 1; порівнюйте, рухаючись до центру.
  // TODO
}

// Спробуйте в консолі:
// isPalindrome('Я несу гусеня'); // true
`,
      solution: `function isLetterOrDigit(ch) {
  // у літери є дві форми регістру; у пробілу, коми, цифри — ні
  return ch.toLowerCase() !== ch.toUpperCase() || (ch >= '0' && ch <= '9');
}

function isPalindrome(str) {
  let clean = '';
  for (const ch of str.toLowerCase()) {
    if (isLetterOrDigit(ch)) clean += ch;
  }
  // два вказівники — без створення перевернутої копії
  for (let left = 0, right = clean.length - 1; left < right; left++, right--) {
    if (clean[left] !== clean[right]) return false;
  }
  return true;
}
`,
      hints: [
        'Очищення: `for (const ch of str.toLowerCase()) if (isLetterOrDigit(ch)) clean += ch;`',
        'Порівняння: `for (let l = 0, r = clean.length - 1; l < r; l++, r--) if (clean[l] !== clean[r]) return false;`'
      ],
      tests: [
        'expect(isPalindrome("A man, a plan, a canal: Panama")).toBe(true)',
        { name: 'не паліндром', code: 'expect(isPalindrome("race a car")).toBe(false);\nexpect(isPalindrome("ab")).toBe(false);' },
        { name: 'українська', code: 'expect(isPalindrome("Я несу гусеня")).toBe(true);\nexpect(isPalindrome("Привіт")).toBe(false);' },
        { name: 'порожній рядок і лише розділові знаки', code: 'expect(isPalindrome("")).toBe(true);\nexpect(isPalindrome(" ,.!? ")).toBe(true);' },
        { name: 'цифри', code: 'expect(isPalindrome("12321")).toBe(true);\nexpect(isPalindrome("1a2")).toBe(false);' },
        { name: 'один символ і регістр', code: 'expect(isPalindrome("x")).toBe(true);\nexpect(isPalindrome("AbBa")).toBe(true);' }
      ],
      explanation: `
O(n) часу. Пастка — фільтр \`[a-z0-9]\` викидає кирилицю. Регулярним виразом це \`/[^\\p{L}\\p{N}]/gu\` (крок про RegExp). Далі можуть спитати: як без додаткового рядка (вказівники одразу по \`str\`, пропускаючи не-літери)?
`
    },

    // ================================================================ 3. Unicode
    {
      id: 'strnum-quiz-emoji-length',
      group: 'unicode',
      type: 'quiz',
      level: 2,
      title: 'Довжина емодзі',
      tags: ['strings', 'unicode'],
      question: `
Рядок у JS — послідовність 16-бітних **code units** (UTF-16). Символи поза базовим набором (емодзі) займають **два** code units (сурогатна пара). \`Array.from(s)\` ділить рядок на цілі символи (code points).

Що виведе код?

\`\`\`js
const s = '😀';
console.log(s.length, Array.from(s).length, s.charCodeAt(0) === s.codePointAt(0), '👨‍👩‍👧'.length);
\`\`\`
`,
      options: ['`2 1 false 8`', '`1 1 true 3`', '`2 2 false 5`', '`2 1 true 8`'],
      answer: 0,
      why: [
        "Правильно: length рахує code units (2), Array.from — code points (1), charCodeAt бачить лише половину пари, а сім'я — 3 емодзі по 2 + 2 невидимі з'єднувачі.",
        "`length` рахує code units, а не видимі символи, тож емодзі має довжину 2.",
        "`Array.from` не розрізає сурогатну пару — емодзі буде одним елементом.",
        "`charCodeAt(0)` повертає лише першу половину пари, а `codePointAt(0)` — повний код, тож вони різні."
      ],
      hint: 'Емодзі = 2 code units. Сімейний емодзі = кілька емодзі + невидимі з\'єднувачі (ZWJ).',
      explanation: `
\`'😀'.length === 2\`, тому \`slice\` може розрізати емодзі навпіл. Для «символів, які бачить людина» (👨‍👩‍👧, прапори) потрібні графеми — \`Intl.Segmenter\`.
`
    },
    {
      id: 'strnum-theory-unicode',
      group: 'unicode',
      type: 'theory',
      level: 3,
      title: 'Unicode у рядках JavaScript',
      tags: ['strings', 'unicode'],
      question: 'Як JavaScript зберігає рядки? Що таке code unit, code point і графема? Як правильно рахувати довжину й перевертати рядки з емодзі? Оберіть **усі** правильні твердження.',
      choices: [
        '`\'😀\'.length` дорівнює `1`, бо `length` рахує символи Unicode, а не байти чи code units',
        '`Array.from(str)` і `for...of` ідуть по code points, тому сурогатна пара емодзі не розривається',
        'Графема 👨‍👩‍👧 складається з кількох code points; рахувати такі символи слід через `Intl.Segmenter`',
        '`str.split(\'\').reverse().join(\'\')` коректно перевертає будь-який рядок, зокрема з емодзі',
        '`\'é\'` і `\'e\\u0301\'` виглядають однаково, але `===` дає `false` без `normalize(\'NFC\')`'
      ],
      correct: [1, 2, 4],
      why: [
        "`length` рахує UTF-16 code units: емодзі — 2.",
        "Правильно: ітерація рядка йде по code points.",
        "Правильно: графема — те, що бачить користувач, вона може містити кілька code points.",
        "`split('')` ділить на code units і ламає сурогатні пари емодзі.",
        "Правильно: це різні послідовності code points, normalize зводить їх до однієї форми."
      ],
      hint: 'Три рівні: code unit (16 біт) → code point (символ Unicode) → графема (що бачить людина).',
      answer: `
- **Code unit** — 16 біт (UTF-16); \`length\`, \`[i]\`, \`slice\` працюють з ними.
- **Code point** — символ Unicode; емодзі = 2 code units. \`Array.from(s)\`, \`for...of\`, \`codePointAt\`.
- **Графема** — видимий символ (👨‍👩‍👧, 🇺🇦, é з діакритикою) = кілька code points → \`Intl.Segmenter\`.
- Порівняння з діакритикою: \`a.normalize('NFC') === b.normalize('NFC')\`.
`,
      keyPoints: ['length рахує UTF-16 code units', 'Array.from / for...of — code points', 'Графеми — Intl.Segmenter', 'normalize для порівняння'],
      followUps: ['Як обрізати рядок, не розрізавши емодзі?', 'Що таке ZWJ?']
    },
    {
      id: 'strnum-reverse-unicode',
      group: 'unicode',
      type: 'code',
      level: 2,
      title: 'Перевернути рядок з емодзі',
      tags: ['strings', 'unicode'],
      description: `
**Завдання.** Напишіть \`reverseString(str)\`, що перевертає рядок і **не ламає емодзі**.

**Де трапляється:** класика співбесід «reverse a string» з уточненням «а якщо там емодзі?».

**Що написати**
- \`reverseString(str)\` → перевернутий рядок

**Приклад**
\`\`\`js
reverseString('hello');  // 'olleh'
reverseString('a😀b');   // 'b😀a'
reverseString('привіт'); // 'тівирп'
\`\`\`

**Як це працює:** \`str.split('')\` ділить на code units і розрізає емодзі на дві «половинки» — після перевертання вони стають сміттям. \`Array.from(str)\` ділить на code points, тож емодзі лишається цілим.

**Врахуйте:** порожній рядок → \`''\`. Складені емодзі (👨‍👩‍👧, прапори) тут не перевіряються — для них потрібен \`Intl.Segmenter\`.
`,
      starter: `function reverseString(str) {
  // 1. Розбийте рядок на code points: Array.from(str).
  // 2. Зберіть символи у зворотному порядку (цикл з кінця).
  // TODO
}

// Спробуйте в консолі:
// reverseString('a😀b'); // 'b😀a'
`,
      solution: `function reverseString(str) {
  const chars = Array.from(str); // code points: емодзі — один елемент
  let result = '';
  for (let i = chars.length - 1; i >= 0; i--) {
    result += chars[i];
  }
  return result;
}
`,
      hints: [
        '`const chars = Array.from(str);` — масив цілих символів.',
        'Цикл `for (let i = chars.length - 1; i >= 0; i--) result += chars[i];` (або `chars.reverse().join(\'\')`).'
      ],
      tests: [
        'expect(reverseString("hello")).toBe("olleh")',
        { name: 'порожній рядок і один символ', code: 'expect(reverseString("")).toBe("");\nexpect(reverseString("a")).toBe("a");' },
        { name: 'емодзі (сурогатні пари) не ламаються', code: 'expect(reverseString("a😀b")).toBe("b😀a");\nexpect(reverseString("😀😎")).toBe("😎😀");' },
        { name: 'кирилиця', code: 'expect(reverseString("привіт")).toBe("тівирп");' }
      ],
      explanation: `
O(n). Наступне питання: «а 👨‍👩‍👧 чи 🇺🇦?» — це кілька code points, \`Array.from\` їх розріже. Відповідь: \`new Intl.Segmenter()\` ділить рядок на графеми.
`
    },

    // ================================================================ 4. числа
    {
      id: 'strnum-quiz-float',
      group: 'numbers',
      type: 'quiz',
      level: 1,
      interview: true,
      title: '0.1 + 0.2',
      tags: ['numbers', 'float'],
      question: `
Числа в JS — двійкові з плаваючою комою (IEEE-754). \`Number.EPSILON\` — найменша різниця між 1 і наступним числом.

Що виведе код?

\`\`\`js
console.log(0.1 + 0.2 === 0.3, 0.1 + 0.2, Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);
\`\`\`
`,
      options: ['`true 0.3 true`', '`false 0.30000000000000004 false`', '`false 0.30000000000000004 true`', '`false 0.3 true`'],
      answer: 2,
      why: [
        "0.1 і 0.2 не мають точного двійкового запису, тому сума не дорівнює 0.3.",
        "Похибка (~5.5e-17) менша за EPSILON, тож порівняння з допуском дає true.",
        "Правильно: строге порівняння ламається, порівняння з допуском — працює.",
        "console.log показує справжнє значення суми — 0.30000000000000004."
      ],
      hint: 'Чи можна точно записати 0.1 у двійковому вигляді?',
      explanation: `
Дробові числа порівнюйте з допуском: \`Math.abs(a - b) < Number.EPSILON\`. Гроші рахуйте в копійках (цілих).
`
    },
    {
      id: 'strnum-theory-float',
      group: 'numbers',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Чому 0.1 + 0.2 !== 0.3 і як працювати з дробами',
      tags: ['numbers', 'float'],
      question: 'Чому 0.1 + 0.2 !== 0.3? Як правильно порівнювати дробові числа, округлювати й працювати з грошима?',
      choices: [
        '`0.1` і `0.2` не мають точного двійкового представлення в IEEE-754 double, і похибки округлення додаються',
        'Це баг рушія V8: у Python чи Java `0.1 + 0.2` дає рівно `0.3`, бо там інша арифметика з плаваючою комою',
        '`(0.1 + 0.2).toFixed(2) === 0.3` — надійне порівняння, бо `toFixed` повертає точне округлене число',
        'Гроші найкраще зберігати як дробові числа й округлювати лише через `Math.round(x * 100) / 100`'
      ],
      correct: 0,
      why: [
        "Правильно: 0.1 у двійковій системі — нескінченний дріб, його обрізають.",
        "Це стандарт IEEE-754: Python і Java дають той самий 0.30000000000000004.",
        "`toFixed` повертає рядок «0.30», а рядок не дорівнює числу 0.3 строго.",
        "Множення теж вносить похибку (1.005 * 100 = 100.49999…); гроші зберігають у цілих копійках."
      ],
      hint: 'Як записати 1/10 у двійковій системі?',
      answer: `
- number — 64-бітне IEEE-754: 0.1 зберігається приблизно → похибки.
- Порівняння: \`Math.abs(a - b) < Number.EPSILON\` (або свій допуск).
- Гроші: цілі копійки (\`1999\` замість \`19.99\`), форматування — лише при виводі.
- \`toFixed(n)\` → **рядок**, і округлює двійкове значення: \`(1.005).toFixed(2) === '1.00'\`.
`,
      keyPoints: ['IEEE-754 double — двійкове наближення', 'Порівняння з допуском EPSILON', 'Гроші — у цілих копійках', 'toFixed повертає рядок'],
      followUps: ['Чому (1.005).toFixed(2) дає "1.00"?', 'Як порахувати суму кошика без похибок?']
    },
    {
      id: 'strnum-quiz-tofixed',
      group: 'numbers',
      type: 'quiz',
      level: 3,
      title: 'toFixed і Math.round: пастки округлення',
      tags: ['numbers', 'rounding'],
      question: `
\`toFixed(n)\` повертає рядок з n знаками після коми. \`Math.round\` округлює половину **вгору** (у бік +∞).

Що виведе код?

\`\`\`js
console.log((1.005).toFixed(2), (2.5).toFixed(0), Math.round(2.5), Math.round(-2.5));
\`\`\`
`,
      options: ['`"1.01" "3" 3 -3`', '`"1.00" "3" 3 -2`', '`"1.01" "2" 3 -2`', '`"1.00" "2" 2 -2`'],
      answer: 1,
      why: [
        "1.005 зберігається як 1.00499999…, тому toFixed дає «1.00»; а -2.5 Math.round округлює до -2.",
        "Правильно: 1.005 насправді трохи менше, 2.5 точне, а Math.round тягне половину до +∞.",
        "2.5 зберігається точно, тож toFixed(0) дає «3».",
        "`Math.round(2.5)` — 3: половина округлюється вгору."
      ],
      hint: 'Чи точно 1.005 зберігається в пам\'яті? Куди Math.round тягне половину?',
      explanation: `
Для «людського» округлення (половина від нуля) потрібен власний \`roundTo\` — наступна задача.
`
    },
    {
      id: 'strnum-round-to',
      group: 'numbers',
      type: 'code',
      level: 3,
      title: 'roundTo(n, digits) без пасток float',
      tags: ['numbers', 'rounding'],
      description: `
**Завдання.** Напишіть \`roundTo(value, digits = 0)\`, що округлює до \`digits\` знаків **як людина** — половина від нуля.

**Де трапляється:** ціни, знижки, відсотки в кошику та звітах — \`toFixed\` іноді «недоокруглює».

**Що написати**
- \`roundTo(value, digits = 0)\` → **число**:
  - \`roundTo(1.005, 2)\` → \`1.01\` (а \`toFixed\` дає \`'1.00'\`);
  - від'ємні — симетрично: \`roundTo(-1.005, 2)\` → \`-1.01\`;
  - від'ємні \`digits\`: \`roundTo(1234, -2)\` → \`1200\`;
  - \`-0\` → \`0\`.

**Приклад**
\`\`\`js
roundTo(2.345, 2);   // 2.35
roundTo(1234.5678);  // 1235
roundTo(1.2, 3);     // 1.2
\`\`\`

**Як це працює:** \`1.005 * 100\` дає \`100.49999…\` — множення вносить похибку. Зсув коми **через рядок** точний: \`Number('1.005e2') === 100.5\`. Назад — \`Number(rounded + 'e-2')\`.

**Врахуйте:** \`String(1e-7)\` вже містить \`e\` (\`'1e-7'\`) — додайте показники. Округлюйте модуль, а знак поверніть через \`Math.sign\`.
`,
      starter: `function shift(value, exponent) {
  // 1. Розбийте String(value) по 'e': мантиса і показник (якщо є).
  // 2. Поверніть Number(мантиса + 'e' + (показник + exponent)).
  // TODO
}

function roundTo(value, digits = 0) {
  // 1. Округліть модуль: Math.round(shift(Math.abs(value), digits)).
  // 2. Зсуньте назад на -digits і поверніть знак (Math.sign).
  // 3. -0 → 0.
  // TODO
}

// Спробуйте в консолі:
// roundTo(1.005, 2); // 1.01
`,
      solution: `// Зсув коми через рядкову експоненту: '1.005e2' парситься точно як 100.5
function shift(value, exponent) {
  const parts = String(value).split('e'); // '1e-7' → ['1', '-7']
  const exp = parts.length > 1 ? Number(parts[1]) : 0;
  return Number(parts[0] + 'e' + (exp + exponent));
}

function roundTo(value, digits = 0) {
  const sign = Math.sign(value);
  const rounded = Math.round(shift(Math.abs(value), digits)); // half away from zero
  const result = sign * shift(rounded, -digits);
  return result === 0 ? 0 : result; // -0 → 0
}
`,
      hints: [
        '`shift`: `const parts = String(value).split(\'e\');` показник — `parts[1]` або 0.',
        '`roundTo`: `Math.sign(value) * shift(Math.round(shift(Math.abs(value), digits)), -digits)`, потім `-0 → 0`.'
      ],
      tests: [
        { name: 'класична пастка 1.005', code: 'expect(roundTo(1.005, 2)).toBe(1.01);\nexpect(roundTo(2.345, 2)).toBe(2.35);\nexpect(roundTo(1.255, 2)).toBe(1.26);' },
        { name: 'до цілого за замовчуванням', code: 'expect(roundTo(1234.5678)).toBe(1235);\nexpect(roundTo(2.5)).toBe(3);\nexpect(roundTo(2.4)).toBe(2);' },
        { name: 'від\'ємні числа — від нуля', code: 'expect(roundTo(-1.005, 2)).toBe(-1.01);\nexpect(roundTo(-2.5)).toBe(-3);' },
        { name: 'від\'ємні digits', code: 'expect(roundTo(1234, -2)).toBe(1200);\nexpect(roundTo(1250, -2)).toBe(1300);' },
        { name: 'зайві знаки не додаються', code: 'expect(roundTo(1.2, 3)).toBe(1.2);\nexpect(roundTo(0, 2)).toBe(0);' },
        { name: 'дуже малі числа і -0', code: 'expect(roundTo(1e-7, 2)).toBe(0);\nexpect(Object.is(roundTo(-0.001, 2), 0)).toBe(true);\nexpect(roundTo(1.5e-7, 7)).toBe(2e-7);' },
        { name: 'повертає число', code: 'expect(typeof roundTo(1.23456, 2)).toBe("number");\nexpect(roundTo(1.23456, 2)).toBe(1.23);' }
      ],
      explanation: `
O(1). Помилка — \`Math.round(x * 100) / 100\`: дає \`1\` для \`1.005\`. Альтернатива — \`Math.round((x + Number.EPSILON) * 100) / 100\`, але вона не всюди точна. У грошах краще одразу рахувати в копійках.
`
    },
    {
      id: 'strnum-random-int',
      group: 'numbers',
      type: 'code',
      level: 1,
      interview: true,
      title: 'Випадкове ціле в діапазоні [min, max]',
      tags: ['numbers', 'math'],
      description: `
**Завдання.** Напишіть \`randomInt(min, max)\` — випадкове **ціле** з \`[min, max]\` **включно з обома межами**, рівномірно.

**Де трапляється:** випадковий банер чи порада дня, тестові дані, кубик у грі; класика співбесід.

**Що написати**
- \`randomInt(min, max)\` → ціле число; якщо \`min > max\` — \`throw new RangeError(...)\`

**Приклад**
\`\`\`js
randomInt(1, 6);   // 1..6
randomInt(-2, 2);  // -2..2
randomInt(5, 5);   // 5
\`\`\`

**Як це працює:** \`Math.random()\` дає число з \`[0, 1)\` (1 — ніколи). Множимо на кількість значень \`max - min + 1\`, \`Math.floor\` дає ціле \`0..max-min\`, додаємо \`min\`.

**Врахуйте:** \`Math.round\` дає нерівномірний розподіл — крайні значення випадають удвічі рідше.
`,
      starter: `function randomInt(min, max) {
  // 1. min > max → RangeError.
  // TODO

  // 2. Math.floor(Math.random() * (кількість значень)) + min
  // TODO
}

// Спробуйте в консолі:
// randomInt(1, 6);
`,
      solution: `function randomInt(min, max) {
  if (min > max) throw new RangeError('min не може бути більшим за max');
  // Math.random() ∈ [0, 1) → * (кількість значень) → floor → [0, max - min]
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
`,
      hints: [
        'Кількість можливих значень — `max - min + 1`.',
        '`return Math.floor(Math.random() * (max - min + 1)) + min;`'
      ],
      tests: [
        { name: 'Math.random() = 0 → min', code: 'const orig = Math.random;\nMath.random = () => 0;\ntry {\n  expect(randomInt(3, 7)).toBe(3);\n  expect(randomInt(-5, 5)).toBe(-5);\n} finally {\n  Math.random = orig;\n}' },
        { name: 'Math.random() ≈ 1 → max', code: 'const orig = Math.random;\nMath.random = () => 0.9999999;\ntry {\n  expect(randomInt(3, 7)).toBe(7);\n  expect(randomInt(-5, 5)).toBe(5);\n} finally {\n  Math.random = orig;\n}' },
        { name: 'min === max', code: 'expect(randomInt(5, 5)).toBe(5);' },
        { name: 'min > max → RangeError', code: 'expect(() => randomInt(10, 1)).toThrow(RangeError);' },
        { name: 'лише цілі в межах', code: 'for (let i = 0; i < 1000; i++) {\n  const n = randomInt(-2, 2);\n  expect(Number.isInteger(n)).toBe(true);\n  expect(n >= -2 && n <= 2).toBe(true);\n}' },
        { name: 'рівномірний розподіл (кубик, 6000 кидків)', code: 'const orig = Math.random;\nlet seed = 7;\nMath.random = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };\nconst counts = {};\ntry {\n  for (let i = 0; i < 6000; i++) {\n    const n = randomInt(1, 6);\n    counts[n] = (counts[n] || 0) + 1;\n  }\n} finally {\n  Math.random = orig;\n}\nexpect(Object.keys(counts).sort()).toEqual(["1", "2", "3", "4", "5", "6"]);\nfor (const c of Object.values(counts)) {\n  expect(c).toBeGreaterThan(850);\n  expect(c).toBeLessThan(1150);\n}' }
      ],
      explanation: `
O(1). Для криптографії (токени, паролі) \`Math.random\` не підходить — потрібен \`crypto.getRandomValues\`.
`
    },
    {
      id: 'strnum-format-duration',
      group: 'numbers',
      type: 'code',
      level: 2,
      title: 'formatDuration: секунди → «1 год 2 хв 5 с»',
      tags: ['numbers', 'math', 'formatting'],
      description: `
**Завдання.** Напишіть \`formatDuration(seconds)\`, що перетворює секунди на людський рядок з одиницями \`д\`, \`год\`, \`хв\`, \`с\`.

**Де трапляється:** тривалість відео, час до кінця акції, «сесія триває 1 год 5 хв».

**Що написати**
- \`formatDuration(seconds)\` → рядок:
  - нульові одиниці пропускаються, \`0\` → \`'0 с'\`;
  - дробова частина секунд відкидається;
  - від'ємне, \`NaN\` чи \`Infinity\` → \`RangeError\`.

**Приклад**
\`\`\`js
formatDuration(3725);   // '1 год 2 хв 5 с'
formatDuration(86400);  // '1 д'
formatDuration(7260);   // '2 год 1 хв'
formatDuration(59.9);   // '59 с'
\`\`\`

**Як це працює:** для кожної одиниці від найбільшої: \`Math.floor(rest / size)\` — скільки її, \`rest % size\` — залишок для наступних.

**Врахуйте:** перевірка \`Number.isFinite\` відсікає і NaN, і Infinity.
`,
      starter: `const UNITS = [
  { label: 'д', size: 86400 },
  { label: 'год', size: 3600 },
  { label: 'хв', size: 60 },
  { label: 'с', size: 1 }
];

function formatDuration(seconds) {
  // 1. Невалідне значення → throw new RangeError(...).
  // 2. rest = Math.floor(seconds); 0 → '0 с'.
  // 3. Для кожної одиниці: кількість і залишок; ненульові — у результат.
  // TODO
}

// Спробуйте в консолі:
// formatDuration(3725); // '1 год 2 хв 5 с'
`,
      solution: `const UNITS = [
  { label: 'д', size: 86400 },
  { label: 'год', size: 3600 },
  { label: 'хв', size: 60 },
  { label: 'с', size: 1 }
];

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError('Тривалість має бути невід\\'ємним скінченним числом');
  }
  let rest = Math.floor(seconds);
  if (rest === 0) return '0 с';

  const parts = [];
  for (const unit of UNITS) {
    const amount = Math.floor(rest / unit.size);
    rest = rest % unit.size;
    if (amount > 0) parts.push(amount + ' ' + unit.label);
  }
  return parts.join(' ');
}
`,
      hints: [
        'Цикл `for (const unit of UNITS)`: `amount = Math.floor(rest / unit.size)`, `rest = rest % unit.size`.',
        'Ненульові частини — у масив `parts`, наприкінці `parts.join(\' \')`.'
      ],
      tests: [
        'expect(formatDuration(3725)).toBe("1 год 2 хв 5 с")',
        { name: 'нульові одиниці пропускаються', code: 'expect(formatDuration(86400)).toBe("1 д");\nexpect(formatDuration(7260)).toBe("2 год 1 хв");\nexpect(formatDuration(3600)).toBe("1 год");\nexpect(formatDuration(60)).toBe("1 хв");' },
        { name: 'усі одиниці', code: 'expect(formatDuration(90061)).toBe("1 д 1 год 1 хв 1 с");\nexpect(formatDuration(2 * 86400 + 5)).toBe("2 д 5 с");' },
        { name: 'нуль і дробові', code: 'expect(formatDuration(0)).toBe("0 с");\nexpect(formatDuration(59.9)).toBe("59 с");\nexpect(formatDuration(0.5)).toBe("0 с");' },
        { name: 'некоректні значення → RangeError', code: 'expect(() => formatDuration(-1)).toThrow(RangeError);\nexpect(() => formatDuration(NaN)).toThrow(RangeError);\nexpect(() => formatDuration(Infinity)).toThrow(RangeError);' }
      ],
      explanation: `
O(k) за кількістю одиниць. Таблиця одиниць замість ланцюжка \`if\` — легко додати тижні. Далі можуть спитати: як додати правильні відмінки («1 година, 2 години»)? — див. крок Intl.
`
    },
    {
      id: 'strnum-quiz-bigint',
      group: 'numbers',
      type: 'quiz',
      level: 3,
      title: 'MAX_SAFE_INTEGER і BigInt',
      tags: ['numbers', 'bigint'],
      question: `
\`Number.MAX_SAFE_INTEGER\` = 2⁵³ − 1 = \`9007199254740991\`. Вище не кожне ціле можна зберегти точно. BigInt (\`10n\`) — точні цілі будь-якої довжини.

Що виведе код?

\`\`\`js
console.log(Number.MAX_SAFE_INTEGER + 2);
console.log(9007199254740993n + 1n);
console.log(10n / 3n);
console.log(1n + 1);
\`\`\`
`,
      options: [
        '`9007199254740993`, `9007199254740994n`, `3.3333333333333335n`, `2n`',
        '`9007199254740992`, `9007199254740992n`, `3n`, потім `TypeError`',
        '`9007199254740993`, `9007199254740994n`, `3n`, `2`',
        '`9007199254740992`, `9007199254740994n`, `3n`, потім `TypeError`'
      ],
      answer: 3,
      why: [
        "9007199254740993 не представимий у double, а BigInt не має дробів і не змішується з number.",
        "BigInt рахує точно: 9007199254740993n + 1n = 9007199254740994n.",
        "Число 2⁵³ + 1 округлюється до 2⁵³, а `1n + 1` кидає TypeError.",
        "Правильно: number втрачає точність, BigInt — ні, ділення BigInt відкидає дріб, змішування типів — TypeError."
      ],
      hint: 'Вище 2⁵³ сусідні цілі «злипаються». BigInt і number не змішуються.',
      explanation: `
Великі id з бекенду (Twitter, банківські рахунки) в JSON як числа губляться — передавайте їх рядками або парсіть у BigInt.
`
    },
    {
      id: 'strnum-theory-bigint',
      group: 'numbers',
      type: 'theory',
      level: 3,
      title: 'Безпечні цілі та BigInt',
      tags: ['numbers', 'bigint'],
      question: 'Що таке Number.MAX_SAFE_INTEGER? Які проблеми з великими цілими (наприклад, id з бекенду) і як їх вирішує BigInt? Оберіть **усі** правильні твердження.',
      choices: [
        '`Number.MAX_SAFE_INTEGER` — це `2⁵³ − 1`; вище не кожне ціле представлене: `2 ** 53 === 2 ** 53 + 1`',
        '`JSON.parse` автоматично повертає BigInt для чисел, більших за `Number.MAX_SAFE_INTEGER`',
        '`1n + 1` дає `2n`, бо в арифметиці Number неявно приводиться до BigInt без втрати точності',
        '`JSON.stringify({ a: 1n })` кидає `TypeError`, тому великі id з бекенду краще передавати рядками',
        '`7n / 2n` дає `3.5n`, а `Math.max` і `Math.round` приймають BigInt так само, як Number'
      ],
      correct: [0, 3],
      why: [
        "Правильно: мантиса double має 53 біти, вище сусідні цілі «злипаються».",
        "`JSON.parse` завжди дає number — велике число тихо втрачає точність.",
        "Змішування BigInt і number в арифметиці — TypeError.",
        "Правильно: JSON не підтримує BigInt, тож надійний формат для великих id — рядок.",
        "Ділення BigInt відкидає дріб (3n), а `Math.*` з BigInt кидають TypeError."
      ],
      hint: 'Скільки біт має мантиса double?',
      answer: `
- \`MAX_SAFE_INTEGER\` = 2⁵³ − 1; перевірка — \`Number.isSafeInteger(n)\`.
- Великі id в JSON → губляться; передавайте рядками.
- BigInt: \`10n\`, \`BigInt('123')\`; ділення відкидає дріб; не змішується з number; \`Math.*\` не працює; JSON — TypeError.
`,
      keyPoints: ['2⁵³ − 1 — межа точних цілих', 'JSON.parse губить точність великих чисел', 'BigInt не змішується з number', 'Великі id — рядками'],
      followUps: ['Як серіалізувати BigInt у JSON?', 'Чим Number.isSafeInteger відрізняється від Number.isInteger?']
    },

    // ================================================================ 5. Intl
    {
      id: 'strnum-theory-intl',
      group: 'intl',
      type: 'theory',
      level: 2,
      title: 'Intl API: локалізація чисел, дат, множини',
      tags: ['intl', 'i18n'],
      question: 'Що таке Intl API? Які форматери ви знаєте і які підводні камені?',
      choices: [
        '`Intl.NumberFormat` і `DateTimeFormat` перекладають тексти інтерфейсу, тож i18n-бібліотеки вже не потрібні',
        'Створення форматера дешеве, тож `toLocaleString` у циклі на тисячі рядків не впливає на швидкодію',
        'Результат форматування однаковий у всіх браузерах, тож його безпечно порівнювати з рядком у тестах',
        'Результат може містити нерозривні пробіли, а без явного `timeZone` дата форматується в поясі користувача'
      ],
      correct: 3,
      why: [
        "Intl форматує числа, дати, множину, але не перекладає тексти — для цього потрібні i18n-бібліотеки.",
        "Форматер дорогий у створенні: створіть один раз і перевикористовуйте.",
        "Вивід залежить від версії ICU в браузері (пробіли, скорочення), тож точне порівняння рядків крихке.",
        "Правильно: роздільник груп у uk-UA — нерозривний пробіл, а часовий пояс за замовчуванням — системний."
      ],
      hint: 'Що в рядку «1 234,5» стоїть між 1 і 234?',
      answer: `
- \`new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(1234.5)\` → \`'1 234,50 грн'\`.
- \`Intl.DateTimeFormat\` — дати з \`timeZone\`; \`Intl.RelativeTimeFormat\` — «3 дні тому».
- \`Intl.PluralRules('uk').select(n)\` → \`'one' | 'few' | 'many' | 'other'\`.
- Пастки: нерозривні пробіли (\`\\u00A0\`), різний вивід у браузерах, форматер — створювати один раз.
`,
      keyPoints: ['NumberFormat, DateTimeFormat, PluralRules, RelativeTimeFormat', 'Нерозривні пробіли у виводі', 'Часовий пояс за замовчуванням — користувача', 'Перевикористовувати форматер'],
      followUps: ['Як відформатувати ціну в гривнях?', 'Як вивести «3 дні тому»?']
    },
    {
      id: 'strnum-format-number',
      group: 'intl',
      type: 'code',
      level: 2,
      title: 'Формат числа «1 234 567,89»',
      tags: ['numbers', 'formatting'],
      description: `
**Завдання.** Напишіть \`formatNumber(value, decimals = 2)\`, що форматує число в українському стилі зі **звичайним** пробілом між тисячами.

**Де трапляється:** ціни й суми в UI, PDF-рахунках, CSV — де нерозривний пробіл з \`Intl\` ламає порівняння чи експорт.

**Що написати**
- \`formatNumber(value, decimals = 2)\` → рядок:
  - групи по 3 цифри через \`' '\` (U+0020), десятковий роздільник — кома;
  - рівно \`decimals\` знаків після коми (\`0\` — без дробової частини);
  - мінус для від'ємних; якщо після округлення нуль — без мінуса.

**Приклад**
\`\`\`js
formatNumber(1234567.891);  // '1 234 567,89'
formatNumber(-1234.5);      // '-1 234,50'
formatNumber(1234.4, 0);    // '1 234'
formatNumber(0.5, 3);       // '0,500'
\`\`\`

**Як це працює:** \`Math.abs(value).toFixed(decimals)\` дає рядок \`'1234567.89'\` — ділимо по крапці. Цілу частину йдемо зліва: перед цифрою ставимо пробіл, якщо до кінця лишилось кратне 3 число цифр.

**Врахуйте:** \`Intl.NumberFormat('uk-UA')\` ставить нерозривний пробіл (U+00A0) — тест це перевіряє.
`,
      starter: `function formatNumber(value, decimals = 2) {
  // 1. fixed = Math.abs(value).toFixed(decimals); розділіть на цілу й дробову частини.
  // 2. Ціла частина: пробіл перед цифрою, якщо (довжина - i) % 3 === 0 (і i > 0).
  // 3. Знак: '-' лише якщо value < 0 і округлений результат не нуль.
  // 4. Зберіть: знак + ціла + (',' + дробова, якщо є).
  // TODO
}

// Спробуйте в консолі:
// formatNumber(1234567.891); // '1 234 567,89'
`,
      solution: `function formatNumber(value, decimals = 2) {
  const fixed = Math.abs(value).toFixed(decimals); // '1234567.89'
  const dot = fixed.indexOf('.');
  const intPart = dot === -1 ? fixed : fixed.slice(0, dot);
  const fracPart = dot === -1 ? '' : fixed.slice(dot + 1);

  let grouped = '';
  for (let i = 0; i < intPart.length; i++) {
    // пробіл, якщо до кінця лишилось кратне 3 число цифр
    if (i > 0 && (intPart.length - i) % 3 === 0) grouped += ' ';
    grouped += intPart[i];
  }

  const sign = value < 0 && Number(fixed) !== 0 ? '-' : ''; // -0,00 → 0,00
  return sign + grouped + (fracPart ? ',' + fracPart : '');
}
`,
      hints: [
        '`toFixed` → `indexOf(\'.\')` → `slice` на цілу й дробову частини.',
        'Групування в циклі: `if (i > 0 && (intPart.length - i) % 3 === 0) grouped += \' \';`'
      ],
      tests: [
        'expect(formatNumber(1234567.891)).toBe("1 234 567,89")',
        { name: 'від\'ємні числа', code: 'expect(formatNumber(-1234.5)).toBe("-1 234,50");' },
        { name: 'decimals = 0 і більше', code: 'expect(formatNumber(1234.4, 0)).toBe("1 234");\nexpect(formatNumber(0.5, 3)).toBe("0,500");' },
        { name: 'малі числа без груп', code: 'expect(formatNumber(999)).toBe("999,00");\nexpect(formatNumber(0)).toBe("0,00");' },
        { name: 'межі груп', code: 'expect(formatNumber(1000, 0)).toBe("1 000");\nexpect(formatNumber(100000, 0)).toBe("100 000");\nexpect(formatNumber(1000000)).toBe("1 000 000,00");' },
        { name: 'звичайний пробіл, а не NBSP', code: 'const r = formatNumber(1234567);\nexpect(r.includes("\\u00A0")).toBe(false);\nexpect(r.includes("\\u202F")).toBe(false);\nexpect(r).toBe("1 234 567,00");' },
        { name: 'від\'ємний нуль після округлення — без мінуса', code: 'expect(formatNumber(-0.004)).toBe("0,00");' }
      ],
      explanation: `
O(n) за кількістю цифр. Альтернатива: \`Intl.NumberFormat('uk-UA', { minimumFractionDigits: d, maximumFractionDigits: d })\` + заміна нерозривних пробілів. Регулярним виразом групування — \`/\\B(?=(\\d{3})+(?!\\d))/g\` (крок RegExp).
`
    },
    {
      id: 'strnum-plural-uk',
      group: 'intl',
      type: 'code',
      level: 2,
      title: 'Українська множина: 1 яблуко, 2 яблука, 5 яблук',
      tags: ['intl', 'i18n', 'numbers'],
      description: `
**Завдання.** Напишіть \`pluralize(n, forms)\`, де \`forms\` — три форми \`[one, few, many]\`. Повертає \`'<n> <форма>'\`.

**Де трапляється:** «3 товари в кошику», «5 коментарів», «1 день до кінця акції».

**Що написати**
- \`pluralize(n, forms)\` → рядок:
  - закінчується на 1, але не на 11 → \`forms[0]\` (1, 21, 101);
  - на 2–4, але не на 12–14 → \`forms[1]\` (2, 22, 104);
  - інакше → \`forms[2]\` (0, 5–20, 25, 111);
  - дробові → \`forms[1]\` (1.5 яблука); від'ємні — за модулем.

**Приклад**
\`\`\`js
pluralize(1, ['яблуко', 'яблука', 'яблук']);   // '1 яблуко'
pluralize(22, ['яблуко', 'яблука', 'яблук']);  // '22 яблука'
pluralize(11, ['яблуко', 'яблука', 'яблук']);  // '11 яблук'
\`\`\`

**Як це працює:** остання цифра — \`n % 10\`, дві останні — \`n % 100\`. Виняток 11–14 перевіряйте **першим**. Вбудований аналог — \`new Intl.PluralRules('uk').select(n)\`.

**Врахуйте:** \`Number.isInteger\` відрізняє дробові.
`,
      starter: `function pluralize(n, forms) {
  // 1. abs = Math.abs(n); дробове → forms[1].
  // 2. mod100 у 11..14 → forms[2].
  // 3. mod10 === 1 → forms[0]; mod10 у 2..4 → forms[1]; інакше forms[2].
  // TODO
}

// Спробуйте в консолі:
// pluralize(22, ['яблуко', 'яблука', 'яблук']); // '22 яблука'
`,
      solution: `function pluralize(n, forms) {
  const abs = Math.abs(n);
  let form;

  if (!Number.isInteger(abs)) {
    form = forms[1]; // 1.5 яблука
  } else {
    const mod10 = abs % 10;
    const mod100 = abs % 100;
    if (mod100 >= 11 && mod100 <= 14) form = forms[2]; // виняток 11–14
    else if (mod10 === 1) form = forms[0];
    else if (mod10 >= 2 && mod10 <= 4) form = forms[1];
    else form = forms[2];
  }
  return n + ' ' + form;
}
`,
      hints: [
        'Порядок: дріб → 11–14 → закінчується на 1 → на 2–4 → решта.',
        'Через Intl: `const rule = new Intl.PluralRules(\'uk\').select(n);` → `one`/`few`/`many`/`other` (`other` — дроби).'
      ],
      tests: [
        { name: 'one: 1, 21, 101', code: 'const f = ["яблуко", "яблука", "яблук"];\nexpect(pluralize(1, f)).toBe("1 яблуко");\nexpect(pluralize(21, f)).toBe("21 яблуко");\nexpect(pluralize(101, f)).toBe("101 яблуко");' },
        { name: 'few: 2, 4, 22, 104', code: 'const f = ["яблуко", "яблука", "яблук"];\nexpect(pluralize(2, f)).toBe("2 яблука");\nexpect(pluralize(4, f)).toBe("4 яблука");\nexpect(pluralize(22, f)).toBe("22 яблука");\nexpect(pluralize(104, f)).toBe("104 яблука");' },
        { name: 'many: 0, 5, 25, 100', code: 'const f = ["яблуко", "яблука", "яблук"];\nexpect(pluralize(0, f)).toBe("0 яблук");\nexpect(pluralize(5, f)).toBe("5 яблук");\nexpect(pluralize(25, f)).toBe("25 яблук");\nexpect(pluralize(100, f)).toBe("100 яблук");' },
        { name: 'винятки 11–14 і 111–114', code: 'const f = ["яблуко", "яблука", "яблук"];\nfor (const n of [11, 12, 13, 14, 111, 112, 214]) expect(pluralize(n, f)).toBe(n + " яблук");' },
        { name: 'дробові числа → few', code: 'const f = ["яблуко", "яблука", "яблук"];\nexpect(pluralize(1.5, f)).toBe("1.5 яблука");\nexpect(pluralize(0.25, f)).toBe("0.25 яблука");' },
        { name: 'від\'ємні числа', code: 'const f = ["градус", "градуси", "градусів"];\nexpect(pluralize(-1, f)).toBe("-1 градус");\nexpect(pluralize(-3, f)).toBe("-3 градуси");\nexpect(pluralize(-12, f)).toBe("-12 градусів");' }
      ],
      explanation: `
O(1). Пастка — \`n === 1 ? one : many\` (англійська логіка). У продакшні — \`Intl.PluralRules\` або i18n-бібліотека з ICU-форматом.
`
    },

    // ================================================================ 6. Date
    {
      id: 'strnum-quiz-date-month',
      group: 'date',
      type: 'quiz',
      level: 2,
      title: 'Місяці з нуля і переповнення дати',
      tags: ['date'],
      question: `
У \`Date\` місяці нумеруються з **0** (січень = 0). Неіснуюча дата не дає помилки — вона «переповнюється» в наступний місяць.

Що виведе код?

\`\`\`js
const d = new Date(2024, 0, 31); // 31 січня 2024, локальний час
d.setMonth(1);
console.log(d.getMonth(), d.getDate());
\`\`\`
`,
      options: ['`1 29`', '`1 31`', '`2 2`', '`2 1`'],
      answer: 2,
      why: [
        "Date не обрізає день до кінця місяця — 31 лютого переповнюється в березень.",
        "31 лютого не існує, а Date не кидає помилку, а переносить зайві дні далі.",
        "Правильно: 31 лютого 2024 = 29 лютого + 2 дні = 2 березня (місяць 2).",
        "2024 — високосний: у лютому 29 днів, тож 31 лютого — це 2 березня, а не 1-ше."
      ],
      hint: 'Скільки днів у лютому 2024? Куди подінуться зайві?',
      explanation: `
Пастка «додати місяць» 31-го числа. Тому \`setMonth\` спершу \`setDate(1)\` або беріть бібліотеку (date-fns). Переповнення корисне: \`new Date(2024, 2, 0)\` — останній день лютого.
`
    },
    {
      id: 'strnum-quiz-date-compare',
      group: 'date',
      type: 'quiz',
      level: 2,
      title: 'Порівняння дат',
      tags: ['date', 'coercion'],
      question: `
Що виведе код?

\`\`\`js
const a = new Date('2024-01-01T00:00:00Z');
const b = new Date('2024-01-01T00:00:00Z');
console.log(a == b, a.getTime() === b.getTime(), a <= b && a >= b, a - b);
\`\`\`
`,
      options: ['`false true true 0`', '`true true true 0`', '`false true false NaN`', '`false false true 0`'],
      answer: 0,
      why: [
        "Правильно: == порівнює посилання двох об'єктів, а <=, >= і - перетворюють дати на числа (мс).",
        "`a` і `b` — два різні об'єкти, тому `==` дає false.",
        "Оператори `<=`, `>=` і `-` приводять дату до числа, тож результат 0 і true.",
        "`getTime()` повертає однакові мілісекунди, тож строге порівняння чисел — true."
      ],
      hint: '== для двох об\'єктів порівнює посилання. А < і - приводять до числа.',
      explanation: `
Порівнюйте дати через \`a.getTime() === b.getTime()\`, різницю — \`b - a\` (мс). Це той самий механізм «об'єкт → примітив», що й у темі про типи.
`
    },
    {
      id: 'strnum-theory-date',
      group: 'date',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Пастки Date і часових поясів',
      tags: ['date', 'timezones'],
      question: 'Які підводні камені є в Date? Як правильно парсити, порівнювати дати й працювати з часовими поясами? Оберіть **усі** правильні твердження.',
      choices: [
        '`Date` зберігає лише timestamp у мс від епохи UTC; часовий пояс застосовується при відображенні',
        '`new Date(2024, 1, 1)` — це 1 січня, бо місяці в конструкторі `Date` рахуються з одиниці',
        '`\'2024-03-10\'` парситься як UTC опівночі, а `\'2024-03-10T10:00\'` — як локальний час',
        '`setDate`/`setMonth` мутують об\'єкт, а порівнювати дати слід через `getTime()`, а не `===`',
        'Додати 24 години — завжди те саме, що додати календарний день, навіть при переході на літній час'
      ],
      correct: [0, 2, 3],
      why: [
        "Правильно: усередині — одне число мс, пояс — лише спосіб показати.",
        "Місяці з нуля: `new Date(2024, 1, 1)` — це 1 лютого.",
        "Правильно: дата без часу — UTC, дата з часом без Z — локальна; часте джерело «зсуву на день».",
        "Правильно: Date мутабельний, а `===` порівнює посилання.",
        "У день переходу на літній час доба має 23 або 25 годин."
      ],
      hint: 'Що зберігає Date усередині?',
      answer: `
- Date = мс від 1970-01-01 UTC; \`getHours\` — локальні, \`getUTCHours\` — UTC.
- Місяці з 0; переповнення: 31 лютого → березень.
- \`'YYYY-MM-DD'\` → UTC, \`'YYYY-MM-DDTHH:mm'\` → локальний.
- Мутабельний: \`setDate\` змінює об'єкт; порівняння — \`getTime()\`.
- Зберігати й передавати — ISO в UTC (\`toISOString()\`); для календарних днів рахувати в UTC.
`,
      keyPoints: ['Timestamp UTC усередині', 'Місяці з 0, переповнення', 'Різний парсинг дати й дати з часом', 'Порівняння через getTime', 'DST: доба ≠ 24 год'],
      followUps: ['Чому дата народження «зʼїжджає» на день?','Як порахувати дні між датами без DST?']
    },
    {
      id: 'strnum-days-between',
      group: 'date',
      type: 'code',
      level: 2,
      title: 'isValidDate і daysBetween без пасток часових поясів',
      tags: ['date', 'validation'],
      description: `
**Завдання.** Реалізуйте дві функції для дат у форматі \`'YYYY-MM-DD'\` (як з \`<input type="date">\`).

**Де трапляється:** бронювання (кількість ночей), «до дедлайну N днів», валідація дати з форми.

**Що написати**
- \`isValidDate(str)\` → \`true\`, лише якщо формат **точно** \`YYYY-MM-DD\` і дата існує (немає 30 лютого, 13-го місяця)
- \`daysBetween(a, b)\` → кількість днів від \`a\` до \`b\` (від'ємна, якщо \`b\` раніше); некоректна дата → \`RangeError\`

**Приклад**
\`\`\`js
isValidDate('2024-02-29');  // true (високосний)
isValidDate('2023-02-29');  // false
isValidDate('2024-2-1');    // false (формат)
daysBetween('2024-03-01', '2024-03-31');  // 30
daysBetween('2024-03-31', '2024-03-01');  // -30
\`\`\`

**Як це працює:** \`Date.UTC(year, month - 1, day)\` дає мс в UTC — там немає переходів на літній час. Неіснуюча дата переповнюється (30 лютого → 1 березня), тож перевіряємо, що \`getUTCFullYear/getUTCMonth/getUTCDate\` збіглися з введеними.

**Врахуйте:** формат перевіряйте посимвольно (довжина 10, дефіси на позиціях 4 і 7, решта — цифри).
`,
      starter: `const DAY_MS = 24 * 60 * 60 * 1000;

// Повертає UTC-таймстемп або null, якщо дата некоректна
function parseIsoDate(str) {
  // 1. Формат: довжина 10, '-' на позиціях 4 і 7, решта — цифри.
  // 2. year, month, day через slice + Number.
  // 3. time = Date.UTC(year, month - 1, day); перевірте, що дата не «переповнилась».
  // TODO
}

function isValidDate(str) {
  // TODO
}

function daysBetween(a, b) {
  // TODO: RangeError для некоректних, інакше Math.round(різниця / DAY_MS)
}

// Спробуйте в консолі:
// daysBetween('2024-03-01', '2024-03-31'); // 30
`,
      solution: `const DAY_MS = 24 * 60 * 60 * 1000;

// Повертає UTC-таймстемп опівночі або null для некоректної дати
function parseIsoDate(str) {
  if (typeof str !== 'string' || str.length !== 10 || str[4] !== '-' || str[7] !== '-') return null;
  for (let i = 0; i < 10; i++) {
    if (i === 4 || i === 7) continue;
    if (str[i] < '0' || str[i] > '9') return null;
  }
  const year = Number(str.slice(0, 4));
  const month = Number(str.slice(5, 7));
  const day = Number(str.slice(8, 10));

  const time = Date.UTC(year, month - 1, day); // UTC — без DST і поясів
  const date = new Date(time);
  // 30 лютого «переповнюється» в 1 березня — компоненти не збігуться
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return time;
}

function isValidDate(str) {
  return parseIsoDate(str) !== null;
}

function daysBetween(a, b) {
  const start = parseIsoDate(a);
  const end = parseIsoDate(b);
  if (start === null || end === null) throw new RangeError('Некоректна дата');
  return Math.round((end - start) / DAY_MS);
}
`,
      hints: [
        'Формат: `str.length === 10 && str[4] === \'-\' && str[7] === \'-\'` + цикл перевірки цифр.',
        'Переповнення: `new Date(Date.UTC(y, m - 1, d)).getUTCDate() !== d` → дата не існує.'
      ],
      tests: [
        { name: 'isValidDate: коректні дати', code: 'expect(isValidDate("2024-02-29")).toBe(true);\nexpect(isValidDate("2023-12-31")).toBe(true);\nexpect(isValidDate("2000-02-29")).toBe(true);' },
        { name: 'isValidDate: неіснуючі дати', code: 'expect(isValidDate("2023-02-29")).toBe(false);\nexpect(isValidDate("2024-02-30")).toBe(false);\nexpect(isValidDate("2024-04-31")).toBe(false);\nexpect(isValidDate("2024-13-01")).toBe(false);\nexpect(isValidDate("2024-00-10")).toBe(false);\nexpect(isValidDate("1900-02-29")).toBe(false);' },
        { name: 'isValidDate: неправильний формат', code: 'expect(isValidDate("2024-2-1")).toBe(false);\nexpect(isValidDate("01.02.2024")).toBe(false);\nexpect(isValidDate("2024-02-01T10:00")).toBe(false);\nexpect(isValidDate("abc")).toBe(false);\nexpect(isValidDate("")).toBe(false);' },
        { name: 'daysBetween: базові випадки', code: 'expect(daysBetween("2024-03-01", "2024-03-31")).toBe(30);\nexpect(daysBetween("2024-03-31", "2024-03-01")).toBe(-30);\nexpect(daysBetween("2024-05-05", "2024-05-05")).toBe(0);' },
        { name: 'daysBetween: високосні роки та межі років', code: 'expect(daysBetween("2024-02-28", "2024-03-01")).toBe(2);\nexpect(daysBetween("2023-02-28", "2023-03-01")).toBe(1);\nexpect(daysBetween("2023-12-31", "2024-01-01")).toBe(1);\nexpect(daysBetween("2024-01-01", "2025-01-01")).toBe(366);' },
        { name: 'daysBetween: через перехід на літній час', code: 'expect(daysBetween("2024-03-30", "2024-04-01")).toBe(2);\nexpect(daysBetween("2024-10-26", "2024-10-28")).toBe(2);' },
        { name: 'daysBetween: некоректна дата → RangeError', code: 'expect(() => daysBetween("2024-02-30", "2024-03-01")).toThrow(RangeError);\nexpect(() => daysBetween("2024-01-01", "nope")).toThrow(RangeError);' }
      ],
      explanation: `
O(1). Пастки: \`new Date('2024-02-30')\` у Chrome — 1 березня, а не помилка; різниця локальних дат через DST дає 23/25 годин. Формат коротше перевіряти регулярним виразом \`/^\\d{4}-\\d{2}-\\d{2}$/\` (наступний крок).
`
    },

    // ================================================================ 7. RegExp: основи
    {
      id: 'strnum-temporal-theory',
      group: 'date',
      type: 'theory',
      level: 2,
      title: 'Temporal: сучасна заміна Date',
      question: 'Оберіть **усі** правильні твердження про Temporal API.',
      choices: [
        'Об\'єкти Temporal незмінні: `date.add({ days: 1 })` повертає нову дату, а не змінює стару',
        'Є окремі типи: `PlainDate` (дата без часу і поясу), `ZonedDateTime` (момент у часовому поясі), `Instant` (точка на шкалі UTC), `Duration`',
        'Місяці в Temporal нумеруються з 1, а `PlainDate.from(\'2026-01-31\').add({ months: 1 })` дає 28 лютого',
        'Порівнювати дати Temporal можна через `===`',
        'У Chrome 144+ і Firefox 139+ Temporal вбудований; для браузерів без підтримки — поліфіл'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: на відміну від `setMonth` у Date — жодних мутацій.',
        'Так: тип відображає зміст — день народження не має часового поясу.',
        'Так: перевірено в Chrome 157 — `2026-02-28`; у Date `setMonth` для 31 січня дає 3 березня.',
        'Ні: `===` порівнює посилання (перевірено: false) — `a.equals(b)` або `Temporal.PlainDate.compare(a, b)`.',
        'Так: Stage 4 з березня 2026; у стабільному Safari підтримки поки немає — перевіряйте caniuse.'
      ],
      hint: 'Які дві головні пастки Date ви вже бачили в цьому модулі?',
      answer: `
| Тип | Що означає | Приклад |
|---|---|---|
| \`Temporal.PlainDate\` | календарна дата | день народження, дедлайн \`2026-12-31\` |
| \`Temporal.PlainTime\` | час доби | відкриття о \`09:00\` |
| \`Temporal.ZonedDateTime\` | момент + часовий пояс | зустріч \`2026-03-29T10:00[Europe/Kyiv]\` |
| \`Temporal.Instant\` | точка на шкалі UTC | час події в логах |
| \`Temporal.Duration\` | тривалість | \`P2M14D\` |

\`\`\`js
const due = Temporal.PlainDate.from('2026-01-31').add({ months: 1 });       // 2026-02-28
const left = Temporal.Now.plainDateISO().until(due, { largestUnit: 'months' });
const local = Temporal.Instant.from('2026-03-29T07:00:00Z').toZonedDateTimeISO('Europe/Kyiv'); // 10:00
\`\`\`
**Чому краще за Date:** незмінність, місяці з 1, явні часові пояси (IANA) і переходи на літній час, арифметика з календарними правилами, окремі типи замість одного «таймстемпа з локальним відображенням».

**Поки що:** у продакшені з підтримкою Safari — \`@js-temporal/polyfill\` або бібліотеки (date-fns, Luxon, Day.js); форматування для людей — \`Intl.DateTimeFormat\` / \`toLocaleString\`.
`,
      keyPoints: ['Незмінні об\'єкти', 'PlainDate / ZonedDateTime / Instant / Duration', 'Місяці з 1, обрізання до кінця місяця', 'equals / compare замість ===', 'Chrome 144+, Firefox 139+; Safari — поліфіл']
    },
    {
      id: 'strnum-temporal-dates',
      group: 'date',
      type: 'code',
      level: 3,
      title: 'Підписки й часові пояси на Temporal',
      tags: ['date', 'temporal'],
      description: `
**Завдання.** Реалізуйте чотири функції на **Temporal** (потрібен Chrome/Edge 144+ або Firefox 139+):
- \`addMonths(isoDate, n)\` → ISO-дата через \`n\` місяців (може бути від'ємним); якщо дня немає в цільовому місяці — останній день місяця;
- \`localTime(instantIso, timeZone)\` → \`'HH:MM'\` — місцевий час моменту \`instantIso\` (рядок з \`Z\`) у поясі \`timeZone\` (IANA, напр. \`'Europe/Kyiv'\`);
- \`durationLabel(fromIso, toIso)\` → \`'1 р. 2 міс. 14 дн.'\` — лише ненульові частини; однакові дати → \`'0 дн.'\`; \`to\` раніше за \`from\` → \`RangeError\`;
- \`isWeekend(isoDate)\` → \`true\` для суботи й неділі.

**Де трапляється:** дата наступного списання за підпискою, час вебінару для учасників з різних країн, «до кінця тріалу 1 міс. 3 дн.», підсвітка вихідних у календарі.

**Приклад**
\`\`\`js
addMonths('2026-01-31', 1);                          // '2026-02-28'
localTime('2026-03-29T01:30:00Z', 'Europe/Kyiv');    // '04:30' (вже літній час, UTC+3)
durationLabel('2026-01-01', '2026-03-15');           // '2 міс. 14 дн.'
isWeekend('2026-11-21');                             // true
\`\`\`

**Як це працює:** \`Temporal.PlainDate.from(iso)\`, \`.add({ months })\` (за замовчуванням обрізає до кінця місяця), \`.until(other, { largestUnit: 'years' })\` → \`Duration\` з полями \`years\`, \`months\`, \`days\`; \`Temporal.Instant.from(iso).toZonedDateTimeISO(tz)\`; \`dayOfWeek\`: 1 — понеділок … 7 — неділя.
`,
      starter: `function addMonths(isoDate, n) {
  // TODO: Temporal.PlainDate.from(isoDate).add({ months: n }).toString()
}

function localTime(instantIso, timeZone) {
  // TODO: Instant → ZonedDateTime у поясі → PlainTime → 'HH:MM'
}

function durationLabel(fromIso, toIso) {
  // TODO: until з largestUnit: 'years'; RangeError, якщо to раніше
}

function isWeekend(isoDate) {
  // TODO: dayOfWeek
}

// Спробуйте в консолі:
// addMonths('2026-01-31', 1);
`,
      solution: `function addMonths(isoDate, n) {
  return Temporal.PlainDate.from(isoDate).add({ months: n }).toString();
}

function localTime(instantIso, timeZone) {
  return Temporal.Instant.from(instantIso)
    .toZonedDateTimeISO(timeZone)
    .toPlainTime()
    .toString({ smallestUnit: 'minute' });
}

function durationLabel(fromIso, toIso) {
  const from = Temporal.PlainDate.from(fromIso);
  const to = Temporal.PlainDate.from(toIso);
  if (Temporal.PlainDate.compare(to, from) < 0) throw new RangeError('Кінцева дата раніше за початкову');
  const d = from.until(to, { largestUnit: 'years' });
  const parts = [];
  if (d.years) parts.push(d.years + ' р.');
  if (d.months) parts.push(d.months + ' міс.');
  if (d.days || parts.length === 0) parts.push(d.days + ' дн.');
  return parts.join(' ');
}

function isWeekend(isoDate) {
  return Temporal.PlainDate.from(isoDate).dayOfWeek >= 6;
}
`,
      hints: [
        '`addMonths`: `Temporal.PlainDate.from(isoDate).add({ months: n }).toString()` — обрізання до кінця місяця вже за замовчуванням (`overflow: \'constrain\'`).',
        '`localTime`: `Temporal.Instant.from(iso).toZonedDateTimeISO(tz).toPlainTime().toString({ smallestUnit: \'minute\' })`; `durationLabel`: `from.until(to, { largestUnit: \'years\' })`.'
      ],
      tests: [
        { name: 'addMonths: кінець місяця, високосний рік, від\'ємні', code: "expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');\nexpect(addMonths('2028-01-31', 1)).toBe('2028-02-29');\nexpect(addMonths('2026-11-15', 3)).toBe('2027-02-15');\nexpect(addMonths('2026-03-31', -1)).toBe('2026-02-28');" },
        { name: 'localTime: перехід на літній час', code: "expect(localTime('2026-03-29T00:30:00Z', 'Europe/Kyiv')).toBe('02:30');\nexpect(localTime('2026-03-29T01:30:00Z', 'Europe/Kyiv')).toBe('04:30');\nexpect(localTime('2026-03-29T07:00:00Z', 'America/New_York')).toBe('03:00');" },
        { name: 'durationLabel', code: "expect(durationLabel('2026-01-01', '2026-03-15')).toBe('2 міс. 14 дн.');\nexpect(durationLabel('2026-01-01', '2027-01-01')).toBe('1 р.');\nexpect(durationLabel('2025-01-10', '2026-03-12')).toBe('1 р. 2 міс. 2 дн.');\nexpect(durationLabel('2026-05-05', '2026-05-05')).toBe('0 дн.');\nexpect(() => durationLabel('2026-02-01', '2026-01-01')).toThrow(RangeError);" },
        { name: 'isWeekend', code: "expect(isWeekend('2026-11-21')).toBe(true);\nexpect(isWeekend('2026-11-22')).toBe(true);\nexpect(isWeekend('2026-11-23')).toBe(false);" }
      ],
      explanation: 'Порівняйте з `Date`: `new Date(2026, 0, 31).setMonth(1)` дає 3 березня (переповнення), часові пояси — лише локальний і UTC, а арифметика днів ламається на переходах на літній час. Temporal робить календарну арифметику явною: `PlainDate` не має поясу взагалі, `ZonedDateTime` знає правила DST з бази IANA. Для показу користувачу — `Intl.DateTimeFormat` або `toLocaleString(\'uk-UA\')`.',
      followUps: ['Чим Instant відрізняється від ZonedDateTime?', 'Що робить overflow: \'reject\' в add?', 'Як зберігати дату й час події в базі?']
    },
    {
      id: 'strnum-theory-regex',
      group: 'regex',
      type: 'theory',
      level: 3,
      title: 'Регулярні вирази: прапорці, квантифікатори, пастки',
      tags: ['regex'],
      question: 'Розкажіть про регулярні вирази в JS: прапорці, квантифікатори, групи, lookahead. Які пастки ви знаєте?',
      choices: [
        'Квантифікатори за замовчуванням ліниві: `/<.+>/` на рядку `\'<b>x</b>\'` захопить лише `\'<b>\'`',
        '`str.match(re)` з прапорцем `g` повертає масив збігів разом з іменованими групами кожного з них',
        'Глобальний regex у `test()` пам\'ятає `lastIndex`, тому повторні виклики можуть давати `true`, потім `false`',
        'Lookahead `(?=...)` поглинає символи, тому перевірена частина потрапляє в підсумковий збіг `match[0]`'
      ],
      correct: 2,
      why: [
        "Квантифікатори жадібні: `.+` захопить до останнього `>`; лінивий варіант — `.+?`.",
        "`match` з `g` повертає лише рядки збігів без груп; групи для кожного збігу дає `matchAll`.",
        "Правильно: regex з `g` — об'єкт зі станом, наступний пошук починається з lastIndex.",
        "Lookahead лише перевіряє, що йде далі, і нічого не додає до збігу."
      ],
      hint: 'Регулярний вираз з прапорцем g — це об\'єкт зі станом.',
      answer: `
- Синтаксис: \`/шаблон/прапорці\` або \`new RegExp(str, 'gi')\`.
- Класи: \`\\d\` цифра, \`\\w\` [A-Za-z0-9_], \`\\s\` пробільний, \`.\` будь-який, \`[abc]\`, \`[^abc]\`; \`\\p{L}\` — літера будь-якої абетки (з \`u\`).
- Квантифікатори: \`*\`, \`+\`, \`?\`, \`{2,4}\` — жадібні; \`+?\` — лінивий. Якорі \`^\`, \`$\`.
- Прапорці: \`g\` — усі збіги, \`i\` — без регістру, \`m\` — \`^\`/\`$\` по рядках, \`u\` — Unicode.
- Методи: \`re.test(s)\`, \`s.match(re)\`, \`s.matchAll(re)\`, \`s.replace(re, x)\`, \`s.split(re)\`.
- Пастки: \`lastIndex\` з \`g\`; ввід користувача в \`new RegExp\` — екранувати.
`,
      keyPoints: ['Класи, квантифікатори, якорі', 'Прапорці g, i, m, u', 'Жадібні vs ліниві', 'lastIndex у глобального regex', 'Екранування вводу'],
      followUps: ['Чим match відрізняється від matchAll?', 'Як екранувати рядок для new RegExp?']
    },
    {
      id: 'strnum-quiz-greedy',
      group: 'regex',
      type: 'quiz',
      level: 2,
      title: 'Жадібний vs лінивий квантифікатор',
      tags: ['regex'],
      question: `
\`.\` — будь-який символ, \`+\` — «один або більше». За замовчуванням квантифікатор **жадібний** (бере якомога більше), \`+?\` — **лінивий** (якомога менше).

Що виведе код?

\`\`\`js
const html = '<b>bold</b> and <i>italic</i>';
console.log(html.match(/<.+>/)[0]);
console.log(html.match(/<.+?>/g));
\`\`\`
`,
      options: [
        '`<b>` і `["<b>", "</b>", "<i>", "</i>"]`',
        '`<b>bold</b> and <i>italic</i>` і `["<b>bold</b> and <i>italic</i>"]`',
        '`<b>bold</b>` і `["<b>bold</b>", "<i>italic</i>"]`',
        '`<b>bold</b> and <i>italic</i>` і `["<b>", "</b>", "<i>", "</i>"]`'
      ],
      answer: 3,
      why: [
        "Без `?` квантифікатор жадібний — він дійде до останнього `>` у рядку.",
        "З `?` квантифікатор лінивий — зупиняється на першому `>`, тож тегів буде чотири.",
        "Регулярний вираз не знає про парні теги — він шукає лише `<` … `>`.",
        "Правильно: жадібний захопив усе до останнього `>`, лінивий з `g` знайшов кожен тег."
      ],
      hint: 'Що змінює ? після квантифікатора?',
      explanation: `
Замість лінивого \`.+?\` часто точніше «будь-що, крім \`>\`»: \`/<[^>]+>/g\`. HTML регулярками не парсять — для цього є DOMParser.
`
    },
    {
      id: 'strnum-quiz-regex-lastindex',
      group: 'regex',
      type: 'quiz',
      level: 3,
      title: 'test() з прапорцем g',
      tags: ['regex'],
      question: `
Що виведе код?

\`\`\`js
const re = /a/g;
console.log(re.test('a'), re.test('a'), re.test('a'));
\`\`\`
`,
      options: ['`true true true`', '`true false true`', '`true false false`', '`false false false`'],
      answer: 1,
      why: [
        "З прапорцем `g` regex запам'ятовує, де зупинився (lastIndex), тож другий пошук іде з позиції 1.",
        "Правильно: після збігу lastIndex = 1 → не знайдено, lastIndex скидається в 0 → знову знайдено.",
        "Після невдалого пошуку lastIndex скидається в 0, тож третій виклик знову знаходить «a».",
        "Перший виклик шукає з позиції 0 і знаходить «a»."
      ],
      hint: 'Яка властивість regex змінюється після успішного test з g?',
      explanation: `
Баг у валідації: спільний \`const re = /x/g\` і \`re.test(value)\` для різних полів «через раз» хибить. Для \`test\` прапорець \`g\` не потрібен.
`
    },
    {
      id: 'strnum-password',
      group: 'regex',
      type: 'code',
      level: 2,
      title: 'Перевірка правил пароля',
      tags: ['regex', 'validation'],
      description: `
**Завдання.** Напишіть \`validatePassword(password)\`, що повертає масив кодів **порушених** правил (у порядку таблиці) або \`[]\`.

**Де трапляється:** форма реєстрації: під полем показуємо, яких вимог ще бракує.

**Що написати**
- \`validatePassword(password)\` → масив кодів:

| Код | Правило |
|---|---|
| \`'length'\` | щонайменше 8 символів (емодзі — 1 символ) |
| \`'lowercase'\` | є мала літера (будь-якої абетки) |
| \`'uppercase'\` | є велика літера (будь-якої абетки) |
| \`'digit'\` | є цифра 0–9 |
| \`'special'\` | є символ — не літера, не цифра й не пробіл |
| \`'whitespace'\` | **немає** пробільних символів |

**Приклад**
\`\`\`js
validatePassword('Passw0rd!');   // []
validatePassword('password');    // ['uppercase', 'digit', 'special']
validatePassword('Пароль12!');   // []
validatePassword('Pass word1!'); // ['whitespace']
\`\`\`

**Як це працює:** \`/шаблон/.test(str)\` → \`true\`, якщо є збіг. \`[a-z]\` не бачить кирилиці — з прапорцем \`u\` є класи Unicode: \`\\p{Ll}\` мала літера, \`\\p{Lu}\` велика, \`\\p{L}\` будь-яка, \`\\p{N}\` цифра. \`\\s\` — пробільний символ.

**Врахуйте:** довжина в символах — \`Array.from(password).length\`.
`,
      starter: `function validatePassword(password) {
  const errors = [];
  // 1. length: Array.from(password).length < 8
  // 2. lowercase: /\\p{Ll}/u, uppercase: /\\p{Lu}/u
  // 3. digit: /[0-9]/
  // 4. special: /[^\\p{L}\\p{N}\\s]/u
  // 5. whitespace: /\\s/ — порушення, якщо ЗНАЙДЕНО
  // TODO
  return errors;
}

// Спробуйте в консолі:
// validatePassword('password'); // ['uppercase', 'digit', 'special']
`,
      solution: `function validatePassword(password) {
  const errors = [];
  if (Array.from(password).length < 8) errors.push('length'); // code points
  if (!/\\p{Ll}/u.test(password)) errors.push('lowercase');     // мала літера будь-якої абетки
  if (!/\\p{Lu}/u.test(password)) errors.push('uppercase');
  if (!/[0-9]/.test(password)) errors.push('digit');
  if (!/[^\\p{L}\\p{N}\\s]/u.test(password)) errors.push('special');
  if (/\\s/.test(password)) errors.push('whitespace');
  return errors;
}
`,
      hints: [
        'Шість `if` у порядку таблиці, кожен — `if (!/.../.test(password)) errors.push(\'код\');`.',
        'Пробіли — навпаки: порушення, коли `/\\s/.test(password)` дає `true`.'
      ],
      tests: [
        { name: 'коректний пароль', code: 'expect(validatePassword("Passw0rd!")).toEqual([]);' },
        { name: 'кілька порушень у правильному порядку', code: 'expect(validatePassword("password")).toEqual(["uppercase", "digit", "special"]);\nexpect(validatePassword("")).toEqual(["length", "lowercase", "uppercase", "digit", "special"]);' },
        { name: 'кирилиця', code: 'expect(validatePassword("Пароль12!")).toEqual([]);\nexpect(validatePassword("пароль12!")).toEqual(["uppercase"]);' },
        { name: 'пробіли', code: 'expect(validatePassword("Pass word1!")).toEqual(["whitespace"]);\nexpect(validatePassword("Passw0rd!\\t")).toEqual(["whitespace"]);' },
        { name: 'окремі правила', code: 'expect(validatePassword("PASSWORD1!")).toEqual(["lowercase"]);\nexpect(validatePassword("Abcdefg1")).toEqual(["special"]);\nexpect(validatePassword("Ab1!")).toEqual(["length"]);' },
        { name: 'довжина в code points', code: 'expect(validatePassword("Aa1!😀😀😀")).toEqual(["length"]);\nexpect(validatePassword("Aa1!😀😀😀😀")).toEqual([]);' }
      ],
      explanation: `
O(n). Пастки: \`[a-zA-Z]\` для «літери» відкидає кирилицю; \`password.length\` рахує емодзі як 2. Далі можуть спитати: як оцінювати силу пароля (zxcvbn), а не лише правила?
`
    },
    {
      id: 'strnum-extract',
      group: 'regex',
      type: 'code',
      level: 2,
      title: 'Витягти хештеги та email-и з тексту',
      tags: ['regex', 'parsing'],
      description: `
**Завдання.** Напишіть \`extractHashtags(text)\` і \`extractEmails(text)\` — витягують із тексту хештеги та email-адреси без повторів, у порядку появи.

**Де трапляється:** підсвітка тегів у пості, автоматичні посилання в чаті, імпорт контактів.

**Що написати**
- \`extractHashtags(text)\` → масив тегів **без \`#\`**, у нижньому регістрі. Тег — \`#\` + літери (будь-якої абетки), цифри, \`_\`; перед \`#\` не має бути літери/цифри/\`_\` (\`a#b\` — не тег).
- \`extractEmails(text)\` → масив адрес \`локальна@домен.зона\` (локальна частина — \`[\\w.+-]\`, домен — частини через крапку). Крапка в кінці речення до адреси не належить.

**Приклад**
\`\`\`js
extractHashtags('Люблю #JavaScript і #фронтенд! #js #JS'); // ['javascript', 'фронтенд', 'js']
extractEmails('Пишіть на ann@mail.com або bob+hr@company.co.uk.');
// ['ann@mail.com', 'bob+hr@company.co.uk']
\`\`\`

**Як це працює:** \`text.match(/.../g)\` повертає масив усіх збігів (або \`null\`). \`text.matchAll(re)\` дає кожен збіг з групами: \`m[1]\` — перша група. Negative lookbehind \`(?<!X)\` — «перед цим місцем немає X».

**Врахуйте:** \`\\w\` не бачить кирилиці — \`\\p{L}\` з прапорцем \`u\`. Повтори прибирайте через \`includes\`.
`,
      starter: `function extractHashtags(text) {
  // 1. re = /(?<![\\p{L}\\p{N}_])#([\\p{L}\\p{N}_]+)/gu
  // 2. for (const m of text.matchAll(re)): тег = m[1].toLowerCase(), додати без повторів.
  // TODO
}

function extractEmails(text) {
  // 1. text.match(/[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+/g) || []
  // 2. Прибрати повтори.
  // TODO
}

// Спробуйте в консолі:
// extractHashtags('#js і #JS'); // ['js']
`,
      solution: `function addUnique(list, value) {
  if (!list.includes(value)) list.push(value);
}

function extractHashtags(text) {
  // (?<!...) — перед # немає літери/цифри/_ ; \\p{L} — літера будь-якої абетки (потрібен u)
  const re = /(?<![\\p{L}\\p{N}_])#([\\p{L}\\p{N}_]+)/gu;
  const tags = [];
  for (const match of text.matchAll(re)) {
    addUnique(tags, match[1].toLowerCase());
  }
  return tags;
}

function extractEmails(text) {
  // домен вимагає хоча б одну «.частину», тож крапка в кінці речення не потрапить
  const found = text.match(/[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+/g) || [];
  const emails = [];
  for (const email of found) addUnique(emails, email);
  return emails;
}
`,
      hints: [
        'Хештеги: `for (const m of text.matchAll(re))` і `m[1].toLowerCase()`.',
        'Без повторів: `if (!list.includes(v)) list.push(v);`. Для email `match` може повернути `null` — додайте `|| []`.'
      ],
      tests: [
        { name: 'хештеги: регістр, кирилиця, повтори', code: 'expect(extractHashtags("Люблю #JavaScript і #фронтенд! #js #JS")).toEqual(["javascript", "фронтенд", "js"]);' },
        { name: 'хештеги: цифри й підкреслення, розділові знаки', code: 'expect(extractHashtags("#web_dev, #2024. (#a1)")).toEqual(["web_dev", "2024", "a1"]);' },
        { name: 'хештеги: # після літери не рахується', code: 'expect(extractHashtags("a#b c#d #ok")).toEqual(["ok"]);\nexpect(extractHashtags("без тегів # тут")).toEqual([]);' },
        { name: 'email: базові та з крапкою в кінці речення', code: 'expect(extractEmails("Пишіть на ann@mail.com або bob+hr@company.co.uk.")).toEqual(["ann@mail.com", "bob+hr@company.co.uk"]);' },
        { name: 'email: без повторів', code: 'expect(extractEmails("a@b.io, a@b.io; c.d@e-f.com")).toEqual(["a@b.io", "c.d@e-f.com"]);' },
        { name: 'email: некоректні не знаходяться', code: 'expect(extractEmails("not@valid @home mail@ test@.com")).toEqual([]);\nexpect(extractEmails("")).toEqual([]);' }
      ],
      explanation: `
O(n) на пошук + O(k²) на прибирання повторів через \`includes\` (у темі ES6+ це робить \`Set\`). Повністю коректний email-regex величезний — у формах краще \`<input type="email">\` і підтвердження листом.
`
    },
    {
      id: 'strnum-highlight',
      group: 'regex',
      type: 'code',
      level: 3,
      title: 'Підсвітити збіги пошуку (екранування RegExp)',
      tags: ['regex', 'search'],
      description: `
**Завдання.** Напишіть \`highlight(text, query)\`, що обгортає **всі** входження \`query\` у \`<mark>…</mark>\`.

**Де трапляється:** підсвітка пошукового запиту в результатах, автокомпліт, фільтр таблиці.

**Що написати**
- \`highlight(text, query)\` → рядок:
  - пошук без урахування регістру, але в результаті — **оригінальний** регістр тексту;
  - \`query\` — звичайний текст: \`. * + ? ( ) [ ] { } ^ $ | \\\\\` трактуються буквально;
  - порожній \`query\` → текст без змін.

**Приклад**
\`\`\`js
highlight('JavaScript та javascript', 'javascript');
// '<mark>JavaScript</mark> та <mark>javascript</mark>'
highlight('Ціна $5.00 (USD)', '$5.00');
// 'Ціна <mark>$5.00</mark> (USD)'
\`\`\`

**Як це працює:** \`new RegExp(query, 'gi')\` будує regex з рядка, але \`'.'\` у ньому — «будь-який символ», а \`'('\` кидає SyntaxError. Тому спецсимволи екрануємо: \`str.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')\` (\`$&\` — весь збіг). Функція заміни \`(m) => '<mark>' + m + '</mark>'\` зберігає регістр збігу.

**Врахуйте:** повторні виклики не мають залежати один від одного.
`,
      starter: `function escapeRegExp(str) {
  // TODO: перед кожним спецсимволом поставте \\
}

function highlight(text, query) {
  // 1. Порожній query → text.
  // 2. new RegExp(escapeRegExp(query), 'gi').
  // 3. text.replace(re, (m) => '<mark>' + m + '</mark>').
  // TODO
}

// Спробуйте в консолі:
// highlight('a.b', '.'); // 'a<mark>.</mark>b'
`,
      solution: `function escapeRegExp(str) {
  // екрануємо всі спецсимволи регулярних виразів: $& — весь збіг
  return str.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
}

function highlight(text, query) {
  if (!query) return text;
  const re = new RegExp(escapeRegExp(query), 'gi');
  // функція заміни зберігає оригінальний регістр збігу
  return text.replace(re, (match) => '<mark>' + match + '</mark>');
}
`,
      hints: [
        'Без екранування `highlight(\'a.b\', \'.\')` підсвітить кожен символ.',
        'Екранування: `str.replace(/[.*+?^${}()|[\\]\\\\]/g, \'\\\\$&\')`.'
      ],
      tests: [
        { name: 'усі входження з оригінальним регістром', code: 'expect(highlight("JavaScript та javascript", "javascript")).toBe("<mark>JavaScript</mark> та <mark>javascript</mark>");' },
        { name: 'спецсимволи трактуються буквально', code: 'expect(highlight("Ціна $5.00 (USD)", "$5.00")).toBe("Ціна <mark>$5.00</mark> (USD)");\nexpect(highlight("a.b", ".")).toBe("a<mark>.</mark>b");\nexpect(highlight("I like C++", "c++")).toBe("I like <mark>C++</mark>");' },
        { name: 'дужки та інші символи не ламають regex', code: 'expect(highlight("f(x) = [1]", "(x)")).toBe("f<mark>(x)</mark> = [1]");\nexpect(highlight("a|b", "|")).toBe("a<mark>|</mark>b");\nexpect(highlight("path\\\\to", "\\\\")).toBe("path<mark>\\\\</mark>to");' },
        { name: 'кирилиця без урахування регістру', code: 'expect(highlight("Київ і КИЇВ", "київ")).toBe("<mark>Київ</mark> і <mark>КИЇВ</mark>");' },
        { name: 'порожній запит і відсутність збігів', code: 'expect(highlight("text", "")).toBe("text");\nexpect(highlight("text", "zzz")).toBe("text");' },
        { name: 'повторні виклики не залежать один від одного', code: 'expect(highlight("aa", "a")).toBe("<mark>a</mark><mark>a</mark>");\nexpect(highlight("aa", "a")).toBe("<mark>a</mark><mark>a</mark>");' }
      ],
      explanation: `
O(n). Регулярний вираз створюється на кожен виклик — тому немає проблеми зі спільним \`lastIndex\`. Якщо результат іде в \`innerHTML\`, текст спершу треба екранувати від XSS (\`escapeHtml\` з кроку про пошук).
`
    },

    // ================================================================ 8. RegExp: групи
    {
      id: 'strnum-quiz-named-groups',
      group: 'regex-groups',
      type: 'quiz',
      level: 3,
      title: 'Lookbehind та іменовані групи в заміні',
      tags: ['regex'],
      question: `
\`(?<name>...)\` — іменована група; у рядку заміни на неї посилаються \`$<name>\`. \`(?<=X)\` — lookbehind: «перед збігом стоїть X», але X у збіг не входить.

Що виведе код?

\`\`\`js
const s = 'Ціна $25, знижка $5, код 100';
console.log(s.match(/(?<=\\$)\\d+/g));
console.log(s.replace(/\\$(?<sum>\\d+)/g, '$<sum> USD'));
\`\`\`
`,
      options: [
        '`["$25", "$5"]` і `Ціна 25 USD, знижка 5 USD, код 100`',
        '`["25", "5", "100"]` і `Ціна $25 USD, знижка $5 USD, код 100 USD`',
        '`["25", "5"]` і `Ціна 25 USD, знижка 5 USD, код 100`',
        '`["25", "5"]` і `Ціна $<sum> USD, знижка $<sum> USD, код 100`'
      ],
      answer: 2,
      why: [
        "Lookbehind лише перевіряє `$` перед числом, але не додає його в збіг.",
        "Перед 100 немає `$`, тому воно не підходить ні під lookbehind, ні під заміну.",
        "Правильно: знайдено числа після `$`, а заміна вставила групу sum без `$`.",
        "`$<sum>` у рядку заміни підставляє значення групи, а не залишається текстом."
      ],
      hint: 'Чи входить те, що перевірив lookbehind, у збіг?',
      explanation: `
Lookbehind/lookahead — перевірки «без поглинання». Аналоги в рядку заміни: \`$&\` — весь збіг, \`$1\` — перша група, \`$<name>\` — іменована.
`
    },
    {
      id: 'strnum-template-render',
      group: 'regex-groups',
      type: 'code',
      level: 2,
      title: 'Шаблонізатор "Hello {{name}}"',
      tags: ['regex', 'templates'],
      description: `
**Завдання.** Напишіть \`render(template, data)\`, що замінює плейсхолдери \`{{ path }}\` значеннями з \`data\`.

**Де трапляється:** шаблони email-розсилок, i18n-рядки «Привіт, {{name}}», класика співбесід.

**Що написати**
- \`render(template, data)\` → рядок:
  - шлях може бути вкладеним: \`{{user.name}}\`; пробіли в дужках дозволені;
  - відсутнє / \`null\` / \`undefined\` → \`''\`; \`0\` і \`false\` → \`'0'\`, \`'false'\`;
  - значення вставляються буквально (\`$&\` у даних не інтерпретується);
  - некоректні плейсхолдери (\`{a}\`, \`{{ }}\`, \`{{a b}}\`) — без змін.

**Приклад**
\`\`\`js
render('Hello, {{name}}!', { name: 'Ann' });                                // 'Hello, Ann!'
render('{{ user.name }} ({{user.age}})', { user: { name: 'Bob', age: 30 } }); // 'Bob (30)'
render('a{{missing}}b', {});                                                // 'ab'
\`\`\`

**Як це працює:** \`template.replace(/\\{\\{\\s*([\\w.]+)\\s*\\}\\}/g, (match, path) => ...)\` — для кожного збігу викликається функція, \`path\` — перша група, а що вона поверне — те й вставиться. На відміну від рядка заміни, результат функції не обробляє \`$&\`.

**Врахуйте:** \`{\` і \`}\` у regex треба екранувати; вкладений шлях — \`path.split('.')\` і цикл.
`,
      starter: `function getByPath(obj, path) {
  // 1. path.split('.') → ключі.
  // 2. Ідіть ключами вглиб; якщо по дорозі null/undefined — поверніть undefined.
  // TODO
}

function render(template, data) {
  // 1. Regex: {{ — пробіли — шлях [\\w.]+ — пробіли — }}, прапорець g.
  // 2. template.replace(re, (match, path) => значення або '').
  // TODO
}

// Спробуйте в консолі:
// render('Hello, {{name}}!', { name: 'Ann' }); // 'Hello, Ann!'
`,
      solution: `function getByPath(obj, path) {
  let current = obj;
  for (const key of path.split('.')) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  return current;
}

function render(template, data) {
  // {{ — пробіли — шлях з літер/цифр/_/крапок — пробіли — }}
  return template.replace(/\\{\\{\\s*([\\w.]+)\\s*\\}\\}/g, (match, path) => {
    const value = getByPath(data, path);
    // функція заміни — без інтерпретації $& у даних
    return value === null || value === undefined ? '' : String(value);
  });
}
`,
      hints: [
        'Regex: `/\\{\\{\\s*([\\w.]+)\\s*\\}\\}/g`; другий аргумент `replace` — функція `(match, path) => ...`.',
        '`getByPath`: цикл `for (const key of path.split(\'.\'))` з перевіркою `current === null || current === undefined`.'
      ],
      tests: [
        'expect(render("Hello, {{name}}!", { name: "Ann" })).toBe("Hello, Ann!")',
        { name: 'вкладені шляхи та пробіли', code: 'expect(render("{{ user.name }} ({{user.age}})", { user: { name: "Bob", age: 30 } })).toBe("Bob (30)");' },
        { name: 'відсутні та null значення → порожньо', code: 'expect(render("a{{missing}}b", {})).toBe("ab");\nexpect(render("[{{x}}]", { x: null })).toBe("[]");\nexpect(render("[{{a.b.c}}]", { a: null })).toBe("[]");' },
        { name: '0 і false виводяться', code: 'expect(render("{{n}} {{f}}", { n: 0, f: false })).toBe("0 false");' },
        { name: 'кілька однакових плейсхолдерів', code: 'expect(render("{{a}}-{{a}}-{{b}}", { a: "x", b: "y" })).toBe("x-x-y");' },
        { name: 'спецпослідовності в даних вставляються буквально', code: 'expect(render("Price: {{p}}", { p: "$&5" })).toBe("Price: $&5");\nexpect(render("{{v}}", { v: "$1$$" })).toBe("$1$$");' },
        { name: 'некоректні плейсхолдери не чіпаються', code: 'expect(render("{a} {{ }} {{a b}} {{", { a: 1 })).toBe("{a} {{ }} {{a b}} {{");' }
      ],
      explanation: `
O(n). Пастки: \`value || ''\` губить \`0\` і \`false\`; рядок заміни замість функції інтерпретує \`$&\`. Якщо результат іде в HTML — значення треба екранувати (\`escapeHtml\`).
`
    },
    {
      id: 'strnum-case-convert',
      group: 'regex-groups',
      type: 'code',
      level: 3,
      title: 'camelCase, kebab-case, snake_case',
      tags: ['regex', 'strings'],
      description: `
**Завдання.** Напишіть конвертери регістру для латинських ідентифікаторів: \`toCamelCase\`, \`toKebabCase\`, \`toSnakeCase\`.

**Де трапляється:** ключі API (\`user_name\` ↔ \`userName\`), CSS-класи й \`data-*\` атрибути (\`data-user-id\` ↔ \`dataset.userId\`).

**Що написати**
- \`toCamelCase(str)\` → \`'helloWorld'\`
- \`toKebabCase(str)\` → \`'hello-world'\`
- \`toSnakeCase(str)\` → \`'hello_world'\`
- Вхід — будь-який стиль. Межі слів: будь-які не-буквено-цифрові символи **та** перехід регістру (\`helloWorld\`, \`XMLHttp\` → \`XML\` + \`Http\`).

**Приклад**
\`\`\`js
toKebabCase('helloWorld');        // 'hello-world'
toCamelCase('hello_world-foo');   // 'helloWorldFoo'
toSnakeCase('XMLHttpRequest');    // 'xml_http_request'
toCamelCase('  --Foo__BAR--  ');  // 'fooBar'
\`\`\`

**Як це працює:** спільна функція \`splitWords\` повертає масив слів. Перехід регістру позначаємо пробілом заміною з групами: \`replace(/([a-z\\d])([A-Z])/g, '$1 $2')\` (\`$1\`, \`$2\` — групи). Потім \`split(/[^a-zA-Z\\d]+/)\` ділить за будь-якими роздільниками.

**Врахуйте:** абревіатури — друга заміна \`/([A-Z]+)([A-Z][a-z])/g\`; порожні частини від \`split\` пропускайте.
`,
      starter: `function splitWords(str) {
  // 1. 'helloWorld' → 'hello World': replace(/([a-z\\d])([A-Z])/g, '$1 $2')
  // 2. 'XMLHttp' → 'XML Http': replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  // 3. split(/[^a-zA-Z\\d]+/), пропустити '', усе в нижній регістр.
  // TODO
}

function toCamelCase(str) {
  // TODO: перше слово як є, решта — з великої літери, join('')
}

function toKebabCase(str) {
  // TODO
}

function toSnakeCase(str) {
  // TODO
}

// Спробуйте в консолі:
// toSnakeCase('XMLHttpRequest'); // 'xml_http_request'
`,
      solution: `function splitWords(str) {
  const spaced = str
    .replace(/([a-z\\d])([A-Z])/g, '$1 $2')      // helloWorld → hello World
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');  // XMLHttp → XML Http
  const words = [];
  for (const part of spaced.split(/[^a-zA-Z\\d]+/)) {
    if (part !== '') words.push(part.toLowerCase()); // зайві роздільники дають ''
  }
  return words;
}

function toCamelCase(str) {
  const words = splitWords(str);
  let result = '';
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    result += i === 0 ? word : word[0].toUpperCase() + word.slice(1);
  }
  return result;
}

function toKebabCase(str) {
  return splitWords(str).join('-');
}

function toSnakeCase(str) {
  return splitWords(str).join('_');
}
`,
      hints: [
        'Усі три функції — це `splitWords` + `join` (для camel — ще велика перша літера слів, крім першого).',
        '`splitWords`: дві заміни з `\'$1 $2\'`, потім `split(/[^a-zA-Z\\d]+/)` і цикл, що пропускає порожні рядки.'
      ],
      tests: [
        { name: 'з пробілів', code: 'expect(toCamelCase("hello world")).toBe("helloWorld");\nexpect(toKebabCase("hello world")).toBe("hello-world");\nexpect(toSnakeCase("hello world")).toBe("hello_world");' },
        { name: 'з camelCase і PascalCase', code: 'expect(toKebabCase("helloWorld")).toBe("hello-world");\nexpect(toSnakeCase("HelloBigWorld")).toBe("hello_big_world");\nexpect(toCamelCase("HelloWorld")).toBe("helloWorld");' },
        { name: 'змішані роздільники', code: 'expect(toCamelCase("hello_world-foo")).toBe("helloWorldFoo");\nexpect(toKebabCase("user_first name")).toBe("user-first-name");' },
        { name: 'абревіатури', code: 'expect(toSnakeCase("XMLHttpRequest")).toBe("xml_http_request");\nexpect(toKebabCase("getHTTPResponseCode")).toBe("get-http-response-code");\nexpect(toCamelCase("XMLHttpRequest")).toBe("xmlHttpRequest");' },
        { name: 'зайві роздільники та регістр', code: 'expect(toCamelCase("  --Foo__BAR--  ")).toBe("fooBar");\nexpect(toKebabCase("__a__")).toBe("a");' },
        { name: 'цифри', code: 'expect(toKebabCase("version2Update")).toBe("version2-update");\nexpect(toCamelCase("level 3 boss")).toBe("level3Boss");' },
        { name: 'порожній рядок', code: 'expect(toCamelCase("")).toBe("");\nexpect(toKebabCase("")).toBe("");\nexpect(toSnakeCase("---")).toBe("");' }
      ],
      explanation: `
O(n). Ключова ідея — спершу нормалізувати в масив слів, а потім лише склеювати. Пастка — абревіатури (\`XMLHttp\`): однієї заміни недостатньо.
`
    },
    {
      id: 'strnum-parse-log',
      group: 'regex-groups',
      type: 'code',
      level: 3,
      title: 'Розбір логів: іменовані групи та matchAll',
      tags: ['regex', 'parsing'],
      description: `
**Завдання.** Напишіть \`parseLog(line)\` і \`parseLogs(text)\` для рядків логу у форматі:

\`\`\`text
[2024-03-10 14:05:33] ERROR (auth): Invalid token
[2024-03-10 14:06:00] INFO: Server started
\`\`\`

**Де трапляється:** перегляд логів в адмінці, парсинг відповіді CLI чи CSV-подібного тексту.

**Що написати**
- \`parseLog(line)\` → \`{ date, time, level, module, message }\` або \`null\`, якщо формат не той:
  - рівень — \`DEBUG\` | \`INFO\` | \`WARN\` | \`ERROR\`;
  - модуль у дужках (\`[\\w-]+\`) **необов'язковий** → \`null\`, якщо немає;
  - повідомлення — усе після \`': '\` до кінця рядка.
- \`parseLogs(text)\` → масив записів з багаторядкового тексту; некоректні рядки пропускаються.

**Приклад**
\`\`\`js
parseLog('[2024-03-10 14:05:33] ERROR (auth): Invalid token');
// { date: '2024-03-10', time: '14:05:33', level: 'ERROR', module: 'auth', message: 'Invalid token' }
\`\`\`

**Як це працює:** іменовані групи \`(?<date>\\d{4}-\\d{2}-\\d{2})\` потрапляють у \`match.groups.date\`. Необов'язкова частина — незахоплююча група з \`?\`: \`(?: \\((?<module>[\\w-]+)\\))?\` (якщо її немає — \`groups.module === undefined\`). Для багатьох рядків: прапорці \`gm\` (\`^\`/\`$\` — межі кожного рядка) і \`text.matchAll(re)\`.

**Врахуйте:** \`[\`, \`]\`, \`(\`, \`)\` у тексті треба екранувати; повторні виклики \`parseLog\` стабільні (без \`g\` немає \`lastIndex\`).
`,
      starter: `// TODO: один regex з іменованими групами date, time, level, module, message
const LOG_RE = /^$/;

function toEntry(groups) {
  // TODO: { date, time, level, module (або null), message }
}

function parseLog(line) {
  // 1. const match = LOG_RE.exec(line);
  // 2. match ? toEntry(match.groups) : null
  // TODO
}

function parseLogs(text) {
  // 1. new RegExp(LOG_RE.source, 'gm')
  // 2. for (const match of text.matchAll(re)) — додавайте toEntry(match.groups)
  // TODO
}

// Спробуйте в консолі:
// parseLog('[2024-03-10 14:06:00] INFO: Server started');
`,
      solution: `const LOG_RE = /^\\[(?<date>\\d{4}-\\d{2}-\\d{2}) (?<time>\\d{2}:\\d{2}:\\d{2})\\] (?<level>DEBUG|INFO|WARN|ERROR)(?: \\((?<module>[\\w-]+)\\))?: (?<message>.*)$/;

function toEntry(groups) {
  return {
    date: groups.date,
    time: groups.time,
    level: groups.level,
    module: groups.module === undefined ? null : groups.module,
    message: groups.message
  };
}

function parseLog(line) {
  const match = LOG_RE.exec(line); // без прапорця g — без стану lastIndex
  return match ? toEntry(match.groups) : null;
}

function parseLogs(text) {
  // m: ^ і $ — межі кожного рядка; g: потрібен для matchAll
  const re = new RegExp(LOG_RE.source, 'gm');
  const entries = [];
  for (const match of text.matchAll(re)) {
    entries.push(toEntry(match.groups));
  }
  return entries;
}
`,
      hints: [
        'Каркас: `/^\\[(?<date>...) (?<time>...)\\] (?<level>DEBUG|INFO|WARN|ERROR)(?: \\((?<module>[\\w-]+)\\))?: (?<message>.*)$/`.',
        '`parseLogs`: `new RegExp(LOG_RE.source, \'gm\')` + `for...of` по `text.matchAll(re)`.'
      ],
      tests: [
        { name: 'рядок з модулем', code: 'expect(parseLog("[2024-03-10 14:05:33] ERROR (auth): Invalid token")).toEqual({ date: "2024-03-10", time: "14:05:33", level: "ERROR", module: "auth", message: "Invalid token" });' },
        { name: 'рядок без модуля → module: null', code: 'const r = parseLog("[2024-03-10 14:06:00] INFO: Server started");\nexpect(r.module).toBeNull();\nexpect(r.level).toBe("INFO");\nexpect(r.message).toBe("Server started");' },
        { name: 'двокрапки й дужки в повідомленні', code: 'const r = parseLog("[2024-03-10 14:07:01] WARN (db-pool): Slow query: SELECT (1) took 2s");\nexpect(r.module).toBe("db-pool");\nexpect(r.message).toBe("Slow query: SELECT (1) took 2s");' },
        { name: 'некоректні рядки → null', code: 'expect(parseLog("2024-03-10 14:05:33 ERROR: x")).toBeNull();\nexpect(parseLog("[2024-03-10 14:05:33] FATAL: x")).toBeNull();\nexpect(parseLog("[24-03-10 14:05:33] INFO: x")).toBeNull();\nexpect(parseLog("[2024-03-10 14:05:33] INFO x")).toBeNull();\nexpect(parseLog("")).toBeNull();' },
        { name: 'повторні виклики стабільні', code: 'const line = "[2024-03-10 14:05:33] DEBUG: ok";\nexpect(parseLog(line)).not.toBeNull();\nexpect(parseLog(line)).not.toBeNull();\nexpect(parseLog(line)).not.toBeNull();' },
        { name: 'parseLogs: багаторядковий текст', code: 'const text = [\n  "[2024-03-10 14:05:33] ERROR (auth): Invalid token",\n  "garbage line",\n  "[2024-03-10 14:06:00] INFO: Server started",\n  ""\n].join("\\n");\nconst r = parseLogs(text);\nexpect(r).toHaveLength(2);\nexpect(r[0]).toEqual({ date: "2024-03-10", time: "14:05:33", level: "ERROR", module: "auth", message: "Invalid token" });\nexpect(r[1].message).toBe("Server started");' },
        { name: 'parseLogs: порожній текст', code: 'expect(parseLogs("")).toEqual([]);' }
      ],
      explanation: `
O(n). Іменовані групи читаються краще за \`match[3]\` і не ламаються, якщо додати нову групу. Пастка — спільний regex з \`g\` у \`parseLog\` (\`lastIndex\` зробить повторні виклики нестабільними).
`
    }
  ]
});
