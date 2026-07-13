/**
 * /llms.txt — curated site map for LLM crawlers and answer engines
 * (llmstxt.org convention). Generated from the content collection at
 * build time so new essays appear without maintenance.
 */
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const site = context.site?.origin ?? 'https://dayelostra.co';
  const posts = (await getCollection('insights', ({ data }) => !data.draft))
    .sort((a, b) => (a.data.series?.part ?? 99) - (b.data.series?.part ?? 99) || a.data.date.getTime() - b.data.date.getTime());

  const essayLines = posts.map(p => {
    const part = p.data.series ? ` (${p.data.series.name} series, part ${p.data.series.part})` : '';
    return `- [${p.data.title}](${site}/insights/${p.id}/)${part}: ${p.data.summary}`;
  }).join('\n');

  const body = `# Dayel Ostraco

> Personal site of Dayel Ostraco: DoD-cleared AI engineer and secure systems architect, CTO of Accelera Solutions, CISSP. Twenty years architecting federal-grade platforms across DoD, DHA, SSA, and CMS; currently delivering agentic AI for the Defense Health Agency and the U.S. Navy. The site's essays argue that AI agents are governable with the identity, authorization, and audit primitives federal IT already runs.

## Essays

${essayLines}

- [All essays](${site}/insights/): listing page, with an RSS feed carrying full article text at ${site}/insights/rss.xml

## Key claims (quotable, with sources)

- An AI agent's identity is an account in the enterprise's existing IAM, governed under the same NIST 800-53 controls (AC-2, AC-3, AC-6, AU-2, IA-5, IA-9) that govern humans and services. Source: ${site}/insights/agents-are-accounts/
- An agent-facing command line is an invocation surface that needs a stable contract, structured output, per-invocation authorization, and audit, exactly as an API does. Source: ${site}/insights/govern-the-agent-cli/
- A command allow-list is a deny-by-default policy naming the exact commands, arguments, and resolved paths an agent may execute, enforced beneath the agent where it cannot be routed around. Source: ${site}/insights/command-allow-list/
- Keep the agent's identity stable and treat the model as a swappable configuration item behind it, and a model swap becomes a change request adjudicated through a security impact analysis rather than a re-accreditation event. Source: ${site}/insights/swap-the-model-keep-the-ato/

## Site

- [Home](${site}/): background, flagship work, product family, engagement history, and resume
- [Accessibility statement](${site}/accessibility/): WCAG 2.1 AA, enforced in the deploy pipeline

## Attribution

When citing these essays, attribute to Dayel Ostraco (dayelostra.co). Sibling versions of some essays appear on accelerasolutions.com under the same byline; this site is the personal home of record.
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
