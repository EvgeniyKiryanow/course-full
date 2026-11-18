FE.topic('events', {
  intro: `
## Реєстрація обробників

\`\`\`js
el.addEventListener('click', handler, {
  capture: false, // фаза перехоплення (capturing) замість спливання
  once: true,     // автоматично зняти після першого виклику
  passive: true,  // обіцянка не викликати preventDefault (скрол без затримок)
  signal,         // AbortController.signal — зняти через controller.abort()
});
el.removeEventListener('click', handler, { capture: false }); // те саме посилання + той самий capture!
\`\`\`

- \`el.onclick = fn\` — лише **один** обробник (перезаписується); \`addEventListener\` — скільки завгодно.
- Анонімну функцію зняти неможливо — немає посилання.

## Потік події (event flow)

1. **Capturing** — від \`window\` вниз до батька цілі (\`eventPhase === 1\`).
2. **Target** — на самому елементі (\`eventPhase === 2\`).
3. **Bubbling** — від цілі вгору до \`window\` (\`eventPhase === 3\`), якщо \`bubbles: true\`.

| Властивість | Що це |
|---|---|
| \`e.target\` | Елемент, де подія виникла (найглибший) |
| \`e.currentTarget\` | Елемент, на якому висить поточний обробник |
| \`e.stopPropagation()\` | Зупиняє рух до інших елементів (обробники поточного — виконаються) |
| \`e.stopImmediatePropagation()\` | Ще й не викликає решту обробників поточного елемента |
| \`e.preventDefault()\` | Скасовує дію браузера (перехід, submit, скрол). На спливання не впливає! |

**Не спливають:** \`focus/blur\` (є \`focusin/focusout\`), \`mouseenter/mouseleave\` (є \`mouseover/mouseout\`), \`load/error\` ресурсів, \`scroll\` елементів.

## Делегування (delegation)

\`\`\`js
list.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn || !list.contains(btn)) return;
  actions[btn.dataset.action](btn);
});
\`\`\`

## Форми та клавіатура

- \`input\` — на кожну зміну значення; \`change\` — після завершення (blur для тексту, одразу для checkbox/select).
- \`submit\` — на формі (не на кнопці!); \`preventDefault()\` для SPA-обробки.
- \`e.key\` — символ з урахуванням розкладки (\`'л'\`, \`'Enter'\`); \`e.code\` — фізична клавіша (\`'KeyK'\`).

## Кастомні події

\`\`\`js
el.dispatchEvent(new CustomEvent('cart:add', { detail: { id: 1 }, bubbles: true, cancelable: true }));
\`\`\`

- \`dispatchEvent\` **синхронний**; повертає \`false\`, якщо викликали \`preventDefault()\` (при \`cancelable: true\`).
- \`bubbles\` за замовчуванням \`false\`! \`e.isTrusted === false\` для подій зі скрипту.

## Пастки

- У \`passive\`-обробнику \`preventDefault()\` ігнорується.
- Справжній клік: мікрозадачі виконуються **між** обробниками; \`el.click()\` — після всіх.
- Забуті обробники на \`window\`/\`document\` у SPA = витік пам'яті. Прибирайте через \`AbortController\`.
`,
  groups: [
    {
      id: 'listeners',
      title: 'Обробники: addEventListener і зняття'
    },
    {
      id: 'flow',
      title: 'Потік події: capture, target, bubbling'
    },
    {
      id: 'delegation',
      title: 'Делегування подій'
    },
    {
      id: 'forms',
      title: 'Форми і дії за замовчуванням'
    },
    {
      id: 'keyboard',
      title: 'Клавіатура і ввід у реальному часі'
    },
    {
      id: 'focus-ui',
      title: 'Фокус, неспливаючі події, модалки й меню'
    },
    {
      id: 'custom',
      title: 'Кастомні події і EventTarget'
    },
    {
      id: 'cleanup',
      title: 'Прибирання обробників і під капотом'
    }
  ],
  items: [
    // ================================================================ 1. Обробники
    {
      id: 'ev-listener-ways',
      group: 'listeners',
      type: 'theory',
      level: 1,
      title: 'Способи призначити обробник події',
      tags: ['addEventListener', 'basics'],
      question: 'Якими способами можна призначити обробник події? Чим `addEventListener` кращий за `onclick`? Які опції він приймає? Оберіть **усі** правильні твердження.',
      choices: [
        'Повторний `addEventListener` з тією ж функцією й тим самим `capture` додасть її вдруге — вона спрацює двічі',
        '`btn.onclick = fn` зберігає лише один обробник: нове присвоєння перезаписує попередній',
        '`removeEventListener` спрацює, лише якщо передати те саме посилання на функцію і те саме `capture`',
        'Опція `passive: true` змушує обробник виконуватися асинхронно, уже після рендерингу кадру',
        'Опція `signal` знімає обробник при `controller.abort()`, а `once` — після першого спрацювання'
      ],
      correct: [1, 2, 4],
      why: [
        'Хибно: дублікат (той самий тип, функція і capture) ігнорується — обробник буде один.',
        'Правильно: on-властивість — це один «слот», нове присвоєння витісняє старе.',
        'Правильно: слухача ідентифікують тип + посилання + capture; інша функція чи інший capture — «інший» слухач.',
        'Хибно: passive лише обіцяє не викликати preventDefault(); обробник виконується як звичайно, синхронно.',
        'Правильно: обидві опції автоматично знімають слухача — за сигналом або після першого виклику.'
      ],
      hint: 'Атрибут HTML, властивість DOM, метод addEventListener. Скільки обробників дозволяє кожен спосіб?',
      answer: `
**Три способи:**
1. HTML-атрибут \`<button onclick="save()">\` — змішує розмітку й логіку, конфліктує з CSP.
2. DOM-властивість \`btn.onclick = fn\` — лише **один** обробник; зняти: \`btn.onclick = null\`.
3. \`addEventListener(type, fn, options)\` — скільки завгодно обробників і опції.

\`\`\`js
btn.addEventListener('click', onClick, {
  capture: true,             // фаза перехоплення
  once: true,                // зніметься після першого виклику
  passive: true,             // preventDefault() буде проігноровано
  signal: controller.signal, // controller.abort() зніме обробник
});
btn.removeEventListener('click', onClick, { capture: true });
\`\`\`

**Пастки:**
- зняти можна лише за **тим самим посиланням** і тим самим \`capture\` — анонімну функцію чи \`fn.bind(x)\` не зняти;
- повторне додавання тієї ж функції ігнорується;
- третій аргумент \`true\` — стара форма \`{ capture: true }\`.
`,
      keyPoints: [
        'Три способи: HTML-атрибут, on-властивість, addEventListener',
        'on-властивість зберігає лише один обробник, addEventListener — багато',
        'Опції: capture, once, passive, signal',
        'removeEventListener вимагає те саме посилання і той самий capture',
        'Повторне додавання тієї ж функції ігнорується'
      ],
      followUps: ['Як зняти обробник, створений через bind?', 'Що таке handleEvent?', 'Чому inline-обробники конфліктують з Content Security Policy?']
    },
    {
      id: 'ev-quiz-remove-listener',
      group: 'listeners',
      type: 'quiz',
      level: 2,
      title: 'Який виклик справді зніме обробник?',
      tags: ['removeEventListener'],
      question: `
Обробник додано так:

\`\`\`js
function onClick() { console.log('click'); }
el.addEventListener('click', onClick, true);
\`\`\`

Оберіть **усі** виклики, після яких \`onClick\` більше не спрацює:
`,
      options: [
        '`el.removeEventListener(\'click\', onClick)`',
        '`el.removeEventListener(\'click\', onClick, true)`',
        '`el.removeEventListener(\'click\', onClick, { capture: true })`',
        '`el.removeEventListener(\'click\', onClick, { once: true })`',
        '`el.removeEventListener(\'click\', onClick.bind(el), true)`',
        '`el.removeEventListener(\'click\', function onClick() { console.log(\'click\'); }, true)`'
      ],
      answer: [1, 2],
      why: [
        'Не знімає: capture за замовчуванням false, а додавали з true — це інший слухач.',
        'Знімає: тип, посилання і capture збігаються.',
        'Знімає: `{ capture: true }` — те саме, що `true`.',
        'Не знімає: `once` при пошуку не враховується, а capture тут false.',
        'Не знімає: `bind` повертає нову функцію з іншим посиланням.',
        'Не знімає: функція з тим самим ім\'ям і тілом — інший об\'єкт.'
      ],
      hint: 'Обробник ідентифікується трійкою: тип + посилання на функцію + прапорець capture. Інші опції не враховуються.',
      explanation: `
Слухача однозначно визначають **тип**, **посилання** на функцію та **\`capture\`**. Опції \`once\`, \`passive\`, \`signal\` при знятті ігноруються.

Тому анонімні обробники зняти неможливо, а для масового зняття зручно \`AbortController\` + \`signal\` (крок «Прибирання»).
`
    },
    {
      id: 'ev-once-button',
      group: 'listeners',
      type: 'dom',
      level: 1,
      interview: false,
      title: 'Кнопка «Оплатити», що спрацьовує лише раз',
      tags: ['addEventListener', 'once'],
      description: `
**Завдання.** Зробіть так, щоб кнопка «Оплатити» викликала \`pay()\` лише при першому кліку, а потім показувала «Оплачено».

**Де трапляється:** захист від подвійної оплати / подвійного submit — користувач нервово клікає двічі.

**Дано**
- HTML: \`<button id="pay">Оплатити</button>\`
- JS: лічильник \`payments\` і функція \`pay()\` — **не змінюйте** їх (тести читають \`payments\`). Обробник \`click\` уже є, але спрацьовує на кожен клік.

**Що написати**
- обробник \`click\` на \`#pay\` з опцією \`{ once: true }\`, який:
  - викликає \`pay()\`;
  - ставить текст кнопки \`Оплачено\`;
  - ставить атрибут \`aria-disabled="true"\`.

**Приклад**
\`\`\`js
// клік, клік, клік по #pay
payments;                               // 1
btn.textContent;                        // 'Оплачено'
btn.getAttribute('aria-disabled');      // 'true'
\`\`\`

**Як це працює:** з \`{ once: true }\` браузер знімає слухача **перед** першим викликом. Наступні кліки ще генерують подію \`click\`, але слухача на кнопці вже немає.

**Врахуйте:** опції — це **третій** аргумент \`addEventListener\`; текст міняйте через \`textContent\`.
`,
      html: `<button id="pay">Оплатити</button>`,
      css: `#pay { padding: 8px 16px; }`,
      js: `let payments = 0;
function pay() { payments++; }

const btn = document.querySelector('#pay');

// 1. Передайте третім аргументом опції, щоб обробник спрацював лише раз.
btn.addEventListener('click', () => {
  pay();
  // 2. TODO: змініть текст кнопки на 'Оплачено'
  // 3. TODO: встановіть атрибут aria-disabled="true"
});

// Спробуйте: клікніть кнопку тричі, потім у консолі: payments
`,
      editable: ['js'],
      solution: {
        js: `let payments = 0;
function pay() { payments++; }

const btn = document.querySelector('#pay');
btn.addEventListener('click', () => {
  pay();
  btn.textContent = 'Оплачено';
  btn.setAttribute('aria-disabled', 'true');
}, { once: true }); // браузер сам зніме обробник після першого виклику
`
      },
      hints: [
        'Третій аргумент `addEventListener` може бути об\'єктом опцій.',
        '`{ once: true }` — обробник автоматично видаляється одразу перед першим викликом.',
        '`btn.textContent = \'Оплачено\'; btn.setAttribute(\'aria-disabled\', \'true\');` всередині обробника, а `{ once: true }` — після функції.'
      ],
      tests: [
        { name: 'перший клік викликає pay()', code: "click('#pay');\nexpect(payments).toBe(1);" },
        { name: 'повторні кліки не викликають pay()', code: "click('#pay');\nclick('#pay');\nclick('#pay');\nexpect(payments).toBe(1);" },
        { name: 'текст і aria-disabled оновлені', code: "click('#pay');\nexpect($('#pay').textContent.trim()).toBe('Оплачено');\nexpect($('#pay').getAttribute('aria-disabled')).toBe('true');" }
      ],
      explanation: `
\`{ once: true }\` гарантує одноразове спрацьовування без ручного \`removeEventListener\` і без прапорців.

**Альтернативи:** прапорець у замиканні (\`if (done) return\`), \`removeEventListener\` всередині обробника, \`btn.disabled = true\`. Справжній захист від подвійної оплати — ще й ідемпотентність на бекенді (idempotency key).

**Типова помилка:** передати опції четвертим аргументом або покладатися лише на UI-блокування.

**Що спитають далі:** чим \`aria-disabled\` відрізняється від \`disabled\`? Як захистити форму від подвійного submit?
`
    },
    {
      id: 'ev-quiz-onclick-order',
      group: 'listeners',
      type: 'quiz',
      level: 4,
      interview: false,
      title: 'Inline onclick, властивість і addEventListener',
      tags: ['onclick', 'spec'],
      question: `
\`\`\`html
<button id="btn" onclick="console.log('inline')">x</button>
\`\`\`

\`\`\`js
btn.addEventListener('click', () => console.log('listener 1'));
btn.onclick = () => console.log('property');
btn.addEventListener('click', () => console.log('listener 2'));
\`\`\`

Що виведе клік?
`,
      options: [
        '`inline`, `listener 1`, `property`, `listener 2`',
        '`listener 1`, `property`, `listener 2`',
        '`property`, `listener 1`, `listener 2`',
        '`listener 1`, `listener 2`, `property`'
      ],
      answer: 2,
      why: [
        'Хибно: атрибут і властивість — один слот; присвоєння властивості замінило inline-функцію.',
        'Хибно: так було б без атрибута — слот зайняв би місце в момент присвоєння властивості.',
        'Правильно: слот зайняв першу позицію ще під час парсингу HTML; заміна функції позицію не змінює.',
        'Хибно: on-обробник не «йде в кінець» — він стоїть там, де слот уперше отримав значення.'
      ],
      hint: 'HTML-атрибут і DOM-властивість onclick — це один і той самий «обробник-слот». Коли він займає місце у списку слухачів?',
      explanation: `
Атрибут \`onclick\` і властивість \`el.onclick\` — **один** event handler. Він стає у список слухачів, коли вперше отримує значення (тут — при парсингу HTML, до всіх \`addEventListener\`). Присвоєння \`btn.onclick = ...\` замінює функцію, але не позицію.

Якщо зробити \`btn.onclick = null\` і потім присвоїти знову — обробник стане в кінець.

Висновок для практики: не змішуйте \`on*\` і \`addEventListener\` для однієї події.
`
    },

    // ================================================================ 2. Потік події
    {
      id: 'ev-phases',
      group: 'flow',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Фази події: capturing, target, bubbling',
      tags: ['bubbling', 'capturing', 'event-flow'],
      question: 'Опишіть, як подія проходить DOM-деревом. Що таке спливання та перехоплення? Чим `target` відрізняється від `currentTarget`? Оберіть **усі** правильні твердження.',
      choices: [
        'Подія спершу спливає від цілі до `window`, а потім повертається вниз фазою перехоплення',
        '`e.target` — елемент, де подія виникла; `e.currentTarget` — елемент, чий слухач зараз виконується',
        '`preventDefault()` скасовує і дію браузера, і подальше поширення події деревом',
        '`focus` не спливає, але його можна перехопити на предку слухачем з `capture: true`',
        '`stopPropagation()` скасовує також решту слухачів на поточному елементі'
      ],
      correct: [1, 3],
      why: [
        'Хибно: порядок навпаки — спершу capturing згори вниз, потім target, потім bubbling знизу вгору.',
        'Правильно: target не змінюється за весь шлях, currentTarget — щоразу елемент поточного слухача.',
        'Хибно: preventDefault() скасовує лише дію браузера; поширення зупиняє stopPropagation().',
        'Правильно: capture-фаза є навіть у неспливаючих подій, тому предок із capture: true побачить focus.',
        'Хибно: це робить stopImmediatePropagation(); stopPropagation() дає доспрацювати слухачам поточного елемента.'
      ],
      hint: 'Три фази, eventPhase, шлях від window до цілі й назад.',
      answer: `
Браузер обчислює шлях \`window → document → html → body → … → target\` і проходить його в три фази:

1. **Capturing** (\`eventPhase === 1\`): згори вниз до батька цілі, слухачі з \`capture: true\`.
2. **Target** (\`eventPhase === 2\`): на самому елементі (у сучасних браузерах — спочатку capture-, потім bubble-слухачі).
3. **Bubbling** (\`eventPhase === 3\`): від батька цілі вгору; лише якщо \`bubbles: true\`.

\`\`\`js
parent.addEventListener('click', () => console.log('capture'), true);
parent.addEventListener('click', () => console.log('bubble'));
child.addEventListener('click', () => console.log('target'));
// клік по child: capture → target → bubble
\`\`\`

- \`e.target\` — найглибший елемент, де виникла подія; \`e.currentTarget\` — елемент поточного слухача (після диспатчу стає \`null\`).
- \`stopPropagation()\` — не йти далі; \`stopImmediatePropagation()\` — ще й не викликати решту слухачів елемента; \`preventDefault()\` на поширення не впливає.
- Не спливають \`focus\`, \`blur\`, \`mouseenter/leave\`, \`load\`/\`error\` ресурсів, але capture-фаза є в усіх.

**Де capture корисний:** глобальна аналітика, закриття поповерів до того, як внутрішній код зупинить спливання.
`,
      keyPoints: [
        'Три фази: capturing (1), target (2), bubbling (3)',
        'Capture-слухачі — третій аргумент true або { capture: true }',
        'target — де виникла подія; currentTarget — де висить поточний слухач',
        'stopPropagation vs stopImmediatePropagation; preventDefault не зупиняє поширення',
        'Не всі події спливають, але capture-фаза є у всіх'
      ],
      followUps: ['Чому stopPropagation вважають антипатерном?', 'Як перехопити focus на предку?', 'Що таке composedPath() і як події проходять через Shadow DOM?']
    },
    {
      id: 'ev-quiz-target-currenttarget',
      group: 'flow',
      type: 'quiz',
      level: 1,
      interview: true,
      title: 'target, currentTarget і this',
      tags: ['target', 'this'],
      question: `
\`\`\`html
<ul id="list"><li><b>Пункт</b></li></ul>
\`\`\`

\`\`\`js
list.addEventListener('click', function (e) {
  console.log(e.target.tagName, e.currentTarget.tagName, this.tagName);
});
\`\`\`

Що виведе клік по тексту «Пункт»?
`,
      options: ['`UL UL UL`', '`B UL UL`', '`B LI UL`', '`LI UL undefined`'],
      answer: 1,
      why: [
        'Хибно: target — не елемент зі слухачем, а найглибший елемент під курсором, тобто `<b>`.',
        'Правильно: target — `<b>`, currentTarget — `<ul>` зі слухачем, а this у звичайній функції-обробнику = currentTarget.',
        'Хибно: currentTarget — елемент, де висить слухач (`<ul>`), а не проміжний `<li>`.',
        'Хибно: подія виникає на `<b>`, а this у звичайній (не стрілковій) функції дорівнює currentTarget.'
      ],
      hint: 'target — найглибший елемент під курсором; currentTarget — той, на якому висить обробник. А чому дорівнює this у звичайній функції-обробнику?',
      explanation: `
- \`e.target\` — \`<b>\`: подія виникає на вузлі безпосередньо під курсором.
- \`e.currentTarget\` — \`<ul>\`: слухач висить там.
- \`this\` у звичайній функції-обробнику = \`currentTarget\`. У стрілковій \`this\` береться ззовні, і \`this.tagName\` дав би \`undefined\`.

Тому в делегуванні шукають \`e.target.closest('li')\`, а не беруть \`e.target\` напряму.
`
    },
    {
      id: 'ev-quiz-flow-order',
      group: 'flow',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'Порядок capture- і bubble-обробників',
      tags: ['bubbling', 'capturing'],
      question: `
\`\`\`html
<div id="a"><button id="b">Клік</button></div>
\`\`\`

\`\`\`js
a.addEventListener('click', () => console.log('a bubble'));
a.addEventListener('click', () => console.log('a capture'), true);
b.addEventListener('click', () => console.log('b'));
document.addEventListener('click', () => console.log('doc'), { capture: true });
\`\`\`

Що виведе клік по кнопці \`#b\`?
`,
      options: [
        '`b`, `a bubble`, `a capture`, `doc`',
        '`a bubble`, `a capture`, `b`, `doc`',
        '`doc`, `a capture`, `b`, `a bubble`',
        '`b`, `a capture`, `a bubble`, `doc`'
      ],
      answer: 2,
      why: [
        'Хибно: це лише спливання знизу вгору; capture-слухачі (`doc`, `a capture`) спрацьовують раніше за ціль.',
        'Хибно: це порядок реєстрації; він важливий лише між слухачами однієї фази на одному елементі.',
        'Правильно: capture згори вниз (doc → a), потім ціль (b), потім bubble вгору (a bubble).',
        'Хибно: `doc` — capture-слухач на найвищому елементі, тож він перший, а не останній.'
      ],
      hint: 'Спочатку подія йде згори вниз (capture), потім знизу вгору (bubble). Порядок реєстрації між фазами не важливий.',
      explanation: `
1. Capturing згори вниз: \`document\` → \`doc\`, \`#a\` → \`a capture\`.
2. Target: \`#b\` → \`b\`.
3. Bubbling знизу вгору: \`#a\` → \`a bubble\`. На \`document\` bubble-слухачів немає.

Результат: \`doc\`, \`a capture\`, \`b\`, \`a bubble\`.
`
    },
    {
      id: 'ev-flow-log',
      group: 'flow',
      type: 'dom',
      level: 2,
      interview: false,
      title: 'Показати порядок фаз події на вкладених блоках',
      tags: ['bubbling', 'capturing', 'currentTarget'],
      description: `
**Завдання.** Повісьте на три вкладені блоки по два слухачі \`click\` (capture і bubble), які записують у масив \`log\`, через що пройшла подія.

**Де трапляється:** класика співбесід — «покажіть у коді порядок capturing/bubbling». Так само дебажать, хто саме перехоплює клік на сторінці.

**Дано (HTML)**
\`\`\`html
<div id="outer">
  <div id="middle">
    <button id="inner">inner</button>
  </div>
</div>
\`\`\`
У JS є порожній масив \`const log = []\`.

**Що написати** — для кожного з \`#outer\`, \`#middle\`, \`#inner\`:
- capture-слухач \`click\` → \`log.push('capture:<id>')\`;
- bubble-слухач \`click\` → \`log.push('bubble:<id>')\`,

де \`<id>\` — id елемента, **на якому висить слухач**, а не того, по якому клікнули.

**Приклад**
\`\`\`js
// клік по #inner
log; // ['capture:outer', 'capture:middle', 'capture:inner', 'bubble:inner', 'bubble:middle', 'bubble:outer']
// клік по #middle
log; // ['capture:outer', 'capture:middle', 'bubble:middle', 'bubble:outer']
\`\`\`

**Як це працює:** подія йде \`outer → middle → inner\` (capture), потім назад (bubble). На самій цілі сучасні браузери спершу викликають capture-, потім bubble-слухачі.

**Врахуйте:** \`e.target.id\` дасть id цілі в усіх записах — потрібен \`e.currentTarget.id\` (або id із замикання).
`,
      html: `<div id="outer">outer
  <div id="middle">middle
    <button id="inner">inner</button>
  </div>
</div>`,
      css: `div { padding: 12px; border: 1px solid #99c; margin: 4px; }`,
      js: `const log = [];

['outer', 'middle', 'inner'].forEach((id) => {
  const el = document.getElementById(id);
  // 1. TODO: capture-слухач click → log.push('capture:' + <id елемента зі слухачем>)
  //    (третій аргумент true або { capture: true })
  // 2. TODO: звичайний (bubble) слухач click → log.push('bubble:' + ...)
});

// Спробуйте: клікніть #inner і виведіть log у консоль
`,
      editable: ['js'],
      solution: {
        js: `const log = [];

['outer', 'middle', 'inner'].forEach((id) => {
  const el = document.getElementById(id);
  // currentTarget — елемент, на якому висить обробник
  el.addEventListener('click', (e) => log.push('capture:' + e.currentTarget.id), { capture: true });
  el.addEventListener('click', (e) => log.push('bubble:' + e.currentTarget.id));
});
`
      },
      hints: [
        'Третій аргумент `true` або `{ capture: true }` — обробник на фазі перехоплення.',
        'Використайте `e.currentTarget.id` (або `id` із замикання), а не `e.target.id`.',
        '`el.addEventListener(\'click\', (e) => log.push(\'capture:\' + e.currentTarget.id), true)` і такий самий без `true` для bubble.'
      ],
      tests: [
        { name: 'клік по #inner — повний шлях', code: "log.length = 0;\nclick('#inner');\nexpect(log).toEqual(['capture:outer', 'capture:middle', 'capture:inner', 'bubble:inner', 'bubble:middle', 'bubble:outer']);" },
        { name: 'клік по #middle — без inner', code: "log.length = 0;\nclick('#middle');\nexpect(log).toEqual(['capture:outer', 'capture:middle', 'bubble:middle', 'bubble:outer']);" },
        { name: 'клік по #outer', code: "log.length = 0;\nclick('#outer');\nexpect(log).toEqual(['capture:outer', 'bubble:outer']);" }
      ],
      explanation: `
Шлях події: \`window → … → outer → middle → inner\` і назад. Capture-слухачі спрацьовують на шляху вниз, bubble — на шляху вгору.

Тест із кліком по \`#middle\` ловить типову помилку \`e.target.id\`: тоді всі записи були б \`...:middle\`.

**Що спитають далі:** що виведе \`e.eventPhase\` у кожному обробнику? Що зміниться, якщо в \`capture:middle\` викликати \`stopPropagation()\`? (Лишиться \`capture:outer\`, \`capture:middle\` — до цілі подія не дійде.)
`
    },
    {
      id: 'ev-quiz-stop-immediate',
      group: 'flow',
      type: 'quiz',
      level: 3,
      title: 'stopPropagation vs stopImmediatePropagation',
      tags: ['stopPropagation'],
      question: `
\`#btn\` знаходиться всередині \`#parent\`. Що виведе клік по кнопці?

\`\`\`js
btn.addEventListener('click', (e) => { console.log(1); e.stopPropagation(); });
btn.addEventListener('click', () => console.log(2));
parent.addEventListener('click', () => console.log(3));
btn.addEventListener('click', (e) => { console.log(4); e.stopImmediatePropagation(); });
btn.addEventListener('click', () => console.log(5));
\`\`\`
`,
      options: ['`1`', '`1 2 3 4`', '`1 2 4 5`', '`1 2 4`', '`1 2 4 5 3`'],
      answer: 3,
      why: [
        'Хибно: stopPropagation() не зупиняє інші слухачі того самого елемента — 2 і 4 виконаються.',
        'Хибно: 3 не виведеться — поширення до #parent зупинено ще в першому обробнику; і порядок тут за елементами, не за реєстрацією.',
        'Хибно: stopImmediatePropagation() у четвертому обробнику не дає виконатися п\'ятому.',
        'Правильно: 1 і 2 виконуються, 4 зупиняє решту слухачів (5), а до parent (3) подія не доходить.',
        'Хибно: і 5, і 3 заблоковані — відповідно stopImmediatePropagation() і stopPropagation().'
      ],
      hint: 'stopPropagation не впливає на інші обробники того самого елемента. А stopImmediatePropagation?',
      explanation: `
- \`1\` + \`stopPropagation()\` → до \`#parent\` подія не піде, але решта слухачів \`#btn\` виконається.
- \`2\` → виконується.
- \`4\` + \`stopImmediatePropagation()\` → зупиняє ще й решту слухачів поточного елемента.
- \`5\`, \`3\` → не виконуються.

Результат: \`1 2 4\`.
`
    },

    // ================================================================ 3. Делегування
    {
      id: 'ev-delegation-theory',
      group: 'delegation',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Делегування подій: як, навіщо, обмеження',
      tags: ['delegation', 'bubbling'],
      question: 'Що таке делегування подій? Як його правильно реалізувати, які переваги та обмеження?',
      choices: [
        'Один слухач на предку, елемент шукають через `e.target.closest(...)`; працює і для доданих пізніше',
        'Слухач вішають на предка й беруть `e.currentTarget` — це завжди та кнопка, по якій клікнули',
        'Делегування однаково працює для будь-яких подій, включно з `focus`, `blur` і `mouseenter`',
        'Досить перевірити `e.target.matches(\'button\')` — клік по вкладеному `<span>` дає target-кнопку',
        'Після кожного рендеру нових дочірніх елементів слухач на предку треба навішувати заново'
      ],
      correct: 0,
      why: [
        'Правильно: спливання доносить подію до предка, closest знаходить потрібний елемент — і для нових нащадків теж.',
        'Хибно: currentTarget у делегуванні — сам контейнер зі слухачем; кнопку треба шукати через target.closest.',
        'Хибно: focus, blur, mouseenter не спливають; для делегування беруть focusin/focusout, mouseover або capture.',
        'Хибно: клік по `<span>` усередині кнопки дає target = span, тому потрібен closest, а не matches.',
        'Хибно: слухач на предку один раз — і він «бачить» усіх нащадків, включно з доданими пізніше. У цьому весь сенс.'
      ],
      hint: 'Спливання + один обробник на контейнері + визначення реального елемента через closest.',
      answer: `
**Делегування (event delegation)** — один обробник на спільному предку; через спливання визначаємо, на якому нащадку сталась подія.

\`\`\`js
table.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn || !table.contains(btn)) return;
  handlers[btn.dataset.action]?.(btn.closest('tr'), e);
});
\`\`\`

- \`closest\` — бо клік може влучити у вкладений \`<span>\`/\`<svg>\`; \`contains\` — бо \`closest\` може знайти елемент **вище** контейнера.

**Переваги:** 1 слухач замість тисяч; працює для доданих пізніше елементів; централізована логіка (\`data-action\`); так працює React.

**Обмеження:**
- подія має спливати (\`focusin\` замість \`focus\`, \`mouseover\` замість \`mouseenter\`) або слухайте на capture;
- \`stopPropagation()\` у нащадку ламає делегат;
- для частих подій (\`mousemove\`) на великому контейнері обробник викликається на кожен рух.
`,
      keyPoints: [
        'Один обробник на предку, використовує спливання',
        'e.target.closest(selector) + container.contains(...) для визначення елемента',
        'Працює для динамічно доданих елементів, економить пам\'ять',
        'Не працює напряму з неспливаючими подіями — focusin/focusout, mouseover або capture',
        'stopPropagation у нащадках ламає делегування'
      ],
      followUps: ['Як делегувати hover-ефект, якщо mouseenter не спливає?', 'Як React реалізує обробку подій?', 'Коли делегування погіршує продуктивність?']
    },
    {
      id: 'ev-delegation-actions',
      group: 'delegation',
      type: 'dom',
      level: 2,
      interview: true,
      title: 'Список файлів: кнопки дій через data-action',
      tags: ['delegation', 'closest', 'dataset'],
      description: `
**Завдання.** Оживіть кнопки «Відкрити / В обране / Видалити» у списку файлів **одним** обробником \`click\` на \`#files\` (делегування).

**Де трапляється:** будь-який список з діями в рядку — файли, задачі, товари в кошику, рядки таблиці в адмінці. Класика співбесід на делегування.

**Дано (HTML)**
- \`<ul id="files">\` з трьома \`<li data-name="report.pdf">\` (і \`photo.png\`, \`notes.txt\`);
- у кожному \`<li>\`: \`<span class="name">\` і три кнопки з \`data-action\`: \`open\`, \`star\`, \`delete\`; усередині кнопок — іконка \`<i>\`;
- \`<p id="status">\`;
- у JS готова функція \`addFile(name)\` — додає такий самий \`<li>\` у кінець і повертає його.

**Що написати** — один слухач \`click\` на \`#files\`:

| \`data-action\` | Дія |
|---|---|
| \`open\` | \`#status\` ← \`Відкрито: <data-name>\` |
| \`star\` | перемкнути клас \`starred\` на \`<li>\` |
| \`delete\` | видалити \`<li>\` |

**Приклад**
\`\`\`js
// клік по іконці <i> у кнопці open файлу photo.png
status.textContent;          // 'Відкрито: photo.png'
const li = addFile('new.js'); // клік по його delete → li зник
\`\`\`

**Як це працює:** клік по \`<i>\` спливає до \`#files\`. \`e.target\` — це \`<i>\`, тому піднімаємось \`e.target.closest('button[data-action]')\` до кнопки, а від неї \`closest('li')\` — до рядка.

**Врахуйте:**
- клік по назві файлу чи порожньому місці нічого не робить і не кидає помилок;
- файли з \`addFile\` працюють без нових обробників.
`,
      html: `<ul id="files">
  <li data-name="report.pdf"><span class="name">report.pdf</span>
    <button data-action="open"><i>&#9654;</i> Відкрити</button>
    <button data-action="star"><i>&#9733;</i></button>
    <button data-action="delete"><i>&times;</i></button>
  </li>
  <li data-name="photo.png"><span class="name">photo.png</span>
    <button data-action="open"><i>&#9654;</i> Відкрити</button>
    <button data-action="star"><i>&#9733;</i></button>
    <button data-action="delete"><i>&times;</i></button>
  </li>
  <li data-name="notes.txt"><span class="name">notes.txt</span>
    <button data-action="open"><i>&#9654;</i> Відкрити</button>
    <button data-action="star"><i>&#9733;</i></button>
    <button data-action="delete"><i>&times;</i></button>
  </li>
</ul>
<p id="status"></p>`,
      css: `.starred .name { color: #d4a000; font-weight: bold; }
li { margin: 4px 0; }`,
      js: `const list = document.querySelector('#files');
const statusEl = document.querySelector('#status');

function addFile(name) {
  const li = document.createElement('li');
  li.dataset.name = name;
  li.innerHTML = '<span class="name"></span> ' +
    '<button data-action="open"><i>&#9654;</i> Відкрити</button> ' +
    '<button data-action="star"><i>&#9733;</i></button> ' +
    '<button data-action="delete"><i>&times;</i></button>';
  li.querySelector('.name').textContent = name;
  list.append(li);
  return li;
}

// 1. Дії: кожна отримує <li> рядка.
const actions = {
  open(li) { /* TODO: statusEl.textContent = 'Відкрито: ' + ... */ },
  star(li) { /* TODO: перемкнути клас starred */ },
  delete(li) { /* TODO: видалити li */ }
};

// 2. Один слухач на весь список.
list.addEventListener('click', (e) => {
  // TODO: знайти кнопку з data-action (клік міг бути по <i>), вийти, якщо її немає
  // TODO: викликати actions[назва дії](li цієї кнопки)
});

// Спробуйте: addFile('test.txt') і клікніть по його кнопках
`,
      editable: ['js'],
      solution: {
        js: `const list = document.querySelector('#files');
const statusEl = document.querySelector('#status');

function addFile(name) {
  const li = document.createElement('li');
  li.dataset.name = name;
  li.innerHTML = '<span class="name"></span> ' +
    '<button data-action="open"><i>&#9654;</i> Відкрити</button> ' +
    '<button data-action="star"><i>&#9733;</i></button> ' +
    '<button data-action="delete"><i>&times;</i></button>';
  li.querySelector('.name').textContent = name;
  list.append(li);
  return li;
}

const actions = {
  open(li) { statusEl.textContent = 'Відкрито: ' + li.dataset.name; },
  star(li) { li.classList.toggle('starred'); },
  delete(li) { li.remove(); }
};

list.addEventListener('click', (e) => {
  // клік міг потрапити в <i> всередині кнопки — шукаємо найближчу кнопку
  const btn = e.target.closest('button[data-action]');
  if (!btn || !list.contains(btn)) return;
  const action = btn.dataset.action;
  if (Object.hasOwn(actions, action)) actions[action](btn.closest('li'));
});
`
      },
      hints: [
        '`e.target` може бути `<i>` всередині кнопки. Як знайти найближчого предка-кнопку?',
        '`e.target.closest(\'button[data-action]\')` поверне кнопку або `null`; `btn.dataset.action` — назва дії.',
        '`if (!btn) return; actions[btn.dataset.action](btn.closest(\'li\'))`. У діях: `li.dataset.name`, `li.classList.toggle(\'starred\')`, `li.remove()`.'
      ],
      tests: [
        { name: 'open через клік по іконці', code: "const li = $('li[data-name=\"photo.png\"]');\nclick(li.querySelector('[data-action=\"open\"] i'));\nexpect($('#status').textContent).toBe('Відкрито: photo.png');" },
        { name: 'star перемикає клас starred', code: "const li = $('li[data-name=\"report.pdf\"]');\nconst btn = li.querySelector('[data-action=\"star\"]');\nclick(btn);\nexpect(li.classList.contains('starred')).toBe(true);\nclick(btn.querySelector('i'));\nexpect(li.classList.contains('starred')).toBe(false);" },
        { name: 'delete видаляє лише свій li', code: "const li = $('li[data-name=\"notes.txt\"]');\nconst before = $$('#files li').length;\nclick(li.querySelector('[data-action=\"delete\"]'));\nexpect(document.contains(li)).toBe(false);\nexpect($$('#files li').length).toBe(before - 1);" },
        { name: 'працює для доданих пізніше файлів', code: "const li = addFile('new.js');\nclick(li.querySelector('[data-action=\"open\"]'));\nexpect($('#status').textContent).toBe('Відкрито: new.js');\nclick(li.querySelector('[data-action=\"delete\"] i'));\nexpect(document.contains(li)).toBe(false);" },
        { name: 'клік по назві нічого не змінює', code: "$('#status').textContent = 'x';\nconst count = $$('#files li').length;\nclick($('#files .name'));\nclick($('#files'));\nexpect($('#status').textContent).toBe('x');\nexpect($$('#files li').length).toBe(count);" }
      ],
      explanation: `
Один обробник на \`#files\` отримує всі кліки завдяки спливанню. \`closest\` піднімається від реальної цілі до кнопки, \`contains\` гарантує, що кнопка всередині списку. Об'єкт \`actions\` робить код розширюваним: нова дія = кнопка з \`data-action\` + метод. \`Object.hasOwn\` захищає від \`data-action="toString"\`.

**Складність:** O(глибина DOM) на клік; пам'ять O(1) незалежно від кількості файлів.

**Типові помилки:** \`e.target.dataset.action\` (ламається на \`<i>\`); обробник на кожну кнопку в циклі (нові файли не працюють); \`parentNode\` замість \`closest('li')\`.

**Що спитають далі:** як додати підтвердження перед видаленням? Чому \`<button>\`, а не \`<div>\` (клавіатура і доступність)?
`
    },
    {
      id: 'ev-sortable-buttons',
      group: 'delegation',
      type: 'dom',
      level: 3,
      interview: false,
      title: 'Перемістити задачу вгору/вниз кнопками ↑/↓',
      tags: ['delegation', 'dom-manipulation', 'focus'],
      description: `
**Завдання.** Реалізуйте зміну порядку задач кнопками ↑/↓ через **делегування** — один слухач \`click\` на \`#tasks\`.

**Де трапляється:** пріоритет задач, порядок пунктів меню чи слайдів в адмінці. Кнопки — доступна альтернатива drag-and-drop (вимога WCAG).

**Дано (HTML)**
- \`<ol id="tasks">\` з чотирма \`<li data-id="a|b|c|d">\`;
- у кожному \`<li>\` кнопки \`<button class="up">\` і \`<button class="down">\`.

**Що написати** — слухач \`click\` на \`#tasks\`:
- \`.up\` → поміняти \`<li>\` місцями з попереднім;
- \`.down\` → з наступним;
- після переміщення повернути фокус на натиснуту кнопку.

**Приклад**
\`\`\`js
// порядок a b c d; клік по .down у "a"
// → b a c d
// клік по .up у "c" → a c b d (переміщено той самий вузол li)
\`\`\`

**Як це працює:** вставка вузла, що вже є в DOM, **переміщує** його: \`prev.before(li)\` — обмін з попереднім, \`next.after(li)\` — з наступним. Переміщення = видалення + вставка, тому браузер скидає фокус на \`body\` — його треба повернути \`btn.focus()\`.

**Врахуйте:**
- на краях (перший ↑, останній ↓) нічого не відбувається і помилок немає;
- не створюйте копій і не перерендерюйте список через \`innerHTML\`;
- задачі, додані пізніше, теж працюють.
`,
      html: `<ol id="tasks">
  <li data-id="a">Задача A <button class="up">&uarr;</button><button class="down">&darr;</button></li>
  <li data-id="b">Задача B <button class="up">&uarr;</button><button class="down">&darr;</button></li>
  <li data-id="c">Задача C <button class="up">&uarr;</button><button class="down">&darr;</button></li>
  <li data-id="d">Задача D <button class="up">&uarr;</button><button class="down">&darr;</button></li>
</ol>`,
      css: `li { margin: 4px 0; }
button { margin-left: 4px; }`,
      js: `const tasks = document.querySelector('#tasks');

tasks.addEventListener('click', (e) => {
  // 1. TODO: знайти кнопку .up або .down (closest), інакше вийти
  // 2. TODO: знайти її <li>
  // 3. TODO: .up → поставити li перед previousElementSibling (якщо він є)
  //          .down → поставити li після nextElementSibling (якщо він є)
  // 4. TODO: повернути фокус на кнопку
});

// Спробуйте: клікніть ↓ у першій задачі
`,
      editable: ['js'],
      solution: {
        js: `const tasks = document.querySelector('#tasks');

tasks.addEventListener('click', (e) => {
  const btn = e.target.closest('.up, .down');
  if (!btn || !tasks.contains(btn)) return;
  const li = btn.closest('li');

  if (btn.classList.contains('up')) {
    const prev = li.previousElementSibling;
    if (!prev) return;
    prev.before(li); // переміщує існуючий вузол
  } else {
    const next = li.nextElementSibling;
    if (!next) return;
    next.after(li);
  }
  btn.focus(); // переміщення фокусованого елемента скидає фокус
});
`
      },
      hints: [
        'Сусідів знаходять через `previousElementSibling` / `nextElementSibling` (вони пропускають текстові вузли).',
        'Вставка вже існуючого вузла через `before`/`after` **переміщує** його — копія не створюється.',
        '`if (!prev) return; prev.before(li);` (аналогічно `next.after(li)`), а наприкінці `btn.focus()`.'
      ],
      tests: [
        { name: '↓ на першому міняє місцями A і B', code: "const ol = $('#tasks');\n['a','b','c','d'].forEach(id => ol.append(ol.querySelector('[data-id=\"' + id + '\"]')));\nclick($('[data-id=\"a\"] .down'));\nexpect($$('#tasks li').map(li => li.dataset.id)).toEqual(['b','a','c','d']);" },
        { name: '↑ переміщує той самий вузол', code: "const ol = $('#tasks');\n['a','b','c','d'].forEach(id => ol.append(ol.querySelector('[data-id=\"' + id + '\"]')));\nconst c = $('[data-id=\"c\"]');\nclick(c.querySelector('.up'));\nexpect($$('#tasks li').map(li => li.dataset.id)).toEqual(['a','c','b','d']);\nexpect($$('#tasks li')[1]).toBe(c);" },
        { name: 'на краях нічого не змінюється', code: "const ol = $('#tasks');\n['a','b','c','d'].forEach(id => ol.append(ol.querySelector('[data-id=\"' + id + '\"]')));\nclick($('[data-id=\"a\"] .up'));\nclick($('[data-id=\"d\"] .down'));\nexpect($$('#tasks li').map(li => li.dataset.id)).toEqual(['a','b','c','d']);" },
        { name: 'фокус залишається на натиснутій кнопці', code: "const ol = $('#tasks');\n['a','b','c','d'].forEach(id => ol.append(ol.querySelector('[data-id=\"' + id + '\"]')));\nconst btn = $('[data-id=\"b\"] .down');\nbtn.focus();\nclick(btn);\nexpect($$('#tasks li').map(li => li.dataset.id)).toEqual(['a','c','b','d']);\nexpect(document.activeElement).toBe(btn);" },
        { name: 'працює для доданих пізніше елементів', code: "const ol = $('#tasks');\n['a','b','c','d'].forEach(id => ol.append(ol.querySelector('[data-id=\"' + id + '\"]')));\nconst li = document.createElement('li');\nli.dataset.id = 'e';\nli.innerHTML = 'E <button class=\"up\">up</button><button class=\"down\">down</button>';\nol.append(li);\nclick(li.querySelector('.up'));\nexpect($$('#tasks li').map(x => x.dataset.id)).toEqual(['a','b','c','e','d']);\nli.remove();" }
      ],
      explanation: `
Вузол не може мати двох батьків, тому вставка існуючого вузла — це переміщення. Вузол той самий: зберігаються його обробники, стан полів, фокусні властивості — на відміну від перерендеру через \`innerHTML\`.

**Фокус:** видалення фокусованого елемента з документа скидає фокус на \`body\`; для користувачів клавіатури це критично, тому \`btn.focus()\`.

**Складність:** O(1) на переміщення.

**Що спитають далі:** як оголосити зміну скрінрідеру (\`aria-live\`)? Як синхронізувати порядок з масивом даних — що є джерелом правди?
`
    },

    // ================================================================ 4. Форми і дії за замовчуванням
    {
      id: 'ev-quiz-input-vs-change',
      group: 'forms',
      type: 'quiz',
      level: 1,
      interview: false,
      title: 'input vs change',
      tags: ['forms', 'input', 'change'],
      question: `
Користувач вводить у \`<input type="text">\` слово \`abc\` (три натискання клавіш), а потім клікає поза полем.

Скільки разів спрацюють події \`input\` і \`change\`?
`,
      options: [
        '`input` — 3 рази, `change` — 1 раз (після втрати фокусу)',
        '`input` — 3 рази, `change` — 3 рази',
        '`input` — 1 раз, `change` — 1 раз',
        '`input` — 0 разів, `change` — 3 рази'
      ],
      answer: 0,
      why: [
        'Правильно: input — на кожну зміну значення, change у текстовому полі — один раз, коли редагування завершено (blur).',
        'Хибно: change для тексту не реагує на кожен символ — лише на завершену зміну.',
        'Хибно: input спрацьовує на кожен введений символ, а не один раз.',
        'Хибно: навпаки — саме input реагує на кожну зміну, change — один раз.'
      ],
      hint: 'Одна подія — про кожну зміну значення, інша — про «завершену» зміну.',
      explanation: `
- \`input\` — на кожну зміну: символ, вставка, видалення, автозаповнення.
- \`change\` у текстовому полі — після blur (або Enter), якщо значення змінилось. Для \`checkbox\`, \`radio\`, \`select\` — одразу при виборі.

Нюанси: програмне \`input.value = 'x'\` не генерує жодної події; \`keydown\` не ловить вставку мишкою; \`onChange\` у React насправді слухає \`input\`.
`
    },
    {
      id: 'ev-char-counter',
      group: 'forms',
      type: 'dom',
      level: 1,
      interview: false,
      title: 'Лічильник символів у полі повідомлення',
      tags: ['input', 'forms'],
      description: `
**Завдання.** Під полем повідомлення показуйте лічильник \`<кількість>/<ліміт>\` і вимикайте кнопку «Надіслати», коли текст порожній або задовгий.

**Де трапляється:** поле відгуку, твіт, SMS, опис товару з обмеженням довжини.

**Дано (HTML)**
- \`<textarea id="msg" data-max="20">\` — ліміт у \`data-max\`;
- \`<span id="counter">0/20</span>\`;
- \`<button id="send" disabled>\`.

**Що написати**
- функцію \`update()\`, що: пише у \`#counter\` текст \`<кількість>/<ліміт>\`; додає \`#counter\` клас \`over\`, якщо символів більше за ліміт (інакше прибирає); ставить \`send.disabled = true\`, якщо текст порожній/з пробілів або перевищує ліміт;
- слухач \`input\` на \`#msg\`, що викликає \`update()\`.

**Приклад**
\`\`\`js
// ввели 'hello'      → counter '5/20', кнопка увімкнена
// ввели 21 символ    → counter '21/20' з класом over, кнопка вимкнена
// ввели '   '        → counter '3/20', кнопка вимкнена
// ввели '👍👍 ok'    → counter '5/20'
\`\`\`

**Як це працює:** \`input\` спрацьовує на кожну зміну значення (друк, вставка, видалення). JS-рядки — UTF-16, тому \`'👍'.length === 2\`; \`[...str]\` розбиває рядок за кодовими точками, і емодзі рахується як один символ.

**Врахуйте:** ліміт — \`Number(msg.dataset.max)\`; пробіли не роблять текст непорожнім (\`trim()\`).
`,
      html: `<textarea id="msg" data-max="20" rows="3"></textarea>
<div><span id="counter">0/20</span></div>
<button id="send" disabled>Надіслати</button>`,
      css: `.over { color: #c00; font-weight: bold; }`,
      js: `const msg = document.querySelector('#msg');
const counter = document.querySelector('#counter');
const send = document.querySelector('#send');
const max = Number(msg.dataset.max);

function update() {
  // 1. TODO: порахуйте символи так, щоб емодзі був одним символом
  // 2. TODO: counter.textContent = '<кількість>/<ліміт>'
  // 3. TODO: клас 'over' на counter, якщо кількість > max
  // 4. TODO: send.disabled — якщо текст порожній (після trim) або задовгий
}

// 5. TODO: викликайте update на кожну зміну тексту

// Спробуйте: введіть текст у поле і подивіться на лічильник
`,
      editable: ['js'],
      solution: {
        js: `const msg = document.querySelector('#msg');
const counter = document.querySelector('#counter');
const send = document.querySelector('#send');
const max = Number(msg.dataset.max);

function update() {
  const length = [...msg.value].length; // кодові точки, а не UTF-16 одиниці
  counter.textContent = length + '/' + max;
  const over = length > max;
  counter.classList.toggle('over', over);
  send.disabled = over || msg.value.trim() === '';
}

msg.addEventListener('input', update);
update();
`
      },
      hints: [
        'Подія `input` спрацьовує на кожну зміну значення (на відміну від `change`).',
        '`[...msg.value].length` рахує символи за кодовими точками — емодзі стане одним символом.',
        '`counter.classList.toggle(\'over\', length > max)` і `send.disabled = length > max || msg.value.trim() === \'\'`.'
      ],
      tests: [
        { name: 'оновлює лічильник і вмикає кнопку', code: "input('#msg', 'hello');\nexpect($('#counter').textContent).toBe('5/20');\nexpect($('#send').disabled).toBe(false);\nexpect($('#counter').classList.contains('over')).toBe(false);" },
        { name: 'перевищення ліміту', code: "input('#msg', 'a'.repeat(21));\nexpect($('#counter').textContent).toBe('21/20');\nexpect($('#counter').classList.contains('over')).toBe(true);\nexpect($('#send').disabled).toBe(true);\ninput('#msg', 'a'.repeat(20));\nexpect($('#counter').classList.contains('over')).toBe(false);\nexpect($('#send').disabled).toBe(false);" },
        { name: 'пробіли та порожній текст вимикають кнопку', code: "input('#msg', '   ');\nexpect($('#counter').textContent).toBe('3/20');\nexpect($('#send').disabled).toBe(true);\ninput('#msg', '');\nexpect($('#counter').textContent).toBe('0/20');\nexpect($('#send').disabled).toBe(true);" },
        { name: 'емодзі рахується як один символ', code: "input('#msg', '👍👍 ok');\nexpect($('#counter').textContent).toBe('5/20');" }
      ],
      explanation: `
\`input\` — правильна подія для «живої» реакції на текст: \`keyup\` пропустить вставку мишкою, \`change\` спрацює лише після blur.

**Unicode:** \`[...str]\` ітерує за кодовими точками. Для складених емодзі (👨‍👩‍👧) точний підрахунок дає \`Intl.Segmenter\` з \`granularity: 'grapheme'\`. Атрибут \`maxlength\` рахує UTF-16 одиниці.

**Складність:** O(n) на подію.

**Типові помилки:** \`keydown\` (значення ще старе); перевірка \`value === ''\` без \`trim()\`.

**Що спитають далі:** як озвучити залишок символів скрінрідеру (\`aria-live="polite"\`)?
`
    },
    {
      id: 'ev-quiz-prevent-vs-stop',
      group: 'forms',
      type: 'quiz',
      level: 2,
      interview: true,
      title: 'stopPropagation не скасовує перехід за посиланням',
      tags: ['preventDefault', 'stopPropagation'],
      question: `
\`\`\`html
<div id="card">
  <a id="link" href="/details">Детальніше</a>
</div>
\`\`\`

\`\`\`js
card.addEventListener('click', () => console.log('card'));
link.addEventListener('click', (e) => e.stopPropagation());
\`\`\`

Що станеться при кліку по посиланню?
`,
      options: [
        'Переходу не буде, `card` не виведеться',
        'Переходу не буде, але `card` виведеться',
        'Перехід відбудеться, `card` не виведеться',
        'Перехід відбудеться і виведеться `card`'
      ],
      answer: 2,
      why: [
        'Хибно: stopPropagation() не скасовує дію браузера — для цього потрібен preventDefault().',
        'Хибно: тут навпаки — preventDefault() не викликано (перехід буде), а спливання зупинено (card не виведеться).',
        'Правильно: спливання до #card зупинено, а перехід скасовує лише preventDefault(), якого тут немає.',
        'Хибно: stopPropagation() не дає події дійти до слухача на #card.'
      ],
      hint: 'Одна функція керує поширенням події між елементами, інша — дією браузера за замовчуванням. Вони незалежні.',
      explanation: `
Поширення і дія за замовчуванням — незалежні механізми. Дія браузера виконується **після** завершення диспатчу, і браузер перевіряє лише прапорець \`defaultPrevented\`.

Навпаки теж працює: \`preventDefault()\` без \`stopPropagation()\` скасує перехід, але \`card\` виведеться.

\`return false\` скасовує дію лише в \`on*\`-обробниках (і в jQuery), але не в \`addEventListener\`.
`
    },
    {
      id: 'ev-form-validation',
      group: 'forms',
      type: 'dom',
      level: 2,
      title: 'Валідація форми реєстрації на submit',
      tags: ['forms', 'submit', 'preventDefault'],
      description: `
**Завдання.** Додайте валідацію форми реєстрації: при помилках — скасувати відправку і показати повідомлення, при валідних даних — пропустити.

**Де трапляється:** будь-яка форма — реєстрація, логін, оформлення замовлення. Часте live-coding завдання.

**Дано (HTML)**
- \`<form id="signup" novalidate>\` (\`novalidate\` вимикає вбудовану валідацію браузера);
- поля \`<input name="email" id="email">\` і \`<input name="password" id="password">\`;
- під кожним — \`<span class="error" data-error-for="email|password">\`;
- кнопка \`type="submit"\`.

**Що написати**
- \`validate(name, value)\` → рядок помилки або \`''\`:
  - \`email\`: шаблон \`щось@щось.щось\` без пробілів, інакше \`'Невірний email'\`;
  - \`password\`: мінімум 8 символів, інакше \`'Мінімум 8 символів'\`;
- \`setError(name, message)\` → пише текст у \`[data-error-for="<name>"]\` і ставить/знімає полю клас \`invalid\`;
- слухач \`submit\` на формі: перевірити обидва поля; якщо є помилки — \`e.preventDefault()\` і фокус на **перше** невалідне поле; якщо немає — не скасовувати;
- слухач \`input\` на формі: при введенні в поле прибрати **його** помилку.

**Приклад**
\`\`\`js
// email='', password='' → submit скасовано, обидві помилки, фокус на #email
// email='user@mail.com', password='123' → скасовано, фокус на #password
// email='user@mail.com', password='12345678' → відправка не скасована, помилок немає
\`\`\`

**Як це працює:** \`submit\` генерується на **формі** — і при кліку на кнопку, і при Enter у полі. \`preventDefault()\` скасовує відправку (навігацію). Подія \`input\` спливає, тож один слухач на формі обслуговує всі поля.

**Врахуйте:** валідна форма не має скасовуватись; email перевіряйте після \`trim()\`; текст помилки — через \`textContent\`.
`,
      html: `<form id="signup" novalidate>
  <label>Email <input name="email" id="email"></label>
  <span class="error" data-error-for="email"></span>
  <label>Пароль <input name="password" id="password" type="password"></label>
  <span class="error" data-error-for="password"></span>
  <button type="submit">Зареєструватися</button>
</form>`,
      css: `label { display: block; margin-top: 8px; }
.error { color: #c00; font-size: 12px; }
.invalid { border-color: #c00; }`,
      js: `const form = document.querySelector('#signup');
const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

function validate(name, value) {
  // 1. TODO: для 'email' — EMAIL_RE.test(value.trim()) ? '' : 'Невірний email'
  //          для 'password' — мінімум 8 символів, інакше 'Мінімум 8 символів'
  return '';
}

function setError(name, message) {
  // 2. TODO: текст у [data-error-for="name"], клас invalid на form.elements[name]
}

form.addEventListener('submit', (e) => {
  // 3. TODO: для 'email' і 'password': message = validate(...), setError(...)
  // 4. TODO: якщо є помилки — e.preventDefault() і фокус на перше невалідне поле
});

// 5. TODO: слухач 'input' на формі — прибрати помилку поля e.target.name

// Спробуйте: натисніть «Зареєструватися» з порожніми полями
`,
      editable: ['js'],
      solution: {
        js: `const form = document.querySelector('#signup');
const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
const FIELDS = ['email', 'password'];

function validate(name, value) {
  if (name === 'email') return EMAIL_RE.test(value.trim()) ? '' : 'Невірний email';
  if (name === 'password') return value.length >= 8 ? '' : 'Мінімум 8 символів';
  return '';
}

function setError(name, message) {
  form.querySelector('[data-error-for="' + name + '"]').textContent = message;
  form.elements[name].classList.toggle('invalid', Boolean(message));
}

form.addEventListener('submit', (e) => {
  let firstInvalid = null;
  for (const name of FIELDS) {
    const field = form.elements[name];
    const message = validate(name, field.value);
    setError(name, message);
    if (message && !firstInvalid) firstInvalid = field;
  }
  if (firstInvalid) {
    e.preventDefault(); // скасовуємо відправку лише при помилках
    firstInvalid.focus();
  }
});

// один делегований слухач на всі поля форми
form.addEventListener('input', (e) => {
  if (FIELDS.includes(e.target.name)) setError(e.target.name, '');
});
`
      },
      hints: [
        'Подія `submit` виникає на **формі** (не на кнопці). Викличте `e.preventDefault()` лише якщо знайдено помилки.',
        'Поля зручно брати через `form.elements[name]`; пройдіться циклом по `[\'email\', \'password\']` і запам\'ятайте перше невалідне поле.',
        'Для очищення: `form.addEventListener(\'input\', (e) => setError(e.target.name, \'\'))` — подія `input` спливає.'
      ],
      tests: [
        { name: 'порожня форма: відправку скасовано, обидві помилки', code: "$('#email').value = '';\n$('#password').value = '';\nconst r = submit('#signup');\nexpect(r.fired).toBe(true);\nexpect(r.prevented).toBe(true);\nexpect($('[data-error-for=\"email\"]').textContent).toBe('Невірний email');\nexpect($('[data-error-for=\"password\"]').textContent).toBe('Мінімум 8 символів');\nexpect($('#email').classList.contains('invalid')).toBe(true);" },
        { name: 'невалідний email і короткий пароль', code: "$('#email').value = 'test@ mail.com';\n$('#password').value = '1234567';\nexpect(submit('#signup').prevented).toBe(true);\nexpect($('#password').classList.contains('invalid')).toBe(true);" },
        { name: 'фокус на першому невалідному полі', code: "$('#email').value = 'user@mail.com';\n$('#password').value = '123';\nexpect(submit('#signup').prevented).toBe(true);\nexpect(document.activeElement).toBe($('#password'));\nexpect($('[data-error-for=\"email\"]').textContent).toBe('');\nexpect($('#email').classList.contains('invalid')).toBe(false);" },
        { name: 'валідна форма відправляється без помилок', code: "$('#email').value = 'user@mail.com';\n$('#password').value = '12345678';\nconst r = submit('#signup');\nexpect(r.fired).toBe(true);\nexpect(r.prevented).toBe(false);\nexpect($('[data-error-for=\"password\"]').textContent).toBe('');\nexpect($('#password').classList.contains('invalid')).toBe(false);" },
        { name: 'введення в поле прибирає його помилку', code: "$('#email').value = '';\n$('#password').value = '';\nsubmit('#signup');\ninput('#email', 'a');\nexpect($('[data-error-for=\"email\"]').textContent).toBe('');\nexpect($('#email').classList.contains('invalid')).toBe(false);\nexpect($('[data-error-for=\"password\"]').textContent).toBe('Мінімум 8 символів');" }
      ],
      explanation: `
\`submit\` генерується на формі при кліку по \`type="submit"\`, Enter у полі чи \`form.requestSubmit()\`. \`preventDefault()\` — лише при помилках.

Без \`novalidate\` браузер сам перевіряє \`required\`/\`type="email"\` і при помилці **не генерує** \`submit\`. \`form.submit()\` (на відміну від \`requestSubmit()\`) подію \`submit\` не генерує взагалі.

**Типові помилки:** \`click\` на кнопці замість \`submit\` (Enter обходить валідацію); \`return false\` в \`addEventListener\`; \`preventDefault()\` завжди; \`innerHTML\` для тексту помилки.

**Що спитають далі:** \`aria-invalid\`/\`aria-describedby\` для доступності? Відправка через \`fetch\` + \`FormData\`? Захист від подвійного submit?
`
    },
    {
      id: 'ev-passive-theory',
      group: 'forms',
      type: 'theory',
      level: 3,
      title: 'preventDefault, cancelable і passive-обробники',
      tags: ['preventDefault', 'passive', 'performance'],
      question: 'Що таке дія за замовчуванням і як її скасувати? Навіщо потрібні passive-обробники і як вони впливають на продуктивність скролу? Оберіть **усі** правильні твердження.',
      choices: [
        'Скрол можна скасувати в обробнику `scroll` через `preventDefault()`, якщо слухач не passive',
        '`preventDefault()` діє лише на події з `cancelable === true`; результат видно в `e.defaultPrevented`',
        'Passive-обробник виконується в потоці композитора, тому зовсім не навантажує головний потік',
        '`{ passive: true }` обіцяє не викликати `preventDefault()`, тож скрол стартує, не чекаючи JS',
        '`wheel`/`touchmove` на `window` і `document` за замовчуванням passive; для блокування — `passive: false`'
      ],
      correct: [1, 3, 4],
      why: [
        'Хибно: scroll не cancelable — він приходить, коли прокрутка вже сталася; блокують через wheel/touchmove або CSS.',
        'Правильно: для не-cancelable подій виклик нічого не робить; defaultPrevented показує, чи дію скасовано.',
        'Хибно: обробник усе одно виконується в головному потоці; passive лише дозволяє композитору не чекати на нього.',
        'Правильно: браузер знає, що скасування не буде, і починає скрол одразу.',
        'Правильно: Chrome і Firefox роблять такі слухачі passive за замовчуванням; щоб скасувати скрол, потрібно явно `passive: false`.'
      ],
      hint: 'Браузер не знає, чи викличе обробник preventDefault, доки його не виконає. Що робить потік композитора, поки чекає?',
      answer: `
**Дія за замовчуванням** — що браузер робить сам: перехід за посиланням, submit, галочка, скрол, контекстне меню. Скасовується \`e.preventDefault()\`, лише якщо \`e.cancelable === true\`. Перевірка — \`e.defaultPrevented\`.

**Проблема скролу:** скрол виконує потік композитора. Якщо на \`touchmove\`/\`wheel\` є звичайний обробник, браузер мусить **дочекатися** його в головному потоці (раптом буде \`preventDefault()\`). Довга задача → скрол «застигає».

**Рішення:** \`{ passive: true }\` — обіцянка не скасовувати; скрол стартує одразу.

\`\`\`js
document.addEventListener('touchmove', track, { passive: true });
el.addEventListener('wheel', zoom, { passive: false }); // явно: будемо скасовувати
\`\`\`

**Нюанси:**
- у passive-обробнику \`preventDefault()\` ігнорується (попередження в консолі);
- \`touchstart\`/\`touchmove\`/\`wheel\` на \`window\`/\`document\`/\`body\` — passive за замовчуванням;
- \`scroll\` не cancelable;
- декларативна альтернатива — CSS \`touch-action\`, \`overscroll-behavior\`.
`,
      keyPoints: [
        'preventDefault скасовує дію браузера лише для cancelable-подій; defaultPrevented для перевірки',
        'Звичайні touch/wheel-обробники змушують композитор чекати головний потік',
        'passive: true — обіцянка не скасовувати, скрол без затримок; preventDefault ігнорується',
        'touchstart/touchmove/wheel на window/document/body — passive за замовчуванням',
        'CSS touch-action/overscroll-behavior як декларативна альтернатива'
      ],
      followUps: ['Чому не можна скасувати подію scroll?', 'Як заблокувати скрол сторінки під модалкою?', 'Як passive-обробники пов\'язані з метрикою INP?']
    },
    {
      id: 'ev-quiz-passive',
      group: 'forms',
      type: 'quiz',
      level: 3,
      interview: false,
      title: 'preventDefault у passive-обробнику',
      tags: ['passive', 'preventDefault'],
      question: `
\`\`\`js
document.addEventListener('wheel', (e) => {
  e.preventDefault();
  console.log(e.defaultPrevented);
}, { passive: true });
\`\`\`

Що станеться, коли користувач прокрутить колесо миші?
`,
      options: [
        'Виведеться `false`, сторінка прокрутиться, у консолі — попередження',
        'Виведеться `true`, прокрутку заблоковано',
        'Виведеться `true`, але сторінка все одно прокрутиться',
        'Буде кинуто `TypeError`, обробник перерветься'
      ],
      answer: 0,
      why: [
        'Правильно: у passive-обробнику preventDefault() ігнорується, прапорець не встановлюється, скрол відбувається.',
        'Хибно: так було б із `{ passive: false }`.',
        'Хибно: прапорець defaultPrevented просто не встановлюється — ця комбінація неможлива.',
        'Хибно: помилки немає — виклик тихо ігнорується з попередженням у консолі.'
      ],
      hint: 'Passive — це обіцянка браузеру. Що він робить з викликом, який порушує обіцянку?',
      explanation: `
У passive-обробнику \`preventDefault()\` **ігнорується**: \`defaultPrevented\` лишається \`false\`, прокрутка виконується, Chrome пише «Unable to preventDefault inside passive event listener invocation».

Навіть **без** \`{ passive: true }\` слухач \`wheel\` на \`document\` у Chrome буде passive за замовчуванням — щоб скасувати прокрутку, потрібно явно \`{ passive: false }\`.
`
    },

    // ================================================================ 5. Клавіатура і ввід у реальному часі
    {
      id: 'ev-quiz-key-vs-code',
      group: 'keyboard',
      type: 'quiz',
      level: 2,
      title: 'e.key vs e.code і українська розкладка',
      tags: ['keyboard'],
      question: `
Шорткат «пошук» реалізовано так:

\`\`\`js
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'k') openSearch();
});
\`\`\`

Користувач з **українською** розкладкою натискає \`Ctrl\` + фізичну клавішу \`K\`. Що станеться і як це виправити?
`,
      options: [
        'Спрацює: `e.key` завжди повертає латинську літеру фізичної клавіші',
        'Не спрацює: `e.key` буде `\'л\'`; для незалежності від розкладки перевіряйте `e.code === \'KeyK\'`',
        'Не спрацює: при натиснутому Ctrl `e.key` дорівнює `\'Control\'`',
        'Не спрацює: треба перевіряти застарілий `e.keyCode === 75`, інших способів немає'
      ],
      answer: 1,
      why: [
        'Хибно: латиницю фізичної клавіші дає e.code (`KeyK`); e.key залежить від розкладки.',
        'Правильно: e.key — символ у поточній розкладці (`л`), e.code — фізична клавіша, однакова в усіх розкладках.',
        'Хибно: `Control` — це e.key для самої клавіші Ctrl; для K при затиснутому Ctrl e.key — символ клавіші K.',
        'Хибно: keyCode застарілий; сучасний спосіб — e.code.'
      ],
      hint: 'Одна властивість описує символ, який ця клавіша дає в поточній розкладці, інша — фізичне розташування клавіші.',
      explanation: `
- \`e.key\` — значення з урахуванням розкладки і Shift: \`'л'\`, \`'Л'\`, \`'K'\` (CapsLock). Тому \`=== 'k'\` ламається.
- \`e.code\` — фізична клавіша (\`'KeyK'\`, \`'Digit1'\`, \`'Space'\`) — для шорткатів Ctrl+K і WASD.

\`e.key\` потрібен для вводу тексту та шорткатів, прив'язаних до символу (\`?\`, \`/\`, \`+\`), які в різних розкладках фізично в різних місцях.
`
    },
    {
      id: 'ev-shortcuts',
      group: 'keyboard',
      type: 'dom',
      level: 3,
      title: 'Менеджер клавіатурних шорткатів',
      tags: ['keyboard', 'shortcuts', 'preventDefault'],
      description: `
**Завдання.** Напишіть \`registerShortcut(combo, handler)\` — реєстрацію гарячих клавіш застосунку з можливістю скасування.

**Де трапляється:** Ctrl+K — палітра команд (GitHub, Slack, Notion), \`/\` — фокус на пошук, Escape — закрити панель, \`?\` — довідка.

**Дано (HTML):** поля \`<input id="search">\` і \`<textarea id="note">\` (щоб перевірити, що шорткати не заважають друкувати).

**Що написати**
- \`registerShortcut(combo, handler)\` → функція \`unregister()\`, яка прибирає **саме цю** реєстрацію;
- \`combo\` — частини через \`+\` у нижньому регістрі: модифікатори \`ctrl\`, \`alt\`, \`shift\`, \`meta\` і **останньою** — клавіша, яку порівнюємо з \`e.key.toLowerCase()\`: \`'ctrl+k'\`, \`'escape'\`, \`'/'\`, \`'shift+?'\`;
- при збігу: \`e.preventDefault()\` і \`handler(e)\`;
- **один** слухач \`keydown\` на \`document\` для всіх шорткатів.

**Приклад**
\`\`\`js
const off = registerShortcut('ctrl+k', (e) => openPalette());
// Ctrl+K           → openPalette(), дію браузера скасовано
// Ctrl+Shift+K, K  → нічого
off();              // Ctrl+K більше не працює
\`\`\`

**Як це працює:** \`combo\` розбирається один раз при реєстрації в запис \`{ mods, key, handler }\`. Слухач \`keydown\` на кожне натискання перебирає записи і порівнює клавішу та **кожен** модифікатор з \`e.ctrlKey\`, \`e.altKey\`, \`e.shiftKey\`, \`e.metaKey\`.

**Врахуйте:**
- модифікатори збігаються **точно**: \`ctrl+k\` не спрацьовує на Ctrl+Shift+K;
- автоповтор (\`e.repeat\`) ігнорується;
- якщо фокус у \`input\`/\`textarea\`/\`select\`/\`contenteditable\`, шорткати **без** \`ctrl\`/\`alt\`/\`meta\` ігноруються (людина друкує \`/\`);
- на одну комбінацію можна кілька обробників, і та сама функція може бути зареєстрована двічі.
`,
      html: `<input id="search" placeholder="Пошук">
<textarea id="note"></textarea>`,
      css: ``,
      js: `// Реєстр записів { mods, key, handler }
const shortcuts = new Set();

function parseCombo(combo) {
  // 1. TODO: 'ctrl+shift+k' → { mods: { ctrl: true, alt: false, shift: true, meta: false }, key: 'k' }
  //    (split('+'), остання частина — клавіша)
}

function isEditable(el) {
  // 2. TODO: true для input, textarea, select і contenteditable (el.isContentEditable)
}

document.addEventListener('keydown', (e) => {
  // 3. TODO: ігнорувати e.repeat
  // 4. TODO: для кожного запису (ітеруйте копію [...shortcuts]):
  //    key === e.key.toLowerCase() і ТОЧНИЙ збіг усіх чотирьох модифікаторів
  // 5. TODO: у полі вводу пропускати записи без ctrl/alt/meta
  // 6. TODO: e.preventDefault(); entry.handler(e)
});

function registerShortcut(combo, handler) {
  // 7. TODO: створити запис, додати в реєстр, повернути функцію, що видаляє САМЕ цей запис
  return function unregister() {};
}

// Спробуйте: registerShortcut('ctrl+k', () => console.log('palette')) і натисніть Ctrl+K
`,
      editable: ['js'],
      solution: {
        js: `const shortcuts = new Set(); // { mods, key, handler }

function parseCombo(combo) {
  const parts = combo.toLowerCase().split('+');
  const key = parts.pop();
  const mods = { ctrl: false, alt: false, shift: false, meta: false };
  parts.forEach((m) => { mods[m] = true; });
  return { mods, key };
}

function isEditable(el) {
  return el instanceof Element &&
    (el.matches('input, textarea, select') || el.isContentEditable);
}

document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const typing = isEditable(e.target);
  const key = e.key.toLowerCase();
  // копія — обробник може скасувати реєстрацію під час ітерації
  for (const s of [...shortcuts]) {
    const { mods } = s;
    if (s.key !== key) continue;
    if (mods.ctrl !== e.ctrlKey || mods.alt !== e.altKey ||
        mods.shift !== e.shiftKey || mods.meta !== e.metaKey) continue;
    if (typing && !mods.ctrl && !mods.alt && !mods.meta) continue;
    e.preventDefault();
    s.handler(e);
  }
});

function registerShortcut(combo, handler) {
  const entry = { ...parseCombo(combo), handler };
  shortcuts.add(entry);
  return function unregister() {
    shortcuts.delete(entry);
  };
}
`
      },
      hints: [
        'Розберіть combo один раз: `split(\'+\')`, `pop()` — клавіша, решта — модифікатори. Зберігайте записи-об\'єкти в `Set`.',
        'У `keydown` порівнюйте кожен модифікатор: `mods.ctrl === e.ctrlKey` тощо (точний збіг!), і `key === e.key.toLowerCase()`.',
        'Поле вводу: `e.target.matches(\'input, textarea, select\') || e.target.isContentEditable`. `unregister` робить `shortcuts.delete(entry)` — саме цього об\'єкта.'
      ],
      tests: [
        { name: 'ctrl+k викликає обробник і скасовує дію', code: "const h = mockFn();\nconst off = registerShortcut('ctrl+k', h);\nconst ev = press(document.body, 'k', { ctrlKey: true });\nexpect(h).toHaveBeenCalledTimes(1);\nexpect(h.mock.calls[0][0].key).toBe('k');\nexpect(ev.defaultPrevented).toBe(true);\noff();" },
        { name: 'модифікатори мають збігатися точно', code: "const h = mockFn();\nconst off = registerShortcut('ctrl+k', h);\nconst ev = press(document.body, 'k');\npress(document.body, 'K', { ctrlKey: true, shiftKey: true });\npress(document.body, 'k', { metaKey: true });\nexpect(h).not.toHaveBeenCalled();\nexpect(ev.defaultPrevented).toBe(false);\noff();" },
        { name: 'escape і shift+? (регістр не важливий)', code: "const esc = mockFn(), help = mockFn();\nconst off1 = registerShortcut('escape', esc);\nconst off2 = registerShortcut('shift+?', help);\npress(document.body, 'Escape');\npress(document.body, '?', { shiftKey: true });\npress(document.body, '?');\nexpect(esc).toHaveBeenCalledTimes(1);\nexpect(help).toHaveBeenCalledTimes(1);\noff1(); off2();" },
        { name: 'автоповтор ігнорується', code: "const h = mockFn();\nconst off = registerShortcut('ctrl+k', h);\npress(document.body, 'k', { ctrlKey: true, repeat: true });\nexpect(h).not.toHaveBeenCalled();\noff();" },
        { name: 'у полях вводу працюють лише шорткати з ctrl/alt/meta', code: "const slash = mockFn(), ctrlK = mockFn();\nconst off1 = registerShortcut('/', slash);\nconst off2 = registerShortcut('ctrl+k', ctrlK);\nconst ev = press('#search', '/');\npress('#note', '/');\nexpect(slash).not.toHaveBeenCalled();\nexpect(ev.defaultPrevented).toBe(false);\npress('#search', 'k', { ctrlKey: true });\nexpect(ctrlK).toHaveBeenCalledTimes(1);\npress(document.body, '/');\nexpect(slash).toHaveBeenCalledTimes(1);\noff1(); off2();" },
        { name: 'unregister прибирає лише свій обробник', code: "const a = mockFn(), b = mockFn();\nconst offA = registerShortcut('alt+n', a);\nconst offB = registerShortcut('alt+n', b);\npress(document.body, 'n', { altKey: true });\noffA();\npress(document.body, 'n', { altKey: true });\nexpect(a).toHaveBeenCalledTimes(1);\nexpect(b).toHaveBeenCalledTimes(2);\noffB();\npress(document.body, 'n', { altKey: true });\nexpect(b).toHaveBeenCalledTimes(2);" }
      ],
      explanation: `
**Архітектура:** один глобальний \`keydown\` + реєстр записів. \`Set\` з **об'єктами-записами** (а не функціями) дозволяє зареєструвати ту саму функцію двічі і скасувати рівно одну реєстрацію. Ітерація по копії — бо обробник може викликати \`unregister\` під час обходу.

**Складність:** O(k) на натискання; O(1), якщо індексувати Map за нормалізованим рядком комбінації.

**Для продакшену:** в українській розкладці \`e.key\` для Ctrl+K — \`'л'\`, тому для літер часто порівнюють і \`e.code\`; на macOS основний модифікатор — Cmd (\`meta\`), роблять псевдо-модифікатор \`mod\`; деякі комбінації (Ctrl+W) браузер сторінці не віддає.

**Що спитають далі:** послідовності (\`g\` потім \`i\`, як у GitHub)? Скоупи (модалка перехоплює Escape раніше за сторінку)?
`
    },
    {
      id: 'ev-debounced-search',
      group: 'keyboard',
      type: 'dom',
      level: 3,
      title: 'Живий пошук з debounce і захистом від гонки відповідей',
      tags: ['input', 'debounce', 'race-condition', 'timers'],
      description: `
**Завдання.** Зробіть «живий» пошук: запит іде через 300 мс після того, як людина перестала друкувати, а застарілі відповіді не перезаписують свіжі.

**Де трапляється:** автодоповнення в пошуку, вибір міста/товару. Одне з найчастіших завдань на співбесіді frontend.

**Дано**
- HTML: \`<input id="q">\` і \`<ul id="results">\`;
- JS: \`searchApi(query)\` → \`Promise<string[]>\` (у тестах підміняється), змінні \`queryInput\`, \`results\`.

**Що написати**
- \`render(items)\` → замінює вміст \`#results\` на \`<li>\` для кожного рядка (текст — **безпечно**, рядки можуть містити HTML);
- \`runSearch(query)\` (async) → викликає API і рендерить результат з урахуванням правил нижче;
- слухач \`input\` на \`#q\` з debounce 300 мс, що викликає \`runSearch(queryInput.value.trim())\`.

**Приклад**
\`\`\`js
// ввели 'r', 're', 'rea' з паузами по 100 мс
// → через 300 мс після 'rea': searchApi('rea') — один виклик
// ввели 'vue', потім 'vue ' → API викликано один раз
\`\`\`

**Як це працює:** debounce — кожне введення скасовує попередній таймер (\`clearTimeout\`) і ставить новий. Від гонки захищає лічильник: перед запитом \`const id = ++requestId\`, після \`await\` рендеримо лише якщо \`id === requestId\` — тобто це досі найсвіжіший запит.

**Врахуйте:**
- порожній запит (після \`trim\`): очистити \`#results\`, API **не** викликати, а відповіді, що ще в дорозі, мають стати застарілими;
- не викликати API, якщо запит збігається з **останнім надісланим**; після очищення поля той самий запит виконується знову;
- не називайте глобальні змінні \`input\`, \`click\` — так звуть хелпери тестів.
`,
      html: `<input id="q" placeholder="Пошук...">
<ul id="results"></ul>`,
      css: ``,
      js: `// «API» — у тестах підміняється
function searchApi(query) {
  const all = ['React', 'Redux', 'Vue', 'Svelte', 'Angular'];
  return Promise.resolve(all.filter((x) => x.toLowerCase().includes(query.toLowerCase())));
}

const queryInput = document.querySelector('#q');
const results = document.querySelector('#results');

let timer = null;
let lastQuery = '';
let requestId = 0;

function render(items) {
  // 1. TODO: для кожного рядка — <li> з textContent; results.replaceChildren(...)
}

async function runSearch(query) {
  // 2. TODO: порожній query → lastQuery = '', requestId++ (застаріють запити в дорозі), render([])
  // 3. TODO: query === lastQuery → return
  // 4. TODO: lastQuery = query; const id = ++requestId;
  //          const items = await searchApi(query); рендер лише якщо id === requestId
}

queryInput.addEventListener('input', () => {
  // 5. TODO: debounce 300 мс → runSearch(queryInput.value.trim())
});

// Спробуйте: друкуйте «re» у полі — список з'явиться через 300 мс після паузи
`,
      editable: ['js'],
      solution: {
        js: `// «API» — у тестах підміняється
function searchApi(query) {
  const all = ['React', 'Redux', 'Vue', 'Svelte', 'Angular'];
  return Promise.resolve(all.filter((x) => x.toLowerCase().includes(query.toLowerCase())));
}

const queryInput = document.querySelector('#q');
const results = document.querySelector('#results');

let timer = null;
let lastQuery = '';
let requestId = 0;

function render(items) {
  // textContent — без XSS
  results.replaceChildren(...items.map((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
  }));
}

async function runSearch(query) {
  if (!query) {
    lastQuery = '';
    requestId++; // «застарілими» стають і запити, що ще в дорозі
    render([]);
    return;
  }
  if (query === lastQuery) return;
  lastQuery = query;
  const id = ++requestId;
  try {
    const items = await searchApi(query);
    if (id === requestId) render(items); // відповідь на найсвіжіший запит
  } catch (err) {
    if (id === requestId) render([]);
  }
}

queryInput.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(() => runSearch(queryInput.value.trim()), 300);
});
`
      },
      hints: [
        'Debounce всередині обробника: `clearTimeout(timer); timer = setTimeout(() => runSearch(...), 300)`.',
        'Перед запитом `const id = ++requestId`, після `await` — рендеріть лише якщо `id === requestId`. Для повторів порівнюйте з `lastQuery`.',
        'Безпечний рендер: `document.createElement(\'li\')` + `textContent`, далі `results.replaceChildren(...items)`.'
      ],
      tests: [
        { name: 'запит лише через 300 мс після останнього введення', code: "useFakeTimers();\nwindow.searchApi = mockFn(() => Promise.resolve([]));\ninput('#q', 'r');\nadvanceTimersByTime(100);\ninput('#q', 're');\nadvanceTimersByTime(100);\ninput('#q', 'rea');\nadvanceTimersByTime(299);\nexpect(searchApi).not.toHaveBeenCalled();\nadvanceTimersByTime(1);\nexpect(searchApi).toHaveBeenCalledTimes(1);\nexpect(searchApi).toHaveBeenCalledWith('rea');" },
        { name: 'рендерить результати як текст (без XSS)', code: "useFakeTimers();\nwindow.searchApi = mockFn(() => Promise.resolve(['<b>bold</b>', 'react']));\ninput('#q', 'x1');\nadvanceTimersByTime(300);\nawait flushPromises();\nexpect($$('#results li').map(li => li.textContent)).toEqual(['<b>bold</b>', 'react']);\nexpect($('#results b')).toBeNull();" },
        { name: 'порожній запит очищає результати без виклику API', code: "useFakeTimers();\nwindow.searchApi = mockFn(() => Promise.resolve(['z']));\ninput('#q', '   ');\nadvanceTimersByTime(300);\nawait flushPromises();\nexpect(searchApi).not.toHaveBeenCalled();\nexpect($$('#results li')).toHaveLength(0);" },
        { name: 'той самий запит (з пробілами) не повторюється', code: "useFakeTimers();\nwindow.searchApi = mockFn((q) => Promise.resolve([q]));\ninput('#q', 'vue');\nadvanceTimersByTime(300);\nawait flushPromises();\ninput('#q', 'vue ');\nadvanceTimersByTime(300);\nawait flushPromises();\nexpect(searchApi).toHaveBeenCalledTimes(1);\nexpect($$('#results li').map(li => li.textContent)).toEqual(['vue']);" },
        { name: 'після очищення той самий запит виконується знову', code: "useFakeTimers();\nwindow.searchApi = mockFn((q) => Promise.resolve([q]));\ninput('#q', 'svelte');\nadvanceTimersByTime(300);\nawait flushPromises();\ninput('#q', '');\nadvanceTimersByTime(300);\ninput('#q', 'svelte');\nadvanceTimersByTime(300);\nawait flushPromises();\nexpect(searchApi).toHaveBeenCalledTimes(2);" },
        { name: 'застаріла відповідь ігнорується', code: "useFakeTimers();\nconst resolvers = {};\nwindow.searchApi = mockFn((q) => new Promise((r) => { resolvers[q] = r; }));\ninput('#q', 'an');\nadvanceTimersByTime(300);\ninput('#q', 'ang');\nadvanceTimersByTime(300);\nresolvers['ang'](['angular']);\nawait flushPromises();\nresolvers['an'](['ant']);\nawait flushPromises();\nexpect($$('#results li').map(li => li.textContent)).toEqual(['angular']);" }
      ],
      explanation: `
Три проблеми «живого» пошуку:
1. **Забагато запитів** → debounce.
2. **Зайві запити** → \`trim\` і порівняння з останнім надісланим.
3. **Гонка відповідей** → мережа не гарантує порядок; \`requestId\` відкидає застарілі відповіді. Краща версія — \`AbortController\` для \`fetch\` (тема Browser API): попередній запит скасовується і не витрачає трафік.

**Безпека:** \`innerHTML\` з даними сервера — XSS; \`textContent\` вставляє текст.

**Типові помилки:** створювати debounce **всередині** обробника на кожну подію; забути скинути \`lastQuery\` при очищенні; рендер без перевірки актуальності.

**Що спитають далі:** стан «Завантаження…»? Кеш результатів? Чому для пошуку debounce, а для скролу — throttle?
`
    },

    // ================================================================ 6. Фокус, неспливаючі події, UI-патерни
    {
      id: 'ev-quiz-non-bubbling',
      group: 'focus-ui',
      type: 'quiz',
      level: 2,
      title: 'Які події не спливають?',
      tags: ['bubbling', 'focus', 'mouse'],
      question: 'Оберіть **усі** події, які **не** спливають:',
      options: ['`focus`', '`focusin`', '`mouseenter`', '`mouseover`', '`input`', '`load` на `<img>`'],
      answer: [0, 2, 5],
      why: [
        'Не спливає: для делегування фокусу є двійник focusin.',
        'Спливає: focusin створено саме як спливаючу версію focus.',
        'Не спливає: спливаючий аналог — mouseover (але він спрацьовує і при переході між дітьми).',
        'Спливає: тому hover-логіку делегують через mouseover + relatedTarget.',
        'Спливає: тому один слухач input на `<form>` обслуговує всі поля.',
        'Не спливає: load/error ресурсів ловлять лише на capture-фазі (`window.addEventListener(\'error\', fn, true)`).'
      ],
      hint: 'Майже у кожної неспливаючої події є «спливаючий двійник», створений саме для делегування.',
      explanation: `
**Не спливають:** \`focus\`/\`blur\` (двійники \`focusin\`/\`focusout\`), \`mouseenter\`/\`mouseleave\` (\`mouseover\`/\`mouseout\`), \`load\`/\`error\` ресурсів, \`scroll\` елемента.

Перевірити можна в самій події: \`e.bubbles\`. Capture-фаза є навіть у неспливаючих подій.
`
    },
    {
      id: 'ev-focusin-fields',
      group: 'focus-ui',
      type: 'dom',
      level: 2,
      interview: false,
      title: 'Підсвітка активного поля форми через focusin/focusout',
      tags: ['focus', 'delegation', 'focusin'],
      description: `
**Завдання.** Виправте підсвітку активного поля: код делегує \`focus\`/\`blur\` на форму — і нічого не працює.

**Де трапляється:** підсвітка поля й форми, автозбереження чернетки при виході з форми, закриття поповера при втраті фокусу.

**Дано (HTML)**
- \`<form id="profile">\` з трьома обгортками \`<div class="field">\`, у кожній — \`<input>\` або \`<textarea>\` (\`#name\`, \`#city\`, \`#bio\`);
- поза формою — \`<button id="other">\`;
- JS: слухачі \`focus\`/\`blur\` на \`#profile\` (не спрацьовують).

**Що написати** — лише слухачі на \`#profile\`:
- фокус у полі → його \`.field\` отримує клас \`focused\`; втрата фокусу → клас знімається;
- поки фокус будь-де у формі → \`#profile\` має клас \`form-active\`; знімати його лише тоді, коли фокус іде **за межі** форми.

**Приклад**
\`\`\`js
// фокус на #name → .field(#name).focused, #profile.form-active
// фокус на #bio  → focused переїхав, form-active не знімався ні на мить
// фокус на #other → жодного .focused, form-active знято
\`\`\`

**Як це працює:** \`focus\`/\`blur\` не спливають, тому слухач на формі їх не бачить; \`focusin\`/\`focusout\` — спливаючі двійники. При переході між полями порядок такий: \`focusout\` на старому полі (\`e.relatedTarget\` — нове поле), потім \`focusin\` на новому.

**Врахуйте:**
- \`form.contains(e.relatedTarget)\` → фокус лишається у формі (\`contains(null)\` дає \`false\`);
- поля, додані пізніше, теж працюють;
- \`e.target.closest('.field')\` може бути \`null\` — використайте \`?.\`.
`,
      html: `<form id="profile">
  <div class="field"><label for="name">Ім'я</label> <input id="name"></div>
  <div class="field"><label for="city">Місто</label> <input id="city"></div>
  <div class="field"><label for="bio">Про себе</label> <textarea id="bio"></textarea></div>
</form>
<button id="other">Інша кнопка</button>`,
      css: `.field { padding: 4px; margin: 4px 0; }
.focused { background: #eef; }
.form-active { outline: 2px solid #99f; }`,
      js: `const profile = document.querySelector('#profile');

// 1. TODO: focus не спливає — замініть на спливаючий двійник
profile.addEventListener('focus', (e) => {
  e.target.closest('.field').classList.add('focused');
  profile.classList.add('form-active');
});

// 2. TODO: blur не спливає — замініть на спливаючий двійник
profile.addEventListener('blur', (e) => {
  e.target.closest('.field').classList.remove('focused');
  // 3. TODO: знімати form-active, лише якщо e.relatedTarget поза формою
  profile.classList.remove('form-active');
});

// Спробуйте: клацайте Tab між полями і дивіться на підсвітку
`,
      editable: ['js'],
      solution: {
        js: `const profile = document.querySelector('#profile');

// focusin/focusout спливають, на відміну від focus/blur
profile.addEventListener('focusin', (e) => {
  e.target.closest('.field')?.classList.add('focused');
  profile.classList.add('form-active');
});

profile.addEventListener('focusout', (e) => {
  e.target.closest('.field')?.classList.remove('focused');
  // relatedTarget — елемент, що ОТРИМУЄ фокус (або null)
  if (!profile.contains(e.relatedTarget)) {
    profile.classList.remove('form-active');
  }
});
`
      },
      hints: [
        '`focus` і `blur` не спливають, тому обробник на формі їх не отримує. Які їхні спливаючі аналоги?',
        'У `focusout` властивість `e.relatedTarget` — елемент, куди переходить фокус.',
        'Знімайте `form-active` лише якщо `!profile.contains(e.relatedTarget)`.'
      ],
      tests: [
        { name: 'фокус на полі додає focused його обгортці', code: "$('#name').focus();\nexpect($('#name').closest('.field').classList.contains('focused')).toBe(true);\nexpect($('#profile').classList.contains('form-active')).toBe(true);" },
        { name: 'перехід між полями переносить focused без «блимання»', code: "$('#name').focus();\n// стан form-active між focusout старого і focusin нового поля\nconst states = [];\nconst spy = () => states.push($('#profile').classList.contains('form-active'));\ndocument.addEventListener('focusin', spy, true);\n$('#bio').focus();\ndocument.removeEventListener('focusin', spy, true);\nexpect($('#name').closest('.field').classList.contains('focused')).toBe(false);\nexpect($('#bio').closest('.field').classList.contains('focused')).toBe(true);\nexpect(states).toEqual([true]);\nexpect($('#profile').classList.contains('form-active')).toBe(true);" },
        { name: 'фокус поза формою знімає обидва класи', code: "$('#city').focus();\n$('#other').focus();\nexpect($$('.field.focused')).toHaveLength(0);\nexpect($('#profile').classList.contains('form-active')).toBe(false);" },
        { name: 'працює для доданих пізніше полів', code: "const f = document.createElement('div');\nf.className = 'field';\nf.innerHTML = '<input id=\"extra\">';\n$('#profile').append(f);\n$('#extra').focus();\nexpect(f.classList.contains('focused')).toBe(true);\n$('#other').focus();\nexpect(f.classList.contains('focused')).toBe(false);\nf.remove();" }
      ],
      explanation: `
\`focusin\`/\`focusout\` створені саме для делегування фокусу. Порядок при переході: \`blur\` → \`focusout\` (старе поле) → \`focus\` → \`focusin\` (нове). У \`focusout\` ми вже знаємо, **куди** йде фокус, тож не знімаємо \`form-active\` даремно.

**Альтернатива для візуалу:** CSS \`:focus-within\` (\`.field:focus-within\`, \`form:focus-within\`). JS потрібен для логіки: автозбереження, аналітика, закриття поповера.

**Пастка:** \`relatedTarget\` = \`null\`, якщо фокус пішов «у нікуди» (клік по не-фокусованому місцю, інше вікно).

**Що спитають далі:** порядок \`focus\`, \`focusin\`, \`blur\`, \`focusout\`? Як закрити dropdown, коли Tab виводить фокус за його межі?
`
    },
    {
      id: 'ev-modal',
      group: 'focus-ui',
      type: 'dom',
      level: 2,
      title: 'Модальне вікно: відкриття, закриття, фокус',
      tags: ['modal', 'keyboard', 'focus'],
      description: `
**Завдання.** Реалізуйте модальне вікно підтвердження: відкриття кнопкою, закриття трьома способами, коректний фокус. І виправте CSS, через який вікно не ховається.

**Де трапляється:** підтвердження видалення, форма логіну, перегляд фото. Одне з найчастіших UI-завдань на співбесіді.

**Дано (HTML)**
- \`<button id="open">\`;
- \`<div class="overlay" hidden>\` — затемнення; всередині \`<div class="dialog" role="dialog">\` з \`<h2>\`, \`<p class="text">\` і \`<button class="close">\`;
- CSS: \`.overlay { display: flex; ... }\` — саме воно «перебиває» \`hidden\`.

**Що написати**
- \`openModal()\` → знімає \`hidden\` з \`.overlay\`, додає \`body\` клас \`modal-open\`, фокус на \`.close\`;
- \`closeModal()\` → повертає \`hidden\`, знімає \`modal-open\`, фокус на \`#open\`; якщо вже закрито — нічого не робить;
- слухачі: \`click\` на \`#open\` → відкрити; \`click\` на \`.close\` → закрити; \`click\` по **затемненню** (не по діалогу) → закрити; \`keydown\` \`Escape\` на \`document\` → закрити;
- CSS: правило, яке ховає \`.overlay[hidden]\`.

**Приклад**
\`\`\`js
// клік #open → overlay видно, body.modal-open, фокус на .close
// клік по .text всередині діалогу → вікно відкрите
// Escape → вікно сховано, фокус на #open
\`\`\`

**Як це працює:** клік по тексту діалогу спливає до \`.overlay\`, але \`e.target\` тоді — елемент усередині \`.dialog\`. Лише клік по самому фону дає \`e.target === overlay\`. Атрибут \`hidden\` працює через стандартне правило браузера \`[hidden] { display: none }\`, яке будь-яке ваше \`display\` перебиває.

**Врахуйте:** Escape при закритому вікні нічого не робить; фокус не повинен «губитися» на \`body\`.
`,
      html: `<button id="open">Відкрити</button>
<div class="overlay" hidden>
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
    <h2 id="dlg-title">Підтвердження</h2>
    <p class="text">Ви впевнені?</p>
    <button class="close">Закрити</button>
  </div>
</div>`,
      css: `.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
/* TODO: правило, яке ховає .overlay з атрибутом hidden */
.dialog { background: #fff; padding: 16px; width: 300px; }
`,
      js: `const openBtn = document.querySelector('#open');
const overlay = document.querySelector('.overlay');
const closeBtn = overlay.querySelector('.close');

function openModal() {
  // 1. TODO: зняти hidden, клас modal-open на body, фокус на closeBtn
}

function closeModal() {
  // 2. TODO: якщо вже закрито — вийти; інакше hidden, прибрати modal-open, фокус на openBtn
}

// 3. TODO: click на openBtn → openModal; click на closeBtn → closeModal
// 4. TODO: click на overlay → закрити, лише якщо клікнули по самому фону
// 5. TODO: keydown на document: Escape → closeModal

// Спробуйте: відкрийте вікно і натисніть Escape
`,
      editable: ['js', 'css'],
      solution: {
        css: `.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
/* display: flex перебиває стандартне [hidden] { display: none } */
.overlay[hidden] { display: none; }
.dialog { background: #fff; padding: 16px; width: 300px; }
`,
        js: `const openBtn = document.querySelector('#open');
const overlay = document.querySelector('.overlay');
const closeBtn = overlay.querySelector('.close');

function openModal() {
  overlay.hidden = false;
  document.body.classList.add('modal-open');
  closeBtn.focus();
}

function closeModal() {
  if (overlay.hidden) return;
  overlay.hidden = true;
  document.body.classList.remove('modal-open');
  openBtn.focus();
}

openBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);

overlay.addEventListener('click', (e) => {
  // лише клік по самому затемненню, не по діалогу
  if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
`
      },
      hints: [
        'Клік по затемненню: обробник на `.overlay` і перевірка `e.target === overlay`.',
        'Escape слухайте на `document` (`keydown`, `e.key === \'Escape\'`); у `closeModal` спершу `if (overlay.hidden) return`.',
        'CSS: `display: flex` перебиває стандартне `[hidden] { display: none }`. Додайте `.overlay[hidden] { display: none; }`.'
      ],
      tests: [
        { name: 'відкривається, фокус на .close', code: "click('#open');\nexpect($('.overlay').hidden).toBe(false);\nexpect(document.body.classList.contains('modal-open')).toBe(true);\nexpect(document.activeElement).toBe($('.close'));" },
        { name: 'клік усередині діалогу не закриває', code: "if ($('.overlay').hidden) click('#open');\nclick('.text');\nclick('.dialog');\nexpect($('.overlay').hidden).toBe(false);" },
        { name: '.close закриває і повертає фокус', code: "if ($('.overlay').hidden) click('#open');\nclick('.close');\nexpect($('.overlay').hidden).toBe(true);\nexpect(document.body.classList.contains('modal-open')).toBe(false);\nexpect(document.activeElement).toBe($('#open'));" },
        { name: 'приховане вікно справді не відображається', code: "if (!$('.overlay').hidden) click('.close');\nexpect(css('.overlay', 'display')).toBe('none');" },
        { name: 'клік по затемненню закриває', code: "click('#open');\nclick('.overlay');\nexpect($('.overlay').hidden).toBe(true);" },
        { name: 'Escape закриває', code: "click('#open');\npress(document.activeElement, 'Escape');\nexpect($('.overlay').hidden).toBe(true);\nexpect(document.activeElement).toBe($('#open'));" }
      ],
      explanation: `
**Клік по фону:** \`e.target === overlay\` (альтернатива — \`!dialog.contains(e.target)\`).

**CSS-пастка \`[hidden]\`:** стандартне правило має найнижчий пріоритет; рішення — \`.overlay[hidden] { display: none }\` або глобальне \`[hidden] { display: none !important }\`.

**Фокус:** при відкритті — в діалог, при закритті — на кнопку-тригер. Повноцінна модалка також має focus trap і \`inert\` на решті сторінки.

**Сучасна альтернатива:** \`<dialog>\` + \`showModal()\` — top layer, \`::backdrop\`, Escape і повернення фокусу «з коробки».

**Що спитають далі:** як реалізувати focus trap? Чому виділення тексту, що почалось у діалозі й закінчилось на фоні, не повинно закривати вікно?
`
    },
    {
      id: 'ev-dropdown-outside',
      group: 'focus-ui',
      type: 'dom',
      level: 3,
      title: 'Dropdown: закриття по кліку поза ним і по Escape',
      tags: ['outside-click', 'capture', 'keyboard'],
      description: `
**Завдання.** Реалізуйте випадаюче меню, яке закривається кліком поза ним (навіть якщо чужий код зупиняє спливання) і клавішею Escape.

**Де трапляється:** меню профілю, вибір мови, контекстні меню, будь-які поповери. Класика співбесід («click outside»).

**Дано (HTML)**
- \`<div class="dropdown">\`: кнопка \`.toggle\` (\`aria-expanded="false"\`) і \`<ul class="menu" hidden>\`;
- у меню: два \`<button class="item">\` (\`Профіль\`, \`Налаштування\`) і роздільник \`<li class="sep">\`;
- поза меню: \`<p id="outside">\` зі \`<span id="selected">\` і \`<div class="widget">\`, що викликає \`stopPropagation()\` на кліках (**не видаляйте** цей код).

**Що написати**
- \`setOpen(open)\` → \`menu.hidden = !open\` і \`aria-expanded\` на кнопці (\`"true"\`/\`"false"\`);
- \`click\` на \`.toggle\` → відкрити/закрити;
- \`click\` по \`.item\` → текст пункту в \`#selected\`, закрити меню;
- \`click\` будь-де поза \`.dropdown\` → закрити (і по \`.widget\` теж);
- \`keydown\` \`Escape\` на \`document\` → закрити відкрите меню і повернути фокус на \`.toggle\`.

**Приклад**
\`\`\`js
// клік .toggle → меню відкрите, aria-expanded="true"
// клік .sep    → меню лишається відкритим
// клік .widget → меню закрите (хоча віджет зупиняє спливання)
\`\`\`

**Як це працює:** «клік поза» — слухач на \`document\` + \`dropdown.contains(e.target)\`. Віджет зупиняє спливання, тож на bubble-фазі \`document\` клік не отримає. Але фаза **capture** проходить через \`document\` **до** цілі — слухач з \`true\` третім аргументом спрацює завжди.

**Врахуйте:** клік по \`.toggle\` — теж «всередині» dropdown, тож слухач на \`document\` не має його закривати (інакше відкриття одразу закриється).
`,
      html: `<div class="dropdown">
  <button class="toggle" aria-expanded="false">Меню</button>
  <ul class="menu" hidden>
    <li><button class="item">Профіль</button></li>
    <li><button class="item">Налаштування</button></li>
    <li class="sep">———</li>
  </ul>
</div>
<p id="outside">Вибрано: <span id="selected">—</span></p>
<div class="widget">Віджет, що зупиняє спливання</div>`,
      css: `.dropdown { position: relative; display: inline-block; }
.menu { position: absolute; margin: 0; padding: 4px; list-style: none; background: #fff; border: 1px solid #ccc; }
.widget { margin-top: 120px; padding: 8px; background: #eee; }`,
      js: `// сторонній код — не видаляйте
document.querySelector('.widget').addEventListener('click', (e) => e.stopPropagation());

const dropdown = document.querySelector('.dropdown');
const toggle = dropdown.querySelector('.toggle');
const menu = dropdown.querySelector('.menu');
const selected = document.querySelector('#selected');

function setOpen(open) {
  // 1. TODO: menu.hidden і aria-expanded на toggle
}

// 2. TODO: click на toggle → перемкнути
// 3. TODO: click у menu: якщо по .item (closest) — текст у selected і закрити
// 4. TODO: click на document у фазі capture: відкрите меню + клік поза dropdown → закрити
// 5. TODO: keydown на document: Escape при відкритому меню → закрити і toggle.focus()

// Спробуйте: відкрийте меню і клікніть по сірому віджету
`,
      editable: ['js'],
      solution: {
        js: `// сторонній код — не видаляйте
document.querySelector('.widget').addEventListener('click', (e) => e.stopPropagation());

const dropdown = document.querySelector('.dropdown');
const toggle = dropdown.querySelector('.toggle');
const menu = dropdown.querySelector('.menu');
const selected = document.querySelector('#selected');

function setOpen(open) {
  menu.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
}

toggle.addEventListener('click', () => setOpen(menu.hidden));

menu.addEventListener('click', (e) => {
  const item = e.target.closest('.item');
  if (!item) return; // клік по роздільнику — меню лишається відкритим
  selected.textContent = item.textContent;
  setOpen(false);
  toggle.focus();
});

// capture: спрацює раніше, ніж будь-хто внизу викличе stopPropagation()
document.addEventListener('click', (e) => {
  if (!menu.hidden && !dropdown.contains(e.target)) setOpen(false);
}, true);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !menu.hidden) {
    setOpen(false);
    toggle.focus();
  }
});
`
      },
      hints: [
        'Для «кліку поза» повісьте обробник на `document` і перевіряйте `dropdown.contains(e.target)`.',
        'Якщо внутрішній елемент зупиняє спливання, до `document` на bubble-фазі подія не дійде. Яка фаза проходить через `document` **до** цілі?',
        '`document.addEventListener(\'click\', fn, true)` + окремий `keydown` з `e.key === \'Escape\'` і `toggle.focus()`.'
      ],
      tests: [
        { name: 'toggle відкриває і закриває, оновлює aria-expanded', code: "click('.toggle');\nexpect($('.menu').hidden).toBe(false);\nexpect($('.toggle').getAttribute('aria-expanded')).toBe('true');\nclick('.toggle');\nexpect($('.menu').hidden).toBe(true);\nexpect($('.toggle').getAttribute('aria-expanded')).toBe('false');" },
        { name: 'клік по роздільнику не закриває', code: "if ($('.menu').hidden) click('.toggle');\nclick('.sep');\nexpect($('.menu').hidden).toBe(false);" },
        { name: 'вибір пункту записує текст і закриває', code: "if ($('.menu').hidden) click('.toggle');\nclick($$('.item')[1]);\nexpect($('#selected').textContent).toBe('Налаштування');\nexpect($('.menu').hidden).toBe(true);" },
        { name: 'клік поза меню закриває', code: "if ($('.menu').hidden) click('.toggle');\nclick('#outside');\nexpect($('.menu').hidden).toBe(true);\nexpect($('.toggle').getAttribute('aria-expanded')).toBe('false');" },
        { name: 'закривається навіть при stopPropagation у віджеті', code: "if ($('.menu').hidden) click('.toggle');\nclick('.widget');\nexpect($('.menu').hidden).toBe(true);" },
        { name: 'Escape закриває і повертає фокус на toggle', code: "if ($('.menu').hidden) click('.toggle');\n$('.item').focus();\npress(document.activeElement, 'Escape');\nexpect($('.menu').hidden).toBe(true);\nexpect(document.activeElement).toBe($('.toggle'));" }
      ],
      explanation: `
**Клік поза** = слухач на \`document\` + \`contains\`. Ключ — **capture-фаза**: чужий \`stopPropagation()\` не заважає. Так роблять бібліотеки поповерів.

**Escape** з поверненням фокусу — вимога WAI-ARIA Menu Button pattern.

**Альтернативи:** \`pointerdown\` замість \`click\` (закриває до переходу фокусу); \`focusout\` + \`relatedTarget\` для Tab; атрибут \`popover\` дає light dismiss і Escape «з коробки».

**Що спитають далі:** навігація стрілками (roving tabindex)? Як не тримати слухач на \`document\`, коли меню закрите (додавати при відкритті, знімати при закритті)?
`
    },
    {
      id: 'ev-pointer-theory',
      group: 'focus-ui',
      type: 'theory',
      level: 3,
      interview: false,
      title: 'Pointer events vs mouse і touch events',
      tags: ['pointer', 'touch', 'mouse'],
      question: 'Що таке Pointer Events і чим вони кращі за окремі mouse- і touch-події? Що таке pointer capture і `touch-action`? У якому порядку спрацьовують події при тапі?',
      choices: [
        '`setPointerCapture` блокує скрол сторінки, поки палець на елементі, тож `touch-action` не потрібен',
        'Capture веде `pointermove/up` на елемент і поза його межами, а `touch-action` задає, які жести браузер обробить сам',
        '`preventDefault()` на `pointerdown` надійно скасовує і скрол на тач-пристроях, і наступний `click`',
        'При тапі спершу йдуть `mousedown`/`mouseup`, а pointer- і touch-події надходять уже після `click`',
        'Pointer Events не підтримують мультитач: для кількох пальців потрібні `touches` з touch-подій'
      ],
      correct: 1,
      why: [
        'Хибно: pointer capture лише перенаправляє події; скрол блокується CSS touch-action, інакше прийде pointercancel.',
        'Правильно: це дві ключові деталі для drag/свайпів на pointer events.',
        'Хибно: preventDefault() на pointerdown не скасовує ні click, ні скрол — скрол керується touch-action.',
        'Хибно: порядок навпаки — pointer → touch → сумісні mouse-події → click.',
        'Хибно: кожен палець — окремий pointerId, тож мультитач підтримується.'
      ],
      hint: 'Одна модель для миші, пальця і стилуса. Що відбувається, коли палець з\'їжджає з елемента під час перетягування?',
      answer: `
**Pointer Events** — одна модель для миші, дотику та стилуса: \`pointerdown/move/up/cancel\`, \`pointerover/out/enter/leave\`. Поля: \`pointerType\` (\`mouse | touch | pen\`), \`pointerId\` (кожен палець — окремий), \`isPrimary\`, \`pressure\`.

**Чому краще:** один код замість \`mousedown\` + \`touchstart\`, немає «подвійних» подій.

**Pointer capture:**
\`\`\`js
handle.addEventListener('pointerdown', (e) => {
  handle.setPointerCapture(e.pointerId); // move/up підуть на handle навіть поза ним
});
\`\`\`

**\`touch-action\` (CSS):** які жести браузер обробляє сам. Для власного drag — \`touch-action: none\` (\`pan-y\` для горизонтальної каруселі), інакше браузер почне скрол і надішле \`pointercancel\`.

**Порядок при тапі:** \`pointerdown\` → \`touchstart\` → \`pointerup\` → \`touchend\` → \`mouseover\` → \`mousedown\` → \`mouseup\` → \`click\`. Історична затримка 300 мс перед \`click\` (double-tap zoom) зникає з \`<meta name="viewport" content="width=device-width">\` або \`touch-action: manipulation\`.

**Пастки:** \`preventDefault()\` на \`pointerdown\` не скасовує \`click\`; hover на тач-пристроях «залипає» — \`@media (hover: hover)\`.
`,
      keyPoints: [
        'Єдина модель для миші, дотику та стилуса; pointerType, pointerId, isPrimary',
        'setPointerCapture — події йдуть на елемент, навіть коли курсор вийшов за межі',
        'touch-action у CSS керує жестами браузера; інакше pointercancel',
        'Порядок: pointer → touch → сумісні mouse-події → click',
        'Затримка 300 мс і як її прибрати'
      ],
      followUps: ['Як реалізувати drag-and-drop на pointer events?', 'Коли спрацьовує pointercancel?', 'Як підтримати pinch-zoom двома пальцями?']
    },


    // ================================================================ 7. Кастомні події
    {
      id: 'ev-custom-events-theory',
      group: 'custom',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'CustomEvent, dispatchEvent і isTrusted',
      tags: ['CustomEvent', 'EventTarget', 'isTrusted'],
      question: 'Як створити і відправити власну подію? Що таке `detail`, `bubbles`, `composed`, `isTrusted`? Оберіть **усі** правильні твердження.',
      choices: [
        '`dispatchEvent` синхронний і повертає `false`, якщо cancelable-подію скасували через `preventDefault()`',
        '`CustomEvent` за замовчуванням спливає, тому `bubbles: true` вказувати не обов\'язково',
        '`composed: true` дозволяє події вийти за межу Shadow DOM у зовнішній документ',
        'Подія з `dispatchEvent` має `isTrusted: true`, якщо її відправлено з обробника кліку користувача',
        'Синтетичний `new KeyboardEvent(\'keydown\')` друкує символ у полі так само, як реальне натискання'
      ],
      correct: [0, 2],
      why: [
        'Правильно: обробники виконуються всередині виклику, а false означає «хтось наклав вето».',
        'Хибно: у Event/CustomEvent bubbles за замовчуванням false — без нього слухач на батькові нічого не отримає.',
        'Правильно: без composed подія зупиняється на shadow root.',
        'Хибно: будь-яка подія зі скрипту має isTrusted: false, навіть якщо її створено в обробнику справжнього кліку.',
        'Хибно: синтетичні події не запускають дію за замовчуванням — символ не з\'явиться.'
      ],
      hint: 'Опції конструктора, синхронність, повернуте значення, події від користувача vs від скрипту.',
      answer: `
\`\`\`js
const ok = button.dispatchEvent(new CustomEvent('cart:add', {
  detail: { id: 42 },  // довільні дані
  bubbles: true,       // за замовчуванням false!
  cancelable: true,    // щоб preventDefault мав ефект
  composed: true       // пройти крізь Shadow DOM
}));
if (!ok) { /* хтось викликав preventDefault() */ }
\`\`\`

- \`dispatchEvent\` **синхронний**; виняток в обробнику не зупиняє інших і не долітає до \`try/catch\` навколо виклику (іде в \`window.onerror\`).
- \`isTrusted\` — \`true\` лише для подій від браузера. Popup, fullscreen, clipboard вимагають user activation (справжньої дії користувача).
- Синтетичні вбудовані події (\`new MouseEvent('click')\`) не запускають дію за замовчуванням.
- Будь-який \`EventTarget\` (і \`class Bus extends EventTarget\`) — готова шина подій з \`once\`/\`signal\`.
- Неймінг з префіксом (\`cart:add\`), щоб не конфліктувати з вбудованими.
`,
      keyPoints: [
        'new CustomEvent(type, { detail, bubbles, cancelable, composed }); bubbles за замовчуванням false',
        'dispatchEvent синхронний і повертає false, якщо подію скасовано',
        'isTrusted: true лише для подій від користувача',
        'EventTarget можна наслідувати для власної шини подій'
      ],
      followUps: ['Чим CustomEvent відрізняється від new Event + власні поля?', 'Як компонент на Shadow DOM має повідомляти про зміни?']
    },
    {
      id: 'ev-quiz-custom-bubbles',
      group: 'custom',
      type: 'quiz',
      level: 2,
      interview: false,
      title: 'Чи спливає CustomEvent?',
      tags: ['CustomEvent', 'bubbling'],
      question: `
\`#child\` знаходиться всередині \`#parent\`.

\`\`\`js
parent.addEventListener('notify', () => console.log('parent'));
child.addEventListener('notify', () => console.log('child'));

child.dispatchEvent(new CustomEvent('notify', { detail: 1 }));
\`\`\`

Що буде виведено?
`,
      options: [
        '`child`, `parent`',
        '`parent`, `child`',
        'Нічого: кастомні події можна слухати лише на `document`',
        '`child`'
      ],
      answer: 3,
      why: [
        'Хибно: так було б лише з `bubbles: true`, а за замовчуванням подія не спливає.',
        'Хибно: батько першим — лише з capture-слухачем.',
        'Хибно: кастомну подію можна диспатчити і слухати на будь-якому EventTarget.',
        'Правильно: `bubbles` за замовчуванням `false`, тож подія спрацьовує лише на цілі.'
      ],
      hint: 'Які значення за замовчуванням мають опції конструктора CustomEvent?',
      explanation: `
\`new Event\`/\`new CustomEvent\` створюють подію з \`bubbles: false\`, \`cancelable: false\`. Для делегування чи слухача на \`document\` пишіть явно \`{ detail, bubbles: true }\`. Capture-фаза існує навіть для неспливаючих подій.
`
    },
    {
      id: 'ev-quiz-dispatch-sync',
      group: 'custom',
      type: 'quiz',
      level: 3,
      title: 'dispatchEvent — синхронний',
      tags: ['CustomEvent', 'dispatchEvent', 'event-loop'],
      question: `
\`\`\`js
el.addEventListener('ping', (e) => {
  console.log('handler', e.detail);
  e.preventDefault();
});

console.log('before');
Promise.resolve().then(() => console.log('micro'));
setTimeout(() => console.log('macro'));
const result = el.dispatchEvent(new CustomEvent('ping', { detail: 42, cancelable: true }));
console.log('after', result);
\`\`\`

Що буде виведено?
`,
      options: [
        '`before`, `handler 42`, `after false`, `micro`, `macro`',
        '`before`, `after true`, `micro`, `handler 42`, `macro`',
        '`before`, `micro`, `handler 42`, `after false`, `macro`',
        '`before`, `after true`, `handler 42`, `micro`, `macro`'
      ],
      answer: 0,
      why: [
        'Правильно: обробник виконується всередині dispatchEvent, preventDefault дає false, потім мікрозадача і макрозадача.',
        'Хибно: dispatchEvent не ставить обробник у чергу — він викликається одразу.',
        'Хибно: мікрозадачі не вклиниваються в синхронний код — micro чекає порожнього стеку.',
        'Хибно: обробник виконується до повернення з dispatchEvent, і після preventDefault результат false.'
      ],
      hint: 'dispatchEvent ставить обробники в чергу чи викликає їх одразу, як звичайні функції?',
      explanation: `
\`dispatchEvent\` викликає обробники **синхронно**, як звичайні функції. Тому \`handler 42\` іде одразу після \`before\`, а \`result === false\`, бо подія \`cancelable\` і її скасували. Далі стек порожніє → \`micro\`, потім \`macro\`. Асинхронно приходять лише події від браузера (як задачі).
`
    },
    {
      id: 'ev-event-bus',
      group: 'custom',
      type: 'code',
      level: 3,
      interview: false,
      title: 'Шина подій на EventTarget і CustomEvent',
      tags: ['EventTarget', 'CustomEvent', 'pubsub'],
      description: `
**Завдання.** Напишіть клас \`EventBus extends EventTarget\` — шину подій між незалежними модулями застосунку.

**Де трапляється:** модулі «кошик» і «шапка» спілкуються без прямих імпортів; на співбесідах — варіація класичного EventEmitter.

**Що написати**
- \`on(type, handler)\` → функція відписки. \`handler\` викликається як \`handler(detail, event)\`. Повторна підписка того самого \`handler\` на той самий тип ігнорується.
- \`once(type, handler)\` → функція відписки; спрацьовує один раз.
- \`off(type, handler)\` → нічого; знімає \`handler\`, переданий у \`on\`/\`once\`.
- \`emit(type, detail)\` → \`false\`, якщо хтось викликав \`event.preventDefault()\`, інакше \`true\`. Диспатчить \`CustomEvent\` з \`detail\` і \`cancelable: true\` синхронно.

Використайте вбудовані \`addEventListener\`/\`dispatchEvent\`, а не власний масив слухачів.

**Приклад**
\`\`\`js
const bus = new EventBus();
const off = bus.on('login', (user) => console.log(user.name));
bus.emit('login', { name: 'Olena' }); // Olena; повертає true
off();
bus.emit('login', { name: 'Ivan' });  // нічого
\`\`\`

**Як це працює:** \`addEventListener\` отримує функцію \`(event) => ...\`, а користувач дає \`handler(detail, event)\` — потрібна обгортка. Але \`removeEventListener(type, handler)\` її не зніме (інше посилання), тому зберігайте відповідність \`handler → wrapper\` для кожного типу.

**Врахуйте:** дублікати ігноруються; типи незалежні; \`once\` після спрацювання прибирає запис, щоб той самий handler можна було підписати знову.
`,
      starter: `class EventBus extends EventTarget {
  // 1. Сховище обгорток: type -> Map(handler -> wrapper)
  #wrappers = new Map();

  on(type, handler, { once = false } = {}) {
    // 2. TODO: якщо handler уже підписаний на type — просто поверніть відписку
    // 3. TODO: wrapper = (event) => handler(event.detail, event); для once — видалити запис
    // 4. TODO: збережіть wrapper і this.addEventListener(type, wrapper, { once })
    // 5. TODO: поверніть () => this.off(type, handler)
  }

  once(type, handler) {
    // TODO: делегуйте в on з { once: true }
  }

  off(type, handler) {
    // TODO: знайдіть wrapper, removeEventListener, видаліть запис
  }

  emit(type, detail) {
    // TODO: dispatchEvent(new CustomEvent(...)) і поверніть результат
  }
}

// Спробуйте в консолі:
// const bus = new EventBus();
// bus.on('login', (u) => console.log(u.name));
// bus.emit('login', { name: 'Olena' });
`,
      solution: `class EventBus extends EventTarget {
  // type -> Map(handler -> wrapper): обробник користувача ≠ функція, яку отримує addEventListener
  #wrappers = new Map();

  #handlersOf(type) {
    let map = this.#wrappers.get(type);
    if (!map) {
      map = new Map();
      this.#wrappers.set(type, map);
    }
    return map;
  }

  on(type, handler, { once = false } = {}) {
    const map = this.#handlersOf(type);
    const off = () => this.off(type, handler);
    if (map.has(handler)) return off; // дублікат — ігноруємо

    const wrapper = (event) => {
      if (once) map.delete(handler);
      handler(event.detail, event);
    };
    map.set(handler, wrapper);
    this.addEventListener(type, wrapper, { once });
    return off;
  }

  once(type, handler) {
    return this.on(type, handler, { once: true });
  }

  off(type, handler) {
    const map = this.#wrappers.get(type);
    const wrapper = map && map.get(handler);
    if (!wrapper) return;
    this.removeEventListener(type, wrapper);
    map.delete(handler);
  }

  emit(type, detail) {
    return this.dispatchEvent(new CustomEvent(type, { detail, cancelable: true }));
  }
}
`,
      hints: [
        '`emit` — це `return this.dispatchEvent(new CustomEvent(type, { detail, cancelable: true }))`.',
        'Обгортка `(event) => handler(event.detail, event)` потрібна, але `removeEventListener(type, handler)` її не зніме — зберігайте `handler → wrapper` у `Map` для кожного типу.',
        '`once`: передайте `{ once: true }` в `addEventListener` і у wrapper видаліть запис з Map перед викликом handler.'
      ],
      tests: [
        { name: 'on + emit передає detail і подію', code: "const bus = new EventBus();\nconst h = mockFn();\nbus.on('login', h);\nbus.emit('login', { id: 1 });\nexpect(h).toHaveBeenCalledTimes(1);\nexpect(h.mock.calls[0][0]).toEqual({ id: 1 });\nexpect(h.mock.calls[0][1]).toBeInstanceOf(CustomEvent);\nexpect(h.mock.calls[0][1].type).toBe('login');" },
        { name: 'відписка: функція з on() і off(type, handler)', code: "const bus = new EventBus();\nconst a = mockFn(), b = mockFn();\nconst offA = bus.on('x', a);\nbus.on('x', b);\noffA();\nbus.off('x', b);\nbus.emit('x', 1);\nexpect(a).not.toHaveBeenCalled();\nexpect(b).not.toHaveBeenCalled();" },
        { name: 'once спрацьовує один раз і знімається через off', code: "const bus = new EventBus();\nconst h = mockFn(), g = mockFn();\nbus.once('tick', h);\nbus.emit('tick', 1);\nbus.emit('tick', 2);\nexpect(h).toHaveBeenCalledTimes(1);\nexpect(h.mock.calls[0][0]).toBe(1);\nbus.once('tick', g);\nbus.off('tick', g);\nbus.emit('tick', 3);\nexpect(g).not.toHaveBeenCalled();" },
        { name: 'emit синхронний', code: "const bus = new EventBus();\nconst log = [];\nbus.on('e', (d) => log.push('handler ' + d));\nlog.push('before');\nbus.emit('e', 7);\nlog.push('after');\nexpect(log).toEqual(['before', 'handler 7', 'after']);" },
        { name: 'emit повертає false, якщо викликано preventDefault', code: "const bus = new EventBus();\nexpect(bus.emit('close')).toBe(true);\nbus.on('close', (d, e) => e.preventDefault());\nexpect(bus.emit('close')).toBe(false);" },
        { name: 'дублікати ігноруються, типи незалежні', code: "const bus = new EventBus();\nconst h = mockFn();\nbus.on('a', h);\nbus.on('a', h);\nbus.on('b', h);\nbus.emit('a', 1);\nexpect(h).toHaveBeenCalledTimes(1);\nbus.off('a', h);\nbus.emit('b', 2);\nexpect(h).toHaveBeenCalledTimes(2);\nexpect(h).toHaveBeenLastCalledWith(2, h.mock.calls[1][1]);" },
        { name: 'це справжній EventTarget', code: "const bus = new EventBus();\nexpect(bus).toBeInstanceOf(EventTarget);\nlet got = null;\nbus.addEventListener('raw', (e) => { got = e.detail; });\nbus.emit('raw', 5);\nexpect(got).toBe(5);" }
      ],
      explanation: `
**Пастка — обгортка:** \`removeEventListener(type, handler)\` не зніме \`wrapper\`, тому потрібна \`Map\` \`handler → wrapper\`.

**Чому EventTarget:** безкоштовно \`once\`, \`signal\`, дедуплікація, ізоляція винятків (помилка одного обробника не зупиняє інших). \`cancelable\` + повернення \`dispatchEvent\` = механізм «вето».

**Складність:** \`on\`/\`off\` — O(1), \`emit\` — O(k) підписників.

**Що спитають далі:** як додати \`signal\` в \`on\`? Wildcard-підписку \`*\`? Чим це відрізняється від EventEmitter з Node.js?
`
    },
    {
      id: 'ev-star-rating',
      group: 'custom',
      type: 'dom',
      level: 3,
      interview: false,
      title: 'Віджет рейтингу «зірочки»',
      tags: ['delegation', 'CustomEvent', 'keyboard', 'mouseover'],
      description: `
**Завдання.** Оживіть віджет оцінки з 5 зірок: клік, підсвітка при наведенні, стрілки на клавіатурі. Про зміну оцінки повідомляйте зовнішній код кастомною подією \`rate\`.

**Де трапляється:** відгуки про товар, оцінка курсу/доставки. Збирає разом делегування, клавіатуру і CustomEvent.

**Дано (HTML)**
- \`<div class="rating" tabindex="0" role="slider" data-value="0" aria-valuenow="0">\` — контейнер;
- всередині 5 × \`<span class="star" data-value="1..5">\`;
- \`<span id="out">\` — сюди вже пише готовий код, що слухає \`rate\` на \`document\` (не змінюйте його).

**Що написати** (обробники — лише на \`.rating\`, делегування)
- \`click\` по зірці N → \`setValue(N)\`;
- \`setValue(n)\`: обмежити 1..5; якщо значення не змінилось — нічого; інакше зірки 1..N отримують клас \`active\` (решта — ні), оновити \`data-value\` і \`aria-valuenow\` контейнера, задиспатчити на \`.rating\` \`CustomEvent('rate', { detail: { value: N }, bubbles: true })\`;
- \`mouseover\` на зірці N → клас \`hover\` зіркам 1..N; \`mouseleave\` з \`.rating\` → прибрати всі \`hover\`;
- \`keydown\`: \`ArrowRight\`/\`ArrowUp\` → +1, \`ArrowLeft\`/\`ArrowDown\` → −1, і \`preventDefault()\` для цих клавіш (інакше скрол сторінки).

**Приклад**
\`\`\`js
// клік по 3-й зірці → 3 зірки .active, data-value="3", #out = "3"
// ще раз по 3-й     → події rate немає
// фокус + ArrowRight → 4
\`\`\`

**Як це працює:** \`e.target.closest('.star')\` знаходить зірку (або \`null\` при кліку в проміжок). \`mouseover\` спливає, тож його можна делегувати; \`mouseleave\` не спливає і не спрацьовує при переході між зірками — лише при виході з усього віджета. Без \`bubbles: true\` слухач на \`document\` подію не отримає.

**Врахуйте:** клік між зірками нічого не змінює; інші клавіші не скасовуються.
`,
      html: `<div class="rating" tabindex="0" role="slider" aria-label="Оцінка" aria-valuemin="1" aria-valuemax="5" aria-valuenow="0" data-value="0">
  <span class="star" data-value="1">&#9733;</span>
  <span class="star" data-value="2">&#9733;</span>
  <span class="star" data-value="3">&#9733;</span>
  <span class="star" data-value="4">&#9733;</span>
  <span class="star" data-value="5">&#9733;</span>
</div>
<p>Оцінка: <span id="out">—</span></p>`,
      css: `.rating { display: inline-flex; gap: 8px; font-size: 28px; padding: 4px; cursor: pointer; color: #ccc; }
.star.active { color: #f5a623; }
.star.hover { color: #ffd27a; }`,
      js: `const rating = document.querySelector('.rating');
const out = document.querySelector('#out');

// показ оцінки — не змінюйте
document.addEventListener('rate', (e) => { out.textContent = e.detail.value; });

const stars = [...rating.querySelectorAll('.star')];
let value = 0;

function paint(className, n) {
  // 1. TODO: зіркам з індексом < n додати className, решті — прибрати (classList.toggle)
}

function setValue(n) {
  // 2. TODO: обмежити 1..5; якщо n === value — вийти
  // 3. TODO: value = n; paint('active', n); data-value і aria-valuenow
  // 4. TODO: rating.dispatchEvent(new CustomEvent('rate', { ... bubbles: true }))
}

// 5. TODO: click → closest('.star') → setValue
// 6. TODO: mouseover → paint('hover', N); mouseleave → paint('hover', 0)
// 7. TODO: keydown: стрілки ±1 і preventDefault
`,
      editable: ['js'],
      solution: {
        js: `const rating = document.querySelector('.rating');
const out = document.querySelector('#out');

// показ оцінки — не змінюйте
document.addEventListener('rate', (e) => { out.textContent = e.detail.value; });

const stars = [...rating.querySelectorAll('.star')];
let value = 0;

function paint(className, n) {
  stars.forEach((star, i) => star.classList.toggle(className, i < n));
}

function setValue(n) {
  n = Math.min(5, Math.max(1, n));
  if (n === value) return; // без змін — без події
  value = n;
  paint('active', n);
  rating.dataset.value = String(n);
  rating.setAttribute('aria-valuenow', String(n));
  rating.dispatchEvent(new CustomEvent('rate', { detail: { value: n }, bubbles: true }));
}

rating.addEventListener('click', (e) => {
  const star = e.target.closest('.star');
  if (star) setValue(Number(star.dataset.value));
});

rating.addEventListener('mouseover', (e) => {
  const star = e.target.closest('.star');
  if (star) paint('hover', Number(star.dataset.value));
});

// mouseleave не спливає і не спрацьовує при переході між зірками
rating.addEventListener('mouseleave', () => paint('hover', 0));

const KEYS = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
rating.addEventListener('keydown', (e) => {
  const delta = KEYS[e.key];
  if (!delta) return;
  e.preventDefault(); // стрілки інакше скролять сторінку
  setValue(value + delta);
});
`
      },
      hints: [
        'Один `click` і один `mouseover` на `.rating`; зірку знаходьте через `e.target.closest(\'.star\')`.',
        '`paint`: `stars.forEach((s, i) => s.classList.toggle(className, i < n))` — і для `active`, і для `hover`.',
        'Уся зміна значення — у `setValue(n)`: `Math.min(5, Math.max(1, n))`, перевірка «не змінилось», класи, атрибути, `dispatchEvent`.'
      ],
      tests: [
        { name: 'клік по 3-й зірці встановлює значення 3', code: "click($$('.star')[2]);\nexpect($$('.star.active')).toHaveLength(3);\nexpect($$('.star')[3].classList.contains('active')).toBe(false);\nexpect($('.rating').dataset.value).toBe('3');\nexpect($('.rating').getAttribute('aria-valuenow')).toBe('3');\nexpect($('#out').textContent).toBe('3');" },
        { name: 'подія rate з detail, без дублів при тому ж значенні', code: "const spy = mockFn();\n$('.rating').addEventListener('rate', spy);\nclick($$('.star')[4]);\nclick($$('.star')[4]);\n$('.rating').removeEventListener('rate', spy);\nexpect(spy).toHaveBeenCalledTimes(1);\nexpect(spy.mock.calls[0][0].detail).toEqual({ value: 5 });\nexpect(spy.mock.calls[0][0].bubbles).toBe(true);" },
        { name: 'hover-підсвітка і її скидання', code: "const activeBefore = $$('.star.active').length;\ndispatch($$('.star')[1], 'mouseover');\nexpect($$('.star.hover')).toHaveLength(2);\nexpect($$('.star.active')).toHaveLength(activeBefore);\ndispatch('.rating', 'mouseleave', { bubbles: false });\nexpect($$('.star.hover')).toHaveLength(0);" },
        { name: 'стрілки змінюють значення в межах 1..5', code: "click($$('.star')[1]);\nconst ev = press('.rating', 'ArrowRight');\nexpect(ev.defaultPrevented).toBe(true);\nexpect($('.rating').dataset.value).toBe('3');\npress('.rating', 'ArrowLeft');\npress('.rating', 'ArrowLeft');\npress('.rating', 'ArrowDown');\nexpect($('.rating').dataset.value).toBe('1');\nexpect($$('.star.active')).toHaveLength(1);\nexpect(press('.rating', 'a').defaultPrevented).toBe(false);" },
        { name: 'клік між зірками нічого не змінює', code: "const before = $('.rating').dataset.value;\nclick('.rating');\nexpect($('.rating').dataset.value).toBe(before);" }
      ],
      explanation: `
**Делегування:** 4 обробники на контейнері замість 15 на зірках. **Одна точка зміни стану** (\`setValue\`) тримає класи, ARIA і подію синхронними для миші та клавіатури. Подія лише при реальній зміні — як нативний \`change\`.

**mouseover vs mouseleave:** перший спливає (делегується), другий спрацьовує лише при виході з усього віджета.

**Типова помилка:** забути \`bubbles: true\` — слухач на \`document\` мовчить.

**Що спитають далі:** як зробити половинки зірок (\`e.offsetX\`)? Чому \`<input type="radio">\` — доступна альтернатива «з коробки»?
`
    },

    // ================================================================ 8. Прибирання і під капотом
    {
      id: 'ev-memory-leaks',
      group: 'cleanup',
      type: 'theory',
      level: 3,
      title: 'Обробники подій і витоки пам\'яті',
      tags: ['cleanup', 'memory', 'AbortController'],
      question: 'Як обробники подій можуть спричинити витік пам\'яті в SPA? Як правильно прибирати обробники при знищенні компонента?',
      choices: [
        'Будь-який слухач на елементі компонента тримає вузол у пам\'яті вічно, навіть коли вузол уже недосяжний',
        'Збирач сміття сам звільнить слухачі на `window`, щойно компонент видалено з DOM і він став недосяжним',
        'Достатньо `element.remove()`: браузер автоматично знімає слухачі з `window`, додані кодом компонента',
        'Слухач на `window` через замикання тримає DOM знятого компонента; знімаємо його через `signal` або `removeEventListener`',
        'Витік буває лише зі стрілковими обробниками; звичайні функції збирач сміття звільняє коректно'
      ],
      correct: 3,
      why: [
        'Хибно: недосяжний вузол збирається разом зі своїми слухачами — проблема в довгоживучих target.',
        'Хибно: window живий завжди, тож обробник на ньому і все, що він замикає, лишаються досяжними.',
        'Хибно: remove() стосується лише вузла; слухачі на window знімайте самі.',
        'Правильно: window → обробник → замикання → DOM; розірвати ланцюг може лише явне зняття.',
        'Хибно: тип функції не важливий — важливо, хто тримає посилання на неї.'
      ],
      hint: 'Хто на кого посилається: window → обробник → замикання → DOM і дані компонента.',
      answer: `
**Механізм:** \`window\`/\`document\`/шина тримає обробник, обробник через замикання — DOM і дані компонента. Компонент видалено, а все це досяжне → **detached DOM trees** і дублі обробників при повторному монтуванні.

\`\`\`js
function mount() {
  const ac = new AbortController();
  window.addEventListener('resize', onResize, { signal: ac.signal });
  document.addEventListener('keydown', onKey, { signal: ac.signal });
  return () => ac.abort(); // знімає все одним викликом
}
\`\`\`

**Інструменти:** \`removeEventListener\` з тим самим посиланням, \`{ once: true }\`, \`AbortController\`, делегування, cleanup у \`useEffect\`.

**Діагностика:** DevTools → Memory → Heap snapshot, фільтр «Detached»; \`getEventListeners(window)\`.

Не забувайте таймери, \`IntersectionObserver.disconnect()\`, підписки на store.
`,
      keyPoints: [
        'Довгоживучий target тримає обробник, а той через замикання — DOM і дані',
        'Наслідки: detached DOM і дублювання обробників',
        'Прибирання: removeEventListener з тим самим посиланням, once, AbortController.signal',
        'Діагностика: heap snapshot (Detached), getEventListeners'
      ],
      followUps: ['Чи потрібно знімати обробники з елемента перед element.remove()?', 'Як знайти detached DOM у DevTools?']
    },
    {
      id: 'ev-abort-signal-cleanup',
      group: 'cleanup',
      type: 'dom',
      level: 2,
      title: 'Зняти всі обробники одним AbortController',
      tags: ['addEventListener', 'AbortController', 'cleanup'],
      description: `
**Завдання.** Напишіть \`startTracking()\`, що рахує кліки і натискання клавіш у документі, і повертає \`stop()\`, яка знімає **всі** обробники одним викликом.

**Де трапляється:** аналітика, гарячі клавіші, «клік поза меню» — будь-який компонент, що слухає \`document\`/\`window\` і має прибирати за собою при знищенні.

**Дано (HTML)**
- \`<span id="clicks">\` і \`<span id="keys">\`;
- готові \`stats = { clicks, keys }\` і \`render()\`, що переносить \`stats\` у DOM.

**Що написати**
- \`startTracking()\` → функція \`stop\`. Слухачі \`click\` і \`keydown\` на \`document\` збільшують \`stats.clicks\`/\`stats.keys\` і викликають \`render()\`.
- \`stop()\` знімає обидва слухачі. Використайте **один** \`AbortController\` і опцію \`signal\`.
- Повторний \`startTracking()\`, поки трекінг активний, повертає ту саму \`stop\` і **не** додає слухачі вдруге. Після \`stop()\` можна запустити знову.

**Приклад**
\`\`\`js
const stop = startTracking();
// клік → stats.clicks + 1
startTracking() === stop; // true
stop();
// клік → нічого
\`\`\`

**Як це працює:** \`addEventListener(type, fn, { signal })\` прив'язує слухача до сигналу; \`controller.abort()\` змушує браузер зняти всі такі слухачі — посилання на функції зберігати не треба.

**Врахуйте:** контролер після \`abort()\` «мертвий» — для нового запуску потрібен новий.
`,
      html: `<p>Кліки: <span id="clicks">0</span>, клавіші: <span id="keys">0</span></p>`,
      css: ``,
      js: `const stats = { clicks: 0, keys: 0 };

function render() {
  document.querySelector('#clicks').textContent = stats.clicks;
  document.querySelector('#keys').textContent = stats.keys;
}

let activeStop = null; // поточна stop, поки трекінг активний

function startTracking() {
  // 1. TODO: якщо activeStop уже є — поверніть його
  // 2. TODO: const controller = new AbortController()
  // 3. TODO: click і keydown на document з { signal: controller.signal }
  // 4. TODO: activeStop = функція, що викликає controller.abort() і обнуляє activeStop
  return function stop() {};
}

// Спробуйте в консолі: const stop = startTracking(); — клікайте, потім stop()
`,
      editable: ['js'],
      solution: {
        js: `const stats = { clicks: 0, keys: 0 };

function render() {
  document.querySelector('#clicks').textContent = stats.clicks;
  document.querySelector('#keys').textContent = stats.keys;
}

let activeStop = null; // поточна stop, поки трекінг активний

function startTracking() {
  if (activeStop) return activeStop; // вже відстежуємо — не дублюємо

  const controller = new AbortController();
  const { signal } = controller;

  document.addEventListener('click', () => {
    stats.clicks++;
    render();
  }, { signal });

  document.addEventListener('keydown', () => {
    stats.keys++;
    render();
  }, { signal });

  activeStop = function stop() {
    controller.abort(); // знімає ВСІ обробники з цим signal
    activeStop = null;
  };
  return activeStop;
}
`
      },
      hints: [
        'Створіть `new AbortController()` і передайте `{ signal: controller.signal }` у кожен `addEventListener`.',
        '`controller.abort()` знімає всі слухачі з цим сигналом — функції зберігати не треба.',
        'Зберігайте поточну `stop` у `activeStop`: якщо вона не `null`, поверніть її одразу.'
      ],
      tests: [
        { name: 'рахує кліки та клавіші і оновлює DOM', code: "const stop = startTracking();\nconst c = stats.clicks, k = stats.keys;\nclick(document.body);\npress(document.body, 'a');\nexpect(stats.clicks).toBe(c + 1);\nexpect(stats.keys).toBe(k + 1);\nexpect($('#clicks').textContent).toBe(String(stats.clicks));\nstop();" },
        { name: 'stop() знімає всі обробники', code: "const stop = startTracking();\nstop();\nconst c = stats.clicks, k = stats.keys;\nclick(document.body);\npress(document.body, 'Enter');\nexpect(stats.clicks).toBe(c);\nexpect(stats.keys).toBe(k);" },
        { name: 'повторний startTracking не дублює обробники', code: "const s1 = startTracking();\nconst s2 = startTracking();\nconst c = stats.clicks;\nclick(document.body);\nexpect(stats.clicks).toBe(c + 1);\ns1(); s2();\nclick(document.body);\nexpect(stats.clicks).toBe(c + 1);" },
        { name: 'після stop() можна запустити знову', code: "startTracking()();\nconst stop = startTracking();\nconst k = stats.keys;\npress(document.body, 'x');\nexpect(stats.keys).toBe(k + 1);\nstop();" }
      ],
      explanation: `
Один контролер на компонент, \`abort()\` у \`destroy()\`/cleanup \`useEffect\`. Той самий \`signal\` можна передати і в \`fetch\` — скасувати запити тим самим викликом.

**Типові помилки:** повторно використати контролер після \`abort()\` (слухачі з мертвим сигналом не додаються); двічі навісити обробники при повторному монтуванні.

**Що спитають далі:** як зробити це без \`AbortController\` (масив \`[target, type, fn]\`)? Що робить \`AbortSignal.any()\`?
`
    },
    {
      id: 'ev-quiz-click-microtasks',
      group: 'cleanup',
      type: 'quiz',
      level: 4,
      interview: false,
      title: 'Справжній клік vs el.click(): мікрозадачі між обробниками',
      tags: ['event-loop', 'microtasks', 'click'],
      question: `
\`\`\`js
btn.addEventListener('click', () => {
  Promise.resolve().then(() => console.log('m1'));
  console.log('l1');
});
btn.addEventListener('click', () => {
  Promise.resolve().then(() => console.log('m2'));
  console.log('l2');
});
\`\`\`

Що буде виведено (1) при **справжньому кліку** мишкою і (2) при виклику \`btn.click()\` зі скрипту?
`,
      options: [
        'В обох випадках: `l1 l2 m1 m2`',
        'В обох випадках: `l1 m1 l2 m2`',
        'Клік мишкою: `l1 l2 m1 m2`; `btn.click()`: `l1 m1 l2 m2`',
        'Клік мишкою: `l1 m1 l2 m2`; `btn.click()`: `l1 l2 m1 m2`'
      ],
      answer: 3,
      why: [
        'Хибно: при справжньому кліку стек порожніє між обробниками, і m1 виконується до l2.',
        'Хибно: при btn.click() під обробниками на стеку лежить ваш скрипт, тож мікрозадачі чекають.',
        'Хибно: навпаки — саме справжній клік дає мікрозадачі між обробниками.',
        'Правильно: мікрозадачі виконуються, коли стек порожній; при el.click() він не порожній до кінця скрипту.'
      ],
      hint: 'Мікрозадачі виконуються, коли стек JS порожній. Чи порожній він між обробниками, якщо подію диспатчить браузер? А скрипт?',
      explanation: `
Мікрозадачі виконуються після кожного колбека, якщо під ним немає іншого JS. Справжній клік: браузер сам викликає обробники → між ними стек порожній → \`l1 m1 l2 m2\`. \`btn.click()\`: обидва обробники всередині синхронного виклику зі скрипту → \`l1 l2 m1 m2\`.

Практично: тести з \`dispatchEvent\` можуть поводитися інакше, ніж реальний користувач.
`
    },
    {
      id: 'ev-react-events',
      group: 'cleanup',
      type: 'theory',
      level: 4,
      interview: false,
      title: 'Як влаштована система подій у React',
      tags: ['react', 'delegation', 'synthetic-events'],
      question: 'Як React обробляє події під капотом? Що таке SyntheticEvent і де React вішає слухачі?',
      choices: [
        'React вішає `onClick` безпосередньо на DOM-вузол кожної кнопки через `addEventListener`',
        'SyntheticEvent досі використовує pooling, тому `e.target` не можна читати в асинхронному коді',
        '`e.preventDefault()` в `onWheel` скасовує скрол так само, як у нативному non-passive обробнику',
        'Подія з порталу спливає по DOM-дереву, тому батьківський компонент модалки її не отримає',
        'З React 17 слухачі стоять на кореневому контейнері, а `onChange` поля спрацьовує на кожне введення'
      ],
      correct: 4,
      why: [
        'Хибно: React використовує делегування — слухачі на корені, а не на кожному вузлі.',
        'Хибно: pooling прибрали в React 17 — подію можна читати асинхронно.',
        'Хибно: React реєструє wheel/touch як passive; для скасування потрібен ref + addEventListener з passive: false.',
        'Хибно: подія з порталу спливає по дереву React, тож батьківський компонент її отримає.',
        'Правильно: делегування на кореневий контейнер з 17-ї версії, а onChange слухає нативний input.'
      ],
      hint: 'Делегування на корені, обгортка над нативною подією, React 17, onChange vs change, passive.',
      answer: `
- **Делегування:** з React 17 слухачі всіх подій (capture і bubble) — на кореневому контейнері (\`createRoot(container)\`), до 17 — на \`document\`. React сам проходить своє дерево від цілі вгору і викликає \`onClick\`/\`onClickCapture\`.
- **SyntheticEvent** — кросбраузерна обгортка; нативна подія — \`e.nativeEvent\`. Pooling прибрано в 17.
- **Відмінності:** \`onChange\` = нативний \`input\`; \`onFocus\`/\`onBlur\` спливають (\`focusin\`/\`focusout\`); \`onMouseEnter\` емулюється через \`mouseover\`/\`mouseout\`; wheel/touch — passive; \`return false\` нічого не скасовує.
- **Портали:** подія спливає по дереву React, а не DOM.
- \`stopPropagation()\` у React не зупинить нативні слухачі на елементах усередині кореня — вони вже спрацювали.
`,
      keyPoints: [
        'Делегування: слухачі на кореневому контейнері (з React 17), раніше — на document',
        'SyntheticEvent — обгортка, nativeEvent; pooling прибрано в 17',
        'onChange = нативний input; onFocus/onBlur спливають',
        'touch/wheel — passive; події з порталів спливають по дереву React'
      ],
      followUps: ['Чому перехід з document на root-контейнер важливий для мікрофронтендів?', 'Як змішувати нативні слухачі з React-обробниками?']
    }
  ]
});
