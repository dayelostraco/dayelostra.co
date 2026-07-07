# Color Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce Dayel's cross-brand accent colors — cyan `#39d7ff` (workhorse) and hot pink `#ff06b5` (scarce signature) — replacing the muted slate, without breaking the WCAG AA a11y gate or the executive/federal read.

**Architecture:** Nearly all accent color funnels through a handful of CSS custom-property tokens in `src/styles/main.css` (`--color-accent`, `--color-accent-deep`, `--color-accent-soft`) that flip per zone (light default vs `.section-dark`). Swapping those token values recolors ~90% of the site automatically. Pink is added as a new `--color-signature` token used in ~4 surgical HTML spots. Ambient glows (currently force-disabled) are revived on the two dark anchor sections only.

**Tech Stack:** Tailwind CSS v4 (`@theme` tokens auto-generate `text-*`/`bg-*`/`border-*` utilities), Vite, Playwright + axe-core a11y gate.

## Global Constraints

- **No layout, typography, content, spacing, font, image, or dependency changes.** Color only.
- **a11y CI gate must stay green.** `npm run a11y:test` runs axe-core WCAG 2.0/2.1 A+AA against the built `/` and `/accessibility.html`. axe tests **static rendered state only** (hover/active states are not evaluated).
- **Contrast rule for small text on LIGHT grounds:** must be ≥ 4.5:1. Vivid `#39d7ff` (~1.6:1) and `#ff06b5` (~4.0:1) are NOT allowed as small text on light. Small text on light uses the deepened teal `#0e7490` (verified 4.9:1 on `#f4f5f7`, 5.36:1 on `#ffffff`).
- **Large text (≥24px, or ≥18.66px bold)** needs only 3:1 — pink `#ff06b5` at ~4.0:1 on white is allowed here.
- **On DARK grounds (`#0a0a0a`):** both `#39d7ff` (11.2:1) and `#ff06b5` (5.4:1) pass as normal text.
- **Pink is scarce:** ceiling of ~4 active placements total. Do not proliferate.
- **Light section grounds stay untinted white/off-white.** Glow revival is scoped to `.section-dark` only.
- **Verification loop per task** (there are no unit tests for visual CSS; the a11y gate + build + visual screenshot are the guards):
  ```bash
  npm run build && (npm run preview >/tmp/preview.log 2>&1 &) && sleep 2 && npm run a11y:test; kill %1 2>/dev/null
  ```
  Expected: `✓ http://localhost:4173/ — 0 violations` and `✓ .../accessibility.html — 0 violations`, exit 0.

---

### Task 1: Palette tokens + per-zone color swap

Swap the base slate accent to the teal/cyan two-tier workhorse, add pink + vivid-cyan tokens, flip the dark-anchor scope to vivid cyan, and neutralize the now-obsolete `.acc-gold` override. This single task recolors the majority of the site.

**Files:**
- Modify: `src/styles/main.css` — `@theme` block (L28-44), `.acc-gold` block (L278-282), `.section-dark` block (L290-300), timeline colors (L339, L348)

**Interfaces:**
- Produces (consumed by Tasks 2 & 3): Tailwind utilities `text-signature`, `bg-signature`, `border-signature`, `text-accent-vivid`, `bg-accent-vivid` (auto-generated from the new `@theme` tokens), plus CSS vars `--color-signature`, `--color-signature-soft`, `--color-accent-vivid`.

- [ ] **Step 1: Replace the accent tokens in `@theme`**

In `src/styles/main.css`, replace the token block (currently L32-43, the `/* SigilArk family + Accelera Blue accent */` group) with:

