# git bytes — Git & GitHub Study Guides

A modern, search-first documentation portal for Git, GitHub, DevOps, and engineering study resources — designed for FAANG/Staff+ interview preparation. Hosted on **GitHub Pages** with **pre-rendered static pages** for full SEO crawlability while preserving a rich SPA experience for JavaScript-enabled users.

---

## Features

- **43 study guides** across 9 phases (Git Fundamentals through Staff+ Leadership)
- **25 Staff+ Cheat Sheets** — concise command references, expert patterns, anti-patterns, and interview angles on core technical pages
- **Search-first** — fuzzy search with category/tag filtering (Ctrl+K); cheat sheet content is searchable
- **Dark/Light mode** — persistent theme toggle with system preference detection
- **Study progress tracking** — bookmark guides and track completion (localStorage-persisted)
- **Inline SVG diagrams** — detailed visual explanations in every guide, now with copyright watermark overlays
- **Reading progress bar** — tracks scroll position per guide
- **Code blocks** — syntax-highlighted (Prism.js) with copy-to-clipboard
- **Related topics** — contextual recommendations between guides
- **Pre-rendered static pages** — all 43 guides available as standalone HTML for SEO and JS-free browsing
- **Category hub pages** — topic cluster landing pages for each phase
- **Structured data** — TechArticle + BreadcrumbList JSON-LD per guide for rich search results
- **Full keyboard accessibility** — focus management on SPA navigation, skip-to-content

---

## Site Structure

```
github-bytes/
├── index.html                # Landing page — preconnect hints, JSON-LD WebSite+Person schema
├── docs.html                 # Documentation portal (3-column SPA layout)
│                             #   Dynamic SEO: title, description, OG/Twitter, canonical, JSON-LD
│                             #   Noscript fallback listing all 43 guides
│                             #   Preconnect + dns-prefetch + preload hints
├── docs/                     # Pre-rendered static pages (generated at build time)
│   ├── git-basics/           #   Each contains: standalone HTML with inline JSON-LD,
│   ├── branching-merging/    #   full article content, canonical link, meta tags,
│   ├── ...                   #   prev/next navigation, sidebar with absolute paths
│   ├── git/                  # Category hub: Phase 1 (lists all 5 guides with links)
│   ├── github/               # Category hub: Phase 2
│   ├── github-advanced/      # Category hub: Phase 3
│   ├── opensource/           # Category hub: Phase 4
│   ├── devops/               # Category hub: Phase 5
│   ├── career/               # Category hub: Phase 6
│   ├── git-scale/            # Category hub: Phase 7
│   ├── enterprise/           # Category hub: Phase 8
│   └── leadership/           # Category hub: Phase 9
├── sitemap.xml               # Auto-generated — 53 URLs with lastmod, priority, changefreq
├── robots.txt                # Points to sitemap.xml, disallows nothing
├── .nojekyll                 # GitHub Pages: disable Jekyll processing (preserves _files)
├── css/
│   ├── main.css              # Custom styles: theme utilities, code blocks, cheat sheets, transitions
│   ├── tailwind.css          # Locally purged Tailwind build (~23 KB)
│   └── tailwind-input.css    # Tailwind source with @apply directives and custom layers
├── js/
│   ├── loader.js             # Dynamic content loader + SEO meta injector + prev/next + a11y
│   ├── theme.js              # Dark/light toggle with system preference detection
│   ├── modals.js             # Share modal & search modal with fuzzy matching
│   └── generated.js          # Route map (43 hashes → content paths) + search index (auto-generated)
├── content/                  # JSON study guides (source of truth for all content)
│   ├── git/                  # Phase 1: Git Fundamentals (5 guides)
│   ├── github/               # Phase 2: GitHub Platform (5 guides)
│   ├── github-advanced/      # Phase 3: GitHub Advanced (5 guides)
│   ├── opensource/           # Phase 4: Open Source (3 guides)
│   ├── devops/               # Phase 5: DevOps & Automation (5 guides)
│   ├── career/               # Phase 6: Career & Best Practices (4 guides)
│   ├── git-scale/            # Phase 7: Git at Scale, Staff+ (5 guides)
│   ├── enterprise/           # Phase 8: Enterprise & Supply Chain (6 guides)
│   └── leadership/           # Phase 9: Staff+ Leadership (5 guides)
├── scripts/                  # Build tooling (Node.js)
│   ├── generate-static-pages.js     # Pre-renders 43 standalone HTML files from content JSON
│   ├── generate-category-pages.js   # Generates 8 category hub landing pages
│   ├── generate-sitemap.js           # Builds sitemap.xml from content JSON dates
│   ├── watermark-svgs.js             # Adds copyright overlay to all inline SVGs in content JSON
│   └── add-date-fields.js            # One-time script: adds datePublished/lastModified to all JSON
├── assets/
│   ├── logo.svg              # git bytes branding (used in nav)
│   └── og-preview.png        # Social preview image (1200×630)
├── package.json              # Build scripts: `npm run build` for full pipeline
├── tailwind.config.js        # Tailwind configuration with custom brand palette
└── LICENSE                   # MIT
```

