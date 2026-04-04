# 🦝 Shelf Check

**The food industry's accountability report card.**

Every recall, every repeat offender, every cover-up — exposed with data.

## What Is This?

Shelf Check is an automated, AI-powered food safety intelligence site that:
- Pulls recall data from FDA, USDA, CPSC, and EU RASFF APIs
- Analyzes patterns, scores brand accountability, and identifies repeat offenders
- Generates smart, well-researched articles with custom data visualizations
- Publishes automatically as a static site via GitHub Pages
- Runs 100% on GitHub Actions — zero manual intervention

## Personality

**Inspector Morsel** 🦝 — a sharp-eyed raccoon in a lab coat with a magnifying glass.
Investigative journalist meets sardonic food critic. Data-driven, never preachy.

## Tech Stack

- **Framework:** AnalogJS (Angular meta-framework, SSG)
- **Data:** openFDA API, USDA FSIS, CPSC API, EU RASFF
- **AI:** GitHub Models (GPT-4.1-mini) for article generation
- **Charts:** D3.js / Chart.js (server-side rendered to SVG/PNG)
- **CI/CD:** GitHub Actions (2x daily data + weekly deep analysis)
- **Hosting:** GitHub Pages

## Content Schedule

| Frequency | Content Type |
|-----------|-------------|
| 2x daily | New recall digests |
| Weekly (Sun) | Deep analysis — "Dirty Dozen", trend reports |
| Monthly | "State of the Plate" comprehensive report |

## License

MIT
