# AGENTS.md — ShelfCheck Coding Instructions

## Project Overview

ShelfCheck is a static site that collects FDA food recall data, scores brands on safety accountability, and publishes AI-generated articles. Fully automated — GitHub Actions runs the pipeline 2x daily, generates content, commits data, builds the Astro site, and deploys to GitHub Pages.

**Live site:** https://bullwinkle.js.org/ShelfCheck/  
**Stack:** Astro 6, TypeScript (strict), GitHub Actions, GitHub Models API, openFDA API  
**Hosting:** GitHub Pages (static output only)  
**Mascot/voice:** Inspector Morsel 🦝 (sardonic food safety journalist raccoon)

## Architecture

```
FDA openFDA API
       ↓
collect-recalls.ts   → data/recalls.json
       ↓
analyze-recalls.ts   → data/brands.json, data/stats.json
       ↓
generate-content.ts  → src/content/articles/*.md  (uses GitHub Models API)
       ↓
generate-images.ts   → public/images/generated/*
       ↓
astro build          → dist/  (static HTML)
       ↓
GitHub Pages deploy
```

The pipeline is linear: collect → analyze → generate → build → deploy. Each script reads from the previous step's output. All scripts are idempotent — safe to re-run.

## File Structure

```
ShelfCheck/
├── shelf-check.config.ts    # ALL configuration lives here
├── astro.config.mjs         # Astro config (site URL, base path, integrations)
├── package.json             # Dependencies (npm only)
├── tsconfig.json
├── scripts/
│   ├── collect-recalls.ts   # Fetches from FDA API → data/recalls.json
│   ├── analyze-recalls.ts   # Computes brand scores → data/brands.json, data/stats.json
│   ├── generate-content.ts  # AI article generation → src/content/articles/
│   └── generate-images.ts   # Generates visualization images
├── data/
│   ├── recalls.json         # Raw recall records (580+)
│   ├── brands.json          # Computed brand scores (258+)
│   └── stats.json           # Aggregate statistics
├── src/
│   ├── types/
│   │   └── index.ts         # All TypeScript interfaces
│   ├── content/
│   │   └── articles/        # Generated markdown articles
│   ├── layouts/
│   │   ├── Base.astro       # HTML head, meta, global styles
│   │   └── Layout.astro     # Page wrapper with nav/footer
│   ├── components/
│   │   └── Welcome.astro    # Homepage hero component
│   ├── pages/
│   │   ├── index.astro      # Homepage
│   │   ├── brands.astro     # All brands listing
│   │   ├── about.astro      # About page
│   │   └── support.astro    # Support/donate page
│   └── assets/              # Static assets (SVGs)
├── public/
│   ├── images/generated/    # Build-time generated images
│   ├── favicon.ico
│   └── .nojekyll
├── .github/
│   └── workflows/
│       ├── daily-collect.yml    # Runs 2x daily: collect → build → deploy
│       └── weekly-deep-dive.yml # Sunday: deep analysis article
└── dist/                    # Build output (deployed to Pages)
```

## Configuration

**All config lives in `shelf-check.config.ts`.** Never hardcode values that belong in config.

Key exports:
- `FDA_API` — API endpoint, limits
- `DATA_PATHS` — all file paths (relative to project root)
- `SCORING_WEIGHTS` — brand score calculation weights
- `SEVERITY_SCORES` — Class I/II/III numeric scores
- `GRADE_THRESHOLDS` — A–F grade boundaries
- `COLORS` — design system colors (navy, amber, etc.)
- `GITHUB_MODELS_API` — AI model config
- `INSPECTOR_MORSEL_VOICE` — system prompt for content generation
- `CONTENT_CATEGORIES` — article category slugs
- `SITE_CONFIG` — name, tagline, URL, mascot

## Types

All TypeScript interfaces live in `src/types/index.ts`:
- `ProcessedRecall` — single recall record
- `BrandScore` — computed brand accountability score
- `SiteStats` — aggregate site statistics
- `ArticleFrontmatter` — article metadata

When adding new data structures, add the interface here first.

## Code Style

- **TypeScript strict mode** — no `any`, no implicit types
- **ESM only** — `import`/`export`, never `require()`
- **No React** — Astro components (.astro) for all UI
- **Node.js built-ins** — use `node:fs`, `node:path` prefix
- **Functional style** — pure functions where possible, minimal classes
- **Config from `shelf-check.config.ts`** — never hardcode paths, URLs, thresholds, colors
- **Files under 600 lines** — split if growing larger
- **npm only** — never pnpm, never yarn

