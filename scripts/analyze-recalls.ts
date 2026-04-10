#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import type { BrandScore, RecallRecord, SiteStats } from '../src/types';
import { slugify } from '../src/lib/utils';

const recallsPath = path.resolve('data/recalls.json');
const brandsPath = path.resolve('data/brands.json');
const statsPath = path.resolve('data/stats.json');

const WEIGHTS = {
  frequency: 0.3,
  severity: 0.3,
  responseSpeed: 0.2,
  scope: 0.2,
};

function loadRecalls(): RecallRecord[] {
  if (!fs.existsSync(recallsPath)) return [];
  return JSON.parse(fs.readFileSync(recallsPath, 'utf8')) as RecallRecord[];
}

function parseFdaDate(value?: string): Date | null {
  if (!value || value.length !== 8) return null;
  const date = new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(start?: string, end?: string): number | null {
  const a = parseFdaDate(start);
  const b = parseFdaDate(end);
  if (!a || !b) return null;
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

function distributionBreadth(pattern: string): number {
  const lower = pattern.toLowerCase();
  if (!lower) return 0.15;
  if (lower.includes('nationwide') || lower.includes('national') || lower.includes('all states')) return 1;
  const states = new Set(pattern.match(/\b[A-Z]{2}\b/g) ?? []);
  return Math.min(1, Math.max(0.15, states.size / 12));
}

function gradeFor(score: number): string {
  if (score >= 85) return 'F';
  if (score >= 70) return 'D';
  if (score >= 55) return 'C';
  if (score >= 40) return 'B';
  return 'A';
}

function frequencyComponent(totalRecalls: number): number {
  return Math.min(100, totalRecalls * 8);
}

function severityComponent(recalls: RecallRecord[]): number {
  const average = recalls.reduce((sum, recall) => sum + recall.severity_score, 0) / recalls.length;
  return Math.min(100, average);
}

function responseSpeedComponent(recalls: RecallRecord[]): number {
  const deltas = recalls
    .map((recall) => daysBetween(recall.recall_initiation_date, recall.report_date))
    .filter((value): value is number => value !== null);
  if (deltas.length === 0) return 40;
  const average = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
  return Math.min(100, (average / 30) * 100);
}

function scopeComponent(recalls: RecallRecord[]): number {
  const average = recalls.reduce((sum, recall) => sum + distributionBreadth(recall.distribution_pattern), 0) / recalls.length;
  return Math.round(average * 100);
}

function isRepeatOffender(recalls: RecallRecord[]): boolean {
  const timestamps = recalls
    .map((recall) => parseFdaDate(recall.report_date)?.getTime())
    .filter((value): value is number => typeof value === 'number')
    .sort((a, b) => a - b);

  for (let i = 0; i < timestamps.length; i += 1) {
    let hits = 1;
    for (let j = i + 1; j < timestamps.length; j += 1) {
      if (timestamps[j] - timestamps[i] <= 365 * 86400000) hits += 1;
    }
    if (hits >= 3) return true;
  }
  return false;
}

function buildCategoryBreakdown(recalls: RecallRecord[]): Record<string, number> {
  const categories: Record<string, number> = {};
  for (const recall of recalls) {
    const reason = recall.reason_for_recall.toLowerCase();
    const label = reason.includes('allergen') || reason.includes('undeclared')
      ? 'Allergen'
      : reason.includes('listeria')
        ? 'Listeria'
        : reason.includes('salmonella')
          ? 'Salmonella'
          : reason.includes('e. coli') || reason.includes('ecoli')
            ? 'E. coli'
            : reason.includes('foreign') || reason.includes('metal') || reason.includes('glass')
              ? 'Foreign Object'
              : reason.includes('mislabel')
                ? 'Mislabeling'
                : 'Other';
    categories[label] = (categories[label] ?? 0) + 1;
  }
  return categories;
}

function collectStates(recalls: RecallRecord[]): string[] {
  const states = new Set<string>();
  for (const recall of recalls) {
    (recall.distribution_pattern.match(/\b[A-Z]{2}\b/g) ?? []).forEach((state) => states.add(state));
    if (recall.state) states.add(recall.state);
  }
  return [...states].sort();
}

function monthlyBreakdown(recalls: RecallRecord[]): Record<string, number> {
  return recalls.reduce<Record<string, number>>((acc, recall) => {
    const key = recall.report_date.slice(0, 6);
    if (key) acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function brandScore(recalls: RecallRecord[]): BrandScore {
  const score = Math.round(
    frequencyComponent(recalls.length) * WEIGHTS.frequency +
      severityComponent(recalls) * WEIGHTS.severity +
      responseSpeedComponent(recalls) * WEIGHTS.responseSpeed +
      scopeComponent(recalls) * WEIGHTS.scope,
  );
  const days = recalls
    .map((recall) => daysBetween(recall.recall_initiation_date, recall.report_date))
    .filter((value): value is number => value !== null);
  const sortedDates = recalls.map((recall) => recall.report_date).sort();
  const scope = recalls.map((recall) => distributionBreadth(recall.distribution_pattern));
  const sourceName = recalls[0]?.recalling_firm ?? 'Unknown firm';

  return {
    brand_name: sourceName,
    brand_slug: recalls[0]?.brand_slug || slugify(sourceName),
    total_recalls: recalls.length,
    class_i_recalls: recalls.filter((recall) => recall.classification === 'Class I').length,
    class_ii_recalls: recalls.filter((recall) => recall.classification === 'Class II').length,
    class_iii_recalls: recalls.filter((recall) => recall.classification === 'Class III').length,
    accountability_score: score,
    grade: gradeFor(score),
    is_repeat_offender: isRepeatOffender(recalls),
    first_recall_date: sortedDates[0] ?? '',
    last_recall_date: sortedDates.at(-1) ?? '',
    categories: Object.keys(buildCategoryBreakdown(recalls)),
    states_affected: collectStates(recalls),
    trend: 'stable',
    average_days_to_recall: days.length ? Math.round(days.reduce((sum, value) => sum + value, 0) / days.length) : undefined,
    national_recall_ratio: Number((scope.reduce((sum, value) => sum + value, 0) / scope.length).toFixed(2)),
  };
}

function buildStats(recalls: RecallRecord[], brands: BrandScore[]): SiteStats {
  const year = String(new Date().getUTCFullYear());
  const currentYear = recalls.filter((recall) => recall.report_date.startsWith(year));
  const topBrands = [...brands].sort((a, b) => b.total_recalls - a.total_recalls).slice(0, 10).map((brand) => brand.brand_name);

  return {
    total_recalls_this_year: currentYear.length,
    total_recalls_all_time: recalls.length,
    class_i_this_year: currentYear.filter((recall) => recall.classification === 'Class I').length,
    class_ii_this_year: currentYear.filter((recall) => recall.classification === 'Class II').length,
    class_iii_this_year: currentYear.filter((recall) => recall.classification === 'Class III').length,
    repeat_offenders_count: brands.filter((brand) => brand.is_repeat_offender).length,
    most_recent_recall_date: [...recalls].sort((a, b) => b.report_date.localeCompare(a.report_date))[0]?.report_date ?? '',
    last_updated: new Date().toISOString(),
    top_brands_by_recalls: topBrands,
    monthly_breakdown: monthlyBreakdown(recalls),
    category_breakdown: buildCategoryBreakdown(recalls),
  };
}

function main() {
  const recalls = loadRecalls();
  const grouped = new Map<string, RecallRecord[]>();

  for (const recall of recalls) {
    const key = recall.recalling_firm || recall.brand_slug || 'Unknown firm';
    const current = grouped.get(key) ?? [];
    current.push(recall);
    grouped.set(key, current);
  }

  const brands = [...grouped.values()].map(brandScore).sort((a, b) => b.accountability_score - a.accountability_score);
  const stats = buildStats(recalls, brands);

  fs.mkdirSync(path.dirname(brandsPath), { recursive: true });
  fs.writeFileSync(brandsPath, JSON.stringify(brands, null, 2));
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  console.log(`Saved ${brands.length} brands and refreshed stats.`);
}

main();
