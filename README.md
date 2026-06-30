# git bytes — Git & GitHub Study Guides

A modern, search-first documentation portal for Git, GitHub, DevOps, and engineering study resources — designed for FAANG/Staff+ interview preparation.

## Features

- **43 study guides** across 9 phases (Git Fundamentals through Staff+ Leadership)
- **25 Staff+ Cheat Sheets** — concise command references, expert patterns, anti-patterns, and interview angles on core technical pages
- **Search-first** — fuzzy search with category/tag filtering (Ctrl+K); cheat sheet content is searchable
- **Dark/Light mode** — persistent theme toggle
- **Study progress tracking** — bookmark guides and track completion
- **Inline SVG diagrams** — detailed visual explanations in every guide
- **Reading progress bar** — tracks scroll position per guide
- **Code blocks** — syntax-highlighted (Prism.js) with copy-to-clipboard
- **Related topics** — contextual recommendations between guides

## Site Structure

```
github-bytes/
├── index.html          # Landing page
├── docs.html           # Documentation portal (3-column layout)
├── css/
│   ├── main.css        # Custom styles (theme utilities, code blocks, cheat sheets)
│   ├── tailwind.css    # Locally purged Tailwind build (23 KB)
│   └── tailwind-input.css
├── js/
│   ├── theme.js        # Dark/light theme toggle
│   ├── modals.js       # Share & search modals
│   ├── loader.js       # Dynamic content loader + cheat sheet rendering
│   └── generated.js    # Route map + search index (auto-generated)
├── content/
│   ├── git/            # Phase 1: Git Fundamentals (5 guides)
│   ├── github/         # Phase 2: GitHub Platform (5 guides)
│   ├── github-advanced/# Phase 3: GitHub Advanced (5 guides)
│   ├── opensource/     # Phase 4: Open Source (3 guides)
│   ├── devops/         # Phase 5: DevOps & Automation (5 guides)
│   ├── career/         # Phase 6: Career & Best Practices (4 guides)
│   ├── git-scale/      # Phase 7: Git at Scale, Staff+ (5 guides)
│   ├── enterprise/     # Phase 8: Enterprise & Supply Chain (6 guides)
│   └── leadership/     # Phase 9: Staff+ Leadership (5 guides)
├── assets/
│   └── logo.svg        # Animated neural network logo (orange)
├── package.json        # `npm run build:css` for Tailwind rebuild
├── tailwind.config.js
├── LICENSE             # MIT
└── README.md
```

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

## Usage

Open `index.html` in any modern browser. All content loads dynamically from JSON files — no build step required.

### Quick start
- Press `Ctrl+K` to search all guides (including cheat sheet content)
- Toggle dark mode with the sun/moon icon
- Bookmark guides and track progress (persisted in localStorage)
- Click **"Staff+ Cheat Sheet"** on any core page for an expert quick-reference
- Use `cat:` or `tag:` filter syntax in search (e.g., `cat:git tag:staff+`)

## Development

```bash
# Install dependencies (requires Node.js 20+)
npm install

# Rebuild Tailwind CSS after adding new utility classes
npm run build:css

# Serve locally
python3 -m http.server 8080
```

## Built With

- HTML, CSS (locally purged [Tailwind CSS](https://tailwindcss.com/) 3.4 + custom styles), vanilla JavaScript
- [Marked](https://marked.js.org/) for Markdown rendering
- [Prism.js](https://prismjs.com/) for syntax highlighting
- [Material Symbols](https://fonts.google.com/icons) for icons
- [Ubuntu](https://fonts.google.com/specimen/Ubuntu) / [Ubuntu Mono](https://fonts.google.com/specimen/Ubuntu+Mono) fonts

## License

[MIT](LICENSE) &copy; 2026 Kallol Chakraborty
