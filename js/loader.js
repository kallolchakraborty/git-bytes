/* ─────────────────────────────────────────────────────────
   loader.js — Dynamic content rendering
   Fetches guide JSON, renders sections/code/diagrams,
   manages sidebar, outline, bookmarks, progress.
   ───────────────────────────────────────────────────────── */

var scrollSpyCleanup = null;          /* dispose fn for scroll-spy listener */
var _routeMap = window.__ROUTE_MAP || {};
var _currentAbort = null;            /* AbortController for in-flight fetch */

/* ── Tag badge colour palette (brand and neutral tones) ── */
var _TAG_COLORS = [
  '#E95420', '#C34113', '#BF360C', '#8D2606',
  '#F5A389', '#FF8A65', '#FFAB91', '#FFCCBC',
  '#D84315', '#3E2723', '#4E342E', '#5D4037',
  '#6D4C41', '#795548', '#8D6E63', '#A1887F', '#BCAAA4',
];

/* ────────────────────────────────────────────
   Tag colouring
   ──────────────────────────────────────────── */

/* Assign deterministic background/text colours to [data-tag] badges
   based on a hash of the tag string so colours are stable per tag. */
function colorizeTags(root) {
  (root || document).querySelectorAll('[data-tag]').forEach(function (el) {
    var tag = el.getAttribute('data-tag');
    var hash = 0;
    for (var i = 0; i < tag.length; i++) hash = ((hash << 5) - hash) + tag.charCodeAt(i);
    var c = _TAG_COLORS[Math.abs(hash) % _TAG_COLORS.length];
    el.style.setProperty('--tag-color', c);
    el.style.setProperty('--tag-bg', c + '1A');
    if (document.documentElement.classList.contains('dark')) {
      el.style.setProperty('--tag-bg', c + '2E');
    }
  });
}

/* ────────────────────────────────────────────
   Bookmarks & Progress (localStorage-persisted)
   ──────────────────────────────────────────── */

var _bookmarkCache = null;
var _progressCache = null;

function getBookmarks() {
  if (_bookmarkCache !== null) return _bookmarkCache;
  try {
    _bookmarkCache = JSON.parse(localStorage.getItem('gb_bookmarks')) || [];
  } catch (_) {
    _bookmarkCache = [];
  }
  return _bookmarkCache;
}

function saveBookmarks(list) {
  _bookmarkCache = list;
  localStorage.setItem('gb_bookmarks', JSON.stringify(list));
}

function getProgress() {
  if (_progressCache !== null) return _progressCache;
  try {
    _progressCache = JSON.parse(localStorage.getItem('gb_progress')) || [];
  } catch (_) {
    _progressCache = [];
  }
  return _progressCache;
}

function saveProgress(list) {
  _progressCache = list;
  localStorage.setItem('gb_progress', JSON.stringify(list));
}

/* ── Toggle bookmark for a given hash ── */
function toggleBookmark(hash) {
  var list = getBookmarks();
  var idx = list.indexOf(hash);
  if (idx > -1) list.splice(idx, 1);
  else list.push(hash);
  saveBookmarks(list);
  updateBookmarkUI(hash);
  updateSidebarBookmarks();
  updateSidebarLinksUI();
}
window.toggleBookmark = toggleBookmark;

/* ── Toggle completion status for a given hash ── */
function toggleProgress(hash) {
  var list = getProgress();
  var idx = list.indexOf(hash);
  if (idx > -1) list.splice(idx, 1);
  else list.push(hash);
  saveProgress(list);
  updateProgressUI(hash);
  updateSidebarProgress();
  updateSidebarLinksUI();
}
window.toggleProgress = toggleProgress;

/* ── Reflect bookmark state in the article toolbar ── */
function updateBookmarkUI(hash) {
  if (window.location.hash !== hash) return;
  var btn = document.getElementById('btn-bookmark');
  if (!btn) return;
  var icon = btn.querySelector('.material-symbols-outlined');
  if (!icon) return;
  var active = getBookmarks().includes(hash);
  icon.textContent = active ? 'star' : 'star_border';
  btn.classList.toggle('text-amber-500', active);
  btn.classList.toggle('border-amber-500/40', active);
  btn.classList.toggle('bg-amber-500/5', active);
  btn.classList.toggle('text-slate-400', !active);
}

