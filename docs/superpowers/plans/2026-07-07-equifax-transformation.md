# Equifax Transformation Content Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the Equifax Government Services business-transformation story and commercial-regulatory signal on the site, opening a commercial-executive lane while keeping the federal spine and the hero untouched.

**Architecture:** Content-only edits to `index.html` — one new `<section>` (the transformation beat) plus three surgical edits (glance tile, engagement entry, security card). Reuses existing site utilities and the cyan/pink palette; no CSS or dependency changes.

**Tech Stack:** Static HTML + Tailwind v4 utilities, Vite build, Playwright + axe-core a11y gate.

## Global Constraints

- **Naming:** name **"The Work Number"**; NEVER name Plaid — use **"a leading open-banking network."**
- **Hedging:** always round/tilde money — `~$67M`, `~$763M`, `~11×`, `flat ~100`. Revenue-leadership claim is dated/standing: **"Equifax's highest-revenue business unit by 2025."**
- **Dates:** Equifax tenure is **2018–2025** (confirmed).
- **Title:** **Senior Director of Government Product Development** (not "Director").
- **Hero untouched;** no CSS/token changes; federal positioning preserved (commercial proof is additive).
- **a11y:** `npm run a11y:test` must stay green. Pink (`text-signature`) only on large-text stats (≥24px / bold); all body + small text uses `text-accent` (teal) or `text-text*`.
- **Verification loop** (per task):
  ```bash
  npm run build && (npm run preview >/tmp/preview.log 2>&1 &) && sleep 3 && A11Y_URL=http://localhost:4173/ npm run a11y:test; pkill -f "vite preview" 2>/dev/null
  ```
  Expected: `✓ ... 0 violations` on both pages, exit 0.

---

### Task 1: Signature-transformation beat section

Insert a new section immediately after the About section and before The Lab. It is the marquee proof of the About claim ("architect platforms that move billions... survive the audit").

**Files:**
- Modify: `index.html` — insert between `</section>` of `#about` (~L446) and `<!-- ... -->`/`<section id="lab" ...>` (~L447)

**Interfaces:** none (self-contained section reusing existing utilities).

- [ ] **Step 1: Insert the section**

Find the end of the About section (the `</section>` that closes `<section id="about" ...>`, ~L446) and the start of `<section id="lab" ...>`. Insert this block between them:

