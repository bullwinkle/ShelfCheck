import { Component, inject, input, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DataService } from '../../services/data.service';
import { SeverityBadgeComponent } from '../../components/severity-badge.component';
import { ShareButtonsComponent } from '../../components/share-buttons.component';
import { DonateCTAComponent } from '../../components/donate-cta.component';
import { SITE_CONFIG } from '../../../../shelf-check.config';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, SeverityBadgeComponent, ShareButtonsComponent, DonateCTAComponent],
  template: `
    <div class="container">
      @if (article(); as a) {
        <article class="article">
          <header class="article__header">
            <div class="article__breadcrumb">
              <a routerLink="/">Home</a> / <a routerLink="/daily-digest">{{ formatCategory(a.category) }}</a>
            </div>
            <h1 class="article__title">{{ a.title }}</h1>
            <div class="article__meta">
              <span>{{ a.date | date:'MMMM d, y' }}</span>
              <app-severity-badge [severity]="a.severity"></app-severity-badge>
              @if (a.brands?.length) {
                @for (brand of a.brands; track brand) {
                  <a class="brand-link" [routerLink]="['/brands', toBrandSlug(brand)]">{{ brand }}</a>
                }
              }
            </div>
            <p class="article__tldr">{{ a.tldr }}</p>
            <app-share-buttons [title]="a.title" [url]="currentUrl()"></app-share-buttons>
          </header>

          <!-- Morsel callout -->
          <div class="morsel-callout article__morsel">
            Inspector Morsel is on the case. The data never lies — people just prefer it didn't exist.
          </div>

          @if (a.chartData) {
            <div
              class="chart-container article__chart"
              [attr.data-chart-type]="a.chartData.type"
              [attr.data-chart-labels]="toJson(a.chartData.labels)"
              [attr.data-chart-values]="toJson(a.chartData.values)"
              [attr.data-chart-title]="a.chartData.title"
            >
              <div class="chart-placeholder">
                📊 {{ a.chartData.title ?? 'Data Visualization' }}
                <span class="text-muted">Generated with real FDA data</span>
              </div>
            </div>
          }

          <div class="article__content" [innerHTML]="articleHtml()"></div>

          <footer class="article__footer">
            <app-share-buttons [title]="a.title" [url]="currentUrl()"></app-share-buttons>

            @if (relatedArticles().length > 0) {
              <div class="related">
                <h3 class="related__title">Related Intelligence</h3>
                <div class="related__list">
                  @for (rel of relatedArticles(); track rel.slug) {
                    <a class="related__item" [routerLink]="['/articles', rel.slug]">
                      <span class="related__date">{{ rel.date | date:'MMM d' }}</span>
                      <span class="related__title-text">{{ rel.title }}</span>
                    </a>
                  }
                </div>
              </div>
            }
          </footer>
        </article>

        <app-donate-cta></app-donate-cta>
      } @else {
        <div class="not-found">
          <div>🦝</div>
          <h2>Article Not Found</h2>
          <p>Inspector Morsel couldn't locate this report.</p>
          <a routerLink="/" class="back-link">← Back to Home</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .article {
      max-width: 800px;
      margin: 0 auto;
      padding: 3rem 0;
    }
    .article__breadcrumb {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-bottom: 1.5rem;
    }
    .article__breadcrumb a { color: var(--color-text-muted); }
    .article__breadcrumb a:hover { color: var(--color-amber); }
    .article__title {
      font-size: clamp(1.75rem, 5vw, 3rem);
      color: var(--color-white);
      margin-bottom: 1rem;
    }
    .article__meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      font-size: 0.8rem;
      color: var(--color-text-muted);
      margin-bottom: 1rem;
    }
    .brand-link {
      background: rgba(240, 165, 0, 0.15);
      color: var(--color-amber);
      padding: 0.15em 0.5em;
      border-radius: 2rem;
      font-size: 0.75rem;
    }
    .article__tldr {
      font-size: 1.1rem;
      color: var(--color-text-muted);
      font-style: italic;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
    .article__morsel {
      margin: 2rem 0;
    }
    .article__chart {
      margin: 2rem 0;
      min-height: 200px;
    }
    .chart-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-text-muted);
    }
    .article__content {
      line-height: 1.8;
      font-size: 1rem;
    }
    .article__content :global(h2) {
      font-size: 1.5rem;
      color: var(--color-amber);
      margin: 2rem 0 1rem;
    }
    .article__content :global(h3) {
      font-size: 1.1rem;
      color: var(--color-white);
      margin: 1.5rem 0 0.75rem;
    }
    .article__content :global(p) {
      margin-bottom: 1rem;
      color: var(--color-text-muted);
    }
    .article__content :global(strong) { color: var(--color-text); }
    .article__content :global(blockquote) {
      border-left: 3px solid var(--color-amber);
      padding-left: 1.25rem;
      color: var(--color-text-muted);
      font-style: italic;
    }
    .article__content :global(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }
    .article__content :global(th) {
      background: var(--color-navy-light);
      padding: 0.75rem;
      text-align: left;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .article__content :global(td) {
      padding: 0.75rem;
      border-bottom: 1px solid var(--color-border);
      color: var(--color-text-muted);
    }
    .article__footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid var(--color-border);
    }
    .related { margin-top: 2rem; }
    .related__title {
      font-size: 1rem;
      color: var(--color-amber);
      margin-bottom: 1rem;
    }
    .related__list { display: flex; flex-direction: column; gap: 0.5rem; }
    .related__item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: var(--color-navy-light);
      border-radius: var(--radius-md);
      color: var(--color-text);
      transition: all 0.2s;
    }
    .related__item:hover { color: var(--color-amber); }
    .related__date { font-size: 0.75rem; color: var(--color-text-muted); min-width: 60px; }
    .related__title-text { font-size: 0.9rem; }
    .not-found {
      text-align: center;
      padding: 5rem 2rem;
      color: var(--color-text-muted);
    }
    .not-found div { font-size: 3rem; margin-bottom: 1rem; }
    .not-found h2 { color: var(--color-amber); margin-bottom: 0.5rem; }
    .back-link { color: var(--color-amber); font-size: 0.9rem; }
  `],
})
export default class ArticleDetailPageComponent {
  private readonly dataService = inject(DataService);

  readonly slug = input<string>('', { alias: 'slug' });

  readonly article = computed(() =>
    this.dataService.articles().find((a) => a.slug === this.slug()) ?? null
  );

  readonly articleHtml = signal('');

  readonly relatedArticles = computed(() => {
    const a = this.article();
    if (!a) return [];
    return this.dataService
      .articles()
      .filter((art) => art.slug !== a.slug && art.category === a.category)
      .slice(0, 3);
  });

  currentUrl(): string {
    return typeof window !== 'undefined' ? window.location.href : '';
  }

  formatCategory(cat: string): string {
    const map: Record<string, string> = {
      'daily-digest': 'Daily Digest',
      'deep-dive': 'Deep Dives',
      'brand-report': 'Brand Reports',
      'state-of-plate': 'State of the Plate',
    };
    return map[cat] ?? cat;
  }

  toBrandSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  toJson(val: unknown): string {
    return JSON.stringify(val);
  }
}
