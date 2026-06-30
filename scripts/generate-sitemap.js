#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────
   generate-sitemap.js
   Generates sitemap.xml from pre-rendered pages and content JSON.
   Prioritises pre-rendered static URLs over hash-based ones.
   Run: node scripts/generate-sitemap.js
   ───────────────────────────────────────────────────────── */

var fs = require('fs');
var path = require('path');

var BASE = 'https://kallolchakraborty.github.io/git-bytes';
var CONTENT_DIR = path.join(__dirname, '..', 'content');
var OUTPUT = path.join(__dirname, '..', 'sitemap.xml');

var ROUTE_ORDER = [
  'git/git-basics.json',
  'git/branching-merging.json',
  'git/remotes-collaboration.json',
  'git/rebasing-advanced.json',
  'git/git-internals.json',
  'github/repos-issues.json',
  'github/pull-requests.json',
  'github/github-pages.json',
  'github/actions-fundamentals.json',
  'github/projects-wikis.json',
  'github-advanced/rest-api.json',
  'github-advanced/graphql-api.json',
  'github-advanced/github-cli.json',
  'github-advanced/security-dependabot.json',
  'github-advanced/packages.json',
  'opensource/forking-workflow.json',
  'opensource/community-management.json',
  'opensource/licensing-governance.json',
  'devops/actions-advanced.json',
  'devops/runner-architecture.json',
  'devops/deployment-pipelines.json',
  'devops/copilot.json',
  'devops/actions-cost-optimization.json',
  'career/best-practices.json',
  'career/portfolio-tips.json',
  'career/interview-qa.json',
  'career/patterns-antipatterns.json',
  'git-scale/monorepo-management.json',
  'git-scale/git-internals-deep.json',
  'git-scale/merge-queue.json',
  'git-scale/trunk-vs-multi-repo.json',
  'git-scale/incident-debugging.json',
  'enterprise/enterprise-admin.json',
  'enterprise/policy-as-code.json',
  'enterprise/api-automation.json',
  'enterprise/supply-chain-security.json',
  'enterprise/gitops.json',
  'enterprise/audit-log-streaming.json',
  'leadership/rfc-adr.json',
  'leadership/release-engineering.json',
  'leadership/dx-engineering.json',
  'leadership/staff-interview-questions.json',
  'leadership/git-culture-strategy.json',
];

var urls = [];

/* Static pages */
urls.push({ loc: BASE + '/', priority: '1.0', changefreq: 'weekly' });
urls.push({ loc: BASE + '/docs.html', priority: '0.9', changefreq: 'weekly', lastmod: null });

/* Category hub pages */
var CATEGORY_SLUGS = [
  'git', 'github', 'open-source', 'devops', 'career', 'git-at-scale', 'enterprise', 'leadership'
];
CATEGORY_SLUGS.forEach(function (slug) {
  urls.push({ loc: BASE + '/docs/' + slug + '/', priority: '0.6', changefreq: 'weekly' });
});

/* Pre-rendered guide pages */
ROUTE_ORDER.forEach(function (relPath) {
  var fullPath = path.join(CONTENT_DIR, relPath);
  try {
    var data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    var id = data.id || relPath.replace('.json', '').replace(/^.*\//, '');
    var lastmod = (data.lastModified || data.datePublished || '').split('T')[0];
    urls.push({
      loc: BASE + '/docs/' + id + '/',
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: lastmod || undefined
    });
  } catch (e) {
    console.error('Warning: Could not read ' + relPath + ': ' + e.message);
  }
});

/* Generate XML */
var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
urls.forEach(function (u) {
  xml += '  <url>\n    <loc>' + u.loc + '</loc>\n';
  if (u.lastmod) xml += '    <lastmod>' + u.lastmod + '</lastmod>\n';
  xml += '    <changefreq>' + u.changefreq + '</changefreq>\n';
  xml += '    <priority>' + u.priority + '</priority>\n  </url>\n';
});
xml += '</urlset>\n';

fs.writeFileSync(OUTPUT, xml, 'utf-8');
console.log('sitemap.xml generated with ' + urls.length + ' URLs');
