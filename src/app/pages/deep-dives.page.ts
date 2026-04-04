import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DataService } from '../services/data.service';
import { DonateCTAComponent } from '../components/donate-cta.component';

@Component({
  selector: 'app-deep-dives',
  standalone: true,
  imports: [RouterLink, DatePipe, DonateCTAComponent],
  template: `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">🔬 Deep Dives</h1>
        <p class="page-subtitle">
          Weekly analysis from Inspector Morsel. The Dirty Dozen, trend reports,
          and the kind of accountability journalism the food industry prefers you skip.
        </p>
      </div>

      @if (deepDiveArticles().length > 0) {
        @if (deepDiveArticles()[0]; as featured) {
          <div class="featured-article" [routerLink]="['/articles', featured.slug]">
            <div class="featured-article__badge">Featured Deep Dive</div>
            <h2 class="featured-article__title">{{ featured.title }}</h2>
            <p class="featured-article__tldr">{{ featured.tldr }}</p>
            <div class="featured-article__meta">
              <span>{{ featured.date | date:'MMMM d, y' }}</span>
              @if (featured.brands?.length) {
                <span>Brands: {{ featured.brands.join(', ') }}</span>
              }
            </div>
            <span class="read-more">Read the investigation →</span>
          </div>
        }

        @if (deepDiveArticles().length > 1) {
          <div class="articles-grid">
            @for (article of deepDiveArticles().slice(1); track article.slug) {
              <a class="article-card" [routerLink]="['/articles', article.slug]">
                <div class="article-card__date">{{ article.date | date:'MMM d, y' }}</div>
                <h3 class="article-card__title">{{ article.title }}</h3>
                <p class="article-card__tldr">{{ article.tldr }}</p>
              </a>
            }
          </div>
        }
      } @else {
        <div class="coming-soon">
          <div class="coming-soon__mascot">🦝</div>
          <h2>First Deep Dive Coming Sunday</h2>
          <p>
            Inspector Morsel runs a comprehensive analysis every Sunday.
            The weekly workflow will pull fresh data, identify repeat offenders,
            spot category trends, and write a full investigation report.
          </p>
          <p class="text-muted">
            Trigger the weekly-deep-dive workflow manually to generate the first report.
          </p>
        </div>
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
    }
    .featured-article {
      background: linear-gradient(135deg, var(--color-navy-mid), var(--color-navy-light));
      border: 1px solid var(--color-amber);
      border-radius: var(--radius-xl);
      padding: 2.5rem;
      margin-bottom: 2rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .featured-article:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    .featured-article__badge {
      display: inline-block;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--color-amber);
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .featured-article__title {
      font-size: clamp(1.5rem, 4vw, 2rem);
      color: var(--color-white);
      margin-bottom: 0.75rem;
    }
    .featured-article__tldr {
      color: var(--color-text-muted);
      font-size: 1rem;
      margin-bottom: 1.25rem;
      max-width: 700px;
    }
    .featured-article__meta {
      display: flex;
      gap: 2rem;
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-bottom: 1rem;
    }
    .read-more {
      color: var(--color-amber);
      font-weight: 600;
      font-size: 0.9rem;
    }
    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .article-card {
      background: var(--color-navy-light);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      color: var(--color-text);
      transition: all 0.2s;
    }
    .article-card:hover {
      border-color: var(--color-amber);
      transform: translateY(-2px);
      color: var(--color-white);
    }
    .article-card__date {
      font-size: 0.75rem;
      color: var(--color-amber);
      margin-bottom: 0.5rem;
    }
    .article-card__title {
      font-size: 1rem;
      margin-bottom: 0.5rem;
      color: var(--color-white);
    }
    .article-card__tldr {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }
    .coming-soon {
      text-align: center;
      padding: 5rem 2rem;
      background: var(--color-navy-light);
      border-radius: var(--radius-xl);
      border: 1px dashed var(--color-border);
      margin-bottom: 2rem;
    }
    .coming-soon__mascot { font-size: 4rem; margin-bottom: 1.5rem; }
    .coming-soon h2 {
      color: var(--color-amber);
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }
    .coming-soon p {
      color: var(--color-text-muted);
      max-width: 500px;
      margin: 0 auto 0.75rem;
      font-size: 0.9rem;
    }
  `],
})
export default class DeepDivesPageComponent {
  private readonly dataService = inject(DataService);

  readonly deepDiveArticles = this.dataService.deepDiveArticles;
}