```css
  /* Two-tier accent system: cyan workhorse + pink signature.
     Light-ground text accent is the deepened teal (>=4.5:1); vivid cyan and
     pink are for decoration / large text / dark grounds only. */
  --color-bg: #f4f5f7;        /* soft off-white canvas (pure white reserved for cards) */
  --color-surface: #ffffff;
  --color-surface-2: #e9ebef;
  --color-border: rgba(0, 0, 0, 0.12);
  --color-accent: #0e7490;    /* deepened teal — 4.9:1 on off-white, workhorse small-text accent */
  --color-accent-deep: #0b566a;
  --color-accent-soft: rgba(57, 215, 255, 0.12);   /* vivid-cyan tint, fills only */
  --color-accent-vivid: #39d7ff;                    /* vivid cyan: decoration / large / dark grounds */
  --color-signature: #ff06b5;                       /* hot pink: scarce signature, never deepened */
  --color-signature-soft: rgba(255, 6, 181, 0.14);
  --color-text: #141414;
  --color-text-dim: #565b63;
  --color-gold: #0e7490;      /* gold retired: repointed to teal so any stray ref stays on-palette */
  --color-gold-deep: #0b566a;
```

- [ ] **Step 2: Neutralize the `.acc-gold` override**

The `.acc-gold` block (L278-282) currently re-points accent tokens to the old slate "gold". Replace the whole block with a no-op so `.acc-gold` sections inherit the base teal (and dark `.acc-gold` sections inherit the `.section-dark` cyan):

```css
/* .acc-gold retired: gold collapsed into the teal/cyan accent system.
   Kept as an empty rule so existing markup classes resolve harmlessly. */
.acc-gold { /* no accent override — inherits base or .section-dark tokens */ }
```

- [ ] **Step 3: Flip the dark-anchor scope to vivid cyan**

In the `.section-dark` block (L290-300), replace the two accent lines:

```css
  --color-accent: #9aa9ba;
  --color-accent-deep: #5b6b7d;
```

with:

```css
  --color-accent: #39d7ff;          /* vivid cyan — 11.2:1 on near-black, safe as text here */
  --color-accent-deep: #7ee5ff;
  --color-accent-soft: rgba(57, 215, 255, 0.16);
```

- [ ] **Step 4: Recolor the timeline glow rings to cyan**

The timeline rule/dot glow rings are hardcoded slate `rgba(91, 107, 125, ...)`. Update for on-palette consistency (the dot fill itself already uses `var(--color-accent)`):

L339 — replace `rgba(91, 107, 125, 0.4)` occurrences:
```css
  background: linear-gradient(to bottom, transparent, rgba(57, 215, 255, 0.4) 10%, rgba(57, 215, 255, 0.4) 90%, transparent);
```
L348 — replace the box-shadow rings:
```css
  box-shadow: 0 0 0 4px rgba(57, 215, 255, 0.15), 0 0 0 8px rgba(57, 215, 255, 0.06);
```

- [ ] **Step 5: Build + a11y gate**

Run the verification loop (see Global Constraints). Expected: 0 violations on both pages, exit 0. If the teal small-text accent regresses anywhere, axe reports the exact node — the fix is to confirm the element uses `--color-accent` (teal) not `--color-accent-vivid`/`--color-signature` for small text.

- [ ] **Step 6: Commit**

```bash
git add src/styles/main.css
git commit -m "feat(color): teal/cyan workhorse accent + pink signature tokens, retire slate"
```

---

### Task 2: Revive ambient glows on the dark anchor sections