---

## 43 Study Guides

| Phase | Topics |
|-------|--------|
| **1. Git Fundamentals** | Git Basics, Branching & Merging, Remotes & Collaboration, Rebasing & Advanced Git, Git Internals |
| **2. GitHub Platform** | Repos & Issues, Pull Requests & Code Review, GitHub Pages, Actions Fundamentals, Projects & Wikis |
| **3. GitHub Advanced** | REST API, GraphQL API, GitHub CLI (gh), Security & Dependabot, Packages & Registries |
| **4. Open Source** | Forking & Contribution Workflow, Community Management, Licensing & Governance |
| **5. DevOps** | Actions Advanced, Runner Architecture, Deployment Pipelines, Copilot, Cost Optimization |
| **6. Career** | Git Best Practices, Portfolio Tips, Interview Q&A, Patterns & Anti-Patterns |
| **7. Git at Scale (Staff+)** | Monorepo Management, Internals Deep Dive, Merge Queue, Trunk vs Multi-Repo, Incident Debugging |
| **8. Enterprise (Staff+)** | Enterprise Admin, Policy as Code, API Automation, Supply Chain Security, GitOps, Audit Log Streaming |
| **9. Leadership (Staff+)** | RFC & ADR, Release Engineering, DX Engineering, Staff+ Interview, Git Culture & Strategy |

### Staff+ Cheat Sheets

25 core technical pages include a collapsible **Staff+ Cheat Sheet** with:

| Section | Content |
|---------|---------|
| **Core Commands** | Essential commands with expert context (why, not just what) |
| **Staff+ Patterns** | Expert workflows and architectural insights |
| **Watch Outs** | Anti-patterns and pitfalls that catch senior engineers |
| **Interview Angle** | How the topic appears in FAANG system design rounds |

---

## Content JSON Structure

Each guide in `content/` is a JSON file with this structure:

```json
{
  "id": "git-basics",
  "title": "Git Basics",
  "description": "Full HTML content including inline SVGs, code blocks...",
  "category": "git",
  "tags": ["git", "basics", "vcs"],
  "phase": 1,
  "order": 1,
  "datePublished": "2026-06-01",
  "lastModified": "2026-06-15",
  "hasCheatSheet": true,
  "related": ["branching-merging", "remotes-collaboration"],
  "details": "Optional extended HTML details content",
  "sections": [
    {
      "title": "Section Title",
      "description": "Section HTML content (may contain SVGs)"
    }
  ]
}
```

The `__ROUTE_MAP` in `generated.js` maps 43 hashes to their content JSON paths — this is the single source of truth for ordering across the SPA, the pre-rendered pages, and the sitemap.

---

## Usage

Open `index.html` in any modern browser. All content loads dynamically from JSON files — no build step required for basic usage.

### Quick start
- Press `Ctrl+K` to search all guides (including cheat sheet content)
- Toggle dark mode with the sun/moon icon
- Bookmark guides and track progress (persisted in localStorage)
- Click **"Staff+ Cheat Sheet"** on any core page for an expert quick-reference
- Use `cat:` or `tag:` filter syntax in search (e.g., `cat:git tag:staff+`)
- Guides are accessible at `/docs/<guide-id>/` (pre-rendered, JS not required)
- Navigate sequentially via **Prev / Next** links at the bottom of each article

---

## SEO Architecture

The site uses a **hybrid pre-rendered + SPA** approach: all guides are generated as standalone HTML files at build time for search engine crawlability, while `docs.html` retains hash-based SPA navigation for interactive users.

### How it works

1. **Build-time**: `scripts/generate-static-pages.js` reads every JSON file in `content/`, renders it into a complete HTML document at `docs/<guide-id>/index.html` with:
   - Full article content in the `<main>` element
   - `<title>` and `<meta name="description">` specific to the guide
   - `<link rel="canonical">` pointing to the guide's canonical URL
   - `<meta property="og:*">` and `<meta name="twitter:*">` tags
   - Inline JSON-LD (`TechArticle` + `BreadcrumbList`)
   - Sidebar with absolute `/docs/<id>/` paths (works without JS)
   - Prev/Next navigation links in the correct sequence
   - Complete CSS and JS references for full SPA enhancement when JS loads