## Scripts

Scripts live in `scripts/` and are run with `npx tsx`:

```bash
npx tsx scripts/collect-recalls.ts          # Fetch FDA data
npx tsx scripts/analyze-recalls.ts          # Compute scores
npx tsx scripts/generate-content.ts         # Generate daily digest
npx tsx scripts/generate-content.ts --deep  # Generate deep dive
npx tsx scripts/generate-images.ts          # Generate visualizations
```

Scripts import config from `shelf-check.config.ts` and types from `src/types/index.ts`.

## Data Pipeline

### collect-recalls.ts
- Fetches from openFDA Enforcement API (last 180 days)
- Deduplicates by `recall_number`
- Adds computed fields: `brand_slug`, `severity_score`, `collected_at`
- Outputs: `data/recalls.json`

### analyze-recalls.ts
- Reads `data/recalls.json`
- Groups by brand, computes accountability scores using `SCORING_WEIGHTS`
- Assigns grades (A–F) using `GRADE_THRESHOLDS`
- Detects repeat offenders and trends
- Outputs: `data/brands.json`, `data/stats.json`

### generate-content.ts
- Reads `data/recalls.json`, `data/brands.json`, `data/stats.json`
- Calls GitHub Models API with Inspector Morsel system prompt
- Generates markdown article with proper frontmatter
- Outputs: `src/content/articles/YYYY-MM-DD-{type}.md`

### generate-images.ts
- Generates visualization images (charts, infographics)
- Outputs: `public/images/generated/`

## Adding New Data Sources

1. Create `scripts/collect-{source}.ts` following the pattern of `collect-recalls.ts`
2. Add source config to `shelf-check.config.ts`
3. Add types to `src/types/index.ts`
4. Store raw data in `data/{source}.json`
5. Update `analyze-recalls.ts` to incorporate new data (or create separate analyzer)
6. Add the collection step to `.github/workflows/daily-collect.yml`

## Adding New Page Types

1. Create the page in `src/pages/` (static) or `src/pages/[param].astro` (dynamic)
2. Use `Base.astro` layout for HTML head, `Layout.astro` for page wrapper
3. Import data from `data/*.json` at build time (Astro static rendering)
4. Add to sitemap (automatic via `@astrojs/sitemap`)
5. Style using CSS variables from the design system (see `COLORS` in config)

Example dynamic route for brand pages:
```astro
---
// src/pages/brands/[slug].astro
import brands from '../../../data/brands.json';
export function getStaticPaths() {
  return brands.map(b => ({ params: { slug: b.brand_slug }, props: { brand: b } }));
}
const { brand } = Astro.props;
---
```

## Design System

Colors are defined in `shelf-check.config.ts` → `COLORS`:
- Primary: navy (`#1a1a2e`) + amber (`#f0a500`)
- Danger: `#e63946`
- Success: `#2a9d8f`
- Grade colors: A=green, B=light-green, C=amber, D=orange, F=red

Use CSS custom properties in components, derived from the config values.

## Deployment

- **Trigger:** push to `main` or schedule (6:00 and 18:00 UTC)
- **Flow:** GitHub Actions → collect → analyze → generate → commit → build → deploy to Pages
- **Base path:** `/ShelfCheck` (configured in `astro.config.mjs`)
- **All internal links must include the base path** — use Astro's built-in URL handling

## GitHub Actions Permissions

Workflows need:
- `contents: write` — to commit generated data
- `pages: write` — to deploy
- `id-token: write` — for Pages deployment
- `models: read` — for GitHub Models API access

## Testing

- Run scripts locally: `npx tsx scripts/collect-recalls.ts`
- Build locally: `npm run build`
- Dev server: `npm run dev`
- Verify links: check `dist/` output for correct paths
- Check data: inspect `data/*.json` after collection/analysis

No test framework currently. When adding tests:
- Use Node.js built-in test runner (`node:test`)
- Test scripts as functions, not just CLI entry points
- Mock FDA API responses for deterministic tests

## Important Notes

- The site uses `base: '/ShelfCheck'` — all URLs are prefixed
- Data files in `data/` are committed to git (they're the source of truth)
- Articles in `src/content/articles/` are also committed (generated content = content)
- `continue-on-error: true` on pipeline steps prevents partial failures from blocking deploy
- Inspector Morsel is the editorial voice — maintain the persona in all generated content
