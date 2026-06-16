# dayelostra.co Redesign Implementation Plan — Palantir Light + Slate, Dark Anchors

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Restyle the personal site from the navy blue+gold identity to a light-dominant Palantir aesthetic (soft off-white, slate accent) with near-black Anduril dark anchors at the hero, Flagship, and Connect sections.

**Architecture:** Pure restyle. Most recoloring flows through the `@theme` color tokens in `src/styles/main.css` (utilities reference `var(--color-*)`). Dark anchors use a scoped `.section-dark` class that re-declares those custom properties (same pattern as the existing `.acc-gold`). A handful of CSS rules and the hero SVGs hardcode the old blue `#00adef` and are recolored directly. Decoration is neutralized in CSS rather than deleting dozens of divs.

**Tech Stack:** Vite + Tailwind v4 (`@theme`), single `index.html`, `src/styles/main.css`. Verification: `npm run build`, `npm run a11y:test` (axe gate added this session), live screenshots via `npm run dev`.

**Source spec:** `docs/superpowers/specs/2026-06-16-anduril-palantir-redesign-design.md`

**Adaptation note:** "tests" here are objective gates — build passes, axe gate green, per-zone contrast (verified in the spec), and visual screenshots at each step. The accent-discipline task (T8) is judgment-based editorial work with a per-section cap, not an enumerable code transform.

---

## Global verification (run after every task)

- `npm run build` → completes with no error.
- Live check: `npm run dev`, load `http://localhost:5173/`, screenshot the affected area. (Hard-refresh / cache-bust query if styles look stale.)

---

## Task 1: Swap the color tokens (navy+blue+gold → off-white+slate)

**Files:** Modify `src/styles/main.css` (the `@theme` block).

- [ ] **Step 1: Replace the palette values** (keep names)

Replace the current token block:
```css
  --color-bg: #0a0e2a;
  --color-surface: #14264a;
  --color-surface-2: #1f3863;
  --color-border: rgba(255, 255, 255, 0.1);
  --color-accent: #00adef;
  --color-accent-deep: #004069;
  --color-accent-soft: rgba(0, 173, 239, 0.18);
  --color-text: #ebe5d5;
  --color-text-dim: #939598;
  --color-gold: #c1a066;
  --color-gold-deep: #5c4520;
```
with:
```css
  --color-bg: #f4f5f7;
  --color-surface: #ffffff;
  --color-surface-2: #e9ebef;
  --color-border: rgba(0, 0, 0, 0.12);
  --color-accent: #5b6b7d;
  --color-accent-deep: #3c4753;
  --color-accent-soft: rgba(91, 107, 125, 0.12);
  --color-text: #141414;
  --color-text-dim: #565b63;
  --color-gold: #5b6b7d;
  --color-gold-deep: #3c4753;
```

- [ ] **Step 2: Build + screenshot**

Run: `npm run build` (expect success), then `npm run dev` and screenshot `/`.
Expected: site flips light; most sections off-white with dark text and slate accent. (Hero/Flagship/Connect still light at this point — fixed in T2. Hardcoded-blue bits like corners/mesh still blue — fixed later.)

- [ ] **Step 3: Commit**

```bash
git add src/styles/main.css
git commit -m "redesign(tokens): off-white base + slate accent (was navy/blue/gold)"
```

---

## Task 2: Dark-anchor scope (`.section-dark`) + apply to hero/Flagship/Connect

**Files:** Modify `src/styles/main.css`, `index.html` (lines ~187 hero `<section id="top">`, 520 `#glyphon`, 1015 `#connect`).

- [ ] **Step 1: Add the `.section-dark` scope** to `main.css` (after the `.acc-gold` block)

```css
/* --- dark anchor sections (scoped token flip, like .acc-gold) --- */
.section-dark {
  --color-text: #f4f4f5;
  --color-text-dim: #a1a1aa;
  --color-surface: #171717;
  --color-border: rgba(255, 255, 255, 0.14);
  --color-accent: #9aa9ba;          /* lighter slate: readable small on near-black */
  --color-accent-deep: #5b6b7d;
  background-color: #0a0a0a;
  color: #f4f4f5;
}
```

- [ ] **Step 2: Apply to the three anchor sections** in `index.html`

