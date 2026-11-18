FE.chapter('events-book', { body: `
Події — як інтерфейс реагує на користувача. Розуміння потоку подій, делегування і прибирання обробників — обов'язкове для будь-якого фронтендера.

## Обробники: addEventListener і зняття

\`\`\`js
function onClick(e) { /* … */ }
btn.addEventListener('click', onClick, { once: true, passive: true, capture: false, signal });
btn.removeEventListener('click', onClick);     // та сама функція і той самий capture
\`\`\`
- кілька обробників однієї події — дозволено (на відміну від \`onclick =\`);
- \`removeEventListener\` потребує **того самого** посилання на функцію (анонімну стрілку не зняти);
- опції: \`once\` (зняти після першого виклику), \`passive\` (обіцянка не викликати \`preventDefault\` — плавний scroll/touch), \`capture\`, \`signal\` (\`AbortController\`: один \`abort()\` знімає всі обробники);
- \`this\` у звичайній функції-обробнику = \`event.currentTarget\`.

## Потік події: capture, target, bubbling

Три фази: **занурення** (capture) від \`window\` до цілі → **ціль** → **спливання** (bubble) від цілі вгору.
- \`event.target\` — де подія виникла (найглибший елемент); \`event.currentTarget\` — на якому елементі зараз обробник;
- \`stopPropagation()\` — зупинити подальше поширення (інші обробники **цього** елемента виконаються); \`stopImmediatePropagation()\` — і їх теж;
- **не спливають:** \`focus\`/\`blur\` (є \`focusin\`/\`focusout\`), \`mouseenter\`/\`mouseleave\` (є \`mouseover\`/\`mouseout\`), \`load\`, \`scroll\` на елементах; їх можна ловити на фазі занурення;
- зловживання \`stopPropagation\` ламає делегування і аналітику.

## Делегування подій

Один обробник на предку замість сотні на елементах:
\`\`\`js
list.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn || !list.contains(btn)) return;
  const id = btn.closest('li').dataset.id;
  if (btn.dataset.action === 'remove') removeItem(id);
});
\`\`\`
Переваги: менше пам'яті, працює для елементів, доданих пізніше, простіше прибирати. \`closest\` потрібен, бо \`target\` може бути вкладеним елементом (іконкою в кнопці). Так React вішає обробники на корінь застосунку.

## Форми і дії за замовчуванням

- \`event.preventDefault()\` скасовує дію браузера: перехід за посиланням, відправку форми, вставку символу, контекстне меню; перевірка — \`event.defaultPrevented\`;
- обробляйте \`submit\` на **формі** (не \`click\` на кнопці): ловить і Enter у полі; \`new FormData(form)\` збирає значення за \`name\`;
- \`form.requestSubmit()\` — програмна відправка з валідацією і подією \`submit\` (на відміну від \`submit()\`);
- \`passive\`-обробник не може скасувати дію (попередження в консолі).

## Клавіатура і ввід у реальному часі

- \`keydown\` (повторюється при утриманні — \`e.repeat\`), \`keyup\`; \`keypress\` застарів;
- \`e.key\` — значення з урахуванням розкладки (\`'a'\`, \`'ф'\`, \`'Enter'\`, \`'Escape'\`); \`e.code\` — фізична клавіша (\`'KeyA'\`) — для гарячих клавіш у іграх; модифікатори \`ctrlKey\`, \`metaKey\`, \`shiftKey\`, \`altKey\`;
- **ввід:** \`input\` — на кожну зміну значення (набір, вставка, автозаповнення, голосовий ввід), \`change\` — при підтвердженні (втрата фокусу, вибір у select); для клавіатури не покладайтесь на \`keydown\` для отримання тексту;
- **IME** (китайська, японська…): \`compositionstart/end\`, \`e.isComposing\` — не реагувати на Enter під час композиції;
- пошук під час введення — \`input\` + debounce + скасування застарілих запитів.

## Фокус, неспливаючі події, модалки й меню

- \`focus\`/\`blur\` не спливають — для делегування \`focusin\`/\`focusout\` (і \`e.relatedTarget\` — куди пішов фокус: закрити меню, якщо фокус вийшов за його межі);
- \`document.activeElement\` — елемент з фокусом; \`el.focus({ preventScroll: true })\`;
- **модалка:** фокус усередину при відкритті, Tab не виходить назовні (focus trap або \`inert\` на решті сторінки), Esc закриває, фокус повертається на кнопку-відкривач — або нативний \`<dialog>\`;
- **закриття меню по кліку зовні:** обробник на \`document\` + \`!menu.contains(e.target)\` (або popover API);
- \`pointerdown\` раніше за \`focus\` і \`click\` — порядок подій миші: \`pointerdown → mousedown → focus → pointerup → mouseup → click\`.

## Кастомні події і EventTarget

\`\`\`js
el.dispatchEvent(new CustomEvent('cart:add', { detail: { id: 42 }, bubbles: true, composed: true }));
class Store extends EventTarget {
  set(v) { this.value = v; this.dispatchEvent(new Event('change')); }
}
\`\`\`
- \`CustomEvent\` з \`detail\` — зв'язок компонентів без прямих залежностей; \`bubbles: true\` — для делегування, \`composed: true\` — вийти з Shadow DOM;
- \`dispatchEvent\` **синхронний**: обробники виконуються одразу; повертає \`false\`, якщо подію скасовано (\`cancelable\` + \`preventDefault\`);
- \`EventTarget\` можна наслідувати — легка шина подій без бібліотек (працює й у воркерах).

## Прибирання обробників і під капотом

- обробник на \`window\`/\`document\`, не знятий при знищенні компонента, тримає замикання компонента — **витік пам'яті** і дубльовані реакції; \`AbortController\` + \`signal\` — один \`abort()\` для всіх;
- **таймери й спостерігачі** — так само: \`clearInterval\`, \`observer.disconnect()\`;
- **під капотом:** події з'являються в черзі задач; кожен обробник — частина задачі, після якої виконуються мікрозадачі й можливий рендеринг; довгий обробник погіршує **INP**;
- високочастотні події (\`scroll\`, \`pointermove\`, \`resize\`) — \`passive\`, \`requestAnimationFrame\`, throttle; або спостерігачі (\`IntersectionObserver\`, \`ResizeObserver\`) замість ручних обробників;
- \`isTrusted\` — чи подія від користувача, а не з \`dispatchEvent\`.

## Типові питання

- **Опишіть фази поширення події.**
- **target vs currentTarget.**
- **Що таке делегування і навіщо closest?**
- **preventDefault vs stopPropagation.**
- **key vs code; input vs change.**
- **Які події не спливають і як їх делегувати?**
- **Як уникнути витоків з обробниками?**
`});
