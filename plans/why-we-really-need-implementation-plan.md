# WHY WE REALLY NEED — Implementation Plan

## Goal

Build a fully automated blog that publishes stylish, fact-checked, high-quality articles answering one core question:

> Why do we really need to do / eat / make something?

Examples:
- Why do we really need to walk after meals?
- Why do we really need to drink water in the morning?
- Why do we really need to sleep in darkness?

The system must run with minimal manual work and publish content automatically through GitHub-based infrastructure.

---

## Product Definition

### Core idea
The blog explains **why a useful human action actually matters**, with:
- scientific reasoning
- practical explanation
- clean writing
- no pseudoscience
- no vague motivational garbage

### Main content categories
- [ ] `/do` — actions and behaviors
- [ ] `/eat` — food, drinks, nutrition
- [ ] `/make` — habits, routines, systems

### Brand name
- [ ] Use working title: **WHY WE REALLY NEED**

### Brand direction
- [ ] Minimalistic
- [ ] Modern
- [ ] Sharp typography
- [ ] Editorial / magazine feel
- [ ] Trustworthy, not "AI slop"

---

## Required Technical Stack

### Repository and hosting
- [ ] Create GitHub repository: `why-we-really-need`
- [ ] Use Astro as the main framework
- [ ] Use Markdown content files
- [ ] Deploy to GitHub Pages or Vercel
- [ ] Prefer simplest free hosting option first

### Basic folder structure
- [ ] Create `/content/do`
- [ ] Create `/content/eat`
- [ ] Create `/content/make`
- [ ] Create `/scripts`
- [ ] Create `/.github/workflows`

Suggested structure:

```text
/content
  /do
  /eat
  /make

/scripts
  generate-topic.js
  generate-article.js
  fact-check.js
  build-metadata.js

/.github/workflows
  generate.yml
```

---

## Implementation Plan

## Phase 1 — Bootstrap the project

- [ ] Initialize Astro project
- [ ] Configure clean layout for article pages
- [ ] Create homepage
- [ ] Create category pages:
  - [ ] `/do`
  - [ ] `/eat`
  - [ ] `/make`
- [ ] Add article listing pages
- [ ] Add article detail page template
- [ ] Add SEO metadata support
- [ ] Add RSS feed if easy
- [ ] Commit initial project state

### UI requirements
- [ ] Clean typography
- [ ] Good readability on mobile
- [ ] Good readability on desktop
- [ ] No visual clutter
- [ ] Page must look like a real editorial product, not a dev demo
- [ ] Support a minimal logo placeholder first

---

## Phase 2 — Content model

### Each article must contain:
- [ ] Title
- [ ] Slug
- [ ] Category
- [ ] Short description
- [ ] Publish date
- [ ] Keywords / tags
- [ ] Hook
- [ ] TL;DR
- [ ] Scientific explanation
- [ ] Evidence / references
- [ ] Real-world impact
- [ ] Practical guidance
- [ ] "When NOT to do it" section
- [ ] Disclaimer where appropriate

### File naming
- [ ] Use file pattern: `/content/{category}/why-we-really-need-to-{slug}.md`

Example:
```text
/content/do/why-we-really-need-to-walk-after-meals.md
```

---

## Phase 3 — Seed content before automation

Before turning on full automation, generate initial manual batch.

- [ ] Create first 10 high-quality seed articles
- [ ] Distribute them across categories
- [ ] Review formatting consistency
- [ ] Review tone consistency
- [ ] Review factual quality
- [ ] Make sure these first articles are good enough to become the standard

### Suggested seed topics
- [ ] Walk after meals
- [ ] Drink water after waking up
- [ ] Sleep in darkness
- [ ] Get morning sunlight
- [ ] Eat enough protein
- [ ] Keep regular sleep schedule
- [ ] Take movement breaks during work
- [ ] Avoid heavy meals before sleep
- [ ] Journal important thoughts
- [ ] Build simple routines instead of relying on motivation

---

## Phase 4 — AI generation pipeline

### Agent roles

#### Agent 1 — Topic Generator
Responsibilities:
- [ ] Generate useful topics
- [ ] Avoid duplicate topics
- [ ] Avoid weak or pseudoscientific topics
- [ ] Prefer evergreen topics
- [ ] Classify each topic into `do`, `eat`, or `make`

