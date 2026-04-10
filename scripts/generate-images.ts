#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { BrandScore, SiteStats } from '../src/types';

const brands = JSON.parse(fs.readFileSync(path.resolve('data/brands.json'), 'utf8')) as BrandScore[];
const stats = JSON.parse(fs.readFileSync(path.resolve('data/stats.json'), 'utf8')) as SiteStats;
const articlesDir = path.resolve('src/content/articles');
const outputDir = path.resolve('public/images/generated');

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function renderPng(svg: string, filePath: string, width: number, height: number) {
  await sharp(Buffer.from(svg)).resize(width, height).png().toFile(filePath);
}

function brandCard(brand: BrandScore) {
  return `
  <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="400" fill="#1a1a2e" rx="32" />
    <rect x="24" y="24" width="552" height="352" rx="24" fill="#ffffff" />
    <text x="48" y="74" font-size="20" font-family="Inter, sans-serif" fill="#f0a500">Shelf Check brand report</text>
    <text x="48" y="130" font-size="38" font-family="Oswald, sans-serif" fill="#1a1a2e">${escapeXml(brand.brand_name.slice(0, 32))}</text>
    <text x="48" y="180" font-size="16" font-family="Inter, sans-serif" fill="#4b5563">Accountability score</text>
    <text x="48" y="242" font-size="74" font-family="Oswald, sans-serif" fill="#e63946">${brand.accountability_score}</text>
    <text x="48" y="292" font-size="18" font-family="Inter, sans-serif" fill="#111827">${brand.total_recalls} recalls · ${brand.class_i_recalls} Class I · grade ${brand.grade}</text>
    <rect x="48" y="320" width="504" height="18" rx="9" fill="url(#thermo)" />
    <circle cx="${48 + Math.min(brand.accountability_score, 100) * 5.04}" cy="329" r="12" fill="#1a1a2e" stroke="#fff" stroke-width="4" />
    <defs>
      <linearGradient id="thermo" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#10b981" />
        <stop offset="50%" stop-color="#f0a500" />
        <stop offset="100%" stop-color="#e63946" />
      </linearGradient>
    </defs>
  </svg>`;
}

function trendChart() {
  const points = Object.entries(stats.monthly_breakdown)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([, count], index) => `${60 + index * 62},${280 - Math.min(count, 160)}`)
    .join(' ');

  return `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#1a1a2e" />
    <text x="60" y="96" font-size="28" font-family="Inter, sans-serif" fill="#f0a500">Shelf Check</text>
    <text x="60" y="168" font-size="72" font-family="Oswald, sans-serif" fill="#ffffff">FDA recall trendline</text>
    <text x="60" y="220" font-size="28" font-family="Inter, sans-serif" fill="#d1d5db">${stats.total_recalls_this_year} recalls in ${new Date().getUTCFullYear()} so far</text>
    <polyline fill="none" stroke="#f0a500" stroke-width="8" points="${points}" />
    <line x1="60" y1="320" x2="1140" y2="320" stroke="#475569" stroke-width="2" />
  </svg>`;
}

function ogImage(title: string) {
  return `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#1a1a2e" />
    <rect x="48" y="48" width="1104" height="534" rx="32" fill="#ffffff" />
    <text x="92" y="132" font-size="28" font-family="Inter, sans-serif" fill="#f0a500">Inspector Morsel 🦝</text>
    <text x="92" y="250" font-size="72" font-family="Oswald, sans-serif" fill="#1a1a2e">${escapeXml(title.slice(0, 42))}</text>
    <text x="92" y="340" font-size="32" font-family="Inter, sans-serif" fill="#334155">Shelf Check food recall intelligence</text>
  </svg>`;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  await Promise.all(brands.slice(0, 24).map((brand) => renderPng(brandCard(brand), path.join(outputDir, `brand-${brand.brand_slug}.png`), 600, 400)));
  await renderPng(trendChart(), path.join(outputDir, 'trend-chart.png'), 1200, 630);
  await renderPng(ogImage('Shelf Check'), path.resolve('public/images/og-default.png'), 1200, 630);

  if (fs.existsSync(articlesDir)) {
    const articleFiles = fs.readdirSync(articlesDir).filter((file) => file.endsWith('.mdoc') || file.endsWith('.md'));
    for (const file of articleFiles) {
      const raw = fs.readFileSync(path.join(articlesDir, file), 'utf8');
      const match = raw.match(/^title:\s+(.+)$/m);
      const title = match?.[1]?.replace(/^"|"$/g, '') ?? 'Shelf Check';
      const slug = file.replace(/\.(mdoc|md)$/, '');
      await renderPng(ogImage(title), path.join(outputDir, `og-${slug}.png`), 1200, 630);
    }
  }

  console.log('Generated brand cards, trend chart, and OG images.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
