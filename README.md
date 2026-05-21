# Rootword ✶ Every Word Has Ancestors

[![Astro](https://img.shields.io/badge/Astro-%23FF5D01.svg?style=flat&logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev)
[![D3.js](https://img.shields.io/badge/D3.js-F9A03F?style=flat&logo=d3.js&logoColor=white)](https://d3js.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Rootword** is an enterprise-grade, high-fidelity visual etymology explorer that lets users trace English words back to their ancient pre-historic roots (like Proto-Indo-European, Proto-Germanic, Latin, and Ancient Greek). Built with **Astro**, **React**, **D3.js (v7)**, and **Tailwind CSS v4**, the application couples robust linguistic algorithms with a stunning, high-contrast **"Dark Parchment & Amber Gold"** theme and responsive ambient physics.

---

## 🏛 Visual Theme & Aesthetics
Rootword features a hand-crafted, vintage manuscript-inspired visual system that feels responsive and alive:
*   **Color Palette:** An elegant combination of near-black warm velvet (`#0E0D0A`), dark parchment card interfaces (`#1A1810`), aged paper tone secondary text (`#9E9070`), and glowing amber-gold accents (`#C4973A`).
*   **Typography:** The classical serif beauty of **Lora** paired with the clean readability of **JetBrains Mono** for historical metadata and linguistic tags.
*   **Background Gold Dust Particles:** Ambient, hardware-accelerated `.gold-ember` particles float slowly up the screen in an optimized infinite loop, giving the application a premium, magical manuscript aesthetic.

---

## 🎨 Interactive Exploration Modes

When searching for a word, the explorer provides three highly detailed visual layouts managed by an instant, zero-reload React menu bar:

| View Mode | What It Renders | Key Technologies |
| :--- | :--- | :--- |
| **Tree View** | An elegant, interactive hierarchical tree canvas showing ancestral derivations. Highlighting children on hover, displaying physical attestation states, and supporting an instant SVG export tool. | D3.js Hierarchy, React SVG Islands |
| **Timeline View** | A linearized, vertical chronological scroll highlighting the direct descent path. Details century/era indicators, part-of-speech, and literal text translation glosses. | CSS Timeline, Lora Serif |
| **World Map View** | A beautiful vintage vector map outlining coordinates and drawing glowing bezier migration curves across historical provinces (*Gallia, Britannia, Italia, Hellas, Steppe*). Click nodes to inspect glowing pulses and view popover cards. | SVG vector maps, Bezier paths, React overlays |

---

## ⚙ System Architecture & Data Pipeline

Rootword employs a highly resilient **Hybrid Resolution Network** to fetch and construct etymological branches:

```text
                       [ SEARCH QUERY ]
                              │
                              ▼
                Does local seed JSON exist?
               /                           \
            (Yes)                          (No)
            /                                 \
           ▼                                   ▼
 [Load High-Fidelity Seed]            [Query Wiktionary APIs]
(26+ hand-curated databases)                     │
                                                 ▼
                                     REST Definition API
                                  (Extract glosses/POS)
                                                 │
                                                 ▼
                                     MediaWiki Action API
                                   (Fetch article source)
                                                 │
                                                 ▼
                              Progressive Chronological-Narrative Parser
                              (Scan ISO lang tags, sort chronologically,
                               build multi-generation fallback tree)
                                                 │
                                                 ▼
                                        [ Render Canvas ]
```

### Curated Seed Database
We maintain **26 hand-curated etymology seeds** located in `src/data/seeds/`. These seeds represent deep, historically verified lineages (some stretching over 7 generations) that are programmatically validated against strict TypeScript types.

---

## 📁 Repository Directory Tour

Inside the Rootword codebase, files are logically organized for modularity and contribution:

```text
/
├── public/                 # Static public assets
├── scripts/
│   └── validate-seeds.js   # Programmatic seed JSON validator script
├── src/
│   ├── components/         # Interactive UI islands (React + Astro)
│   │   ├── EtymologyTree.tsx  # Core D3 visualization (Tree/Timeline/Map)
│   │   ├── Nav.astro          # Sticky navbar and statistics pill
│   │   ├── SearchBar.tsx      # Gilded input console with autocompletion
│   │   ├── WordPanel.tsx      # Detail panel showing cognates and glosses
│   │   └── NodeTooltip.tsx    # Node inspect card with recursive navigation
│   ├── data/
│   │   └── seeds/          # Hand-curated seed JSON documents
│   ├── lib/
│   │   ├── etymology.ts    # Hybrid API resolver and progressive HTML parser
│   │   └── languages.ts    # Color tokens and metadata for Language Families
│   ├── pages/              # Astro routing controllers
│   │   ├── explore/[word].astro  # Dynamic explorer workspace (SSR)
│   │   ├── languages/index.astro # Language family catalog index
│   │   └── index.astro           # Ambient landing page with gold dust particles
│   ├── styles/
│   │   └── global.css      # Core medieval parchment CSS rules
│   └── types/
│       └── etymology.ts    # Strict type definitions for nodes and seeds
├── .prettierrc             # Standard code formatting rules
├── astro.config.mjs        # Astro project bundler configuration
├── package.json            # Dependencies, engines, and run scripts
└── tsconfig.json           # Astro-strict TypeScript configurations
```

---

## 🧞 Developer Commands

All commands are run from the project root. Make sure you use a Node.js version satisfying our engines requirement (`>=22.12.0`).

### 1. Project Scaffolding & Setup
Installs the required modules (React engine, D3 renderer, Tailwind CSS processing, Prettier plugins, and TypeScript check support):
```bash
npm install
```

### 2. Local Development Server
Starts the local development workspace with hot-reloading active at [http://localhost:4321/](http://localhost:4321/):
```bash
npm run dev
```

### 3. Production Compilation & Packaging
Compiles the static assets and builds the server-side entrypoint into `./dist/` for production deployment:
```bash
npm run build
```

### 4. Local Build Preview
Launches a server to preview the production-compiled bundler files locally before pushing:
```bash
npm run preview
```

### 5. Programmatic Seed Validation
Scans and validates all curated JSON documents in `src/data/seeds/` against schema types, checking for duplicate IDs and broken parent-child paths:
```bash
npm run validate:seeds
```

### 6. Automated Code Formatting
Rootword uses **Prettier** along with **Prettier Plugin Astro** to maintain a clean, standardized codebase. 

To run a dry-run style compliance check:
```bash
npm run format:check
```

To automatically format all pages, components, types, and stylesheets:
```bash
npm run format
```

---

## 🤝 How to Contribute

We welcome contributions from etymologists, developers, and designers alike! 

### Adding Curated Seed Words
1.  Read the detailed guide in our [CONTRIBUTING.md](file:///Volumes/Mac%20Main/All%20My%20Projects/Rootword%202/CONTRIBUTING.md) portal.
2.  Copy our base template seed:
    ```bash
    cp src/data/seeds/_template.json src/data/seeds/yourword.json
    ```
3.  Fill out the etymological tree structure matching historical records.
4.  Run programmatic validation (`npm run validate:seeds`) and style formatting (`npm run format`).
5.  Submit a Pull Request labeled `feat(word): add etymology for yourword`.

### Academic & Reference Sources
When correcting or adding data nodes, we prioritize references matching trusted lexicographical resources:
*   [Wiktionary](https://en.wiktionary.org) (Linguistic ISO code catalog)
*   [Online Etymology Dictionary (Etymonline)](https://www.etymonline.com)
*   [Oxford English Dictionary (OED)](https://www.oed.com)

---

## 📄 License
This project is open-source software licensed under the [MIT License](https://opensource.org/licenses/MIT).
