# dayelostra.co Redesign — Anduril/Palantir Monochrome + Amber

**Date:** 2026-06-16
**Type:** Visual restyle (no content rewrite, no new sections, no new features).
**Goal:** Move the personal site off the SigilArk/Accelera blue+gold navy identity to a stark, monochrome, high-contrast aesthetic in the spirit of anduril.com (dark, cinematic, industrial) and palantir.com (light, Swiss, restrained), unified by a single amber signal accent.

## Decisions (locked in brainstorming)

- **Hybrid light/dark:** Anduril near-black as the primary canvas, with one or two stark Palantir-white sections as deliberate breaks.
- **Monochrome + one accent:** black / white / grays only, plus a single amber accent `#d8792a` used interactive-first (links, buttons, focus rings, the terminal prompt) and on a few key emphasis terms per section.
- **Hero mesh:** keep the network motif, recolor to faint gray/white lines + nodes with a few amber nodes (drop the blue).
- **Accent discipline:** moderate — amber on interactive elements + at most a few high-value terms per section (IL levels, product names). Everything else white/gray. (Down from the current copy, which accents many phrases.)
- **Out of scope:** the Writing/Insights hub (deferred earlier), content rewrites, new sections, font changes, cinematic hero imagery (possible future).

## Aesthetic principles (the bar)

1. **Single value voice per zone.** Dark zones are near-black with subtle value steps; light zones are near-white. No navy, no gradients-as-decoration.
2. **Color is signal, not decoration.** Amber marks "you can act here" or "this matters," nothing else. If a use of amber is neither interactive nor a deliberate emphasis, it becomes white/gray.
3. **Type and space carry the page.** Large bold headlines, mono uppercase labels, generous spacing, thin hairline rules. Remove ambient glows/textures that substitute for hierarchy.
4. **Instrument-panel detailing, sparingly.** The bracket-corner card frames stay (they read as Anduril/HUD); they are recolored mono with amber only on hover/focus.

## Color tokens (`src/styles/main.css` `@theme`)

Replace the current palette. Keep token *names* so utilities (`bg-bg`, `text-accent`, etc.) keep working; only values change.

| Token | Old | New | Notes |
|---|---|---|---|
| `--color-bg` | `#0a0e2a` | `#0a0a0a` | near-black canvas |
| `--color-surface` | `#14264a` | `#171717` | card/elevated surface (neutral gray) |
| `--color-surface-2` | `#1f3863` | `#242424` | second elevation |
| `--color-border` | `rgba(255,255,255,.1)` | `rgba(255,255,255,.12)` | hairline |
| `--color-accent` | `#00adef` | `#d8792a` | amber signal |
| `--color-accent-deep` | `#004069` | `#6f3d14` | deep amber (gradients/edges) |
| `--color-accent-soft` | `rgba(0,173,239,.18)` | `rgba(216,121,42,.15)` | tints |
| `--color-text` | `#ebe5d5` | `#f4f4f5` | near-white (drop the cream) |
| `--color-text-dim` | `#939598` | `#a1a1aa` | neutral gray (verify AA per zone) |
| `--color-gold` | `#c1a066` | `#d8792a` | **collapse gold → amber** (single accent) |
| `--color-gold-deep` | `#5c4520` | `#6f3d14` | so `.acc-gold` sections become mono+amber, no markup change |

**Amber dual-context caveat (a11y, verified):** `#d8792a` on black is 6.31:1 (passes AA). On **white** it is 3.14:1 — fails AA for small text (ok for large ≥24px / UI components at 3:1). Rule: in white-break sections amber is allowed only on **large text or interactive** elements; for small accented text on white, use a darker amber `--color-accent-on-light: #a85c16` (4.99:1 on white). The axe CI gate (already in place) will catch violations. Verified ratios: white text on black 18:1, gray `#a1a1aa` on darkest band 7:1, near-black on white 18:1.

## Dark value bands (`.tint-*`)

Keep the section-banding rhythm built earlier, restated in near-black:

| Class | New value |
|---|---|
| `.tint-darker` | `#050505` |
| `.tint-deep` | `#0e0e0e` |
| `.tint-warm` | `#161616` (neutral, no warm cast now) |

## White-break sections (`.section-light`)

