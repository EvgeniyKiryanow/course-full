FE.topic('security', {
  intro: `
## XSS (Cross-Site Scripting)

| Тип | Де живе payload | Приклад |
|---|---|---|
| Stored | у БД, показується іншим | коментар з \`<img src=x onerror=...>\` |
| Reflected | у запиті, сервер віддзеркалює у відповідь | \`/search?q=<script>...\` |
| DOM-based | лише на клієнті: джерело → небезпечний sink | \`el.innerHTML = location.hash.slice(1)\` |

**Небезпечні sinks:** \`innerHTML\`, \`outerHTML\`, \`insertAdjacentHTML\`, \`document.write\`, \`eval\`, \`new Function\`, \`setTimeout('рядок')\`, \`href/src = 'javascript:...'\`, \`dangerouslySetInnerHTML\`, \`v-html\`.
**Безпечні альтернативи:** \`textContent\`, \`setAttribute\` для безпечних атрибутів, \`createElement\`, DOMPurify, Trusted Types.

- **Екранування (escaping)** — показати дані як текст: \`<\` → \`&lt;\`. Залежить від контексту (HTML, атрибут, URL, JS, CSS).
- **Санітизація (sanitizing)** — дозволити безпечну підмножину HTML (allowlist тегів і атрибутів).

## CSP (Content-Security-Policy)

\`\`\`http
Content-Security-Policy: default-src 'self'; script-src 'nonce-R4nd0m' 'strict-dynamic'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
\`\`\`
- Nonce — випадковий для кожної відповіді; hash — для статичних inline-скриптів.
- \`Content-Security-Policy-Report-Only\` — лише звітувати, не блокувати (безпечне впровадження).

## CSRF і cookies

- CSRF: чужий сайт змушує браузер надіслати запит **з вашими cookies**.
- Захист: \`SameSite=Lax/Strict\`, CSRF-токен (synchronizer / double-submit), перевірка \`Origin\`/\`Sec-Fetch-Site\`, не змінювати стан у GET.

\`\`\`http
Set-Cookie: __Host-session=abc; Path=/; Secure; HttpOnly; SameSite=Lax
\`\`\`
| Атрибут | Захищає від |
|---|---|
| \`HttpOnly\` | читання з JS (крадіжка при XSS) |
| \`Secure\` | передачі по HTTP |
| \`SameSite\` | надсилання в cross-site запитах (CSRF) |
| \`__Host-\` | підміни з піддомену (Secure, Path=/, без Domain) |

## Автентифікація

- Сесія (id у cookie, стан на сервері) vs JWT (\`header.payload.signature\`, base64url — **не шифрування**).
- SPA: OAuth 2.0 **Authorization Code + PKCE** (implicit flow застарів), токени — у пам'яті / HttpOnly-cookie, refresh token rotation, або BFF.

## Інше

- Clickjacking → \`frame-ancestors 'none'\` / \`X-Frame-Options: DENY\`.
- HTTPS + HSTS (\`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload\`).
- SRI: \`<script src="cdn/x.js" integrity="sha384-..." crossorigin="anonymous">\`.
- Prototype pollution: блокуйте \`__proto__\`, \`constructor\`, \`prototype\` при глибокому злитті.
- Open redirect: дозволяйте лише same-origin \`returnTo\`.
- \`postMessage\`: **завжди** перевіряйте \`event.origin\` і вказуйте \`targetOrigin\`.
- Усе, що потрапило в бандл, — **публічне**. Секрети — лише на сервері.
`,
  groups: [
    { id: "xss", title: "XSS: sinks, екранування, санітизація" },
    { id: "csp", title: "Content-Security-Policy" },
    { id: "cookies-csrf", title: "Cookies, CSRF, clickjacking" },
    { id: "auth", title: "Автентифікація: сесії, JWT, OAuth" },
    { id: "transport", title: "HTTPS, SRI, безпечний JS" },
    { id: "process", title: "Секрети, залежності, OWASP" }
  ],
  items: [
    // ---------------------------------------------------------------- XSS
    {
      id: 'sec-xss-types', group: "xss", why: ["Так: DOM XSS живе лише у фронтенд-коді — сервер payload не бачить.","Ні: innerHTML не виконує script, але обробники на кшталт onerror спрацюють.","Ні: фільтри обходять; правильно — екранувати під контекст на виведенні.","Так: stored XSS уражає кожного відвідувача сторінки.","Ні: скрипт усе одно діє від імені користувача (запити, читання сторінки)."],
      type: 'theory',
      level: 2,
      interview: true,
      title: 'XSS: типи, наслідки, захист',
      tags: ['xss'],
      question: 'Що таке XSS? Які типи XSS існують? Чим вони небезпечні і як від них захищатися на фронтенді? Оберіть **усі** правильні твердження.',
      choices: [
        'DOM-based XSS виникає без участі сервера: JS передає дані з `location.hash` чи `postMessage` у небезпечний sink',
        'Рядок `<img src=x onerror=...>`, вставлений через `innerHTML`, не виконається, бо `innerHTML` не запускає скриптів',
        'Надійний захист — вирізати `<script>` і `on*`-атрибути на вході, тоді екранувати на виведенні не потрібно',
        'Stored XSS найнебезпечніший: payload зберігається на сервері й уражає всіх, хто відкриє сторінку',
        'HttpOnly cookies повністю нейтралізують XSS: без доступу до cookie скрипт нічого не може зробити'
      ],
      correct: [0, 3],
      hint: 'Класифікуйте за тим, де зберігається шкідливий код і хто його вставляє у сторінку.',
      answer: `
**XSS (Cross-Site Scripting)** — вразливість, коли зловмисник змушує сторінку виконати **його JavaScript у контексті вашого origin**. Скрипт отримує все, що має ваш код: DOM, \`localStorage\`, не-HttpOnly cookies, можливість робити запити від імені користувача (з його cookies), підміняти форми логіну, ставити кейлогери.

**Типи:**
1. **Stored (збережений)** — payload зберігається на сервері (коментар, ім'я профілю) і віддається всім, хто відкриє сторінку. Найнебезпечніший: масове ураження без участі жертви.
2. **Reflected (віддзеркалений)** — payload у запиті (\`?q=<script>...\`), сервер вставляє його у відповідь без екранування. Жертву треба змусити відкрити посилання.
3. **DOM-based** — сервер ні до чого: клієнтський JS бере дані з **джерела** (\`location.hash\`, \`location.search\`, \`postMessage\`, \`localStorage\`, \`document.referrer\`) і передає в **небезпечний sink**:
\`\`\`js
// вразливо: /#<img src=x onerror=alert(document.cookie)>
document.querySelector('#greeting').innerHTML = decodeURIComponent(location.hash.slice(1));
// безпечно
document.querySelector('#greeting').textContent = decodeURIComponent(location.hash.slice(1));
\`\`\`
Зауважте: \`<script>\`, вставлений через \`innerHTML\`, **не виконується**, але \`<img onerror>\`, \`<svg onload>\`, \`<iframe srcdoc>\` — виконуються.

**Захист (defense in depth):**
- **Контекстне екранування на виведенні** — головне правило. Сучасні фреймворки (React, Vue, Angular) екранують інтерполяцію автоматично: \`{userInput}\` у JSX безпечний.
- **Уникати небезпечних sinks**: \`innerHTML\`, \`outerHTML\`, \`insertAdjacentHTML\`, \`document.write\`, \`eval\`/\`new Function\`/\`setTimeout(string)\`, \`dangerouslySetInnerHTML\`, \`v-html\`. Використовувати \`textContent\`, \`createElement\`, \`setAttribute\` для безпечних атрибутів.
- **URL-атрибути**: валідувати протокол (\`href\`, \`src\`) — екранування HTML не зупиняє \`javascript:\`.
- **Санітизація**, якщо HTML справді потрібен (rich text, markdown): DOMPurify з allowlist.
- **CSP** з nonce/strict-dynamic — навіть якщо ін'єкція сталася, inline-скрипт не виконається.
- **Trusted Types** — браузер забороняє передавати звичайні рядки в DOM-sinks.
- **HttpOnly** cookies — XSS не вкраде сесію (але все одно зможе діяти від імені користувача).

**Пастка:** валідація на вході («вирізати \`<script>\`») — ненадійна: обходиться регістром, вкладеністю, подіями, кодуваннями. Екранувати треба на **виході**, під конкретний контекст.
`,
      keyPoints: [
        'Визначення: виконання чужого JS в контексті вашого origin і наслідки',
        'Три типи: stored, reflected, DOM-based (джерело → sink)',
        'Небезпечні sinks і безпечні альтернативи (textContent, createElement)',
        'Контекстне екранування на виведенні; фреймворки екранують за замовчуванням',
        'Шари захисту: санітизація (DOMPurify), CSP, Trusted Types, HttpOnly',
        'Фільтрація на вході ненадійна'
      ],
      followUps: ['Чому <script>, вставлений через innerHTML, не виконується, а <img onerror> — виконується?', 'Як можна отримати XSS у React-застосунку?', 'Чи захищає HttpOnly від наслідків XSS повністю?']
    },
    {
      id: 'sec-quiz-sinks', group: "xss", why: ["Так: рядок парситься як HTML.","Ні: textContent вставляє лише текст.","Так: це той самий HTML-парсинг.","Так: javascript:-URL виконається при кліку.","Так: рядок у setTimeout виконується як код.","Ні: value — просто текст поля."],
      type: 'quiz',
      level: 2,
      title: 'Небезпечні DOM-sinks',
      tags: ['xss', 'dom'],
      question: 'Змінна `userInput` повністю контролюється зловмисником. Оберіть **усі** рядки, що можуть призвести до виконання його коду:',
      options: [
        '`el.innerHTML = userInput`',
        '`el.textContent = userInput`',
        '`el.insertAdjacentHTML(\'beforeend\', userInput)`',
        '`link.href = userInput` (потім користувач клікає)',
        '`setTimeout(userInput, 0)`',
        '`input.value = userInput`'
      ],
      answer: [0, 2, 3, 4],
      hint: 'Шукайте місця, де рядок парситься як HTML, інтерпретується як код або як URL, що може мати схему `javascript:`.',
      explanation: `
- **\`innerHTML\`**, **\`insertAdjacentHTML\`** — парсять рядок як HTML: \`<img src=x onerror=alert(1)>\` виконається.
- **\`link.href\`** — значення \`javascript:alert(1)\` виконається при кліку. Екранування HTML тут не допомагає — треба перевіряти протокол.
- **\`setTimeout(string)\`** — рядок виконується як код (аналог \`eval\`).

Безпечні:
- **\`textContent\`** — вставляє текстовий вузол, жоден HTML не парситься.
- **\`input.value\`** — просто значення поля; браузер не інтерпретує його як розмітку.
`
    },
    {
      id: 'sec-safe-html-template', group: 'xss', type: 'code', level: 2,
      title: 'Тег html`…`: автоекранування, як у React і lit',
      tags: ['xss', 'escaping', 'tagged-templates'],
      description: `
**Завдання.** Напишіть тег шаблонних рядків \`html\`, який автоматично екранує кожне підставлене значення, а «сирий» HTML пропускає лише з явним маркером довіри.

**Де трапляється:** так шаблонізатори й фреймворки захищають від XSS за замовчуванням: React, Vue і lit екранують \`{value}\`, а сирий HTML вимагає явного рішення — \`dangerouslySetInnerHTML\`, \`v-html\`, \`unsafeHTML\`. API, безпечне за замовчуванням, захищає навіть від забудькуватості.

**Що написати**
- \`escapeHtml\`, клас \`SafeHtml\` і \`trusted(markup)\` уже є;
- \`html(strings, ...values)\` → \`SafeHtml\`: статичні частини як є, а кожне значення:
  - \`null\`, \`undefined\`, \`false\` → порожній рядок (зручно для умов: \`\${isAdmin && trusted('<b>admin</b>')}\`);
  - \`SafeHtml\` (результат \`trusted\` або іншого \`html\`) → без екранування;
  - масив → кожен елемент за тими самими правилами, склеєно без роздільника;
  - решта (рядки, числа, зокрема \`0\`) → через \`escapeHtml\`.

**Приклад**
\`\`\`js
const name = '<img src=x onerror=alert(1)>';
String(html\`<p>Привіт, \${name}!</p>\`);
// '<p>Привіт, &lt;img src=x onerror=alert(1)&gt;!</p>'

String(html\`<ul>\${['a<b', 'c'].map((i) => html\`<li>\${i}</li>\`)}</ul>\`);
// '<ul><li>a&lt;b</li><li>c</li></ul>'

String(html\`<div>\${trusted('<b>ok</b>')}\${null}\${false}</div>\`); // '<div><b>ok</b></div>'
\`\`\`

**Як це працює:** тег отримує статичні частини (\`strings\`) і значення (\`values\`) **окремо**, тож розмітку автора від даних можна відрізнити без жодних регулярних виразів; \`strings\` завжди на один елемент довший за \`values\`. Екранування за замовчуванням плюс явний маркер довіри — принцип «безпечно за замовчуванням» (secure by default).

**Врахуйте:** результат — \`SafeHtml\`, щоб вкладений \`html\` не екранувався вдруге; \`String(результат)\` дає рядок через \`toString\`. Екранування захищає текст і атрибути в лапках, але не URL у \`href\` — про \`javascript:\` у квізі нижче.
`,
      starter: `// Готове: escapeHtml з модуля «Рядки»
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

// Маркер «цьому HTML довіряємо»
class SafeHtml {
  constructor(html) { this.__html = html; }
  toString() { return this.__html; }
}
function trusted(markup) { return new SafeHtml(String(markup)); }

function html(strings, ...values) {
  // strings — статичні частини (на одну більше, ніж values), values — підставлені значення.
  // 1. Почніть з strings[0]; для кожного values[i] додайте оброблене значення і strings[i + 1]
  // 2. Значення: null / undefined / false → ''; SafeHtml → як є;
  //    масив → кожен елемент за тими самими правилами, без роздільника; решта → escapeHtml
  // 3. Поверніть new SafeHtml(результат), щоб вкладений html\`…\` не екранувався вдруге
  // TODO
}

// Спробуйте в консолі:
// String(html\`<p>\${'<b>не жирний</b>'}</p>\`);
`,
      solution: `function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

class SafeHtml {
  constructor(html) { this.__html = html; }
  toString() { return this.__html; }
}
function trusted(markup) { return new SafeHtml(String(markup)); }

function toHtml(value) {
  if (value === null || value === undefined || value === false) return '';
  if (value instanceof SafeHtml) return value.__html;   // довірений HTML — як є
  if (Array.isArray(value)) return value.map(toHtml).join('');
  return escapeHtml(value);                             // усе інше — лише текст
}

function html(strings, ...values) {
  let out = strings[0];
  values.forEach((value, i) => {
    out += toHtml(value) + strings[i + 1];
  });
  return new SafeHtml(out);
}
`,
      hints: [
        '`strings` завжди на один елемент довший за `values`: почніть з `strings[0]`, далі додавайте пари «оброблене значення + наступна частина».',
        'Винесіть обробку одного значення в `toHtml(value)`: `null`/`undefined`/`false` → `\'\'`, `instanceof SafeHtml` → `value.__html`, масив → `value.map(toHtml).join(\'\')`, решта → `escapeHtml`.',
        'Повертайте `new SafeHtml(out)`, інакше вкладений `html` усередині іншого буде екрановано вдруге.'
      ],
      tests: [
        { name: 'значення екрануються, розмітка автора — ні', code: 'const name = "<img src=x onerror=alert(1)>";\nexpect(String(html`<p>Привіт, ${name}!</p>`)).toBe("<p>Привіт, &lt;img src=x onerror=alert(1)&gt;!</p>");' },
        { name: 'атрибут у лапках не вдається «закрити»', code: 'const t = `x" onmouseover="alert(1)`;\nexpect(String(html`<a title="${t}">ok</a>`)).toBe("<a title=\\"x&quot; onmouseover=&quot;alert(1)\\">ok</a>");' },
        { name: 'вкладені шаблони і масиви', code: 'const items = ["a<b", "c"];\nexpect(String(html`<ul>${items.map((i) => html`<li>${i}</li>`)}</ul>`)).toBe("<ul><li>a&lt;b</li><li>c</li></ul>");' },
        { name: 'trusted, null, undefined, false і 0', code: 'expect(String(html`<div>${trusted("<b>ok</b>")}${null}${undefined}${false}${0}</div>`)).toBe("<div><b>ok</b>0</div>");' },
        { name: 'результат — SafeHtml', code: 'const r = html`<i>${"x"}</i>`;\nexpect(r instanceof SafeHtml).toBe(true);\nexpect(`${r}`).toBe("<i>x</i>");\nexpect(String(html`${r}`)).toBe("<i>x</i>");\nexpect(String(html`<hr>`)).toBe("<hr>");' }
      ],
      explanation: `
Тег — звичайна функція, яку рушій викликає з масивом статичних частин і значеннями. Тому «що написав автор» і «що прийшло з даних» розділені самою мовою, і екранувати потрібно лише \`values\`. Так працює \`lit-html\`; JSX у React дає ту саму гарантію на рівні компілятора.

**Типові помилки:** екранувати весь результат (ламається розмітка автора); повертати рядок, а не маркер (вкладений шаблон екранується двічі: \`&amp;lt;\`); перетворювати \`0\` на порожній рядок через \`value || ''\`.

**Що спитають далі:** чому екранування не захищає \`href="\${url}"\` (потрібна перевірка схеми, див. \`isSafeUrl\`); навіщо Trusted Types, якщо є автоекранування; як санітизувати HTML від користувача (DOMPurify).
`
    },
    {
      id: 'sec-quiz-escape-context', group: "xss", why: ["Ні: екранування HTML не перевіряє схему URL.","Ні: payload не потребує script — працює javascript:-посилання.","Так: у href треба перевіряти схему (allowlist http/https).","Ні: javascript:-URL виконуються в усіх браузерах."],
      type: 'quiz',
      level: 3,
      title: 'Екранування не рятує в href',
      tags: ['xss', 'escaping', 'url'],
      question: `
Чи безпечний цей код, якщо \`userUrl\` контролює користувач, а \`escapeHtml\` коректно екранує \`& < > " '\`?

\`\`\`js
profile.innerHTML = \`<a href="\${escapeHtml(userUrl)}">Мій сайт</a>\`;
\`\`\`
`,
      options: [
        'Безпечний: усі спецсимволи HTML екрановано, вийти з атрибута неможливо',
        'Безпечний, бо `innerHTML` не виконує `<script>`',
        'Небезпечний: `javascript:alert(document.cookie)` не містить спецсимволів і виконається при кліку',
        'Небезпечний лише в Internet Explorer'
      ],
      answer: 2,
      hint: 'Подумайте не про вихід з атрибута, а про те, **що** браузер робить із вмістом `href`.',
      explanation: `
Екранування HTML захищає від **виходу з контексту** (закрити лапки, відкрити новий тег). Але в URL-контексті небезпечне саме **значення**: \`javascript:alert(document.cookie)\` не містить жодного з п'яти символів, тому проходить без змін і виконується при кліку. Так само небезпечні \`data:text/html,...\` у деяких контекстах.

- «Безпечний, бо спецсимволи екрановано» — типова помилка: контекст атрибута-URL потребує **валідації протоколу** (allowlist \`http:\`, \`https:\`, \`mailto:\`).
- «\`innerHTML\` не виконує \`<script>\`» — правда, але тут не \`<script>\`, а URL зі схемою \`javascript:\`.
- Це працює в усіх сучасних браузерах, не лише в IE. React з версії 16.9 попереджає про \`javascript:\`-URL саме з цієї причини.
`
    },
    {
      id: 'sec-safe-url', group: "xss",
      type: 'code',
      level: 3,
      title: 'isSafeUrl: блокувати javascript: і обхідні трюки',
      tags: ['xss', 'url', 'validation'],
      description: `
**Завдання.** Напишіть \`isSafeUrl(url)\` для перевірки посилань, які користувачі вставляють у профіль (\`<a href>\`).

**Де трапляється:** посилання в профілях, коментарях, markdown-редакторах.

Дозволені:
- абсолютні URL зі схемами \`http:\`, \`https:\`, \`mailto:\`, \`tel:\`;
- відносні URL: \`/path\`, \`page.html\`, \`#anchor\`, \`?q=1\`, \`//cdn.example.com/x\`.

Усе інше — заборонено (\`javascript:\`, \`data:\`, \`vbscript:\`, \`file:\`, …), **включно з обхідними трюками**, які браузер нормалізує:
- регістр: \`JaVaScRiPt:alert(1)\`;
- пробіли та керівні символи на початку: \`'  javascript:...'\`, \`'\\u0001javascript:...'\`;
- табуляції та переноси рядка всередині схеми: \`'java\\tscript:...'\`.

Не-рядки та URL, які неможливо розпарсити (\`'http://'\`), → \`false\`.

**Як це працює:** Не перевіряйте рядок регулярками: браузер ігнорує пробіли, регістр і табуляції в схемі. Розберіть адресу через new URL(url, база) і порівняйте protocol з білим списком (http:, https:, mailto:, tel:).
`,
      starter: `const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

function isSafeUrl(url) {
  // 1. Не рядок → false
  // 2. new URL(url, 'https://base.invalid/') — відносні адреси стануть https
  // 3. protocol у SAFE_PROTOCOLS → true; помилка розбору → false
  // TODO
  return !url.startsWith('javascript:');
}
`,
      solution: `const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

function isSafeUrl(url) {
  if (typeof url !== 'string') return false;
  try {
    // Парсер URL робить ту саму нормалізацію, що й браузер при кліку:
    // прибирає керівні символи та пробіли по краях, вирізає \\t \\n \\r, приводить схему до нижнього регістру.
    // Відносні URL розв'язуються відносно фіктивної https-бази і стають https:.
    const parsed = new URL(url, 'https://base.invalid/');
    return SAFE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}
`,
      hints: [
        'Чорні списки й регулярки на кшталт `/^javascript:/i` обходяться. Використайте **allowlist** протоколів.',
        'Нехай нормалізацію зробить сам парсер: `new URL(url, base)` поверне `protocol` у нижньому регістрі, прибравши пробіли, керівні символи, `\\t` і `\\n`.',
        'Для відносних URL передайте фіктивну базу `\'https://base.invalid/\'` — тоді вони отримають протокол `https:`. Обгорніть у `try/catch`.'
      ],
      tests: [
        { name: 'дозволяє http, https, mailto, tel', code: "['https://example.com', 'http://example.com/a?b=1', 'mailto:me@example.com', 'tel:+380441234567'].forEach((u) => expect(isSafeUrl(u)).toBe(true));" },
        { name: 'дозволяє відносні URL', code: "['/profile', 'docs/a.html', '#top', '?page=2', '//cdn.example.com/x.js'].forEach((u) => expect(isSafeUrl(u)).toBe(true));" },
        { name: 'блокує javascript: у різному регістрі', code: "expect(isSafeUrl('javascript:alert(1)')).toBe(false);\nexpect(isSafeUrl('JaVaScRiPt:alert(1)')).toBe(false);" },
        { name: 'блокує обхід пробілами, керівними символами, табами', code: "['  javascript:alert(1)', '\\u0001javascript:alert(1)', 'java\\tscript:alert(1)', 'java\\nscript:alert(1)', 'javascript\\r:alert(1)'].forEach((u) => expect(isSafeUrl(u)).toBe(false));" },
        { name: 'блокує data:, vbscript:, file:', code: "['data:text/html,<script>alert(1)</script>', 'vbscript:msgbox(1)', 'file:///etc/passwd'].forEach((u) => expect(isSafeUrl(u)).toBe(false));" },
        { name: 'невалідні значення та не-рядки', code: "expect(isSafeUrl('http://')).toBe(false);\nexpect(isSafeUrl(null)).toBe(false);\nexpect(isSafeUrl(undefined)).toBe(false);\nexpect(isSafeUrl(42)).toBe(false);" }
      ],
      explanation: `
**Головна ідея — парсити так само, як браузер**, і перевіряти результат за **allowlist**. Будь-яка ручна регулярка відстає від парсера: WHATWG URL Standard вирізає ASCII-табуляції й переноси рядка **будь-де** в URL і обрізає керівні символи та пробіли на краях, тож \`java\\tscript:\` для браузера — це \`javascript:\`. Складність O(n).

**Чому allowlist, а не blocklist:** схем багато (\`javascript:\`, \`data:\`, \`vbscript:\`, \`blob:\`, \`filesystem:\`, кастомні протоколи застосунків), і чорний список завжди щось пропустить.

**Ще один шар обходу:** якщо значення потрапляє в HTML **як розмітка** (а не через \`setAttribute\`), HTML-парсер спочатку декодує сутності: \`javascript&colon;alert(1)\` або \`&#106;avascript:\`. Тому перевіряйте URL **після** декодування або, краще, взагалі не збирайте HTML рядками.

**Типові помилки:** \`url.startsWith('http')\` (забороняє всі відносні URL і пропускає вигадані схеми на кшталт \`httpx:\`), \`/^javascript:/i\` (обхід пробілом або табом), перевірка до \`decodeURIComponent\`, а використання — після.

**Що можуть спитати далі:** чи безпечний \`//evil.com\` (з погляду XSS — так, з погляду open redirect — ні)? Як React обробляє \`javascript:\` у \`href\`? Чим допоможе CSP проти \`javascript:\`-URL (вони блокуються без \`'unsafe-inline'\`)?
`
    },
    {
      id: 'sec-sanitize-trusted-types', group: "xss", why: ["Ні: описано навпаки.","Ні: регулярками HTML не розібрати надійно — потрібен парсер (DOMPurify).","Ні: Trusted Types не шифрують, а забороняють сирі рядки в sinks.","Так: санітизація за allowlist + Trusted Types як гарантія на рівні браузера."],
      type: 'theory',
      level: 3,
      title: 'Escaping vs sanitizing, DOMPurify, Trusted Types',
      tags: ['xss', 'sanitizing', 'trusted-types'],
      question: 'Чим екранування відрізняється від санітизації? Як безпечно показати HTML, створений користувачем (rich text, markdown)? Що таке Trusted Types?',
      choices: [
        'Екранування видаляє небезпечні теги, а санітизація перетворює `<` і `>` на HTML-сутності',
        'Санітайзер можна надійно написати регулярними виразами, якщо врахувати регістр, кодування і вкладеність тегів',
        'Trusted Types шифрують HTML-рядки перед вставкою, тому перехоплений payload неможливо прочитати',
        'Санітизація лишає allowlist тегів/атрибутів (DOMPurify), а Trusted Types забороняють рядки в DOM-sinks'
      ],
      correct: 3,
      answer: `
**Екранування (escaping/encoding)** — перетворює дані так, щоб вони інтерпретувались як **текст** у конкретному контексті:
| Контекст | Кодування |
|---|---|
| HTML-текст, атрибут у лапках | \`& < > " '\` → сутності |
| URL-параметр | \`encodeURIComponent\` |
| JS-рядок у \`<script>\` | \`JSON.stringify\` + \`<\` → \`\\u003c\` |
| URL-атрибут (\`href\`, \`src\`) | **валідація протоколу** (екранування не допоможе) |
| CSS | по можливості не вставляти дані користувача взагалі |

Користувач побачить \`<b>\` як символи — розмітка не працює.

**Санітизація (sanitizing)** — коли HTML **потрібен** (редактор коментарів, markdown, листи): розібрати HTML, **залишити дозволене** (allowlist тегів і атрибутів), решту видалити.
\`\`\`js
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: ['b', 'i', 'a', 'p', 'ul', 'li', 'code'],
  ALLOWED_ATTR: ['href'],
});
container.innerHTML = clean;
\`\`\`
- **Не пишіть санітайзер регулярками** — HTML не є регулярною мовою; існують **mXSS** (mutation XSS): розмітка, яка після серіалізації та повторного парсингу змінює структуру. DOMPurify роками закриває такі обходи.
- Санітизуйте **на клієнті безпосередньо перед вставкою** (санітизація на сервері залежить від парсера сервера, який відрізняється від браузерного). Серверну теж можна мати як додатковий шар.
- Markdown: рендерте з вимкненим сирим HTML або санітизуйте **результат** рендерингу.
- Нативний **Sanitizer API** (\`element.setHTML(dirty)\`) поступово з'являється в браузерах — у майбутньому заміна бібліотекам.

**Trusted Types** — механізм браузера, що вмикається через CSP:
\`\`\`http
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types app-policy dompurify
\`\`\`
Після цього \`el.innerHTML = 'рядок'\`, \`eval\`, \`script.src = '...'\` **кидають TypeError**. Приймаються лише об'єкти \`TrustedHTML\`/\`TrustedScript\`/\`TrustedScriptURL\`, створені зареєстрованою політикою:
\`\`\`js
const policy = trustedTypes.createPolicy('app-policy', {
  createHTML: (input) => DOMPurify.sanitize(input),
});
el.innerHTML = policy.createHTML(userHtml);
\`\`\`
Переваги: DOM-XSS стає неможливим «випадково» — усі небезпечні місця зводяться до кількох політик, які легко аудитувати. Підтримка: давно в Chromium; інші рушії додавали її у 2025–2026 (перевіряйте таблицю сумісності), для решти є поліфіл. Впроваджують поступово через \`Content-Security-Policy-Report-Only\`.

**Фреймворки:** React/Vue/Angular екранують інтерполяцію автоматично. Небезпечні «аварійні люки»: \`dangerouslySetInnerHTML\`, \`v-html\`, \`[innerHTML]\` + \`bypassSecurityTrustHtml\` в Angular, \`href={userUrl}\`, рефи з прямою роботою з DOM.
`,
      keyPoints: [
        'Escaping — дані як текст, залежить від контексту (HTML, атрибут, URL, JS, CSS)',
        'Sanitizing — allowlist тегів/атрибутів, коли HTML потрібен',
        'DOMPurify замість саморобних регулярок; mXSS',
        'Санітизувати перед вставкою на клієнті; markdown — санітизувати результат',
        'Trusted Types: require-trusted-types-for через CSP, політики, sinks кидають помилку',
        'Аварійні люки фреймворків: dangerouslySetInnerHTML, v-html, bypassSecurityTrust'
      ],
      followUps: ['Що таке mutation XSS?', 'Як поступово впровадити Trusted Types у великий застосунок?', 'Чи достатньо санітизувати HTML на сервері під час збереження?']
    },
    {
      id: 'sec-sanitize-html', group: "xss",
      type: 'dom',
      level: 4,
      title: 'Санітайзер HTML з allowlist (DOMParser)',
      tags: ['xss', 'sanitizing', 'dom'],
      description: `
**Завдання.** Реалізуйте \`sanitizeHtml(dirty)\` → рядок безпечного HTML. Розбирайте вхід **справжнім HTML-парсером** (\`DOMParser\` або \`<template>\`), а не регулярками. Прев'ю в редакторі вже використовує вашу функцію.

**Де трапляється:** rich-text редактори, markdown, вставлений HTML від користувачів.

Правила:
1. **Дозволені теги:** \`b\`, \`i\`, \`em\`, \`strong\`, \`a\`, \`p\`, \`br\`, \`ul\`, \`ol\`, \`li\`, \`code\`, \`pre\`, \`blockquote\`.
2. **Видалити разом із вмістом:** \`script\`, \`style\`, \`iframe\`, \`object\`, \`embed\`, \`svg\`, \`math\`, \`template\`, \`noscript\`, \`textarea\`, \`title\`.
3. Будь-який **інший** тег — «розгорнути»: сам тег прибрати, а його (очищених) дітей залишити на місці (\`<div><span>текст</span></div>\` → \`текст\`).
4. Коментарі видалити.
5. **Атрибути:** усі видалити, крім \`href\` на \`<a>\`, і то лише якщо URL безпечний: протокол \`http:\`, \`https:\` або \`mailto:\` (відносні URL дозволені). Небезпечний \`href\` просто видаляється, посилання лишається.
6. Кожному \`<a>\` з \`href\` додайте \`rel="noopener noreferrer"\`.

\`\`\`js
sanitizeHtml('<p onclick="x()">Hi <a href="javascript:alert(1)">me</a><script>bad()</script></p>');
// '<p>Hi <a>me</a></p>'
\`\`\`

**Як це працює:** Розбираємо рядок справжнім HTML-парсером (template або DOMParser), обходимо дерево і лишаємо лише дозволені теги й атрибути, решту видаляємо; href перевіряємо на безпечну схему.
`,
      html: `<label>Введіть HTML:<br><textarea id="input" rows="5" cols="60"><p>Привіт, <b onclick="alert(1)">світ</b>!</p><img src=x onerror="alert(1)"></textarea></label>
<h3>Прев'ю</h3>
<div id="preview"></div>`,
      css: `#preview { border: 1px solid #ccc; padding: 8px; min-height: 40px; }`,
      js: `function sanitizeHtml(dirty) {
  // ваш код
  return dirty;
}

const editor = document.querySelector('#input');
const preview = document.querySelector('#preview');
function render() {
  preview.innerHTML = sanitizeHtml(editor.value);
}
editor.addEventListener('input', render);
render();
`,
      editable: ['js'],
      solution: {
        js: `const ALLOWED_TAGS = new Set(['B', 'I', 'EM', 'STRONG', 'A', 'P', 'BR', 'UL', 'OL', 'LI', 'CODE', 'PRE', 'BLOCKQUOTE']);
const DROP_WITH_CONTENT = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'TEMPLATE', 'NOSCRIPT', 'TEXTAREA', 'TITLE']);
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

function isSafeHref(value) {
  try {
    // фіксована база: відносні URL стають https:
    return SAFE_PROTOCOLS.has(new URL(value, 'https://base.invalid/').protocol);
  } catch {
    return false;
  }
}

function cleanChildren(parent) {
  // знімок списку: під час обходу ми видаляємо і переміщуємо вузли
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) continue;
    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.remove(); // коментарі, processing instructions
      continue;
    }
    const tag = node.tagName.toUpperCase(); // svg/math мають tagName у нижньому регістрі
    if (DROP_WITH_CONTENT.has(tag)) {
      node.remove();
      continue;
    }
    cleanChildren(node); // спочатку чистимо нащадків
    if (!ALLOWED_TAGS.has(tag)) {
      node.replaceWith(...node.childNodes); // розгортаємо: діти вже чисті
      continue;
    }
    for (const attr of Array.from(node.attributes)) {
      const keep = tag === 'A' && attr.name === 'href' && isSafeHref(attr.value);
      if (!keep) node.removeAttribute(attr.name);
    }
    if (tag === 'A' && node.hasAttribute('href')) node.setAttribute('rel', 'noopener noreferrer');
  }
}

function sanitizeHtml(dirty) {
  // DOMParser створює інертний документ: скрипти не виконуються, картинки не вантажаться
  const doc = new DOMParser().parseFromString(String(dirty ?? ''), 'text/html');
  cleanChildren(doc.body);
  return doc.body.innerHTML;
}

const editor = document.querySelector('#input');
const preview = document.querySelector('#preview');
function render() {
  preview.innerHTML = sanitizeHtml(editor.value);
}
editor.addEventListener('input', render);
render();
`
      },
      hints: [
        '`new DOMParser().parseFromString(dirty, \'text/html\')` дає інертний документ — у ньому безпечно ходити по `doc.body` і видаляти вузли. Результат — `doc.body.innerHTML`.',
        'Рекурсивно обходьте `Array.from(parent.childNodes)` (знімок!). Для кожного елемента: заборонений з вмістом → `remove()`; інакше спочатку почистіть дітей, а потім — якщо тег не в allowlist — `node.replaceWith(...node.childNodes)`.',
        'Атрибути перебирайте через `Array.from(node.attributes)` і видаляйте все, крім безпечного `href` на `A`. Безпечність перевіряйте через `new URL(value, \'https://base.invalid/\').protocol`.'
      ],
      tests: [
        { name: 'дозволені теги лишаються, атрибути зникають', code: "expect(sanitizeHtml('<p class=\"x\" onclick=\"x()\">Hi <b style=\"color:red\">there</b><br></p>')).toBe('<p>Hi <b>there</b><br></p>');" },
        { name: 'script/style/iframe/svg видаляються разом із вмістом', code: "expect(sanitizeHtml('a<script>alert(1)</script>b<style>*{}</style>c<iframe src=\"https://evil.com\"></iframe>d')).toBe('abcd');\nexpect(sanitizeHtml('<p>x<svg><script>alert(1)</script></svg>y</p>')).toBe('<p>xy</p>');" },
        { name: 'невідомі теги розгортаються, текст зберігається', code: "expect(sanitizeHtml('<div><span>текст</span> і <u>ще</u></div>')).toBe('текст і ще');\nexpect(sanitizeHtml('<img src=x onerror=\"alert(1)\">ok')).toBe('ok');\nexpect(sanitizeHtml('<div><i onmouseover=\"x()\">курсив</i></div>')).toBe('<i>курсив</i>');" },
        { name: 'href: небезпечні видаляються, безпечні отримують rel', code: "expect(sanitizeHtml('<a href=\"javascript:alert(1)\">x</a>')).toBe('<a>x</a>');\nexpect(sanitizeHtml('<a href=\" JaVaScRiPt:alert(1)\">x</a>')).toBe('<a>x</a>');\nexpect(sanitizeHtml('<a href=\"https://example.com\" target=\"_blank\" onclick=\"x()\">x</a>')).toBe('<a href=\"https://example.com\" rel=\"noopener noreferrer\">x</a>');\nexpect(sanitizeHtml('<a href=\"/docs\">d</a>')).toBe('<a href=\"/docs\" rel=\"noopener noreferrer\">d</a>');" },
        { name: 'коментарі видаляються, екранований текст лишається текстом', code: "expect(sanitizeHtml('<!-- secret --><em>a</em>')).toBe('<em>a</em>');\nexpect(sanitizeHtml('&lt;script&gt;alert(1)&lt;/script&gt;')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');" },
        { name: 'результат не виконує обробники після вставки', code: "window.__xss = 0;\nconst box = document.createElement('div');\nbox.innerHTML = sanitizeHtml('<b onclick=\"window.__xss++\">click</b><img src=\"x\" onerror=\"window.__xss++\">');\ndocument.body.append(box);\nclick(box.querySelector('b'));\nawait nextFrame();\nawait sleep(30);\nexpect(window.__xss).toBe(0);\nbox.remove();" },
        { name: 'прев\'ю використовує санітайзер', code: "input('#input', '<p>ok<script>window.__bad = 1</script><a href=\"javascript:x\">l</a></p>');\nexpect($('#preview').innerHTML).toBe('<p>ok<a>l</a></p>');" }
      ],
      explanation: `
**Чому парсер, а не регулярки:** HTML-парсер браузера має сотні правил (незакриті теги, атрибути без лапок, \`<svg>\`/\`<math>\` з іншими правилами парсингу, сутності). Регулярка бачить рядок інакше, ніж браузер, — і ця різниця і є вразливістю. \`DOMParser\` створює **інертний** документ: \`<img onerror>\` не спрацює, скрипти не виконаються, ресурси не завантажаться.

**Порядок обходу важливий:** спершу очищуємо дітей, потім розгортаємо батька — переміщені діти вже безпечні. Обхід знімка \`Array.from(childNodes)\`, бо живий \`NodeList\` змінюється під час видалення. Складність — O(n) від кількості вузлів і атрибутів.

**Allowlist, а не blocklist:** заборонити \`on*\`-атрибути недостатньо (\`style\` з \`url()\`, \`formaction\`, \`srcdoc\`, \`xlink:href\` у SVG…). Безпечніше дозволити мінімум.

**Чого ця реалізація не робить (і чому в проді — DOMPurify):**
- **mXSS** — серіалізація \`innerHTML\` і повторний парсинг можуть дати іншу структуру (особливо з \`<svg>\`, \`<math>\`, \`<noscript>\`, \`<table>\`). Ми вирізаємо найризикованіші контейнери, але DOMPurify містить роки фіксів таких обходів.
- **DOM clobbering** — \`id\`/\`name\` можуть перекрити глобальні змінні (\`<a id="config">\`); ми видаляємо всі атрибути, тож тут це закрито.
- Ще один крок захисту: вставляти результат не рядком, а самим очищеним фрагментом (\`importNode\`), щоб уникнути повторного парсингу. Нативний \`element.setHTML()\` (Sanitizer API) робить саме так.

**Що можуть спитати далі:** що таке mXSS і DOM clobbering? Чому не можна просто видалити \`<script>\`? Як санітизувати HTML у Node.js (немає DOM — jsdom/linkedom + DOMPurify)? Як Trusted Types змусить команду проганяти весь HTML через санітайзер?
`
    },
    // ---------------------------------------------------------------- CSP
    {
      id: 'sec-csp', group: "csp", why: ["Так: nonce одноразовий, hash — для незмінних inline-скриптів.","Так: strict-dynamic передає довіру завантаженим скриптам.","Ні: frame-ancestors у meta ігнорується — лише заголовок.","Ні: unsafe-inline зводить захист від XSS нанівець.","Ні: Report-Only — спосіб безпечно знайти порушення до вмикання."],
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Content-Security-Policy',
      tags: ['csp', 'xss'],
      question: 'Що таке Content-Security-Policy? Які директиви найважливіші? Чим nonce відрізняється від hash, що таке strict-dynamic і як впровадити CSP в існуючий проєкт, нічого не зламавши? Оберіть **усі** правильні твердження.',
      choices: [
        'Nonce має бути новим для кожної відповіді, а hash підходить для статичних inline-скриптів',
        '`\'strict-dynamic\'` дозволяє скриптам з валідним nonce підвантажувати інші скрипти без allowlist доменів',
        '`frame-ancestors` однаково працює і в HTTP-заголовку, і в тегу `<meta http-equiv>`',
        'Додати `\'unsafe-inline\'` у `script-src` безпечно, якщо поруч вказано `\'self\'`',
        'CSP одразу вмикають у режимі enforcing, бо `Report-Only` не дає жодної корисної інформації'
      ],
      correct: [0, 1],
      hint: 'CSP — другий рубіж оборони: що він робить, якщо XSS-ін\'єкція вже сталася?',
      answer: `
**CSP** — HTTP-заголовок, яким сервер каже браузеру, **звідки** можна завантажувати й виконувати ресурси. Це **defense in depth**: навіть якщо зловмисник вставив розмітку, браузер не виконає неавторизований скрипт.

\`\`\`http
Content-Security-Policy:
  default-src 'self';
  script-src 'nonce-4AEemGb0xJptoIGFP3Nd' 'strict-dynamic';
  style-src 'self' 'nonce-4AEemGb0xJptoIGFP3Nd';
  img-src 'self' data: https://cdn.example.com;
  connect-src 'self' https://api.example.com;
  object-src 'none';
  base-uri 'none';
  frame-ancestors 'none';
  form-action 'self';
  upgrade-insecure-requests;
  report-to csp-endpoint
\`\`\`

**Ключові директиви:**
- \`default-src\` — fallback для всіх \`*-src\`, які не вказані.
- \`script-src\` — найважливіша. За замовчуванням CSP **забороняє inline-скрипти** (\`<script>...</script>\`, \`onclick=""\`, \`javascript:\`-URL) і \`eval\`. Дозволяти їх через \`'unsafe-inline'\`/\`'unsafe-eval'\` — значить звести захист нанівець.
- \`object-src 'none'\` (плагіни), \`base-uri 'none'\` (інакше ін'єкція \`<base href>\` перенаправить усі відносні скрипти).
- \`frame-ancestors\` — хто може вбудувати вашу сторінку в iframe (захист від clickjacking; заміна \`X-Frame-Options\`). **Не працює** в \`<meta>\`-тегу.
- \`connect-src\` (fetch/XHR/WebSocket), \`img-src\`, \`style-src\`, \`font-src\`, \`frame-src\`, \`worker-src\`, \`form-action\`.
- \`upgrade-insecure-requests\` — автоматично переписує \`http://\` ресурси на \`https://\`.

**Nonce vs hash:**
- **Nonce** — випадкове значення (≥128 біт), **нове для кожної відповіді**: \`<script nonce="4AEem...">\`. Зловмисник його не знає, тож ін'єкція без nonce не виконається. Потребує серверного рендерингу HTML (або edge-функції). Кешувати HTML з nonce на CDN не можна.
- **Hash** — \`'sha256-<base64>'\` від вмісту конкретного inline-скрипта. Підходить для статичного HTML (SSG/SPA) — будь-яка зміна скрипта вимагає перерахунку.

**\`'strict-dynamic'\`** — довіра **передається**: скрипт з валідним nonce/hash може динамічно створювати інші скрипти (\`document.createElement('script')\`), і вони теж виконаються. При цьому host-allowlist і \`'self'\` ігноруються в браузерах, що підтримують CSP3. Так працюють бандлери з lazy-чанками і сторонні завантажувачі (аналітика), без нескінченних списків доменів. Allowlist-політики на зразок \`script-src https://cdn.jsdelivr.net\` дослідження Google визнали обхідними (JSONP-ендпоінти, старі версії бібліотек на тих самих CDN).

**Рекомендована «strict CSP»:** \`script-src 'nonce-{random}' 'strict-dynamic' https: 'unsafe-inline'; object-src 'none'; base-uri 'none';\` — \`https:\` і \`'unsafe-inline'\` тут лише fallback для старих браузерів; сучасні їх ігнорують, бо є nonce/strict-dynamic.

**Впровадження без поломок:**
1. \`Content-Security-Policy-Report-Only\` — браузер **лише звітує** про порушення (\`report-to\`/\`report-uri\`), нічого не блокуючи.
2. Збір звітів, позбавлення від inline-обробників (\`onclick\` → \`addEventListener\`), \`eval\`, \`javascript:\`-посилань.
3. Перемикання на enforcing-заголовок; можна тримати обидва одночасно (суворіший у report-only).

**Обмеження:** CSP не захищає від логічних вразливостей, від ін'єкції в довірений скрипт (DOM XSS через \`innerHTML\` у вашому ж коді — тут допомагають Trusted Types), і погано налаштована політика дає хибне відчуття безпеки.
`,
      keyPoints: [
        'CSP — allowlist джерел ресурсів; другий рубіж проти XSS',
        'script-src блокує inline і eval за замовчуванням; unsafe-inline/unsafe-eval руйнують захист',
        'Nonce (новий на кожну відповідь) vs hash (для статичних скриптів)',
        'strict-dynamic передає довіру динамічно створеним скриптам; allowlist доменів обхідний',
        'object-src none, base-uri none, frame-ancestors (не працює в meta)',
        'Впровадження через Report-Only і звіти'
      ],
      followUps: ['Чому nonce має бути новим для кожної відповіді?', 'Як застосувати CSP до SPA, яка роздається як статика з CDN?', 'Чим CSP допоможе проти clickjacking?', 'Чому allowlist CDN-доменів у script-src небезпечний?']
    },
    {
      id: 'sec-build-csp', group: "csp",
      type: 'code',
      level: 2,
      title: 'buildCsp: зібрати заголовок з об\'єкта',
      tags: ['csp'],
      description: `
**Завдання.** Напишіть \`buildCsp(policy)\`, що перетворює об'єкт на значення заголовка \`Content-Security-Policy\`.

**Де трапляється:** налаштування заголовків безпеки на сервері або у фреймворку.

- Директиви йдуть у порядку ключів об'єкта, розділені \`'; '\`.
- Значення-масив → джерела через пробіл, **дублікати видаляються** (після нормалізації). Значення-рядок — як одне джерело.
- Порожній масив → \`'none'\` (\`frame-ancestors: []\` → \`frame-ancestors 'none'\`).
- \`true\` → директива без значення (\`upgrade-insecure-requests\`); \`false\`, \`null\`, \`undefined\` → директива пропускається.
- **Автолапки для ключових слів** (класична помилка — \`self\` без лапок означає хост з ім'ям «self»): якщо джерело без лапок і це \`self\`, \`none\`, \`unsafe-inline\`, \`unsafe-eval\`, \`unsafe-hashes\`, \`strict-dynamic\`, \`report-sample\`, \`wasm-unsafe-eval\`, або \`nonce-…\` / \`sha256-…\` / \`sha384-…\` / \`sha512-…\` — обгорніть в одинарні лапки. Джерела, що вже в лапках, і хости/схеми (\`https://cdn.x\`, \`data:\`, \`*.example.com\`) не змінюються.
- **Захист від ін'єкції:** якщо джерело містить \`;\`, \`,\` або пробільний символ — \`throw new Error(...)\`.

\`\`\`js
buildCsp({ 'default-src': ['self'], 'script-src': ["'self'", 'nonce-abc123'], 'upgrade-insecure-requests': true });
// "default-src 'self'; script-src 'self' 'nonce-abc123'; upgrade-insecure-requests"
\`\`\`

**Як це працює:** Об'єкт → рядок 'директива джерела; директива джерела'. Ключові слова (self, none, nonce-…) мають бути в одинарних лапках, хости — без. Значення з ; , або пробілами відкидаємо — інакше в заголовок можна впровадити зайву директиву.
`,
      starter: `// План:
// 1. Пройти по ключах policy у порядку об'єкта
// 2. Значення-рядок або масив → список джерел; ключові слова (self, none, nonce-…) обгорнути в одинарні лапки
// 3. Джерело з ; , або пробілом → кинути помилку
// 4. Склеїти 'директива джерела' через '; '

function buildCsp(policy) {
  // TODO
  return Object.entries(policy)
    .map(([directive, sources]) => directive + ' ' + [].concat(sources).join(' '))
    .join('; ');
}
`,
      solution: `const KEYWORD_RE = /^(self|none|unsafe-inline|unsafe-eval|unsafe-hashes|strict-dynamic|report-sample|wasm-unsafe-eval|(?:nonce|sha256|sha384|sha512)-[A-Za-z0-9+/_=-]+)$/;

function formatSource(source) {
  const s = String(source).trim();
  // ; розділяє директиви, , розділяє політики — їх поява = спроба ін'єкції
  if (!s || /[;,\\s]/.test(s)) throw new Error('Invalid CSP source: ' + JSON.stringify(source));
  if (s.length >= 2 && s.startsWith("'") && s.endsWith("'")) return s;
  return KEYWORD_RE.test(s) ? "'" + s + "'" : s;
}

function buildCsp(policy) {
  const parts = [];
  for (const [directive, value] of Object.entries(policy)) {
    if (value === true) {
      parts.push(directive);
      continue;
    }
    if (value === false || value === null || value === undefined) continue;

    const list = Array.isArray(value) ? value : [value];
    const sources = [...new Set(list.map(formatSource))]; // дедуплікація після нормалізації
    parts.push(directive + ' ' + (sources.length ? sources.join(' ') : "'none'"));
  }
  return parts.join('; ');
}
`,
      hints: [
        'Пройдіть `Object.entries(policy)`: окремо обробіть `true`, «порожні» значення та масив/рядок. Порожній масив → `\'none\'`.',
        'Винесіть нормалізацію одного джерела у функцію `formatSource`: перевірка на `;`, `,`, пробіли → ключове слово без лапок → додати лапки.',
        'Дедуплікацію робіть **після** нормалізації (`[...new Set(list.map(formatSource))]`), щоб `self` і `\'self\'` вважались однаковими.'
      ],
      tests: [
        { name: 'базова політика', code: "expect(buildCsp({ 'default-src': [\"'self'\"], 'img-src': [\"'self'\", 'https://cdn.example.com', 'data:'] })).toBe(\"default-src 'self'; img-src 'self' https://cdn.example.com data:\");" },
        { name: 'автолапки для ключових слів, nonce і hash', code: "expect(buildCsp({ 'script-src': ['self', 'nonce-r4nd0m', 'strict-dynamic', 'sha256-abc+/def='], 'object-src': ['none'] })).toBe(\"script-src 'self' 'nonce-r4nd0m' 'strict-dynamic' 'sha256-abc+/def='; object-src 'none'\");" },
        { name: 'true, false, null і рядкові значення', code: "expect(buildCsp({ 'upgrade-insecure-requests': true, 'block-all-mixed-content': false, 'report-to': null, 'sandbox': undefined, 'base-uri': \"'self'\", 'report-uri': '/csp-report' })).toBe(\"upgrade-insecure-requests; base-uri 'self'; report-uri /csp-report\");" },
        { name: 'порожній масив → none, дублікати прибрано', code: "expect(buildCsp({ 'frame-ancestors': [], 'connect-src': [\"'self'\", 'self', 'https://api.test', 'https://api.test'] })).toBe(\"frame-ancestors 'none'; connect-src 'self' https://api.test\");" },
        { name: 'хости з wildcard не беруться в лапки', code: "expect(buildCsp({ 'img-src': ['*.example.com', 'https:', 'blob:'] })).toBe('img-src *.example.com https: blob:');" },
        { name: 'ін\'єкція через ; , або пробіл — помилка', code: "expect(() => buildCsp({ 'script-src': [\"'self'; script-src *\"] })).toThrow();\nexpect(() => buildCsp({ 'img-src': ['a.com,b.com'] })).toThrow();\nexpect(() => buildCsp({ 'img-src': ['a.com b.com'] })).toThrow();" },
        { name: 'порожня політика', code: "expect(buildCsp({})).toBe('');" }
      ],
      explanation: `
Генерація CSP з об'єкта — типова задача в middleware (Express/Helmet, Next.js \`middleware.ts\`), де nonce підставляється для кожного запиту. Складність O(d × s) від кількості директив і джерел.

**Чому автолапки важливі:** у CSP \`self\` без лапок — це **хост** з ім'ям \`self\`, а не ключове слово; політика мовчки стане суворішою або дірявою. Так само \`nonce-...\` без лапок не працює.

**Чому перевірка \`;\` і \`,\`:** якщо частина політики будується з даних (наприклад, домени клієнтів у multi-tenant SaaS), ін'єкція \`; script-src *\` дописала б нову директиву. \`,\` у заголовку розділяє **кілька політик**.

**Нюанси CSP, які варто знати:** при повторі директиви браузер використовує **першу**; кілька заголовків CSP **поєднуються** (ресурс має пройти всі — політики можуть лише посилюватись); \`'none'\` разом з іншими джерелами ігнорується.

**Що можуть спитати далі:** як генерувати nonce (\`crypto.randomBytes(16).toString('base64')\` на сервері) і чому не можна кешувати такий HTML? Як порахувати hash inline-скрипта? Чим \`report-to\` відрізняється від \`report-uri\`?
`
    },
    {
      id: 'sec-quiz-csp-nonce', group: "csp", why: ["Так: має правильний nonce.","Ні: без nonce inline-скрипт заблоковано (unsafe-inline ігнорується за наявності nonce).","Так: strict-dynamic дозволяє скрипти, створені довіреним скриптом.","Ні: з strict-dynamic allowlist https: ігнорується, без nonce — блок.","Ні: inline-обробники в атрибутах заблоковані."],
      type: 'quiz',
      level: 4,
      title: 'CSP з nonce і strict-dynamic',
      tags: ['csp'],
      question: `
Сторінка віддається з політикою (сучасний браузер з підтримкою CSP3):

\`\`\`http
Content-Security-Policy: script-src 'nonce-r4nd' 'strict-dynamic' https: 'unsafe-inline'; object-src 'none'
\`\`\`

Оберіть **усі** скрипти, які виконаються:
`,
      options: [
        '`<script nonce="r4nd">init()</script>`',
        '`<script>alert(1)</script>` (ін\'єкція без nonce)',
        'Скрипт, який створив `init()` через `document.createElement(\'script\')` з `src="https://cdn.example.com/chunk.js"`',
        '`<script src="https://cdn.example.com/lib.js"></script>` у розмітці без nonce',
        '`<button onclick="steal()">` — обробник в атрибуті'
      ],
      answer: [0, 2],
      hint: 'Коли в політиці є nonce або strict-dynamic, сучасний браузер ігнорує частину джерел. Які саме?',
      explanation: `
- **Inline-скрипт з правильним nonce** — виконається.
- **Динамічно створений скрипт** — виконається завдяки \`'strict-dynamic'\`: довіра передається від скрипта з nonce до скриптів, які він вставляє через \`createElement\` + \`appendChild\` (але не через \`document.write\`/\`innerHTML\`).

Не виконаються:
- **Inline без nonce** — \`'unsafe-inline'\` **ігнорується**, якщо в політиці є nonce або hash (він тут лише як fallback для дуже старих браузерів).
- **\`<script src>\` у розмітці без nonce** — з \`'strict-dynamic'\` host-джерела й схеми (\`https:\`) ігноруються; «parser-inserted» скрипти повинні мати nonce/hash.
- **Inline-обробники подій** (\`onclick\`) — блокуються; для них потрібен \`'unsafe-hashes'\` з хешем, що також не рекомендується.
`
    },
    // ---------------------------------------------------------------- Cookies, CSRF, clickjacking
    {
      id: 'sec-cookie-flags', group: "cookies-csrf", why: ["Ні: same-site рахується за доменом верхнього рівня — піддомени «свої».","Ні: Path не межа безпеки — JS того ж origin обійде його.","Так: HttpOnly, Secure і префікс __Host- — база безпечної сесійної cookie.","Ні: Domain навпаки розширює cookie на всі піддомени."],
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Атрибути cookies: HttpOnly, Secure, SameSite, префікси',
      tags: ['cookies'],
      question: 'Які атрибути cookie ви знаєте і від чого кожен захищає? Що таке префікси __Host- і __Secure-? Як має виглядати cookie сесії?',
      choices: [
        '`SameSite` захищає і від атак із сусіднього піддомену, бо `app.example.com` і `evil.example.com` — різні сайти',
        '`Path=/admin` — надійна межа безпеки: скрипти з інших шляхів того ж origin не прочитають цю cookie',
        '`HttpOnly` ховає cookie від JS, `Secure` — лише HTTPS, а `__Host-` вимагає `Secure`, `Path=/` і без `Domain`',
        '`Domain=example.com` звужує доступ до cookie лише до кореневого домену, без жодних піддоменів'
      ],
      correct: 2,
      answer: `
\`\`\`http
Set-Cookie: __Host-session=9f8a...; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=86400
\`\`\`

| Атрибут | Що робить | Від чого захищає |
|---|---|---|
| \`HttpOnly\` | cookie недоступна через \`document.cookie\` | крадіжка сесії при XSS |
| \`Secure\` | лише по HTTPS | перехоплення в незашифрованому каналі |
| \`SameSite=Strict\` | не надсилається в жодних cross-site запитах | CSRF (максимально), але ламає вхід за посиланням з іншого сайту |
| \`SameSite=Lax\` | надсилається лише при top-level навігації безпечним методом (клік по посиланню, GET) | CSRF через POST-форми, img, fetch, iframe |
| \`SameSite=None\` | надсилається завжди, **вимагає \`Secure\`** | — (потрібно для крос-сайт віджетів, SSO) |
| \`Domain\` | без нього — лише точний хост; з \`Domain=example.com\` — і всі піддомени | (розширює доступ — обережно) |
| \`Path\` | обмежує шлях (**не** є межею безпеки) | — |
| \`Expires\`/\`Max-Age\` | без них — сесійна cookie (до закриття браузера) | — |
| \`Partitioned\` | CHIPS: окреме сховище для кожного top-level сайту | трекінг; дозволяє вбудованим віджетам мати cookies |

**SameSite за замовчуванням:** Chrome/Edge трактують cookie без \`SameSite\` як \`Lax\` (з тимчасовим винятком для POST у перші 2 хвилини після встановлення). Інші браузери так не роблять, тому **завжди вказуйте SameSite явно**.

**Same-site ≠ same-origin:** «сайт» — це схема + eTLD+1 (\`https://example.com\`). \`app.example.com\` і \`evil.example.com\` — **same-site**, тож SameSite не захищає від атаки з сусіднього піддомену (наприклад, захопленого через забутий DNS-запис).

**Префікси** (браузер примусово перевіряє):
- \`__Secure-\` — cookie має бути \`Secure\` і встановлена з HTTPS.
- \`__Host-\` — \`Secure\`, \`Path=/\`, **без \`Domain\`** → прив'язана до точного хоста; піддомен не може її перезаписати (захист від **cookie tossing**).

**Інше важливе:**
- Ліміт ~4 КБ на cookie; усі cookies домену їдуть у **кожному** запиті (зайві байти, у тому числі до статики — тому статику роздають з окремого домену без cookies).
- Не зберігайте в cookie чутливі дані у відкритому вигляді — лише непрозорий ідентифікатор або підписане/зашифроване значення.
- Сучасний асинхронний API: \`cookieStore.get/set\` (Chromium).

**Ідеальна сесійна cookie:** \`__Host-\` + \`Secure\` + \`HttpOnly\` + \`SameSite=Lax\` (або \`Strict\`) + розумний термін + ротація id після логіну (захист від session fixation).
`,
      keyPoints: [
        'HttpOnly — недоступна з JS; Secure — лише HTTPS',
        'SameSite Strict / Lax / None (None вимагає Secure); Lax за замовчуванням у Chromium',
        'Same-site (eTLD+1) ≠ same-origin: сусідні піддомени — same-site',
        '__Host- (Secure, Path=/, без Domain) і __Secure- префікси',
        'Domain розширює доступ; Path не є межею безпеки; ротація id після логіну'
      ],
      followUps: ['Чому HttpOnly не захищає від CSRF?', 'Що таке cookie tossing?', 'Чому статику віддають з окремого домену без cookies?']
    },
    {
      id: 'sec-quiz-httponly', group: "cookies-csrf", why: ["Ні: це робить Secure.","Ні: від CSRF захищають SameSite і токени.","Так: JS не бачить cookie — її не вкрасти через XSS.","Ні: HttpOnly не обмежує, куди надсилається cookie."],
      type: 'quiz',
      level: 1,
      title: 'Від чого захищає HttpOnly',
      tags: ['cookies', 'xss'],
      question: 'Від чого захищає атрибут `HttpOnly` у cookie?',
      options: [
        'Від передачі cookie по незашифрованому HTTP, зокрема в публічних Wi-Fi мережах',
        'Від CSRF-атак, коли чужий сайт надсилає запит із cookie користувача',
        'Від доступу до cookie з JavaScript (`document.cookie`), зокрема при XSS',
        'Від надсилання cookie на піддомени та інші сайти через `fetch`'
      ],
      answer: 2,
      hint: 'Назва вводить в оману: «Only HTTP» — тобто лише для HTTP-запитів, а не для…',
      explanation: `
\`HttpOnly\` ховає cookie від JavaScript: \`document.cookie\` її не покаже, тож XSS-скрипт не зможе **викрасти** сесію і використати її з іншої машини. (Але він усе ще може робити запити від імені користувача з тієї ж сторінки — тому HttpOnly не скасовує потреби боротися з XSS.)

- Незашифрований HTTP — це про \`Secure\`.
- CSRF — про \`SameSite\` і CSRF-токени: браузер сам прикріплює HttpOnly-cookie до запиту, тож від CSRF вона не рятує.
- Піддомени — це \`Domain\` (і префікс \`__Host-\`).
`
    },
    {
      id: 'sec-csrf', group: "cookies-csrf", why: ["Ні: CORS обмежує читання відповіді, простий запит усе одно піде.","Так: браузер сам додає cookies — на цьому й тримається атака.","Ні: Bearer додає ваш JS, чужий сайт його не має.","Так: токен у формі/заголовку чужий сайт не прочитає.","Так: Origin/Sec-Fetch-Site дешево відсікають крос-сайтові запити."],
      type: 'theory',
      level: 2,
      interview: true,
      title: 'CSRF: як працює і як захиститися',
      tags: ['csrf', 'cookies'],
      question: 'Що таке CSRF? За яких умов атака можлива? Які способи захисту існують і які з них достатні в 2025–2026? Оберіть **усі** правильні твердження.',
      choices: [
        'CORS захищає від CSRF: без `Access-Control-Allow-Origin` браузер не відправить запит на сервер',
        'Атака можлива, коли автентифікація йде через cookies, які браузер додає до запиту автоматично',
        'API, де JS явно додає `Authorization: Bearer`, вразливе до CSRF так само, як і cookie-сесії',
        'CSRF-токен, прив\'язаний до сесії, працює, бо чужий сайт не може його прочитати через SOP',
        'Перевірка `Origin` або `Sec-Fetch-Site: cross-site` дозволяє відхиляти крос-сайтові state-changing запити'
      ],
      correct: [1, 3, 4],
      hint: 'Ключ — браузер автоматично прикріплює cookies до запитів на ваш домен, навіть якщо запит ініціював інший сайт.',
      answer: `
**CSRF (Cross-Site Request Forgery)** — зловмисний сайт змушує браузер жертви надіслати запит на ваш сайт. Браузер **автоматично додає cookies** жертви, і сервер вважає запит легітимним.

\`\`\`html
<!-- на evil.com -->
<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="10000">
</form>
<script>document.forms[0].submit()</script>
\`\`\`
Зловмисник **не бачить** відповіді (SOP), але йому це й не потрібно — гроші вже переказано.

**Умови атаки:**
1. Автентифікація через те, що браузер додає сам: **cookies**, HTTP Basic, клієнтські сертифікати. (API з \`Authorization: Bearer\`, який додає JS, CSRF не вразливий.)
2. Дія змінює стан і її параметри передбачувані.
3. Запит можна відтворити без preflight: форма (GET/POST з \`form-urlencoded\`/\`multipart\`/\`text/plain\`), \`<img src>\` для GET.

**Захист (зазвичай комбінують):**
- **\`SameSite=Lax\` або \`Strict\`** — cookie не надсилається в cross-site POST, img, fetch, iframe. Сильний базовий захист, але: не покриває атаки з **сусіднього піддомену** (same-site), GET-запити зі зміною стану при Lax, старі браузери.
- **CSRF-токен (synchronizer token)** — випадковий токен, прив'язаний до сесії, у прихованому полі форми або заголовку \`X-CSRF-Token\`; сервер звіряє. Зловмисник не може його прочитати (SOP).
- **Double-submit cookie** — токен і в cookie, і в заголовку/полі; сервер перевіряє збіг. Наївна версія вразлива до перезапису cookie з піддомену → використовують **підписаний** (HMAC, прив'язаний до сесії) токен і префікс \`__Host-\`.
- **Перевірка \`Origin\`** (і \`Referer\` як fallback) для state-changing запитів: \`Origin\` має бути з allowlist.
- **Fetch Metadata**: відхиляти запити з \`Sec-Fetch-Site: cross-site\` (крім навігацій) — простий і надійний серверний фільтр.
- **Кастомний заголовок / JSON-only API**: вимога \`Content-Type: application/json\` або \`X-Requested-With\` змушує крос-доменний запит проходити **preflight**, який сервер не дозволить. Працює, лише якщо CORS налаштовано суворо і сервер **відхиляє** інші Content-Type.
- **Не змінювати стан у GET**; повторна автентифікація для критичних дій (зміна пароля, платіж).

**Login CSRF** — зловмисник логінить жертву у **свій** акаунт (жертва потім вводить свої дані/картку в акаунт зловмисника). Захист — CSRF-токен і на формі входу.

**Пастка:** CORS **не** захищає від CSRF — простий запит відправляється і виконується, CORS лише забороняє читати відповідь.
`,
      keyPoints: [
        'Механізм: браузер автоматично прикріплює cookies до запиту, ініційованого чужим сайтом',
        'Умови: cookie-автентифікація, передбачувані параметри, запит без preflight',
        'SameSite Lax/Strict і його обмеження (same-site піддомени, GET)',
        'CSRF-токени: synchronizer і підписаний double-submit',
        'Перевірка Origin / Sec-Fetch-Site, JSON-only API з preflight',
        'CORS не захищає від CSRF; GET не має змінювати стан'
      ],
      followUps: ['Чи вразливий до CSRF API з токеном у localStorage?', 'Чим небезпечний наївний double-submit cookie?', 'Що таке login CSRF?']
    },
    {
      id: 'sec-quiz-samesite', group: "cookies-csrf", why: ["Так: Lax надсилає cookie при top-level GET-навігації.","Ні: крос-сайтовий POST з Lax іде без cookie.","Ні: субресурси з чужого сайту — без cookie.","Ні: fetch з чужого сайту — без Lax-cookie.","Так: це top-level навігація GET."],
      type: 'quiz',
      level: 3,
      title: 'SameSite=Lax: коли cookie надсилається',
      tags: ['cookies', 'csrf'],
      question: 'Сесійна cookie сайту `bank.com` має `SameSite=Lax`. Користувач перебуває на `evil.com`. Оберіть **усі** випадки, коли браузер **надішле** цю cookie на `bank.com`:',
      options: [
        'Користувач клікає посилання `<a href="https://bank.com/account">`',
        'Сторінка автоматично відправляє `<form method="POST" action="https://bank.com/transfer">`',
        '`<img src="https://bank.com/transfer?to=evil&amount=100">`',
        '`fetch(\'https://bank.com/api/me\', { credentials: \'include\' })`',
        'Скрипт робить `window.location = \'https://bank.com/profile\'`'
      ],
      answer: [0, 4],
      hint: 'Lax дозволяє cookie лише для навігації верхнього рівня (зміна URL в адресному рядку) безпечним методом.',
      explanation: `
\`SameSite=Lax\` надсилає cookie в cross-site запиті **лише** при **top-level навігації** з **безпечним методом** (GET):
- **клік по посиланню** — так;
- **\`window.location = ...\`** — теж top-level GET-навігація, так.

Не надсилається:
- **POST-форма** з чужого сайту — метод небезпечний (саме це блокує класичний CSRF). Виняток: у Chromium cookie *без явного* SameSite протягом 2 хвилин після встановлення ще надсилається з POST («Lax+POST»), але тут SameSite вказано явно.
- **\`<img>\`** — це підзапит (subresource), не навігація.
- **\`fetch\`** — підзапит; \`credentials: 'include'\` не обходить SameSite.

Висновок: Lax блокує більшість CSRF, але **GET-ендпоінти, що змінюють стан, залишаються вразливими** — посилання на \`/transfer?...\` спрацює.
`
    },
    {
      id: 'sec-quiz-cors-csrf', group: "cookies-csrf", why: ["Ні: CORS не блокує відправку простого запиту.","Ні: цей заголовок лише забороняє читати відповідь.","Ні: простий POST з формою теж підходить для атаки.","Так: запит з cookie виконається, CORS лише ховає відповідь."],
      type: 'quiz',
      level: 3,
      title: 'Чи захищає CORS від CSRF?',
      tags: ['cors', 'csrf'],
      question: 'API на `https://api.bank.com` налаштовано так, що `Access-Control-Allow-Origin` дозволяє лише `https://bank.com`. Автентифікація — cookie з `SameSite=None; Secure`. Ендпоінт `POST /transfer` приймає `application/x-www-form-urlencoded`. Чи захищений він від CSRF?',
      options: [
        'Так: браузер заблокує запит з evil.com, бо `Access-Control-Allow-Origin` дозволяє лише `bank.com`',
        'Так, якщо додати `Access-Control-Allow-Credentials: false`',
        'Ні, але атака можлива лише через GET',
        'Ні: це простий запит без preflight — він виконається з cookies; CORS лише не дасть evil.com прочитати відповідь'
      ],
      answer: 3,
      hint: 'Що саме перевіряє браузер у CORS для простого запиту — відправку чи читання відповіді?',
      explanation: `
POST з \`form-urlencoded\` — **простий** CORS-запит (саме такий могла надіслати HTML-форма завжди). Preflight не потрібен, тож браузер **відправляє** його одразу, з cookies (\`SameSite=None\` дозволяє cross-site). Сервер виконує переказ. CORS лише не дасть JS на evil.com прочитати відповідь — але для CSRF це неважливо. До того ж звичайна \`<form>\` на evil.com узагалі не підпадає під CORS.

- «Браузер заблокує» — поширений міф: CORS обмежує **читання**, а не відправку.
- \`Allow-Credentials: false\` теж стосується лише доступу до відповіді.
- «Лише через GET» — навпаки, тут вразливий саме POST.

**Що зробити:** \`SameSite=Lax/Strict\`, CSRF-токен, перевірка \`Origin\`/\`Sec-Fetch-Site\`, приймати лише \`application/json\` (тоді крос-доменний запит вимагатиме preflight).
`
    },
    {
      id: 'sec-clickjacking', group: "cookies-csrf", why: ["Ні: framebusting обходиться (sandbox), головне — заголовки.","Так: frame-ancestors (або X-Frame-Options) у заголовку відповіді.","Ні: frame-ancestors у meta не працює.","Ні: ALLOW-FROM не підтримується; для кількох джерел — frame-ancestors."],
      type: 'theory',
      level: 2,
      title: 'Clickjacking і захист від вбудовування',
      tags: ['clickjacking', 'csp', 'headers'],
      question: 'Що таке clickjacking? Як захистити сайт? Чому JavaScript framebusting не є надійним захистом?',
      choices: [
        'Основний захист — JS-framebusting `if (top !== self)`, а заголовки потрібні лише для старих браузерів',
        'Захист — заборонити вбудовування через `frame-ancestors` у CSP (або `X-Frame-Options`) у заголовку',
        'Достатньо додати `frame-ancestors \'none\'` у `<meta>`-тег CSP на головній сторінці сайту',
        '`X-Frame-Options: ALLOW-FROM` — сучасний спосіб дозволити вбудовування кільком партнерам'
      ],
      correct: 1,
      answer: `
**Clickjacking (UI redressing)** — зловмисник вбудовує ваш сайт у **прозорий iframe** поверх своєї сторінки («Виграй iPhone — тисни тут!»). Користувач думає, що клікає по кнопці зловмисника, а насправді — по кнопці «Видалити акаунт» / «Підтвердити платіж» / «Дати доступ» на вашому сайті, де він залогінений.

\`\`\`html
<!-- evil.com -->
<iframe src="https://bank.com/settings" style="opacity:0; position:absolute; top:0; left:0; width:100%; height:100%"></iframe>
<button>Отримати приз</button>
\`\`\`

**Захист — заборонити вбудовування заголовками відповіді:**
\`\`\`http
Content-Security-Policy: frame-ancestors 'none'          # нікому
Content-Security-Policy: frame-ancestors 'self' https://partner.com
X-Frame-Options: DENY            # або SAMEORIGIN — застарілий, але для старих браузерів
\`\`\`
- \`frame-ancestors\` — сучасний стандарт, гнучкий (кілька origin), має пріоритет над \`X-Frame-Options\`. Працює **лише як HTTP-заголовок**, не в \`<meta>\`.
- \`X-Frame-Options: ALLOW-FROM\` — мертвий, не підтримується.
- Захищати треба всі сторінки з чутливими діями, не лише головну.

**Чому JS framebusting ненадійний:**
\`\`\`js
if (top !== self) top.location = self.location; // старий підхід
\`\`\`
- iframe з атрибутом \`sandbox="allow-forms allow-scripts"\` (без \`allow-top-navigation\`) забороняє фрейму навігацію top-вікна — framebusting не спрацює, а форми працюватимуть.
- Обробники \`beforeunload\` у батьківській сторінці, вимкнений JS.
- Можна використовувати лише як додатковий шар (наприклад, приховати контент, поки не перевірено \`top === self\`).

**Додаткові шари:**
- \`SameSite=Lax/Strict\` cookies: у cross-site iframe cookies не надсилаються → користувач у фреймі не залогінений, атака втрачає сенс.
- Підтвердження критичних дій (повторний пароль, 2FA), які неможливо зробити одним кліком.
- Новіший вектор — **double-clickjacking**: атака через швидку підміну вікна між двома кліками (не потребує iframe) — тому для критичних кнопок додають затримку активації або вимагають явної взаємодії.
`,
      keyPoints: [
        'Механізм: прозорий iframe з вашим сайтом під елементами зловмисника',
        'CSP frame-ancestors (сучасний, гнучкий; лише в заголовку)',
        'X-Frame-Options DENY/SAMEORIGIN для старих браузерів; ALLOW-FROM мертвий',
        'JS framebusting обходиться через sandbox',
        'SameSite cookies і підтвердження критичних дій як додаткові шари'
      ],
      followUps: ['Чому frame-ancestors не працює в meta-тегу?', 'Як дозволити вбудовування лише партнерам?', 'Що таке double-clickjacking?']
    },
    // ---------------------------------------------------------------- Автентифікація
    {
      id: 'sec-sessions-jwt', group: "auth", why: ["Так: короткий access + refresh з ротацією компенсують неможливість відкликання.","Ні: JWS лише підписаний, payload читає будь-хто.","Ні: підпис дійсний до exp — потрібен denylist або короткий TTL.","Ні: рішення про доступ ухвалює сервер; клієнтські дані підробляються."],
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Сесії vs JWT',
      tags: ['auth', 'jwt', 'sessions'],
      question: 'Порівняйте автентифікацію через серверні сесії та через JWT. Як влаштований JWT і як його правильно валідувати? Які проблеми з відкликанням токенів?',
      choices: [
        'JWT валідний до `exp`, тому його поєднують із коротким access token і refresh token з ротацією',
        'Payload JWT зашифрований підписом, тому в ньому можна безпечно передавати персональні дані',
        'JWT легко відкликати миттєво: сервер просто перестає приймати підпис конкретного користувача',
        'Клієнт може брати роль з payload JWT і на її основі вирішувати, до яких даних є доступ'
      ],
      correct: 0,
      answer: `
**Серверна сесія (stateful):**
1. Після логіну сервер створює запис сесії (у пам'яті, Redis, БД) і віддає **непрозорий ідентифікатор** у cookie (\`HttpOnly; Secure; SameSite\`).
2. Кожен запит → сервер шукає сесію за id.
- ✅ Миттєве відкликання (видалити запис — «вийти з усіх пристроїв»), маленька cookie, дані не видно клієнту.
- ❌ Потрібне спільне сховище при масштабуванні, запит до сховища на кожен запит.

**JWT (JSON Web Token, stateless):** \`header.payload.signature\`, кожна частина — **base64url**.
\`\`\`text
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9   ← {"alg":"RS256","typ":"JWT"}
.eyJzdWIiOiI0MiIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzk...   ← {"sub":"42","role":"user","exp":17...}
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c   ← підпис
\`\`\`
- Payload **лише закодований, не зашифрований** — будь-хто може прочитати. Жодних паролів і персональних даних.
- Підпис (HMAC \`HS256\` зі спільним секретом або асиметричний \`RS256\`/\`ES256\`) гарантує **цілісність**: змінити payload без ключа неможливо.
- Сервер перевіряє підпис без звернення до БД → зручно для мікросервісів (публічний ключ через JWKS).

**Правильна валідація JWT (на сервері!):**
- Перевірити підпис **з фіксованим алгоритмом** (allowlist). Відомі атаки: \`alg: none\`; підміна \`RS256\` → \`HS256\` з публічним ключем як HMAC-секретом.
- Перевірити claims: \`exp\` (термін), \`nbf\`, \`iss\` (хто видав), \`aud\` (для кого), за потреби \`jti\`.
- Клієнт може **декодувати** payload (показати ім'я, дізнатися \`exp\` для своєчасного refresh), але **ніколи не довіряти** йому для рішень про доступ.

**Проблема відкликання:** JWT валідний до \`exp\`, навіть якщо користувача заблоковано чи він вийшов. Рішення:
- **Короткоживучий access token** (5–15 хв) + **refresh token** (довгий, зберігається на сервері, можна відкликати, з ротацією).
- Denylist за \`jti\` (але це знову стан на сервері).
- Версія токенів у користувача (\`tokenVersion\` в БД) — інвалідація всіх токенів одразу.

**Що обрати:**
- Класичний веб-застосунок / SPA з власним бекендом на одному сайті → **сесія в HttpOnly-cookie** найпростіша й найбезпечніша.
- Мікросервіси, сторонні API, мобільні клієнти, SSO між різними доменами → JWT (часто як access token в OAuth/OIDC).
- JWT у cookie — теж варіант: stateless-перевірка + захист HttpOnly (але тоді потрібен CSRF-захист).
`,
      keyPoints: [
        'Сесія: непрозорий id у cookie, стан на сервері, миттєве відкликання',
        'JWT: header.payload.signature у base64url; payload не зашифрований',
        'Валідація: підпис з allowlist алгоритмів (alg:none, RS/HS-confusion), exp/nbf/iss/aud',
        'Відкликання JWT: короткий access + refresh з ротацією, denylist, tokenVersion',
        'Клієнт може декодувати, але не довіряти payload; вибір залежить від архітектури'
      ],
      followUps: ['Що таке атака alg: none?', 'Чим RS256 кращий за HS256 у мікросервісах?', 'Як реалізувати «вийти з усіх пристроїв» з JWT?']
    },
    {
      id: 'sec-quiz-jwt-readable', group: "auth", why: ["Так: base64url — кодування, не шифрування.","Ні: звичайний JWT підписаний, а не зашифрований.","Ні: payload не зашифрований, ключ не потрібен.","Ні: payload не хешується — його просто декодують."],
      type: 'quiz',
      level: 1,
      interview: true,
      title: 'Хто може прочитати payload JWT?',
      tags: ['jwt'],
      question: 'Хто може прочитати вміст payload звичайного підписаного JWT (JWS), наприклад `{"sub":"42","email":"a@b.com"}`?',
      options: [
        'Будь-хто, хто має токен: payload лише закодований у base64url',
        'Лише сервер, бо токен зашифрований секретним ключем',
        'Лише той, хто знає публічний ключ',
        'Ніхто — payload хешується і відновити його неможливо'
      ],
      answer: 0,
      hint: 'Яку властивість дає підпис: конфіденційність чи цілісність?',
      explanation: `
JWS-токен складається з трьох base64url-частин. \`atob\` (з невеликою корекцією алфавіту) прочитає payload будь-де — jwt.io робить це в браузері. **Підпис** гарантує **цілісність і автентичність** (ніхто без ключа не змінить \`role: "user"\` на \`"admin"\`), але не **конфіденційність**.

- «Зашифрований» — ні; шифрування — це окремий стандарт **JWE**, який рідко використовують для access-токенів.
- Публічний ключ потрібен для **перевірки підпису** (RS256/ES256), а не для читання.
- Хеш тут є лише в підписі; сам payload передається повністю.

Висновок: не кладіть у JWT паролі, номери карток, зайві персональні дані.
`
    },
    {
      id: 'sec-jwt-decode', group: "auth",
      type: 'code',
      level: 2,
      title: 'decodeJwtPayload + isTokenExpired',
      tags: ['jwt', 'base64', 'unicode'],
      description: `
**Завдання.** На клієнті часто треба прочитати \`exp\` з access-токена, щоб оновити його **до** закінчення. Напишіть дві функції:

**Де трапляється:** оновлення access-токена до закінчення терміну на клієнті.

**\`decodeJwtPayload(token)\`** — повертає payload як об'єкт:
- токен має рівно 3 частини через \`.\`, інакше \`throw new Error('Invalid JWT')\`;
- payload закодований **base64url**: алфавіт \`-\` і \`_\` замість \`+\` і \`/\`, padding \`=\` відсутній;
- після декодування байти — це **UTF-8** (імена кирилицею, емодзі мають читатися правильно);
- невалідний base64 / не JSON / не об'єкт → \`throw new Error('Invalid JWT')\`.

**\`isTokenExpired(token, skewSeconds = 30)\`**:
- \`exp\` — час у **секундах** від Unix epoch;
- токен вважається простроченим, якщо \`Date.now() / 1000 >= exp - skewSeconds\` (запас на розбіжність годинників і час запиту);
- немає числового \`exp\` → \`false\`; невалідний токен → \`true\`.

> Підпис ми **не** перевіряємо — на клієнті це неможливо без секрету й не потрібно: payload використовується лише для UX, рішення про доступ приймає сервер.

**Як це працює:** JWT — три частини через крапку; payload — base64url (замінити - → +, _ → /, додати = до кратності 4). atob дає байти — для UTF-8 їх треба декодувати через TextDecoder. exp у секундах порівнюємо з Date.now() з запасом skew.
`,
      starter: `// План:
// 1. decodeJwtPayload: розбити по '.', має бути 3 частини
// 2. base64url → base64 (- → +, _ → /, доповнити '=')
// 3. atob → байти → TextDecoder (UTF-8) → JSON.parse
// 4. isTokenExpired: немає exp → true; exp * 1000 − skew * 1000 <= Date.now()

function decodeJwtPayload(token) {
  // TODO
  return JSON.parse(atob(token.split('.')[1]));
}

function isTokenExpired(token, skewSeconds = 30) {
  // TODO
}
`,
      solution: `function decodeJwtPayload(token) {
  const parts = String(token).split('.');
  if (parts.length !== 3 || !parts[1]) throw new Error('Invalid JWT');

  // base64url → base64: інший алфавіт + відновлення padding
  let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  base64 += '='.repeat((4 - (base64.length % 4)) % 4);

  let binary;
  try {
    binary = atob(base64); // «бінарний рядок»: 1 символ = 1 байт
  } catch {
    throw new Error('Invalid JWT');
  }

  // atob не знає про UTF-8 — декодуємо байти явно
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);

  let payload;
  try {
    payload = JSON.parse(json);
  } catch {
    throw new Error('Invalid JWT');
  }
  if (!payload || typeof payload !== 'object') throw new Error('Invalid JWT');
  return payload;
}

function isTokenExpired(token, skewSeconds = 30) {
  let payload;
  try {
    payload = decodeJwtPayload(token);
  } catch {
    return true; // зламаний токен безпечніше вважати простроченим
  }
  if (typeof payload.exp !== 'number') return false;
  return Date.now() / 1000 >= payload.exp - skewSeconds;
}
`,
      hints: [
        'base64url → base64: замініть `-` на `+`, `_` на `/` і допишіть `=` до довжини, кратної 4.',
        '`atob` повертає рядок, де кожен символ — один **байт**. Для UTF-8 перетворіть його на `Uint8Array` (`charCodeAt`) і декодуйте через `new TextDecoder().decode(bytes)`.',
        '`exp` у секундах, а `Date.now()` — у мілісекундах. Порівнюйте `Date.now() / 1000 >= exp - skewSeconds`.'
      ],
      tests: [
        { name: 'декодує простий payload', code: "const H = 'eyJhbGciOiJIUzI1NiJ9';\nexpect(decodeJwtPayload(H + '.eyJzdWIiOiI0MiIsInJvbGUiOiJhZG1pbiJ9.sig')).toEqual({ sub: '42', role: 'admin' });" },
        { name: 'UTF-8 і символ - з base64url', code: "const H = 'eyJhbGciOiJIUzI1NiJ9';\nexpect(decodeJwtPayload(H + '.eyJuYW1lIjoi0J7Qu9C10L3QsCDQmtC-0LLQsNC70Ywg8J-RiyJ9.sig')).toEqual({ name: 'Олена Коваль 👋' });" },
        { name: 'символ _ і відсутній padding', code: "const H = 'eyJhbGciOiJIUzI1NiJ9';\nexpect(decodeJwtPayload(H + '.eyJhIjoifn5-IiwiYiI6Ij8_Pz4-PiIsIm5hbWUiOiLQntC70LXQvdCwINCa0L7QstCw0LvRjCDwn5GLIn0.sig')).toEqual({ a: '~~~', b: '???>>>', name: 'Олена Коваль 👋' });" },
        { name: 'невалідні токени → Invalid JWT', code: "const H = 'eyJhbGciOiJIUzI1NiJ9';\n['abc', 'a.b', '', 'a.b.c.d', H + '..sig', H + '.!!!.sig', H + '.' + btoa('not json') + '.sig', H + '.' + btoa('42') + '.sig'].forEach((t) => {\n  expect(() => decodeJwtPayload(t)).toThrow('Invalid JWT');\n});" },
        { name: 'isTokenExpired враховує exp у секундах і запас', code: "useFakeTimers(1700000000000);\nconst tok = (o) => 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify(o)).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '') + '.sig';\nexpect(isTokenExpired(tok({ exp: 1700000100 }))).toBe(false);\nexpect(isTokenExpired(tok({ exp: 1700000020 }))).toBe(true);\nexpect(isTokenExpired(tok({ exp: 1700000020 }), 0)).toBe(false);\nexpect(isTokenExpired(tok({ exp: 1699999999 }), 0)).toBe(true);\nexpect(isTokenExpired(tok({ exp: 1700000000 }), 0)).toBe(true);" },
        { name: 'немає exp → false, зламаний токен → true', code: "const tok = (o) => 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify(o)).replace(/=+$/, '') + '.sig';\nexpect(isTokenExpired(tok({ sub: '1' }))).toBe(false);\nexpect(isTokenExpired('garbage')).toBe(true);" }
      ],
      explanation: `
**Дві пастки, через які «очевидне» \`JSON.parse(atob(part))\` ламається:**
1. **base64url ≠ base64.** JWT використовує URL-безпечний алфавіт (\`-\`, \`_\`) і прибирає padding. \`atob\` на \`-\` кидає \`InvalidCharacterError\`.
2. **\`atob\` повертає байти, а не текст.** Кирилиця в UTF-8 займає 2 байти на символ, емодзі — 4. Без \`TextDecoder\` отримаємо «кракозябри» на зразок \`Ð\u009eÐ»...\`. Сучасна альтернатива — \`Uint8Array.fromBase64(str, { alphabet: 'base64url' })\` (нове API, підтримується ще не всюди).

Складність — O(n) від довжини токена.

**\`skew\`** — запас на розбіжність годинників клієнта й сервера та на тривалість запиту: якщо токен спливає через 5 с, запит, відправлений зараз, може прийти вже з простроченим токеном.

**Безпека:** декодування на клієнті — лише для UX (планування refresh, показ імені). Підробити payload може будь-хто, тому сервер **завжди** перевіряє підпис і claims. Не тягніть бібліотеку \`jsonwebtoken\` у браузер — для декодування вистачить 15 рядків (або \`jwt-decode\`).

**Що можуть спитати далі:** як спланувати проактивне оновлення токена (\`setTimeout\` на \`exp - skew\`)? Що робити, якщо кілька паралельних запитів отримали \`401\`? Де зберігати access token?
`
    },
    {
      id: 'sec-token-storage', group: "auth", why: ["Так: localStorage відкритий для будь-якого скрипта на сторінці.","Ні: XSS виконується в тій самій вкладці і читає sessionStorage.","Так: HttpOnly ховає токен від JS, але повертає ризик CSRF.","Так: повтор старого refresh — сигнал крадіжки, відкликають усю сім'ю токенів.","Ні: refresh у localStorage — найцінніший токен у найвразливішому місці."],
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Де зберігати токени і refresh token rotation',
      tags: ['auth', 'jwt', 'storage', 'xss', 'csrf'],
      question: 'Де SPA має зберігати access і refresh токени: localStorage, sessionStorage, пам\'ять, HttpOnly cookie? Які компроміси? Що таке refresh token rotation? Оберіть **усі** правильні твердження.',
      choices: [
        'Токен у `localStorage` може прочитати й вивезти будь-який скрипт, що виконався через XSS',
        '`sessionStorage` захищений від XSS, бо доступний лише в межах однієї вкладки',
        'HttpOnly cookie не дає вивезти refresh token при XSS, але потребує SameSite і CSRF-захисту',
        'При rotation повторне використання старого refresh token — ознака крадіжки: сервер відкликає всю сім\'ю',
        'Access token краще тримати в HttpOnly cookie, а refresh — у `localStorage`, щоб переживав reload'
      ],
      correct: [0, 2, 3],
      hint: 'Порівняйте варіанти за двома загрозами: XSS (крадіжка) і CSRF (автоматичне надсилання).',
      answer: `
**Варіанти та компроміси:**

| Сховище | XSS | CSRF | Переживає reload | Примітки |
|---|---|---|---|---|
| \`localStorage\` | ❌ будь-який скрипт прочитає і **вивезе** токен | ✅ не надсилається автоматично | так | найпростіше і найризикованіше; токен живе вічно на диску |
| \`sessionStorage\` | ❌ те саме | ✅ | лише в межах вкладки | трохи менше вікно атаки |
| Змінна в пам'яті (замикання) | ⚠ важче вкрасти (немає глобального сховища), але XSS може перехопити запити | ✅ | ні → потрібен механізм відновлення | гарний варіант для **access token** |
| \`HttpOnly; Secure; SameSite\` cookie | ✅ JS не прочитає | ⚠ потрібен SameSite + CSRF-захист | так | найкраще для **refresh token**/сесії |

**Важливий нюанс:** XSS — це «гра закінчена» у будь-якому випадку: скрипт може робити запити від імені користувача, поки той на сторінці. Але HttpOnly-cookie не дає **вивезти** довгоживучий токен і використовувати його тижнями з іншої машини. Тому шкода суттєво менша.

**Рекомендований патерн для SPA зі своїм бекендом:**
- **Access token** — короткоживучий (5–15 хв), лише **в пам'яті**.
- **Refresh token** — у cookie \`HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh\` (обмежений шлях — cookie їде лише на ендпоінт оновлення).
- При старті застосунку / reload / 401 → \`POST /auth/refresh\` → новий access token.
- Ще безпечніше — **BFF (Backend for Frontend)**: токени взагалі не потрапляють у браузер, BFF тримає їх на сервері, а браузер має лише сесійну HttpOnly-cookie. Це рекомендація чернетки IETF «OAuth 2.0 for Browser-Based Applications».

**Refresh token rotation:**
- Кожен виклик \`/refresh\` повертає **новий** refresh token, а старий **інвалідується**.
- **Виявлення повторного використання:** якщо старий (уже використаний) refresh token приходить знову — його вкрали; сервер відкликає **всю сім'ю** токенів цієї сесії і змушує перелогінитися.
- Плюс абсолютний термін життя сесії (наприклад, 30 днів) і idle timeout.

**Підводні камені на клієнті:**
- **Гонка при оновленні:** 5 паралельних запитів отримують 401 → має піти **один** refresh (single-flight: спільний проміс), інші чекають і повторюються. Інакше rotation зламає сесію (другий refresh прийде зі вже використаним токеном).
- **Кілька вкладок:** синхронізація через \`BroadcastChannel\` або Web Locks API (\`navigator.locks.request\`), щоб вкладки не оновлювали токен одночасно.
- Logout: видалити токен з пам'яті, викликати серверне відкликання refresh token, очистити cookie.
`,
      keyPoints: [
        'localStorage/sessionStorage доступні будь-якому скрипту → крадіжка при XSS',
        'HttpOnly cookie захищає від крадіжки, але потребує SameSite/CSRF-захисту',
        'Патерн: access token у пам\'яті (короткий), refresh у HttpOnly cookie з обмеженим Path; або BFF',
        'Refresh token rotation + виявлення повторного використання → відкликання сім\'ї токенів',
        'Single-flight refresh для паралельних 401 і синхронізація вкладок'
      ],
      followUps: ['Як реалізувати single-flight refresh?', 'Що таке BFF і чому його рекомендують для SPA?', 'Як XSS може зашкодити, навіть якщо токени в HttpOnly cookie?']
    },
    {
      id: 'sec-oauth-pkce', group: "auth", why: ["Ні: у SPA секретів немає; PKCE замінює секрет одноразовим verifier.","Так: code без verifier марний для зловмисника.","Ні: токен у URL витікає через історію, Referer і логи.","Ні: OIDC — шар автентифікації (id_token) поверх OAuth 2.0."],
      type: 'theory',
      level: 4,
      interview: true,
      title: 'OAuth 2.0 / OIDC: Authorization Code + PKCE для SPA',
      tags: ['oauth', 'oidc', 'pkce', 'auth'],
      question: 'Як SPA має реалізовувати вхід через OAuth 2.0 / OpenID Connect («Увійти через Google»)? Опишіть Authorization Code Flow з PKCE. Чому implicit flow застарів? Чим OAuth відрізняється від OIDC?',
      choices: [
        'PKCE дозволяє SPA безпечно тримати `client_secret` у бандлі, бо секрет хешується SHA-256',
        'Без `code_verifier`, що не покидав клієнта, перехоплений `code` неможливо обміняти на токени',
        'Implicit flow застарів лише через відсутність refresh tokens, а токен в URL — не проблема',
        'OIDC — те саме, що OAuth 2.0, просто інша назва для входу через Google чи соцмережі'
      ],
      correct: 1,
      hint: 'SPA — публічний клієнт: client_secret у браузері зберегти неможливо. Що тоді доводить, що code обмінює той самий клієнт, який його запросив?',
      answer: `
**OAuth 2.0** — протокол **делегованої авторизації**: застосунок отримує **access token** для доступу до API від імені користувача («дозволити застосунку читати мій календар»). Він **не** каже, *хто* користувач.
**OpenID Connect (OIDC)** — шар **автентифікації** поверх OAuth: додає **ID token** (JWT з \`sub\`, \`email\`, \`name\`, \`nonce\`), scope \`openid\`, ендпоінт \`userinfo\` і discovery (\`/.well-known/openid-configuration\`).

**Authorization Code Flow + PKCE (рекомендовано для SPA та мобільних):**
1. Клієнт генерує **\`code_verifier\`** — криптовипадковий рядок (43–128 символів) і **\`code_challenge = BASE64URL(SHA-256(code_verifier))\`**. Також \`state\` (і \`nonce\` для OIDC).
\`\`\`js
const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
const challenge = base64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
\`\`\`
2. Редирект на сервер авторизації:
\`\`\`text
https://auth.example.com/authorize?response_type=code&client_id=spa
  &redirect_uri=https://app.example.com/callback&scope=openid profile
  &state=xyz&nonce=abc&code_challenge=E9Melhoa...&code_challenge_method=S256
\`\`\`
3. Користувач логіниться і дає згоду → редирект назад: \`/callback?code=SplxlOB...&state=xyz\`.
4. Клієнт перевіряє, що **\`state\`** збігається зі збереженим (захист від CSRF/підміни відповіді).
5. Обмін: \`POST /token\` з \`code\`, \`redirect_uri\` і **\`code_verifier\`**. Сервер хешує verifier і порівнює з challenge з кроку 2.
6. Відповідь: \`access_token\`, \`id_token\` (перевірити підпис, \`iss\`, \`aud\`, \`exp\`, \`nonce\`), можливо \`refresh_token\` (для SPA — з ротацією).

**Що дає PKCE:** \`code\` повертається через URL і може «витекти» (логи, history, шкідливий застосунок з тим самим redirect-схемою на мобільному). Без \`code_verifier\`, який ніколи не покидав клієнта, обміняти \`code\` на токени неможливо. PKCE замінює \`client_secret\`, який публічний клієнт не може зберегти. OAuth 2.1 робить PKCE **обов'язковим для всіх** клієнтів.

**Чому implicit flow (\`response_type=token\`) застарів:**
- Access token повертається **прямо у фрагменті URL** (\`#access_token=...\`) → потрапляє в історію браузера, може витекти через \`Referer\`, розширення, логи.
- Немає зв'язку токена з клієнтом, немає refresh tokens → «тихе» оновлення через приховані iframe, яке ламається з блокуванням third-party cookies.
- Неможливо виявити підміну токена (token injection).
- OAuth 2.0 Security BCP (RFC 9700) забороняє implicit і password grant; OAuth 2.1 їх видаляє.

**Сучасні нюанси:**
- **BFF-патерн**: обмін code → tokens робить ваш бекенд (конфіденційний клієнт з секретом), браузер отримує лише HttpOnly-сесію. Найбезпечніший варіант для SPA.
- **DPoP** — прив'язка токена до ключа клієнта (вкрадений токен марний без приватного ключа).
- \`redirect_uri\` — точна відповідність, без wildcard (інакше open redirect → крадіжка code).
- Бібліотеки: \`oidc-client-ts\`, Auth.js, SDK провайдерів — не реалізовуйте криптографію вручну.
`,
      keyPoints: [
        'OAuth 2.0 — делегована авторизація (access token); OIDC — автентифікація (ID token, nonce)',
        'Кроки: code_verifier/code_challenge (S256) → authorize → code + state → обмін з verifier',
        'PKCE захищає від перехоплення code і замінює client_secret для публічних клієнтів',
        'Implicit flow застарів: токен у URL, витоки, немає refresh, RFC 9700 / OAuth 2.1',
        'state — CSRF-захист; перевірка id_token (iss, aud, exp, nonce); точний redirect_uri',
        'BFF і DPoP як найсучасніші підходи'
      ],
      followUps: ['Навіщо потрібен state, якщо є PKCE?', 'Чим access token відрізняється від ID token і чому ID token не можна слати в API?', 'Як реалізувати «тихе» оновлення сесії без third-party cookies?']
    },
    // ---------------------------------------------------------------- Транспорт: HTTPS, HSTS, SRI
    {
      id: 'sec-https-hsts', group: "transport", why: ["Ні: перший візит до отримання заголовка не захищений (крім preload).","Ні: mixed active content блокується незалежно від integrity.","Так: HSTS + preload прибирають незахищений перший запит.","Ні: SRI потребує незмінного файлу — фіксуйте версію."],
      type: 'theory',
      level: 2,
      title: 'HTTPS, HSTS, mixed content, SRI',
      tags: ['https', 'hsts', 'sri', 'tls'],
      question: 'Що дає HTTPS? Що таке HSTS і HSTS preload? Що таке mixed content? Як захистити скрипти, що завантажуються з CDN (Subresource Integrity)?',
      choices: [
        'HSTS захищає вже з першого візиту на будь-який сайт, бо браузер дізнається про політику через DNS',
        'HTTP-скрипти на HTTPS-сторінці дозволені, якщо вказати для них атрибут `integrity`',
        'HSTS змушує браузер ходити на домен лише по HTTPS; preload-список захищає навіть перший візит',
        'SRI добре працює з URL виду `lib@latest`, бо браузер перераховує хеш при кожному оновленні'
      ],
      correct: 2,
      answer: `
**HTTPS** = HTTP поверх TLS. Дає три гарантії:
- **конфіденційність** — трафік зашифровано (паролі, cookies не видно в публічному Wi-Fi);
- **цілісність** — провайдер чи проксі не вставить рекламу/скрипт у сторінку;
- **автентичність** — сертифікат підтверджує, що ви говорите саме з \`bank.com\`.

Також багато API доступні **лише в secure context**: Service Worker, геолокація, камера, \`crypto.subtle\`, Clipboard, HTTP/2 і HTTP/3 у браузерах.

**Проблема першого запиту:** користувач вводить \`bank.com\` → браузер іде на \`http://\` → сервер робить 301 на \`https://\`. Цей перший HTTP-запит можна перехопити (**SSL stripping**: атакувальник проксує і тримає жертву на HTTP).

**HSTS (HTTP Strict Transport Security):**
\`\`\`http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
\`\`\`
- Браузер запам'ятовує: на цей домен **лише HTTPS** протягом \`max-age\`. Усі \`http://\` посилання переписуються локально, без мережі; помилку сертифіката **не можна пропустити** кнопкою «Все одно перейти».
- Працює після **першого** візиту (trust on first use). **Preload-список** (hstspreload.org) вшитий у браузери → захист навіть при першому візиті. Вимоги: \`includeSubDomains\`, \`preload\`, \`max-age\` ≥ 1 рік. Вийти зі списку довго — переконайтесь, що **всі** піддомени працюють по HTTPS.
- Заголовок ігнорується, якщо отриманий по HTTP.

**Mixed content** — HTTPS-сторінка завантажує ресурси по HTTP:
- **Активний** (скрипти, iframe, fetch, CSS) — **блокується** завжди: інакше атакувальник підмінить скрипт і вся HTTPS-сторінка скомпрометована.
- **Пасивний** (картинки, аудіо, відео) — сучасні браузери намагаються **автоматично апгрейдити** на HTTPS і блокують, якщо не вдалося.
- Рішення: усе по HTTPS, \`upgrade-insecure-requests\` у CSP як страховка під час міграції.

**Subresource Integrity (SRI)** — захист від компрометації CDN:
\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/lib@3.2.1/dist/lib.min.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
        crossorigin="anonymous"></script>
\`\`\`
- Браузер рахує хеш завантаженого файлу; якщо не збігається — **не виконує** ресурс (подія \`error\`).
- \`crossorigin="anonymous"\` обов'язковий для крос-доменних ресурсів (CORS-відповідь, щоб браузер міг перевірити вміст).
- Працює лише з **версіонованими незмінними** URL (\`lib@3.2.1\`, не \`lib@latest\`). Бандлери (webpack-subresource-integrity, Vite-плагіни) генерують SRI автоматично.
- Реальний кейс: компрометація polyfill.io (2024) — сайти, що підключали скрипт без SRI, роздавали шкідливий код мільйонам користувачів. Найкраще — **самостійно хостити** критичні скрипти.
`,
      keyPoints: [
        'HTTPS: конфіденційність, цілісність, автентичність; secure context для сучасних API',
        'SSL stripping і проблема першого HTTP-запиту',
        'HSTS: max-age, includeSubDomains, preload-список; помилку сертифіката не пропустити',
        'Mixed content: активний блокується, пасивний апгрейдиться; upgrade-insecure-requests',
        'SRI: integrity + crossorigin, лише для незмінних версіонованих URL; кейс polyfill.io'
      ],
      followUps: ['Чому HSTS-заголовок, отриманий по HTTP, ігнорується?', 'Чому SRI не працює з посиланням на @latest?', 'Які ризики має HSTS preload з includeSubDomains?']
    },
    {
      id: 'sec-quiz-sri', group: "transport", why: ["Ні: невідповідність хешу — блокування, не попередження.","Так: браузер не виконує файл з іншим хешем.","Ні: автоматичного фолбеку немає — його роблять вручну.","Ні: SRI перевіряє вміст файлу, а не сертифікат."],
      type: 'quiz',
      level: 2,
      title: 'SRI: що станеться при підміні файлу',
      tags: ['sri', 'supply-chain'],
      question: 'Сторінка підключає `<script src="https://cdn.example.com/lib@2.1.0.min.js" integrity="sha384-ABC..." crossorigin="anonymous">`. CDN зламали й змінили вміст файлу. Що зробить браузер?',
      options: [
        'Виконає скрипт, але виведе попередження в консоль',
        'Не виконає скрипт: хеш не збігся, спрацює подія `error`',
        'Автоматично завантажить оригінальну версію з HTTP-кешу',
        'Нічого не помітить: SRI перевіряє лише TLS-сертифікат CDN'
      ],
      answer: 1,
      hint: 'Що саме хешується і порівнюється з атрибутом `integrity`?',
      explanation: `
Браузер обчислює криптографічний хеш **отриманого вмісту** і порівнює з \`integrity\`. Невідповідність → ресурс блокується, на елементі спрацьовує \`error\`, у консолі — повідомлення про integrity.

- **Не виконає з попередженням** — SRI не має «м'якого» режиму, це жорстка перевірка (саме в цьому сенс).
- **Оригінал з кешу** — браузер не має механізму підміни; сторінка просто працюватиме без скрипта (тому для критичних бібліотек роблять fallback або self-hosting).
- **Перевіряє сертифікат** — ні, TLS захищає канал до CDN, але не від компрометації самого CDN. SRI захищає саме **вміст**.
`
    },
    // ---------------------------------------------------------------- Клієнтські вразливості
    {
      id: 'sec-safe-merge', group: "transport",
      type: 'code',
      level: 3,
      title: 'safeMerge: глибоке злиття без prototype pollution',
      tags: ['prototype-pollution', 'objects'],
      description: `
**Завдання.** Стартовий код — типовий **вразливий** deep merge. Якщо \`source\` прийшов від користувача (\`JSON.parse\` тіла запиту, query-рядок, налаштування з \`localStorage\`), то \`{"__proto__": {"isAdmin": true}}\` додасть \`isAdmin\` **усім об'єктам** застосунку.

**Де трапляється:** злиття налаштувань і JSON від користувача (prototype pollution).

Перепишіть \`safeMerge(target, source)\`:
- рекурсивно зливає **plain-об'єкти** (прототип \`Object.prototype\` або \`null\`) з \`source\` у \`target\`, мутує і повертає \`target\`;
- ключі \`__proto__\`, \`constructor\`, \`prototype\` **пропускаються** на будь-якій глибині;
- обробляються лише **власні** перелічувані ключі \`source\`;
- масиви **замінюються** копією (не зливаються поелементно);
- вкладені об'єкти з \`source\` **копіюються**, а не переносяться за посиланням (зміна \`source\` після злиття не впливає на результат);
- якщо \`target[key]\` — не plain-об'єкт (або відсутній), а \`source[key]\` — plain-об'єкт, \`target[key]\` стає новим об'єктом.

**Як це працює:** Проходимо лише ВЛАСНІ ключі source (Object.keys), пропускаючи __proto__, constructor і prototype. Вкладені звичайні об'єкти зливаємо рекурсивно, решту значень копіюємо — так запис у прототип стає неможливим.
`,
      starter: `// План:
// 1. Перебирати лише Object.keys(source)
// 2. Ключі __proto__, constructor, prototype — пропускати
// 3. Обидва значення — звичайні об'єкти → рекурсивно злити, інакше просто присвоїти

function safeMerge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (typeof target[key] !== 'object' || target[key] === null) target[key] = {};
      safeMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}
`,
      solution: `const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function safeMerge(target, source) {
  if (source === null || typeof source !== 'object') return target;

  // Object.keys — лише власні перелічувані ключі (for...in пройшов би й успадковані)
  for (const key of Object.keys(source)) {
    if (FORBIDDEN_KEYS.has(key)) continue;
    const value = source[key];

    if (isPlainObject(value)) {
      // зливаємо лише у ВЛАСНИЙ plain-об'єкт target, інакше — у новий
      const base = Object.hasOwn(target, key) && isPlainObject(target[key]) ? target[key] : {};
      target[key] = safeMerge(base, value);
    } else if (Array.isArray(value)) {
      target[key] = value.slice();
    } else {
      target[key] = value;
    }
  }
  return target;
}
`,
      hints: [
        'Звідки береться забруднення: `JSON.parse` створює **власний** ключ `"__proto__"`, а `target["__proto__"]` повертає `Object.prototype` — і рекурсія пише прямо в нього.',
        'Пропускайте `__proto__`, `constructor`, `prototype` і ходіть лише по `Object.keys(source)`. Рекурсію робіть лише для plain-об\'єктів (`Object.getPrototypeOf(v) === Object.prototype || === null`).',
        'Перед рекурсією перевіряйте `Object.hasOwn(target, key)`, щоб не злити дані в успадкований об\'єкт. Масиви копіюйте через `slice()`.'
      ],
      tests: [
        { name: 'звичайне глибоке злиття, повертає target', code: "const target = { a: { b: 1 }, k: 1 };\nconst result = safeMerge(target, { a: { c: 2 }, k: 2, n: null });\nexpect(result).toBe(target);\nexpect(result).toEqual({ a: { b: 1, c: 2 }, k: 2, n: null });" },
        { name: '__proto__ з JSON.parse не забруднює прототип', code: "try {\n  const result = safeMerge({}, JSON.parse('{\"__proto__\": {\"polluted\": true}, \"ok\": 1}'));\n  expect({}.polluted).toBeUndefined();\n  expect(result.polluted).toBeUndefined();\n  expect(result.ok).toBe(1);\n} finally {\n  delete Object.prototype.polluted;\n}" },
        { name: 'вкладений __proto__ і constructor/prototype пропускаються', code: "try {\n  const result = safeMerge({ a: {} }, JSON.parse('{\"a\": {\"__proto__\": {\"x\": 1}}, \"constructor\": {\"prototype\": {\"y\": 1}}}'));\n  expect({}.x).toBeUndefined();\n  expect({}.y).toBeUndefined();\n  expect(Object.getPrototypeOf(result.a)).toBe(Object.prototype);\n  expect(Object.hasOwn(result, 'constructor')).toBe(false);\n} finally {\n  delete Object.prototype.x;\n  delete Object.prototype.y;\n}" },
        { name: 'масиви замінюються копією', code: "const source = { list: [1, 2] };\nconst result = safeMerge({ list: [9, 9, 9] }, source);\nexpect(result.list).toEqual([1, 2]);\nsource.list.push(3);\nexpect(result.list).toEqual([1, 2]);" },
        { name: 'вкладені об\'єкти копіюються, а не переносяться за посиланням', code: "const source = { cfg: { theme: 'dark' } };\nconst result = safeMerge({}, source);\nsource.cfg.theme = 'light';\nexpect(result.cfg.theme).toBe('dark');\nexpect(result.cfg).not.toBe(source.cfg);" },
        { name: 'успадковані ключі source ігноруються', code: "const proto = { inherited: 1 };\nconst source = Object.create(proto);\nsource.own = 2;\nexpect(safeMerge({}, source)).toEqual({ own: 2 });" }
      ],
      explanation: `
**Як виникає prototype pollution:** \`JSON.parse('{"__proto__": {...}}')\` створює **звичайну власну властивість** з ім'ям \`__proto__\`. Але при читанні \`target['__proto__']\` спрацьовує аксесор \`Object.prototype.__proto__\` і повертає **прототип** — рекурсивний merge починає записувати поля прямо в \`Object.prototype\`. Після цього \`({}).isAdmin === true\` для **будь-якого** об'єкта.

**Наслідки:** обхід перевірок (\`if (user.isAdmin)\`), DoS (перевизначення \`toString\`), у Node.js — аж до RCE через «гаджети» в бібліотеках (опції \`child_process\`, шаблонізатори); у браузері — DOM XSS через гаджети (наприклад, бібліотека читає \`options.html\` з прототипу). Вразливими були \`lodash.merge\`/\`defaultsDeep\` (до 4.17.12+), \`jQuery.extend(true, ...)\`, \`hoek\` та ін.

**Захист (кілька шарів):**
- Блокувати \`__proto__\`, \`constructor\`, \`prototype\` і ходити лише по власних ключах (наше рішення).
- Об'єкти без прототипу для словників: \`Object.create(null)\` або \`Map\` замість об'єкта.
- Валідація вхідних даних за схемою (zod, JSON Schema з \`additionalProperties: false\`).
- \`Object.freeze(Object.prototype)\` (радикально, може зламати бібліотеки); прапор Node \`--disable-proto=delete\`.
- \`structuredClone\` для глибокого копіювання — не викликає сеттер \`__proto__\`.

**Складність:** O(n) від загальної кількості ключів. **Типові помилки:** \`for...in\` без \`hasOwn\`; блокування лише \`__proto__\` (забуто \`constructor.prototype\`); перевірка \`typeof === 'object'\`, яка зливає масиви, \`Date\` і \`Map\` як звичайні об'єкти.

**Що можуть спитати далі:** чи вразливий \`Object.assign({}, JSON.parse(input))\`? (Він не рекурсивний, тож \`Object.prototype\` не зачепить, але ключ \`__proto__\` викличе сеттер і змінить прототип **самого** цільового об'єкта — теж небезпечно.) Чи допоможе spread \`{ ...obj }\` (він створює власну властивість \`__proto__\`, без сеттера)? Як шукати такі вразливості (npm audit, Snyk, статичний аналіз)?
`
    },
    {
      id: 'sec-safe-redirect', group: "transport",
      type: 'code',
      level: 2,
      title: 'Захист від open redirect',
      tags: ['open-redirect', 'url'],
      description: `
**Завдання.** Після логіну користувача повертають на сторінку з параметра \`?returnTo=...\`. Якщо не перевіряти значення, \`https://bank.com/login?returnTo=https://bank-login.evil.com\` стане ідеальним фішинговим посиланням (**open redirect**).

**Де трапляється:** returnTo після логіну — класична фішингова пастка.

Напишіть \`getSafeRedirect(returnTo, currentOrigin, fallback = '/')\`:
- дозволяє лише адреси **того самого origin**, що й \`currentOrigin\` (абсолютні або відносні);
- повертає **відносний** шлях \`pathname + search + hash\` розв'язаного URL;
- у всіх інших випадках повертає \`fallback\`: інший origin, \`//evil.com\` (protocol-relative), \`/\\evil.com\` (браузер трактує \`\\\` як \`/\`), \`javascript:\`, URL з \`@\`, невалідні значення, не-рядки, порожній рядок.

\`\`\`js
getSafeRedirect('/orders?page=2', 'https://bank.com');      // '/orders?page=2'
getSafeRedirect('//evil.com/phish', 'https://bank.com');    // '/'
\`\`\`

**Як це працює:** Розбираємо returnTo через new URL відносно поточного origin. Якщо origin результату відрізняється від нашого — це зовнішній редирект, повертаємо fallback. Так ловляться і //evil.com, і схеми javascript:.
`,
      starter: `// План:
// 1. Не рядок або порожньо → fallback
// 2. new URL(returnTo, currentOrigin); помилка → fallback
// 3. Origin відрізняється від currentOrigin → fallback, інакше pathname + search + hash

function getSafeRedirect(returnTo, currentOrigin, fallback = '/') {
  // TODO
  return typeof returnTo === 'string' && returnTo.startsWith('/') ? returnTo : fallback;
}
`,
      solution: `function getSafeRedirect(returnTo, currentOrigin, fallback = '/') {
  if (typeof returnTo !== 'string' || returnTo === '') return fallback;

  let url;
  try {
    // Парсимо так само, як це зробить браузер при навігації
    url = new URL(returnTo, currentOrigin);
  } catch {
    return fallback;
  }

  if (url.origin !== new URL(currentOrigin).origin) return fallback;

  // Повертаємо лише шлях — навіть same-origin абсолютний URL зводимо до відносного
  return url.pathname + url.search + url.hash;
}
`,
      hints: [
        'Перевірка `startsWith(\'/\')` пропускає `//evil.com` і `/\\evil.com`. Не перевіряйте рядок — перевіряйте **результат парсингу**.',
        '`new URL(returnTo, currentOrigin)` розв\'яже відносні шляхи так само, як браузер. Далі порівняйте `url.origin` з origin поточного сайту.',
        'Поверніть `url.pathname + url.search + url.hash` — тоді результат гарантовано відносний.'
      ],
      tests: [
        { name: 'відносні шляхи того самого сайту', code: "expect(getSafeRedirect('/orders?page=2#top', 'https://bank.com')).toBe('/orders?page=2#top');\nexpect(getSafeRedirect('settings', 'https://bank.com')).toBe('/settings');" },
        { name: 'абсолютний same-origin URL → відносний шлях', code: "expect(getSafeRedirect('https://bank.com/a/b?x=1', 'https://bank.com')).toBe('/a/b?x=1');" },
        { name: 'інший origin → fallback', code: "['https://evil.com', 'http://bank.com/a', 'https://bank.com.evil.com/', 'https://bank.com:8443/'].forEach((u) => expect(getSafeRedirect(u, 'https://bank.com')).toBe('/'));" },
        { name: 'обхідні трюки: //, \\\\, пробіл, @, javascript:', code: "['//evil.com/phish', '/\\\\evil.com', '\\\\\\\\evil.com', ' //evil.com', 'https://bank.com@evil.com/', 'javascript:alert(1)', '\\t//evil.com'].forEach((u) => expect(getSafeRedirect(u, 'https://bank.com')).toBe('/'));" },
        { name: 'невалідні значення → кастомний fallback', code: "expect(getSafeRedirect('', 'https://bank.com', '/home')).toBe('/home');\nexpect(getSafeRedirect(null, 'https://bank.com', '/home')).toBe('/home');\nexpect(getSafeRedirect(['/a'], 'https://bank.com', '/home')).toBe('/home');\nexpect(getSafeRedirect('http://', 'https://bank.com', '/home')).toBe('/home');" }
      ],
      explanation: `
**Open redirect** сам по собі не дає доступу до даних, але:
- фішинг з довіреним доменом у посиланні (\`bank.com/login?returnTo=...\`), який проходить фільтри пошти і погляд користувача;
- **крадіжка OAuth-коду/токена**, якщо \`redirect_uri\` дозволяє ваш домен, а на ньому є open redirect;
- обхід allowlist-перевірок SSRF/CSP, що довіряють вашому домену;
- \`javascript:\`-редирект = XSS (якщо значення йде в \`location.href\`).

**Чому парсер, а не рядкові перевірки:** браузер трактує \`\\\` як \`/\` для http(s), вирізає табуляції й переноси, обрізає пробіли, а \`user@host\` робить \`user\` логіном. Будь-яка ручна логіка (\`startsWith('/')\`, \`includes('bank.com')\`, \`endsWith\`) має дірки. Складність O(n).

**Альтернативи:**
- Allowlist **маршрутів** або збереження \`returnTo\` на сервері (у сесії) замість передачі в URL.
- Підписаний параметр (HMAC), який не підробити.
- Проміжна сторінка «Ви залишаєте сайт» для зовнішніх посилань.

**Що можуть спитати далі:** як open redirect допомагає вкрасти OAuth-код? Чому \`url.includes('bank.com')\` — погана перевірка? Чи безпечно робити \`location.href = returnTo\` після вашої перевірки (так — результат завжди відносний шлях)?
`
    },
    {
      id: 'sec-quiz-noopener', group: "transport", why: ["Ні: сучасні браузери неявно ставлять noopener для _blank.","Ні: noopener важливий саме для чужих сайтів.","Ні: noreferrer ще й прибирає Referer.","Так: дефолт уже захищає, але явний rel — для старих браузерів і window.open."],
      type: 'quiz',
      level: 2,
      title: 'target="_blank" і reverse tabnabbing',
      tags: ['tabnabbing', 'html'],
      question: 'Що правда про `<a href="https://external.com" target="_blank">` та reverse tabnabbing у сучасних браузерах?',
      options: [
        'Відкрита сторінка завжди отримує `window.opener` і може змінити адресу вашої вкладки на фішингову',
        '`rel="noopener"` потрібен лише для посилань на той самий origin',
        '`noopener` і `noreferrer` — повні синоніми',
        'Сучасні браузери неявно застосовують `noopener` для `target="_blank"`, але `rel="noopener noreferrer"` варто писати явно, а у `window.open` передавати `\'noopener\'`'
      ],
      answer: 3,
      hint: 'Поведінку за замовчуванням змінили близько 2021 року, але не для всіх способів відкриття вікон.',
      explanation: `
**Reverse tabnabbing:** відкрита у новій вкладці сторінка через \`window.opener.location = 'https://bank-login.evil.com'\` тихо підміняє **вашу** вкладку на фішингову копію; користувач повертається і «перелогінюється».

- З 2021 року Chrome, Firefox і Safari трактують \`target="_blank"\` на \`<a>\`/\`<area>\`/\`<form>\` як \`rel="noopener"\` за замовчуванням. Але явний \`rel\` усе ще корисний: старі браузери/WebView, \`window.open(url)\` (тут \`opener\` **є**, якщо не передати \`'noopener'\` у третьому аргументі), а \`noreferrer\` ще й ховає \`Referer\`.
- «Завжди отримує opener» — застаріла поведінка.
- «Лише для same-origin» — навпаки, небезпечні саме зовнішні посилання (same-origin сторінка і так має повний доступ).
- \`noreferrer\` **включає** \`noopener\`, але додатково не надсилає \`Referer\` — не синоніми.

Додатково: заголовок \`Cross-Origin-Opener-Policy: same-origin\` розриває зв'язок з крос-доменними вікнами з вашого боку.
`
    },
    {
      id: 'sec-postmessage', group: "transport",
      type: 'code',
      level: 3,
      title: 'Безпечний обробник postMessage',
      tags: ['postmessage', 'origin'],
      description: `
**Завдання.** Віджет оплати у \`iframe\` надсилає батьківській сторінці повідомлення через \`postMessage\`. Будь-яке вікно (включно з \`evil.com\`, що відкрило вашу сторінку) може надіслати вам повідомлення, тож обробник має перевіряти відправника.

**Де трапляється:** iframe-віджети оплати, вбудовані сервіси, OAuth-попапи.

Напишіть \`createMessageHandler(allowedOrigins, onMessage)\` → функцію \`handleMessage(event)\` для \`window.addEventListener('message', ...)\`:
- При створенні: якщо \`allowedOrigins\` містить \`'*'\` або \`'null'\` — \`throw new Error(...)\` (небезпечна конфігурація).
- Обробляє подію, лише якщо \`event.origin\` **точно** дорівнює одному з дозволених (жодних \`includes\`/\`endsWith\`/регулярок).
- \`event.data\` має бути об'єктом з рядковим полем \`type\`; інакше подія ігнорується.
- Для валідної події викликає \`onMessage(event.data, event.origin)\` і повертає \`true\`; для проігнорованої — повертає \`false\`, \`onMessage\` не викликається.

**Як це працює:** Будь-яке вікно може надіслати повідомлення, тому спершу перевіряємо event.origin за точним білим списком (без * і 'null'), потім форму даних (об'єкт з рядковим type). Лише тоді передаємо далі.
`,
      starter: `// План:
// 1. Set дозволених origin; '*' або 'null' у списку → помилка одразу
// 2. Обробник: origin не в списку → false
// 3. data не об'єкт або без рядкового type → false; інакше onMessage(data, origin) і true

function createMessageHandler(allowedOrigins, onMessage) {
  // TODO
  return function handleMessage(event) {
    onMessage(event.data, event.origin);
    return true;
  };
}
`,
      solution: `function createMessageHandler(allowedOrigins, onMessage) {
  const allowed = new Set(allowedOrigins);
  if (allowed.has('*') || allowed.has('null')) {
    throw new Error('Wildcard and opaque origins are not allowed');
  }

  return function handleMessage(event) {
    // 1. Хто надіслав — точне порівняння origin
    if (!allowed.has(event.origin)) return false;

    // 2. Що надіслали — дані від іншого вікна завжди недовірені
    const data = event.data;
    if (!data || typeof data !== 'object' || typeof data.type !== 'string') return false;

    onMessage(data, event.origin);
    return true;
  };
}
`,
      hints: [
        'Тримайте дозволені origin у `Set` і перевіряйте `allowed.has(event.origin)` — це точне порівняння рядків.',
        'Після перевірки origin перевірте форму даних: `data && typeof data === \'object\' && typeof data.type === \'string\'`.'
      ],
      tests: [
        { name: 'дозволений origin і валідні дані', code: "const fn = mockFn();\nconst handle = createMessageHandler(['https://pay.example.com'], fn);\nexpect(handle({ origin: 'https://pay.example.com', data: { type: 'paid', id: 7 } })).toBe(true);\nexpect(fn).toHaveBeenCalledWith({ type: 'paid', id: 7 }, 'https://pay.example.com');" },
        { name: 'чужі та схожі origin ігноруються', code: "const fn = mockFn();\nconst handle = createMessageHandler(['https://pay.example.com'], fn);\n['https://evil.com', 'https://pay.example.com.evil.com', 'https://evilpay.example.com', 'http://pay.example.com', 'https://pay.example.com/', 'null'].forEach((origin) => {\n  expect(handle({ origin, data: { type: 'paid' } })).toBe(false);\n});\nexpect(fn).not.toHaveBeenCalled();" },
        { name: 'невалідні дані ігноруються', code: "const fn = mockFn();\nconst handle = createMessageHandler(['https://pay.example.com'], fn);\n['paid', null, undefined, 42, { type: 5 }, {}].forEach((data) => {\n  expect(handle({ origin: 'https://pay.example.com', data })).toBe(false);\n});\nexpect(fn).not.toHaveBeenCalled();" },
        { name: 'кілька дозволених origin', code: "const fn = mockFn();\nconst handle = createMessageHandler(['https://a.example.com', 'https://b.example.com'], fn);\nhandle({ origin: 'https://b.example.com', data: { type: 'x' } });\nexpect(fn).toHaveBeenCalledTimes(1);" },
        { name: 'wildcard і null при створенні — помилка', code: "expect(() => createMessageHandler(['*'], () => {})).toThrow();\nexpect(() => createMessageHandler(['https://a.com', 'null'], () => {})).toThrow();" }
      ],
      explanation: `
\`postMessage\` — легальний спосіб крос-доменної комунікації між вікнами (iframe-віджети оплати, OAuth-попапи, вбудовані редактори). Але **отримати** повідомлення може будь-хто, і **надіслати** — теж будь-хто, хто має посилання на ваше вікно (\`window.open\`, \`iframe\`, \`window.opener\`).

**Дві сторони безпеки:**
- **Отримання** — перевіряти \`event.origin\` **точно** (наше рішення) і валідувати \`event.data\` як недовірений ввід. Ніколи не передавати дані з повідомлення в \`innerHTML\`/\`eval\`/\`location\` — класичний DOM XSS.
- **Відправка** — вказувати конкретний \`targetOrigin\`: \`iframe.contentWindow.postMessage(msg, 'https://pay.example.com')\`. З \`'*'\` повідомлення (наприклад, токен) отримає будь-який документ, який на цей момент завантажений у фреймі — можливо, вже після редиректу на сторінку зловмисника.

**Чому не \`includes\`/\`endsWith\`:** \`'https://pay.example.com.evil.com'.includes('pay.example.com')\` — \`true\`; \`'https://evilpay.example.com'.endsWith('pay.example.com')\` — \`true\`. Чому заборонено \`'null'\`: такий origin мають sandbox-iframe та \`data:\`-URL, які зловмисник може створити будь-коли.

Складність — O(1) на подію.

**Що можуть спитати далі:** навіщо перевіряти ще й \`event.source\` (що повідомлення прийшло саме від нашого iframe)? Як безпечно передати токен з OAuth-попапа? Чим \`MessageChannel\` кращий для довготривалої комунікації?
`
    },
    {
      id: 'sec-secrets-bundle', group: "process", why: ["Ні: усе в бандлі публічне — ключ видно в DevTools.","Ні: VITE_* вбудовуються в бандл під час збірки.","Ні: ключ уже витік в історію і кеші — ротація обов'язкова.","Так: секрет лишається на сервері, браузер ходить через проксі/BFF."],
      type: 'theory',
      level: 2,
      title: 'Секрети у фронтенд-бандлі',
      tags: ['secrets', 'env', 'build'],
      question: 'Чи можна зберігати API-ключі у фронтенд-коді або змінних оточення Vite/Next.js? Як правильно працювати зі сторонніми API, які вимагають секретний ключ?',
      choices: [
        'Мініфікація й обфускація бандла достатньо приховують ключ від більшості користувачів і ботів',
        'Змінні `VITE_*` читаються в рантаймі із сервера, тому їхні значення ніколи не потрапляють у JS-бандл',
        'Якщо ключ видалили з коду й задеплоїли нову версію, ротувати його вже не обов\'язково',
        'Секретний ключ тримають на бекенді/BFF, а браузер звертається до стороннього API через ваш проксі'
      ],
      correct: 3,
      answer: `
**Головне правило:** усе, що потрапило в браузер, — **публічне**. Мінфікація й обфускація не захищають: бандл читається в DevTools → Sources, ключі знаходяться пошуком, а боти сканують GitHub і сайти в пошуках ключів автоматично.

**Як секрети потрапляють у бандл:**
- \`import.meta.env.VITE_*\` (Vite) і \`process.env.NEXT_PUBLIC_*\` (Next.js) **вбудовуються в код на етапі збірки**. Префікс існує саме для того, щоб явно позначити «це публічне». Змінні без префікса Vite у клієнтський код не передає.
- Source maps у продакшні — роздають оригінальний код з коментарями (і, можливо, захардкодженими значеннями).
- \`.env\` закомічений у git; секрети в історії git залишаються навіть після видалення файлу.
- Конфіги, захардкоджені URL внутрішніх сервісів, відповіді API з зайвими полями.

**Публічні vs секретні ключі:**
- **Публічні за задумом** (можна в бандл): Stripe publishable key, Firebase config, Google Maps key з обмеженням по HTTP referrer і API, Sentry DSN, ключі аналітики. Безпека забезпечується **обмеженнями на стороні провайдера** (домени, квоти, правила доступу Firebase Security Rules).
- **Секретні** (ніколи в бандл): Stripe secret key, ключі OpenAI/LLM-API, AWS credentials, токени БД, приватні ключі підпису JWT, SMTP-паролі.

**Як працювати із секретними API:**
- **Проксі на бекенді / BFF / serverless-функція**: браузер → \`/api/ai/chat\` (ваш сервер з автентифікацією користувача, rate limiting, валідацією) → сторонній API з секретом зі змінної оточення сервера.
- **Короткоживучі токени з обмеженими правами** (scoped tokens), які бекенд видає клієнту для прямого доступу (наприклад, pre-signed URL для завантаження в S3).
- Обмеження квот і бюджетів у провайдера — на випадок витоку.

**Якщо секрет витік:** негайно **ротувати** ключ (видалення з коду не допоможе — він уже в кеші CDN, архівах, git-історії), перевірити логи використання, налаштувати secret scanning (GitHub push protection, gitleaks, trufflehog) у CI.

**Пов'язане:** не віддавайте source maps публічно (завантажуйте їх у Sentry приватно), не логуйте токени в \`console\`, не кладіть персональні дані в URL (потраплять у логи, \`Referer\`, історію).
`,
      keyPoints: [
        'Усе в бандлі — публічне; обфускація не захищає',
        'VITE_ / NEXT_PUBLIC_ змінні вбудовуються в код при збірці',
        'Публічні ключі з обмеженнями провайдера vs секретні ключі',
        'Секретні API — лише через бекенд-проксі/BFF/serverless з автентифікацією і rate limiting',
        'Витік → ротація ключа; secret scanning; приватні source maps'
      ],
      followUps: ['Чи безпечно класти Firebase config у фронтенд?', 'Як дати користувачу завантажити файл у S3 без ключів AWS у браузері?', 'Чому видалення ключа з репозиторію не вирішує проблему витоку?']
    },
    {
      id: 'sec-supply-chain', group: "process", why: ["Так: install-скрипти — частий вектор атак.","Ні: популярні пакети теж зламують (event-stream, ua-parser-js).","Так: lockfile + npm ci дають відтворювані перевірені версії.","Ні: --force може поставити мажорні версії й зламати проєкт.","Ні: dependency confusion — підміна приватного пакета публічним з тим самим ім'ям."],
      type: 'theory',
      level: 3,
      title: 'Безпека ланцюга постачання (npm)',
      tags: ['supply-chain', 'npm', 'dependencies'],
      question: 'Які ризики несуть npm-залежності? Розкажіть про типові атаки на ланцюг постачання і як фронтенд-команда може від них захиститися. Оберіть **усі** правильні твердження.',
      choices: [
        '`postinstall`-скрипти залежностей виконуються під час `npm install` і можуть красти токени з `.npmrc`',
        'Достатньо ставити лише популярні пакети з мільйонами завантажень — їх неможливо скомпрометувати',
        'Lockfile у git + `npm ci` фіксують точні версії й integrity-хеші залежностей',
        '`npm audit fix --force` — безпечний спосіб закрити всі вразливості без ризику зламати збірку',
        'Dependency confusion — коли автор пакета випадково ламає зворотну сумісність у мінорній версії'
      ],
      correct: [0, 2],
      answer: `
Типовий фронтенд-проєкт має сотні прямих і тисячі транзитивних залежностей — і кожна виконує код **на машині розробника, у CI і в браузерах користувачів**.

**Вектори атак:**
- **Компрометація акаунта мейнтейнера** (фішинг, вкрадений токен) → публікація шкідливої версії популярного пакета. Реальні кейси: \`event-stream\` (2018), \`ua-parser-js\` (2021), у вересні 2025 — фішинг мейнтейнера \`chalk\`/\`debug\` (пакети з мільярдами завантажень: код підміняв адреси криптогаманців у браузері) і самопоширюваний черв'як **Shai-Hulud**, що крав npm/GitHub-токени і публікував заражені версії інших пакетів.
- **Typosquatting** — \`raect\`, \`lodahs\`, \`cross-env.js\`: схожі назви зі шкідливим кодом.
- **Dependency confusion** — публічний пакет з назвою вашого внутрішнього (\`@company/utils\` без зарезервованого scope) і вищою версією.
- **Install-скрипти** (\`preinstall\`/\`postinstall\`) виконуються під час \`npm install\` з правами розробника: крадуть \`.npmrc\`, SSH-ключі, змінні CI.
- **Protestware / свідомий саботаж** (\`colors\`/\`faker\`, \`node-ipc\`).
- **Компрометація CDN** зі сторонніми скриптами (\`polyfill.io\`, 2024).

**Захист:**
- **Lockfile** (\`package-lock.json\`/\`pnpm-lock.yaml\`) у git + \`npm ci\` у CI — точні версії й хеші integrity, без «тихих» оновлень.
- Обережні діапазони версій; оновлення через **Renovate/Dependabot** з рев'ю changelog, а не \`npm update\` всього.
- **Затримка на свіжі релізи**: шкідливі версії зазвичай виявляють за години–дні; pnpm має \`minimumReleaseAge\`, є аналоги в інших менеджерах.
- \`npm audit\` / Snyk / **Socket** (аналізує поведінку пакета: мережа, install-скрипти, обфускація), GitHub Dependabot alerts.
- Вимкнення install-скриптів за замовчуванням (\`ignore-scripts=true\`, у pnpm 10 скрипти залежностей не виконуються без явного дозволу).
- Перевірка перед додаванням: популярність, мейнтейнери, дата створення, чи потрібна залежність узагалі (\`is-odd\` можна не ставити).
- Scoped-пакети для внутрішніх бібліотек, приватний реєстр з налаштованим scope.
- Для публікації власних пакетів: 2FA, **trusted publishing** з CI (OIDC замість довгоживучих токенів), **npm provenance**.
- Мінімальні права токенів у CI; секрети не доступні на кроці встановлення залежностей.
- У браузері: SRI і self-hosting сторонніх скриптів, CSP як обмеження наслідків.

**npm audit — нюанс для співбесіди:** багато «critical» стосуються dev-залежностей (тестові утиліти), що не потрапляють у бандл; важливо вміти оцінити реальну експлуатованість, а не сліпо робити \`npm audit fix --force\` (може підняти мажорні версії й зламати збірку).
`,
      keyPoints: [
        'Залежності виконуються на машині розробника, у CI і в браузері',
        'Атаки: компрометація мейнтейнера, typosquatting, dependency confusion, install-скрипти; реальні кейси',
        'Lockfile + npm ci, контрольовані оновлення, затримка на свіжі релізи',
        'Сканери (npm audit, Snyk, Socket), ignore-scripts',
        'Публікація: 2FA, trusted publishing, provenance; SRI/self-hosting для CDN'
      ],
      followUps: ['Чим npm ci відрізняється від npm install?', 'Що таке dependency confusion і як від неї захиститися?', 'Як оцінити, чи справді вразливість з npm audit вас стосується?']
    },
    {
      id: 'sec-owasp', group: "process", why: ["Ні: прихована кнопка не захищає — API викличуть напряму.","Так: доступ перевіряє сервер на кожен запит.","Так: XSS — різновид ін'єкції у класифікації OWASP.","Ні: це рейтинг ризиків, оновлюється раз на кілька років.","Так: Math.random передбачуваний; для секретів — криптографічний генератор."],
      type: 'theory',
      level: 3,
      title: 'OWASP Top 10 з погляду фронтенду',
      tags: ['owasp'],
      question: 'Що таке OWASP Top 10? Назвіть категорії та поясніть, які з них стосуються фронтенд-розробника і що він може зробити. Оберіть **усі** правильні твердження.',
      choices: [
        'Broken Access Control закривається на фронтенді: досить приховати кнопку «Видалити» від користувача без прав',
        'Перевірки доступу мають виконуватися на сервері для кожного запиту, а не лише в UI',
        'XSS у редакціях 2021 і 2025 входить до категорії Injection разом із SQL-ін\'єкціями',
        'OWASP Top 10 — обов\'язковий стандарт сертифікації, який оновлюють щороку',
        'Для токенів і nonce використовують `crypto.getRandomValues`, а не `Math.random`'
      ],
      correct: [1, 2, 4],
      answer: `
**OWASP Top 10** — рейтинг найкритичніших ризиків безпеки веб-застосунків від спільноти OWASP, оновлюється раз на кілька років. Актуальна редакція — **2025** (у багатьох компаніях ще посилаються на 2021).

**OWASP Top 10:2025:**
1. **Broken Access Control** — користувач отримує доступ до чужих даних/дій (IDOR: \`/api/orders/124\` замість своїх \`123\`). Сюди ж тепер віднесено SSRF.
2. **Security Misconfiguration** — дефолтні паролі, відкриті адмінки, детальні стектрейси, відсутні заголовки безпеки, надто широкий CORS.
3. **Software Supply Chain Failures** — вразливі/шкідливі залежності, компрометація збірки та CI.
4. **Cryptographic Failures** — HTTP замість HTTPS, слабкі алгоритми, паролі без правильного хешування.
5. **Injection** — SQL/NoSQL/команди ОС і **XSS**.
6. **Insecure Design** — вразливості на рівні архітектури (немає rate limiting на відновлення пароля).
7. **Authentication Failures** — слабкі паролі, відсутність MFA, проблеми з сесіями, credential stuffing.
8. **Software or Data Integrity Failures** — неперевірені оновлення, скрипти з CDN без SRI, небезпечна десеріалізація.
9. **Security Logging & Alerting Failures** — атаку ніхто не помітив.
10. **Mishandling of Exceptional Conditions** — неправильна обробка помилок: «fail open», витік деталей у повідомленнях.

(У 2021: A01 Broken Access Control, A02 Cryptographic Failures, A03 Injection, A04 Insecure Design, A05 Security Misconfiguration, A06 Vulnerable and Outdated Components, A07 Identification and Authentication Failures, A08 Software and Data Integrity Failures, A09 Logging and Monitoring Failures, A10 SSRF.)

**Що з цього на фронтенді:**
- **Access control** — найважливіше розуміння: перевірки доступу **лише на сервері**. Приховати кнопку «Видалити» — UX, а не безпека; API має перевіряти права на кожен запит. Не довіряти ролям з \`localStorage\`/JWT payload на клієнті.
- **Injection/XSS** — контекстне екранування, уникання небезпечних sinks, санітизація, CSP, Trusted Types.
- **Misconfiguration** — заголовки безпеки (CSP, HSTS, \`X-Content-Type-Options: nosniff\`, \`Referrer-Policy\`, \`frame-ancestors\`, \`Permissions-Policy\`), не віддавати source maps і \`.env\`, вимкнені debug-режими в проді.
- **Supply chain / integrity** — lockfile, аудит залежностей, SRI, self-hosting.
- **Crypto** — лише HTTPS, не «шифрувати» нічого на клієнті самописним кодом, \`crypto.getRandomValues\` замість \`Math.random\` для токенів/nonce.
- **Authentication** — безпечне зберігання токенів, HttpOnly cookies, PKCE, коректний logout, захист форм від перебору (капча/rate limit на бекенді).
- **Exceptional conditions** — не показувати користувачу стектрейси й внутрішні повідомлення, коректно обробляти помилки мережі, не «пропускати» при помилці перевірки.
- **Logging** — фронтенд-моніторинг помилок (Sentry), CSP-звіти, без токенів і персональних даних у логах.

**Додатково варто знати:** OWASP ASVS (детальний стандарт перевірок), OWASP Cheat Sheet Series (XSS Prevention, CSRF Prevention), окремий OWASP Top 10 for LLM Applications (prompt injection) — актуально, якщо фронтенд інтегрує AI-фічі.
`,
      keyPoints: [
        'OWASP Top 10 — рейтинг ризиків; редакції 2021 і 2025',
        'Broken Access Control — №1: перевірки лише на сервері, приховування кнопок не є захистом',
        'Injection/XSS, Misconfiguration (заголовки безпеки), Supply chain',
        'Автентифікація, криптографія (HTTPS, getRandomValues), integrity (SRI)',
        'Обробка помилок і логування без витоку чутливих даних'
      ],
      followUps: ['Що таке IDOR і як його помітити, тестуючи фронтенд?', 'Які заголовки безпеки ви б налаштували для нового проєкту?', 'Чому Math.random не підходить для генерації токенів?']
    }
  ]
});
