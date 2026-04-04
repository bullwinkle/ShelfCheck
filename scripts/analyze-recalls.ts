#!/usr/bin/env tsx
/**
 * analyze-recalls.ts
 * Processes raw recall data to compute brand accountability scores
 * and aggregate statistics. Saves to data/brands.json and data/stats.json.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  DATA_PATHS,
  SCORING_WEIGHTS,
  SEVERITY_SCORES,
  GRADE_THRESHOLDS,
} from '../shelf-check.config';
import type { ProcessedRecall, BrandScore, SiteStats } from '../src/types/index';
import type { Grade } from '../shelf-check.config';

const RECALLS_FILE = path.resolve(process.cwd(), DATA_PATHS.recalls);
const BRANDS_FILE = path.resolve(process.cwd(), DATA_PATHS.brands);
const STATS_FILE = path.resolve(process.cwd(), DATA_PATHS.stats);

const REPEAT_OFFENDER_THRESHOLD = 3;
const REPEAT_OFFENDER_WINDOW_DAYS = 365;

function loadRecalls(): ProcessedRecall[] {
  if (!fs.existsSync(RECALLS_FILE)) {
    console.warn('No recalls file found at', RECALLS_FILE);
    return [];
  }
  return JSON.parse(fs.readFileSync(RECALLS_FILE, 'utf-8')) as ProcessedRecall[];
}

function getGrade(score: number): Grade {
  for (const [grade, range] of Object.entries(GRADE_THRESHOLDS)) {
    if (score >= range.min && score <= range.max) {
      return grade as Grade;
    }
  }
  return 'F';
}

function computeAccountabilityScore(recalls: ProcessedRecall[]): number {
  if (recalls.length === 0) return 100; // Perfect score if no recalls

  const total = recalls.length;

  // Frequency component: log scale, max at 50+ recalls
  const frequencyScore = Math.min(100, (Math.log(total + 1) / Math.log(51)) * 100);

  // Severity component: weighted average of severity scores
  const avgSeverity =
    recalls.reduce((sum, r) => {
      const score = SEVERITY_SCORES[r.classification as keyof typeof SEVERITY_SCORES] ?? 10;
      return sum + score;
    }, 0) / total;

  // Response speed component: voluntarily vs mandated
  const mandatedCount = recalls.filter(
    (r) => r.voluntary_mandated?.toLowerCase().includes('fda') ||
           r.voluntary_mandated?.toLowerCase().includes('mandatory')
  ).length;
  const responseScore = (mandatedCount / total) * 100;

  // Scope component: national distribution gets higher penalty
  const nationalCount = recalls.filter(
    (r) =>
      r.distribution_pattern?.toLowerCase().includes('nationwide') ||
      r.distribution_pattern?.toLowerCase().includes('national')
  ).length;
  const scopeScore = (nationalCount / total) * 100;

  // Weighted composite — higher = worse
  const rawScore =
    frequencyScore * SCORING_WEIGHTS.frequency +
    avgSeverity * SCORING_WEIGHTS.severity +
    responseScore * SCORING_WEIGHTS.responseSpeed +
    scopeScore * SCORING_WEIGHTS.scope;

  // Invert: accountability score is HIGHER for WORSE performers
  return Math.round(rawScore);
}

function isRepeatOffender(recalls: ProcessedRecall[]): boolean {
  // Check if 3+ recalls in any 365-day window
  const sorted = recalls
    .map((r) => new Date(r.report_date))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  for (let i = 0; i < sorted.length; i++) {
    const windowEnd = new Date(sorted[i].getTime() + REPEAT_OFFENDER_WINDOW_DAYS * 86400000);
    const inWindow = sorted.filter((d) => d >= sorted[i] && d <= windowEnd);
    if (inWindow.length >= REPEAT_OFFENDER_THRESHOLD) return true;
  }
  return false;
}

function extractStates(recalls: ProcessedRecall[]): string[] {
  const states = new Set<string>();
  for (const r of recalls) {
    if (r.state) states.add(r.state);
    // Also extract from distribution_pattern
    const match = r.distribution_pattern?.match(/\b([A-Z]{2})\b/g);
    if (match) match.forEach((s) => states.add(s));
  }
  return Array.from(states).filter((s) => s.length === 2).sort();
}

function computeStats(recalls: ProcessedRecall[]): SiteStats {
  const currentYear = new Date().getFullYear();
  const thisYearRecalls = recalls.filter((r) =>
    r.report_date?.startsWith(String(currentYear))
  );

  const monthlyBreakdown: Record<string, number> = {};
  const categoryBreakdown: Record<string, number> = {};

  for (const r of recalls) {
    // Monthly
    const month = r.report_date?.slice(0, 6) ?? 'unknown';
    monthlyBreakdown[month] = (monthlyBreakdown[month] ?? 0) + 1;

    // Product category (from reason heuristic)
    const reason = r.reason_for_recall?.toLowerCase() ?? '';
    let category = 'Other';
    if (reason.includes('allergen') || reason.includes('undeclared')) category = 'Allergen';
    else if (reason.includes('listeria')) category = 'Listeria';
    else if (reason.includes('salmonella')) category = 'Salmonella';
    else if (reason.includes('e. coli') || reason.includes('ecoli')) category = 'E. coli';
    else if (reason.includes('foreign') || reason.includes('metal') || reason.includes('glass')) category = 'Foreign Object';
    else if (reason.includes('mislabel')) category = 'Mislabeling';
    categoryBreakdown[category] = (categoryBreakdown[category] ?? 0) + 1;
  }

  // Top brands by recall count
  const brandCounts = recalls.reduce<Record<string, number>>((acc, r) => {
    acc[r.recalling_firm] = (acc[r.recalling_firm] ?? 0) + 1;
    return acc;
  }, {});
  const topBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name]) => name);

  const sortedDates = recalls
    .map((r) => r.report_date)
    .filter(Boolean)
    .sort()
    .reverse();

  return {
    total_recalls_this_year: thisYearRecalls.length,
    total_recalls_all_time: recalls.length,
    class_i_this_year: thisYearRecalls.filter((r) => r.classification === 'Class I').length,
    class_ii_this_year: thisYearRecalls.filter((r) => r.classification === 'Class II').length,
    class_iii_this_year: thisYearRecalls.filter((r) => r.classification === 'Class III').length,
    repeat_offenders_count: 0, // Filled below
    most_recent_recall_date: sortedDates[0] ?? '',
    last_updated: new Date().toISOString(),
    top_brands_by_recalls: topBrands,
    monthly_breakdown: monthlyBreakdown,
    category_breakdown: categoryBreakdown,
  };
}

async function analyzeRecalls(): Promise<void> {
  console.log('🦝 Inspector Morsel analyzing recall data...');

  const recalls = loadRecalls();
  console.log(`Total records to analyze: ${recalls.length}`);

  if (recalls.length === 0) {
    console.warn('No data to analyze. Run collect-recalls.ts first.');
    const emptyStats: SiteStats = {
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
    };
    fs.mkdirSync(path.dirname(STATS_FILE), { recursive: true });
    fs.writeFileSync(STATS_FILE, JSON.stringify(emptyStats, null, 2));
    fs.writeFileSync(BRANDS_FILE, JSON.stringify([], null, 2));
    return;
  }

  // Group by brand
  const brandMap = new Map<string, ProcessedRecall[]>();
  for (const r of recalls) {
    const key = r.recalling_firm;
    if (!brandMap.has(key)) brandMap.set(key, []);
    brandMap.get(key)!.push(r);
  }

  console.log(`Unique brands/firms: ${brandMap.size}`);

  const brandScores: BrandScore[] = [];

  for (const [brandName, brandRecalls] of brandMap.entries()) {
    const sortedDates = brandRecalls
      .map((r) => r.report_date)
      .filter(Boolean)
      .sort();

    const score = computeAccountabilityScore(brandRecalls);
    const grade = getGrade(score);
    const repeat = isRepeatOffender(brandRecalls);

    const brandScore: BrandScore = {
      brand_name: brandName,
      brand_slug: brandRecalls[0]?.brand_slug ?? brandName.toLowerCase().replace(/\s+/g, '-'),
      total_recalls: brandRecalls.length,
      class_i_recalls: brandRecalls.filter((r) => r.classification === 'Class I').length,
      class_ii_recalls: brandRecalls.filter((r) => r.classification === 'Class II').length,
      class_iii_recalls: brandRecalls.filter((r) => r.classification === 'Class III').length,
      accountability_score: score,
      grade,
      is_repeat_offender: repeat,
      last_recall_date: sortedDates[sortedDates.length - 1] ?? '',
      first_recall_date: sortedDates[0] ?? '',
      categories: [],
      states_affected: extractStates(brandRecalls),
      trend: 'stable',
    };

    brandScores.push(brandScore);
  }

  // Sort by accountability score (highest = worst first)
  brandScores.sort((a, b) => b.accountability_score - a.accountability_score);

  const stats = computeStats(recalls);
  stats.repeat_offenders_count = brandScores.filter((b) => b.is_repeat_offender).length;

  fs.mkdirSync(path.dirname(BRANDS_FILE), { recursive: true });
  fs.writeFileSync(BRANDS_FILE, JSON.stringify(brandScores, null, 2));
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));

  console.log(`✅ Brand scores computed: ${brandScores.length}`);
  console.log(`✅ Repeat offenders: ${stats.repeat_offenders_count}`);
  console.log(`✅ Written to: ${BRANDS_FILE} and ${STATS_FILE}`);
}

analyzeRecalls().catch((err) => {
  console.error('Fatal error in analyze-recalls:', err);
  process.exit(1);
});
