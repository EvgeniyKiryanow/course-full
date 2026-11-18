FE.topic('ts-practice', {
  intro: `
**TypeScript на практиці** — як типи роблять реальний фронтенд-код надійнішим: стан запитів без неможливих комбінацій, редюсери, перевірка даних з API, типізовані події, класи, DOM і налаштування проєкту.

| Прийом | Навіщо |
|---|---|
| Розрізнюване об'єднання (\`status: 'loading' \\| 'success'\`) | неможливі стани неможливі, звуження за тегом |
| \`x is User\` (type guard) | перевірка даних ззовні + звуження |
| \`asserts x is T\` | «зупинись, якщо не так» з звуженням після виклику |
| Branded-типи | не переплутати \`UserId\` і \`OrderId\` |
| \`satisfies\`, \`as const\` | точні типи конфігів без розширення |

Типи зникають у рантаймі (type erasure) — дані з мережі треба **перевіряти**, а не приводити через \`as\`.
`,
  groups: [
    { id: 'discriminated', title: 'Розрізнювані об\'єднання і стан' },
    { id: 'guards', title: 'Type guards і assertion functions' },
    { id: 'classes', title: 'Класи в TypeScript' },
    { id: 'api', title: 'Типізація API і даних ззовні' },
    { id: 'dom', title: 'TypeScript і DOM' },
    { id: 'config', title: 'tsconfig, d.ts і міграція з JS' }
  ],
  items: [
    // ---------------------------------------------------------------- discriminated unions
    {
      id: 'tsp-area', group: 'discriminated', type: 'code', runtime: 'ts', level: 2, interview: true,
      title: 'Розрізнюване об\'єднання з перевіркою вичерпності',
      description: `
**Завдання.** Опишіть \`Shape\` — об'єднання з полем-тегом \`kind\`:
- \`{ kind: 'circle'; r: number }\`, \`{ kind: 'rect'; w: number; h: number }\`, \`{ kind: 'square'; a: number }\`.

Напишіть \`area(s: Shape): number\` через \`switch (s.kind)\` і \`assertNever\` у \`default\`. Тоді новий варіант у \`Shape\` без обробки стане помилкою компіляції.

**Де трапляється:** стани запитів, екшени редюсерів, повідомлення WebSocket, вузли AST — усюди, де «одне з кількох».

**Як це працює:** розрізнюване об'єднання має спільне поле-літерал (\`kind\`). \`switch (shape.kind)\` звужує тип у кожній гілці, а \`const _exhaustive: never = shape\` у \`default\` перетворює забуту гілку на помилку компіляції.
`,
      starter: `type Shape = any; // TODO

function assertNever(x: never): never {
  throw new Error('Unexpected: ' + JSON.stringify(x));
}

function area(s: Shape): number {
  // TODO: switch (s.kind) { ... default: return assertNever(s); }
  return 0;
}
`,
      solution: `type Shape =
  | { kind: 'circle'; r: number }
  | { kind: 'rect'; w: number; h: number }
  | { kind: 'square'; a: number };

function assertNever(x: never): never {
  throw new Error('Unexpected: ' + JSON.stringify(x));
}

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.r ** 2;
    case 'rect': return s.w * s.h;
    case 'square': return s.a ** 2;
    default: return assertNever(s);
  }
}
`,
      hints: ['`type Shape = | { kind: \'circle\'; r: number } | ...` — у кожного варіанта своє літеральне значення `kind`.', 'У кожному `case` TS звужує `s` до відповідного варіанта; у `default` — `assertNever(s)`.'],
      tests: [
        "expect(area({ kind: 'rect', w: 2, h: 3 })).toBe(6)",
        "expect(area({ kind: 'square', a: 4 })).toBe(16)",
        "expect(area({ kind: 'circle', r: 1 })).toBeCloseTo(Math.PI)"
      ],
      typeTests: [
        { name: 'невідомий kind — помилка', code: "// @ts-expect-error\narea({ kind: 'triangle', b: 1 });" },
        { name: 'у варіанта немає чужих полів', code: "// @ts-expect-error\narea({ kind: 'circle', w: 1 });" }
      ],
      explanation: 'Тег (`kind`, `type`, `status`) — літеральне поле, спільне для всіх варіантів. Перевірка тегу звужує весь об\'єкт. `assertNever` у `default` — «страховка» на майбутнє: додали `\'triangle\'` до типу — компілятор вкаже на всі місця, де його не обробили.'
    },
    {
      id: 'tsp-request-state', group: 'discriminated', type: 'code', runtime: 'ts', level: 3, interview: true,
      title: 'Стан запиту без неможливих комбінацій',
      description: `
**Завдання.** Замість трьох незалежних полів (\`isLoading\`, \`error\`, \`data\`) опишіть generic-тип
\`RequestState<T>\`:
- \`{ status: 'idle' }\`
- \`{ status: 'loading' }\`
- \`{ status: 'success'; data: T }\`
- \`{ status: 'error'; error: string }\`

і функцію \`describe(state: RequestState<string[]>): string\`:
- \`idle\` → \`''\`, \`loading\` → \`'Завантаження…'\`;
- \`success\` → \`'Знайдено: N'\` (N — довжина масиву);
- \`error\` → \`'Помилка: …'\`.

**Де трапляється:** кожен екран, що вантажить дані. З прапорцями можна отримати \`isLoading: true\` і \`error\` одночасно — з об'єднанням такий стан **не можна навіть описати**.

**Як це працює:** замість незалежних прапорців (\`loading\`, \`error\`, \`data\`) стан описують об'єднанням варіантів зі спільним \`status\`. Тоді комбінації «є і помилка, і дані» просто немає в типі, а TS за значенням \`status\` знає, які поля доступні.
`,
      starter: `type RequestState<T> = {
  isLoading: boolean;
  error?: string;
  data?: T;
}; // TODO: переписати як об'єднання

function describe(state: RequestState<string[]>): string {
  return '';
}
`,
      solution: `type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function describe(state: RequestState<string[]>): string {
  switch (state.status) {
    case 'idle': return '';
    case 'loading': return 'Завантаження…';
    case 'success': return 'Знайдено: ' + state.data.length;
    case 'error': return 'Помилка: ' + state.error;
  }
}
`,
      hints: ['Чотири варіанти з полем `status`; `data` є лише в `success`, `error` — лише в `error`.', 'У `case \'success\'` TS знає, що `state.data` існує — без `?.` і `!`.'],
      tests: [
        "expect(describe({ status: 'success', data: ['a', 'b'] })).toBe('Знайдено: 2')",
        "expect(describe({ status: 'error', error: '404' })).toBe('Помилка: 404')",
        "expect([describe({ status: 'idle' }), describe({ status: 'loading' })]).toEqual(['', 'Завантаження…'])"
      ],
      typeTests: [
        { name: 'success без data — помилка', code: "// @ts-expect-error\nconst s: RequestState<number> = { status: 'success' };" },
        { name: 'loading з помилкою — неможливо', code: "// @ts-expect-error\nconst l: RequestState<number> = { status: 'loading', error: 'x' };" }
      ],
      explanation: '«Make impossible states impossible»: тип описує лише валідні комбінації. Так працюють TanStack Query (`status: \'pending\' | \'error\' | \'success\'`) і стейт-машини. Зверніть увагу: `switch` без `default` компілюється з типом результату `string`, бо TS бачить, що всі варіанти повертають значення.'
    },
    {
      id: 'tsp-reducer', group: 'discriminated', type: 'code', runtime: 'ts', level: 3,
      title: 'Типізований редюсер',
      description: `
**Завдання.** Опишіть \`Action\`:
- \`{ type: 'add'; text: string }\`
- \`{ type: 'toggle'; id: number }\`
- \`{ type: 'remove'; id: number }\`

Напишіть чистий \`todosReducer(state: readonly Todo[], action: Action): Todo[]\` (\`Todo\` — \`{ id: number; text: string; done: boolean }\`). Новий \`id\` = максимальний наявний + 1 (або 1).

**Де трапляється:** \`useReducer\`, Redux, будь-яка стейт-машина. Відправити екшен з помилкою в назві чи без потрібного поля — помилка компіляції.

**Як це працює:** дії — розрізнюване об'єднання за полем \`type\`, тож у кожному \`case\` TS знає точний \`payload\`. Редюсер повертає той самий \`State\`, і забута чи зайва властивість стає помилкою компіляції.
`,
      starter: `interface Todo { id: number; text: string; done: boolean }

type Action = any; // TODO

function todosReducer(state: readonly Todo[], action: Action): Todo[] {
  // TODO
  return [...state];
}
`,
      solution: `interface Todo { id: number; text: string; done: boolean }

type Action =
  | { type: 'add'; text: string }
  | { type: 'toggle'; id: number }
  | { type: 'remove'; id: number };

function todosReducer(state: readonly Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'add': {
      const id = state.reduce((max, t) => Math.max(max, t.id), 0) + 1;
      return [...state, { id, text: action.text, done: false }];
    }
    case 'toggle':
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case 'remove':
      return state.filter((t) => t.id !== action.id);
  }
}
`,
      hints: ['Об\'єднання трьох варіантів з тегом `type`.', 'Немутуючі оновлення: спред для add, `map` для toggle, `filter` для remove.'],
      tests: [
        "expect(todosReducer([], { type: 'add', text: 'a' })).toEqual([{ id: 1, text: 'a', done: false }])",
        { name: 'toggle і remove, без мутацій', code: "const s = [{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: false }];\nconst t = todosReducer(s, { type: 'toggle', id: 2 });\nexpect(t[1].done).toBe(true);\nexpect(s[1].done).toBe(false);\nexpect(todosReducer(t, { type: 'remove', id: 1 }).map((x) => x.id)).toEqual([2]);" }
      ],
      typeTests: [
        { name: 'add без text — помилка', code: "// @ts-expect-error\ntodosReducer([], { type: 'add' });" },
        { name: 'невідомий екшен — помилка', code: "// @ts-expect-error\ntodosReducer([], { type: 'clear' });" }
      ],
      explanation: '`readonly Todo[]` у параметрі гарантує, що редюсер не мутує стан (`state.push` — помилка). Об\'єднання екшенів + звуження в `switch` — ядро типізації Redux. Redux Toolkit генерує ці типи сам (`createSlice`), але принцип той самий.'
    },
    {
      id: 'tsp-quiz-flags', group: 'discriminated', type: 'quiz', level: 2,
      title: 'Прапорці чи об\'єднання',
      question: `
Який стан **неможливий** з типом A і **можливий** з типом B?

\`\`\`ts
type A = { status: 'loading' } | { status: 'error'; error: string } | { status: 'success'; data: User };
type B = { isLoading: boolean; error?: string; data?: User };
\`\`\`
`,
      options: [
        'Одночасно «завантаження» і «помилка» з даними',
        'Успішне завершення запиту з отриманими даними',
        'Помилка запиту з текстом повідомлення для користувача',
        'Різниці немає — обидва типи описують ті самі стани'
      ],
      answer: 0,
      why: [
        'Так: у B три незалежні поля дають 8+ комбінацій, частина з них безглузда.',
        'Ні: це валідний стан в обох типах.',
        'Ні: валідний в обох.',
        'Ні: B дозволяє суперечливі комбінації.'
      ],
      hint: 'Скільки комбінацій дає B і скільки з них мають сенс?',
      explanation: 'Незалежні прапорці множать кількість станів (2 × 2 × 2), об\'єднання — додає (рівно стільки варіантів, скільки описано). Менше станів — менше гілок у UI і менше багів на кшталт «спінер поверх повідомлення про помилку».'
    },
    // ---------------------------------------------------------------- guards
    {
      id: 'tsp-is-user', group: 'guards', type: 'code', runtime: 'ts', level: 2, interview: true,
      title: 'Type guard: перевірка даних з API',
      description: `
**Завдання.**
1. \`isUser(x: unknown): x is User\` — \`true\`, якщо \`x\` — об'єкт з числовим \`id\` і рядковим \`name\` (\`email\` — необов'язковий рядок).
2. \`parseUsers(json: unknown): User[]\` — якщо \`json\` масив, повернути лише валідних користувачів; інакше \`[]\`.

**Де трапляється:** відповідь API, \`localStorage\`, \`postMessage\` — дані без гарантій. Guard перевіряє в рантаймі і **звужує тип** для компілятора.

**Як це працює:** тип результату \`x is User\` (type predicate) каже TS: якщо функція повернула \`true\`, у цій гілці \`x\` — \`User\`.
`,
      starter: `interface User {
  id: number;
  name: string;
  email?: string;
}

function isUser(x: unknown): boolean {
  // TODO: тип результату — предикат; перевірки полів
  return false;
}

function parseUsers(json: unknown): User[] {
  // TODO
  return [];
}
`,
      solution: `interface User {
  id: number;
  name: string;
  email?: string;
}

function isUser(x: unknown): x is User {
  if (typeof x !== 'object' || x === null) return false;
  const u = x as Record<string, unknown>;
  return typeof u.id === 'number' && typeof u.name === 'string' &&
    (u.email === undefined || typeof u.email === 'string');
}

function parseUsers(json: unknown): User[] {
  return Array.isArray(json) ? json.filter(isUser) : [];
}
`,
      hints: ['Сигнатура: `function isUser(x: unknown): x is User`. Спершу `typeof x === \'object\' && x !== null`.', 'Для доступу до полів після перевірки на об\'єкт: `const u = x as Record<string, unknown>`. А `json.filter(isUser)` звузить масив до `User[]`.'],
      tests: [
        "expect(isUser({ id: 1, name: 'Ann' })).toBe(true)",
        "expect([isUser(null), isUser({ id: '1', name: 'A' }), isUser({ id: 1, name: 'A', email: 5 })]).toEqual([false, false, false])",
        "expect(parseUsers([{ id: 1, name: 'A' }, { id: 2 }, 'x'])).toEqual([{ id: 1, name: 'A' }])",
        "expect(parseUsers({ id: 1 })).toEqual([])"
      ],
      typeTests: [
        { name: 'guard звужує unknown до User', code: "function useIt(v: unknown) {\n  if (isUser(v)) { type V = Expect<Equal<typeof v, User>>; }\n}" }
      ],
      explanation: 'Guard — це **обіцянка**: TS вірить, що перевірка правильна. Неповна перевірка = брехня компілятору. Тому для складних даних використовують бібліотеки схем (Zod: `UserSchema.safeParse(json)` + `z.infer`), де перевірка і тип генеруються з одного опису.'
    },
    {
      id: 'tsp-quiz-boolean-guard', group: 'guards', type: 'quiz', level: 2,
      title: 'boolean чи предикат',
      question: `
Який тип має \`v\` всередині \`if\` у функціях f і g?

\`\`\`ts
function isUser(x: unknown): x is User { /* ... */ }
function isUserBool(x: unknown): boolean { return isUser(x); }

function f(v: unknown) { if (isUser(v)) { v; } }
function g(v: unknown) { if (isUserBool(v)) { v; } }
\`\`\`
`,
      options: ['f: `User`, g: `unknown`', 'Обидва `User`', 'Обидва `unknown`', 'f: `unknown`, g: `User`'],
      answer: 0,
      why: [
        'Так: звужує лише функція з предикатом у сигнатурі; boolean-обгортка «губить» інформацію.',
        'Ні: TS не заглядає в тіло isUserBool.',
        'Ні: предикат звужує.',
        'Ні: навпаки.'
      ],
      hint: 'Звідки TS знає, що функція — перевірка типу?',
      explanation: 'Звуження працює за **сигнатурою**, не за тілом функції. Обгортки над guard\'ами теж мають повертати предикат. З TS 5.5 простий предикат виводиться автоматично для стрілок: `arr.filter((x) => x != null)` дає `number[]` без явного `x is number`.'
    },
    {
      id: 'tsp-assert-defined', group: 'guards', type: 'code', runtime: 'ts', level: 2,
      title: 'Assertion function: asserts v is T',
      description: `
**Завдання.** Напишіть \`assertDefined(value, message)\`: кидає \`Error(message)\`, якщо значення \`null\` або \`undefined\`. **Після** виклику TS має знати, що значення визначене.

**Де трапляється:** інваріанти: «елемент точно є в DOM», «користувач залогінений на цій сторінці», «конфіг завантажено». Замість \`!\` (який просто мовчить) — перевірка з помилкою.

**Як це працює:** тип результату \`asserts value is NonNullable<T>\` — функція або кидає виняток, або гарантує тип для коду **після** виклику.
`,
      starter: `function assertDefined<T>(value: T, message = 'Значення відсутнє') {
  // TODO
}
`,
      solution: `function assertDefined<T>(value: T, message = 'Значення відсутнє'): asserts value is NonNullable<T> {
  if (value === null || value === undefined) throw new Error(message);
}
`,
      hints: ['Тип результату: `asserts value is NonNullable<T>`.', 'Тіло — звичайна перевірка з `throw new Error(message)`.'],
      tests: [
        "expect(() => assertDefined(null, 'немає')).toThrow('немає')",
        "expect(() => assertDefined(0)).not.toThrow()"
      ],
      typeTests: [
        { name: 'після виклику тип звужений', code: "function f(x: string | null) {\n  assertDefined(x);\n  type X = Expect<Equal<typeof x, string>>;\n  return x.length;\n}" }
      ],
      explanation: 'Assertion functions (TS 3.7) — як `assert` у тестах, але для типів. Обмеження: функцію-assertion треба викликати через оголошене ім\'я з явним типом (стрілка в `const` без анотації не працює як assertion). `!` (non-null assertion) — те саме обіцяння без перевірки, тож у рантаймі помилка проявиться пізніше і незрозуміліше.'
    },
    {
      id: 'tsp-quiz-filter-predicate', group: 'guards', type: 'quiz', level: 3,
      title: 'filter і виведення предикатів',
      question: `
Який тип має \`xs\` (TypeScript 5.5+)?

\`\`\`ts
const arr = [1, null, 2, undefined];
const xs = arr.filter((x) => x != null);
\`\`\`
`,
      options: ['`number[]`', '`(number | null | undefined)[]`', '`(number | null)[]`', '`unknown[]`'],
      answer: 0,
      why: [
        'Так: TS 5.5 виводить предикат `x is number` зі стрілки автоматично.',
        'Так було до TS 5.5 — тоді писали `(x): x is number => x != null`.',
        'Ні: `!= null` відсіює і null, і undefined.',
        'Ні: тип елементів відомий.'
      ],
      hint: 'Що змінилося в TS 5.5 щодо type predicates?',
      explanation: '**Inferred type predicates** (TS 5.5): якщо стрілка повертає перевірку, що звужує параметр, TS сам робить її предикатом. Працює для простих випадків; для складних (перевірка полів об\'єкта) пишуть явний guard.'
    },
    // ---------------------------------------------------------------- classes
    {
      id: 'tsp-quiz-modifiers', group: 'classes', type: 'quiz', level: 2,
      title: 'private, readonly, protected і #',
      question: `
Скільки помилок компіляції в останніх трьох рядках і що поверне \`(acc as any).balance\` у рантаймі?

\`\`\`ts
class Account {
  private balance = 100;
  constructor(public readonly owner: string, protected currency = 'UAH') {}
}
const acc = new Account('Ann');
acc.balance;            // A
acc.owner = 'x';        // B
acc.currency;           // C
(acc as any).balance;   // D — у рантаймі
\`\`\`
`,
      options: [
        'Три помилки (A, B, C); D поверне 100',
        'Три помилки; D поверне undefined, бо поле приватне',
        'Лише B; D поверне 100',
        'Помилок немає: модифікатори лише для документації'
      ],
      answer: 0,
      why: [
        'Так: private/protected/readonly — перевірки компілятора; у JS поле звичайне, тож через any воно доступне.',
        'Ні: TS-private не існує в рантаймі — на відміну від `#balance`.',
        'Ні: A і C — теж помилки доступу.',
        'Ні: компілятор їх суворо перевіряє.'
      ],
      hint: 'Що лишається від `private` після компіляції в JS?',
      explanation: '`private`/`protected` — лише перевірка TS (обійти — `as any`, звертання за ключем). `#field` — справжня приватність рушія JS. **Parameter properties** (`constructor(public readonly owner: string)`) оголошують і присвоюють поле одним записом; але це синтаксис, що генерує код, — його не підтримує `erasableSyntaxOnly` (Node type stripping).'
    },
    {
      id: 'tsp-account', group: 'classes', type: 'code', runtime: 'ts', level: 2,
      title: 'Клас з #приватним станом і getter',
      description: `
**Завдання.** Напишіть клас \`BankAccount\`:
- \`owner\` — рядок, **лише для читання**;
- баланс — справжнє приватне поле \`#balance\` (0 на старті);
- \`get balance(): number\` — лише читання;
- \`deposit(amount: number): void\` і \`withdraw(amount: number): void\`; сума ≤ 0 або більша за баланс → \`Error\`.

**Де трапляється:** сутності з інваріантами (кошик, бронювання, гаманець): стан змінюється лише через методи з перевірками.

**Як це працює:** \`readonly\` і \`private\` — перевірки лише компілятора (у JS після компіляції їх немає), а \`#поле\` — справжня приватність рушія: до нього не дістатися навіть через \`as any\`. **Аналогія:** той самий \`BankAccount\`, що в модулі «Прототипи і класи», — тепер некоректне використання ловить ще й компілятор.
`,
      starter: `class BankAccount {
  // TODO: readonly owner, #balance, getter balance, deposit, withdraw
  constructor(owner: string) {}
}
`,
      solution: `class BankAccount {
  readonly owner: string;
  #balance = 0;

  constructor(owner: string) {
    this.owner = owner;
  }

  get balance(): number {
    return this.#balance;
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error('Сума має бути додатною');
    this.#balance += amount;
  }

  withdraw(amount: number): void {
    if (amount <= 0) throw new Error('Сума має бути додатною');
    if (amount > this.#balance) throw new Error('Недостатньо коштів');
    this.#balance -= amount;
  }
}
`,
      hints: ['`readonly owner: string;` і `#balance = 0;`. Getter: `get balance(): number { return this.#balance; }`.', 'Спершу перевірки з `throw`, потім зміна `#balance`.'],
      tests: [
        { name: 'поповнення і зняття', code: "const a = new BankAccount('Ann');\na.deposit(100);\na.withdraw(30);\nexpect(a.balance).toBe(70);" },
        { name: 'помилки', code: "const a = new BankAccount('Ann');\nexpect(() => a.withdraw(1)).toThrow('Недостатньо коштів');\nexpect(() => a.deposit(0)).toThrow();" }
      ],
      typeTests: [
        { name: 'owner лише для читання', code: "const acc = new BankAccount('A');\n// @ts-expect-error\nacc.owner = 'B';" },
        { name: 'balance не можна присвоїти', code: "const acc2 = new BankAccount('A');\n// @ts-expect-error\nacc2.balance = 1000;" },
        { name: 'сума — лише число', code: "const acc3 = new BankAccount('A');\n// @ts-expect-error\nacc3.deposit('10');" }
      ],
      explanation: 'Getter без setter робить властивість «лише для читання» і в TS (`Cannot assign to \'balance\' because it is a read-only property`), і в рантаймі. `#balance` захищає стан навіть від `as any`. Стан змінюється лише методами з перевірками — це інкапсуляція в класичному сенсі ООП.'
    },
    {
      id: 'tsp-typed-emitter', group: 'classes', type: 'code', runtime: 'ts', level: 3,
      title: 'Типізований EventEmitter',
      description: `
**Завдання.** Напишіть \`class TypedEmitter<Events extends Record<string, unknown>>\`:
- \`on<K extends keyof Events>(event: K, cb: (payload: Events[K]) => void): () => void\` — підписка; повертає функцію відписки;
- \`emit<K extends keyof Events>(event: K, payload: Events[K]): void\`.

**Приклад**
\`\`\`ts
type AppEvents = { login: { id: string }; logout: undefined };
const bus = new TypedEmitter<AppEvents>();
bus.on('login', (p) => p.id);   // p: { id: string }
bus.emit('login', 42);          // помилка компіляції
\`\`\`

**Де трапляється:** шини подій, WebSocket-повідомлення, аналітика: назва події і форма даних пов'язані типом.

**Як це працює:** мапа подій (назва → тип даних) і \`K extends keyof Events\` у методах \`on\` та \`emit\` зв'язують назву події з типом аргументу: \`emit('login', 42)\` замість об'єкта користувача не скомпілюється.
`,
      starter: `class TypedEmitter<Events extends Record<string, unknown>> {
  private listeners: { [K in keyof Events]?: Array<(payload: Events[K]) => void> } = {};

  on(event: any, cb: any): () => void {
    // TODO: типізувати і реалізувати
    return () => {};
  }

  emit(event: any, payload: any): void {
    // TODO
  }
}
`,
      solution: `class TypedEmitter<Events extends Record<string, unknown>> {
  private listeners: { [K in keyof Events]?: Array<(payload: Events[K]) => void> } = {};

  on<K extends keyof Events>(event: K, cb: (payload: Events[K]) => void): () => void {
    const list = (this.listeners[event] ??= []);
    list.push(cb);
    return () => {
      const i = list.indexOf(cb);
      if (i !== -1) list.splice(i, 1);
    };
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    for (const cb of [...(this.listeners[event] ?? [])]) cb(payload);
  }
}
`,
      hints: ['Обидва методи generic по ключу: `<K extends keyof Events>`, payload — `Events[K]`.', 'Сховище вже типізоване mapped-типом: `this.listeners[event] ??= []`. Копія масиву в emit (`[...]`) — щоб відписка під час emit не ламала цикл.'],
      tests: [
        { name: 'підписка і подія', code: "const bus = new TypedEmitter();\nconst cb = mockFn();\nbus.on('login', cb);\nbus.emit('login', { id: 'u1' });\nexpect(cb).toHaveBeenCalledWith({ id: 'u1' });" },
        { name: 'відписка', code: "const bus = new TypedEmitter();\nconst cb = mockFn();\nconst off = bus.on('x', cb);\noff();\nbus.emit('x', 1);\nexpect(cb).not.toHaveBeenCalled();" }
      ],
      typeTests: [
        { name: 'тип payload виводиться', code: "type AppEvents = { login: { id: string }; logout: undefined };\nconst bus = new TypedEmitter<AppEvents>();\nbus.on('login', (p) => { type P = Expect<Equal<typeof p, { id: string }>>; });" },
        { name: 'неправильний payload — помилка', code: "const bus2 = new TypedEmitter<{ login: { id: string } }>();\n// @ts-expect-error\nbus2.emit('login', 42);" },
        { name: 'невідома подія — помилка', code: "const bus3 = new TypedEmitter<{ login: { id: string } }>();\n// @ts-expect-error\nbus3.on('signup', () => {});" }
      ],
      explanation: 'Мапа «подія → тип даних» + `K extends keyof Events` + `Events[K]` — той самий прийом, що в типах DOM: `addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (ev: HTMLElementEventMap[K]) => any)`. Тому `\'keydown\'` дає `KeyboardEvent` автоматично.'
    },
    {
      id: 'tsp-quiz-abstract', group: 'classes', type: 'quiz', level: 2,
      title: 'abstract і implements',
      question: `
Які рядки дадуть помилку?

\`\`\`ts
abstract class Shape {
  abstract area(): number;
  describe() { return 'S=' + this.area(); }
}
const s = new Shape();               // A
interface Named { name: string }
class X implements Named {}          // B
\`\`\`
`,
      options: ['A і B', 'Лише A', 'Лише B', 'Жоден'],
      answer: 0,
      why: [
        'Так: абстрактний клас не можна інстанціювати; implements вимагає всіх полів інтерфейсу.',
        'Ні: B теж помилка — немає name.',
        'Ні: A — TS2511.',
        'Ні: обидва порушують контракти.'
      ],
      hint: 'Що означає abstract і що перевіряє implements?',
      explanation: '`abstract` — базовий клас з обов\'язковими для реалізації методами (шаблонний метод: `describe` використовує ще не реалізований `area`). `implements` — перевірка, що клас відповідає інтерфейсу; він **не** додає ні полів, ні типів параметрам методів — це лише перевірка.'
    },
    // ---------------------------------------------------------------- api
    {
      id: 'tsp-fetch-json', group: 'api', type: 'code', runtime: 'ts', level: 3,
      title: 'fetchJson з перевіркою даних',
      description: `
**Завдання.** Напишіть \`fetchJson<T>(url, guard)\`:
- робить \`fetch(url)\`;
- \`!res.ok\` → \`throw new Error('HTTP ' + res.status)\`;
- тіло — \`unknown\`; якщо \`guard(data)\` повертає \`false\` → \`throw new Error('Некоректні дані')\`;
- інакше повертає дані з типом \`T\` — **виведеним з guard**.

**Приклад**
\`\`\`ts
const user = await fetchJson('/api/me', isUser); // user: User
\`\`\`

**Де трапляється:** API-шар застосунку: усі відповіді проходять перевірку в одному місці, а далі код працює з гарантованими типами.

**Як це працює:** \`res.json()\` повертає \`any\`, тож тип даних ззовні — лише обіцянка, а не гарантія. Type guard \`(x: unknown): x is T\` перевіряє дані під час виконання і водночас звужує тип: після перевірки код працює з \`T\` без \`as\`.
`,
      starter: `async function fetchJson(url: string, guard: (x: unknown) => boolean): Promise<any> {
  const res = await fetch(url);
  return res.json();
}
`,
      solution: `async function fetchJson<T>(url: string, guard: (x: unknown) => x is T): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data: unknown = await res.json();
  if (!guard(data)) throw new Error('Некоректні дані');
  return data;
}
`,
      hints: ['Параметр guard — предикат: `guard: (x: unknown) => x is T`. Тоді T виводиться з переданої функції.', '`const data: unknown = await res.json();` — після `if (!guard(data)) throw` TS знає, що `data` — T.'],
      tests: [
        { name: 'повертає перевірені дані', code: "mockFetch(() => ({ id: 1 }));\nconst isObj = (x) => typeof x === 'object' && x !== null && typeof x.id === 'number';\nexpect(await fetchJson('/a', isObj)).toEqual({ id: 1 });" },
        { name: 'HTTP-помилка', code: "mockFetch(() => ({ status: 500, body: {} }));\nawait expect(fetchJson('/a', () => true)).rejects.toThrow('HTTP 500');" },
        { name: 'некоректні дані', code: "mockFetch(() => ({ name: 'x' }));\nawait expect(fetchJson('/a', () => false)).rejects.toThrow('Некоректні дані');" }
      ],
      typeTests: [
        { name: 'тип виводиться з guard', code: "interface Me { id: number }\ndeclare function isMe(x: unknown): x is Me;\nasync function use() {\n  const me = await fetchJson('/me', isMe);\n  type M = Expect<Equal<typeof me, Me>>;\n}" }
      ],
      explanation: 'Порівняйте з поширеним `fetchJson<T>(url): Promise<T> { return res.json() }` — це брехня компілятору: `T` нічим не перевірений. Варіант з guard (або схемою Zod: `schema.parse(data)`) дає справжню гарантію. Тип **виводиться** з guard, тож явно писати `<User>` не потрібно.'
    },
    {
      id: 'tsp-runtime-validation', group: 'api', type: 'theory', level: 3, interview: true,
      title: 'Типи і дані ззовні',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        '`const user = data as User` нічого не перевіряє в рантаймі',
        'Схеми (Zod, Valibot) дають і рантайм-перевірку, і тип через `z.infer`',
        'Якщо бекенд на TypeScript, перевіряти відповіді на фронтенді не потрібно за жодних умов',
        'Типи для API можна генерувати з OpenAPI/GraphQL-схеми, щоб фронтенд і бекенд не розходились',
        '`JSON.parse` повертає `any`, тому результат краще одразу зберігати як `unknown`'
      ],
      correct: [0, 1, 3, 4],
      why: [
        'Так: `as` — лише вказівка компілятору.',
        'Так: одне джерело правди для перевірки і типу.',
        'Ні: версії розходяться, проксі й кеші змінюють дані — межа мережі завжди недовірена.',
        'Так: openapi-typescript, GraphQL Codegen.',
        'Так: unknown змушує перевірити дані перед використанням.'
      ],
      hint: 'Що з цього існує лише під час компіляції?',
      answer: `
**Межі системи** (мережа, сховища, \`postMessage\`, URL) — місця, де типи не гарантовані. Стратегія:
1. дані ззовні — \`unknown\`;
2. перевірка: guard або схема (\`UserSchema.safeParse(json)\`);
3. далі в застосунку — сильні типи без \`as\`.

**Генерація типів:** OpenAPI → \`openapi-typescript\`, GraphQL → Codegen, tRPC — типи спільні для клієнта й сервера в одному репозиторії.

**DTO vs модель:** відповідь API (snake_case, рядкові дати) часто перетворюють на доменну модель (camelCase, \`Date\`) у тому самому шарі, де перевіряють.
`,
      keyPoints: ['as не перевіряє', 'unknown → перевірка → сильний тип', 'Схеми: перевірка + тип з одного опису', 'Генерація типів з OpenAPI/GraphQL']
    },
    {
      id: 'tsp-branded-ids', group: 'api', type: 'code', runtime: 'ts', level: 3,
      title: 'Branded-типи: не переплутати id',
      description: `
**Завдання.** Створіть branded-типи \`UserId\` і \`OrderId\` (обидва — рядки «з міткою») і функції-конструктори:
- \`toUserId(raw: string): UserId\` і \`toOrderId(raw: string): OrderId\` — порожній рядок → \`Error\`.

Функцію \`getOrder(userId: UserId, orderId: OrderId)\` уже написано.

**Де трапляється:** у великих застосунках \`getOrder(orderId, userId)\` з переплутаними аргументами — реальний баг, якого \`string\` не помітить. Бренд робить типи несумісними.

**Як це працює:** \`type UserId = string & { readonly __brand: 'UserId' }\` — у рантаймі це звичайний рядок, а для компілятора — окремий тип. Створити його можна лише через функцію з \`as\`.
`,
      starter: `type UserId = string;  // TODO
type OrderId = string; // TODO

function toUserId(raw: string): UserId {
  return raw;
}
function toOrderId(raw: string): OrderId {
  return raw;
}

function getOrder(userId: UserId, orderId: OrderId): string {
  return userId + '/' + orderId;
}
`,
      solution: `type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function toUserId(raw: string): UserId {
  if (!raw) throw new Error('Порожній UserId');
  return raw as UserId;
}
function toOrderId(raw: string): OrderId {
  if (!raw) throw new Error('Порожній OrderId');
  return raw as OrderId;
}

function getOrder(userId: UserId, orderId: OrderId): string {
  return userId + '/' + orderId;
}
`,
      hints: ['`type UserId = string & { readonly __brand: \'UserId\' };` — і аналогічно для OrderId з іншою міткою.', 'Конструктор перевіряє і повертає `raw as UserId` — це єдине місце з `as`.'],
      tests: [
        "expect(getOrder(toUserId('u1'), toOrderId('o9'))).toBe('u1/o9')",
        "expect(() => toUserId('')).toThrow()"
      ],
      typeTests: [
        { name: 'сирий рядок не підходить', code: "// @ts-expect-error\ngetOrder('u1', toOrderId('o1'));" },
        { name: 'переплутані id — помилка', code: "const u = toUserId('u');\nconst o = toOrderId('o');\n// @ts-expect-error\ngetOrder(o, u);" }
      ],
      explanation: 'Branded (nominal) типи компенсують структурну типізацію там, де однакова форма має різний сенс: id, гроші в різних валютах, санітизований HTML, абсолютні й відносні шляхи. Ціна — `as` у конструкторі, тому перевірки зосереджені в одному місці.'
    },
    // ---------------------------------------------------------------- DOM
    {
      id: 'tsp-quiz-query-selector', group: 'dom', type: 'quiz', level: 2,
      title: 'Типи querySelector',
      question: `
Які типи мають \`a\` і \`b\`?

\`\`\`ts
const a = document.querySelector('input');
const b = document.querySelector('#email');
\`\`\`
`,
      options: [
        '`HTMLInputElement | null` і `Element | null`',
        'Обидва `HTMLInputElement | null` — TS читає селектор',
        'Обидва `Element` без null — елемент гарантовано є',
        '`HTMLInputElement` і `HTMLElement` без null'
      ],
      answer: 0,
      why: [
        'Так: для селектора-тегу TS знає точний тип (HTMLElementTagNameMap), для решти — загальний Element.',
        'Ні: з `#email` TS не знає, що це input.',
        'Ні: елемента може не бути — тому `| null`.',
        'Ні: результат завжди може бути null.'
      ],
      hint: 'Що TS може «прочитати» з рядка селектора?',
      explanation: 'Перевантаження `querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K)` дає точний тип лише для імені тегу. Для інших селекторів: generic `querySelector<HTMLInputElement>(\'#email\')` (обіцянка без перевірки) або надійніше — `instanceof HTMLInputElement` після вибірки. `getElementById` повертає `HTMLElement | null`.'
    },
    {
      id: 'tsp-quiz-event-target', group: 'dom', type: 'quiz', level: 2,
      title: 'Тип події і event.target',
      question: `
\`\`\`ts
input.addEventListener('input', (e) => {
  console.log(e.target.value);
});
\`\`\`
Чому TypeScript показує помилку і як правильно?
`,
      options: [
        '`e.target` — `EventTarget | null`; звузити через `instanceof`',
        'Треба оголосити параметр як `(e: any)`, тоді помилка зникне',
        'Помилки немає — `e.target` завжди `HTMLInputElement` для input',
        'Треба замінити `addEventListener` на властивість `oninput`'
      ],
      answer: 0,
      why: [
        'Так: target — будь-яка ціль (могла спливти від нащадка), тому тип загальний.',
        'Ні: any прибирає перевірки замість розв\'язання.',
        'Ні: TS не знає, від якого елемента прийшла подія.',
        'Ні: тип target той самий.'
      ],
      hint: 'Чи гарантовано, що target — саме цей input?',
      explanation: 'Тип події виводиться з назви (`\'keydown\'` → `KeyboardEvent`, `\'click\'` у сучасному lib.dom — `PointerEvent`), але `target` — `EventTarget | null`, бо подія могла спливти від будь-якого нащадка. Найпростіше — посилатися на сам елемент (`input.value`) або звужувати `instanceof`.'
    },
    // ---------------------------------------------------------------- config
    {
      id: 'tsp-strict-flags', group: 'config', type: 'theory', level: 3,
      title: 'tsconfig: що вмикає strict',
      question: 'Оберіть **усі** правильні твердження про `"strict": true`.',
      choices: [
        'Вмикає `noImplicitAny` і `strictNullChecks`',
        'Вмикає `useUnknownInCatchVariables`: у `catch (e)` змінна має тип `unknown`',
        'Вмикає `noUncheckedIndexedAccess`: `arr[0]` має тип `T | undefined`',
        'Вмикає `strictFunctionTypes` і `strictPropertyInitialization`',
        'Вимикає генерацію JavaScript'
      ],
      correct: [0, 1, 3],
      why: [
        'Так: дві найважливіші перевірки.',
        'Так: з TS 4.4 у складі strict.',
        'Ні: це окремий прапорець, не входить у strict (але корисний).',
        'Так: обидва входять у strict.',
        'Ні: за генерацію відповідає noEmit.'
      ],
      hint: 'Деякі суворі прапорці додаються окремо.',
      answer: `
**\`strict: true\`** вмикає: \`noImplicitAny\`, \`strictNullChecks\`, \`strictFunctionTypes\`, \`strictBindCallApply\`, \`strictPropertyInitialization\`, \`noImplicitThis\`, \`alwaysStrict\`, \`useUnknownInCatchVariables\`.

**Окремо варто ввімкнути:** \`noUncheckedIndexedAccess\` (\`arr[i]\` і \`record[key]\` можуть бути \`undefined\`), \`exactOptionalPropertyTypes\`, \`noImplicitOverride\`, \`noFallthroughCasesInSwitch\`.

**Сучасний фронтенд-проєкт:** \`"module": "ESNext"\`, \`"moduleResolution": "bundler"\`, \`"noEmit": true\` (збирає Vite/esbuild, а \`tsc\` лише перевіряє типи), \`"isolatedModules": true\` (кожен файл транспілюється окремо), \`"skipLibCheck": true\`.
`,
      keyPoints: ['strict = noImplicitAny + strictNullChecks + ще 6 перевірок', 'noUncheckedIndexedAccess — окремо', 'tsc перевіряє, бандлер транспілює', 'isolatedModules для esbuild/SWC']
    },
    {
      id: 'tsp-quiz-catch', group: 'config', type: 'quiz', level: 2,
      title: 'Тип помилки в catch',
      question: `
Що повідомить TypeScript у strict-режимі?

\`\`\`ts
try {
  JSON.parse(text);
} catch (e) {
  console.log(e.message);
}
\`\`\`
`,
      options: [
        'Помилка: `e` має тип `unknown`',
        'Нічого: `e` має тип `Error`',
        'Нічого: `e` має тип `any`',
        'Помилка: catch без типу заборонений'
      ],
      answer: 0,
      why: [
        'Так: useUnknownInCatchVariables — кинути можна що завгодно, не лише Error.',
        'Ні: TS не може гарантувати, що кинули саме Error.',
        'Ні: так було до TS 4.4 або без strict.',
        'Ні: анотація не обов\'язкова.'
      ],
      hint: 'Чи можна в JS написати `throw 42`?',
      explanation: 'Правильно: `if (e instanceof Error) console.log(e.message); else console.log(String(e));`. Типізувати `catch (e: Error)` не можна — дозволено лише `unknown` або `any`.'
    },
    {
      id: 'tsp-quiz-object-keys', group: 'config', type: 'quiz', level: 3,
      title: 'Чому Object.keys повертає string[]',
      question: `
\`\`\`ts
const user = { id: 1, name: 'A' };
for (const k of Object.keys(user)) {
  user[k];   // помилка TS7053
}
\`\`\`
Чому \`Object.keys\` типізовано як \`string[]\`, а не \`(keyof typeof user)[]\`?
`,
      options: [
        'Об\'єкт може мати більше ключів, ніж описано в типі',
        'Через помилку в lib.d.ts, яку не виправляють заради сумісності',
        'Бо ключі об\'єктів у JavaScript завжди зберігаються як числа',
        'Бо оператор keyof не працює з типами об\'єктних літералів'
      ],
      answer: 0,
      why: [
        'Так: значення типу `{ id; name }` може мати зайві поля — повертати лише відомі ключі було б неправдою.',
        'Ні: це свідоме рішення команди TS.',
        'Ні: ключі — рядки (і символи).',
        'Ні: keyof typeof user працює.'
      ],
      hint: 'Пригадайте: чи можна присвоїти об\'єкт із зайвим полем змінній вужчого типу?',
      explanation: 'Якщо ви впевнені в формі: `(Object.keys(user) as (keyof typeof user)[])` або `Object.entries` з типізованою обгорткою. Безпечніший шлях — ітерувати по відомому списку ключів (`as const`-масив).'
    },
    {
      id: 'tsp-migration', group: 'config', type: 'theory', level: 3,
      title: 'Міграція з JS, d.ts і екосистема',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Міграцію можна вести поступово: `allowJs` + `checkJs` і JSDoc-типи, потім перейменування файлів у `.ts`',
        'Для бібліотек без типів пакети `@types/*` (DefinitelyTyped) або власний `declare module \'lib\'` у `.d.ts`',
        'Сучасний Node.js уміє запускати `.ts`, просто прибираючи типи; синтаксис, що генерує код (enum, namespace, parameter properties), так не працює — для перевірки є прапорець `erasableSyntaxOnly`',
        'TypeScript 7 — компілятор, переписаний на Go, зі значно швидшою перевіркою',
        'Щоб перейти на TypeScript, увесь код треба переписати одним великим PR'
      ],
      correct: [0, 1, 2, 3],
      why: [
        'Так: так мігрують великі кодові бази.',
        'Так: d.ts описує типи без реалізації.',
        'Так: type stripping (Node 23.6+); erasableSyntaxOnly з TS 5.8.',
        'Так: нативний компілятор (проєкт Corsa); npm-пакет typescript@7.',
        'Ні: поступово, з посиленням strict-прапорців по частинах.'
      ],
      hint: 'Як мігрують проєкти на сотні тисяч рядків?',
      answer: `
**Стратегія міграції:**
1. \`tsconfig\` з \`allowJs\`, збірка проходить через TS;
2. \`checkJs\` + JSDoc (\`/** @param {string} id */\`) у критичних місцях;
3. перейменування модулів у \`.ts\` від «листків» графа залежностей (утиліти) до кореня;
4. поступове посилення: \`noImplicitAny\` → \`strictNullChecks\` → \`strict\`;
5. ESLint \`@typescript-eslint\` проти \`any\`.

**Файли оголошень (\`.d.ts\`):** типи без реалізації — для JS-бібліотек (\`@types/lodash\`), глобальних змінних (\`declare global\`), модулів-ресурсів (\`declare module '*.svg'\`).

**Екосистема 2026:** \`tsc\` часто лише перевіряє типи (\`noEmit\`), а транспілюють esbuild/SWC/Vite; Node.js запускає \`.ts\` напряму через type stripping; TypeScript 7 — нативний компілятор на Go (у JS-API бібліотек можуть бути відмінності, тому цей тренажер використовує TS 6 у браузері).
`,
      keyPoints: ['Поступова міграція: allowJs → checkJs → .ts → strict', '@types і власні d.ts', 'type stripping і erasableSyntaxOnly', 'tsc перевіряє, бандлер транспілює', 'TS 7 — нативний компілятор']
    }
  ]
});
