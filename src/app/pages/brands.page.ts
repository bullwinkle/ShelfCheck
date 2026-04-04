import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { GradeBadgeComponent } from '../components/grade-badge.component';
import { DonateCTAComponent } from '../components/donate-cta.component';
import type { BrandScore } from '../../types/index';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [RouterLink, FormsModule, GradeBadgeComponent, DonateCTAComponent],
  template: `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">🏷️ Brand Report Cards</h1>
        <p class="page-subtitle">
          Every brand that's touched a recall gets graded. Accountability scores based on
          frequency, severity, response speed, and scope of their incidents.
        </p>
      </div>

      <div class="filters">
        <input
          class="search-input"
          type="search"
          placeholder="🔍 Search brands..."
          [(ngModel)]="searchQuery"
        />
        <select class="filter-select" [(ngModel)]="gradeFilter">
          <option value="">All Grades</option>
          <option value="A">A (Good)</option>
          <option value="B">B (Acceptable)</option>
          <option value="C">C (Concerning)</option>
          <option value="D">D (Poor)</option>
          <option value="F">F (Failing)</option>
        </select>
        <label class="filter-toggle">
          <input type="checkbox" [(ngModel)]="repeatOffendersOnly" />
          ⚠ Repeat Offenders Only
        </label>
      </div>

      @if (filteredBrands().length > 0) {
        <div class="brands-grid">
          @for (brand of filteredBrands(); track brand.brand_slug) {
            <a class="brand-card" [routerLink]="['/brands', brand.brand_slug]">
              <div class="brand-card__grade">
                <app-grade-badge [grade]="brand.grade"></app-grade-badge>
              </div>
              <div class="brand-card__info">
                <h3 class="brand-card__name">{{ brand.brand_name }}</h3>
                <div class="brand-card__stats">
                  <span>{{ brand.total_recalls }} recalls</span>
                  @if (brand.class_i_recalls > 0) {
                    <span class="text-danger">{{ brand.class_i_recalls }} Class I</span>
                  }
                </div>
                @if (brand.is_repeat_offender) {
                  <span class="repeat-badge">⚠ Repeat Offender</span>
                }
              </div>
              <div class="brand-card__score">
                <div class="score-value">{{ brand.accountability_score | number:'1.0-0' }}</div>
                <div class="score-label">Score</div>
              </div>
            </a>
          }
        </div>

        <p class="results-count text-muted">
          Showing {{ filteredBrands().length }} of {{ allBrands().length }} brands
        </p>
      } @else {
        <div class="empty-state">
          <div>🦝</div>
          @if (allBrands().length === 0) {
            <p>No brand data yet. Trigger a workflow_dispatch to collect recalls.</p>
          } @else {
            <p>No brands match your search.</p>
            <button class="btn-reset" (click)="resetFilters()">Clear filters</button>
          }
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
    .filters {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
      padding: 1.25rem;
      background: var(--color-navy-light);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }
    .search-input {
      flex: 1;
      min-width: 200px;
      background: var(--color-navy);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      padding: 0.6rem 1rem;
      border-radius: var(--radius-md);
      font-family: var(--font-body);
      font-size: 0.9rem;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--color-amber);
    }
    .filter-select {
      background: var(--color-navy);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      padding: 0.6rem 1rem;
      border-radius: var(--radius-md);
      font-family: var(--font-body);
      font-size: 0.85rem;
      cursor: pointer;
    }
    .filter-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--color-text-muted);
      cursor: pointer;
    }
    .filter-toggle input { cursor: pointer; accent-color: var(--color-amber); }
    .brands-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .brand-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--color-navy-light);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      color: var(--color-text);
      transition: all 0.2s;
    }
    .brand-card:hover {
      border-color: var(--color-amber);
      transform: translateY(-1px);
      color: var(--color-white);
    }
    .brand-card__info { flex: 1; }
    .brand-card__name {
      font-family: var(--font-headline);
      font-size: 0.95rem;
      color: var(--color-white);
      margin-bottom: 0.35rem;
    }
    .brand-card__stats {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }
    .repeat-badge {
      display: inline-block;
      font-size: 0.7rem;
      color: var(--color-danger);
      font-weight: 600;
      margin-top: 0.35rem;
    }
    .brand-card__score {
      text-align: center;
    }
    .score-value {
      font-family: var(--font-headline);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-amber);
    }
    .score-label {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-muted);
    }
    .results-count {
      font-size: 0.8rem;
      text-align: right;
      margin-bottom: 2rem;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--color-text-muted);
      background: var(--color-navy-light);
      border-radius: var(--radius-lg);
      margin-bottom: 2rem;
    }
    .empty-state div { font-size: 3rem; margin-bottom: 1rem; }
    .btn-reset {
      margin-top: 1rem;
      background: var(--color-navy-mid);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-family: var(--font-body);
    }
  `],
})
export default class BrandsPageComponent {
  private readonly dataService = inject(DataService);

  readonly allBrands = this.dataService.brands;

  searchQuery = '';
  gradeFilter = '';
  repeatOffendersOnly = false;

  filteredBrands(): BrandScore[] {
    let result = this.allBrands();

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter((b) => b.brand_name.toLowerCase().includes(q));
    }

    if (this.gradeFilter) {
      result = result.filter((b) => b.grade.startsWith(this.gradeFilter));
    }

    if (this.repeatOffendersOnly) {
      result = result.filter((b) => b.is_repeat_offender);
    }

    return result.sort((a, b) => b.total_recalls - a.total_recalls);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.gradeFilter = '';
    this.repeatOffendersOnly = false;
  }
}
