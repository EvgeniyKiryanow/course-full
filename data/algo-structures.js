/*
 * Тема: Структури даних (стек, черга, зв'язний список, дерева, BST, купа, графи, trie).
 * Обгорнуто в IIFE, щоб хелпери для тестів не потрапляли в глобальну область.
 */
(function () {
  // Хелпер: розмір структури — і метод size(), і геттер size.
  var SZ = 'const sz = (o) => (typeof o.size === "function" ? o.size() : o.size);\n';

  // Хелпери для зв'язних списків: вузли { val, next }.
  var LIST = [
    'const list = (arr) => arr.reduceRight((next, val) => ({ val, next }), null);',
    'const toArr = (h) => { const r = []; let guard = 0; while (h && guard++ < 1e6) { r.push(h.val); h = h.next; } return r; };',
    'const bigList = (n) => { let head = null; for (let i = n - 1; i >= 0; i--) head = { val: i, next: head }; return head; };',
    ''
  ].join('\n');

  // Хелпери для дерев: вузли { val, left, right }, побудова з level-order масиву (як на LeetCode).
  var TREE = [
    'const node = (val, left = null, right = null) => ({ val, left, right });',
    'const tree = (arr) => {',
    '  if (!arr.length || arr[0] == null) return null;',
    '  const root = node(arr[0]); const q = [root]; let i = 1, h = 0;',
    '  while (i < arr.length && h < q.length) {',
    '    const cur = q[h++];',
    '    if (arr[i] != null) { cur.left = node(arr[i]); q.push(cur.left); } i++;',
    '    if (i < arr.length && arr[i] != null) { cur.right = node(arr[i]); q.push(cur.right); } i++;',
    '  }',
    '  return root;',
    '};',
    'const toLevel = (root) => {',
    '  const out = []; const q = [root]; let h = 0;',
    '  while (h < q.length) { const n = q[h++]; if (n) { out.push(n.val); q.push(n.left, n.right); } else out.push(null); }',
    '  while (out.length && out[out.length - 1] === null) out.pop();',
    '  return out;',
    '};',
    'const balanced = (lo, hi) => { if (lo > hi) return null; const m = (lo + hi) >> 1; return node(m, balanced(lo, m - 1), balanced(m + 1, hi)); };',
    'const findNode = (root, v) => { const st = [root]; while (st.length) { const n = st.pop(); if (!n) continue; if (n.val === v) return n; st.push(n.left, n.right); } return null; };',
    ''
  ].join('\n');

  FE.topic('algo-structures', {
    intro: `
## Складність операцій

| Структура | Доступ | Пошук | Вставка | Видалення | Нотатки |
|---|---|---|---|---|---|
| Масив | O(1) | O(n) | \`push\` O(1)*, у середину O(n) | \`pop\` O(1), \`shift\`/\`splice\` O(n) | *амортизовано |
| Стек | top O(1) | — | \`push\` O(1) | \`pop\` O(1) | LIFO |
| Черга (2 стеки / кільцевий буфер) | front O(1) | — | O(1) | O(1)* | FIFO; **не** \`shift\` |
| Зв'язний список | O(n) | O(n) | O(1) за відомим вузлом | O(1) за попереднім вузлом | немає індексів |
| Map / Set | — | O(1) сер. | O(1) | O(1) | гірший випадок O(n) |
| BST (збалансоване) | — | O(log n) | O(log n) | O(log n) | вироджене → O(n) |
| Купа (binary heap) | min O(1) | O(n) | O(log n) | \`pop\` O(log n) | побудова O(n) |
| Trie | — | O(L) | O(L) | O(L) | L — довжина слова |

Графи: BFS / DFS — **O(V + E)** часу, O(V) пам'яті. Дейкстра з купою — **O((V + E) log V)**.

## Якщо бачите X → думайте Y

- Парні дужки, «скасувати» (undo), «повернутися назад» → **стек**.
- «Наступний більший / менший», «скільки днів чекати» → **монотонний стек**.
- Обробка в порядку надходження, «по рівнях», найкоротший шлях **без ваг** → **черга / BFS**.
- Цикл у списку, середина, n-й з кінця → **два вказівники fast / slow**.
- Злиття списків, видалення голови → **dummy-вузол**.
- Висота, діаметр, баланс дерева → **post-order DFS** (рахуємо від дітей до батька).
- BST → **in-order обхід дає відсортований порядок**.
- «Top K», «k-й найбільший», злиття k списків, медіана потоку → **купа**.
- Залежності, порядок збирання, розклад курсів → **топологічне сортування**.
- Острови, зв'язні компоненти, flood fill → **DFS / BFS по сітці**.
- Найкоротший шлях з вагами ≥ 0 → **Дейкстра**.
- Префікси, автодоповнення → **trie**.

## Шаблони

\`\`\`js
// Монотонний стек (зберігаємо індекси, значення спадають)
const res = new Array(n).fill(-1), st = [];
for (let i = 0; i < n; i++) {
  while (st.length && a[st[st.length - 1]] < a[i]) res[st.pop()] = a[i];
  st.push(i);
}

// fast / slow вказівники
let slow = head, fast = head;
while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }

// BFS: черга на масиві з індексом голови — без shift()
const q = [start], seen = new Set([start]);
for (let h = 0; h < q.length; h++) {
  for (const nb of graph[q[h]]) if (!seen.has(nb)) { seen.add(nb); q.push(nb); }
}

// Ітеративний DFS — не впаде на глибоких структурах
const stack = [root];
while (stack.length) {
  const cur = stack.pop();
  if (!cur) continue;
  stack.push(cur.right, cur.left);
}
\`\`\`

## Типові пастки

- \`queue.shift()\` у циклі → O(n²) замість O(n).
- Рекурсія на глибині ~10⁴+ → \`RangeError: Maximum call stack size exceeded\`. Для глибоких структур — явний стек.
- Забутий \`visited\` у графі → нескінченний цикл.
- Валідація BST лише «лівий < вузол < правий» по батьку — неправильно, потрібні межі (min, max).
- Втрата посилання \`next\` під час розвороту списку — зберігайте \`next\` у змінну **до** перепризначення.
`,
  groups: [
    { id: "stack", title: "Стек і монотонний стек" },
    { id: "queue", title: "Черга" },
    { id: "linked-list", title: "Зв'язний список" },
    { id: "trees", title: "Бінарні дерева: обходи" },
    { id: "bst", title: "Бінарне дерево пошуку" },
    { id: "heap", title: "Купа і черга з пріоритетом" },
    { id: "graphs", title: "Графи: BFS, DFS, топосорт" },
    { id: "trie", title: "Префіксне дерево (Trie)" }
  ],
    items: [
      // ===================================================== СТЕК
      {
        id: 'ds-theory-stack-queue', group: "stack", why: ["Так: shift зсуває всі елементи — для черги краще індекс-голова або два стеки.","Ні: call stack — LIFO: першою завершується остання викликана.","Ні: мікрозадачі — FIFO-черга.","Ні: undo/redo — два стеки (LIFO).","Ні: push/pop з кінця — O(1), масив чудовий стек."],
        type: 'theory',
        level: 1,
        interview: true,
        title: 'Стек vs черга: різниця і де вони у фронтенді',
        tags: ['stack', 'queue'],
        question: 'Чим стек відрізняється від черги? Наведіть приклади, де ці структури зустрічаються у фронтенді та в самому JavaScript. Як ефективно реалізувати їх у JS?',
        choices: [
          'Черга на масиві з `shift()` дає O(n) на `dequeue`, тож краще індекс голови або два стеки',
          'Call stack рушія працює як черга: функція, викликана першою, першою ж і завершує виконання',
          'Черга мікрозадач в event loop — це стек: останній доданий колбек виконується першим',
          'Undo/redo в редакторі реалізують однією чергою: першою скасовується найстаріша дія',
          'Масив погано підходить для стека: `push` і `pop` з кінця коштують O(n) через зсув елементів',
        ],
        correct: 0,
        hint: 'LIFO vs FIFO. Згадайте call stack, event loop, історію браузера, BFS.',
        answer: `
**Стек (stack)** — LIFO (Last In, First Out): останній доданий виходить першим. Операції: \`push\`, \`pop\`, \`peek\` — усі O(1).

**Черга (queue)** — FIFO (First In, First Out): перший доданий виходить першим. Операції: \`enqueue\`, \`dequeue\`, \`front\` — мають бути O(1).

**Де у фронтенді та JS:**
- **Call stack** рушія — стек викликів функцій; переповнення → \`RangeError: Maximum call stack size exceeded\`.
- **Event loop**: черга макрозадач (task queue) і черга мікрозадач (microtask queue) — FIFO.
- Undo/redo у редакторі — два стеки; історія навігації (back/forward) — теж стеки.
- Парсинг: перевірка дужок, HTML-тегів, обчислення виразів — стек.
- BFS по DOM-дереву чи графу, черга запитів з обмеженням паралельності, черга анімацій — черга.

**Реалізація в JS:**
\`\`\`js
// Стек — звичайний масив: push/pop з кінця — O(1)
const stack = [];
stack.push(1); stack.pop();

// Черга — НЕ shift(): він зсуває всі елементи, O(n)
class Queue {
  #items = []; #head = 0;
  enqueue(x) { this.#items.push(x); }
  dequeue() {
    if (this.#head === this.#items.length) return undefined;
    const x = this.#items[this.#head++];
    if (this.#head > 1024 && this.#head * 2 > this.#items.length) { // періодичне ущільнення
      this.#items = this.#items.slice(this.#head); this.#head = 0;
    }
    return x;
  }
}
\`\`\`
Альтернативи для черги: два стеки (амортизовано O(1)), кільцевий буфер фіксованого розміру, зв'язний список з \`head\`/\`tail\`.

**Пастка:** \`array.shift()\` у циклі BFS на великих даних дає O(n²). Рушії інколи оптимізують \`shift\`, але гарантій немає.
`,
        keyPoints: [
          'Стек — LIFO, черга — FIFO; основні операції мають бути O(1)',
          'Call stack — стек; черги макро- та мікрозадач у event loop — черги',
          'Практичні приклади: undo/redo, історія, дужки, BFS, черга запитів',
          'Стек у JS — масив з push/pop',
          'Черга — індекс голови, два стеки або кільцевий буфер, а не shift() (O(n))'
        ],
        followUps: [
          'Як реалізувати чергу через два стеки і чому це амортизовано O(1)?',
          'Що таке deque і як його реалізувати?',
          'Як працює undo/redo через два стеки?'
        ]
      },
      {
        id: 'ds-stack-class', group: "stack",
        type: 'code',
        level: 1,
        title: 'Реалізувати клас Stack',
        tags: ['stack', 'class'],
        description: `
**Завдання.** Реалізуйте клас \`Stack\` (LIFO):

**Де трапляється:** undo-історія, навігація «назад», парсери.

- \`push(x)\` — додає елемент, повертає новий розмір;
- \`pop()\` — видаляє і повертає верхній елемент (\`undefined\`, якщо стек порожній);
- \`peek()\` — повертає верхній елемент **без** видалення (\`undefined\`, якщо порожній);
- \`isEmpty()\` — \`true\`, якщо стек порожній;
- \`size\` — кількість елементів (геттер \`get size()\` або метод \`size()\` — обидва варіанти приймаються).

Усі операції — **O(1)**. Внутрішні дані бажано приховати (\`#private\` поле).

\`\`\`js
const s = new Stack();
s.push(1); s.push(2);
s.peek();    // 2
s.pop();     // 2
s.size;      // 1
\`\`\`

**Як це працює:** Стек — LIFO: останнім поклали, першим забрали. Усередині масив, де «вершина» — його кінець: push і pop з кінця працюють за O(1). peek дивиться на останній елемент, не видаляючи його.
`,
        starter: `// План:
// 1. Усередині масив, вершина — його кінець
// 2. push/pop з кінця; peek — останній елемент без видалення
// 3. isEmpty і size — за довжиною масиву

class Stack {
  push(x) {
    // TODO
  }
  pop() {
    // TODO
  }
  peek() {
    // TODO
  }
  isEmpty() {
    // TODO
  }
  get size() {
    // TODO
  }
}
`,
        solution: `class Stack {
  #items = [];

  push(x) {
    this.#items.push(x);
    return this.#items.length;
  }

  pop() {
    return this.#items.pop(); // для порожнього масиву повертає undefined
  }

  peek() {
    return this.#items[this.#items.length - 1];
  }

  isEmpty() {
    return this.#items.length === 0;
  }

  get size() {
    return this.#items.length;
  }
}
`,
        hints: [
          "Під капотом достатньо звичайного масиву: кінець масиву — це верх стеку.",
          "`Array.prototype.push` і `pop` працюють з кінцем масиву за O(1). `peek` — це просто останній елемент: `items[items.length - 1]`.",
          "Оголосіть `#items = []` як приватне поле класу, а `size` зробіть геттером `get size() { return this.#items.length; }`."
        ],
        tests: [
          { name: 'push/pop працюють у порядку LIFO', code: 'const s = new Stack();\ns.push(1); s.push(2); s.push(3);\nexpect(s.pop()).toBe(3);\nexpect(s.pop()).toBe(2);\nexpect(s.pop()).toBe(1);' },
          { name: 'push повертає новий розмір', code: 'const s = new Stack();\nexpect(s.push("a")).toBe(1);\nexpect(s.push("b")).toBe(2);' },
          { name: 'pop і peek на порожньому стеку повертають undefined', code: 'const s = new Stack();\nexpect(s.pop()).toBeUndefined();\nexpect(s.peek()).toBeUndefined();\nexpect(s.isEmpty()).toBe(true);' },
          { name: 'peek не видаляє елемент', code: SZ + 'const s = new Stack();\ns.push(10);\nexpect(s.peek()).toBe(10);\nexpect(s.peek()).toBe(10);\nexpect(sz(s)).toBe(1);' },
          { name: 'size та isEmpty оновлюються', code: SZ + 'const s = new Stack();\nexpect(sz(s)).toBe(0);\ns.push(0); s.push(null);\nexpect(sz(s)).toBe(2);\nexpect(s.isEmpty()).toBe(false);\ns.pop(); s.pop();\nexpect(s.isEmpty()).toBe(true);' },
          { name: 'екземпляри незалежні', code: SZ + 'const a = new Stack(), b = new Stack();\na.push(1);\nexpect(sz(b)).toBe(0);\nexpect(b.pop()).toBeUndefined();' },
          { name: '10^5 операцій виконуються швидко (O(1) на операцію)', code: 'const s = new Stack();\nconst t0 = performance.now();\nfor (let i = 0; i < 1e5; i++) s.push(i);\nlet sum = 0;\nfor (let i = 0; i < 1e5; i++) sum += s.pop();\nexpect(s.isEmpty()).toBe(true);\nexpect(sum).toBe(4999950000);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** стек на масиві — верх стеку = кінець масиву.

**Складність:** \`push\`/\`pop\`/\`peek\`/\`size\` — O(1) (\`push\` амортизовано: масив інколи перевиділяє пам'ять, але в середньому O(1)). Пам'ять — O(n).

**Чому не \`unshift\`/\`shift\`:** робота з початком масиву зсуває всі індекси — O(n) на операцію.

**Типові помилки:**
- \`peek\` через \`pop\` + \`push\` — працює, але зайве;
- публічне поле \`items\` — будь-хто може зламати інваріант ззовні;
- \`size\` як поле, яке забули оновити в одному з методів.

**Що можуть спитати далі:** реалізуйте стек на зв'язному списку; як зробити \`getMin()\` за O(1) (див. наступні задачі); де у браузері використовується стек (call stack, history).
`
      },
      {
        id: 'ds-valid-parentheses', group: "stack",
        type: 'code',
        level: 1,
        interview: true,
        title: 'Валідні дужки',
        tags: ['stack', 'strings'],
        description: `
**Завдання.** Напишіть \`isValid(s)\`: рядок \`s\` містить лише символи \`()[]{}\`. Поверніть \`true\`, якщо дужки збалансовані:

**Де трапляється:** валідація виразів і розмітки; класика співбесід.

- кожна відкрита дужка закрита дужкою **того ж типу**;
- дужки закриваються у **правильному порядку**.

\`\`\`js
isValid('()[]{}'); // true
isValid('{[]}');   // true
isValid('(]');     // false
isValid('([)]');   // false
isValid('');       // true
\`\`\`

Обмеження: довжина до 10⁵ — потрібне рішення за O(n).

**Як це працює:** Відкриваючі дужки кладемо в стек. Закриваюча має збігтися з вершиною стека — тоді знімаємо її, інакше рядок невалідний. Наприкінці стек має бути порожнім.
`,
        starter: `function isValid(s) {
  // 1. Мапа пар: ')' → '(' тощо; порожній стек
  // 2. Відкриваючу — у стек; закриваюча має збігтися з pop()
  // 3. Наприкінці стек порожній?
  // TODO
}
`,
        solution: `function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (ch in pairs) {
      // закриваюча: на вершині має бути відповідна відкрита
      if (stack.pop() !== pairs[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0; // усі відкриті мають бути закриті
}
`,
        hints: [
          "Остання відкрита дужка має закритися першою — це LIFO, тобто стек.",
          "Відкриті дужки кладіть у стек. Для закриваючої — дістаньте вершину і перевірте, що це відповідна відкрита.",
          "Зробіть мапу `{ ')': '(', ']': '[', '}': '{' }`. Наприкінці стек має бути порожнім — інакше лишились незакриті дужки."
        ],
        tests: [
          "expect(isValid('()')).toBe(true)",
          "expect(isValid('()[]{}')).toBe(true)",
          "expect(isValid('{[()()]}')).toBe(true)",
          { name: 'неправильний тип дужки', code: "expect(isValid('(]')).toBe(false);" },
          { name: 'неправильний порядок закриття', code: "expect(isValid('([)]')).toBe(false);" },
          { name: 'порожній рядок — валідний', code: "expect(isValid('')).toBe(true);" },
          { name: 'лишились незакриті дужки', code: "expect(isValid('((')).toBe(false);\nexpect(isValid('(')).toBe(false);" },
          { name: 'закриваюча без відкритої', code: "expect(isValid(')')).toBe(false);\nexpect(isValid('())')).toBe(false);" },
          { name: '10^5 вкладених дужок — O(n)', code: "const s = '('.repeat(50000) + ')'.repeat(50000);\nconst t0 = performance.now();\nexpect(isValid(s)).toBe(true);\nexpect(isValid(s + '(')).toBe(false);\nexpect(performance.now() - t0).toBeLessThan(1000);" }
        ],
        explanation: `
**Патерн:** стек для вкладених структур («остання відкрита — перша закрита»).

**Ідея:**
1. Йдемо по рядку зліва направо.
2. Відкрита дужка → \`push\`.
3. Закриваюча → \`pop\` і порівнюємо з очікуваною відкритою. Порожній стек дає \`undefined\` — теж \`false\`.
4. Наприкінці стек має бути порожнім.

**Складність:** час O(n), пам'ять O(n) (у гіршому випадку всі дужки відкриті).

**Brute force:** у циклі видаляти \`'()'\`, \`'[]'\`, \`'{}'\` через \`replace\`, поки рядок змінюється — O(n²). Для одного типу дужок досить лічильника (O(1) пам'яті), але для кількох типів лічильники не ловлять \`'([)]'\`.

**Типові помилки:**
- забули перевірити, що стек порожній наприкінці (\`'(('\` → \`true\`);
- не обробили закриваючу дужку при порожньому стеку;
- лічильники замість стеку для кількох типів.

**Що можуть спитати далі:** а якщо в рядку є інші символи (ігнорувати їх)? Мінімальна кількість дужок, яку треба додати, щоб рядок став валідним? Найдовша валідна підпослідовність дужок? Як перевірити вкладеність HTML-тегів?
`
      },
      {
        id: 'ds-min-stack', group: "stack",
        type: 'code',
        level: 2,
        title: 'Min Stack: getMin за O(1)',
        tags: ['stack', 'design'],
        description: `
**Завдання.** Реалізуйте клас \`MinStack\`, у якому **всі** операції працюють за O(1):

**Де трапляється:** класика співбесід про O(1) з додатковим стеком.

- \`push(x)\` — додати елемент;
- \`pop()\` — видалити і повернути верхній елемент (\`undefined\` для порожнього);
- \`top()\` — верхній елемент (\`undefined\` для порожнього);
- \`getMin()\` — мінімальний елемент у стеку (\`undefined\` для порожнього).

\`\`\`js
const s = new MinStack();
s.push(-2); s.push(0); s.push(-3);
s.getMin(); // -3
s.pop();
s.top();    // 0
s.getMin(); // -2
\`\`\`

**Як це працює:** Поруч з основним стеком тримаємо стек мінімумів: при push кладемо min(x, поточний мінімум), при pop знімаємо з обох. Тоді getMin — просто вершина другого стека.
`,
        starter: `// План:
// 1. Два масиви: значення і мінімуми
// 2. push: у мінімуми кладемо min(x, поточний мінімум)
// 3. pop знімає з обох; getMin — вершина мінімумів

class MinStack {
  push(x) {
    // TODO
  }
  pop() {
    // TODO
  }
  top() {
    // TODO
  }
  getMin() {
    // TODO
  }
}
`,
        solution: `class MinStack {
  #items = [];
  #mins = []; // mins[i] — мінімум серед items[0..i]

  push(x) {
    const curMin = this.#mins.length ? this.#mins[this.#mins.length - 1] : x;
    this.#items.push(x);
    this.#mins.push(Math.min(curMin, x));
  }

  pop() {
    this.#mins.pop();
    return this.#items.pop();
  }

  top() {
    return this.#items[this.#items.length - 1];
  }

  getMin() {
    return this.#mins[this.#mins.length - 1];
  }
}
`,
        hints: [
          "Мінімум треба не шукати, а пам'ятати. Але після `pop` мінімум може змінитися — що тоді?",
          "Зберігайте другий стек: для кожної позиції — мінімум серед усіх елементів від дна до неї включно.",
          "При `push(x)` у стек мінімумів кладіть `Math.min(x, поточнийМін)`, при `pop` — знімайте з обох стеків одночасно."
        ],
        tests: [
          { name: 'приклад з умови', code: 'const s = new MinStack();\ns.push(-2); s.push(0); s.push(-3);\nexpect(s.getMin()).toBe(-3);\nexpect(s.pop()).toBe(-3);\nexpect(s.top()).toBe(0);\nexpect(s.getMin()).toBe(-2);' },
          { name: 'дублікати мінімуму', code: 'const s = new MinStack();\ns.push(0); s.push(1); s.push(0);\nexpect(s.getMin()).toBe(0);\ns.pop();\nexpect(s.getMin()).toBe(0);\ns.pop();\nexpect(s.getMin()).toBe(0);' },
          { name: 'мінімум відновлюється після pop', code: 'const s = new MinStack();\ns.push(5); s.push(3); s.push(7); s.push(1);\nexpect(s.getMin()).toBe(1);\ns.pop();\nexpect(s.getMin()).toBe(3);\ns.pop(); s.pop();\nexpect(s.getMin()).toBe(5);' },
          { name: 'порожній стек повертає undefined', code: 'const s = new MinStack();\nexpect(s.getMin()).toBeUndefined();\nexpect(s.top()).toBeUndefined();\nexpect(s.pop()).toBeUndefined();\ns.push(1); s.pop();\nexpect(s.getMin()).toBeUndefined();' },
          { name: 'getMin працює за O(1) на 10^5 елементах', code: 'const s = new MinStack();\nconst t0 = performance.now();\nlet acc = 0;\nfor (let i = 0; i < 1e5; i++) { s.push(1e5 - i); acc += s.getMin(); }\nfor (let i = 0; i < 1e5; i++) { acc += s.getMin(); s.pop(); }\nexpect(acc).toBeGreaterThan(0);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** допоміжний стек (augmented stack) — зберігаємо разом з кожним елементом агреговану інформацію про все, що під ним.

**Ідея:** \`mins[i] = min(items[0..i])\`. Коли знімаємо елемент — знімаємо і його мінімум, а під ним уже лежить правильний мінімум для решти стеку.

**Складність:** усі операції O(1), пам'ять O(n).

**Brute force:** \`getMin\` через \`Math.min(...items)\` — O(n) на виклик, O(n²) на серію викликів; ще й \`Math.min(...arr)\` на дуже великих масивах може впасти через ліміт аргументів.

**Оптимізація пам'яті:** у \`mins\` класти значення лише коли \`x <= поточнийМін\` і знімати, коли \`pop\` повертає саме мінімум. Пастка — саме \`<=\`, а не \`<\`: інакше дублікати мінімуму зламають логіку.

**Типові помилки:**
- одна змінна \`min\` замість стеку — після \`pop\` мінімуму неможливо відновити попередній;
- порівняння \`<\` замість \`<=\` в оптимізованому варіанті.

**Що можуть спитати далі:** MaxStack з \`popMax()\`; черга з \`getMin\` за O(1) (дві MinStack або монотонна deque); як це пов'язано з sliding window maximum.
`
      },
      {
        id: 'ds-eval-rpn', group: "stack",
        type: 'code',
        level: 2,
        title: 'Обчислити вираз у зворотному польському записі (RPN)',
        tags: ['stack', 'parsing'],
        description: `
**Завдання.** Напишіть \`evalRPN(tokens)\`, що обчислює вираз у зворотному польському записі (Reverse Polish Notation, постфіксна нотація). \`tokens\` — масив рядків: цілі числа (можуть бути від'ємними) та оператори \`+\`, \`-\`, \`*\`, \`/\`.

**Де трапляється:** калькулятори та інтерпретатори виразів.

- Ділення — **цілочисельне з відкиданням дробової частини в бік нуля** (\`7 / -2 = -3\`).
- Вираз гарантовано коректний, ділення на нуль немає.

\`\`\`js
evalRPN(['2', '1', '+', '3', '*']);  // (2 + 1) * 3 = 9
evalRPN(['4', '13', '5', '/', '+']); // 4 + 13 / 5 = 6
evalRPN(['42']);                     // 42
\`\`\`

**Як це працює:** Числа кладемо в стек. Оператор знімає два верхні числа (спершу b, потім a), обчислює a op b і кладе результат назад. Наприкінці в стеку лишається відповідь.
`,
        starter: `function evalRPN(tokens) {
  // 1. Стек чисел
  // 2. Оператор: b = pop(), a = pop(), push(a op b) (ділення — Math.trunc)
  // 3. Відповідь — останній елемент стека
  // TODO
}
`,
        solution: `function evalRPN(tokens) {
  const ops = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => Math.trunc(a / b), // відкидаємо дробову частину в бік нуля
  };
  const stack = [];
  for (const t of tokens) {
    if (t in ops) {
      const b = stack.pop(); // другий операнд знімається ПЕРШИМ
      const a = stack.pop();
      stack.push(ops[t](a, b));
    } else {
      stack.push(Number(t));
    }
  }
  return stack.pop();
}
`,
        hints: [
          "Числа «чекають» на оператор — складайте їх у стек.",
          "Зустріли оператор — зніміть два верхні числа, обчисліть і покладіть результат назад у стек.",
          "Порядок важливий: спочатку знімається ПРАВИЙ операнд (`b`), потім лівий (`a`). Для ділення — `Math.trunc(a / b)`, а не `Math.floor`."
        ],
        tests: [
          "expect(evalRPN(['2', '1', '+', '3', '*'])).toBe(9)",
          "expect(evalRPN(['4', '13', '5', '/', '+'])).toBe(6)",
          { name: 'довгий вираз', code: "expect(evalRPN(['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+'])).toBe(22);" },
          { name: 'одне число', code: "expect(evalRPN(['42'])).toBe(42);\nexpect(evalRPN(['-7'])).toBe(-7);" },
          { name: 'порядок операндів для - та /', code: "expect(evalRPN(['5', '3', '-'])).toBe(2);\nexpect(evalRPN(['12', '4', '/'])).toBe(3);" },
          { name: 'ділення з відкиданням у бік нуля', code: "expect(evalRPN(['7', '-2', '/'])).toBe(-3);\nexpect(evalRPN(['-7', '2', '/'])).toBe(-3);\nexpect(evalRPN(['7', '2', '/'])).toBe(3);" },
          { name: "від'ємні числа як токени", code: "expect(evalRPN(['3', '-4', '+'])).toBe(-1);\nexpect(evalRPN(['-3', '-4', '*'])).toBe(12);" }
        ],
        explanation: `
**Патерн:** стек для обчислення постфіксних виразів.

**Ідея:** операнди йдуть перед оператором, тож коли бачимо оператор — обидва його операнди вже на вершині стеку. Обчислюємо, кладемо результат назад — він стає операндом для наступного оператора.

**Складність:** час O(n), пам'ять O(n).

**Типові помилки:**
- переплутаний порядок операндів (\`b - a\` замість \`a - b\`);
- \`Math.floor\` замість \`Math.trunc\`: \`Math.floor(-3.5) = -4\`, а потрібно \`-3\`;
- перевірка «чи це число» через \`isNaN(t)\` або першим символом: \`'-'\` — оператор, а \`'-4'\` — число. Надійніше перевіряти, чи є токен у мапі операторів;
- \`parseInt\` без radix — ок тут, але \`Number(t)\` чистіше.

**Що можуть спитати далі:** як перетворити інфіксний вираз \`(1 + 2) * 3\` у RPN (алгоритм сортувальної станції, shunting-yard)? Як написати калькулятор з дужками та пріоритетами (Basic Calculator)? Чому RPN не потребує дужок?
`
      },
      {
        id: 'ds-simplify-path', group: "stack",
        type: 'code',
        level: 2,
        title: 'Спростити Unix-шлях',
        tags: ['stack', 'strings'],
        description: `
**Завдання.** Напишіть \`simplifyPath(path)\`: отримує абсолютний Unix-шлях і повертає канонічний:

**Де трапляється:** нормалізація шляхів у роутерах і файлових менеджерах.

- \`.\` — поточна директорія (ігнорується);
- \`..\` — на рівень вгору (у корені — залишаємось у корені);
- кілька \`/\` поспіль рахуються як один;
- будь-яке інше ім'я (включно з \`...\`) — звичайна директорія;
- результат починається з \`/\`, без \`/\` у кінці (крім кореня \`/\`).

\`\`\`js
simplifyPath('/home/');            // '/home'
simplifyPath('/a/./b/../../c/');   // '/c'
simplifyPath('/../');              // '/'
simplifyPath('/home//foo/');       // '/home/foo'
\`\`\`

**Як це працює:** Ділимо шлях по '/': порожні частини і '.' пропускаємо, '..' знімає останню папку зі стека, решту кладемо в стек. Результат — '/' + стек.join('/').
`,
        starter: `function simplifyPath(path) {
  // 1. Розбити по '/'
  // 2. '' і '.' — пропустити, '..' — pop(), інше — push()
  // 3. Повернути '/' + stack.join('/')
  // TODO
}
`,
        solution: `function simplifyPath(path) {
  const stack = [];
  for (const part of path.split('/')) {
    if (part === '' || part === '.') continue; // порожні частини від '//' та '.'
    if (part === '..') stack.pop();             // pop на порожньому стеку безпечний
    else stack.push(part);
  }
  return '/' + stack.join('/');
}
`,
        hints: [
          "Розбийте шлях на частини по `/`. Кожна частина — або «увійти в директорію», або «вийти з неї».",
          "Вхід у директорію — `push`, `..` — `pop`, а `.` і порожні рядки — пропускаємо.",
          "Відповідь — `'/' + stack.join('/')`. Для порожнього стеку це якраз `'/'`."
        ],
        tests: [
          "expect(simplifyPath('/home/')).toBe('/home')",
          "expect(simplifyPath('/a/./b/../../c/')).toBe('/c')",
          { name: '.. у корені залишає в корені', code: "expect(simplifyPath('/../')).toBe('/');\nexpect(simplifyPath('/../../a')).toBe('/a');" },
          { name: 'кілька слешів поспіль', code: "expect(simplifyPath('/home//foo/')).toBe('/home/foo');\nexpect(simplifyPath('///')).toBe('/');" },
          { name: '... — звичайне ім\'я директорії', code: "expect(simplifyPath('/...')).toBe('/...');\nexpect(simplifyPath('/a/.../b/.')).toBe('/a/.../b');" },
          { name: 'складний випадок', code: "expect(simplifyPath('/a/../../b/../c//.//')).toBe('/c');\nexpect(simplifyPath('/a//b////c/d//././/..')).toBe('/a/b/c');" }
        ],
        explanation: `
**Патерн:** стек для «вкладених» переходів (увійти / вийти).

**Ідея:** \`split('/')\` дає частини, серед яких порожні (від \`//\` і крайових слешів). Порожні та \`.\` пропускаємо, \`..\` — знімаємо вершину, решта — кладемо у стек. Стек — це поточний шлях від кореня.

**Складність:** час O(n), пам'ять O(n).

**Типові помилки:**
- регулярки на кшталт \`replace(/\\/[^/]+\\/\\.\\./g, '')\` — легко зламати на \`...\` та ланцюжках \`../..\`;
- \`..\` у корені кидає помилку або дає порожній рядок замість \`'/'\`;
- \`...\` трактується як спецсимвол.

**Що можуть спитати далі:** як підтримати відносні шляхи (\`a/../b\`) і базову директорію (аналог \`path.resolve\`)? Як це застосовується у роутері (нормалізація URL, \`new URL('../x', base)\`)?
`
      },
      {
        id: 'ds-next-greater', group: "stack",
        type: 'code',
        level: 2,
        title: 'Наступний більший елемент (монотонний стек)',
        tags: ['stack', 'monotonic-stack'],
        description: `
**Завдання.** Напишіть \`nextGreater(nums)\`: для кожного елемента поверніть **перший елемент праворуч, строго більший** за нього, або \`-1\`, якщо такого немає.

**Де трапляється:** монотонний стек — частий патерн співбесід.

\`\`\`js
nextGreater([2, 1, 2, 4, 3]); // [4, 2, 4, -1, -1]
nextGreater([5]);             // [-1]
nextGreater([]);              // []
\`\`\`

Обмеження: до 10⁵ елементів — очікується O(n).

**Як це працює:** Монотонний стек індексів, значення в ньому спадають. Новий елемент «закриває» всі менші на вершині — для них він і є наступним більшим. Кожен індекс входить і виходить зі стека один раз: O(n).
`,
        starter: `function nextGreater(nums) {
  // 1. res заповнити -1, стек індексів
  // 2. Поки nums[i] > nums[вершини] — res[pop()] = nums[i]
  // 3. Покласти i у стек
  // TODO
}
`,
        solution: `function nextGreater(nums) {
  const res = new Array(nums.length).fill(-1);
  const stack = []; // індекси елементів, для яких ще не знайшли більшого (значення спадають)
  for (let i = 0; i < nums.length; i++) {
    // поточний елемент — «відповідь» для всіх менших на вершині стеку
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
      res[stack.pop()] = nums[i];
    }
    stack.push(i);
  }
  return res;
}
`,
        hints: [
          "Brute force — для кожного елемента йти праворуч, поки не знайдеться більший: O(n²). Подумайте, яку інформацію можна не перераховувати.",
          "Тримайте стек індексів, для яких відповідь ще не знайдена. Значення в ньому спадають від дна до вершини (монотонний стек).",
          "Для кожного `nums[i]`: поки вершина стеку менша за `nums[i]` — знімайте її і записуйте `res[top] = nums[i]`. Потім `push(i)`. Решта в стеку лишається з `-1`."
        ],
        tests: [
          "expect(nextGreater([2, 1, 2, 4, 3])).toEqual([4, 2, 4, -1, -1])",
          { name: 'порожній масив', code: 'expect(nextGreater([])).toEqual([]);' },
          { name: 'один елемент', code: 'expect(nextGreater([5])).toEqual([-1]);' },
          { name: 'дублікати — потрібен строго більший', code: 'expect(nextGreater([1, 1, 1])).toEqual([-1, -1, -1]);\nexpect(nextGreater([2, 2, 3])).toEqual([3, 3, -1]);' },
          { name: "від'ємні числа", code: 'expect(nextGreater([-5, -2, -3, 0])).toEqual([-2, 0, 0, -1]);' },
          { name: 'зростаючий та спадаючий масиви', code: 'expect(nextGreater([1, 2, 3])).toEqual([2, 3, -1]);\nexpect(nextGreater([3, 2, 1])).toEqual([-1, -1, -1]);' },
          { name: '10^5 спадаючих елементів — O(n)', code: 'const n = 1e5;\nconst a = Array.from({ length: n }, (_, i) => n - i);\na.push(n + 1);\nconst t0 = performance.now();\nconst r = nextGreater(a);\nconst ms = performance.now() - t0;\nexpect(r[0]).toBe(n + 1);\nexpect(r[n - 1]).toBe(n + 1);\nexpect(r[n]).toBe(-1);\nexpect(ms).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** монотонний стек (monotonic stack). Тригери: «наступний / попередній більший / менший», «скільки до першого вищого», «найбільший прямокутник у гістограмі».

**Ідея:**
1. Стек зберігає індекси елементів, які ще «чекають» на більший. Значення в ньому спадають.
2. Новий елемент \`x\` «розв'язує» всі менші за нього елементи на вершині — для них \`x\` і є першим більшим праворуч.
3. Після цього кладемо \`x\` у стек — він теж чекає.

**Складність:** O(n) часу — кожен індекс потрапляє у стек і виходить з нього **щонайбільше один раз** (амортизований аналіз, хоч і є вкладений \`while\`). Пам'ять O(n).

**Brute force:** вкладений цикл праворуч — O(n²); на спадаючому масиві з 10⁵ елементів це ~5·10⁹ порівнянь.

**Типові помилки:**
- зберігати в стеку значення замість індексів — тоді не знаєш, куди записати відповідь;
- \`<=\` замість \`<\` — дублікати отримають «рівний», а не строго більший;
- вважати складність O(n²) через вкладений \`while\`.

**Що можуть спитати далі:** циклічний масив (Next Greater Element II — пройти масив двічі, \`i % n\`); попередній менший елемент; Daily Temperatures; Largest Rectangle in Histogram; Stock Span.
`
      },
      {
        id: 'ds-daily-temperatures', group: "stack",
        type: 'code',
        level: 3,
        title: 'Daily Temperatures',
        tags: ['stack', 'monotonic-stack'],
        description: `
**Завдання.** Напишіть \`dailyTemperatures(temps)\`: для кожного дня поверніть, **скільки днів чекати** до першого строго теплішого дня. Якщо теплішого дня не буде — \`0\`.

**Де трапляється:** класика монотонного стека.

\`\`\`js
dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]);
// [1, 1, 4, 2, 1, 1, 0, 0]
dailyTemperatures([30, 60, 90]); // [1, 1, 0]
\`\`\`

Обмеження: до 10⁵ днів — потрібне O(n).

**Як це працює:** Монотонний стек індексів днів без відповіді. Теплий день знімає зі стека всі холодніші і записує для них різницю індексів. O(n).
`,
        starter: `function dailyTemperatures(temps) {
  // 1. res заповнити 0, стек індексів
  // 2. Поки temps[i] > temps[вершини]: j = pop(), res[j] = i − j
  // 3. Покласти i у стек
  // TODO
}
`,
        solution: `function dailyTemperatures(temps) {
  const res = new Array(temps.length).fill(0);
  const stack = []; // індекси днів без відповіді; температури в стеку не зростають
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack[stack.length - 1]] < temps[i]) {
      const j = stack.pop();
      res[j] = i - j; // відстань між днями
    }
    stack.push(i);
  }
  return res;
}
`,
        hints: [
          "Це та сама задача «наступний більший елемент», тільки відповідь — не значення, а відстань.",
          "Тримайте стек індексів днів, для яких теплішого дня ще не знайдено. Кожен новий день «закриває» всі холодніші на вершині.",
          "При знятті індексу `j` поточним днем `i` запишіть `res[j] = i - j`. Ініціалізуйте результат нулями."
        ],
        tests: [
          "expect(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73])).toEqual([1, 1, 4, 2, 1, 1, 0, 0])",
          "expect(dailyTemperatures([30, 40, 50, 60])).toEqual([1, 1, 1, 0])",
          { name: 'порожній масив і один день', code: 'expect(dailyTemperatures([])).toEqual([]);\nexpect(dailyTemperatures([50])).toEqual([0]);' },
          { name: 'однакові температури — не тепліше', code: 'expect(dailyTemperatures([50, 50, 50])).toEqual([0, 0, 0]);\nexpect(dailyTemperatures([50, 50, 51])).toEqual([2, 1, 0]);' },
          { name: "від'ємні температури", code: 'expect(dailyTemperatures([-10, -20, -5])).toEqual([2, 1, 0]);' },
          { name: '10^5 днів: довгий спад і пік наприкінці — O(n)', code: 'const n = 1e5;\nconst t = Array.from({ length: n }, (_, i) => n - i);\nt.push(1e9);\nconst t0 = performance.now();\nconst r = dailyTemperatures(t);\nconst ms = performance.now() - t0;\nexpect(r[0]).toBe(n);\nexpect(r[n - 1]).toBe(1);\nexpect(r[n]).toBe(0);\nexpect(ms).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** монотонний стек (спадний за значеннями, зберігаємо індекси).

**Ідея:** стек містить «нерозв'язані» дні, температури в ньому не зростають від дна до вершини. Коли приходить тепліший день \`i\`, він є першим теплішим для кожного холоднішого дня на вершині — знімаємо їх і записуємо відстань \`i - j\`.

**Складність:** O(n) часу (кожен індекс \`push\`/\`pop\` рівно по разу), O(n) пам'яті.

**Brute force:** для кожного дня сканувати вперед — O(n²). На тесті з довгим спадом це ~5·10⁹ операцій.

**Альтернатива:** прохід справа наліво з «перестрибуванням» через \`res[j]\` — теж амортизовано O(n), O(1) додаткової пам'яті, якщо температури обмежені — масив \`next[temp]\`.

**Типові помилки:**
- \`<=\` замість \`<\` (однакова температура — не тепліше);
- зберігати в стеку температури, а не індекси;
- ініціалізувати результат \`-1\` замість \`0\`.

**Що можуть спитати далі:** Online Stock Span (обробка потоку, без масиву наперед); Largest Rectangle in Histogram; Trapping Rain Water через стек.
`
      },
      // ===================================================== ЧЕРГА
      {
        id: 'ds-quiz-shift-queue', group: "queue", why: ["Ні: кожен shift — O(n), а їх n.","Ні: логарифма тут немає.","Так: n разів по O(n) зсувів.","Ні: shift не амортизований O(1)."],
        type: 'quiz',
        level: 2,
        title: 'Черга на shift(): яка складність?',
        tags: ['queue', 'complexity'],
        question: `
Яка асимптотична складність цього циклу для масиву з **n** елементів (за специфікацією, не розраховуючи на оптимізації рушія)?

\`\`\`js
while (queue.length) {
  const x = queue.shift();
  process(x); // O(1)
}
\`\`\`
`,
        options: ['`O(n)`', '`O(n log n)`', '`O(n²)`', '`O(1)` амортизовано на операцію, отже `O(n)`'],
        answer: 2,
        hint: 'Що відбувається з індексами решти елементів після видалення першого?',
        explanation: `
\`shift()\` видаляє елемент з індексом 0, після чого **всі інші елементи зсуваються** на одну позицію вліво (\`a[1] → a[0]\`, \`a[2] → a[1]\`…). Це O(k), де k — поточна довжина. Сума \`n + (n-1) + … + 1\` = **O(n²)**.

- \`O(n)\` і «амортизовано O(1)» — так працює \`pop()\` з кінця або черга з індексом голови, але не \`shift()\`.
- \`O(n log n)\` — немає жодного поділу навпіл чи сортування.

V8 інколи оптимізує \`shift\` для невеликих масивів (left-trimming), але це деталь реалізації без гарантій. Для BFS і черг на великих даних використовуйте **індекс голови** (\`for (let h = 0; h < q.length; h++)\`), **дві стеки** або **кільцевий буфер**.
`
      },
      {
        id: 'ds-queue-two-stacks', group: "queue",
        type: 'code',
        level: 2,
        title: 'Черга через два стеки (амортизовано O(1))',
        tags: ['queue', 'stack', 'amortized'],
        description: `
**Завдання.** Реалізуйте клас \`MyQueue\` (FIFO), використовуючи **лише два масиви як стеки** — тільки \`push\`, \`pop\`, \`length\` і доступ до останнього елемента. \`shift\`, \`unshift\`, \`splice\` — заборонені.

**Де трапляється:** класика співбесід про амортизовану складність.

- \`enqueue(x)\` — додати в кінець черги;
- \`dequeue()\` — видалити і повернути перший елемент (\`undefined\`, якщо порожньо);
- \`peek()\` — перший елемент без видалення (\`undefined\`, якщо порожньо);
- \`isEmpty()\`;
- \`size\` — геттер або метод.

Кожна операція має бути **амортизовано O(1)**.

\`\`\`js
const q = new MyQueue();
q.enqueue(1); q.enqueue(2);
q.peek();     // 1
q.dequeue();  // 1
q.enqueue(3);
q.dequeue();  // 2
\`\`\`

**Як це працює:** Додаємо в стек in, забираємо зі стека out. Коли out порожній — переливаємо все з in (порядок розвертається). Кожен елемент переливається один раз, тож амортизовано O(1).
`,
        starter: `// План:
// 1. Стек in — для додавання, стек out — для забирання
// 2. dequeue/peek: out порожній → перелити все з in
// 3. isEmpty — обидва порожні

class MyQueue {
  enqueue(x) {
    // TODO
  }
  dequeue() {
    // TODO
  }
  peek() {
    // TODO
  }
  isEmpty() {
    // TODO
  }
  get size() {
    // TODO
  }
}
`,
        solution: `class MyQueue {
  #in = [];  // сюди лише додаємо
  #out = []; // звідси лише забираємо (вершина = голова черги)

  enqueue(x) {
    this.#in.push(x);
  }

  // Перекладаємо елементи, лише коли out порожній — тоді порядок перевертається у FIFO
  #shiftStacks() {
    if (this.#out.length === 0) {
      while (this.#in.length) this.#out.push(this.#in.pop());
    }
  }

  dequeue() {
    this.#shiftStacks();
    return this.#out.pop();
  }

  peek() {
    this.#shiftStacks();
    return this.#out[this.#out.length - 1];
  }

  isEmpty() {
    return this.#in.length === 0 && this.#out.length === 0;
  }

  get size() {
    return this.#in.length + this.#out.length;
  }
}
`,
        hints: [
          "Якщо перекласти всі елементи зі стеку в інший стек, їхній порядок перевернеться — LIFO стане FIFO.",
          "Один стек для вхідних елементів (`in`), другий — для вихідних (`out`). `dequeue` бере з `out`.",
          "Перекладайте з `in` в `out` **тільки коли `out` порожній** і не повертайте елементи назад. Тоді кожен елемент переміщується щонайбільше один раз."
        ],
        tests: [
          { name: 'FIFO порядок', code: 'const q = new MyQueue();\nq.enqueue(1); q.enqueue(2); q.enqueue(3);\nexpect(q.dequeue()).toBe(1);\nexpect(q.dequeue()).toBe(2);\nexpect(q.dequeue()).toBe(3);' },
          { name: 'перемежовані enqueue/dequeue', code: 'const q = new MyQueue();\nq.enqueue(1); q.enqueue(2);\nexpect(q.dequeue()).toBe(1);\nq.enqueue(3); q.enqueue(4);\nexpect(q.dequeue()).toBe(2);\nexpect(q.peek()).toBe(3);\nq.enqueue(5);\nexpect([q.dequeue(), q.dequeue(), q.dequeue()]).toEqual([3, 4, 5]);' },
          { name: 'порожня черга', code: 'const q = new MyQueue();\nexpect(q.dequeue()).toBeUndefined();\nexpect(q.peek()).toBeUndefined();\nexpect(q.isEmpty()).toBe(true);' },
          { name: 'size і isEmpty', code: SZ + 'const q = new MyQueue();\nq.enqueue("a"); q.enqueue("b");\nexpect(sz(q)).toBe(2);\nq.dequeue();\nexpect(sz(q)).toBe(1);\nexpect(q.isEmpty()).toBe(false);\nq.dequeue();\nexpect(q.isEmpty()).toBe(true);' },
          { name: 'не використовує shift/unshift/splice', code: "const orig = { shift: Array.prototype.shift, unshift: Array.prototype.unshift, splice: Array.prototype.splice };\nconst ban = () => { throw new Error('заборонений метод масиву'); };\nArray.prototype.shift = ban; Array.prototype.unshift = ban; Array.prototype.splice = ban;\ntry {\n  const q = new MyQueue();\n  for (let i = 0; i < 10; i++) q.enqueue(i);\n  for (let i = 0; i < 5; i++) expect(q.dequeue()).toBe(i);\n  q.enqueue(10);\n  expect(q.peek()).toBe(5);\n} finally {\n  Object.assign(Array.prototype, orig);\n}" },
          { name: '2·10^5 перемежованих операцій — амортизовано O(1)', code: 'const q = new MyQueue();\nconst t0 = performance.now();\nfor (let i = 0; i < 1e5; i++) q.enqueue(i);\nlet next = 0, ok = true;\nfor (let i = 0; i < 1e5; i++) {\n  q.enqueue(1e5 + i);\n  if (q.dequeue() !== next++) ok = false;\n}\nexpect(ok).toBe(true);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** дві стеки → черга; амортизований аналіз (amortized analysis).

**Ідея:** \`in\` приймає нові елементи. Коли треба віддати голову, а \`out\` порожній — перекладаємо все з \`in\` в \`out\`: порядок перевертається, і найстаріший елемент опиняється на вершині \`out\`.

**Чому амортизовано O(1):** кожен елемент за весь час життя один раз потрапляє в \`in\`, один раз переїжджає в \`out\` і один раз виходить — 3–4 операції на елемент. Окремий \`dequeue\` може бути O(n), але сумарно n операцій — O(n).

**Brute force:** перекладати все в \`out\`, взяти голову і перекласти все **назад** — O(n) на кожну операцію, O(n²) разом.

**Типові помилки:**
- перекладання, коли \`out\` ще не порожній — ламає порядок;
- повернення елементів назад у \`in\` після кожного \`dequeue\`;
- \`peek\` без перекладання.

**Що можуть спитати далі:** стек через дві черги; чим амортизована складність відрізняється від середньої; коли такі «спайки» O(n) неприйнятні (real-time, анімації) і що тоді (кільцевий буфер, зв'язний список).
`
      },
      {
        id: 'ds-circular-queue', group: "queue",
        type: 'code',
        level: 3,
        title: 'Кільцевий буфер (circular queue)',
        tags: ['queue', 'ring-buffer', 'design'],
        description: `
**Завдання.** Реалізуйте клас \`CircularQueue\` — чергу **фіксованої місткості** на масиві з «загортанням» індексів (ring buffer):

**Де трапляється:** буфер останніх N подій, логів, аудіо.

- \`constructor(capacity)\`;
- \`enqueue(x)\` — додає в кінець, повертає \`true\`; якщо черга повна — \`false\` (нічого не змінює);
- \`dequeue()\` — видаляє і повертає перший елемент, \`undefined\` для порожньої;
- \`front()\` / \`rear()\` — перший / останній елемент (\`undefined\` для порожньої);
- \`isEmpty()\`, \`isFull()\`;
- \`size\` — геттер або метод.

Усі операції O(1). **Не використовуйте** \`shift\`/\`unshift\`/\`splice\` — індекси голови й хвоста рухаються по колу через \`% capacity\`.

\`\`\`js
const q = new CircularQueue(3);
q.enqueue(1); q.enqueue(2); q.enqueue(3); // true ×3
q.enqueue(4);  // false — повна
q.rear();      // 3
q.dequeue();   // 1
q.enqueue(4);  // true — зайняла звільнене місце
q.rear();      // 4
\`\`\`

**Як це працює:** Масив фіксованого розміру і два числа: head (перший елемент) і count. Позиція нового елемента — (head + count) % capacity, після dequeue head = (head + 1) % capacity. Без зсувів масиву.
`,
        starter: `// План:
// 1. Масив розміру capacity, head і count
// 2. enqueue: повна → false; позиція (head + count) % capacity
// 3. dequeue: порожня → false; head = (head + 1) % capacity
// 4. front/rear/isEmpty/isFull — через head і count

class CircularQueue {
  constructor(capacity) {
    // TODO
  }
  enqueue(x) {
    // TODO
  }
  dequeue() {
    // TODO
  }
  front() {
    // TODO
  }
  rear() {
    // TODO
  }
  isEmpty() {
    // TODO
  }
  isFull() {
    // TODO
  }
  get size() {
    // TODO
  }
}
`,
        solution: `class CircularQueue {
  #buf;
  #head = 0;  // індекс першого елемента
  #count = 0; // кількість елементів (вирішує неоднозначність «порожня vs повна»)

  constructor(capacity) {
    this.#buf = new Array(capacity);
  }

  enqueue(x) {
    if (this.isFull()) return false;
    const tail = (this.#head + this.#count) % this.#buf.length;
    this.#buf[tail] = x;
    this.#count++;
    return true;
  }

  dequeue() {
    if (this.isEmpty()) return undefined;
    const x = this.#buf[this.#head];
    this.#buf[this.#head] = undefined; // не тримаємо посилання (GC)
    this.#head = (this.#head + 1) % this.#buf.length;
    this.#count--;
    return x;
  }

  front() {
    return this.isEmpty() ? undefined : this.#buf[this.#head];
  }

  rear() {
    if (this.isEmpty()) return undefined;
    return this.#buf[(this.#head + this.#count - 1) % this.#buf.length];
  }

  isEmpty() {
    return this.#count === 0;
  }

  isFull() {
    return this.#count === this.#buf.length;
  }

  get size() {
    return this.#count;
  }
}
`,
        hints: [
          "Масив фіксованої довжини + індекс голови. Коли індекс доходить до кінця, він «загортається» на початок: `(i + 1) % capacity`.",
          "Якщо зберігати лише `head` і `tail`, стан «порожня» і «повна» виглядають однаково (`head === tail`). Зберігайте ще й `count`.",
          "Хвіст обчислюється як `(head + count) % capacity`, останній елемент — `(head + count - 1) % capacity`."
        ],
        tests: [
          { name: 'приклад з умови', code: 'const q = new CircularQueue(3);\nexpect(q.enqueue(1)).toBe(true);\nexpect(q.enqueue(2)).toBe(true);\nexpect(q.enqueue(3)).toBe(true);\nexpect(q.enqueue(4)).toBe(false);\nexpect(q.rear()).toBe(3);\nexpect(q.isFull()).toBe(true);\nexpect(q.dequeue()).toBe(1);\nexpect(q.enqueue(4)).toBe(true);\nexpect(q.rear()).toBe(4);\nexpect(q.front()).toBe(2);' },
          { name: 'порожня черга', code: 'const q = new CircularQueue(2);\nexpect(q.isEmpty()).toBe(true);\nexpect(q.dequeue()).toBeUndefined();\nexpect(q.front()).toBeUndefined();\nexpect(q.rear()).toBeUndefined();' },
          { name: 'місткість 1', code: SZ + 'const q = new CircularQueue(1);\nexpect(q.enqueue("a")).toBe(true);\nexpect(q.enqueue("b")).toBe(false);\nexpect(q.front()).toBe("a");\nexpect(q.rear()).toBe("a");\nexpect(q.dequeue()).toBe("a");\nexpect(q.enqueue("c")).toBe(true);\nexpect(sz(q)).toBe(1);' },
          { name: 'багато обертів по колу зберігають FIFO', code: 'const q = new CircularQueue(4);\nconst out = [];\nlet next = 0;\nfor (let round = 0; round < 10; round++) {\n  while (q.enqueue(next)) next++;\n  out.push(q.dequeue(), q.dequeue());\n}\nexpect(out.slice(0, 6)).toEqual([0, 1, 2, 3, 4, 5]);\nexpect(out).toEqual(Array.from({ length: 20 }, (_, i) => i));' },
          { name: 'size оновлюється', code: SZ + 'const q = new CircularQueue(3);\nq.enqueue(1); q.enqueue(2);\nexpect(sz(q)).toBe(2);\nq.dequeue(); q.enqueue(3); q.enqueue(4);\nexpect(sz(q)).toBe(3);\nexpect(q.isFull()).toBe(true);' },
          { name: 'не використовує shift/unshift/splice', code: "const orig = { shift: Array.prototype.shift, unshift: Array.prototype.unshift, splice: Array.prototype.splice };\nconst ban = () => { throw new Error('заборонений метод масиву'); };\nArray.prototype.shift = ban; Array.prototype.unshift = ban; Array.prototype.splice = ban;\ntry {\n  const q = new CircularQueue(3);\n  q.enqueue(1); q.enqueue(2); q.enqueue(3);\n  expect(q.dequeue()).toBe(1);\n  q.enqueue(4);\n  expect([q.dequeue(), q.dequeue(), q.dequeue()]).toEqual([2, 3, 4]);\n} finally {\n  Object.assign(Array.prototype, orig);\n}" }
        ],
        explanation: `
**Патерн:** кільцевий буфер (ring buffer / circular buffer) — модульна арифметика індексів.

**Ідея:** пам'ять виділяється один раз (\`capacity\` слотів). \`head\` вказує на перший елемент, \`count\` — скільки їх. Хвіст = \`(head + count) % capacity\`. Після \`dequeue\` голова зсувається вперед по колу — жодних зсувів масиву.

**Складність:** усі операції O(1), пам'ять O(capacity) — фіксована.

**Порожня vs повна:** з двома індексами \`head === tail\` означає і те, і інше. Рішення: лічильник \`count\` або «один слот завжди вільний».

**Де застосовується:** буфери логів/подій останніх N записів, аудіо/відео-стріми, черги повідомлень у WebSocket-клієнті, обмежена історія undo.

**Типові помилки:**
- \`rear\` як \`buf[tail]\` замість \`buf[(tail - 1 + cap) % cap]\` — промах на 1 і від'ємний індекс;
- не обнуляти слот після \`dequeue\` — об'єкти не звільняються збирачем сміття;
- \`enqueue\` у повну чергу перезаписує голову (якщо це не вимога «перезаписувати найстаріше»).

**Що можуть спитати далі:** зробіть варіант, що перезаписує найстаріший елемент; кільцева deque (додавання з обох боків); як динамічно розширити буфер (копіювання з «розгортанням» з \`head\`).
`
      },
      // ===================================================== ЗВ'ЯЗНИЙ СПИСОК
      {
        id: 'ds-quiz-list-vs-array', group: "linked-list", why: ["Так: новий вузол стає head.","Ні: треба пройти k вузлів.","Так: head = head.next.","Ні: без tail треба дійти до кінця.","Ні: пошук — лінійний прохід.","Так: лише перепривʼязати next."],
        type: 'quiz',
        level: 1,
        title: 'Однозв\'язний список: що за O(1)?',
        tags: ['linked-list', 'complexity'],
        question: 'Оберіть **усі** операції, які в **однозв\'язному** списку (зберігається лише `head`, без `tail`) виконуються за O(1):',
        options: [
          'Вставка на початок',
          'Доступ до k-го елемента',
          'Видалення першого елемента',
          'Вставка в кінець',
          'Пошук вузла за значенням',
          'Вставка після вузла, на який уже є посилання'
        ],
        answer: [0, 2, 5],
        hint: 'O(1) можливо лише тоді, коли не треба йти по ланцюжку `next` від голови.',
        explanation: `
- **Вставка на початок / видалення першого** — лише переприсвоєння \`head\`: O(1).
- **Вставка після відомого вузла** — \`newNode.next = node.next; node.next = newNode\`: O(1).
- **Доступ до k-го** — немає індексів, треба пройти k вузлів: O(k).
- **Вставка в кінець** без \`tail\` — треба дійти до останнього вузла: O(n). З вказівником \`tail\` стає O(1).
- **Пошук за значенням** — лінійний обхід: O(n).

Порівняння з масивом: масив дає O(1) доступ за індексом, але вставка/видалення на початку чи в середині — O(n) через зсув елементів. Списки корисні, коли багато вставок/видалень у відомих місцях (LRU-кеш, черги), а довільний доступ не потрібен. На практиці у JS масиви часто швидші через локальність пам'яті (cache locality).
`
      },
      {
        id: 'ds-linked-list-class', group: "linked-list",
        type: 'code',
        level: 2,
        title: 'Реалізувати клас LinkedList',
        tags: ['linked-list', 'class'],
        description: `
**Завдання.** Реалізуйте однозв'язний список. Вузли — звичайні об'єкти \`{ val, next }\`.

**Де трапляється:** основа LRU-кешу, історії браузера.

- \`head\` — публічне поле: перший вузол або \`null\`;
- \`add(val)\` — додати в **кінець** за **O(1)** (тримайте вказівник \`tail\`);
- \`addFirst(val)\` — додати на початок;
- \`find(val)\` — перший вузол із \`node.val === val\` або \`null\`;
- \`remove(val)\` — видалити **перше** входження, повернути \`true\`/\`false\`;
- \`toArray()\` — масив значень;
- \`size\` — геттер або метод.

\`\`\`js
const list = new LinkedList();
list.add(1); list.add(2); list.addFirst(0);
list.toArray();   // [0, 1, 2]
list.remove(1);   // true
list.find(2);     // { val: 2, next: null }
list.size;        // 2
\`\`\`

**Як це працює:** Кожен вузол { val, next } посилається на наступний. Тримаємо head і tail: додавання в кінець і на початок — O(1), пошук і видалення — прохід від head.
`,
        starter: `// План:
// 1. Вузол { val, next }; тримати head і tail
// 2. add — у кінець через tail; addFirst — новий head
// 3. find і remove — прохід від head (при видаленні оновлювати tail)
// 4. toArray — зібрати значення по next

class LinkedList {
  constructor() {
    this.head = null;
  }
  add(val) {
    // TODO
  }
  addFirst(val) {
    // TODO
  }
  find(val) {
    // TODO
  }
  remove(val) {
    // TODO
  }
  toArray() {
    // TODO
  }
  get size() {
    // TODO
  }
}
`,
        solution: `class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  add(val) {
    const node = { val, next: null };
    if (this.tail) this.tail.next = node;
    else this.head = node; // список був порожній
    this.tail = node;
    this.length++;
    return this;
  }

  addFirst(val) {
    this.head = { val, next: this.head };
    if (!this.tail) this.tail = this.head;
    this.length++;
    return this;
  }

  find(val) {
    for (let cur = this.head; cur; cur = cur.next) {
      if (cur.val === val) return cur;
    }
    return null;
  }

  remove(val) {
    // dummy-вузол прибирає окремий випадок «видаляємо голову»
    const dummy = { val: null, next: this.head };
    let prev = dummy;
    while (prev.next && prev.next.val !== val) prev = prev.next;
    if (!prev.next) return false;
    if (prev.next === this.tail) this.tail = prev === dummy ? null : prev;
    prev.next = prev.next.next;
    this.head = dummy.next;
    this.length--;
    return true;
  }

  toArray() {
    const out = [];
    for (let cur = this.head; cur; cur = cur.next) out.push(cur.val);
    return out;
  }

  get size() {
    return this.length;
  }
}
`,
        hints: [
          "Щоб `add` був O(1), окрім `head` зберігайте `tail` — посилання на останній вузол.",
          "Для `remove` потрібен **попередній** вузол: `prev.next = prev.next.next`. Окремі випадки — видалення голови та видалення хвоста (оновіть `tail`!).",
          "Трюк: dummy-вузол `{ next: head }` перед головою — тоді видалення голови не відрізняється від решти. Не забудьте `this.head = dummy.next` і `tail = prev`, якщо видалили останній."
        ],
        tests: [
          { name: 'add, addFirst і toArray', code: 'const l = new LinkedList();\nl.add(1); l.add(2); l.addFirst(0);\nexpect(l.toArray()).toEqual([0, 1, 2]);\nexpect(l.head.val).toBe(0);' },
          { name: 'порожній список', code: SZ + 'const l = new LinkedList();\nexpect(l.toArray()).toEqual([]);\nexpect(l.find(1)).toBeNull();\nexpect(l.remove(1)).toBe(false);\nexpect(sz(l)).toBe(0);' },
          { name: 'find повертає вузол { val, next }', code: 'const l = new LinkedList();\nl.add("a"); l.add("b");\nconst n = l.find("a");\nexpect(n.val).toBe("a");\nexpect(n.next.val).toBe("b");\nexpect(l.find("z")).toBeNull();' },
          { name: 'remove: голова, середина, перше входження', code: SZ + 'const l = new LinkedList();\n[1, 2, 3, 2, 4].forEach((x) => l.add(x));\nexpect(l.remove(1)).toBe(true);\nexpect(l.toArray()).toEqual([2, 3, 2, 4]);\nexpect(l.remove(2)).toBe(true);\nexpect(l.toArray()).toEqual([3, 2, 4]);\nexpect(l.remove(9)).toBe(false);\nexpect(sz(l)).toBe(3);' },
          { name: 'після видалення хвоста add працює коректно', code: 'const l = new LinkedList();\nl.add(1); l.add(2);\nl.remove(2);\nl.add(3);\nexpect(l.toArray()).toEqual([1, 3]);' },
          { name: 'видалення єдиного елемента і повторне додавання', code: SZ + 'const l = new LinkedList();\nl.add(1);\nl.remove(1);\nexpect(l.head).toBeNull();\nexpect(sz(l)).toBe(0);\nl.add(5); l.addFirst(4);\nexpect(l.toArray()).toEqual([4, 5]);' },
          { name: 'addFirst у порожній, потім add', code: 'const l = new LinkedList();\nl.addFirst(2);\nl.add(3);\nexpect(l.toArray()).toEqual([2, 3]);' },
          { name: '10^5 викликів add — O(1) кожен (є tail)', code: SZ + 'const l = new LinkedList();\nconst t0 = performance.now();\nfor (let i = 0; i < 1e5; i++) l.add(i);\nconst arr = l.toArray();\nconst ms = performance.now() - t0;\nexpect(arr.length).toBe(1e5);\nexpect(arr[99999]).toBe(99999);\nexpect(sz(l)).toBe(1e5);\nexpect(ms).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** зв'язний список з вказівниками \`head\`/\`tail\` + dummy-вузол (sentinel) для видалення.

**Складність:**
| Операція | Час |
|---|---|
| \`add\` (з tail) / \`addFirst\` | O(1) |
| \`find\` / \`remove\` | O(n) |
| \`toArray\` | O(n) |

**Brute force:** без \`tail\` кожен \`add\` іде до кінця — O(n), а n додавань — O(n²) (10⁵ елементів → ~5·10⁹ кроків).

**Типові помилки:**
- не оновили \`tail\` при видаленні останнього вузла → наступний \`add\` «підвішує» вузол до видаленого;
- не обробили видалення голови (без dummy) → \`head\` вказує на видалений вузол;
- забули \`tail\`, коли \`addFirst\` у порожній список;
- лічильник \`size\` не синхронізований з усіма методами.

**Що можуть спитати далі:** двозв'язний список (\`prev\`) — навіщо (O(1) видалення за посиланням на вузол, LRU-кеш); зробіть клас ітерованим (\`*[Symbol.iterator]()\`); \`insertAt(index, val)\`; чому у JS масиви здебільшого швидші за списки (cache locality).
`
      },
      {
        id: 'ds-middle-node', group: "linked-list",
        type: 'code',
        level: 1,
        title: 'Середина зв\'язного списку (fast / slow)',
        tags: ['linked-list', 'two-pointers'],
        description: `
**Завдання.** Напишіть \`middleNode(head)\` — поверніть **середній вузол** однозв'язного списку (\`{ val, next }\`). Якщо вузлів парна кількість — поверніть **другий** із двох середніх. Для порожнього списку — \`null\`.

**Де трапляється:** патерн fast/slow вказівників.

Зробіть це **за один прохід** і O(1) додаткової пам'яті.

\`\`\`text
1 → 2 → 3 → 4 → 5        ⇒ вузол 3
1 → 2 → 3 → 4 → 5 → 6    ⇒ вузол 4
\`\`\`

**Як це працює:** Два вказівники: slow робить крок, fast — два. Коли fast дійде до кінця, slow буде посередині. Один прохід, O(1) пам'яті.
`,
        starter: `function middleNode(head) {
  // 1. slow = fast = head
  // 2. Поки fast і fast.next: slow на 1 крок, fast на 2
  // 3. Повернути slow
  // TODO
}
`,
        solution: `function middleNode(head) {
  let slow = head;
  let fast = head;
  // fast рухається вдвічі швидше: коли він дійде до кінця, slow буде посередині
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}
`,
        hints: [
          "Два вказівники, що рухаються з різною швидкістю.",
          "`slow` робить крок 1, `fast` — крок 2. Коли `fast` дійде до кінця, `slow` пройде рівно половину.",
          "Умова циклу `while (fast && fast.next)` — саме вона для парної довжини дає другий середній вузол."
        ],
        tests: [
          { name: 'непарна довжина', code: LIST + 'expect(toArr(middleNode(list([1, 2, 3, 4, 5])))).toEqual([3, 4, 5]);' },
          { name: 'парна довжина — другий середній', code: LIST + 'expect(toArr(middleNode(list([1, 2, 3, 4, 5, 6])))).toEqual([4, 5, 6]);' },
          { name: 'повертає саме вузол списку', code: LIST + 'const h = list([1, 2, 3]);\nexpect(middleNode(h)).toBe(h.next);' },
          { name: 'один і два вузли', code: LIST + 'const one = list([7]);\nexpect(middleNode(one)).toBe(one);\nconst two = list([1, 2]);\nexpect(middleNode(two)).toBe(two.next);' },
          { name: 'порожній список', code: 'expect(middleNode(null)).toBeNull();' }
        ],
        explanation: `
**Патерн:** fast / slow pointers (черепаха і заєць).

**Ідея:** за час, поки \`fast\` проходить весь список (крок 2), \`slow\` (крок 1) проходить половину.

**Складність:** O(n) часу, O(1) пам'яті.

**Альтернативи:**
- два проходи: порахувати довжину, потім пройти \`len / 2\` — теж O(n), але два проходи;
- скопіювати в масив і взяти \`arr[Math.floor(len / 2)]\` — O(n) пам'яті.

**Типові помилки:**
- умова \`while (fast.next && fast.next.next)\` дає **перший** середній для парної довжини (іноді це саме те, що потрібно — наприклад, для розрізання списку в merge sort);
- падіння на порожньому списку (\`fast.next\` від \`null\`).

**Що можуть спитати далі:** як повернути перший середній? Де ще використовується цей прийом (цикл у списку, паліндромний список, merge sort для списку, n-й з кінця)?
`
      },
      {
        id: 'ds-reverse-list', group: "linked-list",
        type: 'code',
        level: 2,
        interview: true,
        title: 'Розвернути зв\'язний список (ітеративно і рекурсивно)',
        tags: ['linked-list', 'recursion'],
        description: `
**Завдання.** Реалізуйте **дві** функції, що розвертають однозв'язний список (\`{ val, next }\`) і повертають нову голову:

**Де трапляється:** найпопулярніша задача на списки.

- \`reverseList(head)\` — **ітеративно**, O(1) додаткової пам'яті (має працювати на 10⁵ вузлів);
- \`reverseListRecursive(head)\` — **рекурсивно**.

Не створюйте нових вузлів — перепризначайте \`next\`.

\`\`\`text
1 → 2 → 3 → null   ⇒   3 → 2 → 1 → null
\`\`\`

**Як це працює:** Ітеративно: три змінні prev, cur, next — кожен вузол перенаправляємо на попередній. Рекурсивно: розвертаємо хвіст, потім head.next.next = head і head.next = null.
`,
        starter: `// План:
// 1. Ітеративно: prev = null, cur = head; кожен вузол перенаправити на prev
// 2. Рекурсивно: розвернути хвіст, потім head.next.next = head, head.next = null

function reverseList(head) {
  // TODO
}

function reverseListRecursive(head) {
  // TODO
}
`,
        solution: `function reverseList(head) {
  let prev = null;
  let cur = head;
  while (cur) {
    const next = cur.next; // зберегти, поки не втратили
    cur.next = prev;       // розвернути стрілку
    prev = cur;            // зсунутись
    cur = next;
  }
  return prev; // нова голова — колишній хвіст
}

function reverseListRecursive(head) {
  if (!head || !head.next) return head;          // база: порожній або один вузол
  const newHead = reverseListRecursive(head.next); // розвернути «хвіст»
  head.next.next = head; // наступний вузол тепер вказує на поточний
  head.next = null;      // поточний стає останнім
  return newHead;
}
`,
        hints: [
          "Ітеративно: тримайте три вказівники — `prev`, `cur` і тимчасовий `next`.",
          "На кожному кроці: збережіть `cur.next`, поверніть стрілку `cur.next = prev`, потім зсуньте `prev = cur`, `cur = next`. Відповідь — `prev`.",
          "Рекурсивно: розверніть список, що починається з `head.next`; після цього `head.next` — останній вузол розвернутого хвоста, тож `head.next.next = head; head.next = null`."
        ],
        tests: [
          { name: 'ітеративно: базовий випадок', code: LIST + 'expect(toArr(reverseList(list([1, 2, 3, 4, 5])))).toEqual([5, 4, 3, 2, 1]);' },
          { name: 'рекурсивно: базовий випадок', code: LIST + 'expect(toArr(reverseListRecursive(list([1, 2, 3, 4, 5])))).toEqual([5, 4, 3, 2, 1]);' },
          { name: 'порожній список і один вузол', code: LIST + 'expect(reverseList(null)).toBeNull();\nexpect(reverseListRecursive(null)).toBeNull();\nexpect(toArr(reverseList(list([1])))).toEqual([1]);\nexpect(toArr(reverseListRecursive(list([1])))).toEqual([1]);' },
          { name: 'перевикористовує вузли, стара голова стає хвостом', code: LIST + 'const h = list([1, 2]);\nconst second = h.next;\nconst r = reverseList(h);\nexpect(r).toBe(second);\nexpect(r.next).toBe(h);\nexpect(h.next).toBeNull();' },
          { name: 'рекурсивна версія не утворює циклу', code: LIST + 'const h = list([1, 2, 3]);\nconst r = reverseListRecursive(h);\nexpect(h.next).toBeNull();\nexpect(toArr(r)).toEqual([3, 2, 1]);' },
          { name: 'рекурсивна версія на 2000 вузлів', code: LIST + 'const r = reverseListRecursive(bigList(2000));\nexpect(r.val).toBe(1999);\nexpect(toArr(r).length).toBe(2000);' },
          { name: 'ітеративна версія на 10^5 вузлів', code: LIST + 'const t0 = performance.now();\nconst r = reverseList(bigList(1e5));\nconst ms = performance.now() - t0;\nexpect(r.val).toBe(99999);\nconst arr = toArr(r);\nexpect(arr.length).toBe(1e5);\nexpect(arr[99999]).toBe(0);\nexpect(ms).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** маніпуляція вказівниками (in-place reversal) — одна з найчастіших задач на співбесідах.

**Ітеративна ідея:** йдемо по списку, і кожну стрілку \`cur → next\` розвертаємо в \`cur → prev\`. Ключове — зберегти \`next\` **до** перезапису \`cur.next\`, інакше решта списку втрачена.

**Рекурсивна ідея:** «довір рекурсії»: \`reverse(head.next)\` повертає розвернутий хвіст, де \`head.next\` тепер — останній вузол. Причіплюємо \`head\` після нього і обриваємо \`head.next\`.

**Складність:**
| Варіант | Час | Пам'ять |
|---|---|---|
| Ітеративний | O(n) | O(1) |
| Рекурсивний | O(n) | O(n) — стек викликів |
| Через масив значень | O(n) | O(n) |

Рекурсивний варіант на 10⁵ вузлах падає з \`RangeError: Maximum call stack size exceeded\` — у JS немає оптимізації хвостових викликів (TCO) на практиці. Тому на співбесіді за замовчуванням — ітеративний.

**Типові помилки:**
- \`cur.next = prev\` до збереження \`next\`;
- повертають \`cur\` (він \`null\` наприкінці) замість \`prev\`;
- у рекурсії забувають \`head.next = null\` → цикл між першими двома вузлами.

**Що можуть спитати далі:** розвернути частину списку між позиціями m і n (Reverse Linked List II); розвернути групами по k (Reverse Nodes in k-Group); розвернути двозв'язний список.
`
      },
      {
        id: 'ds-detect-cycle', group: "linked-list",
        type: 'code',
        level: 2,
        title: 'Цикл у списку: алгоритм Флойда',
        tags: ['linked-list', 'two-pointers', 'floyd'],
        description: `
**Завдання.** Напишіть \`hasCycle(head)\`: поверніть \`true\`, якщо в однозв'язному списку (\`{ val, next }\`) є цикл — тобто якийсь \`next\` вказує на один із попередніх вузлів.

**Де трапляється:** алгоритм Флойда; виявлення циклічних посилань.

Вимоги: O(n) часу, **O(1) пам'яті**, не змінюйте вузли (не додавайте до них прапорців).

\`\`\`text
3 → 2 → 0 → -4
    ↑________|     ⇒ true
1 → 2 → null      ⇒ false
\`\`\`

**Як це працює:** Алгоритм Флойда: slow — по одному кроку, fast — по два. Якщо є цикл, fast наздожене slow всередині нього; якщо fast дійшов до null — циклу немає.
`,
        starter: `function hasCycle(head) {
  // 1. slow = fast = head
  // 2. Поки fast і fast.next: зсунути; slow === fast → true
  // 3. Вийшли з циклу → false
  // TODO
}
`,
        solution: `function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true; // заєць наздогнав черепаху всередині циклу
  }
  return false; // fast дійшов до null — кінець списку існує
}
`,
        hints: [
          "Якщо в списку є кінець — ви до нього дійдете. А якщо цикл? Подумайте про двох бігунів на круговій доріжці.",
          "Два вказівники: `slow` робить крок 1, `fast` — крок 2. У циклі швидкий неминуче наздожене повільного.",
          "Цикл `while (fast && fast.next)`, всередині — крок обох і перевірка `slow === fast` (порівняння посилань, не значень!)."
        ],
        tests: [
          { name: 'цикл на другий вузол', code: LIST + 'const h = list([3, 2, 0, -4]);\nh.next.next.next.next = h.next;\nexpect(hasCycle(h)).toBe(true);' },
          { name: 'список без циклу', code: LIST + 'expect(hasCycle(list([1, 2, 3, 4]))).toBe(false);' },
          { name: 'порожній список і один вузол', code: LIST + 'expect(hasCycle(null)).toBe(false);\nexpect(hasCycle(list([1]))).toBe(false);' },
          { name: 'вузол, що вказує сам на себе', code: 'const a = { val: 1, next: null };\na.next = a;\nexpect(hasCycle(a)).toBe(true);' },
          { name: 'однакові значення — не цикл', code: LIST + 'expect(hasCycle(list([1, 1, 1, 1]))).toBe(false);' },
          { name: 'не змінює вузли', code: LIST + 'const h = list([1, 2, 3]);\nh.next.next.next = h;\nhasCycle(h);\nlet cur = h, ok = true;\nfor (let i = 0; i < 3; i++) { if (Object.keys(cur).sort().join() !== "next,val") ok = false; cur = cur.next; }\nexpect(ok).toBe(true);\nexpect(h.next.next.next).toBe(h);' },
          { name: '10^5 вузлів — O(n)', code: LIST + 'const h = bigList(1e5);\nlet tail = h, mid = null, i = 0;\nwhile (tail.next) { if (i === 50000) mid = tail; tail = tail.next; i++; }\nconst t0 = performance.now();\nexpect(hasCycle(h)).toBe(false);\ntail.next = mid;\nexpect(hasCycle(h)).toBe(true);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** алгоритм Флойда «черепаха і заєць» (Floyd's cycle detection).

**Чому працює:** якщо циклу немає, \`fast\` дійде до \`null\`. Якщо цикл є, обидва вказівники зрештою в ньому опиняться; кожен крок відстань між ними (по циклу) зменшується на 1, тож \`fast\` гарантовано наздожене \`slow\` не більше ніж за довжину циклу.

**Складність:** O(n) часу, O(1) пам'яті.

**Brute force та альтернативи:**
- \`Set\` відвіданих вузлів — O(n) часу, але O(n) пам'яті;
- прапорець \`node.visited = true\` — мутує дані (на співбесіді це мінус);
- для кожного вузла перевіряти всі попередні — O(n²).

**Типові помилки:**
- порівнювати \`slow.val === fast.val\` замість посилань (дублікати значень дадуть хибний \`true\`);
- перевірка \`slow === fast\` **до** першого кроку (на старті обидва = \`head\`);
- \`fast.next.next\` без перевірки \`fast.next\`.

**Що можуть спитати далі:** знайдіть **початок** циклу (Linked List Cycle II): після зустрічі поставте один вказівник на \`head\` і рухайте обидва по 1 кроку — зустрінуться на вході в цикл. Як знайти довжину циклу? Find the Duplicate Number (масив як функціональний граф).
`
      },
      {
        id: 'ds-merge-two-lists', group: "linked-list",
        type: 'code',
        level: 2,
        title: 'Злиття двох відсортованих списків',
        tags: ['linked-list', 'two-pointers', 'dummy-node'],
        description: `
**Завдання.** Напишіть \`mergeTwoLists(a, b)\`: два **відсортовані** за неспаданням однозв'язні списки (\`{ val, next }\`) злийте в один відсортований і поверніть його голову.

**Де трапляється:** злиття відсортованих потоків даних.

- Не створюйте нових вузлів зі значеннями — **перевикористовуйте** вузли вхідних списків.
- Списки можуть мати до 10⁵ вузлів кожен — рекурсія переповнить стек, потрібен ітеративний варіант.
- При рівних значеннях першим іде вузол з \`a\`.

\`\`\`text
a: 1 → 2 → 4
b: 1 → 3 → 4
⇒  1 → 1 → 2 → 3 → 4 → 4
\`\`\`

**Як це працює:** Фіктивна голова (dummy) і хвіст. Порівнюємо голови двох списків, менший вузол чіпляємо до хвоста. Коли один список скінчився — доклеюємо залишок іншого.
`,
        starter: `function mergeTwoLists(a, b) {
  // 1. dummy-вузол і tail = dummy
  // 2. Поки обидва непорожні: менший вузол → tail.next
  // 3. Доклеїти залишок; повернути dummy.next
  // TODO
}
`,
        solution: `function mergeTwoLists(a, b) {
  const dummy = { val: null, next: null }; // фіктивна голова — немає окремого випадку для першого вузла
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) { // <= робить злиття стабільним
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a || b; // решта одного зі списків уже відсортована
  return dummy.next;
}
`,
        hints: [
          "Як у merge sort: порівнюємо голови і забираємо меншу.",
          "Заведіть фіктивний вузол `dummy` і вказівник `tail` на кінець результату — тоді не треба окремо визначати голову.",
          "Коли один зі списків закінчився, просто причепіть залишок іншого: `tail.next = a || b`. Відповідь — `dummy.next`."
        ],
        tests: [
          { name: 'базовий випадок', code: LIST + 'expect(toArr(mergeTwoLists(list([1, 2, 4]), list([1, 3, 4])))).toEqual([1, 1, 2, 3, 4, 4]);' },
          { name: 'порожні списки', code: LIST + 'expect(mergeTwoLists(null, null)).toBeNull();\nexpect(toArr(mergeTwoLists(null, list([0])))).toEqual([0]);\nexpect(toArr(mergeTwoLists(list([1, 2]), null))).toEqual([1, 2]);' },
          { name: "від'ємні та дублікати", code: LIST + 'expect(toArr(mergeTwoLists(list([-3, -1, 2, 2]), list([-2, 2, 5])))).toEqual([-3, -2, -1, 2, 2, 2, 5]);' },
          { name: 'один список повністю менший', code: LIST + 'expect(toArr(mergeTwoLists(list([5, 6]), list([1, 2, 3])))).toEqual([1, 2, 3, 5, 6]);' },
          { name: 'перевикористовує вузли, при рівності першим іде a', code: LIST + 'const a = list([1, 3]);\nconst b = list([1, 2]);\nconst r = mergeTwoLists(a, b);\nexpect(r).toBe(a);\nexpect(r.next).toBe(b);' },
          { name: 'два списки по 5·10^4 вузлів — ітеративно, O(n + m)', code: LIST + 'let a = null, b = null;\nfor (let i = 49999; i >= 0; i--) { a = { val: 2 * i, next: a }; b = { val: 2 * i + 1, next: b }; }\nconst t0 = performance.now();\nconst r = mergeTwoLists(a, b);\nconst ms = performance.now() - t0;\nconst arr = toArr(r);\nexpect(arr.length).toBe(1e5);\nexpect(arr.slice(0, 5)).toEqual([0, 1, 2, 3, 4]);\nexpect(arr[99999]).toBe(99999);\nexpect(ms).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** два вказівники + dummy-вузол (фіктивна голова).

**Ідея:** на кожному кроці порівнюємо поточні голови \`a\` і \`b\`, причіплюємо меншу до \`tail\` і зсуваємось. Коли один список вичерпано — залишок іншого вже відсортований, причіплюємо цілком.

**Складність:** O(n + m) часу, O(1) додаткової пам'яті (вузли перевикористовуються).

**Рекурсивний варіант** коротший:
\`\`\`js
function merge(a, b) {
  if (!a || !b) return a || b;
  if (a.val <= b.val) { a.next = merge(a.next, b); return a; }
  b.next = merge(a, b.next); return b;
}
\`\`\`
але глибина рекурсії = n + m, тож на великих списках — \`RangeError\`.

**Brute force:** зібрати всі значення в масив, відсортувати, побудувати новий список — O((n + m) log(n + m)) і O(n + m) пам'яті.

**Типові помилки:**
- без dummy-вузла — плутанина з визначенням голови;
- забули причепити залишок;
- \`<\` замість \`<=\` — злиття перестає бути стабільним.

**Що можуть спитати далі:** злиття k відсортованих списків (купа — O(N log k)); сортування зв'язного списку (merge sort, O(n log n), O(1) пам'яті знизу-вгору); перетин двох відсортованих списків.
`
      },
      {
        id: 'ds-remove-nth-from-end', group: "linked-list",
        type: 'code',
        level: 2,
        title: 'Видалити n-й вузол з кінця',
        tags: ['linked-list', 'two-pointers', 'dummy-node'],
        description: `
**Завдання.** Напишіть \`removeNthFromEnd(head, n)\`: видаліть \`n\`-й з кінця вузол однозв'язного списку (\`{ val, next }\`) і поверніть голову. \`n\` завжди в межах \`1..довжина\`.

**Де трапляється:** класика з двома вказівниками.

Бонус для співбесіди: **за один прохід**.

\`\`\`text
1 → 2 → 3 → 4 → 5, n = 2   ⇒   1 → 2 → 3 → 5
1, n = 1                   ⇒   null
\`\`\`

**Як це працює:** Два вказівники з відставанням n: fast іде на n + 1 крок уперед, потім обидва рухаються разом. Коли fast дійде до кінця, slow стоїть перед вузлом, який треба видалити. Dummy-голова рятує при видаленні першого вузла.
`,
        starter: `function removeNthFromEnd(head, n) {
  // 1. dummy перед head; fast і slow на dummy
  // 2. fast на n + 1 крок уперед, потім обидва до кінця
  // 3. slow.next = slow.next.next; повернути dummy.next
  // TODO
}
`,
        solution: `function removeNthFromEnd(head, n) {
  const dummy = { val: null, next: head }; // на випадок видалення голови
  let fast = dummy;
  let slow = dummy;
  // відводимо fast на n + 1 кроків уперед — між slow і fast буде n вузлів
  for (let i = 0; i <= n; i++) fast = fast.next;
  while (fast) {
    fast = fast.next;
    slow = slow.next;
  }
  slow.next = slow.next.next; // slow — вузол ПЕРЕД тим, що видаляємо
  return dummy.next;
}
`,
        hints: [
          "Два проходи: порахувати довжину L, потім видалити (L − n)-й від початку. А як за один?",
          "Два вказівники з фіксованим проміжком: відведіть `fast` на n кроків уперед, потім рухайте обидва, поки `fast` не дійде до кінця.",
          "Почніть обидва з dummy-вузла `{ next: head }` і відведіть `fast` на `n + 1` кроків — тоді `slow` зупиниться **перед** вузлом, який треба видалити. Поверніть `dummy.next`."
        ],
        tests: [
          { name: 'базовий випадок', code: LIST + 'expect(toArr(removeNthFromEnd(list([1, 2, 3, 4, 5]), 2))).toEqual([1, 2, 3, 5]);' },
          { name: 'єдиний вузол', code: LIST + 'expect(removeNthFromEnd(list([1]), 1)).toBeNull();' },
          { name: 'видалення останнього', code: LIST + 'expect(toArr(removeNthFromEnd(list([1, 2]), 1))).toEqual([1]);' },
          { name: 'видалення голови', code: LIST + 'expect(toArr(removeNthFromEnd(list([1, 2]), 2))).toEqual([2]);\nexpect(toArr(removeNthFromEnd(list([1, 2, 3, 4]), 4))).toEqual([2, 3, 4]);' },
          { name: 'дублікати значень', code: LIST + 'expect(toArr(removeNthFromEnd(list([7, 7, 7]), 2))).toEqual([7, 7]);' },
          { name: 'перевикористовує вузли', code: LIST + 'const h = list([1, 2, 3]);\nconst third = h.next.next;\nconst r = removeNthFromEnd(h, 2);\nexpect(r).toBe(h);\nexpect(r.next).toBe(third);' }
        ],
        explanation: `
**Патерн:** два вказівники з фіксованим проміжком (gap) + dummy-вузол.

**Ідея:** якщо \`fast\` на n + 1 кроків попереду \`slow\`, то коли \`fast\` стане \`null\` (за кінцем), \`slow\` буде рівно перед n-м з кінця. Dummy-вузол потрібен, щоб видалення голови не було окремим випадком.

**Складність:** O(L) часу, один прохід; O(1) пам'яті.

**Альтернатива:** два проходи (довжина → видалення) — теж O(L); інтерв'юери зазвичай просять один прохід як follow-up. Через масив вузлів — O(L) пам'яті.

**Типові помилки:**
- проміжок n замість n + 1 → \`slow\` зупиняється на самому вузлі, а не перед ним;
- без dummy: \`n === довжина\` (видалення голови) ламає код;
- повертають \`head\` замість \`dummy.next\` — якщо голову видалено, повернеться видалений вузол.

**Що можуть спитати далі:** повернути n-й з кінця вузол, не видаляючи; Rotate List (зсув списку на k); видалити всі вузли з заданим значенням.
`
      },
      {
        id: 'ds-palindrome-list', group: "linked-list",
        type: 'code',
        level: 3,
        title: 'Паліндромний зв\'язний список (O(1) пам\'яті)',
        tags: ['linked-list', 'two-pointers'],
        description: `
**Завдання.** Напишіть \`isPalindrome(head)\`: чи читається однозв'язний список (\`{ val, next }\`) однаково в обох напрямках.

**Де трапляється:** комбінація fast/slow і розвороту.

- Порожній список і один вузол — паліндроми.
- Після виклику список має **залишитися незмінним** (якщо ви тимчасово його модифікуєте — відновіть).
- Ціль для співбесіди: O(n) часу і **O(1) додаткової пам'яті**.

\`\`\`text
1 → 2 → 2 → 1   ⇒ true
1 → 2           ⇒ false
\`\`\`

**Як це працює:** Знаходимо середину (slow/fast), розвертаємо другу половину і порівнюємо її з першою вузол за вузлом. O(n) часу, O(1) пам'яті.
`,
        starter: `function isPalindrome(head) {
  // 1. Знайти середину (slow/fast)
  // 2. Розвернути другу половину
  // 3. Порівняти половини вузол за вузлом
  // TODO
}
`,
        solution: `function reverse(head) {
  let prev = null;
  while (head) {
    const next = head.next;
    head.next = prev;
    prev = head;
    head = next;
  }
  return prev;
}

function isPalindrome(head) {
  if (!head || !head.next) return true;

  // 1. Знайти кінець першої половини (перший середній для парної довжини)
  let slow = head, fast = head;
  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }

  // 2. Розвернути другу половину
  const secondHead = reverse(slow.next);

  // 3. Порівняти половини
  let p1 = head, p2 = secondHead, ok = true;
  while (p2) {
    if (p1.val !== p2.val) { ok = false; break; }
    p1 = p1.next;
    p2 = p2.next;
  }

  // 4. Відновити список
  slow.next = reverse(secondHead);
  return ok;
}
`,
        hints: [
          "Найпростіше — скопіювати значення в масив і перевірити двома вказівниками. Це O(n) пам'яті. Як обійтися без масиву?",
          "Знайдіть середину (fast / slow), розверніть **другу половину** на місці і порівняйте її з першою.",
          "Для середини використайте `while (fast.next && fast.next.next)` — тоді `slow` буде кінцем першої половини. Після порівняння розверніть другу половину назад і причепіть: `slow.next = reverse(secondHead)`."
        ],
        tests: [
          { name: 'парна довжина — паліндром', code: LIST + 'expect(isPalindrome(list([1, 2, 2, 1]))).toBe(true);' },
          { name: 'непарна довжина — паліндром', code: LIST + 'expect(isPalindrome(list([1, 2, 3, 2, 1]))).toBe(true);' },
          { name: 'не паліндроми', code: LIST + 'expect(isPalindrome(list([1, 2]))).toBe(false);\nexpect(isPalindrome(list([1, 2, 3, 1]))).toBe(false);\nexpect(isPalindrome(list([1, 2, 1, 1]))).toBe(false);' },
          { name: 'порожній і один вузол', code: LIST + 'expect(isPalindrome(null)).toBe(true);\nexpect(isPalindrome(list([5]))).toBe(true);' },
          { name: 'рядкові значення', code: LIST + 'expect(isPalindrome(list(["r", "a", "c", "e", "c", "a", "r"]))).toBe(true);' },
          { name: 'список залишається незмінним', code: LIST + 'const h = list([1, 2, 3, 2, 1]);\nconst nodes = []; for (let c = h; c; c = c.next) nodes.push(c);\nisPalindrome(h);\nexpect(toArr(h)).toEqual([1, 2, 3, 2, 1]);\nlet c = h; for (const n of nodes) { expect(c).toBe(n); c = c.next; }\nconst h2 = list([1, 2, 3]);\nisPalindrome(h2);\nexpect(toArr(h2)).toEqual([1, 2, 3]);' },
          { name: '10^5 вузлів — O(n)', code: LIST + 'const n = 1e5;\nconst vals = Array.from({ length: n }, (_, i) => Math.min(i, n - 1 - i));\nconst h = list(vals);\nconst t0 = performance.now();\nexpect(isPalindrome(h)).toBe(true);\nh.next.val = -1;\nexpect(isPalindrome(h)).toBe(false);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** комбінація трьох базових прийомів — fast/slow (середина) + розворот списку + два вказівники.

**Кроки:**
1. fast/slow знаходять кінець першої половини.
2. Друга половина розвертається на місці.
3. Порівнюємо поелементно, поки не скінчиться друга половина (для непарної довжини середній елемент лишається в першій і ні з чим не порівнюється).
4. Розвертаємо другу половину назад — функції не повинні непомітно псувати вхідні дані.

**Складність:** O(n) часу, O(1) пам'яті.

**Brute force / альтернативи:**
- масив значень + два вказівники — O(n) пам'яті, найпростіше і цілком прийнятне як перша відповідь;
- рекурсія з «зовнішнім» вказівником — O(n) стеку, падає на великих списках;
- стек першої половини — O(n/2) пам'яті.

**Типові помилки:**
- неправильна середина для парної довжини → порівнюються зсунуті половини;
- не відновили список (тест «список незмінний» це ловить);
- порівнюють \`p1\` до \`null\`, а не \`p2\` — перша половина не обірвана, тож \`p1\` пройде далі.

**Що можуть спитати далі:** чи безпечно так робити в багатопотоковому середовищі (інший код бачить тимчасово зламаний список)? Reorder List (L0 → Ln → L1 → Ln-1…) — ті ж три кроки. Паліндром з ігноруванням регістру і не-літер.
`
      },
      // ===================================================== ДЕРЕВА
      {
        id: 'ds-theory-tree-traversals', group: "trees", why: ["Так: in-order BST дає відсортований порядок.","Ні: це post-order; pre-order — вузол першим.","Так: висота, розмір, видалення — post-order.","Ні: навпаки — BFS на черзі, DFS на стеку.","Ні: глибока рекурсія переповнює стек викликів."],
        type: 'theory',
        level: 2,
        interview: true,
        title: 'Обходи дерева: pre / in / post-order і BFS',
        tags: ['tree', 'dfs', 'bfs'],
        question: 'Які є способи обходу бінарного дерева? Чим відрізняються pre-order, in-order, post-order і level-order, і для яких задач підходить кожен? Як обійти дерево без рекурсії? Оберіть **усі** правильні твердження.',
        choices: [
          'In-order обхід бінарного дерева пошуку (BST) повертає значення у відсортованому порядку',
          'Pre-order обробляє вузол після обох піддерев, тому саме він підходить для обчислення висоти',
          'Post-order зручний, коли відповідь вузла залежить від дітей: висота, діаметр, розмір папки',
          'Level-order (BFS) обходить дерево за допомогою стека, а DFS — за допомогою черги',
          'Рекурсивний DFS у JS безпечний на будь-якій глибині, бо рушій оптимізує хвостові виклики',
        ],
        correct: [0, 2],
        hint: 'Різниця — у моменті, коли обробляється сам вузол відносно дітей. Плюс обхід по рівнях через чергу.',
        answer: `
**DFS (пошук у глибину)** — три варіанти, які відрізняються моментом обробки вузла:

| Обхід | Порядок | Типові задачі |
|---|---|---|
| **Pre-order** | вузол → ліве → праве | копіювання / серіалізація дерева, друк структури (каталоги), префіксні вирази |
| **In-order** | ліве → вузол → праве | для **BST** дає відсортований порядок: валідація BST, k-й найменший |
| **Post-order** | ліве → праве → вузол | коли відповідь вузла залежить від дітей: висота, діаметр, баланс, видалення дерева, обчислення розміру директорії |

**BFS (level-order)** — по рівнях зліва направо через **чергу**: мінімальна глибина, правий вид дерева (right side view), зигзаг, найкоротший шлях.

\`\`\`js
function inorder(root, out = []) {       // рекурсивно
  if (!root) return out;
  inorder(root.left, out);
  out.push(root.val);
  inorder(root.right, out);
  return out;
}

function inorderIterative(root) {        // явний стек
  const out = [], stack = [];
  let cur = root;
  while (cur || stack.length) {
    while (cur) { stack.push(cur); cur = cur.left; } // спуститися вліво до кінця
    cur = stack.pop();
    out.push(cur.val);
    cur = cur.right;
  }
  return out;
}
\`\`\`

**Складність:** усі обходи — O(n) часу. Пам'ять: DFS — O(h) (висота: від log n для збалансованого до n для виродженого), BFS — O(w) (максимальна ширина рівня, до n/2).

**Рекурсія vs ітерація:** рекурсія коротша, але на глибокому (виродженому) дереві в JS дає \`RangeError: Maximum call stack size exceeded\` (~10⁴ рівнів). Ітеративний варіант із явним стеком від цього захищений. Post-order ітеративно — найхитріший: або два стеки, або pre-order «вузол → праве → ліве» і розворот результату.

**Фронтенд-приклади:** обхід DOM (\`TreeWalker\` — pre-order), рендер дерева компонентів, вкладені меню/коментарі, обчислення розміру вкладених папок (post-order).
`,
        keyPoints: [
          'Pre-order: вузол-ліве-праве; in-order: ліве-вузол-праве; post-order: ліве-праве-вузол',
          'In-order обхід BST дає відсортовані значення',
          'Post-order — коли результат вузла залежить від дітей (висота, діаметр)',
          'BFS — по рівнях через чергу; DFS — стек (рекурсія або явний)',
          'Час O(n); пам\'ять DFS O(h), BFS O(w); ризик переповнення стеку на глибоких деревах'
        ],
        followUps: [
          'Як зробити ітеративний post-order?',
          'Що таке Morris traversal і яка в нього пам\'ять?',
          'Чи можна відновити дерево за pre-order та in-order?',
          'Як обійти DOM-дерево без рекурсії?'
        ]
      },
      {
        id: 'ds-max-depth', group: "trees",
        type: 'code',
        level: 1,
        interview: true,
        title: 'Максимальна глибина бінарного дерева',
        tags: ['tree', 'dfs', 'recursion'],
        description: `
**Завдання.** Напишіть \`maxDepth(root)\`: кількість вузлів на найдовшому шляху від кореня до листа. Вузол — \`{ val, left, right }\`, порожнє дерево — \`null\` (глибина 0).

**Де трапляється:** глибина DOM-дерева чи вкладених коментарів.

\`\`\`text
    3
   / \\
  9  20
    /  \\
   15   7      ⇒ 3
\`\`\`

У тестах дерева будуються з масиву в level-order (як на LeetCode): \`[3, 9, 20, null, null, 15, 7]\`.

**Як це працює:** Рекурсія: глибина порожнього дерева — 0, глибина вузла — 1 + більша з глибин лівого і правого піддерев.
`,
        starter: `function maxDepth(root) {
  // 1. null → 0
  // 2. 1 + max(глибина лівого, глибина правого)
  // TODO
}
`,
        solution: `function maxDepth(root) {
  if (!root) return 0; // база: порожнє піддерево
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
`,
        hints: [
          "Глибину дерева легко виразити через глибини піддерев.",
          "Глибина = 1 + максимум із глибин лівого і правого піддерев. Яка база рекурсії?",
          "`if (!root) return 0; return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));`"
        ],
        tests: [
          { name: 'приклад з умови', code: TREE + 'expect(maxDepth(tree([3, 9, 20, null, null, 15, 7]))).toBe(3);' },
          { name: 'порожнє дерево', code: 'expect(maxDepth(null)).toBe(0);' },
          { name: 'один вузол', code: TREE + 'expect(maxDepth(tree([1]))).toBe(1);' },
          { name: 'вироджене (як список) дерево', code: TREE + 'expect(maxDepth(tree([1, 2, null, 3, null, 4]))).toBe(4);\nexpect(maxDepth(tree([1, null, 2]))).toBe(2);' },
          { name: 'велике збалансоване дерево (10^5 вузлів)', code: TREE + 'const root = balanced(1, 1e5);\nconst t0 = performance.now();\nexpect(maxDepth(root)).toBe(17);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** DFS / post-order — відповідь вузла збирається з відповідей дітей («знизу вгору»).

**Ідея:** глибина порожнього дерева — 0; інакше \`1 + max(лівої, правої)\`.

**Складність:** O(n) часу (кожен вузол — один раз), O(h) пам'яті на стек рекурсії (h — висота: log n … n).

**Ітеративні альтернативи:**
- BFS по рівнях: кількість рівнів = глибина;
- DFS з явним стеком пар \`[node, depth]\`.

Вони потрібні, якщо дерево може бути дуже глибоким (рекурсія → \`RangeError\`).

**Типові помилки:**
- плутанина «глибина у вузлах» vs «висота в ребрах» (відрізняються на 1) — уточнюйте в інтерв'юера;
- \`Math.max\` з одним аргументом або повернення \`undefined\` для \`null\`.

**Що можуть спитати далі:** мінімальна глибина (пастка: вузол з однією дитиною — не лист!; краще BFS з ранньою зупинкою); чи збалансоване дерево (Balanced Binary Tree, O(n) за один post-order прохід); максимальна глибина N-арного дерева / вкладеності DOM.
`
      },
      {
        id: 'ds-invert-tree', group: "trees",
        type: 'code',
        level: 1,
        interview: true,
        title: 'Віддзеркалити бінарне дерево (invert)',
        tags: ['tree', 'dfs', 'recursion'],
        description: `
**Завдання.** Напишіть \`invertTree(root)\`: віддзеркальте дерево — для **кожного** вузла поміняйте місцями лівого і правого нащадків. Змінюйте дерево на місці і поверніть корінь.

**Де трапляється:** відома задача-мем зі співбесід.

\`\`\`text
     4                4
   /   \\            /   \\
  2     7    ⇒     7     2
 / \\   / \\        / \\   / \\
1   3 6   9      9   6 3   1
\`\`\`

**Як це працює:** Для кожного вузла міняємо місцями left і right, потім рекурсивно робимо те саме для дітей.
`,
        starter: `function invertTree(root) {
  // 1. null → null
  // 2. Поміняти left і right
  // 3. Рекурсивно для обох дітей; повернути root
  // TODO
}
`,
        solution: `function invertTree(root) {
  if (!root) return null;
  // спочатку міняємо дітей місцями, потім рекурсивно віддзеркалюємо кожне піддерево
  [root.left, root.right] = [root.right, root.left];
  invertTree(root.left);
  invertTree(root.right);
  return root;
}
`,
        hints: [
          "Віддзеркалити дерево = поміняти дітей кореня місцями + віддзеркалити обидва піддерева.",
          "Рекурсія: база — `null`. Для вузла — swap `left` і `right`, потім рекурсивні виклики для обох дітей.",
          "Обмін через деструктуризацію: `[root.left, root.right] = [root.right, root.left]`. Не забудьте повернути `root`."
        ],
        tests: [
          { name: 'приклад з умови', code: TREE + 'expect(toLevel(invertTree(tree([4, 2, 7, 1, 3, 6, 9])))).toEqual([4, 7, 2, 9, 6, 3, 1]);' },
          { name: 'порожнє дерево', code: 'expect(invertTree(null)).toBeNull();' },
          { name: 'один вузол', code: TREE + 'expect(toLevel(invertTree(tree([1])))).toEqual([1]);' },
          { name: 'несиметричне дерево', code: TREE + 'expect(toLevel(invertTree(tree([2, 1])))).toEqual([2, null, 1]);\nexpect(toLevel(invertTree(tree([1, 2, null, 3])))).toEqual([1, null, 2, null, 3]);' },
          { name: 'змінює на місці і повертає той самий корінь', code: TREE + 'const r = tree([1, 2, 3]);\nconst left = r.left;\nexpect(invertTree(r)).toBe(r);\nexpect(r.right).toBe(left);' }
        ],
        explanation: `
**Патерн:** DFS-обхід з дією в кожному вузлі (тут — pre-order: спочатку обмін, потім діти; post-order теж працює).

**Складність:** O(n) часу, O(h) пам'яті (стек).

**Ітеративно:** BFS із чергою або DFS зі стеком — дістаємо вузол, міняємо дітей, кладемо дітей у чергу/стек. Захищає від переповнення стеку на глибоких деревах.

**Типові помилки:**
- обмін без тимчасової змінної: \`root.left = root.right; root.right = root.left\` — обидва вказують на одне піддерево;
- рекурсія по \`root.left\` **після** обміну і **до** обміну змішано так, що одне піддерево інвертується двічі (наприклад, \`root.left = invertTree(root.right); root.right = invertTree(root.left)\` — друге присвоєння вже бачить нове \`left\`).

**Що можуть спитати далі:** перевірити, що два дерева є дзеркальними (Symmetric Tree); повернути **нове** дерево, не мутуючи старе; чому ця задача стала мемом (історія з Homebrew).
`
      },
      {
        id: 'ds-traversals-iterative', group: "trees",
        type: 'code',
        level: 3,
        title: 'Pre / in / post-order без рекурсії',
        tags: ['tree', 'dfs', 'stack'],
        description: `
**Завдання.** Реалізуйте три функції, що повертають масив значень бінарного дерева (\`{ val, left, right }\`) у відповідному порядку:

**Де трапляється:** обхід глибоких дерев без переповнення стека.

- \`preorder(root)\` — вузол → ліве → праве;
- \`inorder(root)\` — ліве → вузол → праве;
- \`postorder(root)\` — ліве → праве → вузол.

**Обмеження:** дерево може бути виродженим і мати глибину **10⁵** — рекурсивний обхід переповнить стек викликів. Використайте **явний стек**.

\`\`\`text
      1
     / \\
    2   3
   / \\   \\
  4   5   6

preorder:  [1, 2, 4, 5, 3, 6]
inorder:   [4, 2, 5, 1, 3, 6]
postorder: [4, 5, 2, 6, 3, 1]
\`\`\`

**Як це працює:** Рекурсію замінює явний стек. Pre-order: зняти вузол, записати, покласти правого, потім лівого. In-order: йти вліво до кінця, зняти, перейти вправо. Post-order: pre-order «корінь-правий-лівий», розвернутий.
`,
        starter: `// План:
// 1. preorder: стек [root]; зняти, записати, покласти правого, потім лівого
// 2. inorder: іти вліво, складаючи у стек; зняти, записати, перейти вправо
// 3. postorder: як preorder, але «корінь-правий-лівий», і результат розвернути

function preorder(root) {
  // TODO
}

function inorder(root) {
  // TODO
}

function postorder(root) {
  // TODO
}
`,
        solution: `function preorder(root) {
  const out = [];
  const stack = root ? [root] : [];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.val);
    // праве кладемо першим, щоб ліве обробилось раніше (LIFO)
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return out;
}

function inorder(root) {
  const out = [];
  const stack = [];
  let cur = root;
  while (cur || stack.length) {
    while (cur) {        // спускаємось уліво до кінця, запам'ятовуючи шлях
      stack.push(cur);
      cur = cur.left;
    }
    cur = stack.pop();   // найлівіший необроблений вузол
    out.push(cur.val);
    cur = cur.right;     // далі — його праве піддерево
  }
  return out;
}

function postorder(root) {
  // «вузол → праве → ліве» — це дзеркальний pre-order; його розворот = post-order
  const out = [];
  const stack = root ? [root] : [];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.val);
    if (node.left) stack.push(node.left);
    if (node.right) stack.push(node.right);
  }
  return out.reverse();
}
`,
        hints: [
          "Рекурсія — це неявний стек. Зробіть його явним масивом: `push` / `pop`.",
          "Pre-order: дістали вузол → записали → поклали праву дитину, потім ліву. In-order: спускайтеся вліво, кладучи вузли в стек; дістали вузол → записали → перейшли в праве піддерево.",
          "Post-order: зробіть обхід «вузол → праве → ліве» (як pre-order, але діти кладуться в іншому порядку) і розверніть результат."
        ],
        tests: [
          { name: 'preorder на прикладі', code: TREE + 'expect(preorder(tree([1, 2, 3, 4, 5, null, 6]))).toEqual([1, 2, 4, 5, 3, 6]);' },
          { name: 'inorder на прикладі', code: TREE + 'expect(inorder(tree([1, 2, 3, 4, 5, null, 6]))).toEqual([4, 2, 5, 1, 3, 6]);' },
          { name: 'postorder на прикладі', code: TREE + 'expect(postorder(tree([1, 2, 3, 4, 5, null, 6]))).toEqual([4, 5, 2, 6, 3, 1]);' },
          { name: 'порожнє дерево і один вузол', code: TREE + 'expect(preorder(null)).toEqual([]);\nexpect(inorder(null)).toEqual([]);\nexpect(postorder(null)).toEqual([]);\nconst one = tree([7]);\nexpect([preorder(one), inorder(one), postorder(one)]).toEqual([[7], [7], [7]]);' },
          { name: 'in-order BST дає відсортований масив', code: TREE + 'expect(inorder(tree([8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13]))).toEqual([1, 3, 4, 6, 7, 8, 10, 13, 14]);' },
          { name: 'ліве вироджене дерево глибини 10^5 (без переповнення стеку)', code: TREE + 'let root = null;\nfor (let i = 0; i < 1e5; i++) root = node(i, root, null);\nconst t0 = performance.now();\nconst pre = preorder(root), ino = inorder(root), post = postorder(root);\nexpect(pre[0]).toBe(99999);\nexpect(pre[99999]).toBe(0);\nexpect(ino[0]).toBe(0);\nexpect(ino[99999]).toBe(99999);\nexpect(post[0]).toBe(0);\nexpect(post[99999]).toBe(99999);\nexpect(performance.now() - t0).toBeLessThan(1000);' },
          { name: 'праве вироджене дерево глибини 10^5', code: TREE + 'let root = null;\nfor (let i = 0; i < 1e5; i++) root = node(i, null, root);\nconst pre = preorder(root), ino = inorder(root), post = postorder(root);\nexpect(pre.length).toBe(1e5);\nexpect(pre[0]).toBe(99999);\nexpect(ino[0]).toBe(99999);\nexpect(post[0]).toBe(0);\nexpect(post[99999]).toBe(99999);' }
        ],
        explanation: `
**Патерн:** DFS з явним стеком (recursion → iteration).

**Рекурсивні версії** (для порівняння — так вони виглядають на дошці):
\`\`\`js
const pre  = (n, o = []) => (n && (o.push(n.val), pre(n.left, o), pre(n.right, o)), o);
const ino  = (n, o = []) => (n && (ino(n.left, o), o.push(n.val), ino(n.right, o)), o);
const post = (n, o = []) => (n && (post(n.left, o), post(n.right, o), o.push(n.val)), o);
\`\`\`
На дереві глибини 10⁵ вони падають з \`RangeError: Maximum call stack size exceeded\`: кожен рівень — кадр стеку, а в JS їх ~10⁴.

**Ітеративні ідеї:**
- **pre-order** — стек вузлів; праву дитину кладемо раніше лівої, бо стек LIFO;
- **in-order** — «спуск уліво до кінця», потім \`pop\`, запис і перехід у праве піддерево;
- **post-order** — розворот обходу «вузол → праве → ліве». Альтернатива без розвороту — стек + вказівник \`lastVisited\`, щоб знати, чи праве піддерево вже оброблене.

**Складність:** O(n) часу для всіх; пам'ять O(h) для стеку (+ O(n) для результату). Morris traversal дає O(1) додаткової пам'яті, тимчасово змінюючи посилання.

**Типові помилки:**
- pre-order: \`push(left)\` раніше \`push(right)\` → порядок «вузол → праве → ліве»;
- in-order: умова циклу лише \`stack.length\` — на старті стек порожній;
- \`stack.unshift\`/\`shift\` замість \`push\`/\`pop\` — це вже черга (BFS) і O(n) на операцію.

**Що можуть спитати далі:** post-order без \`reverse()\` (один стек + \`lastVisited\`); Morris in-order; ітератор BST (\`next()\` / \`hasNext()\` за амортизовано O(1), пам'ять O(h)) — та сама ідея, що in-order зі стеком.
`
      },
      {
        id: 'ds-level-order', group: "trees",
        type: 'code',
        level: 2,
        interview: true,
        title: 'Обхід по рівнях (BFS)',
        tags: ['tree', 'bfs', 'queue'],
        description: `
**Завдання.** Напишіть \`levelOrder(root)\`: поверніть значення вузлів **по рівнях** зліва направо — масив масивів.

**Де трапляється:** рендер дерева по рівнях, меню з вкладеністю.

\`\`\`text
    3
   / \\
  9  20
    /  \\
   15   7      ⇒ [[3], [9, 20], [15, 7]]
\`\`\`

Порожнє дерево → \`[]\`.

**Як це працює:** BFS по рівнях: беремо весь поточний рівень, записуємо його значення, а дітей збираємо в наступний рівень. Повторюємо, поки рівень не порожній.
`,
        starter: `function levelOrder(root) {
  // 1. Порожнє дерево → []
  // 2. Поточний рівень = [root]; поки не порожній — записати значення
  // 3. Наступний рівень — усі непорожні діти
  // TODO
}
`,
        solution: `function levelOrder(root) {
  if (!root) return [];
  const result = [];
  let level = [root];
  while (level.length) {
    result.push(level.map((n) => n.val));
    // наступний рівень — діти всіх вузлів поточного рівня
    const next = [];
    for (const n of level) {
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    level = next;
  }
  return result;
}
`,
        hints: [
          "Обхід по рівнях — це BFS, потрібна черга.",
          "Щоб знати межі рівнів: на початку кожної ітерації запам'ятайте, скільки вузлів зараз у черзі, — це весь поточний рівень.",
          "Ще простіше: тримайте масив вузлів поточного рівня; наступний рівень — масив їхніх дітей. Не використовуйте `shift()` — він O(n)."
        ],
        tests: [
          { name: 'приклад з умови', code: TREE + 'expect(levelOrder(tree([3, 9, 20, null, null, 15, 7]))).toEqual([[3], [9, 20], [15, 7]]);' },
          { name: 'порожнє дерево', code: 'expect(levelOrder(null)).toEqual([]);' },
          { name: 'один вузол', code: TREE + 'expect(levelOrder(tree([1]))).toEqual([[1]]);' },
          { name: 'неповні рівні', code: TREE + 'expect(levelOrder(tree([1, 2, 3, 4, null, null, 5]))).toEqual([[1], [2, 3], [4, 5]]);\nexpect(levelOrder(tree([1, null, 2, null, 3]))).toEqual([[1], [2], [3]]);' },
          { name: "від'ємні значення і дублікати", code: TREE + 'expect(levelOrder(tree([0, -1, -1, 2, 2]))).toEqual([[0], [-1, -1], [2, 2]]);' },
          { name: 'збалансоване дерево з 10^5 вузлів — O(n)', code: TREE + 'const root = balanced(1, 1e5);\nconst t0 = performance.now();\nconst r = levelOrder(root);\nconst ms = performance.now() - t0;\nexpect(r.length).toBe(17);\nexpect(r.reduce((s, l) => s + l.length, 0)).toBe(1e5);\nexpect(r[1]).toEqual([25000, 75000]);\nexpect(ms).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** BFS по рівнях (level-order traversal).

**Ідея:** обробляємо дерево «хвилями»: поточний рівень → збираємо значення → формуємо наступний рівень з дітей. Класичний варіант — одна черга і \`const size = queue.length\` на початку ітерації, щоб відокремити рівень.

**Складність:** O(n) часу, O(w) пам'яті, де w — максимальна ширина (до ~n/2 для повного дерева).

**Чому не \`shift()\`:** черга на \`push\` + \`shift\` формально O(n²) — кожен \`shift\` зсуває масив. Варіанти: масив рівня (як у рішенні), індекс голови, дві черги.

**DFS-альтернатива:** рекурсія з параметром \`depth\`: \`(result[depth] ??= []).push(node.val)\` — теж O(n), порядок у рівні зберігається, якщо йти спочатку вліво.

**Типові помилки:**
- усі значення в одному масиві (не відокремили рівні);
- додавання \`null\`-дітей у чергу без перевірки.

**Що можуть спитати далі:** зигзаг-обхід; правий вид дерева (Right Side View — останній елемент кожного рівня); середнє на кожному рівні; мінімальна глибина через BFS з ранньою зупинкою; з'єднати вузли одного рівня вказівником \`next\`.
`
      },
      {
        id: 'ds-symmetric-tree', group: "trees",
        type: 'code',
        level: 2,
        title: 'Симетричне дерево',
        tags: ['tree', 'dfs', 'recursion'],
        description: `
**Завдання.** Напишіть \`isSymmetric(root)\`: чи є дерево дзеркальним відображенням самого себе відносно центральної осі.

**Де трапляється:** порівняння структур дерев.

\`\`\`text
    1                1
   / \\              / \\
  2   2            2   2
 / \\ / \\            \\   \\
3  4 4  3            3   3
⇒ true             ⇒ false
\`\`\`

Порожнє дерево — симетричне.

**Як це працює:** Дерево симетричне, якщо ліве і праве піддерева — дзеркальні: значення рівні, і left.left дзеркальний до right.right, а left.right — до right.left. Перевіряємо пари вузлів.
`,
        starter: `function isSymmetric(root) {
  // 1. Порожнє → true
  // 2. Перевіряти пари (a, b): обидва null — ок; один null або різні значення — false
  // 3. Далі пари (a.left, b.right) і (a.right, b.left)
  // TODO
}
`,
        solution: `function isSymmetric(root) {
  if (!root) return true;
  // дзеркальні пари: (лівий.лівий, правий.правий) і (лівий.правий, правий.лівий)
  const stack = [[root.left, root.right]];
  while (stack.length) {
    const [a, b] = stack.pop();
    if (!a && !b) continue;
    if (!a || !b || a.val !== b.val) return false;
    stack.push([a.left, b.right], [a.right, b.left]);
  }
  return true;
}
`,
        hints: [
          "Дерево симетричне, якщо його ліве піддерево — дзеркало правого.",
          "Напишіть допоміжну `isMirror(a, b)`: обидва `null` → true; один `null` або різні значення → false; інакше порівняти «зовнішні» і «внутрішні» пари дітей.",
          "`isMirror(a, b) = a.val === b.val && isMirror(a.left, b.right) && isMirror(a.right, b.left)`. Те саме можна зробити ітеративно через стек пар."
        ],
        tests: [
          { name: 'симетричне дерево', code: TREE + 'expect(isSymmetric(tree([1, 2, 2, 3, 4, 4, 3]))).toBe(true);' },
          { name: 'несиметрична структура', code: TREE + 'expect(isSymmetric(tree([1, 2, 2, null, 3, null, 3]))).toBe(false);' },
          { name: 'порожнє дерево і один вузол', code: TREE + 'expect(isSymmetric(null)).toBe(true);\nexpect(isSymmetric(tree([1]))).toBe(true);' },
          { name: 'та сама структура, але різні значення', code: TREE + 'expect(isSymmetric(tree([1, 2, 3]))).toBe(false);\nexpect(isSymmetric(tree([1, 2, 2, 3, 4, 3, 4]))).toBe(false);' },
          { name: 'однакові піддерева — ще не дзеркальні', code: TREE + 'expect(isSymmetric(tree([1, 2, 2, 3, null, 3, null]))).toBe(false);' },
          { name: 'велике симетричне дерево', code: TREE + 'const mirror = (n) => n && node(n.val, mirror(n.right), mirror(n.left));\nconst left = balanced(1, 5e4);\nconst root = node(0, left, mirror(left));\nconst t0 = performance.now();\nexpect(isSymmetric(root)).toBe(true);\nroot.right.left.val = -1;\nexpect(isSymmetric(root)).toBe(false);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** DFS по **парах** вузлів (порівняння двох дерев одночасно).

**Ідея:** дві частини дзеркальні, якщо корені рівні, а «зовнішні» (\`a.left\` ↔ \`b.right\`) і «внутрішні» (\`a.right\` ↔ \`b.left\`) пари теж дзеркальні.

Рекурсивно:
\`\`\`js
const isMirror = (a, b) =>
  !a && !b ? true :
  !a || !b ? false :
  a.val === b.val && isMirror(a.left, b.right) && isMirror(a.right, b.left);
\`\`\`

**Складність:** O(n) часу, O(h) пам'яті (стек рекурсії або явний стек пар).

**Альтернатива:** BFS по рівнях і перевірка кожного рівня (з \`null\`) на паліндром — теж O(n), але більше пам'яті.

**Типові помилки:**
- порівнювати \`a.left\` з \`b.left\` — це перевірка на **однаковість**, а не дзеркальність (тест з однаковими піддеревами це ловить);
- перевіряти лише значення in-order обходу — різні структури можуть дати той самий масив.

**Що можуть спитати далі:** Same Tree (однакові дерева); Subtree of Another Tree; Flip Equivalent Trees.
`
      },
      {
        id: 'ds-path-sum', group: "trees",
        type: 'code',
        level: 2,
        title: 'Path Sum: шлях від кореня до листа',
        tags: ['tree', 'dfs'],
        description: `
**Завдання.** Напишіть \`hasPathSum(root, target)\`: чи існує шлях **від кореня до листа**, сума значень на якому дорівнює \`target\`. Лист — вузол без дітей. Значення можуть бути від'ємними.

**Де трапляється:** пошук шляху в ієрархії (категорії, меню).

\`\`\`text
        5
       / \\
      4   8
     /   / \\
    11  13  4
   /  \\      \\
  7    2      1

hasPathSum(root, 22) → true   (5 → 4 → 11 → 2)
hasPathSum(root, 9)  → false  (5 → 4 — 4 не лист)
\`\`\`

Для порожнього дерева — \`false\`.

**Як це працює:** Спускаємось від кореня, віднімаючи значення вузла від target. У листі перевіряємо, чи залишок 0. Відповідь — true, якщо хоча б одна гілка дала true.
`,
        starter: `function hasPathSum(root, target) {
  // 1. null → false
  // 2. rest = target − root.val; лист → rest === 0
  // 3. Інакше рекурсія в лівого або правого
  // TODO
}
`,
        solution: `function hasPathSum(root, target) {
  if (!root) return false;
  const rest = target - root.val;
  // перевіряємо суму лише в ЛИСТІ
  if (!root.left && !root.right) return rest === 0;
  return hasPathSum(root.left, rest) || hasPathSum(root.right, rest);
}
`,
        hints: [
          "Ідіть зверху вниз і передавайте в рекурсію, скільки ще залишилось набрати.",
          "Для вузла: `rest = target - root.val`. Якщо вузол — лист, відповідь `rest === 0`. Інакше — перевірте ліве АБО праве піддерево з `rest`.",
          "Пастка: не можна повертати `true`, коли `rest === 0` у вузлі з дітьми, і не можна вважати `null` листом (`hasPathSum(null, 0)` має бути `false`)."
        ],
        tests: [
          { name: 'шляхи, що існують', code: TREE + 'const r = tree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]);\nexpect(hasPathSum(r, 22)).toBe(true);\nexpect(hasPathSum(r, 26)).toBe(true);\nexpect(hasPathSum(r, 18)).toBe(true);\nexpect(hasPathSum(r, 27)).toBe(true);' },
          { name: 'сума на не-листі не рахується', code: TREE + 'const r = tree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]);\nexpect(hasPathSum(r, 9)).toBe(false);\nexpect(hasPathSum(r, 5)).toBe(false);' },
          { name: 'порожнє дерево', code: 'expect(hasPathSum(null, 0)).toBe(false);' },
          { name: 'корінь з однією дитиною — не лист', code: TREE + 'expect(hasPathSum(tree([1, 2]), 1)).toBe(false);\nexpect(hasPathSum(tree([1, 2]), 3)).toBe(true);' },
          { name: "від'ємні значення", code: TREE + 'expect(hasPathSum(tree([-2, null, -3]), -5)).toBe(true);\nexpect(hasPathSum(tree([1, -2, -3, 1, 3, -2, null, -1]), -1)).toBe(true);\nexpect(hasPathSum(tree([1, -2, 3]), 0)).toBe(false);' },
          { name: 'один вузол', code: TREE + 'expect(hasPathSum(tree([7]), 7)).toBe(true);\nexpect(hasPathSum(tree([7]), 0)).toBe(false);' }
        ],
        explanation: `
**Патерн:** DFS зверху вниз (top-down) з передачею стану — «залишок суми».

**Ідея:** віднімаємо значення вузла від цілі і спускаємося. У листі перевіряємо, чи залишок став нулем. \`||\` дає ранню зупинку: як тільки знайшли шлях — далі не шукаємо.

**Складність:** O(n) часу, O(h) пам'яті.

**Типові помилки:**
- перевірка суми у вузлі з дітьми (тест \`target = 9\`);
- база \`if (!root) return target === 0\` — тоді \`[1, 2]\` з \`target = 1\` дасть \`true\` через порожню праву дитину;
- рання зупинка «сума вже більша за target» — неправильна, бо є від'ємні значення.

**Що можуть спитати далі:** повернути всі такі шляхи (Path Sum II — backtracking з масивом шляху); кількість шляхів з довільного вузла вниз (Path Sum III — префіксні суми + Map, O(n)); максимальна сума шляху між будь-якими вузлами (Binary Tree Maximum Path Sum, L4).
`
      },
      {
        id: 'ds-diameter', group: "trees",
        type: 'code',
        level: 3,
        title: 'Діаметр бінарного дерева',
        tags: ['tree', 'dfs', 'post-order'],
        description: `
**Завдання.** Напишіть \`diameterOfBinaryTree(root)\`: довжина (у **ребрах**) найдовшого шляху між будь-якими двома вузлами дерева. Шлях **не обов'язково** проходить через корінь.

**Де трапляється:** post-order з глобальним максимумом.

\`\`\`text
      1
     / \\
    2   3
   / \\
  4   5        ⇒ 3   (4 → 2 → 1 → 3 або 5 → 2 → 1 → 3)
\`\`\`

Для порожнього дерева і одного вузла — \`0\`. Очікується O(n).

**Як це працює:** Рекурсивно рахуємо висоту кожного піддерева. Найдовший шлях через вузол = висота лівого + висота правого; глобальний максимум цих сум — діаметр.
`,
        starter: `function diameterOfBinaryTree(root) {
  // 1. best = 0
  // 2. height(node): null → 0; best = max(best, hl + hr); повернути 1 + max(hl, hr)
  // 3. Викликати height(root) і повернути best
  // TODO
}
`,
        solution: `function diameterOfBinaryTree(root) {
  let best = 0;
  // повертає висоту піддерева у вузлах і попутно оновлює найкращий діаметр
  function height(node) {
    if (!node) return 0;
    const l = height(node.left);
    const r = height(node.right);
    best = Math.max(best, l + r); // найдовший шлях, що «перегинається» в цьому вузлі
    return 1 + Math.max(l, r);
  }
  height(root);
  return best;
}
`,
        hints: [
          "Будь-який шлях має одну найвищу точку, де він «перегинається». Довжина такого шляху = висота лівого піддерева + висота правого.",
          "Порахуйте висоти post-order DFS (знизу вгору) і в кожному вузлі оновлюйте глобальний максимум `left + right`.",
          "Функція `height(node)` повертає `1 + max(l, r)` (висота у вузлах), а в зовнішню змінну записує `best = max(best, l + r)`. Окремий виклик `height` для кожного вузла дає O(n²) — не робіть так."
        ],
        tests: [
          { name: 'приклад з умови', code: TREE + 'expect(diameterOfBinaryTree(tree([1, 2, 3, 4, 5]))).toBe(3);' },
          { name: 'порожнє дерево і один вузол', code: TREE + 'expect(diameterOfBinaryTree(null)).toBe(0);\nexpect(diameterOfBinaryTree(tree([1]))).toBe(0);' },
          { name: 'два вузли', code: TREE + 'expect(diameterOfBinaryTree(tree([1, 2]))).toBe(1);' },
          { name: 'найдовший шлях не проходить через корінь', code: TREE + 'expect(diameterOfBinaryTree(tree([1, 2, null, 3, 4, 5, null, null, 6, 7, null, null, 8]))).toBe(6);' },
          { name: 'вироджене дерево', code: TREE + 'expect(diameterOfBinaryTree(tree([1, 2, null, 3, null, 4]))).toBe(3);' },
          { name: 'велике збалансоване дерево', code: TREE + 'const root = balanced(1, (1 << 16) - 1);\nconst t0 = performance.now();\nexpect(diameterOfBinaryTree(root)).toBe(30);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** post-order DFS з глобальним максимумом («повертаємо одне, оновлюємо інше»). Той самий шаблон — у Balanced Binary Tree, Binary Tree Maximum Path Sum, Longest Univalue Path.

**Ідея:** кожен шлях має найвищий вузол. Для нього довжина шляху = \`h(left) + h(right)\` ребер (висоти — у вузлах). Рекурсія повертає батькові висоту (бо батько може продовжити лише одну гілку), а кандидата на діаметр записує в замикання.

**Складність:** O(n) часу, O(h) пам'яті.

**Brute force:** для кожного вузла окремо рахувати висоти піддерев — O(n²) для виродженого дерева (O(n log n) для збалансованого).

**Типові помилки:**
- відповідь лише \`h(left) + h(right)\` кореня — шлях може не проходити через корінь (тест з глибоким лівим піддеревом);
- плутанина вузли/ребра: діаметр у ребрах = сума висот піддерев у вузлах;
- повернення \`l + r\` з рекурсії замість \`1 + max(l, r)\`.

**Що можуть спитати далі:** діаметр N-арного дерева (дві найбільші висоти серед дітей); діаметр довільного дерева/графа (два BFS); Maximum Path Sum (з від'ємними значеннями — \`Math.max(0, gain)\`).
`
      },
      {
        id: 'ds-lca', group: "trees",
        type: 'code',
        level: 3,
        title: 'Найнижчий спільний предок (LCA)',
        tags: ['tree', 'dfs', 'post-order'],
        description: `
**Завдання.** Напишіть \`lowestCommonAncestor(root, p, q)\`: \`p\` і \`q\` — **посилання на вузли** дерева (\`{ val, left, right }\`). Поверніть найнижчий вузол, для якого і \`p\`, і \`q\` є нащадками (вузол вважається нащадком самого себе).

**Де трапляється:** спільний предок двох вузлів DOM чи оргструктури.

Дерево — **звичайне бінарне** (не BST). Обидва вузли гарантовано є в дереві.

\`\`\`text
         3
       /   \\
      5     1
     / \\   / \\
    6   2 0   8
       / \\
      7   4

LCA(5, 1) = 3
LCA(5, 4) = 5   (вузол — предок самого себе)
LCA(6, 4) = 5
\`\`\`

**Як це працює:** Якщо вузол — один з p, q або null — повертаємо його. Інакше шукаємо в обох піддеревах: знайшлися в обох — поточний вузол і є спільним предком; лише в одному — повертаємо ту відповідь.
`,
        starter: `function lowestCommonAncestor(root, p, q) {
  // 1. root null або root === p або root === q → root
  // 2. Рекурсія в left і right
  // 3. Обидва знайдені → root, інакше той, що не null
  // TODO
}
`,
        solution: `function lowestCommonAncestor(root, p, q) {
  // база: дійшли до кінця або знайшли один із шуканих вузлів
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  // p і q у різних піддеревах — поточний вузол і є точкою розгалуження
  if (left && right) return root;
  // інакше передаємо нагору те, що знайшли (або null)
  return left || right;
}
`,
        hints: [
          "Post-order: нехай кожне піддерево повідомить, чи знайшло воно `p` або `q`.",
          "Рекурсія повертає: `null`, якщо в піддереві немає ні `p`, ні `q`; сам вузол, якщо він — `p` або `q`; або вже знайдений LCA.",
          "Якщо і ліве, і праве піддерево повернули не-null — поточний вузол і є LCA. Інакше поверніть той результат, що не null."
        ],
        tests: [
          { name: 'вузли в різних піддеревах кореня', code: TREE + 'const r = tree([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);\nexpect(lowestCommonAncestor(r, findNode(r, 5), findNode(r, 1))).toBe(r);\nexpect(lowestCommonAncestor(r, findNode(r, 7), findNode(r, 8))).toBe(r);' },
          { name: 'один вузол — предок іншого', code: TREE + 'const r = tree([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);\nconst five = findNode(r, 5);\nexpect(lowestCommonAncestor(r, five, findNode(r, 4))).toBe(five);' },
          { name: 'глибше в дереві', code: TREE + 'const r = tree([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);\nexpect(lowestCommonAncestor(r, findNode(r, 6), findNode(r, 4))).toBe(findNode(r, 5));\nexpect(lowestCommonAncestor(r, findNode(r, 7), findNode(r, 4))).toBe(findNode(r, 2));' },
          { name: 'p === q', code: TREE + 'const r = tree([3, 5, 1]);\nconst one = findNode(r, 1);\nexpect(lowestCommonAncestor(r, one, one)).toBe(one);' },
          { name: 'дерево з двох вузлів', code: TREE + 'const r = tree([1, 2]);\nexpect(lowestCommonAncestor(r, r, r.left)).toBe(r);' },
          { name: 'порівнює посилання, а не значення', code: TREE + 'const r = tree([1, 2, 2, 3, null, null, 3]);\nconst a = r.left.left, b = r.right.right;\nexpect(lowestCommonAncestor(r, a, b)).toBe(r);\nexpect(lowestCommonAncestor(r, r.left, a)).toBe(r.left);' },
          { name: 'велике дерево (10^5 вузлів) — O(n)', code: TREE + 'const r = balanced(1, 1e5);\nconst p = findNode(r, 1), q = findNode(r, 5);\nconst t0 = performance.now();\nexpect(lowestCommonAncestor(r, p, q).val).toBe(3);\nexpect(lowestCommonAncestor(r, findNode(r, 1), findNode(r, 1e5)).val).toBe(50000);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** post-order DFS — рішення у вузлі на основі результатів піддерев.

**Ідея:** рекурсія «піднімає» вгору знайдені вузли. Перший вузол, у якого результат прийшов і зліва, і справа, — точка, де шляхи до \`p\` і \`q\` розходяться, тобто LCA. Якщо сам вузол — \`p\` (чи \`q\`), повертаємо його одразу: навіть якщо другий вузол глибше в його піддереві, LCA — саме він.

**Складність:** O(n) часу, O(h) пам'яті.

**Альтернативи:**
- зберегти \`parent\` для кожного вузла (BFS + Map), піднятися від \`p\`, записавши предків у Set, потім піднятися від \`q\` до першого спільного — O(n) часу і пам'яті, зате ітеративно;
- знайти шляхи від кореня до \`p\` і до \`q\` і взяти останній спільний вузол.

**Для BST** усе простіше — O(h) без обходу всього дерева: якщо обидва значення менші за \`root.val\` — йдемо вліво, обидва більші — вправо, інакше \`root\` і є відповіддю.

**Типові помилки:**
- порівняння за \`val\` замість посилань (дублікати значень);
- спроба шукати «вглиб» після того, як знайшли \`p\` — зайва робота;
- незрозумілі сигнали рекурсії: формулюйте вголос, що саме повертає функція.

**Що можуть спитати далі:** LCA для BST; LCA, якщо вузлів може не бути в дереві (потрібні лічильники знайденого); LCA з посиланнями на батька (як перетин двох списків); спільний предок двох DOM-елементів (\`Node.contains\`, \`parentNode\`, \`Range.commonAncestorContainer\`).
`
      },
      {
        id: 'ds-serialize-tree', group: "trees",
        type: 'code',
        level: 4,
        title: 'Серіалізація та десеріалізація бінарного дерева',
        tags: ['tree', 'bfs', 'design'],
        description: `
**Завдання.** Реалізуйте дві функції:

**Де трапляється:** збереження дерева в рядок і відновлення.

- \`serialize(root)\` — перетворює бінарне дерево (\`{ val, left, right }\`, значення — цілі числа) на **рядок**;
- \`deserialize(data)\` — відновлює з рядка дерево **тієї ж структури** з тими ж значеннями.

Формат рядка — на ваш розсуд; головне, щоб \`deserialize(serialize(tree))\` повертало еквівалентне дерево. Дерево може містити 10⁵ вузлів — потрібна лінійна складність.

\`\`\`js
const s = serialize(root);  // наприклад '1,2,3,#,#,4,5'
const copy = deserialize(s); // нове дерево тієї ж форми
\`\`\`

**Як це працює:** Обхід (наприклад, BFS) з маркером для порожніх дітей ('#' або null) зберігає форму дерева. Десеріалізація читає значення в тому самому порядку і відновлює зв'язки.
`,
        starter: `// План:
// 1. serialize: BFS, для null писати маркер; прибрати кінцеві маркери
// 2. deserialize: перше значення — корінь, далі по черзі призначати left і right вузлам з черги

function serialize(root) {
  // TODO
}

function deserialize(data) {
  // TODO
}
`,
        solution: `// Формат: level-order (BFS), значення через кому, '#' — відсутній вузол.
function serialize(root) {
  if (!root) return '';
  const out = [];
  const queue = [root];
  for (let h = 0; h < queue.length; h++) { // індекс голови замість shift()
    const node = queue[h];
    if (node) {
      out.push(String(node.val));
      queue.push(node.left, node.right);
    } else {
      out.push('#');
    }
  }
  while (out[out.length - 1] === '#') out.pop(); // хвостові null не потрібні
  return out.join(',');
}

function deserialize(data) {
  if (!data) return null;
  const parts = data.split(',');
  const make = (s) => (s === '#' || s === undefined ? null : { val: Number(s), left: null, right: null });
  const root = make(parts[0]);
  const queue = [root];
  let i = 1;
  for (let h = 0; h < queue.length && i < parts.length; h++) {
    const node = queue[h];
    node.left = make(parts[i++]);
    node.right = make(parts[i++]);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return root;
}
`,
        hints: [
          "Лише значення без маркерів порожніх вузлів не дозволять однозначно відновити структуру. Записуйте і `null`-дітей (наприклад, `#`).",
          "Два популярні формати: pre-order з маркерами `#` (десеріалізація — рекурсія з вказівником на поточний токен) або level-order (BFS) з маркерами.",
          "Для level-order: десеріалізуючи, тримайте чергу вузлів, що чекають на дітей; кожен вузол із черги забирає по два наступні токени — лівий і правий. Не використовуйте `shift()` на великих даних."
        ],
        tests: [
          { name: 'serialize повертає рядок', code: TREE + "expect(typeof serialize(tree([1, 2, 3]))).toBe('string');" },
          { name: 'round-trip базового дерева', code: TREE + 'const t = tree([1, 2, 3, null, null, 4, 5]);\nexpect(toLevel(deserialize(serialize(t)))).toEqual([1, 2, 3, null, null, 4, 5]);' },
          { name: 'порожнє дерево', code: 'expect(deserialize(serialize(null))).toBeNull();' },
          { name: 'один вузол, нуль та від\'ємні значення', code: TREE + 'expect(toLevel(deserialize(serialize(tree([0]))))).toEqual([0]);\nexpect(toLevel(deserialize(serialize(tree([-1, -20, 300, null, -4]))))).toEqual([-1, -20, 300, null, -4]);' },
          { name: 'відновлене дерево — нові об\'єкти, оригінал не змінено', code: TREE + 'const t = tree([5, 3, 8]);\nconst copy = deserialize(serialize(t));\nexpect(copy).not.toBe(t);\nexpect(copy.left).not.toBe(t.left);\nexpect(toLevel(t)).toEqual([5, 3, 8]);' },
          { name: 'вироджене дерево (1000 рівнів)', code: TREE + 'let root = null;\nfor (let i = 0; i < 1000; i++) root = node(i, i % 2 ? root : null, i % 2 ? null : root);\nconst copy = deserialize(serialize(root));\nexpect(toLevel(copy)).toEqual(toLevel(root));' },
          { name: 'round-trip 10^5 вузлів — O(n)', code: TREE + 'const root = balanced(1, 1e5);\nconst t0 = performance.now();\nconst copy = deserialize(serialize(root));\nconst ms = performance.now() - t0;\nconst a = toLevel(copy), b = toLevel(root);\nexpect(a.length).toBe(b.length);\nexpect(a.every((v, i) => v === b[i])).toBe(true);\nexpect(ms).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** обхід дерева з маркерами порожніх вузлів (BFS або pre-order DFS).

**Чому потрібні маркери:** один лише pre-order (чи in-order) не задає структуру однозначно: \`[1, 2]\` може бути \`2\` ліворуч або праворуч. З маркерами \`#\` обхід стає однозначним. (Без маркерів дерево можна відновити з **двох** обходів — pre-order + in-order — і лише за унікальних значень.)

**Варіант 1 — level-order (у рішенні):** серіалізація — BFS з \`#\` для \`null\`; десеріалізація — черга батьків, кожен забирає два наступні токени. Повністю ітеративно — не боїться глибоких дерев.

**Варіант 2 — pre-order з \`#\`:**
\`\`\`js
const serialize = (n) => (n ? n.val + ',' + serialize(n.left) + ',' + serialize(n.right) : '#');
function deserialize(s) {
  const t = s.split(','); let i = 0;
  const build = () => { const v = t[i++]; if (v === '#') return null;
    const n = { val: +v, left: null, right: null }; n.left = build(); n.right = build(); return n; };
  return build();
}
\`\`\`
Коротше, але рекурсивне (глибина = висота дерева) і рядкова конкатенація в рекурсії — краще збирати масив токенів.

**Складність:** O(n) часу й пам'яті для обох функцій.

**Типові помилки:**
- \`queue.shift()\` → O(n²) на великих деревах;
- \`JSON.stringify(root)\` «працює», але це не відповідь на питання і вибухає на глибоких деревах;
- \`parseInt\`/\`Number\` для \`'#'\` → \`NaN\` замість \`null\`;
- \`if (!data)\` не обробляє порожній рядок для порожнього дерева — або навпаки, \`'0'\` вважається порожнім при неуважній перевірці.

**Що можуть спитати далі:** як серіалізувати N-арне дерево; серіалізація BST компактніше (лише pre-order, без маркерів — межі значень відновлюють структуру); як серіалізувати граф із циклами (id вузлів + список ребер); як \`structuredClone\` справляється з циклічними посиланнями.
`
      },
      // ===================================================== BST
      {
        id: 'ds-quiz-bst-worst-case', group: "bst", why: ["Ні: дерево виродилось у список.","Ні: log n лише для збалансованого дерева.","Ні: це складність n вставок, а не однієї операції.","Так: відсортовані вставки дають ланцюжок висоти n."],
        type: 'quiz',
        level: 2,
        title: 'BST після вставки відсортованих даних',
        tags: ['bst', 'complexity'],
        question: `
У **звичайне** (не самобалансоване) бінарне дерево пошуку по черзі вставляють числа \`1, 2, 3, …, n\`. Яка складність пошуку елемента в отриманому дереві?
`,
        options: ['`O(1)`', '`O(log n)`', '`O(n log n)`', '`O(n)`'],
        answer: 3,
        hint: 'Куди піде кожен наступний елемент, якщо він більший за всі попередні? Яку форму матиме дерево?',
        explanation: `
Кожне наступне число більше за всі попередні, тож іде **в праву дитину** останнього вузла. Дерево вироджується в ланцюжок (по суті — зв'язний список) висоти n, і пошук стає **O(n)**.

- \`O(log n)\` — це складність для **збалансованого** BST (висота ≈ log₂n). Саме тому існують самобалансовані дерева: AVL, червоно-чорні (на них побудовані \`TreeMap\` у Java, \`std::map\` у C++).
- \`O(1)\` — так працює хеш-таблиця в середньому, не дерево.
- \`O(n log n)\` — це складність **побудови** збалансованого дерева з n елементів (n вставок по O(log n)), а не одного пошуку. Побудова виродженого дерева — взагалі O(n²).

Практичний висновок: якщо дані можуть прийти відсортованими, або перемішайте їх перед вставкою, або будуйте збалансоване дерево з відсортованого масиву (середина — корінь, рекурсивно для половин).
`
      },
      {
        id: 'ds-bst-class', group: "bst",
        type: 'code',
        level: 2,
        title: 'Бінарне дерево пошуку: insert / has / min / max',
        tags: ['bst', 'class'],
        description: `
**Завдання.** Реалізуйте клас \`BST\` — бінарне дерево пошуку. Вузли — \`{ val, left, right }\`, корінь — публічне поле \`root\` (\`null\` для порожнього).

**Де трапляється:** впорядковані колекції з швидким пошуком.

- \`insert(val)\` — вставити (дублікати **ігноруються**); повертає \`this\`;
- \`has(val)\` — чи є значення в дереві;
- \`min()\` / \`max()\` — найменше / найбільше значення (\`null\` для порожнього);
- \`toArray()\` — значення у відсортованому порядку;
- \`size\` — кількість елементів (геттер або метод).

Інваріант BST: усі значення лівого піддерева **менші** за вузол, правого — **більші**.

\`\`\`js
const t = new BST();
[5, 3, 8, 1, 4].forEach((x) => t.insert(x));
t.has(4);     // true
t.min();      // 1
t.max();      // 8
t.toArray();  // [1, 3, 4, 5, 8]
\`\`\`

**Як це працює:** Ліві нащадки менші за вузол, праві — більші. insert і has йдуть від кореня вліво або вправо за порівнянням. min — найлівіший вузол, max — найправіший.
`,
        starter: `// План:
// 1. insert: від кореня вліво (менше) або вправо (більше); дублікати ігнорувати
// 2. has: так само спускатися до вузла або null
// 3. min — найлівіший, max — найправіший вузол

class BST {
  constructor() {
    this.root = null;
  }
  insert(val) {
    // TODO
  }
  has(val) {
    // TODO
  }
  min() {
    // TODO
  }
  max() {
    // TODO
  }
  toArray() {
    // TODO
  }
  get size() {
    // TODO
  }
}
`,
        solution: `class BST {
  constructor() {
    this.root = null;
    this.count = 0;
  }

  insert(val) {
    const node = { val, left: null, right: null };
    if (!this.root) {
      this.root = node;
      this.count++;
      return this;
    }
    let cur = this.root;
    while (true) { // ітеративно — не впаде на виродженому дереві
      if (val === cur.val) return this; // дублікат
      const side = val < cur.val ? 'left' : 'right';
      if (!cur[side]) {
        cur[side] = node;
        this.count++;
        return this;
      }
      cur = cur[side];
    }
  }

  has(val) {
    let cur = this.root;
    while (cur) {
      if (val === cur.val) return true;
      cur = val < cur.val ? cur.left : cur.right; // відкидаємо половину дерева
    }
    return false;
  }

  min() {
    if (!this.root) return null;
    let cur = this.root;
    while (cur.left) cur = cur.left; // найлівіший вузол
    return cur.val;
  }

  max() {
    if (!this.root) return null;
    let cur = this.root;
    while (cur.right) cur = cur.right; // найправіший вузол
    return cur.val;
  }

  toArray() {
    // in-order обхід зі стеком дає відсортований порядок
    const out = [], stack = [];
    let cur = this.root;
    while (cur || stack.length) {
      while (cur) { stack.push(cur); cur = cur.left; }
      cur = stack.pop();
      out.push(cur.val);
      cur = cur.right;
    }
    return out;
  }

  get size() {
    return this.count;
  }
}
`,
        hints: [
          "Пошук і вставка — це спуск від кореня: менше — вліво, більше — вправо.",
          "Вставка: спускайтеся, поки не знайдете порожнє місце (`null`) у потрібному напрямку, і повісьте туди новий вузол. Мінімум — найлівіший вузол, максимум — найправіший.",
          "`toArray` — in-order обхід (ліве → вузол → праве), він видає значення BST у відсортованому порядку. Лічильник `size` збільшуйте лише при реальній вставці (не для дубліката)."
        ],
        tests: [
          { name: 'insert і toArray повертає відсортовані значення', code: 'const t = new BST();\n[5, 3, 8, 1, 4, 7, 9].forEach((x) => t.insert(x));\nexpect(t.toArray()).toEqual([1, 3, 4, 5, 7, 8, 9]);\nexpect(t.root.val).toBe(5);\nexpect(t.root.left.val).toBe(3);\nexpect(t.root.right.val).toBe(8);' },
          { name: 'has', code: 'const t = new BST();\n[5, 3, 8].forEach((x) => t.insert(x));\nexpect(t.has(3)).toBe(true);\nexpect(t.has(8)).toBe(true);\nexpect(t.has(4)).toBe(false);' },
          { name: 'min і max', code: 'const t = new BST();\n[5, -3, 8, 12, 0].forEach((x) => t.insert(x));\nexpect(t.min()).toBe(-3);\nexpect(t.max()).toBe(12);' },
          { name: 'порожнє дерево', code: SZ + 'const t = new BST();\nexpect(t.root).toBeNull();\nexpect(t.has(1)).toBe(false);\nexpect(t.min()).toBeNull();\nexpect(t.max()).toBeNull();\nexpect(t.toArray()).toEqual([]);\nexpect(sz(t)).toBe(0);' },
          { name: 'дублікати ігноруються', code: SZ + 'const t = new BST();\n[2, 2, 1, 2, 1].forEach((x) => t.insert(x));\nexpect(t.toArray()).toEqual([1, 2]);\nexpect(sz(t)).toBe(2);' },
          { name: 'insert повертає this (ланцюжок)', code: 'const t = new BST();\nexpect(t.insert(1).insert(2)).toBe(t);' },
          { name: 'вироджене дерево з відсортованих даних (2000 вузлів)', code: SZ + 'const t = new BST();\nfor (let i = 0; i < 2000; i++) t.insert(i);\nexpect(t.max()).toBe(1999);\nexpect(t.has(1500)).toBe(true);\nexpect(sz(t)).toBe(2000);\nexpect(t.toArray().length).toBe(2000);' },
          { name: '10^5 випадкових вставок — O(log n) у середньому', code: SZ + 'const t = new BST();\nlet x = 12345;\nconst vals = [];\nfor (let i = 0; i < 1e5; i++) { x = (x * 48271) % 2147483647; vals.push(x); }\nconst t0 = performance.now();\nvals.forEach((v) => t.insert(v));\nlet found = 0;\nfor (let i = 0; i < 1e5; i += 7) if (t.has(vals[i])) found++;\nconst arr = t.toArray();\nconst ms = performance.now() - t0;\nexpect(found).toBe(Math.ceil(1e5 / 7));\nexpect(arr.length).toBe(new Set(vals).size);\nexpect(arr.every((v, i) => i === 0 || arr[i - 1] < v)).toBe(true);\nexpect(ms).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** бінарний пошук по дереву — на кожному кроці відкидаємо одне з піддерев.

**Складність:**
| Операція | Збалансоване | Вироджене |
|---|---|---|
| \`insert\` / \`has\` | O(log n) | O(n) |
| \`min\` / \`max\` | O(log n) | O(n) |
| \`toArray\` | O(n) | O(n) |

Пам'ять — O(n) для вузлів; ітеративні методи — O(1) додатково (\`toArray\` — O(h) на стек).

**Чому ітеративно:** рекурсивні \`insert\`/\`has\` коротші, але на виродженому дереві (відсортовані вставки) глибина = n → переповнення стеку.

**Видалення** (часте follow-up питання) — три випадки: лист — просто прибрати; одна дитина — підняти її на місце вузла; дві дитини — замінити значення на **in-order наступника** (мінімум правого піддерева) і видалити наступника.

**Типові помилки:**
- дублікати збільшують лічильник або вставляються в одну зі сторін без домовленості;
- \`min\`/\`max\` через \`toArray()\` — O(n) замість O(h);
- \`if (!val)\` замість \`if (!node)\` — ламається на значенні \`0\`.

**Що можуть спитати далі:** реалізуйте \`delete(val)\`; in-order наступник для вузла; побудувати збалансоване BST з відсортованого масиву; чим BST кращий за хеш-таблицю (упорядкованість: діапазони, min/max, наступний більший) і де гірший.
`
      },
      {
        id: 'ds-validate-bst', group: "bst",
        type: 'code',
        level: 3,
        title: 'Перевірити, чи дерево є BST',
        tags: ['bst', 'tree', 'dfs'],
        description: `
**Завдання.** Напишіть \`isValidBST(root)\`: чи є бінарне дерево (\`{ val, left, right }\`) коректним **бінарним деревом пошуку**:

**Де трапляється:** класика з межами min/max.

- усі значення **лівого піддерева** строго менші за значення вузла;
- усі значення **правого піддерева** строго більші;
- обидва піддерева теж є BST.

Дублікати не дозволені. Порожнє дерево — валідне.

\`\`\`text
    5
   / \\
  4   6
     / \\
    3   7      ⇒ false: 3 у правому піддереві 5, але 3 < 5
\`\`\`

**Як це працює:** Недостатньо порівнювати вузол з дітьми: кожен вузол має лежати в межах (low, high), що їх задають предки. Ідемо вниз, звужуючи межі.
`,
        starter: `function isValidBST(root) {
  // 1. Стек трійок [вузол, low, high]
  // 2. Значення поза (low, high) → false
  // 3. Лівий отримує high = val, правий — low = val
  // TODO
}
`,
        solution: `function isValidBST(root) {
  // кожен вузол має лежати в інтервалі (low, high), що звужується при спуску
  const stack = [[root, -Infinity, Infinity]];
  while (stack.length) {
    const [node, low, high] = stack.pop();
    if (!node) continue;
    if (node.val <= low || node.val >= high) return false;
    stack.push([node.left, low, node.val]);   // ліворуч: верхня межа — значення вузла
    stack.push([node.right, node.val, high]); // праворуч: нижня межа — значення вузла
  }
  return true;
}
`,
        hints: [
          "Перевірки «ліва дитина < вузол < права дитина» недостатньо — порушення може бути глибоко в піддереві.",
          "Передавайте при спуску допустимий інтервал `(low, high)`: для лівої дитини верхня межа стає значенням вузла, для правої — нижня.",
          "Почніть з `(-Infinity, Infinity)`. Альтернатива: in-order обхід BST має бути **строго зростаючим** — достатньо порівнювати кожне значення з попереднім."
        ],
        tests: [
          { name: 'валідне BST', code: TREE + 'expect(isValidBST(tree([2, 1, 3]))).toBe(true);\nexpect(isValidBST(tree([8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13]))).toBe(true);' },
          { name: 'порушення серед прямих дітей', code: TREE + 'expect(isValidBST(tree([5, 1, 4, null, null, 3, 6]))).toBe(false);' },
          { name: 'порушення глибоко в піддереві', code: TREE + 'expect(isValidBST(tree([5, 4, 6, null, null, 3, 7]))).toBe(false);\nexpect(isValidBST(tree([10, 5, 15, null, 12]))).toBe(false);' },
          { name: 'дублікати не дозволені', code: TREE + 'expect(isValidBST(tree([1, 1]))).toBe(false);\nexpect(isValidBST(tree([2, null, 2]))).toBe(false);' },
          { name: 'порожнє дерево і один вузол', code: TREE + 'expect(isValidBST(null)).toBe(true);\nexpect(isValidBST(tree([0]))).toBe(true);' },
          { name: 'граничні значення', code: TREE + 'expect(isValidBST(tree([2147483647]))).toBe(true);\nexpect(isValidBST(tree([-2147483648, null, 2147483647]))).toBe(true);\nexpect(isValidBST(tree([-5, -10, 0]))).toBe(true);' },
          { name: '10^5 вузлів — O(n)', code: TREE + 'const root = balanced(1, 1e5);\nconst t0 = performance.now();\nexpect(isValidBST(root)).toBe(true);\nconst deep = findNode(root, 3);\ndeep.val = 60000;\nexpect(isValidBST(root)).toBe(false);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** DFS з межами (bounds propagation) або in-order обхід з порівнянням із попереднім.

**Ідея з межами:** кожен вузол має лежати у вікні \`(low, high)\`, яке визначають усі його предки. Спуск ліворуч оновлює \`high\`, праворуч — \`low\`.

**Ідея з in-order:**
\`\`\`js
function isValidBST(root) {
  let prev = -Infinity;
  const stack = []; let cur = root;
  while (cur || stack.length) {
    while (cur) { stack.push(cur); cur = cur.left; }
    cur = stack.pop();
    if (cur.val <= prev) return false; // має строго зростати
    prev = cur.val;
    cur = cur.right;
  }
  return true;
}
\`\`\`

**Складність:** O(n) часу, O(h) пам'яті.

**Brute force:** для кожного вузла знаходити max лівого і min правого піддерева — O(n²) у гіршому випадку.

**Типові помилки:**
- порівняння лише з прямими дітьми (класична пастка — тест \`[5, 4, 6, null, null, 3, 7]\`);
- межі через \`Number.MIN_VALUE\` — це найменше **додатне** число (~5e-324), а не найменше число! Використовуйте \`-Infinity\` або \`null\`;
- нестроге порівняння (\`<\` замість \`<=\`) пропускає дублікати;
- зібрати in-order у масив і перевірити — працює, але O(n) зайвої пам'яті.

**Що можуть спитати далі:** відновити BST, у якому помилково поміняли місцями два вузли (Recover BST); найбільше піддерево, що є BST; перевірка збалансованості.
`
      },
      {
        id: 'ds-kth-smallest', group: "bst",
        type: 'code',
        level: 3,
        title: 'K-й найменший елемент у BST',
        tags: ['bst', 'tree', 'stack'],
        description: `
**Завдання.** Напишіть \`kthSmallest(root, k)\`: поверніть \`k\`-те (з 1) найменше значення у бінарному дереві пошуку (\`{ val, left, right }\`). Гарантовано \`1 ≤ k ≤ кількість вузлів\`.

**Де трапляється:** in-order обхід з лічильником.

Бажано зупинитися одразу, як тільки знайдено відповідь, — не обходити все дерево.

\`\`\`text
      5
     / \\
    3   6
   / \\
  2   4
 /
1                 kthSmallest(root, 3) → 3
\`\`\`

**Як це працює:** In-order обхід BST видає значення за зростанням. Обходимо ітеративно зі стеком і зупиняємось на k-му знятому вузлі.
`,
        starter: `function kthSmallest(root, k) {
  // 1. Ітеративний in-order зі стеком
  // 2. Іти вліво до кінця, зняти вузол, k-- 
  // 3. k === 0 → повернути значення; інакше перейти вправо
  // TODO
}
`,
        solution: `function kthSmallest(root, k) {
  const stack = [];
  let cur = root;
  while (cur || stack.length) {
    while (cur) {      // спуск до найменшого необробленого
      stack.push(cur);
      cur = cur.left;
    }
    cur = stack.pop();
    if (--k === 0) return cur.val; // k-й вузол in-order обходу
    cur = cur.right;
  }
  return null; // недосяжно за умови задачі
}
`,
        hints: [
          "Який обхід BST видає значення у відсортованому порядку?",
          "In-order обхід (ліве → вузол → праве). k-те відвідане значення і є відповіддю.",
          "Ітеративний in-order зі стеком дозволяє зупинитися одразу на k-му вузлі: зменшуйте `k` при кожному `pop` і повертайте значення, коли `k` стане 0."
        ],
        tests: [
          { name: 'k = 1 — мінімум', code: TREE + 'expect(kthSmallest(tree([3, 1, 4, null, 2]), 1)).toBe(1);' },
          { name: 'приклад з умови', code: TREE + 'expect(kthSmallest(tree([5, 3, 6, 2, 4, null, null, 1]), 3)).toBe(3);' },
          { name: 'k = кількість вузлів — максимум', code: TREE + 'expect(kthSmallest(tree([5, 3, 6, 2, 4, null, null, 1]), 6)).toBe(6);' },
          { name: 'один вузол', code: TREE + 'expect(kthSmallest(tree([42]), 1)).toBe(42);' },
          { name: "від'ємні значення", code: TREE + 'const r = tree([0, -10, 10, -20, -5]);\nexpect([1, 2, 3, 4, 5].map((k) => kthSmallest(r, k))).toEqual([-20, -10, -5, 0, 10]);' },
          { name: 'праве вироджене дерево', code: TREE + 'expect(kthSmallest(tree([1, null, 2, null, 3, null, 4]), 3)).toBe(3);' },
          { name: 'велике BST (10^5 вузлів)', code: TREE + 'const r = balanced(1, 1e5);\nconst t0 = performance.now();\nexpect(kthSmallest(r, 1)).toBe(1);\nexpect(kthSmallest(r, 777)).toBe(777);\nexpect(kthSmallest(r, 1e5)).toBe(1e5);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** in-order обхід BST = відсортований порядок; ітеративний варіант з ранньою зупинкою.

**Складність:** O(h + k) часу — спуск до мінімуму (h) і ще k кроків; O(h) пам'яті. У гіршому випадку O(n).

**Brute force:** зібрати всі значення in-order у масив і взяти \`arr[k - 1]\` — O(n) часу і пам'яті навіть для \`k = 1\`. Або взагалі відсортувати всі значення — O(n log n), ігноруючи властивість BST.

**Типові помилки:**
- рекурсія без ранньої зупинки — обходить усе дерево;
- k з нуля замість одиниці;
- лічильник у рекурсії як локальна змінна (передається за значенням) замість змінної в замиканні.

**Що можуть спитати далі:** дерево часто змінюється, а запити k-го дуже часті — як прискорити? (Зберігати в кожному вузлі розмір піддерева: тоді спуск O(h) — order-statistic tree.) k-й найбільший (зворотний in-order: праве → вузол → ліве). Два елементи BST із сумою target (два ітератори — прямий і зворотний).
`
      },
      // ===================================================== КУПА
      {
        id: 'ds-theory-heap', group: "heap", why: ["Ні: купа лише частково впорядкована — гарантований тільки мінімум.","Ні: вбудованої PriorityQueue в JS немає.","Так: sift up/down — O(log n), peek — O(1).","Ні: діти — 2i+1 і 2i+2.","Ні: bottom-up heapify — O(n)."],
        type: 'theory',
        level: 3,
        title: 'Купа (heap) і черга з пріоритетом',
        tags: ['heap', 'priority-queue'],
        question: 'Що таке бінарна купа (binary heap)? Як вона зберігається в масиві, як працюють вставка і видалення мінімуму, і для яких задач її використовують? Чи є купа в JavaScript?',
        choices: [
          'Купа повністю відсортована, тому k-й найменший елемент завжди лежить за індексом `k - 1`',
          'У JavaScript є вбудований `PriorityQueue`, тож на співбесіді купу писати самому не потрібно',
          'Вставка в купу — це sift up, видалення мінімуму — sift down, і обидві операції займають O(log n)',
          'Діти вузла `i` в масиві лежать за індексами `i + 1` і `i + 2`, а його батько — за індексом `i - 1`',
          'Побудова купи з масиву з n елементів завжди коштує O(n log n) — швидше зробити неможливо',
        ],
        correct: 2,
        hint: 'Повне бінарне дерево + властивість купи; формули індексів; sift up / sift down.',
        answer: `
**Бінарна купа** — **повне** бінарне дерево (усі рівні заповнені, крім, можливо, останнього, який заповнюється зліва направо), у якому виконується **властивість купи**: у min-купі батько ≤ дітей (у max-купі — ≥). Тому мінімум завжди в корені. Купа **не відсортована** повністю — впорядкування лише «батько — діти».

**Зберігання в масиві** (без вузлів і вказівників — завдяки повноті дерева):
- діти вузла \`i\`: \`2i + 1\` і \`2i + 2\`;
- батько: \`Math.floor((i - 1) / 2)\`.

**Операції:**
| Операція | Як | Складність |
|---|---|---|
| \`peek\` | \`heap[0]\` | O(1) |
| \`push\` | додати в кінець і **просіяти вгору** (sift up): міняти з батьком, поки він більший | O(log n) |
| \`pop\` | забрати корінь, на його місце — останній елемент, **просіяти вниз** (sift down): міняти з меншою дитиною | O(log n) |
| побудова з масиву (heapify) | sift down для i від n/2−1 до 0 | **O(n)** |
| пошук довільного елемента | лінійно | O(n) |

\`\`\`js
siftUp(i) {
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (this.a[p] <= this.a[i]) break;
    [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
    i = p;
  }
}
\`\`\`

**Де використовується:**
- top-K / k-й найбільший — купа розміру k: O(n log k);
- злиття k відсортованих списків — O(N log k);
- алгоритм Дейкстри, A*, планувальники задач;
- медіана потоку — дві купи (max-купа для меншої половини, min-купа для більшої);
- **React Scheduler** зберігає задачі в min-купі за часом закінчення (expiration time);
- heap sort — O(n log n), in-place, нестабільний.

**У JS вбудованої купи / PriorityQueue немає** — на співбесіді її пишуть самі (~30 рядків) або просять дозволу вважати, що вона є. Сортування масиву після кожної вставки — O(n log n) на операцію, це антипатерн.
`,
        keyPoints: [
          'Повне бінарне дерево + властивість купи (батько ≤ дітей для min-купи)',
          'Масив: діти 2i+1 і 2i+2, батько (i−1)/2',
          'push — sift up, pop — sift down, обидва O(log n); peek O(1); побудова O(n)',
          'Застосування: top-K, злиття k списків, Дейкстра, медіана потоку, планувальники',
          'У JS немає вбудованої купи — реалізують самостійно'
        ],
        followUps: [
          'Чому побудова купи з масиву — O(n), а не O(n log n)?',
          'Як знайти медіану потоку чисел?',
          'Чим купа відрізняється від BST? Коли що обрати?',
          'Як реалізувати decrease-key?'
        ]
      },
      {
        id: 'ds-quiz-heap-facts', group: "heap", why: ["Так: це стандартна індексація.","Ні: купа не відсортована.","Так: мінімум — корінь.","Ні: у купі пошук довільного — O(n).","Так: bottom-up heapify — O(n).","Ні: pop — O(log n) через sift down."],
        type: 'quiz',
        level: 3,
        title: 'Бінарна min-купа на масиві',
        tags: ['heap', 'complexity'],
        question: 'Оберіть **усі** правильні твердження про бінарну min-купу, збережену в масиві з індексацією з 0:',
        options: [
          'Діти вузла з індексом `i` мають індекси `2i + 1` і `2i + 2`',
          'Масив купи завжди відсортований за зростанням',
          '`peek()` (отримати мінімум) — O(1)',
          'Пошук довільного значення — O(log n), як у BST',
          'Побудова купи з n довільних елементів (bottom-up heapify) — O(n)',
          '`pop()` (видалити мінімум) — O(1)'
        ],
        answer: [0, 2, 4],
        hint: 'Купа гарантує порядок лише між батьком і дітьми, а не між «сусідами» чи різними гілками.',
        explanation: `
- **\`2i + 1\` і \`2i + 2\`** — так, це формули для 0-індексації (батько — \`(i - 1) >> 1\`).
- **\`peek\` — O(1)**: мінімум завжди в \`heap[0]\`.
- **Heapify — O(n)**: більшість вузлів — у нижніх рівнях і просіюються вниз лише на 0–1 рівень; сума \`Σ (n / 2^(h+1)) · h\` збігається до O(n).

Неправильні:
- **Не відсортований**: \`[1, 5, 2, 6, 7, 3]\` — валідна min-купа, але не відсортований масив.
- **Пошук — O(n)**: купа не каже, у яку гілку йти (на відміну від BST), тож довільне значення шукають лінійно.
- **\`pop\` — O(log n)**: після видалення кореня останній елемент ставиться на його місце і просіюється вниз по висоті дерева.
`
      },
      {
        id: 'ds-min-heap', group: "heap",
        type: 'code',
        level: 3,
        title: 'Реалізувати MinHeap (черга з пріоритетом)',
        tags: ['heap', 'priority-queue', 'class'],
        description: `
**Завдання.** Реалізуйте клас \`MinHeap\` на масиві:

**Де трапляється:** планувальники задач, Дейкстра, топ-k.

- \`constructor(compare = (a, b) => a - b)\` — компаратор як у \`sort\`: від'ємний результат означає, що \`a\` має вищий пріоритет (ближче до вершини);
- \`push(x)\` — додати, **O(log n)**;
- \`pop()\` — видалити і повернути елемент з найвищим пріоритетом (\`undefined\`, якщо порожньо), **O(log n)**;
- \`peek()\` — подивитися на нього без видалення, **O(1)**;
- \`size\` — геттер або метод.

\`\`\`js
const h = new MinHeap();
[5, 1, 4, 2].forEach((x) => h.push(x));
h.pop(); // 1
h.pop(); // 2

const maxHeap = new MinHeap((a, b) => b - a);
const tasks = new MinHeap((a, b) => a.priority - b.priority);
\`\`\`

**Як це працює:** Купа в масиві: діти вузла i — 2i + 1 і 2i + 2, батько — (i − 1) >> 1. push кладе в кінець і піднімає (sift up), pop бере корінь, ставить на його місце останній і опускає (sift down). Обидва O(log n).
`,
        starter: `// План:
// 1. Масив; діти i — 2i + 1 і 2i + 2, батько — (i − 1) >> 1
// 2. push: у кінець і sift up
// 3. pop: зберегти корінь, останній поставити в корінь і sift down
// 4. peek — a[0]; size — довжина

class MinHeap {
  constructor(compare = (a, b) => a - b) {
    // TODO
  }
  push(x) {
    // TODO
  }
  pop() {
    // TODO
  }
  peek() {
    // TODO
  }
  get size() {
    // TODO
  }
}
`,
        solution: `class MinHeap {
  constructor(compare = (a, b) => a - b) {
    this.cmp = compare;
    this.a = [];
  }

  get size() {
    return this.a.length;
  }

  peek() {
    return this.a[0];
  }

  push(x) {
    this.a.push(x);
    this.#siftUp(this.a.length - 1);
  }

  pop() {
    const a = this.a;
    if (a.length === 0) return undefined;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;         // останній елемент — на місце кореня
      this.#siftDown(0);   // і просіюємо вниз
    }
    return top;
  }

  #siftUp(i) {
    const a = this.a;
    while (i > 0) {
      const p = (i - 1) >> 1; // батько
      if (this.cmp(a[i], a[p]) >= 0) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }

  #siftDown(i) {
    const a = this.a;
    const n = a.length;
    while (true) {
      const l = 2 * i + 1;
      const r = l + 1;
      let best = i;
      if (l < n && this.cmp(a[l], a[best]) < 0) best = l;
      if (r < n && this.cmp(a[r], a[best]) < 0) best = r;
      if (best === i) break; // обидві дитини не менші — властивість купи відновлено
      [a[i], a[best]] = [a[best], a[i]];
      i = best;
    }
  }
}
`,
        hints: [
          "Зберігайте повне бінарне дерево в масиві: діти `i` — `2i + 1` і `2i + 2`, батько — `(i - 1) >> 1`.",
          "`push`: додайте в кінець і «спливайте» вгору (sift up), поки елемент менший за батька. `pop`: запам'ятайте корінь, поставте на його місце останній елемент і «топіть» його вниз (sift down), міняючи з **меншою** з дітей.",
          "Усі порівняння робіть через `this.cmp(a, b) < 0`, а не `a < b` — тоді той самий клас стане max-купою чи чергою об'єктів. Окремий випадок у `pop`: якщо елемент був один, після `a.pop()` масив порожній — не записуйте в `a[0]`."
        ],
        tests: [
          { name: 'pop повертає елементи за зростанням', code: 'const h = new MinHeap();\n[5, 3, 8, 1, 9, 2].forEach((x) => h.push(x));\nconst out = [];\nfor (let i = 0; i < 6; i++) out.push(h.pop());\nexpect(out).toEqual([1, 2, 3, 5, 8, 9]);' },
          { name: 'порожня купа', code: SZ + 'const h = new MinHeap();\nexpect(h.pop()).toBeUndefined();\nexpect(h.peek()).toBeUndefined();\nexpect(sz(h)).toBe(0);' },
          { name: 'peek не видаляє, size оновлюється', code: SZ + 'const h = new MinHeap();\nh.push(4); h.push(2);\nexpect(h.peek()).toBe(2);\nexpect(sz(h)).toBe(2);\nh.pop();\nexpect(h.peek()).toBe(4);\nexpect(sz(h)).toBe(1);\nh.pop();\nexpect(sz(h)).toBe(0);' },
          { name: "дублікати та від'ємні", code: 'const h = new MinHeap();\n[0, -1, 3, -1, 0, -7].forEach((x) => h.push(x));\nconst out = [];\nfor (let i = 0; i < 6; i++) out.push(h.pop());\nexpect(out).toEqual([-7, -1, -1, 0, 0, 3]);' },
          { name: 'кастомний компаратор: max-купа', code: 'const h = new MinHeap((a, b) => b - a);\n[1, 10, 5].forEach((x) => h.push(x));\nexpect([h.pop(), h.pop(), h.pop()]).toEqual([10, 5, 1]);' },
          { name: 'черга задач за пріоритетом', code: "const h = new MinHeap((a, b) => a.priority - b.priority);\nh.push({ name: 'low', priority: 5 });\nh.push({ name: 'urgent', priority: 0 });\nh.push({ name: 'mid', priority: 2 });\nexpect(h.pop().name).toBe('urgent');\nh.push({ name: 'high', priority: 1 });\nexpect(h.pop().name).toBe('high');\nexpect(h.pop().name).toBe('mid');" },
          { name: 'перемежовані push/pop', code: 'const h = new MinHeap();\nh.push(5); h.push(3);\nexpect(h.pop()).toBe(3);\nh.push(4); h.push(1);\nexpect(h.pop()).toBe(1);\nexpect(h.pop()).toBe(4);\nexpect(h.pop()).toBe(5);\nexpect(h.pop()).toBeUndefined();' },
          { name: '10^5 push + 10^5 pop — O(n log n)', code: 'const h = new MinHeap();\nlet x = 7;\nconst t0 = performance.now();\nfor (let i = 0; i < 1e5; i++) { x = (x * 48271) % 2147483647; h.push(x); }\nlet prev = -Infinity, sorted = true;\nfor (let i = 0; i < 1e5; i++) { const v = h.pop(); if (v < prev) sorted = false; prev = v; }\nconst ms = performance.now() - t0;\nexpect(sorted).toBe(true);\nexpect(h.pop()).toBeUndefined();\nexpect(ms).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** бінарна купа на масиві (sift up / sift down).

**Ідея:**
- \`push\` порушує властивість купи лише на шляху від нового листа до кореня — відновлюємо підйомом;
- \`pop\` ставить останній елемент у корінь — порушення лише на шляху вниз; міняємо з **кращою** з дітей, щоб новий батько був кращим за обох.

**Складність:** \`push\`/\`pop\` — O(log n) (висота повного дерева), \`peek\`/\`size\` — O(1). Пам'ять O(n).

**Brute force:**
- масив + \`sort\` після кожного \`push\` — O(n log n) на операцію;
- \`pop\` через пошук мінімуму + \`splice\` — O(n) на операцію; 10⁵ операцій → ~10¹⁰ кроків;
- відсортований масив + вставка бінарним пошуком і \`splice\` — O(n) через зсув.

**Типові помилки:**
- sift down міняє з будь-якою дитиною, а не з меншою → ламається властивість купи;
- не обробили \`pop\` для купи з одного елемента (записали \`last\` назад у \`a[0]\`);
- \`(i - 1) / 2\` без \`Math.floor\`/\`>> 1\` — дробовий індекс;
- порівняння \`a < b\` всередині замість компаратора.

**Що можуть спитати далі:** \`heapify(array)\` за O(n); heap sort; медіана потоку (дві купи); як реалізувати \`decreaseKey\` (потрібна мапа елемент → індекс); стабільність — чи збережеться порядок рівних елементів? (Ні — для стабільності додають лічильник вставки в компаратор.)
`
      },
      {
        id: 'ds-top-k-frequent', group: "heap",
        type: 'code',
        level: 3,
        title: 'Top K найчастіших елементів',
        tags: ['heap', 'hash-map', 'bucket-sort'],
        description: `
**Завдання.** Напишіть \`topKFrequent(nums, k)\`: поверніть \`k\` найчастіших елементів масиву.

**Де трапляється:** найпопулярніші теги, пошукові запити.

Порядок результату: за **спаданням частоти**; при однаковій частоті — за **зростанням значення**. Гарантовано, що \`k\` не більше кількості унікальних елементів.

\`\`\`js
topKFrequent([1, 1, 1, 2, 2, 3], 2); // [1, 2]
topKFrequent([4, 4, 1, 1, 2, 3], 2); // [1, 4] — частоти рівні, менше значення першим
topKFrequent([7], 1);                // [7]
\`\`\`

Обмеження: до 10⁵ елементів — краще за O(n log n), якщо вийде.

**Як це працює:** Рахуємо частоти в Map, потім «кошики»: індекс — частота, значення — числа з такою частотою. Йдемо від найбільшої частоти і збираємо k чисел. O(n).
`,
        starter: `function topKFrequent(nums, k) {
  // 1. Map частот
  // 2. Кошики: buckets[частота] = числа
  // 3. Від найбільшої частоти збирати k чисел
  // TODO
}
`,
        solution: `function topKFrequent(nums, k) {
  // 1. Частоти — O(n)
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) || 0) + 1);

  // 2. Bucket sort за частотою: buckets[f] — значення, що зустрічаються f разів
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [val, f] of freq) buckets[f].push(val);

  // 3. Збираємо від найбільшої частоти; всередині кошика — за зростанням значення
  const res = [];
  for (let f = nums.length; f > 0 && res.length < k; f--) {
    if (!buckets[f].length) continue;
    buckets[f].sort((a, b) => a - b);
    for (const val of buckets[f]) {
      if (res.length === k) break;
      res.push(val);
    }
  }
  return res;
}
`,
        hints: [
          "Спочатку порахуйте частоти через `Map` — це O(n).",
          "Далі є три варіанти: відсортувати пари (значення, частота) — O(u log u); купа розміру k — O(n log k); bucket sort за частотою — частота не перевищує n, тож можна завести масив кошиків.",
          "Bucket sort: `buckets[f]` — список значень із частотою `f`. Пройдіть `f` від n до 1 і збирайте значення, поки не набрали k (не забудьте впорядкувати значення всередині кошика за зростанням)."
        ],
        tests: [
          "expect(topKFrequent([1, 1, 1, 2, 2, 3], 2)).toEqual([1, 2])",
          { name: 'один елемент', code: 'expect(topKFrequent([7], 1)).toEqual([7]);' },
          { name: 'рівні частоти — за зростанням значення', code: 'expect(topKFrequent([4, 4, 1, 1, 2, 3], 2)).toEqual([1, 4]);\nexpect(topKFrequent([3, 2, 1], 3)).toEqual([1, 2, 3]);' },
          { name: "від'ємні числа", code: 'expect(topKFrequent([-1, -1, 2, 2, 2, 3], 2)).toEqual([2, -1]);' },
          { name: 'k = кількість унікальних', code: 'expect(topKFrequent([5, 5, 6, 7, 7, 7], 3)).toEqual([7, 5, 6]);' },
          { name: 'не мутує вхідний масив', code: 'const a = [3, 1, 3, 2];\ntopKFrequent(a, 1);\nexpect(a).toEqual([3, 1, 3, 2]);' },
          { name: '10^5 елементів — швидко', code: 'const a = [];\nfor (let i = 0; i < 1e5; i++) a.push(i % 5000);\nfor (let i = 0; i < 300; i++) a.push(42);\nfor (let i = 0; i < 200; i++) a.push(-7);\nconst t0 = performance.now();\nconst r = topKFrequent(a, 4);\nconst ms = performance.now() - t0;\nexpect(r).toEqual([42, -7, 0, 1]);\nexpect(ms).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** хеш-мапа частот + (bucket sort | купа розміру k | сортування). Тригер «top K / k найбільших / k найближчих» → купа.

**Варіанти:**
| Підхід | Час | Пам'ять |
|---|---|---|
| Сортування всіх (значення, частота) | O(n + u log u) | O(u) |
| Min-купа розміру k (викидаємо найменш частий) | O(n + u log k) | O(u + k) |
| Bucket sort за частотою | O(n) (+ сортування всередині кошиків для тай-брейку) | O(n) |

u — кількість унікальних значень.

**Ідея купи:** тримаємо min-купу за частотою розміру k; якщо в ній більше k елементів — \`pop\` найменш частого. Наприкінці в купі — k найчастіших. Це особливо доречно для **потоку** даних, коли u величезне, а k мале.

**Ідея bucket sort:** частота — ціле від 1 до n, тож замість порівняльного сортування — масив кошиків за частотою.

**Типові помилки:**
- \`Object\` замість \`Map\` для частот — ключі стають рядками (\`-1\` і \`'-1'\`), відповідь повертає рядки;
- сортування без тай-брейку → недетермінований порядок при рівних частотах;
- max-купа з усіх u елементів і k разів \`pop\` — O(u + k log u), теж ок, але гірше пояснюється як «оптимальне».

**Що можуть спитати далі:** Top K Frequent Words (лексикографічний тай-брейк); k найближчих точок до початку координат; k-й найбільший елемент (quickselect — O(n) у середньому); top-K у потоці, який не вміщується в пам'ять (Count-Min Sketch).
`
      },
      {
        id: 'ds-merge-k-sorted', group: "heap",
        type: 'code',
        level: 4,
        title: 'Злиття k відсортованих масивів',
        tags: ['heap', 'merge', 'k-way'],
        description: `
**Завдання.** Напишіть \`mergeKSorted(arrays)\`: \`arrays\` — масив з \`k\` відсортованих за неспаданням масивів чисел. Поверніть один відсортований масив з усіма елементами.

**Де трапляється:** злиття відсортованих логів з кількох джерел.

Нехай N — загальна кількість елементів. Цільова складність — **O(N log k)**. Вхідні масиви не змінюйте.

\`\`\`js
mergeKSorted([[1, 4, 5], [1, 3, 4], [2, 6]]); // [1, 1, 2, 3, 4, 4, 5, 6]
mergeKSorted([]);                              // []
mergeKSorted([[], [1]]);                       // [1]
\`\`\`

Купу доведеться реалізувати всередині рішення (у JS вбудованої немає).

**Як це працює:** Min-купа з голів усіх масивів: виймаємо найменший, додаємо до результату і кладемо в купу наступний елемент з того самого масиву. O(N log k).
`,
        starter: `function mergeKSorted(arrays) {
  // 1. Min-купа елементів [значення, № масиву, індекс]
  // 2. Покласти перший елемент кожного масиву
  // 3. Виймати мінімум, додавати до результату, класти наступний з того ж масиву
  // TODO
}
`,
        solution: `function mergeKSorted(arrays) {
  // Мінімальна купа з трійок [value, arrayIndex, elementIndex]
  const heap = [];
  const less = (x, y) => x[0] < y[0] || (x[0] === y[0] && x[1] < y[1]);

  function push(item) {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!less(heap[i], heap[p])) break;
      [heap[i], heap[p]] = [heap[p], heap[i]];
      i = p;
    }
  }

  function pop() {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && less(heap[l], heap[m])) m = l;
        if (r < heap.length && less(heap[r], heap[m])) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return top;
  }

  // У купі одночасно щонайбільше k елементів — по одному «поточному» з кожного масиву
  arrays.forEach((arr, ai) => {
    if (arr.length) push([arr[0], ai, 0]);
  });

  const result = [];
  while (heap.length) {
    const [val, ai, ei] = pop();
    result.push(val);
    if (ei + 1 < arrays[ai].length) push([arrays[ai][ei + 1], ai, ei + 1]);
  }
  return result;
}
`,
        hints: [
          "Наступний елемент результату — найменший серед «поточних голів» усіх k масивів. Як швидко знаходити мінімум серед k кандидатів?",
          "Тримайте min-купу розміру ≤ k з трійок `[значення, індексМасиву, індексЕлемента]`. Дістали мінімум — поклали в купу наступний елемент з того ж масиву.",
          "Ініціалізація: покладіть у купу перший елемент кожного непорожнього масиву. Цикл, поки купа не порожня: `pop` → `result.push(val)` → якщо в масиві `ai` є елемент `ei + 1`, `push` його."
        ],
        tests: [
          "expect(mergeKSorted([[1, 4, 5], [1, 3, 4], [2, 6]])).toEqual([1, 1, 2, 3, 4, 4, 5, 6])",
          { name: 'порожній вхід і порожні масиви', code: 'expect(mergeKSorted([])).toEqual([]);\nexpect(mergeKSorted([[]])).toEqual([]);\nexpect(mergeKSorted([[], [1], []])).toEqual([1]);' },
          { name: 'один масив', code: 'expect(mergeKSorted([[1, 2, 3]])).toEqual([1, 2, 3]);' },
          { name: "від'ємні числа і дублікати", code: 'expect(mergeKSorted([[-5, 0, 0], [-5, -1], [0, 10]])).toEqual([-5, -5, -1, 0, 0, 0, 10]);' },
          { name: 'різні довжини', code: 'expect(mergeKSorted([[1], [2, 3, 4, 5, 6], [0, 7]])).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);' },
          { name: 'не змінює вхідні масиви', code: 'const input = [[1, 3], [2, 4]];\nmergeKSorted(input);\nexpect(input).toEqual([[1, 3], [2, 4]]);' },
          { name: 'k = 2000 масивів, N = 10^5 — O(N log k)', code: 'const k = 2000, m = 50;\nconst arrays = Array.from({ length: k }, (_, i) => Array.from({ length: m }, (_, j) => j * k + i));\nconst t0 = performance.now();\nconst r = mergeKSorted(arrays);\nconst ms = performance.now() - t0;\nexpect(r.length).toBe(k * m);\nexpect(r.every((v, i) => v === i)).toBe(true);\nexpect(ms).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** k-way merge через min-купу.

**Ідея:** найменший ще не взятий елемент — завжди одна з k «голів». Купа розміру k дає його за O(log k). Після вилучення на його місце стає наступний елемент того ж масиву.

**Складність:** O(N log k) часу, O(k) додаткової пам'яті (не рахуючи результату).

**Порівняння підходів:**
| Підхід | Час |
|---|---|
| \`[].concat(...arrays).sort((a, b) => a - b)\` | O(N log N) — просто, але ігнорує відсортованість |
| На кожному кроці лінійно шукати мінімум серед k голів | O(N·k) |
| Послідовно зливати: результат + наступний масив | O(N·k) |
| Попарне злиття «турніром» (divide & conquer) | O(N log k), без купи |
| Min-купа | O(N log k) |

**Тай-брейк** \`[value, arrayIndex]\` робить злиття детермінованим/стабільним (при рівних значеннях раніше йде елемент з меншим номером масиву).

**Типові помилки:**
- покласти в купу одразу всі N елементів — O(N log N), втрачається сенс;
- не перевіряти порожні масиви при ініціалізації (\`arr[0]\` → \`undefined\` у купі);
- \`shift()\` з вхідних масивів — мутує дані і дає O(n) на операцію.

**Що можуть спитати далі:** те саме для k зв'язних списків (Merge k Sorted Lists); зовнішнє сортування файлів, що не влазять у пам'ять; найменший діапазон, що містить хоча б один елемент з кожного з k списків (Smallest Range Covering Elements from K Lists); k-та найменша пара сум.
`
      },
      // ===================================================== ГРАФИ
      {
        id: 'ds-theory-graphs', group: "graphs", why: ["Ні: матриця займає O(V²) — для щільних графів.","Ні: для ваг потрібна Дейкстра.","Так: BFS іде шарами за відстанню в ребрах.","Ні: DFS легко пишеться з явним стеком.","Так: O(V + E) і visited від зациклення."],
        type: 'theory',
        level: 2,
        interview: true,
        title: 'Графи: представлення, BFS і DFS',
        tags: ['graph', 'bfs', 'dfs'],
        question: 'Як можна представити граф у коді? Які плюси й мінуси у списку суміжності та матриці суміжності? Чим відрізняються BFS і DFS і коли який обирати? Оберіть **усі** правильні твердження.',
        choices: [
          'Матриця суміжності займає O(V + E) памʼяті, тому найкраще підходить для розріджених графів',
          'BFS коректно знаходить найкоротший шлях і в зваженому графі з довільними вагами ребер',
          'BFS знаходить найкоротший шлях за кількістю ребер у незваженому графі',
          'DFS можна реалізувати лише рекурсивно: з явним стеком цей обхід не працює',
          'BFS і DFS працюють за O(V + E) і потребують `visited`, інакше на циклах зациклюються',
        ],
        correct: [2, 4],
        hint: 'Список суміжності, матриця, список ребер. Пам\'ять O(V + E) vs O(V²). Черга vs стек.',
        answer: `
**Граф** — вершини (V) і ребра (E). Буває орієнтований / неорієнтований, зважений / незважений, з циклами / ациклічний (DAG). Дерево — зв'язний ациклічний граф.

**Представлення:**
| Спосіб | Пам'ять | Чи є ребро u→v | Перебрати сусідів | Коли |
|---|---|---|---|---|
| **Список суміжності** \`{ A: ['B', 'C'] }\` / \`Map<v, Set>\` | O(V + E) | O(deg) (O(1) із Set) | O(deg) | розріджені графи — майже завжди |
| **Матриця суміжності** \`m[u][v]\` | O(V²) | O(1) | O(V) | щільні графи, малі V |
| **Список ребер** \`[[u, v, w], …]\` | O(E) | O(E) | O(E) | вхідний формат; Kruskal, Bellman-Ford |

\`\`\`js
// зі списку ребер — у список суміжності (неорієнтований граф)
const adj = Array.from({ length: n }, () => []);
for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
\`\`\`
Сітка (grid) — теж граф: сусіди клітинки — 4 (або 8) напрямки.

**BFS (пошук у ширину)** — черга, обхід «хвилями» від старту:
- знаходить **найкоротший шлях у незваженому графі** (мінімум ребер);
- рівні, «відстань k», мінімальна кількість ходів;
- пам'ять — ширина фронту.

**DFS (пошук у глибину)** — стек (рекурсія або явний):
- зв'язні компоненти, острови, flood fill;
- виявлення циклів, топологічне сортування, backtracking;
- пам'ять — глибина шляху; рекурсія в JS на ~10⁴ рівнях падає → явний стек.

Обидва — **O(V + E)** часу, обидва потребують \`visited\`, інакше на циклах — нескінченний цикл.

**Зважені графи:** BFS не підходить — Дейкстра (ваги ≥ 0, з купою O((V + E) log V)), Bellman-Ford (від'ємні ваги), 0-1 BFS (ваги 0/1, deque).

**Фронтенд-приклади:** граф залежностей модулів у бандлері (webpack/Vite — DFS, виявлення циклічних імпортів), порядок виконання задач/міграцій (топосорт), DOM — дерево, соціальний граф «друзі друзів» (BFS), роутинг на мапі (Дейкстра / A*).
`,
        keyPoints: [
          'Список суміжності O(V + E) — стандарт для розріджених графів; матриця O(V²) — для щільних',
          'BFS — черга, найкоротший шлях у незваженому графі',
          'DFS — стек/рекурсія: компоненти, цикли, топосорт, backtracking',
          'Обидва O(V + E); обов\'язковий visited',
          'Для ваг — Дейкстра (ваги ≥ 0), а не BFS'
        ],
        followUps: [
          'Як знайти цикл в орієнтованому і в неорієнтованому графі?',
          'Що таке топологічне сортування і де воно застосовується?',
          'Чому BFS не працює для зважених графів?',
          'Що таке union-find і коли він кращий за DFS?'
        ]
      },
      {
        id: 'ds-quiz-bfs-vs-dfs', group: "graphs", why: ["Ні: DFS знайде якийсь шлях, не обов'язково найкоротший.","Так: BFS обробляє клітинки в порядку відстані.","Ні: visited не робить DFS-шлях мінімальним.","Ні: DFS не гарантує мінімум кроків."],
        type: 'quiz',
        level: 2,
        title: 'Найкоротший шлях у лабіринті: BFS чи DFS?',
        tags: ['graph', 'bfs', 'dfs'],
        question: 'Потрібно знайти **мінімальну кількість кроків** від входу до виходу в лабіринті-сітці (кожен крок у сусідню клітинку коштує однаково). Який обхід **гарантовано** знаходить найкоротший шлях при першому досягненні виходу?',
        options: [
          'DFS — він швидше заходить углиб і раніше знаходить вихід',
          'BFS — черга обробляє клітинки в порядку зростання відстані',
          'DFS з масивом visited — visited гарантує мінімальність',
          'Будь-який: обидва відвідують усі клітинки, тож результат однаковий'
        ],
        answer: 1,
        hint: 'У якому порядку кожен з обходів відкриває клітинки — за відстанню від старту чи за напрямком?',
        explanation: `
**BFS** обробляє вершини «хвилями»: спочатку всі на відстані 1, потім 2, і т.д. Тому перша зустріч з виходом відбувається саме на мінімальній відстані.

- **DFS** йде однією гілкою до кінця; перший знайдений шлях може бути довільно довгим. Щоб знайти найкоротший через DFS, довелося б перебрати всі шляхи (експоненційно).
- **visited у DFS** лише запобігає повторним відвідуванням; він навіть може «заблокувати» клітинку, до якої пізніше знайшовся б коротший шлях.
- **«Обидва відвідують усі»** — так, але питання не про охоплення, а про *порядок*: лише BFS дає відстані в момент відкриття.

Для зважених кроків (різна вартість) BFS теж не підходить — потрібна Дейкстра.
`
      },
      {
        id: 'ds-bfs-shortest-path', group: "graphs",
        type: 'code',
        level: 2,
        title: 'Найкоротший шлях у незваженому графі (BFS)',
        tags: ['graph', 'bfs'],
        description: `
**Завдання.** Напишіть \`shortestPath(graph, start, target)\`. Граф — **список суміжності**: \`graph[v]\` — масив сусідів вершини \`v\` (це може бути об'єкт \`{ A: ['B'] }\` або масив масивів \`[[1], [2], []]\`). Граф **орієнтований** (ребро є лише в тому напрямку, що вказаний); вершина може бути відсутня серед ключів — тоді в неї немає вихідних ребер.

**Де трапляється:** найкоротший шлях у мережі зв'язків чи на мапі.

Поверніть **масив вершин** найкоротшого (за кількістю ребер) шляху від \`start\` до \`target\` включно, або \`null\`, якщо шляху немає. Якщо \`start === target\` — \`[start]\`. Якщо найкоротших шляхів кілька — будь-який.

\`\`\`js
const g = { A: ['B', 'C'], B: ['D'], C: ['D', 'E'], D: ['E'], E: [] };
shortestPath(g, 'A', 'E'); // ['A', 'C', 'E']
shortestPath(g, 'E', 'A'); // null
\`\`\`

**Як це працює:** BFS обходить граф шарами за відстанню, тож перша зустріч з target — найкоротший шлях. Для відновлення шляху зберігаємо батька кожної вершини.
`,
        starter: `function shortestPath(graph, start, target) {
  // 1. start === target → [start]
  // 2. BFS з чергою; parent запам'ятовує, звідки прийшли (і є visited)
  // 3. Знайшли target → відновити шлях по parent; не знайшли → null
  // TODO
}
`,
        solution: `function shortestPath(graph, start, target) {
  if (start === target) return [start];
  const parent = new Map([[start, null]]); // заодно і visited
  const queue = [start];
  for (let head = 0; head < queue.length; head++) { // індекс голови замість shift()
    const v = queue[head];
    for (const nb of graph[v] || []) {
      if (parent.has(nb)) continue;
      parent.set(nb, v);
      if (nb === target) {
        // відновлюємо шлях за батьками і розвертаємо
        const path = [];
        for (let cur = target; cur !== null; cur = parent.get(cur)) path.push(cur);
        return path.reverse();
      }
      queue.push(nb);
    }
  }
  return null;
}
`,
        hints: [
          "Найкоротший шлях за кількістю ребер у незваженому графі — це BFS.",
          "Позначайте вершину відвіданою **в момент додавання в чергу**, а не при вилученні — інакше одна вершина потрапить у чергу багато разів.",
          "Щоб повернути сам шлях, запам'ятовуйте для кожної відкритої вершини її «батька» (`Map`). Дійшовши до `target`, пройдіть по батьках назад до `start` і розверніть масив."
        ],
        tests: [
          { name: 'базовий граф', code: "const g = { A: ['B', 'C'], B: ['D'], C: ['D', 'E'], D: ['E'], E: [] };\nexpect(shortestPath(g, 'A', 'E')).toEqual(['A', 'C', 'E']);\nexpect(shortestPath(g, 'B', 'E')).toEqual(['B', 'D', 'E']);" },
          { name: 'шляху немає → null', code: "const g = { A: ['B', 'C'], B: ['D'], C: ['D', 'E'], D: ['E'], E: [] };\nexpect(shortestPath(g, 'E', 'A')).toBeNull();\nexpect(shortestPath({ A: [], B: [] }, 'A', 'B')).toBeNull();" },
          { name: 'start === target', code: "expect(shortestPath({ A: ['B'] }, 'A', 'A')).toEqual(['A']);" },
          { name: 'граф із циклами не зациклюється', code: "const g = { 1: ['2'], 2: ['3', '1'], 3: ['1', '4'], 4: ['2'] };\nexpect(shortestPath(g, '1', '4')).toEqual(['1', '2', '3', '4']);" },
          { name: 'напрямок ребер враховується; відсутні ключі', code: "const g = { A: ['B'], C: ['A'] };\nexpect(shortestPath(g, 'A', 'C')).toBeNull();\nexpect(shortestPath(g, 'C', 'B')).toEqual(['C', 'A', 'B']);" },
          { name: 'шлях коректний і мінімальний (кілька однакових шляхів)', code: "const g = [[1, 2], [3], [3], [4], []];\nconst p = shortestPath(g, 0, 4);\nexpect(p.length).toBe(4);\nexpect(p[0]).toBe(0);\nexpect(p[3]).toBe(4);\nexpect(p.every((v, i) => i === 0 || g[p[i - 1]].includes(v))).toBe(true);" },
          { name: '10^5 вершин — O(V + E)', code: "const n = 1e5;\nconst g = Array.from({ length: n }, (_, i) => [i + 1, i + 2].filter((x) => x < n));\nconst t0 = performance.now();\nconst p = shortestPath(g, 0, n - 1);\nconst ms = performance.now() - t0;\nexpect(p.length).toBe(50001);\nexpect(p.every((v, i) => i === 0 || v - p[i - 1] === 1 || v - p[i - 1] === 2)).toBe(true);\nexpect(ms).toBeLessThan(1000);" }
        ],
        explanation: `
**Патерн:** BFS + масив/мапа батьків для відновлення шляху.

**Кроки:**
1. Черга зі \`start\`; \`parent\` водночас є множиною відвіданих.
2. Дістаємо вершину, для кожного невідвіданого сусіда запам'ятовуємо батька і кладемо в чергу.
3. Щойно відкрили \`target\` — відновлюємо шлях по батьках (від кінця до початку) і розвертаємо.

**Складність:** O(V + E) часу, O(V) пам'яті.

**Чому BFS:** вершини відкриваються в порядку зростання відстані, тож перша поява \`target\` — найкоротша.

**Типові помилки:**
- позначати відвіданою при вилученні з черги — дублікати в черзі, на щільних графах до O(E) зайвих елементів;
- \`queue.shift()\` — O(n) на операцію;
- \`visited\` як масив з \`includes\` — O(V) на перевірку, O(V²) загалом;
- DFS замість BFS — знайде *якийсь* шлях, не обов'язково найкоротший;
- забули випадок \`start === target\` або відсутній ключ (\`graph[v]\` — \`undefined\`).

**Що можуть спитати далі:** двонаправлений BFS (bidirectional) — швидше на великих графах; найкоротший шлях у сітці з перешкодами; Word Ladder (вершини — слова); що робити, якщо ребра мають ваги (Дейкстра) або ваги 0/1 (0-1 BFS з deque).
`
      },
      {
        id: 'ds-count-components', group: "graphs",
        type: 'code',
        level: 2,
        title: 'Кількість зв\'язних компонент (DFS)',
        tags: ['graph', 'dfs', 'union-find'],
        description: `
**Завдання.** Напишіть \`countComponents(n, edges)\`: є \`n\` вершин \`0..n-1\` і список **неорієнтованих** ребер \`[u, v]\`. Поверніть кількість **зв'язних компонент**.

**Де трапляється:** групи пов'язаних користувачів, кластери.

\`\`\`js
countComponents(5, [[0, 1], [1, 2], [3, 4]]); // 2   ({0,1,2} і {3,4})
countComponents(3, []);                       // 3   (кожна вершина — окрема компонента)
\`\`\`

Ребра можуть повторюватися, можливі петлі \`[v, v]\`. До 10⁵ вершин і ребер.

**Як це працює:** Будуємо список суміжності. Для кожної ще не відвіданої вершини запускаємо DFS, що позначає всю її компоненту, і збільшуємо лічильник.
`,
        starter: `function countComponents(n, edges) {
  // 1. Список суміжності (ребра в обидва боки)
  // 2. visited; для кожної невідвіданої вершини — DFS і лічильник++
  // 3. Повернути лічильник
  // TODO
}
`,
        solution: `function countComponents(n, edges) {
  // список суміжності
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  const visited = new Uint8Array(n);
  let components = 0;
  for (let s = 0; s < n; s++) {
    if (visited[s]) continue;
    components++; // нова, ще не відвідана компонента
    // ітеративний DFS — заливаємо всю компоненту
    const stack = [s];
    visited[s] = 1;
    while (stack.length) {
      const v = stack.pop();
      for (const nb of adj[v]) {
        if (!visited[nb]) {
          visited[nb] = 1;
          stack.push(nb);
        }
      }
    }
  }
  return components;
}
`,
        hints: [
          "Кожен запуск обходу з ще не відвіданої вершини «заливає» рівно одну компоненту.",
          "Побудуйте список суміжності (ребро додається в обидва боки), потім пройдіться по всіх вершинах: якщо вершина не відвідана — лічильник++ і DFS/BFS від неї, позначаючи все досяжне.",
          "Альтернатива — union-find (система неперетинних множин): спочатку n компонент, кожне ребро, що об'єднує дві різні множини, зменшує лічильник на 1."
        ],
        tests: [
          "expect(countComponents(5, [[0, 1], [1, 2], [3, 4]])).toBe(2)",
          "expect(countComponents(5, [[0, 1], [1, 2], [2, 3], [3, 4]])).toBe(1)",
          { name: 'без ребер — кожна вершина окремо', code: 'expect(countComponents(3, [])).toBe(3);\nexpect(countComponents(1, [])).toBe(1);' },
          { name: 'нуль вершин', code: 'expect(countComponents(0, [])).toBe(0);' },
          { name: 'дублікати ребер і петлі', code: 'expect(countComponents(4, [[0, 1], [1, 0], [0, 1], [2, 2]])).toBe(3);' },
          { name: 'цикл у графі', code: 'expect(countComponents(6, [[0, 1], [1, 2], [2, 0], [3, 4]])).toBe(3);' },
          { name: '10^5 вершин — O(V + E)', code: 'const n = 1e5;\nconst tree = [];\nfor (let i = 1; i < n; i++) tree.push([i, i >> 1]);\nconst pairs = [];\nfor (let i = 0; i + 1 < n; i += 2) pairs.push([i, i + 1]);\nconst t0 = performance.now();\nexpect(countComponents(n, tree)).toBe(1);\nexpect(countComponents(n, pairs)).toBe(n / 2);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** обхід графа (DFS/BFS) з зовнішнім циклом по всіх вершинах — «скільки разів довелося запускати обхід».

**Складність:** O(V + E) часу, O(V + E) пам'яті (список суміжності + visited).

**Union-Find альтернатива:**
\`\`\`js
const parent = Array.from({ length: n }, (_, i) => i);
const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x]))); // стиснення шляху
let count = n;
for (const [u, v] of edges) {
  const a = find(u), b = find(v);
  if (a !== b) { parent[a] = b; count--; }
}
\`\`\`
O(E · α(V)) — майже лінійно; зручно, коли ребра приходять **потоком** (онлайн-зв'язність). Рекурсивний \`find\` без стиснення може вироджуватися в довгі ланцюжки — додавайте union by rank/size.

**Типові помилки:**
- ребро додане лише в один бік (граф неорієнтований!);
- рахувати компоненти як «кількість ребер» або «вершини без ребер»;
- забути ізольовані вершини (вони не згадані в \`edges\`);
- рекурсивний DFS на довгому ланцюжку з 10⁵ вершин → переповнення стеку.

**Що можуть спитати далі:** Graph Valid Tree (n − 1 ребро і одна компонента); Number of Provinces (матриця суміжності); Redundant Connection (union-find); скільки ребер треба додати, щоб граф став зв'язним (компоненти − 1).
`
      },
      {
        id: 'ds-number-of-islands', group: "graphs",
        type: 'code',
        level: 2,
        interview: true,
        title: 'Кількість островів у сітці',
        tags: ['graph', 'grid', 'dfs', 'bfs'],
        description: `
**Завдання.** Напишіть \`numIslands(grid)\`: \`grid\` — двовимірний масив символів \`'1'\` (суша) і \`'0'\` (вода). Острів — група клітинок суші, з'єднаних **по горизонталі або вертикалі** (діагональ не рахується). Поверніть кількість островів.

**Де трапляється:** класика BFS/DFS по сітці.

Сітку **можна змінювати** (наприклад, «затоплювати» відвідану сушу). Розмір — до 300×300; суцільна суша 300×300 — це 90 000 клітинок в одному острові, тож рекурсивний DFS може переповнити стек викликів.

\`\`\`js
numIslands([
  ['1', '1', '0', '0', '0'],
  ['1', '1', '0', '0', '0'],
  ['0', '0', '1', '0', '0'],
  ['0', '0', '0', '1', '1'],
]); // 3
\`\`\`

**Як це працює:** Ідемо по сітці; знайшовши '1', збільшуємо лічильник і «затоплюємо» весь острів (DFS/BFS по сусідніх '1'), щоб не порахувати його вдруге.
`,
        starter: `function numIslands(grid) {
  // 1. Порожня сітка → 0
  // 2. Для кожної клітинки '1': лічильник++ і затопити острів (DFS/BFS)
  // 3. Повернути лічильник
  // TODO
}
`,
        solution: `function numIslands(grid) {
  const rows = grid.length;
  if (!rows) return 0;
  const cols = grid[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let count = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '1') continue;
      count++;
      // ітеративний DFS: затоплюємо весь острів, щоб не порахувати його вдруге
      grid[r][c] = '0';
      const stack = [[r, c]];
      while (stack.length) {
        const [cr, cc] = stack.pop();
        for (const [dr, dc] of dirs) {
          const nr = cr + dr, nc = cc + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === '1') {
            grid[nr][nc] = '0'; // позначаємо при додаванні в стек
            stack.push([nr, nc]);
          }
        }
      }
    }
  }
  return count;
}
`,
        hints: [
          "Сітка — це граф: кожна клітинка суші з'єднана з сусідами зверху, знизу, ліворуч, праворуч. Острів — зв'язна компонента.",
          "Пройдіть усі клітинки. Знайшли `'1'` — лічильник++ і обхід (DFS/BFS), який «затоплює» (`'0'`) весь острів.",
          "Щоб не переповнити стек на великому острові, робіть DFS з явним стеком `[[r, c]]` (або BFS з чергою) і позначайте клітинку відвіданою **при додаванні** в стек."
        ],
        tests: [
          { name: 'приклад з умови — 3 острови', code: "const g = ['11000', '11000', '00100', '00011'].map((r) => r.split(''));\nexpect(numIslands(g)).toBe(3);" },
          { name: 'один великий острів складної форми', code: "const g = ['11110', '11010', '11000', '00000'].map((r) => r.split(''));\nexpect(numIslands(g)).toBe(1);" },
          { name: 'порожня сітка і лише вода', code: "expect(numIslands([])).toBe(0);\nexpect(numIslands([['0', '0'], ['0', '0']])).toBe(0);" },
          { name: 'одна клітинка', code: "expect(numIslands([['1']])).toBe(1);\nexpect(numIslands([['0']])).toBe(0);" },
          { name: 'діагональ не з\'єднує', code: "expect(numIslands([['1', '0'], ['0', '1']])).toBe(2);\nexpect(numIslands(['101', '010', '101'].map((r) => r.split('')))).toBe(5);" },
          { name: 'острів у формі кільця з озером', code: "const g = ['11111', '10001', '10101', '10001', '11111'].map((r) => r.split(''));\nexpect(numIslands(g)).toBe(2);" },
          { name: '300×300: 10 000 малих островів — O(rows·cols)', code: "const n = 300;\nconst g = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r % 3 !== 2 && c % 3 !== 2 ? '1' : '0')));\nconst t0 = performance.now();\nexpect(numIslands(g)).toBe(10000);\nexpect(performance.now() - t0).toBeLessThan(1000);" },
          { name: 'суцільна суша 300×300 (глибина рекурсії!)', code: "const n = 300;\nconst g = Array.from({ length: n }, () => new Array(n).fill('1'));\nconst t0 = performance.now();\nexpect(numIslands(g)).toBe(1);\nexpect(performance.now() - t0).toBeLessThan(1000);" }
        ],
        explanation: `
**Патерн:** flood fill — DFS/BFS по сітці; кількість запусків обходу = кількість компонент.

**Ідея:** сканування сітки; кожна ще не затоплена \`'1'\` — новий острів. Обхід від неї затоплює весь острів, тож решта його клітинок уже не зарахується.

**Складність:** O(R·C) часу (кожна клітинка обробляється сталу кількість разів), O(R·C) пам'яті в гіршому випадку для стеку/черги.

**Рекурсія vs явний стек:** рекурсивний варіант найкоротший:
\`\`\`js
const sink = (r, c) => {
  if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return;
  grid[r][c] = '0';
  sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
};
\`\`\`
але на суцільному острові 300×300 глибина рекурсії доходить до десятків тисяч → \`RangeError\`. На співбесіді варто це проговорити.

**Якщо мутувати сітку не можна:** окремий \`visited\` (\`Uint8Array(R * C)\` з індексом \`r * C + c\`).

**Типові помилки:**
- позначати відвіданою лише при вилученні зі стеку — та сама клітинка потрапляє в стек кілька разів;
- рахувати діагональних сусідів;
- плутати \`'1'\` (рядок) і \`1\` (число);
- вихід за межі сітки без перевірки.

**Що можуть спитати далі:** площа найбільшого острова (Max Area of Island); периметр острова; кількість **різних за формою** островів; Surrounded Regions; Rotting Oranges (мультиджерельний BFS); якщо сушу додають по одній клітинці і після кожної треба знати кількість островів (Number of Islands II — union-find).
`
      },
      {
        id: 'ds-directed-cycle', group: "graphs",
        type: 'code',
        level: 3,
        title: 'Цикл в орієнтованому графі (три кольори)',
        tags: ['graph', 'dfs', 'cycle'],
        description: `
**Завдання.** Напишіть \`hasDirectedCycle(n, edges)\`: є \`n\` вершин \`0..n-1\` і **орієнтовані** ребра \`[from, to]\`. Поверніть \`true\`, якщо в графі є цикл.

**Де трапляється:** циклічні залежності модулів у бандлері.

Зверніть увагу: в орієнтованому графі повторний захід у вже відвідану вершину **не завжди** означає цикл (ромб \`0→1→3\`, \`0→2→3\` — без циклу).

\`\`\`js
hasDirectedCycle(3, [[0, 1], [1, 2], [2, 0]]); // true
hasDirectedCycle(4, [[0, 1], [0, 2], [1, 3], [2, 3]]); // false (ромб)
hasDirectedCycle(2, [[1, 1]]); // true (петля)
\`\`\`

Практичний сенс: циклічні залежності модулів, задач у CI, полів у формулах таблиці.

**Як це працює:** DFS з трьома кольорами: 0 — не відвідана, 1 — в поточному шляху, 2 — повністю оброблена. Ребро у вершину кольору 1 означає цикл.
`,
        starter: `function hasDirectedCycle(n, edges) {
  // 1. Список суміжності, масив кольорів (0/1/2)
  // 2. DFS: колір 1 на вході, ребро в колір 1 → цикл, колір 2 на виході
  // 3. Запустити з кожної вершини кольору 0
  // TODO
}
`,
        solution: `function hasDirectedCycle(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) adj[u].push(v);

  // 0 — білий (не відвідана), 1 — сірий (у поточному шляху DFS), 2 — чорний (повністю оброблена)
  const color = new Uint8Array(n);

  for (let s = 0; s < n; s++) {
    if (color[s]) continue;
    // ітеративний DFS: у стеку пари [вершина, індекс наступного сусіда]
    const stack = [[s, 0]];
    color[s] = 1;
    while (stack.length) {
      const top = stack[stack.length - 1];
      const v = top[0];
      if (top[1] < adj[v].length) {
        const nb = adj[v][top[1]++];
        if (color[nb] === 1) return true; // ребро назад у поточний шлях — цикл
        if (color[nb] === 0) {
          color[nb] = 1;
          stack.push([nb, 0]);
        }
      } else {
        color[v] = 2; // усі нащадки оброблені — вершина безпечна
        stack.pop();
      }
    }
  }
  return false;
}
`,
        hints: [
          "Звичайного `visited` недостатньо: у ромбі вершина 3 відвідується двічі, але циклу немає. Цикл — це ребро у вершину, що **зараз на стеку рекурсії** (у поточному шляху).",
          "Три стани (кольори): білий — не відвідана, сірий — у поточному шляху DFS, чорний — повністю оброблена. Ребро в сіру вершину = цикл.",
          "Альтернатива без рекурсії — алгоритм Кана: рахуйте вхідні степені, видаляйте вершини зі степенем 0; якщо видалили менше n вершин — є цикл."
        ],
        tests: [
          "expect(hasDirectedCycle(3, [[0, 1], [1, 2], [2, 0]])).toBe(true)",
          { name: 'ромб — не цикл', code: 'expect(hasDirectedCycle(4, [[0, 1], [0, 2], [1, 3], [2, 3]])).toBe(false);\nexpect(hasDirectedCycle(3, [[0, 1], [1, 2], [0, 2]])).toBe(false);' },
          { name: 'петля', code: 'expect(hasDirectedCycle(2, [[1, 1]])).toBe(true);' },
          { name: 'без ребер і одна вершина', code: 'expect(hasDirectedCycle(1, [])).toBe(false);\nexpect(hasDirectedCycle(5, [])).toBe(false);' },
          { name: 'цикл в іншій компоненті', code: 'expect(hasDirectedCycle(6, [[0, 1], [1, 2], [3, 4], [4, 5], [5, 3]])).toBe(true);' },
          { name: 'зустрічні ребра — цикл довжини 2', code: 'expect(hasDirectedCycle(2, [[0, 1], [1, 0]])).toBe(true);' },
          { name: 'вершина досяжна з кількох місць, але без циклу', code: 'expect(hasDirectedCycle(5, [[3, 0], [0, 1], [2, 1], [4, 2], [4, 3]])).toBe(false);' },
          { name: '10^5 вершин — O(V + E)', code: 'const n = 1e5;\nconst edges = [];\nfor (let i = 0; i < n; i++) { if (2 * i + 1 < n) edges.push([i, 2 * i + 1]); if (2 * i + 2 < n) edges.push([i, 2 * i + 2]); }\nconst t0 = performance.now();\nexpect(hasDirectedCycle(n, edges)).toBe(false);\nedges.push([n - 1, 0]);\nexpect(hasDirectedCycle(n, edges)).toBe(true);\nexpect(performance.now() - t0).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** DFS з трьома кольорами (white / gray / black) або алгоритм Кана.

**Чому три кольори:** сірі вершини — це поточний шлях від кореня DFS. Ребро в сіру вершину замикає шлях у цикл (back edge). Ребро в чорну — це перехресне/пряме ребро в уже повністю досліджену частину, з якої не можна повернутися в поточний шлях (інакше ми б знайшли цикл раніше).

Рекурсивний варіант (простіший, але глибина рекурсії = довжина шляху):
\`\`\`js
const dfs = (v) => {
  color[v] = 1;
  for (const nb of adj[v]) {
    if (color[nb] === 1) return true;
    if (color[nb] === 0 && dfs(nb)) return true;
  }
  color[v] = 2;
  return false;
};
\`\`\`

**Складність:** O(V + E) часу, O(V + E) пам'яті.

**Порівняння з неорієнтованим графом:** там достатньо \`visited\` + ігнорувати ребро до батька (або union-find). В орієнтованому — потрібен стан «у поточному шляху».

**Типові помилки:**
- один \`visited\`: ромб дає хибний \`true\`;
- не скидати стан після виходу з вершини (сіра назавжди) — теж хибні цикли;
- запускати DFS лише з вершини 0 — цикл в іншій компоненті пропущено.

**Що можуть спитати далі:** повернути сам цикл (зберігати батьків/стек); топологічне сортування (Course Schedule II); знайти всі «безпечні» вершини (Find Eventual Safe States); як webpack/ESLint (\`import/no-cycle\`) знаходять циклічні імпорти.
`
      },
      {
        id: 'ds-course-schedule', group: "graphs",
        type: 'code',
        level: 3,
        title: 'Розклад курсів: топологічне сортування',
        tags: ['graph', 'topological-sort', 'bfs'],
        description: `
**Завдання.** Напишіть \`findOrder(numCourses, prerequisites)\`. Курси пронумеровані \`0..numCourses-1\`. Пара \`[a, b]\` означає: щоб пройти курс \`a\`, спочатку треба пройти \`b\` (ребро \`b → a\`).

**Де трапляється:** порядок збірки пакетів, залежності задач.

Поверніть **будь-який** порядок проходження всіх курсів, що задовольняє всі залежності, або \`[]\`, якщо це неможливо (є циклічна залежність).

\`\`\`js
findOrder(2, [[1, 0]]);                         // [0, 1]
findOrder(4, [[1, 0], [2, 0], [3, 1], [3, 2]]); // [0, 1, 2, 3] або [0, 2, 1, 3]
findOrder(2, [[1, 0], [0, 1]]);                 // []
\`\`\`

До 10⁵ курсів і залежностей.

**Як це працює:** Алгоритм Кана: рахуємо вхідні ступені, у чергу кладемо курси без передумов. Беремо курс, додаємо до порядку і зменшуємо ступінь його залежних; ступінь 0 → у чергу. Не всі курси потрапили в порядок — є цикл.
`,
        starter: `function findOrder(numCourses, prerequisites) {
  // 1. Список суміжності pre → course, вхідні ступені
  // 2. Черга курсів зі ступенем 0; брати, додавати в порядок, зменшувати ступені
  // 3. Порядок не містить усіх курсів → []
  // TODO
}
`,
        solution: `function findOrder(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);
  for (const [course, pre] of prerequisites) {
    adj[pre].push(course); // pre → course
    indegree[course]++;
  }

  // Алгоритм Кана: починаємо з курсів без залежностей
  const order = [];
  for (let i = 0; i < numCourses; i++) if (indegree[i] === 0) order.push(i);

  // order одночасно і черга, і результат (head — індекс голови черги)
  for (let head = 0; head < order.length; head++) {
    for (const next of adj[order[head]]) {
      if (--indegree[next] === 0) order.push(next); // усі передумови пройдені
    }
  }

  // якщо не всі курси потрапили в порядок — залишились у циклі
  return order.length === numCourses ? order : [];
}
`,
        hints: [
          "Це топологічне сортування орієнтованого графа `b → a`. Воно існує тоді й лише тоді, коли в графі немає циклу.",
          "Алгоритм Кана: порахуйте для кожного курсу кількість невиконаних передумов (вхідний степінь). Курси зі степенем 0 можна проходити — кладіть їх у чергу.",
          "Беріть курс із черги, додавайте в результат і зменшуйте степінь усіх курсів, що від нього залежать; хто став 0 — у чергу. Якщо в результаті менше `numCourses` курсів — є цикл, поверніть `[]`."
        ],
        tests: [
          { name: 'дві залежні дисципліни', code: 'expect(findOrder(2, [[1, 0]])).toEqual([0, 1]);' },
          { name: 'ромб залежностей — порядок валідний', code: 'const pre = [[1, 0], [2, 0], [3, 1], [3, 2]];\nconst order = findOrder(4, pre);\nexpect(order.length).toBe(4);\nexpect([...order].sort()).toEqual([0, 1, 2, 3]);\nconst pos = new Map(order.map((c, i) => [c, i]));\nexpect(pre.every(([a, b]) => pos.get(b) < pos.get(a))).toBe(true);' },
          { name: 'циклічна залежність → []', code: 'expect(findOrder(2, [[1, 0], [0, 1]])).toEqual([]);\nexpect(findOrder(3, [[0, 1], [1, 2], [2, 0]])).toEqual([]);' },
          { name: 'курс залежить сам від себе → []', code: 'expect(findOrder(1, [[0, 0]])).toEqual([]);' },
          { name: 'без залежностей — усі курси', code: 'expect(findOrder(1, [])).toEqual([0]);\nexpect([...findOrder(3, [])].sort()).toEqual([0, 1, 2]);' },
          { name: 'цикл лише в частині графа → []', code: 'expect(findOrder(5, [[1, 0], [2, 1], [3, 4], [4, 3]])).toEqual([]);' },
          { name: '10^5 курсів — O(V + E)', code: 'const n = 1e5;\nconst pre = [];\nfor (let i = 1; i < n; i++) pre.push([i, i >> 1]);\nfor (let i = 2; i < n; i += 3) pre.push([i, i - 1]);\nconst t0 = performance.now();\nconst order = findOrder(n, pre);\nconst ms = performance.now() - t0;\nexpect(order.length).toBe(n);\nconst pos = new Int32Array(n);\norder.forEach((c, i) => { pos[c] = i; });\nexpect(pre.every(([a, b]) => pos[b] < pos[a])).toBe(true);\nexpect(ms).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** топологічне сортування (topological sort) — алгоритм Кана (BFS за вхідними степенями) або DFS у post-order.

**Кроки Кана:**
1. Будуємо граф \`pre → course\` і рахуємо \`indegree\`.
2. Усі вершини з \`indegree = 0\` — у чергу.
3. Дістаємо вершину → у відповідь → зменшуємо \`indegree\` сусідів; хто став 0 — у чергу.
4. Якщо оброблено менше вершин, ніж є, — решта в циклах (їхній \`indegree\` ніколи не стане 0).

**DFS-варіант:** три кольори (як для пошуку циклу), вершину додаємо в результат **після** обробки всіх нащадків (post-order), наприкінці розвертаємо. Рекурсивний DFS на ланцюжку з 10⁵ курсів переповнить стек — Кан повністю ітеративний.

**Складність:** O(V + E) часу і пам'яті.

**Brute force:** щоразу шукати серед усіх курсів той, у якого всі передумови пройдені, — O(V · (V + E)).

**Типові помилки:**
- переплутаний напрямок ребра (\`a → b\` замість \`b → a\`) — порядок вийде розвернутим;
- не перевірили \`order.length === numCourses\` — при циклі повертається неповний порядок;
- \`queue.shift()\` на великих даних.

**Що можуть спитати далі:** Course Schedule I (лише \`true\`/\`false\`); паралельне виконання — мінімальна кількість «семестрів» (BFS по рівнях Кана); лексикографічно найменший порядок (купа замість черги); Alien Dictionary; де це у фронтенді — порядок ініціалізації модулів, збірка пакетів у монорепозиторії (Nx, Turborepo), \`npm\` dependency resolution.
`
      },
      {
        id: 'ds-dijkstra', group: "graphs",
        type: 'code',
        level: 4,
        title: 'Алгоритм Дейкстри з купою',
        tags: ['graph', 'dijkstra', 'heap'],
        description: `
**Завдання.** Напишіть \`dijkstra(n, edges, source)\`: є \`n\` вершин \`0..n-1\` і **орієнтовані** зважені ребра \`[from, to, weight]\` з \`weight ≥ 0\`. Поверніть масив \`dist\` довжини \`n\`, де \`dist[v]\` — довжина найкоротшого шляху від \`source\` до \`v\`, або \`Infinity\`, якщо \`v\` недосяжна.

**Де трапляється:** маршрути з вагами: карти, мережі.

Можливі кратні ребра між тими самими вершинами та ребра з вагою 0. До 2·10⁴ вершин і 10⁵ ребер — очікується O((V + E) log V) з бінарною купою (її доведеться написати).

\`\`\`js
dijkstra(4, [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1]], 0);
// [0, 3, 1, 4]   (0 → 2 → 1 коротше, ніж пряме 0 → 1)
\`\`\`

**Як це працює:** Відстані спочатку Infinity, до джерела — 0. Беремо з min-купи вершину з найменшою відстанню і релаксуємо ребра: якщо через неї шлях коротший — оновлюємо відстань і кладемо в купу. Застарілі записи купи пропускаємо.
`,
        starter: `function dijkstra(n, edges, source) {
  // 1. Список суміжності; dist = Infinity, dist[source] = 0
  // 2. Min-купа [відстань, вершина]; застарілий запис пропустити
  // 3. Релаксація: dist[u] + w < dist[v] → оновити і покласти в купу
  // TODO
}
`,
        solution: `function dijkstra(n, edges, source) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) adj[u].push([v, w]);

  const dist = new Array(n).fill(Infinity);
  dist[source] = 0;

  // Мінімальна купа пар [відстань, вершина]
  const heap = [[0, source]];
  const push = (item) => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return top;
  };

  while (heap.length) {
    const [d, u] = pop();
    if (d > dist[u]) continue; // застарілий запис (lazy deletion) — вершину вже оброблено коротшим шляхом
    for (const [v, w] of adj[u]) {
      const nd = d + w;
      if (nd < dist[v]) { // релаксація ребра
        dist[v] = nd;
        push([nd, v]);
      }
    }
  }
  return dist;
}
`,
        hints: [
          "Жадібна ідея: щоразу беремо ще не оброблену вершину з **найменшою** поточною відстанню — для неї відстань уже остаточна (бо ваги невід'ємні).",
          "Релаксація: для ребра `u → v` з вагою `w`, якщо `dist[u] + w < dist[v]`, оновлюємо `dist[v]`. Щоб швидко знаходити мінімальну вершину, використайте min-купу пар `[dist, vertex]`.",
          "Замість операції decrease-key просто кладіть у купу нову пару, а при вилученні пропускайте застарілі: `if (d > dist[u]) continue;` (lazy deletion)."
        ],
        tests: [
          "expect(dijkstra(4, [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1]], 0)).toEqual([0, 3, 1, 4])",
          { name: 'недосяжні вершини — Infinity', code: 'expect(dijkstra(3, [[0, 1, 5]], 0)).toEqual([0, 5, Infinity]);\nexpect(dijkstra(3, [[0, 1, 5]], 2)).toEqual([Infinity, Infinity, 0]);' },
          { name: 'одна вершина', code: 'expect(dijkstra(1, [], 0)).toEqual([0]);' },
          { name: 'жадібний вибір найкоротшого ребра не працює', code: 'expect(dijkstra(3, [[0, 2, 5], [0, 1, 1], [1, 2, 1]], 0)).toEqual([0, 1, 2]);\nexpect(dijkstra(4, [[0, 1, 1], [0, 2, 10], [1, 3, 100], [2, 3, 1]], 0)).toEqual([0, 1, 10, 11]);' },
          { name: 'кратні ребра і нульові ваги', code: 'expect(dijkstra(3, [[0, 1, 7], [0, 1, 2], [1, 2, 0], [0, 2, 3]], 0)).toEqual([0, 2, 2]);' },
          { name: 'орієнтованість ребер', code: 'expect(dijkstra(2, [[1, 0, 1]], 0)).toEqual([0, Infinity]);' },
          { name: 'цикли в графі', code: 'expect(dijkstra(4, [[0, 1, 1], [1, 2, 1], [2, 0, 1], [2, 3, 5], [1, 3, 10]], 0)).toEqual([0, 1, 2, 7]);' },
          { name: '2·10^4 вершин, 10^5 ребер — O((V + E) log V)', code: 'const n = 20000;\nconst edges = [];\nfor (let i = 0; i + 1 < n; i++) edges.push([i, i + 1, 1]);\nfor (let i = 0; i < n; i++) {\n  for (let k = 1; k <= 4; k++) {\n    const j = (i * 7919 + k * 104729) % n;\n    edges.push([i, j, j > i ? j - i + (i % 3) : (i * k) % 50]);\n  }\n}\nconst t0 = performance.now();\nconst d = dijkstra(n, edges, 0);\nconst ms = performance.now() - t0;\nexpect(d.length).toBe(n);\nexpect(d.every((x, i) => x === i)).toBe(true);\nexpect(ms).toBeLessThan(1000);' }
        ],
        explanation: `
**Патерн:** Дейкстра — жадібний алгоритм + черга з пріоритетом (min-купа). Тригер: «найкоротший шлях / мінімальна вартість / час поширення» з **невід'ємними** вагами.

**Ідея:** вершина з найменшою \`dist\` серед необроблених має остаточну відстань: будь-який інший шлях до неї йде через вершину з не меншою відстанню, а ваги ≥ 0 — довшим він не стане коротшим. Обробляємо її — релаксуємо вихідні ребра.

**Lazy deletion:** у купі може лежати кілька записів для однієї вершини; застарілі (\`d > dist[u]\`) пропускаємо. Це простіше, ніж decrease-key, і дає ту саму асимптотику: O(E log E) = O(E log V).

**Складність:**
| Реалізація | Час |
|---|---|
| Масив + лінійний пошук мінімуму | O(V²) — ок для щільних графів |
| Бінарна купа (рішення) | O((V + E) log V) |
| Купа Фібоначчі (теоретично) | O(E + V log V) |

Пам'ять O(V + E).

**Обмеження:** від'ємні ваги ламають жадібну ідею — потрібен Bellman-Ford (O(V·E)) або для DAG — релаксація в топологічному порядку. Для незважених графів — просто BFS.

**Типові помилки:**
- немає перевірки застарілих записів → повторна обробка, на щільних графах сильне сповільнення;
- сортувати масив черги після кожного додавання — O(V · E log E);
- «відвідана» вершина позначається при додаванні в купу (як у BFS) — для Дейкстри це неправильно: відстань ще може зменшитися;
- \`dist\` заповнений \`0\` або \`-1\` замість \`Infinity\`.

**Що можуть спитати далі:** відновити сам шлях (масив \`prev\`); Network Delay Time; найдешевший рейс з не більше ніж k пересадками (Bellman-Ford / BFS за рівнями); A* (Дейкстра + евристика, напр., у навігації); Дейкстра на сітці з різною вартістю клітинок.
`
      },
      // ===================================================== TRIE
      {
        id: 'ds-trie', group: "trie",
        type: 'code',
        level: 3,
        title: 'Префіксне дерево (Trie)',
        tags: ['trie', 'strings', 'class'],
        description: `
**Завдання.** Реалізуйте клас \`Trie\` (префіксне дерево):

**Де трапляється:** автодоповнення і пошук за префіксом.

- \`insert(word)\` — додати слово;
- \`search(word)\` — \`true\`, якщо **саме це слово** було додане;
- \`startsWith(prefix)\` — \`true\`, якщо хоча б одне додане слово починається з \`prefix\`.

Кожна операція — **O(L)**, де L — довжина слова/префікса (не залежить від кількості слів). Слова можуть містити будь-які символи (не лише \`a-z\`), регістр має значення. Слова непорожні.

\`\`\`js
const t = new Trie();
t.insert('apple');
t.search('apple');   // true
t.search('app');     // false — це лише префікс
t.startsWith('app'); // true
t.insert('app');
t.search('app');     // true
\`\`\`

**Як це працює:** Кожен вузол — Map символ → дочірній вузол і прапорець «тут закінчується слово». insert створює вузли по символах, search і startsWith спускаються по символах; search ще перевіряє прапорець.
`,
        starter: `// План:
// 1. Вузол: { children: Map, isEnd }
// 2. insert: спуститися по символах, створюючи вузли; в кінці isEnd = true
// 3. search: дійти до кінця слова і перевірити isEnd; startsWith — лише дійти до кінця префікса

class Trie {
  insert(word) {
    // TODO
  }
  search(word) {
    // TODO
  }
  startsWith(prefix) {
    // TODO
  }
}
`,
        solution: `class Trie {
  constructor() {
    // вузол: { children: Map<символ, вузол>, isEnd: boolean }
    this.root = { children: new Map(), isEnd: false };
  }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, { children: new Map(), isEnd: false });
      }
      node = node.children.get(ch);
    }
    node.isEnd = true; // позначаємо кінець слова
  }

  // спуск по символах; null — якщо шлях обірвався
  #walk(str) {
    let node = this.root;
    for (const ch of str) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }

  search(word) {
    const node = this.#walk(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix) {
    return this.#walk(prefix) !== null;
  }
}
`,
        hints: [
          "Кожен вузол дерева — один символ; шлях від кореня до вузла — префікс. Спільні префікси слів зберігаються один раз.",
          "Вузол: `{ children: Map, isEnd: false }`. `insert` спускається по символах, створюючи відсутні вузли, і в кінці ставить `isEnd = true`.",
          "`search` і `startsWith` — однаковий спуск; різниця лише в кінці: для `search` потрібен `isEnd === true`, для `startsWith` достатньо, що шлях існує. Використайте `Map` (або об'єкт без прототипу), щоб підтримати будь-які символи."
        ],
        tests: [
          { name: 'приклад з умови', code: "const t = new Trie();\nt.insert('apple');\nexpect(t.search('apple')).toBe(true);\nexpect(t.search('app')).toBe(false);\nexpect(t.startsWith('app')).toBe(true);\nt.insert('app');\nexpect(t.search('app')).toBe(true);" },
          { name: 'відсутні слова і префікси', code: "const t = new Trie();\nt.insert('car');\nexpect(t.search('cart')).toBe(false);\nexpect(t.startsWith('cart')).toBe(false);\nexpect(t.startsWith('b')).toBe(false);\nexpect(t.search('ca')).toBe(false);" },
          { name: 'порожній trie', code: "const t = new Trie();\nexpect(t.search('a')).toBe(false);\nexpect(t.startsWith('a')).toBe(false);" },
          { name: 'регістр має значення', code: "const t = new Trie();\nt.insert('Hello');\nexpect(t.search('hello')).toBe(false);\nexpect(t.startsWith('He')).toBe(true);" },
          { name: 'будь-які символи (кирилиця, спецсимволи)', code: "const t = new Trie();\nt.insert('привіт');\nt.insert('constructor');\nt.insert('__proto__');\nexpect(t.search('привіт')).toBe(true);\nexpect(t.startsWith('при')).toBe(true);\nexpect(t.search('constructor')).toBe(true);\nexpect(t.search('__proto__')).toBe(true);\nexpect(t.search('toString')).toBe(false);\nexpect(t.startsWith('to')).toBe(false);" },
          { name: 'повторна вставка і слова-префікси одне одного', code: "const t = new Trie();\n['a', 'ab', 'abc', 'abc'].forEach((w) => t.insert(w));\nexpect(['a', 'ab', 'abc', 'abcd'].map((w) => t.search(w))).toEqual([true, true, true, false]);" },
          { name: 'екземпляри незалежні', code: "const a = new Trie(), b = new Trie();\na.insert('x');\nexpect(b.search('x')).toBe(false);" },
          { name: '2·10^4 слів і 4·10^4 запитів — O(L) на операцію', code: "const word = (i) => { let s = ''; let x = i * 7919 + 13; for (let k = 0; k < 8; k++) { s += String.fromCharCode(97 + (x % 26)); x = Math.floor(x / 26) + k * 31; } return s; };\nconst words = Array.from({ length: 20000 }, (_, i) => word(i));\nconst t0 = performance.now();\nconst t = new Trie();\nwords.forEach((w) => t.insert(w));\nlet hits = 0, prefixHits = 0;\nfor (let i = 0; i < 20000; i++) {\n  if (t.search(words[i])) hits++;\n  if (t.startsWith(words[i].slice(0, 5))) prefixHits++;\n}\nconst ms = performance.now() - t0;\nexpect(hits).toBe(20000);\nexpect(prefixHits).toBe(20000);\nexpect(t.search('zzzzzzzzz')).toBe(false);\nexpect(ms).toBeLessThan(1000);" }
        ],
        explanation: `
**Патерн:** trie (префіксне дерево). Тригери: «автодоповнення», «чи є слово з префіксом», «пошук слів на сітці» (Word Search II), «найдовший спільний префікс», маршрутизація URL (radix tree у роутерах).

**Складність:**
| Операція | Час |
|---|---|
| \`insert\` / \`search\` / \`startsWith\` | O(L) |
| Пам'ять | O(сумарна довжина всіх слів) у гіршому випадку |

**Порівняння з альтернативами:**
- \`Set\` слів: \`search\` — O(L) (хешування рядка), але \`startsWith\` — перебір усіх слів O(N·L);
- відсортований масив + бінарний пошук: \`startsWith\` за O(L log N) — теж хороший варіант, якщо слова не змінюються;
- trie виграє, коли багато префіксних запитів і потрібен перебір слів з префіксом.

**Map vs об'єкт для дітей:** звичайний об'єкт \`{}\` має прототип — \`'constructor' in {}\` → \`true\`, а ключ \`'__proto__'\` поводиться особливо. Тому \`Map\` або \`Object.create(null)\`. Масив на 26 елементів — найшвидше, але лише для \`a-z\`.

**Типові помилки:**
- відсутній прапорець \`isEnd\` → \`search('app')\` повертає \`true\` після вставки \`'apple'\`;
- зберігати в кожному вузлі повний масив слів — пам'ять вибухає;
- \`word.split('')\` для символів поза BMP (емодзі) розбиває сурогатні пари; \`for...of\` ітерує по code points.

**Що можуть спитати далі:** \`delete(word)\` з очищенням непотрібних вузлів; підрахунок слів з префіксом (лічильник у вузлі); пошук з wildcard \`.\` (Design Add and Search Words — DFS по trie); Word Search II (trie + backtracking по сітці); стиснений trie (radix tree).
`
      },
      {
        id: 'ds-search-suggestions', group: "trie",
        type: 'code',
        level: 3,
        title: 'Автодоповнення: підказки під час набору',
        tags: ['trie', 'strings', 'binary-search', 'autocomplete'],
        description: `
**Завдання.** Напишіть \`suggestedProducts(products, searchWord)\`. Користувач набирає \`searchWord\` по одному символу. Після **кожного** символу показуйте до **трьох** назв продуктів, що починаються з уже набраного префікса, — **лексикографічно найменші**.

**Де трапляється:** підказки в рядку пошуку.

Поверніть масив масивів: \`i\`-й елемент — підказки після введення перших \`i + 1\` символів. Назви продуктів унікальні, лише малі латинські літери. Вхідний масив не змінюйте.

\`\`\`js
suggestedProducts(['mobile', 'mouse', 'moneypot', 'monitor', 'mousepad'], 'mouse');
// [
//   ['mobile', 'moneypot', 'monitor'],  // 'm'
//   ['mobile', 'moneypot', 'monitor'],  // 'mo'
//   ['mouse', 'mousepad'],              // 'mou'
//   ['mouse', 'mousepad'],              // 'mous'
//   ['mouse', 'mousepad'],              // 'mouse'
// ]
\`\`\`

**Як це працює:** Сортуємо продукти і будуємо trie, де кожен вузол пам'ятає до трьох перших слів, що проходять через нього. Для кожного префікса пошукового слова спускаємось на символ і беремо збережені підказки.
`,
        starter: `function suggestedProducts(products, searchWord) {
  // 1. Відсортувати копію продуктів
  // 2. Trie, де кожен вузол зберігає до 3 перших слів
  // 3. Для кожного префікса пошукового слова — спуститися і взяти підказки
  // TODO
}
`,
        solution: `function suggestedProducts(products, searchWord) {
  // Trie, у кожному вузлі якого зберігаємо до 3 лексикографічно найменших слів піддерева.
  // Якщо вставляти слова у відсортованому порядку, перші 3, що дійшли до вузла, і є найменшими.
  const sorted = [...products].sort(); // копія — не мутуємо вхід
  const root = { children: new Map(), top: [] };
  for (const word of sorted) {
    let node = root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), top: [] });
      node = node.children.get(ch);
      if (node.top.length < 3) node.top.push(word);
    }
  }

  const result = [];
  let node = root;
  for (const ch of searchWord) {
    node = node && node.children.get(ch); // після обриву шляху node лишається undefined
    result.push(node ? node.top.slice() : []);
  }
  return result;
}
`,
        hints: [
          "Наївно: для кожного префікса фільтрувати всі продукти і сортувати — повторна робота на кожному символі. Відсортуйте продукти **один раз**.",
          "Варіант 1: відсортований масив + бінарний пошук першого слова ≥ префікса; підказки — до 3 слів підряд з цієї позиції, якщо вони починаються з префікса. Варіант 2: trie.",
          "Trie-варіант: вставляйте слова у відсортованому порядку і в кожному вузлі на шляху зберігайте перші 3 слова, що через нього пройшли. Відповідь для префікса — `top` відповідного вузла; якщо шлях обірвався — далі всі відповіді `[]`."
        ],
        tests: [
          { name: 'приклад з умови', code: "expect(suggestedProducts(['mobile', 'mouse', 'moneypot', 'monitor', 'mousepad'], 'mouse')).toEqual([\n  ['mobile', 'moneypot', 'monitor'],\n  ['mobile', 'moneypot', 'monitor'],\n  ['mouse', 'mousepad'],\n  ['mouse', 'mousepad'],\n  ['mouse', 'mousepad']\n]);" },
          { name: 'один продукт, що збігається повністю', code: "expect(suggestedProducts(['havana'], 'havana')).toEqual(Array(6).fill(['havana']));" },
          { name: 'збіги обриваються посередині', code: "expect(suggestedProducts(['havana'], 'hat')).toEqual([['havana'], ['havana'], []]);\nexpect(suggestedProducts(['havana'], 'tatiana')).toEqual(Array(7).fill([]));" },
          { name: 'порожній список продуктів', code: "expect(suggestedProducts([], 'ab')).toEqual([[], []]);" },
          { name: 'лексикографічний порядок і обмеження 3', code: "expect(suggestedProducts(['bags', 'baggage', 'banner', 'box', 'cloths'], 'bags')).toEqual([\n  ['baggage', 'bags', 'banner'],\n  ['baggage', 'bags', 'banner'],\n  ['baggage', 'bags'],\n  ['bags']\n]);" },
          { name: 'короткі слова-префікси та вхід не мутується', code: "const p = ['abc', 'ab', 'a', 'abcd'];\nexpect(suggestedProducts(p, 'abc')).toEqual([['a', 'ab', 'abc'], ['ab', 'abc', 'abcd'], ['abc', 'abcd']]);\nexpect(p).toEqual(['abc', 'ab', 'a', 'abcd']);" },
          { name: '2·10^4 продуктів — швидко', code: "const word = (i) => { let s = ''; let x = i * 7919 + 13; for (let k = 0; k < 10; k++) { s += String.fromCharCode(97 + (x % 26)); x = Math.floor(x / 26) + k * 17; } return s; };\nconst products = [...new Set(Array.from({ length: 20000 }, (_, i) => word(i)))];\nconst t0 = performance.now();\nlet total = 0;\nfor (let q = 0; q < 5; q++) total += suggestedProducts(products, word(q * 37)).length;\nconst ms = performance.now() - t0;\nexpect(total).toBe(50);\nconst sorted = [...products].sort();\nconst r = suggestedProducts(products, sorted[0]);\nexpect(r[r.length - 1][0]).toBe(sorted[0]);\nexpect(ms).toBeLessThan(1500);" }
        ],
        explanation: `
**Патерн:** trie з кешованими «топ-k» у вузлах **або** сортування + бінарний пошук. Це спрощена модель реального автокомпліту в пошукових полях.

**Trie-підхід (у рішенні):** сортуємо слова один раз; при вставці в кожен вузол шляху додаємо слово, поки там менше 3. Оскільки вставка йде в лексикографічному порядку, перші 3 слова в кожному вузлі — найменші в його піддереві. Відповідь на кожен символ — O(1) (спуск на 1 вузол).

**Бінарний пошук:**
\`\`\`js
const sorted = [...products].sort();
let lo = 0, prefix = '';
for (const ch of searchWord) {
  prefix += ch;
  let hi = sorted.length;                  // lower_bound(prefix), починаючи з попереднього lo
  while (lo < hi) { const m = (lo + hi) >> 1; if (sorted[m] < prefix) lo = m + 1; else hi = m; }
  res.push(sorted.slice(lo, lo + 3).filter((w) => w.startsWith(prefix)));
}
\`\`\`

**Складність:**
| Підхід | Препроцесинг | Кожен символ |
|---|---|---|
| Фільтр + сортування щоразу | — | O(N·L + N log N) |
| Сортування + бінарний пошук | O(N log N · L) | O(L log N) |
| Trie з top-3 | O(N log N · L + S) | O(1) |

S — сумарна довжина слів (пам'ять trie).

**Типові помилки:**
- \`products.sort()\` мутує вхідний масив;
- після обриву шляху в trie продовжувати пошук з кореня замість повертати \`[]\`;
- сортування з компаратором \`(a, b) => a - b\` для рядків (\`NaN\`) — для рядків достатньо \`sort()\` або \`localeCompare\`.

**Що можуть спитати далі:** ранжування за популярністю (у вузлах — top-k за вагою, купа); оновлення ваг у реальному часі; нечіткий пошук з помилками (відстань Левенштейна); фронтенд-частина: debounce запитів, скасування застарілих (\`AbortController\`), кешування результатів префіксів, доступність комбобокса (\`role="combobox"\`, \`aria-activedescendant\`).
`
      },
    ]
  });
})();
