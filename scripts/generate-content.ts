#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import type { BrandScore, RecallRecord, SiteStats } from '../src/types';
import { classificationToSeverity, slugify } from '../src/lib/utils';

const deep = process.argv.includes('--deep');
const modelsUrl = 'https://models.inference.ai.azure.com/chat/completions';
const model = 'gpt-4o';
const articlesDir = path.resolve('src/content/articles');
const recalls = JSON.parse(fs.readFileSync(path.resolve('data/recalls.json'), 'utf8')) as RecallRecord[];
const brands = JSON.parse(fs.readFileSync(path.resolve('data/brands.json'), 'utf8')) as BrandScore[];
const stats = JSON.parse(fs.readFileSync(path.resolve('data/stats.json'), 'utf8')) as SiteStats;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function cleanContent(content: string): string {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u2014/g, '--')
    .trim();
}

type GeneratedArticle = {
  title: string;
  tldr: string;
  verdict: string;
  body: string;
  brands: string[];
};

function fallbackArticle(): GeneratedArticle {
  const topBrands = brands.slice(0, 3).map((brand) => brand.brand_name);
  return {
    title: deep
      ? `Why the same brands keep coming back to the recall board`
      : `${stats.total_recalls_this_year} recalls into the year, the pattern is getting louder`,
    tldr: deep
      ? 'The worst offenders are not isolated blips. They are recurring entries with repeatable failure modes.'
      : 'The latest digest shows concentration at the top, familiar contamination themes, and the usual allergy-labeling comedy of errors.',
    verdict: deep
      ? "Inspector Morsel's ruling: repeat appearances are evidence, not coincidence."
      : "Inspector Morsel's ruling: if the same firms keep reappearing, stop calling it bad luck.",
    body: deep
      ? `A surprisingly small set of firms generates a surprisingly large share of Shelf Check's anxiety.\n\n## The repeat offender problem\n\n${topBrands.join(', ')} keep surfacing because frequency compounds risk.\n\n## What consumers should watch\n\nAllergen failures and contamination alerts remain the easiest ways to turn a warehouse error into dinner theater.`
      : `A few brands continue to dominate the scary part of the table.\n\n## Today's headline\n\n${topBrands.join(', ')} are once again doing their part to make grocery shopping more educational than anyone requested.\n\n## Bottom line\n\nRead labels, check notices, and treat repeat appearances as a pattern.`,
    brands: topBrands,
  };
}

function buildPrompt(): string {
  const recentRecalls = recalls.slice(0, 12).map((recall) => ({
    firm: recall.recalling_firm,
    classification: recall.classification,
    report_date: recall.report_date,
    reason: recall.reason_for_recall,
    product: recall.product_description,
  }));
  const worst = brands.slice(0, 8).map((brand) => ({
    brand_name: brand.brand_name,
    score: brand.accountability_score,
    grade: brand.grade,
    recalls: brand.total_recalls,
    class_i: brand.class_i_recalls,
  }));

  const job = deep ? 'weekly deep-dive analysis' : 'daily digest';
  return [
    `Write a ${job} for Shelf Check in markdown.`,
    'Voice: investigative journalist meets sardonic food critic.',
    'Tone: data-driven, sharp, not preachy.',
    'Start with a surprising data point, not a generic intro.',
    'Use ## section headings.',
    deep ? 'Length: 700-1000 words.' : 'Length: 400-700 words.',
    'Return strict JSON with keys: title, tldr, verdict, body, brands.',
    `Stats: ${JSON.stringify(stats)}`,
    `Worst brands: ${JSON.stringify(worst)}`,
    `Recent recalls: ${JSON.stringify(recentRecalls)}`,
  ].join('\n');
}

async function callModel(): Promise<GeneratedArticle> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return fallbackArticle();

  const response = await fetch(modelsUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      max_tokens: 1600,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'shelf_check_article',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              title: { type: 'string' },
              tldr: { type: 'string' },
              verdict: { type: 'string' },
              body: { type: 'string' },
              brands: { type: 'array', items: { type: 'string' } },
            },
            required: ['title', 'tldr', 'verdict', 'body', 'brands'],
          },
        },
      },
      messages: [
        {
          role: 'system',
          content:
            'You are Inspector Morsel, a sardonic but disciplined food recall journalist. Always ground claims in provided data and avoid melodrama.',
        },
        { role: 'user', content: buildPrompt() },
      ],
    }),
  });

  if (!response.ok) {
    console.warn(`GitHub Models failed: ${response.status}`);
    return fallbackArticle();
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) return fallbackArticle();

  try {
    return JSON.parse(raw) as GeneratedArticle;
  } catch {
    return fallbackArticle();
  }
}

function selectSeverity(): 'class-1' | 'class-2' | 'class-3' | 'informational' {
  const recall = recalls[0];
  return classificationToSeverity(recall?.classification ?? '');
}

function topBrandCounts(names: string[]) {
  return names.map((name) => {
    const brand = brands.find((entry) => entry.brand_name.toLowerCase() === name.toLowerCase());
    return brand?.total_recalls ?? 1;
  });
}

async function main() {
  const article = await callModel();
  const slug = slugify(`${todayIso()}-${deep ? 'deep-dive' : 'daily-digest'}-${article.title}`).slice(0, 90);
  const filename = `${slug}.mdoc`;
  const brandList = article.brands.slice(0, 5);
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(article.title)}`,
    `date: ${todayIso()}`,
    `category: ${deep ? 'deep-dive' : 'daily-digest'}`,
    `severity: ${selectSeverity()}`,
    'brands:',
    ...brandList.map((brand: string) => `  - ${JSON.stringify(brand)}`),
    `tldr: ${JSON.stringify(article.tldr)}`,
    `verdict: ${JSON.stringify(article.verdict)}`,
    'chartData:',
    `  title: ${JSON.stringify(deep ? 'Worst brand recall counts' : 'Mentioned brand counts')}`,
    '  labels:',
    ...brandList.map((brand: string) => `    - ${JSON.stringify(brand)}`),
    '  values:',
    ...topBrandCounts(brandList).map((value) => `    - ${value}`),
    '---',
    '',
  ].join('\n');

  const body = cleanContent(article.body);
  fs.mkdirSync(articlesDir, { recursive: true });
  fs.writeFileSync(path.join(articlesDir, filename), `${frontmatter}${body}\n`);
  console.log(`Generated ${filename}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