- `#top` (hero, ~line 187 `<section id="top" class="corners corners-lg relative flex min-h-screen ...">`): add `section-dark` to the class list.
- `#glyphon` (~line 520 `class="acc-gold corners corners-lg divider-gradient tint-deep ..."`): replace `tint-deep` with `section-dark`.
- `#connect` (~line 1015 `class="acc-gold tint-darker ..."`): replace `tint-darker` with `section-dark`.

- [ ] **Step 3: Build + screenshot the three anchors**

Run build + dev; screenshot hero, Flagship, Connect.
Expected: all three near-black with light text; light body sections between. Cards inside them may still look light (fixed in T6); accent text inside reads as lighter slate.

- [ ] **Step 4: Commit**

```bash
git add src/styles/main.css index.html
git commit -m "redesign(anchors): .section-dark scope on hero, Flagship, Connect"
```

---

## Task 3: Light value bands + white Voices feature

**Files:** Modify `src/styles/main.css` (`.tint-*`, `.section-light`).

- [ ] **Step 1: Replace the band values**

Replace:
```css
.tint-darker { background-color: #05060f; }
.tint-deep   { background-color: #0c1234; }
.tint-warm   { background-color: #15183c; }
```
with:
```css
.tint-warm   { background-color: #f4f5f7; }
.tint-deep   { background-color: #eceef1; }
.tint-darker { background-color: #e6e8ec; }
```

- [ ] **Step 2: Update `.section-light`** (Voices stays the pure-white feature)

Replace the existing `.section-light { background-color: #f5f6f8; color: #161922; }` with:
```css
.section-light { background-color: #ffffff; color: #141414; }
```
(Leave the existing `.section-light .glow-blob*` suppression and watermark override rules; they remain valid.)

- [ ] **Step 3: Build + screenshot the light bands + Voices**

Expected: subtle off-white step rhythm between light sections; Voices a crisp pure-white spotlight.

- [ ] **Step 4: Commit**

```bash
git add src/styles/main.css
git commit -m "redesign(bands): light off-white value steps + pure-white Voices feature"
```

---

## Task 4: Neutralize decoration (glows, topo, dot-grids, textures)

**Files:** Modify `src/styles/main.css` (append a neutralization block).

- [ ] **Step 1: Append decoration-off rules**

```css
/* --- decoration removed for the redesign (was navy ambient texture) --- */
.glow-blob, .glow-blob-deep, .glow-blob-gold, .hero-topo { display: none !important; }
.dot-grid, .dot-grid-accent, .dot-grid-gold, .dot-grid-fine,
.scanlines, .diagonal-lines, .grain { background-image: none !important; }
```

- [ ] **Step 2: Build + screenshot**

Expected: no ambient glows/gradients/grain/dot textures anywhere; flat clean light surfaces.

- [ ] **Step 3: Commit**

```bash
git add src/styles/main.css
git commit -m "redesign(decoration): remove glows, topo, dot-grids, textures"
```

---

## Task 5: Recolor the hero mesh SVG (drop blue)

**Files:** Modify `index.html` (mesh SVG ~lines 219-260), `src/styles/main.css` (`.mesh-node-secondary`).

- [ ] **Step 1: Recolor the mesh lines + nodes** in `index.html`

In the mesh `<svg>` (the `-z-[5]` one): change the line group `<g stroke="#00adef" stroke-width="0.6" opacity="0.35">` to `stroke="#ffffff"` with `opacity="0.10"`, and the node group `<g fill="#00adef">` to `fill="#9aa9ba"`. (Hero is dark now, so faint white lines + light-slate nodes.)

- [ ] **Step 2: Check the second hero SVG (~line 187, `-z-[28]`)**

Inspect it; if it has hardcoded `#00adef`/blue fills or strokes, recolor to `rgba(255,255,255,0.06)` (faint on dark) or leave if it is already neutral/now hidden by a removed decoration. If it is purely a navy gradient backdrop, neutralize it (it conflicts with the dark anchor) by removing its fill or setting it transparent.

- [ ] **Step 3: Recolor `.mesh-node-secondary`** in `main.css`

Replace `.mesh-node-secondary { fill: rgba(0, 173, 239, 0.7); }` with:
```css
.mesh-node-secondary { fill: rgba(154, 169, 186, 0.7); }
```

- [ ] **Step 4: Build + screenshot the hero**

Expected: hero mesh reads as faint white/slate network on near-black; no blue.

- [ ] **Step 5: Commit**