/* ── Reflect completion state in the article toolbar ── */
function updateProgressUI(hash) {
  if (window.location.hash !== hash) return;
  var btn = document.getElementById('btn-progress');
  if (!btn) return;
  var icon = btn.querySelector('.material-symbols-outlined');
  var text = btn.querySelector('.progress-btn-text');
  if (!icon || !text) return;
  var active = getProgress().includes(hash);
  icon.textContent = active ? 'check_circle' : 'circle';
  text.textContent = active ? 'Completed' : 'Mark as Done';
  icon.classList.toggle('text-emerald-500', active);
  icon.classList.toggle('text-slate-400', !active);
  btn.classList.toggle('text-emerald-600', active);
  btn.classList.toggle('border-emerald-500/40', active);
  btn.classList.toggle('bg-emerald-500/5', active);
}

/* ── Update sidebar progress bar & stats ── */
function updateSidebarProgress() {
  var list = getProgress();
  var total = Object.keys(_routeMap).length;
  var done = list.filter(function (h) { return _routeMap[h]; }).length;
  var pct = total > 0 ? Math.round((done / total) * 100) : 0;
  var textEl = document.getElementById('sidebar-progress-text');
  var barEl = document.getElementById('sidebar-progress-bar');
  var statsEl = document.getElementById('sidebar-progress-stats');
  if (textEl) textEl.textContent = pct + '%';
  if (barEl) barEl.style.width = pct + '%';
  if (statsEl) statsEl.textContent = done + ' of ' + total + ' topics completed';
}

/* ── Render bookmarked items in the sidebar ── */
function updateSidebarBookmarks() {
  var container = document.getElementById('sidebar-bookmarks-container');
  var list = document.getElementById('sidebar-bookmarks-list');
  if (!container || !list) return;
  var valid = getBookmarks().filter(function (h) { return _routeMap[h]; });
  if (valid.length === 0) { container.classList.add('hidden'); return; }
  container.classList.remove('hidden');
  list.innerHTML = valid.map(function (hash) {
    var title = hash;
    var entry = (window.__SEARCH_INDEX || []).find(function (e) { return e.url === 'docs.html' + hash; });
    if (entry) {
      title = entry.title;
      if (title.length > 24) title = title.slice(0, 22) + '...';
    }
    return '<a href="' + hash + '" class="sidebar-link !py-1 flex items-center justify-between hover:text-brand-500">' +
      '<span class="truncate">' + title + '</span>' +
      '<span class="material-symbols-outlined text-[12px] text-amber-500">star</span></a>';
  }).join('');
}

/* ── Show/hide green completion indicators on sidebar links ── */
function updateSidebarLinksUI() {
  var list = getProgress();
  document.querySelectorAll('.sidebar-link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    var done = list.includes(href);
    var indicator = link.querySelector('.completion-indicator');
    if (done) {
      if (!indicator) {
        indicator = document.createElement('span');
        indicator.className = 'completion-indicator material-symbols-outlined text-[13px] text-emerald-500 ml-auto shrink-0';
        indicator.textContent = 'check_circle';
        link.appendChild(indicator);
      } else {
        indicator.classList.remove('hidden');
      }
    } else if (indicator) {
      indicator.classList.add('hidden');
    }
  });
}

/* ────────────────────────────────────────────
   Metadata helpers
   ──────────────────────────────────────────── */

/* Estimate reading time & difficulty based on tags/title */
function calcMeta(data) {
  var text = (data.description || '') + ' ' + (data.details || '');
  var clean = text.replace(/<[^>]*>/g, ' ');
  var words = clean.split(/\s+/).filter(Boolean).length;

  var codeBlocks = 0;
  if (data.sections) data.sections.forEach(function (s) { if (s.codeBlock) codeBlocks++; });
  if (data.codeBlock) codeBlocks++;

  var readingMin = Math.max(1, Math.round((words / 200) + (codeBlocks * 0.25)));
  var tags = (data.tags || []).map(function (t) { return t.toLowerCase(); });
  var title = (data.title || '').toLowerCase();
  var adv = tags.includes('faang') || tags.includes('staff+') || tags.includes('enterprise') ||
            title.includes('staff+') || title.includes('enterprise');
  var inter = !adv && (tags.includes('advanced') || tags.includes('scale') ||
            title.includes('advanced') || title.includes('scale'));

  var difficulty = 'Foundational';
  var diffColor = 'text-emerald-500 border-emerald-500/20 bg-emerald-550/5';
  var diffIcon = 'signal_cellular_1_bar';
  if (adv) {
    difficulty = 'Advanced / Staff+';
    diffColor = 'text-purple-500 border-purple-500/20 bg-purple-550/5';
    diffIcon = 'signal_cellular_4_bar';
  } else if (inter) {
    difficulty = 'Intermediate';
    diffColor = 'text-amber-500 border-amber-500/20 bg-amber-550/5';
    diffIcon = 'signal_cellular_3_bar';
  }
  return { time: readingMin, difficulty: difficulty, diffColor: diffColor, diffIcon: diffIcon };
}

