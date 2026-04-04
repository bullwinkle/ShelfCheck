import { Component, Input } from '@angular/core';
import type { SeverityClass } from '../../../shelf-check.config';

@Component({
  selector: 'app-severity-badge',
  standalone: true,
  template: `
    <span class="badge" [class]="badgeClass">{{ label }}</span>
  `,
  styles: [`
    :host { display: inline-block; }
  `],
})
export class SeverityBadgeComponent {
  @Input() severity: string = '';

  get label(): string {
    return this.severity || 'Unknown';
  }

  get badgeClass(): string {
    if (this.severity === 'Class I') return 'badge badge--class-i';
    if (this.severity === 'Class II') return 'badge badge--class-ii';
    if (this.severity === 'Class III') return 'badge badge--class-iii';
    return 'badge';
  }
}
