/**
 * Insights RSS feed.
 *
 * Auto-generated from the `insights` Content Collection. Drafts are
 * excluded in production. Sorted newest-first. Items carry title,
 * summary, link, byline, and ISO pub date.
 */
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('insights', ({ data }) => !data.draft);
  const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  if (!context.site) {
    throw new Error('Astro `site` is not configured; cannot generate the Insights RSS feed.');
  }

  return rss({
    title: 'Dayel Ostraco · Insights',
    description: 'Field notes on agents, identity, and shipping inside the federal boundary, from 20 years of mission engineering.',
    site: context.site,
    items: sorted.map(post => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: `/insights/${post.id}`,
      author: 'Dayel Ostraco',
    })),
    customData: '<language>en-us</language>',
  });
}
