FE.chapter('browser-api-book', { body: `
Браузер дає JavaScript десятки API поза мовою: сховища, мережа, історія, спостерігачі, воркери, потоки, графіка. Тут — те, що щодня потрібно у фронтенді, і нюанси, про які питають на співбесідах.

## Web Storage і cookies

| | localStorage | sessionStorage | cookie | IndexedDB |
|---|---|---|---|---|
| Час життя | доки не видалять | до закриття вкладки | \`Expires\`/\`Max-Age\` або сесія | доки не видалять |
| Обсяг | ~5 МБ на origin | ~5 МБ | ~4 КБ на cookie | сотні МБ (квота) |
| Іде на сервер | ні | ні | **так, з кожним запитом** | ні |
| API | синхронне, рядки | синхронне, рядки | рядок \`document.cookie\` | асинхронне, об'єкти, індекси |

- значення — **рядки**: \`JSON.stringify\` при записі, \`JSON.parse\` (в \`try\`) при читанні; \`getItem\` відсутнього ключа → \`null\`;
- подія \`storage\` спрацьовує в **інших** вкладках того самого origin — синхронізація між вкладками (або \`BroadcastChannel\`);
- **токени не в localStorage**: будь-який XSS їх прочитає; для сесії — cookie з \`HttpOnly; Secure; SameSite\`.

Атрибути cookie: \`Path\`, \`Domain\`, \`Expires/Max-Age\`, \`Secure\` (лише HTTPS), \`HttpOnly\` (недоступна з JS), \`SameSite=Lax|Strict|None\` (захист від CSRF; \`None\` вимагає \`Secure\`).

## URL і query-параметри

\`\`\`js
const url = new URL('/search?q=js&page=2', location.origin);
url.searchParams.get('page');        // '2'
url.searchParams.set('q', 'ліхтар'); // кодування автоматично
url.searchParams.append('tag', 'a'); // повторювані ключі
url.toString();
\`\`\`
\`URLSearchParams\` кодує пробіл як \`+\` (формат форм), а \`encodeURIComponent\` — як \`%20\`. Ручна склейка рядків — джерело багів з \`&\`, \`#\`, кирилицею.

## fetch, Response і FormData

\`\`\`js
const res = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(user),
});
if (!res.ok) throw new HttpError(res.status, await res.text());
const data = await res.json();
\`\`\`
- проміс \`fetch\` **відхиляється лише при мережевій помилці**; 404 і 500 — це успішні відповіді з \`ok: false\`;
- тіло читається **один раз** (\`res.clone()\` для повторного);
- з \`FormData\` **не ставте** \`Content-Type\` вручну — браузер додасть \`multipart/form-data; boundary=...\`;
- \`credentials: 'include'\` — надсилати cookie на інший origin (потрібна підтримка CORS сервером).

## Скасування, таймаути, повтори

\`\`\`js
const controller = new AbortController();
fetch(url, { signal: controller.signal });
controller.abort();                          // AbortError

fetch(url, { signal: AbortSignal.timeout(5000) });            // TimeoutError
fetch(url, { signal: AbortSignal.any([userSignal, AbortSignal.timeout(5000)]) });
\`\`\`
Повтори: лише для **ідемпотентних** запитів і тимчасових помилок (мережа, 429, 502–504), з **експоненційною затримкою і jitter**, з урахуванням \`Retry-After\`. Ніколи не повторюйте автоматично POST оплати без ключа ідемпотентності.

Скасування застарілих запитів — обов'язкове в автокомпліті й при переході між сторінками: інакше відповідь «старого» запиту перезапише нову (race condition).

## Роутинг: hash і History API

| | Hash (\`#/users/1\`) | History API (\`/users/1\`) |
|---|---|---|
| Сервер | нічого не потрібно | має віддавати \`index.html\` на всі шляхи (fallback) |
| Подія | \`hashchange\` | \`popstate\` (лише «Назад/Вперед», **не** на \`pushState\`) |
| SEO, гарні URL | гірше | так |

\`\`\`js
history.pushState(state, '', '/users/1'); // змінити URL без перезавантаження
window.addEventListener('popstate', (e) => render(location.pathname, e.state));
\`\`\`
Роутер SPA перехоплює кліки по внутрішніх \`<a>\` (делегування на document), викликає \`pushState\` і рендерить, не чіпаючи кліки з Ctrl/Cmd, \`target="_blank"\` і зовнішні посилання.

## IntersectionObserver

Асинхронно повідомляє, коли елемент перетинає viewport (або контейнер) — без обробника \`scroll\` і без читання геометрії:
\`\`\`js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) loadMore();
}, { rootMargin: '200px' });
io.observe(sentinel);
\`\`\`
Застосування: нескінченна прокрутка (sentinel у кінці списку), lazy loading, аналітика переглядів, анімації при появі. **Родичі:** \`ResizeObserver\` (зміна розміру елемента — адаптивні компоненти), \`MutationObserver\` (зміни DOM). Не забувайте \`disconnect()\` при знищенні компонента.

## Таймінги, життєвий цикл сторінки, файли

- \`performance.now()\` — монотонний час з мікросекундною точністю для вимірювань; \`Date.now()\` може «стрибати» при зміні системного часу;
- \`requestAnimationFrame\` — перед наступним кадром (анімації); \`requestIdleCallback\` — у вільний час (некритична робота);
- **життєвий цикл:** \`DOMContentLoaded\` (DOM готовий) → \`load\` (усі ресурси) → \`visibilitychange\` (вкладка прихована — найнадійніший момент зберегти дані й надіслати аналітику через \`navigator.sendBeacon\`) → \`pagehide\`. \`unload\` ненадійний і шкодить bfcache;
- **файли:** \`<input type="file">\` → \`File\` (це \`Blob\`); прев'ю — \`URL.createObjectURL(file)\` (і \`revokeObjectURL\` потім); читання — \`await file.text()\` / \`arrayBuffer()\`; завантаження згенерованого файлу — \`Blob\` + \`<a download>\`.

## Web Workers і postMessage

Воркер — окремий потік без доступу до DOM: важкі обчислення (парсинг великого JSON, обробка зображень, пошук) не блокують інтерфейс.
\`\`\`js
const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
worker.postMessage({ type: 'parse', text });
worker.onmessage = (e) => render(e.data);
\`\`\`
- дані **копіюються** structured clone (функції, DOM-вузли не передаються); великі буфери — **transferable** (\`postMessage(msg, [buffer])\`) без копіювання;
- види: Dedicated, Shared (спільний для вкладок), **Service Worker** (проксі мережі, офлайн, push — окрема модель життєвого циклу);
- поверх \`postMessage\` будують RPC з id запитів (бібліотека Comlink).

## Потоки, Canvas і підтримка можливостей

**Streams:** \`response.body\` — \`ReadableStream\`; читання частинами дає прогрес завантаження і обробку даних до кінця відповіді. Текст декодують \`TextDecoder\` з \`{ stream: true }\`, бо символ UTF-8 може розірватися між частинами.

**Canvas vs SVG:** canvas — растр без DOM (тисячі об'єктів, анімація, ігри), SVG — векторний DOM (іконки, діаграми, стилізація CSS, доступність). Для Retina canvas масштабують на \`devicePixelRatio\`.

**Feature detection:** перевіряйте можливість, а не браузер — \`'share' in navigator\`, \`CSS.supports()\`, \`@supports\`. **Progressive enhancement:** база працює всюди, покращення — де підтримуються.

## Типові питання

- **localStorage vs sessionStorage vs cookie?** Час життя, обсяг, чи йде на сервер, доступ з JS.
- **Чому fetch не відхиляє проміс на 404?** HTTP-помилка — це відповідь; перевіряйте \`res.ok\`.
- **Як скасувати запит?** \`AbortController\`; таймаут — \`AbortSignal.timeout\`.
- **Чим pushState відрізняється від hash-роутингу?** URL, сервер, події.
- **Навіщо IntersectionObserver замість scroll?** Асинхронно, без forced reflow, з rootMargin.
- **Що можна передати у воркер?** Structured clone; transferable для буферів; не функції й не DOM.
`});
