FE.topic('tooling', {
  intro: `
## Git — мінімум напам'ять

| Команда | Що робить |
|---|---|
| \`git merge feature\` | Зливає гілку: fast-forward або merge-коміт з двома батьками |
| \`git rebase main\` | Переписує коміти поточної гілки поверх \`main\` (нові хеші!) |
| \`git rebase -i HEAD~3\` | squash / fixup / reword / drop / reorder |
| \`git cherry-pick <sha>\` | Копіює один коміт у поточну гілку (новий хеш) |
| \`git reset --soft/--mixed/--hard\` | Рухає гілку назад; зміни лишаються в індексі / у робочій теці / **знищуються** |
| \`git revert <sha>\` | Новий коміт, що скасовує зміни — **безпечно для спільних гілок** |
| \`git stash\` / \`stash pop\` | Відкласти незакомічені зміни |
| \`git reflog\` | Журнал руху HEAD — порятунок після \`reset --hard\` |
| \`git bisect\` | Бінарний пошук коміту, що вніс баг |

**Золоте правило rebase:** не переписуйте історію, яку вже запушено в спільну гілку.

## npm і semver

- \`MAJOR.MINOR.PATCH\`: breaking / нова функціональність / виправлення.
- \`^1.2.3\` = \`>=1.2.3 <2.0.0\`; \`~1.2.3\` = \`>=1.2.3 <1.3.0\`; **\`^0.2.3\` = \`>=0.2.3 <0.3.0\`**.
- \`dependencies\` — рантайм; \`devDependencies\` — розробка/збірка; \`peerDependencies\` — надає хост (react для UI-бібліотеки).
- Lock-файл **комітимо**; у CI — \`npm ci\` (строго за lock, падає при розсинхроні).

## CommonJS vs ESM

| | CommonJS | ES Modules |
|---|---|---|
| Синтаксис | \`require\` / \`module.exports\` | \`import\` / \`export\` |
| Завантаження | синхронне, під час виконання | граф будується **до** виконання |
| Імпорт | **копія** значення | **живий зв'язок** (live binding), read-only |
| Tree shaking | ні | так (статичний аналіз) |
| Динаміка | \`require(variable)\` будь-де | \`import()\` повертає Promise |

\`"type": "module"\` → \`.js\` = ESM; \`.cjs\` — завжди CommonJS, \`.mjs\` — завжди ESM. Node 22+ вміє \`require(esm)\`.

## Збірка (2026)

- **Vite** — стандарт для нових SPA: dev на нативних ESM, prod-збірка — Rolldown (Rust; у старших версіях — Rollup + esbuild). **webpack 5** — легасі й Module Federation; **Rspack** — webpack-сумісний на Rust; **Turbopack** — у Next.js.
- **Транспіляція** (Babel, SWC, esbuild, Oxc) — **синтаксис**; **поліфіли** (core-js) — відсутні **API**. Цілі — \`browserslist\`.
- **Tree shaking** — лише статичні ESM + \`"sideEffects": false\`. **Code splitting** — \`import()\`.
- \`import.meta.env.VITE_*\` вшивається в бандл → **жодних секретів** у фронтенд-\`.env\`.

## Якість і CI

- **ESLint** (flat config \`eslint.config.js\`) — помилки; **Prettier** — форматування; швидкі альтернативи — Biome, oxlint.
- **husky** + **lint-staged** — pre-commit лише для змінених файлів; CI все одно повторює перевірки.
- CI: \`npm ci\` (з кешем) → lint → typecheck → test → build → e2e → preview deploy.
`,
  groups: [
    {
      id: 'git-core',
      title: 'Git: коміти, гілки, скасування змін'
    },
    {
      id: 'git-team',
      title: 'Git у команді: rebase, конфлікти, workflow'
    },
    {
      id: 'npm-semver',
      title: 'package.json і semver'
    },
    {
      id: 'deps-install',
      title: 'Lock-файли, менеджери пакетів, монорепо'
    },
    {
      id: 'modules',
      title: 'CommonJS vs ES Modules'
    },
    {
      id: 'build',
      title: 'Бандлери, транспіляція, tree shaking'
    },
    {
      id: 'quality-ci',
      title: 'Якість коду, CI/CD, DevTools'
    }
  ],
  items: [
    // ---------------------------------------------------------------- Крок 1. Git: основи
    {
      id: 'tool-git-basics',
      group: 'git-core',
      type: 'theory',
      level: 1,
      title: 'Коміт, гілка, HEAD: як Git зберігає історію',
      tags: ['git'],
      question: 'Що таке коміт і гілка в Git? Що таке HEAD, індекс (staging area) і робоча тека?',
      choices: [
        'Гілка — це окрема копія файлів проєкту всередині `.git`, тому створення гілки у великому репо займає помітний час і місце на диску',
        'Коміт зберігає лише diff відносно батька, а хеш генерується випадково, тож зміна повідомлення коміту не змінює його хеш',
        'Гілка — легкий рухомий вказівник на коміт, HEAD показує поточну позицію, а `git add` переносить зміни з робочої теки в індекс',
        '`git fetch` завантажує віддалені коміти й одразу зливає їх у поточну гілку, а `git pull` лише оновлює гілки `origin/*`',
        'Detached HEAD означає, що поточна гілка пошкоджена, і створювати нові коміти в цьому стані Git не дозволяє взагалі',
      ],
      correct: 2,
      why: [
        'Хибно: гілка — це файл із хешем коміту в `.git/refs/heads`, створюється миттєво й майже нічого не займає.',
        'Хибно: коміт посилається на повний знімок дерева, а хеш рахується від вмісту — нове повідомлення дає новий хеш.',
        'Правильно: гілка — вказівник, HEAD — поточна позиція, `git add` готує зміни в індексі для наступного коміту.',
        'Навпаки: `fetch` лише оновлює `origin/*`, а `pull` = `fetch` + `merge` (або `rebase`).',
        'Хибно: у detached HEAD комітити можна, але без нової гілки ці коміти легко загубити.'
      ],
      hint: 'Подумайте, що саме зберігає коміт (diff чи знімок?) і чим насправді є гілка.',
      answer: `
**Коміт** — незмінний об'єкт: **знімок (snapshot)** дерева файлів + батько(и) + автор, дата, повідомлення. Хеш рахується від вмісту → будь-яка зміна (навіть повідомлення) дає **новий** коміт.

**Гілка** — рухомий **вказівник** на коміт (файл із хешем). Створення миттєве; при новому коміті поточна гілка зсувається на нього.

**HEAD** — «де я зараз»: зазвичай на гілку (\`HEAD -> main\`), після \`git checkout <sha>\` — прямо на коміт (**detached HEAD**; нові коміти треба зберегти гілкою).

**Три зони:** робоча тека → індекс (\`git add\`) → репозиторій (\`git commit\`).

\`\`\`text
git add file.js      # working tree -> index
git commit -m "..."  # index -> новий коміт
git switch -c feat   # нова гілка = новий вказівник на той самий коміт
\`\`\`

**Нюанс:** \`git fetch\` лише завантажує й оновлює \`origin/*\`; \`git pull\` = \`fetch\` + \`merge\`/\`rebase\`.
`,
      keyPoints: [
        'Коміт — знімок дерева + батько(и) + метадані, ідентифікується хешем',
        'Гілка — легкий рухомий вказівник на коміт',
        'HEAD — поточна позиція; detached HEAD при checkout коміту',
        'Три зони: working tree → index (staging) → repository',
        'fetch vs pull (fetch + merge/rebase)'
      ],
      followUps: ['Що таке fast-forward merge?', 'Що станеться з комітами, зробленими в detached HEAD?', 'Чим git switch/restore відрізняються від checkout?']
    },
    {
      id: 'tool-quiz-reset-modes',
      group: 'git-core',
      type: 'quiz',
      level: 2,
      title: 'git reset --soft HEAD~1',
      tags: ['git'],
      question: `
Ви щойно зробили коміт і зрозуміли, що забули додати файл. Виконуєте:

\`\`\`text
git reset --soft HEAD~1
\`\`\`

Що станеться зі змінами з цього коміту?
`,
      options: [
        'Зміни знищено — їх можна повернути лише через reflog',
        'Коміт прибрано з гілки, зміни лишились у робочій теці, але **не** в індексі',
        'Коміт прибрано з гілки, зміни лишились **в індексі** (staged), готові до нового коміту',
        'Створено новий коміт, який скасовує попередній'
      ],
      answer: 2,
      why: [
        'Так поводиться `--hard`; `--soft` не чіпає ні індекс, ні робочу теку.',
        'Це режим `--mixed` (за замовчуванням): він скидає ще й індекс.',
        'Правильно: `--soft` рухає лише вказівник гілки, тому зміни коміту лишаються staged.',
        'Новий скасувальний коміт створює `git revert`, а `reset` просто рухає вказівник назад.'
      ],
      hint: 'Три режими reset відрізняються тим, що вони «відкочують» окрім самого вказівника гілки: нічого, індекс чи ще й робочу теку.',
      explanation: `
\`git reset\` рухає вказівник гілки; режим визначає, що ще скидається:

| Режим | Індекс | Робоча тека |
|---|---|---|
| \`--soft\` | — | — |
| \`--mixed\` (default) | скидається | — |
| \`--hard\` | скидається | **скидається** |

Для «забув файл» ще простіше: \`git add file && git commit --amend\` — поки коміт не запушено.
`
    },
    {
      id: 'tool-quiz-revert-shared',
      group: 'git-core',
      type: 'quiz',
      level: 2,
      title: 'Як скасувати запушений коміт у main',
      tags: ['git'],
      question: 'Коміт з багом уже запушено в `main`, колеги встигли зробити pull і продовжують роботу. Як **правильно** скасувати його зміни?',
      options: [
        '`git reset --hard HEAD~1` і `git push --force`',
        '`git rebase -i` з `drop` цього коміту і `git push --force-with-lease`',
        '`git revert <sha>` і звичайний `git push`',
        '`git commit --amend` і `git push --force`'
      ],
      answer: 2,
      why: [
        'Переписує опубліковану історію: у колег лишиться «зниклий» коміт, а force push може затерти чужу роботу.',
        'Теж переписування історії; `--force-with-lease` не затре чужі коміти, але в тих, хто вже зробив pull, буде розсинхрон.',
        'Правильно: `revert` додає новий коміт з інвертованими змінами — історія лише доповнюється.',
        '`--amend` створює новий коміт з новим хешем замість старого — це переписування, і він не скасовує баг.'
      ],
      hint: 'Яка з команд не переписує вже опубліковану історію?',
      explanation: `
\`git revert <sha>\` створює **новий** коміт з протилежними змінами. Колеги просто роблять pull, а в історії видно, що і чому скасовано.

Правило: **спільну історію не переписуємо** (\`reset\`, \`rebase\`, \`amend\` + force push).

Нюанс: revert **merge-коміту** потребує \`-m 1\` (основний батько), а повторне вливання тієї ж гілки — revert самого revert-коміту.
`
    },
    // ---------------------------------------------------------------- Крок 2. Git у команді
    {
      id: 'tool-git-merge-rebase',
      group: 'git-team',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'merge vs rebase vs squash',
      tags: ['git'],
      question: 'Чим відрізняються merge і rebase? Коли що використовувати? Що таке «золоте правило rebase» і squash? Оберіть **усі** правильні твердження.',
      choices: [
        '`merge` завжди створює merge-коміт з двома батьками, навіть коли цільова гілка не пішла вперед',
        '`rebase` переписує коміти поверх нової бази: вони отримують нові хеші, а історія стає лінійною',
        'Після rebase своєї запушеної гілки безпечніше `git push --force`, ніж `--force-with-lease`',
        'Squash-merge зберігає всі проміжні коміти фічі, тому `git bisect` всередині неї працює краще',
        'Ребейзити коміти, які вже є у спільній гілці, не варто — у колег зʼявляться дублікати й конфлікти',
      ],
      correct: [1, 4],
      why: [
        'Хибно: якщо цільова гілка не пішла вперед, відбувається fast-forward — вказівник просто зсувається, без merge-коміту.',
        'Правильно: rebase створює нові коміти A\', B\' поверх бази, тому хеші змінюються.',
        'Навпаки: `--force-with-lease` відмовить, якщо на сервері з\'явились чужі коміти, а `--force` їх затре.',
        'Хибно: squash стискає фічу в один коміт — проміжні кроки втрачаються, bisect всередині фічі неможливий.',
        'Правильно: це золоте правило rebase — у колег лишаться старі коміти, а у вас нові з іншими хешами.'
      ],
      hint: 'Що відбувається з хешами комітів при rebase? І хто ще міг на них посилатися?',
      answer: `
**merge** зберігає історію як є: **fast-forward** (якщо ціль не пішла вперед) або **merge-коміт** з двома батьками.

**rebase** переписує коміти поточної гілки поверх іншої бази — **нові хеші**, лінійна історія.

\`\`\`text
          A---B  feature                         A'--B'  feature
         /                git rebase main        /
    C---D---E  main      ------------->   C---D---E  main
\`\`\`

**Золоте правило:** не ребейзити коміти зі **спільної** гілки. Свою feature-гілку — можна, потім \`git push --force-with-lease\`.

**squash** — кілька комітів в один (\`rebase -i\` або «Squash and merge»): чистий main, один коміт = один PR, легкий revert; мінус — втрата проміжних кроків.

**Коли що:**
- оновити свою гілку свіжим main → \`git rebase main\` / \`git pull --rebase\`;
- влити фічу → merge-коміт або squash-merge (домовленість команди);
- прибрати «wip», «fix typo» перед ревʼю → interactive rebase.

**Конфлікти:** при merge — один раз; при rebase — можуть бути на кожному коміті (\`--continue\` / \`--abort\`).
`,
      keyPoints: [
        'merge зберігає історію (fast-forward або merge-коміт з двома батьками)',
        'rebase переписує коміти → нові хеші, лінійна історія',
        'Золоте правило: не ребейзити спільну запушену історію',
        'force-with-lease замість force після rebase своєї гілки',
        'squash: один коміт на фічу, чистий main, але втрата деталей'
      ],
      followUps: ['Що таке git pull --rebase і коли він кращий за звичайний pull?', 'Як скасувати невдалий rebase?', 'Яку стратегію мерджу PR ви б обрали для команди і чому?']
    },
    {
      id: 'tool-git-toolbox',
      group: 'git-team',
      type: 'theory',
      level: 2,
      title: 'stash, cherry-pick, конфлікти, reflog, bisect',
      tags: ['git'],
      question: 'Розкажіть про git stash, cherry-pick, reflog і bisect. Як ви вирішуєте конфлікти злиття?',
      choices: [
        '`git stash pop` застосовує зміни, але залишає запис у списку stash; прибирає його лише окрема команда `git stash drop`',
        '`git cherry-pick` переносить коміт з тим самим хешем, тому дублікатів в історії гілок не виникає',
        '`git bisect` перебирає коміти по черзі від найновішого, тож пошук регресії займає O(n) перевірок',
        'При конфлікті найнадійніше взяти свою версію цілком (`--ours`), а тести запускати вже після мерджу',
        '`git reflog` — локальний журнал рухів HEAD: з нього можна повернути стан, втрачений після `reset --hard`',
      ],
      correct: 4,
      why: [
        'Це поведінка `stash apply`; `pop` застосовує і одразу видаляє запис (якщо не було конфлікту).',
        'Хибно: cherry-pick створює новий коміт з новим хешем — звідси дублікати при зловживанні.',
        'Хибно: bisect — бінарний пошук між good і bad, тобто O(log n) перевірок.',
        'Хибно: треба зрозуміти намір обох змін, об\'єднати їх і прогнати тести до коміту, інакше чужа зміна зникне.',
        'Правильно: reflog пам\'ятає всі позиції HEAD (~90 днів, лише локально), тож «загублений» коміт легко повернути.'
      ],
      hint: 'Для кожної команди — одна типова життєва ситуація.',
      answer: `
**\`git stash\`** — відкласти незакомічені зміни (терміновий hotfix): \`git stash push -u -m "wip"\`, \`git stash pop\` (застосувати й видалити) / \`apply\` (без видалення).

**\`git cherry-pick <sha>\`** — копія конкретного коміту в поточну гілку (**новий хеш**). Типово: перенести hotfix з main у release-гілку.

**Конфлікти** — обидві сторони змінили ті самі рядки:
\`\`\`text
<<<<<<< HEAD
const limit = 10;
=======
const limit = 20;
>>>>>>> feature
\`\`\`
Зрозуміти **намір обох змін** → відредагувати → прибрати маркери → тести → \`git add\` + \`commit\` / \`rebase --continue\`. Відступити — \`--abort\`. Менше конфліктів: маленькі PR, частіше підтягувати main.

**\`git reflog\`** — локальний журнал рухів HEAD; рятує після \`reset --hard\` чи невдалого rebase: \`git reset --hard HEAD@{2}\`.

**\`git bisect\`** — бінарний пошук регресії, O(log n):
\`\`\`text
git bisect start
git bisect bad            # зараз зламано
git bisect good v1.4.0    # тут працювало
git bisect run npm test   # автоматично
\`\`\`
`,
      keyPoints: [
        'stash — тимчасово відкласти зміни (pop vs apply, -u для untracked)',
        'cherry-pick — копія конкретного коміту (новий хеш), типово для hotfix',
        'Конфлікт: зрозуміти намір обох сторін, прибрати маркери, перевірити тестами, --abort для відступу',
        'reflog — журнал HEAD, відновлення після reset --hard/rebase',
        'bisect — бінарний пошук регресії, bisect run для автоматизації'
      ],
      followUps: ['Чи можна відновити незакомічені зміни після reset --hard?', 'Як cherry-pick діапазону комітів?', 'Що робить git rerere?']
    },
    {
      id: 'tool-quiz-reflog',
      group: 'git-team',
      type: 'quiz',
      level: 2,
      title: 'Порятунок після reset --hard',
      tags: ['git'],
      question: 'Ви випадково виконали `git reset --hard HEAD~3` у своїй локальній гілці і «втратили» три **закомічені** коміти (ще не запушені). Що робити?',
      options: [
        'Нічого не вдієш — reset --hard видаляє коміти назавжди',
        '`git revert HEAD~3`',
        '`git stash pop`',
        'Знайти хеш у `git reflog` і виконати `git reset --hard <sha>` (або `git branch rescue <sha>`)'
      ],
      answer: 3,
      why: [
        'Коміти лишаються в базі об\'єктів як недосяжні, доки їх не прибере `git gc` (тижні). Назавжди втрачено лише незакомічене.',
        '`revert` створює новий коміт, що скасовує зміни, — це протилежне до потрібного.',
        '`stash pop` повертає лише те, що відклали через `stash`, а коміти туди не потрапляли.',
        'Правильно: reflog пам\'ятає, де був HEAD до reset, — повертаємо гілку на той коміт.'
      ],
      hint: 'Коміти в Git не зникають миттєво — на них просто перестала вказувати гілка. Хтось же пам\'ятає, де був HEAD.',
      explanation: `
\`reset --hard\` лише перемістив вказівник гілки; коміти стали недосяжними, але живуть, доки \`git gc\` не прибере їх після терміну reflog (за замовчуванням 30 днів для недосяжних).

\`\`\`text
git reflog
# HEAD@{0}: reset: moving to HEAD~3
# HEAD@{1}: commit: add form validation
git reset --hard HEAD@{1}
\`\`\`
`
    },
    {
      id: 'tool-git-workflow',
      group: 'git-team',
      type: 'theory',
      level: 2,
      title: 'Git flow vs trunk-based, conventional commits, code review',
      tags: ['git', 'process'],
      question: 'Які git-workflow ви знаєте? Порівняйте Git flow і trunk-based development. Що таке conventional commits і як має виглядати хороший PR/code review? Оберіть **усі** правильні твердження.',
      choices: [
        'Trunk-based: маленькі зміни потрапляють у `main` щонайменше щодня, а незавершені фічі ховаються за feature flags',
        'Git flow з `develop`, `release/*` і `hotfix/*` — стандарт для веб-команд, що практикують continuous delivery',
        'Conventional commits (`feat:`, `fix:`, `!` для breaking change) дають змогу автоматично генерувати CHANGELOG і semver-версію',
        'Головне в code review — відступи, лапки й іменування; архітектура та крайові випадки — зона відповідальності QA',
        'Один PR на кілька тисяч рядків кращий за серію малих: ревʼюер бачить фічу цілком і не втрачає контексту',
      ],
      correct: [0, 2],
      why: [
        'Правильно: гілки живуть години, а не тижні; feature flags дозволяють мерджити незавершене безпечно.',
        'Хибно: Git flow з довгими гілками підходить для версійних релізів (мобільні застосунки, бібліотеки); для CD — trunk-based.',
        'Правильно: `feat` → minor, `fix` → patch, `!`/`BREAKING CHANGE` → major — це рахують semantic-release, release-please.',
        'Хибно: стиль перевіряють лінтер і Prettier; ревʼю — про коректність, крайові випадки, архітектуру, безпеку.',
        'Хибно: великий PR неможливо уважно переглянути; малі PR (до ~400 рядків) ревʼюються швидше і якісніше.'
      ],
      hint: 'Подумайте про довжину життя гілок, частоту релізів і feature flags.',
      answer: `
**Git flow** — \`main\`, \`develop\`, \`feature/*\`, \`release/*\`, \`hotfix/*\`. Для рідкісних версійних релізів. Мінуси: довгі гілки → болючі мерджі.

**GitHub flow** — \`main\` завжди готовий до деплою + короткі гілки через PR.

**Trunk-based** — інтеграція в \`main\` щонайменше щодня, незавершене — за **feature flags**, потрібні сильний CI і автотести. Стандарт для веб-команд з continuous delivery.

**Conventional commits:**
\`\`\`text
feat(auth): add OAuth login
fix(cart)!: change total calculation

BREAKING CHANGE: total now includes tax
\`\`\`
Типи: \`feat\`, \`fix\`, \`docs\`, \`refactor\`, \`perf\`, \`test\`, \`build\`, \`ci\`, \`chore\`. Перевірка — commitlint у commit-msg хуці; автоматизація CHANGELOG і версії — semantic-release, release-please, changesets.

**Хороший PR:** маленький, одна логічна зміна, опис «що і навіщо» + як перевірити, зелений CI, self-review.

**Code review:** коректність, крайові випадки, архітектура, безпека, тести; стиль — справа лінтера. Коментарі про код, з «чому», \`nit:\` для дрібниць, відгук до доби.
`,
      keyPoints: [
        'Git flow: develop/release/hotfix, довгі гілки, для версійних релізів',
        'Trunk-based: маленькі зміни в main щодня, feature flags, сильний CI',
        'Conventional commits: type(scope)!: subject, BREAKING CHANGE footer',
        'Автоматизація: changelog і semver-версія з комітів (semantic-release, changesets)',
        'PR маленький, з описом «навіщо» і зеленим CI; review — про суть, не про стиль'
      ],
      followUps: ['Як feature flags допомагають у trunk-based?', 'Як налаштувати commitlint?', 'Що ви робите, якщо PR вийшов на 2000 рядків?']
    },
    {
      id: 'tool-parse-conventional-commit',
      group: 'git-team',
      type: 'code',
      level: 2,
      title: 'Парсер conventional commit',
      tags: ['git', 'regex'],
      description: `
**Завдання.** Розберіть повідомлення коміту у форматі [Conventional Commits](https://www.conventionalcommits.org/) на частини: тип, scope, чи є breaking change, опис.

**Де трапляється:** саме це роблять commitlint (перевіряє повідомлення в git-хуці \`commit-msg\`) і semantic-release / release-please (рахують версію та CHANGELOG). Регулярні вирази з групами — часте завдання на live coding.

**Що написати**
- \`parseConventionalCommit(message)\` → \`{ type, scope, breaking, subject }\` або \`null\`, якщо перший рядок не у форматі.

Формат першого рядка (header): \`type(scope)!: subject\`
- \`type\` — одна або більше **малих латинських літер**;
- \`(scope)\` — необов'язковий, непорожній, без пробілів і дужок; якщо немає → \`scope: null\`;
- \`!\` — необов'язковий маркер breaking change;
- далі **обов'язково** \`: \` (двокрапка + пробіл) і непорожній \`subject\` (повернути обрізаним по краях).

\`breaking\` = є \`!\` у header **або** якийсь рядок тіла починається з \`BREAKING CHANGE: \` чи \`BREAKING-CHANGE: \`.

**Приклад**
\`\`\`js
parseConventionalCommit('feat(auth)!: drop v1 tokens');
// { type: 'feat', scope: 'auth', breaking: true, subject: 'drop v1 tokens' }
parseConventionalCommit('fix: typo');
// { type: 'fix', scope: null, breaking: false, subject: 'typo' }
parseConventionalCommit('refactor: x\\n\\nBREAKING CHANGE: init() renamed');
// { ..., breaking: true }
parseConventionalCommit('Added stuff'); // null
\`\`\`

**Як це працює:** повідомлення ділимо по \`\\n\`: перший рядок — header, решта — тіло й футери. Header розбирає один регулярний вираз з групами захоплення; необов'язкова група, що не збіглася, дає \`undefined\` — замінюємо на \`null\`. Тіло перевіряємо **построково** з якорем \`^\`, щоб фраза «breaking change» посеред речення не рахувалась.

**Врахуйте:**
- \`'feat:no space'\`, \`'feat(): x'\`, \`'Feat: x'\`, \`'feat: '\`, \`''\` → \`null\`;
- пробіли в кінці subject обрізаються;
- текст «breaking change» усередині тіла (не з початку рядка) — не breaking.
`,
      starter: `function parseConventionalCommit(message) {
  // 1. Розділіть message по '\\n': header — перший рядок, body — решта рядків.

  // 2. Розберіть header регулярним виразом з групами:
  //    type ([a-z]+), необов'язковий (scope), необов'язковий "!", потім ": " і subject.
  //    Якщо не збіглося — поверніть null.
  // TODO

  // 3. breaking = є "!" у header АБО якийсь рядок body
  //    починається з "BREAKING CHANGE: " чи "BREAKING-CHANGE: ".
  // TODO

  // 4. Поверніть { type, scope (або null), breaking, subject (обрізаний) }.
}

// Спробуйте в консолі:
// parseConventionalCommit('feat(auth)!: drop v1 tokens');
// parseConventionalCommit('Added stuff'); // null
`,
      solution: `function parseConventionalCommit(message) {
  if (typeof message !== 'string') return null;
  const [header, ...rest] = message.split('\\n');
  //            type      (scope)?              !?    ": " subject
  const m = /^([a-z]+)(?:\\(([^()\\s]+)\\))?(!)?: (.*\\S.*)$/.exec(header);
  if (!m) return null;
  const [, type, scope = null, bang, subject] = m;
  const breaking = Boolean(bang) || rest.some((line) => /^BREAKING[ -]CHANGE: /.test(line));
  return { type, scope, breaking, subject: subject.trim() };
}
`,
      hints: [
        'Розділіть повідомлення на рядки: header — перший рядок, решта — тіло та футери. Увесь формат header описується одним регулярним виразом.',
        'Регулярка по частинах: `^([a-z]+)` — type, `(?:\\(([^()\\s]+)\\))?` — необов\'язковий scope, `(!)?` — маркер, `: (.*\\S.*)$` — subject хоча б з одним непробільним символом.',
        'Breaking = `Boolean(bang) || rest.some((line) => /^BREAKING[ -]CHANGE: /.test(line))`. Відсутня група в деструктуризації дає `undefined` — `const [, type, scope = null, bang, subject] = m`.'
      ],
      tests: [
        { name: 'простий коміт без scope', code: "expect(parseConventionalCommit('feat: add login')).toEqual({ type: 'feat', scope: null, breaking: false, subject: 'add login' });" },
        { name: 'коміт зі scope', code: "expect(parseConventionalCommit('fix(api): handle 404')).toEqual({ type: 'fix', scope: 'api', breaking: false, subject: 'handle 404' });" },
        { name: '! у header → breaking', code: "expect(parseConventionalCommit('feat(auth)!: drop v1 tokens')).toEqual({ type: 'feat', scope: 'auth', breaking: true, subject: 'drop v1 tokens' });\nexpect(parseConventionalCommit('refactor!: new api').breaking).toBe(true);" },
        { name: 'BREAKING CHANGE у футері → breaking', code: "const r = parseConventionalCommit('refactor(core): rename init\\n\\nBREAKING CHANGE: init() is now start()');\nexpect(r).toEqual({ type: 'refactor', scope: 'core', breaking: true, subject: 'rename init' });\nexpect(parseConventionalCommit('fix: x\\n\\nBREAKING-CHANGE: y').breaking).toBe(true);" },
        { name: 'тіло без BREAKING CHANGE не робить коміт breaking', code: "expect(parseConventionalCommit('docs: readme\\n\\nMentions breaking change in text').breaking).toBe(false);" },
        { name: 'невалідні повідомлення → null', code: "expect(parseConventionalCommit('Added stuff')).toBeNull();\nexpect(parseConventionalCommit('feat:no space')).toBeNull();\nexpect(parseConventionalCommit('feat(): empty scope')).toBeNull();\nexpect(parseConventionalCommit('Feat: capital')).toBeNull();\nexpect(parseConventionalCommit('feat: ')).toBeNull();\nexpect(parseConventionalCommit('')).toBeNull();" },
        { name: 'subject обрізається по краях', code: "expect(parseConventionalCommit('chore: bump deps  ').subject).toBe('bump deps');" }
      ],
      explanation: `
**Чому працює:** header описується однією регуляркою — \`^([a-z]+)\` type, \`(?:\\(([^()\\s]+)\\))?\` scope, \`(!)?\` маркер, \`: (.*\\S.*)$\` непорожній subject. Тіло перевіряється построково з \`^\`, тож згадка «breaking change» у тексті не спрацьовує.

**Складність:** O(n) від довжини повідомлення.

**Типові помилки:** забути футер \`BREAKING CHANGE\`; приймати \`feat:no space\`; повертати \`undefined\` замість \`null\` для scope; шукати маркер через \`includes\` по всьому тексту.

**Що спитають далі:** як за списком комітів визначити наступну версію (задача в кроці semver)? Як commitlint блокує коміт з невалідним повідомленням (хук \`commit-msg\`)?
`
    },
    // ---------------------------------------------------------------- Крок 3. package.json і semver
    {
      id: 'tool-package-json',
      group: 'npm-semver',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'package.json: поля та типи залежностей',
      tags: ['npm'],
      question: 'Які ключові поля package.json ви знаєте? Чим відрізняються dependencies, devDependencies, peerDependencies і optionalDependencies?',
      choices: [
        '`devDependencies` бібліотеки встановлюються і в проєкті споживача, просто не потрапляють у його бандл',
        '`peerDependencies` має надати сам застосунок-хост, щоб у ньому не опинилось двох копій, наприклад `react`',
        '`optionalDependencies` ставляться лише вручну через `npm install --include=optional`, інакше npm їх пропускає',
        'Поле `exports` лише дублює `main` для ESM і ніяк не обмежує, які внутрішні шляхи пакета можна імпортувати',
        '`engines` гарантує, що пакет не встановиться на іншій версії Node: npm у такому разі завжди падає з помилкою',
      ],
      correct: 1,
      why: [
        'Хибно: devDependencies бібліотеки споживачу не встановлюються взагалі — вони потрібні лише для розробки самої бібліотеки.',
        'Правильно: peer-залежність надає хост, тож у застосунку одна копія react; npm 7+ ставить peer-залежності автоматично.',
        'Хибно: optionalDependencies ставляться за замовчуванням, просто збій їх встановлення не валить `npm install`.',
        'Хибно: `exports` інкапсулює пакет — шлях поза мапою дає `ERR_PACKAGE_PATH_NOT_EXPORTED`.',
        'Хибно: за замовчуванням npm лише попереджає; помилка буде тільки з `engine-strict=true`.'
      ],
      hint: 'Розділіть поля на «опис пакета», «точки входу», «скрипти/середовище» і «залежності».',
      answer: `
**Точки входу:** \`main\` (CommonJS, історичне), \`module\` (неофіційне, ESM для бандлерів), **\`exports\`** — сучасна мапа з умовами (\`types\`/\`import\`/\`require\`/\`default\`) та інкапсуляцією; \`type: "module"\` робить \`.js\` ESM; \`types\`, \`files\`, \`bin\`.

\`\`\`json
{
  "name": "my-lib",
  "version": "1.4.0",
  "type": "module",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js", "require": "./dist/index.cjs" }
  },
  "sideEffects": false,
  "scripts": { "dev": "vite", "build": "vite build", "test": "vitest", "prepare": "husky" },
  "engines": { "node": ">=22" },
  "packageManager": "pnpm@10.12.1"
}
\`\`\`

**Скрипти і середовище:** \`scripts\` (\`npm run x\`, бінарники з \`node_modules/.bin\` доступні без шляху), \`engines\` (попередження або помилка з \`engine-strict\`), \`private: true\` (захист від публікації), \`packageManager\` (яким менеджером і версією працює проєкт).

**Залежності:**
| Поле | Коли | У споживача? |
|---|---|---|
| \`dependencies\` | рантайм (axios, date-fns) | так |
| \`devDependencies\` | збірка/тести (vite, eslint, vitest) | ні |
| \`peerDependencies\` | надає хост (react для UI-кіту, плагін eslint) | npm 7+ ставить сам, конфлікт → помилка |
| \`optionalDependencies\` | збій не критичний (нативні бінарники) | так, якщо вдалося |

**Нюанс:** у застосунку, що бандлиться, різниця dependencies/devDependencies майже косметична; для бібліотек і Node-сервісів (\`npm ci --omit=dev\`) — суттєва.
`,
      keyPoints: [
        'main / module / exports (умовні експорти + інкапсуляція) / type / types',
        'scripts, engines, private, files, sideEffects',
        'dependencies — рантайм, devDependencies — розробка і збірка',
        'peerDependencies — надає хост, щоб уникнути дублікатів (react, плагіни)',
        'optionalDependencies — збій встановлення не критичний'
      ],
      followUps: ['Що станеться, якщо імпортувати шлях, якого немає в exports?', 'Навіщо скрипт prepare?', 'Як вказати peerDependency, який не обов\'язковий (peerDependenciesMeta)?']
    },
    {
      id: 'tool-quiz-peer-deps',
      group: 'npm-semver',
      type: 'quiz',
      level: 2,
      title: 'Як оголосити react у UI-бібліотеці',
      tags: ['npm'],
      question: 'Ви публікуєте npm-бібліотеку React-компонентів. Як правильно оголосити залежність від `react`?',
      options: [
        'У `dependencies` — бібліотека ж без React не працює',
        'У `peerDependencies` (з широким діапазоном, напр. `^18 || ^19`) і в `devDependencies` для локальної розробки й тестів',
        'Лише в `devDependencies` — застосунок і так має React',
        'В `optionalDependencies`, щоб не було конфліктів версій'
      ],
      answer: 1,
      why: [
        'Бібліотека може притягнути власну копію React → дві копії в застосунку і помилка `Invalid hook call`.',
        'Правильно: хост надає єдиний React, менеджер пакетів перевіряє сумісність, а devDependencies — для власних тестів і Storybook.',
        'Вимога стає неявною: споживач не отримає жодного попередження про несумісну версію React.',
        'optionalDependencies — для пакетів, збій встановлення яких некритичний (нативні бінарники); React не такий.'
      ],
      hint: 'Скільки копій React опиниться в застосунку, якщо кожна бібліотека принесе свою?',
      explanation: `
React має бути **одним екземпляром** у застосунку: дві копії ламають хуки й контексти. \`peerDependencies\` каже: «я працюю з React цих версій, але надає його хост». npm 7+ і pnpm перевіряють сумісність і попереджають (або падають) при конфлікті.

Те саме правило для плагінів: \`eslint-plugin-*\` оголошує \`eslint\` як peer, плагін Vite — \`vite\`.
`
    },
    {
      id: 'tool-quiz-semver-caret',
      group: 'npm-semver',
      type: 'quiz',
      level: 1,
      interview: true,
      title: 'Які версії підходять під ^1.4.2?',
      tags: ['npm', 'semver'],
      question: 'Оберіть **усі** версії, які задовольняють діапазон `^1.4.2`:',
      options: ['`1.4.1`', '`1.4.2`', '`1.4.9`', '`1.9.0`', '`2.0.0`', '`1.5.0-beta.1`'],
      answer: [1, 2, 3],
      why: [
        'Менша за нижню межу `1.4.2`.',
        'Правильно: нижня межа входить у діапазон.',
        'Правильно: patch-оновлення в межах `<2.0.0`.',
        'Правильно: minor-оновлення каретка дозволяє — за semver вони зворотно сумісні.',
        'Новий major може ламати API, тому `^` його відсікає.',
        'Пре-реліз підходить, лише якщо в діапазоні є пре-реліз того самого `1.5.0` — захист від нестабільних версій.'
      ],
      hint: 'Карет (^) дозволяє все, що не змінює крайню ліву ненульову цифру. А як щодо пре-релізів?',
      explanation: `
\`^1.4.2\` = \`>=1.4.2 <2.0.0\` — дозволені minor і patch.

Для порівняння: \`~1.4.2\` = \`>=1.4.2 <1.5.0\` (лише patch). Пре-релізи (\`-beta.1\`) npm підставляє лише тоді, коли пре-реліз з тим самим \`X.Y.Z\` явно вказано в діапазоні (\`^1.5.0-beta.0\`).
`
    },
    {
      id: 'tool-quiz-semver-zero',
      group: 'npm-semver',
      type: 'quiz',
      level: 3,
      title: 'Каретка для 0.x версій',
      tags: ['npm', 'semver'],
      question: 'Що означає діапазон `^0.2.3` у npm?',
      options: [
        '`>=0.2.3 <1.0.0`',
        '`>=0.2.3 <0.3.0`',
        '`>=0.2.3 <0.2.4`',
        'Лише точно `0.2.3`'
      ],
      answer: 1,
      why: [
        'Так було б, якби `^` завжди фіксував major; для 0.x він фіксує першу ненульову частину — minor.',
        'Правильно: перша ненульова частина — `2`, тому дозволені лише `0.2.x` від `0.2.3`.',
        'Так поводиться `^0.0.3` — коли ненульовою є лише patch-частина.',
        'Точну версію задає запис без префікса: `0.2.3` або `=0.2.3`.'
      ],
      hint: 'Карет «фіксує» крайню ліву **ненульову** частину версії.',
      explanation: `
У \`0.x\` API вважається нестабільним — будь-який minor може ламати сумісність. Тому \`^\` фіксує першу ненульову частину:

| Діапазон | Означає |
|---|---|
| \`^1.2.3\` | \`>=1.2.3 <2.0.0\` |
| \`^0.2.3\` | \`>=0.2.3 <0.3.0\` (як \`~\`) |
| \`^0.0.3\` | \`>=0.0.3 <0.0.4\` |
`
    },
    {
      id: 'tool-compare-semver',
      group: 'npm-semver',
      type: 'code',
      level: 2,
      title: 'compareSemver: порівняння версій',
      tags: ['npm', 'semver', 'strings'],
      description: `
**Завдання.** Напишіть функцію-компаратор для двох версій у форматі semver, яку можна передати в \`sort\`.

**Де трапляється:** класика співбесід («порівняйте дві версії»); у роботі — показати «доступне оновлення», відсортувати релізи, перевірити мінімальну версію застосунку/API.

**Що написати**
- \`compareSemver(a, b)\` → \`-1\`, якщо \`a < b\`; \`1\`, якщо \`a > b\`; \`0\`, якщо рівні.

Формат: \`MAJOR.MINOR.PATCH[-prerelease][+build]\`, можливий префікс \`v\`. Правила semver:
1. \`MAJOR\`, \`MINOR\`, \`PATCH\` порівнюються **як числа**.
2. Build-метадані (\`+...\`) **ігноруються**.
3. Версія з пре-релізом **менша** за ту саму без нього: \`1.0.0-rc.1 < 1.0.0\`.
4. Пре-релізи — по ідентифікаторах через \`.\` зліва направо: числові — як числа, буквені — як рядки, числовий **менший** за буквений; якщо спільні рівні — менша та, де ідентифікаторів менше.

**Приклад**
\`\`\`js
compareSemver('1.10.0', '1.9.9');               // 1  (не рядкове порівняння!)
compareSemver('v2.0.0', '2.0.0+build.7');       // 0
compareSemver('1.0.0-alpha', '1.0.0');          // -1
compareSemver('1.0.0-beta.11', '1.0.0-beta.2'); // 1
['1.0.0', '1.0.0-rc.1', '0.9.0'].sort(compareSemver); // ['0.9.0', '1.0.0-rc.1', '1.0.0']
\`\`\`

**Як це працює:** рядки порівнюються посимвольно (\`'1.10' < '1.9'\`, бо \`'1' < '9'\`), тому версію треба розібрати на числа. Спочатку нормалізуємо (без \`v\` і \`+build\`), відділяємо пре-реліз по **першому** дефісу, порівнюємо три числа, а при рівності — пре-релізи за правилами специфікації.

**Врахуйте:**
- пре-реліз сам може містити дефіс: \`1.0.0-rc-1\`;
- \`beta.11 > beta.2\` (числові ідентифікатори — як числа);
- \`alpha < alpha.1\` (коротший список менший).
`,
      starter: `// Розбирає 'v1.2.3-beta.1+build' -> { nums: [1, 2, 3], pre: ['beta', '1'] }
function parseVersion(v) {
  // 1. Приберіть префікс 'v' і все після '+' (build-метадані ігноруються).
  // 2. Пре-реліз — усе після ПЕРШОГО '-'; core — частина до нього.
  // TODO
}

// Порівнює два ідентифікатори пре-релізу -> -1 | 0 | 1
function compareIdentifiers(x, y) {
  // 3. Обидва числові (/^\\d+$/) -> порівняти як числа;
  //    лише один числовий -> він менший; інакше — як рядки.
  // TODO
}

function compareSemver(a, b) {
  // 4. Порівняйте MAJOR, MINOR, PATCH як ЧИСЛА.
  // 5. Рівні? Пре-релізів немає -> 0; пре-реліз лише в одного -> той менший.
  // 6. Інакше — попарно compareIdentifiers; якщо список закінчився — він менший.
  // TODO
}

// Спробуйте в консолі:
// compareSemver('1.10.0', '1.9.9'); // 1
// ['1.0.0', '1.0.0-rc.1', '1.0.0-alpha'].sort(compareSemver);
`,
      solution: `function parseVersion(v) {
  const clean = v.trim().replace(/^v/, '').split('+')[0]; // build-метадані ігноруємо
  const dash = clean.indexOf('-'); // пре-реліз може сам містити "-", тому лише перший
  const core = dash === -1 ? clean : clean.slice(0, dash);
  const pre = dash === -1 ? [] : clean.slice(dash + 1).split('.');
  return { nums: core.split('.').map(Number), pre };
}

function compareIdentifiers(x, y) {
  const xNum = /^\\d+$/.test(x);
  const yNum = /^\\d+$/.test(y);
  if (xNum && yNum) return Math.sign(Number(x) - Number(y));
  if (xNum) return -1; // числовий < буквений
  if (yNum) return 1;
  return x < y ? -1 : x > y ? 1 : 0;
}

function compareSemver(a, b) {
  const A = parseVersion(a);
  const B = parseVersion(b);
  for (let i = 0; i < 3; i++) {
    if (A.nums[i] !== B.nums[i]) return A.nums[i] > B.nums[i] ? 1 : -1;
  }
  if (!A.pre.length && !B.pre.length) return 0;
  if (!A.pre.length) return 1; // реліз > пре-реліз
  if (!B.pre.length) return -1;
  const len = Math.max(A.pre.length, B.pre.length);
  for (let i = 0; i < len; i++) {
    if (A.pre[i] === undefined) return -1; // коротший набір менший
    if (B.pre[i] === undefined) return 1;
    const c = compareIdentifiers(A.pre[i], B.pre[i]);
    if (c !== 0) return c;
  }
  return 0;
}
`,
      hints: [
        'Головна пастка — рядкове порівняння: `"1.10.0" < "1.9.0"`. Розбийте core на частини через `split(\'.\').map(Number)` і порівнюйте числа.',
        'Нормалізація: `replace(/^v/, \'\')`, `split(\'+\')[0]`, далі `indexOf(\'-\')` — усе після першого дефіса є пре-релізом (`split(\'.\')` на ідентифікатори).',
        'Пре-релізи: обидва відсутні → 0; відсутній лише в одного → він більший. Далі попарно: `/^\\d+$/` — числовий; якщо `A.pre[i] === undefined` → `-1`.'
      ],
      tests: [
        { name: 'порівнює major/minor/patch', code: "expect(compareSemver('1.2.3', '1.2.4')).toBe(-1);\nexpect(compareSemver('2.0.0', '1.9.9')).toBe(1);\nexpect(compareSemver('1.2.3', '1.2.3')).toBe(0);" },
        { name: 'числове, а не рядкове порівняння', code: "expect(compareSemver('1.10.0', '1.9.9')).toBe(1);\nexpect(compareSemver('1.2.10', '1.2.9')).toBe(1);\nexpect(compareSemver('10.0.0', '9.0.0')).toBe(1);" },
        { name: 'префікс v і build-метадані ігноруються', code: "expect(compareSemver('v1.2.3', '1.2.3')).toBe(0);\nexpect(compareSemver('1.0.0+build.1', '1.0.0+build.9')).toBe(0);" },
        { name: 'пре-реліз менший за реліз', code: "expect(compareSemver('1.0.0-alpha', '1.0.0')).toBe(-1);\nexpect(compareSemver('1.0.0', '1.0.0-rc.1')).toBe(1);\nexpect(compareSemver('1.0.1-alpha', '1.0.0')).toBe(1);" },
        { name: 'порядок пре-релізів зі специфікації semver', code: "const ordered = ['1.0.0-alpha', '1.0.0-alpha.1', '1.0.0-alpha.beta', '1.0.0-beta', '1.0.0-beta.2', '1.0.0-beta.11', '1.0.0-rc.1', '1.0.0'];\nconst shuffled = [ordered[5], ordered[7], ordered[0], ordered[3], ordered[6], ordered[1], ordered[4], ordered[2]];\nexpect(shuffled.sort(compareSemver)).toEqual(ordered);" },
        { name: 'пре-реліз з дефісом усередині', code: "expect(compareSemver('1.0.0-rc-1', '1.0.0-rc-2')).toBe(-1);\nexpect(compareSemver('1.0.0-rc-1', '1.0.0-rc-1')).toBe(0);" }
      ],
      explanation: `
**Чому працює:** після нормалізації версія — це три числа + список ідентифікаторів пре-релізу; порівнюємо їх по черзі за правилами специфікації. Функція повертає -1/0/1, тому підходить для \`sort\`.

**Складність:** O(n) від довжини рядків.

**Типові помилки:** рядкове порівняння або \`parseFloat('1.10')\`; забути, що \`1.0.0-rc.1 < 1.0.0\`; порівнювати \`beta.11\` і \`beta.2\` як рядки; різати пре-реліз по останньому дефісу.

**У реальних проєктах** — пакет \`semver\` (\`semver.compare\`, \`semver.satisfies\`), його використовує сам npm.

**Що спитають далі:** як перевірити, чи версія підходить під \`^1.2.3\` (наступна задача)? Чому build-метадані не впливають на порядок?
`
    },
    {
      id: 'tool-satisfies-range',
      group: 'npm-semver',
      type: 'code',
      level: 3,
      title: 'satisfies(version, range): ^, ~, точна версія',
      tags: ['npm', 'semver'],
      description: `
**Завдання.** Перевірте, чи версія пакета підходить під діапазон з package.json — спрощений \`semver.satisfies\`.

**Де трапляється:** так npm обирає, яку версію поставити для \`"axios": "^1.7.0"\`; так Renovate/Dependabot вирішують, чи потрібен PR з оновленням. На співбесіді — «що саме дозволяють \`^\` і \`~\`».

**Що написати**
- \`satisfies(version, range)\` → \`true\` / \`false\`.

Версії — \`X.Y.Z\` (без пре-релізів), можливий префікс \`v\`. Діапазони:
| Діапазон | Означає |
|---|---|
| \`1.2.3\` або \`=1.2.3\` | рівно ця версія |
| \`^1.2.3\` | \`>=1.2.3 <2.0.0\` |
| \`^0.2.3\` | \`>=0.2.3 <0.3.0\` |
| \`^0.0.3\` | \`>=0.0.3 <0.0.4\` |
| \`~1.2.3\` | \`>=1.2.3 <1.3.0\` |
| \`*\` | будь-яка версія |
| \`A \\|\\| B\` | підходить під A **або** B (пробіли навколо \`\\|\\|\` довільні) |

**Приклад**
\`\`\`js
satisfies('1.9.0', '^1.2.3');           // true
satisfies('2.0.0', '^1.2.3');           // false
satisfies('0.3.0', '^0.2.3');           // false
satisfies('1.2.10', '~1.2.3');          // true
satisfies('3.1.0', '^1.0.0 || ^3.0.0'); // true
\`\`\`

**Як це працює:** будь-який діапазон з \`^\`/\`~\` — це пара меж \`[lower, upper)\`. Нижня — версія з діапазону. Верхня для \`~X.Y.Z\` — \`X.(Y+1).0\`; для \`^\` — збільшуємо крайню ліву **ненульову** частину й обнуляємо праві. Версії порівнюємо як масиви чисел; \`||\` — це \`some\` по частинах.

**Врахуйте:**
- верхня межа **не** входить (\`2.0.0\` не підходить під \`^1.2.3\`);
- \`1.10.0\` > \`1.9.0\` — числове порівняння;
- префікси \`v\` у версії та \`=\` у діапазоні.
`,
      starter: `// '=v1.2.3' -> [1, 2, 3]
function toTuple(v) {
  // 1. Приберіть пробіли та префікси '=' / 'v', розбийте по '.' на ЧИСЛА.
  // TODO
}

// Порівняння двох кортежів [major, minor, patch] -> -1 | 0 | 1
function cmp(a, b) {
  // TODO
}

// Перевірка одного діапазону без '||'
function satisfiesOne(v, range) {
  // 2. '*' -> true.
  // 3. Без ^/~ -> точна рівність.
  // 4. Обчисліть верхню межу:
  //    ~X.Y.Z -> [X, Y+1, 0]
  //    ^ -> збільшити крайню ліву НЕНУЛЬОВУ частину, праві обнулити
  // 5. return v >= base && v < upper (через cmp)
  // TODO
}

function satisfies(version, range) {
  // 6. Розбийте range по '||' і перевірте, чи підходить хоча б одна частина.
  // TODO
}

// Спробуйте в консолі:
// satisfies('1.9.0', '^1.2.3'); // true
// satisfies('0.3.0', '^0.2.3'); // false
`,
      solution: `function toTuple(v) {
  return v.trim().replace(/^[=v]+/, '').split('.').map(Number);
}

function cmp(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
  }
  return 0;
}

function satisfiesOne(v, range) {
  if (range === '*' || range === '') return true;
  const op = range[0] === '^' || range[0] === '~' ? range[0] : '';
  const base = toTuple(op ? range.slice(1) : range);
  if (!op) return cmp(v, base) === 0;

  const [major, minor, patch] = base;
  let upper;
  if (op === '~') upper = [major, minor + 1, 0];
  else if (major > 0) upper = [major + 1, 0, 0];   // ^ фіксує крайню ліву ненульову частину
  else if (minor > 0) upper = [0, minor + 1, 0];
  else upper = [0, 0, patch + 1];

  return cmp(v, base) >= 0 && cmp(v, upper) < 0;
}

function satisfies(version, range) {
  const v = toTuple(version);
  return range.split('||').some((part) => satisfiesOne(v, part.trim()));
}
`,
      hints: [
        'Будь-який діапазон зводиться до пари меж: `>= нижня` і `< верхня`. Нижня — сама версія з діапазону; для точної версії достатньо `cmp(v, base) === 0`.',
        'Верхня межа: `~X.Y.Z` → `[X, Y + 1, 0]`; `^` → `major > 0 ? [major + 1, 0, 0] : minor > 0 ? [0, minor + 1, 0] : [0, 0, patch + 1]`.',
        'Порівнюйте масиви чисел циклом по трьох індексах (не рядки!). Для `||`: `range.split(\'||\').some((part) => satisfiesOne(v, part.trim()))`.'
      ],
      tests: [
        { name: 'точна версія', code: "expect(satisfies('1.2.3', '1.2.3')).toBe(true);\nexpect(satisfies('1.2.4', '1.2.3')).toBe(false);\nexpect(satisfies('1.2.3', '=1.2.3')).toBe(true);\nexpect(satisfies('v1.2.3', '1.2.3')).toBe(true);" },
        { name: '^ для major > 0', code: "expect(satisfies('1.2.3', '^1.2.3')).toBe(true);\nexpect(satisfies('1.9.0', '^1.2.3')).toBe(true);\nexpect(satisfies('1.2.2', '^1.2.3')).toBe(false);\nexpect(satisfies('2.0.0', '^1.2.3')).toBe(false);" },
        { name: '^ для 0.x і 0.0.x', code: "expect(satisfies('0.2.9', '^0.2.3')).toBe(true);\nexpect(satisfies('0.3.0', '^0.2.3')).toBe(false);\nexpect(satisfies('0.0.3', '^0.0.3')).toBe(true);\nexpect(satisfies('0.0.4', '^0.0.3')).toBe(false);" },
        { name: '~ дозволяє лише patch', code: "expect(satisfies('1.2.9', '~1.2.3')).toBe(true);\nexpect(satisfies('1.3.0', '~1.2.3')).toBe(false);\nexpect(satisfies('1.2.0', '~1.2.3')).toBe(false);\nexpect(satisfies('0.2.5', '~0.2.3')).toBe(true);" },
        { name: 'числове порівняння частин', code: "expect(satisfies('1.10.0', '^1.2.3')).toBe(true);\nexpect(satisfies('1.2.10', '~1.2.3')).toBe(true);\nexpect(satisfies('1.10.0', '~1.9.0')).toBe(false);" },
        { name: '* і об\'єднання через ||', code: "expect(satisfies('7.8.9', '*')).toBe(true);\nexpect(satisfies('3.1.0', '^1.0.0 || ^3.0.0')).toBe(true);\nexpect(satisfies('2.5.0', '^1.0.0 || ^3.0.0')).toBe(false);\nexpect(satisfies('1.0.0', '~1.0.0||2.0.0')).toBe(true);" }
      ],
      explanation: `
**Чому працює:** діапазон = пара меж \`[lower, upper)\`. Для \`^\` верхня межа — збільшення крайньої лівої ненульової частини: так semver відображає, що в \`0.x\` кожен minor може ламати API.

**Складність:** O(k) від довжини діапазону.

**Типові помилки:** рядкове порівняння версій; вважати, що \`^0.2.3\` дозволяє \`0.9.0\`; включати верхню межу.

**У справжньому semver є ще:** часткові версії (\`^1.2\`, \`1.x\`), \`>=\`/\`<\`, діапазони через дефіс, пре-релізи.

**Що спитають далі:** чому npm за замовчуванням пише \`^\`, а не точну версію, і як lock-файл робить це безпечним? Коли фіксувати точну версію (\`save-exact\`)?
`
    },
    {
      id: 'tool-bump-version',
      group: 'npm-semver',
      type: 'code',
      level: 3,
      title: 'Наступна версія за conventional commits',
      tags: ['npm', 'semver', 'git'],
      description: `
**Завдання.** За поточною версією і списком комітів з моменту минулого релізу визначте наступну версію — як це роблять semantic-release і release-please.

**Де трапляється:** автоматичні релізи бібліотек і застосунків у CI: розробник пише \`feat:\` / \`fix:\`, а версія і CHANGELOG рахуються самі. Поєднує два попередні кроки — conventional commits і semver.

**Що написати**
- \`bumpVersion(current, commits)\` → рядок нової версії \`'X.Y.Z'\`.
  - \`current\` — версія \`X.Y.Z\`; \`commits\` — масив повідомлень комітів.

Правила:
- breaking change (\`!\` у header або рядок \`BREAKING CHANGE: \` / \`BREAKING-CHANGE: \` у тілі) → **major**;
- \`feat\` → **minor**; \`fix\` або \`perf\` → **patch**;
- інші типи й повідомлення не за форматом \`type(scope)!: subject\` — не впливають;
- перемагає **найбільший** рівень серед усіх комітів, молодші частини обнуляються;
- нічого підіймати — повернути \`current\`;
- **поки major = 0**, breaking change підіймає лише **minor**.

**Приклад**
\`\`\`js
bumpVersion('1.2.3', ['fix: a', 'feat(ui): b', 'docs: c']); // '1.3.0'
bumpVersion('1.2.3', ['feat!: new api']);                   // '2.0.0'
bumpVersion('0.4.1', ['feat!: new api']);                   // '0.5.0'
bumpVersion('1.2.3', ['chore: deps']);                      // '1.2.3'
\`\`\`

**Як це працює:** задача ділиться на дві: класифікувати кожен коміт (\`none\` / \`patch\` / \`minor\` / \`major\`) і взяти максимум. Рівні зручно порівнювати через числовий ранг. Реліз один, тож два \`feat\` дають \`+1\` до minor, а не \`+2\`.

**Врахуйте:**
- \`1.9.9\` + feat → \`1.10.0\` (числа, не рядки);
- молодші частини обнуляються: \`1.2.3\` + feat → \`1.3.0\`;
- порожній масив комітів → \`current\`.
`,
      starter: `const RANK = { none: 0, patch: 1, minor: 2, major: 3 };

// Рівень релізу одного коміту: 'none' | 'patch' | 'minor' | 'major'
function releaseType(message) {
  // 1. header — перший рядок; розберіть його регуляркою type(scope)!: subject.
  //    Не збіглося -> 'none'.
  // 2. Breaking ("!" або рядок "BREAKING CHANGE: " / "BREAKING-CHANGE: " у тілі) -> 'major'.
  // 3. feat -> 'minor'; fix або perf -> 'patch'; інше -> 'none'.
  // TODO
  return 'none';
}

function bumpVersion(current, commits) {
  // 4. Розберіть current на числа [major, minor, patch].
  // 5. Знайдіть найвищий рівень серед усіх комітів (порівнюйте через RANK).
  // 6. Для 0.x: 'major' -> 'minor'.
  // 7. Збільште потрібну частину, молодші обнуліть; 'none' -> current.
  // TODO
  return current;
}

// Спробуйте в консолі:
// bumpVersion('1.2.3', ['fix: a', 'feat(ui): b']); // '1.3.0'
`,
      solution: `const RANK = { none: 0, patch: 1, minor: 2, major: 3 };

function releaseType(message) {
  const [header, ...body] = message.split('\\n');
  const m = /^([a-z]+)(?:\\([^()\\s]+\\))?(!)?: \\S/.exec(header);
  if (!m) return 'none';
  const breaking = Boolean(m[2]) || body.some((line) => /^BREAKING[ -]CHANGE: /.test(line));
  if (breaking) return 'major';
  if (m[1] === 'feat') return 'minor';
  if (m[1] === 'fix' || m[1] === 'perf') return 'patch';
  return 'none';
}

function bumpVersion(current, commits) {
  let [major, minor, patch] = current.split('.').map(Number);
  let level = 'none';
  for (const msg of commits) {
    const t = releaseType(msg);
    if (RANK[t] > RANK[level]) level = t;
    if (level === 'major') break; // вище вже не буде
  }
  if (level === 'major' && major === 0) level = 'minor'; // 0.x: breaking -> minor

  if (level === 'major') return \`\${major + 1}.0.0\`;
  if (level === 'minor') return \`\${major}.\${minor + 1}.0\`;
  if (level === 'patch') return \`\${major}.\${minor}.\${patch + 1}\`;
  return current;
}
`,
      hints: [
        'Розбийте задачу на дві: `releaseType(message)` для одного коміту і цикл, що тримає максимальний рівень за `RANK`.',
        'У `releaseType` breaking перевіряйте першим — він важливіший за тип. Регулярка header: `/^([a-z]+)(?:\\([^()\\s]+\\))?(!)?: \\S/`.',
        'Після циклу: `if (level === \'major\' && major === 0) level = \'minor\'`, далі шаблонний рядок, наприклад для minor — `` `${major}.${minor + 1}.0` ``.'
      ],
      tests: [
        { name: 'fix → patch, feat → minor', code: "expect(bumpVersion('1.2.3', ['fix: a'])).toBe('1.2.4');\nexpect(bumpVersion('1.2.3', ['feat: a'])).toBe('1.3.0');\nexpect(bumpVersion('1.2.3', ['perf(img): lazy'])).toBe('1.2.4');" },
        { name: 'breaking → major (! або футер)', code: "expect(bumpVersion('1.2.3', ['feat(api)!: v2'])).toBe('2.0.0');\nexpect(bumpVersion('1.2.3', ['refactor: x\\n\\nBREAKING CHANGE: removed y'])).toBe('2.0.0');" },
        { name: 'перемагає найбільший рівень', code: "expect(bumpVersion('1.2.3', ['fix: a', 'feat(ui): b', 'docs: c'])).toBe('1.3.0');\nexpect(bumpVersion('3.4.5', ['fix: a', 'chore!: drop node 16', 'feat: b'])).toBe('4.0.0');" },
        { name: 'нерелевантні коміти не змінюють версію', code: "expect(bumpVersion('1.2.3', ['docs: readme', 'chore: deps', 'Merge branch main', 'feature: not conventional'])).toBe('1.2.3');\nexpect(bumpVersion('1.2.3', [])).toBe('1.2.3');" },
        { name: '0.x: breaking піднімає лише minor', code: "expect(bumpVersion('0.4.1', ['feat!: new api'])).toBe('0.5.0');\nexpect(bumpVersion('0.4.1', ['fix: y'])).toBe('0.4.2');\nexpect(bumpVersion('0.4.1', ['feat: z'])).toBe('0.5.0');" },
        { name: 'числові частини, а не рядки', code: "expect(bumpVersion('1.9.9', ['feat: a'])).toBe('1.10.0');\nexpect(bumpVersion('9.0.0', ['x: y', 'fix!: z'])).toBe('10.0.0');" }
      ],
      explanation: `
**Чому працює:** класифікація кожного коміту + максимум за числовим рангом; реліз один, тому бампи не сумуються.

**Складність:** O(n · m), n — кількість комітів, m — довжина повідомлення.

**Типові помилки:** не обнулювати молодші частини (\`1.2.3 → 1.3.3\`); \`'1' + 1 = '11'\`; забути футер \`BREAKING CHANGE\`; сумувати бампи.

**У реальному світі:** semantic-release (повністю автоматичний реліз із CI), release-please (відкриває «release PR»), changesets (розробник явно описує зміну у файлі — зручно в монорепо).

**Що спитають далі:** як генерувати CHANGELOG з тих самих комітів? Як версіонувати пакети монорепо незалежно?
`
    },
    // ---------------------------------------------------------------- Крок 4. Lock-файли, менеджери, монорепо
    {
      id: 'tool-lockfiles',
      group: 'deps-install',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Lock-файли, npm ci vs npm install, npx',
      tags: ['npm'],
      question: 'Навіщо потрібен package-lock.json (yarn.lock, pnpm-lock.yaml)? Чи треба його комітити? Чим npm ci відрізняється від npm install? Що робить npx? Оберіть **усі** правильні твердження.',
      choices: [
        '`npm ci` ставить рівно те, що в lock-файлі, падає при розсинхроні з package.json і ніколи не змінює lock',
        'Lock-файл краще додати в `.gitignore`: кожен розробник має отримувати найсвіжіші версії в межах діапазонів',
        'Lock-файл опублікованої бібліотеки потрапляє до споживачів і фіксує для них точне дерево залежностей',
        'Lock-файл фіксує точні версії й транзитивних залежностей разом із `resolved` і хешем `integrity`',
        '`npx` завжди завантажує пакет з реєстру заново, навіть якщо він уже є в локальному `node_modules/.bin`',
      ],
      correct: [0, 3],
      why: [
        'Правильно: `npm ci` — детерміноване встановлення для CI; розсинхрон — помилка, lock не змінюється.',
        'Хибно: без lock-файлу дерева різняться між машинами й CI («у мене працює»); оновлюють явно — через Renovate/Dependabot.',
        'Хибно: lock бібліотеки споживачам не потрапляє — вони резолвлять діапазони з її package.json самі.',
        'Правильно: lock фіксує все дерево, а `integrity` захищає від підміни вмісту пакета.',
        'Хибно: npx спершу шукає бінарник у локальному `node_modules/.bin` і лише потім тимчасово завантажує пакет.'
      ],
      hint: 'package.json містить діапазони. Що станеться, якщо між двома встановленнями вийде нова patch-версія транзитивної залежності?',
      answer: `
**Проблема:** у package.json — діапазони (\`^4.17.0\`), а транзитивні залежності взагалі поза вашим контролем. Два \`npm install\` у різні дні дають різні дерева → «у мене працює, а в CI — ні».

**Lock-файл** фіксує точне дерево: версію кожного пакета, \`resolved\` (звідки) і \`integrity\` (хеш вмісту). Тому встановлення **відтворювані**, зміни залежностей видно в diff. **Комітимо завжди.**

| | \`npm install\` | \`npm ci\` |
|---|---|---|
| Для чого | розробка, додати пакет | CI, Docker |
| lock-файл | може оновити | **ніколи не змінює** |
| розсинхрон з package.json | виправляє | **помилка** |
| \`node_modules\` | доповнює | видаляє і ставить з нуля |

**Оновлення:** \`npm outdated\`, \`npm update\` (в межах діапазонів), \`npm install pkg@latest\`, \`npm audit\`; автоматизація — Renovate/Dependabot. Змінити транзитивну версію — \`overrides\` (npm) / \`pnpm.overrides\` / \`resolutions\` (yarn).

**\`npx\`** запускає бінарник: спершу з \`node_modules/.bin\`, інакше тимчасово завантажує (\`npx create-vite@latest\`). Аналоги — \`pnpm dlx\`, \`yarn dlx\`.

**Пастки:** не тримати lock-файли кількох менеджерів; конфлікт у lock не правлять руками — беруть одну сторону і перезапускають install.
`,
      keyPoints: [
        'package.json — діапазони, lock — точне дерево з resolved та integrity',
        'Відтворювані встановлення, видимість змін у diff — тому комітимо',
        'npm ci: чисте встановлення строго за lock, падає при розсинхроні, не змінює lock',
        'npm install може оновити lock; npm update/outdated/audit, overrides',
        'npx запускає бінарник з .bin або тимчасово завантажує пакет'
      ],
      followUps: ['Як вирішувати конфлікти в package-lock.json?', 'Чому lock-файл бібліотеки не впливає на її споживачів?', 'Як оновити вразливу транзитивну залежність, якщо батьківський пакет ще не оновився?']
    },
    {
      id: 'tool-quiz-npm-ci',
      group: 'deps-install',
      type: 'quiz',
      level: 2,
      title: 'Що робить npm ci?',
      tags: ['npm', 'ci'],
      question: 'Оберіть **усі** правильні твердження про `npm ci`:',
      options: [
        'Видаляє наявну `node_modules` і встановлює залежності строго за lock-файлом',
        'Оновлює lock-файл, якщо в реєстрі з\'явилися новіші версії в межах діапазонів',
        'Завершується помилкою, якщо `package.json` і lock-файл не узгоджені',
        'Можна додати нову залежність: `npm ci lodash`',
        'Без lock-файлу працює так само, як `npm install`'
      ],
      answer: [0, 2],
      why: [
        'Правильно: чисте встановлення з нуля, точно за lock-файлом.',
        '`npm ci` ніколи не змінює lock-файл — інакше зникла б детермінованість.',
        'Правильно: розсинхрон (наприклад, незакомічений оновлений lock) — помилка, а не тихе виправлення.',
        'Додавати пакети `npm ci` не вміє — для цього `npm install <pkg>`.',
        'Без lock-файлу `npm ci` завершується помилкою, а не перетворюється на install.'
      ],
      hint: 'Команда створена для CI, де головне — детермінованість. Чи може така команда щось змінювати чи вгадувати?',
      explanation: `
\`npm ci\` (clean install) — для CI і Docker: чисте, швидке й **детерміноване** встановлення за lock-файлом. Нічого не вгадує й нічого не змінює.

Аналоги: \`pnpm install --frozen-lockfile\` (у CI вмикається автоматично), \`yarn install --immutable\`.
`
    },
    {
      id: 'tool-package-managers',
      group: 'deps-install',
      type: 'theory',
      level: 3,
      title: 'node_modules, npm vs yarn vs pnpm, монорепо',
      tags: ['npm', 'monorepo'],
      question: 'Як Node/бандлер знаходить пакет у node_modules? Чим відрізняються npm, yarn і pnpm? Що таке phantom dependencies? Як організувати монорепо?',
      choices: [
        'pnpm робить плоский `node_modules` з агресивним hoisting, тому phantom dependencies у ньому трапляються найчастіше',
        'Node шукає пакет лише в `node_modules` кореня проєкту, а батьківські теки та вкладені `node_modules` не перевіряє',
        'Workspaces публікують локальні пакети в npm-реєстр, щоб інші пакети монорепо могли встановити їх звідти',
        'Phantom dependency — імпорт пакета, якого немає у вашому package.json, але який піднявся в корінь через hoisting',
        'Turborepo і Nx замінюють менеджер пакетів: вони самі встановлюють залежності замість npm чи pnpm',
      ],
      correct: 3,
      why: [
        'Навпаки: pnpm кладе в `node_modules` лише прямі залежності (symlinks на store), тож phantom dependencies у ньому неможливі.',
        'Хибно: резолв іде від теки файлу вгору по всіх батьківських `node_modules` аж до кореня диска.',
        'Хибно: workspaces лінкують локальні пакети symlink-ами, без жодної публікації.',
        'Правильно: такий імпорт працює випадково і зламається, коли пакет-власник змінить свої залежності.',
        'Хибно: Turborepo і Nx — оркестратори задач (порядок, паралельність, кеш); встановлює залежності npm/pnpm/yarn.'
      ],
      hint: 'Подумайте про «плоский» node_modules (hoisting) і про те, до чого він дає доступ коду.',
      answer: `
**Резолв** \`import 'lodash'\` з \`/app/src/utils/a.js\`: \`node_modules/lodash\` у поточній теці, потім у кожній батьківській аж до кореня. У пакеті читається \`exports\` (з умовами), інакше \`module\`/\`main\`, інакше \`index.js\`.

**npm і yarn classic** — плоский \`node_modules\` (**hoisting**):
- **phantom dependencies** — можна імпортувати пакет, якого немає у вашому package.json;
- **doppelgangers** — різні версії одного пакета все одно дублюються глибше.

**pnpm** — кожна версія пакета **один раз на диску** в content-addressable store (hard links); у \`node_modules\` — лише прямі залежності (symlinks на \`.pnpm/\`). Швидко, економно, **строго**. pnpm 10 за замовчуванням не запускає install-скрипти залежностей (дозвіл — \`onlyBuiltDependencies\`), є \`minimumReleaseAge\` — не ставити щойно опубліковані версії (захист від supply-chain атак).

**Yarn Berry** — Plug'n'Play без \`node_modules\` (або \`nodeLinker: node-modules\`).

**Версія менеджера:** поле \`packageManager\` у package.json. Corepack, що читав його, з Node 25 більше не постачається з Node — менеджер ставлять окремо.

**Монорепо:**
- **workspaces** — одне встановлення, локальні пакети лінкуються (\`"@acme/ui": "workspace:*"\`);
- **Turborepo / Nx** — граф задач, порядок і паралельність, кеш (локальний і remote), «affected»-збірки;
- **changesets** — версіонування і публікація.
`,
      keyPoints: [
        'Резолв: пошук node_modules вгору по теках + exports/module/main',
        'Hoisting у npm/yarn classic → phantom dependencies і doppelgangers',
        'pnpm: content-addressable store, hard links + symlinks, строгий доступ',
        'Workspaces: локальні пакети лінкуються, одне встановлення',
        'Turborepo/Nx: граф задач, паралельність, кешування'
      ],
      followUps: ['Чому після переходу на pnpm може «зламатися» імпорт, який раніше працював?', 'Як Turborepo вирішує, що задачу можна взяти з кешу?', 'Монорепо vs полірепо: коли що?']
    },
    {
      id: 'tool-build-order',
      group: 'deps-install',
      type: 'code',
      level: 3,
      title: 'Порядок збірки пакетів монорепо + пошук циклів',
      tags: ['monorepo', 'graphs'],
      description: `
**Завдання.** У монорепо пакети залежать один від одного. Визначте порядок збірки, у якому кожна залежність збирається **раніше** за пакет, що від неї залежить, і знайдіть циклічні залежності.

**Де трапляється:** так працюють \`pnpm -r build\`, Turborepo і Nx. Алгоритмічно це топологічне сортування — класика співбесід (порядок курсів, задач, імпортів).

**Що написати**
- \`buildOrder(graph)\` → масив імен пакетів у допустимому порядку збірки.
  - \`graph\` — об'єкт \`{ [packageName]: string[] }\`: список залежностей кожного пакета.
- Якщо є цикл — кинути \`Error\` з повідомленням \`'Circular dependency: '\` + шлях циклу через \`' -> '\`, наприклад \`Circular dependency: a -> b -> c -> a\`.

**Приклад**
\`\`\`js
buildOrder({ app: ['ui', 'utils', 'react'], ui: ['utils'], utils: [] });
// ['utils', 'ui', 'app']   ('react' — зовнішній, ігнорується)

buildOrder({ a: ['b'], b: ['a'] });
// Error: Circular dependency: a -> b -> a
\`\`\`

**Як це працює:** обхід у глибину (DFS) у **post-order**: пакет додається в результат лише **після** всіх своїх залежностей. Для пошуку циклу вузол має три стани: не відвіданий, «в процесі» (зараз на стеку рекурсії) і готовий. Зайшли у вузол «в процесі» — це цикл, а масив поточного шляху показує, який саме.

**Врахуйте:**
- залежності, яких немає серед ключів \`graph\` (з npm), ігноруються і в результат не потрапляють;
- кожен пакет — рівно один раз (ромб \`app → a, b → core\` — не цикл);
- залежність від самого себе — теж цикл: \`a -> a\`;
- порожній граф → \`[]\`.
`,
      starter: `function buildOrder(graph) {
  const VISITING = 1; // вузол зараз на стеку DFS
  const DONE = 2;     // вузол і всі його залежності вже в order
  const state = new Map(); // name -> VISITING | DONE
  const path = [];         // поточний шлях DFS — щоб показати цикл
  const order = [];        // результат

  function visit(name) {
    // 1. Уже DONE -> нічого не робити.
    // 2. VISITING -> цикл: шлях = path від першої появи name + сам name;
    //    throw new Error('Circular dependency: ' + шлях.join(' -> '))
    // 3. Позначити VISITING, додати name у path.
    // 4. Відвідати залежності, які Є в graph (Object.hasOwn), — зовнішні пропустити.
    // 5. Прибрати name з path, позначити DONE, додати в order (post-order).
    // TODO
  }

  // 6. Викличте visit для кожного пакета з Object.keys(graph).
  // TODO
  return order;
}

// Спробуйте в консолі:
// buildOrder({ app: ['ui', 'react'], ui: ['utils'], utils: [] }); // ['utils', 'ui', 'app']
`,
      solution: `function buildOrder(graph) {
  const VISITING = 1;
  const DONE = 2;
  const state = new Map();
  const path = []; // поточний шлях DFS — щоб показати цикл
  const order = [];

  function visit(name) {
    if (state.get(name) === DONE) return;
    if (state.get(name) === VISITING) {
      // повернулися у вузол, який ще "на стеку" — це цикл
      const cycle = path.slice(path.indexOf(name)).concat(name);
      throw new Error('Circular dependency: ' + cycle.join(' -> '));
    }
    state.set(name, VISITING);
    path.push(name);
    for (const dep of graph[name]) {
      if (Object.hasOwn(graph, dep)) visit(dep); // зовнішні пакети пропускаємо
    }
    path.pop();
    state.set(name, DONE);
    order.push(name); // post-order: пакет додається після всіх своїх залежностей
  }

  for (const name of Object.keys(graph)) visit(name);
  return order;
}
`,
      hints: [
        'Це топологічне сортування. DFS у post-order: спершу рекурсивно обробити всі залежності, і лише потім `order.push(name)`.',
        'Одного «visited» замало: ромб (дві дороги до `core`) — не цикл. Потрібен стан «в процесі»: потрапили в такий вузол — знайшли цикл.',
        'Шлях циклу: `path.slice(path.indexOf(name)).concat(name).join(\' -> \')`. Зовнішні залежності відсійте через `Object.hasOwn(graph, dep)`.'
      ],
      tests: [
        { name: 'залежності збираються раніше', code: "const g = { app: ['ui', 'utils'], ui: ['utils', 'tokens'], utils: [], tokens: [] };\nconst order = buildOrder(g);\nexpect(order.slice().sort()).toEqual(Object.keys(g).sort());\nfor (const [name, deps] of Object.entries(g)) {\n  for (const d of deps) expect(order.indexOf(d)).toBeLessThan(order.indexOf(name));\n}" },
        { name: 'простий ланцюжок', code: "expect(buildOrder({ app: ['ui'], ui: ['utils'], utils: [] })).toEqual(['utils', 'ui', 'app']);" },
        { name: 'зовнішні залежності ігноруються', code: "expect(buildOrder({ app: ['react', 'ui'], ui: ['react', 'clsx'] })).toEqual(['ui', 'app']);" },
        { name: 'ромб без дублікатів', code: "const order = buildOrder({ app: ['a', 'b'], a: ['core'], b: ['core'], core: [] });\nexpect(order).toHaveLength(4);\nexpect(order[0]).toBe('core');\nexpect(order[3]).toBe('app');" },
        { name: 'порожній граф', code: "expect(buildOrder({})).toEqual([]);" },
        { name: 'цикл з двох пакетів', code: "expect(() => buildOrder({ a: ['b'], b: ['a'] })).toThrow(/^Circular dependency: /);\ntry { buildOrder({ a: ['b'], b: ['a'] }); } catch (e) { expect(['Circular dependency: a -> b -> a', 'Circular dependency: b -> a -> b']).toContain(e.message); }" },
        { name: 'непрямий цикл показує шлях', code: "let msg = '';\ntry { buildOrder({ app: ['ui'], ui: ['forms'], forms: ['utils'], utils: ['ui'], other: [] }); } catch (e) { msg = e.message; }\nexpect(msg).toBe('Circular dependency: ui -> forms -> utils -> ui');" },
        { name: 'залежність від самого себе — теж цикл', code: "expect(() => buildOrder({ a: ['a'] })).toThrow('Circular dependency: a -> a');" },
        { name: 'великий граф обробляється швидко', code: "const g = {};\nfor (let i = 0; i < 3000; i++) g['p' + i] = i ? ['p' + (i - 1), 'p' + Math.floor(i / 2)] : [];\nconst order = buildOrder(g);\nexpect(order).toHaveLength(3000);\nexpect(order[0]).toBe('p0');" }
      ],
      explanation: `
**Чому працює:** post-order DFS гарантує, що вузол потрапляє в результат після всіх своїх залежностей. Три стани (білий / сірий / чорний) відрізняють **цикл** (ребро в сірий вузол на стеку) від повторного візиту в готовий вузол (ромб).

**Складність:** O(V + E) за часом, O(V) за пам'яттю.

**Альтернатива — алгоритм Кана:** рахуємо кількість невиконаних залежностей, у черзі — пакети з нулем. Природно дає **рівні** для паралельної збірки (так планує Turborepo); якщо оброблено не всі вузли — є цикл, але шлях знайти складніше.

**Типові помилки:** лише «visited» без «в процесі»; pre-order замість post-order; дублікати при ромбах; глибока рекурсія на 10⁵ рівнів (переписати ітеративно).

**Що спитають далі:** як розбити пакети на «хвилі» для паралельної збірки? Як знайти пакети, які треба перезібрати після зміни одного (транзитивні **залежні**)?
`
    },
    // ---------------------------------------------------------------- Крок 5. Модулі
    {
      id: 'tool-cjs-vs-esm',
      group: 'modules',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'CommonJS vs ES Modules',
      tags: ['modules'],
      question: 'Чим відрізняються CommonJS і ES-модулі? Чому саме ESM дозволяє tree shaking? Що таке динамічний import()? Оберіть **усі** правильні твердження.',
      choices: [
        'Деструктуризований результат `require()` — живий звʼязок: зміну змінної в модулі одразу видно імпортеру',
        'Імпорти ESM статичні, тож граф модулів відомий до виконання — саме це дозволяє бандлеру tree shaking',
        'Динамічний `import()` синхронно повертає namespace-обʼєкт і працює лише всередині ES-модулів',
        '`require` можна викликати лише на верхньому рівні модуля і лише з рядковим літералом, як і `import`',
        'В ES-модулі код завжди виконується в strict mode, а `this` на верхньому рівні дорівнює `undefined`',
      ],
      correct: [1, 4],
      why: [
        'Хибно: деструктуризація копіює значення з `module.exports` на момент виклику — живі зв\'язки є лише в ESM.',
        'Правильно: бандлер статично бачить, які експорти використано, і викидає решту.',
        'Хибно: `import()` повертає Promise і працює також у CommonJS.',
        'Хибно: `require` — звичайна функція, її можна викликати в `if` і з обчисленим шляхом; статичність — властивість `import`.',
        'Правильно: ESM завжди strict, верхньорівневий `this` — `undefined` (у CJS — `module.exports`).'
      ],
      hint: 'Порівняйте: коли будується граф залежностей, що саме отримує імпортер (копію чи зв\'язок), і чи можна імпорт обчислити під час виконання.',
      answer: `
\`\`\`js
// CommonJS
const { sum } = require('./math');  // виклик функції під час виконання
module.exports = { sum };

// ESM
import { sum } from './math.js';
export function sum(a, b) { return a + b; }
\`\`\`

**Відмінності:**
1. **Статичність.** \`import\`/\`export\` — декларації верхнього рівня з рядковими літералами; граф будується **до** виконання (парсинг → лінкування → виконання). \`require\` можна викликати будь-де з будь-яким шляхом.
2. **Завантаження.** CJS — синхронне читання з диска. ESM — асинхронне завантаження графа, є **top-level await**.
3. **Зв'язування.** ESM — **live bindings** (read-only). CJS — об'єкт \`module.exports\`, деструктуризація дає **копію**.
4. **Контекст.** ESM — strict mode, \`this === undefined\`, немає \`__dirname\`/\`require\` (є \`import.meta.url\`, \`import.meta.dirname\`).
5. **Цикли:** CJS віддає частково заповнений \`exports\`, ESM — зв'язки в TDZ (\`ReferenceError\`).

**Tree shaking** можливий, бо з ESM бандлер статично бачить використані експорти; з \`require\` — ні.

**\`import()\`** повертає Promise з namespace-об'єктом; бандлер виносить модуль в **окремий чанк**.

**У Node:** ESM — \`.mjs\` або \`"type": "module"\`; \`.cjs\` — завжди CJS. ESM імпортує CJS (\`module.exports\` → default). \`require(esm)\` працює без прапорців у Node 22.12+ / 20.19+ (якщо в модулі немає top-level await).
`,
      keyPoints: [
        'Синтаксис: require/module.exports vs import/export',
        'ESM статичний: граф будується до виконання; CJS динамічний і синхронний',
        'Live bindings (ESM) vs копія значення (CJS)',
        'Статичність ESM → tree shaking',
        'import() повертає Promise і створює окремий чанк',
        'ESM: strict mode, this === undefined, import.meta; type: module, .mjs/.cjs'
      ],
      followUps: ['Чи можна в ESM імпортувати модуль за обчисленим шляхом?', 'Як отримати __dirname в ESM?', 'Що таке top-level await і як він впливає на граф модулів?']
    },
    {
      id: 'tool-quiz-type-module',
      group: 'modules',
      type: 'quiz',
      level: 2,
      title: '"type": "module" і require',
      tags: ['modules', 'node'],
      question: `
У package.json проєкту вказано \`"type": "module"\`. Старий файл \`scripts/build.js\` містить:

\`\`\`js
const fs = require('fs');
module.exports = function build() { /* ... */ };
\`\`\`

Що станеться при запуску \`node scripts/build.js\` і як це виправити найпростіше?
`,
      options: [
        'Усе спрацює: Node сам визначить формат за вмістом файлу',
        '`ReferenceError: require is not defined in ES module scope` — перейменувати файл на `build.cjs` (або переписати на import/export)',
        '`SyntaxError: Cannot use import statement outside a module` — додати `"type": "commonjs"`',
        'Попередження в консолі, але код виконається як CommonJS'
      ],
      answer: 1,
      why: [
        'Формат задано явно полем `type`; автодетекція синтаксису в нових Node працює лише для файлів без явного типу.',
        'Правильно: у ESM немає `require` і `module`; розширення `.cjs` має пріоритет над полем `type`.',
        'Це протилежна помилка — `import` у файлі, який Node вважає CommonJS.',
        'Тихого фолбеку з попередженням немає — виконання падає з помилкою.'
      ],
      hint: 'Як Node вирішує, яким форматом є `.js` файл, і як можна вказати формат для окремого файлу незалежно від package.json?',
      explanation: `
\`"type": "module"\` робить **усі \`.js\`** файли пакета ESM, а в ESM немає \`require\`, \`module\`, \`exports\`, \`__dirname\`.

Розширення сильніше за поле \`type\`: \`.cjs\` — завжди CommonJS, \`.mjs\` — завжди ESM. Або переписати: \`import fs from 'node:fs'; export default function build() {}\`.
`
    },
    {
      id: 'tool-quiz-live-bindings',
      group: 'modules',
      type: 'quiz',
      level: 3,
      title: 'Live bindings: ESM vs CommonJS',
      tags: ['modules'],
      question: `
Що виведуть два \`console.log\`?

\`\`\`js
// counter.mjs
export let count = 0;
export function inc() { count++; }

// main.mjs
import { count, inc } from './counter.mjs';
inc();
console.log(count); // (1)
\`\`\`

\`\`\`js
// counter.cjs
let count = 0;
module.exports = { count, inc() { count++; } };

// main.cjs
const { count, inc } = require('./counter.cjs');
inc();
console.log(count); // (2)
\`\`\`
`,
      options: ['(1) `0`, (2) `0`', '(1) `1`, (2) `1`', '(1) `0`, (2) `1`', '(1) `1`, (2) `0`'],
      answer: 3,
      why: [
        'ESM імпортує не копію, а зв\'язок зі змінною модуля — після `inc()` імпортер бачить `1`.',
        'У CommonJS у властивість `count` записано значення `0` під час створення об\'єкта; `inc()` змінює лише локальну змінну.',
        'Навпаки: живий зв\'язок — у ESM, копія — у CommonJS.',
        'Правильно: ESM — live binding (1), CommonJS — знімок значення у властивості об\'єкта (0).'
      ],
      hint: 'Що саме імпортується в ESM — значення чи зв\'язок зі змінною модуля? І що кладеться у властивість об\'єкта `{ count }` у CommonJS?',
      explanation: `
**ESM:** \`count\` у \`main.mjs\` — read-only посилання на змінну модуля. \`inc()\` змінив її → \`1\`.

**CommonJS:** \`{ count }\` записав у властивість **значення** \`0\`; деструктуризація ще раз скопіювала його. \`inc()\` змінює локальну змінну модуля → \`0\`.

Щоб у CJS бачити актуальне значення — геттер \`get count() { return count; }\` і звертання \`counter.count\`. У ESM \`count = 5\` в імпортері кине \`TypeError\`.
`
    },
    {
      id: 'tool-quiz-cjs-circular',
      group: 'modules',
      type: 'quiz',
      level: 3,
      title: 'Циклічні require у CommonJS',
      tags: ['modules', 'node'],
      question: `
Що виведе \`node main.js\`?

\`\`\`js
// a.js
exports.done = false;
const b = require('./b');
console.log('a: b.done =', b.done);
exports.done = true;

// b.js
exports.done = false;
const a = require('./a');
console.log('b: a.done =', a.done);
exports.done = true;

// main.js
require('./a');
\`\`\`
`,
      options: [
        '`b: a.done = false`, потім `a: b.done = true`',
        '`a: b.done = true`, потім `b: a.done = true`',
        'Нескінченна рекурсія: `RangeError: Maximum call stack size exceeded`',
        '`b: a.done = undefined`, потім `a: b.done = true`'
      ],
      answer: 0,
      why: [
        'Правильно: `b` отримує з кешу частково заповнений `exports` модуля `a` (`done: false`), а `a` потім бачить уже завершений `b`.',
        'Першим логує `b` (його викликали всередині `a`), і в цей момент `a` ще не дописав `done = true`.',
        'Рекурсії немає: модуль кладеться в кеш до виконання, тож повторний `require(\'./a\')` повертає кешований об\'єкт.',
        '`undefined` було б, якби `a` викликав `require(\'./b\')` до рядка `exports.done = false`.'
      ],
      hint: 'Коли саме модуль потрапляє в кеш `require` — до чи після виконання свого коду?',
      explanation: `
1. \`require('./a')\`: \`a\` **одразу в кеші** з порожнім \`exports\`, виконує \`done = false\`.
2. \`a\` → \`require('./b')\`: \`b\` у кеш, \`done = false\`.
3. \`b\` → \`require('./a')\`: \`a\` уже в кеші → частковий \`{ done: false }\`. Лог \`b: a.done = false\`, \`b\` завершується з \`done = true\`.
4. Назад у \`a\`: \`a: b.done = true\`.

Пастка: якщо \`a\` пізніше зробить \`module.exports = {...}\`, \`b\` назавжди лишиться зі старим об'єктом.
`
    },
    {
      id: 'tool-mini-commonjs',
      group: 'modules',
      type: 'code',
      level: 4,
      title: 'Міні-CommonJS: require з кешем і циклами',
      tags: ['modules', 'closures'],
      description: `
**Завдання.** Реалізуйте спрощену модульну систему CommonJS: функцію \`require\` з кешем модулів і підтримкою циклічних залежностей.

**Де трапляється:** так влаштовані \`require\` у Node.js і рантайм webpack (\`__webpack_require__\` + \`__webpack_module_cache__\`). На співбесідах питають «як працює require і чому цикли не зациклюються» — ця задача відповідає кодом.

**Що написати**
- \`createRequire(modules)\` → функція \`require(id)\`.
  - \`modules\` — об'єкт \`{ [id]: factory }\`; \`factory(module, exports, require)\` — обгортка модуля (Node так загортає вміст кожного файлу).
- \`require(id)\` → \`module.exports\` модуля. Вимоги:
  1. Модуль може як доповнювати \`exports\`, так і повністю замінити \`module.exports\`.
  2. **Кеш:** фабрика кожного модуля виконується не більше одного разу; повторний \`require\` повертає той самий об'єкт.
  3. **Цикли, як у Node:** якщо модуль ще виконується, \`require\` повертає його поточний (частково заповнений) \`module.exports\`.
  4. Невідомий id → \`Error\` з повідомленням \`Cannot find module '<id>'\` (властивості прототипу на кшталт \`toString\` — теж невідомі).
  5. Фабрика кинула помилку → модуль **не лишається в кеші**, помилка пробрасується.
  6. Усередині фабрики \`this\` — початковий \`module.exports\`.

**Приклад**
\`\`\`js
const req = createRequire({
  math: (module, exports) => { exports.add = (a, b) => a + b; },
  app: (module, exports, require) => { module.exports = require('math').add(2, 3); },
});
req('app');         // 5
req('math').add;    // та сама функція при кожному виклику — модуль з кешу
req('nope');        // Error: Cannot find module 'nope'
\`\`\`

**Як це працює:** перед виконанням модуля Node створює \`module = { exports: {} }\` і **одразу** кладе його в кеш. Тому при циклі \`a → b → a\` другий \`require('a')\` знаходить \`a\` у кеші й отримує частково заповнений \`exports\` замість нескінченної рекурсії. \`exports\` — лише початкове посилання; якщо модуль присвоїв \`module.exports = ...\`, повертати треба нове значення.

**Врахуйте:**
- \`'toString' in modules\` — \`true\` через прототип; перевіряйте \`Object.hasOwn\`;
- читайте \`module.exports\` **після** виконання фабрики;
- зламаний модуль видаляйте з кешу, щоб наступний \`require\` спробував знову.
`,
      starter: `function createRequire(modules) {
  // 1. Кеш id -> module ({ exports: {} }), спільний для всіх викликів require.
  const cache = new Map();

  function require(id) {
    // 2. Модуль уже в кеші (готовий або ще виконується — цикл)?
    //    Поверніть його поточний module.exports.
    // TODO

    // 3. Невідомий id (Object.hasOwn, а не 'in') ->
    //    throw new Error("Cannot find module '" + id + "'")
    // TODO

    // 4. Створіть module = { exports: {} } і покладіть у кеш ДО виконання фабрики.

    // 5. Викличте фабрику з this = module.exports і аргументами (module, module.exports, require).
    //    Помилка -> видаліть модуль з кешу і прокиньте її далі.

    // 6. Поверніть module.exports (читайте ПІСЛЯ виконання — його могли замінити).
  }

  return require;
}

// Спробуйте в консолі:
// const req = createRequire({ math: (m, e) => { e.add = (a, b) => a + b; } });
// req('math').add(2, 3); // 5
`,
      solution: `function createRequire(modules) {
  const cache = new Map();

  function require(id) {
    // 1. Уже завантажений (або ще завантажується — цикл) -> віддаємо поточний exports
    if (cache.has(id)) return cache.get(id).exports;

    if (!Object.hasOwn(modules, id) || typeof modules[id] !== 'function') {
      throw new Error(\`Cannot find module '\${id}'\`);
    }

    // 2. Кладемо в кеш ДО виконання — саме це розриває нескінченну рекурсію при циклах
    const module = { id, exports: {}, loaded: false };
    cache.set(id, module);

    try {
      modules[id].call(module.exports, module, module.exports, require);
    } catch (err) {
      cache.delete(id); // зламаний модуль не кешуємо
      throw err;
    }

    module.loaded = true;
    return module.exports; // читаємо ПІСЛЯ виконання: модуль міг замінити module.exports
  }

  return require;
}
`,
      hints: [
        'Кеш `id → module`, де `module = { exports: {} }`. Повертати треба `module.exports` **після** виконання фабрики — модуль міг присвоїти новий об\'єкт.',
        'Щоб цикли не зациклювались, кладіть модуль у кеш **перед** викликом фабрики — тоді вкладений `require` того самого id поверне частково заповнений `exports`.',
        'Невідомий id: `!Object.hasOwn(modules, id)`. Виклик: `modules[id].call(module.exports, module, module.exports, require)` у `try/catch` з `cache.delete(id)` у `catch`.'
      ],
      tests: [
        { name: 'базовий require та module.exports', code: "const req = createRequire({\n  math: (module, exports) => { exports.add = (a, b) => a + b; },\n  app: (module, exports, require) => { module.exports = require('math').add(2, 3); }\n});\nexpect(req('app')).toBe(5);\nexpect(req('math').add(1, 1)).toBe(2);" },
        { name: 'фабрика виконується один раз, повертається той самий об\'єкт', code: "const factory = mockFn((module, exports) => { exports.n = Math.random(); });\nconst req = createRequire({ cfg: factory, a: (m, e, r) => { e.cfg = r('cfg'); }, b: (m, e, r) => { e.cfg = r('cfg'); } });\nexpect(req('a').cfg).toBe(req('b').cfg);\nexpect(req('cfg')).toBe(req('cfg'));\nexpect(factory).toHaveBeenCalledTimes(1);" },
        { name: 'заміна module.exports функцією', code: "const req = createRequire({ greet: (module) => { module.exports = (name) => 'Hi, ' + name; } });\nexpect(req('greet')('Ann')).toBe('Hi, Ann');" },
        { name: 'this у фабриці — це exports', code: "const req = createRequire({ m: function (module, exports) { this.x = 1; expect(this).toBe(exports); } });\nexpect(req('m').x).toBe(1);" },
        { name: 'цикл: отримуємо частково заповнений exports', code: "const logs = [];\nconst req = createRequire({\n  a: (module, exports, require) => { exports.done = false; const b = require('b'); logs.push('a sees b.done=' + b.done); exports.done = true; },\n  b: (module, exports, require) => { exports.done = false; const a = require('a'); logs.push('b sees a.done=' + a.done); exports.done = true; }\n});\nexpect(req('a').done).toBe(true);\nexpect(logs).toEqual(['b sees a.done=false', 'a sees b.done=true']);" },
        { name: 'цикл + заміна module.exports: залежний бачить старий об\'єкт', code: "const req = createRequire({\n  a: (module, exports, require) => { const b = require('b'); module.exports = { name: 'a', b }; },\n  b: (module, exports, require) => { const a = require('a'); module.exports = { getA: () => a }; }\n});\nconst a = req('a');\nexpect(a.name).toBe('a');\nexpect(a.b.getA()).toEqual({});\nexpect(a.b.getA()).not.toBe(a);" },
        { name: 'невідомий модуль', code: "const req = createRequire({ a: () => {} });\nexpect(() => req('nope')).toThrow(\"Cannot find module 'nope'\");\nexpect(() => req('toString')).toThrow(\"Cannot find module 'toString'\");" },
        { name: 'модуль з помилкою не кешується', code: "let attempts = 0;\nconst req = createRequire({ flaky: (module) => { attempts++; if (attempts === 1) throw new Error('boom'); module.exports = 'ok'; } });\nexpect(() => req('flaky')).toThrow('boom');\nexpect(req('flaky')).toBe('ok');\nexpect(attempts).toBe(2);" }
      ],
      explanation: `
**Три ключові рішення:**
1. **Кеш до виконання** — розриває цикли (так само \`Module._cache\` у Node).
2. **\`module.exports\` читається після виконання** — звідси класична пастка: \`exports = {...}\` нічого не експортує.
3. **Очищення кешу при помилці** — інакше наступні \`require\` отримали б напівготовий модуль.

**Складність:** O(1) на повторний \`require\`; кожна фабрика — один раз.

**Типові помилки:** кешувати після виконання (переповнення стека на циклах); повертати збережене посилання на початковий \`exports\`; \`modules[id]\` без \`hasOwn\`; не передавати \`this\`.

**Що спитають далі:** чому в ESM цикли поводяться інакше (TDZ, live bindings)? Як webpack перетворює \`import\` на \`__webpack_require__\`? Як інвалідувати модуль для HMR?
`
    },
    {
      id: 'tool-dual-package',
      group: 'modules',
      type: 'theory',
      level: 4,
      title: 'Публікація бібліотеки для ESM і CJS: exports, interop, dual package hazard',
      tags: ['modules', 'npm'],
      question: 'Ви публікуєте бібліотеку, якою користуватимуться і в ESM, і в CommonJS-проєктах. Як налаштувати package.json? Що таке dual package hazard і проблеми interop між CJS та ESM?',
      choices: [
        'Dual package hazard — ESM- і CJS-версії завантажились як два екземпляри: синглтони дублюються, `instanceof` ламається',
        'Порядок умов у `exports` не важливий: Node сам обирає найконкретнішу умову, тож `types` можна спокійно ставити останньою',
        'Додавання поля `exports` до наявного пакета завжди безпечне: глибокі імпорти на кшталт `pkg/dist/x.js` працюватимуть',
        'Коли ESM імпортує CJS-модуль, `module.exports` розкладається на named-експорти, а default-експорту немає',
        'Dual package hazard виникає, коли в package.json є і `main`, і `module`, і лікується простим видаленням поля `main`',
      ],
      correct: 0,
      why: [
        'Правильно: два екземпляри — два стани; `err instanceof MyLibError` між ними дає `false`.',
        'Хибно: умови перевіряються за порядком в об\'єкті — `types` ставлять першою, `default` останньою.',
        'Хибно: `exports` інкапсулює пакет — шляхи поза мапою дають `ERR_PACKAGE_PATH_NOT_EXPORTED`, тож це потенційно breaking change.',
        'Навпаки: `module.exports` стає default-експортом, а named-імпорти доступні, лише якщо Node зміг їх статично вгадати.',
        'Хибно: hazard — про два завантажені екземпляри (ESM і CJS) в одному застосунку, а не про поля `main`/`module`.'
      ],
      hint: 'Умовні експорти, порядок умов, default-експорт CJS-модуля, дві копії стану.',
      answer: `
**Умовні експорти:**
\`\`\`json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./package.json": "./package.json"
  },
  "main": "./dist/index.cjs",
  "sideEffects": false
}
\`\`\`
- Умови перевіряються **за порядком**: \`types\` — першою, \`default\` — останньою.
- \`exports\` **інкапсулює**: \`my-lib/dist/internal.js\` → \`ERR_PACKAGE_PATH_NOT_EXPORTED\`; додати \`exports\` — потенційно breaking change.
- Збирають обидва формати tsup, tsdown, unbuild, Rollup.

**Interop:**
- ESM → CJS: \`module.exports\` — це **default**; named-імпорти — лише якщо Node їх статично вгадав (cjs-module-lexer).
- Транспільований ESM у CJS ставить \`__esModule: true\` і \`exports.default\` → звідси \`require('x').default\` і \`esModuleInterop\` у TS.
- CJS → ESM: \`await import()\` або \`require(esm)\` у Node 22.12+ / 20.19+ (без top-level await).

**Dual package hazard:** у застосунку завантажились і ESM-, і CJS-версія → **два екземпляри**: два кеші/синглтони, \`instanceof\` не працює. Рішення:
- одне ядро + тонка обгортка іншого формату;
- публікувати **лише ESM** — сучасна рекомендація, бо \`require(esm)\` уже є в усіх підтримуваних LTS Node;
- не тримати глобальний стан у бібліотеці.

**Перевірка:** \`publint\`, \`arethetypeswrong\`.
`,
      keyPoints: [
        'exports з умовами import/require/types/default, порядок має значення',
        'exports інкапсулює внутрішні шляхи (ERR_PACKAGE_PATH_NOT_EXPORTED)',
        'Interop: module.exports → default, __esModule, esModuleInterop',
        'Dual package hazard: два екземпляри модуля, зламані instanceof і синглтони',
        'Рішення: обгортка над одним ядром або лише ESM; publint/arethetypeswrong'
      ],
      followUps: ['Чому додавання поля exports може бути breaking change?', 'Як TypeScript резолвить типи з exports (moduleResolution: bundler/node16)?', 'Чому в CJS іноді треба писати require(\'x\').default?']
    },
    {
      id: 'tool-bundlers', why: ["Ні: на хуки збірки підписуються плагіни, лоадери перетворюють окремі файли.","Ні: у продакшені Vite бандлить код через Rollup.","Так: у dev Vite віддає нативні ESM і перетворює файли на льоту.","Так: без бандла буде водоспад запитів і нерозв'язані bare-імпорти.","Ні: залежності Vite попередньо бандлить через esbuild (pre-bundling)."],
      group: 'build',
      type: 'theory',
      level: 2,
      interview: true,
      title: 'Навіщо бандлер: webpack і Vite',
      tags: ['bundlers', 'webpack', 'vite'],
      question: 'Навіщо потрібен бандлер, якщо браузери вже підтримують ES-модулі? Розкажіть про основні поняття webpack і чим Vite відрізняється від нього. Оберіть **усі** правильні твердження.',
      choices: ['У webpack loaders підписуються на хуки всього процесу збірки, а plugins трансформують окремі файли', 'У продакшені Vite теж віддає незбандлені ESM, бо HTTP/2 повністю знімає проблему водоспаду запитів', 'У dev-режимі Vite не бандлить ваш код: віддає нативні ESM і трансформує файли на вимогу', 'Бандлер потрібен і з нативними ESM: водоспад запитів, bare-імпорти, CSS/TS/JSX, мініфікація', 'Залежності з `node_modules` Vite у dev віддає як є, без попереднього pre-bundling через esbuild'],
      correct: [2, 3],
      hint: 'Тисячі модулів у node_modules, водоспад запитів, не-JS ресурси, оптимізації для продакшену.',
      answer: '\n**Навіщо бандлити навіть у 2020-х:**\n- **Водоспад запитів:** нативні ESM вантажать граф послідовно (модуль → його імпорти → ...); сотні/тисячі файлів з node_modules — це повільно навіть з HTTP/2.\n- **Резолв bare-імпортів** (`import \'react\'`) — браузер сам не знає про node_modules (лише через import maps).\n- **Не-JS ресурси:** CSS, зображення, шрифти, SVG, JSON, TypeScript, JSX, Vue SFC.\n- **Оптимізації:** мініфікація, tree shaking, code splitting, хешовані імена файлів для довгого кешування, транспіляція під цільові браузери, оптимізація зображень.\n\n**webpack — основні поняття:**\n- **entry** — точка(и) входу, з якої будується граф залежностей;\n- **output** — куди і з якими іменами писати бандли (`[name].[contenthash].js`);\n- **loaders** — трансформують **окремі файли** при імпорті: `babel-loader`, `ts-loader`, `css-loader` + `style-loader`, `sass-loader` (застосовуються справа наліво);\n- **plugins** — підписуються на хуки **всього процесу збірки**: `HtmlWebpackPlugin`, `MiniCssExtractPlugin`, `DefinePlugin`, bundle analyzer;\n- **chunks** — частини вихідного коду: entry-чанки, асинхронні (`import()`), спільні (`splitChunks`, наприклад vendor);\n- **mode** — `development`/`production` (вмикає оптимізації); **devServer** + HMR.\n\n**Vite:**\n- **dev:** **не бандлить** ваш код — віддає файли як нативні ESM, трансформуючи кожен на вимогу (TS/JSX через esbuild). Залежності з node_modules один раз **pre-bundle-яться** esbuild-ом (CJS → ESM, сотні файлів → один). Старт миттєвий незалежно від розміру проєкту.\n- **HMR** працює на рівні модулів по ESM-графу: оновлюється лише змінений модуль і його межа прийняття (`import.meta.hot.accept`), а не перебудовується бандл.\n- **prod:** класичний бандл через Rollup (у нових версіях — Rolldown на Rust) — бо для продакшену бандлинг все ще ефективніший.\n- Конфіг значно простіший, плагіни сумісні з Rollup.\n\n**Інші:** esbuild (Go, дуже швидкий), Rollup (бібліотеки, найкращий tree shaking), Parcel (zero-config), Rspack (webpack-сумісний на Rust), Turbopack.\n\n**Коли webpack:** легасі-проєкти, складні кастомні збірки, Module Federation (мікрофронтенди). Для нових SPA — зазвичай Vite.\n',
      keyPoints: ['Причини бандлингу: водоспад запитів, bare-імпорти, не-JS ресурси, оптимізації', 'webpack: entry, output, loaders (файли), plugins (процес), chunks, mode', 'Vite dev: нативні ESM + esbuild pre-bundling залежностей, трансформація на вимогу', 'Vite HMR по ESM-графу; prod-збірка через Rollup/Rolldown', 'contenthash в іменах для довгого кешування'],
      followUps: ['Чому Vite все ж бандлить у продакшені?', 'Як працює HMR під капотом?', 'Що таке Module Federation?']
    },
    {
      id: 'tool-quiz-loader-plugin', why: ["Так: перетворення окремого файлу — робота лоадера.","Ні: генерація HTML — плагін (HtmlWebpackPlugin).","Так: імпорт CSS дає лоадер (css-loader).","Ні: заміну констант робить плагін (DefinePlugin).","Ні: аналіз бандла — плагін."],
      group: 'build',
      type: 'quiz',
      level: 2,
      title: 'webpack: лоадер чи плагін?',
      tags: ['bundlers', 'webpack'],
      question: 'Оберіть **усі** задачі, які у webpack вирішуються саме **лоадерами** (а не плагінами):',
      options: ['Перетворити `.ts`/`.tsx` файли на JavaScript під час імпорту', 'Згенерувати `index.html` з підключеними бандлами', 'Дозволити `import \'./styles.css\'` у JS-модулі', 'Підставити `process.env.NODE_ENV` як константу на етапі збірки', 'Побудувати звіт з розмірами бандлів'],
      answer: [0, 2],
      hint: 'Лоадер отримує вміст **одного файлу** і повертає трансформований модуль. Плагін бачить усю збірку цілком.',
      explanation: '\n**Лоадери** — функції `(source) => transformedSource` для окремих модулів, які webpack застосовує за правилами `module.rules` (за розширенням файлу):\n- TS → JS: `ts-loader` / `babel-loader` / `swc-loader`;\n- імпорт CSS: `css-loader` (розбирає `@import`/`url()`) + `style-loader` (вставляє `<style>`) або `MiniCssExtractPlugin.loader`.\n\n**Плагіни** — класи з методом `apply(compiler)`, які підписуються на хуки життєвого циклу збірки:\n- `HtmlWebpackPlugin` — генерує HTML з тегами на всі бандли;\n- `DefinePlugin` — замінює вирази на константи у всьому коді (`process.env.NODE_ENV` → `"production"`), що дає змогу мініфікатору вирізати dev-гілки;\n- `webpack-bundle-analyzer` — аналізує готові чанки.\n'
    },
    {
      id: 'tool-transpile-polyfill', why: ["Ні: новий синтаксис поліфілом не додати — лише транспіляцією.","Ні: entry імпортує поліфіли під цільові браузери, лише використані — usage.","Так: транспіляція — синтаксис, поліфіли — відсутні API в рантаймі.","Ні: esbuild і SWC лише прибирають типи, не перевіряють їх.","Ні: browserslist читають і autoprefixer, і бандлери."],
      group: 'build',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Транспіляція vs поліфіли: Babel, SWC, core-js, browserslist',
      tags: ['bundlers', 'babel'],
      question: 'Чим транспіляція відрізняється від поліфілу? Як працюють Babel/SWC/esbuild, core-js і browserslist разом?',
      choices: ['Optional chaining `?.` можна додати старому браузеру поліфілом з core-js — транспіляція для цього не потрібна', '`useBuiltIns: "entry"` у preset-env імпортує лише ті поліфіли, які реально використовуються в коді вашого проєкту', 'Транспіляція переписує синтаксис під час збірки, а поліфіл у рантаймі додає відсутнє API (`Array.prototype.at`)', 'esbuild і SWC перевіряють типи TypeScript так само, як `tsc`, тому окремий `tsc --noEmit` у CI зайвий', 'browserslist читає лише Babel, а для autoprefixer і бандлера цільові браузери доводиться задавати окремо'],
      correct: 2,
      hint: 'Синтаксис (оператори, класи) не можна «додати» функцією. А методи — можна.',
      answer: '\n**Транспіляція** — перетворення **синтаксису** нової версії мови на старий еквівалент (або TS/JSX → JS) на етапі збірки: код → AST → трансформації → код.\n```js\n// було\nconst name = user?.profile?.name ?? \'Guest\';\n// стало (спрощено)\nvar _user$profile;\nvar name = (_user$profile = user == null ? void 0 : user.profile) == null ? void 0 : ...;\n```\nСинтаксис неможливо «додати» в рантаймі — старий парсер просто впаде з `SyntaxError`.\n\n**Поліфіл** — код, що в рантаймі **додає відсутнє API**, якщо його немає: `Promise`, `Array.prototype.at`, `Object.groupBy`, `structuredClone`.\n```js\nif (!Array.prototype.at) {\n  Array.prototype.at = function (i) { i = Math.trunc(i) || 0; return this[i < 0 ? this.length + i : i]; };\n}\n```\n\n**Інструменти:**\n- **Babel** — модульний транспілятор на JS з плагінами; `@babel/preset-env` обирає потрібні трансформації під цільові браузери.\n- **SWC** (Rust) і **esbuild** (Go) — у 10–100 разів швидші; використовуються в Next.js, Vite, Rspack. esbuild не вміє все (наприклад, понижувати деякі конструкції до ES5).\n- **tsc** — перевіряє типи; у сучасних збірках TS часто лише «стирається» швидкими інструментами, а `tsc --noEmit` запускається окремо.\n\n**core-js** — бібліотека поліфілів. `preset-env` з `useBuiltIns: \'usage\'` + `corejs: 3` автоматично імпортує **лише ті** поліфіли, що використовуються в коді та відсутні в цільових браузерах (`\'entry\'` — за списком цілей, незалежно від використання).\n\n**browserslist** — єдине джерело цільових браузерів для Babel, autoprefixer, SWC, Vite (`build.target`):\n```text\n# .browserslistrc\n> 0.5%, last 2 versions, not dead\n```\n\n**Trade-offs:** чим старіші цілі, тим більший бандл і повільніший код. Підходи: module/nomodule (два бандли), відмова від IE і ES5, поліфіл-сервіси за User-Agent. Поліфіли в **бібліотеках** не повинні забруднювати глобальний простір — для цього `@babel/plugin-transform-runtime` з `core-js-pure`.\n',
      keyPoints: ['Транспіляція — синтаксис на етапі збірки (через AST); поліфіл — відсутнє API в рантаймі', 'Синтаксис не можна поліфілити: старий парсер дає SyntaxError', 'Babel (плагіни, preset-env) vs SWC/esbuild (швидкі, нативні)', 'core-js + useBuiltIns: usage — лише потрібні поліфіли', 'browserslist — спільне джерело цілей для Babel, autoprefixer, бандлера'],
      followUps: ['Чому бібліотеці не варто імпортувати глобальні поліфіли?', 'Що таке module/nomodule підхід?', 'Чи потрібен Babel, якщо є TypeScript?']
    },
    {
      id: 'tool-quiz-polyfill', why: ["Так: новий метод API — поліфіл.","Ні: синтаксис — транспіляція.","Так: метод масиву — поліфіл.","Ні: синтаксис — транспіляція.","Так: новий статичний метод — поліфіл.","Ні: синтаксис класу — транспіляція."],
      group: 'build',
      type: 'quiz',
      level: 2,
      title: 'Що потребує поліфілу, а що — транспіляції?',
      tags: ['bundlers', 'babel'],
      question: 'Ваш проєкт має підтримувати старий браузер. Оберіть **усе**, що вирішується **поліфілом** (а не транспіляцією синтаксису):',
      options: ['`Promise.allSettled([...])`', 'Оператор опційного ланцюжка `a?.b`', '`[1, 2, 3].at(-1)`', 'Стрілкові функції', '`Object.groupBy(items, fn)`', 'Приватні поля класу `#count`'],
      answer: [0, 2, 4],
      hint: 'Чи можна це реалізувати звичайною функцією, яку додають до глобального об\'єкта чи прототипу?',
      explanation: '\n**Поліфіл** — це звичайний JS-код, який додає відсутнє **API**: статичні методи (`Promise.allSettled`, `Object.groupBy`) і методи прототипів (`Array.prototype.at`). Їх бере `core-js`.\n\n**Транспіляція** потрібна для **синтаксису**, який старий парсер не розуміє взагалі:\n- `a?.b` → перевірки на `null`/`undefined`;\n- стрілкові функції → `function` із збереженим `this` через змінну `_this`;\n- `#count` → `WeakMap` або допоміжні функції Babel.\n\nТипова помилка: думати, що Babel «сам» додає `Promise` чи `.at()` — без core-js (і `useBuiltIns`) він переписує лише синтаксис, і код впаде з `TypeError: ... is not a function`.\n'
    },
    {
      id: 'tool-tree-shaking', why: ["Ні: CommonJS динамічний — tree shaking з ним ненадійний.","Ні: методи класу не викидаються — клас використовується цілком.","Так: sideEffects: false дозволяє видаляти невикористані модулі.","Ні: надто дрібні чанки додають запити й накладні витрати.","Так: source maps часто вантажать лише в сервіс моніторингу помилок."],
      group: 'build',
      type: 'theory',
      level: 3,
      interview: true,
      title: 'Tree shaking, sideEffects, code splitting, мініфікація, source maps',
      tags: ['bundlers', 'performance'],
      question: 'Як працює tree shaking і чому він іноді не працює? Що таке sideEffects у package.json? Розкажіть про code splitting, мініфікацію і source maps. Оберіть **усі** правильні твердження.',
      choices: ['Tree shaking надійно працює і з CommonJS-пакетами на кшталт `lodash`, якщо імпортувати одну функцію', 'Невикористані методи класу бандлер видаляє так само, як і невикористані експорти модуля', '`"sideEffects": false` дозволяє викидати невикористані модулі цілком, але глобальний CSS слід додати у винятки', 'Чим дрібніші чанки при code splitting, тим швидше завантаження — забагато запитів не буває', 'Source maps у продакшені часто не публікують, а завантажують лише в Sentry (`hidden-source-map`)'],
      correct: [2, 4],
      hint: 'Статичний аналіз ESM, «сміття» з побічними ефектами, import() як точка розрізу.',
      answer: '\n**Tree shaking** — видалення невикористаного коду (dead code elimination на рівні експортів). Бандлер будує граф ESM-імпортів, позначає використані експорти, а мініфікатор (Terser/esbuild) викидає решту.\n\n**Чому може не працювати:**\n- пакет поставляється в **CommonJS** (`lodash` замість `lodash-es`) — статичний аналіз неможливий;\n- модуль має **побічні ефекти** на верхньому рівні (змінює глобальні об\'єкти, реєструє щось, імпортує CSS) — бандлер не може викинути його, навіть якщо експорти не використані;\n- код транспілювався в CJS до бандлера (Babel з `modules: \'commonjs\'`);\n- `import * as lib` з динамічним доступом `lib[name]`;\n- класи/об\'єкти з методами — невикористаний **метод** класу не видаляється.\n\n**`"sideEffects": false`** у package.json — обіцянка бандлеру: «імпорт будь-якого файлу пакета нічого не робить, крім експорту». Тоді невикористані модулі викидаються цілком. Можна вказати масив винятків: `"sideEffects": ["*.css", "./src/polyfills.js"]` — інакше глобальні стилі зникнуть зі збірки. Анотація `/*#__PURE__*/` позначає виклик без побічних ефектів.\n\n**Code splitting** — розбиття на чанки, що вантажаться на вимогу:\n- за маршрутами/важкими компонентами через `import()`;\n- vendor-чанк (рідко змінюється → довго кешується);\n- спільні чанки між entry (`splitChunks`).\nКомпроміс: забагато дрібних чанків → водоспад запитів; можна `<link rel="modulepreload">`/prefetch.\n\n**Мініфікація** (Terser, esbuild, SWC): видалення пробілів і коментарів, перейменування локальних змінних (mangling), константне згортання, видалення недосяжного коду (`if ("production" !== "production")`). Для CSS — cssnano/Lightning CSS.\n\n**Source maps** — файл `.map`, що зіставляє позиції мінімізованого коду з вихідними файлами; DevTools і Sentry показують оригінальний код у стек-трейсах. Варіанти в webpack (`devtool`): швидкі `eval-*` для dev, `source-map` для prod. У продакшені їх часто **не публікують** (`hidden-source-map`), а завантажують лише в систему моніторингу помилок — щоб не віддавати вихідний код.\n',
      keyPoints: ['Tree shaking = статичний аналіз ESM + видалення мініфікатором', 'Ламається від CJS, побічних ефектів верхнього рівня, транспіляції в CJS', 'sideEffects: false і масив винятків (CSS, поліфіли), /*#__PURE__*/', 'Code splitting через import(), vendor- і спільні чанки; компроміс кількості запитів', 'Мініфікація: mangling, dead code; source maps і hidden-source-map для prod'],
      followUps: ['Чому після "sideEffects": false могли зникнути стилі?', 'Як перевірити, що потрапило в бандл?', 'Чим prefetch відрізняється від preload?']
    },
    {
      id: 'tool-quiz-tree-shaking', why: ["Ні: default-імпорт тягне весь об'єкт lodash.","Ні: CommonJS require не аналізується статично.","Ні: namespace-імпорт CJS-пакета теж тягне все.","Так: іменований імпорт з ESM-пакета дозволяє викинути решту."],
      group: 'build',
      type: 'quiz',
      level: 3,
      title: 'Який імпорт дозволяє tree shaking?',
      tags: ['bundlers', 'performance'],
      question: 'Вам потрібна лише функція `debounce`. Який варіант імпорту дозволить бандлеру (Vite/webpack у production-режимі) **не включати** решту бібліотеки в бандл?',
      options: ['`import _ from \'lodash\'; _.debounce(fn, 300);`', '`const { debounce } = require(\'lodash\');`', '`import * as _ from \'lodash\'; _.debounce(fn, 300);`', '`import { debounce } from \'lodash-es\';`'],
      answer: 3,
      hint: 'Подивіться не лише на синтаксис імпорту, а й на формат, у якому опублікований сам пакет.',
      explanation: '\n`lodash-es` опублікований як **ES-модулі** з `"sideEffects": false`, кожна функція — окремий модуль. Іменований `import { debounce }` дозволяє бандлеру статично побачити, що потрібна лише вона.\n\nРешта варіантів тягнуть усю бібліотеку (~70 КБ):\n- пакет `lodash` — **CommonJS** (один великий модуль); default-імпорт чи `import * as` усе одно означають «весь `module.exports`»;\n- `require` — динамічний, аналізувати нічого;\n- навіть деструктуризація `{ debounce }` після `require` не допомагає — об\'єкт уже повністю завантажено.\n\nАльтернатива для CJS-версії — імпорт за шляхом: `import debounce from \'lodash/debounce\'` (підключається лише цей файл з його залежностями).\n'
    },
    {
      id: 'tool-env-modes', why: ["Ні: process.env у браузері немає — значення підставляє бандлер.","Ні: VITE_-змінні потрапляють у бандл — це не секрет.","Ні: NODE_ENV — режим збірки, а не тип середовища.","Ні: навпаки — у клієнт потрапляють лише змінні з префіксом.","Так: значення вшиваються в код під час збірки."],
      group: 'build',
      type: 'theory',
      level: 2,
      title: 'Змінні середовища та режими збірки',
      tags: ['bundlers', 'security'],
      question: 'Як працюють змінні середовища у фронтенд-проєкті (process.env, import.meta.env)? Що таке режими збірки? Чи можна класти секрети в .env фронтенду?',
      choices: ['`process.env` доступний у браузері так само, як у Node, тому змінні зчитуються під час виконання', 'Приватний API-ключ безпечно класти в `.env` з префіксом `VITE_`, адже сам файл `.env` не комітиться', '`NODE_ENV=production` означає саме прод-середовище, тому staging збирають з `NODE_ENV=staging`', 'Vite передає в клієнт усі змінні з `.env`, а префікс `VITE_` лише позначає їх як публічні для команди розробки', 'Бандлер текстово підставляє значення змінних під час збірки, тож усе, що потрапило в бандл, — публічне'],
      correct: 4,
      hint: 'Хто і коли підставляє значення змінної: браузер під час виконання чи бандлер під час збірки?',
      answer: '\n**Головне:** у браузері немає `process.env`. Бандлер **на етапі збірки текстово замінює** вирази на значення (webpack `DefinePlugin`, Vite `define` / `import.meta.env`). Тобто змінні «вшиваються» в бандл.\n\n```js\n// код\nif (import.meta.env.DEV) console.log(\'debug\');\nfetch(import.meta.env.VITE_API_URL + \'/users\');\n// після prod-збірки\nfetch("https://api.example.com" + "/users"); // гілку DEV мініфікатор викинув\n```\n\n**Vite:**\n- `.env`, `.env.local` (не комітиться), `.env.[mode]`, `.env.[mode].local`;\n- у клієнтський код потрапляють **лише** змінні з префіксом `VITE_` (у CRA — `REACT_APP_`, у Next.js — `NEXT_PUBLIC_`) — захист від випадкового витоку;\n- вбудовані: `import.meta.env.MODE`, `DEV`, `PROD`, `BASE_URL`;\n- **режим (mode)**: `vite build --mode staging` підвантажує `.env.staging`.\n\n**webpack:** `mode: \'production\' | \'development\'` вмикає оптимізації і встановлює `process.env.NODE_ENV`; власні змінні — через `DefinePlugin`/`EnvironmentPlugin` або dotenv.\n\n**`NODE_ENV` ≠ середовище деплою.** `NODE_ENV=production` означає «оптимізована збірка» (React, бібліотеки вимикають dev-перевірки). Staging і production — обидва `production`-збірки з різними `MODE`/API URL.\n\n**Секрети:** усе, що потрапило в бандл, **публічне** — його видно в DevTools → Sources. Тому у фронтенд-.env можна класти лише публічні значення (URL API, публічний ключ аналітики, feature flags). Приватні ключі (платіжні, сторонніх API) — лише на бекенді/BFF/serverless-проксі.\n\n**Build once, deploy many:** щоб не перезбирати образ під кожне середовище, конфіг можна віддавати в рантаймі (`/config.json` або `window.__CONFIG__`, згенерований сервером).\n',
      keyPoints: ['Змінні підставляються бандлером на етапі збірки (DefinePlugin, import.meta.env)', 'Префікс VITE_/NEXT_PUBLIC_ — лише такі змінні потрапляють у клієнт', 'Режими збірки і .env.[mode]; NODE_ENV — тип збірки, а не середовище', 'Усе в бандлі публічне — секрети лише на сервері', 'Runtime-конфіг для «build once, deploy many»'],
      followUps: ['Як мініфікатор вирізає dev-код за NODE_ENV?', 'Як передати різні API URL у staging і prod без перезбирання?', 'Чому .env.local додають у .gitignore?']
    },
    {
      id: 'tool-lint-hooks', why: ["Так: ESLint — про помилки, Prettier — лише форматування.","Ні: хук обходиться --no-verify — CI має перевіряти ще раз.","Так: перевіряються лише змінені файли — швидко.","Ні: повні тести в pre-commit гальмують роботу — їм місце в CI.","Так: хуки з репозиторію однакові для всієї команди."],
      group: 'quality-ci',
      type: 'theory',
      level: 1,
      title: 'ESLint, Prettier, husky, lint-staged',
      tags: ['quality'],
      question: 'Чим відрізняються ESLint і Prettier? Як налаштувати автоматичні перевірки перед комітом? Оберіть **усі** правильні твердження.',
      choices: ['ESLint шукає помилки й підозрілі патерни, Prettier лише форматує; `eslint-config-prettier` прибирає конфлікти', 'Pre-commit хук гарантує, що перевірки пройдено, тож дублювати lint і тести в CI немає потреби', '`lint-staged` запускає команди лише для staged-файлів, тому хук швидкий навіть у великому репозиторії', 'У pre-commit варто ганяти всі тести й typecheck усього проєкту — так баги точно не потраплять у коміт', 'husky встановлює git-хуки з файлів репозиторію, тож у всієї команди однакові перевірки перед комітом'],
      correct: [0, 2, 4],
      hint: 'Якість коду vs форматування. Перевіряти весь проєкт чи лише змінені файли?',
      answer: '\n**ESLint** — статичний аналізатор: знаходить **помилки і підозрілі патерни** (невикористані змінні, `==`, відсутні залежності хуків, `no-floating-promises` з typescript-eslint, правила доступності). Має автофікс для частини правил. Конфіг — flat config `eslint.config.js` (з v9).\n\n**Prettier** — **лише форматувальник**: відступи, лапки, переноси, крапки з комою. Свідомо майже без налаштувань → кінець суперечок про стиль на code review.\n\n**Як поєднувати:** ESLint не повинен займатися форматуванням — інакше правила конфліктують. Використовують `eslint-config-prettier` (вимикає стилістичні правила ESLint), а Prettier запускають окремо (або в редакторі «format on save»). Альтернативи-«комбайни»: Biome, oxlint — значно швидші.\n\n**Pre-commit хуки:**\n- **husky** — встановлює git-хуки з репозиторію (`.husky/pre-commit`), щоб у всієї команди були однакові;\n- **lint-staged** — запускає команди **лише для staged-файлів** (швидко навіть у великому проєкті):\n```json\n{\n  "scripts": { "prepare": "husky" },\n  "lint-staged": {\n    "*.{js,ts,tsx}": ["eslint --fix", "prettier --write"],\n    "*.{css,md,json}": "prettier --write"\n  }\n}\n```\n```text\n# .husky/pre-commit\nnpx lint-staged\n# .husky/commit-msg\nnpx --no -- commitlint --edit $1\n```\n\n**Важливо:** хуки можна обійти (`git commit --no-verify`), тому **CI має повторювати** ті самі перевірки — хуки лише дають швидкий фідбек локально. Важкі речі (усі тести, typecheck усього проєкту) у pre-commit не кладуть — це дратує; їх місце в pre-push або CI.\n\nТакож: `.editorconfig` для базових налаштувань редактора, Stylelint для CSS.\n',
      keyPoints: ['ESLint — якість і помилки; Prettier — лише форматування', 'eslint-config-prettier, щоб правила не конфліктували', 'husky — git-хуки для всієї команди; lint-staged — лише змінені файли', 'commitlint у commit-msg хуці', 'Хуки обходяться --no-verify, тому CI повторює перевірки'],
      followUps: ['Як написати власне правило ESLint?', 'Що краще класти в pre-commit, а що в pre-push?', 'Чим Biome відрізняється від ESLint + Prettier?']
    },
    {
      id: 'tool-ci-cd', why: ["Ні: Delivery готує реліз, Deployment викатує автоматично.","Так: кеш і паралельність пришвидшують пайплайн.","Ні: у CI потрібен npm ci — точні версії з lock-файлу.","Ні: артефакт збирають раз і просувають між середовищами.","Ні: preview — окреме оточення для PR, а не частковий реліз."],
      group: 'quality-ci',
      type: 'theory',
      level: 2,
      title: 'CI/CD для фронтенду',
      tags: ['ci'],
      question: 'Як виглядає типовий CI/CD-пайплайн фронтенд-проєкту? Як його пришвидшити? Що таке preview deployments?',
      choices: ['Continuous Delivery і Continuous Deployment — синоніми: обидва означають автодеплой кожного мерджу в прод', 'Кеш залежностей за хешем lock-файлу, паралельні джоби та шардинг e2e помітно пришвидшують пайплайн', 'У CI краще `npm install`, ніж `npm ci`: він швидший і заодно оновлює lock-файл до свіжих версій', 'Під кожне середовище (staging, prod) артефакт варто збирати заново, щоб уникнути розбіжностей між ними', 'Preview deployment — це викатка в прод на частину користувачів, щоб перевірити фічу на реальному трафіку'],
      correct: 1,
      hint: 'Кроки від push до продакшену, кеш залежностей, паралельність, середовища.',
      answer: '\n**CI (Continuous Integration)** — кожен push/PR автоматично перевіряється. **CD** — Continuous Delivery (артефакт завжди готовий до релізу, деплой кнопкою) або Continuous Deployment (кожен мердж у main автоматично йде в прод).\n\n**Типовий пайплайн (GitHub Actions, GitLab CI):**\n```yaml\njobs:\n  check:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 20, cache: npm }\n      - run: npm ci\n      - run: npm run lint\n      - run: npm run typecheck\n      - run: npm test -- --coverage\n      - run: npm run build\n```\nДалі: e2e-тести (Playwright) на зібраному застосунку, деплой (статичний хостинг/CDN, Docker-образ), інвалідація кешу CDN.\n\n**Як пришвидшити:**\n- **кешування** залежностей (`~/.npm`, pnpm store) за хешем lock-файлу; кеш збірки (Turborepo remote cache, Nx);\n- **паралельні джоби** (lint, unit, typecheck одночасно), шардинг e2e (`--shard=1/4`);\n- запуск лише для змінених пакетів у монорепо (affected);\n- `concurrency` зі скасуванням застарілих запусків для тієї самої гілки.\n\n**Preview deployments** (Vercel, Netlify, Cloudflare Pages або власні): кожен PR отримує окремий URL з розгорнутою версією. Дизайнери/QA/PM перевіряють зміни до мерджу; на preview можна ганяти e2e та Lighthouse.\n\n**Хороші практики:** обов\'язкові перевірки (branch protection) перед мерджем; секрети — у сховищі секретів CI, не в репо; однакова версія Node локально і в CI (`.nvmrc`, `engines`); артефакт збирається **один раз** і просувається між середовищами (staging → prod); швидкий rollback (попередня версія статики/образу); моніторинг після релізу (Sentry, Web Vitals), feature flags і поступовий rollout.\n',
      keyPoints: ['CI: install → lint → typecheck → test → build → e2e на кожен PR', 'CD: delivery vs deployment, деплой артефакту, rollback', 'Пришвидшення: кеш за хешем lock-файлу, паралельні джоби, шардинг, affected', 'Preview deployments для кожного PR', 'Branch protection, секрети в CI, однакова версія Node'],
      followUps: ['Як зробити так, щоб падіння e2e не блокувало через flaky-тести?', 'Як організувати rollback статичного фронтенду?', 'Чим Continuous Delivery відрізняється від Continuous Deployment?']
    },
    {
      id: 'tool-devtools', why: ["Ні: long task — задача довша за 50 мс.","Так: logpoint логує без зміни коду.","Ні: Disable cache діє лише з відкритими DevTools.","Так: порівняння знімків показує, що росте.","Ні: можна зупинятися й на перехоплених помилках."],
      group: 'quality-ci',
      type: 'theory',
      level: 2,
      title: 'Робота з DevTools: дебаг, мережа, продуктивність, пам\'ять',
      tags: ['devtools', 'debugging'],
      question: 'Як ви використовуєте браузерні DevTools у щоденній роботі? Опишіть, як шукаєте баг, повільний запит, проблему продуктивності та витік пам\'яті. Оберіть **усі** правильні твердження.',
      choices: ['Long task у вкладці Performance — це будь-яке завдання на main thread, довше за 16 мс', 'Logpoint у Sources виводить значення в консоль без зміни коду й без зупинки виконання', 'Галочка Disable cache у Network вимикає HTTP-кеш браузера назавжди, навіть із закритими DevTools', 'Щоб знайти витік памʼяті, порівнюють два heap snapshots і шукають detached DOM-елементи та їхні retainers', 'Pause on exceptions зупиняє лише на неперехоплених помилках — перехоплені в `try/catch` не побачити'],
      correct: [1, 3],
      hint: 'Пройдіться по вкладках: Elements, Console, Sources, Network, Performance, Memory, Application, Lighthouse.',
      answer: '\n**Elements** — DOM і стилі в реальному часі: обчислені стилі, box model, які правила перекрито і чому (специфічність), стани `:hover`/`:focus`, Flexbox/Grid-оверлеї, Accessibility-дерево.\n\n**Console** — не лише `console.log`: `console.table`, `console.dir`, `console.time`/`timeEnd`, `console.trace`; `$0` — виділений елемент; `copy()`; Live expressions.\n\n**Sources (дебагер)** — ефективніше за `console.log`:\n- breakpoints: звичайні, **умовні**, **logpoints** (лог без зміни коду), на DOM-зміни, на XHR/fetch за URL, на події, «pause on exceptions» (включно з caught);\n- покрокове виконання, Scope, Call Stack (включно з async-стеком), Watch;\n- `debugger;` у коді; **Ignore list** для node_modules; локальні overrides; source maps показують вихідний код.\n\n**Network** — статус, заголовки (кешування, CORS), payload/response, таймінги (DNS, TLS, TTFB, завантаження), водоспад, ініціатор запиту; throttling (Slow 4G), `Disable cache`, блокування запиту, «Copy as fetch/cURL», експорт HAR.\n\n**Performance** — запис профілю: main thread flame chart, long tasks (>50 мс), Layout/Recalculate Style (layout thrashing), Paint, що блокує INP; CPU throttling для імітації слабких пристроїв. Live-метрики Core Web Vitals (LCP, INP, CLS). **Lighthouse** — аудит продуктивності, доступності, SEO.\n\n**Memory** — heap snapshot і порівняння двох знімків (до і після дії) для пошуку витоків: шукаємо **Detached DOM-елементи**, обʼєкти, що ростуть після кожного циклу відкрити/закрити; Retainers показують, хто тримає посилання (часто — забутий слухач подій, таймер або замикання). Allocation timeline.\n\n**Application** — localStorage/sessionStorage/IndexedDB/cookies (атрибути `HttpOnly`, `SameSite`), Service Workers, Cache Storage, manifest.\n\n**Типовий workflow багу:** відтворити → Console/Network (чи є помилки, що повернув сервер) → breakpoint у місці підозри (або на exception) → перевірити стан у Scope → виправити → написати тест, що ловить цей баг.\n',
      keyPoints: ['Sources: умовні breakpoints, logpoints, pause on exceptions, async call stack', 'Network: таймінги, заголовки кешування/CORS, throttling, Copy as cURL', 'Performance: long tasks, layout thrashing, CPU throttling, Web Vitals', 'Memory: порівняння heap snapshots, detached DOM, retainers', 'Elements/Application: стилі та специфічність, сховища і cookies'],
      followUps: ['Як знайти, хто змінює певний атрибут DOM-елемента?', 'Як знайти витік пам\'яті в SPA після переходів між сторінками?', 'Що таке long task і як його розбити?']
    }
  ]
});
