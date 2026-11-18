/*
 * Посилання «Детальніше» для кожної теми — щоб не перевантажувати завдання текстом.
 * Формат: topicId → [[назва, url], ...]
 */
(function () {
  'use strict';
  window.FE = window.FE || {};
  FE.DOCS = {
    'js-start': [
      ['javascript.info: Основи JavaScript', 'https://javascript.info/first-steps'],
      ['javascript.info: Класи', 'https://javascript.info/class'],
      ['MDN: JavaScript Guide', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide']
    ],
    'web-components': [
      ['MDN: Web Components', 'https://developer.mozilla.org/en-US/docs/Web/API/Web_components'],
      ['javascript.info: Web components', 'https://javascript.info/web-components'],
      ['web.dev: Custom Elements best practices', 'https://web.dev/articles/custom-elements-best-practices'],
      ['MDN: Using shadow DOM', 'https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM']
    ],
    'mini-framework': [
      ['React: Preserving and Resetting State (ключі, тип)', 'https://react.dev/learn/preserving-and-resetting-state'],
      ['React: Rules of Hooks', 'https://react.dev/reference/rules/rules-of-hooks'],
      ['React: Queueing a Series of State Updates (батчинг)', 'https://react.dev/learn/queueing-a-series-of-state-updates'],
      ['Vue: Rendering Mechanism', 'https://vuejs.org/guide/extras/rendering-mechanism'],
      ['Solid: Fine-grained reactivity', 'https://docs.solidjs.com/advanced-concepts/fine-grained-reactivity']
    ],
    'ts-basics': [
      ['TypeScript Handbook: Everyday Types', 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html'],
      ['TypeScript Handbook: Narrowing', 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html'],
      ['TypeScript Handbook: Object Types', 'https://www.typescriptlang.org/docs/handbook/2/objects.html'],
      ['TypeScript Playground', 'https://www.typescriptlang.org/play']
    ],
    'ts-generics': [
      ['TypeScript Handbook: Generics', 'https://www.typescriptlang.org/docs/handbook/2/generics.html'],
      ['TypeScript Handbook: Type Manipulation', 'https://www.typescriptlang.org/docs/handbook/2/types-from-types.html'],
      ['TypeScript: Utility Types', 'https://www.typescriptlang.org/docs/handbook/utility-types.html'],
      ['type-challenges (GitHub)', 'https://github.com/type-challenges/type-challenges']
    ],
    'ts-practice': [
      ['TypeScript: TSConfig Reference', 'https://www.typescriptlang.org/tsconfig/'],
      ['TypeScript Handbook: Classes', 'https://www.typescriptlang.org/docs/handbook/2/classes.html'],
      ['Zod: TypeScript-first schema validation', 'https://zod.dev/'],
      ['TypeScript: Migrating from JavaScript', 'https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html']
    ],
    'react-basics': [
      ['react.dev: Describing the UI', 'https://react.dev/learn/describing-the-ui'],
      ['react.dev: Adding Interactivity', 'https://react.dev/learn/adding-interactivity'],
      ['react.dev: Managing State', 'https://react.dev/learn/managing-state'],
      ['react.dev: Thinking in React', 'https://react.dev/learn/thinking-in-react']
    ],
    'react-hooks': [
      ['react.dev: Escape Hatches (ефекти, рефи)', 'https://react.dev/learn/escape-hatches'],
      ['react.dev: You Might Not Need an Effect', 'https://react.dev/learn/you-might-not-need-an-effect'],
      ['react.dev: Reusing Logic with Custom Hooks', 'https://react.dev/learn/reusing-logic-with-custom-hooks'],
      ['react.dev: Hooks API Reference', 'https://react.dev/reference/react/hooks']
    ],
    'react-advanced': [
      ['react.dev: Preserving and Resetting State', 'https://react.dev/learn/preserving-and-resetting-state'],
      ['react.dev: memo', 'https://react.dev/reference/react/memo'],
      ['react.dev: React Compiler', 'https://react.dev/learn/react-compiler'],
      ['react.dev: React 19 (блог)', 'https://react.dev/blog/2024/12/05/react-19'],
      ['react.dev: Suspense', 'https://react.dev/reference/react/Suspense']
    ],
    'node-overview': [
      ['Node.js: The Event Loop, Timers, and process.nextTick()', 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick'],
      ['Node.js: Don\'t Block the Event Loop', 'https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop'],
      ['libuv: Design overview', 'https://docs.libuv.org/en/v1.x/design.html'],
      ['Node.js: Modules — loading from node_modules', 'https://nodejs.org/api/modules.html#loading-from-node_modules-folders'],
      ['Node.js: Stream', 'https://nodejs.org/api/stream.html']
    ],
    'vue-basics': [
      ['vuejs.org: Essentials (шаблони, реактивність, компоненти)', 'https://vuejs.org/guide/essentials/application.html'],
      ['vuejs.org: Reactivity Fundamentals', 'https://vuejs.org/guide/essentials/reactivity-fundamentals.html'],
      ['vuejs.org: Components Basics', 'https://vuejs.org/guide/essentials/component-basics.html'],
      ['vuejs.org: Slots', 'https://vuejs.org/guide/components/slots.html']
    ],
    'vue-composition': [
      ['vuejs.org: Watchers', 'https://vuejs.org/guide/essentials/watchers.html'],
      ['vuejs.org: Composables', 'https://vuejs.org/guide/reusability/composables.html'],
      ['vuejs.org: Reactivity in Depth', 'https://vuejs.org/guide/extras/reactivity-in-depth.html'],
      ['vuejs.org: Provide / Inject', 'https://vuejs.org/guide/components/provide-inject.html'],
      ['VueUse', 'https://vueuse.org/']
    ],
    'vue-ecosystem': [
      ['Pinia', 'https://pinia.vuejs.org/'],
      ['Vue Router', 'https://router.vuejs.org/'],
      ['Vue Test Utils', 'https://test-utils.vuejs.org/'],
      ['vuejs.org: TypeScript with Composition API', 'https://vuejs.org/guide/typescript/composition-api.html'],
      ['Vue 3 Migration Guide', 'https://v3-migration.vuejs.org/'],
      ['Nuxt: Docs', 'https://nuxt.com/docs']
    ],
    'react-ecosystem': [
      ['TanStack Query: Overview', 'https://tanstack.com/query/latest/docs/framework/react/overview'],
      ['React Router: Docs', 'https://reactrouter.com/home'],
      ['Testing Library: Guiding Principles і запити', 'https://testing-library.com/docs/queries/about'],
      ['Next.js: App Router', 'https://nextjs.org/docs/app'],
      ['react.dev: Server Components', 'https://react.dev/reference/rsc/server-components'],
      ['Zustand', 'https://zustand.docs.pmnd.rs/'],
      ['React Hook Form', 'https://react-hook-form.com/']
    ],
    'mini-bundler': [
      ['webpack: Concepts', 'https://webpack.js.org/concepts/'],
      ['Rollup: Introduction (tree shaking)', 'https://rollupjs.org/introduction/'],
      ['Vite: Why Vite', 'https://vite.dev/guide/why'],
      ['MDN: JavaScript modules', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules']
    ],
    'mini-test-runner': [
      ['Vitest: Guide', 'https://vitest.dev/guide/'],
      ['Jest: Setup and Teardown (порядок хуків)', 'https://jestjs.io/docs/setup-teardown'],
      ['Vitest: Mocking', 'https://vitest.dev/guide/mocking']
    ],
    'v8': [
      ['V8 blog: Ignition і TurboFan', 'https://v8.dev/blog/launching-ignition-and-turbofan'],
      ['V8 blog: Sparkplug', 'https://v8.dev/blog/sparkplug'],
      ['V8 blog: Maglev', 'https://v8.dev/blog/maglev'],
      ['V8 blog: Fast properties (приховані класи)', 'https://v8.dev/blog/fast-properties'],
      ['V8 blog: Elements kinds', 'https://v8.dev/blog/elements-kinds'],
      ['V8 blog: Trash talk (збирач сміття Orinoco)', 'https://v8.dev/blog/trash-talk'],
      ['V8 blog: Pointer compression', 'https://v8.dev/blog/pointer-compression'],
      ['Chrome DevTools: Memory problems', 'https://developer.chrome.com/docs/devtools/memory-problems'],
      ['MDN: Memory management', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management']
    ],
    'js-types': [
      ['javascript.info: Типи даних', 'https://javascript.info/types'],
      ['javascript.info: Перетворення типів', 'https://javascript.info/type-conversions'],
      ['MDN: Equality comparisons', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness']
    ],
    'js-strings-numbers': [
      ['javascript.info: Рядки', 'https://javascript.info/string'],
      ['javascript.info: Числа', 'https://javascript.info/number'],
      ['javascript.info: Регулярні вирази', 'https://javascript.info/regular-expressions']
    ],
    'js-scope': [
      ['javascript.info: Старий var', 'https://javascript.info/var'],
      ['javascript.info: Область видимості і замикання', 'https://javascript.info/closure'],
      ['MDN: Hoisting', 'https://developer.mozilla.org/en-US/docs/Glossary/Hoisting']
    ],
    'js-functions': [
      ['javascript.info: Замикання', 'https://javascript.info/closure'],
      ['MDN: Closures', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures'],
      ['javascript.info: Функція як об\'єкт', 'https://javascript.info/function-object']
    ],
    'js-objects': [
      ['javascript.info: Об\'єкти', 'https://javascript.info/object'],
      ['javascript.info: Копіювання об\'єктів', 'https://javascript.info/object-copy'],
      ['javascript.info: Дескриптори властивостей', 'https://javascript.info/property-descriptors']
    ],
    'js-arrays': [
      ['javascript.info: Методи масивів', 'https://javascript.info/array-methods'],
      ['MDN: Array', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array']
    ],
    'js-modern': [
      ['javascript.info: Деструктуризація', 'https://javascript.info/destructuring-assignment'],
      ['javascript.info: Map і Set', 'https://javascript.info/map-set'],
      ['javascript.info: Ітератори', 'https://javascript.info/iterable'],
      ['javascript.info: Генератори', 'https://javascript.info/generators'],
      ['javascript.info: Proxy і Reflect', 'https://javascript.info/proxy']
    ],
    'js-this': [
      ['MDN: this', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this'],
      ['javascript.info: Методи і this', 'https://javascript.info/object-methods'],
      ['javascript.info: bind', 'https://javascript.info/bind']
    ],
    'js-prototypes': [
      ['MDN: Ланцюжок прототипів', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain'],
      ['javascript.info: Прототипне наслідування', 'https://javascript.info/prototype-inheritance'],
      ['javascript.info: Класи', 'https://javascript.info/classes']
    ],
    'js-errors': [
      ['javascript.info: try...catch', 'https://javascript.info/try-catch'],
      ['javascript.info: Власні помилки', 'https://javascript.info/custom-errors']
    ],
    'js-async': [
      ['javascript.info: Event loop', 'https://javascript.info/event-loop'],
      ['javascript.info: Проміси', 'https://javascript.info/promise-basics'],
      ['javascript.info: async/await', 'https://javascript.info/async-await'],
      ['MDN: Event loop', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop']
    ],
    'js-fp': [
      ['javascript.info: Каррінг', 'https://javascript.info/currying-partials'],
      ['javascript.info: Декоратори', 'https://javascript.info/call-apply-decorators']
    ],
    'dom': [
      ['javascript.info: Навігація по DOM', 'https://javascript.info/dom-navigation'],
      ['javascript.info: Зміна документа', 'https://javascript.info/modifying-document'],
      ['MDN: Вступ до DOM', 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction']
    ],
    'events': [
      ['javascript.info: Спливання і перехоплення', 'https://javascript.info/bubbling-and-capturing'],
      ['javascript.info: Делегування', 'https://javascript.info/event-delegation'],
      ['MDN: addEventListener', 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener']
    ],
    'browser-api': [
      ['javascript.info: localStorage', 'https://javascript.info/localstorage'],
      ['javascript.info: Fetch', 'https://javascript.info/fetch'],
      ['MDN: Web APIs', 'https://developer.mozilla.org/en-US/docs/Web/API']
    ],
    'rendering': [
      ['web.dev: Critical rendering path', 'https://web.dev/articles/critical-rendering-path'],
      ['web.dev: Рендеринг і продуктивність', 'https://web.dev/articles/rendering-performance']
    ],
    'html': [
      ['MDN: HTML-елементи', 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element'],
      ['MDN: Валідація форм', 'https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation']
    ],
    'css-basics': [
      ['MDN: Специфічність', 'https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity'],
      ['MDN: Каскад', 'https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade'],
      ['MDN: Box model', 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model/Introduction_to_the_CSS_box_model']
    ],
    'css-layout': [
      ['CSS-Tricks: Flexbox', 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/'],
      ['CSS-Tricks: Grid', 'https://css-tricks.com/snippets/css/complete-guide-grid/'],
      ['MDN: Container queries', 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries']
    ],
    'css-advanced': [
      ['MDN: Stacking context', 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context'],
      ['MDN: Custom properties', 'https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties'],
      ['MDN: position', 'https://developer.mozilla.org/en-US/docs/Web/CSS/position']
    ],
    'a11y': [
      ['MDN: Accessibility', 'https://developer.mozilla.org/en-US/docs/Web/Accessibility'],
      ['W3C: ARIA Authoring Practices', 'https://www.w3.org/WAI/ARIA/apg/']
    ],
    'network': [
      ['MDN: HTTP', 'https://developer.mozilla.org/en-US/docs/Web/HTTP'],
      ['MDN: CORS', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS'],
      ['MDN: HTTP caching', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching']
    ],
    'security': [
      ['OWASP Top 10', 'https://owasp.org/www-project-top-ten/'],
      ['MDN: Content Security Policy', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP'],
      ['OWASP: XSS Prevention Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html']
    ],
    'performance': [
      ['web.dev: Core Web Vitals', 'https://web.dev/articles/vitals'],
      ['web.dev: Learn Performance', 'https://web.dev/learn/performance']
    ],
    'tooling': [
      ['Pro Git (книга)', 'https://git-scm.com/book/en/v2'],
      ['Semantic Versioning', 'https://semver.org/'],
      ['MDN: JavaScript modules', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules']
    ],
    'testing': [
      ['Testing Library: принципи', 'https://testing-library.com/docs/guiding-principles'],
      ['Vitest: Guide', 'https://vitest.dev/guide/']
    ],
    'architecture': [
      ['web.dev: Rendering on the Web (CSR, SSR, SSG, гідратація)', 'https://web.dev/articles/rendering-on-the-web'],
      ['GreatFrontEnd: Front End System Design Playbook (RADIO)', 'https://www.greatfrontend.com/front-end-system-design-playbook'],
      ['Redux: Normalizing State Shape', 'https://redux.js.org/usage/structuring-reducers/normalizing-state-shape'],
      ['TanStack Query: Optimistic Updates', 'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates'],
      ['web.dev: Virtualize long lists', 'https://web.dev/articles/virtualize-long-lists-react-window'],
      ['WAI-ARIA APG: Combobox', 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/']
    ],
    'patterns': [
      ['Refactoring.Guru: патерни', 'https://refactoring.guru/design-patterns'],
      ['patterns.dev', 'https://www.patterns.dev/']
    ],
    'algo-basics': [
      ['Big-O Cheat Sheet', 'https://www.bigocheatsheet.com/'],
      ['NeetCode Roadmap', 'https://neetcode.io/roadmap']
    ],
    'algo-structures': [
      ['VisuAlgo: візуалізації структур', 'https://visualgo.net/en'],
      ['NeetCode Roadmap', 'https://neetcode.io/roadmap']
    ],
    'algo-advanced': [
      ['VisuAlgo: сортування і пошук', 'https://visualgo.net/en/sorting'],
      ['NeetCode Roadmap', 'https://neetcode.io/roadmap']
    ],
    'livecoding': [
      ['javascript.info: Декоратори (debounce/throttle)', 'https://javascript.info/call-apply-decorators'],
      ['MDN: Promise', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise']
    ],
    'capstone-core': [
      ['TypeScript Handbook: Narrowing','https://www.typescriptlang.org/docs/handbook/2/narrowing.html'],
      ['Zod: TypeScript-first schema validation','https://zod.dev/'],
      ['MDN: AbortController','https://developer.mozilla.org/en-US/docs/Web/API/AbortController'],
      ['TanStack Query: Overview','https://tanstack.com/query/latest/docs/framework/react/overview']
    ],
    'capstone-react': [
      ['react.dev: You Might Not Need an Effect','https://react.dev/learn/you-might-not-need-an-effect'],
      ['react.dev: useOptimistic','https://react.dev/reference/react/useOptimistic'],
      ['TanStack Query: Optimistic Updates','https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates'],
      ['W3C: ARIA Authoring Practices','https://www.w3.org/WAI/ARIA/apg/']
    ],
    'capstone-vue': [
      ['vuejs.org: Watchers','https://vuejs.org/guide/essentials/watchers.html'],
      ['vuejs.org: Composables','https://vuejs.org/guide/reusability/composables.html'],
      ['vuejs.org: TypeScript with Composition API','https://vuejs.org/guide/typescript/composition-api.html'],
      ['W3C: ARIA Authoring Practices','https://www.w3.org/WAI/ARIA/apg/']
    ],
    'capstone-delivery': [
      ['Testing Library: принципи','https://testing-library.com/docs/guiding-principles'],
      ['MDN: Accessibility','https://developer.mozilla.org/en-US/docs/Web/Accessibility'],
      ['Conventional Commits','https://www.conventionalcommits.org/en/v1.0.0/']
    ]
  };
})();
