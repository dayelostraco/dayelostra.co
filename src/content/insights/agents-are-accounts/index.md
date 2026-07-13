---
title: "Your Agents Are Accounts. The Boundary Hasn't Moved."
seoTitle: "Your Agents Are Accounts: AI Agent IAM and NIST 800-53 in Federal IT"
date: 2026-06-08
summary: "Every agent-platform pitch claims your IAM cannot hold agents. I keep asking which NIST 800-53 control stops working when the account belongs to an agent, and nobody answers. Agents are accounts. The real work is governing them at machine speed."
tags: [ai, agents, ato, federal, identity, iam]
series:
  name: "Agent Governance"
  part: 1
readTime: "7 min read"
draft: false
ogAccent: "The Boundary Hasn't Moved."
bodyWatermark: "/BOUNDARY"
---

I sat through another agent-platform pitch a few weeks ago. Same deck as the last one, different logo: agents are a third actor class, neither human nor service, your identity stack cannot hold them, buy our control plane. I have spent twenty years inside accredited federal boundaries, and I now ask every one of these vendors the same question. Which NIST 800-53 control, exactly, stops working when the account belongs to an agent?

I am still waiting on my first answer.

Because the boring truth is that federal IT has run identity, authorization, lifecycle, and audit for three decades on a control catalog that never asks what kind of entity sits behind an account. The boundary already knows how to hold a new actor. The work in front of us is not new infrastructure. It is discipline we already have, applied with more rigor, at machine speed.

This essay is the long version of the question I keep asking. The thesis in one sentence: an AI agent's identity is an account in your existing IAM, scoped, credentialed, audited, and lifecycle-managed under the same NIST 800-53 controls that already govern humans and services.

## Same primitive: agents are identities

The IAM model federal programs run on is not actor-agnostic by accident. It is actor-agnostic by design. NIST 800-53 controls AC-2 (account management), AC-3 (access enforcement), AC-6 (least privilege), AU-2 (event logging), IA-5 (authenticator management), and IA-9 (service identification and authentication) scope, authorize, and audit accounts without ever specifying what is behind the account. A human's PIV card and a service principal's certificate are both managed under AC-2. An agent's account is the same primitive.

> The LLM is a capability. The identity is an account. Conflating them is the original sin of the agent-identity platform.

The model that generates an agent's behavior is a capability bound to an account, exactly the way a workload's runtime is a capability bound to a service account. The identity that executes the agent's actions is just an account. Separate the two and everything else falls into place: the account gets a scope, the scope gets a policy, and every action lands in the audit log under the account's name. Existing controls. Existing implementation. Existing audit posture.

My camp uses the existing identity primitive directly, sometimes through a thin authorization layer that binds new actors to it. The other camp replaces it. The test I apply is simple: who holds the account of record. If your existing IAM still owns the authoritative account and the new layer only adds enforcement on top of it, you have not bought a new tier. The day that layer becomes the system of record for the identity, you have, and that is the thing to refuse.

Workload identity standards like SPIFFE and SPIRE were built for exactly this class of non-human, scope-bound, audit-attributed account. None of this requires invention.

## What changes at agent velocity

What is genuinely new about agents is not the identity primitive. It is the operating envelope.

**Budgets.** Humans carry implicit budgets in salary and hours. Services have known cost shapes, SLA-bound and predictable. Agents have open-ended cost variability, and a misconfigured one can burn a quarter's worth of tokens in an afternoon. Ideally the IAM platform manages agent budgets natively. Where it does not yet, I fall back to the rate-limit layer at the API gateway. A rate limit is not a budget, but it is the next-best ceiling, and it is auditable.

**Rate limits and discrete actions.** A human might call an internal API a dozen times an hour. An agent will call it ten thousand. So: no allow-alls, no catch-all permissions. Every action an agent takes should be a discrete, named operation with a discrete, named scope. "Read tickets in queue X" is a permission. "Read tickets" without a queue scope is a liability. The same discipline holds one layer down at the OS: a policy that names which commands an agent may run forecloses destructive operations and closes the privilege-escalation paths, horizontal and vertical, in one move.

**Focused responsibilities.** The Single Responsibility Principle applies to agents the way it applies to microservices. An agent that logs into two systems, pulls from one, writes to the other, and chooses between three downstream workflows is three agents wearing one badge. One identity holding conflicting functions is a separation-of-duties problem (AC-5), not a tidiness problem. When a vendor pitches me a general-assistant agent, that generality is where I push back, because generality is where audit posture breaks. Three focused agents are easier to govern than one general one, every time.

## The human gate scales with consequence

Autonomy is not a property of the agent. It is a property of the action. An authorizing official never really approves "an autonomous agent." They approve a mapping from action consequence to human-oversight level, and that mapping lives in the agent's scope like everything else.

