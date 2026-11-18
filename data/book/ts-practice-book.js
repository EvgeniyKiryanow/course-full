FE.chapter('ts-practice-book', { body: `
Як TypeScript використовують у реальному фронтенді: моделювання стану, перевірка даних на межах системи, класи, DOM і налаштування проєкту.

## Розрізнювані об'єднання і стан

\`\`\`ts
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function view(s: RequestState<User[]>) {
  switch (s.status) {
    case 'success': return s.data.length;        // data доступне лише тут
    case 'error': return s.error;
    case 'idle':
    case 'loading': return null;
    default: return assertNever(s);              // новий варіант без обробки → помилка компіляції
  }
}
function assertNever(x: never): never { throw new Error('Unexpected: ' + JSON.stringify(x)); }
\`\`\`
Об'єднання з тегом робить **неможливі стани неможливими** (замість \`isLoading + error + data\`). Той самий прийом — для екшенів редюсера (\`{ type: 'add'; text } | { type: 'remove'; id }\`), повідомлень WebSocket, подій аналітики.

## Type guards і assertion functions

\`\`\`ts
function isUser(x: unknown): x is User {
  if (typeof x !== 'object' || x === null) return false;
  const u = x as Record<string, unknown>;
  return typeof u.id === 'number' && typeof u.name === 'string';
}
function assertDefined<T>(v: T, msg = 'missing'): asserts v is NonNullable<T> {
  if (v == null) throw new Error(msg);
}
\`\`\`
- звужує лише функція з **предикатом у сигнатурі**; обгортка, що повертає \`boolean\`, — ні;
- з TS 5.5 прості предикати виводяться автоматично: \`arr.filter((x) => x != null)\` → \`T[]\`;
- guard — обіцянка компілятору: неповна перевірка = прихований баг.

## Класи в TypeScript

\`\`\`ts
abstract class Shape { abstract area(): number; }
class Account implements Named {
  #balance = 0;                                    // справжня приватність JS
  constructor(public readonly owner: string, private currency = 'UAH') {} // parameter properties
  get balance(): number { return this.#balance; }  // лише читання
}
\`\`\`
- \`private\`/\`protected\`/\`readonly\` — лише перевірки компілятора; \`#field\` — приватність у рантаймі;
- parameter properties генерують код — несумісні з \`erasableSyntaxOnly\`;
- \`implements\` лише перевіряє відповідність, нічого не додає;
- \`override\` (з \`noImplicitOverride\`) — явне перевизначення методу;
- generic-класи: \`class TypedEmitter<Events extends Record<string, unknown>>\` з \`on<K extends keyof Events>\`.

## Типізація API і даних ззовні

- **межі системи** (fetch, storage, \`postMessage\`, URL) — дані \`unknown\`, далі перевірка guard'ом або схемою;
- \`res.json() as User\` — брехня компілятору; правильно — \`fetchJson(url, isUser)\` або \`UserSchema.parse(json)\` (Zod), тип — \`z.infer<typeof UserSchema>\`;
- генерація типів з OpenAPI (\`openapi-typescript\`), GraphQL Codegen, tRPC;
- **branded-типи** для id і значень з однаковою формою, але різним змістом:
\`\`\`ts
type UserId = string & { readonly __brand: 'UserId' };
const toUserId = (s: string) => s as UserId;   // єдине місце з as
\`\`\`

## TypeScript і DOM

| Вираз | Тип |
|---|---|
| \`document.querySelector('input')\` | \`HTMLInputElement \\| null\` |
| \`document.querySelector('#email')\` | \`Element \\| null\` |
| \`document.getElementById('x')\` | \`HTMLElement \\| null\` |
| \`addEventListener('keydown', e => …)\` | \`e: KeyboardEvent\` |
| \`e.target\` | \`EventTarget \\| null\` — звужувати \`instanceof\` |

Точний тип за селектором — лише для імені тегу. \`querySelector<HTMLInputElement>('#email')\` — обіцянка без перевірки; надійніше — \`if (el instanceof HTMLInputElement)\`. Тип події береться з мапи \`HTMLElementEventMap\` за назвою (у сучасному lib.dom \`click\` — \`PointerEvent\`).

## tsconfig, d.ts і міграція з JS

- \`strict: true\` = \`noImplicitAny\`, \`strictNullChecks\`, \`strictFunctionTypes\`, \`strictBindCallApply\`, \`strictPropertyInitialization\`, \`noImplicitThis\`, \`alwaysStrict\`, \`useUnknownInCatchVariables\`;
- окремо корисні: \`noUncheckedIndexedAccess\`, \`exactOptionalPropertyTypes\`, \`noImplicitOverride\`;
- фронтенд-проєкт: \`moduleResolution: "bundler"\`, \`noEmit\` (\`tsc\` лише перевіряє, транспілює Vite/esbuild), \`isolatedModules\`;
- \`Object.keys(obj)\` → \`string[]\` через структурну типізацію; \`catch (e)\` → \`unknown\`;
- **.d.ts:** типи без реалізації — \`@types/*\`, \`declare module 'lib'\`, \`declare global\`;
- **міграція:** \`allowJs\` → \`checkJs\` + JSDoc → \`.ts\` від утиліт до UI → поступово \`strict\`;
- **екосистема:** Node.js запускає \`.ts\` через type stripping (з 23.6); TypeScript 7 — нативний компілятор на Go.

## Типові питання

- **Як змоделювати стан запиту в TS?** Розрізнюване об'єднання.
- **Що таке type guard і assertion function?**
- **private vs #private?**
- **Як типізувати fetch, щоб це не було брехнею?**
- **Що вмикає strict?**
- **Як мігрувати великий JS-проєкт?**
`});
