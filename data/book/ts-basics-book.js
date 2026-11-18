FE.chapter('ts-basics-book', { body: `
TypeScript — надбудова над JavaScript: типи перевіряються **під час компіляції** і повністю зникають у результаті. Ціль — ловити помилки до запуску і дати редактору знання про код (автодоповнення, перейменування, навігація).

## Анотації та виведення типів

\`\`\`ts
let count: number = 0;                      // анотація
let title = 'TS';                           // виведення: string
const mode = 'dark';                        // літеральний тип 'dark'
function add(a: number, b: number): number { return a + b; }
\`\`\`
- **виведення** працює з ініціалізаторів і результатів функцій — анотуйте параметри й публічні API, решту TS виведе;
- \`let\` розширює літерал до загального типу (widening), \`const\` — ні;
- у \`strict\` параметр без типу — помилка *implicitly has an 'any' type* (\`noImplicitAny\`);
- **type erasure:** \`interface\`, анотації, \`as\` зникають після компіляції. TS не перевіряє дані в рантаймі.

Основні типи: \`string\`, \`number\`, \`boolean\`, \`bigint\`, \`symbol\`, \`null\`, \`undefined\`, \`object\`, масиви \`T[]\`, \`unknown\`, \`any\`, \`never\`, \`void\`.

## Об'єкти, масиви і кортежі

\`\`\`ts
interface User {
  readonly id: number;      // лише читання (на рівні типів)
  name: string;
  email?: string;           // необов'язкове: string | undefined
}
const tags: string[] = ['ts'];
const pair: [string, number] = ['age', 30];       // кортеж
function sum(xs: readonly number[]) { /* не змінює масив */ }
\`\`\`
- **структурна типізація:** сумісність за формою, а не за назвою; зайві поля дозволені;
- **excess property check:** для свіжого літерала зайве поле — помилка (ймовірно, друкарська);
- \`readonly\` — поверхневий; функції, що не змінюють масив, приймайте \`readonly T[]\` (тоді підходять і \`as const\`-дані);
- індексна сигнатура: \`{ [key: string]: number }\` або \`Record<string, number>\`.

## Об'єднання, літерали і звуження

\`\`\`ts
type Sort = 'asc' | 'desc';
function fmt(x: string | number | null) {
  if (x === null) return '-';
  if (typeof x === 'string') return x.trim();   // x: string
  return x.toFixed(2);                          // x: number
}
\`\`\`
Звуження: \`typeof\`, \`===\`/\`!==\`, truthiness, \`in\` (\`'email' in u\`), \`instanceof\`, \`Array.isArray\`, ранні \`return\`/\`throw\`, type guards. TS відстежує потік керування (control flow analysis). \`strictNullChecks\`: \`null\`/\`undefined\` треба обробити — \`?.\`, \`??\`, перевірка.

## Функції: параметри, void, перевантаження

\`\`\`ts
function greet(name: string, greeting = 'Привіт', ...rest: string[]): string { /* ... */ }
type Handler = (event: MouseEvent) => void;
function sumBy(items: Product[], get: (p: Product) => number): number { /* ... */ }
\`\`\`
- необов'язковий параметр \`x?: T\`, за замовчуванням \`x = value\`, rest \`...xs: T[]\`;
- **contextual typing:** у колбеку тип параметра виводиться з типу функції-параметра;
- \`void\` у **типі** функції — «результат ігнорується» (\`forEach(x => arr.push(x))\` компілюється); у **оголошенні** \`(): void\` повертати значення не можна;
- **перевантаження:** кілька сигнатур + одна реалізація; ззовні видно лише сигнатури. Часто достатньо об'єднання або generic;
- \`never\` — функція, що ніколи не повертає (кидає або нескінченна).

## Interface vs type, enum vs as const

| | \`interface\` | \`type\` |
|---|---|---|
| Об'єкти | так | так |
| Об'єднання, кортежі, умовні типи | ні | так |
| Розширення | \`extends\` | \`&\` |
| Declaration merging | так | ні |

**enum** генерує JS-об'єкт; числові enum з TS 5.0 суворі. Сучасна альтернатива без рантайм-коду:
\`\`\`ts
const STATUSES = ['draft', 'review', 'published'] as const;
type Status = (typeof STATUSES)[number];        // 'draft' | 'review' | 'published'
const ROLES = { admin: 'Адмін', user: 'Користувач' } as const;
type Role = keyof typeof ROLES;                 // 'admin' | 'user'
\`\`\`
Перевага: одне джерело правди для рантайму і типів, сумісність з type stripping у Node.js і \`erasableSyntaxOnly\`.

## any, unknown, never, as і satisfies

- **any** — вимикає перевірки й «заражає» код; лише як тимчасовий крок міграції;
- **unknown** — «будь-що, але перевір»: дані з мережі, \`JSON.parse\`, \`catch (e)\`;
- **never** — порожній тип: неможливі гілки, перевірка вичерпності (\`const _x: never = value\`);
- **as** — твердження «я знаю краще»: не перевіряє і не перетворює дані. \`!\` — твердження «не null»;
- **satisfies** (TS 4.9) — перевірити відповідність типу, **зберігши** точний виведений тип:
\`\`\`ts
const routes = { home: '/', user: '/users/:id' } satisfies Record<string, string>;
routes.user;   // '/users/:id' — автодоповнення і перевірка ключів збережені
\`\`\`

## Типові питання

- **Чим TS відрізняється від JS у рантаймі?** Нічим — типи зникають.
- **any vs unknown vs never?**
- **interface vs type?**
- **Що таке звуження і які є способи?**
- **Навіщо satisfies, якщо є анотація?**
- **enum чи as const?**
`});
