(function () {
// Фейковий MessagePort для тестів RPC-клієнта: port.sent — надіслані повідомлення, reply(data) — відповідь «воркера».
const PORT = "const t = new EventTarget();\nconst port = { sent: [], postMessage(m) { this.sent.push(m); }, addEventListener: t.addEventListener.bind(t), removeEventListener: t.removeEventListener.bind(t) };\nconst reply = (data) => t.dispatchEvent(new MessageEvent('message', { data }));\n";

FE.topic('browser-api', {
  intro: `
## Сховища

| | localStorage | sessionStorage | cookie | IndexedDB |
|---|---|---|---|---|
| Обсяг | ~5–10 МБ на origin | ~5 МБ | ~4 КБ на cookie | сотні МБ+ (квота) |
| API | синхронне | синхронне | рядок \`document.cookie\` | асинхронне, транзакції |
| Живе | доки не видалять | доки жива вкладка | Expires/Max-Age або сесія | доки не видалять |
| Скоуп | origin | origin + вкладка | domain + path | origin |
| На сервер | ні | ні | **так, з кожним запитом** | ні |

- Web Storage зберігає **лише рядки**: \`setItem('n', 1)\` → \`'1'\`, об'єкти — через \`JSON.stringify\`.
- Подія \`storage\` приходить в **інші** вкладки того ж origin.
- Cookie-атрибути: \`Max-Age\`/\`Expires\`, \`Path\`, \`Domain\`, \`Secure\`, \`HttpOnly\` (недоступна з JS), \`SameSite=Strict|Lax|None\`.

## fetch

\`\`\`js
const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal });
if (!res.ok) throw new Error('HTTP ' + res.status); // 404/500 НЕ відхиляють проміс!
const json = await res.json(); // тіло читається лише один раз
\`\`\`

- Відхиляється лише при мережевій помилці або \`abort\` (\`AbortError\`).
- \`FormData\` у \`body\` — **не** ставте \`Content-Type\` вручну (boundary).
- Скасування: \`AbortController\`, \`AbortSignal.timeout(ms)\` (\`TimeoutError\`), \`AbortSignal.any([...])\`.

## URL

\`\`\`js
const u = new URL('/search?q=js', 'https://site.com');
u.searchParams.set('page', 2); u.searchParams.append('tag', 'a');
u.href; // 'https://site.com/search?q=js&page=2&tag=a'
\`\`\`

\`URLSearchParams\` кодує пробіл як \`+\`, \`encodeURIComponent\` — як \`%20\`.

## Роутинг у SPA

- **History API:** \`pushState/replaceState\` міняють URL без перезавантаження і **не** генерують \`popstate\`; \`popstate\` — лише на «назад/вперед». На сервері потрібен fallback (\`index.html\` на всі шляхи).
- **Hash-роутинг:** \`location.hash\` + подія \`hashchange\`; сервер нічого не знає про \`#...\`.

## Observers і таймінги

- \`IntersectionObserver\` — видимість елемента (lazy loading, infinite scroll) без scroll-обробників.
- \`ResizeObserver\` — розміри елемента; \`MutationObserver\` — зміни DOM.
- \`requestAnimationFrame\` — перед наступним paint, пауза у фонових вкладках; \`requestIdleCallback\` — у вільний час кадру.
- \`performance.now()\` — монотонний час для вимірювань.

## Workers і повідомлення

- Dedicated Worker (одна сторінка), SharedWorker (кілька вкладок), Service Worker (проксі мережі, офлайн, push).
- \`postMessage\` копіює дані **structured clone** (Map, Date, Blob — так; функції, DOM — ні). Transferable (\`ArrayBuffer\`) передаються без копіювання.
- \`BroadcastChannel\` — повідомлення між вкладками одного origin.

## Інше

- Page Visibility: \`document.visibilityState\` + \`visibilitychange\`; аналітика — \`navigator.sendBeacon\`.
- Clipboard: \`navigator.clipboard.writeText()\` — проміс, secure context, жест користувача.
- \`Blob\` + \`URL.createObjectURL\` (не забудьте \`revokeObjectURL\`); читання — \`file.text()\`.
`,
  groups: [
    { id: 'storage', title: 'Web Storage і cookies' },
    { id: 'url', title: 'URL і query-параметри' },
    { id: 'fetch', title: 'fetch, Response і FormData' },
    { id: 'abort', title: 'Скасування, таймаути, повтори' },
    { id: 'routing', title: 'Роутинг: hash і History API' },
    { id: 'observers', title: 'IntersectionObserver' },
    { id: 'page', title: 'Таймінги, життєвий цикл сторінки, файли' },
    { id: 'workers', title: 'Web Workers і postMessage' },
    { id: 'streams-canvas', title: 'Потоки, Canvas і підтримка можливостей' }
  ],
  items: [
    // ---------------------------------------------------------------- Web Storage і cookies
    {
      id: 'bapi-storage-compare',
      group: 'storage',
      type: 'theory',
      level: 1,
      interview: true,
      title: 'localStorage vs sessionStorage vs cookies vs IndexedDB',
      tags: ['storage', 'cookies'],
      question: 'Які способи зберігати дані на клієнті ви знаєте? Чим відрізняються localStorage, sessionStorage, cookies та IndexedDB і що коли обирати? Оберіть **усі** правильні твердження.',
      choices: [
        'Cookies браузер сам надсилає з кожним запитом, тому вони малі (~4 КБ) і не годяться для великих даних',
        '`sessionStorage` спільний для всіх вкладок сайту й очищається лише при закритті браузера',
        "`localStorage` асинхронний і зберігає об'єкти, тож `JSON.stringify` для нього зайвий",
        'IndexedDB — асинхронна транзакційна БД для великих обсягів, доступна й у Web Workers',
        'HttpOnly cookie недоступна для JS, а `localStorage` прочитає будь-який скрипт, зокрема при XSS'
      ],
      correct: [0, 3, 4],
      why: [
        'Правильно: браузер прикріплює cookie до кожного запиту на її domain/path, тому великі дані роздувають трафік.',
        "Хибно: sessionStorage прив'язаний до вкладки — нова вкладка має власне сховище, і воно зникає при закритті вкладки.",
        "Хибно: localStorage синхронний і зберігає лише рядки — без JSON.stringify об'єкт стане '[object Object]'.",
        "Правильно: IndexedDB асинхронна, зберігає об'єкти (structured clone) і працює у воркерах, на відміну від Web Storage.",
        'Правильно: HttpOnly ховає cookie від document.cookie, а localStorage читає будь-який скрипт на сторінці.'
      ],
      hint: 'Порівняйте за обсягом, часом життя, областю видимості, синхронністю API і тим, чи йдуть дані на сервер.',
      answer: `
| | Обсяг | Живе | На сервер | API |
|---|---|---|---|---|
| **localStorage** | ~5–10 МБ | доки не видалять | ні | синхронне, рядки |
| **sessionStorage** | ~5 МБ | до закриття вкладки | ні | синхронне, рядки |
| **cookie** | ~4 КБ | \`Expires\`/\`Max-Age\` або сесія | **так, з кожним запитом** | рядок \`document.cookie\` |
| **IndexedDB** | сотні МБ | доки не видалять | ні | асинхронне, об'єкти, є у воркерах |

\`\`\`js
localStorage.setItem('settings', JSON.stringify({ theme: 'dark' }));
const settings = JSON.parse(localStorage.getItem('settings') ?? '{}');
\`\`\`

**Пастки:**
- Web Storage тримає **лише рядки** — серіалізуйте через JSON.
- \`setItem\` може кинути \`QuotaExceededError\` (переповнення, приватний режим) — \`try/catch\`.
- localStorage читає будь-який JS, зокрема при XSS; \`HttpOnly\` cookie з JS недоступна.

**Коли що:** налаштування UI, чернетки — localStorage; стан вкладки (крок майстра) — sessionStorage; сесія — HttpOnly cookie; офлайн-дані, великі списки, файли — IndexedDB (через обгортку \`idb\`/Dexie).
`,
      keyPoints: [
        'Обсяг: cookie ~4 КБ, Web Storage ~5–10 МБ, IndexedDB — значно більше',
        'Час життя: local — назавжди, session — до закриття вкладки, cookie — Expires/Max-Age',
        'Cookies автоматично йдуть на сервер з кожним запитом',
        "Web Storage синхронне і лише рядки; IndexedDB асинхронна, зберігає об'єкти",
        'Безпека: localStorage доступний будь-якому JS (XSS), HttpOnly cookie — ні'
      ],
      followUps: [
        'Чи доступний localStorage у Web Worker?',
        'Що станеться, якщо перевищити квоту?',
        'Де безпечніше зберігати access token і чому?',
        'Як синхронізувати дані між вкладками?'
      ]
    },
    {
      id: 'bapi-storage-strings',
      group: 'storage',
      type: 'quiz',
      level: 1,
      title: 'Що повертає localStorage.getItem',
      tags: ['storage'],
      question: `
Що виведе код?

\`\`\`js
localStorage.setItem('count', 1);
localStorage.setItem('user', { name: 'Ann' });
console.log(typeof localStorage.getItem('count'), localStorage.getItem('user'));
\`\`\`
`,
      options: [
        '`number {name: "Ann"}`',
        '`string [object Object]`',
        '`string {"name":"Ann"}`',
        '`number [object Object]`'
      ],
      answer: 1,
      why: [
        "Хибно: setItem перетворює все на рядок, тож typeof дає 'string', а об'єкт не зберігається як є.",
        "Правильно: 1 → '1', а об'єкт через String(obj) стає '[object Object]' — дані втрачено.",
        "Хибно: setItem не викликає JSON.stringify сам — для об'єкта спрацьовує String(obj).",
        "Хибно: число теж приводиться до рядка '1', тож typeof — 'string'."
      ],
      hint: "Web Storage зберігає лише один тип даних. Як об'єкт перетворюється на цей тип за замовчуванням?",
      explanation: `
\`setItem\` робить \`String(value)\`: \`1\` → \`'1'\`, \`{ name: 'Ann' }\` → \`'[object Object]'\`. Правильно: \`setItem('user', JSON.stringify(user))\` і \`JSON.parse(getItem('user'))\`.

**Що спитають далі:** що поверне \`getItem\` для відсутнього ключа (\`null\`) і чому \`JSON.parse(null)\` не падає (дає \`null\`)?
`
    },
    {
      id: 'bapi-storage-ttl',
      group: 'storage',
      type: 'code',
      level: 2,
      title: 'Обгортка над Storage: JSON + TTL',
      tags: ['storage', 'json'],
      description: `
**Завдання.** Напишіть \`createStore(storage, { prefix })\` — обгортку над \`localStorage\`, яка зберігає будь-які JSON-значення і вміє «протухати» записи (TTL).

**Де трапляється:** кеш відповіді API на 5 хвилин, збережений фільтр чи чернетка, «не показувати банер 7 днів». Така утиліта є майже в кожному проєкті.

**Що написати**
- \`createStore(storage, { prefix = '' } = {})\` → об'єкт з методами нижче. \`storage\` — будь-що з інтерфейсом Web Storage: \`getItem\`, \`setItem\`, \`removeItem\`, \`key(i)\`, \`length\`.
- \`set(key, value, ttlMs?)\` → \`true\`. Зберігає \`value\` під ключем \`prefix + key\`. Якщо \`ttlMs > 0\` — запис протухає через \`ttlMs\` мс (час — \`Date.now()\`). Якщо сховище кинуло помилку (\`QuotaExceededError\`) → \`false\`, без винятку.
- \`get(key, fallback = null)\` → збережене значення; \`fallback\`, якщо ключа немає, JSON зіпсований або запис протух (протухлий ще й **видаляється** зі сховища).
- \`remove(key)\` → нічого; видаляє запис.
- \`clear()\` → нічого; видаляє **лише** ключі з цим \`prefix\`.

**Приклад**
\`\`\`js
const store = createStore(localStorage, { prefix: 'app:' });
store.set('user', { id: 1 }, 60000); // true
store.get('user');                   // { id: 1 }
localStorage.getItem('app:user');    // наприклад '{"v":{"id":1},"e":1700000060000}'
store.set('flag', false);
store.get('flag', true);             // false (а не fallback!)
store.get('missing', 'n/a');         // 'n/a'
\`\`\`

**Як це працює:** Web Storage зберігає лише рядки, тому в сховище кладемо «конверт» \`JSON.stringify({ v: value, e: expiresAt })\`. \`JSON.parse\` при читанні відновлює тип, а \`e\` дозволяє перевірити протухання ліниво — у момент \`get\`, без таймерів. \`getItem\` повертає \`null\`, коли ключа немає, — так «немає» відрізняється від збереженого \`false\`.

**Врахуйте:**
- \`false\`, \`0\`, \`null\`, \`''\` — валідні значення, не плутайте їх з відсутністю ключа;
- \`JSON.parse\` чужого або зіпсованого рядка кидає — поверніть \`fallback\`;
- у \`clear\` не видаляйте ключі прямо під час обходу \`key(i)\` — індекси зсуваються.
`,
      starter: `function createStore(storage, { prefix = '' } = {}) {
  // Повний ключ у сховищі
  const fullKey = (key) => prefix + key;

  return {
    set(key, value, ttlMs) {
      // 1. Конверт: { v: value, e: ttlMs > 0 ? Date.now() + ttlMs : null }
      // 2. try { storage.setItem(fullKey(key), JSON.stringify(конверт)); return true; }
      //    catch → return false
      // TODO
    },
    get(key, fallback = null) {
      // 1. raw = storage.getItem(fullKey(key)); якщо null → fallback
      // 2. JSON.parse(raw) у try/catch; помилка → fallback
      // 3. Протух (e !== null && Date.now() >= e) → removeItem і fallback
      // 4. Інакше → конверт.v
      // TODO
    },
    remove(key) {
      // TODO
    },
    clear() {
      // 1. Зберіть у масив ключі storage.key(i), що починаються з prefix
      // 2. Лише потім видаліть їх
      // TODO
    }
  };
}

// Спробуйте в консолі:
// const s = createStore(localStorage, { prefix: 'app:' });
// s.set('user', { id: 1 }, 1000); s.get('user'); // { id: 1 }, а через секунду — null
`,
      solution: `function createStore(storage, { prefix = '' } = {}) {
  const full = (key) => prefix + key;

  return {
    set(key, value, ttlMs) {
      // Зберігаємо значення разом із часом протухання в одному записі
      const record = { v: value, e: ttlMs > 0 ? Date.now() + ttlMs : null };
      try {
        storage.setItem(full(key), JSON.stringify(record));
        return true;
      } catch (err) {
        return false; // QuotaExceededError, приватний режим тощо
      }
    },
    get(key, fallback = null) {
      const raw = storage.getItem(full(key));
      if (raw === null) return fallback;
      let record;
      try {
        record = JSON.parse(raw);
      } catch {
        return fallback; // хтось записав не-JSON
      }
      if (!record || typeof record !== 'object' || !('v' in record)) return fallback;
      if (record.e !== null && Date.now() >= record.e) {
        storage.removeItem(full(key)); // ліниве прибирання
        return fallback;
      }
      return record.v;
    },
    remove(key) {
      storage.removeItem(full(key));
    },
    clear() {
      // Спочатку збираємо ключі: видалення під час обходу зсуває індекси key(i)
      const keys = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k !== null && k.startsWith(prefix)) keys.push(k);
      }
      keys.forEach((k) => storage.removeItem(k));
    }
  };
}
`,
      hints: [
        'Зберігайте не саме значення, а конверт `{ v: value, e: expiresAt }` через `JSON.stringify`; `e = null`, якщо TTL немає.',
        'У `get`: `getItem` → `null` означає «ключа немає». `JSON.parse` обгорніть у `try/catch`. Протух — `removeItem` і `return fallback`.',
        'У `clear`: `for (let i = 0; i < storage.length; i++)` збирайте `storage.key(i)` з префіксом у масив, а потім `keys.forEach((k) => storage.removeItem(k))`.'
      ],
      tests: [
        { name: "зберігає й повертає об'єкти та примітиви", code: "localStorage.clear();\nconst s = createStore(localStorage);\ns.set('user', { id: 1, tags: ['a'] });\ns.set('n', 42);\nexpect(s.get('user')).toEqual({ id: 1, tags: ['a'] });\nexpect(s.get('n')).toBe(42);" },
        { name: 'false і null не плутаються з відсутнім ключем', code: "localStorage.clear();\nconst s = createStore(localStorage);\ns.set('flag', false);\ns.set('empty', null);\nexpect(s.get('flag', true)).toBe(false);\nexpect(s.get('empty', 'fb')).toBe(null);\nexpect(s.get('missing', 'fb')).toBe('fb');\nexpect(s.get('missing')).toBe(null);" },
        { name: 'TTL: запис протухає і видаляється зі сховища', code: "useFakeTimers(1000);\nlocalStorage.clear();\nconst s = createStore(localStorage, { prefix: 'p:' });\ns.set('token', 'abc', 500);\nadvanceTimersByTime(499);\nexpect(s.get('token')).toBe('abc');\nadvanceTimersByTime(1);\nexpect(s.get('token', 'expired')).toBe('expired');\nexpect(localStorage.getItem('p:token')).toBe(null);" },
        { name: 'без TTL запис не протухає', code: "useFakeTimers();\nlocalStorage.clear();\nconst s = createStore(localStorage);\ns.set('a', 1);\nadvanceTimersByTime(1e9);\nexpect(s.get('a')).toBe(1);" },
        { name: 'зіпсований JSON → fallback без винятку', code: "localStorage.clear();\nlocalStorage.setItem('x:bad', '{oops');\nconst s = createStore(localStorage, { prefix: 'x:' });\nexpect(s.get('bad', 'fb')).toBe('fb');" },
        { name: 'clear видаляє лише ключі з префіксом', code: "localStorage.clear();\nlocalStorage.setItem('other', '1');\nconst s = createStore(localStorage, { prefix: 'app:' });\ns.set('a', 1); s.set('b', 2); s.set('c', 3);\ns.clear();\nexpect(localStorage.length).toBe(1);\nexpect(localStorage.getItem('other')).toBe('1');" },
        { name: 'помилка сховища → set повертає false', code: "const broken = { setItem() { throw new DOMException('full', 'QuotaExceededError'); }, getItem() { return null; }, removeItem() {}, key() { return null; }, length: 0 };\nconst s = createStore(broken);\nexpect(s.set('a', 1)).toBe(false);\nexpect(createStore(localStorage).set('ok', 1)).toBe(true);" }
      ],
      explanation: `
**Чому працює:** конверт \`{ v, e }\` дає коректні типи після \`JSON.parse\`, розрізняє «немає ключа» і «збережено \`null\`/\`false\`», а протухлі записи прибираються ліниво при читанні.

**Складність:** \`get/set/remove\` — O(1) (+ розмір JSON), \`clear\` — O(n) за кількістю ключів.

**Типові помилки:** \`if (!value) return fallback\` (ламає \`false\`/\`0\`); видалення в циклі по \`key(i)\` (пропуски); \`JSON.parse\` без \`try/catch\`; ігнорування \`QuotaExceededError\`.

**Що спитають далі:** як синхронізувати таку обгортку між вкладками (подія \`storage\`)? Чому \`Date.now()\`, а не \`performance.now()\` (останній рахується від завантаження сторінки і не переживає reload)?
`
    },
    {
      id: 'bapi-cookie-attributes',
      group: 'storage',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Атрибути cookie',
      tags: ['cookies', 'security'],
      question: 'Оберіть **усі** правильні твердження про cookie:',
      options: [
        'Cookie з `HttpOnly` недоступна через `document.cookie`',
        '`Secure` означає, що браузер шифрує значення cookie',
        '`SameSite=Lax` не надсилає cookie на крос-сайтові POST-запити, але надсилає при переході за посиланням (top-level GET)',
        'Cookie без `Expires`/`Max-Age` живе до кінця сесії браузера',
        '`document.cookie = "a=1; b=2"` встановлює дві cookie',
        '`SameSite=None` вимагає атрибута `Secure`'
      ],
      answer: [0, 2, 3, 5],
      why: [
        'Правильно: HttpOnly cookie бачить лише сервер — document.cookie її не повертає, тож XSS її не вкраде.',
        'Хибно: Secure нічого не шифрує, а лише забороняє надсилати cookie по HTTP; шифрує сам HTTPS.',
        'Правильно: Lax не надсилає cookie у крос-сайтових POST і підзапитах, але пропускає перехід за посиланням (GET).',
        'Правильно: без Expires/Max-Age cookie сесійна і зникає разом із сесією браузера.',
        'Хибно: одне присвоєння — одна cookie; «b=2» після «;» сприймається як невідомий атрибут.',
        'Правильно: браузери відхиляють SameSite=None без Secure.'
      ],
      hint: 'Один запис у document.cookie — одна cookie; усе після першої `;` — атрибути.',
      explanation: `
Запис у \`document.cookie\` — це **одна** cookie: усе після першої \`;\` — атрибути. \`SameSite=Lax\` — дефолт сучасних браузерів; \`Strict\` не надсилає cookie навіть при переході за посиланням з іншого сайту. Видалити cookie: те саме ім'я, \`Path\`/\`Domain\` і \`Max-Age=0\`.

**Що спитають далі:** як \`SameSite\` захищає від CSRF? Чому сесію краще тримати в \`HttpOnly\` cookie, а не в localStorage?
`
    },
    {
      id: 'bapi-cookie-parse',
      group: 'storage',
      type: 'code',
      level: 2,
      title: 'parseCookies / serializeCookie',
      tags: ['cookies', 'parsing'],
      description: `
**Завдання.** Напишіть дві утиліти для cookie: \`parseCookies\` розбирає рядок на об'єкт, \`serializeCookie\` збирає рядок для заголовка \`Set-Cookie\`.

**Де трапляється:** прочитати на клієнті cookie згоди (cookie consent) чи мови; Node/SSR-middleware розбирає заголовок \`Cookie\` і ставить \`Set-Cookie\`. Це спрощена версія npm-пакета \`cookie\`.

**Що написати**
- \`parseCookies(str)\` → об'єкт \`{ name: value }\`:
  - пари розділені \`;\`, пробіли навколо ігноруються;
  - ділимо за **першим** \`=\` (значення може містити \`=\`, наприклад base64);
  - значення декодується \`decodeURIComponent\`; якщо декодування падає — залишаємо як є;
  - значення в лапках \`"..."\` — лапки знімаються;
  - фрагменти без \`=\` пропускаються; при дублікатах виграє **перша** пара.
- \`serializeCookie(name, value, options = {})\` → рядок:
  - початок — \`encodeURIComponent(name) + '=' + encodeURIComponent(value)\`;
  - далі через \`'; '\` атрибути **в такому порядку**, лише якщо задані: \`Max-Age\` (\`maxAge\`, ціле, \`0\` теж рахується), \`Domain\`, \`Path\`, \`Expires\` (\`expires: Date\` → \`toUTCString()\`), \`HttpOnly\`, \`Secure\`, \`SameSite\` (\`sameSite\` у будь-якому регістрі → \`Strict\` | \`Lax\` | \`None\`);
  - \`sameSite: 'none'\` без \`secure: true\` → кинути \`TypeError\`.

**Приклад**
\`\`\`js
parseCookies('theme=dark; token=abc==; name=John%20Doe');
// { theme: 'dark', token: 'abc==', name: 'John Doe' }

serializeCookie('sid', 'a b', { maxAge: 3600, path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
// 'sid=a%20b; Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=Lax'
\`\`\`

**Як це працює:** \`document.cookie\` і заголовок \`Cookie\` — це один рядок \`a=1; b=2\`, тож парсинг — це \`split(';')\` + пошук першого \`=\`. Значення кодують \`encodeURIComponent\`, бо \`;\`, \`,\` і пробіл зламали б формат заголовка. Атрибути (\`Max-Age\`, \`Path\`…) задаються лише при записі — при читанні браузер їх не повертає.

**Врахуйте:**
- \`split('=')\` обріже \`token=abc==\` — шукайте перший \`=\` через \`indexOf\`;
- \`decodeURIComponent('%E0%A4%A')\` кидає \`URIError\`;
- \`maxAge: 0\` — валідне значення (видалити cookie), перевіряйте \`!== undefined\`;
- порожній рядок → \`{}\`.
`,
      starter: `function parseCookies(str) {
  const result = {};
  // 1. Розбийте str за ';'
  // 2. Для кожної частини: eq = part.indexOf('='); якщо -1 — пропустити
  // 3. name = part.slice(0, eq).trim(); якщо name вже є — пропустити (перша пара виграє)
  // 4. value = part.slice(eq + 1).trim(); зніміть лапки "..."
  // 5. decodeURIComponent(value) у try/catch
  // TODO
  return result;
}

function serializeCookie(name, value, options = {}) {
  const parts = [encodeURIComponent(name) + '=' + encodeURIComponent(value)];
  // 1. Max-Age (якщо options.maxAge !== undefined, Math.floor)
  // 2. Domain, Path, Expires (options.expires.toUTCString())
  // 3. HttpOnly, Secure
  // 4. SameSite: нормалізуйте регістр; 'None' без secure → throw new TypeError(...)
  // TODO
  return parts.join('; ');
}

// Спробуйте в консолі:
// parseCookies('a=1; b=x%20y'); // { a: '1', b: 'x y' }
// serializeCookie('sid', 'x', { path: '/', secure: true }); // 'sid=x; Path=/; Secure'
`,
      solution: `function parseCookies(str) {
  const result = {};
  if (!str) return result;
  for (const part of str.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue; // фрагмент без '=' — пропускаємо
    const name = part.slice(0, eq).trim();
    if (!name || name in result) continue; // перша пара виграє
    let value = part.slice(eq + 1).trim();
    if (value.length >= 2 && value[0] === '"' && value[value.length - 1] === '"') {
      value = value.slice(1, -1);
    }
    try {
      value = decodeURIComponent(value);
    } catch {
      // некоректна %-послідовність — залишаємо як є
    }
    result[name] = value;
  }
  return result;
}

function serializeCookie(name, value, options = {}) {
  const parts = [encodeURIComponent(name) + '=' + encodeURIComponent(value)];
  if (options.maxAge !== undefined) parts.push('Max-Age=' + Math.floor(options.maxAge));
  if (options.domain) parts.push('Domain=' + options.domain);
  if (options.path) parts.push('Path=' + options.path);
  if (options.expires) parts.push('Expires=' + options.expires.toUTCString());
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) {
    const map = { strict: 'Strict', lax: 'Lax', none: 'None' };
    const sameSite = map[String(options.sameSite).toLowerCase()];
    if (!sameSite) throw new TypeError('Invalid SameSite: ' + options.sameSite);
    if (sameSite === 'None' && !options.secure) {
      throw new TypeError('SameSite=None requires Secure');
    }
    parts.push('SameSite=' + sameSite);
  }
  return parts.join('; ');
}
`,
      hints: [
        "Розбийте рядок за `;`, кожну пару — за **першим** `=`: `const eq = part.indexOf('=')`, далі `slice(0, eq)` і `slice(eq + 1)`.",
        '`decodeURIComponent` обгорніть у `try/catch`. Для дублікатів перевіряйте `name in result` перед записом.',
        "У `serializeCookie` пушніть атрибути в масив `parts` у потрібному порядку; для SameSite зручна мапа `{ strict: 'Strict', lax: 'Lax', none: 'None' }` за `String(v).toLowerCase()`."
      ],
      tests: [
        { name: 'парсить прості пари і декодує значення', code: "expect(parseCookies('theme=dark; name=John%20Doe;lang=uk')).toEqual({ theme: 'dark', name: 'John Doe', lang: 'uk' });" },
        { name: 'значення з = не обрізається', code: "expect(parseCookies('token=abc==; x=a=b')).toEqual({ token: 'abc==', x: 'a=b' });" },
        { name: 'порожній рядок, сміття і лапки', code: "expect(parseCookies('')).toEqual({});\nexpect(parseCookies(' ; broken ; q=\"quoted value\" ;')).toEqual({ q: 'quoted value' });" },
        { name: 'дублікати: виграє перша пара; некоректне кодування не падає', code: "expect(parseCookies('a=1; a=2; bad=%E0%A4%A')).toEqual({ a: '1', bad: '%E0%A4%A' });" },
        { name: "serialize кодує ім'я і значення", code: "expect(serializeCookie('user name', 'a b;c')).toBe('user%20name=a%20b%3Bc');" },
        { name: 'усі атрибути у правильному порядку', code: "const d = new Date(Date.UTC(2030, 0, 1));\nexpect(serializeCookie('sid', 'x', { sameSite: 'STRICT', secure: true, httpOnly: true, expires: d, path: '/', domain: 'example.com', maxAge: 3600.7 }))\n  .toBe('sid=x; Max-Age=3600; Domain=example.com; Path=/; Expires=Tue, 01 Jan 2030 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict');" },
        { name: 'maxAge: 0 теж серіалізується (видалення cookie)', code: "expect(serializeCookie('a', '', { maxAge: 0 })).toBe('a=; Max-Age=0');" },
        { name: 'SameSite=None без Secure → TypeError', code: "expect(() => serializeCookie('a', '1', { sameSite: 'none' })).toThrow(TypeError);\nexpect(serializeCookie('a', '1', { sameSite: 'none', secure: true })).toBe('a=1; Secure; SameSite=None');" }
      ],
      explanation: `
**Чому працює:** лінійний прохід \`split(';')\` + перший \`=\`; декодування в \`try/catch\`, бо cookie може записати будь-хто. Перша пара виграє, бо браузер надсилає cookie з більш специфічним \`Path\` першими.

**Складність:** O(n) за довжиною рядка.

**Типові помилки:** \`split('=')\` (втрачається \`==\` у base64); \`if (options.maxAge)\` губить \`0\`; не кодувати значення з \`;\`.

**Нюанси:** \`Max-Age\` пріоритетніший за \`Expires\`; \`HttpOnly\` з \`document.cookie\` поставити не можна — це атрибут серверного \`Set-Cookie\`.

**Що спитають далі:** чим \`Max-Age\` відрізняється від \`Expires\`? Що таке префікс \`__Host-\`?
`
    },
    {
      id: 'bapi-storage-event',
      group: 'storage',
      type: 'quiz',
      level: 3,
      title: 'Де спрацює подія storage',
      tags: ['storage', 'tabs'],
      question: `
Відкриті вкладки **A** і **B** одного сайту (той самий origin). У вкладці **A** виконується:

\`\`\`js
window.addEventListener('storage', (e) => console.log(e.key, e.newValue));
localStorage.setItem('theme', 'dark');
\`\`\`

Де буде виведено \`theme dark\` (обробник підписаний в обох вкладках)?
`,
      options: [
        'Лише у вкладці A',
        'В обох вкладках',
        'Лише у вкладці B (та інших вкладках цього origin, крім A)',
        'Ніде — подія storage працює тільки для sessionStorage'
      ],
      answer: 2,
      why: [
        'Хибно: вкладка, що зробила запис, подію storage не отримує — вона й так знає про свою зміну.',
        'Хибно: подія не приходить у документ — автор зміни, лише в інші документи origin.',
        'Правильно: storage генерується в усіх інших документах цього origin, що мають доступ до того ж localStorage.',
        'Хибно: подія працює саме для localStorage; для sessionStorage вона майже марна, бо сховище своє в кожної вкладки.'
      ],
      hint: "Ця подія задумана як механізм зв'язку між документами.",
      explanation: `
\`storage\` — механізм зв'язку **між** документами: приходить в інші вкладки/iframe того ж origin, але не туди, де був запис. Нюанси: якщо нове значення збігається зі старим — події немає; після \`localStorage.clear()\` \`e.key === null\`.

На цьому будують синхронізацію вкладок: logout, зміна теми, кошик.
`
    },
    {
      id: 'bapi-cross-tab-sync',
      group: 'storage',
      type: 'theory',
      level: 3,
      title: 'Синхронізація між вкладками',
      tags: ['storage', 'tabs', 'broadcastchannel'],
      question: "Користувач відкрив застосунок у кількох вкладках і натиснув «Вийти» в одній. Як зробити, щоб вийшли всі вкладки? Які механізми зв'язку між вкладками ви знаєте?",
      choices: [
        'Подія `storage` приходить і у вкладку, яка записала значення, тож одним обробником охоплює всі вкладки',
        '`window.postMessage` без цільового вікна автоматично доставляє повідомлення в усі вкладки origin',
        '`BroadcastChannel` розсилає `logout` іншим вкладкам origin, а сервер однаково інвалідує сесію',
        'Досить очистити `sessionStorage` в одній вкладці — в інших вкладках він очиститься автоматично',
        'Вкладки не можуть обмінюватися даними без сервера, тож потрібен лише WebSocket-push про вихід'
      ],
      correct: 2,
      why: [
        'Хибно: подія storage не приходить у вкладку, яка зробила запис, — її треба обробити окремо.',
        'Хибно: window.postMessage потребує конкретного вікна (iframe, opener) і не розсилає повідомлення всім вкладкам.',
        'Правильно: BroadcastChannel — нативний pub/sub між вкладками одного origin; а сесію однаково має інвалідувати сервер.',
        'Хибно: sessionStorage у кожної вкладки свій — очищення в одній не впливає на інші.',
        'Хибно: вкладки одного origin спілкуються без сервера — подія storage, BroadcastChannel, SharedWorker.'
      ],
      hint: 'Подумайте про подію storage, BroadcastChannel, SharedWorker і Service Worker.',
      answer: `
**1. \`BroadcastChannel\`** — призначений саме для цього: pub/sub між вкладками, iframe і воркерами одного origin, дані через structured clone.

\`\`\`js
const channel = new BroadcastChannel('auth');
channel.postMessage({ type: 'logout' });              // у вкладці, де натиснули «Вийти»
channel.onmessage = (e) => { if (e.data.type === 'logout') redirectToLogin(); };
\`\`\`

**2. Подія \`storage\`** — старіший спосіб: запис у \`localStorage\` генерує подію в **інших** вкладках.
\`\`\`js
localStorage.setItem('logout', String(Date.now())); // значення має змінитися
window.addEventListener('storage', (e) => { if (e.key === 'logout') redirectToLogin(); });
\`\`\`
Мінуси: лише рядки, у поточній вкладці подія не приходить.

**3. \`SharedWorker\`** — один воркер на всі вкладки (спільний стан, одне WebSocket-з'єднання). **4. Service Worker** — \`clients.matchAll()\` + \`postMessage\`.

**Обов'язково згадати:** сервер теж інвалідує сесію — клієнтська синхронізація лише UX. Для «одна вкладка робить роботу за всіх» — leader election через Web Locks (\`navigator.locks.request\`).
`,
      keyPoints: [
        'Подія storage приходить в інші вкладки того ж origin; значення має змінитися',
        'BroadcastChannel — нативний pub/sub між вкладками, structured clone',
        'SharedWorker / Service Worker як спільний посередник',
        'Сервер має інвалідувати сесію — синхронізація на клієнті лише для UX',
        'Leader election (Web Locks) для задач «одна вкладка на всіх»'
      ],
      followUps: [
        'Чому подія storage не приходить у вкладку, яка зробила запис?',
        "Як зробити одне WebSocket-з'єднання на всі вкладки?",
        'Чи працює BroadcastChannel між різними origin?'
      ]
    },
    // ---------------------------------------------------------------- URL і query-параметри
    {
      id: 'bapi-urlsearchparams-encoding',
      group: 'url',
      type: 'quiz',
      level: 1,
      title: 'Як URLSearchParams кодує рядок',
      tags: ['url'],
      question: `
Що виведе код?

\`\`\`js
const p = new URLSearchParams({ q: 'tea & coffee', page: 1 });
console.log(p.toString());
\`\`\`
`,
      options: [
        '`q=tea & coffee&page=1`',
        '`q=tea%20%26%20coffee&page=1`',
        '`q=tea+%26+coffee&page=1`',
        '`q=tea+&+coffee&page=1`'
      ],
      answer: 2,
      why: [
        'Хибно: URLSearchParams завжди кодує значення — сирий & розбив би параметр на два.',
        'Хибно: пробіл як %20 дає encodeURIComponent; формат x-www-form-urlencoded кодує пробіл як +.',
        "Правильно: пробіл → +, & → %26, число 1 → рядок '1'.",
        'Хибно: & у значенні має бути закодований як %26, інакше сервер побачить окремий ключ « coffee».'
      ],
      hint: '`URLSearchParams` серіалізує за правилами `application/x-www-form-urlencoded`. Як там кодується пробіл?',
      explanation: `
\`URLSearchParams\` серіалізує за правилами \`application/x-www-form-urlencoded\`: пробіл → \`+\`, спецсимволи → \`%XX\`. Сервер зазвичай розуміє і \`+\`, і \`%20\`, але це різні рядки (важливо для підписів запитів і ключів кешу).

При парсингу \`URLSearchParams\` перетворює \`+\` назад на пробіл, а \`decodeURIComponent\` — **ні**.
`
    },
    {
      id: 'bapi-parse-query',
      group: 'url',
      type: 'code',
      level: 2,
      title: 'parseQuery / stringifyQuery з масивами',
      tags: ['url', 'parsing'],
      description: `
**Завдання.** Напишіть пару функцій: \`parseQuery\` перетворює query-рядок на об'єкт, \`stringifyQuery\` — об'єкт назад на рядок. Повторювані ключі мають ставати масивами.

**Де трапляється:** фільтри каталогу в URL (\`?brand=apple&brand=samsung&sort=price\`), щоб сторінкою з фільтрами можна було поділитися посиланням. Класика співбесід — аналог бібліотек \`qs\` / \`query-string\`.

**Що написати**
- \`parseQuery(query)\` → об'єкт:
  - провідний \`?\` необов'язковий; порожні фрагменти (\`&&\`) пропускаються;
  - ключ без \`=\` → значення \`''\`;
  - \`+\` → пробіл, \`%XX\` декодуються (і в ключах, і в значеннях);
  - ключ, що зустрівся кілька разів → **масив** значень у порядку появи;
  - ключ із суфіксом \`[]\` (\`tags[]=a\`) → завжди масив під ключем без \`[]\`.
- \`stringifyQuery(obj)\` → рядок **без** \`?\`:
  - ключі й значення кодуються \`encodeURIComponent\` (пробіл → \`%20\`);
  - масив → повторювані ключі (\`a=1&a=2\`), порожній масив пропускається;
  - \`null\` і \`undefined\` пропускаються; решта → \`String(value)\` (\`0\`, \`false\`, \`''\` зберігаються).

**Приклад**
\`\`\`js
parseQuery('?a=1&b=2&a=3&flag&q=hello+world&tags[]=x');
// { a: ['1', '3'], b: '2', flag: '', q: 'hello world', tags: ['x'] }

stringifyQuery({ a: [1, 2], q: 'a b', skip: null, ok: true });
// 'a=1&a=2&q=a%20b&ok=true'
\`\`\`

**Як це працює:** query — це пари \`key=value\`, розділені \`&\`, де спецсимволи закодовані як \`%XX\`, а пробіл — як \`+\` (формат HTML-форм). \`decodeURIComponent\` плюс у пробіл **не** перетворює, тому \`+\` замінюємо **до** декодування — тоді закодований плюс \`%2B\` коректно стане \`+\`.

**Врахуйте:**
- значення може містити \`=\` (\`eq=a=b\`) — ділимо за першим \`=\`;
- \`''\` і \`'?'\` → \`{}\`;
- round-trip: \`parseQuery(stringifyQuery(obj))\` повертає рядкові версії значень.
`,
      starter: `function parseQuery(query) {
  const result = {};
  // 1. Зріжте провідний '?'
  // 2. Розбийте за '&', порожні частини пропустіть
  // 3. Ділимо за першим '=' (indexOf); ключ без '=' → значення ''
  // 4. decode = (s) => decodeURIComponent(s.replace(/\\+/g, ' '))
  // 5. Ключ із '[]' → обріжте суфікс і зробіть значення масивом
  // 6. Ключ уже є → result[key] = [].concat(result[key], value)
  // TODO
  return result;
}

function stringifyQuery(obj) {
  const parts = [];
  // 1. Для кожної пари [key, value] з Object.entries(obj):
  //    null/undefined → пропустити; масив → кожен елемент окремо
  // 2. parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(v)))
  // TODO
  return parts.join('&');
}

// Спробуйте в консолі:
// parseQuery('?a=1&a=2&q=hi+there'); // { a: ['1', '2'], q: 'hi there' }
// stringifyQuery({ a: [1, 2], q: 'a b' }); // 'a=1&a=2&q=a%20b'
`,
      solution: `function parseQuery(query) {
  const result = {};
  const str = query.startsWith('?') ? query.slice(1) : query;
  const decode = (s) => decodeURIComponent(s.replace(/\\+/g, ' '));

  for (const part of str.split('&')) {
    if (!part) continue;
    const eq = part.indexOf('=');
    let key = decode(eq === -1 ? part : part.slice(0, eq));
    const value = eq === -1 ? '' : decode(part.slice(eq + 1));

    let forceArray = false;
    if (key.endsWith('[]')) {
      key = key.slice(0, -2);
      forceArray = true;
    }

    if (key in result) {
      // другий і наступні входження перетворюють значення на масив
      result[key] = [].concat(result[key], value);
    } else {
      result[key] = forceArray ? [value] : value;
    }
  }
  return result;
}

function stringifyQuery(obj) {
  const enc = encodeURIComponent;
  const parts = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    const values = Array.isArray(value) ? value : [value];
    for (const v of values) {
      if (v === null || v === undefined) continue;
      parts.push(enc(key) + '=' + enc(String(v)));
    }
  }
  return parts.join('&');
}
`,
      hints: [
        'Зріжте `?`, розбийте за `&`, кожну пару — за першим `=`. Перед `decodeURIComponent` замініть `+` на пробіл.',
        'При повторному ключі: `result[key] = [].concat(result[key], value)` — працює і для рядка, і для масиву. Для `tags[]` одразу кладіть `[value]`.',
        'У `stringifyQuery` нормалізуйте значення до масиву: `const values = Array.isArray(v) ? v : [v]` — і обробіть масиви та скаляри одним циклом.'
      ],
      tests: [
        { name: "базовий парсинг, ? необов'язковий", code: "expect(parseQuery('?a=1&b=two')).toEqual({ a: '1', b: 'two' });\nexpect(parseQuery('a=1')).toEqual({ a: '1' });\nexpect(parseQuery('')).toEqual({});\nexpect(parseQuery('?')).toEqual({});" },
        { name: 'повторювані ключі → масив', code: "expect(parseQuery('a=1&b=2&a=3&a=4')).toEqual({ a: ['1', '3', '4'], b: '2' });" },
        { name: 'декодування: + і %XX у ключах і значеннях', code: "expect(parseQuery('q=hello+world&name=%D0%9A%D0%B8%D1%97%D0%B2&my%20key=a%26b')).toEqual({ q: 'hello world', name: 'Київ', 'my key': 'a&b' });" },
        { name: 'ключ без =, порожні фрагменти і значення з =', code: "expect(parseQuery('flag&&x=&eq=a=b')).toEqual({ flag: '', x: '', eq: 'a=b' });" },
        { name: 'суфікс [] → завжди масив', code: "expect(parseQuery('tags[]=x')).toEqual({ tags: ['x'] });\nexpect(parseQuery('tags[]=x&tags[]=y&id=1')).toEqual({ tags: ['x', 'y'], id: '1' });" },
        { name: 'stringify: масиви, null/undefined, кодування', code: "expect(stringifyQuery({ a: [1, 2], q: 'a b&c', skip: null, u: undefined, ok: true, zero: 0, empty: '' }))\n  .toBe('a=1&a=2&q=a%20b%26c&ok=true&zero=0&empty=');" },
        { name: "stringify: порожній масив і порожній об'єкт", code: "expect(stringifyQuery({ list: [], x: 1 })).toBe('x=1');\nexpect(stringifyQuery({})).toBe('');" },
        { name: 'round-trip', code: "const obj = { city: 'Львів', tags: ['js', 'css'], q: '50% off' };\nexpect(parseQuery(stringifyQuery(obj))).toEqual(obj);" }
      ],
      explanation: `
**Чому працює:** лінійний прохід: \`split('&')\` → перший \`=\` → \`+\` на пробіл → \`decodeURIComponent\`. Порядок важливий: спершу \`+\`, потім декодування.

**Складність:** O(n) за довжиною рядка.

**Альтернатива на вбудованому API:** \`for (const [k, v] of new URLSearchParams(query))\` сам зріже \`?\`, обробить \`+\` і декодування — лишиться логіка масивів.

**Типові помилки:** \`split('=')\` (губиться \`a=b\` у значенні); не декодувати ключі; \`if (!value)\` замість перевірки на \`null/undefined\` (губляться \`0\` і \`''\`).

**Що спитають далі:** як серіалізувати вкладені об'єкти (\`filter[price][min]=10\`)? Чим погана форма «рядок або масив» для типізації?
`
    },
    {
      id: 'bapi-build-url',
      group: 'url',
      type: 'code',
      level: 3,
      title: 'buildUrl: злиття query-параметрів через URL API',
      tags: ['url'],
      description: `
**Завдання.** Напишіть \`buildUrl(url, params)\`, яка додає, замінює або видаляє query-параметри в URL, використовуючи вбудовані \`URL\` і \`URLSearchParams\`.

**Де трапляється:** API-клієнт додає \`page\`, \`limit\` і фільтри до базового URL; кнопка «наступна сторінка» змінює лише \`page\`, зберігаючи решту параметрів і \`#hash\`.

**Що написати**
- \`buildUrl(url, params = {})\` → рядок URL:
  - \`url\` — абсолютний (\`https://api.com/items?x=1\`) або відносний від кореня (\`/items?x=1#top\`); відносний має **залишитися** відносним;
  - параметр із \`params\` **замінює** однойменний існуючий;
  - \`null\` / \`undefined\` → параметр **видаляється**;
  - масив → повторювані ключі (\`tag=a&tag=b\`) замість існуючих;
  - існуючі параметри зберігають позиції, нові — в кінець; \`#hash\` зберігається;
  - параметрів не лишилося → без \`?\`; кодування — як у \`URLSearchParams\` (пробіл → \`+\`).

**Приклад**
\`\`\`js
buildUrl('https://api.com/items', { page: 2, q: 'a b' }); // 'https://api.com/items?page=2&q=a+b'
buildUrl('/items?page=1&sort=asc#top', { page: 3 });       // '/items?page=3&sort=asc#top'
buildUrl('/a?x=1&y=2', { x: null });                        // '/a?y=2'
\`\`\`

**Як це працює:** \`new URL(url, base)\` розбирає рядок на частини (\`pathname\`, \`search\`, \`hash\`), а \`u.searchParams\` — «живий» \`URLSearchParams\`: його зміни одразу оновлюють \`u.search\`. Відносний URL парсимо з фіктивною базою і повертаємо лише \`pathname + search + hash\`.

**Врахуйте:**
- \`set\` замінює всі однойменні значення, зберігаючи позицію першого; \`append\` додає ще одне; \`delete\` видаляє всі;
- \`new URL('/a')\` без бази кидає \`TypeError\`;
- \`0\` — валідне значення, видаляють лише \`null\`/\`undefined\`.
`,
      starter: `function buildUrl(url, params = {}) {
  // 1. Абсолютний URL? /^[a-z][a-z\\d+.-]*:/i.test(url)
  // 2. const u = new URL(url, 'http://placeholder.local');
  // 3. Для кожної пари [key, value] з Object.entries(params):
  //    - null/undefined → u.searchParams.delete(key)
  //    - масив → delete(key), потім append(key, String(v)) для кожного
  //    - інакше → u.searchParams.set(key, String(value))
  // 4. Поверніть u.href (абсолютний) або u.pathname + u.search + u.hash
  // TODO
}

// Спробуйте в консолі:
// buildUrl('/items?page=1#top', { page: 2, q: 'js' }); // '/items?page=2&q=js#top'
`,
      solution: `function buildUrl(url, params = {}) {
  // Відносний URL парсимо відносно фіктивної бази, щоб скористатися URL API
  const isAbsolute = /^[a-z][a-z\\d+.-]*:/i.test(url);
  const u = new URL(url, 'http://placeholder.local');

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      u.searchParams.delete(key);
    } else if (Array.isArray(value)) {
      u.searchParams.delete(key);
      value.forEach((v) => u.searchParams.append(key, String(v)));
    } else {
      u.searchParams.set(key, String(value)); // set зберігає позицію першого входження
    }
  }

  // Якщо searchParams порожні, u.search === '' — зайвого '?' не буде
  return isAbsolute ? u.href : u.pathname + u.search + u.hash;
}
`,
      hints: [
        "Відносний URL розпарсіть як `new URL(url, 'http://placeholder.local')`, а поверніть лише `pathname + search + hash`.",
        '`searchParams.set` замінює всі однойменні параметри (позиція зберігається), `delete` видаляє, `append` додає ще одне значення.',
        'Коли всі параметри видалено, `u.search` — порожній рядок, тож `?` руками не додавайте.'
      ],
      tests: [
        { name: 'додає параметри до абсолютного URL', code: "expect(buildUrl('https://api.com/items', { page: 2, q: 'a b' })).toBe('https://api.com/items?page=2&q=a+b');" },
        { name: 'замінює існуючі, зберігає порядок і hash', code: "expect(buildUrl('/items?page=1&sort=asc#top', { page: 3, limit: 10 })).toBe('/items?page=3&sort=asc&limit=10#top');" },
        { name: 'null/undefined видаляють параметр', code: "expect(buildUrl('/a?x=1&y=2', { x: null })).toBe('/a?y=2');\nexpect(buildUrl('/a?x=1', { x: undefined })).toBe('/a');" },
        { name: 'масиви → повторювані ключі із заміною', code: "expect(buildUrl('https://s.com/?tag=old&a=1', { tag: ['x', 'y z'] })).toBe('https://s.com/?a=1&tag=x&tag=y+z');" },
        { name: 'без параметрів URL не змінюється (окрім нормалізації)', code: "expect(buildUrl('/path?a=1#h')).toBe('/path?a=1#h');\nexpect(buildUrl('https://api.com/v1/users', {})).toBe('https://api.com/v1/users');" },
        { name: 'кодує спецсимволи у значеннях', code: "expect(buildUrl('/s', { q: 'a&b=c', city: 'Київ' })).toBe('/s?q=a%26b%3Dc&city=%D0%9A%D0%B8%D1%97%D0%B2');" }
      ],
      explanation: `
**Чому працює:** \`URL\` + \`searchParams\` беруть на себе розбір query, кодування, збереження \`#hash\` і відсутність зайвого \`?\`. Ручна склейка — джерело багів: подвійний \`?\`, незакодований \`&\`, втрачений hash.

**Складність:** O(n + m) — довжина URL і кількість параметрів.

**Типові помилки:** \`new URL('/a')\` без бази; плутанина \`+\`/\`%20\`; \`if (value)\` замість \`== null\` (губиться \`0\`).

**Що спитають далі:** як нормалізувати URL для ключа кешу (\`searchParams.sort()\`)? Що таке \`URL.canParse()\`?
`
    },
    // ---------------------------------------------------------------- fetch, Response і FormData
    {
      id: 'bapi-fetch-404',
      group: 'fetch',
      type: 'quiz',
      level: 1,
      interview: true,
      title: 'fetch і відповідь 404',
      tags: ['fetch'],
      question: `
Сервер відповідає на запит статусом **404**. Що виведе код?

\`\`\`js
fetch('/api/missing')
  .then((res) => console.log('then', res.ok, res.status))
  .catch(() => console.log('catch'));
\`\`\`
`,
      options: ['`catch`', '`then false 404`', '`then true 404`', '`then false 404`, а потім `catch`'],
      answer: 1,
      why: [
        'Хибно: 404 — успішний HTTP-обмін; fetch відхиляється лише при мережевій помилці чи abort.',
        'Правильно: проміс виконується з Response, де ok === false (статус поза 200–299), а status === 404.',
        'Хибно: ok дорівнює true лише для статусів 200–299, тож для 404 він false.',
        'Хибно: then нічого не кинув, тому catch не спрацює.'
      ],
      hint: 'Чи є 404 «помилкою» з погляду мережі? Сервер же відповів.',
      explanation: `
Проміс \`fetch\` виконується, щойно прийшли заголовки, — **незалежно від статусу**. \`catch\` ловить лише мережеві помилки (немає з'єднання, DNS, CORS-блокування) і скасування. Тому в коді завжди: \`if (!res.ok) throw new Error('HTTP ' + res.status)\`.

**Що спитають далі:** чим це відрізняється від axios (він відхиляє проміс на не-2xx)?
`
    },
    {
      id: 'bapi-fetch-body-once',
      group: 'fetch',
      type: 'quiz',
      level: 2,
      title: 'Повторне читання тіла відповіді',
      tags: ['fetch'],
      question: `
Сервер відповідає \`200\` з тілом \`{"name":"Ann"}\`. Що станеться?

\`\`\`js
const res = await fetch('/api/user');
const data = await res.json();
const text = await res.text();
console.log(text);
\`\`\`
`,
      options: [
        'Виведе `{"name":"Ann"}`',
        'Виведе порожній рядок',
        'Виведе `[object Object]`',
        '`res.text()` відхилиться з `TypeError` (тіло вже прочитане)'
      ],
      answer: 3,
      why: [
        'Хибно: браузер не кешує тіло — після json() потік уже вичерпано.',
        'Хибно: порожнього рядка не буде — повторне читання відхиляється з помилкою.',
        "Хибно: '[object Object]' вийшов би при приведенні об'єкта до рядка, а text() читає потік.",
        'Правильно: body — ReadableStream, читається один раз; після json() bodyUsed === true і text() відхиляється з TypeError.'
      ],
      hint: 'Тіло відповіді — це потік (ReadableStream).',
      explanation: `
Тіло відповіді — потік (\`ReadableStream\`), прочитати його можна **один раз**. Щоб прочитати двічі: \`res.clone()\` **до** читання або один раз \`text()\`, а потім \`JSON.parse\` вручну (зручно, щоб показати сирий текст при помилці парсингу).
`
    },
    {
      id: 'bapi-formdata-content-type',
      group: 'fetch',
      type: 'quiz',
      level: 2,
      title: 'FormData і заголовок Content-Type',
      tags: ['fetch', 'formdata'],
      question: `
Форма з файлом відправляється так, але сервер не може розібрати тіло запиту. Чому?

\`\`\`js
const fd = new FormData(form);
fetch('/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'multipart/form-data' },
  body: fd,
});
\`\`\`
`,
      options: [
        '`FormData` не можна передати в `body` — треба `JSON.stringify(fd)`',
        'Для завантаження файлів потрібен метод `PUT`',
        'Заголовок вказано вручну без `boundary`, тож сервер не знає, де межі частин тіла',
        '`fetch` не підтримує `multipart`, файли можна відправити лише через `XMLHttpRequest`'
      ],
      answer: 2,
      why: [
        "Хибно: FormData передається в body напряму; JSON.stringify(fd) дасть '{}', і файл загубиться.",
        'Хибно: тіло можна надіслати будь-яким методом з тілом — POST, PUT, PATCH.',
        'Правильно: браузер сам ставить multipart/form-data з boundary; ручний заголовок без boundary ламає розбір тіла.',
        'Хибно: fetch повністю підтримує multipart; XHR потрібен хіба що для прогресу завантаження.'
      ],
      hint: 'Подивіться, як виглядає повний заголовок multipart-запиту, який формує браузер сам.',
      explanation: `
З \`body: FormData\` браузер сам формує \`Content-Type: multipart/form-data; boundary=----...\`. \`boundary\` — роздільник частин тіла. Рішення — **не вказувати** \`Content-Type\`. Те саме з \`URLSearchParams\` (браузер поставить \`application/x-www-form-urlencoded\`). Для JSON навпаки потрібно явно: \`'Content-Type': 'application/json'\` + \`JSON.stringify\`.
`
    },
    {
      id: 'bapi-form-to-object',
      group: 'fetch',
      type: 'dom',
      level: 1,
      title: "Форма → об'єкт через FormData",
      tags: ['formdata', 'forms'],
      description: `
**Завдання.** Напишіть \`formToObject(form)\`, що збирає значення форми в об'єкт через \`FormData\`, і обробник відправки форми, який показує цей об'єкт як JSON без перезавантаження сторінки.

**Де трапляється:** відправка форми профілю чи фільтрів через \`fetch\` без перезавантаження; зібрати значення для валідації або логування.

**Дано (HTML)**
- \`<form id="profile">\` з полями: \`name\`, \`email\`, три чекбокси \`name="skills"\` (\`js\` і \`react\` відмічені), \`<select name="level">\` (обрано \`middle\`), \`<input name="internal" disabled>\` і кнопка «Зберегти»;
- \`<pre id="output">\` — сюди виводимо результат.
- Змінні \`form\` і \`output\` уже оголошені в JS.

**Що написати**
- \`formToObject(form)\` → об'єкт \`{ [name]: value }\`; якщо ім'я зустрілося кілька разів (група чекбоксів) — **масив** значень; якщо відмічено один — рядок; невідмічені чекбокси й \`disabled\`-поля в об'єкт не потрапляють.
- Обробник події \`submit\` форми \`#profile\`: скасувати перезавантаження і записати в \`#output\` рядок \`JSON.stringify(formToObject(form))\`.

**Приклад**
\`\`\`js
formToObject(form);
// { name: 'Ann', email: 'ann@example.com', skills: ['js', 'react'], level: 'middle' }
\`\`\`

**Як це працює:** \`new FormData(form)\` збирає поля **так само, як браузер при нативній відправці**: лише з \`name\`, без \`disabled\`, лише відмічені чекбокси, обраний \`<option>\`. Це ітерований об'єкт пар \`[name, value]\`, тож його можна обійти \`for...of\`.

**Врахуйте:**
- \`Object.fromEntries(new FormData(form))\` для повторюваних імен лишить тільки **останнє** значення;
- обробник вішайте на \`submit\` форми, а не на \`click\` кнопки (Enter у полі теж відправляє форму);
- без \`preventDefault()\` сторінка перезавантажиться.
`,
      html: `<form id="profile">
  <p><input name="name" value="Ann"></p>
  <p><input name="email" type="email" value="ann@example.com"></p>
  <p>
    <label><input type="checkbox" name="skills" value="js" checked> JS</label>
    <label><input type="checkbox" name="skills" value="css"> CSS</label>
    <label><input type="checkbox" name="skills" value="react" checked> React</label>
  </p>
  <p>
    <select name="level">
      <option>junior</option>
      <option selected>middle</option>
      <option>senior</option>
    </select>
  </p>
  <input name="internal" value="secret" disabled>
  <button>Зберегти</button>
</form>
<pre id="output"></pre>`,
      css: '#output { background: #f4f4f4; padding: 8px; }',
      js: `const form = document.querySelector('#profile');
const output = document.querySelector('#output');

function formToObject(form) {
  const result = {};
  // 1. for (const [name, value] of new FormData(form)) { ... }
  // 2. Імені ще немає → result[name] = value
  //    Вже є → result[name] = [].concat(result[name], value)
  // TODO
  return result;
}

// 3. form.addEventListener('submit', (e) => { ... }):
//    e.preventDefault(); output.textContent = JSON.stringify(formToObject(form));
// TODO

// Спробуйте в консолі: formToObject(form)
`,
      editable: ['js'],
      solution: {
        js: `const form = document.querySelector('#profile');
const output = document.querySelector('#output');

function formToObject(form) {
  const result = {};
  for (const [name, value] of new FormData(form)) {
    if (name in result) {
      // друге входження імені → масив
      result[name] = [].concat(result[name], value);
    } else {
      result[name] = value;
    }
  }
  return result;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  output.textContent = JSON.stringify(formToObject(form));
});
`
      },
      hints: [
        "`new FormData(form)` — ітерований об'єкт пар `[name, value]`; обійдіть його `for...of`.",
        'Якщо ключ уже є в результаті — перетворіть значення на масив: `[].concat(result[name], value)`.',
        'У обробнику `submit` викличте `e.preventDefault()` і запишіть `JSON.stringify(formToObject(form))` в `output.textContent`.'
      ],
      tests: [
        { name: 'збирає поля, групу чекбоксів у масив, пропускає disabled', code: "expect(formToObject($('#profile'))).toEqual({ name: 'Ann', email: 'ann@example.com', skills: ['js', 'react'], level: 'middle' });" },
        { name: 'один відмічений чекбокс → рядок, жодного → ключа немає', code: "const boxes = $$('[name=skills]');\nconst saved = boxes.map((b) => b.checked);\ntry {\n  boxes.forEach((b, i) => { b.checked = i === 1; });\n  expect(formToObject($('#profile')).skills).toBe('css');\n  boxes.forEach((b) => { b.checked = false; });\n  expect('skills' in formToObject($('#profile'))).toBe(false);\n} finally {\n  boxes.forEach((b, i) => { b.checked = saved[i]; });\n}" },
        { name: 'submit скасовано, у #output — JSON форми', code: "input('[name=name]', 'Bob');\nconst r = submit('#profile');\nexpect(r.fired).toBe(true);\nexpect(r.prevented).toBe(true);\nexpect(JSON.parse($('#output').textContent)).toEqual({ name: 'Bob', email: 'ann@example.com', skills: ['js', 'react'], level: 'middle' });" }
      ],
      explanation: `
**Чому працює:** \`FormData\` повторює правила нативної відправки форми — не треба вручну обходити \`form.elements\` з перевірками \`checked\`/\`disabled\`.

**Складність:** O(n) за кількістю полів.

**Альтернативи:** \`fd.getAll('skills')\` — коли заздалегідь відомо, що поле множинне (передбачуваніше для бекенду); або надіслати \`FormData\` прямо: \`fetch(url, { method: 'POST', body: fd })\`.

**Типові помилки:** забутий \`preventDefault\`; \`click\` на кнопці замість \`submit\` форми; \`Object.fromEntries\` для групи чекбоксів.

**Що спитають далі:** чим \`form.requestSubmit()\` відрізняється від \`form.submit()\` (останній не генерує \`submit\` і не валідує)?
`
    },
    {
      id: 'bapi-fetch-json',
      group: 'fetch',
      type: 'code',
      level: 2,
      title: 'Обгортка над fetch: JSON-запити і HttpError',
      tags: ['fetch', 'errors'],
      description: `
**Завдання.** Напишіть клас помилки \`HttpError\` і функцію \`request(url, options)\` — мінімальну обгортку над \`fetch\`, яка сама серіалізує JSON і кидає помилку на 4xx/5xx.

**Де трапляється:** шар API в будь-якому проєкті без axios — єдине місце для заголовків, JSON і обробки помилок. На співбесідах часто просять «напишіть свій міні-axios».

**Що написати**
- \`class HttpError extends Error\` — \`new HttpError(status, data)\`: \`name === 'HttpError'\`, \`message === 'HTTP <status>'\`, поля \`status\` і \`data\` (розпарсене тіло відповіді з помилкою).
- \`request(url, { method = 'GET', body, headers = {} } = {})\` → проміс з даними відповіді:
  1. завжди додає заголовок \`Accept: application/json\`;
  2. \`body\` — звичайний об'єкт або масив → \`JSON.stringify\` + \`Content-Type: application/json\`; \`FormData\`, рядки тощо передаються як є (без \`Content-Type\`);
  3. статус \`204\` → \`null\`; інакше тіло як JSON, якщо \`Content-Type\` відповіді містить \`json\`, інакше як текст;
  4. \`!res.ok\` → кидає \`HttpError\` з \`data\` = тіло відповіді;
  5. мережеві помилки пробрасуються як є.

**Приклад**
\`\`\`js
const user = await request('/api/users', { method: 'POST', body: { name: 'Ann' } });
try {
  await request('/api/users/999');
} catch (e) {
  if (e instanceof HttpError && e.status === 404) showNotFound();
}
\`\`\`

**Як це працює:** \`fetch\` не відхиляє проміс на 4xx/5xx — тож обгортка перевіряє \`res.ok\` і перетворює погану відповідь на виняток. \`new Headers(headers)\` нормалізує регістр імен і приймає об'єкт чи масив пар. \`FormData\` відрізняємо від звичайного об'єкта за прототипом: у \`{}\` він \`Object.prototype\`.

**Врахуйте:**
- у \`204 No Content\` немає тіла — \`res.json()\` упав би;
- тіло помилки часто містить помилки валідації — кладіть його в \`data\`;
- \`HttpError\` має бути \`instanceof Error\`.
`,
      starter: `class HttpError extends Error {
  constructor(status, data) {
    // 1. super('HTTP ' + status)
    // 2. this.name = 'HttpError'; збережіть status і data
    super('TODO');
  }
}

async function request(url, { method = 'GET', body, headers = {} } = {}) {
  // 1. const finalHeaders = new Headers(headers); finalHeaders.set('Accept', 'application/json');
  // 2. Звичайний об'єкт/масив у body → JSON.stringify і Content-Type: application/json
  //    (звичайний: Array.isArray(body) || Object.getPrototypeOf(body) === Object.prototype)
  // 3. const res = await fetch(url, { method, headers: finalHeaders, body: ... });
  // 4. data: 204 → null; Content-Type містить 'json' → await res.json(), інакше await res.text()
  // 5. if (!res.ok) throw new HttpError(res.status, data); return data;
  // TODO
}

// Спробуйте в консолі:
// request('https://jsonplaceholder.typicode.com/todos/1').then(console.log);
`,
      solution: `class HttpError extends Error {
  constructor(status, data) {
    super('HTTP ' + status);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

async function parseBody(res) {
  if (res.status === 204) return null;
  const type = res.headers.get('Content-Type') || '';
  return type.includes('json') ? res.json() : res.text();
}

async function request(url, { method = 'GET', body, headers = {} } = {}) {
  const finalHeaders = new Headers(headers);
  finalHeaders.set('Accept', 'application/json');

  let finalBody = body;
  const isPlain = body !== null && typeof body === 'object' &&
    (Array.isArray(body) || Object.getPrototypeOf(body) === Object.prototype);
  if (isPlain) {
    finalBody = JSON.stringify(body);
    finalHeaders.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { method, headers: finalHeaders, body: finalBody });
  const data = await parseBody(res);
  if (!res.ok) throw new HttpError(res.status, data);
  return data;
}
`,
      hints: [
        "У `HttpError`: `super('HTTP ' + status)`, далі `this.name`, `this.status`, `this.data`.",
        "Звичайний об'єкт відрізніть від `FormData` через `Object.getPrototypeOf(body) === Object.prototype` (плюс `Array.isArray`). Заголовки збирайте в `new Headers(headers)`.",
        "Тип відповіді — `res.headers.get('Content-Type') || ''`; для 204 поверніть `null` до спроби парсингу; `HttpError` кидайте вже після читання тіла."
      ],
      tests: [
        { name: 'GET повертає JSON і надсилає Accept', code: "const f = mockFetch(() => ({ id: 1 }));\nawait expect(request('/api/users/1')).resolves.toEqual({ id: 1 });\nconst init = f.mock.calls[0][1];\nexpect(new Headers(init.headers).get('accept')).toBe('application/json');\nexpect((init.method || 'GET').toUpperCase()).toBe('GET');" },
        { name: "об'єкт у body → JSON + Content-Type", code: "const f = mockFetch((url, init) => ({ status: 201, body: JSON.parse(init.body) }));\nawait expect(request('/api/users', { method: 'POST', body: { name: 'Ann' } })).resolves.toEqual({ name: 'Ann' });\nconst init = f.mock.calls[0][1];\nexpect(init.method).toBe('POST');\nexpect(init.body).toBe('{\"name\":\"Ann\"}');\nexpect(new Headers(init.headers).get('content-type')).toBe('application/json');" },
        { name: 'FormData передається як є, без Content-Type', code: "const f = mockFetch(() => 'ok');\nconst fd = new FormData();\nfd.append('a', '1');\nawait expect(request('/upload', { method: 'POST', body: fd })).resolves.toBe('ok');\nconst init = f.mock.calls[0][1];\nexpect(init.body).toBe(fd);\nexpect(new Headers(init.headers).has('content-type')).toBe(false);" },
        { name: '4xx → HttpError зі status і data', code: "mockFetch(() => ({ status: 422, body: { errors: ['name required'] } }));\nconst err = await request('/api/users', { method: 'POST', body: {} }).catch((e) => e);\nexpect(err).toBeInstanceOf(HttpError);\nexpect(err).toBeInstanceOf(Error);\nexpect(err.name).toBe('HttpError');\nexpect(err.message).toBe('HTTP 422');\nexpect(err.status).toBe(422);\nexpect(err.data).toEqual({ errors: ['name required'] });" },
        { name: '500 з текстовим тілом → data — текст', code: "mockFetch(() => ({ status: 500, body: 'Internal error' }));\nconst err = await request('/x').catch((e) => e);\nexpect(err.status).toBe(500);\nexpect(err.data).toBe('Internal error');" },
        { name: '204 → null; текстова відповідь → рядок', code: "mockFetch(() => ({ status: 204 }));\nawait expect(request('/x', { method: 'DELETE' })).resolves.toBe(null);\nmockFetch(() => 'plain text');\nawait expect(request('/y')).resolves.toBe('plain text');" },
        { name: 'мережева помилка пробрасується', code: "mockFetch(() => new TypeError('Failed to fetch'));\nawait expect(request('/x')).rejects.toThrow('Failed to fetch');" }
      ],
      explanation: `
**Чому працює:** обгортка централізує заголовки, серіалізацію і помилки — далі в коді лише \`try/catch\` з \`instanceof HttpError\`.

**Складність:** O(розмір тіла).

**Типові помилки:** \`res.json()\` без перевірки статусу; \`body: data\` без \`JSON.stringify\` (відправиться \`[object Object]\`); \`Content-Type\` вручну для \`FormData\`; \`HttpError\` без \`this.name\` (у логах буде просто \`Error\`).

**Що спитають далі:** як додати токен і оновлення токена при 401 (черга запитів)? Як додати таймаут через \`AbortController\`? Як типізувати \`request<T>()\` у TypeScript?
`
    },
    // ---------------------------------------------------------------- Скасування, таймаути, повтори
    {
      id: 'bapi-abort-controller',
      group: 'abort',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'AbortController: скасування запитів',
      tags: ['fetch', 'abort'],
      question: 'Як скасувати fetch-запит? Для чого ще використовують AbortController? Як вирішити проблему race condition у пошуку з автодоповненням? Оберіть **усі** правильні твердження.',
      choices: [
        'Після `abort()` проміс `fetch` відхиляється з `AbortError`, який UI не має показувати як помилку',
        'Скасування на клієнті гарантує, що сервер теж зупинить обробку, тож POST точно не виконається',
        'Той самий `signal` в `addEventListener` дозволяє одним `abort()` зняти всі обробники',
        'Контролер можна перевикористати: після `abort()` сигнал скидається для наступного запиту',
        'Race у пошуку вирішують, скасовуючи попередній запит перед новим або ігноруючи застарілі відповіді'
      ],
      correct: [0, 2, 4],
      why: [
        "Правильно: abort() відхиляє проміс fetch з DOMException 'AbortError' — це свідома дія, а не збій, тож помилку не показують.",
        'Хибно: скасування лише обриває очікування на клієнті; сервер міг уже обробити POST.',
        'Правильно: addEventListener(type, fn, { signal }) знімає обробник при abort() — зручно для cleanup компонента.',
        'Хибно: контролер одноразовий — після abort() сигнал назавжди aborted, для нового запиту потрібен новий контролер.',
        'Правильно: обидва підходи прибирають гонку — скасувати попередній запит або ігнорувати відповіді не на останній запит.'
      ],
      hint: 'Подумайте про signal, AbortError, застарілі відповіді та очищення обробників.',
      answer: `
**AbortController** — контролер із \`signal\` і методом \`abort(reason?)\`. Сигнал передають в API, яке вміє його слухати (\`fetch\`, \`addEventListener\`, власні функції).

**Race condition в автодоповненні:** набрали «re», потім «react»; відповідь на «re» прийшла **пізніше** і перезаписала правильні результати. Рішення — скасовувати попередній запит:

\`\`\`js
let controller;
async function search(q) {
  controller?.abort();                 // скасувати попередній
  controller = new AbortController();  // новий для кожного запиту
  try {
    const res = await fetch('/api/search?q=' + encodeURIComponent(q), { signal: controller.signal });
    render(await res.json());
  } catch (e) {
    if (e.name !== 'AbortError') showError(e);
  }
}
\`\`\`
Альтернатива — зберігати id останнього запиту й ігнорувати застарілі відповіді (але мережа однаково витрачається).

**Інші застосування:**
- \`addEventListener(type, fn, { signal })\` — один \`abort()\` знімає всі обробники;
- \`AbortSignal.timeout(ms)\` → помилка \`TimeoutError\`; \`AbortSignal.any([s1, s2])\` — комбінація;
- власні async-функції: \`signal.aborted\`, \`signal.throwIfAborted()\`, подія \`abort\`;
- React: \`useEffect(() => { ...; return () => controller.abort(); })\`.

**Нюанси:** сервер міг уже виконати запит; контролер одноразовий.
`,
      keyPoints: [
        'controller.signal передається у fetch, abort() відхиляє проміс з AbortError',
        'AbortError треба відрізняти від справжніх помилок і не показувати користувачу',
        'Race condition: скасовувати попередній запит або ігнорувати застарілі відповіді',
        'signal в addEventListener для масового зняття обробників',
        'AbortSignal.timeout / AbortSignal.any',
        'Контролер одноразовий; сервер може встигнути виконати запит'
      ],
      followUps: [
        'Як зробити таймаут для fetch без AbortSignal.timeout?',
        'Що буде, якщо викликати abort() після того, як відповідь уже прийшла?',
        'Як підтримати скасування у власній async-функції?'
      ]
    },
    {
      id: 'bapi-abort-error-names',
      group: 'abort',
      type: 'quiz',
      level: 3,
      title: 'AbortError vs TimeoutError',
      tags: ['fetch', 'abort'],
      question: `
Запит \`/slow\` відповідає через 5 секунд. Що виведе код?

\`\`\`js
const controller = new AbortController();
const p = fetch('/slow', { signal: controller.signal });
controller.abort();
try { await p; } catch (e) { console.log(e.name); }

try {
  await fetch('/slow', { signal: AbortSignal.timeout(10) });
} catch (e) {
  console.log(e.name);
}
\`\`\`
`,
      options: [
        '`AbortError AbortError`',
        '`Error TimeoutError`',
        '`AbortError TimeoutError`',
        '`TypeError TimeoutError`'
      ],
      answer: 2,
      why: [
        "Хибно: AbortSignal.timeout скасовує з власною причиною — DOMException 'TimeoutError'.",
        "Хибно: abort() без аргументу дає DOMException з name 'AbortError', а не загальний Error.",
        "Правильно: abort() → 'AbortError', AbortSignal.timeout(ms) → 'TimeoutError'; так розрізняють «скасував користувач» і «сервер не встиг».",
        'Хибно: TypeError fetch кидає при мережевій помилці (Failed to fetch), а не при скасуванні.'
      ],
      hint: 'Що лежить у `signal.reason` за замовчуванням для кожного з двох способів скасування?',
      explanation: `
\`fetch\` відхиляється значенням \`signal.reason\`. За замовчуванням це \`DOMException\`: \`'AbortError'\` для \`abort()\` і \`'TimeoutError'\` для \`AbortSignal.timeout()\`.

Нюанс: \`controller.abort(new Error('cancelled'))\` — проміс відхилиться саме цим об'єктом, і перевірка \`e.name === 'AbortError'\` вже не спрацює.
`
    },
    {
      id: 'bapi-fetch-timeout',
      group: 'abort',
      type: 'code',
      level: 3,
      title: 'fetchWithTimeout через AbortController',
      tags: ['fetch', 'abort', 'timers'],
      description: `
**Завдання.** Напишіть \`fetchWithTimeout(url, options)\` — \`fetch\`, який сам скасовується, якщо відповідь не прийшла за \`timeout\` мс, і поважає зовнішній \`signal\`.

**Де трапляється:** API-клієнт — «якщо сервер не відповів за 10 с, показати помилку й кнопку "Повторити"». Класика співбесід: \`fetch\` сам по собі таймауту не має.

**Що написати**
- \`fetchWithTimeout(url, { timeout = 5000, signal, ...init } = {})\` → проміс \`Response\`:
  - викликає \`fetch(url, { ...init, signal: <ваш сигнал> })\` — усі інші опції пробрасуються, \`timeout\` у \`fetch\` не передається;
  - не встигли за \`timeout\` мс → скасувати запит і відхилити проміс помилкою з \`name === 'TimeoutError'\` і \`message === 'Request timed out after <timeout>ms'\`;
  - зовнішній \`signal\` скасовано (до або під час запиту) → запит скасовується, проміс відхиляється з \`AbortError\` (не \`TimeoutError\`);
  - після завершення (успіх чи помилка) таймер **очищується**.

**Приклад**
\`\`\`js
const res = await fetchWithTimeout('/api/data', { timeout: 3000, method: 'POST', body: '...' });

const c = new AbortController();
fetchWithTimeout('/api/slow', { signal: c.signal }).catch((e) => e.name); // 'AbortError'
c.abort();
\`\`\`

**Як це працює:** створюємо власний \`AbortController\` і передаємо його \`signal\` у \`fetch\`. \`setTimeout\` через \`timeout\` мс викликає \`controller.abort()\` — \`fetch\` відхиляється з \`AbortError\`, а прапорець \`timedOut\` підказує, що це був саме таймаут. Зовнішній сигнал «прокидаємо» в наш контролер через його подію \`abort\`.

**Врахуйте:**
- тести використовують фейкові таймери, тому потрібні саме \`setTimeout\` + \`AbortController\` (не \`AbortSignal.timeout\`);
- уже скасований сигнал подію \`abort\` повторно не генерує — перевірте \`signal.aborted\` одразу;
- приберіть таймер і підписку у \`finally\`, інакше витік.
`,
      starter: `async function fetchWithTimeout(url, { timeout = 5000, signal, ...init } = {}) {
  const controller = new AbortController();
  let timedOut = false;

  // 1. const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeout);
  // 2. Зовнішній signal:
  //    - signal.aborted → controller.abort(signal.reason) одразу
  //    - інакше signal.addEventListener('abort', onAbort, { once: true })
  // 3. try { return await fetch(url, { ...init, signal: controller.signal }); }
  //    catch (err): timedOut → кинути Error з name = 'TimeoutError'
  //                 і message 'Request timed out after ' + timeout + 'ms'; інакше throw err
  //    finally: clearTimeout(timer); signal?.removeEventListener('abort', onAbort)
  // TODO
}

// Спробуйте в консолі:
// fetchWithTimeout('https://httpbin.org/delay/3', { timeout: 1000 }).catch((e) => console.log(e.name));
`,
      solution: `async function fetchWithTimeout(url, { timeout = 5000, signal, ...init } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeout);

  // Прокидаємо скасування зовнішнього сигналу в наш контролер
  const onAbort = () => controller.abort(signal.reason);
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener('abort', onAbort, { once: true });
  }

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (timedOut) {
      const timeoutError = new Error('Request timed out after ' + timeout + 'ms');
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }
    throw err;
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}
`,
      hints: [
        'Створіть `AbortController`, передайте його `signal` у `fetch`, а в колбеку `setTimeout` викличте `controller.abort()`.',
        'Щоб відрізнити таймаут від зовнішнього скасування, ставте `timedOut = true` у колбеку таймера і перевіряйте його в `catch`.',
        "Зовнішній сигнал: `if (signal.aborted) controller.abort(signal.reason); else signal.addEventListener('abort', onAbort, { once: true })`. Таймер і підписку прибирайте у `finally`."
      ],
      tests: [
        { name: 'повертає відповідь, якщо вона встигла', code: "useFakeTimers();\nmockFetch(() => ({ body: { ok: 1 }, delay: 100 }));\nconst p = fetchWithTimeout('/a', { timeout: 500 });\nawait flushPromises();\nadvanceTimersByTime(100);\nconst res = await p;\nexpect(await res.json()).toEqual({ ok: 1 });" },
        { name: 'після успіху таймер очищено', code: "useFakeTimers();\nmockFetch(() => ({ body: 1, delay: 50 }));\nconst p = fetchWithTimeout('/a', { timeout: 1000 });\nawait flushPromises();\nadvanceTimersByTime(50);\nawait p;\nexpect(getTimerCount()).toBe(0);" },
        { name: 'таймаут → TimeoutError з повідомленням', code: "useFakeTimers();\nmockFetch(() => ({ body: 1, delay: 1000 }));\nconst p = fetchWithTimeout('/slow', { timeout: 300 });\nawait flushPromises();\nadvanceTimersByTime(300);\nconst err = await p.catch((e) => e);\nexpect(err.name).toBe('TimeoutError');\nexpect(err.message).toBe('Request timed out after 300ms');" },
        { name: 'таймаут за замовчуванням — 5000 мс', code: "useFakeTimers();\nmockFetch(() => ({ body: 1, delay: 6000 }));\nconst p = fetchWithTimeout('/slow');\nlet settled = false;\np.catch(() => {}).finally(() => { settled = true; });\nawait flushPromises();\nadvanceTimersByTime(4999);\nawait flushPromises();\nexpect(settled).toBe(false);\nadvanceTimersByTime(1);\nconst err = await p.catch((e) => e);\nexpect(err.name).toBe('TimeoutError');" },
        { name: 'пробрасує опції і передає AbortSignal', code: "const f = mockFetch(() => 'ok');\nawait fetchWithTimeout('/a', { method: 'POST', body: 'x', headers: { A: '1' }, timeout: 100 });\nconst init = f.mock.calls[0][1];\nexpect(init.method).toBe('POST');\nexpect(init.body).toBe('x');\nexpect(init.headers).toEqual({ A: '1' });\nexpect(init.signal).toBeInstanceOf(AbortSignal);\nexpect('timeout' in init).toBe(false);" },
        { name: 'зовнішній signal скасовує запит з AbortError', code: "useFakeTimers();\nmockFetch(() => ({ body: 1, delay: 1000 }));\nconst c = new AbortController();\nconst p = fetchWithTimeout('/a', { timeout: 5000, signal: c.signal });\nawait flushPromises();\nc.abort();\nconst err = await p.catch((e) => e);\nexpect(err.name).toBe('AbortError');\nadvanceTimersByTime(5000);\nexpect(err.name).not.toBe('TimeoutError');" },
        { name: 'вже скасований signal → одразу AbortError', code: "useFakeTimers();\nmockFetch(() => ({ body: 1, delay: 100 }));\nconst c = new AbortController();\nc.abort();\nconst err = await fetchWithTimeout('/a', { signal: c.signal }).catch((e) => e);\nexpect(err.name).toBe('AbortError');" }
      ],
      explanation: `
**Чому працює:** \`abort()\` з таймера обриває \`fetch\`, прапорець \`timedOut\` перетворює \`AbortError\` на \`TimeoutError\`, а \`finally\` гарантує прибирання таймера й підписки.

**Сучасна альтернатива** (без фейкових таймерів):
\`\`\`js
const s = AbortSignal.any([signal, AbortSignal.timeout(timeout)].filter(Boolean));
return fetch(url, { ...init, signal: s });
\`\`\`

**Нюанс:** таймаут покриває очікування **заголовків**; читання великого тіла (\`res.json()\`) вже не обмежене.

**Типові помилки:** \`Promise.race([fetch, timeoutPromise])\` без \`abort\` — запит далі висить у мережі; неочищений таймер; власний \`signal\` перезаписує зовнішній.

**Що спитають далі:** чому \`Promise.race\` гірший? Як поєднати з повторами (retry)?
`
    },
    {
      id: 'bapi-fetch-retry',
      group: 'abort',
      type: 'code',
      level: 3,
      title: 'fetchWithRetry з експоненційним backoff',
      tags: ['fetch', 'retry', 'timers'],
      description: `
**Завдання.** Напишіть \`fetchWithRetry(url, init, options)\`, що повторює запит при тимчасових збоях (мережа, 5xx) з паузою, яка подвоюється (експоненційний backoff).

**Де трапляється:** нестабільний мобільний інтернет або сервер, що під навантаженням іноді відповідає 503. Часте завдання на співбесідах рівня Strong Middle.

**Що написати**
- \`fetchWithRetry(url, init = {}, { retries = 3, baseDelay = 500 } = {})\` → проміс \`Response\`:
  - повторює при **мережевій помилці** (\`fetch\` відхилився) і при статусі **5xx**;
  - **не** повторює при 4xx (повертає відповідь як є) і при \`AbortError\` (одразу пробрасує помилку);
  - пауза перед повтором №n (n = 1, 2, …) — \`baseDelay * 2^(n-1)\`: 500, 1000, 2000…;
  - максимум \`retries\` повторів (тобто \`retries + 1\` спроб); якщо всі невдалі: для 5xx — повернути **останню** відповідь, для мережевої помилки — кинути **останню** помилку.

**Приклад**
\`\`\`js
// сервер: 503, 503, 200
const res = await fetchWithRetry('/api/data', {}, { retries: 3, baseDelay: 500 });
// спроба 1 → 503 → пауза 500 мс → спроба 2 → 503 → пауза 1000 мс → спроба 3 → 200
res.status; // 200
\`\`\`

**Як це працює:** цикл спроб з \`try/catch\` усередині: «хороша» або неповторювана відповідь — \`return\`, інакше \`await\` паузи і наступна ітерація. Пауза — проміс над \`setTimeout\`, тож \`await\` зупиняє функцію, не блокуючи потік. Подвоєння паузи дає перевантаженому серверу час відновитися.

**Врахуйте:**
- 4xx — помилка клієнта, повтор дасть той самий результат;
- \`AbortError\` — свідоме скасування, повторювати не можна;
- \`retries: 0\` — рівно одна спроба.
`,
      starter: `// Пауза як проміс: await wait(500)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, init = {}, { retries = 3, baseDelay = 500 } = {}) {
  for (let attempt = 0; ; attempt++) {
    // 1. try { const res = await fetch(url, init); ... }
    //    res.status < 500 або attempt >= retries → return res
    // 2. catch (err): err.name === 'AbortError' або attempt >= retries → throw err
    // 3. Пауза перед наступною спробою: await wait(baseDelay * 2 ** attempt)
    // TODO
    throw new Error('TODO: fetchWithRetry');
  }
}

// Спробуйте в консолі:
// fetchWithRetry('https://httpbin.org/status/503', {}, { retries: 2, baseDelay: 300 }).then((r) => r.status);
`,
      solution: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, init = {}, { retries = 3, baseDelay = 500 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, init);
      // 2xx/3xx/4xx — повертаємо; 5xx — повторюємо, поки є спроби
      if (res.status < 500 || attempt >= retries) return res;
    } catch (err) {
      if (err.name === 'AbortError' || attempt >= retries) throw err;
    }
    await wait(baseDelay * 2 ** attempt);
  }
}
`,
      hints: [
        'Цикл `for (let attempt = 0; ; attempt++)` з `try/catch` всередині: успішна (або неповторювана) відповідь — `return`, інакше пауза і наступна ітерація.',
        'Пауза — `await wait(baseDelay * 2 ** attempt)`: для attempt = 0 це 500, для 1 — 1000.',
        'Умова виходу: `attempt >= retries` — повертайте відповідь 5xx або кидайте помилку замість повтору. `AbortError` кидайте одразу.'
      ],
      tests: [
        { name: 'успіх з першої спроби — один запит', code: "const f = mockFetch(() => ({ ok: true }));\nconst res = await fetchWithRetry('/a');\nexpect(res.status).toBe(200);\nexpect(f).toHaveBeenCalledTimes(1);" },
        { name: '5xx повторюється з паузами 500 і 1000 мс', code: "useFakeTimers();\nlet n = 0;\nconst f = mockFetch(() => (++n < 3 ? { status: 503, body: 'busy' } : { body: { ok: 1 } }));\nconst p = fetchWithRetry('/a');\nawait flushPromises();\nexpect(f).toHaveBeenCalledTimes(1);\nadvanceTimersByTime(499); await flushPromises();\nexpect(f).toHaveBeenCalledTimes(1);\nadvanceTimersByTime(1); await flushPromises();\nexpect(f).toHaveBeenCalledTimes(2);\nadvanceTimersByTime(999); await flushPromises();\nexpect(f).toHaveBeenCalledTimes(2);\nadvanceTimersByTime(1); await flushPromises();\nexpect(f).toHaveBeenCalledTimes(3);\nconst res = await p;\nexpect(await res.json()).toEqual({ ok: 1 });" },
        { name: '4xx не повторюється', code: "useFakeTimers();\nconst f = mockFetch(() => ({ status: 404, body: 'nope' }));\nconst res = await fetchWithRetry('/a');\nexpect(res.status).toBe(404);\nexpect(f).toHaveBeenCalledTimes(1);\nexpect(getTimerCount()).toBe(0);" },
        { name: 'мережева помилка: retries+1 спроб, потім кидає останню помилку', code: "useFakeTimers();\nlet n = 0;\nconst f = mockFetch(() => new TypeError('Failed to fetch #' + (++n)));\nconst p = fetchWithRetry('/a', {}, { retries: 2, baseDelay: 100 });\np.catch(() => {});\nfor (let i = 0; i < 6; i++) { await flushPromises(); runAllTimers(); }\nawait expect(p).rejects.toThrow('Failed to fetch #3');\nexpect(f).toHaveBeenCalledTimes(3);" },
        { name: 'вичерпані повтори на 5xx → остання відповідь', code: "useFakeTimers();\nlet n = 0;\nconst f = mockFetch(() => ({ status: 500 + (n++), body: '' }));\nconst p = fetchWithRetry('/a', {}, { retries: 1, baseDelay: 10 });\nfor (let i = 0; i < 4; i++) { await flushPromises(); runAllTimers(); }\nconst res = await p;\nexpect(res.status).toBe(501);\nexpect(f).toHaveBeenCalledTimes(2);" },
        { name: 'AbortError не повторюється', code: "useFakeTimers();\nconst f = mockFetch(() => { const e = new Error('aborted'); e.name = 'AbortError'; return e; });\nconst err = await fetchWithRetry('/a').catch((e) => e);\nexpect(err.name).toBe('AbortError');\nexpect(f).toHaveBeenCalledTimes(1);" },
        { name: 'retries: 0 — рівно одна спроба', code: "const f = mockFetch(() => ({ status: 502, body: '' }));\nconst res = await fetchWithRetry('/a', {}, { retries: 0 });\nexpect(res.status).toBe(502);\nexpect(f).toHaveBeenCalledTimes(1);" }
      ],
      explanation: `
**Чому працює:** повторюємо лише тимчасові збої; на останній спробі віддаємо результат як є — контракт \`fetch\` не ламається.

**Складність:** до \`retries + 1\` запитів, сумарна пауза \`baseDelay * (2^retries − 1)\`.

**У продакшені:** jitter (\`delay * (0.5 + Math.random())\`), щоб тисячі клієнтів не повторювали синхронно; верхня межа паузи; заголовок \`Retry-After\` для 429/503. POST повторювати небезпечно — потрібен \`Idempotency-Key\`.

**Типові помилки:** рекурсія без лічильника; повтор на 4xx; \`throw\` для 5xx замість повернення відповіді; \`setTimeout\` без \`await\`.

**Що спитають далі:** як перервати серію повторів через \`AbortSignal\`? Що таке circuit breaker?
`
    },
    // ---------------------------------------------------------------- Роутинг: hash і History API
    {
      id: 'bapi-spa-routing',
      group: 'routing',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Роутинг у SPA: History API vs hash',
      tags: ['history', 'routing', 'location'],
      question: 'Як працює клієнтський роутинг у SPA? Чим History API відрізняється від hash-роутингу, і що для кожного треба налаштувати на сервері?',
      choices: [
        '`pushState` сам генерує `popstate`, тому рендер нового маршруту досить повісити на цю подію',
        'Hash-роутинг теж вимагає fallback на `index.html`, бо частина після `#` надсилається на сервер',
        '`location.replace(url)` додає новий запис в історію, а `location.assign(url)` замінює поточний',
        'З History API сервер має віддавати `index.html` на невідомі шляхи, а hash-роутинг цього не потребує',
        'Внутрішні `<a>` не треба перехоплювати: браузер не перезавантажує сторінку при переході в межах origin'
      ],
      correct: 3,
      why: [
        'Хибно: pushState не генерує popstate — після нього треба рендерити вручну.',
        'Хибно: частина після # не надсилається на сервер, тому hash-роутинг працює без налаштувань сервера.',
        'Хибно: навпаки — assign додає запис в історію, а replace замінює поточний (назад не повернутися).',
        'Правильно: при reload на /users/42 браузер запитає цей шлях у сервера — потрібен fallback на index.html; hash на сервер не йде.',
        'Хибно: звичайний клік по <a> робить повну навігацію з перезавантаженням — SPA перехоплює його (preventDefault + pushState).'
      ],
      hint: 'pushState, popstate, hashchange, fallback на index.html, перехоплення кліків по посиланнях.',
      answer: `
**Ідея:** змінювати URL і вміст **без перезавантаження**, зберігши «назад/вперед», закладки й reload.

**History API:**
\`\`\`js
history.pushState({ id: 42 }, '', '/users/42');     // новий запис
history.replaceState(state, '', '/users/42?tab=1'); // замінити поточний
window.addEventListener('popstate', (e) => render(location.pathname, e.state));
\`\`\`
- \`pushState/replaceState\` міняють URL без запиту і **не** генерують \`popstate\` — рендеримо самі.
- \`popstate\` — лише на «назад/вперед».
- **Сервер:** fallback — віддавати \`index.html\` на невідомі шляхи (\`try_files $uri /index.html\`), інакше reload дасть 404.
- Перехоплювати кліки по внутрішніх \`<a>\`, але не Ctrl/Cmd-клік, середню кнопку, \`target="_blank"\`.

**Hash-роутинг:**
\`\`\`js
window.addEventListener('hashchange', () => render(location.hash.slice(1) || '/'));
\`\`\`
- \`#...\` не йде на сервер → працює на статичному хостингу без налаштувань.
- Мінуси: «некрасиві» URL, гірше для SEO/SSR.

**Location:** \`assign(url)\` — перехід з записом в історії, \`replace(url)\` — без запису, \`reload()\`.

**Нюанси:** відновлення скролу, оновлення \`document.title\` і фокусу (a11y), base path при деплої в підпапку.
`,
      keyPoints: [
        'pushState/replaceState змінюють URL без перезавантаження і не викликають popstate',
        'popstate — лише на back/forward, рендер після pushState робимо самі',
        'History API потребує fallback на index.html на сервері',
        'Hash не йде на сервер, подія hashchange, налаштування сервера не потрібні',
        'Перехоплення кліків по внутрішніх посиланнях з урахуванням Ctrl/Cmd/target',
        'location.assign vs location.replace'
      ],
      followUps: [
        'Чому після оновлення сторінки SPA на /about сервер повертає 404?',
        'Що можна зберігати в history.state і які є обмеження?',
        'Як React Router / Vue Router реалізують перехід по посиланню?'
      ]
    },
    {
      id: 'bapi-pushstate-popstate',
      group: 'routing',
      type: 'quiz',
      level: 2,
      title: 'Коли спрацьовує popstate',
      tags: ['history', 'routing'],
      question: `
Що виведе код (з урахуванням асинхронних подій)?

\`\`\`js
window.addEventListener('popstate', (e) => console.log('popstate', e.state));
history.pushState({ page: 1 }, '', '/page1');
console.log(location.pathname);
history.pushState({ page: 2 }, '', '/page2');
history.back();
\`\`\`
`,
      options: [
        '`popstate {page: 1}`, `/page1`, `popstate {page: 2}`, `popstate {page: 1}`',
        '`/page1`, потім `popstate {page: 1}`',
        '`/page1`, потім `popstate {page: 2}`',
        '`/page1` — popstate не спрацює, бо URL змінено через pushState'
      ],
      answer: 1,
      why: [
        "Хибно: pushState не генерує popstate, тож «popstate» до виводу /page1 з'явитися не може.",
        'Правильно: pushState миттєво змінює URL (/page1), а back() асинхронно генерує popstate зі станом запису, на який повернулися, — {page: 1}.',
        'Хибно: e.state — стан запису, НА який перейшли ({page: 1}), а не того, з якого пішли.',
        "Хибно: popstate спрацьовує на back/forward незалежно від того, як запис з'явився в історії."
      ],
      hint: 'Яка з цих дій — «навігація по історії», а яка — лише зміна запису?',
      explanation: `
\`pushState\` лише додає запис і синхронно змінює URL. \`history.back()\` — навігація по історії: асинхронна, після неї приходить \`popstate\` зі станом запису, **на який** повернулися.

Правило роутерів: після власного \`pushState\` рендеримо вручну, а в \`popstate\` — за \`location\`/\`e.state\`.
`
    },
    {
      id: 'bapi-hash-router',
      group: 'routing',
      type: 'dom',
      level: 2,
      title: 'Hash-роутер для SPA',
      tags: ['routing', 'hashchange', 'location'],
      description: `
**Завдання.** Зробіть простий hash-роутер: за \`location.hash\` показуйте в \`#app\` заголовок потрібної сторінки і підсвічуйте активне посилання в меню.

**Де трапляється:** SPA на статичному хостингу (GitHub Pages) або адмінка без налаштувань сервера; розуміння, як працюють роутери, — часте питання співбесід.

**Дано (HTML)**
- \`<nav>\` з трьома посиланнями: \`href="#/"\`, \`href="#/about"\`, \`href="#/users/42"\`;
- \`<main id="app">\` — сюди рендеримо сторінку;
- \`<base href="about:srcdoc">\` — потрібен лише sandbox-iframe тренажера (щоб \`#/...\` розв'язувались відносно iframe), у звичайному проєкті його немає;
- у JS уже є \`app\` і \`links\` (NodeList посилань).

**Що зробити**
| hash | \`<h1>\` у \`#app\` |
|---|---|
| \`''\`, \`#\`, \`#/\` | \`Головна\` |
| \`#/about\` | \`Про нас\` |
| \`#/users/:id\` | \`Користувач <id>\` (id декодується з URL) |
| будь-що інше | \`404\` |

- рендер при завантаженні і на кожну подію \`hashchange\`; у \`#app\` завжди рівно один \`<h1>\`;
- посиланню, чий \`href\` дорівнює \`'#' + поточний шлях\`, — клас \`active\`, з інших — прибрати (для порожнього hash активне \`#/\`);
- \`id\` вставляйте як **текст**, щоб \`#/users/<b>x</b>\` показав теги буквально.

**Приклад**
\`\`\`js
location.hash = '#/users/7'; // → <h1>Користувач 7</h1>, active ні в кого
location.hash = '#/about';   // → <h1>Про нас</h1>, active у href="#/about"
\`\`\`

**Як це працює:** клік по \`<a href="#/about">\` змінює лише hash — браузер не перезавантажує сторінку, але додає запис в історію і генерує \`hashchange\` (і на «назад» теж). Роутер — це функція \`render()\`, що читає \`location.hash\` і зіставляє шлях з таблицею маршрутів посегментно.

**Врахуйте:**
- без початкового виклику \`render()\` сторінка порожня до першого кліку;
- \`a.href\` — абсолютний URL, порівнюйте \`a.getAttribute('href')\`;
- \`decodeURIComponent\` може кинути — у \`try/catch\`; \`innerHTML\` з параметром URL — XSS.
`,
      html: `<base href="about:srcdoc">
<nav>
  <a href="#/">Головна</a>
  <a href="#/about">Про нас</a>
  <a href="#/users/42">Користувач 42</a>
</nav>
<main id="app"></main>`,
      css: `nav a { margin-right: 12px; }
nav a.active { font-weight: bold; color: crimson; }`,
      js: `const app = document.querySelector('#app');
const links = document.querySelectorAll('nav a');

// Таблиця маршрутів: шаблон → функція, що повертає заголовок
const routes = {
  '/': () => 'Головна',
  '/about': () => 'Про нас',
  '/users/:id': ({ id }) => 'Користувач ' + id
};

// Повертає заголовок для шляху або null, якщо маршрут не знайдено
function match(path) {
  // 1. Сегменти шляху: path.split('/').filter(Boolean)
  // 2. Для кожного шаблону з routes — так само на сегменти; різна довжина → далі
  // 3. Сегмент шаблону з ':' — параметр: params[назва] = decodeURIComponent(сегмент) (try/catch)
  //    інакше сегменти мають збігатися
  // 4. Збіглося → return routes[pattern](params)
  // TODO
  return null;
}

function render() {
  // 1. const path = location.hash.slice(1) || '/';
  // 2. h1 = createElement('h1'); h1.textContent = match(path) ?? '404'; app.replaceChildren(h1)
  // 3. links.forEach: classList.toggle('active', a.getAttribute('href') === '#' + path)
  // TODO
}

// 4. window.addEventListener('hashchange', render) і початковий render()
// TODO

// Спробуйте в консолі: location.hash = '#/users/7'
`,
      editable: ['js'],
      solution: {
        js: `const app = document.querySelector('#app');
const links = document.querySelectorAll('nav a');

// Маршрути з параметрами у стилі '/users/:id'
const routes = {
  '/': () => 'Головна',
  '/about': () => 'Про нас',
  '/users/:id': ({ id }) => 'Користувач ' + id,
};

function safeDecode(s) {
  try { return decodeURIComponent(s); } catch { return s; }
}

function match(path) {
  const parts = path.split('/').filter(Boolean);
  for (const [pattern, view] of Object.entries(routes)) {
    const pParts = pattern.split('/').filter(Boolean);
    if (pParts.length !== parts.length) continue;
    const params = {};
    const ok = pParts.every((p, i) => {
      if (p.startsWith(':')) {
        params[p.slice(1)] = safeDecode(parts[i]);
        return true;
      }
      return p === parts[i];
    });
    if (ok) return view(params);
  }
  return null;
}

function render() {
  const path = location.hash.slice(1) || '/';
  const h1 = document.createElement('h1');
  h1.textContent = match(path) ?? '404'; // textContent — жодного XSS
  app.replaceChildren(h1);

  links.forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + path);
  });
}

window.addEventListener('hashchange', render);
render();
`
      },
      hints: [
        "Поточний шлях: `location.hash.slice(1) || '/'`. Підпишіться на `hashchange` і викличте `render()` одразу при старті.",
        "Для `/users/:id` розбийте шлях і шаблон на сегменти `split('/').filter(Boolean)` і порівняйте посегментно; сегмент з `:` — параметр (не забудьте `decodeURIComponent`).",
        "Заголовок: `createElement('h1')` + `textContent` і `app.replaceChildren(h1)`. Активне посилання: `a.classList.toggle('active', a.getAttribute('href') === '#' + path)`."
      ],
      tests: [
        { name: 'початковий рендер — Головна, активне #/', code: "expect($('#app h1').textContent).toBe('Головна');\nexpect($$('nav a.active').map((a) => a.getAttribute('href'))).toEqual(['#/']);" },
        { name: '#/about → Про нас, активне посилання оновлюється', code: "location.hash = '#/about';\nawait waitFor(() => $('#app h1') && $('#app h1').textContent === 'Про нас');\nexpect($$('nav a.active').map((a) => a.getAttribute('href'))).toEqual(['#/about']);\nexpect($$('#app h1')).toHaveLength(1);" },
        { name: 'параметр маршруту /users/:id', code: "location.hash = '#/users/7';\nawait waitFor(() => $('#app h1').textContent === 'Користувач 7');\nexpect($$('nav a.active')).toHaveLength(0);" },
        { name: 'невідомий маршрут → 404', code: "location.hash = '#/nope/deep';\nawait waitFor(() => $('#app h1').textContent === '404');" },
        { name: 'id вставляється як текст (без XSS)', code: "location.hash = '#/users/%3Cb%3Ex%3C%2Fb%3E';\nawait waitFor(() => $('#app h1').textContent === 'Користувач <b>x</b>');\nexpect($('#app b')).toBe(null);" },
        { name: 'клік по посиланню в nav перемикає сторінку', code: "$('a[href=\"#/users/42\"]').click();\nawait waitFor(() => $('#app h1').textContent === 'Користувач 42');\nexpect($('a[href=\"#/users/42\"]').classList.contains('active')).toBe(true);" }
      ],
      explanation: `
**Чому працює:** hash-роутер — це джерело правди (\`location.hash\`), підписка (\`hashchange\`) і \`render()\`. Посилання з \`#\` працюють «самі», «назад» теж генерує \`hashchange\`.

**Складність:** O(R · S) на навігацію (R — маршрути, S — сегменти).

**Безпека:** параметр URL контролює атакувальник — \`innerHTML = 'Користувач ' + id\` дає DOM-based XSS; \`textContent\` — ні.

**Типові помилки:** немає початкового рендеру; порівняння \`a.href\` з hash; не декодований параметр (кирилиця прийде як \`%D0%...\`).

**Що спитають далі:** як перейти на History API і що зміниться на сервері? Як обробляти \`#/search?q=js\`? Порядок маршрутів \`/users/new\` vs \`/users/:id\`?
`
    },
    {
      id: 'bapi-history-router',
      group: 'routing',
      type: 'dom',
      level: 3,
      title: 'Роутер на History API з перехопленням посилань',
      tags: ['history', 'routing', 'delegation'],
      description: `
**Завдання.** Зробіть роутер на History API: кліки по внутрішніх посиланнях змінюють URL і сторінку без перезавантаження, а «назад» повертає попередню сторінку.

**Де трапляється:** так працюють \`<Link>\` у React Router і \`<router-link>\` у Vue — звичайний \`<a href>\`, лівий клік по якому перехоплюється.

**Дано (HTML)**
- \`<nav>\`: посилання \`href="/"\`, \`href="/catalog"\`, \`href="/contacts"\` з атрибутом \`data-link\` (у третього текст загорнутий у \`<span>\`) і зовнішнє \`<a href="https://example.com" target="_blank">\` **без** \`data-link\`;
- \`<main id="app">\`; у JS уже є змінна \`app\`;
- заглушка \`appHistory\` (не змінюйте): у sandbox-iframe справжній \`history.pushState\` заборонений. Вона має \`pushState(state, title, url)\`, \`replaceState\`, \`back()\`, \`state\`, \`length\` і \`pathname\` (аналог \`location.pathname\`). Як і справжній, \`pushState\` **не** генерує \`popstate\`, а \`back()\` асинхронно генерує \`popstate\` на \`window\`. У реальному проєкті — \`history\` і \`location.pathname\`.

**Що написати**
- \`render()\`: \`/\` → \`Головна\`, \`/catalog\` → \`Каталог\`, \`/contacts\` → \`Контакти\`, інше → \`404\`; показати \`<h1>\` у \`#app\` і встановити \`document.title\` у ту саму назву.
- глобальна \`navigate(path)\`: \`appHistory.pushState({ path }, '', path)\` + \`render()\`; якщо \`path\` збігається з поточним — нічого (без дублів в історії).
- **один** обробник \`click\` на \`document\` (делегування) для \`a[data-link]\`: \`preventDefault()\` + \`navigate(href)\`. Клік із Ctrl/Cmd/Shift/Alt або не лівою кнопкою **не** перехоплювати. Посилання без \`data-link\` не чіпати.
- обробник \`popstate\` → \`render()\`; початковий \`render()\`.

**Приклад**
\`\`\`js
// клік по «Каталог» → appHistory.pathname === '/catalog', <h1>Каталог</h1>, appHistory.length === 2
navigate('/missing'); // <h1>404</h1>
appHistory.back();    // через мить popstate → попередня сторінка
\`\`\`

**Як це працює:** \`pushState\` миттєво змінює URL і додає запис в історію, але сторінку не перемальовує — тому одразу викликаємо \`render()\`. На «назад/вперед» браузер генерує \`popstate\`, і ми рендеримо за новим шляхом. Делегування на \`document\` обслуговує і посилання, додані пізніше.

**Врахуйте:**
- клік по \`<span>\` усередині посилання — \`e.target\` це \`span\`, тому \`closest('a[data-link]')\`;
- \`link.href\` — абсолютний URL, беріть \`link.getAttribute('href')\`;
- Ctrl/Cmd-клік — «відкрити в новій вкладці», ламати це не можна.
`,
      html: `<script>
  // Заглушка History API для sandbox-iframe (не змінюйте).
  window.appHistory = (function () {
    var stack = [{ state: null, url: '/' }];
    var index = 0;
    function pop() {
      setTimeout(function () {
        window.dispatchEvent(new PopStateEvent('popstate', { state: stack[index].state }));
      }, 0);
    }
    return {
      get state() { return stack[index].state; },
      get pathname() { return stack[index].url; },
      get length() { return stack.length; },
      pushState: function (state, title, url) { stack.splice(index + 1); stack.push({ state: state, url: url }); index++; },
      replaceState: function (state, title, url) { stack[index] = { state: state, url: url }; },
      back: function () { if (index > 0) { index--; pop(); } },
      forward: function () { if (index < stack.length - 1) { index++; pop(); } }
    };
  })();
</script>
<nav>
  <a href="/" data-link>Головна</a>
  <a href="/catalog" data-link>Каталог</a>
  <a href="/contacts" data-link><span>Контакти</span></a>
  <a href="https://example.com" target="_blank">Зовнішнє</a>
</nav>
<main id="app"></main>`,
      css: 'nav a { margin-right: 12px; }',
      js: `const app = document.querySelector('#app');

const routes = {
  '/': 'Головна',
  '/catalog': 'Каталог',
  '/contacts': 'Контакти'
};

function render() {
  // 1. const title = routes[appHistory.pathname] ?? '404';
  // 2. <h1> з textContent = title у #app (replaceChildren); document.title = title
  // TODO
}

function navigate(path) {
  // 1. path === appHistory.pathname → return (без дублів)
  // 2. appHistory.pushState({ path }, '', path)
  // 3. render() — pushState НЕ генерує popstate
  // TODO
}

// 4. Делегування: document.addEventListener('click', (e) => { ... })
//    - const link = e.target.closest('a[data-link]'); немає → return
//    - e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey → return
//    - e.preventDefault(); navigate(link.getAttribute('href'))
// 5. window.addEventListener('popstate', render)
// 6. Початковий render()
// TODO

// Спробуйте в консолі: navigate('/catalog'); appHistory.back();
`,
      editable: ['js'],
      solution: {
        js: `const app = document.querySelector('#app');

const routes = {
  '/': 'Головна',
  '/catalog': 'Каталог',
  '/contacts': 'Контакти',
};

function render() {
  const title = routes[appHistory.pathname] ?? '404';
  const h1 = document.createElement('h1');
  h1.textContent = title;
  app.replaceChildren(h1);
  document.title = title;
}

function navigate(path) {
  if (path === appHistory.pathname) return; // не плодимо дублікати в історії
  appHistory.pushState({ path }, '', path);
  render(); // pushState не генерує popstate — рендеримо самі
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-link]');
  if (!link) return;
  // Ctrl/Cmd/Shift/Alt або середня кнопка — віддаємо браузеру (нова вкладка/вікно)
  if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  navigate(link.getAttribute('href'));
});

window.addEventListener('popstate', render);
render();
`
      },
      hints: [
        '`render()` бере шлях з `appHistory.pathname`, шукає назву в `routes` і оновлює `#app` та `document.title`.',
        "`navigate(path)`: перевірка на дубль → `appHistory.pushState({ path }, '', path)` → `render()`. Окремо `window.addEventListener('popstate', render)`.",
        "У делегованому обробнику: `e.target.closest('a[data-link]')`, перевірка `e.button` і `ctrlKey/metaKey/shiftKey/altKey`, потім `preventDefault()` і `navigate(link.getAttribute('href'))`."
      ],
      tests: [
        { name: 'початковий рендер — Головна', code: "expect($('#app h1').textContent).toBe('Головна');\nexpect(document.title).toBe('Головна');" },
        { name: 'клік по data-link → pushState і рендер без перезавантаження', code: "click($('a[href=\"/catalog\"]'));\nexpect(appHistory.pathname).toBe('/catalog');\nexpect(appHistory.state).toEqual({ path: '/catalog' });\nexpect($('#app h1').textContent).toBe('Каталог');\nexpect(document.title).toBe('Каталог');\nexpect(appHistory.length).toBe(2);" },
        { name: 'повторний клік не створює дубль в історії', code: 'click($(\'a[href="/catalog"]\'));\nexpect(appHistory.length).toBe(2);' },
        { name: 'Ctrl/Cmd/Shift-клік і середня кнопка не перехоплюються', code: "const link = $('a[href=\"/contacts\"] span');\nclick(link, { ctrlKey: true });\nclick(link, { metaKey: true });\nclick(link, { shiftKey: true });\nclick(link, { button: 1 });\nexpect(appHistory.pathname).toBe('/catalog');\nexpect($('#app h1').textContent).toBe('Каталог');" },
        { name: 'клік по вкладеному елементу посилання працює', code: "click($('a[href=\"/contacts\"] span'));\nexpect(appHistory.pathname).toBe('/contacts');\nexpect($('#app h1').textContent).toBe('Контакти');" },
        { name: 'назад (popstate) рендерить попередню сторінку', code: "appHistory.back();\nawait waitFor(() => $('#app h1').textContent === 'Каталог');\nexpect(document.title).toBe('Каталог');" },
        { name: 'navigate на невідомий шлях → 404; зовнішні посилання не чіпаються', code: "navigate('/missing');\nexpect($('#app h1').textContent).toBe('404');\nclick($('a[target=\"_blank\"]'));\nexpect(appHistory.pathname).toBe('/missing');" }
      ],
      explanation: `
**Чому працює:** \`<a href>\` лишається звичайним посиланням (працює без JS, індексується, відкривається в новій вкладці), але лівий клік перехоплюється: \`pushState\` + рендер замість перезавантаження.

**Складність:** O(1) на навігацію.

**Типові помилки:** обробник на кожне посилання (не працює для нових); \`link.href\` замість \`getAttribute\`; дублі в історії; забутий \`popstate\` — «назад» змінює URL, але не сторінку.

**Що спитають далі:** що потрібно на сервері (fallback на \`index.html\`)? Як відновлювати скрол і фокус? Як заборонити перехід з незбереженою формою?
`
    },
    // ---------------------------------------------------------------- IntersectionObserver
    {
      id: 'bapi-intersection-observer',
      group: 'observers',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'IntersectionObserver, ResizeObserver, MutationObserver',
      tags: ['observers', 'performance'],
      question: 'Що таке IntersectionObserver і чому він кращий за обробник scroll + getBoundingClientRect? Які ще Observer API ви знаєте? Оберіть **усі** правильні твердження.',
      choices: [
        'IO не змушує браузер синхронно рахувати layout і кличе колбек лише при зміні стану перетину',
        'Колбек IO викликається на кожну подію `scroll`, просто виконується в окремому потоці',
        "`rootMargin: '200px'` дозволяє почати завантаження ще до появи елемента у viewport",
        '`ResizeObserver` відстежує лише зміну розміру вікна — це пряма заміна `window.resize`',
        'Після `observe()` колбек мовчить, доки елемент уперше не перетне root'
      ],
      correct: [0, 2],
      why: [
        'Правильно: перетин рахується разом із рендерингом, без примусового layout, і лише при зміні стану.',
        'Хибно: IO не прив\'язаний до scroll — колбек приходить лише при зміні стану перетину, у головному потоці.',
        'Правильно: rootMargin розширює зону root, тож елемент «видно» заздалегідь.',
        'Хибно: ResizeObserver стежить за розміром конкретного елемента з будь-якої причини, не лише вікна.',
        'Хибно: колбек приходить одразу після observe() з початковим станом — тому перевіряють isIntersecting.'
      ],
      hint: 'Асинхронність, головний потік, root/rootMargin/threshold, lazy loading, infinite scroll.',
      answer: `
**IntersectionObserver (IO)** асинхронно повідомляє, коли елемент перетинає **root** (за замовчуванням — viewport) або змінює ступінь видимості.

\`\`\`js
const io = new IntersectionObserver((entries, observer) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    loadImage(entry.target);
    observer.unobserve(entry.target); // більше не стежимо
  }
}, { root: null, rootMargin: '200px 0px', threshold: 0 });

document.querySelectorAll('img[data-src]').forEach((img) => io.observe(img));
\`\`\`

**Опції:**
- \`root\` — елемент-контейнер зі скролом (\`null\` = viewport);
- \`rootMargin\` — розширює/звужує root (\`'200px'\` — почати завантаження заздалегідь);
- \`threshold\` — частка видимості (\`0\`, \`0.5\`, \`[0, 0.25, 1]\`), при перетині якої викликати колбек.

\`entry\`: \`isIntersecting\`, \`intersectionRatio\`, \`target\`. Колбек приходить **одразу після \`observe()\`** з початковим станом.

**Чому краще за scroll:** \`scroll\` стріляє десятки разів на секунду, а \`getBoundingClientRect()\` змушує синхронно рахувати layout. IO рахується разом із рендерингом і кличе колбек лише при **зміні** стану.

**Застосування:** lazy loading, infinite scroll (sentinel), аналітика показів, автопауза відео.

**Інші:** **ResizeObserver** — розмір елемента; **MutationObserver** — зміни DOM (мікрозадача); **PerformanceObserver** — LCP, long tasks.

**Нюанси:** для зображень часто досить \`<img loading="lazy">\`; не забувайте \`unobserve\`/\`disconnect\`.
`,
      keyPoints: [
        'Асинхронне відстеження перетину елемента з root без scroll-обробників',
        'Опції root, rootMargin, threshold; entry.isIntersecting',
        'Не провокує примусовий layout, на відміну від getBoundingClientRect у scroll',
        'Use cases: lazy loading, infinite scroll, аналітика показів',
        'ResizeObserver — розміри елемента, MutationObserver — зміни DOM',
        'unobserve/disconnect для уникнення витоків'
      ],
      followUps: [
        'Чим loading="lazy" відрізняється від lazy loading через IO?',
        'Як зробити infinite scroll і не завантажувати одну сторінку двічі?',
        'Коли викликається колбек MutationObserver — макро- чи мікрозадачею?'
      ]
    },
    {
      id: 'bapi-lazy-images',
      group: 'observers',
      type: 'dom',
      level: 2,
      title: 'Lazy loading зображень через IntersectionObserver',
      tags: ['observers', 'lazy-loading', 'performance'],
      description: `
**Завдання.** Завантажуйте зображення стрічки лише тоді, коли вони наближаються до видимої зони (lazy loading) — через IntersectionObserver.

**Де трапляється:** стрічка новин, каталог товарів, галерея — класична оптимізація трафіку і швидкості першого екрана.

**Дано (HTML)**
- \`<div id="feed">\` — контейнер зі скролом, 300px висоти;
- у ньому 5 × \`<img class="lazy" data-src="...">\` без \`src\` (кожне 200px + 400px відступ).

**Що написати**
- \`new IntersectionObserver(callback, { root: feed, rootMargin: '0px 0px 200px 0px' })\` і \`observe\` для кожного \`img[data-src]\`;
- у колбеку для кожного \`entry.isIntersecting\`: \`src = data-src\`, видалити атрибут \`data-src\`, додати клас \`loaded\`, \`unobserve(img)\`.

**Приклад**
\`\`\`js
// старт: завантажено лише 1-ше зображення
// feed.scrollTop = 150 → 2-ге завантажується ще до появи (запас 200px)
\`\`\`

**Як це працює:** браузер сам відстежує перетин цілей з root і кличе колбек пакетом \`entries\`. Перший виклик приходить одразу після \`observe\` для **всіх** цілей — і для невидимих, тому без перевірки \`isIntersecting\` завантажиться все.

**Врахуйте:** \`root\` — саме \`#feed\`, а не viewport; після завантаження більше не стежте за зображенням.
`,
      html: `<div id="feed">
  <img class="lazy" alt="1" data-src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7#img1">
  <img class="lazy" alt="2" data-src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7#img2">
  <img class="lazy" alt="3" data-src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7#img3">
  <img class="lazy" alt="4" data-src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7#img4">
  <img class="lazy" alt="5" data-src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7#img5">
</div>`,
      css: `#feed {
  height: 300px;
  overflow: auto;
  border: 1px solid #ccc;
  position: relative;
}
.lazy {
  display: block;
  width: 200px;
  height: 200px;
  margin: 0 0 400px;
  background: #eee;
}
`,
      js: `const feed = document.querySelector('#feed');

// 1. TODO: const observer = new IntersectionObserver((entries, obs) => {
//      для кожного entry: якщо !entry.isIntersecting — пропустити;
//      інакше src = dataset.src, removeAttribute('data-src'), клас 'loaded', obs.unobserve(img)
//    }, { root: feed, rootMargin: '0px 0px 200px 0px' });

// 2. TODO: observer.observe(...) для кожного feed.querySelectorAll('img[data-src]')

// Спробуйте: прокрутіть стрічку і подивіться в DevTools, як з'являються src
`,
      editable: ['js'],
      solution: {
        js: `const feed = document.querySelector('#feed');

const observer = new IntersectionObserver((entries, obs) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const img = entry.target;
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
    img.classList.add('loaded');
    obs.unobserve(img); // зображення вже завантажене — більше не стежимо
  }
}, { root: feed, rootMargin: '0px 0px 200px 0px' });

feed.querySelectorAll('img[data-src]').forEach((img) => observer.observe(img));
`
      },
      hints: [
        "Створіть `new IntersectionObserver(callback, { root: feed, rootMargin: '0px 0px 200px 0px' })` і викличте `observe` для кожного `img[data-src]`.",
        'У колбеку перебирайте `entries` і обробляйте лише ті, де `entry.isIntersecting === true` — колбек викликається й для невидимих елементів (початковий стан).',
        "Для видимого: `img.src = img.dataset.src`, `img.removeAttribute('data-src')`, `img.classList.add('loaded')`, `observer.unobserve(img)`."
      ],
      tests: [
        { name: 'перше зображення завантажено, інші — ні', code: "const imgs = $$('#feed img');\nawait waitFor(() => imgs[0].classList.contains('loaded'), 2500);\nawait sleep(80);\nexpect(imgs[0].getAttribute('src')).toMatch(/#img1$/);\nexpect(imgs[0].hasAttribute('data-src')).toBe(false);\nexpect(imgs[1].hasAttribute('src')).toBe(false);\nexpect(imgs[4].hasAttribute('src')).toBe(false);\nexpect(imgs[4].dataset.src).toMatch(/#img5$/);" },
        { name: 'rootMargin: зображення завантажується до появи у видимій зоні', code: "const feed = $('#feed');\nconst imgs = $$('#feed img');\nfeed.scrollTop = 150; // видимо 150..450, з rootMargin — до 650; друге зображення починається з 600\nawait waitFor(() => imgs[1].classList.contains('loaded'), 2500);\nexpect(imgs[1].getAttribute('src')).toMatch(/#img2$/);\nexpect(imgs[2].hasAttribute('src')).toBe(false);" },
        { name: 'при прокрутці до кінця завантажується останнє і викликається unobserve', code: "const proto = IntersectionObserver.prototype;\nconst orig = proto.unobserve;\nlet calls = 0;\nproto.unobserve = function (el) { calls++; return orig.call(this, el); };\ntry {\n  const feed = $('#feed');\n  const last = $$('#feed img')[4];\n  feed.scrollTop = last.offsetTop;\n  await waitFor(() => last.classList.contains('loaded'), 2500);\n  expect(last.getAttribute('src')).toMatch(/#img5$/);\n  expect(calls).toBeGreaterThan(0);\n} finally {\n  proto.unobserve = orig;\n}" }
      ],
      testTimeout: 4000,
      explanation: `
\`root: feed\` — перетин відносно контейнера; \`rootMargin\` дає запас 200px, щоб користувач не бачив порожніх блоків; \`unobserve\` — без повторних спрацювань. Жодного коду на кожен \`scroll\`.

**Альтернатива:** \`<img loading="lazy">\` — нуль JS, але без контролю порогу і колбеку. IO потрібен для фонів, компонентів, відео, аналітики.

**CLS/LCP:** задавайте розміри зображень; не робіть lazy для першого екрана.

**Типові помилки:** немає перевірки \`isIntersecting\`; забутий \`unobserve\`.

**Що спитають далі:** як підтримати \`srcset\` (\`data-srcset\`)? Fallback без IO?
`
    },
    {
      id: 'bapi-infinite-scroll',
      group: 'observers',
      type: 'dom',
      level: 3,
      title: 'Infinite scroll з sentinel-елементом',
      tags: ['observers', 'infinite-scroll', 'async'],
      description: `
**Завдання.** Зробіть нескінченну стрічку: коли користувач докручує до кінця списку, підвантажуйте наступну сторінку постів.

**Де трапляється:** стрічки соцмереж, каталоги, пошукова видача; на співбесідах — «як зробити infinite scroll без scroll-обробника?».

**Дано (HTML)**
- \`<div id="scroller">\` (300px, зі скролом) → \`<ul id="list">\` і після нього порожній \`<div id="sentinel">\`;
- \`<p id="status">\`;
- готова \`fetchPage(page)\` → \`Promise<{ items: string[], hasMore: boolean }>\` через ~300 мс; сторінки з **1**, усього 3 по 10 постів.

**Що написати**
- IntersectionObserver на \`#sentinel\` з \`root: scroller\` (\`rootMargin\` ≤ 50px);
- \`loadMore()\`: якщо вже вантажимо або даних більше немає — вийти; інакше \`await fetchPage(page + 1)\`, додати \`<li>\` з текстом у \`#list\`;
- коли \`hasMore === false\` — \`observer.disconnect()\` і \`#status\` = \`Більше немає\`.

**Приклад**
\`\`\`js
// старт: список порожній → sentinel видно → сторінка 1 (Пост 1..10)
// докрутили донизу → сторінка 2; скрол туди-сюди під час запиту → без дублів
// після сторінки 3 → «Більше немає», нових запитів немає
\`\`\`

**Як це працює:** sentinel — «маячок» у кінці списку: побачили його — пора вантажити. IO кличе колбек лише при **зміні** стану перетину, тож якщо після вставки sentinel усе ще видно, колбеку не буде — допоможе \`unobserve\` + \`observe\` (свіжий початковий стан).

**Врахуйте:** прапорець \`loading\` — один запит за раз; \`page\` збільшуйте лише після успішної відповіді.
`,
      html: `<div id="scroller">
  <ul id="list"></ul>
  <div id="sentinel"></div>
</div>
<p id="status"></p>
<script>
  // Фейкове API (не змінюйте). fetchPage.calls — номери запитаних сторінок, fetchPage.maxActive — макс. паралельних запитів.
  window.fetchPage = function (page) {
    fetchPage.calls.push(page);
    fetchPage.active++;
    fetchPage.maxActive = Math.max(fetchPage.maxActive, fetchPage.active);
    return new Promise(function (resolve) {
      setTimeout(function () {
        fetchPage.active--;
        var items = [];
        for (var i = 1; i <= 10; i++) items.push('Пост ' + ((page - 1) * 10 + i));
        resolve({ items: items, hasMore: page < 3 });
      }, 300);
    });
  };
  fetchPage.calls = [];
  fetchPage.active = 0;
  fetchPage.maxActive = 0;
</script>`,
      css: `#scroller {
  height: 300px;
  overflow: auto;
  border: 1px solid #ccc;
}
#list { margin: 0; padding: 0; list-style: none; }
#list li { height: 50px; box-sizing: border-box; border-bottom: 1px solid #eee; padding: 12px; }
#sentinel { height: 1px; }
`,
      js: `const scroller = document.querySelector('#scroller');
const list = document.querySelector('#list');
const sentinel = document.querySelector('#sentinel');
const statusEl = document.querySelector('#status');

let page = 0;         // остання завантажена сторінка
let loading = false;  // зараз іде запит
let finished = false; // даних більше немає

async function loadMore() {
  // 1. TODO: якщо loading || finished — вийти; loading = true
  // 2. TODO: const { items, hasMore } = await fetchPage(page + 1); page++
  // 3. TODO: створити <li> для кожного item (краще через DocumentFragment) і додати в list
  // 4. TODO: якщо !hasMore — finished, observer.disconnect(), статус 'Більше немає'
  // 5. TODO: інакше — observer.unobserve(sentinel); observer.observe(sentinel)
  // 6. TODO: finally — loading = false
}

// 7. TODO: const observer = new IntersectionObserver(callback, { root: scroller, rootMargin: '0px 0px 50px 0px' });
//    callback: якщо якийсь entry.isIntersecting — loadMore()
// 8. TODO: observer.observe(sentinel)
`,
      editable: ['js'],
      solution: {
        js: `const scroller = document.querySelector('#scroller');
const list = document.querySelector('#list');
const sentinel = document.querySelector('#sentinel');
const statusEl = document.querySelector('#status');

let page = 0;
let loading = false;
let finished = false;

async function loadMore() {
  if (loading || finished) return; // захист від паралельних і зайвих запитів
  loading = true;
  statusEl.textContent = 'Завантаження…';
  try {
    const { items, hasMore } = await fetchPage(page + 1);
    page++;
    const frag = document.createDocumentFragment();
    for (const text of items) {
      const li = document.createElement('li');
      li.textContent = text;
      frag.append(li);
    }
    list.append(frag); // одна вставка в DOM
    if (!hasMore) {
      finished = true;
      observer.disconnect();
      statusEl.textContent = 'Більше немає';
      return;
    }
    statusEl.textContent = '';
    // Якщо sentinel лишився видимим, IO не викличе колбек повторно —
    // переспостерігаємо, щоб отримати свіжий початковий стан.
    observer.unobserve(sentinel);
    observer.observe(sentinel);
  } catch (err) {
    statusEl.textContent = 'Помилка завантаження';
  } finally {
    loading = false;
  }
}

const observer = new IntersectionObserver((entries) => {
  if (entries.some((e) => e.isIntersecting)) loadMore();
}, { root: scroller, rootMargin: '0px 0px 50px 0px' });

observer.observe(sentinel);
`
      },
      hints: [
        'Тримайте стан у змінних: `page` (остання завантажена сторінка), `loading` (іде запит), `finished` (даних більше немає).',
        'Колбек IO: якщо `entries.some(e => e.isIntersecting)` — викликайте `loadMore()`, а вона одразу виходить, якщо `loading || finished`.',
        'Після завантаження збирайте `<li>` у `DocumentFragment`, вставляйте одним `append`. Якщо `!hasMore` — `observer.disconnect()` і текст статусу. Підводний камінь: якщо sentinel лишився видимим після вставки, колбек не прийде — зробіть `unobserve` + `observe` sentinel.'
      ],
      tests: [
        { name: 'перша сторінка завантажується одразу (рівно одна)', code: "await waitFor(() => $$('#list li').length === 10, 1500);\nawait sleep(60);\nexpect($$('#list li').length).toBe(10);\nexpect(fetchPage.calls).toEqual([1]);\nexpect($$('#list li')[0].textContent).toBe('Пост 1');" },
        { name: 'прокрутка до кінця → друга сторінка без дублікатів і паралельних запитів', code: "const sc = $('#scroller');\nconst bottom = sc.scrollHeight; // фіксуємо висоту до підвантаження\nsc.scrollTop = bottom;\nawait sleep(80);\nsc.scrollTop = 0;\nawait sleep(80);\nsc.scrollTop = bottom;\nawait sleep(80);\nawait waitFor(() => $$('#list li').length === 20, 1500);\nawait sleep(60);\nexpect($$('#list li').length).toBe(20);\nexpect(fetchPage.calls).toEqual([1, 2]);\nexpect(fetchPage.maxActive).toBe(1);\nexpect($$('#list li')[19].textContent).toBe('Пост 20');" },
        { name: 'остання сторінка → статус «Більше немає», нових запитів немає', code: "const sc = $('#scroller');\nsc.scrollTop = sc.scrollHeight;\nawait waitFor(() => $$('#list li').length === 30, 1500);\nawait waitFor(() => $('#status').textContent === 'Більше немає');\nsc.scrollTop = 0;\nawait sleep(80);\nsc.scrollTop = sc.scrollHeight;\nawait sleep(250);\nexpect(fetchPage.calls).toEqual([1, 2, 3]);\nexpect($$('#list li').length).toBe(30);" }
      ],
      testTimeout: 4000,
      explanation: `
**Sentinel замість scroll:** жодного коду на кожну подію скролу і жодних \`scrollTop + clientHeight >= scrollHeight\`.

**Захист:** \`loading\` — один запит за раз, \`finished\` + \`disconnect\` — нічого після останньої сторінки. \`unobserve\`/\`observe\` рятує, якщо sentinel лишився видимим (великий екран).

**Продуктивність:** \`DocumentFragment\` — одна вставка; для тисяч елементів потрібна віртуалізація.

**Типові помилки:** немає \`loading\` (сторінка двічі); \`page++\` до відповіді (при помилці сторінку пропущено).

**Що спитають далі:** кнопка «Спробувати ще» при помилці? Відновлення позиції скролу при «Назад»? Мінуси infinite scroll проти пагінації?
`
    },
    // ---------------------------------------------------------------- Таймінги, життєвий цикл сторінки, файли
    {
      id: 'bapi-performance-now',
      group: 'page',
      type: 'quiz',
      level: 1,
      title: 'performance.now() vs Date.now()',
      tags: ['performance', 'timers'],
      question: `
Потрібно виміряти, скільки триває функція \`heavy()\`. Який спосіб правильніший?

\`\`\`js
const t0 = /* ? */;
heavy();
console.log(/* ? */ - t0);
\`\`\`
`,
      options: [
        '`Date.now()` — він точніший, бо рахує від 1970 року',
        '`new Date().getTime()` — єдиний спосіб, що враховує часовий пояс',
        '`performance.now()` — монотонний час високої точності, не залежить від зміни системного годинника',
        '`setTimeout` з інтервалом 1 мс і лічильником тиків'
      ],
      answer: 2,
      why: [
        'Хибно: Date.now() дає цілі мс і може стрибати при синхронізації годинника.',
        'Хибно: getTime() — те саме Unix-значення, що й Date.now(), часовий пояс тут ні до чого.',
        'Правильно: монотонний час з дробовими мс від timeOrigin — саме для вимірювань.',
        'Хибно: setTimeout не гарантує інтервал і тротлиться у фоні.'
      ],
      hint: 'Що станеться з вимірюванням, якщо під час роботи функції система синхронізує годинник?',
      explanation: `
\`performance.now()\` — мс з дробовою частиною від \`performance.timeOrigin\` (створення документа). Монотонний: не стрибає при зміні системного часу. Точність навмисно знижена (захист від Spectre). Для DevTools — \`performance.mark()\`/\`measure()\`.
`
    },
    {
      id: 'bapi-raf-facts',
      group: 'page',
      type: 'quiz',
      level: 2,
      title: 'requestAnimationFrame і requestIdleCallback',
      tags: ['raf', 'timers', 'performance'],
      question: 'Оберіть **усі** правильні твердження:',
      options: [
        'Колбек `requestAnimationFrame` викликається перед наступним відмальовуванням кадру',
        '`requestAnimationFrame` гарантовано викликається рівно кожні 16.6 мс',
        'У фонових вкладках виклики `requestAnimationFrame` призупиняються',
        'Колбек `requestAnimationFrame` — це мікрозадача і виконується одразу після поточного скрипта',
        'Для безперервної анімації `requestAnimationFrame` треба викликати повторно всередині колбека',
        '`requestIdleCallback` виконує колбек, коли в кадрі є вільний час, і може отримати `timeout`, щоб не чекати вічно'
      ],
      answer: [0, 2, 4, 5],
      why: [
        'Правильно: rAF — етап рендерингу перед style/layout/paint, зміни DOM потрапляють точно в кадр.',
        'Хибно: частота залежить від дисплея (120 Гц → ~8.3 мс) і навантаження.',
        'Правильно: у прихованих вкладках rAF не викликається — економія батареї.',
        'Хибно: rAF — не мікрозадача, а окремий етап рендерингу; перед ним можуть пройти інші задачі.',
        'Правильно: rAF одноразовий, цикл анімації — рекурсивний виклик requestAnimationFrame(step).',
        'Правильно: rIC — для фонової роботи у вільний час кадру, timeout гарантує виконання.'
      ],
      hint: "Частота rAF прив'язана до частоти оновлення екрана, а не до фіксованого інтервалу.",
      explanation: `
Для анімацій рахуйте прогрес від переданого \`timestamp\`, а не від кількості кадрів. Зупинка — \`cancelAnimationFrame(id)\`. \`requestIdleCallback\` — для аналітики, префетчу; \`deadline.timeRemaining()\` показує залишок кадру.
`
    },
    {
      id: 'bapi-visibility-beacon',
      group: 'page',
      type: 'theory',
      level: 3,
      title: 'Page Visibility API і sendBeacon',
      tags: ['visibility', 'analytics', 'lifecycle'],
      question: 'Як надійно відправити аналітику, коли користувач іде зі сторінки? Що таке Page Visibility API і чому не варто покладатися на unload/beforeunload?',
      choices: [
        '`beforeunload` надійно спрацьовує й на мобільних, тож аналітику найкраще відправляти саме в ньому',
        'На `visibilitychange` → `hidden` відправити дані через `sendBeacon` або `fetch` з `keepalive: true`',
        'Обробник `unload` допомагає bfcache: браузер встигає зберегти стан сторінки перед виходом',
        'Звичайний `fetch` у `pagehide` гарантовано завершиться, тому `sendBeacon` уже не потрібен',
        '`sendBeacon` повертає проміс з відповіддю сервера, тож можна перевірити, чи дані збережено'
      ],
      correct: 1,
      why: [
        'Хибно: на мобільних ОС часто вбиває вкладку без beforeunload/unload.',
        'Правильно: hidden — останній надійний момент, а sendBeacon/keepalive доставлять запит навіть після закриття.',
        'Хибно: навпаки — обробник unload вимикає bfcache.',
        'Хибно: звичайний fetch браузер може обірвати при закритті сторінки; потрібен keepalive або sendBeacon.',
        'Хибно: sendBeacon повертає лише true/false (прийнято в чергу), відповідь сервера недоступна.'
      ],
      hint: 'visibilitychange, hidden, pagehide, bfcache, navigator.sendBeacon, fetch keepalive.',
      answer: `
**Page Visibility API:** \`document.visibilityState\` (\`'visible'\` | \`'hidden'\`) і подія \`visibilitychange\`. \`hidden\` — перемикання вкладки, згортання, блокування екрана, перехід, закриття.

\`\`\`js
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    navigator.sendBeacon('/analytics', JSON.stringify(collectMetrics()));
    video.pause();
    stopPolling();
  } else {
    resumePolling();
  }
});
\`\`\`

**Чому не \`unload\`/\`beforeunload\`:** на мобільних часто не спрацьовують; \`unload\` ламає bfcache. \`beforeunload\` — лише для діалогу «незбережені зміни». Для bfcache — \`pagehide\`/\`pageshow\` (\`event.persisted\`).

**\`navigator.sendBeacon(url, data)\`:** POST, який браузер доставить і після закриття; повертає \`true/false\`; ліміт ~64 КБ. Альтернатива — \`fetch(url, { method: 'POST', body, keepalive: true })\` (можна задати заголовки).

**Нюанси:** у фоні таймери тротляться (≥1 с), rAF не викликається.
`,
      keyPoints: [
        'document.visibilityState і подія visibilitychange',
        'Пауза важкої роботи у фоні: відео, polling, анімації',
        'unload ненадійний на мобільних і ламає bfcache; hidden — останній надійний момент',
        'navigator.sendBeacon — гарантована асинхронна відправка, без відповіді, обмеження розміру',
        'fetch з keepalive: true як альтернатива'
      ],
      followUps: [
        'Що таке bfcache і як перевірити, що сторінка відновилась з нього?',
        'Як поводяться таймери у фонових вкладках?',
        'Чим sendBeacon відрізняється від fetch з keepalive?'
      ]
    },
    {
      id: 'bapi-clipboard',
      group: 'page',
      type: 'quiz',
      level: 2,
      title: 'Clipboard API',
      tags: ['clipboard', 'permissions'],
      question: 'Оберіть **усі** правильні твердження про `navigator.clipboard`:',
      options: [
        '`writeText()` повертає `Promise`',
        'Працює лише в secure context (HTTPS або `localhost`)',
        '`readText()` може будь-коли прочитати буфер обміну без дозволу користувача',
        '`writeText()` зазвичай треба викликати у відповідь на дію користувача (наприклад, в обробнику кліку)',
        '`document.execCommand("copy")` — сучасна рекомендована заміна Clipboard API'
      ],
      answer: [0, 1, 3],
      why: [
        'Правильно: API асинхронне; проміс відхиляється, якщо немає дозволу чи фокуса.',
        'Правильно: як і інші «потужні» API, доступне лише в secure context.',
        'Хибно: читання — чутлива операція, браузер питає дозвіл або підтвердження.',
        'Правильно: запис вимагає transient user activation — одразу після кліку чи клавіші.',
        'Хибно: execCommand(\'copy\') застарілий, лишається хіба як fallback.'
      ],
      hint: 'Буфер обміну може містити паролі та інші чутливі дані.',
      explanation: `
\`await navigator.clipboard.writeText(text)\` — у \`try/catch\`. У HTTP \`navigator.clipboard\` — \`undefined\`. Стан дозволу: \`navigator.permissions.query({ name: 'clipboard-read' })\`.
`
    },
    {
      id: 'bapi-blob-download',
      group: 'page',
      type: 'dom',
      level: 2,
      title: 'Завантаження файлу з Blob і createObjectURL',
      tags: ['blob', 'files'],
      description: `
**Завдання.** Напишіть \`downloadFile\`, що змушує браузер завантажити файл, згенерований прямо в JS, і підключіть її до кнопки «Експорт JSON».

**Де трапляється:** експорт таблиці в CSV/JSON, збереження звіту чи налаштувань без запиту до сервера.

**Дано (HTML):** \`<button id="export">\`; у JS — масив \`users\`.

**Що написати**
- \`downloadFile(filename, content, type = 'text/plain')\` → нічого: \`Blob\` → \`URL.createObjectURL\` → тимчасове \`<a href=url download=filename>\` у \`body\` → \`a.click()\` → видалити \`<a>\` → \`URL.revokeObjectURL(url)\`;
- клік по \`#export\` → \`downloadFile('users.json', JSON.stringify(users, null, 2), 'application/json')\`.

**Приклад**
\`\`\`js
downloadFile('note.txt', 'Привіт'); // браузер зберігає note.txt
\`\`\`

**Як це працює:** \`createObjectURL\` дає URL виду \`blob:...\`, що вказує на дані в пам'яті браузера. Атрибут \`download\` каже «зберегти файл», а не переходити. Поки URL не відкликано, Blob живе в пам'яті до закриття сторінки.

**Врахуйте:** \`new Blob([content], { type })\` — перший аргумент масив частин; посилання не має лишатися в DOM.
`,
      html: '<button id="export">Експорт JSON</button>',
      css: '',
      js: `const users = [
  { id: 1, name: 'Ann' },
  { id: 2, name: 'Bob' }
];

function downloadFile(filename, content, type = 'text/plain') {
  // 1. TODO: const blob = new Blob([content], { type })
  // 2. TODO: const url = URL.createObjectURL(blob)
  // 3. TODO: <a> з href = url і download = filename; append у body; click(); remove()
  // 4. TODO: URL.revokeObjectURL(url)
}

// 5. TODO: обробник click для #export → downloadFile('users.json', ...)

// Спробуйте в консолі: downloadFile('note.txt', 'Привіт')
`,
      editable: ['js'],
      solution: {
        js: `const users = [
  { id: 1, name: 'Ann' },
  { id: 2, name: 'Bob' }
];

function downloadFile(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a); // деякі браузери вимагають елемент у DOM
  a.click();
  a.remove();
  URL.revokeObjectURL(url); // інакше Blob житиме в пам'яті до закриття сторінки
}

document.querySelector('#export').addEventListener('click', () => {
  downloadFile('users.json', JSON.stringify(users, null, 2), 'application/json');
});
`
      },
      hints: [
        '`new Blob([content], { type })` — перший аргумент завжди масив частин.',
        'Посилання: `a.href = URL.createObjectURL(blob)`, `a.download = filename`, `document.body.append(a)`, `a.click()`, `a.remove()`.',
        "Після кліку викличте `URL.revokeObjectURL(url)`. Кнопці `#export` додайте обробник `click`, що викликає `downloadFile('users.json', JSON.stringify(users, null, 2), 'application/json')`."
      ],
      tests: [
        { name: 'створює Blob, клікає по <a download> і прибирає за собою', code: "const origCreate = URL.createObjectURL, origRevoke = URL.revokeObjectURL, origClick = HTMLAnchorElement.prototype.click;\nconst blobs = [], clicks = [], revoked = [];\nURL.createObjectURL = (b) => { blobs.push(b); return 'blob:fake-' + blobs.length; };\nURL.revokeObjectURL = (u) => { revoked.push(u); };\nHTMLAnchorElement.prototype.click = function () { clicks.push({ href: this.getAttribute('href'), download: this.download, inDom: this.isConnected }); };\ntry {\n  downloadFile('notes.txt', 'hello');\n  await sleep(20);\n  expect(blobs).toHaveLength(1);\n  expect(blobs[0].type).toBe('text/plain');\n  expect(await blobs[0].text()).toBe('hello');\n  expect(clicks).toEqual([{ href: 'blob:fake-1', download: 'notes.txt', inDom: true }]);\n  expect(revoked).toEqual(['blob:fake-1']);\n  expect($$('a[download]')).toHaveLength(0);\n} finally {\n  URL.createObjectURL = origCreate; URL.revokeObjectURL = origRevoke; HTMLAnchorElement.prototype.click = origClick;\n}" },
        { name: 'кнопка #export завантажує users.json', code: "const origCreate = URL.createObjectURL, origRevoke = URL.revokeObjectURL, origClick = HTMLAnchorElement.prototype.click;\nconst blobs = [], clicks = [];\nURL.createObjectURL = (b) => { blobs.push(b); return 'blob:fake-json'; };\nURL.revokeObjectURL = () => {};\nHTMLAnchorElement.prototype.click = function () { clicks.push(this.download); };\ntry {\n  click('#export');\n  await sleep(20);\n  expect(blobs).toHaveLength(1);\n  expect(blobs[0].type).toBe('application/json');\n  const text = await blobs[0].text();\n  expect(JSON.parse(text)).toEqual([{ id: 1, name: 'Ann' }, { id: 2, name: 'Bob' }]);\n  expect(text).toContain('\\n  ');\n  expect(clicks).toEqual(['users.json']);\n} finally {\n  URL.createObjectURL = origCreate; URL.revokeObjectURL = origRevoke; HTMLAnchorElement.prototype.click = origClick;\n}" }
      ],
      explanation: `
\`Blob\` — незмінні бінарні дані з MIME-типом; \`File\` — \`Blob\` з \`name\` (дає \`<input type="file">\`). Object URL можна ставити і в \`img.src\` — так роблять превʼю перед завантаженням.

**Пам'ять:** URL тримає Blob до \`revokeObjectURL\` або закриття сторінки — забутий revoke у галереї превʼю = витік.

**Альтернатива:** \`data:\` URL — без revoke, але +33% розміру (base64) і ліміт довжини.

**Типові помилки:** \`new Blob(content)\` без масиву; забутий revoke.

**Що спитають далі:** як показати превʼю обраного зображення? Чим \`file.text()\` кращий за \`FileReader\`?
`
    },
    // ---------------------------------------------------------------- Web Workers і postMessage
    {
      id: 'bapi-web-workers',
      group: 'workers',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Web Workers: види, postMessage, transferables',
      tags: ['workers', 'performance'],
      question: 'Що таке Web Workers і коли їх використовувати? Чим відрізняються Dedicated, Shared і Service Worker? Як передаються дані між потоками?',
      choices: [
        'Дані копіюються через structured clone, а `ArrayBuffer` можна передати як transferable — без копії',
        'Воркер має доступ до `document`, але змінювати DOM з нього можна лише в `requestAnimationFrame`',
        "`postMessage` передає об'єкт за посиланням, тож зміни у воркері одразу видно в головному потоці",
        'Service Worker — той самий Dedicated Worker, лише запущений у фоні після закриття сторінки',
        'Функції та DOM-вузли можна передати через `postMessage`, якщо попередньо обгорнути їх у `structuredClone`'
      ],
      correct: 0,
      why: [
        'Правильно: postMessage глибоко копіює дані, а transferable лише передає власність — у відправника буфер стає порожнім.',
        'Хибно: у воркері немає document і DOM узагалі — результат відправляють назад у головний потік.',
        'Хибно: дані копіюються (structured clone), спільної пам\'яті без SharedArrayBuffer немає.',
        'Хибно: Service Worker — окремий вид: проксі між сторінкою і мережею, життям керує браузер.',
        'Хибно: функції і DOM-вузли не клонуються взагалі — буде DataCloneError.'
      ],
      hint: 'Окремий потік без DOM, structured clone, transferable objects, вартість передачі.',
      answer: `
**Web Worker** — JS в **окремому потоці** зі своїм event loop і \`self\`. Головний потік не блокується — інтерфейс чуйний.

\`\`\`js
// main.js
const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
worker.postMessage({ type: 'parse', csv: bigString });
worker.onmessage = (e) => render(e.data);
worker.onerror = (e) => console.error(e.message);

// worker.js
self.onmessage = (e) => {
  const rows = parseCsv(e.data.csv);
  self.postMessage(rows);
};
\`\`\`

**Є:** \`fetch\`, таймери, IndexedDB, WebSocket, \`OffscreenCanvas\`. **Немає:** DOM, \`window\`, \`localStorage\`.

| | Dedicated | Shared | Service Worker |
|---|---|---|---|
| Хто | одна сторінка | кілька вкладок origin | усі сторінки в scope |
| Навіщо | важкі обчислення | спільний стан, один WebSocket | офлайн, кеш, push |

**Передача:** structured clone — глибока копія (\`Map/Set\`, \`Date\`, \`Blob\`, цикли). Функції і DOM → \`DataCloneError\`, прототипи втрачаються.

**Transferable** (\`ArrayBuffer\`, \`MessagePort\`, \`ImageBitmap\`) — без копії:
\`\`\`js
worker.postMessage(buf, [buf]);
buf.byteLength; // 0 — буфер detached
\`\`\`

**Коли варто:** парсинг великих JSON/CSV, зображення, шифрування. Для дрібних задач створення воркера і копіювання дорожчі за роботу.
`,
      keyPoints: [
        'Окремий потік зі своїм event loop, немає доступу до DOM',
        'Dedicated vs Shared vs Service Worker — призначення та життєвий цикл',
        'postMessage копіює дані через structured clone; функції/DOM — DataCloneError',
        'Transferable objects передаються без копіювання, у відправника стають detached',
        'Використовувати для важких обчислень; накладні витрати на створення і копіювання'
      ],
      followUps: [
        'Чи можна з воркера змінити DOM? Як тоді показати результат?',
        'Що таке SharedArrayBuffer і навіщо cross-origin isolation?',
        'Чим Service Worker відрізняється за життєвим циклом від звичайного воркера?'
      ]
    },
    {
      id: 'bapi-structured-clone',
      group: 'workers',
      type: 'quiz',
      level: 3,
      title: 'Що можна передати через postMessage',
      tags: ['workers', 'structured-clone'],
      question: 'Оберіть **усі** значення, які можна передати через `worker.postMessage(value)` **без помилки**:',
      options: [
        '`new Map([[1, { a: 1 }]])`',
        '`{ onDone: () => console.log("done") }`',
        '`new Date()`',
        '`document.querySelector("#app")`',
        "Об'єкт із циклічним посиланням (`obj.self = obj`)",
        '`new User("Ann")` — екземпляр власного класу'
      ],
      answer: [0, 2, 4, 5],
      why: [
        'Правильно: Map копіюється глибоко разом із вкладеними об\'єктами.',
        'Хибно: функцію клонувати не можна — DataCloneError; передавайте назву операції.',
        'Правильно: Date відновлюється як Date.',
        'Хибно: DOM-вузол прив\'язаний до документа — DataCloneError.',
        'Правильно: structured clone підтримує цикли, на відміну від JSON.stringify.',
        'Правильно, але підступно: помилки немає, проте прийде звичайний об\'єкт без прототипу і методів.'
      ],
      hint: "Алгоритм structured clone копіює дані, але не поведінку і не прив'язку до документа.",
      explanation: `
Той самий алгоритм — у \`structuredClone()\`, IndexedDB, \`history.pushState\`. Не клонуються також символи і \`WeakMap\`; геттери стають значеннями; в \`Error\` лишаються лише \`name\`, \`message\`, \`stack\`, \`cause\`.
`
    },
    {
      id: 'bapi-worker-protocol',
      group: 'workers',
      type: 'theory',
      level: 4,
      title: 'Протокол повідомлень між сторінкою і воркером',
      tags: ['workers', 'architecture'],
      question: 'Ви виносите важкі обчислення у Web Worker. Як спроєктувати протокол обміну повідомленнями, щоб він був надійним і зручним: кілька паралельних запитів, помилки, скасування, прогрес, великі дані? Оберіть **усі** правильні твердження.',
      choices: [
        'Кожен запит має унікальний `id`, а сторінка тримає `Map` очікуваних промісів для зіставлення відповідей',
        'Відповіді воркера завжди приходять у порядку запитів, тож вистачить черги FIFO без ідентифікаторів',
        'Помилку серіалізують як `{ name, message, stack }`, а при `onerror` відхиляють усі очікувані запити',
        'Великий `ArrayBuffer` передають як transferable (`postMessage(msg, [buf])`), щоб уникнути копіювання',
        'Скасувати задачу можна лише `worker.terminate()` — повідомлення `cancel` воркер обробити не здатен'
      ],
      correct: [0, 2, 3],
      why: [
        'Правильно: id зіставляє відповідь із запитом, навіть якщо відповіді приходять не по порядку.',
        'Хибно: асинхронні задачі у воркері завершуються в довільному порядку — без id відповіді переплутаються.',
        'Правильно: кастомні поля помилки structured clone може втратити, а падіння воркера має завершити всі очікування.',
        'Правильно: transferable передає власність без копіювання — критично для великих буферів.',
        'Хибно: воркер може перевіряти прапорець cancel між чанками роботи; terminate — крайній захід.'
      ],
      hint: 'Кореляційні id, типізовані повідомлення, серіалізація помилок, transferables, таймаути, перезапуск воркера.',
      answer: `
\`postMessage\` — односпрямований канал без відповідей, тож поверх нього будують **RPC-протокол**.

**1. Кореляція.** Кожен запит має унікальний \`id\`, відповідь несе той самий; на сторінці — \`Map<id, { resolve, reject }>\`:
\`\`\`js
// запит:     { id: 7, type: 'call', method: 'resize', args: [...] }
// відповідь: { id: 7, type: 'result', result: ... } | { id: 7, type: 'error', error: { name, message } }
// прогрес:   { id: 7, type: 'progress', loaded: 50, total: 100 }
// скасування: { id: 7, type: 'cancel' }
\`\`\`
**2. Типи повідомлень** (\`type\`) спільні для обох боків; версія протоколу, якщо воркер оновлюється окремо.

**3. Помилки:** у воркері \`try/catch\` → \`{ name, message, stack }\`; на сторінці відтворюємо \`Error\`. На \`onerror\`/\`onmessageerror\` відхиляємо **всі** очікувані запити.

**4. Скасування і таймаути:** \`AbortSignal\` → повідомлення \`cancel\`, воркер перевіряє прапорець між чанками. Таймаут прибирає запис з Map, пізня відповідь ігнорується. Крайній захід — \`terminate()\`.

**5. Великі дані:** transferable (\`postMessage(msg, [buffer])\`).

**6. Життєвий цикл:** пул воркерів, \`dispose()\`. Готове рішення — Comlink.
`,
      keyPoints: [
        'Унікальний id для кожного запиту і Map очікуваних промісів',
        'Типізовані повідомлення (result / error / progress / cancel) і версіонування',
        'Серіалізація помилок і обробка onerror/onmessageerror',
        'Скасування, таймаути, ігнорування пізніх відповідей, terminate як крайній захід',
        'Transferable objects для великих даних',
        'Пул воркерів, dispose, бібліотеки на кшталт Comlink'
      ],
      followUps: [
        'Як скасувати обчислення, яке вже виконується у воркері в синхронному циклі?',
        'Як реалізувати пул воркерів з чергою задач?',
        'Як працює Comlink під капотом?'
      ]
    },
    {
      id: 'bapi-worker-rpc',
      group: 'workers',
      type: 'code',
      level: 4,
      title: 'RPC-клієнт поверх postMessage',
      tags: ['workers', 'promises', 'architecture'],
      description: `
**Завдання.** Напишіть клієнт, що дозволяє викликати методи воркера як async-функції: \`await rpc.call('sum', 1, 2)\`.

**Де трапляється:** винесення парсингу/обробки зображень у Web Worker; так влаштований Comlink. На співбесідах — «як зіставити відповідь із запитом поверх postMessage?».

**Що написати**
- \`createRpcClient(port, { timeout = 0 } = {})\` → \`{ call, dispose }\`. \`port\` — будь-що з \`postMessage\`, \`addEventListener('message')\`, \`removeEventListener\` (Worker, MessagePort, фейк у тестах).
- \`call(method, ...args)\` → проміс. Надсилає \`{ id, method, args }\` з унікальним числовим \`id\`.
  - відповідь \`event.data = { id, result }\` → resolve(\`result\`);
  - \`{ id, error: { name, message } }\` → reject(\`Error\` з тими самими \`name\` і \`message\`);
  - \`timeout > 0\` і відповіді немає → reject(\`Error('RPC timeout: <method>')\`);
  - \`port.postMessage\` кинув (DataCloneError) → reject цією помилкою.
- \`dispose()\` → знімає обробник і відхиляє всі очікувані виклики \`Error('RPC disposed')\`.

**Приклад**
\`\`\`js
const rpc = createRpcClient(worker, { timeout: 5000 });
const p = rpc.call('sum', 1, 2); // відправлено { id: 1, method: 'sum', args: [1, 2] }
// воркер відповів { id: 1, result: 3 }
await p; // 3
\`\`\`

**Як це працює:** \`call\` створює проміс і кладе його \`resolve/reject\` у \`Map\` під новим \`id\`. Один обробник \`message\` на весь клієнт шукає \`id\` у Map і завершує відповідний проміс — тож відповіді можуть приходити в будь-якому порядку.

**Врахуйте:** невідомий \`id\`, не-об'єкти і повторна відповідь ігноруються; після таймауту пізня відповідь ігнорується; таймер очищається при відповіді.
`,
      starter: `function createRpcClient(port, { timeout = 0 } = {}) {
  let nextId = 1;
  const pending = new Map(); // id -> { resolve, reject, timer }

  function onMessage(event) {
    // 1. TODO: msg = event.data; якщо не об'єкт або id немає в pending — ігнорувати
    // 2. TODO: видалити запис, clearTimeout(timer)
    // 3. TODO: msg.error → reject(new Error(...)) з тим самим name; інакше resolve(msg.result)
  }

  // 4. TODO: port.addEventListener('message', onMessage)

  return {
    call(method, ...args) {
      // 5. TODO: return new Promise((resolve, reject) => {
      //      id = nextId++; таймер (якщо timeout > 0) → видалити запис і reject('RPC timeout: ' + method)
      //      pending.set(id, ...); try { port.postMessage({ id, method, args }) } catch → прибрати і reject
      //    })
    },
    dispose() {
      // 6. TODO: removeEventListener і reject(new Error('RPC disposed')) для кожного запису
    }
  };
}

// Спробуйте: const rpc = createRpcClient(new Worker('math.js')); await rpc.call('sum', 1, 2)
`,
      solution: `function createRpcClient(port, { timeout = 0 } = {}) {
  let nextId = 1;
  const pending = new Map(); // id -> { resolve, reject, timer }

  function settle(id) {
    const entry = pending.get(id);
    pending.delete(id);
    clearTimeout(entry.timer);
    return entry;
  }

  function onMessage(event) {
    const msg = event.data;
    if (!msg || typeof msg !== 'object' || !pending.has(msg.id)) return;
    const { resolve, reject } = settle(msg.id);
    if (msg.error) {
      const err = new Error(msg.error.message);
      if (msg.error.name) err.name = msg.error.name;
      reject(err);
    } else {
      resolve(msg.result);
    }
  }

  port.addEventListener('message', onMessage);

  return {
    call(method, ...args) {
      return new Promise((resolve, reject) => {
        const id = nextId++;
        const timer = timeout > 0
          ? setTimeout(() => {
              settle(id);
              reject(new Error('RPC timeout: ' + method));
            }, timeout)
          : null;
        pending.set(id, { resolve, reject, timer });
        try {
          port.postMessage({ id, method, args });
        } catch (err) {
          settle(id); // наприклад, DataCloneError — прибираємо запис
          reject(err);
        }
      });
    },
    dispose() {
      port.removeEventListener('message', onMessage);
      for (const id of [...pending.keys()]) {
        settle(id).reject(new Error('RPC disposed'));
      }
    }
  };
}
`,
      hints: [
        'Зберігайте очікувані виклики в `Map<id, { resolve, reject, timer }>`; лічильник `nextId++` дає унікальні id.',
        'Один обробник `message` на весь клієнт: знайшов `id` у Map → видалив запис, очистив таймер → `resolve(result)` або `reject(new Error(...))`. Немає в Map — ігнорувати.',
        'Таймаут і помилка `postMessage` — це теж «завершення» запису: видаліть його з Map, щоб пізня відповідь проігнорувалась. `dispose`: `removeEventListener` + reject для кожного запису.'
      ],
      tests: [
        { name: 'надсилає { id, method, args } з унікальними id', code: PORT + "const rpc = createRpcClient(port);\nrpc.call('sum', 1, 2);\nrpc.call('ping');\nexpect(port.sent).toHaveLength(2);\nexpect(port.sent[0]).toMatchObject({ method: 'sum', args: [1, 2] });\nexpect(port.sent[1]).toMatchObject({ method: 'ping', args: [] });\nexpect(typeof port.sent[0].id).toBe('number');\nexpect(port.sent[0].id).not.toBe(port.sent[1].id);" },
        { name: 'відповіді зіставляються за id (у довільному порядку)', code: PORT + "const rpc = createRpcClient(port);\nconst a = rpc.call('sum', 1, 2);\nconst b = rpc.call('mul', 2, 5);\nreply({ id: port.sent[1].id, result: 10 });\nreply({ id: port.sent[0].id, result: 3 });\nawait expect(a).resolves.toBe(3);\nawait expect(b).resolves.toBe(10);" },
        { name: 'помилка воркера → reject з тим самим name і message', code: PORT + "const rpc = createRpcClient(port);\nconst p = rpc.call('parse', '{bad');\nreply({ id: port.sent[0].id, error: { name: 'SyntaxError', message: 'Unexpected token' } });\nconst err = await p.catch((e) => e);\nexpect(err).toBeInstanceOf(Error);\nexpect(err.name).toBe('SyntaxError');\nexpect(err.message).toBe('Unexpected token');" },
        { name: 'невідомі id, сміття і повторні відповіді ігноруються', code: PORT + "const rpc = createRpcClient(port);\nconst p = rpc.call('x');\nreply(null);\nreply('hello');\nreply({ id: 999, result: 'alien' });\nconst id = port.sent[0].id;\nreply({ id, result: 'first' });\nreply({ id, result: 'second' });\nawait expect(p).resolves.toBe('first');" },
        { name: 'timeout → reject, пізня відповідь ігнорується', code: PORT + "useFakeTimers();\nconst rpc = createRpcClient(port, { timeout: 100 });\nconst p = rpc.call('slow');\np.catch(() => {});\nadvanceTimersByTime(99);\nawait flushPromises();\nadvanceTimersByTime(1);\nawait expect(p).rejects.toThrow('RPC timeout: slow');\nexpect(() => reply({ id: port.sent[0].id, result: 1 })).not.toThrow();\nexpect(getTimerCount()).toBe(0);" },
        { name: 'успішна відповідь очищає таймер', code: PORT + "useFakeTimers();\nconst rpc = createRpcClient(port, { timeout: 1000 });\nconst p = rpc.call('fast');\nreply({ id: port.sent[0].id, result: 'ok' });\nawait expect(p).resolves.toBe('ok');\nexpect(getTimerCount()).toBe(0);" },
        { name: 'помилка postMessage → reject цією помилкою', code: PORT + "port.postMessage = () => { throw new DOMException('could not be cloned', 'DataCloneError'); };\nconst rpc = createRpcClient(port);\nconst err = await rpc.call('send', () => {}).catch((e) => e);\nexpect(err.name).toBe('DataCloneError');" },
        { name: 'dispose відхиляє очікувані виклики і знімає обробник', code: PORT + "const rpc = createRpcClient(port);\nconst a = rpc.call('a');\nconst b = rpc.call('b');\nrpc.dispose();\nawait expect(a).rejects.toThrow('RPC disposed');\nawait expect(b).rejects.toThrow('RPC disposed');\nconst c = rpc.call('c');\nlet settled = false;\nc.then(() => { settled = true; }, () => { settled = true; });\nreply({ id: port.sent[2].id, result: 1 });\nawait flushPromises();\nexpect(settled).toBe(false);" }
      ],
      explanation: `
Це спрощене серце бібліотек на кшталт **Comlink**: перетворити односпрямований \`postMessage\` на виклики \`await rpc.call(...)\`.

**Ключові рішення:**
- **кореляційний id** + \`Map\` очікуваних промісів — паралельні виклики не плутаються, порядок відповідей не важливий;
- **одна точка завершення** (\`settle\`): видалити запис, очистити таймер. Завдяки цьому таймаут, помилка відправки та \`dispose\` автоматично роблять пізні/повторні відповіді «невідомими» → ігнор;
- **помилки** через structured clone передаються як простий об'єкт \`{ name, message }\` — на клієнті відтворюємо \`Error\` (бажано ще й \`stack\`/\`cause\`);
- \`postMessage\` синхронно кидає \`DataCloneError\` (функція, DOM-вузол в args) — без \`try/catch\` запис висів би в Map вічно (витік).

**Складність:** O(1) на виклик і відповідь; пам'ять — O(кількість очікуваних викликів).

**Типові помилки:** \`addEventListener\` на кожен \`call\` (N обробників, витік і O(N) на повідомлення); глобальний лічильник без Map (неможливо зіставити відповідь); забутий \`clearTimeout\`; \`dispose\` без відхилення очікуваних промісів (код, що чекає, зависає назавжди).

**Що спитають далі:** як додати скасування через \`AbortSignal\` (надіслати \`{ type: 'cancel', id }\`)? Як передавати \`ArrayBuffer\` як transferable? Як написати серверну частину (у воркері) — диспетчер методів з обробкою async-помилок? Як зробити \`rpc.sum(1, 2)\` замість \`rpc.call('sum', ...)\` (Proxy)?
`
    },
    {
      id: 'bapi-download-progress', group: 'streams-canvas', type: 'code', level: 3,
      title: 'Прогрес завантаження через ReadableStream',
      description: `
**Завдання.** Напишіть \`downloadWithProgress(response, onProgress)\` → \`Promise<string>\`:
- читає тіло відповіді **частинами** через \`response.body.getReader()\`;
- після кожної частини викликає \`onProgress(loaded, total)\`: \`loaded\` — скільки байтів уже отримано, \`total\` — з заголовка \`Content-Length\` або \`null\`, якщо його немає;
- повертає весь текст, декодований з UTF-8.

**Де трапляється:** прогрес-бар завантаження великого файлу чи звіту. \`fetch\` не має події progress, тому прогрес рахують, читаючи потік.

**Як це працює:** \`response.body\` — це \`ReadableStream\`: \`getReader().read()\` віддає шматки \`Uint8Array\` у міру надходження, а заголовок \`Content-Length\` дає загальний розмір для відсотків. Зібрані шматки потім склеюють у \`Blob\` або декодують \`TextDecoder\`.

**Врахуйте:** літера «П» в UTF-8 займає 2 байти, і частина може закінчитися посеред літери. Декодуйте з \`decoder.decode(chunk, { stream: true })\` — декодер «дочекається» решти байтів.
`,
      starter: `async function downloadWithProgress(response, onProgress) {
  const total = Number(response.headers.get('Content-Length')) || null;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let loaded = 0;
  let text = '';

  // TODO: while (true) { const { done, value } = await reader.read(); ... }
  // value — Uint8Array; loaded += value.byteLength

  return text;
}
`,
      solution: `async function downloadWithProgress(response, onProgress) {
  const total = Number(response.headers.get('Content-Length')) || null;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let loaded = 0;
  let text = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    loaded += value.byteLength;
    text += decoder.decode(value, { stream: true });
    onProgress(loaded, total);
  }
  text += decoder.decode();
  return text;
}
`,
      hints: ['`reader.read()` повертає `{ done, value }`; коли `done === true` — потік закінчився.', 'Після циклу викличте `decoder.decode()` без аргументів — він віддасть «хвіст», якщо щось лишилось у буфері.'],
      tests: [
        { name: 'прогрес за байтами і текст', code: "const enc = new TextEncoder();\nconst body = new ReadableStream({ start(c) { c.enqueue(enc.encode('ab')); c.enqueue(enc.encode('cd')); c.close(); } });\nconst onProgress = mockFn();\nconst text = await downloadWithProgress(new Response(body, { headers: { 'Content-Length': '4' } }), onProgress);\nexpect(text).toBe('abcd');\nexpect(onProgress.mock.calls).toEqual([[2, 4], [4, 4]]);" },
        { name: 'без Content-Length — total = null', code: "const enc = new TextEncoder();\nconst body = new ReadableStream({ start(c) { c.enqueue(enc.encode('xyz')); c.close(); } });\nconst onProgress = mockFn();\nawait downloadWithProgress(new Response(body), onProgress);\nexpect(onProgress.mock.calls).toEqual([[3, null]]);" },
        { name: 'літера розрізана між частинами', code: "const bytes = new TextEncoder().encode('Привіт');\nconst body = new ReadableStream({ start(c) { c.enqueue(bytes.slice(0, 3)); c.enqueue(bytes.slice(3)); c.close(); } });\nexpect(await downloadWithProgress(new Response(body), () => {})).toBe('Привіт');" }
      ],
      explanation: '`total` може бути недоступним: без `Content-Length`, при стисненні (`Content-Encoding: gzip` — тоді заголовок означає стиснений розмір, а потік віддає розпакований) або через CORS, якщо сервер не відкрив заголовок (`Access-Control-Expose-Headers`). Тоді показують невизначений індикатор. Для прогресу **вивантаження** (upload) у `fetch` досі немає простого API — використовують `XMLHttpRequest.upload.onprogress`.'
    },
    {
      id: 'bapi-canvas-bars', group: 'streams-canvas', type: 'dom', level: 2,
      title: 'Canvas: стовпчикова діаграма',
      tags: ['canvas', '2d'],
      description: `
**Завдання.** Напишіть \`drawBars(canvas, values, color = '#3b82f6')\`:
- \`values\` — відсотки висоти (0–100); стовпці однакової ширини на всю ширину canvas, без проміжків;
- стовпці ростуть **знизу вгору**;
- кожен виклик спершу очищує canvas.

**Де трапляється:** графіки, мініграфіки (sparklines), ігри, редактори зображень — усюди, де багато графіки змінюється щокадру.

**Як це працює:** \`canvas.getContext('2d')\` дає API малювання. Вісь Y спрямована **вниз**: \`fillRect(x, y, w, h)\` малює прямокутник від точки (x, y) праворуч і вниз. Тому стовпчик висотою \`h\` починається з \`y = height - h\`.
`,
      html: `<canvas id="c" width="200" height="100"></canvas>`,
      css: `canvas { border: 1px solid #ccc; }`,
      js: `function drawBars(canvas, values, color = '#3b82f6') {
  const ctx = canvas.getContext('2d');
  // 1. Очистити: ctx.clearRect(...)
  // 2. Ширина стовпця = canvas.width / values.length
  // 3. Для кожного значення: висота = v / 100 * canvas.height; fillRect від низу
}

// Спробуйте: drawBars(document.getElementById('c'), [30, 80, 55])
`,
      editable: ['js'],
      solution: {
        js: `function drawBars(canvas, values, color = '#3b82f6') {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const w = canvas.width / values.length;
  ctx.fillStyle = color;
  values.forEach((v, i) => {
    const h = (v / 100) * canvas.height;
    ctx.fillRect(i * w, canvas.height - h, w, h);
  });
}
`
      },
      hints: ['`ctx.fillStyle = color`, потім `ctx.fillRect(i * w, canvas.height - h, w, h)`.', 'Очищення: `ctx.clearRect(0, 0, canvas.width, canvas.height)`.'],
      tests: [
        { name: 'стовпці потрібної висоти знизу вгору', code: "const c = $('#c');\ndrawBars(c, [50, 100], '#ff0000');\nconst px = (x, y) => [...c.getContext('2d').getImageData(x, y, 1, 1).data];\nexpect(px(50, 90)).toEqual([255, 0, 0, 255]);\nexpect(px(50, 10)[3]).toBe(0);\nexpect(px(150, 5)).toEqual([255, 0, 0, 255]);" },
        { name: 'повторний виклик очищує попереднє', code: "const c = $('#c');\ndrawBars(c, [100, 100], '#ff0000');\ndrawBars(c, [10, 10], '#00ff00');\nconst px = (x, y) => [...c.getContext('2d').getImageData(x, y, 1, 1).data];\nexpect(px(150, 5)[3]).toBe(0);\nexpect(px(150, 95)).toEqual([0, 255, 0, 255]);" },
        { name: 'колір за замовчуванням', code: "const c = $('#c');\ndrawBars(c, [100]);\nexpect([...c.getContext('2d').getImageData(100, 50, 1, 1).data]).toEqual([59, 130, 246, 255]);" }
      ],
      explanation: 'Canvas — **растр**: намальоване стає пікселями, браузер не пам\'ятає «об\'єкти», тому інтерактивність (hover, клік по стовпцю) рахують вручну за координатами. Для чіткості на Retina розмір буфера множать на `devicePixelRatio`, а CSS-розмір лишають логічним, плюс `ctx.scale(dpr, dpr)`. Доступність: canvas не читається скрінрідером — потрібні `role="img"` з `aria-label` або таблиця даних поруч. Важке малювання можна винести у воркер через `OffscreenCanvas`.'
    },
    {
      id: 'bapi-canvas-vs-svg', group: 'streams-canvas', type: 'quiz', level: 2,
      title: 'Canvas чи SVG',
      question: 'Графік біржових котирувань: **50 000** точок, оновлення 60 разів на секунду. Що обрати?',
      options: [
        'SVG: кожна точка — `<circle>` з обробниками подій',
        'Canvas: малювати кадр пікселями, без DOM-вузла на кожну точку',
        'HTML: `<div>` на кожну точку з `position: absolute`',
        'Немає різниці — обидва працюють однаково швидко'
      ],
      answer: 1,
      why: [
        'Ні: 50 000 DOM-вузлів, що оновлюються щокадру, — надто повільно (layout, пам\'ять).',
        'Так: вартість залежить від кількості пікселів, а не об\'єктів.',
        'Ні: ще гірше за SVG — повний layout для кожного div.',
        'Ні: SVG — це DOM, його вартість росте з кількістю елементів.'
      ],
      hint: 'Що дорожче для браузера: 50 000 вузлів у DOM чи перемалювати картинку?',
      explanation: '**SVG** — векторний DOM: масштабується без втрат, кожен елемент стилізується CSS, має події й доступність. Ідеальний для іконок, логотипів, діаграм із сотнями елементів. **Canvas** — растр без DOM: швидкий для тисяч об\'єктів і анімацій (графіки, ігри, візуалізації), але інтерактивність і доступність доводиться робити вручну. Для мільйонів точок — WebGL.'
    },
    {
      id: 'bapi-feature-detection', group: 'streams-canvas', type: 'theory', level: 2,
      title: 'Feature detection і progressive enhancement',
      question: 'Оберіть **усі** правильні твердження.',
      choices: [
        '`if (\'IntersectionObserver\' in window)` — перевірка наявності можливості (feature detection)',
        '`@supports (display: grid)` і `CSS.supports()` дозволяють застосувати стилі лише там, де їх підтримують',
        'Аналіз `navigator.userAgent` — надійний спосіб визначити можливості браузера',
        'Progressive enhancement: базова версія працює всюди (наприклад, форма відправляється без JS), а покращення додаються там, де підтримуються',
        'Найкраща практика — завжди завантажувати всі поліфіли всім користувачам'
      ],
      correct: [0, 1, 3],
      why: [
        'Так: перевіряємо саму можливість, а не назву браузера.',
        'Так: це feature detection у CSS.',
        'Ні: UA підробляють і скорочують (UA reduction у Chrome); браузери з однаковою назвою мають різні можливості.',
        'Так: так інтерфейс не ламається, якщо щось не підтримано чи JS не завантажився.',
        'Ні: зайвий код для сучасних браузерів; поліфіли вантажать умовно або за browserslist.'
      ],
      hint: 'Що надійніше: «це Chrome, отже вміє» чи «перевіримо, чи вміє»?',
      answer: `
**Feature detection** — перевіряємо наявність API:
\`\`\`js
if ('share' in navigator) shareButton.hidden = false;
if (!CSS.supports('selector(:has(*))')) document.body.classList.add('no-has');
\`\`\`
\`\`\`css
@supports (container-type: inline-size) { .card { container-type: inline-size; } }
\`\`\`

**Чому не User-Agent:** UA підробляють, браузери копіюють UA-рядки один одного, Chrome скорочує UA (UA reduction), а можливості залежать від версії й налаштувань, а не від назви.

**Progressive enhancement** — від бази до покращень: HTML працює сам (посилання, форми), CSS покращує вигляд, JS — взаємодію. **Graceful degradation** — навпаки: робимо для сучасних браузерів і даємо «прийнятну» поведінку старішим.

**Поліфіли:** підключати лише потрібні (за \`browserslist\` під час збірки або умовно в рантаймі). Те, що змінює синтаксис (\`?.\`, класи), не поліфілиться, а **транспілюється**.
`,
      keyPoints: [
        'Перевіряти можливість, а не браузер',
        '@supports і CSS.supports для CSS',
        'UA ненадійний: підробка, UA reduction',
        'Progressive enhancement: база працює без покращень',
        'Синтаксис — транспіляція, API — поліфіли'
      ]
    }
  ]
});
})();