- `.section-light` background `#ffffff`, text `#141414` (Palantir-stark). (Was the warm-then-near-white personal-brand band.)
- **Two** white breaks for rhythm: **Voices/#endorsements** (already light) **+ About/#about** (narrative/bio reads well Palantir-white). All other sections near-black.
- In white sections: dark card variant (the dark testimonial card stays as a spotlight in Voices); section chrome (eyebrow, emphasis) uses `--color-accent-on-light` darker amber for small text, near-black for headings.
- Suppress glow blobs in light sections (already done).

## Decoration removal / recolor

| Element | Action |
|---|---|
| `.glow-blob`, `.glow-blob-deep`, `.glow-blob-gold` | Remove from markup (or `display:none`). No ambient glows. |
| `.hero-topo` | Remove (navy radial gradient base). |
| `.dot-grid`, `.dot-grid-accent`, `.dot-grid-gold`, `.dot-grid-fine` | Remove. (If any texture is wanted, a single faint `dot-grid-fine` at very low opacity may stay — default: remove.) |
| `.scanlines`, `.diagonal-lines`, `.grain` | Remove if used. |
| Hero mesh SVG (inline, hardcoded blue) | Recolor: lines/nodes `rgba(255,255,255,.10)`, a few nodes amber `#d8792a`. Drop blue `mesh-node-secondary`. |
| `.section-watermark*` | Keep as faint mono texture: recolor to `rgba(255,255,255,.04)` (dark) / `rgba(20,20,20,.05)` (light). Removal is an option for max austerity; default keep-faint. |
| `.corners` bracket frames | Keep. Recolor `--corner-color` to `rgba(255,255,255,.18)`; amber only on hover/focus. |
| `.divider-gradient` | Recolor to a neutral hairline `rgba(255,255,255,.12)`; drop the gold variant (now redundant). |

## Components

- **Buttons:** `btn-primary` = amber fill `#d8792a`, black text; **remove the accent glow box-shadow** (flat or 1px ring only). `btn-ghost` = white/12 ring, white text, hover white/5. Flat, no glow.
- **Glass cards:** `.glass` = `bg-surface/80` + `ring-white/10` + flat shadow (keep). `.glass-accent` / `.glass-gold` = flatten the navy/gold gradients to `--color-surface` with an optional 1px amber ring for the one "featured" card; no gradient.
- **Now/ticker bands** (`#now`, `#numbers`): neutral — `border-white/10`, `bg-white/[0.03]`; amber only on the live indicator.

## Accent-discipline pass (copy/markup)

Per-section, reduce `text-accent` (and the hardcoded gold `text-[#c1a066]`) usage to: interactive elements + **a few key terms per section** (max ~2-3 high-value: IL levels, product/program names). Convert the rest to `text-text` (white) or bold. This is enumerated per section in the implementation plan. Net effect: amber reads as deliberate signal, not highlighter.

## Typography

No font change. Keep Geist (grotesk) for headlines/body, IBM Plex Mono for uppercase labels/eyebrows/watermarks — both already on-aesthetic. Lean into existing large-bold-headline + mono-eyebrow patterns.

## Accessibility (gate already in place)

- Re-run the axe CI gate; target zero violations.
- Verify per-zone contrast: white text on near-black bands (high), gray `#a1a1aa` on each dark band (≥4.5 small), near-black on white (high), amber on black (interactive/large ok), amber-on-white only large/interactive else darker amber.
- Preserve existing a11y baseline (focus-visible ring now amber, prefers-reduced-motion, sidebar focus trap, skip semantics, touch targets).

## Files touched

- `src/styles/main.css` — tokens, tints, section-light, decoration rules, corners, dividers, buttons, cards, watermark, mesh-node colors.
- `index.html` — remove decoration divs (glow blobs, hero-topo, dot-grids), recolor inline hero-mesh SVG, accent-discipline edits per section, set `#about` to `.section-light`, drop `.acc-gold` where it no longer means anything (optional; tokens collapsed so it's a no-op).
- No JS changes expected (sidebar, reveal, typewriter, cycler unaffected).

## Success criteria

- Page reads monochrome black/white with amber as the only color, used as signal.
- Two clean white-break sections punctuate the dark run.
- No navy, no blue, no gold, no ambient glows/gradients.
- axe gate green; contrast verified per zone.
- Visual parity check via before/after screenshots at desktop + tablet + mobile.
