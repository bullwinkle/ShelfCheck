import { Component } from '@angular/core';
import { SITE_CONFIG } from '../../../shelf-check.config';

@Component({
  selector: 'app-support',
  standalone: true,
  template: `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">☕ Support the Work</h1>
        <p class="page-subtitle">
          Inspector Morsel investigates on caffeine and conviction.
        </p>
      </div>

      <div class="support-hero">
        <div class="support-hero__mascot">🦝</div>
        <div>
          <h2 class="support-hero__title">Keep the Lab Running</h2>
          <p class="support-hero__text">
            Shelf Check is a free, open-source public service. No ads. No paywalls.
            No sponsored content from the food companies we're grading.
            Just data, accountability, and one raccoon in a lab coat.
          </p>
          <p class="support-hero__text">
            If this site has ever helped you make a better decision at the grocery store,
            or just made you appropriately angry at a corporation, please consider supporting it.
          </p>
          <a [href]="supportUrl" target="_blank" rel="noopener" class="support-btn">
            ☕ Buy Inspector Morsel a Coffee
          </a>
        </div>
      </div>

      <div class="what-it-funds">
        <h2>What Your Support Funds</h2>
        <div class="funds-grid">
          @for (item of fundItems; track item.icon) {
            <div class="fund-item">
              <div class="fund-item__icon">{{ item.icon }}</div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          }
        </div>
      </div>

      <div class="open-source">
        <h2>Open Source & Transparent</h2>
        <p>
          The entire pipeline — data collection, analysis, content generation — is open source.
          You can see exactly how the accountability scores are calculated, inspect the prompts
          used for article generation, and audit every data point.
        </p>
        <a href="https://github.com/bullwinkle/ShelfCheck" target="_blank" rel="noopener" class="github-btn">
          View Source on GitHub →
        </a>
      </div>
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
    .support-hero {
      display: flex;
      align-items: flex-start;
      gap: 2rem;
      background: linear-gradient(135deg, var(--color-navy-mid), var(--color-navy-light));
      border: 1px solid var(--color-amber);
      border-radius: var(--radius-xl);
      padding: 2.5rem;
      margin-bottom: 4rem;
    }
    .support-hero__mascot {
      font-size: 5rem;
      flex-shrink: 0;
    }
    .support-hero__title {
      font-size: 1.75rem;
      color: var(--color-amber);
      margin-bottom: 1rem;
    }
    .support-hero__text {
      color: var(--color-text-muted);
      margin-bottom: 0.75rem;
      line-height: 1.7;
    }
    .support-btn {
      display: inline-block;
      margin-top: 1rem;
      background: var(--color-amber);
      color: var(--color-navy);
      font-family: var(--font-headline);
      font-weight: 700;
      font-size: 1rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 0.875rem 2rem;
      border-radius: var(--radius-md);
      transition: all 0.2s;
    }
    .support-btn:hover {
      background: var(--color-white);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      color: var(--color-navy);
    }
    .what-it-funds {
      margin-bottom: 4rem;
    }
    .what-it-funds h2 {
      font-size: 1.5rem;
      color: var(--color-amber);
      margin-bottom: 2rem;
    }
    .funds-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.5rem;
    }
    .fund-item {
      background: var(--color-navy-light);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      text-align: center;
    }
    .fund-item__icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }
    .fund-item h3 {
      font-size: 0.9rem;
      color: var(--color-white);
      margin-bottom: 0.5rem;
    }
    .fund-item p {
      font-size: 0.8rem;
      color: var(--color-text-muted);
    }
    .open-source {
      background: var(--color-navy-light);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: 2.5rem;
      text-align: center;
      margin-bottom: 3rem;
    }
    .open-source h2 {
      font-size: 1.5rem;
      color: var(--color-amber);
      margin-bottom: 1rem;
    }
    .open-source p {
      color: var(--color-text-muted);
      max-width: 600px;
      margin: 0 auto 1.5rem;
      line-height: 1.7;
    }
    .github-btn {
      color: var(--color-amber);
      font-weight: 600;
      font-size: 0.9rem;
    }
    @media (max-width: 600px) {
      .support-hero {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }
  `],
})
export default class SupportPageComponent {
  readonly supportUrl = SITE_CONFIG.supportUrl;

  readonly fundItems = [
    {
      icon: '🖥️',
      title: 'GitHub Actions Minutes',
      description: 'Running the data pipeline 2x daily requires compute time.',
    },
    {
      icon: '🤖',
      title: 'AI Article Generation',
      description: 'GPT-4.1-mini API calls for generating each digest and analysis.',
    },
    {
      icon: '☕',
      title: 'Inspector Morsel\'s Caffeine',
      description: 'The raccoon doesn\'t work for free. Technically.',
    },
    {
      icon: '🔬',
      title: 'Data Quality Work',
      description: 'Improving the scoring model and data pipeline accuracy.',
    },
  ];
}
