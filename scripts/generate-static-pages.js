#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────
   generate-static-pages.js
   Pre-renders all 43 guides as standalone HTML files under
   docs/<id>/index.html — fully crawlable without JS.
   Run: node scripts/generate-static-pages.js
   ───────────────────────────────────────────────────────── */

var fs = require('fs');
var path = require('path');

var BASE = 'https://kallolchakraborty.github.io/git-bytes';
var ROOT = path.join(__dirname, '..');
var CONTENT_DIR = path.join(ROOT, 'content');
var OUTPUT_DIR = path.join(ROOT, 'docs');
var SIDEBAR_HASH_RE = /href="#([^"]+)"/g;

/* Ordered route map matching sidebar navigation order */
var ROUTE_ORDER = [
  { hash: '#git-basics', file: 'git/git-basics.json' },
  { hash: '#branching-merging', file: 'git/branching-merging.json' },
  { hash: '#remotes-collaboration', file: 'git/remotes-collaboration.json' },
  { hash: '#rebasing-advanced', file: 'git/rebasing-advanced.json' },
  { hash: '#git-internals', file: 'git/git-internals.json' },
  { hash: '#repos-issues', file: 'github/repos-issues.json' },
  { hash: '#pull-requests', file: 'github/pull-requests.json' },
  { hash: '#github-pages', file: 'github/github-pages.json' },
  { hash: '#actions-fundamentals', file: 'github/actions-fundamentals.json' },
  { hash: '#projects-wikis', file: 'github/projects-wikis.json' },
  { hash: '#rest-api', file: 'github-advanced/rest-api.json' },
  { hash: '#graphql-api', file: 'github-advanced/graphql-api.json' },
  { hash: '#github-cli', file: 'github-advanced/github-cli.json' },
  { hash: '#security-dependabot', file: 'github-advanced/security-dependabot.json' },
  { hash: '#packages', file: 'github-advanced/packages.json' },
  { hash: '#forking-workflow', file: 'opensource/forking-workflow.json' },
  { hash: '#community-management', file: 'opensource/community-management.json' },
  { hash: '#licensing-governance', file: 'opensource/licensing-governance.json' },
  { hash: '#actions-advanced', file: 'devops/actions-advanced.json' },
  { hash: '#runner-architecture', file: 'devops/runner-architecture.json' },
  { hash: '#deployment-pipelines', file: 'devops/deployment-pipelines.json' },
  { hash: '#copilot', file: 'devops/copilot.json' },
  { hash: '#actions-cost-optimization', file: 'devops/actions-cost-optimization.json' },
  { hash: '#best-practices', file: 'career/best-practices.json' },
  { hash: '#portfolio-tips', file: 'career/portfolio-tips.json' },
  { hash: '#interview-qa', file: 'career/interview-qa.json' },
  { hash: '#patterns-antipatterns', file: 'career/patterns-antipatterns.json' },
  { hash: '#monorepo-management', file: 'git-scale/monorepo-management.json' },
  { hash: '#git-internals-deep', file: 'git-scale/git-internals-deep.json' },
  { hash: '#merge-queue', file: 'git-scale/merge-queue.json' },
  { hash: '#trunk-vs-multi-repo', file: 'git-scale/trunk-vs-multi-repo.json' },
  { hash: '#incident-debugging', file: 'git-scale/incident-debugging.json' },
  { hash: '#enterprise-admin', file: 'enterprise/enterprise-admin.json' },
  { hash: '#policy-as-code', file: 'enterprise/policy-as-code.json' },
  { hash: '#api-automation', file: 'enterprise/api-automation.json' },
  { hash: '#supply-chain-security', file: 'enterprise/supply-chain-security.json' },
  { hash: '#gitops', file: 'enterprise/gitops.json' },
  { hash: '#audit-log-streaming', file: 'enterprise/audit-log-streaming.json' },
  { hash: '#rfc-adr', file: 'leadership/rfc-adr.json' },
  { hash: '#release-engineering', file: 'leadership/release-engineering.json' },
  { hash: '#dx-engineering', file: 'leadership/dx-engineering.json' },
  { hash: '#staff-interview-questions', file: 'leadership/staff-interview-questions.json' },
  { hash: '#git-culture-strategy', file: 'leadership/git-culture-strategy.json' },
];

