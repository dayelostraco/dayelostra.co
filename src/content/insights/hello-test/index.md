---
title: "Hello, Insights"
date: 2026-07-12
summary: "A draft placeholder exercising the Insights template: numbered sections, an ordered list, a code block, and a link. Not published."
tags: ["scaffolding"]
readTime: "2 min read"
draft: true
bodyWatermark: "/DRAFT"
---

This paragraph exercises the drop cap and the lead accent rule. It is a placeholder post used only to verify the Insights template renders correctly in development. It never ships to production because `draft` is set to `true`.

## First numbered section

This section checks the auto-numbered H2 eyebrow and the accent divider above the heading. It also links to the [Insights index](/insights) to confirm the link treatment.

## Second numbered section

This section checks a fenced code block under the CSP-safe single-treatment override:

```ts
export function hello(name: string): string {
  return `Hello, ${name}.`;
}
```

It also checks a stylized ordered list:

1. First item, confirming the gutter numeral renders.
2. Second item, confirming spacing between items.
3. Third item, confirming the list terminates cleanly.