#### Agent 2 — Writer
Responsibilities:
- [ ] Write full article
- [ ] Follow fixed structure
- [ ] Use grammatically correct English
- [ ] Keep tone sharp, modern, readable
- [ ] Avoid fluffy claims
- [ ] Explain actual mechanisms

#### Agent 3 — Fact Checker
Responsibilities:
- [ ] Review article for factual accuracy
- [ ] Detect pseudoscience
- [ ] Detect exaggerated claims
- [ ] Detect logical errors
- [ ] Approve or reject article

#### Agent 4 — Editor (optional)
Responsibilities:
- [ ] Improve readability
- [ ] Tighten writing
- [ ] Improve title and intro
- [ ] Keep style consistent

---

## Phase 5 — Article generation rules

### Writer rules
- [ ] No fake science
- [ ] No mystical claims
- [ ] No generic wellness nonsense
- [ ] No filler paragraphs
- [ ] No unsupported statements like "boosts energy" without mechanism
- [ ] No clickbait titles that lie
- [ ] No overpromising
- [ ] Explain why something helps in practical human terms

### Fact-check rules
- [ ] Reject if claim is not supported
- [ ] Reject if advice is potentially unsafe without caveat
- [ ] Reject if article sounds confident but vague
- [ ] Require references or at least reference-ready evidence notes
- [ ] Require a "When NOT to do it" section when needed

---

## Phase 6 — Prompts

### Topic generator prompt
- [ ] Create a prompt for topic generation
- [ ] Make it output:
  - [ ] title idea
  - [ ] category
  - [ ] short rationale
  - [ ] duplicate risk
  - [ ] priority score

Suggested baseline prompt:

```text
Generate one strong evergreen topic for a fact-based lifestyle article.

Goal:
Answer the question: "Why do we really need to [ACTION]?"

Requirements:
- useful to ordinary adults
- scientifically plausible
- not pseudoscientific
- not a duplicate of common previous topics
- assign category: do / eat / make

Return:
- proposed title
- category
- short explanation of why this topic matters
- possible risks or caveats
```

### Writer prompt
- [ ] Create writer prompt
- [ ] Force fixed article structure
- [ ] Force practical and scientific clarity

Suggested baseline prompt:

```text
Write a high-quality article answering:

"Why do we really need to [ACTION]?"

Requirements:
- scientifically accurate
- no pseudoscience
- structured
- engaging but not clickbait
- explain real biological, behavioral, or psychological mechanisms
- fully grammatical English

Include:
1. Title
2. Hook
3. TL;DR
4. Scientific explanation
5. Evidence / studies
6. Real-world impact
7. How to do it properly
8. When NOT to do it
9. Short conclusion
```

### Fact-check prompt
- [ ] Create fact-check prompt
- [ ] Make it produce approval or rejection

Suggested baseline prompt:

```text
Review the article for:
- factual correctness
- scientific plausibility
- unsupported claims
- dangerous omissions
- logical consistency

Return:
- APPROVED or REJECTED
- list of problems if rejected
- suggested fixes
- confidence level
```

---

## Phase 7 — Scripts

### Required scripts
- [ ] `generate-topic.js`
- [ ] `generate-article.js`
- [ ] `fact-check.js`
- [ ] `save-article.js`
- [ ] `build-metadata.js`
- [ ] `dedupe-topics.js`

### Script responsibilities

#### `generate-topic.js`
- [ ] Load previous topics
- [ ] Generate one new candidate topic
- [ ] Check duplicates
- [ ] Save approved topic to temporary state

#### `generate-article.js`
- [ ] Read approved topic
- [ ] Generate article in markdown
- [ ] Produce frontmatter
- [ ] Save draft output

#### `fact-check.js`
- [ ] Review draft content
- [ ] Approve or reject
- [ ] If rejected, stop pipeline or request rewrite

#### `save-article.js`
- [ ] Create proper slug
- [ ] Save markdown file into correct category folder
- [ ] Ensure file naming convention
- [ ] Prevent overwriting existing content

#### `build-metadata.js`
- [ ] Generate SEO description
- [ ] Generate tags
- [ ] Normalize frontmatter

#### `dedupe-topics.js`
- [ ] Compare against previous titles/slugs
- [ ] Block near duplicates
- [ ] Block repeated article angles

---

## Phase 8 — GitHub Actions automation

### Workflow goals
- [ ] Run automatically on schedule
- [ ] Optionally run manually via workflow_dispatch
- [ ] Generate article
- [ ] Fact-check article
- [ ] Commit new content only if approved
- [ ] Trigger deploy