```html
    <!-- SIGNATURE TRANSFORMATION - executive business outcome (Equifax Gov) -->
    <section id="transformation" class="divider-gradient tint-warm relative overflow-hidden px-6 py-16 lg:px-8 lg:py-20" aria-label="Signature transformation">
      <div class="glow-blob-pink" aria-hidden="true" style="width:520px;height:520px;top:-15%;right:-8%;"></div>
      <span class="section-watermark-text" aria-hidden="true" style="top:1rem;right:2rem;" data-watermark="/SCALE"></span>
      <div class="mx-auto max-w-7xl">
        <p class="eyebrow" data-reveal>Signature transformation</p>

        <h2 class="mt-6 max-w-3xl text-3xl font-semibold leading-tight md:text-5xl" data-reveal data-reveal-delay="100">
          <span class="text-signature">~11&times;</span> the revenue. The same 100 people.
        </h2>

        <p class="mt-6 max-w-3xl text-lg text-text-dim md:text-xl" data-reveal data-reveal-delay="200">
          As <span class="font-semibold text-text">Senior Director of Government Product Development at Equifax</span> (2018&ndash;2025), I pivoted the business unit to an <span class="font-semibold text-text">API-first model</span>, productizing each API into a product sold to customers, and integrated <span class="font-semibold text-text">The Work Number</span> into a leading open-banking network to reach thousands of financial institutions, all while holding <span class="font-semibold text-text">SOX and FCRA</span> compliance. Revenue grew from ~$67M to ~$763M on flat ~100-person headcount, making Equifax Government Services the company's highest-revenue business unit by 2025.
        </p>

        <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal data-reveal-delay="300">
          <div class="corners glass p-6">
            <span class="cf-tl"></span><span class="cf-tr"></span><span class="cf-bl"></span><span class="cf-br"></span>
            <p class="font-mono text-2xl font-semibold text-accent">~$67M &rarr; ~$763M</p>
            <p class="mt-2 text-sm text-text-dim">Annual revenue, 2018 &rarr; 2025</p>
          </div>
          <div class="corners glass p-6">
            <span class="cf-tl"></span><span class="cf-tr"></span><span class="cf-bl"></span><span class="cf-br"></span>
            <p class="font-mono text-2xl font-semibold text-accent">~100</p>
            <p class="mt-2 text-sm text-text-dim">Flat headcount through the growth</p>
          </div>
          <div class="corners glass p-6">
            <span class="cf-tl"></span><span class="cf-tr"></span><span class="cf-bl"></span><span class="cf-br"></span>
            <p class="font-mono text-2xl font-semibold text-accent">#1</p>
            <p class="mt-2 text-sm text-text-dim">Highest-revenue business unit at Equifax by 2025</p>
          </div>
          <div class="corners glass p-6">
            <span class="cf-tl"></span><span class="cf-tr"></span><span class="cf-bl"></span><span class="cf-br"></span>
            <p class="font-mono text-2xl font-semibold text-accent">SOX &middot; FCRA</p>
            <p class="mt-2 text-sm text-text-dim">Held through the API + open-banking integration</p>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Build + a11y + visual check**

Run the verification loop. Expected 0 violations. Then screenshot and confirm the beat renders after About with the pink `~11×` headline and 4 teal stat tiles:
```bash
(npm run preview >/tmp/preview.log 2>&1 &) && sleep 3
npx playwright screenshot --wait-for-timeout=1400 "http://localhost:4173/#transformation" /tmp/transformation.png; pkill -f "vite preview" 2>/dev/null
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(content): signature transformation beat (Equifax ~11x revenue, flat headcount)"
```

---

### Task 2: Career-at-a-glance ~11× tile

Add a 7th stat tile to the glance band promoting the revenue-growth number to the top of the page.

**Files:**
- Modify: `index.html` — `#numbers` grid (L311) + tile insert (after L341)

- [ ] **Step 1: Widen the grid**

On L311, change the grid column count:
```html
        <div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
```
(was `lg:grid-cols-6`.)

- [ ] **Step 2: Add the 7th tile**

Immediately after the "DoD Secret" tile's closing `</div>` (L341) and before the grid's closing `</div>` (L342), insert:
```html
          <div class="corners glass p-5 text-center" data-reveal data-reveal-delay="400">
            <span class="cf-tl"></span><span class="cf-tr"></span><span class="cf-bl"></span><span class="cf-br"></span>
            <p class="font-mono text-4xl font-semibold text-accent">~11&times;</p>
            <p class="mt-2 font-mono text-xs uppercase tracking-[0.22em] text-text-dim">Equifax Gov revenue growth</p>
          </div>
```

- [ ] **Step 3: Build + a11y + visual check**

Run the verification loop (expect 0 violations). Screenshot `#numbers` and confirm 7 tiles wrap cleanly (2 cols mobile / 3 sm / 7 lg), `~11×` in teal.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(content): add ~11x revenue-growth tile to career glance band"
```

---

### Task 3: Equifax engagement entry rewrite

Rewrite the timeline entry: correct the title and dates, tell the transformation record (complementary to the beat), retain the GenAI eligibility work.

**Files:**
- Modify: `index.html` — Equifax `<li>` (L710–725)

- [ ] **Step 1: Replace the entry**

Replace the entire Equifax `<li>` block (L710–725) with:
```html
          <li class="grid gap-8 border-t border-white/10 pt-10 md:grid-cols-12" data-reveal>
            <div class="md:col-span-3">
              <p class="font-mono text-xs uppercase tracking-[0.22em] text-accent">2018-2025</p>
              <p class="mt-3 text-2xl font-semibold">Equifax Government Services</p>
              <p class="text-sm text-text-dim">Senior Director of Government Product Development</p>
            </div>
            <div class="md:col-span-9">
              <p class="text-lg text-text-dim">
                Pivoted the business unit to an <strong class="text-text">API-first model</strong>, productizing each API into a product sold to customers, and integrated <strong class="text-text">The Work Number</strong> into a leading open-banking network to reach thousands of financial institutions, holding <strong class="text-text">SOX and FCRA</strong> throughout. In parallel, directed <strong class="text-text">GenAI-powered eligibility decisioning</strong> across CMS, SSA, and state agencies, Ollama, Gemini, and Vertex AI integrated with agency policy logic on Apache NiFi, Kafka, and MLflow pipelines.
              </p>
              <div class="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-dim">
                <span><span class="font-semibold">&#9656;</span> ~$67M &rarr; ~$763M revenue &middot; flat ~100 headcount</span>
                <span><span class="font-semibold">&#9656;</span> Equifax's highest-revenue business unit by 2025</span>
                <span><span class="font-semibold">&#9656;</span> The Work Number &rarr; open-banking network, thousands of FIs</span>
                <span><span class="font-semibold">&#9656;</span> 10M+ daily transactions</span>
              </div>
            </div>
          </li>
