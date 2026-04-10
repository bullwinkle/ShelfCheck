import fs from 'node:fs';
import path from 'node:path';
import type { BrandScore, RecallRecord, SiteStats } from '@/types';

const root = process.cwd();

function readJson<T>(relativePath: string, fallback: T): T {
  try {
    const file = path.join(root, relativePath);
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
    }
  } catch (error) {
    console.warn(`Unable to read ${relativePath}`, error);
  }
  return fallback;
}

export function getStats(): SiteStats {
  return readJson<SiteStats>('data/stats.json', {
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
}

export function getBrands(): BrandScore[] {
  return readJson<BrandScore[]>('data/brands.json', []);
}

export function getRecalls(): RecallRecord[] {
  return readJson<RecallRecord[]>('data/recalls.json', []);
}
