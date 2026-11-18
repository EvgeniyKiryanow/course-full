FE.chapter('react-ecosystem-book', { body: `
React — лише бібліотека UI. Комерційний застосунок складається ще з інструментів для стану, даних, маршрутизації, форм, тестів, стилів і фреймворку. Головна навичка — розуміти, **яку задачу** розв'язує кожен інструмент, щоб обрати його свідомо й швидко освоїти будь-який аналог.

| Задача | Типовий вибір 2025–2026 |
|---|---|
| Збірка SPA | Vite |
| Фреймворк (SSR, маршрути, дані) | Next.js (App Router), React Router v7 (framework mode), TanStack Start |
| Серверний стан | TanStack Query, SWR, RTK Query |
| Клієнтський глобальний стан | Zustand, Redux Toolkit, Jotai; Context для рідких змін |
| Форми | React Hook Form + Zod; React 19 Actions |
| UI-компоненти | Radix / React Aria / shadcn/ui + Tailwind або CSS Modules |
| Тести | Vitest + Testing Library + MSW; Playwright для E2E |

## Глобальний стан: стори, Zustand, Redux Toolkit

**Спершу класифікуйте стан:** локальний UI → \`useState\`; спільний, що рідко змінюється → Context; серверний → бібліотека кешу; URL (фільтри, сторінка) → search params; форма → бібліотека форм. Глобальний клієнтський стор потрібен для решти: кошик, налаштування редактора, стан складних віджетів, що змінюється часто.

**Як влаштований стор** (ви написали його в завданні):
\`\`\`js
function createStore(initial) {
  let state = initial;
  const listeners = new Set();
  return {
    getState: () => state,
    setState(patch) { state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }; listeners.forEach((l) => l()); },
    subscribe(l) { listeners.add(l); return () => listeners.delete(l); }
  };
}
const useStore = (store, selector) => useSyncExternalStore(store.subscribe, () => selector(store.getState()));
\`\`\`
- \`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)\` — офіційний спосіб підписатися на зовнішнє джерело (стор, \`matchMedia\`, \`navigator.onLine\`); захищає від «tearing» у конкурентному рендері;
- \`getSnapshot\` має повертати **те саме** значення, поки джерело не змінилося, — селектор, що щоразу створює новий об'єкт, дає нескінченний цикл. Вибір кількох полів — \`useShallow\` (Zustand) або \`shallowEqual\` (react-redux).

**Zustand:**
\`\`\`js
const useCart = create((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
}));
const count = useCart((s) => s.items.length);
\`\`\`
**Redux Toolkit:** \`configureStore\` (DevTools, middleware), \`createSlice\` — редюсери пишуться «мутаційно» завдяки **Immer** (Proxy-draft, structural sharing), \`createAsyncThunk\`, **RTK Query** для серверного стану. Обирають для великих команд, складних потоків подій, коли важливі DevTools з time-travel і чіткі правила.

**Атомарні стори** (Jotai, Recoil-подібні): стан із дрібних атомів, компоненти підписуються на окремі атоми. **Signals** (Preact Signals, Vue, Solid, Angular) — та сама fine-grained ідея.

## Серверний стан і потокові дані

Серверний стан відрізняється від клієнтського: він **належить серверу**, може застаріти, його ділять багато компонентів, потрібні кеш, дедуплікація, ревалідація й ретраї. Тому його не копіюють у Redux, а тримають у бібліотеці кешу.

**TanStack Query:**
\`\`\`jsx
const { data, isPending, isError, isFetching } = useQuery({
  queryKey: ['todos', { page }],
  queryFn: ({ signal }) => api.get('/todos', { params: { page }, signal }),
  staleTime: 30_000,
});
const qc = useQueryClient();
const add = useMutation({ mutationFn: createTodo, onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }) });
\`\`\`
- **queryKey** — адреса в кеші; усе, від чого залежить запит, — у ключі;
- **staleTime** (за замовчуванням 0) — скільки дані свіжі; **gcTime** (5 хв) — скільки невикористані дані зберігаються;
- застарілі дані показуються одразу, а у фоні йде ревалідація (stale-while-revalidate, як у HTTP-кеші з модуля «Мережа»); рефетч при фокусі вікна й відновленні мережі;
- **isPending** — даних ще немає; **isFetching** — іде будь-який запит;
- оптимістичні мутації: \`onMutate\` (знімок і оновлення кешу) → \`onError\` (відкат) → \`onSettled\` (інвалідація);
- пагінація (\`placeholderData: keepPreviousData\`), нескінченні списки (\`useInfiniteQuery\`), Suspense (\`useSuspenseQuery\`), SSR-гідратація кешу.

**Потокові дані.** Відповіді ШІ, логи, довгі звіти приходять частинами:
- \`fetch\` + \`response.body.pipeThrough(new TextDecoderStream())\` + \`for await\` — потоковий текст;
- **SSE** (\`EventSource\`) — односпрямовані події від сервера з автоперепідключенням;
- **WebSocket** — двосторонній канал (чати, спільне редагування);
- у React: накопичувати шматки функціональним оновленням \`setText((t) => t + chunk)\`, скасовувати через \`AbortController\` (кнопка «Зупинити», розмонтування), ігнорувати запізнілі шматки, санітизувати markdown перед рендером. Готові рішення — Vercel AI SDK (\`useChat\`).

## Маршрутизація

SPA перехоплює кліки по посиланнях, змінює URL через History API (\`pushState\`, подія \`popstate\`) і сама вирішує, що рендерити.

**React Router v7:**
\`\`\`jsx
const router = createBrowserRouter([
  { path: '/', element: <Layout />, children: [
    { index: true, element: <Home /> },
    { path: 'users/:id', element: <User />, loader: ({ params }) => getUser(params.id) },
    { path: '*', element: <NotFound /> },
  ]},
]);
function Layout() { return <><Header /><Outlet /></>; }
function User() { const { id } = useParams(); const user = useLoaderData(); … }
\`\`\`
- вкладені маршрути і \`<Outlet />\` — спільні layout-и;
- \`loader\` завантажує дані **до** рендеру, паралельно з кодом сторінки — без каскаду «код → рендер → fetch»; \`action\` — для мутацій форм;
- \`useSearchParams\` — фільтри й сторінка в URL; \`<NavLink>\` ставить \`aria-current="page"\`;
- ліниві маршрути (\`lazy\`) — кожна сторінка окремим чанком;
- **захищені маршрути** на клієнті — лише UX; доступ до даних перевіряє сервер;
- статичний хостинг SPA потребує fallback на \`index.html\` для всіх шляхів (або hash-роутинг);
- після переходу перемістіть фокус на заголовок сторінки — інакше screen reader не дізнається про зміну.

**Next.js** — файлова маршрутизація: \`app/users/[id]/page.tsx\`, \`layout.tsx\`, \`loading.tsx\` (межа Suspense), \`error.tsx\` (межа помилок), \`not-found.tsx\`.

## Форми й тестування

**React Hook Form + Zod:**
\`\`\`tsx
const schema = z.object({ email: z.string().email(), age: z.coerce.number().min(18) });
type Values = z.infer<typeof schema>;
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
<input {...register('email')} aria-invalid={!!errors.email} aria-describedby="email-err" />
\`\`\`
- неконтрольовані поля через \`register\` → введення не перерендерює всю форму; сторонні компоненти — \`Controller\`;
- одна схема Zod — і рантайм-валідація, і тип; ту саму схему використовують на сервері (у Server Action чи API), бо **клієнтська валідація не захищає**;
- прості форми в React 19 — Actions + \`useActionState\`.

**Тестування.** Принцип Testing Library: *що більше тест схожий на те, як користувач використовує застосунок, то більше впевненості він дає.*
- запити за пріоритетом: \`getByRole\` (з \`name\`) → \`getByLabelText\` → \`getByText\` → \`getByTestId\`;
- \`getBy\` — синхронно, кидає помилку; \`queryBy\` — \`null\` (перевірити відсутність); \`findBy\` — проміс, чекає появи;
- \`userEvent\` імітує повну взаємодію (фокус, клавіші, введення), \`fireEvent\` — одну подію;
- мережу мокають **MSW** (перехоплення на рівні запиту), а не \`fetch\` всередині компонента;
- тестують поведінку, а не реалізацію: не перевіряйте стан і хуки напряму;
- хуки — \`renderHook\`; асинхронні оновлення — \`waitFor\`/\`findBy\` (усередині обгорнуті в \`act\`);
- **рівні:** unit (Vitest), компонентні/інтеграційні (Testing Library у jsdom або Vitest Browser Mode), E2E (Playwright), візуальні й a11y (Storybook, axe).

Запит за роллю — безкоштовна перевірка доступності: кнопка-іконка без \`aria-label\` не знайдеться.

## TypeScript і стилі в React

**TypeScript** (перевірено з @types/react 19, strict):
\`\`\`tsx
type ButtonProps = React.ComponentProps<'button'> & { variant?: 'primary' | 'ghost' };
function Button({ variant = 'primary', ...rest }: ButtonProps) { return <button {...rest} />; }

const [items, setItems] = useState<string[]>([]);       // useState([]) дав би never[]
const ref = useRef<HTMLInputElement>(null);             // ref.current: HTMLInputElement | null
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);

function List<T>({ items, render }: { items: T[]; render: (item: T) => React.ReactNode }) {
  return <ul>{items.map(render)}</ul>;
}
\`\`\`
- \`children: React.ReactNode\`; події — \`React.MouseEvent<HTMLButtonElement>\`, \`React.FormEvent<HTMLFormElement>\`;
- пропи-варіанти й стан запиту — розрізнювані об'єднання; \`React.FC\` не обов'язковий;
- контекст без дефолту: \`createContext<Ctx | null>(null)\` + хук, що кидає помилку поза провайдером.

**Стилі:**
- **CSS Modules** — локальні класи під час збірки, нуль рантайму;
- **Tailwind** — утиліти, генерується лише використане; варіанти — \`cva\`, злиття класів — \`tailwind-merge\`;
- **рантайм CSS-in-JS** (styled-components, Emotion) — стилі обчислюються в браузері; з Server Components працюють лише в клієнтських компонентах (\`'use client'\`);
- **zero-runtime** (vanilla-extract, StyleX, Panda CSS) — CSS витягується під час збірки;
- динамічні значення — через CSS-змінні: \`style={{ '--progress': p + '%' }}\`.

## Next.js, SSR і Server Components

**Стратегії рендерингу:**
| | HTML генерується | Коли обирати |
|---|---|---|
| CSR | у браузері | кабінети за логіном, адмінки |
| SSR | на кожен запит | персоналізовані сторінки з SEO |
| SSG | під час збірки | документація, лендінги |
| ISR | збірка + фонова перегенерація | каталоги, блоги |
| Стрімінг | частинами через Suspense | швидка оболонка + повільні дані |

**Гідратація** — React у браузері підключає стан і обробники до серверного HTML (\`hydrateRoot\`). Поки JS не завантажився, сторінку видно, але вона не реагує. Перший клієнтський рендер має дати **той самий** HTML, що й сервер: \`Date.now()\`, \`Math.random()\`, \`typeof window\`, \`localStorage\` у рендері → помилка гідратації. Браузерні значення читайте в ефекті або через \`useSyncExternalStore\` з \`getServerSnapshot\`.

**Server Components** (Next.js App Router):
- за замовчуванням компоненти серверні: виконуються на сервері, можуть бути \`async\`, читати БД і секрети; їхній код не потрапляє в клієнтський бандл;
- \`'use client'\` позначає межу: модуль і все, що він імпортує, стають клієнтськими. Стан, ефекти, обробники, браузерні API — лише там. Тримайте межу на інтерактивних «листках»;
- клієнтський компонент не імпортує серверний, але може отримати його як \`children\`;
- пропи через межу мають бути серіалізованими;
- **Server Actions** (\`'use server'\`) — функції, які клієнт викликає як RPC (форми, мутації). Це публічний ендпоінт: перевіряйте сесію, права й валідуйте аргументи;
- кешування в Next.js змінювалося між версіями (Next 15 — запити без кешу за замовчуванням; Next 16 — Cache Components і \`'use cache'\`) — звіряйтеся з документацією своєї версії;
- \`metadata\` / \`generateMetadata\` для SEO, \`next/image\` (розміри, формати, lazy), \`next/font\`.

**Альтернативи:** React Router v7 framework mode (колишній Remix), TanStack Start, Astro (острівці інтерактивності для контентних сайтів). У Vue — Nuxt.

## Типові питання

- **Redux чи Zustand чи Context?** Залежить від частоти змін, розміру команди й потреби в DevTools.
- **Чому серверний стан не тримають у Redux?** Кеш, ревалідація, дедуплікація — окрема задача.
- **staleTime vs gcTime?**
- **Як працює клієнтський роутинг?** History API + перехоплення кліків.
- **Як тестувати компонент із запитом?** Testing Library + MSW + \`findBy\`.
- **SSR vs SSG vs ISR? Що таке гідратація і чому вона ламається?**
- **Server Components vs Client Components? Що робить 'use client'?**
`});
