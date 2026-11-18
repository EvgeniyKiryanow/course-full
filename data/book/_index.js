/*
 * Підручник: частини → розділи. Текст розділу — у data/book/<id>.js через FE.chapter(id, { body }).
 * topics — пов'язані теми тренажера (кнопка «Практика»).
 */
FE.bookParts = [
  {
    id: 'html',
    title: 'HTML',
    about: 'Документ, семантика, форми і валідація, зображення й медіа, таблиці, dialog і popover, SEO.',
    chapters: [
      { id: 'html-book', title: 'HTML: від документа до SEO', topics: ['html'] }
    ]
  },
  {
    id: 'css',
    title: 'CSS',
    about: 'Селектори і каскад, box model, Flexbox і Grid, адаптивність, позиціонування, анімації, теми й архітектура стилів.',
    chapters: [
      { id: 'css-basics-book', title: 'Основи CSS: селектори, каскад, box model, одиниці', topics: ['css-basics'] },
      { id: 'css-layout-book', title: 'Розкладка: Flexbox, Grid, адаптивність', topics: ['css-layout'] },
      { id: 'css-advanced-book', title: 'Поглиблений CSS: позиціонування, анімації, сучасні можливості', topics: ['css-advanced'] }
    ]
  },
  {
    id: 'js',
    title: 'JavaScript',
    about: 'Мова від перших кроків до асинхронності й функціонального стилю — те, що питають на кожній співбесіді.',
    chapters: [
      { id: 'js-start-book', title: 'Перші кроки: умови, цикли, масиви, об\'єкти, класи', topics: ['js-start'] },
      { id: 'js-types-book', title: 'Типи і приведення', topics: ['js-types'] },
      { id: 'js-strings-book', title: 'Рядки, числа, Intl, Date, RegExp', topics: ['js-strings-numbers'] },
      { id: 'js-scope-book', title: 'Область видимості, hoisting, TDZ', topics: ['js-scope'] },
      { id: 'js-functions-book', title: 'Функції і замикання', topics: ['js-functions'] },
      { id: 'js-objects-book', title: 'Об\'єкти', topics: ['js-objects'] },
      { id: 'js-arrays-book', title: 'Масиви', topics: ['js-arrays'] },
      { id: 'js-modern-book', title: 'Сучасний JS: деструктуризація, Map/Set, ітератори, Proxy', topics: ['js-modern'] },
      { id: 'js-this-book', title: 'this, call, apply, bind', topics: ['js-this'] },
      { id: 'js-prototypes-book', title: 'Прототипи і класи', topics: ['js-prototypes'] },
      { id: 'js-errors-book', title: 'Помилки і налагодження', topics: ['js-errors'] },
      { id: 'js-async-book', title: 'Асинхронність: event loop, Promise, async/await', topics: ['js-async'] },
      { id: 'js-fp-book', title: 'Функціональне програмування', topics: ['js-fp'] }
    ]
  },
  {
    id: 'browser',
    title: 'Браузер',
    about: 'DOM, події, Browser API, рендеринг, доступність і Web Components — платформа, на якій працює будь-який фреймворк.',
    chapters: [
      { id: 'dom-book', title: 'DOM', topics: ['dom'] },
      { id: 'events-book', title: 'Події', topics: ['events'] },
      { id: 'browser-api-book', title: 'Browser API: сховища, fetch, роутинг, спостерігачі, воркери', topics: ['browser-api'] },
      { id: 'rendering-book', title: 'Рендеринг: від HTML до пікселів', topics: ['rendering'] },
      { id: 'a11y-book', title: 'Доступність (a11y)', topics: ['a11y'] },
      { id: 'web-components-book', title: 'Web Components', topics: ['web-components'] }
    ]
  },
  {
    id: 'engine',
    title: 'Рушій JS (V8)',
    about: 'Як рушій компілює код, керує пам\'яттю і чому одні патерни швидші за інші.',
    chapters: [
      { id: 'js-engine-book', title: 'Рушій V8: компіляція, пам\'ять, збирання сміття', topics: ['v8'] }
    ]
  },
  {
    id: 'web',
    title: 'Мережа, безпека, продуктивність',
    about: 'Що відбувається між запитом і відповіддю, як захистити застосунок і як зробити його швидким.',
    chapters: [
      { id: 'network-book', title: 'Мережа: HTTP, кешування, CORS, API', topics: ['network'] },
      { id: 'security-book', title: 'Безпека фронтенду', topics: ['security'] },
      { id: 'performance-book', title: 'Продуктивність і Core Web Vitals', topics: ['performance'] }
    ]
  },
  {
    id: 'engineering',
    title: 'Інженерні практики',
    about: 'Git, збірка, тести, патерни й архітектура — як роблять продукт у команді.',
    chapters: [
      { id: 'tooling-book', title: 'Інструменти: Git, npm, модулі, збірка, CI', topics: ['tooling'] },
      { id: 'node-overview-book', title: 'Як працює Node.js', topics: ['node-overview'] },
      { id: 'testing-book', title: 'Тестування', topics: ['testing'] },
      { id: 'patterns-book', title: 'Патерни проєктування', topics: ['patterns'] },
      { id: 'architecture-book', title: 'Архітектура і frontend system design', topics: ['architecture'] }
    ]
  },
  {
    id: 'algo',
    title: 'Алгоритми та live coding',
    about: 'Складність, патерни задач, структури даних, DP і практичні задачі фронтенд-співбесід.',
    chapters: [
      { id: 'algo-basics-book', title: 'Алгоритми: складність і базові патерни', topics: ['algo-basics'] },
      { id: 'algo-structures-book', title: 'Структури даних', topics: ['algo-structures'] },
      { id: 'algo-advanced-book', title: 'Рекурсія, сортування, бінарний пошук, DP', topics: ['algo-advanced'] },
      { id: 'livecoding-book', title: 'Live coding на фронтенд-співбесіді', topics: ['livecoding'] }
    ]
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    about: 'Типи від основ до generics, умовних і mapped-типів, і як TypeScript використовують у реальному фронтенді.',
    chapters: [
      { id: 'ts-basics-book', title: 'Основи TypeScript', topics: ['ts-basics'] },
      { id: 'ts-generics-book', title: 'Generics і перетворення типів', topics: ['ts-generics'] },
      { id: 'ts-practice-book', title: 'TypeScript на практиці', topics: ['ts-practice'] }
    ]
  },
  {
    id: 'react',
    title: 'React',
    about: 'React від компонентів до рендерингу, продуктивності, React 19 і екосистеми: стан, дані, роутинг, тести, Next.js. З аналогіями до JavaScript і міні-фреймворку.',
    chapters: [
      { id: 'react-basics-book', title: 'React: компоненти, стан, події', topics: ['react-basics'] },
      { id: 'react-hooks-book', title: 'React: хуки й ефекти', topics: ['react-hooks'] },
      { id: 'react-advanced-book', title: 'React глибше: рендеринг, продуктивність, React 19', topics: ['react-advanced'] },
      { id: 'react-ecosystem-book', title: 'Екосистема React: стан, дані, роутинг, тести, Next.js', topics: ['react-ecosystem'] }
    ]
  },
  {
    id: 'vue',
    title: 'Vue',
    about: 'Vue 3 від шаблонів і реактивності до Composition API, composables, Pinia, Vue Router, тестів і Nuxt. Порівняння з React довідкові — курс зрозумілий і без React.',
    chapters: [
      { id: 'vue-basics-book', title: 'Vue: шаблони, реактивність, компоненти', topics: ['vue-basics'] },
      { id: 'vue-composition-book', title: 'Vue: Composition API, життєвий цикл, composables', topics: ['vue-composition'] },
      { id: 'vue-ecosystem-book', title: 'Екосистема Vue: Pinia, Router, тести, Nuxt', topics: ['vue-ecosystem'] }
    ]
  },
  {
    id: 'projects',
    title: 'Проєкти',
    about: 'Наскрізні проєкти: як влаштовані фреймворки, роутери, сховища, бандлери і тест-раннери зсередини.',
    chapters: [
      { id: 'mini-framework-book', title: 'Як працюють фреймворки: VDOM, diff, хуки, ключі', topics: ['mini-framework'] },
      { id: 'mini-bundler-book', title: 'Як працюють бандлери: граф, модулі, рантайм', topics: ['mini-bundler'] },
      { id: 'mini-test-runner-book', title: 'Як працюють тест-раннери: матчери, хуки, моки', topics: ['mini-test-runner'] }
    ]
  },
  {
    id: 'capstone',
    title: 'Фінальний проєкт',
    about: 'Тестове завдання від початку до захисту: перевірка даних з API, клієнт і кеш, інтерфейс на React або Vue з TypeScript, доступні форми, оптимістичні оновлення, README і розбір рішення на співбесіді.',
    chapters: [
      { id: 'capstone-book', title: 'Фінальний проєкт: дошка задач як тестове завдання', topics: ['capstone-core', 'capstone-react', 'capstone-vue', 'capstone-delivery'] }
    ]
  }
];

FE.bookChapters = {};
FE.bookParts.forEach(function (part) {
  part.chapters.forEach(function (ch) {
    ch.part = part.id;
    FE.bookChapters[ch.id] = ch;
  });
});
FE.bookFiles = Object.keys(FE.bookChapters).map(function (id) { return 'book/' + id; });
FE.chapter = function (id, data) {
  if (FE.bookChapters[id]) FE.bookChapters[id].body = data.body;
};
