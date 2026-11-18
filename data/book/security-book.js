FE.chapter('security-book', { body: `
Безпека фронтенду — це передусім XSS, CSRF, крадіжка токенів і залежності. Головне правило: **дані користувача — недовірені**, а браузер — середовище, яке атакують.

## XSS: sinks, екранування, санітизація

**XSS** — виконання чужого JS на вашій сторінці (крадіжка сесії, дії від імені користувача).
- **Stored** — шкідливий текст збережено на сервері (коментар) і показано іншим;
- **Reflected** — з параметра URL у відповідь;
- **DOM-based** — з \`location\`, \`postMessage\` тощо у небезпечний «sink» на клієнті.

**Небезпечні sinks:** \`innerHTML\`, \`outerHTML\`, \`insertAdjacentHTML\`, \`document.write\`, \`eval\`, \`new Function\`, \`setTimeout('рядок')\`, \`href\`/\`src\` з \`javascript:\`, атрибути-обробники.

Захист:
- текст — через \`textContent\` (фреймворки екранують за замовчуванням: \`{value}\` у JSX);
- HTML від користувача — лише після **санітизації** (DOMPurify);
- URL — перевіряти схему (\`http:\`, \`https:\`, \`mailto:\`); \`javascript:\` — ні;
- обережно з \`dangerouslySetInnerHTML\` і \`v-html\`;
- **Trusted Types** + CSP: браузер забороняє присвоювати рядки в sinks без «довіреного» типу.

## Content-Security-Policy

Заголовок, що каже браузеру, звідки можна виконувати скрипти й завантажувати ресурси — **друга лінія оборони** від XSS:
\`\`\`text
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-r4nd0m'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
\`\`\`
- \`'unsafe-inline'\` для скриптів зводить захист нанівець — замість нього **nonce** (випадковий на кожну відповідь) або hash;
- \`strict-dynamic\` — довіряти скриптам, які завантажив довірений скрипт;
- \`frame-ancestors\` — хто може вбудувати сторінку в iframe (захист від clickjacking);
- впроваджують через \`Content-Security-Policy-Report-Only\` зі звітами, потім вмикають.

## Cookies, CSRF, clickjacking

**CSRF** — чужий сайт змушує браузер відправити запит на ваш сайт **з cookies користувача** (форма з \`action="https://bank/transfer"\`). Захист:
- \`SameSite=Lax\` (за замовчуванням у браузерах) або \`Strict\` — cookie не йде з крос-сайтових POST;
- CSRF-токен у формі/заголовку, який чужий сайт не може прочитати;
- перевірка \`Origin\`; зміни стану — лише не-GET методами.

Атрибути сесійної cookie: \`HttpOnly\` (недоступна JS → XSS не вкраде), \`Secure\`, \`SameSite\`, префікс \`__Host-\`.

**Clickjacking** — вашу сторінку вбудовують у прозорий iframe, щоб користувач клікнув «не туди». Захист: \`frame-ancestors\` у CSP (сучасно) або \`X-Frame-Options: DENY\`.

## Автентифікація: сесії, JWT, OAuth

| | Сесія в cookie | JWT |
|---|---|---|
| Де стан | на сервері (id сесії в cookie) | у токені (підписані claims) |
| Відкликання | просто видалити сесію | складно до кінця строку (короткі access + refresh) |
| Ризики | CSRF (лікується SameSite/токеном) | де зберігати на клієнті |

JWT **підписаний, але не зашифрований** — не кладіть туди секрети. Типова схема для SPA: короткий access-токен у пам'яті + refresh-токен у \`HttpOnly\` cookie; або BFF (backend-for-frontend), де токени взагалі не потрапляють у браузер.

**OAuth 2.0 / OIDC** для SPA — **Authorization Code + PKCE** (Implicit flow застарів). \`state\` захищає від CSRF у редиректі. Вхід «через Google» — OIDC поверх OAuth.

## HTTPS, SRI, безпечний JS

- **HTTPS скрізь** + \`Strict-Transport-Security\` (HSTS) — браузер не піде по HTTP навіть за посиланням;
- **SRI** для скриптів з CDN: \`<script src="..." integrity="sha384-..." crossorigin>\` — підмінений файл не виконається;
- \`rel="noopener noreferrer"\` для \`target="_blank"\` на чужі сайти (сучасні браузери ставлять noopener за замовчуванням);
- **prototype pollution:** злиття об'єктів з JSON користувача може записати \`__proto__\` → перевіряйте ключі, \`Object.create(null)\`, \`Map\`;
- \`postMessage\`: перевіряйте \`event.origin\` і вказуйте \`targetOrigin\`.

## Секрети, залежності, OWASP

- **секретів у фронтенд-коді не буває**: усе, що в бандлі (\`VITE_*\`, \`NEXT_PUBLIC_*\`), — публічне. Приватні ключі API — лише на сервері;
- **залежності** — найбільша поверхня атаки: \`npm audit\`, Dependabot/Renovate, lock-файли, мінімум пакетів, перевірка популярності і підтримки; атаки на ланцюг постачання (typosquatting, зламані мейнтейнери);
- **OWASP Top 10** — список найпоширеніших вразливостей вебзастосунків (контроль доступу, ін'єкції, криптографічні помилки…). Фронтенд не замінює перевірок на сервері: **уся валідація й авторизація дублюються на бекенді**.

## Типові питання

- **Види XSS і захист?** Stored/Reflected/DOM; екранування, санітизація, CSP, Trusted Types.
- **Що таке CSRF і чому SameSite допомагає?**
- **Де зберігати токени у SPA?** Не localStorage; пам'ять + HttpOnly cookie або BFF.
- **JWT vs сесії?**
- **Навіщо CSP nonce замість unsafe-inline?**
- **Чи можна сховати API-ключ у фронтенді?** Ні.
`});
