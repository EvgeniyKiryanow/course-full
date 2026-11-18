FE.chapter('ts-generics-book', { body: `
Generics і «обчислення на типах» — те, що відрізняє користувача TypeScript від того, хто справді його розуміє. На співбесідах Strong Middle просять пояснити й написати \`Pick\`, \`ReturnType\`, \`DeepReadonly\`.

## Generic-функції та обмеження

\`\`\`ts
function first<T>(arr: readonly T[]): T | undefined { return arr[0]; }
first([1, 2]);              // T = number → number | undefined

function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
function groupBy<T, K extends PropertyKey>(items: readonly T[], key: (x: T) => K): Partial<Record<K, T[]>> { /* ... */ }
\`\`\`
- generic зберігає **зв'язок** між типами входу і виходу; без зв'язку — generic не потрібен;
- \`T extends X\` — обмеження: всередині доступні властивості X, виклик з несумісним типом — помилка;
- параметр за замовчуванням: \`<T = string>\`;
- \`<const T>\` (TS 5.0) — виводити найвужчий тип, як з \`as const\`.

## keyof, typeof і індексний доступ

\`\`\`ts
type User = { id: number; name: string };
type Keys = keyof User;            // 'id' | 'name'
type Name = User['name'];          // string
type Values = User[keyof User];    // number | string

const config = { port: 3000, host: 'x' };
type Config = typeof config;       // { port: number; host: string }

function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] { return items.map((i) => i[key]); }
\`\`\`
\`K extends keyof T\` + \`T[K]\` — основа типобезпечних \`get\`, \`sortBy\`, обробників форм і подій (\`HTMLElementEventMap[K]\`).

## Утилітні типи

| Тип | Результат |
|---|---|
| \`Partial<T>\` / \`Required<T>\` | усі поля необов'язкові / обов'язкові |
| \`Readonly<T>\` | поверхнево readonly |
| \`Pick<T, K>\` / \`Omit<T, K>\` | вибрати / прибрати ключі |
| \`Record<K, V>\` | словник |
| \`Exclude<U, X>\` / \`Extract<U, X>\` | фільтр об'єднання |
| \`NonNullable<T>\` | без null/undefined |
| \`ReturnType<F>\`, \`Parameters<F>\`, \`Awaited<T>\` | типи з функцій і промісів |

**Пастка:** вбудований \`Omit<T, K>\` не перевіряє, що \`K\` — ключ \`T\` (\`K extends keyof any\`), а \`Pick\` перевіряє. Перетин \`A & B\` поводиться як об'єкт, але для точного порівняння типів його «розплющують»: \`type Simplify<T> = { [K in keyof T]: T[K] } & {}\`.

## Mapped types

\`\`\`ts
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyPartial<T> = { [P in keyof T]?: T[P] };
type Mutable<T> = { -readonly [P in keyof T]: T[P] };      // прибрати модифікатор
type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] }; // перейменування
type OnlyStrings<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] };  // фільтр
\`\`\`
- \`[P in keyof T]\` (гомоморфний) зберігає \`?\` і \`readonly\` вихідних ключів;
- модифікатори \`+readonly/-readonly\`, \`+?/-?\`;
- \`as\` перейменовує ключ, \`never\` — видаляє.

## Умовні типи та infer

\`\`\`ts
type IsString<T> = T extends string ? true : false;
type ElementOf<T> = T extends (infer U)[] ? U : never;
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;
type MyAwaited<T> = T extends PromiseLike<infer U> ? MyAwaited<U> : T;
type DeepReadonly<T> = T extends (...a: any[]) => any ? T
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
\`\`\`
- **дистрибутивність:** «голий» \`T\` в умові застосовується до кожного члена об'єднання: \`ToArray<string | number>\` → \`string[] | number[]\`; вимкнути — \`[T] extends [X]\`;
- \`infer\` — «змінна» в шаблоні, лише всередині \`extends\`;
- рекурсивні типи — потужні, але повільні на великих структурах.

## Template literal types

\`\`\`ts
type EventName<E extends string> = \`on\${Capitalize<E>}\`;     // 'onClick'
type CssVar = \`--\${string}\`;
type ParamNames<P extends string> =
  P extends \`\${string}:\${infer Param}/\${infer Rest}\` ? Param | ParamNames<Rest>
  : P extends \`\${string}:\${infer Param}\` ? Param : never;
type T = ParamNames<'/users/:id/posts/:postId'>;              // 'id' | 'postId'
\`\`\`
Перетворювачі: \`Uppercase\`, \`Lowercase\`, \`Capitalize\`, \`Uncapitalize\`. Об'єднання в шаблоні дають усі комбінації. Так типізують роутери, назви подій, ключі перекладів.

## Типові питання

- **Що таке generic і коли він потрібен?**
- **Напишіть Pick / Omit / ReturnType.**
- **Що таке дистрибутивні умовні типи?**
- **Як працює infer?**
- **Чим Omit відрізняється від Pick щодо перевірки ключів?**
- **Що таке key remapping?**
`});
