# Design — "Anatomy of a Governed AI Factory" (architecture deep-dive)

**Date:** 2026-08-10
**Status:** approved (design), pending spec review
**Type:** content (new Insights deep-dive on dayelostra.co)

## Goal & audience
Close the gap the 4-persona eval surfaced for the **Staff/Principal AI Engineer / Architect** lens: architecture reads as *asserted, not shown* (7/10) and eval rigor is the single lowest dimension (6/10). Publish a sanitized, diagrammed **reference architecture + eval methodology** deep-dive so a technical skeptic can judge the mechanics, not just the outcomes. Also serves the cross-cutting "one inspectable artifact" ask (3 of 4 personas).

Primary reader: staff/principal engineers and architects evaluating whether the "governed AI factory" is real engineering. Secondary: technically literate federal buyers / AOs.

## Decisions (locked)
- **Title:** "Anatomy of a Governed AI Factory" (clear + searchable for the engineer audience). ogAccent highlights "Governed AI Factory".
- **Date:** 2026-08-07 (slots between the routing essay 08-04 and now).
- **Depth:** prose + diagrams ONLY. No code, configs, real threshold values, prompts, proprietary agent logic. ("Legible, not free" — consistent with the Colophon case study decision.)
- **Placement:** dayelostra.co Insights, `src/content/insights/anatomy-of-a-governed-factory/index.md`. Same pipeline (auto OG card, RSS, print stylesheet). Cross-linked into the trio: Colophon case study (why) -> routing essay (model philosophy) -> this (the how).
- **Length/voice:** ~1,800-2,200 words, ~9 min read, first-person/org-framed ("we"), his architect voice.

## OPSEC boundary
Everything stays within concepts ALREADY public on colophon.build (Stationarius, Colloquy, Decretum, Change Control Board, five-lens review). This piece goes deeper and diagrams them; it does NOT introduce new proprietary detail. **In:** the shape and mechanics of the system. **Out:** source, configs, exact thresholds, prompts, agent logic, any CUI or classified specifics.

## Structure (7 movements)
1. Hook — the claim (case study) and routing (essay) are established; here is the architecture that makes it real and *auditable* (framing: hand it to an ISSO).
2. Coordination plane — Stationarius: Colloquy (typed wire protocol), three-tier escalation (peer -> arbiter -> Human CCB), Decretum (append-only decision/precedent store). **[Diagram 1: coordination topology]**
3. Agent state & isolation — scoping, least privilege, sandboxing; the CUI-boundary routing rule; what prevents an agent reaching around a gate.
4. The gate chain — five-lens review (code, adversarial, test-quality, SAST, CI-parity, +accessibility) then Human CCB for production-impacting/cross-cutting/compliance changes; RMF artifacts emitted as byproduct. **[Diagram 2: change lifecycle / gate flow]**
5. Provenance, rollback & failure containment — Decretum audit trail, failed-gate rollback, blast-radius containment, observability/attribution (the failure-analysis the engineer asked for).
6. Eval methodology — the harness behind the routing table: task suites, baselines, confidence thresholds, latency/cost, regression + drift monitoring, model-switch criteria, disagreement-as-signal made concrete. **[Diagram 3: eval loop]**
7. Close — the architecture (not the model) carries the guarantees; "humans decide, the bench ships."

## Diagrams
3 hand-authored, theme-aware inline SVGs embedded in the markdown (light/dark via currentColor / CSS tokens; wrapped in an `overflow-x:auto` container for mobile). Must render through the Astro markdown pipeline (verify inline SVG passes; fall back to a co-located `.svg` + `<img>` if not).
- D1 coordination topology (agents <-> arbiters <-> CCB; Colloquy; Decretum)
- D2 change lifecycle / gate chain (increment -> five lenses -> CCB -> ship, RMF artifacts as byproduct)
- D3 eval loop (candidate change -> multi-model -> disagreement -> gate -> measured vs baseline)

## Frontmatter
title, seoTitle (keyword-shaped), date 2026-08-07, summary (60-280 chars), tags (ai, agents, architecture, governance, evals, federal), readTime "~9 min read", ogAccent, bodyWatermark (e.g. "/FACTORY"), draft:false.

## Success criteria
- Reads as inspectable *mechanics*, not asserted outcomes; a skeptical engineer could critique specific design choices.
- Every claim traceable to public colophon.build concepts; zero code/config/CUI.
- 3 clean theme-aware diagrams render correctly in light + dark, desktop + mobile.
- Cross-links complete the technical trio; OG card auto-generates; build + axe gate green.

## Out of scope
- Any code, runnable artifact, or repo (explicitly deferred — moat/OPSEC).
- The other three persona fixes (buyer acquisition one-pager, CEO people-leadership, product commercialization) — separate future specs.
