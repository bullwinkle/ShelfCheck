import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['daily-digest', 'deep-dive', 'brand-report']),
    severity: z.enum(['class-1', 'class-2', 'class-3', 'informational']),
    brands: z.array(z.string()).default([]),
    tldr: z.string(),
    verdict: z.string().default('Inspector Morsel is still rummaging through the evidence.'),
    chartData: z
      .object({
        labels: z.array(z.string()),
        values: z.array(z.number()),
        title: z.string(),
      })
      .optional(),
  }),
});

export const collections = { articles };
