(function () {
const HTML = '<div id="root"></div>';
const CSS = `body { font-family: system-ui, sans-serif; padding: 12px; }
button { padding: 4px 10px; margin: 2px; }
.dark { background: #111827; color: #f9fafb; }
.error { color: #c00; }`;

FE.topic('react-hooks', {
  intro: `
**Хуки** — функції, через які компонент отримує стан, ефекти, посилання і контекст. Головне правило: хуки викликаються **на верхньому рівні** компонента, в однаковому порядку на кожному рендері (ви бачили чому — у кроці 5 міні-фреймворку).

| Хук | Навіщо | Аналогія з вивченого |
|---|---|---|
| \`useEffect\` | синхронізація з «зовнішнім світом» після рендеру | підписка + cleanup (модуль V8: витоки) |
| \`useRef\` | DOM-вузол або змінне значення без рендеру | змінна в замиканні |
| \`useReducer\` | складний стан через дії | редюсер Redux, \`todosReducer\` з TS |
| \`useContext\` | дані глибоко без prop drilling | DI / provide-inject |
| \`useMemo\` / \`useCallback\` | стабільні посилання й кеш | мемоізація |
| власні хуки | повторне використання логіки зі станом | функції вищого порядку |
`,
  groups: [
    { id: 'effects', title: 'useEffect: синхронізація із зовнішнім світом' },
    { id: 'fetching', title: 'Дані з сервера: завантаження, помилки, гонки' },
    { id: 'refs', title: 'useRef: DOM і змінні значення' },
    { id: 'reducer-context', title: 'useReducer і Context' },
    { id: 'custom-hooks', title: 'Власні хуки' },
    { id: 'closures', title: 'Замикання в хуках і правила хуків' }
  ],
  items: [
    // ---------------------------------------------------------------- effects
    {
      id: 'rh-quiz-effect-order', group: 'effects', type: 'quiz', level: 3, interview: true,
      title: 'Порядок рендеру й ефектів',
      question: `
\`Parent\` рендерить \`Child\`. Обидва логують рендер, \`useLayoutEffect\` і \`useEffect\`. У якому порядку з'являться логи після монтування?
`,
      options: [
        'parent render, child render, child layout, parent layout, child effect, parent effect',
        'parent render, parent layout, parent effect, child render, child layout, child effect',
        'parent render, child render, parent layout, child layout, parent effect, child effect',
        'child render, parent render, child effect, parent effect, child layout, parent layout'
      ],
      answer: 0,
      why: [
        'Так: рендер зверху вниз, а ефекти — знизу вгору (дитина готова раніше за батька); layout-ефекти — до effects.',
        'Ні: ефекти батька не виконуються до рендеру дитини.',
        'Ні: ефекти виконуються від дітей до батьків.',
        'Ні: рендер починається з батька.'
      ],
      hint: 'Батько не «готовий», доки не готові його діти. А layout-ефекти виконуються до відмальовки кадру.',
      explanation: 'Фази: **render** (виклик функцій-компонентів зверху вниз) → **commit** (зміни DOM) → `useLayoutEffect` (синхронно до відмальовки, діти → батьки) → браузер малює → `useEffect` (діти → батьки). Перевірено на React 19. `useLayoutEffect` — для вимірювань DOM без «стрибка» (позиція підказки), у решті випадків — `useEffect`.'
    },
    {
      id: 'rh-document-title', group: 'effects', type: 'dom', runtime: 'react', level: 2,
      title: 'Ефект з cleanup: заголовок вкладки',
      description: `
**Завдання.** Напишіть \`UnreadBadge({ count })\`, що рендерить \`<span>{count}</span>\` і синхронізує заголовок вкладки:
- \`count > 0\` → \`document.title = '(N) Пошта'\`, інакше \`'Пошта'\`;
- оновлюється при зміні \`count\`;
- після **розмонтування** заголовок повертається до \`'Пошта'\`.

**Де трапляється:** лічильник непрочитаних у заголовку вкладки (Gmail, Slack), назва відкритого документа — синхронізація React із «зовнішнім світом».

**Аналогія:** ефект — «підписка» на зовнішній світ, cleanup — «відписка» (як \`unmount\` у задачі про витоки пам'яті в модулі V8).

**Як це працює:** \`useEffect(() => { ... ; return () => { ... } }, [count])\` — тіло виконується після рендеру, коли змінився \`count\`; функція, що повертається, — перед наступним запуском і при розмонтуванні.
`,
      html: HTML, css: CSS,
      js: `import { useEffect } from 'react';

function UnreadBadge({ count }) {
  // TODO: useEffect з залежністю [count] і cleanup
  return <span>{count}</span>;
}

function App() {
  return <UnreadBadge count={3} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useEffect } from 'react';

function UnreadBadge({ count }) {
  useEffect(() => {
    document.title = count > 0 ? '(' + count + ') Пошта' : 'Пошта';
    return () => {
      document.title = 'Пошта';
    };
  }, [count]);
  return <span>{count}</span>;
}

function App() {
  return <UnreadBadge count={3} />;
}
` },
      hints: ['Ефект з масивом залежностей `[count]` — перезапускається лише при зміні count.', 'Cleanup: `return () => { document.title = \'Пошта\'; };`'],
      tests: [
        { name: 'заголовок після монтування і оновлення', code: "const m = mount(UnreadBadge, { count: 3 });\nexpect(document.title).toBe('(3) Пошта');\nm.rerender({ count: 0 });\nexpect(document.title).toBe('Пошта');\nm.rerender({ count: 12 });\nexpect(document.title).toBe('(12) Пошта');" },
        { name: 'cleanup при розмонтуванні', code: "const m = mount(UnreadBadge, { count: 5 });\nm.unmount();\nexpect(document.title).toBe('Пошта');" }
      ],
      explanation: '**Ефект — не «життєвий цикл», а синхронізація**: «коли count такий — заголовок такий». Порожній масив `[]` — синхронізація один раз; без масиву — після кожного рендеру. Розрахунки з props і state — не в ефекті, а під час рендеру (ефект «на всяк випадок» — найчастіша помилка новачків: зайвий рендер і розсинхронізація).'
    },
    {
      id: 'rh-stopwatch', group: 'effects', type: 'dom', runtime: 'react', level: 2,
      title: 'Секундомір: інтервал і cleanup',
      description: `
**Завдання.** Напишіть \`Stopwatch\`:
- \`<output>\` з секундами (спочатку 0), кнопка \`Старт\` / \`Пауза\` (текст залежить від стану);
- поки запущено — +1 щосекунди (\`setInterval\` в ефекті, залежність — чи запущено);
- пауза і розмонтування зупиняють інтервал;
- кнопка \`Скинути\` — 0.

**Де трапляється:** таймери в тестах і квізах, зворотний відлік до кінця акції, автозбереження — інтервали, які треба прибирати при розмонтуванні.

**Аналогія:** забутий \`clearInterval\` — класичний витік (модуль V8). А \`setSeconds((s) => s + 1)\` замість \`setSeconds(seconds + 1)\` рятує від «застарілого замикання»: ефект створює колбек один раз.
`,
      html: HTML, css: CSS,
      js: `import { useState, useEffect } from 'react';

function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  // TODO: useEffect, що запускає інтервал, коли running, і очищує його

  return (
    <div>
      <output>{seconds}</output>
      <button onClick={() => setRunning(!running)}>Старт</button>
      <button onClick={() => setSeconds(0)}>Скинути</button>
    </div>
  );
}

function App() {
  return <Stopwatch />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState, useEffect } from 'react';

function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div>
      <output>{seconds}</output>
      <button onClick={() => setRunning(!running)}>{running ? 'Пауза' : 'Старт'}</button>
      <button onClick={() => setSeconds(0)}>Скинути</button>
    </div>
  );
}

function App() {
  return <Stopwatch />;
}
` },
      hints: ['`useEffect(() => { if (!running) return; const id = setInterval(...); return () => clearInterval(id); }, [running]);`', 'Функціональне оновлення `setSeconds((s) => s + 1)` — бо колбек інтервалу створюється один раз.'],
      tests: [
        { name: 'рахує, ставиться на паузу', code: "useFakeTimers();\nconst m = mount(Stopwatch);\nconst [toggle] = m.container.querySelectorAll('button');\nawait act(() => click(toggle));\nexpect(toggle.textContent).toBe('Пауза');\nawait act(() => advanceTimersByTime(3000));\nexpect(m.container.querySelector('output').textContent).toBe('3');\nawait act(() => click(toggle));\nawait act(() => advanceTimersByTime(5000));\nexpect(m.container.querySelector('output').textContent).toBe('3');" },
        { name: 'скидання і продовження', code: "useFakeTimers();\nconst m = mount(Stopwatch);\nconst [toggle, reset] = m.container.querySelectorAll('button');\nawait act(() => click(toggle));\nawait act(() => advanceTimersByTime(2000));\nawait act(() => click(reset));\nawait act(() => advanceTimersByTime(1000));\nexpect(m.container.querySelector('output').textContent).toBe('1');" },
        { name: 'розмонтування зупиняє інтервал', code: "useFakeTimers();\nconst m = mount(Stopwatch);\nawait act(() => click(m.container.querySelector('button')));\nexpect(getTimerCount()).toBe(1);\nm.unmount();\nexpect(getTimerCount()).toBe(0);" }
      ],
      explanation: 'Залежність `[running]`: ефект перезапускається лише при старті/паузі — cleanup попереднього запуску прибирає старий інтервал. Якби в колбеці було `setSeconds(seconds + 1)` з `[]` у залежностях — лічильник застряг би на 1 (замикання бачить `seconds` першого рендеру).'
    },
    {
      id: 'rh-quiz-strict-mode', group: 'effects', type: 'quiz', level: 2,
      title: 'Ефект запускається двічі в розробці',
      question: `
У dev-режимі з \`<StrictMode>\` консоль показує \`setup\`, \`cleanup\`, \`setup\` для ефекту з \`[]\`. Що це означає?

\`\`\`jsx
useEffect(() => {
  console.log('setup');
  return () => console.log('cleanup');
}, []);
\`\`\`
`,
      options: [
        'Баг у коді: ефект з [] має виконуватися рівно один раз',
        'Це StrictMode: перевірка cleanup; у продакшені — один раз',
        'React виконує ефекти двічі завжди, і в продакшені теж',
        'Компонент рендериться у двох різних місцях сторінки'
      ],
      answer: 1,
      why: [
        'Ні: це очікувана поведінка розробки.',
        'Так: якщо після setup → cleanup → setup щось зламалось — у вас витік або незакрита підписка.',
        'Ні: у production-збірці додаткового циклу немає.',
        'Ні: компонент той самий.'
      ],
      hint: 'Навіщо React в розробці навмисно «смикати» компонент?',
      explanation: 'StrictMode (лише в dev) також **двічі викликає рендер** компонента — щоб виявити нечисті рендери (побічні ефекти під час рендеру). Правильна реакція — не «вимкнути StrictMode», а дописати cleanup: відписка, `clearInterval`, `AbortController.abort()`. Перевірено на React 19.'
    },
    {
      id: 'rh-quiz-deps', group: 'effects', type: 'quiz', level: 1,
      title: 'Масив залежностей',
      question: 'Коли виконується `useEffect(fn)` **без** масиву залежностей?',
      options: [
        'Після кожного рендеру компонента',
        'Лише один раз після монтування',
        'Лише при розмонтуванні',
        'Ніколи — без масиву ефект ігнорується'
      ],
      answer: 0,
      why: [
        'Так: без масиву — після кожного рендеру.',
        'Ні: це `useEffect(fn, [])`.',
        'Ні: при розмонтуванні виконується cleanup, а не сам ефект.',
        'Ні: масив необов\'язковий.'
      ],
      hint: 'Порівняйте `useEffect(fn)`, `useEffect(fn, [])` і `useEffect(fn, [a, b])`.',
      explanation: 'Без масиву — після кожного рендеру; `[]` — після монтування (cleanup при розмонтуванні); `[a, b]` — коли змінилось a або b (порівняння `Object.is`). Залежності — **не вибір**, а опис: усе реактивне (props, state, функції з тіла), що використовує ефект. Правило ESLint `react-hooks/exhaustive-deps` перевіряє це автоматично.'
    },
    // ---------------------------------------------------------------- fetching
    {
      id: 'rh-user-profile', group: 'fetching', type: 'dom', runtime: 'react', level: 3, interview: true,
      title: 'Завантаження даних: стани і гонка відповідей',
      description: `
**Завдання.** Напишіть \`UserProfile({ userId })\`, що завантажує \`/api/users/<userId>\` (відповідь \`{ name }\`):
- поки завантажується — \`<p>Завантаження…</p>\`;
- помилка (\`!res.ok\` або мережа) → \`<p className="error">Помилка</p>\`;
- успіх → \`<h2>{name}</h2>\`;
- при зміні \`userId\` і розмонтуванні попередній запит **скасовується** (\`AbortController\`), щоб стара відповідь не перезаписала нову.

**Де трапляється:** сторінка профілю чи товару, де параметр в URL змінюється швидше, ніж приходить відповідь. Гонка відповідей — частий баг і часте питання на співбесідах.

**Аналогія:** гонка відповідей з модуля «Асинхронність» і автокомпліт з «Архітектури»: запит на користувача 1 може прийти **після** запиту на 2.
`,
      html: HTML, css: CSS,
      js: `import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    // TODO: AbortController, fetch, оновлення стану, cleanup з abort()
  }, [userId]);

  if (state.status === 'loading') return <p>Завантаження…</p>;
  if (state.status === 'error') return <p className="error">Помилка</p>;
  return <h2>{state.user.name}</h2>;
}

function App() {
  return <UserProfile userId={1} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    fetch('/api/users/' + userId, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((user) => setState({ status: 'success', user }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ status: 'error' });
      });
    return () => controller.abort();
  }, [userId]);

  if (state.status === 'loading') return <p>Завантаження…</p>;
  if (state.status === 'error') return <p className="error">Помилка</p>;
  return <h2>{state.user.name}</h2>;
}

function App() {
  return <UserProfile userId={1} />;
}
` },
      hints: ['У ефекті: `const controller = new AbortController(); fetch(url, { signal: controller.signal })...; return () => controller.abort();`', 'Скасування дає `AbortError` — його не показуйте як помилку.'],
      tests: [
        { name: 'завантаження → дані', code: "mockFetch((url) => ({ body: { name: 'User ' + url.split('/').pop() }, delay: 10 }));\nconst m = mount(UserProfile, { userId: 7 });\nexpect(m.container.textContent).toBe('Завантаження…');\nawait settle(30);\nexpect(m.container.querySelector('h2').textContent).toBe('User 7');" },
        { name: 'помилка сервера', code: "mockFetch(() => ({ status: 500, body: {} }));\nconst m = mount(UserProfile, { userId: 1 });\nawait settle(20);\nexpect(m.container.querySelector('.error').textContent).toBe('Помилка');" },
        { name: 'стара відповідь не перезаписує нову', code: "mockFetch((url) => url.endsWith('/1') ? { body: { name: 'Перший' }, delay: 60 } : { body: { name: 'Другий' }, delay: 5 });\nconst m = mount(UserProfile, { userId: 1 });\nm.rerender({ userId: 2 });\nawait settle(100);\nexpect(m.container.querySelector('h2').textContent).toBe('Другий');" }
      ],
      explanation: 'Альтернатива `AbortController` — прапорець `let ignore = false; ... return () => { ignore = true; }` (запит не скасовується, але відповідь ігнорується). У реальних проєктах дані частіше завантажують бібліотеками кешу серверного стану (TanStack Query, SWR) або засобами фреймворку (loader у роутері, Server Components у Next.js) — вони розв\'язують гонки, кеш, повтори й дедуплікацію. Модель стану `{ status }` — розрізнюване об\'єднання з модуля TypeScript.'
    },
    {
      id: 'rh-fetch-theory', group: 'fetching', type: 'theory', level: 3,
      title: 'Чому fetch в useEffect — не найкращий вибір',
      question: 'Оберіть **усі** реальні проблеми ручного завантаження даних у `useEffect`.',
      choices: [
        'Гонки відповідей, якщо не скасовувати або не ігнорувати застарілі запити',
        'Немає кешу: повторне монтування — повторний запит; однакові дані в різних компонентах — кілька запитів',
        '«Водоспади»: дитина починає завантаження лише після рендеру батька, що теж чекав даних',
        'useEffect взагалі не дозволяє робити асинхронні запити',
        'Немає ревалідації при поверненні на вкладку і повторів при помилках'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: потрібен abort або ignore-прапорець.',
        'Так: кожен компонент — власний запит і власний стан.',
        'Так: послідовні запити замість паралельних.',
        'Ні: можна, просто з обережністю (функція ефекту не async, але всередині — проміси).',
        'Так: це вже реалізовано в бібліотеках серверного стану.'
      ],
      hint: 'Що дає TanStack Query понад «fetch + useState»?',
      answer: `
**Ручний fetch у ефекті** — нормальний для навчання й простих випадків, але в продакшені швидко обростає кодом:
- скасування/ігнорування застарілих відповідей;
- кеш і дедуплікація (той самий ключ — один запит);
- стани \`pending/error/success\`, повтори, ревалідація (focus, інтервал), пагінація;
- водоспади → паралельне завантаження на рівні маршруту.

**Рішення:**
| Підхід | Що дає |
|---|---|
| TanStack Query / SWR | кеш серверного стану: \`useQuery({ queryKey, queryFn })\`, мутації з інвалідацією, оптимістичні оновлення |
| Роутер з loaders (React Router, TanStack Router) | дані до рендеру маршруту, без водоспадів |
| Next.js Server Components | дані на сервері, без JS-коду завантаження на клієнті |
| React 19 \`use(promise)\` + Suspense | читання промісу в рендері (проміс створюється поза компонентом/кешується) |

**Правило:** функція ефекту не може бути \`async\` (вона має повертати cleanup, а не проміс) — оголошуйте async-функцію всередині.
`,
      keyPoints: ['Гонки → abort/ignore', 'Немає кешу і дедуплікації', 'Водоспади запитів', 'TanStack Query, loaders, Server Components', 'Функція ефекту не async']
    },
    // ---------------------------------------------------------------- refs
    {
      id: 'rh-search-focus', group: 'refs', type: 'dom', runtime: 'react', level: 2,
      title: 'useRef для DOM: фокус',
      description: `
**Завдання.** Напишіть \`SearchBox\`:
- \`<input>\` отримує фокус одразу після монтування;
- кнопка \`Очистити\` очищує поле **і повертає фокус** у нього;
- значення поля — контрольоване.

**Де трапляється:** автофокус на полі пошуку чи в модалці, фокус на першому полі з помилкою — доступ до DOM через ref.

**Аналогія:** \`ref.current\` — той самий DOM-вузол, що \`document.querySelector\`, але без пошуку і прив'язаний до компонента.

**Як це працює:** \`const inputRef = useRef(null)\` → \`<input ref={inputRef} />\` → після commit \`inputRef.current\` — DOM-вузол. Працювати з ним — в ефектах і обробниках, не під час рендеру.
`,
      html: HTML, css: CSS,
      js: `import { useState, useRef, useEffect } from 'react';

function SearchBox() {
  const [text, setText] = useState('');
  // TODO: ref на input, фокус після монтування, фокус після очищення
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => setText('')}>Очистити</button>
    </div>
  );
}

function App() {
  return <SearchBox />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState, useRef, useEffect } from 'react';

function SearchBox() {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  function clear() {
    setText('');
    inputRef.current.focus();
  }

  return (
    <div>
      <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={clear}>Очистити</button>
    </div>
  );
}

function App() {
  return <SearchBox />;
}
` },
      hints: ['`const inputRef = useRef(null)` і `<input ref={inputRef} />`.', 'Фокус після монтування — `useEffect(() => inputRef.current.focus(), [])`; в обробнику — `inputRef.current.focus()`.'],
      tests: [
        { name: 'фокус після монтування', code: "const m = mount(SearchBox);\nexpect(document.activeElement).toBe(m.container.querySelector('input'));" },
        { name: 'очищення повертає фокус', code: "const m = mount(SearchBox);\nconst field = m.container.querySelector('input');\nawait act(() => typeInto(field, 'react'));\nm.container.querySelector('button').focus();\nawait act(() => click(m.container.querySelector('button')));\nexpect(field.value).toBe('');\nexpect(document.activeElement).toBe(field);" }
      ],
      explanation: 'Для простого автофокусу є й атрибут `autoFocus`, але ручний фокус потрібен скрізь, де важлива доступність: модалки, повернення фокусу, помилки форм. З React 19 `ref` можна передавати звичайним пропом у власні компоненти (`function Input({ ref })`) — `forwardRef` більше не потрібен.'
    },
    {
      id: 'rh-quiz-ref-render', group: 'refs', type: 'quiz', level: 2, interview: true,
      title: 'Зміна ref.current',
      question: `
Що покаже кнопка після кліку?

\`\`\`jsx
function R() {
  const clicks = useRef(0);
  return <button onClick={() => { clicks.current++; }}>{clicks.current}</button>;
}
\`\`\`
`,
      options: ['`1`', '`0` — зміна ref не викликає рендер', 'Помилку: ref не можна змінювати', '`NaN`'],
      answer: 1,
      why: [
        'Ні: значення змінилось, але компонент не перерендерився.',
        'Так: ref — «коробка», зміна її вмісту React не відстежує.',
        'Ні: `current` — звичайна змінна властивість.',
        'Ні: 0++ дає 1.'
      ],
      hint: 'Чим `useRef` відрізняється від `useState`?',
      explanation: '`useRef` — змінне значення, що переживає рендери, **без** перерендеру: id таймера, попереднє значення, прапорець «змонтовано», DOM-вузол. Те, що показується на екрані, — у стані. Перевірено на React 19.'
    },
    // ---------------------------------------------------------------- reducer & context
    {
      id: 'rh-cart-reducer', group: 'reducer-context', type: 'dom', runtime: 'react', level: 3,
      title: 'Кошик на useReducer',
      description: `
**Завдання.** Напишіть \`cartReducer(state, action)\` і компонент \`Cart({ products })\`:
- стан — масив \`{ id, title, price, qty }\`;
- дії: \`{ type: 'add', product }\` (новий → qty 1, наявний → qty + 1), \`{ type: 'remove', id }\`, \`{ type: 'setQty', id, qty }\` (qty ≤ 0 — видалити);
- \`Cart\`: для кожного продукту кнопка \`Додати <title>\`; список позицій \`<li>\` з \`title × qty\` і кнопкою \`×\`; \`<p className="total">Разом: N грн</p>\` — **обчислюється**.

**Де трапляється:** кошик, конструктор форм, багатокрокові візарди — стан із багатьма взаємопов'язаними діями.

**Аналогія:** той самий редюсер, що \`todosReducer\` у модулі TypeScript і Redux: чиста функція \`(стан, дія) → новий стан\`, а компонент лише відправляє дії.
`,
      html: HTML, css: CSS,
      js: `import { useReducer } from 'react';

function cartReducer(state, action) {
  switch (action.type) {
    // TODO: add, remove, setQty
    default:
      return state;
  }
}

function Cart({ products }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  // TODO: кнопки, список, total
  return null;
}

function App() {
  return <Cart products={[{ id: 1, title: 'Кава', price: 80 }, { id: 2, title: 'Круасан', price: 60 }]} />;
}
`,
      editable: ['js'],
      solution: { js: `import { useReducer } from 'react';

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const found = state.find((i) => i.id === action.product.id);
      if (found) return state.map((i) => (i.id === found.id ? { ...i, qty: i.qty + 1 } : i));
      return [...state, { ...action.product, qty: 1 }];
    }
    case 'remove':
      return state.filter((i) => i.id !== action.id);
    case 'setQty':
      return action.qty <= 0
        ? state.filter((i) => i.id !== action.id)
        : state.map((i) => (i.id === action.id ? { ...i, qty: action.qty } : i));
    default:
      return state;
  }
}

function Cart({ products }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return (
    <div>
      {products.map((p) => (
        <button key={p.id} onClick={() => dispatch({ type: 'add', product: p })}>Додати {p.title}</button>
      ))}
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            {i.title} × {i.qty} <button onClick={() => dispatch({ type: 'remove', id: i.id })}>×</button>
          </li>
        ))}
      </ul>
      <p className="total">Разом: {total} грн</p>
    </div>
  );
}

function App() {
  return <Cart products={[{ id: 1, title: 'Кава', price: 80 }, { id: 2, title: 'Круасан', price: 60 }]} />;
}
` },
      hints: ['add: якщо позиція є — `map` з `qty + 1`, інакше `[...state, { ...product, qty: 1 }]`.', 'Сума — `items.reduce((s, i) => s + i.price * i.qty, 0)` під час рендеру.'],
      tests: [
        { name: 'редюсер: add, setQty, remove без мутацій', code: "const p = { id: 1, title: 'A', price: 10 };\nconst s1 = cartReducer([], { type: 'add', product: p });\nconst s2 = cartReducer(s1, { type: 'add', product: p });\nexpect(s2).toEqual([{ id: 1, title: 'A', price: 10, qty: 2 }]);\nexpect(s1[0].qty).toBe(1);\nexpect(cartReducer(s2, { type: 'setQty', id: 1, qty: 0 })).toEqual([]);\nexpect(cartReducer(s2, { type: 'remove', id: 1 })).toEqual([]);\nexpect(cartReducer(s2, { type: 'unknown' })).toBe(s2);" },
        { name: 'компонент: додавання і сума', code: "const m = mount(Cart, { products: [{ id: 1, title: 'Кава', price: 80 }, { id: 2, title: 'Круасан', price: 60 }] });\nconst [coffee, croissant] = m.container.querySelectorAll('button');\nawait act(() => click(coffee));\nawait act(() => click(coffee));\nawait act(() => click(croissant));\nexpect(m.container.querySelector('.total').textContent).toBe('Разом: 220 грн');\nexpect(m.container.querySelectorAll('li')).toHaveLength(2);" },
        { name: 'видалення позиції', code: "const m = mount(Cart, { products: [{ id: 1, title: 'Кава', price: 80 }] });\nawait act(() => click(m.container.querySelector('button')));\nawait act(() => click(m.container.querySelector('li button')));\nexpect(m.container.querySelectorAll('li')).toHaveLength(0);\nexpect(m.container.querySelector('.total').textContent).toBe('Разом: 0 грн');" }
      ],
      explanation: '`useReducer` доречний, коли кілька змін стану пов\'язані або логіка складна: уся логіка в одній чистій функції, її легко тестувати без React (перший тест). `dispatch` стабільний між рендерами — його зручно передавати вниз і в контекст. Невідома дія повертає **той самий** стан — React пропустить рендер.'
    },
    {
      id: 'rh-theme-context', group: 'reducer-context', type: 'dom', runtime: 'react', level: 2,
      title: 'Context: тема без prop drilling',
      description: `
**Завдання.** Створіть \`ThemeContext\` і:
- \`ThemeProvider({ children })\` — стан \`'light' | 'dark'\` (спочатку \`'light'\`), передає \`{ theme, toggle }\` через контекст;
- \`ThemedPanel({ children })\` — \`<section className={theme}>\` (клас \`light\` або \`dark\`);
- \`ThemeToggle\` — кнопка з текстом \`Темна тема\` / \`Світла тема\`, що перемикає тему.

**Де трапляється:** тема, мова інтерфейсу, поточний користувач — дані, потрібні багатьом компонентам на різній глибині дерева.

Компоненти можуть бути на будь-якій глибині під \`ThemeProvider\` — без передачі пропсів через проміжні рівні.

**Аналогія:** Context — «провайдер залежностей» (Dependency Injection з модуля «Патерни»; у Vue — \`provide/inject\`).
`,
      html: HTML, css: CSS,
      js: `import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  // TODO
  return children;
}

function ThemedPanel({ children }) {
  // TODO
  return <section>{children}</section>;
}

function ThemeToggle() {
  // TODO
  return <button>Темна тема</button>;
}

function App() {
  return (
    <ThemeProvider>
      <ThemedPanel>
        <p>Вміст</p>
        <ThemeToggle />
      </ThemedPanel>
    </ThemeProvider>
  );
}
`,
      editable: ['js'],
      solution: { js: `import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

function ThemedPanel({ children }) {
  const { theme } = useContext(ThemeContext);
  return <section className={theme}>{children}</section>;
}

function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);
  return <button onClick={toggle}>{theme === 'light' ? 'Темна тема' : 'Світла тема'}</button>;
}

function App() {
  return (
    <ThemeProvider>
      <ThemedPanel>
        <p>Вміст</p>
        <ThemeToggle />
      </ThemedPanel>
    </ThemeProvider>
  );
}
` },
      hints: ['Провайдер: `<ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>` (у React 19 можна й `<ThemeContext value={...}>`).', 'Споживачі: `const { theme, toggle } = useContext(ThemeContext);`'],
      tests: [
        { name: 'тема за замовчуванням і перемикання', code: "const m = mount(App);\nconst section = m.container.querySelector('section');\nconst btn = m.container.querySelector('button');\nexpect(section.className).toBe('light');\nexpect(btn.textContent).toBe('Темна тема');\nawait act(() => click(btn));\nexpect(section.className).toBe('dark');\nexpect(btn.textContent).toBe('Світла тема');" },
        { name: 'глибоко вкладений споживач', code: "function Deep() { return React.createElement('div', null, React.createElement('div', null, React.createElement(ThemeToggle))); }\nconst m = mount(ThemeProvider, { children: React.createElement(ThemedPanel, null, React.createElement(Deep)) });\nawait act(() => click(m.container.querySelector('button')));\nexpect(m.container.querySelector('section').className).toBe('dark');" }
      ],
      explanation: 'Context — для даних, потрібних багатьом компонентам на різній глибині: тема, мова, поточний користувач. **Ціна:** при зміні `value` перерендерюються всі споживачі. Новий об\'єкт `{ theme, toggle }` на кожному рендері провайдера — нове значення контексту (див. наступний квіз); стабілізують через `useMemo` або розділяють контексти (стан і дії окремо). Для частих оновлень — стор з селекторами (Zustand, Redux).'
    },
    {
      id: 'rh-quiz-context-rerender', group: 'reducer-context', type: 'quiz', level: 3, interview: true,
      title: 'Context і зайві перерендери',
      question: `
\`Consumer\` загорнутий у \`React.memo\` і читає контекст. Провайдер перерендерюється через свій **власний** стан \`n\`, а дані в value не змінюються. Чи перерендериться \`Consumer\`?

\`\`\`jsx
function Prov() {
  const [n, setN] = useState(0);
  return (
    <Ctx.Provider value={{ user: 'Ann' }}>
      <Consumer />
      <button onClick={() => setN(n + 1)}>+</button>
    </Ctx.Provider>
  );
}
\`\`\`
`,
      options: [
        'Так — value щоразу новий об\'єкт',
        'Ні — React.memo блокує будь-які перерендери',
        'Ні — дані ті самі, а React порівнює їх глибоко',
        'Лише якщо Consumer отримує власні props'
      ],
      answer: 0,
      why: [
        'Так: контекст порівнюється через Object.is, а літерал створює новий об\'єкт.',
        'Ні: memo порівнює props, а зміна контексту перерендерює споживача незалежно від memo.',
        'Ні: порівняння поверхневе, за посиланням.',
        'Ні: props тут взагалі немає.'
      ],
      hint: 'Як React порівнює значення контексту?',
      explanation: 'Перевірено на React 19. Рішення: `const value = useMemo(() => ({ user }), [user])`, винесення статичного значення за межі компонента, розділення контекстів. React Compiler (стабільна версія з 2025 р.) робить таку мемоізацію автоматично.'
    },
    // ---------------------------------------------------------------- custom hooks
    {
      id: 'rh-use-local-storage', group: 'custom-hooks', type: 'dom', runtime: 'react', level: 3,
      title: 'Власний хук useLocalStorage',
      description: `
**Завдання.** Напишіть хук \`useLocalStorage(key, initialValue)\` → \`[value, setValue]\`:
- початкове значення — з \`localStorage\` (JSON), якщо там є валідний запис; інакше \`initialValue\`;
- читання сховища — **лише на першому рендері** (лінива ініціалізація);
- \`setValue(v)\` оновлює стан і записує \`JSON.stringify(v)\` у сховище;
- зіпсований JSON у сховищі → \`initialValue\` (без падіння).

**Де трапляється:** збереження фільтрів, чернеток і налаштувань між перезавантаженнями; класичний власний хук на співбесідах.

Компонент \`NoteEditor\` (вже написаний) використовує хук.

**Аналогія:** обгортка над Storage з модуля «Browser API» + стан React. Власний хук — функція, що викликає інші хуки (назва з \`use\`).
`,
      html: HTML, css: CSS,
      js: `import { useState } from 'react';

function useLocalStorage(key, initialValue) {
  // TODO: useState з функцією-ініціалізатором; setValue, що пише в localStorage
  return [initialValue, () => {}];
}

function NoteEditor() {
  const [note, setNote] = useLocalStorage('note', '');
  return <textarea value={note} onChange={(e) => setNote(e.target.value)} />;
}

function App() {
  return <NoteEditor />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState } from 'react';

function useLocalStorage(key, initialValue) {
  const [value, setStored] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initialValue : JSON.parse(raw);
    } catch (e) {
      return initialValue;
    }
  });

  function setValue(next) {
    setStored(next);
    localStorage.setItem(key, JSON.stringify(next));
  }

  return [value, setValue];
}

function NoteEditor() {
  const [note, setNote] = useLocalStorage('note', '');
  return <textarea value={note} onChange={(e) => setNote(e.target.value)} />;
}

function App() {
  return <NoteEditor />;
}
` },
      hints: ['`useState(() => { ... })` — функція викликається лише на першому рендері.', 'Читання в `try/catch` (JSON.parse може кинути); `setValue` пише `JSON.stringify(next)`.'],
      tests: [
        { name: 'читає збережене значення', code: "localStorage.clear();\nlocalStorage.setItem('note', JSON.stringify('збережено'));\nconst m = mount(NoteEditor);\nexpect(m.container.querySelector('textarea').value).toBe('збережено');" },
        { name: 'записує зміни', code: "localStorage.clear();\nconst m = mount(NoteEditor);\nawait act(() => typeInto(m.container.querySelector('textarea'), 'привіт'));\nexpect(JSON.parse(localStorage.getItem('note'))).toBe('привіт');" },
        { name: 'зіпсований JSON і об\'єкти', code: "localStorage.clear();\nlocalStorage.setItem('cfg', '{oops');\nfunction Cfg() { const [cfg, setCfg] = useLocalStorage('cfg', { dark: false }); return React.createElement('button', { onClick: () => setCfg({ dark: !cfg.dark }) }, String(cfg.dark)); }\nconst m = mount(Cfg);\nexpect(m.container.textContent).toBe('false');\nawait act(() => click(m.container.querySelector('button')));\nexpect(JSON.parse(localStorage.getItem('cfg'))).toEqual({ dark: true });" }
      ],
      explanation: 'Власні хуки виносять **логіку зі станом** (а не стан!): кожен компонент, що викликає `useLocalStorage`, має власний стан. Продакшен-версія ще синхронізується між вкладками через подію `storage`, підтримує функціональні оновлення і SSR (на сервері `localStorage` немає).'
    },
    {
      id: 'rh-use-debounced', group: 'custom-hooks', type: 'dom', runtime: 'react', level: 3, interview: true,
      title: 'Хук useDebouncedValue',
      description: `
**Завдання.** Напишіть \`useDebouncedValue(value, delay)\`: повертає значення, яке оновлюється лише після того, як \`value\` не змінювалось \`delay\` мс.

**Де трапляється:** живий пошук і автокомпліт: запит лише після паузи у введенні. Один з найчастіших власних хуків на співбесідах.

Компонент \`Search\` (вже є) показує \`Шукаю: …\` для затриманого значення.

**Аналогія:** \`debounce\` з модуля Live coding, але в «реактивному» вигляді: таймер у ефекті, cleanup скасовує попередній таймер при кожній зміні.
`,
      html: HTML, css: CSS,
      js: `import { useState, useEffect } from 'react';

function useDebouncedValue(value, delay) {
  // TODO
  return value;
}

function Search() {
  const [text, setText] = useState('');
  const debounced = useDebouncedValue(text, 300);
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <p>Шукаю: {debounced}</p>
    </div>
  );
}

function App() {
  return <Search />;
}
`,
      editable: ['js'],
      solution: { js: `import { useState, useEffect } from 'react';

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function Search() {
  const [text, setText] = useState('');
  const debounced = useDebouncedValue(text, 300);
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <p>Шукаю: {debounced}</p>
    </div>
  );
}

function App() {
  return <Search />;
}
` },
      hints: ['Окремий стан `debounced`, ефект з `setTimeout(() => setDebounced(value), delay)`.', 'Cleanup `clearTimeout` — кожна нова зміна скасовує попередній таймер.'],
      tests: [
        { name: 'оновлюється після паузи', code: "useFakeTimers();\nconst m = mount(Search);\nconst field = m.container.querySelector('input');\nawait act(() => typeInto(field, 're'));\nawait act(() => advanceTimersByTime(100));\nawait act(() => typeInto(field, 'react'));\nawait act(() => advanceTimersByTime(299));\nexpect(m.container.querySelector('p').textContent).toBe('Шукаю: ');\nawait act(() => advanceTimersByTime(1));\nexpect(m.container.querySelector('p').textContent).toBe('Шукаю: react');" },
        { name: 'таймери прибираються', code: "useFakeTimers();\nconst m = mount(Search);\nawait act(() => typeInto(m.container.querySelector('input'), 'a'));\nexpect(getTimerCount()).toBe(1);\nm.unmount();\nexpect(getTimerCount()).toBe(0);" }
      ],
      explanation: 'Різниця з `debounce(fn)`: тут затримується **значення**, а запит (ефект з `[debounced]`) вже реагує на нього — зручно для пошуку. Альтернатива для «важкого» UI без мережі — `useDeferredValue` (React сам відкладає рендер, без фіксованої затримки) — модуль «React глибше».'
    },
    // ---------------------------------------------------------------- closures & rules
    {
      id: 'rh-quiz-stale-interval', group: 'closures', type: 'quiz', level: 3, interview: true,
      title: 'Застаріле замикання в інтервалі',
      question: `
Що покаже компонент через 5 секунд?

\`\`\`jsx
function Timer() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN(n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <output>{n}</output>;
}
\`\`\`
`,
      options: ['`5`', '`1` — і далі не змінюється', '`0`', 'Нескінченний цикл рендерів'],
      answer: 1,
      why: [
        'Ні: колбек інтервалу бачить n з першого рендеру.',
        'Так: щосекунди виконується setN(0 + 1) — значення не змінюється.',
        'Ні: перший тік ставить 1.',
        'Ні: ефект з [] виконується один раз.'
      ],
      hint: 'Яке значення n «бачить» колбек, створений на першому рендері?',
      explanation: '**Stale closure** — колбек замкнув `n` першого рендеру (знімок). Рішення: функціональне оновлення `setN((x) => x + 1)`; або додати `n` у залежності (тоді інтервал перестворюється щосекунди); або `useRef` для актуального значення. Перевірено на React 19.'
    },
    {
      id: 'rh-quiz-lazy-init', group: 'closures', type: 'quiz', level: 2,
      title: 'useState(init()) чи useState(init)',
      question: 'Функція `init()` дорога (читає localStorage, парсить JSON). Чим відрізняється `useState(init())` від `useState(init)`?',
      options: [
        '`init()` — на кожному рендері, `init` — лише на першому',
        'Нічим: React кешує результат в обох випадках',
        '`useState(init)` збереже в стан саму функцію init',
        '`useState(init())` викликає init лише раз, а `useState(init)` — щоразу'
      ],
      answer: 0,
      why: [
        'Так: аргумент обчислюється при кожному виклику компонента; функцію React викликає сам один раз.',
        'Ні: для `init()` виклик відбувається до того, як React щось вирішить.',
        'Ні: передана функція — це ініціалізатор (для збереження функції пишуть `useState(() => fn)`).',
        'Ні: навпаки.'
      ],
      hint: 'Коли JavaScript обчислює аргументи функції?',
      explanation: 'Лінива ініціалізація — `useState(() => expensive())` — як у хуку `useLocalStorage`. Перевірено: з `useState(init())` функція викликається при кожному повторному рендері, з `useState(init)` — ні.'
    },
    {
      id: 'rh-rules-of-hooks', group: 'closures', type: 'theory', level: 2, interview: true,
      title: 'Правила хуків',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        'Хуки викликають лише на верхньому рівні компонента або іншого хука — не в умовах, циклах, вкладених функціях',
        'Хуки можна викликати у звичайних (не-React) функціях-утилітах',
        'Назва власного хука починається з `use` — за цим лінтер розпізнає хуки',
        'Ранній `return` до виклику хука — порушення правил',
        'Правила хуків — лише рекомендація стилю, на роботу не впливають'
      ],
      correct: [0, 2, 3],
      why: [
        'Так: стан прив\'язаний до порядку викликів.',
        'Ні: лише з компонентів і хуків.',
        'Так: і за цим розуміє, що функція може викликати хуки.',
        'Так: на одних рендерах хук викличеться, на інших — ні.',
        'Ні: порушення ламає відповідність станів (крок 5 міні-фреймворку).'
      ],
      hint: 'Що станеться, якщо на другому рендері один `useState` не викличеться?',
      answer: `
**Правила хуків** випливають з реалізації: стан компонента — масив комірок, хук ідентифікується **порядковим номером** виклику.

1. Лише на верхньому рівні: не в \`if\`, циклах, після раннього \`return\`, у вкладених функціях.
2. Лише з функцій-компонентів і власних хуків.
3. Власні хуки — \`useЩось\`.

**Інструменти:** \`eslint-plugin-react-hooks\` (\`rules-of-hooks\` і \`exhaustive-deps\`), React Compiler.

**Виняток:** \`use(promise | context)\` у React 19 можна викликати в умовах — він не зберігає стан у комірці.

**Аналогія з Vue:** \`setup()\` / \`<script setup>\` виконується **один раз**, реактивність відстежується Proxy — тому там немає правил порядку і застарілих замикань.
`,
      keyPoints: ['Лише верхній рівень', 'Лише в компонентах і хуках', 'Назва use…', 'Порядок викликів = ідентичність стану', 'use() — виняток у React 19']
    }
  ]
});
})();
