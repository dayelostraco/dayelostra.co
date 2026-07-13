/**
 * Insights RSS feed.
 *
 * Auto-generated from the `insights` Content Collection. Drafts are
 * excluded in production. Sorted newest-first. Items carry title,
 * summary, link, byline, ISO pub date, and the full rendered body in
 * <content:encoded> (feeds are a clean ingestion path for answer
 * engines; the summary alone undersells the argument).
 */
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

const parser = new MarkdownIt();

/** Render a post body to sanitized HTML with absolute URLs. */
function renderBody(markdown: string, site: URL): string {
  const html = parser.render(markdown);
  const sanitized = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  });
  // Feed readers resolve relative URLs unreliably; absolutize root-relative links.
  return sanitized.replace(/(href|src)="\//g, `$1="${site.origin}/`);
}

export async function GET(context: APIContext) {
  const posts = await getCollection('insights', ({ data }) => !data.draft);
  const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  if (!context.site) {
    throw new Error('Astro `site` is not configured; cannot generate the Insights RSS feed.');
  }
  const site = context.site;

  return rss({
    title: 'Dayel Ostraco · Insights',
    description: 'Field notes on agents, identity, and shipping inside the federal boundary, from 20 years of mission engineering.',
    site,
    items: sorted.map(post => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: `/insights/${post.id}/`,
      author: 'Dayel Ostraco',
      content: post.body ? renderBody(post.body, site) : undefined,
    })),
    customData: '<language>en-us</language>',
  });
}
