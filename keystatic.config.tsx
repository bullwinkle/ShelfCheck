import { collection, config, fields } from '@keystatic/core';

export default config({
  storage: { kind: 'github', repo: 'bullwinkle/ShelfCheck' },
  collections: {
    articles: collection({
      label: 'Articles',
      slugField: 'title',
      path: 'src/content/articles/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        date: fields.date({ label: 'Date' }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Daily Digest', value: 'daily-digest' },
            { label: 'Deep Dive', value: 'deep-dive' },
            { label: 'Brand Report', value: 'brand-report' },
          ],
          defaultValue: 'daily-digest',
        }),
        severity: fields.select({
          label: 'Severity',
          options: [
            { label: 'Class I', value: 'class-1' },
            { label: 'Class II', value: 'class-2' },
            { label: 'Class III', value: 'class-3' },
            { label: 'Informational', value: 'informational' },
          ],
          defaultValue: 'informational',
        }),
        brands: fields.array(fields.text({ label: 'Brand' }), { label: 'Mentioned Brands' }),
        tldr: fields.text({ label: 'TL;DR', multiline: true }),
        verdict: fields.text({ label: 'Inspector Morsel Verdict', multiline: true }),
        content: fields.markdoc({ label: 'Content' }),
      },
    }),
  },
});
