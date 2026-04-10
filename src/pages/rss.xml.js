import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const articles = (await getCollection('articles')).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  return rss({
    title: 'Shelf Check',
    description: 'Food recall intelligence from Inspector Morsel.',
    site: context.site,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.tldr,
      pubDate: article.data.date,
      link: `/articles/${article.slug}`,
    })),
  });
}