- **Advisory.** The agent observes and recommends; a human executes. No write scope. Every pilot I run starts here.
- **Human-in-the-loop.** The agent proposes a specific action; a human approves it before it runs. Per-action gate. My default for anything that writes.
- **Human-on-the-loop.** The agent acts inside a pre-approved scope while a human monitors and can interrupt. Reversible actions only.
- **Supervised autonomy.** The agent runs a bounded workflow end to end; humans review in aggregate, by exception. Reserved for high-volume, low-consequence, fully reversible work.

The rule that keeps the whole ladder defensible: irreversible or high-consequence actions never rise above human-in-the-loop, no matter how capable the model gets. Capability earns speed, not authority. The tier is written into the scope, the scope lives in the existing IAM, and the audit log shows which tier was in force when the action ran.

## The supporting stack

The identity primitive does not change. The stack around it does.

**Lifecycle.** Joiner / Mover / Leaver applies to agents at agent velocity. An agent is provisioned when its task is approved, rescoped when its responsibility narrows, and deprovisioned the day the task is done. Quarterly access certifications, the standard federal IAM ritual, run against agent accounts the same way they run against human ones.

**Observability.** Agent actions arrive faster than a human auditor can read them, so the audit log has to be human-digestible at machine speed. OpenTelemetry traces, identity-attributed, flowing into the SIEM that already carries the program's audit-integrity discipline. One agent action, one span. The reviewer's questions never change: who did this, what were they authorized to do, did they stay inside the lines. And attribution cannot stop at the agent's account. Every action traces through the delegation chain to the accountable human who authorized the agent to act: organization, application, user, agent. The agent never holds authority. It exercises authority delegated by someone who remains answerable for it. That is AU-10 non-repudiation, not a new control story.

**Where the IAM platform falls short.** Not every IAM platform supports agent-specific budget tracking, action-level scope enforcement, or token-bound lifecycle today. Where the platform falls short, a thin, platform-agnostic extension layer can carry the gap: middleware that binds agent accounts to the existing IAM and adds the controls the platform does not yet expose. That insertion deserves a Change Request and a Risk Acceptance, not a quiet rollout, and that formality is the right amount of scrutiny for putting anything between an authorizing official's IAM and a new actor class. Done right, the layer deploys inside the existing accreditation boundary, containerized, nothing leaving the boundary, no new external dependency. The footprint is a CR and a risk acceptance on top of the existing IAM. Not a new system of record, and not a fresh ATO.

## The architectural payoff: model swap without re-ATO

The payoff for treating agents as identities instead of a new actor class shows up in the ATO economics.

Frontier models version every month. ATO cycles take six to twelve months on a good day. If the agent's identity is fused to the model, meaning "agent" and a specific model name are the same line in the boundary diagram, then every model swap is a re-ATO, and the program is hostage to a vendor's release cadence.

Invert it. If the agent's identity is stable and the model is abstracted behind it, the model becomes a swappable capability. The identity, the scope, and the audit posture all survive the swap. The authorizing official re-evaluates the new model's behavior; the boundary does not re-architect.

The pattern holds within an accreditation envelope. A new model from a new vendor, or a substantially different model from the same vendor, still warrants accreditation review. Abstraction reduces the frequency of re-ATO; it does not eliminate it.

I think this is the single most consequential architectural decision in federal agent delivery in 2026.

## What I would ask

If I were the federal CTO, IPT lead, or GS-15 across the table from an agentic AI vendor this year, I would ask four questions and expect four direct answers:

1. **How does each agent's identity land in my existing IAM control plane?** Show me the account record, the scope expression, the lifecycle hooks. If the answer is a separate identity store, that is the new IAM tier you are being sold. Ask why.
2. **What does one agent action look like in my SIEM?** Show me one span, identity-attributed, OpenTelemetry-native, ingestible without translation.
3. **Where do budgets live?** In the IAM platform, in an extension layer, or at the rate-limit gateway. Any of those can be acceptable; an unauditable cost ceiling is not.
4. **What is the path to swapping the underlying model?** If the answer includes re-ATO, the architecture is fused to a vendor's release cadence, and that is a procurement problem wearing an engineering costume.

One more thing, because it gets skipped: identity discipline runs underneath your AI governance regime, it does not replace it. The agent that passes all four questions still owes an entry in the AI use-case inventory, a Chief AI Officer review, and an impact assessment if it touches rights or safety. Two gates, not one.

So no, agents are not a new actor class, and I have stopped being diplomatic about it. They are accounts: scoped, audited, and held by the same boundary that has held every other actor for thirty years. The new work is governance at machine speed. The old work is what it has always been.

The next time a deck tells you otherwise, ask my question. Which control stops working? The silence is the answer.