```bash
git add index.html src/styles/main.css
git commit -m "redesign(hero): recolor mesh to mono+slate, drop blue"
```

---

## Task 6: Components — buttons, cards, corners, dividers, timeline (per zone)

**Files:** Modify `src/styles/main.css`.

- [ ] **Step 1: Flatten the primary button** (remove the blue glow)

Replace:
```css
@utility btn-primary {
  @apply btn bg-accent text-bg hover:bg-accent/90 shadow-[0_0_0_1px_rgba(0,173,239,0.3),0_8px_32px_-8px_rgba(0,173,239,0.5)];
}
```
with:
```css
@utility btn-primary {
  @apply btn bg-accent text-white hover:bg-accent-deep;
}
```

- [ ] **Step 2: Cards — light by default, dark inside `.section-dark`**

Replace:
```css
@utility glass {
  @apply relative overflow-hidden bg-surface/80 ring-1 ring-white/15 backdrop-blur-md shadow-[0_8px_30px_-12px_rgba(0,0,0,0.7)];
}
```
with:
```css
@utility glass {
  @apply relative overflow-hidden bg-surface ring-1 ring-black/10 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_10px_30px_-18px_rgba(0,0,0,0.30)];
}
```
Then append a dark-zone card override:
```css
.section-dark .glass { --tw-ring-color: rgba(255,255,255,0.14); box-shadow: 0 0 0 1px rgba(255,255,255,0.10), 0 10px 30px -18px rgba(0,0,0,0.6); }
```
Also flatten the gradient card variants — replace the `glass-accent` / `glass-gold` bodies with:
```css
@utility glass-accent { @apply relative overflow-hidden bg-surface ring-1 ring-black/10; }
@utility glass-gold   { @apply relative overflow-hidden bg-surface ring-1 ring-black/10; }
```
(and the same `--tw-ring-color` dark override already applies via `.section-dark .glass`; add `.section-dark .glass-accent, .section-dark .glass-gold { --tw-ring-color: rgba(255,255,255,0.14); }`).

- [ ] **Step 3: Corners — per zone, drop gold**

Replace `.corners { --corner-color: rgba(0, 173, 239, 0.4); }` with:
```css
.corners { --corner-color: rgba(0, 0, 0, 0.28); }
```
Replace the gold corner rule:
```css
.acc-gold .corners,
.corners.acc-gold { --corner-color: rgba(193, 160, 102, 0.45); }
```
with a dark-zone rule:
```css
.section-dark .corners,
.section-dark.corners { --corner-color: rgba(255, 255, 255, 0.22); }
```

- [ ] **Step 4: Dividers — neutral hairline, drop gold variant**

Replace `background: linear-gradient(to right, transparent, rgba(0, 173, 239, 0.5), transparent);` (in `.divider-gradient::before`) with:
```css
  background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.12), transparent);
```
Replace the `.acc-gold.divider-gradient::before { ... gold ... }` rule with:
```css
.section-dark .divider-gradient::before,
.section-dark.divider-gradient::before { background: linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent); }
```

- [ ] **Step 5: Timeline rule + dot (Missions) — recolor blue → slate**

Replace the two `rgba(0, 173, 239, ...)` uses in `.timeline-rule` and `.timeline-dot` with the slate equivalents:
```css
.timeline-rule { background: linear-gradient(to bottom, transparent, rgba(91,107,125,0.4) 10%, rgba(91,107,125,0.4) 90%, transparent); }
.timeline-dot  { background: var(--color-accent); box-shadow: 0 0 0 4px rgba(91,107,125,0.15), 0 0 0 8px rgba(91,107,125,0.06); }
```

- [ ] **Step 6: Build + screenshot a light card section + a dark anchor + Missions**

Expected: white cards with hairline on light; dark cards in anchors; bracket corners visible per zone; slate divider hairlines; slate timeline.

- [ ] **Step 7: Commit**

```bash
git add src/styles/main.css
git commit -m "redesign(components): flat slate buttons, per-zone cards/corners/dividers/timeline"
```

---

## Task 7: Watermarks — faint mono per zone

**Files:** Modify `src/styles/main.css`.

- [ ] **Step 1: Recolor watermark pseudo-content**

