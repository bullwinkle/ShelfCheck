#!/usr/bin/env tsx
/**
 * collect-recalls.ts
 * Fetches food recall data from openFDA Enforcement API.
 * Appends new records to data/recalls.json, deduplicates by recall_number.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { FDA_API, DATA_PATHS } from '../shelf-check.config';
import type { ProcessedRecall } from '../src/types/index';

const DATA_FILE = path.resolve(process.cwd(), DATA_PATHS.recalls);

interface FDAResponse {
  meta: {
    results: {
      total: number;
      skip: number;
      limit: number;
    };
  };
  results: Record<string, string>[];
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getSeverityScore(classification: string): number {
  if (classification === 'Class I') return 100;
  if (classification === 'Class II') return 50;
  return 10;
}

async function fetchPage(skip: number): Promise<FDAResponse> {
  const url = new URL(FDA_API.baseUrl);
  url.searchParams.set('limit', String(FDA_API.limit));
  url.searchParams.set('skip', String(skip));
  // Get records from the past 180 days
  const since = new Date();
  since.setDate(since.getDate() - 180);
  const sinceStr = since.toISOString().slice(0, 10).replace(/-/g, '');
  url.searchParams.set('search', `report_date:[${sinceStr}+TO+99991231]`);
  url.searchParams.set('sort', 'report_date:desc');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`FDA API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<FDAResponse>;
}

function loadExisting(): ProcessedRecall[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw) as ProcessedRecall[];
    }
  } catch (err) {
    console.warn('Could not read existing data file, starting fresh:', err);
  }
  return [];
}

async function collectRecalls(): Promise<void> {
  console.log('🦝 Inspector Morsel starting data collection...');
  console.log(`FDA API: ${FDA_API.baseUrl}`);

  const existing = loadExisting();
  const existingIds = new Set(existing.map((r) => r.recall_number));
  console.log(`Existing records: ${existing.length}`);

  const newRecalls: ProcessedRecall[] = [];
  let skip = 0;
  let total = Infinity;

  while (skip < Math.min(total, FDA_API.maxResults)) {
    try {
      console.log(`Fetching records ${skip}–${skip + FDA_API.limit}...`);
      const page = await fetchPage(skip);
      total = page.meta.results.total;

      for (const item of page.results) {
        const recallNumber = item['recall_number'] ?? '';
        if (existingIds.has(recallNumber)) continue;

        const processed: ProcessedRecall = {
          recall_number: recallNumber,
          reason_for_recall: item['reason_for_recall'] ?? '',
          classification: item['classification'] ?? '',
          recalling_firm: item['recalling_firm'] ?? '',
          distribution_pattern: item['distribution_pattern'] ?? '',
          status: item['status'] ?? '',
          report_date: item['report_date'] ?? '',
          product_description: item['product_description'] ?? '',
          product_quantity: item['product_quantity'] ?? '',
          voluntary_mandated: item['voluntary_mandated'] ?? '',
          initial_firm_notification: item['initial_firm_notification'] ?? '',
          code_info: item['code_info'] ?? '',
          more_code_info: item['more_code_info'] ?? '',
          address_1: item['address_1'] ?? '',
          address_2: item['address_2'] ?? '',
          city: item['city'] ?? '',
          state: item['state'] ?? '',
          postal_code: item['postal_code'] ?? '',
          country: item['country'] ?? '',
          event_id: item['event_id'] ?? '',
          brand_slug: slugify(item['recalling_firm'] ?? 'unknown'),
          severity_score: getSeverityScore(item['classification'] ?? ''),
          collected_at: new Date().toISOString(),
        };

        newRecalls.push(processed);
        existingIds.add(recallNumber);
      }

      skip += FDA_API.limit;

      // Rate limiting — be nice to the FDA API
      if (skip < total) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (err) {
      console.error(`Error fetching at skip=${skip}:`, err);
      break;
    }
  }

  console.log(`New records found: ${newRecalls.length}`);

  const allRecalls = [...existing, ...newRecalls];

  // Ensure data directory exists
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(allRecalls, null, 2));

  console.log(`✅ Total records saved: ${allRecalls.length}`);
  console.log(`📄 Written to: ${DATA_FILE}`);
}

collectRecalls().catch((err) => {
  console.error('Fatal error in collect-recalls:', err);
  process.exit(1);
});
