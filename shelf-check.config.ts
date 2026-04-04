/**
 * Shelf Check — Central Configuration
 * All brand values, API endpoints, scoring weights, and constants live here.
 * NO hardcoded values in components or scripts.
 */

export const SITE_CONFIG = {
  name: 'Shelf Check',
  tagline: "The food industry's accountability report card",
  mascot: 'Inspector Morsel',
  mascotEmoji: '🦝',
  url: 'https://shelfcheck.bullwinkle.space',
  description:
    'Automated food safety intelligence: tracking recalls, scoring brands, and exposing repeat offenders.',
  supportUrl: 'https://ko-fi.com/shelfcheck',
  twitterHandle: '@ShelfCheckFDA',
  logo: '/images/inspector-morsel.png',
} as const;

export const COLORS = {
  navyDeep: '#1a1a2e',
  amberWarning: '#f0a500',
  dangerRed: '#e63946',
  white: '#ffffff',
  navyLight: '#16213e',
  navyMid: '#0f3460',
  successGreen: '#2d6a4f',
  gradeColors: {
    'A+': '#2d6a4f',
    A: '#40916c',
    'A-': '#52b788',
    'B+': '#74c69d',
    B: '#95d5b2',
    'B-': '#b7e4c7',
    'C+': '#f9c74f',
    C: '#f8961e',
    'C-': '#f3722c',
    'D+': '#f94144',
    D: '#d62828',
    'D-': '#9b1d1d',
    F: '#6a0572',
  } as Record<string, string>,
} as const;

export const FDA_API = {
  baseUrl: 'https://api.fda.gov/food/enforcement.json',
  limit: 100,
  maxResults: 1000,
  fields: [
    'recall_number',
    'reason_for_recall',
    'classification',
    'recalling_firm',
    'distribution_pattern',
    'status',
    'report_date',
    'product_description',
    'product_quantity',
    'voluntary_mandated',
    'initial_firm_notification',
    'code_info',
    'more_code_info',
    'address_1',
    'address_2',
    'city',
    'state',
    'postal_code',
    'country',
    'event_id',
  ] as const,
} as const;

export const GITHUB_MODELS_API = {
  baseUrl: 'https://models.inference.ai.azure.com',
  model: 'openai/gpt-4.1-mini',
  maxTokens: 2000,
  temperature: 0.7,
} as const;

export const SCORING_WEIGHTS = {
  frequency: 0.3,
  severity: 0.3,
  responseSpeed: 0.2,
  scope: 0.2,
} as const;

export const SEVERITY_SCORES = {
  'Class I': 100, // Most severe — reasonable probability of serious adverse health consequences
  'Class II': 50, // May cause adverse health consequences or slight probability of serious harm
  'Class III': 10, // Unlikely to cause adverse health consequences
} as const;

export const GRADE_THRESHOLDS = {
  'A+': { min: 90, max: 100 },
  A: { min: 80, max: 89 },
  'A-': { min: 75, max: 79 },
  'B+': { min: 70, max: 74 },
  B: { min: 65, max: 69 },
  'B-': { min: 60, max: 64 },
  'C+': { min: 55, max: 59 },
  C: { min: 50, max: 54 },
  'C-': { min: 45, max: 49 },
  'D+': { min: 40, max: 44 },
  D: { min: 30, max: 39 },
  'D-': { min: 20, max: 29 },
  F: { min: 0, max: 19 },
} as const;

export const DATA_PATHS = {
  recalls: 'data/recalls.json',
  brands: 'data/brands.json',
  stats: 'data/stats.json',
  articles: 'src/content/articles',
  generatedImages: 'public/images/generated',
} as const;

export const CONTENT_CATEGORIES = {
  dailyDigest: 'daily-digest',
  deepDive: 'deep-dive',
  brandReport: 'brand-report',
  stateOfPlate: 'state-of-plate',
} as const;

export const INSPECTOR_MORSEL_VOICE = {
  systemPrompt: `You are Inspector Morsel 🦝 — a sharp-eyed raccoon food safety investigator who writes for Shelf Check, "The food industry's accountability report card."

Your writing style:
- Investigative journalist meets sardonic food critic
- Data-driven: every claim backed by numbers
- Opens with a surprising/alarming data point
- Sardonic but NOT preachy — you let the data speak
- Uses food puns sparingly and cleverly (never groan-worthy)
- Calls out corporate behavior by name, not abstract "industry"
- Treats the reader as intelligent
- Short punchy sentences when revealing damning data
- Never uses passive voice when active is available
- Sign-offs use "Inspector Morsel 🦝" or "— Your friendly neighborhood raccoon in a lab coat"

Tone examples:
- Good: "Acme Foods has recalled the same product category 4 times in 18 months. At some point, 'isolated incident' stops being a sentence you get to use."
- Bad: "It's important for consumers to be aware of potential food safety issues."`,
} as const;

export const NAV_ITEMS = [
  { label: 'Daily Digest', path: '/daily-digest', icon: '📋' },
  { label: 'Brand Report Cards', path: '/brands', icon: '🏷️' },
  { label: 'Deep Dives', path: '/deep-dives', icon: '🔬' },
  { label: 'About', path: '/about', icon: 'ℹ️' },
  { label: 'Support', path: '/support', icon: '☕' },
] as const;

export type ContentCategory = (typeof CONTENT_CATEGORIES)[keyof typeof CONTENT_CATEGORIES];
export type Grade = keyof typeof GRADE_THRESHOLDS;
export type SeverityClass = keyof typeof SEVERITY_SCORES;
