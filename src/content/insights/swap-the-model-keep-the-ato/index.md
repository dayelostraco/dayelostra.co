---
title: "Swap the Model. Keep the ATO."
seoTitle: "Swap the Model, Keep the ATO: Model Abstraction Behind Agent Identity in Federal IT"
date: 2026-07-13
summary: "Frontier models version monthly; accreditation does not. Fuse the agent's identity to a model name and every release forces a significance question you cannot answer cheaply. Abstract the model behind a stable identity and a swap becomes a change request with a regression gate."
tags: [ai, agents, ato, rmf, federal, procurement]
series:
  name: "Agent Governance"
  part: 4
readTime: "7 min read"
draft: false
ogAccent: "Keep the ATO."
bodyWatermark: "/MODELSWAP"
---

The question I get most often after [Your Agents Are Accounts](/insights/agents-are-accounts/) is not about identity at all. It comes from program managers, and it is always some version of this: we accredited the agent on one model, and the vendor just shipped a better one. Do we have to re-ATO?

If you have to ask, the architecture has already answered. Somewhere in your boundary documentation, "the agent" and a specific model name are the same line. That fusion felt harmless when the system was authorized. It is now a standing appointment with your accreditation process, renewed every time a lab ships a release, which lately is monthly.

The thesis in one sentence: keep the agent's identity stable and treat the model as a swappable capability bound to it, and a model swap becomes a change request adjudicated through a security impact analysis instead of a re-accreditation event.

This is the fourth essay in this series, and in some ways the payoff. Identity discipline, [a governed command surface](/insights/govern-the-agent-cli/), and [an enforced allow-list](/insights/command-allow-list/) all cost effort. This is where the effort returns.

## The collision nobody schedules

Two clocks run in every federal AI program, and they do not know about each other.

The first is the release clock. Frontier models version every month or two. The improvements are not cosmetic; reasoning quality, context length, tool discipline, and price move materially with each release.

The second is the accreditation clock, and I want to be precise about it, because the lazy version of this argument pretends it is 2019. A full initial authorization still runs six to twelve months when it goes well. But most programs holding an agent today are not facing a fresh ATO on every change; they are operating under continuous monitoring, and the modern postures (ongoing authorization, cATO, the fast-track programs) exist precisely so that change is adjudicated continuously instead of episodically. The honest comparison for a model swap is not "change request versus a year." It is "change request versus a significant-change determination," and how expensive that determination is depends almost entirely on the architecture underneath it. Fuse the agent to the model and every release is a significance question your documentation makes hard to answer. Abstract the model and the same question becomes cheap, and a cATO posture becomes survivable against a monthly release cadence at all.

Fusion still forces the bad choice; it just forces it in slow motion. Re-open the authorization question on every release, or defer, and defer again. I have watched programs drift onto models two generations stale this way. Sometimes that is the right call, made deliberately: the accredited model is evaluated, trusted, and doing the job, and the authorizing official's risk posture says hold. What the fused architecture takes away is the ability to make it a choice. When the swap costs a re-accreditation-shaped fight, deferral stops being a risk decision and becomes the default, and the deficiency list on the old model grows without anyone ever deciding to accept it.

## What the abstraction actually is

The fix is the same separation this series has been making from the start. The identity is an account. The model is a capability bound to that account, the way a workload's runtime is a capability bound to a service account.

Concretely, in the system security plan, the agent is a system component with a stable identity: its account of record, its scope, its authorization policy, its oversight tiers, its allow-list, its audit attribution. The model behind it is a configuration item within that component, tracked in the baseline with its exact version (your inventory should always know which model is in production), reached through an abstraction layer: a provider interface, a model gateway, a routing broker. The mechanism matters less than the boundary line. The accredited unit is the component; the model version is a CI within it, and changing a CI is what change management is for.

Look at what survives a swap under that structure, because it is the load-bearing set:

