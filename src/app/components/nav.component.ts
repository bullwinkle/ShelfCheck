import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SITE_CONFIG, NAV_ITEMS } from '../../../shelf-check.config';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="nav" [class.nav--open]="menuOpen()">
      <div class="container nav__inner">
        <a routerLink="/" class="nav__brand">
          <span class="nav__mascot">{{ mascotEmoji }}</span>
          <span class="nav__name">{{ siteName }}</span>
        </a>

        <button
          class="nav__toggle"
          (click)="toggleMenu()"
          [attr.aria-expanded]="menuOpen()"
          aria-label="Toggle navigation"
        >
          <span class="nav__toggle-bar"></span>
          <span class="nav__toggle-bar"></span>
          <span class="nav__toggle-bar"></span>
        </button>

        <ul class="nav__links" [class.nav__links--visible]="menuOpen()">
          @for (item of navItems; track item.path) {
            <li>
              <a
                [routerLink]="item.path"
                routerLinkActive="nav__link--active"
                [routerLinkActiveOptions]="{ exact: item.path === '/' }"
                class="nav__link"
                (click)="closeMenu()"
              >
                <span class="nav__link-icon">{{ item.icon }}</span>
                {{ item.label }}
              </a>
            </li>
          }
        </ul>
      </div>
    </nav>
  `,
  styles: [`
    .nav {
      background: var(--color-navy-light);
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 100;
      height: var(--nav-height);
    }
    .nav__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
    }
    .nav__brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-white);
      font-family: var(--font-headline);
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .nav__mascot {
      font-size: 1.5rem;
    }
    .nav__name {
      color: var(--color-amber);
    }
    .nav__links {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      list-style: none;
    }
    .nav__link {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.5rem 0.75rem;
      color: var(--color-text-muted);
      font-size: 0.85rem;
      font-weight: 500;
      border-radius: var(--radius-md);
      transition: color 0.2s, background 0.2s;
    }
    .nav__link:hover {
      color: var(--color-white);
      background: rgba(255,255,255,0.05);
    }
    .nav__link--active {
      color: var(--color-amber) !important;
    }
    .nav__link-icon {
      font-size: 0.9rem;
    }
    .nav__toggle {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
    }
    .nav__toggle-bar {
      display: block;
      width: 24px;
      height: 2px;
      background: var(--color-text);
      transition: all 0.3s ease;
    }

    @media (max-width: 767px) {
      .nav {
        height: auto;
      }
      .nav__inner {
        flex-wrap: wrap;
        padding: 0.75rem 1rem;
        height: auto;
      }
      .nav__toggle {
        display: flex;
      }
      .nav__links {
        display: none;
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
        padding: 0.5rem 0 1rem;
        gap: 0;
      }
      .nav__links--visible {
        display: flex;
      }
      .nav__link {
        width: 100%;
        padding: 0.75rem 0.5rem;
      }
    }
  `],
})
export class NavComponent {
  readonly siteName = SITE_CONFIG.name;
  readonly mascotEmoji = SITE_CONFIG.mascotEmoji;
  readonly navItems = NAV_ITEMS;
  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
