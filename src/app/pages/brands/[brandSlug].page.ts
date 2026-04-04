import { Component, inject, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DataService } from '../../services/data.service';
import { GradeBadgeComponent } from '../../components/grade-badge.component';
import { SeverityBadgeComponent } from '../../components/severity-badge.component';
import { DonateCTAComponent } from '../../components/donate-cta.component';

@Component({
  selector: 'app-brand-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, GradeBadgeComponent, SeverityBadgeComponent, DonateCTAComponent],
  template: `
    <div class="container">
      @if (brand(); as b) {
        <div class="brand-header">
          <div class="brand-header__grade">
            <app-grade-badge [grade]="b.grade"></app-grade-badge>
          </div>
          <div>
            <h1 class="brand-header__name">{{ b.brand_name }}</h1>
            <div class="brand-header__meta">
              <span>{{ b.total_recalls }} total recalls</span>
              <span>First: {{ b.first_recall_date | date:'MMM y' }}</span>
              <span>Last: {{ b.last_recall_date | date:'MMM y' }}</span>
              @if (b.is_repeat_offender) {
                <span class="text-danger">⚠ Repeat Offender</span>
              }
            </div>
          </div>
        </div>

        <div class="morsel-callout">
          {{ morselsVerdict(b) }}
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-card__number text-danger">{{ b.class_i_recalls }}</div>
            <div class="stat-card__label">Class I</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__number text-amber">{{ b.class_ii_recalls }}</div>
            <div class="stat-card__label">Class II</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__number">{{ b.class_iii_recalls }}</div>
            <div class="stat-card__label">Class III</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__number">{{ b.accountability_score | number:'1.0-0' }}</div>
            <div class="stat-card__label">Accountability Score</div>
          </div>
        </div>

        <!-- Trend chart placeholder -->
        <div class="chart-container" [attr.data-brand]="b.brand_slug" [attr.data-type]="'thermometer'">
          <div class="chart-placeholder">
            📊 Brand Trust Thermometer
            <span class="text-muted">Visualization generated during build</span>
          </div>
        </div>

        @if (b.states_affected?.length) {
          <section class="section">
            <h2>States Affected</h2>
            <div class="states-list">
              @for (state of b.states_affected; track state) {
                <span class="state-chip">{{ state }}</span>
              }
            </div>
          </section>
        }

        @if (brandArticles().length > 0) {
          <section class="section">
            <h2>Coverage</h2>
            <div class="articles-list">
              @for (article of brandArticles(); track article.slug) {
                <a class="article-item" [routerLink]="['/articles', article.slug]">
                  <span class="article-item__date">{{ article.date | date:'MMM d, y' }}</span>
                  <span class="article-item__title">{{ article.title }}</span>
                  <span class="article-item__arrow">→</span>
                </a>
              }
            </div>
          </section>
        }

      } @else {
        <div class="not-found">
          <div>🦝</div>
          <h2>Brand Not Found</h2>
          <p>Inspector Morsel couldn't locate this brand in the database.</p>
          <a routerLink="/brands" class="back-link">← Back to All Brands</a>
        </div>
      }

      <app-donate-cta></app-donate-cta>
    </div>
  `,
  styles: [`
    .brand-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 3rem 0 2rem;
    }
    .brand-header__name {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      color: var(--color-white);
      margin-bottom: 0.5rem;
    }
    .brand-header__meta {
      display: flex;
      gap: 1.5rem;
      font-size: 0.8rem;
      color: var(--color-text-muted);
      flex-wrap: wrap;
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--color-navy-light);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1rem;
      text-align: center;
    }
    .stat-card__number {
      font-family: var(--font-headline);
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-text);
    }
    .stat-card__label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-muted);
      margin-top: 0.25rem;
    }
    .chart-container {
      background: var(--color-navy-light);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 2rem;
      min-height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
    }
    .chart-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      color: var(--color-text-muted);
    }
    .section { margin-bottom: 2rem; }
    .section h2 {
      font-size: 1.1rem;
      color: var(--color-amber);
      margin-bottom: 1rem;
    }
    .states-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .state-chip {
      font-size: 0.75rem;
      background: var(--color-navy-mid);
      color: var(--color-text-muted);
      padding: 0.25em 0.75em;
      border-radius: 2rem;
    }
    .articles-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .article-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: var(--color-navy-light);
      border-radius: var(--radius-md);
      color: var(--color-text);
      transition: all 0.2s;
    }
    .article-item:hover { color: var(--color-amber); }
    .article-item__date {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      min-width: 90px;
    }
    .article-item__title { flex: 1; font-size: 0.9rem; }
    .article-item__arrow { color: var(--color-text-muted); }
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
export default class BrandDetailPageComponent {
  private readonly dataService = inject(DataService);

  readonly brandSlug = input<string>('', { alias: 'brandSlug' });

  readonly brand = computed(() =>
    this.dataService.getBrandBySlug(this.brandSlug())
  );

  readonly brandArticles = computed(() => {
    const b = this.brand();
    if (!b) return [];
    return this.dataService.getArticlesByBrand(b.brand_name);
  });

  morselsVerdict(brand: { brand_name: string; total_recalls: number; class_i_recalls: number; is_repeat_offender: boolean; grade: string }): string {
    if (brand.class_i_recalls > 5) {
      return `${brand.brand_name} has logged ${brand.class_i_recalls} Class I recalls — the kind that come with a reasonable probability of serious health consequences. That's not a quality control problem. That's a policy.`;
    }
    if (brand.is_repeat_offender) {
      return `${brand.brand_name} has earned Repeat Offender status with ${brand.total_recalls} recalls on record. At some point, "isolated incident" stops being a sentence you get to use.`;
    }
    if (brand.grade === 'A+' || brand.grade === 'A') {
      return `${brand.brand_name} shows a relatively clean record in the FDA enforcement database. Inspector Morsel remains cautiously optimistic. We said cautiously.`;
    }
    return `${brand.brand_name} has ${brand.total_recalls} recalls in the database. Grade: ${brand.grade}. The data doesn't lie.`;
  }
}
