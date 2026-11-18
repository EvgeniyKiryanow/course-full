/*
 * Мінімальний markdown → HTML з підсвіткою коду (CodeMirror.runMode).
 * Підтримка: заголовки, абзаци, **жирний**, *курсив*, `код`, ```блоки```, списки (вкладені),
 * таблиці, цитати, посилання, ---.
 */
(function () {
  'use strict';

  var MODE_ALIASES = {
    js: 'javascript', javascript: 'javascript', mjs: 'javascript', ts: 'javascript', typescript: 'javascript', jsx: 'jsx', tsx: 'jsx',
    json: { name: 'javascript', json: true },
    html: 'htmlmixed', xml: 'xml', svg: 'xml',
    css: 'css', scss: 'css'
  };

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function highlight(code, lang) {
    var mode = MODE_ALIASES[(lang || '').toLowerCase()];
    if (!mode || !window.CodeMirror || !CodeMirror.runMode) return escapeHtml(code);
    var out = '';
    try {
      CodeMirror.runMode(code, mode, function (text, style) {
        var t = escapeHtml(text);
        if (style) {
          out += '<span class="' + style.split(' ').map(function (s) { return 'cm-' + s; }).join(' ') + '">' + t + '</span>';
        } else {
          out += t;
        }
      });
      return out;
    } catch (e) {
      return escapeHtml(code);
    }
  }

  // ------------------------------------------------------------ inline
  function inline(text) {
    var tokens = [];
    var stash = function (html) {
      tokens.push(html);
      return '\u0000' + (tokens.length - 1) + '\u0000';
    };
    var s = String(text);
    // inline code: `code` або ``code з ` всередині``
    s = s.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, function (all, ticks, code) {
      var c = code;
      if (ticks.length > 1) c = c.replace(/^ /, '').replace(/ $/, '');
      return stash('<code class="ic">' + escapeHtml(c) + '</code>');
    });
    s = escapeHtml(s);
    // links
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (all, label, url) {
      var safe = /^(https?:|#|\/|\.\/|mailto:)/i.test(url) ? url : '#';
      return stash('<a href="' + safe + '" target="_blank" rel="noopener noreferrer">' + label + '</a>');
    });
    s = s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__([^_]+?)__/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
    s = s.replace(/(^|[^_\w])_([^_\s][^_]*?)_(?!\w)/g, '$1<em>$2</em>');
    s = s.replace(/~~([^~]+?)~~/g, '<del>$1</del>');
    s = s.replace(/\u0000(\d+)\u0000/g, function (all, i) { return tokens[Number(i)]; });
    return s;
  }

  // ------------------------------------------------------------ blocks
  function dedent(text) {
    var lines = String(text).replace(/\r\n?/g, '\n').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    var min = Infinity;
    lines.forEach(function (l) {
      if (!l.trim()) return;
      var m = l.match(/^ */)[0].length;
      if (m < min) min = m;
    });
    if (!isFinite(min) || min === 0) return lines;
    return lines.map(function (l) { return l.slice(min); });
  }

  function isTableSep(line) {
    return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
  }
  function splitRow(line) {
    var l = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    var cells = [];
    var cur = '';
    var inCode = false;
    for (var i = 0; i < l.length; i++) {
      var ch = l[i];
      if (ch === '`') inCode = !inCode;
      if (ch === '\\' && l[i + 1] === '|') { cur += '|'; i++; continue; }
      if (ch === '|' && !inCode) { cells.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  }

  var LIST_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;

  function parseList(lines, start) {
    // Повертає { html, next }
    var first = lines[start].match(LIST_RE);
    var baseIndent = first[1].length;
    var ordered = /\d/.test(first[2]);
    var startNum = ordered ? parseInt(first[2], 10) : 1;
    var items = [];
    var i = start;
    while (i < lines.length) {
      var line = lines[i];
      var m = line.match(LIST_RE);
      if (m && m[1].length === baseIndent) {
        items.push({ text: [m[3]], children: [] });
        i++;
        continue;
      }
      if (!line.trim()) {
        // порожній рядок: продовжуємо список, якщо далі той самий рівень
        var nxt = lines[i + 1];
        var nm = nxt && nxt.match(LIST_RE);
        if (nm && nm[1].length >= baseIndent) { i++; continue; }
        if (nxt && /^\s+/.test(nxt) && nxt.match(/^\s*/)[0].length > baseIndent && items.length) {
          items[items.length - 1].children.push('');
          i++;
          continue;
        }
        break;
      }
      var indent = line.match(/^\s*/)[0].length;
      if (indent > baseIndent && items.length) {
        items[items.length - 1].children.push(line);
        i++;
        continue;
      }
      if (m && m[1].length < baseIndent) break;
      if (!m && items.length && indent <= baseIndent && !/^\s*(```|#|>|\|)/.test(line)) {
        // ліниве продовження абзацу пункту
        items[items.length - 1].text.push(line.trim());
        i++;
        continue;
      }
      break;
    }
    var tag = ordered ? 'ol' : 'ul';
    var html = '<' + tag + (ordered && startNum !== 1 ? ' start="' + startNum + '"' : '') + '>';
    items.forEach(function (it) {
      var body = inline(it.text.join(' '));
      if (it.children.length) body += renderBlocks(dedentKeep(it.children));
      html += '<li>' + body + '</li>';
    });
    html += '</' + tag + '>';
    return { html: html, next: i };
  }

  function dedentKeep(lines) {
    var min = Infinity;
    lines.forEach(function (l) {
      if (!l.trim()) return;
      var m = l.match(/^ */)[0].length;
      if (m < min) min = m;
    });
    if (!isFinite(min)) min = 0;
    return lines.map(function (l) { return l.slice(min); });
  }

  function renderBlocks(lines) {
    var html = '';
    var i = 0;
    var para = [];
    function flushPara() {
      if (para.length) {
        html += '<p>' + inline(para.join('\n')).replace(/\n/g, ' ') + '</p>';
        para = [];
      }
    }
    while (i < lines.length) {
      var line = lines[i];
      var fence = line.match(/^\s*(```+|~~~+)\s*([\w+-]*)\s*$/);
      if (fence) {
        flushPara();
        var marker = fence[1];
        var lang = fence[2] || '';
        var code = [];
        var indent = line.match(/^\s*/)[0].length;
        i++;
        while (i < lines.length && !new RegExp('^\\s*' + marker.replace(/[`~]/g, '\\$&') + '\\s*$').test(lines[i])) {
          code.push(lines[i].slice(Math.min(indent, lines[i].match(/^\s*/)[0].length)));
          i++;
        }
        i++;
        html += '<div class="code-block" data-lang="' + escapeHtml(lang) + '"><pre class="cm-s-fe"><code>' + highlight(code.join('\n'), lang) + '</code></pre></div>';
        continue;
      }
      if (!line.trim()) { flushPara(); i++; continue; }
      var h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        flushPara();
        var level = Math.min(6, h[1].length + 1); // # → h2 (h1 зарезервований за заголовком завдання)
        html += '<h' + level + '>' + inline(h[2].replace(/\s+#+\s*$/, '')) + '</h' + level + '>';
        i++;
        continue;
      }
      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { flushPara(); html += '<hr>'; i++; continue; }
      if (/^\s*>/.test(line)) {
        flushPara();
        var quote = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) {
          quote.push(lines[i].replace(/^\s*>\s?/, ''));
          i++;
        }
        html += '<blockquote>' + renderBlocks(quote) + '</blockquote>';
        continue;
      }
      if (/\|/.test(line) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        flushPara();
        var head = splitRow(line);
        var aligns = splitRow(lines[i + 1]).map(function (c) {
          if (/^:-+:$/.test(c)) return 'center';
          if (/^-+:$/.test(c)) return 'right';
          return '';
        });
        i += 2;
        var rows = [];
        while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim()) {
          rows.push(splitRow(lines[i]));
          i++;
        }
        var cellAttr = function (idx) { return aligns[idx] ? ' style="text-align:' + aligns[idx] + '"' : ''; };
        html += '<div class="table-wrap"><table><thead><tr>' +
          head.map(function (c, idx) { return '<th' + cellAttr(idx) + '>' + inline(c) + '</th>'; }).join('') +
          '</tr></thead><tbody>' +
          rows.map(function (r) {
            return '<tr>' + head.map(function (_, idx) { return '<td' + cellAttr(idx) + '>' + inline(r[idx] || '') + '</td>'; }).join('') + '</tr>';
          }).join('') +
          '</tbody></table></div>';
        continue;
      }
      if (LIST_RE.test(line) && (!para.length || line.match(LIST_RE)[1].length === 0)) {
        flushPara();
        var res = parseList(lines, i);
        html += res.html;
        i = res.next;
        continue;
      }
      para.push(line.trim());
      i++;
    }
    flushPara();
    return html;
  }

  function render(text) {
    if (text === undefined || text === null) return '';
    return renderBlocks(dedent(text));
  }

  window.MD = {
    render: render,
    inline: function (t) { return inline(String(t || '').trim()); },
    highlight: highlight,
    escape: escapeHtml
  };
})();
