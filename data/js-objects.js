FE.topic('js-objects', {
  intro: `
**Об'єкт** — набір пар «ключ → значення». Ключі — лише **рядки** (і символи, про них — у темі ES6+); усе інше перетворюється на рядок. Змінна зберігає **посилання** на об'єкт.

## Літерал

\`\`\`js
const field = 'email';
const user = {
  name,                       // shorthand: name: name
  [field]: 'a@b.c',           // обчислюваний ключ
  greet() { return 'Hi'; },   // метод
  ...defaults,                // spread: копія полів іншого об'єкта
};
Object.fromEntries([['a', 1]]); // { a: 1 }
\`\`\`

## Порядок ключів (Object.keys, for..in, JSON.stringify)

1. **цілочисельні** ключі (\`'1'\`, \`'42'\`) — за зростанням;
2. решта рядкових — у порядку додавання.

## Перебір і перевірка

| Спосіб | Що дає |
|---|---|
| \`Object.keys / values / entries\` | власні перелічувані ключі / значення / пари |
| \`for (const k in obj)\` | ключі, **включно з успадкованими** перелічуваними |
| \`'k' in obj\` | є власна **або** вбудована властивість (\`'toString' in {}\` → \`true\`) |
| \`Object.hasOwn(obj, 'k')\` | лише власна — правильна перевірка для словників |

\`obj.k !== undefined\` — **не** перевірка наявності: властивість може існувати зі значенням \`undefined\`.

## Копіювання

| Спосіб | Глибина | Що втрачається |
|---|---|---|
| \`{ ...obj }\`, \`Object.assign({}, obj)\` | поверхнева | вкладені об'єкти спільні; геттери стають значеннями |
| \`JSON.parse(JSON.stringify(obj))\` | глибока | \`undefined\` і функції зникають; \`Date\` → рядок; \`NaN\` → \`null\`; цикли → помилка |
| \`structuredClone(obj)\` | глибока | функції → помилка; геттери стають значеннями; \`Date\` і цикли — ок |

## Дескриптори та заморожування

\`\`\`js
Object.defineProperty(obj, 'id', { value: 1 }); // writable/enumerable/configurable = false!
Object.getOwnPropertyDescriptor(obj, 'id');
\`\`\`

| | додавати | видаляти | змінювати |
|---|---|---|---|
| \`preventExtensions\` | ні | так | так |
| \`seal\` | ні | ні | так |
| \`freeze\` | ні | ні | ні |

Усі три — **поверхневі**. У strict mode порушення кидає \`TypeError\`, у sloppy — тихо ігнорується.

## Типові пастки

- \`{} === {}\` → \`false\` (порівнюються посилання).
- \`a[objKey]\` — ключ стане \`'[object Object]'\`.
- \`counts[word] || 0\` ламається на \`word = 'constructor'\` — використовуйте \`Object.hasOwn\`.
- \`const\` забороняє перепризначення змінної, а не мутацію об'єкта.
`,
  groups: [
    {
      id: 'basics',
      title: 'Літерал, ключі та посилання'
    },
    {
      id: 'iteration',
      title: 'Перебір і перевірка наявності'
    },
    {
      id: 'transform',
      title: 'Трансформація об\'єктів'
    },
    {
      id: 'copying',
      title: 'Копіювання: поверхневе і глибоке'
    },
    {
      id: 'descriptors',
      title: 'Дескриптори, геттери, сеттери'
    },
    {
      id: 'freeze',
      title: 'freeze, seal і незмінність'
    },
    {
      id: 'paths',
      title: 'Вкладені дані: шляхи, flatten, merge'
    },
    {
      id: 'dictionary',
      title: 'Об\'єкт як словник'
    }
  ],
  items: [
    // ================================================================ basics
    {
      id: 'obj-creation-ways',
      group: 'basics',
      type: 'theory',
      level: 1,
      title: 'Літерал об\'єкта: що він уміє',
      tags: ['objects', 'basics'],
      question: 'Як створюють об\'єкти на практиці і що вміє літерал `{}`? Оберіть **усі** правильні твердження.',
      choices: [
        '`{ [key]: 1 }` створює властивість з ім\'ям зі змінної `key` (обчислюваний ключ)',
        '`{ name }` — скорочення для `{ name: name }`',
        '`{ ...a, ...b }` глибоко зливає вкладені об\'єкти `a` і `b`',
        'Фабрика, що повертає літерал, при кожному виклику віддає той самий об\'єкт',
        '`new Object()` швидший за `{}`, тому його радять у продакшн-коді'
      ],
      correct: [0, 1],
      why: [
        'Так: вираз у квадратних дужках обчислюється і стає ім\'ям властивості.',
        'Так: shorthand бере ім\'я і значення з однойменної змінної.',
        'Ні: spread копіює лише перший рівень; вкладений `a.x` просто замінюється на `b.x`.',
        'Ні: кожен виклик функції виконує літерал заново і створює новий об\'єкт.',
        'Ні: `new Object()` робить те саме, що `{}`, але довше пишеться; на практиці — лише літерал.'
      ],
      hint: 'Згадайте shorthand, обчислювані ключі, spread і фабричні функції.',
      answer: `
**Способи:**
1. **Літерал** \`{}\` — 99% випадків.
2. **Фабрична функція** — повертає новий літерал при кожному виклику; приватний стан тримають у замиканні.
3. **\`Object.fromEntries(pairs)\`** — з масиву пар \`[key, value]\`.
4. **\`{ ...obj }\` / \`Object.assign({}, obj)\` / \`structuredClone\`** — з іншого об'єкта.
5. Конструктори та класи — окрема тема (прототипи).

**Можливості літерала:**
\`\`\`js
const field = 'email';
const user = {
  name,                    // shorthand
  [field]: 'a@b.c',        // обчислюваний ключ
  greet() { return 'Hi'; },// метод
  ...defaults,             // поверхнева копія полів
};
\`\`\`

**Нюанс:** при spread пізніші поля перезаписують ранні: \`{ ...defaults, ...userSettings }\` — класичний патерн «налаштування за замовчуванням».
`,
      keyPoints: [
        'Літерал: shorthand, обчислювані ключі, методи, spread',
        'Spread — лише поверхнева копія, пізніші поля перемагають',
        'Фабрична функція створює новий об\'єкт при кожному виклику',
        'Object.fromEntries — з масиву пар'
      ],
      followUps: ['Чим `{ ...a, ...b }` відрізняється від `Object.assign(a, b)`?', 'Як зробити приватне поле в об\'єкті з фабрики?']
    },
    {
      id: 'obj-quiz-reference',
      group: 'basics',
      type: 'quiz',
      level: 1,
      title: 'Посилання та порівняння об\'єктів',
      tags: ['objects', 'reference'],
      question: `
Що виведе код?

\`\`\`js
const a = { x: 1 };
const b = a;
const c = { x: 1 };
b.x = 2;
console.log(a.x, a === b, a === c);
\`\`\`
`,
      options: ['`1 true false`', '`2 true true`', '`1 false false`', '`2 true false`'],
      answer: 3,
      why: [
        '`b = a` не копіює об\'єкт — зміна через `b` видна й через `a`, тож `a.x` уже 2.',
        '`a === c` — `false`: вміст однаковий, але це два різні об\'єкти.',
        'І `a.x`, і `a === b` хибні: `a` і `b` — одне посилання на один об\'єкт.',
        'Так: `a` і `b` — один об\'єкт (x = 2), а `c` — інший, тож `===` дає `false`.'
      ],
      hint: 'Що саме копіюється в рядку `const b = a` — об\'єкт чи посилання на нього?',
      explanation: `
\`const b = a\` копіює **посилання** — обидві змінні вказують на один об'єкт. \`===\` для об'єктів порівнює посилання, а не вміст.

Для порівняння за вмістом пишуть \`deepEqual\` (рекурсивно по ключах) або для простих плоских даних — порівняння \`JSON.stringify\` (з обмеженнями: порядок ключів, \`undefined\`, \`Date\`).
`
    },
    {
      id: 'obj-quiz-key-coercion',
      group: 'basics',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Об\'єкт як ключ іншого об\'єкта',
      tags: ['objects', 'keys'],
      question: `
Що виведе код?

\`\`\`js
const a = {};
const b = { key: 'b' };
const c = { key: 'c' };
a[b] = 123;
a[c] = 456;
console.log(a[b]);
\`\`\`
`,
      options: ['`123`', '`456`', '`undefined`', '`TypeError`'],
      answer: 1,
      why: [
        'Так було б, якби ключі розрізнялися за посиланням; але звичайний об\'єкт приводить ключ до рядка.',
        'Так: і `b`, і `c` стають рядком `\'[object Object]\'`, тож друге присвоєння перезаписує перше.',
        'Властивість `\'[object Object]\'` існує — її записали двічі.',
        'Помилки немає: об\'єкт тихо перетворюється на рядок.'
      ],
      hint: 'Якого типу можуть бути ключі звичайного об\'єкта? Що стане з об\'єктом, якщо привести його до рядка?',
      explanation: `
Ключ властивості — рядок. \`String(b)\` і \`String(c)\` обидва дають \`'[object Object]'\`, тому \`a[b]\` і \`a[c]\` — одна й та сама властивість \`a['[object Object]']\`, остання запис — \`456\`.

**Практичний висновок:** не використовуйте об'єкти як ключі звичайного об'єкта. Беріть унікальний рядок/число (\`user.id\`) — або спеціальну структуру з теми ES6+.
`
    },
    {
      id: 'obj-quiz-key-order',
      group: 'basics',
      type: 'quiz',
      level: 2,
      title: 'Порядок ключів в Object.keys',
      tags: ['objects', 'keys', 'order'],
      question: `
Що виведе код?

\`\`\`js
const obj = {
  b: 1,
  2: 'two',
  a: 2,
  1: 'one',
  '-1': 'minus',
  '01': 'zero-one'
};
console.log(Object.keys(obj));
\`\`\`
`,
      options: [
        '`["b", "2", "a", "1", "-1", "01"]`',
        '`["-1", "01", "1", "2", "a", "b"]`',
        '`["1", "2", "b", "a", "-1", "01"]`',
        '`["1", "2", "-1", "01", "b", "a"]`'
      ],
      answer: 2,
      why: [
        'Чистий порядок вставки — ні: цілочисельні ключі завжди йдуть першими і за зростанням.',
        'Повного сортування за алфавітом немає — рядкові ключі лишаються в порядку додавання.',
        'Так: спершу цілочисельні `1`, `2` за зростанням, потім решта в порядку додавання.',
        '`\'-1\'` і `\'01\'` — не «канонічні» цілі індекси, тож це звичайні рядки в порядку додавання.'
      ],
      hint: 'Ключі, що виглядають як невід\'ємні цілі числа (без провідних нулів), обробляються особливо.',
      explanation: `
Порядок власних ключів задає специфікація:
1. ключі-індекси (канонічні невід'ємні цілі: \`'1'\`, \`'2'\`) — за зростанням;
2. решта рядків — у порядку додавання (\`'b'\`, \`'a'\`, \`'-1'\`, \`'01'\`).

**Практичний наслідок:** словник \`{ [id]: item }\` з числовими id «пересортує» елементи. Якщо порядок важливий — зберігайте окремо масив id.
`
    },
    {
      id: 'obj-theory-pass-by-sharing',
      group: 'basics',
      type: 'theory',
      level: 2,
      title: 'Об\'єкти передаються за посиланням?',
      tags: ['objects', 'reference'],
      question: 'Як передаються об\'єкти у функцію — за значенням чи за посиланням? Що буде, якщо всередині функції змінити властивість параметра, а що — якщо присвоїти параметру новий об\'єкт?',
      choices: [
        'Об\'єкти передаються за посиланням, тож `o = { x: 3 }` у функції замінить зовнішній об\'єкт',
        'Об\'єкт копіюється при передачі, тому `o.x = 2` усередині функції ззовні не видно',
        'Мутацію `o.x = 2` видно ззовні, а `o = { x: 3 }` змінює лише локальну змінну',
        'Зовнішній `const obj` захищає від мутацій: `o.x = 2` у функції кине `TypeError`'
      ],
      correct: 2,
      why: [
        'Ні: передається копія посилання; перепризначення параметра змінює лише локальну змінну.',
        'Ні: копіюється посилання, а не об\'єкт — обидві змінні вказують на одні дані.',
        'Так: це call by sharing — спільний об\'єкт, але окремі змінні.',
        'Ні: `const` забороняє перепризначати змінну, а не змінювати вміст об\'єкта.'
      ],
      hint: 'Є термін «call by sharing».',
      answer: `
У JavaScript **усе передається за значенням**, але для об'єкта значення — це **посилання** (*call by sharing*).

\`\`\`js
function mutate(o) { o.x = 2; }        // змінює спільний об'єкт
function reassign(o) { o = { x: 3 }; } // змінює лише локальну змінну

const obj = { x: 1 };
mutate(obj);   // obj.x === 2
reassign(obj); // obj.x === 2
\`\`\`

- **Мутація** параметра (\`o.x = ...\`, \`arr.push\`) видна ззовні.
- **Перепризначення** (\`o = ...\`) — ні; справжньої передачі «за посиланням» (як \`ref\` у C#) немає.

**Практика:** ненавмисні мутації аргументів — часте джерело багів (React/Redux відстежують зміни за посиланням). Тому функції повертають нову копію (\`{ ...obj, x: 2 }\`), а не мутують вхід.
`,
      keyPoints: [
        'Усе передається за значенням; для об\'єкта значення — посилання',
        'Мутація властивостей параметра видна ззовні',
        'Перепризначення параметра не впливає на зовнішню змінну',
        'Іммутабельні оновлення ({ ...obj }) для передбачуваності'
      ],
      followUps: ['Як порівняти два об\'єкти за вмістом?', 'Чому React не бачить мутацію стану?', 'Як захистити об\'єкт від змін усередині функції?']
    },
    // ================================================================ iteration
    {
      id: 'obj-quiz-in-vs-hasown',
      group: 'iteration',
      type: 'quiz',
      level: 2,
      title: 'in vs Object.hasOwn vs !== undefined',
      tags: ['objects', 'iteration'],
      question: `
\`\`\`js
const settings = { theme: 'dark', lang: undefined };
\`\`\`

Оберіть **усі** вирази, що повертають \`true\`:
`,
      options: [
        '`\'toString\' in settings`',
        '`Object.hasOwn(settings, \'toString\')`',
        '`\'lang\' in settings`',
        '`settings.lang !== undefined`',
        '`Object.hasOwn(settings, \'lang\')`',
        '`Object.keys(settings).includes(\'toString\')`'
      ],
      answer: [0, 2, 4],
      why: [
        'Так: `in` бачить і вбудовані (успадковані) властивості, а `toString` є в кожного об\'єкта.',
        'Ні: `toString` не власна властивість `settings`, а вбудована.',
        'Так: властивість `lang` існує, хоч її значення `undefined`.',
        'Ні: значення справді `undefined`, тому цей вираз не відрізняє «є ключ» від «немає ключа».',
        'Так: `lang` — власна властивість, створена в літералі.',
        'Ні: `Object.keys` повертає лише власні перелічувані ключі — `[\'theme\', \'lang\']`.'
      ],
      hint: 'Хто з них дивиться на вбудовані методи, а хто — лише на власні властивості? І чи означає `undefined`, що властивості немає?',
      explanation: `
- \`in\` — «чи можна прочитати таку властивість» (власні + успадковані).
- \`Object.hasOwn\` — «чи є такий власний ключ». Саме це потрібно для словників і даних з API.
- \`!== undefined\` — перевірка значення, а не наявності.

\`Object.hasOwn\` (ES2022) замінює старе \`obj.hasOwnProperty(key)\` — воно ламається, якщо в даних є поле \`hasOwnProperty\`.
`
    },
    {
      id: 'obj-quiz-for-in-inherited',
      group: 'iteration',
      type: 'quiz',
      level: 2,
      title: 'for..in, for..of та Object.entries',
      tags: ['objects', 'iteration'],
      question: `
Що виведе код?

\`\`\`js
const user = { name: 'Ann', 2: 'b', 1: 'a' };

const keys = [];
for (const k in user) keys.push(k);
console.log(keys.join(','));

for (const [k, v] of Object.entries(user)) console.log(k + '=' + v);

for (const x of user) console.log(x);
\`\`\`
`,
      options: [
        '`name,2,1`, потім `name=Ann`, `2=b`, `1=a`, потім `TypeError`',
        '`1,2,name`, потім `1=a`, `2=b`, `name=Ann`, потім `TypeError`',
        '`1,2,name`, потім `1=a`, `2=b`, `name=Ann`, потім `Ann`, `b`, `a`',
        '`1,2,name`, потім `TypeError` на `Object.entries`'
      ],
      answer: 1,
      why: [
        'Порядок вставки не зберігається: цілочисельні ключі `1`, `2` йдуть першими.',
        'Так: обидва способи дають однаковий порядок (індекси за зростанням, потім рядки), а `for..of` по об\'єкту — `TypeError`.',
        'Звичайний об\'єкт не ітерований — `for..of` по ньому кидає `TypeError: user is not iterable`.',
        '`Object.entries` повертає масив пар, а масив `for..of` перебирає без проблем.'
      ],
      hint: '`for..of` працює лише з ітерованими значеннями (масиви, рядки). Чи є звичайний об\'єкт таким?',
      explanation: `
- \`for..in\` і \`Object.entries\` дають ключі в одному порядку: цілочисельні за зростанням → решта в порядку додавання.
- \`for..of\` вимагає ітерованого значення. Масив з \`Object.entries\` — ітерований, сам об'єкт — ні → \`TypeError\`.

**Різниця \`for..in\` і \`Object.keys\`:** \`for..in\` ще й іде по успадкованих перелічуваних ключах (рідко, але буває в старих бібліотеках). Тому в сучасному коді — \`for (const [k, v] of Object.entries(obj))\`.
`
    },
    {
      id: 'obj-theory-iteration',
      group: 'iteration',
      type: 'theory',
      level: 2,
      title: 'Як перебрати властивості об\'єкта',
      tags: ['objects', 'iteration'],
      question: 'Якими способами можна перебрати властивості об\'єкта? Чим відрізняються for..in, Object.keys і Object.entries? Як правильно перевірити, що властивість існує?',
      choices: [
        '`Object.keys` повертає й успадковані перелічувані ключі — так само, як `for..in`',
        '`Object.entries(obj)` дає масив власних пар `[key, value]`, який зручно перебирати `for..of`',
        '`key in obj` перевіряє лише власні властивості, тож `\'toString\' in {}` дає `false`',
        '`for..of` перебирає звичайний об\'єкт парами `[key, value]`, як `Object.entries`'
      ],
      correct: 1,
      why: [
        'Ні: `Object.keys` — лише власні перелічувані ключі; успадковані дає тільки `for..in`.',
        'Так: це стандартний спосіб — `for (const [k, v] of Object.entries(obj))`.',
        'Ні: `in` враховує і вбудовані властивості, тому `\'toString\' in {}` → `true`.',
        'Ні: звичайний об\'єкт не ітерований, `for..of` по ньому кидає `TypeError`.'
      ],
      hint: 'Дві осі: власні/успадковані та «масив чи цикл».',
      answer: `
| Спосіб | Успадковані | Що повертає |
|---|---|---|
| \`for..in\` | **так** | ключі в циклі |
| \`Object.keys(obj)\` | ні | масив ключів |
| \`Object.values(obj)\` | ні | масив значень |
| \`Object.entries(obj)\` | ні | масив пар \`[key, value]\` |
| \`Object.getOwnPropertyNames(obj)\` | ні | ключі, **включно з неперелічуваними** |

Порядок однаковий: цілочисельні ключі за зростанням → решта в порядку додавання.

\`\`\`js
for (const [key, value] of Object.entries(obj)) { /* ... */ }
\`\`\`

**Перевірка існування:**
- \`key in obj\` — враховує вбудовані (\`'toString' in {}\` → \`true\`);
- \`Object.hasOwn(obj, key)\` — лише власні, правильний вибір для даних;
- \`obj.key !== undefined\` — хибить для властивостей зі значенням \`undefined\`.

**Нюанс:** \`JSON.stringify\` серіалізує лише власні перелічувані ключі.
`,
      keyPoints: [
        'for..in включає успадковані перелічувані властивості',
        'Object.keys/values/entries — лише власні перелічувані',
        'Звичайний об\'єкт не ітерований через for..of',
        'in vs Object.hasOwn vs !== undefined'
      ],
      followUps: ['Чому for..in не рекомендують для масивів?', 'Чому Object.hasOwn кращий за hasOwnProperty?']
    },
    // ================================================================ transform
    {
      id: 'obj-pick-omit',
      group: 'transform',
      type: 'code',
      level: 1,
      title: 'pick та omit: відібрати поля',
      tags: ['objects', 'utils'],
      description: `
**Завдання.** Напишіть дві утиліти (як у lodash): \`pick\` залишає в копії об'єкта лише потрібні поля, \`omit\` — прибирає зайві.

**Де трапляється:** перед відправкою користувача на клієнт прибрати \`password\`; з великого об'єкта форми відібрати лише поля, які приймає API. Часте розминкове завдання на співбесіді.

**Що написати**
- \`pick(obj, keys)\` → **новий** об'єкт лише з тими ключами з масиву \`keys\`, які є у \`obj\` як власні. Відсутні ключі в результат **не додаються** (навіть як \`undefined\`).
- \`omit(obj, keys)\` → **новий** об'єкт з усіма власними ключами \`obj\`, **крім** перелічених у \`keys\`.

**Приклад**
\`\`\`js
const user = { id: 1, name: 'Ann', password: 'secret' };
pick(user, ['id', 'name']); // { id: 1, name: 'Ann' }
pick(user, ['id', 'age']);  // { id: 1 } — без age
omit(user, ['password']);   // { id: 1, name: 'Ann' }
\`\`\`

**Як це працює:** \`pick\` іде по списку \`keys\` і копіює лише існуючі ключі — перевірка через \`Object.hasOwn\`, а не через значення. \`omit\` іде по \`Object.keys(obj)\` і пропускає ключі зі списку. В обох випадках пишемо в новий \`{}\`, тож вхід не змінюється.

**Врахуйте:**
- ключі зі значенням \`undefined\`, \`null\`, \`0\` — існують і мають копіюватися;
- вбудовані/успадковані властивості (\`toString\` тощо) у результат не потрапляють;
- вхідний об'єкт не мутувати (жодного \`delete\`).
`,
      starter: `function pick(obj, keys) {
  // 1. Створіть порожній результат.
  // 2. Пройдіться по keys: якщо ключ є ВЛАСНОЮ властивістю obj — скопіюйте.
  //    TODO: перевірка через Object.hasOwn, а не obj[key] !== undefined
  // 3. Поверніть результат.
}

function omit(obj, keys) {
  // 1. Створіть порожній результат.
  // 2. Пройдіться по Object.keys(obj): копіюйте ключ, якщо його НЕМАЄ в keys.
  // 3. Поверніть результат.
}

// Спробуйте в консолі:
// pick({ id: 1, name: 'Ann', password: 'x' }, ['id', 'name']);
// omit({ id: 1, name: 'Ann', password: 'x' }, ['password']);
`,
      solution: `function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    // лише власні ключі; відсутні не додаємо
    if (Object.hasOwn(obj, key)) result[key] = obj[key];
  }
  return result;
}

function omit(obj, keys) {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (!keys.includes(key)) result[key] = obj[key];
  }
  return result;
}
`,
      hints: [
        'Для `pick` ітеруйте по `keys`, для `omit` — по `Object.keys(obj)`.',
        'Наявність перевіряйте через `Object.hasOwn(obj, key)` — так ключ зі значенням `undefined` теж скопіюється, а `toString` — ні.',
        'У `omit`: `if (!keys.includes(key)) result[key] = obj[key];`'
      ],
      tests: [
        { name: 'pick повертає лише вказані ключі', code: 'const u = { id: 1, name: "Ann", password: "x" };\nexpect(pick(u, ["id", "name"])).toEqual({ id: 1, name: "Ann" });' },
        { name: 'pick не додає відсутні ключі', code: 'const r = pick({ a: 1 }, ["a", "z"]);\nexpect(Object.keys(r)).toEqual(["a"]);\nexpect("z" in r).toBe(false);' },
        { name: 'pick зберігає ключі зі значенням undefined/null/0', code: 'const r = pick({ a: undefined, b: null, c: 0 }, ["a", "b", "c"]);\nexpect(Object.keys(r)).toEqual(["a", "b", "c"]);' },
        { name: 'pick не копіює вбудовані властивості', code: 'const r = pick({ a: 1 }, ["a", "toString"]);\nexpect(Object.keys(r)).toEqual(["a"]);' },
        { name: 'omit прибирає вказані ключі', code: 'expect(omit({ id: 1, name: "Ann", password: "x" }, ["password"])).toEqual({ id: 1, name: "Ann" });' },
        { name: 'omit з порожнім списком — нова копія', code: 'const src = { a: 1, b: 2 };\nconst r = omit(src, []);\nexpect(r).toEqual({ a: 1, b: 2 });\nexpect(r).not.toBe(src);' },
        { name: 'вхідний об\'єкт не мутується', code: 'const src = { a: 1, b: 2, c: 3 };\npick(src, ["a"]);\nomit(src, ["a", "b"]);\nexpect(src).toEqual({ a: 1, b: 2, c: 3 });' },
        { name: 'успадковані ключі не потрапляють у результат', code: 'const obj = Object.create({ inherited: 1 });\nobj.own = 2;\nexpect(pick(obj, ["own", "inherited"])).toEqual({ own: 2 });\nexpect(omit(obj, [])).toEqual({ own: 2 });' }
      ],
      explanation: `
Обидві функції — один цикл із записом у новий об'єкт. \`pick\` — O(k), \`omit\` — O(n·k) через \`includes\` (для великих списків у темі ES6+ буде структура з перевіркою за O(1)).

**Альтернатива:** \`Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)))\`.

**Типові помилки:** \`if (obj[key])\` — губить \`0\`, \`''\`, \`false\`; \`!== undefined\` — губить ключі зі значенням \`undefined\`; \`delete\` на вхідному об'єкті — мутація.

**Що спитають далі:** як підтримати вкладені шляхи (\`pick(obj, ['a.b'])\`)? як це типізується в TypeScript (\`Pick<T, K>\`, \`Omit<T, K>\`)?
`
    },
    {
      id: 'obj-invert',
      group: 'transform',
      type: 'code',
      level: 1,
      title: 'invert: зворотний словник статусів',
      tags: ['objects', 'entries'],
      description: `
**Завдання.** Напишіть \`invert(obj)\`, що міняє місцями ключі та значення.

**Де трапляється:** у коді є словник \`{ active: 1, banned: 2 }\`, а API повертає число \`2\` — потрібно швидко знайти назву статусу. Замість пошуку циклом щоразу будують зворотний словник один раз.

**Що написати**
- \`invert(obj)\` → новий об'єкт, де кожне значення \`obj\` стало ключем, а ключ — значенням.

**Приклад**
\`\`\`js
const STATUS = { active: 1, banned: 2 };
const STATUS_NAME = invert(STATUS); // { '1': 'active', '2': 'banned' }
STATUS_NAME[2];                      // 'banned'

invert({ a: 'x', b: 'x', c: 'y' });  // { x: 'b', y: 'c' }
\`\`\`

**Як це працює:** \`Object.entries\` дає пари \`[key, value]\`; для кожної записуємо \`result[value] = key\`. Значення-ключ автоматично приводиться до рядка, тож \`STATUS_NAME[2]\` і \`STATUS_NAME['2']\` — одне й те саме.

**Врахуйте:**
- якщо кілька ключів мають однакове значення — перемагає **останній**;
- лише власні властивості (не успадковані);
- порожній об'єкт → \`{}\`.
`,
      starter: `function invert(obj) {
  // 1. Створіть порожній результат.
  // 2. Пройдіться по Object.entries(obj) — пари [key, value].
  // 3. TODO: запишіть result[value] = key
  // 4. Поверніть результат.
}

// Спробуйте в консолі: invert({ active: 1, banned: 2 })
`,
      solution: `function invert(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[value] = key; // value автоматично приводиться до рядка
  }
  return result;
}
`,
      hints: [
        '`Object.entries(obj)` дає масив пар `[key, value]`; деструктуруйте їх у `for..of`.',
        'Достатньо `result[value] = key` для кожної пари — пізніші записи перезапишуть ранні.'
      ],
      tests: [
        { name: 'міняє ключі та значення', code: 'expect(invert({ active: 1, banned: 2 })).toEqual({ 1: "active", 2: "banned" });' },
        { name: 'при колізії перемагає останній ключ', code: 'expect(invert({ a: "x", b: "x", c: "y" })).toEqual({ x: "b", y: "c" });' },
        { name: 'порожній об\'єкт', code: 'expect(invert({})).toEqual({});' },
        { name: 'ігнорує успадковані властивості', code: 'const o = Object.create({ hidden: "h" });\no.k = "v";\nexpect(invert(o)).toEqual({ v: "k" });' },
        { name: 'подвійна інверсія відновлює об\'єкт з рядковими значеннями', code: 'const o = { a: "x", b: "y" };\nexpect(invert(invert(o))).toEqual(o);' }
      ],
      explanation: `
Один прохід — O(n). Альтернатива: \`Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]))\`.

**Нюанси:** значення приводяться до рядка — \`1\` і \`'1'\` злипнуться, а об'єкт-значення дасть ключ \`'[object Object]'\`. Числові ключі результату будуть відсортовані.

**Що спитають далі:** як зробити \`invertBy\`, що збирає всі ключі з однаковим значенням у масив (\`{ x: ['a', 'b'] }\`)?
`
    },
    {
      id: 'obj-map-filter',
      group: 'transform',
      type: 'code',
      level: 2,
      title: 'mapValues та filterObject',
      tags: ['objects', 'entries', 'callbacks'],
      description: `
**Завдання.** Напишіть аналоги \`map\`/\`filter\`, але для об'єктів: трансформувати значення та відфільтрувати пари.

**Де трапляється:** перерахувати прайс \`{ apple: 40, pear: 55 }\` у іншу валюту; прибрати з об'єкта фільтрів порожні поля перед формуванням query-рядка (\`{ q: 'js', city: '', page: 1 }\` → \`{ q: 'js', page: 1 }\`).

**Що написати**
- \`mapValues(obj, fn)\` → новий об'єкт з тими самими ключами; значення = \`fn(value, key, obj)\`.
- \`filterObject(obj, predicate)\` → новий об'єкт лише з тими парами, для яких \`predicate(value, key, obj)\` повернув truthy.

**Приклад**
\`\`\`js
mapValues({ apple: 40, pear: 55 }, (uah) => uah / 40); // { apple: 1, pear: 1.375 }
filterObject({ q: 'js', city: '', page: 1 }, (v) => v !== '');
// { q: 'js', page: 1 }
filterObject({ _id: 1, name: 'A' }, (v, key) => !key.startsWith('_'));
// { name: 'A' }
\`\`\`

**Як це працює:** колбек — звичайна функція, яку ваша утиліта викликає для кожної пари з \`Object.entries(obj)\`. Результат колбека або записується як нове значення (\`mapValues\`), або вирішує, чи копіювати пару (\`filterObject\`).

**Врахуйте:**
- колбек отримує **три** аргументи: \`value, key, obj\`;
- обробляються власні перелічувані ключі;
- вхідний об'єкт не мутувати, завжди повертати новий.
`,
      starter: `function mapValues(obj, fn) {
  // 1. Порожній результат.
  // 2. for (const [key, value] of Object.entries(obj)) { ... }
  //    TODO: result[key] = fn(value, key, obj)
  // 3. Поверніть результат.
}

function filterObject(obj, predicate) {
  // 1. Порожній результат.
  // 2. Для кожної пари: якщо predicate(value, key, obj) truthy — скопіюйте.
  // 3. Поверніть результат.
}

// Спробуйте в консолі:
// mapValues({ a: 1, b: 2 }, (v) => v * 10);
// filterObject({ q: 'js', city: '' }, (v) => v !== '');
`,
      solution: `function mapValues(obj, fn) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = fn(value, key, obj);
  }
  return result;
}

function filterObject(obj, predicate) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (predicate(value, key, obj)) result[key] = value;
  }
  return result;
}
`,
      hints: [
        'Обидві функції — цикл `for (const [key, value] of Object.entries(obj))` із записом у новий `{}`.',
        'У `mapValues` записуйте `fn(value, key, obj)`, у `filterObject` — копіюйте `value` лише якщо `predicate(...)` truthy.',
        'Не забудьте передати в колбек усі три аргументи — тест перевіряє `(value, key, obj)`.'
      ],
      tests: [
        { name: 'mapValues трансформує значення', code: 'expect(mapValues({ a: 1, b: 2 }, (v) => v * 10)).toEqual({ a: 10, b: 20 });' },
        { name: 'mapValues передає (value, key, obj)', code: 'const src = { x: 1 };\nconst fn = mockFn((v, k) => k + v);\nexpect(mapValues(src, fn)).toEqual({ x: "x1" });\nexpect(fn).toHaveBeenCalledWith(1, "x", src);' },
        { name: 'filterObject прибирає порожні поля', code: 'expect(filterObject({ q: "js", city: "", page: 1 }, (v) => v !== "")).toEqual({ q: "js", page: 1 });' },
        { name: 'filterObject може фільтрувати за ключем', code: 'expect(filterObject({ _private: 1, pub: 2 }, (v, k) => !k.startsWith("_"))).toEqual({ pub: 2 });' },
        { name: 'не мутує вхідний об\'єкт і повертає новий', code: 'const src = { a: 1, b: 2 };\nconst m = mapValues(src, (v) => v + 1);\nconst f = filterObject(src, () => true);\nexpect(src).toEqual({ a: 1, b: 2 });\nexpect(m).not.toBe(src);\nexpect(f).not.toBe(src);' },
        { name: 'порожній об\'єкт', code: 'expect(mapValues({}, (v) => v)).toEqual({});\nexpect(filterObject({}, () => true)).toEqual({});' }
      ],
      explanation: `
Цикл по \`Object.entries\` + запис у новий об'єкт — O(n). Це базовий патерн для будь-якої трансформації об'єкта.

**Альтернатива** (коли пройдете методи масивів): \`Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k, obj)]))\`.

**Типові помилки:** мутація вхідного об'єкта; колбек без \`key\`; фільтр \`if (value)\` замість виклику \`predicate\`.

**Що спитають далі:** як зробити \`mapKeys\` (перейменувати ключі, наприклад \`snake_case\` → \`camelCase\` для відповіді API)?
`
    },
    {
      id: 'obj-diff',
      group: 'transform',
      type: 'code',
      level: 2,
      title: 'diff: що змінилося у формі',
      tags: ['objects', 'compare'],
      description: `
**Завдання.** Порівняйте початкові та поточні значення плоскої форми і поверніть, що додано, видалено та змінено.

**Де трапляється:** форма редагування профілю — на сервер відправляємо PATCH лише зі зміненими полями; кнопка «Зберегти» активна, лише якщо щось змінилося; лог змін в адмінці.

**Що написати**
- \`diff(a, b)\` → об'єкт \`{ added, removed, changed }\`:
  - \`added\` — ключі, яких не було в \`a\`, зі значеннями з \`b\`;
  - \`removed\` — ключі, яких немає в \`b\`, зі значеннями з \`a\`;
  - \`changed\` — \`{ [key]: { from: a[key], to: b[key] } }\` для ключів, що є в обох, але значення різні.

**Приклад**
\`\`\`js
const initial = { name: 'Ann', age: 30, city: 'Kyiv' };
const current = { name: 'Ann', age: 31, phone: '+380' };
diff(initial, current);
// {
//   added:   { phone: '+380' },
//   removed: { city: 'Kyiv' },
//   changed: { age: { from: 30, to: 31 } }
// }
\`\`\`

**Як це працює:** два проходи. По ключах \`a\`: якщо ключа немає в \`b\` — removed, якщо є, але значення різні — changed. По ключах \`b\`: якщо ключа немає в \`a\` — added. Наявність — через \`Object.hasOwn\`, рівність — через \`Object.is\`.

**Врахуйте:**
- ключ зі значенням \`undefined\` **існує** (тому не \`b[key] === undefined\`);
- \`NaN\` дорівнює \`NaN\` — порівнюйте через \`Object.is\`;
- вкладені об'єкти порівнюються за посиланням (форма плоска).
`,
      starter: `function diff(a, b) {
  const added = {};
  const removed = {};
  const changed = {};

  // 1. Пройдіться по Object.keys(a):
  //    - ключа немає в b (Object.hasOwn) → removed
  //    - значення різні (Object.is) → changed: { from, to }
  // 2. Пройдіться по Object.keys(b):
  //    - ключа немає в a → added
  // TODO

  return { added, removed, changed };
}

// Спробуйте в консолі:
// diff({ name: 'Ann', age: 30 }, { name: 'Ann', age: 31, phone: '+380' });
`,
      solution: `function diff(a, b) {
  const added = {};
  const removed = {};
  const changed = {};

  for (const key of Object.keys(a)) {
    if (!Object.hasOwn(b, key)) {
      removed[key] = a[key];
    } else if (!Object.is(a[key], b[key])) {
      changed[key] = { from: a[key], to: b[key] };
    }
  }
  for (const key of Object.keys(b)) {
    if (!Object.hasOwn(a, key)) added[key] = b[key];
  }
  return { added, removed, changed };
}
`,
      hints: [
        'Пройдіться по ключах `a` (шукаєте removed і changed), а потім по ключах `b` (шукаєте added).',
        'Існування перевіряйте через `Object.hasOwn`, бо значення може бути `undefined`.',
        '`Object.is(NaN, NaN) === true`, на відміну від `===`.'
      ],
      tests: [
        { name: 'базовий приклад', code: 'expect(diff({ a: 1, b: 2, c: 3 }, { a: 1, b: 20, d: 4 })).toEqual({ added: { d: 4 }, removed: { c: 3 }, changed: { b: { from: 2, to: 20 } } });' },
        { name: 'однакові об\'єкти — порожній diff', code: 'expect(diff({ a: 1, b: "x" }, { b: "x", a: 1 })).toEqual({ added: {}, removed: {}, changed: {} });' },
        { name: 'NaN не вважається зміною', code: 'expect(diff({ n: NaN }, { n: NaN }).changed).toEqual({});' },
        { name: 'ключ зі значенням undefined — існує', code: 'const r = diff({ a: 1 }, { a: 1, u: undefined });\nexpect("u" in r.added).toBe(true);\nconst r2 = diff({ u: undefined }, {});\nexpect("u" in r2.removed).toBe(true);' },
        { name: 'зміна з undefined на значення — changed', code: 'expect(diff({ x: undefined }, { x: 0 }).changed).toEqual({ x: { from: undefined, to: 0 } });' },
        { name: 'об\'єкти порівнюються за посиланням', code: 'const shared = { q: 1 };\nconst r = diff({ s: shared, t: { q: 1 } }, { s: shared, t: { q: 1 } });\nexpect(Object.keys(r.changed)).toEqual(["t"]);' }
      ],
      explanation: `
Два проходи по ключах — O(n + m).

**Чому не \`b[key] === undefined\`:** ключ зі значенням \`undefined\` вважався б відсутнім. **Чому \`Object.is\`:** \`NaN !== NaN\`, тож кожне \`NaN\`-поле потрапляло б у \`changed\` (нюанс: \`Object.is(0, -0) === false\`).

**Що спитають далі:** як зробити глибокий diff для вкладених об'єктів (рекурсія зі шляхами \`'a.b'\`)? як порівнювати масиви?
`
    },
    // ================================================================ copying
    {
      id: 'obj-quiz-spread-shallow',
      group: 'copying',
      type: 'quiz',
      level: 1,
      title: 'Spread — поверхнева копія',
      tags: ['objects', 'copy'],
      question: `
Що виведе код?

\`\`\`js
const user = { name: 'Ann', address: { city: 'Kyiv' } };
const copy = { ...user };
copy.name = 'Bob';
copy.address.city = 'Lviv';
console.log(user.name, user.address.city);
\`\`\`
`,
      options: ['`Ann Kyiv`', '`Bob Lviv`', '`Ann Lviv`', '`Bob Kyiv`'],
      answer: 2,
      why: [
        'Spread не копіює вкладені об\'єкти — `copy.address` і `user.address` один об\'єкт, тож місто змінилося.',
        '`name` — примітив першого рівня, він скопіювався окремо; зміна в копії оригінал не чіпає.',
        'Так: `name` скопійовано значенням, а `address` — посиланням на той самий об\'єкт.',
        'Навпаки: ім\'я не змінилося (окрема копія), а місто змінилося (спільний вкладений об\'єкт).'
      ],
      hint: 'Spread копіює властивості першого рівня. Що лежить у властивості `address` — сам об\'єкт чи посилання на нього?',
      explanation: `
\`{ ...user }\` — **поверхнева** копія: новий об'єкт верхнього рівня, але значення копіюються як є. Для \`address\` значення — посилання, тож вкладений об'єкт спільний.

\`Object.assign({}, user)\` поводиться так само. Правильне оновлення вкладеного поля: \`{ ...user, address: { ...user.address, city: 'Lviv' } }\`; повна копія — \`structuredClone(user)\`.
`
    },
    {
      id: 'obj-quiz-json-roundtrip',
      group: 'copying',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Пастки JSON.parse(JSON.stringify())',
      tags: ['objects', 'copy', 'json'],
      question: `
Що буде в \`copy\`?

\`\`\`js
const src = {
  date: new Date(0),
  undef: undefined,
  fn() {},
  nan: NaN,
  inf: Infinity,
  arr: [undefined, () => 1],
};
const copy = JSON.parse(JSON.stringify(src));
\`\`\`
`,
      options: [
        '`{ date: "1970-01-01T00:00:00.000Z", nan: null, inf: null, arr: [null, null] }`',
        '`{ date: Date(0), undef: undefined, nan: NaN, inf: Infinity, arr: [undefined, null] }`',
        '`{ date: "1970-01-01T00:00:00.000Z", undef: null, fn: null, nan: null, inf: null, arr: [] }`',
        '`{ date: {}, nan: NaN, inf: Infinity, arr: [null, null] }`'
      ],
      answer: 0,
      why: [
        'Так: `Date` стає ISO-рядком, `undefined` і функції у властивостях зникають, `NaN`/`Infinity` → `null`, у масиві — `null`.',
        'JSON не має типів `Date`, `undefined`, `NaN` — після round-trip вони не відновлюються.',
        'Властивості з `undefined` і функціями пропускаються, а не стають `null`; масив елементів не втрачає.',
        '`Date` має `toJSON()` і серіалізується в рядок, а `NaN`/`Infinity` стають `null`.'
      ],
      hint: 'JSON не знає про `undefined`, функції, `NaN` та `Date`. У властивостях об\'єкта і в елементах масиву вони обробляються по-різному.',
      explanation: `
Правила \`JSON.stringify\`:
- \`Date\` → ISO-рядок (через \`toJSON()\`); після \`parse\` це **рядок**.
- Властивості з \`undefined\` або функцією **пропускаються**.
- \`NaN\`, \`Infinity\` → \`null\`.
- У **масиві** \`undefined\` і функції стають \`null\` — щоб не зсувати індекси.

Ще: циклічні посилання → \`TypeError\`. Тому JSON round-trip годиться лише для «чистих» JSON-даних.
`
    },
    {
      id: 'obj-quiz-structured-clone',
      group: 'copying',
      type: 'quiz',
      level: 3,
      title: 'Обмеження structuredClone',
      tags: ['objects', 'copy', 'structuredClone'],
      question: 'Оберіть **усі** значення, на яких `structuredClone(value)` кине помилку (`DataCloneError`):',
      options: [
        '`{ onClick: () => {} }`',
        '`{ createdAt: new Date() }`',
        '`{ tags: [\'a\', { b: 1 }] }`',
        '`{ save() { return 1; } }`',
        '`(() => { const o = {}; o.self = o; return o; })()`',
        '`{ empty: undefined, n: NaN }`'
      ],
      answer: [0, 3],
      why: [
        'Так: функції не можна клонувати — `DataCloneError`.',
        'Ні: `Date` клонується і залишається `Date` (на відміну від JSON).',
        'Ні: вкладені масиви й об\'єкти копіюються глибоко без проблем.',
        'Так: метод — це теж функція у властивості, тож клонування падає.',
        'Ні: циклічні посилання підтримуються — копія теж посилається сама на себе.',
        'Ні: `undefined` і `NaN` зберігаються як є (JSON би їх зіпсував).'
      ],
      hint: 'structuredClone копіює **дані**. Що в цьому списку — не дані, а поведінка?',
      explanation: `
\`structuredClone\` — найкращий вбудований спосіб глибоко скопіювати **дані**: об'єкти, масиви, \`Date\`, \`undefined\`, \`NaN\`, цикли.

Помилку дають **функції** (зокрема методи) і DOM-вузли. Геттери викликаються і стають звичайними значеннями. Якщо в стані є функції — їх треба прибрати перед клонуванням або писати власний \`cloneDeep\`.
`
    },
    {
      id: 'obj-theory-copy',
      group: 'copying',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Поверхнева vs глибока копія',
      tags: ['objects', 'copy'],
      question: 'Чим відрізняється поверхнева копія від глибокої? Які способи копіювання об\'єктів ви знаєте і які в них обмеження? Оберіть **усі** правильні твердження.',
      choices: [
        '`{ ...obj }` копіює всі рівні, тож вкладені об\'єкти копії стають незалежними',
        '`JSON.parse(JSON.stringify(obj))` губить `undefined` і функції, а `Date` стає рядком',
        '`structuredClone` копіює цикли й `Date`, але на функціях кидає помилку',
        'Глибока копія всього стану на кожну зміну — дешевий і рекомендований спосіб у React',
        '`Object.assign({}, obj)` робить глибоку копію, на відміну від spread'
      ],
      correct: [1, 2],
      why: [
        'Ні: spread — поверхнева копія, вкладені об\'єкти залишаються спільними.',
        'Так: JSON не має `undefined`, функцій і `Date`, тож вони губляться або стають рядками.',
        'Так: structured clone тримає цикли й `Date`, але функції клонувати не вміє.',
        'Ні: це дорого і ламає мемоізацію; копіюють лише гілку, що змінюється.',
        'Ні: `Object.assign` теж поверхневий — поводиться як spread.'
      ],
      hint: 'Spread/Object.assign, JSON, structuredClone, власна рекурсія.',
      answer: `
**Поверхнева (shallow)** — новий об'єкт верхнього рівня, вкладені **спільні**. **Глибока (deep)** — рекурсивно копіюються всі рівні.

| Спосіб | Тип | Обмеження |
|---|---|---|
| \`{ ...obj }\` / \`Object.assign({}, obj)\` | shallow | геттери стають значеннями |
| \`JSON.parse(JSON.stringify(obj))\` | deep | губить \`undefined\`, функції; \`Date\` → рядок; \`NaN\` → \`null\`; цикли → помилка |
| \`structuredClone(obj)\` | deep | функції → помилка; геттери стають значеннями |
| власна рекурсія / \`_.cloneDeep\` | deep | повний контроль, але треба обробити \`Date\`, цикли |

\`\`\`js
const state = { user: { name: 'Ann' }, tags: ['a'] };
({ ...state }).user === state.user;       // true
structuredClone(state).user === state.user; // false
\`\`\`

**Коли що:** для іммутабельних оновлень (React/Redux) — поверхневі копії **лише на шляху зміни**: \`{ ...s, user: { ...s.user, name } }\`. Незмінені гілки зберігають посилання — це дешево і дозволяє мемоізацію. Глибока копія — для незалежного знімка (чернетка форми, undo).
`,
      keyPoints: [
        'Shallow: вкладені об\'єкти спільні; deep: повна незалежність',
        'Spread / Object.assign — shallow',
        'JSON round-trip: втрата undefined/функцій/Date, помилка на циклах',
        'structuredClone: цикли та Date ок, функції — помилка',
        'Іммутабельні оновлення — shallow-копії лише на шляху зміни'
      ],
      followUps: ['Як написати свій cloneDeep?', 'Чим Object.assign відрізняється від spread?', 'Навіщо зберігати посилання на незмінені гілки стану?']
    },
    {
      id: 'obj-clone-deep',
      group: 'copying',
      type: 'code',
      level: 3,
      interview: true,
      title: 'cloneDeep: глибока копія даних',
      tags: ['objects', 'copy', 'recursion'],
      description: `
**Завдання.** Напишіть \`cloneDeep(value)\` — глибоку копію об'єктів, масивів і дат.

**Де трапляється:** класика співбесід («напишіть свій deep clone»). На практиці — чернетка форми: користувач редагує копію, а оригінал лишається для кнопки «Скасувати».

**Що написати**
- \`cloneDeep(value)\` → незалежна копія:
  - примітиви (\`number\`, \`string\`, \`null\`, \`undefined\`…) — повертаються як є;
  - \`Date\` → новий \`Date\` з тим самим часом;
  - масив → новий масив зі скопійованими елементами;
  - звичайний об'єкт → новий об'єкт зі скопійованими власними ключами;
  - функції — повертаються як є (за посиланням).

**Приклад**
\`\`\`js
const draft = cloneDeep({ name: 'Ann', tags: ['js'], born: new Date(0) });
draft.tags.push('css');
// оригінальний tags не змінився
draft.born instanceof Date; // true
\`\`\`

**Як це працює:** рекурсія. Для кожного значення визначаємо тип: примітив повертаємо, \`Date\` створюємо заново, для масиву/об'єкта створюємо порожній контейнер і для кожного елемента/ключа викликаємо \`cloneDeep\` ще раз. Рекурсія зупиняється на примітивах.

**Врахуйте:**
- \`typeof null === 'object'\` — перевірте \`null\` першим;
- \`typeof [] === 'object'\` — масив перевіряйте через \`Array.isArray\`;
- \`undefined\`, \`NaN\` мають зберегтися (на відміну від JSON-копії);
- вхідні дані не мутувати.
`,
      starter: `function cloneDeep(value) {
  // 1. Примітиви, null і функції повертаємо як є.
  //    TODO: if (value === null || typeof value !== 'object') return value;

  // 2. Date → new Date(value.getTime())

  // 3. Масив → новий масив, кожен елемент через cloneDeep

  // 4. Звичайний об'єкт → новий об'єкт, кожне значення через cloneDeep
  //    for (const [key, item] of Object.entries(value)) { ... }

  return value; // TODO: прибрати — зараз повертається той самий об'єкт
}

// Спробуйте в консолі:
// const src = { a: { b: [1, 2] } };
// const copy = cloneDeep(src);
// copy.a.b.push(3); src.a.b; // [1, 2]
`,
      solution: `function cloneDeep(value) {
  // примітиви, null, функції
  if (value === null || typeof value !== 'object') return value;

  if (value instanceof Date) return new Date(value.getTime());

  if (Array.isArray(value)) {
    const copy = [];
    for (const item of value) copy.push(cloneDeep(item));
    return copy;
  }

  const copy = {};
  for (const [key, item] of Object.entries(value)) {
    copy[key] = cloneDeep(item);
  }
  return copy;
}
`,
      hints: [
        'Почніть з базового випадку рекурсії: `if (value === null || typeof value !== \'object\') return value;`.',
        'Далі три гілки: `value instanceof Date`, `Array.isArray(value)`, інакше — звичайний об\'єкт.',
        'Для масиву й об\'єкта створіть порожній контейнер і заповніть його `cloneDeep(item)` для кожного елемента/значення.'
      ],
      tests: [
        { name: 'вкладені об\'єкти незалежні', code: 'const src = { a: { b: { c: 1 } } };\nconst copy = cloneDeep(src);\nexpect(copy).toEqual(src);\ncopy.a.b.c = 2;\nexpect(src.a.b.c).toBe(1);\nexpect(copy.a).not.toBe(src.a);' },
        { name: 'масиви копіюються глибоко', code: 'const src = { list: [{ x: 1 }, [2]] };\nconst copy = cloneDeep(src);\nexpect(Array.isArray(copy.list)).toBe(true);\nexpect(copy.list[0]).not.toBe(src.list[0]);\ncopy.list[1].push(3);\nexpect(src.list[1]).toEqual([2]);' },
        { name: 'Date — новий об\'єкт Date з тим самим часом', code: 'const d = new Date(1000);\nconst copy = cloneDeep({ d });\nexpect(copy.d instanceof Date).toBe(true);\nexpect(copy.d.getTime()).toBe(1000);\nexpect(copy.d).not.toBe(d);' },
        { name: 'примітиви повертаються як є', code: 'expect(cloneDeep(5)).toBe(5);\nexpect(cloneDeep("s")).toBe("s");\nexpect(cloneDeep(null)).toBe(null);\nexpect(cloneDeep(undefined)).toBe(undefined);' },
        { name: 'undefined і NaN зберігаються', code: 'const copy = cloneDeep({ u: undefined, n: NaN });\nexpect("u" in copy).toBe(true);\nexpect(copy.n).toBeNaN();' },
        { name: 'функції копіюються за посиланням', code: 'const fn = () => 1;\nexpect(cloneDeep({ fn }).fn).toBe(fn);' },
        { name: 'верхній рівень-масив', code: 'const src = [{ a: 1 }];\nconst copy = cloneDeep(src);\nexpect(Array.isArray(copy)).toBe(true);\nexpect(copy[0]).not.toBe(src[0]);\nexpect(copy).toEqual(src);' }
      ],
      explanation: `
Рекурсивний обхід: кожне значення відвідується один раз — O(N) за загальною кількістю вузлів, пам'ять — O(глибина) на стек викликів.

**Порядок перевірок важливий:** \`null\` → примітиви → \`Date\` → масив → об'єкт. Інакше \`null\` чи масив потраплять у гілку об'єкта.

**Чого тут немає (і що спитають далі):** циклічні посилання (\`o.self = o\` → нескінченна рекурсія) — потрібен кеш «оригінал → копія» (у темі ES6+ для цього є \`WeakMap\`); збереження прототипу класів; \`RegExp\`. Для даних без функцій на практиці беріть \`structuredClone\`.
`
    },
    // ================================================================ descriptors
    {
      id: 'obj-quiz-define-defaults',
      group: 'descriptors',
      type: 'quiz',
      level: 2,
      title: 'Значення за замовчуванням у defineProperty',
      tags: ['objects', 'descriptors'],
      question: `
Що виведе код (не strict mode)?

\`\`\`js
const obj = {};
Object.defineProperty(obj, 'id', { value: 1 });
obj.id = 2;
delete obj.id;
console.log(obj.id, Object.keys(obj), JSON.stringify(obj));
\`\`\`
`,
      options: ['`2 ["id"] {"id":2}`', '`undefined [] {}`', '`1 ["id"] {"id":1}`', '`1 [] {}`'],
      answer: 3,
      why: [
        'У `defineProperty` незазначений `writable` — `false`, тому запис `obj.id = 2` ігнорується.',
        '`configurable: false` за замовчуванням — `delete` нічого не видаляє, значення лишається 1.',
        'Значення справді 1, але `enumerable: false` ховає ключ від `Object.keys` і `JSON.stringify`.',
        'Так: усі прапорці `false` — не пишеться, не видаляється і не перелічується.'
      ],
      hint: 'Які значення мають `writable`, `enumerable` і `configurable`, якщо їх не вказати в `defineProperty`?',
      explanation: `
У \`Object.defineProperty\` незазначені прапорці — **\`false\`** (при звичайному присвоєнні — усі \`true\`):
- \`writable: false\` → запис ігнорується (strict — \`TypeError\`);
- \`configurable: false\` → \`delete\` повертає \`false\` (strict — \`TypeError\`);
- \`enumerable: false\` → немає в \`Object.keys\`, \`for..in\`, JSON, spread.

Властивість при цьому існує: \`'id' in obj\` → \`true\`.
`
    },
    {
      id: 'obj-quiz-assign-getter',
      group: 'descriptors',
      type: 'quiz',
      level: 3,
      title: 'Геттери при копіюванні',
      tags: ['objects', 'getters', 'copy'],
      question: `
Що виведе код?

\`\`\`js
let calls = 0;
const src = {
  get now() { calls++; return calls; },
};
const a = Object.assign({}, src);
const b = { ...src };
console.log(a.now, a.now, b.now, calls);
\`\`\`
`,
      options: ['`1 2 3 3`', '`1 1 2 2`', '`1 1 1 1`', '`3 4 5 5`'],
      answer: 1,
      why: [
        'Так було б, якби копіювався сам геттер; але копіюється значення, тож повторне читання `a.now` геттер не викликає.',
        'Так: кожне копіювання викликало геттер один раз (1 і 2), а в копіях лежать звичайні числа.',
        'Геттер викликається при кожному копіюванні окремо — spread отримав уже 2.',
        'Читання копій геттер не викликає — у `a` і `b` звичайні data-властивості.'
      ],
      hint: 'Чи копіюють spread та `Object.assign` сам геттер, чи значення, яке він повертає в момент копіювання?',
      explanation: `
І \`Object.assign\`, і spread **читають** властивості джерела — тобто викликають геттер — і записують у ціль **значення**.

1. \`Object.assign\` → \`calls = 1\`, \`a.now = 1\`.
2. spread → \`calls = 2\`, \`b.now = 2\`.
3. Читання \`a.now\`, \`a.now\`, \`b.now\` — звичайні числа: \`1 1 2\`, \`calls\` = 2.

Щоб скопіювати саме аксесор: \`Object.defineProperties({}, Object.getOwnPropertyDescriptors(src))\`.
`
    },
    {
      id: 'obj-theory-descriptors',
      group: 'descriptors',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Дескриптори властивостей, геттери та сеттери',
      tags: ['objects', 'descriptors', 'getters'],
      question: 'Що таке дескриптори властивостей? Які бувають прапорці, які значення за замовчуванням? Як працюють геттери та сеттери і де їх застосовують?',
      choices: [
        'У `Object.defineProperty` незазначені прапорці за замовчуванням `true`, як і при присвоєнні',
        'Дескриптор може мати водночас `value` і `get` — тоді пріоритет має геттер',
        '`enumerable: false` забороняє змінювати значення властивості, але не видаляти її',
        'У `defineProperty` незазначені прапорці — `false`, а при `obj.x = 1` усі вони `true`'
      ],
      correct: 3,
      why: [
        'Ні: саме в `defineProperty` незазначені прапорці — `false`; `true` лише при звичайному присвоєнні.',
        'Ні: змішувати `value`/`writable` з `get`/`set` не можна — `TypeError`.',
        'Ні: `enumerable` відповідає лише за видимість у `Object.keys`/JSON; запис — це `writable`.',
        'Так: це головна пастка дескрипторів.'
      ],
      hint: 'Data descriptor vs accessor descriptor; defineProperty vs звичайне присвоєння.',
      answer: `
Кожна властивість описується **дескриптором**:
- **data**: \`value\`, \`writable\`, \`enumerable\`, \`configurable\`;
- **accessor**: \`get\`, \`set\`, \`enumerable\`, \`configurable\` (змішувати з \`value\` не можна — \`TypeError\`).

| Прапорець | Значення |
|---|---|
| \`writable\` | чи можна змінити \`value\` |
| \`enumerable\` | чи видно в \`Object.keys\`, \`for..in\`, JSON, spread |
| \`configurable\` | чи можна видалити і переналаштувати |

**За замовчуванням:** присвоєння / літерал — усі \`true\`; \`Object.defineProperty\` — незазначені **\`false\`**.

\`\`\`js
function createUser(first, last) {
  return {
    get fullName() { return first + ' ' + last; },
    set fullName(v) { const parts = v.split(' '); first = parts[0]; last = parts[1]; }
  };
}
const user = createUser('Ann', 'Lee');
Object.defineProperty(user, 'id', { value: 7, enumerable: true }); // read-only
\`\`\`

**Застосування:** обчислювані поля, валідація при записі, ліниві значення, зворотна сумісність API, реактивність (Vue 2 побудована на \`defineProperty\`).

**Пастки:** геттер без сеттера — запис ігнорується (strict — \`TypeError\`); spread/\`Object.assign\` перетворюють аксесори на значення.
`,
      keyPoints: [
        'Data descriptor (value, writable) vs accessor (get, set)',
        'defineProperty: незазначені прапорці = false; присвоєння: усі true',
        'Застосування: обчислювані поля, валідація, реактивність',
        'Spread копіює значення геттера, а не сам геттер'
      ],
      followUps: ['Як зробити ліниву властивість, що обчислюється один раз?', 'Як працювала реактивність Vue 2?', 'Що буде, якщо переналаштувати властивість з configurable: false?']
    },
    {
      id: 'obj-temperature',
      group: 'descriptors',
      type: 'code',
      level: 2,
      title: 'Віджет погоди: °C і °F через геттери',
      tags: ['objects', 'getters', 'closures'],
      description: `
**Завдання.** Зробіть фабрику для віджета погоди: температура зберігається один раз, а читати й записувати її можна і в °C, і в °F.

**Де трапляється:** перемикач одиниць у віджеті погоди, налаштування термостата; загалом — будь-яке обчислюване поле з валідацією при записі (сума кошика, повне ім'я).

**Що написати**
- \`createTemperature(celsius = 0)\` → об'єкт з двома **аксесорними** властивостями:
  - \`celsius\` — читання/запис у °C;
  - \`fahrenheit\` — читання повертає \`celsius * 9 / 5 + 32\`; запис перераховує в °C і оновлює стан.

**Приклад**
\`\`\`js
const t = createTemperature(100);
t.fahrenheit;      // 212
t.fahrenheit = 32;
t.celsius;         // 0
t.celsius = 'hot'; // TypeError
t.celsius = -300;  // RangeError
Object.keys(t);    // ['celsius', 'fahrenheit']
\`\`\`

**Як це працює:** \`get celsius() {}\` і \`set celsius(v) {}\` у літералі створюють властивість, яка при читанні/записі викликає функцію. Саме значення зберігаємо в локальній змінній фабрики — завдяки замиканню геттери її бачать, а ззовні вона недоступна і не з'являється в \`Object.keys\`.

**Врахуйте:**
- нечислове значення або \`NaN\` → \`TypeError\`, стан не змінюється;
- нижче \`-273.15\` °C → \`RangeError\` (і для запису через \`fahrenheit\` теж);
- некоректне початкове значення теж кидає помилку;
- різні об'єкти з фабрики незалежні.
`,
      starter: `function createTemperature(celsius = 0) {
  // 1. Приватний стан — локальна змінна (замикання).
  let value;

  // 2. Функція-валідатор + запис: TypeError для не-числа/NaN,
  //    RangeError для < -273.15, інакше value = next.
  function setCelsius(next) {
    // TODO
  }

  // 3. Початкове значення проходить ту саму валідацію.
  // TODO: setCelsius(celsius);

  // 4. Об'єкт з аксесорами.
  return {
    get celsius() {
      // TODO
    },
    set celsius(next) {
      // TODO
    },
    get fahrenheit() {
      // TODO: value * 9 / 5 + 32
    },
    set fahrenheit(next) {
      // TODO: перевірити тип, перерахувати (next - 32) * 5 / 9 і передати в setCelsius
    }
  };
}

// Спробуйте в консолі:
// const t = createTemperature(100); t.fahrenheit; t.fahrenheit = 32; t.celsius;
`,
      solution: `function createTemperature(celsius = 0) {
  let value; // приватний стан у замиканні

  function assertNumber(next) {
    if (typeof next !== 'number' || Number.isNaN(next)) {
      throw new TypeError('Температура має бути числом');
    }
  }

  function setCelsius(next) {
    assertNumber(next);
    if (next < -273.15) throw new RangeError('Нижче абсолютного нуля');
    value = next;
  }

  setCelsius(celsius); // початкове значення теж валідуємо

  return {
    get celsius() {
      return value;
    },
    set celsius(next) {
      setCelsius(next);
    },
    get fahrenheit() {
      return value * 9 / 5 + 32;
    },
    set fahrenheit(next) {
      assertNumber(next);
      setCelsius((next - 32) * 5 / 9); // діапазон перевіряє setCelsius
    }
  };
}
`,
      hints: [
        'Зберігайте значення в локальній змінній фабрики (`let value`), а не у властивості об\'єкта — тоді його не видно в `Object.keys`.',
        'Винесіть валідацію в одну функцію `setCelsius(next)`; обидва сеттери й початкове значення викликають її.',
        'У сеттері `fahrenheit` спершу перевірте тип, потім `setCelsius((next - 32) * 5 / 9)`.'
      ],
      tests: [
        { name: 'зберігає початкове значення (і 0 за замовчуванням)', code: 'expect(createTemperature(25).celsius).toBe(25);\nexpect(createTemperature().celsius).toBe(0);' },
        { name: 'fahrenheit обчислюється', code: 'expect(createTemperature(100).fahrenheit).toBe(212);\nexpect(createTemperature(-40).fahrenheit).toBe(-40);' },
        { name: 'запис fahrenheit оновлює celsius', code: 'const t = createTemperature(100);\nt.fahrenheit = 32;\nexpect(t.celsius).toBeCloseTo(0, 5);\nt.fahrenheit = 212;\nexpect(t.celsius).toBeCloseTo(100, 5);' },
        { name: 'нечислове значення → TypeError і без змін', code: 'const t = createTemperature(10);\nexpect(() => { t.celsius = "20"; }).toThrow(TypeError);\nexpect(() => { t.celsius = NaN; }).toThrow(TypeError);\nexpect(() => { t.fahrenheit = "x"; }).toThrow(TypeError);\nexpect(t.celsius).toBe(10);\nexpect(() => createTemperature("hot")).toThrow(TypeError);' },
        { name: 'нижче абсолютного нуля → RangeError', code: 'const t = createTemperature(0);\nexpect(() => { t.celsius = -300; }).toThrow(RangeError);\nexpect(() => { t.fahrenheit = -1000; }).toThrow(RangeError);\nexpect(t.celsius).toBe(0);' },
        { name: 'внутрішній стан прихований', code: 'const t = createTemperature(100);\nexpect(Object.keys(t)).toEqual(["celsius", "fahrenheit"]);\nexpect(JSON.parse(JSON.stringify(t))).toEqual({ celsius: 100, fahrenheit: 212 });' },
        { name: 'екземпляри незалежні', code: 'const a = createTemperature(1);\nconst b = createTemperature(2);\na.celsius = 50;\nexpect(b.celsius).toBe(2);' }
      ],
      explanation: `
Аксесори в літералі створюють властивості \`{ get, set, enumerable: true, configurable: true }\`. Значення живе в замиканні, тож його не змінити в обхід валідації. \`JSON.stringify\` викликає геттери, тому в JSON потрапляють обидва значення.

**Типові помилки:**
- зберігати стан у полі об'єкта (\`_celsius\`) — його видно в \`Object.keys\` і можна зламати ззовні;
- дублювати валідацію в обох сеттерах замість однієї функції;
- забути провалідувати початкове значення.

**Що спитають далі:** як зробити властивість лише для читання (геттер без сеттера)? що поверне \`{ ...t }\` — аксесори чи числа?
`
    },
    {
      id: 'obj-readonly',
      group: 'descriptors',
      type: 'code',
      level: 2,
      title: 'Read-only поля конфігурації',
      tags: ['objects', 'descriptors'],
      description: `
**Завдання.** Напишіть \`makeReadonly(obj, ...keys)\`, що робить указані поля об'єкта незмінними: їх не можна перезаписати чи видалити.

**Де трапляється:** глобальний конфіг застосунку (\`apiUrl\`, \`version\`) — плагіни й сторонній код можуть додавати свої поля, але не повинні випадково перезаписати базові. \`Object.freeze\` тут не підходить: він блокує **все**.

**Що написати**
- \`makeReadonly(obj, ...keys)\` → **той самий** \`obj\` (мутує його):
  - кожен ключ з \`keys\`, що є власною властивістю, стає незмінним (\`writable: false\`, \`configurable: false\`);
  - якщо \`keys\` не передано — обробити **всі** власні властивості, включно з неперелічуваними.

**Приклад**
\`\`\`js
'use strict';
const cfg = makeReadonly({ apiUrl: '/api', retries: 3 }, 'apiUrl');
cfg.apiUrl = '/v2';  // TypeError
delete cfg.apiUrl;   // TypeError
cfg.retries = 5;     // ок
cfg.theme = 'dark';  // ок — нові поля додавати можна
\`\`\`

**Як це працює:** \`Object.defineProperty\` на **існуючій** властивості змінює лише передані прапорці, решта (зокрема \`enumerable\`) зберігається. \`writable: false\` блокує запис, \`configurable: false\` — видалення і повторне налаштування.

**Врахуйте:**
- неіснуючі ключі ігноруються;
- \`enumerable\` не змінюється (поле лишається в \`Object.keys\` і JSON);
- для **геттера** не передавайте \`writable\` — інакше \`defineProperty\` перетворить його на звичайне поле зі значенням \`undefined\`; лише \`configurable: false\`;
- усі власні ключі, включно з неперелічуваними, дає \`Object.getOwnPropertyNames(obj)\`.
`,
      starter: `function makeReadonly(obj, ...keys) {
  // 1. Які ключі обробляти: keys або всі власні (Object.getOwnPropertyNames).
  // 2. Для кожного ключа:
  //    - descriptor = Object.getOwnPropertyDescriptor(obj, key); немає — пропустити
  //    - data-властивість ('value' in descriptor) → { writable: false, configurable: false }
  //    - геттер/сеттер → лише { configurable: false }
  // TODO
  return obj;
}

// Спробуйте в консолі:
// const cfg = makeReadonly({ apiUrl: '/api', retries: 3 }, 'apiUrl');
// cfg.apiUrl = '/v2'; cfg.apiUrl; // '/api'
`,
      solution: `function makeReadonly(obj, ...keys) {
  const targetKeys = keys.length ? keys : Object.getOwnPropertyNames(obj);

  for (const key of targetKeys) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
    if (!descriptor) continue; // неіснуючий ключ

    if ('value' in descriptor) {
      // data-властивість: заборонити і запис, і видалення
      Object.defineProperty(obj, key, { writable: false, configurable: false });
    } else {
      // аксесор: writable перетворив би його на data-властивість
      Object.defineProperty(obj, key, { configurable: false });
    }
  }
  return obj;
}
`,
      hints: [
        '`Object.defineProperty` на існуючій властивості змінює лише передані прапорці — `enumerable` залишиться як був.',
        'Потрібні `writable: false` (заборона запису) і `configurable: false` (заборона видалення).',
        'Відрізнити геттер від звичайного поля: `\'value\' in Object.getOwnPropertyDescriptor(obj, key)`.'
      ],
      tests: [
        { name: 'запис кидає TypeError у strict mode', code: '"use strict";\nconst o = makeReadonly({ a: 1, b: 2 }, "a");\nexpect(() => { o.a = 5; }).toThrow(TypeError);\nexpect(o.a).toBe(1);\no.b = 3;\nexpect(o.b).toBe(3);' },
        { name: 'видалення кидає TypeError у strict mode', code: '"use strict";\nconst o = makeReadonly({ a: 1 }, "a");\nexpect(() => { delete o.a; }).toThrow(TypeError);\nexpect(o.a).toBe(1);' },
        { name: 'перелічуваність зберігається', code: 'const o = makeReadonly({ a: 1, b: 2 }, "a");\nexpect(Object.keys(o)).toEqual(["a", "b"]);\nexpect(JSON.stringify(o)).toBe(\'{"a":1,"b":2}\');' },
        { name: 'без keys — усі власні властивості, включно з неперелічуваними', code: 'const src = { a: 1 };\nObject.defineProperty(src, "hidden", { value: 2, writable: true, configurable: true });\nconst o = makeReadonly(src);\nfor (const k of ["a", "hidden"]) {\n  const d = Object.getOwnPropertyDescriptor(o, k);\n  expect(d.writable).toBe(false);\n  expect(d.configurable).toBe(false);\n}' },
        { name: 'повертає той самий об\'єкт, нові властивості додаються', code: 'const src = { a: 1 };\nconst o = makeReadonly(src, "a");\nexpect(o).toBe(src);\no.extra = 1;\nexpect(o.extra).toBe(1);' },
        { name: 'неіснуючі ключі ігноруються', code: 'const o = makeReadonly({ a: 1 }, "zzz");\nexpect("zzz" in o).toBe(false);' },
        { name: 'геттери не ламаються', code: 'const o = makeReadonly({ get x() { return 42; } });\nexpect(o.x).toBe(42);\nexpect(Object.getOwnPropertyDescriptor(o, "x").configurable).toBe(false);' }
      ],
      explanation: `
\`defineProperty\` на існуючій властивості оновлює лише передані поля дескриптора. \`configurable: false\` незворотний — назад зробити поле змінним уже не вийде. Складність O(n).

**Чому не \`Object.freeze\`:** він блокує всі поля і додавання нових; тут потрібна точкова заборона.

**Типові помилки:** \`{ writable: false }\` для геттера (геттер зникає); плутанина зі **створенням** нової властивості через \`defineProperty\`, де незазначені прапорці (і \`enumerable\`) стають \`false\`.

**Що спитають далі:** чим це відрізняється від \`seal\`/\`freeze\`? як зробити те саме для вкладених об'єктів?
`
    },
    // ================================================================ freeze
    {
      id: 'obj-quiz-freeze-shallow',
      group: 'freeze',
      type: 'quiz',
      level: 2,
      title: 'Object.freeze — поверхневе заморожування',
      tags: ['objects', 'freeze'],
      question: `
Що станеться під час виконання (код у strict mode, наприклад у модулі)?

\`\`\`js
'use strict';
const config = Object.freeze({ api: { url: '/v1' }, retries: 3 });

config.api.url = '/v2';
console.log(config.api.url);

config.retries = 5;
console.log(config.retries);
\`\`\`
`,
      options: [
        'Виведе `/v1`, потім `3`',
        'Виведе `/v2`, потім `3`',
        'Виведе `/v2`, потім кине `TypeError`',
        'Кине `TypeError` уже на першому присвоєнні'
      ],
      answer: 2,
      why: [
        '`freeze` поверхневий: вкладений `config.api` не заморожений, тож url змінюється.',
        'Тихе ігнорування буває лише в sloppy mode; у strict запис у заморожене поле — `TypeError`.',
        'Так: вкладений об\'єкт змінюється, а запис у `config.retries` у strict mode кидає `TypeError`.',
        'Перше присвоєння змінює вкладений незаморожений об\'єкт — помилки там немає.'
      ],
      hint: 'Чи заморожує `Object.freeze` вкладені об\'єкти? І як поводиться запис у read-only властивість у strict mode?',
      explanation: `
\`Object.freeze\` робить незмінними лише власні властивості самого \`config\`. Значення \`config.api\` — посилання на звичайний об'єкт, його вміст не захищено.

\`config.retries = 5\` у **strict mode** (ES-модулі, \`'use strict'\`) — \`TypeError: Cannot assign to read only property\`. У sloppy mode запис тихо зник би.

Для повного захисту потрібен рекурсивний \`deepFreeze\`.
`
    },
    {
      id: 'obj-theory-freeze-seal',
      group: 'freeze',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'freeze vs seal vs preventExtensions',
      tags: ['objects', 'freeze'],
      question: 'Чим відрізняються Object.freeze, Object.seal і Object.preventExtensions? Чи робить const об\'єкт незмінним? Оберіть **усі** правильні твердження.',
      choices: [
        '`Object.freeze` глибокий: вкладені об\'єкти теж стають незмінними',
        '`preventExtensions` забороняє і додавати, і видаляти властивості',
        '`seal` забороняє додавати й видаляти властивості, але значення змінювати можна',
        'Після `Object.freeze(arr)` виклик `arr.push(1)` у sloppy mode тихо нічого не зробить',
        '`const` забороняє лише перепризначення змінної, а не мутацію об\'єкта'
      ],
      correct: [2, 4],
      why: [
        'Ні: усі три методи поверхневі — вкладені об\'єкти лишаються змінними.',
        'Ні: `preventExtensions` забороняє лише додавання; видаляти можна.',
        'Так: `seal` = без нових і без видалення, але `writable` не чіпає.',
        'Ні: `push` на замороженому масиві кидає `TypeError` навіть у sloppy mode (методи масивів працюють як strict).',
        'Так: `const user = {}; user.name = \'A\'` — працює, заборонено лише `user = ...`.'
      ],
      hint: 'Додати / видалити / змінити — що з цього забороняє кожен метод?',
      answer: `
Усі три методи — **поверхневі** й **незворотні**:

| Метод | Додати | Видалити | Змінити значення | Перевірка |
|---|---|---|---|---|
| \`preventExtensions\` | ні | так | так | \`Object.isExtensible\` |
| \`seal\` | ні | ні | так | \`Object.isSealed\` |
| \`freeze\` | ні | ні | ні | \`Object.isFrozen\` |

\`\`\`js
const o = Object.freeze({ a: 1, nested: { b: 1 } });
o.a = 2;          // ігнорується (strict: TypeError)
o.nested.b = 2;   // працює — freeze поверхневий
\`\`\`

**\`const\` ≠ незмінність:** \`const\` забороняє лише перепризначення змінної.

**Нюанси:**
- sloppy mode — тихе ігнорування, strict — \`TypeError\`;
- \`push\`/\`pop\`/\`sort\` на замороженому масиві кидають \`TypeError\` завжди;
- сеттери в замороженому об'єкті продовжують працювати (можуть змінювати зовнішній стан);
- заморожування не пришвидшує код — це захист від випадкових мутацій.

**Коли застосовувати:** константи й конфіги, enum-подібні об'єкти, захист стану в dev-режимі (Redux Toolkit/Immer заморожують стан).
`,
      keyPoints: [
        'preventExtensions — без нових; seal — ще й без видалення; freeze — ще й без зміни значень',
        'Усі три поверхневі та незворотні',
        'const забороняє перепризначення змінної, а не мутацію об\'єкта',
        'Sloppy — тихе ігнорування, strict — TypeError'
      ],
      followUps: ['Як зробити глибоке заморожування?', 'Навіщо Immer/Redux Toolkit заморожують стан?']
    },
    {
      id: 'obj-deep-freeze',
      group: 'freeze',
      type: 'code',
      level: 3,
      title: 'deepFreeze: захист стану від мутацій',
      tags: ['objects', 'freeze', 'recursion'],
      description: `
**Завдання.** Напишіть \`deepFreeze(value)\`, що рекурсивно заморожує об'єкт і всі вкладені об'єкти/масиви.

**Де трапляється:** заморозити початковий стан або дефолтний конфіг у dev-режимі, щоб випадкова мутація одразу кидала помилку (так роблять Redux Toolkit та Immer). Часте завдання на співбесіді після питання «чи глибокий \`Object.freeze\`?».

**Що написати**
- \`deepFreeze(value)\` → **той самий** \`value\`, заморожений на всіх рівнях; примітиви повертаються як є.

**Приклад**
\`\`\`js
const initialState = deepFreeze({ cart: { items: [{ id: 1 }] } });
Object.isFrozen(initialState.cart.items[0]); // true
initialState.cart.items.push({ id: 2 });     // TypeError
\`\`\`

**Як це працює:** рекурсія. Для об'єкта беремо всі власні ключі (\`Object.getOwnPropertyNames\` — включно з неперелічуваними), заморожуємо кожне значення і в кінці — сам об'єкт. Значення читаємо з дескриптора (\`Object.getOwnPropertyDescriptor(obj, key).value\`), щоб **не викликати геттери**.

**Врахуйте:**
- циклічні посилання (\`child.parent = root\`) — зберігайте вже відвідані об'єкти в масиві \`seen\` і не заходьте в них вдруге;
- вкладені об'єкти треба заморозити, **навіть якщо батько вже заморожений** (\`freeze\` поверхневий — не виходьте рано за \`Object.isFrozen\`);
- геттери не викликати;
- \`null\` і примітиви — повертати як є.
`,
      starter: `function deepFreeze(value, seen = []) {
  // 1. Примітиви та null повертаємо як є.
  // 2. Якщо value вже є в seen — повертаємо (захист від циклів); інакше додаємо.
  // 3. Для кожного ключа з Object.getOwnPropertyNames(value):
  //    - descriptor = Object.getOwnPropertyDescriptor(value, key)
  //    - якщо 'value' in descriptor → deepFreeze(descriptor.value, seen)
  // TODO
  return Object.freeze(value); // 4. Заморозити сам об'єкт (зараз — лише поверхнево)
}

// Спробуйте в консолі:
// const s = deepFreeze({ a: { b: 1 } }); Object.isFrozen(s.a);
`,
      solution: `function deepFreeze(value, seen = []) {
  const isObject = value !== null && (typeof value === 'object' || typeof value === 'function');
  if (!isObject || seen.includes(value)) return value;
  seen.push(value); // захист від циклів

  for (const key of Object.getOwnPropertyNames(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    // data-властивості обходимо; геттери не викликаємо
    if ('value' in descriptor) deepFreeze(descriptor.value, seen);
  }
  // не пропускаємо вже заморожені об'єкти: їхні діти можуть бути незамороженими
  return Object.freeze(value);
}
`,
      hints: [
        'Рекурсія: спершу заморозьте всіх дітей, потім сам об\'єкт. `Object.getOwnPropertyNames` дає всі власні ключі.',
        'Щоб не викликати геттери, беріть значення з `Object.getOwnPropertyDescriptor(obj, key).value`.',
        'Для циклів: `if (seen.includes(value)) return value; seen.push(value);` — і передавайте `seen` у рекурсивні виклики.'
      ],
      tests: [
        { name: 'заморожує вкладені об\'єкти', code: 'const o = deepFreeze({ a: { b: { c: 1 } } });\nexpect(Object.isFrozen(o)).toBe(true);\nexpect(Object.isFrozen(o.a)).toBe(true);\nexpect(Object.isFrozen(o.a.b)).toBe(true);' },
        { name: 'заморожує масиви та об\'єкти в них', code: 'const o = deepFreeze({ list: [{ x: 1 }, [2]] });\nexpect(Object.isFrozen(o.list)).toBe(true);\nexpect(Object.isFrozen(o.list[0])).toBe(true);\nexpect(Object.isFrozen(o.list[1])).toBe(true);' },
        { name: 'мутація вкладеного об\'єкта в strict mode → TypeError', code: '"use strict";\nconst o = deepFreeze({ a: { b: 1 } });\nexpect(() => { o.a.b = 2; }).toThrow(TypeError);' },
        { name: 'повертає той самий об\'єкт, примітиви як є', code: 'const src = { a: 1 };\nexpect(deepFreeze(src)).toBe(src);\nexpect(deepFreeze(5)).toBe(5);\nexpect(deepFreeze(null)).toBe(null);' },
        { name: 'циклічні посилання', code: 'const o = { child: {} };\no.child.parent = o;\ndeepFreeze(o);\nexpect(Object.isFrozen(o.child)).toBe(true);' },
        { name: 'неперелічувані властивості теж обходяться', code: 'const o = {};\nObject.defineProperty(o, "hidden", { value: { x: 1 } });\ndeepFreeze(o);\nexpect(Object.isFrozen(o.hidden)).toBe(true);' },
        { name: 'діти вже замороженого батька теж заморожуються', code: 'const inner = Object.freeze({ deep: { x: 1 } });\nconst o = deepFreeze({ inner });\nexpect(Object.isFrozen(o.inner.deep)).toBe(true);' },
        { name: 'геттери не викликаються', code: 'let calls = 0;\nconst o = { get lazy() { calls++; return {}; } };\ndeepFreeze(o);\nexpect(calls).toBe(0);\nexpect(Object.isFrozen(o)).toBe(true);' }
      ],
      explanation: `
Кожен об'єкт відвідується один раз. \`seen.includes\` — O(k) на перевірку, тож загалом O(N·k); у темі ES6+ для цього є \`WeakSet\` з перевіркою за O(1).

**Чому дескриптори:** \`value[key]\` викликав би геттер — побічні ефекти, ліниві обчислення.

**Пастка з \`Object.isFrozen\`:** «оптимізація» \`if (Object.isFrozen(obj)) return obj\` неправильна — у замороженого батька можуть бути незаморожені діти.

**Що спитають далі:** чому Immer заморожує стан лише в dev-режимі? як описати «глибокий readonly» тип у TypeScript (\`DeepReadonly<T>\`)?
`
    },
    // ================================================================ paths
    {
      id: 'obj-quiz-optional-chaining',
      group: 'paths',
      type: 'quiz',
      level: 2,
      title: 'Доступ до вкладених властивостей: де впаде?',
      tags: ['objects', 'nested'],
      question: `
Що виведе код?

\`\`\`js
const order = { customer: null, delivery: {} };

console.log(order.delivery.address);
console.log(order.customer && order.customer.name);
console.log(order.delivery.address.city);
console.log('done');
\`\`\`
`,
      options: [
        '`undefined`, `undefined`, `undefined`, `done`',
        '`undefined`, `null`, потім `TypeError`',
        '`TypeError` уже на першому рядку',
        '`undefined`, `undefined`, потім `TypeError`'
      ],
      answer: 1,
      why: [
        'Читання властивості з `undefined` (`address.city`) кидає `TypeError` — до `done` справа не дійде.',
        'Так: відсутня властивість — `undefined`; `&&` повертає перший falsy операнд (`null`); а `undefined.city` — `TypeError`.',
        '`order.delivery` — порожній об\'єкт; читання неіснуючої властивості дає `undefined`, а не помилку.',
        '`&&` повертає сам falsy операнд, тобто `null`, а не `undefined`.'
      ],
      hint: 'Читати відсутню властивість об\'єкта безпечно. А читати властивість у `undefined` чи `null`? І що саме повертає `&&`?',
      explanation: `
1. \`order.delivery.address\` — властивості немає → \`undefined\`.
2. \`null && ...\` — \`&&\` повертає перший falsy операнд, тобто \`null\`; права частина не обчислюється.
3. \`order.delivery.address.city\` — це \`undefined.city\` → \`TypeError: Cannot read properties of undefined\`, виконання зупиняється.

Тому для динамічних шляхів пишуть \`get(obj, 'a.b.c', default)\`, який перевіряє \`null\`/\`undefined\` на кожному кроці. (У темі ES6+ буде ще оператор \`?.\`.)
`
    },
    {
      id: 'obj-get-path',
      group: 'paths',
      type: 'code',
      level: 2,
      interview: true,
      title: 'get(obj, path, defaultValue)',
      tags: ['objects', 'path', 'lodash'],
      description: `
**Завдання.** Реалізуйте \`get(obj, path, defaultValue)\` як у lodash — безпечно дістати значення за шляхом.

**Де трапляється:** таблиця з колонками, заданими рядками (\`{ title: 'Місто', field: 'customer.address.city' }\`), конфіг полів форми, ключі i18n. Шлях відомий лише під час виконання. Класика співбесід.

**Що написати**
- \`get(obj, path, defaultValue)\` → значення за шляхом або \`defaultValue\`.
  - \`path\` — рядок з крапками та/або дужками (\`'a.b.c'\`, \`'a[0].b'\`, \`'a.0.b'\`) **або** масив ключів (\`['a', 0, 'b']\`).

**Приклад**
\`\`\`js
const row = { customer: { tags: [{ name: 'vip' }], age: 0 } };
get(row, 'customer.tags[0].name');      // 'vip'
get(row, ['customer', 'age'], 18);      // 0
get(row, 'customer.address.city', '—'); // '—'
\`\`\`

**Як це працює:** спершу шлях нормалізуємо в масив ключів: \`'a[0].b'\` → \`'a.0.b'\` → \`['a', '0', 'b']\`. Потім ідемо по ключах: \`current = current[key]\`. Якщо на якомусь кроці \`current\` — \`null\` або \`undefined\`, далі йти не можна — повертаємо \`defaultValue\`.

**Врахуйте:**
- \`defaultValue\` повертається, лише якщо результат \`undefined\` або шлях обірвався на \`null\`/\`undefined\`;
- \`0\`, \`''\`, \`false\`, \`null\` **в кінці шляху** повертаються як є;
- властивості примітивів працюють: \`get({ s: 'abc' }, 's.length')\` → \`3\`.
`,
      starter: `function toPath(path) {
  // 1. Масив — повернути як є.
  // 2. Рядок: замінити [0] на .0 і розбити по крапці.
  //    Підказка: String(path).replace(/\\[(\\w+)\\]/g, '.$1').split('.')
  // TODO
}

function get(obj, path, defaultValue) {
  // 3. Пройдіться по ключах toPath(path):
  //    - якщо current == null → return defaultValue
  //    - current = current[key]
  // 4. В кінці: undefined → defaultValue, інакше current.
  // TODO
}

// Спробуйте в консолі:
// get({ a: [{ b: 'x' }] }, 'a[0].b');       // 'x'
// get({ a: {} }, 'a.b.c', 'default');       // 'default'
`,
      solution: `function toPath(path) {
  if (Array.isArray(path)) return path;
  // 'a[0].b' → 'a.0.b' → ['a', '0', 'b']
  return String(path).replace(/\\[(\\w+)\\]/g, '.$1').split('.').filter(Boolean);
}

function get(obj, path, defaultValue) {
  let current = obj;
  for (const key of toPath(path)) {
    if (current == null) return defaultValue; // null або undefined на шляху
    current = current[key];
  }
  return current === undefined ? defaultValue : current;
}
`,
      hints: [
        'Спершу перетворіть шлях на масив ключів: дужки `[0]` можна замінити на `.0` і розбити рядок по крапці.',
        'Ідіть по ключах, на кожному кроці перевіряючи `current == null` (покриває і `null`, і `undefined`).',
        'Не перевіряйте `typeof current === \'object\'` — у рядків теж є властивості (`length`). В кінці повертайте `defaultValue` лише для `undefined`.'
      ],
      tests: [
        { name: 'шлях через крапки', code: 'expect(get({ a: { b: { c: 42 } } }, "a.b.c")).toBe(42);' },
        { name: 'квадратні дужки та числові сегменти', code: 'const o = { a: [{ b: "x" }, { b: "y" }] };\nexpect(get(o, "a[0].b")).toBe("x");\nexpect(get(o, "a.1.b")).toBe("y");' },
        { name: 'шлях-масив', code: 'expect(get({ a: [{ b: 7 }] }, ["a", 0, "b"])).toBe(7);' },
        { name: 'відсутній шлях → defaultValue або undefined', code: 'const o = { a: {} };\nexpect(get(o, "a.b.c", "def")).toBe("def");\nexpect(get(o, "a.b.c")).toBeUndefined();' },
        { name: 'null на шляху → defaultValue, без помилки', code: 'expect(get({ a: null }, "a.b", "def")).toBe("def");\nexpect(get(undefined, "a", "x")).toBe("x");' },
        { name: 'falsy значення повертаються як є', code: 'const o = { a: { z: 0, e: "", f: false, n: null } };\nexpect(get(o, "a.z", 1)).toBe(0);\nexpect(get(o, "a.e", 1)).toBe("");\nexpect(get(o, "a.f", 1)).toBe(false);\nexpect(get(o, "a.n", 1)).toBe(null);' },
        { name: 'властивості примітивів', code: 'expect(get({ s: "abc" }, "s.length")).toBe(3);' }
      ],
      explanation: `
Нормалізуємо шлях і проходимо по ньому, зупиняючись на nullish — O(k) за довжиною шляху.

**Чому \`current == null\`:** нестроге порівняння з \`null\` — ідіоматична перевірка «\`null\` або \`undefined\`». \`typeof current !== 'object'\` зламало б доступ до властивостей рядків.

**Типові помилки:** \`||\` замість перевірки на \`undefined\` (губляться \`0\`, \`''\`); падіння на \`null\`; не підтримані дужки.

**Що спитають далі:** як реалізувати \`set\` з автостворенням? як підтримати ключі з крапками (\`'a["b.c"]'\`)?
`
    },
    {
      id: 'obj-count-keys-deep',
      group: 'paths',
      type: 'code',
      level: 2,
      title: 'Скільки помилок у формі: обхід вкладених даних',
      tags: ['objects', 'recursion'],
      description: `
**Завдання.** Напишіть \`countErrors(errors)\`, що рахує всі повідомлення про помилки у вкладеному об'єкті помилок форми.

**Де трапляється:** бібліотеки форм (Formik, React Hook Form) повертають помилки тієї ж форми, що й дані. Над кнопкою «Зберегти» треба показати «3 помилки».

**Що написати**
- \`countErrors(errors)\` → число: кількість **рядків-повідомлень** на будь-якій глибині.

**Приклад**
\`\`\`js
countErrors({
  name: 'Обов\\'язкове поле',
  address: { city: 'Обов\\'язкове поле', zip: 'Невірний індекс' },
  phones: [null, { number: 'Невірний номер' }]
}); // 4
countErrors({}); // 0
\`\`\`

**Як це працює:** рекурсія. Рядок — це одна помилка (\`1\`). Об'єкт або масив — сума \`countErrors\` для кожного значення (\`Object.values\` працює і для масивів). Решта (\`null\`, \`undefined\`, \`false\`) — \`0\`.

**Врахуйте:**
- \`typeof null === 'object'\` — перевіряйте \`null\` окремо;
- порожні рядки \`''\` — це не помилка (\`0\`);
- масиви можуть містити \`null\` на місці полів без помилок.
`,
      starter: `function countErrors(errors) {
  // 1. Рядок: непорожній → 1, порожній → 0.
  // 2. null / undefined / інші примітиви → 0.
  // 3. Об'єкт або масив: TODO — сума countErrors(value) для кожного значення.
}

// Спробуйте в консолі: countErrors({ name: 'Required', address: { city: 'Required' } }) // 2
`,
      solution: `function countErrors(errors) {
  if (typeof errors === 'string') return errors ? 1 : 0;
  if (errors === null || typeof errors !== 'object') return 0;

  let count = 0;
  // Object.values працює і для об'єктів, і для масивів
  for (const value of Object.values(errors)) {
    count += countErrors(value);
  }
  return count;
}
`,
      hints: [
        'Базові випадки: рядок → 1 (якщо непорожній), не-об\'єкт або `null` → 0.',
        'Для об\'єкта/масиву пройдіться `for (const v of Object.values(errors))` і додавайте `countErrors(v)`.'
      ],
      tests: [
        { name: 'плоский об\'єкт', code: 'expect(countErrors({ name: "Required", email: "Invalid" })).toBe(2);' },
        { name: 'вкладені об\'єкти та масиви', code: 'expect(countErrors({ name: "R", address: { city: "R", zip: "I" }, phones: [null, { number: "I" }] })).toBe(4);' },
        { name: 'порожні значення не рахуються', code: 'expect(countErrors({})).toBe(0);\nexpect(countErrors({ a: "", b: null, c: undefined, d: [] })).toBe(0);' },
        { name: 'масив рядків', code: 'expect(countErrors({ tags: ["Too short", "", "Too long"] })).toBe(2);' },
        { name: 'глибока вкладеність', code: 'let o = { msg: "x" };\nfor (let i = 0; i < 50; i++) o = { child: o };\nexpect(countErrors(o)).toBe(1);' }
      ],
      explanation: `
Рекурсивний обхід дерева: кожне значення відвідується один раз → O(n). Пам'ять — O(глибина) на стек викликів.

**Типові помилки:** забути про \`typeof null === 'object'\` → \`Object.values(null)\` кидає \`TypeError\`; рахувати порожні рядки.

**Що спитають далі:** як зібрати не кількість, а список шляхів з помилками (\`['address.city', 'phones.1.number']\`)? Що буде з циклічними посиланнями і як від них захиститися?
`
    },
    {
      id: 'obj-set-path',
      group: 'paths',
      type: 'code',
      level: 3,
      title: 'set(obj, path, value) з автостворенням',
      tags: ['objects', 'path', 'lodash'],
      description: `
**Завдання.** Реалізуйте \`set(obj, path, value)\` — записати значення за шляхом, **створюючи** відсутні проміжні об'єкти й масиви.

**Де трапляється:** обробник зміни поля форми з \`name="address.city"\` або \`name="phones[0].number"\` пише значення в об'єкт стану; так працюють Formik, React Hook Form (\`setValue('a.b', v)\`). Класика співбесід у парі з \`get\`.

**Що написати**
- \`set(obj, path, value)\` → **той самий** \`obj\` (мутує його).
  - \`path\` — рядок (\`'a.b'\`, \`'a[0].b'\`) або масив ключів.

**Приклад**
\`\`\`js
set({}, 'address.city', 'Kyiv');      // { address: { city: 'Kyiv' } }
set({}, 'phones[0].number', '123');   // { phones: [{ number: '123' }] }
set({ a: 1 }, 'a.b', 2);              // { a: { b: 2 } } — примітив замінено
\`\`\`

**Як це працює:** розбираємо шлях у масив ключів (як у \`get\`). Ідемо до **передостаннього** ключа: якщо поточне значення не об'єкт — створюємо контейнер. Тип контейнера визначає **наступний** ключ: ціле число (\`'0'\`) → масив, інакше → об'єкт. В останній ключ записуємо \`value\`.

**Врахуйте:**
- існуючі об'єкти на шляху не перезаписувати — зберігати їхні дані;
- примітив або \`null\` на шляху замінюється новим контейнером;
- \`set({}, 'a.1', 'v')\` → \`a\` — масив довжиною 2.
`,
      starter: `function toPath(path) {
  if (Array.isArray(path)) return path;
  return String(path).replace(/\\[(\\w+)\\]/g, '.$1').split('.').filter(Boolean);
}

function set(obj, path, value) {
  const keys = toPath(path);
  let current = obj;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    // 1. Останній ключ: current[key] = value
    // 2. Інакше: якщо current[key] — не об'єкт (або null), створіть контейнер:
    //    наступний ключ keys[i + 1] — ціле число? → [] : {}
    //    Підказка: /^\\d+$/.test(String(keys[i + 1]))
    // 3. current = current[key]
    // TODO
  }
  return obj;
}

// Спробуйте в консолі: set({}, 'phones[0].number', '123')
`,
      solution: `function toPath(path) {
  if (Array.isArray(path)) return path;
  return String(path).replace(/\\[(\\w+)\\]/g, '.$1').split('.').filter(Boolean);
}

function set(obj, path, value) {
  const keys = toPath(path);
  let current = obj;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (i === keys.length - 1) {
      current[key] = value;
      break;
    }
    const next = current[key];
    if (next === null || typeof next !== 'object') {
      // тип контейнера визначає НАСТУПНИЙ ключ
      current[key] = /^\\d+$/.test(String(keys[i + 1])) ? [] : {};
    }
    current = current[key];
  }
  return obj;
}
`,
      hints: [
        'Ідіть циклом по ключах; на останньому — запис, на решті — «прокладання» шляху.',
        'Тип нового контейнера залежить від **наступного** ключа: `/^\\d+$/.test(String(keys[i + 1])) ? [] : {}`.',
        'Створюйте контейнер лише тоді, коли `current[key]` — `null` або не об\'єкт; інакше існуючі дані зітруться.'
      ],
      tests: [
        { name: 'створює вкладені об\'єкти', code: 'expect(set({}, "a.b.c", 1)).toEqual({ a: { b: { c: 1 } } });' },
        { name: 'числовий наступний ключ → масив', code: 'const r = set({}, "list[0].name", "x");\nexpect(Array.isArray(r.list)).toBe(true);\nexpect(r).toEqual({ list: [{ name: "x" }] });\nconst r2 = set({}, "a.1", "v");\nexpect(Array.isArray(r2.a)).toBe(true);\nexpect(r2.a).toHaveLength(2);' },
        { name: 'шлях-масив', code: 'const r = set({}, ["x", 0, "y"], true);\nexpect(Array.isArray(r.x)).toBe(true);\nexpect(r.x[0].y).toBe(true);' },
        { name: 'зберігає існуючі дані', code: 'expect(set({ a: { keep: 1 } }, "a.b", 2)).toEqual({ a: { keep: 1, b: 2 } });' },
        { name: 'мутує і повертає той самий об\'єкт', code: 'const o = {};\nexpect(set(o, "a", 1)).toBe(o);\nexpect(o.a).toBe(1);' },
        { name: 'примітив на шляху замінюється контейнером', code: 'expect(set({ a: 1 }, "a.b", 2)).toEqual({ a: { b: 2 } });\nexpect(set({ a: null }, "a.b", 2)).toEqual({ a: { b: 2 } });' }
      ],
      explanation: `
Один прохід по шляху — O(k). Головна тонкість — тип контейнера визначає **наступний** ключ (\`phones[0]\` → \`phones\` має бути масивом).

**Іммутабельна версія** (для React/Redux) копіює кожен рівень шляху: \`{ ...obj, a: { ...obj.a, b: value } }\` — так роблять Immer і \`lodash/fp/set\`.

**Безпека:** якщо шлях приходить від користувача (query-параметри, JSON), спеціальні ключі на кшталт \`constructor\` можуть зіпсувати вбудовані об'єкти — це атака prototype pollution (розберемо в темі про прототипи). У продакшн-реалізаціях такі ключі відкидають.

**Що спитають далі:** як зробити іммутабельну \`setIn\`? як реалізувати \`unset\`?
`
    },
    {
      id: 'obj-flatten',
      group: 'paths',
      type: 'code',
      level: 2,
      interview: true,
      title: 'flattenObject: { a: { b: 1 } } → { "a.b": 1 }',
      tags: ['objects', 'recursion'],
      description: `
**Завдання.** Напишіть \`flattenObject(obj, separator = '.')\`, що перетворює вкладений об'єкт на плоский з ключами-шляхами.

**Де трапляється:** вкладений файл перекладів → плоскі ключі \`'errors.required'\`; помилки валідації вкладеної форми → \`{ 'address.city': 'required' }\`; запис фільтрів у query-рядок. Популярне завдання на співбесіді.

**Що написати**
- \`flattenObject(obj, separator = '.')\` → новий плоский об'єкт.

**Приклад**
\`\`\`js
flattenObject({ errors: { email: 'bad', address: { city: 'required' } } });
// { 'errors.email': 'bad', 'errors.address.city': 'required' }

flattenObject({ d: [1, { e: 2 }], f: {} });
// { 'd.0': 1, 'd.1.e': 2, f: {} }

flattenObject({ a: { b: 1 } }, '/'); // { 'a/b': 1 }
\`\`\`

**Як це працює:** рекурсивна допоміжна функція \`walk(current, prefix)\` іде по \`Object.entries(current)\`. Для кожного ключа будує шлях \`prefix + separator + key\`. Якщо значення — непорожній об'єкт або масив, заходимо в нього рекурсивно; інакше записуємо \`result[path] = value\`.

**Врахуйте:**
- масиви розгортаються, індекси — частина шляху;
- **порожні** \`{}\` і \`[]\` лишаються значеннями (щоб не втратити поле);
- \`null\` і \`Date\` — «листки», копіюються як є;
- вхідний об'єкт не мутувати.
`,
      starter: `function isContainer(value) {
  // 1. true для масивів і звичайних об'єктів; false для null, примітивів і Date.
  // TODO
}

function flattenObject(obj, separator = '.') {
  const result = {};

  function walk(current, prefix) {
    // 2. Для кожної пари [key, value] з Object.entries(current):
    //    path = prefix ? prefix + separator + key : key
    //    - непорожній контейнер → walk(value, path)
    //    - інакше → result[path] = value
    // TODO
  }

  walk(obj, '');
  return result;
}

// Спробуйте в консолі: flattenObject({ a: { b: { c: 1 } }, d: [1, 2] })
`,
      solution: `function isContainer(value) {
  if (value === null || typeof value !== 'object') return false;
  if (value instanceof Date) return false; // Date — листок
  return true; // масив або звичайний об'єкт
}

function flattenObject(obj, separator = '.') {
  const result = {};

  function walk(current, prefix) {
    for (const [key, value] of Object.entries(current)) {
      const path = prefix ? prefix + separator + key : key;
      if (isContainer(value) && Object.keys(value).length > 0) {
        walk(value, path);
      } else {
        result[path] = value; // листок або порожній контейнер
      }
    }
  }

  walk(obj, '');
  return result;
}
`,
      hints: [
        'Рекурсивна допоміжна функція `walk(current, prefix)` накопичує результат в одному об\'єкті через замикання.',
        'Шлях = `prefix ? prefix + separator + key : key`. `Object.entries` працює і для масивів (ключі — індекси).',
        'Розгортайте лише непорожні контейнери: `isContainer(v) && Object.keys(v).length > 0`; `null` і `Date` — не контейнери.'
      ],
      tests: [
        { name: 'вкладені об\'єкти', code: 'expect(flattenObject({ a: { b: { c: 1 } }, d: 2 })).toEqual({ "a.b.c": 1, d: 2 });' },
        { name: 'масиви розгортаються за індексами', code: 'expect(flattenObject({ list: [1, { x: 2 }] })).toEqual({ "list.0": 1, "list.1.x": 2 });' },
        { name: 'порожні контейнери зберігаються', code: 'expect(flattenObject({ e: {}, arr: [], a: { b: {} } })).toEqual({ e: {}, arr: [], "a.b": {} });' },
        { name: 'null і Date — листки', code: 'const d = new Date(0);\nconst r = flattenObject({ n: null, d });\nexpect(r.n).toBeNull();\nexpect(r.d).toBe(d);\nexpect(Object.keys(r)).toEqual(["n", "d"]);' },
        { name: 'власний роздільник', code: 'expect(flattenObject({ a: { b: 1 } }, "/")).toEqual({ "a/b": 1 });' },
        { name: 'не мутує вхід; порожній об\'єкт', code: 'const src = { a: { b: 1 } };\nflattenObject(src);\nexpect(src).toEqual({ a: { b: 1 } });\nexpect(flattenObject({})).toEqual({});' }
      ],
      explanation: `
Рекурсивний обхід у глибину з накопиченням шляху — O(N) за кількістю вузлів.

**Чому окремо порожні контейнери:** без цього \`{ tags: [] }\` перетворився б на \`{}\` — поле зникло б, і \`unflatten\` його вже не відновить.

**Чому \`Date\` — листок:** \`typeof\` у нього \`'object'\`, але \`Object.entries(new Date())\` → \`[]\`, і дата «зникла» б.

**Що спитають далі:** напишіть зворотну \`unflatten\`; як обробити цикли; що робити, якщо ключ сам містить крапку?
`
    },
    {
      id: 'obj-unflatten',
      group: 'paths',
      type: 'code',
      level: 3,
      title: 'unflatten: поля форми → вкладений об\'єкт',
      tags: ['objects', 'path'],
      description: `
**Завдання.** Напишіть \`unflatten(flat)\` — зворотну операцію до \`flattenObject\`: об'єкт з ключами-шляхами (роздільник — крапка) → вкладена структура.

**Де трапляється:** HTML-форма з полями \`name="address.city"\`, \`name="phones.0"\` дає плоский об'єкт (наприклад, з \`FormData\`), а API чекає вкладений JSON.

**Що написати**
- \`unflatten(flat)\` → новий вкладений об'єкт.

**Приклад**
\`\`\`js
unflatten({ 'address.city': 'Kyiv', 'address.zip': '01001', name: 'Ann' });
// { address: { city: 'Kyiv', zip: '01001' }, name: 'Ann' }

unflatten({ 'phones.0': '111', 'phones.1.type': 'work' });
// { phones: ['111', { type: 'work' }] }
\`\`\`

**Як це працює:** для кожної пари розбиваємо ключ \`path.split('.')\` і «прокладаємо» шлях від кореня результату: відсутній проміжний контейнер створюємо (масив, якщо **наступний** сегмент — ціле число, інакше об'єкт), існуючий — використовуємо. В останній сегмент пишемо значення.

**Врахуйте:**
- результат верхнього рівня — завжди об'єкт;
- порядок ключів у вході не важливий (\`'a.1'\` може йти раніше за \`'a.0'\`);
- уже створений контейнер не перезаписувати — інші шляхи могли щось у нього записати;
- вхід не мутувати.
`,
      starter: `function unflatten(flat) {
  const result = {};

  for (const [path, value] of Object.entries(flat)) {
    const keys = path.split('.');
    let current = result;

    for (let i = 0; i < keys.length; i++) {
      // 1. Останній сегмент: current[keys[i]] = value
      // 2. Інакше: якщо current[keys[i]] === undefined — створити контейнер
      //    (наступний сегмент — ціле число? [] : {})
      // 3. current = current[keys[i]]
      // TODO
    }
  }
  return result;
}

// Спробуйте в консолі: unflatten({ 'a.b': 1, 'list.0': 'x' })
`,
      solution: `function unflatten(flat) {
  const result = {};

  for (const [path, value] of Object.entries(flat)) {
    const keys = path.split('.');
    let current = result;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (i === keys.length - 1) {
        current[key] = value;
        break;
      }
      if (current[key] === undefined) {
        current[key] = /^\\d+$/.test(keys[i + 1]) ? [] : {};
      }
      current = current[key];
    }
  }
  return result;
}
`,
      hints: [
        'Для кожної пари розбийте ключ по крапці й пройдіть сегментами від кореня результату.',
        'Відсутні проміжні контейнери створюйте за типом **наступного** сегмента: `/^\\d+$/.test(keys[i + 1])` → масив.',
        'Існуючий контейнер не перезаписуйте — створюйте лише якщо `current[key] === undefined`.'
      ],
      tests: [
        { name: 'вкладені об\'єкти', code: 'expect(unflatten({ "a.b.c": 1, d: 2 })).toEqual({ a: { b: { c: 1 } }, d: 2 });' },
        { name: 'масиви за числовими сегментами', code: 'const r = unflatten({ "list.0": "x", "list.1.name": "y" });\nexpect(Array.isArray(r.list)).toBe(true);\nexpect(r).toEqual({ list: ["x", { name: "y" }] });' },
        { name: 'порядок ключів не важливий', code: 'expect(unflatten({ "a.1": "b", "a.0": "a", "x.y": 1, "x.z": 2 })).toEqual({ a: ["a", "b"], x: { y: 1, z: 2 } });' },
        { name: 'верхній рівень — завжди об\'єкт', code: 'const r = unflatten({ "0.a": 1 });\nexpect(Array.isArray(r)).toBe(false);\nexpect(r).toEqual({ 0: { a: 1 } });' },
        { name: 'порожній вхід і значення-контейнери', code: 'expect(unflatten({})).toEqual({});\nexpect(unflatten({ "a.tags": [], "a.meta": {} })).toEqual({ a: { tags: [], meta: {} } });' },
        { name: 'не мутує вхід', code: 'const src = { "a.b": 1 };\nunflatten(src);\nexpect(src).toEqual({ "a.b": 1 });' }
      ],
      explanation: `
Кожен ключ розбирається на сегменти — O(сумарна довжина всіх шляхів).

**Тонкощі:** тип контейнера визначає наступний сегмент (як у \`set\`); вже створений контейнер не можна перезаписувати, інакше \`'a.x'\` і \`'a.y'\` затруть одне одного.

**Конфлікти:** \`{ a: 1, 'a.b': 2 }\` — суперечливі дані; на співбесіді проговоріть: кинути помилку чи «останній перемагає».

**Що спитають далі:** як підтримати формат \`user[name]=x\` (як бібліотека \`qs\`)? як екранувати крапки в ключах?
`
    },
    {
      id: 'obj-deep-merge',
      group: 'paths',
      type: 'code',
      level: 4,
      title: 'deepMerge: дефолтний конфіг + налаштування',
      tags: ['objects', 'recursion'],
      description: `
**Завдання.** Реалізуйте \`deepMerge(...objects)\` — глибоке злиття об'єктів у **новий** об'єкт, зліва направо (пізніші перемагають).

**Де трапляється:** злиття дефолтного конфігу з користувацьким (налаштування теми, опції бібліотеки, \`webpack-merge\`); spread тут не підходить — він замінить вкладений об'єкт цілком. Класика співбесід рівня Middle+.

**Що написати**
- \`deepMerge(...objects)\` → новий об'єкт. Правила для кожного ключа:
  - обидва значення — **звичайні об'єкти** → зливаються рекурсивно;
  - **масив замінює** попереднє значення (у результат іде копія масиву);
  - \`undefined\` у джерелі **не перезаписує** існуюче значення;
  - \`Date\` та інші значення — просто присвоюються (за посиланням).
- аргументи \`null\`/\`undefined\` ігноруються.

**Приклад**
\`\`\`js
const defaults = { theme: { color: 'blue', font: 14 }, plugins: ['a'] };
const user = { theme: { font: 16 }, plugins: ['b'] };
deepMerge(defaults, user);
// { theme: { color: 'blue', font: 16 }, plugins: ['b'] }
\`\`\`

**Як це працює:** починаємо з порожнього \`result\` і по черзі «накладаємо» кожне джерело. Для кожного ключа: якщо нове значення — звичайний об'єкт, викликаємо \`deepMerge(result[key] або {}, value)\` — рекурсія завжди створює **новий** об'єкт, тож вхідні дані не мутуються і посилання не діляться.

**Врахуйте:**
- «звичайний об'єкт»: \`v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)\`;
- вхідні об'єкти не мутувати; вкладені об'єкти результату не мають бути тими самими, що у вході;
- примітив ↔ об'єкт: пізніше значення просто замінює попереднє.
`,
      starter: `function isPlainObject(value) {
  // 1. true лише для звичайних об'єктів: не null, не масив, не Date.
  // TODO
}

function deepMerge(...objects) {
  const result = {};

  for (const source of objects) {
    // 2. Пропустіть не-об'єкти (null, undefined).
    // 3. Для кожного [key, value] з Object.entries(source):
    //    - undefined → пропустити
    //    - звичайний об'єкт → result[key] = deepMerge(isPlainObject(result[key]) ? result[key] : {}, value)
    //    - масив → копія масиву
    //    - інше → result[key] = value
    // TODO
  }
  return result;
}

// Спробуйте в консолі:
// deepMerge({ theme: { color: 'blue', font: 14 } }, { theme: { font: 16 } });
`,
      solution: `function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

function deepMerge(...objects) {
  const result = {};

  for (const source of objects) {
    if (!isPlainObject(source)) continue;

    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) continue;

      if (isPlainObject(value)) {
        // рекурсія завжди створює НОВИЙ об'єкт — вхідні не мутуються
        result[key] = deepMerge(isPlainObject(result[key]) ? result[key] : {}, value);
      } else if (Array.isArray(value)) {
        result[key] = value.slice(); // масив замінює попередній
      } else {
        result[key] = value; // примітиви, Date
      }
    }
  }
  return result;
}
`,
      hints: [
        'Почніть з порожнього `result` і по черзі «накладайте» на нього кожне джерело.',
        'Якщо нове значення — звичайний об\'єкт, викличте `deepMerge(isPlainObject(result[key]) ? result[key] : {}, value)`; масиви копіюйте `value.slice()`.',
        'Не забудьте пропускати `undefined`-значення і аргументи, що не є об\'єктами.'
      ],
      tests: [
        { name: 'рекурсивне злиття', code: 'expect(deepMerge({ a: 1, n: { x: 1, y: 2 } }, { b: 2, n: { y: 20, z: 30 } })).toEqual({ a: 1, b: 2, n: { x: 1, y: 20, z: 30 } });' },
        { name: 'кілька джерел — пізніші перемагають', code: 'expect(deepMerge({ a: 1 }, { a: 2, b: { c: 1 } }, { b: { c: 2 } })).toEqual({ a: 2, b: { c: 2 } });' },
        { name: 'масиви замінюються копією', code: 'const src = { list: [4] };\nconst r = deepMerge({ list: [1, 2, 3] }, src);\nexpect(r).toEqual({ list: [4] });\nexpect(r.list).not.toBe(src.list);' },
        { name: 'undefined не перезаписує', code: 'expect(deepMerge({ a: 1, b: { c: 1 } }, { a: undefined, b: { c: undefined } })).toEqual({ a: 1, b: { c: 1 } });' },
        { name: 'вхідні об\'єкти не мутуються і не діляться посиланнями', code: 'const a = { n: { x: 1 } };\nconst b = { m: { y: 1 } };\nconst r = deepMerge(a, b);\nr.n.x = 100;\nr.m.y = 100;\nexpect(a).toEqual({ n: { x: 1 } });\nexpect(b).toEqual({ m: { y: 1 } });' },
        { name: 'Date — за посиланням', code: 'const d = new Date(0);\nconst r = deepMerge({ d: { x: 1 } }, { d });\nexpect(r.d).toBe(d);' },
        { name: 'примітив ↔ об\'єкт та ігнорування null/undefined аргументів', code: 'expect(deepMerge({ a: { x: 1 } }, { a: 5 })).toEqual({ a: 5 });\nexpect(deepMerge({ a: 5 }, { a: { x: 1 } })).toEqual({ a: { x: 1 } });\nexpect(deepMerge({ a: 1 }, null, undefined)).toEqual({ a: 1 });' }
      ],
      explanation: `
«Накладаємо» джерела по черзі на новий об'єкт; рекурсія — лише коли нове значення звичайний об'єкт. O(сумарна кількість ключів усіх джерел).

**Рішення, які варто проговорити на співбесіді:**
- *масиви*: замінювати, конкатенувати чи зливати за індексами (lodash \`merge\` зливає за індексами — часто несподівано);
- *\`undefined\`*: пропускати чи вважати явним значенням;
- *мутація*: \`Object.assign\` і lodash \`merge\` мутують перший аргумент, тут — ні.

**Безпека:** злиття JSON від користувача — класичне місце для prototype pollution (CVE у lodash \`merge\`); розберемо в темі про прототипи.

**Типові помилки:** \`typeof value === 'object'\` без перевірки \`null\`/масиву; мутація першого аргументу; спільні посилання на вкладені об'єкти джерел.
`
    },
    // ================================================================ dictionary
    {
      id: 'obj-count-by',
      group: 'dictionary',
      type: 'code',
      level: 2,
      title: 'Лічильник і індекс за id: об\'єкт як словник',
      tags: ['objects', 'dictionary'],
      description: `
**Завдання.** Напишіть дві утиліти для списку замовлень: підрахунок за полем і індекс за \`id\`.

**Де трапляється:** бейджі «Нові: 3, Доставлені: 5» над таблицею; швидкий пошук сутності за \`id\` замість \`find\` у циклі (так нормалізують стан у Redux).

**Що написати**
- \`countBy(list, key)\` → об'єкт \`{ [значення поля]: кількість }\`
- \`indexById(list)\` → об'єкт \`{ [id]: елемент }\`

**Приклад**
\`\`\`js
const orders = [
  { id: 7, status: 'new' },
  { id: 9, status: 'done' },
  { id: 12, status: 'new' }
];
countBy(orders, 'status'); // { new: 2, done: 1 }
indexById(orders)[9];      // { id: 9, status: 'done' } — той самий об'єкт
\`\`\`

**Як це працює:** об'єкт — хеш-таблиця: запис і читання за ключем — O(1) в середньому. Один прохід по списку будує словник, далі кожен пошук миттєвий, а не O(n).

**Врахуйте:**
- значення може збігатися з вбудованим ключем: \`status: 'constructor'\` — \`counts[s] || 0\` тут зламається (\`{}.constructor\` — це функція). Перевіряйте \`Object.hasOwn\`;
- порожній список → \`{}\`;
- \`indexById\` зберігає посилання на елементи, не копії.
`,
      starter: `function countBy(list, key) {
  const counts = {};
  // 1. Для кожного item візьміть value = item[key].
  // 2. TODO: якщо Object.hasOwn(counts, value) — +1, інакше почніть з 1.
  return counts;
}

function indexById(list) {
  // TODO: { [item.id]: item }
}

// Спробуйте в консолі: countBy([{ s: 'a' }, { s: 'a' }, { s: 'b' }], 's') // { a: 2, b: 1 }
`,
      solution: `function countBy(list, key) {
  const counts = {};
  for (const item of list) {
    const value = item[key];
    // hasOwn, а не counts[value] || 0: інакше 'constructor' зламає підрахунок
    counts[value] = Object.hasOwn(counts, value) ? counts[value] + 1 : 1;
  }
  return counts;
}

function indexById(list) {
  const byId = {};
  for (const item of list) byId[item.id] = item;
  return byId;
}
`,
      hints: [
        'Один цикл `for..of` і запис у словник `counts[value]`.',
        'Перевірка наявності ключа — `Object.hasOwn(counts, value)`, а не `counts[value]`: інакше вбудовані ключі на кшталт `constructor` дадуть хибний результат.'
      ],
      tests: [
        { name: 'countBy рахує за полем', code: 'const o = [{ id: 7, status: "new" }, { id: 9, status: "done" }, { id: 12, status: "new" }];\nexpect(countBy(o, "status")).toEqual({ new: 2, done: 1 });' },
        { name: 'countBy: порожній список', code: 'expect(countBy([], "status")).toEqual({});' },
        { name: 'countBy: значення "constructor" і "toString"', code: 'expect(countBy([{ t: "constructor" }, { t: "constructor" }, { t: "toString" }], "t")).toEqual({ constructor: 2, toString: 1 });' },
        { name: 'indexById повертає ті самі об\'єкти', code: 'const a = { id: 1, n: "a" }, b = { id: 2, n: "b" };\nconst idx = indexById([a, b]);\nexpect(idx[2]).toBe(b);\nexpect(Object.keys(idx)).toEqual(["1", "2"]);' },
        { name: 'indexById: порожній список', code: 'expect(indexById([])).toEqual({});' }
      ],
      explanation: `
Обидві функції — O(n) один раз, потім доступ O(1). Без індексу кожен \`list.find(o => o.id === id)\` — O(n), а в циклі — O(n²).

**Типова помилка:** \`counts[v] = (counts[v] || 0) + 1\` — на \`'constructor'\` дає рядок \`"function Object() { [native code] }1"\`.

**Що спитають далі:** що буде з ключами-числами і ключами-об'єктами (приведення до рядка)? Яка структура з ES6 вирішує ці проблеми (\`Map\` — у темі ES6+)?
`
    },
    {
      id: 'obj-quiz-group-by',
      group: 'dictionary',
      type: 'quiz',
      level: 3,
      title: 'Object.groupBy і об\'єкт без вбудованих методів',
      tags: ['objects', 'groupBy'],
      question: `
Що виведе код?

\`\`\`js
const groups = Object.groupBy([1, 2, 3, 4, 5], (n) => (n % 2 ? 'odd' : 'even'));
console.log(groups.odd);
console.log(groups.hasOwnProperty('even'));
\`\`\`
`,
      options: [
        '`[1, 3, 5]`, потім `true`',
        '`[1, 3, 5]`, потім `TypeError`',
        '`undefined`, потім `false`',
        '`{ 0: 1, 1: 3, 2: 5 }`, потім `true`'
      ],
      answer: 1,
      why: [
        'Перший рядок вірний, але в об\'єкта від `Object.groupBy` немає вбудованих методів, тож `hasOwnProperty` — не функція.',
        'Правильно: групи — масиви, а результат створено «голим» словником без `hasOwnProperty`, тож виклик кидає `TypeError`.',
        'Ключі — результати колбека (`odd`/`even`), тож `groups.odd` існує.',
        'Значення групи — звичайний масив елементів, а не об\'єкт з індексами.'
      ],
      hint: 'Чи має об\'єкт від `Object.groupBy` метод `hasOwnProperty`?',
      explanation: `
\`Object.groupBy(items, fn)\` (ES2024) повертає об'єкт \`{ [fn(item)]: [items] }\`. Щоб ключі \`'toString'\`, \`'constructor'\` не конфліктували з вбудованими, цей об'єкт створено **без** успадкованих методів. Тому \`groups.hasOwnProperty\` → \`undefined\`, а виклик → \`TypeError\`.

Правильно: \`Object.hasOwn(groups, 'even')\` або \`'even' in groups\` — працюють з будь-яким об'єктом.
`
    },
    {
      id: 'obj-theory-map-vs-object',
      group: 'dictionary',
      type: 'theory',
      level: 3,
      title: 'Пастки об\'єкта в ролі словника',
      tags: ['objects', 'dictionary'],
      question: 'Ви зберігаєте в об\'єкті дані з ключами від користувача (слова, теги, id). Які проблеми можуть виникнути? Оберіть **усі** правильні твердження.',
      choices: [
        'Ключ `\'constructor\'` чи `\'toString\'` «вже є» в об\'єкті, тож `obj[key] || 0` дає хибний результат',
        'Ключі `1` і `\'1\'` — один і той самий ключ, а будь-який об\'єкт-ключ стає `\'[object Object]\'`',
        'Об\'єкт завжди зберігає ключі в порядку вставки, включно з числовими',
        'Кількість ключів можна дізнатися за O(1) через `obj.length`',
        'Перевірка `obj[key] !== undefined` надійно відрізняє «ключа немає» від «ключ є»'
      ],
      correct: [0, 1],
      why: [
        'Правильно: `{}` успадковує вбудовані властивості, тому перевіряйте наявність через `Object.hasOwn`.',
        'Правильно: ключі об\'єкта — лише рядки (і символи), все інше приводиться до рядка.',
        'Хибно: цілочисельні ключі йдуть першими за зростанням, і лише потім — решта в порядку додавання.',
        'Хибно: у об\'єкта немає `length`; `Object.keys(obj).length` — це O(n).',
        'Хибно: ключ може існувати зі значенням `undefined`, а `\'toString\'` «знайдеться» без власного ключа; надійно — `Object.hasOwn`.'
      ],
      hint: 'Подумайте про вбудовані ключі, приведення ключів до рядка, порядок і розмір.',
      answer: `
**Проблеми об'єкта як словника:**
- **колізії з вбудованими ключами:** \`'constructor' in {}\` → \`true\`; рішення — \`Object.hasOwn(obj, key)\`;
- **\`'__proto__'\`** з даних користувача — особливий ключ, джерело prototype pollution (детально — у темі про прототипи);
- **ключі — лише рядки:** \`obj[1]\` ≡ \`obj['1']\`, \`obj[{}]\` → \`'[object Object]'\`;
- **порядок:** цілочисельні ключі сортуються;
- **розмір:** \`Object.keys(obj).length\` — O(n).

\`\`\`js
const counts = {};
for (const w of ['constructor', 'a']) counts[w] = (counts[w] || 0) + 1;
counts.constructor; // "function Object() { [native code] }1"
\`\`\`

**Коли об'єкт ок:** фіксована структура (запис), JSON, конфіги, словники з рядковими ключами під вашим контролем.
**Коли потрібне інше:** довільні ключі від користувача, не-рядкові ключі, часті додавання/видалення — для цього в ES6 є \`Map\` (наступні теми).
`,
      keyPoints: [
        'Колізії з вбудованими ключами — перевіряти через Object.hasOwn',
        'Ключі приводяться до рядка: 1 ≡ \'1\', об\'єкти → \'[object Object]\'',
        'Цілочисельні ключі сортуються',
        '__proto__ з даних користувача — ризик prototype pollution',
        'Об\'єкт — для записів і JSON; для динамічних колекцій є Map (ES6)'
      ],
      followUps: ['Як безпечно порахувати частоту слів у тексті з довільними словами?', 'Що таке prototype pollution і як від неї захиститися?']
    }
  ]
});
