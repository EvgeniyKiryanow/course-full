FE.topic('ts-generics', {
  intro: `
**Generics** — параметри для типів: функція чи тип працює з будь-яким типом і **зберігає** зв'язок між входом і виходом. Над ними будується «програмування на типах»: утилітні, mapped, умовні та template literal типи.

| Інструмент | Приклад |
|---|---|
| Generic-функція | \`function first<T>(arr: T[]): T \\| undefined\` |
| Обмеження | \`<T extends { length: number }>\`, \`<K extends keyof T>\` |
| keyof / typeof / індексний доступ | \`keyof User\`, \`typeof config\`, \`User['email']\` |
| Утилітні типи | \`Partial\`, \`Required\`, \`Readonly\`, \`Pick\`, \`Omit\`, \`Record\`, \`ReturnType\`, \`Awaited\` |
| Mapped | \`{ [K in keyof T]: T[K] }\`, перейменування \`as\` |
| Умовні + infer | \`T extends Promise<infer U> ? U : T\` |
| Template literal | \`\\\`on\${Capitalize<E>}\\\`\` |

Задачі на типи перевіряються так: \`type T = Expect<Equal<Ваш<...>, Очікуваний>>\` — типи мають збігатися **точно**.
`,
  groups: [
    { id: 'generic-fns', title: 'Generic-функції та обмеження' },
    { id: 'keyof', title: 'keyof, typeof і індексний доступ' },
    { id: 'utility', title: 'Утилітні типи' },
    { id: 'mapped', title: 'Mapped types' },
    { id: 'conditional', title: 'Умовні типи та infer' },
    { id: 'template', title: 'Template literal types' }
  ],
  items: [
    // ---------------------------------------------------------------- generic functions
    {
      id: 'tsg-first', group: 'generic-fns', type: 'code', runtime: 'ts', level: 1, interview: true,
      title: 'Перша generic-функція',
      description: `
**Завдання.** Напишіть \`first(arr)\` — перший елемент масиву або \`undefined\`. Тип результату має **залежати** від типу масиву: для \`number[]\` — \`number | undefined\`, для \`User[]\` — \`User | undefined\`.

**Де трапляється:** будь-які утиліти над колекціями (\`find\`, \`last\`, \`uniq\`) — і їх у вигляді \`any\` у реальних проєктах повно.

**Як це працює:** \`function first<T>(arr: readonly T[]): T | undefined\` — \`T\` виводиться з аргументу автоматично. \`any\` замість \`T\` «губить» тип: результат стає \`any\`.
`,
      starter: `function first(arr: any[]): any {
  return arr[0];
}
`,
      solution: `function first<T>(arr: readonly T[]): T | undefined {
  return arr[0];
}
`,
      hints: ['Параметр типу оголошують у кутових дужках перед параметрами: `function first<T>(arr: readonly T[])`.', 'Тип результату: `T | undefined` — масив може бути порожнім.'],
      tests: ["expect(first([3, 4])).toBe(3)", "expect(first([])).toBeUndefined()"],
      typeTests: [
        { name: 'для чисел — number | undefined', code: "const n = first([1, 2]);\ntype T1 = Expect<Equal<typeof n, number | undefined>>;" },
        { name: 'для об\'єктів — їхній тип', code: "const u = first([{ name: 'Ann' }]);\ntype T2 = Expect<Equal<typeof u, { name: string } | undefined>>;" }
      ],
      explanation: 'Generic зберігає **зв\'язок** між типами входу й виходу. Зазвичай `T` виводиться з аргументів; явно — `first<string>([])`. Конвенції імен: `T` (тип), `K` (ключ), `V` (значення), `E` (елемент), або описові `TItem`. Немає зв\'язку між місцями використання — generic не потрібен.'
    },
    {
      id: 'tsg-quiz-constraint', group: 'generic-fns', type: 'quiz', level: 2,
      title: 'Обмеження generic: extends',
      question: `
Які рядки дадуть помилку?

\`\`\`ts
function len1<T>(x: T) { return x.length; }                       // A
function len2<T extends { length: number }>(x: T) { return x.length; }
len2('abc');                                                       // B
len2(42);                                                          // C
\`\`\`
`,
      options: ['A і C', 'Лише A', 'Лише C', 'A, B і C'],
      answer: 0,
      why: [
        'Так: про довільний T нічого не відомо (A); число не має length (C).',
        'Ні: виклик з числом порушує обмеження.',
        'Ні: у len1 доступ до length неможливий.',
        'Ні: рядок має length — B коректний.'
      ],
      hint: 'Що TS знає про `T` без обмеження?',
      explanation: '`T extends X` — «T може бути будь-яким типом, сумісним з X». Тоді всередині доступні властивості X, а виклик з непідхожим аргументом — помилка. Найчастіші обмеження: `extends object`, `extends keyof T`, `extends (...args: any[]) => any`, `extends PropertyKey`.'
    },
    {
      id: 'tsg-quiz-const-param', group: 'generic-fns', type: 'quiz', level: 3,
      title: 'Виведення літералів і const-параметри',
      question: `
Які типи отримають \`r1\`, \`r2\` і \`r3\`?

\`\`\`ts
function id<T>(x: T): T { return x; }
function idc<const T>(x: T): T { return x; }
const r1 = id('a');
const r2 = id({ a: [1, 2] });
const r3 = idc({ a: [1, 2] });
\`\`\`
`,
      options: [
        '`"a"`, `{ a: number[] }`, `{ readonly a: readonly [1, 2] }`',
        '`string`, `{ a: number[] }`, `{ a: number[] }`',
        '`"a"`, `{ readonly a: readonly [1, 2] }`, те саме',
        '`string`, `object`, `object`'
      ],
      answer: 0,
      why: [
        'Так: примітивний літерал зберігається, об\'єкти розширюються, а `const T` виводить як при `as const`.',
        'Ні: для const r1 літерал "a" зберігається.',
        'Ні: без const-параметра властивості об\'єкта розширюються.',
        'Ні: TS виводить точну форму, а не object.'
      ],
      hint: 'Чим `<const T>` (TS 5.0) відрізняється від звичайного `<T>`?',
      explanation: '**const type parameters** (TS 5.0) виводять найвужчий тип, ніби аргумент записано з `as const`: корисно для конфігурацій, маршрутів, ключів подій. Без них TS «розширює» властивості об\'єктів і масиви до загальних типів.'
    },
    {
      id: 'tsg-group-by', group: 'generic-fns', type: 'code', runtime: 'ts', level: 3,
      title: 'Типізований groupBy',
      description: `
**Завдання.** Напишіть generic \`groupBy(items, getKey)\` → об'єкт «ключ → масив елементів».
- \`getKey: (item: T) => K\`, де \`K\` — допустимий ключ об'єкта (\`PropertyKey\`: string | number | symbol);
- результат: \`Partial<Record<K, T[]>>\` — не для кожного можливого ключа буде група.

**Де трапляється:** групування замовлень за статусом, задач за виконавцем, повідомлень за датою — з типом, що зберігає і тип елемента, і тип ключа.

**Приклад**
\`\`\`ts
const byStatus = groupBy(orders, (o) => o.status); // o: Order — виведено
byStatus.paid?.length;                              // paid — підказка автодоповнення
\`\`\`

**Як це працює:** два параметри типу, кожен виводиться з аргументів: \`T\` — з масиву, \`K\` — з результату колбека.
`,
      starter: `function groupBy(items: any[], getKey: (item: any) => any): any {
  const out: any = {};
  for (const item of items) {
    const key = getKey(item);
    (out[key] ??= []).push(item);
  }
  return out;
}
`,
      solution: `function groupBy<T, K extends PropertyKey>(items: readonly T[], getKey: (item: T) => K): Partial<Record<K, T[]>> {
  const out: Partial<Record<K, T[]>> = {};
  for (const item of items) {
    const key = getKey(item);
    (out[key] ??= []).push(item);
  }
  return out;
}
`,
      hints: ['Сигнатура: `function groupBy<T, K extends PropertyKey>(items: readonly T[], getKey: (item: T) => K)`.', 'Тип результату і змінної `out`: `Partial<Record<K, T[]>>`.'],
      tests: [
        "expect(groupBy([1, 2, 3, 4], (n) => (n % 2 ? 'odd' : 'even'))).toEqual({ odd: [1, 3], even: [2, 4] })",
        "expect(groupBy([], (x) => x)).toEqual({})"
      ],
      typeTests: [
        { name: 'тип елемента виводиться в колбеку', code: "groupBy([{ status: 'paid' }], (o) => { type O = Expect<Equal<typeof o, { status: string }>>; return o.status; });" },
        { name: 'ключі — з результату колбека', code: "const g = groupBy([1, 2], (n): 'odd' | 'even' => (n % 2 ? 'odd' : 'even'));\ntype G = Expect<Equal<typeof g, Partial<Record<'odd' | 'even', number[]>>>>;" }
      ],
      explanation: 'У сучасному JS є вбудований `Object.groupBy` (ES2024) — його тип у TS: `Partial<Record<K, T[]>>`, як у нас. `??=` створює масив лише для нового ключа. Чому `Partial`: для ключів `\'odd\' | \'even\'` група може не з\'явитися, і без `Partial` звернення `g.odd.length` не попередило б про `undefined`.'
    },
    // ---------------------------------------------------------------- keyof/typeof
    {
      id: 'tsg-quiz-keyof', group: 'keyof', type: 'quiz', level: 1,
      title: 'Що дає keyof',
      question: `
Чому дорівнює \`K\`?

\`\`\`ts
type User = { id: number; name: string };
type K = keyof User;
\`\`\`
`,
      options: ['`"id" | "name"`', '`number | string`', '`["id", "name"]`', '`string`'],
      answer: 0,
      why: [
        'Так: об\'єднання літералів імен властивостей.',
        'Ні: це типи значень — їх дає `User[keyof User]`.',
        'Ні: keyof дає об\'єднання, а не кортеж.',
        'Ні: для типу з відомими ключами — точні літерали.'
      ],
      hint: 'keyof — про **назви** властивостей.',
      explanation: '`keyof T` — об\'єднання ключів, `T[K]` — тип значення за ключем, `T[keyof T]` — об\'єднання всіх типів значень. Для типу з індексною сигнатурою `{ [k: string]: X }` keyof дає `string | number` (числові ключі в JS — теж рядки).'
    },
    {
      id: 'tsg-pluck', group: 'keyof', type: 'code', runtime: 'ts', level: 2,
      title: 'pluck: K extends keyof T',
      description: `
**Завдання.** Напишіть \`pluck(items, key)\` — масив значень властивості \`key\` з кожного елемента.
- \`key\` може бути лише **існуючим** ключем елемента;
- тип результату — масив типу цієї властивості: \`pluck(users, 'name')\` → \`string[]\`.

**Де трапляється:** вибірка колонок для таблиць, побудова списків id, опцій select.

**Як це працює:** \`K extends keyof T\` обмежує ключ; \`T[K]\` — тип значення за цим ключем (indexed access type).
`,
      starter: `function pluck(items: any[], key: string): any[] {
  return items.map((item) => item[key]);
}
`,
      solution: `function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}
`,
      hints: ['Два параметри типу: `<T, K extends keyof T>`.', 'Результат: `T[K][]`.'],
      tests: ["expect(pluck([{ id: 1, name: 'A' }, { id: 2, name: 'B' }], 'id')).toEqual([1, 2])", "expect(pluck([{ id: 1 }], 'id')).toEqual([1])"],
      typeTests: [
        { name: 'тип результату — тип властивості', code: "const users = [{ id: 1, name: 'A' }];\nconst names = pluck(users, 'name');\ntype N = Expect<Equal<typeof names, string[]>>;" },
        { name: 'неіснуючий ключ — помилка', code: "const users2 = [{ id: 1, name: 'A' }];\n// @ts-expect-error\npluck(users2, 'email');" }
      ],
      explanation: 'Зв\'язка `K extends keyof T` + `T[K]` — основа типобезпечних утиліт: `get(obj, key)`, `sortBy(items, key)`, обробники форм `setField(name, value: Form[typeof name])`. Автодоповнення ключів у редакторі — бонус.'
    },
    {
      id: 'tsg-quiz-typeof', group: 'keyof', type: 'quiz', level: 2,
      title: 'typeof у позиції типу',
      question: `
Чому дорівнює \`Theme\`?

\`\`\`ts
const theme = { primary: '#06f', radius: 8 };
type Theme = typeof theme;
\`\`\`
`,
      options: [
        '`{ primary: string; radius: number }`',
        '`"object"`',
        '`{ primary: "#06f"; radius: 8 }`',
        'Помилка: typeof працює лише в рантаймі'
      ],
      answer: 0,
      why: [
        'Так: typeof у позиції типу бере тип змінної (з розширеними властивостями).',
        'Ні: це результат JS-оператора typeof у виразі.',
        'Ні: літерали властивостей розширюються; для них потрібен `as const`.',
        'Ні: у TS є і «типовий» typeof.'
      ],
      hint: 'У виразі `typeof x` — рядок, а в позиції типу?',
      explanation: '`typeof` у типі — спосіб отримати тип зі значення: конфігів, об\'єктів-мап, функцій (`ReturnType<typeof fn>`). Разом з `as const` і `keyof` дає одне джерело правди: дані → типи, без дублювання.'
    },
    // ---------------------------------------------------------------- utility types
    {
      id: 'tsg-utility-theory', group: 'utility', type: 'theory', level: 2, interview: true,
      title: 'Вбудовані утилітні типи',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        '`Partial<T>` робить усі властивості необов\'язковими, `Required<T>` — обов\'язковими',
        '`Pick<T, K>` залишає вказані ключі, `Omit<T, K>` — прибирає їх',
        '`Readonly<T>` робить об\'єкт незмінним глибоко, включно з вкладеними об\'єктами',
        '`Record<K, V>` — об\'єкт з ключами K і значеннями V',
        '`ReturnType<typeof fn>` і `Parameters<typeof fn>` витягують типи результату й параметрів функції'
      ],
      correct: [0, 1, 3, 4],
      why: [
        'Так: найчастіше — для оновлень (patch) і чернеток форм.',
        'Так: для DTO і пропсів.',
        'Ні: Readonly поверхневий; глибокий — власний DeepReadonly.',
        'Так: словники, мапи ролей і перекладів.',
        'Так: зручно, коли тип визначає функція.'
      ],
      hint: 'Котрий з них поверхневий, хоча назва звучить глобально?',
      answer: `
| Тип | Що робить | Приклад |
|---|---|---|
| \`Partial<T>\` / \`Required<T>\` | усі поля необов'язкові / обов'язкові | \`update(id, patch: Partial<User>)\` |
| \`Readonly<T>\` | поля лише для читання (**поверхнево**) | пропси, конфіг |
| \`Pick<T, K>\` / \`Omit<T, K>\` | вибрати / прибрати ключі | \`Omit<User, 'password'>\` |
| \`Record<K, V>\` | об'єкт-словник | \`Record<Role, string[]>\` |
| \`Exclude<U, X>\` / \`Extract<U, X>\` | прибрати / залишити члени об'єднання | \`Exclude<Status, 'deleted'>\` |
| \`NonNullable<T>\` | без null і undefined | |
| \`ReturnType\`, \`Parameters\`, \`Awaited\` | типи з функцій і промісів | \`Awaited<ReturnType<typeof fetchUser>>\` |

Усі вони — звичайні mapped- і умовні типи зі стандартної бібліотеки (\`lib.es5.d.ts\`), і їх можна написати самостійно.
`,
      keyPoints: ['Partial/Required, Readonly (поверхневий)', 'Pick/Omit, Record', 'Exclude/Extract для об\'єднань', 'ReturnType/Parameters/Awaited — типи з функцій']
    },
    {
      id: 'tsg-quiz-omit-gotcha', group: 'utility', type: 'quiz', level: 3,
      title: 'Пастка вбудованого Omit',
      question: `
Що повідомить TypeScript?

\`\`\`ts
type User = { id: number; name: string; email: string };
type A = Omit<User, 'id' | 'nope'>;
type B = Pick<User, 'id' | 'nope'>;
\`\`\`
`,
      options: [
        'Помилка лише в `Pick`: ключа `nope` немає в User',
        'Помилки в обох рядках',
        'Помилка лише в `Omit`',
        'Помилок немає'
      ],
      answer: 0,
      why: [
        'Так: Pick обмежує K до keyof T, а Omit приймає будь-які ключі (K extends keyof any).',
        'Ні: Omit мовчить — і друкарську помилку в ключі легко пропустити.',
        'Ні: навпаки.',
        'Ні: Pick перевіряє ключі.'
      ],
      hint: 'Подивіться, як оголошено обмеження K у Pick і в Omit.',
      explanation: 'У стандартній бібліотеці: `type Pick<T, K extends keyof T>` і `type Omit<T, K extends keyof any>`. Тому `Omit<User, \'emial\'>` не попередить про помилку. Багато команд мають суворий варіант: `type StrictOmit<T, K extends keyof T> = Omit<T, K>`.'
    },
    {
      id: 'tsg-my-pick', group: 'utility', type: 'code', runtime: 'ts', level: 2, interview: true,
      title: 'Напишіть свій Pick',
      description: `
**Завдання.** Реалізуйте \`MyPick<T, K>\` без вбудованого \`Pick\`: тип з лише вказаними ключами \`K\` з \`T\`. \`K\` може бути лише ключем \`T\`.

**Де трапляється:** класика type-challenges на співбесідах. На роботі \`Pick\` описує форму редагування з кількох полів сутності: \`Pick<User, 'name' | 'email'>\`.

**Приклад**
\`\`\`ts
interface Todo { title: string; description: string; done: boolean }
type Preview = MyPick<Todo, 'title' | 'done'>; // { title: string; done: boolean }
\`\`\`

**Як це працює:** mapped type \`{ [P in K]: T[P] }\` проходить по кожному ключу з об'єднання \`K\`.
`,
      starter: `type MyPick<T, K> = any; // TODO
`,
      solution: `type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};
`,
      hints: ['Обмеження: `K extends keyof T`.', 'Тіло: `{ [P in K]: T[P] }`.'],
      tests: [],
      typeTests: [
        { name: 'вибирає ключі', code: "interface Todo { title: string; description: string; done: boolean }\ntype T1 = Expect<Equal<MyPick<Todo, 'title' | 'done'>, { title: string; done: boolean }>>;" },
        { name: 'один ключ', code: "type T2 = Expect<Equal<MyPick<{ a: 1; b: 2 }, 'a'>, { a: 1 }>>;" },
        { name: 'неіснуючий ключ — помилка', code: "// @ts-expect-error\ntype T3 = MyPick<{ a: 1 }, 'zzz'>;" }
      ],
      explanation: 'Це класика type-challenges і часте питання співбесіди на TS. Mapped types зберігають модифікатори (`?`, `readonly`) ключів, якщо пробігати `keyof T` (гомоморфні mapped types) — тому `Partial<T> = { [P in keyof T]?: T[P] }` працює правильно.'
    },
    {
      id: 'tsg-partial-by', group: 'utility', type: 'code', runtime: 'ts', level: 3,
      title: 'PartialBy: необов\'язковими лише деякі ключі',
      description: `
**Завдання.** Реалізуйте \`PartialBy<T, K>\`: ключі \`K\` стають необов'язковими, решта — без змін. Результат має бути **плоским** об'єктним типом.

**Де трапляється:** «створення» сутності, де \`id\` і \`createdAt\` генерує сервер: \`type NewUser = PartialBy<User, 'id' | 'createdAt'>\`.

**Підказка до пастки:** \`Omit<T, K> & Partial<Pick<T, K>>\` дає правильну **поведінку**, але це перетин, а не плоский тип — точне порівняння \`Equal\` його не прийме. Розплющте результат mapped-типом:
\`\`\`ts
type Simplify<T> = { [P in keyof T]: T[P] } & {};
\`\`\`

**Як це працює:** \`Omit<T, K> & Partial<Pick<T, K>>\` — перетин двох типів: незмінна частина плюс необов'язкові ключі. Щоб у підказках редактора був «плаский» об'єкт, перетин проганяють через mapped-тип \`{ [P in keyof X]: X[P] }\` (утиліта \`Prettify\`).
`,
      starter: `type PartialBy<T, K extends keyof T> = any; // TODO
`,
      solution: `type Simplify<T> = { [P in keyof T]: T[P] } & {};
type PartialBy<T, K extends keyof T> = Simplify<Omit<T, K> & Partial<Pick<T, K>>>;
`,
      hints: ['Розділіть на дві частини: `Omit<T, K>` (без змін) і `Partial<Pick<T, K>>` (необов\'язкові).', 'Об\'єднайте через `&` і пропустіть через `Simplify`.'],
      tests: [],
      typeTests: [
        { name: 'один ключ необов\'язковий', code: "type U = { id: number; name: string; age: number };\ntype T1 = Expect<Equal<PartialBy<U, 'age'>, { id: number; name: string; age?: number }>>;" },
        { name: 'кілька ключів', code: "type U2 = { id: number; name: string; age: number };\ntype T2 = Expect<Equal<PartialBy<U2, 'id' | 'age'>, { name: string; id?: number; age?: number }>>;" },
        { name: 'ключ має існувати', code: "// @ts-expect-error\ntype T3 = PartialBy<{ a: 1 }, 'b'>;" }
      ],
      explanation: '`Simplify` (у бібліотеках — `Prettify`) — популярний прийом: mapped type «перезбирає» перетин в один об\'єкт, і підказки в редакторі стають читабельними. Перетин і плоский тип взаємно сумісні, але не **ідентичні** — тому точні тести типів (і `Equal`) їх розрізняють.'
    },
    // ---------------------------------------------------------------- mapped
    {
      id: 'tsg-my-readonly', group: 'mapped', type: 'code', runtime: 'ts', level: 2,
      title: 'MyReadonly і модифікатори',
      description: `
**Завдання.** Реалізуйте:
- \`MyReadonly<T>\` — усі властивості \`readonly\`;
- \`Mutable<T>\` — навпаки, прибирає \`readonly\` з усіх властивостей.

**Де трапляється:** незмінні конфіги й стан сторів (\`Readonly<State>\`), дані з API, які не можна випадково змінити в компоненті.

**Як це працює:** у mapped-типі можна додати модифікатор (\`readonly\`, \`?\`) або прибрати його мінусом: \`-readonly\`, \`-?\`.
`,
      starter: `type MyReadonly<T> = any; // TODO
type Mutable<T> = any;    // TODO
`,
      solution: `type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
`,
      hints: ['`{ readonly [K in keyof T]: T[K] }`', 'Прибрати модифікатор: `-readonly`.'],
      tests: [],
      typeTests: [
        { name: 'MyReadonly', code: "type T1 = Expect<Equal<MyReadonly<{ a: number; b?: string }>, { readonly a: number; readonly b?: string }>>;" },
        { name: 'Mutable', code: "type T2 = Expect<Equal<Mutable<{ readonly a: number }>, { a: number }>>;" },
        { name: 'присвоєння в readonly — помилка', code: "declare const r: MyReadonly<{ x: number }>;\n// @ts-expect-error\nr.x = 1;" }
      ],
      explanation: 'Модифікатори mapped types: `+readonly`/`-readonly`, `+?`/`-?`. Так влаштовані `Readonly`, `Partial` (`?`), `Required` (`-?`). Нагадування: усе це — лише типи; у рантаймі об\'єкт можна змінити (для цього — `Object.freeze`).'
    },
    {
      id: 'tsg-getters', group: 'mapped', type: 'code', runtime: 'ts', level: 3,
      title: 'Перейменування ключів: Getters<T>',
      description: `
**Завдання.** Реалізуйте \`Getters<T>\`: для кожної властивості \`name\` — метод \`getName(): тип\`.

**Де трапляється:** генеровані API-клієнти й ORM (Prisma, tRPC) будують методи з ключів моделі так само — перейменуванням ключів у mapped-типах.

**Приклад**
\`\`\`ts
type G = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }
\`\`\`

**Як це працює:** key remapping через \`as\` у mapped-типі: \`[K in keyof T as НовийКлюч]\`. Новий ключ будується template literal типом і \`Capitalize\`. Ключі бувають і \`symbol\`, тому беремо лише рядкові: \`string & K\`.
`,
      starter: `type Getters<T> = any; // TODO
`,
      solution: `type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
`,
      hints: ['`[K in keyof T as `get${...}`]: () => T[K]`', '`Capitalize<string & K>` — перша літера велика, лише для рядкових ключів.'],
      tests: [],
      typeTests: [
        { name: 'getters для всіх полів', code: "type T1 = Expect<Equal<Getters<{ name: string; age: number }>, { getName: () => string; getAge: () => number }>>;" },
        { name: 'порожній об\'єкт', code: "type T2 = Expect<Equal<Getters<{}>, {}>>;" },
        { name: 'один ключ', code: "type T3 = Expect<Equal<Getters<{ id: number }>, { getId: () => number }>>;" }
      ],
      explanation: 'Key remapping (TS 4.1) — основа типізації бібліотек: генерація назв обробників (`onClick`), екшенів (`setX`), фільтрація ключів (`as T[K] extends Function ? never : K` — прибрати методи). Повернення `never` у `as` видаляє ключ.'
    },
    {
      id: 'tsg-deep-readonly', group: 'mapped', type: 'code', runtime: 'ts', level: 4,
      title: 'DeepReadonly: рекурсивний тип',
      description: `
**Завдання.** Реалізуйте \`DeepReadonly<T>\`: усе дерево властивостей \`readonly\`, масиви — \`readonly\`-масиви, функції — без змін.

**Де трапляється:** незмінний стан (Redux), конфігурації, дані з кешу, які не можна мутувати.

**Як це працює:** умовний тип вирішує, що робити з кожним значенням: функція → як є; об'єкт або масив → mapped з \`readonly\` і рекурсією; примітив → як є. Mapped-тип над масивом дає масив, а \`readonly\` робить його \`readonly\`-масивом.
`,
      starter: `type DeepReadonly<T> = any; // TODO
`,
      solution: `type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;
`,
      hints: ['Спершу перевірка на функцію: `T extends (...args: any[]) => any ? T : ...` — інакше методи стануть об\'єктами.', 'Далі `T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T`.'],
      tests: [],
      typeTests: [
        { name: 'вкладені об\'єкти й масиви', code: "type X = { a: { b: number[] }; f: () => void };\ntype T1 = Expect<Equal<DeepReadonly<X>, { readonly a: { readonly b: readonly number[] }; readonly f: () => void }>>;" },
        { name: 'примітиви без змін', code: "type T2 = Expect<Equal<DeepReadonly<string>, string>>;" },
        { name: 'вкладене присвоєння — помилка', code: "declare const s: DeepReadonly<{ user: { name: string } }>;\n// @ts-expect-error\ns.user.name = 'x';" }
      ],
      explanation: 'Рекурсивні типи + умовні типи = потужний інструмент, але з ціною: повільна перевірка і нечитабельні підказки на великих типах. Нюанси для продакшену: Map/Set (потрібні `ReadonlyMap`/`ReadonlySet`), Date, класи. У бібліотеках (type-fest, ts-essentials) є готові варіанти.'
    },
    // ---------------------------------------------------------------- conditional
    {
      id: 'tsg-quiz-distributive', group: 'conditional', type: 'quiz', level: 3,
      title: 'Дистрибутивні умовні типи',
      question: `
Чому дорівнюють \`A\` і \`B\`?

\`\`\`ts
type ToArray<T> = T extends any ? T[] : never;
type ToArray2<T> = [T] extends [any] ? T[] : never;
type A = ToArray<string | number>;
type B = ToArray2<string | number>;
\`\`\`
`,
      options: [
        '`A`: `string[] | number[]`, `B`: `(string | number)[]`',
        'Обидва `(string | number)[]`',
        'Обидва `string[] | number[]`',
        '`A`: `(string | number)[]`, `B`: `string[] | number[]`'
      ],
      answer: 0,
      why: [
        'Так: «голий» T в умові розподіляється по членах об\'єднання; обгорнутий у кортеж — ні.',
        'Ні: ToArray розподіляється.',
        'Ні: [T] вимикає дистрибутивність.',
        'Ні: навпаки.'
      ],
      hint: 'Умовний тип з «голим» параметром застосовується до кожного члена об\'єднання окремо.',
      explanation: '**Дистрибутивність:** `T extends X ? A : B` для `T = U1 | U2` обчислюється як `(U1 extends X ? A : B) | (U2 extends X ? A : B)`. Так працює `Exclude<T, U> = T extends U ? never : T`. Вимкнути — обгорнути: `[T] extends [X]`. Пастка: `never` як «порожнє об\'єднання» дає `never` у дистрибутивному типі.'
    },
    {
      id: 'tsg-quiz-infer', group: 'conditional', type: 'quiz', level: 3,
      title: 'infer: витягнути тип зсередини',
      question: `
Чому дорівнюють \`X\` і \`Y\`?

\`\`\`ts
type ElementOf<T> = T extends (infer U)[] ? U : never;
type X = ElementOf<string[]>;
type Y = ElementOf<number>;
\`\`\`
`,
      options: ['`string` і `never`', '`string[]` і `number`', '`unknown` і `never`', '`string` і `number`'],
      answer: 0,
      why: [
        'Так: infer U «ловить» тип елемента; number не масив — гілка never.',
        'Ні: повертається U, а не T.',
        'Ні: TS виводить конкретний тип з шаблону.',
        'Ні: для не-масиву — гілка false, тобто never.'
      ],
      hint: '`infer U` — «змінна», яку TS заповнює, якщо T підходить під шаблон.',
      explanation: '`infer` працює лише в `extends` умовного типу: `ReturnType<T> = T extends (...args: any) => infer R ? R : any`, `Awaited`, `Parameters`. Шаблони бувають будь-якими: `T extends \`${infer Head}/${infer Rest}\`` для розбору рядків.'
    },
    {
      id: 'tsg-my-return-type', group: 'conditional', type: 'code', runtime: 'ts', level: 3, interview: true,
      title: 'MyReturnType і MyAwaited',
      description: `
**Завдання.** Реалізуйте без вбудованих утиліт:
- \`MyReturnType<F>\` — тип результату функції;
- \`MyAwaited<T>\` — тип значення промісу, **рекурсивно** (\`Promise<Promise<string>>\` → \`string\`); не проміс — без змін.

**Де трапляється:** \`type User = MyAwaited<MyReturnType<typeof fetchUser>>\` — тип даних з функції API, без дублювання.

**Як це працює:** \`F extends (...args: any[]) => infer R ? R : never\`. Для промісів шаблон — \`PromiseLike<infer U>\` (будь-який thenable), і рекурсивний виклик для вкладених.
`,
      starter: `type MyReturnType<F> = any; // TODO
type MyAwaited<T> = any;    // TODO
`,
      solution: `type MyReturnType<F extends (...args: any[]) => any> = F extends (...args: any[]) => infer R ? R : never;
type MyAwaited<T> = T extends PromiseLike<infer U> ? MyAwaited<U> : T;
`,
      hints: ['`F extends (...args: any[]) => infer R ? R : never`', '`T extends PromiseLike<infer U> ? MyAwaited<U> : T` — рекурсія розгортає вкладені проміси.'],
      tests: [],
      typeTests: [
        { name: 'MyReturnType', code: "type T1 = Expect<Equal<MyReturnType<() => string>, string>>;\ntype T2 = Expect<Equal<MyReturnType<(a: number) => Promise<boolean>>, Promise<boolean>>>;" },
        { name: 'MyAwaited рекурсивний', code: "type T3 = Expect<Equal<MyAwaited<Promise<Promise<string>>>, string>>;\ntype T4 = Expect<Equal<MyAwaited<number>, number>>;" },
        { name: 'разом: тип даних з функції API', code: "declare function fetchUser(): Promise<{ id: number }>;\ntype T5 = Expect<Equal<MyAwaited<MyReturnType<typeof fetchUser>>, { id: number }>>;" }
      ],
      explanation: 'Вбудований `Awaited` складніший: обробляє thenable-об\'єкти, `null | undefined` і не-об\'єкти. Комбінація `Awaited<ReturnType<typeof fn>>` — щоденний прийом, щоб не описувати тип відповіді API двічі.'
    },
    // ---------------------------------------------------------------- template literal
    {
      id: 'tsg-quiz-template', group: 'template', type: 'quiz', level: 2,
      title: 'Template literal types',
      question: `
Чому дорівнює \`E\`?

\`\`\`ts
type EventName<T extends string> = \`on\${Capitalize<T>}\`;
type E = EventName<'click' | 'focus'>;
\`\`\`
`,
      options: ['`"onClick" | "onFocus"`', '`"onclick" | "onfocus"`', '`string`', '`"onClick | focus"`'],
      answer: 0,
      why: [
        'Так: шаблон застосовується до кожного члена об\'єднання, Capitalize робить першу літеру великою.',
        'Ні: Capitalize змінює першу літеру.',
        'Ні: результат — точні літерали.',
        'Ні: об\'єднання розподіляється по членах.'
      ],
      hint: 'Що станеться, якщо в шаблон підставити об\'єднання?',
      explanation: 'Template literal types (TS 4.1) будують рядкові типи: назви подій, CSS-змінні (`--${string}`), шляхи маршрутів. Вбудовані перетворювачі: `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`. Об\'єднання в шаблоні дають декартовий добуток: `${\'a\' | \'b\'}-${1 | 2}` → 4 варіанти.'
    },
    {
      id: 'tsg-route-params', group: 'template', type: 'code', runtime: 'ts', level: 4,
      title: 'Параметри маршруту з рядка: RouteParams',
      description: `
**Завдання.** Реалізуйте \`RouteParams<Path>\`: з рядка маршруту \`'/users/:id/posts/:postId'\` отримати тип \`{ id: string; postId: string }\`. Маршрут без параметрів дає \`{}\`.

**Де трапляється:** типізовані роутери (React Router, TanStack Router): параметри маршруту відомі з самого шляху, друкарська помилка в назві параметра ловиться компілятором.

**Як це працює:** template literal + \`infer\` розбирають рядок: \`Path extends \\\`\${string}:\${infer Param}/\${infer Rest}\\\`\` — параметр посередині. Тоді рекурсія для решти рядка; останній параметр — без \`/\` після нього. Об'єднання ключів збирається в об'єкт через \`Record\` і \`Simplify\`.
`,
      starter: `type Simplify<T> = { [K in keyof T]: T[K] } & {};

type ParamNames<Path extends string> = never; // TODO: '/a/:x/b/:y' → 'x' | 'y'

type RouteParams<Path extends string> = Simplify<Record<ParamNames<Path>, string>>;
`,
      solution: `type Simplify<T> = { [K in keyof T]: T[K] } & {};

type ParamNames<Path extends string> =
  Path extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? Param | ParamNames<Rest>
    : Path extends \`\${string}:\${infer Param}\`
      ? Param
      : never;

type RouteParams<Path extends string> = Simplify<Record<ParamNames<Path>, string>>;
`,
      hints: ['Два випадки: параметр, після якого є `/` і решта шляху (рекурсія), і останній параметр.', '`Path extends `${string}:${infer Param}/${infer Rest}` ? Param | ParamNames<Rest> : ...`'],
      tests: [],
      typeTests: [
        { name: 'два параметри', code: "type T1 = Expect<Equal<RouteParams<'/users/:id/posts/:postId'>, { id: string; postId: string }>>;" },
        { name: 'один параметр у кінці', code: "type T2 = Expect<Equal<RouteParams<'/users/:id'>, { id: string }>>;" },
        { name: 'без параметрів', code: "type T3 = Expect<Equal<RouteParams<'/about'>, {}>>;" }
      ],
      explanation: 'Розбір рядків на рівні типів — серйозний senior-рівень TS. Межі: глибина рекурсії (близько 1000 рівнів з tail-recursion для умовних типів), швидкодія редактора. У реальному коді такі типи пишуть рідко, але читати і налагоджувати їх у бібліотеках доводиться часто.'
    }
  ]
});