/* ── Helpers ── */

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function calcMeta(data) {
  var text = (data.description || '') + ' ' + (data.details || '');
  var words = stripTags(text).split(/\s+/).filter(Boolean).length;
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

function renderCodeBlock(code, lang) {
  var langName = lang || 'code';
  var langClass = lang ? 'language-' + lang : 'theme-text';
  return '<div class="border theme-border theme-bg rounded-xl overflow-hidden text-sm leading-relaxed code-block-wrapper">' +
    '<div class="code-block-header flex items-center justify-between px-4 py-2 border-b theme-border">' +
    '<span class="code-lang-label text-xs font-medium uppercase tracking-wider">' + langName + '</span>' +
    '<button onclick="copyCode(this)" class="copy-btn flex items-center gap-1.5 text-xs transition-colors">' +
    '<span class="material-symbols-outlined text-sm" aria-hidden="true">content_copy</span> Copy</button></div>' +
    '<pre class="p-4 m-0 overflow-x-auto ' + langClass + '"><code class="' + langClass + '">' + escapeHtml(code) + '</code></pre></div>';
}

function renderSections(sections, dataId, langClass, dataLang) {
  if (!sections) return '';
  return '<div class="flex flex-col gap-8">' + sections.map(function (section, idx) {
    var sectionId = 'section-' + dataId + '-' + idx;
    var slc = section.language ? 'language-' + section.language : langClass;
    var sln = section.language || dataLang || 'code';
    var titleHtml = section.title
      ? '<h3 class="text-xl font-semibold theme-text">' + escapeHtml(section.title) + '</h3>'
      : '';
    return '<div id="' + sectionId + '" class="scroll-mt-24 flex flex-col gap-3">' + titleHtml +
      (section.description ? '<div class="theme-text-muted text-sm leading-relaxed">' + section.description + '</div>' : '') +
      (section.codeBlock ? renderCodeBlock(section.codeBlock, slc, sln) : '') + '</div>';
  }).join('\n') + '</div>';
}

function renderTimeline(data) {
  var items = '';
  for (var ti = 0; ti < data.timeline.length; ti++) {
    var t = data.timeline[ti];
    items += '<div class="timeline-entry" style="animation-delay:' + (ti * 80) + 'ms">' +
      '<div class="timeline-dot"><span class="timeline-dot-year">' + t.year + '</span>' +
      '<span class="timeline-dot-ring"></span></div>' +
      '<div class="timeline-body"><div class="flex items-center gap-2 mb-1">' +
      '<h4 class="timeline-title">' + t.title + '</h4>' +
      '<span class="timeline-tag">' + (t.tag || '') + '</span></div>' +
      '<p class="timeline-event">' + t.event + '</p></div></div>';
  }
  var html = '<div id="section-syntax" class="scroll-mt-24 mt-4"><div class="timeline-track">' + items + '</div></div>';
  if (data.codeBlock) html += '<div class="mt-6">' + renderCodeBlock(data.codeBlock, data.language) + '</div>';
  return html;
}

function getAdjacentGuides(hash) {
  var idx = ROUTE_ORDER.findIndex(function (e) { return e.hash === hash; });
  return {
    prev: idx > 0 ? ROUTE_ORDER[idx - 1] : null,
    next: idx < ROUTE_ORDER.length - 1 ? ROUTE_ORDER[idx + 1] : null
  };
}

function getGuideTitle(hash) {
  var entry = ROUTE_ORDER.find(function (e) { return e.hash === hash; });
  if (!entry) return null;
  try {
    var data = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, entry.file), 'utf-8'));
    return data.title || null;
  } catch (e) { return null; }
}

