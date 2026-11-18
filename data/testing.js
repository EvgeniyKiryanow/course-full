FE.topic('testing', {
  intro: `
## Рівні тестів

| | Unit | Integration | E2E |
|---|---|---|---|
| Що перевіряє | функцію/клас/хук ізольовано | кілька модулів разом (компонент + стор + мок API) | увесь застосунок у браузері як користувач |
| Швидкість | мілісекунди | десятки–сотні мс | секунди |
| Вартість/крихкість | низька | середня | висока, бувають flaky |
| Інструменти | Vitest, Jest | Vitest/Jest + Testing Library + MSW | Playwright, Cypress |

- **Піраміда:** багато unit, менше integration, мало e2e. **Трофей (Kent C. Dodds):** static (TS, ESLint) → unit → **найбільше integration** → трохи e2e.
- Тестуйте **поведінку** (вхід → вихід, що бачить користувач), а не реалізацію (приватні методи, внутрішній стан).

## Структура тесту

\`\`\`js
describe('cart', () => {
  beforeEach(() => { /* свіжий стан для кожного тесту */ });
  it('applies discount for VIP', () => {
    const cart = createCart({ vip: true });   // Arrange (Given)
    cart.add({ price: 100 });                 // Act (When)
    expect(cart.total()).toBe(90);            // Assert (Then)
  });
});
\`\`\`

**TDD:** red (падаючий тест) → green (мінімальний код) → refactor.

## Тестові дублери (test doubles)

| Дублер | Суть |
|---|---|
| **Dummy** | заглушка-аргумент, не використовується |
| **Stub** | повертає заготовлені відповіді (керує **входом**) |
| **Spy** | записує виклики; часто викликає оригінал |
| **Mock** | заздалегідь запрограмовані **очікування** викликів (перевіряє **вихід/взаємодію**) |
| **Fake** | робоча спрощена реалізація (in-memory БД, фейкові таймери) |

## Jest / Vitest — швидка шпаргалка

- \`toBe\` — \`Object.is\`; \`toEqual\` — глибоке порівняння; \`toStrictEqual\` — ще й \`undefined\`-поля та класи.
- Async: \`await\` або \`return\` проміс; \`await expect(p).rejects.toThrow()\`. Забутий \`await\` → тест «зелений» хибно.
- \`vi.fn()\` / \`jest.fn()\`, \`vi.spyOn(obj, 'm')\`, \`vi.mock('./api')\` (підіймається нагору файлу), \`mockRestore()\`.
- Фейкові таймери: \`vi.useFakeTimers()\`, \`vi.advanceTimersByTime(ms)\`, для промісів — \`advanceTimersByTimeAsync\`.

## Testing Library — пріоритет запитів

1. \`getByRole('button', { name: /зберегти/i })\` 2. \`getByLabelText\` 3. \`getByPlaceholderText\` 4. \`getByText\` … останнім — \`getByTestId\`.
- \`getBy\` — кидає, якщо немає; \`queryBy\` — повертає \`null\` (для перевірки відсутності); \`findBy\` — асинхронно чекає.
- \`userEvent\` (реалістичні події) замість \`fireEvent\`.

## Flaky-тести: причини

Фіксовані \`sleep\` замість очікування умови, залежність від порядку тестів/спільного стану, реальна мережа і час, анімації, випадкові дані, гонки. Лікування: автоочікування (Playwright), ізоляція, моки мережі (MSW), фейкові таймери, детерміновані дані.

## Покриття

Line / branch / function / statement. 100% покриття **не означає** відсутність багів: воно показує, що код виконувався, а не що його перевірили. Якість тестів перевіряє **mutation testing** (Stryker).
`,
  groups: [
    { id: 'levels', title: 'Навіщо тести і які вони бувають' },
    { id: 'structure', title: 'Структура тесту і матчери' },
    { id: 'doubles', title: 'Тестові дублери: stub, spy, mock, fake' },
    { id: 'design', title: 'Тестований код: dependency injection' },
    { id: 'async', title: 'Асинхронні тести і фейкові таймери' },
    { id: 'coverage', title: 'Покриття, снапшоти і межові значення' },
    { id: 'ui-e2e', title: 'Тестування UI і e2e' }
  ],
  items: [
    // ---------------------------------------------------------------- levels
    {
      id: 'test-levels',
      group: 'levels',
      type: 'theory',
      level: 1,
      interview: true,
      title: 'Навіщо тести і чим unit відрізняється від integration та e2e',
      tags: ['basics'],
      question: 'Тест — це код, що викликає ваш код і перевіряє результат. Рівні відрізняються тим, яка частина системи справжня: одна функція (unit), кілька модулів (integration) чи весь застосунок у браузері (e2e). Оберіть **усі** правильні твердження.',
      choices: [
        'Unit-тест перевіряє одиницю ізольовано: він швидкий і дешевий, ловить помилки логіки та крайові випадки',
        'Unit-тести з повним покриттям ловлять і помилки взаємодії модулів, тож інтеграційні тести зайві',
        'E2E-тести найшвидші й найстабільніші, бо проходять реальний сценарій без жодних моків і заглушок',
        'E2E у реальному браузері ловить проблеми збірки, роутингу, CORS і cookies, але дорогий і схильний до flaky',
        'Інтеграційний тест завжди звертається до реального бекенду — інакше це вже вважається unit-тестом',
      ],
      correct: [0, 3],
      hint: 'Порівняйте за трьома осями: обсяг системи під тестом, швидкість/вартість і впевненість, яку дає тест.',
      answer: `
- **Навіщо:** захист від регресій, безпечний рефакторинг, жива документація.
- **Unit** — одна функція/модуль ізольовано; мс; ловить логіку й крайові випадки.
- **Integration** — компонент + стор + роутер, мережа замокана; найкращий баланс впевненість/вартість.
- **E2E** — браузер + бекенд (Playwright, Cypress); секунди, дорого, ризик flaky; ловить збірку, CORS, cookies.
- **Static** (TypeScript, ESLint) — найдешевший «рівень».

\`\`\`js
expect(formatPrice(1234.5)).toBe('1 234,50 ₴'); // unit
\`\`\`
`,
      why: [
        'Так: unit перевіряє одну функцію без мережі й DOM, тому виконується за мілісекунди.',
        'Ні: unit-тести не бачать, як модулі з’єднані між собою, — це ловлять інтеграційні тести.',
        'Ні: e2e найповільніші (секунди) і найчастіше flaky — через мережу, анімації, дані.',
        'Так: лише справжній браузер з бекендом виявить збірку, роутинг, CORS і cookies.',
        'Ні: в інтеграційних тестах мережу зазвичай мокають (MSW) — справжні лише модулі фронтенду.'
      ],
      keyPoints: [
        'Тести дають впевненість у змінах, захист від регресій і безпечний рефакторинг',
        'Unit — ізольована одиниця, швидко, ловить логіку і крайові випадки',
        'Integration — кілька модулів разом, найкращий баланс впевненості/вартості',
        'E2E — реальний браузер і бекенд, найдорожче і найповільніше, ризик flaky',
        'Статичний аналіз (TS/ESLint) як нульовий рівень'
      ],
      followUps: ['Як ви вирішуєте, на якому рівні писати тест для нової фічі?', 'Скільки e2e-тестів достатньо?', 'Що робити, якщо тестів у проєкті немає взагалі?']
    },
    {
      id: 'test-quiz-level',
      group: 'levels',
      type: 'quiz',
      level: 1,
      title: 'Який рівень тесту обрати?',
      tags: ['basics'],
      question: 'Потрібно перевірити, що користувач у **справжньому браузері** може залогінитись, додати товар у кошик, оплатити тестовою карткою і побачити замовлення в історії (фронтенд + реальний бекенд + БД). Який тип тесту для цього?',
      options: ['Unit-тест функції `checkout()`', 'Інтеграційний тест компонента з замоканим API', 'E2E-тест (Playwright / Cypress)', 'Snapshot-тест сторінки кошика'],
      answer: 2,
      why: [
        'Ні: unit перевіряє лише логіку однієї функції, без браузера й бекенду.',
        'Ні: з замоканим API реальний бекенд і БД не беруть участі.',
        'Так: сценарій проходить через браузер, бекенд і БД — це e2e.',
        'Ні: снапшот лише фіксує розмітку і не перевіряє жодної дії.'
      ],
      hint: 'Які частини системи мають бути справжніми, щоб тест перевірив цей сценарій?',
      explanation: `
Потрібні справжні браузер, бекенд і БД — отже e2e. Такі тести пишуть лише для кількох критичних сценаріїв (логін, оплата), а логіку кошика покривають швидшими unit/integration-тестами.
`
    },
    {
      id: 'test-pyramid-trophy',
      group: 'levels',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Піраміда vs трофей тестування. Що тестувати, а що ні',
      tags: ['basics', 'strategy'],
      question: 'Що таке піраміда тестування і трофей тестування? Що варто тестувати, а що — ні? Чому кажуть «тестуйте поведінку, а не реалізацію»?',
      choices: [
        'Трофей тестування радить мати найбільше e2e-тестів, бо саме вони найближчі до реального користувача',
        'Тести на внутрішній `state` компонента надійніші за тести UI, бо не залежать від розмітки й текстів',
        'Варто покривати тестами сторонні бібліотеки й сам фреймворк, щоб їхні оновлення не зламали застосунок',
        'Тест на реалізацію падає від рефакторингу без зміни поведінки й буває зеленим при зламаному UI',
        'Піраміда й трофей сходяться в одному: інтеграційних тестів має бути найменше, бо вони найповільніші',
      ],
      correct: 3,
      hint: 'Подумайте, що станеться з тестами, які перевіряють внутрішній стан компонента, після рефакторингу без зміни поведінки.',
      answer: `
- **Піраміда:** багато unit → менше integration → мало e2e.
- **Трофей:** static → unit → **найбільше integration** → трохи e2e (баги фронтенду — на стику компонентів, стану й API).
- **Тестувати:** бізнес-логіку, критичні сценарії, крайові випадки, кожен виправлений баг (спершу тест, що його відтворює).
- **Не тестувати:** приватні методи, внутрішній state, CSS-класи, сторонні бібліотеки, тривіальні геттери.

\`\`\`js
expect(wrapper.state('isOpen')).toBe(true);                // ❌ реалізація
await user.click(screen.getByRole('button', { name: /меню/i }));
expect(screen.getByRole('navigation')).toBeVisible();      // ✅ поведінка
\`\`\`
`,
      why: [
        'Ні: трофей радить найбільше **інтеграційних** тестів, e2e — трохи.',
        'Ні: тест на внутрішній state ламається від рефакторингу і не бачить зламаного UI.',
        'Ні: бібліотеки й фреймворк уже протестовані їхніми авторами — тестуйте свій код.',
        'Так: такий тест хибно-червоний після рефакторингу і хибно-зелений при зламаному UI.',
        'Ні: у трофеї інтеграційних тестів якраз **найбільше**.'
      ],
      keyPoints: [
        'Піраміда: багато unit, менше integration, мало e2e',
        'Трофей: static → unit → найбільше integration → трохи e2e',
        'Тестувати бізнес-логіку, критичні сценарії, крайові випадки, регресії багів',
        'Не тестувати деталі реалізації, сторонні бібліотеки, тривіальний код',
        'Тести на реалізацію дають хибно-червоні й хибно-зелені результати'
      ],
      followUps: ['Коли все ж варто тестувати приватну функцію?', 'Як переконати команду писати тести, якщо «немає часу»?', 'Як тестувати легасі-код без тестів (characterization tests)?']
    },
    {
      id: 'test-quiz-implementation',
      group: 'levels',
      type: 'quiz',
      level: 2,
      title: 'Які тести перевіряють реалізацію?',
      tags: ['basics', 'strategy'],
      question: 'Оберіть **усі** тести, які перевіряють **деталі реалізації** (і, ймовірно, зламаються при рефакторингу без зміни поведінки):',
      options: [
        'Перевірка, що внутрішня змінна стану `isOpen` компонента стала `true` після кліку',
        'Перевірка, що після кліку на кнопку «Додати» в списку з\'явився новий пункт з введеним текстом',
        'Перевірка, що приватний метод `_recalculate` був викликаний рівно 2 рази',
        'Перевірка, що `sortUsers(users)` повертає користувачів, упорядкованих за прізвищем',
        'Шпигун на `Array.prototype.sort`, щоб переконатися, що сортування зроблено саме через `sort`'
      ],
      answer: [0, 2, 4],
      why: [
        'Так: `isOpen` можуть перейменувати чи перенести в стор — поведінка та сама, а тест упаде.',
        'Ні: новий пункт у списку бачить користувач — це поведінка.',
        'Так: приватний метод можуть вбудувати чи розбити — користувач різниці не помітить.',
        'Ні: впорядкований результат — це контракт функції.',
        'Так: спосіб сортування (`sort`, `toSorted`, свій алгоритм) — деталь реалізації.'
      ],
      hint: 'Чи помітить користувач (або код, що викликає функцію) різницю, якщо цю деталь змінити?',
      explanation: `
Деталь реалізації — те, що можна змінити, не змінивши зовнішньої поведінки. Перевіряти виклик доречно лише на межі системи: «сабміт форми викликав \`api.createUser\` з правильними даними».
`
    },
    // ---------------------------------------------------------------- structure
    {
      id: 'test-aaa-tdd',
      group: 'structure',
      type: 'theory',
      level: 2,
      title: 'AAA, Given-When-Then, TDD і BDD',
      tags: ['basics', 'tdd'],
      question: `
Тест складається з трьох частин:
\`\`\`js
const cart = createCart();          // Arrange — дані
cart.add('apple', 10);              // Act — одна дія
expect(cart.total()).toBe(10);      // Assert — перевірка
\`\`\`
Що таке AAA, TDD і BDD? Оберіть **усі** правильні твердження.
`,
      choices: [
        'У TDD спочатку пишуть повну реалізацію, а потім тести, які фіксують її поточну поведінку',
        'AAA: Arrange готує дані, Act виконує одну дію, Assert перевіряє результат — одна поведінка на тест',
        'Цикл TDD — red → green → refactor: на кроці green пишуть мінімальний код, щоб тест пройшов',
        'BDD — це просто використання `describe`/`it` замість `test`, без участі бізнесу чи QA',
        'TDD однаково ефективний для прототипів і верстки, як і для чистої логіки на кшталт парсерів',
      ],
      correct: [1, 2],
      hint: 'Три фази тесту. Цикл з трьох кольорів. Мова опису поведінки.',
      answer: `
- **AAA:** Arrange → Act → Assert. **Given-When-Then** — те саме мовою поведінки.
- **Хороший тест:** одна поведінка; назва = вимога; незалежний від інших; без циклів і умов; швидкий і детермінований.
- **TDD:** red (падаючий тест) → green (мінімальний код) → refactor. Плюси: тестований дизайн, малі кроки. Мінуси: повільніше на старті; погано для прототипів і верстки.
- **BDD:** сценарії мовою бізнесу (Gherkin: \`Given / When / Then\`), автоматизуються Cucumber.
`,
      why: [
        'Ні: у TDD тест пишуть **до** коду і бачать, як він падає.',
        'Так: три фази, одна дія і одна поведінка на тест.',
        'Так: red → green → refactor, на green — мінімум коду.',
        'Ні: BDD — сценарії мовою бізнесу (Given/When/Then), які пишуть разом з аналітиками й QA.',
        'Ні: TDD найкраще працює для чистої логіки, а для прототипів і верстки — погано.'
      ],
      keyPoints: [
        'AAA: Arrange → Act → Assert; одна дія та одна поведінка на тест',
        'Given-When-Then — та сама структура мовою поведінки',
        'TDD: red → green → refactor, мінімальний код для проходження тесту',
        'Плюси/мінуси TDD: дизайн і покриття vs швидкість на старті',
        'BDD: сценарії мовою бізнесу (Gherkin, Cucumber)'
      ],
      followUps: ['Навіщо бачити, як тест падає, перш ніж писати код?', 'Чи застосовуєте ви TDD для UI?', 'Що робити, якщо в тесті потрібно багато Arrange?']
    },
    {
      id: 'test-quiz-tobe',
      group: 'structure',
      type: 'quiz',
      level: 1,
      interview: true,
      title: 'toBe vs toEqual',
      tags: ['jest'],
      question: `
\`toBe\` порівнює через \`Object.is\` (як \`===\`, але \`NaN\` дорівнює \`NaN\`, а \`0\` не дорівнює \`-0\`). \`toEqual\` порівнює вміст рекурсивно.

Оберіть **усі** перевірки, які **пройдуть**:

\`\`\`js
expect({ a: 1 }).toBe({ a: 1 });     // (1)
expect({ a: 1 }).toEqual({ a: 1 });  // (2)
expect([1, 2]).toEqual([1, 2]);      // (3)
expect(0.1 + 0.2).toBe(0.3);         // (4)
expect(NaN).toBe(NaN);               // (5)
\`\`\`
`,
      options: ['(1)', '(2)', '(3)', '(4)', '(5)'],
      answer: [1, 2, 4],
      why: [
        'Падає: два різні об’єкти — різні посилання, `Object.is` дає `false`.',
        'Проходить: `toEqual` порівнює вміст, а не посилання.',
        'Проходить: масиви з однаковими елементами глибоко рівні.',
        'Падає: `0.1 + 0.2` — це `0.30000000000000004`; для дробів — `toBeCloseTo`.',
        'Проходить: `Object.is(NaN, NaN)` — `true`, на відміну від `===`.'
      ],
      hint: '`toBe` порівнює через `Object.is`. Що це означає для об\'єктів, для `NaN` і для чисел з плаваючою комою?',
      explanation: `
Об’єкти й масиви — через \`toEqual\`, примітиви — через \`toBe\`, дроби — через \`toBeCloseTo\`.
`
    },
    {
      id: 'test-mini-expect',
      group: 'structure',
      type: 'code',
      level: 3,
      title: 'Міні-expect з toBe, toEqual, toThrow і .not',
      tags: ['jest', 'closures'],
      description: `
**Завдання.** Напишіть \`expectThat(actual)\` — міні-версію \`expect\` з Jest з матчерами \`toBe\`, \`toEqual\`, \`toThrow\` і модифікатором \`.not\`.

**Де трапляється:** співбесіди «напишіть свій expect»; розуміння, чому тест падає і звідки береться повідомлення.

**Що написати**
- \`expectThat(actual)\` → об'єкт \`{ toBe, toEqual, toThrow, not }\`; \`not\` має ті самі три матчери з інвертованою умовою.
- Матчер нічого не повертає, якщо перевірка пройшла, і кидає \`new Error(message)\`, якщо ні.

| Матчер | Проходить, якщо | message при провалі |
|---|---|---|
| \`toBe(e)\` | \`Object.is(actual, e)\` | \`expected A to be E\` / \`expected A not to be E\` |
| \`toEqual(e)\` | глибока рівність | \`expected A to equal E\` / \`expected A not to equal E\` |
| \`toThrow(msg?)\` | \`actual()\` кидає; якщо є \`msg\` — \`error.message\` містить \`msg\` | див. нижче |

- **A / E:** рядки й об'єкти — \`JSON.stringify\` (\`"a"\`, \`{"x":1}\`); \`-0\` → \`-0\`; решта — \`String(v)\`.
- **toThrow** (\`"m"\` — через \`JSON.stringify\`): не кинула → \`expected function to throw, but it did not throw\` (з \`msg\`: \`expected function to throw "msg", but it did not throw\`); інше повідомлення → \`expected function to throw "msg", but it threw "oops"\`; з \`.not\`, але кинула → \`expected function not to throw, but it threw "oops"\`.

**Приклад**
\`\`\`js
expectThat({ a: [1] }).toEqual({ a: [1] }); // нічого
expectThat(1).toBe(2);           // Error: expected 1 to be 2
expectThat('a').not.toBe('a');   // Error: expected "a" not to be "a"
expectThat(() => {}).toThrow();  // Error: expected function to throw, but it did not throw
\`\`\`

**Як це працює:** матчер — звичайна функція, що кидає помилку; раннер ловить її й фарбує тест у червоне. \`.not\` — той самий набір матчерів з прапорцем \`negated\`: провал, коли \`pass === negated\`.

**Врахуйте:** \`NaN\` дорівнює \`NaN\`; \`-0\` не дорівнює \`0\`; масив \`[1, 2]\` не дорівнює \`{ 0: 1, 1: 2 }\`; різна кількість ключів — нерівні.
`,
      starter: `function formatValue(v) {
  // 1. -0 → '-0'; рядок або об'єкт (не null) → JSON.stringify(v); інакше String(v)
}

function isDeepEqual(a, b) {
  // 2. Object.is(a, b) → true
  //    хоч один не об'єкт або null → false
  //    Array.isArray(a) !== Array.isArray(b) → false
  //    однакова кількість ключів і кожне значення рівне (рекурсія)
}

function expectThat(actual) {
  // 3. Фабрика матчерів: negated = false — звичайні, true — для .not
  function matchers(negated) {
    const not = negated ? ' not' : '';
    const check = (pass, message) => {
      // TODO: кинути new Error(message), якщо pass === negated
    };
    return {
      toBe(expected) {
        // TODO: check(Object.is(actual, expected), \`expected \${formatValue(actual)}\${not} to be ...\`)
      },
      toEqual(expected) {
        // TODO
      },
      toThrow(expected) {
        // TODO: викликати actual() у try/catch, запам'ятати threw і message
      }
    };
  }

  const api = matchers(false);
  // 4. TODO: api.not = ...
  return api;
}

// Спробуйте: expectThat(1).toBe(2); // Error: expected 1 to be 2
`,
      solution: `function formatValue(v) {
  if (Object.is(v, -0)) return '-0';
  if (typeof v === 'string') return JSON.stringify(v);
  if (v !== null && typeof v === 'object') {
    try { return JSON.stringify(v); } catch { return String(v); } // напр., циклічні посилання
  }
  return String(v);
}

function isDeepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => Object.hasOwn(b, k) && isDeepEqual(a[k], b[k]));
}

function expectThat(actual) {
  function matchers(negated) {
    const not = negated ? ' not' : '';
    // pass === negated означає провал: без .not потрібен pass=true, з .not — pass=false
    const check = (pass, message) => {
      if (pass === negated) throw new Error(message);
    };

    return {
      toBe(expected) {
        check(Object.is(actual, expected), \`expected \${formatValue(actual)}\${not} to be \${formatValue(expected)}\`);
      },
      toEqual(expected) {
        check(isDeepEqual(actual, expected), \`expected \${formatValue(actual)}\${not} to equal \${formatValue(expected)}\`);
      },
      toThrow(expected) {
        if (typeof actual !== 'function') throw new TypeError('toThrow expects a function');
        let threw = false;
        let message = '';
        try {
          actual();
        } catch (err) {
          threw = true;
          message = err instanceof Error ? err.message : String(err);
        }
        const pass = threw && (expected === undefined || message.includes(expected));
        const what = expected === undefined ? '' : ' ' + JSON.stringify(expected);
        const tail = threw ? \`, but it threw \${JSON.stringify(message)}\` : ', but it did not throw';
        check(pass, \`expected function\${not} to throw\${what}\${tail}\`);
      },
    };
  }

  const api = matchers(false);
  api.not = matchers(true);
  return api;
}
`,
      hints: [
        'Уся різниця між звичайним матчером і `.not` — слово `" not"` в повідомленні та умова провалу `pass === negated`.',
        '`isDeepEqual`: після `Object.is` і перевірки типів порівняйте `Object.keys(a).length` з `Object.keys(b).length` і рекурсивно кожне `a[k]` з `b[k]`.',
        '`toThrow`: `pass = threw && (expected === undefined || message.includes(expected))`; хвіст повідомлення — `, but it threw "..."` або `, but it did not throw`.'
      ],
      tests: [
        { name: 'успішні перевірки нічого не кидають', code: "expectThat(2).toBe(2);\nexpectThat(NaN).toBe(NaN);\nexpectThat({ a: [1, { b: 2 }] }).toEqual({ a: [1, { b: 2 }] });\nexpectThat(() => { throw new Error('boom!'); }).toThrow('boom');\nexpectThat(1).not.toBe(2);\nexpectThat(() => {}).not.toThrow();" },
        { name: 'toBe: повідомлення з форматуванням', code: "expect(() => expectThat(1).toBe(2)).toThrow('expected 1 to be 2');\nexpect(() => expectThat('a').toBe('b')).toThrow('expected \"a\" to be \"b\"');\nexpect(() => expectThat({ a: 1 }).toBe({ a: 1 })).toThrow('expected {\"a\":1} to be {\"a\":1}');\nexpect(() => expectThat(undefined).toBe(null)).toThrow('expected undefined to be null');" },
        { name: 'toBe розрізняє 0 і -0', code: "expect(() => expectThat(-0).toBe(0)).toThrow('expected -0 to be 0');" },
        { name: '.not інвертує і змінює повідомлення', code: "expect(() => expectThat('a').not.toBe('a')).toThrow('expected \"a\" not to be \"a\"');\nexpect(() => expectThat([1]).not.toEqual([1])).toThrow('expected [1] not to equal [1]');" },
        { name: 'toEqual: глибока рівність і її межі', code: "expect(() => expectThat({ a: 1 }).toEqual({ a: 2 })).toThrow('expected {\"a\":1} to equal {\"a\":2}');\nexpect(() => expectThat([1, 2]).toEqual({ 0: 1, 1: 2 })).toThrow('to equal');\nexpect(() => expectThat({ a: 1 }).toEqual({ a: 1, b: 2 })).toThrow('to equal');\nexpect(() => expectThat([[1]]).toEqual([[2]])).toThrow('expected [[1]] to equal [[2]]');\nexpectThat({ x: NaN }).toEqual({ x: NaN });" },
        { name: 'toThrow: функція не кинула', code: "expect(() => expectThat(() => 1).toThrow()).toThrow('expected function to throw, but it did not throw');\nexpect(() => expectThat(() => 1).toThrow('boom')).toThrow('expected function to throw \"boom\", but it did not throw');" },
        { name: 'toThrow: інше повідомлення', code: "expect(() => expectThat(() => { throw new Error('oops'); }).toThrow('boom')).toThrow('expected function to throw \"boom\", but it threw \"oops\"');" },
        { name: 'not.toThrow: функція кинула', code: "expect(() => expectThat(() => { throw new Error('oops'); }).not.toThrow()).toThrow('expected function not to throw, but it threw \"oops\"');\nexpectThat(() => { throw new Error('oops'); }).not.toThrow('boom');" },
        { name: 'кидає саме екземпляр Error', code: "let err;\ntry { expectThat(1).toBe(2); } catch (e) { err = e; }\nexpect(err).toBeInstanceOf(Error);\nexpect(err.message).toBe('expected 1 to be 2');" }
      ],
      explanation: `
Одна фабрика матчерів з прапорцем \`negated\` прибирає дублювання — так влаштований і \`.not\` у Jest. Складність: \`toBe\` O(1), \`toEqual\` O(n).

**Типові помилки:** \`===\` замість \`Object.is\`; порівняння через \`JSON.stringify\` (порядок ключів, \`undefined\`); масив дорівнює об'єкту.

**Далі можуть спитати:** як додати \`expect.extend\` або \`resolves\`/\`rejects\`?
`
    },
    // ---------------------------------------------------------------- doubles
    {
      id: 'test-doubles',
      group: 'doubles',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Тестові дублери: dummy, stub, spy, mock, fake',
      tags: ['mocks'],
      question: `
Дублер (test double) підміняє справжню залежність у тесті — мережу, пошту, час:
\`\`\`js
const mailer = { send: vi.fn() };             // записує виклики
const api = { getUser: () => ({ id: 1 }) };   // заготовлена відповідь
\`\`\`
Чим відрізняються dummy, stub, spy, mock і fake?
`,
      choices: [
        'Stub повертає заготовлені відповіді й керує входом коду, а mock перевіряє очікувану взаємодію',
        'Fake — порожня заглушка, що лише заповнює параметр сигнатури й ніколи не викликається під час тесту',
        'Spy завжди повністю замінює оригінальну функцію й не може делегувати виклик справжній реалізації',
        'Найнадійніше мокати всі власні модулі, щоб кожен тест перевіряв рівно одну функцію в повній ізоляції',
        'In-memory репозиторій чи фейкові таймери — приклади dummy, адже справжня залежність у тесті не працює',
      ],
      correct: 0,
      hint: 'Одні дублери керують тим, що отримує код (вхід), інші перевіряють, що код зробив (вихід/взаємодія).',
      answer: `
| Тип | Суть |
|---|---|
| **Dummy** | лише заповнює параметр, не використовується |
| **Stub** | заготовлені відповіді — керує **входом** коду |
| **Spy** | записує виклики, може викликати оригінал |
| **Mock** | spy з очікуваннями взаємодії (\`toHaveBeenCalledWith\`) |
| **Fake** | робоча спрощена реалізація (in-memory репозиторій, фейкові таймери) |

- \`vi.fn()\` — spy, який можна налаштувати як stub (\`mockReturnValue\`) і перевірити як mock.
- **Мокати:** мережу, час, random, сторонні сервіси. **Не мокати:** власну дрібну логіку.
`,
      why: [
        'Так: stub подає коду готові дані, mock перевіряє, як код викликав залежність.',
        'Ні: це dummy; fake — робоча спрощена реалізація (in-memory БД).',
        'Ні: spy може делегувати оригіналу — так працює `vi.spyOn` за замовчуванням.',
        'Ні: надмірні моки ламаються від рефакторингу й пропускають баги інтеграції; мокайте межі системи.',
        'Ні: це fakes — вони реально працюють, хоч і спрощено.'
      ],
      keyPoints: [
        'Dummy — лише заповнює параметр',
        'Stub — заготовлені відповіді (керує входом)',
        'Spy — записує виклики; Mock — перевіряє очікувану взаємодію',
        'Fake — робоча спрощена реалізація (in-memory, фейкові таймери)',
        'Мокати межі системи (мережа, час, random), а не власну логіку'
      ],
      followUps: ['Чому надмірні моки погіршують тести?', 'Як замокати модуль у Vitest і чому vi.mock підіймається нагору?', 'Що таке «Don\'t mock what you don\'t own»?']
    },
    {
      id: 'test-quiz-doubles',
      group: 'doubles',
      type: 'quiz',
      level: 2,
      title: 'Як називається цей дублер?',
      tags: ['mocks'],
      question: `
Для тестів сервісу замовлень ви написали:

\`\`\`js
function createInMemoryOrderRepo() {
  const orders = new Map();
  let nextId = 1;
  return {
    async save(order) { const id = nextId++; orders.set(id, { ...order, id }); return id; },
    async findById(id) { return orders.get(id) ?? null; },
    async findByUser(userId) { return [...orders.values()].filter(o => o.userId === userId); },
  };
}
\`\`\`

Який це тип тестового дублера?
`,
      options: ['Stub', 'Spy', 'Fake', 'Mock', 'Dummy'],
      answer: 2,
      why: [
        'Ні: stub повертав би фіксовану відповідь незалежно від попередніх `save`.',
        'Ні: spy записує виклики, а тут немає жодної історії викликів.',
        'Так: це робоча (хоч і в пам’яті) реалізація — збережене справді знаходиться.',
        'Ні: mock має очікування викликів і перевіряє їх.',
        'Ні: dummy не викликається взагалі.'
      ],
      hint: 'Чи має цей об\'єкт справжню (хоч і спрощену) робочу логіку, чи лише повертає заготовлені значення?',
      explanation: `
Fake дозволяє перевіряти **стан** (що збереглося), а не послідовність викликів, — такі тести менш крихкі. Мінус: fake треба тримати узгодженим зі справжньою реалізацією.
`
    },
    {
      id: 'test-create-spy',
      group: 'doubles',
      type: 'code',
      level: 2,
      title: 'createSpy: шпигун з історією викликів',
      tags: ['mocks', 'closures'],
      description: `
**Завдання.** Напишіть \`createSpy(impl?)\` — спрощений \`jest.fn()\`: функцію, яка викликає \`impl\` і записує історію своїх викликів.

**Де трапляється:** перевірка «обробник викликано з правильними даними» (\`onSubmit\`, аналітика); на співбесідах — «як працює jest.fn».

**Що написати**
- \`createSpy(impl?)\` → функція \`spy\`. Виклик \`spy(...args)\` викликає \`impl\` з тими самими аргументами і \`this\` і повертає її результат (без \`impl\` — \`undefined\`).
- \`spy.calls\` — масив масивів аргументів; \`spy.contexts\` — масив \`this\`.
- \`spy.results\` — \`{ type: 'return', value }\` або \`{ type: 'throw', value: error }\`; помилку \`impl\` записати **і кинути далі**.
- \`spy.callCount\` — кількість викликів (завжди актуальна).
- \`spy.calledWith(...args)\` → \`true\`, якщо був виклик рівно з такими аргументами (кожен через \`Object.is\`, довжина збігається).
- \`spy.reset()\` — очищає історію.

**Приклад**
\`\`\`js
const spy = createSpy((a, b) => a + b);
spy(1, 2);            // 3
spy.calls;            // [[1, 2]]
spy.results;          // [{ type: 'return', value: 3 }]
spy.calledWith(1, 2); // true
spy.callCount;        // 1
\`\`\`

**Як це працює:** функція в JS — об'єкт, тож історію можна зберігати в її властивостях. \`this\` є лише у звичайної \`function\`, тому \`impl\` викликаємо через \`impl.apply(this, args)\`.

**Врахуйте:** шпигун не «ковтає» помилки; \`reset\` очищає масиви на місці (тест міг зберегти посилання на \`spy.calls\`); кожен шпигун має власну історію.
`,
      starter: `function createSpy(impl) {
  // 1. Звичайна function (не стрілкова) — щоб отримати this виклику
  function spy(...args) {
    // TODO: записати args у spy.calls і this у spy.contexts
    // TODO: у try/catch викликати impl.apply(this, args) (якщо impl є),
    //       записати { type: 'return', value } і повернути value;
    //       у catch записати { type: 'throw', value: error } і кинути error далі
  }

  // 2. Історія — властивості самої функції
  spy.calls = [];
  spy.contexts = [];
  spy.results = [];

  // 3. TODO: callCount — геттер через Object.defineProperty, що повертає calls.length

  // 4. Чи був виклик рівно з такими аргументами (Object.is для кожного)
  spy.calledWith = (...expected) => {
    // TODO
  };

  // 5. Очистити масиви НА МІСЦІ: arr.length = 0
  spy.reset = () => {
    // TODO
  };

  return spy;
}

// Спробуйте: const s = createSpy((a, b) => a + b); s(1, 2); s.calls; // [[1, 2]]
`,
      solution: `function createSpy(impl) {
  // звичайна function (не стрілкова), щоб отримати this виклику
  function spy(...args) {
    spy.calls.push(args);
    spy.contexts.push(this);
    try {
      const value = impl ? impl.apply(this, args) : undefined;
      spy.results.push({ type: 'return', value });
      return value;
    } catch (error) {
      spy.results.push({ type: 'throw', value: error });
      throw error; // шпигун не повинен "ковтати" помилки
    }
  }

  spy.calls = [];
  spy.contexts = [];
  spy.results = [];

  Object.defineProperty(spy, 'callCount', { get: () => spy.calls.length });

  spy.calledWith = (...expected) =>
    spy.calls.some((args) => args.length === expected.length && args.every((a, i) => Object.is(a, expected[i])));

  spy.reset = () => {
    // очищаємо на місці — посилання, збережені тестом, лишаються валідними
    spy.calls.length = 0;
    spy.contexts.length = 0;
    spy.results.length = 0;
  };

  return spy;
}
`,
      hints: [
        '`impl.apply(this, args)` передає і контекст, і аргументи; стрілкова функція замість `function spy` втратить `this`.',
        '`Object.defineProperty(spy, \'callCount\', { get: () => spy.calls.length })` — одне джерело правди замість лічильника.',
        '`calledWith`: `spy.calls.some(args => args.length === expected.length && args.every((a, i) => Object.is(a, expected[i])))`.'
      ],
      tests: [
        { name: 'записує аргументи та повертає результат impl', code: "const spy = createSpy((a, b) => a + b);\nexpect(spy(1, 2)).toBe(3);\nexpect(spy(5, 5)).toBe(10);\nexpect(spy.calls).toEqual([[1, 2], [5, 5]]);\nexpect(spy.results).toEqual([{ type: 'return', value: 3 }, { type: 'return', value: 10 }]);" },
        { name: 'без impl повертає undefined', code: "const spy = createSpy();\nexpect(spy('x')).toBeUndefined();\nexpect(spy.calls).toEqual([['x']]);" },
        { name: 'callCount завжди актуальний', code: "const spy = createSpy();\nexpect(spy.callCount).toBe(0);\nspy(); spy(); spy();\nexpect(spy.callCount).toBe(3);" },
        { name: 'зберігає this і записує contexts', code: "const obj = { factor: 3, mul: createSpy(function (n) { return n * this.factor; }) };\nexpect(obj.mul(2)).toBe(6);\nexpect(obj.mul.contexts[0]).toBe(obj);" },
        { name: 'записує і пробрасує помилку', code: "const err = new Error('boom');\nconst spy = createSpy(() => { throw err; });\nexpect(() => spy(1)).toThrow('boom');\nexpect(spy.results).toEqual([{ type: 'throw', value: err }]);\nexpect(spy.results[0].value).toBe(err);\nexpect(spy.callCount).toBe(1);" },
        { name: 'calledWith порівнює через Object.is і довжину', code: "const spy = createSpy();\nconst o = {};\nspy(1, 'a'); spy(o); spy(NaN);\nexpect(spy.calledWith(1, 'a')).toBe(true);\nexpect(spy.calledWith(1)).toBe(false);\nexpect(spy.calledWith(o)).toBe(true);\nexpect(spy.calledWith({})).toBe(false);\nexpect(spy.calledWith(NaN)).toBe(true);" },
        { name: 'reset очищає історію', code: "const spy = createSpy(() => 1);\nconst calls = spy.calls;\nspy(1); spy(2);\nspy.reset();\nexpect(spy.callCount).toBe(0);\nexpect(spy.results).toEqual([]);\nexpect(calls).toEqual([]);\nspy(3);\nexpect(spy.calls).toEqual([[3]]);" },
        { name: 'шпигуни незалежні', code: "const a = createSpy();\nconst b = createSpy();\na(1);\nexpect(b.callCount).toBe(0);" }
      ],
      explanation: `
Шпигун — обгортка, що записує метадані виклику й делегує \`impl\`. Складність: O(1) на виклик.

**Типові помилки:** стрілкова функція (втрата \`this\`); \`reset\` через нові масиви (збережені посилання «застигають»); проковтування помилки.

**Далі можуть спитати:** як додати \`mockReturnValueOnce\` (черга значень)?
`
    },
    {
      id: 'test-spy-on',
      group: 'doubles',
      type: 'code',
      level: 3,
      title: 'spyOn(obj, method) з restore',
      tags: ['mocks'],
      description: `
**Завдання.** Напишіть \`spyOn(obj, method)\` — аналог \`vi.spyOn\`: підміняє метод об'єкта шпигуном, вміє змінювати поведінку і відновлювати оригінал.

**Де трапляється:** у тестах шпигують за \`console.error\`, \`api.fetchUser\`, \`Storage.prototype.setItem\` і обов'язково відновлюють після тесту.

**Що написати**
- \`spyOn(obj, method)\` → \`spy\`, який записано в \`obj[method]\`. Якщо \`obj[method]\` не функція — \`throw new TypeError(...)\`.
- Виклик шпигуна викликає **оригінал** з тим самим \`this\` і аргументами й повертає його результат.
- \`spy.calls\` — масив аргументів кожного виклику; \`spy.callCount\` — кількість викликів.
- \`spy.mockImplementation(fn)\` → \`spy\`; далі замість оригіналу викликається \`fn\` (з тим самим \`this\`).
- \`spy.restore()\` — повертає все як було: власний метод → та сама функція; успадкований з прототипу → видалити власну властивість.

**Приклад**
\`\`\`js
const calc = { base: 10, add(n) { return this.base + n; } };
const spy = spyOn(calc, 'add');
calc.add(5);                     // 15 — оригінал
spy.calls;                       // [[5]]
spy.mockImplementation(() => 0);
calc.add(5);                     // 0
spy.restore();
calc.add(5);                     // 15
\`\`\`

**Як це працює:** \`obj[method] = spy\` створює **власну** властивість, що затіняє прототип. Тому для успадкованого методу відновлення — це \`delete obj[method]\`, і метод знову береться з прототипу.

**Врахуйте:** \`Object.hasOwn(obj, method)\` перевіряйте **до** заміни; шпигун на \`Class.prototype\` бачить виклики всіх екземплярів.
`,
      starter: `function spyOn(obj, method) {
  const original = obj[method];
  // 1. TODO: якщо original не функція — throw new TypeError('...')

  // 2. Запам'ятайте ДО заміни, чи метод власний (а не з прототипу)
  const wasOwn = false; // TODO: Object.hasOwn(obj, method)
  let impl = original;  // поточна поведінка; mockImplementation її змінює

  function spy(...args) {
    // 3. TODO: записати args у spy.calls і повернути impl.apply(this, args)
  }
  spy.calls = [];
  // TODO: callCount — геттер на spy.calls.length

  spy.mockImplementation = (fn) => {
    // TODO: замінити impl і повернути spy
  };

  spy.restore = () => {
    // 4. TODO: власний → obj[method] = original; успадкований → delete obj[method]
  };

  obj[method] = spy;
  return spy;
}

// Спробуйте:
// const o = { hi() { return 'hi'; } };
// const s = spyOn(o, 'hi'); o.hi(); s.calls; s.restore();
`,
      solution: `function spyOn(obj, method) {
  const original = obj[method];
  if (typeof original !== 'function') {
    throw new TypeError(\`Cannot spy on "\${String(method)}": it is not a function\`);
  }
  // запам'ятовуємо, чи метод був власним — від цього залежить restore
  const wasOwn = Object.hasOwn(obj, method);
  let impl = original;

  function spy(...args) {
    spy.calls.push(args);
    return impl.apply(this, args);
  }

  spy.calls = [];
  Object.defineProperty(spy, 'callCount', { get: () => spy.calls.length });
  spy.mockImplementation = (fn) => {
    impl = fn;
    return spy;
  };
  spy.restore = () => {
    if (wasOwn) obj[method] = original;
    else delete obj[method]; // знову "проступить" метод з прототипу
  };

  obj[method] = spy;
  return spy;
}
`,
      hints: [
        'Тримайте поточну поведінку в змінній `impl` у замиканні: спочатку `original`, `mockImplementation` просто перезаписує її.',
        'Для класу метод живе в `Cat.prototype`, тож `Object.hasOwn(c, \'speak\')` — `false`, і `restore` має зробити `delete c.speak`.'
      ],
      tests: [
        { name: 'викликає оригінал і записує виклики', code: "const calc = { base: 10, add(n) { return this.base + n; } };\nconst spy = spyOn(calc, 'add');\nexpect(calc.add(5)).toBe(15);\nexpect(calc.add(1)).toBe(11);\nexpect(spy.calls).toEqual([[5], [1]]);\nexpect(spy.callCount).toBe(2);" },
        { name: 'повертає шпигуна, встановленого на об\'єкт', code: "const o = { m() {} };\nconst spy = spyOn(o, 'm');\nexpect(o.m).toBe(spy);" },
        { name: 'mockImplementation змінює поведінку і зберігає this', code: "const calc = { base: 10, add(n) { return this.base + n; } };\nconst spy = spyOn(calc, 'add');\nexpect(spy.mockImplementation(function (n) { return this.base * n; })).toBe(spy);\nexpect(calc.add(3)).toBe(30);\nexpect(spy.callCount).toBe(1);" },
        { name: 'restore повертає ту саму функцію', code: "const original = function () { return 'orig'; };\nconst o = { m: original };\nconst spy = spyOn(o, 'm');\nspy.mockImplementation(() => 'fake');\nexpect(o.m()).toBe('fake');\nspy.restore();\nexpect(o.m).toBe(original);\nexpect(o.m()).toBe('orig');" },
        { name: 'успадкований метод: restore видаляє власну властивість', code: "class Cat { speak() { return 'meow'; } }\nconst c = new Cat();\nconst spy = spyOn(c, 'speak');\nspy.mockImplementation(() => 'woof');\nexpect(c.speak()).toBe('woof');\nexpect(new Cat().speak()).toBe('meow');\nspy.restore();\nexpect(Object.hasOwn(c, 'speak')).toBe(false);\nexpect(c.speak()).toBe('meow');\nexpect(Cat.prototype.speak.call(c)).toBe('meow');" },
        { name: 'шпигун на прототипі бачить виклики всіх екземплярів', code: "class Dog { bark() { return 'woof'; } }\nconst original = Dog.prototype.bark;\nconst spy = spyOn(Dog.prototype, 'bark');\nnew Dog().bark(); new Dog().bark();\nexpect(spy.callCount).toBe(2);\nspy.restore();\nexpect(Dog.prototype.bark).toBe(original);" },
        { name: 'не функція → TypeError', code: "expect(() => spyOn({ x: 1 }, 'x')).toThrow(TypeError);\nexpect(() => spyOn({}, 'missing')).toThrow(TypeError);" }
      ],
      explanation: `
\`spyOn\` = зберегти оригінал + підмінити властивість + вміти відкотитись. Невідновлений шпигун на глобальному об'єкті «протікає» в інші тести (тому в Vitest є \`restoreMocks: true\`).

**Типові помилки:** \`hasOwn\` після заміни (завжди \`true\`); стрілкова обгортка; \`original()\` без \`apply\`.

**Далі можуть спитати:** як шпигувати за геттером (\`getOwnPropertyDescriptor\`)?
`
    },
    // ---------------------------------------------------------------- design
    {
      id: 'test-testable-design',
      group: 'design',
      type: 'theory',
      level: 3,
      title: 'Як писати тестований код',
      tags: ['design', 'di'],
      question: `
Функцію з \`Date.now()\` всередині важко тестувати — результат залежить від реального часу. Якщо час передати ззовні, тест підставить будь-яке значення:
\`\`\`js
function createChecker({ now = () => Date.now() } = {}) {
  return { isExpired: (t) => now() >= t.expiresAt };
}
createChecker({ now: () => 1000 }).isExpired({ expiresAt: 999 }); // true
\`\`\`
Як писати тестований код?
`,
      choices: [
        'Код з `Date.now()` і `Math.random()` усередині легко тестувати — достатньо прогнати тест кілька разів',
        'Якщо для тесту треба замокати сім модулів, варто взяти потужнішу бібліотеку моків, а не змінювати код',
        'Логіку виносять у чисті функції, а залежності на кшталт часу чи сховища передають ззовні з дефолтами',
        'Створення залежностей через `new Service()` усередині функції спрощує тести, бо все інкапсульовано',
        'Dependency injection можлива лише в класах з DI-контейнером, а у функціональному коді її не застосуєш',
      ],
      correct: 2,
      hint: 'Приховані залежності: Date.now(), Math.random(), fetch, глобальний стан, new всередині функції.',
      answer: `
- **Заважають тестам:** \`Date.now()\`, \`Math.random()\`, \`fetch\`, \`localStorage\`, глобальний стан, \`new Service()\` усередині.
- **Чисті функції** для логіки — тести без моків.
- **Functional core, imperative shell:** логіка в чистому ядрі, мережа/DOM — тонким шаром по краях.
- **DI:** залежності параметрами з дефолтами (\`{ now = Date.now, storage = localStorage } = {}\`).
- **Адаптер** над стороннім SDK — мокається один шар.
- Альтернатива для легасі: \`vi.useFakeTimers()\`, \`vi.spyOn(Math, 'random')\`, \`vi.mock\`.
`,
      why: [
        'Ні: повтор тесту не робить час і випадковість контрольованими — тест лишається недетермінованим.',
        'Ні: багато моків — сигнал, що код занадто зв’язаний; виправляти треба дизайн.',
        'Так: чиста логіка тестується без моків, а залежності з дефолтами легко підмінити.',
        'Ні: `new Service()` усередині неможливо підмінити без глобальних моків.',
        'Ні: DI у функціях — це просто параметр з дефолтним значенням.'
      ],
      keyPoints: [
        'Приховані залежності: час, random, мережа, глобальний стан, new усередині',
        'Чисті функції для логіки — тести без моків',
        'Functional core, imperative shell: ефекти на краях',
        'Dependency injection з дефолтними значеннями',
        'Адаптери над сторонніми API; багато моків = сигнал поганого дизайну'
      ],
      followUps: ['Чим DI відрізняється від vi.mock для підміни залежностей?', 'Як протестувати функцію, що читає Date.now() всередині, не змінюючи її?', 'Що таке seam (шов) у легасі-коді?']
    },
    {
      id: 'test-inject-deps',
      group: 'design',
      type: 'code',
      level: 2,
      title: 'Зробити код тестованим: інжекція годинника і random',
      tags: ['design', 'di'],
      description: `
**Завдання.** Сервіс одноразових кодів (OTP) у стартовому коді працює, але напряму викликає \`Date.now()\` і \`Math.random()\`, тож його неможливо надійно протестувати. Перепишіть його так, щоб ці залежності передавалися ззовні.

**Де трапляється:** будь-який код з часом/випадковістю: токени, таймаути сесії, генерація id, «новинка, якщо створено < 7 днів тому».

**Що написати**
- \`createOtpService({ now, random, ttlMs } = {})\`:
  - \`now\` — функція → поточний час у мс (за замовчуванням \`Date.now\`);
  - \`random\` — функція → число \`[0, 1)\` (за замовчуванням \`Math.random\`);
  - \`ttlMs\` — час життя коду (за замовчуванням \`60000\`).
- Поведінку методів зберегти:
  - \`issue(userId)\` → 6-значний рядок \`String(Math.floor(random() * 1e6)).padStart(6, '0')\`; новий код замінює старий;
  - \`verify(userId, code)\` → \`'missing'\` (коду немає) | \`'expired'\` (\`now() >= видано + ttlMs\`, код видаляється) | \`'invalid'\` (не збігся, код лишається) | \`'ok'\` (збігся, код видаляється).

**Приклад**
\`\`\`js
let t = 0;
const svc = createOtpService({ now: () => t, random: () => 0.5, ttlMs: 1000 });
svc.issue('u1');          // '500000'
t = 1000;
svc.verify('u1', '500000'); // 'expired'
\`\`\`

**Як це працює:** залежності — параметри з дефолтами. Продакшен викликає \`createOtpService()\` як раніше, тест підставляє керовані \`now\` і \`random\`.

**Врахуйте:** \`now()\` і \`random()\` викликайте **в момент операції**, а не один раз при створенні сервісу — інакше тест не зможе «просунути» час.
`,
      starter: `// 1. TODO: прийміть { now, random, ttlMs } з дефолтами Date.now, Math.random, 60000
function createOtpService(options = {}) {
  const ttlMs = options.ttlMs ?? 60000;
  const codes = new Map();
  return {
    issue(userId) {
      // 2. TODO: Math.random() → random()
      const code = String(Math.floor(Math.random() * 1e6)).padStart(6, '0');
      // 3. TODO: Date.now() → now()
      codes.set(userId, { code, expiresAt: Date.now() + ttlMs });
      return code;
    },
    verify(userId, code) {
      const entry = codes.get(userId);
      if (!entry) return 'missing';
      if (Date.now() >= entry.expiresAt) { // TODO: now()
        codes.delete(userId);
        return 'expired';
      }
      if (entry.code !== code) return 'invalid';
      codes.delete(userId);
      return 'ok';
    }
  };
}

// Спробуйте: createOtpService({ random: () => 0.5 }).issue('u1'); // '500000'
`,
      solution: `function createOtpService({ now = () => Date.now(), random = Math.random, ttlMs = 60000 } = {}) {
  const codes = new Map();
  return {
    issue(userId) {
      const code = String(Math.floor(random() * 1e6)).padStart(6, '0');
      codes.set(userId, { code, expiresAt: now() + ttlMs });
      return code;
    },
    verify(userId, code) {
      const entry = codes.get(userId);
      if (!entry) return 'missing';
      if (now() >= entry.expiresAt) {
        codes.delete(userId);
        return 'expired';
      }
      if (entry.code !== code) return 'invalid';
      codes.delete(userId); // одноразовий код
      return 'ok';
    }
  };
}
`,
      hints: [
        'Сигнатура: `function createOtpService({ now = () => Date.now(), random = Math.random, ttlMs = 60000 } = {})`.',
        'Замініть усі `Date.now()` на `now()` і `Math.random()` на `random()` усередині методів.'
      ],
      tests: [
        { name: 'код береться з інжектованого random', code: "const svc = createOtpService({ random: () => 0.5 });\nexpect(svc.issue('u1')).toBe('500000');\nconst svc2 = createOtpService({ random: () => 0.000042 });\nexpect(svc2.issue('u1')).toBe('000042');" },
        { name: 'ok, а потім код одноразовий', code: "const svc = createOtpService({ random: () => 0.123456, now: () => 0 });\nconst code = svc.issue('u1');\nexpect(code).toBe('123456');\nexpect(svc.verify('u1', '123456')).toBe('ok');\nexpect(svc.verify('u1', '123456')).toBe('missing');" },
        { name: 'invalid не видаляє код', code: "const svc = createOtpService({ random: () => 0.5, now: () => 0 });\nsvc.issue('u1');\nexpect(svc.verify('u1', '111111')).toBe('invalid');\nexpect(svc.verify('u1', '500000')).toBe('ok');" },
        { name: 'термін дії за інжектованим годинником', code: "let t = 1000;\nconst svc = createOtpService({ now: () => t, random: () => 0.5, ttlMs: 30000 });\nsvc.issue('u1');\nt = 30999;\nexpect(svc.verify('u1', '000000')).toBe('invalid');\nt = 31000;\nexpect(svc.verify('u1', '500000')).toBe('expired');\nexpect(svc.verify('u1', '500000')).toBe('missing');" },
        { name: 'новий код замінює старий, користувачі незалежні', code: "const values = [0.111111, 0.222222, 0.333333];\nconst svc = createOtpService({ random: () => values.shift(), now: () => 0 });\nsvc.issue('u1');\nsvc.issue('u1');\nsvc.issue('u2');\nexpect(svc.verify('u1', '111111')).toBe('invalid');\nexpect(svc.verify('u1', '222222')).toBe('ok');\nexpect(svc.verify('u2', '333333')).toBe('ok');\nexpect(svc.verify('u3', '000000')).toBe('missing');" },
        { name: 'без опцій працюють реальні залежності', code: "const svc = createOtpService();\nconst code = svc.issue('u1');\nexpect(code).toMatch(/^\\d{6}$/);\nexpect(svc.verify('u1', code)).toBe('ok');" }
      ],
      explanation: `
Найпростіша форма dependency injection — параметри з дефолтами: тест керує часом і випадковістю без глобальних моків і без реального очікування.

**Типова помилка:** \`now: Date.now()\` (число замість функції) — час «застигає».

**Бонус:** для справжніх OTP — \`crypto.getRandomValues\`, ліміт спроб і порівняння за сталий час.
`
    },
    // ---------------------------------------------------------------- async
    {
      id: 'test-jest-basics',
      group: 'async',
      type: 'theory',
      level: 2,
      title: 'Jest/Vitest: структура, матчери, хуки, моки модулів, async',
      tags: ['jest', 'vitest'],
      question: `
Раннер чекає лише проміс, який тест повернув або на який чекає через \`await\`:
\`\`\`js
test('loads user', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('Ann');
});
\`\`\`
Що треба знати про Jest/Vitest: матчери, хуки, моки модулів, async? Оберіть **усі** правильні твердження.
`,
      choices: [
        '`toBe` порівнює через `Object.is`, а `toEqual` — глибоко: для різних обʼєктів з однаковим вмістом потрібен `toEqual`',
        '`toThrow` очікує результат виклику, тож `expect(parse("")).toThrow()` коректно перевірить, що функція кидає помилку',
        '`vi.mock()` виконується саме там, де його написано, тому виклик ставлять після імпорту модуля, який мокають',
        'Якщо забути `await` перед асинхронною перевіркою, тест може завершитися раніше й виявитися хибно зеленим',
        '`mockClear` очищає лише історію викликів, а `mockRestore` ще й повертає оригінальний метод для `spyOn`',
      ],
      correct: [0, 3, 4],
      hint: 'describe/it, toBe vs toEqual, beforeEach, vi.mock і hoisting, await, useFakeTimers.',
      answer: `
- **Структура:** \`describe\` / \`it\`, \`it.each\`, \`only\` / \`skip\`.
- **Матчери:** \`toBe\` (\`Object.is\`), \`toEqual\` (глибоко), \`toStrictEqual\`, \`toBeCloseTo\`, \`toThrow\` (приймає функцію), \`toHaveBeenCalledWith\`.
- **Хуки:** \`beforeEach\` — свіжий стан для кожного тесту; \`beforeAll\` — дорога ініціалізація.
- **Моки:** \`vi.fn()\`, \`vi.spyOn(obj, 'm')\`, \`vi.mock('./api')\` (хойститься); \`mockClear\` < \`mockReset\` < \`mockRestore\`.
- **Async:** \`await\` / \`return\` проміс; \`await expect(p).rejects.toThrow()\`.
- **Таймери:** \`vi.useFakeTimers()\`, \`advanceTimersByTime\`; якщо таймер ставиться після \`await\` — \`advanceTimersByTimeAsync\`.
`,
      why: [
        'Так: `toBe` порівнює посилання, `toEqual` — вміст.',
        'Ні: помилка вилетить ще до `expect`; потрібна функція: `expect(() => parse("")).toThrow()`.',
        'Ні: `vi.mock` підіймається (hoisting) нагору файлу і виконується до імпортів.',
        'Так: без `await` тест завершується до перевірки і стає хибно зеленим.',
        'Так: `mockClear` — лише історія, `mockReset` — ще й реалізація, `mockRestore` — ще й оригінал.'
      ],
      keyPoints: [
        'describe/it, it.each, only/skip',
        'toBe (Object.is) vs toEqual (глибоко) vs toStrictEqual; toThrow приймає функцію',
        'beforeEach для ізоляції, beforeAll для дорогої ініціалізації',
        'vi.fn / vi.spyOn / vi.mock (хойститься); mockClear vs mockReset vs mockRestore',
        'async: await/return, resolves/rejects; забутий await → хибно зелений тест',
        'Фейкові таймери і advanceTimersByTimeAsync для коду з await'
      ],
      followUps: ['Чому vi.mock хойститься і що з цього випливає?', 'Як протестувати, що функція викликається з debounce?', 'Як замокати лише одну функцію модуля, залишивши інші справжніми?']
    },
    {
      id: 'test-quiz-async',
      group: 'async',
      type: 'quiz',
      level: 2,
      title: 'Асинхронний тест без await',
      tags: ['jest', 'async'],
      question: `
\`fetchUser(1)\` повертає проміс, що резолвиться в \`{ name: 'Bob' }\`. Що станеться з тестом?

\`\`\`js
test('loads user', () => {
  fetchUser(1).then((user) => {
    expect(user.name).toBe('Ann');
  });
});
\`\`\`
`,
      options: [
        'Тест упаде з повідомленням `expected "Bob" to be "Ann"`',
        'Тест **пройде** (хибно зелений): він завершився до виконання `then`',
        'Тест упаде з таймаутом, бо раннер чекатиме промісу',
        'Jest автоматично дочекається всіх промісів, створених у тесті, і тест упаде'
      ],
      answer: 1,
      why: [
        'Ні: перевірка виконається вже після завершення тесту — раннер її не побачить.',
        'Так: функція тесту синхронна, раннер вважає тест завершеним до виконання `then`.',
        'Ні: раннер не знає про проміс, який тест не повернув, тож і не чекає на нього.',
        'Ні: автоматичного очікування «всіх промісів» немає.'
      ],
      hint: 'Що повертає функція тесту і звідки раннер дізнається, що потрібно щось чекати?',
      explanation: `
\`then\`-колбек — мікрозадача, що виконується після повернення з функції тесту. Виправлення: \`async\` + \`await fetchUser(1)\` або \`return fetchUser(1).then(...)\`. Захист: \`expect.assertions(1)\`, ESLint \`no-floating-promises\`.
`
    },
    {
      id: 'test-mini-runner',
      group: 'async',
      type: 'code',
      level: 3,
      title: 'Міні тест-раннер з async, beforeEach, skip і таймаутом',
      tags: ['async', 'jest'],
      description: `
**Завдання.** Напишіть \`createRunner()\` — мінімальний тест-раннер: реєструє тести й хуки, а \`run()\` виконує їх по черзі й повертає звіт.

**Де трапляється:** розуміння, як Jest/Vitest виконують async-тести, чому падіння одного не зупиняє інші і звідки таймаут; класична задача на послідовний async-цикл.

**Що написати**
- \`createRunner({ timeout = 2000 } = {})\` → \`{ test, skip, beforeEach, run }\`:
  - \`test(name, fn)\` — реєструє тест (\`fn\` синхронна або повертає проміс);
  - \`skip(name, fn)\` — реєструє пропущений тест (\`fn\` не викликається);
  - \`beforeEach(fn)\` — хук перед **кожним** незапропущеним тестом; кілька хуків — у порядку реєстрації;
  - \`run()\` → проміс зі звітом \`{ passed, failed, skipped, results }\`, де \`results[i]\` — \`{ name, status: 'passed' | 'skipped' }\` або \`{ name, status: 'failed', error: message }\`.

**Приклад**
\`\`\`js
const r = createRunner({ timeout: 50 });
r.beforeEach(() => console.log('hook'));
r.test('ok', () => {});
r.test('boom', () => { throw new Error('boom'); });
r.skip('later', () => {});
await r.run();
// hook, hook
// { passed: 1, failed: 1, skipped: 1, results: [
//   { name: 'ok', status: 'passed' },
//   { name: 'boom', status: 'failed', error: 'boom' },
//   { name: 'later', status: 'skipped' } ] }
\`\`\`

**Як це працює:** \`for...of\` з \`await\` чекає кожен тест перед наступним; \`try/catch\` навколо \`await\` ловить і синхронний \`throw\`, і відхилений проміс. Таймаут — \`Promise.race\` роботи тесту з таймером, що відхиляється.

**Врахуйте:**
- тест падає, якщо впав будь-який \`beforeEach\` (сам тест тоді не викликається);
- кинуто не \`Error\` (наприклад, рядок) → \`error: String(value)\`;
- довше за \`timeout\` → \`error: 'Timeout of <timeout>ms exceeded'\`; таймер прибирайте через \`clearTimeout\`.
`,
      starter: `function createRunner({ timeout = 2000 } = {}) {
  const tests = []; // { name, fn, skip }
  const hooks = []; // функції beforeEach

  // 1. Виконати fn з обмеженням часу:
  //    Promise.race([Promise.resolve().then(fn), проміс, що відхиляється через timeout])
  //    і clearTimeout у finally
  function withTimeout(fn) {
    // TODO
  }

  return {
    test(name, fn) {
      // TODO: tests.push({ name, fn, skip: false })
    },
    skip(name, fn) {
      // TODO
    },
    beforeEach(fn) {
      // TODO
    },
    async run() {
      const results = [];
      // 2. for (const t of tests) — НЕ forEach: він не чекає промісів
      //    skip → { name, status: 'skipped' }
      //    try: await withTimeout(async () => { хуки по черзі з await; await t.fn(); }) → 'passed'
      //    catch (err): { name, status: 'failed', error: err instanceof Error ? err.message : String(err) }
      // 3. Порахувати passed / failed / skipped
      return { passed: 0, failed: 0, skipped: 0, results };
    }
  };
}

// Спробуйте:
// const r = createRunner(); r.test('ok', () => {}); r.run().then(console.log);
`,
      solution: `function createRunner({ timeout = 2000 } = {}) {
  const tests = [];
  const hooks = [];

  function withTimeout(fn) {
    let timer;
    const limit = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(\`Timeout of \${timeout}ms exceeded\`)), timeout);
    });
    // Promise.resolve().then(fn) ловить і синхронні throw, і відхилені проміси
    return Promise.race([Promise.resolve().then(fn), limit]).finally(() => clearTimeout(timer));
  }

  return {
    test(name, fn) {
      tests.push({ name, fn, skip: false });
    },
    skip(name, fn) {
      tests.push({ name, fn, skip: true });
    },
    beforeEach(fn) {
      hooks.push(fn);
    },
    async run() {
      const results = [];
      for (const t of tests) {
        if (t.skip) {
          results.push({ name: t.name, status: 'skipped' });
          continue;
        }
        try {
          await withTimeout(async () => {
            for (const hook of hooks) await hook();
            await t.fn();
          });
          results.push({ name: t.name, status: 'passed' });
        } catch (err) {
          results.push({ name: t.name, status: 'failed', error: err instanceof Error ? err.message : String(err) });
        }
      }
      const count = (status) => results.filter((r) => r.status === status).length;
      return { passed: count('passed'), failed: count('failed'), skipped: count('skipped'), results };
    },
  };
}
`,
      hints: [
        '`run` — `async` функція з `for...of` і `await` всередині; падіння хука перерве `try` ще до виклику `t.fn()`.',
        'Таймаут: `new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(...)), timeout); })` + `Promise.race` + `.finally(() => clearTimeout(timer))`.'
      ],
      tests: [
        { name: 'синхронні тести: звіт і порядок', code: "const r = createRunner();\nr.test('adds', () => { if (1 + 1 !== 2) throw new Error('math'); });\nr.test('fails', () => { throw new Error('boom'); });\nr.test('ok', () => {});\nconst report = await r.run();\nexpect(report).toEqual({\n  passed: 2, failed: 1, skipped: 0,\n  results: [\n    { name: 'adds', status: 'passed' },\n    { name: 'fails', status: 'failed', error: 'boom' },\n    { name: 'ok', status: 'passed' }\n  ]\n});" },
        { name: 'async тести і відхилені проміси', code: "const r = createRunner();\nr.test('resolves', async () => { await Promise.resolve(); });\nr.test('rejects', async () => { await null; throw new Error('async boom'); });\nr.test('returns rejected promise', () => Promise.reject(new Error('rejected')));\nconst { results } = await r.run();\nexpect(results.map(x => x.status)).toEqual(['passed', 'failed', 'failed']);\nexpect(results[1].error).toBe('async boom');\nexpect(results[2].error).toBe('rejected');" },
        { name: 'тести виконуються послідовно', code: "const log = [];\nconst r = createRunner();\nr.test('a', async () => { log.push('a start'); await null; await null; log.push('a end'); });\nr.test('b', () => { log.push('b'); });\nawait r.run();\nexpect(log).toEqual(['a start', 'a end', 'b']);" },
        { name: 'beforeEach перед кожним тестом, у порядку реєстрації', code: "const log = [];\nconst r = createRunner();\nr.beforeEach(() => log.push('hook1'));\nr.beforeEach(async () => { await null; log.push('hook2'); });\nr.test('t1', () => log.push('t1'));\nr.test('t2', () => log.push('t2'));\nawait r.run();\nexpect(log).toEqual(['hook1', 'hook2', 't1', 'hook1', 'hook2', 't2']);" },
        { name: 'падіння beforeEach валить тест і не викликає його', code: "const fn = mockFn();\nconst r = createRunner();\nlet n = 0;\nr.beforeEach(() => { if (++n === 1) throw new Error('setup failed'); });\nr.test('first', fn);\nr.test('second', () => {});\nconst report = await r.run();\nexpect(fn).not.toHaveBeenCalled();\nexpect(report.results[0]).toEqual({ name: 'first', status: 'failed', error: 'setup failed' });\nexpect(report.results[1].status).toBe('passed');" },
        { name: 'skip і кинутий рядок', code: "const fn = mockFn();\nconst r = createRunner();\nr.skip('later', fn);\nr.test('throws string', () => { throw 'oops'; });\nconst report = await r.run();\nexpect(fn).not.toHaveBeenCalled();\nexpect(report.skipped).toBe(1);\nexpect(report.results).toEqual([{ name: 'later', status: 'skipped' }, { name: 'throws string', status: 'failed', error: 'oops' }]);" },
        { name: 'таймаут для завислого тесту', code: "const r = createRunner({ timeout: 30 });\nr.test('hangs', () => new Promise(() => {}));\nr.test('after', () => {});\nconst report = await r.run();\nexpect(report.results[0]).toEqual({ name: 'hangs', status: 'failed', error: 'Timeout of 30ms exceeded' });\nexpect(report.results[1].status).toBe('passed');" }
      ],
      explanation: `
Ядро раннера — послідовний async-цикл з ізоляцією помилок. Складність: O(n · h) викликів (h — хуки).

**Типові помилки:** \`forEach\` з async-колбеком (нічого не чекає); забутий \`clearTimeout\`; \`err.message\` для кинутого рядка.

**Далі можуть спитати:** як додати вкладені \`describe\` і \`only\`? Чому таймаут не зупинить синхронний нескінченний цикл?
`
    },
    {
      id: 'test-quiz-fake-timers',
      group: 'async',
      type: 'quiz',
      level: 3,
      title: 'Фейкові таймери і await',
      tags: ['timers', 'async', 'vitest'],
      question: `
Чи пройде тест?

\`\`\`js
async function retryOnce(fn) {
  try {
    return await fn();
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
    return fn();
  }
}

test('retries after 1s', async () => {
  vi.useFakeTimers();
  const fn = vi.fn()
    .mockRejectedValueOnce(new Error('fail'))
    .mockResolvedValue('ok');
  const p = retryOnce(fn);
  vi.advanceTimersByTime(1000);
  expect(fn).toHaveBeenCalledTimes(2);
  await expect(p).resolves.toBe('ok');
});
\`\`\`
`,
      options: [
        'Так, фейкові таймери миттєво виконали setTimeout і повторний виклик',
        'Ні: фейкові таймери взагалі не працюють з кодом на промісах',
        'Ні: на момент `advanceTimersByTime` таймер ще не створено — `fn` викликано 1 раз',
        'Тест зависне назавжди, бо проміс `p` ніколи не виконається'
      ],
      answer: 2,
      why: [
        'Ні: на момент `advanceTimersByTime` таймер ще не створено.',
        'Ні: працюють, але треба враховувати порядок мікро- і макрозадач.',
        'Так: `catch` і `setTimeout` виконаються лише в мікрозадачі після синхронного коду тесту.',
        'Ні: тест упаде раніше — на `toHaveBeenCalledTimes(2)`.'
      ],
      hint: 'Коли саме виконується блок `catch` — синхронно під час виклику `retryOnce` чи після мікрозадачі?',
      explanation: `
\`retryOnce\` зупиняється на \`await\` відхиленого промісу; продовження (\`catch\` → \`setTimeout\`) — мікрозадача. Синхронний \`advanceTimersByTime(1000)\` нічого не просуває, \`fn\` викликано 1 раз. Виправлення: \`await vi.advanceTimersByTimeAsync(1000)\` або \`await flushPromises()\` перед просуванням.
`
    },
    {
      id: 'test-fake-clock',
      group: 'async',
      type: 'code',
      level: 4,
      title: 'Власні фейкові таймери: createFakeClock',
      tags: ['timers', 'event-loop'],
      description: `
**Завдання.** Напишіть \`createFakeClock(start)\` — керований годинник з таймерами, як \`vi.useFakeTimers()\`: час не йде сам, його просувають вручну, і таймери виконуються у правильному порядку.

**Де трапляється:** тести debounce/throttle/polling без реального очікування; на співбесідах — «як працюють фейкові таймери».

**Що написати**
- \`createFakeClock(start = 0)\` → об'єкт:
  - \`now()\` → поточний фейковий час;
  - \`setTimeout(fn, ms, ...args)\` / \`setInterval(fn, ms, ...args)\` → id (1, 2, 3…); \`clearTimeout(id)\` / \`clearInterval(id)\`;
  - \`tick(ms)\` — просуває час на \`ms\`, виконуючи всі таймери, що настали;
  - \`runAll()\` — виконує всі таймери (і ті, що створюються по ходу), доки не скінчаться;
  - \`pending()\` → кількість запланованих таймерів.

**Приклад**
\`\`\`js
const clock = createFakeClock();
clock.setTimeout(() => console.log('B', clock.now()), 20);
clock.setTimeout(() => console.log('A', clock.now()), 10);
clock.tick(15); // A 10
clock.tick(5);  // B 20
clock.now();    // 20
\`\`\`

**Як це працює:** кожен таймер зберігає абсолютний час спрацювання \`time\`. \`tick\` у циклі бере найближчий таймер з \`time <= ціль\`, ставить \`now = time\` і виконує колбек; наприкінці \`now = ціль\`.

**Врахуйте:**
- однаковий час → у порядку планування (лічильник \`seq\`);
- таймери, створені колбеком у межах вікна \`tick\`, теж виконуються;
- затримка \`setTimeout\` < 0 або відсутня → 0; \`setInterval\` < 1 → 1;
- інтервал перепланувати на \`time + ms\` **до** виклику колбека — тоді \`clearInterval\` усередині колбека спрацює;
- \`runAll\` кидає \`Error\` з числом \`1000\` у повідомленні, якщо виконав понад 1000 таймерів.
`,
      starter: `function createFakeClock(start = 0) {
  let current = start;
  let nextId = 1;
  let seq = 0;              // порядок планування — для однакового часу
  const timers = new Map(); // id -> { time, seq, fn, args, interval, delay }

  // 1. delay = max(interval ? 1 : 0, Number(ms) || 0); time = current + delay; повернути id
  function schedule(fn, ms, args, interval) {
    // TODO
  }

  // 2. id найближчого таймера з time <= limit (менший time, потім менший seq) або null
  function nextDue(limit) {
    // TODO
  }

  // 3. current = time; інтервал — перепланувати (time += delay, новий seq), таймаут — видалити; викликати fn(...args)
  function fire(id) {
    // TODO
  }

  return {
    now: () => current,
    setTimeout: (fn, ms, ...args) => schedule(fn, ms, args, false),
    setInterval: (fn, ms, ...args) => schedule(fn, ms, args, true),
    clearTimeout: (id) => { timers.delete(id); },
    clearInterval: (id) => { timers.delete(id); },
    tick(ms) {
      // 4. TODO: target = current + ms; поки nextDue(target) !== null — fire; потім current = target
    },
    runAll() {
      // 5. TODO: те саме з limit = Infinity; лічильник > 1000 → throw new Error('... 1000 ...')
    },
    pending: () => timers.size
  };
}

// Спробуйте:
// const c = createFakeClock(); c.setTimeout(() => console.log(c.now()), 10); c.tick(10);
`,
      solution: `function createFakeClock(start = 0) {
  let current = start;
  let nextId = 1;
  let seq = 0; // порядок планування — для однакового часу
  const timers = new Map(); // id -> { time, seq, fn, args, interval, delay }

  function schedule(fn, ms, args, interval) {
    const delay = Math.max(interval ? 1 : 0, Number(ms) || 0);
    const id = nextId++;
    timers.set(id, { time: current + delay, seq: seq++, fn, args, interval, delay });
    return id;
  }

  // найближчий таймер, що настає не пізніше limit (лінійний пошук; для великих обсягів — купа)
  function nextDue(limit) {
    let bestId = null;
    let best = null;
    for (const [id, t] of timers) {
      if (t.time > limit) continue;
      if (!best || t.time < best.time || (t.time === best.time && t.seq < best.seq)) {
        best = t;
        bestId = id;
      }
    }
    return bestId;
  }

  function fire(id) {
    const t = timers.get(id);
    current = t.time;
    if (t.interval) {
      t.time += t.delay;  // перепланувати ДО виклику: колбек може зробити clearInterval
      t.seq = seq++;
    } else {
      timers.delete(id);
    }
    t.fn(...t.args);
  }

  const clear = (id) => { timers.delete(id); };

  return {
    now: () => current,
    setTimeout: (fn, ms, ...args) => schedule(fn, ms, args, false),
    setInterval: (fn, ms, ...args) => schedule(fn, ms, args, true),
    clearTimeout: clear,
    clearInterval: clear,
    tick(ms) {
      const target = current + ms;
      let id;
      while ((id = nextDue(target)) !== null) fire(id);
      current = target;
    },
    runAll() {
      let count = 0;
      let id;
      while ((id = nextDue(Infinity)) !== null) {
        if (++count > 1000) throw new Error('runAll: aborted after 1000 timers (infinite interval?)');
        fire(id);
      }
    },
    pending: () => timers.size,
  };
}
`,
      hints: [
        'Шукайте наступний таймер **заново** на кожній ітерації циклу — колбеки можуть додавати й видаляти таймери.',
        'У `fire` спершу оновіть `current` і перепланування/видалення, а вже потім викликайте `t.fn(...t.args)`.'
      ],
      tests: [
        { name: 'таймер спрацьовує лише коли настав час', code: "const c = createFakeClock();\nconst fn = mockFn();\nc.setTimeout(fn, 100);\nc.tick(99);\nexpect(fn).not.toHaveBeenCalled();\nc.tick(1);\nexpect(fn).toHaveBeenCalledTimes(1);\nexpect(c.now()).toBe(100);" },
        { name: 'порядок: за часом, потім за плануванням; now() у колбеку', code: "const c = createFakeClock(1000);\nconst log = [];\nc.setTimeout(() => log.push('c@' + c.now()), 30);\nc.setTimeout(() => log.push('a@' + c.now()), 10);\nc.setTimeout(() => log.push('b@' + c.now()), 10);\nc.tick(50);\nexpect(log).toEqual(['a@1010', 'b@1010', 'c@1030']);\nexpect(c.now()).toBe(1050);" },
        { name: 'аргументи, id і clearTimeout', code: "const c = createFakeClock();\nconst fn = mockFn();\nconst id1 = c.setTimeout(fn, 10, 'x', 1);\nconst id2 = c.setTimeout(fn, 10, 'y');\nexpect(id1).toBe(1);\nexpect(id2).toBe(2);\nc.clearTimeout(id2);\nc.clearTimeout(999);\nexpect(c.pending()).toBe(1);\nc.tick(10);\nexpect(fn.mock.calls).toEqual([['x', 1]]);\nexpect(c.pending()).toBe(0);" },
        { name: 'вкладені таймери в межах вікна tick', code: "const c = createFakeClock();\nconst log = [];\nc.setTimeout(() => { log.push('outer'); c.setTimeout(() => log.push('inner@' + c.now()), 5); }, 5);\nc.tick(9);\nexpect(log).toEqual(['outer']);\nc.tick(1);\nexpect(log).toEqual(['outer', 'inner@10']);" },
        { name: 'нульова і від\'ємна затримка', code: "const c = createFakeClock();\nconst fn = mockFn();\nc.setTimeout(fn, -5);\nc.setTimeout(fn);\nc.tick(0);\nexpect(fn).toHaveBeenCalledTimes(2);" },
        { name: 'setInterval і clearInterval усередині колбека', code: "const c = createFakeClock();\nconst times = [];\nconst id = c.setInterval(() => { times.push(c.now()); if (times.length === 3) c.clearInterval(id); }, 10);\nc.tick(25);\nexpect(times).toEqual([10, 20]);\nc.tick(100);\nexpect(times).toEqual([10, 20, 30]);\nexpect(c.pending()).toBe(0);" },
        { name: 'runAll виконує ланцюжок таймерів', code: "const c = createFakeClock();\nconst log = [];\nc.setTimeout(() => { log.push(1); c.setTimeout(() => { log.push(2); c.setTimeout(() => log.push(3), 1000); }, 500); }, 100);\nc.runAll();\nexpect(log).toEqual([1, 2, 3]);\nexpect(c.now()).toBe(1600);\nexpect(c.pending()).toBe(0);" },
        { name: 'runAll захищений від нескінченного інтервалу', code: "const c = createFakeClock();\nc.setInterval(() => {}, 0);\nexpect(() => c.runAll()).toThrow(/1000/);" }
      ],
      explanation: `
Фейкові таймери = віртуальний час + черга з пріоритетом. Тут пошук наступного — O(n), тобто O(n²) на серію; бібліотеки використовують мін-купу (O(log n)).

**Типові помилки:** перепланування інтервалу після колбека (\`clearInterval\` всередині не спрацює); один прохід по знімку таймерів замість пошуку заново; нескінченний \`runAll\` для інтервалу 0.

**Далі можуть спитати:** як зробити \`tickAsync\`, що прокручує мікрозадачі між таймерами?
`
    },
    // ---------------------------------------------------------------- coverage
    {
      id: 'test-snapshot-coverage',
      group: 'coverage',
      type: 'theory',
      level: 2,
      title: 'Snapshot-тести і покриття коду',
      tags: ['coverage', 'snapshots'],
      question: `
Покриття (coverage) рахує, які рядки й гілки **виконались** під час тестів. Снапшот зберігає вивід у файл і далі порівнює з ним:
\`\`\`js
expect(formatError(err)).toMatchInlineSnapshot(\`"Network error: timeout"\`);
\`\`\`
Які плюси й мінуси снапшотів і покриття? Оберіть **усі** правильні твердження.
`,
      choices: [
        'Snapshot-тест перевіряє, що вивід компонента правильний, тому може замінити явні перевірки поведінки',
        '100% line coverage гарантує, що перевірено всі межові значення й комбінації умов у коді',
        'Покриття показує, що код виконувався, а не що результат перевірено: тест без `expect` теж дає покриття',
        'Line coverage — найкорисніша метрика, а branch coverage лише дублює її іншими словами',
        'Снапшот фіксує поточний вивід, тож баг теж потрапить у нього, а великі diff часто оновлюють через `-u` наосліп',
      ],
      correct: [2, 4],
      hint: 'Snapshot фіксує «як є», а не «як має бути». Покриття показує виконаний код, а не перевірений.',
      answer: `
- **Снапшот:** дешево написати, ловить неочікувані зміни. Мінуси: фіксує і баги, крихкий, великі diff оновлюють через \`-u\` наосліп. Добре — маленькі inline-снапшоти стабільних даних.
- **Покриття:** statement/line, function, **branch** (найкорисніше).
- **100% ≠ без багів:** тест без \`expect\` теж дає покриття; межові значення й відсутній код не видно.
- Покриття — інструмент пошуку прогалин, а не KPI. Якість тестів — **mutation testing**.
`,
      why: [
        'Ні: снапшот фіксує вивід «як є» і не знає, чи він правильний.',
        'Ні: покриття не перевіряє межі (`>` vs `>=`) і комбінації умов.',
        'Так: покриття вимірює виконання коду, а не перевірки.',
        'Ні: branch coverage найкорисніший — один рядок з `&&` може мати кілька гілок.',
        'Так: снапшот «запам’ятовує» і баг, а великі diff ніхто не читає.'
      ],
      keyPoints: [
        'Snapshot фіксує поточний вивід: дешево, ловить неочікувані зміни',
        'Мінуси снапшотів: не знають, чи вивід правильний, крихкі, «-u на автоматі»',
        'Метрики покриття: line/statement, function, branch (найкорисніша)',
        'Покриття = виконано, а не перевірено; межі й комбінації не гарантуються',
        'Покриття — інструмент пошуку прогалин, не KPI; якість — mutation testing'
      ],
      followUps: ['Коли snapshot-тест доречний, а коли шкідливий?', 'Який поріг покриття ви б встановили і чому?', 'Як покриття рахується для коду, що транспілюється?']
    },
    {
      id: 'test-quiz-coverage',
      group: 'coverage',
      type: 'quiz',
      level: 2,
      title: '100% покриття — і що?',
      tags: ['coverage'],
      question: `
Вимога: «знижка 20% для VIP-клієнтів, у яких **10 або більше** замовлень».

\`\`\`js
function discount(user) {
  if (user.isVip && user.orders > 10) return 0.2;
  return 0;
}

test('VIP with many orders', () => {
  expect(discount({ isVip: true, orders: 20 })).toBe(0.2);
});
test('regular user', () => {
  expect(discount({ isVip: false, orders: 0 })).toBe(0);
});
\`\`\`

Звіт показує 100% line і 100% branch coverage. Яке твердження правильне?
`,
      options: [
        'Функція повністю протестована: обидві гілки `if` пройдені',
        'Покриття 100%, але тести пропустили баг: VIP з рівно 10 замовленнями не отримає знижку — межове значення не перевірено',
        'Branch coverage не може бути 100%, бо умова `orders > 10` жодного разу не була хибною',
        'Баг неможливий, бо будь-яка помилка в рядку з `if` знизила б покриття'
      ],
      answer: 1,
      why: [
        'Ні: межу `orders: 10` не перевірено — і саме там баг.',
        'Так: вимога «10 або більше», а код `> 10`; тест на 10 замовлень впав би.',
        'Ні: branch coverage рахує гілки всього `if`, а обидві гілки пройдено.',
        'Ні: неправильний оператор не змінює, які рядки виконуються.'
      ],
      hint: 'Подивіться на вимогу уважно і порівняйте її з оператором порівняння в коді. Що з цього бачить coverage?',
      explanation: `
Покриття вимірює виконання, а не правильність. Такі баги ловлять **межові значення** (для «від 10» — тести на 9, 10, 11) і mutation testing: мутант \`>\` → \`>=\` тут «вижив» би.
`
    },
    // ---------------------------------------------------------------- ui-e2e
    {
      id: 'test-dom-testing-library',
      group: 'ui-e2e',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Тестування UI: філософія Testing Library',
      tags: ['dom', 'testing-library'],
      question: `
Testing Library шукає елементи так, як їх бачить користувач — за роллю й текстом, а не за CSS-класом:
\`\`\`js
await user.click(screen.getByRole('button', { name: /зберегти/i }));
expect(await screen.findByText(/збережено/i)).toBeInTheDocument();
\`\`\`
Які запити кращі і чим відрізняються \`getBy\`, \`queryBy\`, \`findBy\`?
`,
      choices: [
        '`getByTestId` — найкращий запит: він не залежить від тексту й ролей, тому такі тести найстабільніші з усіх',
        '`getBy` повертає `null`, якщо елемента немає, тому ним зручно перевіряти відсутність елемента',
        '`findBy` синхронно шукає елемент і кидає помилку при кількох збігах — це аналог `getAllBy`',
        '`fireEvent` реалістичніший за `userEvent`, бо диспатчить саме ту одну подію, яку генерує браузер',
        '`queryBy` повертає `null` і підходить для перевірки відсутності, а `findBy` чекає асинхронної появи',
      ],
      correct: 4,
      hint: '«Чим більше тести схожі на те, як користуються програмою, тим більше впевненості вони дають».',
      answer: `
- **Філософія:** тестувати як користувач — ролі, лейбли, текст; не стан і не класи.
- **Пріоритет:** \`getByRole\` → \`getByLabelText\` → \`getByPlaceholderText\` / \`getByText\` → … → \`getByTestId\`.
- \`getBy\` — кидає, якщо немає; \`queryBy\` — \`null\` (перевірка відсутності); \`findBy\` — проміс, чекає появи.
- \`userEvent\` (pointerdown → mousedown → focus → click) замість \`fireEvent\` (одна подія).
- jsdom не має layout (розміри 0); мережу мокають через MSW.
`,
      why: [
        'Ні: `getByTestId` — останній засіб, бо не перевіряє ні роль, ні доступність.',
        'Ні: `getBy` кидає помилку; `null` повертає `queryBy`.',
        'Ні: `findBy` асинхронний — повертає проміс і чекає появи елемента.',
        'Ні: `userEvent` реалістичніший — генерує всю послідовність подій, як браузер.',
        'Так: `queryBy` — для перевірки відсутності, `findBy` — для асинхронної появи.'
      ],
      keyPoints: [
        'Тестувати як користувач: ролі, лейбли, текст — не класи і не стан',
        'Пріоритет: getByRole → getByLabelText → ... → getByTestId',
        'getBy кидає, queryBy повертає null (перевірка відсутності), findBy чекає асинхронно',
        'userEvent (реалістичні події) замість fireEvent',
        'jsdom без layout; мережа через MSW'
      ],
      followUps: ['Що робити, якщо елемент неможливо знайти за роллю?', 'Чому waitFor не можна використовувати з побічними ефектами всередині?', 'Як тестувати компонент, що робить запит при монтуванні?']
    },
    {
      id: 'test-quiz-query-priority',
      group: 'ui-e2e',
      type: 'quiz',
      level: 2,
      title: 'Найкращий запит у Testing Library',
      tags: ['dom', 'testing-library'],
      question: `
Потрібно знайти кнопку відправлення форми:

\`\`\`html
<button type="submit" class="btn btn-primary" data-testid="submit-btn">
  Надіслати заявку
</button>
\`\`\`

Який запит Testing Library рекомендує використати?
`,
      options: [
        '`screen.getByTestId(\'submit-btn\')`',
        '`container.querySelector(\'.btn-primary\')`',
        '`screen.getByText(\'Надіслати заявку\')`',
        '`screen.getByRole(\'button\', { name: /надіслати заявку/i })`'
      ],
      answer: 3,
      why: [
        'Ні: `data-testid` невидимий користувачу — останній засіб.',
        'Ні: клас — деталь стилів, зміна дизайну зламає тест.',
        'Ні: знайде текст, але не перевірить, що це кнопка.',
        'Так: роль + доступне ім’я — як кнопку знаходять і люди, і скрінрідери.'
      ],
      hint: 'Як цю кнопку «знаходить» користувач скрінрідера?',
      explanation: `
\`getByRole\` з \`name\` одночасно перевіряє семантику (це справді \`<button>\`, а не \`<div onclick>\`) і доступне ім’я.
`
    },
    {
      id: 'test-e2e-flaky',
      group: 'ui-e2e',
      type: 'theory',
      level: 3,
      title: 'E2E (Playwright, Cypress), flaky-тести, ізоляція, MSW',
      tags: ['e2e', 'flaky', 'msw'],
      question: `
Flaky-тест то проходить, то падає без змін у коді. Типова причина — фіксована пауза замість очікування умови:
\`\`\`js
await page.waitForTimeout(2000);                          // ❌ вгадуємо час
await expect(page.getByText('Збережено')).toBeVisible();  // ✅ чекає умову
\`\`\`
Як писати e2e (Playwright, Cypress) і лікувати flaky-тести?
`,
      choices: [
        'Найпростіше лікування flaky-тесту — додати `waitForTimeout(2000)` перед кроком, що іноді падає',
        'Flaky-тести лікують очікуванням умови, ізольованими даними, моками мережі та фіксованим часом',
        'Cypress керує браузером ззовні через протоколи, а Playwright працює всередині сторінки застосунку',
        'MSW підміняє лише глобальний `fetch` у коді застосунку, тому запити через axios він не перехопить',
        'Для швидкості e2e-тести ділять один акаунт і спільний стан, а порядок їхнього запуску фіксують',
      ],
      correct: 1,
      hint: 'Фіксовані паузи, спільний стан, реальний час і мережа, анімації, порядок тестів.',
      answer: `
- **Playwright:** Chromium/Firefox/WebKit, керує браузером ззовні, авто-очікування, паралельність, trace viewer. **Cypress:** працює всередині браузера, інтерактивний раннер.
- **Причини flaky → ліки:** \`sleep\` → чекати умову; спільний стан → свої дані й новий context; реальна мережа → \`page.route\` / MSW; анімації → \`reducedMotion\`; час → \`page.clock\`; класи в селекторах → ролі.
- **Ізоляція:** кожен тест незалежний; логін через збережений \`storageState\`.
- **MSW:** перехоплює запити на мережевому рівні; ті самі хендлери для тестів, Storybook і dev.
`,
      why: [
        'Ні: фіксована пауза — і є причина flaky: на CI не вистачить, локально — марна.',
        'Так: очікування умови, свої дані на тест, моки мережі й фіксований час прибирають недетермінованість.',
        'Навпаки: Playwright керує браузером ззовні, Cypress працює всередині сторінки.',
        'Ні: MSW перехоплює на мережевому рівні — axios теж.',
        'Ні: спільний стан і залежність від порядку — головне джерело flaky.'
      ],
      keyPoints: [
        'Playwright: кілька браузерів, auto-wait, паралельність, trace viewer; Cypress: всередині браузера, інтерактивний раннер',
        'Flaky: sleep, спільний стан, реальна мережа/час, анімації, нестабільні селектори, гонки',
        'Ліки: чекати умову, ізоляція даних, моки мережі, фіксований час',
        'Ізоляція: незалежні тести, свіжий context, storageState для логіну',
        'MSW: перехоплення на мережевому рівні, спільні хендлери для тестів і dev'
      ],
      followUps: ['Як ви діагностуєте тест, що падає лише в CI?', 'Чи варто в e2e мокати бекенд?', 'Як прискорити набір e2e-тестів, що виконується 40 хвилин?']
    },
    {
      id: 'test-advanced',
      group: 'ui-e2e',
      type: 'theory',
      level: 4,
      title: 'Контрактні тести, візуальна регресія, mutation testing',
      tags: ['strategy', 'mutation', 'contract'],
      question: 'Що таке контрактні тести, візуальні регресійні тести і mutation testing? Які проблеми вони вирішують і які мають обмеження? Оберіть **усі** правильні твердження.',
      choices: [
        'Mutation testing генерує сотні випадкових вхідних даних і шукає контрприклад для властивості функції',
        'Контрактні тести (Pact) ловлять розбіжність між моками фронтенду й реальним API ще до деплою бекенду',
        'Візуальна регресія стабільна з коробки: шрифти й антиаліасинг рендеряться однаково на будь-якій ОС',
        'Контрактні тести перевіряють бізнес-логіку провайдера, тому можуть замінити його unit-тести',
        'Якщо мутант вижив (тести зелені після заміни `>` на `>=`), цю поведінку ніхто насправді не перевіряє',
      ],
      correct: [1, 4],
      hint: 'Як переконатися, що мок бекенду відповідає реальному бекенду? Як помітити зсув кнопки на 3 пікселі? Як перевірити якість самих тестів?',
      answer: `
- **Контрактні тести (Pact, OpenAPI):** фронтенд записує очікувані запити/відповіді, бекенд перевіряє їх у своєму CI → розбіжність ловиться до деплою. Не перевіряють бізнес-логіку.
- **Візуальна регресія** (\`toHaveScreenshot\`, Chromatic): порівняння скріншотів; потребує однакового оточення, маскування динаміки, вимкнених анімацій.
- **Mutation testing** (Stryker): мутує код (\`>\` → \`>=\`); вижив мутант → слабкий тест. Mutation score чесніший за покриття, але повільний.
- **Property-based** (fast-check): генерує випадкові входи й шукає контрприклад.
`,
      why: [
        'Ні: це property-based testing (fast-check); mutation testing змінює **код**, а не вхідні дані.',
        'Так: контракт споживача перевіряється проти реального провайдера в CI бекенду.',
        'Ні: рендеринг відрізняється між ОС — потрібне однакове Docker-оточення.',
        'Ні: контракт перевіряє форму запитів і відповідей, а не бізнес-логіку.',
        'Так: вижилий мутант означає, що зміну поведінки жоден тест не помітив.'
      ],
      keyPoints: [
        'Контрактні тести (Pact, OpenAPI) — узгодженість моків споживача і реального провайдера',
        'Візуальна регресія — порівняння скріншотів; стабільне оточення, маскування динаміки',
        'Mutation testing — мутанти в коді; виживання мутанта = слабкий тест',
        'Mutation score краще за покриття показує якість тестів, але дорогий',
        'Property-based testing, axe, Lighthouse CI як доповнення стратегії'
      ],
      followUps: ['Як впровадити контрактні тести, якщо бекенд-команда не хоче?', 'Як зменшити кількість хибних спрацювань візуальних тестів?', 'Що таке еквівалентний мутант?']
    }
  ]
});