Bring back the ambient glow blobs — but only inside `.section-dark` (hero, glyphon, connect) — recolored cyan, plus one pink glow note in the hero. Light sections keep their blobs hidden (they'd bleed off-palette color onto white grounds).

**Files:**
- Modify: `src/styles/main.css` — glow gradient definitions (L353-376), the blanket kill rule (L461)
- Modify: `index.html` — hero section (add glow-blob divs near L214-216)

**Interfaces:**
- Consumes: `--color-signature` from Task 1 (for the pink hero blob gradient).
- Produces: `.glow-blob-pink` utility class (consumed only here).

- [ ] **Step 1: Recolor the glow gradients to cyan and add a pink variant**

In `src/styles/main.css`, update the three glow-blob background gradients (L359, L367, L375) to cyan, and add a pink variant. Replace the `background:` line inside `.glow-blob` (L359):
```css
  background: radial-gradient(circle, rgba(57, 215, 255, 0.42), transparent 70%);
```
inside `.glow-blob-deep` (L367):
```css
  background: radial-gradient(circle, rgba(14, 116, 144, 0.55), transparent 70%);
```
inside `.glow-blob-gold` (L375):
```css
  background: radial-gradient(circle, rgba(57, 215, 255, 0.30), transparent 70%);
```
Then add a new pink blob class immediately after the `.glow-blob-gold` rule (after L376):
```css
.glow-blob-pink {
  position: absolute;
  pointer-events: none;
  border-radius: 9999px;
  filter: blur(100px);
  opacity: 0.38;
  background: radial-gradient(circle, rgba(255, 6, 181, 0.5), transparent 70%);
}
```

- [ ] **Step 2: Scope the glow kill rule to non-dark sections**

Replace the blanket disable at L461:
```css
.glow-blob, .glow-blob-deep, .glow-blob-gold, .hero-topo { display: none !important; }
```
with a version that keeps glows hidden everywhere EXCEPT inside dark anchors (hero-topo stays fully disabled — it's off-palette navy):
```css
.glow-blob, .glow-blob-deep, .glow-blob-gold, .glow-blob-pink, .hero-topo { display: none !important; }
.section-dark .glow-blob,
.section-dark .glow-blob-deep,
.section-dark .glow-blob-gold,
.section-dark .glow-blob-pink { display: block !important; }
```

- [ ] **Step 3: Add glow blobs to the hero**

The hero (`#top`, L182) has no glow-blob divs. Insert two cyan blobs and one pink blob after the texture layers (after L216, the `grain` div, before the mesh SVG at L218):
```html
      <!-- ambient accent glows (cyan field + one pink signature note) -->
      <div class="glow-blob glow-drift" aria-hidden="true" style="width:640px;height:640px;top:-8%;right:-10%;"></div>
      <div class="glow-blob-deep glow-drift-slow" aria-hidden="true" style="width:520px;height:520px;top:20%;left:-12%;"></div>
      <div class="glow-blob-pink glow-drift" aria-hidden="true" style="width:460px;height:460px;bottom:-12%;left:22%;"></div>
```

- [ ] **Step 4: Build + a11y gate + visual check**

Run the verification loop. Expected: 0 violations (glows are `aria-hidden` decorative, not evaluated for contrast). Then screenshot the hero and a light section to confirm: hero shows cyan ambient + a low pink note; light sections (e.g. velocity, about) show NO glow blobs.

```bash
npm run build && (npm run preview >/tmp/preview.log 2>&1 &) && sleep 2
npx playwright screenshot --wait-for-timeout=1200 http://localhost:4173/ /tmp/hero.png
kill %1 2>/dev/null
```
Expected: `/tmp/hero.png` shows cyan glow + faint pink lower-center; no navy topographic wash.

- [ ] **Step 5: Commit**

```bash
git add src/styles/main.css index.html
git commit -m "feat(color): revive cyan ambient glows on dark anchors + pink hero note"
```

---

### Task 3: Pink signature moments + CTA hover peak

Apply the ~4 scarce pink touchpoints via surgical HTML class swaps, plus a pink glow on primary-button hover (CSS). Each is a role where pink is never small-text-on-light.

**Files:**
- Modify: `index.html` — hero slash (L269), "now" live-dot (L288-291), velocity lead stat (L368)
- Modify: `src/styles/main.css` — `.btn-primary` hover (after L109)

**Interfaces:**
- Consumes: `text-signature` / `bg-signature` utilities and `--color-signature` from Task 1.

- [ ] **Step 1: Pink hero brand-slash** (adapts spec moment 1 — the original typewriter cursor is disabled via `#cursor { display:none }`; the hero's live brand motif is the "/" glyph)

In `index.html` L269, change:
```html
          <span class="font-semibold">/</span> Secure, ATO-ready AI for federal missions · CMMC L2 in progress
```
to:
```html
          <span class="font-semibold text-signature">/</span> Secure, ATO-ready AI for federal missions · CMMC L2 in progress
```
(Pink on the near-black hero = 5.4:1, passes as text.)

- [ ] **Step 2: Pink "now shipping" live-dot**

In `index.html` L289-290, change the two dot spans from `bg-accent` to `bg-signature`:
```html
            <span class="absolute inline-flex h-full w-full rounded-full bg-signature opacity-60 motion-safe:animate-ping"></span>
            <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-signature"></span>
```
(The "Now shipping" label and DHA/Navy text on L292/294 stay `text-accent` — teal. Only the decorative, `aria-hidden` dot goes pink.)

- [ ] **Step 3: Pink velocity lead stat**

In `index.html` L368, change the single lead numeral from `text-accent` to `text-signature`:
```html
            <p class="font-mono text-5xl font-semibold tracking-tight text-signature">300+</p>
```
(48px bold = large text; pink at 4.0:1 on the white card passes the 3:1 large-text threshold. The other two stats on L373/L378 stay `text-accent` — teal.)

- [ ] **Step 4: Pink CTA hover peak**

In `src/styles/main.css`, after the `.section-dark .btn-primary:hover` rule (L109), add a pink glow + ring on hover/focus for primary buttons across all grounds. This keeps the accessible fill + white label as the resting state (axe-evaluated) and adds pink only as a transient shadow/ring (not evaluated, and not a text-contrast surface):
```css
/* primary CTA interaction peak: pink glow + ring (transient, not the resting state) */
.btn-primary:hover,
.btn-primary:focus-visible {
  box-shadow: 0 0 0 1px var(--color-signature), 0 10px 34px -8px rgba(255, 6, 181, 0.55);
}
```

- [ ] **Step 5: Build + a11y gate + visual check**

Run the verification loop. Expected: 0 violations (pink slash passes on dark; pink stat passes as large text; pink dot is decorative; pink button glow is hover-only). Screenshot to confirm the 4 pink moments render and nothing else went pink.

- [ ] **Step 6: Commit**

```bash
git add index.html src/styles/main.css
git commit -m "feat(color): pink signature moments — hero slash, now-dot, lead stat, CTA hover"
```

---

### Task 4: Full verification pass

Confirm the whole page reads correctly across zones, the a11y gate is green, and reduced-motion still neutralizes the revived glow drift.

**Files:** none (verification only)

- [ ] **Step 1: Clean build + a11y gate**

```bash
npm run build && (npm run preview >/tmp/preview.log 2>&1 &) && sleep 2 && npm run a11y:test; kill %1 2>/dev/null
```
Expected: `✓` 0 violations on both `/` and `/accessibility.html`, exit 0.

- [ ] **Step 2: Full-page visual QA**

```bash
(npm run preview >/tmp/preview.log 2>&1 &) && sleep 2
npx playwright screenshot --full-page --wait-for-timeout=1500 http://localhost:4173/ /tmp/full.png
kill %1 2>/dev/null
```
Inspect `/tmp/full.png` and confirm:
- Light sections: eyebrows/links/stat numerals are **teal**, grounds are clean white/off-white (no glow blobs).
- Dark anchors (hero, glyphon, connect): accents are **vivid cyan**, cyan ambient glows present; hero has one low **pink** glow note.
- Exactly 4 pink moments: hero "/" slash, "now" live-dot, velocity "300+" numeral, and (on hover) primary buttons. Nothing else pink.

- [ ] **Step 3: Reduced-motion check**

```bash
(npm run preview >/tmp/preview.log 2>&1 &) && sleep 2
npx playwright screenshot --wait-for-timeout=1000 --color-scheme=light http://localhost:4173/ /tmp/rm.png
kill %1 2>/dev/null
```
Confirm via code inspection that `@media (prefers-reduced-motion: reduce)` (L442-458) still disables `.glow-drift`/`.glow-drift-slow` — the revived hero blobs use those classes, so drift is already covered. No new animations were introduced.

- [ ] **Step 4: Final commit (if any QA fixes were needed)**

```bash
git add -A && git commit -m "chore(color): verification-pass QA fixes"
```
(Skip if Steps 1-3 required no changes.)
