FE.chapter('js-errors-book', { body: `
Помилки — частина нормальної роботи програми: мережа падає, дані неповні, користувач вводить дивне. Важливо відрізняти очікувані помилки від багів і обробляти їх у правильному місці.

## Об'єкт Error і вбудовані типи

\`new Error(message, { cause })\` має \`name\`, \`message\`, \`stack\` (нестандартний, але скрізь є), \`cause\`.
| Тип | Коли |
|---|---|
| \`TypeError\` | операція з непідхожим типом: виклик не-функції, доступ до властивості \`undefined\` |
| \`ReferenceError\` | неоголошена змінна, TDZ |
| \`SyntaxError\` | помилка розбору (\`JSON.parse\`, \`new Function\`) |
| \`RangeError\` | число поза межами: \`new Array(-1)\`, переповнення стеку |
| \`URIError\`, \`EvalError\` | рідко |
| \`AggregateError\` | кілька помилок (\`Promise.any\`) |
| \`DOMException\` | помилки Web API (\`AbortError\`, \`NotAllowedError\`, \`QuotaExceededError\`) |

## try / catch / finally

\`\`\`js
try {
  const data = JSON.parse(text);
} catch (err) {                 // з ES2019 можна catch { } без змінної
  showError('Некоректні дані');
} finally {
  hideSpinner();                // виконується завжди
}
\`\`\`
- \`finally\` виконується навіть після \`return\` у \`try\`; \`return\` у \`finally\` **перекриває** результат і «ковтає» виняток — не робіть так;
- \`try/catch\` ловить лише **синхронні** помилки свого блоку: помилка в колбеці \`setTimeout\` чи в непочеканому промісі туди не потрапить (для async — \`await\` усередині \`try\`);
- не обгортайте все підряд: ловіть там, де можете **осмислено обробити**.

## throw: що кидати і як ловити невідоме

- кидайте **\`Error\`** (або підкласи), а не рядки чи об'єкти: лише \`Error\` має \`stack\`;
- \`catch (e)\` отримує **будь-що** (\`throw 42\` легальний) → у TypeScript \`e: unknown\`; перевіряйте \`e instanceof Error\`;
- не «ковтайте» помилки (\`catch {}\`) — щонайменше логування; перекидайте невідомі:
\`\`\`js
try { save(); }
catch (e) {
  if (e instanceof ValidationError) showFieldErrors(e.fields);
  else throw e;                 // невідоме — не наша відповідальність
}
\`\`\`

## Власні класи помилок

\`\`\`js
class HttpError extends Error {
  constructor(status, message, options) {
    super(message, options);
    this.name = 'HttpError';     // інакше в стеку буде «Error»
    this.status = status;
  }
}
class NotFoundError extends HttpError {}
\`\`\`
Навіщо: розрізняти помилки за типом (\`instanceof\`) і нести дані (\`status\`, \`fields\`, \`retryAfter\`). Ієрархія: \`AppError\` → \`HttpError\` → \`NotFoundError\`. Альтернатива для очікуваних помилок — повертати результат (\`{ ok: false, error }\`), а не кидати.

## cause і AggregateError

- **\`cause\`** (ES2022) — ланцюжок причин без втрати оригінального стеку:
\`\`\`js
try { await fetchUser(id); }
catch (e) { throw new Error('Не вдалося завантажити профіль', { cause: e }); }
\`\`\`
  моніторинг (Sentry) показує весь ланцюжок; при обгортанні завжди передавайте \`cause\`;
- **\`AggregateError\`** — кілька помилок у \`errors\`: \`Promise.any\`, коли всі відхилились; валідація з кількома порушеннями.

## Де ловити: fail fast і глобальні обробники

- **fail fast:** перевіряйте вхідні дані й інваріанти рано і кидайте зрозумілу помилку — баг знайдеться ближче до причини;
- **межі обробки:** у UI — на рівні сторінки/компонента (Error Boundary в React), у мережевому шарі — перетворення HTTP-відповідей на типізовані помилки;
- **глобальні обробники** — останній рубіж і телеметрія, не заміна обробці:
\`\`\`js
window.addEventListener('error', (e) => report(e.error));                  // синхронні неперехоплені
window.addEventListener('unhandledrejection', (e) => report(e.reason));     // проміси без catch
\`\`\`
- **моніторинг:** Sentry та аналоги збирають стеки з source maps, контекст (браузер, користувач, breadcrumbs), групують і рахують.

## Налагодження: DevTools і пошук багів

**Методика:** відтворити → звузити (бінарний пошук: вимкнути половину, \`git bisect\`) → гіпотеза → перевірка в налагоджувачі → виправлення **разом з тестом**, що відтворює баг.

**Точки зупину (Sources):** звичайні й **умовні**, **logpoints** (вивід без зміни коду), DOM breakpoints (хто змінив елемент), XHR/fetch breakpoints, event listener breakpoints, **Pause on exceptions** (зокрема перехоплених). Під час паузи: Call Stack (з async-кадрами), Scope, Watch, консоль у контексті кадру. \`debugger;\` спрацьовує лише з відкритими DevTools.

**Консоль:** \`console.table\`, \`console.trace\` (хто викликав), \`console.time/timeEnd\`, \`console.count\`, \`console.assert\`, \`$0\` (виділений елемент).

**Класичні баги з баг-репортів:** \`sort()\` без компаратора і мутація вхідного масиву; \`'10' + 5\` з полів форми; \`0.1 + 0.2\` у грошах; \`i <= length\`; забутий \`await\`; гонка відповідей.

## Типові питання

- **Які є вбудовані типи помилок?**
- **Чи зловить try/catch помилку в setTimeout?**
- **Навіщо власні класи помилок і cause?**
- **Що робить finally з return?**
- **Як ловити помилки глобально і навіщо Sentry?**
- **Як ви шукаєте баг? Які інструменти DevTools знаєте?**
`});
