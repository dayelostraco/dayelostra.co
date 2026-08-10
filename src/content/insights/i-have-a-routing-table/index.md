---
title: "We Don't Have a Favorite Model. We Have a Routing Table."
seoTitle: "Multi-model routing and evaluation: which LLM for which job in federal AI delivery"
date: 2026-08-04
summary: "The question I get is which model is best. It is the wrong question. In our governed federal factory the first filter is the boundary, the second is failure mode, and the eval that matters is disagreement. The model is a commodity. The routing is the craft."
tags: [ai, agents, llm, multi-model, evals, federal]
readTime: "7 min read"
draft: false
ogAccent: "We Have a Routing Table."
bodyWatermark: "/ROUTING"
---

The question I get most, once someone learns our teams deliver on a multi-model bench, is which model is best. Claude or Codex, Llama or Kimi, who wins. I never have a favorite to name, because I have never found the question useful. We do not run a favorite. We run a routing table: which model does which job, decided by measurement and constraint, not by benchmark leaderboards that are stale the week they publish. I built that discipline into how we deliver, and here is how the table actually gets built.

## The first filter is the boundary, not the benchmark

Before performance enters the conversation, sovereignty settles most of it. CUI-bearing inputs never route to a commercial API endpoint. That is not a preference, it is a control, enforced by static analysis and network egress rules, not by a policy paragraph nobody reads. So the first question a piece of work answers is not "which model is smartest," it is "what is the classification of the data it touches."

That single constraint decides more routing than any capability score. Sensitive work runs inside the accredited boundary, on in-boundary models: Amazon Bedrock in AWS GovCloud, Azure AI Foundry, or a local open-weight model on hardware we control. Only work with no sensitivity to protect is free to reach for whatever frontier endpoint is genuinely best that month. Half the "which model" debate evaporates once a team accepts that the best model it is not allowed to use is not on the table.

## Assign by failure mode, not by leaderboard

For the work that clears the boundary filter, we do not assign the "best" model. We assign by the shape of the mistake we most want to avoid on that task.

Models do not fail uniformly. They fail in characteristic ways, and after enough delivery a team learns each one's tells. So the bench splits the work by those tells. One model drives development, where we want fluent, idiomatic construction and fast iteration. A different one runs adversarial and UX review, where we want an instinct for the edge case and the unhappy path, a reviewer whose disposition is to break the thing rather than admire it. Open-weight models like Llama 4 Maverick and Kimi K2 earn their seat where sovereignty, cost, or the ability to run local matters more than the last few points of frontier capability.

The point is not that one model is better. It is that a model's weakness on a build task can be an asset on a review task. You do not want the same temperament writing the code and trying to break it. Putting one model in both chairs is how you get confident, wrong, and unchallenged.

## The eval that matters is disagreement

People expect the evaluation story to be a benchmark harness with a scoreboard. Ours is simpler and, I think, more honest: the eval that matters is disagreement.

Every meaningful change passes through more than one model with more than one job, and the signal we care about is where they diverge. When the model that built something and the model whose job is to attack it reach the same conclusion, that is weak evidence, because agreement is cheap. When they disagree, that is where a human looks, because a disagreement is a claim that something is wrong, surfaced by an actor with no ego in the original work. The bench does not trust a single model's confidence. It triangulates, and it routes the conflicts to a person.

This is why we distrust single-model pipelines even when the single model is excellent. A lone model has no one to disagree with. Its confidence and its correctness are reported on the same channel, and you cannot tell them apart. Two models with different jobs give you a second channel.

## The factory is the eval harness

The advantage of running this inside a [governed factory](/insights/compliance-is-a-byproduct/) is that we do not have to build a separate evaluation rig. The delivery gates are the rig. Every change clears a five-lens review and, when it matters, a human change control board before it ships. That means every model's output is measured continuously against the only benchmark that counts in this domain: did it produce something that survives adversarial review, passes the security gates, and clears accreditation. A model that looks brilliant in a demo and cannot clear the gate has told us everything we need to know about where it belongs on the table.

It also makes a model swap cheap, which is the [whole point of binding the model behind a stable identity](/insights/swap-the-model-keep-the-ato/). When a better model ships, we do not re-architect. We route the relevant jobs to it and regression-test against the same gates the incumbent already passes. The routing table is versioned like anything else, and changing it is a change request, not a leap of faith.

## Who owns it

It would be easy to read all of this as agents doing the work, and in the literal sense they do. They write the code, they run the reviews, they generate the artifacts. But the routing table is not any one engineer's preference. It is our organization's discipline, and as the officer accountable for it, I own it. I set the rule that keeps CUI inside the boundary. I own the gates every change clears. When two models disagree and the call escalates to a human, the accountability for what ships is mine. Agents execute, teams operate, and I answer for what leaves the door.

That is what it means to run a bench at organizational scale, and it is why "which model is best" was never the right question. The models change monthly. The routing discipline, the boundary rule, and the habit of trusting disagreement over confidence are the parts that hold, because we built them to outlast any single model. The model is a commodity. The routing is the craft.