Replace:
```css
.section-watermark::before { ... color: rgba(0, 173, 239, 0.07); ... }
.section-watermark-text::before { ... color: rgba(235, 229, 213, 0.05); ... }
```
(the `color` lines only) with `color: rgba(20, 20, 20, 0.05);` for both. Replace the `.acc-gold .section-watermark::before, .acc-gold .section-watermark-text::before { color: rgba(193,160,102,0.09); }` rule with:
```css
.section-dark .section-watermark::before,
.section-dark .section-watermark-text::before { color: rgba(255, 255, 255, 0.05); }
```

- [ ] **Step 2: Build + screenshot a light section + a dark anchor watermark**

Expected: faint dark watermark on light; faint white watermark on dark; no blue/gold.

- [ ] **Step 3: Commit**

```bash
git add src/styles/main.css
git commit -m "redesign(watermark): faint mono per zone"
```

---

## Task 8: Accent-discipline pass (copy/markup)

**Files:** Modify `index.html`. Judgment-based; per-section cap.

Context: there are ~124 `text-accent` and 6 `text-[#c1a066]` usages. Many `text-accent` are interactive (links/buttons) and **stay**. The job is to pull back *emphasis* accents in body copy.

- [ ] **Step 1: Apply the rule, section by section**

For each section (`#velocity, #about, #lab, #glyphon, #products, #missions, #endorsements, #stack, #certs, #resume, #connect`):
- **Keep** `text-accent` on interactive elements (links `<a>`, buttons) and the live/now indicator.
- **Keep** at most ~2–3 high-value emphasis terms per section (IL levels, product/program names like Glyphon/Colophon, a headline keyword).
- **Convert** every other emphasis `<span class="text-accent">…</span>` in body copy to plain text (remove the class) or `class="font-semibold text-text"` if emphasis is still wanted.
- Convert the 6 `text-[#c1a066]` (hardcoded gold, e.g. the Stack card category labels) to `text-text-dim` (they are labels, not accents).

- [ ] **Step 2: Verify the reduction**

Run: `grep -oc 'text-accent' index.html` and confirm it dropped substantially (target: well under 124; interactive uses remain). Run `grep -oc 'text-\[#c1a066\]' index.html` → expect `0`.

- [ ] **Step 3: Build + screenshot 3-4 representative sections**

Expected: slate appears as occasional signal, not highlighter; body copy reads mono.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "redesign(copy): accent-discipline pass — slate as signal, not highlighter"
```

---

## Task 9: Final verification — a11y gate, contrast, responsive

**Files:** none (verification); fixes only if needed.

- [ ] **Step 1: Run the axe gate**

Run: `npm run build`, then serve + `npm run a11y:test` (or push to PR and let the Accessibility workflow run).
Expected: 0 violations across light + dark zones. If contrast violations appear, the offending text/zone needs a darker (light zone) or lighter (dark zone) value per the spec's contrast table; fix and re-run.

- [ ] **Step 2: Per-zone contrast spot-check (manual)**

Confirm against the spec table: light text/dim/slate on off-white; white/dim/lighter-slate on dark anchors. (Values already verified in the spec; this confirms nothing regressed in implementation.)

- [ ] **Step 3: Responsive screenshots**

Screenshot full page at 1280, 834 (tablet), and 375 (mobile). Confirm: nav still collapses correctly (the lg breakpoint fix from earlier), dark anchors render at all widths, no horizontal overflow at 320 (reflow).

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "redesign(a11y): per-zone contrast + responsive verification fixes"
```

---

## Self-review against spec

- **Spec coverage:** tokens (T1), `.section-dark` + anchors (T2), light bands + white Voices (T3), decoration removal (T4), hero mesh recolor (T5), buttons/cards/corners/dividers/timeline (T6), watermarks (T7), accent discipline (T8), a11y + responsive (T9). All spec sections mapped. The spec's hardcoded-blue CSS rules (corners, dividers, watermark, mesh, timeline) are each explicitly recolored.
- **Placeholder scan:** no TBD/TODO. T5 Step 2 ("check the second hero SVG") is an inspect-then-recolor with a concrete fallback (faint white / neutralize); acceptable as the only inline-judgment step besides the editorial pass.
- **Consistency:** token names unchanged so utilities keep resolving; `.section-dark` overrides the same custom properties everywhere; slate `#5b6b7d` (light) vs `#9aa9ba` (dark anchors) used consistently; `acc-gold` left as a now-harmless no-op (collapses to slate) and its gold CSS rules are all replaced with `.section-dark` equivalents.
