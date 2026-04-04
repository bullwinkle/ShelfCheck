import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../../shelf-check.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer__inner">
        <div class="footer__brand">
          <span class="footer__mascot">{{ mascotEmoji }}</span>
          <div>
            <div class="footer__name">{{ siteName }}</div>
            <div class="footer__tagline">{{ tagline }}</div>
          </div>
        </div>

        <nav class="footer__nav" aria-label="Footer navigation">
          <a routerLink="/daily-digest">Daily Digest</a>
          <a routerLink="/brands">Brand Report Cards</a>
          <a routerLink="/deep-dives">Deep Dives</a>
          <a routerLink="/about">About & Methodology</a>
          <a routerLink="/support">Support the Work</a>
        </nav>

        <div class="footer__bottom">
          <p class="footer__disclaimer">
            Data sourced from FDA Open Enforcement Reporting. Not affiliated with any government agency.
            Inspector Morsel is a fictional raccoon. The recalls are very, very real.
          </p>
          <p class="footer__legal">
            <a [href]="supportUrl" target="_blank" rel="noopener">Support {{ mascotEmoji }}</a>
            · MIT License · <a routerLink="/about">Methodology</a>
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--color-navy-light);
      border-top: 1px solid var(--color-border);
      padding: 3rem 0 2rem;
      margin-top: 4rem;
    }
    .footer__inner {
      display: grid;
      gap: 2rem;
    }
    .footer__brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .footer__mascot {
      font-size: 2.5rem;
    }
    .footer__name {
      font-family: var(--font-headline);
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--color-amber);
    }
    .footer__tagline {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      margin-top: 0.15rem;
    }
    .footer__nav {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1.5rem;
    }
    .footer__nav a {
      color: var(--color-text-muted);
      font-size: 0.85rem;
    }
    .footer__nav a:hover {
      color: var(--color-amber);
    }
    .footer__bottom {
      border-top: 1px solid var(--color-border);
      padding-top: 1.5rem;
    }
    .footer__disclaimer {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      line-height: 1.6;
      margin-bottom: 0.75rem;
    }
    .footer__legal {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }
    .footer__legal a {
      color: var(--color-amber);
    }
  `],
})
export class FooterComponent {
  readonly siteName = SITE_CONFIG.name;
  readonly tagline = SITE_CONFIG.tagline;
  readonly mascotEmoji = SITE_CONFIG.mascotEmoji;
  readonly supportUrl = SITE_CONFIG.supportUrl;
}
