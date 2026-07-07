# Equifax transformation + commercial-executive lane

**Date:** 2026-07-07
**Status:** Approved (design), pending implementation plan
**Scope:** Content-only update to `index.html`. Adds a business-transformation proof and commercial-regulatory signal surfaced during the executive-recruiter review. No layout system, CSS token, or dependency changes (reuses existing utilities).

## Goal

The site sells a compliance-native AI *builder* with deep federal credibility, but under-tells the *executive business-transformation* story and reads as federal-only. An executive-recruiter review (CIO/CTO, commercial + defense) flagged three gaps: AI-first/organizational transformation framing, executive altitude, and commercial legibility. Newly surfaced facts about the Equifax Government Services tenure close all three. This update lands those facts and opens a commercial-executive lane — while keeping the federal spine and the "A CTO who still ships" hero untouched.

## Facts to land (all hedged)

Confirmed with Dayel 2026-07-07. Hedging is deliberate: round figures + attributable/qualitative claims so a reader reconciling against revised public numbers finds the claims directionally right, not precisely challengeable. Equifax does not report "Government Services" as a standalone public segment, so these read as internal leadership metrics (normal for an exec bio).

- **Title correction:** Senior Director of Government Product Development (site currently says "Director").
- **Transformation:** pivoted Equifax Government Services infrastructure to an **API-first model**, productizing each API into a sellable product.
- **Outcome:** grew the unit from **~$67M (2018) to ~$763M (2025)** annual revenue — **~11×** — on **flat ~100-person headcount**; became **Equifax's highest-revenue business unit by 2025**.
- **Flagship integration:** integrated **The Work Number** into **a leading open-banking network** (Plaid, described generically per Dayel's call), reaching **thousands of financial institutions**, while holding **SOX** and **FCRA** compliance.

### Naming & hedging rules (apply everywhere)
- Name **"The Work Number"** (Dayel's product, NDA expired, diligence-able).
- Do **NOT** name Plaid — use **"a leading open-banking network."**
- Always tilde/round money: `~$67M → ~$763M`, `~11×`, `flat ~100-person`.
- Revenue-leadership claim phrased as standing/dated: **"grew into Equifax's highest-revenue business unit by 2025."**

## Changes

### 1. New "Signature transformation" beat (the centerpiece)

A new compact `<section>` inserted **immediately after the About section (`#about`, ends ~L446) and before The Lab (`#lab`)**. Rationale: About claims "trusted... to architect platforms that move billions... and survive the audit afterward" — this beat is the marquee proof of exactly that, so it flows narratively and sits high on the page.

- Reuses existing site utilities (`section`, tint background, `eyebrow`, `corners`, `glass`, `text-signature`). No new CSS.
- Eyebrow: `Signature transformation`.
- Headline featuring the hook, with the multiple in the **pink signature** (`text-signature`) as a large-text stat (passes AA on the light ground at 3:1; a11y gate backstops). E.g. **"~11× the revenue. The same 100 people."**
- Body: one paragraph telling productization → revenue growth → highest-revenue-unit, with The Work Number / open-banking integration and SOX + FCRA.
- 3–4 supporting mini-stats (reuse the glass-tile pattern): `~$67M → ~$763M`, `flat ~100-person team`, `The Work Number → open-banking, thousands of FIs`, `SOX + FCRA held throughout`.
- This is a scarce, deliberate pink moment (the business number) — consistent with the palette's signature role.

### 2. "Career at a glance" band (`#numbers`, L307–342)

- Add a **7th tile**; change grid `lg:grid-cols-6` → `lg:grid-cols-7` (mobile `grid-cols-2` / `sm:grid-cols-3` unchanged; 7 items wrap cleanly).
- New tile (teal `text-accent`, matching the other six): value **`~11×`**, label **`Equifax Gov revenue growth`**. Teases the beat, which explains it.

### 3. Equifax engagement entry (`#missions`, L710–725)

- Title → **Senior Director of Government Product Development**.
- Rewrite body to the transformation record, complementary to the beat (not a duplicate): API-first productization + revenue growth + The Work Number/open-banking integration + SOX/FCRA, while retaining the existing GenAI eligibility-decisioning content (CMS/SSA/state agencies; Ollama/Gemini/Vertex AI; NiFi/Kafka/MLflow) as the AI-first proof.
- Bullets (max 4, scan-friendly): `~$67M → ~$763M revenue · flat ~100 headcount`; `Equifax's highest-revenue business unit by 2025`; `The Work Number → open-banking network, thousands of FIs · SOX + FCRA`; `10M+ daily transactions`.
- The existing "Hurricane Ian DSNAP" bullet is dropped to keep the entry tight and executive-focused (operational anecdote; the transformation story is stronger). Retained nowhere — acceptable per approved scope.

### 4. Capabilities → Security & Compliance card (`#stack`, L897–905)

- Update prose to add commercial-financial compliance: "...FedRAMP / HIPAA / FISMA **and SOX / FCRA** at Equifax..."
- Add a list item: **`SOX · FCRA`**.

## Non-goals / guardrails

- **Hero untouched** ("A CTO who still ships" stays — deliberate builder identity per approved scope option).
- No CSS/token changes; reuse existing utilities and the cyan/pink palette.
- No new sections beyond the single transformation beat.
- JSON-LD schema: no change required (title correction is in visible copy only; `jobTitle` is the current Accelera CTO role). Optional schema enrichment is out of scope.
- Federal positioning preserved; commercial proof is additive, not a replacement.
- a11y CI gate (`npm run a11y:test`) must stay green: pink used only on large-text stats; all body/small text uses teal `text-accent` or `text-text*`.

## Files touched

- `index.html` — new beat section + 3 edits. Primary and only source change.

## Verification

- `npm run a11y:test`: 0 WCAG A/AA violations.
- Visual QA (screenshot): the new beat renders with the pink hero stat; glance band shows 7 tiles cleanly; Equifax entry reads as a transformation story; Security card lists SOX · FCRA.
- Copy proofread against the naming & hedging rules (no "Plaid"; all figures tilded; title = Senior Director).
- Related: this partially informs [[resume-accelera-pending]] reconciliation but does not resolve it.