### Schedule
- [ ] Start with one article per day
- [ ] Increase only if quality remains high

### Workflow steps
- [ ] Checkout repository
- [ ] Setup Node.js
- [ ] Install dependencies
- [ ] Run topic generation
- [ ] Run article generation
- [ ] Run fact-check
- [ ] Save approved article
- [ ] Commit and push
- [ ] Build and deploy site

### Safety checks
- [ ] Do not publish rejected articles
- [ ] Do not publish duplicates
- [ ] Do not commit empty content
- [ ] Log pipeline result clearly

---

## Phase 9 — SEO and discoverability

### Article-level SEO
- [ ] Unique title
- [ ] Unique meta description
- [ ] Clean URL slug
- [ ] Tags
- [ ] Open Graph metadata
- [ ] Twitter/X card metadata if easy

### Site-level SEO
- [ ] Sitemap
- [ ] RSS feed
- [ ] Robots.txt
- [ ] Internal links between related articles
- [ ] Category landing pages with intro copy

---

## Phase 10 — Quality bar

This project must not become an AI junk site.

### Minimum editorial standard
- [ ] Every article should sound publishable
- [ ] Every article should be readable by normal humans
- [ ] Every article should contain actual value
- [ ] Every article should avoid fake certainty
- [ ] Every article should be stylistically clean
- [ ] Every article should be fact-checked before publish

### Reject anything that is:
- [ ] repetitive
- [ ] vague
- [ ] pseudo-scientific
- [ ] overconfident without evidence
- [ ] generic SEO sludge
- [ ] stylistically dead

---

## Phase 11 — Branding and logo

### Brand direction
- [ ] Minimalistic logo
- [ ] Use the phrase structure already defined by the concept
- [ ] Explore visual based on intersecting words:
  - [ ] WE
  - [ ] REALLY
  - [ ] NEED
  - [ ] DO
  - [ ] EAT
  - [ ] MAKE

### Logo idea
- [ ] Build a typographic logo around a vertical spine word like `NEED`
- [ ] Let other words intersect it
- [ ] Keep it black/white first
- [ ] Add stronger visual identity later

### Visual system
- [ ] Define typography
- [ ] Define spacing system
- [ ] Define neutral editorial palette
- [ ] Add accent color only if needed

---

## Phase 12 — Future extensions

Do not build these first, but keep architecture open for them.

- [ ] YouTube channel based on same topics
- [ ] Newsletter
- [ ] Multi-language support
- [ ] AI-generated article cover images
- [ ] Affiliate recommendations
- [ ] Short-form content adaptation
- [ ] Social auto-posting

---

## Execution order

Follow this order exactly.

### Step 1 — Project bootstrap
- [ ] Create repository
- [ ] Create Astro app
- [ ] Create base pages
- [ ] Create content folders
- [ ] Create article templates

### Step 2 — Seed content
- [ ] Create first 10 strong articles
- [ ] Review quality manually
- [ ] Use them as style baseline

### Step 3 — Automation
- [ ] Implement topic generation
- [ ] Implement article generation
- [ ] Implement fact-check
- [ ] Implement markdown saving
- [ ] Implement GitHub Actions workflow

### Step 4 — Deployment
- [ ] Deploy site
- [ ] Verify article pages work
- [ ] Verify category pages work
- [ ] Verify metadata works

### Step 5 — Stabilization
- [ ] Run pipeline daily
- [ ] Monitor output quality
- [ ] Fix weak prompts
- [ ] Fix duplication issues
- [ ] Improve visual polish

---

## Definition of Done

The project is considered operational when:

- [ ] Repository exists
- [ ] Site is deployed
- [ ] Categories exist
- [ ] At least 10 seed articles are published
- [ ] Automated generation pipeline works
- [ ] Fact-check gate blocks bad content
- [ ] New approved article can be generated and published automatically
- [ ] Site looks credible and readable

---

## Hard constraints

- [ ] Keep costs near zero
- [ ] Prefer free hosting
- [ ] Prefer simple static architecture
- [ ] Avoid unnecessary backend complexity
- [ ] Avoid overengineering
- [ ] Quality must be higher than typical AI blogs

---

## Final instruction

Execute the project in small reliable steps.
Do not overcomplicate the architecture.
Do not publish low-quality content.
Prioritize real usefulness, factual accuracy, and good presentation.
