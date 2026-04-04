/** Raw recall record after processing from FDA API */
export interface ProcessedRecall {
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
  brand_slug: string;
  severity_score: number;
  collected_at: string;
}

/** Computed brand accountability score */
export interface BrandScore {
  brand_name: string;
  brand_slug: string;
  total_recalls: number;
  class_i_recalls: number;
  class_ii_recalls: number;
  class_iii_recalls: number;
  accountability_score: number;
  grade: string;
  is_repeat_offender: boolean;
  last_recall_date: string;
  first_recall_date: string;
  categories: string[];
  states_affected: string[];
  trend: 'improving' | 'worsening' | 'stable';
}

/** Aggregate site statistics */
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

/** Article frontmatter for generated content */
export interface ArticleFrontmatter {
  title: string;
  slug: string;
  date: string;
  category: string;
  severity: string;
  tldr: string;
  brands: string[];
  tags: string[];
}