function buildArticleHTML(data, hash) {
  var langClass = data.language ? 'language-' + data.language : 'theme-text';
  var dataLang = data.language || 'code';

  /* Build embed content */
  var embedCode = '';
  var isInteractive = data.interactive === true;
  if (isInteractive && data.sections) {
    embedCode = '<div class="w-full aspect-auto h-[530px] md:aspect-[16/12] md:h-auto border theme-border rounded-2xl overflow-hidden shadow-lg theme-bg">' +
      '<iframe src="/docs/' + data.id + '/interactive.html" class="w-full h-full border-none" allowfullscreen aria-label="' + escapeHtml(data.title || 'Interactive') + '"></iframe></div>';
    embedCode += renderSections(data.sections, data.id, langClass, dataLang);
  } else if (data.sections) {
    embedCode = renderSections(data.sections, data.id, langClass, dataLang);
  } else if (data.timeline) {
    embedCode = renderTimeline(data);
  } else {
    embedCode = '<div id="section-syntax" class="scroll-mt-24">' +
      (data.codeBlock ? renderCodeBlock(data.codeBlock, langClass, dataLang) : '') + '</div>';
  }

  var meta = calcMeta(data);

  /* Tags */
  var tagsHtml = data.tags && data.tags.length
    ? '<div class="flex flex-wrap gap-1.5 mt-0.5">' +
      data.tags.map(function (t) {
        return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider tag-badge cursor-default" data-tag="' + escapeHtml(t) + '">' + escapeHtml(t) + '</span>';
      }).join('') + '</div>'
    : '';

  /* Cheat sheet */
  var cheatSheetHtml = data.cheatSheet
    ? '<details class="cheat-sheet mt-6"><summary><span class="material-symbols-outlined text-[16px]" aria-hidden="true">quick_reference</span> Staff+ Cheat Sheet<span class="material-symbols-outlined text-[16px] ml-auto">expand_more</span></summary><div class="cheat-sheet-body">' + data.cheatSheet + '</div></details>'
    : '';

  /* Deep dive */
  var deepDiveHtml = data.details
    ? '<div id="section-dive" class="scroll-mt-24"><details class="group border theme-border theme-bg-subtle rounded-xl overflow-hidden transition-all duration-300">' +
      '<summary class="flex items-center justify-between p-4 font-bold text-sm theme-text cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">' +
      '<span class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-brand-500">lightbulb</span><span>Deep Dive &amp; Key Takeaways</span></span>' +
      '<span class="material-symbols-outlined text-[18px] transition-transform duration-200 group-open:rotate-180 text-slate-400">expand_more</span></summary>' +
      '<div class="px-5 pb-5 pt-2 theme-text-muted text-sm leading-relaxed border-t theme-border font-sans">' + data.details + '</div></details></div>'
    : '';

  /* Prev / Next */
  var adj = getAdjacentGuides(hash);
  var prevNextHtml = adj.prev || adj.next
    ? '<div class="mt-8 pt-6 flex items-center justify-between gap-4 border-t theme-border">' +
      (adj.prev
        ? '<a href="/docs/' + adj.prev.hash.slice(1) + '/" class="flex items-center gap-2 text-sm theme-text-muted hover:text-brand-500 transition-colors group">' +
          '<span class="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-0.5">arrow_back</span>' +
          '<span class="truncate max-w-[200px]">' + escapeHtml(getGuideTitle(adj.prev.hash) || 'Previous Guide') + '</span></a>'
        : '<div></div>') +
      (adj.next
        ? '<a href="/docs/' + adj.next.hash.slice(1) + '/" class="flex items-center gap-2 text-sm theme-text-muted hover:text-brand-500 transition-colors group text-right">' +
          '<span class="truncate max-w-[200px]">' + escapeHtml(getGuideTitle(adj.next.hash) || 'Next Guide') + '</span>' +
          '<span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-0.5">arrow_forward</span></a>'
        : '<div></div>') +
      '</div>'
    : '';

  return '<article class="flex flex-col gap-5 docs-section" role="region" aria-label="' + escapeHtml(data.title) + '">' +
    '<div class="flex flex-col gap-3">' +
      '<div class="flex items-center justify-between gap-4 flex-wrap select-none">' +
        '<nav class="flex items-center gap-1.5 text-[10px] font-bold theme-text-muted uppercase tracking-wider">' +
          '<span>' + escapeHtml(data.category) + '</span>' +
          '<span class="material-symbols-outlined text-[12px] theme-text-muted">chevron_right</span>' +
          '<span class="text-brand-500">' + escapeHtml(data.subcategory || '') + '</span>' +
        '</nav>' +
        '<div class="flex items-center gap-2" id="article-actions-toolbar">' +
          '<button onclick="toggleBookmark(\'' + hash + '\')" id="btn-bookmark" class="w-8 h-8 rounded-lg border theme-border text-slate-400 hover:text-amber-500 hover:border-amber-500/30 flex items-center justify-center transition-all theme-bg" aria-label="Pin this guide"><span class="material-symbols-outlined text-[18px]">star_border</span></button>' +
          '<button onclick="toggleProgress(\'' + hash + '\')" id="btn-progress" class="h-8 px-3 rounded-lg border theme-border text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 flex items-center gap-1.5 text-[11px] font-semibold transition-all theme-bg"><span class="material-symbols-outlined text-[16px] text-slate-400">circle</span><span class="progress-btn-text">Mark as Done</span></button>' +
          '<button onclick="window.print()" class="w-8 h-8 rounded-lg border theme-border text-slate-400 hover:text-brand-500 hover:border-brand-500/30 flex items-center justify-center transition-all theme-bg" aria-label="Print"><span class="material-symbols-outlined text-[18px]">print</span></button>' +
        '</div>' +
      '</div>' +
      '<h1 class="text-3xl sm:text-4xl font-bold theme-text tracking-tight">' + escapeHtml(data.title) + '</h1>' +
      '<div class="flex flex-wrap items-center gap-3 text-xs theme-text-muted select-none">' +
        '<span class="inline-flex items-center gap-1"><span class="material-symbols-outlined text-[16px] text-slate-400">schedule</span><span>' + meta.time + ' min read</span></span>' +
        '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ' + meta.diffColor + '">' +
          '<span class="material-symbols-outlined text-[12px]">' + meta.diffIcon + '</span><span>' + meta.difficulty + '</span>' +
        '</span>' +
      '</div>' +
      tagsHtml +
    '</div>' +
    '<p class="theme-text-muted leading-relaxed text-base">' + data.description + '</p>' +
    cheatSheetHtml +
    embedCode +
    deepDiveHtml +
    prevNextHtml +
    '</article>';
}

