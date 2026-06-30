#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────
   generate-category-pages.js
   Generates category hub pages at /docs/<category>/index.html
   listing all guides in each category as topic clusters.
   Run: node scripts/generate-category-pages.js
   ───────────────────────────────────────────────────────── */

var fs = require('fs');
var path = require('path');

var BASE = 'https://kallolchakraborty.github.io/git-bytes';
var ROOT = path.join(__dirname, '..');
var CONTENT_DIR = path.join(ROOT, 'content');
var OUTPUT_DIR = path.join(ROOT, 'docs');

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

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/* Group guides by category */
var categories = {};
ROUTE_ORDER.forEach(function (entry) {
  var filePath = path.join(CONTENT_DIR, entry.file);
  try {
    var data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    var cat = data.category || 'Other';
    if (!categories[cat]) categories[cat] = { label: cat, slug: cat.toLowerCase().replace(/\s+/g, '-'), guides: [] };
    categories[cat].guides.push({ id: data.id, title: data.title, description: data.description, tags: data.tags, readingTime: null });
  } catch (e) { console.error('Error reading ' + entry.file + ': ' + e.message); }
});

var docsHtml = fs.readFileSync(path.join(ROOT, 'docs.html'), 'utf-8');

/* Generate a page for each category */
Object.keys(categories).sort().forEach(function (catName) {
  var cat = categories[catName];
  var catSlug = cat.slug;

  var guideCards = cat.guides.map(function (guide, idx) {
    var desc = stripTags(guide.description);
    var snippet = desc.length > 160 ? desc.slice(0, 157) + '...' : desc;
    return '<a href="/docs/' + guide.id + '/" class="flex flex-col gap-2 p-4 rounded-xl border theme-border theme-bg hover:border-brand-500/30 hover:shadow-sm transition-all group">' +
      '<h3 class="text-sm font-semibold theme-text group-hover:text-brand-500 transition-colors">' + escapeHtml(guide.title) + '</h3>' +
      '<p class="text-xs theme-text-muted line-clamp-2">' + escapeHtml(snippet) + '</p>' +
      '<span class="text-xs font-semibold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-auto pt-1">Read Guide<span class="material-symbols-outlined text-[13px]">arrow_forward</span></span>' +
      '</a>';
  }).join('');

  /* Build page from docs.html template */
  var page = docsHtml;

  /* Update title */
  page = page.replace(
    '<title>git bytes — GitHub Study Guides & Documentation</title>',
    '<title>' + catName + ' Guides — git bytes</title>'
  );

  /* Update meta description */
  var metaDesc = 'Explore ' + cat.guides.length + ' ' + catName + ' study guides covering ' +
    cat.guides.map(function(g) { return g.title; }).join(', ') + '.';
  var metaDesc160 = metaDesc.length > 160 ? metaDesc.slice(0, 157) + '...' : metaDesc;
  page = page.replace(
    '<meta name="description" content="Access structured Git and GitHub study notes, cheat sheets, syntax references, and technical guides." />',
    '<meta name="description" content="' + escapeHtml(metaDesc160) + '" />'
  );

  /* Update OG meta */
  page = page.replace(
    '<meta property="og:title" content="git bytes — GitHub Study Guides &amp; Documentation" />',
    '<meta property="og:title" content="' + escapeHtml(catName) + ' Guides — git bytes" />'
  );
  page = page.replace(
    '<meta property="og:description" content="Access structured Git and GitHub study notes, cheat sheets, syntax references, and technical guides." />',
    '<meta property="og:description" content="' + escapeHtml(metaDesc160) + '" />'
  );
  page = page.replace(
    '<meta property="og:url" content="https://kallolchakraborty.github.io/git-bytes/docs.html" />',
    '<meta property="og:url" content="' + BASE + '/docs/' + catSlug + '/" />'
  );
  page = page.replace(
    '<meta name="twitter:title" content="git bytes — GitHub Study Guides &amp; Documentation" />',
    '<meta name="twitter:title" content="' + escapeHtml(catName) + ' Guides — git bytes" />'
  );
  page = page.replace(
    '<meta name="twitter:description" content="Access structured Git and GitHub study notes, cheat sheets, syntax references, and technical guides." />',
    '<meta name="twitter:description" content="' + escapeHtml(metaDesc160) + '" />'
  );

  /* Update canonical */
  page = page.replace(
    '<link rel="canonical" id="canonical-link" href="https://kallolchakraborty.github.io/git-bytes/docs.html" />',
    '<link rel="canonical" id="canonical-link" href="' + BASE + '/docs/' + catSlug + '/" />'
  );

  /* Convert sidebar hash links to absolute */
  page = page.replace(/href="#([^"]+)"/g, function (m, id) {
    return 'href="/docs/' + id + '/"';
  });

  /* Build category content */
  var articleHtml =
    '<article class="flex flex-col gap-6 docs-section">' +
      '<h1 class="text-3xl sm:text-4xl font-bold theme-text tracking-tight">' + escapeHtml(catName) + ' Study Guides</h1>' +
      '<p class="theme-text-muted leading-relaxed text-base">' + cat.guides.length + ' guides covering ' + escapeHtml(catName) + ' topics.</p>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">' + guideCards + '</div>' +
    '</article>';

  /* Replace content area */
  var contentStart = page.indexOf('<main id="docs-dynamic-content"');
  if (contentStart !== -1) {
    var innerStart = page.indexOf('>', contentStart) + 1;
    var mainEnd = page.indexOf('</main>', innerStart);
    if (mainEnd !== -1) {
      page = page.slice(0, innerStart) + articleHtml + page.slice(mainEnd);
    }
  }

  /* Write */
  var outDir = path.join(OUTPUT_DIR, catSlug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), page, 'utf-8');
  console.log('Generated /docs/' + catSlug + '/ (category hub)');
});

console.log('Done — ' + Object.keys(categories).length + ' category pages generated');
