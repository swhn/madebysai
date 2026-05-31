# Made by Sai — Project Gallery

A curated portfolio showcasing web apps, desktop tools, and mobile applications. Built as a fast, dependency-free static site with a custom "Stormy Morning" design system, glassmorphic UI, smooth scroll-reveal animations, and an animated dark/light theme toggle.

## Features

- **Project gallery** with category filtering (Web App, Desktop App, Mobile App) and live search
- **Detail pages** generated dynamically from a single JSON data source
- **Frosted-glass screenshot mockups** with a lightbox gallery
- **Animated dark/light theme** with persisted preference
- **Fully responsive** layout with a mobile drawer menu
- **SEO-ready** — per-project meta tags, Open Graph, and Twitter cards
- **Zero build step** — plain HTML, CSS, and vanilla ES modules

## Tech Stack

- HTML5
- CSS3 (custom properties, glassmorphism, keyframe animations)
- Vanilla JavaScript (ES modules)
- No frameworks, no bundler, no dependencies

## Project Structure

```
.
├── index.html          # Home / project gallery
├── project.html        # Project detail page (loads by ?id=)
├── about.html          # About page
├── contact.html        # Contact page
├── favicon.svg
├── data/
│   └── projects.json   # Single source of truth for all projects
├── css/
│   ├── variables.css   # Design tokens (colors, spacing, radius)
│   ├── global.css      # Base styles, navbar, theme toggle
│   ├── animations.css  # Scroll-reveal + keyframes
│   ├── home.css        # Gallery page
│   ├── project.css     # Detail page + glass mockups
│   ├── about.css
│   └── contact.css
├── js/
│   ├── main.js         # Shared: theme toggle, mobile menu, scroll reveal
│   ├── api.js          # Loads and caches projects.json
│   ├── home.js         # Renders gallery cards + filtering
│   ├── project.js      # Renders detail pages
│   └── contact.js
└── assets/
    ├── logo.svg
    └── images/         # Project screenshots, OG images, app icons
```

## Getting Started

Because the site uses ES modules and `fetch`, it must be served over HTTP (opening `index.html` via `file://` won't work).

Run any static server from the project root:

```bash
# Python
python -m http.server 8080

# Node
npx serve

# PHP
php -S localhost:8080
```

Then open <http://localhost:8080>.

## Adding a Project

Projects are data-driven — no code changes needed. Add an entry to `data/projects.json`:

```json
{
  "id": "my-project",
  "title": "My Project",
  "subtitle": "Short one-line description.",
  "category": "Web App",
  "description": "Full project description shown on the detail page.",
  "themeColor": "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)",
  "tags": ["React", "TypeScript"],
  "mainImage": "assets/images/my-project-og.png",
  "screenshots": [
    "assets/images/my-project-1.png",
    "assets/images/my-project-2.png"
  ],
  "buttons": [
    { "label": "Visit Site", "url": "https://example.com", "type": "primary", "icon": "external-link" }
  ],
  "featured": true,
  "date": "2026-05",
  "seo": {
    "title": "My Project | Made by Sai",
    "description": "Meta description for search engines.",
    "keywords": "comma, separated, keywords"
  }
}
```

**Card image conventions:**

- **Web apps** — set `mainImage` to the site's OG image (used full-bleed on the card and detail hero).
- **Desktop / mobile apps** — omit `mainImage` (`""`) and add an `"icon"` field pointing to the app icon; it renders centered on the project's gradient background.
- **Screenshots** — listed in `screenshots[]`, displayed in frosted-glass mockup frames in the "Product Interfaces" section.

## Deployment

Any static host works (GitHub Pages, Netlify, Vercel, Cloudflare Pages). No build command is required — just publish the repository root.

## License

© 2026 Sai. All rights reserved.