/* ────────────────────────────────────────────
   Related topics — scores by shared tags
   ──────────────────────────────────────────── */

function getRelatedTopics(currentHash, currentTags, currentCategory) {
  if (!currentTags || !currentTags.length) return [];
  var index = window.__SEARCH_INDEX || [];
  var currentUrl = 'docs.html' + currentHash;
  var scored = [];
  index.forEach(function (item) {
    if (item.url === currentUrl) return;
    var common = 0;
    (item.tags || []).forEach(function (t) { if (currentTags.includes(t)) common++; });
    if (common > 0) scored.push({ item: item, score: common + (item.category === currentCategory ? 0.5 : 0) });
  });
  scored.sort(function (a, b) { return b.score - a.score; });
  return scored.slice(0, 3).map(function (r) { return r.item; });
}

/* Render "Related Study Guides" cards below the article */
function renderRelated(currentHash, currentTags, currentCategory) {
  var items = getRelatedTopics(currentHash, currentTags, currentCategory);
  if (!items.length) return '';
  var cards = items.map(function (item) {
    var hash = item.url.slice(item.url.indexOf('#'));
    return '<a href="' + hash + '" class="related-topic-card flex flex-col gap-2 p-4 rounded-xl border theme-border theme-bg group cursor-pointer">' +
      '<span class="text-[9px] font-bold theme-text-muted uppercase tracking-wider">' + item.category + '</span>' +
      '<h4 class="text-sm font-semibold theme-text group-hover:text-brand-500 transition-colors">' + item.title + '</h4>' +
      '<p class="text-xs theme-text-muted line-clamp-2 flex-1">' + item.description + '</p>' +
      '<span class="text-xs font-semibold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">Read Guide<span class="material-symbols-outlined text-[13px]">arrow_forward</span></span></a>';
  }).join('');
  return '<div class="mt-8 border-t theme-border pt-6">' +
    '<h3 class="text-xs font-bold theme-text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5 select-none">' +
    '<span class="material-symbols-outlined text-[16px] text-brand-500">grid_view</span> Related Study Guides</h3>' +
    '<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">' + cards + '</div></div>';
}

/* ────────────────────────────────────────────
   Fetch with sessionStorage cache + retry
   ──────────────────────────────────────────── */

