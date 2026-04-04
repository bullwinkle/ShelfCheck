import { Component, Input } from '@angular/core';
import { SITE_CONFIG } from '../../../shelf-check.config';

@Component({
  selector: 'app-share-buttons',
  standalone: true,
  template: `
    <div class="share">
      <span class="share__label">Share:</span>
      <a [href]="twitterUrl" target="_blank" rel="noopener" class="share__btn share__btn--twitter" title="Share on Twitter/X">
        𝕏
      </a>
      <a [href]="linkedinUrl" target="_blank" rel="noopener" class="share__btn share__btn--linkedin" title="Share on LinkedIn">
        in
      </a>
      <button class="share__btn share__btn--copy" (click)="copyLink()" title="Copy link">
        {{ copied ? '✓' : '🔗' }}
      </button>
    </div>
  `,
  styles: [`
    .share {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .share__label {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      font-weight: 500;
    }
    .share__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 700;
      transition: background 0.2s;
      border: none;
      cursor: pointer;
      text-decoration: none;
    }
    .share__btn--twitter { background: #000; color: #fff; }
    .share__btn--linkedin { background: #0077b5; color: #fff; }
    .share__btn--copy { background: var(--color-navy-mid); color: var(--color-text); }
    .share__btn:hover { opacity: 0.85; }
  `],
})
export class ShareButtonsComponent {
  @Input() title: string = '';
  @Input() url: string = '';

  copied = false;

  get twitterUrl(): string {
    const text = encodeURIComponent(`${this.title} — via ${SITE_CONFIG.twitterHandle}`);
    const link = encodeURIComponent(this.url || window?.location?.href || '');
    return `https://twitter.com/intent/tweet?text=${text}&url=${link}`;
  }

  get linkedinUrl(): string {
    const link = encodeURIComponent(this.url || window?.location?.href || '');
    return `https://www.linkedin.com/sharing/share-offsite/?url=${link}`;
  }

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.url || window?.location?.href || '');
      this.copied = true;
      setTimeout(() => { this.copied = false; }, 2000);
    } catch {
      // Fallback: do nothing
    }
  }
}
