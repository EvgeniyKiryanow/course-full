FE.topic('architecture', {
  intro: `
**Архітектура застосунку** — рішення, які складно змінити пізніше: як рендеримо сторінки, де живе стан, як дані приходять із сервера і як інтерфейс лишається швидким. На співбесідах Strong Middle і Senior це окремий раунд — **frontend system design**: «спроєктуйте стрічку новин / автокомпліт / чат».

| Тема | Ключове |
|---|---|
| Рендеринг | **CSR** (браузер), **SSR** (сервер на кожен запит), **SSG** (на етапі збірки), **ISR** (статично + фонове оновлення), **гідратація** |
| Стан | серверний (кеш даних API), клієнтський UI-стан, стан в URL, стан форм |
| Дані | нормалізація (\`byId\` + \`allIds\`), похідний стан обчислюється, а не зберігається |
| UX | оптимістичні оновлення з відкатом, віртуалізація довгих списків |
| System design | метод **RADIO**: Requirements → Architecture → Data model → Interface → Optimizations |
`,
  groups: [
    { id: 'rendering', title: 'Стратегії рендерингу і гідратація' },
    { id: 'state', title: 'Стан застосунку і дані' },
    { id: 'ux-data', title: 'Оптимістичні оновлення і довгі списки' },
    { id: 'method', title: 'System design: метод' },
    { id: 'cases', title: 'System design: типові кейси' }
  ],
  items: [
    // ================================================================ 1. Рендеринг
    {
      id: 'arch-rendering-strategies', group: 'rendering', type: 'theory', level: 2, interview: true,
      title: 'CSR, SSR, SSG, ISR: що правда',
      question: 'Оберіть **усі** правильні твердження про стратегії рендерингу.',
      choices: [
        'CSR: сервер віддає майже порожній HTML, контент з\'являється після завантаження і виконання JS',
        'SSG: HTML генерується один раз під час збірки і може віддаватися з CDN',
        'SSR завжди швидший за CSR за всіма метриками, тому його варто брати для будь-якого застосунку',
        'ISR: статичні сторінки перегенеровуються у фоні після заданого інтервалу, без повної перезбірки сайту',
        'SSG підходить для сторінок, персоналізованих під кожного користувача (кошик, профіль)'
      ],
      correct: [0, 1, 3],
      why: [
        'Так: перший змістовний кадр чекає на бандл — гірше для LCP і SEO.',
        'Так: найдешевший і найшвидший варіант для сторінок, однакових для всіх.',
        'Ні: SSR навантажує сервер, збільшує TTFB і потребує гідратації — це компроміс.',
        'Так: модель stale-while-revalidate для сторінок.',
        'Ні: статичний HTML однаковий для всіх; персональне — SSR або CSR після завантаження.'
      ],
      hint: 'Для кожної стратегії спитайте: **коли** і **де** генерується HTML?',
      answer: `
| Стратегія | Де і коли генерується HTML | Сильні сторони | Слабкі сторони |
|---|---|---|---|
| **CSR** | у браузері, після завантаження JS | простий хостинг, швидкі переходи всередині SPA | порожній перший кадр, LCP і SEO залежать від JS |
| **SSR** | на сервері, **на кожен запит** | актуальний і персональний контент одразу в HTML, SEO | навантаження на сервер, TTFB, потрібна гідратація |
| **SSG** | на етапі **збірки** | CDN, мінімальний TTFB, дешево | дані «застигають» до наступної збірки |
| **ISR** | статично + **фонова перегенерація** за інтервалом | швидкість SSG + відносно свіжі дані | дані можуть бути застарілими до інтервалу |
| **Streaming SSR** | сервер віддає HTML **частинами** | швидкий перший байт і каркас, повільні блоки «доїжджають» | складніша інфраструктура |

**Як обирати:** однакові для всіх і рідко змінювані сторінки (блог, документація, лендинг) → SSG. Великий каталог з періодичними змінами → ISR. Персональний або дуже динамічний контент, важливе SEO → SSR. Кабінет за логіном, де SEO не потрібне → CSR.

Реальні застосунки **змішують** стратегії на рівні маршрутів: лендинг SSG, каталог ISR, кабінет CSR.
`,
      keyPoints: [
        'CSR — HTML будується в браузері після JS',
        'SSR — на кожен запит на сервері, потрібна гідратація',
        'SSG — під час збірки, CDN, найдешевше',
        'ISR — статика з фоновою перегенерацією',
        'Стратегію обирають для кожного маршруту окремо'
      ],
      followUps: ['Як SSR впливає на TTFB і LCP?', 'Чим SSR відрізняється від пре-рендерингу для ботів?']
    },
    {
      id: 'arch-pick-strategy', group: 'rendering', type: 'quiz', level: 2,
      title: 'Яку стратегію обрати для каталогу',
      question: 'Інтернет-магазин: **50 000** сторінок товарів, ціни й наявність змінюються **раз на годину**, сторінки однакові для всіх відвідувачів, важливі SEO і швидкий LCP. Що підходить найкраще?',
      options: [
        'CSR: завантажити дані товару через fetch після старту застосунку',
        'SSG: перезбирати весь сайт щогодини',
        'ISR: статичні сторінки з фоновою перегенерацією, наприклад, раз на 10–60 хвилин',
        'SSR без кешу для кожного запиту'
      ],
      answer: 2,
      why: [
        'Ні: порожній HTML шкодить SEO і LCP.',
        'Ні: перезбирати 50 000 сторінок щогодини довго і дорого.',
        'Так: швидкість статики з CDN + регулярне оновлення лише тих сторінок, які запитують.',
        'Ні: працює, але без кешу кожен запит навантажує сервер, хоча сторінка однакова для всіх.'
      ],
      hint: 'Сторінки однакові для всіх, але дані змінюються. Яка стратегія дає швидкість статики і свіжість?',
      explanation: 'ISR — це stale-while-revalidate для сторінок: відвідувач отримує готову сторінку з кешу, а після закінчення інтервалу сервер у фоні генерує нову версію. Альтернатива з тим самим ефектом — SSR + CDN-кешування з `Cache-Control: s-maxage=..., stale-while-revalidate=...`.'
    },
    {
      id: 'arch-hydration', group: 'rendering', type: 'theory', level: 3, interview: true,
      title: 'Гідратація і hydration mismatch',
      question: 'Оберіть **усі** правильні твердження про гідратацію.',
      choices: [
        'Гідратація — клієнтський JS «оживляє» готовий серверний HTML: підключає обробники подій і стан',
        'До завершення гідратації кнопки можуть виглядати готовими, але не реагувати на клік',
        'Виклик `new Date().toLocaleTimeString()` під час рендерингу може дати hydration mismatch',
        'Після SSR клієнтський JS не потрібен — гідратація відбувається на сервері',
        'Архітектура «островів» (islands) гідратує лише інтерактивні частини сторінки'
      ],
      correct: [0, 1, 2, 4],
      why: [
        'Так: компоненти виконуються ще раз на клієнті й «прив\'язуються» до наявного DOM.',
        'Так: HTML уже є, а обробників ще немає — це впливає на INP і сприйняття.',
        'Так: час і часовий пояс на сервері й клієнті різні — розмітка не збігається.',
        'Ні: гідратація завжди відбувається в браузері, і для неї потрібен JS.',
        'Так: статичні частини лишаються HTML без JS — менше роботи для браузера.'
      ],
      hint: 'Що має статися з HTML, згенерованим на сервері, щоб на ньому запрацював onClick?',
      answer: `
**Гідратація (hydration)** — клієнтський JS повторно виконує рендеринг компонентів і «прив'язує» результат до вже наявного серверного DOM: додає обробники подій і стан, не перестворюючи вузли.

**Ціна:** сторінка виглядає готовою, але до кінця гідратації не реагує (проблема для INP); весь JS компонентів однаково завантажується і виконується.

**Hydration mismatch** — клієнтський рендеринг дав іншу розмітку, ніж сервер. Причини:
- час, часові пояси, локаль: \`Date.now()\`, \`toLocaleString()\`;
- \`Math.random()\`, згенеровані id;
- гілки \`typeof window !== 'undefined'\` у рендерингу;
- невалідна вкладеність HTML (\`<div>\` усередині \`<p>\`): браузер виправляє DOM, і він уже не збігається.

**Рішення:** однакові дані на сервері й клієнті (серіалізований стан), рендеринг клієнтських значень **після** гідратації (ефект), стабільні id.

**Як зменшити ціну гідратації:**
- **islands** (Astro): гідратуються лише інтерактивні «острови»;
- **progressive/lazy hydration**: гідратувати при появі у viewport або при взаємодії;
- **Server Components**: частина компонентів узагалі не відправляє JS на клієнт;
- **resumability** (Qwik): стан серіалізується в HTML, і рендеринг на клієнті не повторюється.
`,
      keyPoints: [
        'Гідратація — підключення обробників і стану до серверного HTML',
        'До її завершення інтерфейс не реагує — ризик для INP',
        'Mismatch: час, random, window-гілки, невалідний HTML',
        'Islands, lazy hydration, Server Components зменшують обсяг JS'
      ],
      followUps: ['Як безпечно показати локальний час користувача в SSR-застосунку?']
    },
    {
      id: 'arch-streaming-ssr', group: 'rendering', type: 'quiz', level: 3,
      title: 'Що дає streaming SSR',
      question: 'Сторінка товару: шапка й опис готові миттєво, а блок «Рекомендації» залежить від повільного сервісу (2 с). Що змінить **streaming SSR** у порівнянні зі звичайним SSR?',
      options: [
        'Нічого не зміниться: сервер однаково дочекається всіх даних і лише потім відправить HTML',
        'Каркас і опис прийдуть одразу, рекомендації — пізніше в тій самій відповіді',
        'Рекомендації завантажаться в браузері окремим fetch-запитом після завершення гідратації',
        'Сторінка повністю перейде на клієнтський рендеринг (CSR) замість серверного'
      ],
      answer: 1,
      why: [
        'Ні: так працює звичайний SSR — тому TTFB дорівнює найповільнішому запиту.',
        'Так: HTML передається потоком частинами; повільний блок спершу показує заглушку.',
        'Ні: це клієнтське завантаження, а не стримінг серверного HTML.',
        'Ні: HTML і далі генерується на сервері.'
      ],
      hint: 'Чи обов\'язково чекати найповільніші дані, щоб почати відправляти HTML?',
      explanation: 'Звичайний SSR: TTFB = час найповільнішого запиту. **Streaming** (HTTP chunked transfer) віддає готові частини одразу, а повільні блоки — пізніше в тій самій відповіді, разом зі скриптом, що вставляє їх на місце заглушки. У React це `Suspense` + `renderToPipeableStream`.'
    },
    {
      id: 'arch-serialize-state', group: 'rendering', type: 'code', level: 3,
      title: 'Безпечна передача стану з SSR у браузер',
      description: `
**Завдання.** Напишіть \`renderStateScript(state)\`. Функція повертає рядок \`<script>window.__STATE__ = ...;</script>\` з JSON-станом, який сервер вбудовує в HTML. Тоді клієнт гідратується з тими самими даними.

**Де трапляється:** кожен SSR-застосунок передає дані на клієнт саме так. Наївне \`JSON.stringify\` — відома XSS-вразливість: якщо в даних є рядок \`</script>\`, браузер закриє тег і виконає код, який іде далі.

**Приклад**
\`\`\`js
renderStateScript({ user: 'Ann' });
// '<script>window.__STATE__ = {"user":"Ann"};</script>'

renderStateScript({ bio: '</script><script>alert(1)</script>' });
// усередині немає жодного '<' — лише \\u003c
\`\`\`

**Як це працює:** HTML-парсер не розуміє JS-рядки. Він шукає \`</script>\` буквально і не дивиться, чи стоїть ця послідовність у лапках. Escape-послідовність \`\\u003c\` — це той самий символ \`<\` для JS і JSON, але для HTML-парсера це не тег.

**Врахуйте:** після виконання скрипта \`window.__STATE__\` має точно дорівнювати вхідному стану.
`,
      starter: `function renderStateScript(state) {
  const json = JSON.stringify(state);
  // TODO: замініть кожен '<' на escape-послідовність \\u003c
  return '<script>window.__STATE__ = ' + json + ';</script>';
}
`,
      solution: `function renderStateScript(state) {
  const json = JSON.stringify(state).replace(/</g, '\\\\u003c');
  return '<script>window.__STATE__ = ' + json + ';</script>';
}
`,
      hints: ['`json.replace(/</g, ...)` — регулярний вираз з прапорцем `g` замінює всі входження.', 'Рядок заміни в JS-коді: `\'\\\\u003c\'` — два зворотні слеші, щоб у результаті був текст `\\u003c`.'],
      tests: [
        { name: 'звичайний стан', code: "expect(renderStateScript({ user: 'Ann' })).toBe('<script>window.__STATE__ = {\"user\":\"Ann\"};</script>');" },
        { name: 'не можна вийти з тегу script', code: "const html = renderStateScript({ bio: '</script><script>alert(1)</script>' });\nexpect(html.split('</script>').length - 1).toBe(1);\nexpect(html.slice(8, -9)).not.toContain('<');" },
        { name: 'дані відновлюються без змін', code: "const state = { bio: '</script><b>hi</b>', list: [1, '<!--'], n: null };\nconst html = renderStateScript(state);\nconst json = html.slice('<script>window.__STATE__ = '.length, -';</script>'.length);\nexpect(JSON.parse(json)).toEqual(state);" }
      ],
      explanation: '`\\u003c` — валідний escape і в JSON, і в JS, тому дані після парсингу ті самі, а HTML-парсер не бачить `</script>` чи `<!--`. Бібліотеки на кшталт `serialize-javascript` і `devalue` роблять те саме, а ще підтримують `Date`, `Map` та інші типи. Пов\'язана тема — CSP: інлайн-скрипт стану потребує `nonce`.'
    },
    // ================================================================ 2. Стан
    {
      id: 'arch-state-kinds', group: 'state', type: 'theory', level: 2, interview: true,
      title: 'Види стану: де що зберігати',
      question: 'Оберіть **усі** доречні рішення щодо того, де зберігати стан.',
      choices: [
        'Фільтри й сортування списку товарів — у URL (query-параметри)',
        'Дані з API (список замовлень) — у кеші серверного стану з ревалідацією, а не копіювати вручну в глобальний стор',
        'Чи відкрите випадаюче меню — у глобальному сторі, щоб усе було в одному місці',
        'Чернетку довгої форми — у локальному стані форми, за потреби з автозбереженням у localStorage',
        'Токен доступу — у localStorage, бо там його найзручніше читати з будь-якого скрипта'
      ],
      correct: [0, 1, 3],
      why: [
        'Так: посиланням можна поділитися, працюють «Назад» і перезавантаження сторінки.',
        'Так: серверний стан має власні проблеми — застарівання, дедуплікацію, ревалідацію.',
        'Ні: локальний UI-стан компонента в глобальному сторі — зайва зв\'язність і зайві перерендеринги.',
        'Так: стан форми локальний і тимчасовий, а автозбереження захищає від втрати.',
        'Ні: localStorage доступний будь-якому скрипту — XSS викраде токен; надійніше httpOnly-cookie.'
      ],
      hint: 'Розділіть стан за власником і часом життя: сервер, компонент, URL, форма, сесія.',
      answer: `
| Вид стану | Приклади | Де жити |
|---|---|---|
| **Серверний** (кеш даних) | списки, профіль, замовлення | кеш запитів з ревалідацією (TanStack Query, SWR, RTK Query або власний) |
| **URL-стан** | фільтри, сортування, сторінка, вкладка, id відкритого елемента | query-параметри та шлях |
| **Локальний UI** | відкрите меню, hover, значення інпуту | стан компонента |
| **Глобальний клієнтський** | тема, поточний користувач, кошик до оформлення | невеликий стор чи контекст |
| **Форма** | чернетка, помилки валідації | локально у формі, за потреби — автозбереження |

**Головна помилка** — тримати все в одному глобальному сторі й вручну копіювати туди відповіді API. Тоді доводиться вручну розв'язувати застарівання, повторні запити й стан завантаження — те, що спеціалізовані кеші серверного стану вже вміють.

**Правило:** зберігайте стан **якомога ближче** до місця використання і піднімайте вище лише тоді, коли він справді потрібен кільком частинам.
`,
      keyPoints: [
        'Серверний стан — це кеш із ревалідацією, а не «просто дані в сторі»',
        'URL — стан, яким можна поділитися і до якого можна повернутися',
        'Локальний UI-стан лишається в компоненті',
        'Стан — якомога ближче до місця використання',
        'Токени — не в localStorage'
      ],
      followUps: ['Чому дублювання серверних даних у Redux призводить до багів синхронізації?']
    },
    {
      id: 'arch-derived-state', group: 'state', type: 'quiz', level: 2,
      title: 'Похідний стан: зберігати чи обчислювати',
      question: `
У сторі кошика зберігають і товари, і загальну суму. Після видалення товару сума інколи неправильна. Як виправити це **архітектурно**?

\`\`\`js
const state = {
  items: [{ id: 1, price: 100, qty: 2 }],
  total: 200,
};
\`\`\`
`,
      options: [
        'Додати перевірку, яка після кожної дії перераховує `total` і порівнює зі збереженим',
        'Не зберігати `total`: обчислювати його з `items` функцією-селектором (за потреби з мемоізацією)',
        'Зберігати `total` у localStorage, щоб він не губився',
        'Оновлювати `total` у кожному місці, де змінюються `items`, і покрити це тестами'
      ],
      answer: 1,
      why: [
        'Ні: це латання наслідків — два джерела правди лишаються.',
        'Так: одне джерело правди, а `total` завжди узгоджений з `items`.',
        'Ні: місце зберігання не прибирає розсинхронізацію.',
        'Ні: кожна нова дія — новий шанс забути оновити `total`.'
      ],
      hint: 'Скільки джерел правди про суму зараз у стані?',
      explanation: '**Single source of truth:** зберігайте мінімальний стан, а все, що з нього виводиться (суми, відфільтровані списки, лічильники), обчислюйте селекторами. Дорогі обчислення мемоізують (`createSelector`, `computed`, `useMemo`). Похідний стан, збережений окремо, рано чи пізно розійдеться з першоджерелом.'
    },
    {
      id: 'arch-normalize', group: 'state', type: 'code', level: 2,
      title: 'Нормалізація: byId + allIds',
      description: `
**Завдання.** Напишіть \`normalizePosts(posts)\`: перетворює масив постів із вкладеними авторами на нормалізовану структуру.

**Де трапляється:** один автор приходить у сотнях постів. Якщо зберігати його копії, після зміни імені частина копій залишиться старою. Нормалізація зберігає кожну сутність **один раз**, а решта посилається на неї за \`id\`. Так влаштовані Redux Toolkit (\`createEntityAdapter\`), Apollo і Relay.

**Приклад**
\`\`\`js
normalizePosts([
  { id: 1, title: 'A', author: { id: 10, name: 'Ann' } },
  { id: 2, title: 'B', author: { id: 10, name: 'Ann' } },
]);
// {
//   users: { byId: { 10: { id: 10, name: 'Ann' } }, allIds: [10] },
//   posts: {
//     byId: { 1: { id: 1, title: 'A', authorId: 10 }, 2: { id: 2, title: 'B', authorId: 10 } },
//     allIds: [1, 2],
//   },
// }
\`\`\`

**Як це працює:** кожна сутність зберігається один раз у \`byId\`, а порядок — в \`allIds\`; зв'язки — це id замість вкладених копій. Оновлення запису змінює одне місце, а пошук за id — O(1) замість обходу масиву. Так зберігають дані \`createEntityAdapter\` у Redux Toolkit і кеш Apollo.

**Врахуйте:** \`allIds\` зберігає порядок першої появи; кожен автор — лише один раз; вхідні дані не змінювати.
`,
      starter: `function normalizePosts(posts) {
  const users = { byId: {}, allIds: [] };
  const normalizedPosts = { byId: {}, allIds: [] };

  for (const post of posts) {
    // 1. Автор: додати, якщо його ще немає в users.byId
    // 2. Пост: усі поля, крім author, + authorId
  }

  return { users, posts: normalizedPosts };
}
`,
      solution: `function normalizePosts(posts) {
  const users = { byId: {}, allIds: [] };
  const normalizedPosts = { byId: {}, allIds: [] };

  for (const post of posts) {
    const { author, ...rest } = post;
    if (!(author.id in users.byId)) {
      users.byId[author.id] = { ...author };
      users.allIds.push(author.id);
    }
    normalizedPosts.byId[post.id] = { ...rest, authorId: author.id };
    normalizedPosts.allIds.push(post.id);
  }

  return { users, posts: normalizedPosts };
}
`,
      hints: ['`const { author, ...rest } = post;` відділяє автора від решти полів.', 'Перевірка наявності: `author.id in users.byId`. Пост: `{ ...rest, authorId: author.id }`.'],
      tests: [
        { name: 'приклад з умови', code: "expect(normalizePosts([{ id: 1, title: 'A', author: { id: 10, name: 'Ann' } }, { id: 2, title: 'B', author: { id: 10, name: 'Ann' } }])).toEqual({ users: { byId: { 10: { id: 10, name: 'Ann' } }, allIds: [10] }, posts: { byId: { 1: { id: 1, title: 'A', authorId: 10 }, 2: { id: 2, title: 'B', authorId: 10 } }, allIds: [1, 2] } });" },
        { name: 'порядок першої появи авторів', code: "const r = normalizePosts([{ id: 1, author: { id: 'b' } }, { id: 2, author: { id: 'a' } }, { id: 3, author: { id: 'b' } }]);\nexpect(r.users.allIds).toEqual(['b', 'a']);\nexpect(r.posts.allIds).toEqual([1, 2, 3]);" },
        { name: 'вхідні дані не змінюються', code: "const input = [{ id: 1, title: 'A', author: { id: 10, name: 'Ann' } }];\nconst copy = JSON.parse(JSON.stringify(input));\nconst r = normalizePosts(input);\nexpect(input).toEqual(copy);\nr.users.byId[10].name = 'X';\nexpect(input[0].author.name).toBe('Ann');" },
        { name: 'порожній масив', code: "expect(normalizePosts([])).toEqual({ users: { byId: {}, allIds: [] }, posts: { byId: {}, allIds: [] } });" }
      ],
      explanation: 'Після нормалізації оновлення автора — одна операція `users.byId[id] = ...`, і зміна з\'являється в усіх постах. Читання — через селектори: `posts.allIds.map((id) => ({ ...posts.byId[id], author: users.byId[posts.byId[id].authorId] }))`. `allIds` потрібен, бо `byId` не зберігає порядок надходження: ключі-числа JavaScript завжди впорядковує за зростанням.'
    },
    // ================================================================ 3. Оптимістичні оновлення і довгі списки
    {
      id: 'arch-optimistic-quiz', group: 'ux-data', type: 'quiz', level: 2,
      title: 'Коли оптимістичне оновлення доречне',
      question: 'Для якої дії **оптимістичне оновлення** (показати результат до відповіді сервера) найменш доречне?',
      options: ['Лайк поста', 'Позначити задачу виконаною', 'Оплата замовлення карткою', 'Перейменування папки'],
      answer: 2,
      why: [
        'Доречне: дія майже завжди успішна, відкат непомітний і безпечний.',
        'Доречне: дешевий відкат, якщо сервер поверне помилку.',
        'Так, тут не підходить: результат залежить від банку, а хибне «Оплачено» — серйозна проблема. Потрібен явний стан очікування.',
        'Доречне: зазвичай успішне, відкат зрозумілий користувачеві.'
      ],
      hint: 'Наскільки ймовірна помилка і наскільки дорого користувачу побачити хибний успіх?',
      explanation: 'Оптимістичне оновлення — ставка на успіх: інтерфейс реагує миттєво, а при помилці зміну відкочують і показують повідомлення. Воно доречне для частих, майже завжди успішних і легко зворотних дій. Не підходить там, де результат невизначений або хибний успіх дорогий: платежі, бронювання, незворотні дії.'
    },
    {
      id: 'arch-optimistic-store', group: 'ux-data', type: 'code', level: 3,
      title: 'Оптимістичне оновлення з точковим відкатом',
      description: `
**Завдання.** Напишіть \`createTodoStore(todos, api)\`:
- \`getState()\` → \`{ todos, error }\` (\`error\` спочатку \`null\`);
- \`subscribe(listener)\` → функція відписки; \`listener\` викликається після **кожної** зміни стану;
- \`toggle(id)\` → \`Promise<boolean>\`:
  1. **одразу** (синхронно) перемикає \`done\` у стані — оптимістично;
  2. викликає \`api.updateTodo(id, { done: нове })\`;
  3. успіх → \`true\`; помилка → **відкат лише цієї задачі**, \`error = err.message\`, результат \`false\`.

Стан оновлюється **іммутабельно**: нові масив і об'єкт задачі, старий знімок не змінюється.

**Де трапляється:** лайки, чекбокси, перейменування — інтерфейс реагує миттєво. Так працюють \`onMutate\`/\`onError\` у TanStack Query і \`useOptimistic\` у React.

**Як це працює:** інтерфейс змінюється одразу, а попереднє значення запам'ятовується до відповіді сервера. При помилці відкочують лише цю зміну, не чіпаючи інших, що встигли статися за цей час, — тому відкат точковий, а не «повернути весь знімок стану».

**Врахуйте:** поки запит по задачі 1 у дорозі, користувач може успішно перемкнути задачу 2. Відкат «усього стану до знімка» скасував би і зміну задачі 2.
`,
      starter: `function createTodoStore(todos, api) {
  let state = { todos, error: null };
  const listeners = new Set();

  function setState(next) {
    state = next;
    listeners.forEach((l) => l(state));
  }

  function setDone(id, done) {
    // TODO: новий масив, де лише задача з id має новий done
  }

  return {
    getState: () => state,
    subscribe(listener) {
      // TODO
    },
    async toggle(id) {
      // 1. Оптимістично перемкнути (до першого await!)
      // 2. try { await api.updateTodo(...) } catch → відкат лише цієї задачі + error
    },
  };
}
`,
      solution: `function createTodoStore(todos, api) {
  let state = { todos, error: null };
  const listeners = new Set();

  function setState(next) {
    state = next;
    listeners.forEach((l) => l(state));
  }

  function setDone(id, done) {
    setState({
      ...state,
      todos: state.todos.map((t) => (t.id === id ? { ...t, done } : t)),
    });
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async toggle(id) {
      const todo = state.todos.find((t) => t.id === id);
      if (!todo) return false;
      const next = !todo.done;
      setDone(id, next);
      try {
        await api.updateTodo(id, { done: next });
        return true;
      } catch (err) {
        setDone(id, !next);
        setState({ ...state, error: err.message });
        return false;
      }
    },
  };
}
`,
      hints: ['Усе до першого `await` в async-функції виконується синхронно — оптимістичну зміну робіть саме там.', 'Відкат: змініть `done` лише задачі `id` у **поточному** стані, а не відновлюйте збережений знімок усього стану.'],
      tests: [
        { name: 'оптимістично: стан змінюється до відповіді сервера', code: "const api = { updateTodo: mockFn(() => new Promise(() => {})) };\nconst s = createTodoStore([{ id: 1, done: false }], api);\ns.toggle(1);\nexpect(s.getState().todos[0].done).toBe(true);\nexpect(api.updateTodo).toHaveBeenCalledWith(1, { done: true });" },
        { name: 'помилка: відкат і error', code: "const api = { updateTodo: mockFn(() => Promise.reject(new Error('500'))) };\nconst s = createTodoStore([{ id: 1, done: false }], api);\nexpect(await s.toggle(1)).toBe(false);\nexpect(s.getState().todos[0].done).toBe(false);\nexpect(s.getState().error).toBe('500');" },
        { name: 'відкат не скасовує успішну зміну іншої задачі', code: "let fail1;\nconst api = { updateTodo: mockFn((id) => id === 1 ? new Promise((_, rej) => { fail1 = rej; }) : Promise.resolve()) };\nconst s = createTodoStore([{ id: 1, done: false }, { id: 2, done: false }], api);\nconst p1 = s.toggle(1);\nexpect(await s.toggle(2)).toBe(true);\nfail1(new Error('timeout'));\nexpect(await p1).toBe(false);\nexpect(s.getState().todos).toEqual([{ id: 1, done: false }, { id: 2, done: true }]);" },
        { name: 'іммутабельність і підписка', code: "const api = { updateTodo: mockFn(() => Promise.resolve()) };\nconst s = createTodoStore([{ id: 1, done: false }], api);\nconst before = s.getState();\nconst listener = mockFn();\nconst off = s.subscribe(listener);\nawait s.toggle(1);\nexpect(before.todos[0].done).toBe(false);\nexpect(s.getState().todos).not.toBe(before.todos);\nexpect(listener).toHaveBeenCalled();\noff();\nawait s.toggle(1);\nexpect(listener).toHaveBeenCalledTimes(1);" }
      ],
      explanation: 'Три ідеї рівня Strong Middle: (1) оптимістична зміна виконується **синхронно** до `await`, тому UI реагує в тому самому кадрі; (2) відкат **точковий**, від поточного стану, а не від знімка, — інакше паралельні дії затирають одна одну; (3) **іммутабельні** оновлення дають змогу порівнювати посилання (`prev !== next`), на цьому побудовані React, Redux і селектори. Для ще надійнішого варіанту відкат враховує версію запиту: якщо після помилкового запиту по тій самій задачі вже пішов новий, відкат не потрібен.'
    },
    {
      id: 'arch-variable-heights', group: 'ux-data', type: 'code', level: 3,
      title: 'Віртуалізація з різною висотою рядків: префіксні суми і бінарний пошук',
      tags: ['virtualization', 'binary-search', 'performance'],
      description: `
**Завдання.** Напишіть \`createVariableList(heights)\` для віртуального списку, де рядки мають **різну** висоту.

**Де трапляється:** чати, стрічки новин, коментарі, таблиці з переносом тексту — висота кожного рядка своя (TanStack Virtual, react-virtuoso, \`vue-virtual-scroller\` з динамічними розмірами). Формула \`Math.floor(scrollTop / itemHeight)\` з модуля «Продуктивність» працює лише для однакових рядків.

**Що написати**
- \`createVariableList(heights)\` → \`{ totalHeight, offsetOf(i), indexAt(y), range(scrollTop, viewportHeight, overscan = 0) }\`:
  - \`totalHeight\` — сума висот;
  - \`offsetOf(i)\` — відступ рядка \`i\` від верху списку (\`offsetOf(0) === 0\`);
  - \`indexAt(y)\` — індекс рядка, що містить піксель \`y\`, за **O(log n)**; \`y < 0\` → \`0\`, \`y >= totalHeight\` → останній індекс;
  - \`range(...)\` → \`{ start, end, offsetY }\`: \`start\` — перший видимий рядок мінус \`overscan\` (не менше 0), \`end\` — індекс **після** останнього видимого плюс \`overscan\` (не більше довжини), \`offsetY = offsetOf(start)\`; \`viewportHeight > 0\`;
  - порожній список → \`totalHeight\` 0, \`range\` → \`{ start: 0, end: 0, offsetY: 0 }\`.

**Приклад**
\`\`\`js
const list = createVariableList([40, 80, 40, 120, 40]);
list.totalHeight;      // 320
list.offsetOf(3);      // 160 (40 + 80 + 40)
list.indexAt(130);     // 2 — третій рядок займає 120…159
list.range(100, 100);  // { start: 1, end: 4, offsetY: 40 } — видно пікселі 100…199, тобто рядки 1–3
\`\`\`

**Як це працює:** префіксні суми: \`offsets[i]\` — сума висот усіх рядків до \`i\`, рахується один раз за O(n). Масив зростає, тож рядок для пікселя \`y\` шукають **бінарним пошуком**: беруть середину діапазону і відкидають половину, де відповіді бути не може. 100 000 рядків — 17 кроків замість 100 000 на кожен кадр прокрутки.

**Врахуйте:** рядок нульової висоти (прихований) не містить жодного пікселя — \`indexAt\` має повертати наступний за ним рядок.
`,
      starter: `function createVariableList(heights) {
  // 1. Префіксні суми: offsets[0] = 0, offsets[i + 1] = offsets[i] + heights[i]
  // 2. totalHeight = offsets[n]; offsetOf(i) = offsets[i]
  // 3. indexAt(y): бінарний пошук найбільшого i < n, для якого offsets[i] <= y
  //    (y < 0 → 0, y >= totalHeight → n - 1)
  // 4. range: first = indexAt(scrollTop), last = indexAt(scrollTop + viewportHeight - 1),
  //    далі overscan і межі через Math.max / Math.min
  // TODO
}

// Спробуйте в консолі:
// createVariableList([40, 80, 40]).indexAt(100); // 1
`,
      solution: `function createVariableList(heights) {
  const n = heights.length;
  const offsets = [0];
  for (const h of heights) offsets.push(offsets[offsets.length - 1] + h);
  const totalHeight = offsets[n];

  function offsetOf(i) {
    return offsets[i];
  }

  // Найбільший i < n, для якого offsets[i] <= y: рядки нульової висоти пропускаються самі.
  function indexAt(y) {
    if (n === 0 || y < 0) return 0;
    if (y >= totalHeight) return n - 1;
    let lo = 0;
    let hi = n - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (offsets[mid] <= y) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }

  function range(scrollTop, viewportHeight, overscan = 0) {
    if (n === 0) return { start: 0, end: 0, offsetY: 0 };
    const first = indexAt(scrollTop);
    const last = indexAt(scrollTop + viewportHeight - 1);
    const start = Math.max(0, first - overscan);
    const end = Math.min(n, last + 1 + overscan);
    return { start, end, offsetY: offsets[start] };
  }

  return { totalHeight, offsetOf, indexAt, range };
}
`,
      hints: [
        'Порахуйте `offsets` довжиною n + 1: `offsets[0] = 0`, `offsets[i + 1] = offsets[i] + heights[i]`. Тоді `offsetOf` і `totalHeight` — просто читання масиву.',
        '`indexAt` — бінарний пошук найбільшого `i` (< n), для якого `offsets[i] <= y`: `mid = Math.ceil((lo + hi) / 2)`; якщо `offsets[mid] <= y` — `lo = mid`, інакше `hi = mid - 1`.',
        '`range`: `first = indexAt(scrollTop)`, `last = indexAt(scrollTop + viewportHeight - 1)`; далі `Math.max(0, first - overscan)` і `Math.min(n, last + 1 + overscan)`.'
      ],
      tests: [
        { name: 'totalHeight і offsetOf', code: 'const list = createVariableList([40, 80, 40, 120, 40]);\nexpect(list.totalHeight).toBe(320);\nexpect([0, 1, 2, 3, 4].map(list.offsetOf)).toEqual([0, 40, 120, 160, 280]);' },
        { name: 'indexAt на межах рядків', code: 'const list = createVariableList([40, 80, 40, 120, 40]);\nexpect([0, 39, 40, 119, 120, 130, 160, 319].map(list.indexAt)).toEqual([0, 0, 1, 1, 2, 2, 3, 4]);\nexpect(list.indexAt(-5)).toBe(0);\nexpect(list.indexAt(1000)).toBe(4);' },
        { name: 'range, overscan і межі', code: 'const list = createVariableList([40, 80, 40, 120, 40]);\nexpect(list.range(100, 100)).toEqual({ start: 1, end: 4, offsetY: 40 });\nexpect(list.range(100, 100, 1)).toEqual({ start: 0, end: 5, offsetY: 0 });\nexpect(list.range(0, 50)).toEqual({ start: 0, end: 2, offsetY: 0 });\nexpect(list.range(300, 100)).toEqual({ start: 4, end: 5, offsetY: 280 });' },
        { name: 'рядки нульової висоти і порожній список', code: 'const list = createVariableList([40, 0, 40]);\nexpect(list.indexAt(40)).toBe(2);\nexpect(list.indexAt(39)).toBe(0);\nconst empty = createVariableList([]);\nexpect(empty.totalHeight).toBe(0);\nexpect(empty.range(0, 100)).toEqual({ start: 0, end: 0, offsetY: 0 });' },
        { name: 'indexAt — O(log n): 200 000 рядків', code: 'const list = createVariableList(Array.from({ length: 200000 }, (_, i) => 20 + (i % 5) * 10));\nconst t = performance.now();\nlet sum = 0;\nfor (let k = 0; k < 20000; k++) sum += list.indexAt(k * 300);\nexpect(performance.now() - t).toBeLessThan(300);\nexpect(list.indexAt(list.totalHeight - 1)).toBe(199999);' }
      ],
      explanation: `
Два прийоми: префіксні суми (O(n) один раз, потім O(1) на відступ) і бінарний пошук по зростаючому масиву (O(log n) на кадр прокрутки). Так влаштовані бібліотеки віртуалізації з динамічними розмірами.

**Типові помилки:** лінійний пошук від нуля на кожен scroll (на 100 000 рядків — підвисання); \`end\` без +1 (останній частково видимий рядок не рендериться); забути \`offsetY\` — тоді видимі рядки «стрибають» угору.

**Що спитають далі:** висоти невідомі до рендеру — оцінка (\`estimateSize\`), вимірювання через \`ResizeObserver\` і оновлення сум (дерево Фенвіка дає O(log n) і на оновлення); як зберегти позицію прокрутки, коли в чат зверху підвантажуються старі повідомлення; що віртуалізація ламає (Ctrl+F, якорі, a11y — квіз нижче).
`
    },
    {
      id: 'arch-virtual-tradeoffs', group: 'ux-data', type: 'quiz', level: 3,
      title: 'Ціна віртуалізації',
      question: 'Яка проблема **реально** з\'являється після віртуалізації довгого списку?',
      options: [
        'Кількість DOM-вузлів на сторінці збільшується через службові контейнери',
        'Ctrl+F не знаходить рядки, яких зараз немає в DOM',
        'Список перестає підтримувати прокрутку колесом миші та жестами тачпада',
        'Зображення в рядках більше не можна завантажувати ліниво через loading="lazy"'
      ],
      answer: 1,
      why: [
        'Ні: навпаки, вузлів стає набагато менше — у цьому й мета.',
        'Так: невідрендерених рядків немає в DOM — ні для Ctrl+F, ні для скрінрідера.',
        'Ні: прокрутка звичайна, змінюється лише набір відрендерених рядків.',
        'Ні: lazy loading працює так само.'
      ],
      hint: 'Чого не може знайти браузер, якщо цього немає в DOM?',
      explanation: 'Компроміси віртуалізації: Ctrl+F і якорі не бачать невідрендерені рядки, скрінрідер не знає загальної кількості (потрібні `aria-setsize`/`aria-posinset` або `aria-rowcount`), складніші рядки змінної висоти. Альтернатива для помірних списків — CSS `content-visibility: auto`: вузли лишаються в DOM, але браузер пропускає їх рендеринг поза екраном.'
    },
    // ================================================================ 4. Метод
    {
      id: 'arch-radio', group: 'method', type: 'theory', level: 2, interview: true,
      title: 'Як проходити frontend system design: RADIO',
      question: 'Співбесіда: «Спроєктуйте стрічку новин». Що з переліченого — **правильні** кроки на початку і в процесі? Оберіть **усі**.',
      choices: [
        'Уточнити вимоги: основні функції, пристрої, обсяг даних, офлайн, реальний час, доступність',
        'Одразу назвати фреймворк і почати писати код компонентів',
        'Намалювати компоненти верхнього рівня і потік даних між ними, сервером і клієнтським сховищем',
        'Визначити модель даних на клієнті та API: формат відповіді, пагінацію, обробку помилок',
        'Говорити лише про бекенд і базу даних — це ж system design'
      ],
      correct: [0, 2, 3],
      why: [
        'Так: без уточнення вимог дизайн розв\'язує не ту задачу.',
        'Ні: вибір інструментів — наслідок вимог, а код на цьому раунді вторинний.',
        'Так: архітектура верхнього рівня — основа подальшої розмови.',
        'Так: модель даних і контракт API визначають решту рішень.',
        'Ні: на frontend-раунді фокус на клієнті; бекенд — лише як API-контракт.'
      ],
      hint: 'Яким має бути порядок: що будуємо → з чого складається → які дані → як компоненти спілкуються → як зробити добре?',
      answer: `
**RADIO** — поширена структура відповіді на frontend system design:

| Крок | Що робимо | Час |
|---|---|---|
| **R**equirements | функціональні вимоги (що вміє) і нефункціональні (швидкість, пристрої, офлайн, a11y, i18n, обсяг даних) | ~10% |
| **A**rchitecture | компоненти верхнього рівня, потік даних, де стан, де рендеринг (CSR/SSR) | ~10–15% |
| **D**ata model | сутності на клієнті, нормалізація, що в кеші серверного стану, а що — UI-стан | ~10% |
| **I**nterface | API: ендпоінти чи GraphQL, формат, **пагінація**, помилки, real-time; API між компонентами | ~15% |
| **O**ptimizations | продуктивність (віртуалізація, lazy, кеш), UX (оптимістичність, скелетони), a11y, безпека, i18n, офлайн | ~40–50% |

**Що оцінює інтерв'юер:** чи ви уточнюєте вимоги, чи бачите **trade-offs** (і пояснюєте вибір), чи знаєте глибину браузера (рендеринг, мережа, доступність, безпека), а не лише фреймворк.

**Типові кейси:** стрічка новин, автокомпліт, чат, галерея або каруселька, Google Docs-подібний редактор, дашборд з таблицею, форма-майстер, e-commerce (каталог, кошик, оформлення).
`,
      keyPoints: [
        'Requirements → Architecture → Data model → Interface → Optimizations',
        'Спершу уточнити функціональні й нефункціональні вимоги',
        'Модель даних і API (пагінація, помилки, real-time) — ядро розмови',
        'Найбільше часу — оптимізації і trade-offs',
        'Фокус — клієнт, бекенд лише як контракт'
      ],
      followUps: ['Які нефункціональні вимоги ви уточните для стрічки новин?', 'Як ви обґрунтуєте вибір cursor-пагінації замість offset?']
    },
    {
      id: 'arch-nfr', group: 'method', type: 'quiz', level: 2,
      title: 'Функціональні vs нефункціональні вимоги',
      question: 'Яка з вимог — **нефункціональна**?',
      options: [
        'Користувач може додати коментар під будь-яким постом у стрічці',
        'Плавна прокрутка (60 fps) на бюджетних Android',
        'До поста можна прикріпити до 10 фотографій або одне відео',
        'Пости в стрічці можна фільтрувати за автором і датою публікації'
      ],
      answer: 1,
      why: [
        'Ні: це функція — що система вміє.',
        'Так: це якість роботи — продуктивність на певних пристроях.',
        'Ні: це функціональне обмеження можливості.',
        'Ні: це функція фільтрації.'
      ],
      hint: 'Функціональні — **що** система робить. Нефункціональні — **як добре** вона це робить.',
      explanation: 'Нефункціональні вимоги: продуктивність (LCP, INP, fps), підтримувані пристрої й мережі, доступність (WCAG), локалізація, офлайн, безпека, масштаб (кількість елементів, користувачів). Саме вони визначають більшість архітектурних рішень — віртуалізацію, SSR, кешування, Service Worker.'
    },
    {
      id: 'arch-pagination-choice', group: 'method', type: 'quiz', level: 3,
      title: 'Пагінація для стрічки в реальному часі',
      question: 'Стрічка, у яку постійно додаються нові пости зверху, з нескінченною прокруткою. Яку пагінацію обрати для API?',
      options: [
        'Offset: `?offset=20&limit=20` — найпростіше й підтримує перехід на будь-яку сторінку',
        'Cursor: `?after=<id останнього>&limit=20` — стабільна при додаванні нових записів',
        'Завантажувати весь список одним запитом і показувати частинами',
        'Номери сторінок `?page=2` — так легше кешувати'
      ],
      answer: 1,
      why: [
        'Ні: нові пости зверху зсувають offset — з\'являються дублікати або пропуски.',
        'Так: курсор вказує на конкретний запис, а не на позицію, тому вставки не зсувають сторінки.',
        'Ні: не масштабується — повільний перший запит і зайві дані.',
        'Ні: це той самий offset з тими самими дублікатами.'
      ],
      hint: 'Що станеться з `offset=20`, якщо між запитами зверху додали 3 пости?',
      explanation: 'Offset доречний для таблиць з переходом на сторінку N і відносно статичних даних. Для стрічок, чатів і нескінченної прокрутки — **cursor** (за id або часом створення): стабільний при вставках, а на сервері ефективний (запит за індексом замість пропуску N рядків).'
    },
    // ================================================================ 5. Кейси
    {
      id: 'arch-case-feed', group: 'cases', type: 'theory', level: 3, interview: true,
      title: 'Кейс: стрічка новин',
      question: 'Ви проєктуєте стрічку новин (як у соцмережі). Які рішення **правильні**? Оберіть **усі**.',
      choices: [
        'Cursor-пагінація + IntersectionObserver на sentinel-елементі для довантаження',
        'Віртуалізація або `content-visibility` для довгої стрічки',
        'Оптимістичний лайк з відкатом при помилці',
        'Опитування сервера кожні 100 мс, щоб нові пости з\'являлися миттєво',
        'Вставляти нові пости зверху автоматично, навіть якщо користувач читає середину стрічки'
      ],
      correct: [0, 1, 2],
      why: [
        'Так: стабільні сторінки і довантаження без обробника scroll.',
        'Так: тисячі постів у DOM гальмують прокрутку і з\'їдають пам\'ять.',
        'Так: лайк — частий, майже завжди успішний і легко зворотний.',
        'Ні: величезне навантаження; для нових постів — SSE/WebSocket або рідке опитування.',
        'Ні: контент «стрибає» під користувачем (CLS); краще кнопка «N нових постів».'
      ],
      hint: 'Пройдіться за RADIO: дані і пагінація → рендеринг довгого списку → взаємодії → real-time → UX.',
      answer: `
**Requirements:** перегляд стрічки, довантаження, лайки й коментарі, нові пости в реальному часі; мобільні пристрої, повільні мережі, доступність.

**Architecture:** \`Feed\` → \`PostList\` (віртуалізований) → \`Post\` (\`Media\`, \`Actions\`, \`Comments\`); кеш серверного стану; канал real-time.

**Data model:** нормалізовані \`posts\` і \`users\`; стрічка — масив id з курсором \`nextCursor\`.

**Interface:**
\`\`\`text
GET  /feed?after=<cursor>&limit=20 → { items, nextCursor }
POST /posts/:id/like
SSE/WebSocket: new_post, like_count
\`\`\`

**Optimizations:**
- довантаження через IntersectionObserver і sentinel, з передзавантаженням до кінця списку;
- віртуалізація; зображення з \`srcset\`/\`sizes\`, \`loading="lazy"\` і заданими розмірами (без CLS);
- скелетони, оптимістичні лайки;
- банер «N нових постів» замість автоматичної вставки;
- відновлення позиції прокрутки при поверненні назад;
- a11y: \`role="feed"\`, \`aria-busy\` під час довантаження, фокус;
- безпека: санітизація контенту користувачів (XSS).
`,
      keyPoints: [
        'Cursor-пагінація + IntersectionObserver',
        'Віртуалізація довгого списку, зображення без CLS',
        'Оптимістичні дії з відкатом',
        'Real-time через SSE/WebSocket, нові пости — за кнопкою',
        'Нормалізований кеш і відновлення прокрутки'
      ],
      followUps: ['Як відновити позицію прокрутки після переходу на пост і повернення назад?', 'Як оновити лічильник лайків у всіх місцях, де показано пост?']
    },
    {
      id: 'arch-case-autocomplete', group: 'cases', type: 'theory', level: 3, interview: true,
      title: 'Кейс: автокомпліт пошуку',
      question: 'Які рішення **обов\'язкові** для якісного автокомпліту? Оберіть **усі**.',
      choices: [
        'Debounce введення і скасування або ігнорування застарілих запитів (гонки відповідей)',
        'Кеш результатів за рядком запиту',
        'Керування з клавіатури та ARIA-патерн combobox (`aria-expanded`, `aria-activedescendant`)',
        'Запит на кожне натискання клавіші без затримки — так результати найсвіжіші',
        'Вставляти підсвічений збіг через `innerHTML` з текстом від сервера'
      ],
      correct: [0, 1, 2],
      why: [
        'Так: менше запитів і жодних «старих» результатів поверх нових.',
        'Так: повернення до попереднього запиту (Backspace) — миттєве.',
        'Так: автокомпліт без клавіатури й ARIA недоступний.',
        'Ні: десятки запитів за секунду і гонки відповідей.',
        'Ні: XSS; підсвічування будуйте через текстові вузли або екранування.'
      ],
      hint: 'Подумайте про мережу (скільки запитів і в якому порядку відповіді), швидкість, клавіатуру та безпеку.',
      answer: `
**Мережа:**
- **debounce** 200–300 мс і мінімальна довжина запиту;
- **гонки:** відповідь на «re» може прийти після відповіді на «react» → скасовувати попередній запит (\`AbortController\`) або ігнорувати відповіді не для поточного запиту;
- **кеш** \`query → results\` (LRU), можна з префіксною логікою.

**UI/UX:** стани (завантаження, порожньо, помилка), підсвічування збігу, недавні запити, обмеження кількості результатів.

**Доступність (ARIA combobox):** \`role="combobox"\` + \`aria-expanded\` + \`aria-controls\` на полі, \`role="listbox"\`/\`role="option"\` у списку, \`aria-activedescendant\` для активного пункту; ↑ ↓ Enter Esc.

**Безпека:** текст від сервера не вставляти через \`innerHTML\`.

**Продуктивність:** віртуалізація, якщо результатів багато; без layout thrashing при позиціонуванні випадаючого списку.
`,
      keyPoints: [
        'Debounce + скасування застарілих запитів',
        'Кеш за рядком запиту',
        'ARIA combobox і повна клавіатурна навігація',
        'Стани: loading, empty, error',
        'Без innerHTML для серверного тексту'
      ],
      followUps: ['Як реалізувати ігнорування застарілих відповідей без AbortController?']
    },
    {
      id: 'arch-case-chat', group: 'cases', type: 'theory', level: 3,
      title: 'Кейс: чат у реальному часі',
      question: 'Які рішення **правильні** для веб-чату? Оберіть **усі**.',
      choices: [
        'WebSocket з автоматичним перепідключенням (експоненційний backoff + jitter) і дозавантаженням пропущеного',
        'Оптимістичне повідомлення з тимчасовим id і станами «надсилається / надіслано / помилка — повторити»',
        'Сортувати повідомлення за часом пристрою відправника',
        'Історію довантажувати вгору порціями (cursor) і зберігати позицію прокрутки',
        'Після перепідключення перезавантажувати сторінку, щоб гарантувати актуальність'
      ],
      correct: [0, 1, 3],
      why: [
        'Так: мережа обривається; jitter запобігає одночасному перепідключенню тисяч клієнтів.',
        'Так: миттєвий відгук і чесний статус доставки.',
        'Ні: годинники пристроїв розходяться; порядок задає сервер (id/послідовність, серверний час).',
        'Так: інакше при довантаженні зверху контент «стрибає».',
        'Ні: втрачаються чернетки й стан; достатньо дозапитати повідомлення після останнього відомого id.'
      ],
      hint: 'Що буде при обриві з\'єднання, повільній мережі і розбіжності годинників на пристроях?',
      answer: `
**Канал:** WebSocket (двобічний обмін). SSE підходить для односпрямованих оновлень, long polling — як запасний варіант.

**Надійність:**
- перепідключення з **експоненційним backoff + jitter**, індикатор «з'єднання втрачено»;
- після перепідключення — запит повідомлень **після останнього відомого id** (без пропусків і дублікатів);
- **ідемпотентність**: клієнтський \`clientId\` повідомлення, щоб повторна відправка не створила дубль.

**Порядок:** визначає сервер (послідовний id або серверний timestamp), а не годинник клієнта.

**UX:**
- оптимістичне відображення з тимчасовим id і заміною на серверний;
- статуси доставки і прочитання, «друкує…» (з throttle);
- історія вгору з cursor-пагінацією і збереженням позиції;
- віртуалізація довгої історії.

**Офлайн:** черга вихідних повідомлень (IndexedDB), відправка після відновлення мережі.

**Безпека:** санітизація контенту, авторизація на рівні з'єднання, обмеження частоти.
`,
      keyPoints: [
        'WebSocket + reconnect з backoff і jitter',
        'Після reconnect — дозапит після останнього id',
        'Порядок і час — від сервера',
        'Оптимістична відправка з clientId (ідемпотентність)',
        'Історія вгору з cursor і збереженням прокрутки'
      ],
      followUps: ['Як показати непрочитані повідомлення в кількох вкладках одночасно?']
    },
    {
      id: 'arch-design-system', group: 'cases', type: 'theory', level: 3,
      title: 'Дизайн-система: з чого складається',
      question: 'Які твердження про дизайн-систему **правильні**? Оберіть **усі**.',
      choices: [
        'Дизайн-токени (кольори, відступи, типографіка) — єдине джерело значень для дизайну і коду, часто як CSS-змінні',
        'Компоненти мають продуманий API (варіанти, розміри, стани) і вбудовану доступність',
        'Темізацію (світла/темна) зручно робити перевизначенням токенів, а не копіюванням стилів компонентів',
        'Дизайн-система — це набір макетів у Figma, код до неї не входить',
        'Зміни в компонентах можна випускати без версіонування — всі проєкти однаково оновляться одночасно'
      ],
      correct: [0, 1, 2],
      why: [
        'Так: токени синхронізують дизайн і код.',
        'Так: доступність закладається один раз у компоненті, а не в кожному продукті.',
        'Так: компоненти посилаються на семантичні токени, тема змінює лише їхні значення.',
        'Ні: це також код (бібліотека компонентів), документація і правила.',
        'Ні: потрібні semver, changelog і міграції, щоб не зламати споживачів.'
      ],
      hint: 'Подумайте про три рівні: значення → компоненти → процес (документація, версії).',
      answer: `
**Дизайн-система** = токени + компоненти + документація + процес.

- **Токени:** базові (\`blue-500\`, \`space-4\`) і **семантичні** (\`color-bg-surface\`, \`color-text-danger\`). Компоненти використовують лише семантичні, тож тема — це інший набір значень.
- **Компоненти:** узгоджений API (\`variant\`, \`size\`, \`disabled\`, \`loading\`), композиція (slots/children), вбудована **доступність** (фокус, ARIA, клавіатура, контраст).
- **Документація:** живі приклади (Storybook), правила використання, do/don't.
- **Процес:** semver, changelog, codemods для міграцій, візуальні регресійні тести.

На співбесіді дизайн-систему зазвичай обговорюють як компроміс: гнучкість (кастомізація) проти узгодженості, обсяг бандла (tree-shaking компонентів), CSS-підхід (CSS-змінні, CSS Modules, utility-first).
`,
      keyPoints: [
        'Токени: базові і семантичні, часто CSS-змінні',
        'Компоненти з продуманим API і доступністю',
        'Тема = перевизначення токенів',
        'Документація (Storybook), semver і міграції'
      ],
      followUps: ['Як зробити, щоб компонент Button не можна було використати недоступно?']
    },
    {
      id: 'arch-micro-frontends', group: 'cases', type: 'theory', level: 4, interview: true,
      title: 'Мікрофронтенди: коли виправдані',
      question: 'Senior-питання. Оберіть **усі** правильні твердження про мікрофронтенди.',
      choices: [
        'Головна причина впровадження — незалежні команди з незалежними релізами великих частин продукту',
        'Типові витрати: дублювання залежностей у бандлах, складніша узгодженість UI і спільного стану',
        'Module Federation дозволяє завантажувати модулі іншого застосунку під час виконання',
        'Мікрофронтенди варто впроваджувати в будь-якому новому проєкті, щоб він був масштабованим',
        'Мікрофронтенди автоматично прискорюють завантаження сторінки'
      ],
      correct: [0, 1, 2],
      why: [
        'Так: це перш за все організаційне рішення (закон Конвея).',
        'Так: кілька версій бібліотек, різні стилі, контракт між частинами.',
        'Так: це один зі способів інтеграції (поряд з iframe, Web Components, серверною композицією).',
        'Ні: для невеликої команди це зайва складність; часто достатньо модульного моноліту.',
        'Ні: часто навпаки — більше JS і запитів, якщо не керувати спільними залежностями.'
      ],
      hint: 'Чи це технічне, чи організаційне рішення? Чим доводиться платити?',
      answer: `
**Мікрофронтенди** — розбиття фронтенду на незалежно розроблювані й розгортувані частини, що належать різним командам.

**Коли виправдані:** багато команд, великий продукт, потреба в незалежних релізах, поступова міграція легасі (стара частина на одному стеку, нова — на іншому).

**Способи інтеграції:** на етапі збірки (npm-пакети — але тоді релізи знову залежні), під час виконання (Module Federation, import maps, Web Components, iframe), серверна або edge-композиція.

**Витрати:** дублювання залежностей, узгодженість дизайну (потрібна дизайн-система), спільний стан і маршрутизація, складніша інфраструктура, тестування інтеграції, продуктивність.

**Альтернатива:** **модульний моноліт** (монорепозиторій з чіткими межами модулів, наприклад feature-sliced design) дає більшу частину переваг без runtime-витрат.
`,
      keyPoints: [
        'Мета — незалежні команди і релізи, а не «масштабованість» як така',
        'Інтеграція: Module Federation, import maps, Web Components, iframe, сервер',
        'Ціна: дублювання залежностей, узгодженість, спільний стан',
        'Часто достатньо модульного моноліту'
      ],
      followUps: ['Як ділити спільний стан (користувач, тема) між мікрофронтендами?']
    }
  ]
});