```
(The former "Hurricane Ian DSNAP" bullet is intentionally dropped per the approved spec.)

- [ ] **Step 2: Build + a11y check**

Run the verification loop. Expect 0 violations.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(content): rewrite Equifax entry — Senior Director, 2018-2025, transformation record"
```

---

### Task 4: Security & Compliance card — add SOX / FCRA

Signal commercial-financial regulatory fluency alongside the federal stack.

**Files:**
- Modify: `index.html` — Security & Compliance card prose (L900) + list (after L905)

- [ ] **Step 1: Update the prose**

On L900, change the description to include the commercial frameworks:
```html
            <p class="mt-4 text-sm leading-relaxed text-text-dim">ATOs under <span class="font-semibold">HIPAA + MEDCOI</span> at DHA. <span class="font-semibold">FedRAMP / HIPAA / FISMA and SOX / FCRA</span> at Equifax. STIG-compliant deployments, eMASS submissions, and IL5 architecture today.</p>
```

- [ ] **Step 2: Add the list item**

The card's `<ul>` (starting L901) ends with `<li>NIST 800-53</li><li>eMASS</li>` (L905). Add a new list item immediately after `<li>eMASS</li>`:
```html
              <li>SOX &middot; FCRA</li>
```

- [ ] **Step 3: Build + a11y check**

Run the verification loop. Expect 0 violations.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(content): add SOX / FCRA to security & compliance capabilities"
```

---

### Task 5: Full verification + copy proofread

**Files:** none (verification only)

- [ ] **Step 1: Clean build + a11y gate**

```bash
npm run build && (npm run preview >/tmp/preview.log 2>&1 &) && sleep 3 && A11Y_URL=http://localhost:4173/ npm run a11y:test; pkill -f "vite preview" 2>/dev/null
```
Expected: `✓` 0 violations on both pages, exit 0.

- [ ] **Step 2: Proofread against the naming & hedging rules**

```bash
echo "=== must be EMPTY (no Plaid): ==="; grep -in "plaid" index.html
echo "=== title must read Senior Director: ==="; grep -n "Senior Director of Government Product Development" index.html
echo "=== dates 2018-2025: ==="; grep -n "2018-2025\|2018&ndash;2025\|2018–2025" index.html
echo "=== hedged figures present: ==="; grep -on "~\$67M\|~\$763M\|~11&times;\|~11×\|flat ~100" index.html | head
```
Expected: Plaid grep EMPTY; "Senior Director..." present; 2018 dates present; hedged figures present.

- [ ] **Step 3: Full-page visual QA**

```bash
(npm run preview >/tmp/preview.log 2>&1 &) && sleep 3
npx playwright screenshot --full-page --wait-for-timeout=1500 http://localhost:4173/ /tmp/full-content.png; pkill -f "vite preview" 2>/dev/null
```
Confirm: transformation beat after About (pink `~11×`); 7-tile glance band; Equifax entry reads as transformation story; Security card shows `SOX · FCRA`.

- [ ] **Step 4: Final commit (only if QA fixes were needed)**

```bash
git add -A && git commit -m "chore(content): verification-pass fixes"
```
