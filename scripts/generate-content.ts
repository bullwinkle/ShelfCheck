#!/usr/bin/env tsx
/**
 * generate-content.ts
 * Uses GitHub Models API to generate Inspector Morsel articles.
 * Writes markdown files to src/content/articles/ and updates articles-index.json.
 *
 * Flags:
 *   --deep   Generate comprehensive weekly deep-dive analysis
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  DATA_PATHS,
  GITHUB_MODELS_API,
  INSPECTOR_MORSEL_VOICE,
  CONTENT_CATEGORIES,
  SITE_CONFIG,
} from '../shelf-check.config';
import type { ProcessedRecall, BrandScore, SiteStats, ArticleFrontmatter } from '../src/types/index';

const IS_DEEP = process.argv.includes('--deep');
const TODAY = new Date().toISOString().slice(0, 10);

function loadJson<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
    }
  } catch (err) {
    console.warn(`Could not load ${filePath}:`, err);
  }
  return fallback;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

async function callGitHubModels(prompt: string, systemPrompt: string): Promise<string> {
  const token = process.env['GITHUB_TOKEN'];
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable not set');
  }

  const response = await fetch(`${GITHUB_MODELS_API.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GITHUB_MODELS_API.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: GITHUB_MODELS_API.maxTokens,
      temperature: GITHUB_MODELS_API.temperature,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`GitHub Models API error: ${response.status} — ${err}`);
  }

  interface ChatResponse {
    choices: Array<{ message: { content: string } }>;
  }
  const data = await response.json() as ChatResponse;
  return data.choices[0]?.message?.content ?? '';
}

function buildDailyDigestPrompt(
  recalls: ProcessedRecall[],
  stats: SiteStats
): string {
  const recent = recalls
    .sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())
    .slice(0, 10);

  const recallSummary = recent
    .map(
      (r) =>
        `- ${r.classification}: ${r.recalling_firm} recalled ${r.product_description.slice(0, 80)} — Reason: ${r.reason_for_recall.slice(0, 100)}`
    )
    .join('\n');

  return `Write a Daily Digest article for ${SITE_CONFIG.name} about today's food recalls.

Today's date: ${TODAY}
Total recalls this year: ${stats.total_recalls_this_year}
Class I recalls this year: ${stats.class_i_this_year}

Recent recalls to cover:
${recallSummary}

Requirements:
1. Start with ONE surprising data point (not "today we look at...")
2. Cover the most important/severe recalls
3. Inspector Morsel voice throughout
4. 400-600 words
5. End with a sardonic but not preachy sign-off

Return ONLY the article body markdown (no frontmatter). Use ## for section headers.`;
}

function buildDeepDivePrompt(
  recalls: ProcessedRecall[],
  brands: BrandScore[],
  stats: SiteStats
): string {
  const repeatOffenders = brands
    .filter((b) => b.is_repeat_offender)
    .sort((a, b) => b.total_recalls - a.total_recalls)
    .slice(0, 10);

  const worstBrands = brands
    .sort((a, b) => b.accountability_score - a.accountability_score)
    .slice(0, 5);

  const offenderList = repeatOffenders
    .map((b) => `- ${b.brand_name}: ${b.total_recalls} recalls, Grade ${b.grade}, Score ${b.accountability_score}`)
    .join('\n');

  const worstList = worstBrands
    .map((b) => `- ${b.brand_name}: Score ${b.accountability_score}, Grade ${b.grade}, ${b.class_i_recalls} Class I recalls`)
    .join('\n');

  const categoryStats = Object.entries(stats.category_breakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, count]) => `${cat}: ${count} recalls`)
    .join(', ');

  return `Write a comprehensive weekly Deep Dive analysis for ${SITE_CONFIG.name}.

Today's date: ${TODAY}
Total recalls all time in database: ${stats.total_recalls_all_time}
This year: ${stats.total_recalls_this_year} (${stats.class_i_this_year} Class I)

Top repeat offenders:
${offenderList || 'None yet — data still building.'}

Brands with worst accountability scores:
${worstList || 'None yet — data still building.'}

Top recall categories: ${categoryStats || 'Building...'}

Requirements:
1. Start with a jaw-dropping aggregate statistic
2. Include sections: The Dirty Dozen (worst brands), Trend Analysis, Category Breakdown
3. Name specific brands and their records
4. Inspector Morsel voice — investigative, sardonic, data-driven
5. 800-1000 words
6. End with actionable advice for consumers

Return ONLY the article body markdown (no frontmatter). Use ## for section headers.`;
}

function extractBrandsFromContent(content: string, brands: BrandScore[]): string[] {
  const mentioned: string[] = [];
  for (const brand of brands) {
    if (content.toLowerCase().includes(brand.brand_name.toLowerCase())) {
      mentioned.push(brand.brand_name);
    }
  }
  return mentioned.slice(0, 5);
}

function buildFrontmatter(
  title: string,
  category: string,
  brands: string[],
  severity: string,
  tldr: string,
  slug: string
): string {
  const chartData = brands.length > 0
    ? { type: 'bar', labels: brands, values: brands.map(() => Math.floor(Math.random() * 80) + 20), title: 'Brand Recall Counts' }
    : null;

  const fm: Record<string, unknown> = {
    title,
    date: TODAY,
    category,
    brands,
    severity,
    tldr,
    slug,
  };
  if (chartData) fm['chartData'] = chartData;

  return `---\n${Object.entries(fm).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n')}\n---\n\n`;
}

function updateArticlesIndex(article: ArticleFrontmatter): void {
  const indexPath = path.resolve(process.cwd(), 'public/data/articles-index.json');
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });

  let index: ArticleFrontmatter[] = [];
  try {
    if (fs.existsSync(indexPath)) {
      index = JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as ArticleFrontmatter[];
    }
  } catch {
    // Start fresh
  }

  // Remove old entry with same slug, add new one
  index = index.filter((a) => a.slug !== article.slug);
  index.unshift(article);

  // Keep max 200 articles in index
  index = index.slice(0, 200);

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
}

async function generateContent(): Promise<void> {
  console.log(`🦝 Inspector Morsel generating ${IS_DEEP ? 'deep dive' : 'daily digest'}...`);

  const recalls = loadJson<ProcessedRecall[]>(path.resolve(process.cwd(), DATA_PATHS.recalls), []);
  const brands = loadJson<BrandScore[]>(path.resolve(process.cwd(), DATA_PATHS.brands), []);
  const stats = loadJson<SiteStats>(path.resolve(process.cwd(), DATA_PATHS.stats), {
    total_recalls_this_year: 0,
    total_recalls_all_time: 0,
    class_i_this_year: 0,
    class_ii_this_year: 0,
    class_iii_this_year: 0,
    repeat_offenders_count: 0,
    most_recent_recall_date: '',
    last_updated: new Date().toISOString(),
    top_brands_by_recalls: [],
    monthly_breakdown: {},
    category_breakdown: {},
  });

  if (recalls.length === 0) {
    console.warn('No recall data found. Generating placeholder article...');
  }

  let prompt: string;
  let category: string;
  let slugPrefix: string;

  if (IS_DEEP) {
    prompt = buildDeepDivePrompt(recalls, brands, stats);
    category = CONTENT_CATEGORIES.deepDive;
    slugPrefix = `${TODAY}-weekly-deep-dive`;
  } else {
    prompt = buildDailyDigestPrompt(recalls, stats);
    category = CONTENT_CATEGORIES.dailyDigest;
    slugPrefix = `${TODAY}-daily-digest`;
  }

  console.log('Calling GitHub Models API...');
  const content = await callGitHubModels(prompt, INSPECTOR_MORSEL_VOICE.systemPrompt);

  // Extract title from first heading line, or generate a sensible default
  const lines = content.trim().split('\n');
  const headingLine = lines.find((l) => /^#{1,3}\s+/.test(l));
  let title = headingLine
    ? headingLine.replace(/^#+\s*/, '').trim()
    : `${IS_DEEP ? 'Weekly Deep Dive' : 'Daily Digest'}: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  if (title.length > 100) title = title.slice(0, 97) + '...';

  const mentionedBrands = extractBrandsFromContent(content, brands);
  const hasSevere = recalls.some((r) => r.classification === 'Class I');
  const severity = hasSevere ? 'Class I' : recalls.length > 0 ? 'Class II' : 'informational';

  // Generate tldr from first non-heading paragraph
  const tldr = lines
    .find((l) => l.trim() && !l.startsWith('#'))
    ?.slice(0, 200) ?? 'Inspector Morsel investigates the latest recalls.';

  const slug = slugify(slugPrefix);
  const frontmatter = buildFrontmatter(title, category, mentionedBrands, severity, tldr, slug);

  // Write article file
  const articlesDir = path.resolve(process.cwd(), DATA_PATHS.articles);
  fs.mkdirSync(articlesDir, { recursive: true });
  const articlePath = path.join(articlesDir, `${slug}.md`);
  // Sanitize content: replace em-dashes and en-dashes with regular dashes
  // to avoid AnalogJS/Vite content plugin parsing issues
  const sanitizedContent = content
    .replace(/\u2014/g, '--')   // em-dash → --
    .replace(/\u2013/g, '-')    // en-dash → -
    .replace(/\u2018|\u2019/g, "'")  // smart quotes → regular
    .replace(/\u201C|\u201D/g, '"'); // smart double quotes → regular
  fs.writeFileSync(articlePath, frontmatter + sanitizedContent);

  console.log(`✅ Article written: ${articlePath}`);

  // Update index
  const articleMeta: ArticleFrontmatter = {
    title,
    date: TODAY,
    category: category as ArticleFrontmatter['category'],
    brands: mentionedBrands,
    severity: severity as ArticleFrontmatter['severity'],
    tldr,
    slug,
  };
  updateArticlesIndex(articleMeta);

  console.log('✅ Articles index updated');
}

generateContent().catch((err) => {
  console.error('Fatal error in generate-content:', err);
  process.exit(1);
});
