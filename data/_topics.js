/*
 * Структура навчання: КУРСИ → МОДУЛІ (теми) → кроки (groups у файлі модуля) → завдання.
 * Модуль наповнюється у data/<id>.js через FE.topic('<id>', { intro, groups, items }).
 *
 * Додати технологію (TypeScript, React, …):
 *   1. прибрати status: 'soon' у курсу і перелічити його модулі в topics;
 *   2. створити data/<module>.js для кожного модуля;
 *   3. якщо потрібне нове середовище виконання (компіляція TS, JSX) — зареєструвати його у FERunner.runtimes.
 * Порядок курсів і модулів — це рекомендований навчальний шлях (на нього спирається tools/check-prereqs.js).
 */
FE.defineSections([
  {
    id: 'html',
    title: 'HTML',
    icon: '<>',
    color: '#e8590c',
    about: 'Розмітка: структура документа, семантика, медіа, форми.',
    topics: [
      { id: 'html', title: 'HTML: семантика, форми, SEO', short: 'HTML', about: 'Семантичні теги, структура документа, форми та валідація, meta, зображення, SEO-основи.' }
    ]
  },
  {
    id: 'css',
    title: 'CSS',
    icon: '#',
    color: '#3b82f6',
    about: 'Каскад, box model, Flexbox, Grid, позиціонування, адаптивність, анімації.',
    topics: [
      { id: 'css-basics', title: 'CSS: селектори, каскад, box model', short: 'CSS основи', about: 'Селектори, специфічність, каскад та успадкування, box model, одиниці, display, псевдокласи/елементи.' },
      { id: 'css-layout', title: 'Flexbox, Grid, адаптивність', short: 'Flexbox та Grid', about: 'Flexbox, Grid, вирівнювання, адаптивна верстка, media та container queries, mobile-first.' },
      { id: 'css-advanced', title: 'CSS: позиціонування, анімації, сучасний CSS', short: 'CSS просунутий', about: 'position, stacking context, z-index, BFC, transitions/animations, custom properties, :has, @layer, nesting.' }
    ]
  },
  {
    id: 'js-core',
    title: 'JavaScript',
    icon: 'JS',
    color: '#d4a106',
    about: 'Мова від перших кроків до асинхронності й функціонального стилю.',
    topics: [
      { id: 'js-start', title: 'Перші кроки в JavaScript', short: 'Перші кроки', about: 'Змінні, умови, цикли, функції, масиви, об\'єкти і перші класи — прості задачі для розгону.' },
      { id: 'js-types', title: 'Типи даних і приведення типів', short: 'Типи та приведення', about: 'Примітиви, typeof, == vs ===, truthy/falsy, NaN, Object.is, явне та неявне приведення.' },
      { id: 'js-strings-numbers', title: 'Рядки, числа, Date, RegExp', short: 'Рядки, числа, RegExp', about: 'Методи рядків, Unicode, точність float, BigInt, Math, Intl, Date, регулярні вирази.' },
      { id: 'js-scope', title: 'Змінні, scope, hoisting, TDZ', short: 'Scope та hoisting', about: 'var/let/const, лексичне оточення, підняття, TDZ, блокова область видимості.' },
      { id: 'js-functions', title: 'Функції та замикання', short: 'Функції та замикання', about: 'Function declaration/expression, стрілкові, замикання, IIFE, HOF, рекурсія, arguments.' },
      { id: 'js-objects', title: 'Об\'єкти', short: 'Об\'єкти', about: 'Копіювання (shallow/deep), дескриптори, геттери/сеттери, freeze/seal, Object API, порівняння.' },
      { id: 'js-arrays', title: 'Масиви та їх методи', short: 'Масиви', about: 'map/filter/reduce/sort/flat, мутуючі vs немутуючі методи, поліфіли, sparse arrays, сортування.' },
      { id: 'js-modern', title: 'Сучасний JavaScript (ES6+)', short: 'ES6+', about: 'Деструктуризація, spread/rest, Symbol, ітератори, генератори, Map/Set/WeakMap, Proxy/Reflect, ?. та ??.' },
      { id: 'js-this', title: 'this, call / apply / bind', short: 'this та bind', about: 'Правила визначення this, втрата контексту, call/apply/bind, стрілкові функції, поліфіл bind.' },
      { id: 'js-prototypes', title: 'Прототипи, класи, наслідування', short: 'Прототипи та класи', about: '[[Prototype]], __proto__ vs prototype, new, class, extends/super, приватні поля, static, instanceof.' },
      { id: 'js-errors', title: 'Обробка помилок', short: 'Помилки', about: 'try/catch/finally, типи помилок, кастомні помилки, cause, помилки в async-коді, глобальні обробники.' },
      { id: 'js-async', title: 'Асинхронність: Event Loop, Promise, async/await', short: 'Event Loop та Promise', about: 'Event loop, мікро/макрозадачі, Promise API, async/await, поліфіли Promise.*, конкурентність, скасування.' },
      { id: 'js-fp', title: 'Функціональне програмування', short: 'Функціональний стиль', about: 'Чисті функції, іммутабельність, compose/pipe, каррінг, часткове застосування, мемоізація.' }
    ]
  },
  {
    id: 'browser',
    title: 'Браузер і DOM',
    icon: '◧',
    color: '#0ca678',
    about: 'DOM, події, Browser API, рендеринг і доступність.',
    topics: [
      { id: 'dom', title: 'DOM: пошук, обхід, маніпуляції', short: 'DOM', about: 'querySelector, обхід дерева, створення/видалення вузлів, атрибути vs властивості, DocumentFragment, dataset, classList.' },
      { id: 'events', title: 'Події', short: 'Події', about: 'Bubbling/capturing, делегування, preventDefault/stopPropagation, passive, once, CustomEvent, клавіатура та форми.' },
      { id: 'web-components', title: 'Web Components: Custom Elements і Shadow DOM', short: 'Web Components', about: 'Власні теги, життєвий цикл, Shadow DOM, слоти, :host і ::part, події через межу shadow root, template, місце серед фреймворків.' },
      { id: 'browser-api', title: 'Browser API', short: 'Browser API', about: 'localStorage/sessionStorage/cookies/IndexedDB, fetch, AbortController, History API, Observers, Web Workers, rAF.' },
      { id: 'rendering', title: 'Як браузер рендерить сторінку', short: 'Рендеринг', about: 'Critical rendering path, DOM/CSSOM, layout/paint/composite, reflow, async/defer, layout thrashing.' },
      { id: 'a11y', title: 'Доступність (a11y)', short: 'Доступність', about: 'Семантика, ARIA, фокус і клавіатура, контраст, screen readers, доступні форми та модалки.' }
    ]
  },
  {
    id: 'engine',
    title: 'Рушій JS (V8)',
    icon: 'V8',
    color: '#7048e8',
    about: 'Що відбувається з вашим кодом всередині рушія: JIT, пам\'ять, GC, оптимізації.',
    topics: [
      { id: 'v8', title: 'Як працює рушій JavaScript (V8)', short: 'Рушій V8', about: 'Парсинг і байткод, JIT-компілятори, hidden classes та inline caches, пам\'ять і збирання сміття, event loop рушія і браузера.' }
    ]
  },
  {
    id: 'web',
    title: 'Мережа, безпека, продуктивність',
    icon: '⇄',
    color: '#1098ad',
    about: 'HTTP, кешування, CORS, безпека фронтенду, Web Vitals.',
    topics: [
      { id: 'network', title: 'HTTP, REST, CORS, кешування', short: 'Мережа та HTTP', about: 'HTTP методи та статуси, заголовки, кешування, CORS, cookies, HTTP/2/3, WebSocket, SSE, REST vs GraphQL.' },
      { id: 'security', title: 'Безпека фронтенду', short: 'Безпека', about: 'XSS, CSRF, CSP, clickjacking, SameSite, автентифікація (сесії, JWT), зберігання токенів, OWASP.' },
      { id: 'performance', title: 'Продуктивність і Web Vitals', short: 'Продуктивність', about: 'LCP/INP/CLS, lazy loading, code splitting, кешування, витоки пам\'яті, оптимізація рендерингу та JS.' }
    ]
  },
  {
    id: 'engineering',
    title: 'Інженерні практики',
    icon: '⚙',
    color: '#868e96',
    about: 'Git, npm, бандлери, тестування, патерни проєктування.',
    topics: [
      { id: 'tooling', title: 'Інструменти: Git, npm, модулі, бандлери', short: 'Інструменти', about: 'Git, npm/semver, ESM vs CommonJS, бандлери (Vite, webpack), Babel, tree shaking, лінтери, CI.' },
      { id: 'node-overview', title: 'Як працює Node.js (огляд для фронтенду)', short: 'Node.js: як працює', about: 'V8 і libuv, пул потоків, фази event loop, nextTick і setImmediate, резолюція модулів, require(esm) і type stripping, streams, worker_threads, Node в інструментах і SSR. Без написання серверів.' },
      { id: 'testing', title: 'Тестування', short: 'Тестування', about: 'Піраміда тестів, unit/integration/e2e, моки та стаби, TDD, тестування асинхронного коду та DOM.' },
      { id: 'patterns', title: 'Патерни проєктування та архітектура', short: 'Патерни', about: 'SOLID, DRY/KISS, Observer, Pub/Sub, Singleton, Factory, Strategy, Decorator, Middleware, State machine.' },
      { id: 'architecture', title: 'Архітектура застосунку і frontend system design', short: 'Архітектура і system design', about: 'CSR/SSR/SSG/ISR і гідратація, види стану, нормалізація, оптимістичні оновлення, віртуалізація, метод RADIO і кейси: стрічка, автокомпліт, чат, дизайн-система, мікрофронтенди.' }
    ]
  },
  {
    id: 'projects',
    title: 'Проєкти: збираємо знання докупи',
    icon: '★',
    color: '#f59e0b',
    about: 'Наскрізні проєкти, де знання з усіх курсів працюють разом: свій React-подібний фреймворк, бандлер (як webpack) і тест-раннер (як Jest). Кожен крок починається з коду попереднього.',
    topics: [
      { id: 'mini-framework', title: 'Проєкт: свій міні-фреймворк (як React)', short: 'Свій міні-фреймворк', about: 'h() і віртуальний DOM, createElement, diff/patch, стан і пакетний рендер, useState за порядком викликів, ключі у списках, як влаштовані React і фреймворки на сигналах.' },
      { id: 'mini-bundler', title: 'Проєкт: свій бандлер (як webpack)', short: 'Свій бандлер', about: 'Парсинг імпортів, розв\'язання шляхів, граф залежностей (BFS), пошук циклів (DFS), перетворення ESM у CommonJS, бандл з рантаймом require і кешем, live bindings, як працюють Vite, Rollup, esbuild.' },
      { id: 'mini-test-runner', title: 'Проєкт: свій тест-раннер (як Jest/Vitest)', short: 'Свій тест-раннер', about: 'Матчери з .not, describe/test і збір, async-запуск і звіт, хуки з порядком вкладеності, моки, only/skip і тайм-аути через Promise.race, як влаштовані Jest і Vitest.' }
    ]
  },
  {
    id: 'algo',
    title: 'Алгоритми та live coding',
    icon: 'λ',
    color: '#e64980',
    about: 'Big O, структури даних, класичні алгоритми і задачі live coding.',
    topics: [
      { id: 'algo-basics', title: 'Big O, масиви, рядки, хеш-таблиці', short: 'Алгоритми: база', about: 'Складність, хеш-мапи, два вказівники, sliding window, префіксні суми, робота з рядками.' },
      { id: 'algo-structures', title: 'Структури даних', short: 'Структури даних', about: 'Стек, черга, зв\'язний список, дерева, BST, купа, графи, BFS/DFS, trie.' },
      { id: 'algo-advanced', title: 'Рекурсія, сортування, пошук, DP', short: 'Алгоритми: просунуті', about: 'Рекурсія та backtracking, сортування, бінарний пошук, динамічне програмування, жадібні алгоритми.' },
      { id: 'livecoding', title: 'Live coding: класика співбесід', short: 'Live coding', about: 'debounce, throttle, deepClone, deepEqual, EventEmitter, Promise.all, curry, LRU, get/set by path, render і багато іншого.' }
    ]
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    icon: 'TS',
    color: '#3178c6',
    about: 'Типи з перевіркою справжнім компілятором (tsc --strict): від анотацій і звуження до generics, умовних і mapped-типів, розрізнюваних об\'єднань і типізації API.',
    topics: [
      { id: 'ts-basics', title: 'Основи TypeScript', short: 'TS: основи', about: 'Анотації й виведення, об\'єкти, кортежі, об\'єднання і звуження, функції, interface vs type, enum vs as const, any/unknown/never, satisfies.' },
      { id: 'ts-generics', title: 'Generics і перетворення типів', short: 'TS: generics і типи', about: 'Generic-функції й обмеження, keyof/typeof/індексний доступ, утилітні типи, mapped, умовні типи й infer, template literal types.' },
      { id: 'ts-practice', title: 'TypeScript на практиці', short: 'TS: практика', about: 'Розрізнювані об\'єднання, type guards, класи, типізація API і стану, DOM і події, branded-типи, tsconfig, d.ts, міграція з JS.' }
    ]
  },
  {
    id: 'react',
    title: 'React',
    icon: '⚛',
    color: '#149eca',
    about: 'React 19 від нуля до Strong Middle: компоненти, стан, хуки, ефекти, рендеринг і продуктивність, патерни, Suspense і Actions, екосистема — з аналогіями до вже вивченого JS і власного міні-фреймворку.',
    topics: [
      { id: 'react-basics', title: 'React: компоненти, стан, події', short: 'React: основи', about: 'JSX, props, children, списки й ключі, useState як знімок, іммутабельні оновлення, контрольовані форми, підйом стану і похідні значення.' },
      { id: 'react-hooks', title: 'React: хуки й ефекти', short: 'React: хуки', about: 'useEffect і cleanup, завантаження даних і гонки, useRef, useReducer, Context, власні хуки, застарілі замикання і правила хуків.' },
      { id: 'react-advanced', title: 'React глибше: рендеринг, продуктивність, патерни, React 19', short: 'React: глибше', about: 'Коли і чому рендер, ключі й позиція стану, memo/useMemo/useCallback і Compiler, compound components, портали, межі помилок, Suspense і transitions, Actions, useOptimistic, use.' },
      { id: 'react-ecosystem', title: 'Екосистема React: стан, дані, роутинг, тести, Next.js', short: 'React: екосистема', about: 'Свій стор на useSyncExternalStore, кеш запитів як у TanStack Query, потокова відповідь ШІ, роутер, getByRole, React Hook Form і Zod, TypeScript у React, стилі, SSR/SSG, Server Components.' }
    ]
  },
  {
    id: 'vue',
    title: 'Vue',
    icon: 'V',
    color: '#42b883',
    about: 'Vue 3 від нуля до Strong Middle: однофайлові компоненти, реактивність на Proxy, Composition API, composables, Pinia, Vue Router, тести і Nuxt — з опорою на вже вивчений JS. Порівняння з React довідкові: якщо React ви не проходили, курс зрозумілий і без них.',
    topics: [
      { id: 'vue-basics', title: 'Vue: шаблони, реактивність, компоненти', short: 'Vue: основи', about: 'Однофайлові компоненти, ref/reactive/computed, директиви v-if/v-show/v-for, форми і v-model, props, emits, слоти, fallthrough-атрибути.' },
      { id: 'vue-composition', title: 'Vue: Composition API, життєвий цикл, composables', short: 'Vue: Composition API', about: 'watch і watchEffect, onWatcherCleanup, хуки життєвого циклу, template refs, composables у окремих файлах, provide/inject, Teleport, KeepAlive, власна реактивність на Proxy.' },
      { id: 'vue-ecosystem', title: 'Екосистема Vue: Pinia, Router, тести, Nuxt', short: 'Vue: екосистема', about: 'Своя Pinia і storeToRefs, свій роутер з guards, Vue Test Utils і Vitest, TypeScript у SFC, міграція з Options API і Vue 2, Nuxt і SSR, порівняння Vue та React.' }
    ]
  },
  {
    id: 'capstone',
    title: 'Фінальний проєкт: тестове завдання',
    icon: '◆',
    color: '#a855f7',
    about: 'Застосунок, як у take-home від компанії: «Дошка задач команди» на TypeScript + React або Vue. Перевірка даних з API, клієнт з помилками й скасуванням, кеш запитів, пошук з debounce без гонок, доступна форма, оптимістичні оновлення — і чекліст перед здачею. Кожен крок починається з коду попереднього.',
    topics: [
      { id: 'capstone-core', title: 'Проєкт, частина 1: дані, API і кеш на TypeScript', short: 'Проєкт: дані й API', about: 'Типи й парсер відповіді без any, API-клієнт з ApiError і скасуванням, кеш запитів з дедуплікацією та інвалідацією — шар, на якому стоїть інтерфейс.' },
      { id: 'capstone-react', framework: 'react', title: 'Проєкт, частина 2: інтерфейс на React + TypeScript', short: 'Проєкт: UI на React', about: 'Дошка з фільтрами, debounce і захистом від гонок, доступна форма з валідацією, оптимістична зміна статусу з відкатом. TSX перевіряє справжній tsc.' },
      { id: 'capstone-vue', framework: 'vue', title: 'Проєкт, частина 2: інтерфейс на Vue + TypeScript', short: 'Проєкт: UI на Vue', about: 'Те саме на Vue 3: composable для debounce, onWatcherCleanup для скасування, доступна форма, оптимістичне оновлення. <script setup lang="ts"> перевіряє справжній tsc.' },
      { id: 'capstone-delivery', title: 'Проєкт, частина 3: здача і захист рішення', short: 'Проєкт: здача і захист', about: 'Що перевіряє рев\'юер тестового завдання, як розставити пріоритети за обмежений час, README з компромісами і як захищати рішення на технічній співбесіді.' }
    ]
  },
  {
    id: 'backend',
    title: 'Бекенд: Node.js, API, бази даних',
    icon: 'N',
    color: '#5fa04e',
    status: 'soon',
    area: 'backend',
    about: 'Окремий великий розділ: серверний JavaScript, HTTP-сервери, API, бази даних.',
    topics: []
  }
]);
