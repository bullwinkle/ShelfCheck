#!/usr/bin/env tsx
/**
 * generate-images.ts
 * Creates SVG/PNG visualizations using sharp + SVG templates.
 * - Accountability score cards per brand
 * - Brand trust thermometers
 * - Recall trend charts
 * All saved to public/images/generated/
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import sharp from 'sharp';
import { DATA_PATHS, COLORS } from '../shelf-check.config';
import type { BrandScore, SiteStats } from '../src/types/index';

const OUTPUT_DIR = path.resolve(process.cwd(), DATA_PATHS.generatedImages);

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

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Generate a brand accountability score card SVG */
function brandScoreCardSvg(brand: BrandScore): string {
  const gradeColor = COLORS.gradeColors[brand.grade] ?? '#666';
  const scoreWidth = Math.min(280, (brand.accountability_score / 100) * 280);
  const barColor = brand.accountability_score > 70 ? COLORS.dangerRed
    : brand.accountability_score > 40 ? COLORS.amberWarning
    : COLORS.successGreen;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <style>
      text { font-family: 'Oswald', 'Arial', sans-serif; }
      .body { font-family: 'Inter', 'Arial', sans-serif; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="400" height="200" rx="12" fill="${COLORS.navyLight}"/>
  <rect width="400" height="200" rx="12" fill="none" stroke="${COLORS.amberWarning}" stroke-width="1" opacity="0.3"/>

  <!-- Brand name -->
  <text x="20" y="38" font-size="18" font-weight="700" fill="${COLORS.white}" letter-spacing="1"
    text-anchor="start" text-transform="uppercase">${escapeXml(brand.brand_name.slice(0, 28))}</text>

  <!-- Grade badge -->
  <rect x="340" y="12" width="48" height="48" rx="8" fill="${gradeColor}"/>
  <text x="364" y="45" font-size="22" font-weight="700" fill="${COLORS.white}"
    text-anchor="middle">${escapeXml(brand.grade)}</text>

  <!-- Stats row -->
  <text x="20" y="72" font-size="11" fill="#9090a8" class="body">TOTAL RECALLS</text>
  <text x="140" y="72" font-size="11" fill="#9090a8" class="body">CLASS I</text>
  <text x="220" y="72" font-size="11" fill="#9090a8" class="body">SCORE</text>
  <text x="20" y="96" font-size="26" font-weight="700" fill="${COLORS.amberWarning}">${brand.total_recalls}</text>
  <text x="140" y="96" font-size="26" font-weight="700" fill="${COLORS.dangerRed}">${brand.class_i_recalls}</text>
  <text x="220" y="96" font-size="26" font-weight="700" fill="${COLORS.white}">${brand.accountability_score}</text>

  <!-- Score bar background -->
  <rect x="20" y="118" width="280" height="12" rx="6" fill="${COLORS.navyMid}"/>
  <!-- Score bar fill -->
  <rect x="20" y="118" width="${scoreWidth}" height="12" rx="6" fill="${barColor}"/>

  <!-- Repeat offender flag -->
  ${brand.is_repeat_offender
    ? `<rect x="20" y="142" width="130" height="22" rx="4" fill="${COLORS.dangerRed}" opacity="0.2"/>
       <text x="85" y="158" font-size="11" font-weight="700" fill="${COLORS.dangerRed}" text-anchor="middle">⚠ REPEAT OFFENDER</text>`
    : ''
  }

  <!-- Footer -->
  <text x="20" y="188" font-size="10" fill="#9090a8" class="body">Shelf Check 🦝 — shelfcheck.bullwinkle.space</text>
</svg>`;
}

/** Generate a recall trend chart SVG from monthly data */
function trendChartSvg(stats: SiteStats): string {
  const months = Object.entries(stats.monthly_breakdown)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12); // Last 12 months

  if (months.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300">
      <rect width="800" height="300" rx="12" fill="${COLORS.navyLight}"/>
      <text x="400" y="160" font-size="16" fill="#9090a8" text-anchor="middle" font-family="Arial">No trend data yet</text>
    </svg>`;
  }

  const maxVal = Math.max(...months.map(([, v]) => v), 1);
  const chartH = 200;
  const chartW = 720;
  const barW = Math.floor(chartW / months.length) - 4;
  const startX = 40;
  const startY = 250;

  const bars = months.map(([month, count], i) => {
    const barH = Math.round((count / maxVal) * chartH);
    const x = startX + i * (barW + 4);
    const y = startY - barH;
    const color = count > maxVal * 0.7 ? COLORS.dangerRed : count > maxVal * 0.4 ? COLORS.amberWarning : COLORS.navyMid;
    const label = month.slice(4, 6) + '/' + month.slice(2, 4);
    return `
      <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="3" fill="${color}"/>
      <text x="${x + barW / 2}" y="${startY + 14}" font-size="9" fill="#9090a8" text-anchor="middle" font-family="Arial">${label}</text>
      <text x="${x + barW / 2}" y="${y - 4}" font-size="10" fill="${COLORS.white}" text-anchor="middle" font-family="Arial">${count}</text>
    `;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300">
  <rect width="800" height="300" rx="12" fill="${COLORS.navyLight}"/>
  <text x="20" y="30" font-size="14" font-weight="700" fill="${COLORS.amberWarning}" font-family="Arial" letter-spacing="1">RECALL TREND — LAST 12 MONTHS</text>
  ${bars}
  <text x="400" y="290" font-size="10" fill="#9090a8" text-anchor="middle" font-family="Arial">Shelf Check 🦝 — Data: FDA Open Enforcement</text>
</svg>`;
}

/** Generate an OG image for the site */
function ogDefaultSvg(stats: SiteStats): string {
  const recallCount = stats.total_recalls_this_year.toLocaleString();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.navyDeep}"/>
      <stop offset="100%" style="stop-color:${COLORS.navyMid}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="none" stroke="${COLORS.amberWarning}" stroke-width="3" opacity="0.4"/>

  <!-- Mascot -->
  <text x="600" y="200" font-size="120" text-anchor="middle">🦝</text>

  <!-- Title -->
  <text x="600" y="300" font-size="72" font-weight="700" fill="${COLORS.amberWarning}"
    text-anchor="middle" font-family="Oswald, Arial" letter-spacing="4">SHELF CHECK</text>

  <!-- Tagline -->
  <text x="600" y="360" font-size="22" fill="${COLORS.white}" text-anchor="middle"
    font-family="Inter, Arial" opacity="0.8">The food industry's accountability report card</text>

  <!-- Stats -->
  <rect x="350" y="400" width="200" height="80" rx="8" fill="${COLORS.dangerRed}" opacity="0.2"/>
  <rect x="350" y="400" width="200" height="80" rx="8" fill="none" stroke="${COLORS.dangerRed}" stroke-width="1"/>
  <text x="450" y="432" font-size="36" font-weight="700" fill="${COLORS.dangerRed}"
    text-anchor="middle" font-family="Oswald, Arial">${recallCount}</text>
  <text x="450" y="462" font-size="13" fill="#9090a8" text-anchor="middle" font-family="Arial">RECALLS THIS YEAR</text>

  <rect x="650" y="400" width="200" height="80" rx="8" fill="${COLORS.amberWarning}" opacity="0.1"/>
  <rect x="650" y="400" width="200" height="80" rx="8" fill="none" stroke="${COLORS.amberWarning}" stroke-width="1"/>
  <text x="750" y="432" font-size="36" font-weight="700" fill="${COLORS.amberWarning}"
    text-anchor="middle" font-family="Oswald, Arial">${stats.repeat_offenders_count}</text>
  <text x="750" y="462" font-size="13" fill="#9090a8" text-anchor="middle" font-family="Arial">REPEAT OFFENDERS</text>

  <text x="600" y="560" font-size="16" fill="#9090a8" text-anchor="middle" font-family="Arial">shelfcheck.bullwinkle.space</text>
</svg>`;
}

async function svgToPng(svgContent: string, outputPath: string): Promise<void> {
  await sharp(Buffer.from(svgContent))
    .png({ quality: 90 })
    .toFile(outputPath);
}

async function generateImages(): Promise<void> {
  console.log('🦝 Inspector Morsel generating visualizations...');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(path.resolve(process.cwd(), 'public/images'), { recursive: true });

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

  let generated = 0;

  // Generate OG default image
  const ogSvg = ogDefaultSvg(stats);
  await svgToPng(ogSvg, path.join(path.resolve(process.cwd(), 'public/images'), 'og-default.png'));
  console.log('✅ OG image generated');
  generated++;

  // Generate trend chart
  const trendSvg = trendChartSvg(stats);
  await svgToPng(trendSvg, path.join(OUTPUT_DIR, 'trend-chart.png'));
  console.log('✅ Trend chart generated');
  generated++;

  // Generate brand score cards (top 50 by recall count)
  const topBrands = brands
    .sort((a, b) => b.total_recalls - a.total_recalls)
    .slice(0, 50);

  for (const brand of topBrands) {
    const svg = brandScoreCardSvg(brand);
    const outputPath = path.join(OUTPUT_DIR, `brand-${brand.brand_slug}.png`);
    try {
      await svgToPng(svg, outputPath);
      generated++;
    } catch (err) {
      console.warn(`Failed to generate card for ${brand.brand_name}:`, err);
    }
  }

  console.log(`✅ Generated ${generated} images total`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
}

generateImages().catch((err) => {
  console.error('Fatal error in generate-images:', err);
  process.exit(1);
});