async function fetchWithCache(path, signal) {
  var cacheKey = 'gb:' + path;
  /* try sessionStorage hit first */
  try {
    var cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      var parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (_) {}

  var lastErr;
  for (var attempt = 1; attempt <= 3; attempt++) {
    try {
      var res = await fetch(path, { signal: signal, cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to fetch content (status ' + res.status + ')');
      var data = await res.json();
      try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); } catch (_) {}
      return data;
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      lastErr = err;
      if (attempt < 3) await new Promise(function (r) { return setTimeout(r, Math.min(1000, 200 * attempt)); });
    }
  }
  throw lastErr;
}

/* ────────────────────────────────────────────
   HTML rendering helpers
   ──────────────────────────────────────────── */

/* Build a styled code-block wrapper with language label and copy button */
function codeBlock(code, langClass, langName) {
  var name = langName || 'code';
  return '<div class="border theme-border theme-bg rounded-xl overflow-hidden text-sm leading-relaxed code-block-wrapper">' +
    '<div class="code-block-header flex items-center justify-between px-4 py-2 border-b theme-border">' +
    '<span class="code-lang-label text-xs font-medium uppercase tracking-wider">' + name + '</span>' +
    '<button onclick="copyCode(this)" class="copy-btn flex items-center gap-1.5 text-xs transition-colors"><span class="material-symbols-outlined text-sm" aria-hidden="true">content_copy</span> Copy</button>' +
    '</div>' +
    '<pre class="p-4 m-0 overflow-x-auto ' + langClass + '"><code class="' + langClass + '">' + escapeHtml(code) + '</code></pre></div>';
}

/* Wrap bare <svg> elements in a styled container for consistent layout */
function wrapDiagrams(container) {
  if (!container) return;
  container.querySelectorAll('svg').forEach(function (svg) {
    if (svg.closest('.diagram-wrapper, iframe, .code-block-wrapper, button, nav')) return;
    if (svg.parentElement && svg.parentElement.classList.contains('diagram-wrapper')) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'diagram-wrapper';
    svg.parentNode.insertBefore(wrapper, svg);
    wrapper.appendChild(svg);
  });
}

/* Fade-up animation on diagram wrappers as they scroll into view */
function animateDiagrams(container) {
  if (!container) return;
  var wrappers = container.querySelectorAll('.diagram-wrapper');
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('anim-ready');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  wrappers.forEach(function (w, i) {
    /* if already visible, animate immediately (staggered) */
    if (w.getBoundingClientRect().top < window.innerHeight) {
      setTimeout(function () { w.classList.add('anim-ready'); }, i * 100);
    } else {
      obs.observe(w);
    }
  });
}

/* Run Prism.js highlighting on code blocks; retry until Prism is loaded */
function highlightWithPrism(container, callback) {
  if (!container) { if (callback) callback(); return; }
  var retries = 0;
  var MAX_RETRIES = 50; /* ~5s */

  function tryHighlight() {
    if (typeof Prism !== 'undefined') {
      if (container.querySelector('pre code')) Prism.highlightAllUnder(container);
      if (callback) callback();
    } else if (++retries < MAX_RETRIES) {
      setTimeout(tryHighlight, 100);
    } else if (callback) {
      callback(); /* give up but still fire the callback */
    }
  }
  tryHighlight();
}

/* Upgrade bare <pre><code> blocks (from JSON fields like description/details)
   into full code-block-wrappers with headers, language detection, copy button */
function enhanceCodeBlocks(container) {
  if (!container) return;
  container.querySelectorAll('pre').forEach(function (pre) {
    if (pre.closest('.code-block-wrapper, iframe, .diagram-wrapper')) return;
    var code = pre.querySelector(':scope > code');
    if (!code) return;
    var text = code.textContent || '';

    /* detect language from class, then fall back to content heuristics */
    var lang = '';
    var m = code.className && code.className.match(/language-(\w+)/);
    if (m) lang = m[1];
    if (!lang) {
      if (/^(git |curl |# |\$ )/m.test(text)) lang = 'bash';
      else if (/^(import |const |function |def )/m.test(text)) lang = text.includes('def ') ? 'python' : 'javascript';
      else if (/^(\w+:\s|---\n)/m.test(text)) lang = 'yaml';
      else lang = 'bash';
    }
    code.className = (code.className || '') + ' language-' + lang;
    pre.className = (pre.className || '') + ' language-' + lang;

    /* build wrapper and header */
    var wrapper = document.createElement('div');
    wrapper.className = 'border theme-border theme-bg rounded-xl overflow-hidden text-sm leading-relaxed code-block-wrapper';
    var header = document.createElement('div');
    header.className = 'code-block-header flex items-center justify-between px-4 py-2 border-b theme-border';
    header.innerHTML = '<span class="code-lang-label text-xs font-medium uppercase tracking-wider">' + lang + '</span>' +
      '<button onclick="copyCode(this)" class="copy-btn flex items-center gap-1.5 text-xs transition-colors"><span class="material-symbols-outlined text-sm" aria-hidden="true">content_copy</span> Copy</button>';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);

    /* highlight this specific block */
    highlightWithPrism(null, function () { Prism.highlightElement(code); });
  });
}

/* Simple HTML entity escape */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* Strip dangerous HTML (XSS defence) */
function sanitizeHtml(html) {
  var doc = document.implementation.createHTMLDocument('');
  doc.body.innerHTML = html;
  var all = doc.body.querySelectorAll('*');
  Array.from(all).forEach(function (el) {
    Array.from(el.attributes).forEach(function (attr) {
      if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
      if (attr.name === 'href' && /^\s*javascript:/i.test(attr.value)) el.removeAttribute('href');
    });
  });
  Array.from(doc.body.querySelectorAll('script, iframe, object, embed')).forEach(function (el) { el.remove(); });
  return doc.body.innerHTML;
}

/* ────────────────────────────────────────────
   Toast notification
   ──────────────────────────────────────────── */

function showToast(msg) {
  var old = document.getElementById('clipboard-toast');
  if (old) old.remove();
  var toast = document.createElement('div');
  toast.id = 'clipboard-toast';
  toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-black/90 theme-bg backdrop-blur-md text-white border border-slate-700/50 px-4 py-2.5 rounded-xl shadow-xl text-sm font-sans font-medium transition-all duration-300 transform translate-y-10 opacity-0';
  toast.innerHTML = '<span class="material-symbols-outlined text-[18px] text-emerald-400" aria-hidden="true">check_circle</span><span>' + msg + '</span>';
  document.body.appendChild(toast);
  requestAnimationFrame(function () { toast.classList.remove('translate-y-10', 'opacity-0'); });
  setTimeout(function () {
    toast.classList.add('translate-y-10', 'opacity-0');
    setTimeout(function () { toast.remove(); }, 300);
  }, 2200);
}

/* Copy button handler (exposed globally for inline onclick) */
function copyCode(btn) {
  var wrapper = btn.closest('.code-block-wrapper');
  var codeEl = wrapper && wrapper.querySelector('code');
  if (!codeEl) return;
  navigator.clipboard.writeText(codeEl.textContent).then(function () {
    var orig = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined text-sm text-emerald-500">check</span> Copied!';
    btn.disabled = true;
    showToast('Code copied to clipboard!');
    setTimeout(function () { btn.innerHTML = orig; btn.disabled = false; }, 2000);
  }).catch(function (err) { console.error('Failed to copy: ', err); });
}
window.copyCode = copyCode;

/* ────────────────────────────────────────────
   Section rendering
   Iterates guide sections, producing titled content + optional code blocks.
   ──────────────────────────────────────────── */

function renderSections(sections, dataId, langClass, dataLang) {
  if (!sections) return '';
  return '<div class="flex flex-col gap-8">' + sections.map(function (section, idx) {
    var sectionId = 'section-' + dataId + '-' + idx;
    var slc = section.language ? 'language-' + section.language : langClass;
    var sln = section.language || dataLang || 'code';
    var titleHtml = section.title
      ? '<h3 class="text-xl font-semibold theme-text">' + section.title + '</h3>'
      : '';
    return '<div id="' + sectionId + '" class="scroll-mt-24 flex flex-col gap-3">' + titleHtml +
      (section.description ? '<div class="theme-text-muted text-sm leading-relaxed">' + section.description + '</div>' : '') +
      (section.codeBlock ? codeBlock(section.codeBlock, slc, sln) : '') + '</div>';
  }).join('\n') + '</div>';
}

/* ────────────────────────────────────────────
   Right-side outline (smooth-scroll on click)
   ──────────────────────────────────────────── */

function setupOutlineSmoothScroll() {
  var outline = document.getElementById('docs-right-outline');
  if (!outline) return;
  outline.addEventListener('click', function (e) {
    var link = e.target.closest('.outline-link');
    if (!link) return;
    var targetId = link.getAttribute('href');
    var el = document.querySelector(targetId);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
}

/* ── Scroll-spy: highlight the active outline link based on scroll position ── */
function setupOutlineScrollSpy() {
  var links = Array.from(document.querySelectorAll('.outline-link'));
  if (!links.length) return null;

  var sections = links.map(function (link) { return document.querySelector(link.getAttribute('href')); }).filter(Boolean);
  if (!sections.length) return null;

  function update() {
    var scrollPos = window.scrollY + 120;

    /* bottom of page → activate last link */
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50) {
      links.forEach(function (l, i) { l.classList.toggle('active-outline', i === links.length - 1); });
      return;
    }

    var active = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= scrollPos) active = sections[i];
      else break;
    }
    if (!active && sections.length) active = sections[0];

    if (active) {
      var id = active.getAttribute('id');
      links.forEach(function (l) { l.classList.toggle('active-outline', l.getAttribute('href') === '#' + id); });
    }
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () { update(); ticking = false; });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  update();

  return function () { window.removeEventListener('scroll', onScroll); };
}

/* ────────────────────────────────────────────
   Core: loadContent(hash)
   Fetches guide JSON, renders full article,
   runs all post-processing (code, diagrams, etc.)
   ──────────────────────────────────────────── */

async function loadContent(hash) {
  /* tear down previous state */
  if (scrollSpyCleanup) { scrollSpyCleanup(); scrollSpyCleanup = null; }
  if (_currentAbort) { _currentAbort.abort(); }
  _currentAbort = new AbortController();
  var signal = _currentAbort.signal;

  var path = _routeMap[hash] || _routeMap['#git-basics'];
  var contentArea = document.getElementById('docs-dynamic-content');
  if (!contentArea) return;

  /* skeleton loading placeholder */
  contentArea.innerHTML = '<div class="animate-pulse space-y-6"><div class="h-8 theme-bg-subtle rounded w-3/4"></div><div class="h-4 theme-bg-subtle rounded w-1/2"></div><div class="h-40 theme-bg-subtle rounded"></div><div class="h-4 theme-bg-subtle rounded w-5/6"></div></div>';

  /* show left sidebar & right outline */
  var left = document.getElementById('left-sidebar');
  var outline = document.getElementById('docs-right-outline');
  if (left) left.style.display = '';
  if (outline) outline.parentElement.style.display = '';

  try {
    var data = await fetchWithCache(path, signal);
    var langClass = data.language ? 'language-' + data.language : 'theme-text';
    var dataLang = data.language || 'code';

    /* ── Build main content HTML ── */
    var embedCode = '';
    var isInteractive = data.interactive === true;

    if (isInteractive && data.sections) {
      /* interactive guides embed an iframe + sections below */
      embedCode = '<div class="w-full aspect-auto h-[530px] md:aspect-[16/12] md:h-auto border theme-border rounded-2xl overflow-hidden shadow-lg theme-bg">' +
        '<iframe src="' + data.id + '.html" class="w-full h-full border-none" allowfullscreen aria-label="' + (data.title || 'Interactive') + '"></iframe></div>';
      embedCode += renderSections(data.sections, data.id, langClass, dataLang);
    } else if (data.sections) {
      embedCode = renderSections(data.sections, data.id, langClass, dataLang);
    } else if (data.timeline) {
      /* timeline-style layout (e.g. Git History) */
      var items = '';
      for (var ti = 0; ti < data.timeline.length; ti++) {
        var t = data.timeline[ti];
        items += '<div class="timeline-entry" style="animation-delay:' + (ti * 80) + 'ms"><div class="timeline-dot"><span class="timeline-dot-year">' + t.year + '</span><span class="timeline-dot-ring"></span></div>' +
          '<div class="timeline-body"><div class="flex items-center gap-2 mb-1"><h4 class="timeline-title">' + t.title + '</h4><span class="timeline-tag">' + (t.tag || '') + '</span></div><p class="timeline-event">' + t.event + '</p></div></div>';
      }
      embedCode = '<div id="section-syntax" class="scroll-mt-24 mt-4"><div class="timeline-track">' + items + '</div></div>';
      if (data.codeBlock) embedCode += '<div class="mt-6">' + codeBlock(data.codeBlock, langClass, dataLang) + '</div>';
    } else {
      embedCode = '<div id="section-syntax" class="scroll-mt-24">' + (data.codeBlock ? codeBlock(data.codeBlock, langClass, dataLang) : '') + '</div>';
    }

    var meta = calcMeta(data);
    var relatedHtml = renderRelated(hash, data.tags, data.category);

    /* ── Render the full article ── */
    contentArea.innerHTML =
      '<article class="flex flex-col gap-5 docs-section" role="region" aria-label="' + (data.title || '') + '">' +
        /* ─ header: breadcrumb + action toolbar ─ */
        '<div class="flex flex-col gap-3">' +
          '<div class="flex items-center justify-between gap-4 flex-wrap select-none">' +
            '<nav class="flex items-center gap-1.5 text-[10px] font-bold theme-text-muted uppercase tracking-wider">' +
              '<span>' + data.category + '</span>' +
              '<span class="material-symbols-outlined text-[12px] theme-text-muted">chevron_right</span>' +
              '<span class="text-brand-500">' + data.subcategory + '</span>' +
            '</nav>' +
            '<div class="flex items-center gap-2" id="article-actions-toolbar">' +
              '<button onclick="toggleBookmark(\'' + hash + '\')" id="btn-bookmark" class="w-8 h-8 rounded-lg border theme-border text-slate-400 hover:text-amber-500 hover:border-amber-500/30 flex items-center justify-center transition-all theme-bg" aria-label="Pin this guide"><span class="material-symbols-outlined text-[18px]">star_border</span></button>' +
              '<button onclick="toggleProgress(\'' + hash + '\')" id="btn-progress" class="h-8 px-3 rounded-lg border theme-border text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 flex items-center gap-1.5 text-[11px] font-semibold transition-all theme-bg"><span class="material-symbols-outlined text-[16px] text-slate-400">circle</span><span class="progress-btn-text">Mark as Done</span></button>' +
              '<button onclick="window.print()" class="w-8 h-8 rounded-lg border theme-border text-slate-400 hover:text-brand-500 hover:border-brand-500/30 flex items-center justify-center transition-all theme-bg" aria-label="Print"><span class="material-symbols-outlined text-[18px]">print</span></button>' +
            '</div>' +
          '</div>' +
          '<h1 class="text-3xl sm:text-4xl font-bold theme-text tracking-tight">' + data.title + '</h1>' +
          /* meta: reading time + difficulty badge */
          '<div class="flex flex-wrap items-center gap-3 text-xs theme-text-muted select-none">' +
            '<span class="inline-flex items-center gap-1"><span class="material-symbols-outlined text-[16px] text-slate-400">schedule</span><span>' + meta.time + ' min read</span></span>' +
            '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ' + meta.diffColor + '">' +
              '<span class="material-symbols-outlined text-[12px]">' + meta.diffIcon + '</span><span>' + meta.difficulty + '</span>' +
            '</span>' +
          '</div>' +
          /* tag badges */
          (data.tags && data.tags.length
            ? '<div class="flex flex-wrap gap-1.5 mt-0.5">' + data.tags.map(function (t) { return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider tag-badge cursor-default" data-tag="' + t + '">' + t + '</span>'; }).join('') + '</div>'
            : '') +
        '</div>' +
        /* description */
        '<p class="theme-text-muted leading-relaxed text-base">' + data.description + '</p>' +
        /* cheat sheet (collapsible) */
        (data.cheatSheet
          ? '<details class="cheat-sheet mt-6"><summary><span class="material-symbols-outlined text-[16px]" aria-hidden="true">quick_reference</span> Staff+ Cheat Sheet<span class="material-symbols-outlined text-[16px] ml-auto">expand_more</span></summary><div class="cheat-sheet-body">' + data.cheatSheet + '</div></details>'
          : '') +
        /* main content (sections / timeline) */
        embedCode +
        /* deep-dive collapsible */
        (data.details
          ? '<div id="section-dive" class="scroll-mt-24"><details class="group border theme-border theme-bg-subtle rounded-xl overflow-hidden transition-all duration-300">' +
              '<summary class="flex items-center justify-between p-4 font-bold text-sm theme-text cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">' +
                '<span class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-brand-500">lightbulb</span><span>Deep Dive &amp; Key Takeaways</span></span>' +
                '<span class="material-symbols-outlined text-[18px] transition-transform duration-200 group-open:rotate-180 text-slate-400">expand_more</span>' +
              '</summary>' +
              '<div class="px-5 pb-5 pt-2 theme-text-muted text-sm leading-relaxed border-t theme-border font-sans">' + data.details + '</div>' +
            '</details></div>'
          : '') +
        relatedHtml +
      '</article>';

    /* ── Update bookmark / progress UI ── */
    updateBookmarkUI(hash);
    updateProgressUI(hash);
    updateSidebarProgress();
    updateSidebarBookmarks();
    updateSidebarLinksUI();

    /* ── Colour tag badges ── */
    colorizeTags(contentArea);

    /* ── Set active sidebar link ── */
    document.querySelectorAll('.sidebar-section').forEach(function (s) { s.classList.remove('section-active'); });
    document.querySelectorAll('.sidebar-link').forEach(function (link) {
      if (link.getAttribute('href') === hash) {
        link.classList.add('active-doc-link');
        link.setAttribute('aria-current', 'page');
        var section = link.closest('.sidebar-section');
        if (section) section.classList.add('section-active');
      } else {
        link.classList.remove('active-doc-link');
        link.removeAttribute('aria-current');
      }
    });

    /* ── Build right-side outline from section titles ── */
    var outlineArea = document.getElementById('docs-right-outline');
    if (outlineArea) {
      outlineArea.innerHTML = '';
      if (data.sections) {
        data.sections.forEach(function (section, idx) {
          if (!section.title) return;
          outlineArea.innerHTML += '<a href="#section-' + data.id + '-' + idx + '" class="outline-link">' + section.title + '</a>';
        });
      }
      if (data.details) {
        outlineArea.innerHTML += '\n<a href="#section-dive" class="outline-link">Deep Dive</a>';
      }
      setupOutlineSmoothScroll();
      scrollSpyCleanup = setupOutlineScrollSpy();
    }

    /* ── Post-processing ── */
    highlightWithPrism(contentArea);
    enhanceCodeBlocks(contentArea);
    wrapDiagrams(contentArea);
    animateDiagrams(contentArea);

    /* ── Entrance animations (deferred to next frame) ── */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        try {
          if (!contentArea || !data) return;
          var article = contentArea.querySelector('article');
          if (article) article.classList.add('anim-ready');

          if (data.sections) {
            data.sections.forEach(function (_, i) {
              var sec = document.getElementById('section-' + data.id + '-' + i);
              if (sec) sec.classList.add('anim-ready');
            });
          }
          var syn = document.getElementById('section-syntax');
          if (syn) syn.classList.add('anim-ready');
          var dive = document.getElementById('section-dive');
          if (dive) {
            if (dive.getBoundingClientRect().top < window.innerHeight) {
              dive.classList.add('anim-ready');
            } else {
              var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                  if (entry.isIntersecting) { entry.target.classList.add('anim-ready'); obs.unobserve(entry.target); }
                });
              }, { threshold: 0.15 });
              obs.observe(dive);
            }
          }
        } catch (e) {
          if (e.name !== 'AbortError') console.warn('Animation error:', e);
        }
      });
    });
  } catch (error) {
    contentArea.innerHTML =
      '<div class="p-6 border-2 border-red-200 bg-red-50 rounded-xl text-red-600 text-sm">' +
        '<h3 class="font-bold mb-1">Error Loading Document</h3>' +
        '<p>Failed to load: ' + path + '. Error: ' + error.message + '</p>' +
      '</div>';
  }
}