2. **Runtime (SPA)**: `loader.js` handles hash navigation:
   - On `hashchange`, fetches the content JSON, renders Markdown via Marked
   - Updates `document.title`, `<meta name="description">`, OG/Twitter tags dynamically
   - Updates `<link id="canonical-link">` to the current guide's canonical URL
   - Injects JSON-LD (`TechArticle` + `BreadcrumbList`) into `<head>`
   - Moves focus to the content area for screen reader accessibility

### SEO Feature Matrix

| Feature | Static Pages (`/docs/<id>/`) | SPA (`docs.html`) |
|---------|------------------------------|-------------------|
| **Title** | Inline `<title>` per guide | Dynamic via `loader.js` on hashchange |
| **Description** | Inline `<meta name="description">` | Dynamic via `loader.js` |
| **Canonical** | Static `<link rel="canonical">` | Dynamic via `#canonical-link` element |
| **OG / Twitter** | Inline meta tags per guide | Dynamic via `setMeta()` helper |
| **JSON-LD** | Inline `<script type="application/ld+json">` | Injected via `injectJsonLd()` |
| **Schema types** | TechArticle + BreadcrumbList + WebSite | Same (WebSite on home) |
| **Prev / Next** | Static links in footer | Dynamic based on route map order |
| **Focus mgmt** | N/A (full page load) | `content.focus()` on hashchange |
| **Noscript** | N/A | Complete `<noscript>` guide listing |
| **Resource hints** | preconnect + dns-prefetch + preload | Same |

### JSON-LD Schemas

Three schema types are used:

1. **TechArticle** (per guide) — title, description, author, publisher, `datePublished`, `dateModified`, `image`, `mainEntityOfPage`
2. **BreadcrumbList** (per guide) — up to 3 items: Home > Category > Guide (if guide page)
3. **WebSite** (homepage) — site name, URL, search action with `target` and `query-input`
4. **Person** (homepage) — author info with name and `sameAs` (LinkedIn URL)

### Sitemap

Auto-generated by `scripts/generate-sitemap.js`:

- **53 URLs**: 1 (home) + 1 (docs) + 8 (category hubs) + 43 (guides)
- Each URL includes `<lastmod>` from content JSON `datePublished`
- `<priority>` and `<changefreq>` set per page type:
  - Guides: `priority="0.8"` `changefreq="monthly"`
  - Category hubs: `priority="0.7"` `changefreq="weekly"`
  - Home/Docs: `priority="1.0"` `changefreq="weekly"`
- Referenced by `robots.txt` and discoverable via Search Console
- Must be resubmitted after any content change

### Canonical URLs

- **Home**: `https://kallolchakraborty.github.io/git-bytes/`
- **Docs SPA**: `https://kallolchakraborty.github.io/git-bytes/docs/<guide-id>/`
- **Pre-rendered**: Same as docs SPA — no duplicate content concerns
- **Dynamic**: `loader.js` updates `#canonical-link` `href` on every hash navigation

### Prev / Next Navigation

- Determined by the order in `__ROUTE_MAP` (`generated.js`), which mirrors `content/` directory sorting
- In the SPA: `loader.js` finds the current guide's index in the route map and renders prev/next links
- In static pages: each pre-rendered page includes prev/next links hard-coded with absolute paths
- Benefits: distributes link equity across all pages, improves crawl depth, enhances UX

### Google Search Console Setup

