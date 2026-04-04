import { Component, Input } from '@angular/core';
import { COLORS, GRADE_THRESHOLDS } from '../../../shelf-check.config';
import type { Grade } from '../../../shelf-check.config';

@Component({
  selector: 'app-grade-badge',
  standalone: true,
  template: `
    <span
      class="grade"
      [style.background-color]="gradeColor"
      [style.color]="textColor"
      [title]="'Accountability Grade: ' + grade"
    >
      {{ grade }}
    </span>
  `,
  styles: [`
    :host { display: inline-block; }
    .grade {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      font-family: var(--font-headline);
      font-size: 1.1rem;
      font-weight: 700;
    }
  `],
})
export class GradeBadgeComponent {
  @Input() grade: Grade = 'C';

  get gradeColor(): string {
    return COLORS.gradeColors[this.grade] ?? '#666';
  }

  get textColor(): string {
    // Dark grades need light text
    const darkGrades: Grade[] = ['A+', 'A', 'A-', 'B+', 'D', 'D-', 'F'];
    return darkGrades.includes(this.grade) ? '#fff' : '#1a1a2e';
  }
}
