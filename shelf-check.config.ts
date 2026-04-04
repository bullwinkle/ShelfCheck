/**
 * shelf-check.config.ts
 * Central configuration for all ShelfCheck scripts and pipelines.
 */

// --- FDA API ---
export const FDA_API = {
  baseUrl: 'https://api.fda.gov/food/enforcement.json',
  limit: 100,
  maxResults: 1000,
} as const;

// --- Data paths (relative to project root) ---
export const DATA_PATHS = {
  recalls: 'data/recalls.json',
  brands: 'data/brands.json',
  stats: 'data/stats.json',
  articlesIndex: 'public/data/articles-index.json',
  articles: 'src/content/articles',
  articlesDir: 'src/content/articles',
  generatedImages: 'public/images/generated',
  imagesDir: 'public/images/generated',
} as const;

// --- Scoring weights (sum = 1.0) ---
export const SCORING_WEIGHTS = {
  frequency: 0.3,
  severity: 0.3,
  responseSpeed: 0.2,
  scope: 0.2,
} as const;

// --- Severity scores by classification ---
export const SEVERITY_SCORES = {
  'Class I': 100,
  'Class II': 50,
  'Class III': 10,
} as const;

// --- Grade thresholds ---
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export const GRADE_THRESHOLDS: Record<Grade, { min: number; max: number }> = {
  A: { min: 0, max: 20 },
  B: { min: 21, max: 40 },
  C: { min: 41, max: 60 },
  D: { min: 61, max: 80 },
  F: { min: 81, max: 100 },
};

// --- Colors ---
export const COLORS = {
  navy: '#1a1a2e',
  navyLight: '#16213e',
  navyMid: '#2a2a4e',
  navyDeep: '#0f0f23',
  amber: '#f0a500',
  amberWarning: '#f0a500',
  dangerRed: '#e63946',
  successGreen: '#2a9d8f',
  white: '#ffffff',
  light: '#f8f9fa',
  gradeColors: {
    A: '#2a9d8f',
    B: '#52b788',
    C: '#f0a500',
    D: '#e76f51',
    F: '#e63946',
  } as Record<string, string>,
} as const;

// --- GitHub Models API (for AI content generation) ---
export const GITHUB_MODELS_API = {
  baseUrl: 'https://models.inference.ai.azure.com',
  model: 'gpt-4o-mini',
  maxTokens: 2000,
  temperature: 0.7,
} as const;

// --- Inspector Morsel AI voice ---
export const INSPECTOR_MORSEL_VOICE = {
  systemPrompt: `You are Inspector Morsel 🦝, a sharp-witted food safety journalist raccoon. You write for Shelf Check, a data-driven food industry accountability site.

Your style:
- Direct, factual, slightly sardonic
- Use data to support every claim
- No corporate PR speak — you hold brands accountable
- Reference specific recall numbers, dates, classifications
- End articles with a clear verdict
- Use "Inspector Morsel says:" for editorial commentary
- Keep it accessible — explain technical terms briefly

Format: Write in clean markdown with clear headers, bullet points for data, and a verdict section.`,
} as const;

// --- Content categories ---
export const CONTENT_CATEGORIES = {
  dailyDigest: 'daily-digest',
  deepDive: 'deep-dive',
  brandProfile: 'brand-profile',
  alert: 'alert',
} as const;

// --- Site config ---
export const SITE_CONFIG = {
  name: 'Shelf Check',
  tagline: "The food industry's accountability report card",
  url: 'https://bullwinkle.js.org/ShelfCheck',
  mascot: 'Inspector Morsel 🦝',
} as const;
