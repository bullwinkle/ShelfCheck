import { Component } from '@angular/core';
import { DonateCTAComponent } from '../components/donate-cta.component';
import { SCORING_WEIGHTS, SEVERITY_SCORES, SITE_CONFIG } from '../../../shelf-check.config';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [DonateCTAComponent],
  template: `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">ℹ️ About & Methodology</h1>
        <p class="page-subtitle">
          How Inspector Morsel grades the food industry — and why transparency matters.
        </p>
      </div>

      <div class="content-cols">
        <div class="content-main">
          <section class="about-section">
            <h2>Who is Inspector Morsel?</h2>
            <p>
              Inspector Morsel 🦝 is Shelf Check's fictional mascot — a sharp-eyed raccoon in a lab coat
              who represents the kind of dogged, data-driven food safety journalism that the industry
              prefers doesn't exist.
            </p>
            <p>
              The name is a pun. The accountability is not.
            </p>
          </section>

          <section class="about-section">
            <h2>Data Sources</h2>
            <p>All recall data is sourced from:</p>
            <ul>
              <li>
                <strong>FDA Open Enforcement Reporting</strong> (openFDA API) —
                the primary source for food product recalls in the United States.
              </li>
            </ul>
            <p>
              Data is collected twice daily (06:00 and 18:00 UTC) via GitHub Actions.
              All raw data is committed to the repository for full historical traceability.
            </p>
          </section>

          <section class="about-section">
            <h2>Accountability Score Methodology</h2>
            <p>
              Every brand that appears in recall data receives an Accountability Score (0–100).
              Higher is worse. The score is a weighted composite:
            </p>
            <div class="scoring-breakdown">
              @for (item of scoringItems; track item.label) {
                <div class="score-item">
                  <div class="score-item__bar">
                    <div class="score-item__fill" [style.width.%]="item.weight * 100"></div>
                  </div>
                  <div class="score-item__info">
                    <strong>{{ item.label }}</strong> — {{ item.weight * 100 | number:'1.0-0' }}%
                    <p>{{ item.description }}</p>
                  </div>
                </div>
              }
            </div>
          </section>

          <section class="about-section">
            <h2>Severity Classification</h2>
            <table class="severity-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Definition</th>
                  <th>Score Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="badge badge--class-i">Class I</span></td>
                  <td>Reasonable probability of serious adverse health consequences or death</td>
                  <td class="text-danger">100 pts</td>
                </tr>
                <tr>
                  <td><span class="badge badge--class-ii">Class II</span></td>
                  <td>May cause adverse health consequences, slight probability of serious harm</td>
                  <td class="text-amber">50 pts</td>
                </tr>
                <tr>
                  <td><span class="badge badge--class-iii">Class III</span></td>
                  <td>Unlikely to cause adverse health consequences</td>
                  <td>10 pts</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="about-section">
            <h2>Grade Scale</h2>
            <p>
              Accountability Scores are converted to letter grades.
              <strong>Lower scores = better grades.</strong>
              A+ means very few recalls, responded quickly, minimal scope.
              F means chronic offender with severe recalls.
            </p>
          </section>

          <section class="about-section">
            <h2>AI-Generated Articles</h2>
            <p>
              Articles are generated using GitHub Models API (GPT-4.1-mini), with real recall data
              as context. All factual claims trace back to FDA data. Inspector Morsel's voice
              is enforced via system prompt — sardonic, data-driven, never preachy.
            </p>
            <p>
              Every article is clearly labeled with its generation date and the data window it covers.
            </p>
          </section>

          <section class="about-section">
            <h2>Repeat Offender Designation</h2>
            <p>
              A brand is flagged as a Repeat Offender when it has 3 or more recalls in any
              12-month rolling window. This designation persists until 24 months without a new recall.
            </p>
          </section>
        </div>

        <aside class="content-aside">
          <div class="aside-card">
            <h3>The Stack</h3>
            <ul>
              <li>🔧 AnalogJS (Angular SSG)</li>
              <li>📊 FDA Open Enforcement API</li>
              <li>🤖 GitHub Models (GPT-4.1-mini)</li>
              <li>⚡ GitHub Actions (2x/day)</li>
              <li>🌐 GitHub Pages</li>
            </ul>
          </div>
          <div class="aside-card">
            <h3>Cadence</h3>
            <ul>
              <li>📋 Daily Digest — 2x/day</li>
              <li>🔬 Deep Dive — Weekly (Sun)</li>
              <li>📈 State of the Plate — Monthly</li>
            </ul>
          </div>
        </aside>
      </div>

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
    .content-cols {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    @media (min-width: 900px) {
      .content-cols {
        grid-template-columns: 1fr 280px;
      }
    }
    .about-section {
      margin-bottom: 3rem;
    }
    .about-section h2 {
      font-size: 1.25rem;
      color: var(--color-amber);
      margin-bottom: 1rem;
    }
    .about-section p {
      color: var(--color-text-muted);
      margin-bottom: 0.75rem;
      line-height: 1.7;
    }
    .about-section ul {
      padding-left: 1.5rem;
      color: var(--color-text-muted);
      line-height: 1.8;
    }
    .about-section strong {
      color: var(--color-text);
    }
    .scoring-breakdown {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-top: 1rem;
    }
    .score-item {
      background: var(--color-navy-light);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1rem;
    }
    .score-item__bar {
      height: 6px;
      background: var(--color-navy-mid);
      border-radius: 3px;
      margin-bottom: 0.75rem;
      overflow: hidden;
    }
    .score-item__fill {
      height: 100%;
      background: var(--color-amber);
      border-radius: 3px;
    }
    .score-item__info strong {
      color: var(--color-white);
      font-size: 0.9rem;
    }
    .score-item__info p {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      margin: 0.25rem 0 0;
    }
    .severity-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    .severity-table th {
      text-align: left;
      padding: 0.75rem;
      background: var(--color-navy-light);
      color: var(--color-text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-bottom: 1px solid var(--color-border);
    }
    .severity-table td {
      padding: 0.75rem;
      border-bottom: 1px solid var(--color-border);
      color: var(--color-text-muted);
      vertical-align: top;
    }
    .aside-card {
      background: var(--color-navy-light);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      margin-bottom: 1rem;
    }
    .aside-card h3 {
      font-size: 0.9rem;
      color: var(--color-amber);
      margin-bottom: 0.75rem;
    }
    .aside-card ul {
      list-style: none;
      font-size: 0.85rem;
      color: var(--color-text-muted);
      line-height: 2;
    }
  `],
})
export default class AboutPageComponent {
  readonly scoringItems = [
    {
      label: 'Frequency',
      weight: SCORING_WEIGHTS.frequency,
      description: 'How often the brand appears in recall data, relative to peers',
    },
    {
      label: 'Severity',
      weight: SCORING_WEIGHTS.severity,
      description: 'Weighted average of Class I/II/III incidents',
    },
    {
      label: 'Response Speed',
      weight: SCORING_WEIGHTS.responseSpeed,
      description: 'How quickly recalls were initiated after incidents were identified',
    },
    {
      label: 'Scope',
      weight: SCORING_WEIGHTS.scope,
      description: 'Geographic distribution of affected products (national vs. regional)',
    },
  ];
}
