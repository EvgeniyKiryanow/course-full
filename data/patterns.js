FE.topic('patterns', {
  intro: `
## Принципи

| Принцип | Коротко | Фронтенд-приклад |
|---|---|---|
| **S** — Single Responsibility | одна причина для змін | компонент не робить fetch + форматування + рендер одночасно |
| **O** — Open/Closed | розширюємо без редагування | мапа стратегій замість \`switch\` на 10 гілок |
| **L** — Liskov Substitution | підтип замінює базовий тип без сюрпризів | \`Square extends Rectangle\` — класичне порушення |
| **I** — Interface Segregation | маленькі інтерфейси під клієнта | компонент приймає 3 потрібні пропси, а не весь \`user\` |
| **D** — Dependency Inversion | залежимо від абстракцій | сервіс отримує \`httpClient\` ззовні, а не імпортує axios |

**DRY** (не дублюй знання), **KISS** (простіше — краще), **YAGNI** (не роби «на майбутнє»), **композиція замість наслідування**.

## Патерни GoF у JS

| Група | Патерн | Суть / де в JS |
|---|---|---|
| Породжувальні | Factory, Builder, Singleton, Module | \`createStore()\`, query builders, ES-модуль як синглтон |
| Структурні | Adapter, Facade, Decorator, Proxy | нормалізація API, \`withRetry(fn)\`, \`new Proxy\` |
| Поведінкові | Observer, Strategy, Command, State, Iterator, Chain of Responsibility, Mediator | події, мапа стратегій, undo/redo, FSM, \`for...of\`, middleware |

## Observer vs Pub/Sub

- **Observer:** суб'єкт **сам** тримає список спостерігачів і сповіщає їх (\`addEventListener\`, RxJS Subject).
- **Pub/Sub:** видавці й підписники **не знають** один про одного, спілкуються через **брокер/канал** з топіками.
- **Mediator:** центральний об'єкт координує взаємодію компонентів (форма-диригент полів).

## Middleware (Chain of Responsibility)

\`\`\`js
// koa-style: "цибуля" — код до next() іде вглиб, після next() — назад
app.use(async (ctx, next) => { const t = Date.now(); await next(); ctx.ms = Date.now() - t; });
// redux-style
const logger = (store) => (next) => (action) => { console.log(action.type); return next(action); };
\`\`\`

## Архітектура

- **MVC / MVP / MVVM** — розділення даних, представлення і логіки; MVVM = двостороннє зв'язування через ViewModel.
- **Flux/Redux** — односпрямований потік: \`action → dispatch → reducer(state, action) → newState → view\`. Редʼюсер — чиста функція, стан іммутабельний.
- **Сигнали (signals)** — дрібнозерниста реактивність: \`signal\` → \`computed\` → \`effect\` з автоматичним відстеженням залежностей.
- **Feature-Sliced Design:** шари \`app → pages → widgets → features → entities → shared\`, імпорт лише «вниз».

## Пастки

- Синглтон = глобальний стан: важко тестувати, приховані залежності.
- Патерн заради патерну — overengineering; спершу проблема, потім патерн.
- Pub/Sub ускладнює відстеження потоку даних («хто це надіслав?»).
`,
  groups: [
    { id: 'principles', title: 'Принципи: DRY, KISS, SOLID' },
    { id: 'structural', title: 'Структурні: Adapter, Decorator, Proxy, Facade' },
    { id: 'creational', title: 'Породжувальні: Module, Singleton, Factory, Builder' },
    { id: 'observer', title: 'Observer і Pub/Sub' },
    { id: 'behavioral', title: 'Поведінкові: Strategy, Command, State machine' },
    { id: 'middleware-di', title: 'Middleware і Dependency Injection' },
    { id: 'state', title: 'Архітектура UI і стан: MVC, Flux, Redux' },
    { id: 'signals', title: 'Реактивність: сигнали' }
  ],
  items: [
    // ---------------------------------------------------------------- principles
    {
      id: 'pat-principles', why: ["Так: DRY — про єдине джерело правди для знання, а не про схожі рядки.","Ні: передчасна абстракція гірша за дублювання.","Ні: YAGNI якраз радить не робити «на майбутнє».","Так: композиція дає гнучкість без жорсткої ієрархії.","Ні: KISS — про простоту розуміння, а не про кількість рядків."],
      group: 'principles',
      type: 'theory',
      level: 1,
      interview: true,
      title: 'DRY, KISS, YAGNI і композиція замість наслідування',
      tags: ['principles'],
      question: 'Поясніть принципи DRY, KISS, YAGNI. Чому кажуть «композиція краща за наслідування»? Наведіть приклади з фронтенду. Оберіть **усі** правильні твердження.',
      choices: [
        'DRY стосується знання: одне бізнес-правило має одне джерело правди, а не будь-який схожий текст',
        'Будь-який повтор коду слід одразу виносити в спільну абстракцію, навіть із прапорцями `isAdminPage`',
        'YAGNI радить одразу закладати параметри й точки розширення «на майбутнє», щоб потім не переписувати',
        'Композиція (has-a) гнучкіша за наслідування (is-a): поведінку збирають з малих частин без крихких ієрархій',
        'KISS означає мінімальну кількість рядків коду, навіть ціною його читабельності та зрозумілості',
      ],
      correct: [0, 3],
      hint: 'Для DRY подумайте, що саме не можна дублювати — код чи знання. Для композиції — проблему «банан і горила з джунглями».',
      answer: `
**DRY (Don't Repeat Yourself)** — кожне **знання** (бізнес-правило, формула, валідація, константа) має одне джерело правди. Приклад: правила валідації email в одній функції, яку використовують і форма, і API-шар.
Пастка: DRY — про знання, а не про схожий текст. Два шматки коду, які випадково схожі, але змінюються з різних причин, краще не об'єднувати — передчасна абстракція з купою прапорців \`if (isAdminPage)\` гірша за дублювання. Правило трьох: абстрагуйте, коли повтор з'явився втретє. Також згадують **WET** («write everything twice») і **AHA** («avoid hasty abstractions»).

**KISS (Keep It Simple, Stupid)** — найпростіше рішення, що розв'язує задачу. Звичайна функція замість класу з фабрикою і стратегією; \`useState\` замість глобального стору для локального стану. Простий код легше читати, тестувати і змінювати.

**YAGNI (You Aren't Gonna Need It)** — не реалізовувати функціональність «на майбутнє», поки вона не потрібна. Кожен «а раптом знадобиться» параметр — це код, який треба підтримувати і тестувати, а вгадати майбутнє вдається рідко.

**Композиція замість наслідування.** Наслідування створює жорсткий зв'язок «є» (is-a): підклас залежить від деталей батька, ієрархії стають глибокими й крихкими, а мультиспадковості в JS немає. Композиція («має» / has-a) збирає поведінку з маленьких незалежних частин:
\`\`\`js
// ❌ наслідування: а якщо потрібна качка, що літає, але не плаває?
class Animal {} class FlyingAnimal extends Animal {} class SwimmingFlyingAnimal extends FlyingAnimal {}

// ✅ композиція
const canFly = (state) => ({ fly: () => \`\${state.name} flies\` });
const canSwim = (state) => ({ swim: () => \`\${state.name} swims\` });
function createDuck(name) {
  const state = { name };
  return { ...canFly(state), ...canSwim(state) };
}
\`\`\`
У фронтенді: компоненти через \`children\`/слоти і вкладення замість наслідування компонентів, хуки/composables замість базових класів, функції-обгортки (декоратори) замість підкласів.

**Баланс:** ці принципи іноді суперечать один одному (DRY може ускладнити — KISS). Головне — щоб код було легко змінювати.
`,
      keyPoints: [
        'DRY — одне джерело правди для знання, а не для схожого тексту',
        'Передчасна абстракція гірша за дублювання (AHA, правило трьох)',
        'KISS — найпростіше рішення; YAGNI — не робити «на майбутнє»',
        'Композиція (has-a) гнучкіша за наслідування (is-a): менше зв\'язності',
        'Приклади: children/слоти, хуки, функції-обгортки'
      ],
      followUps: ['Наведіть приклад, коли DRY зашкодив проєкту.', 'Коли наслідування все ж доречне?', 'Що таке mixin і чим він ризикований?']
    },
    {
      id: 'pat-solid', why: ["Ні: SRP — одна причина для змін, а не одна функція.","Ні: OCP — розширювати без зміни, а не заборона змінювати код.","Так: вузький інтерфейс пропсів — ISP.","Ні: LSP порушує і зміна поведінки, яку очікує клієнт.","Ні: навпаки — обидва рівні залежать від абстракцій."],
      group: 'principles',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'SOLID на прикладах з фронтенду',
      tags: ['principles', 'solid'],
      question: 'Розкажіть про принципи SOLID. Як кожен з них застосовується у фронтенд-розробці?',
      choices: [
        'SRP означає, що в модулі чи компоненті має бути рівно одна функція або один публічний метод, не більше',
        'OCP вимагає ніколи не змінювати вже написаний код модуля, навіть для виправлення знайдених багів',
        'ISP: компонент `Avatar` краще приймає `{ src, alt, size }`, ніж увесь обʼєкт `user` з десятками полів',
        'LSP порушено, лише коли в підкласі бракує методу батька; змінена поведінка методу — це нормально',
        'DIP означає, що модулі нижнього рівня імпортують модулі верхнього рівня, а не навпаки',
      ],
      correct: 2,
      hint: 'Для кожної літери: визначення одним реченням + приклад порушення + як виправити.',
      answer: `
**S — Single Responsibility Principle.** У модуля/компонента має бути одна причина для змін.
Порушення: компонент \`UserProfile\` сам робить fetch, кешує, валідує форму, форматує дати і рендерить. Виправлення: хук/сервіс для даних, утиліти форматування, презентаційний компонент.

**O — Open/Closed Principle.** Відкритий для розширення, закритий для модифікації.
\`\`\`js
// ❌ кожен новий спосіб оплати = правка цієї функції
function pay(method, amount) { if (method === 'card') {...} else if (method === 'paypal') {...} }
// ✅ реєстр стратегій: новий метод = новий об'єкт, без змін у pay
const providers = { card: payByCard, paypal: payByPaypal };
const pay = (method, amount) => providers[method](amount);
\`\`\`
У UI: компонент з \`children\`/render props/слотами розширюється без зміни його коду; плагінна архітектура (ESLint, Vite).

**L — Liskov Substitution Principle.** Підтип можна підставити замість базового типу, не зламавши очікувань коду. Класичне порушення — \`Square extends Rectangle\` (зміна ширини змінює висоту). У фронтенді: кастомний \`<MyInput>\`, що «вдає» інпут, має поводитися як інпут (\`value\`, \`onChange\`, \`ref\`, \`disabled\`); реалізація інтерфейсу сховища не повинна раптом кидати там, де базова повертає \`null\`.

**I — Interface Segregation Principle.** Клієнт не повинен залежати від того, чого не використовує. Компонент \`Avatar\` має приймати \`{ src, alt, size }\`, а не весь об'єкт \`user\` з 40 полями — інакше він зв'язаний зі структурою \`user\` і ре-рендериться від нерелевантних змін. Те саме — маленькі хуки замість одного \`useEverything\`.

**D — Dependency Inversion Principle.** Модулі високого рівня не залежать від низькорівневих деталей — обидва залежать від абстракцій.
\`\`\`js
// ❌ бізнес-логіка жорстко прив'язана до axios і localStorage
import axios from 'axios';
// ✅ залежності передаються ззовні (інтерфейс: get/post)
function createUserService({ http, storage }) {
  return { load: (id) => http.get(\`/users/\${id}\`) };
}
\`\`\`
Дає тестованість (підставити фейк) і змінність (замінити axios на fetch в одному місці).

**Нюанс для співбесіди:** SOLID сформульовані для ООП, але у фронтенді застосовуються до функцій, модулів, хуків і компонентів. Головна мета всіх п'яти — **низька зв'язність і висока зчепленість** (low coupling, high cohesion), щоб зміни були локальними.
`,
      keyPoints: [
        'SRP: одна причина для змін — розділення даних, логіки і рендеру',
        'OCP: розширення через стратегії/плагіни/children без правки коду',
        'LSP: підтип не ламає очікувань (Square/Rectangle, кастомний інпут)',
        'ISP: мінімальні інтерфейси/пропси під клієнта',
        'DIP: залежність від абстракцій, інжекція залежностей',
        'Мета — low coupling, high cohesion'
      ],
      followUps: ['Який принцип SOLID найчастіше порушується у фронтенді?', 'Як SRP застосовується до React/Vue-компонентів?', 'Чим DIP відрізняється від DI?']
    },
    {
      id: 'pat-quiz-solid', why: ["Ні: функція робить одну справу.","Так: новий перевізник вимагає змінювати switch.","Ні: наслідування тут немає.","Ні: інтерфейсів тут немає.","Ні: проблема в розширюваності, а не в залежностях."],
      group: 'principles',
      type: 'quiz',
      level: 2,
      title: 'Який принцип SOLID порушено? (switch)',
      tags: ['principles', 'solid'],
      question: `
\`\`\`js
function getShippingCost(order) {
  switch (order.carrier) {
    case 'nova-poshta': return 70;
    case 'ukrposhta': return order.weight > 2 ? 60 : 45;
    case 'meest': return 80;
    default: throw new Error('Unknown carrier');
  }
}
\`\`\`

Кожен новий перевізник вимагає редагувати цю функцію (і, ймовірно, ще кілька подібних \`switch\` по проєкту). Який принцип порушено **найбільш прямо**?
`,
      options: [
        'Single Responsibility',
        'Open/Closed',
        'Liskov Substitution',
        'Interface Segregation',
        'Dependency Inversion'
      ],
      answer: 1,
      hint: 'Що доводиться робити з наявним кодом, щоб додати нову поведінку?',
      explanation: `
**Open/Closed:** щоб **розширити** поведінку (додати перевізника), доводиться **модифікувати** протестований код. Кожна правка — ризик зламати інші гілки, а розкидані по проєкту \`switch\` легко забути оновити.

Виправлення — патерн **Strategy** / реєстр:
\`\`\`js
const carriers = {
  'nova-poshta': { cost: () => 70 },
  ukrposhta: { cost: (o) => (o.weight > 2 ? 60 : 45) },
  meest: { cost: () => 80 },
};
const getShippingCost = (order) => carriers[order.carrier].cost(order);
// новий перевізник — новий запис, функція не змінюється
\`\`\`

- **SRP** — функція має одну відповідальність (розрахунок доставки).
- **LSP** стосується підтипів, яких тут немає.
- **ISP** — про надмірні інтерфейси.
- **DIP** можна притягнути («залежимо від конкретних перевізників»), але суть проблеми — саме необхідність модифікації для розширення.

Нюанс: \`switch\` на 3 стабільні варіанти — нормально (KISS). OCP-рефакторинг виправданий, коли варіанти справді часто додаються.
`
    },
    {
      id: 'pat-quiz-lsp', why: ["Ні: Square змінює обидві сторони — поведінка інша.","Так: підклас ламає очікування коду, що працює з Rectangle.","Ні: OCP про розширення без змін, тут проблема підстановки.","Ні: результат і принцип невірні."],
      group: 'principles',
      type: 'quiz',
      level: 3,
      title: 'Square extends Rectangle',
      tags: ['principles', 'solid'],
      question: `
Що поверне \`resize(new Square(2))\` і який принцип порушено?

\`\`\`js
class Rectangle {
  constructor(w, h) { this.w = w; this.h = h; }
  setWidth(w) { this.w = w; }
  setHeight(h) { this.h = h; }
  area() { return this.w * this.h; }
}
class Square extends Rectangle {
  constructor(side) { super(side, side); }
  setWidth(w) { this.w = w; this.h = w; }
  setHeight(h) { this.w = h; this.h = h; }
}

function resize(rect) {
  rect.setWidth(5);
  rect.setHeight(4);
  return rect.area(); // автор очікує 20
}
\`\`\`
`,
      options: [
        '`20` — усе гаразд, Square коректно перевизначив методи',
        '`16` — порушено Liskov Substitution',
        '`16` — порушено Open/Closed',
        '`25` — порушено Interface Segregation'
      ],
      answer: 1,
      hint: 'Простежте значення `w` і `h` після кожного виклику. Чи може код, написаний для Rectangle, безпечно працювати з Square?',
      explanation: `
\`setWidth(5)\` → \`w = h = 5\`; \`setHeight(4)\` → \`w = h = 4\`; \`area() = 16\`.

Функція \`resize\` спирається на контракт \`Rectangle\`: «ширина і висота змінюються незалежно». \`Square\` формально є підкласом, але цей контракт **порушує** — тож його не можна підставити замість \`Rectangle\` без зміни поведінки. Це і є порушення **принципу підстановки Лісков**: «квадрат є прямокутником» у геометрії не означає «квадрат поводиться як змінюваний прямокутник» у коді.

- \`20\` — було б, якби \`Square\` не перевизначав сетери (але тоді він перестав би бути квадратом).
- \`25\` — якби останнім викликався \`setWidth(5)\`.
- OCP і ISP тут ні до чого: проблема саме в підстановці підтипу.

Як виправити: не наслідувати, а мати спільний інтерфейс \`Shape { area() }\`; зробити фігури іммутабельними (\`withWidth(w)\` повертає нову фігуру); обирати композицію.
`
    },
    // ---------------------------------------------------------------- structural
    {
      id: 'pat-structural', why: ["Так: Adapter узгоджує чужий інтерфейс з очікуваним.","Ні: це Proxy; Facade спрощує складну підсистему.","Так: обидва зберігають інтерфейс, різниця в меті.","Ні: Proxy якраз зберігає інтерфейс.","Ні: порядок декораторів змінює поведінку."],
      group: 'structural',
      type: 'theory',
      level: 2,
      title: 'Decorator, Proxy, Adapter, Facade',
      tags: ['structural', 'decorator', 'proxy', 'adapter', 'facade'],
      question: 'Поясніть структурні патерни Decorator, Proxy, Adapter і Facade. Чим вони відрізняються між собою? Наведіть приклади з фронтенду. Оберіть **усі** правильні твердження.',
      choices: [
        'Adapter перетворює чужий несумісний інтерфейс на той, який очікує ваш код',
        'Facade зберігає той самий інтерфейс обʼєкта й лише контролює доступ до нього',
        'Decorator і Proxy зберігають інтерфейс: перший додає поведінку, другий контролює доступ',
        'Proxy завжди змінює інтерфейс обʼєкта, тому реактивність Vue 3 — це патерн Adapter',
        'Порядок декораторів неважливий: `withLogging(withRetry(fn))` і навпаки поводяться однаково',
      ],
      correct: [0, 2],
      hint: 'Порівняйте за двома питаннями: чи змінюється інтерфейс і навіщо створюється обгортка.',
      answer: `
Усі чотири — **обгортки**, але з різною метою:

| Патерн | Інтерфейс | Мета |
|---|---|---|
| **Decorator** | той самий | **додати поведінку** (логування, кеш, ретраї) |
| **Proxy** | той самий | **контролювати доступ** (ліниве завантаження, валідація, кеш, права) |
| **Adapter** | **інший → потрібний** | зробити несумісне сумісним |
| **Facade** | **новий, простіший** | приховати складну підсистему за простим API |

**Decorator** — у JS найчастіше функції вищого порядку:
\`\`\`js
const withLogging = (fn) => function (...args) {
  console.log('call', fn.name, args);
  return fn.apply(this, args);
};
const save = withLogging(withRetry(saveToServer, { retries: 3 }));
\`\`\`
Декоратори комбінуються в будь-якому порядку (порядок має значення!). Також: HOC у React, TC39-декоратори класів (\`@logged\` — стандарт stage 3, вже підтримується TypeScript 5).

**Proxy** — посередник з тим самим інтерфейсом. У JS є вбудований \`Proxy\`:
\`\`\`js
const state = new Proxy({ count: 0 }, {
  set(target, key, value) {
    target[key] = value;
    render();              // реактивність (так працює Vue 3)
    return true;
  },
});
\`\`\`
Приклади: реактивність Vue/MobX, валідація присвоєнь, ліниве завантаження важкого модуля, кешуючий проксі для API, захисний read-only проксі.

**Adapter** — перетворює чужий інтерфейс на очікуваний:
\`\`\`js
// старий API: { first_name, last_name } -> наш доменний тип { fullName }
const adaptUser = (raw) => ({ id: String(raw.id), fullName: \`\${raw.first_name} \${raw.last_name}\` });
\`\`\`
Приклади: нормалізація відповідей різних бекендів/версій API, обгортка над сторонньою бібліотекою аналітики/карт (заміна провайдера — правка лише адаптера), \`fetch\`-адаптер у axios. Тримає доменну модель незалежною від формату бекенду (anti-corruption layer).

**Facade** — простий фасад над складною підсистемою:
\`\`\`js
// замість 5 кроків у кожному компоненті
export const media = {
  async startCall(videoEl) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoEl.srcObject = stream;
    return () => stream.getTracks().forEach((t) => t.stop());
  },
};
\`\`\`
Приклади: API-клієнт над \`fetch\` (базовий URL, токени, помилки, ретраї), jQuery над DOM, SDK.

**Як не сплутати:** Adapter змінює інтерфейс для **сумісності**, Facade створює **новий спрощений** інтерфейс, Decorator і Proxy **зберігають** інтерфейс, але Decorator додає функціональність, а Proxy керує доступом.
`,
      keyPoints: [
        'Decorator — той самий інтерфейс + нова поведінка; функції-обгортки, HOC',
        'Proxy — той самий інтерфейс + контроль доступу; вбудований Proxy, реактивність Vue',
        'Adapter — перетворює несумісний інтерфейс на очікуваний (нормалізація API)',
        'Facade — простий інтерфейс над складною підсистемою (API-клієнт)',
        'Відмінність — у меті обгортки і в тому, чи змінюється інтерфейс'
      ],
      followUps: ['Чи важливий порядок застосування декораторів?', 'Як працює реактивність Vue 3 через Proxy?', 'Що таке anti-corruption layer?']
    },
    {
      id: 'pat-quiz-which-pattern', why: ["Ні: Facade спрощує підсистему, а не узгоджує формати.","Так: приводимо різні формати до одного інтерфейсу.","Ні: Proxy контролює доступ до того самого інтерфейсу.","Ні: Decorator додає поведінку, не змінюючи формат."],
      group: 'structural',
      type: 'quiz',
      level: 1,
      title: 'Який це патерн: нормалізація двох API',
      tags: ['structural', 'adapter'],
      question: 'Застосунок отримує прогноз погоди від двох провайдерів з **різними форматами** відповіді. Ви пишете шар, який перетворює обидві відповіді на єдиний внутрішній тип `Forecast`, щоб решта коду не знала про провайдерів. Який це патерн?',
      options: ['Facade', 'Adapter', 'Proxy', 'Decorator'],
      answer: 1,
      hint: 'Обгортка перетворює **чужий** інтерфейс на той, якого очікує ваш код.',
      explanation: `
**Adapter** перетворює несумісний інтерфейс (формат провайдера) на очікуваний (\`Forecast\`). Заміна або додавання провайдера зачіпає лише його адаптер.

- **Facade** спрощує складну підсистему, даючи новий зручний інтерфейс (наприклад, один метод \`weather.getToday(city)\` над кешем, геолокацією і запитами). Його часто будують **поверх** адаптерів, але сама нормалізація форматів — це адаптер.
- **Proxy** зберігає той самий інтерфейс і контролює доступ (кеш, ліниве завантаження).
- **Decorator** зберігає інтерфейс і додає поведінку (логування, ретраї).
`
    },
    {
      id: 'pat-adapter',
      group: 'structural',
      type: 'code',
      level: 1,
      title: 'Adapter: нормалізація двох форматів користувача',
      tags: ['structural', 'adapter'],
      description: `
**Завдання.** Бекенд віддає користувачів у двох форматах (стара і нова версія API). Реалізуйте адаптер \`adaptUser(source, raw)\`, що повертає єдиний доменний тип, і \`adaptUsers(source, list)\` для масиву.

**Де трапляється:** інтеграція двох версій API чи сторонніх сервісів.

**Формат \`'v1'\`:**
\`\`\`js
{ id: 17, first_name: 'Ann', last_name: 'Lee', email_address: 'ann@x.com',
  created: '2024-01-05T10:00:00.000Z', is_active: 1 }
\`\`\`
**Формат \`'v2'\`:**
\`\`\`js
{ uuid: 'a1b2', name: { first: 'Ann', last: 'Lee' },
  contacts: [{ type: 'phone', value: '+380501112233' }, { type: 'email', value: 'ann@x.com' }],
  createdAt: 1704448800000, status: 'active' }   // або 'blocked'
\`\`\`
**Доменний тип:**
\`\`\`js
{ id: string, fullName: string, email: string | null, createdAt: number /* мс */, active: boolean }
\`\`\`

- \`id\` — завжди рядок; \`fullName\` — ім'я та прізвище через пробіл, відсутні/порожні частини пропускаються;
- \`email\` — \`null\`, якщо його немає (\`email_address\` відсутній або порожній; у v2 немає контакту з \`type: 'email'\`);
- \`createdAt\` — мілісекунди (\`Date.parse\` для рядка v1);
- \`active\` — у v1 \`is_active === 1\`, у v2 \`status === 'active'\`;
- невідоме джерело → \`Error\` з повідомленням \`Unknown source: <source>\`.

**Як це працює:** Для кожного формату — своя функція-адаптер, що перетворює сирий об'єкт на один спільний вигляд. adaptUser обирає адаптер за source, adaptUsers просто мапить список. Решта застосунку працює лише зі спільним форматом.
`,
      starter: `// Кожному формату — свій адаптер у спільний вигляд:
// { id: string, fullName, email (або null), createdAt: number (ms), active: boolean }
const adapters = {
  v1: (raw) => {
    // TODO: id → рядок, first_name + last_name → fullName, created → Date.parse, is_active === 1
  },
  v2: (raw) => {
    // TODO: аналогічно для нового формату
  }
};

function adaptUser(source, raw) {
  // TODO: знайти адаптер за source (немає → помилка) і застосувати
}

function adaptUsers(source, list) {
  // TODO: map по списку через adaptUser
}
`,
      solution: `const joinName = (...parts) => parts.filter(Boolean).join(' ');

const adapters = {
  v1: (raw) => ({
    id: String(raw.id),
    fullName: joinName(raw.first_name, raw.last_name),
    email: raw.email_address || null,
    createdAt: Date.parse(raw.created),
    active: raw.is_active === 1,
  }),
  v2: (raw) => ({
    id: String(raw.uuid),
    fullName: joinName(raw.name?.first, raw.name?.last),
    email: raw.contacts?.find((c) => c.type === 'email')?.value ?? null,
    createdAt: raw.createdAt,
    active: raw.status === 'active',
  }),
};

function adaptUser(source, raw) {
  const adapter = Object.hasOwn(adapters, source) ? adapters[source] : null;
  if (!adapter) throw new Error(\`Unknown source: \${source}\`);
  return adapter(raw);
}

function adaptUsers(source, list) {
  return list.map((raw) => adaptUser(source, raw));
}
`,
      hints: [
        'Заведіть об\'єкт-реєстр адаптерів `{ v1: raw => ..., v2: raw => ... }` — новий формат додається новим ключем (Open/Closed).',
        'Для `fullName` зручно `[first, last].filter(Boolean).join(\' \')`. Для email у v2 — `contacts?.find(c => c.type === \'email\')?.value ?? null`.'
      ],
      tests: [
        { name: 'v1 → доменний тип', code: "expect(adaptUser('v1', { id: 17, first_name: 'Ann', last_name: 'Lee', email_address: 'ann@x.com', created: '2024-01-05T10:00:00.000Z', is_active: 1 })).toEqual({ id: '17', fullName: 'Ann Lee', email: 'ann@x.com', createdAt: 1704448800000, active: true });" },
        { name: 'v2 → доменний тип', code: "expect(adaptUser('v2', { uuid: 'a1b2', name: { first: 'Ann', last: 'Lee' }, contacts: [{ type: 'phone', value: '+380501112233' }, { type: 'email', value: 'ann@x.com' }], createdAt: 1704448800000, status: 'active' })).toEqual({ id: 'a1b2', fullName: 'Ann Lee', email: 'ann@x.com', createdAt: 1704448800000, active: true });" },
        { name: 'обидва формати однієї людини дають однаковий результат', code: "const a = adaptUser('v1', { id: 5, first_name: 'Ivan', last_name: 'Bo', email_address: 'i@b.ua', created: '2024-03-01T00:00:00.000Z', is_active: 0 });\nconst b = adaptUser('v2', { uuid: '5', name: { first: 'Ivan', last: 'Bo' }, contacts: [{ type: 'email', value: 'i@b.ua' }], createdAt: Date.parse('2024-03-01T00:00:00.000Z'), status: 'blocked' });\nexpect(a).toEqual(b);\nexpect(a.active).toBe(false);" },
        { name: 'відсутні email і частини імені', code: "expect(adaptUser('v1', { id: 1, first_name: 'Ann', last_name: '', email_address: '', created: '2024-01-01T00:00:00.000Z', is_active: 1 })).toMatchObject({ fullName: 'Ann', email: null });\nexpect(adaptUser('v2', { uuid: 'x', name: { last: 'Lee' }, contacts: [{ type: 'phone', value: '1' }], createdAt: 0, status: 'active' })).toMatchObject({ fullName: 'Lee', email: null });\nexpect(adaptUser('v2', { uuid: 'y', name: { first: 'A' }, createdAt: 0, status: 'active' }).email).toBeNull();" },
        { name: 'adaptUsers для масиву', code: "const list = adaptUsers('v2', [{ uuid: 'a', name: { first: 'A' }, contacts: [], createdAt: 1, status: 'active' }, { uuid: 'b', name: { first: 'B' }, contacts: [], createdAt: 2, status: 'blocked' }]);\nexpect(list.map(u => [u.id, u.active])).toEqual([['a', true], ['b', false]]);\nexpect(adaptUsers('v1', [])).toEqual([]);" },
        { name: 'невідоме джерело', code: "expect(() => adaptUser('v3', {})).toThrow('Unknown source: v3');\nexpect(() => adaptUser('toString', {})).toThrow('Unknown source: toString');" }
      ],
      explanation: `
Адаптер ізолює **формат бекенду** від **доменної моделі** застосунку. Компоненти працюють лише з \`{ id, fullName, email, createdAt, active }\` і не знають про \`first_name\` чи \`contacts\`. Коли бекенд змінить формат — правиться один адаптер, а не 30 компонентів.

Реєстр адаптерів за ключем — водночас **Strategy** і приклад **Open/Closed**: формат v3 додається новим записом.

**Складність:** O(n) для масиву (O(k) на пошук email серед контактів).

**Типові помилки:** \`id\` різних типів (\`17\` vs \`'17'\`) — потім ламаються порівняння \`===\` і ключі Map; рядок дати замість числа в одному з форматів; \`'Ann undefined'\` через шаблонний рядок без фільтрації; \`adapters[source]\` без \`hasOwn\` (\`'toString'\` знайдеться в прототипі).

**Де живе адаптер:** у шарі API (\`entities/user/api\`), одразу після \`fetch\` — щоб «сирі» дані не розповзалися застосунком. З TypeScript типи \`UserV1Dto\`, \`UserV2Dto\` і доменний \`User\`, а runtime-валідація (zod) — там же.

**Що можуть спитати далі:** чим Adapter відрізняється від Facade? Як адаптувати дані у зворотний бік (доменний тип → payload для POST)? Як валідувати відповідь бекенду?
`
    },
    {
      id: 'pat-decorators',
      group: 'structural',
      type: 'code',
      level: 3,
      title: 'Декоратори функцій: withCache і withRetry',
      tags: ['structural', 'decorator', 'async', 'closures'],
      description: `
**Завдання.** Реалізуйте два декоратори (функції вищого порядку), які можна комбінувати: \`withRetry(withCache(fetchUser))\`.

**Де трапляється:** кеш і ретраї навколо запитів до API.

### \`withCache(fn, { ttl = Infinity, key } = {})\`
- кешує результат за ключем; ключ за замовчуванням — \`JSON.stringify(args)\`, або \`key(...args)\`, якщо передано;
- запис вважається простроченим, якщо \`Date.now() - часЗапису >= ttl\`;
- якщо \`fn\` повертає **проміс**, кешується сам проміс (паралельні виклики з тими самими аргументами отримують **той самий** проміс, \`fn\` викликається один раз); якщо проміс відхилився — запис **видаляється** з кешу;
- якщо \`fn\` кинула синхронну помилку — нічого не кешується;
- зберігає \`this\`; у декорованої функції є метод \`clear()\`.

### \`withRetry(fn, { retries = 2, delay = 0, shouldRetry = () => true } = {})\`
- повертає **async**-функцію, що викликає \`fn\` (з тим самим \`this\` і аргументами) до \`1 + retries\` разів, доки вона не завершиться успішно (синхронний \`throw\` і відхилений проміс — обидва помилки);
- між спробами чекає \`delay\` мс через \`setTimeout\` (якщо \`delay > 0\`);
- якщо \`shouldRetry(error)\` повертає \`false\` — одразу відхиляється з цією помилкою;
- якщо всі спроби невдалі — відхиляється з **останньою** помилкою.

**Як це працює:** Декоратор повертає нову функцію з тією самою сигнатурою, що викликає оригінал. withCache зберігає результат за ключем аргументів (Map) і часом запису; withRetry у циклі ловить помилку і пробує ще раз, поки не вичерпані спроби.
`,
      starter: `// План:
// 1. withCache: Map ключ → { value, time }; ключ за замовчуванням — JSON.stringify(args)
// 2. Є свіжий запис (time + ttl) → повернути; інакше викликати fn і зберегти; відхилений проміс — видалити з кешу
// 3. withRetry: цикл спроб; помилка і shouldRetry(err) і спроби лишились → почекати delay і повторити

function withCache(fn, { ttl = Infinity, key } = {}) {
  // TODO
  return fn;
}

function withRetry(fn, { retries = 2, delay = 0, shouldRetry = () => true } = {}) {
  // TODO
  return fn;
}
`,
      solution: `function withCache(fn, { ttl = Infinity, key = (...args) => JSON.stringify(args) } = {}) {
  const cache = new Map(); // key -> { value, time }

  function cached(...args) {
    const k = key(...args);
    const hit = cache.get(k);
    if (hit && Date.now() - hit.time < ttl) return hit.value;

    const value = fn.apply(this, args); // синхронний throw -> нічого не кешуємо
    cache.set(k, { value, time: Date.now() });

    if (value && typeof value.then === 'function') {
      // кешуємо проміс (дедуплікація паралельних запитів), але не кешуємо помилки
      value.then(undefined, () => {
        if (cache.get(k)?.value === value) cache.delete(k);
      });
    }
    return value;
  }

  cached.clear = () => cache.clear();
  return cached;
}

function withRetry(fn, { retries = 2, delay = 0, shouldRetry = () => true } = {}) {
  return async function (...args) {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn.apply(this, args); // await ловить і throw, і reject
      } catch (err) {
        lastError = err;
        if (attempt === retries || !shouldRetry(err)) break;
        if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  };
}
`,
      hints: [
        'Обидва декоратори повертають звичайну `function` (не стрілкову), щоб передати `this` через `fn.apply(this, args)`. Стан (кеш) живе в замиканні.',
        '`withCache`: зберігайте `{ value, time }`. Якщо `value` — thenable, підпишіться на відхилення і видаліть запис (перевірте, що в кеші досі **саме цей** проміс). Час беріть з `Date.now()` — тести використовують фейкові таймери.',
        '`withRetry`: цикл `for (attempt = 0; attempt <= retries; attempt++)` з `try { return await fn.apply(this, args) } catch`. У `catch` — вихід, якщо спроби скінчилися або `shouldRetry` повернув `false`, інакше `await` проміс із `setTimeout`. Після циклу — `throw lastError`.'
      ],
      tests: [
        { name: 'withCache: кешує за аргументами', code: "const fn = mockFn((a, b) => a + b);\nconst c = withCache(fn);\nexpect(c(1, 2)).toBe(3);\nexpect(c(1, 2)).toBe(3);\nexpect(c(2, 1)).toBe(3);\nexpect(fn).toHaveBeenCalledTimes(2);" },
        { name: 'withCache: this і власний key', code: "const obj = { base: 10, calc: withCache(function (o) { return this.base + o.n; }, { key: (o) => o.n }) };\nexpect(obj.calc({ n: 1, extra: 'a' })).toBe(11);\nobj.base = 100;\nexpect(obj.calc({ n: 1, extra: 'b' })).toBe(11);\nexpect(obj.calc({ n: 2 })).toBe(102);" },
        { name: 'withCache: ttl за Date.now()', code: "useFakeTimers();\nconst fn = mockFn(x => x * 2);\nconst c = withCache(fn, { ttl: 1000 });\nc(1);\nadvanceTimersByTime(999);\nc(1);\nexpect(fn).toHaveBeenCalledTimes(1);\nadvanceTimersByTime(1);\nc(1);\nexpect(fn).toHaveBeenCalledTimes(2);" },
        { name: 'withCache: дедуплікація промісів', code: "const fn = mockFn(async (id) => ({ id }));\nconst c = withCache(fn);\nconst p1 = c(1);\nconst p2 = c(1);\nexpect(p1).toBe(p2);\nexpect(fn).toHaveBeenCalledTimes(1);\nawait expect(p1).resolves.toEqual({ id: 1 });" },
        { name: 'withCache: відхилений проміс не кешується; clear', code: "let n = 0;\nconst fn = mockFn(async () => { n++; if (n === 1) throw new Error('fail'); return 'ok'; });\nconst c = withCache(fn);\nawait expect(c()).rejects.toThrow('fail');\nawait flushPromises();\nawait expect(c()).resolves.toBe('ok');\nawait expect(c()).resolves.toBe('ok');\nexpect(fn).toHaveBeenCalledTimes(2);\nc.clear();\nawait c();\nexpect(fn).toHaveBeenCalledTimes(3);" },
        { name: 'withRetry: повторює до успіху з затримкою', code: "useFakeTimers();\nlet n = 0;\nconst fn = mockFn(async (x) => { n++; if (n < 3) throw new Error('fail ' + n); return x + '!'; });\nconst p = withRetry(fn, { retries: 3, delay: 100 })('hi');\nawait flushPromises();\nexpect(fn).toHaveBeenCalledTimes(1);\nadvanceTimersByTime(99);\nawait flushPromises();\nexpect(fn).toHaveBeenCalledTimes(1);\nadvanceTimersByTime(1);\nawait flushPromises();\nexpect(fn).toHaveBeenCalledTimes(2);\nadvanceTimersByTime(100);\nawait flushPromises();\nawait expect(p).resolves.toBe('hi!');\nexpect(fn).toHaveBeenCalledTimes(3);" },
        { name: 'withRetry: після всіх спроб — остання помилка', code: "let n = 0;\nconst fn = mockFn(() => { n++; throw new Error('fail ' + n); });\nconst result = await withRetry(fn, { retries: 2 })().then(() => 'resolved', (e) => e.message);\nexpect(result).toBe('fail 3');\nexpect(fn).toHaveBeenCalledTimes(3);" },
        { name: 'withRetry: shouldRetry і this', code: "const fn = mockFn(async () => { const e = new Error('404'); e.status = 404; throw e; });\nconst r = withRetry(fn, { retries: 5, shouldRetry: (e) => e.status >= 500 });\nawait expect(r()).rejects.toThrow('404');\nexpect(fn).toHaveBeenCalledTimes(1);\nconst obj = { v: 7, get: withRetry(async function () { return this.v; }) };\nawait expect(obj.get()).resolves.toBe(7);" },
        { name: 'композиція withRetry(withCache(fn))', code: "let n = 0;\nconst fn = mockFn(async (id) => { n++; if (n === 1) throw new Error('flaky'); return 'user' + id; });\nconst getUser = withRetry(withCache(fn), { retries: 1 });\nawait expect(getUser(1)).resolves.toBe('user1');\nawait expect(getUser(1)).resolves.toBe('user1');\nexpect(fn).toHaveBeenCalledTimes(2);" }
      ],
      explanation: `
**Декоратор** зберігає інтерфейс функції і додає поведінку. Завдяки цьому декоратори **компонуються**: \`withRetry(withCache(fetchUser))\`. Порядок важливий: тут кожна повторна спроба теж іде через кеш, а відхилений проміс з кешу видаляється — тож повтор справді звертається до мережі.

**Ключові деталі \`withCache\`:**
- кешування **промісу**, а не значення, дає дедуплікацію паралельних запитів («один запит на 5 однакових компонентів»);
- видалення відхиленого промісу — інакше помилка мережі «закешується» назавжди;
- перевірка \`cache.get(k)?.value === value\` — щоб не видалити новіший запис;
- \`JSON.stringify\` як ключ — просто, але повільно для великих аргументів і чутливо до порядку ключів; для об'єктів краще явний \`key\` або \`WeakMap\`.

**Ключові деталі \`withRetry\`:**
- \`await\` всередині \`try\` уніфікує синхронні та асинхронні помилки;
- \`shouldRetry\` — не повторювати 4xx (помилка клієнта не зникне), повторювати 5xx/мережеві;
- у продакшені — **експоненційна затримка з jitter** (\`delay * 2 ** attempt + random\`), щоб тисячі клієнтів не «били» сервер синхронно, і підтримка \`AbortSignal\`.

**Складність:** кеш — O(1) + вартість обчислення ключа; ретрай — до \`retries + 1\` викликів.

**Типові помилки:** стрілкова обгортка (втрата \`this\`); кешування помилок; \`setTimeout\` без \`await\`; повтор після останньої спроби (зайве очікування); обмеження розміру кешу відсутнє (витік пам'яті — потрібен LRU).

**Що можуть спитати далі:** як додати LRU-обмеження? Як реалізувати stale-while-revalidate? Як скасувати ретраї через \`AbortController\`? Чим ці декоратори відрізняються від TC39-декораторів \`@cached\`?
`
    },
    // ---------------------------------------------------------------- creational
    {
      id: 'pat-creational', why: ["Ні: у JS достатньо модуля — класи з getInstance зайві.","Так: модуль виконується один раз — природний синглтон.","Ні: на сервері один екземпляр ділять усі запити — витік даних.","Ні: Builder — для складних об'єктів, не для двох параметрів.","Так: глобальний стан ускладнює тести й залежності."],
      group: 'creational',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Module, Singleton, Factory, Builder у JavaScript',
      tags: ['creational', 'singleton', 'factory'],
      question: 'Розкажіть про патерни Module, Singleton, Factory і Builder. Як вони виглядають у сучасному JS? Які плюси й мінуси Singleton і чому ES-модуль — це фактично синглтон? Оберіть **усі** правильні твердження.',
      choices: [
        'Singleton у JS слід робити класом зі `static getInstance()`, бо ES-модулі одного екземпляра не гарантують',
        'ES-модуль виконується один раз і кешується, тому експортований з нього обʼєкт — фактично синглтон',
        'Синглтон безпечний для SSR: один екземпляр на сервері коректно обслуговує запити всіх користувачів',
        'Builder виправданий щоразу, коли у функції понад два параметри, — обʼєкт опцій тут завжди гірший',
        'Головний мінус Singleton — глобальний стан: приховані залежності й стан, що протікає між тестами',
      ],
      correct: [1, 4],
      hint: 'IIFE і замикання, кеш модулів, функції-фабрики замість new, fluent-інтерфейс.',
      answer: `
**Module** — інкапсуляція приватного стану і публічного API. До ES-модулів — IIFE + замикання (revealing module pattern):
\`\`\`js
const counter = (() => {
  let count = 0;                       // приватне
  return { inc: () => ++count, get: () => count };
})();
\`\`\`
Сьогодні — ES-модулі: усе, що не \`export\`, приватне для модуля.

**Singleton** — гарантує один екземпляр і глобальну точку доступу (конфіг, логер, підключення, стор).
\`\`\`js
// ES-модуль виконується ОДИН раз і кешується — усі імпортери отримують той самий об'єкт
export const store = createStore(reducer);
\`\`\`
Класичний варіант з \`static getInstance()\` у JS майже не потрібен.
- **Плюси:** єдиний спільний ресурс, ліниве створення, економія.
- **Мінуси:** це **глобальний стан** — приховані залежності, складне тестування (стан протікає між тестами, важко підмінити), гонки при ініціалізації, проблеми з SSR (один екземпляр на всі запити користувачів!). Альтернатива — створювати екземпляр у точці входу і передавати через DI/контекст.
- Нюанс: «один на модуль» ламається, якщо пакет потрапив у бандл двічі (дві версії, dual package hazard) або в різні iframe/воркери.

**Factory** — функція/метод, що інкапсулює створення об'єктів; клієнт не знає конкретного класу.
\`\`\`js
function createNotifier(type, options) {
  switch (type) {
    case 'toast': return new ToastNotifier(options);
    case 'email': return new EmailNotifier(options);
    default: throw new Error(\`Unknown notifier: \${type}\`);
  }
}
\`\`\`
У JS дуже поширені **фабричні функції** замість класів (\`createStore\`, \`createApp\`, \`createRouter\`): приватність через замикання, немає проблем з \`this\` і \`new\`. Abstract Factory — сімейство пов'язаних фабрик (наприклад, набір UI-компонентів під тему/платформу).

**Builder** — покрокова побудова складного об'єкта через fluent-інтерфейс; корисний, коли багато необов'язкових параметрів:
\`\`\`js
const query = new QueryBuilder('users')
  .where('age', '>', 18)
  .orderBy('name')
  .limit(10)
  .build();
\`\`\`
Приклади: query builders (Knex, Prisma), \`URLSearchParams\`, конфігуратори (\`yup.string().email().required()\`), тестові дата-білдери (\`aUser().withRole('admin').build()\`). У JS часто достатньо об'єкта опцій з деструктуризацією; Builder виправданий, коли є порядок кроків, валідація чи кілька представлень результату.
`,
      keyPoints: [
        'Module: приватний стан через замикання/IIFE або ES-модулі',
        'ES-модуль виконується один раз і кешується — природний синглтон',
        'Мінуси Singleton: глобальний стан, тестування, SSR, дублікати пакета',
        'Factory: інкапсуляція створення; фабричні функції замість класів',
        'Builder: fluent-інтерфейс для складних об\'єктів з багатьма опціями'
      ],
      followUps: ['Чому синглтон-стор небезпечний при SSR?', 'Чим фабрична функція краща за клас, а чим гірша?', 'Як протестувати модуль, що експортує синглтон?']
    },
    {
      id: 'pat-quiz-esm-singleton', why: ["Ні: модуль виконується один раз.","Ні: модуль виконується один раз, а лічильник спільний.","Ні: модуль не виконується двічі.","Так: один екземпляр, обидва імпорти збільшили лічильник."],
      group: 'creational',
      type: 'quiz',
      level: 2,
      title: 'ES-модуль як синглтон',
      tags: ['creational', 'singleton', 'modules'],
      question: `
Що виведе застосунок (точка входу — \`main.js\`)?

\`\`\`js
// store.js
console.log('store init');
export const store = { count: 0 };

// a.js
import { store } from './store.js';
store.count++;

// b.js
import { store } from './store.js';
store.count++;

// main.js
import './a.js';
import './b.js';
import { store } from './store.js';
console.log(store.count);
\`\`\`
`,
      options: [
        '`store init` тричі, потім `0`',
        '`store init` тричі, потім `1`',
        '`store init` двічі, потім `2`',
        '`store init` один раз, потім `2`'
      ],
      answer: 3,
      hint: 'Скільки разів виконується код модуля, якщо його імпортують з кількох місць за тим самим специфікатором?',
      explanation: `
Кожен модуль (за однаковим резолвленим URL/шляхом) **виконується один раз** і зберігається в карті модулів (module map). Усі наступні імпорти отримують зв'язки на **той самий** екземпляр. Тому \`store init\` виводиться один раз, а \`a.js\` і \`b.js\` змінюють один і той самий об'єкт: \`0 → 1 → 2\`.

Порядок: граф обходиться в глибину, модулі виконуються в post-order: \`store.js\` (лог), \`a.js\` (1), \`b.js\` (2), \`main.js\` (вивід 2).

- «Тричі» — так було б, якби кожен імпорт створював нову копію модуля.
- Нюанси, коли «синглтон» стає не одним: різні URL одного файлу (\`./store.js?v=1\` і \`./store.js\`), дві копії пакета в node_modules, окремі воркери/iframe — у кожного своя карта модулів. Те саме з CommonJS: кеш \`require\` за повним шляхом файлу.
`
    },
    {
      id: 'pat-url-builder',
      group: 'creational',
      type: 'code',
      level: 2,
      title: 'Builder: конструктор URL з fluent-інтерфейсом',
      tags: ['creational', 'builder'],
      description: `
**Завдання.** Реалізуйте клас \`UrlBuilder\` з ланцюжковим (fluent) інтерфейсом:

**Де трапляється:** збирання запитів до API з фільтрами.

- \`new UrlBuilder(base)\` — базова адреса (\`'https://api.example.com'\` або з кінцевим \`/\`);
- \`.path(...segments)\` — додає сегменти шляху; кожен сегмент кодується \`encodeURIComponent\`, приводиться до рядка; зайві \`/\` на початку/кінці сегмента-рядка прибираються; можна викликати кілька разів;
- \`.query(key, value)\` — додає параметр: \`null\`/\`undefined\` **пропускаються**; масив → повторюваний ключ (\`?tag=a&tag=b\`); ключ і значення кодуються \`encodeURIComponent\` (пробіл → \`%20\`);
- \`.query(object)\` — те саме для кожної пари об'єкта;
- \`.hash(value)\` — фрагмент \`#...\` (кодується \`encodeURIComponent\`);
- \`.build()\` — повертає рядок. Параметри — у порядку додавання.

Усі методи, крім \`build\`, повертають \`this\`. \`build()\` можна викликати кілька разів.

\`\`\`js
new UrlBuilder('https://api.example.com/')
  .path('users', 42, 'posts')
  .query({ page: 2, q: 'hello world', draft: null })
  .query('tag', ['js', 'css'])
  .hash('top')
  .build();
// 'https://api.example.com/users/42/posts?page=2&q=hello%20world&tag=js&tag=css#top'
\`\`\`

**Як це працює:** Кожен метод змінює внутрішній стан і повертає this — так виходить ланцюжок. build() збирає все в рядок наприкінці: базу, сегменти шляху, query (з кодуванням) і hash.
`,
      starter: `// План:
// 1. Зберігати базу, сегменти шляху, пари query і hash
// 2. path/query/hash змінюють стан і повертають this
// 3. build(): база + сегменти через '/' (закодовані) + ?query + #hash

class UrlBuilder {
  constructor(base) {
    this.base = base;
  }
  path(...segments) {}
  query(keyOrObject, value) {}
  hash(value) {}
  build() {
    return this.base;
  }
}
`,
      solution: `class UrlBuilder {
  #base;
  #segments = [];
  #params = [];   // масив пар зберігає порядок і дозволяє повтори ключів
  #hash = null;

  constructor(base) {
    this.#base = String(base).replace(/\\/+$/, '');
  }

  path(...segments) {
    for (const s of segments) {
      const clean = String(s).replace(/^\\/+|\\/+$/g, '');
      if (clean) this.#segments.push(encodeURIComponent(clean));
    }
    return this;
  }

  query(keyOrObject, value) {
    if (keyOrObject !== null && typeof keyOrObject === 'object') {
      for (const [k, v] of Object.entries(keyOrObject)) this.query(k, v);
      return this;
    }
    const values = Array.isArray(value) ? value : [value];
    for (const v of values) {
      if (v === null || v === undefined) continue;
      this.#params.push(\`\${encodeURIComponent(keyOrObject)}=\${encodeURIComponent(v)}\`);
    }
    return this;
  }

  hash(value) {
    this.#hash = value;
    return this;
  }

  build() {
    let url = this.#base;
    if (this.#segments.length) url += '/' + this.#segments.join('/');
    if (this.#params.length) url += '?' + this.#params.join('&');
    if (this.#hash !== null && this.#hash !== undefined && this.#hash !== '') url += '#' + encodeURIComponent(this.#hash);
    return url;
  }
}
`,
      hints: [
        'Накопичуйте стан у полях: масив сегментів, масив пар `key=value` (а не об\'єкт — потрібні порядок і повтори ключів), hash. Кожен метод повертає `this`.',
        'У `query` спершу обробіть випадок об\'єкта (рекурсивно викличте себе для кожної пари), потім нормалізуйте значення до масиву: `Array.isArray(v) ? v : [v]` і пропустіть `null`/`undefined`.',
        'У `build` зберіть рядок: база без кінцевого `/` + `/` + сегменти через `/` + `?` + параметри через `&` + `#hash`. `URLSearchParams` тут не підходить — він кодує пробіл як `+`.'
      ],
      tests: [
        { name: 'повний приклад з умови', code: "const url = new UrlBuilder('https://api.example.com/').path('users', 42, 'posts').query({ page: 2, q: 'hello world', draft: null }).query('tag', ['js', 'css']).hash('top').build();\nexpect(url).toBe('https://api.example.com/users/42/posts?page=2&q=hello%20world&tag=js&tag=css#top');" },
        { name: 'методи повертають this', code: "const b = new UrlBuilder('https://x.com');\nexpect(b.path('a')).toBe(b);\nexpect(b.query('k', 1)).toBe(b);\nexpect(b.hash('h')).toBe(b);" },
        { name: 'лише база', code: "expect(new UrlBuilder('https://x.com/').build()).toBe('https://x.com');" },
        { name: 'сегменти: кодування, слеші, кілька викликів', code: "const url = new UrlBuilder('https://x.com').path('/api/', 'v1').path('users/', 'john doe&co').build();\nexpect(url).toBe('https://x.com/api/v1/users/john%20doe%26co');" },
        { name: 'кодування параметрів і пропуск null/undefined', code: "const url = new UrlBuilder('https://x.com').query('a b', 'x&y=z').query('skip', undefined).query('zero', 0).query('empty', '').query('no', false).build();\nexpect(url).toBe('https://x.com?a%20b=x%26y%3Dz&zero=0&empty=&no=false');" },
        { name: 'build можна викликати кілька разів', code: "const b = new UrlBuilder('https://x.com').path('a');\nexpect(b.build()).toBe('https://x.com/a');\nb.query('p', 1);\nexpect(b.build()).toBe('https://x.com/a?p=1');\nexpect(b.build()).toBe('https://x.com/a?p=1');" }
      ],
      explanation: `
Builder накопичує стан покроково і віддає результат у \`build()\`. Fluent-інтерфейс (\`return this\`) робить побудову читабельною і дозволяє умовні кроки:
\`\`\`js
const b = new UrlBuilder(API).path('products');
if (filters.category) b.query('category', filters.category);
\`\`\`

**Складність:** O(n) від кількості частин.

**Чому не \`URLSearchParams\`:** він кодує пробіл як \`+\` (формат \`application/x-www-form-urlencoded\`), а в умові потрібен \`%20\`. Для реального коду \`new URL()\` + \`url.searchParams.append()\` — нормальний вибір, якщо формат влаштовує.

**Типові помилки:** об'єкт для параметрів (втрата повторюваних ключів і порядку); пропуск \`0\`/\`''\`/\`false\` через перевірку \`if (!v)\`; подвійні слеші; відсутнє кодування (\`&\` у значенні ламає URL — це ще й безпекова проблема).

**Варіації:** іммутабельний білдер (кожен метод повертає **новий** білдер — можна безпечно розгалужувати базовий запит); валідація в \`build()\`; той самий патерн для SQL/GraphQL-запитів і тестових даних (\`aUser().admin().build()\`).

**Що можуть спитати далі:** як зробити білдер іммутабельним? Чим Builder відрізняється від Factory? Коли достатньо простого об'єкта опцій?
`
    },
    // ---------------------------------------------------------------- observer
    {
      id: 'pat-observer-pubsub', why: ["Ні: у Pub/Sub є посередник-брокер.","Ні: суб'єкт сам повідомляє спостерігачів.","Ні: Mediator координує логіку, а не лише пересилає.","Ні: суб'єкт тримає посилання — забута відписка дає витік.","Так: різниця в тому, хто знає про підписників."],
      group: 'observer',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Observer, Pub/Sub і Mediator',
      tags: ['behavioral', 'observer', 'pubsub'],
      question: 'Що таке патерн Observer? Чим він відрізняється від Pub/Sub? Що таке Mediator? Де ви бачите ці патерни у фронтенді?',
      choices: [
        'Observer і Pub/Sub — синоніми: в обох видавець і підписник спілкуються через брокер і топіки',
        'В Observer спостерігачі самі періодично опитують субʼєкт, а в Pub/Sub брокер надсилає їм повідомлення',
        'Mediator — це та сама шина подій: він лише пересилає повідомлення, не маючи власної логіки',
        'Забута відписка безпечна: збирач сміття сам прибере спостерігача разом із демонтованим компонентом',
        'В Observer субʼєкт сам тримає список спостерігачів, а в Pub/Sub сторони розвʼязані через брокер',
      ],
      correct: 4,
      hint: 'Хто кого знає: суб\'єкт — спостерігачів, видавець — підписників, компоненти — посередника.',
      answer: `
**Observer** — об'єкт-суб'єкт (subject) тримає список спостерігачів і **сам** сповіщає їх про зміни. Зв'язок прямий: спостерігач підписується безпосередньо на конкретний суб'єкт.
\`\`\`js
class Subject {
  #observers = new Set();
  subscribe(fn) { this.#observers.add(fn); return () => this.#observers.delete(fn); }
  notify(data) { for (const fn of this.#observers) fn(data); }
}
\`\`\`
Приклади: \`addEventListener\` на DOM-елементі, \`MutationObserver\`/\`IntersectionObserver\`, RxJS \`Subject\`, підписка компонентів на стор, \`store.subscribe\` у Redux.

**Pub/Sub (Publish–Subscribe)** — видавці й підписники **не знають один про одного**. Між ними **брокер/шина** (event bus, message broker), повідомлення адресуються **топікам/каналам**:
\`\`\`js
bus.subscribe('cart.updated', renderBadge);   // підписник не знає, хто публікує
bus.publish('cart.updated', { count: 3 });    // видавець не знає, хто слухає
\`\`\`
Приклади: глобальна event bus між мікрофронтендами, \`BroadcastChannel\`, \`postMessage\`, WebSocket-канали, Redis/Kafka на бекенді.

| | Observer | Pub/Sub |
|---|---|---|
| Зв'язок | суб'єкт знає спостерігачів (слабко) | повна розв'язка через посередника |
| Адресація | конкретний об'єкт | топік/канал, часто з wildcard |
| Доставка | зазвичай синхронна | часто асинхронна, може бути між процесами |
| Відстеження | легко | складно («хто це надіслав?») |

**Mediator** — центральний об'єкт, що **координує** взаємодію набору компонентів, щоб вони не посилалися один на одного напряму (зв'язки «багато-до-багатьох» замінюються «багато-до-одного»). Приклад: форма-диригент, що вмикає кнопку «Надіслати», коли всі поля валідні, і скидає залежні поля при зміні країни; диспетчер діалогів; чат-кімната. На відміну від Pub/Sub, медіатор містить **логіку координації**, а не просто пересилає повідомлення.

**Ризики:** витоки пам'яті через забуту відписку (завжди повертайте функцію відписки і викликайте її при демонтажі); нескінченні цикли сповіщень; неявний потік даних (особливо з глобальною шиною — важко дебажити); порядок доставки та помилки в одному підписнику, що ламають решту.
`,
      keyPoints: [
        'Observer: суб\'єкт сам тримає список і сповіщає спостерігачів',
        'Pub/Sub: видавці й підписники розв\'язані через брокер і топіки',
        'Mediator: центральна координація взаємодії компонентів з логікою',
        'Приклади: addEventListener, RxJS, store.subscribe, event bus, BroadcastChannel',
        'Ризики: забута відписка (витоки), неявний потік даних, помилки в підписниках'
      ],
      followUps: ['Як уникнути витоків пам\'яті з підписками?', 'Чому глобальна event bus вважається антипатерном у великих застосунках?', 'Чим RxJS Subject відрізняється від Observable?']
    },
    {
      id: 'pat-quiz-observer-pubsub', why: ["Так: суб'єкт знає своїх спостерігачів.","Так: брокер розв'язує видавців і підписників.","Ні: обидва можуть бути як синхронними, так і асинхронними.","Так: елемент сам тримає слухачів.","Ні: неявні зв'язки через брокер ускладнюють дебаг."],
      group: 'observer',
      type: 'quiz',
      level: 2,
      title: 'Observer vs Pub/Sub',
      tags: ['behavioral', 'observer', 'pubsub'],
      question: 'Оберіть **усі** правильні твердження:',
      options: [
        'В Observer суб\'єкт тримає посилання на своїх спостерігачів і сповіщає їх сам',
        'У Pub/Sub видавці та підписники не знають один про одного і взаємодіють через брокер/канал',
        'Pub/Sub завжди асинхронний, а Observer завжди синхронний',
        '`element.addEventListener(\'click\', fn)` ближчий до Observer, ніж до Pub/Sub',
        'Pub/Sub робить потік даних явнішим і полегшує дебаг порівняно з прямими викликами'
      ],
      answer: [0, 1, 3],
      hint: 'Ключова відмінність — наявність посередника і те, хто про кого знає. Синхронність — це деталь реалізації.',
      explanation: `
**Правильні:**
- Observer: суб'єкт сам керує списком спостерігачів і викликає їх.
- Pub/Sub: повна розв'язка через посередника (шину, брокер) і топіки.
- \`addEventListener\` — підписка безпосередньо на **конкретний об'єкт** (елемент), який сам розсилає події своїм слухачам — це Observer (хоча спливання подій додає трохи «каналу»).

**Неправильні:**
- Синхронність не є визначальною: \`EventTarget.dispatchEvent\` синхронний, але RxJS-суб'єкт може доставляти через планувальник; in-memory шина Pub/Sub часто синхронна, а брокер між сервісами — асинхронний.
- Pub/Sub, навпаки, робить потік **менш явним**: з коду публікації не видно, хто відреагує, а з коду підписника — звідки прийшла подія. Це ціна розв'язки.
`
    },
    {
      id: 'pat-observable',
      group: 'observer',
      type: 'code',
      level: 2,
      title: 'Subject: subscribe / next / error / complete',
      tags: ['behavioral', 'observer'],
      description: `
**Завдання.** Реалізуйте клас \`Subject\` (спрощений RxJS Subject) — суб'єкт патерну Observer з життєвим циклом.

**Де трапляється:** RxJS, потоки подій, реактивні форми.

- \`subscribe(observer)\` — \`observer\` може бути функцією (обробник \`next\`) або об'єктом \`{ next?, error?, complete? }\` (будь-який метод необов'язковий). Повертає **підписку** \`{ unsubscribe() }\`. Кожен виклик \`subscribe\` — окрема підписка (навіть з тим самим обробником); \`unsubscribe\` можна викликати повторно без помилок.
- \`next(value)\` — передає значення всім активним підписникам у порядку підписки.
- \`error(err)\` — передає помилку всім підписникам і **закриває** суб'єкт.
- \`complete()\` — сповіщає всіх про завершення і **закриває** суб'єкт.
- Після закриття \`next\`/\`error\`/\`complete\` ігноруються, а всі підписки знято.
- Підписка на вже закритий суб'єкт одразу викликає \`complete()\` (або \`error(err)\` з тією самою помилкою) у нового спостерігача.
- Відписка під час розсилки безпечна: якщо підписник відписав іншого, до якого черга ще не дійшла, — той **не** отримує поточне значення.
- \`observerCount\` — геттер з кількістю активних підписок.

\`\`\`js
const s = new Subject();
const sub = s.subscribe((v) => console.log('A', v));
s.subscribe({ next: (v) => console.log('B', v), complete: () => console.log('B done') });
s.next(1);         // A 1, B 1
sub.unsubscribe();
s.next(2);         // B 2
s.complete();      // B done
s.next(3);         // нічого
\`\`\`

**Як це працює:** Subject тримає набір підписників. next розсилає значення всім, error/complete розсилають сигнал і закривають суб'єкт — після цього нові значення ігноруються, а нові підписники одразу отримують завершення.
`,
      starter: `// План:
// 1. Set підписників; subscribe приймає функцію або { next, error, complete }
// 2. next — розіслати всім, якщо суб'єкт не закритий
// 3. error/complete — розіслати і закрити; новим підписникам одразу повідомити про завершення
// 4. subscribe повертає { unsubscribe }

class Subject {
  subscribe(observer) {
    // TODO
  }
  next(value) {}
  error(err) {}
  complete() {}
  get observerCount() {
    return 0;
  }
}
`,
      solution: `class Subject {
  #subscribers = new Set(); // кожна підписка — окремий об'єкт-обгортка
  #closed = false;
  #hasError = false;
  #error;

  subscribe(observer) {
    const o = typeof observer === 'function' ? { next: observer } : observer || {};
    if (this.#closed) {
      // запізнілий підписник одразу дізнається, чим усе скінчилося
      if (this.#hasError) o.error?.(this.#error);
      else o.complete?.();
      return { unsubscribe() {} };
    }
    const entry = { o };
    this.#subscribers.add(entry);
    return { unsubscribe: () => { this.#subscribers.delete(entry); } };
  }

  next(value) {
    if (this.#closed) return;
    // ітеруємо по знімку, але перевіряємо, чи підписка ще активна
    for (const entry of [...this.#subscribers]) {
      if (this.#subscribers.has(entry)) entry.o.next?.(value);
    }
  }

  error(err) {
    if (this.#closed) return;
    this.#closed = true;
    this.#hasError = true;
    this.#error = err;
    const list = [...this.#subscribers];
    this.#subscribers.clear();
    for (const entry of list) entry.o.error?.(err);
  }

  complete() {
    if (this.#closed) return;
    this.#closed = true;
    const list = [...this.#subscribers];
    this.#subscribers.clear();
    for (const entry of list) entry.o.complete?.();
  }

  get observerCount() {
    return this.#subscribers.size;
  }
}
`,
      hints: [
        'Нормалізуйте спостерігача: функцію перетворіть на `{ next: fn }`. Зберігайте підписки в `Set` обгорток `{ o }` — так один і той самий обробник може мати дві незалежні підписки.',
        'Для безпечної розсилки ітеруйте по копії `[...set]`, але перед викликом перевіряйте `set.has(entry)` — так відписані під час розсилки не отримають значення.',
        'Тримайте прапорці `closed`/`hasError` і саму помилку. `error`/`complete`: якщо вже закрито — вийти; інакше закрити, скопіювати список, очистити множину і сповістити. У `subscribe` для закритого суб\'єкта одразу викликайте `complete`/`error`.'
      ],
      tests: [
        { name: 'next доходить до всіх у порядку підписки', code: "const s = new Subject();\nconst log = [];\ns.subscribe(v => log.push('A' + v));\ns.subscribe({ next: v => log.push('B' + v) });\ns.next(1); s.next(2);\nexpect(log).toEqual(['A1', 'B1', 'A2', 'B2']);" },
        { name: 'unsubscribe і observerCount', code: "const s = new Subject();\nconst fn = mockFn();\nconst sub = s.subscribe(fn);\nexpect(s.observerCount).toBe(1);\ns.next(1);\nsub.unsubscribe();\nsub.unsubscribe();\ns.next(2);\nexpect(fn.mock.calls).toEqual([[1]]);\nexpect(s.observerCount).toBe(0);" },
        { name: 'одна функція — дві незалежні підписки', code: "const s = new Subject();\nconst fn = mockFn();\nconst a = s.subscribe(fn);\ns.subscribe(fn);\ns.next('x');\nexpect(fn).toHaveBeenCalledTimes(2);\na.unsubscribe();\ns.next('y');\nexpect(fn).toHaveBeenCalledTimes(3);" },
        { name: 'complete закриває суб\'єкт', code: "const s = new Subject();\nconst next = mockFn();\nconst complete = mockFn();\ns.subscribe({ next, complete });\ns.subscribe(() => {});\ns.complete();\ns.next(1);\ns.complete();\nexpect(next).not.toHaveBeenCalled();\nexpect(complete).toHaveBeenCalledTimes(1);\nexpect(s.observerCount).toBe(0);" },
        { name: 'error передає помилку і закриває', code: "const s = new Subject();\nconst err = new Error('boom');\nconst error = mockFn();\nconst complete = mockFn();\ns.subscribe({ error, complete });\ns.error(err);\ns.complete();\ns.error(new Error('other'));\nexpect(error.mock.calls).toEqual([[err]]);\nexpect(complete).not.toHaveBeenCalled();" },
        { name: 'запізнілий підписник отримує complete/error одразу', code: "const s1 = new Subject();\ns1.complete();\nconst complete = mockFn();\ns1.subscribe({ complete });\nexpect(complete).toHaveBeenCalledTimes(1);\nconst s2 = new Subject();\nconst err = new Error('x');\ns2.error(err);\nconst error = mockFn();\nconst sub = s2.subscribe({ error });\nexpect(error).toHaveBeenCalledWith(err);\nexpect(() => sub.unsubscribe()).not.toThrow();\nexpect(() => s2.subscribe(() => {})).not.toThrow();" },
        { name: 'відписка іншого підписника під час розсилки', code: "const s = new Subject();\nconst log = [];\nlet subB;\ns.subscribe(v => { log.push('A' + v); subB.unsubscribe(); });\nsubB = s.subscribe(v => log.push('B' + v));\ns.subscribe(v => log.push('C' + v));\ns.next(1);\nexpect(log).toEqual(['A1', 'C1']);" },
        { name: 'самовідписка не ламає розсилку іншим', code: "const s = new Subject();\nconst log = [];\nconst subA = s.subscribe(v => { log.push('A' + v); subA.unsubscribe(); });\ns.subscribe(v => log.push('B' + v));\ns.next(1); s.next(2);\nexpect(log).toEqual(['A1', 'B1', 'B2']);" }
      ],
      explanation: `
Суб'єкт = список підписок + життєвий цикл (\`active → completed | errored\`). Деталі, які відрізняють продакшен-якість від наївної реалізації:
- **Знімок + перевірка активності** при розсилці — модифікація набору підписників під час ітерації не ламає цикл і не доставляє значення вже відписаним.
- **Обгортка на кожну підписку** — \`unsubscribe\` видаляє саме цю підписку, навіть якщо той самий обробник підписаний двічі.
- **Термінальні стани:** після \`error\`/\`complete\` значень більше немає, а пізні підписники одразу отримують фінальну подію (так поводиться RxJS \`Subject\`).
- Очищення множини при закритті звільняє посилання → немає витоку пам'яті.

**Складність:** \`subscribe\`/\`unsubscribe\` — O(1), \`next\` — O(n).

**Типові помилки:** \`forEach\` по живому \`Set\`/масиву з видаленням під час ітерації; повернення \`unsubscribe\`, що видаляє за посиланням на функцію (ламає подвійні підписки); відсутність обробки «закритого» стану.

**Варіації:** \`BehaviorSubject\` (зберігає поточне значення і віддає його новим підписникам одразу), \`ReplaySubject\` (буфер останніх N значень), холодні \`Observable\` (кожен підписник запускає власне джерело).

**Що можуть спитати далі:** як реалізувати \`BehaviorSubject\`? Що робити, якщо обробник кидає помилку — ізолювати інших підписників? Чим Subject відрізняється від Promise (багато значень vs одне, лінивість)?
`
    },
    {
      id: 'pat-pubsub-wildcard',
      group: 'observer',
      type: 'code',
      level: 3,
      title: 'Pub/Sub-брокер з топіками і wildcard (* та #)',
      tags: ['behavioral', 'pubsub', 'recursion'],
      description: `
**Завдання.** Реалізуйте \`createPubSub()\` — брокер повідомлень з ієрархічними топіками (як topic exchange у RabbitMQ). Топік — рядок із сегментів, розділених крапкою: \`'order.created'\`, \`'app.db.error'\`.

**Де трапляється:** шина подій між модулями, нотифікації.

API:
- \`subscribe(pattern, handler)\` → функція відписки. \`handler(data, topic)\` отримує дані і фактичний топік.
- \`publish(topic, data)\` → кількість викликаних обробників.

Шаблон підписки може містити:
- \`*\` — рівно **один** будь-який сегмент;
- \`#\` — **нуль або більше** сегментів.

| Шаблон | Підходить | Не підходить |
|---|---|---|
| \`user.*\` | \`user.created\` | \`user\`, \`user.profile.updated\` |
| \`user.#\` | \`user\`, \`user.created\`, \`user.profile.updated\` | \`admin.user\` |
| \`*.error\` | \`db.error\` | \`error\`, \`app.db.error\` |
| \`#.error\` | \`error\`, \`app.db.error\` | \`error.log\` |

Правила:
- обробники викликаються в порядку підписки; кожна підписка незалежна (одна функція, підписана двічі, викликається двічі);
- підписки/відписки, зроблені **під час** \`publish\`, на поточну публікацію не впливають.

**Як це працює:** Брокер зберігає пари «шаблон → обробник». publish перевіряє кожен шаблон: '*' відповідає рівно одному слову топіка, '#' — нулю або більше слів. Зручно перевіряти рекурсивно по сегментах.
`,
      starter: `// План:
// 1. Масив підписок { pattern, handler }; subscribe повертає відписку
// 2. matches(pattern, topic): по сегментах через '.'; '*' — рівно один сегмент, '#' — нуль або більше
// 3. publish: викликати обробники підписок, чий шаблон відповідає топіку; повернути кількість

function createPubSub() {
  // TODO
  return {
    subscribe(pattern, handler) {
      return () => {};
    },
    publish(topic, data) {
      return 0;
    }
  };
}
`,
      solution: `function topicMatches(pattern, topic) {
  const p = pattern.split('.');
  const t = topic.split('.');
  // go(i, j): чи підходить хвіст шаблону p[i..] під хвіст топіка t[j..]
  function go(i, j) {
    if (i === p.length) return j === t.length;
    if (p[i] === '#') {
      // '#' поглинає 0 сегментів (йдемо далі по шаблону) або ще один сегмент топіка
      return go(i + 1, j) || (j < t.length && go(i, j + 1));
    }
    if (j === t.length) return false;
    return (p[i] === '*' || p[i] === t[j]) && go(i + 1, j + 1);
  }
  return go(0, 0);
}

function createPubSub() {
  let subscriptions = []; // [{ pattern, handler }] у порядку підписки

  return {
    subscribe(pattern, handler) {
      const sub = { pattern, handler };
      subscriptions = [...subscriptions, sub]; // copy-on-write: поточний publish бачить старий масив
      return () => {
        subscriptions = subscriptions.filter((s) => s !== sub);
      };
    },
    publish(topic, data) {
      const snapshot = subscriptions;
      let count = 0;
      for (const { pattern, handler } of snapshot) {
        if (topicMatches(pattern, topic)) {
          handler(data, topic);
          count++;
        }
      }
      return count;
    },
  };
}
`,
      hints: [
        'Розділіть задачу: окрема функція `topicMatches(pattern, topic)` і сам брокер, що зберігає масив підписок `{ pattern, handler }`.',
        'Зіставлення зручно робити рекурсією по двох індексах `go(i, j)`: кінець шаблону → успіх лише якщо й топік закінчився; `*` → один будь-який сегмент; звичайний сегмент — точний збіг.',
        'Для `#` є два варіанти: він поглинає нуль сегментів (`go(i + 1, j)`) або ще один сегмент топіка (`go(i, j + 1)`). Для «знімка» під час publish використайте copy-on-write: при підписці/відписці створюйте новий масив.'
      ],
      tests: [
        { name: 'точний топік і дані з топіком', code: "const ps = createPubSub();\nconst fn = mockFn();\nps.subscribe('order.created', fn);\nexpect(ps.publish('order.created', { id: 1 })).toBe(1);\nexpect(ps.publish('order.deleted', {})).toBe(0);\nexpect(fn.mock.calls).toEqual([[{ id: 1 }, 'order.created']]);" },
        { name: '* — рівно один сегмент', code: "const ps = createPubSub();\nconst fn = mockFn();\nps.subscribe('user.*', fn);\nps.publish('user.created');\nps.publish('user');\nps.publish('user.profile.updated');\nexpect(fn.mock.calls.map(c => c[1])).toEqual(['user.created']);\nconst g = mockFn();\nps.subscribe('*.error', g);\nps.publish('db.error'); ps.publish('error'); ps.publish('app.db.error');\nexpect(g.mock.calls.map(c => c[1])).toEqual(['db.error']);" },
        { name: '# — нуль або більше сегментів', code: "const ps = createPubSub();\nconst fn = mockFn();\nps.subscribe('user.#', fn);\n['user', 'user.created', 'user.profile.updated', 'admin.user'].forEach(t => ps.publish(t));\nexpect(fn.mock.calls.map(c => c[1])).toEqual(['user', 'user.created', 'user.profile.updated']);\nconst g = mockFn();\nps.subscribe('#.error', g);\n['error', 'app.db.error', 'error.log'].forEach(t => ps.publish(t));\nexpect(g.mock.calls.map(c => c[1])).toEqual(['error', 'app.db.error']);" },
        { name: '# посередині і # сам по собі', code: "const ps = createPubSub();\nconst mid = mockFn();\nconst all = mockFn();\nps.subscribe('a.#.z', mid);\nps.subscribe('#', all);\n['a.z', 'a.b.c.z', 'a.b', 'z'].forEach(t => ps.publish(t));\nexpect(mid.mock.calls.map(c => c[1])).toEqual(['a.z', 'a.b.c.z']);\nexpect(all).toHaveBeenCalledTimes(4);" },
        { name: 'порядок підписки і незалежні підписки', code: "const ps = createPubSub();\nconst log = [];\nconst h = (d, t) => log.push('h:' + t);\nps.subscribe('a.*', h);\nps.subscribe('#', () => log.push('all'));\nps.subscribe('a.b', h);\nexpect(ps.publish('a.b')).toBe(3);\nexpect(log).toEqual(['h:a.b', 'all', 'h:a.b']);" },
        { name: 'відписка', code: "const ps = createPubSub();\nconst fn = mockFn();\nconst off = ps.subscribe('x', fn);\nps.publish('x');\noff();\noff();\nexpect(ps.publish('x')).toBe(0);\nexpect(fn).toHaveBeenCalledTimes(1);" },
        { name: 'зміни під час publish не впливають на поточну публікацію', code: "const ps = createPubSub();\nconst log = [];\nlet offB;\nps.subscribe('t', () => { log.push('A'); offB(); ps.subscribe('t', () => log.push('C')); });\noffB = ps.subscribe('t', () => log.push('B'));\nexpect(ps.publish('t')).toBe(2);\nexpect(log).toEqual(['A', 'B']);\nlog.length = 0;\nps.publish('t');\nexpect(log).toEqual(['A', 'C']);" }
      ],
      explanation: `
**Зіставлення шаблону** — класична рекурсія з двома індексами (схожа на glob-matching). \`#\` дає розгалуження: «поглинути нуль сегментів» або «поглинути ще один». Для довгих топіків з кількома \`#\` рекурсію варто мемоїзувати (O(|p|·|t|)), але для реальних топіків з кількох сегментів це неважливо.

**Знімок через copy-on-write:** підписка/відписка створює новий масив, а \`publish\` ітерує по посиланню, захопленому на початку. Це дешевший і простіший спосіб отримати семантику «зміни під час розсилки діють з наступної публікації» (так само працює Redux \`subscribe\`).

**Складність:** \`publish\` — O(S · L), де S — кількість підписок, L — довжина топіка. Для тисяч підписок шаблони індексують у **trie** за сегментами.

**Відмінність від Observer:** видавець знає лише топік, а не підписників; підписник — лише шаблон. Це розв'язує модулі (наприклад, мікрофронтенди), але ускладнює трасування — у великих системах додають логування/DevTools для шини.

**Що можуть спитати далі:** як ізолювати помилки (один обробник кинув — решта мають отримати повідомлення)? Як зробити доставку асинхронною (\`queueMicrotask\`)? Як додати «sticky»-повідомлення (останнє значення для нових підписників)? Як побудувати trie для швидкого пошуку?
`
    },
    // ---------------------------------------------------------------- behavioral
    {
      id: 'pat-behavioral', why: ["Ні: це Command; Strategy — взаємозамінний алгоритм.","Так: один стан замість купи прапорців.","Ні: обробник може зупинити ланцюжок.","Ні: власні колекції ітеруються через Symbol.iterator.","Ні: це Strategy; Command — об'єкт дії з undo."],
      group: 'behavioral',
      type: 'theory',
      level: 2,
      title: 'Strategy, Command, Iterator, State, Chain of Responsibility',
      tags: ['behavioral', 'strategy', 'command', 'state', 'middleware'],
      question: 'Розкажіть про поведінкові патерни Strategy, Command, Iterator, State (скінченний автомат) і Chain of Responsibility. Де вони трапляються у фронтенді?',
      choices: [
        'Strategy — це обʼєкт дії з методами `execute` і `undo`, який можна зберегти й поставити в чергу',
        'Скінченний автомат замінює набір булевих прапорців одним станом з явно дозволеними переходами',
        'Chain of Responsibility вимагає, щоб кожен обробник у ланцюжку обовʼязково обробив запит',
        'Iterator у JS доступний лише для масивів: власні колекції не можуть брати участь у `for...of`',
        'Command замінює `switch` взаємозамінними алгоритмами, які клієнт обирає під час виконання',
      ],
      correct: 1,
      hint: 'Кожен з них «упаковує» щось в об\'єкт: алгоритм, дію, обхід, стан, обробник.',
      answer: `
**Strategy** — сімейство взаємозамінних алгоритмів за спільним інтерфейсом; клієнт обирає стратегію в рантаймі.
\`\`\`js
const sorters = { price: (a, b) => a.price - b.price, name: (a, b) => a.name.localeCompare(b.name) };
products.toSorted(sorters[sortBy]);
\`\`\`
Приклади: валідатори полів, способи оплати/доставки, стратегії ретраїв, \`Array.prototype.sort(compareFn)\`. Замінює розгалужені \`if/switch\` (OCP).

**Command** — дія, упакована в об'єкт: її можна зберегти, поставити в чергу, логувати, скасувати.
\`\`\`js
const cmd = { execute: () => editor.insert(text), undo: () => editor.remove(text.length) };
history.execute(cmd); history.undo();
\`\`\`
Приклади: undo/redo в редакторах, черга офлайн-операцій, макроси, Redux-actions (дія як дані), палітра команд (Ctrl+K).

**Iterator** — послідовний обхід колекції без розкриття її структури. У JS вбудований протокол:
\`\`\`js
class Range {
  constructor(from, to) { this.from = from; this.to = to; }
  *[Symbol.iterator]() { for (let i = this.from; i <= this.to; i++) yield i; }
}
[...new Range(1, 3)]; // [1, 2, 3]
\`\`\`
Також: генератори для лінивих послідовностей, \`for await\` для пагінованого API (async iterator), Iterator helpers (\`.map\`, \`.take\`).

**State / скінченний автомат (FSM)** — поведінка об'єкта залежить від стану; переходи явні. Замість набору булевих прапорців (\`isLoading\`, \`isError\`, \`isSuccess\` — можуть бути \`true\` одночасно!) — один стан з дозволеними переходами:
\`\`\`text
idle --FETCH--> loading --RESOLVE--> success
                   \\--REJECT--> error --RETRY--> loading
\`\`\`
Неможливі стани стають непредставними. Приклади: форми, кроки візарда, плеєр, з'єднання WebSocket, бібліотека XState, statecharts.

**Chain of Responsibility / Middleware** — запит проходить ланцюжком обробників; кожен вирішує: обробити, змінити і передати далі (\`next\`) або зупинити ланцюжок.
Приклади: Express/Koa middleware, Redux middleware, interceptors в axios, обробка подій зі спливанням (DOM — фактично ланцюжок відповідальності), пайплайн валідації.

**Спільне:** усі ці патерни замінюють жорсткі умовні конструкції на **об'єкти/функції**, які можна підставляти, комбінувати і тестувати окремо.
`,
      keyPoints: [
        'Strategy — взаємозамінні алгоритми за спільним інтерфейсом (замість switch)',
        'Command — дія як об\'єкт: undo/redo, черги, логування',
        'Iterator — протокол Symbol.iterator, генератори, async iterators',
        'State/FSM — явні стани й переходи замість купи булевих прапорців',
        'Chain of Responsibility — middleware, interceptors, спливання подій'
      ],
      followUps: ['Чим Strategy відрізняється від State?', 'Як реалізувати undo для операцій, що не мають простого оберненого кроку?', 'Чому isLoading/isError прапорці гірші за FSM?']
    },
    {
      id: 'pat-strategy-pricing',
      group: 'behavioral',
      type: 'code',
      level: 2,
      title: 'Strategy: стратегії знижок у кошику',
      tags: ['behavioral', 'strategy'],
      description: `
**Завдання.** Реалізуйте розрахунок кошика зі змінними **стратегіями знижок**.

**Де трапляється:** кошики з різними акціями й знижками.

\`checkout(items, strategy = noDiscount)\`:
- \`items\` — масив \`{ name, price, qty }\`;
- \`subtotal\` = сума \`price * qty\`;
- \`strategy(subtotal, items)\` повертає суму знижки; знижка обмежується діапазоном \`[0, subtotal]\`;
- повертає \`{ subtotal, discount, total }\`, усі значення округлені до копійок (\`Math.round(x * 100) / 100\`), де \`total = subtotal - discount\`.

Стратегії (функції, що **повертають** стратегію, крім \`noDiscount\`):
- \`noDiscount\` — знижка 0;
- \`percentOff(percent)\` — \`percent\`% від subtotal;
- \`fixedOff(amount, minSubtotal = 0)\` — фіксована сума, якщо \`subtotal >= minSubtotal\`, інакше 0;
- \`bulkDiscount(minQty, percent)\` — \`percent\`% від вартості **тих позицій**, де \`qty >= minQty\`;
- \`bestOf(...strategies)\` — комбінована стратегія: обирає **максимальну** знижку серед переданих.

\`checkout\` не має знати про конкретні стратегії: будь-яка функція \`(subtotal, items) => number\` має працювати.

\`\`\`js
const cart = [{ name: 'book', price: 200, qty: 1 }, { name: 'pen', price: 10, qty: 10 }];
checkout(cart, percentOff(10));            // { subtotal: 300, discount: 30, total: 270 }
checkout(cart, bulkDiscount(5, 50));       // { subtotal: 300, discount: 50, total: 250 }
checkout(cart, bestOf(percentOff(10), fixedOff(40, 250))); // discount: 40
\`\`\`

**Як це працює:** Стратегія — функція (subtotal, items) → сума знижки. checkout рахує subtotal і викликає передану стратегію, нічого не знаючи про конкретні знижки. Нова акція — нова функція, без змін checkout.
`,
      starter: `// Стратегія знижки: (subtotal, items) → сума знижки в грн
const noDiscount = () => 0;

function percentOff(percent) {
  // TODO: повернути стратегію: відсоток від subtotal
}

function fixedOff(amount, minSubtotal = 0) {
  // TODO: фіксована сума, але лише якщо subtotal >= minSubtotal
}

function bulkDiscount(minQty, percent) {
  // TODO: знижка percent лише на позиції, де qty >= minQty
}

function bestOf(...strategies) {
  // TODO: найбільша знижка з переданих стратегій
}

function checkout(items, strategy = noDiscount) {
  // TODO: subtotal = сума price * qty; знижка = strategy(subtotal, items), не більше subtotal;
  //       повернути { subtotal, discount, total } з округленням до копійок
}
`,
      solution: `const round2 = (x) => Math.round(x * 100) / 100;

const noDiscount = () => 0;

const percentOff = (percent) => (subtotal) => (subtotal * percent) / 100;

const fixedOff = (amount, minSubtotal = 0) => (subtotal) => (subtotal >= minSubtotal ? amount : 0);

const bulkDiscount = (minQty, percent) => (subtotal, items) =>
  items
    .filter((item) => item.qty >= minQty)
    .reduce((sum, item) => sum + (item.price * item.qty * percent) / 100, 0);

// композитна стратегія: сама є стратегією з тим самим інтерфейсом
const bestOf = (...strategies) => (subtotal, items) =>
  Math.max(0, ...strategies.map((s) => s(subtotal, items)));

function checkout(items, strategy = noDiscount) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const raw = strategy(subtotal, items);
  const discount = round2(Math.min(Math.max(raw, 0), subtotal)); // клемп до [0, subtotal]
  return { subtotal: round2(subtotal), discount, total: round2(subtotal - discount) };
}
`,
      hints: [
        'Стратегія — це просто функція `(subtotal, items) => discount`. Фабрики `percentOff(10)` повертають таку функцію, «запам\'ятовуючи» параметри в замиканні.',
        '`checkout` лише рахує subtotal, викликає стратегію і обмежує результат: `Math.min(Math.max(raw, 0), subtotal)`. Не додавайте в нього `if` для конкретних стратегій.',
        '`bestOf` — теж стратегія: викличте кожну передану з тими самими аргументами і поверніть `Math.max(0, ...results)`.'
      ],
      tests: [
        { name: 'без знижки і порожній кошик', code: "expect(checkout([{ name: 'a', price: 50, qty: 2 }])).toEqual({ subtotal: 100, discount: 0, total: 100 });\nexpect(checkout([], percentOff(10))).toEqual({ subtotal: 0, discount: 0, total: 0 });" },
        { name: 'percentOff', code: "const cart = [{ name: 'book', price: 200, qty: 1 }, { name: 'pen', price: 10, qty: 10 }];\nexpect(checkout(cart, percentOff(10))).toEqual({ subtotal: 300, discount: 30, total: 270 });" },
        { name: 'fixedOff з мінімальною сумою', code: "const cart = [{ name: 'book', price: 200, qty: 1 }];\nexpect(checkout(cart, fixedOff(50, 200)).discount).toBe(50);\nexpect(checkout(cart, fixedOff(50, 201)).discount).toBe(0);\nexpect(checkout(cart, fixedOff(30)).total).toBe(170);" },
        { name: 'bulkDiscount лише для позицій з великою кількістю', code: "const cart = [{ name: 'book', price: 200, qty: 1 }, { name: 'pen', price: 10, qty: 10 }];\nexpect(checkout(cart, bulkDiscount(5, 50))).toEqual({ subtotal: 300, discount: 50, total: 250 });\nexpect(checkout(cart, bulkDiscount(20, 50)).discount).toBe(0);" },
        { name: 'bestOf обирає максимальну знижку', code: "const cart = [{ name: 'book', price: 200, qty: 1 }, { name: 'pen', price: 10, qty: 10 }];\nexpect(checkout(cart, bestOf(percentOff(10), fixedOff(40, 250))).discount).toBe(40);\nexpect(checkout(cart, bestOf(percentOff(10), fixedOff(40, 500), bulkDiscount(5, 50))).discount).toBe(50);\nexpect(checkout(cart, bestOf()).discount).toBe(0);" },
        { name: 'знижка обмежена [0, subtotal]', code: "const cart = [{ name: 'a', price: 100, qty: 1 }];\nexpect(checkout(cart, fixedOff(500))).toEqual({ subtotal: 100, discount: 100, total: 0 });\nexpect(checkout(cart, () => -20)).toEqual({ subtotal: 100, discount: 0, total: 100 });" },
        { name: 'округлення до копійок', code: "const r = checkout([{ name: 'a', price: 33.33, qty: 1 }], percentOff(15));\nexpect(r).toEqual({ subtotal: 33.33, discount: 5, total: 28.33 });\nconst r2 = checkout([{ name: 'a', price: 0.1, qty: 1 }, { name: 'b', price: 0.2, qty: 1 }]);\nexpect(r2.subtotal).toBe(0.3);" },
        { name: 'працює з будь-якою новою стратегією (Open/Closed)', code: "const buyTwoGetCheapestFree = (subtotal, items) => items.length >= 2 ? Math.min(...items.map(i => i.price)) : 0;\nconst cart = [{ name: 'a', price: 120, qty: 1 }, { name: 'b', price: 80, qty: 1 }];\nexpect(checkout(cart, buyTwoGetCheapestFree)).toEqual({ subtotal: 200, discount: 80, total: 120 });" }
      ],
      explanation: `
**Strategy** у JS — це просто функції з однаковою сигнатурою. Фабрики (\`percentOff(10)\`) параметризують стратегію через замикання, а \`bestOf\` — **композитна стратегія** (патерн Composite): вона сама має інтерфейс стратегії, тому \`checkout\` про неї нічого не знає.

\`checkout\` закритий для модифікації і відкритий для розширення: нова акція — нова функція, жодних \`if (type === 'black-friday')\`.

**Складність:** O(n) для subtotal і більшості стратегій; \`bestOf\` — O(n · k).

**Про гроші:** float-арифметика дає \`0.1 + 0.2 = 0.30000000000000004\`, тому округлюємо результат. У реальних системах суми зберігають у **копійках (цілих числах)** або використовують decimal-бібліотеки; правило округлення (банківське чи звичайне) — бізнес-вимога.

**Типові помилки:** \`switch\` по назві стратегії всередині \`checkout\`; від'ємний \`total\`; округлення лише \`total\`, а не \`discount\` (сума не сходиться); стратегія, що мутує \`items\`.

**Що можуть спитати далі:** як застосувати **кілька** знижок послідовно (pipeline стратегій)? Як вибирати стратегію за конфігом з бекенду? Чим Strategy відрізняється від State і від простого колбека?
`
    },
    {
      id: 'pat-command-manager',
      group: 'behavioral',
      type: 'code',
      level: 2,
      title: 'Command: undo/redo менеджер',
      tags: ['behavioral', 'command'],
      description: `
**Завдання.** Реалізуйте клас \`CommandManager\` — історію команд з undo/redo (як у текстових і графічних редакторах).

**Де трапляється:** undo/redo в редакторах і конструкторах.

Команда — об'єкт \`{ execute(), undo() }\`.

- \`new CommandManager({ limit = Infinity } = {})\` — \`limit\` — максимальна кількість кроків, які можна скасувати (найстаріші відкидаються);
- \`execute(command)\` — виконує \`command.execute()\`, кладе команду в історію undo і **очищає** історію redo; повертає результат \`execute()\`. Якщо \`execute()\` кинула помилку — помилка пробрасується, історія не змінюється;
- \`undo()\` — скасовує останню команду (\`command.undo()\`), переносить її в redo; повертає \`true\` або \`false\`, якщо скасовувати нічого;
- \`redo()\` — повторно виконує останню скасовану команду (\`command.execute()\`), повертає її в undo; повертає \`true\`/\`false\`;
- геттери \`canUndo\`, \`canRedo\`.

\`\`\`js
const doc = { text: '' };
const type = (s) => ({ execute: () => { doc.text += s; }, undo: () => { doc.text = doc.text.slice(0, -s.length); } });
const history = new CommandManager();
history.execute(type('Hello'));
history.execute(type(' world'));
history.undo();   // doc.text === 'Hello'
history.redo();   // doc.text === 'Hello world'
\`\`\`

**Як це працює:** Команда знає, як виконати себе і як скасувати. Менеджер тримає два стеки: undo і redo. Нове execute очищує redo; undo переносить команду з undo в redo, redo — навпаки.
`,
      starter: `// План:
// 1. Два стеки: undo і redo
// 2. execute: виконати, покласти в undo, очистити redo, врахувати limit
// 3. undo: зняти з undo, викликати undo(), покласти в redo; redo — навпаки
// 4. canUndo/canRedo — чи стеки непорожні

class CommandManager {
  constructor({ limit = Infinity } = {}) {
    // TODO
  }
  execute(command) {
    return command.execute();
  }
  undo() {
    return false;
  }
  redo() {
    return false;
  }
  get canUndo() {
    return false;
  }
  get canRedo() {
    return false;
  }
}
`,
      solution: `class CommandManager {
  #undoStack = [];
  #redoStack = [];
  #limit;

  constructor({ limit = Infinity } = {}) {
    this.#limit = limit;
  }

  execute(command) {
    const result = command.execute(); // якщо кине — до історії не дійдемо
    this.#undoStack.push(command);
    if (this.#undoStack.length > this.#limit) this.#undoStack.shift(); // відкидаємо найстаріший крок
    this.#redoStack = []; // нова дія "розгалужує" історію — redo більше не має сенсу
    return result;
  }

  undo() {
    const command = this.#undoStack.pop();
    if (!command) return false;
    command.undo();
    this.#redoStack.push(command);
    return true;
  }

  redo() {
    const command = this.#redoStack.pop();
    if (!command) return false;
    command.execute();
    this.#undoStack.push(command);
    return true;
  }

  get canUndo() {
    return this.#undoStack.length > 0;
  }

  get canRedo() {
    return this.#redoStack.length > 0;
  }
}
`,
      hints: [
        'Потрібні два стеки: `undoStack` (виконані команди) і `redoStack` (скасовані). `undo` переносить команду з першого в другий, `redo` — навпаки.',
        'У `execute`: спочатку виконайте команду (якщо кине — історія не зміниться), потім `push` в undo і **очистіть** redo. Для `limit` — `shift()` найстарішої команди, якщо стек переріс ліміт.'
      ],
      tests: [
        { name: 'execute / undo / redo', code: "const doc = { text: '' };\nconst type = (s) => ({ execute: () => { doc.text += s; }, undo: () => { doc.text = doc.text.slice(0, -s.length); } });\nconst h = new CommandManager();\nh.execute(type('Hello'));\nh.execute(type(' world'));\nexpect(h.undo()).toBe(true);\nexpect(doc.text).toBe('Hello');\nexpect(h.redo()).toBe(true);\nexpect(doc.text).toBe('Hello world');\nh.undo(); h.undo();\nexpect(doc.text).toBe('');" },
        { name: 'canUndo/canRedo і порожні стеки', code: "const h = new CommandManager();\nexpect(h.canUndo).toBe(false);\nexpect(h.canRedo).toBe(false);\nexpect(h.undo()).toBe(false);\nexpect(h.redo()).toBe(false);\nh.execute({ execute() {}, undo() {} });\nexpect(h.canUndo).toBe(true);\nh.undo();\nexpect(h.canUndo).toBe(false);\nexpect(h.canRedo).toBe(true);" },
        { name: 'нова команда очищає redo', code: "const log = [];\nconst cmd = (n) => ({ execute: () => log.push('do' + n), undo: () => log.push('undo' + n) });\nconst h = new CommandManager();\nh.execute(cmd(1));\nh.execute(cmd(2));\nh.undo();\nh.execute(cmd(3));\nexpect(h.canRedo).toBe(false);\nexpect(h.redo()).toBe(false);\nh.undo(); h.undo();\nexpect(log).toEqual(['do1', 'do2', 'undo2', 'do3', 'undo3', 'undo1']);" },
        { name: 'execute повертає результат команди', code: "const h = new CommandManager();\nexpect(h.execute({ execute: () => 42, undo() {} })).toBe(42);" },
        { name: 'ліміт історії', code: "let value = 0;\nconst add = (n) => ({ execute: () => { value += n; }, undo: () => { value -= n; } });\nconst h = new CommandManager({ limit: 2 });\nh.execute(add(1)); h.execute(add(10)); h.execute(add(100));\nexpect(value).toBe(111);\nh.undo(); h.undo();\nexpect(h.undo()).toBe(false);\nexpect(value).toBe(1);" },
        { name: 'команда з помилкою не потрапляє в історію', code: "const h = new CommandManager();\nh.execute({ execute() {}, undo() {} });\nh.undo();\nexpect(() => h.execute({ execute() { throw new Error('nope'); }, undo() {} })).toThrow('nope');\nexpect(h.canUndo).toBe(false);\nexpect(h.canRedo).toBe(true);" }
      ],
      explanation: `
**Command** упаковує дію разом із способом її скасування. Менеджеру неважливо, що саме робить команда — вставку тексту, переміщення фігури чи видалення рядка таблиці.

Два стеки — класична модель лінійної історії:
- \`execute\` → push в undo, **очистити redo** (нова дія після undo створює нову «гілку» історії, стара гілка втрачається — так поводиться більшість редакторів);
- \`undo\`/\`redo\` перекладають команду між стеками.

**Складність:** O(1) на операцію (\`shift\` для ліміту — O(n), для великих лімітів — кільцевий буфер).

**Типові помилки:** не очищати redo після нової команди (redo застосує дію до вже іншого стану); додавати команду в історію до успішного виконання; зберігати знімок усього стану на кожен крок (memento) там, де достатньо оберненої операції — це пам'ять.

**Альтернативи і розвиток:**
- **Memento** — зберігати знімки стану замість обернених операцій (простіше для іммутабельного стану: Redux undo = масив попередніх станів);
- **злиття команд** (коалесценція): набір тексту по символу зливається в одну команду «ввів слово»;
- **макрокоманди** (Composite): кілька команд як одна для undo;
- колаборативне редагування — OT/CRDT замість простих стеків.

**Що можуть спитати далі:** як зливати послідовні команди введення? Як зберегти історію між перезавантаженнями (серіалізація команд)? Чим Command відрізняється від Redux action?
`
    },
    {
      id: 'pat-state-machine',
      group: 'behavioral',
      type: 'code',
      level: 3,
      title: 'Скінченний автомат: createMachine з guards і actions',
      tags: ['behavioral', 'state', 'fsm'],
      description: `
**Завдання.** Реалізуйте \`createMachine(config)\` — мінімальний скінченний автомат (у дусі XState).

**Де трапляється:** форми, оплата, онбординг: стани без купи прапорців.

\`\`\`js
const machine = createMachine({
  initial: 'idle',
  context: { retries: 0, data: null },
  states: {
    idle:    { on: { FETCH: 'loading' } },
    loading: {
      entry: (ctx) => ({ retries: ctx.retries }),
      on: {
        RESOLVE: { target: 'success', action: (ctx, e) => ({ data: e.data }) },
        REJECT: [
          { target: 'loading', guard: (ctx) => ctx.retries < 2, action: (ctx) => ({ retries: ctx.retries + 1 }) },
          { target: 'failure' },
        ],
      },
    },
    success: {},
    failure: { on: { RETRY: { target: 'loading', action: () => ({ retries: 0 }) } } },
  },
});
machine.send('FETCH');                          // 'loading'
machine.send({ type: 'RESOLVE', data: [1, 2] }); // 'success'
machine.context.data;                           // [1, 2]
\`\`\`

Специфікація:
- \`machine.state\` — назва поточного стану; \`machine.context\` — поточний контекст (початковий об'єкт **не мутується**);
- \`send(event)\` — подія-рядок або об'єкт \`{ type, ...payload }\` (рядок нормалізується до \`{ type }\`); повертає поточний стан після обробки;
- перехід \`states[current].on[type]\` може бути: рядком-ціллю; об'єктом \`{ target?, guard?, action? }\`; масивом таких — береться **перший**, у якого \`guard\` відсутній або повертає \`true\`;
- \`guard(context, event)\` → boolean; \`action\`, \`entry\`, \`exit\` — \`(context, event) =>\` об'єкт-патч, що **зливається** в контекст (або \`undefined\`);
- порядок при переході з \`target\`: \`exit\` старого стану → \`action\` переходу → зміна стану → \`entry\` нового (навіть якщо ціль — той самий стан);
- об'єкт **без \`target\`** — внутрішній перехід: виконується лише \`action\`, без \`exit\`/\`entry\`;
- немає переходу для події (або всі guards хибні) — подія ігнорується;
- \`entry\` початкового стану виконується при створенні з подією \`{ type: 'INIT' }\`;
- ціль, якої немає в \`states\` (або невідомий \`initial\`), → \`Error('Unknown state: <name>')\`;
- \`can(event)\` — чи спричинить подія перехід зараз.

**Як це працює:** Конфіг описує стани і переходи: подія → цільовий стан, guard (умова) і actions (оновлення контексту). send шукає перехід у поточному стані, перевіряє guard і лише тоді змінює стан.
`,
      starter: `// План:
// 1. Поточний стан і копія контексту
// 2. send(event): знайти перехід states[current].on[event.type]
// 3. guard повернув false → нічого не міняти
// 4. actions оновлюють контекст; змінити стан, повернути новий стан

function createMachine({ initial, context = {}, states }) {
  let current = initial;
  return {
    get state() { return current; },
    get context() { return context; },
    send(event) {
      // TODO
      return current;
    },
    can(event) {
      return false;
    }
  };
}
`,
      solution: `function createMachine({ initial, context = {}, states }) {
  const assertState = (name) => {
    if (!Object.hasOwn(states, name)) throw new Error(\`Unknown state: \${name}\`);
  };
  assertState(initial);

  let current = initial;
  let ctx = { ...context }; // не мутуємо об'єкт користувача

  const toEvent = (e) => (typeof e === 'string' ? { type: e } : e);

  function run(fn, event) {
    if (!fn) return;
    const patch = fn(ctx, event);
    if (patch) ctx = { ...ctx, ...patch }; // кожна зміна — новий об'єкт контексту
  }

  function findTransition(event) {
    const def = states[current].on?.[event.type];
    if (!def) return null;
    const candidates = (Array.isArray(def) ? def : [def]).map((t) => (typeof t === 'string' ? { target: t } : t));
    return candidates.find((t) => !t.guard || t.guard(ctx, event)) ?? null;
  }

  run(states[current].entry, { type: 'INIT' });

  return {
    get state() { return current; },
    get context() { return ctx; },
    can(e) {
      return findTransition(toEvent(e)) !== null;
    },
    send(e) {
      const event = toEvent(e);
      const t = findTransition(event);
      if (!t) return current;
      if (t.target === undefined) {
        run(t.action, event); // внутрішній перехід
        return current;
      }
      assertState(t.target);
      run(states[current].exit, event);
      run(t.action, event);
      current = t.target;
      run(states[current].entry, event);
      return current;
    },
  };
}
`,
      hints: [
        'Нормалізуйте подію до об\'єкта, а опис переходу — до масиву об\'єктів `{ target, guard, action }` (рядок `\'loading\'` → `{ target: \'loading\' }`). Тоді пошук переходу — `candidates.find(t => !t.guard || t.guard(ctx, event))`.',
        'Тримайте контекст у локальній змінній і оновлюйте іммутабельно: `ctx = { ...ctx, ...patch }`. Одна допоміжна функція `run(fn, event)` підійде і для `action`, і для `entry`/`exit`.',
        'Порядок у `send`: знайти перехід → якщо немає, повернути стан → якщо немає `target`, лише `action` → інакше перевірити ціль, `exit` → `action` → змінити стан → `entry`. Не забудьте `entry` початкового стану при створенні.'
      ],
      tests: [
        { name: 'простий автомат світлофора', code: "const m = createMachine({ initial: 'green', states: { green: { on: { NEXT: 'yellow' } }, yellow: { on: { NEXT: 'red' } }, red: { on: { NEXT: 'green' } } } });\nexpect(m.state).toBe('green');\nexpect(m.send('NEXT')).toBe('yellow');\nexpect(m.send({ type: 'NEXT' })).toBe('red');\nm.send('NEXT');\nexpect(m.state).toBe('green');" },
        { name: 'невідома подія ігнорується; can()', code: "const m = createMachine({ initial: 'idle', states: { idle: { on: { FETCH: 'loading' } }, loading: {} } });\nexpect(m.send('UNKNOWN')).toBe('idle');\nexpect(m.can('FETCH')).toBe(true);\nexpect(m.can('RESOLVE')).toBe(false);\nm.send('FETCH');\nexpect(m.can('FETCH')).toBe(false);\nexpect(m.send('FETCH')).toBe('loading');" },
        { name: 'action з payload оновлює контекст іммутабельно', code: "const initialCtx = { data: null };\nconst m = createMachine({ initial: 'loading', context: initialCtx, states: { loading: { on: { RESOLVE: { target: 'success', action: (ctx, e) => ({ data: e.data }) } } }, success: {} } });\nconst before = m.context;\nm.send({ type: 'RESOLVE', data: [1, 2] });\nexpect(m.state).toBe('success');\nexpect(m.context).toEqual({ data: [1, 2] });\nexpect(initialCtx).toEqual({ data: null });\nexpect(m.context).not.toBe(before);" },
        { name: 'guards: перший відповідний перехід із масиву', code: "const m = createMachine({ initial: 'loading', context: { retries: 0 }, states: {\n  loading: { on: { REJECT: [\n    { target: 'loading', guard: (ctx) => ctx.retries < 2, action: (ctx) => ({ retries: ctx.retries + 1 }) },\n    { target: 'failure' }\n  ] } },\n  failure: {}\n} });\nm.send('REJECT'); m.send('REJECT');\nexpect(m.state).toBe('loading');\nexpect(m.context.retries).toBe(2);\nm.send('REJECT');\nexpect(m.state).toBe('failure');" },
        { name: 'всі guards хибні — подія ігнорується', code: "const m = createMachine({ initial: 'form', context: { valid: false }, states: { form: { on: { SUBMIT: { target: 'sent', guard: (ctx) => ctx.valid }, VALIDATE: { action: () => ({ valid: true }) } } }, sent: {} } });\nexpect(m.can('SUBMIT')).toBe(false);\nexpect(m.send('SUBMIT')).toBe('form');\nm.send('VALIDATE');\nexpect(m.send('SUBMIT')).toBe('sent');" },
        { name: 'порядок exit → action → entry; entry початкового стану', code: "const log = [];\nconst m = createMachine({ initial: 'a', states: {\n  a: { entry: (c, e) => { log.push('entry a:' + e.type); }, exit: () => { log.push('exit a'); }, on: { GO: { target: 'b', action: () => { log.push('action'); } }, SELF: 'a' } },\n  b: { entry: () => { log.push('entry b'); } }\n} });\nm.send('SELF');\nm.send('GO');\nexpect(log).toEqual(['entry a:INIT', 'exit a', 'entry a:SELF', 'exit a', 'action', 'entry b']);" },
        { name: 'внутрішній перехід без target не викликає exit/entry', code: "const log = [];\nconst m = createMachine({ initial: 'counter', context: { n: 0 }, states: { counter: { entry: () => { log.push('entry'); }, exit: () => { log.push('exit'); }, on: { INC: { action: (ctx, e) => ({ n: ctx.n + (e.by ?? 1) }) } } } } });\nm.send('INC');\nm.send({ type: 'INC', by: 5 });\nexpect(m.context.n).toBe(6);\nexpect(m.state).toBe('counter');\nexpect(log).toEqual(['entry']);" },
        { name: 'невідомий стан', code: "expect(() => createMachine({ initial: 'nope', states: { idle: {} } })).toThrow('Unknown state: nope');\nconst m = createMachine({ initial: 'idle', states: { idle: { on: { GO: 'missing' } } } });\nexpect(() => m.send('GO')).toThrow('Unknown state: missing');" }
      ],
      explanation: `
Скінченний автомат робить поведінку **явною**: усі стани та дозволені переходи описані декларативно, а неможливі комбінації (\`isLoading && isError\`) просто не існують. Конфіг можна візуалізувати, перевіряти і тестувати окремо від UI.

**Ключові рішення:**
- нормалізація подій і переходів зменшує кількість гілок у \`send\`;
- **guards** — умовні переходи (масив = «перший, що підходить»), так моделюються ретраї, валідація, права;
- **іммутабельний контекст** — кожен патч створює новий об'єкт (зручно для React і порівняння за посиланням);
- **внутрішній vs зовнішній перехід**: self-transition з \`target\` перезапускає \`entry\` (наприклад, таймер), а без \`target\` — ні.

**Складність:** O(k) на подію, k — кількість кандидатів переходу.

**Чого бракує до XState/statecharts:** ієрархічні (вкладені) та паралельні стани, історія станів, відкладені переходи (\`after: { 3000: 'idle' }\`), invoked-сервіси (проміси, актори), підписка на зміни, типізація подій.

**Типові помилки:** мутація контексту користувача; виконання \`action\` при хибному guard; неправильний порядок \`exit/action/entry\`; булеві прапорці замість станів.

**Що можуть спитати далі:** як додати підписку \`subscribe(listener)\` для UI? Як реалізувати \`after\` (переходи за таймером)? Як змоделювати форму з кроками і кнопкою «Назад»? Чим State відрізняється від Strategy?
`
    },
    // ---------------------------------------------------------------- middleware-di
    {
      id: 'pat-quiz-middleware-order', why: ["Ні: без await 4 не чекає на внутрішні шари.","Ні: 4 виведеться після 6.","Так: без await другий шар не чекає на третій, і 4 відстає.","Ні: 3 виводиться до 5."],
      group: 'middleware-di',
      type: 'quiz',
      level: 3,
      title: 'Middleware-«цибуля» і забутий await',
      tags: ['behavioral', 'middleware', 'async'],
      question: `
\`compose\` — класична koa-реалізація (кожен middleware отримує \`next\`, що повертає проміс наступного). Що буде в \`ctx.log\` після того, як усі таймери спрацюють?

\`\`\`js
const handler = compose([
  async (ctx, next) => { ctx.log.push(1); await next(); ctx.log.push(6); },
  async (ctx, next) => { ctx.log.push(2); next(); ctx.log.push(5); },   // немає await!
  async (ctx, next) => {
    ctx.log.push(3);
    await new Promise((r) => setTimeout(r, 0));
    ctx.log.push(4);
  },
]);
const ctx = { log: [] };
handler(ctx);
\`\`\`
`,
      options: ['`1 2 3 4 5 6`', '`1 2 3 5 4 6`', '`1 2 3 5 6 4`', '`1 2 5 6 3 4`'],
      answer: 2,
      hint: 'Що чекає перший middleware — завершення **всього** ланцюжка чи лише проміс другого? А коли завершується проміс другого?',
      explanation: `
Покроково:
1. M1: \`1\`, викликає \`next()\` → M2 (синхронно, до першого \`await\`).
2. M2: \`2\`, викликає \`next()\` → M3: \`3\`, доходить до \`await\` таймера і повертає незавершений проміс.
3. M2 **не чекає** його: одразу \`5\`, і проміс M2 завершується.
4. M1 чекав лише проміс M2 — він уже виконаний, тож у мікрозадачі M1 продовжує: \`6\`.
5. Пізніше спрацьовує таймер: M3 пише \`4\`.

Результат: \`1 2 3 5 6 4\` — «цибуля» зламана: M1 (наприклад, логер часу відповіді або error handler) вважає запит завершеним, поки обробник ще працює, а помилки M3 не потраплять у \`try/catch\` M1.

- \`1 2 3 4 5 6\` — так було б з \`await next()\` у M2 (правильна цибуля).
- \`1 2 3 5 4 6\` — якби M3 продовжився мікрозадачею раніше за M1 (наприклад, \`await null\` замість таймера).
- \`1 2 5 6 3 4\` — неможливо: \`next()\` синхронно запускає M3 до його першого \`await\`.

Мораль: у async middleware **завжди** \`await next()\` (або \`return next()\`).
`
    },
    {
      id: 'pat-koa-compose',
      group: 'middleware-di',
      type: 'code',
      level: 3,
      title: 'koa-compose: middleware-ланцюжок з next()',
      tags: ['behavioral', 'middleware', 'async'],
      description: `
**Завдання.** Реалізуйте \`compose(middleware)\` — серце Koa (Chain of Responsibility у формі «цибулі»).

**Де трапляється:** middleware у Koa/Express, перехоплювачі запитів.

\`middleware\` — масив функцій \`(ctx, next) => any\`. \`compose\` повертає функцію \`(ctx, next?) => Promise\`, яка:
- викликає перший middleware з \`ctx\` і функцією \`next\`, що запускає наступний і **повертає проміс** його завершення;
- після останнього middleware \`next\` викликає необов'язкову фінальну функцію \`next\`, передану в composed-функцію (якщо її немає — \`next\` повертає виконаний проміс);
- якщо middleware не викликав \`next\` — решта ланцюжка не виконується;
- завжди повертає **проміс**, навіть якщо middleware синхронні; синхронний \`throw\` будь-якого middleware перетворюється на відхилений проміс;
- повторний виклик \`next()\` в одному middleware → проміс відхиляється з \`Error('next() called multiple times')\`;
- \`compose\` кидає \`TypeError\`, якщо \`middleware\` — не масив або містить не функцію;
- composed-функцію можна викликати багато разів (стан кожного виклику незалежний).

\`\`\`js
const app = compose([
  async (ctx, next) => { ctx.log.push('a1'); await next(); ctx.log.push('a2'); },
  async (ctx, next) => { ctx.log.push('b1'); await next(); ctx.log.push('b2'); },
  (ctx) => { ctx.log.push('handler'); },
]);
const ctx = { log: [] };
await app(ctx); // ctx.log: ['a1', 'b1', 'handler', 'b2', 'a2']
\`\`\`

**Як це працює:** dispatch(i) викликає i-й middleware і передає йому next = () => dispatch(i + 1). Тому код до await next() виконується «на вході», а після — «на виході» (цибуля). Повторний виклик next() — помилка.
`,
      starter: `// План:
// 1. Перевірити, що middleware — масив функцій
// 2. dispatch(i): повторний виклик next для того самого i → помилка
// 3. Викликати middleware[i](ctx, () => dispatch(i + 1)) і обгорнути результат у Promise
// 4. Після останнього — викликати переданий next (якщо є)

function compose(middleware) {
  return function (ctx, next) {
    // TODO
    return Promise.resolve();
  };
}
`,
      solution: `function compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array');
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions');
  }

  return function (ctx, next) {
    let lastIndex = -1; // індекс останнього запущеного middleware — свій для кожного виклику

    function dispatch(i) {
      if (i <= lastIndex) return Promise.reject(new Error('next() called multiple times'));
      lastIndex = i;
      const fn = i === middleware.length ? next : middleware[i];
      if (!fn) return Promise.resolve();
      try {
        // Promise.resolve уніфікує синхронні значення і проміси
        return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err); // синхронний throw -> rejected promise
      }
    }

    return dispatch(0);
  };
}
`,
      hints: [
        'Усе будується навколо рекурсивної функції `dispatch(i)`, яка викликає `middleware[i](ctx, () => dispatch(i + 1))`. Коли `i === middleware.length`, викликається фінальна `next` (якщо є).',
        'Обгорніть виклик у `try { return Promise.resolve(fn(...)) } catch (e) { return Promise.reject(e) }` — так і синхронні middleware, і синхронні помилки дають проміс.',
        'Для захисту від подвійного `next()` зберігайте `lastIndex` останнього запущеного middleware **всередині** composed-функції (а не в `compose`), щоб кожен виклик мав свій стан: `if (i <= lastIndex) return Promise.reject(...)`.'
      ],
      tests: [
        { name: 'порядок «цибулі»', code: "const app = compose([\n  async (ctx, next) => { ctx.log.push('a1'); await next(); ctx.log.push('a2'); },\n  async (ctx, next) => { ctx.log.push('b1'); await next(); ctx.log.push('b2'); },\n  (ctx) => { ctx.log.push('handler'); }\n]);\nconst ctx = { log: [] };\nawait app(ctx);\nexpect(ctx.log).toEqual(['a1', 'b1', 'handler', 'b2', 'a2']);" },
        { name: 'завжди повертає проміс, навіть для синхронних', code: "const app = compose([(ctx, next) => { ctx.n = 1; return next(); }, (ctx) => { ctx.n++; }]);\nconst ctx = {};\nconst p = app(ctx);\nexpect(p).toBeInstanceOf(Promise);\nawait p;\nexpect(ctx.n).toBe(2);\nawait expect(compose([])({})).resolves.toBeUndefined();" },
        { name: 'без next ланцюжок зупиняється', code: "const last = mockFn();\nconst app = compose([(ctx) => { ctx.cached = true; }, last]);\nconst ctx = {};\nawait app(ctx);\nexpect(ctx.cached).toBe(true);\nexpect(last).not.toHaveBeenCalled();" },
        { name: 'фінальний next', code: "const final = mockFn((ctx) => { ctx.log.push('final'); });\nconst app = compose([async (ctx, next) => { ctx.log.push('m'); await next(); ctx.log.push('m after'); }]);\nconst ctx = { log: [] };\nawait app(ctx, final);\nexpect(ctx.log).toEqual(['m', 'final', 'm after']);\nexpect(final).toHaveBeenCalledTimes(1);" },
        { name: 'помилки → відхилений проміс (sync і async)', code: "await expect(compose([() => { throw new Error('sync boom'); }])({})).rejects.toThrow('sync boom');\nawait expect(compose([(c, next) => next(), async () => { throw new Error('async boom'); }])({})).rejects.toThrow('async boom');" },
        { name: 'error-handling middleware ловить помилки нижче', code: "const app = compose([\n  async (ctx, next) => { try { await next(); } catch (e) { ctx.status = 500; ctx.body = e.message; } },\n  async () => { await null; throw new Error('db down'); }\n]);\nconst ctx = {};\nawait app(ctx);\nexpect(ctx).toEqual({ status: 500, body: 'db down' });" },
        { name: 'подвійний next()', code: "const app = compose([async (ctx, next) => { await next(); await next(); }, () => {}]);\nawait expect(app({})).rejects.toThrow('next() called multiple times');" },
        { name: 'валідація і повторні виклики composed-функції', code: "expect(() => compose('nope')).toThrow(TypeError);\nexpect(() => compose([() => {}, 42])).toThrow(TypeError);\nconst app = compose([async (ctx, next) => { ctx.n = (ctx.n || 0) + 1; await next(); }, (ctx) => { ctx.n *= 10; }]);\nconst c1 = {}; const c2 = { n: 1 };\nawait app(c1); await app(c2);\nexpect(c1.n).toBe(10);\nexpect(c2.n).toBe(20);" }
      ],
      explanation: `
\`dispatch(i)\` — рекурсія через колбек: кожен middleware сам вирішує, **коли** (і чи взагалі) запускати решту ланцюжка. Код до \`await next()\` виконується «на шляху вглиб», після — «на шляху назад». Тому один middleware може:
- вимірювати час усього запиту (до і після \`next\`);
- ловити помилки всього, що нижче (\`try { await next() } catch\`);
- обірвати ланцюжок (кеш, авторизація) — просто не викликавши \`next\`.

**Чому \`lastIndex\` всередині повернутої функції:** якщо тримати його в замиканні \`compose\`, другий виклик \`app(ctx)\` вважав би, що всі \`next\` уже викликані.

**Складність:** O(n) викликів на запит; глибина стеку — n.

**Порівняння з Redux middleware:** Redux використовує каррінг \`store => next => action => ...\` і синхронний \`next\`; ланцюжок збирається один раз через \`compose\` функцій (\`reduce\`), а Koa — на кожен запит через \`dispatch(i)\`. Express: \`(req, res, next)\` без промісів — тому «після next» там не працює надійно для async-коду.

**Типові помилки:** забутий \`await\`/\`return\` перед \`next()\` (див. попередній квіз); синхронний \`throw\` не загорнутий у проміс; спільний лічильник для всіх викликів.

**Що можуть спитати далі:** як реалізувати Redux \`applyMiddleware\`? Як додати таймаут на весь ланцюжок? Як зробити роутер поверх \`compose\` (\`router.get('/users', ...)\`)?
`
    },
    {
      id: 'pat-di-ioc', why: ["Ні: Service Locator ховає залежності — гірше тестується.","Так: DI — техніка, DIP — принцип.","Ні: IoC ширший — колбеки й фреймворки теж IoC.","Так: Context постачає залежності вниз по дереву.","Так: усе збирається в одному місці."],
      group: 'middleware-di',
      type: 'theory',
      level: 3,
      title: 'Dependency Injection та Inversion of Control',
      tags: ['di', 'ioc', 'architecture'],
      question: 'Що таке Inversion of Control і Dependency Injection? Чим DI відрізняється від Dependency Inversion Principle і Service Locator? Як DI застосовується у фронтенді? Оберіть **усі** правильні твердження.',
      choices: [
        'Service Locator кращий за DI, бо залежності не засмічують сигнатуру конструктора чи функції',
        'DI — техніка, а Dependency Inversion Principle — принцип дизайну; інжектити можна й конкретний клас',
        'IoC і DI — одне й те саме: будь-яка інверсія керування обовʼязково потребує DI-контейнера',
        'У React роль DI часто виконує Context: Provider реєструє залежність, а `useContext` її отримує',
        'Composition root — одне місце в точці входу, де всі залежності створюються і зшиваються',
      ],
      correct: [1, 3, 4],
      hint: 'Хто створює залежності і хто керує потоком виконання: ваш код чи фреймворк/контейнер?',
      answer: `
**Inversion of Control (IoC)** — загальний принцип: не ваш код керує потоком і створенням об'єктів, а зовнішня сторона (фреймворк, контейнер). «Don't call us, we'll call you». Приклади: обробники подій, хуки життєвого циклу компонентів, middleware, плагіни — фреймворк сам вирішує, коли їх викликати.

**Dependency Injection (DI)** — конкретна форма IoC: об'єкт **не створює** свої залежності сам, а **отримує** їх ззовні.
\`\`\`js
// ❌ жорстка залежність: неможливо підмінити в тесті
class UserService {
  constructor() { this.http = new AxiosClient(); this.cache = localStorage; }
}
// ✅ DI через конструктор / фабрику
class UserService {
  constructor({ http, cache }) { this.http = http; this.cache = cache; }
}
const service = new UserService({ http: createFetchClient(API_URL), cache: memoryCache });
\`\`\`
Способи: через конструктор (найкращий — залежності явні та обов'язкові), через параметри функції, через сеттери/властивості, через контекст.

**Composition root** — одне місце (точка входу застосунку), де всі залежності створюються і «зшиваються». Решта коду про конкретні реалізації не знає.

**DI-контейнер** автоматизує зшивання: реєстрація фабрик, резолв графа, **життєві цикли** — singleton (один на застосунок), transient (новий щоразу), scoped (один на запит/сесію/дерево компонентів). Приклади: Angular DI (\`providedIn: 'root'\`, ієрархічні інжектори), InversifyJS, tsyringe. У React роль DI виконує **Context** (Provider = реєстрація, \`useContext\` = резолв, вкладені провайдери = scope).

**DI vs DIP:** Dependency Inversion Principle — **принцип дизайну** (залежати від абстракцій, а не від деталей). DI — **техніка**, що допомагає його реалізувати. Можна інжектити і конкретний клас (DI без DIP).

**Service Locator** — об'єкт вирішує залежності сам, звертаючись до глобального реєстру: \`const http = locator.get('http')\`. Схоже на DI, але залежності **приховані** всередині коду, а не видно в сигнатурі; важче тестувати й аналізувати. Вважається антипатерном у більшості випадків.

**Плюси DI:** тестованість (фейки замість реальних сервісів), заміна реалізацій (fetch ↔ axios, REST ↔ GraphQL, mock-API для Storybook), конфігурація під середовища, явні залежності.
**Мінуси:** більше «церемоній»; контейнер з магією (рефлексія, декоратори) ускладнює навігацію кодом; ризик **captive dependency** (singleton утримує scoped-залежність). Для більшості фронтенд-застосунків достатньо фабрик + composition root + Context.
`,
      keyPoints: [
        'IoC — фреймворк/контейнер керує потоком і створенням',
        'DI — залежності передаються ззовні (конструктор, параметри, контекст)',
        'Composition root і життєві цикли: singleton, transient, scoped',
        'DI — техніка, DIP — принцип; Service Locator ховає залежності',
        'У фронтенді: Angular DI, React Context, фабрики; плюс — тестованість і заміна реалізацій'
      ],
      followUps: ['Що таке captive dependency?', 'Як React Context працює як DI-механізм і які в нього обмеження?', 'Коли DI-контейнер — це overengineering?']
    },
    {
      id: 'pat-di-container',
      group: 'middleware-di',
      type: 'code',
      level: 3,
      title: 'DI-контейнер: register/resolve, singleton, scoped, цикли',
      tags: ['di', 'ioc'],
      description: `
**Завдання.** Реалізуйте \`createContainer()\` — мінімальний DI-контейнер.

**Де трапляється:** Angular, NestJS, тестування з підміною залежностей.

**Кореневий контейнер:**
- \`register(name, factory, { lifetime = 'transient' } = {})\` — реєструє сервіс; повертає контейнер (для ланцюжка). \`factory(resolve)\` отримує функцію \`resolve\` для своїх залежностей. Повторна реєстрація того самого імені **перевизначає** сервіс (і скидає закешований singleton). Не функція як \`factory\` або невідомий \`lifetime\` → \`TypeError\`;
- \`resolve(name)\` — повертає екземпляр;
- \`has(name)\` — чи зареєстровано;
- \`createScope()\` — дочірня область \`{ resolve, has, createScope }\` зі спільними реєстраціями.

**Життєві цикли:**
- \`'transient'\` — новий екземпляр при кожному \`resolve\`;
- \`'singleton'\` — створюється ліниво при першому \`resolve\` і далі спільний для **всіх** областей;
- \`'scoped'\` — один екземпляр **на область** (кореневий контейнер — теж окрема область).

**Помилки:**
- незареєстрований сервіс → \`Error('Service not registered: <name>')\`;
- циклічна залежність → \`Error\` з повідомленням \`Circular dependency: a -> b -> a\` (шлях від першої появи сервісу в ланцюжку). Після такої помилки контейнер має лишатися робочим.

\`\`\`js
const c = createContainer()
  .register('config', () => ({ apiUrl: '/api' }), { lifetime: 'singleton' })
  .register('http', (r) => ({ get: (p) => r('config').apiUrl + p }), { lifetime: 'singleton' })
  .register('users', (r) => ({ list: () => r('http').get('/users') }));
c.resolve('users').list(); // '/api/users'
\`\`\`

**Як це працює:** Реєстр зберігає name → { factory, lifetime }. resolve викликає factory, передаючи їй функцію resolve для залежностей. singleton кешується на весь контейнер, scoped — на область, transient — щоразу новий. Стек резолву виявляє цикли.
`,
      starter: `// План:
// 1. register(name, factory, { lifetime }) — у реєстр
// 2. resolve(name): невідоме ім'я → помилка; ім'я вже в стеку резолву → помилка циклу
// 3. singleton — кеш на весь контейнер, scoped — кеш області, transient — щоразу новий
// 4. createScope() — нова область зі своїм кешем scoped

function createContainer() {
  const registry = new Map();
  const container = {
    register(name, factory, { lifetime = 'transient' } = {}) {
      registry.set(name, factory);
      return container;
    },
    resolve(name) {
      return registry.get(name)(container.resolve);
    },
    has(name) {
      return registry.has(name);
    },
    createScope() {
      return container;
    }
  };
  return container;
}
`,
      solution: `const LIFETIMES = ['transient', 'singleton', 'scoped'];

function createContainer() {
  const registry = new Map();   // name -> { factory, lifetime }
  const singletons = new Map(); // спільні для всіх областей
  const resolving = [];         // поточний ланцюжок резолву (резолв синхронний) — для пошуку циклів

  function makeScope() {
    const scoped = new Map(); // свій кеш для кожної області

    function resolve(name) {
      const reg = registry.get(name);
      if (!reg) throw new Error(\`Service not registered: \${name}\`);
      if (reg.lifetime === 'singleton' && singletons.has(name)) return singletons.get(name);
      if (reg.lifetime === 'scoped' && scoped.has(name)) return scoped.get(name);

      const at = resolving.indexOf(name);
      if (at !== -1) {
        throw new Error('Circular dependency: ' + [...resolving.slice(at), name].join(' -> '));
      }

      resolving.push(name);
      let instance;
      try {
        // singleton отримує кореневий resolve, щоб не "захопити" scoped-залежності області
        instance = reg.factory(reg.lifetime === 'singleton' ? root.resolve : resolve);
      } finally {
        resolving.pop(); // навіть після помилки стек має очиститися
      }

      if (reg.lifetime === 'singleton') singletons.set(name, instance);
      else if (reg.lifetime === 'scoped') scoped.set(name, instance);
      return instance;
    }

    return {
      resolve,
      has: (name) => registry.has(name),
      createScope: () => makeScope(),
    };
  }

  const root = makeScope();

  root.register = function register(name, factory, { lifetime = 'transient' } = {}) {
    if (typeof factory !== 'function') throw new TypeError('Factory must be a function');
    if (!LIFETIMES.includes(lifetime)) throw new TypeError(\`Unknown lifetime: \${lifetime}\`);
    registry.set(name, { factory, lifetime });
    singletons.delete(name); // перевизначення скидає старий екземпляр
    return root;
  };

  return root;
}
`,
      hints: [
        'Зберігайте реєстрації `{ factory, lifetime }` у спільній Map, singleton-екземпляри — у спільній Map, а scoped-екземпляри — в окремій Map **кожної** області. Область — це фабрика `makeScope()`, що повертає свій `resolve`.',
        'Порядок у `resolve`: немає реєстрації → помилка; є в кеші (singleton/scoped) → повернути; інакше викликати фабрику з `resolve` і закешувати за потреби.',
        'Для циклів ведіть стек імен, що зараз резолвляться (`resolving`). Якщо ім\'я вже в стеку — цикл: шлях `resolving.slice(index)` + ім\'я. `pop()` робіть у `finally`, щоб помилка не «зламала» контейнер.'
      ],
      tests: [
        { name: 'transient: новий екземпляр щоразу; ланцюжок register', code: "const c = createContainer();\nexpect(c.register('obj', () => ({}))).toBe(c);\nexpect(c.resolve('obj')).not.toBe(c.resolve('obj'));\nexpect(c.has('obj')).toBe(true);\nexpect(c.has('nope')).toBe(false);" },
        { name: 'залежності через resolve', code: "const c = createContainer()\n  .register('config', () => ({ apiUrl: '/api' }), { lifetime: 'singleton' })\n  .register('http', (r) => ({ get: (p) => r('config').apiUrl + p }), { lifetime: 'singleton' })\n  .register('users', (r) => { const http = r('http'); return { list: () => http.get('/users') }; });\nexpect(c.resolve('users').list()).toBe('/api/users');" },
        { name: 'singleton: лінивий і спільний', code: "const factory = mockFn(() => ({ id: Math.random() }));\nconst c = createContainer().register('db', factory, { lifetime: 'singleton' });\nexpect(factory).not.toHaveBeenCalled();\nconst a = c.resolve('db');\nexpect(c.resolve('db')).toBe(a);\nexpect(c.createScope().resolve('db')).toBe(a);\nexpect(factory).toHaveBeenCalledTimes(1);" },
        { name: 'scoped: один на область', code: "const c = createContainer().register('req', () => ({}), { lifetime: 'scoped' });\nconst s1 = c.createScope();\nconst s2 = c.createScope();\nexpect(s1.resolve('req')).toBe(s1.resolve('req'));\nexpect(s1.resolve('req')).not.toBe(s2.resolve('req'));\nexpect(c.resolve('req')).toBe(c.resolve('req'));\nexpect(c.resolve('req')).not.toBe(s1.resolve('req'));\nconst nested = s1.createScope();\nexpect(nested.resolve('req')).not.toBe(s1.resolve('req'));" },
        { name: 'перевизначення реєстрації (підміна в тестах)', code: "const c = createContainer().register('api', () => 'real', { lifetime: 'singleton' });\nexpect(c.resolve('api')).toBe('real');\nc.register('api', () => 'fake', { lifetime: 'singleton' });\nexpect(c.resolve('api')).toBe('fake');" },
        { name: 'незареєстрований сервіс', code: "const c = createContainer().register('a', (r) => r('missing'));\nexpect(() => c.resolve('x')).toThrow('Service not registered: x');\nexpect(() => c.resolve('a')).toThrow('Service not registered: missing');" },
        { name: 'циклічна залежність і робочий стан після помилки', code: "const c = createContainer()\n  .register('a', (r) => r('b'))\n  .register('b', (r) => r('c'))\n  .register('c', (r) => r('a'))\n  .register('ok', () => 42);\nexpect(() => c.resolve('b')).toThrow('Circular dependency: b -> c -> a -> b');\nexpect(c.resolve('ok')).toBe(42);\nexpect(() => c.resolve('a')).toThrow('Circular dependency: a -> b -> c -> a');" },
        { name: 'валідація реєстрації', code: "const c = createContainer();\nexpect(() => c.register('x', 42)).toThrow(TypeError);\nexpect(() => c.register('x', () => 1, { lifetime: 'forever' })).toThrow(TypeError);" }
      ],
      explanation: `
Контейнер — це реєстр фабрик + кеші за життєвими циклами + резолв графа залежностей «на вимогу».

**Ключові рішення:**
- **Лінивість:** фабрики викликаються лише при першому \`resolve\` — старт застосунку не створює непотрібного.
- **Області (scopes):** кожна має свій кеш scoped-екземплярів, а singleton-кеш спільний. На фронтенді scope — це, наприклад, запит під час SSR (щоб дані користувачів не змішувалися між запитами) або піддерево компонентів.
- **Singleton отримує кореневий \`resolve\`** — захист від *captive dependency*: інакше singleton міг би «захопити» scoped-об'єкт першої області і віддавати його всім.
- **Стек резолву** дає і виявлення циклів, і зрозумілий шлях у повідомленні; \`finally\` гарантує, що після помилки стек порожній.

**Складність:** O(глибина графа) на перший резолв, O(1) для закешованих.

**Типові помилки:** кешувати singleton до виклику фабрики (цикл повертає \`undefined\`); не очищати стек при помилці; глобальний scoped-кеш; не скидати singleton при перереєстрації.

**У реальних контейнерах є ще:** реєстрація значень і класів (\`useClass\`, \`useValue\`), токени замість рядків (\`Symbol\`, \`InjectionToken\`), асинхронні фабрики, \`dispose\` для звільнення ресурсів області, автоматичне визначення залежностей через декоратори/метадані TypeScript.

**Що можуть спитати далі:** як додати \`dispose()\` для області? Як підтримати асинхронні фабрики? Чим це відрізняється від React Context? Як з таким контейнером писати тести?
`
    },
    // ---------------------------------------------------------------- state
    {
      id: 'pat-architecture', why: ["Ні: групування за типом погано масштабується.","Так: правило імпортів FSD — лише вниз.","Ні: бізнес-сутності — шар entities, а не shared.","Ні: доступ лише через публічний API слайсу.","Ні: мікрофронтенди — для великих команд, а не з першого дня."],
      group: 'state',
      type: 'theory',
      level: 3,
      title: 'Архітектура фронтенд-застосунку: шари, feature-sliced design',
      tags: ['architecture', 'fsd'],
      question: 'Як ви структуруєте великий фронтенд-застосунок? Що таке separation of concerns, шарова архітектура і Feature-Sliced Design? Як контролювати залежності між модулями?',
      choices: [
        'Групування за типом файлів (`components/`, `hooks/`, `utils/`) масштабується краще, ніж за фічами',
        'У FSD шар може імпортувати лише нижчі шари, а слайси одного шару не імпортують один одного',
        'У FSD бізнес-сутності `user` і `order` лежать у `shared`, бо їх використовують усі сторінки',
        'Зовнішній код може імпортувати будь-який внутрішній файл слайсу — публічний API лише рекомендація',
        'Мікрофронтенди варто запроваджувати з першого дня будь-якого проєкту — це спрощує архітектуру',
      ],
      correct: 1,
      hint: 'Групування «за типом файлів» vs «за фічами», напрямок імпортів, публічний API модуля.',
      answer: `
**Separation of concerns** — кожна частина системи відповідає за одну область: UI-рендер, стан, бізнес-правила, доступ до даних, інфраструктура (роутинг, аналітика, i18n). Мета — щоб зміни були **локальними**: заміна HTTP-клієнта не зачіпає компоненти, редизайн не ламає бізнес-логіку.

**Групування за типом (\`components/\`, \`hooks/\`, \`utils/\`, \`services/\`)** працює до певного розміру, далі фіча розмазана по 6 текам, а все імпортує все.

**Групування за фічами / доменами** — код фічі разом: \`features/cart/{ui, model, api, lib}\`.

**Шарова архітектура:** шари з **односпрямованими** залежностями: \`UI → application (use cases, стан) → domain (сутності, правила) → infrastructure (API, storage)\`; нижні шари не знають про верхні.

**Feature-Sliced Design (FSD)** — популярна методологія для фронтенду:
\`\`\`text
src/
  app/        # ініціалізація: провайдери, роутер, глобальні стилі
  pages/      # сторінки — композиція віджетів
  widgets/    # великі самостійні блоки UI (Header, ProductList)
  features/   # дії користувача з бізнес-цінністю (add-to-cart, auth-by-email)
  entities/   # бізнес-сутності (user, product, order): модель, api, базовий UI
  shared/     # переіспользуване без бізнес-логіки: ui-kit, api-клієнт, lib, config
\`\`\`
Правила:
- шар може імпортувати лише **нижчі** шари (\`features\` → \`entities\`, \`shared\`; не навпаки і не «вбік» між слайсами одного шару);
- кожен слайс має **публічний API** (\`index.ts\`) — зовні імпортують лише його, а не внутрішні файли;
- всередині слайсу — сегменти \`ui\`, \`model\`, \`api\`, \`lib\`, \`config\`.

**Контроль залежностей:** \`eslint-plugin-boundaries\`, \`@feature-sliced/eslint-config\`, \`dependency-cruiser\`, Nx module boundaries; заборона циклічних імпортів (\`import/no-cycle\`); path aliases (\`@/entities/user\`).

**Ще важливо:**
- **серверний стан окремо від клієнтського** (React Query/RTK Query vs локальний/глобальний UI-стан);
- **адаптери/DTO на межі API** — доменна модель не залежить від формату бекенду;
- **презентаційні vs контейнерні** компоненти (або хуки для логіки + «тупі» компоненти);
- **монорепо** для кількох застосунків зі спільними пакетами (ui-kit, utils);
- **мікрофронтенди** (Module Federation, single-spa) — лише для незалежних команд/релізів: ціна — складність, дублікати залежностей, узгодженість UI.

**Trade-off:** архітектура має відповідати розміру проєкту і команди. Для лендингу FSD — overengineering; для продукту з 10 командами — необхідність.
`,
      keyPoints: [
        'Separation of concerns: UI, стан, бізнес-правила, дані, інфраструктура окремо',
        'Групування за фічами/доменами замість «за типом файлів» у великих проєктах',
        'Шари з односпрямованими залежностями; FSD: app → pages → widgets → features → entities → shared',
        'Публічний API слайсу, заборона імпортів угору і вбік, лінтери меж',
        'Серверний стан окремо, адаптери на межі API; архітектура під розмір проєкту'
      ],
      followUps: ['Куди у FSD покласти компонент, який використовують дві фічі?', 'Коли варто переходити на мікрофронтенди?', 'Як боротися з циклічними залежностями між модулями?']
    },
    {
      id: 'pat-mvc-mvvm', why: ["Так: Presenter явно керує пасивною View.","Ні: ViewModel не знає про DOM — зв'язок через binding.","Ні: React — лише V, без класичного MVC.","Ні: навпаки — Flux з'явився через каскадні оновлення MVC.","Ні: ввід обробляє Controller."],
      group: 'state',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'MVC, MVP, MVVM',
      tags: ['architecture', 'mvc', 'mvvm'],
      question: 'Що таке MVC, MVP і MVVM? Чим вони відрізняються? Як вони співвідносяться із сучасними фронтенд-фреймворками?',
      choices: [
        'У MVP View пасивна, а Presenter явно оновлює її через інтерфейс на кшталт `view.showError()`',
        'У MVVM ViewModel напряму маніпулює DOM конкретної View, тому знає про всі її елементи й класи',
        'React — класична реалізація MVC, де компонент є контролером із двостороннім звʼязуванням',
        'MVC на клієнті якраз уникає каскадних оновлень, а Flux зʼявився як спрощення MVVM',
        'У MVC саме View обробляє ввід користувача й змінює Model, а Controller лише рендерить',
      ],
      correct: 0,
      hint: 'Хто знає про View і як дані потрапляють у View: через контролер, через презентер або через зв\'язування з ViewModel.',
      answer: `
Усі три патерни розділяють **дані/бізнес-логіку (Model)**, **відображення (View)** і **посередника**, що їх з'єднує. Мета — separation of concerns: змінювати UI, не чіпаючи логіку, і тестувати логіку без UI.

**MVC (Model–View–Controller):**
- **Model** — дані та бізнес-правила, сповіщає про зміни;
- **View** — відображає модель (часто підписана на неї);
- **Controller** — обробляє ввід користувача, змінює модель, обирає View.
Класика серверних фреймворків (Rails, Laravel, Spring MVC) і ранніх SPA (Backbone). Проблема великих MVC на клієнті — двосторонні зв'язки «модель ↔ вью» перетворюються на павутину каскадних оновлень (саме це мотивувало Flux).

**MVP (Model–View–Presenter):**
- View — **пасивна** (лише рендер і пересилання подій через інтерфейс);
- **Presenter** отримує події від View, працює з моделлю і **явно** оновлює View через її інтерфейс (\`view.showError(msg)\`).
Плюс — presenter легко тестувати з фейковою View. Поширений в Android/WinForms.

**MVVM (Model–View–ViewModel):**
- **ViewModel** — стан і команди, спеціально підготовлені для відображення (\`isSubmitDisabled\`, \`formattedPrice\`);
- View **декларативно зв'язана** (data binding) з ViewModel, часто двосторонньо; ViewModel не знає про конкретну View.
Приклади: Knockout, Angular (компонент як ViewModel + шаблон), Vue (\`data\`/\`computed\` + \`v-model\`), WPF.

| | Хто оновлює View | Зв'язок View ↔ посередник |
|---|---|---|
| MVC | View читає Model / Controller обирає View | Controller не обов'язково знає View |
| MVP | Presenter явно викликає методи View | один-до-одного через інтерфейс |
| MVVM | Автоматично через binding | View знає ViewModel, не навпаки |

**Сучасні фреймворки:** React — це переважно «V» з **односпрямованим потоком** (стан → UI, події → зміна стану); компонент з хуками часто є ViewModel+View, а «Model» — стор/серверний кеш (React Query). Vue і Angular ближчі до MVVM. Головна практична ідея, яку варто взяти з усіх трьох: **не змішувати** бізнес-логіку, отримання даних і рендер в одному місці (custom hooks / composables / сервіси як «ViewModel», презентаційні компоненти як «View»).
`,
      keyPoints: [
        'Спільна мета — розділити Model, View і посередника (separation of concerns)',
        'MVC: Controller обробляє ввід і змінює Model; проблема каскадних двосторонніх оновлень',
        'MVP: пасивна View, Presenter явно оновлює її через інтерфейс',
        'MVVM: декларативне (часто двостороннє) зв\'язування з ViewModel',
        'React — односпрямований потік; Vue/Angular ближчі до MVVM'
      ],
      followUps: ['Чому Facebook відмовився від MVC на клієнті і створив Flux?', 'Що в React-застосунку можна вважати ViewModel?', 'Плюси і мінуси двостороннього зв\'язування?']
    },
    {
      id: 'pat-flux-redux', why: ["Ні: редʼюсер — чиста функція без ефектів.","Так: порівняння посилань дешеве лише без мутацій.","Ні: мутація ламає виявлення змін.","Так: чистота дає тести й time-travel.","Ні: ефекти — у middleware (thunk, saga)."],
      group: 'state',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Односпрямований потік даних: Flux і Redux',
      tags: ['architecture', 'redux', 'flux'],
      question: 'Що таке односпрямований потік даних? Як влаштовані Flux і Redux (store, action, reducer, dispatch, middleware)? Чому редʼюсер має бути чистою функцією і що дає іммутабельність? Оберіть **усі** правильні твердження.',
      choices: [
        'Редʼюсер може робити запит до API, якщо результат одразу записується в новий стан',
        'Іммутабельність дозволяє виявити зміну дешевим порівнянням посилань `prev !== next`',
        'Мутація стану в редʼюсері безпечна, якщо після неї повернути той самий обʼєкт `state`',
        'Чистий редʼюсер детермінований — тому його легко тестувати й можливий time-travel',
        'Побічні ефекти в Redux розміщують у редʼюсерах, а middleware лише логує дії',
      ],
      correct: [1, 3],
      hint: 'Подумайте, як відповісти на питання «чому змінився цей стан?» у великому застосунку.',
      answer: `
**Односпрямований потік (unidirectional data flow):** стан змінюється лише одним шляхом, і дані «течуть» по колу в одному напрямку:
\`\`\`text
View --(подія)--> action --dispatch--> [middleware] --> reducer(state, action) --> newState --> View
\`\`\`
На відміну від двосторонніх зв'язків MVC, будь-яку зміну можна відстежити: яка дія, з якими даними, який стан був до і після.

**Flux (Facebook, 2014):** Actions → **Dispatcher** (один на застосунок) → кілька **Stores** → Views.
**Redux** спростив Flux до трьох принципів:
1. **Єдине джерело правди** — один стор з деревом стану.
2. **Стан лише для читання** — змінити можна тільки через \`dispatch(action)\`, де action — простий об'єкт \`{ type: 'cart/added', payload }\`.
3. **Зміни — чистими функціями** — \`reducer(state, action) => newState\`.

\`\`\`js
function cart(state = { items: [] }, action) {
  switch (action.type) {
    case 'cart/added':
      return { ...state, items: [...state.items, action.payload] }; // новий об'єкт, без мутації
    default:
      return state;
  }
}
const store = createStore(cart);
store.subscribe(() => render(store.getState()));
store.dispatch({ type: 'cart/added', payload: { id: 1 } });
\`\`\`

**Чому редʼюсер чистий:** детермінованість (той самий стан + дія → той самий результат), легко тестувати, працює **time-travel debugging** і реплей дій, передбачуваність. Тому в редʼюсері немає запитів, \`Date.now()\`, \`Math.random()\`, мутацій.

**Чому іммутабельність:** зміна виявляється дешевим порівнянням посилань (\`prev !== next\`) замість глибокого порівняння — на цьому побудовані \`useSelector\`, \`React.memo\`, мемоізовані селектори (reselect). Мутація «тихо» ламає оновлення UI. Redux Toolkit використовує **Immer**: пишете «мутуючий» код у чернетці, а отримуєте новий іммутабельний стан.

**Middleware** — місце для побічних ефектів між \`dispatch\` і редʼюсером: \`store => next => action => ...\` (логування, асинхронність через thunk/saga/listener, аналітика).

**Сучасний погляд:** Redux Toolkit (\`createSlice\`, RTK Query) прибрав бойлерплейт. Серверний стан (кеш запитів) частіше тримають у React Query/RTK Query, глобальний клієнтський — у Redux/Zustand, локальний — у компоненті. Мінуси Redux: бойлерплейт (без RTK), непотрібний для простих застосунків, ризик «все в глобальний стор».
`,
      keyPoints: [
        'Односпрямований потік: action → dispatch → reducer → newState → view',
        'Три принципи Redux: одне джерело правди, read-only стан, чисті редʼюсери',
        'Чистий редʼюсер: детермінованість, тестованість, time-travel',
        'Іммутабельність: виявлення змін порівнянням посилань; Immer у RTK',
        'Middleware для побічних ефектів (thunk, логування)'
      ],
      followUps: ['Чим Redux відрізняється від Context + useReducer?', 'Де робити асинхронні запити в Redux?', 'Що таке нормалізований стан і навіщо він?']
    },
    {
      id: 'pat-quiz-redux-mutation', why: ["Ні: push синхронний.","Ні: масиви в стані підтримуються.","Так: те саме посилання — підписники не бачать змін.","Ні: підписка діє постійно."],
      group: 'state',
      type: 'quiz',
      level: 2,
      title: 'Чому UI не оновлюється після dispatch?',
      tags: ['architecture', 'redux', 'immutability'],
      question: `
Після \`dispatch({ type: 'todos/added', text: 'Buy milk' })\` новий пункт **не з'являється** в списку, хоча \`console.log(store.getState().items)\` показує його. Компонент читає дані через \`useSelector((s) => s.items)\`.

\`\`\`js
function todos(state = { items: [] }, action) {
  switch (action.type) {
    case 'todos/added':
      state.items.push(action.text);
      return state;
    default:
      return state;
  }
}
\`\`\`
`,
      options: [
        '`push` працює асинхронно, тому потрібно `await`',
        'Redux не підтримує масиви в стані — треба зберігати об\'єкт `{ [id]: todo }`',
        'Редʼюсер мутує стан і повертає **те саме посилання** — порівняння `prev === next` не бачить змін, тож компонент не ре-рендериться',
        'Після кожного `dispatch` потрібно заново викликати `store.subscribe`'
      ],
      answer: 2,
      hint: 'Як `useSelector` (і `React.memo`, і мемоізовані селектори) визначає, що дані змінилися?',
      explanation: `
\`useSelector\` після кожного dispatch порівнює попередній і новий результат селектора **за посиланням** (\`===\`). Редʼюсер змінив масив \`items\` на місці і повернув той самий об'єкт \`state\` — посилання не змінилися, тому для React «нічого не сталося». Дані в сторі при цьому вже змінені (тому \`console.log\` їх бачить) — класичний симптом мутації.

Правильно — повернути **нові** об'єкти на шляху до зміненого місця:
\`\`\`js
case 'todos/added':
  return { ...state, items: [...state.items, action.text] };
\`\`\`
або з Redux Toolkit (\`createSlice\` + Immer) можна писати \`state.items.push(...)\` у чернетці — Immer сам створить новий стан.

- \`push\` синхронний.
- Масиви в стані Redux цілком допустимі (нормалізація — окреме питання продуктивності, а не причина бага).
- Підписка робиться один раз; \`useSelector\` підписаний автоматично.
`
    },
    {
      id: 'pat-create-store',
      group: 'state',
      type: 'code',
      level: 2,
      title: 'createStore у стилі Redux',
      tags: ['architecture', 'redux', 'observer'],
      description: `
**Завдання.** Реалізуйте \`createStore(reducer, initialState)\` — спрощений Redux-стор. Повертає \`{ getState, dispatch, subscribe }\`.

**Де трапляється:** Redux і подібні стори стану.

- При створенні стор виконує \`dispatch({ type: '@@INIT' })\` — так редʼюсер підставляє свій стан за замовчуванням, якщо \`initialState\` не передано.
- \`getState()\` — поточний стан.
- \`dispatch(action)\`:
  - \`action\` має бути простим об'єктом (не \`null\`, не масив, не функція) з **рядковим** \`type\`, інакше \`TypeError\`;
  - обчислює новий стан \`reducer(state, action)\`;
  - викликає всіх підписників (без аргументів) **після** оновлення стану; повертає \`action\`;
  - виклик \`dispatch\` усередині редʼюсера → \`Error('Reducers may not dispatch actions.')\`.
- \`subscribe(listener)\` → функція відписки. Кожна підписка незалежна (та сама функція двічі = два виклики). Повторний виклик відписки нічого не робить.
- Підписки/відписки **під час** розсилки не впливають на поточний \`dispatch\` (лише на наступні).

\`\`\`js
const counter = (state = 0, action) => (action.type === 'inc' ? state + 1 : state);
const store = createStore(counter);
store.subscribe(() => console.log(store.getState()));
store.dispatch({ type: 'inc' }); // 1
\`\`\`

**Як це працює:** Стан змінюється лише через dispatch: state = reducer(state, action), потім виклик усіх підписників. subscribe повертає функцію відписки; підписників копіюємо перед розсилкою, щоб відписка під час dispatch була безпечною.
`,
      starter: `// План:
// 1. state = initialState; Map підписників
// 2. dispatch: state = reducer(state, action); розіслати КОПІЇ списку підписників; повернути action
// 3. subscribe повертає функцію відписки (повторна відписка — без помилки)

function createStore(reducer, initialState) {
  let state = initialState;
  return {
    getState() {
      return state;
    },
    dispatch(action) {
      // TODO
    },
    subscribe(listener) {
      // TODO
      return () => {};
    }
  };
}
`,
      solution: `function createStore(reducer, initialState) {
  if (typeof reducer !== 'function') throw new TypeError('Reducer must be a function');

  let state = initialState;
  let listeners = new Map(); // id -> listener; copy-on-write для безпечної розсилки
  let nextId = 0;
  let isDispatching = false;

  function getState() {
    return state;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') throw new TypeError('Listener must be a function');
    const id = nextId++;
    listeners = new Map(listeners).set(id, listener);
    return function unsubscribe() {
      if (!listeners.has(id)) return;
      const next = new Map(listeners);
      next.delete(id);
      listeners = next;
    };
  }

  function dispatch(action) {
    if (action === null || typeof action !== 'object' || Array.isArray(action)) {
      throw new TypeError('Actions must be plain objects');
    }
    if (typeof action.type !== 'string') throw new TypeError('Actions must have a string "type"');
    if (isDispatching) throw new Error('Reducers may not dispatch actions.');

    try {
      isDispatching = true;
      state = reducer(state, action);
    } finally {
      isDispatching = false;
    }

    const current = listeners; // знімок: зміни під час розсилки створять нову Map
    for (const listener of current.values()) listener();
    return action;
  }

  dispatch({ type: '@@INIT' });
  return { getState, dispatch, subscribe };
}
`,
      hints: [
        'Стан і список підписників живуть у замиканні. `dispatch` = валідація → `state = reducer(state, action)` → виклик усіх підписників → `return action`.',
        'Щоб та сама функція могла мати дві незалежні підписки, зберігайте підписників за унікальним id (`Map`), а не за посиланням на функцію.',
        'Для «знімка» використайте copy-on-write: `subscribe`/`unsubscribe` створюють **нову** Map, а `dispatch` ітерує по Map, захопленій на початку розсилки. Прапорець `isDispatching` у `try/finally` захищає від dispatch у редʼюсері.'
      ],
      tests: [
        { name: 'стан за замовчуванням з редʼюсера (@@INIT)', code: "const reducer = mockFn((state = { count: 0 }, action) => state);\nconst store = createStore(reducer);\nexpect(store.getState()).toEqual({ count: 0 });\nexpect(reducer).toHaveBeenCalledWith(undefined, { type: '@@INIT' });\nexpect(createStore((s = 0) => s, 5).getState()).toBe(5);" },
        { name: 'dispatch оновлює стан і повертає action', code: "const counter = (state = 0, action) => (action.type === 'inc' ? state + (action.by ?? 1) : state);\nconst store = createStore(counter);\nconst action = { type: 'inc', by: 5 };\nexpect(store.dispatch(action)).toBe(action);\nstore.dispatch({ type: 'inc' });\nexpect(store.getState()).toBe(6);" },
        { name: 'підписники викликаються після оновлення стану', code: "const store = createStore((s = 0, a) => (a.type === 'inc' ? s + 1 : s));\nconst seen = [];\nconst off = store.subscribe(() => seen.push(store.getState()));\nstore.dispatch({ type: 'inc' });\nstore.dispatch({ type: 'noop' });\noff();\nstore.dispatch({ type: 'inc' });\nexpect(seen).toEqual([1, 1]);" },
        { name: 'незалежні підписки однієї функції', code: "const store = createStore((s = 0) => s);\nconst fn = mockFn();\nconst off1 = store.subscribe(fn);\nstore.subscribe(fn);\nstore.dispatch({ type: 'x' });\nexpect(fn).toHaveBeenCalledTimes(2);\noff1(); off1();\nstore.dispatch({ type: 'x' });\nexpect(fn).toHaveBeenCalledTimes(3);" },
        { name: 'зміни підписок під час dispatch діють з наступного разу', code: "const store = createStore((s = 0) => s);\nconst log = [];\nlet offB;\nstore.subscribe(() => { log.push('A'); if (offB) { offB(); offB = null; store.subscribe(() => log.push('C')); } });\noffB = store.subscribe(() => log.push('B'));\nstore.dispatch({ type: 'x' });\nexpect(log).toEqual(['A', 'B']);\nlog.length = 0;\nstore.dispatch({ type: 'x' });\nexpect(log).toEqual(['A', 'C']);" },
        { name: 'валідація action', code: "const store = createStore((s = 0) => s);\nexpect(() => store.dispatch('inc')).toThrow(TypeError);\nexpect(() => store.dispatch(null)).toThrow(TypeError);\nexpect(() => store.dispatch([])).toThrow(TypeError);\nexpect(() => store.dispatch({})).toThrow(TypeError);\nexpect(() => store.dispatch(() => {})).toThrow(TypeError);" },
        { name: 'редʼюсер не може диспатчити', code: "let store;\nstore = createStore((s = 0, a) => { if (a.type === 'bad') store.dispatch({ type: 'x' }); return s; });\nexpect(() => store.dispatch({ type: 'bad' })).toThrow('Reducers may not dispatch actions.');\nexpect(() => store.dispatch({ type: 'ok' })).not.toThrow();" }
      ],
      explanation: `
Redux-стор — це **Observer** (підписники) + **односпрямований потік** (єдиний спосіб змінити стан — \`dispatch\`) + **чиста функція** переходу стану.

**Деталі, які відрізняють коректну реалізацію:**
- \`@@INIT\` змушує кожен редʼюсер повернути свій стан за замовчуванням (так \`combineReducers\` збирає початкове дерево);
- **copy-on-write** для підписників — безпечні підписки/відписки під час розсилки (компонент, що розмонтовується через зміну стану, відписується саме в цей момент!);
- підписка за id — незалежні підписки однієї функції;
- **\`isDispatching\`** у \`try/finally\` — диспатч з редʼюсера зробив би оновлення непередбачуваним, а \`finally\` не дає стору «застрягти» після помилки в редʼюсері.

**Складність:** \`dispatch\` — O(вартість редʼюсера + кількість підписників); \`subscribe\` — O(n) через копіювання (підписки рідкісні порівняно з диспатчами).

**Типові помилки:** мутування масиву підписників під час \`forEach\`; виклик підписників до оновлення стану; передача стану аргументом підписнику (у Redux підписник сам викликає \`getState\`); відсутній захист від dispatch у редʼюсері.

**Що можуть спитати далі:** як реалізувати \`combineReducers\`? Як додати middleware (\`applyMiddleware\`, наступна задача)? Як \`useSelector\` вирішує, чи ре-рендерити компонент?
`
    },
    {
      id: 'pat-apply-middleware',
      group: 'state',
      type: 'code',
      level: 4,
      title: 'compose і applyMiddleware для Redux-стору',
      tags: ['architecture', 'redux', 'middleware', 'fp'],
      description: `
**Завдання.** У стартовому коді є робочий \`createStore(reducer, initialState, enhancer)\`: якщо передано \`enhancer\`, він викликає \`enhancer(createStore)(reducer, initialState)\`. Реалізуйте:

**Де трапляється:** логування, thunk, аналітика в Redux.

### \`compose(...fns)\`
Композиція справа наліво: \`compose(f, g, h)(...args) === f(g(h(...args)))\`. Без аргументів повертає функцію-тотожність; з одним — саму цю функцію. Найправіша функція може приймати кілька аргументів.

### \`applyMiddleware(...middlewares)\`
Повертає enhancer \`(createStore) => (reducer, initialState) => store\`. Middleware має сигнатуру Redux:
\`\`\`js
const logger = ({ getState, dispatch }) => (next) => (action) => {
  console.log('before', getState());
  const result = next(action);
  console.log('after', getState());
  return result;
};
\`\`\`
Вимоги:
- перший middleware у списку — **зовнішній** (бачить action першим);
- \`next\` останнього middleware — оригінальний \`store.dispatch\`;
- \`dispatch\` в API middleware (\`{ getState, dispatch }\`) проходить через **увесь** ланцюжок (так thunk може диспатчити інші дії);
- виклик \`dispatch\` **під час побудови** middleware (у зовнішній функції \`({ dispatch }) => { dispatch(...) }\`) кидає \`Error\`;
- повертається стор з тими самими \`getState\`/\`subscribe\` і новим \`dispatch\`; значення, яке повернув ланцюжок, повертається з \`dispatch\`.

**Як це працює:** Middleware має форму store => next => action. applyMiddleware створює стор, дає кожному middleware доступ до getState/dispatch і compose-ить їх у ланцюжок навколо оригінального dispatch.
`,
      starter: `// План:
// 1. compose(...fns): справа наліво, порожній — x => x
// 2. applyMiddleware(...mws) повертає createStore => (reducer, state) => {...}
// 3. Кожному middleware дати { getState, dispatch: (a) => dispatch(a) }
// 4. dispatch = compose(...ланцюжки)(store.dispatch)

// Готовий спрощений стор — змінювати не потрібно
function createStore(reducer, initialState, enhancer) {
  if (enhancer) return enhancer(createStore)(reducer, initialState);
  let state = initialState;
  const listeners = new Set();
  function dispatch(action) {
    if (action === null || typeof action !== 'object' || typeof action.type !== 'string') {
      throw new TypeError('Actions must be plain objects with a string type');
    }
    state = reducer(state, action);
    [...listeners].forEach((l) => l());
    return action;
  }
  dispatch({ type: '@@INIT' });
  return {
    getState: () => state,
    dispatch,
    subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); }
  };
}

function compose(...fns) {
  // TODO
}

function applyMiddleware(...middlewares) {
  // TODO
  return (createStore) => createStore;
}
`,
      solution: `// Готовий спрощений стор — змінювати не потрібно
function createStore(reducer, initialState, enhancer) {
  if (enhancer) return enhancer(createStore)(reducer, initialState);
  let state = initialState;
  const listeners = new Set();
  function dispatch(action) {
    if (action === null || typeof action !== 'object' || typeof action.type !== 'string') {
      throw new TypeError('Actions must be plain objects with a string type');
    }
    state = reducer(state, action);
    [...listeners].forEach((l) => l());
    return action;
  }
  dispatch({ type: '@@INIT' });
  return {
    getState: () => state,
    dispatch,
    subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); }
  };
}

function compose(...fns) {
  if (fns.length === 0) return (arg) => arg;
  if (fns.length === 1) return fns[0];
  // reduce будує f(g(h(...args))): кожен крок "загортає" накопичене навколо наступної функції
  return fns.reduce((outer, inner) => (...args) => outer(inner(...args)));
}

function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, initialState) => {
    const store = createStore(reducer, initialState);

    // заглушка на час побудови ланцюжка
    let dispatch = () => {
      throw new Error('Dispatching while constructing your middleware is not allowed.');
    };

    // dispatch у API — "пізнє зв'язування": викликає ФІНАЛЬНИЙ dispatch, тобто весь ланцюжок
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args),
    };

    const chain = middlewares.map((middleware) => middleware(middlewareAPI)); // [next => action => ...]
    dispatch = compose(...chain)(store.dispatch); // перший middleware стає зовнішнім

    return { ...store, dispatch };
  };
}
`,
      hints: [
        '`compose` — через `reduce`: `fns.reduce((f, g) => (...args) => f(g(...args)))`. Окремо оброблюйте 0 і 1 функцію.',
        'У `applyMiddleware` спершу створіть звичайний стор. Потім викличте кожен middleware з API `{ getState, dispatch }` — отримаєте масив функцій `next => action => ...`. `compose(...chain)(store.dispatch)` дає фінальний dispatch, де перший middleware — зовнішній.',
        'Щоб `dispatch` в API проходив через увесь ланцюжок, передайте не `store.dispatch`, а обгортку `(...args) => dispatch(...args)` над змінною `let dispatch`, яку ви перезапишете після побудови. До перезапису ця змінна має кидати помилку.'
      ],
      tests: [
        { name: 'compose: справа наліво, 0 і 1 функція', code: "const inc = (x) => x + 1;\nconst dbl = (x) => x * 2;\nexpect(compose(inc, dbl)(5)).toBe(11);\nexpect(compose(dbl, inc)(5)).toBe(12);\nexpect(compose()(7)).toBe(7);\nexpect(compose(inc)).toBe(inc);\nexpect(compose(inc, (a, b) => a + b)(2, 3)).toBe(6);" },
        { name: 'порядок middleware: перший — зовнішній', code: "const log = [];\nconst mw = (name) => () => (next) => (action) => { log.push(name + ' before'); const r = next(action); log.push(name + ' after'); return r; };\nconst store = createStore((s = 0) => s, undefined, applyMiddleware(mw('A'), mw('B')));\nstore.dispatch({ type: 'x' });\nexpect(log).toEqual(['A before', 'B before', 'B after', 'A after']);" },
        { name: 'getState у middleware і повернення значення ланцюжка', code: "const seen = [];\nconst logger = ({ getState }) => (next) => (action) => { seen.push(getState()); const r = next(action); seen.push(getState()); return r; };\nconst store = createStore((s = 0, a) => (a.type === 'inc' ? s + 1 : s), undefined, applyMiddleware(logger));\nconst action = { type: 'inc' };\nexpect(store.dispatch(action)).toBe(action);\nexpect(seen).toEqual([0, 1]);\nexpect(store.getState()).toBe(1);" },
        { name: 'thunk: dispatch функцій і диспатч через весь ланцюжок', code: "const thunk = ({ dispatch, getState }) => (next) => (action) => typeof action === 'function' ? action(dispatch, getState) : next(action);\nconst types = [];\nconst spyMw = () => (next) => (action) => { types.push(typeof action === 'function' ? 'fn' : action.type); return next(action); };\nconst store = createStore((s = 0, a) => (a.type === 'add' ? s + a.n : s), undefined, applyMiddleware(thunk, spyMw));\nconst result = store.dispatch((dispatch, getState) => { dispatch({ type: 'add', n: 2 }); dispatch({ type: 'add', n: getState() * 10 }); return 'done'; });\nexpect(result).toBe('done');\nexpect(store.getState()).toBe(22);\nexpect(types).toEqual(['add', 'add']);" },
        { name: 'без middleware thunk неможливий', code: "const store = createStore((s = 0) => s, undefined, applyMiddleware());\nexpect(() => store.dispatch(() => {})).toThrow(TypeError);\nstore.dispatch({ type: 'ok' });\nexpect(store.getState()).toBe(0);" },
        { name: 'middleware може перехопити або змінити action', code: "const blockAnon = () => (next) => (action) => (action.user ? next({ ...action, stamped: true }) : null);\nconst received = [];\nconst store = createStore((s = [], a) => (a.type === 'msg' ? [...s, a] : s), undefined, applyMiddleware(blockAnon));\nexpect(store.dispatch({ type: 'msg' })).toBeNull();\nstore.dispatch({ type: 'msg', user: 'ann' });\nexpect(store.getState()).toEqual([{ type: 'msg', user: 'ann', stamped: true }]);" },
        { name: 'dispatch під час побудови middleware заборонено', code: "const bad = ({ dispatch }) => { dispatch({ type: 'boot' }); return (next) => (action) => next(action); };\nexpect(() => createStore((s = 0) => s, undefined, applyMiddleware(bad))).toThrow(/constructing/);" },
        { name: 'subscribe працює зі стором з middleware', code: "const store = createStore((s = 0, a) => (a.type === 'inc' ? s + 1 : s), undefined, applyMiddleware(() => (next) => (a) => next(a)));\nconst fn = mockFn();\nstore.subscribe(fn);\nstore.dispatch({ type: 'inc' });\nexpect(fn).toHaveBeenCalledTimes(1);\nexpect(store.getState()).toBe(1);" }
      ],
      explanation: `
**Три рівні каррінгу** \`store => next => action\` мають сенс:
1. \`store\` (API) — один раз при створенні стору;
2. \`next\` — один раз при побудові ланцюжка: кожен middleware отримує «наступний» dispatch;
3. \`action\` — на кожен виклик.

\`compose(...chain)(store.dispatch)\`: найправіший middleware загортає оригінальний dispatch, наступний — його результат і т.д., тому **перший у списку стає зовнішнім**.

**Пізнє зв'язування \`dispatch\` в API** — найхитріше місце. Якщо передати в API \`store.dispatch\`, thunk диспатчив би в обхід усіх middleware (логер не побачив би дій). Обгортка над змінною \`dispatch\` після побудови вказує на повний ланцюжок; до побудови — кидає помилку (інакше дія пройшла б через ще не готовий ланцюжок).

**Складність:** O(m) викликів на кожен dispatch, де m — кількість middleware.

**Типові помилки:** \`compose\` зліва направо (зворотний порядок middleware); \`store.dispatch\` в API; втрата значення, яке повертає ланцюжок (thunk повертає проміс — його чекають \`await dispatch(fetchUser())\`); мутування оригінального стору.

**Зв'язок з іншими патернами:** це **Chain of Responsibility** + **Decorator** для \`dispatch\` + функціональна композиція. Порівняйте з koa-compose: там ланцюжок збирається на кожен запит і \`next\` асинхронний.

**Що можуть спитати далі:** як написати \`redux-thunk\` (у тестах вище — 1 рядок)? Як зробити middleware для дедуплікації запитів або аналітики? Чим enhancer відрізняється від middleware? Як працює \`configureStore\` у Redux Toolkit?
`
    },
    // ---------------------------------------------------------------- signals
    {
      id: 'pat-signals-theory', why: ["Ні: залежності відстежуються автоматично.","Ні: оновлюється лише те, що читало сигнал.","Ні: computed лінивий — рахує при читанні.","Так: читання під час effect реєструє залежність.","Ні: поза effect/computed підписки немає."],
      group: 'signals',
      type: 'theory',
      level: 3,
      title: 'Реактивний стан: сигнали та дрібнозерниста реактивність',
      tags: ['architecture', 'signals', 'reactivity'],
      question: 'Що таке сигнали (signals)? Як працює автоматичне відстеження залежностей? Чим дрібнозерниста реактивність відрізняється від підходу React (ре-рендер компонента + virtual DOM)?',
      choices: [
        'Залежності `computed` треба оголошувати масивом вручну, як у `useEffect`, інакше він не оновиться',
        'Сигнали так само ре-рендерять увесь компонент, просто порівнюють virtual DOM швидше за React',
        '`computed` перераховується негайно при кожному `set` будь-якого сигналу в застосунку',
        'Під час виконання `effect` кожен виклик `signal.get()` реєструє поточного спостерігача як підписника',
        'Читання сигналу поза `effect` чи `computed` теж створює підписку, просто відкладену до наступного `set`',
      ],
      correct: 3,
      hint: 'Хто і коли дізнається, що значення змінилось: увесь компонент чи лише конкретне місце, яке читало це значення?',
      answer: `
**Сигнал** — реактивна комірка зі значенням, яка знає, хто її читає. Три примітиви:
- \`signal(value)\` — джерело стану (\`get\`/\`set\`);
- \`computed(fn)\` — похідне значення: ліниве, кешоване, перераховується лише коли змінились залежності;
- \`effect(fn)\` — побічний ефект (оновлення DOM, логування), що автоматично перезапускається при зміні залежностей.

\`\`\`js
const price = signal(100);
const qty = signal(2);
const total = computed(() => price.get() * qty.get());
effect(() => { totalEl.textContent = total.get(); }); // оновиться лише цей текстовий вузол
qty.set(3);
\`\`\`

**Автоматичне відстеження залежностей:** під час виконання \`computed\`/\`effect\` система запам'ятовує «поточного спостерігача» (глобальна змінна). Кожен \`signal.get()\` реєструє цього спостерігача як підписника. Тому залежності не треба оголошувати вручну (на відміну від масиву залежностей \`useEffect\`), і вони **динамічні** — при кожному запуску перебудовуються (гілка \`if\`, що не виконалась, не створює підписки).

**Push-pull модель:** \`set\` «проштовхує» позначку «брудний» вниз по графу (push), а значення \`computed\` обчислюються ліниво при читанні (pull). Правильна реалізація **без глітчів** (glitch-free): у «ромбі» \`a → b, a → c, (b, c) → effect\` ефект виконується один раз і ніколи не бачить суміші старого і нового стану.

**Порівняння з React:**
| | React (VDOM) | Сигнали (Solid, Preact Signals, Vue, Angular, Svelte 5 runes) |
|---|---|---|
| Одиниця оновлення | компонент (і піддерево) ре-рендериться | конкретний вузол/ефект, що читав сигнал |
| Виявлення змін | новий стан → рендер → diff VDOM | граф залежностей знає підписників точно |
| Оптимізації | \`memo\`, \`useMemo\`, \`useCallback\`, React Compiler | майже не потрібні |
| Залежності | масив deps вручну | автоматично |
| Модель | UI = f(state), простий ментальний образ | треба розуміти реактивний граф, «губляться» залежності при деструктуризації |

**Історія:** ідея стара — Knockout observables (2010), MobX, Vue reactivity (Proxy). Зараз сигнали — тренд (Angular Signals, Preact Signals, Solid, Qwik, Svelte 5), і є TC39-пропозиція \`Signal\` у стандарт JS.

**Пастки:** читання сигналу поза трекінг-контекстом не створює підписки; цикли (ефект змінює сигнал, від якого залежить); витоки — ефекти треба знищувати (\`dispose\`); пакетні оновлення (\`batch\`), щоб кілька \`set\` дали один перерахунок.
`,
      keyPoints: [
        'signal — джерело, computed — ліниве кешоване похідне, effect — побічний ефект',
        'Автоматичне динамічне відстеження через «поточного спостерігача» під час get()',
        'Push (позначка dirty) + pull (ліниве обчислення), glitch-free у ромбі',
        'React ре-рендерить компонент + VDOM diff; сигнали оновлюють точково',
        'Пастки: читання поза контекстом, цикли, dispose, batch'
      ],
      followUps: ['Що таке glitch і як його уникнути?', 'Чому в Solid не можна деструктуризувати props?', 'Як Vue 3 реалізує реактивність через Proxy?']
    },
    {
      id: 'pat-signals',
      group: 'signals',
      type: 'code',
      level: 4,
      title: 'Сигнали: signal, computed, effect, batch',
      tags: ['architecture', 'signals', 'reactivity', 'observer'],
      description: `
**Завдання.** Реалізуйте міні-бібліотеку дрібнозернистої реактивності з **автоматичним відстеженням залежностей**.

**Де трапляється:** Solid, Preact Signals, Angular signals, Vue reactivity.

### \`signal(initial)\` → \`{ get(), set(value) }\`
- \`get()\` повертає значення і, якщо викликаний усередині \`computed\`/\`effect\`, **підписує** його на цей сигнал;
- \`set(value)\` змінює значення; якщо нове значення \`Object.is\`-рівне старому — нічого не відбувається.

### \`computed(fn)\` → \`{ get() }\`
- **ліниве:** \`fn\` не викликається, доки ніхто не прочитав значення;
- **кешоване:** повторні \`get()\` без змін залежностей не викликають \`fn\`;
- саме може бути залежністю інших \`computed\`/\`effect\`.

### \`effect(fn)\` → \`dispose()\`
- виконує \`fn\` одразу і перезапускає, коли змінюється будь-яка прочитана в останньому запуску залежність;
- залежності **динамічні**: перед кожним запуском старі підписки знімаються;
- якщо \`fn\` повернула функцію — це cleanup: викликається перед наступним запуском і при \`dispose()\`;
- після \`dispose()\` ефект більше не запускається.

### \`batch(fn)\`
- виконує \`fn\` і повертає її результат; ефекти, зачеплені всіма \`set\` усередині, запускаються **один раз** після завершення \`fn\`.

**Без глітчів:** при одному \`set\` кожен ефект виконується не більше одного разу і бачить узгоджений стан (наприклад, «ромб» \`a → b, a → c, (b, c) → effect\`).

\`\`\`js
const a = signal(1);
const double = computed(() => a.get() * 2);
effect(() => console.log('double =', double.get())); // double = 2
a.set(5);                                             // double = 10
\`\`\`

**Як це працює:** Глобальна змінна «хто зараз виконується». Коли effect або computed читає сигнал, сигнал запам'ятовує його як підписника. set повідомляє підписників: effect перезапускається, computed позначається «застарілим» і перераховується при читанні.
`,
      starter: `// План:
// 1. Глобальна змінна activeObserver — хто зараз виконується
// 2. signal.get() реєструє activeObserver як підписника; set() повідомляє підписників
// 3. computed: лінивий, перераховується при читанні після зміни залежностей
// 4. effect: виконати одразу, перезапускати при змінах; batch відкладає ефекти до кінця

function signal(initial) {
  let value = initial;
  return {
    get() { return value; },
    set(next) { value = next; }
  };
}

function computed(fn) {
  return { get: () => fn() };
}

function effect(fn) {
  fn();
  return () => {};
}

function batch(fn) {
  return fn();
}
`,
      solution: `let activeObserver = null;     // хто зараз виконується (computed або effect)
let batchDepth = 0;
let flushing = false;
const pendingEffects = new Set();

// підписати поточного спостерігача на джерело (observers — Set підписників джерела)
function track(observers) {
  if (!activeObserver) return;
  observers.add(activeObserver);
  activeObserver.sources.add(observers);
}

function untrackAll(node) {
  for (const observers of node.sources) observers.delete(node);
  node.sources.clear();
}

function runTracked(node, fn) {
  untrackAll(node); // динамічні залежності: збираємо їх заново на кожному запуску
  const prev = activeObserver;
  activeObserver = node;
  try {
    return fn();
  } finally {
    activeObserver = prev;
  }
}

function flush() {
  if (batchDepth > 0 || flushing) return;
  flushing = true;
  try {
    while (pendingEffects.size) {
      const [node] = pendingEffects;
      pendingEffects.delete(node);
      node.run();
    }
  } finally {
    flushing = false;
  }
}

function signal(initial) {
  let value = initial;
  const observers = new Set();
  return {
    get() {
      track(observers);
      return value;
    },
    set(next) {
      if (Object.is(next, value)) return;
      value = next;
      // push: лише позначаємо залежних "брудними"; ефекти ставимо в чергу
      for (const node of [...observers]) node.notify();
      flush(); // ефекти виконуються ПІСЛЯ розмітки всього графа -> без глітчів
    },
  };
}

function computed(fn) {
  let value;
  let dirty = true;
  const observers = new Set();
  const node = {
    sources: new Set(),
    notify() {
      if (dirty) return; // вже позначений — далі по графу вже сповіщено
      dirty = true;
      for (const o of [...observers]) o.notify();
    },
  };
  return {
    get() {
      track(observers);
      if (dirty) {
        value = runTracked(node, fn); // pull: перераховуємо ліниво при читанні
        dirty = false;
      }
      return value;
    },
  };
}

function effect(fn) {
  let cleanup = null;
  let disposed = false;
  const node = {
    sources: new Set(),
    notify() {
      if (!disposed) pendingEffects.add(node); // Set дедуплікує повторні сповіщення
    },
    run() {
      if (disposed) return;
      if (typeof cleanup === 'function') cleanup();
      cleanup = runTracked(node, fn);
    },
  };
  node.run();
  return function dispose() {
    if (disposed) return;
    disposed = true;
    pendingEffects.delete(node);
    untrackAll(node);
    if (typeof cleanup === 'function') cleanup();
    cleanup = null;
  };
}

function batch(fn) {
  batchDepth++;
  try {
    return fn();
  } finally {
    batchDepth--;
    flush();
  }
}
`,
      hints: [
        'Ключ до автоматичного трекінгу — глобальна змінна `activeObserver`. `computed`/`effect` перед виконанням `fn` записують туди себе, а `signal.get()` додає `activeObserver` у свій набір підписників (і навпаки — запам\'ятовує джерело в спостерігача, щоб потім відписатися).',
        'Розділіть сповіщення і виконання: `set` лише викликає `notify()` у підписників. `computed.notify` ставить `dirty = true` і передає сповіщення далі; `effect.notify` додає ефект у `Set` черги. Після розмітки `set` викликає `flush()`, що виконує ефекти з черги, — так кожен ефект запуститься один раз.',
        'Перед кожним запуском `computed`/`effect` знімайте всі старі підписки (динамічні залежності). `batch` — лічильник глибини: `flush()` нічого не робить, поки лічильник > 0, а після `fn` — викликається явно. Cleanup ефекту — значення, яке повернула `fn`.'
      ],
      tests: [
        { name: 'signal: get/set', code: "const s = signal(1);\nexpect(s.get()).toBe(1);\ns.set(2);\nexpect(s.get()).toBe(2);" },
        { name: 'effect: одразу і при зміні; однакове значення не перезапускає', code: "const s = signal('a');\nconst log = [];\neffect(() => { log.push(s.get()); });\nexpect(log).toEqual(['a']);\ns.set('b');\ns.set('b');\nexpect(log).toEqual(['a', 'b']);" },
        { name: 'computed лінивий і кешований', code: "const a = signal(2);\nconst fn = mockFn(() => a.get() * 10);\nconst c = computed(fn);\nexpect(fn).not.toHaveBeenCalled();\nexpect(c.get()).toBe(20);\nexpect(c.get()).toBe(20);\nexpect(fn).toHaveBeenCalledTimes(1);\na.set(3);\nexpect(fn).toHaveBeenCalledTimes(1);\nexpect(c.get()).toBe(30);\nexpect(fn).toHaveBeenCalledTimes(2);" },
        { name: 'ланцюжок computed → effect', code: "const price = signal(100);\nconst qty = signal(2);\nconst total = computed(() => price.get() * qty.get());\nconst withTax = computed(() => total.get() * 1.2);\nconst log = [];\neffect(() => { log.push(withTax.get()); });\nqty.set(3);\nprice.set(50);\nexpect(log).toEqual([240, 360, 180]);" },
        { name: 'ромб без глітчів: ефект один раз з узгодженим станом', code: "const a = signal(1);\nconst b = computed(() => a.get() * 2);\nconst c = computed(() => a.get() + 1);\nconst log = [];\neffect(() => { log.push(b.get() + ':' + c.get()); });\na.set(2);\nexpect(log).toEqual(['2:2', '4:3']);" },
        { name: 'динамічні залежності', code: "const flag = signal(true);\nconst x = signal('x1');\nconst y = signal('y1');\nconst log = [];\neffect(() => { log.push(flag.get() ? x.get() : y.get()); });\ny.set('y2');\nexpect(log).toEqual(['x1']);\nflag.set(false);\nexpect(log).toEqual(['x1', 'y2']);\nx.set('x2');\nexpect(log).toEqual(['x1', 'y2']);\ny.set('y3');\nexpect(log).toEqual(['x1', 'y2', 'y3']);" },
        { name: 'dispose і cleanup', code: "const s = signal(0);\nconst log = [];\nconst dispose = effect(() => { const v = s.get(); log.push('run ' + v); return () => log.push('cleanup ' + v); });\ns.set(1);\ndispose();\ns.set(2);\ndispose();\nexpect(log).toEqual(['run 0', 'cleanup 0', 'run 1', 'cleanup 1']);" },
        { name: 'batch: один запуск ефекту на кілька set', code: "const first = signal('Ann');\nconst last = signal('Lee');\nconst log = [];\neffect(() => { log.push(first.get() + ' ' + last.get()); });\nconst r = batch(() => { first.set('Bob'); last.set('Marley'); return 'ok'; });\nexpect(r).toBe('ok');\nexpect(log).toEqual(['Ann Lee', 'Bob Marley']);" },
        { name: 'ефект, що змінює інший сигнал', code: "const celsius = signal(0);\nconst fahrenheit = signal(32);\nconst log = [];\neffect(() => { fahrenheit.set(celsius.get() * 9 / 5 + 32); });\neffect(() => { log.push(fahrenheit.get()); });\ncelsius.set(100);\nexpect(log).toEqual([32, 212]);" }
      ],
      explanation: `
Це спрощена модель **push-pull реактивності**, на якій побудовані Preact Signals, Solid, Vue, Angular Signals.

**Як працює трекінг:** \`activeObserver\` — «хто зараз обчислюється». \`get()\` додає його в підписники сигналу, а сигнал — у \`sources\` спостерігача (двосторонній зв'язок потрібен, щоб відписатися перед наступним запуском → **динамічні залежності** і відсутність витоків).

**Чому немає глітчів:** \`set\` спершу **розмічає** весь граф (\`computed\` → \`dirty\`, ефекти → у чергу \`Set\`, що дедуплікує), і лише потім \`flush\` виконує ефекти. Коли ефект читає \`computed\`, той перераховується ліниво з уже новими значеннями. У ромбі ефект виконується один раз і бачить \`4:3\`, а не проміжне \`4:2\`.

**Складність:** \`set\` — O(розмір залежного підграфа); \`computed.get()\` — O(1) з кешу.

**Спрощення порівняно з продакшен-бібліотеками:**
- немає **equality cutoff** для \`computed\`: якщо \`computed\` перерахувався в те саме значення, залежні ефекти все одно перезапустяться (у Preact/Solid — ні, завдяки версіям/станам \`CHECK\`/\`DIRTY\`);
- немає захисту від нескінченних циклів (ефект змінює власну залежність);
- немає \`untracked(fn)\`, власників (owner tree) для автоматичного \`dispose\` вкладених ефектів, асинхронного планувальника.

**Типові помилки:** виконувати ефекти прямо в \`set\` (глітчі та дублікати); не знімати старі підписки (ефект реагує на гілку, яка більше не читається); не відновлювати \`activeObserver\` у \`finally\` (вкладені обчислення ламають трекінг); забути, що читання сигналу в cleanup/поза ефектом не підписує.

**Що можуть спитати далі:** як додати equality cutoff для \`computed\`? Як реалізувати \`untracked\`? Як прив'язати сигнал до DOM-вузла (\`effect(() => el.textContent = s.get())\`)? Чим це відрізняється від Vue \`ref\`/\`reactive\` на Proxy?
`
    }
  ]
});
