import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DataService } from '../services/data.service';
import { SeverityBadgeComponent } from '../components/severity-badge.component';
import { DonateCTAComponent } from '../components/donate-cta.component';

@Component({
  selector: 'app-daily-digest',
  standalone: true,
  imports: [RouterLink, DatePipe, SeverityBadgeComponent, DonateCTAComponent],
  template: `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">📋 Daily Digest</h1>
        <p class="page-subtitle">
          What landed in the recall bin today. Inspector Morsel reads the fine print so you don't have to.
        </p>
        @if (stats(); as s) {
          <p class="page-meta">Last updated: {{ s.last_updated | date:'medium' }}</p>
        }
      </div>

      @if (todayArticle(); as article) {
        <div class="morsel-callout">
          {{ article.tldr }}
        </div>
      }

      <!-- Recent Recalls -->
      <section class="section">
        <h2 class="section-title">Recent Recalls</h2>
        @if (recentRecalls().length > 0) {
          <div class="recalls-list">
            @for (recall of recentRecalls(); track recall.recall_number) {
              <div class="recall-card" [class]="recallClass(recall.classification)">
                <div class="recall-card__header">
                  <app-severity-badge [severity]="recall.classification"></app-severity-badge>
                  <span class="recall-card__date">{{ recall.report_date | date:'MMM d, y' }}</span>
                  <span class="recall-card__number">{{ recall.recall_number }}</span>
                </div>
                <h3 class="recall-card__firm">{{ recall.recalling_firm }}</h3>
                <p class="recall-card__product">{{ recall.product_description }}</p>
                <p class="recall-card__reason">
                  <strong>Reason:</strong> {{ recall.reason_for_recall }}
                </p>
                @if (recall.distribution_pattern) {
                  <p class="recall-card__dist">
                    <strong>Distribution:</strong> {{ recall.distribution_pattern }}
                  </p>
                }
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <div>🦝</div>
            <p>No recalls collected yet.</p>
            <p class="text-muted">Trigger a workflow_dispatch to pull fresh data from FDA.</p>
          </div>
        }
      </section>

      <!-- Articles in this category -->
      @if (digestArticles().length > 0) {
        <section class="section">
          <h2 class="section-title">Previous Digests</h2>
          <div class="digest-list">
            @for (article of digestArticles(); track article.slug) {
              <a class="digest-item" [routerLink]="['/articles', article.slug]">
                <span class="digest-item__date">{{ article.date | date:'MMM d' }}</span>
                <span class="digest-item__title">{{ article.title }}</span>
                <span class="digest-item__arrow">→</span>
              </a>
            }
          </div>
        </section>
      }

      <app-donate-cta></app-donate-cta>
    </div>
  `,
  styles: [`
    .page-header {
      padding: 3rem 0 2rem;
    }
    .page-title {
      font-size: clamp(1.75rem, 5vw, 2.5rem);
      color: var(--color-amber);
      margin-bottom: 0.75rem;
    }
    .page-subtitle {
      color: var(--color-text-muted);
      max-width: 600px;
      margin-bottom: 0.5rem;
    }
    .page-meta {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }
    .section { margin-bottom: 3rem; }
    .section-title {
      font-size: 1.25rem;
      color: var(--color-white);
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-border);
    }
    .recalls-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .recall-card {
      background: var(--color-navy-light);
      border: 1px solid var(--color-border);
      border-left-width: 4px;
      border-radius: var(--radius-md);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .recall-card--class-i { border-left-color: var(--color-danger); }
    .recall-card--class-ii { border-left-color: var(--color-amber); }
    .recall-card--class-iii { border-left-color: var(--color-navy-mid); }
    .recall-card__header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .recall-card__date, .recall-card__number {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }
    .recall-card__firm {
      font-size: 1rem;
      color: var(--color-white);
      font-family: var(--font-headline);
    }
    .recall-card__product {
      font-size: 0.9rem;
      color: var(--color-text);
    }
    .recall-card__reason, .recall-card__dist {
      font-size: 0.8rem;
      color: var(--color-text-muted);
    }
    .recall-card__reason strong, .recall-card__dist strong {
      color: var(--color-text);
    }
    .digest-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .digest-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      background: var(--color-navy-light);
      color: var(--color-text);
      transition: all 0.2s;
    }
    .digest-item:hover {
      background: var(--color-navy-mid);
      color: var(--color-amber);
    }
    .digest-item__date {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      min-width: 60px;
    }
    .digest-item__title { flex: 1; font-size: 0.9rem; }
    .digest-item__arrow { color: var(--color-text-muted); }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--color-text-muted);
      font-size: 0.9rem;
      background: var(--color-navy-light);
      border-radius: var(--radius-lg);
    }
    .empty-state div { font-size: 3rem; margin-bottom: 1rem; }
  `],
})
export default class DailyDigestPageComponent {
  private readonly dataService = inject(DataService);

  readonly stats = this.dataService.stats;
  readonly recentRecalls = this.dataService.recentRecalls;
  readonly todayArticle = this.dataService.todayArticle;
  readonly digestArticles = this.dataService.digestArticles;

  recallClass(classification: string): string {
    if (classification === 'Class I') return 'recall-card--class-i';
    if (classification === 'Class II') return 'recall-card--class-ii';
    return 'recall-card--class-iii';
  }
}