- The account of record and its lifecycle hooks. Unchanged.
- The scope and every named permission in it. Unchanged.
- The enforced command allow-list and its enforcement point. Unchanged, and this matters most: what the new model can execute is bounded by the same control that bounded the old one, because [that control never depended on the model's judgment](/insights/command-allow-list/).
- The oversight tiers. The consequence-to-oversight mapping lives in the scope, not in the model, so a more capable model does not inherit more authority. Capability earns speed, not authority.
- The audit attribution. Same account, same delegation chain, into the same SIEM.

And be honest about what does move, because it is exactly what the security impact analysis exists to examine. Prompt architecture and system prompts are model-specific and usually need re-engineering. Safety and refusal configuration does not transfer. Context and token limits change how the same controls behave at the margins, including what reaches an enforcement check intact. Telemetry can shift: different usage fields, different logging defaults, new metadata landing in the SIEM. None of that is a re-architecture. All of it is security-relevant configuration change, which is why the swap gets an SIA and not a shrug.

Every essay in this series has been about building a boundary that holds regardless of what the model decides. A boundary with that property is, by construction, a boundary that can survive the model being replaced. That is the whole trick.

## The gate a swap still owes

None of this makes a swap a free action, and I would not sign the risk acceptance for anyone who claims it does.

A model swap moves through change management as a change request, and the change request triggers a security impact analysis. The SIA, informed by a behavioral regression run, is what determines whether the swap stays routine or escalates, and the significance determination belongs to the authorizing official, informed by the ISSM and the ISSO. Not to the vendor, not to the pipeline, and not to the eval suite. The architecture makes the question cheap to answer; it does not get to answer it.

The regression gate itself is behavioral: the program's evaluation suite, run against the new model inside the real scope, with the real allow-list, against the real tasks. You are checking two things. First, that the new model still does the job. Second, and less obviously, that it does not do more than the job. A more capable model finds paths through a task that a weaker one never saw, and some of those paths press against the edges of the scope in ways the old model never did. The deny log from the evaluation run is some of the most honest reading in the program: every denied call is the new model discovering an edge you already controlled.

And there are swaps that legitimately escalate past a routine determination. A new vendor. A substantially different model family. A hosting change that moves inference across the boundary, say from in-boundary weights to an external API, which is not a model swap at all but a boundary change wearing a model swap's clothes, and it drags an interconnection question and usually a FedRAMP inheritance question in with it. The pattern reduces the frequency of re-accreditation. It does not, and should not, reduce it to zero.

## Inside your own shop first

Before this becomes a vendor conversation, three questions belong inside the program office, because the abstraction is worthless if the government side cannot operate it.

Ask your ISSM whether the model version is a named configuration item in the SSP or fused into the component definition; the answer tells you which architecture you already have. Ask your authorizing official, in advance and in the abstract, how a model swap would be adjudicated, so the significant-change path is pre-agreed instead of negotiated under deadline. And settle who owns, funds, and runs the evaluation harness on your side of the table once it is delivered, including whether your continuous-monitoring capacity can actually execute a regression gate, because an eval suite nobody can run is shelfware with a line item.

## The procurement question

Then there is the vendor conversation, and I will flag my seat honestly: I am a vendor-side CTO, and an essay that says "demand the architecture I build" should be read with exactly the skepticism that sentence deserves. So here is the version I can defend.

Ask any agent vendor, including mine, to walk you through what happens in their architecture the day a materially better model ships. If the walkthrough contains the phrase "and then you would re-accredit," price that into the offer: you are buying a subscription to someone else's release calendar, with your accreditation process as the payment method.

But treat the answer as diligence, not a loyalty test. There are honest reasons an architecture binds tightly to one model: it may be the model the vendor has actually evaluated, red-teamed, and can stand behind, and in a disconnected or air-gapped enclave "provider substitution" can mean choosing between the two models that exist inside the boundary, not the frontier. Swap-ability and assurance genuinely pull against each other; an abstraction layer with a weak gate is how an unevaluated model slides into an authorized boundary wearing a routine change request. The regression gate is what resolves the tension, and a vendor who binds to one model with a strong evaluation story deserves a different hearing than one who binds to it because the integration is load-bearing.

If you want it in the acquisition, route it properly: hand your contracting officer the capability to evaluate (model abstraction, an evaluation harness delivered with the system, a documented swap procedure), backed by market research showing more than one offeror can meet it, and let the CO and counsel shape language that survives a competition review. A requirement that only one bidder can meet is not a discriminator; it is a protest.

The deeper point, and the one I want to leave the series on for now, is that the boundary was always the asset. Models will keep getting better on someone else's schedule. The identity, the scope, the enforcement, the audit chain: those are yours, they compound, and they are what an authorizing official actually accredits.

> Accredit the boundary, not the model. The boundary is yours. The release calendar is not.
