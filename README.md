# git bytes — Git & GitHub Study Guides

A modern, search-first documentation portal for Git, GitHub, DevOps, and engineering study resources — designed for FAANG/Staff+ interview preparation.

## Features

- **43 study guides** across 9 phases (Git Fundamentals through Staff+ Leadership)
- **Search-first** — fuzzy search with category/tag filtering (Ctrl+K)
- **Dark/Light mode** — persistent theme toggle
- **Study progress tracking** — bookmark guides and track completion
- **Inline SVG diagrams** — detailed visual explanations in every guide
- **Reading progress bar** — tracks scroll position per guide
- **Code blocks** — syntax-highlighted with copy-to-clipboard
- **Related topics** — contextual recommendations between guides

## Site Structure

```
github-bytes/
├── index.html          # Landing page
├── docs.html           # Documentation portal (3-column layout)
├── css/main.css        # Custom styles (GitHub blue theme)
├── js/
│   ├── theme.js        # Dark/light theme toggle
│   ├── modals.js       # Share & search modals
│   ├── loader.js       # Dynamic content loader
│   └── generated.js    # Route map + search index
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
│   └── logo.svg        # Animated neural network logo (blue)
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

## Usage

Open `index.html` in any modern browser. All content loads dynamically from JSON files — no build step required.

### Quick start
- Press `Ctrl+K` to search all guides
- Toggle dark mode with the sun/moon icon
- Bookmark guides and track progress (persisted in localStorage)
- Use `cat:` or `tag:` filter syntax in search (e.g., `cat:git tag:staff+`)

## Built With

- HTML, CSS (Tailwind via CDN + custom styles), vanilla JavaScript
- [Marked](https://marked.js.org/) for Markdown rendering
- [Prism.js](https://prismjs.com/) for syntax highlighting
- [Material Symbols](https://fonts.google.com/icons) for icons

Made with ❤️ by [Kallol Chakraborty](https://www.linkedin.com/in/kallol-chakraborty-9728a699/)