1. Add your site property in [Google Search Console](https://search.google.com/search-console)
2. Choose the **HTML tag** verification method
3. Copy the `<meta name="google-site-verification">` tag and paste it into both `index.html` and `docs.html` in the `<head>` section
4. Click **Verify**
5. Once verified, submit `sitemap.xml` under **Sitemaps**
6. Monitor indexing status under **Pages** and **Index Coverage**

---

## Anti-Scraping Measures

Three layers of anti-scraping protection, designed to deter unauthorized content reuse without degrading UX or SEO:

### 1. Cache Prevention

```html
<meta name="robots" content="index, follow, noarchive" />
```

Applied to both `index.html` and `docs.html`. Prevents Google from serving cached copies of pages, reducing the utility of scraping cached content from search results.

### 2. SVG Watermarking

All 42 inline SVG diagrams across the content JSON files are automatically watermarked at build time by `scripts/watermark-svgs.js`:

- Adds a semi-transparent dark bar (rgba(0,0,0,0.3)) at the bottom of each SVG
- Overlays white text: `git-bytes  © 2026`
- Preserves SVG readability and visual appearance
- Runs as part of the build pipeline: `npm run build` → `npm run watermark:svgs`
- Watermark is applied to the source JSON files, so it propagates to:
  - Pre-rendered static pages (inline in the HTML)
  - SPA-rendered content (from JSON via `loader.js`)
  - Any downstream consumption of the JSON

### 3. Legal Deterrence

Footer on all pages:
> © 2026 Kallol Chakraborty — All content protected under MIT license. Unauthorized scraping or reproduction is prohibited.

---

## Build Pipeline

The full build is a four-step pipeline orchestrated by `npm run build`:

```
npm run build:css    →   npm run watermark:svgs   →   npm run generate:static   →   npm run generate:categories   →   npm run generate:sitemap
```

### Step 1: CSS (`npm run build:css`)

```bash
npx tailwindcss -i css/tailwind-input.css -o css/tailwind.css --minify
```

- Processes `tailwind-input.css` through Tailwind CLI with content-purge against `*.html` and `*.js`
- Outputs a minified, production-ready `tailwind.css` (~23 KB)
- Custom brand colors and utilities defined in `tailwind.config.js`

### Step 2: SVG Watermarking (`npm run watermark:svgs`)

```bash
node scripts/watermark-svgs.js
```

- Recursively walks all JSON files in `content/`
- Finds every `<svg>...</svg>` element in `description`, `details`, and `sections[*].description` fields
- Extracts `viewBox` dimensions to calculate overlay placement
- Injects a semi-transparent attribution bar with `git-bytes  © 2026` text
- Saves the modified JSON files back to disk

### Step 3: Pre-rendered Static Pages (`npm run generate:static`)

```bash
node scripts/generate-static-pages.js
```

- Reads the `__ROUTE_MAP` from `generated.js`
- For each of the 43 guides:
  - Loads the content JSON
  - Reads the HTML template from `docs.html` (stripping SPA-specific interactive elements)
  - Injects: full article content, guide-specific meta tags, canonical URL, inline JSON-LD, prev/next links, sidebar with absolute paths
  - Writes to `docs/<guide-id>/index.html` (creating directories as needed)

### Step 4: Category Hub Pages (`npm run generate:categories`)

```bash
node scripts/generate-category-pages.js
```

- Groups guides by `category` field, sorted by `phase` and `order`
- For each of the 8 categories:
  - Generates a landing page at `docs/<category>/index.html`
  - Lists all guides in the category as linked cards
  - Includes category-level meta tags and JSON-LD
  - Links to sibling category hubs for cross-navigation

### Step 5: Sitemap (`npm run generate:sitemap`)

```bash
node scripts/generate-sitemap.js
```

- Iterates all content JSON files to extract `datePublished`
- Generates `<url>` entries for home, docs, all 8 categories, and all 43 guides
- Sets appropriate `priority` and `changefreq` per page type
- Writes `sitemap.xml` to the site root

### Full Build Command

```bash
npm run build
# Equivalent to:
# npm run build:css && npm run watermark:svgs && npm run generate:static && npm run generate:categories && npm run generate:sitemap
```

Run this after any content change (new guide, updated JSON, modified dates) to regenerate all static assets.

---

## JavaScript Architecture

### `js/loader.js` — Content Loader & SEO Engine

The core SPA driver. Responsibilities:

| Function | Role |
|----------|------|
| `loadContent(hash)` | Fetches content JSON, renders Markdown, triggers all updates |
| `renderGuide(data)` | Renders the full guide view (title, description, sections, cheat sheet, related) |
| `setMeta(name, content)` | Updates `<meta name="...">` and corresponding OG/Twitter tags |
| `setCanonical(url)` | Updates `<link id="canonical-link">` `href` |
| `injectJsonLd(...schemas)` | Adds/updates JSON-LD `<script>` in `<head>` |
| `updatePrevNext(currentIdx)` | Renders prev/next navigation based on route map order |
| `setupHashListener()` | Binds to `hashchange` event |

Key behavior:
- On page load: checks `window.location.hash`, loads content if present
- On hashchange: loads new content, updates all SEO tags, moves focus to content
- When visiting a pre-rendered page with JS: detects content already exists, skips fetch but still runs SEO updates

### `js/theme.js` — Theme Toggle

- Detects `prefers-color-scheme` on load
- Persists choice in `localStorage`
- Toggles `dark` class on `<html>` element
- Applies transitions to avoid flash

### `js/modals.js` — Search & Share

| Feature | Implementation |
|---------|---------------|
| **Search** | Fuzzy matching across guide titles, descriptions, tags, and cheat sheet content |
| **Category/tag filters** | `cat:git` or `tag:staff+` syntax in search bar |
| **Share** | Copies current URL to clipboard, with fallback prompt |

### `js/generated.js` — Auto-Generated Data

- `__ROUTE_MAP`: Array of `{ hash, path, title, category, tags }` — the single source of truth for ordering
- Search index: Pre-compiled from content JSON for instant client-side search
- Re-generated by running `npm run build` (generated via a build step embedded in the static page generation)

---

## Deployment

### GitHub Pages

The site is hosted on **GitHub Pages** from the `main` branch's root directory:

- **URL**: `https://kallolchakraborty.github.io/git-bytes/`
- **`.nojekyll`**: Present in the root to disable Jekyll processing (GitHub Pages skips Jekyll when this file exists, preserving `docs/` subdirectories and files starting with `_`)
- **No server-side redirects**: GitHub Pages serves files as-is. The pre-rendered `/docs/<guide-id>/index.html` structure ensures clean URLs without requiring `.htaccess` or server config
- **No custom headers**: Content-Type and caching headers are GitHub Pages defaults. No custom `X-Robots-Tag` or `Cache-Control` headers are configurable on the free tier

### Limitations

- **No server-side redirects**: `docs.html#git-basics` cannot be server-redirected to `docs/git-basics/`. The SPA hash navigation and pre-rendered pages coexist as independent entry points
- **No WAF / rate limiting**: Anti-scraping is limited to client-side and build-time measures (watermarks, meta tags, legal)
- **No custom headers**: Cannot set custom `Content-Type`, `Cache-Control`, or `X-Robots-Tag` at the server level

### Content Updates

1. Edit the relevant JSON file in `content/`
2. Run `npm run build` to regenerate static pages, category hubs, and sitemap
3. Commit and push to `main` (GitHub Pages auto-deploys)

---

## Accessibility

- **Focus management**: After SPA navigation, `content.focus()` is called on the main content area, announced by screen readers
- **Skip links**: Semantic HTML structure with `<nav>`, `<main>`, `<aside>` landmarks
- **Dark mode**: Full WCAG contrast ratios maintained in both themes
- **Keyboard navigation**: All interactive elements are keyboard-accessible; search modal traps focus while open
- **Noscript fallback**: Complete guide index renders when JavaScript is disabled
- **Pre-rendered fallback**: Every guide is accessible at `/docs/<guide-id>/` without any JavaScript

---

## Development

```bash
# Install dependencies (requires Node.js 20+)
npm install

# Full build: CSS → watermark SVGs → static pages → category hubs → sitemap
npm run build

# Or run steps individually:
npm run build:css           # Rebuild Tailwind CSS
npm run watermark:svgs      # Add copyright watermark to SVGs
npm run generate:static     # Pre-render 43 guide pages
npm run generate:categories # Generate category hub pages
npm run generate:sitemap    # Build sitemap.xml

# Serve locally
python3 -m http.server 8080

# Or with Node.js
npx serve .
```

### Workflow for New Content

```bash
# 1. Create a new JSON file in content/<category>/<guide-id>.json
# 2. Update js/generated.js with the new route map entry
# 3. Rebuild everything
npm run build
# 4. Verify locally
python3 -m http.server 8080
# 5. Commit and push
git add -A && git commit -m "Add guide: <title>" && git push
# 6. Resubmit sitemap in Google Search Console
```

---

## Built With

- HTML, CSS (locally purged [Tailwind CSS](https://tailwindcss.com/) 3.4 + custom styles), vanilla JavaScript (no frameworks)
- [Marked](https://marked.js.org/) — Markdown rendering (MIT)
- [Prism.js](https://prismjs.com/) — syntax highlighting (MIT)
- [Material Symbols](https://fonts.google.com/icons) — icons (Apache 2.0)
- [Ubuntu](https://fonts.google.com/specimen/Ubuntu) / [Ubuntu Mono](https://fonts.google.com/specimen/Ubuntu+Mono) — body and monospace fonts (SIL Open Font 1.1)

---

## License

[MIT](LICENSE) &copy; 2026 Kallol Chakraborty. All content in this repository is licensed under the MIT License. Unauthorized scraping or reproduction is prohibited.
