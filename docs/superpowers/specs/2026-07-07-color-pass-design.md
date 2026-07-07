# Color pass — dayelostra.co

**Date:** 2026-07-07
**Status:** Approved (design), pending implementation plan
**Scope:** Visual color pass only. No layout, font, content, or dependency changes.

## Goal

The site currently runs on a single muted slate (`#5b6b7d`, gold collapsed into it), inherited from the Colophon design story. It reads as bland and does not stand on its own as personal branding. Introduce Dayel's cross-brand accent colors — cyan `#39d7ff` and hot pink `#ff06b5` — so the site feels vivid, unique, and unmistakably his, while preserving the executive / federal C-level read and the WCAG AA a11y CI gate.

## Design principle: identity vs. function

Pink and cyan play different roles. This split is the core of the design.

- **Pink `#ff06b5` = signature color.** Scarce and always full-vivid. Only ever used in roles that are *never small text on a light ground*, so it never has to be deepened/muted. Its power comes from scarcity — a confident signature, not a repeated structural accent. Target: ~5 deliberate moments across the whole page.
- **Cyan `#39d7ff` = workhorse accent.** Carries the high-frequency functional load. Full-vivid in decoration/large/fills/data-viz where contrast rules don't apply; deepened to a teal for small text where the a11y gate requires ≥4.5:1.

Rationale: pink as a *primary* accent would (a) spend the scarcity that makes it premium and (b) force deepening into a magenta/maroon in small text, killing the neon pop. Cyan deepens gracefully to a clean, federal-adjacent teal. See collab discussion 2026-07-07.

## Token system

### Palette tokens (new)

| Token | Value | Role |
|---|---|---|
| `--color-accent-vivid` | `#39d7ff` | Vivid cyan for decoration, large fills, glows, dot-grids, dividers, data-viz. Not for small text on light. |
| `--color-signature` | `#ff06b5` | Hot pink. Scarce signature moments only. Never deepened. |
| `--color-signature-soft` | `rgba(255, 6, 181, 0.14)` | Soft pink fills/glow tint. |

### Zone token flips

**Light sections (default `@theme` scope):**
- `--color-accent` → deepened teal, **verified ≥ 4.5:1 on `#f4f5f7`** (target ~`#0e7490`; exact value confirmed with a contrast check at implementation time, a11y gate is the backstop).
- `--color-accent-deep` → one step darker teal for hover/active.
- `--color-accent-soft` → `rgba(57, 215, 255, 0.12)` (vivid-cyan tint; fills only, no contrast requirement).
- Every existing token-driven element (eyebrows, links, focus rings, timeline dots, `::selection`) recolors automatically from slate to teal/cyan. No per-element edits needed for these.

**Dark anchor sections (`.section-dark` scope — hero, flagship/Glyphon, connect):**
- `--color-accent` → full vivid `#39d7ff` (brilliant and AA-passing on near-black `#0a0a0a`).
- `--color-accent-deep` → lighter cyan (~`#7ee5ff`) for hover.
- Pink `#ff06b5` is also legible as text here (passes on near-black) — available for signature moments in these zones.

The existing `.acc-gold` no-op block and slate `--color-gold*` tokens are retired/repointed as part of the swap (gold was already collapsed into slate).

## The ~5 pink signature moments

Scarce by design. Each is a role where pink never becomes small-text-on-white.

1. **Hero typewriter cursor** (`#cursor`) → pink. Blinking, alive, first element the eye tracks. The single best scarce use. (Currently `var(--color-accent)`.)
2. **"Currently shipping" band** (`#now`) → a pulsing pink live-dot signaling active status.
3. **Velocity data-viz** (`#velocity`) → the one hero metric bar in pink; remaining bars in cyan.
4. **Primary CTA interaction peak** → buttons rest in cyan/slate, flash pink on hover/active.
5. **`::selection`** stays **cyan** (not pink) — keeps pink from feeling routine. (Listed to make the deliberate *non*-use explicit.)

Net visible pink: 4 active placements (moments 1–4). Adjustable during implementation, but the ceiling is intentional — do not proliferate.

## Revived glows (the primary bland-fix)

The current CSS force-hides all ambient glows globally (`main.css` ~L461: `.glow-blob, ... { display: none !important }`) and neutralizes dot-grids/textures (~L462). This flat treatment is why the dark sections in particular read as an inert void.

- Scope the glow revival to **dark anchor sections only**. Light sections stay clean Palantir-white (no washes — per "Accents + revived glows" decision, not the tinted-light-sections option).
- Dark anchors get faint **cyan** ambient glow blobs (repoint `.glow-blob` gradient from the old navy `rgba(0,173,239,...)` to `rgba(57,215,255,...)`).
- The **hero** additionally gets **one pink-edged glow** low in the composition — a single warm signature note against the cool cyan field.
- Keep glows subtle (existing blur/opacity ranges); `prefers-reduced-motion` already disables glow drift — preserve that.

## Non-goals / guardrails

- No layout, typography, content, spacing, or component-structure changes.
- No new fonts, images, or dependencies.
- Light section grounds remain untinted white/off-white.
- a11y CI gate (`tests/a11y/run.mjs`) must stay green: all small text uses verified-contrast variants; vivid `#39d7ff`/`#ff06b5` confined to decoration, large elements, fills, borders, data-viz, and dark-ground text.
- Federal C-level read preserved: pink is a scarce confident accent, never a dominant surface.
- OG card / favicon: out of scope for this pass (revisit separately if desired).

## Files touched (anticipated)

- `src/styles/main.css` — token definitions, zone flips, glow revival, signature-moment styles. Primary surface.
- `index.html` — surgical class/markup additions for the pink live-dot, data-viz bar, CTA states (only where a token flip can't reach).
- Possibly `src/scripts/*` — none expected; cursor/cycler already token-driven.

## Verification

- Run the a11y gate; confirm zero contrast regressions.
- Visual QA (Playwright screenshot) of: hero (cyan field + pink cursor + pink glow), a light section (teal accents), the "now" band (pink dot), velocity (pink hero bar), a dark anchor (cyan glow).
- Confirm `prefers-reduced-motion` still disables drift/pulse.
