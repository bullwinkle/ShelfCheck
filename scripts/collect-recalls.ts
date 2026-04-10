#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import type { RecallRecord } from '../src/types';
import { slugify } from '../src/lib/utils';

const API_URL = 'https://api.fda.gov/food/enforcement.json';
const OUTPUT = path.resolve('data/recalls.json');
const LIMIT = 100;
const MAX_RESULTS = 2000;

interface OpenFdaResponse {
  meta?: { results?: { total?: number } };
  results?: Array<Record<string, string>>;
}

function getSearchWindowStart(days = 180): string {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - days);
  return start.toISOString().slice(0, 10).replace(/-/g, '');
}

function buildUrl(skip = 0): string {
  const from = getSearchWindowStart();
  const search = `report_date:[${from}+TO+99991231]`;
  return `${API_URL}?search=${search}&sort=report_date:desc&limit=${LIMIT}&skip=${skip}`;
}

function severityScore(classification: string): number {
  if (classification === 'Class I') return 100;
  if (classification === 'Class II') return 50;
  if (classification === 'Class III') return 10;
  return 0;
}

function readExisting(): RecallRecord[] {
  if (!fs.existsSync(OUTPUT)) return [];
  return JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) as RecallRecord[];
}

function normalize(item: Record<string, string>): RecallRecord {
  return {
    recall_number: item.recall_number ?? '',
    reason_for_recall: item.reason_for_recall ?? '',
    classification: item.classification ?? '',
    recall_initiation_date: item.recall_initiation_date ?? '',
    recalling_firm: item.recalling_firm ?? 'Unknown firm',
    distribution_pattern: item.distribution_pattern ?? '',
    status: item.status ?? '',
    report_date: item.report_date ?? '',
    product_description: item.product_description ?? '',
    product_quantity: item.product_quantity ?? '',
    voluntary_mandated: item.voluntary_mandated ?? '',
    initial_firm_notification: item.initial_firm_notification ?? '',
    code_info: item.code_info ?? '',
    more_code_info: item.more_code_info ?? '',
    address_1: item.address_1 ?? '',
    address_2: item.address_2 ?? '',
    city: item.city ?? '',
    state: item.state ?? '',
    postal_code: item.postal_code ?? '',
    country: item.country ?? '',
    event_id: item.event_id ?? '',
    brand_slug: slugify(item.recalling_firm ?? 'unknown'),
    severity_score: severityScore(item.classification ?? ''),
    collected_at: new Date().toISOString(),
  };
}

async function fetchPage(skip: number): Promise<OpenFdaResponse> {
  const response = await fetch(buildUrl(skip));
  if (!response.ok) {
    throw new Error(`openFDA error ${response.status}: ${await response.text()}`);
  }
  return (await response.json()) as OpenFdaResponse;
}

async function main() {
  const existing = readExisting();
  const byRecall = new Map(existing.map((entry) => [entry.recall_number, entry]));
  let total = Number.POSITIVE_INFINITY;
  let skip = 0;

  while (skip < Math.min(total, MAX_RESULTS)) {
    const page = await fetchPage(skip);
    total = page.meta?.results?.total ?? 0;
    const results = page.results ?? [];
    if (results.length === 0) break;

    for (const item of results) {
      const record = normalize(item);
      if (!record.recall_number) continue;
      byRecall.set(record.recall_number, record);
    }

    skip += LIMIT;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  const records = [...byRecall.values()].sort((a, b) => b.report_date.localeCompare(a.report_date));
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(records, null, 2));
  console.log(`Saved ${records.length} recall records to ${OUTPUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
