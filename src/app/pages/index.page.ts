import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { DataService } from '../services/data.service';
import { SeverityBadgeComponent } from '../components/severity-badge.component';
import { GradeBadgeComponent } from '../components/grade-badge.component';
import { DonateCTAComponent } from '../components/donate-cta.component';
import { SITE_CONFIG } from '../../../shelf-check.config';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AsyncPipe, DatePipe, SeverityBadgeComponent, GradeBadgeComponent, DonateCTAComponent],
  template: `
    <div class="home">
      <!-- Hero -->
      <section class="hero">
        <div class="container">
          <div class="hero__mascot">🦝</div>
          <h1 class="hero__title">
            <span class="hero__title-main">Shelf Check</span>
            <span class="hero__title-sub">{{ tagline }}</span>
          </h1>
          <p class="hero__intro">
            Every recall. Every repeat offender. Every cover-up — exposed with data.
            Inspector Morsel tracks what lands on your plate so you don't have to.
          </p>

          @if (stats(); as s) {
            <div class="hero__stats">
              <div class="stat-card stat-card--big">
                <div class="stat-card__number">{{ s.total_recalls_this_year | number }}</div>
                <div class="stat-card__label">Recalls This Year</div>
              </div>
              <div class="stat-card">
                <div class="stat-card__number text-danger">{{ s.class_i_this_year | number }}</div>
                <div class="stat-card__label">Class I (Most Severe)</div>
              </div>
              <div class="stat-card">
                <div class="stat-card__number text-amber">{{ s.repeat_offenders_count | number }}</div>
                <div class="stat-card__label">Repeat Offenders</div>
              </div>
              <div class="stat-card">
                <div class="stat-card__number">{{ s.total_recalls_all_time | number }}</div>
                <div class="stat-card__label">Total Tracked</div>
              </div>
            </div>
          } @else {
            <div class="hero__loading">
              <div class="pulse">Loading live data...</div>
            </div>
          }

          <div class="hero__cta">
            <a routerLink="/daily-digest" class="btn btn--primary">📋 Today's Digest</a>
            <a routerLink="/brands" class="btn btn--secondary">🏷️ Brand Report Cards</a>
          </div>
        </div>
      </section>

      <!-- Latest Articles -->
      <section class="section">
        <div class="container">
          <h2 class="section__title">Latest Intelligence</h2>

          @if (articles().length > 0) {
            <div class="article-grid">
              @for (article of articles().slice(0, 6); track article.slug) {
                <article class="article-card" [routerLink]="['/articles', article.slug]">
                  <div class="article-card__meta">
                    <span class="article-card__category">{{ formatCategory(article.category) }}</span>
                    <span class="article-card__date">{{ article.date | date:'MMM d' }}</span>
                  </div>
                  <h3 class="article-card__title">{{ article.title }}</h3>
                  <p class="article-card__tldr">{{ article.tldr }}</p>
                  @if (article.brands?.length) {
                    <div class="article-card__brands">
                      @for (brand of article.brands.slice(0, 3); track brand) {
                        <span class="brand-chip">{{ brand }}</span>
                      }
                    </div>
                  }
                  <app-severity-badge [severity]="article.severity"></app-severity-badge>
                </article>
              }
            </div>
          } @else {
            <div class="empty-state">
              <div class="empty-state__icon">🦝</div>
              <p>Inspector Morsel is out collecting evidence. Check back soon.</p>
              <p class="text-muted">Trigger a workflow_dispatch to populate with real data.</p>
            </div>
          }
        </div>
      </section>

      <!-- Trending Brands -->
      @if (topBrands().length > 0) {
        <section class="section">
          <div class="container">
            <h2 class="section__title">Trending Brand Report Cards</h2>
            <div class="brand-grid">
              @for (brand of topBrands().slice(0, 6); track brand.brand_slug) {
                <a class="brand-card" [routerLink]="['/brands', brand.brand_slug]">
                  <app-grade-badge [grade]="brand.grade"></app-grade-badge>
                  <div class="brand-card__info">
                    <div class="brand-card__name">{{ brand.brand_name }}</div>
                    <div class="brand-card__recalls">{{ brand.total_recalls }} recalls</div>
                  </div>
                  @if (brand.is_repeat_offender) {
                    <span class="brand-card__offender">⚠ Repeat</span>
                  }
                </a>
              }
            </div>
            <div class="section__footer">
              <a routerLink="/brands" class="btn btn--ghost">View All Report Cards →</a>
            </div>
          </div>
        </section>
      }

      <!-- Donate CTA -->
      <div class="container">
        <app-donate-cta></app-donate-cta>
      </div>
    </div>
  `,
  styles: [`
    .hero {
      background: linear-gradient(180deg, var(--color-navy-light) 0%, var(--color-navy) 100%);
      padding: 4rem 0 3rem;
      border-bottom: 1px solid var(--color-border);
      text-align: center;
    }
    .hero__mascot { font-size: 4rem; margin-bottom: 1rem; }
    .hero__title {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      margin-bottom: 1.25rem;
    }
    .hero__title-main {
      font-size: clamp(2.5rem, 8vw, 5rem);
      color: var(--color-amber);
    }
    .hero__title-sub {
      font-size: clamp(0.8rem, 2vw, 1rem);
      letter-spacing: 0.25em;
      color: var(--color-text-muted);
      font-weight: 400;
      font-family: var(--font-body);
      text-transform: uppercase;
    }
    .hero__intro {
      max-width: 600px;
      margin: 0 auto 2rem;
      color: var(--color-text-muted);
      font-size: 1rem;
    }
    .hero__stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      max-width: 700px;
      margin: 0 auto 2rem;
    }
    .stat-card {
      background: var(--color-navy-light);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1.25rem 1rem;
      text-align: center;
    }
    .stat-card--big { border-color: var(--color-amber); }
    .stat-card__number {
      font-family: var(--font-headline);
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-amber);
    }
    .stat-card--big .stat-card__number { font-size: 2.5rem; }
    .stat-card__label {
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--color-text-muted);
      margin-top: 0.25rem;
    }
    .hero__loading {
      padding: 2rem;
      color: var(--color-text-muted);
      font-size: 0.9rem;
    }
    .hero__cta {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-md);
      font-family: var(--font-headline);
      font-weight: 700;
      font-size: 0.9rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      transition: all 0.2s;
      border: 2px solid transparent;
    }
    .btn--primary {
      background: var(--color-amber);
      color: var(--color-navy);
      border-color: var(--color-amber);
    }
    .btn--primary:hover {
      background: var(--color-white);
      color: var(--color-navy);
    }
    .btn--secondary {
      background: transparent;
      color: var(--color-amber);
      border-color: var(--color-amber);
    }
    .btn--secondary:hover {
      background: var(--color-amber);
      color: var(--color-navy);
    }
    .btn--ghost {
      color: var(--color-text-muted);
      border-color: var(--color-border);
    }
    .btn--ghost:hover {
      color: var(--color-amber);
      border-color: var(--color-amber);
    }
    .section {
      padding: 4rem 0;
    }
    .section__title {
      font-size: 1.5rem;
      color: var(--color-amber);
      margin-bottom: 2rem;
    }
    .section__footer {
      margin-top: 2rem;
      text-align: center;
    }
    .article-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .article-card {
      background: var(--color-navy-light);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .article-card:hover {
      border-color: var(--color-amber);
      transform: translateY(-2px);
    }
    .article-card__meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .article-card__category {
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--color-amber);
      font-weight: 600;
    }
    .article-card__date {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }
    .article-card__title {
      font-size: 1rem;
      color: var(--color-white);
      font-family: var(--font-headline);
    }
    .article-card__tldr {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      flex: 1;
    }
    .article-card__brands {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .brand-chip {
      font-size: 0.7rem;
      background: rgba(240, 165, 0, 0.15);
      color: var(--color-amber);
      padding: 0.15em 0.5em;
      border-radius: 2rem;
    }
    .brand-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }
    .brand-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--color-navy-light);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      transition: all 0.2s;
    }
    .brand-card:hover {
      border-color: var(--color-amber);
      transform: translateY(-1px);
      color: var(--color-white);
    }
    .brand-card__info { flex: 1; }
    .brand-card__name {
      font-weight: 600;
      color: var(--color-white);
      font-size: 0.9rem;
    }
    .brand-card__recalls {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-top: 0.15rem;
    }
    .brand-card__offender {
      font-size: 0.7rem;
      color: var(--color-danger);
      font-weight: 600;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--color-text-muted);
    }
    .empty-state__icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
  `],
})
export default class HomePageComponent {
  private readonly dataService = inject(DataService);

  readonly tagline = SITE_CONFIG.tagline;
  readonly stats = this.dataService.stats;
  readonly articles = this.dataService.articles;
  readonly topBrands = this.dataService.topBrands;

  formatCategory(cat: string): string {
    const map: Record<string, string> = {
      'daily-digest': 'Daily Digest',
      'deep-dive': 'Deep Dive',
      'brand-report': 'Brand Report',
      'state-of-plate': 'State of the Plate',
    };
    return map[cat] ?? cat;
  }
}
