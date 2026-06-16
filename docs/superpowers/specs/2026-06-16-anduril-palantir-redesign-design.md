# dayelostra.co Redesign — Palantir Light + Slate, with Dark Anchors

**Date:** 2026-06-16
**Type:** Visual restyle (no content rewrite, no new sections, no new features).
**Goal:** Move the personal site off the SigilArk/Accelera blue+gold navy identity to a stark, restrained, high-contrast aesthetic in the spirit of palantir.com (light, Swiss, editorial) with anduril.com gravity (near-black anchors), unified by a single slate signal accent.

> Supersedes the first draft of this spec (dark Anduril base + amber). Live mockups showed the near-black base read "way too dark" and amber "didn't work." Direction pivoted to **light-dominant + slate**, validated by mockup v3.

## Decisions (locked in brainstorming + mockups)

- **Light-dominant (Palantir), dark anchors (Anduril).** Soft off-white canvas; near-black sections used as deliberate anchors for gravity, not zebra-striping.
- **Off-white base, not pure white.** Pure `#ffffff` is reserved for cards/elevated surfaces — this removes the glare and gives white cards something to sit on.
- **Single slate accent `#5b6b7d`,** interactive-first (links, buttons, focus rings, terminal prompt) + a few key emphasis terms per section. Barely-there cool, clearly not the old saturated brand blue.
- **Dark anchors:** the **hero (#top)**, the **Flagship/Glyphon feature (#glyphon)**, and the **Connect/footer (#connect)**. Everything else light.
- **Hero mesh** kept but recolored mono (the hero is now dark): faint white lines/nodes + a few slate nodes; drop the blue.
- **Accent discipline:** moderate — slate on interactive + a few high-value terms per section; the rest white/black/gray.
- **Out of scope:** Writing/Insights hub (deferred), content rewrites, new sections, font changes, cinematic hero imagery (possible future).

## Aesthetic principles (the bar)

1. **Light dominant, dark for intent.** The page reads as a light site. Dark appears only where it means something (open, one feature, close).
2. **Off-white, never glare-white, as canvas.** Pure white = cards/surfaces only.
3. **Color is signal, not decoration.** Slate marks "act here" or "this matters." Anything else slate becomes black/white/gray.
4. **Type and space carry it.** Big bold headlines, mono uppercase labels, hairline rules, generous whitespace. Remove ambient glows/textures.
5. **Instrument-panel detailing, sparingly.** Bracket-corner card frames stay; recolored per zone (dark on light, light on dark).

## Color tokens (`src/styles/main.css` `@theme`)

Keep token *names* so utilities keep working; values change.

| Token | Old | New | Notes |
|---|---|---|---|
| `--color-bg` | `#0a0e2a` | `#f4f5f7` | soft off-white canvas |
| `--color-surface` | `#14264a` | `#ffffff` | pure white = cards only |
| `--color-surface-2` | `#1f3863` | `#e9ebef` | second elevation (light) |
| `--color-border` | `rgba(255,255,255,.1)` | `rgba(0,0,0,.12)` | hairline on light |
| `--color-accent` | `#00adef` | `#5b6b7d` | slate (5.01:1 small on off-white ✓) |
| `--color-accent-deep` | `#004069` | `#3c4753` | deep slate (8.68:1 — strong-emphasis on light) |
| `--color-accent-soft` | `rgba(0,173,239,.18)` | `rgba(91,107,125,.12)` | tints |
| `--color-text` | `#ebe5d5` | `#141414` | near-black (16.9:1 on off-white) |
| `--color-text-dim` | `#939598` | `#565b63` | gray (6.27:1 on off-white ✓) |
| `--color-gold` | `#c1a066` | `#5b6b7d` | **collapse gold → slate** (single accent, no markup churn) |
| `--color-gold-deep` | `#5c4520` | `#3c4753` | so `.acc-gold` sections become mono+slate |

## Dark-anchor mechanism (`.section-dark`)

Add a `.section-dark` class that **scopes the tokens** (same CSS-custom-property pattern `.acc-gold` already uses), so every token-based utility inside flips correctly:

```css
.section-dark {
  --color-text: #f4f4f5;             /* 18:1 on #0a0a0a */
  --color-text-dim: #a1a1aa;         /* 7.72:1 */
  --color-surface: #171717;          /* dark cards */
  --color-border: rgba(255,255,255,.14);
  --color-accent: #9aa9ba;           /* lighter slate: 8.26:1 small on dark (base #5b6b7d is only 3.62:1) */
  background-color: #0a0a0a;
  color: #f4f4f5;
}
```

Apply `.section-dark` to `#top`, `#glyphon`, `#connect` in `index.html` (replacing their current `tint-*` classes there). The lighter-slate accent override is the load-bearing a11y detail: slate accent text is unreadable on near-black at the base shade.

## Light value bands (`.tint-*`)

Subtle steps on the off-white, for gentle rhythm between light sections:

| Class | New value |
|---|---|
| `.tint-warm` | `#f4f5f7` (= base) |
| `.tint-deep` | `#eceef1` |
| `.tint-darker` | `#e6e8ec` |

## Light feature section (`.section-light`)

- Keep `.section-light` = pure `#ffffff`, text `#141414` — used for **Voices/#endorsements** as a crisp white spotlight within the off-white body (the dark testimonial card still floats on it). One light feature; the rest is the off-white bands.

## Decoration removal / recolor

| Element | Action |
|---|---|
| `.glow-blob`, `.glow-blob-deep`, `.glow-blob-gold` | Remove from markup. No ambient glows. |
| `.hero-topo` | Remove. |
| `.dot-grid`, `.dot-grid-accent`, `.dot-grid-gold`, `.dot-grid-fine` | Remove. |
| `.scanlines`, `.diagonal-lines`, `.grain` | Remove if used. |
| Hero mesh SVG (inline, hardcoded blue) | Hero is now dark: recolor lines/nodes `rgba(255,255,255,.10)`, a few nodes slate `#9aa9ba`. Drop blue `mesh-node-secondary`. |
| `.section-watermark*` | Faint texture: `rgba(20,20,20,.05)` on light; `rgba(255,255,255,.05)` inside `.section-dark`. (Removal optional for max austerity; default keep-faint.) |
| `.corners` bracket frames | Keep. Light zones: corner color `rgba(0,0,0,.28)`. `.section-dark` zones: `rgba(255,255,255,.22)`. Slate on hover/focus. |
| `.divider-gradient` | Neutral hairline: `rgba(0,0,0,.12)` light / `rgba(255,255,255,.12)` in dark anchors. Drop the gold variant. |

## Components

- **Buttons:** `btn-primary` = slate fill `#5b6b7d`, white text; **flat** (remove the accent glow box-shadow), 1px ring at most. `btn-ghost` = dark ring on light (`inset 0 0 0 1px rgba(0,0,0,.28)`), light ring inside `.section-dark`. White/black text per zone.
- **Cards (`.glass`):** light zones = `#ffffff` + hairline `rgba(0,0,0,.10)` + soft shadow. `.section-dark .glass` = `#171717` + light hairline + deeper shadow. Drop `backdrop-blur` (no translucency needed). `.glass-accent`/`.glass-gold` gradients flattened to surface + optional 1px slate ring for one "featured" card.
- **Ticker/now bands (`#now`, `#numbers`):** neutral hairlines (`rgba(0,0,0,.10)`), slate only on the live indicator.

## Accent-discipline pass (copy/markup)

Per section, reduce `text-accent` (and hardcoded gold `text-[#c1a066]`) to: interactive elements + **a few key terms per section** (max ~2–3: IL levels, product/program names). Convert the rest to `text-text` or bold. Enumerated per section in the implementation plan. Net: slate reads as deliberate signal, not highlighter.

## Typography

No font change. Geist (grotesk) headlines/body, IBM Plex Mono uppercase labels/eyebrows/watermarks — both already on-aesthetic. Lean into existing large-headline + mono-eyebrow patterns and more whitespace.

## Accessibility (gate already in place)

Verified contrast (this spec's values):

| Zone | Pairing | Ratio | AA |
|---|---|---|---|
| Light | text `#141414` on off-white | 16.9:1 | ✓ |
| Light | dim `#565b63` on off-white | 6.27:1 | ✓ |
| Light | slate `#5b6b7d` small | 5.01:1 | ✓ |
| Dark anchor | white `#f4f4f5` on `#0a0a0a` | 18:1 | ✓ |
| Dark anchor | dim `#a1a1aa` on `#0a0a0a` | 7.72:1 | ✓ |
| Dark anchor | base slate `#5b6b7d` small | 3.62:1 | ✗ → use `#9aa9ba` (8.26:1) |

- Re-run the axe CI gate (added this session); target zero violations across light + dark zones.
- Focus-visible ring becomes slate (per zone via the scoped accent), still ≥3:1 against its background.
- Preserve a11y baseline: prefers-reduced-motion, sidebar focus trap, skip semantics, touch targets.

## Files touched

- `src/styles/main.css` — tokens; new `.section-dark` scope; `.tint-*`; `.section-light`; decoration removal; corners; dividers; buttons; cards; watermark; mesh-node colors.
- `index.html` — remove decoration divs (glow blobs, hero-topo, dot-grids); add `.section-dark` to `#top`, `#glyphon`, `#connect` (replacing their `tint-*`); recolor inline hero-mesh SVG; accent-discipline edits per section.
- No JS changes (sidebar, reveal, typewriter, cycler unaffected).

## Success criteria

- Reads as a light, restrained site with slate as the only color, used as signal.
- Three dark anchors (hero, Flagship, Connect) give gravity; no zebra-striping.
- No navy, blue, gold, glows, or gradients-as-decoration.
- axe gate green; contrast verified per zone (table above).
- Before/after screenshots at desktop + tablet + mobile.