function buildJsonLd(data, pageUrl) {
  var meta = calcMeta(data);
  var cleanDesc = stripTags(data.description);
  var desc160 = cleanDesc.length > 160 ? cleanDesc.slice(0, 157) + '...' : cleanDesc;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": pageUrl,
        "headline": data.title,
        "description": desc160,
        "proficiencyLevel": meta.difficulty,
        "timeRequired": meta.time + 'M',
        "datePublished": (data.datePublished || '2026-01-01').split('T')[0],
        "dateModified": (data.lastModified || data.datePublished || '2026-06-30').split('T')[0],
        "author": { "@id": BASE + "/#person" },
        "publisher": { "@type": "Person", "name": "Kallol Chakraborty" },
        "mainEntityOfPage": pageUrl,
        "about": (data.tags || []).map(function(t) { return { "@type": "Thing", "name": t }; }),
        "image": BASE + "/assets/og-preview.png"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE + "/" },
          { "@type": "ListItem", "position": 2, "name": data.category, "item": BASE + "/docs/" + data.id + "/" },
          { "@type": "ListItem", "position": 3, "name": data.title }
        ]
      }
    ]
  });
}

/* ── Main generation ── */

var docsHtml = fs.readFileSync(path.join(ROOT, 'docs.html'), 'utf-8');

