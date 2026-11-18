/*
 * Глобальний реєстр контенту.
 * data/_topics.js описує розділи та теми (структура й порядок),
 * data/<topic-id>.js наповнює тему завданнями через FE.topic(id, {...}).
 */
(function () {
  'use strict';

  var FE = (window.FE = window.FE || {});
  FE.sections = FE.sections || [];
  FE.topics = FE.topics || {};
  FE.topicOrder = FE.topicOrder || [];
  FE.items = FE.items || [];
  FE.byId = FE.byId || {};
  FE.loadErrors = FE.loadErrors || [];

  FE.LEVELS = {
    1: { short: 'Junior', label: 'Junior', name: 'Легко' },
    2: { short: 'Middle', label: 'Middle', name: 'Середньо' },
    3: { short: 'Strong', label: 'Strong Middle', name: 'Складно' },
    4: { short: 'Senior', label: 'Senior', name: 'Хардкор' }
  };

  FE.TYPES = {
    code: { label: 'Код', icon: '</>' },
    dom: { label: 'DOM / CSS', icon: '◧' },
    quiz: { label: 'Квіз', icon: '?' },
    theory: { label: 'Теорія', icon: '¶' }
  };

  /** Оголошення розділів і тем (викликається один раз у data/_topics.js). */
  FE.AREAS = [{ id: 'frontend', title: 'Фронтенд' }, { id: 'backend', title: 'Бекенд' }];
  FE.defineSections = function (sections) {
    sections.forEach(function (section) {
      FE.sections.push({
        id: section.id,
        title: section.title,
        icon: section.icon || '',
        color: section.color || '',
        about: section.about || '',
        status: section.status || 'active', // 'soon' — курс заплановано, модулів ще немає
        area: section.area || 'frontend',   // великий розділ: frontend | backend
        topics: []
      });
      var sec = FE.sections[FE.sections.length - 1];
      section.topics.forEach(function (t) {
        var topic = {
          id: t.id,
          title: t.title,
          section: section.id,
          short: t.short || t.title,
          about: t.about || '',
          framework: t.framework || null, // модуль для конкретного фреймворку (react | vue)
          intro: '',
          items: []
        };
        FE.topics[t.id] = topic;
        FE.topicOrder.push(t.id);
        sec.topics.push(t.id);
      });
    });
  };

  /** Наповнення теми завданнями (викликається у data/<topic-id>.js). */
  FE.topic = function (topicId, data) {
    var topic = FE.topics[topicId];
    if (!topic) {
      FE.loadErrors.push('Невідома тема "' + topicId + '" — додайте її в data/_topics.js');
      return;
    }
    FE.filledTopics = FE.filledTopics || {};
    FE.filledTopics[topicId] = true;
    if (data.intro) topic.intro = data.intro;
    // Кроки (групи) теми: [{ id, title, lesson }] — короткий урок перед практикою.
    topic.groups = (data.groups || []).map(function (g, i) {
      return { id: g.id, title: g.title, lesson: g.lesson || '', index: i };
    });
    (data.items || []).forEach(function (raw, index) {
      var item = Object.assign({}, raw);
      item.topic = topicId;
      item.index = topic.items.length;
      if (!item.id) {
        FE.loadErrors.push(topicId + ': завдання #' + (index + 1) + ' без id');
        return;
      }
      if (FE.byId[item.id]) {
        FE.loadErrors.push('Дублікат id "' + item.id + '" (' + topicId + ' та ' + FE.byId[item.id].topic + ')');
        return;
      }
      if (item.type === 'code' || item.type === 'dom') {
        item.tests = (item.tests || []).map(function (t) {
          return typeof t === 'string' ? { name: t, code: t } : t;
        });
      }
      topic.items.push(item);
      FE.items.push(item);
      FE.byId[item.id] = item;
    });
  };

  /** Послідовне завантаження файлів даних (працює і з file://). */
  FE.loadData = function (basePath, onDone) {
    var files = (FE.dataFiles || FE.topicOrder).slice();
    if (!FE.dataFiles && FE.bookFiles) files = files.concat(FE.bookFiles); // розділи підручника
    var pending = files.length;
    if (!pending) return onDone();
    files.forEach(function (name) {
      var s = document.createElement('script');
      s.src = basePath + name + '.js';
      s.async = false; // зберігаємо порядок виконання
      s.onload = s.onerror = function (e) {
        if (e.type === 'error') FE.missingFiles = (FE.missingFiles || []).concat(name);
        else if (FE.topics[name] && !(FE.filledTopics || {})[name]) {
          // Файл завантажився, але FE.topic() не викликався — найімовірніше, синтаксична помилка.
          FE.loadErrors.push('data/' + name + '.js не виконався (синтаксична помилка?). Перевірте: node --check data/' + name + '.js');
        }
        if (--pending === 0) onDone();
      };
      document.head.appendChild(s);
    });
  };

  // Ловимо синтаксичні помилки у файлах даних, щоб показати їх, а не мовчки втратити тему.
  window.addEventListener('error', function (e) {
    if (e.filename && /\/data\/[^/]+\.js/.test(e.filename)) {
      FE.loadErrors.push(e.filename.split('/data/')[1] + ':' + e.lineno + ' — ' + e.message);
    }
  });
})();
