import type { Grade, SeverityClass, ContentCategory } from '../../shelf-check.config';

export interface FDARecall {
  recall_number: string;
  reason_for_recall: string;
  classification: string;
  recalling_firm: string;
  distribution_pattern: string;
  status: string;
  report_date: string;
  product_description: string;
  product_quantity: string;
  voluntary_mandated: string;
  initial_firm_notification: string;
  code_info: string;
  more_code_info: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  event_id: string;
}

export interface ProcessedRecall extends FDARecall {
  brand_slug: string;
  severity_score: number;
  collected_at: string;
}

export interface BrandScore {
  brand_name: string;
  brand_slug: string;
  total_recalls: number;
  class_i_recalls: number;
  class_ii_recalls: number;
  class_iii_recalls: number;
  accountability_score: number;
  grade: Grade;
  is_repeat_offender: boolean;
  last_recall_date: string;
  first_recall_date: string;
  categories: string[];
  states_affected: string[];
  trend: 'improving' | 'worsening' | 'stable';
}

export interface SiteStats {
  total_recalls_this_year: number;
  total_recalls_all_time: number;
  class_i_this_year: number;
  class_ii_this_year: number;
  class_iii_this_year: number;
  repeat_offenders_count: number;
  most_recent_recall_date: string;
  last_updated: string;
  top_brands_by_recalls: string[];
  monthly_breakdown: Record<string, number>;
  category_breakdown: Record<string, number>;
}

export interface ArticleFrontmatter {
  title: string;
  date: string;
  category: ContentCategory;
  brands: string[];
  severity: SeverityClass | 'mixed' | 'informational';
  tldr: string;
  slug: string;
  chartData?: ChartData;
  ogImage?: string;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'thermometer';
  labels: string[];
  values: number[];
  colors?: string[];
  title?: string;
}

export interface ArticleWithContent extends ArticleFrontmatter {
  content: string;
  html: string;
  related?: ArticleFrontmatter[];
}