ROUTE_ORDER.forEach(function (entry) {
  var hash = entry.hash;
  var filePath = path.join(CONTENT_DIR, entry.file);
  var guideId = hash.slice(1);

  try {
    var data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    var pageUrl = BASE + '/docs/' + guideId + '/';
    var desc = stripTags(data.description);
    var desc160 = desc.length > 160 ? desc.slice(0, 157) + '...' : desc;
    var desc200 = desc.length > 200 ? desc.slice(0, 197) + '...' : desc;

    /* Build the article HTML */
    var articleHtml = buildArticleHTML(data, hash);

    /* Build page from docs.html template */
    var page = docsHtml;

    /* Replace title */
    page = page.replace(
      '<title>git bytes — GitHub Study Guides & Documentation</title>',
      '<title>' + escapeHtml(data.title) + ' — git bytes</title>'
    );

    /* Replace meta description */
    page = page.replace(
      '<meta name="description" content="Access structured Git and GitHub study notes, cheat sheets, syntax references, and technical guides." />',
      '<meta name="description" content="' + escapeHtml(desc160) + '" />'
    );

    /* Replace OG/Twitter meta */
    page = page.replace(
      '<meta property="og:title" content="git bytes — GitHub Study Guides &amp; Documentation" />',
      '<meta property="og:title" content="' + escapeHtml(data.title) + ' — git bytes" />'
    );
    page = page.replace(
      '<meta property="og:description" content="Access structured Git and GitHub study notes, cheat sheets, syntax references, and technical guides." />',
      '<meta property="og:description" content="' + escapeHtml(desc200) + '" />'
    );
    page = page.replace(
      '<meta property="og:url" content="https://kallolchakraborty.github.io/git-bytes/docs.html" />',
      '<meta property="og:url" content="' + pageUrl + '" />'
    );
    page = page.replace(
      '<meta name="twitter:title" content="git bytes — GitHub Study Guides &amp; Documentation" />',
      '<meta name="twitter:title" content="' + escapeHtml(data.title) + ' — git bytes" />'
    );
    page = page.replace(
      '<meta name="twitter:description" content="Access structured Git and GitHub study notes, cheat sheets, syntax references, and technical guides." />',
      '<meta name="twitter:description" content="' + escapeHtml(desc200) + '" />'
    );

    /* Update canonical */
    page = page.replace(
      '<link rel="canonical" id="canonical-link" href="https://kallolchakraborty.github.io/git-bytes/docs.html" />',
      '<link rel="canonical" id="canonical-link" href="' + pageUrl + '" />'
    );

    /* Inject JSON-LD (after the canonical link) */
    var jsonLd = '<script type="application/ld+json">' + buildJsonLd(data, pageUrl) + '</script>';
    page = page.replace('</head>', jsonLd + '</head>');

    /* Convert sidebar hash links to absolute pre-rendered paths */
    var sidebarLinks = page.match(SIDEBAR_HASH_RE);
    if (sidebarLinks) {
      sidebarLinks.forEach(function (match) {
        var id = match.slice(7, -1); /* strip href=" and " */
        page = page.split(match).join('href="/docs/' + id + '/"');
      });
    }

    /* Replace the content area with pre-rendered content */
    /* Find and replace the skeleton loader/content area */
    var contentStart = page.indexOf('<main id="docs-dynamic-content"');
    if (contentStart !== -1) {
      /* Find the full main element and replace its inner content */
      var innerStart = page.indexOf('>', contentStart) + 1;
      /* Find the closing </main> */
      var mainEnd = page.indexOf('</main>', innerStart);
      if (mainEnd !== -1) {
        page = page.slice(0, innerStart) + articleHtml + page.slice(mainEnd);
      }
    }

    /* Write the file */
    var outDir = path.join(OUTPUT_DIR, guideId);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), page, 'utf-8');
    console.log('Generated /docs/' + guideId + '/index.html');

  } catch (e) {
    console.error('Error generating ' + guideId + ': ' + e.message);
  }
});

console.log('Done — ' + ROUTE_ORDER.length + ' static pages generated');
