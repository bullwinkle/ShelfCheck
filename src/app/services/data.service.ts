import { Injectable, signal } from '@angular/core';
import type { ProcessedRecall, BrandScore, SiteStats, ArticleFrontmatter } from '../../types/index';
import { CONTENT_CATEGORIES } from '../../../shelf-check.config';

/**
 * DataService — loads pre-built JSON data files at runtime.
 * All data is committed to the repo and built into the static site.
 */
@Injectable({ providedIn: 'root' })
export class DataService {
  readonly recalls = signal<ProcessedRecall[]>([]);
  readonly brands = signal<BrandScore[]>([]);
  readonly stats = signal<SiteStats | null>(null);
  readonly articles = signal<ArticleFrontmatter[]>([]);

  constructor() {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    await Promise.all([
      this.loadRecalls(),
      this.loadBrands(),
      this.loadStats(),
      this.loadArticles(),
    ]);
  }

  private async loadRecalls(): Promise<void> {
    try {
      const res = await fetch('/data/recalls.json');
      if (res.ok) {
        const data = await res.json();
        this.recalls.set(data);
      }
    } catch {
      // Data not available yet — site will show empty states
    }
  }

  private async loadBrands(): Promise<void> {
    try {
      const res = await fetch('/data/brands.json');
      if (res.ok) {
        const data = await res.json();
        this.brands.set(data);
      }
    } catch {
      // Empty state
    }
  }

  private async loadStats(): Promise<void> {
    try {
      const res = await fetch('/data/stats.json');
      if (res.ok) {
        const data = await res.json();
        this.stats.set(data);
      }
    } catch {
      // Empty state
    }
  }

  private async loadArticles(): Promise<void> {
    try {
      const res = await fetch('/data/articles-index.json');
      if (res.ok) {
        const data = await res.json();
        this.articles.set(data);
      }
    } catch {
      // Empty state
    }
  }

  /** Derived signals */
  topBrands() {
    return this.brands()
      .sort((a, b) => b.total_recalls - a.total_recalls)
      .slice(0, 12);
  }

  recentRecalls() {
    return this.recalls()
      .sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())
      .slice(0, 20);
  }

  todayArticle() {
    const today = new Date().toISOString().slice(0, 10);
    return this.articles().find(
      (a) => a.date === today && a.category === CONTENT_CATEGORIES.dailyDigest
    ) ?? null;
  }

  digestArticles() {
    return this.articles()
      .filter((a) => a.category === CONTENT_CATEGORIES.dailyDigest)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  deepDiveArticles() {
    return this.articles()
      .filter((a) => a.category === CONTENT_CATEGORIES.deepDive)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getBrandBySlug(slug: string): BrandScore | undefined {
    return this.brands().find((b) => b.brand_slug === slug);
  }

  getArticlesByBrand(brandName: string): ArticleFrontmatter[] {
    return this.articles().filter((a) =>
      a.brands?.some((b) => b.toLowerCase() === brandName.toLowerCase())
    );
  }
}