/* ────────────────────────────────────────────
   Initialisation on DOMContentLoaded
   ──────────────────────────────────────────── */

window.addEventListener('DOMContentLoaded', function () {
  var initialHash = window.location.hash || '#git-basics';
  loadContent(initialHash);
  updateSidebarProgress();
  updateSidebarBookmarks();
  updateSidebarLinksUI();

  /* ── Print: force light theme during print, restore after ── */
  var isDarkBeforePrint = false;
  window.addEventListener('beforeprint', function () {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      isDarkBeforePrint = true;
    }
  });
  window.addEventListener('afterprint', function () {
    if (isDarkBeforePrint) { document.documentElement.classList.add('dark'); isDarkBeforePrint = false; }
  });

  /* ── Reading progress bar (top of viewport) ── */
  (function () {
    var bar = document.getElementById('reading-progress-bar');
    if (!bar) return;
    var ticking = false;
    function updateProgress() {
      var article = document.getElementById('docs-dynamic-content');
      if (!article) { bar.style.transform = 'scaleX(0)'; ticking = false; return; }
      var top = article.offsetTop || 0;
      var h = article.scrollHeight || 1;
      var vh = window.innerHeight;
      var scrollable = top + h - vh;
      if (scrollable <= 0) { bar.style.transform = 'scaleX(1)'; ticking = false; return; }
      var pct = Math.min(1, Math.max(0, ((window.scrollY - top + vh * 0.1) / scrollable)));
      bar.style.transform = 'scaleX(' + pct.toFixed(3) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; } }, { passive: true });
    window.addEventListener('hashchange', function () { setTimeout(updateProgress, 300); });
    updateProgress();
  })();
});

/* ── Navigate to a new guide on hash change ── */
window.addEventListener('hashchange', function () {
  loadContent(window.location.hash);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── React when theme changes (re-colour tags, refresh sidebar) ── */
window.addEventListener('theme-changed', function () {
  colorizeTags();
  updateSidebarLinksUI();
});
