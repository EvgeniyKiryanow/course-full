FE.topic('livecoding', {
  intro: `
## Live coding: як проходити раунд

**Алгоритм (вголос!):**
1. **Уточніть вимоги** — сигнатура, вхід/вихід, що робити з \`null\`, помилками, \`this\`, асинхронністю.
2. **Приклади** — 2–3 приклади вводу/виводу, включно з крайовим.
3. **План** — коротко озвучте підхід і складність *до* коду.
4. **Код** — спочатку робоча версія (brute force), потім оптимізація.
5. **Тест** — пройдіться по коду на прикладах, назвіть крайові випадки.
6. **Розширення** — будьте готові до «а тепер додайте cancel()».

## Чекліст крайових випадків

| Категорія | Що перевірити |
|---|---|
| Дані | порожній ввід, один елемент, \`null\`/\`undefined\`, \`NaN\`, \`-0\`, дублікати, циклічні посилання |
| Функції | передача \`this\` та **всіх** аргументів, повернення результату, винятки |
| Час | повторні виклики, скасування, очищення таймерів, порядок подій |
| Async | гонки (race conditions), застарілі відповіді, помилки мережі, \`AbortController\` |
| DOM | делегування подій, клавіатура, фокус, XSS (\`textContent\`, не \`innerHTML\`) |

## Шаблони, які варто знати напам'ять

\`\`\`js
// debounce: «після паузи»
function debounce(fn, ms) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

// throttle: «не частіше ніж раз на ms» + trailing-виклик
function throttle(fn, ms) {
  let timer = null, last = null;
  return function (...args) {
    if (timer) { last = [this, args]; return; }
    fn.apply(this, args);
    const tick = () => {
      if (last) { fn.apply(...last); last = null; timer = setTimeout(tick, ms); }
      else timer = null;
    };
    timer = setTimeout(tick, ms);
  };
}
\`\`\`

## Пастки, на яких «валять»

- Стрілкова функція як обгортка в debounce → втрачено \`this\`.
- \`typeof null === 'object'\`, \`typeof [] === 'object'\` — у deepClone/deepEqual перевіряйте \`Array.isArray\` та \`null\`.
- Без \`WeakMap\` для відвіданих вузлів — нескінченна рекурсія на циклах.
- \`Map\` зберігає порядок вставки — основа O(1) LRU-кешу.
- Колбеки \`then\` завжди асинхронні (мікрозадачі) — навіть для вже виконаного промісу.
- \`innerHTML\` з даними користувача → XSS; екрануйте \`& < > " '\`.
- Застарілі відповіді в автокомпліті: перевіряйте «чи це ще актуальний запит» або скасовуйте попередній.

## Що оцінює інтерв'юер

Комунікацію, структуру рішення, коректність на крайових випадках, читабельність, вміння тестувати й обговорювати компроміси (trade-offs). Ідеальний код мовчки — гірше, ніж добрий код із поясненнями.
`,
  groups: [
    { id: "approach", title: "Як проходити live coding" },
    { id: "timing", title: "Таймери: debounce, throttle, rate limit" },
    { id: "objects", title: "Утиліти для об'єктів і функцій" },
    { id: "async", title: "Асинхронні утиліти" },
    { id: "structures", title: "Класи та структури даних" },
    { id: "parsing", title: "Парсинг і рендеринг" },
    { id: "widgets", title: "UI-віджети" }
  ],
  items: [
    // ================================================================ ПІДХІД
    {
      id: 'live-approach-round', group: "approach", why: ["Так: уточнення вимог показує інженерне мислення і рятує від переписування.","Ні: мовчазне кодування — головна причина низької оцінки; інтерв'юер оцінює хід думок.","Так: план і складність до коду дають інтерв'юеру шанс скоригувати напрям.","Ні: самоперевірка — частина задачі, від Strong Middle очікують, що він сам знайде баги.","Так: прогін крайових випадків власноруч — сильний сигнал рівня."],
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Як проходити live-coding раунд',
      tags: ['soft-skills', 'process'],
      question: 'Вам дали задачу на live coding: «Реалізуйте debounce». Опишіть покроково, як ви будете діяти від моменту отримання умови до завершення. Оберіть **усі** правильні твердження.',
      choices: [
        'Спершу уточнити вимоги: сигнатуру, `this` і аргументи, leading/trailing, чи потрібен `cancel()`',
        'Одразу мовчки писати оптимальний код, а пояснити рішення наприкінці, щоб не збивати інтерв\'юера',
        'До реалізації озвучити план і складність, наприклад: «таймер у замиканні, O(1) на виклик»',
        'Тестування — робота інтерв\'юера: кандидату достатньо, щоб код запускався без синтаксичних помилок',
        'Після робочої версії самому прогнати приклади й крайові випадки: кілька інстансів, виклик після `cancel()`'
      ],
      correct: [0, 2, 4],
      hint: 'Подумайте, що інтерв\'юер хоче почути ДО того, як ви почнете писати код, і що — після.',
      answer: `
**Головне правило:** інтерв'юер оцінює не лише результат, а й *процес мислення*. Тому все робимо вголос.

1. **Уточнюю вимоги (1–3 хв).** Перефразовую задачу своїми словами й ставлю питання:
   - Яка сигнатура? Що повертає обгортка? Чи треба зберігати \`this\` і аргументи?
   - Потрібен leading/trailing виклик? \`cancel()\`? Що з результатом \`fn\`?
   - Яке середовище: браузер чи Node, чи можна використовувати lodash (зазвичай ні)?
2. **Приклади.** Пишу 1–2 сценарії у коментарях: «виклики в 0, 50, 90 мс при ms=100 → один виклик о 190 мс з аргументами останнього».
3. **Озвучую план і складність.** «Зберігаю id таймера в замиканні, на кожному виклику скасовую попередній. O(1) на виклик, O(1) пам'ять».
4. **Пишу робочу версію.** Спочатку найпростіше коректне рішення (brute force), без передчасної оптимізації. Імена змінних — зрозумілі.
5. **Тестую сам.** Проганяю код на прикладах уголос, перевіряю крайові випадки: \`this\`, кілька незалежних інстансів, повторні серії викликів, виклик після \`cancel()\`.
6. **Оптимізую / розширюю.** Пропоную покращення сам: «можна додати \`flush()\` і \`leading\`». Обговорюю trade-offs.

\`\`\`js
// Крок 2 — приклад у коментарі перед кодом
// d(1) @0, d(2) @50, d(3) @90, ms = 100  →  fn(3) @190
function debounce(fn, ms) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}
\`\`\`

**Пастки:** одразу кидатися писати код; мовчати 10 хвилин; не перевірити власний код; сперечатися з інтерв'юером замість того, щоб уточнити. Якщо застрягли — скажіть, що саме незрозуміло, і запропонуйте спрощену версію.
`,
      keyPoints: [
        'Уточнити вимоги та обмеження до написання коду',
        'Навести приклади вводу/виводу, включно з крайовими',
        'Озвучити план і складність перед реалізацією',
        'Спочатку робоче рішення, потім оптимізація',
        'Самостійно протестувати код на прикладах і крайових випадках',
        'Думати вголос протягом усього раунду'
      ],
      followUps: [
        'Що ви робите, якщо не знаєте, як розв\'язати задачу?',
        'Як ви вирішуєте, коли досить оптимізувати?',
        'Які питання ви поставите до задачі «напишіть deepClone»?'
      ]
    },
    {
      id: 'live-how-evaluated', group: "approach", why: ["Ні: процес, комунікація і якість коду важать не менше за результат.","Ні: швидкість без пояснень і перевірок — не сигнал сеньйорності.","Так: самостійні крайові випадки, складність і trade-offs відрізняють Strong Middle.","Ні: вміння прийняти підказку — плюс; впертість — мінус."],
      type: 'theory',
      level: 2,
      title: 'Як інтерв\'юер оцінює live coding',
      tags: ['soft-skills', 'process'],
      question: 'За якими критеріями інтерв\'юер оцінює кандидата на live-coding раунді? Що відрізняє рішення рівня Strong Middle від рішення рівня Junior/Middle, навіть якщо обидва «працюють»?',
      choices: [
        'Оцінюють лише фінальний результат: якщо всі тести зелені, процес і комунікація ролі не відіграють',
        'Головний сигнал Strong Middle — швидкість: хто першим написав робочий код, той отримує вищу оцінку',
        'Strong Middle сам знаходить крайові випадки й власні баги, називає складність і пояснює trade-offs',
        'Прийняти підказку інтерв\'юера — ознака слабкості, тому краще до кінця відстоювати свій початковий підхід'
      ],
      correct: 2,
      hint: 'Подумайте не лише про правильність коду: комунікація, якість, тестування, реакція на зміну вимог.',
      answer: `
Зазвичай використовують рубрику з 4–6 осей, кожна оцінюється окремо. «Код працює» — лише одна з них.

| Критерій | Що дивляться | Сигнал Strong Middle |
|---|---|---|
| **Розуміння задачі** | чи уточнив вимоги та обмеження | сам називає неочевидні випадки: \`this\`, цикли, гонки, порожній ввід |
| **Розв'язання** | підхід, складність, вибір структур даних | обирає \`Map\`/\`WeakMap\`/\`Set\` свідомо, називає O(...) без підказки |
| **Якість коду** | читабельність, імена, декомпозиція | маленькі функції (\`invoke\`, \`schedule\`), без дублювання й «магічних» чисел |
| **Коректність і тестування** | чи перевіряє сам | проганяє приклади вголос, знаходить і виправляє свої баги до інтерв'юера |
| **Комунікація** | думає вголос, реагує на підказки | пояснює *чому*, а не лише *що*; приймає підказки без захисної реакції |
| **Глибина / розширення** | follow-up питання | пропонує \`cancel()\`, \`AbortController\`, обговорює trade-offs і продакшен-нюанси |

**Різниця рівнів на прикладі debounce:**
- *Junior:* пише \`setTimeout\` без \`clearTimeout\` або губить \`this\`; на питання про leading — губиться.
- *Middle:* правильний базовий debounce, але крайові випадки знаходить лише з підказкою.
- *Strong Middle:* одразу питає про \`this\`/аргументи, сам пропонує \`cancel\`/\`flush\`, пояснює різницю з throttle, згадує використання в React (стабільна обгортка, очищення при unmount).

\`\`\`js
// Деталь, яку помічають: свідомий вибір і коментар до неочевидного
return function (...args) {          // function, а не стрілка — щоб зберегти this
  clearTimeout(timer);
  timer = setTimeout(() => fn.apply(this, args), ms);
};
\`\`\`

**Що знижує оцінку навіть при робочому коді:** мовчання, хаотичні правки «навмання», ігнорування підказок, відсутність перевірки, суперечки щодо вимог, підхід «і так зійде» до помилок і крайових випадків.

**Що рятує при неповному рішенні:** чіткий план, правильно названа складність, робоча спрощена версія та зрозуміле пояснення, як її довести до кінця.
`,
      keyPoints: [
        'Оцінюють кілька осей: розуміння задачі, розв\'язання, якість коду, тестування, комунікацію, глибину',
        'Робочий код — необхідна, але не достатня умова',
        'Сигнал рівня — самостійне виявлення крайових випадків і багів',
        'Вміння пояснити складність і trade-offs',
        'Конструктивна реакція на підказки та зміну вимог'
      ],
      followUps: [
        'Що важливіше: оптимальне рішення без пояснень чи неоптимальне з чіткою аргументацією?',
        'Як поводитись, якщо інтерв\'юер змінює вимоги посеред задачі?',
        'Чи варто писати тести/console.log під час live coding?'
      ]
    },

    // ================================================================ TIMING: debounce / throttle
    {
      id: 'live-debounce-basic', group: "timing",
      type: 'code',
      level: 2,
      interview: true,
      title: 'debounce: базова версія',
      tags: ['timers', 'closures'],
      description: `
**Завдання.** Реалізуйте \`debounce(fn, ms)\` — функцію, яка повертає «обгортку». Обгортка відкладає виклик \`fn\` до моменту, коли з останнього виклику обгортки минуло \`ms\` мілісекунд.

**Де трапляється:** пошук під час введення, автозбереження форми; класика співбесід №1.

Вимоги:
- \`fn\` викликається **один раз** після серії частих викликів — з аргументами **останнього** виклику;
- \`this\` останнього виклику передається у \`fn\`;
- кожен новий виклик «перезапускає» відлік;
- різні обгортки, створені різними викликами \`debounce\`, незалежні.

\`\`\`js
const log = debounce((q) => console.log('search', q), 300);
log('a'); log('ab'); log('abc');
// через 300 мс після останнього виклику: search abc
\`\`\`

Типове застосування: пошук під час введення, \`resize\`, автозбереження форм.

**Як це працює:** id таймера живе в замиканні. Кожен виклик скасовує попередній таймер (clearTimeout) і ставить новий, тож fn спрацює лише після паузи. Обгортка — звичайна function, щоб передати this через fn.apply(this, args).
`,
      starter: `function debounce(fn, ms) {
  // 1. Змінна для id таймера — вона «житиме» в замиканні між викликами.

  // 2. Повертаємо звичайну function (не стрілку), щоб мати правильний this.
  return function (...args) {
    // TODO: скасувати попередній таймер
    // TODO: поставити новий, який викличе fn.apply(this, args) через ms
  };
}

// Спробуйте в консолі: const d = debounce(console.log, 300); d(1); d(2); d(3);
`,
      solution: `function debounce(fn, ms) {
  let timer = null;
  // Звичайна function (не стрілкова), щоб отримати this виклику обгортки
  return function (...args) {
    clearTimeout(timer);
    // Стрілкова функція всередині бере this і args із замикання
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}
`,
      hints: [
        'Вам потрібна змінна в замиканні, яка зберігає id поточного таймера між викликами обгортки.',
        'На кожному виклику: `clearTimeout(timer)`, потім `timer = setTimeout(...)`. Так відлік починається заново.',
        'Поверніть `function (...args) { ... }` і всередині таймера викликайте `fn.apply(this, args)` через стрілкову функцію — вона збереже `this` обгортки.'
      ],
      tests: [
        { name: 'не викликає fn одразу', code: 'useFakeTimers();\nconst f = mockFn();\nconst d = debounce(f, 100);\nd();\nexpect(f).not.toHaveBeenCalled();\nadvanceTimersByTime(100);\nexpect(f).toHaveBeenCalledTimes(1);' },
        { name: 'серія викликів → один виклик з останніми аргументами', code: 'useFakeTimers();\nconst f = mockFn();\nconst d = debounce(f, 100);\nd(1); advanceTimersByTime(50);\nd(2); advanceTimersByTime(50);\nd(3, "x");\nadvanceTimersByTime(99);\nexpect(f).not.toHaveBeenCalled();\nadvanceTimersByTime(1);\nexpect(f).toHaveBeenCalledTimes(1);\nexpect(f).toHaveBeenCalledWith(3, "x");' },
        { name: 'кожен виклик перезапускає відлік', code: 'useFakeTimers();\nconst f = mockFn();\nconst d = debounce(f, 100);\nd();\nadvanceTimersByTime(90);\nd();\nadvanceTimersByTime(90);\nexpect(f).not.toHaveBeenCalled();\nadvanceTimersByTime(10);\nexpect(f).toHaveBeenCalledTimes(1);' },
        { name: 'зберігає this останнього виклику', code: 'useFakeTimers();\nconst obj = { name: "obj", save: debounce(function (v) { this.saved = this.name + ":" + v; }, 50) };\nobj.save(1);\nobj.save(2);\nadvanceTimersByTime(50);\nexpect(obj.saved).toBe("obj:2");' },
        { name: 'дві окремі серії → два виклики', code: 'useFakeTimers();\nconst f = mockFn();\nconst d = debounce(f, 100);\nd("a"); d("b");\nadvanceTimersByTime(150);\nd("c");\nadvanceTimersByTime(100);\nexpect(f).toHaveBeenCalledTimes(2);\nexpect(f.mock.calls).toEqual([["b"], ["c"]]);' },
        { name: 'різні обгортки незалежні', code: 'useFakeTimers();\nconst f1 = mockFn(), f2 = mockFn();\nconst d1 = debounce(f1, 100), d2 = debounce(f2, 100);\nd1(1);\nadvanceTimersByTime(60);\nd2(2);\nadvanceTimersByTime(40);\nexpect(f1).toHaveBeenCalledWith(1);\nexpect(f2).not.toHaveBeenCalled();\nadvanceTimersByTime(60);\nexpect(f2).toHaveBeenCalledWith(2);' }
      ],
      explanation: `
Ідентифікатор таймера живе в **замиканні** — спільному для всіх викликів однієї обгортки. Кожен виклик скасовує попередній таймер і ставить новий, тож \`fn\` спрацює лише тоді, коли виклики припинились на \`ms\` мс.

**Чому \`function\`, а не стрілка:** обгортку часто кладуть у метод об'єкта (\`obj.save = debounce(...)\`). Звичайна функція отримує \`this\` з місця виклику, а стрілкова всередині \`setTimeout\` бере його з обгортки.

**Складність:** O(1) часу на виклик, O(1) пам'яті.

**Типові помилки:**
- \`return (...args) => {...}\` — \`this\` береться з місця створення, а не виклику;
- передають аргументи **першого** виклику замість останнього;
- забувають \`clearTimeout\` → \`fn\` викликається N разів із запізненням (це вже не debounce, а «delay»);
- оголошують \`timer\` усередині обгортки — тоді він новий на кожен виклик.

**Що інтерв'юер спитає далі:**
- Додайте \`cancel()\` і \`flush()\` (наступна задача).
- Підтримайте \`leading: true\` — виклик на початку серії.
- Як повернути результат \`fn\`? (Синхронно — лише результат попереднього виклику; або повертати Promise.)
- Чим debounce відрізняється від throttle і коли що застосовувати?
- Як правильно використовувати debounce у React (\`useMemo\`/\`useRef\`, очищення при unmount)?
`
    },
    {
      id: 'live-debounce-advanced', group: "timing",
      type: 'code',
      level: 3,
      interview: true,
      title: 'debounce з leading/trailing, cancel() і flush()',
      tags: ['timers', 'closures', 'lodash'],
      description: `
**Завдання.** Реалізуйте «дорослий» \`debounce(fn, ms, options)\` у стилі lodash.

**Де трапляється:** lodash.debounce у реальних проєктах: кнопки «зберегти» (leading), cancel при розмонтуванні компонента.

\`\`\`js
function debounce(fn, ms, { leading = false, trailing = true } = {}) { ... }
\`\`\`

**Поведінка:**
- \`trailing: true\` (за замовчуванням) — виклик \`fn\` через \`ms\` після **останнього** виклику серії з її останніми аргументами і \`this\`.
- \`leading: true\` — виклик \`fn\` **одразу** на першому виклику серії (коли немає активного таймера).
- Якщо \`leading\` і \`trailing\` обидва \`true\`: одиничний виклик → \`fn\` викликається **один раз** (на leading); серія з ≥ 2 викликів → два рази (перший і останній).
- Обгортка **повертає результат останнього фактичного виклику** \`fn\` (або \`undefined\`, якщо \`fn\` ще не викликалась).

**Методи обгортки:**
- \`cancel()\` — скасовує відкладений виклик і скидає стан;
- \`flush()\` — якщо є відкладений trailing-виклик, виконує його **негайно** (і він більше не виконається за таймером); повертає результат \`fn\` (або останній результат, якщо викликати нічого).

\`\`\`js
const d = debounce(save, 100, { leading: true });
d(1); d(2); d(3); // save(1) — одразу; save(3) — через 100 мс
d.flush();        // або виконати save(3) прямо зараз
\`\`\`

**Як це працює:** Таймер означає «серія триває». leading викликає fn на першому виклику серії, trailing — по закінченню, якщо після першого були ще виклики. cancel() скидає таймер і відкладені аргументи, flush() виконує відкладений виклик негайно.
`,
      starter: `function debounce(fn, ms, { leading = false, trailing = true } = {}) {
  let timer = null;     // активний таймер = серія викликів триває
  let lastArgs = null;  // аргументи, що чекають на trailing-виклик
  let lastThis = null;
  let result;

  function debounced(...args) {
    // 1. Чи це перший виклик серії (timer === null)?
    // 2. leading і перший виклик → викликати fn одразу
    //    інакше → запам'ятати args/this для trailing
    // 3. Перезапустити таймер; по таймауту: trailing і є відкладені args → викликати fn
    // TODO
    return result;
  }

  debounced.cancel = function () {
    // TODO: скинути таймер і відкладені аргументи
  };

  debounced.flush = function () {
    // TODO: якщо є відкладений виклик — виконати його зараз і повернути результат
    return result;
  };

  return debounced;
}
`,
      solution: `function debounce(fn, ms, { leading = false, trailing = true } = {}) {
  let timer = null;     // активний таймер = «серія триває»
  let lastArgs = null;  // аргументи, що чекають на trailing-виклик
  let lastThis = null;
  let result;

  function invoke() {
    const args = lastArgs;
    const ctx = lastThis;
    lastArgs = lastThis = null; // ці аргументи «спожиті»
    result = fn.apply(ctx, args);
    return result;
  }

  function onTimeout() {
    timer = null;
    // trailing лише якщо після leading-виклику були нові виклики
    if (trailing && lastArgs) invoke();
    lastArgs = lastThis = null;
  }

  function debounced(...args) {
    const isBurstStart = timer === null;
    lastArgs = args;
    lastThis = this;
    clearTimeout(timer);
    timer = setTimeout(onTimeout, ms);
    if (isBurstStart && leading) invoke();
    return result;
  }

  debounced.cancel = function () {
    clearTimeout(timer);
    timer = null;
    lastArgs = lastThis = null;
  };

  debounced.flush = function () {
    if (timer === null) return result;
    clearTimeout(timer);
    timer = null;
    if (trailing && lastArgs) invoke();
    lastArgs = lastThis = null;
    return result;
  };

  return debounced;
}
`,
      hints: [
        'Розділіть стан на «чи триває серія» (є активний таймер) і «чи є відкладені аргументи» (`lastArgs`). Leading-виклик спрацьовує, коли серія тільки почалась.',
        'Після кожного фактичного виклику `fn` обнуляйте `lastArgs` — тоді по таймеру trailing-виклик відбудеться лише якщо після leading були ще виклики.',
        'Винесіть `invoke()` (викликає `fn` з `lastThis/lastArgs`, зберігає `result`) і `onTimeout()`. `flush()` = зупинити таймер + `onTimeout`-логіка; `cancel()` = зупинити таймер + скинути `lastArgs`.'
      ],
      tests: [
        { name: 'за замовчуванням — trailing з останніми аргументами', code: 'useFakeTimers();\nconst f = mockFn();\nconst d = debounce(f, 100);\nd(1); d(2); advanceTimersByTime(50); d(3);\nadvanceTimersByTime(99);\nexpect(f).not.toHaveBeenCalled();\nadvanceTimersByTime(1);\nexpect(f).toHaveBeenCalledTimes(1);\nexpect(f).toHaveBeenLastCalledWith(3);' },
        { name: 'leading: true, trailing: false — лише перший виклик серії', code: 'useFakeTimers();\nconst f = mockFn();\nconst d = debounce(f, 100, { leading: true, trailing: false });\nd("a");\nexpect(f).toHaveBeenCalledWith("a");\nd("b"); advanceTimersByTime(50); d("c");\nadvanceTimersByTime(200);\nexpect(f).toHaveBeenCalledTimes(1);\nd("d");\nexpect(f).toHaveBeenCalledTimes(2);\nexpect(f).toHaveBeenLastCalledWith("d");' },
        { name: 'leading + trailing: один виклик → fn один раз', code: 'useFakeTimers();\nconst f = mockFn();\nconst d = debounce(f, 100, { leading: true, trailing: true });\nd(1);\nadvanceTimersByTime(500);\nexpect(f).toHaveBeenCalledTimes(1);' },
        { name: 'leading + trailing: серія → перший і останній', code: 'useFakeTimers();\nconst f = mockFn();\nconst d = debounce(f, 100, { leading: true, trailing: true });\nd(1); d(2); d(3);\nexpect(f).toHaveBeenCalledTimes(1);\nadvanceTimersByTime(100);\nexpect(f.mock.calls).toEqual([[1], [3]]);' },
        { name: 'зберігає this і для leading, і для trailing', code: 'useFakeTimers();\nconst ctxs = [];\nconst obj = { m: debounce(function () { ctxs.push(this); }, 50, { leading: true }) };\nobj.m(); obj.m();\nadvanceTimersByTime(50);\nexpect(ctxs.length).toBe(2);\nexpect(ctxs[0]).toBe(obj);\nexpect(ctxs[1]).toBe(obj);' },
        { name: 'cancel() скасовує відкладений виклик', code: 'useFakeTimers();\nconst f = mockFn();\nconst d = debounce(f, 100);\nd(1);\nd.cancel();\nadvanceTimersByTime(200);\nexpect(f).not.toHaveBeenCalled();\nd(2);\nadvanceTimersByTime(100);\nexpect(f).toHaveBeenCalledTimes(1);\nexpect(f).toHaveBeenCalledWith(2);' },
        { name: 'cancel() скидає серію: наступний виклик знову leading', code: 'useFakeTimers();\nconst f = mockFn();\nconst d = debounce(f, 100, { leading: true, trailing: false });\nd(1);\nd.cancel();\nd(2);\nexpect(f.mock.calls).toEqual([[1], [2]]);' },
        { name: 'flush() виконує відкладений виклик негайно і повертає результат', code: 'useFakeTimers();\nconst f = mockFn((x) => x * 10);\nconst d = debounce(f, 100);\nd(1); d(2);\nexpect(d.flush()).toBe(20);\nexpect(f).toHaveBeenCalledTimes(1);\nadvanceTimersByTime(200);\nexpect(f).toHaveBeenCalledTimes(1);' },
        { name: 'flush() без відкладеного виклику не викликає fn', code: 'useFakeTimers();\nconst f = mockFn(() => 1);\nconst d = debounce(f, 100);\nexpect(d.flush()).toBeUndefined();\nd(); advanceTimersByTime(100);\nexpect(d.flush()).toBe(1);\nexpect(f).toHaveBeenCalledTimes(1);' },
        { name: 'обгортка повертає результат останнього виклику fn', code: 'useFakeTimers();\nconst d = debounce((x) => x + "!", 100, { leading: true });\nexpect(d("a")).toBe("a!");\nexpect(d("b")).toBe("a!");\nadvanceTimersByTime(100);\nexpect(d("c")).toBe("c!");' }
      ],
      explanation: `
**Ключова ідея** — два незалежні шматки стану:
- \`timer !== null\` — серія викликів триває (з останнього виклику не минуло \`ms\`);
- \`lastArgs !== null\` — є виклик, який ще не був переданий у \`fn\`.

Leading-виклик відбувається на початку серії й «споживає» аргументи (\`lastArgs = null\`). Тому для одиничного виклику з \`{ leading: true, trailing: true }\` trailing не дублює виклик — саме так поводиться lodash.

**Складність:** O(1) на виклик.

**Чому обгортка повертає «старий» результат:** \`fn\` виконується пізніше, синхронно повернути її майбутній результат неможливо. Lodash повертає результат останнього фактичного виклику — це корисно з \`leading: true\`. Альтернатива — повертати \`Promise\`, що виконається результатом trailing-виклику (але тоді треба вирішити, що робити з промісами скасованих викликів: відхиляти чи «підвішувати»).

**Типові помилки:**
- leading без перевірки «чи почалась серія» → \`fn\` викликається на кожному виклику;
- одиничний виклик з leading+trailing викликає \`fn\` двічі;
- \`flush()\` викликає \`fn\` навіть коли нічого не відкладено;
- \`cancel()\` чистить таймер, але не \`lastArgs\` → «привид» виклику при наступному flush.

**Що інтерв'юер спитає далі:**
- Додайте опцію \`maxWait\` — гарантований виклик не рідше ніж раз на \`maxWait\` (так у lodash реалізовано \`throttle\` поверх \`debounce\`).
- Додайте метод \`pending()\`.
- Як написати хук \`useDebouncedCallback\` у React, щоб обгортка не перестворювалась на кожному рендері й скасовувалась при unmount?
- Що буде, якщо \`fn\` кине виняток у leading-виклику?
`
    },
    {
      id: 'live-throttle', group: "timing",
      type: 'code',
      level: 3,
      interview: true,
      title: 'throttle з trailing-викликом',
      tags: ['timers', 'closures'],
      description: `
**Завдання.** Реалізуйте \`throttle(fn, ms)\`: обгортка викликає \`fn\` **не частіше ніж раз на \`ms\`** мілісекунд.

**Де трапляється:** обробники scroll/resize/mousemove, аналітика подій; часте питання в парі з debounce.

**Поведінка:**
1. Перший виклик (коли «вікно» неактивне) — \`fn\` викликається **одразу**, і відкривається вікно тривалістю \`ms\`.
2. Виклики всередині вікна не виконуються одразу, але **останній** із них (з його аргументами та \`this\`) виконується в кінці вікна (trailing).
3. Trailing-виклик відкриває **нове** вікно. Якщо у вікні викликів не було — по його завершенні throttle «засинає», і наступний виклик знову виконається одразу.
4. Метод \`cancel()\` скасовує відкладений виклик і закриває вікно.

\`\`\`js
const onScroll = throttle((y) => console.log(y), 100);
// виклики у 0, 30, 60, 90 мс → fn(0) у 0 мс, fn(<аргумент з 90 мс>) у 100 мс
\`\`\`

**Як це працює:** Перший виклик виконується одразу і відкриває «вікно» на ms. Виклики всередині вікна лише запам'ятовують останні аргументи. Коли вікно закривається і є відкладені аргументи — виконуємо їх і відкриваємо нове вікно.
`,
      starter: `function throttle(fn, ms) {
  let timer = null;     // активне «вікно» ms
  let lastArgs = null;  // останні аргументи, що прийшли під час вікна
  let lastThis = null;

  function startWindow() {
    // TODO: setTimeout(..., ms): якщо за вікно були виклики — виконати останній
    //       і відкрити нове вікно, інакше timer = null
  }

  function throttled(...args) {
    // 1. Вікна немає → викликати fn одразу і startWindow()
    // 2. Вікно активне → лише запам'ятати args і this
    // TODO
  }

  throttled.cancel = function () {
    // TODO: зупинити таймер і забути відкладений виклик
  };

  return throttled;
}
`,
      solution: `function throttle(fn, ms) {
  let timer = null;     // активне «вікно»
  let lastArgs = null;  // відкладений trailing-виклик
  let lastThis = null;

  function startWindow() {
    timer = setTimeout(() => {
      if (lastArgs) {
        const args = lastArgs, ctx = lastThis;
        lastArgs = lastThis = null;
        fn.apply(ctx, args);
        startWindow(); // trailing-виклик відкриває нове вікно
      } else {
        timer = null;  // вікно закрилось без викликів — «засинаємо»
      }
    }, ms);
  }

  function throttled(...args) {
    if (timer === null) {
      fn.apply(this, args);
      startWindow();
    } else {
      // запам'ятовуємо лише останній виклик у вікні
      lastArgs = args;
      lastThis = this;
    }
  }

  throttled.cancel = function () {
    clearTimeout(timer);
    timer = null;
    lastArgs = lastThis = null;
  };

  return throttled;
}
`,
      hints: [
        'Стан: чи відкрите зараз «вікно» (активний таймер) і які аргументи останнього пропущеного виклику.',
        'Якщо вікна немає — викликайте `fn` одразу і запускайте таймер на `ms`. Якщо вікно відкрите — лише запам\'ятайте `args` і `this`.',
        'Коли таймер спрацьовує: якщо є відкладені аргументи — викличте `fn` з ними і **запустіть таймер ще раз** (нове вікно); інакше обнуліть таймер.'
      ],
      tests: [
        { name: 'перший виклик виконується одразу', code: 'useFakeTimers();\nconst f = mockFn();\nconst t = throttle(f, 100);\nt(1);\nexpect(f).toHaveBeenCalledTimes(1);\nexpect(f).toHaveBeenCalledWith(1);' },
        { name: 'виклики у вікні → один trailing з останніми аргументами', code: 'useFakeTimers();\nconst f = mockFn();\nconst t = throttle(f, 100);\nt(1); advanceTimersByTime(30);\nt(2); advanceTimersByTime(30);\nt(3);\nadvanceTimersByTime(39);\nexpect(f).toHaveBeenCalledTimes(1);\nadvanceTimersByTime(1);\nexpect(f).toHaveBeenCalledTimes(2);\nexpect(f).toHaveBeenLastCalledWith(3);' },
        { name: 'trailing-виклик відкриває нове вікно', code: 'useFakeTimers();\nconst f = mockFn();\nconst t = throttle(f, 100);\nt(1); t(2);\nadvanceTimersByTime(100);\nexpect(f).toHaveBeenCalledTimes(2);\nadvanceTimersByTime(20);\nt(3);\nexpect(f).toHaveBeenCalledTimes(2);\nadvanceTimersByTime(80);\nexpect(f).toHaveBeenCalledTimes(3);\nexpect(f).toHaveBeenLastCalledWith(3);' },
        { name: 'без викликів у вікні — trailing немає, далі знову одразу', code: 'useFakeTimers();\nconst f = mockFn();\nconst t = throttle(f, 100);\nt(1);\nadvanceTimersByTime(300);\nexpect(f).toHaveBeenCalledTimes(1);\nt(2);\nexpect(f).toHaveBeenCalledTimes(2);\nexpect(f).toHaveBeenLastCalledWith(2);' },
        { name: 'безперервний потік: рівно один виклик на вікно', code: 'useFakeTimers();\nconst f = mockFn();\nconst t = throttle(f, 100);\nfor (let i = 0; i < 100; i++) { t(i); advanceTimersByTime(10); }\nexpect(f).toHaveBeenCalledTimes(11);\nexpect(f).toHaveBeenLastCalledWith(99);\nadvanceTimersByTime(500);\nexpect(f).toHaveBeenCalledTimes(11);' },
        { name: 'передає this для trailing-виклику', code: 'useFakeTimers();\nconst a = { id: "a" }, b = { id: "b" };\nconst seen = [];\nconst t = throttle(function () { seen.push(this.id); }, 50);\nt.call(a); t.call(b);\nadvanceTimersByTime(50);\nexpect(seen).toEqual(["a", "b"]);' },
        { name: 'cancel() скасовує trailing і закриває вікно', code: 'useFakeTimers();\nconst f = mockFn();\nconst t = throttle(f, 100);\nt(1); t(2);\nt.cancel();\nadvanceTimersByTime(200);\nexpect(f).toHaveBeenCalledTimes(1);\nt(3);\nexpect(f).toHaveBeenCalledTimes(2);\nexpect(f).toHaveBeenLastCalledWith(3);' }
      ],
      explanation: `
Throttle гарантує **максимальну частоту** викликів, на відміну від debounce, який чекає **паузи**. Trailing-виклик потрібен, щоб не втратити фінальний стан: при скролі останнє значення \`scrollY\` важливіше за проміжні.

Чому trailing відкриває нове вікно: інакше після trailing-виклику наступний виклик виконався б одразу, і два виклики могли б статися з інтервалом < \`ms\`.

**Складність:** O(1) на виклик.

**Альтернативна реалізація — через мітки часу:**
\`\`\`js
function throttle(fn, ms) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= ms) { lastTime = now; fn.apply(this, args); }
  };
}
\`\`\`
Вона простіша, але **губить** останній виклик (немає trailing). Комбінований підхід (мітка часу + таймер на залишок \`ms - (now - lastTime)\`) теж поширений.

**Типові помилки:**
- немає trailing → фінальний стан втрачено (наприклад, позиція скролу «застрягає»);
- trailing з аргументами **першого** пропущеного виклику, а не останнього;
- після trailing не відкривається нове вікно → частота перевищує ліміт;
- втрата \`this\`.

**Що інтерв'юер спитає далі:**
- Додайте опції \`{ leading, trailing }\` (як у lodash).
- Як зробити throttle через \`requestAnimationFrame\` — і чим він кращий для анімацій/скролу?
- Як реалізувати throttle через debounce з \`maxWait\`?
- Коли throttle, а коли debounce: scroll/resize/mousemove vs пошук/автозбереження.
`
    },
    {
      id: 'live-quiz-debounce-vs-throttle', group: "timing", why: ["Ні: throttle з trailing дає ще й фінальний виклик після вікна.","Так: debounce — 1 раз після паузи; throttle — на 0, 120 і trailing після 180.","Ні: debounce не викликає функцію на кожен виклик — лише після паузи.","Ні: навпаки — throttle рідшає виклики, а не повторює кожен."],
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Скільки разів спрацює debounce і throttle?',
      tags: ['timers'],
      question: `
Обгортку викликають **7 разів** з інтервалом 30 мс: у моменти \`0, 30, 60, 90, 120, 150, 180\` мс. Потім викликів немає.

\`\`\`js
const d = debounce(fn1, 100);
const t = throttle(fn2, 100); // leading + trailing, trailing відкриває нове вікно
\`\`\`

Скільки разів загалом буде викликано \`fn1\` і \`fn2\`?
`,
      options: [
        'debounce — 1, throttle — 2',
        'debounce — 1, throttle — 3',
        'debounce — 7, throttle — 3',
        'debounce — 2, throttle — 7'
      ],
      answer: 1,
      hint: 'Для debounce важливо, чи була десь пауза ≥ 100 мс. Для throttle розкладіть виклики по вікнах [0, 100), [100, 200), …',
      explanation: `
**debounce:** інтервал між викликами (30 мс) завжди менший за 100 мс, тож таймер щоразу перезапускається. \`fn1\` спрацює **один раз** — о 280 мс (180 + 100) з аргументами останнього виклику.

**throttle:**
1. 0 мс — leading-виклик, відкривається вікно до 100 мс.
2. Виклики 30, 60, 90 потрапляють у вікно; запам'ятовується останній (90). О 100 мс — trailing-виклик, нове вікно до 200 мс.
3. Виклики 120, 150, 180 — у вікні; о 200 мс trailing з аргументом від 180, нове вікно до 300 мс.
4. У вікні [200, 300) викликів немає — throttle «засинає».

Разом **3** виклики \`fn2\`.

Варіант «throttle — 2» — типова помилка, якщо забути, що trailing-виклик відкриває нове вікно (або забути другий trailing). «debounce — 7» — це поведінка звичайної затримки без \`clearTimeout\`. «throttle — 7» означає, що обмеження частоти взагалі не працює.
`
    },
    {
      id: 'live-debounce-throttle-followups', group: "timing", why: ["Ні: описано навпаки — це debounce чекає паузу, а throttle обмежує частоту.","Так: пошук — debounce, scroll/resize — throttle або rAF.","Ні: у компоненті debounce створюється наново на кожен рендер — таймер губиться.","Так: rAF-throttle синхронізує виклики з кадрами рендерингу.","Ні: debounce зменшує кількість запитів, але гонку відповідей прибирає лише abort/перевірка актуальності."],
      type: 'theory',
      level: 3,
      title: 'debounce vs throttle: follow-up питання',
      tags: ['timers', 'performance'],
      question: 'Ви реалізували debounce і throttle. Поясніть різницю, де що застосовувати, що таке leading/trailing, як зробити throttle через requestAnimationFrame і які пастки є при використанні в React. Оберіть **усі** правильні твердження.',
      choices: [
        'Throttle викликає `fn` лише після того, як виклики припинились на `ms`, а debounce — рівномірно',
        'Для пошуку під час введення пасує debounce, а для scroll/resize/mousemove — throttle або rAF',
        '`const d = debounce(fn, 300)` у тілі компонента безпечний: таймер зберігається між рендерами',
        'Throttle через `requestAnimationFrame` кличе `fn` не частіше разу на кадр, синхронно з рендером',
        'Debounce пошуку сам по собі усуває гонку відповідей, тож `AbortController` тут зайвий'
      ],
      correct: [1, 3],
      hint: 'Розкажіть про «паузу» vs «частоту», конкретні події браузера, rAF та життєвий цикл компонента.',
      answer: `
**Різниця:**
- **debounce** — виконати *після паузи*: \`fn\` спрацює, коли виклики припинились на \`ms\`. Безперервний потік викликів → жодного виклику (без \`maxWait\`).
- **throttle** — виконати *не частіше ніж раз на \`ms\`*: при безперервному потоці \`fn\` викликається рівномірно.

| Задача | Що обрати |
|---|---|
| пошук під час введення, валідація, автозбереження | debounce (trailing) |
| запобігання подвійному кліку «Оплатити» | debounce з \`leading: true, trailing: false\` |
| scroll, resize, mousemove, drag | throttle або rAF |
| аналітика «користувач скролить» | throttle |

**leading / trailing:** leading — виклик на початку серії (миттєвий відгук), trailing — в кінці (фінальний стан). Обидва — перший і останній виклик серії; у lodash \`throttle\` — це \`debounce\` з \`maxWait = wait\` і \`leading: true\`.

**throttle через requestAnimationFrame** — не частіше одного разу за кадр (~16.7 мс на 60 Гц), синхронізовано з рендерингом, автоматично «пауза» у фонових вкладках:
\`\`\`js
function rafThrottle(fn) {
  let frame = null, lastArgs;
  const wrapped = function (...args) {
    lastArgs = args;
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      fn.apply(this, lastArgs);
    });
  };
  wrapped.cancel = () => { cancelAnimationFrame(frame); frame = null; };
  return wrapped;
}
\`\`\`

**Пастки в React:**
- \`const d = debounce(...)\` у тілі компонента створює **нову** обгортку на кожному рендері — таймер втрачається. Рішення: \`useMemo\`/\`useRef\` або хук \`useDebouncedCallback\`.
- Замикання на застарілий стан (stale closure) — зберігати актуальний колбек у \`ref\`.
- Скасовувати (\`cancel()\`) при unmount, інакше \`setState\` на розмонтованому компоненті / витік.
- Debounce **значення** (\`useDebouncedValue\`) часто простіший за debounce колбека.

**Ще нюанси:** debounce не скасовує вже відправлені запити — для пошуку потрібно ще й ігнорувати застарілі відповіді або \`AbortController\`. Для обробників \`scroll\`/\`touchmove\` додайте \`{ passive: true }\`.
`,
      keyPoints: [
        'debounce — після паузи; throttle — не частіше ніж раз на ms',
        'Приклади застосування: пошук/автозбереження vs scroll/resize/mousemove',
        'leading і trailing: що дають і як поєднуються',
        'rAF-throttle: раз на кадр, синхронізація з рендерингом',
        'React: стабільна обгортка (useMemo/useRef), cancel при unmount, stale closure'
      ],
      followUps: [
        'Як реалізувати throttle через debounce з maxWait?',
        'Чому debounce не вирішує проблему гонки відповідей у пошуку?',
        'Що відбувається з rAF у фоновій вкладці?'
      ]
    },
    {
      id: 'live-interval-drift', group: "timing",
      type: 'code',
      level: 3,
      title: 'setInterval через setTimeout з корекцією дрейфу',
      tags: ['timers', 'event-loop'],
      description: `
**Завдання.** Реалізуйте \`createInterval(fn, ms)\` — аналог \`setInterval\`, але **лише на \`setTimeout\`** (використовувати \`setInterval\` заборонено).

**Де трапляється:** таймери, годинники, polling, де setInterval «пливе» під навантаженням.

- \`fn\` викликається кожні \`ms\` мс і отримує номер тіку: \`1, 2, 3, …\`;
- повертається об'єкт \`{ stop() }\`; \`stop()\` можна викликати й зсередини \`fn\`;
- **корекція дрейфу (drift):** реальні таймери спрацьовують із запізненням (зайнятий event loop). Наївний рекурсивний \`setTimeout(tick, ms)\` накопичує це запізнення: тіки «з'їжджають» усе далі. Ваша реалізація має планувати кожен тік відносно **часу старту**: тік *n* — якомога ближче до \`start + n * ms\`. Поточний час беріть з \`Date.now()\`.

\`\`\`js
const timer = createInterval((n) => console.log('tick', n), 1000);
// ...
timer.stop();
\`\`\`

> У тестах запізнення event loop імітується обгорткою над \`setTimeout\`, яка додає +30 мс до кожної затримки.

**Як це працює:** Кожен наступний setTimeout рахуємо від стартового часу: очікуваний момент = start + (tick + 1) * ms, затримка = очікуваний − Date.now(). Так похибка не накопичується.
`,
      starter: `function createInterval(fn, ms) {
  const start = Date.now();
  let tick = 0;
  let timer = null;
  let stopped = false;

  function schedule() {
    // TODO: очікуваний момент = start + (tick + 1) * ms
    //       затримка = max(0, очікуваний − Date.now()); setTimeout(run, затримка)
  }

  function run() {
    // TODO: tick++, fn(tick), і якщо не зупинено — schedule()
  }

  // TODO: запустити перший schedule()

  return {
    stop() {
      // TODO: stopped = true і clearTimeout
    }
  };
}
`,
      solution: `function createInterval(fn, ms) {
  const start = Date.now();
  let tick = 0;
  let timer = null;
  let stopped = false;

  function schedule() {
    // плануємо відносно часу старту, а не «від зараз» — помилки не накопичуються
    const expected = start + (tick + 1) * ms;
    const delay = Math.max(0, expected - Date.now());
    timer = setTimeout(run, delay);
  }

  function run() {
    tick++;
    fn(tick);
    if (!stopped) schedule(); // fn могла викликати stop()
  }

  schedule();

  return {
    stop() {
      stopped = true;
      clearTimeout(timer);
    },
  };
}
`,
      hints: [
        'Запам\'ятайте `start = Date.now()` і лічильник тіків. Коли має статися тік номер n?',
        'Затримка до наступного тіку = `start + (tick + 1) * ms - Date.now()` (не менше 0). Якщо попередній тік запізнився, наступна затримка буде меншою.',
        'Прапорець `stopped` перевіряйте **після** виклику `fn`, перш ніж планувати наступний тік, — тоді `stop()` зсередини `fn` спрацює.'
      ],
      tests: [
        { name: 'викликає fn кожні ms з номером тіку', code: 'useFakeTimers();\nconst f = mockFn();\ncreateInterval(f, 100);\nadvanceTimersByTime(99);\nexpect(f).not.toHaveBeenCalled();\nadvanceTimersByTime(1);\nexpect(f).toHaveBeenCalledWith(1);\nadvanceTimersByTime(200);\nexpect(f.mock.calls).toEqual([[1], [2], [3]]);' },
        { name: 'не використовує setInterval', code: 'useFakeTimers();\nglobalThis.setInterval = () => { throw new Error("setInterval заборонено"); };\nconst f = mockFn();\nconst t = createInterval(f, 50);\nadvanceTimersByTime(500);\nexpect(f).toHaveBeenCalledTimes(10);\nt.stop();' },
        { name: 'stop() зупиняє тіки', code: 'useFakeTimers();\nconst f = mockFn();\nconst t = createInterval(f, 100);\nadvanceTimersByTime(250);\nt.stop();\nadvanceTimersByTime(1000);\nexpect(f).toHaveBeenCalledTimes(2);\nexpect(getTimerCount()).toBe(0);' },
        { name: 'stop() можна викликати зсередини fn', code: 'useFakeTimers();\nconst ticks = [];\nconst t = createInterval((n) => { ticks.push(n); if (n === 3) t.stop(); }, 10);\nadvanceTimersByTime(1000);\nexpect(ticks).toEqual([1, 2, 3]);' },
        { name: 'корекція дрейфу: запізнення не накопичується', code: 'useFakeTimers();\nconst origSetTimeout = setTimeout;\nglobalThis.setTimeout = (cb, ms) => origSetTimeout(cb, ms + 30); // «повільний» event loop\nconst times = [];\nconst t = createInterval(() => times.push(Date.now()), 100);\nadvanceTimersByTime(1000);\nt.stop();\nexpect(times.slice(0, 3)).toEqual([130, 230, 330]);\nexpect(times.length).toBe(9);' },
        { name: 'кілька інтервалів незалежні', code: 'useFakeTimers();\nconst a = mockFn(), b = mockFn();\nconst ta = createInterval(a, 100);\nconst tb = createInterval(b, 30);\nadvanceTimersByTime(300);\nexpect(a).toHaveBeenCalledTimes(3);\nexpect(b).toHaveBeenCalledTimes(10);\nta.stop(); tb.stop();' }
      ],
      explanation: `
**Чому наївний варіант дрейфує:**
\`\`\`js
function naive(fn, ms) {
  setTimeout(function tick() { fn(); setTimeout(tick, ms); }, ms);
}
\`\`\`
Кожна затримка відраховується від моменту фактичного спрацювання попереднього тіку. Якщо event loop щоразу запізнюється на 30 мс, тіки будуть о 130, 260, 390… — помилка росте лінійно. Наша версія планує тік *n* на \`start + n * ms\`, тож запізнення не накопичується: 130, 230, 330…

**Складність:** O(1) на тік.

**Нюанси:**
- Якщо \`fn\` виконувалась довше за \`ms\`, \`delay\` стає 0 і тіки йдуть «пачкою», доганяючи графік. Альтернатива — пропускати пропущені тіки: \`tick = Math.floor((Date.now() - start) / ms)\`.
- Якщо \`fn\` кидає виняток, наступний тік не заплановано. Можна обгорнути в \`try/finally\`.
- Справжній \`setInterval\` теж не накопичує дрейф так сильно, але в неактивних вкладках браузер тротлить таймери (мінімум ~1 с), а вкладені таймери отримують мінімальну затримку 4 мс.
- Для анімацій краще \`requestAnimationFrame\` + обчислення стану від \`performance.now()\`.

**Що інтерв'юер спитає далі:**
- Додайте \`pause()\` / \`resume()\` (зберігайте залишок часу до наступного тіку).
- Чому \`setInterval\` може «склеювати» виклики, якщо колбек довгий?
- Чим \`Date.now()\` відрізняється від \`performance.now()\` (монотонність)?
- Як зробити точний таймер зворотного відліку, що не «відстає» у фоновій вкладці?
`
    },
    {
      id: 'live-token-bucket', group: "timing",
      type: 'code',
      level: 3,
      title: 'Rate limiter: token bucket',
      tags: ['timers', 'classes', 'system-design'],
      description: `
**Завдання.** Реалізуйте клас \`TokenBucket\` — класичний алгоритм обмеження частоти запитів (rate limiting).

**Де трапляється:** обмеження частоти запитів до API на клієнті, захист від спаму кліками.

\`\`\`js
const bucket = new TokenBucket(capacity, refillPerSecond);
\`\`\`

- «Відро» вміщує щонайбільше \`capacity\` токенів і на старті **повне**.
- Токени поповнюються **рівномірно**: \`refillPerSecond\` токенів за секунду (дробові частки накопичуються). Більше за \`capacity\` не накопичується.
- \`tryConsume(count = 1)\` — якщо токенів достатньо, забирає \`count\` і повертає \`true\`; інакше нічого не забирає і повертає \`false\`.
- \`getTokens()\` — поточна кількість токенів (може бути дробовою).
- \`waitTime(count = 1)\` — скільки мілісекунд (округлення вгору) треба почекати, щоб \`tryConsume(count)\` став можливим; \`0\`, якщо вже можна.
- Якщо \`count <= 0\` або \`count > capacity\` — \`tryConsume\`/\`waitTime\` кидають \`RangeError\`.

Час беріть з \`Date.now()\`. Не використовуйте таймери: поповнення можна обчислювати «ліниво» в момент звернення.

\`\`\`js
const b = new TokenBucket(3, 2);   // 3 токени, +2 за секунду
b.tryConsume(); b.tryConsume(); b.tryConsume(); // true ×3
b.tryConsume();                    // false
// через 500 мс
b.tryConsume();                    // true
\`\`\`

**Як це працює:** Токени поповнюються пропорційно часу, що минув: при кожному зверненні додаємо elapsed * rate / 1000, але не більше capacity. Запит проходить, якщо токенів вистачає, і віднімає їх.
`,
      starter: `class TokenBucket {
  constructor(capacity, refillPerSecond) {
    // TODO: зберегти capacity і швидкість; спочатку відро повне; запам'ятати Date.now()
  }

  // Допоміжний: додати токени за час, що минув (не більше capacity)
  refill() {
    // TODO
  }

  tryConsume(count = 1) {
    // TODO: refill(); якщо токенів >= count — відняти і повернути true, інакше false
  }

  getTokens() {
    // TODO: refill() і повернути поточну кількість
  }
}
`,
      solution: `class TokenBucket {
  constructor(capacity, refillPerSecond) {
    this.capacity = capacity;
    this.refillPerSecond = refillPerSecond;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  // «Ліниве» поповнення: додаємо токени за час, що минув з останнього звернення
  #refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + (elapsed * this.refillPerSecond) / 1000);
      this.lastRefill = now;
    }
  }

  #validate(count) {
    if (!(count > 0) || count > this.capacity) {
      throw new RangeError('Invalid token count: ' + count);
    }
  }

  tryConsume(count = 1) {
    this.#validate(count);
    this.#refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }

  getTokens() {
    this.#refill();
    return this.tokens;
  }

  waitTime(count = 1) {
    this.#validate(count);
    this.#refill();
    const missing = count - this.tokens;
    return missing <= 0 ? 0 : Math.ceil((missing * 1000) / this.refillPerSecond);
  }
}
`,
      hints: [
        'Не потрібні таймери: зберігайте кількість токенів і час останнього поповнення. При кожному зверненні дораховуйте, скільки токенів «натекло».',
        'Поповнення: `tokens = Math.min(capacity, tokens + elapsedMs * refillPerSecond / 1000)`, потім `lastRefill = now`. Дробові частки не відкидайте!',
        '`waitTime`: бракує `missing = count - tokens` токенів; час = `Math.ceil(missing * 1000 / refillPerSecond)`.'
      ],
      tests: [
        { name: 'на старті відро повне', code: 'useFakeTimers();\nconst b = new TokenBucket(3, 1);\nexpect(b.tryConsume()).toBe(true);\nexpect(b.tryConsume()).toBe(true);\nexpect(b.tryConsume()).toBe(true);\nexpect(b.tryConsume()).toBe(false);' },
        { name: 'токени поповнюються з часом', code: 'useFakeTimers();\nconst b = new TokenBucket(3, 2);\nb.tryConsume(3);\nexpect(b.tryConsume()).toBe(false);\nadvanceTimersByTime(500);\nexpect(b.tryConsume()).toBe(true);\nexpect(b.tryConsume()).toBe(false);' },
        { name: 'не накопичує більше за capacity', code: 'useFakeTimers();\nconst b = new TokenBucket(3, 10);\nb.tryConsume(2);\nadvanceTimersByTime(60000);\nexpect(b.getTokens()).toBe(3);\nexpect(b.tryConsume(3)).toBe(true);\nexpect(b.tryConsume()).toBe(false);' },
        { name: 'дробові частки накопичуються між зверненнями', code: 'useFakeTimers();\nconst b = new TokenBucket(1, 1);\nb.tryConsume();\nadvanceTimersByTime(250);\nexpect(b.tryConsume()).toBe(false);\nadvanceTimersByTime(250);\nexpect(b.tryConsume()).toBe(false);\nexpect(b.getTokens()).toBeCloseTo(0.5, 5);\nadvanceTimersByTime(500);\nexpect(b.tryConsume()).toBe(true);' },
        { name: 'невдалий tryConsume(n) нічого не забирає', code: 'useFakeTimers();\nconst b = new TokenBucket(5, 1);\nb.tryConsume(3);\nexpect(b.tryConsume(3)).toBe(false);\nexpect(b.getTokens()).toBe(2);\nexpect(b.tryConsume(2)).toBe(true);' },
        { name: 'waitTime рахує час до доступності', code: 'useFakeTimers();\nconst b = new TokenBucket(2, 4);\nexpect(b.waitTime()).toBe(0);\nb.tryConsume(2);\nexpect(b.waitTime()).toBe(250);\nexpect(b.waitTime(2)).toBe(500);\nadvanceTimersByTime(125);\nexpect(b.waitTime()).toBe(125);\nadvanceTimersByTime(125);\nexpect(b.waitTime()).toBe(0);' },
        { name: 'некоректний count → RangeError', code: 'useFakeTimers();\nconst b = new TokenBucket(2, 1);\nexpect(() => b.tryConsume(3)).toThrow(RangeError);\nexpect(() => b.tryConsume(0)).toThrow(RangeError);\nexpect(() => b.waitTime(-1)).toThrow(RangeError);' },
        { name: 'незалежні інстанси', code: 'useFakeTimers();\nconst a = new TokenBucket(1, 1), b = new TokenBucket(1, 1);\nexpect(a.tryConsume()).toBe(true);\nexpect(b.tryConsume()).toBe(true);\nexpect(a.tryConsume()).toBe(false);' }
      ],
      explanation: `
**Token bucket** дозволяє короткі «сплески» (до \`capacity\` запитів одразу), але обмежує середню швидкість значенням \`refillPerSecond\`. Його використовують API-гейтвеї, клієнтські SDK (щоб не отримати 429), обмеження кліків/аналітики.

**Ліниве поповнення** замість \`setInterval\`: не витрачаються ресурси, немає похибки таймерів, стан обчислюється точно в момент звернення. Складність усіх методів — **O(1)**, пам'ять O(1).

**Типові помилки:**
- округлення токенів униз з оновленням \`lastRefill\` → дробові частки губляться, і при частих зверненнях відро **ніколи** не наповнюється (тест «дробові частки» саме про це);
- часткове списання при невдалому \`tryConsume(n)\`;
- \`setInterval\` для поповнення — працює, але дає дрейф і витоки, якщо забути \`clearInterval\`.

**Альтернативи:**
| Алгоритм | Ідея | Компроміс |
|---|---|---|
| Fixed window | лічильник на хвилину | сплеск ×2 на межі вікон |
| Sliding window log | зберігати мітки часу запитів | точний, але O(n) пам'яті |
| Leaky bucket | черга, що «витікає» рівномірно | згладжує, але додає затримку |
| Token bucket | токени поповнюються | дозволяє контрольовані сплески |

**Що інтерв'юер спитає далі:**
- Напишіть обгортку \`rateLimit(fn, bucket)\`, яка ставить виклики в чергу і виконує їх, коли з'являються токени (через \`waitTime\` + \`setTimeout\`).
- Як зробити ліміт на кожного користувача (Map ключ → bucket) і не допустити витоку пам'яті?
- Чому \`Date.now()\` може «стрибнути» назад (зміна системного часу) і як \`performance.now()\` це вирішує?
- Як це працює в розподіленій системі (Redis, атомарні операції)?
`
    },

    // ================================================================ OBJECT UTILITIES
    {
      id: 'live-classnames', group: "objects",
      type: 'code',
      level: 2,
      interview: true,
      title: 'Утиліта classNames',
      tags: ['strings', 'recursion', 'react'],
      description: `
**Завдання.** Реалізуйте \`classNames(...args)\` — аналог популярної бібліотеки \`classnames\`/\`clsx\`, що збирає рядок CSS-класів.

**Де трапляється:** збирання CSS-класів у компонентах (бібліотеки classnames/clsx).

Правила для кожного аргументу:
- **рядок** або **число** — додається як є (якщо truthy);
- **об'єкт** — додаються **власні** ключі, значення яких truthy;
- **масив** — обробляється рекурсивно за тими самими правилами (будь-яка вкладеність);
- falsy-значення (\`null\`, \`undefined\`, \`false\`, \`0\`, \`''\`) — ігноруються.

Класи розділяються **одним** пробілом, без зайвих пробілів на початку/в кінці.

\`\`\`js
classNames('btn', { 'btn-primary': true, disabled: false }, ['lg', ['rounded']]);
// 'btn btn-primary lg rounded'
classNames(null, false, 'a', 0, '', ['b', { c: 1 }]); // 'a b c'
\`\`\`

**Як це працює:** Пройдіть по аргументах: рядки й числа додаються як є, масив обробляється рекурсивно, в об'єкті беруться ключі з truthy-значенням. Falsy-аргументи пропускаються. Результат — join(' ').
`,
      starter: `function classNames(...args) {
  const classes = [];
  for (const arg of args) {
    // 1. falsy → пропустити
    // 2. рядок або число → додати
    // 3. масив → classNames(...arg) і додати, якщо не порожньо
    // 4. об'єкт → додати ключі з truthy-значенням
    // TODO
  }
  return classes.join(' ');
}

// classNames('btn', { active: true, disabled: false }, ['lg']) → 'btn active lg'
`,
      solution: `function classNames(...args) {
  const classes = [];
  for (const arg of args) {
    if (!arg) continue; // null, undefined, false, 0, ''
    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      const inner = classNames(...arg);
      if (inner) classes.push(inner);
    } else if (typeof arg === 'object') {
      // Object.keys — лише власні перелічувані ключі, без успадкованих
      for (const key of Object.keys(arg)) {
        if (arg[key]) classes.push(key);
      }
    }
  }
  return classes.join(' ');
}
`,
      hints: [
        'Пройдіться по аргументах і збирайте класи в масив, а наприкінці зробіть `join(\' \')` — так не буде зайвих пробілів.',
        'Для кожного аргументу визначте тип: falsy → пропустити, рядок/число → додати, масив → рекурсивний виклик, об\'єкт → перебрати `Object.keys`.',
        'Для масиву: `const inner = classNames(...arg); if (inner) classes.push(inner);` — перевірка не дасть додати порожній рядок.'
      ],
      tests: [
        "expect(classNames('a', 'b', 'c')).toBe('a b c')",
        { name: 'ігнорує falsy-значення', code: "expect(classNames('a', null, undefined, false, 0, '', 'b')).toBe('a b');" },
        { name: 'об\'єкти: лише truthy-ключі', code: "expect(classNames({ a: true, b: false, c: 1, d: null, e: 'yes' })).toBe('a c e');" },
        { name: 'вкладені масиви будь-якої глибини', code: "expect(classNames('a', ['b', { c: true, d: false }, ['e', [null, 'f']]])).toBe('a b c e f');" },
        { name: 'змішані аргументи', code: "expect(classNames('btn', { 'btn-active': true, 'btn-disabled': false }, 'lg')).toBe('btn btn-active lg');" },
        { name: 'числа: 0 ігнорується, інші додаються', code: "expect(classNames(1, 0, 'x', 42)).toBe('1 x 42');" },
        { name: 'без аргументів і з порожніми масивами → порожній рядок', code: "expect(classNames()).toBe('');\nexpect(classNames([], [[]], {}, null)).toBe('');\nexpect(classNames('a', [], 'b')).toBe('a b');" },
        { name: 'ігнорує успадковані ключі', code: "const obj = Object.create({ inherited: true });\nobj.own = true;\nexpect(classNames(obj)).toBe('own');" }
      ],
      explanation: `
Рішення — рекурсивний обхід аргументів з накопиченням у масив і фінальним \`join(' ')\`. Складність — **O(n)**, де n — загальна кількість елементів у всіх вкладених структурах.

**Чому \`Object.keys\`, а не \`for...in\`:** \`for...in\` перебирає й **успадковані** перелічувані властивості — якщо хтось додав щось у прототип, у класи потрапить сміття.

**Типові помилки:**
- конкатенація рядків з пробілами → \`' a  b '\`, подвійні пробіли від порожніх елементів;
- \`typeof null === 'object'\` → падіння на \`Object.keys(null)\` (рятує ранній \`if (!arg) continue\`);
- масиви теж \`typeof 'object'\` — перевіряйте \`Array.isArray\` **до** гілки для об'єктів;
- забувають про числа або додають \`0\`.

**Що інтерв'юер спитає далі:**
- Додайте дедуплікацію класів (\`classnames/dedupe\`): пізніший об'єкт \`{ a: false }\` має **прибирати** раніше доданий \`a\` → потрібна \`Map\`/\`Set\` з порядком.
- Підтримайте об'єкти з власним \`toString\` (як в оригінальній бібліотеці).
- Як типізувати це в TypeScript (\`ClassValue = string | number | null | undefined | boolean | ClassDictionary | ClassValue[]\`)?
- Чому \`clsx\` швидша за \`classnames\` (цикли замість \`arguments\`/рекурсії зі spread)?
`
    },
    {
      id: 'live-deep-clone', group: "objects",
      type: 'code',
      level: 3,
      interview: true,
      title: 'deepClone: Date, RegExp, Map, Set, цикли, прототипи',
      tags: ['objects', 'recursion', 'weakmap'],
      description: `
**Завдання.** Реалізуйте \`deepClone(value)\` — глибоке копіювання **без** \`structuredClone\` і \`JSON\`.

**Де трапляється:** копіювання стану форми/стору перед зміною; класика співбесід.

Вимоги:
- примітиви повертаються як є; **функції** — за посиланням (не копіюються);
- масиви та об'єкти копіюються рекурсивно; довжина масиву (включно з «дірками») зберігається;
- \`Date\` → новий \`Date\` з тим самим часом; \`RegExp\` → новий з тими самими \`source\`, \`flags\` і \`lastIndex\`;
- \`Map\` і \`Set\` → нові колекції з **глибоко скопійованими значеннями** (ключі \`Map\` можна лишити за посиланням);
- **циклічні посилання** підтримуються, і структура спільних посилань зберігається (якщо \`a.x === a.y\`, то й у копії \`copy.x === copy.y\`);
- **прототип** зберігається: копія екземпляра класу — теж екземпляр цього класу;
- копіюються власні перелічувані властивості, включно з ключами-символами.

\`\`\`js
const user = { name: 'Ann', born: new Date(2000, 0, 1), tags: new Set(['a']) };
user.self = user;
const copy = deepClone(user);
copy.self === copy;           // true
copy.born !== user.born;      // true
\`\`\`

**Як це працює:** Рекурсія по структурі + WeakMap «оригінал → копія». Копію реєструємо в WeakMap ДО обходу дітей — тоді цикл посилань поверне вже створену копію. Спецтипи (Date, RegExp, Map, Set) копіюємо своїми конструкторами, прототип — через Object.create(Object.getPrototypeOf(value)).
`,
      starter: `function deepClone(value, seen = new WeakMap()) {
  // 1. Примітиви (і null) повертаємо як є
  // 2. Уже копіювали цей об'єкт? → повернути копію з seen (цикли)
  // 3. Date, RegExp → новий екземпляр з тим самим значенням
  // 4. Map, Set → нова колекція; ЗАРЕЄСТРУВАТИ в seen ДО рекурсії
  // 5. Масив / об'єкт → копія з тим самим прототипом,
  //    зареєструвати в seen, скопіювати власні ключі рекурсивно
  // TODO
}
`,
      solution: `function deepClone(value, seen = new WeakMap()) {
  // примітиви та функції повертаємо як є
  if (value === null || typeof value !== 'object') return value;
  // вже копіювали цей об'єкт → цикл або спільне посилання
  if (seen.has(value)) return seen.get(value);

  if (value instanceof Date) return new Date(value.getTime());
  if (value instanceof RegExp) {
    const re = new RegExp(value.source, value.flags);
    re.lastIndex = value.lastIndex;
    return re;
  }
  if (value instanceof Map) {
    const copy = new Map();
    seen.set(value, copy); // реєструємо ДО рекурсії — інакше цикл не зупиниться
    value.forEach((v, k) => copy.set(k, deepClone(v, seen)));
    return copy;
  }
  if (value instanceof Set) {
    const copy = new Set();
    seen.set(value, copy);
    value.forEach((v) => copy.add(deepClone(v, seen)));
    return copy;
  }

  const copy = Array.isArray(value)
    ? new Array(value.length)
    : Object.create(Object.getPrototypeOf(value));
  seen.set(value, copy);

  // Reflect.ownKeys — і рядкові ключі, і символи
  for (const key of Reflect.ownKeys(value)) {
    const desc = Object.getOwnPropertyDescriptor(value, key);
    if (!desc.enumerable) continue; // пропускаємо length масиву та приховані поля
    copy[key] = deepClone(value[key], seen);
  }
  return copy;
}
`,
      hints: [
        'Почніть з бази рекурсії: якщо `value` не об\'єкт (або `null`) — повертайте його. Далі розберіть спеціальні типи (`Date`, `RegExp`, `Map`, `Set`) через `instanceof`.',
        'Для циклів передавайте в рекурсію `WeakMap` «оригінал → копія». Додавайте копію в мапу **до** рекурсивного копіювання вмісту.',
        'Для звичайних об\'єктів створюйте копію через `Object.create(Object.getPrototypeOf(value))`, для масивів — `new Array(value.length)`; ключі беріть з `Reflect.ownKeys` і фільтруйте неперелічувані.'
      ],
      tests: [
        { name: 'примітиви і функції повертаються як є', code: "expect(deepClone(42)).toBe(42);\nexpect(deepClone('s')).toBe('s');\nexpect(deepClone(null)).toBe(null);\nexpect(deepClone(undefined)).toBe(undefined);\nconst fn = () => 1;\nexpect(deepClone(fn)).toBe(fn);" },
        { name: 'вкладені об\'єкти і масиви копіюються незалежно', code: "const src = { a: 1, b: { c: [1, 2, { d: 3 }] } };\nconst copy = deepClone(src);\nexpect(copy).toEqual(src);\nexpect(copy).not.toBe(src);\nexpect(copy.b).not.toBe(src.b);\ncopy.b.c[2].d = 99;\ncopy.b.c.push(4);\nexpect(src.b.c).toEqual([1, 2, { d: 3 }]);" },
        { name: 'зберігає довжину масиву з «дірками»', code: "const arr = new Array(3);\narr[1] = 'x';\nconst copy = deepClone(arr);\nexpect(copy.length).toBe(3);\nexpect(copy[1]).toBe('x');\nexpect(Array.isArray(copy)).toBe(true);" },
        { name: 'Date і RegExp — нові екземпляри', code: "const src = { d: new Date(2020, 1, 2), re: /ab+c/gi };\nsrc.re.lastIndex = 2;\nconst copy = deepClone(src);\nexpect(copy.d).not.toBe(src.d);\nexpect(copy.d instanceof Date).toBe(true);\nexpect(copy.d.getTime()).toBe(src.d.getTime());\nexpect(copy.re).not.toBe(src.re);\nexpect(copy.re.source).toBe('ab+c');\nexpect(copy.re.flags).toBe('gi');\nexpect(copy.re.lastIndex).toBe(2);" },
        { name: 'Map і Set з глибокою копією значень', code: "const inner = { x: 1 };\nconst src = { m: new Map([['k', inner]]), s: new Set([inner, 5]) };\nconst copy = deepClone(src);\nexpect(copy.m instanceof Map).toBe(true);\nexpect(copy.s instanceof Set).toBe(true);\nexpect(copy.m.get('k')).toEqual({ x: 1 });\nexpect(copy.m.get('k')).not.toBe(inner);\ncopy.m.get('k').x = 2;\nexpect(inner.x).toBe(1);\nexpect(copy.s.has(5)).toBe(true);\nexpect(copy.s.has(inner)).toBe(false);" },
        { name: 'циклічні посилання', code: "const a = { name: 'a' };\na.self = a;\na.list = [a];\nconst copy = deepClone(a);\nexpect(copy).not.toBe(a);\nexpect(copy.self).toBe(copy);\nexpect(copy.list[0]).toBe(copy);" },
        { name: 'спільні посилання лишаються спільними', code: "const shared = { v: 1 };\nconst src = { x: shared, y: shared, m: new Map([['s', shared]]) };\nconst copy = deepClone(src);\nexpect(copy.x).toBe(copy.y);\nexpect(copy.m.get('s')).toBe(copy.x);\nexpect(copy.x).not.toBe(shared);" },
        { name: 'зберігає прототип (екземпляри класів)', code: "class Point {\n  constructor(x, y) { this.x = x; this.y = y; }\n  len() { return Math.hypot(this.x, this.y); }\n}\nconst copy = deepClone({ p: new Point(3, 4) });\nexpect(copy.p instanceof Point).toBe(true);\nexpect(copy.p.len()).toBe(5);" },
        { name: 'копіює ключі-символи', code: "const id = Symbol('id');\nconst copy = deepClone({ [id]: { v: 1 } });\nexpect(copy[id]).toEqual({ v: 1 });" }
      ],
      explanation: `
**Структура рішення:** база рекурсії (примітиви/функції) → перевірка \`seen\` → спецтипи → загальний випадок (масив/об'єкт).

**Чому \`WeakMap\`:** вона зберігає відповідність «оригінал → копія». Це розв'язує дві задачі: цикли (без неї — \`RangeError: Maximum call stack size exceeded\`) і **спільні посилання** (без неї один об'єкт скопіювався б двічі). \`WeakMap\`, а не \`Map\` — не утримує об'єкти від збирача сміття (хоча тут мапа живе лише під час виклику, тож головна причина — ідіоматичність і ключі-об'єкти).

**Складність:** O(n) за часом і пам'яттю, n — кількість вузлів. Глибина рекурсії = глибині структури (дуже глибокі структури → переповнення стеку; рішення — ітеративний обхід зі стеком).

**Порівняння з альтернативами:**
| Спосіб | Мінуси |
|---|---|
| \`JSON.parse(JSON.stringify(x))\` | Date → рядок, губить \`undefined\`/функції/Map/Set/прототипи, падає на циклах |
| \`structuredClone(x)\` | цикли, Date, Map, Set ✓, але **не** зберігає прототипи, падає на функціях і DOM-вузлах |
| \`_.cloneDeep\` | найповніше, але +залежність |

**Типові помилки:**
- \`typeof null === 'object'\` → \`Object.keys(null)\` падає;
- \`seen.set\` **після** рекурсії → цикл не перехоплюється;
- \`{ ...obj }\` / \`Object.assign\` для вкладених рівнів — це поверхнева копія;
- \`[]\` замість \`new Array(len)\` → губляться «дірки» в кінці;
- копія через \`{}\` → \`instanceof\` перестає працювати.

**Що інтерв'юер спитає далі:**
- Як копіювати геттери/сеттери та неперелічувані властивості (\`Object.getOwnPropertyDescriptors\` + \`Object.defineProperties\`)?
- Що робити з \`ArrayBuffer\`, типізованими масивами, \`Error\`, DOM-вузлами (\`cloneNode\`)?
- Зробіть ітеративну версію без рекурсії.
- Чи треба копіювати ключі \`Map\`, якщо вони об'єкти? (Компроміс: ідентичність ключів vs повна ізоляція.)
`
    },
    {
      id: 'live-is-equal', group: "objects",
      type: 'code',
      level: 3,
      interview: true,
      title: 'Глибоке порівняння isEqual (NaN, Map/Set, цикли)',
      tags: ['objects', 'recursion', 'equality'],
      description: `
**Завдання.** Реалізуйте \`isEqual(a, b)\` — глибоке порівняння значень (аналог \`_.isEqual\`).

**Де трапляється:** порівняння стану перед ререндером або збереженням, мемоізація.

Правила:
- примітиви порівнюються за **SameValueZero**: \`NaN\` дорівнює \`NaN\`, а \`+0\` дорівнює \`-0\` (як у lodash; це наше рішення — обговоріть його з інтерв'юером);
- \`null\` та \`undefined\` рівні лише самі собі;
- об'єкти рівні, якщо мають **однаковий прототип**, однаковий набір власних перелічуваних ключів (порядок не важливий) і попарно рівні значення. Масив і об'єкт з ключами \`"0"\`, \`"1"\` — **не** рівні; \`{ a: 1 }\` і \`{ a: 1, b: undefined }\` — **не** рівні;
- \`Date\` — за часом; \`RegExp\` — за \`source\` і \`flags\`;
- \`Map\` — однаковий розмір, ті самі ключі (за SameValueZero, як \`Map#has\`) і глибоко рівні значення; \`Set\` — однаковий розмір і ті самі елементи (за \`Set#has\`);
- функції — лише за посиланням;
- **циклічні структури** не повинні призводити до нескінченної рекурсії.

\`\`\`js
isEqual({ a: [1, { b: NaN }] }, { a: [1, { b: NaN }] }); // true
isEqual([1, 2], { 0: 1, 1: 2 });                         // false
isEqual(new Map([['x', { y: 1 }]]), new Map([['x', { y: 1 }]])); // true
\`\`\`

**Як це працює:** Спершу швидкі перевірки (===, NaN, типи, прототипи), потім рекурсія за типом: Date — за часом, Map/Set — за розміром і вмістом, масиви й об'єкти — за ключами. Для циклів запам'ятовуємо пари, які вже порівнюємо.
`,
      starter: `function isEqual(a, b, seen = new WeakMap()) {
  // 1. a === b або обидва NaN → true
  // 2. Не об'єкти / null / різні прототипи → false
  // 3. Захист від циклів: пару (a, b) вже порівнюємо → true
  // 4. Date → за часом; RegExp → source + flags
  // 5. Map / Set → розмір і вміст
  // 6. Масиви / об'єкти → однакові ключі і рекурсивно рівні значення
  // TODO
  return a === b;
}
`,
      solution: `function isEqual(a, b, seen = new WeakMap()) {
  // === вважає +0 і -0 рівними; NaN — єдине значення, не рівне собі
  if (a === b || (a !== a && b !== b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  // різні прототипи: масив vs об'єкт, клас vs plain object, Map vs Set...
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

  // цикли: якщо пару (a, b) вже порівнюємо вище по стеку — вважаємо рівною
  let compared = seen.get(a);
  if (compared && compared.has(b)) return true;
  if (!compared) {
    compared = new Set();
    seen.set(a, compared);
  }
  compared.add(b);

  if (a instanceof Date) return isEqual(a.getTime(), b.getTime());
  if (a instanceof RegExp) return a.source === b.source && a.flags === b.flags;

  if (a instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, value] of a) {
      if (!b.has(key) || !isEqual(value, b.get(key), seen)) return false;
    }
    return true;
  }
  if (a instanceof Set) {
    if (a.size !== b.size) return false;
    for (const value of a) if (!b.has(value)) return false;
    return true;
  }

  // масиви та об'єкти (прототипи вже однакові)
  if (Array.isArray(a) && a.length !== b.length) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!isEqual(a[key], b[key], seen)) return false;
  }
  return true;
}
`,
      hints: [
        'Спершу швидкі перевірки: `a === b`, обидва `NaN`, далі — якщо хоч одне не об\'єкт або `null`, то `false`. Порівняння прототипів одразу відсікає «масив vs об\'єкт».',
        'Для об\'єктів: однакова кількість ключів + кожен ключ `a` є власним ключем `b` + рекурсивна рівність значень. Для `Map` — `size`, `has` і рекурсія по значеннях.',
        'Цикли: тримайте `WeakMap<a, Set<b>>` пар, які зараз порівнюються. Якщо пара вже є — повертайте `true` (рівність доводиться рештою порівнянь).'
      ],
      tests: [
        { name: 'примітиви', code: "expect(isEqual(1, 1)).toBe(true);\nexpect(isEqual('1', 1)).toBe(false);\nexpect(isEqual(null, undefined)).toBe(false);\nexpect(isEqual(null, null)).toBe(true);\nexpect(isEqual(null, {})).toBe(false);" },
        { name: 'NaN дорівнює NaN, +0 дорівнює -0', code: "expect(isEqual(NaN, NaN)).toBe(true);\nexpect(isEqual(0, -0)).toBe(true);\nexpect(isEqual({ x: [NaN] }, { x: [NaN] })).toBe(true);" },
        { name: 'вкладені об\'єкти, порядок ключів не важливий', code: "expect(isEqual({ a: 1, b: { c: [1, 2] } }, { b: { c: [1, 2] }, a: 1 })).toBe(true);\nexpect(isEqual({ a: 1, b: { c: [1, 2] } }, { a: 1, b: { c: [1, 3] } })).toBe(false);" },
        { name: 'масив ≠ об\'єкт, різна довжина ≠', code: "expect(isEqual([], {})).toBe(false);\nexpect(isEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);\nexpect(isEqual([1, 2], [1, 2, 3])).toBe(false);\nexpect(isEqual([[1], [2]], [[1], [2]])).toBe(true);" },
        { name: 'зайвий ключ зі значенням undefined — не рівні', code: "expect(isEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);\nexpect(isEqual({ a: 1, b: undefined }, { a: 1, c: undefined })).toBe(false);" },
        { name: 'Date і RegExp', code: "expect(isEqual(new Date(1000), new Date(1000))).toBe(true);\nexpect(isEqual(new Date(1000), new Date(2000))).toBe(false);\nexpect(isEqual(/a/g, /a/g)).toBe(true);\nexpect(isEqual(/a/g, /a/i)).toBe(false);\nexpect(isEqual(new Date(0), {})).toBe(false);" },
        { name: 'Map і Set', code: "expect(isEqual(new Map([['x', { y: 1 }]]), new Map([['x', { y: 1 }]]))).toBe(true);\nexpect(isEqual(new Map([['x', { y: 1 }]]), new Map([['x', { y: 2 }]]))).toBe(false);\nexpect(isEqual(new Map([['x', 1]]), new Map([['z', 1]]))).toBe(false);\nexpect(isEqual(new Set([1, 2, 3]), new Set([3, 2, 1]))).toBe(true);\nexpect(isEqual(new Set([1, 2]), new Set([1, 3]))).toBe(false);\nexpect(isEqual(new Map(), {})).toBe(false);" },
        { name: 'різні прототипи — не рівні', code: "class Point { constructor(x) { this.x = x; } }\nexpect(isEqual(new Point(1), new Point(1))).toBe(true);\nexpect(isEqual(new Point(1), { x: 1 })).toBe(false);" },
        { name: 'циклічні структури', code: "const a = { x: 1 }; a.self = a;\nconst b = { x: 1 }; b.self = b;\nexpect(isEqual(a, b)).toBe(true);\nconst c = { x: 2 }; c.self = c;\nexpect(isEqual(a, c)).toBe(false);\nconst l1 = [1]; l1.push(l1);\nconst l2 = [1]; l2.push(l2);\nexpect(isEqual(l1, l2)).toBe(true);" },
        { name: 'функції — лише за посиланням', code: "const f = () => 1;\nexpect(isEqual({ f }, { f })).toBe(true);\nexpect(isEqual({ f }, { f: () => 1 })).toBe(false);" }
      ],
      explanation: `
**Порядок перевірок** важливий: дешеві перевірки (ідентичність, NaN, тип, прототип) відсікають більшість випадків до дорогої рекурсії.

**+0 vs -0 — свідомий вибір.** \`Object.is(0, -0) === false\`, але в більшості бізнес-задач нулі вважаються рівними (так роблять \`===\` і lodash). React для порівняння стану використовує саме \`Object.is\`. На співбесіді варто **проговорити** цей вибір.

**Чому прототипи:** без цієї перевірки \`[1, 2]\` і \`{ 0: 1, 1: 2 }\` або \`new Point(1)\` і \`{ x: 1 }\` виявились би рівними. Lodash перевіряє \`constructor\` і \`[[Class]]\` (\`Object.prototype.toString\`).

**Цикли:** зберігаємо пари, що порівнюються зараз. Повторна зустріч тієї самої пари означає, що ми замкнули коло, — повертаємо \`true\` (коіндуктивне припущення), а справжні відмінності знайдуться в інших гілках.

**Складність:** O(n) за часом, O(d + n) пам'яті (d — глибина рекурсії). Для \`Set\` з об'єктами всередині порівняння за \`has\` — лише за посиланням; глибоке порівняння множин об'єктів — O(n²) (для кожного елемента шукати рівний серед ще не зіставлених).

**Типові помилки:**
- \`JSON.stringify(a) === JSON.stringify(b)\` — залежить від порядку ключів, губить \`undefined\`, \`NaN → null\`, падає на циклах;
- порівнюють лише ключі \`a\` → \`{a:1}\` «дорівнює» \`{a:1, b:2}\`;
- \`a[key] === undefined\` замість \`hasOwnProperty\` → \`{a: undefined}\` «дорівнює» \`{b: undefined}\`;
- забувають \`typeof null === 'object'\`.

**Що інтерв'юер спитає далі:**
- Як порівнювати \`Set\` об'єктів глибоко і яка складність?
- Додайте порівняння ключів-символів і типізованих масивів.
- Де у фронтенді потрібен deep equal (мемоізація селекторів, \`React.memo\` з кастомним компаратором) і чому shallow equal зазвичай кращий?
- Чим \`toEqual\` відрізняється від \`toStrictEqual\` у Jest?
`
    },
    {
      id: 'live-deep-diff', group: "objects",
      type: 'code',
      level: 3,
      title: 'deepDiff: список змін між двома об\'єктами',
      tags: ['objects', 'recursion'],
      description: `
**Завдання.** Реалізуйте \`deepDiff(a, b)\`, що повертає **масив змін**, які перетворюють \`a\` на \`b\`. Корисно для логування змін форми, undo/redo, синхронізації стану.

**Де трапляється:** логування змін форми, undo/redo, синхронізація стану з сервером.

Формат змін:
- \`{ path, type: 'added', value }\` — ключ є лише в \`b\`;
- \`{ path, type: 'removed', value }\` — ключ є лише в \`a\` (\`value\` — старе значення);
- \`{ path, type: 'changed', from, to }\` — значення відрізняються.

Правила:
- \`path\` — рядок з ключів через крапку: \`'user.tags.1'\`; для кореня — \`''\`;
- якщо **обидва** значення — звичайні об'єкти або **обидва** — масиви, порівнюємо рекурсивно (масиви — поелементно за індексом);
- інакше (різні типи, примітиви, об'єкт vs масив) — це один запис \`changed\` без заглиблення;
- \`NaN\` дорівнює \`NaN\`; \`Date\` порівнюються за часом (як «листки»);
- порядок записів у результаті **не важливий**.

\`\`\`js
deepDiff(
  { user: { name: 'Ann', tags: ['a', 'b'] }, v: 1 },
  { user: { name: 'Bob', tags: ['a'] }, admin: true }
);
// [
//   { path: 'user.name', type: 'changed', from: 'Ann', to: 'Bob' },
//   { path: 'user.tags.1', type: 'removed', value: 'b' },
//   { path: 'v', type: 'removed', value: 1 },
//   { path: 'admin', type: 'added', value: true }
// ]
\`\`\`

**Як це працює:** Рекурсивно обходимо обидва об'єкти з поточним шляхом: ключ є лише в b — added, лише в a — removed, обидва листи і різні — changed, обидва об'єкти/масиви — спускаємось глибше.
`,
      starter: `function deepDiff(a, b) {
  const changes = [];

  function walk(x, y, path) {
    // 1. Якщо обидва — масиви або обидва — звичайні об'єкти:
    //    ключі лише в y → added, лише в x → removed, спільні → walk глибше
    // 2. Інакше це «листи»: різні → changed { path, from, to }
    // TODO
  }

  walk(a, b, '');
  return changes;
}
`,
      solution: `function deepDiff(a, b) {
  const changes = [];
  const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const join = (base, key) => (base === '' ? String(key) : base + '.' + key);
  const isPlainObject = (v) =>
    v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);
  const sameLeaf = (x, y) => {
    if (x instanceof Date && y instanceof Date) return x.getTime() === y.getTime();
    return x === y || (x !== x && y !== y); // NaN === NaN
  };

  function walk(x, y, path) {
    const bothArrays = Array.isArray(x) && Array.isArray(y);
    const bothObjects = isPlainObject(x) && isPlainObject(y);
    if (!bothArrays && !bothObjects) {
      if (!sameLeaf(x, y)) changes.push({ path, type: 'changed', from: x, to: y });
      return;
    }
    // ключі з x: видалені або (рекурсивно) змінені
    for (const key of Object.keys(x)) {
      const p = join(path, key);
      if (!hasOwn(y, key)) changes.push({ path: p, type: 'removed', value: x[key] });
      else walk(x[key], y[key], p);
    }
    // нові ключі з y
    for (const key of Object.keys(y)) {
      if (!hasOwn(x, key)) changes.push({ path: join(path, key), type: 'added', value: y[key] });
    }
  }

  walk(a, b, '');
  return changes;
}
`,
      hints: [
        'Напишіть рекурсивну функцію `walk(x, y, path)`, яка дописує зміни в спільний масив.',
        'Якщо `x` і `y` не є «обидва об\'єкти» чи «обидва масиви» — порівняйте як листки (з урахуванням `NaN` і `Date`) і за потреби додайте `changed`.',
        'Інакше: для ключів `x` — `removed`, якщо ключа немає в `y`, або рекурсія; потім для ключів `y`, яких немає в `x`, — `added`. Шлях: `path === \'\' ? key : path + \'.\' + key`.'
      ],
      tests: [
        { name: 'однакові структури → []', code: "expect(deepDiff({ a: 1, b: { c: [1, 2] } }, { a: 1, b: { c: [1, 2] } })).toEqual([]);" },
        { name: 'змінене вкладене значення', code: "expect(deepDiff({ user: { name: 'A', age: 30 } }, { user: { name: 'B', age: 30 } })).toEqual([\n  { path: 'user.name', type: 'changed', from: 'A', to: 'B' }\n]);" },
        { name: 'додані та видалені ключі', code: "const byPath = (l) => l.slice().sort((x, y) => (x.path > y.path ? 1 : x.path < y.path ? -1 : 0));\nexpect(byPath(deepDiff({ a: 1, b: 2 }, { a: 1, c: 3 }))).toEqual([\n  { path: 'b', type: 'removed', value: 2 },\n  { path: 'c', type: 'added', value: 3 }\n]);" },
        { name: 'масиви порівнюються за індексами', code: "const byPath = (l) => l.slice().sort((x, y) => (x.path > y.path ? 1 : x.path < y.path ? -1 : 0));\nexpect(byPath(deepDiff({ tags: ['x', 'y'] }, { tags: ['x', 'z', 'w'] }))).toEqual([\n  { path: 'tags.1', type: 'changed', from: 'y', to: 'z' },\n  { path: 'tags.2', type: 'added', value: 'w' }\n]);\nexpect(deepDiff([1, 2, 3], [1])).toHaveLength(2);" },
        { name: 'зміна типу — один запис без заглиблення', code: "expect(deepDiff({ a: { x: 1 } }, { a: 5 })).toEqual([{ path: 'a', type: 'changed', from: { x: 1 }, to: 5 }]);\nexpect(deepDiff({ a: [1] }, { a: { 0: 1 } })).toEqual([{ path: 'a', type: 'changed', from: [1], to: { 0: 1 } }]);\nexpect(deepDiff({ a: null }, { a: {} })).toEqual([{ path: 'a', type: 'changed', from: null, to: {} }]);" },
        { name: 'NaN і Date', code: "expect(deepDiff({ n: NaN, d: new Date(5) }, { n: NaN, d: new Date(5) })).toEqual([]);\nconst res = deepDiff({ d: new Date(5) }, { d: new Date(6) });\nexpect(res).toHaveLength(1);\nexpect(res[0].path).toBe('d');\nexpect(res[0].type).toBe('changed');" },
        { name: 'корінь — примітиви', code: "expect(deepDiff(1, 2)).toEqual([{ path: '', type: 'changed', from: 1, to: 2 }]);\nexpect(deepDiff('a', 'a')).toEqual([]);" },
        { name: 'глибока вкладеність і кілька змін', code: "const byPath = (l) => l.slice().sort((x, y) => (x.path > y.path ? 1 : x.path < y.path ? -1 : 0));\nconst a = { user: { name: 'Ann', tags: ['a', 'b'] }, v: 1 };\nconst b = { user: { name: 'Bob', tags: ['a'] }, admin: true };\nexpect(byPath(deepDiff(a, b))).toEqual([\n  { path: 'admin', type: 'added', value: true },\n  { path: 'user.name', type: 'changed', from: 'Ann', to: 'Bob' },\n  { path: 'user.tags.1', type: 'removed', value: 'b' },\n  { path: 'v', type: 'removed', value: 1 }\n]);" }
      ],
      explanation: `
Це рекурсивний обхід двох дерев одночасно. На кожному рівні ми або спускаємось глибше (контейнери одного типу), або порівнюємо значення як листки.

**Складність:** O(n + m) — кожен ключ обох структур відвідується один раз; глибина рекурсії = глибині структури.

**Обмеження цього підходу і що з ними робити:**
- **Масиви поелементно.** Вставка елемента на початок масиву дає «зміни» в усіх індексах. Справжні diff-алгоритми (як у React reconciliation чи \`git diff\`) використовують ключі елементів або LCS (найдовшу спільну підпослідовність) і генерують операції \`move\`.
- **Шлях через крапку неоднозначний**, якщо ключ містить крапку (\`'a.b'\`). Надійніше — масив сегментів \`['a.b', 0]\` або JSON Pointer (\`/a.b/0\`, RFC 6901).
- **Цикли** не обробляються — додайте \`WeakSet\` пар, як в \`isEqual\`.
- \`Map\`/\`Set\`/класи тут розглядаються як звичайні об'єкти (без власних ключів \`Map\` завжди «рівні»).

**Типові помилки:**
- не відрізняють «ключ відсутній» від «ключ є зі значенням \`undefined\`» (\`b[key] === undefined\` замість \`hasOwnProperty\`);
- \`typeof null === 'object'\` → рекурсія в \`null\` і падіння;
- рекурсія в об'єкт vs масив → дивні шляхи замість одного \`changed\`.

**Що інтерв'юер спитає далі:**
- Напишіть \`applyDiff(a, changes)\`, що відтворює \`b\` (і перевірте \`isEqual(applyDiff(a, deepDiff(a, b)), b)\`).
- Як згенерувати JSON Patch (RFC 6902) — \`add\`/\`remove\`/\`replace\`?
- Як зробити diff масивів з ключами (\`id\`), щоб розпізнавати переміщення?
- Де це застосовується: undo/redo, оптимістичні оновлення, «є незбережені зміни» у формі.
`
    },
    {
      id: 'live-quiz-json-replacer', group: 'objects', type: 'quiz', level: 3,
      title: 'JSON.stringify: toJSON, масив-replacer і що зникає',
      tags: ['objects', 'json'],
      question: `Що виведе код?
\`\`\`js
const order = {
  id: 7,
  createdAt: new Date(0),
  total: { amount: 1500, toJSON() { return this.amount / 100 + ' грн'; } },
  tags: ['new', undefined, () => 1],
  [Symbol('secret')]: 'x',
};
console.log(JSON.stringify(order, ['id', 'total', 'tags']));
\`\`\``,
      options: [
        '`{"id":7,"total":"15 грн","tags":["new",null,null]}`',
        '`{"id":7,"total":{"amount":1500},"tags":["new"]}`',
        '`{"id":7,"createdAt":"1970-01-01T00:00:00.000Z","total":"15 грн","tags":["new",null,null]}`',
        '`{"id":7,"total":"15 грн","tags":["new"]}`'
      ],
      answer: 0,
      why: [
        'Так: масив-replacer лишає лише перелічені ключі об\'єктів, `toJSON` замінює значення `total`, а `undefined` і функції в масиві стають `null`.',
        'Ні: `toJSON` викликається до серіалізації — у результат потрапляє рядок, який він повернув, а не сам об\'єкт.',
        'Ні: `createdAt` немає у списку ключів replacer-а, тож його пропущено, хоча `Date` і має свій `toJSON`.',
        'Ні: у масивах `undefined` і функції не викидаються, а стають `null`, щоб не зсунути індекси.'
      ],
      hint: 'Що робить масив другим аргументом? І чим `undefined` у масиві відрізняється від `undefined` у властивості об\'єкта?',
      explanation: `Для кожного значення порядок такий: спершу \`toJSON()\` (якщо є), потім replacer, потім серіалізація. Масив-replacer — білий список ключів **об'єктів** на всіх рівнях; елементи масивів він не фільтрує. Символьні ключі пропускаються завжди. Ці правила доведеться відтворити у власному \`JSON.stringify\` у наступній задачі; як \`JSON\` губить \`Date\`, \`NaN\` і \`undefined\` у властивостях — у модулі «Об'єкти».`
    },
    {
      id: 'live-json-stringify', group: "objects",
      type: 'code',
      level: 4,
      title: 'Власний JSON.stringify',
      tags: ['json', 'recursion', 'strings'],
      description: `
**Завдання.** Реалізуйте \`stringify(value)\` — спрощений \`JSON.stringify\` (без параметрів \`replacer\` і \`space\`). Результат має **збігатися** з нативним для таких випадків:

**Де трапляється:** серіалізація даних для API; перевіряє знання JSON-нюансів на співбесіді.

- \`null\`, \`boolean\`, рядки (з екрануванням \`"\`, \`\\\`, \`\\n\`, \`\\r\`, \`\\t\`, \`\\b\`, \`\\f\` та інших керівних символів < U+0020 як \`\\u00XX\`);
- числа: скінченні — як \`String(n)\`; \`NaN\`, \`±Infinity\` → \`"null"\`;
- масиви та об'єкти (власні перелічувані рядкові ключі), будь-яка вкладеність, без пробілів;
- \`undefined\`, функції, символи: **пропускаються** у властивостях об'єктів, стають \`null\` у масивах, на верхньому рівні — функція повертає \`undefined\`;
- \`toJSON\`: якщо значення має метод \`toJSON\`, серіалізується результат \`value.toJSON(key)\` (так працює \`Date\`);
- **циклічні посилання** → \`TypeError\`. Але повторне використання того самого об'єкта **без** циклу (\`{ a: x, b: x }\`) — це нормально.

\`\`\`js
stringify({ a: [1, 'x', undefined], b: undefined, d: new Date(0) });
// '{"a":[1,"x",null],"d":"1970-01-01T00:00:00.000Z"}'
\`\`\`

Використовувати \`JSON.stringify\` у рішенні, звісно, не можна.

**Як це працює:** Рекурсія за типом значення: рядки екрануються, числа NaN/Infinity стають null, undefined/функції в об'єкті пропускаються, а в масиві стають null. toJSON викликається першим. Стек поточного шляху виявляє цикли — тоді TypeError.
`,
      starter: `function stringify(value) {
  const stack = []; // об'єкти на поточному шляху — для виявлення циклів

  function quote(str) {
    // TODO: обгорнути в лапки, екранувати " \\\\ і керуючі символи
  }

  function ser(val, inArray) {
    // 1. є toJSON → використати його результат
    // 2. null, boolean, number (NaN/Infinity → 'null'), string
    // 3. undefined/функція → undefined (в масиві — 'null')
    // 4. масив / об'єкт: цикл (stack) → TypeError; рекурсія по елементах/ключах
    // TODO
  }

  return ser(value, false);
}
`,
      solution: String.raw`function stringify(value) {
  const stack = []; // об'єкти на поточному шляху рекурсії (для виявлення циклів)
  const ESCAPES = { '"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t' };

  function quote(str) {
    let out = '"';
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const code = str.charCodeAt(i);
      if (ESCAPES[ch]) out += ESCAPES[ch];
      else if (code < 0x20) out += '\\u' + code.toString(16).padStart(4, '0');
      else out += ch;
    }
    return out + '"';
  }

  function serialize(key, val) {
    if ((typeof val === 'object' && val !== null) || typeof val === 'function') {
      if (typeof val.toJSON === 'function') val = val.toJSON(key);
    }
    // обгортки примітивів: new Number(1), new String('a')
    if (val instanceof Number || val instanceof String || val instanceof Boolean) val = val.valueOf();

    if (val === null) return 'null';
    switch (typeof val) {
      case 'string': return quote(val);
      case 'number': return Number.isFinite(val) ? String(val) : 'null';
      case 'boolean': return String(val);
      case 'bigint': throw new TypeError('Do not know how to serialize a BigInt');
      case 'undefined':
      case 'function':
      case 'symbol': return undefined; // сигнал «пропустити»
    }

    if (stack.includes(val)) throw new TypeError('Converting circular structure to JSON');
    stack.push(val);
    let result;
    if (Array.isArray(val)) {
      const items = [];
      for (let i = 0; i < val.length; i++) {
        const item = serialize(String(i), val[i]);
        items.push(item === undefined ? 'null' : item);
      }
      result = '[' + items.join(',') + ']';
    } else {
      const parts = [];
      for (const k of Object.keys(val)) {
        const item = serialize(k, val[k]);
        if (item !== undefined) parts.push(quote(k) + ':' + item);
      }
      result = '{' + parts.join(',') + '}';
    }
    stack.pop(); // виходимо з об'єкта — він більше не «на шляху»
    return result;
  }

  return serialize('', value);
}
`,
      hints: [
        'Напишіть рекурсивну `serialize(key, val)`, яка повертає рядок або `undefined` («пропустити»). Масив і об\'єкт по-різному обробляють `undefined` від дітей: `null` vs пропуск ключа.',
        'Порядок у `serialize`: спочатку `toJSON(key)`, потім примітиви за `typeof`, потім масив/об\'єкт. Ключі об\'єкта теж треба пропустити через функцію екранування рядків.',
        'Для циклів тримайте **стек** об\'єктів поточного шляху: `push` перед обходом дітей, `pop` після. Якщо об\'єкт уже в стеку — `TypeError`. `Set` відвіданих тут не підійде: він дасть хибну помилку для `{ a: x, b: x }`.'
      ],
      tests: [
        { name: 'примітиви', code: "const check = (v) => expect(stringify(v)).toBe(JSON.stringify(v));\n[42, -0, 3.14, 1e21, 'hi', '', true, false, null, NaN, Infinity, -Infinity].forEach(check);" },
        { name: 'екранування рядків', code: String.raw`const check = (v) => expect(stringify(v)).toBe(JSON.stringify(v));
check('say "hi"\n\ttab \\ back\r\b\f');
check('ctrl:' + String.fromCharCode(1) + String.fromCharCode(31));
check('юнікод ✓ та emoji 🙂');
check({ 'ключ "з" лапками': 1 });` },
        { name: 'вкладені масиви та об\'єкти', code: "const check = (v) => expect(stringify(v)).toBe(JSON.stringify(v));\ncheck([]);\ncheck({});\ncheck({ a: [1, 'x', null, true, { b: -0, c: [[]] }], d: { e: { f: 'g' } } });\ncheck([[1, [2, [3]]], { x: [] }]);" },
        { name: 'undefined, функції, символи', code: "expect(stringify({ a: undefined, b: () => 1, c: Symbol('s'), d: 1 })).toBe('{\"d\":1}');\nexpect(stringify([undefined, () => 1, Symbol('s')])).toBe('[null,null,null]');\nexpect(stringify(undefined)).toBeUndefined();\nexpect(stringify(() => 1)).toBeUndefined();" },
        { name: 'toJSON (включно з Date) отримує ключ', code: "expect(stringify({ d: new Date(0) })).toBe('{\"d\":\"1970-01-01T00:00:00.000Z\"}');\nconst withKey = { toJSON(key) { return 'key:' + key; } };\nexpect(stringify({ a: withKey })).toBe('{\"a\":\"key:a\"}');\nexpect(stringify([withKey])).toBe('[\"key:0\"]');\nexpect(stringify({ x: { toJSON() { return undefined; } }, y: 1 })).toBe('{\"y\":1}');" },
        { name: 'цикл → TypeError', code: "const a = { name: 'a' };\na.self = a;\nexpect(() => stringify(a)).toThrow(TypeError);\nconst b = { c: { d: [] } };\nb.c.d.push(b);\nexpect(() => stringify(b)).toThrow(TypeError);" },
        { name: 'спільні посилання без циклу — не помилка', code: "const x = { v: 1 };\nconst obj = { a: x, b: x, list: [x, x] };\nexpect(stringify(obj)).toBe(JSON.stringify(obj));" },
        { name: 'числові ключі та порядок як у нативного', code: "const obj = { b: 1, 2: 'two', a: 2, 1: 'one' };\nexpect(stringify(obj)).toBe(JSON.stringify(obj));" }
      ],
      explanation: `
**Ключова ідея** — рекурсивна \`serialize\`, що повертає або рядок, або \`undefined\` як сигнал «значення не серіалізується». Батьківський контейнер вирішує, що з цим робити: масив підставляє \`null\` (щоб не зсунути індекси), об'єкт пропускає ключ.

**Стек, а не «відвідані»:** цикл — це коли об'єкт трапляється **на поточному шляху** від кореня. Об'єкт, що зустрічається двічі в різних гілках (\`{ a: x, b: x }\`), — не цикл, і нативний \`JSON.stringify\` його серіалізує двічі. Тому \`push\` перед дітьми й \`pop\` після.

**Складність:** O(n · d) з \`stack.includes\` (d — глибина); з \`Set\` для стеку (\`add\`/\`delete\`) — O(n) + розмір виводу.

**Деталі специфікації, які ми врахували або свідомо пропустили:**
- \`toJSON\` викликається з ключем (\`''\` для кореня, індекс-рядок для масиву);
- \`BigInt\` → \`TypeError\`; обгортки \`new Number(1)\` розгортаються;
- нативний \`JSON.stringify\` (ES2019, «well-formed») екранує **поодинокі сурогати** як \`\\udXXX\` — ми це пропустили;
- \`Map\`/\`Set\` → \`{}\` (немає власних перелічуваних ключів) — як у нативного.

**Типові помилки:**
- забувають екранувати **ключі**;
- \`Set\` відвіданих замість стеку → хибний \`TypeError\`;
- однакова обробка \`undefined\` в масивах і об'єктах;
- \`String(NaN)\` → \`"NaN"\`, що є невалідним JSON;
- \`typeof null === 'object'\` → спроба обійти \`null\` як об'єкт.

**Що інтерв'юер спитає далі:**
- Додайте параметр \`replacer\` (функція \`(key, value)\` з \`this\` = батьківський об'єкт, або масив дозволених ключів).
- Додайте \`space\` (відступи) — як змінюється формат вкладених рівнів?
- Напишіть \`JSON.parse\` (рекурсивний спуск по символах) — і як обробити \`reviver\`.
- Чому \`JSON.stringify\` для порівняння об'єктів — погана ідея?
`
    },

    // ================================================================ FUNCTIONS
    {
      id: 'live-sum-chain', group: "objects",
      type: 'code',
      level: 3,
      title: 'sum(1)(2)(3)() і valueOf',
      tags: ['closures', 'coercion', 'currying'],
      description: `
**Завдання.** Реалізуйте функцію \`sum\`, що підтримує нескінченний ланцюжок викликів:

**Де трапляється:** популярна задача-головоломка на співбесідах про замикання і valueOf.

\`\`\`js
sum(1)(2)(3)();      // 6  — виклик без аргументів завершує ланцюжок
sum(1, 2)(3, 4)();   // 10 — у кожному виклику може бути кілька аргументів
sum()();             // 0
+sum(1)(2)(3);       // 6  — приведення до числа через valueOf
sum(2)(3) + 1;       // 6
String(sum(4)(5));   // '9' — приведення до рядка через toString
\`\`\`

**Важливо:** проміжні ланцюжки мають бути **незалежними** (іммутабельними):

\`\`\`js
const s = sum(1);
s(2)();  // 3
s(10)(); // 11 — а не 13!
s();     // 1
\`\`\`

**Як це працює:** sum повертає функцію, яка замикає поточну суму. Виклик з аргументами повертає нову таку функцію з більшою сумою, без аргументів — саму суму. valueOf/toString дозволяють використати ланцюжок як число.
`,
      starter: `function sum(...args) {
  // 1. Порахувати суму поточних аргументів
  // 2. Повернути функцію next(...more):
  //    без аргументів → повертає суму; з аргументами → sum(сума, ...more)
  // 3. next.valueOf і next.toString → сума (щоб працювало +sum(1)(2))
  // TODO
}
`,
      solution: `function sum(...args) {
  const total = args.reduce((acc, n) => acc + n, 0);

  function next(...more) {
    // виклик без аргументів — кінець ланцюжка
    if (more.length === 0) return total;
    // новий ланцюжок з накопиченою сумою — попередній не змінюється
    return sum(total, ...more);
  }

  // приведення типів: +fn, fn + 1, fn == 6 → valueOf; String(fn), \`\${fn}\` → toString
  next.valueOf = () => total;
  next.toString = () => String(total);
  return next;
}
`,
      hints: [
        '`sum` має повертати **функцію**, яка «пам\'ятає» накопичену суму через замикання.',
        'Виклик без аргументів повертає число; з аргументами — знову викликає `sum(total, ...more)`, створюючи новий незалежний ланцюжок (не мутуйте спільну змінну!).',
        'Щоб `+fn` і `String(fn)` працювали, перевизначте у повернутої функції методи `valueOf` і `toString`.'
      ],
      tests: [
        'expect(sum(1)(2)(3)()).toBe(6)',
        { name: 'кілька аргументів у кожному виклику', code: 'expect(sum(1, 2)(3, 4)()).toBe(10);\nexpect(sum(1, 2, 3)()).toBe(6);' },
        { name: 'крайові випадки: один виклик, без аргументів', code: 'expect(sum(5)()).toBe(5);\nexpect(sum()()).toBe(0);\nexpect(sum(-1)(1)()).toBe(0);' },
        { name: 'valueOf: приведення до числа', code: 'expect(+sum(1)(2)(3)).toBe(6);\nexpect(sum(2)(3) + 1).toBe(6);\nexpect(sum(2)(3) == 5).toBe(true);\nexpect(sum(10) > 9).toBe(true);' },
        { name: 'toString: приведення до рядка', code: 'expect(String(sum(4)(5))).toBe("9");\nexpect(`${sum(1)(1)}`).toBe("2");' },
        { name: 'проміжні ланцюжки незалежні', code: 'const s = sum(1);\nexpect(s(2)()).toBe(3);\nexpect(s(10)()).toBe(11);\nexpect(s()).toBe(1);\nconst t = s(5);\nexpect(t(5)()).toBe(11);\nexpect(t()).toBe(6);' },
        { name: 'довгий ланцюжок', code: 'let f = sum(0);\nfor (let i = 1; i <= 1000; i++) f = f(i);\nexpect(f()).toBe(500500);' }
      ],
      explanation: `
Кожен виклик з аргументами створює **нову** функцію з власною сумою в замиканні — тому ланцюжки незалежні. Виклик без аргументів — «термінатор», що повертає число.

**Приведення типів:** коли об'єкт (функція — теж об'єкт) потрапляє в арифметику чи порівняння \`==\`, рушій викликає \`ToPrimitive\`: спочатку \`Symbol.toPrimitive\` (якщо є), далі для hint \`"number"\`/\`"default"\` — \`valueOf\`, потім \`toString\`; для hint \`"string"\` (\`String(x)\`, шаблонні рядки) — навпаки. Можна замінити обидва методи одним:
\`\`\`js
next[Symbol.toPrimitive] = (hint) => (hint === 'string' ? String(total) : total);
\`\`\`

**Складність:** O(k) на виклик з k аргументами; кожна ланка — нова функція (O(1) пам'яті на ланку).

**Типові помилки:**
- спільна змінна \`let total\` на весь ланцюжок → \`s(2)\` і \`s(10)\` впливають одне на одне;
- \`console.log(sum(1)(2))\` у браузері покаже функцію, а не число — приведення відбувається лише в операціях; тому тести на \`valueOf\` використовують \`+\` і \`==\`;
- \`sum(1)(2) === 3\` — завжди \`false\`: строга рівність не приводить типи.

**Що інтерв'юер спитає далі:**
- Чим цей підхід відрізняється від класичного \`curry(fn)\` з фіксованою арністю (\`fn.length\`)?
- Що поверне \`typeof sum(1)(2)\`? (\`'function'\`)
- Реалізуйте \`sum\` через \`Symbol.toPrimitive\`.
- Узагальніть: \`chain(reducer, initial)\` для довільної операції (добуток, конкатенація).
`
    },

    // ================================================================ ASYNC UTILITIES
    {
      id: 'live-make-cancelable', group: "async",
      type: 'code',
      level: 2,
      title: 'makeCancelable(promise)',
      tags: ['promises', 'async', 'cancellation'],
      description: `
**Завдання.** Проміси не можна «скасувати», але можна перестати чекати на їхній результат. Реалізуйте \`makeCancelable(promise)\`, що повертає об'єкт:

**Де трапляється:** ігнорування відповіді після розмонтування компонента або зміни фільтра.

- \`promise\` — новий проміс, який виконується/відхиляється так само, як оригінальний;
- \`cancel()\` — після виклику новий проміс **одразу** відхиляється помилкою \`CancelError\` (клас, успадкований від \`Error\`, з \`name === 'CancelError'\` і \`message === 'Canceled'\`), а результат оригінального промісу ігнорується;
- \`isCanceled()\` — чи було викликано \`cancel()\`.

Якщо \`cancel()\` викликано **після** того, як оригінальний проміс виконався, нічого не змінюється (виконаний проміс не можна відхилити). Повторний \`cancel()\` — безпечний.

\`\`\`js
const { promise, cancel } = makeCancelable(fetchUser());
promise.then(render).catch((e) => { if (e.name !== 'CancelError') showError(e); });
// компонент розмонтовано:
cancel();
\`\`\`

**Як це працює:** Проміс не скасувати, але можна обгорнути: новий проміс резолвиться результатом оригіналу, лише якщо cancel() ще не викликали. cancel() одразу відхиляє обгортку з CancelError.
`,
      starter: `class CancelError extends Error {
  constructor() {
    super('Canceled');
    this.name = 'CancelError';
  }
}

function makeCancelable(promise) {
  let canceled = false;
  // 1. Новий проміс-обгортка: переслати результат/помилку оригіналу, лише якщо !canceled
  // 2. cancel(): canceled = true і відхилити обгортку CancelError
  // TODO
  return { promise, cancel() {} };
}
`,
      solution: `class CancelError extends Error {
  constructor() {
    super('Canceled');
    this.name = 'CancelError';
  }
}

function makeCancelable(promise) {
  let canceled = false;
  let rejectWrapped;

  const wrapped = new Promise((resolve, reject) => {
    rejectWrapped = reject;
    // Promise.resolve — щоб підтримати і не-проміси/thenable
    Promise.resolve(promise).then(
      (value) => { if (!canceled) resolve(value); },
      (error) => { if (!canceled) reject(error); }
    );
  });

  return {
    promise: wrapped,
    cancel() {
      if (canceled) return;
      canceled = true;
      // якщо wrapped уже виконаний — reject нічого не змінить
      rejectWrapped(new CancelError());
    },
    isCanceled: () => canceled,
  };
}
`,
      hints: [
        'Створіть новий `Promise` і збережіть його `reject` у змінній замикання — так його можна викликати ззовні з `cancel()`.',
        'Підпишіться на оригінальний проміс через `.then(onOk, onErr)` і передавайте результат далі, лише якщо скасування не було.',
        'Проміс можна виконати лише один раз: виклик `reject` після `resolve` ігнорується, тож «скасування після виконання» обробляється автоматично.'
      ],
      tests: [
        { name: 'передає значення оригінального промісу', code: 'const { promise } = makeCancelable(Promise.resolve(42));\nawait expect(promise).resolves.toBe(42);' },
        { name: 'передає помилку оригінального промісу', code: 'const { promise } = makeCancelable(Promise.reject(new Error("boom")));\nawait expect(promise).rejects.toThrow("boom");' },
        { name: 'cancel() одразу відхиляє з CancelError', code: 'const c = makeCancelable(new Promise(() => {}));\nc.cancel();\nconst err = await c.promise.catch((e) => e);\nexpect(err).toBeInstanceOf(Error);\nexpect(err.name).toBe("CancelError");\nexpect(err.message).toBe("Canceled");' },
        { name: 'результат після скасування ігнорується', code: 'useFakeTimers();\nconst original = new Promise((r) => setTimeout(() => r("late"), 100));\nconst c = makeCancelable(original);\nc.cancel();\nadvanceTimersByTime(100);\nawait expect(original).resolves.toBe("late");\nconst err = await c.promise.catch((e) => e);\nexpect(err.name).toBe("CancelError");' },
        { name: 'cancel() після виконання нічого не змінює', code: 'const c = makeCancelable(Promise.resolve("ok"));\nawait c.promise;\nc.cancel();\nawait expect(c.promise).resolves.toBe("ok");' },
        { name: 'isCanceled() і повторний cancel()', code: 'const c = makeCancelable(new Promise(() => {}));\nexpect(c.isCanceled()).toBe(false);\nc.cancel();\nc.cancel();\nexpect(c.isCanceled()).toBe(true);\nawait expect(c.promise).rejects.toThrow("Canceled");' },
        { name: 'помилка після скасування теж ігнорується', code: 'let rejectOriginal;\nconst original = new Promise((_, rej) => { rejectOriginal = rej; });\noriginal.catch(() => {});\nconst c = makeCancelable(original);\nc.cancel();\nrejectOriginal(new Error("network"));\nconst err = await c.promise.catch((e) => e);\nexpect(err.name).toBe("CancelError");' }
      ],
      explanation: `
Ми не зупиняємо роботу оригінального промісу — лише **від'єднуємо** від неї споживача. Новий проміс керується двома джерелами: оригінальним промісом і \`cancel()\`. Хто перший — той і визначає результат (проміс змінює стан лише раз).

**Складність:** O(1).

**Навіщо це на практиці:** у React-компоненті запит завершується після unmount, і \`setState\` на розмонтованому компоненті (чи оновлення застарілого стану) — баг. \`cancel()\` у функції очищення \`useEffect\` вирішує це.

**Обмеження:** запит продовжує виконуватись і споживати трафік. Справжнє скасування — через \`AbortController\` (наступна задача): \`fetch(url, { signal })\` реально перериває запит.

**Типові помилки:**
- просто прапорець \`canceled\` без власного промісу → споживач «висить» вічно, бо проміс ніколи не виконається;
- відхилення звичайним \`Error\` без розрізнення — UI показує «помилку» при звичайному скасуванні;
- \`async\`-функція з \`if (canceled) return\` — повертає \`undefined\` замість відхилення.

**Що інтерв'юер спитає далі:**
- Як скасувати сам запит (\`AbortController\`, \`signal.reason\`)?
- Як зробити «скасовувану» \`async\`-функцію (передавати \`signal\` всередину та перевіряти \`signal.throwIfAborted()\`)?
- Що таке «takeLatest» і як ним вирішити гонку відповідей у пошуку?
- Чому пропозицію «cancelable promises» відкликали з TC39?
`
    },
    {
      id: 'live-batch-loader', group: 'async', type: 'code', level: 3,
      title: 'DataLoader: пакетування запитів за один тік',
      tags: ['async', 'microtasks', 'batching'],
      description: `
**Завдання.** Реалізуйте \`createLoader(batchFn)\` — спрощений DataLoader: усі виклики \`load(key)\` протягом одного синхронного проходу коду збираються в **один** виклик \`batchFn(keys)\`.

**Де трапляється:** список із 50 карток, кожна з яких запитує свого автора: без пакетування — 50 HTTP-запитів, з ним — один \`GET /users?ids=…\`. Так працюють DataLoader у GraphQL-серверах і пакетування запитів у клієнтах (Apollo BatchHttpLink); на співбесідах Strong Middle — популярна задача на event loop.

**Що написати**
- \`createLoader(batchFn)\` → \`{ load }\`;
- \`load(key)\` → проміс значення для \`key\`;
- ключі всіх \`load\`, викликаних до найближчої мікрозадачі, передаються **одним** викликом \`batchFn(keys)\` — унікальні, у порядку першої появи;
- \`batchFn(keys)\` → проміс масиву результатів **у тому самому порядку**; результат-екземпляр \`Error\` означає помилку лише для свого ключа;
- повторний \`load\` того самого ключа в пакеті не дублює ключ і отримує той самий результат;
- \`batchFn\` кинув помилку, відхилився або повернув не стільки результатів, скільки ключів → відхиляються проміси **всіх** ключів пакета;
- наступний синхронний прохід — новий пакет (кеш між пакетами не потрібен).

**Приклад**
\`\`\`js
const loader = createLoader(async (ids) => {
  console.log('запит', ids);
  return ids.map((id) => (id === 3 ? new Error('Не знайдено') : { id, name: 'User ' + id }));
});
const [a, b, a2] = await Promise.all([loader.load(1), loader.load(2), loader.load(1)]);
// у консолі один раз: запит [1, 2];  a === a2
await loader.load(3); // відхилено: Error('Не знайдено')
\`\`\`

**Як це працює:** перший \`load\` пакета планує відправку через \`queueMicrotask\`; поки виконується поточний синхронний код, решта \`load\` лише додають ключ і свої \`resolve\`/\`reject\` у пакет. Мікрозадача виконується одразу після синхронного коду — у цей момент усі ключі вже відомі (модуль «Event Loop»).

**Врахуйте:** поточний пакет треба «закрити» ще **до** виклику \`batchFn\`, щоб \`load\`, викликані з колбеків, потрапили в наступний пакет; \`batchFn\` не можна викликати синхронно з \`load\`.
`,
      starter: `function createLoader(batchFn) {
  let pending = null; // поточний пакет: Map ключ → масив { resolve, reject }

  function dispatch(batch) {
    // 1. const keys = [...batch.keys()]
    // 2. Викликати batchFn(keys): може кинути синхронно або повернути проміс
    // 3. results[i] → усім очікувачам keys[i]: Error → reject, інакше resolve
    // 4. Помилка batchFn або results.length !== keys.length → reject для всіх
    // TODO
  }

  function load(key) {
    return new Promise((resolve, reject) => {
      // 1. Немає пакета → створити Map і queueMicrotask(() => { pending = null; dispatch(пакет); })
      // 2. Додати { resolve, reject } до масиву свого ключа
      // TODO (заглушку нижче приберіть)
      reject(new Error('createLoader ще не реалізовано'));
    });
  }

  return { load };
}
`,
      solution: `function createLoader(batchFn) {
  let pending = null; // Map: ключ → [{ resolve, reject }]

  function dispatch(batch) {
    const keys = [...batch.keys()];
    const rejectAll = (err) => batch.forEach((waiters) => waiters.forEach((w) => w.reject(err)));
    let result;
    try {
      result = Promise.resolve(batchFn(keys)); // batchFn може кинути синхронно
    } catch (err) {
      rejectAll(err);
      return;
    }
    result
      .then((values) => {
        if (!Array.isArray(values) || values.length !== keys.length) {
          throw new Error('batchFn має повернути ' + keys.length + ' результатів');
        }
        keys.forEach((key, i) => {
          const value = values[i];
          batch.get(key).forEach((w) => (value instanceof Error ? w.reject(value) : w.resolve(value)));
        });
      })
      .catch(rejectAll);
  }

  function load(key) {
    return new Promise((resolve, reject) => {
      if (!pending) {
        const batch = new Map();
        pending = batch;
        queueMicrotask(() => {
          pending = null; // нові load підуть у наступний пакет
          dispatch(batch);
        });
      }
      if (!pending.has(key)) pending.set(key, []);
      pending.get(key).push({ resolve, reject });
    });
  }

  return { load };
}
`,
      hints: [
        'Тримайте поточний пакет у змінній замикання: `Map` ключ → масив `{ resolve, reject }`. Перший `load` створює пакет і планує відправку через `queueMicrotask`.',
        'У мікрозадачі спершу `pending = null`, а вже потім `dispatch(batch)` — тоді `load` з колбеків потраплять у наступний пакет.',
        'Результати розкладайте за індексом: `keys[i]` ↔ `values[i]`; `value instanceof Error` → `reject`, інакше `resolve`. Синхронний `throw` ловіть `try/catch` навколо виклику `batchFn`, асинхронну помилку — `.catch`.'
      ],
      tests: [
        { name: 'один batchFn на синхронний прохід, ключі без повторів', code: 'const calls = [];\nconst loader = createLoader(async (ids) => { calls.push(ids); return ids.map((id) => ({ id })); });\nconst [a, b, a2] = await Promise.all([loader.load(1), loader.load(2), loader.load(1)]);\nexpect(calls).toEqual([[1, 2]]);\nexpect(a).toEqual({ id: 1 });\nexpect(b).toEqual({ id: 2 });\nexpect(a2).toBe(a);' },
        { name: 'результати відповідають порядку ключів', code: 'const loader = createLoader(async (ids) => ids.map((id) => id.toUpperCase()));\nconst both = await Promise.all([loader.load("b"), loader.load("a")]);\nexpect(both).toEqual(["B", "A"]);' },
        { name: 'Error відхиляє лише свій ключ', code: 'const loader = createLoader(async (ids) => ids.map((id) => (id === 3 ? new Error("Не знайдено") : id * 10)));\nconst ok = loader.load(1);\nconst bad = loader.load(3);\nexpect(await ok).toBe(10);\nlet err = null;\ntry { await bad; } catch (e) { err = e; }\nexpect(err && err.message).toBe("Не знайдено");' },
        { name: 'batchFn не викликається синхронно', code: 'let called = false;\nconst loader = createLoader(async (ids) => { called = true; return ids; });\nconst p = loader.load(1);\nexpect(called).toBe(false);\nawait p;\nexpect(called).toBe(true);' },
        { name: 'новий прохід і load з колбека — нові пакети', code: 'const calls = [];\nconst loader = createLoader(async (ids) => { calls.push(ids); return ids; });\nawait loader.load(1);\nawait loader.load(2);\nawait loader.load(3).then(() => loader.load(4));\nexpect(calls).toEqual([[1], [2], [3], [4]]);' },
        { name: 'помилка batchFn відхиляє весь пакет', code: 'const l1 = createLoader(async () => { throw new Error("500"); });\nconst r1 = await Promise.allSettled([l1.load(1), l1.load(2)]);\nexpect(r1.map((r) => r.status)).toEqual(["rejected", "rejected"]);\nexpect(r1[0].reason.message).toBe("500");\nconst l2 = createLoader(() => { throw new Error("sync"); });\nexpect((await Promise.allSettled([l2.load(1)]))[0].status).toBe("rejected");\nconst l3 = createLoader(async (ids) => ids.slice(1));\nconst r3 = await Promise.allSettled([l3.load(1), l3.load(2)]);\nexpect(r3.every((r) => r.status === "rejected")).toBe(true);' }
      ],
      explanation: `
Уся «магія» — у мікрозадачі: вона виконується після поточного синхронного коду, тож за цей час встигають зареєструватися всі \`load\` (наприклад, з рендеру 50 карток). Пакет закривається до виклику \`batchFn\`, а результати розкладаються за індексом.

**Типові помилки:** \`setTimeout(0)\` замість мікрозадачі (працює, але додає затримку і чекає на інші макрозадачі); забути скинути \`pending\` (усі наступні \`load\` потрапляють у вже відправлений пакет і «зависають»); не дедуплікувати ключі.

**Що спитають далі:** як додати кеш за ключем і \`clear(key)\`; як обмежити розмір пакета (\`maxBatchSize\`) — розбити ключі на частини; чим пакетування відрізняється від дедуплікації однакових запитів «у польоті» (\`memoizeAsync\` у модулі «Асинхронність»).
`
    },
    {
      id: 'live-cached-fetcher', group: "async",
      type: 'code',
      level: 3,
      title: 'Дедуплікація запитів + кеш з TTL',
      tags: ['fetch', 'async', 'cache'],
      description: `
**Завдання.** Реалізуйте \`createCachedFetcher({ ttl = 1000 } = {})\` — шар кешування над \`fetch\` (спрощений аналог того, що роблять React Query / SWR).

**Де трапляється:** те, що роблять React Query / SWR: один запит на однаковий URL і кеш.

Повертає об'єкт:
- \`get(url)\` → \`Promise\` з розпарсеним JSON. Якщо \`response.ok === false\` — проміс відхиляється з \`Error('HTTP <status>')\`.
- \`invalidate(url)\` — видаляє запис з кешу; \`invalidate()\` без аргументу — очищує весь кеш.

Вимоги:
1. **Дедуплікація:** якщо запит на \`url\` уже «в дорозі», повторні \`get(url)\` не роблять нового \`fetch\`, а отримують той самий результат.
2. **Кеш з TTL:** успішний результат кешується на \`ttl\` мс від моменту отримання відповіді (час — \`Date.now()\`). Після закінчення TTL — новий запит.
3. **Помилки не кешуються:** після невдалого запиту наступний \`get(url)\` знову йде в мережу. Але всі, хто чекав на невдалий запит, отримують помилку.
4. Різні URL кешуються незалежно.

\`\`\`js
const api = createCachedFetcher({ ttl: 5000 });
const [a, b] = await Promise.all([api.get('/user'), api.get('/user')]); // один fetch
await api.get('/user');   // з кешу
api.invalidate('/user');
await api.get('/user');   // знову fetch
\`\`\`

**Як це працює:** Кешуємо не дані, а проміс: другий виклик з тим самим URL під час запиту отримує той самий проміс (дедуплікація). Після успіху запис живе ttl мс, після помилки видаляється.
`,
      starter: `function createCachedFetcher({ ttl = 1000 } = {}) {
  const cache = new Map(); // url → { promise, expiresAt }

  function get(url) {
    // 1. Є живий запис (ще в процесі або expiresAt > Date.now()) → повернути його promise
    // 2. Інакше: новий запис, promise = fetch → перевірка res.ok → res.json()
    //    успіх → expiresAt = Date.now() + ttl; помилка → видалити запис і прокинути далі
    // TODO
    return fetch(url).then((res) => res.json());
  }

  return {
    get,
    invalidate(url) {
      // TODO: url → видалити запис; без аргументу → очистити все
    }
  };
}
`,
      solution: `function createCachedFetcher({ ttl = 1000 } = {}) {
  // url → { promise, expiresAt }. Поки запит у дорозі, expiresAt = Infinity.
  const cache = new Map();

  function get(url) {
    const entry = cache.get(url);
    if (entry && entry.expiresAt > Date.now()) return entry.promise;

    const record = { promise: null, expiresAt: Infinity };
    record.promise = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(
        (data) => {
          record.expiresAt = Date.now() + ttl; // TTL рахуємо від моменту відповіді
          return data;
        },
        (error) => {
          // помилки не кешуємо; перевірка — щоб не видалити новіший запис після invalidate
          if (cache.get(url) === record) cache.delete(url);
          throw error;
        }
      );
    cache.set(url, record);
    return record.promise;
  }

  function invalidate(url) {
    if (url === undefined) cache.clear();
    else cache.delete(url);
  }

  return { get, invalidate };
}
`,
      hints: [
        'Кешуйте не дані, а **проміс** — тоді дедуплікація «в дорозі» і кеш готового результату — це один і той самий механізм.',
        'Зберігайте `{ promise, expiresAt }`. Поки запит не завершився — `expiresAt = Infinity`; після успіху — `Date.now() + ttl`. При помилці — видаліть запис.',
        'При видаленні запису після помилки перевірте `cache.get(url) === record`: за цей час могли викликати `invalidate` і почати новий запит.'
      ],
      tests: [
        { name: 'повертає розпарсений JSON', code: "mockFetch((url) => ({ url }));\nconst api = createCachedFetcher();\nawait expect(api.get('/a')).resolves.toEqual({ url: '/a' });" },
        { name: 'паралельні запити на той самий URL → один fetch', code: "useFakeTimers();\nconst f = mockFetch(() => ({ body: { v: 1 }, delay: 100 }));\nconst api = createCachedFetcher();\nconst p1 = api.get('/a');\nconst p2 = api.get('/a');\nconst p3 = api.get('/a');\nawait flushPromises();\nadvanceTimersByTime(100);\nexpect(await p1).toEqual({ v: 1 });\nexpect(await p2).toEqual({ v: 1 });\nexpect(await p3).toEqual({ v: 1 });\nexpect(f).toHaveBeenCalledTimes(1);" },
        { name: 'кеш діє протягом TTL', code: "useFakeTimers();\nconst f = mockFetch(() => ({ v: 1 }));\nconst api = createCachedFetcher({ ttl: 1000 });\nawait api.get('/a');\nadvanceTimersByTime(999);\nawait api.get('/a');\nexpect(f).toHaveBeenCalledTimes(1);\nadvanceTimersByTime(1);\nawait api.get('/a');\nexpect(f).toHaveBeenCalledTimes(2);" },
        { name: 'TTL рахується від моменту відповіді', code: "useFakeTimers();\nconst f = mockFetch(() => ({ body: { v: 1 }, delay: 500 }));\nconst api = createCachedFetcher({ ttl: 1000 });\nconst p = api.get('/a');\nawait flushPromises();\nadvanceTimersByTime(500);\nawait p;\nadvanceTimersByTime(900);\nawait api.get('/a');\nexpect(f).toHaveBeenCalledTimes(1);" },
        { name: 'різні URL — окремі запити', code: "const f = mockFetch((url) => ({ url }));\nconst api = createCachedFetcher();\nconst [a, b] = await Promise.all([api.get('/a'), api.get('/b')]);\nexpect(a).toEqual({ url: '/a' });\nexpect(b).toEqual({ url: '/b' });\nexpect(f).toHaveBeenCalledTimes(2);" },
        { name: 'HTTP-помилка не кешується', code: "let n = 0;\nconst f = mockFetch(() => (++n === 1 ? { status: 500, body: '' } : { v: 2 }));\nconst api = createCachedFetcher({ ttl: 10000 });\nawait expect(api.get('/a')).rejects.toThrow('HTTP 500');\nawait expect(api.get('/a')).resolves.toEqual({ v: 2 });\nexpect(f).toHaveBeenCalledTimes(2);" },
        { name: 'усі очікувачі отримують мережеву помилку', code: "const f = mockFetch(() => new Error('offline'));\nconst api = createCachedFetcher();\nconst results = await Promise.allSettled([api.get('/a'), api.get('/a')]);\nexpect(results.map((r) => r.status)).toEqual(['rejected', 'rejected']);\nexpect(results[1].reason.message).toBe('offline');\nexpect(f).toHaveBeenCalledTimes(1);" },
        { name: 'invalidate(url) і invalidate()', code: "const f = mockFetch((url) => ({ url }));\nconst api = createCachedFetcher({ ttl: 100000 });\nawait api.get('/a');\nawait api.get('/b');\napi.invalidate('/a');\nawait api.get('/a');\nawait api.get('/b');\nexpect(f).toHaveBeenCalledTimes(3);\napi.invalidate();\nawait api.get('/a');\nawait api.get('/b');\nexpect(f).toHaveBeenCalledTimes(5);" }
      ],
      explanation: `
**Головний трюк — кешувати проміс, а не дані.** Тоді три сценарії обробляються однаково: запит у дорозі (усі отримують той самий проміс), запит завершено (проміс уже виконаний — \`await\` миттєвий), помилка (запис видаляємо, наступний виклик створює новий проміс).

**Складність:** O(1) на \`get\`/\`invalidate\`, пам'ять — O(кількість URL). Без обмеження розміру кеш росте необмежено → на практиці додають LRU-витіснення.

**Чому перевірка \`cache.get(url) === record\`:** сценарій «запит A у дорозі → \`invalidate\` → запит B у дорозі → A падає». Без перевірки помилка A видалила б запис B, і B втратив би дедуплікацію.

**Нюанси для обговорення:**
- Усі споживачі отримують **той самий об'єкт** даних. Якщо хтось його мутує — зміни побачать усі. Варіанти: \`Object.freeze\`, \`structuredClone\` на видачі, іммутабельний стан.
- **stale-while-revalidate:** після TTL повертати старі дані миттєво й оновлювати у фоні (так працює SWR).
- Ключ кешу — не лише URL: метод, тіло, заголовки авторизації. POST зазвичай не кешують.
- Скасування: якщо один споживач скасував запит, не можна переривати спільний \`fetch\` — потрібен лічильник підписників.

**Типові помилки:**
- кешують дані після \`await\` → два паралельні виклики роблять два запити;
- кешують відхилений проміс → помилка «залипає» до кінця TTL;
- TTL рахують від початку запиту, а не від відповіді.

**Що інтерв'юер спитає далі:**
- Додайте stale-while-revalidate та \`maxSize\` з LRU.
- Як інвалідовувати за префіксом (\`/users/*\`) після мутації?
- Чим цей кеш відрізняється від HTTP-кешу браузера (\`Cache-Control\`, \`ETag\`)?
- Як би ви зробили це в React (хук \`useQuery\`, підписка компонентів на запис кешу)?
`
    },
    {
      id: 'live-priority-scheduler', group: "async",
      type: 'code',
      level: 4,
      title: 'Планувальник задач з пріоритетами та лімітом паралельності',
      tags: ['async', 'promises', 'queue', 'concurrency'],
      testTimeout: 3000,
      description: `
**Завдання.** Реалізуйте \`createScheduler(concurrency)\` — планувальник асинхронних задач (наприклад, завантаження файлів чи запитів до API з лімітом).

**Де трапляється:** черга завантаження файлів чи запитів з лімітом паралельності.

Повертає об'єкт:
- \`add(task, priority = 0)\` → \`Promise\`. \`task\` — функція без аргументів, що повертає проміс **або звичайне значення**. Проміс з \`add\` виконується/відхиляється результатом задачі.
- \`onIdle()\` → \`Promise\`, що виконується, коли немає ні запущених, ні очікуючих задач (одразу, якщо планувальник уже простоює).
- геттери \`running\` (скільки задач виконується) і \`pending\` (скільки в черзі).

Правила:
1. Одночасно виконується **не більше \`concurrency\`** задач. Якщо слот вільний — задача стартує **одразу** (синхронно всередині \`add\`).
2. Коли слот звільняється, стартує задача з **найвищим** \`priority\`; при однаковому пріоритеті — та, що додана раніше (FIFO).
3. Помилка задачі (відхилений проміс **або** синхронний \`throw\`) відхиляє лише її проміс і не зупиняє чергу.

\`\`\`js
const s = createScheduler(2);
s.add(() => upload(a));        // стартує одразу
s.add(() => upload(b));        // стартує одразу
s.add(() => upload(c), 0);     // чекає
s.add(() => upload(urgent), 10); // стартує першою, щойно звільниться слот
\`\`\`

**Як це працює:** Черга відсортована за пріоритетом (рівні — FIFO). Коли running < concurrency, беремо задачу з голови, запускаємо, а по завершенні зменшуємо running і запускаємо наступну. add повертає проміс результату саме цієї задачі.
`,
      starter: `function createScheduler(concurrency) {
  const queue = []; // { task, priority, resolve, reject } — більший priority першим, рівні — FIFO
  let running = 0;

  function runNext() {
    // TODO: поки running < concurrency і черга не порожня —
    //       взяти перший, running++, виконати task(), по завершенні running-- і runNext()
  }

  return {
    add(task, priority = 0) {
      // TODO: повернути проміс; вставити в чергу з урахуванням пріоритету; runNext()
      return Promise.resolve(task());
    },
    onIdle() {
      // TODO: проміс, що виконається, коли черга порожня і нічого не працює
      return Promise.resolve();
    }
  };
}
`,
      solution: `function createScheduler(concurrency) {
  const queue = []; // відсортована: priority за спаданням, при рівності — FIFO
  let running = 0;
  let idleWaiters = [];

  function enqueue(item) {
    // вставляємо після всіх елементів з priority >= item.priority (стабільно)
    let i = queue.length;
    while (i > 0 && queue[i - 1].priority < item.priority) i--;
    queue.splice(i, 0, item);
  }

  function runNext() {
    while (running < concurrency && queue.length > 0) {
      const item = queue.shift();
      running++;
      let result;
      try {
        result = Promise.resolve(item.task()); // підтримує і звичайні значення
      } catch (error) {
        result = Promise.reject(error); // синхронний throw
      }
      result
        .then(item.resolve, item.reject)
        .finally(() => {
          running--;
          runNext();
        });
    }
    if (running === 0 && queue.length === 0 && idleWaiters.length) {
      idleWaiters.forEach((resolve) => resolve());
      idleWaiters = [];
    }
  }

  return {
    add(task, priority = 0) {
      return new Promise((resolve, reject) => {
        enqueue({ task, priority, resolve, reject });
        runNext();
      });
    },
    onIdle() {
      if (running === 0 && queue.length === 0) return Promise.resolve();
      return new Promise((resolve) => idleWaiters.push(resolve));
    },
    get running() { return running; },
    get pending() { return queue.length; },
  };
}
`,
      hints: [
        'Потрібні: лічильник запущених задач, черга очікуючих і функція `runNext()`, яка запускає задачі, поки є вільні слоти.',
        'Кожна задача в черзі зберігає `resolve`/`reject` свого промісу з `add`. Після завершення задачі (`finally`) зменшуйте лічильник і знову викликайте `runNext()`.',
        'Пріоритет: тримайте чергу відсортованою — вставляйте новий елемент після всіх з `priority >= його`, тоді `shift()` дає потрібну задачу і FIFO зберігається. Синхронний `throw` ловіть через `try/catch` навколо `task()`.'
      ],
      tests: [
        { name: 'не більше concurrency задач одночасно', code: "useFakeTimers();\nconst tick = async (ms) => { advanceTimersByTime(ms); await flushPromises(); };\nconst log = [];\nconst job = (name, ms) => () => { log.push(name); return new Promise((r) => setTimeout(() => r(name), ms)); };\nconst s = createScheduler(2);\ns.add(job('a', 100)); s.add(job('b', 100)); s.add(job('c', 100)); s.add(job('d', 100));\nexpect(log).toEqual(['a', 'b']);\nexpect(s.running).toBe(2);\nexpect(s.pending).toBe(2);\nawait tick(100);\nexpect(log).toEqual(['a', 'b', 'c', 'd']);\nexpect(s.pending).toBe(0);" },
        { name: 'add повертає результат задачі', code: "useFakeTimers();\nconst s = createScheduler(1);\nconst p1 = s.add(() => new Promise((r) => setTimeout(() => r('one'), 50)));\nconst p2 = s.add(() => 'two');\nadvanceTimersByTime(50);\nexpect(await p1).toBe('one');\nexpect(await p2).toBe('two');" },
        { name: 'вищий пріоритет — першим, рівні — FIFO', code: "useFakeTimers();\nconst tick = async (ms) => { advanceTimersByTime(ms); await flushPromises(); };\nconst log = [];\nconst job = (name) => () => { log.push(name); return new Promise((r) => setTimeout(r, 10)); };\nconst s = createScheduler(1);\ns.add(job('A'), 0);\ns.add(job('B'), 1);\ns.add(job('C'), 5);\ns.add(job('D'), 1);\ns.add(job('E'), -1);\nfor (let i = 0; i < 5; i++) await tick(10);\nexpect(log).toEqual(['A', 'C', 'B', 'D', 'E']);" },
        { name: 'помилка задачі не зупиняє чергу', code: "useFakeTimers();\nconst s = createScheduler(1);\nconst bad = s.add(() => new Promise((_, rej) => setTimeout(() => rej(new Error('fail')), 10)));\nconst good = s.add(() => Promise.resolve('ok'));\nadvanceTimersByTime(10);\nawait expect(bad).rejects.toThrow('fail');\nawait expect(good).resolves.toBe('ok');" },
        { name: 'синхронний throw у задачі', code: "const s = createScheduler(1);\nconst bad = s.add(() => { throw new Error('sync'); });\nconst good = s.add(() => 42);\nawait expect(bad).rejects.toThrow('sync');\nawait expect(good).resolves.toBe(42);\nexpect(s.running).toBe(0);" },
        { name: 'максимальна паралельність ніколи не перевищується', code: "useFakeTimers();\nconst tick = async (ms) => { advanceTimersByTime(ms); await flushPromises(); };\nlet current = 0, max = 0;\nconst s = createScheduler(3);\nconst durations = [30, 10, 50, 20, 40, 10, 60, 30, 20, 10];\nconst all = durations.map((ms, i) => s.add(() => {\n  current++; max = Math.max(max, current);\n  return new Promise((r) => setTimeout(() => { current--; r(i); }, ms));\n}, i % 3));\nfor (let t = 0; t < 30; t++) await tick(10);\nexpect(max).toBe(3);\nexpect((await Promise.all(all)).sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);" },
        { name: 'onIdle чекає завершення всіх задач', code: "useFakeTimers();\nconst s = createScheduler(2);\nawait s.onIdle();\nlet idle = false;\ns.add(() => new Promise((r) => setTimeout(r, 100)));\ns.add(() => new Promise((r) => setTimeout(r, 200)));\ns.add(() => new Promise((r) => setTimeout(r, 50)));\ns.onIdle().then(() => { idle = true; });\nadvanceTimersByTime(100); await flushPromises();\nexpect(idle).toBe(false);\nadvanceTimersByTime(100); await flushPromises();\nexpect(idle).toBe(true);" }
      ],
      explanation: `
**Модель:** «семафор» на \`concurrency\` слотів + пріоритетна черга. Кожен елемент черги несе \`resolve\`/\`reject\` промісу, який отримав викликач \`add\`, — так результат задачі «доставляється» тому, хто її додав, навіть якщо вона стартувала значно пізніше.

**Складність:** вставка в відсортований масив — O(n), \`shift()\` — O(n). Для великих черг — **бінарна купа** (O(log n)) з лічильником \`seq\` для стабільності FIFO при рівних пріоритетах (купа сама по собі не стабільна!).

**Чому \`Promise.resolve(task())\` у \`try/catch\`:** задача може повернути не проміс, а значення, або кинути синхронно. Без цього синхронний \`throw\` зламав би \`runNext\` і «з'їв» слот назавжди.

**Чому \`finally\`, а не \`then\`:** слот має звільнитись і при успіху, і при помилці.

**Типові помилки:**
- лічильник \`running\` не зменшується при помилці → черга «зависає»;
- задача викликається в момент \`add\`, а не при старті (\`add(fetch(url))\` замість \`add(() => fetch(url))\`) — паралельність не обмежується;
- нестабільне сортування → порушується FIFO;
- \`onIdle\` перевіряє лише \`running\`, забуваючи про чергу.

**Що інтерв'юер спитає далі:**
- Додайте скасування задачі з черги (\`AbortSignal\` або повернення \`cancel\`).
- Як уникнути «голодування» (starvation) задач з низьким пріоритетом? (aging — підвищення пріоритету з часом очікування)
- Додайте таймаут на задачу та повторні спроби.
- Чим це відрізняється від простого promise pool і від \`p-limit\`/\`p-queue\`?
- Як React Scheduler пріоритезує оновлення (lanes, \`MessageChannel\`)?
`
    },
    {
      id: 'live-my-promise', group: "async",
      type: 'code',
      level: 4,
      interview: true,
      title: 'Власний Promise: then/catch/finally, thenable, all',
      tags: ['promises', 'event-loop', 'microtasks', 'classes'],
      description: `
**Завдання.** Реалізуйте клас \`MyPromise\`, сумісний за поведінкою зі стандартним \`Promise\` (Promises/A+).

**Де трапляється:** класика сильних співбесід: перевіряє розуміння мікрозадач і Promise.

**Конструктор** \`new MyPromise(executor)\`:
- \`executor(resolve, reject)\` викликається **синхронно**; якщо він кидає виняток — проміс відхиляється;
- стан змінюється **лише один раз**: \`pending → fulfilled\` або \`pending → rejected\`; повторні \`resolve\`/\`reject\` ігноруються.

**\`resolve(value)\`:**
- якщо \`value\` — сам цей проміс → відхилити з \`TypeError\`;
- якщо \`value\` — **thenable** (об'єкт або функція з методом \`then\`, включно з \`MyPromise\` і нативним \`Promise\`) → «прийняти» його стан;
- інакше — виконати зі значенням \`value\`.

**\`then(onFulfilled, onRejected)\`** повертає **новий** \`MyPromise\`:
- колбеки викликаються **асинхронно, як мікрозадачі** (\`queueMicrotask\`), навіть якщо проміс уже виконаний; кілька \`then\` на одному промісі — у порядку реєстрації;
- якщо колбек не функція — значення/помилка «проходять наскрізь»;
- значення, повернуте колбеком, виконує новий проміс (через ту саму процедуру \`resolve\`), а виняток — відхиляє.

**Також:** \`catch(onRejected)\`, \`finally(cb)\` (cb без аргументів; пропускає значення/помилку далі; чекає, якщо cb повертає проміс; якщо cb кидає — новий проміс відхиляється), \`MyPromise.resolve\`, \`MyPromise.reject\`, \`MyPromise.all\`.

\`\`\`js
console.log('A');
MyPromise.resolve(1).then((v) => console.log('C', v));
Promise.resolve().then(() => console.log('D'));
console.log('B');
// A, B, C 1, D — мікрозадачі в черзі разом з нативними
\`\`\`

**Як це працює:** Стан (pending/fulfilled/rejected) змінюється лише раз. then реєструє обробники і повертає новий проміс; обробники викликаються асинхронно через queueMicrotask. Якщо resolve отримав thenable — «розпаковуємо» його, викликавши його then.
`,
      starter: `class MyPromise {
  // 1. Стан: 'pending' | 'fulfilled' | 'rejected', значення і список обробників

  constructor(executor) {
    // TODO: створити resolve/reject (спрацьовують лише раз),
    //       викликати executor синхронно, помилку executor → reject
  }

  then(onFulfilled, onRejected) {
    // TODO: повернути новий MyPromise; обробник викликати через queueMicrotask;
    //       результат обробника → resolve нового промісу, помилка → reject
    throw new Error('Not implemented');
  }

  catch(onRejected) {
    // TODO: then(undefined, onRejected)
  }

  finally(onFinally) {
    // TODO: викликати onFinally і пропустити значення/помилку далі без змін
  }

  static resolve(value) { /* TODO */ }
  static reject(reason) { /* TODO */ }
  static all(items) { /* TODO */ }
}
`,
      solution: `class MyPromise {
  #state = 'pending';
  #value = undefined;
  #handlers = [];

  constructor(executor) {
    const { resolve, reject } = this.#createResolvers();
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error); // якщо вже resolved — буде проігноровано
    }
  }

  // Пара функцій з одним прапорцем: виклик будь-якої «блокує» обидві
  #createResolvers() {
    let called = false;
    return {
      resolve: (value) => {
        if (called) return;
        called = true;
        this.#resolveWith(value);
      },
      reject: (reason) => {
        if (called) return;
        called = true;
        this.#settle('rejected', reason);
      },
    };
  }

  // Promise Resolution Procedure
  #resolveWith(value) {
    if (value === this) {
      this.#settle('rejected', new TypeError('Chaining cycle detected for promise'));
      return;
    }
    if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
      let then;
      try {
        then = value.then; // геттер then може кинути
      } catch (error) {
        this.#settle('rejected', error);
        return;
      }
      if (typeof then === 'function') {
        const { resolve, reject } = this.#createResolvers();
        try {
          then.call(value, resolve, reject);
        } catch (error) {
          reject(error);
        }
        return;
      }
    }
    this.#settle('fulfilled', value);
  }

  #settle(state, value) {
    if (this.#state !== 'pending') return;
    this.#state = state;
    this.#value = value;
    this.#handlers.forEach((handler) => this.#schedule(handler));
    this.#handlers = [];
  }

  #schedule({ onFulfilled, onRejected, resolve, reject }) {
    queueMicrotask(() => {
      const fulfilled = this.#state === 'fulfilled';
      const callback = fulfilled ? onFulfilled : onRejected;
      if (typeof callback !== 'function') {
        // наскрізна передача значення / помилки
        (fulfilled ? resolve : reject)(this.#value);
        return;
      }
      try {
        resolve(callback(this.#value));
      } catch (error) {
        reject(error);
      }
    });
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handler = { onFulfilled, onRejected, resolve, reject };
      if (this.#state === 'pending') this.#handlers.push(handler);
      else this.#schedule(handler);
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(onFinally) {
    if (typeof onFinally !== 'function') return this.then(onFinally, onFinally);
    return this.then(
      (value) => MyPromise.resolve(onFinally()).then(() => value),
      (reason) => MyPromise.resolve(onFinally()).then(() => { throw reason; })
    );
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  static all(iterable) {
    return new MyPromise((resolve, reject) => {
      const items = Array.from(iterable);
      const results = new Array(items.length);
      let remaining = items.length;
      if (remaining === 0) {
        resolve(results);
        return;
      }
      items.forEach((item, index) => {
        MyPromise.resolve(item).then((value) => {
          results[index] = value; // порядок за індексом, а не за часом завершення
          if (--remaining === 0) resolve(results);
        }, reject);
      });
    });
  }
}
`,
      hints: [
        'Зберігайте `state`, `value` і масив обробників. `then` реєструє обробник (якщо pending) або одразу планує його через `queueMicrotask` (якщо проміс уже виконаний).',
        'Кожен `then` створює новий проміс; обробник зберігає його `resolve`/`reject`. У мікрозадачі: викличте потрібний колбек і передайте результат у `resolve` нового промісу (виняток — у `reject`). Якщо колбек не функція — передайте значення/помилку далі як є.',
        'Процедура `resolve(x)`: `x === this` → TypeError; якщо `x` — об\'єкт/функція з функцією `then` → викличте `then.call(x, res, rej)` з новою парою «одноразових» resolve/reject; інакше — fulfill. Прапорець `called` спільний для пари resolve/reject.'
      ],
      tests: [
        { name: 'executor синхронний, then — асинхронний', code: "const log = [];\nnew MyPromise((resolve) => { log.push('executor'); resolve(1); }).then((v) => log.push('then ' + v));\nlog.push('sync');\nexpect(log).toEqual(['executor', 'sync']);\nawait flushPromises();\nexpect(log).toEqual(['executor', 'sync', 'then 1']);" },
        { name: 'колбеки — мікрозадачі в одній черзі з нативними промісами', code: "const log = [];\nPromise.resolve().then(() => log.push('native1'));\nMyPromise.resolve().then(() => log.push('my'));\nPromise.resolve().then(() => log.push('native2'));\nawait flushPromises();\nexpect(log).toEqual(['native1', 'my', 'native2']);" },
        { name: 'then виконується раніше за setTimeout(0)', code: "const log = [];\nsetTimeout(() => log.push('timeout'), 0);\nMyPromise.resolve().then(() => log.push('micro'));\nawait sleep(10);\nexpect(log).toEqual(['micro', 'timeout']);" },
        { name: 'ланцюжки та передача значень', code: "const v = await MyPromise.resolve(1).then((x) => x * 2).then((x) => x + 1);\nexpect(v).toBe(3);\nconst p = new MyPromise((r) => setTimeout(() => r('later'), 5));\nexpect(await p.then((x) => x.toUpperCase())).toBe('LATER');" },
        { name: 'throw у then → catch; catch відновлює ланцюжок', code: "const v = await MyPromise.resolve(1)\n  .then(() => { throw new Error('boom'); })\n  .then(() => 'skipped')\n  .catch((e) => 'caught ' + e.message)\n  .then((x) => x + '!');\nexpect(v).toBe('caught boom!');\nconst r = await new MyPromise(() => { throw new Error('exec'); }).catch((e) => e.message);\nexpect(r).toBe('exec');" },
        { name: 'не-функції в then пропускають значення наскрізь', code: "expect(await MyPromise.resolve(5).then(null).then(undefined, null).then((x) => x)).toBe(5);\nexpect(await MyPromise.reject(new Error('e')).then((x) => x).then(null).catch((e) => e.message)).toBe('e');" },
        { name: 'стан змінюється лише один раз', code: "const p = new MyPromise((resolve, reject) => { resolve(1); reject(new Error('no')); resolve(2); throw new Error('ignored'); });\nexpect(await p).toBe(1);" },
        { name: 'resolve з thenable, MyPromise і нативним Promise', code: "expect(await new MyPromise((r) => r(MyPromise.resolve(5)))).toBe(5);\nexpect(await new MyPromise((r) => r({ then(res) { res(7); } }))).toBe(7);\nexpect(await new MyPromise((r) => r(Promise.resolve(9)))).toBe(9);\nexpect(await MyPromise.resolve(1).then(() => ({ then(_, rej) { rej('nope'); } })).catch((e) => e)).toBe('nope');\nconst evil = { then(res) { res(1); res(2); throw new Error('x'); } };\nexpect(await new MyPromise((r) => r(evil))).toBe(1);" },
        { name: 'повернення самого себе → TypeError', code: "const p = MyPromise.resolve(1).then(() => p);\nconst err = await p.then(() => null, (e) => e);\nexpect(err).toBeInstanceOf(TypeError);" },
        { name: 'кілька then на одному промісі — у порядку реєстрації', code: "const log = [];\nlet resolve;\nconst p = new MyPromise((r) => { resolve = r; });\np.then(() => log.push(1));\np.then(() => log.push(2));\np.then(() => log.push(3));\nresolve();\nawait flushPromises();\nexpect(log).toEqual([1, 2, 3]);" },
        { name: 'finally: без аргументів, пропускає значення, чекає проміс', code: "let args = null;\nexpect(await MyPromise.resolve('v').finally((...a) => { args = a; return 'ignored'; })).toBe('v');\nexpect(args).toEqual([]);\nexpect(await MyPromise.reject('r').finally(() => {}).catch((e) => e)).toBe('r');\nconst log = [];\nawait MyPromise.resolve(1).finally(() => new MyPromise((r) => setTimeout(() => { log.push('cleanup'); r(); }, 5))).then(() => log.push('after'));\nexpect(log).toEqual(['cleanup', 'after']);\nexpect(await MyPromise.resolve(1).finally(() => { throw new Error('f'); }).catch((e) => e.message)).toBe('f');" },
        { name: 'static resolve/reject/all', code: "const p = MyPromise.resolve(1);\nexpect(MyPromise.resolve(p)).toBe(p);\nexpect(await MyPromise.reject(new Error('r')).catch((e) => e.message)).toBe('r');\nconst slow = new MyPromise((r) => setTimeout(() => r('slow'), 10));\nexpect(await MyPromise.all([slow, 2, MyPromise.resolve(3), Promise.resolve(4)])).toEqual(['slow', 2, 3, 4]);\nexpect(await MyPromise.all([])).toEqual([]);\nexpect(await MyPromise.all([1, MyPromise.reject('bad'), new MyPromise(() => {})]).catch((e) => e)).toBe('bad');" }
      ],
      explanation: `
**Три ключові частини:**
1. **Стан + черга обробників.** Поки проміс \`pending\`, \`then\` складає обробники в масив; при переході в фінальний стан усі вони плануються.
2. **Асинхронність через мікрозадачі.** Специфікація вимагає, щоб колбеки \`then\` ніколи не викликались синхронно (інакше код поводився б по-різному залежно від того, чи проміс уже виконаний — «Zalgo»). \`queueMicrotask\` ставить їх у ту ж чергу, що й нативні \`PromiseReactionJob\`, тому порядок збігається з нативним. \`setTimeout\` тут **неправильний** — це макрозадача, і тест «then раніше за setTimeout» це ловить.
3. **Procedure resolve.** Саме вона робить можливими ланцюжки: якщо колбек повертає проміс (або будь-який thenable), новий проміс «приймає» його стан. Прапорець \`called\` захищає від «поганих» thenable, які викликають \`res\` кілька разів або кидають після виклику.

**Складність:** O(1) на \`then\`; \`all\` — O(n).

**Відмінності від нативного Promise, про які варто знати:**
- нативний \`resolve(thenable)\` викликає \`thenable.then\` в окремій мікрозадачі (\`NewPromiseResolveThenableJob\`), тому \`async\`-функція, що повертає проміс, «коштує» на 2 тіки більше;
- немає відстеження необроблених відхилень (\`unhandledrejection\`);
- немає \`Symbol.species\` і підкласів.

**Типові помилки:**
- синхронний виклик колбеків для вже виконаного промісу;
- \`then\` повертає \`this\` замість нового промісу → ламаються ланцюжки та обробка помилок;
- немає наскрізної передачі при \`then(null)\` → помилка «губиться»;
- \`resolve(promise)\` виконує зовнішній проміс самим об'єктом промісу замість його значення;
- \`finally\` передає значення в колбек або підміняє результат.

**Що інтерв'юер спитає далі:**
- Додайте \`allSettled\`, \`race\`, \`any\` (з \`AggregateError\`).
- Чому \`await\` нативного промісу швидший за \`await\` thenable?
- Як реалізувати «unhandled rejection» трекінг?
- Поясніть порядок виводу для суміші \`setTimeout\`, \`queueMicrotask\`, \`Promise.then\` і \`async/await\`.
`
    },

    // ================================================================ CLASSES & DATA STRUCTURES
    {
      id: 'live-event-emitter', group: "structures",
      type: 'code',
      level: 3,
      interview: true,
      title: 'EventEmitter: on/off/once/emit',
      tags: ['classes', 'events', 'closures'],
      description: `
**Завдання.** Реалізуйте клас \`EventEmitter\` (як у Node.js, спрощено).

**Де трапляється:** шина подій між модулями, Node.js EventEmitter; дуже часта задача.

- \`on(event, listener)\` — підписка; **повертає функцію відписки**. Той самий listener можна підписати кілька разів — тоді він і викликатиметься кілька разів.
- \`once(event, listener)\` — listener спрацює **не більше одного разу**; теж повертає функцію відписки. \`off(event, listener)\` з **оригінальним** listener має скасовувати і \`once\`-підписку.
- \`off(event, listener)\` — видаляє **одну** підписку цього listener (якщо їх кілька).
- \`emit(event, ...args)\` — викликає listener-и **в порядку підписки** з переданими аргументами; \`this\` у listener — сам emitter. Повертає \`true\`, якщо були слухачі, інакше \`false\`.
- \`listenerCount(event)\` — кількість підписок.

**Безпечність під час \`emit\`:** якщо listener відписує себе чи інших або додає нових під час \`emit\`, поточний \`emit\` має викликати рівно тих слухачів, які були на його початку (без пропусків сусідів). Зміни діють з наступного \`emit\`.

Функція відписки, викликана повторно, нічого не робить (і **не** видаляє іншу підписку того самого listener).

\`\`\`js
const bus = new EventEmitter();
const unsubscribe = bus.on('login', (user) => console.log('hi', user));
bus.once('login', () => console.log('first login only'));
bus.emit('login', 'Ann'); // hi Ann, first login only
unsubscribe();
\`\`\`

**Як це працює:** Зберігаємо подію → масив слухачів. emit проходить по КОПІЇ масиву, тож відписка під час emit безпечна. once — обгортка, що відписує себе перед викликом; on повертає функцію відписки.
`,
      starter: `class EventEmitter {
  constructor() {
    this.events = new Map(); // подія → масив слухачів
  }

  on(event, listener) {
    // TODO: додати слухача і повернути функцію відписки
  }

  once(event, listener) {
    // TODO: обгортка, що спершу відписує себе, потім викликає listener
  }

  off(event, listener) {
    // TODO: прибрати ОДНЕ входження listener
  }

  emit(event, ...args) {
    // TODO: пройти по КОПІЇ масиву слухачів; повернути true, якщо слухачі були
    return false;
  }

  listenerCount(event) {
    // TODO
    return 0;
  }
}
`,
      solution: `class EventEmitter {
  // event → масив записів { listener, fn }; listener — оригінал, fn — що викликати
  #events = new Map();

  #add(event, entry) {
    if (!this.#events.has(event)) this.#events.set(event, []);
    this.#events.get(event).push(entry);
    // відписка видаляє саме ЦЕЙ запис, тож повторний виклик безпечний
    return () => this.#removeEntry(event, entry);
  }

  #removeEntry(event, entry) {
    const list = this.#events.get(event);
    if (!list) return;
    const index = list.indexOf(entry);
    if (index !== -1) list.splice(index, 1);
    if (list.length === 0) this.#events.delete(event);
  }

  on(event, listener) {
    return this.#add(event, { listener, fn: listener });
  }

  once(event, listener) {
    const entry = { listener, fn: null };
    entry.fn = (...args) => {
      this.#removeEntry(event, entry); // відписуємось ДО виклику (на випадок повторного emit усередині)
      listener.apply(this, args);
    };
    return this.#add(event, entry);
  }

  off(event, listener) {
    const list = this.#events.get(event);
    if (!list) return this;
    // з кінця — видаляємо останню підписку, як Node.js
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].listener === listener) {
        this.#removeEntry(event, list[i]);
        break;
      }
    }
    return this;
  }

  emit(event, ...args) {
    const list = this.#events.get(event);
    if (!list || list.length === 0) return false;
    // знімок: зміни під час emit не впливають на поточний обхід
    for (const entry of [...list]) entry.fn.apply(this, args);
    return true;
  }

  listenerCount(event) {
    return this.#events.get(event)?.length ?? 0;
  }
}
`,
      hints: [
        'Зберігайте для кожної події масив записів. Щоб відписка видаляла саме свою підписку (навіть якщо listener доданий двічі), повертайте замикання, яке видаляє конкретний **об\'єкт-запис**, а не функцію.',
        'Для `once` створіть обгортку, яка спершу відписується, а потім викликає оригінал. Зберігайте в записі й оригінальний listener — щоб `off(event, original)` знайшов `once`-підписку.',
        'У `emit` перебирайте **копію** масиву (`[...list]`): якщо listener видалить себе під час обходу «живого» масиву, наступний слухач зсунеться і буде пропущений.'
      ],
      tests: [
        { name: 'on + emit: аргументи і порядок підписки', code: "const e = new EventEmitter();\nconst log = [];\ne.on('x', (a, b) => log.push('1:' + a + b));\ne.on('x', (a, b) => log.push('2:' + a + b));\nexpect(e.emit('x', 'a', 'b')).toBe(true);\nexpect(log).toEqual(['1:ab', '2:ab']);\nexpect(e.emit('nothing')).toBe(false);" },
        { name: 'on повертає функцію відписки', code: "const e = new EventEmitter();\nconst f = mockFn();\nconst unsubscribe = e.on('x', f);\ne.emit('x');\nunsubscribe();\ne.emit('x');\nexpect(f).toHaveBeenCalledTimes(1);\nexpect(e.listenerCount('x')).toBe(0);" },
        { name: 'той самий listener двічі; off видаляє одну підписку', code: "const e = new EventEmitter();\nconst f = mockFn();\ne.on('x', f);\nconst un2 = e.on('x', f);\ne.emit('x');\nexpect(f).toHaveBeenCalledTimes(2);\nun2();\nun2();\nexpect(e.listenerCount('x')).toBe(1);\ne.emit('x');\nexpect(f).toHaveBeenCalledTimes(3);\ne.off('x', f);\ne.emit('x');\nexpect(f).toHaveBeenCalledTimes(3);\nexpect(e.listenerCount('x')).toBe(0);\ne.off('x', f);\ne.off('unknown', f);" },
        { name: 'once спрацьовує один раз', code: "const e = new EventEmitter();\nconst f = mockFn();\ne.once('x', f);\nexpect(e.listenerCount('x')).toBe(1);\ne.emit('x', 1);\ne.emit('x', 2);\nexpect(f).toHaveBeenCalledTimes(1);\nexpect(f).toHaveBeenCalledWith(1);\nexpect(e.listenerCount('x')).toBe(0);" },
        { name: 'off з оригінальним listener скасовує once', code: "const e = new EventEmitter();\nconst f = mockFn();\ne.once('x', f);\ne.off('x', f);\ne.emit('x');\nexpect(f).not.toHaveBeenCalled();\nconst g = mockFn();\nconst un = e.once('y', g);\nun();\ne.emit('y');\nexpect(g).not.toHaveBeenCalled();" },
        { name: 'відписка під час emit не пропускає сусідів', code: "const e = new EventEmitter();\nconst log = [];\nconst a = () => { log.push('a'); e.off('x', a); };\ne.on('x', a);\ne.on('x', () => log.push('b'));\ne.once('x', () => log.push('c'));\ne.once('x', () => log.push('d'));\ne.emit('x');\nexpect(log).toEqual(['a', 'b', 'c', 'd']);\ne.emit('x');\nexpect(log).toEqual(['a', 'b', 'c', 'd', 'b']);" },
        { name: 'listener, доданий під час emit, викликається з наступного emit', code: "const e = new EventEmitter();\nconst late = mockFn();\nlet added = false;\ne.on('x', () => { if (!added) { added = true; e.on('x', late); } });\ne.emit('x');\nexpect(late).not.toHaveBeenCalled();\ne.emit('x');\nexpect(late).toHaveBeenCalledTimes(1);" },
        { name: 'this у listener — emitter; події незалежні', code: "const e = new EventEmitter();\nlet ctx = null;\ne.on('x', function () { ctx = this; });\ne.once('y', function () { ctx = [ctx, this]; });\ne.emit('x');\nexpect(ctx).toBe(e);\ne.emit('y');\nexpect(ctx[1]).toBe(e);\nexpect(e.listenerCount('x')).toBe(1);\nexpect(e.listenerCount('y')).toBe(0);" },
        { name: 'екземпляри незалежні', code: "const a = new EventEmitter(), b = new EventEmitter();\nconst f = mockFn();\na.on('x', f);\nb.emit('x');\nexpect(f).not.toHaveBeenCalled();\nexpect(b.listenerCount('x')).toBe(0);" }
      ],
      explanation: `
**Структура:** \`Map<event, Entry[]>\`, де кожен запис \`{ listener, fn }\`. Масив (а не \`Set\`) — бо потрібен порядок і дублікати. Запис-об'єкт дає унікальну ідентичність кожній підписці: відписка видаляє **свій** запис, а не «якусь» підписку тієї ж функції.

**\`once\`** — обгортка, що відписується до виклику оригіналу. Оригінал зберігається в \`entry.listener\`, тому \`off(event, original)\` працює (у Node це поле \`wrapper.listener\`).

**Безпечний \`emit\`:** обхід копії масиву. Без копії, коли listener видаляє себе (\`splice\`), індекси зсуваються, і наступний слухач пропускається — класичний баг, особливо з кількома \`once\` поспіль.

**Складність:** \`on\`/\`emit\` — O(1)/O(n); \`off\` і відписка — O(n) по слухачах події. Копія в \`emit\` — O(n) пам'яті; альтернатива — копіювати масив при зміні (copy-on-write), щоб \`emit\` був без алокацій (так робить Node).

**Типові помилки:**
- \`off\` через \`filter(fn => fn !== listener)\` — видаляє **всі** підписки;
- \`once\` через обгортку без збереження оригіналу → \`off\` не працює;
- обхід «живого» масиву під час \`emit\`;
- втрата \`this\` або аргументів;
- \`this.events = {}\` → конфлікти з ключами на кшталт \`'__proto__'\` або \`'constructor'\` (\`Map\` цього позбавлена).

**Що інтерв'юер спитає далі:**
- Що робити, якщо listener кидає виняток — зупинити \`emit\` чи продовжити й зібрати помилки? (У Node — виняток летить з \`emit\`, а подія \`'error'\` без слухачів кидає.)
- Додайте wildcard-події (\`'user:*'\`) або \`prependListener\`.
- Додайте попередження про витік (\`maxListeners\`).
- Типізуйте в TypeScript: \`EventEmitter<{ login: [user: User]; logout: [] }>\`.
- Чим EventEmitter відрізняється від \`EventTarget\` у браузері?
`
    },
    {
      id: 'live-lru-cache', group: "structures",
      type: 'code',
      level: 3,
      interview: true,
      title: 'LRU-кеш з O(1) get/put',
      tags: ['data-structures', 'map', 'cache', 'classes'],
      description: `
**Завдання.** Реалізуйте клас \`LRUCache\` (Least Recently Used) з обмеженою місткістю.

**Де трапляється:** кеш відповідей API, зображень, мемоізація з обмеженням пам'яті.

\`\`\`js
const cache = new LRUCache(capacity);
\`\`\`

- \`get(key)\` — повертає значення або \`undefined\`, якщо ключа немає. Успішний \`get\` робить ключ **найсвіжішим**.
- \`put(key, value)\` — додає або оновлює значення; ключ стає найсвіжішим. Якщо після додавання **нового** ключа розмір перевищив би \`capacity\` — видаляється **найдавніше використаний** ключ.
- \`has(key)\` — чи є ключ (**не** впливає на порядок).
- \`delete(key)\` — видаляє ключ, повертає \`true\`/\`false\`.
- \`size\` — геттер з кількістю елементів.
- \`keys()\` — масив ключів від найдавнішого до найсвіжішого.

\`get\` і \`put\` мають працювати за **O(1)**.

\`\`\`js
const c = new LRUCache(2);
c.put('a', 1); c.put('b', 2);
c.get('a');      // 1 — тепер 'b' найдавніший
c.put('c', 3);   // витісняє 'b'
c.keys();        // ['a', 'c']
\`\`\`

**Як це працює:** Map пам'ятає порядок вставки. get: видалити ключ і вставити знову — він стає «найсвіжішим». put при переповненні видаляє перший ключ: map.keys().next().value — це найстаріший.
`,
      starter: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // Map зберігає порядок вставки: перший ключ — найстаріший
  }

  get(key) {
    // TODO: немає → undefined; є → видалити і вставити знову (стає найсвіжішим)
  }

  put(key, value) {
    // TODO: якщо ключ є — видалити; вставити; при переповненні видалити this.map.keys().next().value
  }
}
`,
      solution: `class LRUCache {
  #capacity;
  // Map зберігає порядок вставки: перший ключ — найдавніший, останній — найсвіжіший
  #map = new Map();

  constructor(capacity) {
    this.#capacity = capacity;
  }

  get(key) {
    if (!this.#map.has(key)) return undefined;
    const value = this.#map.get(key);
    // «перевставка» переносить ключ у кінець — O(1)
    this.#map.delete(key);
    this.#map.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.#map.has(key)) {
      this.#map.delete(key);
    } else if (this.#map.size >= this.#capacity) {
      // найдавніший — перший у порядку ітерації
      const oldest = this.#map.keys().next().value;
      this.#map.delete(oldest);
    }
    this.#map.set(key, value);
    return this;
  }

  has(key) {
    return this.#map.has(key);
  }

  delete(key) {
    return this.#map.delete(key);
  }

  get size() {
    return this.#map.size;
  }

  keys() {
    return [...this.#map.keys()];
  }
}
`,
      hints: [
        '`Map` у JavaScript ітерується в порядку вставки. Що буде, якщо видалити ключ і вставити його знову?',
        '`get`: якщо ключ є — `delete` + `set` (ключ переїде в кінець). `put`: якщо ключ новий і кеш повний — видаліть **перший** ключ: `map.keys().next().value`.',
        'Не плутайте «немає ключа» і «значення falsy»: перевіряйте `map.has(key)`, а не `if (!value)`.'
      ],
      tests: [
        { name: 'базовий сценарій витіснення', code: "const c = new LRUCache(2);\nc.put('a', 1);\nc.put('b', 2);\nexpect(c.get('a')).toBe(1);\nc.put('c', 3);\nexpect(c.get('b')).toBeUndefined();\nexpect(c.keys()).toEqual(['a', 'c']);\nexpect(c.size).toBe(2);" },
        { name: 'get оновлює «свіжість», has — ні', code: "const c = new LRUCache(2);\nc.put('a', 1); c.put('b', 2);\nexpect(c.has('a')).toBe(true);\nc.put('c', 3);\nexpect(c.has('a')).toBe(false);\nc.get('b');\nc.put('d', 4);\nexpect(c.keys()).toEqual(['b', 'd']);" },
        { name: 'put існуючого ключа оновлює значення без витіснення', code: "const c = new LRUCache(2);\nc.put('a', 1); c.put('b', 2);\nc.put('a', 10);\nexpect(c.size).toBe(2);\nexpect(c.keys()).toEqual(['b', 'a']);\nc.put('c', 3);\nexpect(c.get('a')).toBe(10);\nexpect(c.has('b')).toBe(false);" },
        { name: 'falsy-значення зберігаються коректно', code: "const c = new LRUCache(3);\nc.put('zero', 0); c.put('empty', ''); c.put('no', false);\nexpect(c.get('zero')).toBe(0);\nexpect(c.get('empty')).toBe('');\nexpect(c.get('no')).toBe(false);\nexpect(c.keys()).toEqual(['zero', 'empty', 'no']);" },
        { name: 'ключі будь-якого типу', code: "const c = new LRUCache(2);\nconst objKey = { id: 1 };\nc.put(objKey, 'obj');\nc.put(1, 'number');\nexpect(c.get(objKey)).toBe('obj');\nexpect(c.get('1')).toBeUndefined();\nexpect(c.get(1)).toBe('number');" },
        { name: 'delete і місткість 1', code: "const c = new LRUCache(1);\nc.put('a', 1);\nc.put('b', 2);\nexpect(c.keys()).toEqual(['b']);\nexpect(c.delete('b')).toBe(true);\nexpect(c.delete('b')).toBe(false);\nexpect(c.size).toBe(0);\nexpect(c.get('b')).toBeUndefined();" },
        { name: 'O(1): 200 000 операцій на кеші з 10 000 елементів', code: "const c = new LRUCache(10000);\nconst start = performance.now();\nfor (let i = 0; i < 100000; i++) {\n  c.put(i, i);\n  c.get(i - 5000);\n}\nexpect(c.size).toBe(10000);\nexpect(c.get(99999)).toBe(99999);\nexpect(c.has(80000)).toBe(false);\nexpect(performance.now() - start).toBeLessThan(1000);" }
      ],
      explanation: `
**Чому \`Map\`:** вона гарантує порядок ітерації за вставкою, а \`delete\` + \`set\` — O(1) (амортизовано). Тож «перемістити в кінець» = перевставити, а «найдавніший» = перший ключ ітератора. Отримуємо O(1) для \`get\` і \`put\`.

**Класична реалізація** (якщо інтерв'юер попросить без «магії» \`Map\`) — **хеш-таблиця + двозв'язний список**:
\`\`\`js
// map: key → node; список: head (найдавніший) ⇄ ... ⇄ tail (найсвіжіший)
// get: map.get(key) → вирізати вузол → вставити перед tail
// put: новий вузол перед tail; якщо переповнено — видалити head.next і його ключ з map
\`\`\`
Вирізання й вставка вузла в двозв'язному списку — O(1), бо є посилання на сусідів. Sentinel-вузли (фіктивні \`head\`/\`tail\`) прибирають перевірки на \`null\`.

**Складність:** O(1) на операцію, O(capacity) пам'яті.

**Типові помилки:**
- масив + \`indexOf\`/\`splice\` → O(n) (тест на 200 000 операцій це ловить);
- \`if (!this.map.get(key))\` → \`0\`, \`''\`, \`false\` вважаються відсутніми;
- витіснення при оновленні **існуючого** ключа;
- забули оновити порядок при \`put\` існуючого ключа;
- звичайний об'єкт замість \`Map\` → ключі приводяться до рядків (\`1\` і \`'1'\` зливаються), порядок числових ключів інший.

**Що інтерв'юер спитає далі:**
- Реалізуйте через двозв'язний список (без порядку \`Map\`).
- Додайте TTL (наступна задача) або обмеження за «вагою» (розмір у байтах).
- Чим LRU відрізняється від LFU і коли LFU кращий?
- Де LRU у фронтенді: кеш запитів, мемоізація селекторів з обмеженим розміром, кеш зображень, віртуалізовані списки.
`
    },
    {
      id: 'live-lru-ttl', group: "structures",
      type: 'code',
      level: 4,
      title: 'LRU-кеш з TTL (час життя записів)',
      tags: ['data-structures', 'map', 'cache', 'timers'],
      description: `
**Завдання.** Розширте LRU-кеш часом життя записів. Реалізуйте клас \`TTLCache\`:

**Де трапляється:** кеш, де дані «старіють»: токени, відповіді API.

\`\`\`js
const cache = new TTLCache({ capacity: 100, ttl: 60000 });
cache.put(key, value, ttl?); // ttl — опційний, перекриває значення за замовчуванням
\`\`\`

- Запис живе рівно \`ttl\` мс від моменту \`put\`: при \`Date.now() >= putTime + ttl\` він вважається **простроченим**.
- \`get(key)\` — значення або \`undefined\` (для відсутнього **чи простроченого**; прострочений запис при цьому видаляється). Успішний \`get\` робить ключ найсвіжішим, але **не** подовжує TTL.
- \`put(key, value, ttl = defaultTtl)\` — додає/оновлює значення, TTL і «свіжість».
- **Витіснення:** якщо при додаванні нового ключа кеш заповнений, спочатку видаляються **всі прострочені** записи; лише якщо місця все одно немає — найдавніше використаний.
- \`has(key)\` — \`false\` для простроченого; \`delete(key)\`; геттер \`size\` — кількість **непрострочених** записів.
- **Без таймерів:** прострочення перевіряється «ліниво» під час звернень (\`setTimeout\` на кожен запис не використовуйте).

**Як це працює:** Як LRU на Map, але кожен запис зберігає expiresAt. Прострочений запис поводиться як відсутній: при get видаляємо його. Перед вставкою при переповненні спершу прибираємо прострочені, потім найстаріший.
`,
      starter: `class TTLCache {
  constructor({ capacity, ttl }) {
    this.capacity = capacity;
    this.ttl = ttl;
    this.map = new Map(); // key → { value, expiresAt }
  }

  get(key) {
    // TODO: немає або прострочено (Date.now() >= expiresAt) → видалити і undefined;
    //       інакше перемістити в кінець (LRU) і повернути value
  }

  put(key, value, ttl = this.ttl) {
    // TODO: записати з expiresAt = Date.now() + ttl;
    //       при переповненні: спершу прибрати прострочені, потім найстаріший
  }

  get size() {
    // TODO: кількість НЕпрострочених записів
    return this.map.size;
  }
}
`,
      solution: `class TTLCache {
  // key → { value, expiresAt }; порядок Map = порядок «свіжості» (LRU)
  #map = new Map();

  constructor({ capacity, ttl }) {
    this.capacity = capacity;
    this.ttl = ttl;
  }

  #isExpired(entry) {
    return Date.now() >= entry.expiresAt;
  }

  #purgeExpired() {
    // видалення під час ітерації Map — безпечне
    for (const [key, entry] of this.#map) {
      if (this.#isExpired(entry)) this.#map.delete(key);
    }
  }

  get(key) {
    const entry = this.#map.get(key);
    if (!entry) return undefined;
    if (this.#isExpired(entry)) {
      this.#map.delete(key);
      return undefined;
    }
    this.#map.delete(key);
    this.#map.set(key, entry); // свіжість оновлюється, expiresAt — ні
    return entry.value;
  }

  put(key, value, ttl = this.ttl) {
    this.#map.delete(key);
    if (this.#map.size >= this.capacity) {
      this.#purgeExpired();
      if (this.#map.size >= this.capacity) {
        this.#map.delete(this.#map.keys().next().value);
      }
    }
    this.#map.set(key, { value, expiresAt: Date.now() + ttl });
    return this;
  }

  has(key) {
    const entry = this.#map.get(key);
    if (!entry) return false;
    if (this.#isExpired(entry)) {
      this.#map.delete(key);
      return false;
    }
    return true;
  }

  delete(key) {
    return this.#map.delete(key);
  }

  get size() {
    this.#purgeExpired();
    return this.#map.size;
  }
}
`,
      hints: [
        'Візьміть LRU на `Map` і зберігайте в значенні `{ value, expiresAt }`, де `expiresAt = Date.now() + ttl`.',
        'Прострочення перевіряйте при кожному зверненні (`get`, `has`); прострочений запис видаляйте одразу. `size` — після очищення прострочених.',
        'У `put` для нового ключа при заповненому кеші: спершу пройдіться по Map і видаліть прострочені; якщо місця досі немає — видаліть перший ключ (найдавніший).'
      ],
      tests: [
        { name: 'запис доступний до закінчення TTL', code: "useFakeTimers();\nconst c = new TTLCache({ capacity: 10, ttl: 1000 });\nc.put('a', 1);\nadvanceTimersByTime(999);\nexpect(c.get('a')).toBe(1);\nadvanceTimersByTime(1);\nexpect(c.get('a')).toBeUndefined();\nexpect(c.has('a')).toBe(false);" },
        { name: 'індивідуальний ttl у put', code: "useFakeTimers();\nconst c = new TTLCache({ capacity: 10, ttl: 1000 });\nc.put('short', 1, 100);\nc.put('long', 2, 5000);\nadvanceTimersByTime(100);\nexpect(c.get('short')).toBeUndefined();\nadvanceTimersByTime(2000);\nexpect(c.get('long')).toBe(2);" },
        { name: 'get не подовжує TTL; put — подовжує', code: "useFakeTimers();\nconst c = new TTLCache({ capacity: 10, ttl: 100 });\nc.put('a', 1);\nadvanceTimersByTime(60);\nexpect(c.get('a')).toBe(1);\nadvanceTimersByTime(40);\nexpect(c.get('a')).toBeUndefined();\nc.put('b', 1);\nadvanceTimersByTime(60);\nc.put('b', 2);\nadvanceTimersByTime(60);\nexpect(c.get('b')).toBe(2);" },
        { name: 'LRU-витіснення працює як у звичайному LRU', code: "useFakeTimers();\nconst c = new TTLCache({ capacity: 2, ttl: 10000 });\nc.put('a', 1); c.put('b', 2);\nc.get('a');\nc.put('c', 3);\nexpect(c.has('b')).toBe(false);\nexpect(c.get('a')).toBe(1);\nexpect(c.get('c')).toBe(3);" },
        { name: 'спершу витісняються прострочені, а не LRU', code: "useFakeTimers();\nconst c = new TTLCache({ capacity: 2, ttl: 10000 });\nc.put('a', 1, 100);\nc.put('b', 2);\nc.get('a');\nadvanceTimersByTime(200);\nc.put('c', 3);\nexpect(c.get('b')).toBe(2);\nexpect(c.get('c')).toBe(3);" },
        { name: 'size рахує лише живі записи', code: "useFakeTimers();\nconst c = new TTLCache({ capacity: 10, ttl: 100 });\nc.put('a', 1); c.put('b', 2, 50); c.put('c', 3, 500);\nexpect(c.size).toBe(3);\nadvanceTimersByTime(50);\nexpect(c.size).toBe(2);\nadvanceTimersByTime(50);\nexpect(c.size).toBe(1);\nexpect(c.delete('c')).toBe(true);\nexpect(c.size).toBe(0);" },
        { name: 'не використовує таймери', code: "useFakeTimers();\nconst c = new TTLCache({ capacity: 100, ttl: 1000 });\nfor (let i = 0; i < 50; i++) c.put(i, i);\nexpect(getTimerCount()).toBe(0);" },
        { name: 'falsy-значення і перезапис', code: "useFakeTimers();\nconst c = new TTLCache({ capacity: 2, ttl: 1000 });\nc.put('z', 0);\nexpect(c.get('z')).toBe(0);\nexpect(c.has('z')).toBe(true);\nc.put('z', false);\nexpect(c.get('z')).toBe(false);\nexpect(c.size).toBe(1);" }
      ],
      explanation: `
**Ліниве прострочення (lazy expiration):** не створюємо таймер на кожен запис (тисячі таймерів — це пам'ять, навантаження на event loop і ризик витоків), а перевіряємо \`expiresAt\` в момент звернення. Так працюють Redis (разом із періодичним вибірковим очищенням) та більшість клієнтських кешів.

**Складність:** \`get\`/\`has\`/\`delete\` — O(1). \`put\` у заповнений кеш і \`size\` — O(n) через сканування прострочених. Компроміси:
- зберігати додаткову **min-купу за \`expiresAt\`** → видалення прострочених за O(log n) кожен;
- періодичне фонове очищення (один \`setInterval\` на весь кеш, з \`unref()\` у Node);
- рахувати \`size\` приблизно (включно з простроченими), як роблять деякі бібліотеки.

**Чому спершу прострочені:** прострочений запис не має цінності, а витіснення LRU-запису, який ще живий, — втрата корисних даних. Тест «спершу витісняються прострочені» показує різницю.

**Типові помилки:**
- \`setTimeout\` на кожен \`put\` без \`clearTimeout\` при перезаписі → старий таймер видаляє **новий** запис;
- \`get\` подовжує TTL (це інша стратегія — sliding expiration; її треба явно погодити);
- \`has\` повертає \`true\` для простроченого запису;
- межа: \`>\` замість \`>=\` → запис живе на 1 мс довше.

**Що інтерв'юер спитає далі:**
- Додайте sliding expiration як опцію.
- Додайте stale-while-revalidate: повертати прострочене значення, поки йде оновлення.
- Як протестувати такий кеш без реального очікування? (Ін'єкція годинника \`now = () => Date.now()\` або фейкові таймери.)
- Чому \`Date.now()\` не підходить, якщо системний час можуть змінити, і що робити (\`performance.now()\`)?
`
    },
    {
      id: 'live-stuck-tradeoffs', group: "structures", why: ["Так: озвучити блокер, спростити задачу і порівняти варіанти — саме те, що чекають.","Ні: мовчання гірше за частково робоче рішення з поясненням.","Ні: чесно назвати межі рішення і шлях покращення — сильніше, ніж «вже оптимально».","Ні: використати підказку і рухатися далі краще, ніж застрягти."],
      type: 'theory',
      level: 3,
      title: 'Застрягли на live coding: як діяти і обговорювати trade-offs',
      tags: ['soft-skills', 'process'],
      question: 'Ви на live coding і застрягли: не бачите, як реалізувати вимогу (наприклад, обробку циклічних посилань у deepClone), або ваше рішення працює, але інтерв\'юер питає «а чи можна краще?». Як ви поведетеся і як обговорюватимете компроміси?',
      choices: [
        'Озвучити, де саме застряг, розв\'язати спрощену версію, а варіанти порівнювати за плюсами, мінусами й умовами',
        'Мовчки думати, доки не з\'явиться ідеальне рішення: частково робочий код оцінюють гірше, ніж жодного',
        'На «а чи можна краще?» відповідати, що поточне рішення вже оптимальне, щоб не показати невпевненість',
        'Відмовитися від підказки інтерв\'юера, бо вона знижує оцінку сильніше, ніж незавершене рішення'
      ],
      correct: 0,
      hint: 'Подумайте про комунікацію, спрощення задачі, підказки інтерв\'юера та про те, як формулювати порівняння варіантів.',
      answer: `
**Коли застряг — не мовчати.** Інтерв'юер не бачить, що відбувається в голові; тиша 3+ хвилини виглядає як «кандидат загубився». Алгоритм:

1. **Проговорити, де саме проблема.** «Я обходжу об'єкт рекурсивно, але на циклі \`a.self = a\` рекурсія нескінченна. Мені потрібно якось пам'ятати вже відвідані об'єкти».
2. **Спростити задачу.** Розв'язати без складної частини (без циклів, без \`Map\`), переконатися, що база працює, і повернутися до ускладнення. Частково робоче рішення краще за ідеальне ненаписане.
3. **Конкретний маленький приклад.** Пройти вручну \`{ a: 1, self: <посилання> }\` — часто рішення стає очевидним.
4. **Згадати відомі техніки:** відвідані вузли (\`WeakMap\`/\`Set\`), стек замість рекурсії, два вказівники, хеш-мапа замість вкладеного циклу, сортування, мемоізація.
5. **Прийняти підказку і подякувати.** Підказка — не провал; провал — проігнорувати її або сперечатися. Оцінюють, як ви її використаєте.
6. **Якщо час закінчується** — описати словами, як завершили б рішення, і які тести написали б.

**Як обговорювати trade-offs** — завжди за схемою «варіант → плюси → мінуси → коли обрати»:

| Варіант | Плюси | Мінуси |
|---|---|---|
| LRU на \`Map\` | коротко, O(1) | спирається на порядок \`Map\` |
| LRU на списку + хеш | класика, явний контроль | більше коду, більше місця для багів |
| Ліниве прострочення TTL | без таймерів, O(1) на get | \`size\` — O(n) або приблизний |

Корисні формулювання: «Це O(n²), але для n ≤ 100 це не важливо; якщо даних більше, я б…», «Я обираю читабельність, бо цей код рідко виконується», «Тут компроміс пам'ять ↔ час: кеш дасть O(1), але треба обмежити розмір».

**Осі компромісів, які варто згадувати:** час vs пам'ять, простота vs гнучкість, точність vs продуктивність (throttle, ліниве прострочення), мутабельність vs іммутабельність, власна реалізація vs бібліотека (lodash, React Query).

\`\`\`js
// «Спочатку просте» — потім ускладнення
function deepClone(v) {            // крок 1: без циклів
  if (v === null || typeof v !== 'object') return v;
  const copy = Array.isArray(v) ? [] : {};
  for (const k of Object.keys(v)) copy[k] = deepClone(v[k]);
  return copy;
}
// крок 2: додаємо seen = new WeakMap() і передаємо в рекурсію
\`\`\`
`,
      keyPoints: [
        'Озвучити, де саме застряг, а не мовчати',
        'Спростити задачу: робоча база, потім ускладнення',
        'Пройти маленький приклад вручну, згадати відомі техніки',
        'Приймати підказки конструктивно',
        'Trade-offs: варіант → плюси → мінуси → коли обрати (час/пам\'ять, простота/гнучкість)'
      ],
      followUps: [
        'Наведіть приклад, коли гірша асимптотика — кращий вибір.',
        'Що робити, якщо інтерв\'юер каже, що ваше рішення неправильне, а ви впевнені, що правильне?',
        'Як ви вирішуєте, чи брати бібліотеку, чи писати своє?'
      ]
    },

    // ================================================================ PARSING & RENDERING
    {
      id: 'live-template-render', group: "parsing",
      type: 'code',
      level: 2,
      title: 'Шаблонізатор: render(\'Hi {{ user.name }}\', data)',
      tags: ['strings', 'regexp', 'security'],
      description: `
**Завдання.** Реалізуйте міні-шаблонізатор у стилі Mustache: \`render(template, data)\`.

**Де трапляється:** шаблони листів, i18n-рядки з підстановками.

- \`{{ path }}\` замінюється значенням з \`data\`; пробіли всередині дужок необов'язкові. \`path\` — ключі через крапку, включно з індексами масивів: \`user.name\`, \`items.0.title\`.
- Значення **екрануються** для HTML: \`&\` → \`&amp;\`, \`<\` → \`&lt;\`, \`>\` → \`&gt;\`, \`"\` → \`&quot;\`, \`'\` → \`&#39;\`.
- \`{{{ path }}}\` (потрійні дужки) — вставка **без** екранування.
- Відсутній шлях, \`null\` або \`undefined\` → порожній рядок (без помилок, навіть якщо проміжний ключ відсутній).
- Інші значення приводяться до рядка: \`0\` → \`'0'\`, \`false\` → \`'false'\`.
- Беруться лише **власні** властивості: \`{{ toString }}\` чи \`{{ constructor }}\` не повинні діставати методи з прототипу.

\`\`\`js
render('Hi, {{ user.name }}! You have {{count}} messages.', { user: { name: 'Ann' }, count: 0 });
// 'Hi, Ann! You have 0 messages.'
render('<p>{{ bio }}</p>', { bio: '<b>me</b>' });   // '<p>&lt;b&gt;me&lt;/b&gt;</p>'
render('<p>{{{ bio }}}</p>', { bio: '<b>me</b>' }); // '<p><b>me</b></p>'
\`\`\`

**Як це працює:** Один replace з регулярним виразом знаходить усі {{ path }}. Для кожного беремо значення за шляхом через крапки, null/undefined → порожній рядок, решту екрануємо від HTML (крім {{{ raw }}}).
`,
      starter: `function render(template, data) {
  // 1. escapeHtml(str): & < > " ' → сутності
  // 2. lookup(path): 'user.name' → data.user.name (безпечно для відсутніх ключів)
  // 3. template.replace(/\\{\\{\\s*([\\w$.]+)\\s*\\}\\}/g, ...) → значення або ''
  // TODO
}

// render('Hi {{ user.name }}!', { user: { name: 'Ann' } }) → 'Hi Ann!'
`,
      solution: String.raw`function render(template, data) {
  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const escapeHtml = (str) => str.replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
  const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(Object(obj), key);

  // безпечний обхід шляху: undefined, якщо будь-який крок відсутній
  const lookup = (path) =>
    path.split('.').reduce((obj, key) => (obj != null && hasOwn(obj, key) ? obj[key] : undefined), data);

  // спершу потрійні дужки (альтернатива зліва має пріоритет), потім подвійні
  const PATTERN = /\{\{\{\s*([\w$.]+)\s*\}\}\}|\{\{\s*([\w$.]+)\s*\}\}/g;

  return template.replace(PATTERN, (match, rawPath, path) => {
    const value = lookup(rawPath || path);
    if (value == null) return '';
    const str = String(value);
    return rawPath ? str : escapeHtml(str);
  });
}
`,
      hints: [
        'Використайте `template.replace(regex, callback)` з глобальним регулярним виразом, що захоплює шлях між `{{` і `}}`.',
        'Значення за шляхом: `path.split(\'.\').reduce((obj, key) => ..., data)` — на кожному кроці перевіряйте, що `obj` не `null`/`undefined` і що ключ — власна властивість (`hasOwnProperty`).',
        'Для потрійних дужок додайте альтернативу в регулярному виразі **першою**: `/\\{\\{\\{\\s*([\\w$.]+)\\s*\\}\\}\\}|\\{\\{\\s*([\\w$.]+)\\s*\\}\\}/g` — тоді в колбеку заповниться або перша, або друга група.'
      ],
      tests: [
        "expect(render('Hi {{name}}!', { name: 'Ann' })).toBe('Hi Ann!')",
        { name: 'пробіли всередині дужок і кілька підстановок', code: "expect(render('{{ a }} + {{b}} = {{  sum  }}; again {{a}}', { a: 1, b: 2, sum: 3 })).toBe('1 + 2 = 3; again 1');" },
        { name: 'вкладені шляхи та індекси масивів', code: "const data = { user: { name: 'Bob', tags: ['admin', 'dev'] }, items: [{ title: 'First' }] };\nexpect(render('{{ user.name }}: {{ user.tags.1 }}, {{ items.0.title }}', data)).toBe('Bob: dev, First');" },
        { name: 'відсутні шляхи → порожній рядок без помилок', code: "expect(render('[{{ missing }}][{{ a.b.c }}][{{ n }}][{{ u }}]', { a: null, n: null, u: undefined })).toBe('[][][][]');" },
        { name: 'falsy-значення приводяться до рядка', code: "expect(render('{{zero}}|{{no}}|{{empty}}', { zero: 0, no: false, empty: '' })).toBe('0|false|');" },
        { name: 'HTML-екранування', code: "const html = render('<p>{{ text }}</p>', { text: '<script>alert(\"x\")</script> & \\'q\\'' });\nexpect(html).toBe('<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;q&#39;</p>');" },
        { name: 'потрійні дужки — без екранування', code: "expect(render('{{{ html }}} vs {{ html }}', { html: '<b>&</b>' })).toBe('<b>&</b> vs &lt;b&gt;&amp;&lt;/b&gt;');" },
        { name: 'лише власні властивості', code: "expect(render('[{{ toString }}][{{ constructor.name }}][{{ user.__proto__ }}]', { user: {} })).toBe('[][][]');\nexpect(render('{{ s.length }}', { s: 'abc' })).toBe('3');" },
        { name: 'текст без плейсхолдерів не змінюється', code: "expect(render('no placeholders { here }', {})).toBe('no placeholders { here }');" }
      ],
      explanation: `
\`String.prototype.replace\` з глобальним регулярним виразом і функцією-колбеком — ідеальний інструмент: один прохід по шаблону, колбек отримує захоплені групи.

**Складність:** O(n + k·d) — n довжина шаблону, k плейсхолдерів, d глибина шляху.

**Безпека:**
- **Екранування за замовчуванням** — головний захист від XSS. Небезпечний вивід має бути явним (\`{{{ }}}\` у Mustache, \`dangerouslySetInnerHTML\` у React, \`v-html\` у Vue).
- **Власні властивості:** без перевірки \`{{ constructor.constructor }}\` дістане конструктор \`Function\` — у шаблонізаторах з виконанням виразів це класичний вектор атаки (template injection).
- Екранування для атрибутів і HTML-тексту майже однакове, але в контекстах \`<script>\`, \`style\`, URL (\`href="javascript:..."\`) потрібні **інші** правила.

**Типові помилки:**
- \`value || ''\` → \`0\` і \`false\` зникають;
- \`data[path]\` замість обходу за крапками;
- \`obj[key]\` без перевірки \`null\` → \`TypeError\` на \`{{ a.b.c }}\`;
- регулярний вираз без \`g\` → замінюється лише перший плейсхолдер;
- жадібний \`.*\` всередині дужок → \`{{a}} {{b}}\` захоплюється як один плейсхолдер (тому \`[\\w$.]+\` або лінивий \`.+?\`).

**Що інтерв'юер спитає далі:**
- Додайте секції: \`{{#items}}...{{/items}}\` (цикли й умови) — як зміниться підхід? (Потрібен токенайзер і дерево, а не один \`replace\`.)
- Додайте фільтри: \`{{ name | upper }}\`.
- Як скомпілювати шаблон один раз у функцію для швидкого повторного рендерингу?
- Чому tagged template literals (тег \`html\` у бібліотеці lit) — безпечніша альтернатива рядковим шаблонам?
`
    },
    {
      id: 'live-search-query', group: 'parsing', type: 'code', level: 2,
      title: 'Парсер пошукового запиту: фільтри, "фрази" і -виключення',
      tags: ['strings', 'parsing', 'regex'],
      description: `
**Завдання.** Напишіть \`parseSearch(query)\` — розбір рядка пошуку з розширеним синтаксисом, як у GitHub, Jira чи Gmail.

**Де трапляється:** пошук у трекерах задач (\`is:open label:bug -label:wontfix\`), поштових клієнтах (\`from:ann has:attachment\`), каталогах і адмінках — один рядок замість десятка полів фільтра.

**Що написати**
- \`parseSearch(query)\` → \`{ terms, phrases, filters, exclude }\`:
  - слова через пробіли → \`terms\` (у нижньому регістрі);
  - текст у подвійних лапках → \`phrases\` як є; незакрита лапка — фраза до кінця рядка; порожня фраза \`""\` пропускається;
  - \`ключ:значення\` → \`filters[ключ]\` — **масив** значень у порядку появи; ключ — латинські літери, цифри, \`_\` або \`-\`, у нижньому регістрі; значення може бути в лапках: \`author:"Ann Lee"\`;
  - токен з \`-\` на початку → \`exclude\` без мінуса: \`-draft\` → \`'draft'\`, \`-label:wontfix\` → \`'label:wontfix'\`, \`-"old api"\` → \`'old api'\`;
  - \`ключ:\` без значення чи \`:значення\` без ключа — звичайне слово в \`terms\`;
  - зайві пробіли ігноруються; порожній запит → усі поля порожні.

**Приклад**
\`\`\`js
parseSearch('React hooks label:bug label:"good first" author:Ann -draft "custom hook"');
// {
//   terms: ['react', 'hooks'],
//   phrases: ['custom hook'],
//   filters: { label: ['bug', 'good first'], author: ['Ann'] },
//   exclude: ['draft'],
// }
\`\`\`

**Як це працює:** \`split(' ')\` тут не підходить — він рве фрази в лапках. Токенізатор іде рядком зліва направо і «відкушує» по одному токену: пробіли пропускає, фразу в лапках читає до закривальної лапки, решту — до наступного пробілу. Потім кожен токен класифікують: мінус на початку, \`ключ:\` перед значенням чи просте слово. Так влаштовані всі парсери: спершу токени, потім їхній сенс.

**Врахуйте:** ключ \`constructor:x\` — звичайний фільтр (перевіряйте наявність ключа через \`Object.hasOwn\`, а не \`filters[k] ||\`, — модуль «Об'єкти»).
`,
      starter: `function parseSearch(query) {
  const result = { terms: [], phrases: [], filters: {}, exclude: [] };
  // Токенізатор: регулярний вираз з прапорцем g і цикл for…of по query.matchAll(re).
  // Токен: необов'язковий мінус, необов'язковий «ключ:», далі "фраза в лапках" або слово без пробілів.
  // Класифікація: мінус → exclude; ключ → filters[ключ].push(значення); лапки → phrases; інакше → terms
  // TODO
  return result;
}

// Спробуйте в консолі:
// parseSearch('bug label:ui -"won\\'t fix"');
`,
      solution: `// -?            мінус (виключення)
// ([\\w-]+):(?=\\S)  ключ, за яким одразу йде значення
// "([^"]*)"?    фраза в лапках (закривальна лапка необов'язкова)
// (\\S+)         або звичайне слово
const TOKEN = /(-?)(?:([\\w-]+):(?=\\S))?(?:"([^"]*)"?|(\\S+))/g;

function parseSearch(query) {
  const result = { terms: [], phrases: [], filters: {}, exclude: [] };
  for (const [, minus, key, quoted, word] of query.matchAll(TOKEN)) {
    const value = quoted !== undefined ? quoted : word;
    if (minus) {
      result.exclude.push(key ? key + ':' + value : value);
    } else if (key) {
      const k = key.toLowerCase();
      if (!Object.hasOwn(result.filters, k)) result.filters[k] = [];
      result.filters[k].push(value);
    } else if (quoted !== undefined) {
      if (quoted) result.phrases.push(quoted);
    } else {
      result.terms.push(word.toLowerCase());
    }
  }
  return result;
}
`,
      hints: [
        'Один регулярний вираз з групами розбирає токен повністю: `/(-?)(?:([\\w-]+):(?=\\S))?(?:"([^"]*)"?|(\\S+))/g` — мінус, ключ, значення в лапках, слово.',
        'Ідіть по `query.matchAll(re)` і класифікуйте збіг: є мінус → `exclude`; є ключ → `filters`; є група лапок → `phrases`; інакше → `terms` у нижньому регістрі.',
        'Масив для нового ключа створюйте після перевірки `Object.hasOwn(result.filters, k)` — інакше `constructor` знайде метод з прототипу.'
      ],
      tests: [
        { name: 'слова і регістр', code: 'expect(parseSearch("  React   Hooks ")).toEqual({ terms: ["react", "hooks"], phrases: [], filters: {}, exclude: [] });' },
        { name: 'фрази в лапках, незакрита лапка', code: 'expect(parseSearch(\'"custom hook" use\').phrases).toEqual(["custom hook"]);\nexpect(parseSearch(\'"custom hook" use\').terms).toEqual(["use"]);\nexpect(parseSearch(\'x "нова пошта\').phrases).toEqual(["нова пошта"]);\nexpect(parseSearch(\'"" a\').phrases).toEqual([]);' },
        { name: 'фільтри — масиви, значення в лапках, ключ у нижньому регістрі', code: 'expect(parseSearch(\'label:bug label:"good first" Author:Ann\').filters).toEqual({ label: ["bug", "good first"], author: ["Ann"] });' },
        { name: 'виключення', code: 'const r = parseSearch(\'-draft -label:wontfix -"old api" x\');\nexpect(r.exclude).toEqual(["draft", "label:wontfix", "old api"]);\nexpect(r.terms).toEqual(["x"]);\nexpect(r.filters).toEqual({});' },
        { name: 'некоректні фільтри — це слова', code: 'const r = parseSearch("label: :abc");\nexpect(r.terms).toEqual(["label:", ":abc"]);\nexpect(r.filters).toEqual({});' },
        { name: 'constructor як ключ і порожній запит', code: 'expect(parseSearch("constructor:x constructor:y").filters).toEqual({ constructor: ["x", "y"] });\nexpect(parseSearch("")).toEqual({ terms: [], phrases: [], filters: {}, exclude: [] });\nexpect(parseSearch("   ").terms).toEqual([]);' },
        { name: 'повний приклад з умови', code: 'expect(parseSearch(\'React hooks label:bug label:"good first" author:Ann -draft "custom hook"\')).toEqual({ terms: ["react", "hooks"], phrases: ["custom hook"], filters: { label: ["bug", "good first"], author: ["Ann"] }, exclude: ["draft"] });' }
      ],
      explanation: `
Ключ до задачі — розділити **токенізацію** (де межі токенів, з урахуванням лапок) і **класифікацію** (що означає токен). Регулярний вираз з групами робить перше за один прохід; \`(?=\\S)\` не дає вважати \`label:\` без значення фільтром. Посимвольний цикл — рівноцінна альтернатива, яку легше розширювати (екранування \`\\"\`, дужки, \`OR\`).

**Типові помилки:** \`split(' ')\` (рве фрази); \`filters[k] ||= []\` для \`constructor\`; перетворювати на нижній регістр значення фільтрів і фраз (\`author:Ann\` — ім'я).

**Що спитають далі:** як підтримати \`OR\` і дужки (рекурсивний спуск, як у задачі «Калькулятор»); як синхронізувати розібраний запит з URL; як підсвічувати токени в полі вводу.
`
    },
    {
      id: 'live-match-path', group: "parsing",
      type: 'code',
      level: 3,
      title: 'Роутер: matchPath з параметрами, optional і wildcard',
      tags: ['strings', 'regexp', 'routing'],
      description: `
**Завдання.** Реалізуйте \`matchPath(pattern, path)\` — серце будь-якого клієнтського роутера. Повертає об'єкт параметрів або \`null\`, якщо шлях не відповідає шаблону.

**Де трапляється:** клієнтський роутер (React Router, Vue Router).

Правила шаблону:
- статичні сегменти мають збігатися **точно** (з урахуванням регістру); спецсимволи в них (\`.\`, \`+\`, \`(\`…) — звичайні символи;
- \`:name\` — параметр, що захоплює **один непорожній** сегмент; значення декодуються (\`decodeURIComponent\`);
- \`:name?\` — необов'язковий параметр; якщо сегмента немає — значення \`undefined\`;
- \`*\` (останнім сегментом) — wildcard: захоплює **решту шляху** (можливо, порожню) у параметр \`'*'\`.

Правила шляху: кінцевий \`/\` ігнорується; \`?query\` і \`#hash\` відкидаються.

\`\`\`js
matchPath('/users/:id/posts/:postId', '/users/42/posts/7');  // { id: '42', postId: '7' }
matchPath('/users/:id', '/users/42/posts');                  // null
matchPath('/:lang?/about', '/about');                        // { lang: undefined }
matchPath('/files/*', '/files/docs/cv.pdf');                 // { '*': 'docs/cv.pdf' }
\`\`\`

**Як це працює:** Перетворюємо шаблон на регулярний вираз: статичний сегмент екрануємо, ':name' стає групою ([^/]+), optional — необов'язковою групою, '*' — (.*). Потім match і збираємо параметри з груп за іменами.
`,
      starter: `function matchPath(pattern, path) {
  const keys = [];
  let source = '^';
  // 1. Для кожного сегмента шаблону:
  //    '*'      → група (.*) , ключ '*'
  //    ':id'    → група ([^/]+), ключ 'id'; ':id?' — необов'язкова група
  //    статичний → екранований текст
  // 2. new RegExp(source + '/?$') і path.match(...)
  // 3. Немає збігу → null; інакше зібрати { ключ: значення } з груп
  // TODO
  return null;
}
`,
      solution: String.raw`function matchPath(pattern, path) {
  const keys = [];
  let source = '^';

  for (const segment of pattern.split('/').filter(Boolean)) {
    if (segment === '*') {
      keys.push('*');
      source += '(?:/(.*))?';
    } else if (segment.startsWith(':')) {
      const optional = segment.endsWith('?');
      keys.push(segment.slice(1, optional ? -1 : undefined));
      source += optional ? '(?:/([^/]+))?' : '/([^/]+)';
    } else {
      // екрануємо спецсимволи регулярних виразів у статичних сегментах
      source += '/' + segment.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&');
    }
  }
  source += '/?$'; // необов'язковий кінцевий слеш

  const cleanPath = path.split(/[?#]/)[0] || '/';
  const match = new RegExp(source).exec(cleanPath);
  if (!match) return null;

  const params = {};
  keys.forEach((key, i) => {
    const raw = match[i + 1];
    if (raw === undefined) params[key] = key === '*' ? '' : undefined;
    else params[key] = decodeURIComponent(raw);
  });
  return params;
}
`,
      hints: [
        'Найпростіше — перетворити шаблон на регулярний вираз: розбийте його на сегменти й для кожного допишіть шматок регулярки, паралельно збираючи імена параметрів у масив.',
        'Відповідності: статичний сегмент → `/` + екранований текст; `:name` → `/([^/]+)`; `:name?` → `(?:/([^/]+))?`; `*` → `(?:/(.*))?`. Наприкінці — `/?$`, на початку — `^`.',
        'Перед зіставленням відріжте `?query` і `#hash`: `path.split(/[?#]/)[0]`. Група, що не взяла участі в збігу, дає `undefined` — для `*` замініть на `\'\'`.'
      ],
      tests: [
        "expect(matchPath('/users/:id/posts/:postId', '/users/42/posts/7')).toEqual({ id: '42', postId: '7' })",
        { name: 'невідповідність → null', code: "expect(matchPath('/users/:id', '/posts/1')).toBeNull();\nexpect(matchPath('/users/:id', '/users/42/posts')).toBeNull();\nexpect(matchPath('/users/:id/posts/:postId', '/users/42/posts')).toBeNull();\nexpect(matchPath('/users/:id', '/users')).toBeNull();" },
        { name: 'статичні маршрути та корінь', code: "expect(matchPath('/about', '/about')).toEqual({});\nexpect(matchPath('/about', '/About')).toBeNull();\nexpect(matchPath('/', '/')).toEqual({});\nexpect(matchPath('/', '/x')).toBeNull();" },
        { name: 'кінцевий слеш, query і hash ігноруються', code: "expect(matchPath('/users/:id', '/users/42/')).toEqual({ id: '42' });\nexpect(matchPath('/users/:id', '/users/42?tab=posts#top')).toEqual({ id: '42' });\nexpect(matchPath('/about/', '/about')).toEqual({});" },
        { name: 'порожній сегмент не є параметром', code: "expect(matchPath('/users/:id/posts', '/users//posts')).toBeNull();" },
        { name: 'декодування параметрів', code: "expect(matchPath('/users/:name', '/users/John%20Doe')).toEqual({ name: 'John Doe' });\nexpect(matchPath('/search/:q', '/search/%D0%BA%D0%B0%D0%B2%D0%B0')).toEqual({ q: 'кава' });" },
        { name: 'необов\'язкові параметри', code: "const a = matchPath('/users/:id?', '/users');\nexpect(a).not.toBeNull();\nexpect(a.id).toBeUndefined();\nexpect(matchPath('/users/:id?', '/users/5')).toEqual({ id: '5' });\nexpect(matchPath('/:lang?/about', '/en/about')).toEqual({ lang: 'en' });\nconst b = matchPath('/:lang?/about', '/about');\nexpect(b).not.toBeNull();\nexpect(b.lang).toBeUndefined();" },
        { name: 'wildcard *', code: "expect(matchPath('/files/*', '/files/docs/cv.pdf')).toEqual({ '*': 'docs/cv.pdf' });\nexpect(matchPath('/files/*', '/files')).toEqual({ '*': '' });\nexpect(matchPath('/files/*', '/images/a.png')).toBeNull();" },
        { name: 'спецсимволи в статичних сегментах — не регулярка', code: "expect(matchPath('/file.json', '/file.json')).toEqual({});\nexpect(matchPath('/file.json', '/fileXjson')).toBeNull();\nexpect(matchPath('/c++/:v', '/c++/17')).toEqual({ v: '17' });\nexpect(matchPath('/a(b)', '/a(b)')).toEqual({});" }
      ],
      explanation: `
**Компіляція шаблону в регулярний вираз** — так працюють \`path-to-regexp\` (Express, старий React Router) і багато інших роутерів. Шаблон компілюється один раз, далі зіставлення — один \`exec\`.

**Складність:** компіляція O(p), зіставлення O(n) для таких простих регулярок (немає катастрофічного backtracking, бо \`[^/]+\` не перетинається зі \`/\`).

**Альтернатива без регулярок** — посегментне порівняння двох масивів. Воно простіше для звичайних параметрів, але optional-сегменти посередині вимагають backtracking (спробувати «є сегмент» і «немає сегмента»).

**Типові помилки:**
- не екранують статичні сегменти → \`/file.json\` збігається з \`/fileXjson\`, а \`/c++\` ламає регулярку;
- \`(.+)\` замість \`([^/]+)\` → параметр «з'їдає» кілька сегментів;
- забувають \`^\`/\`$\` → \`/users/:id\` збігається з \`/admin/users/1/edit\`;
- не декодують параметри або декодують увесь шлях до розбиття (тоді \`%2F\` всередині параметра перетвориться на \`/\` і зламає сегменти).

**Що інтерв'юер спитає далі:**
- Є список маршрутів — як обрати **найспецифічніший** (\`/users/new\` vs \`/users/:id\`)? (Ранжування: статичні > динамічні > wildcard; або порядок оголошення.)
- Напишіть зворотну функцію \`generatePath('/users/:id', { id: 42 })\` з кодуванням.
- Як реалізувати вкладені маршрути (\`/users/*\` + дочірні)?
- Як працює клієнтська навігація: \`history.pushState\`, подія \`popstate\`, перехоплення кліків по \`<a>\`?
`
    },
    {
      id: 'live-csv-parse', group: "parsing",
      type: 'code',
      level: 3,
      title: 'CSV-парсер: лапки, екранування, переноси рядків',
      tags: ['parsing', 'strings', 'state-machine'],
      description: `
**Завдання.** Реалізуйте \`parseCSV(text, delimiter = ',')\` → масив рядків, кожен рядок — масив полів-рядків (за RFC 4180).

**Де трапляється:** імпорт таблиць користувачем, експорт звітів.

- Поля розділяються \`delimiter\`, записи — \`\\n\` або \`\\r\\n\`.
- Поле в подвійних лапках може містити роздільник, переноси рядків і лапки; лапка всередині такого поля записується **подвоєною**: \`""\` → \`"\`.
- Порожні поля зберігаються: \`a,,b\` → \`['a', '', 'b']\`.
- Пробіли **не** обрізаються.
- Кінцевий перенос рядка в кінці файлу **не** створює зайвий порожній запис.
- Порожній рядок → \`[]\`.
- Незакрита лапка → кидайте \`SyntaxError\`.

\`\`\`js
parseCSV('name,quote\n"Doe, John","He said ""hi"""\n');
// [['name', 'quote'], ['Doe, John', 'He said "hi"']]
\`\`\`

\`split(',')\` тут не допоможе — потрібен посимвольний розбір (скінченний автомат).

**Як це працює:** Посимвольний автомат зі станом «в лапках / поза лапками». Поза лапками кома завершує поле, \\n — рядок. У лапках подвійна лапка "" дає одну лапку, а переносом рядка поле не закінчується.
`,
      starter: `function parseCSV(text, delimiter = ',') {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    // У лапках: '""' → '"', одиночна '"' закриває лапки, інші символи (і \\n) — у поле
    // Поза лапками: '"' на початку поля відкриває лапки, delimiter завершує поле,
    //               '\\n' (або '\\r\\n') завершує рядок
    // TODO
  }
  // TODO: додати останнє поле/рядок, якщо вони не порожні
  return rows;
}
`,
      solution: String.raw`function parseCSV(text, delimiter = ',') {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let atFieldStart = true; // лапка має спецзначення лише на початку поля
  let rowHasContent = false; // щоб кінцевий \n не створював порожній запис

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'; // "" → "
          i++;
        } else {
          inQuotes = false; // закриваюча лапка
        }
      } else {
        field += ch; // усередині лапок — усе буквально, включно з \n і роздільником
      }
      continue;
    }

    if (ch === '"' && atFieldStart) {
      inQuotes = true;
      atFieldStart = false;
      rowHasContent = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = '';
      atFieldStart = true;
      rowHasContent = true;
    } else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
      if (ch === '\r') i++; // \r\n — один перенос
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      atFieldStart = true;
      rowHasContent = false;
    } else {
      field += ch;
      atFieldStart = false;
      rowHasContent = true;
    }
  }

  if (inQuotes) throw new SyntaxError('Unclosed quote in CSV');
  if (rowHasContent) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}
`,
      hints: [
        'Йдіть по рядку посимвольно, тримаючи стан: поточне поле, поточний запис і прапорець `inQuotes`.',
        'Усередині лапок: `""` → додати одну лапку і перескочити символ; одиночна `"` — вихід з лапок; будь-що інше (включно з `,` і `\\n`) — у поле. Поза лапками: роздільник завершує поле, `\\n` (або `\\r\\n`) — поле і запис.',
        'Наприкінці: якщо `inQuotes` — помилка. Останній запис додавайте лише якщо в ньому щось було (прапорець), — так кінцевий `\\n` не дасть зайвий порожній рядок, а `""` дасть `[[\'\']]`.'
      ],
      tests: [
        { name: 'простий CSV', code: String.raw`expect(parseCSV('a,b,c\n1,2,3')).toEqual([['a', 'b', 'c'], ['1', '2', '3']]);` },
        { name: 'кінцевий перенос і CRLF', code: String.raw`expect(parseCSV('a,b\r\n1,2\r\n')).toEqual([['a', 'b'], ['1', '2']]);
expect(parseCSV('x\n')).toEqual([['x']]);` },
        { name: 'порожні поля', code: String.raw`expect(parseCSV('a,,c\n,,')).toEqual([['a', '', 'c'], ['', '', '']]);
expect(parseCSV(',')).toEqual([['', '']]);` },
        { name: 'лапки: роздільник і подвоєні лапки всередині', code: String.raw`expect(parseCSV('"Doe, John","He said ""hi""",x')).toEqual([['Doe, John', 'He said "hi"', 'x']]);
expect(parseCSV('""""')).toEqual([['"']]);` },
        { name: 'переноси рядків усередині лапок', code: String.raw`expect(parseCSV('name,bio\n"Ann","line1\nline2"\n"Bob","a\r\nb"')).toEqual([['name', 'bio'], ['Ann', 'line1\nline2'], ['Bob', 'a\r\nb']]);` },
        { name: 'власний роздільник, пробіли зберігаються', code: String.raw`expect(parseCSV(' a ; b ;"c;d"', ';')).toEqual([[' a ', ' b ', 'c;d']]);
expect(parseCSV('a\tb', '\t')).toEqual([['a', 'b']]);` },
        { name: 'порожній ввід і порожнє поле в лапках', code: String.raw`expect(parseCSV('')).toEqual([]);
expect(parseCSV('""')).toEqual([['']]);
expect(parseCSV('a\n\nb')).toEqual([['a'], [''], ['b']]);` },
        { name: 'незакрита лапка → SyntaxError', code: String.raw`expect(() => parseCSV('a,"unclosed\nb')).toThrow(SyntaxError);` },
        { name: 'великий файл парситься швидко', code: String.raw`const line = '1,"two, 2","say ""x""",4\n';
const rows = parseCSV(line.repeat(20000));
expect(rows).toHaveLength(20000);
expect(rows[19999]).toEqual(['1', 'two, 2', 'say "x"', '4']);` }
      ],
      explanation: `
**Скінченний автомат** з двома основними станами — «поза лапками» і «в лапках». У стані «в лапках» роздільник і перенос рядка — звичайні символи; вихід — одиночна лапка; \`""\` — екранована лапка.

**Складність:** O(n) часу, один прохід. (Конкатенація рядків \`field += ch\` у сучасних рушіях оптимізована через ropes; для гігабайтних файлів краще \`slice\` від початку поля або стрімінговий парсер.)

**Чому не регулярні вирази:** їх можна написати, але вони складні для читання й налагодження, а переноси всередині лапок вимагають обробки всього тексту, а не рядок за рядком.

**Типові помилки:**
- \`split('\\n')\` спочатку → ламаються поля з переносами всередині лапок;
- \`""\` всередині лапок трактують як закриття + відкриття;
- зайвий порожній запис через кінцевий \`\\n\`;
- \`\\r\` лишається в останньому полі кожного рядка (Windows-файли);
- \`trim()\` полів — псує дані, де пробіли значущі.

**Що інтерв'юер спитає далі:**
- Поверніть масив об'єктів, використовуючи перший рядок як заголовки (що робити з дублікатами заголовків і різною довжиною рядків?).
- Напишіть зворотну функцію \`toCSV(rows)\`: коли поле треба брати в лапки?
- Як парсити файл на 2 ГБ у браузері, не завантажуючи його цілком (\`File.stream()\`, \`TextDecoderStream\`, стан парсера між чанками)?
- Як винести парсинг у Web Worker, щоб не блокувати UI?
- **CSV injection:** чому поля, що починаються з \`=\`, \`+\`, \`-\`, \`@\`, небезпечні при відкритті в Excel?
`
    },
    {
      id: 'live-render-to-string', group: "parsing",
      type: 'code',
      level: 3,
      title: 'renderToString для віртуального DOM',
      tags: ['vdom', 'react', 'security', 'recursion'],
      description: `
**Завдання.** Реалізуйте \`renderToString(vnode)\` — серверний рендеринг віртуального DOM у HTML-рядок (як \`ReactDOMServer.renderToString\`, спрощено).

**Де трапляється:** SSR: як React перетворює дерево на HTML.

**Вузли:**
- рядок/число → текст, **екранований** (\`&\`, \`<\`, \`>\`, \`"\`, \`'\` → \`&amp;\`, \`&lt;\`, \`&gt;\`, \`&quot;\`, \`&#39;\`);
- \`null\`, \`undefined\`, \`true\`, \`false\` → нічого не рендериться;
- масив → рендер кожного елемента (будь-яка вкладеність);
- \`{ type, props, children }\` — елемент; \`props\` і \`children\` необов'язкові; \`children\` — вузол або масив вузлів;
- якщо \`type\` — **функція** (компонент), рендериться результат \`type({ ...props, children })\`.

**Атрибути (\`props\`):**
- \`className\` → \`class\`, \`htmlFor\` → \`for\`;
- значення екрануються; \`true\` → булевий атрибут без значення (\`disabled\`); \`false\`, \`null\`, \`undefined\` → атрибут пропускається; \`0\` і \`''\` — рендеряться (\`value="0"\`, \`alt=""\`);
- функції (обробники \`onClick\` тощо) і проп \`key\` — не рендеряться;
- \`style\`-об'єкт → \`style="font-size:12px;color:red"\` (camelCase → kebab-case, \`null\`/\`''\` пропускаються).

**Void-елементи** (\`area, base, br, col, embed, hr, img, input, link, meta, source, track, wbr\`) рендеряться без закриваючого тегу і без дітей.

\`\`\`js
renderToString({ type: 'button', props: { className: 'btn', disabled: true, onClick() {} }, children: ['Save & exit'] });
// '<button class="btn" disabled>Save &amp; exit</button>'
\`\`\`

**Як це працює:** Рекурсія по дереву: рядок/число → екранований текст, масив → конкатенація дітей, вузол → '<tag атрибути>' + діти + '</tag>'. className стає class, boolean-атрибути пишуться без значення, void-теги не мають закриваючого.
`,
      starter: `const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

function escapeHtml(value) {
  // TODO: & < > " ' → сутності
}

function renderToString(vnode) {
  // 1. null/false/true → ''; рядок/число → escapeHtml
  // 2. Масив → рендер кожного і склеїти
  // 3. { type, props, children }:
  //    атрибути (className → class, true → лише ім'я, false/null → пропустити, style-об'єкт → рядок)
  //    void-тег → без закриваючого; інакше '<tag ...>' + діти + '</tag>'
  // TODO
}
`,
      solution: `const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

function styleToString(style) {
  return Object.entries(style)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([prop, value]) => prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) + ':' + value)
    .join(';');
}

function renderAttributes(props) {
  let out = '';
  for (const [name, value] of Object.entries(props)) {
    if (name === 'key' || name === 'children') continue;
    if (value === null || value === undefined || value === false) continue;
    if (typeof value === 'function') continue; // обробники подій не потрапляють у HTML
    const attr = name === 'className' ? 'class' : name === 'htmlFor' ? 'for' : name;
    if (value === true) {
      out += ' ' + attr; // булевий атрибут
      continue;
    }
    const str = name === 'style' && typeof value === 'object' ? styleToString(value) : String(value);
    out += ' ' + attr + '="' + escapeHtml(str) + '"';
  }
  return out;
}

function renderToString(vnode) {
  if (vnode === null || vnode === undefined || typeof vnode === 'boolean') return '';
  if (typeof vnode === 'string' || typeof vnode === 'number') return escapeHtml(vnode);
  if (Array.isArray(vnode)) return vnode.map(renderToString).join('');

  const { type, props = {}, children = [] } = vnode;
  if (typeof type === 'function') {
    return renderToString(type({ ...props, children }));
  }

  const open = '<' + type + renderAttributes(props) + '>';
  if (VOID_TAGS.has(type)) return open; // <br>, <img ...> — без дітей і закриття
  return open + renderToString(children) + '</' + type + '>';
}
`,
      hints: [
        'Рекурсія за типом вузла: «порожні» значення → `\'\'`; рядок/число → екранований текст; масив → `map(renderToString).join(\'\')`; об\'єкт → тег; функція в `type` → виклик компонента.',
        'Атрибути збирайте окремою функцією: пропустіть `key`, функції, `false/null/undefined`; перейменуйте `className`/`htmlFor`; `true` → лише ім\'я; інакше `name="escaped"`. Увага: `0` — валідне значення!',
        'Для void-тегів поверніть лише відкриваючий тег. `style`: `Object.entries(style).map(([k, v]) => k.replace(/[A-Z]/g, m => \'-\' + m.toLowerCase()) + \':\' + v).join(\';\')`.'
      ],
      tests: [
        "expect(renderToString({ type: 'div', props: {}, children: ['Hello'] })).toBe('<div>Hello</div>')",
        { name: 'вкладеність, числа, пропуск null/boolean', code: "const tree = { type: 'ul', children: [{ type: 'li', children: ['a'] }, null, false, { type: 'li', children: [1, ' ', 0] }, true, undefined] };\nexpect(renderToString(tree)).toBe('<ul><li>a</li><li>1 0</li></ul>');\nexpect(renderToString({ type: 'p' })).toBe('<p></p>');\nexpect(renderToString({ type: 'p', children: 'single' })).toBe('<p>single</p>');" },
        { name: 'екранування тексту (XSS)', code: "expect(renderToString({ type: 'p', children: ['<img src=x onerror=alert(1)> & \"q\" \\'s\\''] })).toBe('<p>&lt;img src=x onerror=alert(1)&gt; &amp; &quot;q&quot; &#39;s&#39;</p>');" },
        { name: 'className, htmlFor і екранування атрибутів', code: "expect(renderToString({ type: 'label', props: { className: 'lbl big', htmlFor: 'email', title: 'He said \"hi\" & <left>' }, children: ['Email'] }))\n  .toBe('<label class=\"lbl big\" for=\"email\" title=\"He said &quot;hi&quot; &amp; &lt;left&gt;\">Email</label>');" },
        { name: 'булеві атрибути, 0 і порожній рядок', code: "expect(renderToString({ type: 'input', props: { disabled: true, checked: false, value: 0, placeholder: null, title: undefined, alt: '' } }))\n  .toBe('<input disabled value=\"0\" alt=\"\">');" },
        { name: 'void-елементи', code: "expect(renderToString({ type: 'div', children: ['a', { type: 'br' }, 'b', { type: 'img', props: { src: '/x.png', alt: 'X' }, children: ['ignored'] }] }))\n  .toBe('<div>a<br>b<img src=\"/x.png\" alt=\"X\"></div>');" },
        { name: 'обробники подій і key не рендеряться', code: "expect(renderToString({ type: 'button', props: { key: 'k1', onClick: () => {}, type: 'submit' }, children: ['Go'] })).toBe('<button type=\"submit\">Go</button>');" },
        { name: 'style-об\'єкт', code: "expect(renderToString({ type: 'div', props: { style: { fontSize: '12px', backgroundColor: 'red', margin: 0, color: null, border: '' } } }))\n  .toBe('<div style=\"font-size:12px;background-color:red;margin:0\"></div>');" },
        { name: 'функціональні компоненти і вкладені масиви', code: "const Item = ({ label }) => ({ type: 'li', children: [label] });\nconst List = ({ items, children }) => ({ type: 'ul', props: { className: 'list' }, children: [items.map((label) => ({ type: Item, props: { label } })), children] });\nexpect(renderToString({ type: List, props: { items: ['a', 'b'] }, children: [{ type: 'li', children: ['c'] }] }))\n  .toBe('<ul class=\"list\"><li>a</li><li>b</li><li>c</li></ul>');" }
      ],
      explanation: `
Це рекурсивний обхід дерева з диспетчеризацією за типом вузла. Саме так (у значно складнішому вигляді) працює SSR у React/Preact/Vue.

**Складність:** O(n) за кількістю вузлів + розмір виводу. Для великих сторінок краще будувати масив частин і робити один \`join\` або стрімити HTML (\`renderToPipeableStream\`), щоб браузер почав парсити раніше.

**Безпека — головне тут:** будь-який текст і будь-яке значення атрибута екрануються. Окремо варто згадати:
- \`href="javascript:alert(1)"\` екранування **не** зупиняє — потрібна перевірка протоколу URL;
- \`dangerouslySetInnerHTML\` в React — свідомий «прохід» без екранування;
- імена атрибутів і тегів теж треба валідувати, якщо вони приходять ззовні.

**Нюанси React, які можна згадати:** React додає \`<!-- -->\` між сусідніми текстовими вузлами (щоб гідратація правильно їх розділила), \`style\` числа без одиниць доповнює \`px\` (крім unitless-властивостей на кшталт \`opacity\`, \`zIndex\`), \`value\`/\`checked\` у контрольованих полях — особливі випадки.

**Типові помилки:**
- \`if (!value) continue\` → губиться \`value="0"\` і \`alt=""\`;
- \`disabled="false"\` — для HTML це все одно **увімкнений** атрибут (важлива наявність, а не значення);
- закриваючий тег для \`<br>\`/\`<img>\` → \`<br></br>\` браузер парсить як два \`<br>\`;
- рендер обробників як \`onclick="() => {}"\`;
- забувають, що \`children\` може бути одиничним вузлом, а не масивом.

**Що інтерв'юер спитає далі:**
- Напишіть \`render(vnode, container)\` для клієнта: створення DOM-вузлів через \`createElement\`, навішування обробників.
- Як працює **гідратація** і чому розбіжність серверного й клієнтського HTML — проблема?
- Реалізуйте \`diff(oldVNode, newVNode)\` — мінімальні зміни DOM (reconciliation, роль \`key\`).
- Як підтримати \`Fragment\` і асинхронні компоненти (Suspense)?
`
    },
    {
      id: 'live-calculator', group: "parsing",
      type: 'code',
      level: 4,
      title: 'Калькулятор виразів без eval',
      tags: ['parsing', 'recursion', 'algorithms'],
      description: `
**Завдання.** Реалізуйте \`evaluate(expression)\` — обчислення арифметичного виразу **без** \`eval\`, \`new Function\` та їхніх аналогів.

**Де трапляється:** формули в таблицях і калькуляторах; перевіряє вміння парсити.

Підтримується:
- числа, зокрема дробові (\`3.14\`, \`.5\`);
- бінарні \`+ - * /\` з правильним **пріоритетом** (\`*\` і \`/\` вище) та **лівою асоціативністю** (\`10 - 4 - 3 = 3\`, \`100 / 10 / 5 = 2\`);
- унарні \`-\` і \`+\` (\`-5\`, \`2 * -3\`, \`-(1 + 2)\`, \`--4\`);
- дужки будь-якої вкладеності;
- довільні пробіли.

Помилки:
- некоректний вираз (порожній, невідомий символ, незбалансовані дужки, два числа поспіль, оператор без операнда, \`1..2\`) → \`SyntaxError\`;
- ділення на нуль → \`RangeError\`.

\`\`\`js
evaluate('2 + 3 * (4 - 1)');   // 11
evaluate('-(2 + 3) * 2');      // -10
evaluate('2 +');               // SyntaxError
\`\`\`

> Підказка до архітектури: розділіть роботу на **токенайзер** (рядок → токени) і **парсер** (рекурсивний спуск або алгоритм сортувальної станції).

**Як це працює:** Два етапи: токенізація (числа, оператори, дужки) і рекурсивний спуск з пріоритетами: expression = term (+|− term)*, term = factor (*|/ factor)*, factor = число | (expression) | −factor.
`,
      starter: `function tokenize(str) {
  // TODO: масив токенів: числа (зокрема .5 і 3.14), + - * / ( ); пробіли пропускати
}

function evaluate(expression) {
  const tokens = tokenize(expression);
  let pos = 0;
  // Рекурсивний спуск (пріоритет зростає донизу):
  // parseExpression: parseTerm, далі (+|-) parseTerm ...
  // parseTerm:       parseFactor, далі (*|/) parseFactor ...
  // parseFactor:     число | '(' parseExpression ')' | '-' parseFactor
  // TODO; наприкінці перевірити, що всі токени спожиті
}

// evaluate('2 + 3 * (4 - 1)') → 11
`,
      solution: String.raw`function tokenize(str) {
  const tokens = [];
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if (ch === ' ' || ch === '\t' || ch === '\n') {
      i++;
    } else if ('+-*/()'.includes(ch)) {
      tokens.push(ch);
      i++;
    } else if ((ch >= '0' && ch <= '9') || ch === '.') {
      let j = i;
      while (j < str.length && ((str[j] >= '0' && str[j] <= '9') || str[j] === '.')) j++;
      const text = str.slice(i, j);
      const num = Number(text); // '1..2', '.' → NaN
      if (Number.isNaN(num)) throw new SyntaxError('Invalid number: ' + text);
      tokens.push(num);
      i = j;
    } else {
      throw new SyntaxError('Unexpected character: ' + ch);
    }
  }
  return tokens;
}

// Граматика (рекурсивний спуск):
//   expression := term (('+' | '-') term)*
//   term       := factor (('*' | '/') factor)*
//   factor     := ('+' | '-') factor | number | '(' expression ')'
function evaluate(expression) {
  const tokens = tokenize(expression);
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function parseExpression() {
    let value = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = next();
      const right = parseTerm();
      value = op === '+' ? value + right : value - right; // цикл дає ліву асоціативність
    }
    return value;
  }

  function parseTerm() {
    let value = parseFactor();
    while (peek() === '*' || peek() === '/') {
      const op = next();
      const right = parseFactor();
      if (op === '/') {
        if (right === 0) throw new RangeError('Division by zero');
        value /= right;
      } else {
        value *= right;
      }
    }
    return value;
  }

  function parseFactor() {
    const token = next();
    if (token === '-') return -parseFactor();
    if (token === '+') return +parseFactor();
    if (token === '(') {
      const value = parseExpression();
      if (next() !== ')') throw new SyntaxError('Expected ")"');
      return value;
    }
    if (typeof token === 'number') return token;
    throw new SyntaxError('Unexpected token: ' + (token === undefined ? 'end of input' : token));
  }

  const result = parseExpression();
  if (pos < tokens.length) throw new SyntaxError('Unexpected token: ' + tokens[pos]);
  return result;
}
`,
      hints: [
        'Спершу токенайзер: пропускайте пробіли, оператори й дужки — окремі токени, послідовність цифр і крапок — одне число (`Number(text)`, перевірка на `NaN`).',
        'Рекурсивний спуск: кожен рівень пріоритету — окрема функція. `expression` обробляє `+ -` у циклі, викликаючи `term`; `term` обробляє `* /`, викликаючи `factor`; `factor` — унарний мінус, число або дужки.',
        'Цикл `while` (а не рекурсія праворуч) дає ліву асоціативність. Після розбору всього виразу перевірте, що токени закінчились (`pos === tokens.length`), інакше `1 2` чи `1 + 2)` пройдуть без помилки.'
      ],
      tests: [
        { name: 'базові операції та ліва асоціативність', code: "expect(evaluate('2 + 3')).toBe(5);\nexpect(evaluate('10 - 4 - 3')).toBe(3);\nexpect(evaluate('100 / 10 / 5')).toBe(2);\nexpect(evaluate('2 * 3 * 4')).toBe(24);" },
        { name: 'пріоритет операцій', code: "expect(evaluate('2 + 3 * 4')).toBe(14);\nexpect(evaluate('2 * 3 + 4')).toBe(10);\nexpect(evaluate('2 + 3 * (4 - 1)')).toBe(11);\nexpect(evaluate('20 - 6 / 3 * 2')).toBe(16);" },
        { name: 'вкладені дужки', code: "expect(evaluate('((2 + 3) * (4 - 1)) / 5')).toBe(3);\nexpect(evaluate('(((7)))')).toBe(7);\nexpect(evaluate('2 * (3 + (4 - (1 + 1)) * 2)')).toBe(14);" },
        { name: 'унарні мінус і плюс', code: "expect(evaluate('-5 + 2')).toBe(-3);\nexpect(evaluate('2 * -3')).toBe(-6);\nexpect(evaluate('-(2 + 3) * 2')).toBe(-10);\nexpect(evaluate('--4')).toBe(4);\nexpect(evaluate('2 - -3')).toBe(5);\nexpect(evaluate('+7')).toBe(7);" },
        { name: 'дробові числа і пробіли', code: "expect(evaluate('  1.5*2 ')).toBe(3);\nexpect(evaluate('.5 + .25')).toBe(0.75);\nexpect(evaluate('0.1 + 0.2')).toBeCloseTo(0.3, 10);\nexpect(evaluate('2+2*2')).toBe(6);\nexpect(evaluate('42')).toBe(42);" },
        { name: 'некоректні вирази → SyntaxError', code: "['', '   ', '2 +', '* 3', '(1 + 2', '1 + 2)', '2 $ 3', '1 2', '1..2', '()', '2 (3)'].forEach((expr) => {\n  expect(() => evaluate(expr)).toThrow(SyntaxError);\n});" },
        { name: 'ділення на нуль → RangeError', code: "expect(() => evaluate('1 / 0')).toThrow(RangeError);\nexpect(() => evaluate('5 / (2 - 2)')).toThrow(RangeError);" },
        { name: 'не використовує eval / Function', code: "const origEval = globalThis.eval;\nconst origFunction = globalThis.Function;\nglobalThis.eval = () => { throw new Error('eval заборонено'); };\nglobalThis.Function = function () { throw new Error('Function заборонено'); };\ntry {\n  expect(evaluate('2 + 3 * (4 - 1)')).toBe(11);\n} finally {\n  globalThis.eval = origEval;\n  globalThis.Function = origFunction;\n}" },
        { name: 'довгі та глибоко вкладені вирази', code: "expect(evaluate('1+'.repeat(10000) + '1')).toBe(10001);\nexpect(evaluate('('.repeat(500) + '2*3' + ')'.repeat(500))).toBe(6);" }
      ],
      explanation: `
**Рекурсивний спуск:** граматика з рівнями пріоритету перетворюється на набір взаємно рекурсивних функцій — по одній на рівень. Нижчий пріоритет (\`+ -\`) викликає вищий (\`* /\`), той — найвищий (унарні операції, числа, дужки). Дужки повертають нас на найнижчий рівень — звідси довільна вкладеність.

**Складність:** O(n) — кожен токен обробляється один раз. Глибина рекурсії = глибині вкладеності дужок.

**Альтернатива — алгоритм сортувальної станції (shunting-yard, Дейкстра):** два стеки (операнди й оператори); оператор з вищим або рівним (для лівоасоціативних) пріоритетом на вершині стеку «виштовхується» й обчислюється. Ітеративний, легко розширюється таблицею пріоритетів, але унарний мінус вимагає окремого токена (визначати за попереднім токеном).

**Типові помилки:**
- обчислення зліва направо без пріоритетів;
- права асоціативність через рекурсію \`expression := term ('-' expression)?\` → \`10 - 4 - 3 = 9\`;
- унарний мінус як частина числа в токенайзері → \`2-3\` стає \`[2, -3]\`;
- не перевіряють залишок токенів → \`1 2\` повертає \`1\`;
- \`parseFloat('1..2')\` повертає \`1\` — тихо «ковтає» помилку (тому \`Number\`).

**Що інтерв'юер спитає далі:**
- Додайте \`^\` або \`**\` — **правоасоціативний** оператор (\`2 ** 3 ** 2 = 512\`) з пріоритетом вищим за унарний мінус.
- Додайте змінні та функції: \`evaluate('max(a, 2) * pi', { a: 5 })\`.
- Побудуйте AST замість миттєвого обчислення — навіщо? (оптимізації, повторне обчислення з різними змінними, підсвітка помилок з позицією).
- Як повідомляти позицію помилки (\`Unexpected token at 5\`)?
- Чому \`eval\` небезпечний і що таке CSP \`unsafe-eval\`?
`
    },

    // ================================================================ UI WIDGETS (DOM)
    {
      id: 'live-star-rating', group: "widgets",
      type: 'dom',
      level: 2,
      title: 'Віджет рейтингу (зірки) з клавіатурою',
      tags: ['dom', 'events', 'a11y', 'delegation'],
      description: `
**Завдання.** Реалізуйте \`createRating(container, { max = 5, value = 0, onChange })\` — компонент оцінки зірками.

**Де трапляється:** відгуки й оцінки в e-commerce; доступний віджет з клавіатурою.

**Розмітка:** у \`container\` створіть \`max\` кнопок \`<button type="button" class="star">★</button>\` з атрибутами:
- \`data-value\` — номер зірки (1…max);
- \`aria-label\` — \`"Оцінка N з M"\`;
- \`aria-pressed\` — \`"true"\` для зірок \`≤ value\`, інакше \`"false"\`.

Зірки з номером \`≤ value\` мають клас \`active\`.

**Поведінка:**
- клік по зірці N встановлює значення N; клік по зірці, що **дорівнює** поточному значенню, — скидає оцінку до 0;
- клавіатура (\`keydown\` на будь-якій зірці): \`ArrowRight\`/\`ArrowUp\` — +1, \`ArrowLeft\`/\`ArrowDown\` — −1, \`Home\` — 0, \`End\` — max; значення обмежене діапазоном 0…max; для цих клавіш викликайте \`preventDefault()\` (щоб сторінка не скролилась);
- \`onChange(newValue)\` викликається лише при **фактичній** зміні значення користувачем;
- hover-превʼю: при \`mouseover\` на зірці N зірки \`≤ N\` отримують клас \`preview\`; при \`mouseleave\` з контейнера клас \`preview\` знімається.

**Повертає** \`{ getValue(), setValue(v) }\` — \`setValue\` оновлює UI, **не** викликаючи \`onChange\`.

Використовуйте **делегування** — по одному обробнику кожного типу на контейнер. Тести створюють власні контейнери.

**Як це працює:** Кнопки-зірки в контейнері з role="radiogroup". Клік або клавіші (стрілки, Home/End) змінюють значення; від нього залежать aria-checked, клас активних зірок і виклик onChange.
`,
      html: `<div id="rating"></div>
<p>Ваша оцінка: <span id="out">0</span></p>`,
      css: `body { font-family: system-ui, sans-serif; }
.star {
  font-size: 32px;
  line-height: 1;
  padding: 0 2px;
  border: 0;
  background: none;
  color: #ccc;
  cursor: pointer;
}
.star.active { color: #f5a623; }
.star.preview { color: #ffd27a; }
.star:focus-visible { outline: 2px solid #4a7dff; border-radius: 4px; }
`,
      js: `function createRating(container, { max = 5, value = 0, onChange } = {}) {
  // ваш код
}

createRating(document.getElementById('rating'), {
  value: 0,
  onChange: (v) => { document.getElementById('out').textContent = v; },
});
`,
      editable: ['js'],
      solution: {
        js: `function createRating(container, { max = 5, value = 0, onChange } = {}) {
  let current = clamp(value);
  let preview = 0;

  function clamp(v) {
    return Math.max(0, Math.min(max, v));
  }

  const stars = [];
  container.replaceChildren();
  for (let i = 1; i <= max; i++) {
    const star = document.createElement('button');
    star.type = 'button';
    star.className = 'star';
    star.dataset.value = String(i);
    star.setAttribute('aria-label', 'Оцінка ' + i + ' з ' + max);
    star.textContent = '★';
    stars.push(star);
  }
  container.append(...stars);

  function update() {
    stars.forEach((star, index) => {
      const n = index + 1;
      star.classList.toggle('active', n <= current);
      star.classList.toggle('preview', n <= preview);
      star.setAttribute('aria-pressed', String(n <= current));
    });
  }

  function change(next) {
    next = clamp(next);
    if (next === current) return; // onChange лише при реальній зміні
    current = next;
    update();
    if (onChange) onChange(current);
  }

  const starFrom = (target) => {
    const star = target.closest('.star');
    return star && container.contains(star) ? star : null;
  };

  container.addEventListener('click', (e) => {
    const star = starFrom(e.target);
    if (!star) return;
    const n = Number(star.dataset.value);
    change(n === current ? 0 : n);
  });

  container.addEventListener('keydown', (e) => {
    const map = {
      ArrowRight: current + 1,
      ArrowUp: current + 1,
      ArrowLeft: current - 1,
      ArrowDown: current - 1,
      Home: 0,
      End: max,
    };
    if (!Object.prototype.hasOwnProperty.call(map, e.key)) return;
    e.preventDefault();
    change(map[e.key]);
  });

  container.addEventListener('mouseover', (e) => {
    const star = starFrom(e.target);
    if (!star) return;
    preview = Number(star.dataset.value);
    update();
  });

  container.addEventListener('mouseleave', () => {
    preview = 0;
    update();
  });

  update();

  return {
    getValue: () => current,
    setValue(v) {
      current = clamp(v);
      update();
    },
  };
}

createRating(document.getElementById('rating'), {
  value: 0,
  onChange: (v) => { document.getElementById('out').textContent = v; },
});
`
      },
      hints: [
        'Створіть кнопки в циклі, збережіть їх у масив і напишіть функцію `update()`, яка за поточним значенням виставляє класи `active`/`preview` і `aria-pressed`.',
        'Один обробник `click` на контейнері: `e.target.closest(\'.star\')` → номер з `dataset.value`; якщо він дорівнює поточному — скидайте до 0. Уся зміна значення — через одну функцію `change(next)` з обмеженням діапазону й перевіркою «чи змінилось».',
        '`keydown` теж на контейнері (подія спливає від сфокусованої кнопки): мапа «клавіша → нове значення», `preventDefault()` для відомих клавіш. Для превʼю — `mouseover` (спливає) і `mouseleave` на контейнері.'
      ],
      tests: [
        { name: 'рендерить max кнопок з активними зірками та aria', code: "const root = document.createElement('div');\ndocument.body.append(root);\nconst api = createRating(root, { max: 5, value: 2 });\nconst stars = $$('.star', root);\nexpect(stars).toHaveLength(5);\nexpect(stars[0].tagName).toBe('BUTTON');\nexpect(stars.map((s) => s.classList.contains('active'))).toEqual([true, true, false, false, false]);\nexpect(stars.map((s) => s.getAttribute('aria-pressed'))).toEqual(['true', 'true', 'false', 'false', 'false']);\nexpect(stars[4].getAttribute('aria-label')).toBe('Оцінка 5 з 5');\nexpect(stars[2].dataset.value).toBe('3');\nexpect(api.getValue()).toBe(2);" },
        { name: 'клік встановлює значення і викликає onChange', code: "const root = document.createElement('div');\ndocument.body.append(root);\nconst onChange = mockFn();\nconst api = createRating(root, { max: 4, onChange });\nclick($$('.star', root)[2]);\nexpect(api.getValue()).toBe(3);\nexpect(onChange).toHaveBeenCalledWith(3);\nexpect($$('.star.active', root)).toHaveLength(3);" },
        { name: 'повторний клік по поточній зірці скидає до 0', code: "const root = document.createElement('div');\ndocument.body.append(root);\nconst onChange = mockFn();\nconst api = createRating(root, { value: 4, onChange });\nclick($$('.star', root)[3]);\nexpect(api.getValue()).toBe(0);\nexpect(onChange).toHaveBeenLastCalledWith(0);\nexpect($$('.star.active', root)).toHaveLength(0);" },
        { name: 'клавіатура: стрілки, Home/End, межі діапазону', code: "const root = document.createElement('div');\ndocument.body.append(root);\nconst onChange = mockFn();\nconst api = createRating(root, { max: 3, value: 1, onChange });\nconst star = $('.star', root);\nconst ev = press(star, 'ArrowRight');\nexpect(ev.defaultPrevented).toBe(true);\nexpect(api.getValue()).toBe(2);\npress(star, 'ArrowUp');\npress(star, 'ArrowRight');\nexpect(api.getValue()).toBe(3);\nexpect(onChange).toHaveBeenCalledTimes(2);\npress(star, 'ArrowLeft');\nexpect(api.getValue()).toBe(2);\npress(star, 'Home');\nexpect(api.getValue()).toBe(0);\npress(star, 'ArrowDown');\nexpect(api.getValue()).toBe(0);\npress(star, 'End');\nexpect(api.getValue()).toBe(3);\nexpect(press(star, 'a').defaultPrevented).toBe(false);" },
        { name: 'hover-превʼю', code: "const root = document.createElement('div');\ndocument.body.append(root);\ncreateRating(root, { value: 1 });\nconst stars = $$('.star', root);\ndispatch(stars[2], 'mouseover');\nexpect(stars.map((s) => s.classList.contains('preview'))).toEqual([true, true, true, false, false]);\nexpect($$('.star.active', root)).toHaveLength(1);\ndispatch(root, 'mouseleave', { bubbles: false });\nexpect($$('.star.preview', root)).toHaveLength(0);" },
        { name: 'setValue без onChange; екземпляри незалежні', code: "const a = document.createElement('div');\nconst b = document.createElement('div');\ndocument.body.append(a, b);\nconst onChange = mockFn();\nconst ra = createRating(a, { onChange });\nconst rb = createRating(b, { max: 10, value: 7 });\nra.setValue(4);\nexpect(onChange).not.toHaveBeenCalled();\nexpect($$('.star.active', a)).toHaveLength(4);\nexpect(rb.getValue()).toBe(7);\nexpect($$('.star', b)).toHaveLength(10);\nclick($$('.star', b)[0]);\nexpect(ra.getValue()).toBe(4);" },
        { name: 'демо на сторінці оновлює #out', code: "click($$('#rating .star')[3]);\nexpect($('#out').textContent).toBe('4');" }
      ],
      explanation: `
**Архітектура маленького компонента:** стан (\`current\`, \`preview\`) → одна функція \`update()\`, що синхронізує DOM зі станом → обробники подій лише змінюють стан. Це той самий принцип, що в React (UI = f(state)), але вручну.

**Делегування:** один обробник на контейнер замість \`max\` обробників на кнопках. \`mouseover\` спливає (на відміну від \`mouseenter\`), тому підходить для делегування; \`mouseleave\` вішаємо на сам контейнер — він спрацює, коли курсор покине весь віджет.

**Доступність (a11y):**
- \`<button>\` — фокусується з клавіатури, активується Enter/Space «з коробки»; \`<span>\` з \`onclick\` цього не вміє;
- \`aria-label\` дає зрозумілий текст для скрінрідерів замість «зірочка»;
- \`aria-pressed\` повідомляє стан. Альтернатива, ближча до ARIA Authoring Practices, — \`role="radiogroup"\` + \`role="radio"\` з \`aria-checked\` і roving tabindex (лише одна зірка в Tab-порядку, стрілки рухають фокус).
- \`preventDefault()\` для стрілок — інакше сторінка скролиться.

**Типові помилки:**
- обробник на кожній зірці + забуте видалення при перерендері;
- \`onChange\` викликається, навіть коли значення не змінилось;
- \`mouseenter\` замість \`mouseover\` для делегування (не спливає);
- значення виходить за межі 0…max;
- \`innerHTML\` з конкатенацією для кожної зміни → втрачається фокус.

**Що інтерв'юер спитає далі:**
- Додайте половинки зірок (оцінка 3.5) — як визначати половину за \`offsetX\`?
- Зробіть режим \`readOnly\`.
- Реалізуйте roving tabindex і \`role="radiogroup"\`.
- Як зробити це React-компонентом (контрольований vs неконтрольований, \`value\` + \`onChange\`)?
`
    },
    {
      id: 'live-countdown', group: "widgets",
      type: 'dom',
      level: 2,
      title: 'Таймер зворотного відліку: start / pause / reset',
      tags: ['dom', 'timers', 'state'],
      description: `
**Завдання.** Реалізуйте \`createCountdown(root, { seconds, onFinish })\` — віджет зворотного відліку.

**Де трапляється:** таймери акцій, OTP-коди, обмеження часу на тест.

**Розмітка** (створіть усередині \`root\`):
\`\`\`html
<span class="time">01:30</span>
<button type="button" class="start">Старт</button>
<button type="button" class="pause">Пауза</button>
<button type="button" class="reset">Скинути</button>
\`\`\`

**Поведінка:**
- \`.time\` показує залишок у форматі \`mm:ss\` (з провідними нулями);
- **Старт** — відлік щосекунди; повторний старт під час роботи **не прискорює** таймер;
- **Пауза** — зупиняє; наступний старт продовжує з того ж місця;
- **Скинути** — зупиняє і повертає початкове значення;
- на \`00:00\` таймер зупиняється сам, \`root\` отримує клас \`finished\`, \`onFinish()\` викликається **один раз**; після цього старт нічого не робить, доки не натиснути «Скинути» (воно ж прибирає \`finished\`);
- кнопка «Старт» \`disabled\`, коли таймер іде або завершився; «Пауза» \`disabled\`, коли таймер не йде;
- після зупинки (пауза, скидання, завершення) не має лишатися активних таймерів.

**Повертає** \`{ start(), pause(), reset() }\` — ті самі дії, що й кнопки.

Тести використовують фейкові таймери та створюють власні контейнери.

**Як це працює:** Стан — залишок секунд і id інтервалу. start запускає setInterval на 1 с, який зменшує залишок і оновлює текст; на нулі — зупинка і onFinish. pause зупиняє інтервал, reset повертає початкове значення.
`,
      html: `<div id="timer"></div>`,
      css: `body { font-family: system-ui, sans-serif; }
.time {
  display: inline-block;
  min-width: 90px;
  font-size: 32px;
  font-variant-numeric: tabular-nums;
}
.finished .time { color: #d33; }
button { margin-left: 4px; }
`,
      js: `function createCountdown(root, { seconds, onFinish } = {}) {
  root.innerHTML =
    '<span class="time"></span> ' +
    '<button type="button" class="start">Старт</button> ' +
    '<button type="button" class="pause">Пауза</button> ' +
    '<button type="button" class="reset">Скинути</button>';
  // ваш код
}

createCountdown(document.getElementById('timer'), { seconds: 90 });
`,
      editable: ['js'],
      solution: {
        js: `function createCountdown(root, { seconds, onFinish } = {}) {
  root.innerHTML =
    '<span class="time"></span> ' +
    '<button type="button" class="start">Старт</button> ' +
    '<button type="button" class="pause">Пауза</button> ' +
    '<button type="button" class="reset">Скинути</button>';

  const timeEl = root.querySelector('.time');
  const startBtn = root.querySelector('.start');
  const pauseBtn = root.querySelector('.pause');
  const resetBtn = root.querySelector('.reset');

  let remaining = seconds;
  let timer = null; // null = таймер не йде

  const pad = (n) => String(n).padStart(2, '0');

  function render() {
    timeEl.textContent = pad(Math.floor(remaining / 60)) + ':' + pad(remaining % 60);
    const running = timer !== null;
    startBtn.disabled = running || remaining === 0;
    pauseBtn.disabled = !running;
    root.classList.toggle('finished', remaining === 0);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  function tick() {
    remaining -= 1;
    if (remaining <= 0) {
      remaining = 0;
      stop();
      render();
      if (onFinish) onFinish();
      return;
    }
    render();
  }

  function start() {
    if (timer !== null || remaining === 0) return; // захист від подвійного старту
    timer = setInterval(tick, 1000);
    render();
  }

  function pause() {
    stop();
    render();
  }

  function reset() {
    stop();
    remaining = seconds;
    render();
  }

  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', pause);
  resetBtn.addEventListener('click', reset);
  render();

  return { start, pause, reset };
}

createCountdown(document.getElementById('timer'), { seconds: 90 });
`
      },
      hints: [
        'Стан: `remaining` (секунди) і `timer` (id інтервалу або `null`). Напишіть `render()`, що виводить `mm:ss` (`String(n).padStart(2, \'0\')`) і виставляє `disabled`/клас `finished`.',
        '`start()` має нічого не робити, якщо `timer !== null` (вже йде) або `remaining === 0`. Інакше — `setInterval(tick, 1000)`.',
        'У `tick()` зменшуйте `remaining`; на нулі — `clearInterval`, `timer = null`, `render()` і `onFinish()`. `pause` = зупинити; `reset` = зупинити + повернути `seconds`.'
      ],
      tests: [
        { name: 'початковий рендер і стан кнопок', code: "const root = document.createElement('div');\ndocument.body.append(root);\ncreateCountdown(root, { seconds: 90 });\nexpect($('.time', root).textContent).toBe('01:30');\nexpect($('.start', root).disabled).toBe(false);\nexpect($('.pause', root).disabled).toBe(true);\nconst r2 = document.createElement('div');\ndocument.body.append(r2);\ncreateCountdown(r2, { seconds: 5 });\nexpect($('.time', r2).textContent).toBe('00:05');" },
        { name: 'відлік щосекунди після старту', code: "useFakeTimers();\nconst root = document.createElement('div');\ndocument.body.append(root);\ncreateCountdown(root, { seconds: 90 });\nclick($('.start', root));\nexpect($('.start', root).disabled).toBe(true);\nexpect($('.pause', root).disabled).toBe(false);\nadvanceTimersByTime(999);\nexpect($('.time', root).textContent).toBe('01:30');\nadvanceTimersByTime(1);\nexpect($('.time', root).textContent).toBe('01:29');\nadvanceTimersByTime(29000);\nexpect($('.time', root).textContent).toBe('01:00');\nadvanceTimersByTime(1000);\nexpect($('.time', root).textContent).toBe('00:59');" },
        { name: 'повторний старт не прискорює', code: "useFakeTimers();\nconst root = document.createElement('div');\ndocument.body.append(root);\nconst api = createCountdown(root, { seconds: 10 });\napi.start();\napi.start();\nclick($('.start', root));\nadvanceTimersByTime(3000);\nexpect($('.time', root).textContent).toBe('00:07');\nexpect(getTimerCount()).toBe(1);" },
        { name: 'пауза зупиняє, старт продовжує', code: "useFakeTimers();\nconst root = document.createElement('div');\ndocument.body.append(root);\ncreateCountdown(root, { seconds: 10 });\nclick($('.start', root));\nadvanceTimersByTime(3000);\nclick($('.pause', root));\nexpect(getTimerCount()).toBe(0);\nadvanceTimersByTime(5000);\nexpect($('.time', root).textContent).toBe('00:07');\nexpect($('.pause', root).disabled).toBe(true);\nclick($('.start', root));\nadvanceTimersByTime(2000);\nexpect($('.time', root).textContent).toBe('00:05');" },
        { name: 'скидання повертає початкове значення', code: "useFakeTimers();\nconst root = document.createElement('div');\ndocument.body.append(root);\ncreateCountdown(root, { seconds: 65 });\nclick($('.start', root));\nadvanceTimersByTime(10000);\nclick($('.reset', root));\nexpect($('.time', root).textContent).toBe('01:05');\nadvanceTimersByTime(3000);\nexpect($('.time', root).textContent).toBe('01:05');\nexpect(getTimerCount()).toBe(0);\nexpect($('.start', root).disabled).toBe(false);" },
        { name: 'завершення: 00:00, finished, onFinish один раз', code: "useFakeTimers();\nconst root = document.createElement('div');\ndocument.body.append(root);\nconst onFinish = mockFn();\nconst api = createCountdown(root, { seconds: 3, onFinish });\napi.start();\nadvanceTimersByTime(2000);\nexpect(root.classList.contains('finished')).toBe(false);\nadvanceTimersByTime(1000);\nexpect($('.time', root).textContent).toBe('00:00');\nexpect(root.classList.contains('finished')).toBe(true);\nexpect(onFinish).toHaveBeenCalledTimes(1);\nexpect(getTimerCount()).toBe(0);\napi.start();\nadvanceTimersByTime(5000);\nexpect($('.time', root).textContent).toBe('00:00');\nexpect(onFinish).toHaveBeenCalledTimes(1);\nexpect($('.start', root).disabled).toBe(true);\napi.reset();\nexpect(root.classList.contains('finished')).toBe(false);\nexpect($('.time', root).textContent).toBe('00:03');" }
      ],
      explanation: `
**Скінченний автомат зі станами** \`idle → running ⇄ paused → finished\` (+ \`reset\` з будь-якого стану). Явний \`timer === null\` як ознака «не йде» дає захист від подвійного \`setInterval\` — найчастішого бага таких віджетів (таймер починає йти вдвічі швидше).

**Складність:** O(1) на тік.

**Точність:** \`setInterval\` у фонових вкладках тротлиться (до 1 разу на секунду або рідше), а під навантаженням — запізнюється. Для «справжнього» таймера краще зберігати **дедлайн** і обчислювати залишок від часу:
\`\`\`js
let deadline = Date.now() + remaining * 1000;   // при старті
const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000)); // у кожному тіку
\`\`\`
Тоді таймер «наздоганяє» після тротлінгу, а пауза посеред секунди не губить частку секунди (зберігайте залишок у мілісекундах).

**Типові помилки:**
- подвійний \`setInterval\` при повторному кліку «Старт»;
- \`setInterval\` не очищується при скиданні/завершенні → витік і від'ємний час;
- \`onFinish\` викликається на кожному тіку після нуля;
- формат \`1:5\` замість \`01:05\`.

**Що інтерв'юер спитає далі:**
- Перепишіть на дедлайн (\`Date.now()\`/\`performance.now()\`), щоб таймер не відставав у фоновій вкладці.
- Як зробити це хуком \`useCountdown\` у React (очищення в \`useEffect\`, \`useRef\` для id інтервалу)?
- Як зберегти стан таймера між перезавантаженнями сторінки?
- Як оголошувати залишок часу для скрінрідерів (\`aria-live\`) і не «спамити» щосекунди?
`
    },
    {
      id: 'live-todo-app', group: "widgets",
      type: 'dom',
      level: 2,
      title: 'Todo-застосунок: додавання, фільтри, localStorage',
      tags: ['dom', 'events', 'delegation', 'localstorage', 'forms'],
      description: `
**Завдання.** Реалізуйте \`createTodoApp(root, { storageKey = 'todos' })\`. Стартова розмітка вже створюється в стартовому коді — допишіть логіку.

**Де трапляється:** класичне домашнє завдання на співбесіді: стан, події, localStorage.

**Додавання:** сабміт форми \`.todo-form\` (Enter або кнопка) додає задачу з тексту \`.todo-input\` (обрізаного \`trim\`) у **кінець** списку і очищує поле. Порожній текст ігнорується. Сторінка не перезавантажується (\`preventDefault\`).

**Елемент списку** (\`.todo-list\`):
\`\`\`html
<li class="todo-item [done]">
  <input type="checkbox" class="toggle"> <span class="title">Текст</span>
  <button type="button" class="delete">×</button>
</li>
\`\`\`
- чекбокс перемикає статус (клас \`done\` на \`li\`, \`checked\` у чекбокса);
- \`.delete\` видаляє задачу;
- текст задачі — **лише як текст** (жодного HTML з вводу користувача).

**Фільтри:** кнопки \`[data-filter="all|active|done"]\` у \`.filters\` показують усі / невиконані / виконані; кнопка поточного фільтра має клас \`selected\` (за замовчуванням \`all\`).

**Лічильник** \`.todo-count\`: \`Активних: N\`.

**Збереження:** після кожної зміни зберігайте масив \`[{ title, done }, ...]\` (можна з іншими полями) як JSON у \`localStorage[storageKey]\`. При створенні застосунку — завантажуйте звідти; пошкоджений JSON не повинен ламати застосунок.

Використовуйте делегування подій на списку.

**Як це працює:** Увесь стан — масив задач; будь-яка дія змінює масив, зберігає його в localStorage і перемальовує список. Фільтр — окремий стан, що впливає лише на рендер. Делегування подій на список.
`,
      html: `<div id="app"></div>`,
      css: `body { font-family: system-ui, sans-serif; max-width: 420px; }
.todo-form { display: flex; gap: 6px; }
.todo-input { flex: 1; padding: 6px; }
.todo-list { list-style: none; padding: 0; }
.todo-item { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
.todo-item .title { flex: 1; }
.todo-item.done .title { text-decoration: line-through; color: #888; }
.filters button.selected { font-weight: bold; text-decoration: underline; }
`,
      js: `function createTodoApp(root, { storageKey = 'todos' } = {}) {
  root.innerHTML =
    '<form class="todo-form">' +
    '  <input class="todo-input" placeholder="Що потрібно зробити?" aria-label="Нова задача">' +
    '  <button type="submit">Додати</button>' +
    '</form>' +
    '<ul class="todo-list"></ul>' +
    '<div class="filters">' +
    '  <button type="button" data-filter="all">Усі</button>' +
    '  <button type="button" data-filter="active">Активні</button>' +
    '  <button type="button" data-filter="done">Виконані</button>' +
    '</div>' +
    '<span class="todo-count"></span>';

  // ваш код
}

createTodoApp(document.getElementById('app'));
`,
      editable: ['js'],
      solution: {
        js: `function createTodoApp(root, { storageKey = 'todos' } = {}) {
  root.innerHTML =
    '<form class="todo-form">' +
    '  <input class="todo-input" placeholder="Що потрібно зробити?" aria-label="Нова задача">' +
    '  <button type="submit">Додати</button>' +
    '</form>' +
    '<ul class="todo-list"></ul>' +
    '<div class="filters">' +
    '  <button type="button" data-filter="all">Усі</button>' +
    '  <button type="button" data-filter="active">Активні</button>' +
    '  <button type="button" data-filter="done">Виконані</button>' +
    '</div>' +
    '<span class="todo-count"></span>';

  const form = root.querySelector('.todo-form');
  const inputEl = root.querySelector('.todo-input');
  const list = root.querySelector('.todo-list');
  const filtersEl = root.querySelector('.filters');
  const countEl = root.querySelector('.todo-count');

  let todos = load();
  let nextId = todos.length + 1;
  let filter = 'all';

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey));
      if (!Array.isArray(data)) return [];
      return data
        .filter((t) => t && typeof t.title === 'string')
        .map((t, i) => ({ id: i + 1, title: t.title, done: Boolean(t.done) }));
    } catch (e) {
      return []; // пошкоджений JSON
    }
  }

  function save() {
    localStorage.setItem(storageKey, JSON.stringify(todos));
  }

  function createItem(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' done' : '');
    li.dataset.id = String(todo.id);

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.className = 'toggle';
    toggle.checked = todo.done;

    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = todo.title; // textContent — захист від XSS

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'delete';
    del.textContent = '×';
    del.setAttribute('aria-label', 'Видалити');

    li.append(toggle, ' ', title, ' ', del);
    return li;
  }

  function render() {
    const visible = todos.filter((t) =>
      filter === 'all' ? true : filter === 'done' ? t.done : !t.done
    );
    list.replaceChildren(...visible.map(createItem));
    countEl.textContent = 'Активних: ' + todos.filter((t) => !t.done).length;
    filtersEl.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.classList.toggle('selected', btn.dataset.filter === filter);
    });
  }

  function update(fn) {
    fn();
    save();
    render();
  }

  const idOf = (el) => Number(el.closest('.todo-item').dataset.id);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = inputEl.value.trim();
    if (!title) return;
    update(() => todos.push({ id: nextId++, title, done: false }));
    inputEl.value = '';
  });

  list.addEventListener('change', (e) => {
    if (!e.target.matches('.toggle')) return;
    const id = idOf(e.target);
    const checked = e.target.checked;
    update(() => {
      todos = todos.map((t) => (t.id === id ? { ...t, done: checked } : t));
    });
  });

  list.addEventListener('click', (e) => {
    const del = e.target.closest('.delete');
    if (!del) return;
    const id = idOf(del);
    update(() => {
      todos = todos.filter((t) => t.id !== id);
    });
  });

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    filter = btn.dataset.filter;
    render();
  });

  render();
}

createTodoApp(document.getElementById('app'));
`
      },
      hints: [
        'Тримайте стан у масиві `todos = [{ id, title, done }]` і змінній `filter`. Кожна зміна: оновити масив → `save()` у localStorage → `render()` списку з нуля.',
        'Делегування: `change` на `.todo-list` для чекбоксів, `click` на `.todo-list` для `.delete`, `click` на `.filters`. Елемент знаходьте через `e.target.closest(\'.todo-item\')`, а задачу — за `data-id`.',
        'Створюйте елементи через `document.createElement` і `textContent`. Завантаження: `JSON.parse(localStorage.getItem(key))` у `try/catch` з перевіркою `Array.isArray`.'
      ],
      tests: [
        { name: 'сабміт додає задачу і очищує поле', code: "const root = document.createElement('div');\ndocument.body.append(root);\ncreateTodoApp(root, { storageKey: 't-add' });\ninput($('.todo-input', root), '  Купити молоко  ');\nconst res = submit($('.todo-form', root));\nexpect(res.prevented).toBe(true);\nconst items = $$('.todo-item', root);\nexpect(items).toHaveLength(1);\nexpect($('.title', items[0]).textContent).toBe('Купити молоко');\nexpect($('.todo-input', root).value).toBe('');\nexpect($('.todo-count', root).textContent).toBe('Активних: 1');\ninput($('.todo-input', root), 'Друга');\nsubmit($('.todo-form', root));\nexpect($$('.todo-item .title', root).map((el) => el.textContent)).toEqual(['Купити молоко', 'Друга']);" },
        { name: 'порожній текст ігнорується', code: "const root = document.createElement('div');\ndocument.body.append(root);\ncreateTodoApp(root, { storageKey: 't-empty' });\ninput($('.todo-input', root), '   ');\nsubmit($('.todo-form', root));\nexpect($$('.todo-item', root)).toHaveLength(0);" },
        { name: 'чекбокс перемикає done, кнопка видаляє', code: "const root = document.createElement('div');\ndocument.body.append(root);\ncreateTodoApp(root, { storageKey: 't-toggle' });\n['A', 'B'].forEach((t) => { input($('.todo-input', root), t); submit($('.todo-form', root)); });\nclick($$('.toggle', root)[0]);\nexpect($$('.todo-item', root)[0].classList.contains('done')).toBe(true);\nexpect($$('.toggle', root)[0].checked).toBe(true);\nexpect($('.todo-count', root).textContent).toBe('Активних: 1');\nclick($$('.toggle', root)[0]);\nexpect($$('.todo-item', root)[0].classList.contains('done')).toBe(false);\nclick($$('.delete', root)[0]);\nexpect($$('.todo-item .title', root).map((el) => el.textContent)).toEqual(['B']);" },
        { name: 'фільтри all / active / done', code: "const root = document.createElement('div');\ndocument.body.append(root);\ncreateTodoApp(root, { storageKey: 't-filter' });\n['A', 'B', 'C'].forEach((t) => { input($('.todo-input', root), t); submit($('.todo-form', root)); });\nclick($$('.toggle', root)[1]);\nconst titles = () => $$('.todo-item .title', root).map((el) => el.textContent);\nexpect($('[data-filter=\"all\"]', root).classList.contains('selected')).toBe(true);\nclick($('[data-filter=\"active\"]', root));\nexpect(titles()).toEqual(['A', 'C']);\nexpect($('[data-filter=\"active\"]', root).classList.contains('selected')).toBe(true);\nexpect($('[data-filter=\"all\"]', root).classList.contains('selected')).toBe(false);\nclick($('[data-filter=\"done\"]', root));\nexpect(titles()).toEqual(['B']);\nclick($('[data-filter=\"all\"]', root));\nexpect(titles()).toEqual(['A', 'B', 'C']);" },
        { name: 'текст не інтерпретується як HTML', code: "const root = document.createElement('div');\ndocument.body.append(root);\ncreateTodoApp(root, { storageKey: 't-xss' });\ninput($('.todo-input', root), '<img src=x onerror=\"window.__xss=1\"><b>bold</b>');\nsubmit($('.todo-form', root));\nexpect($('.todo-list img', root)).toBeNull();\nexpect($('.todo-list b', root)).toBeNull();\nexpect($('.title', root).textContent).toBe('<img src=x onerror=\"window.__xss=1\"><b>bold</b>');" },
        { name: 'зберігає в localStorage', code: "const root = document.createElement('div');\ndocument.body.append(root);\ncreateTodoApp(root, { storageKey: 't-save' });\n['A', 'B'].forEach((t) => { input($('.todo-input', root), t); submit($('.todo-form', root)); });\nclick($$('.toggle', root)[1]);\nconst saved = JSON.parse(localStorage.getItem('t-save'));\nexpect(saved.map((t) => [t.title, t.done])).toEqual([['A', false], ['B', true]]);\nclick($$('.delete', root)[0]);\nexpect(JSON.parse(localStorage.getItem('t-save')).map((t) => t.title)).toEqual(['B']);" },
        { name: 'завантажує з localStorage, пошкоджений JSON не ламає', code: "localStorage.setItem('t-load', JSON.stringify([{ title: 'Old A', done: true }, { title: 'Old B', done: false }]));\nconst root = document.createElement('div');\ndocument.body.append(root);\ncreateTodoApp(root, { storageKey: 't-load' });\nconst items = $$('.todo-item', root);\nexpect(items).toHaveLength(2);\nexpect(items[0].classList.contains('done')).toBe(true);\nexpect($('.toggle', items[0]).checked).toBe(true);\nexpect($('.todo-count', root).textContent).toBe('Активних: 1');\nlocalStorage.setItem('t-bad', '{oops');\nconst root2 = document.createElement('div');\ndocument.body.append(root2);\ncreateTodoApp(root2, { storageKey: 't-bad' });\nexpect($$('.todo-item', root2)).toHaveLength(0);\ninput($('.todo-input', root2), 'Fresh');\nsubmit($('.todo-form', root2));\nexpect($$('.todo-item', root2)).toHaveLength(1);" }
      ],
      explanation: `
**Однонаправлений потік даних:** подія → зміна масиву \`todos\` → збереження → повний перерендер списку. Стан — єдине джерело правди; DOM ніколи не читається як «база даних» (окрім \`data-id\` для зв'язку елемента із задачею).

**Делегування** робить обробники незалежними від перерендерів: \`li\` створюються заново, а слухачі живуть на \`.todo-list\`.

**Складність:** O(n) на кожну зміну (перерендер і \`JSON.stringify\`). Для сотень елементів це непомітно; для тисяч — точкові оновлення DOM (як робить React з \`key\`) і debounce збереження.

**Важливі деталі:**
- \`textContent\` замість \`innerHTML\` — захист від XSS (тест з \`<img onerror>\`);
- \`preventDefault\` у \`submit\` — інакше форма перезавантажить сторінку; сабміт форми безкоштовно дає підтримку Enter;
- \`change\` для чекбокса надійніший за \`click\` (спрацьовує й при керуванні з клавіатури — Space);
- \`localStorage\` може кинути (\`QuotaExceededError\`, приватний режим) — у продакшені обгортайте \`setItem\` у \`try/catch\`;
- дані з \`localStorage\` — **недовірені**: валідуйте структуру після \`JSON.parse\`.

**Типові помилки:**
- обробники вішаються на кожен \`li\` при рендері і не знімаються;
- \`innerHTML += '<li>' + text + '</li>'\` → XSS і втрата стану чекбоксів;
- \`JSON.parse\` без \`try/catch\` → біла сторінка при пошкоджених даних;
- фільтр змінює сам масив \`todos\` (видаляє «невидимі» задачі).

**Що інтерв'юер спитає далі:**
- Додайте редагування задачі подвійним кліком (Enter — зберегти, Escape — скасувати, blur — зберегти).
- Синхронізуйте між вкладками через подію \`storage\`.
- Додайте «Очистити виконані» і «Позначити всі».
- Як би ви структурували це в React: \`useReducer\`, кастомний хук \`useLocalStorage\`, де зберігати фільтр (URL?)?
`
    },
    {
      id: 'live-load-more-feed', group: "widgets",
      type: 'dom',
      level: 3,
      title: 'Пагінація «Показати ще»: стан завантаження, помилки, кінець списку',
      tags: ['dom', 'fetch', 'async', 'pagination'],
      description: `
**Завдання.** Реалізуйте \`createFeed(root, { url = '/api/items', pageSize = 10 })\` — список з пагінацією «Показати ще».

**Де трапляється:** стрічки товарів і коментарів з пагінацією.

**Розмітка** (уже є у стартовому коді):
\`\`\`html
<ul class="list"></ul>
<p class="status" hidden>Завантаження…</p>
<p class="error" hidden></p>
<button type="button" class="more">Показати ще</button>
\`\`\`

**API:** \`GET <url>?page=<n>&limit=<pageSize>\` (сторінки з 1) повертає JSON \`{ items: [{ id, title }], hasMore: boolean }\`.

**Поведінка:**
1. Одразу після створення завантажується **перша** сторінка.
2. Елементи рендеряться як \`<li class="item">title</li>\` і **додаються** в кінець списку (текст — лише як текст).
3. Під час запиту: \`.status\` видимий (\`hidden = false\`), кнопка \`.more\` — \`disabled\`. Повторні кліки під час завантаження **не** створюють нових запитів.
4. Клік по \`.more\` завантажує наступну сторінку.
5. Якщо \`hasMore === false\` — кнопка ховається (\`hidden = true\`).
6. Помилка (мережа або HTTP-статус не 2xx): \`.error\` показує \`Не вдалося завантажити\`, кнопка показує \`Спробувати ще\` і по кліку повторює **ту саму** сторінку. При успішному повторі помилка ховається, а кнопка знову \`Показати ще\`.

**Повертає** \`{ loadMore() }\` — проміс, що виконується після завершення завантаження.

**Як це працює:** Стан: номер сторінки, завантаження, помилка, кінець списку. Клік «Показати ще» → fetch наступної сторінки; поки йде запит — кнопка вимкнена; помилка показується з можливістю повтору; менше pageSize елементів — кінець.
`,
      html: `<div id="feed"></div>
<script>
  // Демо-сервер лише для превʼю (у тестах fetch підміняється через mockFetch)
  window.fetch = function (url) {
    const params = new URL(url, location.href).searchParams;
    const page = Number(params.get('page'));
    const limit = Number(params.get('limit'));
    const items = Array.from({ length: limit }, (_, i) => {
      const id = (page - 1) * limit + i + 1;
      return { id: id, title: 'Пост #' + id };
    });
    const body = JSON.stringify({ items: items, hasMore: page < 3 });
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(new Response(body, { headers: { 'Content-Type': 'application/json' } }));
      }, 400);
    });
  };
</script>`,
      css: `body { font-family: system-ui, sans-serif; }
.list { padding-left: 20px; }
.item { padding: 2px 0; }
.status { color: #666; }
.error { color: #c00; }
`,
      js: `function createFeed(root, { url = '/api/items', pageSize = 10 } = {}) {
  root.innerHTML =
    '<ul class="list"></ul>' +
    '<p class="status" hidden>Завантаження…</p>' +
    '<p class="error" hidden></p>' +
    '<button type="button" class="more">Показати ще</button>';

  // ваш код
}

createFeed(document.getElementById('feed'), { pageSize: 5 });
`,
      editable: ['js'],
      solution: {
        js: `function createFeed(root, { url = '/api/items', pageSize = 10 } = {}) {
  root.innerHTML =
    '<ul class="list"></ul>' +
    '<p class="status" hidden>Завантаження…</p>' +
    '<p class="error" hidden></p>' +
    '<button type="button" class="more">Показати ще</button>';

  const list = root.querySelector('.list');
  const status = root.querySelector('.status');
  const errorEl = root.querySelector('.error');
  const moreBtn = root.querySelector('.more');

  let page = 1;          // наступна сторінка для завантаження
  let loading = false;
  let finished = false;  // hasMore === false
  let current = Promise.resolve();

  function renderItems(items) {
    const fragment = document.createDocumentFragment();
    for (const item of items) {
      const li = document.createElement('li');
      li.className = 'item';
      li.dataset.id = String(item.id);
      li.textContent = item.title;
      fragment.append(li);
    }
    list.append(fragment); // одна вставка в DOM замість N
  }

  async function load() {
    loading = true;
    status.hidden = false;
    errorEl.hidden = true;
    moreBtn.disabled = true;
    try {
      const res = await fetch(url + '?page=' + page + '&limit=' + pageSize);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      renderItems(data.items);
      page += 1; // сторінку збільшуємо лише після успіху — retry візьме ту саму
      finished = !data.hasMore;
      moreBtn.textContent = 'Показати ще';
    } catch (error) {
      errorEl.textContent = 'Не вдалося завантажити';
      errorEl.hidden = false;
      moreBtn.textContent = 'Спробувати ще';
    } finally {
      loading = false;
      status.hidden = true;
      moreBtn.disabled = false;
      moreBtn.hidden = finished;
    }
  }

  function loadMore() {
    if (loading || finished) return current; // захист від подвійних запитів
    current = load();
    return current;
  }

  moreBtn.addEventListener('click', loadMore);
  loadMore();

  return { loadMore };
}

createFeed(document.getElementById('feed'), { pageSize: 5 });
`
      },
      hints: [
        'Стан компонента: номер наступної сторінки, прапорці `loading` і «більше немає». На їх основі в одному місці оновлюйте `.status`, `.error` і кнопку.',
        'Функція `loadMore()`: якщо `loading` або сторінки закінчились — нічого не робити. Інакше `fetch` → перевірити `res.ok` → `res.json()` → додати `li` (через `textContent`) → збільшити сторінку **лише при успіху**.',
        'Скидання стану (`loading = false`, приховати `.status`, розблокувати кнопку) — у `finally`, щоб воно відбувалось і при помилці. Текст кнопки й `.error` змінюйте в `try`/`catch`.'
      ],
      tests: [
        { name: 'одразу завантажує першу сторінку', code: "const f = mockFetch((url) => {\n  const p = Number(url.match(/page=(\\d+)/)[1]);\n  const limit = Number(url.match(/limit=(\\d+)/)[1]);\n  return { items: Array.from({ length: limit }, (_, i) => ({ id: (p - 1) * limit + i + 1, title: 'Item ' + ((p - 1) * limit + i + 1) })), hasMore: p < 3 };\n});\nconst root = document.createElement('div');\ndocument.body.append(root);\ncreateFeed(root, { url: '/api/posts', pageSize: 4 });\nawait waitFor(() => $$('.item', root).length === 4);\nexpect(f).toHaveBeenCalledTimes(1);\nexpect(f.mock.calls[0][0]).toBe('/api/posts?page=1&limit=4');\nexpect($$('.item', root).map((li) => li.textContent)).toEqual(['Item 1', 'Item 2', 'Item 3', 'Item 4']);\nexpect($('.status', root).hidden).toBe(true);\nexpect($('.more', root).hidden).toBe(false);" },
        { name: '«Показати ще» додає наступну сторінку, кінець ховає кнопку', code: "const f = mockFetch((url) => {\n  const p = Number(url.match(/page=(\\d+)/)[1]);\n  return { items: [{ id: p * 10, title: 'P' + p + '-a' }, { id: p * 10 + 1, title: 'P' + p + '-b' }], hasMore: p < 2 };\n});\nconst root = document.createElement('div');\ndocument.body.append(root);\ncreateFeed(root, { pageSize: 2 });\nawait waitFor(() => $$('.item', root).length === 2);\nclick($('.more', root));\nawait waitFor(() => $$('.item', root).length === 4);\nexpect(f.mock.calls[1][0]).toBe('/api/items?page=2&limit=2');\nexpect($$('.item', root).map((li) => li.textContent)).toEqual(['P1-a', 'P1-b', 'P2-a', 'P2-b']);\nawait waitFor(() => $('.more', root).hidden === true);\nexpect(f).toHaveBeenCalledTimes(2);" },
        { name: 'стан завантаження і захист від подвійних кліків', code: "let release = null;\nconst f = mockFetch(() => new Promise((resolve) => { release = () => resolve({ items: [{ id: 1, title: 'One' }], hasMore: true }); }));\nconst root = document.createElement('div');\ndocument.body.append(root);\nconst feed = createFeed(root, { pageSize: 1 });\nawait waitFor(() => release !== null);\nexpect($('.status', root).hidden).toBe(false);\nexpect($('.more', root).disabled).toBe(true);\nclick($('.more', root));\nclick($('.more', root));\nfeed.loadMore();\nexpect(f).toHaveBeenCalledTimes(1);\nrelease();\nawait waitFor(() => $$('.item', root).length === 1);\nawait waitFor(() => $('.status', root).hidden === true);\nexpect($('.more', root).disabled).toBe(false);" },
        { name: 'помилка → повідомлення і повтор тієї ж сторінки', code: "let calls = 0;\nconst f = mockFetch((url) => {\n  calls++;\n  if (calls === 2) return { status: 500, body: { error: 'oops' } };\n  if (calls === 3) return new Error('offline');\n  const p = Number(url.match(/page=(\\d+)/)[1]);\n  return { items: [{ id: p, title: 'Page ' + p }], hasMore: true };\n});\nconst root = document.createElement('div');\ndocument.body.append(root);\ncreateFeed(root, { pageSize: 1 });\nawait waitFor(() => $$('.item', root).length === 1);\nclick($('.more', root));\nawait waitFor(() => $('.error', root).hidden === false);\nexpect($('.error', root).textContent).toBe('Не вдалося завантажити');\nexpect($('.more', root).textContent).toBe('Спробувати ще');\nawait waitFor(() => $('.more', root).disabled === false);\nclick($('.more', root));\nawait waitFor(() => f.mock.calls.length === 3 && $('.more', root).disabled === false);\nexpect($('.error', root).hidden).toBe(false);\nclick($('.more', root));\nawait waitFor(() => $$('.item', root).length === 2);\nexpect(f.mock.calls.map((c) => c[0].match(/page=(\\d+)/)[1])).toEqual(['1', '2', '2', '2']);\nexpect($('.error', root).hidden).toBe(true);\nexpect($('.more', root).textContent).toBe('Показати ще');" },
        { name: 'loadMore() повертає проміс; заголовки — лише текст', code: "mockFetch((url) => ({ items: [{ id: 1, title: '<img src=x onerror=\"window.__x=1\">' }], hasMore: true }));\nconst root = document.createElement('div');\ndocument.body.append(root);\nconst feed = createFeed(root, { pageSize: 1 });\nawait feed.loadMore();\nawait waitFor(() => $$('.item', root).length >= 1);\nexpect($('.list img', root)).toBeNull();\nexpect($('.item', root).textContent).toBe('<img src=x onerror=\"window.__x=1\">');\nawait feed.loadMore();\nexpect($$('.item', root)).toHaveLength(2);" }
      ],
      explanation: `
**Стан компонента** — \`page\`, \`loading\`, \`finished\` — визначає все, що бачить користувач. Ключові рішення:
- \`page\` збільшується **лише після успіху** → повтор після помилки запитує ту саму сторінку;
- скидання \`loading\` і розблокування кнопки — у \`finally\` (інакше після помилки кнопка «застрягне» в \`disabled\`);
- \`if (loading) return\` — захист від подвійних запитів (\`disabled\` на кнопці — лише візуальний захист: \`loadMore()\` можна викликати й програмно);
- \`DocumentFragment\` — одна вставка в DOM замість N (менше reflow).

**Складність:** O(k) на сторінку; DOM росте лінійно — для тисяч елементів потрібна **віртуалізація** (рендер лише видимих рядків).

**Infinite scroll замість кнопки** — \`IntersectionObserver\` на «сторожовому» елементі в кінці списку:
\`\`\`js
const sentinel = document.createElement('div');
root.append(sentinel);
new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) loadMore();
}, { rootMargin: '200px' }).observe(sentinel);
\`\`\`
Кнопку варто лишити як запасний варіант (доступність, відсутність IO, помилки).

**Offset vs cursor пагінація:** \`?page=3\` дає дублікати/пропуски, якщо між запитами додали нові записи. Курсорна (\`?after=<id>\`) — стабільна, тому її використовують стрічки соцмереж.

**Типові помилки:**
- немає перевірки \`res.ok\` → 500 з тілом помилки рендериться як дані або падає на \`data.items\`;
- \`page++\` до запиту → після помилки сторінка пропускається;
- не ховається кнопка в кінці → запити порожніх сторінок;
- \`innerHTML += ...\` у циклі → O(n²) і XSS.

**Що інтерв'юер спитає далі:**
- Перейдіть на infinite scroll з \`IntersectionObserver\` і курсорною пагінацією.
- Збережіть позицію скролу й завантажені сторінки при поверненні «Назад».
- Як скасувати запит, якщо компонент знищено (\`AbortController\`)?
- Додайте віртуалізацію: як обчислити видимий діапазон для рядків фіксованої висоти?
- Як повідомити скрінрідер про завантаження нових елементів (\`aria-live\`, \`aria-busy\`)?
`
    },
    {
      id: 'live-autocomplete', group: "widgets",
      type: 'dom',
      level: 4,
      interview: true,
      title: 'Автокомпліт: debounce, гонки відповідей, клавіатура, ARIA',
      tags: ['dom', 'fetch', 'debounce', 'race-conditions', 'a11y', 'events'],
      testTimeout: 3000,
      description: `
**Завдання.** Реалізуйте \`createAutocomplete(root, { debounceMs = 300, minLength = 1, onSelect })\` — найпопулярніша UI-задача фронтенд-співбесід.

**Де трапляється:** пошук з підказками — найпопулярніша UI-задача фронтенд-співбесід.

**Розмітка** (створіть у \`root\`):
- \`<input class="ac-input">\` з \`role="combobox"\`, \`aria-autocomplete="list"\`, \`aria-expanded\` (\`"true"\`/\`"false"\`) і \`aria-controls\` = \`id\` списку;
- \`<ul class="ac-list" role="listbox">\` з **унікальним** \`id\`; прихований (\`hidden\`), коли закритий.

**Пошук:**
- на подію \`input\` — **debounce** \`debounceMs\`; запит \`fetch('/api/search?q=' + encodeURIComponent(query))\`, де \`query\` — значення без пробілів по краях; відповідь — JSON-масив рядків;
- якщо \`query.length < minLength\` — запит не робиться, список закривається;
- **гонки (race conditions):** показуються лише результати **останнього** запиту — відповідь на старіший запит, що прийшла пізніше, ігнорується (можна додатково скасовувати старі запити через \`AbortController\`);
- кожен результат — \`<li class="ac-option" role="option" aria-selected="false">\` з унікальним \`id\`; порожній результат — \`<li class="ac-empty">Нічого не знайдено</li>\`; після рендеру список відкритий;
- помилка запиту — список закривається, нічого не падає.

**Клавіатура** (на \`input\`, коли список відкритий і є опції):
- \`ArrowDown\`/\`ArrowUp\` — наступна/попередня опція **по колу**; активна опція має клас \`active\` і \`aria-selected="true"\`, а \`input\` — \`aria-activedescendant\` = її \`id\`; для стрілок — \`preventDefault()\`;
- \`Enter\` — вибрати активну опцію: \`input.value\` = її текст, список закривається, викликається \`onSelect(value)\`;
- \`Escape\` — закрити список.

**Мишка:** клік по опції — вибір (як Enter).

Тексти результатів — лише як текст. Тести використовують фейкові таймери та \`mockFetch\`.

**Як це працює:** Debounce на input → fetch з AbortController (старий запит скасовуємо). Відповідь показуємо, лише якщо вона для останнього запиту. Стрілки змінюють активний пункт, Enter обирає, Escape закриває; ARIA-атрибути відображають стан.
`,
      html: `<p>Почніть вводити назву фрукта (англійською):</p>
<div id="ac"></div>
<p>Обрано: <b id="picked">—</b></p>
<script>
  // Демо-сервер лише для превʼю (у тестах fetch підміняється через mockFetch)
  window.fetch = function (url) {
    const q = decodeURIComponent(String(url).split('q=')[1] || '').toLowerCase();
    const all = ['apple', 'apricot', 'avocado', 'banana', 'blackberry', 'blueberry', 'cherry', 'coconut', 'grape', 'mango'];
    const body = JSON.stringify(all.filter(function (f) { return f.indexOf(q) === 0; }));
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(new Response(body, { headers: { 'Content-Type': 'application/json' } }));
      }, 150 + Math.random() * 300);
    });
  };
</script>`,
      css: `body { font-family: system-ui, sans-serif; }
#ac { position: relative; width: 260px; }
.ac-input { width: 100%; box-sizing: border-box; padding: 6px 8px; }
.ac-list {
  position: absolute;
  left: 0; right: 0;
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.ac-option, .ac-empty { padding: 6px 8px; }
.ac-option { cursor: pointer; }
.ac-option.active, .ac-option:hover { background: #e8f0ff; }
.ac-empty { color: #888; }
`,
      js: `function createAutocomplete(root, { debounceMs = 300, minLength = 1, onSelect } = {}) {
  // ваш код
}

createAutocomplete(document.getElementById('ac'), {
  onSelect: (value) => { document.getElementById('picked').textContent = value; },
});
`,
      editable: ['js'],
      solution: {
        js: `let autocompleteCounter = 0;

function createAutocomplete(root, { debounceMs = 300, minLength = 1, onSelect } = {}) {
  const listId = 'ac-list-' + ++autocompleteCounter;

  const inputEl = document.createElement('input');
  inputEl.className = 'ac-input';
  inputEl.type = 'text';
  inputEl.autocomplete = 'off';
  inputEl.setAttribute('role', 'combobox');
  inputEl.setAttribute('aria-autocomplete', 'list');
  inputEl.setAttribute('aria-expanded', 'false');
  inputEl.setAttribute('aria-controls', listId);

  const list = document.createElement('ul');
  list.className = 'ac-list';
  list.id = listId;
  list.setAttribute('role', 'listbox');
  list.hidden = true;

  root.replaceChildren(inputEl, list);

  let timer = null;
  let requestId = 0;      // номер останнього запиту — захист від гонок
  let controller = null;  // скасування застарілого запиту
  let options = [];
  let activeIndex = -1;

  function open() {
    list.hidden = false;
    inputEl.setAttribute('aria-expanded', 'true');
  }

  function close() {
    list.hidden = true;
    inputEl.setAttribute('aria-expanded', 'false');
    inputEl.removeAttribute('aria-activedescendant');
    activeIndex = -1;
  }

  function renderOptions(items) {
    options = items;
    activeIndex = -1;
    list.replaceChildren();
    if (items.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'ac-empty';
      empty.textContent = 'Нічого не знайдено';
      list.append(empty);
    }
    items.forEach((text, index) => {
      const li = document.createElement('li');
      li.className = 'ac-option';
      li.id = listId + '-opt-' + index;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.dataset.index = String(index);
      li.textContent = text; // лише текст — без XSS
      list.append(li);
    });
    inputEl.removeAttribute('aria-activedescendant');
    open();
  }

  function setActive(index) {
    const items = list.querySelectorAll('.ac-option');
    items.forEach((li, i) => {
      li.classList.toggle('active', i === index);
      li.setAttribute('aria-selected', String(i === index));
    });
    activeIndex = index;
    inputEl.setAttribute('aria-activedescendant', items[index].id);
    items[index].scrollIntoView({ block: 'nearest' });
  }

  function select(index) {
    const value = options[index];
    if (value === undefined) return;
    inputEl.value = value;
    close();
    if (onSelect) onSelect(value);
  }

  async function search(query) {
    const id = ++requestId;
    if (controller) controller.abort();
    controller = new AbortController();
    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(query), { signal: controller.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const items = await res.json();
      if (id !== requestId) return; // застаріла відповідь
      renderOptions(items);
    } catch (error) {
      if (id !== requestId || error.name === 'AbortError') return;
      options = [];
      close();
    }
  }

  inputEl.addEventListener('input', () => {
    clearTimeout(timer);
    const query = inputEl.value.trim();
    if (query.length < minLength) {
      requestId++; // інвалідовуємо запит, що вже в дорозі
      if (controller) controller.abort();
      options = [];
      close();
      return;
    }
    timer = setTimeout(() => search(query), debounceMs);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!list.hidden) {
        e.preventDefault();
        close();
      }
      return;
    }
    if (list.hidden || options.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((activeIndex + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(activeIndex <= 0 ? options.length - 1 : activeIndex - 1);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault(); // не сабмітити форму
      select(activeIndex);
    }
  });

  // mousedown забирав би фокус з input до click
  list.addEventListener('mousedown', (e) => e.preventDefault());
  list.addEventListener('click', (e) => {
    const li = e.target.closest('.ac-option');
    if (li) select(Number(li.dataset.index));
  });

  return { input: inputEl, close };
}

createAutocomplete(document.getElementById('ac'), {
  onSelect: (value) => { document.getElementById('picked').textContent = value; },
});
`
      },
      hints: [
        'Розбийте на частини: (1) debounce на `input` з перевіркою `minLength`; (2) `search(query)` з fetch; (3) `renderOptions(items)`; (4) обробка клавіатури через `activeIndex`; (5) `select(index)`.',
        'Гонки: заведіть лічильник `requestId`. Перед запитом `const id = ++requestId`, після відповіді — `if (id !== requestId) return`. Додатково можна `abort()` попередній запит і ігнорувати `AbortError` у `catch`.',
        'Клавіатура: `ArrowDown` → `(activeIndex + 1) % options.length`, `ArrowUp` → `activeIndex <= 0 ? options.length - 1 : activeIndex - 1`. У `setActive` оновіть класи, `aria-selected` і `aria-activedescendant`. Не забудьте `preventDefault()`.'
      ],
      tests: [
        { name: 'розмітка та ARIA-атрибути', code: "const root = document.createElement('div');\ndocument.body.append(root);\ncreateAutocomplete(root);\nconst inp = $('.ac-input', root);\nconst list = $('.ac-list', root);\nexpect(inp.getAttribute('role')).toBe('combobox');\nexpect(inp.getAttribute('aria-autocomplete')).toBe('list');\nexpect(inp.getAttribute('aria-expanded')).toBe('false');\nexpect(list.getAttribute('role')).toBe('listbox');\nexpect(list.id).toBeTruthy();\nexpect(inp.getAttribute('aria-controls')).toBe(list.id);\nexpect(list.hidden).toBe(true);\nconst root2 = document.createElement('div');\ndocument.body.append(root2);\ncreateAutocomplete(root2);\nexpect($('.ac-list', root2).id).not.toBe(list.id);" },
        { name: 'debounce: один запит після паузи, з encodeURIComponent і trim', code: "useFakeTimers();\nconst f = mockFetch(() => ['x']);\nconst root = document.createElement('div');\ndocument.body.append(root);\ncreateAutocomplete(root, { debounceMs: 300 });\nconst inp = $('.ac-input', root);\ninput(inp, 'a');\nadvanceTimersByTime(100);\ninput(inp, 'ap');\nadvanceTimersByTime(100);\ninput(inp, '  c++ & ');\nadvanceTimersByTime(299);\nexpect(f).not.toHaveBeenCalled();\nadvanceTimersByTime(1);\nexpect(f).toHaveBeenCalledTimes(1);\nexpect(f.mock.calls[0][0]).toBe('/api/search?q=c%2B%2B%20%26');" },
        { name: 'рендерить результати і відкриває список', code: "useFakeTimers();\nmockFetch(() => ['apple', 'apricot', '<b>avocado</b>']);\nconst root = document.createElement('div');\ndocument.body.append(root);\ncreateAutocomplete(root);\nconst inp = $('.ac-input', root);\ninput(inp, 'ap');\nadvanceTimersByTime(300);\nawait waitFor(() => $$('.ac-option', root).length === 3);\nconst opts = $$('.ac-option', root);\nexpect(opts.map((li) => li.textContent)).toEqual(['apple', 'apricot', '<b>avocado</b>']);\nexpect($('.ac-list b', root)).toBeNull();\nexpect(opts[0].getAttribute('role')).toBe('option');\nexpect(opts[0].getAttribute('aria-selected')).toBe('false');\nexpect(new Set(opts.map((li) => li.id)).size).toBe(3);\nexpect($('.ac-list', root).hidden).toBe(false);\nexpect(inp.getAttribute('aria-expanded')).toBe('true');" },
        { name: 'порожній результат і minLength', code: "useFakeTimers();\nconst f = mockFetch(() => []);\nconst root = document.createElement('div');\ndocument.body.append(root);\ncreateAutocomplete(root, { minLength: 2 });\nconst inp = $('.ac-input', root);\ninput(inp, 'a');\nadvanceTimersByTime(1000);\nexpect(f).not.toHaveBeenCalled();\nexpect($('.ac-list', root).hidden).toBe(true);\ninput(inp, 'zz');\nadvanceTimersByTime(300);\nawait waitFor(() => $('.ac-empty', root) !== null);\nexpect($('.ac-empty', root).textContent).toBe('Нічого не знайдено');\nexpect($('.ac-list', root).hidden).toBe(false);\ninput(inp, ' ');\nexpect($('.ac-list', root).hidden).toBe(true);" },
        { name: 'гонка: застаріла відповідь ігнорується', code: "useFakeTimers();\nmockFetch((url) => (url.endsWith('q=ab') ? { body: ['ab-result'], delay: 100 } : { body: ['a-result'], delay: 500 }));\nconst root = document.createElement('div');\ndocument.body.append(root);\ncreateAutocomplete(root);\nconst inp = $('.ac-input', root);\ninput(inp, 'a');\nadvanceTimersByTime(300);\nawait flushPromises();\ninput(inp, 'ab');\nadvanceTimersByTime(300);\nawait flushPromises();\nadvanceTimersByTime(100);\nawait waitFor(() => $$('.ac-option', root).length === 1);\nexpect($('.ac-option', root).textContent).toBe('ab-result');\nadvanceTimersByTime(500);\nawait sleep(50);\nexpect($$('.ac-option', root).map((li) => li.textContent)).toEqual(['ab-result']);" },
        { name: 'клавіатура: стрілки по колу, aria-activedescendant, Enter', code: "useFakeTimers();\nmockFetch(() => ['apple', 'apricot', 'avocado']);\nconst onSelect = mockFn();\nconst root = document.createElement('div');\ndocument.body.append(root);\ncreateAutocomplete(root, { onSelect });\nconst inp = $('.ac-input', root);\ninput(inp, 'a');\nadvanceTimersByTime(300);\nawait waitFor(() => $$('.ac-option', root).length === 3);\nconst opts = $$('.ac-option', root);\nconst ev = press(inp, 'ArrowDown');\nexpect(ev.defaultPrevented).toBe(true);\nexpect(opts[0].classList.contains('active')).toBe(true);\nexpect(opts[0].getAttribute('aria-selected')).toBe('true');\nexpect(inp.getAttribute('aria-activedescendant')).toBe(opts[0].id);\npress(inp, 'ArrowDown');\nexpect(opts[1].classList.contains('active')).toBe(true);\nexpect(opts[0].classList.contains('active')).toBe(false);\npress(inp, 'ArrowUp');\npress(inp, 'ArrowUp');\nexpect(opts[2].classList.contains('active')).toBe(true);\npress(inp, 'ArrowDown');\nexpect(opts[0].classList.contains('active')).toBe(true);\npress(inp, 'ArrowUp');\nconst enter = press(inp, 'Enter');\nexpect(enter.defaultPrevented).toBe(true);\nexpect(inp.value).toBe('avocado');\nexpect(onSelect).toHaveBeenCalledWith('avocado');\nexpect($('.ac-list', root).hidden).toBe(true);\nexpect(inp.getAttribute('aria-expanded')).toBe('false');" },
        { name: 'Escape закриває, клік по опції вибирає', code: "useFakeTimers();\nmockFetch(() => ['banana', 'blueberry']);\nconst onSelect = mockFn();\nconst root = document.createElement('div');\ndocument.body.append(root);\ncreateAutocomplete(root, { onSelect });\nconst inp = $('.ac-input', root);\ninput(inp, 'b');\nadvanceTimersByTime(300);\nawait waitFor(() => $$('.ac-option', root).length === 2);\npress(inp, 'Escape');\nexpect($('.ac-list', root).hidden).toBe(true);\nexpect(inp.getAttribute('aria-expanded')).toBe('false');\ninput(inp, 'bl');\nadvanceTimersByTime(300);\nawait waitFor(() => $('.ac-list', root).hidden === false);\nclick($$('.ac-option', root)[1]);\nexpect(inp.value).toBe('blueberry');\nexpect(onSelect).toHaveBeenCalledWith('blueberry');\nexpect($('.ac-list', root).hidden).toBe(true);" },
        { name: 'помилка запиту закриває список без падіння', code: "useFakeTimers();\nlet fail = false;\nmockFetch(() => (fail ? { status: 500, body: '' } : ['ok']));\nconst root = document.createElement('div');\ndocument.body.append(root);\ncreateAutocomplete(root);\nconst inp = $('.ac-input', root);\ninput(inp, 'o');\nadvanceTimersByTime(300);\nawait waitFor(() => $('.ac-list', root).hidden === false);\nfail = true;\ninput(inp, 'ok');\nadvanceTimersByTime(300);\nawait waitFor(() => $('.ac-list', root).hidden === true);\nexpect(inp.getAttribute('aria-expanded')).toBe('false');" }
      ],
      explanation: `
Ця задача перевіряє одразу все: таймери, асинхронність, гонки, події, DOM, доступність. Розбивайте її на шматки вголос — інтерв'юер оцінить структуру.

**Debounce** зменшує кількість запитів (не на кожну літеру), але **не вирішує гонки**: два запити все одно можуть бути в дорозі, і відповіді прийдуть у довільному порядку.

**Гонки (race conditions)** — два шари захисту:
1. \`requestId\`: відповідь застосовується, лише якщо вона від останнього запиту. Працює завжди, навіть якщо запит не можна скасувати.
2. \`AbortController\`: скасовує застарілий запит — економить трафік і сервер. \`AbortError\` у \`catch\` треба ігнорувати, інакше «скасування» виглядатиме як помилка.

**Доступність (WAI-ARIA combobox pattern):** фокус **лишається в input**, а «віртуальний фокус» передається через \`aria-activedescendant\` → скрінрідер озвучує активну опцію. \`aria-expanded\` повідомляє, чи відкритий список. \`mousedown.preventDefault()\` на списку не дає input втратити фокус до \`click\`.

**Складність:** O(k) на рендер k результатів; навігація — O(k) через оновлення класів (можна O(1), оновлюючи лише попередню й нову опції).

**Типові помилки:**
- немає захисту від гонок → у списку результати для «a», хоча введено «ab»;
- \`setTimeout\` без \`clearTimeout\` (це не debounce);
- \`innerHTML\` з результатами сервера → XSS;
- \`blur\` закриває список **до** \`click\` по опції → вибір мишкою не працює (рішення — \`mousedown.preventDefault()\` або закриття з затримкою);
- \`Enter\` сабмітить форму, бо немає \`preventDefault\`;
- запит на порожній рядок або після очищення поля приходить відповідь і знову відкриває список (тому інвалідовуємо \`requestId\` при очищенні).

**Що інтерв'юер спитає далі:**
- Додайте кеш результатів (\`Map\` query → результати) і префіксну оптимізацію.
- Підсвітіть збіг у результатах (\`<mark>\`) — **без** \`innerHTML\` з даними користувача.
- Закриття по кліку поза компонентом і по \`blur\`.
- Як реалізувати це в React (\`useDeferredValue\`, \`useEffect\` з cleanup-прапорцем \`ignore\` або AbortController, бібліотеки Downshift/React Aria)?
- Як тестувати: фейкові таймери, мок fetch, перевірка ARIA (Testing Library \`getByRole('option')\`)?
`
    }
  ]
});
