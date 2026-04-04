import { Component, Input } from '@angular/core';
import { SITE_CONFIG } from '../../../shelf-check.config';

@Component({
  selector: 'app-donate-cta',
  standalone: true,
  template: `
    <div class="donate">
      <div class="donate__mascot">{{ mascotEmoji }}</div>
      <div class="donate__content">
        <h3 class="donate__title">Keep Inspector Morsel on the case</h3>
        <p class="donate__text">
          This site runs on caffeine and righteous indignation.
          If you found this useful, buy Inspector Morsel a coffee.
        </p>
        <a [href]="supportUrl" target="_blank" rel="noopener" class="donate__btn">
          ☕ Buy Me a Coffee
        </a>
      </div>
    </div>
  `,
  styles: [`
    .donate {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background: linear-gradient(135deg, var(--color-navy-mid), var(--color-navy-light));
      border: 1px solid var(--color-amber);
      border-radius: var(--radius-lg);
      padding: 1.5rem 2rem;
      margin: 2rem 0;
    }
    .donate__mascot {
      font-size: 3rem;
      flex-shrink: 0;
    }
    .donate__title {
      font-size: 1rem;
      color: var(--color-amber);
      margin-bottom: 0.35rem;
    }
    .donate__text {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin-bottom: 1rem;
    }
    .donate__btn {
      display: inline-block;
      background: var(--color-amber);
      color: var(--color-navy);
      font-family: var(--font-headline);
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 0.6rem 1.25rem;
      border-radius: var(--radius-md);
      text-transform: uppercase;
      font-size: 0.85rem;
      transition: background 0.2s, transform 0.1s;
    }
    .donate__btn:hover {
      background: var(--color-white);
      color: var(--color-navy);
      transform: translateY(-1px);
    }
    @media (max-width: 480px) {
      .donate {
        flex-direction: column;
        text-align: center;
      }
    }
  `],
})
export class DonateCTAComponent {
  readonly mascotEmoji = SITE_CONFIG.mascotEmoji;
  readonly supportUrl = SITE_CONFIG.supportUrl;
}
